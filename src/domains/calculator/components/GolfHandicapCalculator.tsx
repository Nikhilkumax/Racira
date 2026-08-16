"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Flag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ScoreRow {
  score: number;
  rating: number;
  slope: number;
  differential: number;
}

interface HandicapResult {
  rows: ScoreRow[];
  index: number;
  bestCount: number;
  used: ScoreRow[];
  chartData: { name: string; value: number }[];
}

// Score differential = (score − rating) × 113 / slope; index = avg of best 8 of last 20 × 0.96
function calcHandicap(scores: string, ratings: string, slopes: string): HandicapResult {
  const sc = scores.split(",").map((s) => parseInt(s.trim(), 10)).filter((v) => !isNaN(v));
  const rt = ratings.split(",").map((s) => parseFloat(s.trim())).filter((v) => !isNaN(v));
  const sl = slopes.split(",").map((s) => parseFloat(s.trim())).filter((v) => !isNaN(v));
  const rows: ScoreRow[] = sc.slice(0, 20).map((score, i) => {
    const rating = rt[i] ?? 72;
    const slope = sl[i] ?? 113;
    const differential = slope > 0 ? ((score - rating) * 113) / slope : 0;
    return { score, rating, slope, differential };
  });
  const sorted = [...rows].sort((a, b) => a.differential - b.differential);
  const bestCount = rows.length >= 20 ? 8 : rows.length >= 10 ? Math.min(rows.length - 2, 6) : rows.length >= 5 ? Math.min(rows.length - 1, 4) : 0;
  const used = sorted.slice(0, bestCount);
  const avg = used.length > 0 ? used.reduce((p, r) => p + r.differential, 0) / used.length : 0;
  const index = used.length > 0 ? avg * 0.96 : 0;
  const chartData = rows.slice(0, 8).map((r, i) => ({ name: `#${i + 1}`, value: Number(r.differential.toFixed(1)) }));
  return { rows, index, bestCount, used, chartData };
}

const DEFAULTS = { scores: "85, 88, 82, 90, 87, 84, 86, 83", ratings: "", slopes: "" };

const faqs = [
  { question: "What is a golf handicap index?", answer: "It measures your potential ability — roughly the average of your best rounds, not your average round. The USGA formula averages your best 8 score differentials from your last 20 rounds and multiplies by 0.96." },
  { question: "What is a score differential?", answer: "It adjusts your raw score for course difficulty: differential = (score − course rating) × 113 ÷ slope rating. Playing a 78 on a hard course (rating 74, slope 135) gives a better differential than a 75 on an easy one (rating 68, slope 110)." },
  { question: "How many rounds do I need?", answer: "A handicap index requires at least 5 rounds. With 5–9 rounds the best 1 differential counts (reduced by the formula's caps); with 10–19 the best 3–6 count; with 20+ the best 8 count. More rounds make the index more stable." },
];

export default function GolfHandicapCalculator() {
  const [scores, setScores] = useState(DEFAULTS.scores);
  const [ratings, setRatings] = useState(DEFAULTS.ratings);
  const [slopes, setSlopes] = useState(DEFAULTS.slopes);
  const [result, setResult] = useState<HandicapResult>(() => calcHandicap("85, 88, 82, 90, 87, 84, 86, 83", "", ""));

  const handleCalculate = () => {
    setResult(calcHandicap(scores, ratings, slopes));
  };

  const reset = () => {
    setScores(DEFAULTS.scores); setRatings(DEFAULTS.ratings); setSlopes(DEFAULTS.slopes);
    setResult(calcHandicap("85, 88, 82, 90, 87, 84, 86, 83", "", ""));
  };

  const breakdown = [
    { label: "Rounds Entered", value: `${result.rows.length}`, highlight: false },
    { label: "Differentials Used", value: `${result.used.length} (best ${result.bestCount})`, highlight: false },
    { label: "Average Differential", value: result.used.length > 0 ? `${(result.used.reduce((p, r) => p + r.differential, 0) / result.used.length).toFixed(2)}` : "—", highlight: false },
    { label: "Handicap Index (× 0.96)", value: `${result.index.toFixed(1)}`, highlight: true },
    { label: "Best Differential", value: result.used.length > 0 ? `${result.used[0].differential.toFixed(1)}` : "—", highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Golf Handicap Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Golf Handicap Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Flag className="w-4 h-4" /> USGA Handicap Index
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Scores (comma-separated, last 20)</label>
                <textarea value={scores} onChange={(e) => setScores(e.target.value)} className="input-calc min-h-[70px] resize-y" placeholder="85, 88, 82, 90…" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Course Ratings (optional)</label>
                <input type="text" value={ratings} onChange={(e) => setRatings(e.target.value)} className="input-calc" placeholder="Defaults to 72" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Slope Ratings (optional)</label>
                <input type="text" value={slopes} onChange={(e) => setSlopes(e.target.value)} className="input-calc" placeholder="Defaults to 113" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Flag className="w-4 h-4 text-primary" /> HANDICAP INDEX
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.index.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on the best {result.bestCount} differential{result.bestCount === 1 ? "" : "s"} from {result.rows.length} round{result.rows.length === 1 ? "" : "s"} × 0.96.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Score Differentials</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Round</th>
                      <th className="p-2.5 pr-3 text-right">Score</th>
                      <th className="p-2.5 pr-3 text-right">Diff</th>
                      <th className="p-2.5 pr-3 text-right">Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.rows.map((r, i) => (
                      <tr key={i} className={result.used.includes(r) ? "bg-primary/10 font-bold" : ""}>
                        <td className="p-2.5 pl-3 text-muted-foreground">#{i + 1}</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">{r.score}</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">{r.differential.toFixed(1)}</td>
                        <td className="p-2.5 pr-3 text-right">{result.used.includes(r) ? "✓" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Avg Score", value: result.rows.length > 0 ? `${(result.rows.reduce((p, r) => p + r.score, 0) / result.rows.length).toFixed(1)}` : "—" },
                  { label: "Course Handicap (slope 113)", value: `${Math.round(result.index)} strokes` },
                  { label: "Index Category", value: result.index < 5 ? "Scratch / low" : result.index < 13 ? "Mid" : result.index < 20 ? "High" : "Recreational" },
                  { label: "Formula", value: "Best 8 of 20 × 0.96" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Golf Handicap Calculator</h2>
            <p>A handicap index measures your scoring potential — deliberately your best, not your average. Each round becomes a differential: (score − course rating) × 113 ÷ slope rating, which normalizes for course difficulty. From your last 20 rounds, the best 8 differentials are averaged and multiplied by 0.96 to produce the index. With fewer rounds the formula uses fewer best scores — 1 best from 5–9 rounds, 3–6 from 10–19.</p>
            <h3>What the number means on the course</h3>
            <p>Your index converts to a course handicap based on the tees you play: course handicap = index × slope ÷ 113. That is the number of strokes you receive against par for a round. An index of 14.2 on a course with slope 125 means about 16 strokes. The system exists so players of different abilities can compete fairly — and it only gets accurate as you log more rounds, so keep posting every score.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/golf-handicap-calculator" />
          <PopularCalculators exclude="/calculator/golf-handicap-calculator" />
        </div>
      </div>
    </>
  );
}
