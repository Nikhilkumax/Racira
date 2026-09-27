"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AvalancheInputs {
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

const DEFAULTS: AvalancheInputs = {
  balance1: 5000,
  apr1: 27.99,
  min1: 150,
  balance2: 12000,
  apr2: 18.49,
  min2: 200,
  balance3: 8000,
  apr3: 6.49,
  min3: 250,
  extra: 300,
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

interface AvalancheResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  baselineMonths: number;
  baselineInterest: number;
  interestSaved: number;
  monthsSaved: number;
  snowballMonths: number;
  snowballInterest: number;
  avalancheAdvantage: number;
  monthlyMinimums: number;
  monthlyOutlay: number;
  outcomes: DebtOutcome[];
  orderLabel: string;
  firstFreeMonth: number;
  valid: boolean;
  errorMsg: string;
}

function computeAvalanche(i: AvalancheInputs): AvalancheResult {
  const debts: DebtRow[] = [
    { name: "Debt 1", balance: Math.max(0, i.balance1), apr: Math.max(0, i.apr1), min: Math.max(0, i.min1) },
    { name: "Debt 2", balance: Math.max(0, i.balance2), apr: Math.max(0, i.apr2), min: Math.max(0, i.min2) },
    { name: "Debt 3", balance: Math.max(0, i.balance3), apr: Math.max(0, i.apr3), min: Math.max(0, i.min3) },
  ].filter((d) => d.balance > 0 && d.min > 0);

  const active = debts.length > 0 ? debts : [{ name: "Debt 1", balance: 0, apr: 0, min: 0 }];
  const run = simulate(active, Math.max(0, i.extra), "avalanche");
  const baseline = simulate(active, 0, "avalanche");
  const snowball = simulate(active, Math.max(0, i.extra), "snowball");

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
    snowballMonths: snowball.months,
    snowballInterest: snowball.totalInterest,
    avalancheAdvantage: snowball.totalInterest - run.totalInterest,
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

export default function DebtPayoffAvalancheCalculator() {
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

  const getInputs = (): AvalancheInputs => ({
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

  const [calcInputs, setCalcInputs] = useState<AvalancheInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AvalancheResult>(() => computeAvalanche(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAvalanche(inputs));
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
    setResults(computeAvalanche(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the debt avalanche method?",
      answer:
        "The avalanche method lists your debts from the highest interest rate to the lowest and sends every spare dollar to the top of that list while you keep paying the minimums on everything else. When the first debt clears, its minimum joins the extra payment and the whole pool moves to the next rate down the list.",
    },
    {
      question: "Is the avalanche better than the snowball?",
      answer:
        "Mathematically the avalanche always costs the same or less in interest, because it retires the most expensive money first. The snowball pays the smallest balance first instead, which produces quicker wins and better motivation. The difference here is reported directly so you can see what the faster psychological wins actually cost.",
    },
    {
      question: "How much extra do I need to make a difference?",
      answer:
        "Any recurring extra helps, and the effect is not linear: the amount you already pay in minimums is released as each debt clears, so the pool compounds without you adding anything further. Even a small extra payment made consistently shortens the schedule appreciably because it attacks the balance that charges the most interest.",
    },
    {
      question: "Why does the calculator need minimum payments?",
      answer:
        "Minimums are the floor of the plan. They keep every account current while the extra is concentrated on one target, and when an account is paid off its minimum is redirected rather than spent. Lowering a minimum lengthens the schedule for every remaining debt.",
    },
    {
      question: "Should I keep an emergency fund before paying extra?",
      answer:
        "A small cash buffer prevents a new balance going back on a card because of an unexpected bill, which would undo the progress. Once a modest reserve exists, directing the surplus at the highest rate is the cheaper use of the money. Compare your card rate with what a savings account pays before deciding.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Payoff Avalanche Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Payoff Avalanche Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Debt 1 (Highest Rate)">
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
                  tooltip="Additional money sent to the highest-rate debt each month."
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">vs Snowball</span>
                <span className={`font-extrabold ${results.avalancheAdvantage > 0 ? "text-emerald-600" : "text-foreground"}`}>
                  {results.avalancheAdvantage > 0 ? "−" + money(results.avalancheAdvantage).slice(1) : money(0)}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Snowball Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.snowballInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Avalanche Advantage</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.avalancheAdvantage)}</span>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Payoff Avalanche Calculator?</h2>
            <p>
              A debt payoff avalanche calculator builds the repayment plan that clears the most expensive borrowing first.
              You enter the balance, rate and minimum payment for each debt, plus whatever extra you can commit each month.
              The tool then orders the debts from the highest annual rate downward, shows how many months each one takes to
              clear, and reports the total interest the plan costs.
            </p>
            <p>
              The avalanche is the interest-minimising version of the debt snowball. Both methods keep every account current
              with its minimum payment and concentrate the surplus on a single target, so the mechanics are identical. The
              difference is the ordering rule, and that ordering is what decides how much interest the plan costs and how
              much the psychological wins cost in cash.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Avalanche Payoff Is Calculated</h2>
            <p>
              The calculator runs a month-by-month simulation. At the start of each month interest is charged on every open
              balance at the annual rate divided by twelve, and each minimum payment is applied. Anything left over, plus the
              extra you chose and the minimums released by debts already cleared, is then thrown at the highest-rate open
              account until the pool is exhausted.
            </p>
            <p>
              That release mechanism is the engine of the method. When a debt reaches zero its minimum does not disappear
              from the budget, it rolls into the pool attacking the next account, so the monthly outlay stays level while the
              force applied to the debt at the top of the list grows every time something clears. The simulation also runs a
              minimum-only version of the same debts to establish the do-nothing baseline, and a snowball version that
              targets the smallest balance first so the two strategies can be compared directly.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports how long until you are debt-free, along with the total interest and the priority order
              the tool selected. The three statistics beside it give total interest, the interest saved against paying
              minimums only, and the amount the avalanche undercuts the snowball by. The breakdown table lists each debt in
              attack order with its balance, rate, minimum, the month it clears and the interest it cost.
            </p>
            <p>
              Summary Statistics collects the total debt, monthly minimums, the extra payment, the total monthly outlay, the
              month the first debt clears, the debt-free horizon for the avalanche and for minimums only, the time and
              interest saved, the snowball comparison and the total repaid. If the avalanche and snowball timelines are
              close, the interest difference is usually small and the snowball's quicker first win may be worth more to you
              than the saving. If the spread is wide, the arithmetic is telling you plainly which debts to attack first.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-payoff-avalanche-calculator" />
          <PopularCalculators exclude="/calculator/debt-payoff-avalanche-calculator" />
        </div>
      </div>
    </>
  );
}
