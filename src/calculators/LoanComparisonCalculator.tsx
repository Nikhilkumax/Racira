"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, GitCompare, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

interface LoanOption { id: number; name: string; amount: number; rate: number; termYears: number; originationFee: number; }
interface LoanResult { id: number; name: string; monthlyPayment: number; totalInterest: number; totalCost: number; }

function calcLoan(opt: LoanOption): LoanResult {
  const { id, name, amount, rate, termYears, originationFee } = opt;
  const r = rate / 100 / 12;
  const n = termYears * 12;
  const monthly = amount > 0 && n > 0
    ? (r > 0 ? amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : amount / n)
    : 0;
  const totalInterest = Math.max(0, monthly * n - amount);
  const totalCost = totalInterest + amount + originationFee;
  return { id, name, monthlyPayment: monthly, totalInterest, totalCost };
}

const COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#8b5cf6"];
const DEFAULT_LOANS: LoanOption[] = [
  { id: 1, name: "Option A", amount: 300000, rate: 6.5, termYears: 30, originationFee: 0 },
  { id: 2, name: "Option B", amount: 300000, rate: 7.0, termYears: 25, originationFee: 0 },
];

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-2.5 pr-1 text-xs text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-2.5 py-1 text-sm bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-2.5 pl-1 text-xs text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function LoanComparisonSideBySide() {
  const [loans, setLoans] = useState<LoanOption[]>(DEFAULT_LOANS);
  const [results, setResults] = useState<LoanResult[]>([]);
  const [nextId, setNextId] = useState(3);

  const updateLoan = (id: number, field: keyof LoanOption, value: string) =>
    setLoans(prev => prev.map(l => l.id === id ? { ...l, [field]: field === "name" ? value : parseFloat(value) || 0 } : l));

  const addLoan = () => {
    if (loans.length >= 4) return;
    const newId = nextId;
    setLoans(prev => [...prev, { id: newId, name: `Option ${String.fromCharCode(64 + newId)}`, amount: 300000, rate: 6.5, termYears: 30, originationFee: 0 }]);
    setNextId(n => n + 1);
  };
  const removeLoan = (id: number) => { if (loans.length <= 2) return; setLoans(prev => prev.filter(l => l.id !== id)); };

  useEffect(() => { setResults(loans.map(calcLoan)); }, [loans]);

  const best = results.length > 0 ? results.reduce((b, r) => r.totalCost < b.totalCost ? r : b, results[0]) : null;
  const chartData = [
    { metric: "Monthly Pmt", ...Object.fromEntries(results.map(r => [r.name, Math.round(r.monthlyPayment)])) },
    { metric: "Interest ($K)", ...Object.fromEntries(results.map(r => [r.name, Math.round(r.totalInterest / 1000)])) },
    { metric: "Total Cost ($K)", ...Object.fromEntries(results.map(r => [r.name, Math.round(r.totalCost / 1000)])) },
  ];

  const faqs = [
    { question: "What should I compare when evaluating loan options?", answer: "Compare monthly payment (cash flow impact), total interest paid (true financing cost), and total cost of the loan (principal + interest + fees). A lower monthly payment doesn't always mean a better deal — a 30-year vs. 15-year comparison is the classic example where lower monthly payments mask dramatically higher total costs." },
    { question: "Why does a lower rate sometimes result in a higher total cost?", answer: "A loan with a lower interest rate but significantly longer term can cost more in total than a shorter-term loan at a higher rate. A $300,000 loan at 6% for 30 years costs $347,000 in interest. The same loan at 7% for 15 years costs only $136,000 in interest despite the higher rate." },
    { question: "How do origination fees affect loan comparison?", answer: "Origination fees are upfront costs that don't affect your monthly payment but increase total loan cost. When comparing two loans with different rates and fee structures, always include fees in your comparison. A 'no-fee' loan at 7% may be better value than a loan with a 1% origination fee at 6.75%." },
    { question: "When should I choose a shorter loan term?", answer: "Choose a shorter term when you can afford the higher monthly payment, want to build equity faster, want to be debt-free sooner, or are in a rising rate environment. The interest savings are dramatic — often 50-60% less total interest on a 15-year vs. 30-year loan." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Loan Comparison Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Comparison Calculator (Side-by-Side)</h1>
        <div className="max-w-[1180px]">
          <div className="grid gap-4 mb-6">
            {loans.map((loan, idx) => (
              <div key={loan.id} className="card-calculator !p-5 border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <input value={loan.name} onChange={e => updateLoan(loan.id, "name", e.target.value)} className="text-base font-bold bg-transparent border-none outline-none text-foreground w-28" />
                  </div>
                  {loans.length > 2 && (
                    <button onClick={() => removeLoan(loan.id)} className="text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <CompactInput id={`amount-${loan.id}`} label="Loan Amount" value={loan.amount} onChange={(v: string) => updateLoan(loan.id, "amount", v)} prefix="$" />
                  <CompactInput id={`rate-${loan.id}`} label="Interest Rate" value={loan.rate} onChange={(v: string) => updateLoan(loan.id, "rate", v)} suffix="%" />
                  <CompactInput id={`term-${loan.id}`} label="Term" value={loan.termYears} onChange={(v: string) => updateLoan(loan.id, "termYears", v)} suffix="yrs" />
                  <CompactInput id={`fee-${loan.id}`} label="Origination Fee" value={loan.originationFee} onChange={(v: string) => updateLoan(loan.id, "originationFee", v)} prefix="$" />
                </div>
              </div>
            ))}
            {loans.length < 4 && (
              <button onClick={addLoan} className="flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                <Plus className="h-4 w-4" /> Add Loan Option
              </button>
            )}
          </div>

          {results.length > 0 && (<>
            {best && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">✅ <strong>{best.name}</strong> has the lowest total cost — ${best.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })} over the loan life.</p>
              </div>
            )}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-border rounded-lg overflow-hidden text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left p-3 font-semibold text-muted-foreground border-b border-border">Metric</th>
                    {results.map((r, i) => (
                      <th key={r.id} className="text-right p-3 font-bold border-b border-border border-l">
                        <span className="flex items-center justify-end gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{r.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {([
                    ["Monthly Payment", (r: LoanResult) => `$${r.monthlyPayment.toFixed(2)}`],
                    ["Total Interest", (r: LoanResult) => `$${r.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                    ["Total Cost", (r: LoanResult) => `$${r.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ] as [string, (r: LoanResult) => string][]).map(([label, fn], ri) => {
                    const vals = results.map(fn);
                    const nums = vals.map(v => parseFloat(v.replace(/[$,]/g, "")));
                    const minVal = Math.min(...nums);
                    return (
                      <tr key={ri} className="border-b border-border/40 last:border-0 hover:bg-secondary/20">
                        <td className="p-3 text-muted-foreground font-medium">{label}</td>
                        {results.map((r, i) => {
                          const isMin = nums[i] === minVal;
                          return (
                            <td key={r.id} className={`p-3 text-right border-l border-border font-semibold ${isMin ? "text-emerald-600 font-bold" : ""}`}>{vals[i]}</td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card mb-6">
              <h3 className="text-base font-bold mb-4">Visual Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  {results.map((r, i) => (
                    <Bar key={r.id} dataKey={r.name} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>)}

          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Compare Loans Side by Side?</h2>
            <p>A <strong>Loan Comparison Calculator</strong> is the most powerful tool for evaluating competing financing offers. When you receive multiple loan quotes from different lenders, each one presents numbers in a way that emphasizes its best features. One lender might advertise a low monthly payment by extending the term. Another might show a lower rate that comes with high origination fees. Without a standardized comparison, it is nearly impossible to determine which offer is genuinely better for your financial situation.</p>
            <p>This side-by-side calculator strips away the marketing and reveals the three numbers that truly matter: monthly payment (immediate cash flow impact), total interest paid (the true cost of borrowing), and total cost of the loan including fees. Cells highlighted in green indicate the best value for that metric.</p>

            <h2 className="text-2xl font-bold mb-3">The Rate-vs-Term Trade-Off</h2>
            <p>The most common comparison scenario is rate versus term. A $300,000 loan at 6.5% for 30 years produces a monthly payment of $1,896 and total interest of $382,000. The same loan at 7.0% for 15 years costs $2,695 per month but only $185,000 in total interest. The 15-year loan has a higher rate, a 42% larger monthly payment, yet saves $197,000 in total interest. Which is better? It depends entirely on your cash flow situation and financial priorities — and this calculator makes those trade-offs immediately visible.</p>

            <h2 className="text-2xl font-bold mb-3">Including Origination Fees</h2>
            <p>Lenders often offer a choice between a "low-rate" loan with origination fees and a "no-fee" loan at a slightly higher rate. Evaluating these correctly requires including the fee in the total cost. A $300,000 loan at 6.75% with a $3,000 origination fee may cost more than a 7.0% loan with no fees, depending on how long you hold the loan. The break-even point (where the lower rate's interest savings exceed the upfront fee) typically occurs at 24-36 months. If you plan to sell or refinance before that break-even, the no-fee loan is the better choice.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-comparison-calculator-side-by-side" />
          <PopularCalculators exclude="/calculator/loan-comparison-calculator-side-by-side" />
        </div>
      </div>
    </>
  );
}
