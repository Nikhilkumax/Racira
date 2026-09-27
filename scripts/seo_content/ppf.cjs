// Batch 3 SEO content — PpfCalculator
module.exports = {
  slug: "ppf-calculator",
  title: "PPF Calculator — Public Provident Fund",
  article: {
    intro: [
      "The Public Provident Fund (PPF) is India's flagship long-term savings scheme: government-backed, tax-exempt, and currently paying 7.1% per annum compounded annually. Contributions of ₹500–₹1,50,000 per year grow over a 15-year term, extendable in 5-year blocks, with the entire maturity amount free of income tax. This calculator projects your corpus year by year, applying the statutory ₹1.5 lakh annual cap automatically."
    ],
    sections: [
      { h2: "How the PPF Calculator Works", paras: [
        "PPF compounds annually: each year's interest is <strong>balance × 7.1%</strong>, credited on the lowest balance between the 5th and the last day of the month — which is why depositing before April 5th maximizes interest for the year. The projection applies your yearly deposit, caps it at ₹1,50,000, adds interest, and rolls the balance forward. The year-by-year table shows the corpus building to maturity."
      ]},
      { h2: "The Triple Tax Advantage (EEE)", paras: [
        "PPF is one of the few truly <strong>EEE</strong> instruments: contributions qualify for Section 80C deduction (up to ₹1.5 lakh), interest accrues tax-free, and maturity proceeds are tax-free. Against a fixed deposit of the same rate, the tax drag alone can exceed 2 percentage points in the 30% bracket — making PPF's 7.1% effectively superior for most taxpayers. This is the core reason PPF anchors long-term debt allocation in Indian portfolios."
      ]},
      { h2: "Withdrawal, Loan, and Extension Rules", paras: [
        "Partial withdrawals are allowed from year 7 (up to 50% of the balance of the preceding year or your contributions, whichever rule applies). Loans against the balance are available from years 3–6 at modest rates. At 15 years you may <strong>extend in 5-year blocks</strong> — with or without further contributions — retaining the tax-free status. Liquidity is deliberately limited; PPF rewards money you will not touch."
      ]},
      { h2: "PPF vs ELSS vs NPS", list: [
        "<strong>PPF:</strong> sovereign safety, 15-year lock-in, EEE status — the debt anchor.",
        "<strong>ELSS:</strong> market-linked equity with only a 3-year lock-in and 80C eligibility — higher expected return, higher volatility. See our <a href=\"/calculator/sip-calculator\">SIP Calculator</a> for equity projections.",
        "<strong>NPS:</strong> retirement-focused with an additional ₹50,000 deduction under 80CCD(1B), but partial annuitization at exit.",
        "<strong>Strategy:</strong> many investors max PPF for the debt sleeve and route equity via ELSS/SIP — the combination is both tax-efficient and diversified."
      ]}
    ]
  },
  faqs: [
    { q: "What is the current PPF interest rate?", a: "7.1% per annum (compounded annually), set by the government quarterly. The calculator uses the prevailing rate but lets you model changes by adjusting the rate input." },
    { q: "When should I deposit to get maximum interest?", a: "Before April 5th. Interest is computed on the lowest balance between the 5th and month-end, so a lump sum deposited early in the financial year earns a full year of interest, while monthly deposits earn progressively less." },
    { q: "What is the minimum and maximum yearly PPF deposit?", a: "₹500 minimum and ₹1,50,000 maximum per financial year. Deposits above the cap earn no interest, which is why the calculator caps the input automatically." },
    { q: "Can I withdraw from PPF before 15 years?", a: "Partial withdrawals open from the 7th year, capped at 50% of the prior year's balance or your own contributions under the applicable rule. Full withdrawal happens at maturity; premature closure is allowed only in narrow cases (medical, higher education) after 5 years, with an interest penalty." },
    { q: "Is PPF maturity amount taxable?", a: "No — PPF enjoys Exempt-Exempt-Exempt status: contributions are deductible under 80C, interest is tax-free, and the maturity corpus is tax-free. This makes its effective after-tax yield far above equally-rated taxable instruments." }
  ]
};
