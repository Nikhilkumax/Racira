// Batch 3 SEO content — TotalFactorProductivityCalculator (missing Breadcrumb + Reset too)
module.exports = {
  slug: "total-factor-productivity-calculator",
  title: "Total Factor Productivity Calculator",
  article: {
    intro: [
      "Total factor productivity (TFP) measures the part of output growth that <strong>cannot be explained by inputs</strong>. Capital and labor growth are counted separately; whatever growth remains — technology, know-how, organization, efficiency — is the TFP residual. If output grew 6% while capital contributed 2% and labor 2%, TFP accounts for the missing 2%. It is the standard measure of long-run productive efficiency in economics, sometimes called Solow's residual because Robert Solow showed it explains the majority of long-run growth in advanced economies."
    ],
    sections: [
      { h2: "The Formula Behind the Calculator", paras: [
        "The calculator uses growth accounting with a Cobb-Douglas production function: <strong>gTFP = gY − α·gK − (1−α)·gL</strong>, where gY is output growth, gK capital growth, gL labor growth, and α capital's income share (≈ 0.3–0.4 in most economies). The share weights matter because a dollar of capital and a dollar of labor are not interchangeable: the income share measures each factor's marginal contribution. All inputs are growth rates — plug in multi-year averages to smooth business-cycle noise, since a single boom year overstates both input-driven and residual growth."
      ]},
      { h2: "How to Interpret the TFP Residual", paras: [
        "Positive TFP growth means output is rising faster than inputs — the organization is producing more from the same resources: better technology, process improvement, reallocation of labor to higher-value work, or scale economies. Zero or negative TFP growth means growth is purely input-deepening — more machines and more hours — which hits diminishing returns and cannot sustain long-run gains. For a single firm, negative TFP often signals over-investment: capital growing faster than the revenue it supports. Sustained TFP growth above 1–2% per year is exceptional; that pace is what separates compounding economies from stagnating ones."
      ]},
      { h2: "TFP vs. Labor Productivity", paras: [
        "Labor productivity (output per worker) is the headline number, but it conflates two sources: workers with more capital are more productive without any efficiency gain. <strong>TFP strips out the capital contribution.</strong> A factory can double output per worker by giving each worker twice the equipment at zero TFP growth — impressive headline, no real efficiency gain. That's why economists compare TFP across firms and countries when the question is 'who actually produces smarter?' rather than 'who spends more?'. Use our <a href=\"/calculator/labor-productivity-calculator\">Labor Productivity Calculator</a> for the headline measure and this tool for the efficiency view."
      ]},
      { h2: "Practical Uses and Caveats", list: [
        "<strong>Firm benchmarking:</strong> compare TFP growth across divisions to find where process investment actually pays.",
        "<strong>Economy analysis:</strong> TFP is the core input to long-run growth forecasts and potential-output estimates.",
        "<strong>Investment screening:</strong> persistent negative TFP growth flags capital deepening outrunning returns.",
        "<strong>Caveat — measurement error:</strong> the residual absorbs everything unmeasured, including utilization, quality changes, and miscounted hours. Treat single-year movements skeptically.",
        "<strong>Caveat — α choice:</strong> results are sensitive to the capital share; test 0.3 and 0.4 before drawing conclusions."
      ]}
    ]
  },
  faqs: [
    { q: "What is total factor productivity in simple terms?", a: "It's the portion of output growth that isn't explained by adding more capital or labor — the efficiency and technology residual. If output grows 5% and inputs explain 4%, TFP growth is 1%." },
    { q: "How is TFP calculated?", a: "Via growth accounting: TFP growth = output growth − (capital share × capital growth) − (labor share × labor growth). This is the Solow residual from the Cobb-Douglas production function." },
    { q: "Why is TFP called a 'residual'?", a: "Because it's what remains after subtracting measured input contributions from output growth. Anything not captured by the inputs — technology, management quality, institutions, even measurement error — lands in the residual." },
    { q: "What is a good TFP growth rate?", a: "Sustained 1–2% per year is strong; that pace doubles efficiency roughly every 35–70 years. Many mature economies run near 0.5%. Negative TFP growth means inputs are growing faster than output." },
    { q: "What's the difference between TFP and labor productivity?", a: "Labor productivity is output per worker and rises when workers get more capital. TFP removes the capital-deepening effect, isolating pure efficiency — the fairer basis for comparing producers with different capital intensity." }
  ]
};
