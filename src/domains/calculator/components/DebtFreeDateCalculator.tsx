"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DebtFreeInputs {
  balance: number;
  apr: number;
  monthlyPayment: number;
  extraMonthly: number;
  startMonth: string;
}

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULTS: DebtFreeInputs = {
  balance: 8500,
  apr: 18.99,
  monthlyPayment: 300,
  extraMonthly: 100,
  startMonth: CURRENT_MONTH,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function addMonths(startMonth: string, months: number): string {
  const parts = startMonth.split("-");
  const y = Number(parts[0]) || now.getFullYear();
  const m = Number(parts[1]) || 1;
  const total = y * 12 + (m - 1) + Math.round(months);
  const ny = Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${MONTHS[nm]} ${ny}`;
}

interface DateResult {
  months: number;
  baselineMonths: number;
  payoffDate: string;
  baselineDate: string;
  monthsSaved: number;
  interestPaid: number;
  baselineInterest: number;
  interestSaved: number;
  halfwayMonth: number;
  halfwayDate: string;
  finalPayment: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function simulateDate(balance: number, r: number, pay: number) {
  let bal = balance;
  let interest = 0;
  let m = 0;
  let stalled = false;
  let finalPayment = 0;
  let halfwayMonth = 0;
  const half = balance / 2;

  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    if (pay <= int) {
      stalled = true;
      bal += pay - int;
      interest += int;
      m += 1;
      continue;
    }
    const p = Math.min(pay, bal + int);
    bal -= p - int;
    interest += int;
    m += 1;
    finalPayment = p;
    if (halfwayMonth === 0 && bal <= half) halfwayMonth = m;
  }
  return { months: m, interest, stalled, finalPayment, halfwayMonth };
}

function computeDebtFree(i: DebtFreeInputs): DateResult {
  const invalid =
    i.balance <= 0 || i.apr < 0 || i.monthlyPayment <= 0 || i.extraMonthly < 0 || !i.startMonth;

  const r = i.apr / 100 / 12;
  const main = simulateDate(i.balance, r, i.monthlyPayment + i.extraMonthly);
  const base = simulateDate(i.balance, r, i.monthlyPayment);

  return {
    months: main.months,
    baselineMonths: base.months,
    payoffDate: addMonths(i.startMonth, main.months),
    baselineDate: addMonths(i.startMonth, base.months),
    monthsSaved: Math.max(0, base.months - main.months),
    interestPaid: main.interest,
    baselineInterest: base.interest,
    interestSaved: Math.max(0, base.interest - main.interest),
    halfwayMonth: main.halfwayMonth || main.months,
    halfwayDate: addMonths(i.startMonth, main.halfwayMonth || main.months),
    finalPayment: main.finalPayment,
    stalled: main.stalled || base.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance and payment above zero, a non-negative rate, and a start month."
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

export default function DebtFreeDateCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DebtFreeInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    startMonth: startMonth || CURRENT_MONTH,
  });

  const [calcInputs, setCalcInputs] = useState<DebtFreeInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DateResult>(() => computeDebtFree(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDebtFree(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeDebtFree(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is the debt-free date calculated?",
      answer:
        "The calculator amortizes the balance month by month: interest is charged at the APR divided by twelve, the payment is applied to interest first and principal second, and the remaining balance carries into the next month. The month in which the balance reaches zero is added to your start month to produce a calendar date. Extra payments shrink each month's balance faster, which pulls the date forward.",
    },
    {
      question: "Why does a small extra payment move the date so much?",
      answer:
        "Extra dollars go entirely to principal, so they remove balance that would otherwise accrue interest for every remaining month. On a high-rate balance the effect compounds: the interest you avoid becomes additional principal reduction in the following month. This is why an extra $100 a month can remove not just $100 of time but several months of payments from the end of a long schedule.",
    },
    {
      question: "Does the payoff order of multiple debts change the date?",
      answer:
        "It does. If you are paying several balances, the total monthly amount matters most, but directing the surplus to the highest-rate debt first generally produces the earliest overall payoff and the lowest total interest. Some people instead clear small balances first for momentum. Either way, running the date with your full monthly commitment gives the honest timeline.",
    },
    {
      question: "What if my payment does not cover the monthly interest?",
      answer:
        "Then the balance grows instead of shrinking and no payoff date exists. The calculator flags this condition rather than returning a misleading figure. The fix is structural: raise the payment above the interest line, consolidate to a lower rate, or address the balance through a hardship or settlement route before a refinance. A timeline only becomes real once each payment reduces principal.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Free Date Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Free Date Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Debt Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Current Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The total you owe today."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate (APR)"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Annual rate charged on the balance."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="monthly-payment"
                  label="Monthly Payment"
                  value={monthlyPayment}
                  onChange={setMonthlyPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The payment you commit to every month."
                />
                <CompactInput
                  id="extra-monthly"
                  label="Extra Each Month"
                  value={extraMonthly}
                  onChange={setExtraMonthly}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Additional principal you can add on top."
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
                  <SubSection title="Timeline Start">
                    <CompactInput
                      id="start-month"
                      label="Start Month"
                      value={startMonth}
                      onChange={setStartMonth}
                      onEnter={runCalculate}
                      type="month"
                      tooltip="The month your first payment lands — dates are projected from here."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt-Free Date</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{results.payoffDate}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.stalled
                  ? "This payment does not cover the monthly interest — no payoff date exists"
                  : `${fmt(results.months, 0)} months at $${fmt(calcInputs.monthlyPayment + calcInputs.extraMonthly, 0)} per month`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Months to Freedom</span>
                <span className="font-extrabold text-foreground">{fmt(results.months, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Paid</span>
                <span className="font-extrabold text-foreground">${fmt(results.interestPaid, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Months Saved</span>
                <span className="font-extrabold text-emerald-600">{fmt(results.monthsSaved, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Milestone</th>
                    <th className="p-2.5 text-right w-[160px]">Projected Date</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Months</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Half the balance cleared</td>
                    <td className="p-2.5 text-right text-foreground">{results.halfwayDate}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.halfwayMonth, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt-free with extra payment</td>
                    <td className="p-2.5 text-right font-semibold text-foreground">{results.payoffDate}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.months, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt-free on minimums only</td>
                    <td className="p-2.5 text-right text-foreground">{results.baselineDate}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.baselineMonths, 0)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Time gained</td>
                    <td className="p-2.5 text-right text-emerald-600">Earlier payoff</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.monthsSaved, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Monthly Payment</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(calcInputs.monthlyPayment + calcInputs.extraMonthly, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(calcInputs.balance + results.interestPaid, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest on Minimums</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.baselineInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</span>
                  <span className="text-base font-bold text-emerald-600">${fmt(results.interestSaved, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average Monthly Interest</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(results.months > 0 ? results.interestPaid / results.months : 0, 2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Payment</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.finalPayment, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Free Date Calculator?</h2>
            <p>
              A debt free date calculator turns a balance, a rate and a monthly payment into an actual calendar date,
              the day the last payment clears and the balance reaches zero. Instead of a vague sense that you will be
              paying this off &quot;for years,&quot; you get a specific month and year, plus the milestones along the way.
              Naming the date changes behavior: a target you can circle on a calendar is easier to protect than an
              abstract intention to pay more eventually.
            </p>
            <p>
              The calculator also shows how much earlier the date arrives when you add extra principal. Because each
              additional dollar removes balance that would have accrued interest in every remaining month, a modest
              increase in the payment produces an outsized move in the payoff date — the effect is strongest on high-rate
              balances early in the schedule, when the balance is still large.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The balance is amortized month by month. Each month the outstanding balance is multiplied by the APR
              divided by twelve to produce the interest charge; your payment covers that interest first, and whatever
              remains reduces principal. The reduced balance carries into the next month. When the balance falls to zero,
              the month count is added to your start month to produce the projected debt-free date.
            </p>
            <p>
              A second pass runs the same simulation using only the required minimum, which produces a baseline date. The
              difference between the two reveals the value of your extra payment in both months and interest. The tool
              also records when half the original balance is cleared, a milestone that usually arrives well before the
              midpoint of the term, because early payments are interest-heavy and later ones are principal-heavy.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card displays the projected debt-free date with the number of months and effective monthly
              payment beneath it. The three-stat bar reports months to freedom, interest paid and months saved versus
              minimums, while the milestone table lays out the halfway point, the accelerated payoff date and the
              baseline date side by side.
            </p>
            <p>
              The gap between the two dates is the clearest argument for paying extra. Note too how the interest saved
              grows faster than the months saved: on a long, high-rate schedule the last payments are almost entirely
              principal, so removing them saves little interest, whereas removing early months cuts interest that would
              otherwise compound for years. If the payment shown does not cover monthly interest, the balance is growing
              and no date exists until the payment rises above the interest line.
            </p>
            <p>
              Finally, treat the date as a target that moves in your favor. Every extra dollar, every windfall applied
              to principal, and every rate reduction pushes it earlier. Re-run the numbers whenever your situation
              changes, and once one balance clears, fold its payment into the next so the debt-free date keeps moving
              closer instead of stalling. Keeping the extra payment steady even after a raise, a bonus or a lower minimum
              is what turns a projected date into a real one.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-free-date-calculator" />
          <PopularCalculators exclude="/calculator/debt-free-date-calculator" />
        </div>
      </div>
    </>
  );
}
