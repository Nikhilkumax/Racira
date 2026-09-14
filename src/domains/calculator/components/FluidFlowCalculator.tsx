"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Waves } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FlowResult {
  diameterIn: number;
  velocityFts: number;
  viscosity: number;
  areaSqFt: number;
  qCfs: number;
  qGpm: number;
  qLps: number;
  velocityMs: number;
  diameterM: number;
  reynolds: number;
  regime: string;
  chartData: { name: string; value: number }[];
}

function calcFlow(diameterIn: number, velocityFts: number, viscosity: number): FlowResult {
  const diameterFt = diameterIn / 12;
  const areaSqFt = Math.PI * Math.pow(diameterFt / 2, 2);
  const qCfs = areaSqFt * velocityFts;
  const qGpm = qCfs * 448.831;
  const qLps = qCfs * 28.316847;
  const velocityMs = velocityFts * 0.3048;
  const diameterM = diameterIn * 0.0254;
  const reynolds = viscosity > 0 ? (velocityMs * diameterM) / (viscosity * 1e-6) : 0;
  const regime = reynolds < 2300 ? "Laminar" : reynolds <= 4000 ? "Transitional" : "Turbulent";
  const chartData = [
    { name: "ft³/s", value: Number(qCfs.toFixed(3)) },
    { name: "m³/h", value: Number((qCfs * 0.028316847 * 3600).toFixed(2)) },
    { name: "GPM", value: Number(qGpm.toFixed(1)) },
  ];
  return { diameterIn, velocityFts, viscosity, areaSqFt, qCfs, qGpm, qLps, velocityMs, diameterM, reynolds, regime, chartData };
}

const DEFAULTS = { diameter: "1", velocity: "5", viscosity: "1" };

const faqs = [
  { question: "What is the flow equation?", answer: "Flow rate is velocity × cross-sectional area: Q = v × A. A 1-inch pipe (A = 0.00545 ft²) carrying water at 5 ft/s flows 0.0273 ft³/s ≈ 12.2 GPM." },
  { question: "What is the Reynolds number?", answer: "Re = v·D/ν (with kinematic viscosity ν in m²/s) predicts flow regime: Re < 2,300 is laminar (smooth layers), 2,300–4,000 transitional, > 4,000 turbulent (mixing, higher friction)." },
  { question: "Why does regime matter?", answer: "Turbulent flow needs more pump head than laminar flow for the same rate — friction losses jump. Most water piping is turbulent; lubrication films and blood flow are laminar." },
];

export default function FluidFlowCalculator() {
  const [diameter, setDiameter] = useState(DEFAULTS.diameter);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [viscosity, setViscosity] = useState(DEFAULTS.viscosity);
  const [result, setResult] = useState<FlowResult>(() => calcFlow(1, 5, 1));

  useEffect(() => {
    const d = parseFloat(diameter);
    const v = parseFloat(velocity);
    const nu = parseFloat(viscosity);
    if (!isNaN(d) && !isNaN(v) && !isNaN(nu) && d > 0 && v >= 0 && nu >= 0) setResult(calcFlow(d, v, nu));
  }, []);

  const reset = () => { setDiameter(DEFAULTS.diameter); setVelocity(DEFAULTS.velocity); setViscosity(DEFAULTS.viscosity); setResult(calcFlow(parseFloat(DEFAULTS.diameter), parseFloat(DEFAULTS.velocity), parseFloat(DEFAULTS.viscosity))); };
  const invalid = isNaN(parseFloat(diameter)) || isNaN(parseFloat(velocity)) || isNaN(parseFloat(viscosity)) || parseFloat(diameter) <= 0 || parseFloat(velocity) < 0 || parseFloat(viscosity) < 0;

  const breakdown = [
    { label: "Pipe Diameter", value: `${result.diameterIn.toFixed(2)} in (${(result.diameterM * 1000).toFixed(1)} mm)` },
    { label: "Fluid Velocity", value: `${result.velocityFts.toFixed(2)} ft/s (${result.velocityMs.toFixed(2)} m/s)` },
    { label: "Cross-Section Area", value: `${(result.areaSqFt * 144).toFixed(3)} in² (${result.areaSqFt.toFixed(6)} ft²)` },
    { label: "Flow Rate Q", value: `${result.qCfs.toFixed(4)} ft³/s`, highlight: true },
    { label: "Flow (GPM)", value: `${result.qGpm.toFixed(1)} GPM` },
    { label: "Flow (L/s)", value: `${result.qLps.toFixed(2)} L/s` },
    { label: "Kinematic Viscosity", value: `${result.viscosity.toFixed(1)} cSt` },
    { label: "Reynolds Number", value: `${result.reynolds.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Flow Regime", value: result.regime },
  ];

  const summaryStats = [
    { label: "Flow (GPM)", value: `${result.qGpm.toFixed(1)}` },
    { label: "Flow (ft³/s)", value: `${result.qCfs.toFixed(4)}` },
    { label: "Flow (L/s)", value: `${result.qLps.toFixed(2)}` },
    { label: "Velocity", value: `${result.velocityFts.toFixed(2)} ft/s` },
    { label: "Re", value: `${result.reynolds.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Regime", value: result.regime },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fluid Flow Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fluid Flow Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ff-d" className="block text-sm font-medium mb-1 text-foreground">Pipe Diameter (in)</label>
                <input id="ff-d" type="number" min="0.01" step="0.25" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ff-v" className="block text-sm font-medium mb-1 text-foreground">Fluid Velocity (ft/s)</label>
                <input id="ff-v" type="number" min="0" step="0.5" value={velocity} onChange={(e) => setVelocity(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Advanced Options</div>
              <label htmlFor="ff-nu" className="block text-sm font-medium mb-1 text-foreground">Kinematic Viscosity (cSt, for Re)</label>
              <input id="ff-nu" type="number" min="0" step="0.1" value={viscosity} onChange={(e) => setViscosity(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-2">Water @ 20°C: 1.0 cSt · air: 15 cSt · oil: 40–100 cSt</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Waves className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive diameter and non-negative velocity/viscosity.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Flow Rate</div>
              <div className="text-4xl font-extrabold text-primary">{result.qGpm.toFixed(1)} GPM</div>
              <div className="text-sm text-muted-foreground mt-1">{result.qCfs.toFixed(4)} ft³/s · {result.qLps.toFixed(2)} L/s</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">ft³/s</div>
                <div className="text-lg font-bold text-primary">{result.qCfs.toFixed(4)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">L/s</div>
                <div className="text-lg font-bold text-primary">{result.qLps.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Reynolds</div>
                <div className="text-lg font-bold text-primary">{result.reynolds.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
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
              <h3 className="text-base font-bold mb-3">Flow Rate in Common Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US", { maximumFractionDigits: 3 }), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Fluid Flow Calculator</h2>
            <p>Continuity gives Q = v × A: flow is velocity times the pipe's cross-section. A 1-inch pipe (0.785 in² = 0.00545 ft²) at 5 ft/s delivers 0.0273 ft³/s — about 12.2 GPM. Doubling the diameter quadruples the area, so the same velocity moves four times the water.</p>
            <h3>Laminar vs Turbulent</h3>
            <p>The Reynolds number separates the two regimes: Re = v·D/ν. Below 2,300, flow is smooth and predictable (lubrication, blood, microfluidics); above 4,000, turbulence mixes the fluid and sharply increases friction losses — which is why pipe sizing rules keep domestic water flow in the turbulent-but-manageable range.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fluid-flow-calculator" />
          <PopularCalculators exclude="/calculator/fluid-flow-calculator" />
        </div>
      </div>
    </>
  );
}
