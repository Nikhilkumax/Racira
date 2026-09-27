/**
 * Canonical slug map for the /calculator domain.
 *
 * Two problems, one solution:
 *
 * 1. DUPLICATE CONTENT — several live registry slugs share a single component
 *    (e.g. `dti-calculator` and `debt-to-income-calculator` both render
 *    DtiCalculator), producing two indexable URLs with identical content.
 *    The shorter, more search-natural slug is canonical; every other slug in
 *    the group is an ALIAS that must:
 *      - stay browsable (it still renders the same tool),
 *      - emit <link rel="canonical"> pointing at the canonical URL,
 *      - be excluded from the sitemap (only canonical URLs are listed),
 *      - link to the canonical URL from SEARCH_REGISTRY.
 *
 * 2. DEAD WIRED SLUGS — slugs wired in lazyComponents that have no registry
 *    entry (legacy aliases from renames, e.g. `k401-calculator` →
 *    `401k-calculator`). They would 404 if ever linked. Where a live
 *    equivalent exists, the alias keeps working and canonicalizes to it;
 *    true orphans (no live equivalent) have their wiring removed instead.
 *
 * Canonical choice rule: prefer the shorter, more search-natural term.
 * For word-order variants prefer the slug that matches the tool's
 * head keyword first ("debt-to-income" over "dti", "hourly-rate" over
 * "hourly-freelance-rate-to-annual-income").
 */
