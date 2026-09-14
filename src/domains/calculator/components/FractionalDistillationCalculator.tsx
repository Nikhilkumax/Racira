"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, FlaskConical } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface DistillResult {
  lowBp: number;
  highBp: number;
  alpha: number;
  minPlates: number;
  ease: string;
}

// Fractional distillation: relative volatility from boiling points (Clausius–Clapeyron estimate),
// then minimum theoretical plates via Fenske equation.
function calcDistillation(lowBp: number, highBp: number): DistillResult {
  // Rough relative volatility estimate from boiling point difference (K): α ≈ exp(ΔT_bp / 28)
  const dT = Math.abs(highBp - lowBp);
  const alpha = Math.exp(dT / 28);
  // Fenske with typical x_D = 0.95, x_B = 0.05: N_min = log(α)⁻¹ · log((xD/(1-xD))·((1-xB)/xB))
  const minPlates = Math.max(1, Math.ceil(Math.log((0.95 / 0.05) * (0.95 / 0.05)) / Math.log(alpha)));
  let ease: string;
  if (dT > 50) ease = "Easy separation — large boiling-point gap";
  else if (dT > 20) ease = "Moderate separation — a few theoretical plates needed";
  else ease = "Difficult — narrow boiling-point gap needs many plates or vacuum";
  return { lowBp, highBp, alpha, minPlates, ease };
}

const DEFAULTS = { low: "78", high: "100" };

const faqs = [
  { question: "What is fractional distillation?", answer: "It separates a liquid mixture into components by repeatedly boiling and condensing. A fractionating column provides many vapor–liquid contact stages, each one enriching the vapor in the more volatile (lower-boiling) component." },
  { question: "How many plates does a column need?", answer: "The Fenske equation gives the minimum theoretical plates for a given separation: N_min = ln[(x_D/(1−x_D))·((1−x_B)/x_B)] / ln(α). Real columns need 1.5–2× the minimum because of inefficiency." },
  { question: "Why does a bigger boiling-point gap separate more easily?", answer: "The relative volatility α rises exponentially with the boiling-point difference. Ethanol (78°C) and water (100°C) have α ≈ 2.2 — close enough that an azeotrope stops pure ethanol. Methanol (65°C) vs water separates much more easily." },
];

export default function FractionalDistillationCalculator() {
  const [lowBp, setLowBp] = useState(DEFAULTS.low);
  const [highBp, setHighBp] = useState(DEFAULTS.high);
  const [result, setResult] = useState<DistillResult>(() => calcDistillation(78, 100));

  const handleCalculate = () => {
    const a = parseFloat(lowBp);
    const b = parseFloat(highBp);
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    setResult(calcDistillation(lo, hi));
  };

  const reset = () => {
    setLowBp(DEFAULTS.low);
    setHighBp(DEFAULTS.high);
    setResult(calcDistillation(78, 100));
  };

  const currentGap = Math.round(result.highBp - result.lowBp);
  const chartData = [5, 10, 15, 20, 30, 40, 60, 80].map((dT) => {
    const alpha = Math.exp(dT / 28);
    const plates = Math.max(1, Math.ceil(Math.log((0.95 / 0.05) * (0.95 / 0.05)) / Math.log(alpha)));
    return { name: `${dT}°C`, plates, isCurrent: dT === currentGap };
  });
  const breakdown = [
    { label: "Boiling-Point Gap (ΔT)", value: `${(result.highBp - result.lowBp).toFixed(1)} °C`, highlight: false },
    { label: "Relative Volatility (α)", value: `${result.alpha.toFixed(2)}`, highlight: false },
    { label: "Minimum Theoretical Plates", value: `${result.minPlates}`, highlight: true },
    { label: "Practical Column (≈1.75× min)", value: `${Math.max(2, Math.ceil(result.minPlates * 1.75))} plates`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fractional Distillation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fractional Distillation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <FlaskConical className="w-4 h-4" /> Separation Difficulty Estimator
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Lower Boiling Point (°C)</label>
                <input type="number" value={lowBp} onChange={(e) => setLowBp(e.target.value)} className="input-calc" placeholder="e.g. 78 (ethanol)" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Higher Boiling Point (°C)</label>
                <input type="number" value={highBp} onChange={(e) => setHighBp(e.target.value)} className="input-calc" placeholder="e.g. 100 (water)" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <FlaskConical className="w-4 h-4 text-primary" /> SEPARATION REQUIREMENT
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.minPlates}</span>
                <span className="text-sm text-muted-foreground">minimum theoretical plates</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.ease} — relative volatility α = {result.alpha.toFixed(2)}.</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Minimum Plates vs Boiling-Point Gap</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => `${value} plates`} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                    <Bar dataKey="plates" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.35)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3 italic">Highlighted bar is the current boiling-point gap — narrow gaps need far more plates.</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
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

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Common Mixtures</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Methanol (65°) / Water", value: "easy, α ≈ 3.7" },
                  { label: "Ethanol (78°) / Water", value: "moderate, α ≈ 2.2" },
                  { label: "Acetone (56°) / Water", value: "easy, α ≈ 4.8" },
                  { label: "Octane (126°) / Heptane (98°)", value: "moderate, α ≈ 2.7" },
                  { label: "Toluene (111°) / Benzene (80°)", value: "hard, α ≈ 2.3" },
                  { label: "Air (N₂ 77K) / O₂ 90K", value: "moderate, cryogenic" },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Fractional Distillation Calculator</h2>
            <p>Fractional distillation separates a liquid mixture by exploiting differences in boiling point. Vapor rising through a column condenses and re-evaporates at each plate, each cycle enriching the vapor in the more volatile component. The relative volatility α quantifies how easily two components separate — it grows exponentially with the boiling-point gap, which is why a 22 °C difference (ethanol/water, α ≈ 2.2) needs a tall column while a 44 °C difference separates easily.</p>
            <h3>The Fenske equation</h3>
            <p>For a target distillate purity of 95% and bottoms of 5%, the minimum number of theoretical plates is N_min = ln(361) / ln(α) ≈ 5.89 / ln(α). Real columns run at 1.5–2× the minimum because each plate only achieves a fraction of ideal equilibrium. This calculator applies that standard shortcut to give a quick feasibility read on any two-component mixture from just its boiling points.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fractional-distillation-calculator" />
          <PopularCalculators exclude="/calculator/fractional-distillation-calculator" />
        </div>
      </div>
    </>
  );
}
