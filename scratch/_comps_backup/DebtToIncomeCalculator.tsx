"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface DtiInputs {
  grossIncome: number;
  mortgagePayment: number;
  carPayment: number;
  studentLoans: number;
  creditCards: number;
  personalLoans: number;
  otherDebts: number;
}

interface DtiResult {
  totalMonthlyDebt: number;
  frontEndDti: number;
  backEndDti: number;
  qualifying: boolean;
  maxMortgagePayment: number;
  excessDebt: number;
  rating: string;
  ratingColor: string;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcDti(inp: DtiInputs): DtiResult {
  const monthlyIncome = inp.grossIncome / 12;
  const totalMonthlyDebt = inp.mortgagePayment + inp.carPayment + inp.studentLoans + inp.creditCards + inp.personalLoans + inp.otherDebts;
  const frontEndDti = monthlyIncome > 0 ? (inp.mortgagePayment / monthlyIncome) * 100 : 0;
  const backEndDti = monthlyIncome > 0 ? (totalMonthlyDebt / monthlyIncome) * 100 : 0;

  // Conventional: back-end ≤ 45%, FHA: ≤ 43%, VA: ≤ 41%
  const maxDti = 45;
  const qualifying = backEndDti <= maxDti;
  const maxMortgagePayment = monthlyIncome * (maxDti / 100) - (totalMonthlyDebt - inp.mortgagePayment);
  const excessDebt = backEndDti > maxDti ? totalMonthlyDebt - monthlyIncome * (maxDti / 100) : 0;

  let rating: string;
  let ratingColor: string;
  if (backEndDti <= 36) { rating = "Excellent"; ratingColor = "text-emerald-600"; }
  else if (backEndDti <= 43) { rating = "Good"; ratingColor = "text-emerald-600"; }
  else if (backEndDti <= 45) { rating = "Marginal"; ratingColor = "text-amber-500"; }
  else if (backEndDti <= 50) { rating = "High"; ratingColor = "text-orange-500"; }
  else { rating = "Very High"; ratingColor = "text-red-500"; }

  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Gross Monthly Income", value: `$${fmt(monthlyIncome)}` },
    { label: "Mortgage / Rent", value: `$${fmt(inp.mortgagePayment)}` },
    { label: "Car Payment", value: `$${fmt(inp.carPayment)}` },
    { label: "Student Loans", value: `$${fmt(inp.studentLoans)}` },
    { label: "Credit Card Minimums", value: `$${fmt(inp.creditCards)}` },
    { label: "Personal Loans", value: `$${fmt(inp.personalLoans)}` },
    { label: "Other Debts", value: `$${fmt(inp.otherDebts)}` },
    { label: "Total Monthly Debt", value: `$${fmt(totalMonthlyDebt)}`, highlight: true },
    { label: "Front-End DTI (Housing Only)", value: `${frontEndDti.toFixed(1)}%` },
    { label: "Back-End DTI (All Debt)", value: `${backEndDti.toFixed(1)}%`, highlight: true },
  ];

  const summaryStats = [
    { label: "Back-End DTI", value: `${backEndDti.toFixed(1)}%` },
    { label: "Front-End DTI", value: `${frontEndDti.toFixed(1)}%` },
    { label: "Total Monthly Debt", value: `$${fmt(totalMonthlyDebt)}` },
    { label: "Monthly Income", value: `$${fmt(monthlyIncome)}` },
    { label: "Qualification", value: qualifying ? "Qualifies" : "Exceeds Limit" },
    { label: "Max Mortgage Payment", value: `$${fmt(Math.max(0, maxMortgagePayment))}` },
    { label: "Excess Debt", value: excessDebt > 0 ? `$${fmt(excessDebt)}/mo` : "None" },
    { label: "Rating", value: rating },
  ];

  const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  const debtItems = [
    { name: "Mortgage/Rent", value: inp.mortgagePayment },
    { name: "Car Payment", value: inp.carPayment },
    { name: "Student Loans", value: inp.studentLoans },
    { name: "Credit Cards", value: inp.creditCards },
    { name: "Personal Loans", value: inp.personalLoans },
    { name: "Other", value: inp.otherDebts },
  ].filter(d => d.value > 0);
  const chartData = debtItems.map((d, i) => ({ ...d, color: PIE_COLORS[i % PIE_COLORS.length] }));

