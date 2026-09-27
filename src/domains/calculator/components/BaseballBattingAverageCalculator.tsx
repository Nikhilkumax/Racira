"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, BarChart3, ListChecks, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type BaseballInputs = {
  atBats: string;
  hits: string;
  walks: string;
  sacrificeFlies: string;
  hitByPitch: string;
  singles: string;
  doubles: string;
  triples: string;
  homeRuns: string;
};

type BaseballResult = {
  battingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number;
  ops: number;
  totalBases: number;
  hitBreakdownTotal: number;
  warning: string | null;
  chartData: { name: string; value: number; fill: string }[];
};

const DEFAULTS: BaseballInputs = {
  atBats: "500",
  hits: "140",
  walks: "50",
  sacrificeFlies: "5",
  hitByPitch: "3",
  singles: "85",
  doubles: "35",
  triples: "5",
  homeRuns: "15",
};

const safeNum = (v: string): number => {
  const n = parseFloat(v);
  if (isNaN(n) || n < 0) return 0;
  return n;
};

const calculate = (i: BaseballInputs): BaseballResult => {
  const atBats = safeNum(i.atBats);
  const hits = safeNum(i.hits);
  const walks = safeNum(i.walks);
  const sf = safeNum(i.sacrificeFlies);
  const hbp = safeNum(i.hitByPitch);
  const s1 = safeNum(i.singles);
  const s2 = safeNum(i.doubles);
  const s3 = safeNum(i.triples);
  const hr = safeNum(i.homeRuns);

  const battingAverage = atBats > 0 ? hits / atBats : 0;
  const obpDenominator = atBats + walks + hbp + sf;
  const onBasePercentage = obpDenominator > 0 ? (hits + walks + hbp) / obpDenominator : 0;
  const totalBases = s1 + 2 * s2 + 3 * s3 + 4 * hr;
  const sluggingPercentage = atBats > 0 ? totalBases / atBats : 0;
  const ops = onBasePercentage + sluggingPercentage;

  const breakdown = s1 + s2 + s3 + hr;
  let warning: string | null = null;
  if (atBats > 0 && hits > atBats) {
    warning = "Hits (" + hits + ") exceed at-bats (" + atBats + "). Check your inputs.";
  } else if (breakdown > 0 && breakdown !== hits && hits > 0) {
    warning =
      "Hit breakdown (" + breakdown + " total bases-hits) does not sum to hits (" + hits + "). " +
      "Singles + Doubles + Triples + Home Runs should equal hits.";
  }

  const palette = ["#2563eb", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#16a34a"];
  const chartData = [
    { name: "Singles", value: s1, fill: palette[0] },
    { name: "Doubles", value: s2, fill: palette[1] },
    { name: "Triples", value: s3, fill: palette[2] },
    { name: "Home Runs", value: hr, fill: palette[3] },
    { name: "Walks", value: walks, fill: palette[4] },
    { name: "Hit By Pitch", value: hbp, fill: palette[5] },
  ];

  return {
    battingAverage,
    onBasePercentage,
    sluggingPercentage,
    ops,
    totalBases,
    hitBreakdownTotal: breakdown,
    warning,
    chartData,
  };
};

const fmt3 = (n: number) => (isFinite(n) ? n.toFixed(3) : "0.000");
const fmt4 = (n: number) => (isFinite(n) ? n.toFixed(4) : "0.0000");

const BaseballBattingAverageCalculator = () => {
  const [inputs, setInputs] = useState<BaseballInputs>(DEFAULTS);
  const [result, setResult] = useState<BaseballResult>(calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const update = (key: keyof BaseballInputs, value: string) => {
    const next = { ...inputs, [key]: value };
    setInputs(next);
    setResult(calculate(next));
  };

  const handleCalculate = () => setResult(calculate(inputs));

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a good batting average in baseball?",
      answer:
        "A .300 batting average is considered excellent, .250 is roughly league average, and anything above .280 is very good. The all-time best hitters finish their careers above .330.",
    },
    {
      question: "How is batting average different from OPS?",
      answer:
        "Batting average measures how often a player gets a hit per at-bat, while OPS (On-Base Plus Slugging) combines how often a player reaches base with how much power they have. OPS is a better single measure of overall offensive value.",
    },
    {
      question: "Why are walks not counted in batting average?",
      answer:
        "A walk is not an at-bat and is not a hit, so it is excluded from batting average. However, walks are included in on-base percentage (OBP), which is why OBP is usually higher than batting average.",
    },
    {
      question: "What counts as an at-bat?",
      answer:
        "An at-bat is any plate appearance that ends in a hit, strikeout, fielder's choice, or out (other than sacrifice). Walks, sacrifice bunts, sacrifice flies, and hit-by-pitches are not at-bats.",
    },
    {
      question: "How do I read slugging percentage?",
      answer:
        "Slugging percentage is total bases divided by at-bats. A single counts as 1, a double 2, a triple 3, and a home run 4. A .500 slugging percentage means the player averages half a base per at-bat.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Baseball Batting Average Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Baseball Batting Average Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-6 border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Player Season Stats</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">At Bats</label>
                <input
                  type="number"
                  value={inputs.atBats}
                  onChange={(e) => update("atBats", e.target.value)}
                  className="input-calc"
                  placeholder="500"
                  step="any"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Hits</label>
                <input
                  type="number"
                  value={inputs.hits}
                  onChange={(e) => update("hits", e.target.value)}
                  className="input-calc"
                  placeholder="140"
                  step="any"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Walks</label>
                <input
                  type="number"
                  value={inputs.walks}
                  onChange={(e) => update("walks", e.target.value)}
                  className="input-calc"
                  placeholder="50"
                  step="any"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">
                  Sacrifice Flies
                </label>
                <input
                  type="number"
                  value={inputs.sacrificeFlies}
                  onChange={(e) => update("sacrificeFlies", e.target.value)}
                  className="input-calc"
                  placeholder="5"
                  step="any"
                  min="0"
                />
              </div>
            </div>

            {/* SECOND TIER - ADVANCED OPTIONS */}
            <details className="group border border-border rounded-lg bg-background/50">
              <summary className="cursor-pointer select-none flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Advanced Options
                </span>
                <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
                <span className="text-xs text-muted-foreground hidden group-open:inline">Hide</span>
              </summary>
              <div className="px-4 pb-4 pt-1 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Hit Breakdown (by base)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Singles (1B)
                      </label>
                      <input
                        type="number"
                        value={inputs.singles}
                        onChange={(e) => update("singles", e.target.value)}
                        className="input-calc"
                        placeholder="85"
                        step="any"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Doubles (2B)
                      </label>
                      <input
                        type="number"
                        value={inputs.doubles}
                        onChange={(e) => update("doubles", e.target.value)}
                        className="input-calc"
                        placeholder="35"
                        step="any"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Triples (3B)
                      </label>
                      <input
                        type="number"
                        value={inputs.triples}
                        onChange={(e) => update("triples", e.target.value)}
                        className="input-calc"
                        placeholder="5"
                        step="any"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Home Runs (4B)
                      </label>
                      <input
                        type="number"
                        value={inputs.homeRuns}
                        onChange={(e) => update("homeRuns", e.target.value)}
                        className="input-calc"
                        placeholder="15"
                        step="any"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Additional On-Base Inputs
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Hit By Pitch (HBP)
                      </label>
                      <input
                        type="number"
                        value={inputs.hitByPitch}
                        onChange={(e) => update("hitByPitch", e.target.value)}
                        className="input-calc"
                        placeholder="3"
                        step="any"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </details>

            <div className="flex gap-2 pt-1">
              <button onClick={handleCalculate} className="btn-calculate flex-1">
                Calculate
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {result.warning && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                {result.warning}
              </div>
            )}

            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                Batting Average
              </p>
              <p className="text-4xl font-extrabold text-primary tabular-nums">
                .{result.battingAverage.toFixed(3).split(".")[1]}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.battingAverage >= 0.3
                  ? "Elite-level hitting"
                  : result.battingAverage >= 0.25
                  ? "Above-average hitter"
                  : result.battingAverage > 0
                  ? "Below-average hitter"
                  : "Enter at-bats and hits to begin"}
              </p>
            </div>

            {/* 3-Stat Bar */}
            <div className="card-calculator grid grid-cols-3 gap-3 !p-4 shadow-sm border border-border bg-card">
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  OBP
                </p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {fmt3(result.onBasePercentage)}
                </p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  SLG
                </p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {fmt3(result.sluggingPercentage)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  OPS
                </p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {fmt3(result.ops)}
                </p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 shadow-sm border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold">Stat Breakdown</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">Batting Average (AVG)</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {fmt3(result.battingAverage)}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">On-Base Percentage (OBP)</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {fmt3(result.onBasePercentage)}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">Slugging Percentage (SLG)</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {fmt3(result.sluggingPercentage)}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">On-Base Plus Slugging (OPS)</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {fmt3(result.ops)}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">Total Bases</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {result.totalBases.toFixed(0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Hit Breakdown Sum (1B+2B+3B+HR)</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {result.hitBreakdownTotal.toFixed(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recharts BarChart */}
            <div className="card-calculator !p-5 shadow-sm border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold">Hit Type Distribution</h2>
              </div>
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value: number) => [value, "Count"]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="card-calculator !p-5 shadow-sm border border-border bg-card">
              <h2 className="text-base font-bold mb-3">Summary Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-md bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">AVG</p>
                  <p className="text-lg font-bold tabular-nums">{fmt3(result.battingAverage)}</p>
                </div>
                <div className="rounded-md bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">OBP</p>
                  <p className="text-lg font-bold tabular-nums">{fmt3(result.onBasePercentage)}</p>
                </div>
                <div className="rounded-md bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">SLG</p>
                  <p className="text-lg font-bold tabular-nums">{fmt3(result.sluggingPercentage)}</p>
                </div>
                <div className="rounded-md bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">OPS</p>
                  <p className="text-lg font-bold tabular-nums">{fmt3(result.ops)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                AVG = Hits / At Bats. OBP = (Hits + Walks + HBP) / (At Bats + Walks + HBP +
                Sacrifice Flies). SLG = Total Bases / At Bats. OPS = OBP + SLG. Totals use the
                advanced hit-breakdown inputs where provided.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Baseball Batting Average Calculator</h2>
            <p>
              The Baseball Batting Average Calculator turns a player's raw season totals into the
              core metrics that scouts, coaches, and fantasy managers rely on. Enter at-bats,
              hits, walks, and sacrifice flies to instantly compute batting average (AVG),
              on-base percentage (OBP), slugging percentage (SLG), and on-base plus slugging (OPS).
              Open the Advanced Options panel to break hits down by singles, doubles, triples, and
              home runs, which unlocks total-base and slugging math along with a live hit-type
              distribution chart. All formulas follow official Major League Baseball definitions, so
              the numbers you see map directly to the leaderboards. Whether you are evaluating a
              prospect, comparing two hitters head-to-head, or building a lineup, this calculator
              removes the arithmetic and lets you focus on the decisions that win games.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-5">How to Read the Results</h3>
            <p>
              Batting average answers one question: of the times a player came to the plate and
              swung away, how often did they get a hit? A .300 hitter succeeds just three times in
              ten tries, which is why even small differences matter over a full season. OBP rewards
              patience by counting walks and hit-by-pitches, while slugging weights extra-base hits
              heavily, so a player with 20 home runs can post a strong SLG even with a modest AVG.
              OPS combines the two into a single, easy-to-rank number where .800 is good, .900 is
              All-Star caliber, and 1.000 is elite. Use the 3-stat bar and summary cards to compare
              players at a glance, and use the breakdown table to verify that your hit totals add up
              to your hits total.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-5">Player Evaluation and Team Strategy</h3>
            <p>
              These metrics feed directly into real decisions. A leadoff hitter with a high OBP
              (.360+) sets the table by reaching base ahead of power bats, while a cleanup hitter
              with a high SLG (.500+) drives in runs. Managers build balanced lineups by pairing
              on-base leaders with sluggers, and front offices use OPS to value contracts and
              identify underrated contributors who walk a lot or hit for extra bases. Track a
              player's AVG, OBP, SLG, and OPS across stretches of the season to spot slumps and hot
              streaks, then adjust playing time, batting order, or matchup strategy accordingly.
              Because walks are excluded from batting average but included in OBP, a disciplined
              hitter can look merely average on AVG while being far more valuable in practice.
            </p>
          </section>
          <FAQSection
            faqs={faqs}
            pageUrl="https://racira.com/calculator/baseball-batting-average-calculator"
          />
          <PopularCalculators exclude="/calculator/baseball-batting-average-calculator" />
        </div>
      </div>
    </>
  );
};

export default BaseballBattingAverageCalculator;
