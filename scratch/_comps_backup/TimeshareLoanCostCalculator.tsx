"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Inputs {
  price: number;
  downPct: number;
  rate: number;
  termYears: number;
  extraMonthly: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  downPayment: number;
  loanAmount: number;
  monthlyPayment: number;
  payoffMonths: number;
  payoffLabel: string;
  totalInterest: number;
  totalPaid: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function pmt(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate <= 0) return months > 0 ? principal / months : 0;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function simulate(balance: number, monthlyRate: number, payment: number, maxMonths: number) {
  let bal = balance;
  let interest = 0;
  let months = 0;
  while (bal > 0.5 && months < maxMonths) {
    months++;
    const int = bal * monthlyRate;
    interest += int;
    bal = bal + int - Math.min(payment, bal + int);
  }
  return { months, interest };
}

function calc(inp: Inputs): Result {
  const downPayment = inp.price * (inp.downPct / 100);
  const loanAmount = inp.price - downPayment;
  const r = inp.rate / 100 / 12;
  const n = inp.termYears * 12;
  const scheduled = pmt(loanAmount, r, n);
  const actualPayment = scheduled + inp.extraMonthly;
  const sim = simulate(loanAmount, r, actualPayment, n);

  const totalInterest = inp.extraMonthly > 0 ? sim.interest : scheduled * n - loanAmount;
  const totalPaid = loanAmount + totalInterest;

  const payoff = new Date(new Date().getFullYear(), new Date().getMonth() + sim.months, 1);
  const payoffLabel = sim.months + " months (" + MONTHS[payoff.getMonth()] + " " + payoff.getFullYear() + ")";

  const donutData = [
    { name: "Principal", value: Math.round(loanAmount), color: PIE_COLORS[0] },
    { name: "Interest", value: Math.round(totalInterest), color: PIE_COLORS[2] },
  ];

  const breakdown: Row[] = [
    { label: "Timeshare Price", value: money(inp.price), sum: true },
    { label: "Down Payment", value: inp.downPct.toFixed(1) + "% (" + money(downPayment) + ")", highlight: true, sum: true },
    { label: "Amount Financed", value: money(loanAmount), sum: true },
    { label: "Interest Rate", value: inp.rate.toFixed(2) + "%", sum: true },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Monthly Payment", value: money2(scheduled), highlight: true, sum: true },
  ];
  if (inp.extraMonthly > 0) {
    breakdown.push({ label: "Extra Monthly Payment", value: money2(inp.extraMonthly), highlight: true });
  }
  breakdown.push(
    { label: "Scheduled Payments", value: n + " payments" },
    { label: "Payoff Time", value: payoffLabel, sum: true },
    { label: "Total Interest", value: money(totalInterest), isTotal: true, sum: true },
    { label: "Total Paid (Financed Amount + Interest)", value: money(totalPaid), isTotal: true, sum: true }
  );
  if (inp.extraMonthly > 0) {
    breakdown.push({ label: "Interest Saved (Extra Payments)", value: money(Math.max(0, scheduled * n - loanAmount - sim.interest)), highlight: true, sum: true });
  }

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    downPayment,
    loanAmount,
    monthlyPayment: scheduled,
    payoffMonths: sim.months,
    payoffLabel,
    totalInterest,
    totalPaid,
    donutData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { price: 25000, downPct: 10, rate: 12, termYears: 10, extraMonthly: 0 };

export default function TimeshareLoanCostCalculator() {
  const [price, setPrice] = useState(String(DEFAULTS.price));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    price: parseFloat(price) || 0,
    downPct: parseFloat(downPct) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseInt(termYears) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setPrice(String(DEFAULTS.price));
    setDownPct(String(DEFAULTS.downPct));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const pr = parseFloat(price) || 0;
  const dp = parseFloat(downPct) || 0;
  const rt = parseFloat(rate) || 0;
  const yrs = parseInt(termYears) || 0;
  const extra = parseFloat(extraMonthly) || 0;

  const valErrors: Record<string, string> = {};
  if (!price || pr <= 0) valErrors.price = "Timeshare price must be greater than $0";
  if (downPct === "" || isNaN(parseFloat(downPct))) valErrors.downPct = "Enter a down payment percentage";
  else if (dp < 0 || dp > 100) valErrors.downPct = "Down payment must be between 0% and 100%";
  if (rate === "" || isNaN(parseFloat(rate))) valErrors.rate = "Enter an interest rate";
  else if (rt < 0 || rt > 40) valErrors.rate = "Interest rate must be between 0% and 40%";
  if (isNaN(yrs) || yrs < 1 || yrs > 30) valErrors.termYears = "Term must be 1–30 years";
  if (extra < 0) valErrors.extraMonthly = "Extra payment must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const donutTotal = result ? result.donutData.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Timeshare Loan Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Timeshare Loan Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ts-price" className="text-sm font-medium mb-1 block">Timeshare Price ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="ts-price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.price && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.price}</p>}
              </div>
              <div>
                <label htmlFor="ts-down" className="text-sm font-medium mb-1 block">Down Payment (%)</label>
                <div className={inputCls}>
                  <input id="ts-down" type="number" min="0" max="100" value={downPct} onChange={(e) => setDownPct(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ts-rate" className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                <div className={inputCls}>
                  <input id="ts-rate" type="number" min="0" max="40" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rate}</p>}
              </div>
              <div>
                <label htmlFor="ts-term" className="text-sm font-medium mb-1 block">Loan Term (Years)</label>
                <div className={inputCls}>
                  <input id="ts-term" type="number" min="1" max="30" value={termYears} onChange={(e) => setTermYears(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">yrs</span>
                </div>
                {valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Extra Payments</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="ts-extra" className="text-sm font-medium mb-1 block">Extra Monthly Payment ($)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="ts-extra" type="number" min="0" step="10" value={extraMonthly} onChange={(e) => setExtraMonthly(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.extraMonthly && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.extraMonthly}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(result.monthlyPayment)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {money(result.loanAmount)} financed at {(parseFloat(rate) || 0).toFixed(2)}% over {termYears || "10"} years · {result.payoffLabel}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Total Interest", money(result.totalInterest), "text-amber-600"],
                    ["Total Paid", money(result.totalPaid), "text-primary"],
                    ["Payoff Time", result.payoffLabel, "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-sm font-bold leading-tight ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Where the Money Goes</h3>
                  {donutTotal > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <RPie>
                          <Pie data={result.donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={2}>
                            {result.donutData.map((d, idx) => (
                              <Cell key={idx} fill={d.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number, name: string) => [name, money(Number(v))]} />
                        </RPie>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-center gap-5 mt-1 text-sm">
                        {result.donutData.map((d) => (
                          <div key={d.name} className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                            <span className="font-bold text-foreground">
                              {Math.round((d.value / donutTotal) * 1000) / 10}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {result.breakdown.map((r, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                          <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Timeshare Financing Is a Loan Like Any Other — Read the Total</h2>
            <p>Timeshares are usually financed by the developer's in-house lender, and those loans carry higher rates and longer terms than a typical consumer loan. The payment can look modest while the interest math quietly doubles what the vacation actually costs. This calculator treats the purchase like any amortizing loan: it subtracts your down payment from the sticker price, computes the fixed monthly payment from the rate and term, and then shows the full lifetime interest. That total — not the weekly rate or the monthly payment — is the number worth comparing against paying cash or using a home-equity line of credit.</p>
          </section>
          <FAQSection faqs={[
            { question: "What interest rate do timeshare loans typically charge?", answer: "Developer financing on timeshares commonly runs from the low teens up to 18% or more, well above rates on home equity loans or personal loans from a bank. That is why the total interest over a 10-year term can approach or exceed half of the purchase price." },
            { question: "Why does the total cost look so much higher than the price?", answer: "Because interest compounds on the financed amount every month for the full term. On a $25,000 timeshare with 10% down financed at 12% for 10 years, the interest alone is roughly $16,000 — about two-thirds of the original sticker price." },
            { question: "Can I pay a timeshare loan off early?", answer: "Yes, and the calculator shows the impact: extra monthly payments go straight to principal, cutting both the payoff time and the lifetime interest. Check your contract first — some timeshare lenders charge prepayment penalties or compute interest under the Rule of 78s, which front-loads the interest you owe." },
          ]} pageUrl="https://racira.com/calculator/timeshare-loan-cost-calculator" />
          <PopularCalculators exclude="/calculator/timeshare-loan-cost-calculator" />
        </div>
      </div>
    </>
  );
}
