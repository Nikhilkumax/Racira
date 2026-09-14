"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Volume2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DecibelResult {
  l1: number;
  l2: number;
  combined: number;
  difference: number;
  intensityRatio: number;
  chartData: { name: string; value: number }[];
}

function calcDecibels(l1: number, l2: number): DecibelResult {
  const i1 = Math.pow(10, l1 / 10);
  const i2 = Math.pow(10, l2 / 10);
  const combined = 10 * Math.log10(i1 + i2);
  const difference = Math.abs(l1 - l2);
  const intensityRatio = i2 > 0 ? i1 / i2 : 0;
  const chartData = [
    { name: "Source 1", value: l1 },
    { name: "Source 2", value: l2 },
    { name: "Combined", value: combined },
  ];
  return { l1, l2, combined, difference, intensityRatio, chartData };
}

const DEFAULTS = { l1: "60", l2: "63" };

const faqs = [
  { question: "How do two sound levels combine?", answer: "Decibels do not add arithmetically — 60 dB + 60 dB = 63 dB, not 120 dB. Sound intensities add, then convert back: L = 10·log₁₀(10^(L1/10) + 10^(L2/10))." },
  { question: "What does a 3 dB increase mean?", answer: "Every 3 dB doubles the sound intensity (a ×2 ratio in power). To the ear it sounds noticeably louder, but not twice as loud — perceived loudness roughly doubles every 10 dB." },
  { question: "What are typical sound levels?", answer: "Quiet room 30–40 dB, conversation 60 dB, busy traffic 80 dB, loud concert 100–110 dB, jet takeoff 120–130 dB. Levels above 85 dB risk hearing damage with prolonged exposure." },
];

export default function DecibelCalculator() {
  const [l1, setL1] = useState(DEFAULTS.l1);
  const [l2, setL2] = useState(DEFAULTS.l2);
  const [result, setResult] = useState<DecibelResult>(() => calcDecibels(60, 63));

  useEffect(() => {
    const a = parseFloat(l1);
    const b = parseFloat(l2);
    if (!isNaN(a) && !isNaN(b) && a >= 0 && b >= 0) setResult(calcDecibels(a, b));
  }, []);

  const reset = () => { setL1(DEFAULTS.l1); setL2(DEFAULTS.l2); setResult(calcDecibels(parseFloat(DEFAULTS.l1), parseFloat(DEFAULTS.l2))); };
  const invalid = isNaN(parseFloat(l1)) || isNaN(parseFloat(l2)) || parseFloat(l1) < 0 || parseFloat(l2) < 0;

  const louder = result.l1 >= result.l2 ? "Source 1" : "Source 2";

  const breakdown = [
    { label: "Source 1 Level", value: `${result.l1.toFixed(1)} dB` },
    { label: "Source 2 Level", value: `${result.l2.toFixed(1)} dB` },
    { label: "Level Difference", value: `${result.difference.toFixed(1)} dB` },
    { label: "Intensity Ratio", value: `${result.intensityRatio.toFixed(2)}× (${louder} is louder)` },
    { label: "Combined Level", value: `${result.combined.toFixed(1)} dB`, highlight: true },
    { label: "Increase Over Loudest", value: `+${(result.combined - Math.max(result.l1, result.l2)).toFixed(1)} dB` },
  ];

  const summaryStats = [
    { label: "Combined Level", value: `${result.combined.toFixed(1)} dB` },
    { label: "Source 1", value: `${result.l1.toFixed(1)} dB` },
    { label: "Source 2", value: `${result.l2.toFixed(1)} dB` },
    { label: "Difference", value: `${result.difference.toFixed(1)} dB` },
    { label: "Intensity Ratio", value: `${result.intensityRatio.toFixed(2)}×` },
    { label: "vs Quiet Room (40 dB)", value: `${Math.pow(10, (result.combined - 40) / 10).toLocaleString("en-US", { maximumFractionDigits: 0 })}× the intensity` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Decibel Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Decibel Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="db-l1" className="block text-sm font-medium mb-1 text-foreground">Source 1 Level (dB)</label>
                <input id="db-l1" type="number" min="0" step="0.1" value={l1} onChange={(e) => setL1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="db-l2" className="block text-sm font-medium mb-1 text-foreground">Source 2 Level (dB)</label>
                <input id="db-l2" type="number" min="0" step="0.1" value={l2} onChange={(e) => setL2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Volume2 className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter non-negative sound levels.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Combined Sound Level</div>
              <div className="text-4xl font-extrabold text-primary">{result.combined.toFixed(1)} dB</div>
              <div className="text-sm text-muted-foreground mt-1">{result.l1.toFixed(0)} dB + {result.l2.toFixed(0)} dB · intensity ratio {result.intensityRatio.toFixed(2)}×</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Source 1</div>
                <div className="text-lg font-bold text-primary">{result.l1.toFixed(1)} dB</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Source 2</div>
                <div className="text-lg font-bold text-primary">{result.l2.toFixed(1)} dB</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Difference</div>
                <div className="text-lg font-bold text-primary">{result.difference.toFixed(1)} dB</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
              <h3 className="text-base font-bold mb-3">Source Levels vs Combined</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} dB`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
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
            <h2 className="text-2xl font-bold mb-3">About the Decibel Calculator</h2>
            <p>The decibel is a logarithmic measure of sound intensity relative to a reference. When two sources play together, their intensities (10^(L/10)) add, and the combined level is L = 10·log₁₀(10^(L1/10) + 10^(L2/10)). Two identical 60 dB sources therefore produce 63 dB, not 120 dB.</p>
            <h3>Reading Intensity Ratios</h3>
            <p>Each 3 dB is a doubling of intensity; each 10 dB is a tenfold increase and is perceived as roughly twice as loud. A level difference of 3 dB is barely noticeable in practice; 10 dB is clearly subjectively louder. The ratio column quantifies exactly how much more intense one source is than the other.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/decibel-calculator" />
          <PopularCalculators exclude="/calculator/decibel-calculator" />
        </div>
      </div>
    </>
  );
}
