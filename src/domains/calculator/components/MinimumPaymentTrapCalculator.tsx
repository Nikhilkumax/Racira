"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TrapInputs {
  balance: number;
  apr: number;
  principalPct: number;
  principalFloor: number;
  fixedPayment: number;
  startMonth: string;
}

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULTS: TrapInputs = {
  balance: 5000,
  apr: 24.99,
  principalPct: 1,
  principalFloor: 25,
  fixedPayment: 250,
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

interface Schedule {
  interest: number;
  months: number;
  firstPayment: number;
  lastPayment: number;
  stalled: boolean;
}

function simulateMinimum(balance: number, r: number, pct: number, floor: number): Schedule {
  let bal = balance;
  let interest = 0;
  let m = 0;
  let first = 0;
  let last = 0;
  let stalled = false;
  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    const principal = Math.max(bal * (pct / 100), floor);
    let pay = int + principal;
    if (m === 0) first = pay;
    if (pay > bal + int) pay = bal + int;
    if (pay <= int) {
      stalled = true;
      bal += pay - int;
      interest += int;
      m += 1;
      continue;
    }
    last = pay;
    bal -= pay - int;
    interest += int;
    m += 1;
  }
  return { interest, months: m, firstPayment: first, lastPayment: last, stalled };
}

function simulateFixed(balance: number, r: number, pay: number): Schedule {
  let bal = balance;
  let interest = 0;
  let m = 0;
  let stalled = false;
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
  }
  return { interest, months: m, firstPayment: pay, lastPayment: pay, stalled };
}

