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
const PIE_COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

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
  cogs: string;
  sga: string;
  depreciation: string;
}

interface Result {
  grossProfit: number;
  totalOpex: number;
  operatingProfit: number;
  marginPct: number;
  grossMarginPct: number;
  ebitdaPct: number;
  pie: { name: string; value: number; pct: number; color: string }[];
}

const DEFAULTS: Inputs = { revenue: "100000", cogs: "60000", sga: "20000", depreciation: "5000" };

function calculate(inputs: Inputs): Result {
  const revenue = Math.max(0, parseFloat(inputs.revenue) || 0);
  const cogs = Math.max(0, parseFloat(inputs.cogs) || 0);
  const sga = Math.max(0, parseFloat(inputs.sga) || 0);
  const depreciation = Math.max(0, parseFloat(inputs.depreciation) || 0);
  const grossProfit = revenue - cogs;
  const totalOpex = sga + depreciation;
  const operatingProfit = grossProfit - totalOpex;
  const marginPct = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;
  const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const ebitda = operatingProfit + depreciation;
  const ebitdaPct = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  const parts = [
    { name: "Cost of Goods Sold", value: cogs, color: PIE_COLORS[0] },
    { name: "SG&A Expenses", value: sga, color: PIE_COLORS[1] },
    { name: "Depreciation & Amortization", value: depreciation, color: PIE_COLORS[2] },
    { name: "Operating Profit", value: Math.max(0, operatingProfit), color: PIE_COLORS[3] },
  ];
  let sum = 0;
  const pcts = parts.map(p => {
    if (revenue <= 0) return 0;
    const v = Math.round((p.value / revenue) * 1000) / 10;
    sum += v;
    return v;
  });
  if (revenue > 0 && sum !== 100) {
    const diff = Math.round((100 - sum) * 10) / 10;
    let maxIdx = 0;
    for (let i = 1; i < pcts.length; i++) if (pcts[i] > pcts[maxIdx]) maxIdx = i;
    pcts[maxIdx] = Math.round((pcts[maxIdx] + diff) * 10) / 10;
  }
  const pie = parts.map((p, i) => ({ ...p, pct: pcts[i] })).filter(p => p.value > 0);
  return { grossProfit, totalOpex, operatingProfit, marginPct, grossMarginPct, ebitdaPct, pie };
}

const OperatingProfitMarginCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.revenue) <= 0 || num(inputs.cogs) < 0 || num(inputs.sga) < 0 || num(inputs.depreciation) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const marginColor = result.marginPct >= 20 ? "text-emerald-600" : result.marginPct >= 10 ? "text-amber-600" : "text-red-600";

  const rows = [
    { label: "Revenue", value: fmtMoney(num(inputs.revenue)) },
    { label: "Cost of Goods Sold", value: fmtMoney(num(inputs.cogs)) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit), highlight: true },
    { label: "SG&A Operating Expenses", value: fmtMoney(num(inputs.sga)) },
    { label: "Depreciation & Amortization", value: fmtMoney(num(inputs.depreciation)) },
    { label: "Total Operating Expenses", value: fmtMoney(result.totalOpex), total: true },
    { label: "Operating Profit (EBIT)", value: fmtMoney(result.operatingProfit), highlight: true },
    { label: "Operating Profit Margin", value: result.marginPct.toFixed(1) + "%", highlight: true },
  ];

  const faqs = [
    { question: "What is operating profit margin?", answer: "Operating profit margin measures how much of each revenue dollar remains after paying for COGS and operating expenses (SG&A plus depreciation and amortization), before interest and taxes. It is the clearest view of core business profitability." },
    { question: "How is it calculated?", answer: "Operating Profit = Revenue − COGS − Operating Expenses (SG&A + D&A). Margin = Operating Profit ÷ Revenue × 100. With the defaults: $100,000 − $60,000 − $25,000 = $15,000, a 15.0% operating margin." },
    { question: "What is the difference between gross and operating margin?", answer: "Gross margin subtracts only the cost of goods sold; operating margin also subtracts SG&A and depreciation. The gap between them reveals how much overhead the business carries. EBITDA margin adds depreciation back, approximating cash-based profitability." },
    { question: "What is a good operating margin?", answer: "It varies by industry: software often runs 20–40%, retail 5–10%, manufacturing 10–20%. Compare against direct competitors and track your own trend — a stable or rising margin with growing revenue is the sign of a healthy operation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Operating Profit Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Operating Profit Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="revenue" label="Revenue" value={inputs.revenue} onChange={set("revenue")} prefix="$" />
              <NumInput id="cogs" label="Cost of Goods Sold" value={inputs.cogs} onChange={set("cogs")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sga" label="SG&A Expenses" value={inputs.sga} onChange={set("sga")} prefix="$" />
              <NumInput id="dep" label="Depreciation & Amortization" value={inputs.depreciation} onChange={set("depreciation")} prefix="$" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Revenue must be &gt; 0; all expense fields must be ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Operating Profit Margin</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.marginPct.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">Operating profit: <span className="font-bold text-foreground">{fmtMoney(result.operatingProfit)}</span></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gross Margin</span>
                <span className="font-extrabold text-primary">{result.grossMarginPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Operating Margin</span>
                <span className={`font-extrabold ${marginColor}`}>{result.marginPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">EBITDA Margin</span>
                <span className="font-extrabold text-foreground">{result.ebitdaPct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Income Statement Item</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">How Each Revenue Dollar Is Spent</h3>
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
                  { label: "Cost of Goods Sold", value: fmtMoney(num(inputs.cogs)) },
                  { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
                  { label: "SG&A Expenses", value: fmtMoney(num(inputs.sga)) },
                  { label: "Depreciation & Amortization", value: fmtMoney(num(inputs.depreciation)) },
                  { label: "Operating Profit", value: fmtMoney(result.operatingProfit) },
                  { label: "Operating Margin", value: result.marginPct.toFixed(1) + "%", bold: true },
                  { label: "EBITDA Margin", value: result.ebitdaPct.toFixed(1) + "%" },
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
            <h2 className="text-2xl font-bold mb-3">The Core Profitability View</h2>
            <p>Operating profit margin is the income statement metric investors read first: it shows how efficiently a business converts revenue into profit from its core operations, before financing and taxes distort the picture. With the defaults, a $100,000 company with $60,000 COGS, $20,000 SG&A, and $5,000 of depreciation keeps $15,000 — a 15.0% operating margin.</p>
            <h2 className="text-2xl font-bold mb-3">Gross, Operating, and EBITDA Margins</h2>
            <p>Each margin strips away a different layer. Gross margin (40.0%) shows product economics before overhead. Operating margin (15.0%) includes SG&A and depreciation. EBITDA margin (20.0%) adds depreciation back for a cash-based view. Comparing the three reveals whether a business is losing money to product costs, overhead, or capital intensity.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/operating-profit-margin-calculator" />
          <PopularCalculators exclude="/calculator/operating-profit-margin-calculator" />
        </div>
      </div>
    </>
  );
};
export default OperatingProfitMarginCalculator;
