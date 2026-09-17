"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HandicapResult {
  handicap: number;
  adjustedAverage: number;
  maxHandicap: number;
  basisScore: number;
  pct: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHandicap(average: number, basisScore: number, pct: number): HandicapResult {
  const avg = Math.max(0, average);
  const basis = Math.max(0, basisScore);
  const p = Math.max(0, Math.min(100, pct));
  const diff = basis - avg;
  const raw = (diff * p) / 100;
  const handicap = Math.max(0, Math.round(raw));
  const maxHandicap = Math.max(0, Math.round((basis * p) / 100));
  const adjustedAverage = avg + handicap;

  return {
    handicap,
    adjustedAverage,
    maxHandicap,
    basisScore: basis,
    pct: p,
    chartData: [
      { name: "Scratch Average", value: avg },
      { name: "Handicap", value: handicap },
      { name: "Adjusted Avg", value: adjustedAverage },
    ],
    breakdown: [
      { label: "Scratch Average", value: `${avg}` },
      { label: "Basis Score (Target)", value: `${basis}` },
      { label: "Handicap Percentage", value: `${p}%` },
      { label: "Gap to Basis", value: `${basis - avg}` },
      { label: "Handicap", value: `+${handicap} pins/game` },
      { label: "Maximum Possible Handicap", value: `+${maxHandicap}` },
      { label: "Adjusted Average", value: `${adjustedAverage}` },
    ],
    summaryStats: [
      { label: "Handicap", value: `+${handicap}` },
      { label: "Adjusted Average", value: `${adjustedAverage}` },
      { label: "Basis Score", value: `${basis}` },
      { label: "Percentage", value: `${p}%` },
      { label: "Max Handicap", value: `+${maxHandicap}` },
      { label: "Gap to Basis", value: `${basis - avg}` },
    ],
  };
}

const DEFAULTS = { average: "160", basis: "220", pct: "90" };

export default function BowlingHandicapCalculator() {
  const [average, setAverage] = useState(DEFAULTS.average);
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [pct, setPct] = useState(DEFAULTS.pct);
  const [result, setResult] = useState<HandicapResult>(() => calcHandicap(160, 220, 90));

  const calculate = () => setResult(calcHandicap(parseFloat(average) || 0, parseFloat(basis) || 0, parseFloat(pct) || 0));
  const reset = () => { setAverage(DEFAULTS.average); setBasis(DEFAULTS.basis); setPct(DEFAULTS.pct); setResult(calcHandicap(160, 220, 90)); };
  useEffect(() => { setResult(calcHandicap(160, 220, 90)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a bowling handicap?", answer: "A handicap lets bowlers of different averages compete fairly. The weaker bowlers receive bonus pins per game, calculated from the gap between their average and a league basis score, so a low-average bowler can compete against a high-average one." },
    { question: "What is the USBC handicap formula?", answer: "Handicap = (Basis Score − Player Average) × Percentage ÷ 100, rounded to the nearest whole pin. Most leagues use a basis score around 200–230 and a percentage of 80–100%. The result is never negative — a player above the basis scores a zero handicap." },
    { question: "What is a basis score?", answer: "The basis score is the target the league uses to equalize play — typically 200, 210, or 220. It is usually set slightly above the highest average in the league so that every player gets some handicap, and nobody gets a negative one." },
    { question: "How is my adjusted average used?", answer: "Your adjusted average (scratch average + handicap) is what the league uses for standings and rankings. In league play you may also be capped by a maximum handicap, so check your league rules." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Bowling Handicap Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Bowling Handicap Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Scratch Average</label>
              <div className={inp}><input type="number" value={average} onChange={e => setAverage(e.target.value)} className={ci} min={0} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Basis Score</label>
                <div className={inp}><input type="number" value={basis} onChange={e => setBasis(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Handicap %</label>
                <div className={inp}><input type="number" value={pct} onChange={e => setPct(e.target.value)} className={ci} min={0} max={100} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
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
              <div className="text-4xl font-extrabold text-primary">+{result.handicap} <span className="text-2xl">pins/game</span></div>
              <div className="text-sm text-muted-foreground mt-1">Adjusted average: {result.adjustedAverage} ({average} + {result.handicap})</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Scratch Avg", `${average}`], ["Adjusted Avg", `${result.adjustedAverage}`], ["Max Handicap", `+${result.maxHandicap}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Handicap Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Score Progression</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${v}`, "Pins"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 1 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Bowling Handicap?</h2>
            <p>A <strong>bowling handicap calculator</strong> computes the bonus pins that level a league between bowlers of different skill. The USBC-approved formula takes your average, subtracts it from the league's basis score, and multiplies the gap by the league's handicap percentage. The result is added to every game you bowl, so a 150-average bowler gets a fair chance against a 190-average bowler.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>Handicap = (Basis Score − Average) × Percentage ÷ 100, rounded to the nearest pin. With a 220 basis and 90%, a 160-average bowler receives (220 − 160) × 0.9 = 54 pins per game. Handicaps are never negative — anyone averaging at or above the basis simply bowls scratch (zero handicap).</p>
            <h2 className="text-2xl font-bold mb-3">League Conventions</h2>
            <p>Most leagues set the basis score between 200 and 230 and the percentage between 80% and 100%. Some leagues cap the maximum handicap to prevent sandbagging. Check your league's rulebook and use those exact numbers here to predict your adjusted average for standings.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bowling-handicap-calculator" />
          <PopularCalculators exclude="/calculator/bowling-handicap-calculator" />
        </div>
      </div>
    </>
  );
}
