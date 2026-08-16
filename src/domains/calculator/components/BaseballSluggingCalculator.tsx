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
interface SluggingInputs {
  atBats: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  sacFlies: number;
  showOps: boolean;
  showIso: boolean;
  leagueOps: number;
  hits: number;
  walks: number;
  hitByPitch: number;
}

interface SluggingResult {
  sluggingPercentage: string;
  totalBases: number;
  iso: number;
  isoFormatted: string;
  ops: number;
  opsFormatted: string;
  opsPlus: number;
  battingAverage: number;
  battingAverageFormatted: string;
  hits: number;
  classification: string;
  colorClass: string;
  chartData: { name: string; bases: number; count: number }[];
}

// 2. Pure Calculation Function (zero React, fully typed)
const calculateSlugging = (inputs: SluggingInputs): SluggingResult => {
  let {
    atBats,
    singles,
    doubles,
    triples,
    homeRuns,
    sacFlies,
    showOps,
    showIso,
    leagueOps,
    walks,
    hitByPitch,
  } = inputs;

  atBats = Math.max(0, atBats || 0);
  singles = Math.max(0, singles || 0);
  doubles = Math.max(0, doubles || 0);
  triples = Math.max(0, triples || 0);
  homeRuns = Math.max(0, homeRuns || 0);
  sacFlies = Math.max(0, sacFlies || 0);
  walks = Math.max(0, walks || 0);
  hitByPitch = Math.max(0, hitByPitch || 0);
  leagueOps = leagueOps || 0.740;

  const hits = singles + doubles + triples + homeRuns;

  // Total Bases (TB) = 1B + 2×2B + 3×3B + 4×HR
  const totalBases = singles + doubles * 2 + triples * 3 + homeRuns * 4;

  // SLG = TB / AB
  const slugging = atBats > 0 ? totalBases / atBats : 0;

  // AVG = H / AB
  const battingAverage = atBats > 0 ? hits / atBats : 0;

  // OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
  const obpDenominator = atBats + walks + hitByPitch + sacFlies;
  const obp = obpDenominator > 0 ? (hits + walks + hitByPitch) / obpDenominator : 0;

  // OPS = OBP + SLG
  const ops = showOps ? obp + slugging : 0;
  const opsPlus = showOps && leagueOps > 0 ? Math.round((ops / leagueOps) * 100) : 0;

  // ISO = SLG - AVG
  const iso = showIso ? slugging - battingAverage : 0;

  const formatStat = (val: number): string => {
    const fixed = val.toFixed(3);
    return fixed.startsWith("0") ? fixed.substring(1) : fixed;
  };

  let classification = "Very Poor";
  let colorClass = "#ef4444";

  if (slugging >= 0.550) {
    classification = "Elite";
    colorClass = "#8b5cf6";
  } else if (slugging >= 0.500) {
    classification = "Great";
    colorClass = "#10b981";
  } else if (slugging >= 0.450) {
    classification = "Above Average";
    colorClass = "#3b82f6";
  } else if (slugging >= 0.400) {
    classification = "Average";
    colorClass = "#f59e0b";
  } else if (slugging >= 0.350) {
    classification = "Below Average";
    colorClass = "#fb923c";
  } else if (slugging >= 0.300) {
    classification = "Poor";
    colorClass = "#f97316";
  }

  const chartData = [
    { name: "Singles (1B)", bases: singles * 1, count: singles },
    { name: "Doubles (2B)", bases: doubles * 2, count: doubles },
    { name: "Triples (3B)", bases: triples * 3, count: triples },
    { name: "Home Runs (HR)", bases: homeRuns * 4, count: homeRuns },
  ];

  return {
    sluggingPercentage: formatStat(slugging),
    totalBases,
    iso,
    isoFormatted: formatStat(iso),
    ops,
    opsFormatted: formatStat(ops),
    opsPlus,
    battingAverage,
    battingAverageFormatted: formatStat(battingAverage),
    hits,
    classification,
    colorClass,
    chartData,
  };
};

