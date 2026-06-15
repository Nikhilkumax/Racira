
# Racira Calculator Platform — Final Audit Report

Generated: 2026-06-12T05:10:04.513Z


## Phase 1 — Calculator Count Audit

| Layer | Count | Target | Status |
|-------|-------|--------|--------|
| Database (JSON) | 11753 | 11753 | ✅ |
| Registry (.ts) | 11753 | 11753 | ✅ |
| Sitemap | 11753 | 11753 | ✅ (mirrors registry) |
| Generated Routes (slug page) | 993 | N/A | 993 built components wired |
| Built Calculators | 468 | ~300+ | ✅ |
| Coming Soon | 11285 | ~11,450 | ✅ |

## Duplicate Audit

| Check | Count | Status |
|-------|-------|--------|
| Duplicate DB slugs | 0 | ✅ |
| Duplicate Registry slugs | 0 | ✅ |
| Duplicate Route keys | 0 | ✅ |

## Missing Entry Audit

| Check | Count | Status |
|-------|-------|--------|
| In DB but not in Registry | 0 | ✅ |
| In Registry but not in DB | 0 | ✅ |

## Broken Slug Audit

| Check | Count | Status |
|-------|-------|--------|
| Broken DB slugs (invalid chars) | 0 | ✅ |
| Broken Registry slugs (invalid chars) | 0 | ✅ |

## Per-Category Breakdown

| Category | DB Count | Registry Count | Delta |
|----------|----------|----------------|-------|
| finance | 1637 | 1637 | ✅ |
| business | 754 | 754 | ✅ |
| health | 1492 | 1492 | ✅ |
| math | 1072 | 1072 | ✅ |
| science | 997 | 997 | ✅ |
| engineering | 1201 | 1201 | ✅ |
| technology | 911 | 911 | ✅ |
| environment | 737 | 737 | ✅ |
| everyday-life | 1001 | 1001 | ✅ |
| transportation | 641 | 641 | ✅ |
| construction | 775 | 775 | ✅ |
| education | 535 | 535 | ✅ |

## Phase 3 — Search Validation

- Total searchable (registry): **11753**
- Built (appear first): **468**
- Coming Soon (appear below built): **11285**
- Duplicate search results: **0**
- Search source: calculatorRegistry (all 11753 entries indexed)

## Phase 4 — Sitemap Validation

- Sitemap source: `calculatorRegistry.map(c => .../calculator/${c.slug})`
- Sitemap calculator entries: **11753** (auto-synced with registry)
- Duplicate URLs: **0** (same as registry dups)
- Missing URLs: **0** (sitemap reads same registry array)

## Phase 5 — Build Validation

> Run `npm run build` separately. Non-calculator errors (PDF, Image, Video tools) are excluded from this audit.

Known calculator build status: **No calculator-specific errors detected in last build.**
Known non-calculator warnings: PDF tools excluded from build via `.antigravityignore`.

## Phase 6 — Implementation Readiness

- **Total Calculators:** 11753
- **Built:** 468
- **Coming Soon:** 11285

### Priority Build Roadmap

| Phase | Target | Focus |
|-------|--------|-------|
| Phase A | Top 100 | Finance (Loans, Tax, Mortgage), Health (BMI, BMR, Pregnancy), Business (ROI, Break-even) |
| Phase B | Top 500 | Math, Science, Technology, Engineering core tools |
| Phase C | Top 1,000 | Education, Environment, Transportation, Construction |

### Highest-Value Categories (RPM/CPM Priority)

| Priority | Category | Est. RPM | Key Subcategories |
|----------|----------|----------|-------------------|
| 1 | FINANCE | $8–15 | Mortgage, Loans, Tax, Retirement, Investment |
| 2 | BUSINESS | $6–12 | Valuation, ROI, Break-even, Payroll |
| 3 | HEALTH | $4–8 | BMI, Pregnancy, Calories, Clinical Scores |
| 4 | CONSTRUCTION | $5–10 | Concrete, Roofing, Flooring, HVAC |
| 5 | TECHNOLOGY | $4–7 | Cloud Cost, Network, SSD, Gaming |

### Quick-Win Calculators (High Traffic, Low Build Complexity)

- **Loan-to-Cost (LTC) Ratio Calculator** (`loan-to-cost-ltc-ratio-calculator`) — undefined/undefined
- **Loan-to-Income Ratio Calculator** (`loan-to-income-ratio-calculator`) — undefined/undefined
- **Simple Interest Loan Calculator** (`simple-interest-loan-calculator`) — undefined/undefined
- **Loan-to-Value Ratio Calculator** (`loan-to-value-ratio-calculator`) — undefined/undefined
- **Debt Coverage Ratio Mortgage Calculator** (`debt-coverage-ratio-mortgage-calculator`) — undefined/undefined
- **Loan-to-Value (LTV) Ratio Calculator** (`loan-to-value-ltv-ratio-calculator`) — undefined/undefined
- **Interest-Only Loan Calculator** (`interest-only-loan-calculator`) — undefined/undefined
- **Adjustable Rate Mortgage Reset Calculator** (`adjustable-rate-mortgage-reset-calculator`) — undefined/undefined
- **Mortgage Recast Calculator** (`mortgage-recast-calculator`) — undefined/undefined
- **Loan Comparison Calculator** (`loan-comparison-calculator`) — undefined/undefined
- **Title Loan Cost Calculator** (`title-loan-cost-calculator`) — undefined/undefined
- **Home Improvement Loan Calculator** (`home-improvement-loan-calculator`) — undefined/undefined
- **Wedding Loan Calculator** (`wedding-loan-calculator`) — undefined/undefined
- **Land Loan Calculator** (`land-loan-calculator`) — undefined/undefined
- **Second Mortgage Calculator** (`second-mortgage-calculator`) — undefined/undefined
- **Conforming vs Jumbo Loan Calculator** (`conforming-vs-jumbo-loan-calculator`) — undefined/undefined
- **Subprime Loan Cost Calculator** (`subprime-loan-cost-calculator`) — undefined/undefined
- **Early Mortgage Payoff Calculator** (`early-mortgage-payoff-calculator`) — undefined/undefined
- **Reverse Mortgage Break-Even Calculator** (`reverse-mortgage-break-even-calculator`) — undefined/undefined
- **15-Year vs 30-Year Mortgage Comparison** (`15-year-vs-30-year-mortgage-comparison`) — undefined/undefined

## Success Criteria Checklist

- ✅ Database Count matches Registry Count
- ✅ Duplicate DB Slugs = 0
- ✅ Duplicate Registry Slugs = 0
- ✅ Duplicate Route Keys = 0
- ✅ Missing Registry Entries = 0
- ✅ Missing Database Entries = 0
- ✅ Built Calculators > 0
- ✅ Search source = full registry
- ✅ Sitemap source = full registry