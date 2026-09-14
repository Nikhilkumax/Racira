"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const PITCHES = [
  { id: "flat", label: "Flat (0–2/12)", factor: 1.0 },
  { id: "low", label: "Low (2/12–4/12)", factor: 1.1 },
  { id: "moderate", label: "Moderate (4/12–6/12)", factor: 1.2 },
  { id: "steep", label: "Steep (6/12+)", factor: 1.4 },
] as const;

const RAINFALLS = [
  { id: "light", label: "Light (1 in/hr)", rate: 1 },
  { id: "moderate", label: "Moderate (2 in/hr)", rate: 2 },
  { id: "heavy", label: "Heavy (3 in/hr)", rate: 3 },
  { id: "intense", label: "Intense (5 in/hr)", rate: 5 },
] as const;

interface GutterResult {
  area: number;
  pitchFactor: number;
  rainfall: number;
  adjustedArea: number;
  gpm: number;
  size: string;
  recommendation: string;
  chartData: { name: string; value: number }[];
}

// Gutter capacity (gpm) rule of thumb: 5" K-style ≈ 7.4 gpm per level ft² of roof adjusted area (rounded)
function calcGutter(area: number, pitchId: string, rainId: string): GutterResult {
  const pitch = PITCHES.find((p) => p.id === pitchId) ?? PITCHES[1];
  const rain = RAINFALLS.find((r) => r.id === rainId) ?? RAINFALLS[2];
  const adjustedArea = area * pitch.factor;
  const gpm = adjustedArea * rain.rate / 96; // 1 in/hr rain ≈ 0.0104 gpm per sq ft
  let size: string;
  let recommendation: string;
  if (gpm <= 7.4) {
    size = "5 in K-style";
    recommendation = "Standard 5-inch K-style gutters handle this load with level or slightly pitched runs.";
  } else if (gpm <= 12) {
    size = "6 in K-style";
    recommendation = "Upgrade to 6-inch gutters — 5-inch will overflow in this rainfall.";
  } else {
    size = "6 in + downspout upgrade";
    recommendation = "Consider 6-inch gutters with extra downspouts, or 7-inch for very heavy loads.";
  }
  const chartData = [
    { name: "Your Load", value: Number(gpm.toFixed(1)) },
    { name: "5 in Capacity", value: 7.4 },
    { name: "6 in Capacity", value: 12 },
  ];
  return { area, pitchFactor: pitch.factor, rainfall: rain.rate, adjustedArea, gpm, size, recommendation, chartData };
}

const DEFAULTS = { area: "1200", pitch: "low", rain: "heavy" };

const faqs = [
  { question: "How do I size gutters?", answer: "Compute the roof area feeding each gutter run, adjust for pitch (steeper roofs shed water faster), and multiply by rainfall intensity. If the resulting flow exceeds ~7.4 gpm, a 5-inch K-style gutter will overflow and you need 6-inch or more downspouts." },
  { question: "What is the 5-inch vs 6-inch gutter capacity?", answer: "A level 5-inch K-style gutter carries roughly 7.4 gallons per minute; a 6-inch carries about 12 gpm. Sloping the gutter toward the downspout increases capacity, as does adding downspouts — each downspout roughly doubles a run's effective capacity." },
  { question: "How many downspouts do I need?", answer: "Rule of thumb: one downspout per 600–800 sq ft of roof, and never let a single run exceed 30–35 ft of gutter. Corner runs, valleys, and heavy-rain regions warrant more." },
];

export default function GutterSizeCalculator() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [pitch, setPitch] = useState(DEFAULTS.pitch);
  const [rain, setRain] = useState(DEFAULTS.rain);
  const [result, setResult] = useState<GutterResult>(() => calcGutter(1200, "low", "heavy"));

  const handleCalculate = () => {
    const a = parseFloat(area);
    if (isNaN(a) || a <= 0) return;
    setResult(calcGutter(a, pitch, rain));
  };

  const reset = () => {
    setArea(DEFAULTS.area); setPitch(DEFAULTS.pitch); setRain(DEFAULTS.rain);
    setResult(calcGutter(1200, "low", "heavy"));
  };

  const breakdown = [
    { label: "Roof Area", value: `${result.area.toLocaleString()} sq ft`, highlight: false },
    { label: "Pitch Factor", value: `× ${result.pitchFactor}`, highlight: false },
    { label: "Adjusted Area", value: `${result.adjustedArea.toLocaleString()} sq ft`, highlight: false },
    { label: "Rainfall Intensity", value: `${result.rainfall} in/hr`, highlight: false },
    { label: "Flow Rate", value: `${result.gpm.toFixed(1)} gpm`, highlight: true },
    { label: "Recommended Gutter", value: result.size, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gutter Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gutter Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Droplets className="w-4 h-4" /> Gutter Sizing Estimator
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Roof Area Feeding Gutters (sq ft)</label>
                <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="input-calc" placeholder="1200" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Roof Pitch</label>
                <select value={pitch} onChange={(e) => setPitch(e.target.value)} className="input-calc">
                  {PITCHES.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Rainfall Intensity</label>
                <select value={rain} onChange={(e) => setRain(e.target.value)} className="input-calc">
                  {RAINFALLS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
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
                <Droplets className="w-4 h-4 text-primary" /> RECOMMENDED GUTTER
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.size}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.recommendation}</p>
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

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Load vs Capacity (gpm)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} gpm`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Gallons per Hour", value: `${(result.gpm * 60).toFixed(0)} gal/hr` },
                  { label: "Downspouts Suggested", value: `${Math.max(1, Math.ceil(result.adjustedArea / 700))}` },
                  { label: "Max Run Length", value: "30–35 ft per downspout" },
                  { label: "Tip", value: "Slope gutters ¼ in per 10 ft" },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Gutter Size Calculator</h2>
            <p>Gutters must move the water that falls on the roof they serve. The load calculation starts with the roof area draining into each run, adjusts upward for steeper pitch (faster runoff), and applies the local rainfall intensity — a 1 in/hr storm deposits roughly 0.0104 gallons per minute per square foot of roof. Sum the flow and compare it to gutter capacity: about 7.4 gpm for a level 5-inch K-style and 12 gpm for a 6-inch.</p>
            <h3>Beyond gutter width</h3>
            <p>Size alone isn't the whole story. Downspout count and placement matter just as much — each downspout resets a run's capacity, and runs over 30–35 feet overwhelm a single outlet even in modest rain. Sloping the gutter a quarter-inch per 10 feet toward the outlet measurably boosts capacity, and keeping gutters clean is non-negotiable: a clogged 6-inch gutter behaves like a 2-inch one. Sizing correctly at install prevents the most common homeowner complaint — water pouring over the fascia in heavy rain.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gutter-size-calculator" />
          <PopularCalculators exclude="/calculator/gutter-size-calculator" />
        </div>
      </div>
    </>
  );
}
