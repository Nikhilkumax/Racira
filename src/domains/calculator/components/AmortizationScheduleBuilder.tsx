"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AmortScheduleInputs {
  amount: number;
  rate: number;
  termYears: number;
  extraMonthly: number;
  lumpSum: number;
  lumpMonth: number;
}

const DEFAULTS: AmortScheduleInputs = {
  amount: 250000,
  rate: 6.5,
  termYears: 30,
  extraMonthly: 100,
  lumpSum: 0,
  lumpMonth: 12,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";

const duration = (months: number) => {
  const m = Math.max(0, Math.round(months));
  if (m < 12) return `${m} mo`;
  return `${Math.floor(m / 12)} yr ${m % 12} mo`;
};

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface AmortScheduleResult {
  basePayment: number;
  scheduledPayment: number;
  months: number;
  payoffYears: number;
  totalInterest: number;
  totalPaid: number;
  baselineInterest: number;
  interestSaved: number;
  monthsSaved: number;
  principalRemaining: number;
  firstYearInterestPct: number;
  schedule: { year: number; payment: number; interest: number; principal: number; balance: number }[];
  valid: boolean;
  errorMsg: string;
}

function computeAmortSchedule(i: AmortScheduleInputs): AmortScheduleResult {
  const months = Math.max(1, Math.round(i.termYears * 12));
  const iRate = i.rate / 100 / 12;
  const basePayment = payment(i.amount, i.rate, months);
  const scheduledPayment = basePayment + Math.max(0, i.extraMonthly);
  const baselineInterest = Math.max(0, basePayment * months - i.amount);

  const schedule: { year: number; payment: number; interest: number; principal: number; balance: number }[] = [];

  let bal = i.amount;
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let yearPayment = 0;
  let yearInterest = 0;
  let yearPrincipal = 0;
  const firstYearInterestLimit = Math.min(12, months);
  let firstYearInterest = 0;

  // Walk the loan month by month, applying the scheduled payment plus any extras.
  while (month < 1200 && bal > 0.005) {
    month++;
    const charge = bal * iRate;
    let principalPaid = scheduledPayment - charge;
    if (i.lumpSum > 0 && month === Math.max(1, Math.round(i.lumpMonth))) principalPaid += i.lumpSum;
    if (principalPaid > bal) principalPaid = bal;
    const cashPaid = charge + principalPaid;
    bal = Math.max(0, bal - principalPaid);

    totalInterest += charge;
    totalPaid += cashPaid;
    yearPayment += cashPaid;
    yearInterest += charge;
    yearPrincipal += principalPaid;
    if (month <= firstYearInterestLimit) firstYearInterest += charge;

    if (month % 12 === 0 || bal <= 0.005) {
      schedule.push({
        year: Math.ceil(month / 12),
        payment: yearPayment,
        interest: yearInterest,
        principal: yearPrincipal,
        balance: bal,
      });
      yearPayment = 0;
      yearInterest = 0;
      yearPrincipal = 0;
    }
  }

  const interestSaved = Math.max(0, baselineInterest - totalInterest);
  const invalid = i.amount <= 0 || i.rate < 0 || i.termYears <= 0 || i.extraMonthly < 0 || i.lumpSum < 0;
  const errorMsg = invalid
    ? "Enter a positive loan amount and term, and non-negative figures for rate and extra payments."
    : "";

  return {
    basePayment,
    scheduledPayment,
    months: month,
    payoffYears: month / 12,
    totalInterest,
    totalPaid,
    baselineInterest,
    interestSaved,
    monthsSaved: Math.max(0, months - month),
    principalRemaining: bal,
    firstYearInterestPct: totalPaid > 0 ? (firstYearInterest / totalPaid) * 100 : 0,
    schedule,
    valid: !invalid,
    errorMsg,
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function AmortizationScheduleBuilder() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [lumpSum, setLumpSum] = useState(String(DEFAULTS.lumpSum));
  const [lumpMonth, setLumpMonth] = useState(String(DEFAULTS.lumpMonth));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AmortScheduleInputs => ({
    amount: parseFloat(amount) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    lumpSum: parseFloat(lumpSum) || 0,
    lumpMonth: parseFloat(lumpMonth) || 12,
  });

  const [calcInputs, setCalcInputs] = useState<AmortScheduleInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AmortScheduleResult>(() => computeAmortSchedule(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAmortSchedule(inputs));
  };

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setLumpSum(String(DEFAULTS.lumpSum));
    setLumpMonth(String(DEFAULTS.lumpMonth));
    setCalcInputs(DEFAULTS);
    setResults(computeAmortSchedule(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is an amortization schedule?",
      answer:
        "An amortization schedule is the month-by-month record of a loan. Each period the outstanding balance is charged interest at the periodic rate, the payment is applied to that charge first and the remainder reduces principal. Early payments are mostly interest and later payments are mostly principal, even though the cash payment itself stays the same.",
    },
    {
      question: "How is the monthly payment worked out?",
      answer:
        "The instalment is the loan amount multiplied by the monthly rate, divided by one minus the monthly rate compounded back over the number of payments. For a two hundred and fifty thousand dollar loan at six and a half percent over thirty years that produces the standard fixed payment shown at the top of the results.",
    },
    {
      question: "Do extra payments save interest?",
      answer:
        "Every extra dollar goes straight to principal, so it stops accruing interest for every remaining month of the loan. A hundred dollars a month extra on a thirty-year mortgage typically removes several years from the term and saves tens of thousands of dollars in finance charges, which is exactly the comparison the results panel shows.",
    },
    {
      question: "Is a lump sum or a monthly extra payment better?",
      answer:
        "A lump sum applied early saves more interest than the same total spread across many months, because the reduction happens sooner and compounds through the remaining term. Spreading the same money thinly gives flexibility but a lower saving. Enter both patterns here and compare the total interest and payoff dates directly.",
    },
    {
      question: "Why does my first payment barely touch the principal?",
      answer:
        "Interest is charged on the whole balance, so in the first month almost the entire payment is consumed by the finance charge. Only the small remainder reduces principal, which then lowers the next month's charge slightly. The proportion of each payment going to principal grows steadily until the final years, when the loan clears quickly.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Amortization Schedule Builder" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Amortization Schedule Builder
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Loan Amount"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The principal you are borrowing."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Annual nominal rate, applied monthly."
                />
              </div>
            </SubSection>

            <SubSection title="Term and Extras">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="term"
                  label="Term"
                  value={termYears}
                  onChange={setTermYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  min="1"
                  tooltip="The scheduled life of the loan before any extra payments."
                />
                <CompactInput
                  id="extra"
                  label="Extra Monthly"
                  value={extraMonthly}
                  onChange={setExtraMonthly}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Additional principal paid every month on top of the scheduled instalment."
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
                  <SubSection title="One-Off Payment">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="lump"
                        label="Lump Sum"
                        value={lumpSum}
                        onChange={setLumpSum}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="A single additional principal payment."
                      />
                      <CompactInput
                        id="lumpMonth"
                        label="Applied In"
                        value={lumpMonth}
                        onChange={setLumpMonth}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="1"
                        tooltip="The payment number in which the lump sum is applied."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Time to Pay Off</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {duration(results.months)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalInterest)} total interest &middot; {money(results.interestSaved)} less than the scheduled term
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Payment</span>
                <span className="font-extrabold text-foreground">{money(results.scheduledPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Saved</span>
                <span className="font-extrabold text-emerald-600">{money(results.interestSaved)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Time Saved</span>
                <span className="font-extrabold text-primary">{duration(results.monthsSaved)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[110px]">Paid</th>
                    <th className="p-2.5 text-right w-[110px]">Interest</th>
                    <th className="p-2.5 text-right w-[110px]">Principal</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.payment)}</td>
                      <td className="p-2.5 text-right text-destructive">{money(row.interest)}</td>
                      <td className="p-2.5 text-right text-emerald-600">{money(row.principal)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.balance)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalPaid)}</td>
                    <td className="p-2.5 text-right text-destructive">{money(results.totalInterest)}</td>
                    <td className="p-2.5 text-right text-emerald-600">{money(calcInputs.amount)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Amount</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.amount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scheduled Payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.basePayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Extra</span>
                  <span className="text-base font-bold text-primary">{money(calcInputs.extraMonthly)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">One-Off Payment</span>
                  <span className="text-base font-bold text-primary">{money(calcInputs.lumpSum)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Time</span>
                  <span className="text-base font-bold text-foreground">{duration(results.months)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scheduled Term</span>
                  <span className="text-base font-bold text-foreground">{duration(calcInputs.termYears * 12)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                  <span className="text-base font-bold text-destructive">{money(results.totalInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Without Extras</span>
                  <span className="text-base font-bold text-foreground">{money(results.baselineInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.interestSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Time Saved</span>
                  <span className="text-base font-bold text-emerald-600">{duration(results.monthsSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Repaid</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First-Year Interest Share</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.firstYearInterestPct, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Amortization Schedule Builder?</h2>
            <p>
              An amortization schedule builder turns a loan amount, a rate and a term into the full table of payments that
              follows. Instead of a single monthly figure, you get the split between interest and principal in every period,
              the balance that remains and the year in which the loan finally clears. Because the arithmetic is the same for
              mortgages, car loans, personal loans and student loans, the same builder describes almost any fixed-rate
              borrowing.
            </p>
            <p>
              The useful part of a schedule is the shape of it. In the early years the balance is at its highest, so interest
              claims most of each payment and principal reduces slowly. As the balance falls, the fixed payment covers less
              interest and more principal, and the final years pass quickly. Seeing that curve is what makes the effect of an
              extra payment intuitive rather than abstract.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Schedule Is Built</h2>
            <p>
              The instalment is calculated once, using the standard amortising formula in which the payment is the loan
              amount multiplied by the monthly rate divided by one minus the monthly rate compounded back over the number of
              months. The builder then walks the loan month by month: it charges interest on the opening balance at the
              monthly rate, applies the payment to that charge first, and credits whatever is left as principal reduction.
            </p>
            <p>
              Extra payments are handled as additional principal in the month they are made. A monthly extra is added to the
              scheduled payment throughout the loan, while a lump sum is applied once in the chosen payment number. Both
              reduce the balance immediately, which cuts the interest charged in every following month. The payoff month is
              detected by the balance reaching zero, and the months removed from the original term become the time saved.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports how long the loan lasts once extras are included, with the total interest and the
              amount saved against the scheduled term underneath. The three statistics beside it show the actual monthly
              payment, the interest saved and the time removed. The breakdown table is the schedule itself, rolled up by
              year, with a total row that must reconcile: payments less interest always equal the original principal.
            </p>
            <p>
              Summary Statistics gathers the loan amount, the base instalment, the extra monthly and one-off payments, the
              payoff and scheduled terms, total interest both with and without extras, the interest and time saved, the total
              repaid and the share of first-year payments consumed by interest. Owners who can afford a modest extra monthly
              amount are often surprised by how much of the term it removes, because the saving compounds through every
              remaining month of the loan.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amortization-schedule-builder" />
          <PopularCalculators exclude="/calculator/amortization-schedule-builder" />
        </div>
      </div>
    </>
  );
}
