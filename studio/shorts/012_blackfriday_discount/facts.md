# Short 012 facts (verified 16 Nov 2026)

Cut from main05 (Black Friday and store cards, live Mon 16 Nov 16:00); full sourcing in `videos/main05_store_cards/facts.md` (verified 12 Nov). Short 011 used the 36-month total; this one uses the 12-month case and the "discount" angle (backlog: "she saved R1,250 on a TV and paid R1,570 more").

Re-checked today (16 Nov 2026):
- **Repo (policy) rate 7.25%, prime 10.75%**, both dated 13 Nov 2026, unchanged: SARB current market rates, https://custom.resbank.co.za/SarbWebApi/WebIndicators/CurrentMarketRates . Next MPC decision 19 Nov 2026; this Short goes out 17 Nov, before it.
- **Store-card / credit-card cap = repo + 14% = 21.25% a year**: NCA Regulations reg 42, Table A, credit facilities "RR + 14%" (acts.co.za page read today, partly as a summary; same as read in full for main05 on 12 Nov and via MoneyToday on 15 Nov).
- **Monthly service fee R69 (R60 + VAT)**: Capitec credit rates page, "Effective as of 29 May 2026", monthly service fee R69 (read today); R60 cap from Cliffe Dekker Hofmeyr, 9 Mar 2016.
- **Credit life R4.50 per R1,000 a month (maximum)**: Capitec page today shows "2.58 - 4.50" per R1,000 per month; Gazette 40606 (2017), reg 3(1).

## Example (illustration; calc.py re-run 16 Nov 2026)
TV: full price R6,250, Black Friday price R5,000 (20% off, "saves" R1,250). Store card at the legal maximums, 12 equal monthly instalments, 21.25% a year, R69 a month, credit life R4.50 per R1,000 on the balance each month, no initiation fee (existing card).
- Instalment R466.17; interest R594.03 ("R594"); fees 12 x R69 = R828; credit life R150.95 ("R151").
- Extra = R1,572.98 ("about R1,570"); total R6,572.98 ("about R6,570").
- vs full price R6,250: R322.98 more ("about R320").
- Saving R500 a month for 10 months = R5,000 (no interest assumed).
- Caveat in description: real store cards may charge less than the maximum; check the statement.
