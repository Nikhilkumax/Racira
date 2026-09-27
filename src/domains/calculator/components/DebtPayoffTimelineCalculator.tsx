"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TimelineInputs {
  balance: number;
  apr: number;
  monthlyPayment: number;
  extraMonthly: number;
  oneTime: number;
  startMonth: string;
}

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULTS: TimelineInputs = {
  balance: 9000,
  apr: 19.99,
  monthlyPayment: 350,
  extraMonthly: 0,
  oneTime: 0,
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

interface Milestone {
  pct: number;
  month: number;
  principalPaid: number;
  interestToDate: number;
}

interface TimelineResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
  baselineMonths: number;
  baselineInterest: number;
  interestSaved: number;
  monthsSaved: number;
  milestones: Milestone[];
  avgMonthlyInterest: number;
  finalPayment: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function simulateTimeline(balance: number, r: number, pay: number, oneTime: number) {
  let bal = Math.max(0, balance - oneTime);
  let interest = 0;
  let m = 0;
  let stalled = false;
  let finalPayment = 0;
  const milestones: Milestone[] = [];
  const targetPrincipal = balance;
  let principalPaid = Math.min(oneTime, balance);
  const targets = [0.25, 0.5, 0.75, 1];
  let nextTarget = 0;

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
    const principal = p - int;
    bal -= principal;
    principalPaid += principal;
    interest += int;
    m += 1;
    finalPayment = p;
    while (nextTarget < targets.length && principalPaid >= targetPrincipal * targets[nextTarget] - 0.005) {
      milestones.push({
        pct: targets[nextTarget] * 100,
        month: m,
        principalPaid: targetPrincipal * targets[nextTarget],
        interestToDate: interest,
      });
      nextTarget += 1;
    }
  }
  return { interest, months: m, milestones, stalled, finalPayment };
}

