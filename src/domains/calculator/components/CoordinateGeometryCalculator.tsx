"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, MoveUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface GeoResult {
  x1: number; y1: number; x2: number; y2: number;
  distance: number;
  midpointX: number;
  midpointY: number;
  slope: number | null;
  dx: number;
  dy: number;
  equation: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcGeo(x1: number, y1: number, x2: number, y2: number): GeoResult {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const midpointX = (x1 + x2) / 2;
  const midpointY = (y1 + y2) / 2;
  const slope = dx !== 0 ? dy / dx : null;
  const equation = slope === null ? `x = ${x1}` : `y = ${slope >= 0 ? "+" : "−"}${Math.abs(slope).toFixed(4)}x ${(y1 - slope * x1) >= 0 ? "+" : "−"} ${Math.abs(y1 - slope * x1).toFixed(4)}`;

  const chartData = [
    { name: "Δx", value: Math.abs(dx) },
    { name: "Δy", value: Math.abs(dy) },
    { name: "Distance", value: distance },
  ];

  const breakdown = [
    { label: "Point A", value: `(${x1}, ${y1})` },
    { label: "Point B", value: `(${x2}, ${y2})` },
    { label: "Δx (x₂ − x₁)", value: `${dx}` },
    { label: "Δy (y₂ − y₁)", value: `${dy}` },
    { label: "Distance", value: `${distance.toFixed(4)}` },
    { label: "Midpoint", value: `(${midpointX.toFixed(2)}, ${midpointY.toFixed(2)})` },
    { label: "Slope (m)", value: slope === null ? "Undefined (vertical)" : `${slope.toFixed(4)}` },
    { label: "Line Equation", value: equation },
  ];

  const summaryStats = [
    { label: "Distance", value: `${distance.toFixed(4)}` },
    { label: "Midpoint X", value: `${midpointX.toFixed(2)}` },
    { label: "Midpoint Y", value: `${midpointY.toFixed(2)}` },
    { label: "Slope", value: slope === null ? "∞" : `${slope.toFixed(4)}` },
    { label: "Δx", value: `${dx}` },
    { label: "Δy", value: `${dy}` },
  ];

  return { x1, y1, x2, y2, distance, midpointX, midpointY, slope, dx, dy, equation, chartData, breakdown, summaryStats };
}

const DEFAULTS = { x1: "0", y1: "0", x2: "3", y2: "4" };

export default function CoordinateGeometryCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<GeoResult>(() => calcGeo(0, 0, 3, 4));

  useEffect(() => {
    const v = Object.values(inputs).map(parseFloat);
    if (v.every((n) => !isNaN(n))) setResult(calcGeo(v[0], v[1], v[2], v[3]));
  }, [inputs]);

  const set = (k: keyof typeof DEFAULTS) => (val: string) => setInputs((p) => ({ ...p, [k]: val }));
  const reset = () => setInputs(DEFAULTS);
  const invalid = Object.values(inputs).some((s) => isNaN(parseFloat(s)));

  const faqs = [
    { question: "What is the distance formula?", answer: "The distance between (x₁,y₁) and (x₂,y₂) is √((x₂−x₁)² + (y₂−y₁)²), which comes from the Pythagorean theorem applied to the horizontal and vertical differences." },
    { question: "What does the slope tell you?", answer: "Slope measures steepness: rise over run. Positive slopes go up to the right, negative slopes go down, zero is horizontal, and undefined (division by zero) is a vertical line." },
    { question: "How do I find the midpoint?", answer: "The midpoint is the average of the two x-coordinates and the average of the two y-coordinates: ((x₁+x₂)/2, (y₁+y₂)/2)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Coordinate Geometry Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Coordinate Geometry Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="x1" className="block text-sm font-medium mb-1 text-foreground">x₁</label>
                <input id="x1" type="number" step="any" value={inputs.x1} onChange={(e) => set("x1")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="y1" className="block text-sm font-medium mb-1 text-foreground">y₁</label>
                <input id="y1" type="number" step="any" value={inputs.y1} onChange={(e) => set("y1")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="x2" className="block text-sm font-medium mb-1 text-foreground">x₂</label>
                <input id="x2" type="number" step="any" value={inputs.x2} onChange={(e) => set("x2")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="y2" className="block text-sm font-medium mb-1 text-foreground">y₂</label>
                <input id="y2" type="number" step="any" value={inputs.y2} onChange={(e) => set("y2")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Point A (x₁, y₁) and Point B (x₂, y₂) on a Cartesian plane.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <MoveUpRight className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid numbers for all four coordinates.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Distance Between Points</div>
              <div className="text-4xl font-extrabold text-primary">{result.distance.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground mt-1">Midpoint: ({result.midpointX.toFixed(2)}, {result.midpointY.toFixed(2)}) · Slope: {result.slope === null ? "undefined" : result.slope.toFixed(4)}</div>
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
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Slope m</div>
                <div className="text-lg font-bold text-primary">{result.slope === null ? "∞" : result.slope.toFixed(4)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Property</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Horizontal, Vertical &amp; Euclidean Distance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(4)}`, "Value"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Coordinate Geometry Calculator</h2>
            <p>Given two points on the Cartesian plane, this calculator finds the distance between them, the midpoint of the segment, and the slope of the line — the three core measurements of coordinate geometry.</p>
            <h3>Formulas Used</h3>
            <p>Distance: √((x₂−x₁)² + (y₂−y₁)²). Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2). Slope: (y₂−y₁)/(x₂−x₁). The line equation is derived in slope-intercept form y = mx + b.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/coordinate-geometry-calculator" />
          <PopularCalculators exclude="/calculator/coordinate-geometry-calculator" />
        </div>
      </div>
    </>
  );
}
