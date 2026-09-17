"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface GoalsInput {
  goals: number;
  matches: number;
  minutesPerMatch: number;
}

interface GoalsResult {
  goalsPerGame: number;
  goalsPer90: number;
  perSeason38: number;
  minutesPerGoal: number;
  chartData: { name: string; rate: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcGoals(input: GoalsInput): GoalsResult {
  const totalMinutes = input.matches * input.minutesPerMatch;
  const goalsPerGame = input.matches > 0 ? input.goals / input.matches : 0;
  const goalsPer90 = totalMinutes > 0 ? (input.goals / totalMinutes) * 90 : 0;
  const perSeason38 = goalsPerGame * 38;
  const minutesPerGoal = input.goals > 0 ? totalMinutes / input.goals : 0;

  const chartData = [
    { name: "Your Rate", rate: Number(goalsPerGame.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Def. Mid", rate: 0.1, fill: "#94a3b8" },
    { name: "Midfielder", rate: 0.2, fill: "#94a3b8" },
    { name: "Forward", rate: 0.45, fill: "#94a3b8" },
    { name: "Elite Striker", rate: 0.8, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Goals Scored", value: `${input.goals}` },
    { label: "Matches Played", value: `${input.matches}` },
    { label: "Minutes per Match", value: `${input.minutesPerMatch} min` },
    { label: "Goals per Game", value: `${goalsPerGame.toFixed(2)}` },
    { label: "Goals per 90 Minutes", value: `${goalsPer90.toFixed(2)}` },
    { label: "Projected 38-Game Season", value: `${perSeason38.toFixed(1)} goals` },
    { label: "Minutes per Goal", value: minutesPerGoal > 0 ? `${minutesPerGoal.toFixed(0)} min` : "—" },
  ];

  const summaryStats = [
    { label: "Goals per Game", value: `${goalsPerGame.toFixed(2)}` },
    { label: "Goals per 90 min", value: `${goalsPer90.toFixed(2)}` },
    { label: "Projected Season (38)", value: `${perSeason38.toFixed(1)} goals` },
    { label: "Minutes per Goal", value: minutesPerGoal > 0 ? `${minutesPerGoal.toFixed(0)}` : "—" },
    { label: "Total Minutes", value: `${totalMinutes.toLocaleString()} min` },
    { label: "Goals Scored", value: `${input.goals}` },
  ];

  return { goalsPerGame, goalsPer90, perSeason38, minutesPerGoal, chartData, breakdown, summaryStats };
}

const DEFAULTS: GoalsInput = { goals: 12, matches: 20, minutesPerMatch: 80 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SoccerGoalsPerGameCalculator() {
  const [goals, setGoals] = useState(String(DEFAULTS.goals));
  const [matches, setMatches] = useState(String(DEFAULTS.matches));
  const [minutes, setMinutes] = useState(String(DEFAULTS.minutesPerMatch));
  const [result, setResult] = useState<GoalsResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcGoals({ goals: parse(goals, DEFAULTS.goals), matches: parse(matches, DEFAULTS.matches), minutesPerMatch: parse(minutes, DEFAULTS.minutesPerMatch) }));
  const reset = () => {
    setGoals(String(DEFAULTS.goals));
    setMatches(String(DEFAULTS.matches));
    setMinutes(String(DEFAULTS.minutesPerMatch));
    setResult(calcGoals(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcGoals(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a good goals-per-game rate?", answer: "Roughly: 0.1–0.2 is typical for midfielders, 0.3–0.5 is a solid forward, 0.6–0.8 is a top-tier striker, and above 0.8 approaches elite-scorer territory (roughly a goal every game or better over a season)." },
    { question: "Why use goals per 90 minutes?", answer: "Goals per game punishes substitutes and rewards players who get full matches. Goals per 90 (or per 1,000 minutes) normalizes for playing time, giving a fairer read on finishing efficiency." },
    { question: "How do I project a full season?", answer: "Multiply your goals-per-game rate by the number of league matches (typically 38 in top European leagues, 34 in MLS, 38 in the Championship). The projection assumes your rate holds with the same role and minutes." },
    { question: "Does sample size matter?", answer: "Yes. A 5-match sample is noisy — one hat-trick swings the rate enormously. Rates stabilize only over 25+ matches or roughly 2,000+ minutes, so treat early-season numbers as preliminary." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Soccer Goals per Game Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Soccer Goals per Game Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Goals Scored</label>
                <div className={inp}><input type="number" value={goals} onChange={(e) => setGoals(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Matches Played</label>
                <div className={inp}><input type="number" value={matches} onChange={(e) => setMatches(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Avg Minutes per Match</label>
                <div className={inp}><input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Goals per Game</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.goalsPerGame.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Goals per 90: {result.goalsPer90.toFixed(2)} · Projected 38-game season: {result.perSeason38.toFixed(1)} goals</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Goals per 90", `${result.goalsPer90.toFixed(2)}`], ["Season Projection", `${result.perSeason38.toFixed(1)}`], ["Min per Goal", result.minutesPerGoal > 0 ? `${result.minutesPerGoal.toFixed(0)}` : "—"]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Rate Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Your Rate vs Position Benchmarks</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(2)} goals/game`, ""]} />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Reading Scoring Rates</h2>
            <p>Goals per game is the simplest scoring metric, but it hides playing time. A striker with 15 goals in 30 full matches (0.50/game) is outperforming one with 15 goals in 30 starts who is subbed at 60 minutes (0.63 per 90). This calculator reports both raw rate and per-90 efficiency.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmarks by Position</h2>
            <p>Midfielders typically sit at 0.10–0.25 goals per game, wide attackers 0.25–0.45, central forwards 0.45–0.65, and elite strikers above 0.7. Elite-scorer territory is roughly a goal every other game — very few players exceed 0.8 across a career.</p>
            <h2 className="text-2xl font-bold mb-3">Projections Need Context</h2>
            <p>Rates fluctuate with role, fitness, opponents, and sample size. Use the season projection as a planning number, not a prediction, and always interpret small samples cautiously.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/soccer-goals-per-game-calculator" />
          <PopularCalculators exclude="/calculator/soccer-goals-per-game-calculator" />
        </div>
      </div>
    </>
  );
}
