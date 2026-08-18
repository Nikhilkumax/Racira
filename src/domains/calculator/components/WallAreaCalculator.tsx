"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WallInput {
  wallLength: number;
  wallHeight: number;
  windows: number;
  windowArea: number;
  doors: number;
  doorArea: number;
}

interface WallResult {
  grossArea: number;
  openingsArea: number;
  netArea: number;
  drywallSheets: number;
  paintGallons: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWall(input: WallInput): WallResult {
  const grossArea = input.wallLength * input.wallHeight;
  const openingsArea = input.windows * input.windowArea + input.doors * input.doorArea;
  const netArea = Math.max(0, grossArea - openingsArea);
  const drywallSheets = Math.ceil(netArea / 32); // 4x8 sheet = 32 sq ft
  const paintGallons = netArea > 0 ? Math.ceil(netArea / 350) : 0; // ~350 sq ft per gallon

  const donutData = [
    { name: "Net Wall Area", value: Number(Math.max(0, netArea).toFixed(0)), color: "hsl(var(--primary))" },
    { name: "Openings", value: Number(openingsArea.toFixed(0)), color: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Wall Length", value: `${input.wallLength.toFixed(1)} ft` },
    { label: "Wall Height", value: `${input.wallHeight.toFixed(1)} ft` },
    { label: "Gross Wall Area", value: `${grossArea.toFixed(1)} sq ft` },
    { label: "Windows", value: `${input.windows} × ${input.windowArea.toFixed(0)} sq ft` },
    { label: "Doors", value: `${input.doors} × ${input.doorArea.toFixed(0)} sq ft` },
    { label: "Openings Total", value: `${openingsArea.toFixed(1)} sq ft` },
    { label: "Net Paintable Area", value: `${netArea.toFixed(1)} sq ft` },
    { label: "Drywall Sheets (4×8)", value: `${drywallSheets} sheets` },
    { label: "Paint Needed", value: `${paintGallons} gallon(s)` },
  ];

  const summaryStats = [
    { label: "Gross Wall Area", value: `${grossArea.toFixed(1)} sq ft` },
    { label: "Net Area (after openings)", value: `${netArea.toFixed(1)} sq ft` },
    { label: "Openings", value: `${openingsArea.toFixed(1)} sq ft` },
    { label: "Drywall Sheets", value: `${drywallSheets}` },
    { label: "Paint Gallons", value: `${paintGallons}` },
    { label: "Paint Cost (est.)", value: `$${(paintGallons * 40).toLocaleString()}` },
  ];

  return { grossArea, openingsArea, netArea, drywallSheets, paintGallons, donutData, breakdown, summaryStats };
}

const DEFAULTS: WallInput = { wallLength: 20, wallHeight: 10, windows: 2, windowArea: 15, doors: 1, doorArea: 21 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WallAreaCalculator() {
  const [length, setLength] = useState(String(DEFAULTS.wallLength));
  const [height, setHeight] = useState(String(DEFAULTS.wallHeight));
  const [windows, setWindows] = useState(String(DEFAULTS.windows));
  const [windowArea, setWindowArea] = useState(String(DEFAULTS.windowArea));
  const [doors, setDoors] = useState(String(DEFAULTS.doors));
  const [doorArea, setDoorArea] = useState(String(DEFAULTS.doorArea));
  const [result, setResult] = useState<WallResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcWall({ wallLength: parse(length, DEFAULTS.wallLength), wallHeight: parse(height, DEFAULTS.wallHeight), windows: Math.round(parse(windows, DEFAULTS.windows)), windowArea: parse(windowArea, DEFAULTS.windowArea), doors: Math.round(parse(doors, DEFAULTS.doors)), doorArea: parse(doorArea, DEFAULTS.doorArea) }));
  const reset = () => {
    setLength(String(DEFAULTS.wallLength));
    setHeight(String(DEFAULTS.wallHeight));
    setWindows(String(DEFAULTS.windows));
    setWindowArea(String(DEFAULTS.windowArea));
    setDoors(String(DEFAULTS.doors));
    setDoorArea(String(DEFAULTS.doorArea));
    setResult(calcWall(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcWall(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I calculate wall area?", answer: "Multiply the wall's length by its height for the gross area, then subtract the area of windows and doors. A 20 ft × 10 ft wall is 200 sq ft; with two 15 sq ft windows and one 21 sq ft door, the net paintable area is 200 − 30 − 21 = 149 sq ft." },
    { question: "Why subtract doors and windows?", answer: "Openings don't need paint, drywall, or wallpaper. For paint estimates, subtract the full opening area. For drywall, many contractors subtract nothing because openings create extra cut-and-finish labor — ask your contractor which convention they use." },
    { question: "How much paint do I need per square foot?", answer: "A gallon of quality paint covers roughly 350–400 sq ft per coat. Two coats are standard for a color change. For 149 sq ft of net area, one gallon easily covers two coats; larger rooms need one gallon per ~175 sq ft for double coating." },
    { question: "How many drywall sheets do I need?", answer: "Standard drywall sheets are 4 ft × 8 ft = 32 sq ft (larger 4×10 and 4×12 sheets are available). Divide net wall area by 32 and round up. Add 10% for cut waste and offcuts — walls rarely divide evenly into 8-foot sheets." },
    { question: "What about the paint on trim and ceiling?", answer: "This calculator covers wall surfaces only. Trim, baseboards, doors, and ceilings each need separate estimates: a ceiling uses about the same gallonage as a similarly sized wall, and trim typically takes 1 gallon per 200–300 linear feet." },
    { question: "How do I measure an L-shaped or bay wall?", answer: "Measure each straight section separately and add them. For walls with angled ceilings, measure the average height (halfway between the low and high points). Break irregular walls into rectangles to keep the math accurate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction", href: "/calculator#construction" }, { label: "Wall Area Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Wall Area Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Wall Length</label>
                <div className={inp}><input type="number" value={length} onChange={(e) => setLength(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Wall Height</label>
                <div className={inp}><input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Windows</label>
                <div className={inp}><input type="number" value={windows} onChange={(e) => setWindows(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Avg Window Size</label>
                <div className={inp}><input type="number" value={windowArea} onChange={(e) => setWindowArea(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">sq ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Doors</label>
                <div className={inp}><input type="number" value={doors} onChange={(e) => setDoors(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Avg Door Size</label>
                <div className={inp}><input type="number" value={doorArea} onChange={(e) => setDoorArea(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">sq ft</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Wall Area</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.netArea.toFixed(1)} sq ft</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.drywallSheets} drywall sheets · {result.paintGallons} gallon(s) of paint</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Gross Area", `${result.grossArea.toFixed(1)} sq ft`], ["Openings", `${result.openingsArea.toFixed(1)} sq ft`], ["Net Area", `${result.netArea.toFixed(1)} sq ft`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Area Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Wall vs Openings</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString()} sq ft`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Measure Wall Area</h2>
            <p>Wall area is the length of each wall multiplied by its height, summed, minus the openings. Accurate measurement is the foundation of every paint, drywall, and wallpaper estimate. This calculator handles a single wall or an average wall with standard windows and doors — measure each wall separately and repeat for full rooms.</p>
            <h2 className="text-2xl font-bold mb-3">Painting Estimates</h2>
            <p>One gallon of paint covers approximately 350–400 sq ft per coat. Most repaints need two coats, so plan one gallon per 175 sq ft of net wall area. Higher-quality paints cover more; textured walls and drastic color changes absorb more. This calculator includes a conservative one-coat gallon count.</p>
            <h2 className="text-2xl font-bold mb-3">Drywall Requirements</h2>
            <p>Standard drywall panels are 4×8 feet (32 sq ft). Divide net area by 32 and round up, then add about 10% for cutting waste. Panels run horizontally on walls to reduce seam count. For a 149 sq ft net wall, plan on 5–6 sheets before waste — this calculator reports the raw count.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wall-area-calculator" />
          <PopularCalculators exclude="/calculator/wall-area-calculator" />
        </div>
      </div>
    </>
  );
}
