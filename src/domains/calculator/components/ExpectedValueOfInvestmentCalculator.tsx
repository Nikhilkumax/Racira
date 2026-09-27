"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface EvInputs {
  investment: number;
  best: number;
  base: number;
  worst: number;
  bestProb: number;
  baseProb: number;
  worstProb: number;
}

const DEFAULTS: EvInputs = {
  investment: 10000,
  best: 30000,
  base: 12000,
  worst: 0,
  bestProb: 20,
  baseProb: 60,
  worstProb: 20,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface ScenarioRow {
  scenario: string;
  probability: number;
  outcome: number;
  profit: number;
  contribution: number;
}

interface EvResult {
  valid: boolean;
  errorMsg: string;
  normalized: boolean;
  expectedValue: number;
  expectedProfit: number;
  expectedRoi: number;
  standardDeviation: number;
  coefficient: number;
  lossProbability: number;
  gainProbability: number;
  expectedLoss: number;
  expectedGain: number;
  bestProfit: number;
  worstLoss: number;
  probWeightedBest: number;
  rows: ScenarioRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: EvInputs): EvResult {
  const investment = Math.max(0, i.investment);
  const raw = [Math.max(0, i.bestProb), Math.max(0, i.baseProb), Math.max(0, i.worstProb)];
  const total = raw.reduce((a, b) => a + b, 0);
  const p = total > 0 ? raw.map((v) => v / total) : [0.2, 0.6, 0.2];
  const outcomes = [i.best, i.base, i.worst];
  const normalized = Math.abs(total - 100) > 0.001;

  const expectedValue = p[0] * outcomes[0] + p[1] * outcomes[1] + p[2] * outcomes[2];
  const expectedProfit = expectedValue - investment;
  const expectedRoi = investment > 0 ? (expectedProfit / investment) * 100 : 0;

  const variance =
    p[0] * Math.pow(outcomes[0] - expectedValue, 2) +
    p[1] * Math.pow(outcomes[1] - expectedValue, 2) +
    p[2] * Math.pow(outcomes[2] - expectedValue, 2);
  const standardDeviation = Math.sqrt(variance);

  const rows: ScenarioRow[] = [
    { scenario: "Best case", probability: p[0], outcome: outcomes[0], profit: outcomes[0] - investment, contribution: p[0] * outcomes[0] },
    { scenario: "Base case", probability: p[1], outcome: outcomes[1], profit: outcomes[1] - investment, contribution: p[1] * outcomes[1] },
    { scenario: "Worst case", probability: p[2], outcome: outcomes[2], profit: outcomes[2] - investment, contribution: p[2] * outcomes[2] },
  ];

  const lossProbability = rows.filter((r) => r.profit < 0).reduce((acc, r) => acc + r.probability, 0) * 100;
  const gainProbability = rows.filter((r) => r.profit > 0).reduce((acc, r) => acc + r.probability, 0) * 100;
  const expectedLoss =
    lossProbability > 0
      ? rows.filter((r) => r.profit < 0).reduce((acc, r) => acc + r.probability * r.profit, 0) / (lossProbability / 100)
      : 0;
  const expectedGain =
    gainProbability > 0
      ? rows.filter((r) => r.profit > 0).reduce((acc, r) => acc + r.probability * r.profit, 0) / (gainProbability / 100)
      : 0;

  const valid =
    investment > 0 &&
    i.best >= 0 &&
    i.base >= 0 &&
    i.worst >= 0 &&
    i.bestProb >= 0 &&
    i.baseProb >= 0 &&
    i.worstProb >= 0 &&
    total > 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive investment amount, non-negative outcome values, and probabilities that do not all sit at zero.";

  return {
    valid,
    errorMsg,
    normalized,
    expectedValue,
    expectedProfit,
    expectedRoi,
    standardDeviation,
    coefficient: expectedValue > 0 ? (standardDeviation / expectedValue) * 100 : 0,
    lossProbability,
    gainProbability,
    expectedLoss,
    expectedGain,
    bestProfit: outcomes[0] - investment,
    worstLoss: outcomes[2] - investment,
    probWeightedBest: p[0] * (outcomes[0] - investment),
    rows,
    summary: [
      { label: "Investment", value: money(investment) },
      { label: "Best Case Outcome", value: money(outcomes[0]) },
      { label: "Base Case Outcome", value: money(outcomes[1]) },
      { label: "Worst Case Outcome", value: money(outcomes[2]) },
      { label: "Expected Value", value: money(expectedValue), tone: "text-primary" },
      { label: "Expected Profit", value: money(expectedProfit), tone: expectedProfit >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Expected ROI", value: fmt(expectedRoi, 2) + "%", tone: expectedRoi >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Standard Deviation", value: money(standardDeviation) },
      { label: "Coefficient of Variation", value: fmt((standardDeviation / Math.max(investment, 1)) * 100, 2) + "%" },
      { label: "Probability of Profit", value: fmt(gainProbability, 1) + "%", tone: "text-emerald-600" },
      { label: "Probability of Loss", value: fmt(lossProbability, 1) + "%", tone: "text-destructive" },
      { label: "Expected Gain If Up", value: money(expectedGain) },
      { label: "Expected Loss If Down", value: money(expectedLoss), tone: "text-destructive" },
      { label: "Best Case Profit", value: money(outcomes[0] - investment) },
      { label: "Worst Case Loss", value: money(Math.min(0, outcomes[2] - investment)), tone: "text-destructive" },
      { label: "Probability-Weighted Upside", value: money(p[0] * (outcomes[0] - investment)) },
      { label: "Probabilities Normalized", value: normalized ? "Yes" : "No" },
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

export default function ExpectedValueOfInvestmentCalculator() {
  const [investment, setInvestment] = useState(String(DEFAULTS.investment));
  const [best, setBest] = useState(String(DEFAULTS.best));
  const [base, setBase] = useState(String(DEFAULTS.base));
  const [worst, setWorst] = useState(String(DEFAULTS.worst));
  const [bestProb, setBestProb] = useState(String(DEFAULTS.bestProb));
  const [baseProb, setBaseProb] = useState(String(DEFAULTS.baseProb));
  const [worstProb, setWorstProb] = useState(String(DEFAULTS.worstProb));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): EvInputs => ({
    investment: parseFloat(investment) || 0,
    best: parseFloat(best) || 0,
    base: parseFloat(base) || 0,
    worst: parseFloat(worst) || 0,
    bestProb: parseFloat(bestProb) || 0,
    baseProb: parseFloat(baseProb) || 0,
    worstProb: parseFloat(worstProb) || 0,
  });

  const [results, setResults] = useState<EvResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setInvestment(String(DEFAULTS.investment));
    setBest(String(DEFAULTS.best));
    setBase(String(DEFAULTS.base));
    setWorst(String(DEFAULTS.worst));
    setBestProb(String(DEFAULTS.bestProb));
    setBaseProb(String(DEFAULTS.baseProb));
    setWorstProb(String(DEFAULTS.worstProb));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is expected value in investing?",
      answer:
        "Expected value is the probability-weighted average of every possible outcome. If a $10,000 investment returns $30,000 in the best case with 20% probability, $12,000 in the base case with 60% and nothing in the worst case with 20%, the expected value is $13,200 — the average result if the same bet were repeated many times. It is the single number that summarises a range of outcomes without pretending the range does not exist.",
    },
    {
      question: "Does a positive expected value guarantee a profit?",
      answer:
        "No, and that is the most important limitation. Expected value describes the average of many repetitions; a single investment happens once. A venture-style bet with a 10% chance of a 20-bagger and a 90% chance of total loss can have a spectacular expected value while losing money most of the time. Position sizing and the ability to survive the losing scenarios matter as much as the expected value itself.",
    },
    {
      question: "What is the difference between expected value and expected return?",
      answer:
        "They are the same calculation expressed differently. Expected value is the ending dollar amount; expected return is that amount converted into a profit percentage of the capital committed. This calculator reports both, plus the profit in dollars, because the percentage is easier to compare across deals while the dollar figure shows what is actually at stake.",
    },
    {
      question: "How should I think about the probability of loss?",
      answer:
        "It describes how often, not how badly. A strategy that loses 60% of the time but wins large sums when it wins can still be excellent; the expected loss conditional on losing tells you the size of the typical bad outcome. Read the two together with the expected gain conditional on winning — that pairing is the shape of the bet, and it usually matters more than the single expected value.",
    },
    {
      question: "Why does the calculator normalize probabilities?",
      answer:
        "Because scenario probabilities are estimates and rarely sum to exactly 100%. Entering 20%, 60% and 25% is easy to do by accident; rather than rejecting the input the tool rescales each probability by the total and reports that it did so. The normalized weights are what drive the expected value, so the relative likelihoods you entered are always preserved.",
    },
    {
      question: "How is the standard deviation used here?",
      answer:
        "It measures how widely the outcomes scatter around the expected value. Two investments with the same expected value can have very different dispersion, and the coefficient of variation — the standard deviation divided by the expected value — standardises that spread for comparison. Higher dispersion means more uncertainty, which should demand either a larger expected value or a smaller position.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Expected Value of Investment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Expected Value of Investment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment & Outcomes">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="investment"
                  label="Amount Invested"
                  value={investment}
                  onChange={setInvestment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="Capital committed; every outcome is compared against this figure."
                />
                <CompactInput
                  id="best"
                  label="Best Case Outcome"
                  value={best}
                  onChange={setBest}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="Total value received if the optimistic scenario happens."
                />
                <CompactInput
                  id="base"
                  label="Base Case Outcome"
                  value={base}
                  onChange={setBase}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="The most likely outcome in value terms."
                />
                <CompactInput
                  id="worst"
                  label="Worst Case Outcome"
                  value={worst}
                  onChange={setWorst}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="What you recover in the downside scenario; often zero for equity-like bets."
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
                  <SubSection title="Scenario Probabilities">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="best-prob"
                        label="Best Case Probability"
                        value={bestProb}
                        onChange={setBestProb}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="100"
                        step="1"
                        tooltip="Chance of the best case; probabilities are rescaled to sum to 100%."
                      />
                      <CompactInput
                        id="base-prob"
                        label="Base Case Probability"
                        value={baseProb}
                        onChange={setBaseProb}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="100"
                        step="1"
                        tooltip="Chance of the base case."
                      />
                      <CompactInput
                        id="worst-prob"
                        label="Worst Case Probability"
                        value={worstProb}
                        onChange={setWorstProb}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="100"
                        step="1"
                        tooltip="Chance of the worst case."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Reading the Numbers">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Expected value is the average of repeated bets, not a prediction of the single outcome you will get.
                      Because the probabilities are estimates, the tool reports the probability of loss and the typical size
                      of a loss alongside the headline figure: two bets with the same expected value can have completely
                      different shapes, and the shape is what determines whether the position is survivable.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Expected Value</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.expectedValue)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.expectedProfit)} expected profit · {fmt(results.expectedRoi, 2)}% expected ROI
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Probability of Loss</span>
                <span className="font-extrabold text-destructive">{fmt(results.lossProbability, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Standard Deviation</span>
                <span className="font-extrabold text-foreground">{money(results.standardDeviation)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Expected Loss If Down</span>
                <span className="font-extrabold text-destructive">{money(results.expectedLoss)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Scenario</th>
                    <th className="p-2.5 text-right w-[95px]">Probability</th>
                    <th className="p-2.5 text-right w-[115px]">Outcome</th>
                    <th className="p-2.5 text-right w-[115px]">Profit</th>
                    <th className="p-2.5 pr-3 text-right w-[125px]">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.scenario} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.scenario}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.probability * 100, 1)}%</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.outcome)}</td>
                      <td className={`p-2.5 text-right font-semibold ${row.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {money(row.profit)}
                      </td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.contribution)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Expected value</td>
                    <td className="p-2.5 text-right text-foreground">100%</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.expectedValue)}</td>
                    <td className={`p-2.5 text-right ${results.expectedProfit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {money(results.expectedProfit)}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.expectedValue)}</td>
                  </tr>
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
            <h2 className="text-2xl font-bold mb-3">What Is an Expected Value of Investment Calculator?</h2>
            <p>
              An expected value of investment calculator converts a set of scenarios into a single probability-weighted
              number. You supply the amount invested and what you expect to receive in the best, base and worst cases, along
              with the probability of each. The tool multiplies every outcome by its likelihood, adds the results, and reports
              the average outcome if the same investment were repeated many times.
            </p>
            <p>
              Expected value is the foundation of rational decision-making under uncertainty, and it exists precisely because
              the instinctive approach — focusing on the most likely outcome, or on the best case — produces systematically
              bad decisions. The tool also quantifies the shape of the distribution: how often the investment loses money, how
              large a typical loss is, and how widely the outcomes scatter around the average.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each outcome is multiplied by its probability and summed. In the default example, a $30,000 outcome at 20%,
              a $12,000 outcome at 60% and a zero outcome at 20% produce an expected value of $13,200 against a $10,000
              investment — $3,200 of expected profit, or 32%. Probabilities that do not sum to exactly 100% are rescaled
              proportionally rather than rejected, and the result records that normalisation happened.
            </p>
            <p>
              The risk statistics come from the same weights. The variance is the probability-weighted average of the squared
              deviations from the expected value, and its square root is the standard deviation, which has the same units as
              the outcomes themselves. Dividing that by the expected value gives a coefficient of variation for comparing
              bets of different sizes, and the loss probability is simply the combined weight of every scenario whose outcome
              is below the amount invested.
            </p>
            <p>
              Conditional figures add the texture that a single average hides. The expected gain if things go well is the
              probability-weighted average of the profitable scenarios; the expected loss if things go badly is the same
              calculation for the losing scenarios. Together they describe the bet: how often you lose, how much you lose when
              you do, and how much you win when you don&apos;t.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the expected value with the expected profit and return. The three statistics beside it
              give the probability of loss, the standard deviation and the expected loss conditional on losing. A positive
              expected value with a high loss probability describes a lottery-shaped bet — profitable on average, painful most
              of the time — which is a position-sizing problem as much as a valuation one.
            </p>
            <p>
              The table lists each scenario with its probability, outcome, profit and probability-weighted contribution, so you
              can see exactly which scenario is driving the result. Summary Statistics adds the best and worst case profits,
              the probability of profit, the expected gain if the investment works and the coefficient of variation.
              The most useful stress test is to move probability between scenarios while holding the outcomes fixed: shifting
              ten points from the best case to the worst case is often enough to turn a comfortable expected value into a
              marginal one.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/expected-value-of-investment-calculator" />
          <PopularCalculators exclude="/calculator/expected-value-of-investment-calculator" />
        </div>
      </div>
    </>
  );
}
