"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, AlertTriangle, ShieldCheck, Target, Zap, ActivitySquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface OBPInputs {
  atBats: number;
  hits: number;
  walks: number;
  sacFlies: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  hitByPitch: number;
  sacrificeHits: number;
}

interface OBPResult {
  obp: number;
  obpFormatted: string;
  slugging: number;
  sluggingFormatted: string;
  ops: number;
  opsFormatted: string;
  opsPlus: number;
  plateAppearances: number;
  timesOnBase: number;
  totalBases: number;
  classification: string;
  colorClass: string;
  chartData: { name: string; value: number }[];
}

// 2. Pure Calculation Function (zero React, fully typed)
const calculateOBP = (inputs: OBPInputs): OBPResult => {
  let {
    atBats,
    hits,
    walks,
    sacFlies,
    singles,
    doubles,
    triples,
    homeRuns,
    hitByPitch,
    sacrificeHits,
  } = inputs;

  atBats = Math.max(0, atBats);
  hits = Math.max(0, hits);
  walks = Math.max(0, walks);
  sacFlies = Math.max(0, sacFlies);
  singles = Math.max(0, singles);
  doubles = Math.max(0, doubles);
  triples = Math.max(0, triples);
  homeRuns = Math.max(0, homeRuns);
  hitByPitch = Math.max(0, hitByPitch);
  sacrificeHits = Math.max(0, sacrificeHits);

  const advTotal = singles + doubles + triples + homeRuns;
  if (advTotal > 0) {
    hits = advTotal;
  }

  const denominator = atBats + walks + hitByPitch + sacFlies;
  const numerator = hits + walks + hitByPitch;
  const obp = denominator > 0 ? numerator / denominator : 0;

  const totalBases = singles + doubles * 2 + triples * 3 + homeRuns * 4;
  const slugging = atBats > 0 ? totalBases / atBats : 0;
  const ops = obp + slugging;
  const leagueOps = 0.740;
  const opsPlus = leagueOps > 0 ? (ops / leagueOps) * 100 : 100;

  const plateAppearances = atBats + walks + hitByPitch + sacFlies + sacrificeHits;
  const timesOnBase = hits + walks + hitByPitch;

  let classification = "Very Poor";
  let colorClass = "#ef4444";

  if (obp >= 0.400) {
    classification = "Elite";
    colorClass = "#8b5cf6";
  } else if (obp >= 0.370) {
    classification = "Great";
    colorClass = "#10b981";
  } else if (obp >= 0.340) {
    classification = "Above Average";
    colorClass = "#3b82f6";
  } else if (obp >= 0.320) {
    classification = "Average";
    colorClass = "#f59e0b";
  } else if (obp >= 0.300) {
    classification = "Below Average";
    colorClass = "#f97316";
  } else if (obp >= 0.280) {
    classification = "Poor";
    colorClass = "#dc2626";
  }

  const formatStat = (val: number): string => {
    const fixed = val.toFixed(3);
    return fixed.startsWith("0") ? fixed.substring(1) : fixed;
  };

  return {
    obp,
    obpFormatted: formatStat(obp),
    slugging,
    sluggingFormatted: formatStat(slugging),
    ops,
    opsFormatted: formatStat(ops),
    opsPlus: Math.round(opsPlus),
    plateAppearances,
    timesOnBase,
    totalBases,
    classification,
    colorClass,
    chartData: [
      { name: "Hits", value: hits },
      { name: "Walks", value: walks },
      { name: "Hit By Pitch", value: hitByPitch },
    ],
  };
};

