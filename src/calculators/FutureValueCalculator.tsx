"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FutureValueCalculator() {
  const [pv, setPv] = useState("5000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("20");
  const [compound, setCompound] = useState("12");
  const [pmt, setPmt] = useState("200");
  const [res, setRes] = useState<{ fv: number; growth: number; totalPmt: number; principal: number; chartData: { year: number; balance: number; principal: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const P = parseFloat(pv) || 0;
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years) || 0;
    const m = parseFloat(compound) || 12;
    const payment = parseFloat(pmt) || 0;
    const rPerPeriod = r / m;
    const totalPeriods = m * t;
    const fvLump = P * Math.pow(1 + rPerPeriod, totalPeriods);
    const fvPmt = payment > 0 ? payment * (Math.pow(1 + rPerPeriod, totalPeriods) - 1) / rPerPeriod : 0;
    const fv = fvLump + fvPmt;
    const totalPmt = payment * totalPeriods;
    const principal = P + totalPmt;
    const growth = fv - principal;
    const chartData = Array.from({ length: Math.ceil(t) + 1 }, (_, i) => {
      const periods = m * i;
      const bal = P * Math.pow(1 + rPerPeriod, periods) + (payment > 0 ? payment * (Math.pow(1 + rPerPeriod, periods) - 1) / rPerPeriod : 0);
      const prin = P + payment * periods;
      return { year: i, balance: +bal.toFixed(2), principal: +Math.min(prin, bal).toFixed(2) };
    });
    setRes({ fv, growth, totalPmt, principal, chartData });
  };

  const reset = () => { setPv("5000"); setRate("8"); setYears("20"); setCompound("12"); setPmt("200"); };

  const faqs = [
    { question: "What is Future Value (FV)?", answer: "Future Value is the worth of a current sum of money at a specified date in the future, assuming a certain rate of growth. It answers: 'If I invest $X today at Y% per year, how much will I have in Z years?' FV is the cornerstone of investment planning, retirement savings, and college funding calculations." },
    { question: "What is the Future Value formula?", answer: "For a lump sum: FV = PV × (1 + r/n)^(n×t). For recurring payments: FV = PMT × [(1 + r/n)^(n×t) − 1] / (r/n). Combined, FV accounts for both an initial investment and ongoing contributions. Our calculator handles both simultaneously." },
    { question: "How does compounding frequency affect Future Value?", answer: "More frequent compounding generates slightly higher returns. $5,000 at 8% for 20 years: annual compounding = $23,305. Monthly compounding = $24,868. Daily compounding = $24,960. The difference is modest at lower rates but significant over long periods or at high rates." },
    { question: "Why is the rule of 72 useful?", answer: "The Rule of 72 is a quick mental shortcut: divide 72 by the annual rate to estimate how many years it takes to double your money. At 8%, money doubles in approximately 72 ÷ 8 = 9 years. At 6%, it takes 12 years. This is a good sanity check for future value estimates." },
    { question: "How does adding regular contributions affect FV?", answer: "Regular contributions have an enormous impact over time due to dollar-cost averaging and compound growth. In our example, adding $200/month to a $5,000 initial investment at 8% for 20 years grows the total to $130,000+ versus just $24,868 without contributions — over 5x the outcome." },
    { question: "What is the difference between nominal and effective interest rates?", answer: "The nominal rate is the stated annual rate (APR). The effective annual rate (EAR/APY) accounts for compounding: EAR = (1 + r/n)^n − 1. At 8% nominal with monthly compounding, the EAR is 8.30%. Banks advertise APY for savings accounts to show the true effective rate you earn." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Future Value Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Future Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Investment Details</h2>
            <CompactInput id="pv" label="Initial Investment (PV)" value={pv} onChange={setPv} prefix="$" />
            <CompactInput id="pmt" label="Monthly Contribution" value={pmt} onChange={setPmt} prefix="$" />
            <CompactInput id="rate" label="Annual Return Rate" value={rate} onChange={setRate} suffix="%" />
            <CompactInput id="years" label="Investment Period" value={years} onChange={setYears} suffix="years" />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Compounding Frequency</span>
              <div className="grid grid-cols-2 gap-2">
                {[["1", "Annual"], ["4", "Quarterly"], ["12", "Monthly"], ["365", "Daily"]].map(([v, label]) => (
                  <button key={v} type="button" onClick={() => setCompound(v)} className={`py-2 text-sm font-semibold rounded-md border transition-colors ${compound === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{label}</button>
                ))}
              </div>
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
                  <h2 className="text-2xl font-bold mb-3">Growth Results</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Future Value</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(res.fv)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Principal: {fmt(res.principal)} · Growth: {fmt(res.growth)}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Component</th><th className="p-2.5 pr-3 text-right">Amount</th><th className="p-2.5 pr-3 text-right">% of FV</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Initial Investment", value: fmt(parseFloat(pv) || 0), pct: `${((parseFloat(pv) || 0) / res.fv * 100).toFixed(1)}%` },
                        { label: "Total Contributions", value: fmt(res.totalPmt), pct: `${(res.totalPmt / res.fv * 100).toFixed(1)}%` },
                        { label: "Interest Earned", value: fmt(res.growth), pct: `${(res.growth / res.fv * 100).toFixed(1)}%` },
                        { label: "Future Value", value: fmt(res.fv), pct: "100.0%", bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{r.value}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground">{r.pct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Growth Over Time</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <defs>
                          <linearGradient id="fvGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: "Years", position: "insideBottom", offset: -2, fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmt(v)} labelFormatter={l => `Year ${l}`} />
                        <Area type="monotone" dataKey="principal" stroke="#10b981" fill="url(#principalGradient)" strokeWidth={1.5} name="Principal" />
                        <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="url(#fvGradient)" strokeWidth={2} name="Total Balance" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "Total Invested", value: fmt(res.principal) },
                    { label: "Interest Earned", value: fmt(res.growth) },
                    { label: "Return Multiple", value: `${(res.fv / Math.max(res.principal, 1)).toFixed(2)}×` },
                    { label: "ROI", value: `${(res.growth / Math.max(res.principal, 1) * 100).toFixed(1)}%` },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Future Value</h2>
            <p>Future Value (FV) is the projected value of a current sum of money at a future date, assuming a specific rate of growth over time. It is one of the most important concepts in personal finance and investing, forming the mathematical backbone of retirement planning, college savings, investment analysis, and any goal that involves accumulating money over time.</p>
            <p>The core insight behind future value is the time value of money: money today is worth more than the same amount in the future because it can be invested to earn returns. Conversely, the future value calculation tells you exactly how much your current money will grow to — making it the essential tool for turning savings goals into concrete investment plans.</p>

            <h2>The Future Value Formula</h2>
            <p>For a single lump-sum investment: FV = PV × (1 + r/n)^(n×t), where PV = present value, r = annual rate, n = compounding periods per year, t = years. For regular periodic payments (annuity): FV = PMT × [(1 + r/n)^(n×t) − 1] / (r/n). When combining both an initial investment and regular contributions (our calculator handles this), the total FV is the sum of both formulas.</p>

            <h2>The Power of Compound Interest</h2>
            <p>Einstein reportedly called compound interest "the eighth wonder of the world." The magic lies in earning returns not just on your principal, but on all previously accumulated interest. This creates exponential rather than linear growth. Starting with $5,000 at 8% for 20 years with $200/month contributions grows to approximately $130,000+ — despite only investing $53,000 in principal. Over 60% of the final balance comes from compound growth alone.</p>
            <p>This compounding effect makes time the most powerful variable in wealth building. Starting 10 years earlier can literally double or triple your final balance — even if you save the same monthly amount. The calculator's growth chart makes this exponential curve visually compelling.</p>

            <h2>Compounding Frequency Matters</h2>
            <p>The more frequently interest compounds, the more you earn. Daily compounding produces more than annual compounding, though the difference is modest for typical interest rates. The effective annual rate (EAR) captures this: at 8% nominal with monthly compounding, EAR = (1 + 0.08/12)^12 − 1 = 8.30%. Banks advertise APY (Annual Percentage Yield) which is the EAR, to help savers understand their true return.</p>

            <h2>Practical Applications</h2>
            <p>Retirement planning: Will my current 401(k) balance and monthly contributions be enough by age 65? College savings: How much do I need to invest monthly to have $200,000 in 18 years? Comparing investment options: Which account with different rates and compounding frequencies will grow more? Business projections: What will my capital equipment be worth in 5 years? Our future value calculator answers all these questions instantly.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/future-value-calculator" />
          <PopularCalculators exclude="/calculator/future-value-calculator" />
        </div>
      </div>
    </>
  );
}
