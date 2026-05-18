"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const MarkupCalculator = () => {
  const [mode, setMode] = useState<"cost_markup" | "cost_price" | "price_margin">("cost_markup");
  const [costPrice, setCostPrice] = useState("60");
  const [sellingPrice, setSellingPrice] = useState("100");
  const [markupPercent, setMarkupPercent] = useState("66.67");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    cost: number; selling: number; profit: number;
    markup: number; margin: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    let cost: number, selling: number;

    if (mode === "cost_markup") {
      cost = parseFloat(costPrice) || 0;
      const mkp = parseFloat(markupPercent) || 0;
      if (cost <= 0) return;
      selling = cost * (1 + mkp / 100);
    } else if (mode === "cost_price") {
      cost = parseFloat(costPrice) || 0;
      selling = parseFloat(sellingPrice) || 0;
      if (cost <= 0 || selling <= 0) return;
    } else {
      selling = parseFloat(sellingPrice) || 0;
      const marginPct = parseFloat(markupPercent) || 0;
      if (selling <= 0 || marginPct >= 100) return;
      cost = selling * (1 - marginPct / 100);
    }

    const profit = selling - cost;
    setResult({
      cost: Math.round(cost * 100) / 100,
      selling: Math.round(selling * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      markup: cost > 0 ? Math.round((profit / cost) * 10000) / 100 : 0,
      margin: selling > 0 ? Math.round((profit / selling) * 10000) / 100 : 0,
    });
  };

  const reset = () => {
    setShowResults(false); setCostPrice("60"); setSellingPrice("100"); setMarkupPercent("66.67"); setResult(null); };

  const modes = [
    { value: "cost_markup", label: "Cost + Markup %" },
    { value: "cost_price", label: "Cost + Selling Price" },
    { value: "price_margin", label: "Price + Margin %" },
  ];

  const faqs = [
    { question: "What is markup?", answer: "Markup is the percentage added to the cost price to determine the selling price. If an item costs $60 and you sell it for $100, the markup is ($40 ÷ $60) × 100 = 66.7%." },
    { question: "What is the difference between markup and margin?", answer: "Markup is profit divided by cost (percentage of cost). Margin is profit divided by selling price (percentage of revenue). A 100% markup equals a 50% margin." },
    { question: "How do I convert markup to margin?", answer: "Margin = Markup ÷ (1 + Markup). For example, 50% markup → 0.50 ÷ 1.50 = 33.3% margin. Conversely, Markup = Margin ÷ (1 − Margin)." },
    { question: "What markup should I use?", answer: "It depends on your industry. Retail typically uses 50-100% markup. Restaurants use 200-300% on food. Software may use 500%+ on marginal cost. Ensure your markup covers overhead and desired profit." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Markup Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Markup Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate markup percentage, selling price, and profit margin from cost and price.</p>

            <div className="card-calculator mb-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Calculate From</label>
                <div className="flex flex-wrap gap-2">
                  {modes.map(m => (
                    <button key={m.value} onClick={() => { setMode(m.value as any); setResult(null); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                {(mode === "cost_markup" || mode === "cost_price") && (
                  <InputField id="costPrice" label="Cost Price" value={costPrice} onChange={setCostPrice} prefix="$" />
                )}
                {mode === "cost_markup" && (
                  <InputField id="markupPercent" label="Markup %" value={markupPercent} onChange={setMarkupPercent} suffix="%" />
                )}
                {(mode === "cost_price" || mode === "price_margin") && (
                  <InputField id="sellingPrice" label="Selling Price" value={sellingPrice} onChange={setSellingPrice} prefix="$" />
                )}
                {mode === "price_margin" && (
                  <InputField id="marginPercent" label="Margin %" value={markupPercent} onChange={setMarkupPercent} suffix="%" />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Markup & Margin</h2>
                <ResultDisplay items={[
                  { label: "Cost Price", value: result.cost },
                  { label: "Selling Price", value: result.selling },
                  { label: "Profit", value: result.profit, highlight: true },
                  { label: "Markup %", value: 0, textValue: `${result.markup}%`, highlight: true },
                  { label: "Margin %", value: 0, textValue: `${result.margin}%` },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is Markup?</h2>
              <p>Markup is the amount added to the cost of a product or service to determine its selling price. It is expressed as a percentage of the cost. Markup is one of the most fundamental pricing concepts in business, directly affecting profitability and competitiveness.</p>

              <h2>Markup Formulas</h2>
              <ul>
                <li><strong>Markup % = ((Selling Price − Cost) ÷ Cost) × 100</strong></li>
                <li><strong>Selling Price = Cost × (1 + Markup% ÷ 100)</strong></li>
                <li><strong>Cost = Selling Price ÷ (1 + Markup% ÷ 100)</strong></li>
              </ul>

              <h2>Markup vs Margin Conversion Table</h2>
              <table className="w-full text-sm mb-4">
                <thead><tr><th className="text-left py-1">Markup</th><th className="text-right">Margin</th></tr></thead>
                <tbody>
                  <tr><td>15%</td><td className="text-right">13.0%</td></tr>
                  <tr><td>25%</td><td className="text-right">20.0%</td></tr>
                  <tr><td>50%</td><td className="text-right">33.3%</td></tr>
                  <tr><td>75%</td><td className="text-right">42.9%</td></tr>
                  <tr><td>100%</td><td className="text-right">50.0%</td></tr>
                  <tr><td>200%</td><td className="text-right">66.7%</td></tr>
                </tbody>
              </table>

              <h2>Common Markup by Industry</h2>
              <ul>
                <li><strong>Grocery:</strong> 10-30% markup</li>
                <li><strong>Retail clothing:</strong> 50-100% (keystone markup)</li>
                <li><strong>Restaurants:</strong> 200-300% on food, 400-500% on beverages</li>
                <li><strong>Jewelry:</strong> 50-100% for fine jewelry, up to 300% for fashion</li>
                <li><strong>Electronics:</strong> 20-50%</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Pricing decisions should consider market conditions, competitor pricing, and perceived value. Markup alone doesn't guarantee profitability — total volume and overhead matter.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/markup-calculator" />
            <PopularCalculators exclude="/markup-calculator" />
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

export default MarkupCalculator;


