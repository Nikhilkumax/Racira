"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface TurkeyInputs {
  weight: number;     // lb
  stuffed: boolean;
  thawMethod: string; // "fridge" | "water"
  restMin: number;
  ovenTemp: number;   // °F
  preheatMin: number;
}

interface TurkeyResults {
  roastMinPerLb: number;
  roastMin: number;
  restMin: number;
  totalMin: number;
  fridgeHrs: number;
  coldWaterMin: number;
  chartData: { name: string; minutes: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
// USDA-style roast rates by oven temp: unstuffed / stuffed minutes per pound
const RATES: Record<number, { unstuffed: number; stuffed: number }> = {
  300: { unstuffed: 15, stuffed: 17 },
  325: { unstuffed: 13, stuffed: 15 },
  350: { unstuffed: 12, stuffed: 14 },
};

function fmtHrM(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h} hr ${r} min` : `${r} min`;
}

function calcTurkey(i: TurkeyInputs): TurkeyResults {
  const rate = RATES[i.ovenTemp] ?? RATES[325];
  const roastMinPerLb = i.stuffed ? rate.stuffed : rate.unstuffed;
  const roastMin = i.weight * roastMinPerLb;
  const restMin = i.restMin;
  const totalMin = roastMin + restMin;
  const fridgeHrs = Math.ceil((i.weight / 4) * 24);
  const coldWaterMin = i.weight * 30;

  const chartData = [
    { name: "Roast", minutes: roastMin },
    { name: "Rest", minutes: restMin },
    { name: "Preheat", minutes: i.preheatMin },
  ];

  const breakdown = [
    { label: "Roasting Time", value: fmtHrM(roastMin), highlight: true, isTotal: true },
    { label: `Rate (${i.stuffed ? "stuffed" : "unstuffed"} @ ${i.ovenTemp}°F)`, value: `${roastMinPerLb} min/lb` },
    { label: "Resting Time", value: `${restMin} min` },
    { label: "Oven Preheat Allowance", value: `${i.preheatMin} min` },
    { label: "Oven Start → Table", value: fmtHrM(roastMin + i.preheatMin + restMin) },
    { label: "Thaw Time (Refrigerator)", value: `${fridgeHrs} hr (${Math.ceil(fridgeHrs / 24)} day(s))` },
    { label: "Thaw Time (Cold Water)", value: fmtHrM(coldWaterMin) },
  ];

  const summaryStats = [
    { label: "Weight", value: `${i.weight} lb` },
    { label: "Stuffing", value: i.stuffed ? "Stuffed" : "Unstuffed" },
    { label: "Oven Temperature", value: `${i.ovenTemp}°F` },
    { label: "Roast Time", value: fmtHrM(roastMin) },
    { label: "Rest Time", value: `${restMin} min` },
    { label: "Total (roast + rest)", value: fmtHrM(totalMin) },
    { label: "Fridge Thaw", value: `${fridgeHrs} hr` },
    { label: "Cold Water Thaw", value: fmtHrM(coldWaterMin) },
  ];

  return { roastMinPerLb, roastMin, restMin, totalMin, fridgeHrs, coldWaterMin, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  weight: "14",
  stuffed: "unstuffed",
  thawMethod: "fridge",
  restMin: "30",
  ovenTemp: "325",
  preheatMin: "20",
};

// 4. Component
export default function TurkeyRoastingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<TurkeyResults>(() => calcTurkey({ weight: 14, stuffed: false, thawMethod: "fridge", restMin: 30, ovenTemp: 325, preheatMin: 20 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcTurkey({ weight: 14, stuffed: false, thawMethod: "fridge", restMin: 30, ovenTemp: 325, preheatMin: 20 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcTurkey({
        weight: parseFloat(inputs.weight) || 0,
        stuffed: inputs.stuffed === "stuffed",
        thawMethod: inputs.thawMethod,
        restMin: parseFloat(inputs.restMin) || 0,
        ovenTemp: parseInt(inputs.ovenTemp, 10) || 325,
        preheatMin: parseFloat(inputs.preheatMin) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcTurkey({ weight: 14, stuffed: false, thawMethod: "fridge", restMin: 30, ovenTemp: 325, preheatMin: 20 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const weight = parseFloat(inputs.weight) || 0;
  const restMin = parseFloat(inputs.restMin) || 0;
  const preheatMin = parseFloat(inputs.preheatMin) || 0;
  if (weight < 4 || weight > 40) errors.weight = "Must be 4–40 lb";
  if (restMin < 0) errors.restMin = "Must be ≥ 0";
  if (preheatMin < 0) errors.preheatMin = "Must be ≥ 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How long should a turkey roast per pound?", answer: "At 325°F, plan 13 minutes per pound for an unstuffed turkey and 15 minutes per pound when stuffed. A 14 lb unstuffed bird takes about 3 hours 2 minutes. Always verify with a meat thermometer — the thickest part of the thigh must reach 165°F (74°C)." },
    { question: "Should I stuff the turkey before roasting?", answer: "Stuffed birds cook more slowly and carry more food-safety risk because the stuffing must also reach 165°F. If you stuff, add roughly 2 minutes per pound and check the stuffing temperature in the center before serving. Many cooks roast stuffing separately for safety and even cooking." },
    { question: "How do I thaw a frozen turkey?", answer: "Refrigerator thawing is safest: 24 hours per 4 pounds, so a 14 lb bird needs about 4 days. In a pinch, cold water thawing takes 30 minutes per pound — about 7 hours for 14 lb — changing the water every 30 minutes. Never thaw at room temperature." },
    { question: "Why rest the turkey after roasting?", answer: "Resting 20–30 minutes lets the juices redistribute through the meat instead of running out onto the cutting board. The internal temperature also rises 5–10°F during rest, so pull the bird a few degrees before 165°F and let carryover finish the job." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Turkey Roasting Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Turkey Roasting Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="weight" className={lbl}>Turkey Weight</label>
                <div className={inp}>
                  <input id="weight" type="number" min="4" max="40" step="0.5" value={inputs.weight} onChange={(e) => set("weight")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">lb</span>
                </div>
                {errors.weight && <p className="text-xs text-red-500 font-medium mt-1">{errors.weight}</p>}
              </div>
              <div>
                <label htmlFor="stuffed" className={lbl}>Stuffing</label>
                <select id="stuffed" value={inputs.stuffed} onChange={(e) => set("stuffed")(e.target.value)} className={sel}>
                  <option value="unstuffed">Unstuffed</option>
                  <option value="stuffed">Stuffed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="thawMethod" className={lbl}>Thawing Method</label>
                <select id="thawMethod" value={inputs.thawMethod} onChange={(e) => set("thawMethod")(e.target.value)} className={sel}>
                  <option value="fridge">Refrigerator</option>
                  <option value="water">Cold Water</option>
                </select>
              </div>
              <div>
                <label htmlFor="restMin" className={lbl}>Rest Time</label>
                <div className={inp}>
                  <input id="restMin" type="number" min="0" max="90" step="5" value={inputs.restMin} onChange={(e) => set("restMin")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">min</span>
                </div>
                {errors.restMin && <p className="text-xs text-red-500 font-medium mt-1">{errors.restMin}</p>}
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Oven Settings</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="ovenTemp" className={lbl}>Oven Temperature</label>
                        <select id="ovenTemp" value={inputs.ovenTemp} onChange={(e) => set("ovenTemp")(e.target.value)} className={sel}>
                          <option value="300">300°F (low)</option>
                          <option value="325">325°F (standard)</option>
                          <option value="350">350°F (hot)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="preheatMin" className={lbl}>Preheat Allowance</label>
                        <div className={inp}>
                          <input id="preheatMin" type="number" min="0" max="60" step="5" value={inputs.preheatMin} onChange={(e) => set("preheatMin")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">min</span>
                        </div>
                        {errors.preheatMin && <p className="text-xs text-red-500 font-medium mt-1">{errors.preheatMin}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Roasting Time at {inputs.ovenTemp}°F</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{fmtHrM(result.roastMin)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.roastMinPerLb} min/lb × {inputs.weight} lb · plus {result.restMin} min rest → serve in {fmtHrM(result.totalMin)}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Thaw (Fridge)", `${result.fridgeHrs} hr`],
                ["Thaw (Cold Water)", fmtHrM(result.coldWaterMin)],
                ["Rest After Roast", `${result.restMin} min`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Oven Timeline</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Oven Timeline (minutes)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v} min`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Roast time dominates the timeline; preheat and rest add buffer before serving.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">USDA Roasting Guidelines</h2>
            <p>Roast the turkey at 325°F, unstuffed, for 13 minutes per pound — 15 minutes per pound when stuffed. A 14 lb unstuffed bird therefore needs about 3 hours in the oven. Whatever the math says, the real deadline is temperature: the thickest part of the thigh must reach 165°F (74°C), and stuffed birds require the stuffing to hit 165°F too.</p>
            <h2 className="text-2xl font-bold mb-3">Plan the Thaw First</h2>
            <p>Most turkey mishaps are thawing problems, not roasting problems. Refrigerator thawing takes 24 hours per 4 pounds — start a 14 lb bird 4 days out. Cold water thawing is faster (30 minutes per pound, water changed every 30 minutes) but requires attention. Never thaw on the counter: the surface reaches unsafe temperatures while the center is still frozen.</p>
            <h2 className="text-2xl font-bold mb-3">Rest Before Carving</h2>
            <p>Resting 20–30 minutes lets the juices redistribute so they stay in the meat instead of pooling on the board. The internal temperature will also climb 5–10°F during rest (carryover cooking), so you can pull the bird when the thigh reads 160–162°F and let it finish on its own.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/turkey-roasting-time-calculator" />
          <PopularCalculators exclude="/calculator/turkey-roasting-time-calculator" />
        </div>
      </div>
    </>
  );
}
