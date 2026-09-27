"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface MonteCarloInputs {
  currentAge: number;
  retirementAge: number;
  portfolio: number;
  spending: number;
  contribution: number;
  expectedReturn: number;
  volatility: number;
  inflation: number;
  simulations: number;
  seed: number;
  horizonAge: number;
}

const DEFAULTS: MonteCarloInputs = {
  currentAge: 40,
  retirementAge: 65,
  portfolio: 400000,
  spending: 60000,
  contribution: 12000,
  expectedReturn: 7,
  volatility: 15,
  inflation: 2.5,
  simulations: 1000,
  seed: 12345,
  horizonAge: 95,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

/** Deterministic 32-bit PRNG so the same inputs always produce the same paths. */
function mulberry32(seed: number) {
  let a = Math.floor(seed) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PercentileRow {
  label: string;
  terminal: number;
  real: number;
  survived: boolean;
}

interface MonteCarloResult {
  valid: boolean;
  errorMsg: string;
  successRate: number;
  simulationsRun: number;
  yearsToRetirement: number;
  retirementYears: number;
  medianTerminal: number;
  medianReal: number;
  percentile5: number;
  percentile10: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
  medianDepletionAge: number;
  failureRate: number;
  medianSpendingMultiple: number;
  averageTerminal: number;
  rows: PercentileRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: MonteCarloInputs): MonteCarloResult {
  const yearsToRetirement = Math.max(0, Math.round(i.retirementAge - i.currentAge));
  const retirementYears = Math.max(1, Math.min(60, Math.round(i.horizonAge - i.retirementAge)));
  const sims = Math.max(100, Math.min(5000, Math.round(i.simulations)));
  const rand = mulberry32(i.seed);
  const mean = i.expectedReturn / 100;
  const vol = Math.max(0, i.volatility) / 100;
  const inflation = Math.max(0, i.inflation) / 100;
  const spendingAtRetirement = Math.max(0, i.spending) * Math.pow(1 + inflation, yearsToRetirement);
  const contribution = Math.max(0, i.contribution);

  const gaussian = () => {
    const u = Math.max(rand(), 1e-9);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const terminals: number[] = [];
  const depletionAges: number[] = [];
  let successes = 0;

  for (let s = 0; s < sims; s++) {
    let balance = Math.max(0, i.portfolio);
    for (let y = 0; y < yearsToRetirement; y++) {
      const r = mean + vol * gaussian();
      balance = balance * (1 + r) + contribution;
    }
    let spending = spendingAtRetirement;
    let depletedAt = 0;
    for (let y = 0; y < retirementYears; y++) {
      const r = mean + vol * gaussian();
      balance = balance * (1 + r) - spending;
      spending *= 1 + inflation;
      if (balance <= 0 && depletedAt === 0) depletedAt = Math.round(i.retirementAge + y + 1);
    }
    if (balance > 0) {
      successes++;
      terminals.push(balance);
    } else {
      terminals.push(0);
      depletionAges.push(depletedAt || Math.round(i.retirementAge + retirementYears));
    }
  }

  const sorted = [...terminals].sort((a, b) => a - b);
  const pick = (p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))];
  const medianTerminal = pick(0.5);
  const totalYears = yearsToRetirement + retirementYears;
  const deflator = Math.pow(1 + inflation, totalYears);
  const real = (v: number) => v / deflator;

  const rows: PercentileRow[] = [
    { label: "5th percentile (poor markets)", terminal: pick(0.05), real: real(pick(0.05)), survived: pick(0.05) > 0 },
    { label: "10th percentile", terminal: pick(0.1), real: real(pick(0.1)), survived: pick(0.1) > 0 },
    { label: "25th percentile", terminal: pick(0.25), real: real(pick(0.25)), survived: pick(0.25) > 0 },
    { label: "Median (50th)", terminal: medianTerminal, real: real(medianTerminal), survived: medianTerminal > 0 },
    { label: "75th percentile", terminal: pick(0.75), real: real(pick(0.75)), survived: true },
    { label: "90th percentile", terminal: pick(0.9), real: real(pick(0.9)), survived: true },
  ];

  const valid =
    i.currentAge > 0 &&
    i.retirementAge > i.currentAge &&
    i.portfolio >= 0 &&
    i.spending > 0 &&
    i.contribution >= 0 &&
    i.expectedReturn > -20 &&
    i.expectedReturn < 40 &&
    i.volatility >= 0 &&
    i.volatility <= 60 &&
    i.inflation >= 0 &&
    i.inflation <= 20 &&
    i.horizonAge > i.retirementAge;
  const errorMsg = valid
    ? ""
    : "Enter a retirement age above your current age, a plan horizon beyond retirement, a positive spending figure, and return, volatility and inflation assumptions within plausible ranges.";

  const medianDepletionAge =
    depletionAges.length > 0
      ? [...depletionAges].sort((a, b) => a - b)[Math.floor(depletionAges.length / 2)]
      : 0;

  return {
    valid,
    errorMsg,
    successRate: (successes / sims) * 100,
    simulationsRun: sims,
    yearsToRetirement,
    retirementYears,
    medianTerminal,
    medianReal: real(medianTerminal),
    percentile5: pick(0.05),
    percentile10: pick(0.1),
    percentile25: pick(0.25),
    percentile75: pick(0.75),
    percentile90: pick(0.9),
    medianDepletionAge,
    failureRate: 100 - (successes / sims) * 100,
    medianSpendingMultiple: i.spending > 0 ? medianTerminal / (i.spending * Math.pow(1 + inflation, yearsToRetirement)) : 0,
    averageTerminal: terminals.reduce((a, b) => a + b, 0) / sims,
    rows,
    summary: [
      { label: "Success Rate", value: fmt((successes / sims) * 100, 1) + "%", tone: "text-primary" },
      { label: "Failure Rate", value: fmt(100 - (successes / sims) * 100, 1) + "%", tone: "text-destructive" },
      { label: "Accumulation Years", value: String(yearsToRetirement) },
      { label: "Retirement Years", value: String(retirementYears) },
      { label: "Simulations Run", value: sims.toLocaleString("en-US") },
      { label: "Median Ending Balance", value: money(medianTerminal) },
      { label: "Median in Today's Dollars", value: money(real(medianTerminal)) },
      { label: "Average Ending Balance", value: money(terminals.reduce((a, b) => a + b, 0) / sims) },
      { label: "5th Percentile", value: money(pick(0.05)) },
      { label: "10th Percentile", value: money(pick(0.1)) },
      { label: "90th Percentile", value: money(pick(0.9)), tone: "text-emerald-600" },
      { label: "Median Shortfall Age", value: medianDepletionAge > 0 ? String(medianDepletionAge) : "No shortfall" },
      {
        label: "Median Ending vs Spending",
        value: i.spending > 0 ? fmt(medianTerminal / (i.spending * Math.pow(1 + inflation, yearsToRetirement)), 2) + "x" : "—",
      },
      { label: "Seed", value: String(Math.round(i.seed)) },
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

export default function MonteCarloRetirementSimulationSimple() {
  const [currentAge, setCurrentAge] = useState(String(DEFAULTS.currentAge));
  const [retirementAge, setRetirementAge] = useState(String(DEFAULTS.retirementAge));
  const [portfolio, setPortfolio] = useState(String(DEFAULTS.portfolio));
  const [spending, setSpending] = useState(String(DEFAULTS.spending));
  const [contribution, setContribution] = useState(String(DEFAULTS.contribution));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [volatility, setVolatility] = useState(String(DEFAULTS.volatility));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [simulations, setSimulations] = useState(String(DEFAULTS.simulations));
  const [seed, setSeed] = useState(String(DEFAULTS.seed));
  const [horizonAge, setHorizonAge] = useState(String(DEFAULTS.horizonAge));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): MonteCarloInputs => ({
    currentAge: parseFloat(currentAge) || 0,
    retirementAge: parseFloat(retirementAge) || 0,
    portfolio: parseFloat(portfolio) || 0,
    spending: parseFloat(spending) || 0,
    contribution: parseFloat(contribution) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    volatility: parseFloat(volatility) || 0,
    inflation: parseFloat(inflation) || 0,
    simulations: parseFloat(simulations) || 1000,
    seed: parseFloat(seed) || 0,
    horizonAge: parseFloat(horizonAge) || 0,
  });

  const [results, setResults] = useState<MonteCarloResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setCurrentAge(String(DEFAULTS.currentAge));
    setRetirementAge(String(DEFAULTS.retirementAge));
    setPortfolio(String(DEFAULTS.portfolio));
    setSpending(String(DEFAULTS.spending));
    setContribution(String(DEFAULTS.contribution));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setVolatility(String(DEFAULTS.volatility));
    setInflation(String(DEFAULTS.inflation));
    setSimulations(String(DEFAULTS.simulations));
    setSeed(String(DEFAULTS.seed));
    setHorizonAge(String(DEFAULTS.horizonAge));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What does a Monte Carlo retirement simulation do?",
      answer:
        "It runs your retirement plan hundreds or thousands of times, each time drawing a different sequence of annual market returns from the return and volatility assumptions you supply. Every run produces one possible future; the share of runs that end with money left over is the success rate. That matters because a single average-return projection hides sequence risk: two paths with the same average return can end decades apart if the bad years land early.",
    },
    {
      question: "Why is the result stable when I press Calculate again?",
      answer:
        "The simulator uses a seeded random number generator rather than true randomness. The same inputs and the same seed always produce exactly the same set of simulated futures, which makes the tool reproducible and prevents the numbers from jumping around on a re-render. Change the seed to draw a different set of paths and see how much the success rate moves.",
    },
    {
      question: "How should I read the success rate?",
      answer:
        "A 90% success rate means roughly one in ten simulated futures ran out of money before the plan horizon. Most planners treat 80–95% as the practical range, with the exact target depending on how flexible the spending plan is. Remember that the failure paths are not necessarily catastrophic in reality: most retirees who see trouble would adjust spending, which this fixed-spending model does not allow.",
    },
    {
      question: "What return and volatility should I assume?",
      answer:
        "Diversified equity-heavy portfolios have historically delivered around 7–10% nominal returns with annual volatility near 15%; balanced portfolios sit lower on both. Enter nominal figures because the calculator applies inflation to spending separately. The volatility input drives the spread of outcomes far more than the average return does, so it is worth testing 10%, 15% and 20% to see how much the success rate depends on it.",
    },
    {
      question: "Does the simulator model taxes or Social Security?",
      answer:
        "No. Contributions are treated as invested at the end of each year and withdrawals are treated as spending, both without tax. Social Security, pensions and annuities can be handled by reducing your required spending figure to the amount the portfolio must cover. Adding a tax haircut to the withdrawal is a reasonable simplification if the account is mostly pre-tax.",
    },
    {
      question: "Why do the percentile endings look so wide?",
      answer:
        "Because compounding amplifies differences in early returns. A run that averages 9% a year for 25 years ends several times higher than one that averages 5%, and the spread widens with the volatility assumption. The median matters most for planning; the 5th and 10th percentiles show what the poor-market scenarios look like, and the 90th percentile shows how much upside the plan could leave unused.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Monte Carlo Retirement Simulation (Simple)" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Monte Carlo Retirement Simulation (Simple)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Plan Basics">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="current-age"
                  label="Current Age"
                  value={currentAge}
                  onChange={setCurrentAge}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="18"
                  max="90"
                  step="1"
                  tooltip="Your age today; the accumulation phase runs from here to retirement."
                />
                <CompactInput
                  id="retirement-age"
                  label="Retirement Age"
                  value={retirementAge}
                  onChange={setRetirementAge}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="30"
                  max="90"
                  step="1"
                  tooltip="The age contributions stop and withdrawals begin."
                />
                <CompactInput
                  id="portfolio"
                  label="Current Portfolio"
                  value={portfolio}
                  onChange={setPortfolio}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="10000"
                  tooltip="Invested balance today, across all retirement accounts."
                />
                <CompactInput
                  id="spending"
                  label="Annual Spending"
                  value={spending}
                  onChange={setSpending}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="First-year retirement spending in today's dollars; it is inflated to the retirement year."
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
                  <SubSection title="Assumptions">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="contribution"
                        label="Annual Contribution"
                        value={contribution}
                        onChange={setContribution}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="1000"
                        tooltip="Invested at the end of each year until retirement."
                      />
                      <CompactInput
                        id="expected-return"
                        label="Expected Return"
                        value={expectedReturn}
                        onChange={setExpectedReturn}
                        onEnter={runCalculate}
                        suffix="%"
                        min="-10"
                        max="30"
                        step="0.5"
                        tooltip="Nominal average annual return before fees and taxes."
                      />
                      <CompactInput
                        id="volatility"
                        label="Volatility"
                        value={volatility}
                        onChange={setVolatility}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="40"
                        step="1"
                        tooltip="Standard deviation of annual returns; 15% is typical for an equity-heavy portfolio."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation"
                        value={inflation}
                        onChange={setInflation}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="10"
                        step="0.1"
                        tooltip="Applied to spending every year of retirement."
                      />
                      <CompactInput
                        id="simulations"
                        label="Simulations"
                        value={simulations}
                        onChange={setSimulations}
                        onEnter={runCalculate}
                        min="100"
                        max="5000"
                        step="100"
                        tooltip="More runs give a smoother success rate; 1,000 is plenty for a planning decision."
                      />
                      <CompactInput
                        id="seed"
                        label="Random Seed"
                        value={seed}
                        onChange={setSeed}
                        onEnter={runCalculate}
                        min="1"
                        step="1"
                        tooltip="Change it to draw a different set of futures. The same seed always reproduces the same result."
                      />
                      <CompactInput
                        id="horizon-age"
                        label="Plan To Age"
                        value={horizonAge}
                        onChange={setHorizonAge}
                        onEnter={runCalculate}
                        suffix="yr"
                        min="70"
                        max="110"
                        step="1"
                        tooltip="The age the portfolio must fund through; failures are counted before this point."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Returns are drawn from a normal distribution each year with the mean and volatility you set — no
                      fat tails, no mean reversion, no fees or taxes. Spending is fixed in real terms, so the model does not
                      allow the retiree to trim withdrawals after a bad year, which makes it a deliberately conservative
                      reading of the plan&apos;s resilience.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Plan Success Rate</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{fmt(results.successRate, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                of {results.simulationsRun.toLocaleString("en-US")} simulated futures end with money still invested
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Median Ending</span>
                <span className="font-extrabold text-foreground">{money(results.medianTerminal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">10th Percentile</span>
                <span className="font-extrabold text-destructive">{money(results.percentile10)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In Today's Dollars</span>
                <span className="font-extrabold text-emerald-600">{money(results.medianReal)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Outcome Percentile</th>
                    <th className="p-2.5 text-right w-[150px]">Ending Balance</th>
                    <th className="p-2.5 text-right w-[140px]">Today's Dollars</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.terminal)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.real)}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.survived ? "text-emerald-600" : "text-destructive"}`}>
                        {row.survived ? "Funded" : "Depleted"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Monte Carlo Retirement Simulation?</h2>
            <p>
              A Monte Carlo retirement simulation answers a different question from a normal retirement projection. A
              projection says &quot;if you earn 7% every year, here is what you will have&quot;. A simulation says &quot;if
              markets deliver a different sequence of returns every year, in how many futures does the money last?&quot;. It
              runs the same plan many times with randomly drawn annual returns and counts the runs that survive, producing a
              success rate rather than a single balance.
            </p>
            <p>
              The distinction is called sequence risk, and it is why simulations exist. Two paths can average exactly 7% a
              year over 30 years and end with completely different balances if the poor returns arrive in the first decade,
              when there is a large balance to lose and no new contributions coming in. Estimating that risk with one average
              return hides the danger entirely.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator builds two phases. During accumulation, each simulated year multiplies the balance by a return
              drawn from a normal distribution with the mean and volatility you supply, then adds the annual contribution.
              During retirement, the balance continues to earn the drawn return while spending is withdrawn and raised with
              inflation each year. A run fails if the balance reaches zero before the plan horizon.
            </p>
            <p>
              The random draws come from a seeded generator, so the simulation is deterministic: the same inputs and seed
              always produce the same result. That is important for a planning tool, because it means the success rate cannot
              flicker between renders and the output can be reproduced. Changing the seed draws a different set of futures,
              which is a useful stress test in itself — if the success rate swings widely with the seed, the number of paths
              is too small or the plan sits near a knife edge.
            </p>
            <p>
              The model deliberately ignores fees, taxes, Social Security and spending flexibility. Each of those omissions is
              conservative in one direction and optimistic in another: fees and taxes make the result worse, while the ability
              to trim spending in a bad year — something almost every real retiree does — makes it better. Treat the output as
              the pure market-risk picture.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the success rate: the share of simulated futures that still had money at the plan
              horizon. The three statistics beside it give the median ending balance, the 10th percentile — the outcome one
              in ten futures falls below — and the median expressed in today&apos;s purchasing power, which is the number
              that actually describes the lifestyle the plan supports.
            </p>
            <p>
              The table lays out six percentiles from the 5th to the 90th, each with the ending balance, its real value and
              whether that path funded retirement. Summary Statistics adds the failure rate, the accumulation and retirement
              lengths, the average ending balance, the age of the median shortfall when a shortfall exists, and how many
              years of spending the median ending balance represents. A common experiment is to raise spending by $5,000 and
              watch the success rate fall — the drop tells you how much margin the plan really has.
            </p>
            <p className="text-sm text-muted-foreground">
              Data vintage: this is a simplified model of market risk, not a forecast. Return and volatility assumptions are
              yours to set; historical US equity returns have averaged roughly 7% real with annual volatility near 15%, but
              the simulation makes no claim about future returns.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/monte-carlo-retirement-simulation-simple" />
          <PopularCalculators exclude="/calculator/monte-carlo-retirement-simulation-simple" />
        </div>
      </div>
    </>
  );
}
