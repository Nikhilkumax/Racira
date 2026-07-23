"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });
const safe = (v: number) => (isFinite(v) ? v : 0);

type Position = "Shortstop" | "Second Base" | "Third Base" | "First Base" | "Outfield" | "Catcher" | "Pitcher";

interface Inputs {
  putouts: number;
  assists: number;
  errors: number;
  gamesPlayed: number;
  position: Position;
  inningsPlayed: number;
  doublePlays: number;
}

interface Result {
  totalChances: number;
  fieldingPct: number;
  rangeFactor: number;
  errorsPerGame: number;
  doublePlayIndex: number;
  rfBenchmark: { excellent: string; good: string };
  rfRating: string;
  chart: { label: string; value: number; color: string }[];
}

const POSITION_BENCHMARKS: Record<Position, { excellent: [number, number]; good: [number, number] }> = {
  Shortstop: { excellent: [4.5, 5.0], good: [4.0, 4.5] },
  "Second Base": { excellent: [4.8, 5.3], good: [4.3, 4.8] },
  "Third Base": { excellent: [2.8, 3.2], good: [2.5, 2.8] },
  "First Base": { excellent: [8.5, 9.5], good: [7.5, 8.5] },
  Outfield: { excellent: [2.0, 2.5], good: [1.7, 2.0] },
  Catcher: { excellent: [3.0, 4.0], good: [2.5, 3.0] },
  Pitcher: { excellent: [1.0, 1.6], good: [0.7, 1.0] },
};

const DEFAULTS: Inputs = {
  putouts: 250,
  assists: 120,
  errors: 8,
  gamesPlayed: 140,
  position: "Shortstop",
  inningsPlayed: 1150,
  doublePlays: 85,
};

const calculate = (i: Inputs): Result => {
  const po = safe(i.putouts);
  const a = safe(i.assists);
  const e = safe(i.errors);
  const g = safe(i.gamesPlayed);
  const inn = safe(i.inningsPlayed);
  const dp = safe(i.doublePlays);

  const totalChances = po + a + e;
  const fieldingPct = totalChances > 0 ? (po + a) / totalChances : 0;
  const rangeFactor = inn > 0 ? (9 * (po + a)) / inn : 0;
  const errorsPerGame = g > 0 ? e / g : 0;
  const doublePlayIndex = g > 0 ? dp / g : 0;

  const bench = POSITION_BENCHMARKS[i.position] || POSITION_BENCHMARKS.Shortstop;
  let rfRating = "Below Average";
  if (i.position === "Pitcher") {
    rfRating = "Positional (varies)";
  } else if (rangeFactor >= bench.excellent[0]) {
    rfRating = "Excellent";
  } else if (rangeFactor >= bench.good[0]) {
    rfRating = "Good";
  } else if (rangeFactor >= bench.good[1]) {
    rfRating = "Average";
  }

  const chart = [
    { label: "Putouts", value: po, color: "#3b82f6" },
    { label: "Assists", value: a, color: "#10b981" },
    { label: "Errors", value: e, color: "#ef4444" },
    { label: "Double Plays", value: dp, color: "#8b5cf6" },
  ];

  return {
    totalChances,
    fieldingPct,
    rangeFactor,
    errorsPerGame,
    doublePlayIndex,
    rfBenchmark: { excellent: `${bench.excellent[0]}–${bench.excellent[1]}`, good: `${bench.good[0]}–${bench.good[1]}` },
    rfRating,
    chart,
  };
};

const BaseballFieldingCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));

  useEffect(() => { setResult(calculate(inputs)); }, []);

  const handleCalc = () => setResult(calculate(inputs));

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const num = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }));

  const faqs = [
    { question: "What is a good fielding percentage?", answer: "Elite defenders typically post a fielding percentage of .980 or higher. A .990+ mark is generally considered Gold Glove caliber at most positions. First basemen and catchers often exceed .995 because their chances are routine, while shortstops and third basemen post slightly lower figures due to the difficulty of their plays." },
    { question: "Why does range factor matter more than fielding percentage?", answer: "Fielding percentage only measures how often a fielder avoids errors on balls they actually reach. Range factor (9 × (PO+A) / innings) captures how many balls a player gets to. A stationary fielder with an easy assignment can have a high fielding percentage but a poor range factor, which is why scouts weight range heavily." },
    { question: "How do position benchmarks work?", answer: "Each position has a typical range factor window. A shortstop with an RF of 4.5–5.0 per nine innings is considered excellent, while 4.0–4.5 is good. Catchers and first basemen have very different baselines because their defensive responsibilities generate far more or far fewer putouts and assists per inning." },
    { question: "What does the Double Play Index show?", answer: "The Double Play Index (double plays ÷ games played) measures a fielder's ability to turn two. Middle infielders (shortstop, second base) dominate this metric; a DPI above 0.6 per game is strong for a starter, reflecting quick hands and good footwork around the bag." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Baseball Fielding Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baseball Fielding Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Putouts</label>
                <input type="number" value={inputs.putouts} onChange={num("putouts")} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Assists</label>
                <input type="number" value={inputs.assists} onChange={num("assists")} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Errors</label>
                <input type="number" value={inputs.errors} onChange={num("errors")} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Games Played</label>
                <input type="number" value={inputs.gamesPlayed} onChange={num("gamesPlayed")} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Advanced Options</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Position</label>
                  <select value={inputs.position} onChange={(e) => setInputs((p) => ({ ...p, position: e.target.value as Position }))} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20">
                    {Object.keys(POSITION_BENCHMARKS).map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Innings Played</label>
                  <input type="number" value={inputs.inningsPlayed} onChange={num("inningsPlayed")} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Double Plays</label>
                  <input type="number" value={inputs.doublePlays} onChange={num("doublePlays")} className="w-full h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Total Chances</label>
                  <input type="number" value={result.totalChances} readOnly className="w-full h-10 px-3 text-lg rounded-md border border-input bg-muted/40 outline-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalc} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Fielding Percentage</div>
              <div className="text-4xl font-bold text-primary">{fmt(result.fieldingPct, 3)}</div>
              <div className="text-sm text-muted-foreground mt-1">{fmt(result.totalChances, 0)} total chances • {fmt(result.rangeFactor, 2)} range factor/9</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Range Factor", value: fmt(result.rangeFactor, 2) },
                { label: "Errors / Game", value: fmt(result.errorsPerGame, 2) },
                { label: "DP Index", value: fmt(result.doublePlayIndex, 2) },
              ].map((s) => (
                <div key={s.label} className="card-calculator !p-3 border border-border bg-card text-center">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-bold mt-1">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-semibold mb-3">Defensive Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {[
                  { label: "Putouts (PO)", value: fmt(inputs.putouts, 0) },
                  { label: "Assists (A)", value: fmt(inputs.assists, 0) },
                  { label: "Errors (E)", value: fmt(inputs.errors, 0) },
                  { label: "Total Chances (PO+A+E)", value: fmt(result.totalChances, 0) },
                  { label: "Innings Played", value: fmt(inputs.inningsPlayed, 0) },
                  { label: "Double Plays Turned", value: fmt(inputs.doublePlays, 0) },
                ].map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 text-muted-foreground">{r.label}</td>
                    <td className="text-right font-medium">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-semibold mb-3">Defensive Metrics</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.chart} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [Number(v).toLocaleString(), ""]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chart.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">{inputs.position} — Range Factor Benchmarks (per 9 innings)</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg p-2 text-center border border-border">
                  <div className="font-bold text-green-600">{result.rfBenchmark.excellent}</div>
                  <div className="text-muted-foreground">Excellent</div>
                </div>
                <div className="rounded-lg p-2 text-center border border-border">
                  <div className="font-bold text-blue-600">{result.rfBenchmark.good}</div>
                  <div className="text-muted-foreground">Good</div>
                </div>
                <div className="rounded-lg p-2 text-center border border-border bg-primary/10">
                  <div className="font-bold text-primary">{fmt(result.rangeFactor, 2)}</div>
                  <div className="text-muted-foreground">{result.rfRating}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Fielding Percentage Defines Defensive Value</h2>
            <p>Fielding percentage is the most fundamental defensive statistic in baseball, expressing how reliably a player handles the chances that come their way. It is calculated as (putouts + assists) divided by total chances, where total chances equal putouts plus assists plus errors. A shortstop who records 250 putouts, 120 assists, and 8 errors has 378 total chances and a fielding percentage of .979. While the metric is intuitive and easy to compare across decades, it carries a well-known blind spot: it only rewards clean handling of balls already reached. A stationary fielder can post a respectable fielding percentage simply because few difficult balls are hit their direction, which is why modern evaluation pairs it with range-based metrics.</p>

            <h2 className="text-2xl font-bold mb-3">Range Factor and Position-Specific Benchmarks</h2>
            <p>Range factor normalizes defensive activity to a standardized nine-inning game by multiplying putouts plus assists by nine and dividing by innings played. This reveals how much ground a fielder covers. Because defensive responsibilities differ radically by position, each spot on the diamond carries its own benchmark window. Middle infielders—shortstops and second basemen—command the highest range factors, typically 4.0–5.3 per nine innings, reflecting constant action on ground balls and relays. First basemen post the largest figures (7.5–9.5) because nearly every putout funnels through them, while outfielders sit lower (1.7–2.5) given the sparse distribution of fly-ball chances. Catchers occupy a unique band (2.5–4.0) tied to caught stealings and pitcher assists. Comparing a player against their position benchmark rather than the league average is essential for fair defensive evaluation.</p>

            <h2 className="text-2xl font-bold mb-3">Turning Defense Into Gold Glove Criteria</h2>
            <p>Elite defensive value emerges when fielding percentage, range factor, and playmaking converge. The Double Play Index—double plays divided by games played—isolates a fielder's ability to erase baserunners, a skill that separates good middle infielders from great ones. Scouts and awards committees such as the Rawlings Gold Glove program weigh these complementary metrics together: a .990 fielding percentage loses luster if range factor sits below the position's "good" threshold, while a high range factor with frequent errors signals instability. The most complete defenders combine a .985+ fielding percentage, a range factor in the position's excellent window, and a healthy double-play rate, producing the quiet, game-altering defense that wins pennants before the bat ever comes to the plate.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baseball-fielding-calculator" />
          <PopularCalculators exclude="/calculator/baseball-fielding-calculator" />
        </div>
      </div>
    </>
  );
};

export default BaseballFieldingCalculator;
