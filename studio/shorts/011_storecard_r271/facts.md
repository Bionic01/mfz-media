# Short 011 facts (verified 15 Nov 2026)

Cut from main05 (Black Friday and store cards, live Mon 16 Nov 16:00); full sourcing in `videos/main05_store_cards/facts.md` (verified 12 Nov).

Re-checked today (15 Nov 2026):
- **Repo rate 7.25%**, +25 bp effective 25 September 2026; the next MPC decision is 19 November 2026; this Short goes out 16 Nov, before that decision. SAnews, 23 Sep 2026: https://www.sanews.gov.za/south-africa/mpc-raises-repo-rate-725 ; SARB September 2026 statement.
- **Store-card / credit-card cap = repo + 14% = 21.25% a year.** MoneyToday credit-card comparison, updated 12 Oct 2026 ("The National Credit Act caps interest on credit facilities such as credit cards at repo + 14% per year ... 7.25% + 14% = 21.25%", citing Regulation 42, Table A): https://moneytoday.co.za/compare/credit-cards . Matches NCA Regulations reg 42 Table A as read for main05 on 12 Nov (acts.co.za, not fetchable today).
- **Monthly service fee cap R60 + VAT = R69.** MoneyToday loan calculator, updated 12 Oct 2026 ("monthly service fee R60 (R69 incl VAT)"): https://moneytoday.co.za/calculators/loan-repayment ; R60 from Cliffe Dekker Hofmeyr / Polity, March 2016: https://polity.org.za/article/new-limits-for-consumer-credit-charges-2016-03-10 . Capitec's 2026 credit page (read 12 Nov) charges R69; not fetchable today.
- **Credit life cap R4.50 per R1,000 a month.** Same MoneyToday page ("R4.50 per R1,000 of outstanding balance per month"); Gazette 40606 (2017) as read for main05.

Not used: the RCS page (29 July 2024) quotes "29.25%" as the NCA maximum; that matched the unsecured-credit cap at the 2024 repo rate, not credit facilities, and is out of date. The 2015 JustMoney table (repo x 2.2 + 10%) is the pre-2016 formula.

## Example (illustration, re-run in python 15 Nov 2026)
Thandi: R5,000 TV (Black Friday price; normal price R6,250, so she "saved" R1,250), on a store card at the legal maximums, 36 equal monthly instalments, 21.25% a year, R69 a month service fee, credit life R4.50 per R1,000 on the opening balance each month, no initiation fee (existing card).
- Instalment R189.02; interest R1,804.64 ("about R1,800"); service fees 36 x R69 = R2,484; credit life R458.59 ("about R460").
- Total R9,747.23 ("almost R9,750"); R270.76 a month all in ("R271"); extra over R5,000 = R4,747.23 ("about R4,750").
- 12 months: total R6,572.98 ("about R6,570").
- Script says the card may charge less than the maximum: check your statement.
