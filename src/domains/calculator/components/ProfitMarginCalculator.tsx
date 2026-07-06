"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const ProfitMarginCalculator = () => {
  const [mode, setMode] = useState<"revenue" | "cost">("revenue");
  const [revenue, setRevenue] = useState("100000");
  const [cogs, setCogs] = useState("60000");
  const [operatingExpenses, setOperatingExpenses] = useState("15000");
  const [otherExpenses, setOtherExpenses] = useState("5000");
  const [tax, setTax] = useState("5000");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    grossProfit: number; grossMargin: number;
    operatingProfit: number; operatingMargin: number;
    netProfit: number; netMargin: number;
    markup: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const rev = parseFloat(revenue) || 0;
    const cost = parseFloat(cogs) || 0;
    const opex = parseFloat(operatingExpenses) || 0;
    const other = parseFloat(otherExpenses) || 0;
    const t = parseFloat(tax) || 0;
    if (rev <= 0) return;

    const grossProfit = rev - cost;
    const operatingProfit = grossProfit - opex;
    const netProfit = operatingProfit - other - t;

    setResult({
      grossProfit,
      grossMargin: (grossProfit / rev) * 100,
      operatingProfit,
      operatingMargin: (operatingProfit / rev) * 100,
      netProfit,
      netMargin: (netProfit / rev) * 100,
      markup: cost > 0 ? (grossProfit / cost) * 100 : 0,
    });
  };

  const reset = () => {
    setShowResults(false); setRevenue("100000"); setCogs("60000"); setOperatingExpenses("15000"); setOtherExpenses("5000"); setTax("5000"); setResult(null); };

  const faqs = [
    { question: "What is profit margin?", answer: "Profit margin is the percentage of revenue that remains as profit after deducting costs. There are three types: gross margin (after COGS), operating margin (after operating expenses), and net margin (after all expenses including taxes)." },
    { question: "What is a good profit margin?", answer: "It varies by industry. Generally, 10% net margin is average, 20%+ is good, and 5% or below is low. Software companies often have 20-30% net margins, while retail may be 2-5%." },
    { question: "What is the difference between margin and markup?", answer: "Margin is profit as a percentage of revenue (selling price). Markup is profit as a percentage of cost. A 50% markup equals a 33.3% margin. They measure the same profit differently." },
    { question: "How can I improve profit margins?", answer: "Increase prices, reduce COGS through better supplier deals, lower operating expenses, increase sales volume for better economies of scale, or focus on higher-margin products/services." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Profit Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Profit Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="revenue" label="Revenue / Sales" value={revenue} onChange={setRevenue} prefix="$" tooltip="Total revenue or sales" />
                <InputField id="cogs" label="Cost of Goods Sold (COGS)" value={cogs} onChange={setCogs} prefix="$" tooltip="Direct costs: materials, labor, manufacturing" />
                <InputField id="operatingExpenses" label="Operating Expenses" value={operatingExpenses} onChange={setOperatingExpenses} prefix="$" tooltip="Rent, salaries, utilities, marketing" />
                <InputField id="otherExpenses" label="Other Expenses" value={otherExpenses} onChange={setOtherExpenses} prefix="$" tooltip="Interest, depreciation, one-time costs" />
                <InputField id="tax" label="Taxes" value={tax} onChange={setTax} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Profit Margins</h2>
                <ResultDisplay items={[
                  { label: "Gross Profit", value: result.grossProfit, highlight: true },
                  { label: "Gross Margin", value: 0, textValue: `${result.grossMargin.toFixed(1)}%` },
                  { label: "Operating Profit", value: result.operatingProfit },
                  { label: "Operating Margin", value: 0, textValue: `${result.operatingMargin.toFixed(1)}%` },
                  { label: "Net Profit", value: result.netProfit, highlight: true },
                  { label: "Net Margin", value: 0, textValue: `${result.netMargin.toFixed(1)}%` },
                  { label: "Markup on COGS", value: 0, textValue: `${result.markup.toFixed(1)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is Profit Margin?</h2>
              <p>Profit margin measures how much of every dollar in revenue a company keeps as profit. It is one of the most important financial metrics for evaluating business performance, pricing strategy, and operational efficiency. There are three levels of profit margin, each revealing different aspects of financial health.</p>

              <h2 className="text-2xl font-bold mb-3">Three Types of Profit Margin</h2>
              <ul>
                <li><strong>Gross Margin = (Revenue − COGS) ÷ Revenue × 100</strong> — Shows production efficiency. How much profit remains after direct costs.</li>
                <li><strong>Operating Margin = (Revenue − COGS − OpEx) ÷ Revenue × 100</strong> — Shows operational efficiency. Includes overhead and administration costs.</li>
                <li><strong>Net Margin = (Revenue − All Expenses − Taxes) ÷ Revenue × 100</strong> — The bottom line. What percentage of revenue becomes actual profit.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Profit Margin vs Markup</h2>
              <p>These are often confused but measure profit differently:</p>
              <ul>
                <li><strong>Margin:</strong> Profit ÷ Revenue × 100 (percentage of selling price)</li>
                <li><strong>Markup:</strong> Profit ÷ Cost × 100 (percentage of cost price)</li>
                <li>Example: Cost $60, Price $100 → Margin = 40%, Markup = 66.7%</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
              <ul>
                <li><strong>Software/SaaS:</strong> 60-80% gross, 20-30% net</li>
                <li><strong>Retail:</strong> 25-35% gross, 2-5% net</li>
                <li><strong>Manufacturing:</strong> 25-35% gross, 5-10% net</li>
                <li><strong>Services:</strong> 50-70% gross, 10-20% net</li>
                <li><strong>Restaurants:</strong> 55-65% gross, 3-9% net</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Improving Profit Margins</h2>
              <ul>
                <li>Negotiate better supplier pricing to lower COGS</li>
                <li>Increase prices strategically based on value delivered</li>
                <li>Automate operations to reduce overhead</li>
                <li>Focus marketing spend on highest-ROI channels</li>
                <li>Eliminate low-margin products or services</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides simplified margin calculations. Actual financial analysis should account for depreciation, amortization, and other accounting standards. Consult a CPA for business financial planning.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/profit-margin-calculator" />
          <PopularCalculators exclude="/profit-margin-calculator" />
        </div>
      </div>
    </>
  );
};

export default ProfitMarginCalculator;