export const CANONICAL_SLUG_MAP: Record<string, string> = {
  // ── Duplicate-content slug groups (live registry aliases) ────────────────
  "customer-acquisition-cost-cac-calculator": "customer-acquisition-cost-calculator",
  "burn-rate-calculator-2": "burn-rate-calculator",
  "business-burn-rate-calculator": "burn-rate-calculator",
  "total-asset-turnover-calculator": "asset-turnover-ratio-calculator",
  "hourly-freelance-rate-to-annual-income-calculator": "freelance-rate-calculator",
  "hourly-rate-from-annual-salary-calculator": "annual-salary-to-hourly-rate-calculator",
  "average-revenue-per-user-arpu-calculator": "average-revenue-per-user-calculator",
  "annual-recurring-revenue-arr-calculator": "annual-recurring-revenue-calculator",
  "net-worth-tracker-calculator": "net-worth-tracker",
  "interest-only-loan-calculator": "interest-only-calculator",
  "eighty-three-belection-tax-calculator": "83(b)-election-tax-calculator",
  "investment-calculator": "compound-interest-calculator",
  "crypto-profit-calculator": "cryptocurrency-profit-calculator",
  "cost-of-living-comparison-calculator": "cost-of-living-calculator",
  "five29-college-savings-plan-calculator": "529-college-savings-plan-calculator",
  "dti-calculator": "debt-to-income-calculator",
  "zero-apr-promotion-payoff-calculator": "0-apr-promotion-payoff-calculator",
  "exchange1031-timeline-calculator": "1031-exchange-timeline-calculator",
  "loan-comparison-calculator-side-by-side": "loan-comparison-calculator",
  "land-loan-payment-calculator": "land-loan-calculator",
  "bmi-for-age-pediatric-calculator": "pediatric-bmi-calculator",
  "calories-burned-by-activity-calculator": "calories-burned-calculator",
  "1-rep-max-1rm-calculator": "one-rep-max-calculator",
  "daily-calorie-burn-calculator": "daily-calorie-need-calculator",
  "cross-fit-wod-calorie-calculator": "crossfit-wod-calorie-calculator",
  "cardio-vs-strength-comparison-calculator": "cardio-vs-strength-calorie-comparison-calculator",
  "android-vs-gynoid-estimator": "android-vs-gynoid-fat-distribution-estimator",
  "body-fat-navy-method-calculator": "body-fat-percentage-navy-method-calculator",
  "body-fat-skinfold-calculator": "body-fat-percentage-skinfold-calculator",
  "body-mass-index-calculator": "body-mass-index-bmi-calculator",
  "bmito-body-fat-calculator": "bmi-to-body-fat-conversion-calculator",
  "pre-pregnancy-bmicalculator": "pre-pregnancy-bmi-calculator",
  "corrected-qt-interval-calculator": "corrected-qt-interval-qtc-calculator",
  "standardized-mortality-ratio-calculator": "standardized-mortality-ratio-smr-calculator",
  "charging-speed-calculator": "ev-charging-speed-calculator",
  "evrange-calculator": "ev-range-calculator",
  "clausius-clapeyron-calculator": "clausius-clapeyron-phase-transition-calculator",
  "reliability-engineering-burn-rate-calculator": "error-budget-burn-rate-calculator",

  // ── Queued duplicates resolved during the finance build batches ─────────
  "dividend-reinvestment-drip-calculator": "dividend-reinvestment-calculator",
  "weighted-average-cost-of-capital-wacc-calculator": "weighted-average-cost-of-capital-calculator",
  "4-rule-retirement-portfolio-calculator": "4-rule-calculator",
  "discounted-cash-flow-dcf-calculator": "dcf-calculator",
  "alpha-calculator": "alpha-investment-calculator",
  "systematic-investment-plan-sip-calculator": "sip-calculator",

  // ── Dead wired slugs with a live equivalent (legacy rename aliases) ──────
  "50-30-20-budget-calculator": "budget-rule-calculator",
  "four01k-growth-calculator": "401(k)-growth-calculator",
  "four03b-growth-calculator": "403(b)-growth-calculator",
  "four57b-plan-calculator": "457(b)-plan-calculator",
  "four-percent-rule-calculator": "4-rule-calculator",
  "ten-year-averaging-distribution-calculator": "10-year-averaging-distribution-calculator",
  "auto-lease-calculator": "car-lease-calculator",
  "cd-calculator-full": "cd-calculator",
  "customer-lifetime-value-calculator": "lifetime-value-calculator",
  "debt-service-coverage-calculator": "debt-service-coverage-ratio-calculator",
  "domain-valuation-calculator": "domain-name-valuation-calculator",
  "fha-mip-calculator": "fha-mortgage-insurance-premium-mip-calculator",
  "fifteen-vs-thirty-mortgage-calculator": "15-year-vs-30-year-mortgage-comparison",
  "five-year-ownership-cost-calculator": "5-year-ownership-cost-calculator",
  "home-loan-emi-india": "home-loan-emi-calculator-india",
  "k401-calculator": "401k-calculator",
  "loan-deferment-interest-calculator": "loan-deferment-interest-accumulation-calculator",
  "net-worth-tracker-calc": "net-worth-tracker",
  "npv-calculator": "net-present-value-calculator",
  "real-estate-calculator-full": "real-estate-calculator",
  "ten-year-ownership-cost-calculator": "10-year-ownership-cost-calculator",
  "meatless-diet-impact-calculator": "meatless-monday-impact-calculator",
  "pregnancy-weight-target-calculator": "weight-gain-during-pregnancy-target-calculator",
  "tennis-first-serve-calculator": "tennis-first-serve-percentage-calculator",
  "viscerial-fat-calculator": "visceral-fat-calculator",
  "hydraulic-retention-time-calculator": "hydraulic-retention-time-hrt-calculator",
  "ppi-calculator": "pixel-density-calculator",
  "psu-calculator": "power-supply-calculator",
  "speed-distance-time-calculator": "speed-calculator",
  "ssl-cost-calculator": "ssl-certificate-cost-calculator",
  "three-dprint-time-calculator": "3d-print-time-calculator",
  "baseball-fielding-calculator": "baseball-fielding-percentage-calculator",
  "baseball-slugging-calculator": "baseball-slugging-percentage-calculator",
  "hp-to-kw-calculator": "horsepower-to-kilowatts-calculator",
  "mpg-calculator": "miles-per-gallon-calculator",
  "tea-steeping-calculator": "tea-steeping-time-calculator",
  "turkey-roasting-calculator": "turkey-roasting-time-calculator",
  "quarter-to-semester-credit-calculator": "quarter-to-semester-credit-conversion-calculator",
};

/** True when the slug is a non-canonical alias that must canonicalize elsewhere. */
export function isAliasSlug(slug: string | undefined | null): boolean {
  return !!slug && Object.prototype.hasOwnProperty.call(CANONICAL_SLUG_MAP, slug);
}

/** The canonical slug for an alias, or the slug itself when it is canonical. */
export function canonicalSlug(slug: string | undefined | null): string {
  if (!slug) return slug ?? "";
  let current = slug;
  // Guard against accidental chains (alias -> alias); resolve fully.
  for (let i = 0; i < 5 && CANONICAL_SLUG_MAP[current]; i++) {
    current = CANONICAL_SLUG_MAP[current];
  }
  return current;
}
