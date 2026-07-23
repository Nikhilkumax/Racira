"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, AlertTriangle, ShieldCheck, Target, Zap, ActivitySquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface PerInputs {
  minutesPlayed: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personalFouls: number;
  leagueAveragePer: number;
}

interface PerResult {
  per: number;
  perFormatted: string;
  rawPer: number;
  positiveContribution: number;
  negativeContribution: number;
  netContribution: number;
  perMinuteValue: number;
  leagueAveragePer: number;
  fieldGoalPct: number;
  threePointPct: number;
  freeThrowPct: number;
  classification: string;
  colorClass: string;
  comparisonToLeague: string;
  comparisonColorClass: string;
  perVsLeague: number;
  chartData: { name: string; value: number; fill: string }[];
  summary: {
    per: number;
    leagueAverage: number;
    perVsLeague: number;
    perMinute: number;
  };
}

// 2. Pure Calculation Function (zero React, fully typed)
const calculatePer = (inputs: PerInputs): PerResult => {
  const clean = (v: number): number => Math.max(0, Number.isFinite(v) ? v : 0);

  const minutesPlayed = clean(inputs.minutesPlayed);
  const fieldGoalsMade = clean(inputs.fieldGoalsMade);
  const fieldGoalsAttempted = clean(inputs.fieldGoalsAttempted);
  const threePointersMade = clean(inputs.threePointersMade);
  const threePointersAttempted = clean(inputs.threePointersAttempted);
  const freeThrowsMade = clean(inputs.freeThrowsMade);
  const freeThrowsAttempted = clean(inputs.freeThrowsAttempted);
  const rebounds = clean(inputs.rebounds);
  const assists = clean(inputs.assists);
  const steals = clean(inputs.steals);
  const blocks = clean(inputs.blocks);
  const turnovers = clean(inputs.turnovers);
  const personalFouls = clean(inputs.personalFouls);
  const leagueAveragePer = clean(inputs.leagueAveragePer) || 15.0;

  // Split rebounds into offensive/defensive approximation (30% off, 70% def)
  const offensiveRebounds = rebounds * 0.3;
  const defensiveRebounds = rebounds * 0.7;

  // Weighted positive and negative contributions (simplified PER weights)
  const positiveContribution =
    fieldGoalsMade * 85.91 +
    threePointersMade * 51.14 +
    freeThrowsMade * 46.45 +
    offensiveRebounds * 39.19 +
    defensiveRebounds * 14.70 +
    assists * 34.50 +
    steals * 39.31 +
    blocks * 55.14;

  const negativeContribution =
    personalFouls * 20.09 +
    turnovers * 53.42 +
    (fieldGoalsAttempted - fieldGoalsMade) * 39.19 * 0.4 +
    (freeThrowsAttempted - freeThrowsMade) * 20.09 * 0.4;

  const netContribution = positiveContribution - Math.max(0, negativeContribution);

  // Per-minute unadjusted rating (uPER-like)
  const perMinuteValue = minutesPlayed > 0 ? netContribution / (minutesPlayed * 2) : 0;

  // Normalize so a solid box score maps roughly to the 15.0 league average scale.
  const NORMALIZATION = 1.85;
  const rawPer = perMinuteValue * NORMALIZATION;
  const per = Math.max(0, rawPer);

  const pct = (made: number, att: number): number => (att > 0 ? (made / att) * 100 : 0);
  const fieldGoalPct = pct(fieldGoalsMade, fieldGoalsAttempted);
  const threePointPct = pct(threePointersMade, threePointersAttempted);
  const freeThrowPct = pct(freeThrowsMade, freeThrowsAttempted);

  let classification = "Very Poor";
  let colorClass = "#dc2626";

  if (per >= 30) {
    classification = "MVP Level";
    colorClass = "#8b5cf6";
  } else if (per >= 25) {
    classification = "All-Star";
    colorClass = "#10b981";
  } else if (per >= 20) {
    classification = "Above Average";
    colorClass = "#3b82f6";
  } else if (per >= 15) {
    classification = "Average";
    colorClass = "#f59e0b";
  } else if (per >= 10) {
    classification = "Below Average";
    colorClass = "#f97316";
  } else if (per >= 5) {
    classification = "Bench";
    colorClass = "#ef4444";
  } else {
    classification = "Very Poor";
    colorClass = "#dc2626";
  }

  const perVsLeague = Number((per - leagueAveragePer).toFixed(2));

  let comparisonToLeague = "No league baseline";
  let comparisonColorClass = "#64748b";

  if (leagueAveragePer > 0) {
    if (per > leagueAveragePer) {
      comparisonToLeague = "Better than league average";
      comparisonColorClass = "#10b981";
    } else if (per < leagueAveragePer) {
      comparisonToLeague = "Below league average";
      comparisonColorClass = "#dc2626";
    } else {
      comparisonToLeague = "Exactly league average";
      comparisonColorClass = "#f59e0b";
    }
  }

  const chartData = [
    {
      name: "Player PER",
      value: Number(per.toFixed(1)),
      fill: colorClass,
    },
    {
      name: "League Avg",
      value: Number(leagueAveragePer.toFixed(1)),
      fill: "#94a3b8",
    },
  ];

  return {
    per,
    perFormatted: per.toFixed(1),
    rawPer,
    positiveContribution: Number(positiveContribution.toFixed(1)),
    negativeContribution: Number(Math.max(0, negativeContribution).toFixed(1)),
    netContribution: Number(netContribution.toFixed(1)),
    perMinuteValue: Number(perMinuteValue.toFixed(3)),
    leagueAveragePer,
    fieldGoalPct: Number(fieldGoalPct.toFixed(1)),
    threePointPct: Number(threePointPct.toFixed(1)),
    freeThrowPct: Number(freeThrowPct.toFixed(1)),
    classification,
    colorClass,
    comparisonToLeague,
    comparisonColorClass,
    perVsLeague,
    chartData,
    summary: {
      per: Number(per.toFixed(1)),
      leagueAverage: Number(leagueAveragePer.toFixed(1)),
      perVsLeague,
      perMinute: Number(perMinuteValue.toFixed(3)),
    },
  };
};

