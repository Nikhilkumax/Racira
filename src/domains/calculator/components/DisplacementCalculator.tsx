"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Move } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DisplacementResult {
  u: number;
  a: number;
  t: number;
  s: number;
  v: number;
  avgVelocity: number;
  chartData: { t: number; v: number }[];
}

function calcDisplacement(u: number, a: number, t: number): DisplacementResult {
  const s = u * t + 0.5 * a * t * t;
  const v = u + a * t;
  const avgVelocity = t > 0 ? s / t : 0;
  const chartData: { t: number; v: number }[] = [];
  for (let i = 0; i <= 20; i++) {
    const ti = (t * i) / 20;
    chartData.push({ t: Number(ti.toFixed(3)), v: Number((u + a * ti).toFixed(3)) });
  }
  return { u, a, t, s, v, avgVelocity, chartData };
}

const DEFAULTS = { u: "10", a: "2", t: "5" };

const faqs = [
  { question: "What is displacement?", answer: "Displacement is the straight-line change in position, not distance traveled. Under constant acceleration it follows s = ut + ½at², where u is initial velocity, a acceleration, and t time." },
  { question: "What is the difference between displacement and distance?", answer: "Displacement is a vector — it has direction and can be negative. Distance traveled is always positive and includes any backtracking. The formula computes displacement along the line of motion." },
  { question: "How do final velocity and average velocity relate?", answer: "With constant acceleration the velocity increases linearly, so the average is the midpoint: (u + v) ÷ 2, which equals displacement ÷ time. The chart shows this linear rise." },
];

export default function DisplacementCalculator() {
  const [u, setU] = useState(DEFAULTS.u);
  const [a, setA] = useState(DEFAULTS.a);
  const [t, setT] = useState(DEFAULTS.t);
  const [result, setResult] = useState<DisplacementResult>(() => calcDisplacement(10, 2, 5));

  useEffect(() => {
    const iv = parseFloat(u);
    const ac = parseFloat(a);
    const tm = parseFloat(t);
    if (!isNaN(iv) && !isNaN(ac) && !isNaN(tm) && tm >= 0) setResult(calcDisplacement(iv, ac, tm));
  }, [u, a, t]);

  const reset = () => { setU(DEFAULTS.u); setA(DEFAULTS.a); setT(DEFAULTS.t); };
  const invalid = isNaN(parseFloat(u)) || isNaN(parseFloat(a)) || isNaN(parseFloat(t)) || parseFloat(t) < 0;

  const breakdown = [
    { label: "Initial Velocity (u)", value: `${result.u.toFixed(2)} m/s` },
    { label: "Acceleration (a)", value: `${result.a.toFixed(2)} m/s²` },
    { label: "Time (t)", value: `${result.t.toFixed(2)} s` },
    { label: "Displacement (s = ut + ½at²)", value: `${result.s.toFixed(2)} m`, highlight: true },
    { label: "Final Velocity (v = u + at)", value: `${result.v.toFixed(2)} m/s` },
    { label: "Average Velocity (s ÷ t)", value: `${result.avgVelocity.toFixed(2)} m/s` },
    { label: "Displacement (km)", value: `${(result.s / 1000).toFixed(3)} km` },
  ];

  const summaryStats = [
    { label: "Displacement", value: `${result.s.toFixed(2)} m` },
    { label: "Final Velocity", value: `${result.v.toFixed(2)} m/s` },
    { label: "Average Velocity", value: `${result.avgVelocity.toFixed(2)} m/s` },
    { label: "Initial Velocity", value: `${result.u.toFixed(2)} m/s` },
    { label: "Acceleration", value: `${result.a.toFixed(2)} m/s²` },
    { label: "Time", value: `${result.t.toFixed(2)} s` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Displacement Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Displacement Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dp-u" className="block text-sm font-medium mb-1 text-foreground">Initial Velocity (m/s)</label>
                <input id="dp-u" type="number" step="0.1" value={u} onChange={(e) => setU(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dp-a" className="block text-sm font-medium mb-1 text-foreground">Acceleration (m/s²)</label>
                <input id="dp-a" type="number" step="0.1" value={a} onChange={(e) => setA(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="dp-t" className="block text-sm font-medium mb-1 text-foreground">Time (s)</label>
              <input id="dp-t" type="number" min="0" step="0.1" value={t} onChange={(e) => setT(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Move className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter numeric velocities/acceleration and a non-negative time.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Displacement</div>
              <div className="text-4xl font-extrabold text-primary">{result.s.toFixed(2)} m</div>
              <div className="text-sm text-muted-foreground mt-1">u = {result.u.toFixed(1)} m/s · a = {result.a.toFixed(1)} m/s² · t = {result.t.toFixed(1)} s</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Final Velocity</div>
                <div className="text-lg font-bold text-primary">{result.v.toFixed(1)} m/s</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Average Velocity</div>
                <div className="text-lg font-bold text-primary">{result.avgVelocity.toFixed(1)} m/s</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">In km</div>
                <div className="text-lg font-bold text-primary">{(result.s / 1000).toFixed(3)} km</div>
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
              <h3 className="text-base font-bold mb-3">Velocity Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} label={{ value: "t (s)", position: "insideBottom", fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} m/s`, "Velocity"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Area under the line = displacement ({result.s.toFixed(1)} m)</p>
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
            <h2 className="text-2xl font-bold mb-3">About the Displacement Calculator</h2>
            <p>Under constant acceleration, displacement is s = ut + ½at²: the initial-velocity term plus the extra ground covered as speed grows. With u = 10 m/s and a = 2 m/s² over 5 seconds, that is 50 m + 25 m = 75 m — while final velocity reaches v = u + at = 20 m/s.</p>
            <h3>Why the Average Works</h3>
            <p>Velocity increases linearly from u to v, so its average is the midpoint (u + v) ÷ 2 = 15 m/s, and 15 m/s × 5 s = 75 m — matching the area under the velocity-time line. This geometric view is why the formula takes exactly this shape.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/displacement-calculator" />
          <PopularCalculators exclude="/calculator/displacement-calculator" />
        </div>
      </div>
    </>
  );
}
