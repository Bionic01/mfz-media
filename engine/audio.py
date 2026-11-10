#!/usr/bin/env python3
"""CINE audio: synthesized music bed + sound effects, ducked under the voice, mastered to -14 LUFS.
Everything is made in code (numpy/scipy). The only recorded audio is the ElevenLabs voice.

usage: python3 audio.py <cues.json> <out.wav> [--voice voice.mp3] [--lead 0.6] [--style doc|amapiano|tension]
                        [--seed 7] [--bpm N] [--drop S] [--music 1.0] [--sfx 1.0]
cues.json comes from `render.py cues` ({duration, cues:[{t,type,gain,pan}], meta:{music:{drop, end, breaks, style}}}).
"""
import argparse, json, subprocess, wave, os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000


def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def K(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def env(k, a=.005, r=None, L=None):
    e = np.minimum(1, k / max(a, 1e-4))
    if r: e *= np.minimum(1, np.maximum(0, (L - k)) / r)
    return e


class Bus:
    def __init__(self, n): self.x = np.zeros((n, 2))
    def add(self, sig, t0, g=1.0, pan=0.0):
        if sig.ndim == 1: sig = np.stack([sig * np.sqrt((1 - pan) / 2) * 1.414, sig * np.sqrt((1 + pan) / 2) * 1.414], 1)
        i = int(round(t0 * SR)); n = len(self.x)
        if i >= n or i + len(sig) <= 0: return
        if i < 0: sig = sig[-i:]; i = 0
        m = min(len(sig), n - i); self.x[i:i + m] += sig[:m] * g


def reverb(x, secs=1.8, mix=.25, seed=3, damp=3500):
    r = np.random.default_rng(seed); k = K(secs)
    ir = np.stack([r.normal(0, 1, len(k)), r.normal(0, 1, len(k))], 1) * np.exp(-k * 6.9 / secs)[:, None]
    ir[:, 0] = lp(ir[:, 0], damp); ir[:, 1] = lp(ir[:, 1], damp); ir[:int(.012 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([fftconvolve(x[:, i], ir[:, i])[:len(x)] for i in range(2)], 1)
    return x * (1 - mix) + wet * mix * 2.2


# ------------------------------------------------------------------ SFX
class FX:
    def __init__(self, seed=5): self.r = np.random.default_rng(seed)
    def noise(self, d): return self.r.normal(0, 1, int(d * SR))
    def whoosh(self, d=.7, lo=300, hi=3800, peak=.55):
        k = K(d); n = self.noise(d); x = np.zeros(len(k)); seg = 24
        fc = lo + (hi - lo) * np.sin(np.pi * np.clip(k / d * 1.1, 0, 1)) ** 2
        for j in range(seg):
            a, b = j * len(k) // seg, (j + 1) * len(k) // seg; f = fc[(a + b) // 2]; x[a:b] = bp(n[a:b], f * .6, min(f * 1.6, SR / 2 - 100))
        e = np.exp(-((k - d * peak) / (d * .28)) ** 2); x = x * e
        return x / (np.abs(x).max() + 1e-9) * .5
    def bell(self, notes, L=1.2):
        k = K(L); x = np.zeros(len(k))
        for f, dec, a, t0 in notes:
            i = int(t0 * SR); kk = k[:len(k) - i]
            x[i:] += (np.sin(2 * np.pi * f * kk) + .35 * np.sin(2 * np.pi * f * 2.76 * kk) * np.exp(-kk * 8) + .12 * np.sin(2 * np.pi * f * 5.4 * kk) * np.exp(-kk * 16)) * np.exp(-kk / dec) * a * env(kk, .002)
        return x
    def make(self, kind):
        r = self.r
        if kind == 'whoosh': return self.whoosh(.7), -.42
        if kind == 'swish': return self.whoosh(.35, 900, 6500, .5) * .8, -.16
        if kind == 'whoosh_low': return self.whoosh(1.1, 120, 1400, .6) * 1.1, -.6
        if kind == 'swoosh_up': return self.whoosh(.8, 300, 7000, .8), -.6
        if kind == 'pop':
            k = K(.14); f = 380 + 900 * (1 - np.exp(-k * 45)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k * 30) * .4 * env(k, .002), 0
        if kind == 'bloop':
            k = K(.22); f = 900 * np.exp(-k * 9) + 260; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k * 18) * .35, 0
        if kind == 'tick':
            k = K(.04); return np.sin(2 * np.pi * 2600 * k) * np.exp(-k * 150) * .25 + hp(self.noise(.04), 4000) * np.exp(-k * 200) * .1, 0
        if kind == 'tock':
            k = K(.06); return np.sin(2 * np.pi * 1300 * k) * np.exp(-k * 110) * .3, 0
        if kind == 'click':
            k = K(.03); return hp(self.noise(.03), 2500) * np.exp(-k * 260) * .35, 0
        if kind.startswith('dtmf'):
            ch = kind[4:] or '5'; rows = {'1': 697, '2': 697, '3': 697, '4': 770, '5': 770, '6': 770, '7': 852, '8': 852, '9': 852, '*': 941, '0': 941, '#': 941}
            cols = {'1': 1209, '2': 1336, '3': 1477, '4': 1209, '5': 1336, '6': 1477, '7': 1209, '8': 1336, '9': 1477, '*': 1209, '0': 1336, '#': 1477}
            k = K(.16); x = (np.sin(2 * np.pi * rows.get(ch, 770) * k) + np.sin(2 * np.pi * cols.get(ch, 1336) * k)) * env(k, .004, .03, .16) * .14
            k2 = K(.03); x[:len(k2)] += hp(self.noise(.03), 2000) * np.exp(-k2 * 220) * .25; return x, 0
        if kind == 'tap':
            k = K(.09); return hp(self.noise(.09), 1500) * np.exp(-k * 160) * .3 + np.sin(2 * np.pi * 180 * k) * np.exp(-k * 45) * .4, 0
        if kind == 'thud':
            k = K(.4); return np.tanh(2.5 * np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-k * 35)) / SR) * np.exp(-k * 11)) * .55, 0
        if kind == 'impact':
            k = K(1.8); boom = np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-k * 16)) / SR) * np.exp(-k * 2.8)
            return np.tanh(2.2 * boom) * .65 + hp(self.noise(1.8), 2500) * np.exp(-k * 5) * .16 + bp(self.noise(1.8), 200, 900) * np.exp(-k * 9) * .2, 0
        if kind == 'boom':
            k = K(2.5); return np.tanh(1.8 * np.sin(2 * np.pi * np.cumsum(32 + 40 * np.exp(-k * 8)) / SR) * np.exp(-k * 1.6)) * .7, 0
        if kind == 'stamp':
            k = K(.5); return np.tanh(3 * np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-k * 30)) / SR) * np.exp(-k * 9)) * .5 + bp(self.noise(.5), 300, 3000) * np.exp(-k * 25) * .3, 0
        if kind == 'riser':
            L = 1.4; k = K(L); n = self.noise(L); x = np.zeros(len(k)); seg = 20
            for j, f in enumerate(np.geomspace(500, 9000, seg)):
                a, b = j * len(k) // seg, (j + 1) * len(k) // seg; x[a:b] = bp(n[a:b], f, min(f * 1.5, SR / 2 - 100))
            tone = np.sin(2 * np.pi * np.cumsum(180 + 700 * (k / L) ** 2) / SR)
            return (x * .35 + tone * .1) * (k / L) ** 2.2, -L
        if kind == 'swell':  # reverse-cymbal swell ending at t
            L = 1.6; k = K(L); x = hp(self.noise(L), 3000) * (k / L) ** 3 * .45; return x, -L
        if kind == 'cash':
            x = self.bell([(2637, .45, .22, .09), (3136, .55, .2, .09), (3951, .45, .12, .09)], 1.3)
            n = int(.11 * SR); x[:n] += bp(self.noise(.11), 1500, 7000) * np.exp(-K(.11) * 40) * .3; return x, 0
        if kind == 'coin': return self.bell([(1975.5 * (1 + r.random() * .05), .3, .3, 0), (2637, .45, .26, .06)], 1.0), 0
        if kind == 'coins':
            x = np.zeros(int(1.2 * SR))
            for j in range(9):
                c = self.bell([(1800 + r.random() * 2200, .12 + r.random() * .15, .2, 0)], .5); i = int((j * .06 + r.random() * .05) * SR); x[i:i + len(c)] += c[:len(x) - i]
            return x * .8, 0
        if kind == 'paper':
            L = .45; k = K(L); n = bp(self.noise(L), 1200, 7000); g = (r.random(len(k)) < .004).astype(float); g = np.convolve(g, np.exp(-K(.01) * 400), 'same')
            return n * (.25 * g + .08) * env(k, .02, .1, L) * .9, 0
        if kind == 'flutter':
            L = 1.2; k = K(L); n = bp(self.noise(L), 900, 5000); m = (np.sin(2 * np.pi * 17 * k) > .2).astype(float)
            return n * m * env(k, .1, .4, L) * .22, 0
        if kind == 'wind':
            L = 4.0; k = K(L); n = self.noise(L); x = np.zeros(len(k)); seg = 40
            for j in range(seg):
                a, b = j * len(k) // seg, (j + 1) * len(k) // seg; f = 400 + 500 * np.sin(j * .7) ** 2; x[a:b] = bp(n[a:b], f, f * 2.2)
            return x * env(k, .8, 1.2, L) * .4, 0
        if kind in ('notif', 'chime'): return self.bell([(1046.5, .25, .25, 0), (1568, .45, .25, .12)] if kind == 'notif' else [(1318.5, .5, .2, 0), (1975.5, .7, .2, .1), (2637, .8, .12, .2)], 1.4), 0
        if kind == 'ding': return self.bell([(1760, .6, .3, 0)], 1.4), 0
        if kind == 'shopbell': return self.bell([(2093, .3, .2, 0), (2349, .3, .18, .09), (2093, .3, .14, .18)], 1.0), 0
        if kind == 'sparkle': return self.bell([(2600 + r.random() * 2600, .2, .07, j * .055) for j in range(10)], 1.3), 0
        if kind == 'print':
            L = 1.1; k = K(L); gate = (np.sin(2 * np.pi * 36 * k) > -.2).astype(float)
            buzz = bp(self.noise(L), 1800, 6000) * .5 + np.sign(np.sin(2 * np.pi * 520 * k)) * .1; return buzz * gate * env(k, .03, .08, L) * .3, 0
        if kind == 'buzz':
            k = K(.7); g = (np.sin(2 * np.pi * 7 * k) > 0).astype(float); return lp(np.sign(np.sin(2 * np.pi * 160 * k)), 900) * g * env(k, .01, .05, .7) * .25, 0
        if kind == 'flap':
            k = K(.05); return bp(self.noise(.05), 1500, 5000) * np.exp(-k * 120) * .35, 0
        if kind == 'flaps':
            x = np.zeros(int(.9 * SR))
            for j in range(14):
                c, _ = self.make('flap'); i = int(j * .055 * SR); x[i:i + len(c)] += c[:len(x) - i] * (.6 + .4 * r.random())
            return x, 0
        if kind == 'step':
            k = K(.18); return lp(self.noise(.18), 600) * np.exp(-k * 35) * .35 + np.sin(2 * np.pi * 90 * k) * np.exp(-k * 40) * .2, 0
        if kind == 'lights':  # power-on clunk + hum swell
            k = K(1.4); x = np.tanh(3 * np.sin(2 * np.pi * 70 * k) * np.exp(-k * 20)) * .4
            x += np.sin(2 * np.pi * 100 * k) * .06 * env(k, .3, .5, 1.4) + np.sin(2 * np.pi * 200 * k) * .03 * env(k, .3, .5, 1.4); return x, 0
        if kind == 'type':
            x = np.zeros(int(.8 * SR))
            for j in range(8):
                c, _ = self.make('click'); i = int((j * .09 + r.random() * .03) * SR); x[i:i + len(c)] += c
            return x, 0
        if kind == 'shutter':
            k = K(.2); return hp(self.noise(.2), 2000) * (np.exp(-k * 80) + .6 * np.exp(-np.maximum(0, k - .08) * 90) * (k > .08)) * .3, 0
        if kind == 'heartbeat':
            x = np.zeros(int(.8 * SR))
            for t0, a in ((0, 1), (.22, .7)):
                k = K(.25); c = np.sin(2 * np.pi * np.cumsum(45 + 30 * np.exp(-k * 30)) / SR) * np.exp(-k * 18) * .6 * a; i = int(t0 * SR); x[i:i + len(c)] += c
            return x, 0
        return np.zeros(10), 0


