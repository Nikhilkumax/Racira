"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DebtRow {
  balance: number;
  apr: number;
  payment: number;
}

interface DebtInputs {
  debts: DebtRow[];
  extra: number;
}

const DEFAULTS: DebtInputs = {
  debts: [
    { balance: 12000, apr: 22.9, payment: 360 },
    { balance: 24000, apr: 6.5, payment: 480 },
    { balance: 8000, apr: 0, payment: 250 },
    { balance: 0, apr: 0, payment: 0 },
  ],
  extra: 0,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

const yearsMonths = (months: number) => {
  if (!Number.isFinite(months)) return "Never";
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

function simulateDebt(balance: number, apr: number, payment: number) {
  if (balance <= 0) return { months: 0, interest: 0 };
  if (payment <= 0) return { months: Infinity, interest: Infinity };
  const i = apr / 100 / 12;
  let bal = balance;
  let interest = 0;
  let m = 0;
  while (bal > 0.005 && m < 1200) {
    const charge = bal * i;
    if (payment <= charge) return { months: Infinity, interest: Infinity };
    m++;
    interest += charge;
    let pp = payment - charge;
    if (pp > bal) pp = bal;
    bal -= pp;
  }
  return { months: m, interest };
}

interface DebtResult {
  rows: { balance: number; apr: number; payment: number; months: number; interest: number; label: string }[];
  totalBalance: number;
  totalPayment: number;
  weightedApr: number;
  totalInterest: number;
  longestMonths: number;
  shortestMonths: number;
  availableMonths: number;
  nonAmortising: number;
  valid: boolean;
  errorMsg: string;
}

function compute(inputs: DebtInputs): DebtResult {
  const active = inputs.debts.filter((d) => d.balance > 0 && d.payment > 0);

  const highestAprIndex = inputs.debts.reduce(
    (best, d, idx) => (d.balance > 0 && d.apr > inputs.debts[best].apr ? idx : best),
    0,
  );

  const rows = inputs.debts.map((d, idx) => {
    const payment = d.payment + (idx === highestAprIndex && d.balance > 0 ? inputs.extra : 0);
    const sim = simulateDebt(d.balance, d.apr, payment);
    return {
      balance: d.balance,
      apr: d.apr,
      payment,
      months: sim.months,
      interest: sim.interest,
      label: `Debt ${idx + 1}`,
    };
  });

  const used = rows.filter((r) => r.balance > 0 && r.payment > 0);
  const totalBalance = used.reduce((a, r) => a + r.balance, 0);
  const basePayment = inputs.debts.reduce((a, d) => a + (d.balance > 0 ? d.payment : 0), 0);
  const totalPayment = basePayment + (used.length > 0 ? inputs.extra : 0);
  const weightedApr = totalBalance > 0 ? used.reduce((a, r) => a + r.apr * r.balance, 0) / totalBalance : 0;
  const finite = used.filter((r) => Number.isFinite(r.months));
  const totalInterest = finite.reduce((a, r) => a + r.interest, 0);

  const invalid = inputs.debts.some((d) => d.balance < 0 || d.apr < 0 || d.payment < 0) || inputs.extra < 0;

  return {
    rows,
    totalBalance,
    totalPayment,
    weightedApr,
    totalInterest,
    longestMonths: finite.length > 0 ? Math.max(...finite.map((r) => r.months)) : 0,
    shortestMonths: finite.length > 0 ? Math.min(...finite.map((r) => r.months)) : 0,
    availableMonths: active.length,
    nonAmortising: used.length - finite.length,
    valid: !invalid,
    errorMsg: invalid ? "Balances, rates and payments cannot be negative." : "",
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
    <label htmlFor={id} className="flex items-center text-[13px] font-semibold text-foreground mb-1" title={tooltip}>
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

export default function MonthlyDebtPaymentCalculator() {
  const [b1, setB1] = useState(String(DEFAULTS.debts[0].balance));
  const [r1, setR1] = useState(String(DEFAULTS.debts[0].apr));
  const [p1, setP1] = useState(String(DEFAULTS.debts[0].payment));
  const [b2, setB2] = useState(String(DEFAULTS.debts[1].balance));
  const [r2, setR2] = useState(String(DEFAULTS.debts[1].apr));
  const [p2, setP2] = useState(String(DEFAULTS.debts[1].payment));
  const [b3, setB3] = useState(String(DEFAULTS.debts[2].balance));
  const [r3, setR3] = useState(String(DEFAULTS.debts[2].apr));
  const [p3, setP3] = useState(String(DEFAULTS.debts[2].payment));
  const [b4, setB4] = useState(String(DEFAULTS.debts[3].balance));
  const [r4, setR4] = useState(String(DEFAULTS.debts[3].apr));
  const [p4, setP4] = useState(String(DEFAULTS.debts[3].payment));
  const [extra, setExtra] = useState(String(DEFAULTS.extra));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DebtInputs => ({
    debts: [
      { balance: parseFloat(b1) || 0, apr: parseFloat(r1) || 0, payment: parseFloat(p1) || 0 },
      { balance: parseFloat(b2) || 0, apr: parseFloat(r2) || 0, payment: parseFloat(p2) || 0 },
      { balance: parseFloat(b3) || 0, apr: parseFloat(r3) || 0, payment: parseFloat(p3) || 0 },
      { balance: parseFloat(b4) || 0, apr: parseFloat(r4) || 0, payment: parseFloat(p4) || 0 },
    ],
    extra: parseFloat(extra) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DebtInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DebtResult>(() => compute(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(compute(inputs));
  };

  const reset = () => {
    setB1(String(DEFAULTS.debts[0].balance));
    setR1(String(DEFAULTS.debts[0].apr));
    setP1(String(DEFAULTS.debts[0].payment));
    setB2(String(DEFAULTS.debts[1].balance));
    setR2(String(DEFAULTS.debts[1].apr));
    setP2(String(DEFAULTS.debts[1].payment));
    setB3(String(DEFAULTS.debts[2].balance));
    setR3(String(DEFAULTS.debts[2].apr));
    setP3(String(DEFAULTS.debts[2].payment));
    setB4(String(DEFAULTS.debts[3].balance));
    setR4(String(DEFAULTS.debts[3].apr));
    setP4(String(DEFAULTS.debts[3].payment));
    setExtra(String(DEFAULTS.extra));
    setCalcInputs(DEFAULTS);
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What counts as a monthly debt payment?",
      answer:
        "Lenders count recurring obligations with a fixed payment: mortgages and rent, car loans, student loans, personal loans, child support and the minimum due on every credit card. Living expenses such as groceries, utilities and insurance are excluded unless the lender treats them as a specific obligation, which is why a household can feel stretched while still passing a debt-to-income test.",
    },
    {
      question: "Why does my credit card balance never fall?",
      answer:
        "If the payment is smaller than the interest charged in that month, the balance grows rather than shrinks and the debt can never be repaid at that payment amount. The calculator flags this case, because the fix is structural: the payment must exceed the monthly interest before any progress is possible, and only the amount above it reduces principal.",
    },
    {
      question: "Should I pay off the highest rate or the smallest balance first?",
      answer:
        "Highest rate first always costs less and clears the debt sooner. Smallest balance first produces quicker wins, which helps people stay motivated. The difference in total interest is usually modest unless the rates are far apart, so the method that keeps you paying consistently tends to beat the theoretically optimal one.",
    },
    {
      question: "How much of my income should go to debt payments?",
      answer:
        "The common guideline is that all debt payments together, including housing, should stay below thirty-six percent of gross income, with forty-three percent typically being the ceiling for a qualified mortgage. Excluding housing, many advisers suggest total non-mortgage debt payments below fifteen to twenty percent of gross monthly income.",
    },
    {
      question: "Does consolidating debt lower the total payment?",
      answer:
        "Consolidation usually lowers the monthly payment by stretching the term, which also increases the total interest paid unless the new rate is substantially lower. It helps most when a high-rate revolving balance is replaced by a lower fixed rate over a comparable term. Because the payment falls, consolidation also frees cash flow that can be redirected to accelerate the payoff.",
    },
  ];

  const renderRow = (
    idx: number,
    b: string,
    r: string,
    p: string,
    setB: (v: string) => void,
    setR: (v: string) => void,
    setP: (v: string) => void,
  ) => (
    <div className="grid grid-cols-3 gap-2">
      <CompactInput id={`b${idx}`} label={`Debt ${idx} Balance`} value={b} onChange={setB} onEnter={runCalculate} prefix="$" min="0" />
      <CompactInput id={`r${idx}`} label="APR" value={r} onChange={setR} onEnter={runCalculate} suffix="%" min="0" step="0.25" />
      <CompactInput id={`p${idx}`} label="Payment" value={p} onChange={setP} onEnter={runCalculate} prefix="$" min="0" />
    </div>
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Monthly Debt Payment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Monthly Debt Payment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Your Debts">
              {renderRow(1, b1, r1, p1, setB1, setR1, setP1)}
              <div className="mt-3">{renderRow(2, b2, r2, p2, setB2, setR2, setP2)}</div>
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
                  <SubSection title="More Debts">
                    {renderRow(3, b3, r3, p3, setB3, setR3, setP3)}
                    <div className="mt-3">{renderRow(4, b4, r4, p4, setB4, setR4, setP4)}</div>
                  </SubSection>
                  <SubSection title="Extra Payment">
                    <CompactInput
                      id="extra"
                      label="Extra Monthly (highest rate first)"
                      value={extra}
                      onChange={setExtra}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Applied to the highest-rate balance to shorten the overall payoff."
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

            {results.nonAmortising > 0 && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Payment too low</div>
                <div className="text-base font-medium text-foreground">
                  {results.nonAmortising} debt{results.nonAmortising > 1 ? "s" : ""} will never be repaid at the entered
                  payment because it does not cover the monthly interest.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Monthly Debt Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.totalPayment)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                on {money(results.totalBalance)} of debt &middot; longest payoff {yearsMonths(results.longestMonths)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">{money(results.totalInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weighted APR</span>
                <span className="font-extrabold text-foreground">{fmt(results.weightedApr, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Debt-Free By</span>
                <span className="font-extrabold text-foreground">{payoffDate(results.longestMonths)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Debt</th>
                    <th className="p-2.5 text-right">Balance</th>
                    <th className="p-2.5 text-right">APR</th>
                    <th className="p-2.5 text-right">Payment</th>
                    <th className="p-2.5 text-right">Payoff</th>
                    <th className="p-2.5 pr-3 text-right">Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.balance)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.apr, 2)}%</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.payment)}</td>
                      <td className={`p-2.5 text-right ${Number.isFinite(row.months) ? "text-foreground" : "text-destructive"}`}>
                        {row.balance > 0 ? yearsMonths(row.months) : "—"}
                      </td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                        {Number.isFinite(row.interest) && row.balance > 0 ? money(row.interest) : "—"}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalBalance)}</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.weightedApr, 2)}%</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalPayment)}</td>
                    <td className="p-2.5 text-right text-foreground">{yearsMonths(results.longestMonths)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.totalInterest)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Debt Balance</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalBalance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Monthly Payment</span>
                  <span className="text-base font-bold text-primary">{money(results.totalPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weighted Average APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.weightedApr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Debt Cleared</span>
                  <span className="text-base font-bold text-foreground">{yearsMonths(results.shortestMonths)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Last Debt Cleared</span>
                  <span className="text-base font-bold text-foreground">{yearsMonths(results.longestMonths)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Active Debts</span>
                  <span className="text-base font-bold text-foreground">{results.availableMonths}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Applied</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.extra)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Monthly Debt Payment Calculator?</h2>
            <p>
              A monthly debt payment calculator totals what you send to creditors each month, then projects how long each
              balance will take to clear and what the debt will cost in interest along the way. It works on up to four
              debts at once, so credit cards, car loans, student loans and personal loans can be viewed as a single
              portfolio rather than as unrelated obligations.
            </p>
            <p>
              The value of combining them is that the aggregate figures drive real decisions. Lenders assess total monthly
              obligations against income, so the sum matters as much as any individual payment. And because each debt
              amortises at a different rate, the order in which payments are applied can change the total interest bill
              substantially even when the monthly outlay stays the same.
            </p>

            <h2 className="text-2xl font-bold mb-3">How Each Balance Is Projected</h2>
            <p>
              Every debt is amortised month by month. The interest charged in a month is the balance multiplied by the
              annual rate divided by twelve, and that charge is added to the accumulated interest. The remainder of the
              payment reduces principal. If the payment does not exceed the interest charge, the balance would grow
              indefinitely, and the calculator flags that case rather than reporting a payoff date that cannot exist.
            </p>
            <p>
              Any extra monthly payment is directed to the highest-rate balance first, which is the avalanche strategy.
              That single change shortens the longest payoff and lowers total interest without increasing the monthly
              outlay. Alongside the schedule the calculator computes the balance-weighted average APR, so a portfolio
              dominated by one expensive card reports a blended rate that reflects it.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the total monthly payment, the debt it services and the longest remaining payoff. The
              three statistics beside it report total interest, the weighted average APR and the month the last balance
              clears. The breakdown table lists each debt with its balance, rate, payment, time to clear and interest cost,
              with the totals row summarising the portfolio.
            </p>
            <p>
              Summary Statistics adds the first and last debt to clear, the number of active debts and the extra amount in
              use. Two patterns are worth acting on. Where the payment on a card is close to the interest charge, almost
              nothing goes to principal and the balance barely moves; raising that payment is the highest-value change
              available. Where one debt has a much longer payoff than the rest, the extra payment is best aimed at the
              highest rate rather than the smallest balance, unless a quick win is what keeps you consistent.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/monthly-debt-payment-calculator" />
          <PopularCalculators exclude="/calculator/monthly-debt-payment-calculator" />
        </div>
      </div>
    </>
  );
}
