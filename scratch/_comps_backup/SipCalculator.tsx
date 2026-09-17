"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SipResult {
  futureValue: number;
  totalInvested: number;
  wealthGain: number;
  xirr: number;
  chartData: { year: number; invested: number; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSip(monthlyInvestment: number, rate: number, years: number): SipResult {
  const r = rate / 100 / 12;
  const n = years * 12;
  const futureValue = r > 0 ? monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthlyInvestment * n;
  const totalInvested = monthlyInvestment * n;
  const wealthGain = futureValue - totalInvested;
  const xirr = rate; // Monthly SIP CAGR ≈ stated rate for regular investments

  const chartData: { year: number; invested: number; value: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const mN = y * 12;
    const val = r > 0 ? monthlyInvestment * ((Math.pow(1 + r, mN) - 1) / r) * (1 + r) : monthlyInvestment * mN;
    chartData.push({ year: y, invested: monthlyInvestment * mN, value: Math.round(val) });
  }

  const breakdown = [
    { label: "Monthly SIP Amount", value: `$${monthlyInvestment.toLocaleString()}` },
    { label: "Annual Return Rate", value: `${rate}%` },
    { label: "Investment Period", value: `${years} years (${n} months)` },
    { label: "Total Amount Invested", value: `$${totalInvested.toLocaleString()}` },
    { label: "Estimated Wealth Gain", value: `$${wealthGain.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Future Value (Maturity)", value: `$${futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Wealth Gain Multiple", value: `${(futureValue / totalInvested).toFixed(2)}x` },
    { label: "Gain % of Total", value: `${((wealthGain / futureValue) * 100).toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Future Value", value: `$${futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Invested", value: `$${totalInvested.toLocaleString()}` },
    { label: "Wealth Gain", value: `$${wealthGain.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Return Multiple", value: `${(futureValue / totalInvested).toFixed(2)}x` },
    { label: "Monthly Return", value: `$${(futureValue / n).toFixed(0)} avg/mo` },
    { label: "Gain %", value: `${((wealthGain / futureValue) * 100).toFixed(1)}%` },
  ];

  return { futureValue, totalInvested, wealthGain, xirr, chartData, breakdown, summaryStats };
}

const DEFAULTS = { monthly: "500", rate: "12", years: "20" };

export default function SipCalculator() {
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<SipResult | null>(null);

  const calculate = () => setResult(calcSip(parseFloat(monthly) || 500, parseFloat(rate) || 12, parseInt(years) || 20));
  const reset = () => { setMonthly(DEFAULTS.monthly); setRate(DEFAULTS.rate); setYears(DEFAULTS.years); setResult(calcSip(500, 12, 20)); };
  useEffect(() => { setResult(calcSip(500, 12, 20)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a SIP (Systematic Investment Plan)?", answer: "A Systematic Investment Plan (SIP) is a method of investing a fixed, regular amount (weekly, monthly, or quarterly) into a mutual fund or investment account. SIPs leverage dollar-cost averaging — buying more units when prices are low and fewer when prices are high — which reduces the impact of market volatility and removes the need to time the market." },
    { question: "How is SIP return calculated?", answer: "SIP Future Value = P × [(1+r)^n − 1] / r × (1+r). Where P = monthly investment, r = monthly rate (annual rate ÷ 12), n = total months. Unlike lumpsum, SIP's compounding is on an increasing balance, making it slightly less than lumpsum at the same rate over the same period — but the dollar-cost averaging benefit often more than compensates." },
    { question: "What return rate should I use for SIP calculator?", answer: "Indian equity mutual funds (long-term): 12–14% CAGR. US equity (S&P 500, long-term): ~10% CAGR. Conservative balanced fund: 8–10%. For planning purposes: use 10–12% for equity, 6–8% for balanced, 5–6% for debt/bond funds. Returns are historical — actual future returns may differ." },
    { question: "Is SIP better than lumpsum?", answer: "SIP: ideal for salaried investors with regular income, volatile markets, and risk-averse investors. Lumpsum: better when you have a large amount available and markets are relatively low. Research shows SIP outperforms lumpsum in volatile/falling markets, while lumpsum outperforms in steadily rising markets. Many experts recommend a hybrid approach." },
    { question: "What is the best duration for SIP investment?", answer: "SIP duration depends on goal: Short-term (1–3 years): liquid/debt funds only, not equity. Medium-term (3–5 years): balanced funds. Long-term (7+ years): pure equity funds for maximum compounding. The longer the SIP horizon, the greater the compounding effect. The first $100K is hardest; the second $100K comes much faster." },
    { question: "Can I increase my SIP amount over time?", answer: "Yes — this is called a Step-Up SIP or Top-Up SIP, where you increase your contribution by a fixed amount or percentage each year. A 10% annual step-up dramatically accelerates wealth creation. Example: $500/month SIP at 12% for 20 years = $494,000. Same SIP with 10% annual step-up = $857,000 — 73% more." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "SIP Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">SIP Calculator (Systematic Investment Plan)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Monthly Investment</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={ci} /></div></div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Expected Annual Return</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[["8", "8%"], ["10", "10%"], ["12", "12%"], ["14", "14%"]].map(([v, l]) => (
                  <button key={v} onClick={() => setRate(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${rate === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
              <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Investment Period</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[["5", "5yr"], ["10", "10yr"], ["20", "20yr"], ["30", "30yr"]].map(([v, l]) => (
                  <button key={v} onClick={() => setYears(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${years === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
              <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">SIP Maturity Value</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Invested: ${result.totalInvested.toLocaleString()} · Gains: ${result.wealthGain.toLocaleString("en-US", { maximumFractionDigits: 0 })} · {(result.futureValue / result.totalInvested).toFixed(2)}x</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Invested", `$${result.totalInvested.toLocaleString()}`], ["Wealth Gain", `$${result.wealthGain.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Return Multiple", `${(result.futureValue / result.totalInvested).toFixed(2)}x`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">SIP Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Future Value (Maturity)" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Growth Projection</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="invested" name="Invested" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={1.5} /><Area type="monotone" dataKey="value" name="Value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a SIP Calculator?</h2>
            <p>A <strong>SIP calculator</strong> projects the future value of regular monthly investments using compound interest. SIP (Systematic Investment Plan) investing automates disciplined wealth building — by investing a fixed amount every month, you leverage both compound growth and dollar-cost averaging to build significant wealth over time.</p>
            <h2 className="text-2xl font-bold mb-3">SIP Formula</h2>
            <p>FV = P × [(1+r)^n − 1] / r × (1+r). Where P = monthly investment amount, r = monthly return rate (annual ÷ 12), n = number of months. The extra (1+r) factor accounts for beginning-of-period investment timing (most SIPs invest at the start of each period).</p>
            <h2 className="text-2xl font-bold mb-3">The Magic of Starting Early</h2>
            <p>$500/month at 12% for 20 years = $494,000. Starting 5 years earlier (25 years): $941,000 — nearly double from just 5 extra years. Starting 5 years later (15 years): $250,000 — half the outcome. The compounding curve accelerates dramatically in the later years — the last 5 years of a 20-year SIP generate more wealth than the first 15 years combined.</p>
            <h2 className="text-2xl font-bold mb-3">SIP vs. Lumpsum: The Dollar-Cost Averaging Advantage</h2>
            <p>SIP automatically buys more units when prices are low (after market crashes) and fewer when prices are high. Over a full market cycle, this often produces better average cost than a single lumpsum investment. Studies show SIP outperforms lumpsum in volatile markets, making it the preferred choice for most retail investors.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sip-calculator" />
          <PopularCalculators exclude="/calculator/sip-calculator" />
        </div>
      </div>
    </>
  );
}
