━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total registry entries:        11,860
Total component files:         1,589
Approved (_approved.json):     1,800 + 1,782 slugs = 1,757 unique
─────────────────────────────────────────────────────
✅ Approved & Complete:          1,605
🟢 Live / Not Approved:          0
🟠 Needs Polish:                 0
🔴 Needs Rebuild:                0
🟡 Not Built:                    10,255
─────────────────────────────────────────────────────
Total action needed:             10,255
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 LIVE / NOT APPROVED (0)
  (none)

🟠 NEEDS POLISH (0)
  (none)

🔴 NEEDS REBUILD (0)
  (none)

🟡 NOT BUILT (10,255)
  • status "soon" (planned, no file expected): 10,255
  • status "live" but no file: 0

  By category (all 10,255 not-built entries):
    BUSINESS         579
    CONSTRUCTION     754
    EDUCATION        502
    ENGINEERING      1,191
    ENVIRONMENT      712
    EVERYDAY_LIFE    940
    FINANCE          1,185
    HEALTH           1,134
    MATH             937
    SCIENCE          900
    TECHNOLOGY       841
    TRANSPORTATION   580

  Full 10,255-line slug list → status_not_built.txt

─────────────────────────────────────────────────────
NOTES / OBSERVATIONS
─────────────────────────────────────────────────────
  • Live registry entries: 1,605 — all map to an existing component file (0 missing).
  • Approved & Complete: 1,605 of 1,605 live entries — no action needed.
  • 0 live calculators fully built but not tracked in _approved.json → add to _approved.json.
  • 0 polish candidates, 0 rebuild candidates (see txt files).
  • 10,255 registry entries are status "soon" (no file expected until built).

  LazyComponents wiring gaps (7): slug has a dedicated PascalCase file, but
  lazyComponents.tsx still routes the slug to a different (usually older/duplicate) component:
      debt-service-coverage-ratio-calculator → renders DebtServiceCoverageCalculator, dedicated DebtServiceCoverageRatioCalculator exists but is not wired
      cryptocurrency-profit-calculator → renders CryptoProfitCalculator, dedicated CryptocurrencyProfitCalculator exists but is not wired
      investment-calculator → renders CompoundInterestCalculator, dedicated InvestmentCalculator exists but is not wired
      debt-to-income-calculator → renders DtiCalculator, dedicated DebtToIncomeCalculator exists but is not wired
      freelancer-tax-calculator → renders FreelanceTaxCalculator, dedicated FreelancerTaxCalculator exists but is not wired
      total-asset-turnover-calculator → renders AssetTurnoverRatioCalculator, dedicated TotalAssetTurnoverCalculator exists but is not wired
      miles-per-gallon-calculator → renders MpgCalculator, dedicated MilesPerGallonCalculator exists but is not wired

  Truly orphaned files — no registry slug references them at all (15):
      - AutoLoanVsLeaseComparisonCalculator
      - BaseballOBPCalculator
      - BasketballShootingPercentageCalculator
      - ColdWalletEntropyCalculator
      - ComingSoonView
      - DebtToEquityRatioCalculator
      - EarningsPerShareGrowthCalculator
      - FarmLoanCalculator
      - FourFiveSevenBPlanCalculator
      - HourlyFreelanceToAnnualIncomeCalculator
      - PriceEarningsRatioCalculator
      - ReceivablesTurnoverRatioCalculator
      - RelatedGrid
      - ThreeDPrintCharts
      - ZeroAprPromoCalculator

  True-orphan detail (12 non-infra):
      - AutoLoanVsLeaseComparisonCalculator — 20,225 bytes, primary card: yes, approved: yes
      - BaseballOBPCalculator — 15,674 bytes, primary card: yes, approved: yes
      - BasketballShootingPercentageCalculator — 16,664 bytes, primary card: yes, approved: yes
      - ColdWalletEntropyCalculator — 17,493 bytes, primary card: NO, approved: yes
      - DebtToEquityRatioCalculator — 4,744 bytes, primary card: NO, approved: no
      - EarningsPerShareGrowthCalculator — 4,828 bytes, primary card: NO, approved: no
      - FarmLoanCalculator — 11,755 bytes, primary card: yes, approved: yes
      - FourFiveSevenBPlanCalculator — 21,473 bytes, primary card: yes, approved: yes
      - HourlyFreelanceToAnnualIncomeCalculator — 13,454 bytes, primary card: yes, approved: yes
      - PriceEarningsRatioCalculator — 4,840 bytes, primary card: NO, approved: no
      - ReceivablesTurnoverRatioCalculator — 4,947 bytes, primary card: NO, approved: no
      - ZeroAprPromoCalculator — 18,567 bytes, primary card: yes, approved: yes

  Infra/shared files (not calculators, excluded from buckets): ComingSoonView, RelatedGrid, ThreeDPrintCharts

  Still-rendered superseded files (7) — lazyComponents renders these
  older components for slugs that now have a dedicated PascalCase file (wiring-gap counterparts):
      - DebtServiceCoverageCalculator ← still rendered for: debt-service-coverage-ratio-calculator
      - CryptoProfitCalculator ← still rendered for: cryptocurrency-profit-calculator
      - CompoundInterestCalculator ← still rendered for: investment-calculator
      - DtiCalculator ← still rendered for: debt-to-income-calculator
      - FreelanceTaxCalculator ← still rendered for: freelancer-tax-calculator
      - AssetTurnoverRatioCalculator ← still rendered for: total-asset-turnover-calculator
      - MpgCalculator ← still rendered for: miles-per-gallon-calculator

  Checks run per file: size>8KB, stub patterns, Coming Soon/planned text, Calculate button + exact
  label, Primary Result Card tokens (bg-primary/10 border-l-4 border-primary rounded-lg p-5), subtitle
  under H1, Advanced Options sub-group labels, readOnly/disabled inputs, inputs without onChange,
  auto-recalc via useEffect(state deps)/onChange, zero defaults, PMI grid + card-calculator classes.
  Scan date: 2026-09-05. Read-only scan — no files modified.