  return { totalMonthlyDebt, frontEndDti, backEndDti, qualifying, maxMortgagePayment: Math.max(0, maxMortgagePayment), excessDebt, rating, ratingColor, breakdown, summaryStats, chartData };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: DtiInputs = { grossIncome: 85000, mortgagePayment: 1800, carPayment: 450, studentLoans: 300, creditCards: 150, personalLoans: 0, otherDebts: 0 };

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function DebtToIncomeCalculator() {
  const [grossIncome, setGrossIncome] = useState(String(DEFAULTS.grossIncome));
  const [mortgagePayment, setMortgagePayment] = useState(String(DEFAULTS.mortgagePayment));
  const [carPayment, setCarPayment] = useState(String(DEFAULTS.carPayment));
  const [studentLoans, setStudentLoans] = useState(String(DEFAULTS.studentLoans));
  const [creditCards, setCreditCards] = useState(String(DEFAULTS.creditCards));
  const [personalLoans, setPersonalLoans] = useState(String(DEFAULTS.personalLoans));
  const [otherDebts, setOtherDebts] = useState(String(DEFAULTS.otherDebts));
  const [result, setResult] = useState<DtiResult | null>(null);

  const getInputs = (): DtiInputs => ({
    grossIncome: parseFloat(grossIncome) || 0, mortgagePayment: parseFloat(mortgagePayment) || 0,
    carPayment: parseFloat(carPayment) || 0, studentLoans: parseFloat(studentLoans) || 0,
    creditCards: parseFloat(creditCards) || 0, personalLoans: parseFloat(personalLoans) || 0,
    otherDebts: parseFloat(otherDebts) || 0,
  });

  const calculate = () => setResult(calcDti(getInputs()));
  const reset = () => {
    setGrossIncome(String(DEFAULTS.grossIncome)); setMortgagePayment(String(DEFAULTS.mortgagePayment));
    setCarPayment(String(DEFAULTS.carPayment)); setStudentLoans(String(DEFAULTS.studentLoans));
    setCreditCards(String(DEFAULTS.creditCards)); setPersonalLoans(String(DEFAULTS.personalLoans));
    setOtherDebts(String(DEFAULTS.otherDebts));
    setResult(calcDti(DEFAULTS));
  };

  useEffect(() => { setResult(calcDti(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is DTI ratio?", answer: "Debt-to-Income (DTI) ratio is the percentage of your gross monthly income that goes toward paying debts. It's calculated by dividing total monthly debt payments by gross monthly income. Lenders use DTI to assess whether you can afford a new mortgage or loan." },
    { question: "What is front-end vs back-end DTI?", answer: "Front-end DTI considers only housing costs (mortgage, property tax, insurance, HOA). Back-end DTI includes all monthly debts. Lenders typically focus on back-end DTI, with a maximum of 43–45% for conventional loans. Front-end should ideally stay below 28%." },
    { question: "What DTI do I need to qualify for a mortgage?", answer: "Conventional loans: typically 45% or lower. FHA loans: 43% or lower. VA loans: 41% or lower (with compensating factors). USDA loans: 41% or lower. Some lenders allow higher DTIs with strong credit scores and reserves." },
    { question: "How can I lower my DTI?", answer: "Pay down existing debts (especially credit cards and car loans). Increase your income through a raise or side income. Avoid taking on new debt before applying for a mortgage. Consider a less expensive home to reduce your target mortgage payment." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Debt-to-Income Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt-to-Income Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div>
              <label className="text-sm font-medium mb-1 block">Gross Annual Income ($)</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={grossIncome} onChange={e => setGrossIncome(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Mortgage / Rent ($/mo)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={mortgagePayment} onChange={e => setMortgagePayment(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Car Payment ($/mo)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={carPayment} onChange={e => setCarPayment(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Student Loans ($/mo)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={studentLoans} onChange={e => setStudentLoans(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Credit Card Minimums ($/mo)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={creditCards} onChange={e => setCreditCards(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Personal Loans ($/mo)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={personalLoans} onChange={e => setPersonalLoans(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Other Debts ($/mo)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={otherDebts} onChange={e => setOtherDebts(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Back-End DTI Ratio</div>
                <div className={`text-4xl font-extrabold tracking-tight ${result.ratingColor}`}>{result.backEndDti.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Rating: <span className={`font-bold ${result.ratingColor}`}>{result.rating}</span> · {result.qualifying ? "Qualifies for conventional mortgage" : "Exceeds 45% threshold"}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Front-End DTI", `${result.frontEndDti.toFixed(1)}%`],
                  ["Monthly Income", `$${(result.totalMonthlyDebt / (result.backEndDti / 100)).toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Max Mortgage", `$${result.maxMortgagePayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Debt Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Debt Composition</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}/mo`, "Payment"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt-to-Income Ratio?</h2>
            <p>Your debt-to-income (DTI) ratio compares your total monthly debt payments to your gross monthly income. It&apos;s expressed as a percentage and is one of the most important numbers lenders use to evaluate your mortgage application. A lower DTI indicates you have a good balance between debt and income.</p>
            <h2 className="text-2xl font-bold mb-3">DTI Guidelines by Loan Type</h2>
            <p><strong>Conventional loans:</strong> 45% or lower (some allow up to 50% with strong credit). <strong>FHA loans:</strong> 43% or lower. <strong>VA loans:</strong> 41% or lower. <strong>USDA loans:</strong> 41% or lower. These are general guidelines — individual lenders may have stricter or more flexible requirements based on your overall financial profile.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-to-income-calculator" />
          <PopularCalculators exclude="/calculator/debt-to-income-calculator" />
        </div>
      </div>
    </>
  );
}
