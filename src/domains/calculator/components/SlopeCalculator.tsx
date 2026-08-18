"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface SlopeInput {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface SlopeResult {
  rise: number;
  run: number;
  slope: number;
  distance: number;
  midX: number;
  midY: number;
  angleDeg: number;
  intercept: number;
  chartData: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSlope(input: SlopeInput): SlopeResult {
  const rise = input.y2 - input.y1;
  const run = input.x2 - input.x1;
  const slope = run !== 0 ? rise / run : Infinity;
  const distance = Math.sqrt(run * run + rise * rise);
  const midX = (input.x1 + input.x2) / 2;
  const midY = (input.y1 + input.y2) / 2;
  const angleDeg = run !== 0 ? (Math.atan(slope) * 180) / Math.PI : 90;
  const intercept = Number.isFinite(slope) ? input.y1 - slope * input.x1 : 0;

  const chartData = [
    { x: input.x1, y: input.y1 },
    { x: input.x2, y: input.y2 },
  ];

  const slopeLabel = Number.isFinite(slope) ? slope.toFixed(2) : "undefined (vertical)";
  const equation = Number.isFinite(slope) ? (intercept === 0 ? `y = ${slope.toFixed(2)}x` : intercept > 0 ? `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}` : `y = ${slope.toFixed(2)}x − ${Math.abs(intercept).toFixed(2)}`) : `x = ${input.x1} (vertical)`;

  const breakdown = [
    { label: "Point 1", value: `(${input.x1}, ${input.y1})` },
    { label: "Point 2", value: `(${input.x2}, ${input.y2})` },
    { label: "Rise (Δy)", value: `${rise}` },
    { label: "Run (Δx)", value: `${run}` },
    { label: "Slope (m)", value: slopeLabel },
    { label: "Line Equation", value: equation },
    { label: "Distance", value: `${distance.toFixed(2)}` },
    { label: "Midpoint", value: `(${midX.toFixed(1)}, ${midY.toFixed(1)})` },
    { label: "Angle from Horizontal", value: `${angleDeg.toFixed(1)}°` },
  ];

  const summaryStats = [
    { label: "Slope", value: slopeLabel },
    { label: "Distance", value: `${distance.toFixed(2)}` },
    { label: "Midpoint", value: `(${midX.toFixed(1)}, ${midY.toFixed(1)})` },
    { label: "Angle", value: `${angleDeg.toFixed(1)}°` },
    { label: "Rise", value: `${rise}` },
    { label: "Run", value: `${run}` },
  ];

  return { rise, run, slope, distance, midX, midY, angleDeg, intercept, chartData, breakdown, summaryStats };
}

const DEFAULTS: SlopeInput = { x1: 1, y1: 2, x2: 5, y2: 8 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SlopeCalculator() {
  const [x1, setX1] = useState(String(DEFAULTS.x1));
  const [y1, setY1] = useState(String(DEFAULTS.y1));
  const [x2, setX2] = useState(String(DEFAULTS.x2));
  const [y2, setY2] = useState(String(DEFAULTS.y2));
  const [result, setResult] = useState<SlopeResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSlope({ x1: parse(x1, DEFAULTS.x1), y1: parse(y1, DEFAULTS.y1), x2: parse(x2, DEFAULTS.x2), y2: parse(y2, DEFAULTS.y2) }));
  const reset = () => {
    setX1(String(DEFAULTS.x1));
    setY1(String(DEFAULTS.y1));
    setX2(String(DEFAULTS.x2));
    setY2(String(DEFAULTS.y2));
    setResult(calcSlope(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSlope(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is slope?", answer: "Slope measures how steep a line is: m = rise ÷ run = (y2 − y1) ÷ (x2 − x1). A positive slope rises left-to-right, negative falls, zero is horizontal, and a vertical line has undefined slope." },
    { question: "What does the slope mean in a real problem?", answer: "Slope is a rate of change: dollars per hour, miles per gallon, temperature per day. It tells you how much y changes for each unit change in x — the 'rise over run' of a real relationship." },
    { question: "How do I write the line equation?", answer: "With the slope m and one point, the intercept b = y1 − m·x1, giving y = mx + b. This calculator derives the full equation from two points automatically." },
    { question: "What if the line is vertical?", answer: "A vertical line has no slope (division by zero) — every point shares the same x. The equation is simply x = constant, and the angle from horizontal is 90°." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Slope Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Slope Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Point 1 (x1, y1)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className={inp}><input type="number" value={x1} onChange={(e) => setX1(e.target.value)} className={ci} /></div>
                <div className={inp}><input type="number" value={y1} onChange={(e) => setY1(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Point 2 (x2, y2)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className={inp}><input type="number" value={x2} onChange={(e) => setX2(e.target.value)} className={ci} /></div>
                <div className={inp}><input type="number" value={y2} onChange={(e) => setY2(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Slope (m)</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{Number.isFinite(result.slope) ? result.slope.toFixed(2) : "Undefined"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Rise {result.rise} ÷ Run {result.run} · {Number.isFinite(result.slope) ? `y = ${result.slope.toFixed(2)}x ${result.intercept >= 0 ? "+" : "−"} ${Math.abs(result.intercept).toFixed(2)}` : `vertical line x = ${x1}`}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Distance", `${result.distance.toFixed(2)}`], ["Midpoint", `(${result.midX.toFixed(1)}, ${result.midY.toFixed(1)})`], ["Angle", `${result.angleDeg.toFixed(1)}°`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Line Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Line Through the Points</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" type="number" domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} />
                      <YAxis type="number" domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number, name: string) => [v, name === "y" ? "y" : ""]} />
                      <ReferenceLine x={result.midX} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                      <Line type="linear" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                    </LineChart>
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
            <h2 className="text-2xl font-bold mb-3">Slope as Rate of Change</h2>
            <p>Slope, m = rise ÷ run, is the fundamental measure of how one quantity changes relative to another. In algebra it describes lines; in the real world it is speed, price, gradient, or a rate — the steeper the slope, the faster the change.</p>
            <h2 className="text-2xl font-bold mb-3">From Two Points to a Line</h2>
            <p>Two points define a unique line. From the slope and one point you get the intercept, b = y1 − m·x1, producing the slope-intercept form y = mx + b. Distance and midpoint come from the same two points via the distance formula and averaging coordinates.</p>
            <h2 className="text-2xl font-bold mb-3">Degrees of Steepness</h2>
            <p>The angle from horizontal, arctan(m), connects slope to trigonometry and engineering grades. A 100% grade (45°) corresponds to m = 1; a vertical line has no finite slope at all.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/slope-calculator" />
          <PopularCalculators exclude="/calculator/slope-calculator" />
        </div>
      </div>
    </>
  );
}
