"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, ListChecks, Activity, Brain } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

type QuickKey = "selfCare" | "sphincter" | "mobility" | "cognition";

interface FimItem {
  id: string;
  label: string;
  section: string;
  domain: "motor" | "cognitive";
  quickKey: QuickKey;
}

interface FimInputs {
  selfCare: number;
  sphincter: number;
  mobility: number;
  cognition: number;
  itemized: boolean;
  items: Record<string, number>;
  proMode: boolean;
  admissionScore: number;
  lengthOfStayDays: number;
}

interface ChartPoint {
  name: string;
  achieved: number;
  max: number;
  percent: number;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface FimResult {
  totalScore: number;
  motorScore: number;
  cognitiveScore: number;
  dependencyLabel: string;
  dependencyColor: string;
  percentOfMax: number;
  sectionScores: { section: string; score: number; max: number }[];
  lowestItemLabel: string;
  lowestItemLevel: number;
  chartData: ChartPoint[];
  rows: TableRow[];
  helperMinutesPerDay: number;
  fimGain: number;
  fimEfficiency: number;
  dischargeGuidance: string;
  burdenLabel: string;
}

// The FIM instrument scores 18 items on a 7-level ordinal scale.
// 13 motor items (range 13-91) and 5 cognitive items (range 5-35),
// giving a total range of 18 (total assistance) to 126 (full independence).
const ITEMS: FimItem[] = [
  { id: "eating", label: "Eating", section: "Self-Care", domain: "motor", quickKey: "selfCare" },
  { id: "grooming", label: "Grooming", section: "Self-Care", domain: "motor", quickKey: "selfCare" },
  { id: "bathing", label: "Bathing", section: "Self-Care", domain: "motor", quickKey: "selfCare" },
  { id: "dressUpper", label: "Dressing — Upper Body", section: "Self-Care", domain: "motor", quickKey: "selfCare" },
  { id: "dressLower", label: "Dressing — Lower Body", section: "Self-Care", domain: "motor", quickKey: "selfCare" },
  { id: "toileting", label: "Toileting", section: "Self-Care", domain: "motor", quickKey: "selfCare" },
  { id: "bladder", label: "Bladder Management", section: "Sphincter Control", domain: "motor", quickKey: "sphincter" },
  { id: "bowel", label: "Bowel Management", section: "Sphincter Control", domain: "motor", quickKey: "sphincter" },
  { id: "transferBed", label: "Transfer — Bed / Chair / Wheelchair", section: "Transfers", domain: "motor", quickKey: "mobility" },
  { id: "transferToilet", label: "Transfer — Toilet", section: "Transfers", domain: "motor", quickKey: "mobility" },
  { id: "transferTub", label: "Transfer — Tub / Shower", section: "Transfers", domain: "motor", quickKey: "mobility" },
  { id: "locomotion", label: "Locomotion — Walk / Wheelchair", section: "Locomotion", domain: "motor", quickKey: "mobility" },
  { id: "stairs", label: "Locomotion — Stairs", section: "Locomotion", domain: "motor", quickKey: "mobility" },
  { id: "comprehension", label: "Comprehension", section: "Communication", domain: "cognitive", quickKey: "cognition" },
  { id: "expression", label: "Expression", section: "Communication", domain: "cognitive", quickKey: "cognition" },
  { id: "socialInteraction", label: "Social Interaction", section: "Social Cognition", domain: "cognitive", quickKey: "cognition" },
  { id: "problemSolving", label: "Problem Solving", section: "Social Cognition", domain: "cognitive", quickKey: "cognition" },
  { id: "memory", label: "Memory", section: "Social Cognition", domain: "cognitive", quickKey: "cognition" },
];

const SECTIONS = ["Self-Care", "Sphincter Control", "Transfers", "Locomotion", "Communication", "Social Cognition"];

const LEVEL_LABELS: Record<number, string> = {
  7: "7 — Complete Independence",
  6: "6 — Modified Independence (device)",
  5: "5 — Supervision or Setup",
  4: "4 — Minimal Assistance (75%+ self)",
  3: "3 — Moderate Assistance (50-74% self)",
  2: "2 — Maximal Assistance (25-49% self)",
  1: "1 — Total Assistance (under 25% self)",
};

// Illustrative helper-time model: the burden of care rises steeply as a task
// moves from supervision toward total assistance.
const HELPER_MINUTES_BY_LEVEL: Record<number, number> = {
  7: 0,
  6: 0,
  5: 5,
  4: 10,
  3: 20,
  2: 32,
  1: 45,
};

const DEFAULT_ITEMS: Record<string, number> = ITEMS.reduce<Record<string, number>>((acc, item) => {
  acc[item.id] = item.domain === "cognitive" ? 6 : 5;
  return acc;
}, {});

const DEFAULTS: FimInputs = {
  selfCare: 5,
  sphincter: 5,
  mobility: 4,
  cognition: 6,
  itemized: false,
  items: DEFAULT_ITEMS,
  proMode: false,
  admissionScore: 62,
  lengthOfStayDays: 21,
};

function clampLevel(value: number): number {
  return Math.min(7, Math.max(1, Math.round(value)));
}

export function calculateFim(i: FimInputs): FimResult {
  const quick: Record<QuickKey, number> = {
    selfCare: clampLevel(i.selfCare),
    sphincter: clampLevel(i.sphincter),
    mobility: clampLevel(i.mobility),
    cognition: clampLevel(i.cognition),
  };

  const levelFor = (item: FimItem): number =>
    i.itemized ? clampLevel(i.items[item.id] ?? quick[item.quickKey]) : quick[item.quickKey];

  let motorScore = 0;
  let cognitiveScore = 0;
  let helperMinutesPerDay = 0;
  let lowestItemLabel = ITEMS[0].label;
  let lowestItemLevel = 7;

  const sectionTotals: Record<string, number> = {};
  const sectionMax: Record<string, number> = {};

  ITEMS.forEach((item) => {
    const level = levelFor(item);
    if (item.domain === "motor") {
      motorScore += level;
      helperMinutesPerDay += HELPER_MINUTES_BY_LEVEL[level];
    } else {
      cognitiveScore += level;
    }
    if (level < lowestItemLevel) {
      lowestItemLevel = level;
      lowestItemLabel = item.label;
    }
    sectionTotals[item.section] = (sectionTotals[item.section] ?? 0) + level;
    sectionMax[item.section] = (sectionMax[item.section] ?? 0) + 7;
  });

  const totalScore = motorScore + cognitiveScore;
  const percentOfMax = (totalScore / 126) * 100;

  let dependencyLabel: string;
  let dependencyColor: string;
  if (totalScore >= 116) {
    dependencyLabel = "Independent";
    dependencyColor = "text-emerald-600";
  } else if (totalScore >= 91) {
    dependencyLabel = "Modified Independence";
    dependencyColor = "text-emerald-600";
  } else if (totalScore >= 62) {
    dependencyLabel = "Modified Dependence";
    dependencyColor = "text-amber-600";
  } else if (totalScore >= 37) {
    dependencyLabel = "Moderate Dependence";
    dependencyColor = "text-amber-600";
  } else {
    dependencyLabel = "Complete Dependence";
    dependencyColor = "text-red-600";
  }

  const sectionScores = SECTIONS.map((section) => ({
    section,
    score: sectionTotals[section] ?? 0,
    max: sectionMax[section] ?? 0,
  }));

  const chartData: ChartPoint[] = sectionScores.map((s) => ({
    name: s.section,
    achieved: s.score,
    max: s.max,
    percent: s.max > 0 ? (s.score / s.max) * 100 : 0,
  }));

  const rows: TableRow[] = [
    ...sectionScores.map((s) => ({
      label: `${s.section} (${s.max / 7} items)`,
      value: `${s.score} / ${s.max}`,
    })),
    { label: "Motor Subscale (13 items)", value: `${motorScore} / 91` },
    { label: "Cognitive Subscale (5 items)", value: `${cognitiveScore} / 35` },
    { label: "Total FIM Score", value: `${totalScore} / 126`, key: true },
    { label: "Percent of Maximum", value: `${percentOfMax.toFixed(1)}%` },
    { label: "Dependency Category", value: dependencyLabel },
    { label: "Lowest-Scoring Item", value: `${lowestItemLabel} (level ${lowestItemLevel})` },
  ];

  const los = Math.max(1, i.lengthOfStayDays);
  const admission = Math.min(126, Math.max(18, i.admissionScore));
  const fimGain = totalScore - admission;
  const fimEfficiency = fimGain / los;

  let dischargeGuidance: string;
  if (totalScore >= 110) {
    dischargeGuidance = "Consistent with discharge to home without paid attendant care";
  } else if (totalScore >= 80) {
    dischargeGuidance = "Home discharge typically feasible with intermittent family assistance";
  } else if (totalScore >= 60) {
    dischargeGuidance = "Home discharge usually requires substantial daily caregiver support";
  } else {
    dischargeGuidance = "Level of assistance generally exceeds what unpaid caregivers sustain at home";
  }

  const burdenLabel =
    helperMinutesPerDay <= 15
      ? "Minimal"
      : helperMinutesPerDay <= 60
        ? "Moderate"
        : helperMinutesPerDay <= 150
          ? "Substantial"
          : "Extensive";

  return {
    totalScore,
    motorScore,
    cognitiveScore,
    dependencyLabel,
    dependencyColor,
    percentOfMax,
    sectionScores,
    lowestItemLabel,
    lowestItemLevel,
    chartData,
    rows,
    helperMinutesPerDay,
    fimGain,
    fimEfficiency,
    dischargeGuidance,
    burdenLabel,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const LEVEL_OPTIONS = [7, 6, 5, 4, 3, 2, 1];

export default function FunctionalIndependenceMeasureScoreCalculator() {
  const [inputs, setInputs] = useState<FimInputs>(DEFAULTS);
  const [result, setResult] = useState<FimResult>(calculateFim(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateFim(inputs));
  }, []);

  const calculate = () => setResult(calculateFim(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateFim(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof FimInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const setItem = (id: string, raw: string) => {
    const parsed = parseInt(raw, 10);
    setInputs((prev) => ({
      ...prev,
      items: { ...prev.items, [id]: isNaN(parsed) ? 1 : parsed },
    }));
  };

  const faqs = [
    {
      question: "What is the Functional Independence Measure?",
      answer:
        "The FIM is an 18-item ordinal instrument that quantifies how much assistance a person needs to perform everyday activities. Thirteen motor items cover self-care, sphincter control, transfers, and locomotion; five cognitive items cover comprehension, expression, social interaction, problem solving, and memory. Each item is rated from 1 to 7, giving a total between 18 and 126.",
    },
    {
      question: "What do the seven levels mean?",
      answer:
        "Level 7 is complete independence with no device and no unusual time. Level 6 is modified independence, meaning the person needs an assistive device, extra time, or has safety considerations but no helper. Level 5 is supervision or setup only. Levels 4, 3, and 2 are minimal, moderate, and maximal assistance, defined by the share of effort the person contributes themselves — over 75%, 50 to 74%, and 25 to 49% respectively. Level 1 is total assistance, under 25% self-effort.",
    },
    {
      question: "What is a good FIM score?",
      answer:
        "There is no universal cutoff, because interpretation depends on diagnosis and setting. As broad bands, 116 to 126 reflects independence, 91 to 115 modified independence, 62 to 90 modified dependence, 37 to 61 moderate dependence, and 18 to 36 complete dependence. The score is most useful compared against the same person at an earlier date rather than against a population norm.",
    },
    {
      question: "Why are the motor and cognitive subscales reported separately?",
      answer:
        "Because they behave differently and drive different care decisions. The motor subscale ranges from 13 to 91 and predicts physical assistance hours and equipment needs. The cognitive subscale ranges from 5 to 35 and predicts supervision needs, safety risk, and the ability to direct one's own care. A person can score well on one and poorly on the other, and a combined total alone would hide that.",
    },
    {
      question: "What is FIM efficiency?",
      answer:
        "FIM efficiency is the change in total score divided by the length of stay in days, giving points of functional gain per day. It is used in inpatient rehabilitation to compare the rate of improvement across patients and programs, since a 20-point gain over 10 days represents a very different trajectory than the same gain over 60 days. Professional Mode calculates it from an admission score and a length of stay.",
    },
    {
      question: "Should I use the grouped scores or the itemized entry?",
      answer:
        "Use the grouped scores for a quick estimate when the person performs at a fairly uniform level across a domain. Switch on itemized entry in Advanced Options when abilities vary within a domain, which is common — someone may eat independently at level 7 while needing maximal assistance with lower-body dressing at level 2. Itemized entry gives the accurate total and identifies the specific limiting item.",
    },
    {
      question: "How is the caregiver time estimate derived?",
      answer:
        "It is an illustrative model, not part of the FIM instrument. Each motor item is assigned daily helper minutes based on its level: nothing at levels 6 and 7, 5 minutes at level 5, then 10, 20, 32, and 45 minutes as the level drops to 1. The total gives a rough sense of physical assistance burden and how it scales, but actual caregiver time varies widely with home layout, equipment, and the individual.",
    },
    {
      question: "Can this replace a clinical FIM assessment?",
      answer:
        "No. A formal FIM rating requires a trained and credentialed assessor observing actual performance, not reported ability, and it follows detailed decision rules for each item. This calculator reproduces the scoring arithmetic and the interpretive bands so you can understand a score, track changes, or prepare for a discussion with a rehabilitation team. Treatment and discharge decisions should rest on the clinical assessment.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator/health" },
          { label: "Functional Independence Measure Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Functional Independence Measure Score Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="selfCare" className={lbl}>Self-Care Level</label>
                <select id="selfCare" className={inp} value={inputs.selfCare}
                  onChange={(e) => setNum("selfCare", e.target.value)} disabled={inputs.itemized}>
                  {LEVEL_OPTIONS.map((lv) => (
                    <option key={lv} value={lv}>{lv} — {LEVEL_LABELS[lv].split("— ")[1]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sphincter" className={lbl}>Sphincter Control</label>
                <select id="sphincter" className={inp} value={inputs.sphincter}
                  onChange={(e) => setNum("sphincter", e.target.value)} disabled={inputs.itemized}>
                  {LEVEL_OPTIONS.map((lv) => (
                    <option key={lv} value={lv}>{lv} — {LEVEL_LABELS[lv].split("— ")[1]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mobility" className={lbl}>Transfers &amp; Locomotion</label>
                <select id="mobility" className={inp} value={inputs.mobility}
                  onChange={(e) => setNum("mobility", e.target.value)} disabled={inputs.itemized}>
                  {LEVEL_OPTIONS.map((lv) => (
                    <option key={lv} value={lv}>{lv} — {LEVEL_LABELS[lv].split("— ")[1]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cognition" className={lbl}>Cognition</label>
                <select id="cognition" className={inp} value={inputs.cognition}
                  onChange={(e) => setNum("cognition", e.target.value)} disabled={inputs.itemized}>
                  {LEVEL_OPTIONS.map((lv) => (
                    <option key={lv} value={lv}>{lv} — {LEVEL_LABELS[lv].split("— ")[1]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <ListChecks className="h-3.5 w-3.5" /> Itemized Entry
                    </div>
                    <label htmlFor="itemized" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="itemized" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.itemized}
                        onChange={(e) => setInputs((p) => ({ ...p, itemized: e.target.checked }))} />
                      Score all 18 items individually
                    </label>
                    {inputs.itemized ? (
                      <div className="flex flex-col gap-3">
                        {SECTIONS.map((section) => (
                          <div key={section}>
                            <div className="text-xs font-bold text-foreground mb-1.5">{section}</div>
                            <div className="grid grid-cols-2 gap-3">
                              {ITEMS.filter((it) => it.section === section).map((it) => (
                                <div key={it.id}>
                                  <label htmlFor={it.id} className={lbl}>{it.label}</label>
                                  <select id={it.id} className={inp} value={inputs.items[it.id] ?? 5}
                                    onChange={(e) => setItem(it.id, e.target.value)}>
                                    {LEVEL_OPTIONS.map((lv) => (
                                      <option key={lv} value={lv}>{lv}</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Activity className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock FIM efficiency, care burden, and discharge guidance
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="admissionScore" className={lbl}>Admission FIM</label>
                          <input id="admissionScore" type="number" min="18" max="126" step="1" className={inp}
                            value={inputs.admissionScore} onChange={(e) => setNum("admissionScore", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="lengthOfStayDays" className={lbl}>Length of Stay (days)</label>
                          <input id="lengthOfStayDays" type="number" min="1" step="1" className={inp}
                            value={inputs.lengthOfStayDays} onChange={(e) => setNum("lengthOfStayDays", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total FIM Score</div>
              <div className="text-4xl font-bold text-primary my-1">{result.totalScore}</div>
              <div className="text-sm text-muted-foreground">
                {result.dependencyLabel} — {result.percentOfMax.toFixed(0)}% of the 126-point maximum
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Motor</div>
                <div className={`text-lg font-bold ${result.motorScore >= 70 ? "text-emerald-600" : result.motorScore >= 45 ? "text-amber-600" : "text-red-600"}`}>
                  {result.motorScore} / 91
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cognitive</div>
                <div className={`text-lg font-bold ${result.cognitiveScore >= 28 ? "text-emerald-600" : result.cognitiveScore >= 18 ? "text-amber-600" : "text-red-600"}`}>
                  {result.cognitiveScore} / 35
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Dependency</div>
                <div className={`text-lg font-bold ${result.dependencyColor}`}>{result.dependencyLabel}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Domain</th>
                    <th className="p-2.5 pr-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Total (18 items)</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.totalScore} / 126</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Independence by Domain (% of domain maximum)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip formatter={(value: number) => `${value.toFixed(0)}%`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <ReferenceLine y={71.4} stroke="#F59E0B" strokeDasharray="4 4" />
                    <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name}
                          fill={point.percent >= 85 ? "#10B981" : point.percent >= 60 ? "#F59E0B" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10B981" }} /> Independent (85%+)
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F59E0B" }} /> Needs help (60-84%)
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#EF4444" }} /> Dependent (under 60%)
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F59E0B" }} /> Dashed line: level 5 of 7
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-primary" /> Rehabilitation Progress &amp; Care Burden
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">FIM Gain</div>
                    <div className={`text-base font-bold ${result.fimGain > 0 ? "text-emerald-600" : result.fimGain < 0 ? "text-red-600" : "text-foreground"}`}>
                      {result.fimGain > 0 ? "+" : ""}{result.fimGain} points
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">FIM Efficiency</div>
                    <div className="text-base font-bold text-foreground">{result.fimEfficiency.toFixed(2)} pts / day</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Estimated Helper Time</div>
                    <div className="text-base font-bold text-foreground">{result.helperMinutesPerDay} min / day</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Care Burden</div>
                    <div className={`text-base font-bold ${result.helperMinutesPerDay <= 15 ? "text-emerald-600" : result.helperMinutesPerDay <= 150 ? "text-amber-600" : "text-red-600"}`}>
                      {result.burdenLabel}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Discharge Setting Guidance</div>
                    <div className="text-base font-bold text-foreground">{result.dischargeGuidance}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Priority Item for Therapy</div>
                    <div className="text-base font-bold text-foreground">
                      {result.lowestItemLabel} — currently level {result.lowestItemLevel}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the FIM Actually Measures</h2>
            <p className="mb-4">
              The Functional Independence Measure answers one deliberately narrow question: how much help does this person
              need? It does not measure impairment, diagnosis, or motivation. Eighteen items are rated from 1 to 7, where
              the middle levels are defined by the proportion of the effort the person supplies themselves — more than 75%
              earns a 4, half to three-quarters earns a 3, a quarter to half earns a 2. That grounding in observable
              burden of assistance is why the instrument transfers cleanly between clinicians and why totals can be
              compared over time.
            </p>

            <h2 className="text-2xl font-bold mb-3">Reading the Motor and Cognitive Subscales Separately</h2>
            <p className="mb-4">
              The 13 motor items produce a subscale from 13 to 91, and the 5 cognitive items produce one from 5 to 35.
              These predict different things. A low motor score points toward physical assistance, equipment, and home
              modification. A low cognitive score points toward supervision, safety risk, and limits on directing one's own
              care. Someone can transfer independently yet be unsafe alone because of memory and problem-solving deficits,
              and a single 126-point total would conceal exactly that. This calculator always reports both subscales
              alongside the total.
            </p>

            <h2 className="text-2xl font-bold mb-3">Interpretation Bands and Their Limits</h2>
            <p className="mb-4">
              As broad guidance, 116 to 126 reflects independence, 91 to 115 modified independence, 62 to 90 modified
              dependence, 37 to 61 moderate dependence, and 18 to 36 complete dependence. These bands are orientation
              aids rather than clinical thresholds. A stroke survivor at 85 and a spinal cord injury patient at 85 face
              different trajectories, and the same number means different things at admission than at discharge. The most
              informative use of a FIM score is longitudinal — the same person measured repeatedly by the same method.
            </p>

            <h2 className="text-2xl font-bold mb-3">FIM Gain, Efficiency, and Discharge Planning</h2>
            <p>
              Inpatient rehabilitation programs track FIM gain, the difference between discharge and admission totals, and
              FIM efficiency, that gain divided by length of stay. Efficiency matters because a 20-point improvement over
              two weeks and the same improvement over two months describe very different recoveries. Professional Mode
              computes both, estimates daily helper minutes from the motor item levels, and identifies the lowest-scoring
              item, which is usually where therapy yields the largest change in real independence. Note that the helper-time
              estimate is an illustrative model rather than part of the validated instrument, and that a formal FIM rating
              requires a trained assessor observing actual performance rather than reported ability.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/functional-independence-measure-score-calculator" />
          <PopularCalculators exclude="/calculator/functional-independence-measure-score-calculator" />
        </div>
      </div>
    </>
  );
}
