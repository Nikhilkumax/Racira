"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

type ServiceType = "regular" | "reserve";
type UsageType = "first" | "subsequent";

interface Inputs {
  loanAmount: number;
  downPct: number;
  service: ServiceType;
  usage: UsageType;
  disabled: boolean;
  feeMethod: "finance" | "upfront";
  rate: number;
  termYears: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  feeRate: number;
  feeAmount: number;
  baseLoan: number;
  financedLoan: number;
  paymentUpfront: number;
  paymentFinanced: number;
  totalInterestUpfront: number;
  totalInterestFinanced: number;
  totalCostFinanced: number;
  extraInterestFinancing: number;
  chartData: { name: string; payment: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function feeRateFor(service: ServiceType, usage: UsageType, downPct: number): number {
  const d = downPct;
  const tier = d < 5 ? 0 : d < 10 ? 1 : 2;
  // VA funding fee schedule (2024–2025): rows by down-payment tier,
  // columns by service category and first/subsequent use.
  const table: Record<string, number[]> = {
    "regular-first": [2.15, 1.5, 1.25],
    "regular-subsequent": [3.3, 1.5, 1.25],
    "reserve-first": [2.4, 1.75, 1.5],
    "reserve-subsequent": [3.3, 1.75, 1.5],
  };
  return table[service + "-" + usage][tier];
}

function pmt(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate <= 0) return months > 0 ? principal / months : 0;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function calc(inp: Inputs): Result {
  const baseLoan = inp.loanAmount * (1 - inp.downPct / 100);
  const feeRate = inp.disabled ? 0 : feeRateFor(inp.service, inp.usage, inp.downPct);
  const feeAmount = (baseLoan * feeRate) / 100;
  const financedLoan = baseLoan + feeAmount;
  const r = inp.rate / 100 / 12;
  const n = inp.termYears * 12;

  const paymentUpfront = pmt(baseLoan, r, n);
  const paymentFinanced = pmt(financedLoan, r, n);
  const totalInterestUpfront = paymentUpfront * n - baseLoan;
  const totalInterestFinanced = paymentFinanced * n - financedLoan;
  const totalCostFinanced = financedLoan + totalInterestFinanced;
  const extraInterestFinancing = Math.max(0, totalInterestFinanced - totalInterestUpfront);

  const methodLabel = inp.feeMethod === "finance" ? "Added to Loan" : "Paid Upfront";
  const serviceLabel = inp.service === "regular" ? "Regular Military" : "Reserve / National Guard";
  const usageLabel = inp.usage === "first" ? "First-Time Use" : "Subsequent Use";

  const breakdown: Row[] = [
    { label: "Purchase Price", value: money(inp.loanAmount) },
    { label: "Down Payment", value: inp.downPct.toFixed(1) + "% (" + money(inp.loanAmount * (inp.downPct / 100)) + ")" },
    { label: "Service Category", value: serviceLabel },
    { label: "Loan Usage", value: usageLabel },
    { label: "Base Loan Amount (After Down Payment)", value: money(baseLoan), sum: true },
    { label: "Funding Fee Rate", value: inp.disabled ? "0% — Waived" : feeRate.toFixed(2) + "%", highlight: true, sum: true },
    { label: "Funding Fee Amount", value: inp.disabled ? money(0) + " (exempt)" : money(feeAmount), highlight: true, sum: true },
    { label: "Fee Payment Method", value: methodLabel, sum: true },
    { label: "Loan Amount Financed", value: money(financedLoan), sum: true },
    { label: "Monthly Payment — Fee Paid Upfront", value: money2(paymentUpfront), highlight: inp.feeMethod === "upfront", sum: true },
    { label: "Monthly Payment — Fee Financed", value: money2(paymentFinanced), highlight: inp.feeMethod === "finance", sum: true },
    { label: "Total Interest (Life of Loan)", value: money(inp.feeMethod === "finance" ? totalInterestFinanced : totalInterestUpfront), isTotal: true, sum: true },
    { label: "Total Loan Payments (Life of Loan)", value: money(inp.feeMethod === "finance" ? totalCostFinanced : baseLoan + totalInterestUpfront), isTotal: true, sum: true },
  ];
  if (!inp.disabled && feeAmount > 0) {
    breakdown.push({
      label: "Extra Interest from Financing the Fee",
      value: money(extraInterestFinancing),
      highlight: true,
      sum: true,
    });
  }

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  const chartData = [
    { name: "Fee Paid Upfront", payment: Math.round(paymentUpfront) },
    { name: "Fee Financed", payment: Math.round(paymentFinanced) },
  ];

  return {
    feeRate,
    feeAmount,
    baseLoan,
    financedLoan,
    paymentUpfront,
    paymentFinanced,
    totalInterestUpfront,
    totalInterestFinanced,
    totalCostFinanced,
    extraInterestFinancing,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { loanAmount: 350000, downPct: 0, service: "regular", usage: "first", disabled: false, feeMethod: "finance", rate: 6.5, termYears: 30 };

export default function VaLoanFundingFeeCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [service, setService] = useState<ServiceType>(DEFAULTS.service);
  const [usage, setUsage] = useState<UsageType>(DEFAULTS.usage);
  const [disabled, setDisabled] = useState(DEFAULTS.disabled ? "yes" : "no");
  const [feeMethod, setFeeMethod] = useState(DEFAULTS.feeMethod);
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    downPct: parseFloat(downPct) || 0,
    service,
    usage,
    disabled: disabled === "yes",
    feeMethod,
    rate: parseFloat(rate) || 0,
    termYears: parseInt(termYears) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setDownPct(String(DEFAULTS.downPct));
    setService(DEFAULTS.service);
    setUsage(DEFAULTS.usage);
    setDisabled(DEFAULTS.disabled ? "yes" : "no");
    setFeeMethod(DEFAULTS.feeMethod);
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const amt = parseFloat(loanAmount) || 0;
  const dp = parseFloat(downPct) || 0;
  const rt = parseFloat(rate) || 0;
  const yrs = parseInt(termYears) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  else if (amt > 10000000) valErrors.loanAmount = "Loan amount looks too large (max $10,000,000)";
  if (downPct === "" || isNaN(parseFloat(downPct))) valErrors.downPct = "Enter a down payment percentage";
  else if (dp < 0 || dp >= 100) valErrors.downPct = "Down payment must be 0–99%";
  if (rate === "" || isNaN(parseFloat(rate))) valErrors.rate = "Enter an interest rate";
  else if (rt <= 0 || rt > 20) valErrors.rate = "Interest rate must be between 0.1% and 20%";
  if (isNaN(yrs) || yrs < 5 || yrs > 50) valErrors.termYears = "Term must be 5–50 years";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "VA Loan Funding Fee Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">VA Loan Funding Fee Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="va-amount" className="text-sm font-medium mb-1 block">Loan Amount ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="va-amount" type="number" min="0" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}
              </div>
              <div>
                <label htmlFor="va-down" className="text-sm font-medium mb-1 block">Down Payment (%)</label>
                <div className={inputCls}>
                  <input id="va-down" type="number" min="0" max="99" value={downPct} onChange={(e) => setDownPct(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="va-service" className="text-sm font-medium mb-1 block">Service Category</label>
                <div className="relative h-10">
                  <select id="va-service" value={service} onChange={(e) => setService(e.target.value as ServiceType)} className={selectCls}>
                    <option value="regular">Regular Military</option>
                    <option value="reserve">Reserve / National Guard</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="va-usage" className="text-sm font-medium mb-1 block">Loan Usage</label>
                <div className="relative h-10">
                  <select id="va-usage" value={usage} onChange={(e) => setUsage(e.target.value as UsageType)} className={selectCls}>
                    <option value="first">First-Time Use</option>
                    <option value="subsequent">Subsequent Use</option>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Funding Fee & Exemptions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="va-disabled" className="text-sm font-medium mb-1 block">VA Disability (10%+)</label>
                      <div className="relative h-10">
                        <select id="va-disabled" value={disabled} onChange={(e) => setDisabled(e.target.value)} className={selectCls}>
                          <option value="no">No</option>
                          <option value="yes">Yes — fee waived</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="va-method" className="text-sm font-medium mb-1 block">Fee Payment</label>
                      <div className="relative h-10">
                        <select id="va-method" value={feeMethod} onChange={(e) => setFeeMethod(e.target.value as Inputs["feeMethod"])} className={selectCls}>
                          <option value="finance">Add Fee to Loan</option>
                          <option value="upfront">Pay Fee Upfront</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Payment Comparison</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="va-rate" className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                      <div className={inputCls}>
                        <input id="va-rate" type="number" min="0.1" max="20" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={fieldCls} />
                        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                      </div>
                      {valErrors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rate}</p>}
                    </div>
                    <div>
                      <label htmlFor="va-term" className="text-sm font-medium mb-1 block">Loan Term (Years)</label>
                      <div className="relative h-10">
                        <select id="va-term" value={termYears} onChange={(e) => setTermYears(e.target.value)} className={selectCls}>
                          <option value="15">15 years</option>
                          <option value="20">20 years</option>
                          <option value="30">30 years</option>
                        </select>
                      </div>
                      {valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    {result.feeRate > 0 ? "VA Funding Fee" : "VA Funding Fee — Waived"}
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money(result.feeAmount)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.feeRate > 0
                      ? result.feeRate.toFixed(2) + "% of " + money(result.baseLoan) + " · financing it adds " + money2(result.paymentFinanced - result.paymentUpfront) + "/mo over " + (termYears || "30") + " years"
                      : "Eligible disabled veterans pay no funding fee."}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Funding Fee Rate", result.feeRate > 0 ? result.feeRate.toFixed(2) + "%" : "0% (waived)", "text-primary"],
                    ["Funding Fee", money(result.feeAmount), "text-amber-600"],
                    [feeMethod === "finance" ? "Payment (Fee Financed)" : "Payment (Fee Upfront)", money2(feeMethod === "finance" ? result.paymentFinanced : result.paymentUpfront), "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Monthly Payment Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={72}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} domain={[0, (dataMax: number) => Math.ceil((dataMax * 1.15) / 500) * 500]} />
                      <Tooltip formatter={(v: number) => ["Monthly Payment", money(Number(v))]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="payment" name="Monthly Payment">
                        <Cell fill="#2563eb" />
                        <Cell fill={result.feeRate > 0 ? "#f59e0b" : "#10b981"} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {result.feeRate > 0
                      ? "Financing the " + money(result.feeAmount) + " fee adds ~" + money2(result.paymentFinanced - result.paymentUpfront) + "/mo — and " + money(result.extraInterestFinancing) + " in extra interest over the life of the loan."
                      : "With the fee waived, both scenarios are identical — there is no fee to finance."}
                  </p>
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
            <h2 className="text-2xl font-bold mb-3">The Fee Is a Percentage — and It Can Be Financed</h2>
            <p>The VA funding fee is a one-time cost that keeps the VA loan program running without a down payment or monthly mortgage insurance. The rate depends on three things: whether this is your first or a subsequent use of the benefit, your service category, and your down payment. Most buyers simply add the fee to the loan, which keeps closing costs low — but financing a fee means paying interest on it for up to 30 years. On a $350,000 first-use loan at the standard 2.15% rate, the $7,525 fee costs roughly $48 a month when financed and about $9,600 in lifetime interest. Veterans with a 10% or higher VA disability rating are exempt from the fee entirely, so the calculator zeroes it out when that exemption is applied.</p>
          </section>
          <FAQSection faqs={[
            { question: "How is the VA funding fee calculated?", answer: "The fee is a percentage of your base loan amount (purchase price minus down payment). The rate comes from the VA schedule: for first-time regular-military use it is 2.15% with no down payment, 1.5% with 5–9.99% down, and 1.25% with 10% or more down. Reserve and National Guard members pay slightly higher rates, and subsequent-use loans start at 3.3%." },
            { question: "Who is exempt from the VA funding fee?", answer: "Veterans receiving VA compensation for a service-connected disability rated 10% or more, veterans rated totally disabled due to a service-connected condition, surviving spouses receiving dependency and indemnity compensation, and certain active-duty members are exempt. Select the exemption in the calculator and the fee drops to zero." },
            { question: "Should I pay the funding fee upfront or finance it?", answer: "Financing the fee keeps your out-of-pocket closing costs lower but you pay interest on it for the full loan term. Use the payment comparison in this calculator: a $7,525 fee financed at 6.5% for 30 years costs roughly $9,600 in extra interest. If you can afford it, paying upfront is usually cheaper over the life of the loan." },
          ]} pageUrl="https://racira.com/calculator/va-loan-funding-fee-calculator" />
          <PopularCalculators exclude="/calculator/va-loan-funding-fee-calculator" />
        </div>
      </div>
    </>
  );
}
