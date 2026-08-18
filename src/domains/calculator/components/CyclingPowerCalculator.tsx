"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PowerResult {
  totalPower: number;
  aeroPower: number;
  rollingPower: number;
  gravityPower: number;
  wattsPerKg: number;
  speedMps: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function calcPower(weightKg: number, speedKmh: number, gradePct: number, cda: number, crr: number, rho: number, windKmh: number): PowerResult {
  const v = speedKmh / 3.6;
  const w = Math.max(0, windKmh) / 3.6;
  const airSpeed = v + w;
  const g = 9.81;
  const aeroPower = 0.5 * rho * cda * airSpeed * airSpeed * v;
  const rollingPower = crr * weightKg * g * v;
  const gravityPower = weightKg * g * Math.sin(Math.atan(gradePct / 100)) * v;
  const totalPower = aeroPower + rollingPower + gravityPower;
  const wattsPerKg = totalPower / weightKg;

  const breakdown = [
    { label: "Aerodynamic Drag", value: `${aeroPower.toFixed(1)} W` },
    { label: "Rolling Resistance", value: `${rollingPower.toFixed(1)} W` },
    { label: "Gravity (Climbing)", value: `${gravityPower.toFixed(1)} W` },
    { label: "Total Power Required", value: `${totalPower.toFixed(1)} W` },
    { label: "Power-to-Weight", value: `${wattsPerKg.toFixed(2)} W/kg` },
    { label: "Ground Speed", value: `${speedKmh} km/h` },
    { label: "Headwind", value: `${windKmh} km/h` },
    { label: "Grade", value: `${gradePct}%` },
  ];
  const summaryStats = [
    { label: "Total Power", value: `${totalPower.toFixed(1)} W` },
    { label: "Aero Drag", value: `${aeroPower.toFixed(1)} W` },
    { label: "Rolling", value: `${rollingPower.toFixed(1)} W` },
    { label: "Gravity", value: `${gravityPower.toFixed(1)} W` },
    { label: "W/kg", value: `${wattsPerKg.toFixed(2)}` },
    { label: "Speed", value: `${speedKmh} km/h` },
    { label: "CdA", value: `${cda.toFixed(3)} m²` },
    { label: "Crr", value: `${crr.toFixed(4)}` },
  ];
  const chartData = [
    { name: "Aero", value: Math.round(aeroPower), fill: "hsl(var(--primary))" },
    { name: "Rolling", value: Math.round(rollingPower), fill: "#10b981" },
    { name: "Gravity", value: Math.round(gravityPower), fill: "#f59e0b" },
  ];
  return { totalPower, aeroPower, rollingPower, gravityPower, wattsPerKg, speedMps: v, breakdown, summaryStats, chartData };
}

const DEFAULTS = { weight: "85", speed: "25", grade: "1", cda: "0.32", crr: "0.004", rho: "1.225", wind: "0" };

