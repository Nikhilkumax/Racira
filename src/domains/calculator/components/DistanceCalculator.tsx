"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, LocateFixed } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DistanceResult {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dx: number;
  dy: number;
  distance: number;
  slope: number;
  midpointX: number;
  midpointY: number;
  chartData: { x: number; y: number }[];
}

function calcDistance(x1: number, y1: number, x2: number, y2: number): DistanceResult {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const slope = dx !== 0 ? dy / dx : NaN;
  return {
    x1, y1, x2, y2, dx, dy, distance, slope,
    midpointX: (x1 + x2) / 2,
    midpointY: (y1 + y2) / 2,
    chartData: [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ],
  };
}

const DEFAULTS = { x1: "1", y1: "1", x2: "4", y2: "5" };

const faqs = [
  { question: "What is the distance formula?", answer: "The distance between two points follows the Pythagorean theorem: d = √((x₂ − x₁)² + (y₂ − y₁)²). It measures the length of the straight segment connecting them." },
  { question: "What if the slope is undefined?", answer: "When x₂ = x₁ the line is vertical and slope is undefined (division by zero). The calculator reports it as undefined while distance and midpoint remain valid." },
  { question: "Does this work in 3D?", answer: "The same idea extends to three dimensions: d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²). This calculator covers the 2D case used in most plotting and geometry problems." },
];

export default function DistanceCalculator() {
  const [x1, setX1] = useState(DEFAULTS.x1);
  const [y1, setY1] = useState(DEFAULTS.y1);
  const [x2, setX2] = useState(DEFAULTS.x2);
  const [y2, setY2] = useState(DEFAULTS.y2);
  const [result, setResult] = useState<DistanceResult>(() => calcDistance(1, 1, 4, 5));

  useEffect(() => {
    const a = parseFloat(x1);
    const b = parseFloat(y1);
    const c = parseFloat(x2);
    const d = parseFloat(y2);
    if (!isNaN(a) && !isNaN(b) && !isNaN(c) && !isNaN(d)) setResult(calcDistance(a, b, c, d));
  }, []);

  const reset = () => { setX1(DEFAULTS.x1); setY1(DEFAULTS.y1); setX2(DEFAULTS.x2); setY2(DEFAULTS.y2); setResult(calcDistance(parseFloat(DEFAULTS.x1), parseFloat(DEFAULTS.y1), parseFloat(DEFAULTS.x2), parseFloat(DEFAULTS.y2))); };
  const invalid = [x1, y1, x2, y2].some(v => isNaN(parseFloat(v)));

  const breakdown = [
    { label: "Point 1", value: `(${result.x1}, ${result.y1})` },
    { label: "Point 2", value: `(${result.x2}, ${result.y2})` },
    { label: "Δx = x₂ − x₁", value: `${result.dx}` },
    { label: "Δy = y₂ − y₁", value: `${result.dy}` },
    { label: "Distance", value: `${result.distance.toFixed(4)}`, highlight: true },
    { label: "Slope (Δy ÷ Δx)", value: isNaN(result.slope) ? "Undefined (vertical)" : `${result.slope.toFixed(4)}` },
    { label: "Midpoint", value: `(${result.midpointX.toFixed(2)}, ${result.midpointY.toFixed(2)})` },
  ];

  const summaryStats = [
    { label: "Distance", value: `${result.distance.toFixed(4)}` },
    { label: "Δx", value: `${result.dx}` },
    { label: "Δy", value: `${result.dy}` },
    { label: "Slope", value: isNaN(result.slope) ? "Undefined" : `${result.slope.toFixed(4)}` },
    { label: "Midpoint X", value: `${result.midpointX.toFixed(2)}` },
    { label: "Midpoint Y", value: `${result.midpointY.toFixed(2)}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Distance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Distance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dc-x1" className="block text-sm font-medium mb-1 text-foreground">Point 1 — x</label>
                <input id="dc-x1" type="number" step="0.1" value={x1} onChange={(e) => setX1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dc-y1" className="block text-sm font-medium mb-1 text-foreground">Point 1 — y</label>
                <input id="dc-y1" type="number" step="0.1" value={y1} onChange={(e) => setY1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dc-x2" className="block text-sm font-medium mb-1 text-foreground">Point 2 — x</label>
                <input id="dc-x2" type="number" step="0.1" value={x2} onChange={(e) => setX2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dc-y2" className="block text-sm font-medium mb-1 text-foreground">Point 2 — y</label>
                <input id="dc-y2" type="number" step="0.1" value={y2} onChange={(e) => setY2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <LocateFixed className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter numeric coordinates for both points.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Distance Between Points</div>
              <div className="text-4xl font-extrabold text-primary">{result.distance.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground mt-1">({result.x1}, {result.y1}) → ({result.x2}, {result.y2})</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Δx</div>
                <div className="text-lg font-bold text-primary">{result.dx}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Δy</div>
                <div className="text-lg font-bold text-primary">{result.dy}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Slope</div>
                <div className="text-lg font-bold text-primary">{isNaN(result.slope) ? "—" : result.slope.toFixed(3)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
              <h3 className="text-base font-bold mb-3">Segment Between Points</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, n: string) => [v, n === "y" ? "y" : "x"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="linear" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Length = √(Δx² + Δy²) = {result.distance.toFixed(2)}</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Distance Calculator</h2>
            <p>The distance between two points is the hypotenuse of the right triangle formed by their horizontal and vertical differences: d = √((x₂ − x₁)² + (y₂ − y₁)²). From (1, 1) to (4, 5): Δx = 3, Δy = 4, so d = √(9 + 16) = 5.</p>
            <h3>Related Quantities</h3>
            <p>The same triangle yields the segment's slope (Δy ÷ Δx), and the midpoint ((x₁+x₂)/2, (y₁+y₂)/2) — the point that splits the segment in half. Together these describe a line segment completely: direction, length, and position.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/distance-calculator" />
          <PopularCalculators exclude="/calculator/distance-calculator" />
        </div>
      </div>
    </>
  );
}