function computeTimeline(i: TimelineInputs): TimelineResult {
  const invalid =
    i.balance <= 0 || i.apr < 0 || i.monthlyPayment <= 0 || i.extraMonthly < 0 || i.oneTime < 0;
  const r = i.apr / 100 / 12;
  const main = simulateTimeline(i.balance, r, i.monthlyPayment + i.extraMonthly, i.oneTime);
  const base = simulateTimeline(i.balance, r, i.monthlyPayment, 0);

  return {
    months: main.months,
    totalInterest: main.interest,
    totalPaid: i.balance + main.interest,
    payoffDate: addMonths(i.startMonth, main.months),
    baselineMonths: base.months,
    baselineInterest: base.interest,
    interestSaved: Math.max(0, base.interest - main.interest),
    monthsSaved: Math.max(0, base.months - main.months),
    milestones: main.milestones,
    avgMonthlyInterest: main.months > 0 ? main.interest / main.months : 0,
    finalPayment: main.finalPayment,
    stalled: main.stalled || base.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance and payment above zero, a non-negative rate, and non-negative extra payments."
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

export default function DebtPayoffTimelineCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [oneTime, setOneTime] = useState(String(DEFAULTS.oneTime));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TimelineInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    oneTime: parseFloat(oneTime) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<TimelineInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TimelineResult>(() => computeTimeline(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTimeline(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setOneTime(String(DEFAULTS.oneTime));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeTimeline(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is a debt payoff timeline calculated?",
      answer:
        "The balance is reduced month by month: interest is charged at the monthly rate, the payment clears that interest first, and the remainder reduces the principal. The timeline records how much principal has been repaid at each point, so it can mark the month in which you pass 25%, 50%, 75% and 100% of the original balance, and report the interest paid up to each milestone.",
    },
    {
      question: "Why does the timeline feel like nothing happens at first?",
      answer:
        "Because early payments are mostly interest. On a $9,000 balance at 19.99%, the first month charges about $150 of interest — nearly half of a $350 payment. Principal progress accelerates as the balance falls: the same payment that retires $200 of principal at the start retires $300 later on. The milestone table makes that acceleration visible, which is why the midpoint and end of the schedule arrive faster than the beginning feels.",
    },
    {
      question: "Do extra payments really move the milestones that much?",
      answer:
        "Yes, and the effect compounds because extra principal also removes all the future interest that money would have generated. Adding $100 a month to a $350 payment on the defaults here can bring the 50% milestone forward by many months and the payoff date forward by years. The interest saved figure compares the timeline with extras against the timeline without, so the value of the change is explicit.",
    },
    {
      question: "What does the interest-to-date column show?",
      answer:
        "It shows how much interest has been charged by the time each milestone is reached. Because interest is front-loaded — you pay it on the whole balance while it is at its largest — the figure at the 25% milestone is often close to half of the total interest for the whole schedule. Seeing that concentration is the clearest argument for paying extra early rather than late.",
    },
    {
      question: "Should I use a payoff timeline or an amortization schedule?",
      answer:
        "They answer different questions. A full amortization schedule lists every payment for a loan with a fixed term. A payoff timeline is for open-ended balances — credit cards, personal lines, any debt where you choose the payment — and shows when the balance reaches each fraction of the original, plus the effect of extra payments. When the payment is fixed and the term is known, an amortization schedule is the more precise tool.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Payoff Timeline Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Payoff Timeline Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Debt Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Outstanding balance being repaid."
                />
                <CompactInput
                  id="apr"
                  label="APR"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Annual rate charged on the balance."
                />
              </div>
            </SubSection>

            <SubSection title="Payment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="monthly-payment"
                  label="Monthly Payment"
                  value={monthlyPayment}
                  onChange={setMonthlyPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="1"
                  tooltip="Amount paid every month."
                />
                <CompactInput
                  id="start-month"
                  label="First Payment Month"
                  value={startMonth}
                  onChange={setStartMonth}
                  onEnter={runCalculate}
                  type="month"
                  tooltip="Month of the first payment, used for the payoff date."
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
                  <SubSection title="Extra Payments">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra-monthly"
                        label="Extra Monthly"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional principal paid every month."
                      />
                      <CompactInput
                        id="one-time"
                        label="One-Time Payment"
                        value={oneTime}
                        onChange={setOneTime}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Lump sum applied to principal at the start."
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
            {results.valid && results.stalled && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Payment too low</div>
                <div className="text-base font-medium text-foreground">
                  The payment does not cover the monthly interest, so the balance never reaches zero.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Months to Payoff</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{results.months}</div>
              <div className="text-sm text-muted-foreground font-medium">Debt free in {results.payoffDate}</div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Interest
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.totalInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalPaid, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Monthly Interest
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.avgMonthlyInterest, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Payoff Milestone</th>
                    <th className="p-2.5 text-right w-[110px]">Month</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Interest To Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.milestones.map((ms) => (
                    <tr key={ms.pct} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {fmt(ms.pct, 0)}% principal repaid (${fmt(ms.principalPaid, 0)})
                      </td>
                      <td className="p-2.5 text-right text-foreground">{ms.month}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">${fmt(ms.interestToDate, 0)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Debt cleared</td>
                    <td className="p-2.5 text-right text-foreground">{results.months}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.totalInterest, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Payoff Without Extras
                  </span>
                  <span className="text-base font-bold text-foreground">{results.baselineMonths} months</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest Saved With Extras
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.interestSaved, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSaved > 0 ? `${results.monthsSaved} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Monthly Payment
                  </span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(calcInputs.monthlyPayment + calcInputs.extraMonthly)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Payment</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.finalPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.apr, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Payoff Timeline Calculator?</h2>
            <p>
              A debt payoff timeline calculator turns a repayment plan into dates. Instead of a single answer — the
              month the balance reaches zero — it marks the journey: the point at which a quarter of the principal has
              been repaid, then half, three-quarters and finally the end. Alongside each milestone it records how much
              interest has been charged by that date, which is where the surprises live in almost every repayment plan.
            </p>
            <p>
              The timeline is most useful for open-ended debts such as credit cards and personal lines, where you choose
              how much to pay each month and the payoff date is whatever the arithmetic produces. It shows why early
              progress feels slow — on a high-rate balance the first payments are mostly interest — and how quickly the
              pace accelerates once enough principal has been retired. It also quantifies what adding to the payment
              would change.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each month the calculator charges interest on the outstanding balance at the monthly rate, applies your
              payment to that interest first, and reduces the principal by the remainder. It tracks cumulative principal
              repaid against the original balance and records a milestone each time the figure crosses 25%, 50%, 75% and
              100% — storing the month number and the total interest charged up to that point.
            </p>
            <p>
              The whole schedule is then run a second time without extra payments to establish a baseline, and the two
              results are compared: interest saved, months removed, and the effect on each milestone. Any extra monthly
              payment is added to every scheduled payment, and a one-time payment is applied to principal at the start, so
              the milestones reflect the accelerated path rather than the original plan.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the months to payoff and the calendar date it corresponds to. The three-stat bar
              shows total interest, total paid and the average interest charged per month, while the breakdown table
              lists the four milestones with the interest paid by each — the clearest evidence that interest is
              front-loaded and that early extra payments do the most work.
            </p>
            <p>
              Summary Statistics adds the payoff duration without extras, the interest and months saved, the total
              monthly payment including any extra, and the final payment. Treat the schedule as a planning guide: rates
              on revolving balances move with the prime rate, new spending restarts the clock, and minimum payments can
              change the pace unexpectedly. Used consistently, the timeline converts an abstract debt into a sequence of
              dates to aim for — and each milestone reached is a reason to keep the payment where it is. Compare the
              milestone spacing rather than just the final date: a schedule where the first two milestones take as long
              as the last two is telling you the balance is too large relative to the payment, and that raising the
              payment now would compress the early, expensive phase — the part of the timeline where nearly all of the
              interest is incurred. Keep a copy of the milestone dates and revisit them after every rate change, because a
              quarter-point move on a large balance shifts every milestone by weeks.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-payoff-timeline-calculator" />
          <PopularCalculators exclude="/calculator/debt-payoff-timeline-calculator" />
        </div>
      </div>
    </>
  );
}
