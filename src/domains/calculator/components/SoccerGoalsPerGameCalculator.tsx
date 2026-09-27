"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type PositionKey = "striker" | "forward" | "winger" | "midfielder" | "dm" | "defender";

interface PositionBand {
  key: PositionKey;
  label: string;
  low: number;
  high: number;
}

/** Typical top-division goals-per-appearance bands by role, used only as context. */
const POSITIONS: PositionBand[] = [
  { key: "striker", label: "Striker / centre-forward", low: 0.45, high: 0.8 },
  { key: "forward", label: "Forward (wide or withdrawn)", low: 0.3, high: 0.65 },
  { key: "winger", label: "Winger", low: 0.2, high: 0.45 },
  { key: "midfielder", label: "Central midfielder", low: 0.1, high: 0.3 },
  { key: "dm", label: "Defensive midfielder", low: 0.05, high: 0.15 },
  { key: "defender", label: "Defender / goalkeeper", low: 0.0, high: 0.1 },
];

const SEASON_PRESETS: Record<string, number> = {
  "38": 38,
  "34": 34,
  "46": 46,
};

interface SoccerInputs {
  goals: number;
  appearances: number;
  minutesPerAppearance: number;
  seasonMatches: number;
  position: PositionKey;
  teamGoalsPerMatch: number;
  decimals: number;
}

