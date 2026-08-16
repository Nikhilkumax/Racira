"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const UNITS = ["N", "kN", "lbf", "kgf", "dyn", "pdl"] as const;
type Unit = (typeof UNITS)[number];

// Conversion factor to newtons (N)
const TO_N: Record<Unit, number> = {
  N: 1,
  kN: 1000,
  lbf: 4.4482216153,
  kgf: 9.80665,
  dyn: 1e-5,
  pdl: 0.1382549544,
};

const DISPLAY: Record<Unit, string> = {
  N: "Newtons (N)",
  kN: "Kilonewtons (kN)",
  lbf: "Pound-force (lbf)",
  kgf: "Kilogram-force (kgf)",
  dyn: "Dynes (dyn)",
  pdl: "Poundals (pdl)",
};

interface ForceResult {
  value: number;
  unit: Unit;
  newtons: number;
  conversions: { unit: Unit; value: number }[];
  chartData: { name: string; value: number }[];
  comparison: string;
}

function convertForce(value: number, from: Unit): ForceResult {
  const newtons = value * TO_N[from];
  const conversions = UNITS.map((u) => ({ unit: u, value: newtons / TO_N[u] }));
  const chartData = conversions.map((c) => ({
    name: c.unit,
    value: Number(c.value.toPrecision(4)),
  }));
  let comparison: string;
  const n = Math.abs(newtons);
  if (n < 1e-3) comparison = "a tiny force — smaller than a paperclip's weight (~0.1 N).";
  else if (n < 1) comparison = "about the weight of a small apple (≈ 1 N).";
  else if (n < 10) comparison = "roughly the weight of a 1 kg object (≈ 9.8 N).";
  else if (n < 1000) comparison = "in the range of everyday mechanical forces — a hand grip or door push.";
  else if (n < 1e6) comparison = "a heavy industrial force — like the thrust of a small rocket engine.";
  else comparison = "an enormous force, far beyond typical mechanical loads.";
  return { value, unit: from, newtons, conversions, chartData, comparison };
}

const DEFAULTS = { value: "100", unit: "N" as Unit };

const faqs = [
  { question: "How do force units relate?", answer: "1 N is the force that accelerates 1 kg at 1 m/s². 1 lbf = 4.448 N, 1 kgf = 9.807 N, 1 dyn = 10⁻⁵ N, and 1 pdl = 0.1383 N. The newton is the SI unit; pound-force is common in the US and imperial engineering." },
  { question: "What is the difference between mass and force?", answer: "Mass is the amount of matter (kg, lb); force is mass × acceleration (N, lbf). A 10 kg mass weighs 98.1 N on Earth (g = 9.81 m/s²) but the same mass on the Moon weighs only 16.2 N — mass doesn't change, force does." },
  { question: "When should I use kgf instead of N?", answer: "Kilogram-force is a legacy unit mostly seen in Europe and Asia for everyday and industrial ratings (e.g., luggage weight limits). In science and engineering, the newton is standard — convert kgf to N by multiplying by 9.80665." },
];

export default function ForceConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState<Unit>(DEFAULTS.unit);
  const [result, setResult] = useState<ForceResult>(() => convertForce(100, "N"));

  useEffect(() => {
    const v = parseFloat(value);
    if (!isNaN(v)) setResult(convertForce(v, unit));
  }, [value, unit]);

  const reset = () => {
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setResult(convertForce(100, "N"));
  };

  const breakdown = [
    { label: "Input Value", value: `${result.value.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${result.unit}`, highlight: false },
    { label: "In Newtons (N)", value: `${result.newtons.toLocaleString("en-US", { maximumFractionDigits: 4 })} N`, highlight: true },
    { label: "In Pound-force (lbf)", value: `${result.conversions.find((c) => c.unit === "lbf")!.value.toLocaleString("en-US", { maximumFractionDigits: 4 })} lbf`, highlight: false },
    { label: "In Kilogram-force (kgf)", value: `${result.conversions.find((c) => c.unit === "kgf")!.value.toLocaleString("en-US", { maximumFractionDigits: 4 })} kgf`, highlight: false },
    { label: "In Dynes (dyn)", value: `${result.conversions.find((c) => c.unit === "dyn")!.value.toLocaleString("en-US", { maximumFractionDigits: 4 })} dyn`, highlight: false },
  ];

  const summaryStats = [
    { label: "Reference Point", value: "≈ 9.81 N per kgf" },
    { label: "Force of Gravity (g)", value: "9.80665 m/s²" },
    { label: "Scale", value: result.comparison },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Force Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Force Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Zap className="w-4 h-4" /> Force Unit Conversion
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Force Value</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="input-calc"
                  placeholder="Enter force value"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">From Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="input-calc">
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{DISPLAY[u]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setResult(convertForce(parseFloat(value) || 0, unit))} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Zap className="w-4 h-4 text-primary" /> CONVERTED VALUE
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {result.newtons.toLocaleString("en-US", { maximumFractionDigits: 4 })} N
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.comparison}</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">All Unit Conversions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Unit</th>
                      <th className="p-2.5 pr-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.conversions.map((c) => (
                      <tr key={c.unit} className={c.unit === result.unit ? "bg-primary/10 font-bold" : ""}>
                        <td className="p-2.5 pl-3 text-muted-foreground">{DISPLAY[c.unit]}</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">
                          {c.value.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Relative Magnitude</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US", { maximumFractionDigits: 4 }), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Force Converter</h2>
            <p>A force is a push or pull measured in newtons: 1 N accelerates 1 kg at 1 m/s². On Earth's surface, gravity pulls each kilogram with about 9.81 N, which is why 1 kgf = 9.80665 N exactly. This converter works through the newton — every unit is expressed relative to it, so 100 lbf becomes 444.8 N, 100 kgf becomes 980.7 N, and so on.</p>
            <h3>Which unit should you use?</h3>
            <p>Engineers and scientists use the newton (or kilonewton for structural loads). Pound-force dominates US industry, especially in fasteners and torque specifications. Dynes and poundals appear only in niche physics contexts — dynes for cgs measurements, poundals in US physics textbooks. For anything on a scale you can feel, newton and pound-force cover the practical range.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/force-converter" />
          <PopularCalculators exclude="/calculator/force-converter" />
        </div>
      </div>
    </>
  );
}
