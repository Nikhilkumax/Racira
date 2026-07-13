"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n)>=1e6?`$${(n/1e6).toFixed(2)}M`:Math.abs(n)>=1e3?`$${(n/1e3).toFixed(1)}K`:`$${n.toFixed(2)}`;

function calcROCE(ebit: number, totalAssets: number, currentLiabilities: number) {
  const capitalEmployed = totalAssets - currentLiabilities;
  const roce = capitalEmployed > 0 ? (ebit / capitalEmployed) * 100 : 0;
  const capitalTurnover = capitalEmployed > 0 ? (ebit / capitalEmployed) : 0;
  const benchmarks = [
    {sector:"Technology",roce:28},{sector:"Healthcare",roce:18},{sector:"Retail",roce:15},
    {sector:"Manufacturing",roce:12},{sector:"Utilities",roce:8},{sector:"Real Estate",roce:6},
  ];
  const status = roce >= 20 ? "Excellent" : roce >= 12 ? "Good" : roce >= 8 ? "Adequate" : "Poor";
  return { roce, capitalEmployed, capitalTurnover, benchmarks, status };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">{label}</p>
    <p className="text-primary font-semibold">ROCE: {payload[0]?.value?.toFixed(1)}%</p>
  </div>
) : null;

const COLORS = ["hsl(var(--primary))","#10b981","#f59e0b","#8b5cf6","#ef4444","#6b7280"];