// 3. DEFAULTS Object
const DEFAULTS: SluggingInputs = {
  atBats: 500,
  singles: 85,
  doubles: 35,
  triples: 5,
  homeRuns: 15,
  sacFlies: 5,
  showOps: true,
  showIso: true,
  leagueOps: 0.740,
  hits: 140,
  walks: 50,
  hitByPitch: 8,
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">{data.name}</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-muted-foreground mr-3">Hits:</span>
          <span className="font-bold text-foreground">{data.count}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">Bases Yielded:</span>
          <span className="font-bold text-primary">{data.bases}</span>
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
            const num = parseInt(raw, 10);
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

export default function BaseballSluggingCalculator() {
  // 4. Component State
  const [inputs, setInputs] = useState<SluggingInputs>(DEFAULTS);
  const [result, setResult] = useState<SluggingResult>(calculateSlugging(DEFAULTS));
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculateSlugging(inputs));
  }, []);

  const handleCalculate = () => {
    setErrorMsg("");
    if (inputs.atBats <= 0) {
      return setErrorMsg("At Bats must be greater than zero.");
    }
    if (inputs.singles < 0 || inputs.doubles < 0 || inputs.triples < 0 || inputs.homeRuns < 0) {
      return setErrorMsg("Please enter valid non-negative numbers.");
    }
    setResult(calculateSlugging(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setErrorMsg("");
    setResult(calculateSlugging(DEFAULTS));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Baseball Slugging Percentage Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const updateInput = (field: keyof SluggingInputs, value: number | boolean) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const faqs = [
    { question: "Why is Slugging Percentage (SLG) more valuable than Batting Average?", answer: "Batting Average treats all hits as exactly equal. A slow infield single that barely beats the throw is given the exact same mathematical weight as a 450-foot grand slam. Slugging Percentage corrects this by multiplying hits by their base value, so a single Home Run provides four times the value of a Single, accurately reflecting run-scoring potential." },
    { question: "How does the Slugging math actually work?", answer: "Instead of dividing Hits by At-Bats, SLG divides Total Bases by At-Bats. Total Bases = 1B + 2×2B + 3×3B + 4×HR. A Single is worth 1 base, a Double 2, a Triple 3, and a Home Run 4. This weighted formula rewards power hitters who generate disproportionately more offense per plate appearance." },
    { question: "What is ISO (Isolated Power)?", answer: "Isolated Power (ISO) is simply SLG minus AVG. It strips away the batting average component to isolate a hitter's raw power. An ISO around .100 is average, .150 is good power, .200 is elite, and .300 is historic. It tells you how much of a player's value comes from extra-base hits rather than singles." },
    { question: "Why does OPS combine OBP and SLG?", answer: "OPS (On-Base Plus Slugging) adds On-Base Percentage and Slugging Percentage into a single number capturing both the ability to avoid making an out and the ability to hit for power. An OPS above .800 is great; above 1.000 is MVP-level. OPS+ normalizes OPS against the league average (100 is league average) to adjust for ballpark and era." },
    { question: "Why don't Sacrifice Flies count toward SLG?", answer: "Sacrifice Flies are not at-bats and do not generate bases of their own, so they never enter the Total Bases or At-Bats denominators. Their only statistical role is in OBP, where they count as a plate appearance without reaching base, slightly lowering a player's on-base figure while helping teammates score." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Baseball Slugging Percentage (SLG) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baseball Slugging Percentage (SLG) Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Zap className="h-4 w-4" /> Power Hitting Evaluation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the player's hit distribution and advanced options to calculate their slugging percentage and power metrics.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="atBats" label="At Bats (AB)" value={inputs.atBats} onChange={(v: number) => updateInput("atBats", v)} />
              <CompactInput id="singles" label="Singles (1B)" value={inputs.singles} onChange={(v: number) => updateInput("singles", v)} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <CompactInput id="doubles" label="Doubles (2B)" value={inputs.doubles} onChange={(v: number) => updateInput("doubles", v)} />
              <CompactInput id="triples" label="Triples (3B)" value={inputs.triples} onChange={(v: number) => updateInput("triples", v)} />
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
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Power Group</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="homeRuns" label="Home Runs (HR)" value={inputs.homeRuns} onChange={(v: number) => updateInput("homeRuns", v)} />
                  <CompactInput id="sacFlies" label="Sacrifice Flies (SF)" value={inputs.sacFlies} onChange={(v: number) => updateInput("sacFlies", v)} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">Home Runs = 4 bases each. Sacrifice Flies do NOT count for SLG.</p>

                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Advanced Metrics</div>
                <div className="flex flex-col gap-3">
                  <ToggleRow id="showOps" label="Show OPS (OBP + SLG)" checked={inputs.showOps} onChange={(v: boolean) => updateInput("showOps", v)} />
                  <ToggleRow id="showIso" label="Show ISO (SLG − AVG)" checked={inputs.showIso} onChange={(v: boolean) => updateInput("showIso", v)} />
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
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Slugging Percentage (SLG)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-6xl font-black">{result.sluggingPercentage}</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Zap className="h-4 w-4" /> {result.classification} Power
                    </div>
                  </div>
                  <Target className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                {/* 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Bases</div>
                    <div className="text-2xl font-black text-white">{result.totalBases}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">ISO</div>
                    <div className="text-2xl font-black text-white">{inputs.showIso ? result.isoFormatted : "—"}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">OPS</div>
                    <div className="text-2xl font-black text-white">{inputs.showOps ? result.opsFormatted : "—"}</div>
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
                          <td className="py-2 px-3">Total Hits</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.hits}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Total Bases</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.totalBases}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Batting Average</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.battingAverageFormatted}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Isolated Power (ISO)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{inputs.showIso ? result.isoFormatted : "—"}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">OPS {inputs.showOps && result.opsPlus > 0 ? `(+${result.opsPlus})` : ""}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{inputs.showOps ? result.opsFormatted : "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recharts BarChart */}
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                  <h3 className="text-base font-bold w-full text-left mb-1">Base Distribution</h3>
                  <p className="text-xs text-muted-foreground w-full text-left mb-6">A breakdown of the bases generated by each hit type. The 4x multiplier on Home Runs shows how elite power dominates offensive production.</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                      <Bar dataKey="bases" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {result.chartData.map((entry, index) => {
                          let fill = "hsl(var(--primary))";
                          if (entry.name.includes("Singles")) fill = "#3b82f6";
                          if (entry.name.includes("Doubles")) fill = "#10b981";
                          if (entry.name.includes("Triples")) fill = "#f59e0b";
                          if (entry.name.includes("Home Runs")) fill = "#ef4444";
                          return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Bases</div>
                    <div className="text-2xl font-black text-white">{result.totalBases}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Hits</div>
                    <div className="text-2xl font-black text-white">{result.hits}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">ISO</div>
                    <div className="text-2xl font-black text-white">{inputs.showIso ? result.isoFormatted : "—"}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">OPS</div>
                    <div className="text-2xl font-black text-white">{inputs.showOps ? result.opsFormatted : "—"}</div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter a player's hit distribution to calculate their slugging percentage, isolated power, and overall offensive evaluation.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (~400 words, 3 sections only) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Slugging Percentage Matters More Than Batting Average</h2>
            <p>For over a century, baseball worshipped Batting Average as the definitive measure of a hitter. A .300 average meant stardom. But Batting Average treats every hit as equal: a slow, bouncing infield single is given the exact same weight as a 450-foot grand slam. That is a massive analytical failure. The <strong>Baseball Slugging Percentage (SLG) Calculator</strong> fixes this by valuing hits based on the actual bases they produce. Slugging divides Total Bases by At-Bats, where Total Bases = 1×Singles + 2×Doubles + 3×Triples + 4×Home Runs. A single Home Run therefore contributes four times the offensive value of a Single, accurately reflecting run-scoring power that Batting Average completely ignores.</p>

            <h2 className="text-2xl font-bold mb-3">Isolated Power and OPS</h2>
            <p>Raw SLG alone still hides context, which is why advanced metrics layer on top of it. Isolated Power (ISO) subtracts Batting Average from Slugging Percentage to isolate a hitter's raw power — an ISO around .150 is good and .200 is elite. OPS (On-Base Plus Slugging) adds On-Base Percentage to SLG, combining the ability to avoid making an out with the ability to hit for power into one complete offensive number. OPS+ normalizes that figure against the league average (100 is average) to adjust for ballpark and era. When you toggle these options in the calculator, you move from a simple power rating to a full offensive evaluation trusted by modern front offices.</p>

            <h2 className="text-2xl font-bold mb-3">Reading the Slugging Classifications</h2>
            <p>The free Baseball Slugging Percentage Calculator classifies every result against modern Major League standards: .550+ is Elite, .500–.549 Great, .450–.499 Above Average, .400–.449 Average, .350–.399 Below Average, .300–.349 Poor, and below .300 Very Poor. The league average SLG typically hovers around .400 to .410, so a hitter clearing .500 is a genuine power threat likely launching 30+ home runs. Use the base distribution chart to see exactly how each hit type contributes to the final number, and adjust the advanced toggles to compare ISO and OPS side by side for any player profile.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baseball-slugging-percentage-calculator" />
          <PopularCalculators exclude="/calculator/baseball-slugging-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
