"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, Shirt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
type Gender = "women" | "men";
type SizeSystem = "US" | "UK" | "EU" | "JP";

interface SizeInputs {
  gender: Gender;
  from: SizeSystem;
  to: SizeSystem;
  size: string;
}

interface SizeResult {
  gender: Gender;
  from: SizeSystem;
  to: SizeSystem;
  size: number;
  converted: number;
  all: Record<SizeSystem, number>;
  chartData: { name: string; size: number }[];
  clamped: boolean;
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Size tables (US → UK → EU → JP) ────────────────────────────────────
const WOMEN_TABLE: Record<SizeSystem, number[]> = {
  US: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
  UK: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
  EU: [32, 34, 36, 38, 40, 42, 44, 46, 48, 50],
  JP: [5, 7, 9, 11, 13, 15, 17, 19, 21, 23],
};

const MEN_TABLE: Record<SizeSystem, number[]> = {
  US: [34, 36, 38, 40, 42, 44, 46, 48],
  UK: [34, 36, 38, 40, 42, 44, 46, 48],
  EU: [44, 46, 48, 50, 52, 54, 56, 58],
  JP: [34, 36, 38, 40, 42, 44, 46, 48],
};

// Convert a size value in `from` array to the equivalent position in `to` array,
// linearly interpolating between whole sizes for in-between values.
function convertSize(value: number, from: SizeSystem, to: SizeSystem, gender: Gender): { converted: number; clamped: boolean } {
  const table = gender === "women" ? WOMEN_TABLE : MEN_TABLE;
  const arr = table[from];
  const out = table[to];
  let clamped = false;

  if (value <= arr[0]) return { converted: out[0], clamped: value < arr[0] };
  if (value >= arr[arr.length - 1]) return { converted: out[out.length - 1], clamped: value > arr[arr.length - 1] };

  let lo = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (value >= arr[i] && value <= arr[i + 1]) { lo = i; break; }
  }
  const span = arr[lo + 1] - arr[lo];
  const frac = span === 0 ? 0 : (value - arr[lo]) / span;
  const converted = +(out[lo] + (out[lo + 1] - out[lo]) * frac).toFixed(1);
  return { converted, clamped };
}