const DEFAULTS: SoccerInputs = {
  goals: 12,
  appearances: 20,
  minutesPerAppearance: 80,
  seasonMatches: 38,
  position: "striker",
  teamGoalsPerMatch: 1.5,
  decimals: 2,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SoccerResult {
  valid: boolean;
  errorMsg: string;
  goalsPerGame: number;
  goalsPer90: number;
  minutesPerGoal: number;
  goalsPer1000: number;
  totalMinutes: number;
  minutesPerAppearance: number;
  projectedSeason: number;
  hundredMinuteRate: number;
  teamGoalShare: number;
  band: PositionBand;
  bandVerdict: string;
  bandColor: string;
  sampleNote: string;
  sampleReliable: boolean;
  breakdown: BreakdownRow[];
}

function calculateGoals(input: SoccerInputs): SoccerResult {
  const band = POSITIONS.find((p) => p.key === input.position) || POSITIONS[0];
  const blank = (errorMsg: string): SoccerResult => ({
    valid: false,
    errorMsg,
    goalsPerGame: 0,
    goalsPer90: 0,
    minutesPerGoal: 0,
    goalsPer1000: 0,
    totalMinutes: 0,
    minutesPerAppearance: 0,
    projectedSeason: 0,
    hundredMinuteRate: 0,
    teamGoalShare: 0,
    band,
    bandVerdict: "",
    bandColor: "text-muted-foreground",
    sampleNote: "",
    sampleReliable: false,
    breakdown: [],
  });

  const nums = [
    input.goals,
    input.appearances,
    input.minutesPerAppearance,
    input.seasonMatches,
    input.teamGoalsPerMatch,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to work out the scoring rate.");
  if (input.goals < 0) return blank("Goals scored cannot be negative.");
  if (input.appearances <= 0) return blank("Appearances must be greater than zero.");
  if (input.minutesPerAppearance <= 0) return blank("Minutes per appearance must be greater than zero.");
  if (input.minutesPerAppearance > 120) return blank("A single appearance cannot exceed 120 minutes.");
  if (input.seasonMatches <= 0) return blank("Season length must be greater than zero.");
  if (input.teamGoalsPerMatch < 0) return blank("Team goals per match cannot be negative.");
  if (input.goals < input.appearances * 0 && input.appearances < input.goals / 10) {
    return blank("Check the goals and appearances figures — the rate looks implausible.");
  }

  const d = Math.max(0, Math.min(4, input.decimals));
  const totalMinutes = input.appearances * input.minutesPerAppearance;
  const goalsPerGame = input.goals / input.appearances;
  const goalsPer90 = totalMinutes > 0 ? (input.goals / totalMinutes) * 90 : 0;
  const goalsPer1000 = totalMinutes > 0 ? (input.goals / totalMinutes) * 1000 : 0;
  const minutesPerGoal = input.goals > 0 ? totalMinutes / input.goals : 0;
  const projectedSeason = goalsPerGame * input.seasonMatches;
  const teamGoalShare = input.teamGoalsPerMatch > 0 ? goalsPerGame / input.teamGoalsPerMatch : 0;

  const bandVerdict =
    input.appearances < 5
      ? "Sample too small to compare"
      : goalsPerGame > band.high
        ? "Above the typical band"
        : goalsPerGame < band.low
          ? "Below the typical band"
          : "Inside the typical band";
  const bandColor =
    bandVerdict === "Above the typical band"
      ? "text-emerald-600"
      : bandVerdict === "Below the typical band"
        ? "text-orange-600"
        : bandVerdict === "Inside the typical band"
          ? "text-foreground"
          : "text-muted-foreground";

  const sampleReliable = input.appearances >= 25;
  const sampleNote = sampleReliable
    ? "Sample of 25+ appearances — the rate has largely stabilised."
    : `Only ${input.appearances} appearance${input.appearances === 1 ? "" : "s"} — treat the rate as preliminary.`;

  const breakdown: BreakdownRow[] = [
    { label: "Goals scored", value: fmt(input.goals, 0) },
    { label: "Appearances", value: fmt(input.appearances, 0) },
    { label: "Minutes played", value: fmt(totalMinutes, 0) },
    { label: "Minutes per appearance", value: fmt(input.minutesPerAppearance, 1) },
    { label: "Goals per game", value: fmt(goalsPerGame, d), highlight: true },
    { label: "Goals per 90 minutes", value: fmt(goalsPer90, d) },
    { label: "Goals per 1,000 minutes", value: fmt(goalsPer1000, d) },
    { label: "Minutes per goal", value: input.goals > 0 ? fmt(minutesPerGoal, 0) : "—" },
    { label: `Projected over ${fmt(input.seasonMatches, 0)} matches`, value: fmt(projectedSeason, 1) },
    { label: "Share of team goals per match", value: `${fmt(teamGoalShare * 100, 1)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    goalsPerGame,
    goalsPer90,
    minutesPerGoal,
    goalsPer1000,
    totalMinutes,
    minutesPerAppearance: input.minutesPerAppearance,
    projectedSeason,
    hundredMinuteRate: goalsPer1000,
    teamGoalShare,
    band,
    bandVerdict,
    bandColor,
    sampleNote,
    sampleReliable,
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

export default function SoccerGoalsPerGameCalculator() {
  const [goals, setGoals] = useState(String(DEFAULTS.goals));
  const [appearances, setAppearances] = useState(String(DEFAULTS.appearances));
  const [minutesPerAppearance, setMinutesPerAppearance] = useState(String(DEFAULTS.minutesPerAppearance));
  const [seasonMatches, setSeasonMatches] = useState(String(DEFAULTS.seasonMatches));
  const [position, setPosition] = useState<string>(DEFAULTS.position);
  const [teamGoalsPerMatch, setTeamGoalsPerMatch] = useState(String(DEFAULTS.teamGoalsPerMatch));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SoccerInputs => ({
    goals: parseFloat(goals) || 0,
    appearances: parseFloat(appearances) || 0,
    minutesPerAppearance: parseFloat(minutesPerAppearance) || 0,
    seasonMatches: parseFloat(seasonMatches) || 0,
    position: position as PositionKey,
    teamGoalsPerMatch: parseFloat(teamGoalsPerMatch) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<SoccerInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SoccerResult>(() => calculateGoals(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateGoals(inputs));
  };

  const reset = () => {
    setGoals(String(DEFAULTS.goals));
    setAppearances(String(DEFAULTS.appearances));
    setMinutesPerAppearance(String(DEFAULTS.minutesPerAppearance));
    setSeasonMatches(String(DEFAULTS.seasonMatches));
    setPosition(DEFAULTS.position);
    setTeamGoalsPerMatch(String(DEFAULTS.teamGoalsPerMatch));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateGoals(DEFAULTS));
  };

  const goalsNum = parseFloat(goals);
  const appsNum = parseFloat(appearances);
  const minsNum = parseFloat(minutesPerAppearance);
  const seasonNum = parseFloat(seasonMatches);

  const errors = {
    goals: !Number.isFinite(goalsNum) || goalsNum < 0 ? "Enter zero or more goals" : "",
    appearances: !Number.isFinite(appsNum) || appsNum <= 0 ? "Must be greater than zero" : "",
    minutesPerAppearance: !Number.isFinite(minsNum) || minsNum <= 0 || minsNum > 120 ? "Use 1–120 minutes" : "",
    seasonMatches: !Number.isFinite(seasonNum) || seasonNum <= 0 ? "Must be greater than zero" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is a good goals-per-game rate?",
      answer:
        "The typical band depends on the role. Defenders sit near 0.05 goals per appearance, central midfielders around 0.10 to 0.30, wingers 0.20 to 0.45 and centre-forwards 0.45 to 0.80. Above roughly 0.80 over a full season is elite-poacher territory, which is about a goal every game or better once appearances are counted rather than minutes.",
    },
    {
      question: "Why use goals per 90 minutes instead of goals per game?",
      answer:
        "Goals per game rewards players who always complete matches and penalises substitutes, even when they score at a high rate. Goals per 90 normalises for playing time, so a forward who scores four times in 300 substitute minutes is not hidden by a modest appearance count. Analysts normally quote both: the per-90 rate for efficiency and the per-game rate for expectation.",
    },
    {
      question: "How do I project a full season?",
      answer:
        "Multiply the goals-per-appearance rate by the number of league matches. A 38-match league is the standard in most top European divisions, 34 matches covers MLS, and the Championship runs to 46. The projection assumes the same role, the same minutes and the same finishing rate, which is why the calculator flags samples under 25 appearances as preliminary.",
    },
    {
      question: "How many matches before the rate is meaningful?",
      answer:
        "Scoring rates are noisy. One hat-trick in a five-match sample can double the apparent rate, and a single goalless month can halve it. Rates usually stabilise somewhere after 25 appearances, or roughly 2,000 minutes, which is why the calculator reports an explicit reliability note alongside every figure it produces.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Soccer Goals Per Game Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Soccer Goals Per Game Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Scoring Record">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="goals"
                  label="Goals Scored"
                  value={goals}
                  onChange={setGoals}
                  onEnter={runCalculate}
                  min="0"
                  step="1"
                  error={errors.goals}
                  tooltip="Total goals in the period you are measuring."
                />
                <CompactInput
                  id="appearances"
                  label="Appearances"
                  value={appearances}
                  onChange={setAppearances}
                  onEnter={runCalculate}
                  min="1"
                  step="1"
                  error={errors.appearances}
                  tooltip="Matches played, including substitute appearances."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="minutes-per-appearance"
                  label="Minutes per Appearance"
                  value={minutesPerAppearance}
                  onChange={setMinutesPerAppearance}
                  onEnter={runCalculate}
                  min="1"
                  max="120"
                  step="1"
                  suffix="min"
                  error={errors.minutesPerAppearance}
                  hint="90 for a full match; lower for substitutes."
                  tooltip="Average minutes on the pitch in each appearance."
                />
                <CompactInput
                  id="season-matches"
                  label="Season Length"
                  value={seasonMatches}
                  onChange={setSeasonMatches}
                  onEnter={runCalculate}
                  min="1"
                  step="1"
                  suffix="games"
                  error={errors.seasonMatches}
                  hint="38 in most top European leagues, 34 in MLS, 46 in the Championship."
                  tooltip="Matches in a full season, used for the projection."
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
                  <SubSection title="Benchmarks">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="position"
                        label="Position"
                        value={position}
                        onChange={setPosition}
                        options={POSITIONS.map((p) => ({ value: p.key, label: p.label }))}
                        tooltip="Sets the typical scoring band the rate is compared against."
                      />
                      <CompactInput
                        id="team-goals"
                        label="Team Goals per Match"
                        value={teamGoalsPerMatch}
                        onChange={setTeamGoalsPerMatch}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        tooltip="Used to show how much of the team's scoring the player accounts for."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="4"
                        step="1"
                        tooltip="How many digits to show after the decimal point."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Goals per Game</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.goalsPerGame, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(calcInputs.goals, 0)} goals in ${fmt(calcInputs.appearances, 0)} appearances · ${fmt(results.projectedSeason, 1)} projected over ${fmt(calcInputs.seasonMatches, 0)} matches`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per 90 min</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.goalsPer90, calcInputs.decimals) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Min per Goal</span>
                <span className="font-extrabold text-foreground">
                  {results.valid && results.minutesPerGoal > 0 ? fmt(results.minutesPerGoal, 0) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Season Total</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.projectedSeason, 1)} gls` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Scoring Measure</th>
                    <th className="p-2.5 pr-3 text-right w-[180px]">Value</th>
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
                        Enter a scoring record to see the rate breakdown.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Goals per game (rate used above)</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.goalsPerGame, calcInputs.decimals)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Goals</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(calcInputs.goals, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Appearances</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(calcInputs.appearances, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Minutes played</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.totalMinutes, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Goals per 90</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.goalsPer90, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Goals per 1,000 min</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.hundredMinuteRate, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Share of team goals</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && calcInputs.teamGoalsPerMatch > 0 ? `${fmt(results.teamGoalShare * 100, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Benchmark · {results.band.label}
                  </span>
                  <span className={`text-base font-bold ${results.bandColor}`}>
                    {results.valid ? `${fmt(results.band.low, 2)}–${fmt(results.band.high, 2)} · ${results.bandVerdict}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sample reliability</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? (results.sampleReliable ? "Stabilised" : "Preliminary") : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className="text-[11px] text-muted-foreground mt-3">{results.sampleNote}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Soccer Goals Per Game Calculator?</h2>
            <p>
              A soccer goals per game calculator turns a scoring record into the standard rates used to judge a player: goals per
              appearance, goals per ninety minutes, goals per thousand minutes, minutes per goal, and a projection across a full
              season. It also compares the rate against the typical band for the player's position so the number has context rather
              than standing alone.
            </p>
            <p>
              Raw goal totals say very little on their own. Twelve goals across twenty appearances is a strong return; the same
              twelve goals across forty appearances is ordinary. Position matters too, because a centre-back scoring five times in
              a season is performing at a very different level from a striker who does the same. The calculator exists to separate
              the record from the meaning of the record.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The core rate is simply goals divided by appearances, which gives the goals-per-game figure shown in the primary
              card. Playing time then refines it. Total minutes are appearances multiplied by the average minutes per appearance,
              and dividing total minutes into ninety gives goals per ninety, the measure analysts prefer because it treats a
              twenty-minute substitute appearance differently from a full match.
            </p>
            <p>
              Minutes per goal inverts the same relationship and is often the easiest figure to read: a striker scoring every
              hundred and forty minutes is producing at a first-choice level, while one scoring every four hundred minutes is not.
              Goals per thousand minutes scales the same idea for short spells of form, and share of team goals divides the
              player's rate by their side's goals per match, which shows whether the player is carrying the attack or benefiting
              from a high-scoring team.
            </p>
            <p>
              The season projection multiplies the rate by a chosen league length: thirty-eight matches for most top European
              divisions, thirty-four for MLS, forty-six for the Championship. It is a straight-line estimate and assumes the same
              role, minutes and finishing accuracy, so it should be read as a conditional forecast. The comparison band follows the
              position selected in advanced options, with defenders and goalkeepers expected near zero, central midfielders between
              roughly 0.10 and 0.30, wingers 0.20 to 0.45, and centre-forwards 0.45 to 0.80 per appearance over a meaningful
              sample.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the goals-per-game rate, with the underlying goals, appearances and season projection in the
              subtext. The three-stat bar adds goals per ninety, minutes per goal and the projected season total, and the breakdown
              table lists every intermediate figure including minutes played, goals per thousand minutes and the player's share of
              the team's scoring.
            </p>
            <p>
              The summary panel reports the benchmark band for the selected position and whether the rate sits inside, above or
              below it, colour-coded so below-the-band performances stand out. It also states whether the sample has stabilised,
              using twenty-five appearances or roughly two thousand minutes as the point where a scoring rate becomes reasonably
              trustworthy.
            </p>
            <p>
              Use the tool on league data, school teams or a five-a-side season — the arithmetic does not care about the level.
              What matters is consistency: count the same competitions, use the true minutes rather than assuming ninety per
              appearance, and remember that penalty kicks inflate any rate. Comparing two players across different leagues adds a
              further unknown, so treat cross-league comparisons as a starting point for judgement rather than a verdict.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/soccer-goals-per-game-calculator" />
          <PopularCalculators exclude="/calculator/soccer-goals-per-game-calculator" />
        </div>
      </div>
    </>
  );
}
