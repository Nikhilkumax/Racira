"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface JudoResult {
  player1Score: number;
  player2Score: number;
  winner: string;
  winMethod: string;
  p1Ippon: number;
  p1Wazaari: number;
  p1Shido: number;
  p2Ippon: number;
  p2Wazaari: number;
  p2Shido: number;
  chartData: { name: string; P1: number; P2: number }[];
  breakdown: { label: string; p1: string; p2: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  p1Ippon: "0",
  p1Wazaari: "2",
  p1Shido: "1",
  p2Ippon: "0",
  p2Wazaari: "1",
  p2Shido: "2",
};

// IJF Official Scoring Rules (2017+ ruleset)
// Ippon = instant win (10 pts for calculation)
// Waza-ari = half-point (5 pts each; two waza-ari = ippon)
// Shido = penalty warning to opponent (each gives opponent 1 waza-ari equivalent at 3; 4th = hansoku-make = loss)
function calculate(
  p1Ippon: number, p1Wazaari: number, p1Shido: number,
  p2Ippon: number, p2Wazaari: number, p2Shido: number
): JudoResult {
  // Shido conversions: 3 shido on opponent = opponent penalty-point win equivalent
  const p1PenaltyPoints = p2Shido >= 4 ? 10 : p2Shido >= 3 ? 5 : 0; // 4th shido = hansoku-make = instant loss
  const p2PenaltyPoints = p1Shido >= 4 ? 10 : p1Shido >= 3 ? 5 : 0;
  const p1HansokuMake = p1Shido >= 4;
  const p2HansokuMake = p2Shido >= 4;

  // Two waza-ari = ippon
  const p1EffectiveIppon = p1Ippon + Math.floor(p1Wazaari / 2);
  const p2EffectiveIppon = p2Ippon + Math.floor(p2Wazaari / 2);
  const p1RemWazaari = p1Wazaari % 2;
  const p2RemWazaari = p2Wazaari % 2;

  const p1Score = (p1EffectiveIppon * 10) + (p1RemWazaari * 5) + p1PenaltyPoints;
  const p2Score = (p2EffectiveIppon * 10) + (p2RemWazaari * 5) + p2PenaltyPoints;

  let winner = "";
  let winMethod = "";

  if (p1HansokuMake) {
    winner = "Player 2 Wins";
    winMethod = "Hansoku-make (4 shido — disqualification)";
  } else if (p2HansokuMake) {
    winner = "Player 1 Wins";
    winMethod = "Hansoku-make (4 shido — disqualification)";
  } else if (p1EffectiveIppon > 0 && p1EffectiveIppon > p2EffectiveIppon) {
    winner = "Player 1 Wins";
    winMethod = "Ippon" + (Math.floor(p1Wazaari / 2) > 0 ? " (2× Waza-ari)" : "");
  } else if (p2EffectiveIppon > 0 && p2EffectiveIppon > p1EffectiveIppon) {
    winner = "Player 2 Wins";
    winMethod = "Ippon" + (Math.floor(p2Wazaari / 2) > 0 ? " (2× Waza-ari)" : "");
  } else if (p1Score > p2Score) {
    winner = "Player 1 Leads";
    winMethod = p1RemWazaari > p2RemWazaari ? "Waza-ari advantage" : "Penalty advantage";
  } else if (p2Score > p1Score) {
    winner = "Player 2 Leads";
    winMethod = p2RemWazaari > p1RemWazaari ? "Waza-ari advantage" : "Penalty advantage";
  } else {
    winner = "Draw / Golden Score";
    winMethod = "Scores equal — golden score (overtime) decides";
  }

  const chartData = [
    { name: "Score", P1: p1Score, P2: p2Score },
    { name: "Ippon", P1: p1EffectiveIppon * 10, P2: p2EffectiveIppon * 10 },
    { name: "Waza-ari", P1: p1RemWazaari * 5, P2: p2RemWazaari * 5 },
    { name: "Penalty Pts", P1: p1PenaltyPoints, P2: p2PenaltyPoints },
  ];

  const breakdown = [
    { label: "Ippon", p1: `${p1Ippon}`, p2: `${p2Ippon}` },
    { label: "Waza-ari", p1: `${p1Wazaari}`, p2: `${p2Wazaari}` },
    { label: "Shido (penalties)", p1: `${p1Shido}`, p2: `${p2Shido}` },
    { label: "Effective Ippon", p1: `${p1EffectiveIppon}`, p2: `${p2EffectiveIppon}` },
    { label: "Penalty Points Given", p1: `+${p1PenaltyPoints}`, p2: `+${p2PenaltyPoints}` },
    { label: "Total Score", p1: `${p1Score}`, p2: `${p2Score}` },
  ];

  const summaryStats = [
    { label: "P1 Score", value: `${p1Score} pts` },
    { label: "P2 Score", value: `${p2Score} pts` },
    { label: "Winner", value: winner },
    { label: "Method", value: winMethod },
    { label: "P1 Shido", value: `${p1Shido}${p1Shido >= 4 ? " ⚠️ DQ" : ""}` },
    { label: "P2 Shido", value: `${p2Shido}${p2Shido >= 4 ? " ⚠️ DQ" : ""}` },
  ];

  return { player1Score: p1Score, player2Score: p2Score, winner, winMethod, p1Ippon, p1Wazaari, p1Shido, p2Ippon, p2Wazaari, p2Shido, chartData, breakdown, summaryStats };
}

