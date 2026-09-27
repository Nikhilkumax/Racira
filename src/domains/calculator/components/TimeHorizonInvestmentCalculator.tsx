"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface HorizonInputs {
  initial: number;
  monthly: number;
  expectedReturn: number;
  years: number;
  target: number;
  currentAge: number;
  contributionGrowth: number;
  inflation: number;
}

const DEFAULTS: HorizonInputs = {
  initial: 20000,
  monthly: 500,
  expectedReturn: 7,
  years: 25,
  target: 500000,
  currentAge: 35,
  contributionGrowth: 0,
  inflation: 2.5,
};

const LADDER = [5, 10, 15, 20, 25, 30];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

/** Monthly simulation with contributions that can step up once a year. */
function project(
  initial: number,
  monthly: number,
  annualReturn: number,
  months: number,
  contributionGrowth: number
): { value: number; contributed: number; growth: number } {
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  let value = initial;
  let contributed = initial;
  let payment = monthly;
  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m - 1) % 12 === 0) payment = payment * (1 + contributionGrowth / 100);
    value = value * (1 + monthlyRate) + payment;
    contributed += payment;
  }
  return { value, contributed, growth: value - contributed };
}

interface LadderRow {
  years: number;
  value: number;
  contributed: number;
  growth: number;
  growthShare: number;
}

