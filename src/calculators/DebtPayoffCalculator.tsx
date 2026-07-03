"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Debt { name: string; balance: number; rate: number; minPayment: number; }

interface DebtPayoffResult {
  totalDebt: number;
  avalancheMonths: number;
  snowballMonths: number;
  avalancheInterest: number;
  snowballInterest: number;
  savings: number;
  totalMonthly: number;
  breakdown: { label: string; value: string }[];
  chartData: { method: string; interest: number; months: number }[];
  summaryStats: { label: string; value: string }[];
}

function simulatePayoff(debts: Debt[], method: "avalanche" | "snowball", extraPayment: number): { months: number; totalInterest: number } {
  const sorted = [...debts].sort((a, b) =>
    method === "avalanche" ? b.rate - a.rate : a.balance - b.balance
  );
  const balances = sorted.map(d => d.balance);
  const rates = sorted.map(d => d.rate / 100 / 12);
  const minimums = sorted.map(d => d.minPayment);
  const totalMin = minimums.reduce((a, b) => a + b, 0);
  let totalPayment = totalMin + extraPayment;
  let totalInterest = 0;
  let months = 0;

  while (balances.some(b => b > 0) && months < 600) {
    let remaining = totalPayment;
    // Pay minimums first
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] <= 0) continue;
      const interest = balances[i] * rates[i];
      totalInterest += interest;
      const minPay = Math.min(balances[i] + interest, minimums[i]);
      balances[i] = balances[i] + interest - minPay;
      remaining -= minPay;
    }
    // Apply extra to target debt
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] <= 0) continue;
      const extra = Math.min(balances[i], remaining);
      balances[i] -= extra;
      remaining -= extra;
      if (remaining <= 0) break;
    }
    months++;
  }
  return { months, totalInterest };
}

function calcDebtPayoff(debts: Debt[], extraPayment: number): DebtPayoffResult {
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMonthly = debts.reduce((s, d) => s + d.minPayment, 0) + extraPayment;

  const avalanche = simulatePayoff(debts, "avalanche", extraPayment);
  const snowball = simulatePayoff(debts, "snowball", extraPayment);
  const savings = snowball.totalInterest - avalanche.totalInterest;

  const breakdown = [
    { label: "Total Debt", value: `$${totalDebt.toLocaleString()}` },
    { label: "Number of Debts", value: `${debts.length}` },
    { label: "Total Monthly Payment", value: `$${totalMonthly.toFixed(2)}` },
    { label: "Avalanche: Months to Payoff", value: `${avalanche.months} months (${(avalanche.months / 12).toFixed(1)} yrs)` },
    { label: "Avalanche: Total Interest", value: `$${avalanche.totalInterest.toFixed(2)}` },
    { label: "Snowball: Months to Payoff", value: `${snowball.months} months (${(snowball.months / 12).toFixed(1)} yrs)` },
    { label: "Snowball: Total Interest", value: `$${snowball.totalInterest.toFixed(2)}` },
    { label: "Interest Saved (Avalanche vs Snowball)", value: `$${savings.toFixed(2)}` },
    { label: "Recommended Method", value: savings >= 0 ? "Avalanche (saves more interest)" : "Snowball (saves more interest)" },
  ];

  const chartData = [
    { method: "Avalanche", interest: parseFloat(avalanche.totalInterest.toFixed(2)), months: avalanche.months },
    { method: "Snowball", interest: parseFloat(snowball.totalInterest.toFixed(2)), months: snowball.months },
  ];

  const summaryStats = [
    { label: "Total Debt", value: `$${totalDebt.toLocaleString()}` },
    { label: "Monthly Payment", value: `$${totalMonthly.toFixed(2)}` },
    { label: "Avalanche Interest", value: `$${avalanche.totalInterest.toFixed(0)}` },
    { label: "Snowball Interest", value: `$${snowball.totalInterest.toFixed(0)}` },
    { label: "Interest Savings", value: `$${Math.abs(savings).toFixed(0)}` },
    { label: "Faster Method", value: avalanche.months <= snowball.months ? "Avalanche" : "Snowball" },
  ];

  return { totalDebt, avalancheMonths: avalanche.months, snowballMonths: snowball.months, avalancheInterest: avalanche.totalInterest, snowballInterest: snowball.totalInterest, savings, totalMonthly, breakdown, chartData, summaryStats };
}

