"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
type Gender = "women" | "men";
type Unit = "in" | "cm";

interface MeasureInputs {
  gender: Gender;
  unit: Unit;
  bust: string;
  waist: string;
  hip: string;
}

interface MeasureResult {
  gender: Gender;
  unit: Unit;
  bustIn: number;
  waistIn: number;
  hipIn: number;
  usSize: number;
  ukSize: number;
  euSize: number;
  jpSize: number;
  bustSize: number;
  waistSize: number;
  hipSize: number;
  chartData: { name: string; size: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Measurement → US size tables (women's ready-to-wear, inches) ───────
const WOMEN_US_SIZES = [0, 2, 4, 6, 8, 10, 12, 14, 16];
const WOMEN_BUST = [31.5, 32.5, 34, 35.5, 37, 38.5, 40, 41.5, 43];
const WOMEN_WAIST = [23.5, 24.5, 26, 27.5, 29, 30.5, 32, 33.5, 35];
const WOMEN_HIP = [33.5, 34.5, 36, 37.5, 39, 40.5, 42, 43.5, 45];

const MEN_US_SIZES = [34, 36, 38, 40, 42, 44, 46, 48];
const MEN_CHEST = [34, 36, 38, 40, 42, 44, 46, 48];
const MEN_WAIST = [28, 30, 32, 34, 36, 38, 40, 42];

const WOMEN_UK_OFFSET = 2; // US + 2
const WOMEN_EU_OFFSET = 32; // US + 32
const WOMEN_JP_OFFSET = 5; // US + 5
const MEN_EU_OFFSET = 10; // US + 10

const IN_PER_CM = 0.393701;

// Round measurement-derived size UP to the next even US size (standard "size up to fit").
function sizeFromMeasure(measureIn: number, table: number[], sizes: number[]): number {
  if (measureIn <= table[0]) return sizes[0];
  if (measureIn >= table[table.length - 1]) return sizes[sizes.length - 1];
  let lo = 0;
  for (let i = 0; i < table.length - 1; i++) {
    if (measureIn >= table[i] && measureIn <= table[i + 1]) { lo = i; break; }
  }
  const span = table[lo + 1] - table[lo];
  const frac = span === 0 ? 0 : (measureIn - table[lo]) / span;
  const continuous = sizes[lo] + (sizes[lo + 1] - sizes[lo]) * frac;
  return Math.ceil(continuous / 2) * 2;
}

function calculateSize(inputs: MeasureInputs): MeasureResult {
  const empty: MeasureResult = {
    gender: inputs.gender, unit: inputs.unit, bustIn: 0, waistIn: 0, hipIn: 0,
    usSize: 0, ukSize: 0, euSize: 0, jpSize: 0, bustSize: 0, waistSize: 0, hipSize: 0,
    chartData: [], isError: true,
  };

  const toIn = (v: string) => {
    const n = parseFloat(v);
    if (isNaN(n) || n <= 0) return null;
    return inputs.unit === "cm" ? n * IN_PER_CM : n;
  };

  const bust = toIn(inputs.bust);
  const waist = toIn(inputs.waist);
  const hip = inputs.gender === "women" ? toIn(inputs.hip) : null;

  const missing = [
    inputs.gender === "women" ? "bust, waist, and hip" : "chest and waist",
  ][0];
  if (bust === null || waist === null || (inputs.gender === "women" && hip === null)) {
    return { ...empty, errorMsg: `Please enter valid positive ${missing} measurements.` };
  }

  if (inputs.gender === "women") {
    const b = sizeFromMeasure(bust, WOMEN_BUST, WOMEN_US_SIZES);
    const w = sizeFromMeasure(waist, WOMEN_WAIST, WOMEN_US_SIZES);
    const h = sizeFromMeasure(hip as number, WOMEN_HIP, WOMEN_US_SIZES);
    const us = Math.max(b, w, h);
    return {
      gender: inputs.gender, unit: inputs.unit, bustIn: bust, waistIn: waist, hipIn: hip as number,
      usSize: us, ukSize: us + WOMEN_UK_OFFSET, euSize: us + WOMEN_EU_OFFSET, jpSize: us + WOMEN_JP_OFFSET,
      bustSize: b, waistSize: w, hipSize: h,
      chartData: [
        { name: "US", size: us }, { name: "UK", size: us + WOMEN_UK_OFFSET },
        { name: "EU", size: us + WOMEN_EU_OFFSET }, { name: "JP", size: us + WOMEN_JP_OFFSET },
      ],
      isError: false,
    };
  }

  const c = sizeFromMeasure(bust, MEN_CHEST, MEN_US_SIZES);
  const w = sizeFromMeasure(waist, MEN_WAIST, MEN_US_SIZES);
  const us = Math.max(c, w);
  return {
    gender: inputs.gender, unit: inputs.unit, bustIn: bust, waistIn: waist, hipIn: 0,
    usSize: us, ukSize: us, euSize: us + MEN_EU_OFFSET, jpSize: us,
    bustSize: c, waistSize: w, hipSize: 0,
    chartData: [
      { name: "US", size: us }, { name: "UK", size: us },
      { name: "EU", size: us + MEN_EU_OFFSET }, { name: "JP", size: us },
    ],
    isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: MeasureInputs = { gender: "women", unit: "in", bust: "36", waist: "28", hip: "38" };

const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const CompactInput = ({
  id, label, value, onChange, suffix,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step="0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
      />
      <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const ClothingSizeConverterAdvanced = () => {
  const [inputs, setInputs] = useState<MeasureInputs>(DEFAULTS);
  const [result, setResult] = useState<MeasureResult>(() => calculateSize(DEFAULTS));

  useEffect(() => {
    setResult(calculateSize(DEFAULTS));
  }, []);

  const handleChange = (key: keyof MeasureInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));

  const handleCalculate = () => setResult(calculateSize(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateSize(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "How do I take my measurements?", answer: "Use a soft measuring tape against bare or thin clothing. Bust: around the fullest part of your chest, keeping the tape level. Waist: around your natural waistline, just above the belly button. Hip: around the fullest part of your hips. Keep the tape snug but not tight." },
    { question: "Which measurement determines my size?", answer: "This calculator sizes you to your largest measurement — the standard practice so a garment fits the fullest part of your body. A 36-28-38 inch set of measurements (bust, waist, hip) maps to a US women's 8, for example, because all three land on size 8." },
    { question: "Why does my size vary between brands?", answer: "Ready-to-wear sizes are averages, and brands adjust them through 'vanity sizing' to make garments feel more flattering. A label that fits at US 8 in one store may fit like a 6 or 10 elsewhere. Measurements are the reliable anchor — use them with each retailer's size chart." },
    { question: "Do men's and women's sizing work the same way?", answer: "No. Women's sizing uses separate bust, waist, and hip scales, while men's suit and jacket sizes are driven by chest measurement in inches (with waist used for trousers). A men's US 40 refers to a 40-inch chest; a women's US 8 refers to a position on a dress-size scale." },
    { question: "Should I round up or down?", answer: "Round up. This calculator already rounds every measurement-derived size up to the next whole size for a comfortable fit, and it uses your largest measurement overall. If you are between sizes after that, most shoppers still prefer the larger size, especially for fitted garments that can be tailored down." },
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Clothing Size Converter Advanced" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Clothing Size Converter Advanced</h1>

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

            <div>
              <label className="text-sm font-medium mb-1">Measurement Unit</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                {(["in", "cm"] as Unit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleChange("unit", u)}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      inputs.unit === u ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {u === "in" ? "Inches (in)" : "Centimeters (cm)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="bust" label={inputs.gender === "women" ? "Bust" : "Chest"} value={inputs.bust} onChange={(v) => handleChange("bust", v)} suffix={inputs.unit} />
              <CompactInput id="waist" label="Waist" value={inputs.waist} onChange={(v) => handleChange("waist", v)} suffix={inputs.unit} />
            </div>
            {inputs.gender === "women" && (
              <div className="grid grid-cols-2 gap-3">
                <CompactInput id="hip" label="Hip" value={inputs.hip} onChange={(v) => handleChange("hip", v)} suffix={inputs.unit} />
                <div className="flex flex-col justify-end">
                  <div className="h-10 flex items-center rounded-md border border-border bg-secondary/20 px-3 text-sm text-muted-foreground">
                    <Ruler className="h-4 w-4 mr-2 text-primary" /> Snug, not tight
                  </div>
                </div>
              </div>
            )}

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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recommended US Size</div>
                  <div className="text-4xl font-bold text-primary">
                    {result.usSize} <span className="text-xl">US</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.gender === "women" ? "Women's" : "Men's"} — sized to your largest measurement for a comfortable fit
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "UK Size", value: String(result.ukSize) },
                    { label: "EU Size", value: String(result.euSize) },
                    { label: "JP Size", value: String(result.jpSize) },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className="text-base font-bold text-primary">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Measurement → Size Mapping</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Bust / Chest → Size", value: result.bustSize === 0 ? "—" : String(result.bustSize) },
                        { label: "Waist → Size", value: String(result.waistSize) },
                        ...(result.gender === "women" ? [{ label: "Hip → Size", value: String(result.hipSize) }] : []),
                        { label: "Recommended (largest)", value: String(result.usSize), highlight: true },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b last:border-0 ${r.highlight ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 text-right font-semibold">{r.value} US</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-bold">
                        <td className="py-2.5 text-muted-foreground">Equivalent (US → UK / EU / JP)</td>
                        <td className="py-2.5 text-right">{result.ukSize} / {result.euSize} / {result.jpSize}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Recommended Size by System</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number) => [`Size ${value}`, "Recommended"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <Bar dataKey="size" radius={[4, 4, 0, 0]} maxBarSize={60} fill="hsl(var(--primary))">
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.name === "US" ? "hsl(var(--primary))" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Bust / Chest", value: `${fmt(result.bustIn)} in` },
                      { label: "Waist", value: `${fmt(result.waistIn)} in` },
                      ...(result.gender === "women" ? [{ label: "Hip", value: `${fmt(result.hipIn)} in` }] : []),
                      { label: "US Size", value: String(result.usSize) },
                      { label: "UK Size", value: String(result.ukSize) },
                      { label: "EU Size", value: String(result.euSize) },
                      { label: "JP Size", value: String(result.jpSize) },
                      { label: "Fit Basis", value: "Largest measurement" },
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
            <h2 className="text-2xl font-bold mb-3">What Is a Measurement-Based Size Calculator?</h2>
            <p>Size labels are averages; your body is not. This advanced converter works from your actual bust, waist, and hip measurements to recommend a US size, then maps that size to UK, EU, and Japanese equivalents. Instead of trusting a label that varies between brands, you anchor the result to numbers you can measure at home in minutes.</p>

            <h2 className="text-2xl font-bold mb-3">How the Sizing Math Works</h2>
            <p>Each measurement is converted to a US size using standard ready-to-wear tables. A bust of 36 inches, for example, falls between the 35.5-inch (size 6) and 37-inch (size 8) marks, and the calculator rounds up to size 8. The recommended size is the largest of the per-measurement results, so the garment fits your fullest dimension — the same rule professional fitters use.</p>
            <p>From the US size, the converter applies the standard international offsets: UK adds 2, EU adds 32, and JP adds 5 for women's clothing. Men's suit and jacket sizes are driven by the chest measurement in inches, with the EU size equal to the US size plus 10.</p>

            <h2 className="text-2xl font-bold mb-3">Taking Accurate Measurements</h2>
            <p>Measure over bare skin or thin, close-fitting clothing. Wrap the tape around the fullest part of the bust, the natural waistline (just above the belly button), and the fullest part of the hips, keeping the tape level and snug — not tight. Work in inches or centimeters; the calculator converts automatically. For the most reliable result, measure twice and use the larger reading.</p>

            <h2 className="text-2xl font-bold mb-3">Sizing Up for International Shopping</h2>
            <p>Once you know your US size, international conversion is straightforward — but always check the retailer's own chart, since fit varies with fabric, cut, and brand standards. When in doubt, order the larger size; most garments can be taken in, but letting out is rarely possible.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/clothing-size-converter-advanced" />
          <PopularCalculators exclude="/calculator/clothing-size-converter-advanced" />
        </div>
      </div>
    </>
  );
};

export default ClothingSizeConverterAdvanced;
