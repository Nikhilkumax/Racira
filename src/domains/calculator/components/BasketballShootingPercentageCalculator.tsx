"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, AlertTriangle, Zap, ActivitySquare, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface BasketballInputs {
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  leagueFg: number;
  league3p: number;
}

interface BasketballResult {
  fgPercent: number;
  threePPercent: number;
  ftPercent: number;
  efgPercent: number;
  tsPercent: number;
  fgm: number;
  fga: number;
  points: number;
  classification: string;
  colorClass: string;
  chartData: { name: string; percent: number; fill: string }[];
  fgVsLeague: string;
  threePvsLeague: string;
}

// 2. Pure Calculation Function (zero React, fully typed)
const calculateShooting = (inputs: BasketballInputs): BasketballResult => {
  let {
    fieldGoalsMade,
    fieldGoalsAttempted,
    freeThrowsMade,
    freeThrowsAttempted,
    threePointersMade,
    threePointersAttempted,
    leagueFg,
    league3p,
  } = inputs;

  fieldGoalsMade = Math.max(0, fieldGoalsMade || 0);
  fieldGoalsAttempted = Math.max(0, fieldGoalsAttempted || 0);
  freeThrowsMade = Math.max(0, freeThrowsMade || 0);
  freeThrowsAttempted = Math.max(0, freeThrowsAttempted || 0);
  threePointersMade = Math.max(0, threePointersMade || 0);
  threePointersAttempted = Math.max(0, threePointersAttempted || 0);
  leagueFg = leagueFg || 45.0;
  league3p = league3p || 35.0;

  // FG% = FGM / FGA x 100
  const fgPercent = fieldGoalsAttempted > 0 ? (fieldGoalsMade / fieldGoalsAttempted) * 100 : 0;

  // 3P% = 3PM / 3PA x 100
  const threePPercent = threePointersAttempted > 0 ? (threePointersMade / threePointersAttempted) * 100 : 0;

  // FT% = FTM / FTA x 100
  const ftPercent = freeThrowsAttempted > 0 ? (freeThrowsMade / freeThrowsAttempted) * 100 : 0;

  // eFG% = (FGM + 0.5 x 3PM) / FGA x 100
  const efgPercent = fieldGoalsAttempted > 0 ? ((fieldGoalsMade + 0.5 * threePointersMade) / fieldGoalsAttempted) * 100 : 0;

  // PTS = 2xFGM + 3x3PM + FTM
  const points = 2 * fieldGoalsMade + 3 * threePointersMade + freeThrowsMade;

  // TS% = PTS / (2 x (FGA + 0.44 x FTA)) x 100
  const tsDenominator = 2 * (fieldGoalsAttempted + 0.44 * freeThrowsAttempted);
  const tsPercent = tsDenominator > 0 ? (points / tsDenominator) * 100 : 0;

  let classification = "Poor";
  let colorClass = "#ef4444";

  if (fgPercent >= 50) {
    classification = "Elite";
    colorClass = "#8b5cf6";
  } else if (fgPercent >= 47) {
    classification = "Very Good";
    colorClass = "#10b981";
  } else if (fgPercent >= 44) {
    classification = "Good";
    colorClass = "#3b82f6";
  } else if (fgPercent >= 40) {
    classification = "Average";
    colorClass = "#6366f1";
  } else if (fgPercent >= 36) {
    classification = "Below Average";
    colorClass = "#f59e0b";
  } else if (fgPercent > 0) {
    classification = "Poor";
    colorClass = "#f97316";
  }

  const fgVsLeague = fieldGoalsAttempted > 0
    ? (fgPercent >= leagueFg ? `+${(fgPercent - leagueFg).toFixed(1)} vs league` : `${(fgPercent - leagueFg).toFixed(1)} vs league`)
    : "—";
  const threePvsLeague = threePointersAttempted > 0
    ? (threePPercent >= league3p ? `+${(threePPercent - league3p).toFixed(1)} vs league` : `${(threePPercent - league3p).toFixed(1)} vs league`)
    : "—";

  const chartData = [
    { name: "FG%", percent: Number(fgPercent.toFixed(1)), fill: colorClass },
    { name: "3P%", percent: Number(threePPercent.toFixed(1)), fill: "#3b82f6" },
    { name: "FT%", percent: Number(ftPercent.toFixed(1)), fill: "#10b981" },
    { name: "eFG%", percent: Number(efgPercent.toFixed(1)), fill: "#6366f1" },
  ];

  return {
    fgPercent,
    threePPercent,
    ftPercent,
    efgPercent,
    tsPercent,
    fgm: fieldGoalsMade,
    fga: fieldGoalsAttempted,
    points,
    classification,
    colorClass,
    chartData,
    fgVsLeague,
    threePvsLeague,
  };
};

// 3. DEFAULTS Object
const DEFAULTS: BasketballInputs = {
  fieldGoalsMade: 8,
  fieldGoalsAttempted: 18,
  freeThrowsMade: 4,
  freeThrowsAttempted: 5,
  threePointersMade: 2,
  threePointersAttempted: 6,
  leagueFg: 45.0,
  league3p: 35.0,
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[140px]">
        <p className="font-bold mb-1 border-b border-border pb-1">{data.name}</p>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground mr-3">Shooting %:</span>
          <span className="font-bold" style={{ color: data.fill }}>{data.percent}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(0);
          } else {
            const num = parseFloat(raw);
            onChange(isNaN(num) ? 0 : Math.max(0, num));
          }
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
    </div>
  </div>
);

