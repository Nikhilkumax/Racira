"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RevolvingInputs {
  balance: number;
  apr: number;
  paymentRatePct: number;
  minimumFloor: number;
  extraMonthly: number;
  startMonth: string;
}

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULTS: RevolvingInputs = {
  balance: 5000,
  apr: 21.99,
  paymentRatePct: 2.5,
  minimumFloor: 25,
  extraMonthly: 0,
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

interface RevolvingResult {
  totalInterest: number;
  months: number;
  totalPaid: number;
  firstPayment: number;
  lastPayment: number;
  interestPer100: number;
  payoffDate: string;
  interestSavedWithExtra: number;
  monthsSavedWithExtra: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function simulateRevolving(balance: number, r: number, ratePct: number, floor: number, extra: number) {
  let bal = balance;
  let interest = 0;
  let m = 0;
  let first = 0;
  let last = 0;
  let stalled = false;
  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    let pay = Math.max(bal * (ratePct / 100), floor) + extra;
    if (m === 0) first = pay;
    if (pay <= int) {
      stalled = true;
      bal += pay - int;
      interest += int;
      m += 1;
      continue;
    }
    if (pay > bal + int) pay = bal + int;
    last = pay;
    bal -= pay - int;
    interest += int;
    m += 1;
  }
  return { interest, months: m, first, last, stalled };
}

function computeRevolving(i: RevolvingInputs): RevolvingResult {
  const invalid =
    i.balance <= 0 ||
    i.apr < 0 ||
    i.paymentRatePct <= 0 ||
    i.paymentRatePct > 100 ||
    i.minimumFloor < 0 ||
    i.extraMonthly < 0;

  const r = i.apr / 100 / 12;
  const base = simulateRevolving(i.balance, r, i.paymentRatePct, i.minimumFloor, 0);
  const withExtra = simulateRevolving(i.balance, r, i.paymentRatePct, i.minimumFloor, i.extraMonthly);

  return {
    totalInterest: withExtra.interest,
    months: withExtra.months,
    totalPaid: i.balance + withExtra.interest,
    firstPayment: withExtra.first,
    lastPayment: withExtra.last,
    interestPer100: i.balance > 0 ? (withExtra.interest / i.balance) * 100 : 0,
    payoffDate: addMonths(i.startMonth, withExtra.months),
    interestSavedWithExtra: Math.max(0, base.interest - withExtra.interest),
    monthsSavedWithExtra: Math.max(0, base.months - withExtra.months),
    stalled: base.stalled || withExtra.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance above zero, a payment rate between 0% and 100%, and non-negative floor and extras."
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

export default function RevolvingDebtCostCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [paymentRatePct, setPaymentRatePct] = useState(String(DEFAULTS.paymentRatePct));
  const [minimumFloor, setMinimumFloor] = useState(String(DEFAULTS.minimumFloor));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RevolvingInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    paymentRatePct: parseFloat(paymentRatePct) || 0,
    minimumFloor: parseFloat(minimumFloor) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    startMonth,
  });

  const [calcInputs, setCalcInputs] = useState<RevolvingInputs>(() => DEFAULTS);
  const [results, setResults] = useState<RevolvingResult>(() => computeRevolving(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeRevolving(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setPaymentRatePct(String(DEFAULTS.paymentRatePct));
    setMinimumFloor(String(DEFAULTS.minimumFloor));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setStartMonth(DEFAULTS.startMonth);
    setCalcInputs(DEFAULTS);
    setResults(computeRevolving(DEFAULTS));
  };

  const faqs = [
    {
      question: "What makes revolving debt more expensive than an installment loan?",
      answer:
        "The payment structure. An installment loan fixes both the payment and the term, so the debt disappears on a known date. A revolving line lets the payment shrink as the balance falls, and it re-borrows automatically when you spend again. That flexibility means there is no built-in end date, and interest keeps accruing on whatever balance you carry. A 2.5% minimum on a $5,000 balance at 21.99% can take well over a decade to clear if you never pay more than the minimum.",
    },
    {
      question: "How does a percentage-based minimum payment work?",
      answer:
        "Most issuers calculate the minimum as a percentage of the statement balance, typically 1% to 3%, subject to a floor such as $25 or $35, plus any interest and fees for the period. The critical feature is that the payment falls as the balance falls, so the schedule slows down over time — in the early months a large share of the payment is interest, and by the end the payment approaches the floor even though the balance is small.",
    },
    {
      question: "Why does paying a fixed amount instead of the minimum save so much?",
      answer:
        "A fixed payment stays constant while the minimum shrinks, so the gap between them goes straight to principal. On a $5,000 balance at 21.99%, the minimum path can run for more than a decade, while a fixed $250 payment clears it in roughly two years and saves thousands in interest. The calculator shows both the interest saved and the months removed when you add an extra amount to every payment.",
    },
    {
      question: "What is the minimum payment floor and why does it matter?",
      answer:
        "The floor is the smallest payment an issuer will accept, often $25 to $40. It matters most on small balances, where the percentage calculation would produce a payment below the floor. Once the balance is low enough that the percentage-based payment falls under the floor, the floor takes over and the final months are paid off at a fixed pace. Raising or removing the floor assumption changes the tail of the schedule noticeably on small balances.",
    },
    {
      question: "Should I close the account once the balance is paid off?",
      answer:
        "Usually not, for two reasons. Closing a revolving account reduces your total available credit and therefore raises your utilization ratio, and it shortens your average account age over time. If the account has no annual fee, keeping it open and using it lightly for a small recurring charge paid in full each month preserves the limit. If the account charges a fee you do not use, closing it is a reasonable cost decision.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Revolving Debt Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Revolving Debt Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Revolving Balance">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance carried on the card or line of credit."
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

            <SubSection title="Payment Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="payment-rate"
                  label="Minimum Payment Rate"
                  value={paymentRatePct}
                  onChange={setPaymentRatePct}
                  onEnter={runCalculate}
                  suffix="% of balance"
                  step="0.1"
                  tooltip="Percentage of the statement balance used to calculate the minimum, typically 1% to 3%."
                />
                <CompactInput
                  id="minimum-floor"
                  label="Minimum Floor"
                  value={minimumFloor}
                  onChange={setMinimumFloor}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Smallest payment the issuer will accept, regardless of the percentage calculation."
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
                  <SubSection title="Extra Payments & Timeline">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra-monthly"
                        label="Extra Monthly"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional amount paid every month on top of the minimum."
                      />
                      <CompactInput
                        id="start-month"
                        label="First Payment Month"
                        value={startMonth}
                        onChange={setStartMonth}
                        onEnter={runCalculate}
                        type="month"
                        tooltip="Month of the first payment, used to derive the payoff date."
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
                  The payment rate does not cover the monthly interest at this APR, so the balance never falls.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Total Interest Cost
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.totalInterest, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.interestPer100, 0)} of interest for every $100 carried
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Months to Payoff
                </span>
                <span className="font-extrabold text-foreground">{results.months}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  First Payment
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.firstPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalPaid, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Balance (Principal)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.balance, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.totalPaid > 0 ? (calcInputs.balance / results.totalPaid) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.totalPaid > 0 ? (results.totalInterest / results.totalPaid) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Paid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalPaid, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">100%</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Date</span>
                  <span className="text-base font-bold text-foreground">{results.payoffDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Final Payment
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.lastPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest Saved With Extra
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.interestSavedWithExtra, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSavedWithExtra > 0 ? `${results.monthsSavedWithExtra} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Interest as % of Balance
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.interestPer100, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Payment Rate vs Interest
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.apr / 12, 2)}% monthly interest
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Revolving Debt Cost Calculator?</h2>
            <p>
              A revolving debt cost calculator totals what a credit card or line-of-credit balance costs when you repay
              it the way the issuer designed — with a minimum payment that is a percentage of the balance. Unlike an
              installment loan, which fixes both the payment and the payoff date, a revolving account recalculates the
              minimum every month as the balance falls, so the repayment schedule quietly stretches and there is no
              built-in end date at all.
            </p>
            <p>
              The cost difference is dramatic. A balance repaid at the minimum can run for years longer than the same
              balance repaid at a fixed amount, and the interest bill can approach or exceed the original principal. This
              calculator models the true percentage-based schedule — including the payment floor that issuers apply and
              the shifting split between interest and principal — so the price of minimum payments is visible as a
              number rather than a feeling.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each month the calculator charges interest on the outstanding balance at the monthly rate, which is the APR
              divided by twelve. The payment is the greater of the minimum payment percentage multiplied by the balance,
              or the fixed floor the issuer enforces, plus any extra you add. The payment covers interest first and
              principal second, and the process repeats until the balance reaches zero.
            </p>
            <p>
              Because the payment is recalculated from the falling balance each month, the schedule is not a simple
              amortisation: early payments are large and mostly interest, while later payments shrink toward the floor.
              The calculator records the first and final payments so that drift is visible, and it runs the schedule a
              second time with the extra monthly payment included, in order to report the interest saved and the months
              removed from the payoff.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports total interest with the cost per $100 of balance beneath it. The three-stat bar
              gives the months to payoff, the first payment, and the total paid, while the breakdown table splits the
              total into principal and interest with each share, making the interest share impossible to miss on a
              high-rate revolving balance.
            </p>
            <p>
              Summary Statistics adds the payoff date, the final payment, the interest and months saved by paying extra,
              and the monthly interest rate for comparison with the payment rate. The comparison between the two rates
              is the clearest way to see the trap: when a card charges 1.83% a month in interest and the minimum requires
              only 2.5% of the balance, barely a fifth of every payment touches the principal, and the schedule lengthens
              with every month you stay on it. Treat the output as a planning
              estimate: issuers change floors and formulas, promotional rates expire, and new spending on the account
              restarts the clock. The single most effective change is to stop using the percentage minimum as your
              payment — set a fixed amount above it, keep it there, and the schedule regains the fixed end date that
              installment loans have by design. Pay attention to the first payment figure as well: it is the closest the
              schedule ever gets to a fixed payment, and matching it deliberately every month turns the revolving line
              into something that behaves like the installment loan it never was.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/revolving-debt-cost-calculator" />
          <PopularCalculators exclude="/calculator/revolving-debt-cost-calculator" />
        </div>
      </div>
    </>
  );
}
