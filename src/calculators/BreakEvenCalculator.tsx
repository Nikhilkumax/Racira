"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const BreakEvenCalculator = () => {
  const [fixedCosts, setFixedCosts] = useState("50000");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("30");
  const [sellingPrice, setSellingPrice] = useState("50");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    breakEvenUnits: number; breakEvenRevenue: number;
    contributionMargin: number; contributionMarginRatio: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const fc = parseFloat(fixedCosts) || 0;
    const vc = parseFloat(variableCostPerUnit) || 0;
    const sp = parseFloat(sellingPrice) || 0;
    if (sp <= 0 || sp <= vc) return;

    const contributionMargin = sp - vc;
    const breakEvenUnits = Math.ceil(fc / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * sp;
    const contributionMarginRatio = (contributionMargin / sp) * 100;

    setResult({ breakEvenUnits, breakEvenRevenue, contributionMargin, contributionMarginRatio });
  };

  const reset = () => {
    setShowResults(false); setFixedCosts("50000"); setVariableCostPerUnit("30"); setSellingPrice("50"); setResult(null); };

  const faqs = [
    { question: "What is the break-even point?", answer: "The break-even point is where total revenue equals total costs — you're neither making a profit nor a loss. Any sales beyond this point generate profit." },
    { question: "What is contribution margin?", answer: "Contribution margin is the selling price minus variable cost per unit. It represents how much each unit sold contributes toward covering fixed costs and generating profit." },
    { question: "How can I lower my break-even point?", answer: "Reduce fixed costs (negotiate rent, reduce staff), lower variable costs per unit (cheaper materials, more efficient processes), or increase selling price." },
    { question: "Does break-even analysis account for taxes?", answer: "Basic break-even analysis doesn't include taxes. For after-tax break-even, divide your target profit by (1 - tax rate) and add it to fixed costs." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Break Even Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Break Even Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Find how many units you need to sell to cover all your costs.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="fixedCosts" label="Fixed Costs" value={fixedCosts} onChange={setFixedCosts} prefix="$" tooltip="Rent, salaries, insurance — costs that don't change with volume" />
                <InputField id="variableCostPerUnit" label="Variable Cost / Unit" value={variableCostPerUnit} onChange={setVariableCostPerUnit} prefix="$" tooltip="Materials, labor, shipping per unit" />
                <InputField id="sellingPrice" label="Selling Price / Unit" value={sellingPrice} onChange={setSellingPrice} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Break Even</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Break-Even Analysis</h2>
                <ResultDisplay items={[
                  { label: "Break-Even Units", value: 0, textValue: `${result.breakEvenUnits.toLocaleString()} units`, highlight: true },
                  { label: "Break-Even Revenue", value: result.breakEvenRevenue, highlight: true },
                  { label: "Contribution Margin / Unit", value: result.contributionMargin },
                  { label: "Contribution Margin Ratio", value: 0, textValue: `${result.contributionMarginRatio.toFixed(1)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is Break-Even Analysis?</h2>
              <p>Break-even analysis determines the point at which a business's revenue exactly covers its total costs. Below this point, the business operates at a loss; above it, every additional sale generates profit. It's a fundamental tool for pricing decisions, business planning, and financial forecasting.</p>

              <h2>Break-Even Formula</h2>
              <p><strong>Break-Even Units = Fixed Costs ÷ (Selling Price − Variable Cost per Unit)</strong></p>
              <p><strong>Break-Even Revenue = Break-Even Units × Selling Price</strong></p>
              <p>The denominator (Selling Price − Variable Cost) is called the <strong>contribution margin</strong> — the amount each unit contributes toward covering fixed costs.</p>

              <h2>Understanding Fixed vs Variable Costs</h2>
              <ul>
                <li><strong>Fixed Costs:</strong> Remain constant regardless of production volume — rent, salaries, insurance, loan payments, software subscriptions.</li>
                <li><strong>Variable Costs:</strong> Change proportionally with production — raw materials, packaging, shipping, sales commissions, credit card fees.</li>
              </ul>

              <h2>Using Break-Even for Pricing</h2>
              <p>Break-even analysis helps answer critical questions: What price should I charge? How many units must I sell at this price? What happens if I lower the price by 10%? By modeling different scenarios, you can find the optimal balance between price, volume, and profitability.</p>

              <h2>Limitations</h2>
              <ul>
                <li>Assumes linear cost and revenue relationships</li>
                <li>Doesn't account for economies of scale or price elasticity</li>
                <li>Ignores time value of money and cash flow timing</li>
                <li>Uses a single product model — multi-product businesses need weighted analysis</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Break-even analysis is a simplified model. Real-world costs and revenues may not be perfectly linear. Use alongside other financial planning tools.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/break-even-calculator" />
          <PopularCalculators exclude="/break-even-calculator" />
        </div>
      </div>
    </>
  );
};

export default BreakEvenCalculator;


