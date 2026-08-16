"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Orbit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const G = 6.6743e-11;

interface GravityResult {
  m1: number;
  m2: number;
  r: number;
  forceN: number;
  forceFmt: string;
  comparison: string;
  chartData: { name: string; value: number }[];
}

function fmtForce(f: number): string {
  if (f >= 1e6) return `${(f / 1e6).toFixed(3)} × 10⁶ N`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(3)} kN`;
  if (f >= 1) return `${f.toFixed(3)} N`;
  if (f >= 1e-3) return `${(f * 1e3).toFixed(3)} mN`;
  if (f >= 1e-6) return `${(f * 1e6).toFixed(3)} µN`;
  if (f >= 1e-9) return `${(f * 1e9).toFixed(3)} nN`;
  return `${f.toExponential(2)} N`;
}

function calcGravity(m1: number, m2: number, r: number): GravityResult {
  const forceN = r > 0 ? (G * m1 * m2) / (r * r) : 0;
  let comparison: string;
  const f = forceN;
  if (f >= 1e6) comparison = "a colossal force — comparable to rocket thrust or earthquakes.";
  else if (f >= 1) comparison = "an everyday-scale force — like the weight of common objects.";
  else if (f >= 1e-3) comparison = "a small but measurable force — a few grams of weight.";
  else if (f >= 1e-9) comparison = "tiny — measurable only with precision lab instruments.";
  else comparison = "negligible at this scale — gravity is the weakest fundamental force.";
  const chartData = [
    { name: "Gravitational", value: Number(f.toPrecision(3)) },
    { name: "Weight of m₁", value: Number((m1 * 9.81).toPrecision(3)) },
    { name: "Weight of m₂", value: Number((m2 * 9.81).toPrecision(3)) },
  ];
  return { m1, m2, r, forceN, forceFmt: fmtForce(f), comparison, chartData };
}

const DEFAULTS = { m1: "70", m2: "70", r: "1" };

const faqs = [
  { question: "What is Newton's law of universal gravitation?", answer: "Every mass attracts every other mass with F = G·m₁·m₂/r², where G = 6.674×10⁻¹¹ N·m²/kg². The force grows with mass and falls off with the square of the distance." },
  { question: "Why is gravity so weak between everyday objects?", answer: "G is minuscule — 6.674×10⁻¹¹ — so two 70 kg people a meter apart attract each other with only 0.33 µN, about the weight of a grain of dust. Only planet-scale masses make gravity dominant." },
  { question: "Why does the force drop with the square of distance?", answer: "Gravity spreads over the surface of a sphere: doubling the distance quadruples the surface area, so the force per unit area drops to a quarter. This inverse-square behavior is shared by light and sound." },
];

export default function GravitationalForceCalculator() {
  const [m1, setM1] = useState(DEFAULTS.m1);
  const [m2, setM2] = useState(DEFAULTS.m2);
  const [r, setR] = useState(DEFAULTS.r);
  const [result, setResult] = useState<GravityResult>(() => calcGravity(70, 70, 1));

  const handleCalculate = () => {
    const a = parseFloat(m1);
    const b = parseFloat(m2);
    const d = parseFloat(r);
    if (isNaN(a) || isNaN(b) || isNaN(d) || a <= 0 || b <= 0 || d <= 0) return;
    setResult(calcGravity(a, b, d));
  };

  const reset = () => {
    setM1(DEFAULTS.m1); setM2(DEFAULTS.m2); setR(DEFAULTS.r);
    setResult(calcGravity(70, 70, 1));
  };

  const breakdown = [
    { label: "Mass 1", value: `${result.m1.toLocaleString()} kg`, highlight: false },
    { label: "Mass 2", value: `${result.m2.toLocaleString()} kg`, highlight: false },
    { label: "Separation", value: `${result.r.toLocaleString()} m`, highlight: false },
    { label: "Gravitational Constant (G)", value: "6.6743 × 10⁻¹¹ N·m²/kg²", highlight: false },
    { label: "Force of Attraction", value: result.forceFmt, highlight: true },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gravitational Force Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gravitational Force Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Orbit className="w-4 h-4" /> F = G·m₁·m₂ / r²
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Mass 1 (kg)</label>
                <input type="number" value={m1} onChange={(e) => setM1(e.target.value)} className="input-calc" placeholder="70" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Mass 2 (kg)</label>
                <input type="number" value={m2} onChange={(e) => setM2(e.target.value)} className="input-calc" placeholder="70" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Distance Between Centers (m)</label>
                <input type="number" value={r} onChange={(e) => setR(e.target.value)} className="input-calc" placeholder="1" min={0} />
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
                <Orbit className="w-4 h-4 text-primary" /> FORCE OF ATTRACTION
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.forceFmt}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.comparison}</p>
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
              <h3 className="text-base font-bold mb-3">Force Comparison (N)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} scale="log" domain={["auto", "auto"]} />
                  <Tooltip formatter={(v: number) => [v.toExponential(2) + " N", ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Weight of m₁ on Earth", value: `${(result.m1 * 9.81).toPrecision(3)} N` },
                  { label: "Weight of m₂ on Earth", value: `${(result.m2 * 9.81).toPrecision(3)} N` },
                  { label: "Earth–Moon Force", value: "≈ 1.98 × 10²⁰ N" },
                  { label: "Sun–Earth Force", value: "≈ 3.54 × 10²² N" },
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
            <h2 className="text-2xl font-bold mb-3">About the Gravitational Force Calculator</h2>
            <p>Newton's law of universal gravitation states that every mass attracts every other mass with a force proportional to the product of their masses and inversely proportional to the square of the distance between their centers: F = G·m₁·m₂/r². The constant G — 6.674×10⁻¹¹ N·m²/kg² — is one of the most precisely measured numbers in physics, yet it is so small that gravity only becomes noticeable at planetary scales.</p>
            <h3>Why gravity feels weak</h3>
            <p>Two 70 kg people standing a meter apart feel only 0.33 µN of mutual attraction — less than the weight of a mosquito. The same force formula, however, holds the Moon in orbit (about 2×10²⁰ N) and keeps the Earth circling the Sun (3.5×10²² N). The inverse-square law explains both: quadruple the distance and the force drops to a quarter, which is why the planets so far from the Sun move so slowly in their orbits.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gravitational-force-calculator" />
          <PopularCalculators exclude="/calculator/gravitational-force-calculator" />
        </div>
      </div>
    </>
  );
}
