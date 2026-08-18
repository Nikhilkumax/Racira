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
  revenue: string;
  logistics: string;
  transportation: string;
  warehousing: string;
  holding: string;
}

interface Result {
  totalCost: number;
  pctOfRevenue: number;
  profitMarginPct: number;
  pie: { name: string; value: number; pct: number; color: string }[];
}

const DEFAULTS: Inputs = { revenue: "2000000", logistics: "200000", transportation: "300000", warehousing: "150000", holding: "100000" };

function calculate(inputs: Inputs): Result {
  const revenue = Math.max(0, parseFloat(inputs.revenue) || 0);
  const logistics = Math.max(0, parseFloat(inputs.logistics) || 0);
  const transportation = Math.max(0, parseFloat(inputs.transportation) || 0);
  const warehousing = Math.max(0, parseFloat(inputs.warehousing) || 0);
  const holding = Math.max(0, parseFloat(inputs.holding) || 0);
  const totalCost = logistics + transportation + warehousing + holding;
  const pctOfRevenue = revenue > 0 ? (totalCost / revenue) * 100 : 0;
  const profitMarginPct = revenue > 0 ? Math.max(0, ((revenue - totalCost) / revenue) * 100) : 0;
  const parts = [
    { name: "Transportation", value: transportation, color: PIE_COLORS[0] },
    { name: "Logistics Services", value: logistics, color: PIE_COLORS[1] },
    { name: "Warehousing", value: warehousing, color: PIE_COLORS[2] },
    { name: "Inventory Holding", value: holding, color: PIE_COLORS[3] },
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
  return { totalCost, pctOfRevenue, profitMarginPct, pie };
}

const LogisticsCostAsOfRevenueCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.revenue) <= 0 || num(inputs.logistics) < 0 || num(inputs.transportation) < 0 || num(inputs.warehousing) < 0 || num(inputs.holding) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Revenue", value: fmtMoney(num(inputs.revenue)) },
    { label: "Transportation Costs", value: fmtMoney(num(inputs.transportation)) },
    { label: "Logistics Services", value: fmtMoney(num(inputs.logistics)) },
    { label: "Warehousing Costs", value: fmtMoney(num(inputs.warehousing)) },
    { label: "Inventory Holding Costs", value: fmtMoney(num(inputs.holding)) },
    { label: "Total Logistics Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Logistics Cost as % of Revenue", value: result.pctOfRevenue.toFixed(1) + "%", highlight: true },
  ];

  const faqs = [
    { question: "What is logistics cost as a percentage of revenue?", answer: "It measures total spending on transportation, warehousing, logistics services, and inventory holding as a share of company revenue. It is the industry-standard benchmark for supply chain efficiency, often called the logistics cost ratio." },
    { question: "What is a normal logistics cost ratio?", answer: "It varies by industry: CPG and food companies often run 8–15%, e-commerce can exceed 20%, and heavy manufacturing 6–12%. Transportation is usually the largest slice. A ratio above 15% for a product business usually signals room to optimize." },
    { question: "How can I lower logistics costs?", answer: "Consolidate freight, renegotiate carrier contracts, optimize delivery routes, right-size the warehouse network, and reduce inventory carrying cost through better demand planning. Each percentage point saved on the ratio flows directly to profit margin." },
    { question: "Why separate transportation from warehousing?", answer: "The two are managed differently and trend differently — freight rates move with fuel and capacity, while warehousing is largely fixed and labor-driven. Splitting them lets you see which part of the ratio is drifting and attack the right lever." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Logistics Cost as % of Revenue Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Logistics Cost as % of Revenue Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="revenue" label="Revenue" value={inputs.revenue} onChange={set("revenue")} prefix="$" />
              <NumInput id="transportation" label="Transportation Costs" value={inputs.transportation} onChange={set("transportation")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="logistics" label="Logistics Services" value={inputs.logistics} onChange={set("logistics")} prefix="$" />
              <NumInput id="warehousing" label="Warehousing Costs" value={inputs.warehousing} onChange={set("warehousing")} prefix="$" />
            </div>
            <div>
              <NumInput id="holding" label="Inventory Holding Costs" value={inputs.holding} onChange={set("holding")} prefix="$" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Revenue must be &gt; 0; all cost fields must be ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Logistics Cost as % of Revenue</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.pctOfRevenue.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">Total logistics cost of {fmtMoney(result.totalCost)} on {fmtMoney(num(inputs.revenue))} in revenue</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Transportation</span>
                <span className="font-extrabold text-foreground">{fmtMoney(num(inputs.transportation))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Logistics Cost</span>
                <span className="font-extrabold text-primary">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Remaining Margin</span>
                <span className={`font-extrabold ${result.profitMarginPct >= 60 ? "text-emerald-600" : "text-amber-600"}`}>{result.profitMarginPct.toFixed(1)}%</span>
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
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Logistics Cost Breakdown</h3>
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
                  { label: "Revenue", value: fmtMoney(num(inputs.revenue)) },
                  { label: "Transportation", value: fmtMoney(num(inputs.transportation)) },
                  { label: "Logistics Services", value: fmtMoney(num(inputs.logistics)) },
                  { label: "Warehousing", value: fmtMoney(num(inputs.warehousing)) },
                  { label: "Inventory Holding", value: fmtMoney(num(inputs.holding)) },
                  { label: "Total Logistics Cost", value: fmtMoney(result.totalCost) },
                  { label: "Logistics Cost % of Revenue", value: result.pctOfRevenue.toFixed(1) + "%", bold: true },
                  { label: "Remaining Margin", value: result.profitMarginPct.toFixed(1) + "%" },
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
            <h2 className="text-2xl font-bold mb-3">The Logistics Cost Ratio</h2>
            <p>Logistics cost as a percentage of revenue is how supply chain leaders and investors benchmark distribution efficiency. With the defaults, a company with $2,000,000 in revenue carries $750,000 of logistics cost — $300,000 transportation, $200,000 logistics services, $150,000 warehousing, and $100,000 inventory holding — a 37.5% ratio that leaves a 62.5% margin before other operating costs.</p>
            <p>Transportation is the largest single slice, which is why freight procurement and route optimization dominate logistics improvement programs. Track the ratio monthly: a stable or declining ratio with growing revenue is the signature of a well-run supply chain.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/logistics-cost-as-of-revenue-calculator" />
          <PopularCalculators exclude="/calculator/logistics-cost-as-of-revenue-calculator" />
        </div>
      </div>
    </>
  );
};
export default LogisticsCostAsOfRevenueCalculator;
