"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Gamepad, Clock, Trophy, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";

interface GameResult {
  mainStory: number;
  mainExtras: number;
  completionist: number;
  totalHours: number;
  pace: "Slow" | "Average" | "Fast";
  recommendedSessions: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; hours: number; fill: string }[];
}

const DEFAULTS = {
  mainStoryEst: "20",
  extrasEst: "10",
  completionistEst: "40",
  playFrequency: "5",
  sessionLength: "2",
  playStyle: "average",
};

const PLAY_STYLE_MULTIPLIERS = {
  slow: 1.3,
  average: 1.0,
  fast: 0.75,
};

const calculate = (v: typeof DEFAULTS): GameResult => {
  const mainEst = parseFloat(v.mainStoryEst) || 0;
  const extrasEst = parseFloat(v.extrasEst) || 0;
  const completionistEst = parseFloat(v.completionistEst) || 0;
  const freq = parseFloat(v.playFrequency) || 1;
  const sessionLen = parseFloat(v.sessionLength) || 1;

  const styleMult = PLAY_STYLE_MULTIPLIERS[v.playStyle as keyof typeof PLAY_STYLE_MULTIPLIERS] || 1.0;

  const mainStory = mainEst * styleMult;
  const mainExtras = (mainEst + extrasEst) * styleMult;
  const completionist = completionistEst * styleMult;
  const totalHours = completionist;

  let pace: "Slow" | "Average" | "Fast";
  if (styleMult > 1.2) pace = "Slow";
  else if (styleMult < 0.85) pace = "Fast";
  else pace = "Average";

  const recommendedSessions = freq > 0 ? Math.ceil(totalHours / (freq * sessionLen)) : 0;

  const chartData = [
    { name: "Main Story", hours: parseFloat(mainStory.toFixed(1)), fill: "#3b82f6" },
    { name: "Main + Extras", hours: parseFloat(mainExtras.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Completionist", hours: parseFloat(completionist.toFixed(1)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Main Story Hours", value: `${mainStory.toFixed(1)} hrs` },
    { label: "Main + Extras Hours", value: `${mainExtras.toFixed(1)} hrs` },
    { label: "Completionist Hours", value: `${completionist.toFixed(1)} hrs` },
    { label: "Play Style Multiplier", value: `${styleMult.toFixed(2)}x (${v.playStyle})` },
    { label: "Sessions Per Week", value: `${freq.toFixed(1)}` },
    { label: "Avg Session Length", value: `${sessionLen.toFixed(1)} hrs` },
    { label: "Total Sessions Needed", value: `${recommendedSessions}` },
    { label: "Weeks to Complete", value: `${(recommendedSessions / freq).toFixed(1)} weeks` },
  ];

  const summaryStats = [
    { label: "Main Story", value: `${mainStory.toFixed(1)} hrs` },
    { label: "Main + Extras", value: `${mainExtras.toFixed(1)} hrs` },
    { label: "Completionist", value: `${completionist.toFixed(1)} hrs` },
    { label: "Pace", value: pace },
    { label: "Sessions Needed", value: `${recommendedSessions}` },
    { label: "Weeks (est.)", value: `${(recommendedSessions / freq).toFixed(1)}` },
  ];

  return {
    mainStory,
    mainExtras,
    completionist,
    totalHours,
    pace,
    recommendedSessions,
    breakdown,
    summaryStats,
    chartData,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p className="text-primary">{payload[0].value} hours</p>
      </div>
    );
  }
  return null;
};

