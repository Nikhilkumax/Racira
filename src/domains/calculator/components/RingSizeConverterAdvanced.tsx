"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface RingInputs {
  mode: "size" | "diameter";
  usSize: string;
  diameter: string;
}

interface RingEquivalents {
  us: string;
  uk: string;
  eu: number;
  jp: number;
  diameterMm: number;
  circumferenceMm: number;
}

interface RingRow {
  us: string;
  uk: string;
  eu: number;
  jp: number;
  diameter: number;
  circumference: number;
  isTarget: boolean;
}

interface RingResult {
  target: RingEquivalents;
  rows: RingRow[];
}

// ── 2. US size → inner diameter (mm), standard jewelers' table ──────────────
const US_SIZES: { us: string; diameter: number }[] = [
  { us: "3", diameter: 14.1 }, { us: "3.5", diameter: 14.5 },
  { us: "4", diameter: 14.9 }, { us: "4.5", diameter: 15.3 },
  { us: "5", diameter: 15.6 }, { us: "5.5", diameter: 16.0 },
  { us: "6", diameter: 16.5 }, { us: "6.5", diameter: 16.9 },
  { us: "7", diameter: 17.3 }, { us: "7.5", diameter: 17.7 },
  { us: "8", diameter: 18.1 }, { us: "8.5", diameter: 18.5 },
  { us: "9", diameter: 18.9 }, { us: "9.5", diameter: 19.3 },
  { us: "10", diameter: 19.7 }, { us: "10.5", diameter: 20.1 },
  { us: "11", diameter: 20.5 }, { us: "11.5", diameter: 20.9 },
  { us: "12", diameter: 21.3 }, { us: "12.5", diameter: 21.7 },
  { us: "13", diameter: 22.1 }, { us: "13.5", diameter: 22.5 },
  { us: "14", diameter: 22.9 },
];

const US_NAMES = US_SIZES.map((s) => s.us);

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: RingInputs = {
  mode: "size",
  usSize: "6",
  diameter: "16.5",
};

// ── 4. Pure calculation functions ───────────────────────────────────────────
function equivalentsFor(us: string, diameter: number): RingEquivalents {
  const circumference = diameter * Math.PI;
  return {
    us,
    uk: (parseFloat(us) - 0.5).toFixed(1).replace(/\.0$/, ""),
    eu: Math.round(circumference),
    jp: parseFloat(us) + 9,
    diameterMm: diameter,
    circumferenceMm: circumference,
  };
}

