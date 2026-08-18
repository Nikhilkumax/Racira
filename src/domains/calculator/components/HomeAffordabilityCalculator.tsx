"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface AffordabilityResult {
  income: number;
  downPayment: number;
  debts: number;
  rate: number;
  tax: number;
  insurance: number;
  pmiRate: number;
  termYears: number;
  monthlyIncome: number;
  frontLimit: number;
  backLimit: number;
  maxPayment: number;
  maxLoan: number;
  maxPrice: number;
  pmiMonthly: number;
  monthlyPayment: number;
  frontRatio: number;
  backRatio: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function calcAfford(income: number, downPayment: number, debts: number, rate: number, tax: number, insurance: number, pmiRate: number, termYears: number): AffordabilityResult {
  const monthlyIncome = income / 12;
  const frontLimit = monthlyIncome * 0.28;
  const backLimit = monthlyIncome * 0.36 - debts;
  const maxPayment = Math.min(frontLimit, backLimit);
  const rateMonthly = rate / 100 / 12;
  const months = termYears * 12;
  const taxMonthly = tax / 12;
  const insMonthly = insurance / 12;

  let pmiMonthly = 0;
  let maxLoan = 0;
  for (let i = 0; i < 5; i++) {
    const piBudget = maxPayment - taxMonthly - insMonthly - pmiMonthly;
    maxLoan = piBudget > 0 ? (piBudget * (1 - Math.pow(1 + rateMonthly, -months))) / rateMonthly : 0;
    const price = maxLoan + downPayment;
    const downPct = price > 0 ? downPayment / price : 1;
    pmiMonthly = downPct < 0.2 ? (maxLoan * (pmiRate / 100)) / 12 : 0;
  }
  const maxPrice = maxLoan + downPayment;
  const monthlyPayment = maxPayment;
  const frontRatio = (monthlyPayment / monthlyIncome) * 100;
  const backRatio = ((monthlyPayment + debts) / monthlyIncome) * 100;

  const breakdown = [
    { label: "Annual Income", value: fmt$(income) },
    { label: "Monthly Income", value: fmt$(monthlyIncome) },
    { label: "Front-End Limit (28%)", value: fmt$(frontLimit) },
    { label: "Back-End Limit (36% − debts)", value: fmt$(backLimit) },
    { label: "Max Monthly Payment (PITI)", value: fmt$(maxPayment) },
    { label: "Max Loan Amount", value: fmt$(maxLoan) },
    { label: "Down Payment", value: fmt$(downPayment) },
    { label: "Max Home Price", value: fmt$(maxPrice) },
  ];
  const summaryStats = [
    { label: "Max Home Price", value: fmt$(maxPrice) },
    { label: "Max Loan", value: fmt$(maxLoan) },
    { label: "Monthly Payment", value: fmt$(monthlyPayment) },
    { label: "Front Ratio", value: `${frontRatio.toFixed(1)}%` },
    { label: "Back Ratio", value: `${backRatio.toFixed(1)}%` },
    { label: "Down Payment", value: fmt$(downPayment) },
    { label: "PMI", value: pmiMonthly > 0 ? fmt$(pmiMonthly) + "/mo" : "Not required" },
    { label: "Rate", value: `${rate}%` },
  ];
  const chartData = [
    { name: "Front Limit", value: Math.round(frontLimit), fill: "#8b5cf6" },
    { name: "Back Limit", value: Math.round(backLimit), fill: "#f59e0b" },
    { name: "Payment", value: Math.round(maxPayment), fill: "hsl(var(--primary))" },
  ];
  return { income, downPayment, debts, rate, tax, insurance, pmiRate, termYears, monthlyIncome, frontLimit, backLimit, maxPayment, maxLoan, maxPrice, pmiMonthly, monthlyPayment, frontRatio, backRatio, breakdown, summaryStats, chartData };
}

const DEFAULTS = { income: "95000", down: "50000", debts: "500", rate: "6.5", tax: "4500", ins: "1500", pmi: "0.5", term: "30" };

