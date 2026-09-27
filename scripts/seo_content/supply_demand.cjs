// Batch 3 SEO content — SupplyAndDemandEquilibriumPriceCalculator
module.exports = {
  slug: "supply-and-demand-equilibrium-price-calculator",
  title: "Supply and Demand Equilibrium Price Calculator",
  article: {
    intro: [
      "The equilibrium price is where the market clears: the point where the quantity consumers demand exactly equals the quantity producers supply. Using linear demand (P = a − b·Q) and supply (P = c + d·Q) curves, this calculator solves for that intersection — the equilibrium price and quantity — and shows the consumer and producer surplus each side captures at the clearing point."
    ],
    sections: [
      { h2: "How the Equilibrium Is Calculated", paras: [
        "Set demand equal to supply: <strong>a − b·Q = c + d·Q</strong>. Solving gives <strong>Q* = (a − c) ÷ (b + d)</strong> and <strong>P* = a − b·Q*</strong>. The intercepts carry the intuition: a higher demand intercept (a) shifts willingness-to-pay up and raises both equilibrium price and quantity; a higher supply intercept (c) — costlier production — raises price and lowers quantity. The slopes control how strongly each side responds to price."
      ]},
      { h2: "Consumer and Producer Surplus", paras: [
        "At equilibrium, <strong>consumer surplus</strong> is the triangle between the demand curve and the price line — value buyers captured because the market price undershot what they were willing to pay. <strong>Producer surplus</strong> is the mirror triangle above the supply curve — profit-like value sellers captured because price exceeded their marginal cost. The sum, total surplus, is maximized exactly at equilibrium: that is the formal meaning of 'markets are efficient.'"
      ]},
      { h2: "What Happens When Price Is Away from Equilibrium", paras: [
        "Above equilibrium, quantity supplied exceeds quantity demanded — a <strong>surplus</strong> that pressures sellers to cut prices. Below it, demand outstrips supply — a <strong>shortage</strong> that bids prices up. Both forces push the market toward the clearing point, which is why price controls that hold price away from equilibrium (rent caps, price floors) produce persistent shortages or surpluses rather than balance."
      ]},
      { h2: "Practical Uses of the Model", list: [
        "<strong>Market entry analysis:</strong> estimate the clearing price before committing capacity — pair with our <a href=\"/calculator/break-even-calculator\">Break-Even Calculator</a>.",
        "<strong>Pricing strategy:</strong> the demand intercept is your customers' ceiling of willingness to pay; anchor premium pricing below it.",
        "<strong>Policy evaluation:</strong> model how a tax or subsidy shifts the supply intercept and re-solve for the new equilibrium.",
        "<strong>Teaching and forecasting:</strong> the linear model is the standard first approximation for any shock analysis."
      ]}
    ]
  },
  faqs: [
    { q: "What is equilibrium price?", a: "The price at which quantity demanded equals quantity supplied — the market clears with neither shortage nor surplus. Graphically it is the intersection of the demand and supply curves." },
    { q: "How do I find the equilibrium price and quantity?", a: "With linear curves, set a − b·Q = c + d·Q and solve: Q* = (a − c)/(b + d), then substitute back to get P* = a − b·Q*. This calculator performs the solve and adds the surplus decomposition." },
    { q: "What do the demand and supply intercepts mean?", a: "The demand intercept (a) is the maximum price any consumer will pay — the choke price. The supply intercept (c) is the minimum price at which any producer will supply — effectively marginal cost at Q = 0." },
    { q: "What causes the equilibrium price to change?", a: "Any shift in the curves: higher demand (rising a) raises both price and quantity; higher production costs (rising c) raise price and cut quantity. Price changes from curve shifts move the market to a new equilibrium rather than creating shortage." },
    { q: "What are consumer and producer surplus?", a: "Consumer surplus is the gap between what buyers were willing to pay and the market price; producer surplus is the gap between the market price and sellers' marginal cost. Together they measure total welfare, maximized at equilibrium." }
  ]
};