function calculate(inputs: RingInputs): RingResult {
  let targetUs: string;
  let targetDiameter: number;
  if (inputs.mode === "diameter") {
    const d = parseFloat(inputs.diameter);
    // nearest US size by diameter
    let best = US_SIZES[0];
    for (const s of US_SIZES) {
      if (Math.abs(s.diameter - d) < Math.abs(best.diameter - d)) best = s;
    }
    targetUs = best.us;
    targetDiameter = d;
  } else {
    const found = US_SIZES.find((s) => s.us === inputs.usSize) || US_SIZES[9];
    targetUs = found.us;
    targetDiameter = found.diameter;
  }

  const target = equivalentsFor(targetUs, targetDiameter);
  const rows: RingRow[] = US_SIZES.map((s) => {
    const circ = s.diameter * Math.PI;
    return {
      us: s.us,
      uk: (parseFloat(s.us) - 0.5).toFixed(1).replace(/\.0$/, ""),
      eu: Math.round(circ),
      jp: parseFloat(s.us) + 9,
      diameter: s.diameter,
      circumference: circ,
      isTarget: s.us === targetUs,
    };
  });
  return { target, rows };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const RingSizeConverterAdvanced = () => {
  const [inputs, setInputs] = useState<RingInputs>(DEFAULTS);
  const [result, setResult] = useState<RingResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (patch: Partial<RingInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const diameterParsed = parseFloat(inputs.diameter);
  const invalidDiameter = inputs.mode === "diameter" && (isNaN(diameterParsed) || diameterParsed <= 10 || diameterParsed > 26);

  const run = () => {
    if (invalidDiameter) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const t = result.target;
  const fmt = (n: number, dec = 1) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: dec });

  const chartData = result.rows.map((r) => ({
    name: r.us,
    circumference: parseFloat(r.circumference.toFixed(1)),
    isTarget: r.isTarget,
  }));

  const faqs = [
    { question: "How do I measure my ring size at home?", answer: "Wrap a piece of string or paper around the base of the finger, mark where it overlaps, and measure the length in millimeters. That length is your inner circumference, which maps directly to the EU (ISO) size — for example 51.8 mm is a US 6." },
    { question: "What is the difference between US, UK, and EU ring sizes?", answer: "US and UK sizes share a numbering scale where UK = US − 0.5 (a US 8 is a UK 7.5). EU sizes follow ISO 8653 and equal the inner circumference in millimeters, so an EU 52 ring fits a 52 mm circumference finger." },
    { question: "Why is the EU size about 52 for a US size 6?", answer: "Because the US 6 inner diameter is 16.5 mm, giving a circumference of 51.8 mm, which rounds to EU 52. The EU scale is simply the circumference measured in millimeters." },
    { question: "How accurate is the diameter-to-size match?", answer: "Ring sizes step by roughly 0.4 mm of diameter between half sizes. Measuring your finger circumference within 1 mm will place you within about a half size, which is why jewelers recommend measuring at the end of the day when fingers are slightly larger." },
    { question: "What ring size is average for women and men?", answer: "The average women's ring size is US 6–7, and the average men's ring size is US 9–10. These correspond to EU 52–54 and EU 60–62 respectively." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Ring Size Converter Advanced" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ring Size Converter Advanced</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="ring-us" className="text-sm font-medium text-foreground mb-1">US Ring Size</label>
                <select
                  id="ring-us"
                  value={inputs.usSize}
                  onChange={(e) => set({ usSize: e.target.value })}
                  className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {US_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="ring-dia" className="text-sm font-medium text-foreground mb-1">Inner Diameter (mm)</label>
                <input
                  id="ring-dia"
                  type="number"
                  min="10"
                  max="26"
                  step="0.1"
                  value={inputs.diameter}
                  onChange={(e) => set({ diameter: e.target.value })}
                  className={`h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${invalidDiameter ? "border-red-500" : ""}`}
                />
                {invalidDiameter && <p className="text-[11px] text-red-500 font-medium mt-1">Diameter must be 10–26 mm</p>}
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <div className="p-3 rounded-lg bg-secondary/20 border border-border mt-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Measurement Mode</div>
                <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                  <button
                    type="button"
                    onClick={() => set({ mode: "size" })}
                    className={`flex-1 text-sm font-semibold transition-colors ${inputs.mode === "size" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                  >
                    By US Size
                  </button>
                  <button
                    type="button"
                    onClick={() => set({ mode: "diameter" })}
                    className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${inputs.mode === "diameter" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                  >
                    By Diameter
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {inputs.mode === "size"
                    ? "US size drives the result; diameter shows the corresponding measurement."
                    : "Diameter drives the result; the nearest US size is matched automatically."}
                </p>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={run}
                disabled={invalidDiameter}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-4 print-section">
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">US Size {t.us} Equivalents</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">EU {t.eu}</div>
              <div className="text-sm text-muted-foreground font-medium">
                UK {t.uk} · JP {t.jp} · Ø {fmt(t.diameterMm)} mm · C {fmt(t.circumferenceMm, 1)} mm
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">UK Size</span>
                <span className="font-extrabold text-foreground">{t.uk}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Diameter</span>
                <span className="font-extrabold text-emerald-600">{fmt(t.diameterMm)} mm</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Circumference</span>
                <span className="font-extrabold text-primary">{fmt(t.circumferenceMm, 1)} mm</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">US</th>
                    <th className="p-2.5 text-right">UK</th>
                    <th className="p-2.5 text-right">EU (ISO)</th>
                    <th className="p-2.5 text-right">JP</th>
                    <th className="p-2.5 pr-3 text-right">Diameter (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((r) => (
                    <tr key={r.us} className={`hover:bg-secondary/20 transition-colors ${r.isTarget ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.isTarget ? "text-amber-700" : "text-foreground"}`}>{r.us}</td>
                      <td className={`p-2.5 text-right ${r.isTarget ? "text-amber-700 font-bold" : "text-foreground"}`}>{r.uk}</td>
                      <td className={`p-2.5 text-right ${r.isTarget ? "text-amber-700 font-bold" : "text-foreground"}`}>{r.eu}</td>
                      <td className={`p-2.5 text-right ${r.isTarget ? "text-amber-700 font-bold" : "text-foreground"}`}>{r.jp}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.isTarget ? "text-amber-700" : "text-foreground"}`}>{r.diameter.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Inner Circumference by US Size</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} width={40} />
                  <Tooltip formatter={(v: number) => [`${v} mm`, "Circumference"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="circumference" radius={[4, 4, 0, 0]} maxBarSize={16}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.isTarget ? "#f59e0b" : "hsl(var(--primary))"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Selected size highlighted in amber</p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "US Size", value: t.us },
                  { label: "UK Size", value: t.uk },
                  { label: "EU (ISO) Size", value: String(t.eu) },
                  { label: "Japanese Size", value: String(t.jp) },
                  { label: "Inner Diameter", value: `${fmt(t.diameterMm)} mm` },
                  { label: "Inner Circumference", value: `${fmt(t.circumferenceMm, 1)} mm` },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Ring Sizing Standards Compare</h2>
            <p>Ring sizing is complicated by the fact that the jewelry industry never settled on a single global standard. The United States and Canada use a numeric scale from 3 to 14 (and beyond) where each full size increases the inner diameter by roughly 0.8 mm and each half size by about 0.4 mm. The United Kingdom uses the same numbering but shifted by exactly half a size — a US 8 is a UK 7.5 — so conversion between the two is a simple subtraction. Japan assigns numbers that run about nine sizes higher than the US scale, and continental Europe follows ISO 8653, where the ring size is simply the inner circumference measured in millimeters, rounded to the nearest whole number.</p>
            <p>Because the EU scale is circumference-based, an EU 52 ring fits a finger measuring 52 mm around, which corresponds to a 16.5 mm inner diameter and a US size 6. This circumference-based system is the most physically intuitive and is increasingly adopted internationally because it can be measured directly with a strip of paper and a ruler. Understanding these relationships matters when shopping across borders: a size 8 ring purchased in New York will not fit if you order a UK 8 or an EU 8 — each of those is a completely different physical size.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring Accurately at Home</h2>
            <p>For the most reliable result, measure the finger at the end of the day when it is warm and slightly swollen, and always measure the specific finger that will wear the ring — sizes differ by a half size or more between fingers. Wrap a piece of non-stretch paper snugly around the base of the finger, mark the overlap, and measure the length in millimeters with a ruler. That measurement is your inner circumference. If you instead measure the internal diameter of an existing well-fitting ring, our calculator accepts that directly and matches it to the nearest US size using the standard jewelers' diameter table, then reports the UK, EU, and Japanese equivalents in one view.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ring-size-converter-advanced" />
          <PopularCalculators exclude="/calculator/ring-size-converter-advanced" />
        </div>
      </div>
    </>
  );
};

export default RingSizeConverterAdvanced;
