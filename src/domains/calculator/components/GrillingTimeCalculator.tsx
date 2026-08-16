"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CUTS = [
  { id: "steak", label: "Steak (1 in thick)", minPerLb: 14, maxPerLb: 18, targetF: 135, note: "Rest 5 min before slicing" },
  { id: "chicken-breast", label: "Chicken Breast (bone-in)", minPerLb: 22, maxPerLb: 26, targetF: 165, note: "Cook until 165°F internal" },
  { id: "chicken-thigh", label: "Chicken Thigh", minPerLb: 25, maxPerLb: 30, targetF: 175, note: "Best at 175°F for tenderness" },
  { id: "pork-chop", label: "Pork Chop (1 in thick)", minPerLb: 18, maxPerLb: 22, targetF: 145, note: "Rest 3 min; 145°F is safe" },
  { id: "pork-shoulder", label: "Pork Shoulder (pulled pork)", minPerLb: 60, maxPerLb: 75, targetF: 203, note: "Low & slow, wrap at 165°F" },
  { id: "brisket", label: "Brisket", minPerLb: 60, maxPerLb: 75, targetF: 203, note: "Long cook; wrap to push stall" },
  { id: "ribs", label: "Pork Ribs", minPerLb: 45, maxPerLb: 60, targetF: 203, note: "3-2-1 method works great" },
  { id: "salmon", label: "Salmon Fillet", minPerLb: 15, maxPerLb: 20, targetF: 145, note: "Skin-side down first" },
  { id: "shrimp", label: "Shrimp (per side)", minPerLb: 2, maxPerLb: 3, targetF: 145, note: "Turns pink & opaque" },
] as const;

interface GrillResult {
  cutId: string;
  weight: number;
  minMin: number;
  maxMin: number;
  midMin: number;
  targetF: number;
  note: string;
  chartData: { name: string; value: number }[];
}

function calcGrill(weight: number, cutId: string): GrillResult {
  const cut = CUTS.find((c) => c.id === cutId) ?? CUTS[0];
  const minMin = cut.minPerLb * weight;
  const maxMin = cut.maxPerLb * weight;
  const midMin = (minMin + maxMin) / 2;
  const chartData = [
    { name: "Minimum", value: Number(minMin.toFixed(0)) },
    { name: "Target", value: Number(midMin.toFixed(0)) },
    { name: "Maximum", value: Number(maxMin.toFixed(0)) },
  ];
  return { cutId, weight, minMin, maxMin, midMin, targetF: cut.targetF, note: cut.note, chartData };
}

function fmtTime(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(min)} min`;
}

const DEFAULTS = { weight: "2", cut: "steak" };

const faqs = [
  { question: "How do I know when meat is done without a thermometer?", answer: "A thermometer is the only reliable way. Insert it into the thickest part away from bone: steak 130–135°F (medium-rare), chicken 165°F, pork 145°F, brisket 203°F. Visual cues — juices running clear, firmness — are unreliable." },
  { question: "Why do brisket and pulled pork take so long?", answer: "Tough cuts are full of collagen, which needs hours at 200–225°F to melt into gelatin. They cook by internal temperature, not time — 203°F is the target, and the 'stall' at 160°F can last hours as evaporative cooling balances the heat." },
  { question: "Should I rest meat after grilling?", answer: "Yes. Resting 5–15 minutes (longer for large roasts) lets juices redistribute — slicing immediately pours them onto the cutting board. The internal temperature also rises 5–10°F during rest, so pull meat 5°F below target." },
];

export default function GrillingTimeCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [cut, setCut] = useState(DEFAULTS.cut);
  const [result, setResult] = useState<GrillResult>(() => calcGrill(2, "steak"));

  const handleCalculate = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    setResult(calcGrill(w, cut));
  };

  const reset = () => {
    setWeight(DEFAULTS.weight);
    setCut(DEFAULTS.cut);
    setResult(calcGrill(2, "steak"));
  };

  const breakdown = [
    { label: "Cut", value: `${CUTS.find((c) => c.id === result.cutId)?.label ?? ""}`, highlight: false },
    { label: "Weight", value: `${result.weight} lb`, highlight: false },
    { label: "Target Internal Temp", value: `${result.targetF}°F`, highlight: false },
    { label: "Estimated Time", value: `${fmtTime(result.minMin)} – ${fmtTime(result.maxMin)}`, highlight: true },
    { label: "Midpoint", value: fmtTime(result.midMin), highlight: false },
    { label: "Pro Tip", value: result.note, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Grilling Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Grilling Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Flame className="w-4 h-4" /> Grill Time Estimator
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">What Are You Grilling?</label>
                <select value={cut} onChange={(e) => setCut(e.target.value)} className="input-calc">
                  {CUTS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Weight (lb)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-calc" placeholder="2" min={0} step="0.5" />
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
                <Flame className="w-4 h-4 text-primary" /> ESTIMATED GRILL TIME
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{fmtTime(result.minMin)} – {fmtTime(result.maxMin)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cook until internal temperature reaches {result.targetF}°F. {result.note}.
              </p>
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
              <h3 className="text-base font-bold mb-3">Time Range (minutes)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmtTime(v), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Grill Temp", value: "Medium-high (400°F) direct" },
                  { label: "Smoke Flavor", value: "Add wood chips early" },
                  { label: "Rest Before Serving", value: "5–15 min" },
                  { label: "Always Verify", value: "Thermometer, not time" },
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
            <h2 className="text-2xl font-bold mb-3">About the Grilling Time Calculator</h2>
            <p>Grill times depend on thickness, heat, and the cut's structure. Tender cuts like steak and chicken breast cook fast — 14–26 minutes per pound — while collagen-rich roasts like brisket and pork shoulder take 60–75 minutes per pound at low temperature. This calculator multiplies the per-pound rate for your cut by its weight and reports the practical range.</p>
            <h3>Time is a guide, temperature is the truth</h3>
            <p>Every estimate here assumes a medium grill and standard thickness — the real test is internal temperature: 130–135°F for medium-rare steak, 145°F for pork, 165°F for chicken, and 203°F for pulled pork and brisket. Resting raises the temperature another 5–10°F, so pull meat slightly early. Master the thermometer and the timing becomes a formality.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/grilling-time-calculator" />
          <PopularCalculators exclude="/calculator/grilling-time-calculator" />
        </div>
      </div>
    </>
  );
}
