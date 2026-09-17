"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface HouseAffordResult {
  price: number;
  downPct: number;
  downAmount: number;
  loan: number;
  rate: number;
  termYears: number;
  income: number;
  debts: number;
  tax: number;
  insurance: number;
  pmiMonthly: number;
  pAndI: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  frontRatio: number;
  backRatio: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function calcHouse(price: number, downPct: number, rate: number, termYears: number, income: number, debts: number, tax: number, insurance: number): HouseAffordResult {
  const downAmount = price * (downPct / 100);
  const loan = price - downAmount;
  const rateMonthly = rate / 100 / 12;
  const months = termYears * 12;
  const factor = Math.pow(1 + rateMonthly, months);
  const pAndI = loan > 0 ? (loan * rateMonthly * factor) / (factor - 1) : 0;
  const pmiMonthly = downPct < 20 ? (loan * 0.005) / 12 : 0;
  const monthlyPayment = pAndI + tax / 12 + insurance / 12 + pmiMonthly;
  const totalInterest = pAndI * months - loan;
  const totalCost = downAmount + pAndI * months + (tax + insurance) * termYears + pmiMonthly * months;
  const monthlyIncome = income / 12;
  const frontRatio = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;
  const backRatio = monthlyIncome > 0 ? ((monthlyPayment + debts) / monthlyIncome) * 100 : 0;

  const breakdown = [
    { label: "Home Price", value: fmt$(price) },
    { label: "Down Payment", value: `${downPct}% → ${fmt$(downAmount)}` },
    { label: "Loan Amount", value: fmt$(loan) },
    { label: "Principal + Interest", value: fmt$(pAndI) },
    { label: "Property Tax", value: fmt$(tax / 12) + "/mo" },
    { label: "Insurance", value: fmt$(insurance / 12) + "/mo" },
    { label: "PMI", value: pmiMonthly > 0 ? fmt$(pmiMonthly) + "/mo" : "Not required" },
    { label: "Total Monthly Payment", value: fmt$(monthlyPayment) },
    { label: "Total Interest Paid", value: fmt$(totalInterest) },
    { label: "Front / Back Ratios", value: `${frontRatio.toFixed(1)}% / ${backRatio.toFixed(1)}%` },
  ];
  const summaryStats = [
    { label: "Monthly Payment", value: fmt$(monthlyPayment) },
    { label: "P&I", value: fmt$(pAndI) },
    { label: "Total Interest", value: fmt$(totalInterest) },
    { label: "Total Cost", value: fmt$(totalCost) },
    { label: "Front Ratio", value: `${frontRatio.toFixed(1)}%` },
    { label: "Back Ratio", value: `${backRatio.toFixed(1)}%` },
    { label: "Loan", value: fmt$(loan) },
    { label: "Down Payment", value: `${downPct}%` },
  ];
  const chartData = [
    { name: "P&I", value: Math.round(pAndI), fill: "hsl(var(--primary))" },
    { name: "Taxes", value: Math.round(tax / 12), fill: "#f59e0b" },
    { name: "Insurance", value: Math.round(insurance / 12), fill: "#8b5cf6" },
    { name: "PMI", value: Math.round(pmiMonthly), fill: "#ef4444" },
  ];
  return { price, downPct, downAmount, loan, rate, termYears, income, debts, tax, insurance, pmiMonthly, pAndI, monthlyPayment, totalInterest, totalCost, frontRatio, backRatio, breakdown, summaryStats, chartData };
}

const DEFAULTS = { price: "400000", down: "20", rate: "6.5", term: "30", income: "95000", debts: "500", tax: "4400", ins: "1500" };

