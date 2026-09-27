// Batch 3 SEO content — PriceToBookRatioCalculator
module.exports = {
  slug: "price-to-book-ratio-calculator",
  title: "Price-to-Book (P/B) Ratio Calculator",
  article: {
    intro: [
      "The price-to-book ratio compares what the market charges for a stock to the accounting value of the company's net assets: <strong>P/B = market price per share ÷ book value per share</strong>. Below 1.0, the market values the company at less than the accounting worth of its assets — the classic deep-value signal. Above 3–4, investors are paying for growth and returns the balance sheet can't show. This calculator computes the ratio instantly and frames what the number implies."
    ],
    sections: [
      { h2: "How the P/B Ratio Is Calculated", paras: [
        "Book value per share equals <strong>(total assets − total liabilities) ÷ shares outstanding</strong> — the equity shareholders would theoretically receive if the company were liquidated at accounting values. Dividing the market price by this figure yields the ratio. A $45 stock with $30 of book value per share trades at 1.5× book: investors pay $1.50 for each dollar of net assets, implying expectations of returns above book."
      ]},
      { h2: "When P/B Is Most (and Least) Useful", paras: [
        "<strong>P/B shines for asset-heavy businesses</strong> — banks, insurers, utilities, industrials — where the balance sheet drives economics and book values track fair value reasonably. It is nearly meaningless for <strong>asset-light businesses</strong>: software, brands, and platforms create value through intangibles (code, trademarks, network effects) that accounting rules either expense or omit, making book value artificially small and P/B artificially large. Comparing P/B across those two worlds is comparing different currencies."
      ]},
      { h2: "P/B Paired with ROE", paras: [
        "The justified P/B is a function of profitability: <strong>P/B ≈ (ROE − g) ÷ (r − g)</strong>. A bank earning 15% ROE sustainably deserves a premium to book; one earning 6% does not. So screen in two dimensions — a low P/B with high ROE is a genuine bargain candidate, while a low P/B with low ROE is simply a cheaply-priced mediocre business. Value investors pair this calculator with the <a href=\"/calculator/return-on-equity-calculator\">ROE Calculator</a> for exactly this reason."
      ]},
      { h2: "Interpreting the Number", list: [
        "<strong>Below 1.0:</strong> potential value territory — or the market pricing asset impairment or weak returns; investigate ROE and asset quality.",
        "<strong>1.0–3.0:</strong> the normal band for asset-heavy sectors; compare within industry.",
        "<strong>Above 3.0:</strong> priced for growth and intangibles; sanity-check with earnings-based multiples.",
        "<strong>Negative book value:</strong> the ratio is undefined — buybacks and losses can drive equity negative; treat with extreme care."
      ]}
    ]
  },
  faqs: [
    { q: "What is the price-to-book ratio?", a: "A valuation multiple comparing market price per share to book value per share — the accounting value of net assets. It answers whether you are paying a premium or discount to the company's stated net worth." },
    { q: "What is a good P/B ratio?", a: "There is no universal number: banks often trade at 0.8–1.5× book, while software companies routinely exceed 5×. The ratio is meaningful within a sector and alongside ROE — a low P/B is attractive only if returns on that book are adequate." },
    { q: "Why is P/B less useful for tech companies?", a: "Accounting rules force intangible investments — R&D, code, brand-building — to be expensed rather than capitalized, understating book value. The market prices those intangibles, so tech P/B ratios run high without implying overvaluation." },
    { q: "Can book value per share be negative?", a: "Yes — sustained losses or aggressive buybacks can drive shareholders' equity below zero. The P/B ratio is then meaningless, and the situation itself is a serious red flag requiring separate analysis." },
    { q: "How does P/B relate to ROE?", a: "Sustainably, P/B should track ROE: businesses earning more on equity deserve a higher multiple of that equity. Screening for low P/B with high ROE isolates genuinely cheap asset-productive companies rather than cheaply-priced weak ones." }
  ]
};