interface TrapResult {
  minInterest: number;
  minMonths: number;
  minFirstPayment: number;
  minLastPayment: number;
  fixedInterest: number;
  fixedMonths: number;
  interestSaved: number;
  monthsSaved: number;
  minTotalPaid: number;
  fixedTotalPaid: number;
  minPayoffDate: string;
  fixedPayoffDate: string;
  minInterestPer100: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeTrap(i: TrapInputs): TrapResult {
  const invalid =
    i.balance <= 0 ||
    i.apr < 0 ||
    i.principalPct <= 0 ||
    i.principalPct > 100 ||
    i.principalFloor < 0 ||
    i.fixedPayment <= 0;

  const r = i.apr / 100 / 12;
  const min = simulateMinimum(i.balance, r, i.principalPct, i.principalFloor);
  const fixed = simulateFixed(i.balance, r, i.fixedPayment);

  return {
    minInterest: min.interest,
    minMonths: min.months,
    minFirstPayment: min.firstPayment,
    minLastPayment: min.lastPayment,
    fixedInterest: fixed.interest,
    fixedMonths: fixed.months,
    interestSaved: Math.max(0, min.interest - fixed.interest),
    monthsSaved: Math.max(0, min.months - fixed.months),
    minTotalPaid: i.balance + min.interest,
    fixedTotalPaid: i.balance + fixed.interest,
    minPayoffDate: addMonths(i.startMonth, min.months),
    fixedPayoffDate: addMonths(i.startMonth, fixed.months),
    minInterestPer100: i.balance > 0 ? (min.interest / i.balance) * 100 : 0,
    stalled: min.stalled || fixed.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance above zero, a principal payment rate between 0% and 100%, and a fixed payment above zero."
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

export default function MinimumPaymentTrapCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [principalPct, setPrincipalPct] = useState(String(DEFAULTS.principalPct));
  const [principalFloor, setPrincipalFloor] = useState(String(DEFAULTS.principalFloor));
  const [fixedPayment, setFixedPayment] = useState(String(DEFAULTS.fixedPayment));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TrapInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    principalPct: parseFloat(principalPct) || 0,
    principalFloor: parseFloat(principalFloor) || 0,
    fixedPayment: parseFloat(fixedPayment) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<TrapInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TrapResult>(() => computeTrap(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTrap(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setPrincipalPct(String(DEFAULTS.principalPct));
    setPrincipalFloor(String(DEFAULTS.principalFloor));
    setFixedPayment(String(DEFAULTS.fixedPayment));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeTrap(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the minimum payment trap?",
      answer:
        "The minimum payment trap is the cycle of paying only the smallest amount the issuer requires, month after month, while interest consumes most of each payment. Because the minimum is set as interest plus a small percentage of principal, the balance falls very slowly and the schedule has no fixed end date. A $5,000 balance at 24.99% repaid at a 1%-of-balance minimum can take more than two decades and cost several times the original balance in interest.",
    },
    {
      question: "How is a credit card minimum payment actually calculated?",
      answer:
        "Most issuers calculate the minimum as the interest and fees for the period plus a percentage of the principal — commonly 1% — subject to a floor such as $25 or $35. That formula is why the minimum changes every month: as the balance falls, both the interest charge and the principal portion shrink. The trap is structural, not an accident: a smaller balance produces a smaller required payment, which slows the payoff further.",
    },
    {
      question: "How much does paying a fixed amount save?",
      answer:
        "Far more than most people expect. Because a fixed payment does not shrink with the balance, every month the gap between it and the falling minimum goes straight to principal. On the defaults here, replacing a 1% minimum with a $250 fixed payment cuts the repayment from well over a decade to roughly two and a half years and saves thousands in interest. The calculator shows both schedules side by side so the difference is explicit.",
    },
    {
      question: "Why is the first minimum payment so much larger than later ones?",
      answer:
        "The minimum is calculated from the current balance, so at the start the interest charge is high and the principal portion is based on the full balance. As the balance falls, both components shrink. By the end of the schedule the payment approaches the floor, even though only a small balance remains. That decline is exactly what stretches the payoff — and why the fixed payment comparison matters more than the starting minimum.",
    },
    {
      question: "Should I pay the minimum on one card while paying extra on another?",
      answer:
        "Yes — paying the minimum on every account keeps them current and avoids late fees, while directing extra money to one target accelerates the overall payoff. Paying the highest-rate balance first (the avalanche method) minimises total interest; paying the smallest balance first (the snowball method) produces earlier wins and better follow-through for many people. Either beats spreading the extra evenly across several balances.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Minimum Payment Trap Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Minimum Payment Trap Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance & Rate">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance carried on the card."
                />
                <CompactInput
                  id="apr"
                  label="APR"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Annual percentage rate charged on the balance."
                />
              </div>
            </SubSection>

            <SubSection title="Payment Structure">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="principal-pct"
                  label="Principal Portion"
                  value={principalPct}
                  onChange={setPrincipalPct}
                  onEnter={runCalculate}
                  suffix="% of balance"
                  step="0.1"
                  tooltip="Percentage of the balance applied to principal each month, on top of interest."
                />
                <CompactInput
                  id="principal-floor"
                  label="Minimum Principal Floor"
                  value={principalFloor}
                  onChange={setPrincipalFloor}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Smallest principal portion required each month."
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
                  <SubSection title="Fixed Payment Comparison">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="fixed-payment"
                        label="Fixed Payment"
                        value={fixedPayment}
                        onChange={setFixedPayment}
                        onEnter={runCalculate}
                        prefix="$"
                        min="1"
                        tooltip="Constant payment you would make instead of the minimum."
                      />
                      <CompactInput
                        id="start-month"
                        label="First Payment Month"
                        value={startMonth}
                        onChange={setStartMonth}
                        onEnter={runCalculate}
                        type="month"
                        tooltip="Month of the first payment, used to derive payoff dates."
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
                  One of the schedules does not cover the monthly interest, so that balance never falls.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Total Interest With Minimum Payments
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.minInterest, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.minInterestPer100, 0)} of interest for every $100 carried
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Months on Minimum
                </span>
                <span className="font-extrabold text-foreground">{results.minMonths}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Months at Fixed
                </span>
                <span className="font-extrabold text-foreground">{results.fixedMonths}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Interest Saved
                </span>
                <span className="font-extrabold text-primary">${fmt(results.interestSaved, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Minimum Path</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Fixed ${fmt(calcInputs.fixedPayment, 0)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Balance (Principal)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.balance, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(calcInputs.balance, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.minInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.fixedInterest, 0)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Paid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.minTotalPaid, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.fixedTotalPaid, 0)}</td>
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
                    Payoff at Minimum
                  </span>
                  <span className="text-base font-bold text-foreground">{results.minPayoffDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Payoff at Fixed Payment
                  </span>
                  <span className="text-base font-bold text-foreground">{results.fixedPayoffDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    First Minimum Payment
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.minFirstPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Final Minimum Payment
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.minLastPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-primary">
                    {results.monthsSaved > 0 ? `${results.monthsSaved} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Years Saved
                  </span>
                  <span className="text-base font-bold text-primary">
                    {results.monthsSaved > 0 ? `${(results.monthsSaved / 12).toFixed(1)} years` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Minimum Payment Trap Calculator?</h2>
            <p>
              A minimum payment trap calculator shows how long a credit card balance takes to clear — and what it costs
              — when you pay only the minimum the issuer requires. Card minimums are calculated as the interest and fees
              for the period plus a small percentage of the principal, usually around 1%, subject to a fixed floor. The
              result is a payment that shrinks every month as the balance falls, which is why minimum-only repayment can
              stretch across decades and cost a multiple of the original balance in interest.
            </p>
            <p>
              The trap is structural rather than accidental. Because the minimum falls with the balance, the schedule
              slows down precisely when you are making progress, and the final payments collapse toward the floor even
              though the balance is small. Comparing the minimum path against a fixed payment of the same starting size
              makes the cost of that design visible: the fixed payment clears the debt years earlier and removes a large
              share of the interest bill, without requiring any more money up front.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator runs two schedules side by side. In the minimum schedule, each month&apos;s payment is the
              interest charged on the balance plus the greater of the principal percentage multiplied by the balance, or
              the fixed principal floor. That payment is applied interest first and principal second, the balance is
              updated, and the process repeats until the debt is cleared — up to a cap of 100 years.
            </p>
            <p>
              In the fixed schedule, the same balance and rate are repaid with a constant payment that does not change
              as the balance falls. The calculator records total interest, total paid and the number of months for both
              schedules, then reports the differences: interest saved and months saved. It also captures the first and
              final minimum payments so the decline of the minimum is visible, and flags the case where a payment fails
              to cover the monthly interest entirely.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the total interest paid on the minimum path, expressed also per $100 of balance.
              The three-stat bar gives the months on minimum, the months at the fixed payment and the interest saved, and
              the breakdown table lays both schedules out in full — principal, interest and total paid — so the two
              outcomes can be compared line by line.
            </p>
            <p>
              Summary Statistics adds both payoff dates, the first and final minimum payments and the time saved in
              months and years. The contrast between the two paths is the whole lesson of the calculator: identical
              balances, identical rates, and a difference of years and thousands of dollars created purely by the size
              of the payment. Treat the model as a faithful approximation of how issuers compute minimums rather than a
              contract: percentage and floor assumptions vary by card, interest rates move with the prime rate, and new
              spending restarts the balance. The practical conclusion is simple: choose a fixed payment above the
              minimum, automate it, and stop treating the issuer&apos;s minimum as a target — the difference between the
              two is the entire cost of the trap.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/minimum-payment-trap-calculator" />
          <PopularCalculators exclude="/calculator/minimum-payment-trap-calculator" />
        </div>
      </div>
    </>
  );
}