// 3. DEFAULTS Object
const DEFAULTS: OBPInputs = {
  atBats: 500,
  hits: 140,
  walks: 50,
  sacFlies: 5,
  singles: 85,
  doubles: 35,
  triples: 5,
  homeRuns: 15,
  hitByPitch: 8,
  sacrificeHits: 3,
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">On-Base Event</p>
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

export default function BaseballOBPCalculator() {
  // 4. Component State
  const [inputs, setInputs] = useState<OBPInputs>(DEFAULTS);
  const [result, setResult] = useState<OBPResult>(calculateOBP(DEFAULTS));
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculateOBP(inputs));
  }, [inputs]);

  const handleCalculate = () => {
    setErrorMsg("");
    if (inputs.atBats < 0 || inputs.hits < 0 || inputs.walks < 0 || inputs.sacFlies < 0) {
      return setErrorMsg("Please enter valid non-negative numbers.");
    }
    if (inputs.hits > inputs.atBats) {
      return setErrorMsg("Hits cannot exceed At-Bats.");
    }
    setResult(calculateOBP(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setErrorMsg("");
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Baseball OBP Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const updateInput = (field: keyof OBPInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const faqs = [
    { question: "Why is On-Base Percentage (OBP) more important than Batting Average?", answer: "Batting Average only counts hits. It completely ignores walks and hit-by-pitches. If a player walks 100 times in a season, their Batting Average does not increase, making it look like those 100 successful plate appearances never happened. OBP measures the single most important job of a batter: avoiding making an out. The statistical reality of baseball is that the team that avoids outs the longest, scores the most runs. A walk is statistically just as effective as a single at avoiding an out, making OBP the vastly superior metric." },
    { question: "What was the 'Moneyball' revolution?", answer: "In the early 2000s, the Oakland Athletics (led by Billy Beane) realized that the rest of Major League Baseball was severely overvaluing Batting Average and heavily undervaluing Walks. Because other teams ignored walks, players with high OBPs could be acquired very cheaply. By building a team entirely focused on OBP, the Athletics proved that a team of 'average' hitters who walked constantly could win just as many games as a team of expensive superstars. This mathematical revelation changed how every team in sports evaluates talent." },
    { question: "Why do Sacrifice Flies lower OBP?", answer: "A Sacrifice Fly (SF) occurs when a batter hits a deep fly ball that is caught for an out, but allows a runner on third base to tag up and score. In traditional Batting Average, an SF does not count as an at-bat, so it doesn't penalize the hitter. However, in OBP, an SF is counted in the denominator as a Plate Appearance. Why? Because OBP strictly measures the ability to get safely on base. Even though the SF helped the team score, the batter still made an out, so their individual OBP goes down." },
    { question: "Why are Sacrifice Bunts NOT included in OBP?", answer: "A Sacrifice Bunt is an intentional tactical decision ordered by the manager to advance a runner, knowing it will result in a near-guaranteed out for the batter. Because the batter was essentially ordered to make an out by the coaching staff, statisticians decided it was unfair to penalize the batter's personal On-Base Percentage for executing a team command." },
    { question: "What is a 'Good' OBP?", answer: "In modern Major League Baseball, the league average OBP usually hovers around .315 to .320. If a player has an OBP of .340, they are considered a great asset to the lineup. If a player consistently maintains an OBP above .390 or .400, they are considered Elite and are almost certainly performing at an All-Star or MVP level. Barry Bonds holds the single-season record with an absurd .609 OBP in 2004." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Baseball On-Base Percentage (OBP) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baseball On-Base Percentage (OBP) Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Target className="h-4 w-4" /> Plate Discipline
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the player's seasonal statistics to calculate their true mathematical value at the plate.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="hits" label="Hits (H)" value={inputs.hits} onChange={(v: number) => updateInput("hits", v)} />
              <CompactInput id="walks" label="Walks (BB)" value={inputs.walks} onChange={(v: number) => updateInput("walks", v)} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <CompactInput id="atBats" label="At Bats (AB)" value={inputs.atBats} onChange={(v: number) => updateInput("atBats", v)} />
              <CompactInput id="sacFlies" label="Sacrifice Flies (SF)" value={inputs.sacFlies} onChange={(v: number) => updateInput("sacFlies", v)} />
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
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Hit Breakdown</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="singles" label="Singles (1B)" value={inputs.singles} onChange={(v: number) => updateInput("singles", v)} />
                  <CompactInput id="doubles" label="Doubles (2B)" value={inputs.doubles} onChange={(v: number) => updateInput("doubles", v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="triples" label="Triples (3B)" value={inputs.triples} onChange={(v: number) => updateInput("triples", v)} />
                  <CompactInput id="homeRuns" label="Home Runs (HR)" value={inputs.homeRuns} onChange={(v: number) => updateInput("homeRuns", v)} />
                </div>

                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-1">Additional</div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="hitByPitch" label="Hit By Pitch (HBP)" value={inputs.hitByPitch} onChange={(v: number) => updateInput("hitByPitch", v)} />
                  <CompactInput id="sacrificeHits" label="Sacrifice Hits (SH)" value={inputs.sacrificeHits} onChange={(v: number) => updateInput("sacrificeHits", v)} />
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
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">On-Base Percentage (OBP)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-6xl font-black">{result.obpFormatted}</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> {result.classification} Status
                    </div>
                  </div>
                  <Target className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                {/* 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">SLG</div>
                    <div className="text-2xl font-black text-white">{result.sluggingFormatted}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">OPS</div>
                    <div className="text-2xl font-black text-white">{result.opsFormatted}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">OPS+</div>
                    <div className="text-2xl font-black text-white">{result.opsPlus}</div>
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
                          <td className="py-2 px-3">Times On Base</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.timesOnBase}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Plate Appearances</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.plateAppearances}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">Total Bases</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.totalBases}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">OBP</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{result.obpFormatted}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recharts BarChart */}
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                  <h3 className="text-base font-bold w-full text-left mb-1">Base Access Composition</h3>
                  <p className="text-xs text-muted-foreground w-full text-left mb-6">A breakdown of exactly how this player avoided making an out. In traditional statistics, only the 'Hits' bar is evaluated, completely ignoring the immense value of plate discipline (Walks).</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {result.chartData.map((entry, index) => {
                          let fill = "hsl(var(--primary))";
                          if (entry.name === "Walks") fill = "#10b981";
                          if (entry.name === "Hit By Pitch") fill = "#f59e0b";
                          return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Times Reached Base</div>
                    <div className="text-2xl font-black text-white">{result.timesOnBase}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">Qualifying Plate Apps</div>
                    <div className="text-2xl font-black text-white">{result.plateAppearances}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Bases</div>
                    <div className="text-2xl font-black text-white">{result.totalBases}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">OPS+</div>
                    <div className="text-2xl font-black text-white">{result.opsPlus}</div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter a player's statistics to calculate their On-Base Percentage and determine their true mathematical value to the team.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (~400 words, 3 sections only) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why On-Base Percentage Matters More Than Batting Average</h2>
            <p>For over a century, baseball relied on Batting Average as the gold standard for measuring hitters. A .300 average meant stardom; a .240 average meant replacement. The problem? Batting Average completely ignores walks and hit-by-pitches. A player who draws 100 walks in a season sees zero benefit to their average, even though those walks represent 100 times the batter avoided making an out. The <strong>Baseball On-Base Percentage (OBP) Calculator</strong> fixes this by measuring the only statistic that directly prevents losses: the ability to reach base safely.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics Behind OBP</h2>
            <p>OBP is calculated by dividing times on base by plate appearances. The formula is <code>(Hits + Walks + Hit By Pitch) / (At Bats + Walks + Hit By Pitch + Sacrifice Flies)</code>. Unlike Batting Average, every method of reaching base counts equally. A walk is worth the same as a single because both result in a runner on first base and, more importantly, both prevent an out. This mathematical purity makes OBP the single best predictor of run production. Teams that prioritize OBP in lineup construction consistently outscore opponents who chase traditional "contact" metrics.</p>

            <h2 className="text-2xl font-bold mb-3">Using OBP for Lineup Construction</h2>
            <p>Modern front offices build lineups around OBP because out prevention is the foundation of winning baseball. A player with a .390 OBP reaches base in nearly 40% of their plate appearances, ensuring the batting order stays alive and puts pressure on the opposing pitcher. When you combine OBP with Slugging Percentage to form OPS, you get a complete offensive profile. An OPS above .800 signals an above-average hitter, while an OPS above 1.000 signals an MVP-caliber talent. Use the advanced options in this calculator to see how hit breakdown and plate discipline contribute to a player's overall value.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baseball-on-base-percentage-calculator" />
          <PopularCalculators exclude="/calculator/baseball-on-base-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
