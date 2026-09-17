"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface WallpaperInputs {
  wallLength: number; // ft
  wallHeight: number; // ft
  walls: number;
  rollCoverage: number; // sq ft per roll (double roll typical)
  deductions: number;   // sq ft for doors/windows
  wastePct: number;     // % pattern match / waste
}

interface WallpaperResults {
  grossArea: number;
  netArea: number;
  wasteArea: number;
  neededArea: number;
  rollsNeeded: number;
  sqftPerWall: number;
  chartData: { name: string; area: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcWallpaper(i: WallpaperInputs): WallpaperResults {
  const sqftPerWall = i.wallLength * i.wallHeight;
  const grossArea = sqftPerWall * i.walls;
  const netArea = Math.max(0, grossArea - i.deductions);
  const wasteArea = netArea * (i.wastePct / 100);
  const neededArea = netArea + wasteArea;
  const rollsNeeded = Math.ceil(neededArea / Math.max(1, i.rollCoverage));

  const chartData = [
    { name: "Net Area", area: Math.round(netArea) },
    { name: "Waste", area: Math.round(wasteArea) },
    { name: "Roll Coverage", area: Math.round(rollsNeeded * i.rollCoverage) },
  ];

  const breakdown = [
    { label: "Wall Dimensions", value: `${i.wallLength} ft × ${i.wallHeight} ft` },
    { label: `Walls to Cover (${i.walls})`, value: `${grossArea.toFixed(1)} sq ft` },
    { label: "Doors / Windows Deduction", value: `-${i.deductions.toFixed(1)} sq ft` },
    { label: "Net Wall Area", value: `${netArea.toFixed(1)} sq ft` },
    { label: `Waste / Pattern Match (${i.wastePct}%)`, value: `+${wasteArea.toFixed(1)} sq ft` },
    { label: "Area to Cover", value: `${neededArea.toFixed(1)} sq ft` },
    { label: `Roll Coverage (${i.rollCoverage} sq ft)`, value: `${rollsNeeded} rolls` },
    { label: "Total Rolls Needed", value: `${rollsNeeded} rolls`, highlight: true, isTotal: true },
  ];

  const summaryStats = [
    { label: "Rolls Needed", value: `${rollsNeeded}` },
    { label: "Gross Area", value: `${grossArea.toFixed(1)} sq ft` },
    { label: "Net Area", value: `${netArea.toFixed(1)} sq ft` },
    { label: "Waste Allowance", value: `${wasteArea.toFixed(1)} sq ft` },
    { label: "Area per Wall", value: `${sqftPerWall.toFixed(1)} sq ft` },
    { label: "Roll Coverage", value: `${i.rollCoverage} sq ft` },
    { label: "Waste %", value: `${i.wastePct}%` },
    { label: "Deductions", value: `${i.deductions.toFixed(1)} sq ft` },
  ];

  return { grossArea, netArea, wasteArea, neededArea, rollsNeeded, sqftPerWall, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  wallLength: "12",
  wallHeight: "8",
  walls: "4",
  rollCoverage: "56",
  deductions: "21",
  wastePct: "10",
};

// 4. Component
export default function WallpaperCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<WallpaperResults>(() => calcWallpaper({ wallLength: 12, wallHeight: 8, walls: 4, rollCoverage: 56, deductions: 21, wastePct: 10 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcWallpaper({ wallLength: 12, wallHeight: 8, walls: 4, rollCoverage: 56, deductions: 21, wastePct: 10 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcWallpaper({
        wallLength: parseFloat(inputs.wallLength) || 0,
        wallHeight: parseFloat(inputs.wallHeight) || 0,
        walls: parseFloat(inputs.walls) || 0,
        rollCoverage: parseFloat(inputs.rollCoverage) || 0,
        deductions: parseFloat(inputs.deductions) || 0,
        wastePct: parseFloat(inputs.wastePct) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcWallpaper({ wallLength: 12, wallHeight: 8, walls: 4, rollCoverage: 56, deductions: 21, wastePct: 10 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const wallLength = parseFloat(inputs.wallLength) || 0;
  const wallHeight = parseFloat(inputs.wallHeight) || 0;
  const walls = parseFloat(inputs.walls) || 0;
  const rollCoverage = parseFloat(inputs.rollCoverage) || 0;
  const wastePct = parseFloat(inputs.wastePct) || 0;
  if (wallLength <= 0) errors.wallLength = "Must be greater than 0";
  if (wallHeight <= 0) errors.wallHeight = "Must be greater than 0";
  if (walls < 1 || walls > 20) errors.walls = "Must be 1–20";
  if (rollCoverage <= 0) errors.rollCoverage = "Must be greater than 0";
  if (wastePct < 0 || wastePct > 50) errors.wastePct = "Must be 0–50%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much wallpaper do I need for a room?", answer: "Multiply wall length by height for one wall, then by the number of walls, subtract doors and windows, and add 10% for waste and pattern matching. A 12×8 ft room with four walls is about 384 sq ft gross, ~363 after a standard door deduction, and needs 7 double rolls at 56 sq ft each." },
    { question: "What does a double roll cover?", answer: "US wallpaper is usually sold as double rolls: 20.5 inches wide by 33 ft long, covering about 56 sq ft of wall — after trimming for selvage edges. A single roll (half that) covers 28 sq ft. Always check the label: coverage varies by manufacturer, and pattern repeats can reduce usable coverage substantially." },
    { question: "How much waste should I plan for?", answer: "Plain or drop-match patterns need 5–10% extra; large or half-drop pattern repeats can need 15–25% because each strip must align with the next. Doors and windows are deducted from gross area first, but you still need full strips around them — which is why the deduction is smaller than you'd think." },
    { question: "What if my walls are unusual?", answer: "Measure each wall's length separately and enter their total as one wall length with walls set to the number of separate runs — or simply enter total perimeter as wall length with one wall. Vaulted or angled walls need their own measurement: use the average height and add extra waste for the angles." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Wallpaper Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wallpaper Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wallLength" className={lbl}>Wall Length</label>
                <div className={inp}>
                  <input id="wallLength" type="number" min="1" step="0.5" value={inputs.wallLength} onChange={(e) => set("wallLength")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.wallLength && <p className="text-xs text-red-500 font-medium mt-1">{errors.wallLength}</p>}
              </div>
              <div>
                <label htmlFor="wallHeight" className={lbl}>Wall Height</label>
                <div className={inp}>
                  <input id="wallHeight" type="number" min="1" step="0.5" value={inputs.wallHeight} onChange={(e) => set("wallHeight")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.wallHeight && <p className="text-xs text-red-500 font-medium mt-1">{errors.wallHeight}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="walls" className={lbl}>Number of Walls</label>
                <div className={inp}>
                  <input id="walls" type="number" min="1" max="20" value={inputs.walls} onChange={(e) => set("walls")(e.target.value)} className={ci} />
                </div>
                {errors.walls && <p className="text-xs text-red-500 font-medium mt-1">{errors.walls}</p>}
              </div>
              <div>
                <label htmlFor="rollCoverage" className={lbl}>Roll Coverage</label>
                <div className={inp}>
                  <input id="rollCoverage" type="number" min="1" step="1" value={inputs.rollCoverage} onChange={(e) => set("rollCoverage")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                </div>
                {errors.rollCoverage && <p className="text-xs text-red-500 font-medium mt-1">{errors.rollCoverage}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Adjustments</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="deductions" className={lbl}>Doors / Windows Deduction</label>
                        <div className={inp}>
                          <input id="deductions" type="number" min="0" step="5" value={inputs.deductions} onChange={(e) => set("deductions")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">sq ft</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="wastePct" className={lbl}>Waste / Pattern Match</label>
                        <div className={inp}>
                          <input id="wastePct" type="number" min="0" max="50" step="5" value={inputs.wastePct} onChange={(e) => set("wastePct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.wastePct && <p className="text-xs text-red-500 font-medium mt-1">{errors.wastePct}</p>}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Rolls Needed</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.rollsNeeded} <span className="text-xl text-muted-foreground">rolls</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.netArea.toFixed(0)} sq ft net + {result.wasteArea.toFixed(0)} waste = {result.neededArea.toFixed(0)} sq ft
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Wall Area", `${result.grossArea.toFixed(0)} sq ft`],
                ["Net Area", `${result.netArea.toFixed(0)} sq ft`],
                ["Waste", `${result.wasteArea.toFixed(0)} sq ft`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Measurement Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Area vs Coverage</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                  <Tooltip formatter={(v: number) => `${v} sq ft`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="area" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Bought coverage exceeds needed area because rolls only come whole — the remainder is your buffer.</p>
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
            <h2 className="text-2xl font-bold mb-3">Measure Walls, Not the Room</h2>
            <p>Wallpaper covers walls, so the inputs are wall length and height, not floor area. Multiply per-wall area by the number of walls for gross area, subtract doors and windows, then add waste. The classic trap is buying for floor square footage — a 400 sq ft room can easily have 500+ sq ft of wall surface once all four sides are measured.</p>
            <h2 className="text-2xl font-bold mb-3">Waste Is Not Optional</h2>
            <p>Patterned wallpaper must be matched strip to strip, and every roll has trimmed edges and partial strips at corners and around openings. Plain paper needs ~5–10% waste; bold or half-drop patterns can eat 15–25%. Under-ordering by even one roll means a week-long delay and a possible dye-lot mismatch — buy the extra roll.</p>
            <h2 className="text-2xl font-bold mb-3">Coverage Labels Lie Slightly</h2>
            <p>A "double roll" covers about 56 sq ft of finished wall, but the label's number assumes perfect cutting with no pattern match. The calculator's roll coverage field defaults to 56 sq ft — enter the number from your specific roll, and remember that wallpaper is sold in double rolls far more often than singles, so a "roll" usually means two physical rolls.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wallpaper-calculator" />
          <PopularCalculators exclude="/calculator/wallpaper-calculator" />
        </div>
      </div>
    </>
  );
}
