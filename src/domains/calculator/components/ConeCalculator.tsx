"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, Triangle } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
interface ConeInputs {
  radius: string;
  height: string;
}

interface ConeResult {
  radius: number;
  height: number;
  slant: number;
  volume: number;
  lateralArea: number;
  baseArea: number;
  totalArea: number;
  pieData: { name: string; value: number; pct: number; color: string }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation ───────────────────────────────────────────────────
function calculateCone(inputs: ConeInputs): ConeResult {
  const empty: ConeResult = {
    radius: 0, height: 0, slant: 0, volume: 0, lateralArea: 0,
    baseArea: 0, totalArea: 0, pieData: [], isError: true,
  };
  const r = parseFloat(inputs.radius);
  const h = parseFloat(inputs.height);
  if (isNaN(r) || isNaN(h)) {
    return { ...empty, errorMsg: "Please enter valid numbers for the radius and height." };
  }
  if (r <= 0 || h <= 0) {
    return { ...empty, errorMsg: "Radius and height must both be greater than zero." };
  }

  const slant = Math.sqrt(r * r + h * h);
  const volume = (Math.PI * r * r * h) / 3;
  const baseArea = Math.PI * r * r;
  const lateralArea = Math.PI * r * slant;
  const totalArea = baseArea + lateralArea;
  const total = baseArea + lateralArea;
  const basePct = (baseArea / total) * 100;

  return {
    radius: r, height: h, slant, volume, lateralArea, baseArea, totalArea,
    pieData: [
      { name: "Lateral Surface", value: lateralArea, pct: +(100 - basePct).toFixed(1), color: "hsl(var(--primary))" },
      { name: "Base", value: baseArea, pct: +basePct.toFixed(1), color: "#10b981" },
    ],
    isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: ConeInputs = { radius: "5", height: "10" };

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const CompactInput = ({
  id, label, value, onChange, suffix,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
      />
      <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const ConeCalculator = () => {
  const [inputs, setInputs] = useState<ConeInputs>(DEFAULTS);
  const [result, setResult] = useState<ConeResult>(() => calculateCone(DEFAULTS));

  useEffect(() => {
    setResult(calculateCone(DEFAULTS));
  }, []);

  const handleChange = (key: keyof ConeInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));
  const handleCalculate = () => setResult(calculateCone(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCone(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "What is a cone?", answer: "A cone is a three-dimensional shape with a circular base that tapers to a single point (apex). A right cone has its apex directly above the center of the base. Volume is one-third of the base area times the height: V = πr²h/3." },
    { question: "How is the slant height calculated?", answer: "The slant height is the straight-line distance from the rim of the base to the apex along the surface: l = √(r² + h²), using the Pythagorean theorem on the right triangle formed by the radius, height, and slant. It is needed for the lateral surface area, A = πrl." },
    { question: "Why is the cone volume one-third of a cylinder?", answer: "A cone with the same base and height as a cylinder fits exactly three times into it — a result proven with calculus by integration. This is why ice-cream cones hold a third of what a straight-sided cup of the same dimensions would." },
    { question: "What are the surface areas?", answer: "The base is a circle, A = πr². The lateral surface unrolls into a sector of a circle, A = πrl. Total surface area is the sum: πr² + πrl. For a cone with r = 5 and h = 10, that is 78.5 + 175.6 = 254.1 square units." },
    { question: "Where are cones used in real life?", answer: "Traffic cones, ice-cream cones, megaphones, funnels, and party hats are everyday examples. In engineering, cone-shaped hoppers guide bulk materials, rocket nozzles accelerate exhaust, and cone penetrometers test soil strength — all relying on these same geometric formulas." },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Cone Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cone Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="radius" label="Radius (r)" value={inputs.radius} onChange={(v) => handleChange("radius", v)} suffix="units" />
              <CompactInput id="height" label="Height (h)" value={inputs.height} onChange={(v) => handleChange("height", v)} suffix="units" />
            </div>
            <p className="text-xs text-muted-foreground -mt-1">Any consistent length unit works — cm, m, in, ft.</p>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 print-section">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Volume</div>
                  <div className="text-4xl font-bold text-primary">
                    {fmt(result.volume)} <span className="text-xl">units³</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    V = πr²h/3 = π × {fmt(result.radius)}² × {fmt(result.height)} ÷ 3
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Slant Height", value: fmt(result.slant), color: "text-primary" },
                    { label: "Lateral Area", value: fmt(result.lateralArea), color: "text-foreground" },
                    { label: "Total Area", value: fmt(result.totalArea), color: "text-emerald-600" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Cone Dimensions</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Radius (r)", value: fmt(result.radius) },
                        { label: "Height (h)", value: fmt(result.height) },
                        { label: "Slant Height (l)", value: fmt(result.slant) },
                        { label: "Volume", value: `${fmt(result.volume)} units³`, highlight: true },
                        { label: "Lateral Surface Area", value: `${fmt(result.lateralArea)} units²` },
                        { label: "Base Area", value: `${fmt(result.baseArea)} units²` },
                        { label: "Total Surface Area", value: `${fmt(result.totalArea)} units²` },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b last:border-0 ${r.highlight ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 text-right font-semibold">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Surface Area Split</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-[160px] h-[160px] relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RPie>
                          <Pie data={result.pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">
                            {result.pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: number, name: string) => [`${fmt(v as number)} units²`, name]} />
                        </RPie>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
                        <span className="text-sm font-extrabold text-foreground">{fmt(result.totalArea)}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      {result.pieData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground">{fmt(item.value)} ({item.pct.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Radius", value: fmt(result.radius) },
                      { label: "Height", value: fmt(result.height) },
                      { label: "Slant Height", value: fmt(result.slant) },
                      { label: "Volume", value: `${fmt(result.volume)} units³` },
                      { label: "Lateral Area", value: `${fmt(result.lateralArea)} units²` },
                      { label: "Base Area", value: `${fmt(result.baseArea)} units²` },
                      { label: "Total Area", value: `${fmt(result.totalArea)} units²` },
                      { label: "Lateral Share", value: `${result.pieData[0].pct.toFixed(1)}%` },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Cone Calculator?</h2>
            <p>A cone calculator computes the key dimensions of a right circular cone from its radius and height: volume, slant height, and the lateral, base, and total surface areas. Instead of juggling π and square roots by hand, you enter two numbers and get the complete geometric profile of the cone — whether it is an ice-cream cone, a traffic cone, or a tapered hopper.</p>

            <h2 className="text-2xl font-bold mb-3">The Formulas Behind the Results</h2>
            <p><strong>Volume:</strong> V = πr²h/3 — one-third of the enclosing cylinder. <strong>Slant height:</strong> l = √(r² + h²) — the hypotenuse of the right triangle made by the radius and height. <strong>Lateral surface area:</strong> A = πrl, the area of the unrolled sector. <strong>Base area:</strong> A = πr². <strong>Total surface area:</strong> the sum of the lateral and base areas.</p>

            <h2 className="text-2xl font-bold mb-3">Reading Your Results</h2>
            <p>The primary result card shows the volume — the amount the cone can hold. The three-stat bar gives the slant height and the two area totals at a glance. The breakdown table lists every dimension, and the donut chart shows how the total surface area splits between the curved lateral surface and the flat base, with both percentages summing to 100%.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Uses</h2>
            <p>Bakers and caterers estimate the capacity of cone-shaped molds and pastry horns; event planners size traffic cones and bases; builders calculate material for cone-shaped roofs and silo caps. In manufacturing, the same formulas determine the sheet-metal layout for a funnel or the volume of a cone-bottomed tank. Wherever a cone appears, these four numbers describe it completely.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cone-calculator" />
          <PopularCalculators exclude="/calculator/cone-calculator" />
        </div>
      </div>
    </>
  );
};

export default ConeCalculator;
