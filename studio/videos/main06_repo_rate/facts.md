# main06: The repo rate explained (how-to). Facts, verified 15 Nov 2026

Every figure on screen or in the voice comes from this file. Arithmetic: calc.py → example_calc.txt (re-run 15 Nov 2026).

## The rate (primary: SARB)
- 23 Sep 2026 MPC: "the committee decided to raise the policy rate by 25 basis points, to 7.25%, effective from 25 September. The decision was unanimous." Reason: "we have raised our near-term forecasts. This is mainly because of higher fuel prices." "Headline inflation will likely be above 5% later this year and early next year." Source: SARB MPC statement, 23 Sep 2026, https://www.resbank.co.za/content/dam/sarb/publications/statements/monetary-policy-statements/2026/september/september-statement.pdf
- Before: 7.00%, raised 25bp from 6.75% on 28 May 2026 (effective 29 May, 4-2 vote); held at 7.00% on 23 Jul 2026. SARB MPC statement 28 May 2026 (may-statement.pdf). So the rate rose 0.5 points in 2026 (6.75% → 7.25%).
- Next statement: "The next statement of the Monetary Policy Committee will be released on 19 November." (Sep statement). 2027 dates: 28 Jan, 18 Mar, 27 May, 22 Jul, 29 Sep, 25 Nov (same PDF). So the MPC announces 6 times a year.
- Name: "the SARB's Monetary Policy Committee decides on a level for the SARB Policy Rate (SPR), a short-term interest rate which affects many other rates in the economy." "This instrument was previously known as the 'repo rate'..." SARB, What we do: monetary policy, https://www.resbank.co.za/en/home/what-we-do/monetary-policy (read 15 Nov 2026). We say "repo rate (the Reserve Bank now calls it the policy rate)".
- What it is, in plain words (our wording): the interest rate the Reserve Bank charges when it lends to commercial banks (standard description; the SARB page calls it a short-term rate that affects many other rates).
- Lag: "Policy changes are transmitted over roughly 12 to 24 months" (same SARB page).
- Target: "South Africa's inflation target is 3%, with a tolerance band of plus or minus 1 percentage point… determined by the Minister of Finance in agreement with the Governor of the SARB." (same SARB page). Announced in the MTBPS on 12 Nov 2025, replacing 3–6% (SAnews 12 Nov 2025, https://www.sanews.gov.za/node/78202).
- CPI: 4.5% in September 2026 (4.4% in August), released 21 Oct 2026 (SAnews, https://www.sanews.gov.za/node/85109; Stats SA page not fetchable today).

## Prime
- SARB current market rates (13 Nov 2026): SARB policy rate 7.25%, prime lending rate 10.75%. https://custom.resbank.co.za/SarbWebApi/WebIndicators/CurrentMarketRates
- "since 2001, the rate has been used as an administrative reference with a fixed spread of 350 basis points above the SPR." SARB prime cessation paper, 2026, https://www.resbank.co.za/en/home/publications/publication-detail-pages/media-releases/2026/prime-cessation-paper (a proposal to retire prime later; not in force: mention only as "may change in future", or not at all).

## Legal maximum rates (National Credit Regulations, reg 42 Table A, GN 1080 of 2015), RR = repo rate
- Mortgages RR + 12% = 19.25% today; credit facilities (credit and store cards) RR + 14% = 21.25%; unsecured loans RR + 21% = 28.25%. https://www.acts.co.za/national-credit-act-2005/r489_42__maximum_prescribed_interest_and_initiation_fees.php (via research 15 Nov; same source as main05).

## Realistic example sizes
- BetterBond: average first-time buyer home loan R1.2 million (12 months to July 2026). Property Professional, 17 Aug 2026, https://propertyprofessional.co.za/2026/08/17/property-market-holds-firm-as-first-time-buyers-set-a-new-price-record/
- TransUnion: average new vehicle loan ≈ R413,000 by Q4 2025. TransUnion SA Vehicle Pulse / MIR Q1 2026, https://www.transunion.co.za/content/dam/transunion/za/business/mir/documents/26-INT-AF-4461900-MIR-Q1-2026-Report.pdf
- Cross-check: BusinessTech 23 Sep 2026: a R1m bond goes from R9,984 to R10,152 a month (+R168) after the hike; our formula gives R9,983.80 → R10,152.29. Matches. https://businesstech.co.za/news/property/876841/how-much-more-youll-pay-on-your-bond-after-the-latest-interest-rate-hike/

## The worked example (Naledi is an illustration; all at prime for simplicity, equal monthly payments)
- Bond R1.2m, 20 years: at 10.75% R12,182.75/month; at 11.00% R12,386.26 → +R203.51 a month (say "about R204"), R2,442 a year, R48,843 over 20 years.
- Car R413,000, 6 years (72 months) at 10.75%: R7,808.29 → R7,861.07 at 11.00% → +R52.78 ("about R53").
- Credit card R20,000 at the cap 21.25% → 21.50%: +R4.17 a month, R50 a year.
- Savings R10,000: +0.25% = +R25 a year, IF the bank passes it on (not every account does; illustration).
- Total debt side: about R260 a month, R3,126 a year.
- Since May 2026 (prime 10.25% → 10.75%): R1.2m bond up R403 a month (R11,779.72 → R12,182.75).
- Rule of thumb: each 0.25% on a 20-year bond ≈ R17 a month per R100,000 owed (R16.96); on a 6-year car loan ≈ R13 per R100,000 (R12.78). A cut of 0.25% works the same in reverse (R202 less on the R1.2m bond).
- Paying R12,386.26 now (as if the rate were already 11%) on the R1.2m bond at 10.75%: paid off in 227 months (about 19 years instead of 20), about R112,600 less interest.
- One full percentage point (10.75% → 11.75%) on the bond: +R821.74 a month.

## Context only (no prediction in the video)
- BusinessTech 27 Oct 2026: Nedbank expects +25bp on 19 Nov; Old Mutual Wealth (Odendaal) and Investec (Bishop) lean to a hold. https://businesstech.co.za/news/?p=881553 . The video says only "economists are split".

## Not verified (not used)
- That savings rates move one-for-one with repo; household debt ratio; average car price 2026; October 2026 CPI.

## Benchmark (step 4; Chrome was not available in this cloud run, so storyboards could not be read; openings rebuilt from transcript summaries and chapter lists)
- "How The Economic Machine Works" (Principles by Ray Dalio, 2013, tens of millions of views): the core metaphor in the first sentence, stakes by 0:20, then a numbered map ("three forces"), then zoom into the smallest unit (one transaction).
- The Economist, "How does raising interest rates control inflation?" (2022): opens on the viewer's stakes ("why should you care?"), defines the term only at 0:45, chapters asked as questions, "cooling" metaphor.
- WSJ, "How the Fed steers interest rates" (comparison): a news-peg number at 0:00, the one tool on a chart at 0:23, a personal ripple at 0:44 (cards, mortgages), the car with gas and brake pedals at 1:24.
- Adopted: open on Naledi's bond and the R204 (stakes first), the answer in one sentence by 0:30, the term defined only after that, a numbered route ("three stops from Pretoria to your payslip"), a ripple chain (Reserve Bank → banks → prime → your loan), and one metaphor carried through: the rate as the economy's brake pedal. Not copied: their scripts, visuals or examples.

## Assets used
- No photos or stock. Rodney's received photos (SARB building, governor, dealership, houses) not used: everything is our own 3D (generic bank building, houses, car, phone); the video never shows a real person. No logos in the video; the SARB is a central bank, not a brand, and no SARB logo is placed on the thumbnail.
