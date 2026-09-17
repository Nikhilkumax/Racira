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
interface EraInputs {
  earnedRuns: number;
  inningsPitched: number;
  games: number;
  leagueAverageEra: number;
  homeRuns: number;
  walks: number;
  strikeouts: number;
}

interface EraResult {
  era: number;
  eraFormatted: string;
  eraPlus: number;
  eraPlusFormatted: string;
  fip: number;
  fipFormatted: string;
  leagueAverageEra: number;
  runsPerNine: number;
  classification: string;
  colorClass: string;
  comparisonToLeague: string;
  comparisonColorClass: string;
  runsSavedOverLeague: number;
  eraMinusLeague: number;
  chartData: { name: string; value: number; fill: string }[];
  summary: {
    era: number;
    eraPlus: number;
    fip: number;
    leagueAverage: number;
    runsPerNine: number;
    runsSaved: number;
  };
}

// 2. Pure Calculation Function (zero React, fully typed)
const calculateEra = (inputs: EraInputs): EraResult => {
  let {
    earnedRuns,
    inningsPitched,
    games,
    leagueAverageEra,
    homeRuns,
    walks,
    strikeouts,
  } = inputs;

  earnedRuns = Math.max(0, Number.isFinite(earnedRuns) ? earnedRuns : 0);
  inningsPitched = Math.max(0, Number.isFinite(inningsPitched) ? inningsPitched : 0);
  games = Math.max(0, Number.isFinite(games) ? games : 0);
  leagueAverageEra = Math.max(0, Number.isFinite(leagueAverageEra) ? leagueAverageEra : 0);
  homeRuns = Math.max(0, Number.isFinite(homeRuns) ? homeRuns : 0);
  walks = Math.max(0, Number.isFinite(walks) ? walks : 0);
  strikeouts = Math.max(0, Number.isFinite(strikeouts) ? strikeouts : 0);

  const FIP_CONSTANT = 3.10;

  const era = inningsPitched > 0 ? (earnedRuns / inningsPitched) * 9 : 0;

  const eraPlus = era > 0 && leagueAverageEra > 0
    ? (leagueAverageEra / era) * 100
    : 0;

  const fipNumerator = 13 * homeRuns + 3 * walks - 2 * strikeouts;
  const fip = inningsPitched > 0 ? fipNumerator / inningsPitched + FIP_CONSTANT : 0;

  const runsPerNine = inningsPitched > 0 ? (earnedRuns / inningsPitched) * 9 : 0;

  let classification = "Undefined";
  let colorClass = "#64748b";

  if (era > 0) {
    if (era < 2.00) {
      classification = "Elite";
      colorClass = "#8b5cf6";
    } else if (era < 3.00) {
      classification = "Excellent";
      colorClass = "#10b981";
    } else if (era < 3.75) {
      classification = "Above Average";
      colorClass = "#3b82f6";
    } else if (era < 4.25) {
      classification = "Average";
      colorClass = "#f59e0b";
    } else if (era < 5.00) {
      classification = "Below Average";
      colorClass = "#f97316";
    } else {
      classification = "Poor";
      colorClass = "#dc2626";
    }
  }

  const eraMinusLeague = leagueAverageEra > 0
    ? Number((era - leagueAverageEra).toFixed(2))
    : 0;

  let comparisonToLeague = "No league baseline";
  let comparisonColorClass = "#64748b";

  if (leagueAverageEra > 0) {
    if (era < leagueAverageEra) {
      comparisonToLeague = "Better than league average";
      comparisonColorClass = "#10b981";
    } else if (era > leagueAverageEra) {
      comparisonToLeague = "Worse than league average";
      comparisonColorClass = "#dc2626";
    } else {
      comparisonToLeague = "Exactly league average";
      comparisonColorClass = "#f59e0b";
    }
  }

  const runsSavedOverLeague = inningsPitched > 0 && leagueAverageEra > 0
    ? Number((((leagueAverageEra - era) * inningsPitched) / 9).toFixed(2))
    : 0;

  const formatStat = (val: number, digits = 2): string => {
    if (!Number.isFinite(val)) return "0.00";
    return val.toFixed(digits);
  };

  const chartData = [
    {
      name: "Pitcher ERA",
      value: Number(era.toFixed(2)),
      fill: colorClass,
    },
    {
      name: "League Avg ERA",
      value: leagueAverageEra > 0 ? Number(leagueAverageEra.toFixed(2)) : 0,
      fill: "#94a3b8",
    },
  ];

  return {
    era,
    eraFormatted: formatStat(era),
    eraPlus,
    eraPlusFormatted: eraPlus > 0 ? Math.round(eraPlus).toString() : "—",
    fip,
    fipFormatted: formatStat(fip),
    leagueAverageEra,
    runsPerNine,
    classification,
    colorClass,
    comparisonToLeague,
    comparisonColorClass,
    runsSavedOverLeague,
    eraMinusLeague,
    chartData,
    summary: {
      era: Number(era.toFixed(2)),
      eraPlus: Math.round(eraPlus),
      fip: Number(fip.toFixed(2)),
      leagueAverage: leagueAverageEra,
      runsPerNine: Number(runsPerNine.toFixed(2)),
      runsSaved: runsSavedOverLeague,
    },
  };
};

