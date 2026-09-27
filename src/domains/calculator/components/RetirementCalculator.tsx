"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";

interface RetirementInputs {
  currentAge: string;
  retireAge: string;
  currentSavings: string;
  monthlySaving: string;
  monthlyExpenses: string;
  inflationRate: string;
  returnRate: string;
  socialSecurity: string;
  pension: string;
  withdrawalRate: string;
}

const DEFAULTS: RetirementInputs = {
  currentAge: "40",
  retireAge: "65",
  currentSavings: "150000",
  monthlySaving: "1500",
  monthlyExpenses: "5000",
  inflationRate: "2.5",
  returnRate: "7",
  socialSecurity: "2000",
  pension: "500",
  withdrawalRate: "4",
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => `$${fmt(v, 2)}`;

interface ScenarioRow {
  label: string;
  years: number;
  portfolio: number;
  income: number;
  coverage: number;
  onTrack: boolean;
  highlight: boolean;
}

interface RetirementResult {
  valid: boolean;
  errorMsg: string;
  yearsToRetire: number;
  monthsToRetire: number;
  portfolio: number;
  contribTotal: number;
  growthTotal: number;
  realReturn: number;
  requiredPortfolio: number;
  coverageYears: number;
  monthlyIncome: number;
  investmentIncome: number;
  gap: number;
  onTrack: boolean;
  coverage: number;
  replacementRatio: number;
  monthlyTopUp: number;
  safeSpend: number;
  depletionAge: number;
  scenarios: ScenarioRow[];
}

function monthlyRateFor(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

function portfolioAt(months: number, savings: number, monthlySaving: number, i: number): number {
  if (months <= 0) return savings;
  const growth = Math.pow(1 + i, months);
  const contrib = i === 0 ? monthlySaving * months : monthlySaving * ((growth - 1) / i);
  return savings * growth + contrib;
}

function compute(inp: RetirementInputs): RetirementResult {
  const currentAge = num(inp.currentAge);
  const retireAge = num(inp.retireAge);
  const savings = num(inp.currentSavings);
  const monthlySaving = num(inp.monthlySaving);
  const monthlyExpenses = num(inp.monthlyExpenses);
  const inflation = num(inp.inflationRate);
  const returnRate = num(inp.returnRate);
  const socialSecurity = num(inp.socialSecurity);
  const pension = num(inp.pension);
  const withdrawal = num(inp.withdrawalRate) || 4;

  const blank: RetirementResult = {
    valid: false,
    errorMsg: "",
    yearsToRetire: 0,
    monthsToRetire: 0,
    portfolio: 0,
    contribTotal: 0,
    growthTotal: 0,
    realReturn: 0,
    requiredPortfolio: 0,
    coverageYears: 0,
    monthlyIncome: 0,
    investmentIncome: 0,
    gap: 0,
    onTrack: false,
    coverage: 0,
    replacementRatio: 0,
    monthlyTopUp: 0,
    safeSpend: 0,
    depletionAge: 0,
    scenarios: [],
  };

  if (retireAge <= currentAge || monthlyExpenses <= 0 || returnRate <= -100) {
    return { ...blank, errorMsg: "Enter a retirement age above your current age and monthly expenses above zero." };
  }

  const yearsToRetire = retireAge - currentAge;
  const monthsToRetire = Math.round(yearsToRetire * 12);
  const i = monthlyRateFor(returnRate);
  const realMonthly = monthlyRateFor(((1 + returnRate / 100) / (1 + inflation / 100) - 1) * 100);
  const realReturn = ((1 + returnRate / 100) / (1 + inflation / 100) - 1) * 100;

  const portfolio = portfolioAt(monthsToRetire, savings, monthlySaving, i);
  const contribTotal = savings + monthlySaving * monthsToRetire;
  const growthTotal = portfolio - contribTotal;

  // Retirement income in today's money: contributions and the portfolio are
  // projected in real terms so every figure below is comparable to today.
  const portfolioReal = portfolioAt(monthsToRetire, savings, monthlySaving, realMonthly);
  const annualExpenses = monthlyExpenses * 12;
  const annualOther = (socialSecurity + pension) * 12;
  const requiredPortfolio = Math.max(0, (annualExpenses - annualOther) / (withdrawal / 100));
  const investmentIncome = (portfolioReal * (withdrawal / 100)) / 12;
  const monthlyIncome = socialSecurity + pension + investmentIncome;
  const gap = monthlyIncome - monthlyExpenses;
  const onTrack = gap >= 0;
  const coverage = monthlyExpenses > 0 ? (monthlyIncome / monthlyExpenses) * 100 : 0;
  const replacementRatio = monthlyExpenses > 0 ? Math.min(100, coverage) : 0;

  // Required monthly saving to close the gap, solved in real terms.
  let monthlyTopUp = 0;
  if (!onTrack && monthsToRetire > 0) {
    const shortfall = requiredPortfolio - portfolioReal;
    if (shortfall > 0) {
      const growth = Math.pow(1 + realMonthly, monthsToRetire);
      monthlyTopUp = realMonthly === 0 ? shortfall / monthsToRetire : (shortfall * realMonthly) / (growth - 1);
    }
  }

  const safeSpend = (portfolioReal * (withdrawal / 100)) / 12 + socialSecurity + pension;
  const annualGap = Math.max(0, annualExpenses - annualOther);
  const coverageYears = annualGap > 0 ? portfolioReal / annualGap : 0;
  const depletionAge = retireAge + coverageYears;

  const ageOptions = [retireAge - 5, retireAge, retireAge + 5].filter((a) => a > currentAge);
  const scenarios: ScenarioRow[] = ageOptions.map((age) => {
    const months = Math.round((age - currentAge) * 12);
    const pReal = portfolioAt(months, savings, monthlySaving, realMonthly);
    const inc = socialSecurity + pension + (pReal * (withdrawal / 100)) / 12;
    return {
      label: `Retire at ${age}`,
      years: months / 12,
      portfolio: pReal,
      income: inc,
      coverage: monthlyExpenses > 0 ? (inc / monthlyExpenses) * 100 : 0,
      onTrack: inc >= monthlyExpenses,
      highlight: Math.abs(age - retireAge) < 0.5,
    };
  });

  return {
    valid: true,
    errorMsg: "",
    yearsToRetire,
    monthsToRetire,
    portfolio: portfolioReal,
    contribTotal,
    growthTotal,
    realReturn,
    requiredPortfolio,
    coverageYears,
    monthlyIncome,
    investmentIncome,
    gap,
    onTrack,
    coverage,
    replacementRatio,
    monthlyTopUp,
    safeSpend,
    depletionAge,
    scenarios,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, prefix, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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
    <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{title}</div>
    {children}
  </div>
);

export default function RetirementCalculator() {
  const [inputs, setInputs] = useState<RetirementInputs>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [calcInputs, setCalcInputs] = useState<RetirementInputs>(DEFAULTS);
  const [results, setResults] = useState<RetirementResult>(() => compute(DEFAULTS));

  const set = (key: keyof RetirementInputs) => (v: string) => setInputs((prev) => ({ ...prev, [key]: v }));

  const runCalculate = () => {
    setCalcInputs(inputs);
    setResults(compute(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setCalcInputs(DEFAULTS);
    setResults(compute(DEFAULTS));
  };

  const breakdownRows: { label: string; value: string }[] = [
    { label: "Years to retirement", value: `${fmt(results.yearsToRetire, 1)} years` },
    { label: "Current savings", value: money(num(calcInputs.currentSavings)) },
    { label: "Monthly saving", value: money(num(calcInputs.monthlySaving)) },
    { label: "Total contributions", value: money(results.contribTotal) },
    { label: "Investment growth", value: money(results.growthTotal) },
    { label: "Portfolio at retirement", value: money(results.portfolio) },
    { label: "Portfolio needed", value: money(results.requiredPortfolio) },
    { label: "Withdrawal rate", value: `${fmt(num(calcInputs.withdrawalRate) || 4, 2)}%` },
    { label: "Investment income", value: `${money(results.investmentIncome)} per month` },
    { label: "Total monthly income", value: money(results.monthlyIncome) },
    { label: "Monthly expenses", value: money(num(calcInputs.monthlyExpenses)) },
    { label: "Monthly surplus or deficit", value: `${results.gap >= 0 ? "+" : "-"}${money(Math.abs(results.gap))}` },
  ];

  const faqs = [
    {
      question: "How much do I need to retire?",
      answer:
        "Start from your annual spending, subtract the income you will receive from Social Security and any pension, then divide what is left by your chosen withdrawal rate. At a 4 percent withdrawal rate the portfolio needs to be 25 times the shortfall. Spending of $60,000 a year with $30,000 of guaranteed income therefore needs a portfolio of about $750,000 in today's money.",
    },
    {
      question: "Why are the figures shown in today's money?",
      answer:
        "Because comparing a nominal balance forty years out with today's expenses is misleading. Everything here is projected at the real return, which is the nominal return after inflation, so the portfolio, the income and the expenses are all expressed in the purchasing power of today. That makes the gap and the coverage ratio directly meaningful.",
    },
    {
      question: "What is the 4 percent rule?",
      answer:
        "It is a widely used planning guideline suggesting that withdrawing about 4 percent of a portfolio in the first year of retirement, then adjusting that amount for inflation, has historically funded a thirty-year retirement in most market conditions. It is a starting point rather than a guarantee, and it assumes a diversified portfolio, not cash.",
    },
    {
      question: "Is Social Security enough on its own?",
      answer:
        "For most households it replaces only part of pre-retirement income, typically somewhere between a quarter and a half depending on earnings history and claiming age. Delaying a claim increases the benefit by roughly 8 percent for each year past full retirement age up to 70, which is often the cheapest annuity available to a retiree.",
    },
    {
      question: "What if the projection shows a gap?",
      answer:
        "Three levers fix it: saving more each month, retiring later or spending less in retirement. The results panel reports the extra monthly saving that would close the shortfall in real terms, and the scenario table shows what five more years of saving and compounding would do to both the portfolio and the coverage ratio.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Retirement Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Retirement Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Your Plan">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput
                    id="ret-current-age"
                    label="Current Age"
                    value={inputs.currentAge}
                    onChange={set("currentAge")}
                    onEnter={runCalculate}
                    min="0"
                  />
                  <CompactInput
                    id="ret-age"
                    label="Retirement Age"
                    value={inputs.retireAge}
                    onChange={set("retireAge")}
                    onEnter={runCalculate}
                    min="0"
                  />
                </div>
                <CompactInput
                  id="ret-savings"
                  label="Current Retirement Savings"
                  value={inputs.currentSavings}
                  onChange={set("currentSavings")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                />
                <CompactInput
                  id="ret-monthly"
                  label="Monthly Saving"
                  value={inputs.monthlySaving}
                  onChange={set("monthlySaving")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                  hint="Including any employer match"
                />
              </div>
            </SubSection>

            <SubSection title="Retirement Income">
              <div className="flex flex-col gap-3">
                <CompactInput
                  id="ret-expenses"
                  label="Monthly Expenses in Retirement"
                  value={inputs.monthlyExpenses}
                  onChange={set("monthlyExpenses")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                  hint="In today's money"
                />
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput
                    id="ret-ss"
                    label="Social Security"
                    value={inputs.socialSecurity}
                    onChange={set("socialSecurity")}
                    onEnter={runCalculate}
                    min="0"
                    prefix="$"
                  />
                  <CompactInput
                    id="ret-pension"
                    label="Pension"
                    value={inputs.pension}
                    onChange={set("pension")}
                    onEnter={runCalculate}
                    min="0"
                    prefix="$"
                  />
                </div>
              </div>
            </SubSection>

            <SubSection title="Assumptions">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="bg-secondary/20 border border-border mt-3 rounded-lg p-4 animate-fade-in-up !overflow-visible">
                  <div className="flex flex-col gap-3">
                    <CompactInput
                      id="ret-return"
                      label="Expected Annual Return"
                      value={inputs.returnRate}
                      onChange={set("returnRate")}
                      onEnter={runCalculate}
                      suffix="%"
                    />
                    <CompactInput
                      id="ret-inflation"
                      label="Inflation Rate"
                      value={inputs.inflationRate}
                      onChange={set("inflationRate")}
                      onEnter={runCalculate}
                      suffix="%"
                    />
                    <CompactInput
                      id="ret-withdrawal"
                      label="Withdrawal Rate"
                      value={inputs.withdrawalRate}
                      onChange={set("withdrawalRate")}
                      onEnter={runCalculate}
                      suffix="%"
                      hint="The share of the portfolio drawn each year"
                    />
                  </div>
                </div>
              )}
            </SubSection>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                aria-label="Reset"
                onClick={reset}
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid ? (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 text-sm text-destructive font-semibold">
                {results.errorMsg || "Enter valid retirement details to see results."}
              </div>
            ) : (
              <>
                {/* PRIMARY RESULT CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Income at Retirement</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{money(results.monthlyIncome)}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {results.onTrack
                      ? `Covers your ${money(num(calcInputs.monthlyExpenses))} of monthly expenses in today's money`
                      : `Short of your ${money(num(calcInputs.monthlyExpenses))} of monthly expenses by ${money(Math.abs(results.gap))}`}
                  </div>
                </div>

                {/* 3-STAT BAR */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Portfolio at Retirement</span>
                    <span className="font-extrabold text-foreground">{money(results.portfolio)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Portfolio Needed</span>
                    <span className="font-extrabold text-foreground">{money(results.requiredPortfolio)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Income Coverage</span>
                    <span className="font-extrabold text-foreground">{`${fmt(results.coverage, 0)}%`}</span>
                  </div>
                </div>

                {/* BREAKDOWN */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Retirement Plan</th>
                        <th className="p-2.5 pr-3 text-right w-[170px]">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {breakdownRows.map((row) => (
                        <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RETIREMENT AGE SCENARIOS */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Retirement Age</th>
                        <th className="p-2.5 text-right">Portfolio</th>
                        <th className="p-2.5 text-right">Monthly Income</th>
                        <th className="p-2.5 pr-3 text-right w-[110px]">Coverage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.scenarios.map((row) => (
                        <tr
                          key={row.label}
                          className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-primary/5 font-semibold" : ""}`}
                        >
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 text-right text-foreground">{money(row.portfolio)}</td>
                          <td className="p-2.5 text-right text-foreground">{money(row.income)}</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${row.onTrack ? "text-emerald-600" : "text-rose-600"}`}>
                            {`${fmt(row.coverage, 0)}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SUMMARY STATISTICS */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Status</span>
                      <span className={`text-base font-bold ${results.onTrack ? "text-emerald-600" : "text-rose-600"}`}>
                        {results.onTrack ? "On track" : "Gap exists"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Income Coverage</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.coverage, 1)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Saving Needed</span>
                      <span className="text-base font-bold text-foreground">
                        {results.monthlyTopUp > 0 ? `${money(results.monthlyTopUp)} a month` : "None"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Safe Monthly Spending</span>
                      <span className="text-base font-bold text-foreground">{money(results.safeSpend)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Portfolio Covers</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.coverageYears, 1)} years`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Funded Until Age</span>
                      <span className="text-base font-bold text-foreground">{fmt(results.depletionAge, 0)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Real Return</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.realReturn, 2)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Years to Retirement</span>
                      <span className="text-base font-bold text-foreground">{fmt(results.yearsToRetire, 1)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Retirement Calculator?</h2>
            <p>
              A retirement calculator answers one question: will the money you are accumulating cover the life you want
              when you stop working? It projects your current savings and monthly contributions forward to your
              retirement date, adds any Social Security or pension income, and then compares the total against your
              expected spending to show whether the plan holds together or leaves a gap.
            </p>
            <p>
              Everything it reports is expressed in today's purchasing power. A portfolio of two million dollars in
              thirty-five years does not feel like two million today, so the projection is run at the real return, which
              is the expected return after inflation has been deducted. Expenses, benefits and income are all stated in
              today's money, which makes the comparison between what you will have and what you will need an honest one.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Your savings are compounded monthly at the real rate of return until the retirement age you enter. Each
              monthly contribution is added as it is made, so money saved early does far more work than money saved in
              the final years. The result is the portfolio you would hold on the day you retire, measured in today's
              money, alongside the split between what you contributed and what the market produced.
            </p>
            <p>
              On the income side, the calculator takes your monthly spending, subtracts Social Security and any pension,
              and divides the remaining shortfall by your withdrawal rate to get the portfolio you actually need. If the
              projected portfolio is smaller than that, the difference is converted into an extra monthly saving using the
              same real return, which is the number most people find most useful because it is directly actionable.
            </p>
            <p>
              The scenario table then re-runs the projection at five years earlier and five years later than your chosen
              retirement age. Retiring earlier means fewer years of contributions and more years of withdrawals, while
              retiring later does the reverse and usually closes a gap with no change in spending at all.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the monthly income your plan supports, and the three-stat bar compares the portfolio
              you will have with the portfolio you need and reports how much of your spending is covered. Everything
              below is in today's money unless a row says otherwise.
            </p>
            <p>
              Coverage above 100 percent means the plan is funded with room to spare; below that, the coverage figure is
              the share of your spending the plan can support. A plan at 85 percent is not a failure, it simply means
              either spending a little less or saving a little more, and the extra-saving figure quantifies the second
              option precisely.
            </p>
            <p>
              Remember that the withdrawal rate is a planning assumption rather than a promise. A portfolio drawn at 4
              percent has historically lasted thirty years in most periods, but a poor first decade of returns is the
              real risk, which is why holding a year or two of spending in cash is a common defence. Re-run the numbers
              every few years: a raise, a market fall or a change in Social Security rules all move the answer, and the
              value of the projection is in noticing the drift before it becomes urgent rather than after.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/retirement-calculator" />
          <PopularCalculators exclude="/calculator/retirement-calculator" />
        </div>
      </div>
    </>
  );
}