// Toggle Component
const ToggleRow = ({ id, label, checked, onChange }: any) => (
  <div className="flex items-center justify-between gap-3">
    <label htmlFor={id} className="text-sm font-semibold text-foreground cursor-pointer">{label}</label>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </div>
);

export default function BasketballShootingPercentageCalculator() {
  // 4. Component State
  const [inputs, setInputs] = useState<BasketballInputs>(DEFAULTS);
  const [result, setResult] = useState<BasketballResult>(calculateShooting(DEFAULTS));
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculateShooting(inputs));
  }, []);

  const handleCalculate = () => {
    setErrorMsg("");
    if (inputs.fieldGoalsAttempted <= 0) {
      return setErrorMsg("Field Goals Attempted must be greater than zero.");
    }
    if (inputs.fieldGoalsMade > inputs.fieldGoalsAttempted) {
      return setErrorMsg("Field Goals Made cannot exceed Field Goals Attempted.");
    }
    if (inputs.freeThrowsMade > inputs.freeThrowsAttempted) {
      return setErrorMsg("Free Throws Made cannot exceed Free Throws Attempted.");
    }
    if (inputs.threePointersMade > inputs.threePointersAttempted) {
      return setErrorMsg("3-Pointers Made cannot exceed 3-Pointers Attempted.");
    }
    if (inputs.threePointersMade > inputs.fieldGoalsMade) {
      return setErrorMsg("3-Pointers Made cannot exceed Field Goals Made.");
    }
    setResult(calculateShooting(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setErrorMsg("");
    setResult(calculateShooting(DEFAULTS));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Basketball Shooting Percentage Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const updateInput = (field: keyof BasketballInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const faqs = [
    { question: "What is the difference between FG% and eFG%?", answer: "Field Goal Percentage (FG%) is simply made shots divided by attempted shots. Effective Field Goal Percentage (eFG%) adjusts for the fact that a three-pointer is worth 1.5 times a two-pointer, rewarding players who score efficiently from distance. The formula is (FGM + 0.5 x 3PM) / FGA, so a player who only shoots threes at a 40% clip has an eFG% of 60%, reflecting the true point value of those makes." },
    { question: "Why does True Shooting Percentage (TS%) matter?", answer: "TS% captures the most complete picture of scoring efficiency because it accounts for field goals, three-pointers, and free throws together. It divides total points by two times the number of shot equivalents (FGA + 0.44 x FTA). League average TS% usually sits around 56-58%, and elite shooters clear 60%. It is the best single metric for comparing scorers who get to the line at different rates." },
    { question: "How do I read the shooting classifications?", answer: "The calculator classifies your Field Goal Percentage against modern standards: 50%+ is Elite, 47-49.9% Very Good, 44-46.9% Good, 40-43.9% Average, 36-39.9% Below Average, and below 36% Poor. Keep in mind guards who shoot many threes naturally have lower FG% than centers who score near the rim, so always pair FG% with eFG% and TS% for context." },
    { question: "What does comparing against league averages tell me?", answer: "The Advanced Options let you benchmark your percentages against league FG% (about 45%) and league 3P% (about 35%). A positive gap means you shoot better than the typical player in that category. Scouts and coaches use these deltas to quickly flag strengths, such as a role player whose three-point rate far exceeds league norms, or a big whose interior finishing is below average." },
    { question: "How can I use this to improve my shooting form?", answer: "Track your made and attempted shots by session, then watch whether FG%, eFG%, and TS% trend upward as you adjust mechanics. If FT% is strong but 3P% lags, the issue is likely range and arc rather than release. Pair the output with game film and focus practice reps on the weakest percentage segment until it reaches at least league-average territory." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Basketball Shooting Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Basketball Shooting Percentage Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Zap className="h-4 w-4" /> Shooting Efficiency Evaluation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter made and attempted shots to calculate FG%, 3P%, FT%, eFG%, and True Shooting percentages with league comparisons.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="fieldGoalsMade" label="Field Goals Made" value={inputs.fieldGoalsMade} onChange={(v: number) => updateInput("fieldGoalsMade", v)} />
              <CompactInput id="fieldGoalsAttempted" label="Field Goals Attempted" value={inputs.fieldGoalsAttempted} onChange={(v: number) => updateInput("fieldGoalsAttempted", v)} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <CompactInput id="freeThrowsMade" label="Free Throws Made" value={inputs.freeThrowsMade} onChange={(v: number) => updateInput("freeThrowsMade", v)} />
              <CompactInput id="freeThrowsAttempted" label="Free Throws Attempted" value={inputs.freeThrowsAttempted} onChange={(v: number) => updateInput("freeThrowsAttempted", v)} />
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
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Advanced Shooting</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="threePointersMade" label="3-Pointers Made" value={inputs.threePointersMade} onChange={(v: number) => updateInput("threePointersMade", v)} />
                  <CompactInput id="threePointersAttempted" label="3-Pointers Attempted" value={inputs.threePointersAttempted} onChange={(v: number) => updateInput("threePointersAttempted", v)} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">3-pointers power 3P% and eFG%. 3PM must not exceed FGM.</p>

                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-1">League Comparison</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="leagueFg" label="League FG%" value={inputs.leagueFg} onChange={(v: number) => updateInput("leagueFg", v)} step={0.1} />
                  <CompactInput id="league3p" label="League 3P%" value={inputs.league3p} onChange={(v: number) => updateInput("league3p", v)} step={0.1} />
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
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Result Card */}
                <div 
                  className="text-white rounded-lg p-6 shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: result.colorClass }}
                >
                  <div className="relative z-10">
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Field Goal Percentage (FG%)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-6xl font-black">{result.fgPercent.toFixed(1)}</div>
                      <div className="text-2xl font-bold text-white/80">%</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Target className="h-4 w-4" /> {result.classification} Shooter
                    </div>
                  </div>
                  <Target className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                {/* 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">3P%</div>
                    <div className="text-2xl font-black text-white">{result.threePPercent.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">FT%</div>
                    <div className="text-2xl font-black text-white">{result.ftPercent.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">eFG%</div>
                    <div className="text-2xl font-black text-white">{result.efgPercent.toFixed(1)}%</div>
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
                          <td className="py-2 px-3">Field Goals Made / Attempted</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.fgm} / {result.fga}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Field Goal % (FG%)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.fgPercent.toFixed(1)}% <span className="text-[11px] text-muted-foreground font-normal">{result.fgVsLeague}</span></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">3-Point % (3P%)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.threePPercent.toFixed(1)}% <span className="text-[11px] text-muted-foreground font-normal">{result.threePvsLeague}</span></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Free Throw % (FT%)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.ftPercent.toFixed(1)}%</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Effective FG % (eFG%)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.efgPercent.toFixed(1)}%</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">True Shooting % (TS%)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.tsPercent.toFixed(1)}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recharts BarChart */}
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                  <h3 className="text-base font-bold w-full text-left mb-1">Shooting Percentages</h3>
                  <p className="text-xs text-muted-foreground w-full text-left mb-6">A comparison of FG%, 3P%, FT%, and eFG%. The gap between FG% and eFG% highlights how much three-point volume boosts a player's effective scoring rate.</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                      <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={60}>
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
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">FG%</div>
                    <div className="text-2xl font-black text-white">{result.fgPercent.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">3P%</div>
                    <div className="text-2xl font-black text-white">{result.threePPercent.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">eFG%</div>
                    <div className="text-2xl font-black text-white">{result.efgPercent.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">TS%</div>
                    <div className="text-2xl font-black text-white">{result.tsPercent.toFixed(1)}%</div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter made and attempted shots to calculate FG%, 3P%, FT%, eFG%, and True Shooting percentages.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (~400 words, 3 sections only) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Field Goal Percentage Alone Misses the Story</h2>
            <p>For decades, fans judged scorers by raw Field Goal Percentage: made shots divided by attempted shots. The <strong>Basketball Shooting Percentage Calculator</strong> shows why that number is incomplete. A center who scores almost exclusively at the rim will naturally post a high FG%, while a guard who takes a steady diet of threes will look worse even if he is the more efficient scorer. That is why modern analysis pairs FG% with Effective Field Goal Percentage (eFG%), which credits a three-pointer as 1.5 makes: (FGM + 0.5 x 3PM) / FGA. A 40% three-point shooter therefore carries a 60% eFG%, correctly reflecting the extra point value of long-range makes.</p>

            <h2 className="text-2xl font-bold mb-3">True Shooting and the Complete Efficiency Picture</h2>
            <p>The most complete metric the calculator delivers is True Shooting Percentage (TS%), which folds field goals, three-pointers, and free throws into one number: points divided by two times shot equivalents (FGA + 0.44 x FTA). League average TS% hovers around 56-58%, and elite finishers clear 60%. Because TS% rewards getting to the free-throw line and converting, it is the best single tool for comparing volume scorers who draw fouls at very different rates. Reading FG%, eFG%, and TS% together exposes whether a slump is about shot selection, rim finishing, or free-throw reliability.</p>

            <h2 className="text-2xl font-bold mb-3">Reading the Classifications and League Benchmarks</h2>
            <p>The calculator classifies every FG% result against modern standards: 50%+ is Elite, 47-49.9% Very Good, 44-46.9% Good, 40-43.9% Average, 36-39.9% Below Average, and below 36% Poor. Use the Advanced Options to benchmark against league FG% (about 45%) and league 3P% (about 35%), then apply the gap to shooting-form improvement and scouting. A positive 3P% delta flags a specialist worth more floor spacing, while a negative TS% gap signals a scorer who needs to adjust mechanics or shot diet. Track percentages across sessions to confirm that practice changes are translating into real on-court efficiency.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/basketball-shooting-percentage-calculator" />
          <PopularCalculators exclude="/calculator/basketball-shooting-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
