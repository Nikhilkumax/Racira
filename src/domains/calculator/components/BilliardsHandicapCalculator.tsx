"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HandicapResult {
  spotBalls: number;
  strongerPlayer: string;
  weakerPlayer: string;
  winProbA: number;
  winProbB: number;
  raceLength: number;
  fairRaceA: number;
  fairRaceB: number;
  chartData: { name: string; winProb: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHandicap(skillA: number, skillB: number, race: number): HandicapResult {
  const a = Math.max(1, Math.min(10, skillA));
  const b = Math.max(1, Math.min(10, skillB));
  const raceLength = Math.max(1, Math.round(race));

  const spotBalls = Math.min(7, Math.abs(a - b));
  const stronger = a >= b ? "Player A" : "Player B";
  const weaker = a >= b ? "Player B" : "Player A";

  // Win probability from squared skill ratio (logistic-style)
  const pA = a * a / (a * a + b * b);
  const pB = 1 - pA;

  // Fair race: weaker player needs fewer wins; scale by win probability
  const fairRaceA = Math.max(1, Math.round(raceLength * pA));
  const fairRaceB = Math.max(1, Math.round(raceLength * pB));

  const chartData = [
    { name: "Player A", winProb: +(pA * 100).toFixed(1) },
    { name: "Player B", winProb: +(pB * 100).toFixed(1) },
  ];

  return {
    spotBalls,
    strongerPlayer: stronger,
    weakerPlayer: weaker,
    winProbA: pA,
    winProbB: pB,
    raceLength,
    fairRaceA,
    fairRaceB,
    chartData,
    breakdown: [
      { label: "Player A Skill", value: `${a} (of 10)` },
      { label: "Player B Skill", value: `${b} (of 10)` },
      { label: "Stronger Player", value: stronger },
      { label: "Handicap (Balls Spotted)", value: spotBalls > 0 ? `${spotBalls} ball${spotBalls > 1 ? "s" : ""} to ${weaker}` : "Even match" },
      { label: "Win Probability A", value: `${(pA * 100).toFixed(1)}%` },
      { label: "Win Probability B", value: `${(pB * 100).toFixed(1)}%` },
      { label: "Race Length", value: `First to ${raceLength}` },
      { label: "Fair Race A", value: `First to ${fairRaceA}` },
      { label: "Fair Race B", value: `First to ${fairRaceB}` },
    ],
    summaryStats: [
      { label: "Handicap Balls", value: `${spotBalls}` },
      { label: "Player A Win %", value: `${(pA * 100).toFixed(1)}%` },
      { label: "Player B Win %", value: `${(pB * 100).toFixed(1)}%` },
      { label: "Race Length", value: `First to ${raceLength}` },
      { label: "Fair Race A", value: `First to ${fairRaceA}` },
      { label: "Fair Race B", value: `First to ${fairRaceB}` },
    ],
  };
}

const DEFAULTS = { skillA: "6", skillB: "3", race: "5" };

export default function BilliardsHandicapCalculator() {
  const [skillA, setSkillA] = useState(DEFAULTS.skillA);
  const [skillB, setSkillB] = useState(DEFAULTS.skillB);
  const [race, setRace] = useState(DEFAULTS.race);
  const [result, setResult] = useState<HandicapResult>(() => calcHandicap(6, 3, 5));

  const calculate = () => setResult(calcHandicap(parseFloat(skillA) || 1, parseFloat(skillB) || 1, parseInt(race) || 1));
  const reset = () => { setSkillA(DEFAULTS.skillA); setSkillB(DEFAULTS.skillB); setRace(DEFAULTS.race); setResult(calcHandicap(6, 3, 5)); };
  useEffect(() => { setResult(calcHandicap(6, 3, 5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a billiards handicap?", answer: "A handicap lets players of different skill levels compete fairly. The weaker player is spotted extra balls on the table (or given a shorter race to win), compensating for the skill gap so matches are competitive for both sides." },
    { question: "How is the handicap calculated?", answer: "This calculator converts each player's skill level (1–10) into a win probability using the squared-skill ratio, then spots the weaker player one ball per skill level of difference, capped at 7 balls — the standard ceiling in most league systems." },
    { question: "What are typical skill levels?", answer: "In the APA 8-ball system, players are rated 2–7. A recreational player is typically 2–3, an average league player 4–5, and a strong player 6–7. This calculator uses a broader 1–10 scale for finer granularity." },
    { question: "What does 'race to' mean?", answer: "A race is the number of games a player must win to take the match. In a race to 5, the first player to win 5 games wins. The calculator suggests fair race lengths for each player based on their win probabilities." },
    { question: "Why cap the handicap at 7 balls?", answer: "Most league rulebooks cap spots at 7 balls in 8-ball because larger spots make the game unrecognizable — the weaker player would have nearly the whole rack removed. Beyond that, the better solution is adjusting the race length instead." },
  ];

  const colorA = result.winProbA >= result.winProbB ? "#2563eb" : "#94a3b8";
  const colorB = result.winProbB > result.winProbA ? "#2563eb" : "#94a3b8";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Billiards Handicap Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Billiards Handicap Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Player A Skill (1–10)</label>
                <div className={inp}><input type="number" value={skillA} onChange={e => setSkillA(e.target.value)} className={ci} min={1} max={10} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Player B Skill (1–10)</label>
                <div className={inp}><input type="number" value={skillB} onChange={e => setSkillB(e.target.value)} className={ci} min={1} max={10} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Race Length (games to win)</label>
              <div className={inp}><input type="number" value={race} onChange={e => setRace(e.target.value)} className={ci} min={1} /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Handicap</div>
              <div className="text-4xl font-extrabold text-primary">{result.spotBalls > 0 ? `${result.spotBalls} ball${result.spotBalls > 1 ? "s" : ""} to ${result.weakerPlayer}` : "Even Match"}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.strongerPlayer} is stronger (skill {Math.max(parseFloat(skillA) || 1, parseFloat(skillB) || 1)} vs {Math.min(parseFloat(skillA) || 1, parseFloat(skillB) || 1)})</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["A Win %", `${(result.winProbA * 100).toFixed(1)}%`], ["B Win %", `${(result.winProbB * 100).toFixed(1)}%`], ["Race", `First to ${result.raceLength}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Match Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Win Probability</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Win Probability"]} />
                  <Bar dataKey="winProb" radius={[4, 4, 0, 0]} barSize={70}>
                    <Cell fill={colorA} />
                    <Cell fill={colorB} />
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
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Billiards Handicap?</h2>
            <p>A <strong>billiards handicap calculator</strong> levels the playing field between players of different abilities. In league play, the weaker player is given a spot — extra balls racked on their side of the table — or a shorter race, so that every match is winnable by both sides. Without handicaps, a strong player would beat a novice nearly every time, which makes casual play between friends just as uncompetitive as it sounds.</p>
            <h2 className="text-2xl font-bold mb-3">How the Numbers Work</h2>
            <p>Skill levels are converted to a win probability using the squared-skill ratio: P(A wins) = A² ÷ (A² + B²). A skill 6 player facing a skill 3 player therefore wins roughly 80% of games. The calculator then spots the weaker player one ball per full skill level of difference (capped at 7) and adjusts the race length so the match remains close.</p>
            <h2 className="text-2xl font-bold mb-3">League Conventions</h2>
            <p>The APA 8-ball system rates players 2–7, where 2 is a beginner and 7 is a near-professional. Most leagues cap the spot at 7 balls. When skill differences are extreme, adjusting the race length — giving the weaker player a shorter path to victory — is generally a fairer solution than larger spots.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/billiards-handicap-calculator" />
          <PopularCalculators exclude="/calculator/billiards-handicap-calculator" />
        </div>
      </div>
    </>
  );
}