export default function HouseAffordabilityCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [down, setDown] = useState(DEFAULTS.down);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [debts, setDebts] = useState(DEFAULTS.debts);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [ins, setIns] = useState(DEFAULTS.ins);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<HouseAffordResult | null>(null);

  const pr = parseFloat(price) || 0;
  const dn = parseFloat(down) || 0;
  const rt = parseFloat(rate) || 0;
  const tm = parseInt(term) || 0;
  const inc = parseFloat(income) || 0;
  const db = parseFloat(debts) || 0;
  const tx = parseFloat(tax) || 0;
  const insv = parseFloat(ins) || 0;
  const errs: string[] = [];
  if (pr <= 0) errs.push("Home price must be greater than 0.");
  if (dn < 0 || dn > 100) errs.push("Down payment percent must be between 0% and 100%.");
  if (rt <= 0 || rt > 20) errs.push("Interest rate must be between 0% and 20%.");
  if (tm < 10 || tm > 40) errs.push("Loan term must be 10–40 years.");
  if (inc <= 0) errs.push("Annual income must be greater than 0.");
  if (db < 0) errs.push("Monthly debts cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHouse(pr, dn, rt, tm, inc, db, tx, insv)); };
  const reset = () => {
    setPrice(DEFAULTS.price); setDown(DEFAULTS.down); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); setIncome(DEFAULTS.income); setDebts(DEFAULTS.debts); setTax(DEFAULTS.tax); setIns(DEFAULTS.ins);
    setResult(calcHouse(400000, 20, 6.5, 30, 95000, 500, 4400, 1500));
  };
  useEffect(() => { setResult(calcHouse(400000, 20, 6.5, 30, 95000, 500, 4400, 1500)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What does PITI stand for?", answer: "Principal, interest, taxes, and insurance — the four components of a typical mortgage payment. PMI joins the stack when your down payment is under 20%." },
    { question: "How do lenders use my debt ratios?", answer: "The front-end ratio is housing cost over gross income; the back-end adds all other debts. Staying under 28% and 36% respectively is the conventional guideline for approval." },
    { question: "Why does my escrow vary?", answer: "Property taxes are reassessed and insurance premiums change annually, so escrow payments are recalculated each year. This calculator uses fixed estimates for planning." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "House Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">House Affordability Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Home Price</label>
                <div className={inp}><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Down Payment</label>
                <div className={inp}><input type="number" value={down} onChange={e => setDown(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Interest Rate</label>
                <div className={inp}><input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Loan Term</label>
                <div className={inp}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
              <div>
                <label className={lbl}>Annual Income</label>
                <div className={inp}><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Monthly Debts</label>
                <div className={inp}><input type="number" value={debts} onChange={e => setDebts(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/mo</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment (PITI)</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.monthlyPayment)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.loan.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} loan at {result.rate}% · {result.frontRatio.toFixed(1)}% front ratio</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Principal + Interest`, fmt$(result.pAndI)], ["Total Interest", fmt$(result.totalInterest)], ["Front / Back", `${result.frontRatio.toFixed(1)}% / ${result.backRatio.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Payment Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Where the Payment Goes</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Monthly payment split by component</p>
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
            <h2 className="text-2xl font-bold mb-3">What You'll Actually Pay</h2>
            <p>This <strong>house affordability calculator</strong> turns a home price into the full monthly picture: principal and interest via the standard mortgage formula, plus property tax, insurance, and PMI when the down payment is under 20%. The debt ratios then show how the payment fits your income.</p>
            <h2 className="text-2xl font-bold mb-3">The Mortgage Formula</h2>
            <p>Monthly payment = P × r(1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P is the loan, r the monthly rate, and n the number of payments. Over a 30-year term, the interest component dwarfs principal early on — that is why the total-interest figure matters.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Ratios</h2>
            <p>A front ratio under 28% and back ratio under 36% signals a comfortable fit to most lenders. If yours exceed those lines, a larger down payment, lower price, or longer term brings them back into range.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/house-affordability-calculator" />
          <PopularCalculators exclude="/calculator/house-affordability-calculator" />
        </div>
      </div>
    </>
  );
}
