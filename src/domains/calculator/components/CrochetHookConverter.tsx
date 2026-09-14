"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface HookResult {
  inputLabel: string;
  inputMm: number;
  usLabel: string;
  metricLabel: string;
  alternative: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// US letter sizes mapped to millimeters (standard crochet hook gauge).
const US_TO_MM: [string, number][] = [
  ["B/1", 2.25], ["C/2", 2.75], ["D/3", 3.25], ["E/4", 3.5], ["F/5", 3.75],
  ["G/6", 4.0], ["7", 4.5], ["H/8", 5.0], ["I/9", 5.5], ["J/10", 6.0],
  ["K/10.5", 6.5], ["L/11", 8.0], ["M/N/13", 9.0], ["N/P/15", 10.0], ["P/Q", 15.0],
];

function mmToUs(mm: number): string {
  let best = US_TO_MM[0];
  for (const [label, size] of US_TO_MM) {
    if (Math.abs(size - mm) < Math.abs(best[1] - mm)) best = [label, size];
  }
  return best[0];
}

function calcHook(input: string, system: string): HookResult {
  let mm: number;
  let inputLabel: string;
  if (system === "us") {
    const entry = US_TO_MM.find(([l]) => l.toLowerCase() === input.trim().toLowerCase());
    mm = entry ? entry[1] : parseFloat(input);
    inputLabel = entry ? `US ${entry[0]}` : `${input} (treated as mm)`;
  } else {
    mm = parseFloat(input);
    inputLabel = `${mm.toFixed(2)} mm`;
  }

  const usLabel = mmToUs(mm);
  const usEntry = US_TO_MM.find(([l]) => l === usLabel);
  const metricLabel = `${mm.toFixed(2)} mm`;
  const nearestIndex = US_TO_MM.findIndex(([l]) => l === usLabel);
  const alternative = nearestIndex > 0 && nearestIndex < US_TO_MM.length - 1
    ? `Sizes ${US_TO_MM[nearestIndex - 1][0]} (${US_TO_MM[nearestIndex - 1][1].toFixed(2)} mm) and ${US_TO_MM[nearestIndex + 1][0]} (${US_TO_MM[nearestIndex + 1][1].toFixed(2)} mm)`
    : "No adjacent standard size";

  const chartData = US_TO_MM.map(([label, size]) => ({ name: label, value: size }));

  const breakdown = [
    { label: "Input", value: inputLabel },
    { label: "Metric Size", value: metricLabel },
    { label: "US Size", value: `US ${usLabel}` },
    { label: "Exact Gauge", value: usEntry ? `US ${usEntry[0]} = ${usEntry[1].toFixed(2)} mm` : `${mm.toFixed(2)} mm` },
    { label: "Nearest Standards", value: alternative },
    { label: "Yarn Weight Fit", value: yarnFit(mm) },
    { label: "Note", value: mm >= 9 ? "Jumbo hook — bulky/roving yarn" : mm >= 5 ? "Worsted/aran weight" : "Fingering/sport weight" },
  ];

  const summaryStats = [
    { label: "US Size", value: `US ${usLabel}` },
    { label: "Millimeters", value: `${mm.toFixed(2)} mm` },
    { label: "Yarn Weight", value: yarnFit(mm) },
    { label: "Exact Match", value: usEntry ? "Yes" : "Nearest" },
    { label: "Size Range", value: "2.25–15.0 mm" },
    { label: "Common Uses", value: "Amigurumi to blankets" },
  ];

  return { inputLabel, inputMm: mm, usLabel, metricLabel, alternative, chartData, breakdown, summaryStats };
}

function yarnFit(mm: number): string {
  if (mm >= 9) return "Super bulky / jumbo";
  if (mm >= 6.5) return "Bulky / chunky";
  if (mm >= 5) return "Worsted / aran";
  if (mm >= 4) return "DK / light worsted";
  if (mm >= 3.5) return "Sport";
  return "Fingering / sock";
}

const DEFAULTS = { input: "H/8", system: "us" };

export default function CrochetHookConverter() {
  const [input, setInput] = useState(DEFAULTS.input);
  const [system, setSystem] = useState(DEFAULTS.system);
  const [result, setResult] = useState<HookResult>(() => calcHook("H/8", "us"));

  const handleCalculate = () => {
    if (system === "mm" && isNaN(parseFloat(input))) return;
    setResult(calcHook(input, system));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleCalculate(); }, []);

  const reset = () => { setInput(DEFAULTS.input); setSystem(DEFAULTS.system); setResult(calcHook(DEFAULTS.input, DEFAULTS.system)); };
  const invalid = system === "mm" && isNaN(parseFloat(input));

  const faqs = [
    { question: "How do US and metric hook sizes compare?", answer: "US letter sizes are tied to a millimeter gauge — for example US H/8 equals 5.0 mm and US G/6 equals 4.0 mm. The US label varies slightly between brands, so the millimeter size is the reliable one." },
    { question: "Which hook size should I use?", answer: "Follow the yarn band's recommended gauge, then match the hook that gives the tension your pattern needs. Lighter yarns use smaller hooks (2–4 mm), worsted weight uses 5–5.5 mm, and bulky yarns use 8 mm and up." },
    { question: "Can I substitute hook sizes?", answer: "Yes, going one size up or down changes gauge roughly 10–15%. If your swatch is too tight, size up; too loose, size down. The closest US equivalents are listed for every metric size." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Crochet Hook Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Crochet Hook Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hk" className="block text-sm font-medium mb-1 text-foreground">Hook Size</label>
                <input id="hk" type="text" value={input} onChange={(e) => setInput(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. H/8 or 5.0" />
              </div>
              <div>
                <label htmlFor="sys" className="block text-sm font-medium mb-1 text-foreground">System</label>
                <select id="sys" value={system} onChange={(e) => setSystem(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="us">US letter / number</option>
                  <option value="mm">Millimeters (metric)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Enter a US letter (H/8, G/6) or a metric size (5.0 mm).</p>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Ruler className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a metric size in millimeters.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Equivalent Hook Size</div>
              <div className="text-4xl font-extrabold text-primary">US {result.usLabel}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.metricLabel} · {yarnFit(result.inputMm)} yarn · {result.alternative}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">US Size</div>
                <div className="text-lg font-bold text-primary">US {result.usLabel}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Millimeters</div>
                <div className="text-lg font-bold text-primary">{result.inputMm.toFixed(2)} mm</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Yarn Weight</div>
                <div className="text-lg font-bold text-primary">{yarnFit(result.inputMm)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">US Hook Sizes by Millimeter Gauge</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} unit=" mm" />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} mm`, "Gauge"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Crochet Hook Converter</h2>
            <p>Crochet hook sizes are labeled differently around the world: letter sizes in the US (H/8, G/6), metric millimeters elsewhere. Because US letter labels can vary slightly by brand, the millimeter gauge is the ground truth — this converter maps any size to both systems and the standard US hook range.</p>
            <h3>Choosing the Right Hook</h3>
            <p>Match the hook to your yarn's recommended gauge: fingering weight uses 2–4 mm hooks, worsted weight 5–5.5 mm, and bulky or jumbo yarns 8 mm and up. Swatching first always beats guessing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/crochet-hook-converter" />
          <PopularCalculators exclude="/calculator/crochet-hook-converter" />
        </div>
      </div>
    </>
  );
}