# ------------------------------------------------------------------ MUSIC
def piano(freqs, d, vel=1.0, bright=1.0, rng=None):
    k = K(d); x = np.zeros(len(k))
    for j, f in enumerate(freqs):
        dt = j * .012
        kk = np.maximum(0, k - dt)
        tone = sum(a * np.sin(2 * np.pi * f * h * kk * (1 + .0004 * h * h)) * np.exp(-kk * (1.6 + h * .9 * bright)) for h, a in ((1, 1), (2, .45 * bright), (3, .22 * bright), (4, .1 * bright), (5, .05 * bright)))
        x += tone * env(kk, .003) * (k >= dt)
    x += lp(np.random.default_rng(1).normal(0, 1, len(k)), 1800) * np.exp(-k * 60) * .04  # hammer
    return x / max(1, len(freqs)) * .5 * vel * env(k, .002, .25, d)


def pad(freqs, d, rng, cutoff=1600, amp=.07):
    k = K(d); L = np.zeros(len(k)); R = np.zeros(len(k))
    for f in freqs:
        for det, ch in ((-.9, 0), (.9, 1), (0, 2)):
            ph = rng.uniform(0, 6.28); w = np.sin(2 * np.pi * (f + det) * k + ph) + .3 * np.sin(2 * np.pi * 2 * (f + det) * k + ph) + .12 * np.sin(2 * np.pi * 3 * (f + det) * k)
            if ch == 0: L += w
            elif ch == 1: R += w
            else: L += w * .5; R += w * .5
    e = np.minimum(1, k / .9) * np.minimum(1, (d - k) / .9)
    return np.stack([lp(L, cutoff), lp(R, cutoff)], 1) * e[:, None] / len(freqs) * amp