export default function CyclingPowerCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [grade, setGrade] = useState(DEFAULTS.grade);
  const [cda, setCda] = useState(DEFAULTS.cda);
  const [crr, setCrr] = useState(DEFAULTS.crr);
  const [rho, setRho] = useState(DEFAULTS.rho);
  const [wind, setWind] = useState(DEFAULTS.wind);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<PowerResult | null>(null);

  const w = parseFloat(weight) || 0;
  const s = parseFloat(speed) || 0;
  const g = parseFloat(grade) || 0;
  const errs: string[] = [];
  if (w <= 0) errs.push("Total weight must be greater than 0.");
  if (s <= 0) errs.push("Speed must be greater than 0.");
  if (g < -30 || g > 30) errs.push("Grade must be between -30% and 30%.");
  const valid = errs.length === 0;

  const calculate = () => {
    if (!valid) return;
    setResult(calcPower(w, s, g, parseFloat(cda) || 0.32, parseFloat(crr) || 0.004, parseFloat(rho) || 1.225, parseFloat(wind) || 0));
  };
  const reset = () => {
    setWeight(DEFAULTS.weight); setSpeed(DEFAULTS.speed); setGrade(DEFAULTS.grade);
    setCda(DEFAULTS.cda); setCrr(DEFAULTS.crr); setRho(DEFAULTS.rho); setWind(DEFAULTS.wind);
    setResult(calcPower(85, 25, 1, 0.32, 0.004, 1.225, 0));
  };
  useEffect(() => { setResult(calcPower(85, 25, 1, 0.32, 0.004, 1.225, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is cycling power calculated?", answer: "Total power = aerodynamic drag + rolling resistance + gravity. Aero: ½ρCdA·v³. Rolling: Crr·m·g·v. Gravity: m·g·sin(θ)·v. This is the standard physics model used by power estimation tools, where ρ is air density, CdA is drag area, Crr is rolling resistance, m is total mass, and v is speed in m/s." },
    { question: "What is a good watts-per-kilogram figure?", answer: "Recreational riders sustain 2.0–2.5 W/kg for an hour; club-level racers 3.0–3.5; category 1–2 racers 4.0–4.5; and world-class climbers 6.0+. W/kg is the best predictor of climbing performance because gravity power scales directly with mass." },
    { question: "How much does aerodynamics matter?", answer: "At 25 km/h on flat ground, aerodynamic drag is roughly 70–85% of total resistance. At 40 km/h it approaches 90%. Cutting CdA from 0.32 to 0.28 (aero bars, tight clothing, low position) can save 10–15% of total power at racing speeds." },
    { question: "Why does my measured power differ from the estimate?", answer: "Power meters measure exactly what your legs deliver; the model estimates the mechanical power required to overcome resistance. Differences come from tire pressure, drivetrain losses (2–3%), drafting, wind direction, and the exact CdA and Crr of your setup." },
  ];

  const pctAero = result ? (result.totalPower > 0 ? (result.aeroPower / result.totalPower) * 100 : 0) : 0;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cycling Power Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Cycling Power Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Rider + Bike Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
              </div>
              <div>
                <label className={lbl}>Speed</label>
                <div className={inp}><input type="number" value={speed} onChange={e => setSpeed(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">km/h</span></div>
              </div>
            </div>
            <div>
              <label className={lbl}>Road Gradient</label>
              <div className={inp}><input type="number" value={grade} onChange={e => setGrade(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Bike &amp; Environment</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Drag Area (CdA)</label>
                      <div className={inp}><input type="number" value={cda} onChange={e => setCda(e.target.value)} step="0.01" className={ci} /></div>
                    </div>
                    <div>
                      <label className={lbl}>Rolling Resistance (Crr)</label>
                      <div className={inp}><input type="number" value={crr} onChange={e => setCrr(e.target.value)} step="0.0005" className={ci} /></div>
                    </div>
                    <div>
                      <label className={lbl}>Air Density</label>
                      <div className={inp}><input type="number" value={rho} onChange={e => setRho(e.target.value)} step="0.01" className={ci} /><span className="pr-3 text-muted-foreground text-sm">kg/m³</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Headwind</label>
                      <div className={inp}><input type="number" value={wind} onChange={e => setWind(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">km/h</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Power Required</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.totalPower.toFixed(1)} <span className="text-2xl text-muted-foreground">W</span></div>
                <div className="text-sm text-muted-foreground mt-1">{result.wattsPerKg.toFixed(2)} W/kg · {result.aeroPower.toFixed(0)} W aero ({pctAero.toFixed(0)}%)</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Aero Drag", `${result.aeroPower.toFixed(1)} W`], ["Rolling", `${result.rollingPower.toFixed(1)} W`], ["W/kg", `${result.wattsPerKg.toFixed(2)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Power Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Resistance Components</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}W`} />
                    <Tooltip formatter={(v: number) => [`${v} W`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Physics of Riding</h2>
            <p>Total power P = ½ρ·CdA·v³ + Crr·m·g·v + m·g·sin(θ)·v. The first term is aerodynamic drag, proportional to the cube of air speed — why speed gets exponentially harder. The second is rolling resistance. The third is gravity, the dominant cost on climbs. This <strong>cycling power calculator</strong> applies the standard model with your mass, speed, gradient, and equipment parameters.</p>
            <h2 className="text-2xl font-bold mb-3">Typical Parameters</h2>
            <p>Road cyclist CdA: 0.28–0.36 m² (0.24 with aero bars). Rolling resistance: 0.003–0.006 for road tires on asphalt. Air density: 1.225 kg/m³ at sea level, dropping to ~1.06 at 1,500 m — a free speed boost at altitude.</p>
            <h2 className="text-2xl font-bold mb-3">Training with Power</h2>
            <p>Functional Threshold Power (FTP) is the power you can hold for one hour. Train at 55–75% of FTP for endurance, 90–105% for threshold, and 120%+ for VO2 max intervals. W/kg targets help pace climbs: at 4.0 W/kg you climb roughly 1,200 m per hour on moderate grades.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cycling-power-calculator" />
          <PopularCalculators exclude="/calculator/cycling-power-calculator" />
        </div>
      </div>
    </>
  );
}
