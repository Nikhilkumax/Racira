"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Dices } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RollResult {
  rolls: number[];
  sum: number;
  average: number;
  expected: number;
  min: number;
  max: number;
  spread: number;
  chartData: { name: string; value: number }[];
}

function rollDice(count: number, sides: number): RollResult {
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const sum = rolls.reduce((a, b) => a + b, 0);
  const min = Math.min(...rolls);
  const max = Math.max(...rolls);
  const expected = (count * (sides + 1)) / 2;
  const chartData = rolls.map((v, i) => ({ name: `Die ${i + 1}`, value: v }));
  return { rolls, sum, average: sum / count, expected, min, max, spread: max - min, chartData };
}

const DEFAULTS = { count: "2", sides: "6" };

const faqs = [
  { question: "How does the random roll work?", answer: "Each die draws a uniform integer from 1 to the number of sides using the browser's built-in random number generator. Every roll is independent and equally likely for each face." },
  { question: "What is the expected sum?", answer: "The average face of a fair d-sided die is (s + 1) ÷ 2, so n dice average n × (s + 1) ÷ 2. A pair of d6s averages 7; three d6s average 10.5. Individual rolls scatter around this." },
  { question: "Which dice are standard?", answer: "Polyhedral dice: d4, d6, d8, d10, d12, and d20, plus percentile d100 (two d10s). This calculator supports any positive side count." },
];

export default function DiceRoller() {
  const [count, setCount] = useState(DEFAULTS.count);
  const [sides, setSides] = useState(DEFAULTS.sides);
  const [result, setResult] = useState<RollResult>(() => rollDice(2, 6));

  const n = parseInt(count, 10) || 0;
  const s = parseInt(sides, 10) || 0;
  const invalid = n < 1 || n > 20 || s < 2 || s > 100;

  const doRoll = () => {
    if (!invalid) setResult(rollDice(n, s));
  };

  const reset = () => { setCount(DEFAULTS.count); setSides(DEFAULTS.sides); };

  const breakdown = result ? [
    { label: "Individual Rolls", value: result.rolls.join(", ") },
    { label: "Total", value: `${result.sum}`, highlight: true },
    { label: "Average per Die", value: `${result.average.toFixed(2)}` },
    { label: "Expected Average", value: `${result.expected.toFixed(2)}` },
    { label: "Highest Roll", value: `${result.max}` },
    { label: "Lowest Roll", value: `${result.min}` },
    { label: "Spread (max − min)", value: `${result.spread}` },
  ] : [];

  const summaryStats = result ? [
    { label: "Total", value: `${result.sum}` },
    { label: "Average per Die", value: `${result.average.toFixed(2)}` },
    { label: "Expected", value: `${result.expected.toFixed(2)}` },
    { label: "Highest", value: `${result.max}` },
    { label: "Lowest", value: `${result.min}` },
    { label: "Dice", value: `${result.rolls.length} × d${s}` },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dice Roller" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dice Roller</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dr-count" className="block text-sm font-medium mb-1 text-foreground">Number of Dice</label>
                <input id="dr-count" type="number" min="1" max="20" step="1" value={count} onChange={(e) => setCount(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dr-sides" className="block text-sm font-medium mb-1 text-foreground">Sides per Die</label>
                <input id="dr-sides" type="number" min="2" max="100" step="1" value={sides} onChange={(e) => setSides(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} onClick={doRoll} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Dices className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Use 1–20 dice with 2–100 sides.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Roll</div>
                  <div className="text-4xl font-extrabold text-primary">{result.sum}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.rolls.length} × d{s} · rolls: {result.rolls.join(", ")}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Average / Die</div>
                    <div className="text-lg font-bold text-primary">{result.average.toFixed(2)}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Expected</div>
                    <div className="text-lg font-bold text-primary">{result.expected.toFixed(2)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Spread</div>
                    <div className="text-lg font-bold text-primary">{result.spread}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
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
                  <h3 className="text-base font-bold mb-3">Each Die's Result</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, s]} />
                      <Tooltip formatter={(v: number) => [`${v}`, "Roll"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {summaryStats.map((s2) => (
                      <div key={s2.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s2.label}</span>
                        <span className="font-semibold">{s2.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">About the Dice Roller</h2>
            <p>Each roll samples a uniform distribution over the die's faces — every outcome from 1 to s is equally likely. The sum of n dice follows a bell-like triangular distribution centered on the expected value n × (s + 1) ÷ 2, which is why totals near the middle are far more common than extremes.</p>
            <h3>Fairness Notes</h3>
            <p>This roller uses the browser's pseudo-random generator: fine for games and sampling, not for cryptography. For security-sensitive randomness (draws, lotteries), use a dedicated cryptographically secure generator instead.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dice-roller" />
          <PopularCalculators exclude="/calculator/dice-roller" />
        </div>
      </div>
    </>
  );
}
