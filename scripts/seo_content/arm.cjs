// Batch 3 SEO content — AdjustableRateMortgageArmPaymentCalculator
module.exports = {
  slug: "adjustable-rate-mortgage-arm-payment-calculator",
  title: "Adjustable-Rate Mortgage (ARM) Payment Calculator",
  article: {
    intro: [
      "An adjustable-rate mortgage (ARM) trades initial affordability for future uncertainty: you get a lower fixed rate for an introductory period, then the rate resets periodically to a market index plus a fixed margin. This calculator projects your payment during the fixed period, the fully-indexed rate after adjustment, and the new payment you should expect — so the reset never surprises you."
    ],
    sections: [
      { h2: "How the ARM Payment Calculator Works", paras: [
        "During the fixed period the payment is the standard amortization formula: <strong>P = L × [r(1+r)^n] ÷ [(1+r)^n − 1]</strong>, using the initial rate and the full term. When the fixed period ends, the rate becomes the <strong>fully-indexed rate = index + margin</strong>, and the payment is recalculated over the remaining months on the balance outstanding at that point. The projection table shows each period's rate, payment, and duration side by side."
      ]},
      { h2: "Understanding Index, Margin, and Caps", paras: [
        "The <strong>index</strong> (commonly SOFR or the Constant Maturity Treasury) is the market benchmark your rate follows; the <strong>margin</strong> is the lender's fixed add-on set in your note and never changes. A 5/1 ARM priced at SOFR + 2.75% with SOFR at 4.5% resets to 7.25%. Rate caps limit how far the rate can move at each adjustment (typically 2%) and over the life of the loan (typically 5–6%), which bounds your worst-case payment."
      ]},
      { h2: "Who Should Consider an ARM?", paras: [
        "ARMs favor borrowers with a credible plan to exit before the first reset: sellers, refinancers, and buyers who expect income growth. If you keep a 5/1 ARM for exactly five years, you enjoyed the lower fixed rate and never faced adjustment risk. The danger is drift — staying past the reset with no refinancing plan — which this calculator makes concrete by quantifying the payment jump."
      ]},
      { h2: "ARM vs. Fixed-Rate: The Break-Even Thinking", paras: [
        "Compare the initial ARM payment to a 30-year fixed quote on the same balance. The monthly difference is your compensation for taking reset risk; multiplied over the months you expect to hold the loan, it should exceed the likely refinance closing costs if rates rise. Run both scenarios through our <a href=\"/calculator/mortgage-calculator\">Mortgage Calculator</a> and <a href=\"/calculator/arm-vs-fixed-rate-calculator\">ARM vs Fixed Rate Calculator</a> to see the trade-off numerically."
      ]},
      { h2: "Tips for Managing Reset Risk", list: [
        "<strong>Calendar the reset date:</strong> set a refinance decision point six months before the fixed period ends.",
        "<strong>Know your caps:</strong> ask for the per-adjustment and lifetime caps in writing — they define your payment ceiling.",
        "<strong>Watch the index:</strong> your future rate is index + margin; tracking the index forecasts your reset months early.",
        "<strong>Prepay during the fixed period:</strong> extra principal lowers the balance the reset payment is computed on, softening the jump."
      ]}
    ]
  },
  faqs: [
    { q: "What does a 5/1 or 7/6 ARM mean?", a: "The first number is the length of the fixed-rate period in years; the second is how often the rate adjusts afterward. A 5/6 ARM is fixed for five years, then adjusts every six months. During the fixed period your payment behaves exactly like a fixed-rate mortgage." },
    { q: "How is the payment calculated after the rate adjusts?", a: "The lender takes your outstanding balance at the reset, applies the new fully-indexed rate (index + margin), and recomputes the payment over the months remaining in the original term. This calculator performs that same computation so you can see the new payment before it happens." },
    { q: "What is the fully-indexed rate?", a: "It is the sum of the market index and your loan's margin. If SOFR is 4.5% and your margin is 2.75%, the fully-indexed rate is 7.25%. Most notes also state an initial rate cap that can limit the first adjustment below the fully-indexed rate." },
    { q: "Can I pay extra during the fixed period?", a: "Yes — extra principal reduces the balance that your post-reset payment is calculated from, which directly lowers the adjusted payment. Combined with the lower initial rate, prepaying during the fixed period is one of the most effective ways to blunt ARM risk." },
    { q: "Is an ARM ever cheaper overall?", a: "If you sell or refinance before the first reset, you simply pocket the rate savings and never experience the adjustment. Over that holding period the ARM is strictly cheaper than the fixed loan. The risk only materializes if you hold the loan through multiple rising adjustments." }
  ]
};
