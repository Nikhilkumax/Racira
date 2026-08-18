"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface PlywoodInputs {
  length: number;   // ft
  width: number;    // ft
  sheetSize: string; // "4x8" | "4x10"
  wastePct: number; // %
  pricePerSheet: number; // $
}

interface PlywoodResults {
  projectArea: number;
  sheetArea: number;
  wasteArea: number;
  totalArea: number;
  sheetsNeeded: number;
  totalCost: number;
  chartData: { name: string; area: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const SHEET_SIZES: Record<string, number> = { "4x8": 32, "4x10": 40 };

function calcPlywood(i: PlywoodInputs): PlywoodResults {
  const projectArea = i.length * i.width;
  const sheetArea = SHEET_SIZES[i.sheetSize] ?? 32;
  const wasteArea = projectArea * (i.wastePct / 100);
  const totalArea = projectArea + wasteArea;
  const sheetsNeeded = Math.ceil(totalArea / sheetArea);
  const totalCost = sheetsNeeded * i.pricePerSheet;

  const chartData = [
    { name: "Project Area", area: Math.round(projectArea) },
    { name: "With Waste", area: Math.round(totalArea) },
    { name: "Sheets Bought", area: sheetsNeeded * sheetArea },
  ];

  const breakdown = [
    { label: "Project Dimensions", value: `${i.length} ft × ${i.width} ft` },
    { label: "Project Area", value: `${projectArea.toFixed(1)} sq ft` },
    { label: `Waste Allowance (${i.wastePct}%)`, value: `+${wasteArea.toFixed(1)} sq ft` },
    { label: "Total Area to Cover", value: `${totalArea.toFixed(1)} sq ft` },
    { label: `Sheet Size (${i.sheetSize})`, value: `${sheetArea} sq ft` },
    { label: "Sheets Needed", value: `${sheetsNeeded} sheets`, highlight: true, isTotal: true },
    { label: `Price ($${i.pricePerSheet.toFixed(2)}/sheet)`, value: `$${totalCost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Sheets Needed", value: `${sheetsNeeded}` },
    { label: "Total Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Project Area", value: `${projectArea.toFixed(1)} sq ft` },
    { label: "Total Area (with waste)", value: `${totalArea.toFixed(1)} sq ft` },
    { label: "Sheet Size", value: `${i.sheetSize} (${sheetArea} sq ft)` },
    { label: "Waste Allowance", value: `${i.wastePct}%` },
    { label: "Extra Coverage", value: `${(sheetsNeeded * sheetArea - totalArea).toFixed(1)} sq ft` },
    { label: "Cost per Sq Ft", value: `$${(totalCost / Math.max(1, projectArea)).toFixed(3)}` },
  ];

  return { projectArea, sheetArea, wasteArea, totalArea, sheetsNeeded, totalCost, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  length: "20",
  width: "15",
  sheetSize: "4x8",
  wastePct: "10",
  pricePerSheet: "45",
};

// 4. Component
export default function PlywoodCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PlywoodResults>(() => calcPlywood({ length: 20, width: 15, sheetSize: "4x8", wastePct: 10, pricePerSheet: 45 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcPlywood({ length: 20, width: 15, sheetSize: "4x8", wastePct: 10, pricePerSheet: 45 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcPlywood({
        length: parseFloat(inputs.length) || 0,
        width: parseFloat(inputs.width) || 0,
        sheetSize: inputs.sheetSize,
        wastePct: parseFloat(inputs.wastePct) || 0,
        pricePerSheet: parseFloat(inputs.pricePerSheet) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcPlywood({ length: 20, width: 15, sheetSize: "4x8", wastePct: 10, pricePerSheet: 45 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const length = parseFloat(inputs.length) || 0;
  const width = parseFloat(inputs.width) || 0;
  const wastePct = parseFloat(inputs.wastePct) || 0;
  if (length <= 0) errors.length = "Must be greater than 0";
  if (width <= 0) errors.width = "Must be greater than 0";
  if (wastePct < 0 || wastePct > 50) errors.wastePct = "Must be 0–50%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How many sheets of plywood do I need?", answer: "Divide the project area (length × width) plus waste by the sheet area. A 20×15 ft project is 300 sq ft; with 10% waste that's 330 sq ft, needing 11 sheets of 4×8 (32 sq ft each). Sheets only come whole, so you always round up — the remainder is your cutting buffer." },
    { question: "Why add waste on top of the area?", answer: "Plywood is cut from full sheets, and real projects produce offcuts: you can't tile a 20×15 ft area perfectly with 4×8 rectangles, and some cuts will go wrong. A 10% allowance is standard for walls and subfloors; unusual layouts, angles, or grain matching push it toward 15–20%." },
    { question: "What sizes does plywood come in?", answer: "The standard sheet is 4×8 ft (32 sq ft), with 4×10 ft (40 sq ft) common for wall sheathing where fewer seams are wanted. Thickness runs 1/4 to 3/4 inch, and grade (CDX for subfloor, sanded for cabinets) matters more than size. Both sheet sizes are options here." },
    { question: "How much does a sheet of plywood cost?", answer: "3/4-inch CDX sheathing runs $35–55 per sheet in most of the US, while sanded cabinet-grade plywood is $45–75. Prices spiked sharply in recent years and vary by region and grade. The $45 default is a planning figure — check your lumberyard's current price before budgeting." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Plywood Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Plywood Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="length" className={lbl}>Project Length</label>
                <div className={inp}>
                  <input id="length" type="number" min="1" step="0.5" value={inputs.length} onChange={(e) => set("length")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.length && <p className="text-xs text-red-500 font-medium mt-1">{errors.length}</p>}
              </div>
              <div>
                <label htmlFor="width" className={lbl}>Project Width</label>
                <div className={inp}>
                  <input id="width" type="number" min="1" step="0.5" value={inputs.width} onChange={(e) => set("width")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.width && <p className="text-xs text-red-500 font-medium mt-1">{errors.width}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sheetSize" className={lbl}>Sheet Size</label>
                <select id="sheetSize" value={inputs.sheetSize} onChange={(e) => set("sheetSize")(e.target.value)} className={sel}>
                  <option value="4x8">4 × 8 ft (32 sq ft)</option>
                  <option value="4x10">4 × 10 ft (40 sq ft)</option>
                </select>
              </div>
              <div>
                <label htmlFor="wastePct" className={lbl}>Waste Allowance</label>
                <div className={inp}>
                  <input id="wastePct" type="number" min="0" max="50" step="5" value={inputs.wastePct} onChange={(e) => set("wastePct")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">%</span>
                </div>
                {errors.wastePct && <p className="text-xs text-red-500 font-medium mt-1">{errors.wastePct}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Budget</div>
                    <div>
                      <label htmlFor="pricePerSheet" className={lbl}>Price per Sheet</label>
                      <div className={inp}>
                        <span className="pl-3 text-muted-foreground text-sm">$</span>
                        <input id="pricePerSheet" type="number" min="1" step="5" value={inputs.pricePerSheet} onChange={(e) => set("pricePerSheet")(e.target.value)} className={ci} />
                      </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Sheets Needed</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.sheetsNeeded} <span className="text-xl text-muted-foreground">sheets</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.projectArea.toFixed(0)} sq ft project + {result.wasteArea.toFixed(0)} waste · ${result.totalCost.toFixed(2)} total
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Project Area", `${result.projectArea.toFixed(0)} sq ft`],
                ["Total with Waste", `${result.totalArea.toFixed(0)} sq ft`],
                ["Total Cost", `$${result.totalCost.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Order Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Area vs Sheets Bought</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                  <Tooltip formatter={(v: number) => `${v} sq ft`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="area" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Sheets bought exceed the need because plywood only comes whole — the surplus is offcut stock.</p>
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
            <h2 className="text-2xl font-bold mb-3">Sheets Are the Unit That Matters</h2>
            <p>Projects are measured in square feet, but lumberyards sell plywood in whole sheets. The math is: (project area + waste) ÷ sheet area, rounded up. A 300 sq ft project with 10% waste and 32 sq ft sheets needs 11 sheets — even though 330 ÷ 32 is 10.3, the 11th sheet is unavoidable because sheets don't come in fractions.</p>
            <h2 className="text-2xl font-bold mb-3">Waste Is Layout Reality</h2>
            <p>Rectangles don't tile perfectly: a 20×15 ft wall sheathed with 4×8 sheets leaves partial bays at the edges, and every door or window opening creates cutouts that rarely yield usable offcuts. The 10% default covers standard layouts; complex framing, sloped walls, or grain-matched panels push waste toward 20%.</p>
            <h2 className="text-2xl font-bold mb-3">Buy the Right Grade, Not Just the Count</h2>
            <p>Count is only half the order. Subfloor and wall sheathing use CDX (construction grade with exterior glue); cabinet and furniture work needs sanded, void-free panels that cost 50% more per sheet. The price field in Advanced Options lets you model either — CDX near $45, cabinet-grade near $70.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/plywood-calculator" />
          <PopularCalculators exclude="/calculator/plywood-calculator" />
        </div>
      </div>
    </>
  );
}
