# main05 facts: Black Friday and store cards (verified 12 Nov 2026)

Primary sources first. Every figure in the script comes from this file.

## Dates and rates
- **Black Friday 2026 is Friday 27 November.** Briefly, 5 Nov 2026, quoting René Moonsamy, National Debt Counsellors: https://briefly.co.za/people/258057-national-debt-counsellors-warns-shoppers-black-friday-discounts/
- **Repo rate 7.25%**, raised by 25 basis points, effective 25 September 2026; next MPC announcement 19 November 2026. SARB MPC statement, September 2026: https://www.resbank.co.za/en/home/publications/publication-detail-pages/statements/monetary-policy-statements/2026/september
- **Prime 10.75%** after the hike. BusinessTech, 23 Sep 2026: https://businesstech.co.za/news/finance/876840/reserve-bank-hikes-interest-rates-in-south-africa/

## The legal limits on a store card (a "credit facility" under the National Credit Act)
- **Maximum interest on credit facilities = repo rate + 14% a year** (NCA Regulations, reg 42, Table A; "RR" = the ruling SARB repo rate): https://www.acts.co.za/national-credit-act-2005/r489_42__maximum_prescribed_interest_and_initiation_fees.php
  - Today: 7.25% + 14% = **21.25% a year** (our arithmetic). The cap moves with the repo rate.
  - Store cards and credit cards fall in this category (Cliffe Dekker Hofmeyr, 9 Mar 2016, on the 2016 fee and interest limits: "credit cards and store cards"): https://www.cliffedekkerhofmeyr.com/en/news/publications/2016/finance/finance-and-banking-alert-9-march-new-limits-for-consumer-credit-charges-.html
- **Maximum monthly service fee: R60 + VAT = R69** (CDH 2016: increased from R50 to R60, effective 6 May 2016; Capitec's credit rates page, effective 29 May 2026, charges R69 a month, the VAT-inclusive figure): https://www.capitecbank.co.za/personal/credit/rates-and-fees/
- **Maximum initiation fee (credit and store cards): R1,050 + VAT = R1,207.50** (CDH 2016: R1,050; Capitec 2026 page shows R1,207.50 once-off). Only on a new account. Script says "up to R1,207.50".
- **Credit life insurance cap for credit facilities: R4.50 per R1,000 a month**, on the average balance used in the billing cycle. Credit Life Insurance Regulations, Government Gazette 40606, 9 Feb 2017, reg 3(1): https://www.gov.za/sites/default/files/gcis_document/201702/40606gon103.pdf (PDF table partly garbled; Capitec's 2026 page shows "R2.58 to R4.50 per R1,000", consistent).
  - Must cover at least death, disability, and unemployment/inability to earn an income (reg 3(2)).
- **You may use your own policy instead:** NCA s106(4)(a): the consumer has "the right to waive that proposed policy and substitute a policy of the consumer's own choice"; the credit provider must accept it if it meets regs 3 and 4. NCR Guideline 003/2024 (June 2024), sections 3.3, 4.1, 4.2: https://www.ncr.org.za/documents/GUIDELINE%20ON%20THE%20APPLICATION%20OF%20THE%20CREDIT%20LIFE%20INSURANCE%20REGULATIONS.pdf

## Worked example (illustration, our own numbers; arithmetic in example_calc.txt, re-run in python)
Thandi, a TV: normal price R6,250, Black Friday price R5,000 (20% off, she "saves" R1,250).
On a store card at the **legal maximums**: 21.25% a year, R69 monthly fee, credit life R4.50 per R1,000 on the balance, equal monthly payments. (Initiation fee left out: she already has the card.)
| Term | Instalment | Interest | Service fees | Credit life | Total paid | All-in per month |
|---|---|---|---|---|---|---|
| 12 months | R466.17 | R594.03 | R828 | R150.95 | **R6,572.98** | R547.75 |
| 24 months | R257.54 | R1,181.02 | R1,656 | R300.12 | R8,137.14 | R339.05 |
| 36 months | R189.02 | R1,804.64 | R2,484 | R458.59 | **R9,747.23** | R270.76 |
- 12 months: about R1,570 more than R5,000; more than the R1,250 discount, and more than the R6,250 full price.
- 36 months: almost R9,750, nearly double the price.
- Script says: "about R548 a month", "about R6,570", "about R271 a month", "almost R9,750".
- The alternative: saving R548 a month for 10 months = R5,480 (no interest assumed).
- Caveats said in the script: her card may charge less; if she already pays the service fee anyway, part of it isn't new. Real store cards set their own rates up to the cap: check your statement.

## Not used (couldn't verify today / out of scope)
- "Most stores offer six months interest-free" (JustMoney 2021, out of date).
- Peach Payments BNPL +753% (2025), off topic.
