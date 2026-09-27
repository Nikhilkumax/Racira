// Batch 3 SEO content — DebtToAssetRatioCalculator (has FAQ h3s + Breadcrumb already)
module.exports = {
  slug: "debt-to-asset-ratio-calculator",
  title: "Debt to Asset Ratio Calculator",
  article: {
    industryTable: {
      caption: "Typical debt-to-asset ranges by industry",
      head: ["Industry", "Healthy range", "Notes"],
      rows: [
        ["Utilities", "0.55 – 0.70", "Stable regulated cash flows support heavy debt loads"],
        ["Real estate / REITs", "0.50 – 0.70", "Property assets are classic debt collateral"],
        ["Airlines", "0.60 – 0.80", "Capital-intensive; high leverage is the norm"],
        ["Manufacturing", "0.35 – 0.55", "Moderate; watch interest coverage alongside"],
        ["Retail", "0.30 – 0.50", "Inventory-driven; seasonal swings matter"],
        ["Software / services", "0.10 – 0.30", "Asset-light — low ratio is normal, not conservative"],
        ["Biotech (pre-revenue)", "0.05 – 0.20", "Funded by equity; debt capacity comes later"]
      ]
    },
    intro: [
      "The debt-to-asset ratio divides total liabilities by total assets — the bluntest solvency measure on the balance sheet. It answers one question: <strong>what fraction of everything the company owns was paid for with borrowed money?</strong> At 0.60, creditors fund 60 cents of every asset dollar and shareholders 40. Above roughly 0.6–0.7 the company is said to be trading on the equity: returns to owners are amplified, but so is any earnings shock."
    ],
    sections: [
      { h2: "How to Read Your Result", paras: [
        "Below 0.4 is generally conservative — substantial debt capacity remains for expansion or weathering downturns. 0.4–0.6 is the broad middle ground where most capital-intensive but stable businesses operate. Above 0.6–0.7, refinancing risk becomes the live concern: the question shifts from <em>how much debt</em> to <em>can it be rolled over</em>. The ratio must always be read against the industry — a utility at 0.65 may be boringly safe while a software firm at 0.55 is flirting with distress, because their cash-flow stability differs completely."
      ]},
      { h2: "Debt to Asset vs. Debt to Equity vs. Debt to Income", paras: [
        "Debt-to-asset measures <strong>what portion of assets is creditor-financed</strong> — a solvency view. Debt-to-equity compares borrowing to owner capital directly (debt ÷ equity) and amplifies: a D/A of 0.5 equals a D/E of 1.0. Debt-to-income is personal-finance-side — your own borrowing against income. Use D/A to gauge balance-sheet structure, D/E to gauge owner risk amplification, and coverage ratios (interest coverage) to test whether the <em>cash flows</em> can carry the debt — a company can show a fine D/A and still struggle if earnings turn over the debt service."
      ]},
      { h2: "Limitations to Keep in Mind", paras: [
        "The ratio uses <strong>book values</strong>: assets carried at depreciated historical cost can understate (appreciated real estate) or overstate (intangibles near worthless) true coverage. It says nothing about debt <em>maturity</em> — a 0.5 ratio split between long-term bonds and a short-term bank line due next quarter are very different risk profiles. Pair it with the <a href=\"/calculator/current-ratio-calculator\">Current Ratio Calculator</a> for liquidity and interest coverage for servicing ability."
      ]}
    ]
  },
  faqs: [
    { q: "What is a good debt-to-asset ratio?", a: "Below 0.4 (40%) is generally conservative, 0.4–0.6 is moderate, and above 0.7 signals heavy leverage. The right benchmark is industry: utilities routinely run 0.55–0.70 safely, while software companies at that level would be distressed." },
    { q: "How is the debt-to-asset ratio calculated?", a: "Total liabilities ÷ total assets, both straight from the balance sheet. A result of 0.55 means creditors financed 55% of the company's assets. Some analysts exclude intangibles from assets to get a tougher 'tangible' version." },
    { q: "Is debt-to-asset the same as debt-to-equity?", a: "No. Debt-to-asset is liabilities ÷ assets; debt-to-equity is liabilities ÷ shareholders' equity. They're linked: D/A of 0.5 equals D/E of 1.0. D/A shows asset financing mix; D/E shows leverage on owner capital directly." },
    { q: "Can the debt-to-asset ratio be negative or above 1?", a: "Yes above 1: it means liabilities exceed assets — technical insolvency — and equity has been wiped out. It can't be negative unless liabilities are negative (rare accounting events). Anything approaching 1.0 is a going-concern red flag." },
    { q: "How do I improve a high debt-to-asset ratio?", a: "Two levers: pay down liabilities (retained earnings, asset sales) or grow assets with equity financing (new share issuance, retained profits). Refinancing short-term debt into long-term doesn't change the ratio but materially reduces refinancing risk." }
  ]
};
