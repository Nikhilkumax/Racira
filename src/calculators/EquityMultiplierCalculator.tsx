"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 4) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n)>=1e6?`$${(n/1e6).toFixed(2)}M`:Math.abs(n)>=1e3?`$${(n/1e3).toFixed(1)}K`:`$${n.toFixed(2)}`;

function calcEquityMultiplier(totalAssets: number, totalEquity: number) {
  const em = totalEquity > 0 ? totalAssets / totalEquity : 0;
  const debtRatio = totalAssets > 0 ? (totalAssets - totalEquity) / totalAssets : 0;
  const debtToEquity = totalEquity > 0 ? (totalAssets - totalEquity) / totalEquity : 0;
  const totalDebt = totalAssets - totalEquity;
  const financialLeverage = em;
  const status = em <= 1.5 ? "Conservative" : em <= 2.5 ? "Moderate" : em <= 4 ? "Leveraged" : "Highly Leveraged";
  return { em, debtRatio, debtToEquity, totalDebt, financialLeverage, status };
}

const COLORS = ["hsl(var(--primary))", "#ef4444"];

const TTip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-semibold">{payload[0].name}: {fmtM(payload[0].value)} ({(payload[0].payload.pct*100).toFixed(1)}%)</p>
  </div>
) : null;

export default function EquityMultiplierCalculator() {
  const [totalAssets, setTotalAssets] = useState("50000000");
  const [totalEquity, setTotalEquity] = useState("20000000");
  const [res, setRes] = useState<ReturnType<typeof calcEquityMultiplier>|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcEquityMultiplier(parseFloat(totalAssets)||0,parseFloat(totalEquity)||1));
  const reset = () => { setTotalAssets("50000000");setTotalEquity("20000000");setRes(calcEquityMultiplier(50000000,20000000)); };

  const faqs = [
    { question: "What is the Equity Multiplier?", answer: "Equity Multiplier = Total Assets / Total Shareholders' Equity. It measures financial leverage — how many dollars of assets a company controls per dollar of equity. An EM of 2.5x means $2.50 in assets for every $1 of equity, implying $1.50 in debt financing." },
    { question: "How does the Equity Multiplier relate to DuPont Analysis?", answer: "The Equity Multiplier is the third factor in the classic DuPont ROE decomposition: ROE = Net Margin × Asset Turnover × Equity Multiplier. A high EM amplifies ROE when asset returns are positive, but also amplifies losses during downturns." },
    { question: "What is a good Equity Multiplier?", answer: "It depends heavily on industry. Banks routinely have EM of 10–12x (highly leveraged by nature). Utilities operate at 3–5x. Consumer goods companies typically 2–3x. Technology companies often 1.5–2.5x. Lower EM indicates more equity funding and less financial risk." },
    { question: "What is the relationship between Equity Multiplier and Debt Ratio?", answer: "Debt Ratio = 1 − (1/Equity Multiplier). At EM of 2.5x, Debt Ratio = 1 − (1/2.5) = 60%. These metrics are mathematically related, offering two perspectives on the same capital structure: the leverage multiplier vs. the debt proportion." },
    { question: "Is a higher Equity Multiplier better?", answer: "Higher EM means higher leverage, which amplifies both gains and losses. For profitable companies, higher EM boosts ROE. But excessive leverage increases default risk and financial fragility. The optimal EM balances return enhancement with acceptable risk — typically benchmarked against industry peers and credit rating requirements." },
  ];

  const ta = parseFloat(totalAssets)||0;
  const te = parseFloat(totalEquity)||0;
  const pieData = res ? [
    {name:"Equity",value:te,pct:te/ta},{name:"Debt",value:res.totalDebt,pct:res.totalDebt/ta}
  ] : [];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Financial",href:"/calculator#financial"},{label:"Equity Multiplier Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Equity Multiplier Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Balance Sheet Data</h2>
            <CompactInput id="ta" label="Total Assets" value={totalAssets} onChange={setTotalAssets} prefix="$" />
            <CompactInput id="te" label="Total Shareholders' Equity" value={totalEquity} onChange={setTotalEquity} prefix="$" />
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground">
              Equity Multiplier = Total Assets ÷ Total Equity. The third factor in DuPont Analysis — measures financial leverage.
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Leverage Analysis</h2>
                  <PieIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Equity Multiplier</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(res.em, 2)}x</div>
                  <div className="text-sm text-muted-foreground mt-1">Status: {res.status} · Debt Ratio: {(res.debtRatio*100).toFixed(1)}%</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        {l:"Total Assets",v:fmtM(ta)},
                        {l:"Total Equity",v:fmtM(te)},
                        {l:"Total Debt (Implied)",v:fmtM(res.totalDebt)},
                        {l:"Equity Multiplier",v:`${fmt(res.em,2)}x`,b:true},
                        {l:"Debt-to-Equity Ratio",v:`${fmt(res.debtToEquity,2)}x`},
                        {l:"Debt Ratio",v:`${(res.debtRatio*100).toFixed(2)}%`},
                      ].map(r=>(
                        <tr key={r.l} className={`hover:bg-secondary/20 ${r.b?"font-bold bg-secondary/30":""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.l}</td>
                          <td className="p-2.5 pr-3 text-right">{r.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">Capital Structure: Equity vs Debt</h3>
                  {mounted && pieData[0]?.value > 0 && (
                    <ResponsiveContainer width="100%" height={210}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" paddingAngle={3}>
                          {pieData.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<TTip />} />
                        <Legend iconSize={10} wrapperStyle={{fontSize:12}} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    {label:"Equity Multiplier",value:`${fmt(res.em,2)}x`},
                    {label:"Status",value:res.status},
                    {label:"Debt-to-Equity",value:`${fmt(res.debtToEquity,2)}x`},
                    {label:"Debt Ratio",value:`${(res.debtRatio*100).toFixed(1)}%`},
                    {label:"Total Equity",value:fmtM(te)},
                    {label:"Implied Debt",value:fmtM(res.totalDebt)},
                  ].map(item=>(
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Equity Multiplier?</h2>
            <p>The Equity Multiplier (EM) is a financial leverage ratio that measures how much of a company's assets are financed by equity versus debt. Formula: Equity Multiplier = Total Assets / Total Shareholders' Equity. An EM of 2.5x tells you that for every dollar of equity, the company controls $2.50 worth of assets — meaning $1.50 comes from debt financing.</p>
            <p>This ratio is the third component of the classic DuPont Analysis framework, which decomposes Return on Equity as: ROE = Net Profit Margin × Asset Turnover × Equity Multiplier. Understanding the EM allows analysts to isolate whether a company's ROE performance stems from operational excellence (high margins and turnover) or financial engineering (high leverage). Both can produce identical ROE figures but with very different risk profiles.</p>
            <h2>DuPont Analysis: Equity Multiplier in Context</h2>
            <p>Consider two companies each with 15% ROE. Company A achieves this with 10% net margin, 1.0x asset turnover, and 1.5x EM — a high-quality, low-leverage business. Company B achieves 15% ROE with 3% net margin, 1.0x asset turnover, and 5.0x EM — a low-margin, heavily leveraged business. The DuPont breakdown reveals fundamentally different risk profiles behind identical return figures. The Equity Multiplier quantifies this leverage difference precisely.</p>
            <h2>Industry Context and Risk Implications</h2>
            <p>Banks and financial institutions operate with EM of 8–15x (massive leverage backed by regulatory capital requirements and deposit insurance). Industrial companies typically maintain 2–4x. Pure equity businesses (no debt) show EM of exactly 1.0x. The appropriate EM depends on asset stability, cash flow predictability, and access to capital markets. Cyclical businesses with volatile cash flows should maintain lower EM to survive economic downturns.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/equity-multiplier-calculator" />
          <PopularCalculators exclude="/calculator/equity-multiplier-calculator" />
        </div>
      </div>
    </>
  );
}
