// Batch 3 SEO content — TreasuryBillCalculator
module.exports = {
  slug: "treasury-bill-calculator",
  title: "Treasury Bill (T-Bill) Calculator",
  article: {
    intro: [
      "Treasury bills are the US government's short-term debt: you buy at a discount to face value, receive the full face value at maturity, and the discount is your entire return. Because a T-bill's quoted 'discount rate' understates the true yield — it applies to face value, not your purchase price, on a 360-day basis — this calculator converts the quote into the numbers that matter: purchase price, dollar return, bond-equivalent yield, and effective annual rate."
    ],
    sections: [
      { h2: "How the T-Bill Math Works", paras: [
        "<strong>Purchase price = face value × (1 − discount rate × days ÷ 360)</strong>. A $10,000 bill at a 5% discount rate for 91 days costs $9,873.61. The <strong>dollar return</strong> is face value minus price. But the true yield is higher than the discount rate because you invest the price, not the face value: the <strong>bond-equivalent yield</strong> = (return ÷ price) × (365 ÷ days) restates it on an investment basis over a 365-day year — the figure comparable to bond and CD yields."
      ]},
      { h2: "Discount Yield vs Bond-Equivalent Yield", paras: [
        "The discount rate quoted at auction uses bankers'-rule arithmetic: discount ÷ face × (360 ÷ days). It understates yield twice — the denominator is face value (larger than the price you pay), and the year is 360 days (shorter than 365). The bond-equivalent yield corrects both. On a 91-day bill at 5% discount, the true bond-equivalent yield is about 5.10%: small at short tenors, but material when comparing against CDs or money-market funds."
      ]},
      { h2: "Why Investors Use T-Bills", paras: [
        "T-bills are the cleanest risk-free asset: sovereign credit, maturities from 4 to 52 weeks, deep liquidity, and exemption from state and local income tax — a real advantage in high-tax states. They anchor cash management (treasury ladders), park money between trades, and serve as the risk-free rate in valuation. Laddering bills of staggered maturities converts a single low rate into steady liquidity at near-top yields."
      ]},
      { h2: "Reading the Results", list: [
        "<strong>Purchase Price:</strong> what you pay per $10,000 face — your actual invested amount.",
        "<strong>Dollar Return:</strong> the discount in dollars, your total profit at maturity.",
        "<strong>Bond-Equivalent Yield:</strong> the annualized, comparable return — use this against CDs and bonds.",
        "<strong>Effective Annual Rate:</strong> the compounded equivalent, for comparing against APY-quoted products. For CD alternatives see our <a href=\"/calculator/cd-calculator\">CD Calculator</a>."
      ]}
    ]
  },
  faqs: [
    { q: "How do you calculate a Treasury bill's price?", a: "Price = face value × (1 − discount rate × days to maturity ÷ 360). A $10,000 bill at 5% discount for 91 days costs about $9,873.61 and returns $126.39 at maturity." },
    { q: "Why is the bond-equivalent yield higher than the discount rate?", a: "The discount rate divides by face value and uses a 360-day year, both of which understate return. The bond-equivalent yield divides by your actual purchase price over 365 days — the correct basis for comparing with other investments." },
    { q: "Are T-bill returns taxable?", a: "Interest is federally taxable but exempt from state and local income tax — a meaningful edge for investors in high-tax states. TreasuryDirect reports the interest on Form 1099-INT for the year of maturity." },
    { q: "What T-bill maturities are available?", a: "4, 8, 13, 17, 26, and 52 weeks are auctioned on a regular schedule. You can buy at auction via TreasuryDirect with a $100 minimum, or on the secondary market through any broker." },
    { q: "How do I compare a T-bill to a CD or savings account?", a: "Convert everything to the same basis: T-bills should be compared on bond-equivalent yield, CDs on APY, remembering the state-tax exemption tilts the comparison toward T-bills. This calculator computes both bases directly." }
  ]
};
