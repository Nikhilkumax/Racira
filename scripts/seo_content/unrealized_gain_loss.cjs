// Batch 3 SEO content — UnrealizedGainLossCalculator
module.exports = {
  slug: "unrealized-gainloss-calculator",
  title: "Unrealized Gain/Loss Calculator",
  article: {
    intro: [
      "An unrealized gain or loss is the paper change in value of a position you still hold: current value minus cost basis, with no sale having occurred. Until you sell, the gain is a number on a screen — untaxed, unbanked, and reversible. This calculator computes the unrealized amount, its percentage, and how far the position is from breakeven."
    ],
    sections: [
      { h2: "How Unrealized Gain/Loss Is Calculated", paras: [
        "<strong>Unrealized gain = current value − cost basis</strong>, and <strong>percentage = gain ÷ cost basis × 100</strong>. A $1,000 position now worth $1,200 carries a $200 unrealized gain (20%). The distance to breakeven is the absolute gain amount: a position down $200 needs $200 of appreciation to return to even — but note the asymmetry, because a 20% loss requires a 25% gain to recover, which is why loss percentages always overstate recovery effort."
      ]},
      { h2: "Unrealized vs Realized: The Tax Line", paras: [
        "Tax systems treat the two differently: <strong>unrealized gains are not taxed</strong> (the US taxes capital gains only at sale — realization basis), while realized gains trigger tax at short- or long-term rates depending on holding period. This asymmetry is the engine of <strong>tax-loss harvesting</strong> (selling losers to realize deductions while keeping winners unrealized) and of the long-hold advantage: deferring tax lets the pre-tax amount compound for decades."
      ]},
      { h2: "Paper Gains and Risk", paras: [
        "An unrealized gain is real wealth but not real liquidity — and it can evaporate. Concentrated positions with large embedded gains create a behavioral trap: reluctance to sell to avoid the tax, even when the position has become dangerously large. The professional response is deliberate, staged realization: sell tranches across tax years, harvest losses elsewhere to offset, or use an exchange fund or charitable vehicles for very concentrated low-basis stock."
      ]},
      { h2: "Reading the Results", list: [
        "<strong>Unrealized Gain/Loss ($):</strong> current value minus cost basis — positive is a gain.",
        "<strong>Percentage:</strong> relative to cost basis — the number to compare against your targets.",
        "<strong>To Breakeven:</strong> the dollar move required to return to cost basis.",
        "<strong>Planning:</strong> pair with our <a href=\"/calculator/capital-gains-tax-calculator\">Capital Gains Tax Calculator</a> to preview the tax if you were to realize today."
      ]}
    ]
  },
  faqs: [
    { q: "What is an unrealized gain or loss?", a: "The change in value of an asset you still own: current market value minus cost basis. Because no sale has occurred, the gain is 'paper' — untaxed and reversible until realized." },
    { q: "Do I pay tax on unrealized gains?", a: "In the US, no — capital gains are taxed only upon realization (sale or exchange). Holding a position defers the tax indefinitely; heirs even receive a stepped-up basis at inheritance, erasing the embedded gain entirely." },
    { q: "How is unrealized gain percentage calculated?", a: "(Current value − cost basis) ÷ cost basis × 100. A $1,000 position now at $1,200 is a 20% unrealized gain." },
    { q: "What is the difference between realized and unrealized losses?", a: "Realized losses occur on sale and can offset capital-gains tax; unrealized losses exist only on paper. Tax-loss harvesting deliberately realizes losses while leaving winners unrealized — but beware the wash-sale rule if repurchasing within 30 days." },
    { q: "Why does a 20% loss need a 25% gain to recover?", a: "Percentage moves are computed from different bases: after a 20% loss the position is at 80% of cost, so it must grow 25% (0.8 × 1.25 = 1.0) to return to even. The deeper the loss, the more asymmetric the recovery requirement." }
  ]
};