// 3. DEFAULTS Object
const DEFAULTS: EraInputs = {
  earnedRuns: 80,
  inningsPitched: 180.2,
  games: 30,
  leagueAverageEra: 4.25,
  homeRuns: 25,
  walks: 45,
  strikeouts: 150,
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">ERA Comparison</p>
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

export default function BaseballEraCalculator() {
  // 4. Component State
  const [inputs, setInputs] = useState<EraInputs>(DEFAULTS);
  const [result, setResult] = useState<EraResult>(calculateEra(DEFAULTS));
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);

  useEffect(() => {
    setResult(calculateEra(inputs));
  }, []);

  const handleCalculate = () => {
    setErrorMsg("");
    if (inputs.earnedRuns < 0 || inputs.inningsPitched < 0 || inputs.games < 0) {
      return setErrorMsg("Please enter valid non-negative numbers.");
    }
    if (inputs.inningsPitched === 0 && inputs.earnedRuns > 0) {
      return setErrorMsg("Innings Pitched must be greater than 0 to compute ERA.");
    }
    setResult(calculateEra(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setErrorMsg("");
    setResult(calculateEra(DEFAULTS));
  };

  const updateInput = (field: keyof EraInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const faqs = [
    { question: "What does ERA actually measure?", answer: "Earned Run Average (ERA) estimates the number of earned runs a pitcher would allow over a full nine-inning game. It strips out runs that score because of defensive errors, so it measures the pitcher's individual effectiveness rather than the whole team's defense. A lower ERA is always better. An ERA under 3.00 is excellent in modern baseball, while anything above 5.00 usually signals a struggling pitcher." },
    { question: "How is ERA+ different from ERA?", answer: "ERA+ adjusts a pitcher's ERA for the league environment and ballpark, then scales it so that 100 equals exactly league average. A 120 ERA+ means the pitcher was 20% better than an average pitcher in that league; an 80 ERA+ means 20% worse. Because it normalizes for era context, ERA+ lets you compare a pitcher from the high-scoring 1990s to one from the pitching-dominated 1960s on equal footing." },
    { question: "What is FIP and why does it ignore hits?", answer: "Fielding Independent Pitching (FIP) estimates a pitcher's ERA based only on the outcomes they most directly control: home runs, walks, hit-by-pitches, and strikeouts. It deliberately ignores balls put in play because research shows pitchers have little repeatable control over what happens once a batter makes contact. FIP answers the question 'how well did this pitcher pitch?' independent of whether their defenders happened to make the plays behind them." },
    { question: "Why does innings pitched use decimals like 180.2?", answer: "In baseball notation, the fractional part of innings pitched is written in thirds, not tenths. So 180.2 means 180 innings and 2 outs (two-thirds of an inning), NOT 180.2 innings. A third of an inning is .1, two-thirds is .2, and a full inning is .0 of the next whole number. This calculator accepts standard decimal input (180.67 would represent 180 and two-thirds) to keep the math unambiguous." },
    { question: "How do I evaluate a pitcher across different eras?", answer: "Raw ERA is misleading across eras because the run environment changes constantly. Use the Advanced Options to set the correct League Average ERA for that season, then read ERA+ to see the pitcher's true standing relative to peers. A 3.50 ERA in a 4.50 league (ERA+ ~129) is far more impressive than a 3.50 ERA in a 3.00 league (ERA+ ~86). Combining ERA+, FIP, and league context gives the clearest cross-era comparison." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Baseball ERA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baseball ERA Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">

          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Target className="h-4 w-4" /> Pitcher Evaluation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the pitcher's seasonal totals to calculate ERA, ERA+, and FIP across any era.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="earnedRuns" label="Earned Runs" value={inputs.earnedRuns} onChange={(v: number) => updateInput("earnedRuns", v)} />
              <CompactInput id="inningsPitched" label="Innings Pitched" value={inputs.inningsPitched} onChange={(v: number) => updateInput("inningsPitched", v)} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <CompactInput id="games" label="Games" value={inputs.games} onChange={(v: number) => updateInput("games", v)} />
              <CompactInput id="leagueAverageEra" label="League Avg ERA" value={inputs.leagueAverageEra} onChange={(v: number) => updateInput("leagueAverageEra", v)} />
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
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Advanced Metrics (for FIP)</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="homeRuns" label="Home Runs Allowed" value={inputs.homeRuns} onChange={(v: number) => updateInput("homeRuns", v)} />
                  <CompactInput id="walks" label="Walks (BB)" value={inputs.walks} onChange={(v: number) => updateInput("walks", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="strikeouts" label="Strikeouts (K)" value={inputs.strikeouts} onChange={(v: number) => updateInput("strikeouts", v)} />
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 shadow-sm relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Earned Run Average (ERA)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-4xl font-bold text-primary tracking-tight">{result.eraFormatted}</div>
                    </div>
                    <div className="text-sm font-bold text-foreground mt-3 bg-muted/40 border border-border inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> {result.classification} Pitcher
                    </div>
                  </div>
                  <Target className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                {/* 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">ERA+</div>
                    <div className="text-2xl font-black text-white">{result.eraPlusFormatted}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">FIP</div>
                    <div className="text-2xl font-black text-white">{result.fipFormatted}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">League Avg</div>
                    <div className="text-2xl font-black text-white">{result.leagueAverageEra > 0 ? result.leagueAverageEra.toFixed(2) : "—"}</div>
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
                          <td className="py-2 px-3">Earned Runs</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{inputs.earnedRuns}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Innings Pitched</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{inputs.inningsPitched}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Games</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{inputs.games}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Runs Per 9 IP</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.runsPerNine.toFixed(2)}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">ERA vs League</td>
                          <td className="py-2 px-3 text-right font-mono font-bold" style={{ color: result.comparisonColorClass }}>{result.eraMinusLeague > 0 ? "+" : ""}{result.eraMinusLeague}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">Runs Saved vs League</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.runsSavedOverLeague}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recharts BarChart */}
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                  <h3 className="text-base font-bold w-full text-left mb-1">ERA vs League Average</h3>
                  <p className="text-xs text-muted-foreground w-full text-left mb-6">Lower is better in pitching. The grey bar is the league baseline; any bar below it represents an above-average season.</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                      {result.leagueAverageEra > 0 && (
                        <ReferenceLine y={result.leagueAverageEra} stroke="#94a3b8" strokeDasharray="4 4" />
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
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">ERA</div>
                    <div className="text-2xl font-black text-white">{result.summary.era}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">ERA+</div>
                    <div className="text-2xl font-black text-white">{result.summary.eraPlus}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">FIP</div>
                    <div className="text-2xl font-black text-white">{result.summary.fip}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">Runs Saved</div>
                    <div className="text-2xl font-black text-white">{result.summary.runsSaved}</div>
                  </div>
                </div>

                <div className="text-xs font-medium" style={{ color: result.comparisonColorClass }}>
                  <Zap className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                  {result.comparisonToLeague}
                  {result.leagueAverageEra > 0 && result.runsSavedOverLeague !== 0
                    ? ` — ${result.runsSavedOverLeague > 0 ? "saved" : "allowed"} ${Math.abs(result.runsSavedOverLeague)} earned runs over a full season vs league average.`
                    : "."}
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter a pitcher's seasonal totals to calculate ERA, ERA+, and FIP.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (~400 words, 3 sections only) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why ERA Is the Foundation of Pitching Evaluation</h2>
            <p>Earned Run Average has been baseball's core pitching metric for over a century because it answers the only question that matters: how many runs does this pitcher prevent? The <strong>Baseball ERA Calculator</strong> computes ERA by dividing earned runs by innings pitched and multiplying by nine, projecting a pitcher's effectiveness over a standardized full game. Importantly, ERA counts only earned runs, excluding runs that score because of defensive errors, so it isolates the pitcher's individual performance from the quality of the defense behind them. A sub-3.00 ERA signals an elite season, while an ERA above 5.00 usually means a pitcher is struggling to keep their team in games.</p>

            <h2 className="text-2xl font-bold mb-3">Comparing Pitchers Across Eras With ERA+ and FIP</h2>
            <p>Raw ERA is misleading when comparing players from different seasons because the run environment changes constantly. ERA+ solves this by normalizing a pitcher's ERA to the league average and scaling it so that 100 equals exactly average; 120 means 20% better than league, 80 means 20% worse. Fielding Independent Pitching (FIP) takes a different angle, estimating ERA from only the outcomes a pitcher controls most directly: home runs, walks, and strikeouts. Because FIP ignores balls put in play, it reveals whether a pitcher's results were earned or merely the product of good defense. Together, ERA+, FIP, and league context give you the clearest possible cross-era comparison of any pitcher in history.</p>

            <h2 className="text-2xl font-bold mb-3">How to Use This Calculator for Scouting and Fantasy</h2>
            <p>Start with the core inputs: earned runs, innings pitched, games, and the league average ERA for that season. Toggle Advanced Options to enter home runs, walks, and strikeouts, which unlock the FIP calculation. The bar chart instantly contrasts the pitcher's ERA against the league baseline, while the breakdown table shows runs saved versus average over a full season. Use ERA+ to rank pitchers fairly regardless of era, and use FIP to spot breakout candidates whose "true" pitching skill outpaces their traditional ERA. Whether you are scouting, managing fantasy rosters, or settling debates with friends, this calculator turns raw box-score totals into meaningful, era-adjusted insight.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baseball-era-calculator" />
          <PopularCalculators exclude="/calculator/baseball-era-calculator" />
        </div>
      </div>
    </>
  );
}
