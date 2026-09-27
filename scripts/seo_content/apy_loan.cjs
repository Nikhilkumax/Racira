// Batch 3 SEO content — AnnualPercentageYieldLoanCalculator
module.exports = {
  slug: "annual-percentage-yield-loan-calculator",
  title: "Annual Percentage Yield (APY) Loan Calculator",
  article: {
    intro: [
      "APR tells you the nominal annual rate; APY (also called EAR — effective annual rate) tells you what that rate actually costs once compounding is included. For borrowers, APY is the honest number: a loan quoted at 12% APR compounded monthly costs more than 12% per year because interest accrues on accrued interest. This calculator converts a nominal rate at any compounding frequency into the effective annual yield, then projects the loan's payment and total cost."
    ],
    sections: [
      { h2: "The APY Formula", paras: [
        "<strong>APY = (1 + r/n)^n − 1</strong>, where r is the nominal annual rate and n is the number of compounding periods per year. Monthly compounding (n = 12) turns 12% into 12.68% APY; daily compounding pushes it to 12.75%. The more frequent the compounding, the larger the gap between the quoted rate and what you actually pay — which is why comparing loans on APR alone can hide meaningful cost differences."
      ]},
      { h2: "Why APY Matters More as Rates Rise", paras: [
        "The gap between nominal and effective rates scales with the rate level. At 4%, monthly compounding adds about 0.07 percentage points — noise. At 18% (credit-card territory) it adds nearly a full point, and at 36% (subprime lending) the effective rate is several points above the quote. Two loans with identical APRs but different compounding frequencies are genuinely different loans, and APY is the number that exposes it."
      ]},
      { h2: "How Lenders Use This in Practice", paras: [
        "Credit cards and lines of credit compound daily or monthly, so their effective cost runs above the quoted APR. Auto loans and mortgages typically compound monthly with payments applied monthly, making their payment math align with the nominal rate — but any fee-laden quote still understate the true cost, which is why APR was invented to fold fees in. Use APY when comparing compounding products, and APR-with-fees when comparing installment loans."
      ]},
      { h2: "Reading the Results", list: [
        "<strong>Effective Annual Yield:</strong> the compounded cost of the quoted rate — the number to compare across loans.",
        "<strong>Monthly Payment:</strong> computed on the nominal rate with payment-matched compounding.",
        "<strong>Total Interest:</strong> the full cost of borrowing over the term at the stated frequency."
      ]}
    ]
  },
  faqs: [
    { q: "What is the difference between APR and APY?", a: "APR is the nominal annual rate before compounding; APY (effective annual rate) includes the effect of interest compounding on itself. A 12% APR compounded monthly equals a 12.68% APY — the APY is what you actually pay per year." },
    { q: "How do I convert APR to APY?", a: "APY = (1 + APR/n)^n − 1, where n is compounding periods per year. Monthly compounding uses n = 12, daily n = 365. Our dedicated <a href=\"/calculator/apr-to-ear-calculator\">APR to EAR Calculator</a> does this conversion standalone." },
    { q: "Which compounding frequency is most common for loans?", a: "Monthly for installment loans (auto, mortgage, personal), daily for credit cards and many lines of credit. The frequency is set in the loan agreement and directly changes the effective cost." },
    { q: "Does APY matter if I pay on schedule?", a: "Yes — the effective rate describes how interest accrues between payments regardless of your payment behavior. Paying more often than interest compounds (e.g. bi-weekly on a monthly-compounding loan) works in your favor by keeping the balance lower when interest is charged." },
    { q: "Is a lower APY always better?", a: "For borrowing, yes: APY is the true annual cost. Just ensure you compare APYs computed at the same compounding frequency, and remember that fees are separate — a loan with fees should be compared on APR-with-fees or total cost." }
  ]
};
