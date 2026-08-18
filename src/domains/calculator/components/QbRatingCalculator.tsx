"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface QbInput {
  attempts: number;
  completions: number;
  yards: number;
  touchdowns: number;
  interceptions: number;
}

interface QbResult {
  nflRating: number;
  ncaaEfficiency: number;
  completionPct: number;
  yardsPerAttempt: number;
  components: { name: string; value: number }[];
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function calcQb(input: QbInput): QbResult {
  const att = Math.max(1, input.attempts);
  const completionPct = (input.completions / att) * 100;
  const yardsPerAttempt = input.yards / att;

  // NFL passer rating
  const a = clamp((input.completions / att - 0.3) * 5, 0, 2.375);
  const b = clamp((input.yards / att - 3) * 0.25, 0, 2.375);
  const c = clamp((input.touchdowns / att) * 20, 0, 2.375);
  const d = clamp(2.375 - (input.interceptions / att) * 25, 0, 2.375);
  const nflRating = ((a + b + c + d) / 6) * 100;

  // NCAA passer efficiency
  const ncaaEfficiency = (8.4 * input.yards + 330 * input.touchdowns + 100 * input.completions - 200 * input.interceptions) / att;

  const components = [
    { name: "Completion % (a)", value: a },
    { name: "Yards/Att (b)", value: b },
    { name: "TD Rate (c)", value: c },
    { name: "INT Rate (d)", value: d },
  ];

  const chartData = components.map((comp) => ({
    name: comp.name,
    value: Number(comp.value.toFixed(2)),
    fill: comp.value >= 2.0 ? "#10b981" : comp.value >= 1.0 ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const breakdown = [
    { label: "Pass Attempts", value: `${att}` },
    { label: "Completions", value: `${input.completions}` },
    { label: "Passing Yards", value: `${input.yards.toLocaleString()}` },
    { label: "Touchdowns", value: `${input.touchdowns}` },
    { label: "Interceptions", value: `${input.interceptions}` },
    { label: "Completion %", value: `${completionPct.toFixed(1)}%` },
    { label: "Yards per Attempt", value: `${yardsPerAttempt.toFixed(2)}` },
    { label: "NFL Passer Rating", value: nflRating.toFixed(1) },
    { label: "NCAA Efficiency", value: ncaaEfficiency.toFixed(1) },
  ];

  const summaryStats = [
    { label: "NFL Passer Rating", value: nflRating.toFixed(1) },
    { label: "NCAA Efficiency", value: ncaaEfficiency.toFixed(1) },
    { label: "Completion %", value: `${completionPct.toFixed(1)}%` },
    { label: "Yards per Attempt", value: `${yardsPerAttempt.toFixed(2)}` },
    { label: "TD Rate", value: `${((input.touchdowns / att) * 100).toFixed(1)}%` },
    { label: "INT Rate", value: `${((input.interceptions / att) * 100).toFixed(1)}%` },
  ];

  return { nflRating, ncaaEfficiency, completionPct, yardsPerAttempt, components, chartData, breakdown, summaryStats };
}

const DEFAULTS: QbInput = { attempts: 300, completions: 190, yards: 2400, touchdowns: 20, interceptions: 8 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function QbRatingCalculator() {
  const [attempts, setAttempts] = useState(String(DEFAULTS.attempts));
  const [completions, setCompletions] = useState(String(DEFAULTS.completions));
  const [yards, setYards] = useState(String(DEFAULTS.yards));
  const [tds, setTds] = useState(String(DEFAULTS.touchdowns));
  const [ints, setInts] = useState(String(DEFAULTS.interceptions));
  const [result, setResult] = useState<QbResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcQb({ attempts: parse(attempts, DEFAULTS.attempts), completions: parse(completions, DEFAULTS.completions), yards: parse(yards, DEFAULTS.yards), touchdowns: parse(tds, DEFAULTS.touchdowns), interceptions: parse(ints, DEFAULTS.interceptions) }));
  const reset = () => {
    setAttempts(String(DEFAULTS.attempts));
    setCompletions(String(DEFAULTS.completions));
    setYards(String(DEFAULTS.yards));
    setTds(String(DEFAULTS.touchdowns));
    setInts(String(DEFAULTS.interceptions));
    setResult(calcQb(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcQb(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How is NFL passer rating calculated?", answer: "Four components are computed from per-attempt rates and clamped to 0–2.375: completion % (a), yards/att (b), TD rate (c), and INT rate (d). Rating = (a + b + c + d) ÷ 6 × 100. Perfect is 158.3; average is roughly 90–95." },
    { question: "What is the NCAA efficiency formula?", answer: "NCAA uses (8.4 × yards + 330 × TDs + 100 × completions − 200 × INTs) ÷ attempts. It is not clamped, so extreme performances can exceed 200. The two ratings are not directly comparable." },
    { question: "What is a good NFL rating?", answer: "Roughly: below 70 is poor, 70–85 below average, 85–100 average-to-good, 100–110 is very good, and above 110 is elite. Modern league-average ratings sit in the high 80s to low 90s." },
    { question: "Why is the max 158.3?", answer: "Each component caps at 2.375, so the maximum is (4 × 2.375 ÷ 6) × 100 = 158.3. A 158.3 game requires elite completion, yardage, TD, and interception rates simultaneously — it is extremely rare." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Quarterback Rating Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Quarterback Rating Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Pass Attempts</label>
                <div className={inp}><input type="number" value={attempts} onChange={(e) => setAttempts(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Completions</label>
                <div className={inp}><input type="number" value={completions} onChange={(e) => setCompletions(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Passing Yards</label>
                <div className={inp}><input type="number" value={yards} onChange={(e) => setYards(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Touchdowns</label>
                <div className={inp}><input type="number" value={tds} onChange={(e) => setTds(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Interceptions</label>
                <div className={inp}><input type="number" value={ints} onChange={(e) => setInts(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">NFL Passer Rating</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.nflRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">NCAA efficiency {result.ncaaEfficiency.toFixed(1)} · {result.completionPct.toFixed(1)}% completions</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["NCAA Efficiency", `${result.ncaaEfficiency.toFixed(1)}`], ["Completion %", `${result.completionPct.toFixed(1)}%`], ["Yards/Attempt", `${result.yardsPerAttempt.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Stat Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Rating Components (max 2.375)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 2.5]} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(2)}`, ""]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">How the NFL Passer Rating Works</h2>
            <p>The NFL passer rating combines four per-attempt rates — completion percentage, yards per attempt, touchdown rate, and interception rate — each normalized into a 0–2.375 band. The average of the four components, scaled by 100, gives a rating from 0 to a theoretical maximum of 158.3.</p>
            <h2 className="text-2xl font-bold mb-3">NFL vs NCAA Formulas</h2>
            <p>The NCAA efficiency formula — (8.4 × yards + 330 × TDs + 100 × completions − 200 × INTs) ÷ attempts — is unbounded and weights volume-heavy production differently. Elite NCAA seasons can exceed 200, while NFL ratings cap at 158.3. Never compare the two directly.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Number</h2>
            <p>A rating in the 90s is a solid starting quarterback; 100–110 indicates a Pro Bowl-caliber season; above 110 is historically elite. Single-game ratings are noisy — volume matters, so evaluate over a full season.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/qb-rating-calculator" />
          <PopularCalculators exclude="/calculator/qb-rating-calculator" />
        </div>
      </div>
    </>
  );
}
