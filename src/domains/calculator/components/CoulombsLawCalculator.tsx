"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CoulombResult {
  q1C: number;
  q2C: number;
  distance: number;
  force: number;
  forceLabel: string;
  attract: boolean;
  chartData: { r: number; force: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const K = 8.9875517923e9;

function calcCoulomb(q1uC: number, q2uC: number, rM: number): CoulombResult {
  const q1C = q1uC * 1e-6;
  const q2C = q2uC * 1e-6;
  const r = Math.max(0.001, rM);
  const force = Math.abs(K * q1C * q2C / (r * r));
  const attract = q1uC * q2uC < 0;

  const chartData: { r: number; force: number }[] = [];
  for (let d = 0.01; d <= Math.max(0.5, r * 2); d += Math.max(0.005, r * 2 / 40)) {
    chartData.push({ r: d, force: K * Math.abs(q1C * q2C) / (d * d) });
  }

  const breakdown = [
    { label: "Charge q₁", value: `${q1uC} µC (${q1C.toExponential(3)} C)` },
    { label: "Charge q₂", value: `${q2uC} µC (${q2C.toExponential(3)} C)` },
    { label: "Separation", value: `${r} m` },
    { label: "Coulomb Constant k", value: "8.988 × 10⁹ N·m²/C²" },
    { label: "Force", value: `${force.toExponential(3)} N` },
    { label: "Force (μN)", value: `${(force * 1e6).toExponential(3)} µN` },
    { label: "Interaction", value: attract ? "Attractive (opposite signs)" : "Repulsive (same signs)" },
    { label: "Comparable Weight", value: `${(force / 9.81).toExponential(2)} kg` },
  ];

  const summaryStats = [
    { label: "Force", value: `${force.toExponential(3)} N` },
    { label: "In μN", value: `${(force * 1e6).toExponential(3)}` },
    { label: "Interaction", value: attract ? "Attract" : "Repel" },
    { label: "q₁ × q₂", value: `${(q1C * q2C).toExponential(3)} C²` },
    { label: "1/r² Factor", value: `${(1 / (r * r)).toExponential(3)} /m²` },
    { label: "Equivalent Mass", value: `${(force / 9.81).toExponential(2)} kg` },
  ];

  return { q1C, q2C, distance: r, force, forceLabel: `${force.toExponential(3)} N`, attract, chartData, breakdown, summaryStats };
}

const DEFAULTS = { q1: "2", q2: "-3", r: "0.1" };

export default function CoulombsLawCalculator() {
  const [q1, setQ1] = useState(DEFAULTS.q1);
  const [q2, setQ2] = useState(DEFAULTS.q2);
  const [r, setR] = useState(DEFAULTS.r);
  const [result, setResult] = useState<CoulombResult>(() => calcCoulomb(2, -3, 0.1));

  useEffect(() => {
    const a = parseFloat(q1);
    const b = parseFloat(q2);
    const d = parseFloat(r);
    if (!isNaN(a) && !isNaN(b) && !isNaN(d) && d > 0) setResult(calcCoulomb(a, b, d));
  }, []);

  const reset = () => { setQ1(DEFAULTS.q1); setQ2(DEFAULTS.q2); setR(DEFAULTS.r); setResult(calcCoulomb(parseFloat(DEFAULTS.q1), parseFloat(DEFAULTS.q2), parseFloat(DEFAULTS.r))); };
  const invalid = isNaN(parseFloat(q1)) || isNaN(parseFloat(q2)) || isNaN(parseFloat(r)) || parseFloat(r) <= 0;

  const faqs = [
    { question: "What is Coulomb's law?", answer: "It states that the electrostatic force between two point charges is proportional to the product of the charges and inversely proportional to the square of the distance between them: F = k·q₁·q₂/r²." },
    { question: "Why is the force proportional to 1/r²?", answer: "Like gravity, the electrostatic field spreads over the surface of an expanding sphere, so the intensity falls off with the square of the distance. Doubling the distance quarters the force." },
    { question: "When do charges attract vs repel?", answer: "Opposite signs attract and like signs repel. The direction of the force is along the line joining the two charges — attractive forces pull them together, repulsive forces push them apart." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Coulomb's Law Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Coulomb&apos;s Law Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="q1" className="block text-sm font-medium mb-1 text-foreground">Charge q₁ (µC)</label>
                <input id="q1" type="number" step="any" value={q1} onChange={(e) => setQ1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="q2" className="block text-sm font-medium mb-1 text-foreground">Charge q₂ (µC)</label>
                <input id="q2" type="number" step="any" value={q2} onChange={(e) => setQ2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="dist" className="block text-sm font-medium mb-1 text-foreground">Separation (m)</label>
              <input id="dist" type="number" min="0.001" step="any" value={r} onChange={(e) => setR(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1.5">Use negative charge for electrons-like (−) and positive for protons-like (+). Opposite signs attract.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid charges and a positive distance.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Electrostatic Force (F)</div>
              <div className="text-4xl font-extrabold text-primary">{result.force.toExponential(3)} N</div>
              <div className="text-sm text-muted-foreground mt-1">{result.attract ? "Attractive" : "Repulsive"} force · {result.q1C.toExponential(2)} C × {result.q2C.toExponential(2)} C at {result.distance} m</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Force (μN)</div>
                <div className="text-lg font-bold text-primary">{(result.force * 1e6).toExponential(3)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Interaction</div>
                <div className="text-lg font-bold text-primary">{result.attract ? "Attract" : "Repel"}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Eq. Mass</div>
                <div className="text-lg font-bold text-primary">{(result.force / 9.81).toExponential(2)} kg</div>
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
              <h3 className="text-base font-bold mb-3">Force vs Distance (1/r² falloff)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="r" tick={{ fontSize: 11 }} name="distance (m)" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toExponential(3)} N`, "Force"]} labelFormatter={(l: number) => `r = ${l.toFixed(3)} m`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="force" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
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
            <h2 className="text-2xl font-bold mb-3">About Coulomb&apos;s Law Calculator</h2>
            <p>Coulomb&apos;s law gives the electrostatic force between two point charges: F = k·|q₁·q₂|/r², with k = 8.988 × 10⁹ N·m²/C². Charges are entered in microcoulombs (µC) — 1 µC = 10⁻⁶ C — and converted internally.</p>
            <h3>The Inverse-Square Nature</h3>
            <p>Because the electric field spreads over an expanding sphere, the force falls off with the square of the distance. This is the same geometric behavior that governs gravity, and it is why electrostatic forces dominate at atomic scales but fade quickly at macroscopic distances.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/coulombs-law-calculator" />
          <PopularCalculators exclude="/calculator/coulombs-law-calculator" />
        </div>
      </div>
    </>
  );
}
