"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type SolveFor = "payment" | "amount";
type Frequency = "monthly" | "semimonthly" | "biweekly";

const FREQUENCIES: Record<Frequency, { perYear: number; label: string; short: string }> = {
  monthly: { perYear: 12, label: "Monthly", short: "mo" },
  semimonthly: { perYear: 24, label: "Semi-Monthly", short: "period" },
  biweekly: { perYear: 26, label: "Bi-Weekly", short: "period" },
};

interface PaymentInputs {
  solveFor: SolveFor;
  amount: number;
  payment: number;
  apr: number;
  years: number;
  frequency: Frequency;
  startMonth: string;
}

const DEFAULTS: PaymentInputs = {
  solveFor: "payment",
  amount: 12000,
  payment: 300,
  apr: 11.5,
  years: 5,
  frequency: "monthly",
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

function paymentFor(principal: number, periodicRate: number, n: number): number {
  if (n <= 0) return 0;
  if (periodicRate <= 0) return principal / n;
  const f = Math.pow(1 + periodicRate, n);
  return (principal * periodicRate * f) / (f - 1);
}

function presentValue(payment: number, periodicRate: number, n: number): number {
  if (n <= 0) return 0;
  if (periodicRate <= 0) return payment * n;
  return (payment * (1 - Math.pow(1 + periodicRate, -n))) / periodicRate;
}

interface FreqRow {
  key: Frequency;
  label: string;
  payment: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
}

interface PaymentResult {
  periodicPayment: number;
  financed: number;
  nPeriods: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
  monthlyOutlay: number;
  freqRows: FreqRow[];
  valid: boolean;
  errorMsg: string;
}

function buildFreqRows(financed: number, apr: number, years: number, startMonth: string): FreqRow[] {
  return (Object.keys(FREQUENCIES) as Frequency[]).map((key) => {
    const perYear = FREQUENCIES[key].perYear;
    const r = apr / 100 / perYear;
    const n = Math.round(years * perYear);
    const payment = paymentFor(financed, r, n);
    const totalPaid = payment * n;
    return {
      key,
      label: FREQUENCIES[key].label,
      payment,
      totalInterest: Math.max(0, totalPaid - financed),
      totalPaid,
      payoffDate: addMonths(startMonth, years * 12),
    };
  });
}

function computePayment(i: PaymentInputs): PaymentResult {
  const invalid =
    i.apr < 0 ||
    i.years <= 0 ||
    (i.solveFor === "payment" ? i.amount <= 0 : i.payment <= 0);

  const perYear = FREQUENCIES[i.frequency].perYear;
  const r = i.apr / 100 / perYear;
  const n = Math.round(i.years * perYear);

  // Resolve the two interdependent quantities so every output is consistent.
  let financed = i.amount;
  let periodicPayment = paymentFor(i.amount, r, n);
  if (i.solveFor === "amount") {
    financed = presentValue(i.payment, r, n);
    periodicPayment = i.payment;
  }

  const totalPaid = periodicPayment * n;
  const freqRows = buildFreqRows(financed, i.apr, i.years, i.startMonth);

  return {
    periodicPayment,
    financed,
    nPeriods: n,
    totalInterest: Math.max(0, totalPaid - financed),
    totalPaid,
    payoffDate: addMonths(i.startMonth, i.years * 12),
    monthlyOutlay: (periodicPayment * perYear) / 12,
    freqRows,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a term above zero, a non-negative rate, and a positive amount or payment to solve."
      : "",
  };
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

export default function MedicalLoanPaymentCalculator() {
  const [solveFor, setSolveFor] = useState<SolveFor>(DEFAULTS.solveFor);
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [payment, setPayment] = useState(String(DEFAULTS.payment));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [frequency, setFrequency] = useState<Frequency>(DEFAULTS.frequency);
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PaymentInputs => ({
    solveFor,
    amount: parseFloat(amount) || 0,
    payment: parseFloat(payment) || 0,
    apr: parseFloat(apr) || 0,
    years: parseFloat(years) || 0,
    frequency,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<PaymentInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PaymentResult>(() => computePayment(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePayment(inputs));
  };

  const reset = () => {
    setSolveFor(DEFAULTS.solveFor);
    setAmount(String(DEFAULTS.amount));
    setPayment(String(DEFAULTS.payment));
    setApr(String(DEFAULTS.apr));
    setYears(String(DEFAULTS.years));
    setFrequency(DEFAULTS.frequency);
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computePayment(DEFAULTS));
  };

  const freq = FREQUENCIES[calcInputs.frequency];

  const faqs = [
    {
      question: "How do bi-weekly payments save money?",
      answer:
        "A bi-weekly schedule has 26 payment periods a year instead of 12. If each bi-weekly payment is half your monthly payment you make 26 half-payments, which equals 13 full monthly payments, so you make one extra monthly payment every year. That extra principal shortens the term and cuts the total interest, which is why lenders market bi-weekly plans as a payoff accelerator.",
    },
    {
      question: "Should the rate change when I switch payment frequency?",
      answer:
        "No. The quoted annual percentage rate is a yearly figure, so the periodic rate is simply the APR divided by the number of periods per year: 12 for monthly, 24 for semi-monthly, and 26 for bi-weekly. Dividing by 26 rather than using a monthly rate is what makes the bi-weekly comparison mathematically fair.",
    },
    {
      question: "What is the solve-for toggle doing?",
      answer:
        "It lets you work the loan equation in either direction. Choose Payment to compute the instalment required for an amount you want to finance, or choose Amount to invert the formula and find how much medical debt a payment you can already afford will cover. Both directions use the same present-value relationship, so the numbers reconcile exactly.",
    },
    {
      question: "Why does the monthly outlay differ from the periodic payment?",
      answer:
        "Because the payment periods are not all monthly. A $150 semi-monthly payment multiplied by 24 and divided by 12 equals a $300 monthly-equivalent outlay. The Summary shows this monthly-equivalent figure so you can compare a bi-weekly or semi-monthly plan against a monthly one on the same footing.",
    },
    {
      question: "How accurate is this compared with a lender quote?",
      answer:
        "The maths is the standard amortisation formula lenders use, so payment, interest and payoff figures should match a quote that uses the same amount, rate and term. Differences usually come from origination fees rolled into the balance, daily rather than periodic interest accrual, or the lender counting the first period from a different start date. Use the Medical Loan Calculator to fold fees into an effective APR before comparing offers.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Medical Loan Payment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Medical Loan Payment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Solve For">
              <div className="relative h-9">
                <select
                  id="solve-for"
                  value={solveFor}
                  onChange={(e) => setSolveFor(e.target.value as SolveFor)}
                  className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                >
                  <option value="payment">Payment from amount financed</option>
                  <option value="amount">Amount financed from payment</option>
                </select>
              </div>
            </SubSection>

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
                  hint={solveFor === "amount" ? "Solved by Calculate." : undefined}
                />
                <CompactInput
                  id="payment"
                  label="Payment per Period"
                  value={payment}
                  onChange={setPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Amount you can pay each payment period."
                  hint={solveFor === "payment" ? "Solved by Calculate." : undefined}
                />
              </div>
            </SubSection>

            <SubSection title="Rate & Term">
              <div className="grid grid-cols-2 gap-3">
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
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Repayment term in years."
                />
              </div>
            </SubSection>

            <SubSection title="Payment Frequency">
              <div className="relative h-9">
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                  className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                >
                  <option value="monthly">Monthly (12 / yr)</option>
                  <option value="semimonthly">Semi-Monthly (24 / yr)</option>
                  <option value="biweekly">Bi-Weekly (26 / yr)</option>
                </select>
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
                  <SubSection title="Schedule">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="start-month"
                        label="First Payment Month"
                        value={startMonth}
                        onChange={setStartMonth}
                        onEnter={runCalculate}
                        type="month"
                        tooltip="Month of the first scheduled payment, used for the payoff date."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          {results.nPeriods} payments / {freq.label}
                        </div>
                      </div>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                {calcInputs.solveFor === "amount" ? "Amount You Can Finance" : `Payment per ${freq.short}`}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(calcInputs.solveFor === "amount" ? results.financed : results.periodicPayment)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {freq.label} over {calcInputs.years} yrs &middot; {results.nPeriods} payments &middot; {fmt(calcInputs.apr, 2)}% APR
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Repaid</span>
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
                    <th className="p-2.5 pl-3">Frequency</th>
                    <th className="p-2.5 text-right w-[110px]">Payment</th>
                    <th className="p-2.5 text-right w-[120px]">Total Interest</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Payoff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.freqRows.map((row) => (
                    <tr
                      key={row.key}
                      className={`hover:bg-secondary/20 transition-colors ${
                        row.key === calcInputs.frequency ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(row.payment)}</td>
                      <td className="p-2.5 text-right font-semibold text-foreground">${fmt(row.totalInterest, 0)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.payoffDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Amount Financed</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.financed, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payments per Year</span>
                  <span className="text-base font-bold text-foreground">{freq.perYear}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment per Period</span>
                  <span className="text-base font-bold text-primary">${fmt(results.periodicPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly-Equivalent Outlay</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.monthlyOutlay)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Repaid</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalPaid, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Medical Loan Payment Calculator?</h2>
            <p>
              A medical loan payment calculator answers the two questions patients ask when a hospital bill is larger
              than they can pay at once: what will my instalment be, and how much can I finance for a payment I can
              afford? Medical lenders quote a rate and a term, but the number that decides whether a treatment plan is
              workable is the periodic payment, so this tool computes it directly and shows the alternative payment
              schedules that change how much interest you pay in total.
            </p>
            <p>
              It works in both directions. Enter the amount you need and the calculator returns the payment; enter the
              payment your budget allows and it returns the amount a lender will finance. It also compares monthly,
              semi-monthly and bi-weekly schedules side by side, because switching frequency is one of the few levers a
              borrower controls without renegotiating the loan.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Every figure comes from the amortising-loan formula. The periodic rate is the annual percentage rate
              divided by the number of payment periods in a year: 12 for monthly, 24 for semi-monthly and 26 for
              bi-weekly. With that periodic rate r and the total number of payments n, the payment is
              PMT = P x r / (1 - (1 + r)^-n). To reverse the calculation, the amount financed is the present value of
              the payment stream, P = PMT x (1 - (1 + r)^-n) / r.
            </p>
            <p>
              The calculator applies both formulas to your inputs, then rebuilds the comparison table for all three
              frequencies from the same financed amount. Total interest is the sum of every payment minus the principal,
              and the payoff date is your first-payment month advanced by the term. Because the periodic rate changes
              with frequency, the comparison is a true like-for-like one rather than a shortcut.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows either the payment per period or the amount you can finance, depending on the
              solve direction you picked, with total interest, total repaid and the payoff date beside it. The breakdown
              table compares monthly, semi-monthly and bi-weekly schedules for the same balance; note how the bi-weekly
              column, which produces one extra full payment each year, carries the lowest total interest and the
              earliest payoff. Many medical lenders offer a bi-weekly option at no extra cost, which makes it an easy
              saving to capture.
            </p>
            <p>
              Summary Statistics adds the monthly-equivalent outlay so you can compare a bi-weekly plan against a
              monthly one without doing arithmetic in your head, along with the financed amount, payment count and total
              figures. As always, treat the output as a planning estimate: real offers can differ through origination
              fees rolled into the principal, daily interest accrual, or a different first-payment date, so confirm the
              final schedule with the lender before signing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/medical-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/medical-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
