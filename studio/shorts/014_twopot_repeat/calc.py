"""Short 014 arithmetic (18 Nov 2026): R10,000 from the two-pot savings pot in three tax years running.
Illustration: 5% a year above inflation (real, today's money), as in main02; first withdrawal 20 years before retirement."""
r = 0.05
yrs = [20, 19, 18]
vals = [10000 * (1 + r) ** n for n in yrs]
for n, v in zip(yrs, vals): print(f"R10,000 left {n} years: R{v:,.2f}")
print(f"total out R30,000 -> worth at retirement R{sum(vals):,.2f} (today's money); growth given up R{sum(vals)-30000:,.2f}")