function calculateSizes(inputs: SizeInputs): SizeResult {
  const size = parseFloat(inputs.size);
  if (isNaN(size)) {
    return {
      gender: inputs.gender, from: inputs.from, to: inputs.to, size: 0, converted: 0,
      all: { US: 0, UK: 0, EU: 0, JP: 0 }, chartData: [], clamped: false, isError: true,
      errorMsg: "Please enter a valid size number.",
    };
  }
  const table = inputs.gender === "women" ? WOMEN_TABLE : MEN_TABLE;
  const all = { US: 0, UK: 0, EU: 0, JP: 0 } as Record<SizeSystem, number>;
  let clamped = false;
  (["US", "UK", "EU", "JP"] as SizeSystem[]).forEach((sys) => {
    const r = convertSize(size, inputs.from, sys, inputs.gender);
    all[sys] = r.converted;
    if (r.clamped) clamped = true;
  });
  const converted = all[inputs.to];
  const chartData = (["US", "UK", "EU", "JP"] as SizeSystem[]).map((sys) => ({ name: sys, size: all[sys] }));
  return { gender: inputs.gender, from: inputs.from, to: inputs.to, size, converted, all, chartData, clamped, isError: false };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: SizeInputs = { gender: "women", from: "US", to: "EU", size: "8" };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// ── 4. Component ──────────────────────────────────────────────────────────
const ClothingSizeConverter = () => {
  const [inputs, setInputs] = useState<SizeInputs>(DEFAULTS);
  const [result, setResult] = useState<SizeResult>(() => calculateSizes(DEFAULTS));

  useEffect(() => {
    setResult(calculateSizes(DEFAULTS));
  }, []);

  const handleChange = (key: keyof SizeInputs, val: string) => {
    const next = { ...inputs, [key]: val } as SizeInputs;
    setInputs(next);
  };

  const handleCalculate = () => setResult(calculateSizes(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateSizes(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const selectCls = "w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium";

  const faqs = [
    { question: "How do clothing sizes differ between countries?", answer: "There is no universal clothing size standard. US, UK, EU, and Japanese systems each use different scales — a US women's size 8 corresponds to UK 12, EU 40, and JP 13. This converter maps between them using standard conversion tables for dresses, tops, and suits." },
    { question: "Why is my EU size so much larger than my US size?", answer: "European women's sizes use a different numbering scale that starts around 32–34 for the smallest sizes, roughly 32 higher than the equivalent US size. This is normal — the numbers are not meant to match across systems." },
    { question: "What if my size falls between two standard sizes?", answer: "The converter interpolates between whole sizes, so a US 9 converts to UK 13, EU 41, and JP 14. When actually buying clothes, most retailers recommend rounding up to the next whole size for a more comfortable fit." },
    { question: "Are men's and women's conversions the same?", answer: "No. Men's suit and jacket sizes are based on chest measurement in inches, and US and UK men's sizes are identical while EU adds 10 (US 40 ≈ EU 50). Women's conversions follow a completely different scale, which is why this calculator has separate tables for each." },
    { question: "Are these conversions accurate for all brands?", answer: "Brands vary — a US 8 from one label can fit like a 6 or 10 from another due to vanity sizing. These tables reflect the widely used industry conversion standards and are a reliable starting point, but check each retailer's own size chart when the fit matters." },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Clothing Size Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Clothing Size Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div>
              <label className="text-sm font-medium mb-1">Clothing Type</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                {(["women", "men"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleChange("gender", g)}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      inputs.gender === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {g === "women" ? "Women's" : "Men's"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="from-system" className="text-sm font-medium mb-1">From System</label>
                <div className="relative h-10">
                  <select id="from-system" value={inputs.from} onChange={(e) => handleChange("from", e.target.value)} className={selectCls}>
                    {(["US", "UK", "EU", "JP"] as SizeSystem[]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="to-system" className="text-sm font-medium mb-1">To System</label>
                <div className="relative h-10">
                  <select id="to-system" value={inputs.to} onChange={(e) => handleChange("to", e.target.value)} className={selectCls}>
                    {(["US", "UK", "EU", "JP"] as SizeSystem[]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="size-value" className="text-sm font-medium mb-1">
                Size ({inputs.from})
              </label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <input
                  id="size-value"
                  type="number"
                  step="0.5"
                  value={inputs.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                  className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
                />
                <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{inputs.from}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {inputs.gender === "women" ? "Typical range: US 0–18" : "Typical range: US 34–48"}
              </p>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 print-section">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Size {fmt(result.size)} ({result.from}) in {result.to}
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {fmt(result.converted)} <span className="text-xl">{result.to}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.gender === "women" ? "Women's" : "Men's"} clothing conversion
                    {result.clamped && " — outside the standard table, clamped to the nearest listed size"}
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {(["US", "UK", "EU", "JP"] as SizeSystem[]).filter((s) => s !== result.from).map((s, i) => (
                    <div key={s} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s} Size</div>
                      <div className="text-base font-bold text-primary">{fmt(result.all[s])}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Size Equivalents</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {(["US", "UK", "EU", "JP"] as SizeSystem[]).map((sys) => (
                        <tr key={sys} className={`border-b last:border-0 ${sys === result.to ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{sys} Size</td>
                          <td className="py-2.5 text-right font-semibold">{fmt(result.all[sys])}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-bold">
                        <td className="py-2.5 text-muted-foreground">Entered ({result.from})</td>
                        <td className="py-2.5 text-right">{fmt(result.size)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Equivalent Sizes by System</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number) => [`Size ${fmt(value as number)}`, "Equivalent"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <Bar dataKey="size" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.name === result.to ? "hsl(var(--primary))" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#10b981" }} /> Other systems</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "hsl(var(--primary))" }} /> Target ({result.to})</span>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Entered Size", value: `${fmt(result.size)} (${result.from})` },
                      { label: "US Size", value: fmt(result.all.US) },
                      { label: "UK Size", value: fmt(result.all.UK) },
                      { label: "EU Size", value: fmt(result.all.EU) },
                      { label: "JP Size", value: fmt(result.all.JP) },
                      { label: "Clothing Type", value: result.gender === "women" ? "Women's" : "Men's" },
                      { label: "In-Range", value: result.clamped ? "No — clamped" : "Yes" },
                      { label: "Fit Guidance", value: "Round up if between sizes" },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Clothing Size Converter?</h2>
            <p>Shopping from international brands means confronting a tangle of size systems. A US women's 8 is a UK 12, an EU 40, and a Japanese 13 — four different numbers for the same garment. This converter translates your size between the US, UK, EU, and Japanese systems for both women's and men's clothing, so you can order with confidence from any store in the world.</p>

            <h2 className="text-2xl font-bold mb-3">How the Conversion Works</h2>
            <p>Select your clothing type (women's or men's), the size system you know, the system you are converting to, and enter your size. The calculator looks up your size in a standard industry conversion table and linearly interpolates when your size falls between two whole sizes — for example US 9 converts to UK 13, EU 41, and JP 14. The results panel shows every system side by side, with the target conversion highlighted in the primary result card.</p>
            <p>Women's conversions use the standard dress-size scale, where the US size runs roughly 0–18 and EU sizes run about 32–50. Men's conversions use the suit and jacket chest scale, where US and UK sizes are identical (measured in inches) and the EU size is the US size plus 10.</p>

            <h2 className="text-2xl font-bold mb-3">Sizing Systems Explained</h2>
            <p><strong>US sizes</strong> are the standard for American retailers. <strong>UK sizes</strong> run about four numbers higher for women (US 8 = UK 12). <strong>EU sizes</strong> run about 32 higher for women and are the dominant standard across Europe. <strong>JP sizes</strong> run five higher for women and match the US scale for men. Keep in mind that these are ready-to-wear standards — individual brands can shift a full size in either direction due to vanity sizing, so treat the result as a strong starting point and confirm with the retailer's chart.</p>

            <h2 className="text-2xl font-bold mb-3">Tips for International Shopping</h2>
            <p>When ordering from a new brand, check its specific size chart and, when possible, your bust, waist, and hip measurements rather than relying on the size label alone. If a conversion lands between two sizes, most shoppers prefer rounding up for tops and fitted items. For shoes and tailored clothing, measurements matter more than the converted number — use our measurement-based advanced converter for a fit driven by your actual body measurements.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/clothing-size-converter" />
          <PopularCalculators exclude="/calculator/clothing-size-converter" />
        </div>
      </div>
    </>
  );
};

export default ClothingSizeConverter;
