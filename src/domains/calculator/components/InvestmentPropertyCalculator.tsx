"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PropertyResult {
  price: number;
  downPct: number;
  downAmount: number;
  loan: number;
  rent: number;
  expenses: number;
  rate: number;
  termYears: number;
  noi: number;
  capRate: number;
  debtService: number;
  cashFlow: number;
  cashOnCash: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function calcProperty(price: number, downPct: number, rent: number, expenses: number, rate: number, termYears: number): PropertyResult {
  const downAmount = price * (downPct / 100);
  const loan = price - downAmount;
  const noi = rent * 12 - expenses * 12;
  const capRate = price > 0 ? (noi / price) * 100 : 0;
  const rateMonthly = rate / 100 / 12;
  const months = termYears * 12;
  const factor = Math.pow(1 + rateMonthly, months);
  const monthlyPI = loan > 0 ? (loan * rateMonthly * factor) / (factor - 1) : 0;
  const debtService = monthlyPI * 12;
  const cashFlow = noi - debtService;
  const cashOnCash = downAmount > 0 ? (cashFlow / downAmount) * 100 : 0;

  const breakdown = [
    { label: "Purchase Price", value: fmt$(price) },
    { label: "Down Payment", value: `${downPct}% → ${fmt$(downAmount)}` },
    { label: "Loan Amount", value: fmt$(loan) },
    { label: "Gross Annual Rent", value: fmt$(rent * 12) },
    { label: "Annual Expenses", value: fmt$(expenses * 12) },
    { label: "Net Operating Income", value: fmt$(noi) },
    { label: "Cap Rate", value: `${capRate.toFixed(2)}%` },
    { label: "Annual Debt Service", value: fmt$(debtService) },
    { label: "Annual Cash Flow", value: fmt$(cashFlow) },
    { label: "Cash-on-Cash Return", value: `${cashOnCash.toFixed(2)}%` },
  ];
  const summaryStats = [
    { label: "Annual Cash Flow", value: fmt$(cashFlow) },
    { label: "Monthly Cash Flow", value: fmt$(cashFlow / 12) },
    { label: "Cap Rate", value: `${capRate.toFixed(2)}%` },
    { label: "Cash-on-Cash", value: `${cashOnCash.toFixed(2)}%` },
    { label: "NOI", value: fmt$(noi) },
    { label: "Debt Service", value: fmt$(debtService) },
    { label: "Down Payment", value: fmt$(downAmount) },
    { label: "Gross Rent", value: fmt$(rent * 12) },
  ];
  const chartData = [
    { name: "Cash Flow", value: Math.max(0, Math.round(cashFlow)), fill: "hsl(var(--primary))" },
    { name: "Debt Service", value: Math.max(0, Math.round(debtService)), fill: "#8b5cf6" },
    { name: "Expenses", value: Math.max(0, Math.round(expenses * 12)), fill: "#f59e0b" },
  ];
  return { price, downPct, downAmount, loan, rent, expenses, rate, termYears, noi, capRate, debtService, cashFlow, cashOnCash, breakdown, summaryStats, chartData };
}

const DEFAULTS = { price: "350000", down: "20", rent: "2800", expenses: "700", rate: "6.5", term: "30" };

export default function InvestmentPropertyCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [down, setDown] = useState(DEFAULTS.down);
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<PropertyResult | null>(null);

  const pr = parseFloat(price) || 0;
  const dn = parseFloat(down) || 0;
  const rn = parseFloat(rent) || 0;
  const ex = parseFloat(expenses) || 0;
  const rt = parseFloat(rate) || 0;
  const tm = parseInt(term) || 0;
  const errs: string[] = [];
  if (pr <= 0) errs.push("Purchase price must be greater than 0.");
  if (dn < 0 || dn > 100) errs.push("Down payment must be 0–100%.");
  if (rn <= 0) errs.push("Monthly rent must be greater than 0.");
  if (ex < 0) errs.push("Monthly expenses cannot be negative.");
  if (rt <= 0 || rt > 20) errs.push("Interest rate must be 0–20%.");
  if (tm < 10 || tm > 40) errs.push("Loan term must be 10–40 years.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcProperty(pr, dn, rn, ex, rt, tm)); };
  const reset = () => {
    setPrice(DEFAULTS.price); setDown(DEFAULTS.down); setRent(DEFAULTS.rent); setExpenses(DEFAULTS.expenses); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term);
    setResult(calcProperty(350000, 20, 2800, 700, 6.5, 30));
  };
  useEffect(() => { setResult(calcProperty(350000, 20, 2800, 700, 6.5, 30)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is NOI?", answer: "Net operating income is gross rent minus operating expenses — the property's income before mortgage payments. It measures the asset itself, independent of how it is financed." },
    { question: "What is cap rate?", answer: "NOI divided by purchase price. A 7% cap means the property pays back its price in about 14 years before financing. It is the standard way to compare deals regardless of leverage." },
    { question: "What is cash-on-cash return?", answer: "Annual cash flow divided by your actual cash invested (down payment). It tells you the yield on your money — the number most investors use to judge a deal's cash performance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Investment Property Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Investment Property Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Purchase Price</label>
                <div className={inp}><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Down Payment</label>
                <div className={inp}><input type="number" value={down} onChange={e => setDown(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Monthly Rent</label>
                <div className={inp}><input type="number" value={rent} onChange={e => setRent(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/mo</span></div>
              </div>
              <div>
                <label className={lbl}>Monthly Expenses</label>
                <div className={inp}><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/mo</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Financing</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Interest Rate</label>
                      <div className={inp}><input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Cash Flow</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.cashFlow)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt$(result.cashFlow / 12)}/mo · {result.cashOnCash.toFixed(2)}% cash-on-cash · {result.capRate.toFixed(2)}% cap</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Cap Rate`, `${result.capRate.toFixed(2)}%`], ["Cash-on-Cash", `${result.cashOnCash.toFixed(2)}%`], ["NOI", fmt$(result.noi)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Property Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 8 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 8 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Where the Rent Goes</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Annual gross rent split by destination</p>
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
            <h2 className="text-2xl font-bold mb-3">From Rent to Return</h2>
            <p>This <strong>investment property calculator</strong> walks the full income stack: gross rent minus operating expenses gives NOI; NOI divided by price is the cap rate; NOI minus mortgage payments is cash flow; and cash flow divided by your down payment is the cash-on-cash return.</p>
            <h2 className="text-2xl font-bold mb-3">Leverage Changes the Picture</h2>
            <p>Cap rate measures the property; cash-on-cash measures your money. With 20% down, the same property can yield a 7.2% cap rate but a much higher cash-on-cash return — leverage amplifies both gains and losses, so underwrite at realistic vacancy and repair costs.</p>
            <h2 className="text-2xl font-bold mb-3">What the Defaults Assume</h2>
            <p>The example expense figure (~25% of rent) covers taxes, insurance, and maintenance but not vacancy or major capital repairs. Seasoned investors add 5–10% vacancy and a capex reserve before trusting the cash-flow number.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-property-calculator" />
          <PopularCalculators exclude="/calculator/investment-property-calculator" />
        </div>
      </div>
    </>
  );
}
