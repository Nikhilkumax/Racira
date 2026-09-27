"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface GraceInputs {
  statementBalance: number;
  apr: number;
  graceDays: number;
  payment: number;
  cycleDays: number;
  paymentDay: number;
  newPurchases: number;
}

const DEFAULTS: GraceInputs = {
  statementBalance: 2400,
  apr: 22.9,
  graceDays: 25,
  payment: 2400,
  cycleDays: 30,
  paymentDay: 25,
  newPurchases: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface GraceResult {
  dailyRate: number;
  paidInFull: boolean;
  interestFree: boolean;
  averageDailyBalance: number;
  daysCharged: number;
  interest: number;
  carriedInterest: number;
  monthlyInterestIfCarried: number;
  effectiveCostPct: number;
  remainingBalance: number;
  valid: boolean;
  errorMsg: string;
}

function computeGrace(i: GraceInputs): GraceResult {
  const invalid =
    i.statementBalance <= 0 || i.apr < 0 || i.graceDays < 0 || i.cycleDays <= 0 || i.payment < 0 || i.newPurchases < 0;

  const dailyRate = i.apr / 100 / 365;
  const paymentDay = Math.min(Math.max(i.paymentDay, 0), i.cycleDays);
  const paidInFull = i.payment >= i.statementBalance;
  // A purchase grace period only applies when the balance is cleared within it.
  const interestFree = paidInFull && paymentDay <= i.graceDays;

  const balanceAfterPayment = Math.max(0, i.statementBalance - i.payment) + i.newPurchases;
  const averageDailyBalance =
    (i.statementBalance * paymentDay + balanceAfterPayment * (i.cycleDays - paymentDay)) / i.cycleDays;
  const carriedInterest = averageDailyBalance * dailyRate * i.cycleDays;

  return {
    dailyRate,
    paidInFull,
    interestFree,
    averageDailyBalance,
    daysCharged: i.cycleDays,
    interest: interestFree ? 0 : carriedInterest,
    carriedInterest,
    monthlyInterestIfCarried: i.statementBalance * dailyRate * i.cycleDays,
    effectiveCostPct: i.statementBalance > 0 ? ((interestFree ? 0 : carriedInterest) / i.statementBalance) * 100 : 0,
    remainingBalance: paidInFull ? i.newPurchases : balanceAfterPayment,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive statement balance and cycle length, a non-negative APR, and non-negative payment/purchase figures."
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

export default function GracePeriodInterestCalculator() {
  const [statementBalance, setStatementBalance] = useState(String(DEFAULTS.statementBalance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [graceDays, setGraceDays] = useState(String(DEFAULTS.graceDays));
  const [payment, setPayment] = useState(String(DEFAULTS.payment));
  const [cycleDays, setCycleDays] = useState(String(DEFAULTS.cycleDays));
  const [paymentDay, setPaymentDay] = useState(String(DEFAULTS.paymentDay));
  const [newPurchases, setNewPurchases] = useState(String(DEFAULTS.newPurchases));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): GraceInputs => ({
    statementBalance: parseFloat(statementBalance) || 0,
    apr: parseFloat(apr) || 0,
    graceDays: parseFloat(graceDays) || 0,
    payment: parseFloat(payment) || 0,
    cycleDays: parseFloat(cycleDays) || 0,
    paymentDay: parseFloat(paymentDay) || 0,
    newPurchases: parseFloat(newPurchases) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<GraceInputs>(() => DEFAULTS);
  const [results, setResults] = useState<GraceResult>(() => computeGrace(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeGrace(inputs));
  };

  const reset = () => {
    setStatementBalance(String(DEFAULTS.statementBalance));
    setApr(String(DEFAULTS.apr));
    setGraceDays(String(DEFAULTS.graceDays));
    setPayment(String(DEFAULTS.payment));
    setCycleDays(String(DEFAULTS.cycleDays));
    setPaymentDay(String(DEFAULTS.paymentDay));
    setNewPurchases(String(DEFAULTS.newPurchases));
    setCalcInputs(DEFAULTS);
    setResults(computeGrace(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a credit card grace period?",
      answer:
        "The grace period is the window between the close of a billing cycle and the payment due date during which you can pay your statement balance in full and owe no interest on new purchases. Under the CARD Act it must be at least 21 days. The grace period only applies when you have no carried balance; once you pay less than the full statement balance, interest begins accruing and the grace period on new purchases is lost until you clear the balance again.",
    },
    {
      question: "How is credit card interest calculated?",
      answer:
        "Most issuers use the average daily balance method. They divide the APR by 365 to get a daily periodic rate, multiply each day's balance by that rate, and sum the daily charges across the cycle. Because the balance changes as payments post and purchases are added, the average daily balance is a weighted figure that reflects how long each balance was outstanding, not simply the closing balance.",
    },
    {
      question: "Why does paying in full matter so much?",
      answer:
        "Because it resets the interest clock to zero. A cardholder who pays the statement balance in full every month pays no interest on purchases at all, no matter how high the APR, and the grace period is preserved. A cardholder who carries even a small balance pays interest on the whole average daily balance and surrenders the grace period on new spending, so the cost compounds until the balance is cleared.",
    },
    {
      question: "When does the grace period clock start?",
      answer:
        "It starts on the first day of the billing cycle for new purchases. The clock runs until the payment due date, at which point the balance is due in full to avoid interest. If a balance is carried, new purchases typically begin accruing interest from the transaction date rather than the statement date, which is why the calculator reports a zero-interest result only when the balance is cleared inside the grace window.",
    },
    {
      question: "Does the daily periodic rate use 365 or 360 days?",
      answer:
        "Most major issuers divide by 365, and this calculator follows that convention. A minority use 360, which produces a slightly higher daily rate and therefore slightly more interest for the same balance. If your statement shows a daily periodic rate, enter the APR that matches it, or verify the exact divisor in your card agreement, since the difference is small but real over a long carried balance.",
    },
  ];

  const breakdownRows = [
    { label: "Daily Periodic Rate", value: `${fmt(results.dailyRate * 100, 5)}%`, note: "APR ÷ 365" },
    { label: "Average Daily Balance", value: `$${fmt(results.averageDailyBalance)}`, note: "Weighted across the cycle" },
    { label: "Days Charged", value: `${fmt(results.daysCharged, 0)} days`, note: "Full billing cycle" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Grace Period Interest Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Grace Period Interest Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Statement">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="statement-balance"
                  label="Statement Balance"
                  value={statementBalance}
                  onChange={setStatementBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance shown on the current statement."
                />
                <CompactInput
                  id="apr"
                  label="Purchase APR"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="Annual rate applied to purchases."
                />
              </div>
            </SubSection>

            <SubSection title="Payment & Grace">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="grace-days"
                  label="Grace Period"
                  value={graceDays}
                  onChange={setGraceDays}
                  onEnter={runCalculate}
                  suffix="days"
                  tooltip="Interest-free window between statement close and due date."
                />
                <CompactInput
                  id="payment"
                  label="Payment Made"
                  value={payment}
                  onChange={setPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Amount you plan to pay by the due date."
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
                  <SubSection title="Billing Cycle">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="cycle-days"
                        label="Cycle Length"
                        value={cycleDays}
                        onChange={setCycleDays}
                        onEnter={runCalculate}
                        suffix="days"
                        tooltip="Number of days in the billing cycle."
                      />
                      <CompactInput
                        id="payment-day"
                        label="Payment Day"
                        value={paymentDay}
                        onChange={setPaymentDay}
                        onEnter={runCalculate}
                        suffix="day"
                        tooltip="Day of the cycle on which the payment posts."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="New Activity">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="new-purchases"
                        label="New Purchases"
                        value={newPurchases}
                        onChange={setNewPurchases}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Purchases made after the payment posted."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          {results.interestFree ? "Interest-free" : "Interest accruing"}
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

            {results.valid && results.paidInFull && !results.interestFree && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-700 mb-1 uppercase tracking-wider">Payment after the grace window</div>
                <div className="text-sm font-medium text-foreground">
                  Your payment posts on day {fmt(calcInputs.paymentDay, 0)}, outside the {fmt(calcInputs.graceDays, 0)}-day
                  grace period, so interest accrues even though the balance is cleared.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Interest Accrued</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${fmt(results.interest)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.interestFree
                  ? "Paid in full inside the grace period — no interest"
                  : `On an average daily balance of $${fmt(results.averageDailyBalance)}`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.averageDailyBalance * results.dailyRate, 3)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">If Carried</span>
                <span className="font-extrabold text-foreground">${fmt(results.carriedInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost of Balance</span>
                <span className="font-extrabold text-foreground">{fmt(results.effectiveCostPct, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Interest Input</th>
                    <th className="p-2.5 text-right w-[130px]">Value</th>
                    <th className="p-2.5 pr-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.value}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Interest Charged</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.interest)}</td>
                    <td className="p-2.5 pr-3 text-foreground">Avg balance × DPR × days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Purchase APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.apr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Daily Periodic Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.dailyRate * 100, 5)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average Daily Balance</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.averageDailyBalance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Remaining Balance</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.remainingBalance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest (this cycle)</span>
                  <span className="text-base font-bold text-primary">${fmt(results.interest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Next Cycle (same balance)</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.monthlyInterestIfCarried)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Grace Period Interest Calculator?</h2>
            <p>
              A grace period interest calculator works out how much interest a revolving credit balance costs, and,
              just as importantly, whether it costs anything at all. Credit cards offer a grace period on purchases: a
              window, at least 21 days under federal law, between the statement closing date and the payment due date, in
              which you can pay the balance in full and owe no interest. The moment you carry even part of the balance
              forward, the grace period on new purchases is suspended and interest starts accruing until the balance is
              cleared again.
            </p>
            <p>
              Understanding this mechanic is the difference between using credit for free and paying a very high annual
              rate for it. The calculator applies the issuer-standard average daily balance method so you can see the
              precise cost of a partial payment, and the exact dollar amount that paying in full saves you.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator converts the purchase APR into a daily periodic rate by dividing it by 365. It then builds
              the average daily balance for the cycle: the statement balance applies until your payment posts on its
              chosen day, and the reduced balance applies for the remaining days, with any new purchases added after the
              payment. That weighted average is multiplied by the daily periodic rate and by the number of days in the
              cycle to give the interest charge.
            </p>
            <p>
              A grace-period rule is then applied. If the payment clears the statement balance and posts inside the grace
              window, the interest charge is zero, because the account never carried a balance. If the payment is partial,
              or posts after the grace period, interest is charged on the average daily balance using the full cycle. The
              calculator also reports what the same balance would cost every cycle if it were simply carried forward, which
              is the compounding trap that makes revolving debt expensive.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the interest accrued, and its subtext tells you plainly whether the account stayed
              inside the grace period. If the balance was cleared in time the figure is zero, which is the optimal result,
              and a warning panel appears if your payment lands after the grace window even though it clears the balance.
              The three statistics beside the headline give daily interest, the interest if the balance is carried, and the
              cost of the balance as a percentage of the statement.
            </p>
            <p>
              The breakdown table shows the daily periodic rate, the average daily balance and the days charged, which are
              the three inputs that determine the cost. Summary Statistics adds the remaining balance and, critically, the
              interest the same balance would generate next cycle if it were carried again. That last number is the one to
              watch: carried balances accrue interest on top of interest, so a small unpaid amount can grow faster than
              intuition suggests. Treat the output as an estimate, since issuers differ slightly in day-count convention
              and in how they treat new purchases before a payment posts.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/grace-period-interest-calculator" />
          <PopularCalculators exclude="/calculator/grace-period-interest-calculator" />
        </div>
      </div>
    </>
  );
}
