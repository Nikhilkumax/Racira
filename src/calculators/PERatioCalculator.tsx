"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function PERatioCalculator() {
  const [stockPrice, setStockPrice] = useState("150");
  const [eps, setEps] = useState("5.50");
  const [industryAvg, setIndustryAvg] = useState("20");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ peRatio: 0, vsIndustry: 0, earningsYield: 0, valuation: "" });

  const handleCalculate = () => {
    const price = parseFloat(stockPrice) || 0;
    const e = parseFloat(eps) || 0;
    const avg = parseFloat(industryAvg) || 0;
    if (e === 0) return;
    const pe = price / e;
    const diff = avg > 0 ? ((pe - avg) / avg) * 100 : 0;
    const yieldValue = (1 / pe) * 100;
    let valuation = "Fairly Valued";
    if (pe < avg * 0.8) valuation = "Potentially Undervalued";
    else if (pe > avg * 1.2) valuation = "Potentially Overvalued";
    setResults({ peRatio: pe, vsIndustry: diff, earningsYield: yieldValue, valuation });
    setShowResults(true);
  };

  const reset = () => { setStockPrice("150"); setEps("5.50"); setIndustryAvg("20"); setShowResults(false); };

  const faqs = [
    { question: "What is the P/E ratio?", answer: "The Price-to-Earnings (P/E) ratio compares a company's share price to its EPS. A P/E of 20 means investors pay $20 for every $1 of annual profit." },
    { question: "What is a good P/E ratio?", answer: "It depends on the industry. Generally, below 15 is value territory, 15-25 is moderate, above 25 indicates growth expectations. Always compare to industry peers." },
    { question: "What is Earnings Yield?", answer: "Earnings Yield is the inverse of P/E: (EPS / Price) × 100. A higher earnings yield is generally more attractive and can be compared to bond yields." },
    { question: "Can a P/E ratio be negative?", answer: "Yes. If a company reports a net loss (negative EPS), the P/E becomes negative and meaningless. Analysts use Price-to-Sales or other metrics for such companies." },
    { question: "What is the difference between Trailing and Forward P/E?", answer: "Trailing P/E uses actual past 12-month earnings. Forward P/E uses analyst estimates for the next 12 months. Forward P/E is forward-looking but less certain." },
    { question: "What is the Shiller P/E (CAPE ratio)?", answer: "The CAPE ratio uses 10-year average inflation-adjusted earnings to smooth business cycles. It is used to gauge overall market valuation levels historically." },
    { question: "Why do tech stocks have higher P/E ratios?", answer: "Tech stocks command high P/E ratios because investors price in strong future earnings growth, willing to pay a premium today for expected profit expansion tomorrow." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "P/E Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">P/E Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="stock-price" label="Stock Price" value={stockPrice} onChange={setStockPrice} prefix="$" tooltip="Current market price of one share." />
                <InputField id="eps" label="Earnings Per Share (EPS)" value={eps} onChange={setEps} prefix="$" tooltip="Annual net earnings divided by shares outstanding." />
                <InputField id="industry-avg" label="Industry Avg P/E" value={industryAvg} onChange={setIndustryAvg} tooltip="Average P/E for the company's industry sector." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">Valuation Results</h2>
                <ResultDisplay items={[
                  { label: "P/E Ratio", value: 0, textValue: results.peRatio.toFixed(2), highlight: true },
                  { label: "Earnings Yield", value: 0, textValue: `${results.earningsYield.toFixed(2)}%`, highlight: true },
                  { label: "vs. Industry Average", value: 0, textValue: `${results.vsIndustry > 0 ? "+" : ""}${results.vsIndustry.toFixed(1)}%` },
                  { label: "Valuation Signal", value: 0, textValue: results.valuation },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding the Price-to-Earnings (P/E) Ratio</h2>
              <p>The Price-to-Earnings (P/E) ratio is the most widely used valuation metric in stock market investing. It answers the fundamental question: "How much am I paying for each dollar of this company's earnings?" A P/E of 20 means investors pay $20 for every $1 of annual profit the company generates.</p>
              <h2>The P/E Ratio Formula</h2>
              <p><strong>P/E Ratio = Share Price ÷ Earnings Per Share (EPS)</strong>. For example, if a stock trades at $100 and its annual EPS is $5, the P/E is 20. EPS can be trailing (last 12 months actual) or forward (next 12 months estimated).</p>
              <h2>How to Interpret the P/E Ratio</h2>
              <p>Context is everything. A P/E of 30 might be reasonable for a high-growth technology company doubling revenue annually, but expensive for a mature utility. Compare P/E to the company's own history, direct competitors, and industry sector averages.</p>
              <ul>
                <li><strong>Low P/E (below 15):</strong> May indicate undervaluation or declining earnings expectations.</li>
                <li><strong>Moderate P/E (15–25):</strong> Generally fair value for established businesses.</li>
                <li><strong>High P/E (above 25):</strong> Indicates high growth expectations — the stock must grow into its valuation.</li>
                <li><strong>Negative P/E:</strong> Company is loss-making; P/E analysis doesn't apply.</li>
              </ul>
              <h2>The Earnings Yield</h2>
              <p>Earnings Yield = (EPS / Price) × 100. A P/E of 20 means a 5% earnings yield. This enables direct comparison to bond yields. If a Treasury bond yields 4.5% and a stock yields 5%, the equity risk premium is modest.</p>
              <h2>The PEG Ratio</h2>
              <p>PEG Ratio = P/E ÷ Earnings Growth Rate. A PEG below 1.0 is often considered undervalued. This metric accounts for the fact that faster-growing companies deserve higher P/E multiples.</p>
              <h2>Limitations of the P/E Ratio</h2>
              <p>The P/E ratio doesn't account for debt, cash flows, or accounting differences between companies. Always combine P/E analysis with Price-to-Book, EV/EBITDA, and Free Cash Flow yield for a complete valuation picture.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pe-ratio-calculator" />
          <PopularCalculators exclude="/calculator/pe-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
