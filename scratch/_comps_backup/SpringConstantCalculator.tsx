"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SpringInput {
  force: number; // N
  displacement: number; // m
  mass: number; // kg (for oscillation frequency)
  hasMass: boolean;
}

interface SpringResult {
  k: number; // N/m
  energy: number; // J
  frequency: number | null; // Hz
  chartData: { name: string; force: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSpring(input: SpringInput): SpringResult {
  const { force, displacement, mass, hasMass } = input;
  const k = displacement > 0 ? force / displacement : 0;
  const energy = 0.5 * k * displacement * displacement;
  const frequency = hasMass && mass > 0 && k > 0 ? (1 / (2 * Math.PI)) * Math.sqrt(k / mass) : null;

  // Hooke's law is linear: force = k·x, show it at x/2, x, 3x/2, 2x
  const factors = [0.5, 1, 1.5, 2];
  const chartData = factors.map((f, i) => ({
    name: `${f}×x`,
    force: k * displacement * f,
    fill: i === factors.length - 1 ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Applied Force", value: `${force.toFixed(2)} N` },
    { label: "Displacement", value: `${displacement.toFixed(3)} m` },
    { label: "Spring Constant (k = F ÷ x)", value: `${k.toFixed(2)} N/m` },
    { label: "Elastic Potential Energy (½kx²)", value: `${energy.toFixed(2)} J` },
    ...(hasMass ? [{ label: "Mass on Spring", value: `${mass.toFixed(2)} kg` }] : []),
    ...(frequency !== null ? [{ label: "Oscillation Frequency (f)", value: `${frequency.toFixed(3)} Hz` }] : []),
  ];

  const summaryStats = [
    { label: "Spring Constant (k)", value: `${k.toFixed(2)} N/m` },
    { label: "Elastic Energy", value: `${energy.toFixed(2)} J` },
    { label: "Stiffness Rating", value: k >= 500 ? "Very stiff" : k >= 100 ? "Stiff" : k >= 20 ? "Moderate" : "Soft" },
    ...(frequency !== null ? [{ label: "Frequency", value: `${frequency.toFixed(3)} Hz` }] : []),
    { label: "Formula", value: "F = −k·x (Hooke's law)" },
    { label: "Force at 2× Displacement", value: `${(k * displacement * 2).toFixed(2)} N` },
  ];

  return { k, energy, frequency, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SpringConstantCalculator() {
  const [force, setForce] = useState("50");
  const [displacement, setDisplacement] = useState("0.2");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hasMass, setHasMass] = useState(false);
  const [mass, setMass] = useState("2");
  const [result, setResult] = useState<SpringResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcSpring({
        force: parse(force, 50),
        displacement: Math.max(0.001, parse(displacement, 0.2, 0.001)),
        mass: parse(mass, 2),
        hasMass,
      })
    );
  const reset = () => {
    setForce("50");
    setDisplacement("0.2");
    setHasMass(false);
    setMass("2");
    setResult(calcSpring({ force: 50, displacement: 0.2, mass: 2, hasMass: false }));
  };
  useEffect(() => {
    setResult(calcSpring({ force: 50, displacement: 0.2, mass: 2, hasMass: false }));
  }, []);

  const faqs = [
    { question: "What is Hooke's law?", answer: "Hooke's law states that the force needed to stretch or compress a spring is proportional to its displacement: F = −k·x. The constant k measures the spring's stiffness in newtons per meter — the force required to stretch it one meter." },
    { question: "What does the spring constant mean physically?", answer: "A higher k means a stiffer spring: it takes more force to produce the same stretch. A car suspension spring might have k ≈ 30,000 N/m, while a retractable pen spring is around 200 N/m and a slinky only a few N/m." },
    { question: "How is elastic energy stored?", answer: "Stretching a spring stores energy as elastic potential energy: E = ½kx². The energy grows with the square of the displacement, which is why over-stretching a spring can release surprisingly large amounts of energy." },
    { question: "What is the oscillation frequency?", answer: "A mass bouncing on a spring oscillates at f = (1/2π)·√(k/m). Heavier masses oscillate slower, stiffer springs faster. This is the physics of everything from car suspension to tuning forks and mechanical watch escapements." },
    { question: "What are typical spring constant values?", answer: "Slingshot rubber: ~100 N/m. Mattress box spring: ~2,000 N/m. Car suspension: ~30,000–60,000 N/m. Bridge support cables act as springs with k in the millions of N/m." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Spring Constant Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Spring Constant Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Applied Force (N)</label>
                <div className={inp}><input type="number" value={force} onChange={(e) => setForce(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Displacement (m)</label>
                <div className={inp}><input type="number" value={displacement} onChange={(e) => setDisplacement(e.target.value)} className={ci} min={0} step={0.01} /></div>
              </div>
            </div>

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-sm text-primary font-medium text-left self-start"
            >
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Oscillation Settings</div>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={hasMass} onChange={(e) => setHasMass(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
                  Calculate oscillation frequency with mass
                </label>
                {hasMass && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Mass on Spring (kg)</label>
                    <div className={inp}><input type="number" value={mass} onChange={(e) => setMass(e.target.value)} className={ci} min={0.001} step={0.1} /></div>
                  </div>
                )}
              </div>
            )}

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Spring Constant (k)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.k.toFixed(2)} <span className="text-2xl text-muted-foreground">N/m</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Elastic energy stored: {result.energy.toFixed(2)} J{result.frequency !== null ? ` · frequency: ${result.frequency.toFixed(3)} Hz` : ""}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["k", `${result.k.toFixed(1)} N/m`], ["Energy", `${result.energy.toFixed(1)} J`], ["Stiffness", result.k >= 500 ? "Very stiff" : result.k >= 100 ? "Stiff" : result.k >= 20 ? "Moderate" : "Soft"]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Hooke's Law Linearity (F = k·x)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(1) + " N", "Force"]} />
                      <Bar dataKey="force" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Doubling the displacement doubles the required force — perfectly linear, until the spring exceeds its elastic limit.</p>
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
            <h2 className="text-2xl font-bold mb-3">Hooke's Law and the Spring Constant</h2>
            <p>Named after Robert Hooke (1678), Hooke's law states that within its elastic limit, a spring's restoring force is proportional to its displacement: F = −k·x. The spring constant k is the ratio F/x — the force in newtons needed to stretch or compress the spring by one meter.</p>
            <h2 className="text-2xl font-bold mb-3">Stored Elastic Energy</h2>
            <p>Stretching a spring does work against the growing restoring force, storing energy as elastic potential energy: <strong>E = ½kx²</strong>. Because the energy scales with the square of the displacement, doubling the stretch quadruples the stored energy — the reason springs are powerful energy reservoirs in mechanical systems.</p>
            <h2 className="text-2xl font-bold mb-3">Springs in Motion</h2>
            <p>Attach a mass to the spring and it oscillates with frequency f = (1/2π)·√(k/m). This simple harmonic motion underlies suspension systems, seismographs, tuning forks, and the balance wheels of mechanical watches — a spring and mass are a clock all by themselves.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/spring-constant-calculator" />
          <PopularCalculators exclude="/calculator/spring-constant-calculator" />
        </div>
      </div>
    </>
  );
}
