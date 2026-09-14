"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type PlanType = "payment" | "life" | "disability";

interface Inputs {
  amount: number;
  rate: number;
  years: number;
  plan: PlanType;
  premiumRate: number; // % of monthly payment
  overrideRate: boolean;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  monthlyPayment: number;
  premiumRate: number;
  monthlyPremium: number;
  totalPremium: number;
  totalInterest: number;
  totalCost: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PIE_COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const PLAN_DEFAULT_RATE: Record<PlanType, number> = { payment: 15, life: 8, disability: 12 };

function pmt(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate <= 0) return months > 0 ? principal / months : 0;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function calc(inp: Inputs): Result {
  const r = inp.rate / 100 / 12;
  const n = inp.years * 12;
  const monthlyPayment = pmt(inp.amount, r, n);
  const premiumRate = inp.overrideRate ? inp.premiumRate : PLAN_DEFAULT_RATE[inp.plan];
  const monthlyPremium = (monthlyPayment * premiumRate) / 100;
  const totalPremium = monthlyPremium * n;
  const totalInterest = Math.max(0, monthlyPayment * n - inp.amount);
  const totalCost = inp.amount + totalInterest + totalPremium;

  const planLabel =
    inp.plan === "payment"
      ? "Payment Protection (job loss + disability)"
      : inp.plan === "life"
        ? "Credit Life (pays remaining balance)"
        : "Credit Disability (loan payments while disabled)";

  const donutData = [
    { name: "Principal", value: Math.round(inp.amount), color: PIE_COLORS[0] },
    { name: "Interest", value: Math.round(totalInterest), color: PIE_COLORS[1] },
    { name: "Protection Premium", value: Math.round(totalPremium), color: PIE_COLORS[2] },
  ].filter((d) => d.value > 0);

  const breakdown: Row[] = [
    { label: "Loan Amount", value: money(inp.amount), sum: true },
    { label: "APR", value: inp.rate.toFixed(2) + "%", sum: true },
    { label: "Loan Term", value: inp.years + " years" },
    { label: "Protection Plan", value: planLabel },
    { label: "Premium Rate", value: premiumRate.toFixed(1) + "% of monthly payment", highlight: true, sum: true },
    { label: "Monthly Payment (Loan Only)", value: money2(monthlyPayment), sum: true },
    { label: "Monthly Premium", value: money2(monthlyPremium), highlight: true, sum: true },
    { label: "Total Premium over Term", value: money(totalPremium), isTotal: true, sum: true },
    { label: "Total Interest", value: money(totalInterest), isTotal: true, sum: true },
    { label: "Total Cost with Protection", value: money(totalCost), isTotal: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    monthlyPayment,
    premiumRate,
    monthlyPremium,
    totalPremium,
    totalInterest,
    totalCost,
    donutData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { amount: 20000, rate: 8, years: 5, plan: "payment", premiumRate: 15, overrideRate: false };

export default function LoanProtectionInsuranceCostCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [plan, setPlan] = useState<PlanType>(DEFAULTS.plan);
  const [premiumRate, setPremiumRate] = useState(String(DEFAULTS.premiumRate));
  const [overrideRate, setOverrideRate] = useState(false);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    amount: parseFloat(amount) || 0,
    rate: parseFloat(rate) || 0,
    years: parseInt(years) || 0,
    plan,
    premiumRate: parseFloat(premiumRate) || 0,
    overrideRate,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setRate(String(DEFAULTS.rate));
    setYears(String(DEFAULTS.years));
    setPlan(DEFAULTS.plan);
    setPremiumRate(String(DEFAULTS.premiumRate));
    setOverrideRate(false);
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const amt = parseFloat(amount) || 0;
  const rt = parseFloat(rate) || 0;
  const yrs = parseInt(years) || 0;
  const prRate = parseFloat(premiumRate) || 0;

  const valErrors: Record<string, string> = {};
  if (!amount || amt <= 0) valErrors.amount = "Loan amount must be greater than $0";
  if (rate === "" || isNaN(parseFloat(rate))) valErrors.rate = "Enter an APR";
  else if (rt < 0 || rt > 40) valErrors.rate = "APR must be between 0% and 40%";
  if (isNaN(yrs) || yrs < 1 || yrs > 30) valErrors.years = "Term must be 1–30 years";
  if (overrideRate && (premiumRate === "" || isNaN(parseFloat(premiumRate)))) valErrors.premiumRate = "Enter a premium rate";
  else if (overrideRate && (prRate < 0 || prRate > 100)) valErrors.premiumRate = "Premium rate must be between 0% and 100%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  const donutTotal = result ? result.donutData.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Protection Insurance Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Protection Insurance Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lp-amount" className="text-sm font-medium mb-1 block">Loan Amount ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="lp-amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.amount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.amount}</p>}
              </div>
              <div>
                <label htmlFor="lp-rate" className="text-sm font-medium mb-1 block">APR (%)</label>
                <div className={inputCls}>
                  <input id="lp-rate" type="number" min="0" max="40" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lp-years" className="text-sm font-medium mb-1 block">Loan Term (Years)</label>
                <div className={inputCls}>
                  <input id="lp-years" type="number" min="1" max="30" value={years} onChange={(e) => setYears(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">yrs</span>
                </div>
                {valErrors.years && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.years}</p>}
              </div>
              <div>
                <label htmlFor="lp-plan" className="text-sm font-medium mb-1 block">Protection Plan</label>
                <div className="relative h-10">
                  <select id="lp-plan" value={plan} onChange={(e) => setPlan(e.target.value as PlanType)} className={selectCls}>
                    <option value="payment">Payment Protection</option>
                    <option value="life">Credit Life</option>
                    <option value="disability">Credit Disability</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Premium Rate</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Use Custom Premium Rate</label>
                      <div className="flex items-center gap-2 h-10">
                        <button type="button" onClick={() => setOverrideRate(false)} className={`flex-1 h-10 rounded-md border text-sm font-semibold transition-colors ${!overrideRate ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input"}`}>
                          Auto ({PLAN_DEFAULT_RATE[plan].toFixed(0)}% of payment)
                        </button>
                        <button type="button" onClick={() => setOverrideRate(true)} className={`flex-1 h-10 rounded-md border text-sm font-semibold transition-colors ${overrideRate ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input"}`}>
                          Custom
                        </button>
                      </div>
                    </div>
                    {overrideRate && (
                      <div>
                        <label htmlFor="lp-rate2" className="text-sm font-medium mb-1 block">Premium Rate (% of Monthly Payment)</label>
                        <div className={inputCls}>
                          <input id="lp-rate2" type="number" min="0" max="100" step="0.5" value={premiumRate} onChange={(e) => setPremiumRate(e.target.value)} className={fieldCls} />
                          <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                        </div>
                        {valErrors.premiumRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.premiumRate}</p>}
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground">Typical lender-offered premiums run 8%–15% of the monthly payment. Compare against a standalone term life policy before you sign.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Protection Premium</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(result.monthlyPremium)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.premiumRate.toFixed(1)}% of your {money2(result.monthlyPayment)}/mo payment · {money(result.totalPremium)} over the full term
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Loan Payment", money2(result.monthlyPayment), "text-primary"],
                    ["Total Premium", money(result.totalPremium), "text-amber-600"],
                    ["Total Cost with Protection", money(result.totalCost), "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Where Your Money Goes Over the Term</h3>
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
                      <div className="flex items-center justify-center gap-5 mt-1 text-sm flex-wrap">
                        {result.donutData.map((d) => (
                          <div key={d.name} className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                            <span className="font-bold text-foreground">{Math.round((d.value / donutTotal) * 1000) / 10}%</span>
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
            <h2 className="text-2xl font-bold mb-3">The Real Cost Is the Premium Multiplied by the Term</h2>
            <p>Loan protection — sold as payment protection, credit life, or credit disability — wraps an insurance premium into your monthly payment. The premium is usually quoted as a percentage of the payment itself, so it scales silently with the loan: on a $20,000 loan at 8% over five years the payment is about $406, and a typical 15% payment-protection premium adds roughly $61 a month — more than $3,600 over the term, on a loan of only $20,000. The coverage is often genuine, but the same protection is frequently cheaper through a standalone term life or disability policy, which this calculator lets you price by switching to a custom premium rate.</p>
          </section>
          <FAQSection faqs={[
            { question: "What does loan protection insurance cover?", answer: "Payment protection makes your loan payments (or a portion) if you lose your job or become disabled; credit life pays off the remaining balance if you die; credit disability makes payments while you are disabled. Each plan has strict waiting periods and exclusions, so read the certificate before relying on it." },
            { question: "How is the premium calculated?", answer: "Lenders typically quote the premium as a percentage of your monthly loan payment — commonly 8%–15% for payment protection, lower for credit life. Because it is a percentage of the payment, the premium never shrinks even as the balance amortizes, which is why the total cost over the term can reach 15%–20% of the original loan." },
            { question: "Is loan protection worth the cost?", answer: "Often not compared with alternatives. The calculator shows the lifetime premium so you can compare it against a level term life policy or your employer's disability coverage, which usually cover more for less. Some states restrict how lenders may sell credit insurance, and you can typically cancel within a short free-look period." },
          ]} pageUrl="https://racira.com/calculator/loan-protection-insurance-cost-calculator" />
          <PopularCalculators exclude="/calculator/loan-protection-insurance-cost-calculator" />
        </div>
      </div>
    </>
  );
}
