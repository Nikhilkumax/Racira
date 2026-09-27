"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ComparisonInputs {
  balance1: number;
  apr1: number;
  min1: number;
  balance2: number;
  apr2: number;
  min2: number;
  balance3: number;
  apr3: number;
  min3: number;
  extraMonthly: number;
}

const DEFAULTS: ComparisonInputs = {
  balance1: 4800,
  apr1: 24.99,
  min1: 95,
  balance2: 1200,
  apr2: 18.99,
  min2: 35,
  balance3: 9500,
  apr3: 6.5,
  min3: 150,
  extraMonthly: 200,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface DebtRow {
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

interface OrderStep {
  name: string;
  month: number;
}

interface SimOutcome {
  months: number;
  interest: number;
  order: OrderStep[];
  stalled: boolean;
}

function simulatePlan(debts: DebtRow[], order: number[], extra: number): SimOutcome {
  const rows = debts.map((d) => ({ ...d, bal: d.balance, r: d.apr / 100 / 12, cleared: false }));
  const pool = debts.reduce((s, d) => s + Math.max(0, d.minPayment), 0) + Math.max(0, extra);
  const orderSteps: OrderStep[] = [];
  let months = 0;
  let interest = 0;
  let stalled = false;

  while (months < 1200 && rows.some((d) => d.bal > 0.005)) {
    months += 1;
    for (const d of rows) {
      if (d.bal > 0.005) {
        const i = d.bal * d.r;
        d.bal += i;
        interest += i;
      }
    }
    let avail = pool;
    for (const d of rows) {
      if (d.bal > 0.005) {
        const p = Math.min(Math.max(0, d.minPayment), d.bal, avail);
        d.bal -= p;
        avail -= p;
      }
    }
    for (const idx of order) {
      if (avail <= 0.005) break;
      const d = rows[idx];
      if (d.bal > 0.005) {
        const p = Math.min(avail, d.bal);
        d.bal -= p;
        avail -= p;
      }
    }
    for (const idx of order) {
      const d = rows[idx];
      if (!d.cleared && d.bal <= 0.005) {
        d.cleared = true;
        orderSteps.push({ name: d.name, month: months });
      }
    }
    if (avail > 0.005) stalled = true;
  }

  return { months, interest, order: orderSteps, stalled };
}

interface ComparisonResult {
  snowballMonths: number;
  avalancheMonths: number;
  snowballInterest: number;
  avalancheInterest: number;
  interestDiff: number;
  monthsDiff: number;
  snowballOrder: OrderStep[];
  avalancheOrder: OrderStep[];
  avalancheWins: boolean;
  totalMinimums: number;
  monthlyPool: number;
  stalled: boolean;
  rows: DebtRow[];
  valid: boolean;
  errorMsg: string;
}

function computeComparison(i: ComparisonInputs): ComparisonResult {
  const rows: DebtRow[] = [
    { name: "Debt 1", balance: i.balance1, apr: i.apr1, minPayment: i.min1 },
    { name: "Debt 2", balance: i.balance2, apr: i.apr2, minPayment: i.min2 },
    { name: "Debt 3", balance: i.balance3, apr: i.apr3, minPayment: i.min3 },
  ];
  const invalid =
    rows.some((r) => r.balance < 0 || r.apr < 0 || r.minPayment < 0) ||
    rows.reduce((s, r) => s + r.balance, 0) <= 0 ||
    rows.reduce((s, r) => s + r.minPayment, 0) <= 0 ||
    i.extraMonthly < 0;

  const snowballOrder = [0, 1, 2]
    .filter((idx) => rows[idx].balance > 0.005)
    .sort((a, b) => rows[a].balance - rows[b].balance);
  const avalancheOrder = [0, 1, 2]
    .filter((idx) => rows[idx].balance > 0.005)
    .sort((a, b) => rows[b].apr - rows[a].apr);

  const snowball = simulatePlan(rows, snowballOrder, i.extraMonthly);
  const avalanche = simulatePlan(rows, avalancheOrder, i.extraMonthly);

  return {
    snowballMonths: snowball.months,
    avalancheMonths: avalanche.months,
    snowballInterest: snowball.interest,
    avalancheInterest: avalanche.interest,
    interestDiff: Math.max(0, snowball.interest - avalanche.interest),
    monthsDiff: Math.max(0, snowball.months - avalanche.months),
    snowballOrder: snowball.order,
    avalancheOrder: avalanche.order,
    avalancheWins: avalanche.interest <= snowball.interest,
    totalMinimums: rows.reduce((s, r) => s + Math.max(0, r.minPayment), 0),
    monthlyPool: rows.reduce((s, r) => s + Math.max(0, r.minPayment), 0) + Math.max(0, i.extraMonthly),
    stalled: snowball.stalled || avalanche.stalled,
    rows,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative balances, rates and minimums, at least one balance above zero, and a non-negative extra payment."
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

export default function DebtPayoffComparisonCalculator() {
  const [balance1, setBalance1] = useState(String(DEFAULTS.balance1));
  const [apr1, setApr1] = useState(String(DEFAULTS.apr1));
  const [min1, setMin1] = useState(String(DEFAULTS.min1));
  const [balance2, setBalance2] = useState(String(DEFAULTS.balance2));
  const [apr2, setApr2] = useState(String(DEFAULTS.apr2));
  const [min2, setMin2] = useState(String(DEFAULTS.min2));
  const [balance3, setBalance3] = useState(String(DEFAULTS.balance3));
  const [apr3, setApr3] = useState(String(DEFAULTS.apr3));
  const [min3, setMin3] = useState(String(DEFAULTS.min3));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ComparisonInputs => ({
    balance1: parseFloat(balance1) || 0,
    apr1: parseFloat(apr1) || 0,
    min1: parseFloat(min1) || 0,
    balance2: parseFloat(balance2) || 0,
    apr2: parseFloat(apr2) || 0,
    min2: parseFloat(min2) || 0,
    balance3: parseFloat(balance3) || 0,
    apr3: parseFloat(apr3) || 0,
    min3: parseFloat(min3) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ComparisonInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ComparisonResult>(() => computeComparison(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeComparison(inputs));
  };

  const reset = () => {
    setBalance1(String(DEFAULTS.balance1));
    setApr1(String(DEFAULTS.apr1));
    setMin1(String(DEFAULTS.min1));
    setBalance2(String(DEFAULTS.balance2));
    setApr2(String(DEFAULTS.apr2));
    setMin2(String(DEFAULTS.min2));
    setBalance3(String(DEFAULTS.balance3));
    setApr3(String(DEFAULTS.apr3));
    setMin3(String(DEFAULTS.min3));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setCalcInputs(DEFAULTS);
    setResults(computeComparison(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between the snowball and avalanche methods?",
      answer:
        "Both make the same total payment each month and direct every spare dollar to one target balance. The snowball targets the smallest balance first, clearing it quickly and freeing its minimum payment for the next target. The avalanche targets the highest interest rate first, so the most expensive money is retired soonest. The snowball tends to win on motivation, the avalanche on arithmetic.",
    },
    {
      question: "Which method saves more money?",
      answer:
        "The avalanche, in almost every realistic case, because interest is charged on the balance outstanding and the highest rate costs the most per dollar. The snowball can only beat it when a smaller balance also carries a higher rate, or when a very small balance can be cleared in one month so its payment is freed almost immediately. The calculator shows the exact gap rather than leaving it to theory.",
    },
    {
      question: "Does the method choice matter as much as the amount paid?",
      answer:
        "No. The size of the payment is a far more powerful lever than the order in which balances are attacked. Doubling an extra payment changes the timeline dramatically; switching from snowball to avalanche usually changes total interest by a modest percentage. Pick the order that keeps you paying consistently, and put your energy into raising the amount.",
    },
    {
      question: "Should I keep the same total payment as balances are cleared?",
      answer:
        "Yes, and this calculator assumes it. Your monthly pool stays fixed at the sum of the original minimums plus the extra payment, so when one balance clears its minimum rolls onto the next target automatically. Reducing the total after each payoff — the classic mistake — removes most of the compounding benefit of the method.",
    },
  ];


  const monthFor = (steps: OrderStep[], name: string) => {
    const hit = steps.find((o) => o.name === name);
    return hit ? hit.month : 0;
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Payoff Comparison Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Payoff Comparison Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Debt 1">
              <div className="grid grid-cols-3 gap-2">
                <CompactInput
                  id="balance-1"
                  label="Balance"
                  value={balance1}
                  onChange={setBalance1}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                />
                <CompactInput
                  id="apr-1"
                  label="Rate"
                  value={apr1}
                  onChange={setApr1}
                  onEnter={runCalculate}
                  suffix="%"
                />
                <CompactInput
                  id="min-1"
                  label="Minimum"
                  value={min1}
                  onChange={setMin1}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                />
              </div>
            </SubSection>

            <SubSection title="Debt 2">
              <div className="grid grid-cols-3 gap-2">
                <CompactInput
                  id="balance-2"
                  label="Balance"
                  value={balance2}
                  onChange={setBalance2}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                />
                <CompactInput
                  id="apr-2"
                  label="Rate"
                  value={apr2}
                  onChange={setApr2}
                  onEnter={runCalculate}
                  suffix="%"
                />
                <CompactInput
                  id="min-2"
                  label="Minimum"
                  value={min2}
                  onChange={setMin2}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                />
              </div>
            </SubSection>

            <SubSection title="Debt 3">
              <div className="grid grid-cols-3 gap-2">
                <CompactInput
                  id="balance-3"
                  label="Balance"
                  value={balance3}
                  onChange={setBalance3}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                />
                <CompactInput
                  id="apr-3"
                  label="Rate"
                  value={apr3}
                  onChange={setApr3}
                  onEnter={runCalculate}
                  suffix="%"
                />
                <CompactInput
                  id="min-3"
                  label="Minimum"
                  value={min3}
                  onChange={setMin3}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
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
                  <SubSection title="Extra Payment">
                    <CompactInput
                      id="extra-monthly"
                      label="Extra Each Month"
                      value={extraMonthly}
                      onChange={setExtraMonthly}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Additional money above the minimums, sent to the target balance."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Interest Difference
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.interestDiff, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.interestDiff <= 0.005
                  ? "Both payoff orders cost the same in interest"
                  : results.avalancheWins
                  ? `The avalanche method saves this much interest versus the snowball order`
                  : `The snowball method saves this much interest versus the avalanche order`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Snowball Months</span>
                <span className="font-extrabold text-foreground">{fmt(results.snowballMonths, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Avalanche Months</span>
                <span className="font-extrabold text-foreground">{fmt(results.avalancheMonths, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Pool</span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyPool, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Debt</th>
                    <th className="p-2.5 text-right w-[100px]">Balance</th>
                    <th className="p-2.5 text-right w-[80px]">Rate</th>
                    <th className="p-2.5 text-right w-[120px]">Snowball Cleared</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Avalanche Cleared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.name} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.name}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(row.balance, 0)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.apr, 2)}%</td>
                      <td className="p-2.5 text-right text-foreground">
                        {row.balance > 0.005 ? `Month ${fmt(monthFor(results.snowballOrder, row.name), 0)}` : "—"}
                      </td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {row.balance > 0.005 ? `Month ${fmt(monthFor(results.avalancheOrder, row.name), 0)}` : "—"}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total interest paid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.rows.reduce((s, r) => s + r.balance, 0), 0)}</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.snowballInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.avalancheInterest, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Minimums</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalMinimums, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Per Month</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.extraMonthly, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Snowball Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.snowballInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Avalanche Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.avalancheInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Difference</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.monthsDiff, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Recommended Order</span>
                  <span className={`text-base font-bold ${results.avalancheWins ? "text-emerald-600" : "text-amber-600"}`}>
                    {results.avalancheWins ? "Avalanche (highest rate)" : "Snowball (smallest)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Payoff Comparison Calculator?</h2>
            <p>
              A debt payoff comparison calculator runs the two standard repayment strategies against the same set of
              balances and shows which one costs less. The snowball method clears the smallest balance first for momentum;
              the avalanche method clears the highest-rate balance first for arithmetic. Both make the same total payment
              each month and roll every freed minimum onto the next target, so the only difference is the order.
            </p>
            <p>
              Modeling both at once removes the guesswork. Instead of arguing about discipline versus optimization, you
              can see the actual dollar gap between the two orders on your own balances — and how many months, if any,
              separate their finish dates.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each month every balance is charged interest at its own rate. The calculator pays all required minimums
              from a fixed pool equal to the sum of those minimums plus your extra amount, then sends whatever remains to
              the current target. When a balance reaches zero, its minimum stays in the pool, which is what creates the
              snowball effect — the payment that cleared one debt immediately attacks the next.
            </p>
            <p>
              The first pass targets balances in ascending order by balance; the second targets them in descending order
              by rate. Total interest and payoff month are recorded for each. Because the ordering only changes which
              balance absorbs the surplus, the difference between the two results is a clean measure of what the strategy
              choice is worth on your specific debts.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the interest difference between the two methods along with which order wins. The
              three-stat bar compares payoff months and shows the monthly pool being deployed, while the table lists each
              debt with its balance, rate and the month it clears under each strategy.
            </p>
            <p>
              Read the difference in context. If the avalanche saves a meaningful amount, that is real money — but the
              snowball often wins on behavior, because clearing a balance early produces a visible win that keeps people
              paying. A modest interest gap is frequently worth accepting for a plan you will actually finish.
            </p>
            <p>
              Notice too that changing the extra payment moves both timelines far more than changing the order ever
              does. Raise the monthly pool and the gap narrows while both finish much sooner. The most effective move is
              therefore to increase what you pay, then choose the order that keeps the habit alive — and to keep the
              total payment constant as individual balances disappear.
            </p>
            <p>
              One subtlety is worth watching in the table: a balance with a low rate but a high minimum payment can
              clear surprisingly early under either method, simply because so much of the pool is already going to it.
              Small balances behave the same way, which is why the snowball can occasionally beat the avalanche when the
              cheapest debt is also the largest. If the two orders produce nearly identical months in your result, the
              choice is genuinely a behavioral one, and the plan you will keep paying consistently each month is the
              better plan for your household.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-payoff-comparison-calculator" />
          <PopularCalculators exclude="/calculator/debt-payoff-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