// 3. DEFAULTS Object
const DEFAULTS: PerInputs = {
  minutesPlayed: 35,
  fieldGoalsMade: 8,
  fieldGoalsAttempted: 18,
  threePointersMade: 2,
  threePointersAttempted: 6,
  freeThrowsMade: 4,
  freeThrowsAttempted: 5,
  rebounds: 7,
  assists: 6,
  steals: 1.5,
  blocks: 0.8,
  turnovers: 2.5,
  personalFouls: 3,
  leagueAveragePer: 15.0,
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">PER Comparison</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">{payload[0].payload.name}:</span>
          <span className="font-bold">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, step }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step={step ?? "any"}
        value={value === 0 ? "" : value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(0);
          } else {
            const num = parseFloat(raw);
            onChange(isNaN(num) ? 0 : num);
          }
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
    </div>
  </div>
);

export default function BasketballPerCalculator() {
  // 4. Component State
  const [inputs, setInputs] = useState<PerInputs>(DEFAULTS);
  const [result, setResult] = useState<PerResult>(calculatePer(DEFAULTS));
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);

  useEffect(() => {
    setResult(calculatePer(inputs));
  }, []);

  const handleCalculate = () => {
    setErrorMsg("");
    if (inputs.minutesPlayed < 0 || inputs.fieldGoalsMade < 0 || inputs.fieldGoalsAttempted < 0) {
      return setErrorMsg("Please enter valid non-negative numbers.");
    }
    if (inputs.minutesPlayed === 0) {
      return setErrorMsg("Minutes Played must be greater than 0 to compute PER.");
    }
    if (inputs.fieldGoalsMade > inputs.fieldGoalsAttempted && inputs.fieldGoalsAttempted > 0) {
      return setErrorMsg("Field Goals Made cannot exceed Field Goals Attempted.");
    }
    setResult(calculatePer(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setErrorMsg("");
    setResult(calculatePer(DEFAULTS));
  };

  const updateInput = (field: keyof PerInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const faqs = [
    { question: "What is Player Efficiency Rating (PER)?", answer: "Player Efficiency Rating is a single-number summary of a basketball player's per-minute statistical production. Developed by John Hollinger, it rolls a player's positive accomplishments (field goals, three-pointers, free throws, rebounds, assists, steals, and blocks) and negative outcomes (missed shots, turnovers, and fouls) into one pace-adjusted figure. The league average is intentionally set to 15.0 every season, so any PER above 15 means a player produced more than a typical rotation player, while a PER below 15 signals below-average production per minute on the floor." },
    { question: "How is PER calculated in this tool?", answer: "This calculator uses a simplified version of Hollinger's formula. Each positive stat is multiplied by a weight (for example, a made field goal is worth far more than a defensive rebound), summed, and then reduced by weighted negatives such as turnovers, fouls, and missed shots. That net value is divided by minutes played to create a per-minute rating, which is then normalized to the 15.0 league-average scale. The result is a clean, comparable PER estimate you can generate from a single box score." },
    { question: "What is a good PER value?", answer: "On the standardized scale, 15.0 is exactly league average. A PER of 20 or higher marks an above-average starter, 25 or higher is All-Star territory, and 30 or higher represents an MVP-level season that only a handful of players reach in any year. Below 15 falls into below-average, bench, or very poor tiers. Because PER is scaled the same way every season, you can compare a player's rating directly against these benchmarks and against the league average shown in the results." },
    { question: "What are PER's limitations?", answer: "PER rewards offensive volume and can undervalue elite defenders because steals and blocks capture only a fraction of defensive impact. It also assumes efficiency across minutes, so players with small samples or unusual roles may see inflated or deflated numbers. Use PER as a fast, useful starting point for player evaluation and fantasy basketball rankings, but pair it with shooting percentages, usage rate, and film study before drawing final conclusions about a player's value." },
    { question: "How can I use PER for fantasy basketball?", answer: "PER is a strong shortlist tool for fantasy drafts and waiver decisions because it condenses well-rounded production into one number. Players with high PER but modest minutes are prime breakout candidates if their role expands, while high-minute players with mediocre PER may be efficiency traps. Enter each candidate's per-game averages, compare their PER against the 15.0 baseline, and use the breakdown table to see whether their value comes from scoring, playmaking, or defensive stats that match your league's categories." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Basketball PER Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Basketball PER Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">

          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Target className="h-4 w-4" /> Player Evaluation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter a player's box-score stats to estimate their Player Efficiency Rating and compare it to the league average.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="minutesPlayed" label="Minutes Played" value={inputs.minutesPlayed} onChange={(v: number) => updateInput("minutesPlayed", v)} />
              <CompactInput id="fieldGoalsMade" label="Field Goals Made" value={inputs.fieldGoalsMade} onChange={(v: number) => updateInput("fieldGoalsMade", v)} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <CompactInput id="fieldGoalsAttempted" label="Field Goals Attempted" value={inputs.fieldGoalsAttempted} onChange={(v: number) => updateInput("fieldGoalsAttempted", v)} />
              <CompactInput id="threePointersMade" label="3-Pointers Made" value={inputs.threePointersMade} onChange={(v: number) => updateInput("threePointersMade", v)} />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="mt-2 h-9 text-xs font-bold w-full"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="flex flex-col gap-3 mt-1 border-t border-border pt-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Additional Stats</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="threePointersAttempted" label="3-Pointers Attempted" value={inputs.threePointersAttempted} onChange={(v: number) => updateInput("threePointersAttempted", v)} />
                  <CompactInput id="freeThrowsMade" label="Free Throws Made" value={inputs.freeThrowsMade} onChange={(v: number) => updateInput("freeThrowsMade", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="freeThrowsAttempted" label="Free Throws Attempted" value={inputs.freeThrowsAttempted} onChange={(v: number) => updateInput("freeThrowsAttempted", v)} />
                  <CompactInput id="rebounds" label="Rebounds" value={inputs.rebounds} onChange={(v: number) => updateInput("rebounds", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="assists" label="Assists" value={inputs.assists} onChange={(v: number) => updateInput("assists", v)} />
                  <CompactInput id="steals" label="Steals" value={inputs.steals} onChange={(v: number) => updateInput("steals", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="blocks" label="Blocks" value={inputs.blocks} onChange={(v: number) => updateInput("blocks", v)} />
                  <CompactInput id="turnovers" label="Turnovers" value={inputs.turnovers} onChange={(v: number) => updateInput("turnovers", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="personalFouls" label="Personal Fouls" value={inputs.personalFouls} onChange={(v: number) => updateInput("personalFouls", v)} />
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 mt-2">League</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="leagueAveragePer" label="League Average PER" value={inputs.leagueAveragePer} onChange={(v: number) => updateInput("leagueAveragePer", v)} />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleCalculate}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold"
              >
                Calculate
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {result && !errorMsg ? (
              <div className="flex flex-col gap-4 animate-fade-in-up">

                {/* Primary Result Card */}
                <div
                  className="text-white rounded-lg p-6 shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: result.colorClass }}
                >
                  <div className="relative z-10">
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Player Efficiency Rating (PER)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-6xl font-black">{result.perFormatted}</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> {result.classification}
                    </div>
                  </div>
                  <Target className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                {/* 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">FG%</div>
                    <div className="text-2xl font-black text-white">{result.fieldGoalPct}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">3P%</div>
                    <div className="text-2xl font-black text-white">{result.threePointPct}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">FT%</div>
                    <div className="text-2xl font-black text-white">{result.freeThrowPct}%</div>
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold w-full text-left mb-3">Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Statistic</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Minutes Played</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{inputs.minutesPlayed}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Positive Contribution</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.positiveContribution}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Negative Contribution</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.negativeContribution}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Net Value</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.netContribution}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">PER vs League</td>
                          <td className="py-2 px-3 text-right font-mono font-bold" style={{ color: result.comparisonColorClass }}>{result.perVsLeague > 0 ? "+" : ""}{result.perVsLeague}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">Rating Tier</td>
                          <td className="py-2 px-3 text-right font-mono font-bold" style={{ color: result.colorClass }}>{result.classification}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recharts BarChart */}
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                  <h3 className="text-base font-bold w-full text-left mb-1">PER vs League Average</h3>
                  <p className="text-xs text-muted-foreground w-full text-left mb-6">The grey dashed line marks the 15.0 league baseline. Any bar above it represents above-average per-minute production.</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                      {result.leagueAveragePer > 0 && (
                        <ReferenceLine y={result.leagueAveragePer} stroke="#94a3b8" strokeDasharray="4 4" />
                      )}
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={70}>
                        {result.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">PER</div>
                    <div className="text-2xl font-black text-white">{result.summary.per}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">League Avg</div>
                    <div className="text-2xl font-black text-white">{result.summary.leagueAverage}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">PER vs Avg</div>
                    <div className="text-2xl font-black text-white">{result.summary.perVsLeague > 0 ? "+" : ""}{result.summary.perVsLeague}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">Per-Min Value</div>
                    <div className="text-2xl font-black text-white">{result.summary.perMinute}</div>
                  </div>
                </div>

                <div className="text-xs font-medium" style={{ color: result.comparisonColorClass }}>
                  <Zap className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                  {result.comparisonToLeague}
                  {result.leagueAveragePer > 0 && result.perVsLeague !== 0
                    ? ` — ${result.perVsLeague > 0 ? "outperforms" : "trails"} the league average by ${Math.abs(result.perVsLeague)} PER points.`
                    : "."}
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter a player's box-score stats to calculate their Player Efficiency Rating.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (~400 words, 3 sections only) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Basketball PER Calculator Measures</h2>
            <p>Player Efficiency Rating condenses everything a basketball player does on the court into a single, comparable number. The <strong>Basketball PER Calculator</strong> takes a player's box-score totals — field goals, three-pointers, free throws, rebounds, assists, steals, blocks, turnovers, and fouls — weights each event by its value, and divides the net result by minutes played to produce a per-minute rating. That figure is then normalized to a league-average scale where 15.0 represents a typical rotation player. Because every positive and negative action is captured, PER offers a fast, holistic snapshot of production that is far more informative than points per game alone.</p>

            <h2 className="text-2xl font-bold mb-3">How to Read Your PER Result</h2>
            <p>The color-coded tiers make interpretation immediate. A PER of 15.0 is exactly league average, 20 or higher marks an above-average starter, 25 and up is All-Star territory, and 30 or higher signals an MVP-level season that only a few players reach each year. Ratings below 15 fall into below-average, bench, or very poor territory. The bar chart plots your player directly against the 15.0 baseline, while the breakdown table separates positive contribution from negative contribution so you can see exactly where value is created or lost. Use the shooting percentages alongside PER to distinguish efficient scorers from high-volume, low-efficiency players.</p>

            <h2 className="text-2xl font-bold mb-3">Using PER for Scouting and Fantasy Basketball</h2>
            <p>PER is a powerful shortlist tool for player evaluation, draft boards, and fantasy basketball decisions because it rewards well-rounded, efficient production. High-PER players on limited minutes are prime breakout candidates if their role grows, while high-minute players with mediocre PER can be efficiency traps to avoid. Enter each candidate's per-game averages, compare their PER against the league baseline, and lean on the breakdown to see whether their value comes from scoring, playmaking, or defense. Keep in mind that PER slightly undervalues elite defenders, so pair it with usage rate, shooting splits, and film study before making final roster calls.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/basketball-per-calculator" />
          <PopularCalculators exclude="/calculator/basketball-per-calculator" />
        </div>
      </div>
    </>
  );
}
