"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Pattern = "hypo" | "hyper";

interface Symptom {
  id: string;
  label: string;
  pattern: Pattern;
  weight: number;
}

/**
 * Symptom weights follow the classic underactive / overactive split used in
 * clinical scoring questionnaires: the two or three symptoms that most strongly
 * point at each direction carry double weight, the rest single weight.
 */
const SYMPTOMS: Symptom[] = [
  { id: "fatigue", label: "Unexplained fatigue or lethargy", pattern: "hypo", weight: 2 },
  { id: "weight-gain", label: "Weight gain without a change in diet", pattern: "hypo", weight: 2 },
  { id: "cold-intolerance", label: "Feeling cold when others are comfortable", pattern: "hypo", weight: 2 },
  { id: "dry-skin", label: "Dry skin or brittle nails", pattern: "hypo", weight: 1 },
  { id: "hair-loss", label: "Hair thinning or loss", pattern: "hypo", weight: 1 },
  { id: "constipation", label: "Chronic constipation", pattern: "hypo", weight: 1 },
  { id: "brain-fog", label: "Depression or brain fog", pattern: "hypo", weight: 1 },
  { id: "weight-loss", label: "Weight loss without trying", pattern: "hyper", weight: 2 },
  { id: "palpitations", label: "Rapid heart rate or palpitations", pattern: "hyper", weight: 2 },
  { id: "heat-intolerance", label: "Heat intolerance or excessive sweating", pattern: "hyper", weight: 2 },
  { id: "tremor", label: "Hand tremor or shakiness", pattern: "hyper", weight: 2 },
  { id: "anxiety", label: "Anxiety or nervousness", pattern: "hyper", weight: 1 },
  { id: "insomnia", label: "Insomnia or trouble staying asleep", pattern: "hyper", weight: 1 },
  { id: "frequent-bowel", label: "Frequent bowel movements", pattern: "hyper", weight: 1 },
];

interface LifeContext {
  key: string;
  label: string;
  hypo: number;
  hyper: number;
  note: string;
}

/** Recognised periods of thyroid risk that shift either pattern. */
const CONTEXTS: LifeContext[] = [
  { key: "none", label: "None of these", hypo: 0, hyper: 0, note: "No additional period of risk applied." },
  {
    key: "pregnancy",
    label: "Currently pregnant",
    hypo: 0,
    hyper: 1,
    note: "Gestational hyperthyroidism from hCG stimulation is common in the first trimester.",
  },
  {
    key: "postpartum",
    label: "Gave birth within the last 12 months",
    hypo: 2,
    hyper: 0,
    note: "Postpartum thyroiditis peaks three to six months after delivery and usually presents as an underactive phase.",
  },
  {
    key: "menopause",
    label: "Perimenopausal or menopausal",
    hypo: 1,
    hyper: 0,
    note: "Thyroid disease and menopausal symptoms overlap heavily, and underactive patterns become more common.",
  },
];

interface ThyroidInputs {
  age: number;
  sex: string;
  familyHistory: string;
  context: string;
  symptoms: string[];
  decimals: number;
}

