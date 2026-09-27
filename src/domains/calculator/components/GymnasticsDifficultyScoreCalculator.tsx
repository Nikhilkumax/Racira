"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type CountingMode = "wag" | "mag" | "custom";

/** FIG element-value scale: A = 0.1 through H = 0.8, in 0.1 steps. */
const LETTERS: { letter: string; value: number }[] = [
  { letter: "A", value: 0.1 },
  { letter: "B", value: 0.2 },
  { letter: "C", value: 0.3 },
  { letter: "D", value: 0.4 },
  { letter: "E", value: 0.5 },
  { letter: "F", value: 0.6 },
  { letter: "G", value: 0.7 },
  { letter: "H", value: 0.8 },
];

const MODES: { key: CountingMode; label: string; limit: number }[] = [
  { key: "wag", label: "Women's — 8 best elements", limit: 8 },
  { key: "mag", label: "Men's — 10 best elements", limit: 10 },
  { key: "custom", label: "Custom limit", limit: 8 },
];

interface GymInputs {
  mode: CountingMode;
  customLimit: number;
  elementsInRoutine: number;
  connectionValue: number;
  compositionCredit: number;
  counts: Record<string, number>;
  executionScore: number;
  neutralDeductions: number;
  decimals: number;
  useExecution: boolean;
}