export default function HomeAffordabilityCalculator() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [down, setDown] = useState(DEFAULTS.down);
  const [debts, setDebts] = useState(DEFAULTS.debts);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [ins, setIns] = useState(DEFAULTS.ins);
  const [pmi, setPmi] = useState(DEFAULTS.pmi);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<AffordabilityResult | null>(null);

  const inc = parseFloat(income) || 0;
  const dn = parseFloat(down) || 0;
  const db = parseFloat(debts) || 0;
  const rt = parseFloat(rate) || 0;
  const tx = parseFloat(tax) || 0;
  const insv = parseFloat(ins) || 0;
  const pm = parseFloat(pmi) || 0;
  const tm = parseInt(term) || 0;
  const errs: string[] = [];
  if (inc <= 0) errs.push("Annual income must be greater than 0.");
  if (dn < 0) errs.push("Down payment cannot be negative.");
  if (db < 0) errs.push("Monthly debts cannot be negative.");
  if (rt <= 0 || rt > 20) errs.push("Interest rate must be between 0% and 20%.");
  if (tm < 10 || tm > 40) errs.push("Loan term must be 10–40 years.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcAfford(inc, dn, db, rt, tx, insv, pm, tm)); };
  const reset = () => {
    setIncome(DEFAULTS.income); setDown(DEFAULTS.down); setDebts(DEFAULTS.debts); setRate(DEFAULTS.rate); setTax(DEFAULTS.tax); setIns(DEFAULTS.ins); setPmi(DEFAULTS.pmi); setTerm(DEFAULTS.term);
    setResult(calcAfford(95000, 50000, 500, 6.5, 4500, 1500, 0.5, 30));
  };
  useEffect(() => { setResult(calcAfford(95000, 50000, 500, 6.5, 4500, 1500, 0.5, 30)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What are the 28/36 ratios?", answer: "Lenders prefer housing costs under 28% of gross monthly income and total debt under 36%. This calculator caps your payment at the lower of the two limits." },
    { question: "What does PITI include?", answer: "Principal, interest, property taxes, and homeowners insurance — plus PMI when your down payment is under 20%. All are folded into the monthly budget here." },
    { question: "Why do I see PMI in the payment?", answer: "With a down payment below 20%, lenders require private mortgage insurance (typically 0.3–1.5% of the loan annually) until you build 20% equity." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Home Affordability Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Annual Income</label>
                <div className={inp}><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Down Payment</label>
                <div className={inp}><input type="number" value={down} onChange={e => setDown(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Monthly Debts</label>
                <div className={inp}><input type="number" value={debts} onChange={e => setDebts(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/mo</span></div>
              </div>
              <div>
                <label className={lbl}>Interest Rate</label>
                <div className={inp}><input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Property Costs</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Annual Property Tax</label>
                      <div className={inp}><input type="number" value={tax} onChange={e => setTax(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/yr</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Annual Insurance</label>
                      <div className={inp}><input type="number" value={ins} onChange={e => setIns(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/yr</span></div>
                    </div>
                    <div>
                      <label className={lbl}>PMI Rate</label>
                      <div className={inp}><input type="number" step="0.1" value={pmi} onChange={e => setPmi(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Loan Term</label>
                      <div className={inp}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Max Home Price</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.maxPrice)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt$(result.maxLoan)} loan + {fmt$(result.downPayment)} down · {fmt$(result.maxPayment)}/mo</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Max Loan`, fmt$(result.maxLoan)], ["Front Ratio", `${result.frontRatio.toFixed(1)}%`], ["Back Ratio", `${result.backRatio.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Affordability Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Payment Limits vs Payment</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
            <h2 className="text-2xl font-bold mb-3">The 28/36 Rule</h2>
            <p>This <strong>home affordability calculator</strong> caps your housing payment at the smaller of 28% of gross monthly income (front-end) or 36% minus existing debts (back-end). It then solves for the maximum loan that payment supports at your rate and term, adds the down payment, and applies PMI automatically when equity is under 20%.</p>
            <h2 className="text-2xl font-bold mb-3">From Payment to Price</h2>
            <p>The loan amount is the present value of the monthly payment stream: P × (1 − (1 + r)⁻ⁿ) ÷ r, where r is the monthly rate and n the number of payments. Property tax and insurance are deducted from the budget before the loan is solved, so the headline price is realistic.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond the Number</h2>
            <p>Ratios are a starting point, not a guarantee — credit score, reserves, and local taxes matter too. Getting pre-approved gives you the definitive figure, and leaving buffer in the budget protects against rate changes and repairs.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-affordability-calculator" />
          <PopularCalculators exclude="/calculator/home-affordability-calculator" />
        </div>
      </div>
    </>
  );
}