const NumInput = ({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <input id={id} type="number" value={value} min={0} max={10}
      onChange={e => onChange(e.target.value)}
      className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" />
  </div>
);

export default function JudoPointsCalculator() {
  const [p1Ippon, setP1Ippon] = useState(DEFAULTS.p1Ippon);
  const [p1Wazaari, setP1Wazaari] = useState(DEFAULTS.p1Wazaari);
  const [p1Shido, setP1Shido] = useState(DEFAULTS.p1Shido);
  const [p2Ippon, setP2Ippon] = useState(DEFAULTS.p2Ippon);
  const [p2Wazaari, setP2Wazaari] = useState(DEFAULTS.p2Wazaari);
  const [p2Shido, setP2Shido] = useState(DEFAULTS.p2Shido);
  const [result, setResult] = useState<JudoResult | null>(null);

  const handleCalculate = () => {
    setResult(calculate(
      parseInt(p1Ippon) || 0, parseInt(p1Wazaari) || 0, parseInt(p1Shido) || 0,
      parseInt(p2Ippon) || 0, parseInt(p2Wazaari) || 0, parseInt(p2Shido) || 0
    ));
  };

  const handleReset = () => {
    setP1Ippon(DEFAULTS.p1Ippon); setP1Wazaari(DEFAULTS.p1Wazaari); setP1Shido(DEFAULTS.p1Shido);
    setP2Ippon(DEFAULTS.p2Ippon); setP2Wazaari(DEFAULTS.p2Wazaari); setP2Shido(DEFAULTS.p2Shido);
    setResult(calculate(0, 2, 1, 0, 1, 2));
  };

  useEffect(() => { setResult(calculate(0, 2, 1, 0, 1, 2)); }, []);

  const winnerColor = result?.winner.includes("1") ? "text-blue-500" : result?.winner.includes("2") ? "text-orange-500" : "text-muted-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator/everyday-life" }, { label: "Judo Points Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Judo Points Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="text-sm font-semibold text-primary border-b border-border pb-2">🔵 Player 1</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="p1Ippon" label="Ippon" value={p1Ippon} onChange={setP1Ippon} />
              <NumInput id="p1Wazaari" label="Waza-ari" value={p1Wazaari} onChange={setP1Wazaari} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="p1Shido" label="Shido (penalties)" value={p1Shido} onChange={setP1Shido} />
              <div /> {/* spacer */}
            </div>

            <div className="text-sm font-semibold text-orange-500 border-b border-border pb-2">🟠 Player 2</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="p2Ippon" label="Ippon" value={p2Ippon} onChange={setP2Ippon} />
              <NumInput id="p2Wazaari" label="Waza-ari" value={p2Wazaari} onChange={setP2Wazaari} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="p2Shido" label="Shido (penalties)" value={p2Shido} onChange={setP2Shido} />
              <div /> {/* spacer */}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-colors">
                Calculate
              </button>
              <button type="button" onClick={handleReset} aria-label="Reset"
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          {result && (
            <div className="flex flex-col gap-4">
              {/* 1. Primary Result */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Match Result</div>
                <div className={`text-4xl font-bold ${winnerColor}`}>{result.winner}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.winMethod}</div>
              </div>

              {/* 2. 3-Stat Bar */}
              <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  { label: "P1 Score", value: `${result.player1Score} pts`, color: "text-blue-500" },
                  { label: "P2 Score", value: `${result.player2Score} pts`, color: "text-orange-500" },
                  { label: "Margin", value: `${Math.abs(result.player1Score - result.player2Score)} pts`, color: "" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* 3. Breakdown Table */}
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Metric</th>
                      <th className="text-center text-xs uppercase tracking-wide text-blue-500 font-semibold py-2.5 px-3">P1</th>
                      <th className="text-center text-xs uppercase tracking-wide text-orange-500 font-semibold py-2.5 px-3">P2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label === "Total Score" ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="text-base py-2.5 px-3 text-center text-blue-600 font-medium">{r.p1}</td>
                        <td className="text-base py-2.5 px-3 text-center text-orange-600 font-medium">{r.p2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Chart */}
              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Score Breakdown Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="P1" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="P2" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 5. Summary Statistics */}
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SEO */}
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is a Judo Points Calculator?</h2>
            <p className="text-muted-foreground leading-relaxed">A judo points calculator applies the International Judo Federation (IJF) scoring rules to determine the current leader in a match. Enter the number of Ippon, Waza-ari, and Shido (penalty warnings) for each competitor. The calculator converts all scores to a unified point total, identifies the current leader, and explains the win method — whether by Ippon, Waza-ari advantage, or penalty conversion. Defaults show a realistic match where Player 1 has 2 Waza-ari and 1 Shido, versus Player 2 with 1 Waza-ari and 2 Shido.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How IJF Judo Scoring Works</h2>
            <p className="text-muted-foreground leading-relaxed">Under the current IJF 2017+ ruleset, there are two primary scores: Ippon (full point, instant win) and Waza-ari (half-point). Two Waza-ari equal one Ippon and end the match immediately. Yuko and Koka scores were eliminated in 2010 and 2009 respectively. Shido are warning penalties: each Shido transfers a Waza-ari equivalent penalty point to the opponent. Three Shido give the opponent a Waza-ari advantage; four Shido result in Hansoku-make — immediate disqualification. If scores are level at the end of regulation, the match proceeds to Golden Score (sudden-death overtime) where the first score of any kind wins.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The primary result shows who is leading and by what method. The 3-stat bar shows each player's total calculated score and the point margin. The breakdown table shows raw scores, effective Ippon counts (after combining two Waza-ari), and penalty bonus points awarded to each player. The bar chart compares each score category side-by-side. If the result shows "Golden Score," it means the match is tied and would require overtime — no winner can be determined from the current point totals alone.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/judo-points-calculator" />
      </div>
    </>
  );
}