const DEFAULT_DEBTS: Debt[] = [
  { name: "Credit Card A", balance: 8000, rate: 24.99, minPayment: 200 },
  { name: "Credit Card B", balance: 3500, rate: 19.99, minPayment: 100 },
  { name: "Car Loan", balance: 12000, rate: 6.5, minPayment: 250 },
  { name: "Personal Loan", balance: 5000, rate: 12.0, minPayment: 130 },
];

export default function DebtPayoffCalculator() {
  const [debts, setDebts] = useState<Debt[]>(DEFAULT_DEBTS);
  const [extra, setExtra] = useState("200");
  const [result, setResult] = useState<DebtPayoffResult | null>(null);

  const calculate = () => {
    const e = parseFloat(extra) || 0;
    if (debts.length > 0) setResult(calcDebtPayoff(debts, e));
  };

  const updateDebt = (i: number, field: keyof Debt, value: string) => {
    setDebts(prev => prev.map((d, j) => j === i ? { ...d, [field]: field === "name" ? value : parseFloat(value) || 0 } : d));
  };

  const addDebt = () => setDebts(prev => [...prev, { name: `Debt ${prev.length + 1}`, balance: 0, rate: 0, minPayment: 0 }]);
  const removeDebt = (i: number) => setDebts(prev => prev.filter((_, j) => j !== i));

  useEffect(() => { setResult(calcDebtPayoff(DEFAULT_DEBTS, 200)); }, []);

  const inp = "h-8 px-2 text-sm bg-transparent outline-none border border-input rounded text-foreground w-full";

  const faqs = [
    { question: "What is the Avalanche debt payoff method?", answer: "The Avalanche method targets your highest interest rate debt first while making minimum payments on all others. When the highest-rate debt is paid off, you 'avalanche' that freed-up payment to the next highest rate. Mathematically, this minimizes total interest paid — saving hundreds or thousands of dollars compared to the Snowball method. It's the objectively optimal strategy for minimizing cost. Downside: it can take longer to eliminate any single debt if the highest-rate debt has a large balance." },
    { question: "What is the Snowball debt payoff method?", answer: "The Snowball method (popularized by Dave Ramsey) targets your smallest balance first, regardless of interest rate. When the smallest debt is paid off, you roll that payment into the next smallest. The psychological benefit: you achieve victories sooner (paid off debts = quick wins), which research shows improves adherence. Downside: you pay more total interest than Avalanche. Best for people who've tried and failed to pay down debt and need motivational structure." },
    { question: "How much extra monthly payment should I make on debt?", answer: "Every extra dollar applied to debt saves interest and time. General priority order: Pay minimums on all debts. Then: (1) Emergency fund ($1,000 starter). (2) Employer 401(k) match (free money). (3) Pay off high-interest debt (above 7%). (4) Max out HSA and Roth IRA. (5) Continue debt payoff. (6) Max 401(k). The threshold of 7% is roughly where long-term stock market returns equal or exceed the interest savings from debt payoff." },
    { question: "Should I pay off debt or invest?", answer: "General framework: Interest rate above 10%: always pay off debt first — no investment reliably beats 10%+ interest. Interest rate 7–10%: toss-up — pay off high-risk/variable-rate debt, invest if stable fixed rate. Interest rate below 7%: consider investing — historical stock market returns of 7–10%/year may outperform debt payoff. Guaranteed return: Paying off 8% debt is a guaranteed 8% return. Stock market returns are not guaranteed. Emotional peace: debt-free has value beyond pure math." },
    { question: "How does debt consolidation work?", answer: "Debt consolidation combines multiple debts into a single loan, ideally at a lower interest rate. Methods: Personal loan (consolidation loan): fixed rate, fixed term — simplifies payments. Balance transfer credit card: 0% intro APR for 12–21 months — powerful if you can pay off during the intro period (balance transfer fee of 3–5% applies). Home Equity Loan/HELOC: low rates but puts your home at risk if you default — use with caution. Caution: consolidation alone doesn't solve the spending habits that created debt — address the root cause." },
    { question: "What is the debt-to-income ratio and why does it matter?", answer: "Debt-to-Income (DTI) = Total Monthly Debt Payments ÷ Gross Monthly Income. Front-end DTI: housing costs only. Back-end DTI: all debt payments. Target: below 36% back-end DTI. Why it matters: lenders use DTI to determine mortgage eligibility. High DTI: limited ability to borrow, higher rates, financial fragility if income drops. Every debt paid off reduces DTI. Improving DTI from 45% to 36% can mean qualifying for significantly better mortgage rates." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Debt Payoff Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Debt Payoff Calculator (Avalanche vs. Snowball)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Your Debts</p>
                <button onClick={addDebt} className="text-xs text-primary font-bold hover:underline">+ Add Debt</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border"><th className="py-1.5 text-left text-muted-foreground">Name</th><th className="py-1.5 text-right text-muted-foreground">Balance</th><th className="py-1.5 text-right text-muted-foreground">APR %</th><th className="py-1.5 text-right text-muted-foreground">Min. $</th><th className="py-1.5"></th></tr></thead>
                  <tbody>
                    {debts.map((d, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-1.5 pr-1"><input type="text" value={d.name} onChange={e => updateDebt(i, "name", e.target.value)} className={inp} /></td>
                        <td className="py-1.5 px-1"><input type="number" value={d.balance || ""} onChange={e => updateDebt(i, "balance", e.target.value)} className={inp} /></td>
                        <td className="py-1.5 px-1"><input type="number" value={d.rate || ""} onChange={e => updateDebt(i, "rate", e.target.value)} step={0.1} className={inp} /></td>
                        <td className="py-1.5 px-1"><input type="number" value={d.minPayment || ""} onChange={e => updateDebt(i, "minPayment", e.target.value)} className={inp} /></td>
                        <td className="py-1.5 pl-1"><button onClick={() => removeDebt(i)} className="text-muted-foreground hover:text-destructive font-bold">×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Extra Monthly Payment</label>
              <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 text-muted-foreground">$</span>
                <input type="number" value={extra} onChange={e => setExtra(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setDebts(DEFAULT_DEBTS); setExtra("200"); setResult(calcDebtPayoff(DEFAULT_DEBTS, 200)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Avalanche Method (Recommended)</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.avalancheInterest.toFixed(0)} interest</div>
                <div className="text-base text-muted-foreground mt-1">{result.avalancheMonths} months to payoff · Saves ${result.savings.toFixed(0)} vs. Snowball</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Debt", `$${result.totalDebt.toLocaleString()}`], ["Avalanche Time", `${result.avalancheMonths} mo`], ["Snowball Time", `${result.snowballMonths} mo`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Method Comparison</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Recommended Method" ? "font-bold text-primary border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Avalanche vs. Snowball: Total Interest</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="method" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Total Interest"]} />
                    <Bar dataKey="interest" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Avalanche vs. Snowball: Which Debt Payoff Method Is Best?</h2>
            <p>This <strong>debt payoff calculator</strong> simulates both the Avalanche (highest interest rate first) and Snowball (smallest balance first) debt elimination strategies and compares total interest paid and payoff timeline. The Avalanche method is mathematically optimal — always paying less total interest. The Snowball method provides faster psychological wins. Both dramatically outperform making minimum payments only.</p>
            <h2>How the Debt Avalanche Works</h2>
            <p>Pay minimum payments on every debt. Apply all extra money to the highest interest rate debt. When paid off, roll the freed payment to the next highest rate. This cascades until all debt is gone. Example: 4 debts with rates 24.99%, 19.99%, 12%, 6.5%. Avalanche targets the 24.99% card first — every dollar applied there saves the maximum interest. The 'avalanche' of freed payments accelerates payoff on each subsequent debt.</p>
            <h2>When Snowball Outperforms</h2>
            <p>Despite costing more interest, the Snowball method may produce better real-world outcomes for people who struggle with motivation. Research by Kellogg School of Management found that people who felt progress (paid-off accounts) were more likely to stick with their debt payoff plan. If you've previously failed with Avalanche or have many small debts that can be quickly eliminated, Snowball's psychological benefits may outweigh the additional interest cost. Related tools: <a href="/calculator/budget-calculator">Budget Calculator</a>, <a href="/calculator/credit-card-payoff-calculator">Credit Card Payoff Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-payoff-calculator" />
          <PopularCalculators exclude="/calculator/debt-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
