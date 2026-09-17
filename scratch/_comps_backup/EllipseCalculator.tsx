"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, CircleEllipsis } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface EllipseResult {
  a: number;
  b: number;
  area: number;
  perimeter: number;
  eccentricity: number;
  focalDistance: number;
  flattening: number;
  chartData: { name: string; value: number }[];
}

function calcEllipse(a: number, b: number): EllipseResult {
  const semiMajor = Math.max(a, b);
  const semiMinor = Math.min(a, b);
  const area = Math.PI * semiMajor * semiMinor;
  // Ramanujan approximation
  const h = Math.pow((semiMajor - semiMinor) / (semiMajor + semiMinor), 2);
  const perimeter = Math.PI * (semiMajor + semiMinor) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  const eccentricity = semiMajor > 0 ? Math.sqrt(1 - (semiMinor * semiMinor) / (semiMajor * semiMajor)) : 0;
  const focalDistance = semiMajor * eccentricity;
  const flattening = semiMajor > 0 ? (semiMajor - semiMinor) / semiMajor : 0;
  const chartData = [
    { name: "Semi-major (a)", value: semiMajor },
    { name: "Semi-minor (b)", value: semiMinor },
    { name: "Focal Distance (c)", value: Number(focalDistance.toFixed(3)) },
  ];
  return { a: semiMajor, b: semiMinor, area, perimeter, eccentricity, focalDistance, flattening, chartData };
}

const DEFAULTS = { a: "5", b: "3" };

const faqs = [
  { question: "What defines an ellipse?", answer: "An ellipse is the set of points whose distances to two foci sum to a constant. Its semi-major axis a and semi-minor axis b fully determine its size and shape." },
  { question: "How is the perimeter calculated?", answer: "There is no simple closed form — the true perimeter is an elliptic integral. This calculator uses the Ramanujan approximation: π(a+b)(1 + 3h/(10 + √(4 − 3h))) with h = ((a−b)/(a+b))², accurate to better than 0.04%." },
  { question: "What are eccentricity and foci?", answer: "Eccentricity e = √(1 − b²/a²) measures how stretched the ellipse is (0 = circle, near 1 = very flat). The foci sit at distance c = ae from center along the major axis." },
];

export default function EllipseCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [result, setResult] = useState<EllipseResult>(() => calcEllipse(5, 3));

  useEffect(() => {
    const va = parseFloat(a);
    const vb = parseFloat(b);
    if (!isNaN(va) && !isNaN(vb) && va > 0 && vb > 0) setResult(calcEllipse(va, vb));
  }, []);

  const reset = () => { setA(DEFAULTS.a); setB(DEFAULTS.b); setResult(calcEllipse(parseFloat(DEFAULTS.a), parseFloat(DEFAULTS.b))); };
  const invalid = isNaN(parseFloat(a)) || isNaN(parseFloat(b)) || parseFloat(a) <= 0 || parseFloat(b) <= 0;

  const breakdown = [
    { label: "Semi-major Axis (a)", value: `${result.a.toFixed(2)}` },
    { label: "Semi-minor Axis (b)", value: `${result.b.toFixed(2)}` },
    { label: "Area (πab)", value: `${result.area.toFixed(4)}`, highlight: true },
    { label: "Perimeter (Ramanujan)", value: `${result.perimeter.toFixed(4)}` },
    { label: "Eccentricity (e)", value: `${result.eccentricity.toFixed(4)}` },
    { label: "Focal Distance (c = ae)", value: `${result.focalDistance.toFixed(4)}` },
    { label: "Flattening (f)", value: `${result.flattening.toFixed(4)}` },
    { label: "Shape", value: result.eccentricity < 0.2 ? "Nearly circular" : result.eccentricity < 0.6 ? "Moderately elliptical" : "Highly elongated" },
  ];

  const summaryStats = [
    { label: "Area", value: `${result.area.toFixed(4)}` },
    { label: "Perimeter", value: `${result.perimeter.toFixed(4)}` },
    { label: "Eccentricity", value: `${result.eccentricity.toFixed(4)}` },
    { label: "Focal Distance", value: `${result.focalDistance.toFixed(4)}` },
    { label: "Semi-major", value: `${result.a.toFixed(2)}` },
    { label: "Semi-minor", value: `${result.b.toFixed(2)}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ellipse Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ellipse Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="el-a" className="block text-sm font-medium mb-1 text-foreground">Semi-major Axis (a)</label>
                <input id="el-a" type="number" min="0.01" step="0.1" value={a} onChange={(e) => setA(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="el-b" className="block text-sm font-medium mb-1 text-foreground">Semi-minor Axis (b)</label>
                <input id="el-b" type="number" min="0.01" step="0.1" value={b} onChange={(e) => setB(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <CircleEllipsis className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter positive values for both axes.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Area</div>
              <div className="text-4xl font-extrabold text-primary">{result.area.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground mt-1">a = {result.a.toFixed(2)}, b = {result.b.toFixed(2)} · perimeter ≈ {result.perimeter.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Perimeter</div>
                <div className="text-lg font-bold text-primary">{result.perimeter.toFixed(3)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Eccentricity</div>
                <div className="text-lg font-bold text-primary">{result.eccentricity.toFixed(3)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Focal Distance</div>
                <div className="text-lg font-bold text-primary">{result.focalDistance.toFixed(3)}</div>
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
              <h3 className="text-base font-bold mb-3">Axes and Focal Distance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(3)}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">About the Ellipse Calculator</h2>
            <p>The area of an ellipse is the exact product πab — a circle is just the special case a = b. The perimeter has no elementary formula; the Ramanujan approximation used here, π(a+b)(1 + 3h/(10 + √(4 − 3h))), is accurate to within 0.04% for any shape.</p>
            <h3>Ellipses in the Real World</h3>
            <p>Planet orbits are ellipses with the Sun at one focus; whispering galleries focus sound at the two foci; and the Earth itself is an oblate ellipsoid with flattening ~1/298. Eccentricity quantifies each of these — from 0 (perfect circle) toward 1 (almost a line).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ellipse-calculator" />
          <PopularCalculators exclude="/calculator/ellipse-calculator" />
        </div>
      </div>
    </>
  );
}
