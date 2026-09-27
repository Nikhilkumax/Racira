"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SnowballInputs {
  balance1: number;
  apr1: number;
  min1: number;
  balance2: number;
  apr2: number;
  min2: number;
  balance3: number;
  apr3: number;
  min3: number;
  extra: number;
}

const DEFAULTS: SnowballInputs = {
  balance1: 2100,
  apr1: 6.49,
  min1: 60,
  balance2: 9500,
  apr2: 24.99,
  min2: 190,
  balance3: 15600,
  apr3: 17.49,
  min3: 275,
  extra: 300,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const duration = (months: number) => {
  const m = Math.max(0, Math.round(months));
  if (m < 12) return `${m} mo`;
  return `${Math.floor(m / 12)} yr ${m % 12} mo`;
};

interface DebtRow {
  name: string;
  balance: number;
  apr: number;
  min: number;
}

interface DebtOutcome {
  name: string;
  balance: number;
  apr: number;
  min: number;
  interest: number;
  payoffMonth: number;
  order: number;
}

interface PayoffRun {
  months: number;
  totalInterest: number;
  outcomes: DebtOutcome[];
}

function simulate(debts: DebtRow[], extra: number, method: "avalanche" | "snowball"): PayoffRun {
  const balances = debts.map((d) => Math.max(0, d.balance));
  const interest = debts.map(() => 0);
  const payoffMonth = debts.map(() => 0);
  const minPaid = debts.map(() => false);

  const rank = debts.map((d, idx) => ({ idx, apr: d.apr, balance: d.balance }));
  rank.sort((a, b) => (method === "avalanche" ? b.apr - a.apr : a.balance - b.balance));
  const priority = rank.map((r) => r.idx);

  let month = 0;
  while (balances.some((b) => b > 0.005) && month < 1200) {
    month++;

    // Minimums released by debts already cleared become part of the extra pool.
    let released = 0;
    for (let idx = 0; idx < balances.length; idx++) {
      if (payoffMonth[idx] > 0) released += debts[idx].min;
    }
    let pool = Math.max(0, extra) + released;

    for (let idx = 0; idx < balances.length; idx++) {
      if (balances[idx] <= 0.005) continue;
      const charge = balances[idx] * (debts[idx].apr / 100 / 12);
      interest[idx] += charge;
      balances[idx] += charge;
    }

    for (let idx = 0; idx < balances.length; idx++) {
      if (balances[idx] <= 0.005) continue;
      const pay = Math.min(debts[idx].min, balances[idx]);
      balances[idx] -= pay;
      minPaid[idx] = true;
      if (balances[idx] <= 0.005) {
        balances[idx] = 0;
        if (payoffMonth[idx] === 0) payoffMonth[idx] = month;
      }
    }

    for (const idx of priority) {
      if (pool <= 0.005) break;
      if (balances[idx] <= 0.005) continue;
      const pay = Math.min(pool, balances[idx]);
      balances[idx] -= pay;
      pool -= pay;
      if (balances[idx] <= 0.005) {
        balances[idx] = 0;
        if (payoffMonth[idx] === 0) payoffMonth[idx] = month;
      }
    }
  }

  const outcomes: DebtOutcome[] = debts.map((d, idx) => ({
    name: d.name,
    balance: d.balance,
    apr: d.apr,
    min: d.min,
    interest: interest[idx],
    payoffMonth: payoffMonth[idx] || month,
    order: priority.indexOf(idx) + 1,
  }));

  return {
    months: month,
    totalInterest: interest.reduce((s, v) => s + v, 0),
    outcomes,
  };
}

interface SnowballResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  baselineMonths: number;
  baselineInterest: number;
  interestSaved: number;
  monthsSaved: number;
  avalancheMonths: number;
  avalancheInterest: number;
  snowballCost: number;
  monthlyMinimums: number;
  monthlyOutlay: number;
  outcomes: DebtOutcome[];
  orderLabel: string;
  firstFreeMonth: number;
  valid: boolean;
  errorMsg: string;
}

