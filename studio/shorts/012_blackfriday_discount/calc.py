"""Short 012 arithmetic (re-run 16 Nov 2026): R6,250 TV, Black Friday R5,000, store card 12 months at the legal maximums."""
P, r, n, fee, cl = 5000, 0.2125/12, 12, 69, 4.50
inst = P*r/(1-(1+r)**-n)
bal, interest, life = P, 0, 0
for m in range(n):
    life += bal/1000*cl
    i = bal*r; interest += i; bal = bal + i - inst
total = inst*n + fee*n + life
print(f"instalment {inst:.2f} interest {interest:.2f} fees {fee*n} credit life {life:.2f} total {total:.2f} per month {total/n:.2f}")
print(f"extra over sale price {total-P:.2f}; over full price R6,250: {total-6250:.2f}; discount 1250")
print(f"save {round(total/n)} a month for 10 months: {round(total/n)*10}")