export default function GameCompletionTimeCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<GameResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is the difference between Main Story and Completionist time?", answer: "Main Story is the time to complete the main objective or finish the game. Main + Extras includes optional content and side quests. Completionist is the time to achieve 100% completion with all collectibles, achievements, and side content." },
    { question: "How does play style affect completion time?", answer: "Slow players take 30% longer, fast players complete 25% faster. The calculator adjusts all time estimates based on your selected play style. The average multiplier is 1.0x." },
    { question: "How many sessions do I need?", answer: "The calculator divides total hours by your weekly session frequency times average session length to estimate how many sessions and weeks you'll need to complete the game." },
    { question: "Where do the time estimates come from?", answer: "Time estimates are based on community data from HowLongToBeat.com, which aggregates completion times reported by thousands of players for each game." },
    { question: "Why does completionist take so much longer?", answer: "Completionist playthroughs require finding every collectible, completing every side quest, earning all achievements, and often playing New Game Plus. This can be 2-3x the main story length for many games." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Game Completion Time Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Game Completion Time Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Gamepad className="w-3.5 h-3.5" /> Time Estimates
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Main Story (hours)</label>
                  <input type="number" value={vals.mainStoryEst} onChange={(e) => updateVal("mainStoryEst", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Extras (hours)</label>
                  <input type="number" value={vals.extrasEst} onChange={(e) => updateVal("extrasEst", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Completionist (hours)</label>
                  <input type="number" value={vals.completionistEst} onChange={(e) => updateVal("completionistEst", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Play Schedule
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Sessions Per Week</label>
                  <input type="number" value={vals.playFrequency} onChange={(e) => updateVal("playFrequency", e.target.value)} className="input-calc" step="any" min="0.1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Avg Session Length (hours)</label>
                  <input type="number" value={vals.sessionLength} onChange={(e) => updateVal("sessionLength", e.target.value)} className="input-calc" step="any" min="0.1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Play Style</label>
                  <select value={vals.playStyle} onChange={(e) => updateVal("playStyle", e.target.value)} className="input-calc">
                    <option value="slow">Slow (1.3x)</option>
                    <option value="average">Average (1.0x)</option>
                    <option value="fast">Fast (0.75x)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Completion Time
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{result.totalHours.toFixed(1)} hrs</div>
                <p className="text-sm text-muted-foreground">{result.pace} play style · {result.recommendedSessions} sessions needed</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Main Story</div>
                  <div className="text-lg font-bold text-foreground">{result.mainStory.toFixed(1)} hrs</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Main + Extras</div>
                  <div className="text-lg font-bold text-foreground">{result.mainExtras.toFixed(1)} hrs</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Completionist</div>
                  <div className="text-lg font-bold text-foreground">{result.completionist.toFixed(1)} hrs</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Metric</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Completion Milestones
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Schedule Summary</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Plan Your Gaming Journey</h2>
            <p>Modern games can be massive undertakings, and knowing how long it will take you to complete a game is essential for planning your schedule and budget. Whether you're aiming for the main story, extra content, or 100% completion, this calculator helps you estimate the time investment based on your play style and available gaming schedule.</p>

            <h3>1. Understanding the Three Completion Modes</h3>
            <p>Games are typically categorized by three completion levels: <strong>Main Story</strong> (just the main objectives), <strong>Main + Extras</strong> (main story plus optional side quests and content), and <strong>Completionist</strong> (everything, including all collectibles, achievements, and often a New Game Plus). The Completionist mode can take 2-3 times longer than the main story for many games.</p>

            <h3>2. How Play Style Affects Time</h3>
            <p>Everyone plays differently. Methodical players who explore every corner, read every note, and watch every cutscene naturally take longer. Speedrun-style players who focus on objectives move faster. The calculator applies a style multiplier to the base estimates: Slow players get 1.3x the time, Fast players get 0.75x, and Average players use the base estimate.</p>

            <h3>3. Planning Your Schedule</h3>
            <p>Once you know the estimated total hours, the calculator divides by your expected weekly gaming schedule (sessions per week × hours per session) to tell you how many weeks you'll need. This helps you decide whether to start that 80-hour JRPG before your next big project or pick up a shorter game for a quick win.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/game-completion-time-calculator" />
          <PopularCalculators exclude="/calculator/game-completion-time-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981", "#f59e0b"];
