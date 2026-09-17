"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

// Standard US knitting needle sizes with exact metric (mm) diameters.
const US_SIZES: [string, number][] = [
  ["0", 2.0], ["1", 2.25], ["1.5", 2.5], ["2", 2.75], ["2.5", 3.0],
  ["3", 3.25], ["4", 3.5], ["5", 3.75], ["6", 4.0], ["7", 4.5],
  ["8", 5.0], ["9", 5.5], ["10", 6.0], ["10.5", 6.5], ["11", 8.0],
  ["13", 9.0], ["15", 10.0], ["17", 12.0], ["19", 15.0], ["35", 19.0],
  ["36", 20.0], ["50", 25.0],
];

interface NeedleResult {
  inputSize: number;
  inputUnit: string;
  mm: number;
  us: string;
  nearestUs: string;
  nearestMm: number;
  curve: { us: string; mm: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcNeedle(size: number, unit: string): NeedleResult {
  const mm = unit === "mm" ? size : (US_SIZES.find(([u]) => parseFloat(u) === size) || [null, 0])[1] as number;
  // nearest standard US size to an mm value
  let nearestUs = US_SIZES[0][0];
  let nearestMm = US_SIZES[0][1];
  let best = Infinity;
  for (const [u, m] of US_SIZES) {
    const d = Math.abs(m - mm);
    if (d < best) { best = d; nearestUs = u; nearestMm = m; }
  }
  const us = unit === "mm" ? nearestUs : String(size);
  const curve = US_SIZES.map(([u, m]) => ({ us: `US ${u}`, mm: m }));
  const breakdown = [
    { label: "Input Size", value: `${fmt(size, 1)} ${unit}` },
    { label: unit === "mm" ? "Closest US Size" : "Metric Diameter", value: unit === "mm" ? `US ${nearestUs}` : `${fmt(mm)} mm` },
    { label: unit === "mm" ? "Metric Diameter" : "Closest US Size", value: unit === "mm" ? `${fmt(mm)} mm` : `US ${nearestUs}` },
    { label: "Nearest Standard Diameter", value: `${fmt(nearestMm)} mm` },
    { label: "Size Difference", value: `${fmt(Math.abs(mm - nearestMm))} mm` },
    { label: "Standard Sizes in Table", value: `${US_SIZES.length}` },
  ];
  const summaryStats = [
    { label: "Converted Value", value: unit === "mm" ? `US ${nearestUs}` : `${fmt(mm)} mm` },
    { label: "Metric Diameter", value: `${fmt(mm)} mm` },
    { label: "US Size", value: `US ${us}` },
    { label: "Closest Standard", value: `US ${nearestUs} (${fmt(nearestMm)} mm)` },
    { label: "Nearest Match", value: best < 0.01 ? "Exact" : `${fmt(best)} mm off` },
    { label: "Range Covered", value: `US 0 – 50 (${fmt(US_SIZES[0][1])} – ${fmt(US_SIZES[US_SIZES.length - 1][1])} mm)` },
  ];
  return { inputSize: size, inputUnit: unit, mm, us, nearestUs, nearestMm, curve, breakdown, summaryStats };
}

const DEFAULTS = { size: "5", unit: "US" };

export default function KnittingNeedleConverter() {
  const [size, setSize] = useState(DEFAULTS.size);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<NeedleResult | null>(null);

  const sizeNum = parseFloat(size);
  const errs: string[] = [];
  if (isNaN(sizeNum) || sizeNum <= 0) errs.push("Enter a needle size greater than 0.");
  if (unit === "mm" && (sizeNum < 1.5 || sizeNum > 25)) errs.push("Metric sizes typically fall between 1.5 mm and 25 mm.");
  if (unit === "US" && !US_SIZES.some(([u]) => parseFloat(u) === sizeNum)) errs.push("Not a standard US size — the closest standard size is shown.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcNeedle(sizeNum, unit)); };
  const reset = () => {
    setSize(DEFAULTS.size); setUnit(DEFAULTS.unit);
    setResult(calcNeedle(5, "US"));
  };
  useEffect(() => { setResult(calcNeedle(5, "US")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do US and metric needle sizes compare?", answer: "US sizes are an arbitrary numbering system — larger numbers mean thicker needles. Metric sizes give the exact diameter in millimeters. US 0 is 2.0 mm, US 8 is 5.0 mm, and sizes continue up to US 50 (25 mm)." },
    { question: "Why do some patterns list both sizes?", answer: "Many yarn labels and patterns give both systems because US and metric needles differ between brands and countries. Converting is exact for standard sizes — the table on this page matches the Craft Yarn Council standards." },
    { question: "Can I use a slightly different size?", answer: "Yes — going up or down half a size changes gauge slightly, which is often used to hit the pattern's required stitches per inch. Gauge swatches matter more than the exact needle number." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Knitting Needle Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Knitting Needle Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Needle Size</label>
                <div className={inp}><input type="number" value={size} onChange={e => setSize(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Unit System</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className={sel}>
                  <option value="US">US</option>
                  <option value="mm">mm (metric)</option>
                </select>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{unit === "US" ? "Metric Diameter" : "US Needle Size"}</div>
                <div className="text-4xl font-extrabold tracking-tight">{unit === "US" ? `${fmt(result.mm)} mm` : `US ${result.nearestUs}`}</div>
                <div className="text-sm text-muted-foreground mt-1">{unit === "US" ? `US ${result.inputSize} = ${fmt(result.mm)} mm` : `${fmt(result.inputSize)} mm ≈ US ${result.nearestUs}`}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`US Size`, `US ${result.us}`], ["Metric", `${fmt(result.mm)} mm`], ["Closest Standard", `US ${result.nearestUs}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Conversion Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 1 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">US Size vs Metric Diameter</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="us" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={2} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} mm`, "Diameter"]} />
                    <Line type="monotone" dataKey="mm" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <ReferenceDot x={`US ${result.nearestUs}`} y={result.nearestMm} r={6} fill="#f59e0b" stroke="none" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Standard US sizes with the closest match to your input highlighted</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">US and Metric Needle Systems</h2>
            <p>This <strong>knitting needle converter</strong> translates between the US numbering system and exact metric diameters in millimeters. The conversion table follows the Craft Yarn Council standard, which pairs each US size with a precise mm measurement — for example US 5 equals 3.75 mm and US 8 equals 5.0 mm.</p>
            <h2 className="text-2xl font-bold mb-3">Non-Standard Sizes</h2>
            <p>If you enter a size that is not on the standard table, the converter finds the nearest standard size and reports the difference in millimeters. Sizes usually run in half-steps, so a quarter-millimeter gap is common and harmless.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing the Right Needle</h2>
            <p>Patterns specify a size to achieve the right gauge, but your personal tension matters more. If your gauge swatch is off, moving up or down a half size is the standard fix — and now you know exactly what that means in millimeters.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/knitting-needle-converter" />
          <PopularCalculators exclude="/calculator/knitting-needle-converter" />
        </div>
      </div>
    </>
  );
}
