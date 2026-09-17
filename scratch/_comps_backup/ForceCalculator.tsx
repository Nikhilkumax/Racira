"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ForceResult {
  massValue: number;
  massUnit: string;
  massKg: number;
  accelValue: number;
  accelUnit: string;
  accelMs2: number;
  forceN: number;
  forceKgf: number;
  forceLbf: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const MASS_TO_KG: Record<string, number> = { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 };
const ACCEL_TO_MS2: Record<string, number> = { ms2: 1, fts2: 0.3048, g: 9.80665 };

function calcForce(massValue: number, massUnit: string, accelValue: number, accelUnit: string): ForceResult {
  const massKg = massValue * MASS_TO_KG[massUnit];
  const accelMs2 = accelValue * ACCEL_TO_MS2[accelUnit];
  const forceN = massKg * accelMs2;
  const forceKgf = forceN / 9.80665;
  const forceLbf = forceN / 4.448222;

  const breakdown = [
    { label: "Mass", value: `${massValue} ${massUnit} (${massKg.toFixed(3)} kg)` },
    { label: "Acceleration", value: `${accelValue} ${accelUnit} (${accelMs2.toFixed(3)} m/s²)` },
    { label: "Formula", value: "F = m × a" },
    { label: "Force (N)", value: `${forceN.toFixed(2)} N` },
    { label: "Force (kgf)", value: `${forceKgf.toFixed(2)} kgf` },
    { label: "Force (lbf)", value: `${forceLbf.toFixed(2)} lbf` },
    { label: "Mass in kg", value: `${massKg.toFixed(3)} kg` },
    { label: "Acceleration in m/s²", value: `${accelMs2.toFixed(3)} m/s²` },
  ];
  const summaryStats = [
    { label: "Force (N)", value: `${forceN.toFixed(2)} N` },
    { label: "Force (kgf)", value: `${forceKgf.toFixed(2)} kgf` },
    { label: "Force (lbf)", value: `${forceLbf.toFixed(2)} lbf` },
    { label: "Mass", value: `${massKg.toFixed(3)} kg` },
    { label: "Acceleration", value: `${accelMs2.toFixed(3)} m/s²` },
    { label: "Mass Input", value: `${massValue} ${massUnit}` },
    { label: "Accel Input", value: `${accelValue} ${accelUnit}` },
    { label: "Law", value: "Newton's 2nd Law" },
  ];
  const chartData = [
    { name: "Newton", value: Math.round(forceN), fill: "hsl(var(--primary))" },
    { name: "kgf", value: Math.round(forceKgf), fill: "#8b5cf6" },
    { name: "lbf", value: Math.round(forceLbf), fill: "#f59e0b" },
  ];
  return { massValue, massUnit, massKg, accelValue, accelUnit, accelMs2, forceN, forceKgf, forceLbf, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mass: "10", massUnit: "kg", accel: "9.8", accelUnit: "ms2" };

export default function ForceCalculator() {
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [massUnit, setMassUnit] = useState(DEFAULTS.massUnit);
  const [accel, setAccel] = useState(DEFAULTS.accel);
  const [accelUnit, setAccelUnit] = useState(DEFAULTS.accelUnit);
  const [result, setResult] = useState<ForceResult | null>(null);

  const m = parseFloat(mass) || 0;
  const a = parseFloat(accel) || 0;
  const errs: string[] = [];
  if (m <= 0) errs.push("Mass must be greater than 0.");
  if (a < 0) errs.push("Acceleration cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcForce(m, massUnit, a, accelUnit)); };
  const reset = () => {
    setMass(DEFAULTS.mass); setMassUnit(DEFAULTS.massUnit); setAccel(DEFAULTS.accel); setAccelUnit(DEFAULTS.accelUnit);
    setResult(calcForce(10, "kg", 9.8, "ms2"));
  };
  useEffect(() => { setResult(calcForce(10, "kg", 9.8, "ms2")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is Newton's second law?", answer: "Force equals mass times acceleration (F = ma). A newton is the force needed to accelerate 1 kilogram at 1 meter per second squared." },
    { question: "Why is weight force = mass × 9.8?", answer: "Weight is the gravitational force on a mass: F = mg with g ≈ 9.8 m/s² on Earth. A 10 kg object therefore weighs about 98 newtons (≈ 10 kgf)." },
    { question: "How do kgf and lbf relate to newtons?", answer: "One kilogram-force is the weight of 1 kg under standard gravity (9.80665 N), and one pound-force is 4.448222 N — the weight of 1 lb-mass on Earth." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Force Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Force Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Mass</label>
                <div className={inp}><input type="number" value={mass} onChange={e => setMass(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Mass Unit</label>
                <select value={massUnit} onChange={e => setMassUnit(e.target.value)} className={sel}>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="lb">Pound (lb)</option>
                  <option value="oz">Ounce (oz)</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Acceleration</label>
                <div className={inp}><input type="number" value={accel} onChange={e => setAccel(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Acceleration Unit</label>
                <select value={accelUnit} onChange={e => setAccelUnit(e.target.value)} className={sel}>
                  <option value="ms2">m/s²</option>
                  <option value="fts2">ft/s²</option>
                  <option value="g">g-force (9.81 m/s²)</option>
                </select>
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Force</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.forceN.toFixed(2)} N</div>
                <div className="text-sm text-muted-foreground mt-1">{result.massValue} {result.massUnit} × {result.accelValue} {result.accelUnit} · {result.forceLbf.toFixed(2)} lbf</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Kilogram-force`, `${result.forceKgf.toFixed(2)} kgf`], ["Pound-force", `${result.forceLbf.toFixed(2)} lbf`], ["Mass", `${result.massKg.toFixed(3)} kg`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Force Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Force in Different Units</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Same force expressed in newtons, kgf, and lbf</p>
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
            <h2 className="text-2xl font-bold mb-3">Newton's Second Law</h2>
            <p>This <strong>force calculator</strong> applies F = ma: force equals the product of mass and acceleration. One newton accelerates one kilogram at one meter per second squared — the SI definition that anchors the entire calculation.</p>
            <h2 className="text-2xl font-bold mb-3">Weight Is a Force</h2>
            <p>Set the acceleration to 9.8 m/s² and the result is weight: the gravitational pull on the mass. A 10 kg object weighs 98 newtons on Earth, but only about 16 newtons on the Moon, where gravity is roughly one-sixth as strong.</p>
            <h2 className="text-2xl font-bold mb-3">Unit Conventions</h2>
            <p>Engineers in the US commonly work in pound-force, while kgf is standard in much of Europe and Asia. All three conversions are shown so the same force can be reported in the unit your tools expect.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/force-calculator" />
          <PopularCalculators exclude="/calculator/force-calculator" />
        </div>
      </div>
    </>
  );
}