const DEFAULTS: ThyroidInputs = {
  age: 45,
  sex: "female",
  familyHistory: "no",
  context: "none",
  symptoms: [],
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ThyroidResult {
  valid: boolean;
  errorMsg: string;
  hypoScore: number;
  hyperScore: number;
  hypoMax: number;
  hyperMax: number;
  hypoPct: number;
  hyperPct: number;
  demographicHypo: number;
  demographicHyper: number;
  symptomHypo: number;
  symptomHyper: number;
  selectedCount: number;
  pattern: string;
  patternKey: "mixed" | "hypo-high" | "hyper-high" | "hypo-moderate" | "hyper-moderate" | "low";
  patternColor: string;
  recommendation: string;
  nextStep: string;
  breakdown: BreakdownRow[];
}

function calculateThyroid(input: ThyroidInputs): ThyroidResult {
  const context = CONTEXTS.find((c) => c.key === input.context) || CONTEXTS[0];

  const blank = (errorMsg: string): ThyroidResult => ({
    valid: false,
    errorMsg,
    hypoScore: 0,
    hyperScore: 0,
    hypoMax: 0,
    hyperMax: 0,
    hypoPct: 0,
    hyperPct: 0,
    demographicHypo: 0,
    demographicHyper: 0,
    symptomHypo: 0,
    symptomHyper: 0,
    selectedCount: 0,
    pattern: "",
    patternKey: "low",
    patternColor: "text-muted-foreground",
    recommendation: "",
    nextStep: "",
    breakdown: [],
  });

  if (!Number.isFinite(input.age) || input.age <= 0) return blank("Enter an age above zero to score the risk profile.");
  if (input.age > 120) return blank("Enter an age of 120 or below.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const female = input.sex === "female";
  const family = input.familyHistory === "yes";
  const older = input.age > 60;

  const symptomRows = SYMPTOMS.filter((s) => input.symptoms.includes(s.id));
  const symptomHypo = symptomRows.filter((s) => s.pattern === "hypo").reduce((sum, s) => sum + s.weight, 0);
  const symptomHyper = symptomRows.filter((s) => s.pattern === "hyper").reduce((sum, s) => sum + s.weight, 0);

  // Demographic and life-stage loading: autoimmunity that attacks the thyroid is
  // far more common in women, in first-degree relatives and around childbirth.
  const demographicHypo = (female ? 1 : 0) + (older ? 1 : 0) + (family ? 2 : 0) + context.hypo;
  const demographicHyper = (female ? 1 : 0) + (family ? 2 : 0) + context.hyper;

  const hypoScore = symptomHypo + demographicHypo;
  const hyperScore = symptomHyper + demographicHyper;

  const maxHypoSymptoms = SYMPTOMS.filter((s) => s.pattern === "hypo").reduce((sum, s) => sum + s.weight, 0);
  const maxHyperSymptoms = SYMPTOMS.filter((s) => s.pattern === "hyper").reduce((sum, s) => sum + s.weight, 0);
  const maxContextHypo = Math.max(...CONTEXTS.map((c) => c.hypo));
  const maxContextHyper = Math.max(...CONTEXTS.map((c) => c.hyper));
  const hypoMax = maxHypoSymptoms + 1 + 1 + 2 + maxContextHypo;
  const hyperMax = maxHyperSymptoms + 1 + 2 + maxContextHyper;

  const hypoPct = (hypoScore / hypoMax) * 100;
  const hyperPct = (hyperScore / hyperMax) * 100;

  let patternKey: ThyroidResult["patternKey"] = "low";
  let pattern = "No clear pattern";
  let patternColor = "text-muted-foreground";
  let recommendation =
    "The symptoms you reported do not currently point in either direction. Two or three persistent symptoms are still worth a conversation with a clinician, and asking for a thyroid panel is reasonable if the symptoms last more than a few weeks.";
  let nextStep = "Track the symptoms for a few weeks and retest before requesting tests.";

  if (hypoPct >= 60 && hyperPct >= 60) {
    patternKey = "mixed";
    pattern = "Mixed / complex pattern";
    patternColor = "text-orange-600";
    recommendation =
      "You reported substantial symptoms in both directions. That combination is typical of autoimmune thyroiditis, where the gland releases stored hormone during a flare before settling into an underactive phase, and it can also reflect two unrelated problems at once.";
    nextStep = "Ask for TSH, free T4, free T3 and the TPO and Tg antibodies, since antibodies separate autoimmune disease from a transient swing.";
  } else if (hypoPct >= 60) {
    patternKey = "hypo-high";
    pattern = "Strong underactive pattern";
    patternColor = "text-red-600";
    recommendation =
      "Your symptom profile aligns closely with an underactive thyroid: fatigue, weight gain, cold intolerance and constipation in combination are the classic presentation, and they appear together more often in hypothyroidism than in any other common condition.";
    nextStep = "Request TSH and free T4 as the first tests, with TPO antibodies added if TSH is raised.";
  } else if (hyperPct >= 60) {
    patternKey = "hyper-high";
    pattern = "Strong overactive pattern";
    patternColor = "text-red-600";
    recommendation =
      "Your symptom profile aligns closely with an overactive thyroid. Weight loss with a fast heart rate, heat intolerance and tremor is a combination worth investigating promptly, because untreated hyperthyroidism puts sustained strain on the heart.";
    nextStep = "Request TSH, free T4 and free T3 without delay, and mention palpitations to the clinician.";
  } else if (hypoPct >= 30) {
    patternKey = "hypo-moderate";
    pattern = "Mild underactive pattern";
    patternColor = "text-orange-600";
    recommendation =
      "A few features point towards an underactive thyroid, but not enough for the pattern to be convincing on its own. Many of these symptoms also accompany anaemia, low iron, sleep debt, depression and perimenopause.";
    nextStep = "If the symptoms persist beyond a few weeks, ask for TSH and free T4 alongside a full blood count and ferritin.";
  } else if (hyperPct >= 30) {
    patternKey = "hyper-moderate";
    pattern = "Mild overactive pattern";
    patternColor = "text-orange-600";
    recommendation =
      "A few features point towards an overactive thyroid. On its own that is not alarming, but a rising resting heart rate, unexplained weight loss or a new tremor should not be left to settle by itself.";
    nextStep = "Check your resting pulse for a week and ask for TSH and free T4 if the symptoms build.";
  }

  const dominantLabel = hypoPct >= hyperPct ? "underactive" : "overactive";
  const dominantPct = Math.max(hypoPct, hyperPct);
  const selectedCount = symptomRows.length;

  const breakdown: BreakdownRow[] = [
    { label: "Age band used", value: `${fmt(input.age, 0)} years${older ? " — over 60, which raises the underactive loading" : ""}` },
    { label: "Biological sex", value: `${female ? "Female — autoimmune thyroid disease is five to eight times more common" : "Male"}` },
    { label: "Family history of thyroid disease", value: family ? "Yes — first-degree relatives carry a much higher risk" : "No" },
    { label: "Life stage adjustment", value: `${context.label} — ${context.note}` },
    { label: "Points from demography and life stage", value: `${fmt(demographicHypo, 0)} underactive · ${fmt(demographicHyper, 0)} overactive` },
    {
      label: `Symptoms reported (${fmt(selectedCount, 0)} of ${fmt(SYMPTOMS.length, 0)})`,
      value: `${fmt(symptomHypo, 0)} underactive points · ${fmt(symptomHyper, 0)} overactive points`,
    },
    ...symptomRows.map((s) => ({
      label: s.label,
      value: `${s.pattern === "hypo" ? "Underactive" : "Overactive"} · ${fmt(s.weight, 0)} point${s.weight === 1 ? "" : "s"}`,
    })),
    { label: "Underactive score", value: `${fmt(hypoScore, 0)} of ${fmt(hypoMax, 0)} points · ${fmt(hypoPct, 1)}%`, highlight: true },
    { label: "Overactive score", value: `${fmt(hyperScore, 0)} of ${fmt(hyperMax, 0)} points · ${fmt(hyperPct, 1)}%`, highlight: true },
    { label: "Dominant direction", value: `${dominantLabel} at ${fmt(dominantPct, 1)}% of the maximum` },
    { label: "Thresholds used", value: "60% of the maximum for a strong pattern, 30% for a mild one" },
    { label: "Classified pattern", value: pattern, highlight: true },
  ];

  return {
    valid: true,
    errorMsg: "",
    hypoScore,
    hyperScore,
    hypoMax,
    hyperMax,
    hypoPct,
    hyperPct,
    demographicHypo,
    demographicHyper,
    symptomHypo,
    symptomHyper,
    selectedCount,
    pattern,
    patternKey,
    patternColor,
    recommendation,
    nextStep,
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

const SymptomChip = ({
  symptom,
  selected,
  onToggle,
}: {
  symptom: Symptom;
  selected: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onToggle}
    className={`w-full text-left rounded-md border px-3 py-2 text-[13px] font-medium leading-tight transition-all ${
      selected
        ? symptom.pattern === "hypo"
          ? "border-blue-500 bg-blue-500/10 text-foreground"
          : "border-red-500 bg-red-500/10 text-foreground"
        : "border-border bg-background text-muted-foreground hover:border-primary/40"
    }`}
  >
    <span className="block">{symptom.label}</span>
    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
      {symptom.pattern === "hypo" ? "Underactive" : "Overactive"} · {symptom.weight} pt
    </span>
  </button>
);

export default function ThyroidRiskScoreCalculator() {
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [sex, setSex] = useState<string>(DEFAULTS.sex);
  const [familyHistory, setFamilyHistory] = useState<string>(DEFAULTS.familyHistory);
  const [context, setContext] = useState<string>(DEFAULTS.context);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(DEFAULTS.symptoms);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const getInputs = (): ThyroidInputs => ({
    age: parseInt(age) || 0,
    sex,
    familyHistory,
    context,
    symptoms: selectedSymptoms,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<ThyroidInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ThyroidResult>(() => calculateThyroid(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateThyroid(inputs));
  };

  const reset = () => {
    setAge(String(DEFAULTS.age));
    setSex(DEFAULTS.sex);
    setFamilyHistory(DEFAULTS.familyHistory);
    setContext(DEFAULTS.context);
    setSelectedSymptoms([]);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateThyroid(DEFAULTS));
  };

  const ageNum = parseInt(age);
  const errors = {
    age: !Number.isFinite(ageNum) || ageNum <= 0 || ageNum > 120 ? "Enter an age from 1 to 120" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const hypoPct = results.hypoPct;
  const hyperPct = results.hyperPct;
  const dominantIsHypo = hypoPct >= hyperPct;

  const faqs = [
    {
      question: "What is the difference between hypothyroidism and hyperthyroidism?",
      answer:
        "An underactive thyroid does not make enough hormone, so metabolism slows and the usual picture is fatigue, weight gain, cold intolerance, constipation and low mood. An overactive thyroid makes too much, so metabolism speeds up and the picture is weight loss, a fast or irregular heartbeat, heat intolerance, sweating and tremor. Both are diagnosed from blood tests rather than from symptoms, because the two profiles overlap with each other and with several unrelated conditions.",
    },
    {
      question: "Is this calculator a diagnosis?",
      answer:
        "No. It is an educational way of seeing whether your symptoms cluster in one direction strongly enough to justify asking for a thyroid panel. Thyroid disease shares its symptoms with anaemia, iron deficiency, sleep deprivation, depression, perimenopause and simple overwork, so the tests are what matter. A high score here is a reason to make an appointment, not a result to act on by yourself.",
    },
    {
      question: "Why do sex, age and family history carry points?",
      answer:
        "Because they change how likely thyroid disease is before any symptom is considered. Autoimmune thyroid conditions such as Hashimoto's thyroiditis and Graves' disease are five to eight times more common in women, a first-degree relative with thyroid disease raises your own risk substantially, and underactive patterns become more common with age. Those loadings are small next to the symptom points on purpose: they shift the odds, they do not decide the picture.",
    },
    {
      question: "Can both patterns be present at the same time?",
      answer:
        "Yes, and it is a recognised stage rather than a contradiction. In Hashimoto's thyroiditis the immune attack destroys thyroid tissue, and when stored hormone leaks out of the damaged gland the person can swing temporarily overactive before settling into a chronic underactive phase. In that situation the antibody tests, particularly TPO and Tg, are what separate autoimmune thyroid disease from a one-off episode.",
    },
    {
      question: "Which tests should I ask for?",
      answer:
        "Start with TSH and free T4, which are the two tests that define an underactive or overactive state. Add free T3 if the TSH result does not explain how you feel, and add TPO and Tg antibodies if autoimmune disease is suspected, since the antibody result is often positive years before the hormone levels move. A full blood count and ferritin are worth doing at the same time, because iron deficiency produces a very similar fatigue and cold intolerance.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Thyroid Risk Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Thyroid Risk Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="About You">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="age"
                  label="Age"
                  value={age}
                  onChange={setAge}
                  onEnter={runCalculate}
                  min="1"
                  max="120"
                  step="1"
                  suffix="years"
                  error={errors.age}
                  tooltip="Age over 60 carries one extra point on the underactive side."
                />
                <CompactSelect
                  id="sex"
                  label="Biological Sex"
                  value={sex}
                  onChange={setSex}
                  options={[
                    { value: "female", label: "Female" },
                    { value: "male", label: "Male" },
                  ]}
                  tooltip="Autoimmune thyroid disease is five to eight times more common in women."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="family"
                  label="Family History"
                  value={familyHistory}
                  onChange={setFamilyHistory}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  tooltip="A first-degree relative with thyroid disease, including a parent, sibling or child."
                />
                <CompactSelect
                  id="context"
                  label="Life Stage"
                  value={context}
                  onChange={setContext}
                  options={CONTEXTS.map((c) => ({ value: c.key, label: c.label }))}
                  tooltip="Recognised periods when thyroid risk rises: pregnancy, the year after birth and the menopause transition."
                />
              </div>
            </SubSection>

            <SubSection title="Symptoms You Have Now">
              <div className="grid grid-cols-2 gap-3">
                {SYMPTOMS.filter((s) => s.pattern === "hypo").map((s) => (
                  <SymptomChip
                    key={s.id}
                    symptom={s}
                    selected={selectedSymptoms.includes(s.id)}
                    onToggle={() => toggleSymptom(s.id)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {SYMPTOMS.filter((s) => s.pattern === "hyper").map((s) => (
                  <SymptomChip
                    key={s.id}
                    symptom={s}
                    selected={selectedSymptoms.includes(s.id)}
                    onToggle={() => toggleSymptom(s.id)}
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
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for the percentage scores."
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          Scores are shown as a share of the maximum, so a long list of mild symptoms outranks a single strong one.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                {dominantIsHypo ? "Underactive Pattern Score" : "Overactive Pattern Score"}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(Math.max(hypoPct, hyperPct), calcInputs.decimals)}%` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.pattern} — underactive ${fmt(hypoPct, 0)}%, overactive ${fmt(hyperPct, 0)}% of each maximum`
                  : "Fix the highlighted inputs to score the profile"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Underactive</span>
                <span className="font-extrabold text-blue-600">{results.valid ? `${fmt(hypoPct, 0)}%` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overactive</span>
                <span className="font-extrabold text-red-600">{results.valid ? `${fmt(hyperPct, 0)}%` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Symptoms</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.selectedCount, 0)} reported` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Risk Factor</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Contribution</th>
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
                        Enter your age and any symptoms to see the score breakdown.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Pattern</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{results.pattern}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Underactive score</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.hypoScore, 0)} / ${fmt(results.hypoMax, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overactive score</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.hyperScore, 0)} / ${fmt(results.hyperMax, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">From symptoms</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.symptomHypo, 0)} · ${fmt(results.symptomHyper, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">From demography</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.demographicHypo, 0)} · ${fmt(results.demographicHyper, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Underactive share</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(hypoPct, 1)}%` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overactive share</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(hyperPct, 1)}%` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Symptoms reported</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.selectedCount, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Pattern</span>
                  <span className={`text-base font-bold ${results.patternColor}`}>{results.valid ? results.pattern : "—"}</span>
                </div>
              </div>
              {results.valid && (
                <>
                  <p className="text-[11px] text-muted-foreground mt-3">{results.recommendation}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    <span className="font-bold text-foreground">Next step:</span> {results.nextStep}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Thyroid Risk Score Calculator?</h2>
            <p>
              A thyroid risk score calculator turns a list of symptoms and a handful of background risk factors into a score for each
              direction a thyroid problem can take: underactive, where the gland makes too little hormone, and overactive, where it makes
              too much. The value of scoring the two directions separately is that the symptom lists overlap — tiredness and mood change
              appear on both — and a single lump score would hide which way the picture is leaning.
            </p>
            <p>
              It is an educational tool rather than a diagnostic one. Thyroid disorders are confirmed from blood tests, and the symptoms
              counted here are shared with anaemia, iron deficiency, poor sleep, depression and the menopause transition, so a score can
              only tell you whether asking for those tests is sensible.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each symptom carries a weight in one direction. Fatigue, unexplained weight gain and cold intolerance carry two points
              each on the underactive side, with dry skin, hair thinning, constipation and brain fog at one point. Weight loss without
              trying, palpitations, heat intolerance and tremor carry two points each on the overactive side, with anxiety, insomnia and
              frequent bowel movements at one. The weights follow the relative specificity of the symptom rather than any measured
              physiological quantity, which is why the result is a share of the maximum rather than a probability.
            </p>
            <p>
              Background factors add a small number of points to both directions. Being female adds one point to each, because autoimmune
              thyroid disease is five to eight times more common in women. A first-degree relative with thyroid disease adds two to each,
              because the autoimmune forms run in families. Age over 60 adds one point on the underactive side, and the life-stage
              selector covers the recognised windows of risk: pregnancy, where hCG stimulation can push towards overactivity; the year
              after childbirth, when postpartum thyroiditis usually appears as an underactive phase; and the menopause transition, where
              underactive patterns become more common.
            </p>
            <p>
              The two totals are then divided by their own maximum — every symptom in that direction plus the largest possible background
              loading — and expressed as a percentage. Sixty percent or more in one direction is treated as a strong pattern, thirty
              percent or more as a mild one, and sixty percent in both directions as a mixed pattern, which is the profile that most
              often points at autoimmune thyroiditis swinging between phases.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the dominant direction's percentage with the classified pattern underneath. The three-stat bar shows
              both percentages side by side and how many symptoms were counted, which is a useful check that the score reflects the
              profile you described.
            </p>
            <p>
              The breakdown table lists the demographic points, the symptom points and each individual symptom with its weight, then the
              two scores against their maxima, the thresholds applied and the final classification. The summary panel adds the split
              between symptom and demographic points, the pattern and a recommendation with the next test to consider.
            </p>
            <p>
              Read the score with its limits in mind. Symptom questionnaires cannot substitute for TSH, free T4 and free T3, and a low
              score does not exclude disease: subclinical hypothyroidism, where TSH is raised but free T4 is still normal, frequently
              produces few symptoms at all. If you are pregnant, recently postpartum, or already taking thyroid medication, the
              interpretation changes enough that a clinician should make it — and if symptoms include chest pain, a resting pulse well
              above 100 beats per minute, or rapid unexplained weight loss, that warrants prompt medical assessment rather than
              calculation.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/thyroid-risk-score-calculator" />
          <PopularCalculators exclude="/calculator/thyroid-risk-score-calculator" />
        </div>
      </div>
    </>
  );
}