function computeSnowball(i: SnowballInputs): SnowballResult {
  const debts: DebtRow[] = [
    { name: "Debt 1", balance: Math.max(0, i.balance1), apr: Math.max(0, i.apr1), min: Math.max(0, i.min1) },
    { name: "Debt 2", balance: Math.max(0, i.balance2), apr: Math.max(0, i.apr2), min: Math.max(0, i.min2) },
    { name: "Debt 3", balance: Math.max(0, i.balance3), apr: Math.max(0, i.apr3), min: Math.max(0, i.min3) },
  ].filter((d) => d.balance > 0 && d.min > 0);

  const active = debts.length > 0 ? debts : [{ name: "Debt 1", balance: 0, apr: 0, min: 0 }];
  const run = simulate(active, Math.max(0, i.extra), "snowball");
  const baseline = simulate(active, 0, "snowball");
  const avalanche = simulate(active, Math.max(0, i.extra), "avalanche");

  const monthlyMinimums = active.reduce((s, d) => s + d.min, 0);
  const totalPrincipal = active.reduce((s, d) => s + d.balance, 0);
  const summary = run.outcomes
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((o) => `${o.name} (${fmt(o.apr, 2)}%)`)
    .join(" → ");

  const invalid =
    active[0].balance <= 0 ||
    i.extra < 0 ||
    i.balance1 < 0 ||
    i.balance2 < 0 ||
    i.balance3 < 0 ||
    active.some((d) => d.apr < 0);
  const errorMsg = invalid
    ? "Enter at least one balance with a minimum payment, plus non-negative rates and extra payment."
    : "";

  return {
    months: run.months,
    totalInterest: run.totalInterest,
    totalPaid: totalPrincipal + run.totalInterest,
    baselineMonths: baseline.months,
    baselineInterest: baseline.totalInterest,
    interestSaved: Math.max(0, baseline.totalInterest - run.totalInterest),
    monthsSaved: Math.max(0, baseline.months - run.months),
    avalancheMonths: avalanche.months,
    avalancheInterest: avalanche.totalInterest,
    snowballCost: run.totalInterest - avalanche.totalInterest,
    monthlyMinimums,
    monthlyOutlay: monthlyMinimums + Math.max(0, i.extra),
    outcomes: run.outcomes.slice().sort((a, b) => a.order - b.order),
    orderLabel: summary,
    firstFreeMonth: run.outcomes.length > 0 ? Math.min(...run.outcomes.map((o) => o.payoffMonth)) : 0,
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

export default function DebtPayoffSnowballCalculator() {
  const [balance1, setBalance1] = useState(String(DEFAULTS.balance1));
  const [apr1, setApr1] = useState(String(DEFAULTS.apr1));
  const [min1, setMin1] = useState(String(DEFAULTS.min1));
  const [balance2, setBalance2] = useState(String(DEFAULTS.balance2));
  const [apr2, setApr2] = useState(String(DEFAULTS.apr2));
  const [min2, setMin2] = useState(String(DEFAULTS.min2));
  const [balance3, setBalance3] = useState(String(DEFAULTS.balance3));
  const [apr3, setApr3] = useState(String(DEFAULTS.apr3));
  const [min3, setMin3] = useState(String(DEFAULTS.min3));
  const [extra, setExtra] = useState(String(DEFAULTS.extra));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SnowballInputs => ({
    balance1: parseFloat(balance1) || 0,
    apr1: parseFloat(apr1) || 0,
    min1: parseFloat(min1) || 0,
    balance2: parseFloat(balance2) || 0,
    apr2: parseFloat(apr2) || 0,
    min2: parseFloat(min2) || 0,
    balance3: parseFloat(balance3) || 0,
    apr3: parseFloat(apr3) || 0,
    min3: parseFloat(min3) || 0,
    extra: parseFloat(extra) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<SnowballInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SnowballResult>(() => computeSnowball(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSnowball(inputs));
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
    setExtra(String(DEFAULTS.extra));
    setCalcInputs(DEFAULTS);
    setResults(computeSnowball(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the debt snowball method?",
      answer:
        "The snowball method lists your debts from the smallest balance to the largest and sends every spare dollar to the smallest one while you keep paying the minimums on everything else. When the smallest debt clears, its minimum joins the extra payment and the whole pool moves to the next balance up the list, so each cleared account makes the next one fall faster.",
    },
    {
      question: "Is the snowball better than the avalanche?",
      answer:
        "The avalanche usually costs the same or less in interest because it retires the most expensive money first. The snowball deliberately pays that small extra cost in exchange for clearing an account sooner, which many people find easier to sustain. This calculator reports the difference directly, so the price of the quicker first win is never hidden.",
    },
    {
      question: "How much extra do I need to make a difference?",
      answer:
        "Any recurring extra helps, and the effect is not linear: the amount you already pay in minimums is released as each debt clears, so the pool compounds without you adding anything further. In the snowball the compounding is even more visible, because the smallest balance disappears first and every remaining account then receives a larger payment.",
    },
    {
      question: "Why does the calculator need minimum payments?",
      answer:
        "Minimums are the floor of the plan. They keep every account current while the extra is concentrated on one target, and when an account is paid off its minimum is redirected rather than spent. Lowering a minimum lengthens the schedule for every remaining debt.",
    },
    {
      question: "Should I keep an emergency fund before paying extra?",
      answer:
        "A small cash buffer prevents a new balance going back on a card because of an unexpected bill, which would undo the progress. Once a modest reserve exists, the surplus can go to the smallest debt, and the momentum of clearing accounts is what keeps most people paying extra. Compare your card rate with what a savings account pays before deciding.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Payoff Snowball Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Payoff Snowball Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Debt 1 (Smallest Balance)">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance1"
                  label="Balance"
                  value={balance1}
                  onChange={setBalance1}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Outstanding balance on the first debt."
                />
                <CompactInput
                  id="apr1"
                  label="Rate"
                  value={apr1}
                  onChange={setApr1}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.01"
                  tooltip="Annual rate on the first debt."
                />
                <CompactInput
                  id="min1"
                  label="Minimum"
                  value={min1}
                  onChange={setMin1}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Required monthly payment on the first debt."
                />
              </div>
            </SubSection>

            <SubSection title="Monthly Plan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="extra"
                  label="Extra Payment"
                  value={extra}
                  onChange={setExtra}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Additional money sent to the smallest-balance debt each month."
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
                  <SubSection title="Debt 2">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="balance2"
                        label="Balance"
                        value={balance2}
                        onChange={setBalance2}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Balance on the second debt. Leave at zero to ignore it."
                      />
                      <CompactInput
                        id="apr2"
                        label="Rate"
                        value={apr2}
                        onChange={setApr2}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.01"
                        tooltip="Annual rate on the second debt."
                      />
                      <CompactInput
                        id="min2"
                        label="Minimum"
                        value={min2}
                        onChange={setMin2}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Required monthly payment on the second debt."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Debt 3">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="balance3"
                        label="Balance"
                        value={balance3}
                        onChange={setBalance3}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Balance on the third debt. Leave at zero to ignore it."
                      />
                      <CompactInput
                        id="apr3"
                        label="Rate"
                        value={apr3}
                        onChange={setApr3}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.01"
                        tooltip="Annual rate on the third debt."
                      />
                      <CompactInput
                        id="min3"
                        label="Minimum"
                        value={min3}
                        onChange={setMin3}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Required monthly payment on the third debt."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt-Free In</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {duration(results.months)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalInterest)} of interest &middot; {results.orderLabel}
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Saved vs Minimums</span>
                <span className="font-extrabold text-emerald-600">{money(results.interestSaved)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost vs Avalanche</span>
                <span className={`font-extrabold ${results.snowballCost > 0.5 ? "text-destructive" : "text-emerald-600"}`}>
                  {money(results.snowballCost)}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Order</th>
                    <th className="p-2.5 text-right w-[100px]">Balance</th>
                    <th className="p-2.5 text-right w-[90px]">Rate</th>
                    <th className="p-2.5 text-right w-[100px]">Min</th>
                    <th className="p-2.5 text-right w-[105px]">Cleared</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.outcomes.map((row) => (
                    <tr key={row.name} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.order}. {row.name}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{money(row.balance)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.apr, 2)}%</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.min)}</td>
                      <td className="p-2.5 text-right text-foreground">Mo {row.payoffMonth}</td>
                      <td className="p-2.5 pr-3 text-right text-destructive">{money(row.interest)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">
                      {money(results.outcomes.reduce((s, o) => s + o.balance, 0))}
                    </td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.monthlyMinimums)}</td>
                    <td className="p-2.5 text-right text-foreground">{duration(results.months)}</td>
                    <td className="p-2.5 pr-3 text-right text-destructive">{money(results.totalInterest)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Debt</span>
                  <span className="text-base font-bold text-foreground">
                    {money(results.outcomes.reduce((s, o) => s + o.balance, 0))}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Minimums</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyMinimums)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Payment</span>
                  <span className="text-base font-bold text-primary">{money(calcInputs.extra)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Outlay</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyOutlay)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Debt Cleared</span>
                  <span className="text-base font-bold text-foreground">Month {results.firstFreeMonth}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt-Free In</span>
                  <span className="text-base font-bold text-foreground">{duration(results.months)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Minimums Only</span>
                  <span className="text-base font-bold text-foreground">{duration(results.baselineMonths)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Time Saved</span>
                  <span className="text-base font-bold text-emerald-600">{duration(results.monthsSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest, Minimums Only</span>
                  <span className="text-base font-bold text-foreground">{money(results.baselineInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.interestSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Avalanche Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.avalancheInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Avalanche Debt-Free In</span>
                  <span className="text-base font-bold text-foreground">{duration(results.avalancheMonths)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Snowball Premium</span>
                  <span className={`text-base font-bold ${results.snowballCost > 0.5 ? "text-destructive" : "text-emerald-600"}`}>
                    {money(results.snowballCost)}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Priority Order</span>
                  <span className="text-base font-bold text-primary">{results.orderLabel}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalPaid)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Payoff Snowball Calculator?</h2>
            <p>
              A debt payoff snowball calculator builds the repayment plan that clears your smallest balance first and rolls
              every freed-up payment onto the next debt in the list. You enter the balance, annual rate and minimum payment
              for each account, plus whatever extra you can commit each month. The tool orders the debts by size, shows the
              month each one clears, and reports the interest the whole plan costs compared with the alternative orderings.
            </p>
            <p>
              The snowball is the motivational branch of debt reduction. It is not designed to minimise the interest bill; it
              is designed to produce a cleared account quickly, on the theory that an early win is what keeps a repayment plan
              alive. The avalanche, by contrast, attacks the highest rate first and is the cheaper of the two on paper. This
              calculator shows both timelines and both interest totals side by side, so the cost of the ordering you choose is
              always visible rather than assumed.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator runs a month-by-month simulation of your plan. At the start of each month interest is charged on
              every open balance at the annual rate divided by twelve, and each minimum payment is applied. Whatever is left
              of your budget, your chosen extra plus the minimums released by accounts that have already been cleared, is then
              sent to the smallest remaining balance until the pool is used up. Balances are stored to the cent, so a month in
              which a card is overpaid by a few dollars pushes that surplus into the next account rather than disappearing.
            </p>
            <p>
              Two comparisons run alongside the main plan. The first repeats the simulation with no extra payment at all, which
              shows the minimum-only baseline and the interest that arrangement would cost. The second repeats it using the
              avalanche ordering, highest rate first, with the same extra payment and the same monthly outlay. Because the
              total monthly cash is identical in both, the difference in the two totals is purely the price, or the benefit,
              of the sequence itself.
            </p>
            <p>
              The interest accumulation is the standard revolving-credit convention: the periodic rate is the annual rate
              divided by twelve, interest is charged on the balance outstanding before the payment, and cleared accounts stop
              accruing from the following month. Minimum payments are treated as floors, never as targets, and an account whose
              minimum is larger than its remaining balance only pays what is owed, releasing the surplus into the pool.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports how long until you are debt-free, with the total interest and the priority order the
              tool selected underneath. The three statistics beside it give total interest, the interest saved against paying
              minimums only, and the cost of the snowball relative to the avalanche. The breakdown table lists every debt in
              attack order with its balance, rate, minimum, the month it clears and the interest it consumed.
            </p>
            <p>
              Summary Statistics collects the total debt, monthly minimums, the extra payment and the full monthly outlay, the
              month the first account clears, the snowball and avalanche horizons, the time and interest saved against
              minimums, the avalanche interest total and the snowball premium, plus the priority order and the total repaid.
              A large premium means the ordering is genuinely expensive and the avalanche is worth considering; a premium of
              a few dollars means the quicker first win is close to free, which is usually the case when your smallest balance
              also carries a fairly high rate.
            </p>

            <p className="text-sm text-muted-foreground italic mt-4">
              Interest accumulation uses the standard United States revolving-credit convention of a monthly periodic rate
              (annual rate divided by twelve) charged on the pre-payment balance. Local rules differ: the United Kingdom and
              the European Union compute some consumer interest daily, and a handful of United States issuers use average
              daily balance rather than statement balance, which produces slightly different totals. Minimum payments are
              entered by hand because issuers calculate them on their own policies, commonly one percent of principal plus
              interest or a fixed floor such as twenty-five dollars.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-payoff-snowball-calculator" />
          <PopularCalculators exclude="/calculator/debt-payoff-snowball-calculator" />
        </div>
      </div>
    </>
  );
}
