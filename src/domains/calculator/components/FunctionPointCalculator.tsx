"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ComponentType {
  key: string;
  label: string;
  short: string;
  low: number;
  average: number;
  high: number;
}

const COMPONENT_TYPES: ComponentType[] = [
  { key: "ei", label: "External Inputs", short: "EI", low: 3, average: 4, high: 6 },
  { key: "eo", label: "External Outputs", short: "EO", low: 4, average: 5, high: 7 },
  { key: "eq", label: "External Inquiries", short: "EQ", low: 3, average: 4, high: 6 },
  { key: "ilf", label: "Internal Logical Files", short: "ILF", low: 7, average: 10, high: 15 },
  { key: "eif", label: "External Interface Files", short: "EIF", low: 5, average: 7, high: 10 },
];

interface Profile {
  key: string;
  label: string;
  tdi: number;
  note: string;
}

/** Value-adjustment profiles from the 14 general system characteristics (0–5 each). */
const PROFILES: Profile[] = [
  { key: "light", label: "Simple, stable, low risk (TDI 30)", tdi: 30, note: "Few interfaces, settled requirements, small team." },
  { key: "average", label: "Typical commercial project (TDI 42)", tdi: 42, note: "The midpoint of the adjustment range, VAF = 1.00." },
  { key: "heavy", label: "Complex, distributed, high risk (TDI 55)", tdi: 55, note: "Heavy data communications, performance and change pressure." },
  { key: "custom", label: "Custom total degree of influence", tdi: 42, note: "Enter your own TDI from the GSC questionnaire." },
];

interface Language {
  key: string;
  label: string;
  locPerFp: number;
}

/** Source lines per function point from the QSM/ISBSG programming-language table. */
const LANGUAGES: Language[] = [
  { key: "python", label: "Python — 30 LOC per FP", locPerFp: 30 },
  { key: "typescript", label: "TypeScript — 43 LOC per FP", locPerFp: 43 },
  { key: "javascript", label: "JavaScript — 47 LOC per FP", locPerFp: 47 },
  { key: "java", label: "Java — 53 LOC per FP", locPerFp: 53 },
  { key: "csharp", label: "C# — 53 LOC per FP", locPerFp: 53 },
  { key: "cpp", label: "C++ — 60 LOC per FP", locPerFp: 60 },
  { key: "go", label: "Go — 40 LOC per FP", locPerFp: 40 },
  { key: "sql", label: "SQL — 13 LOC per FP", locPerFp: 13 },
  { key: "cobol", label: "COBOL — 105 LOC per FP", locPerFp: 105 },
];

interface FpInputs {
  ei: { low: number; average: number; high: number };
  eo: { low: number; average: number; high: number };
  eq: { low: number; average: number; high: number };
  ilf: { low: number; average: number; high: number };
  eif: { low: number; average: number; high: number };
  profile: string;
  customTdi: number;
  productivity: number;
  costPerPersonMonth: number;
  language: string;
  decimals: number;
}

