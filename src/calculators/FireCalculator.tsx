"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FIREResult {
  fireNumber: number;
  yearsToFIRE: number;
  annualWithdrawal: number;
  monthlyNeeded: number;
  safeRate: number;
  currentGap: number;
  chartData: { year: number; portfolio: number; fireGoal: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFIRE(annualExpenses: number, currentPortfolio: number, annualSavings: number, returnRate: number, withdrawalRate: number): FIREResult {
  const fireNumber = annualExpenses / (withdrawalRate / 100);
  const r = returnRate / 100;
  const gap = Math.max(0, fireNumber - currentPortfolio);

  // Calculate years to FIRE
  let portfolio = currentPortfolio;
  let years = 0;
  const chartData: { year: number; portfolio: number; fireGoal: number }[] = [{ year: 0, portfolio: Math.round(portfolio), fireGoal: Math.round(fireNumber) }];
  while (portfolio < fireNumber && years < 60) {
    portfolio = portfolio * (1 + r) + annualSavings;
    years++;
    chartData.push({ year: years, portfolio: Math.round(portfolio), fireGoal: Math.round(fireNumber) });
  }

  const annualWithdrawal = annualExpenses;
  const monthlyNeeded = annualSavings / 12;
  const safeRate = withdrawalRate;

  const breakdown = [
    { label: "Annual Expenses", value: `$${annualExpenses.toLocaleString()}` },
    { label: "Safe Withdrawal Rate", value: `${withdrawalRate}%` },
    { label: "FIRE Number", value: `$${fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Current Portfolio", value: `$${currentPortfolio.toLocaleString()}` },
    { label: "Portfolio Gap", value: `$${gap.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Savings", value: `$${annualSavings.toLocaleString()}` },
    { label: "Expected Return", value: `${returnRate}%` },
    { label: "Years to FIRE", value: years < 60 ? `${years} years` : "60+ years — increase savings or reduce expenses" },
    { label: "Annual Withdrawal", value: `$${annualWithdrawal.toLocaleString()}` },
    { label: "Monthly Withdrawal", value: `$${(annualWithdrawal / 12).toFixed(0)}` },
  ];

  const summaryStats = [
    { label: "FIRE Number", value: `$${fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Years to FIRE", value: years < 60 ? `${years} yrs` : "60+ yrs" },
    { label: "Portfolio Gap", value: `$${gap.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Savings", value: `$${monthlyNeeded.toFixed(0)}` },
    { label: "Annual Withdrawal", value: `$${annualWithdrawal.toLocaleString()}` },
    { label: "Safe Rate", value: `${safeRate}%` },
  ];

  return { fireNumber, yearsToFIRE: years, annualWithdrawal, monthlyNeeded, safeRate, currentGap: gap, chartData, breakdown, summaryStats };
}

const DEFAULTS = { expenses: "60000", portfolio: "200000", savings: "36000", returnRate: "7", withdrawal: "4" };

export default function FireCalculator() {
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [portfolio, setPortfolio] = useState(DEFAULTS.portfolio);
  const [savings, setSavings] = useState(DEFAULTS.savings);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [withdrawal, setWithdrawal] = useState(DEFAULTS.withdrawal);
  const [result, setResult] = useState<FIREResult | null>(null);

  const calculate = () => setResult(calcFIRE(parseFloat(expenses) || 60000, parseFloat(portfolio) || 200000, parseFloat(savings) || 36000, parseFloat(returnRate) || 7, parseFloat(withdrawal) || 4));
  const reset = () => { setExpenses(DEFAULTS.expenses); setPortfolio(DEFAULTS.portfolio); setSavings(DEFAULTS.savings); setReturnRate(DEFAULTS.returnRate); setWithdrawal(DEFAULTS.withdrawal); setResult(calcFIRE(60000, 200000, 36000, 7, 4)); };
  useEffect(() => { setResult(calcFIRE(60000, 200000, 36000, 7, 4)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the FIRE number?", answer: "Your FIRE number is the total portfolio needed to retire permanently: FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate. At the classic 4% SWR, multiply annual expenses by 25. Example: $60,000/year expenses → FIRE Number = $1,500,000. Once your portfolio reaches this amount, investment returns cover all expenses indefinitely (with very high historical success rates)." },
    { question: "What is the 4% safe withdrawal rule?", answer: "The 4% rule comes from the Trinity Study (1998, updated): a balanced stock/bond portfolio can sustain 4% annual withdrawals (inflation-adjusted) for 30+ years with ~95% historical success. Based on US market data 1926–1995. For FIRE early retirees with 50+ year horizons, many use 3–3.5% SWR for added safety." },
    { question: "What is the FIRE movement?", answer: "FIRE = Financial Independence, Retire Early. The movement involves extreme saving (50–70% of income), frugality, and aggressive investing to accumulate 25x annual expenses, enabling retirement decades earlier than traditional retirement age. Sub-types: Lean FIRE (ultra-frugal, small FIRE number), Fat FIRE (higher expenses, larger portfolio), Barista FIRE (semi-retirement with part-time work)." },
    { question: "How long does it take to achieve FIRE?", answer: "Years to FIRE depends almost entirely on savings rate, not income. Savings Rate: 10% → ~40 years. 25% → ~32 years. 50% → ~17 years. 75% → ~7 years. The higher your savings rate, two things happen: you need fewer years of savings, AND you demonstrate you can live on less — lowering your FIRE number simultaneously." },
    { question: "What return rate should I assume for FIRE planning?", answer: "Conservative: 5–6% real (after inflation) for planning purposes. The historical real return of a diversified US stock/bond portfolio is 5–7%. Using 7% nominal (4% real) is extremely conservative. Using 10% nominal without inflation adjustment is overly optimistic. Most FIRE planners use 5–6% real to account for future return uncertainty." },
    { question: "What happens to healthcare costs in early retirement?", answer: "Healthcare is the #1 risk for early retirees under 65 (Medicare eligibility). Options: ACA marketplace plans (premiums depend on income — FIRE retirees with low withdrawals may qualify for large subsidies). Health sharing ministries (lower cost, limited coverage). Barista FIRE to maintain employer health benefits. Budget $500–$1,500/month for healthcare until Medicare." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "FIRE Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">FIRE Calculator (Financial Independence)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Expenses</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Current Portfolio</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={portfolio} onChange={e => setPortfolio(e.target.value)} className={ci} /></div></div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Annual Savings</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={savings} onChange={e => setSavings(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Expected Return</label><div className={inp}><input type="number" value={returnRate} onChange={e => setReturnRate(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Withdrawal Rate</label>
                <div className="grid grid-cols-3 gap-1">
                  {[["3", "3%"], ["3.5", "3.5%"], ["4", "4%"]].map(([v, l]) => (
                    <button key={v} onClick={() => setWithdrawal(v)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${withdrawal === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">FIRE Number</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Years to FIRE: {result.yearsToFIRE < 60 ? result.yearsToFIRE : "60+"} · Gap: ${result.currentGap.toLocaleString("en-US", { maximumFractionDigits: 0 })} · SWR: {result.safeRate}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["FIRE Number", `$${result.fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Years to FIRE", `${result.yearsToFIRE < 60 ? result.yearsToFIRE : "60+"} yrs`], ["Portfolio Gap", `$${result.currentGap.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">FIRE Analysis</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "FIRE Number" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Portfolio Growth to FIRE</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData.slice(0, 45)} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="fireGoal" name="FIRE Goal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeDasharray="5 5" strokeWidth={2} /><Area type="monotone" dataKey="portfolio" name="Portfolio" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
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
            <h2>What Is a FIRE Calculator?</h2>
            <p>A <strong>FIRE calculator</strong> (Financial Independence, Retire Early) computes your target portfolio size and the years required to achieve financial independence. It applies the safe withdrawal rate framework — pioneered by the Trinity Study — to determine how much wealth you need to sustain your lifestyle indefinitely from investment returns alone.</p>
            <h2>The FIRE Number Formula</h2>
            <p>FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate. At 4% SWR: FIRE Number = Annual Expenses × 25. At 3.5% SWR: FIRE Number × 28.6. At 3% SWR: FIRE Number × 33.3. The portfolio grows at your investment return rate while you add annual savings, eventually crossing the FIRE threshold.</p>
            <h2>FIRE Variations</h2>
            <p>Lean FIRE: minimal expenses ($25K–$40K/year), small portfolio ($625K–$1M). Regular FIRE: average expenses ($50K–$75K/year), portfolio $1.25M–$1.875M. Fat FIRE: high-end lifestyle ($100K+/year), portfolio $2.5M+. Barista FIRE: semi-retirement with part-time work covering some expenses, reducing required portfolio.</p>
            <h2>Why Savings Rate Is the Key Variable</h2>
            <p>The single biggest driver of FIRE achievement speed is savings rate — the percentage of income saved and invested. At 10% savings rate, you need ~43 working years. At 50%, ~17 years. At 75%, just 7 years. This is why FIRE practitioners focus obsessively on reducing expenses and increasing income rather than investment returns.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fire-calculator" />
          <PopularCalculators exclude="/calculator/fire-calculator" />
        </div>
      </div>
    </>
  );
}