interface HorizonResult {
  valid: boolean;
  errorMsg: string;
  terminalValue: number;
  totalContributed: number;
  growth: number;
  growthShare: number;
  realValue: number;
  monthsToTarget: number;
  yearsToTarget: number;
  ageAtTarget: number;
  requiredMonthly: number;
  delayedValue: number;
  costOfDelay: number;
  requiredMonthlyIfDelayed: number;
  monthlyDifference: number;
  rows: LadderRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: HorizonInputs): HorizonResult {
  const years = Math.max(0.5, i.years);
  const months = Math.round(years * 12);
  const base = project(i.initial, i.monthly, i.expectedReturn, months, i.contributionGrowth);
  const realValue = base.value / Math.pow(1 + Math.max(0, i.inflation) / 100, years);

  // Months until the balance reaches the target, capped at 60 years.
  let monthsToTarget = 0;
  {
    const monthlyRate = Math.pow(1 + i.expectedReturn / 100, 1 / 12) - 1;
    let value = i.initial;
    let payment = i.monthly;
    for (let m = 1; m <= 720; m++) {
      if (m > 1 && (m - 1) % 12 === 0) payment = payment * (1 + i.contributionGrowth / 100);
      value = value * (1 + monthlyRate) + payment;
      if (value >= i.target) {
        monthsToTarget = m;
        break;
      }
    }
    if (monthsToTarget === 0 && value >= i.target) monthsToTarget = 720;
  }

  // Required monthly contribution to reach the target within the horizon.
  let requiredMonthly = 0;
  if (i.target > 0) {
    let lo = 0;
    let hi = Math.max(i.monthly * 20, 1000);
    while (project(i.initial, hi, i.expectedReturn, months, i.contributionGrowth).value < i.target && hi < 10000000) {
      hi *= 2;
    }
    for (let iter = 0; iter < 60; iter++) {
      const mid = (lo + hi) / 2;
      if (project(i.initial, mid, i.expectedReturn, months, i.contributionGrowth).value < i.target) lo = mid;
      else hi = mid;
    }
    requiredMonthly = (lo + hi) / 2;
  }

  // Cost of waiting five years: the same horizon, but contributions and growth
  // only begin after 60 months.
  const delayMonths = Math.min(60, Math.max(0, months - 1));
  const delayedCont = project(0, i.monthly, i.expectedReturn, months - delayMonths, i.contributionGrowth);
  const delayedValue = i.initial * Math.pow(1 + i.expectedReturn / 100, years) + delayedCont.value;

  let requiredMonthlyIfDelayed = 0;
  if (i.target > 0 && months - delayMonths > 0) {
    let lo = 0;
    let hi = Math.max(i.monthly * 20, 1000);
    const test = (m: number) =>
      i.initial * Math.pow(1 + i.expectedReturn / 100, years) +
      project(0, m, i.expectedReturn, months - delayMonths, i.contributionGrowth).value;
    while (test(hi) < i.target && hi < 10000000) hi *= 2;
    for (let iter = 0; iter < 60; iter++) {
      const mid = (lo + hi) / 2;
      if (test(mid) < i.target) lo = mid;
      else hi = mid;
    }
    requiredMonthlyIfDelayed = (lo + hi) / 2;
  }

  const rows: LadderRow[] = LADDER.map((y) => {
    const r = project(i.initial, i.monthly, i.expectedReturn, y * 12, i.contributionGrowth);
    return {
      years: y,
      value: r.value,
      contributed: r.contributed,
      growth: r.growth,
      growthShare: r.value > 0 ? (r.growth / r.value) * 100 : 0,
    };
  });

  const valid =
    i.initial >= 0 &&
    i.monthly >= 0 &&
    (i.initial > 0 || i.monthly > 0) &&
    i.expectedReturn > -30 &&
    i.expectedReturn < 40 &&
    i.years > 0 &&
    i.target >= 0 &&
    i.currentAge > 0 &&
    i.contributionGrowth >= -10 &&
    i.contributionGrowth <= 20 &&
    i.inflation >= 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive starting amount or monthly contribution, a return between -30% and 40%, a positive horizon, and a target, age, contribution growth and inflation within sensible ranges.";

  return {
    valid,
    errorMsg,
    terminalValue: base.value,
    totalContributed: base.contributed,
    growth: base.growth,
    growthShare: base.value > 0 ? (base.growth / base.value) * 100 : 0,
    realValue,
    monthsToTarget,
    yearsToTarget: monthsToTarget > 0 ? monthsToTarget / 12 : 0,
    ageAtTarget: monthsToTarget > 0 ? i.currentAge + monthsToTarget / 12 : 0,
    requiredMonthly,
    delayedValue,
    costOfDelay: base.value - delayedValue,
    requiredMonthlyIfDelayed,
    monthlyDifference: requiredMonthlyIfDelayed - requiredMonthly,
    rows,
    summary: [
      { label: "Initial Amount", value: money2(i.initial) },
      { label: "Monthly Contribution", value: money2(i.monthly) },
      { label: "Expected Return", value: fmt(i.expectedReturn, 2) + "%" },
      { label: "Horizon", value: fmt(years, 1) + " yr" },
      { label: "Value at Horizon", value: money(base.value), tone: "text-primary" },
      { label: "Total Contributed", value: money(base.contributed) },
      { label: "Growth", value: money(base.growth), tone: "text-emerald-600" },
      { label: "Growth Share", value: fmt(base.value > 0 ? (base.growth / base.value) * 100 : 0, 2) + "%" },
      { label: "Value in Today's Dollars", value: money(realValue) },
      { label: "Target Amount", value: money(i.target) },
      { label: "Years to Reach Target", value: monthsToTarget > 0 ? fmt(monthsToTarget / 12, 1) + " yr" : "Not reached" },
      { label: "Age at Target", value: monthsToTarget > 0 ? fmt(i.currentAge + monthsToTarget / 12, 1) : "—" },
      { label: "Monthly Needed for Target", value: money2(requiredMonthly), tone: "text-primary" },
      { label: "Value if Started 5 Years Later", value: money(delayedValue), tone: "text-destructive" },
      { label: "Cost of 5-Year Delay", value: money(base.value - delayedValue), tone: "text-destructive" },
      { label: "Extra Monthly Needed After Delay", value: money2(requiredMonthlyIfDelayed - requiredMonthly), tone: "text-destructive" },
      { label: "Target Progress", value: i.target > 0 ? fmt((base.value / i.target) * 100, 1) + "%" : "—" },
    ],
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
  max?: string;
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
  max,
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
        max={max}
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

export default function TimeHorizonInvestmentCalculator() {
  const [initial, setInitial] = useState(String(DEFAULTS.initial));
  const [monthly, setMonthly] = useState(String(DEFAULTS.monthly));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [target, setTarget] = useState(String(DEFAULTS.target));
  const [currentAge, setCurrentAge] = useState(String(DEFAULTS.currentAge));
  const [contributionGrowth, setContributionGrowth] = useState(String(DEFAULTS.contributionGrowth));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): HorizonInputs => ({
    initial: parseFloat(initial) || 0,
    monthly: parseFloat(monthly) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    years: parseFloat(years) || 0,
    target: parseFloat(target) || 0,
    currentAge: parseFloat(currentAge) || 0,
    contributionGrowth: parseFloat(contributionGrowth) || 0,
    inflation: parseFloat(inflation) || 0,
  });

  const [results, setResults] = useState<HorizonResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setInitial(String(DEFAULTS.initial));
    setMonthly(String(DEFAULTS.monthly));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setYears(String(DEFAULTS.years));
    setTarget(String(DEFAULTS.target));
    setCurrentAge(String(DEFAULTS.currentAge));
    setContributionGrowth(String(DEFAULTS.contributionGrowth));
    setInflation(String(DEFAULTS.inflation));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "Why does the time horizon matter so much?",
      answer:
        "Because compounding is exponential, not linear. Doubling the horizon does far more than double the result: the growth earned in the later years dwarfs the growth in the early years, and contributions made at the start have decades to compound. That is why the cost of starting five years late is not five years of contributions but a much larger share of the final balance — the first few years are the ones that compound the longest.",
    },
    {
      question: "How is the required monthly contribution calculated?",
      answer:
        "By solving backwards. The calculator tests contributions and finds the smallest one whose projected balance reaches your target exactly at the horizon, using the same compounding assumptions as the forward projection. It is a search rather than a formula because contributions can step up annually, which breaks the closed-form annuity arithmetic. The answer is the minimum you would need every month from today.",
    },
    {
      question: "What does the cost of a five-year delay measure?",
      answer:
        "It compares two paths that end on the same date: one starts contributing today, the other starts five years from now. The difference in the final balance is the cost of the delay, and the extra monthly contribution needed shows what it would take to catch up afterwards. Catching up costs more than starting earlier for the same reason the delay is expensive — the missed years contained the highest-growth contributions.",
    },
    {
      question: "What is a realistic expected return for this kind of projection?",
      answer:
        "For a diversified portfolio, a long-run nominal figure in the 5–8% range is a common planning assumption, with the mix of assets determining the exact number. Real returns are lower, which is why the calculator also shows the value in today's dollars. The most useful sensitivity test is to run the projection a point or two lower and see how the target date or required contribution changes — the plan should still work if the return disappoints.",
    },
    {
      question: "Should contributions increase over time?",
      answer:
        "Very often yes. A contribution growth rate of 2–3% a year keeps pace with inflation and with salary increases, and it has a large effect on the final balance because later contributions are larger and still have years to compound. The step-up field models this: it raises the monthly payment once a year by the percentage you enter, which is a realistic pattern for most savers.",
    },
    {
      question: "How should I set a target amount?",
      answer:
        "Work back from the spending it needs to support rather than picking a round number. If a portfolio must fund $20,000 a year of real spending at a 4% withdrawal rate, the target is around $500,000 in today's dollars; inflate that to the future date at your inflation assumption and enter the nominal figure. Targets set in today's money understate the number you will actually need, often substantially over multi-decade horizons.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Time Horizon Investment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Horizon Investment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Plan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="initial"
                  label="Starting Amount"
                  value={initial}
                  onChange={setInitial}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="Amount already invested today."
                />
                <CompactInput
                  id="monthly"
                  label="Monthly Contribution"
                  value={monthly}
                  onChange={setMonthly}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="50"
                  tooltip="Amount added every month; it can step up annually in the advanced options."
                />
                <CompactInput
                  id="expected-return"
                  label="Expected Return"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-30"
                  max="40"
                  step="0.25"
                  tooltip="Nominal annual return before inflation and fees."
                />
                <CompactInput
                  id="years"
                  label="Horizon"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="0.5"
                  max="50"
                  step="1"
                  tooltip="How long the plan runs before the target date."
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
                  <SubSection title="Target & Escalation">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="target"
                        label="Target Amount"
                        value={target}
                        onChange={setTarget}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="10000"
                        tooltip="The balance you want to reach; used to solve for time and required contribution."
                      />
                      <CompactInput
                        id="current-age"
                        label="Current Age"
                        value={currentAge}
                        onChange={setCurrentAge}
                        onEnter={runCalculate}
                        suffix="yr"
                        min="16"
                        max="80"
                        step="1"
                        tooltip="Used to translate the time to target into an age."
                      />
                      <CompactInput
                        id="contribution-growth"
                        label="Contribution Step-Up"
                        value={contributionGrowth}
                        onChange={setContributionGrowth}
                        onEnter={runCalculate}
                        suffix="%"
                        min="-10"
                        max="20"
                        step="0.5"
                        tooltip="Annual increase in the monthly contribution; 2–3% keeps pace with inflation."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation"
                        value={inflation}
                        onChange={setInflation}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.1"
                        tooltip="Used to restate the final balance in today's purchasing power."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Contributions are invested monthly and the annual return is converted to a monthly rate, so the
                      projection compounds exactly as a real account would. The required monthly contribution is found by
                      search, which allows the step-up to be included. The delay comparison holds the end date fixed and
                      starts contributions five years later, keeping the same assumptions otherwise.
                    </p>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Value at Horizon</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.terminalValue)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.growthShare, 1)}% of it is growth · {money(results.realValue)} in today's dollars
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Contributed</span>
                <span className="font-extrabold text-foreground">{money(results.totalContributed)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Growth</span>
                <span className="font-extrabold text-emerald-600">{money(results.growth)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost of 5-Year Delay</span>
                <span className="font-extrabold text-destructive">{money(results.costOfDelay)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Horizon</th>
                    <th className="p-2.5 text-right w-[125px]">Value</th>
                    <th className="p-2.5 text-right w-[125px]">Contributed</th>
                    <th className="p-2.5 text-right w-[115px]">Growth</th>
                    <th className="p-2.5 pr-3 text-right w-[100px]">Growth Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.years} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.years} years</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.value)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.contributed)}</td>
                      <td className="p-2.5 text-right text-emerald-600">{money(row.growth)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.growthShare, 1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                {results.summary.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{item.label}</span>
                    <span className={`text-base font-bold ${item.tone || "text-foreground"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Time Horizon Investment Calculator?</h2>
            <p>
              A time horizon investment calculator projects a savings plan to a future date and, more usefully, solves for
              the two questions that actually govern planning: how long until the balance reaches the target, and how much
              must be contributed each month to get there by a chosen date. Time horizon is the most powerful variable in
              investing because compounding works on the money that has been invested longest, which is why an extra five
              years at the beginning is worth far more than an extra five years of contributions at the end.
            </p>
            <p>
              The tool also prices a delay. Starting five years later while keeping the same target date produces two numbers:
              the shortfall in the final balance and the extra monthly contribution that would be needed to close it. Most
              people underestimate both, because they think of a delay as losing five years of deposits rather than five years
              of compounding on those deposits.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Contributions are invested monthly, with the annual return converted to a monthly rate so the compounding
              matches how a real account behaves. If you set a step-up percentage, the contribution rises once a year, which
              models the common habit of increasing savings with inflation or salary. The projection runs for the horizon you
              choose and reports the final balance, the total contributed, and the split between contributions and growth.
            </p>
            <p>
              The target calculations run the same simulation backwards. To find the time required, the model keeps
              contributing until the balance crosses the target. To find the monthly amount required by a fixed date, it
              searches for the smallest contribution whose final balance reaches the target, doubling the test value until it
              is large enough and then halving the interval sixty times. The result is the minimum monthly commitment needed,
              not an estimate.
            </p>
            <p>
              The delay comparison holds the end date fixed. One path contributes from today; the other starts five years
              later, so it has five fewer years of contributions and — more importantly — five fewer years for the earliest
              contributions to compound. In the default scenario the difference is substantial: with $20,000 invested, $500 a
              month and a 7% return over 25 years the balance reaches roughly $500,000, and starting five years late removes
              about $138,000 of that — far more than the $30,000 of cash contributions the delay avoids.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the projected balance with the growth share and the real, inflation-adjusted value. The
              three statistics beside it give total contributions, total growth and the cost of a five-year delay. The table
              is a horizon ladder from five to thirty years, showing how both the balance and the growth share rise as time
              extends — the fastest way to see compounding in action.
            </p>
            <p>
              Summary Statistics adds the months and years until the target, the age you would reach it, the monthly
              contribution required to hit the target within the horizon, the delayed-path value, the extra monthly
              contribution needed to catch up, and progress towards the target as a percentage. A useful exercise is to leave
              the target fixed and shorten the horizon: the required monthly contribution rises steeply, which is the clearest
              demonstration that time and money are substitutes in a savings plan, with time being the cheaper of the two.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-horizon-investment-calculator" />
          <PopularCalculators exclude="/calculator/time-horizon-investment-calculator" />
        </div>
      </div>
    </>
  );
}