const DEFAULTS: GymInputs = {
  mode: "wag",
  customLimit: 8,
  elementsInRoutine: 8,
  connectionValue: 0.3,
  compositionCredit: 0.5,
  counts: { A: 0, B: 0, C: 2, D: 3, E: 2, F: 1, G: 0, H: 0 },
  executionScore: 8.0,
  neutralDeductions: 0,
  decimals: 2,
  useExecution: true,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface LetterRow {
  letter: string;
  value: number;
  count: number;
  total: number;
  counted: boolean;
}

interface GymResult {
  valid: boolean;
  errorMsg: string;
  limit: number;
  poolSize: number;
  poolValue: number;
  countedValue: number;
  countedCount: number;
  uncountedCount: number;
  lostValue: number;
  letterRows: LetterRow[];
  difficultyScore: number;
  finalScore: number;
  pctOfPool: number;
  breakdown: BreakdownRow[];
}

function calculateGymnastics(input: GymInputs): GymResult {
  const modeSpec = MODES.find((m) => m.key === input.mode) || MODES[0];
  const limit = input.mode === "custom" ? Math.max(1, Math.round(input.customLimit)) : modeSpec.limit;

  const blank = (errorMsg: string): GymResult => ({
    valid: false,
    errorMsg,
    limit,
    poolSize: 0,
    poolValue: 0,
    countedValue: 0,
    countedCount: 0,
    uncountedCount: 0,
    lostValue: 0,
    letterRows: [],
    difficultyScore: 0,
    finalScore: 0,
    pctOfPool: 0,
    breakdown: [],
  });

  const counts = LETTERS.map((l) => ({
    letter: l.letter,
    value: l.value,
    count: Math.max(0, Math.round(input.counts[l.letter] || 0)),
  }));
  const poolSize = counts.reduce((sum, c) => sum + c.count, 0);
  if (poolSize === 0) return blank("Enter at least one element in the value builder to score the routine.");

  const numeric = [
    input.elementsInRoutine,
    input.connectionValue,
    input.compositionCredit,
    input.executionScore,
    input.neutralDeductions,
    input.decimals,
  ];
  if (!numeric.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to score the routine.");
  if (input.elementsInRoutine <= 0) return blank("Elements in the routine must be greater than zero.");
  if (input.connectionValue < 0 || input.compositionCredit < 0) return blank("Connection and composition credits cannot be negative.");
  if (input.neutralDeductions < 0) return blank("Neutral deductions cannot be negative.");
  if (input.executionScore < 0 || input.executionScore > 10) return blank("Execution score should be between 0 and 10.");

  const d = Math.max(0, Math.min(2, input.decimals));

  // FIG rules count only the highest-value elements, so the pool is sorted
  // descending and everything past the counting limit is discarded.
  const elements: number[] = [];
  counts.forEach((c) => {
    for (let i = 0; i < c.count; i += 1) elements.push(c.value);
  });
  elements.sort((a, b) => b - a);

  const poolValue = elements.reduce((sum, v) => sum + v, 0);
  const counted = elements.slice(0, limit);
  const countedValue = counted.reduce((sum, v) => sum + v, 0);
  const uncountedCount = Math.max(0, elements.length - counted.length);
  const lostValue = Math.max(0, poolValue - countedValue);

  const letterRows: LetterRow[] = counts.map((c) => ({
    letter: c.letter,
    value: c.value,
    count: c.count,
    total: c.count * c.value,
    counted: counted.filter((v) => Math.abs(v - c.value) < 1e-9).length > 0,
  }));

  const difficultyScore = countedValue + input.connectionValue + input.compositionCredit - input.neutralDeductions;
  const finalScore = difficultyScore + (input.useExecution ? input.executionScore : 0);
  const pctOfPool = poolValue > 0 ? (countedValue / poolValue) * 100 : 0;

  const breakdown: BreakdownRow[] = [
    { label: "Elements entered in the builder", value: fmt(poolSize, 0) },
    { label: "Counting limit applied", value: `${fmt(limit, 0)} best elements` },
    { label: "Element values entered (all)", value: fmt(poolValue, d) },
    { label: `Value of the ${fmt(limit, 0)} counting elements`, value: fmt(countedValue, d), highlight: true },
    { label: "Elements outside the limit", value: `${fmt(uncountedCount, 0)} worth ${fmt(lostValue, d)}` },
    { label: "Connection value", value: fmt(input.connectionValue, d) },
    { label: "Composition / element-group credit", value: fmt(input.compositionCredit, d) },
    { label: "Neutral deductions", value: `−${fmt(input.neutralDeductions, d)}` },
    { label: "Difficulty score (D-score)", value: fmt(difficultyScore, d), highlight: true },
    {
      label: "Execution score (E-score)",
      value: input.useExecution ? fmt(input.executionScore, d) : "not used",
    },
    { label: "Final score (D + E)", value: input.useExecution ? fmt(finalScore, d) : fmt(difficultyScore, d) },
  ];

  return {
    valid: true,
    errorMsg: "",
    limit,
    poolSize,
    poolValue,
    countedValue,
    countedCount: counted.length,
    uncountedCount,
    lostValue,
    letterRows,
    difficultyScore,
    finalScore,
    pctOfPool,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function GymnasticsDifficultyScoreCalculator() {
  const [mode, setMode] = useState<string>(DEFAULTS.mode);
  const [customLimit, setCustomLimit] = useState(String(DEFAULTS.customLimit));
  const [elementsInRoutine, setElementsInRoutine] = useState(String(DEFAULTS.elementsInRoutine));
  const [connectionValue, setConnectionValue] = useState(String(DEFAULTS.connectionValue));
  const [compositionCredit, setCompositionCredit] = useState(String(DEFAULTS.compositionCredit));
  const [counts, setCounts] = useState<Record<string, number>>({ ...DEFAULTS.counts });
  const [executionScore, setExecutionScore] = useState(String(DEFAULTS.executionScore));
  const [neutralDeductions, setNeutralDeductions] = useState(String(DEFAULTS.neutralDeductions));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [useExecution, setUseExecution] = useState(DEFAULTS.useExecution);
  const [showAdv, setShowAdv] = useState(false);

  const setLetter = (letter: string, v: string) => {
    const n = parseInt(v, 10);
    setCounts((prev) => ({ ...prev, [letter]: Number.isFinite(n) && n > 0 ? n : 0 }));
  };

  const getInputs = (): GymInputs => ({
    mode: mode as CountingMode,
    customLimit: parseFloat(customLimit) || 1,
    elementsInRoutine: parseFloat(elementsInRoutine) || 0,
    connectionValue: parseFloat(connectionValue) || 0,
    compositionCredit: parseFloat(compositionCredit) || 0,
    counts: { ...counts },
    executionScore: parseFloat(executionScore) || 0,
    neutralDeductions: parseFloat(neutralDeductions) || 0,
    decimals: parseFloat(decimals),
    useExecution,
  });

  const [calcInputs, setCalcInputs] = useState<GymInputs>(() => DEFAULTS);
  const [results, setResults] = useState<GymResult>(() => calculateGymnastics(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateGymnastics(inputs));
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setCustomLimit(String(DEFAULTS.customLimit));
    setElementsInRoutine(String(DEFAULTS.elementsInRoutine));
    setConnectionValue(String(DEFAULTS.connectionValue));
    setCompositionCredit(String(DEFAULTS.compositionCredit));
    setCounts({ ...DEFAULTS.counts });
    setExecutionScore(String(DEFAULTS.executionScore));
    setNeutralDeductions(String(DEFAULTS.neutralDeductions));
    setDecimals(String(DEFAULTS.decimals));
    setUseExecution(DEFAULTS.useExecution);
    setCalcInputs(DEFAULTS);
    setResults(calculateGymnastics(DEFAULTS));
  };

  const routineNum = parseFloat(elementsInRoutine);
  const cvNum = parseFloat(connectionValue);
  const crNum = parseFloat(compositionCredit);
  const errors = {
    elementsInRoutine: !Number.isFinite(routineNum) || routineNum <= 0 ? "Must be greater than zero" : "",
    connectionValue: !Number.isFinite(cvNum) || cvNum < 0 ? "Cannot be negative" : "",
    compositionCredit: !Number.isFinite(crNum) || crNum < 0 ? "Cannot be negative" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const enteredCount = LETTERS.reduce((sum, l) => sum + (counts[l.letter] || 0), 0);
  const mismatch = results.valid && enteredCount !== calcInputs.elementsInRoutine;

  const faqs = [
    {
      question: "How is a gymnastics difficulty score built up?",
      answer:
        "The difficulty score, usually written as the D-score, is the value of the counting elements plus any connection value and element-group or composition credit, less neutral deductions for things such as going out of bounds or overtime. Element values follow the FIG letter scale, where A is worth 0.1 and each letter steps up by a tenth, so an H element is worth 0.8.",
    },
    {
      question: "Why does the calculator only count some of the elements?",
      answer:
        "Because the Code of Points caps how many element values can be counted: women's routines count the eight highest values and men's routines the ten highest. Anything below the cut-off contributes nothing, which is why a routine with many easy elements can score lower than one with a few hard ones. The calculator sorts every value you enter, keeps the highest ones and shows exactly how much value was discarded.",
    },
    {
      question: "What is connection value?",
      answer:
        "Connection value rewards linking certain elements together without a pause or extra step, which is technically far harder than performing the same elements in isolation. It is credited in tenths of a point by the D-panel according to the connection tables in the current Code of Points, so enter the figure your routine earns rather than estimating it here.",
    },
    {
      question: "How does the D-score become a final score?",
      answer:
        "The final score is the difficulty score plus the execution score, with penalties applied separately by the judges. Execution is scored out of ten and reflects how cleanly the routine was performed, judged on body position, amplitude, landings and artistry. This calculator adds the two so you can see the target output when you are setting a routine for a meet.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Gymnastics Difficulty Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gymnastics Difficulty Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Counting Rules">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="counting-mode"
                  label="Counting Limit"
                  value={mode}
                  onChange={setMode}
                  options={MODES.map((m) => ({ value: m.key, label: m.label }))}
                  tooltip="How many of the highest element values are counted."
                />
                <CompactInput
                  id="elements-in-routine"
                  label="Elements in Routine"
                  value={elementsInRoutine}
                  onChange={setElementsInRoutine}
                  onEnter={runCalculate}
                  min="1"
                  step="1"
                  error={errors.elementsInRoutine}
                  tooltip="Total elements performed, used to check how many values were counted."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="connection-value"
                  label="Connection Value"
                  value={connectionValue}
                  onChange={setConnectionValue}
                  onEnter={runCalculate}
                  min="0"
                  step="0.1"
                  error={errors.connectionValue}
                  hint="Credited in tenths for linked elements."
                  tooltip="Connection value awarded by the D-panel."
                />
                <CompactInput
                  id="composition-credit"
                  label="Composition Credit"
                  value={compositionCredit}
                  onChange={setCompositionCredit}
                  onEnter={runCalculate}
                  min="0"
                  step="0.1"
                  error={errors.compositionCredit}
                  hint="Element-group or composition requirement credit."
                  tooltip="Credit for fulfilling the composition requirements in force."
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
                  <SubSection title="Element Value Builder (A 0.1 → H 0.8)">
                    <div className="grid grid-cols-4 gap-3">
                      {LETTERS.map((l) => (
                        <CompactInput
                          key={l.letter}
                          id={`count-${l.letter}`}
                          label={`${l.letter} (${l.value.toFixed(1)})`}
                          value={String(counts[l.letter] ?? 0)}
                          onChange={(v) => setLetter(l.letter, v)}
                          onEnter={runCalculate}
                          min="0"
                          step="1"
                          tooltip={`How many ${l.letter} elements worth ${l.value.toFixed(1)} are in the routine.`}
                        />
                      ))}
                    </div>
                  </SubSection>
                  <SubSection title="Scoring">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="execution-score"
                        label="Execution Score"
                        value={executionScore}
                        onChange={setExecutionScore}
                        onEnter={runCalculate}
                        min="0"
                        max="10"
                        step="0.05"
                        tooltip="E-score out of ten, used for the final score."
                      />
                      <CompactInput
                        id="neutral-deductions"
                        label="Neutral Deductions"
                        value={neutralDeductions}
                        onChange={setNeutralDeductions}
                        onEnter={runCalculate}
                        min="0"
                        step="0.1"
                        tooltip="Penalties for bounds, overtime and similar faults."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {mode === "custom" && (
                        <CompactInput
                          id="custom-limit"
                          label="Custom Counting Limit"
                          value={customLimit}
                          onChange={setCustomLimit}
                          onEnter={runCalculate}
                          min="1"
                          step="1"
                          tooltip="How many of the highest element values count."
                        />
                      )}
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="How many digits to show after the decimal point."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Final Score">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="use-execution"
                        label="Add Execution Score"
                        value={useExecution ? "yes" : "no"}
                        onChange={(v) => setUseExecution(v === "yes")}
                        options={[
                          { value: "yes", label: "Yes — show final score" },
                          { value: "no", label: "No — difficulty only" },
                        ]}
                        tooltip="Turning this off leaves the output as a pure D-score."
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
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Difficulty Score</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.difficultyScore, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.countedValue, calcInputs.decimals)} from elements + ${fmt(calcInputs.connectionValue, 1)} connection + ${fmt(calcInputs.compositionCredit, 1)} composition credit`
                  : "Fix the highlighted inputs to see the score"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Element Value</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.countedValue, calcInputs.decimals) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Value Lost</span>
                <span className={`font-extrabold ${results.lostValue > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                  {results.valid ? fmt(results.lostValue, calcInputs.decimals) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Final Score</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.finalScore, calcInputs.decimals) : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Score Element</th>
                    <th className="p-2.5 pr-3 text-right w-[200px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter the routine's element values to score it.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Difficulty score</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {fmt(results.difficultyScore, calcInputs.decimals)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Element values entered</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.poolSize, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Elements counted</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.countedCount, 0)} of ${fmt(results.poolSize, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">All element values</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.poolValue, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Share of value counted</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.pctOfPool, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Connection value</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(calcInputs.connectionValue, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Composition credit</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(calcInputs.compositionCredit, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Execution score</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && calcInputs.useExecution ? fmt(calcInputs.executionScore, calcInputs.decimals) : "not used"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final score (D + E)</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.finalScore, calcInputs.decimals) : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Values follow the FIG element scale (A 0.1 to H 0.8) with the counting limits in the current Code of Points:
                  eight highest elements for women, ten for men
                  {mismatch ? `, and ${fmt(calcInputs.elementsInRoutine, 0)} elements in the routine against ${fmt(enteredCount, 0)} values entered` : ""}.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Gymnastics Difficulty Score Calculator?</h2>
            <p>
              A gymnastics difficulty score calculator assembles the D-score of a routine from its element values, connection
              value and composition credit, applies the counting limit that decides how many elements can score, subtracts neutral
              deductions and — when an execution score is supplied — shows the final score. It is a planning tool for gymnasts and
              coaches setting routines, and a way for spectators to see where the difficulty actually comes from.
            </p>
            <p>
              Difficulty scoring is not a simple sum. The Code of Points counts only the highest-value elements in a routine, so a
              routine stuffed with easy skills can score less than a shorter routine built from harder ones. Editing a routine for
              the routine's own sake is a common mistake, and the calculator makes the trade-off visible.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Element values follow the FIG letter scale: an A element is worth 0.1 and each letter adds a tenth, so an F is 0.6 and
              the hardest recognisable elements sit in the G and H range at 0.7 and 0.8. In the element value builder you enter how
              many elements of each letter appear in the routine, and the calculator converts each count into its total value.
            </p>
            <p>
              The counting limit is then applied. Women's routines count the eight highest element values and men's routines count
              the ten highest, so the calculator sorts every value descended and keeps only the top ones. Everything below the
              cut-off is reported as discarded value, which quantifies exactly how much the routine would gain from upgrading or
              replacing its weakest counted elements. Connection value is added on top for linked elements, as is the composition or
              element-group credit the routine earns.
            </p>
            <p>
              Neutral deductions — going out of bounds, exceeding time and similar faults — are subtracted from the D-score rather
              than the execution score. The final score adds execution out of ten, which reflects how cleanly the routine was
              performed: amplitude on releases and saltos, body position, landing control and artistry. A routine with a high
              D-score and generous execution is the goal, and the two are traded against each other in routine design because harder
              elements are harder to land perfectly.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the difficulty score. The three-stat bar shows the counted element value, the value lost to the
              counting limit and the final score including execution, so it is immediately clear whether the limit is costing
              anything.
            </p>
            <p>
              The breakdown table walks from the elements entered to the counting elements kept, then adds connection and
              composition credit, subtracts deductions and totals the D-score. The summary panel adds the number of elements
              counted against the number entered, the share of the entered value that survives the limit, and the execution score
              in use.
            </p>
            <p>
              Keep the code version in mind. Counting limits, connection tables and composition requirements change with each
              Olympic cycle, and judges apply the version in force at the competition. Use the calculator to compare versions of a
              routine and to spot wasted value, but confirm the final figures against the current Code of Points before submitting
              a start value.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gymnastics-difficulty-score-calculator" />
          <PopularCalculators exclude="/calculator/gymnastics-difficulty-score-calculator" />
        </div>
      </div>
    </>
  );
}
