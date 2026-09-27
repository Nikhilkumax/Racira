"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface Factor {
  key: string;
  label: string;
  group: "knowledge" | "regulation";
  items: number;
  hint: string;
}

/**
 * The eight factors of the Metacognitive Awareness Inventory published by Schraw
 * and Dennison. Item counts are the ones most commonly reported when the inventory
 * is split into subscales.
 */
const FACTORS: Factor[] = [
  { key: "declarative", label: "Declarative Knowledge", group: "knowledge", items: 8, hint: "Knowing what you know and what you do not." },
  { key: "procedural", label: "Procedural Knowledge", group: "knowledge", items: 4, hint: "Knowing how to use strategies that work." },
  { key: "conditional", label: "Conditional Knowledge", group: "knowledge", items: 5, hint: "Knowing when and why to use a strategy." },
  { key: "planning", label: "Planning", group: "regulation", items: 7, hint: "Setting goals and pacing the work." },
  { key: "information", label: "Information Management", group: "regulation", items: 9, hint: "Organising, summarising and elaborating." },
  { key: "monitoring", label: "Comprehension Monitoring", group: "regulation", items: 7, hint: "Checking whether the learning is working." },
  { key: "debugging", label: "Debugging", group: "regulation", items: 5, hint: "Changing strategy when it stops working." },
  { key: "evaluation", label: "Evaluation", group: "regulation", items: 6, hint: "Judging the result after the task." },
];

interface MaiInputs {
  scale: string;
  values: Record<string, number>;
  target: number;
  decimals: number;
}

