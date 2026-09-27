// Batch 3 SEO content — CustodialAccountGrowthCalculator
module.exports = {
  slug: "custodial-account-growth-calculator",
  title: "Custodial Account Growth Calculator",
  article: {
    intro: [
      "A custodial account — typically a UTMA or UGMA account — is an investment account an adult manages for a minor, which becomes the child's property at the age of majority (18–25 depending on the state). Because the horizon is measured in decades and contributions start early, compounding does most of the work. This calculator projects the account's growth from an initial contribution, ongoing monthly deposits, an assumed return, and your chosen compounding frequency."
    ],
    sections: [
      { h2: "How Custodial Account Growth Is Calculated", paras: [
        "The projection compounds the current balance at each period: <strong>balance × (1 + rate/n)^(n×years)</strong> for a lump sum, with monthly contributions added and compounded along the way. The frequency selector (annual, quarterly, monthly, daily) changes how often earned growth itself starts earning — the difference between annual and monthly compounding at 7% over 18 years is real but modest; the difference between starting at birth and starting at age 10 is dramatic."
      ]},
      { h2: "The Tax Advantage (and the Kiddie Tax)", paras: [
        "Custodial accounts are taxed to the child. The first ~$1,350 of unearned income is tax-free, the next ~$1,350 is taxed at the child's rate, and anything above that is taxed at the parents' rate — the <strong>kiddie tax</strong>. For most families this means the first few thousand dollars of growth per year is taxed lightly or not at all, making custodial accounts attractive for long-horizon, growth-oriented investments held in index funds where gains are unrealized until sold."
      ]},
      { h2: "Custodial Account vs 529 Plan", paras: [
        "A <strong>529 plan</strong> grows tax-free for education but restricts spending to qualified education costs; a <strong>UTMA/UGMA</strong> is unrestricted once the child comes of age — they can buy a car, start a business, or spend it freely. Custodial accounts also count more heavily against financial-aid formulas because they are student assets. The common heuristic: if the money is certainly for education, a 529 wins on tax treatment; if flexibility matters, the custodial account wins — run both through our <a href=\"/calculator/college-savings-calculator\">College Savings Calculator</a> to compare outcomes."
      ]},
      { h2: "Practical Tips", list: [
        "<strong>Start at birth:</strong> eighteen years of compounding roughly triples the outcome of eight years at the same contribution rate.",
        "<strong>Keep it growth-oriented:</strong> the kiddie tax shelter is most valuable for long-horizon equity exposure, not cash yields.",
        "<strong>Track unrealized gains:</strong> selling assets realizes gains that may hit the kiddie tax in a single year — spread large sales.",
        "<strong>Plan the handover:</strong> at majority the account is legally the child's; some families shift to a 529 or trust before that date."
      ]}
    ]
  },
  faqs: [
    { q: "What is a custodial account?", a: "An investment account (UTMA or UGMA) held in a minor's name and managed by a custodian until the age of majority. The assets irrevocably belong to the child and become theirs to control when they reach the state-defined age (18–25)." },
    { q: "How much can I contribute to a custodial account?", a: "There is no contribution limit, though gifts above the annual gift-tax exclusion (~$18,000 per donor per child in 2024) may require filing a gift-tax return. Many grandparents use five-year gift-forwarding (superfunding) for larger transfers." },
    { q: "How is a custodial account taxed?", a: "Under the kiddie tax: the child's first ~$1,350 of unearned income is tax-free, the next ~$1,350 is at the child's rate, and the excess is taxed at the parents' marginal rate. Unrealized growth is not taxed until sold, which makes buy-and-hold investing especially efficient here." },
    { q: "What happens when my child turns 18?", a: "The account becomes theirs outright — they can spend, reinvest, or transfer it. Some states allow delaying to 21 or 25 via the account terms. If you want continued control, families often move assets to a trust or a 529 before the age of majority." },
    { q: "Does a custodial account affect financial aid?", a: "Yes, significantly. As a student asset it is assessed at roughly 20% per year in the FAFSA formula, versus a much lower assessment for parental assets — a key reason education-earmarked savings often belongs in a 529 instead." }
  ]
};
