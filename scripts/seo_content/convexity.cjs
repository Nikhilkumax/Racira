// Batch 3 SEO content — ConvexityCalculator (already has FAQ h3s; FAQ adds pageUrl-worthy Qs)
module.exports = {
  slug: "convexity-calculator",
  title: "Convexity Calculator",
  article: {
    intro: [
      "Duration tells you a bond's first-order price sensitivity to interest-rate changes; <strong>convexity captures the second-order effect</strong> — the curvature that makes the linear duration estimate increasingly wrong as rate moves get large. This calculator estimates a bond's convexity from its cash-flow profile and shows the curvature-corrected price change, which is materially more accurate for big rate swings."
    ],
    sections: [
      { h2: "Why Duration Alone Underestimates Gains and Overestimates Losses", paras: [
        "The duration approximation is a tangent line to the true price-yield curve. Because the curve is convex (bends upward), the line always sits <strong>below</strong> the curve: when yields fall, actual prices rise more than duration predicts, and when yields rise, they fall less. Convexity quantifies that gap. The corrected estimate adds the convexity term: ΔP/P ≈ −D·Δy + ½·C·(Δy)². For a 200bp move on a 10-year bond, ignoring convexity can misstate the price change by a full percentage point or more."
      ]},
      { h2: "What Drives Convexity", paras: [
        "Convexity grows with <strong>maturity</strong> (cash flows pushed further out have more curvature), rises when the <strong>coupon is lower</strong> (a zero has the most), and depends on the <strong>yield level</strong> — lower yields magnify curvature. Callable bonds bend the other way: negative convexity, where price appreciation is capped because the issuer will refinance. If a bond behaves worse than duration suggests in rallies and better in selloffs, you're holding negative convexity and should price it accordingly."
      ]},
      { h2: "Using Convexity in Portfolio Decisions", list: [
        "<strong>Compare candidates:</strong> two bonds with equal duration are not equal risk — the higher-convexity one outperforms in volatile-rate environments (usually at a lower yield).",
        "<strong>Size hedges:</strong> a duration hedge sized without convexity under-hedges big moves; add the ½·C·(Δy)² term.",
        "<strong>Scrutinize callables:</strong> negative convexity means the 'cheap yield' compensates for exactly the scenario hedging is for.",
        "<strong>Pair with duration:</strong> run our <a href=\"/calculator/macos-duration-calculator\">Macaulay Duration Calculator</a> for the first-order term, then apply the correction here."
      ]}
    ]
  },
  faqs: [
    { q: "What is convexity in simple terms?", a: "It measures how much a bond's duration itself changes as yields move — the curvature of the price-yield relationship. Positive convexity means price rises faster when yields fall than it drops when yields rise." },
    { q: "How is convexity calculated?", a: "It is the second derivative of price with respect to yield, divided by price: the weighted average of t·(t+1) across cash flows, discounted and scaled. This calculator uses the standard closed-form estimate from coupon, yield, and maturity." },
    { q: "Why do callable bonds have negative convexity?", a: "When rates fall far enough, the issuer calls the bond, capping its price near the call price. Price gains stop accelerating — and can reverse — so the price-yield curve bends away from the investor. The extra yield is compensation for this." },
    { q: "When does convexity matter most?", a: "For large yield moves and long-maturity, low-coupon bonds. A 25bp move on a 2-year note — duration is plenty. A 200bp move on a 30-year zero — convexity changes the answer by percentage points." },
    { q: "What's the difference between duration and convexity?", a: "Duration is the first derivative — the slope of the price-yield curve. Convexity is the second derivative — how that slope itself changes. Together they give a much better price estimate for any non-trivial rate move." }
  ]
};
