// Batch 3 SEO content — RetainedEarningsCalculator
module.exports = {
  slug: "retained-earnings-calculator",
  title: "Retained Earnings Calculator",
  article: {
    intro: [
      "Retained earnings are the cumulative profits a company has kept rather than distributed: <strong>ending retained earnings = beginning retained earnings + net income − dividends</strong>. The figure sits on the balance sheet as part of shareholders' equity and tells the story of every profitable year and every payout since inception. This calculator computes the ending balance and shows how each component contributes."
    ],
    sections: [
      { h2: "How Retained Earnings Are Calculated", paras: [
        "Start with the beginning balance from the prior period's balance sheet, add current-period <strong>net income</strong> (a loss subtracts), subtract <strong>dividends declared</strong> — both cash and stock dividends reduce the balance — and adjust for rare items like prior-period corrections or accounting changes. The result is the ending retained earnings reported on the equity section of the balance sheet. This calculator applies the standard flow and lets you include other adjustments explicitly."
      ]},
      { h2: "What Retained Earnings Signal", paras: [
        "A <strong>growing balance</strong> says the company funds growth internally — the cheapest capital there is. A <strong>shrinking balance</strong> means either losses or a payout policy returning more than earned, which can be deliberate (mature cash cows like utilities) or alarming (companies borrowing to fund dividends). Analysts read the trend rather than the level: a decade of accumulation funds expansion, debt paydown, and buybacks; a decade of erosion demands an explanation."
      ]},
      { h2: "Retained Earnings vs Cash: The Classic Confusion", paras: [
        "Retained earnings are <strong>not cash</strong>. They are an accounting accumulation that may already be deployed into inventory, equipment, acquisitions, or buybacks. A company can show large retained earnings while holding little cash — or small retained earnings with a fortress balance sheet after a recent recapitalization. The number explains where profit has gone; the cash flow statement explains where the money actually is."
      ]},
      { h2: "Related Metrics", list: [
        "<strong>Retention ratio:</strong> retained earnings ÷ net income — the share of profit reinvested (complement of the payout ratio).",
        "<strong>Sustainable growth:</strong> ROE × retention ratio — the growth rate the company can fund without new equity.",
        "<strong>Statement of retained earnings:</strong> the formal reconciliation report this calculator mirrors.",
        "<strong>Deeper analysis:</strong> pair with our <a href=\"/calculator/return-on-equity-calculator\">ROE Calculator</a> and <a href=\"/calculator/gross-margin-calculator\">Gross Margin Calculator</a> to see how well retained capital compounds."
      ]}
    ]
  },
  faqs: [
    { q: "How do you calculate retained earnings?", a: "Ending retained earnings = beginning retained earnings + net income − dividends declared, plus any other adjustments. It is the equity-section figure that rolls forward period to period." },
    { q: "Are retained earnings the same as cash?", a: "No. They are a cumulative accounting measure of undistributed profit, typically already invested in assets — inventory, equipment, acquisitions. Cash is a balance-sheet line; retained earnings is an equity concept." },
    { q: "Can retained earnings be negative?", a: "Yes — called an accumulated deficit. It means cumulative losses and dividends have exceeded cumulative profits, and it often appears on the balance sheet of turnaround situations and startups still burning capital." },
    { q: "Do dividends always reduce retained earnings?", a: "Cash and stock dividends both reduce the balance. Cash dividends also reduce assets; stock dividends reclassify equity within shareholders' equity without changing total equity. Distributions beyond current profit draw the balance down directly." },
    { q: "What is a good retained earnings balance?", a: "There is no absolute target — what matters is the trend and what the company earns on retained capital. Steadily growing retained earnings funding high-ROE reinvestment is the ideal; stagnant or eroding balances with weak returns argue for higher payouts." }
  ]
};
