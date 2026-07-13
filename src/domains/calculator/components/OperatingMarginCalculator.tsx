"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtVal = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function OperatingMarginCalculator() {
  const [revenue, setRevenue] = useState("1000000");
  const [cogs, setCogs] = useState("400000");
  const [sga, setSga] = useState("250000");
  const [rd, setRd] = useState("150000");
  const [otherOpex, setOtherOpex] = useState("50000");

  const [res, setRes] = useState<{
    grossProfit: number;
    grossMargin: number;
    opex: number;
    operatingIncome: number;
    operatingMargin: number;
    chartData: { name: string; value: number }[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const rev = parseFloat(revenue) || 0;
    const cg = parseFloat(cogs) || 0;
    const sg = parseFloat(sga) || 0;
    const r = parseFloat(rd) || 0;
    const oo = parseFloat(otherOpex) || 0;

    const grossProfit = rev - cg;
    const grossMargin = rev > 0 ? (grossProfit / rev) * 100 : 0;
    const opex = sg + r + oo;
    const operatingIncome = grossProfit - opex;
    const operatingMargin = rev > 0 ? (operatingIncome / rev) * 100 : 0;

    const chartData = [
      { name: "Revenue", value: rev },
      { name: "COGS", value: cg },
      { name: "OPEX", value: opex },
      { name: "Operating Income", value: operatingIncome },
    ];

    setRes({ grossProfit, grossMargin, opex, operatingIncome, operatingMargin, chartData });
  };

  const reset = () => {
    setRevenue("1000000");
    setCogs("400000");
    setSga("250000");
    setRd("150000");
    setOtherOpex("50000");
  };

  const faqs = [
    { question: "What is Operating Margin?", answer: "Operating Margin (or operating profit margin) measures the percentage of revenue left over after paying for all variable and operating expenses (COGS, SG&A, R&D). It represents the profitability of core operations before interest and tax deductions. The formula is: Operating Margin = Operating Income ÷ Revenue × 100." },
    { question: "How does operating margin differ from gross margin?", answer: "Gross margin only subtracts the direct cost of producing goods (COGS) from revenue. Operating margin goes further by also subtracting indirect operating expenses (OPEX) like marketing, administrative salaries, office rent, and research & development. Therefore, operating margin is always lower than gross margin." },
    { question: "What is a good operating margin?", answer: "A healthy operating margin varies by industry. For software companies, a good margin is typically 20% to 30%+. For retail stores, margins are much narrower, often around 3% to 7%. An operating margin that rises over time shows a company is gaining operational leverage and managing overhead expenses effectively." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Operating Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Operating Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Revenue & Cost Details</h2>
            <CompactInput id="rev" label="Total Revenue" value={revenue} onChange={setRevenue} prefix="$" />
            <CompactInput id="cogs" label="Cost of Goods Sold (COGS)" value={cogs} onChange={setCogs} prefix="$" />
            
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <span className="text-sm font-semibold text-foreground">Operating Expenses (OPEX)</span>
              <CompactInput id="sga" label="SG&A Expenses" value={sga} onChange={setSga} prefix="$" />
              <CompactInput id="rd" label="Research & Development (R&D)" value={rd} onChange={setRd} prefix="$" />
              <CompactInput id="oo" label="Other Operating Expenses" value={otherOpex} onChange={setOtherOpex} prefix="$" />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Profitability Analysis</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Operating Margin</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{fmtPct(res.operatingMargin)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Operating Income (EBIT)</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{fmtVal(res.operatingIncome)}</div>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border mt-2">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Amount</th><th className="p-2.5 pr-3 text-right">% of Revenue</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Total Revenue", amount: res.chartData[0].value, pct: 100 },
                        { label: "Cost of Goods Sold (COGS)", amount: res.chartData[1].value, pct: (res.chartData[1].value / (parseFloat(revenue) || 1)) * 100 },
                        { label: "Gross Profit", amount: res.grossProfit, pct: res.grossMargin, bold: true },
                        { label: "Total Operating Expenses (OPEX)", amount: res.opex, pct: (res.opex / (parseFloat(revenue) || 1)) * 100 },
                        { label: "Operating Income (EBIT)", amount: res.operatingIncome, pct: res.operatingMargin, bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{fmtVal(r.amount)}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-primary">{fmtPct(r.pct)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Profitability Breakdown</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmtVal(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Operating Margin?</h2>
            <p>Operating Margin is an essential profitability ratio that measures the percentage of revenue a company retains after paying for all operating costs. These operating costs include Cost of Goods Sold (COGS) as well as Selling, General & Administrative (SG&A) expenses, Research & Development (R&D), and other overhead costs. It shows how much profit is generated per dollar of sales before taxes and financing costs are subtracted.</p>
            
            <h2 className="text-2xl font-bold mb-3">Operating Margin Formula</h2>
            <p>Operating margin is calculated using the following formula:</p>
            <p><code>Operating Margin = (Operating Income ÷ Revenue) × 100</code></p>
            <p>Operating Income (also called EBIT - Earnings Before Interest and Taxes) is: <code>Revenue − COGS − Operating Expenses (OPEX)</code>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/operating-margin-calculator" />
          <PopularCalculators exclude="/calculator/operating-margin-calculator" />
        </div>
      </div>
    </>
  );
}
