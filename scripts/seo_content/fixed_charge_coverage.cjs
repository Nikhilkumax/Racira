// Batch 3 SEO content — FixedChargeCoverageRatioCalculator (has FAQ h3s + Breadcrumb already)
module.exports = {
  slug: "fixed-charge-coverage-ratio-calculator",
  title: "Fixed Charge Coverage Ratio Calculator",
  article: {
    industryTable: {
      caption: "Typical fixed-charge coverage benchmarks",
      head: ["Context", "Healthy range", "Interpretation"],
      rows: [
        ["Investment-grade corporate", "2.0× – 4.0×", "Comfortable cushion over fixed obligations"],
        ["Leveraged credit agreements", "≥ 1.5× – 2.0×", "Common lender covenant floor"],
        ["Commercial real estate (DSCR-style)", "1.25× – 2.0×", "Below 1.25× usually breaches loan terms"],
        ["Cyclical manufacturing", "2.5×+ at peak", "Peak coverage must absorb trough-year dips"],
        ["Distressed signal", "< 1.0×", "Operating income cannot cover fixed charges"]
      ]
    },
    intro: [
      "The fixed-charge coverage ratio (FCCR) asks the sharpest solvency question there is: <strong>after every fixed obligation is paid, how much operating income is left?</strong> Fixed charges include interest expense, scheduled principal amortization, and lease payments — the bills that arrive no matter how the year went. Unlike debt-to-asset ratios that describe balance-sheet structure, FCCR is a <em>cash-flow stress test</em>: a company can carry a lot of debt and still be safe if earnings cover the carrying costs several times over."
    ],
    sections: [
      { h2: "The Formula and What Counts as a Fixed Charge", paras: [
        "The standard form is: <strong>(EBIT + fixed charges before tax) ÷ (fixed charges before tax + interest)</strong>. In practice lenders define the numerator as EBIT plus lease expense and the denominator as interest plus scheduled principal plus lease expense. What counts matters: operating leases are now on balance sheets (ASC 842/IFRS 16), so ignoring rent in the denominator overstates coverage for lease-heavy businesses — retailers, restaurants, airlines. Capitalized interest and guaranteed dividends are sometimes included depending on the credit agreement. Always match the definition your lender or the rating agency uses."
      ]},
      { h2: "Interpreting the Result", paras: [
        "At <strong>1.0×</strong>, operating income exactly covers fixed charges — no margin for a bad quarter, a lost customer, or a commodity spike. Lenders typically want at least <strong>1.5×–2.0×</strong> and write covenant floors near that level; breaching them converts the loan to default even if payments are current. Above <strong>3×</strong>, the business has real resilience but may be under-levered — cheap fixed-rate debt left on the table. The trend matters as much as the level: coverage that falls for three consecutive years is a warning even when the absolute number still looks fine."
      ]},
      { h2: "FCCR vs. Interest Coverage (DSCR)", paras: [
        "Plain <a href=\"/calculator/interest-coverage-ratio-calculator\">interest coverage</a> (EBIT ÷ interest) is the loosest test — it ignores principal and leases. Debt-service coverage (DSCR) adds scheduled principal. FCCR is the broadest: interest + principal + leases. For the same company the three rank FCCR ≤ DSCR ≤ interest coverage, so a lender quoting only interest coverage is showing you the most flattering version. Our <a href=\"/calculator/dscr-calculator\">DSCR Calculator</a> covers the middle case if you need it separately."
      ]},
      { h2: "How Lenders and Analysts Use It", list: [
        "<strong>Covenant monitoring:</strong> FCCR floors (often 1.25×–1.5×) appear in credit agreements; a breach triggers renegotiation or acceleration.",
        "<strong>Rating rationale:</strong> agencies publish FCCR medians by sector and rating notch — compare your result against your sector's median, not the universe.",
        "<strong>Lease-heavy screening:</strong> for retail and restaurant credits, FCCR is the primary metric because rent dominates fixed charges.",
        "<strong>Stress testing:</strong> recompute with trough-year EBIT — coverage must survive the bad year, not average over the cycle."
      ]}
    ]
  },
  faqs: [
    { q: "What is a good fixed-charge coverage ratio?", a: "At least 1.5×–2.0× for most lenders, with 2.0×+ considered comfortable. Below 1.0× means operating income cannot cover fixed charges — a distress signal. Lease-heavy sectors get scrutinized at higher thresholds." },
    { q: "How is FCCR different from interest coverage ratio?", a: "Interest coverage counts only interest expense (EBIT ÷ interest). FCCR adds scheduled principal and lease payments to the denominator, making it a stricter, more realistic test of whether cash flow carries all fixed obligations." },
    { q: "Are lease payments included in fixed charges?", a: "Yes — that's the point of the metric. Operating lease expense (rent) belongs in the denominator under the standard definition. Excluding it overstates coverage for retail, restaurant, and airline businesses whose largest fixed cost is rent." },
    { q: "What happens if FCCR falls below the covenant level?", a: "The borrower is in technical default even if all payments are current. Typical consequences: renegotiated terms, higher pricing, restricted dividends, or acceleration. That's why companies defend coverage headroom before it erodes." },
    { q: "Can FCCR be negative?", a: "Yes — when EBIT itself is negative, the ratio turns negative and the metric stops being meaningful as a multiple. At that point the company is burning cash before any financing costs, and liquidity rather than coverage is the live question." }
  ]
};
