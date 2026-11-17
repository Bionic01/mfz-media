"""Short 013 arithmetic (re-run 17 Nov 2026): R1.2m bond over 20 years, prime 10.75% -> 11.00% (+0.25%)."""
def pmt(P, a, n=240):
    r = a / 12
    return P * r / (1 - (1 + r) ** -n)
a, b = pmt(1.2e6, .1075), pmt(1.2e6, .11)
print(f"R1.2m: {a:.2f} -> {b:.2f}, +{b-a:.2f} a month, +{(b-a)*12:.2f} a year; a cut to 10.50%: -{a-pmt(1.2e6,.105):.2f}")
r100 = pmt(1e5, .11) - pmt(1e5, .1075)
print(f"per R100,000: +{r100:.2f} a month (rule of thumb R17)")
print(f"R800,000 exact: +{pmt(8e5,.11)-pmt(8e5,.1075):.2f}; rule 8 x R17 = {8*17}")
