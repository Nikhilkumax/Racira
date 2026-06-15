"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface IraResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  taxSavings: number;
  effectiveReturn: number;
  chartData: { year: number; balance: number; contributions: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcIra(annualContrib: number, currentBalance: number, rate: number, years: number, taxRate: number, iraType: "traditional" | "roth"): IraResult {
  const r = rate / 100;
  let balance = currentBalance;
  const chartData: { year: number; balance: number; contributions: number }[] = [{ year: 0, balance: Math.round(balance), contributions: 0 }];
  let totalContribs = 0;

  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + r) + annualContrib;
    totalContribs += annualContrib;
    chartData.push({ year: y, balance: Math.round(balance), contributions: Math.round(currentBalance + totalContribs) });
  }

  const futureValue = balance;
  const totalInterest = futureValue - currentBalance - totalContribs;
  const taxSavings = iraType === "traditional" ? totalContribs * (taxRate / 100) : 0;
  const effectiveReturn = totalContribs > 0 ? ((futureValue - currentBalance - totalContribs) / (currentBalance + totalContribs)) * 100 : 0;

  // 2024 IRA limits
  const annualLimit = 7000;

  const breakdown = [
    { label: "IRA Type", value: iraType === "traditional" ? "Traditional IRA (Pre-Tax)" : "Roth IRA (After-Tax)" },
    { label: "Annual Contribution", value: `$${annualContrib.toLocaleString()} (2024 limit: $${annualLimit.toLocaleString()})` },
    { label: "Current Balance", value: `$${currentBalance.toLocaleString()}` },
    { label: "Expected Return", value: `${rate}% annually` },
    { label: "Investment Period", value: `${years} years` },
    { label: "Total Contributions", value: `$${totalContribs.toLocaleString()}` },
    { label: "Investment Growth", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Future Value", value: `$${futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Current Tax Savings", value: iraType === "traditional" ? `$${taxSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "Tax-free growth" },
  ];

  const summaryStats = [
    { label: "Future Value", value: `$${futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Contributions", value: `$${totalContribs.toLocaleString()}` },
    { label: "Investment Growth", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Growth Multiple", value: `${((futureValue / (currentBalance + totalContribs)) || 1).toFixed(1)}x` },
    { label: "Tax Benefit", value: iraType === "traditional" ? `$${taxSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })} saved` : "Tax-free withdrawal" },
    { label: "Interest % of Total", value: `${futureValue > 0 ? ((totalInterest / futureValue) * 100).toFixed(1) : 0}%` },
  ];

  return { futureValue, totalContributions: totalContribs, totalInterest, taxSavings, effectiveReturn, chartData, breakdown, summaryStats };
}

const DEFAULTS = { contrib: "7000", balance: "25000", rate: "7", years: "25", taxRate: "22", type: "traditional" as "traditional" | "roth" };

export default function IraCalculator() {
  const [contrib, setContrib] = useState(DEFAULTS.contrib);
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [taxRate, setTaxRate] = useState(DEFAULTS.taxRate);
  const [iraType, setIraType] = useState<"traditional" | "roth">(DEFAULTS.type);
  const [result, setResult] = useState<IraResult | null>(null);

  const calculate = () => setResult(calcIra(parseFloat(contrib) || 7000, parseFloat(balance) || 25000, parseFloat(rate) || 7, parseInt(years) || 25, parseFloat(taxRate) || 22, iraType));
  const reset = () => { setContrib(DEFAULTS.contrib); setBalance(DEFAULTS.balance); setRate(DEFAULTS.rate); setYears(DEFAULTS.years); setTaxRate(DEFAULTS.taxRate); setIraType(DEFAULTS.type); setResult(calcIra(7000, 25000, 7, 25, 22, "traditional")); };
  useEffect(() => { setResult(calcIra(7000, 25000, 7, 25, 22, "traditional")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the 2024 IRA contribution limit?", answer: "The 2024 IRA contribution limit is $7,000 ($8,000 if age 50+, due to the $1,000 catch-up contribution). This limit applies to the combined total across all your Traditional and Roth IRAs. Income limits apply for Roth IRA contributions: phase-out begins at $146,000 (single) or $230,000 (married filing jointly)." },
    { question: "Traditional IRA vs. Roth IRA — which is better?", answer: "Traditional IRA: contributions are pre-tax (reduce taxable income now), but withdrawals in retirement are taxed. Better if you're in a high tax bracket now and expect to be in a lower bracket in retirement. Roth IRA: contributions are after-tax (no immediate deduction), but all growth and qualified withdrawals are tax-free. Better if you're young or expect higher income in retirement." },
    { question: "What investment return should I expect in an IRA?", answer: "Historical average for a diversified stock/bond portfolio: 7% annually (real, after inflation). Aggressive all-stock S&P 500 index: ~10% nominal (~7% real). Conservative bond-heavy: 4–5%. Most financial planners use 6–7% as a conservative long-term planning assumption." },
    { question: "When can I withdraw from an IRA without penalty?", answer: "Age 59½ is the standard withdrawal age — before that, you face a 10% early withdrawal penalty plus income taxes (Traditional). Roth contributions (not earnings) can be withdrawn any time penalty-free. Required Minimum Distributions (RMDs) start at age 73 for Traditional IRAs. Roth IRAs have no RMDs during the owner's lifetime." },
    { question: "Can I have both a Traditional and Roth IRA?", answer: "Yes. You can contribute to both, but the combined contribution cannot exceed the annual limit ($7,000 in 2024). You can also have an IRA and a 401(k) simultaneously, though the Traditional IRA deductibility phases out at certain income levels if you or your spouse have a workplace plan." },
    { question: "What is a backdoor Roth IRA?", answer: "High earners who exceed Roth IRA income limits can make a non-deductible Traditional IRA contribution, then immediately convert it to a Roth IRA — the 'backdoor Roth.' This is legal and effective, though the pro-rata rule applies if you have pre-tax IRA balances elsewhere. Consult a tax advisor." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "IRA Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">IRA Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">IRA Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["traditional", "roth"] as const).map(t => (
                  <button key={t} onClick={() => setIraType(t)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${iraType === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>
                    {t === "traditional" ? "Traditional IRA" : "Roth IRA"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Contribution</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={contrib} onChange={e => setContrib(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Current Balance</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Return</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Years to Grow</label><div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            {iraType === "traditional" && (
              <div><label className="text-base font-medium mb-1.5 block">Current Tax Rate</label><div className={inp}><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">IRA Future Value</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Contributions: ${result.totalContributions.toLocaleString()} · Growth: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Contributions", `$${result.totalContributions.toLocaleString()}`], ["Growth", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Tax Benefit", iraType === "traditional" ? `$${result.taxSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "Tax-Free"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">IRA Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Future Value" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">IRA Growth Over Time</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="contributions" name="Contributions" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={1.5} /><Area type="monotone" dataKey="balance" name="Total Value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is an IRA Calculator?</h2>
            <p>An <strong>IRA calculator</strong> projects the future value of your Individual Retirement Account based on annual contributions, current balance, expected return, and time horizon. Whether you have a Traditional IRA (pre-tax contributions) or Roth IRA (after-tax contributions), understanding how compound growth works over decades is essential for retirement planning.</p>
            <h2>How IRA Growth Is Calculated</h2>
            <p>IRA Future Value = (Current Balance × (1 + r)^n) + (Annual Contribution × [(1 + r)^n − 1] / r). Where r = annual return rate, n = years. Tax savings for Traditional IRA = Total Contributions × Tax Rate. Roth IRA benefit = all withdrawals in retirement are completely tax-free.</p>
            <h2>Understanding Your Results</h2>
            <p>The gap between contributions and future value is pure compound interest — this is the magic of tax-deferred or tax-free growth. Starting early has an outsized effect: $7,000/year at 7% for 35 years grows to ~$1 million. The same contributions for only 25 years reach ~$455,000. A 10-year head start nearly doubles the outcome.</p>
            <h2>2024 IRA Rules and Limits</h2>
            <p>Contribution limit: $7,000 ($8,000 age 50+). Roth income limits: phaseout at $146,000–$161,000 (single), $230,000–$240,000 (married). Traditional deductibility phases out if covered by workplace plan. RMDs start at 73 for Traditional; Roth has no RMDs.</p>
            <h2>Traditional vs. Roth — The Tax Math</h2>
            <p>If your tax rate is higher now than in retirement, Traditional wins. If you expect the same or higher rate in retirement, Roth wins. Young earners in the 22% or lower bracket almost always benefit more from Roth. High earners in the 32%+ bracket often benefit from Traditional deductions today.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ira-calculator" />
          <PopularCalculators exclude="/calculator/ira-calculator" />
        </div>
      </div>
    </>
  );
}
