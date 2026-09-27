"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface StressInputs {
  income: number;
  debtPayments: number;
  essentials: number;
  incomeShockPct: number;
  debtShockPct: number;
}

const DEFAULTS: StressInputs = {
  income: 6500,
  debtPayments: 1450,
  essentials: 2200,
  incomeShockPct: 10,
  debtShockPct: 15,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function stressBand(ratio: number): { label: string; tone: string } {
  if (ratio <= 50) return { label: "Comfortable", tone: "text-emerald-600" };
  if (ratio <= 70) return { label: "Stressed", tone: "text-amber-600" };
  return { label: "Critical", tone: "text-red-600" };
}

interface StressResult {
  baseRatio: number;
  dti: number;
  stressedRatio: number;
  surplus: number;
  stressedSurplus: number;
  stressedIncome: number;
  stressedDebt: number;
  essentialsShare: number;
  debtShare: number;
  surplusShare: number;
  valid: boolean;
  errorMsg: string;
}

function computeStress(i: StressInputs): StressResult {
  const invalid =
    i.income <= 0 ||
    i.debtPayments < 0 ||
    i.essentials < 0 ||
    i.incomeShockPct < 0 ||
    i.incomeShockPct > 100 ||
    i.debtShockPct < 0 ||
    i.debtShockPct > 100;

  const committed = i.debtPayments + i.essentials;
  const baseRatio = i.income > 0 ? (committed / i.income) * 100 : 0;
  const stressedIncome = i.income * (1 - i.incomeShockPct / 100);
  const stressedDebt = i.debtPayments * (1 + i.debtShockPct / 100);
  const stressedCommitted = stressedDebt + i.essentials;
  const stressedRatio = stressedIncome > 0 ? (stressedCommitted / stressedIncome) * 100 : 0;

  return {
    baseRatio,
    dti: i.income > 0 ? (i.debtPayments / i.income) * 100 : 0,
    stressedRatio,
    surplus: i.income - committed,
    stressedSurplus: stressedIncome - stressedCommitted,
    stressedIncome,
    stressedDebt,
    essentialsShare: i.income > 0 ? (i.essentials / i.income) * 100 : 0,
    debtShare: i.income > 0 ? (i.debtPayments / i.income) * 100 : 0,
    surplusShare: i.income > 0 ? ((i.income - committed) / i.income) * 100 : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter an income above zero, non-negative payments and expenses, and shocks between 0% and 100%."
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

export default function DebtStressRatioCalculator() {
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [debtPayments, setDebtPayments] = useState(String(DEFAULTS.debtPayments));
  const [essentials, setEssentials] = useState(String(DEFAULTS.essentials));
  const [incomeShockPct, setIncomeShockPct] = useState(String(DEFAULTS.incomeShockPct));
  const [debtShockPct, setDebtShockPct] = useState(String(DEFAULTS.debtShockPct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): StressInputs => ({
    income: parseFloat(income) || 0,
    debtPayments: parseFloat(debtPayments) || 0,
    essentials: parseFloat(essentials) || 0,
    incomeShockPct: parseFloat(incomeShockPct) || 0,
    debtShockPct: parseFloat(debtShockPct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<StressInputs>(() => DEFAULTS);
  const [results, setResults] = useState<StressResult>(() => computeStress(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeStress(inputs));
  };

  const reset = () => {
    setIncome(String(DEFAULTS.income));
    setDebtPayments(String(DEFAULTS.debtPayments));
    setEssentials(String(DEFAULTS.essentials));
    setIncomeShockPct(String(DEFAULTS.incomeShockPct));
    setDebtShockPct(String(DEFAULTS.debtShockPct));
    setCalcInputs(DEFAULTS);
    setResults(computeStress(DEFAULTS));
  };

  const band = stressBand(results.baseRatio);
  const stressBandResult = stressBand(results.stressedRatio);

  const faqs = [
    {
      question: "What is a debt stress ratio?",
      answer:
        "A debt stress ratio measures how much of your income is committed before discretionary spending begins. It adds your debt payments to essential living expenses — housing, utilities, food, transport, insurance — and divides the total by your income. A household spending 85% of income on debt and essentials has very little room to absorb a surprise; one spending 55% has a genuine buffer. The ratio is deliberately broader than debt-to-income, which counts only debt payments.",
    },
    {
      question: "Why shock-test income and debt payments?",
      answer:
        "Because today's numbers describe today, not the next two years. An income shock — a reduced bonus, a partner losing a job, a move to part-time work — is the most common way a comfortable budget turns tight, and a payment shock arrives whenever a variable-rate loan reprices or a promotional rate expires. Re-running the ratio under both shocks shows whether the household can absorb the change without falling behind, which is exactly the question lenders ask at renewal.",
    },
    {
      question: "What ratio is considered safe?",
      answer:
        "There is no single regulatory number for this broader measure, so treat the bands as practical guidance: at 50% or below, committed outflows leave roughly half of income for saving and discretionary spending; between 50% and 70% the household is stretched and vulnerable to shocks; above 70% it is critical, with no meaningful margin for error. The right target for your household depends on income stability, savings and how easily expenses can be cut.",
    },
    {
      question: "How does this differ from debt-to-income?",
      answer:
        "Debt-to-income counts only debt payments — mortgage, loans, cards — divided by income, and it is the number lenders underwrite to. The stress ratio adds essential living costs, so it captures the full set of obligations that cannot simply be stopped. A household with a modest 20% DTI can still be stressed if rent and essentials consume another 50% of income, which is why the two measures are most useful together.",
    },
    {
      question: "What should I do if my stressed ratio is too high?",
      answer:
        "Work on the two levers at once. On the expense side, prioritise debts with the largest monthly payments relative to their balances, consolidating or refinancing where it lowers the obligation, and audit essential expenses that can be renegotiated — insurance, phone plans, subscriptions, rent at renewal. On the income side, build an emergency fund sized in months of committed outflows rather than months of income, because the ratio measures committed spending. Even a three-month buffer materially changes how a shock plays out.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Stress Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Stress Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income & Commitments">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="income"
                  label="Monthly Income"
                  value={income}
                  onChange={setIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Take-home monthly income of the household."
                />
                <CompactInput
                  id="debt-payments"
                  label="Total Debt Payments"
                  value={debtPayments}
                  onChange={setDebtPayments}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="All loan, card and credit payments each month."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="essentials"
                  label="Essential Living Expenses"
                  value={essentials}
                  onChange={setEssentials}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Housing, utilities, food, transport and insurance — costs you cannot easily stop."
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
                  <SubSection title="Stress Test">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="income-shock"
                        label="Income Shock"
                        value={incomeShockPct}
                        onChange={setIncomeShockPct}
                        onEnter={runCalculate}
                        suffix="% drop"
                        min="0"
                        tooltip="Fall in income to model, such as losing a bonus or moving to part-time work."
                      />
                      <CompactInput
                        id="debt-shock"
                        label="Debt Payment Shock"
                        value={debtShockPct}
                        onChange={setDebtShockPct}
                        onEnter={runCalculate}
                        suffix="% rise"
                        min="0"
                        tooltip="Rise in debt payments to model, such as a variable-rate repricing."
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
            {results.valid && results.stressedSurplus < 0 && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Negative under stress</div>
                <div className="text-base font-medium text-foreground">
                  Under the modelled shocks, committed outflows exceed income by ${fmt(Math.abs(results.stressedSurplus), 0)}{" "}
                  a month.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt Stress Ratio</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.baseRatio, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Band: <span className={`font-bold ${band.tone}`}>{band.label}</span> — share of income committed to debt
                and essentials
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Debt Payments
                </span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.debtPayments, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Essentials</span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.essentials, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Monthly Surplus
                </span>
                <span className={`font-extrabold ${results.surplus >= 0 ? "text-primary" : "text-red-600"}`}>
                  ${fmt(results.surplus, 0)}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Monthly Outflow</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">% of Income</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt payments</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.debtPayments, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.debtShare, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Essential expenses</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.essentials, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.essentialsShare, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Uncommitted surplus</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.surplus, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.surplusShare, 1)}%</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Monthly Income</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.income, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Ratio Under Stress
                  </span>
                  <span className={`text-base font-bold ${stressBandResult.tone}`}>
                    {fmt(results.stressedRatio, 1)}% ({stressBandResult.label})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt-to-Income</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.dti, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Stressed Income
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.stressedIncome, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Stressed Debt Payment
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.stressedDebt, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Surplus Under Stress
                  </span>
                  <span className={`text-base font-bold ${results.stressedSurplus >= 0 ? "text-primary" : "text-red-600"}`}>
                    ${fmt(results.stressedSurplus, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Ratio Increase Under Stress
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(Math.max(0, results.stressedRatio - results.baseRatio), 1)} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Stress Ratio Calculator?</h2>
            <p>
              A debt stress ratio calculator measures how much of your income is already spoken for before any
              discretionary spending begins. It adds together your debt payments and your essential living expenses —
              housing, utilities, food, transport, insurance — and divides the total by your monthly income. The result
              is a broader measure than debt-to-income, because it captures the obligations you cannot simply pause: even
              a household with modest debts can be under real pressure if rent and essentials consume most of what comes
              in.
            </p>
            <p>
              The second half of the calculation is the stress test. Today&apos;s ratio describes today; the ratio that
              matters is the one that applies when something changes. The calculator reruns the numbers with an income
              shock — a lost bonus, reduced hours, a partner between jobs — and a payment shock, such as a variable-rate
              loan repricing or a promotional rate expiring. The difference between the two ratios is the household&apos;s
              margin of safety, made explicit in percentage points.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The base ratio divides debt payments plus essential expenses by income. The stressed scenario reduces
              income by the shock percentage you choose and increases debt payments by the second percentage, then
              divides the new committed total by the new income. The surplus is what remains of income after both
              obligations, in both the base and stressed cases, and a negative stressed surplus means the budget does not
              close under the shocks modelled.
            </p>
            <p>
              The components are reported separately so you can see where the pressure comes from: debt payments as a
              share of income, essential expenses as a share of income, and the uncommitted surplus as the remainder. A
              household whose stress comes mostly from the debt share has a different remedy — refinancing, consolidating
              or accelerating payoff — than one whose stress comes from a high essentials share, where the levers are
              housing, insurance and transport costs.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the base ratio with a practical band: 50% or below is comfortable, 50% to 70% is
              stretched, and above 70% is critical, leaving no meaningful margin for error. The three-stat bar shows the
              two obligation components and the surplus, and the breakdown table expresses each as a share of income so
              the household budget is visible as one sentence.
            </p>
            <p>
              Summary Statistics adds the ratio under stress with its own band, the debt-to-income figure for comparison
              with lender thresholds, the shocked income and payment levels, the surplus under stress and the number of
              percentage points the ratio moves when the shocks apply. Treat the shocks you enter as scenarios, not
              predictions, and remember that essential expenses are the hardest part of the budget to compress. An
              emergency fund measured in months of committed outflows — not months of income — is the buffer that keeps a
              stressed ratio from becoming a crisis. Revisit the calculation whenever income, rent or a loan payment
              changes, because the ratio moves with every one of those events, and it takes only a minute to update
              with the inputs above. Review it each quarter to see the trend rather than a single reading.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-stress-ratio-calculator" />
          <PopularCalculators exclude="/calculator/debt-stress-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
