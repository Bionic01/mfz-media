"""Build the free B-roll library from Mixkit (Mixkit Stock Video Free License: YouTube and commercial use, no credit needed).
Downloads 720p copies for browsing; manifest.json keeps the 1080p URL to fetch when a clip is used."""
import re, json, os, time, subprocess, html
CATS = {
 'money': ['counting-money', 'cash', 'money'], 'payments': ['credit-card', 'mobile-payment', 'atm'],
 'phone': ['typing-on-phone', 'smartphone', 'phone-call'], 'city': ['city-traffic', 'aerial-city', 'city-night'],
 'africa': ['africa', 'african'], 'travel': ['bus', 'luggage', 'highway'], 'shopping': ['supermarket', 'shopping-cart', 'shopping-mall'],
 'festive': ['christmas', 'gift', 'family-dinner'], 'energy': ['power-lines', 'electricity', 'power-plant', 'candle'],
 'fuel': ['gas-station', 'fuel', 'oil-refinery'], 'finance': ['calculator', 'documents', 'stock-market', 'piggy-bank', 'coins'],
 'home': ['house-keys', 'house'], 'people': ['meeting', 'family'],
}
PER_SLUG = 4
os.chdir('/home/claude/stock'); man = json.load(open('manifest.json')) if os.path.exists('manifest.json') else {}
def get(url):
    return subprocess.run(['curl', '-sL', '-m', '40', url], capture_output=True, text=True, errors='ignore').stdout
for cat, slugs in CATS.items():
    os.makedirs(cat, exist_ok=True)
    for slug in slugs:
        t = get(f'https://mixkit.co/free-stock-video/{slug}/'); time.sleep(1)
        cards = re.findall(r'data-algolia-analytics-object-id="video-(\d+)".*?alt="([^"]*)"', t, re.S)
        links = dict((i, h) for h, i in re.findall(r'href="(/free-stock-video/[a-z0-9-]+-(\d+)/)"', t))
        n = 0
        for vid, alt in cards:
            if n >= PER_SLUG: break
            key = 'mixkit_' + vid
            if key in man: n += 1; continue
            page = get('https://mixkit.co' + links.get(vid, f'/free-stock-video/x-{vid}/')); time.sleep(1)
            if 'data-license="videoFree"' not in page or 'Restricted License' in page.split('data-license')[0][-3000:]:
                continue
            out = f'{cat}/{key}.mp4'
            r = subprocess.run(['curl', '-s', '-m', '120', '-o', out, '-w', '%{http_code}', f'https://assets.mixkit.co/videos/{vid}/{vid}-720.mp4'], capture_output=True, text=True)
            if r.stdout != '200': os.path.exists(out) and os.remove(out); continue
            man[key] = {'file': out, 'category': cat, 'search': slug, 'desc': html.unescape(alt), 'source': 'Mixkit', 'page': 'https://mixkit.co' + links.get(vid, ''),
                        'url_1080': f'https://assets.mixkit.co/videos/{vid}/{vid}-1080.mp4', 'license': 'Mixkit Stock Video Free License (no attribution required)'}
            json.dump(man, open('manifest.json', 'w'), indent=1); n += 1; time.sleep(1)
        print(cat, slug, 'ok', n, flush=True)
print('total', len(man))
