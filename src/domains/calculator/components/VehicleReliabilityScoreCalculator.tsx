"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Wrench, ShieldCheck, DollarSign } from "lucide-react";
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

type Severity = "none" | "minor" | "moderate" | "major";

interface CategoryWeight {
  key: string;
  label: string;
  weight: number;
}

interface ReliabilityInputs {
  vehicleAge: number;
  currentMileage: number;
  unscheduledRepairs12mo: number;
  annualRepairCost: number;
  worstSeverity: Severity;
  daysOutOfService: number;
  maintenanceCompliance: number;
  openRecalls: number;
  warningLightsActive: number;
  proMode: boolean;
  vehicleValue: number;
  annualMilesDriven: number;
  extendedWarrantyCost: number;
}

interface ChartPoint {
  name: string;
  score: number;
  isTotal: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface ReliabilityResult {
  totalScore: number;
  grade: string;
  gradeColor: string;
  bandLabel: string;
  repairsPerYear: number;
  costPerMile: number;
  costPercentOfValue: number;
  availabilityPercent: number;
  chartData: ChartPoint[];
  rows: TableRow[];
  projectedAnnualCost: number;
  expectedRemainingYears: number;
  fiveYearRepairCost: number;
  warrantyBreakEven: number;
  warrantyVerdict: string;
  replaceVsRepairVerdict: string;
}

// Each dimension is scored 0-100 and combined with these weights, mirroring the
// structure published vehicle dependability studies use to aggregate problems.
const CATEGORIES: CategoryWeight[] = [
  { key: "frequency", label: "Repair Frequency", weight: 0.3 },
  { key: "cost", label: "Repair Cost", weight: 0.2 },
  { key: "severity", label: "Failure Severity", weight: 0.2 },
  { key: "downtime", label: "Availability", weight: 0.12 },
  { key: "maintenance", label: "Maintenance Compliance", weight: 0.1 },
  { key: "safety", label: "Recalls & Warnings", weight: 0.08 },
];

const SEVERITY_SCORES: Record<Severity, number> = {
  none: 100,
  minor: 78,
  moderate: 50,
  major: 15,
};

const DEFAULTS: ReliabilityInputs = {
  vehicleAge: 5,
  currentMileage: 65000,
  unscheduledRepairs12mo: 1,
  annualRepairCost: 750,
  worstSeverity: "minor",
  daysOutOfService: 3,
  maintenanceCompliance: 90,
  openRecalls: 0,
  warningLightsActive: 0,
  proMode: false,
  vehicleValue: 18000,
  annualMilesDriven: 12000,
  extendedWarrantyCost: 2400,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateReliability(i: ReliabilityInputs): ReliabilityResult {
  const age = Math.max(0, i.vehicleAge);
  const value = Math.max(1, i.vehicleValue);
  const mileage = Math.max(0, i.currentMileage);

  const repairsPerYear = Math.max(0, i.unscheduledRepairs12mo);
  // Zero unscheduled repairs scores 100; each repair costs 22 points. Accumulated
  // mileage adds a wear penalty that begins once the odometer passes 100,000 and
  // reaches its 15-point cap at 250,000.
  const mileagePenalty = clamp(((mileage - 100000) / 150000) * 15, 0, 15);
  const repairFrequencyScore = clamp(100 - repairsPerYear * 22 - mileagePenalty, 0, 100);

  // Repair spend is judged against vehicle value, not in absolute dollars, since
  // $800 means something different on a $6,000 car than on a $45,000 one.
  const costPercentOfValue = (Math.max(0, i.annualRepairCost) / value) * 100;
  const costScore = clamp(100 - costPercentOfValue * 7, 0, 100);

  const severityScore = SEVERITY_SCORES[i.worstSeverity];

  const daysDown = Math.max(0, i.daysOutOfService);
  const availabilityPercent = clamp(((365 - daysDown) / 365) * 100, 0, 100);
  // Two weeks off the road in a year is treated as total loss of availability.
  const downtimeScore = clamp(100 - (daysDown / 14) * 100, 0, 100);

  const maintenanceScore = clamp(Math.max(0, i.maintenanceCompliance), 0, 100);

  const safetyDeductions =
    Math.max(0, i.openRecalls) * 25 + Math.max(0, i.warningLightsActive) * 15;
  const safetyScore = clamp(100 - safetyDeductions, 0, 100);

  const scores: Record<string, number> = {
    frequency: repairFrequencyScore,
    cost: costScore,
    severity: severityScore,
    downtime: downtimeScore,
    maintenance: maintenanceScore,
    safety: safetyScore,
  };

  const totalScore = CATEGORIES.reduce((sum, c) => sum + scores[c.key] * c.weight, 0);

  let grade: string;
  let gradeColor: string;
  let bandLabel: string;
  if (totalScore >= 90) {
    grade = "A";
    gradeColor = "text-emerald-600";
    bandLabel = "Exceptional";
  } else if (totalScore >= 80) {
    grade = "B";
    gradeColor = "text-emerald-600";
    bandLabel = "Above Average";
  } else if (totalScore >= 70) {
    grade = "C";
    gradeColor = "text-amber-600";
    bandLabel = "Average";
  } else if (totalScore >= 60) {
    grade = "D";
    gradeColor = "text-amber-600";
    bandLabel = "Below Average";
  } else {
    grade = "F";
    gradeColor = "text-red-600";
    bandLabel = "Poor";
  }

  const milesDriven = Math.max(1, i.annualMilesDriven);
  const costPerMile = Math.max(0, i.annualRepairCost) / milesDriven;

  const chartData: ChartPoint[] = CATEGORIES.map((c) => ({
    name: c.label,
    score: Math.round(scores[c.key]),
    isTotal: false,
  }));
  chartData.push({ name: "Overall", score: Math.round(totalScore), isTotal: true });

  const rows: TableRow[] = [
    { label: "Repair Frequency (30% weight)", value: `${repairFrequencyScore.toFixed(0)} / 100` },
    { label: "Repair Cost (20% weight)", value: `${costScore.toFixed(0)} / 100` },
    { label: "Failure Severity (20% weight)", value: `${severityScore.toFixed(0)} / 100` },
    { label: "Availability (12% weight)", value: `${downtimeScore.toFixed(0)} / 100` },
    { label: "Maintenance Compliance (10% weight)", value: `${maintenanceScore.toFixed(0)} / 100` },
    { label: "Recalls & Warnings (8% weight)", value: `${safetyScore.toFixed(0)} / 100` },
    { label: "Weighted Reliability Score", value: `${totalScore.toFixed(1)} / 100`, key: true },
    { label: "Reliability Grade", value: `${grade} — ${bandLabel}` },
    { label: "Unscheduled Repairs per Year", value: repairsPerYear.toFixed(1) },
    { label: "Average Annual Mileage", value: `${Math.round(mileage / Math.max(1, age)).toLocaleString("en-US")} mi` },
    { label: "Repair Cost as % of Value", value: `${costPercentOfValue.toFixed(1)}%` },
    { label: "Repair Cost per Mile", value: `$${costPerMile.toFixed(3)}` },
    { label: "Vehicle Availability", value: `${availabilityPercent.toFixed(1)}%` },
  ];

  // Repair costs rise roughly 12% per year as components age past warranty.
  const escalation = 1.12;
  const projectedAnnualCost = Math.max(0, i.annualRepairCost) * escalation;
  let fiveYearRepairCost = 0;
  let running = Math.max(0, i.annualRepairCost);
  for (let y = 1; y <= 5; y += 1) {
    running *= escalation;
    fiveYearRepairCost += running;
  }

  // Higher-scoring vehicles are projected to remain economical longer.
  const deficit = clamp((100 - totalScore) / 100, 0, 1);
  const expectedRemainingYears = clamp(15 - age - deficit * 6, 0, 20);

  const warrantyCost = Math.max(0, i.extendedWarrantyCost);
  const warrantyBreakEven = projectedAnnualCost > 0 ? warrantyCost / projectedAnnualCost : 0;
  const warrantyVerdict =
    totalScore >= 85
      ? "Unlikely to pay off — reliability is strong"
      : warrantyBreakEven <= 3
        ? "Likely worthwhile at this repair rate"
        : "Marginal — compare against a self-funded repair reserve";

  const replaceVsRepairVerdict =
    costPercentOfValue >= 30
      ? "Annual repairs exceed 30% of value — replacement is usually cheaper"
      : costPercentOfValue >= 15
        ? "Repair costs are material — reassess at each major failure"
        : "Repair remains the economical choice";

  return {
    totalScore,
    grade,
    gradeColor,
    bandLabel,
    repairsPerYear,
    costPerMile,
    costPercentOfValue,
    availabilityPercent,
    chartData,
    rows,
    projectedAnnualCost,
    expectedRemainingYears,
    fiveYearRepairCost,
    warrantyBreakEven,
    warrantyVerdict,
    replaceVsRepairVerdict,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function VehicleReliabilityScoreCalculator() {
  const [inputs, setInputs] = useState<ReliabilityInputs>(DEFAULTS);
  const [result, setResult] = useState<ReliabilityResult>(calculateReliability(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateReliability(inputs));
  }, []);

  const calculate = () => setResult(calculateReliability(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateReliability(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof ReliabilityInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const faqs = [
    {
      question: "How is a vehicle reliability score calculated?",
      answer:
        "This score combines six weighted dimensions on a 0-100 scale: repair frequency at 30%, repair cost at 20%, failure severity at 20%, availability at 12%, maintenance compliance at 10%, and open recalls or warning lights at 8%. Frequency carries the most weight because a pattern of unscheduled repairs predicts future failures better than any single expensive one does. The structure mirrors how published dependability studies aggregate problems per hundred vehicles.",
    },
    {
      question: "Why is repair cost measured against vehicle value?",
      answer:
        "Because $800 in annual repairs means something entirely different on a $6,000 commuter car than on a $45,000 SUV. Absolute dollars compare poorly across vehicles, while cost as a percentage of value is directly actionable: once annual repairs pass roughly 30% of what the vehicle is worth, replacement usually becomes the cheaper path even after accounting for a newer vehicle's depreciation.",
    },
    {
      question: "What counts as an unscheduled repair?",
      answer:
        "Anything that was not on the maintenance schedule. Oil changes, tire rotations, brake pads at their expected interval, and scheduled fluid services are maintenance, not failures. An alternator dying at 60,000 miles, a leaking water pump, or a transmission needing attention are unscheduled repairs. Counting routine maintenance as failures makes a healthy vehicle look unreliable and defeats the purpose of the score.",
    },
    {
      question: "Why does failure severity matter separately from cost?",
      answer:
        "Because severity predicts what comes next. Four inexpensive sensor replacements and one engine rebuild might cost similar amounts, but the rebuild signals a fundamentally compromised drivetrain while the sensors do not. Major powertrain failures correlate strongly with further major failures, which is why a single engine or transmission event drops the severity dimension to 15 out of 100 regardless of the invoice.",
    },
    {
      question: "How much does maintenance compliance actually affect reliability?",
      answer:
        "Substantially, and it is the one input entirely within your control. Deferred oil changes, ignored transmission services, and skipped timing belt intervals convert what would have been routine maintenance into major failures. It carries 10% weight directly here, but its real influence is larger because it drives the frequency and severity dimensions in subsequent years.",
    },
    {
      question: "Do open recalls deserve their own penalty?",
      answer:
        "Yes, for two reasons. Recalls address defects the manufacturer has formally acknowledged as safety-relevant, so an unresolved one represents known unrepaired risk. They are also free to fix at any franchised dealer, which makes leaving one open a pure loss. Each open recall costs 25 points on the safety dimension and each active warning light costs 15.",
    },
    {
      question: "When should I replace rather than repair?",
      answer:
        "The conventional threshold is when annual repair costs exceed roughly 30% of the vehicle's current value, or when a single repair approaches half its value. Both are guidelines rather than rules; a well-maintained vehicle with one expensive but isolated failure is often still worth fixing. Professional Mode projects repair costs forward with a 12% annual escalation and gives an explicit verdict for your figures.",
    },
    {
      question: "Is an extended warranty worth buying?",
      answer:
        "It depends almost entirely on the reliability score. Above 85 the vehicle is unlikely to generate enough claims to recover the premium, and you are better served setting the same money aside as a repair fund. Below 70, with a demonstrated pattern of unscheduled repairs, a warranty can be genuinely economical. Professional Mode computes how many years of projected repairs the premium equals, which is the number that should drive the decision.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator/transportation" },
          { label: "Vehicle Reliability Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Vehicle Reliability Score Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="vehicleAge" className={lbl}>Vehicle Age (yrs)</label>
                <input id="vehicleAge" type="number" min="0" step="1" className={inp}
                  value={inputs.vehicleAge} onChange={(e) => setNum("vehicleAge", e.target.value)} />
              </div>
              <div>
                <label htmlFor="currentMileage" className={lbl}>Current Mileage</label>
                <input id="currentMileage" type="number" min="0" step="1000" className={inp}
                  value={inputs.currentMileage} onChange={(e) => setNum("currentMileage", e.target.value)} />
              </div>
              <div>
                <label htmlFor="unscheduledRepairs12mo" className={lbl}>Repairs (last 12 mo)</label>
                <input id="unscheduledRepairs12mo" type="number" min="0" step="1" className={inp}
                  value={inputs.unscheduledRepairs12mo} onChange={(e) => setNum("unscheduledRepairs12mo", e.target.value)} />
              </div>
              <div>
                <label htmlFor="annualRepairCost" className={lbl}>Repair Cost / yr</label>
                <input id="annualRepairCost" type="number" min="0" step="50" className={inp}
                  value={inputs.annualRepairCost} onChange={(e) => setNum("annualRepairCost", e.target.value)} />
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
                      <Wrench className="h-3.5 w-3.5" /> Failure Profile
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="worstSeverity" className={lbl}>Worst Failure</label>
                        <select id="worstSeverity" className={inp} value={inputs.worstSeverity}
                          onChange={(e) => setInputs((p) => ({ ...p, worstSeverity: e.target.value as Severity }))}>
                          <option value="none">No failures</option>
                          <option value="minor">Minor (wear items)</option>
                          <option value="moderate">Moderate (subsystem)</option>
                          <option value="major">Major (engine/trans)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="daysOutOfService" className={lbl}>Days Out of Service</label>
                        <input id="daysOutOfService" type="number" min="0" step="1" className={inp}
                          value={inputs.daysOutOfService} onChange={(e) => setNum("daysOutOfService", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Maintenance &amp; Safety
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="maintenanceCompliance" className={lbl}>Maintenance Done (%)</label>
                        <input id="maintenanceCompliance" type="number" min="0" max="100" step="5" className={inp}
                          value={inputs.maintenanceCompliance} onChange={(e) => setNum("maintenanceCompliance", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="openRecalls" className={lbl}>Open Recalls</label>
                        <input id="openRecalls" type="number" min="0" step="1" className={inp}
                          value={inputs.openRecalls} onChange={(e) => setNum("openRecalls", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="warningLightsActive" className={lbl}>Active Warning Lights</label>
                        <input id="warningLightsActive" type="number" min="0" step="1" className={inp}
                          value={inputs.warningLightsActive} onChange={(e) => setNum("warningLightsActive", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <DollarSign className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock cost projection and keep-or-replace analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="vehicleValue" className={lbl}>Current Value</label>
                          <input id="vehicleValue" type="number" min="1" step="500" className={inp}
                            value={inputs.vehicleValue} onChange={(e) => setNum("vehicleValue", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="annualMilesDriven" className={lbl}>Miles Driven / yr</label>
                          <input id="annualMilesDriven" type="number" min="1" step="1000" className={inp}
                            value={inputs.annualMilesDriven} onChange={(e) => setNum("annualMilesDriven", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="extendedWarrantyCost" className={lbl}>Extended Warranty Quote</label>
                          <input id="extendedWarrantyCost" type="number" min="0" step="100" className={inp}
                            value={inputs.extendedWarrantyCost} onChange={(e) => setNum("extendedWarrantyCost", e.target.value)} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Reliability Score</div>
              <div className="text-4xl font-bold text-primary my-1">{result.totalScore.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">
                Grade {result.grade} — {result.bandLabel} for a {inputs.vehicleAge}-year-old vehicle
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Grade</div>
                <div className={`text-lg font-bold ${result.gradeColor}`}>{result.grade}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Repairs / yr</div>
                <div className={`text-lg font-bold ${result.repairsPerYear <= 1 ? "text-emerald-600" : result.repairsPerYear <= 2.5 ? "text-amber-600" : "text-red-600"}`}>
                  {result.repairsPerYear.toFixed(1)}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cost / Value</div>
                <div className={`text-lg font-bold ${result.costPercentOfValue <= 10 ? "text-emerald-600" : result.costPercentOfValue <= 25 ? "text-amber-600" : "text-red-600"}`}>
                  {result.costPercentOfValue.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Scoring Dimension</th>
                    <th className="p-2.5 pr-3 text-right">Result</th>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Overall Reliability</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.totalScore.toFixed(1)} / 100</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Score by Dimension</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip formatter={(value: number) => `${value} / 100`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isTotal ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Weighted total
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Dimension score
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F59E0B" }} /> Average threshold (70)
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Cost Projection &amp; Keep-or-Replace</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Projected Next-Year Repairs</div>
                    <div className="text-base font-bold text-foreground">{money(result.projectedAnnualCost)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Five-Year Repair Total</div>
                    <div className="text-base font-bold text-amber-600">{money(result.fiveYearRepairCost)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Expected Economical Life Left</div>
                    <div className="text-base font-bold text-foreground">{result.expectedRemainingYears.toFixed(1)} years</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Warranty Break-Even</div>
                    <div className="text-base font-bold text-foreground">{result.warrantyBreakEven.toFixed(1)} years of repairs</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extended Warranty Verdict</div>
                    <div className="text-base font-bold text-foreground">{result.warrantyVerdict}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Keep or Replace</div>
                    <div className={`text-base font-bold ${result.costPercentOfValue >= 30 ? "text-red-600" : result.costPercentOfValue >= 15 ? "text-amber-600" : "text-emerald-600"}`}>
                      {result.replaceVsRepairVerdict}
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
            <h2 className="text-2xl font-bold mb-3">Turning Repair History Into a Reliability Score</h2>
            <p className="mb-4">
              Reliability is usually discussed as a brand-level abstraction, but the vehicle sitting in your driveway has
              its own history, and that history predicts its future far better than any badge does. This calculator scores
              six dimensions on a 0-100 scale and combines them by weight: repair frequency at 30%, repair cost at 20%,
              failure severity at 20%, availability at 12%, maintenance compliance at 10%, and open recalls or warning
              lights at 8%. Frequency dominates because a pattern of unscheduled repairs is the strongest single predictor
              of more repairs to come.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Severity Is Scored Separately From Cost</h2>
            <p className="mb-4">
              Two vehicles can spend identical amounts in a year and be in completely different condition. One replaced
              four inexpensive sensors; the other rebuilt a transmission. The dollar totals match but the outlooks do not,
              because major powertrain failures correlate strongly with further major failures while small electrical
              faults largely do not. That is why a single engine or transmission event drops the severity dimension to 15
              out of 100 regardless of the invoice, while a string of minor wear items leaves it near 78.
            </p>

            <h2 className="text-2xl font-bold mb-3">Measuring Cost Against Value, Not in Dollars</h2>
            <p className="mb-4">
              Absolute repair spend is nearly useless for comparison, because $800 is trivial on a $45,000 vehicle and
              alarming on a $6,000 one. Expressing repairs as a percentage of current value converts the figure into a
              decision. Below roughly 15% the vehicle remains clearly economical to keep. Between 15% and 30%, each major
              failure deserves individual reassessment. Above 30% per year, replacement is usually cheaper once you account
              for downtime and the risk of the next failure, even allowing for the depreciation a newer vehicle brings.
            </p>

            <h2 className="text-2xl font-bold mb-3">Using the Score to Decide What Comes Next</h2>
            <p>
              The score's practical value shows up in three decisions. First, whether to keep the vehicle: Professional
              Mode projects repair costs forward at a 12% annual escalation and states an explicit keep-or-replace verdict.
              Second, whether an extended warranty makes sense: above a score of 85 the premium is unlikely to be recovered
              and a self-funded repair reserve serves better, while below 70 a warranty can genuinely pay for itself.
              Third, what to fix first: the dimension chart shows exactly which factor is dragging the total down, and
              maintenance compliance and open recalls are usually the cheapest points to recover, since recall work is
              performed free of charge at any franchised dealer.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vehicle-reliability-score-calculator" />
          <PopularCalculators exclude="/calculator/vehicle-reliability-score-calculator" />
        </div>
      </div>
    </>
  );
}
