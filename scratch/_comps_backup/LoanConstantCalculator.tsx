"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface LoanInputs {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  paymentsPerYear: number;
  originationFeePct: number;
  noiAnnual: number;
  targetDscr: number;
}

interface LoanResult {
  ratePerPeriod: number;
  periods: number;
  monthlyPayment: number;
  annualDebtService: number;
  loanConstant: number;
  constantPerThousand: number;
  proceedsAfterFee: number;
  effectiveConstant: number;
  totalPayments: number;
  totalInterest: number;
  maxLoanAmount: number;
  actualDscr: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcLoanConstant(inp: LoanInputs): LoanResult {
  const ppy = inp.paymentsPerYear;
  const ratePerPeriod = inp.interestRate / 100 / ppy;
  const periods = Math.round(inp.termYears * ppy);
  const denominator = Math.pow(1 + ratePerPeriod, periods);
  const payment =
    ratePerPeriod > 0 && denominator !== 1
      ? (inp.loanAmount * ratePerPeriod) / (1 - 1 / denominator)
      : inp.loanAmount / periods;

  const annualDebtService = payment * ppy;
  const loanConstant = inp.loanAmount > 0 ? annualDebtService / inp.loanAmount : 0;
  const proceedsAfterFee = inp.loanAmount * (1 - inp.originationFeePct / 100);
  const effectiveConstant = proceedsAfterFee > 0 ? annualDebtService / proceedsAfterFee : 0;
  const totalPayments = payment * periods;
  const totalInterest = totalPayments - inp.loanAmount;
  const maxLoanAmount =
    inp.noiAnnual > 0 && inp.targetDscr > 0 && effectiveConstant > 0
      ? inp.noiAnnual / (inp.targetDscr * effectiveConstant)
      : 0;
  const actualDscr = annualDebtService > 0 ? inp.noiAnnual / annualDebtService : 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
  const freqLabel = ppy === 12 ? "Monthly" : ppy === 4 ? "Quarterly" : "Annual";

  const breakdown = [
    { label: "Loan Amount", value: `$${fmtInt(inp.loanAmount)}` },
    { label: "Interest Rate", value: `${inp.interestRate.toFixed(2)}%` },
    { label: `Amortization Term`, value: `${inp.termYears} years (${periods} periods)` },
    { label: `${freqLabel} Payment`, value: `$${fmt(payment)}` },
    { label: "Annual Debt Service", value: `$${fmtInt(annualDebtService)}`, highlight: true },
    { label: "Loan Constant (K)", value: `${(loanConstant * 100).toFixed(3)}%`, highlight: true },
    { label: "Constant per $1,000", value: `$${fmt(loanConstant * 1000)}/yr` },
    { label: "Total Payments (full term)", value: `$${fmtInt(totalPayments)}` },
    { label: "Total Interest", value: `$${fmtInt(totalInterest)}` },
    { label: `Origination Fee (${inp.originationFeePct}%)`, value: `$${fmtInt(inp.loanAmount * (inp.originationFeePct / 100))}` },
    { label: "Effective Constant (after fee)", value: `${(effectiveConstant * 100).toFixed(3)}%` },
    { label: "Max Loan @ Target DSCR", value: maxLoanAmount > 0 ? `$${fmtInt(maxLoanAmount)}` : "—" },
    { label: inp.noiAnnual > 0 ? `Actual DSCR (on $${fmtInt(inp.noiAnnual)} NOI)` : "Actual DSCR", value: inp.noiAnnual > 0 ? `${actualDscr.toFixed(2)}x` : "—" },
  ];

  const summaryStats = [
    { label: "Loan Constant", value: `${(loanConstant * 100).toFixed(3)}%` },
    { label: "Annual Debt Service", value: `$${fmtInt(annualDebtService)}` },
    { label: `${freqLabel} Payment`, value: `$${fmt(payment)}` },
    { label: "Total Interest", value: `$${fmtInt(totalInterest)}` },
    { label: "Constant per $1,000", value: `$${fmt(loanConstant * 1000)}` },
    { label: "Effective Constant", value: `${(effectiveConstant * 100).toFixed(3)}%` },
    { label: "Max Loan (DSCR)", value: maxLoanAmount > 0 ? `$${fmtInt(maxLoanAmount)}` : "—" },
    { label: "Actual DSCR", value: inp.noiAnnual > 0 ? `${actualDscr.toFixed(2)}x` : "—" },
  ];

  return {
    ratePerPeriod, periods, monthlyPayment: payment, annualDebtService, loanConstant,
    constantPerThousand: loanConstant * 1000, proceedsAfterFee, effectiveConstant,
    totalPayments, totalInterest, maxLoanAmount, actualDscr, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: LoanInputs = {
  loanAmount: 500000,
  interestRate: 6.5,
  termYears: 30,
  paymentsPerYear: 12,
  originationFeePct: 1,
  noiAnnual: 120000,
  targetDscr: 1.25,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function LoanConstantCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [paymentsPerYear, setPaymentsPerYear] = useState(String(DEFAULTS.paymentsPerYear));
  const [originationFeePct, setOriginationFeePct] = useState(String(DEFAULTS.originationFeePct));
  const [noiAnnual, setNoiAnnual] = useState(String(DEFAULTS.noiAnnual));
  const [targetDscr, setTargetDscr] = useState(String(DEFAULTS.targetDscr));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<LoanResult>(() => calcLoanConstant(DEFAULTS));

  useEffect(() => { setResult(calcLoanConstant(DEFAULTS)); }, []);

  const getInputs = (): LoanInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 0,
    paymentsPerYear: parseInt(paymentsPerYear) || 12,
    originationFeePct: parseFloat(originationFeePct) || 0,
    noiAnnual: parseFloat(noiAnnual) || 0,
    targetDscr: parseFloat(targetDscr) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const amt = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const fee = parseFloat(originationFeePct) || 0;
  const noi = parseFloat(noiAnnual) || 0;
  const dscr = parseFloat(targetDscr) || 0;
  if (amt <= 0) errors.loanAmount = "Loan amount must be greater than 0.";
  if (rate < 0.1 || rate > 30) errors.interestRate = "Interest rate must be between 0.1% and 30%.";
  if (term < 1 || term > 50) errors.termYears = "Term must be between 1 and 50 years.";
  if (fee < 0 || fee > 15) errors.fee = "Origination fee must be 0–15%.";
  if (noi < 0) errors.noi = "Net operating income cannot be negative.";
  if (dscr < 1 || dscr > 3) errors.dscr = "Target DSCR must be between 1.0x and 3.0x.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcLoanConstant(getInputs())); };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setPaymentsPerYear(String(DEFAULTS.paymentsPerYear));
    setOriginationFeePct(String(DEFAULTS.originationFeePct));
    setNoiAnnual(String(DEFAULTS.noiAnnual));
    setTargetDscr(String(DEFAULTS.targetDscr));
    setResult(calcLoanConstant(DEFAULTS));
  };

  const constantIsGood = result.loanConstant < 0.09;
  const constantColor = constantIsGood ? "text-emerald-600" : result.loanConstant < 0.12 ? "text-amber-500" : "text-red-500";

  const faqs = [
    { question: "What is a loan constant?", answer: "The loan constant (also called the mortgage constant) is the annual debt service — principal and interest — required to repay a loan, expressed as a percentage of the original loan amount. It lets lenders and investors instantly convert any loan balance into its yearly payment obligation, and it is the standard tool for sizing debt against a property's net operating income." },
    { question: "How is the loan constant different from the interest rate?", answer: "The interest rate only prices the cost of borrowing; the loan constant also includes the principal repayment. Because principal amortizes over the term, the constant is always higher than the interest rate for a fully amortizing loan. A 6.5%, 30-year loan has a constant near 7.6%, while a 15-year loan at the same rate carries a constant near 10.4%." },
    { question: "How do lenders use the loan constant with DSCR?", answer: "Lenders require net operating income to cover debt service by a safety margin (the debt service coverage ratio, typically 1.20x–1.30x). Because annual debt service equals loan amount × constant, the maximum loan is NOI ÷ (DSCR × constant). A lower constant means more debt capacity for the same income." },
    { question: "What does the origination fee do to the constant?", answer: "An origination fee is deducted from the loan proceeds, so you receive less than the face amount while still paying debt service on the full balance. The effective constant divides annual debt service by the after-fee proceeds, showing the true annual cost per dollar actually received." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Constant Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Constant Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lc-loan-amount" className="text-sm font-medium mb-1 block">Loan Amount ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="lc-loan-amount" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className={ci} /></div>
                  {errors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.loanAmount}</p>}
                </div>
                <div>
                  <label htmlFor="lc-rate" className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                  <div className={inp}><input id="lc-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} step="0.01" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.interestRate}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lc-term" className="text-sm font-medium mb-1 block">Amortization Term</label>
                  <select id="lc-term" value={termYears} onChange={(e) => setTermYears(e.target.value)} className={sel}>
                    {["10", "15", "20", "25", "30", "40"].map((t) => <option key={t} value={t}>{t} years</option>)}
                  </select>
                  {errors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.termYears}</p>}
                </div>
                <div>
                  <label htmlFor="lc-freq" className="text-sm font-medium mb-1 block">Payment Schedule</label>
                  <select id="lc-freq" value={paymentsPerYear} onChange={(e) => setPaymentsPerYear(e.target.value)} className={sel}>
                    <option value="12">Monthly (12/yr)</option>
                    <option value="4">Quarterly (4/yr)</option>
                    <option value="1">Annually (1/yr)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                  Advanced Options
                  <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fees &amp; Effective Cost</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="lc-fee" className="text-sm font-medium mb-1 block">Origination Fee (%)</label>
                          <div className={inp}><input id="lc-fee" type="number" value={originationFeePct} onChange={(e) => setOriginationFeePct(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                          {errors.fee && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.fee}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">The fee is deducted from proceeds, so the effective constant is measured against the amount you actually receive.</p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Loan Sizing (DSCR)</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="lc-noi" className="text-sm font-medium mb-1 block">Net Operating Income ($/yr)</label>
                          <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="lc-noi" type="number" value={noiAnnual} onChange={(e) => setNoiAnnual(e.target.value)} className={ci} /></div>
                          {errors.noi && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.noi}</p>}
                        </div>
                        <div>
                          <label htmlFor="lc-dscr" className="text-sm font-medium mb-1 block">Target DSCR (x)</label>
                          <div className={inp}><input id="lc-dscr" type="number" value={targetDscr} onChange={(e) => setTargetDscr(e.target.value)} step="0.05" className={ci} /></div>
                          {errors.dscr && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.dscr}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Max loan = NOI ÷ (target DSCR × effective constant). Lenders typically require 1.20x–1.30x.</p>
                    </div>
                  </div>
                )}
              </div>

              {hasErrors && (
                <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                  ⚠️ Please fix the errors above before calculating.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-1">
                <button type="submit" disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
                <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </form>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Loan Constant (Annual Debt Service ÷ Loan Amount)</div>
              <div className={`text-4xl font-extrabold tracking-tight ${constantColor}`}>{(result.loanConstant * 100).toFixed(3)}%</div>
              <div className="text-sm text-muted-foreground mt-1">Annual debt service of ${Math.round(result.annualDebtService).toLocaleString("en-US")} on a ${Math.round(result.proceedsAfterFee).toLocaleString("en-US")} net loan · ${result.constantPerThousand.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per $1,000 borrowed</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Payment", `$${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Annual Debt Service", `$${Math.round(result.annualDebtService).toLocaleString("en-US")}`],
                ["Total Interest", `$${Math.round(result.totalInterest).toLocaleString("en-US")}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                    <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                    <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Loan Constant?</h2>
              <p className="text-muted-foreground leading-relaxed">The loan constant — also called the mortgage constant or debt service constant — is the annual amount of principal and interest required to repay a loan, expressed as a percentage of the original loan amount. If a $500,000 loan at 6.5% over 30 years requires $37,927 of annual payments, its loan constant is 7.59%. Because the constant bundles the interest rate together with the repayment schedule, it answers a question the rate alone cannot: how many dollars of debt service does each dollar of debt cost per year? Commercial real estate investors and lenders use it constantly, most often to turn net operating income into a defensible loan amount. The constant also lets you compare loans with different rates and terms on a single scale — a 15-year loan at 5.75% may carry a higher annual payment than a 30-year loan at 6.75%, and the constant makes that trade-off immediately visible. This calculator computes the exact constant for any loan amount, rate, and amortization schedule, then extends the math to the two questions that matter most in practice: what your effective cost is after an origination fee, and how much debt your property&apos;s income can actually support.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Loan Constant Is Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">Every fully amortizing loan payment follows the same standard formula: the periodic payment equals the loan amount times the periodic interest rate, divided by one minus the discount factor raised to the negative number of payments. In plain terms, the payment is the amount that, at the quoted rate, reduces the balance to exactly zero after the final period. The calculator converts your annual interest rate into a periodic rate by dividing by the payment frequency — 12 for monthly, 4 for quarterly, or 1 for annual schedules — then multiplies the number of years by that same frequency to find the total number of payments. The annual debt service is simply the periodic payment multiplied by the payments per year, and the loan constant divides that annual debt service by the original loan amount. Because the constant is a ratio of annual payments to balance, it behaves predictably: it falls as terms lengthen (principal is repaid more slowly), and it rises with the interest rate. Two derived figures extend the analysis. First, an origination fee reduces the proceeds you actually receive while leaving the required payments unchanged, so the effective constant divides annual debt service by the after-fee proceeds — the true annual cost per dollar of funding in hand. Second, lenders underwrite income-producing property by requiring net operating income to exceed annual debt service by a target coverage margin, typically 1.20 to 1.30 times. Since annual debt service equals loan amount times the effective constant, the maximum loan is the net operating income divided by the product of the target coverage ratio and the effective constant. The calculator reports both your actual coverage ratio on the income you entered and the maximum loan that income supports.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the loan constant itself, expressed as a percentage and as an annual dollar figure per $1,000 borrowed. A constant below roughly 9% reflects today&apos;s typical long-term mortgage economics; constants climb toward 11–13% on shorter terms or higher rates, and a constant above 12% signals a heavy annual debt burden relative to the amount borrowed. The breakdown table walks through every component — periodic payment, annual debt service, total payments, and total interest over the full term — so you can see exactly what drives the number. When you expand Advanced Options and add a net operating income figure, the true power of the constant appears: the calculator tells you the maximum loan a property can carry at your target coverage ratio and your actual coverage at the income level you entered. That single output is what lenders compute when they size a loan, which makes this tool useful both for borrowers checking what a lender may offer and for investors comparing how much leverage different assets can support. Remember that the constant assumes level payments over the full amortization schedule with no prepayment; interest-only periods, balloon structures, or floating rates will change the real annual burden, and an origination fee should always be factored into the effective constant as this calculator does.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-constant-calculator" />
          <PopularCalculators exclude="/calculator/loan-constant-calculator" />
        </div>
      </div>
    </>
  );
}
