"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface MedicalLoanInputs {
  amount: number;
  apr: number;
  years: number;
  originationPct: number;
  extraMonthly: number;
  startMonth: string;
}

const DEFAULTS: MedicalLoanInputs = {
  amount: 12000,
  apr: 11.5,
  years: 5,
  originationPct: 5,
  extraMonthly: 0,
  startMonth: "2026-01",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function addMonths(startMonth: string, months: number): string {
  const parts = startMonth.split("-");
  const y = Number(parts[0]) || 2026;
  const m = Number(parts[1]) || 1;
  const total = y * 12 + (m - 1) + Math.round(months);
  const ny = Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${MONTHS[nm]} ${ny}`;
}

function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const f = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * f) / (f - 1);
}

/** Amortise a loan, optionally paying an extra amount each month. Returns totals + payoff month count. */
function amortise(principal: number, monthlyRate: number, months: number, extra: number) {
  const base = monthlyPayment(principal, monthlyRate, months);
  let balance = principal;
  let cumInterest = 0;
  let m = 0;
  const cap = 1200;
  while (balance > 0.005 && m < cap) {
    const interest = balance * monthlyRate;
    let payment = base + extra;
    if (payment > balance + interest) payment = balance + interest;
    const principalPart = payment - interest;
    balance -= principalPart;
    cumInterest += interest;
    m += 1;
  }
  return { base, cumInterest, monthsUsed: m };
}

/** Solve the true APR when fees reduce the amount actually disbursed (bisection). */
function effectiveApr(netProceeds: number, payment: number, months: number): number {
  if (netProceeds <= 0 || payment <= 0 || months <= 0) return 0;
  let lo = 0;
  let hi = 3; // up to 300% monthly is plenty as a bracket
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const f = Math.pow(1 + mid, months);
    const pv = mid > 0 ? (payment * (f - 1)) / (mid * f) : payment * months;
    if (pv > netProceeds) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  hint?: string;
  type?: string;
  min?: string;
  step?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  prefix,
  suffix,
  tooltip,
  hint,
  type = "number",
  min,
  step,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

interface MedicalLoanResult {
  monthly: number;
  totalInterest: number;
  totalPaid: number;
  originationFee: number;
  netProceeds: number;
  effectiveAprPct: number;
  payoffDate: string;
  payoffMonths: number;
  extraInterestSaved: number;
  extraMonthsSaved: number;
  payoffDateWithExtra: string;
  valid: boolean;
  errorMsg: string;
}

function computeMedicalLoan(i: MedicalLoanInputs): MedicalLoanResult {
  const invalid = i.amount <= 0 || i.apr < 0 || i.years <= 0 || i.originationPct < 0 || i.originationPct >= 100 || i.extraMonthly < 0;

  const months = Math.round(i.years * 12);
  const r = i.apr / 100 / 12;
  const base = amortise(i.amount, r, months, 0);
  const withExtra = amortise(i.amount, r, months, i.extraMonthly);

  const originationFee = (i.amount * i.originationPct) / 100;
  const netProceeds = i.amount - originationFee;

  return {
    monthly: base.base,
    totalInterest: base.cumInterest,
    totalPaid: i.amount + base.cumInterest,
    originationFee,
    netProceeds,
    effectiveAprPct: effectiveApr(netProceeds, base.base, months),
    payoffDate: addMonths(i.startMonth, months),
    payoffMonths: months,
    extraInterestSaved: i.extraMonthly > 0 ? Math.max(0, base.cumInterest - withExtra.cumInterest) : 0,
    extraMonthsSaved: i.extraMonthly > 0 ? Math.max(0, months - withExtra.monthsUsed) : 0,
    payoffDateWithExtra: addMonths(i.startMonth, withExtra.monthsUsed),
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan amount, a term above zero, a non-negative rate, and an origination fee below 100%."
      : "",
  };
}

export default function MedicalLoanCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [originationPct, setOriginationPct] = useState(String(DEFAULTS.originationPct));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): MedicalLoanInputs => ({
    amount: parseFloat(amount) || 0,
    apr: parseFloat(apr) || 0,
    years: parseFloat(years) || 0,
    originationPct: parseFloat(originationPct) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<MedicalLoanInputs>(() => DEFAULTS);
  const [results, setResults] = useState<MedicalLoanResult>(() => computeMedicalLoan(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeMedicalLoan(inputs));
  };

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setApr(String(DEFAULTS.apr));
    setYears(String(DEFAULTS.years));
    setOriginationPct(String(DEFAULTS.originationPct));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeMedicalLoan(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is the monthly payment on a medical loan calculated?",
      answer:
        "The payment uses the standard amortising-loan formula PMT = P x r / (1 - (1 + r)^-n), where P is the amount financed, r is the monthly interest rate (APR divided by 12) and n is the number of monthly payments. The calculator applies that formula to your balance and term, then builds the full schedule so the interest and principal split is visible.",
    },
    {
      question: "Why is the effective APR higher than the advertised rate?",
      answer:
        "An origination fee is deducted before the money reaches you, so the loan costs more on a smaller disbursed balance. If you borrow $12,000 with a 5% origination fee you receive $11,400 but repay interest on $12,000. The calculator solves for the rate that makes the present value of your payments equal the $11,400 you actually received, which is the true, fee-inclusive APR.",
    },
    {
      question: "Does paying a little extra each month help?",
      answer:
        "Yes. Every extra dollar above the scheduled payment goes straight to principal, which shortens the term and removes the interest those future balances would have accrued. The Advanced Options field lets you model an extra monthly amount and reports both the interest saved and the months cut from the schedule.",
    },
    {
      question: "Should I finance medical debt with a loan?",
      answer:
        "A fixed-rate medical loan replaces a variable hospital payment plan with a predictable payment and a defined payoff date, and it can be cheaper than carrying a balance on a high-APR credit card. Compare the effective APR here against the card APR and against a 0% hospital instalment plan before committing, since those plans often carry no interest at all if paid on time.",
    },
    {
      question: "What term should I choose?",
      answer:
        "A shorter term raises the monthly payment but sharply reduces total interest; a longer term lowers the payment and increases lifetime cost. Use the breakdown and Summary Statistics to weigh the monthly figure you can comfortably afford against the total interest column for each term you are considering.",
    },
  ];

  const breakdownRows = [
    { label: "Amount Financed", amount: `$${fmt(calcInputs.amount)}`, share: "100.0%" },
    {
      label: "Interest (full term)",
      amount: `$${fmt(results.totalInterest)}`,
      share: `${results.totalPaid > 0 ? fmt((results.totalInterest / results.totalPaid) * 100, 1) : "0.0"}%`,
    },
    {
      label: "Origination Fee",
      amount: `$${fmt(results.originationFee)}`,
      share: `${calcInputs.amount > 0 ? fmt((results.originationFee / calcInputs.amount) * 100, 1) : "0.0"}%`,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Medical Loan Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Medical Loan Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Amount Financed"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Total medical bill being financed."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate (APR)"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="Annual percentage rate quoted by the lender."
                />
              </div>
            </SubSection>

            <SubSection title="Term">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Repayment term in years."
                />
                <CompactInput
                  id="start-month"
                  label="First Payment Month"
                  value={startMonth}
                  onChange={setStartMonth}
                  onEnter={runCalculate}
                  type="month"
                  tooltip="Month of the first scheduled payment; drives the payoff date."
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Fees & Prepayment">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="origination"
                        label="Origination Fee"
                        value={originationPct}
                        onChange={setOriginationPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        min="0"
                        tooltip="Upfront fee deducted from the amount financed."
                      />
                      <CompactInput
                        id="extra"
                        label="Extra Monthly Payment"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional principal paid each month."
                      />
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.monthly)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {calcInputs.years} yr term at {fmt(calcInputs.apr, 2)}% APR &middot; {results.payoffMonths} payments
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalPaid, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payoff</span>
                <span className="font-extrabold text-foreground">{results.payoffDate}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.amount}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.share}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Repaid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalPaid, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Amount Received</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.netProceeds, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Origination Fee</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.originationFee, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Advertised APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.apr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective APR (with fees)</span>
                  <span className="text-base font-bold text-primary">{fmt(results.effectiveAprPct, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved (extra)</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.extraInterestSaved, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff with Extra</span>
                  <span className="text-base font-bold text-foreground">
                    {results.extraMonthsSaved > 0 ? `${results.payoffDateWithExtra} (${results.extraMonthsSaved} mo sooner)` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Medical Loan Calculator?</h2>
            <p>
              A medical loan calculator turns a hospital, dental, fertility or veterinary bill into a fixed repayment
              plan. Large out-of-pocket medical expenses are rarely paid in one lump sum, and hospitals frequently
              outsource their patient-payment plans to medical lenders. A medical loan is a personal instalment loan
              whose proceeds are earmarked for healthcare: the lender pays the provider and you repay a fixed monthly
              amount over a set term at a fixed rate. This calculator reproduces the maths those lenders use so you can
              see the true monthly cost, the lifetime interest, and the effect of fees before you sign.
            </p>
            <p>
              Because these loans are typically unsecured, rates are higher than mortgage or auto rates and are driven
              mainly by credit score, term length and the lender chosen. The most important number is not the headline
              rate but the effective annual percentage rate once origination fees are included, because a fee is
              deducted from your balance while you still pay interest on the full amount borrowed.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The monthly payment comes from the amortising-loan formula PMT = P x r / (1 - (1 + r)^-n), where P is the
              amount financed, r is the periodic (monthly) interest rate, and n is the number of monthly payments. For a
              $12,000 loan at 11.5% APR over five years, r is 0.115 divided by 12 and n is 60, giving a payment of about
              $264. Interest is charged on the outstanding balance each month, so early payments are almost entirely
              interest and later payments almost entirely principal.
            </p>
            <p>
              The calculator then walks the full schedule. It sums every interest charge to give total interest, adds it
              to the principal for the total repaid, and derives the payoff month from your first-payment month. If you
              enter an origination fee, it subtracts that fee from the amount financed to find your net proceeds and
              solves, by bisection, for the interest rate that makes the present value of your payments equal those net
              proceeds. That solved rate is your effective APR. If you add an extra monthly payment, the schedule is
              rebuilt with the larger payment to report the interest savings and the shortened term.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows your monthly payment and the two figures that matter most are beside it: total
              interest and the payoff date. Total cost combines principal and interest; if an origination fee applies,
              compare the advertised APR with the effective APR to see what the fee really costs you. A five-percentage
              point gap between the two is common on short terms, because a fixed fee is spread over fewer payments and
              therefore weighs more heavily on the annualised rate.
            </p>
            <p>
              The breakdown table splits the total into principal, interest and fees with each component&apos;s share, so
              you can see how much of every dollar goes to the lender. Summary Statistics adds the net amount you
              actually receive, the solved effective APR, and, when you model an extra payment, both the interest saved
              and how many months earlier the loan is retired. A common strategy is to accept a comfortable baseline
              payment and then add a modest extra amount each month; because extra dollars attack principal directly,
              even a small surplus can remove months of interest.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/medical-loan-calculator" />
          <PopularCalculators exclude="/calculator/medical-loan-calculator" />
        </div>
      </div>
    </>
  );
}