const DEFAULTS: FpInputs = {
  ei: { low: 4, average: 5, high: 2 },
  eo: { low: 3, average: 4, high: 1 },
  eq: { low: 2, average: 3, high: 1 },
  ilf: { low: 2, average: 3, high: 1 },
  eif: { low: 1, average: 2, high: 0 },
  profile: "average",
  customTdi: 42,
  productivity: 8,
  costPerPersonMonth: 12000,
  language: "java",
  decimals: 1,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface FpResult {
  valid: boolean;
  errorMsg: string;
  ufp: number;
  tdi: number;
  vaf: number;
  afp: number;
  effort: number;
  cost: number;
  linesOfCode: number;
  scheduleMonths: number;
  teamSize: number;
  costPerFp: number;
  locPerFp: number;
  languageLabel: string;
  typeTotals: { label: string; short: string; count: number; points: number; sharePct: number }[];
  dominant: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateFp(input: FpInputs): FpResult {
  const profile = PROFILES.find((p) => p.key === input.profile) || PROFILES[1];
  const language = LANGUAGES.find((l) => l.key === input.language) || LANGUAGES[0];

  const blank = (errorMsg: string): FpResult => ({
    valid: false,
    errorMsg,
    ufp: 0,
    tdi: 0,
    vaf: 0,
    afp: 0,
    effort: 0,
    cost: 0,
    linesOfCode: 0,
    scheduleMonths: 0,
    teamSize: 0,
    costPerFp: 0,
    locPerFp: language.locPerFp,
    languageLabel: language.label,
    typeTotals: [],
    dominant: "",
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const counts = [
    input.ei.low,
    input.ei.average,
    input.ei.high,
    input.eo.low,
    input.eo.average,
    input.eo.high,
    input.eq.low,
    input.eq.average,
    input.eq.high,
    input.ilf.low,
    input.ilf.average,
    input.ilf.high,
    input.eif.low,
    input.eif.average,
    input.eif.high,
  ];
  if (!counts.every((v) => Number.isFinite(v))) return blank("Enter a number in every component count.");
  if (counts.some((v) => v < 0)) return blank("Component counts cannot be negative.");
  if (counts.some((v) => !Number.isInteger(v))) return blank("Component counts must be whole numbers.");

  const tdi = input.profile === "custom" ? input.customTdi : profile.tdi;
  if (!Number.isFinite(tdi) || tdi < 0 || tdi > 70) {
    return blank("The total degree of influence should be between 0 and 70, from the fourteen general system characteristics.");
  }
  if (!Number.isFinite(input.productivity) || input.productivity <= 0) {
    return blank("Delivery productivity must be greater than zero function points per person-month.");
  }
  if (!Number.isFinite(input.costPerPersonMonth) || input.costPerPersonMonth < 0) {
    return blank("Cost per person-month cannot be negative.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));

  const typeTotals = COMPONENT_TYPES.map((type) => {
    const set = input[type.key as keyof Pick<FpInputs, "ei" | "eo" | "eq" | "ilf" | "eif">];
    const points = set.low * type.low + set.average * type.average + set.high * type.high;
    const count = set.low + set.average + set.high;
    return { label: type.label, short: type.short, count, points, sharePct: 0 };
  });

  const ufp = typeTotals.reduce((sum, t) => sum + t.points, 0);
  if (ufp === 0) return blank("Enter at least one function so there is something to size.");

  typeTotals.forEach((t) => {
    t.sharePct = (t.points / ufp) * 100;
  });
  const dominant = typeTotals.reduce((best, t) => (t.points > best.points ? t : best), typeTotals[0]).label;

  // VAF = 0.65 + 0.01 × TDI is the IFPUG adjustment formula, so the multiplier
  // ranges from 0.65 at no influence to 1.35 at the maximum.
  const vaf = 0.65 + 0.01 * tdi;
  const afp = ufp * vaf;
  const effort = afp / input.productivity;
  const cost = effort * input.costPerPersonMonth;
  const linesOfCode = afp * language.locPerFp;
  const scheduleMonths = 2.5 * Math.cbrt(effort);
  const teamSize = effort > 0 ? effort / scheduleMonths : 0;
  const costPerFp = afp > 0 ? cost / afp : 0;

  const verdict = `Delivery at ${fmt(input.productivity, 1)} FP per person-month puts this at ${fmt(effort, 1)} person-months and roughly ${fmt(
    scheduleMonths,
    1,
  )} calendar months with a team of ${fmt(teamSize, 1)}`;
  const verdictColor = vaf >= 1 ? "text-emerald-600" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    ...typeTotals.map((t) => ({
      label: `${t.short} · ${t.label} (${fmt(t.count, 0)} components)`,
      value: `${fmt(t.points, 0)} FP · ${fmt(t.sharePct, 1)}% of the total`,
    })),
    { label: "Unadjusted function points (UFP)", value: `${fmt(ufp, 0)} FP`, highlight: true },
    { label: `Total degree of influence (${profile.key === "custom" ? "custom" : profile.label.split(" (")[0]})`, value: `${fmt(tdi, 0)} of 70` },
    { label: "Value adjustment factor", value: `0.65 + 0.01 × ${fmt(tdi, 0)} = ${fmt(vaf, 3)}`, highlight: true },
    { label: "Adjusted function points (AFP)", value: `${fmt(afp, d)} FP`, highlight: true },
    { label: "Delivery productivity", value: `${fmt(input.productivity, 1)} FP per person-month` },
    { label: "Effort", value: `${fmt(effort, d)} person-months` },
    { label: "Cost per person-month", value: `$${fmt(input.costPerPersonMonth, 0)}` },
    { label: "Estimated cost", value: `$${fmt(cost, 0)}` },
    { label: `Source lines at ${fmt(language.locPerFp, 0)} LOC per FP`, value: `${fmt(linesOfCode, 0)} LOC` },
    { label: "Nominal schedule (2.5 × effort^⅓)", value: `${fmt(scheduleMonths, d)} months` },
    { label: "Average team size to hold that schedule", value: `${fmt(teamSize, d)} people` },
    { label: "Cost per function point delivered", value: `$${fmt(costPerFp, 0)}` },
    { label: "Largest contributor", value: `${dominant} at ${fmt(typeTotals.reduce((b, t) => (t.points > b.points ? t : b), typeTotals[0]).sharePct, 1)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    ufp,
    tdi,
    vaf,
    afp,
    effort,
    cost,
    linesOfCode,
    scheduleMonths,
    teamSize,
    costPerFp,
    locPerFp: language.locPerFp,
    languageLabel: language.label,
    typeTotals,
    dominant,
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

export default function FunctionPointCalculator() {
  const [counts, setCounts] = useState<Record<string, { low: string; average: string; high: string }>>(() => ({
    ei: { low: String(DEFAULTS.ei.low), average: String(DEFAULTS.ei.average), high: String(DEFAULTS.ei.high) },
    eo: { low: String(DEFAULTS.eo.low), average: String(DEFAULTS.eo.average), high: String(DEFAULTS.eo.high) },
    eq: { low: String(DEFAULTS.eq.low), average: String(DEFAULTS.eq.average), high: String(DEFAULTS.eq.high) },
    ilf: { low: String(DEFAULTS.ilf.low), average: String(DEFAULTS.ilf.average), high: String(DEFAULTS.ilf.high) },
    eif: { low: String(DEFAULTS.eif.low), average: String(DEFAULTS.eif.average), high: String(DEFAULTS.eif.high) },
  }));
  const [profile, setProfile] = useState<string>(DEFAULTS.profile);
  const [customTdi, setCustomTdi] = useState(String(DEFAULTS.customTdi));
  const [productivity, setProductivity] = useState(String(DEFAULTS.productivity));
  const [costPerPersonMonth, setCostPerPersonMonth] = useState(String(DEFAULTS.costPerPersonMonth));
  const [language, setLanguage] = useState<string>(DEFAULTS.language);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const setCount = (key: string, complexity: "low" | "average" | "high", value: string) => {
    setCounts((prev) => ({ ...prev, [key]: { ...prev[key], [complexity]: value } }));
  };

  const getInputs = (): FpInputs => {
    const read = (key: string) => ({
      low: parseInt(counts[key].low) || 0,
      average: parseInt(counts[key].average) || 0,
      high: parseInt(counts[key].high) || 0,
    });
    return {
      ei: read("ei"),
      eo: read("eo"),
      eq: read("eq"),
      ilf: read("ilf"),
      eif: read("eif"),
      profile,
      customTdi: parseFloat(customTdi) || 0,
      productivity: parseFloat(productivity) || 0,
      costPerPersonMonth: parseFloat(costPerPersonMonth) || 0,
      language,
      decimals: parseFloat(decimals),
    };
  };

  const [calcInputs, setCalcInputs] = useState<FpInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FpResult>(() => calculateFp(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateFp(inputs));
  };

  const reset = () => {
    setCounts({
      ei: { low: String(DEFAULTS.ei.low), average: String(DEFAULTS.ei.average), high: String(DEFAULTS.ei.high) },
      eo: { low: String(DEFAULTS.eo.low), average: String(DEFAULTS.eo.average), high: String(DEFAULTS.eo.high) },
      eq: { low: String(DEFAULTS.eq.low), average: String(DEFAULTS.eq.average), high: String(DEFAULTS.eq.high) },
      ilf: { low: String(DEFAULTS.ilf.low), average: String(DEFAULTS.ilf.average), high: String(DEFAULTS.ilf.high) },
      eif: { low: String(DEFAULTS.eif.low), average: String(DEFAULTS.eif.average), high: String(DEFAULTS.eif.high) },
    });
    setProfile(DEFAULTS.profile);
    setCustomTdi(String(DEFAULTS.customTdi));
    setProductivity(String(DEFAULTS.productivity));
    setCostPerPersonMonth(String(DEFAULTS.costPerPersonMonth));
    setLanguage(DEFAULTS.language);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateFp(DEFAULTS));
  };

  const countError = (key: string) => {
    const raw = [counts[key].low, counts[key].average, counts[key].high].map((v) => parseInt(v));
    if (raw.some((v) => Number.isNaN(v))) return "Whole numbers only";
    if (raw.some((v) => v < 0)) return "Cannot be negative";
    return "";
  };
  const tdiNum = parseFloat(customTdi);
  const prodNum = parseFloat(productivity);
  const rateNum = parseFloat(costPerPersonMonth);

  const errors = {
    ei: countError("ei"),
    eo: countError("eo"),
    eq: countError("eq"),
    ilf: countError("ilf"),
    eif: countError("eif"),
    customTdi: profile === "custom" && (!Number.isFinite(tdiNum) || tdiNum < 0 || tdiNum > 70) ? "Enter 0–70" : "",
    productivity: !Number.isFinite(prodNum) || prodNum <= 0 ? "Must be greater than zero" : "",
    costPerPersonMonth: !Number.isFinite(rateNum) || rateNum < 0 ? "Cannot be negative" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is a function point?",
      answer:
        "A function point is a unit of software size based on what the system does for its users rather than how it is written. The IFPUG method counts five component types — external inputs, external outputs, external inquiries, internal logical files and external interface files — weights each one by its complexity, and totals them into unadjusted function points. Because the size is expressed in user-visible function, the same count can be compared across languages and platforms.",
    },
    {
      question: "What does the value adjustment factor do?",
      answer:
        "The value adjustment factor scales the raw count for the fourteen general system characteristics that make a project harder than its size suggests: data communications, distributed processing, performance, heavily used configuration, transaction rate, online data entry, end-user efficiency, online update, complex processing, reusability, installation ease, operational ease, multiple sites and facilitate change. Each is rated from 0 to 5, the ratings sum to a total degree of influence between 0 and 70, and VAF = 0.65 + 0.01 × TDI, so the multiplier runs from 0.65 to 1.35.",
    },
    {
      question: "How do I convert function points into effort and cost?",
      answer:
        "Divide the adjusted function point count by your delivery rate in function points per person-month, which for business applications typically sits between 5 and 15 depending on the team and the technology stack. Multiplying person-months by a blended cost per person-month gives the cost, and the two-thirds power law — schedule months equal 2.5 times the cube root of effort — gives the nominal calendar time, from which the average team size follows. Published benchmarks such as the ISBSG repository are the right place to calibrate the delivery rate for your own team.",
    },
    {
      question: "How accurate is a function point estimate?",
      answer:
        "Its accuracy depends far more on the quality of the count than on the arithmetic. The count should be derived from a data model and a transaction list rather than from a wish list, so estimating early from a vague specification will move by 30 to 50 percent once the design settles. The strength of the method is comparability: two teams that count the same way can compare size, productivity and cost per function point, and historic figures from completed releases become a calibration point for the next one.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "Function Point Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Function Point Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Component Counts by Complexity">
              {COMPONENT_TYPES.map((type) => (
                <div key={type.key} className="grid grid-cols-3 gap-3 mt-3">
                  <CompactInput
                    id={`${type.key}-low`}
                    label={`${type.short} Low`}
                    value={counts[type.key].low}
                    onChange={(v) => setCount(type.key, "low", v)}
                    onEnter={runCalculate}
                    min="0"
                    step="1"
                    suffix={`×${type.low}`}
                    error={errors[type.key as keyof typeof errors]}
                    tooltip={`${type.label} of low complexity, weighted ${type.low} function points each.`}
                  />
                  <CompactInput
                    id={`${type.key}-avg`}
                    label={`${type.short} Avg`}
                    value={counts[type.key].average}
                    onChange={(v) => setCount(type.key, "average", v)}
                    onEnter={runCalculate}
                    min="0"
                    step="1"
                    suffix={`×${type.average}`}
                    tooltip={`${type.label} of average complexity, weighted ${type.average} function points each.`}
                  />
                  <CompactInput
                    id={`${type.key}-high`}
                    label={`${type.short} High`}
                    value={counts[type.key].high}
                    onChange={(v) => setCount(type.key, "high", v)}
                    onEnter={runCalculate}
                    min="0"
                    step="1"
                    suffix={`×${type.high}`}
                    tooltip={`${type.label} of high complexity, weighted ${type.high} function points each.`}
                  />
                </div>
              ))}
            </SubSection>

            <SubSection title="Project Profile">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="profile"
                  label="Value Adjustment"
                  value={profile}
                  onChange={setProfile}
                  options={PROFILES.map((p) => ({ value: p.key, label: p.label }))}
                  tooltip="Sets the total degree of influence used in the value adjustment factor."
                />
                <CompactInput
                  id="custom-tdi"
                  label="Custom TDI"
                  value={customTdi}
                  onChange={setCustomTdi}
                  onEnter={runCalculate}
                  min="0"
                  max="70"
                  step="1"
                  error={errors.customTdi}
                  hint="Used only with a custom profile."
                  tooltip="Sum of the fourteen general system characteristics, each rated 0–5."
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
                  <SubSection title="Delivery & Cost">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="productivity"
                        label="Delivery Rate"
                        value={productivity}
                        onChange={setProductivity}
                        onEnter={runCalculate}
                        min="0.1"
                        step="any"
                        suffix="FP/PM"
                        error={errors.productivity}
                        tooltip="Function points delivered per person-month; 5 to 15 is the usual business range."
                      />
                      <CompactInput
                        id="rate"
                        label="Cost per Person-Month"
                        value={costPerPersonMonth}
                        onChange={setCostPerPersonMonth}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        error={errors.costPerPersonMonth}
                        tooltip="Blended loaded cost of one person working for one month."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactSelect
                        id="language"
                        label="Implementation Language"
                        value={language}
                        onChange={setLanguage}
                        options={LANGUAGES.map((l) => ({ value: l.key, label: l.label }))}
                        tooltip="Source lines per function point for the code-size conversion."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for the adjusted count and effort."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Adjusted Function Points</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.afp, calcInputs.decimals)} FP` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.ufp, 0)} unadjusted FP × ${fmt(results.vaf, 3)} value adjustment at TDI ${fmt(results.tdi, 0)}`
                  : "Fix the highlighted inputs to size the system"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Unadjusted FP</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.ufp, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effort</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.effort, 1)} PM` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Estimate</span>
                <span className="font-extrabold text-foreground">{results.valid ? `$${fmt(results.cost, 0)}` : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Sizing Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
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
                        Enter the component counts to size the system.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Delivered size</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.afp, calcInputs.decimals)} FP · ${fmt(results.linesOfCode, 0)} LOC`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Unadjusted FP</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.ufp, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">VAF · TDI</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.vaf, 3)} · ${fmt(results.tdi, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Adjusted FP</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.afp, 1) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effort</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.effort, 1)} PM` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Nominal schedule</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.scheduleMonths, 1)} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average team</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.teamSize, 1)} people` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Source lines</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.linesOfCode, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per FP</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `$${fmt(results.costPerFp, 0)}` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Function Point Calculator?</h2>
            <p>
              A function point calculator sizes software from the outside in. Instead of counting lines of code, it counts the
              functions the system exposes to its users and to other systems — inputs, outputs, inquiries, internal files and interface
              files — weights each one by its complexity, and adjusts the total for the project characteristics that make delivery
              harder. The result is a technology-independent number that can be turned into effort, cost, duration and code size.
            </p>
            <p>
              That independence is the point. Five hundred function points is five hundred function points whether it is built in Java,
              Python or COBOL, so estimates from a completed project in one stack can be compared with a planned project in another,
              which is what makes function point analysis the basis of benchmark repositories such as ISBSG.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The count starts with the five component types. An external input is a transaction that maintains data or changes system
              behaviour; an external output is a transaction that presents derived data; an external inquiry is a retrieval that
              presents data without changing it; an internal logical file is a group of data the system maintains; and an external
              interface file is data the system references but does not own. Each component is graded low, average or high complexity,
              which in the IFPUG method depends on the number of data element types and record types it touches.
            </p>
            <p>
              The complexity grades carry published weights: 3, 4 or 6 points for an external input, 4, 5 or 7 for an output, 3, 4 or 6
              for an inquiry, 7, 10 or 15 for an internal logical file and 5, 7 or 10 for an interface file. Multiplying each count by
              its weight and adding the results gives the unadjusted function point total, which is the pure size of the system.
            </p>
            <p>
              The adjustment that follows covers the fourteen general system characteristics, from data communications and distributed
              processing through performance, transaction rate, reusability and multiple installation sites. Each is rated from 0 to 5,
              the ratings add up to a total degree of influence of 0 to 70, and the value adjustment factor is 0.65 plus one percent of
              that total, giving a multiplier between 0.65 and 1.35. Multiplying size by the factor yields adjusted function points.
              Effort then comes from your delivery rate in function points per person-month, cost from a blended rate per person-month,
              and duration from the two-thirds power law that relates them.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the adjusted function point count with the unadjusted total and the value adjustment factor behind
              it. The three-stat bar adds the raw size, the effort in person-months and the estimated cost.
            </p>
            <p>
              The breakdown table shows what each component type contributed, the unadjusted total, the influence total and the factor
              it produced, the adjusted count, the delivery rate, effort, cost, code size in the selected language, the nominal schedule
              from the cube-root rule, the team size that schedule implies, the cost per function point and which component type
              dominates the count. The summary panel repeats the headline numbers.
            </p>
            <p>
              Handling the result well matters more than the arithmetic. Treat the delivery rate as the calibration knob: an
              eight-function-point-per-person-month team and a fifteen-function-point-per-person-month team produce estimates that
              differ by a factor of two from identical counts. The rate itself should come from your own completed work rather than from
              an industry average, since it absorbs staff seniority, tooling, process overhead and the amount of unfamiliar technology in
              the project. Recount after the design is fixed, and use the difference between the two counts as a measure of how much the
              requirements were still moving.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/function-point-calculator" />
          <PopularCalculators exclude="/calculator/function-point-calculator" />
        </div>
      </div>
    </>
  );
}
