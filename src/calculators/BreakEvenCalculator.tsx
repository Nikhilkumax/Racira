"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface BEResult {
  unitsBEP: number;
  revenueBEP: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  profitAtTarget: number;
  chartData: { units: number; revenue: number; totalCost: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBE(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number, targetUnits: number): BEResult {
  const cm = pricePerUnit - variableCostPerUnit;
  const cmr = pricePerUnit > 0 ? cm / pricePerUnit : 0;
  const unitsBEP = cm > 0 ? fixedCosts / cm : 0;
  const revenueBEP = unitsBEP * pricePerUnit;
  const profitAtTarget = targetUnits * cm - fixedCosts;

  const maxUnits = Math.max(unitsBEP * 2, targetUnits * 1.5, 100);
  const step = Math.ceil(maxUnits / 20);
  const chartData: { units: number; revenue: number; totalCost: number }[] = [];
  for (let u = 0; u <= maxUnits; u += step) {
    chartData.push({ units: Math.round(u), revenue: Math.round(u * pricePerUnit), totalCost: Math.round(fixedCosts + u * variableCostPerUnit) });
  }

  const breakdown = [
    { label: "Fixed Costs", value: `$${fixedCosts.toLocaleString()}` },
    { label: "Price Per Unit", value: `$${pricePerUnit.toFixed(2)}` },
    { label: "Variable Cost Per Unit", value: `$${variableCostPerUnit.toFixed(2)}` },
    { label: "Contribution Margin", value: `$${cm.toFixed(2)} per unit` },
    { label: "Contribution Margin Ratio", value: `${(cmr * 100).toFixed(1)}%` },
    { label: "Break-Even Units", value: `${Math.ceil(unitsBEP).toLocaleString()} units` },
    { label: "Break-Even Revenue", value: `$${revenueBEP.toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
    { label: `Profit at ${targetUnits.toLocaleString()} Units`, value: `$${profitAtTarget.toLocaleString("en-US", { minimumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Break-Even Units", value: `${Math.ceil(unitsBEP).toLocaleString()}` },
    { label: "Break-Even Revenue", value: `$${revenueBEP.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Contribution Margin", value: `$${cm.toFixed(2)}` },
    { label: "CM Ratio", value: `${(cmr * 100).toFixed(1)}%` },
    { label: "Target Profit", value: `$${profitAtTarget.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Margin of Safety", value: targetUnits > unitsBEP ? `${((1 - unitsBEP / targetUnits) * 100).toFixed(1)}%` : "N/A" },
  ];

  return { unitsBEP, revenueBEP, contributionMargin: cm, contributionMarginRatio: cmr, profitAtTarget, chartData, breakdown, summaryStats };
}

const DEFAULTS = { fixed: "50000", price: "25", variable: "10", target: "5000" };

export default function BreakEvenCalculator() {
  const [fixed, setFixed] = useState(DEFAULTS.fixed);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [variable, setVariable] = useState(DEFAULTS.variable);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [result, setResult] = useState<BEResult | null>(null);

  const calculate = () => {
    setResult(calcBE(parseFloat(fixed) || 50000, parseFloat(price) || 25, parseFloat(variable) || 10, parseFloat(target) || 5000));
  };
  const reset = () => {
    setFixed(DEFAULTS.fixed); setPrice(DEFAULTS.price); setVariable(DEFAULTS.variable); setTarget(DEFAULTS.target);
    setResult(calcBE(50000, 25, 10, 5000));
  };
  useEffect(() => { setResult(calcBE(50000, 25, 10, 5000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is break-even analysis?", answer: "Break-even analysis determines the point where total revenue equals total costs — meaning no profit or loss. It's essential for pricing decisions, business planning, and evaluating whether a product or service is viable." },
    { question: "How is the break-even point calculated?", answer: "Break-Even Units = Fixed Costs ÷ (Price per Unit − Variable Cost per Unit). The denominator is the contribution margin — the amount each unit sale contributes toward covering fixed costs." },
    { question: "What is contribution margin?", answer: "Contribution margin = Selling price − Variable cost per unit. It represents how much each unit sold contributes to covering fixed costs. Once fixed costs are covered, the contribution margin becomes profit." },
    { question: "What is a good contribution margin ratio?", answer: "It varies by industry. Software/SaaS: 70–85%. Manufacturing: 30–50%. Retail: 20–40%. Service businesses: 50–80%. Higher is better — it means more of each dollar of revenue flows to profit after covering variable costs." },
    { question: "How do I lower my break-even point?", answer: "Reduce fixed costs (rent, salaries, subscriptions). Increase selling price if market allows. Reduce variable costs through negotiation or process improvement. Improve sales mix toward higher-margin products." },
    { question: "What is margin of safety?", answer: "Margin of safety = (Actual Sales − Break-Even Sales) ÷ Actual Sales. It shows how much sales can drop before you hit the break-even point. A margin of safety above 20% is generally considered healthy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Break-Even Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Break-Even Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Total Fixed Costs</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={fixed} onChange={e => setFixed(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Price Per Unit</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Variable Cost/Unit</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={variable} onChange={e => setVariable(e.target.value)} step={0.01} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Target Sales Units</label>
              <div className={inp}><input type="number" value={target} onChange={e => setTarget(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">units</span></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Break-Even Point</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{Math.ceil(result.unitsBEP).toLocaleString()} units</div>
                <div className="text-sm text-muted-foreground mt-1">Revenue needed: ${result.revenueBEP.toLocaleString("en-US", { maximumFractionDigits: 0 })} · CM per unit: ${result.contributionMargin.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["BEP Revenue", `$${result.revenueBEP.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["CM Ratio", `${(result.contributionMarginRatio * 100).toFixed(1)}%`], ["Target Profit", `$${result.profitAtTarget.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cost & Revenue Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Break-Even Chart</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="units" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number, n: string) => [`$${v.toLocaleString()}`, n]} />
                    <ReferenceLine x={Math.ceil(result.unitsBEP)} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "BEP", fontSize: 10, fill: "hsl(var(--destructive))" }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="totalCost" name="Total Cost" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Break-Even Analysis?</h2>
            <p>A <strong>break-even analysis</strong> identifies the exact point where total revenue equals total costs — the moment your business neither gains nor loses money. Every unit sold beyond the break-even point generates pure profit. This <strong>break-even calculator</strong> helps entrepreneurs, managers, and analysts understand the minimum sales volume required for profitability.</p>
            <h2 className="text-2xl font-bold mb-3">The Break-Even Formula</h2>
            <p>BEP (units) = Fixed Costs ÷ Contribution Margin. Where Contribution Margin = Price Per Unit − Variable Cost Per Unit. BEP (revenue) = Fixed Costs ÷ Contribution Margin Ratio. These formulas are foundational in cost-volume-profit (CVP) analysis used in managerial accounting.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The break-even units tell you the minimum quantity to sell each period to cover all costs. The contribution margin ratio shows what percentage of each revenue dollar flows toward fixed costs and ultimately profit. Margin of safety indicates how far above break-even your target sales are.</p>
            <h2 className="text-2xl font-bold mb-3">Key Inputs and Benchmarks</h2>
            <p>Fixed costs include rent, salaries, insurance, and depreciation — costs that don't change with production volume. Variable costs change directly with output: raw materials, direct labor, shipping. Selling price should reflect market positioning and target margin. Most businesses aim for 20–40% contribution margin ratios in manufacturing, 50–80% in services.</p>
            <h2 className="text-2xl font-bold mb-3">Using Break-Even in Business Planning</h2>
            <p>Use BEP when launching a new product to validate pricing. Compare BEP scenarios across different price points. Calculate how many customers or subscriptions you need before becoming profitable. Investors often ask founders about break-even timelines during due diligence.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/break-even-calculator" />
          <PopularCalculators exclude="/calculator/break-even-calculator" />
        </div>
      </div>
    </>
  );
}
