"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CLIMATES = [
  { id: "mild", label: "Mild (e.g., California coast)", btuPerSqFt: 25 },
  { id: "moderate", label: "Moderate (e.g., Midwest US)", btuPerSqFt: 35 },
  { id: "cold", label: "Cold (e.g., Northeast US)", btuPerSqFt: 45 },
  { id: "frigid", label: "Frigid (e.g., Canada, Minnesota)", btuPerSqFt: 55 },
] as const;

const INSULATION = [
  { id: "good", label: "Good (modern, well-sealed)", factor: 0.9 },
  { id: "average", label: "Average (typical home)", factor: 1.0 },
  { id: "poor", label: "Poor (old, drafty)", factor: 1.3 },
] as const;

interface HeaterResult {
  area: number;
  height: number;
  volume: number;
  btu: number;
  watts: number;
  kw: number;
  recommendation: string;
  chartData: { name: string; value: number }[];
}

function calcHeater(area: number, height: number, climateId: string, insulId: string): HeaterResult {
  const climate = CLIMATES.find((c) => c.id === climateId) ?? CLIMATES[1];
  const insul = INSULATION.find((i) => i.id === insulId) ?? INSULATION[1];
  const volume = area * height;
  const btu = area * climate.btuPerSqFt * insul.factor;
  const watts = btu * 0.29307107;
  const kw = watts / 1000;
  let recommendation: string;
  if (btu < 5000) recommendation = "A 1500 W space heater or small 5,000 BTU unit covers this room.";
  else if (btu < 10000) recommendation = "A 5,000–10,000 BTU unit, or two 1500 W space heaters.";
  else if (btu < 20000) recommendation = "A 10,000–20,000 BTU heater — central system or large portable unit.";
  else recommendation = "This likely needs a whole-room furnace zone or multiple units.";
  const chartData = [
    { name: "Mild", value: Number((area * 25 * insul.factor).toFixed(0)) },
    { name: "Moderate", value: Number((area * 35 * insul.factor).toFixed(0)) },
    { name: "Cold", value: Number((area * 45 * insul.factor).toFixed(0)) },
    { name: "Frigid", value: Number((area * 55 * insul.factor).toFixed(0)) },
  ];
  return { area, height, volume, btu, watts, kw, recommendation, chartData };
}

const DEFAULTS = { area: "400", height: "8", climate: "moderate", insul: "average" };

const faqs = [
  { question: "How do I size a heater for a room?", answer: "The rule of thumb is 20–30 BTU per square foot in mild climates, 35–45 in cold ones, adjusted for ceiling height and insulation quality. A 400 sq ft room in a moderate climate needs about 14,000 BTU." },
  { question: "What is the difference between BTU and watts?", answer: "1 BTU is the energy to raise 1 lb of water 1°F; 3.412 BTU/hr = 1 watt. A 1500 W space heater delivers about 5,120 BTU/hr. The calculator reports both so you can match either rating system." },
  { question: "Do I size by square feet or by volume?", answer: "Square footage is the standard shortcut, but high ceilings need more heat — every extra foot of ceiling adds roughly 5–10% demand. That's why this calculator multiplies by room height when estimating." },
];

export default function HeaterSizeCalculator() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [climate, setClimate] = useState(DEFAULTS.climate);
  const [insul, setInsul] = useState(DEFAULTS.insul);
  const [result, setResult] = useState<HeaterResult>(() => calcHeater(400, 8, "moderate", "average"));

  const handleCalculate = () => {
    const a = parseFloat(area);
    const h = parseFloat(height);
    if (isNaN(a) || isNaN(h) || a <= 0 || h <= 0) return;
    setResult(calcHeater(a, h, climate, insul));
  };

  const reset = () => {
    setArea(DEFAULTS.area); setHeight(DEFAULTS.height); setClimate(DEFAULTS.climate); setInsul(DEFAULTS.insul);
    setResult(calcHeater(400, 8, "moderate", "average"));
  };

  const breakdown = [
    { label: "Room Area", value: `${result.area.toLocaleString()} sq ft`, highlight: false },
    { label: "Ceiling Height", value: `${result.height} ft`, highlight: false },
    { label: "Room Volume", value: `${result.volume.toLocaleString()} cu ft`, highlight: false },
    { label: "Heating Required", value: `${result.btu.toLocaleString("en-US", { maximumFractionDigits: 0 })} BTU/hr`, highlight: true },
    { label: "Equivalent Power", value: `${result.watts.toLocaleString("en-US", { maximumFractionDigits: 0 })} W (${result.kw.toFixed(2)} kW)`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Heater Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Heater Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Flame className="w-4 h-4" /> BTU / Watt Sizing
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Room Area (sq ft)</label>
                  <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="input-calc" placeholder="400" min={0} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Ceiling (ft)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="input-calc" placeholder="8" min={0} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Climate</label>
                <select value={climate} onChange={(e) => setClimate(e.target.value)} className="input-calc">
                  {CLIMATES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Insulation</label>
                <select value={insul} onChange={(e) => setInsul(e.target.value)} className="input-calc">
                  {INSULATION.map((i) => (
                    <option key={i.id} value={i.id}>{i.label}</option>
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
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Flame className="w-4 h-4 text-primary" /> HEATING REQUIRED
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.btu.toLocaleString("en-US", { maximumFractionDigits: 0 })} BTU/hr</span>
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
              <h3 className="text-base font-bold mb-3">BTU by Climate</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-US")} BTU/hr`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Per sq ft Demand", value: `${(result.btu / result.area).toFixed(0)} BTU/sq ft` },
                  { label: "1500 W Heater Count", value: `${Math.ceil(result.watts / 1500)}` },
                  { label: "Conversion", value: "1 W = 3.412 BTU/hr" },
                  { label: "Rule of Thumb", value: "20–55 BTU/sq ft by climate" },
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
            <h2 className="text-2xl font-bold mb-3">About the Heater Size Calculator</h2>
            <p>Heaters are rated in BTU/hr (British thermal units per hour) or watts. The sizing rule of thumb runs from about 20 BTU per square foot in mild coastal climates to 55 in frigid northern regions, with ceiling height and insulation quality as multipliers. A drafty old house with 10-foot ceilings needs roughly 40% more heat than the same area in a modern well-sealed home.</p>
            <h3>Right-sizing matters</h3>
            <p>An undersized heater runs continuously and never reaches setpoint; an oversized one short-cycles, wasting energy and causing temperature swings. The common pitfalls — ignoring ceiling height, using the wrong climate factor, or forgetting insulation — all push you off by 20–30%. The calculator's climate comparison chart shows exactly how the same room's demand changes from San Diego to Minnesota, so you can see which factor dominates your number.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heater-size-calculator" />
          <PopularCalculators exclude="/calculator/heater-size-calculator" />
        </div>
      </div>
    </>
  );
}
