"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const PIE_COLORS = ["hsl(var(--primary))", "#f59e0b", "#8b5cf6", "#10b981"];

const NumInput = ({ id, label, value, onChange, prefix, suffix, min }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; min?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Inputs {
  salesRevenue: string;
  cogs: string;
  logistics: string;
  holding: string;
}

interface Result {
  totalCost: number;
  pctOfSales: number;
  grossMarginPct: number;
  cogsPct: number;
  logisticsPct: number;
  holdingPct: number;
  pie: { name: string; value: number; pct: number; color: string }[];
}

const DEFAULTS: Inputs = { salesRevenue: "1000000", cogs: "600000", logistics: "100000", holding: "50000" };

function calculate(inputs: Inputs): Result {
  const revenue = Math.max(0, parseFloat(inputs.salesRevenue) || 0);
  const cogs = Math.max(0, parseFloat(inputs.cogs) || 0);
  const logistics = Math.max(0, parseFloat(inputs.logistics) || 0);
  const holding = Math.max(0, parseFloat(inputs.holding) || 0);
  const totalCost = cogs + logistics + holding;
  const pctOfSales = revenue > 0 ? (totalCost / revenue) * 100 : 0;
  const grossMarginPct = revenue > 0 ? Math.max(0, ((revenue - totalCost) / revenue) * 100) : 0;
  const parts = [
    { name: "Cost of Goods Sold", value: cogs, color: PIE_COLORS[0] },
    { name: "Logistics Costs", value: logistics, color: PIE_COLORS[1] },
    { name: "Inventory Holding", value: holding, color: PIE_COLORS[2] },
  ];
  let sum = 0;
  const pcts = parts.map(p => {
    if (totalCost <= 0) return 0;
    const v = Math.round((p.value / totalCost) * 1000) / 10;
    sum += v;
    return v;
  });
  if (totalCost > 0 && sum !== 100) {
    const diff = Math.round((100 - sum) * 10) / 10;
    let maxIdx = 0;
    for (let i = 1; i < pcts.length; i++) if (pcts[i] > pcts[maxIdx]) maxIdx = i;
    pcts[maxIdx] = Math.round((pcts[maxIdx] + diff) * 10) / 10;
  }
  const pie = parts.map((p, i) => ({ ...p, pct: pcts[i] })).filter(p => p.value > 0);
  return {
    totalCost,
    pctOfSales,
    grossMarginPct,
    cogsPct: revenue > 0 ? (cogs / revenue) * 100 : 0,
    logisticsPct: revenue > 0 ? (logistics / revenue) * 100 : 0,
    holdingPct: revenue > 0 ? (holding / revenue) * 100 : 0,
    pie,
  };
}

const SupplyChainCostAsOfSalesCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.salesRevenue) <= 0 || num(inputs.cogs) < 0 || num(inputs.logistics) < 0 || num(inputs.holding) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Sales Revenue", value: fmtMoney(num(inputs.salesRevenue)) },
    { label: "Cost of Goods Sold", value: fmtMoney(num(inputs.cogs)), display: " (" + result.cogsPct.toFixed(1) + "% of sales)" },
    { label: "Logistics Costs", value: fmtMoney(num(inputs.logistics)), display: " (" + result.logisticsPct.toFixed(1) + "% of sales)" },
    { label: "Inventory Holding Costs", value: fmtMoney(num(inputs.holding)), display: " (" + result.holdingPct.toFixed(1) + "% of sales)" },
    { label: "Total Supply Chain Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Supply Chain Cost as % of Sales", value: result.pctOfSales.toFixed(1) + "%", highlight: true },
    { label: "Gross Margin (after SCM)", value: result.grossMarginPct.toFixed(1) + "%" },
  ];

  const faqs = [
    { question: "What is supply chain cost as a percentage of sales?", answer: "It measures the total cost of delivering products — cost of goods sold, logistics, and inventory holding — as a share of revenue. It is the supply-chain equivalent of a gross margin ratio and is used to benchmark logistics performance across industries." },
    { question: "What is a good supply chain cost ratio?", answer: "A common rule of thumb is that total supply chain costs (including COGS, logistics and inventory) run 70–90% of sales for product businesses; pure logistics cost alone is often benchmarked at 5–10% of sales. Track your own trend over time rather than a single number." },
    { question: "How can I reduce supply chain costs?", answer: "Negotiate with suppliers, consolidate shipments, optimize inventory levels, reduce expedited freight, and use cost-to-serve analysis to drop unprofitable customers or products. Each percentage point saved flows directly to gross margin." },
    { question: "What is inventory holding cost?", answer: "Inventory holding cost covers storage, insurance, taxes, obsolescence and the capital tied up in stock — typically 15–30% of inventory value per year. It is why lean inventory practices improve both cash flow and the cost-of-sales ratio." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Supply Chain Cost as % of Sales Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Supply Chain Cost as % of Sales Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="revenue" label="Sales Revenue" value={inputs.salesRevenue} onChange={set("salesRevenue")} prefix="$" />
              <NumInput id="cogs" label="Cost of Goods Sold" value={inputs.cogs} onChange={set("cogs")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="logistics" label="Logistics Costs" value={inputs.logistics} onChange={set("logistics")} prefix="$" />
              <NumInput id="holding" label="Inventory Holding Costs" value={inputs.holding} onChange={set("holding")} prefix="$" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Sales revenue must be greater than zero; all cost fields must be ≥ 0.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Supply Chain Cost as % of Sales</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.pctOfSales.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">Total supply chain cost of {fmtMoney(result.totalCost)} on {fmtMoney(num(inputs.salesRevenue))} in revenue</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Supply Chain Cost</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost % of Sales</span>
                <span className="font-extrabold text-primary">{result.pctOfSales.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gross Margin</span>
                <span className={`font-extrabold ${result.grossMarginPct >= 20 ? "text-emerald-600" : "text-amber-600"}`}>{result.grossMarginPct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}{r.display || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Supply Chain Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {result.pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [fmtMoney(v), n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {result.pie.map((p) => (
                  <span key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />{p.name} — {p.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Sales Revenue", value: fmtMoney(num(inputs.salesRevenue)) },
                  { label: "Cost of Goods Sold", value: fmtMoney(num(inputs.cogs)) },
                  { label: "Logistics Costs", value: fmtMoney(num(inputs.logistics)) },
                  { label: "Inventory Holding", value: fmtMoney(num(inputs.holding)) },
                  { label: "Total Supply Chain Cost", value: fmtMoney(result.totalCost) },
                  { label: "Cost as % of Sales", value: result.pctOfSales.toFixed(1) + "%", bold: true },
                  { label: "Gross Margin", value: result.grossMarginPct.toFixed(1) + "%" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Supply Chain Cost as % of Sales?</h2>
            <p>This ratio shows how efficiently a business converts revenue into delivered product. With the default inputs, a company with $1,000,000 in sales carries $750,000 of supply chain cost ($600,000 COGS, $100,000 logistics, $50,000 inventory holding), so supply chain consumes 75.0% of revenue and leaves a 25.0% gross margin.</p>
            <p>Breaking the ratio into its components reveals where the money goes: COGS at 60.0% of sales is the largest lever, logistics at 10.0% is the second, and inventory holding at 5.0% is the most controllable. Benchmarking each component against industry peers helps prioritize improvement projects.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Result</h2>
            <p>A falling cost-to-sales ratio signals improving operational efficiency; a rising one can indicate freight inflation, waste, or bloated inventory. Track the ratio monthly and drill into the component that deviates from your baseline.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/supply-chain-cost-as-of-sales-calculator" />
          <PopularCalculators exclude="/calculator/supply-chain-cost-as-of-sales-calculator" />
        </div>
      </div>
    </>
  );
};
export default SupplyChainCostAsOfSalesCalculator;