def kick(amp=.9, dec=7):
    k = K(.45); f = 46 + 100 * np.exp(-k * 36); return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k * dec)) * amp


def music(style, dur, seed, bpm, drop, end, breaks):
    rng = np.random.default_rng(seed); n = int(dur * SR); bus = Bus(n); keys = Bus(n); fx = FX(seed + 1)
    if style == 'amapiano':
        bpm = bpm or 112; CH = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [50, 53, 57, 60, 64], [52, 55, 59, 62]]
        BASS = [[45, 0, 0, 45, 0, 0, 48, 0, 0, 0, 45, 47, 0, 0, 43, 0], [41, 0, 0, 41, 0, 0, 45, 0, 0, 0, 41, 43, 0, 0, 48, 0],
                [38, 0, 0, 38, 0, 0, 41, 0, 0, 0, 45, 43, 0, 0, 41, 0], [40, 0, 0, 40, 0, 0, 43, 0, 0, 0, 47, 45, 0, 0, 40, 43]]
    elif style == 'tension':
        bpm = bpm or 92; CH = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 63], [45, 52, 57, 61]]
        BASS = [[38] + [0] * 15, [34] + [0] * 15, [36] + [0] * 15, [33] + [0] * 7 + [33] + [0] * 7]
    else:  # doc: warm documentary piano
        bpm = bpm or 86; CH = [[50, 57, 60, 64, 69], [46, 53, 57, 62, 65], [41, 48, 53, 57, 60], [48, 55, 59, 62, 67]]
        BASS = [[38] + [0] * 9 + [38] + [0] * 5, [34] + [0] * 9 + [34] + [0] * 5, [41] + [0] * 9 + [41] + [0] * 5, [36] + [0] * 7 + [43, 0, 36] + [0] * 5]
    beat = 60 / bpm; s16 = beat / 4; bar = beat * 4; T0 = drop - 2 * bar if drop > 2 * bar else 0
    nb = int((end - T0) / bar) + 2
    for b in range(-2, nb):
        bt = T0 + b * bar
        if bt > end + bar: break
        ci = b % 4; pre = bt < drop - 1e-3; post = bt >= end
        if post: continue
        bus.add(pad([mtof(m) for m in CH[ci][:4]], bar + .9, rng, 1300 if pre else 2000, .085), bt - .2)
        for s in range(16):
            st = bt + s * s16
            if st < 0 or st > end: continue
            if any(a <= st < z for a, z in breaks): continue
            swing = s16 * .14 if s % 2 else 0
            if style == 'amapiano':
                hat = hp(fx.noise(.07), 6500) * np.exp(-K(.07) * (55 if s % 4 == 2 else 85)) * (.2 if s % 4 == 2 else .1); bus.add(hat, st + swing, .6 if pre else .8, .25)
                if not pre:
                    if s % 4 == 0: bus.add(kick(), st, .9)
                    if s in (4, 12):
                        kk = K(.25); cl = bp(fx.noise(.25), 900, 3200) * (np.exp(-kk * 22) + .6 * np.exp(-np.maximum(0, kk - .012) * 30) * (kk > .012)) * .35; bus.add(cl, st, .9, -.15)
                    nn = BASS[ci][s]
                    if nn:
                        kk = K(.42); f = mtof(nn) * (1 + 1.4 * np.exp(-kk * 55)); ph = 2 * np.pi * np.cumsum(f) / SR
                        ld = np.tanh(2.6 * (np.sin(ph) + .35 * np.sin(2 * ph)) * env(kk, .004) * np.exp(-kk * 5.2)) * .5; bus.add(ld, st, .9)
                if s in (2, 6, 7, 10, 14): keys.add(piano([mtof(m + 12) for m in CH[ci][1:]], .45, .5 if pre else .75, .7), st, 1, .2 if s % 2 else -.2)
            else:
                if s == 0: keys.add(piano([mtof(m) for m in CH[ci]], bar * .95, .9 if not pre else .75, .8), st)
                if style == 'doc' and s in (6, 10, 14) and rng.random() < .8:
                    top = CH[ci][-1] + [0, 2, 3, 5, 7][rng.integers(0, 5)] + 12; keys.add(piano([mtof(top)], beat * 2, .45, 1.1), st + swing, 1, .3)
                if not pre:
                    if s in (0, 10) if style == 'doc' else s % 8 == 0: bus.add(kick(.75, 9), st, .8)
                    if s in (4, 12):
                        kk = K(.3); sn = bp(fx.noise(.3), 1200, 5000) * np.exp(-kk * 18) * .16 + np.sin(2 * np.pi * 190 * kk) * np.exp(-kk * 30) * .1; bus.add(sn, st, .8, .1)
                    if s % 2 == 0: bus.add(hp(fx.noise(.05), 7000) * np.exp(-K(.05) * 90) * .1, st + swing, .7, -.3)
                    nn = BASS[ci][s]
                    if nn:
                        kk = K(bar * .6); bs = np.tanh(1.4 * np.sin(2 * np.pi * mtof(nn) * kk)) * env(kk, .01, .2, bar * .6) * .32; bus.add(lp(bs, 400), st, 1)
                elif style == 'tension' and s == 0:
                    kk = K(bar); bus.add(np.sin(2 * np.pi * mtof(BASS[ci][0]) * kk) * env(kk, .3, .5, bar) * .2, st)
    out = bus.x + reverb(keys.x, 2.2, .32, seed)
    t = np.arange(n) / SR
    fade = np.clip((end + 2.5 - t) / 2.5, 0, 1); out *= fade[:, None]
    if drop > 0: out[t < drop] *= .85
    return out / (np.abs(out).max() + 1e-9)


