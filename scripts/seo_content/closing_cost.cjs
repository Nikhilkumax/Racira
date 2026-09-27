// Batch 3 SEO content — ClosingCostCalculator (special case: legacy boxed prose rebuilt)
module.exports = {
  slug: "closing-cost-calculator",
  title: "Closing Cost Calculator",
  article: {
    intro: [
      "Closing costs are the fees you pay to finalize a mortgage — lender charges, third-party services, and prepaid items — typically totaling <strong>2% to 5% of the loan amount</strong>. On a $350,000 home that is $8,400–$21,000 on top of the down payment. This calculator estimates each bucket (lender fees, third-party fees, prepaid costs) and the total cash to close, so the wire amount on closing day holds no surprises."
    ],
    sections: [
      { h2: "What's In Each Bucket of Closing Costs", paras: [
        "<strong>Lender fees</strong> (~0.5–1.5%): origination, underwriting, application, and points if you're buying the rate down. <strong>Third-party fees</strong> (~0.5–1%): appraisal, title search and insurance, credit report, survey, and recording — services performed by companies outside the lender. <strong>Prepaid items</strong> (1%+): six to twelve months of property tax and insurance escrowed upfront plus prepaid interest from closing day to month-end. Prepaids aren't really 'fees' — they're your own bills paid early — but they hit the same wire."
      ]},
      { h2: "Typical Closing Cost Line Items", paras: [
        "Origination/underwriting runs $1,500–$4,000; appraisal $450–$800; title insurance roughly 0.35–0.6% of price (highly state-dependent); recording $100–$250; credit report and flood cert under $100 combined; escrow prepaids vary with tax rates — $2,000–$6,000 on a median-priced home. Your Loan Estimate (within 3 days of application) and Closing Disclosure (3 days before closing) must match within tolerance, so use this estimate to sanity-check both."
      ]},
      { h2: "Who Pays What — and What's Negotiable", paras: [
        "Buyers pay most closing costs by default, but <strong>seller concessions</strong> (commonly 3–6% depending on loan type) can shift thousands: FHA allows up to 6%, conventional 3–9% by down payment. Lender credits trade a slightly higher rate for lower upfront fees — sensible when cash is tight and you'll hold the loan long enough to amortize the rate premium. Shopping just the title and attorney services can save 10–20% of that bucket since fees vary widely for identical service."
      ]},
      { h2: "How to Reduce Your Closing Costs", list: [
        "<strong>Compare Loan Estimates:</strong> collect 3+ and make lenders compete — origination fees vary enormously for identical loans.",
        "<strong>Ask for seller credits:</strong> especially in buyer's markets; the request costs nothing.",
        "<strong>Buy the rate down deliberately:</strong> run the trade-off with our <a href=\"/calculator/points-break-even-calculator\">Points Break-Even Calculator</a>.",
        "<strong>Close mid-to-late month:</strong> prepaid interest shrinks with fewer days to month-end.",
        "<strong>Recheck the Closing Disclosure line-by-line</strong> — tolerance violations on lender fees are your leverage."
      ]}
    ]
  },
  faqs: [
    { q: "How much are closing costs on a house?", a: "Typically 2–5% of the loan amount: lender fees plus third-party services plus prepaid escrows. On a $350,000 home, expect roughly $8,000–$18,000 in addition to the down payment." },
    { q: "What is included in closing costs?", a: "Lender fees (origination, underwriting), third-party services (appraisal, title, recording), and prepaids (property-tax and insurance escrow, prepaid interest). Ask for the itemized Loan Estimate — the three buckets must be disclosed separately." },
    { q: "Can the seller pay closing costs?", a: "Yes, through seller concessions — up to 6% for FHA/VA and 3–9% for conventional loans depending on down payment. The concession is negotiated in the purchase contract and appears as a credit on the Closing Disclosure." },
    { q: "Are closing costs tax deductible?", a: "Most are not. The deductible subset: prepaid mortgage interest (points, within limits), property-tax prepaids, and loan-fee items on rental/investment property. Confirm specifics with a tax professional for your situation." },
    { q: "Do closing costs include the down payment?", a: "No — the down payment is separate and usually much larger. 'Cash to close' combines the down payment plus closing costs plus credits, which is the number this calculator reports alongside the fees-only total." }
  ]
};
