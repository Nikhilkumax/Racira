"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface RingInputs {
  measurement: number; // mm
  method: string;      // "diameter" | "circumference"
  region: string;      // "us" | "uk" | "eu"
}

interface RingResults {
  diameterMm: number;
  circumferenceMm: number;
  usSize: number;
  ukSize: string;
  euSize: number;
  jpSize: number;
  chartData: { name: string; size: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const UK_LETTERS = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

// US size from inner diameter: US = (diameter - 14.86) / 0.84 + 4 (linear fit of standard sizing table)
function usFromDiameter(diaMm: number): number {
  return (diaMm - 14.86) / 0.84 + 4;
}

function calcRing(i: RingInputs): RingResults {
  const diameterMm = i.method === "diameter" ? i.measurement : i.measurement / Math.PI;
  const circumferenceMm = i.method === "circumference" ? i.measurement : i.measurement * Math.PI;
  const usSize = usFromDiameter(diameterMm);
  const ukNum = Math.round((usSize - 0.5) * 2) / 2;
  const ukIdx = Math.max(1, Math.min(26, Math.round(ukNum + 7)));
  const ukSize = UK_LETTERS[ukIdx] ?? "G";
  const euSize = Math.round(circumferenceMm);
  const jpSize = Math.round((diameterMm - 12.6) / 0.4);

  const sizes = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const chartData = sizes.map((s) => ({
    name: String(s),
    size: +(14.86 + (s - 4) * 0.84).toFixed(2),
    selected: Math.round(usSize) === s,
  }));

  const breakdown = [
    { label: "Inner Diameter", value: `${diameterMm.toFixed(1)} mm` },
    { label: "Inner Circumference", value: `${circumferenceMm.toFixed(1)} mm` },
    { label: "US Size", value: `${usSize.toFixed(1)}`, highlight: true, isTotal: true },
    { label: "UK Size (approx)", value: ukSize },
    { label: "EU Size", value: `${euSize}` },
    { label: "Japan Size", value: `${jpSize}` },
    { label: "Measurement Method", value: i.method === "diameter" ? "Ring inner diameter" : "Finger circumference" },
  ];

  const summaryStats = [
    { label: "US Size", value: `${usSize.toFixed(1)}` },
    { label: "UK Size", value: ukSize },
    { label: "EU Size", value: `${euSize}` },
    { label: "Japan Size", value: `${jpSize}` },
    { label: "Inner Diameter", value: `${diameterMm.toFixed(1)} mm` },
    { label: "Circumference", value: `${circumferenceMm.toFixed(1)} mm` },
    { label: "Region Display", value: i.region === "us" ? "US sizing" : i.region === "uk" ? "UK sizing" : "EU sizing" },
    { label: "Size Band", value: `${usSize.toFixed(1)} (US)` },
  ];

  return { diameterMm, circumferenceMm, usSize, ukSize, euSize, jpSize, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  measurement: "17.35",
  method: "diameter",
  region: "us",
};

// 4. Component
export default function RingSizeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<RingResults>(() => calcRing({ measurement: 17.35, method: "diameter", region: "us" }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcRing({ measurement: 17.35, method: "diameter", region: "us" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcRing({
        measurement: parseFloat(inputs.measurement) || 0,
        method: inputs.method,
        region: inputs.region,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRing({ measurement: 17.35, method: "diameter", region: "us" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const measurement = parseFloat(inputs.measurement) || 0;
  if (measurement < 10 || measurement > 30) errors.measurement = "Must be 10–30 mm";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I measure my ring size at home?", answer: "The reliable method: measure the inner diameter of a ring that fits the target finger, in millimeters, and enter it here. Alternatively, wrap a strip of paper snugly around the finger, mark the overlap, and measure that length in millimeters as the circumference. Measure in the evening — fingers swell during the day and are largest then." },
    { question: "What's the difference between US, UK, and EU ring sizes?", answer: "US sizes are numbers (4–13, with halves), UK sizes are letters (A–Z), and EU sizes are numbers based on inner circumference in millimeters. A US 7 is roughly a UK G (half-letter differences aside) and an EU 54. The calculator converts between all three plus the Japanese scale." },
    { question: "Why do my fingers measure differently at different times?", answer: "Finger size changes with temperature, time of day, hydration, and recent activity — easily a half size or more. Cold hands shrink, warm weather and exercise swell them. Measure at room temperature in the evening, and for engagement rings, size for the slightly larger reading to avoid a ring that's too snug." },
    { question: "How accurate is measuring a ring's inner diameter?", answer: "Very, if done carefully: place the ring flat and measure the inside edge-to-edge width at the widest point, in millimeters. A ruler with millimeter marks works, but calipers are more reliable. A US size step is only about 0.84 mm of diameter, so measure to the nearest 0.1 mm if you can." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Ring Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ring Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="measurement" className={lbl}>Measurement</label>
                <div className={inp}>
                  <input id="measurement" type="number" min="10" max="30" step="0.1" value={inputs.measurement} onChange={(e) => set("measurement")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">mm</span>
                </div>
                {errors.measurement && <p className="text-xs text-red-500 font-medium mt-1">{errors.measurement}</p>}
              </div>
              <div>
                <label htmlFor="method" className={lbl}>Measurement Type</label>
                <select id="method" value={inputs.method} onChange={(e) => set("method")(e.target.value)} className={sel}>
                  <option value="diameter">Ring inner diameter</option>
                  <option value="circumference">Finger circumference</option>
                </select>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sizing Standard</div>
                    <div>
                      <label htmlFor="region" className={lbl}>Display Region</label>
                      <select id="region" value={inputs.region} onChange={(e) => set("region")(e.target.value)} className={sel}>
                        <option value="us">US</option>
                        <option value="uk">UK</option>
                        <option value="eu">EU</option>
                      </select>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Ring Size (US)</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.usSize.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.diameterMm.toFixed(1)} mm diameter · {result.circumferenceMm.toFixed(1)} mm circumference
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["UK Size", `${result.ukSize}`],
                ["EU Size", `${result.euSize}`],
                ["Japan", `${result.jpSize}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Size Conversion</h3>
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
              <h3 className="text-base font-bold mb-4">Diameter by US Size</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)} mm`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="size" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Each US size step is only 0.84 mm of diameter — measure carefully.</p>
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
            <h2 className="text-2xl font-bold mb-3">Every System Measures the Same Finger</h2>
            <p>Ring sizing is one measurement wearing three hats: US sizes are a numeric scale tied to inner diameter, UK sizes use letters, and EU sizes use inner circumference in millimeters. The conversion is anchored on geometry — circumference = π × diameter — with standard tables for the labels. The calculator converts from either measurement type into all four major systems at once.</p>
            <h2 className="text-2xl font-bold mb-3">The Tolerance Is Tiny</h2>
            <p>A single US size step is 0.84 mm of diameter — about the thickness of two sheets of paper. That's why measuring matters so much: a 0.5 mm measurement error is a half size. Use the inner diameter of a ring that already fits, or a snug paper strip around the finger, and take the reading at the end of the day when fingers are at their largest.</p>
            <h2 className="text-2xl font-bold mb-3">Size Up for Comfort, Down for Fit</h2>
            <p>Wide bands (8+ mm) fit tighter than narrow ones of the same size because they press more skin — go up a half size. Knuckle-heavy fingers should size to pass the knuckle. And when in doubt for gifts, err toward the larger half size: most jewelers resize down easily but adding material is harder.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ring-size-calculator" />
          <PopularCalculators exclude="/calculator/ring-size-calculator" />
        </div>
      </div>
    </>
  );
}