def load(p):
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).astype(np.float64).reshape(-1, 2)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('cues'); ap.add_argument('out'); ap.add_argument('--voice'); ap.add_argument('--lead', type=float, default=0)
    ap.add_argument('--style', default=None); ap.add_argument('--seed', type=int, default=7); ap.add_argument('--bpm', type=float, default=0)
    ap.add_argument('--drop', type=float, default=None); ap.add_argument('--music', type=float, default=1.0); ap.add_argument('--sfx', type=float, default=1.0)
    a = ap.parse_args(); cj = json.load(open(a.cues)); dur = cj['duration']; n = int(dur * SR); meta = (cj.get('meta') or {}).get('music', {})
    style = a.style or meta.get('style', 'doc'); drop = a.drop if a.drop is not None else meta.get('drop', 4.0); end = meta.get('end', dur - 2.0)
    mus = music(style, dur, a.seed, a.bpm, drop, end, meta.get('breaks', []))
    fx = FX(a.seed + 11); sfx = Bus(n)
    for c in cj['cues']:
        x, off = fx.make(c['type']); sfx.add(x, c['t'] + off, c.get('gain', 1), c.get('pan', 0))
    sfx.x = reverb(sfx.x, 1.2, .18, 9)
    voice = np.zeros((n, 2))
    if a.voice:
        v = load(a.voice); i = int(a.lead * SR); m = min(len(v), n - i); voice[i:i + m] = v[:m]
        # normalise voice to about -16 LUFS-ish by RMS of speech
        rms = np.sqrt(np.mean(voice[np.abs(voice).max(1) > 1e-3] ** 2) + 1e-12); voice *= 0.1 / rms
    # duck music under the voice (envelope follower)
    ve = np.abs(voice).max(1); w = int(.03 * SR); ve = np.convolve(ve, np.ones(w) / w, 'same')
    ve = ve / (ve.max() + 1e-9); act = np.clip(ve * 6, 0, 1)
    # attack fast / release slow
    sm = np.zeros(n); g = 0; ra, rr = 1 - np.exp(-1 / (.04 * SR)), 1 - np.exp(-1 / (.45 * SR))
    for i in range(0, n, 64):
        tgt = act[i]; g += (tgt - g) * (ra if tgt > g else rr) * 64; g = min(max(g, 0), 1); sm[i:i + 64] = g
    duck = 1 - .55 * sm
    mix = voice + mus * duck[:, None] * .16 * a.music + sfx.x * .5 * a.sfx * (1 - .3 * sm)[:, None]
    tmp = a.out + '.raw.wav'
    a16 = (np.clip(mix / max(1, np.abs(mix).max() / .95), -1, 1) * 32767).astype(np.int16)
    with wave.open(tmp, 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes(a16.tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), a.out], check=True); os.remove(tmp)
    r = subprocess.run(['ffmpeg', '-i', a.out, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    print('mixed', a.out, [l.strip() for l in r.stderr.splitlines() if l.strip().startswith('I:')][-1:], 'dur', round(dur, 2))


if __name__ == '__main__':
    main()
