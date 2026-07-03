"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function DcfCalculator() {
  const [cashFlow, setCashFlow] = useState("1000000");
  const [growthRate, setGrowthRate] = useState("15");
  const [terminalGrowth, setTerminalGrowth] = useState("3");
  const [discountRate, setDiscountRate] = useState("10");
  const [shares, setShares] = useState("1000000");
  const [currentPrice, setCurrentPrice] = useState("50");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ intrinsicValue: 0, totalDcf: 0, marginOfSafety: 0, upside: 0 });

  const handleCalculate = () => {
    const cf = parseFloat(cashFlow) || 0;
    const g = (parseFloat(growthRate) || 0) / 100;
    const tg = (parseFloat(terminalGrowth) || 0) / 100;
    const r = (parseFloat(discountRate) || 0) / 100;
    const sh = parseFloat(shares) || 1;
    const cp = parseFloat(currentPrice) || 0;
    if (r <= tg) return;

    let totalPV = 0;
    let projCF = cf;
    for (let i = 1; i <= 5; i++) {
      projCF = projCF * (1 + g);
      totalPV += projCF / Math.pow(1 + r, i);
    }
    const terminalValue = (projCF * (1 + tg)) / (r - tg);
    const pvTerminal = terminalValue / Math.pow(1 + r, 5);
    const totalDcf = totalPV + pvTerminal;
    const intrinsicValue = totalDcf / sh;
    const marginOfSafety = cp > 0 ? ((intrinsicValue - cp) / intrinsicValue) * 100 : 0;
    const upside = cp > 0 ? ((intrinsicValue - cp) / cp) * 100 : 0;

    setResults({ intrinsicValue, totalDcf, marginOfSafety, upside });
    setShowResults(true);
  };

  const reset = () => {
    setCashFlow("1000000"); setGrowthRate("15"); setTerminalGrowth("3");
    setDiscountRate("10"); setShares("1000000"); setCurrentPrice("50"); setShowResults(false);
  };

  const faqs = [
    { question: "What is DCF analysis?", answer: "Discounted Cash Flow (DCF) analysis values an investment based on its expected future cash flows, discounted back to present value using a required rate of return (discount rate)." },
    { question: "What discount rate should I use?", answer: "The discount rate is typically the Weighted Average Cost of Capital (WACC), representing the blended cost of equity and debt financing. It commonly ranges from 8% to 12% for stable companies." },
    { question: "What is terminal value?", answer: "Terminal value captures the value of all cash flows beyond the explicit forecast period (5 years in this calculator). It typically represents 60-80% of total DCF value and is calculated using the Gordon Growth Model." },
    { question: "What is margin of safety?", answer: "Margin of safety is the discount to intrinsic value at which you buy a stock. Popularized by Benjamin Graham, buying below intrinsic value provides a buffer against errors in your growth assumptions." },
    { question: "Why does DCF require assumptions about the future?", answer: "DCF requires projecting future cash flows, growth rates, and discount rates — all of which are uncertain. Small changes in assumptions can dramatically change the output, which is why DCF should be combined with comparative and asset-based valuations." },
    { question: "What is WACC?", answer: "Weighted Average Cost of Capital (WACC) is the average rate a company is expected to pay to finance its assets, weighted by the proportion of equity and debt in its capital structure." },
    { question: "Can DCF be used for growth stocks with no profits?", answer: "DCF can technically be applied to any asset with future cash flows, but it requires projecting when the company will become profitable. It is inherently more speculative for pre-profit growth companies." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "DCF Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Discounted Cash Flow (DCF) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="cash-flow" label="Current Annual Free Cash Flow ($)" value={cashFlow} onChange={setCashFlow} prefix="$" tooltip="The company's most recent annual free cash flow." />
                <InputField id="growth-rate" label="Growth Rate (Years 1-5, %)" value={growthRate} onChange={setGrowthRate} suffix="%" tooltip="Expected annual growth in free cash flow over 5 years." />
                <InputField id="terminal-growth" label="Terminal Growth Rate (%)" value={terminalGrowth} onChange={setTerminalGrowth} suffix="%" tooltip="Long-term perpetual growth rate (typically 2-4%, near GDP growth)." />
                <InputField id="discount-rate" label="Discount Rate / WACC (%)" value={discountRate} onChange={setDiscountRate} suffix="%" tooltip="Required rate of return — must be higher than terminal growth rate." />
                <InputField id="shares" label="Shares Outstanding" value={shares} onChange={setShares} tooltip="Total number of company shares outstanding." />
                <InputField id="current-price" label="Current Stock Price ($)" value={currentPrice} onChange={setCurrentPrice} prefix="$" tooltip="Current market price to calculate margin of safety." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">DCF Valuation Results</h2>
                <ResultDisplay items={[
                  { label: "Intrinsic Value Per Share", value: results.intrinsicValue, highlight: true },
                  { label: "Total DCF Value", value: results.totalDcf, highlight: true },
                  { label: "Upside from Current Price", value: 0, textValue: `${results.upside.toFixed(1)}%` },
                  { label: "Margin of Safety", value: 0, textValue: `${results.marginOfSafety.toFixed(1)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is Discounted Cash Flow Analysis?</h2>
              <p>Discounted Cash Flow (DCF) analysis is a fundamental valuation method used by institutional investors, Warren Buffett, and corporate finance professionals worldwide. The core premise is simple but powerful: a dollar today is worth more than a dollar tomorrow. By projecting a company's future cash flows and discounting them back to today's dollars, we can determine what a business is intrinsically worth — independent of what the market currently prices it at.</p>
              <h2>How the DCF Model Works</h2>
              <p>The DCF model works in two phases: an explicit forecast period (typically 5-10 years) and a terminal value that captures all cash flows beyond the forecast period. For each year in the forecast period, we project free cash flow by applying a growth rate to the prior year's cash flow. Then we discount each year's cash flow back to today using the discount rate formula: <strong>PV = CF ÷ (1 + r)^n</strong>.</p>
              <h2>Understanding Terminal Value</h2>
              <p>Terminal value represents the bulk of a company's value in most DCF models — often 60-80% of the total. It's calculated using the Gordon Growth Model: <strong>Terminal Value = (Final Year CF × (1 + Terminal Growth Rate)) ÷ (Discount Rate – Terminal Growth Rate)</strong>. The terminal growth rate should be conservative (typically 2-4%), roughly in line with long-term GDP growth, since no company can grow faster than the economy forever.</p>
              <h2>Choosing the Right Discount Rate</h2>
              <p>The discount rate is the most sensitive input in a DCF model. It represents the opportunity cost of capital — the return you could earn on a similarly risky investment. For most publicly traded companies, the appropriate discount rate is the Weighted Average Cost of Capital (WACC), which blends the cost of equity (using CAPM) with the after-tax cost of debt. Higher-risk companies require higher discount rates, which dramatically lowers their DCF valuation.</p>
              <h2>The Margin of Safety Principle</h2>
              <p>No matter how careful your analysis, DCF projections are uncertain. This is why legendary investor Benjamin Graham emphasized the "Margin of Safety" principle: never pay full intrinsic value for a stock. By purchasing at a significant discount (20%, 30%, or more below intrinsic value), you protect yourself against errors in your growth assumptions or unforeseen business deterioration.</p>
              <h2>Sensitivity Analysis</h2>
              <p>Given the impact of assumptions on DCF output, always run sensitivity analysis. Try varying the growth rate by ±5% and the discount rate by ±2%. If the stock still looks cheap across a range of scenarios (a "bull/base/bear" case), your conviction is much higher than if it only looks cheap in the most optimistic scenario.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dcf-calculator" />
          <PopularCalculators exclude="/calculator/dcf-calculator" />
        </div>
      </div>
    </>
  );
}
