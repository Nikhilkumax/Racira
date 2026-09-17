"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Zap } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WattageResult {
  weight: number;
  speed: number;
  grade: number;
  cda: number;
  crr: number;
  aero: number;
  rolling: number;
  gravity: number;
  total: number;
  wkg: number;
  chartData: { name: string; value: number }[];
}

function calcWattage(weight: number, speed: number, grade: number, cda: number, crr: number): WattageResult {
  const g = 9.81;
  const rho = 1.225;
  const v = speed / 3.6;
  const theta = Math.atan(grade / 100);
  const aero = 0.5 * rho * cda * v * v * v;
  const rolling = crr * weight * g * Math.cos(theta) * v;
  const gravity = weight * g * Math.sin(theta) * v;
  const total = aero + rolling + gravity;
  const wkg = weight > 0 ? total / weight : 0;
  const chartData = [
    { name: "Aero Drag", value: aero },
    { name: "Rolling Resistance", value: rolling },
    { name: "Gravity", value: gravity },
  ];
  return { weight, speed, grade, cda, crr, aero, rolling, gravity, total, wkg, chartData };
}

const DEFAULTS = { weight: "80", speed: "30", grade: "2", cda: "0.32", crr: "0.005" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)", "hsl(0 72% 51%)"];

const faqs = [
  { question: "What is cycling wattage?", answer: "Wattage is the mechanical power you deliver to the pedals. It combines the power to overcome air drag, rolling resistance, and (on climbs) gravity: P = 0.5·ρ·CdA·v³ + Crr·m·g·v + m·g·sinθ·v." },
  { question: "What is a good power output?", answer: "A fit recreational rider holds 2.5–3.5 W/kg for an hour; club racers 3.5–4.5 W/kg; pros exceed 6 W/kg on climbs. Absolute watts depend on weight — W/kg is the fair comparison." },
  { question: "Why is the estimate approximate?", answer: "This uses standard constants (ρ = 1.225, g = 9.81) and typical CdA values. Wind, drafting, tire pressure, temperature, and drivetrain losses are not modeled — a power meter is far more accurate." },
];

