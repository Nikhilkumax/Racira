"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface LoanInputs {
  balance: number;
  rate: number;
  months: number;
  loanType: "unsub" | "sub";
  termYears: number;
}

interface LoanResult {
  accrued: number;
  capitalized: number;
  newBalance: number;
  originalPayment: number;
  recastPayment: number;
  payoffNoCapMonths: number;
  payoffNoCapTotal: number;
  payoffCapMonths: number;
  payoffCapTotal: number;
  extraCost: number;
  extraMonths: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function pmt(principal: number, monthlyRate: number, nMonths: number): number {
  if (principal <= 0) return 0;
  if (monthlyRate <= 0) return principal / nMonths;
  const f = Math.pow(1 + monthlyRate, nMonths);
  return (principal * monthlyRate * f) / (f - 1);
}

function payoffMonths(principal: number, monthlyRate: number, payment: number): number {
  if (payment <= 0 || principal <= 0) return Infinity;
  if (payment <= principal * monthlyRate) return Infinity;
  // Closed-form: n = -ln(1 - P*r/PMT) / ln(1+r)
  const n = -Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
  return Math.ceil(n);
}

function calcCapitalized(inp: LoanInputs): LoanResult {
  const accrues = inp.loanType === "unsub";
  const accrued = accrues ? (inp.balance * (inp.rate / 100) * inp.months) / 12 : 0;
  const capitalized = accrued;
  const newBalance = inp.balance + capitalized;

  const r = inp.rate / 100 / 12;
  const nMonths = inp.termYears * 12;

  const originalPayment = pmt(inp.balance, r, nMonths);
  const recastPayment = pmt(newBalance, r, nMonths);

  // Path A — borrower pays off the accrued interest (no capitalization), resumes original payment
  const payoffNoCapMonths = payoffMonths(inp.balance, r, originalPayment);
  const payoffNoCapTotal = payoffNoCapMonths * originalPayment + accrued;

  // Path B — interest capitalizes; borrower resumes the SAME original payment on the bigger balance
  const payoffCapMonths = payoffMonths(newBalance, r, originalPayment);
  const payoffCapTotal = payoffCapMonths * originalPayment;

  const extraCost = payoffCapTotal - payoffNoCapTotal;
  const extraMonths = payoffCapMonths - payoffNoCapMonths;

  const fmtCur = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
  const fmtMonths = (m: number) => (Number.isFinite(m) ? `${m} mo (${Math.floor(m / 12)} yr ${m % 12} mo)` : "Never");

  const breakdown = [
    { label: "Current Balance", value: fmtCur(inp.balance) },
    { label: "Interest Rate", value: `${inp.rate.toFixed(2)}%` },
    { label: "Non-Payment Period", value: `${inp.months} months` },
    { label: "Loan Type", value: accrues ? "Interest accrues" : "No interest accrues (subsidized)" },
    { label: "Interest Accrued During Period", value: fmtCur(accrued) },
    { label: "Interest That Capitalizes", value: fmtCur(capitalized), highlight: true },
    { label: "New Principal Balance", value: fmtCur(newBalance), highlight: true },
    { label: `Original Monthly Payment (${inp.termYears}-yr plan)`, value: fmtCur(originalPayment) },
    { label: "Payoff — If Accrued Interest Is Paid Off", value: `${payoffNoCapMonths} mo · ${fmtCur(payoffNoCapTotal)}` },
    { label: "Payoff — If Interest Capitalizes (same payment)", value: `${payoffCapMonths} mo · ${fmtCur(payoffCapTotal)}` },
    { label: "Extra Cost of Capitalization", value: fmtCur(extraCost), highlight: true },
    { label: `Recast Payment to Stay on ${inp.termYears}-Yr Schedule`, value: fmtCur(recastPayment) },
  ];

  const summaryStats = [
    { label: "Interest Accrued", value: fmtCur(accrued) },
    { label: "Interest Capitalized", value: fmtCur(capitalized) },
    { label: "New Principal Balance", value: fmtCur(newBalance) },
    { label: "Original Monthly Payment", value: fmtCur(originalPayment) },
    { label: "Payoff Without Capitalization", value: `${payoffNoCapMonths} months` },
    { label: "Payoff With Capitalization", value: `${payoffCapMonths} months` },
    { label: "Payoff Extended", value: `${extraMonths} months` },
    { label: "Extra Total Cost", value: fmtCur(extraCost) },
  ];

  return {
    accrued, capitalized, newBalance, originalPayment, recastPayment,
    payoffNoCapMonths, payoffNoCapTotal, payoffCapMonths, payoffCapTotal,
    extraCost, extraMonths, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: LoanInputs = {
  balance: 28000,
  rate: 6.5,
  months: 12,
  loanType: "unsub",
  termYears: 10,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function StudentLoanCapitalizedInterestCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [loanType, setLoanType] = useState<string>(DEFAULTS.loanType);
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<LoanResult>(() => calcCapitalized(DEFAULTS));

  useEffect(() => { setResult(calcCapitalized(DEFAULTS)); }, []);

  const getInputs = (): LoanInputs => ({
    balance: parseFloat(balance) || 0,
    rate: parseFloat(rate) || 0,
    months: parseInt(months) || 0,
    loanType: (loanType === "sub" ? "sub" : "unsub") as "unsub" | "sub",
    termYears: parseInt(termYears) || 10,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const bal = parseFloat(balance) || 0;
  const apr = parseFloat(rate) || 0;
  const mo = parseInt(months) || 0;
  if (bal <= 0) errors.balance = "Balance must be greater than 0.";
  if (apr < 0.1 || apr > 20) errors.rate = "Interest rate must be between 0.1% and 20%.";
  if (mo < 1 || mo > 60) errors.months = "Non-payment period must be 1–60 months.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcCapitalized(getInputs())); };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setRate(String(DEFAULTS.rate));
    setMonths(String(DEFAULTS.months));
    setLoanType(DEFAULTS.loanType);
    setTermYears(String(DEFAULTS.termYears));
    setResult(calcCapitalized(DEFAULTS));
  };

  const faqs = [
    { question: "What does it mean for student loan interest to capitalize?", answer: "Capitalization is when unpaid interest is added to your principal balance. After the event, interest accrues on the larger balance — so you begin paying interest on interest. For federal loans, capitalization typically happens at the end of a grace period, deferment, or forbearance, and on unsubsidized loans interest accrues during all of those periods. A private lender may capitalize more often, such as monthly while you are in school." },
    { question: "How much interest accrues during deferment or forbearance?", answer: "Federal student loans use simple interest while you are not repaying: the accrued amount is your principal times the annual rate times the time in years. On a $28,000 unsubsidized loan at 6.5%, one year of non-payment accrues about $1,820. Because the interest does not compound during the period, the accrual formula stays straightforward — the compounding effect arrives later, when that $1,820 is added to principal and starts earning interest itself." },
    { question: "Should I pay the accrued interest before it capitalizes?", answer: "Usually yes, if you can afford it. In the default example, paying the $1,820 when the non-payment period ends keeps your principal at $28,000 and your payoff on schedule, while letting it capitalize adds roughly $1,700 in lifetime cost and eleven months of payments. Even partial payments reduce the amount that capitalizes, and every dollar you keep out of the principal balance avoids interest for the remaining life of the loan." },
    { question: "Why do subsidized loans show no capitalized interest?", answer: "On federal subsidized loans, the government pays the interest that accrues during in-school, grace, and deferment periods, so there is no unpaid interest left to capitalize. The interest still accrues on the books, but the Department of Education covers it. Private loans and unsubsidized federal loans accrue interest in your name during those same periods, which is why choosing the right loan type matters for the result." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Student Loan Capitalized Interest Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Loan Capitalized Interest Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sci-balance" className="text-sm font-medium mb-1 block">Loan Balance ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="sci-balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className={ci} /></div>
                  {errors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.balance}</p>}
                </div>
                <div>
                  <label htmlFor="sci-rate" className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                  <div className={inp}><input id="sci-rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.rate}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sci-months" className="text-sm font-medium mb-1 block">Non-Payment Period (months)</label>
                  <div className={inp}><input id="sci-months" type="number" value={months} onChange={(e) => setMonths(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>
                  {errors.months && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.months}</p>}
                </div>
                <div>
                  <label htmlFor="sci-type" className="text-sm font-medium mb-1 block">Loan Type</label>
                  <select id="sci-type" value={loanType} onChange={(e) => setLoanType(e.target.value)} className={sel}>
                    <option value="unsub">Unsubsidized / Private — interest accrues</option>
                    <option value="sub">Subsidized — government pays interest</option>
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
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Repayment Plan</div>
                      <div>
                        <label htmlFor="sci-term" className="text-sm font-medium mb-1 block">Standard Repayment Term</label>
                        <select id="sci-term" value={termYears} onChange={(e) => setTermYears(e.target.value)} className={sel}>
                          <option value="5">5 years</option>
                          <option value="7">7 years</option>
                          <option value="10">10 years</option>
                          <option value="15">15 years</option>
                          <option value="20">20 years</option>
                          <option value="25">25 years</option>
                        </select>
                        <p className="text-[11px] text-muted-foreground mt-1">Sets the payment you resume after the non-payment period and the recast payment needed to finish on the original schedule.</p>
                      </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Interest That Capitalizes</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${Math.round(result.capitalized).toLocaleString("en-US")}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.capitalized > 0 ? `Raises your principal to $${Math.round(result.newBalance).toLocaleString("en-US")} and adds ~$${Math.round(result.extraCost).toLocaleString("en-US")} in lifetime cost` : "No unpaid interest to capitalize — the government covers accrual on subsidized loans"}</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["New Principal Balance", `$${Math.round(result.newBalance).toLocaleString("en-US")}`],
                ["Extra Lifetime Cost", result.extraCost > 0 ? `$${Math.round(result.extraCost).toLocaleString("en-US")}` : "$0"],
                ["Payoff Extended", result.extraMonths > 0 ? `+${result.extraMonths} months` : "None"],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Capitalization Breakdown</h3>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Student Loan Capitalized Interest Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A student loan capitalized interest calculator shows what happens when unpaid interest gets folded into your principal balance after a period of not repaying your loan. During grace periods, deferment, and forbearance, interest on unsubsidized and private loans keeps accruing — and when the period ends, the lender adds that unpaid interest to the amount you borrowed. From that point you pay interest on the original loan and on the interest itself, a quiet multiplier that can add thousands of dollars and many months to your repayment. This tool separates the two questions borrowers actually face: how much interest will capitalize after my non-payment period, and what will that capitalization cost me over the life of the loan? It models the accrual with simple interest, the standard method for federal loans while payments are paused, then compares two repayment paths — paying the accrued interest off versus letting it capitalize — so you can see the real price of the choice in dollars and months rather than in abstract warnings about interest on interest.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Capitalized Interest Is Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation runs in two stages. First, interest accrues during the non-payment period. For the default scenario of an unsubsidized or private loan, the accrued amount is the principal balance multiplied by the annual interest rate multiplied by the number of months divided by twelve — simple interest, because federal loans do not compound while payments are paused. A subsidized loan accrues no interest in your name, because the government pays it during the same periods. Second, the accrued interest is added to principal, and the calculator compares what happens next. On one path, you pay the accrued interest off at the end of the period and resume your original monthly payment, which is derived from the standard repayment term chosen in Advanced Options. On the other path, the interest capitalizes and you resume that same payment against the larger balance. Because the payment no longer covers the full monthly interest charge on the bigger principal at first, the loan takes longer to pay off, and every extra month of payments is extra cost. The difference between the two paths — the extra total paid and the extra months of repayment — is the true cost of capitalization. The calculator also shows the recast payment that would keep you on your original schedule after capitalization, which is the higher monthly amount you would need to send to offset the added principal.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline figure is the interest that capitalizes, with the new principal balance, the extra lifetime cost, and the payoff extension shown beside it. In the default case — a $28,000 unsubsidized loan at 6.5 percent with one year of non-payment — about $1,820 capitalizes, pushing the principal to roughly $29,820. If you resume your original payment instead of recasting, that capitalization costs about $1,700 extra over the life of the loan and extends payoff by eleven months. The breakdown table walks through both repayment paths so you can see the accrued interest, the capitalized amount, and the two payoff totals side by side, and the summary statistics condense the comparison. The most useful way to explore is to adjust the non-payment period and the loan type: shortening the pause by six months roughly halves the capitalized amount, and switching the loan type to subsidized removes the effect entirely. If you are facing the end of a deferment or forbearance, paying even part of the accrued interest before capitalization is one of the highest-return moves available, since every dollar kept out of principal avoids interest for the entire remaining life of the loan.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/student-loan-capitalized-interest-calculator" />
          <PopularCalculators exclude="/calculator/student-loan-capitalized-interest-calculator" />
        </div>
      </div>
    </>
  );
}
