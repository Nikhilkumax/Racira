"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AffordResult {
  maxPayment28: number;
  maxPayment36: number;
  maxLoan28: number;
  maxLoan36: number;
  totalDebtPayment: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function maxLoanFor(payment: number, ratePct: number, years: number): number {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return payment * n;
  return payment * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
}

function calcAfford(income: number, debts: number, rate: number, years: number): AffordResult {
  const monthlyIncome = income / 12;
  const maxPayment28 = monthlyIncome * 0.28;
  const maxPayment36 = monthlyIncome * 0.36 - debts;
  const totalDebtPayment = debts;
  const maxLoan28 = maxLoanFor(Math.max(0, maxPayment28), rate, years);
  const maxLoan36 = maxLoanFor(Math.max(0, maxPayment36), rate, years);
  const frontDti = (maxPayment28 / monthlyIncome) * 100;
  const backDti = ((totalDebtPayment + Math.max(maxPayment36, 0)) / monthlyIncome) * 100;
  const breakdown = [
    { label: "Annual Income", value: money(income) },
    { label: "Monthly Income", value: money(monthlyIncome) },
    { label: "Existing Monthly Debts", value: money(debts) },
    { label: "Front-End Ratio (28% of income)", value: `${fmt(frontDti)}%` },
    { label: "Max Housing Payment (28%)", value: money(Math.max(0, maxPayment28)) },
    { label: "Back-End Ratio (36% incl. debts)", value: `${fmt(backDti)}%` },
    { label: "Max Total Debt Payment (36%)", value: money(monthlyIncome * 0.36) },
    { label: "Max Mortgage Payment (36% − debts)", value: money(Math.max(0, maxPayment36)) },
    { label: "Max Loan Amount (28% rule)", value: money(maxLoan28) },
    { label: "Max Loan Amount (36% rule)", value: money(maxLoan36) },
  ];
  const summaryStats = [
    { label: "Max Payment (28%)", value: money(Math.max(0, maxPayment28)) },
    { label: "Max Payment (36%)", value: money(Math.max(0, maxPayment36)) },
    { label: "Max Loan (28% rule)", value: money(maxLoan28) },
    { label: "Max Loan (36% rule)", value: money(maxLoan36) },
    { label: "Monthly Debts", value: money(debts) },
  ];
  const chartData = [
    { name: "Housing (28%)", value: Number(Math.max(0, maxPayment28).toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Housing (36%)", value: Number(Math.max(0, maxPayment36).toFixed(0)), fill: "#f59e0b" },
    { name: "Other Debts", value: Number(debts.toFixed(0)), fill: "#10b981" },
  ];
  return { maxPayment28, maxPayment36, maxLoan28, maxLoan36, totalDebtPayment, breakdown, summaryStats, chartData };
}

const DEFAULTS = { income: "95000", debts: "500", rate: "6.5", years: "30" };

export default function MortgageAffordabilityCalculator() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [debts, setDebts] = useState(DEFAULTS.debts);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<AffordResult | null>(null);

  const inc = parseFloat(income);
  const d = parseFloat(debts);
  const r = parseFloat(rate);
  const y = parseFloat(years);
  const errs: string[] = [];
  if (!inc || inc <= 0) errs.push("Annual income must be greater than 0.");
  if (isNaN(d) || d < 0) errs.push("Monthly debts must be 0 or greater.");
  if (isNaN(r) || r < 0) errs.push("Interest rate must be 0 or greater.");
  if (!y || y <= 0 || y > 50) errs.push("Loan term must be between 1 and 50 years.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcAfford(inc, d, r, y)); };
  const reset = () => {
    setIncome(DEFAULTS.income); setDebts(DEFAULTS.debts); setRate(DEFAULTS.rate); setYears(DEFAULTS.years);
    setResult(calcAfford(95000, 500, 6.5, 30));
  };
  useEffect(() => { setResult(calcAfford(95000, 500, 6.5, 30)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What are the 28/36 rules?", answer: "Lenders like housing costs at or below 28% of gross monthly income, and all debt payments — housing plus car loans, credit cards, student loans — at or below 36%. This calculator applies both and reports the loan each supports." },
    { question: "Which number should I use?", answer: "The binding constraint is whichever loan is smaller. Most borrowers are limited by the 36% back-end ratio once other debts exist; borrowers with no debts can reach the 28% front-end ceiling. The calculator shows both explicitly." },
    { question: "What is not included?", answer: "Property taxes, insurance, HOA dues, and PMI. Those are real monthly costs and reduce what you can afford. Many lenders cap the full housing payment (PITI) rather than just principal and interest — budget for them separately." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Mortgage Affordability Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Annual Income ($)</label>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)} className={inp} placeholder="95000" />
              </div>
              <div>
                <label className={lbl}>Monthly Debts ($)</label>
                <input type="number" value={debts} onChange={e => setDebts(e.target.value)} className={inp} placeholder="500" />
              </div>
              <div>
                <label className={lbl}>Interest Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} className={inp} placeholder="6.5" />
              </div>
              <div>
                <label className={lbl}>Loan Term (years)</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} className={inp} placeholder="30" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Uses the 28% front-end and 36% back-end debt-to-income guidelines.</p>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Max Mortgage Payment (36% rule)</div>
                <div className="text-4xl font-extrabold tracking-tight">{money(Math.max(0, result.maxPayment36))}/mo</div>
                <div className="text-sm text-muted-foreground mt-1">28% rule allows {money(Math.max(0, result.maxPayment28))}/mo · max loan {money(result.maxLoan28)} / {money(result.maxLoan36)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Max Payment (28%)", money(Math.max(0, result.maxPayment28))], ["Max Payment (36%)", money(Math.max(0, result.maxPayment36))], ["Monthly Debts", money(result.totalDebtPayment)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Payment Budgets Compared</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [money(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The 36% housing budget shrinks by your existing monthly debts</p>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Bank Will Approve</h2>
            <p>Lenders ration mortgage size by debt-to-income ratio. The <strong>28/36 rule</strong> — housing under 28% of gross income, all debts under 36% — is the classic benchmark. This <strong>mortgage affordability calculator</strong> applies both and converts them into a maximum loan.</p>
            <h2 className="text-2xl font-bold mb-3">Two Rules, Two Loans</h2>
            <p>The 28% front-end ratio caps the housing payment on its own; the 36% back-end ratio subtracts your existing debts first, leaving the remainder for housing. Whichever yields the smaller loan is your real ceiling — the calculator shows both paths and their loans.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond the Ratios</h2>
            <p>Qualifying is not the same as comfortable. Property taxes, insurance, HOA fees, and repairs ride on top of the payment, and a 36% ratio leaves little margin for surprise expenses. Many buyers voluntarily cap their housing at 25–30% regardless of what a lender approves.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-affordability-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-affordability-calculator" />
        </div>
      </div>
    </>
  );
}