export default function ReturnOnCapitalEmployedCalculator() {
  const [ebit, setEbit] = useState("4200000");
  const [totalAssets, setTotalAssets] = useState("35000000");
  const [currentLiabilities, setCurrentLiabilities] = useState("8000000");
  const [res, setRes] = useState<ReturnType<typeof calcROCE>|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcROCE(parseFloat(ebit)||0,parseFloat(totalAssets)||0,parseFloat(currentLiabilities)||0));
  const reset = () => { setEbit("4200000");setTotalAssets("35000000");setCurrentLiabilities("8000000");setRes(calcROCE(4200000,35000000,8000000)); };

  const faqs = [
    { question: "What is ROCE?", answer: "Return on Capital Employed (ROCE) = EBIT / Capital Employed × 100%. Capital Employed = Total Assets − Current Liabilities. ROCE measures the profitability and efficiency of a company's capital use. A ROCE above the cost of capital (WACC) indicates value creation." },
    { question: "What is Capital Employed?", answer: "Capital Employed represents the total long-term funds in the business: Total Assets minus Current Liabilities. It equals equity + long-term debt — the permanent funding structure. This excludes short-term operational liabilities like accounts payable." },
    { question: "Is ROCE the same as ROA?", answer: "No. ROA = Net Income / Total Assets. ROCE uses EBIT (pre-tax, pre-interest) and Capital Employed (assets minus current liabilities). ROCE is generally preferred for comparing businesses with different capital structures because it removes financing differences." },
    { question: "What is a good ROCE?", answer: "As a rule of thumb, ROCE should exceed the company's WACC (typically 8–12%). ROCE of 15–20%+ is generally strong. Critically, a company's ROCE should consistently exceed its borrowing rate; otherwise, taking on more debt destroys value." },
    { question: "How is ROCE different from ROIC?", answer: "ROCE uses EBIT as the numerator; ROIC uses NOPAT (Net Operating Profit After Tax). ROIC is generally considered more rigorous. Both exclude the effect of financial leverage. ROCE is simpler and widely used for quick cross-sector comparison." },
    { question: "Why compare ROCE to the cost of capital?", answer: "If ROCE > WACC, the company generates surplus returns above its funding cost — it creates shareholder value. If ROCE < WACC, operations destroy value even if the company is nominally profitable. This spread (ROCE − WACC) is the ultimate test of business quality." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Financial",href:"/calculator#financial"},{label:"Return on Capital Employed Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Return on Capital Employed (ROCE) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Financial Data</h2>
            <CompactInput id="ebit" label="EBIT (Earnings Before Interest & Taxes)" value={ebit} onChange={setEbit} prefix="$" />
            <CompactInput id="ta" label="Total Assets" value={totalAssets} onChange={setTotalAssets} prefix="$" />
            <CompactInput id="cl" label="Current Liabilities" value={currentLiabilities} onChange={setCurrentLiabilities} prefix="$" />
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground">
              ROCE = EBIT ÷ Capital Employed. Capital Employed = Total Assets − Current Liabilities. Measures return from long-term funding.
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
                  <h2 className="text-2xl font-bold mb-3">ROCE Analysis</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Return on Capital Employed</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(res.roce)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Capital Employed: {fmtM(res.capitalEmployed)} · Status: {res.status}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        {l:"EBIT",v:fmtM(parseFloat(ebit)||0)},
                        {l:"Total Assets",v:fmtM(parseFloat(totalAssets)||0)},
                        {l:"Current Liabilities",v:fmtM(parseFloat(currentLiabilities)||0)},
                        {l:"Capital Employed",v:fmtM(res.capitalEmployed),b:true},
                        {l:"ROCE",v:`${fmt(res.roce)}%`,b:true},
                        {l:"Performance",v:res.status},
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
                  <h3 className="text-sm font-bold mb-3">ROCE vs Industry Benchmarks</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={195}>
                      <BarChart data={[{sector:"You",roce:parseFloat(fmt(res.roce,1))},...res.benchmarks]} margin={{top:4,right:8,left:0,bottom:4}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="sector" tick={{fontSize:10}} />
                        <YAxis tick={{fontSize:11}} tickFormatter={v=>`${v}%`} />
                        <Tooltip content={<TTip />} />
                        <Bar dataKey="roce" radius={[4,4,0,0]} name="ROCE">
                          {[{sector:"You"},...res.benchmarks].map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    {label:"ROCE",value:`${fmt(res.roce)}%`},
                    {label:"Status",value:res.status},
                    {label:"Capital Employed",value:fmtM(res.capitalEmployed)},
                    {label:"EBIT",value:fmtM(parseFloat(ebit)||0)},
                    {label:"Total Assets",value:fmtM(parseFloat(totalAssets)||0)},
                    {label:"Current Liabilities",value:fmtM(parseFloat(currentLiabilities)||0)},
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Return on Capital Employed (ROCE)?</h2>
            <p>Return on Capital Employed is a profitability ratio measuring how efficiently a company generates profits from its capital base. ROCE = EBIT / Capital Employed × 100%, where Capital Employed = Total Assets − Current Liabilities. This represents the total long-term investment in the business — equity plus long-term debt — the resources management is responsible for generating returns from.</p>
            <p>ROCE is one of the most widely used metrics by value investors, particularly those following the principles of Warren Buffett and Charlie Munger, who view consistently high ROCE as a hallmark of business quality and competitive moat. A business with ROCE of 25% is compounding shareholder capital far more effectively than one with 8% ROCE, all else equal.</p>
            <h2 className="text-2xl font-bold mb-3">Why Capital Employed Excludes Current Liabilities</h2>
            <p>Current liabilities (accounts payable, accrued expenses, short-term debt) represent operational financing that fluctuates with business activity rather than strategic capital allocation decisions. Excluding them focuses ROCE on the permanent, long-term funding structure — the capital for which management is truly accountable to investors.</p>
            <h2 className="text-2xl font-bold mb-3">ROCE vs WACC: The Critical Spread</h2>
            <p>The most powerful use of ROCE is comparing it to the Weighted Average Cost of Capital. If ROCE consistently exceeds WACC, each dollar of capital deployed creates value. If ROCE is below WACC, even profitable-looking companies are economically destroying value. This framework underpins Economic Value Added (EVA) analysis and is fundamental to understanding whether management is genuinely creating shareholder wealth.</p>
            <h2 className="text-2xl font-bold mb-3">Sector-Specific Interpretation</h2>
            <p>Technology and asset-light businesses often achieve ROCE of 20–40%+ due to scalable models with minimal capital requirements. Capital-intensive utilities and real estate businesses achieve ROCE of 5–10% which, if above their cost of capital, can still be excellent businesses. Always benchmark ROCE within the same industry and track trends over multiple years — consistency of high ROCE is more important than any single data point.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/return-on-capital-employed-calculator" />
          <PopularCalculators exclude="/calculator/return-on-capital-employed-calculator" />
        </div>
      </div>
    </>
  );
}
