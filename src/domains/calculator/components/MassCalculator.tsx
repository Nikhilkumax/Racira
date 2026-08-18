"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Mode = "from_density" | "from_force" | "from_energy";

interface MassResult {
  massKg: number;
  equation: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const C = 299792458;

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMass(mode: Mode, v1: number, v2: number): MassResult {
  let massKg = 0;
  let equation = "";
  if (mode === "from_density") {
    massKg = v1 * v2;
    equation = `m = ρ × V = ${fmt(v1, 2)} kg/m³ × ${fmt(v2, 2)} m³`;
  } else if (mode === "from_force") {
    massKg = Math.abs(v1 / v2);
    equation = `m = F / a = ${fmt(v1, 2)} N ÷ ${fmt(v2, 2)} m/s²`;
  } else {
    massKg = v1 / (C * C);
    equation = `m = E / c² = ${fmt(v1, 2)} J ÷ (${C} m/s)²`;
  }
  const kg = massKg;
  const grams = massKg * 1000;
  const lb = massKg * 2.20462;
  const tons = massKg / 1000;
  const breakdown = [
    { label: "Method", value: mode === "from_density" ? "Density × Volume" : mode === "from_force" ? "Force ÷ Acceleration" : "Energy ÷ c²" },
    { label: "Equation", value: equation },
    { label: "Mass (kilograms)", value: `${fmt(kg)} kg` },
    { label: "Mass (grams)", value: `${fmt(grams)} g` },
    { label: "Mass (pounds)", value: `${fmt(lb)} lb` },
    { label: "Mass (metric tons)", value: `${fmt(tons)} t` },
  ];
  const summaryStats = [
    { label: "Mass (kg)", value: `${fmt(kg)} kg` },
    { label: "Mass (g)", value: `${fmt(grams)} g` },
    { label: "Mass (lb)", value: `${fmt(lb)} lb` },
    { label: "Mass (t)", value: `${fmt(tons)} t` },
    { label: "Method", value: mode === "from_density" ? "ρ × V" : mode === "from_force" ? "F / a" : "E / c²" },
  ];
  const chartData = [
    { name: "Kilograms", value: Number(kg.toFixed(3)), fill: "hsl(var(--primary))" },
    { name: "Grams", value: Number(grams.toFixed(1)), fill: "#f59e0b" },
    { name: "Pounds", value: Number(lb.toFixed(3)), fill: "#10b981" },
    { name: "Tons", value: Number(tons.toFixed(3)), fill: "#8b5cf6" },
  ];
  return { massKg: kg, equation, breakdown, summaryStats, chartData };
}

const DEFAULTS = {
  from_density: ["1000", "2.5"],
  from_force: ["500", "9.81"],
  from_energy: ["90000000000000000", "0"],
};

export default function MassCalculator() {
  const [mode, setMode] = useState<Mode>("from_density");
  const [val1, setVal1] = useState(DEFAULTS.from_density[0]);
  const [val2, setVal2] = useState(DEFAULTS.from_density[1]);
  const [result, setResult] = useState<MassResult | null>(null);

  const v1 = parseFloat(val1);
  const v2 = parseFloat(val2);
  const errs: string[] = [];
  if (isNaN(v1)) errs.push("First value is required.");
  if (mode !== "from_energy" && isNaN(v2)) errs.push("Second value is required.");
  if (mode === "from_density" && v1 <= 0) errs.push("Density must be greater than 0.");
  if (mode === "from_force" && v2 === 0) errs.push("Acceleration cannot be zero.");
  if (mode === "from_energy" && v1 < 0) errs.push("Energy must be 0 or greater.");
  const valid = errs.length === 0;

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setVal1(DEFAULTS[m][0]);
    setVal2(DEFAULTS[m][1]);
    setResult(calcMass(m, parseFloat(DEFAULTS[m][0]), parseFloat(DEFAULTS[m][1])));
  };
  const calculate = () => { if (valid) setResult(calcMass(mode, v1, mode === "from_energy" ? 0 : v2)); };
  const reset = () => {
    setMode("from_density"); setVal1(DEFAULTS.from_density[0]); setVal2(DEFAULTS.from_density[1]);
    setResult(calcMass("from_density", 1000, 2.5));
  };
  useEffect(() => { setResult(calcMass("from_density", 1000, 2.5)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is Mass vs. Weight?", answer: "Mass is the amount of matter in an object, measured in kilograms. Weight is the force of gravity acting on that mass, measured in newtons. Your mass is the same on Earth and the Moon; your weight changes because gravity differs." },
    { question: "How do you calculate mass from density?", answer: "Mass = Density × Volume. Density tells you how tightly matter is packed — steel is dense, styrofoam is not. Multiplying density by the volume an object occupies gives its total mass." },
    { question: "What does E=mc² have to do with mass?", answer: "Einstein's equation shows mass and energy are interchangeable: m = E/c². Because the speed of light squared is enormous, a tiny mass converts to a colossal amount of energy — the principle behind nuclear power." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Mass Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Mass Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Calculation Method</label>
              <select value={mode} onChange={e => handleModeChange(e.target.value as Mode)} className={inp}>
                <option value="from_density">From Density &amp; Volume</option>
                <option value="from_force">From Force &amp; Acceleration</option>
                <option value="from_energy">From Energy (E = mc²)</option>
              </select>
            </div>
            {mode === "from_density" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Density (kg/m³)</label>
                  <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={inp} placeholder="1000" />
                </div>
                <div>
                  <label className={lbl}>Volume (m³)</label>
                  <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={inp} placeholder="2.5" />
                </div>
              </div>
            )}
            {mode === "from_force" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Force (N)</label>
                  <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={inp} placeholder="500" />
                </div>
                <div>
                  <label className={lbl}>Acceleration (m/s²)</label>
                  <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className={inp} placeholder="9.81" />
                </div>
              </div>
            )}
            {mode === "from_energy" && (
              <div>
                <label className={lbl}>Energy (Joules)</label>
                <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className={inp} placeholder="9e16" />
                <p className="text-xs text-muted-foreground mt-1">c = 299,792,458 m/s is fixed</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Calculated Mass</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.massKg)} kg</div>
                <div className="text-sm text-muted-foreground mt-1">{result.equation}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Grams", `${fmt(result.massKg * 1000)} g`], ["Pounds", `${fmt(result.massKg * 2.20462)} lb`], ["Tons", `${fmt(result.massKg / 1000)} t`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Mass in Different Units</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The same mass expressed in four unit systems</p>
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
            <h2 className="text-2xl font-bold mb-3">What is Mass?</h2>
            <p><strong>Mass</strong> measures the amount of matter in an object. Unlike weight — the force gravity exerts on that mass — mass is absolute: a 10 kg bowling ball stays 10 kg on Earth, in space, and on Jupiter, while its weight changes everywhere. The standard unit is the kilogram.</p>
            <h2 className="text-2xl font-bold mb-3">Three Ways to Find It</h2>
            <p>From density, m = ρV — the everyday route for objects and materials. From force, m = F/a — Newton's second law, used when you measure how hard something accelerates. From energy, m = E/c² — Einstein's equivalence, where a hair's worth of mass releases staggering energy.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Method</h2>
            <p>Use density when you know the material and its size; use force when you can measure push and acceleration; use energy only for nuclear-scale phenomena. All three return the same physical quantity — mass — in kilograms, with the other units shown for convenience.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mass-calculator" />
          <PopularCalculators exclude="/calculator/mass-calculator" />
        </div>
      </div>
    </>
  );
}
