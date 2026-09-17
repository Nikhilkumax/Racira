"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, notation: n !== 0 && Math.abs(n) < 0.001 ? "scientific" : "standard" }).format(n);
}

const DEFAULTS = { mode: "h", h: "1e-7", ph: "7" };

export default function PhCalculator() {
  const [mode, setMode] = useState<"h" | "ph">(DEFAULTS.mode as "h" | "ph");
  const [hStr, setHStr] = useState(DEFAULTS.h);
  const [phStr, setPhStr] = useState(DEFAULTS.ph);
  const [calculated, setCalculated] = useState(false);

  const hIn = parseFloat(hStr);
  const phIn = parseFloat(phStr);

  const H = mode === "h" ? (isNaN(hIn) || hIn <= 0 ? NaN : hIn) : Math.pow(10, -phIn);
  const pH = mode === "h" ? -Math.log10(H) : phIn;
  const pOH = 14 - pH;
  const OH = Math.pow(10, -pOH);

  const valid = !isNaN(H) && !isNaN(pH) && pH >= -1 && pH <= 15;
  const classification = pH < 0 ? "Beyond scale — strong acid" : pH < 7 ? "Acidic" : pH === 7 ? "Neutral" : pH <= 14 ? "Basic (alkaline)" : "Beyond scale — strong base";

  const chartData = [
    { name: "H⁺", value: H, fill: "hsl(var(--primary))" },
    { name: "OH⁻", value: OH, fill: "#10b981" },
  ];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setMode(DEFAULTS.mode as "h" | "ph"); setHStr(DEFAULTS.h); setPhStr(DEFAULTS.ph); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";
  const seg = "flex-1 py-2 rounded-md text-sm font-semibold transition-all";

  const faqs = [
    { question: "What is pH?", answer: "pH is the negative base-10 logarithm of the hydrogen ion concentration: pH = −log₁₀[H⁺]. Each whole-number step is a tenfold change — a pH 4 solution has ten times the hydrogen ions of a pH 5 solution." },
    { question: "Why is the scale 0–14?", answer: "In water, the ion product [H⁺][OH⁻] is always 1×10⁻¹⁴ at 25 °C. That caps the useful range at 14 units: pH 0 is essentially pure strong acid, pH 14 pure strong base, and pH 7 sits exactly in the middle where [H⁺] = [OH⁻] = 1×10⁻⁷ M." },
    { question: "How do I convert between pH and [H⁺]?", answer: "From concentration to pH, take the negative log. Going the other way, raise 10 to the power of −pH: [H⁺] = 10⁻ᵖᴴ. Both directions are built into this calculator — switch the mode toggle to go either way." },
    { question: "Can pH be below 0 or above 14?", answer: "Concentrated acids and bases can push past the scale — a 10 M HCl solution has a pH around −1, and concentrated NaOH can exceed 14. The numbers still work; the scale just wasn't designed for them." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "pH Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">pH Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="flex gap-1 p-1 rounded-md bg-muted/60">
              <button onClick={() => setMode("h")} className={`${seg} ${mode === "h" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>From [H⁺]</button>
              <button onClick={() => setMode("ph")} className={`${seg} ${mode === "ph" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>From pH</button>
            </div>
            {mode === "h" ? (
              <div>
                <label className={lbl}>Hydrogen ion concentration [H⁺] (mol/L)</label>
                <input type="number" step="any" value={hStr} onChange={e => setHStr(e.target.value)} className={inp} placeholder="1e-7" />
              </div>
            ) : (
              <div>
                <label className={lbl}>pH value</label>
                <input type="number" step="any" min={-1} max={15} value={phStr} onChange={e => setPhStr(e.target.value)} className={inp} placeholder="7" />
              </div>
            )}
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Enter a positive concentration or a pH between −1 and 15.</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className={`${pH < 7 ? "bg-primary/10 border-l-4 border-primary" : pH === 7 ? "bg-muted/40 border-l-4 border-border" : "bg-emerald-500/10 border-l-4 border-emerald-500"} rounded-lg p-5`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${pH < 7 ? "text-primary" : pH === 7 ? "text-muted-foreground" : "text-emerald-600"}`}>pH · {classification}</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(pH, 2)}</div>
                <div className="text-sm text-muted-foreground mt-1">[H⁺] = {fmt(H)} M · pOH = {fmt(pOH, 2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["[H⁺]", `${fmt(H)} M`, "hydrogen ions"], ["[OH⁻]", `${fmt(OH)} M`, "hydroxide ions"], ["pOH", fmt(pOH, 2), "14 − pH"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold break-all">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Ion Concentrations</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" scale="log" domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: number) => [fmt(Number(v)) + " M", ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Log scale — at pH {fmt(pH, 1)} the two ions differ by {fmt(Math.abs(pH - pOH), 1)} orders of magnitude</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Conversion Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">pH:</span><span className="font-semibold">{fmt(pH, 2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Classification:</span><span className="font-semibold">{classification}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">[H⁺]:</span><span className="font-semibold">{fmt(H)} M</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">[OH⁻]:</span><span className="font-semibold">{fmt(OH)} M</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">pOH:</span><span className="font-semibold">{fmt(pOH, 2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Product check:</span><span className="font-semibold">{fmt(H * OH)} ≈ 1.0e-14</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Log Scale That Tames Chemistry</h2>
            <p>Hydrogen ion concentrations span fourteen orders of magnitude, from a mole-per-liter down to 10⁻¹⁴ — hopeless to eyeball raw, trivial on a log scale. This <strong>pH calculator</strong> converts between [H⁺] and pH in both directions and derives the full water-ion picture.</p>
            <h2 className="text-2xl font-bold mb-3">One Number, Four Values</h2>
            <p>Water's ion product links everything: once you know pH, pOH is 14 minus it, and both ion concentrations follow by inverting the log. The summary card shows all four and the product check that confirms the water equilibrium holds.</p>
            <h2 className="text-2xl font-bold mb-3">Acid, Base, or Neutral</h2>
            <p>The classification readout puts the number in context — below 7 is acidic, above 7 basic, and exactly 7 neutral at 25 °C. Keep in mind temperature shifts the neutral point: pure water at 0 °C sits at pH 7.47.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ph-calculator" />
          <PopularCalculators exclude="/calculator/ph-calculator" />
        </div>
      </div>
    </>
  );
}
