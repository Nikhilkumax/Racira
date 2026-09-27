"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ExtraInputs {
  loanAmount: number;
  rate: number;
  termYears: number;
  extraMonthly: number;
  startMonth: number;
  goalMonths: number;
}

const DEFAULTS: ExtraInputs = {
  loanAmount: 300000,
  rate: 6.5,
  termYears: 30,
  extraMonthly: 250,
  startMonth: 1,
  goalMonths: 0,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

const yearsMonths = (months: number) => {
  if (!Number.isFinite(months)) return "—";
  const m = Math.round(months);
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} mo`;
  return mo === 0 ? `${y} yr` : `${y} yr ${mo} mo`;
};

const payoffDate = (months: number) => {
  if (!Number.isFinite(months) || months > 720) return "—";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(months));
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface Schedule {
  months: number;
  interest: number;
}

function runSchedule(
  principal: number,
  annualRate: number,
  basePayment: number,
  extra: number,
  startMonth: number,
): Schedule {
  const i = annualRate / 100 / 12;
  let bal = principal;
  let interest = 0;
  let m = 0;

  while (bal > 0.005 && m < 1200) {
    m++;
    const pay = basePayment + (m >= startMonth ? extra : 0);
    const int = bal * i;
    let principalPart = pay - int;
    if (principalPart <= 0) return { months: Infinity, interest: Infinity };
    if (principalPart > bal) principalPart = bal;
    interest += int;
    bal -= principalPart;
  }

  return { months: m, interest };
}

interface ExtraResult {
  months: number;
  basePayment: number;
  base: Schedule;
  strategy: Schedule;
  interestSaved: number;
  monthsSaved: number;
  totalMonthly: number;
  scenarios: { extra: number; schedule: Schedule; saved: number; monthsSaved: number }[];
  requiredExtra: number | null;
  goalReachable: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeExtra(i: ExtraInputs): ExtraResult {
  const startMonth = Math.max(1, Math.round(i.startMonth));
  const invalid = i.loanAmount <= 0 || i.rate < 0 || i.termYears <= 0 || i.extraMonthly < 0;

  const months = Math.round(i.termYears * 12);
  const basePayment = payment(i.loanAmount, i.rate, months);
  const base = runSchedule(i.loanAmount, i.rate, basePayment, 0, 1);
  const strategy = runSchedule(i.loanAmount, i.rate, basePayment, i.extraMonthly, startMonth);

  const scenarioAmounts = [0, 100, 250, 500, 1000];
  const scenarios = scenarioAmounts.map((extra) => {
    const s = runSchedule(i.loanAmount, i.rate, basePayment, extra, startMonth);
    return { extra, schedule: s, saved: base.interest - s.interest, monthsSaved: base.months - s.months };
  });

  let requiredExtra: number | null = null;
  let goalReachable = true;
  if (i.goalMonths > 0) {
    const goal = Math.round(i.goalMonths);
    const atZero = runSchedule(i.loanAmount, i.rate, basePayment, 0, startMonth);
    if (atZero.months <= goal) {
      requiredExtra = 0;
    } else {
      let lo = 0;
      let hi = basePayment * 10;
      const atHi = runSchedule(i.loanAmount, i.rate, basePayment, hi, startMonth);
      if (!Number.isFinite(atHi.months) || atHi.months > goal) {
        requiredExtra = null;
        goalReachable = false;
      } else {
        for (let k = 0; k < 80; k++) {
          const mid = (lo + hi) / 2;
          const s = runSchedule(i.loanAmount, i.rate, basePayment, mid, startMonth);
          if (s.months <= goal) hi = mid;
          else lo = mid;
        }
        requiredExtra = hi;
      }
    }
  }

  return {
    months,
    basePayment,
    base,
    strategy,
    interestSaved: base.interest - strategy.interest,
    monthsSaved: base.months - strategy.months,
    totalMonthly: basePayment + i.extraMonthly,
    scenarios,
    requiredExtra,
    goalReachable,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan amount and term, a non-negative rate, and a non-negative extra payment."
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

export default function ExtraPaymentImpactCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [startMonth, setStartMonth] = useState(String(DEFAULTS.startMonth));
  const [goalMonths, setGoalMonths] = useState(String(DEFAULTS.goalMonths));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ExtraInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    startMonth: parseFloat(startMonth) || 0,
    goalMonths: parseFloat(goalMonths) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ExtraInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ExtraResult>(() => computeExtra(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeExtra(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setStartMonth(String(DEFAULTS.startMonth));
    setGoalMonths(String(DEFAULTS.goalMonths));
    setCalcInputs(DEFAULTS);
    setResults(computeExtra(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much does an extra mortgage payment each month help?",
      answer:
        "Even a modest extra amount has an outsized effect, because every dollar goes to principal and therefore removes interest from every remaining month. On a typical thirty-year loan at current rates, a few hundred dollars a month can cut several years off the term and save tens of thousands in interest. The table in the results compares several extra amounts side by side so you can see how the saving accelerates as the extra payment grows.",
    },
    {
      question: "Should I pay extra each month or make one extra payment a year?",
      answer:
        "Making one extra full payment a year is equivalent to adding roughly one twelfth of a payment each month, and the two produce nearly identical results. Consistency is what matters, so choose whichever is easier to sustain. A common approach is to split the annual bonus into twelve contributions automatically, which keeps the habit running without requiring a decision each month.",
    },
    {
      question: "Does extra principal reduce my required monthly payment?",
      answer:
        "No, unless the lender recasts the loan. The scheduled payment stays the same and the loan simply ends earlier. A recast re-amortises the reduced balance over the remaining term and lowers the payment, but it usually carries a fee and gives up part of the interest saving. If the goal is to own the home free and clear sooner, letting the balance run down is the better choice.",
    },
    {
      question: "How do I set a payoff goal?",
      answer:
        "Enter a target number of months in Advanced Options and the calculator solves for the extra monthly amount required to retire the loan in exactly that time. The answer comes from a numeric search over the amortisation schedule, so it accounts for the declining balance correctly rather than approximating. Use it to check whether an ambitious payoff date is realistic before committing the cash flow.",
    },
    {
      question: "What should I check before starting extra payments?",
      answer:
        "Confirm there is no prepayment penalty during the early years of the loan, and confirm the servicer applies the extra amount to principal rather than simply crediting it toward the next instalment. Also weigh higher-interest debt first: paying down a nineteen percent credit card beats prepaying a six percent mortgage by a wide margin. Keep an emergency fund intact, because money paid into a mortgage is difficult to get back out.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Extra Payment Impact Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Extra Payment Impact Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Original or current principal balance."
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
                  tooltip="Annual interest rate on the mortgage."
                />
              </div>
            </SubSection>

            <SubSection title="Extra Payments">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="term"
                  label="Loan Term"
                  value={termYears}
                  onChange={setTermYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  min="1"
                  tooltip="Length of the amortisation schedule in years."
                />
                <CompactInput
                  id="extra"
                  label="Extra Per Month"
                  value={extraMonthly}
                  onChange={setExtraMonthly}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Additional principal paid on top of the scheduled payment."
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
                  <SubSection title="Timing & Goal">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="start"
                        label="Extra Starts"
                        value={startMonth}
                        onChange={setStartMonth}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="1"
                        tooltip="Month from which the extra payment begins."
                      />
                      <CompactInput
                        id="goal"
                        label="Payoff Goal"
                        value={goalMonths}
                        onChange={setGoalMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="0"
                        tooltip="Target payoff time in months. Enter 0 to skip the goal calculation."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Interest Saved</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.interestSaved)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(calcInputs.extraMonthly)} extra each month &middot; {yearsMonths(results.monthsSaved)} off the term
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Time Saved</span>
                <span className="font-extrabold text-emerald-600">{yearsMonths(results.monthsSaved)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New Payoff Time</span>
                <span className="font-extrabold text-foreground">{yearsMonths(results.strategy.months)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New Monthly Payment</span>
                <span className="font-extrabold text-foreground">{money(results.totalMonthly)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Extra per Month</th>
                    <th className="p-2.5 text-right w-[120px]">Payoff Time</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Interest Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.scenarios.map((row) => {
                    const active = Math.round(calcInputs.extraMonthly) === row.extra;
                    return (
                      <tr
                        key={row.extra}
                        className={active ? "bg-primary/5 font-semibold" : "hover:bg-secondary/20 transition-colors"}
                      >
                        <td className="p-2.5 pl-3 font-semibold text-foreground">
                          {row.extra === 0 ? "$0 (scheduled)" : money(row.extra)}
                        </td>
                        <td className="p-2.5 text-right text-foreground">{yearsMonths(row.schedule.months)}</td>
                        <td className="p-2.5 pr-3 text-right font-semibold text-emerald-600">
                          {row.extra === 0 ? "—" : money(row.saved)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Your Payment</td>
                    <td className="p-2.5 text-right text-foreground">{yearsMonths(results.strategy.months)}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{money(results.interestSaved)}</td>
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
                  <span className="text-base font-bold text-foreground">{money(calcInputs.loanAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scheduled Payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.basePayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Without Extra</span>
                  <span className="text-base font-bold text-foreground">{money(results.base.interest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest With Extra</span>
                  <span className="text-base font-bold text-primary">{money(results.strategy.interest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.interestSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSaved >= 1200 ? "—" : Math.round(results.monthsSaved)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">New Payoff Date</span>
                  <span className="text-base font-bold text-foreground">{payoffDate(results.strategy.months)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Extra for {calcInputs.goalMonths > 0 ? `${Math.round(calcInputs.goalMonths)} mo` : "Goal"}
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {calcInputs.goalMonths > 0 && results.requiredExtra !== null && results.goalReachable
                      ? money(results.requiredExtra)
                      : calcInputs.goalMonths > 0
                        ? "Not reachable"
                        : "Set in Advanced"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Extra Payment Impact Calculator?</h2>
            <p>
              An extra payment impact calculator measures what happens to a mortgage when a borrower pays more than the
              scheduled amount each month. Because mortgage interest is charged on the outstanding balance, any payment above
              the scheduled amount reduces the balance immediately and lowers every subsequent interest charge. The loan then
              retires earlier, and the interest avoided over the shortened term is the saving.
            </p>
            <p>
              The tool is useful for two decisions. The first is how much extra to pay: the scenario table compares several
              monthly amounts so the marginal benefit of each additional dollar is visible rather than assumed. The second is
              whether a specific payoff date is reachable at all, which the goal solver answers by reporting the extra
              monthly amount required to retire the loan inside a chosen number of months.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Impact Is Calculated</h2>
            <p>
              The scheduled payment comes from the standard amortisation formula, which sets a level payment that clears the
              balance over the term: the loan amount multiplied by the monthly rate, divided by one minus the quantity one
              plus the monthly rate raised to the negative number of payments. Two schedules are then run side by side. The
              baseline uses exactly that payment, while the accelerated schedule adds the extra amount each month and applies
              the combined figure to the balance, accumulating interest month by month until the balance reaches zero.
            </p>
            <p>
              The difference between the two accumulated interest totals is the saving, and the difference between the two
              month counts is the time saved. The goal solver inverts the same schedule: it searches over possible extra
              amounts, applying the amortisation loop each time, until it finds the smallest extra payment that retires the
              loan inside the target number of months. Because the balance declines as payments flow in, this numeric
              approach is accurate where a simple division would not be.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports total interest saved at the extra amount you entered, with the time removed from the
              term underneath. The three statistics beside it show the time saved, the new payoff duration, and the total
              monthly payment including the extra. The breakdown table compares a range of extra amounts against the original
              schedule, so the point of diminishing returns is easy to see, and the row matching your entered amount is
              highlighted.
            </p>
            <p>
              Summary Statistics collects both interest totals, the months saved, the new payoff date and, when a payoff goal
              is set, the extra monthly amount required to hit it. Two practical cautions apply. Before starting, confirm the
              loan carries no prepayment penalty and that the servicer applies the extra amount to principal rather than
              simply crediting it toward the next instalment. And clear higher-interest debt first: prepaying a six percent
              mortgage while carrying a nineteen percent card balance leaves money on the table.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/extra-payment-impact-calculator" />
          <PopularCalculators exclude="/calculator/extra-payment-impact-calculator" />
        </div>
      </div>
    </>
  );
}
