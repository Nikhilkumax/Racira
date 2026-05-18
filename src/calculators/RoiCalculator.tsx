"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const ROICalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [finalValue, setFinalValue] = useState("15000");
  const [years, setYears] = useState("3");
  const [additionalCosts, setAdditionalCosts] = useState("0");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    roi: number; netProfit: number; annualizedROI: number; totalReturn: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const initial = parseFloat(initialInvestment) || 0;
    const final_ = parseFloat(finalValue) || 0;
    const yrs = parseFloat(years) || 1;
    const costs = parseFloat(additionalCosts) || 0;
    if (initial <= 0) return;

    const totalCost = initial + costs;
    const netProfit = final_ - totalCost;
    const roi = (netProfit / totalCost) * 100;
    const annualizedROI = (Math.pow(final_ / totalCost, 1 / yrs) - 1) * 100;

    setResult({
      roi: Math.round(roi * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      annualizedROI: Math.round(annualizedROI * 100) / 100,
      totalReturn: Math.round((final_ / totalCost) * 10000) / 100,
    });
  };

  const reset = () => {
    setShowResults(false); setInitialInvestment("10000"); setFinalValue("15000"); setYears("3"); setAdditionalCosts("0"); setResult(null); };

  const faqs = [
    { question: "What is ROI?", answer: "Return on Investment (ROI) measures the gain or loss generated on an investment relative to its cost. It is expressed as a percentage: ROI = (Net Profit ÷ Total Cost) × 100." },
    { question: "What is annualized ROI?", answer: "Annualized ROI converts the total ROI into a per-year rate, allowing fair comparison between investments held for different periods. It uses the formula: (Final/Cost)^(1/years) − 1." },
    { question: "What is a good ROI?", answer: "It depends on the investment type. The S&P 500 averages ~10% annually. Real estate averages 8-12%. A 'good' ROI exceeds the risk-free rate (treasury bonds ~4-5%) by a meaningful margin for the risk taken." },
    { question: "Does ROI account for risk?", answer: "No. ROI is a simple return metric that doesn't factor in risk, volatility, or opportunity cost. Risk-adjusted metrics like Sharpe Ratio or Sortino Ratio are better for comparing investments with different risk profiles." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "ROI Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">ROI Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate Return on Investment, net profit, and annualized returns.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="initialInvestment" label="Initial Investment" value={initialInvestment} onChange={setInitialInvestment} prefix="$" tooltip="Amount initially invested" />
                <InputField id="finalValue" label="Final Value" value={finalValue} onChange={setFinalValue} prefix="$" tooltip="Current or exit value of investment" />
                <InputField id="years" label="Investment Period" value={years} onChange={setYears} suffix="years" tooltip="How long the investment was held" />
                <InputField id="additionalCosts" label="Additional Costs" value={additionalCosts} onChange={setAdditionalCosts} prefix="$" tooltip="Fees, commissions, maintenance, etc." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate ROI</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Investment Returns</h2>
                <ResultDisplay items={[
                  { label: "Total ROI", value: 0, textValue: `${result.roi}%`, highlight: true },
                  { label: "Annualized ROI", value: 0, textValue: `${result.annualizedROI}%`, highlight: true },
                  { label: "Net Profit", value: result.netProfit },
                  { label: "Total Return Multiple", value: 0, textValue: `${result.totalReturn}%` },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is ROI?</h2>
              <p>Return on Investment (ROI) is one of the most widely used financial metrics for evaluating the profitability of an investment. It measures the percentage return generated relative to the amount invested, providing a simple way to compare different investment opportunities.</p>

              <h2>ROI Formulas</h2>
              <ul>
                <li><strong>Simple ROI = (Net Profit ÷ Total Cost) × 100</strong></li>
                <li><strong>Annualized ROI = (Final Value ÷ Total Cost)^(1/years) − 1</strong></li>
                <li><strong>Net Profit = Final Value − Initial Investment − Additional Costs</strong></li>
              </ul>

              <h2>ROI Examples</h2>
              <p><strong>Stock investment:</strong> Buy $10,000 of stock, sell for $15,000 after 3 years. ROI = 50%, Annualized ROI = 14.5%.</p>
              <p><strong>Real estate:</strong> Buy property for $200,000, sell for $280,000 after 5 years with $10,000 in costs. ROI = 33.3%, Annualized ROI = 5.9%.</p>
              <p><strong>Business:</strong> Invest $50,000 in marketing, generate $120,000 in revenue. ROI = 140%.</p>

              <h2>Why Annualized ROI Matters</h2>
              <p>Simple ROI doesn't account for time. A 50% return over 1 year is much better than 50% over 10 years. Annualized ROI normalizes returns to a per-year rate, enabling fair comparisons. For example:</p>
              <ul>
                <li>Investment A: 100% ROI over 5 years = 14.9% annualized</li>
                <li>Investment B: 60% ROI over 2 years = 26.5% annualized</li>
                <li>Investment B is actually the better performer despite lower total ROI</li>
              </ul>

              <h2>Limitations of ROI</h2>
              <ul>
                <li>Doesn't account for risk — a 20% return in bonds vs. crypto means very different things</li>
                <li>Ignores cash flow timing — when you receive returns matters</li>
                <li>Doesn't consider opportunity cost — what else you could have invested in</li>
                <li>Can be manipulated by excluding certain costs</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> ROI is a simplified metric. Past returns don't guarantee future performance. Consider risk-adjusted returns and consult a financial advisor for investment decisions.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roi-calculator" />
            <PopularCalculators exclude="/roi-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ROICalculator;


