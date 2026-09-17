"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

// Land Loan Payment = standard amortization formula
// M = P × [r(1+r)^n] / [(1+r)^n - 1]
// Additional: balloon payment option, interest-only period, down payment
const DEFAULTS = {
  landPrice: "150000",
  downPayment: "30000",
  interestRate: "7.5",
  loanTerm: "15",
  paymentFrequency: "monthly",
  interestOnlyYears: "0",
};

function calculate(
  landPrice: number, downPayment: number, annualRate: number,
  termYears: number, frequency: string, interestOnlyYears: number
) {
  if (landPrice <= 0 || annualRate < 0 || termYears <= 0) return null;
  const principal = landPrice - downPayment;
  if (principal <= 0) return null;

  const periodsPerYear = frequency === "monthly" ? 12 : frequency === "biweekly" ? 26 : 52;
  const r = annualRate / 100 / periodsPerYear;
  const n = termYears * periodsPerYear;
  const ioPayments = interestOnlyYears * periodsPerYear;
  const amortPeriods = n - ioPayments;

  // Interest-only payment (on full principal)
  const ioPayment = principal * r;

  // Amortizing payment (after I/O period, same principal remains)
  let amortPayment: number;
  if (r === 0) {
    amortPayment = principal / amortPeriods;
  } else {
    amortPayment = principal * (r * Math.pow(1 + r, amortPeriods)) / (Math.pow(1 + r, amortPeriods) - 1);
  }

  const totalIOPaid = ioPayment * ioPayments;
  const totalAmortPaid = amortPayment * amortPeriods;
  const totalPaid = totalIOPaid + totalAmortPaid;
  const totalInterest = totalPaid - principal;
  const downPct = (downPayment / landPrice) * 100;

  // Build amortization schedule for chart (yearly summary)
  const schedule: { year: number; balance: number; principalPaid: number; interestPaid: number }[] = [];
  let balance = principal;
  let cumPrincipal = 0;
  let cumInterest = 0;

  for (let period = 1; period <= n; period++) {
    const isIO = period <= ioPayments;
    const interestCharge = balance * r;
    const principalCharge = isIO ? 0 : amortPayment - interestCharge;
    balance = Math.max(0, balance - principalCharge);
    cumPrincipal += principalCharge;
    cumInterest += interestCharge;

    if (period % periodsPerYear === 0 || period === n) {
      schedule.push({ year: Math.ceil(period / periodsPerYear), balance: parseFloat(balance.toFixed(2)), principalPaid: parseFloat(cumPrincipal.toFixed(2)), interestPaid: parseFloat(cumInterest.toFixed(2)) });
    }
  }

  const chartData = schedule.filter((_, i) => i === 0 || (i + 1) % Math.max(1, Math.floor(schedule.length / 8)) === 0 || i === schedule.length - 1)
    .map(s => ({ year: `Y${s.year}`, balance: s.balance, interest: s.interestPaid }));

  const periodLabel = frequency === "monthly" ? "Monthly" : frequency === "biweekly" ? "Bi-weekly" : "Weekly";

  const breakdown = [
    { label: "Land Price", value: `$${landPrice.toLocaleString()}` },
    { label: "Down Payment", value: `$${downPayment.toLocaleString()} (${downPct.toFixed(1)}%)` },
    { label: "Loan Principal", value: `$${principal.toLocaleString()}` },
    { label: "Annual Interest Rate", value: `${annualRate}%` },
    { label: "Loan Term", value: `${termYears} years (${n} periods)` },
    { label: "Interest-Only Period", value: interestOnlyYears > 0 ? `${interestOnlyYears} years` : "None" },
    { label: `${periodLabel} Payment (I/O)`, value: interestOnlyYears > 0 ? `$${ioPayment.toFixed(2)}` : "N/A" },
    { label: `${periodLabel} Payment (Amort.)`, value: `$${amortPayment.toFixed(2)}` },
    { label: "Total Interest Paid", value: `$${totalInterest.toFixed(2)}` },
    { label: "Total Amount Paid", value: `$${totalPaid.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: `${periodLabel} Payment`, value: `$${amortPayment.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
    { label: "Total Paid", value: `$${totalPaid.toFixed(2)}` },
    { label: "Down Payment", value: `${downPct.toFixed(1)}%` },
    { label: "Loan Principal", value: `$${principal.toLocaleString()}` },
    { label: "Interest / Principal", value: `${((totalInterest / principal) * 100).toFixed(1)}%` },
  ];

  return { principal, ioPayment, amortPayment, totalInterest, totalPaid, periodLabel, chartData, breakdown, summaryStats, downPct };
}

const Inp = ({ id, label, value, onChange, prefix, suffix, onEnter }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative flex items-center h-10 rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">{prefix}</span>}
      <input id={id} type="number" value={value} min={0} step="any" onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === "Enter" && onEnter?.()}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">{suffix}</span>}
    </div>
  </div>
);

export default function LandLoanPaymentCalculator() {
  const [landPrice, setLandPrice] = useState(DEFAULTS.landPrice);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTerm, setLoanTerm] = useState(DEFAULTS.loanTerm);
  const [frequency, setFrequency] = useState(DEFAULTS.paymentFrequency);
  const [interestOnlyYears, setInterestOnlyYears] = useState(DEFAULTS.interestOnlyYears);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculate>>(null);

  const run = (lp=landPrice,dp=downPayment,ir=interestRate,lt=loanTerm,fr=frequency,io=interestOnlyYears) =>
    setResult(calculate(parseFloat(lp)||0,parseFloat(dp)||0,parseFloat(ir)||0,parseFloat(lt)||0,fr,parseFloat(io)||0));

  useEffect(() => { run(); }, []);

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator/finance"},{label:"Land Loan Payment Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Land Loan Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <Inp id="landPrice" label="Land Price" value={landPrice} onChange={setLandPrice} prefix="$" onEnter={run} />
              <Inp id="downPayment" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" onEnter={run} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Inp id="interestRate" label="Annual Rate" value={interestRate} onChange={setInterestRate} suffix="%" onEnter={run} />
              <Inp id="loanTerm" label="Loan Term" value={loanTerm} onChange={setLoanTerm} suffix="years" onEnter={run} />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="mt-3 border border-border rounded-lg p-4 bg-secondary/10 flex flex-col gap-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Payment Terms</div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Payment Frequency</label>
                    <div className="flex gap-2">
                      {[{ v: "monthly", l: "Monthly" }, { v: "biweekly", l: "Bi-weekly" }, { v: "weekly", l: "Weekly" }].map(o => (
                        <button key={o.v} type="button" onClick={() => { setFrequency(o.v); run(landPrice, downPayment, interestRate, loanTerm, o.v, interestOnlyYears); }}
                          className={`flex-1 h-8 rounded-md border text-xs font-medium transition-colors ${frequency === o.v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Inp id="interestOnly" label="Interest-Only Period" value={interestOnlyYears} onChange={setInterestOnlyYears} suffix="years" onEnter={run} />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => run()}
                className="h-10 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-colors">Calculate</button>
              <button type="button" onClick={() => {
                setLandPrice(DEFAULTS.landPrice); setDownPayment(DEFAULTS.downPayment);
                setInterestRate(DEFAULTS.interestRate); setLoanTerm(DEFAULTS.loanTerm);
                setFrequency(DEFAULTS.paymentFrequency); setInterestOnlyYears(DEFAULTS.interestOnlyYears);
                run(DEFAULTS.landPrice,DEFAULTS.downPayment,DEFAULTS.interestRate,DEFAULTS.loanTerm,DEFAULTS.paymentFrequency,DEFAULTS.interestOnlyYears);
              }} aria-label="Reset" className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{result.periodLabel} Payment</div>
                <div className="text-4xl font-bold text-primary">${result.amortPayment.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total paid: <span className="font-semibold text-foreground">${result.totalPaid.toFixed(2)}</span> — ${result.totalInterest.toFixed(2)} interest
                </div>
              </div>
              <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  { label: "Loan Principal", value: `$${result.principal.toLocaleString()}`, color: "text-primary" },
                  { label: "Total Interest", value: `$${result.totalInterest.toFixed(0)}`, color: "text-amber-500" },
                  { label: "Total Cost", value: `$${result.totalPaid.toFixed(0)}`, color: "" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Item</th>
                      <th className="text-right text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label.includes("Total Amount") ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="text-sm py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="text-sm py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Loan Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any, n: string) => [`$${parseFloat(v).toFixed(2)}`, n === "balance" ? "Balance" : "Cum. Interest"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: 12 }} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" name="Balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="interest" name="Interest" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is a Land Loan?</h2>
            <p className="text-muted-foreground leading-relaxed">A land loan finances the purchase of raw land, a lot, or rural acreage. Unlike mortgages for improved residential property, land loans are considered higher risk by lenders because vacant land generates no income and is harder to sell in foreclosure. This results in higher interest rates (typically 1–3% above residential mortgage rates), shorter loan terms (10–20 years vs. 30), and larger required down payments (20–50%). Defaults model a $150,000 parcel with $30,000 down (20%), 7.5% annual rate, and 15-year term — producing a monthly payment of approximately $1,188.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How Land Loan Payments Are Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Monthly Payment (M) = P × [r(1+r)ⁿ] ÷ [(1+r)ⁿ − 1], where P = principal, r = periodic rate (annual rate ÷ 12), n = total periods. The Advanced Options panel enables interest-only periods (common in construction land loans where only interest is paid while entitlement or construction occurs before switching to amortization) and payment frequency (monthly, bi-weekly, or weekly — bi-weekly payments reduce interest by the equivalent of one extra monthly payment per year). The amortization chart tracks the declining loan balance and cumulative interest paid over the full term.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The primary result shows your periodic payment. The 3-stat bar shows principal, total interest, and total cost. The breakdown table lists every component including the down payment percentage, interest-only payment if applicable, total interest, and total amount paid. The line chart shows how the outstanding balance decreases over time and how cumulative interest accumulates. The "Interest / Principal" ratio in the Summary Statistics shows how much extra you pay in interest relative to the original loan — for land loans, this is often 60–80%+ of the original principal due to higher rates and shorter terms.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/land-loan-payment-calculator" />
      </div>
    </>
  );
}
