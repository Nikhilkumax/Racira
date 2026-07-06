"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function SharpeRatioCalculator() {
  const [portfolioReturn, setPortfolioReturn] = useState("12");
  const [riskFreeRate, setRiskFreeRate] = useState("4.5");
  const [stdDev, setStdDev] = useState("15");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ sharpe: 0, excessReturn: 0, interpretation: "" });

  const handleCalculate = () => {
    const rp = parseFloat(portfolioReturn) || 0;
    const rf = parseFloat(riskFreeRate) || 0;
    const sd = parseFloat(stdDev) || 0;
    if (sd === 0) return;
    const excess = rp - rf;
    const sharpe = excess / sd;
    let interpretation = "";
    if (sharpe < 0) interpretation = "Negative — Underperforming risk-free rate";
    else if (sharpe < 1) interpretation = "Poor — Below acceptable risk-adjusted return";
    else if (sharpe < 2) interpretation = "Good — Acceptable risk-adjusted return";
    else if (sharpe < 3) interpretation = "Very Good — Strong risk-adjusted performance";
    else interpretation = "Excellent — Exceptional risk-adjusted return";
    setResults({ sharpe, excessReturn: excess, interpretation });
    setShowResults(true);
  };

  const reset = () => { setPortfolioReturn("12"); setRiskFreeRate("4.5"); setStdDev("15"); setShowResults(false); };

  const faqs = [
    { question: "What is the Sharpe Ratio?", answer: "The Sharpe Ratio measures risk-adjusted return by calculating how much excess return you receive for each unit of volatility (risk) taken. Higher is better." },
    { question: "What is a good Sharpe Ratio?", answer: "A Sharpe Ratio above 1.0 is generally considered acceptable, above 2.0 is very good, and above 3.0 is excellent. Below 1.0 means the risk may not be worth the return." },
    { question: "What is the risk-free rate?", answer: "The risk-free rate represents the return of a theoretically zero-risk investment, typically the yield of short-term U.S. Treasury bills or the 10-year Treasury bond." },
    { question: "What does standard deviation measure in this context?", answer: "Standard deviation measures the variability (volatility) of portfolio returns. A higher standard deviation means wider swings in value, indicating more risk." },
    { question: "What is the difference between Sharpe Ratio and Sortino Ratio?", answer: "The Sortino Ratio is similar to Sharpe but only penalizes downside volatility (negative deviations), not upside. It is considered more refined for evaluating portfolio performance." },
    { question: "What is the Treynor Ratio?", answer: "The Treynor Ratio is similar to Sharpe but uses portfolio beta (market risk) instead of total standard deviation. It's more appropriate for comparing diversified portfolios to the market." },
    { question: "Can the Sharpe Ratio be manipulated?", answer: "Yes. Strategies with option selling, smoothed returns, or infrequent valuations can artificially inflate the Sharpe Ratio. It should never be the sole metric for evaluating a fund or portfolio." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sharpe Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sharpe Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="portfolio-return" label="Portfolio Return (%)" value={portfolioReturn} onChange={setPortfolioReturn} suffix="%" tooltip="The total annual return of your portfolio or investment." />
                <InputField id="risk-free-rate" label="Risk-Free Rate (%)" value={riskFreeRate} onChange={setRiskFreeRate} suffix="%" tooltip="Typically the yield on 3-month T-bills or 10-year Treasury bonds." />
                <InputField id="std-dev" label="Standard Deviation (%)" value={stdDev} onChange={setStdDev} suffix="%" tooltip="The annualized standard deviation of portfolio returns — a measure of volatility." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">Risk-Adjusted Performance</h2>
                <ResultDisplay items={[
                  { label: "Sharpe Ratio", value: 0, textValue: results.sharpe.toFixed(3), highlight: true },
                  { label: "Excess Return (Return – Risk-Free)", value: 0, textValue: `${results.excessReturn.toFixed(2)}%`, highlight: true },
                  { label: "Interpretation", value: 0, textValue: results.interpretation },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding the Sharpe Ratio</h2>
              <p>The Sharpe Ratio, developed by Nobel laureate William F. Sharpe in 1966, is the most widely used metric for measuring risk-adjusted investment performance. Its central insight is that return alone is a meaningless number — what matters is return per unit of risk taken. A portfolio returning 15% with enormous volatility may be inferior to one returning 12% with much lower volatility, once risk is properly accounted for.</p>
              <h2 className="text-2xl font-bold mb-3">The Sharpe Ratio Formula</h2>
              <p><strong>Sharpe Ratio = (Portfolio Return – Risk-Free Rate) ÷ Standard Deviation of Portfolio Returns</strong>. The numerator (excess return or "risk premium") measures how much the portfolio outperforms a riskless asset like Treasury bills. The denominator (standard deviation) measures the total volatility of returns — both up and down swings.</p>
              <h2 className="text-2xl font-bold mb-3">Interpreting the Sharpe Ratio</h2>
              <p>The higher the Sharpe Ratio, the better the risk-adjusted return:</p>
              <ul>
                <li><strong>Below 0:</strong> The portfolio underperforms the risk-free rate — you'd be better off in Treasury bills.</li>
                <li><strong>0 to 1:</strong> Poor — you're not being adequately compensated for the risk you're taking.</li>
                <li><strong>1 to 2:</strong> Good — a solid risk-adjusted return that's acceptable for most investors.</li>
                <li><strong>2 to 3:</strong> Very Good — strong risk-adjusted performance, typical of top-quartile funds.</li>
                <li><strong>Above 3:</strong> Excellent — exceptional performance, though it should be verified for data integrity.</li>
              </ul>
              <h2 className="text-2xl font-bold mb-3">The Role of the Risk-Free Rate</h2>
              <p>The risk-free rate is a critical input because it defines the "baseline" return you can earn without taking any investment risk. In the United States, this is typically the yield on 3-month Treasury bills or 10-year Treasury bonds. As interest rates rise, the bar for earning a positive Sharpe Ratio also rises, which is why many hedge funds and funds struggle in high-rate environments.</p>
              <h2 className="text-2xl font-bold mb-3">Limitations of the Sharpe Ratio</h2>
              <p>The Sharpe Ratio assumes that investment returns follow a normal distribution (a bell curve). In reality, financial returns often exhibit "fat tails" — extreme events occur more frequently than a normal distribution predicts. This limitation makes the Sharpe Ratio less reliable for strategies with non-linear payoffs, such as options selling, where returns appear stable until a catastrophic loss occurs.</p>
              <h2 className="text-2xl font-bold mb-3">Sharpe vs. Sortino vs. Calmar Ratios</h2>
              <p>Several ratios build on the Sharpe Ratio concept. The <strong>Sortino Ratio</strong> only penalizes downside volatility, rewarding upside volatility. The <strong>Calmar Ratio</strong> uses maximum drawdown instead of standard deviation. The <strong>Information Ratio</strong> compares a portfolio to a benchmark rather than the risk-free rate. Each metric highlights different aspects of risk-adjusted performance.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sharpe-ratio-calculator" />
          <PopularCalculators exclude="/calculator/sharpe-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