export default function CyclingWattageCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [grade, setGrade] = useState(DEFAULTS.grade);
  const [cda, setCda] = useState(DEFAULTS.cda);
  const [crr, setCrr] = useState(DEFAULTS.crr);
  const [result, setResult] = useState<WattageResult>(() => calcWattage(80, 30, 2, 0.32, 0.005));

  useEffect(() => {
    const w = parseFloat(weight);
    const s = parseFloat(speed);
    const gr = parseFloat(grade);
    const c = parseFloat(cda);
    const r = parseFloat(crr);
    if (!isNaN(w) && !isNaN(s) && !isNaN(gr) && !isNaN(c) && !isNaN(r) && w > 0 && s >= 0 && c > 0 && r >= 0) setResult(calcWattage(w, s, gr, c, r));
  }, []);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const s = parseFloat(speed);
    const gr = parseFloat(grade);
    const c = parseFloat(cda);
    const r = parseFloat(crr);
    if (!isNaN(w) && !isNaN(s) && !isNaN(gr) && !isNaN(c) && !isNaN(r) && w > 0 && s >= 0 && c > 0 && r >= 0) setResult(calcWattage(w, s, gr, c, r));
  };
  const reset = () => { setWeight(DEFAULTS.weight); setSpeed(DEFAULTS.speed); setGrade(DEFAULTS.grade); setCda(DEFAULTS.cda); setCrr(DEFAULTS.crr); setResult(calcWattage(80, 30, 2, 0.32, 0.005)); };
  const invalid = isNaN(parseFloat(weight)) || isNaN(parseFloat(speed)) || isNaN(parseFloat(grade)) || isNaN(parseFloat(cda)) || isNaN(parseFloat(crr)) || parseFloat(weight) <= 0 || parseFloat(speed) < 0 || parseFloat(cda) <= 0 || parseFloat(crr) < 0;

  const breakdown = [
    { label: "Rider + Bike Weight", value: `${result.weight.toFixed(1)} kg` },
    { label: "Speed", value: `${result.speed.toFixed(1)} km/h` },
    { label: "Grade", value: `${result.grade.toFixed(1)}%` },
    { label: "Aero Drag Power", value: `${result.aero.toFixed(0)} W` },
    { label: "Rolling Resistance Power", value: `${result.rolling.toFixed(0)} W` },
    { label: "Gravity Power", value: `${result.gravity.toFixed(0)} W` },
    { label: "Total Power", value: `${result.total.toFixed(0)} W`, highlight: true },
    { label: "Power-to-Weight", value: `${result.wkg.toFixed(2)} W/kg` },
  ];

  const summaryStats = [
    { label: "Total Power", value: `${result.total.toFixed(0)} W` },
    { label: "Power-to-Weight", value: `${result.wkg.toFixed(2)} W/kg` },
    { label: "Aero Drag", value: `${result.aero.toFixed(0)} W` },
    { label: "Rolling Resistance", value: `${result.rolling.toFixed(0)} W` },
    { label: "Gravity", value: `${result.gravity.toFixed(0)} W` },
    { label: "Speed", value: `${result.speed.toFixed(1)} km/h` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cycling Wattage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cycling Wattage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cw-weight" className="block text-sm font-medium mb-1 text-foreground">Rider + Bike (kg)</label>
                <input id="cw-weight" type="number" min="1" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cw-speed" className="block text-sm font-medium mb-1 text-foreground">Speed (km/h)</label>
                <input id="cw-speed" type="number" min="0" step="0.5" value={speed} onChange={(e) => setSpeed(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="cw-grade" className="block text-sm font-medium mb-1 text-foreground">Grade (%)</label>
              <input id="cw-grade" type="number" step="0.1" value={grade} onChange={(e) => setGrade(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">0 = flat · negative = downhill</p>
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Bike & Aerodynamics</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cw-cda" className="block text-sm font-medium mb-1 text-foreground">CdA (m²)</label>
                  <input id="cw-cda" type="number" min="0.1" step="0.01" value={cda} onChange={(e) => setCda(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label htmlFor="cw-crr" className="block text-sm font-medium mb-1 text-foreground">Crr (rolling)</label>
                  <input id="cw-crr" type="number" min="0" step="0.0005" value={crr} onChange={(e) => setCrr(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">CdA ≈ 0.32 drops · 0.40 hoods · 0.28 aero · Crr ≈ 0.004–0.006</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive weight and CdA with non-negative speed and Crr.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Required Power</div>
              <div className="text-4xl font-extrabold text-primary">{result.total.toFixed(0)} W</div>
              <div className="text-sm text-muted-foreground mt-1">{result.wkg.toFixed(2)} W/kg at {result.speed.toFixed(1)} km/h on {result.grade.toFixed(1)}%</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Aero Drag</div>
                <div className="text-lg font-bold text-primary">{result.aero.toFixed(0)} W</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Rolling</div>
                <div className="text-lg font-bold text-primary">{result.rolling.toFixed(0)} W</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Gravity</div>
                <div className="text-lg font-bold text-primary">{result.gravity.toFixed(0)} W</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
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
              <h3 className="text-base font-bold mb-3">Where the Power Goes</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toFixed(0)} W (${((v / (result.total || 1)) * 100).toFixed(1)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
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
            <h2 className="text-2xl font-bold mb-3">About the Cycling Wattage Calculator</h2>
            <p>Required power is the sum of three resistances: aero drag (½·ρ·CdA·v³), rolling resistance (Crr·m·g·cosθ·v), and gravity on grades (m·g·sinθ·v). Because aero scales with the cube of speed, doubling your speed needs eight times the air-resistance power.</p>
            <h3>W/kg Matters More Than Watts</h3>
            <p>On climbs, gravity power is proportional to mass, so the fair comparison is power-to-weight ratio. A 60 kg rider producing 240 W (4.0 W/kg) climbs far faster than an 85 kg rider at 300 W (3.5 W/kg) — this calculator reports both.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cycling-wattage-calculator" />
          <PopularCalculators exclude="/calculator/cycling-wattage-calculator" />
        </div>
      </div>
    </>
  );
}