const DEFAULTS: MaiInputs = {
  scale: "percent",
  values: {
    declarative: 76,
    procedural: 72,
    conditional: 68,
    planning: 70,
    information: 66,
    monitoring: 71,
    debugging: 67,
    evaluation: 64,
  },
  target: 80,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface FactorRow {
  key: string;
  label: string;
  group: "knowledge" | "regulation";
  items: number;
  raw: number;
  percent: number;
  contribution: number;
  gapToTarget: number;
}

interface MaiResult {
  valid: boolean;
  errorMsg: string;
  factors: FactorRow[];
  knowledgeFp: number;
  regulationFp: number;
  weightedOverall: number;
  simpleOverall: number;
  spread: number;
  strongest: FactorRow;
  weakest: FactorRow;
  balanceGap: number;
  balanceLabel: string;
  target: number;
  targetGap: number;
  targetPercent: number;
  scaleLabel: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

const SCALES: { key: string; label: string; min: number; max: number }[] = [
  { key: "percent", label: "Percentage of the maximum (0–100)", min: 0, max: 100 },
  { key: "likert", label: "Average item score (1–5 Likert)", min: 1, max: 5 },
];

/** Converts whatever scale was entered into a 0–100 figure for comparison. */
function toPercent(value: number, scale: string): number {
  if (scale === "likert") return ((value - 1) / 4) * 100;
  return value;
}

function calculateMai(input: MaiInputs): MaiResult {
  const scale = SCALES.find((s) => s.key === input.scale) || SCALES[0];
  const rawValues = FACTORS.map((f) => input.values[f.key]);

  const blank = (errorMsg: string): MaiResult => ({
    valid: false,
    errorMsg,
    factors: [],
    knowledgeFp: 0,
    regulationFp: 0,
    weightedOverall: 0,
    simpleOverall: 0,
    spread: 0,
    strongest: { key: "", label: "", group: "knowledge", items: 0, raw: 0, percent: 0, contribution: 0, gapToTarget: 0 },
    weakest: { key: "", label: "", group: "knowledge", items: 0, raw: 0, percent: 0, contribution: 0, gapToTarget: 0 },
    balanceGap: 0,
    balanceLabel: "",
    target: 0,
    targetGap: 0,
    targetPercent: 0,
    scaleLabel: scale.label,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  if (!rawValues.every((v) => Number.isFinite(v))) return blank("Enter a score for each of the eight factors.");
  if (rawValues.some((v) => v < scale.min || v > scale.max)) {
    return blank(
      scale.key === "likert"
        ? "On the Likert scale each factor average should be between 1 and 5."
        : "Each factor score should be between 0 and 100.",
    );
  }
  if (!Number.isFinite(input.target) || input.target < 0 || input.target > 100) {
    return blank("Set the target between 0% and 100% of the maximum.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));
  const totalItems = FACTORS.reduce((sum, f) => sum + f.items, 0);

  const factors: FactorRow[] = FACTORS.map((f, i) => {
    const percent = toPercent(rawValues[i], input.scale);
    return {
      key: f.key,
      label: f.label,
      group: f.group,
      items: f.items,
      raw: rawValues[i],
      percent,
      contribution: (percent * f.items) / totalItems,
      gapToTarget: Math.max(0, input.target - percent),
    };
  });

  const knowledge = factors.filter((f) => f.group === "knowledge");
  const regulation = factors.filter((f) => f.group === "regulation");
  const mean = (rows: FactorRow[]) => rows.reduce((sum, f) => sum + f.percent, 0) / rows.length;

  // The weighted overall score is the item-weighted sum, which is what the full
  // inventory produces; the simple mean treats each of the eight factors equally.
  const weightedOverall = factors.reduce((sum, f) => sum + f.contribution, 0);
  const simpleOverall = mean(factors);

  const sorted = [...factors].sort((a, b) => b.percent - a.percent);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const spread = strongest.percent - weakest.percent;

  const knowledgeFp = mean(knowledge);
  const regulationFp = mean(regulation);
  const balanceGap = knowledgeFp - regulationFp;
  const balanceLabel =
    balanceGap > 5
      ? "Knowledge outruns regulation — you know the strategies better than you apply them"
      : balanceGap < -5
        ? "Regulation outruns knowledge — you manage the process better than you understand the strategies behind it"
        : "Knowledge and regulation of cognition are broadly in step";

  const targetGap = Math.max(0, input.target - weightedOverall);
  const targetPercent = input.target > 0 ? (weightedOverall / input.target) * 100 : 0;

  const verdict =
    balanceGap > 5
      ? `Regulation sits ${fmt(Math.abs(balanceGap), 1)} points below knowledge, so the fastest gain comes from planning, monitoring and strategy switching rather than from learning more technique`
      : balanceGap < -5
        ? `Knowledge sits ${fmt(Math.abs(balanceGap), 1)} points below regulation, so the fastest gain comes from studying the strategies themselves — what they are, when they work and why`
        : `The two halves are within ${fmt(Math.abs(balanceGap), 1)} points of each other, and ${weakest.label.toLowerCase()} is the weakest of the eight factors at ${fmt(
            weakest.percent,
            0,
          )}%`;
  const verdictColor = spread > 20 ? "text-orange-600" : "text-emerald-600";

  const breakdown: BreakdownRow[] = [
    ...factors.map((f) => ({
      label: `${f.label} (${fmt(f.items, 0)} items)`,
      value:
        input.scale === "likert"
          ? `${fmt(f.raw, 2)} of 5 → ${fmt(f.percent, 1)}%`
          : `${fmt(f.percent, 1)}% · contributes ${fmt(f.contribution, 2)} points`,
    })),
    { label: "Knowledge of cognition (three factors)", value: `${fmt(knowledgeFp, 1)}%`, highlight: true },
    { label: "Regulation of cognition (five factors)", value: `${fmt(regulationFp, 1)}%`, highlight: true },
    { label: "Item-weighted overall score", value: `${fmt(weightedOverall, 1)}%`, highlight: true },
    { label: "Unweighted mean of the eight factors", value: `${fmt(simpleOverall, 1)}%` },
    { label: "Difference between the two halves", value: `${balanceGap >= 0 ? "+" : "−"}${fmt(Math.abs(balanceGap), 1)} points` },
    { label: "Spread between the strongest and weakest factor", value: `${fmt(spread, 1)} points` },
    { label: "Strongest factor", value: `${strongest.label} at ${fmt(strongest.percent, 1)}%` },
    { label: "Weakest factor", value: `${weakest.label} at ${fmt(weakest.percent, 1)}%` },
    { label: `Target of ${fmt(input.target, 0)}% of the maximum`, value: `${fmt(targetPercent, 1)}% of the target reached` },
    {
      label: "Points still needed to reach the target",
      value: targetGap > 0 ? `${fmt(targetGap, 2)} weighted points` : "target already met",
    },
    { label: "Items represented in the weighted score", value: `${fmt(totalItems, 0)} inventory items` },
  ];

  return {
    valid: true,
    errorMsg: "",
    factors,
    knowledgeFp,
    regulationFp,
    weightedOverall,
    simpleOverall,
    spread,
    strongest,
    weakest,
    balanceGap,
    balanceLabel,
    target: input.target,
    targetGap,
    targetPercent,
    scaleLabel: scale.label,
    verdict,
    verdictColor,
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

export default function MetacognitiveAwarenessScoreCalculator() {
  const [scale, setScale] = useState<string>(DEFAULTS.scale);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FACTORS.map((f) => [f.key, String(DEFAULTS.values[f.key])])),
  );
  const [target, setTarget] = useState(String(DEFAULTS.target));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const getInputs = (): MaiInputs => ({
    scale,
    values: Object.fromEntries(FACTORS.map((f) => [f.key, parseFloat(values[f.key])])),
    target: parseFloat(target) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<MaiInputs>(() => DEFAULTS);
  const [results, setResults] = useState<MaiResult>(() => calculateMai(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateMai(inputs));
  };

  const reset = () => {
    setScale(DEFAULTS.scale);
    setValues(Object.fromEntries(FACTORS.map((f) => [f.key, String(DEFAULTS.values[f.key])])));
    setTarget(String(DEFAULTS.target));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateMai(DEFAULTS));
  };

  const scaleSpec = SCALES.find((s) => s.key === scale) || SCALES[0];
  const targetNum = parseFloat(target);

  const factorError = (key: string) => {
    const v = parseFloat(values[key]);
    if (!Number.isFinite(v)) return "Number only";
    if (v < scaleSpec.min || v > scaleSpec.max) return `Use ${scaleSpec.min}–${scaleSpec.max}`;
    return "";
  };

  const errors = {
    target: !Number.isFinite(targetNum) || targetNum < 0 || targetNum > 100 ? "Use 0–100" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean) || FACTORS.some((f) => factorError(f.key) !== "");

  const faqs = [
    {
      question: "What is metacognitive awareness?",
      answer:
        "It is the knowledge and control a learner has over their own thinking. Knowledge of cognition covers three things: what you know about your own learning, how to carry out strategies such as summarising or self-testing, and when each strategy is worth using. Regulation of cognition covers what you do with that knowledge: planning the task, managing the material, monitoring whether understanding is actually arriving, switching approach when it is not, and evaluating the result afterwards. Together the two halves make up the eight-factor structure measured by the Metacognitive Awareness Inventory.",
    },
    {
      question: "How do I get subscale scores to enter here?",
      answer:
        "Complete the inventory, reverse-scoring no items — the published version contains no reverse-coded questions — then average the item responses within each of the eight factors. If you answer on a five-point scale from never true of me to always true of me, enter the averages and choose the Likert input scale; the calculator converts each average to a percentage of the maximum. If your form reports scores as percentages, enter those directly. Item counts behind each factor differ slightly between published versions of the inventory, which is why the overall score is also shown item-weighted.",
    },
    {
      question: "What is a good score?",
      answer:
        "Adult students typically average around three-quarters of the maximum on the knowledge factors and slightly less on regulation, and the interesting information is in the differences rather than the overall figure. A factor at or below 50 percent is a clear weak point; a spread of more than twenty points between your strongest and weakest factor says your learning depends heavily on whatever the task happens to call for. Because the inventory is self-report, a very high score with poor actual results is itself informative: over-estimated monitoring is one of the most common patterns in the research.",
    },
    {
      question: "Can metacognitive awareness be improved?",
      answer:
        "Yes, and it responds to quite direct instruction. The strategies that produce the largest gains in controlled studies are self-explanation, where you explain material to yourself as you read it; spaced retrieval practice, where you test yourself on a schedule instead of rereading; and prediction followed by checking, where you judge how well you understand something and then verify that judgement against a real test. Keeping a short planning and review note — what the task needs, how long each part took, what you would do differently — targets the regulation half specifically, which is where most learners have room.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Education", href: "/calculator#education" },
          { label: "Metacognitive Awareness Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Metacognitive Awareness Score Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Knowledge of Cognition">
              <div className="grid grid-cols-2 gap-3">
                {FACTORS.filter((f) => f.group === "knowledge").map((f) => (
                  <CompactInput
                    id={`factor-${f.key}`}
                    label={f.label}
                    value={values[f.key]}
                    onChange={(v) => setValue(f.key, v)}
                    onEnter={runCalculate}
                    min={String(scaleSpec.min)}
                    max={String(scaleSpec.max)}
                    step="any"
                    error={factorError(f.key)}
                    hint={f.hint}
                    tooltip={`${f.label}, averaged across the ${f.items} items in this factor.`}
                  />
                ))}
              </div>
            </SubSection>

            <SubSection title="Regulation of Cognition">
              <div className="grid grid-cols-2 gap-3">
                {FACTORS.filter((f) => f.group === "regulation").map((f) => (
                  <CompactInput
                    id={`factor-${f.key}`}
                    label={f.label}
                    value={values[f.key]}
                    onChange={(v) => setValue(f.key, v)}
                    onEnter={runCalculate}
                    min={String(scaleSpec.min)}
                    max={String(scaleSpec.max)}
                    step="any"
                    error={factorError(f.key)}
                    hint={f.hint}
                    tooltip={`${f.label}, averaged across the ${f.items} items in this factor.`}
                  />
                ))}
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
                  <SubSection title="Scoring">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="scale"
                        label="Input Scale"
                        value={scale}
                        onChange={setScale}
                        options={SCALES.map((s) => ({ value: s.key, label: s.label }))}
                        tooltip="Likert averages are converted to a percentage of the maximum before scoring."
                      />
                      <CompactInput
                        id="target"
                        label="Target Score"
                        value={target}
                        onChange={setTarget}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="1"
                        suffix="%"
                        error={errors.target}
                        tooltip="The overall score you want to reach, as a percentage of the maximum."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for the scores."
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          No item in the inventory is reverse scored, so factor means can be averaged directly.
                        </span>
                      </div>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Overall Metacognitive Score</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.weightedOverall, calcInputs.decimals)}%` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Knowledge of cognition ${fmt(results.knowledgeFp, 0)}%, regulation of cognition ${fmt(results.regulationFp, 0)}% — ${fmt(
                      results.targetPercent,
                      0,
                    )}% of your ${fmt(results.target, 0)}% target`
                  : "Fix the highlighted factors to score the inventory"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Knowledge</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.knowledgeFp, 0)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Regulation</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.regulationFp, 0)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gap to Target</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? (results.targetGap > 0 ? `${fmt(results.targetGap, 1)} pts` : "met") : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Inventory Factor</th>
                    <th className="p-2.5 pr-3 text-right w-[240px]">Score</th>
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
                        Enter your factor scores to see the profile.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Overall score</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.weightedOverall, calcInputs.decimals)}% · ${results.balanceLabel.split(" — ")[0]}`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overall score</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.weightedOverall, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Unweighted mean</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.simpleOverall, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Knowledge of cognition</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.knowledgeFp, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Regulation of cognition</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.regulationFp, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Strongest factor</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${results.strongest.label} · ${fmt(results.strongest.percent, 0)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weakest factor</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${results.weakest.label} · ${fmt(results.weakest.percent, 0)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Spread</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.spread, 1)} points` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gap to target</span>
                  <span className={`text-base font-bold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                    {results.valid ? (results.targetGap > 0 ? `${fmt(results.targetGap, 1)} points` : "target met") : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className="text-[11px] text-muted-foreground mt-3">{results.balanceLabel}.</p>}
              {results.valid && <p className={`text-[11px] mt-2 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Metacognitive Awareness Score Calculator?</h2>
            <p>
              A metacognitive awareness score calculator takes your factor scores from the Metacognitive Awareness Inventory and turns
              them into a profile: how your knowledge of cognition compares with your regulation of cognition, which of the eight factors
              is strongest, which is weakest, how far apart they are and how far the whole profile sits from a target you set. The
              inventory itself measures something that predicts academic performance better than ability tests alone — how well a learner
              understands and directs their own learning.
            </p>
            <p>
              The distinction between knowing and regulating is what makes the profile useful. Two learners can reach the same overall
              score from opposite directions: one knows every strategy by name but never monitors whether it is working, the other
              manages the process well without understanding why the chosen strategy works. Each needs a different intervention.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The inventory splits into eight factors. Knowledge of cognition covers declarative knowledge, which is what you know about
              your own learning; procedural knowledge, which is how well you can carry out strategies; and conditional knowledge, which is
              knowing when and why each strategy is appropriate. Regulation of cognition covers planning before the task, information
              management while working with the material, comprehension monitoring as understanding develops, debugging when the approach
              stops working, and evaluation after the task is finished.
            </p>
            <p>
              Because the factors contain different numbers of items, this calculator reports two overall figures. The item-weighted score
              is the closest to what the full instrument produces, since factors with more items carry more weight in the total. The
              unweighted mean treats all eight factors equally, which is more useful when you want to know whether an unusual strength or
              weakness is being masked by the weighting. Both are shown so the difference is visible rather than hidden.
            </p>
            <p>
              If you answered on the five-point never-true-of-me to always-true-of-me scale, enter factor averages and select the Likert
              option; each average is converted to a percentage of the maximum. No item is reverse scored, so the conversion is a straight
              rescaling. From there the calculator derives the two halves, the spread between the strongest and weakest factors, the gap
              between the two halves, and the distance from your target in weighted points.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the item-weighted overall score with the two halves and your progress towards the target underneath.
              The three-stat bar sets knowledge of cognition, regulation of cognition and the remaining gap to target side by side.
            </p>
            <p>
              The breakdown table lists all eight factors with their scores and their weighted contribution, then the two halves, both
              overall figures, the imbalance between them, the spread, the strongest and weakest factors and the points still needed to
              reach the target. The summary panel repeats the headline numbers and prints the two interpretation lines: which half is
              lagging and what the pattern suggests working on.
            </p>
            <p>
              Two cautions are worth carrying. First, this is a self-report instrument, so it measures what you believe about your learning
              as much as what you do; a high score alongside poor results is a signal that monitoring is over-estimated, which is one of
              the best-documented patterns in the research. Second, a single administration is a snapshot that moves with the task, the
              subject and the week. Compare scores taken in the same context, and treat any movement in the factors you deliberately
              practised as the useful signal rather than the overall number.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/metacognitive-awareness-score-calculator" />
          <PopularCalculators exclude="/calculator/metacognitive-awareness-score-calculator" />
        </div>
      </div>
    </>
  );
}
