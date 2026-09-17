"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface RoomVolumeInputs {
  length: string;
  width: string;
  height: string;
}

interface RoomVolumeResults {
  volumeFt3: number;
  volumeM3: number;
  liters: number;
  gallons: number;
  floorArea: number;
  wallArea: number;
  surfaceArea: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcRoom(i: RoomVolumeInputs): RoomVolumeResults | null {
  const l = parseFloat(i.length), w = parseFloat(i.width), h = parseFloat(i.height);
  if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0) return null;

  const volumeFt3 = l * w * h;
  const volumeM3 = volumeFt3 * 0.0283168;
  const liters = volumeFt3 * 28.3168;
  const gallons = volumeFt3 * 7.48052;
  const floorArea = l * w;
  const wallArea = 2 * (l + w) * h;
  const ceilingArea = floorArea;
  const surfaceArea = floorArea + ceilingArea + wallArea;

  const chartData = [
    { name: "Floor", value: Math.round(floorArea) },
    { name: "Ceiling", value: Math.round(ceilingArea) },
    { name: "Walls", value: Math.round(wallArea) },
  ];

  const breakdown = [
    { label: "Length", value: `${l} ft` },
    { label: "Width", value: `${w} ft` },
    { label: "Height", value: `${h} ft` },
    { label: "Room Volume", value: `${volumeFt3.toLocaleString("en-US", { maximumFractionDigits: 1 })} cu ft`, highlight: true, isTotal: true },
    { label: "Cubic Meters", value: `${volumeM3.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³` },
    { label: "Liters", value: `${liters.toLocaleString("en-US", { maximumFractionDigits: 0 })} L` },
    { label: "US Gallons", value: `${gallons.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal` },
    { label: "Floor Area", value: `${floorArea.toLocaleString()} sq ft` },
    { label: "Wall Area", value: `${wallArea.toLocaleString()} sq ft` },
  ];

  const summaryStats = [
    { label: "Room Volume", value: `${volumeFt3.toLocaleString("en-US", { maximumFractionDigits: 1 })} cu ft` },
    { label: "Cubic Meters", value: `${volumeM3.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³` },
    { label: "Liters", value: `${liters.toLocaleString("en-US", { maximumFractionDigits: 0 })} L` },
    { label: "US Gallons", value: `${gallons.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal` },
    { label: "Floor Area", value: `${floorArea.toLocaleString()} sq ft` },
    { label: "Wall Area", value: `${wallArea.toLocaleString()} sq ft` },
    { label: "Total Surface Area", value: `${surfaceArea.toLocaleString()} sq ft` },
    { label: "Air per Person (10 sq ft rule)", value: `serves ~${Math.max(1, Math.floor(floorArea / 10))}` },
  ];

  return { volumeFt3, volumeM3, liters, gallons, floorArea, wallArea, surfaceArea, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: RoomVolumeInputs = { length: "15", width: "12", height: "8" };

// 4. Component
export default function RoomVolumeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<RoomVolumeResults | null>(() => calcRoom(DEFAULTS));

  useEffect(() => {
    setResult(calcRoom(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcRoom(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRoom(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const l = parseFloat(inputs.length), w = parseFloat(inputs.width), h = parseFloat(inputs.height);
  if (!l || l <= 0 || l > 200) errors.length = "1–200 ft";
  if (!w || w <= 0 || w > 200) errors.width = "1–200 ft";
  if (!h || h <= 0 || h > 60) errors.height = "1–60 ft";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I calculate a room's volume?", answer: "Volume is length × width × height for a rectangular room — a 15 × 12 ft room with 8 ft ceilings holds 1,440 cubic feet. The calculator reports that same volume in cubic meters, liters, and US gallons using exact conversion factors, so you can match whichever unit your HVAC or sizing question uses." },
    { question: "Why would I need room volume instead of floor area?", answer: "Heating, cooling, and ventilation scale with volume, not floor area — a room with 10-foot ceilings needs more conditioned air than one with 8-foot ceilings over the same footprint. Air changes per hour (ACH) and duct sizing both start from the volume figure." },
    { question: "What are the exact conversion factors?", answer: "1 cubic foot = 0.0283168 cubic meters = 28.3168 liters = 7.48052 US gallons. The calculator applies these directly — 1,440 cu ft is 40.8 m³, 40,776 liters, or 10,772 US gallons." },
    { question: "How do I measure an irregular room?", answer: "Split it into rectangles: measure each section's length and width, compute each volume, and add them together. For L-shaped or angled rooms, the error from treating them as rectangles is usually small — under 5% — which rarely matters for HVAC sizing decisions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Room Volume Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Room Volume Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="length" className={lbl}>Length</label>
                <div className={inp}>
                  <input id="length" type="number" min="1" max="200" step="0.5" value={inputs.length} onChange={(e) => set("length")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.length && <p className="text-xs text-red-500 font-medium mt-1">{errors.length}</p>}
              </div>
              <div>
                <label htmlFor="width" className={lbl}>Width</label>
                <div className={inp}>
                  <input id="width" type="number" min="1" max="200" step="0.5" value={inputs.width} onChange={(e) => set("width")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.width && <p className="text-xs text-red-500 font-medium mt-1">{errors.width}</p>}
              </div>
              <div>
                <label htmlFor="height" className={lbl}>Height</label>
                <div className={inp}>
                  <input id="height" type="number" min="1" max="60" step="0.5" value={inputs.height} onChange={(e) => set("height")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ft</span>
                </div>
                {errors.height && <p className="text-xs text-red-500 font-medium mt-1">{errors.height}</p>}
              </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Room Volume</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? `${result.volumeFt3.toLocaleString("en-US", { maximumFractionDigits: 1 })} cu ft` : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `${inputs.length} × ${inputs.width} × ${inputs.height} ft room` : "Enter valid dimensions."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Cubic Meters", result ? `${result.volumeM3.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³` : "—"],
                ["Liters", result ? `${result.liters.toLocaleString("en-US", { maximumFractionDigits: 0 })} L` : "—"],
                ["US Gallons", result ? `${result.gallons.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal` : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Dimension Detail</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result?.breakdown.map((r, i) => (
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
              <h3 className="text-base font-bold mb-4">Surface Area Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result?.chartData ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--primary) / 0.55)" />
                    <Cell fill="hsl(var(--muted-foreground) / 0.25)" />
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v.toLocaleString()} sq ft`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Share of total surface area (floor + ceiling + walls) — the number paint and insulation estimates start from.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result?.summaryStats.map((s, i) => (
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
            <h2 className="text-2xl font-bold mb-3">Volume, Not Just Footprint</h2>
            <p>Floor area tells you how big a room feels; volume tells you how much air it holds. Heating and cooling load, ventilation air changes, duct sizing, and even paint coverage for a room all scale with the three-dimensional figure. A 15 × 12 ft room with 8 ft ceilings is 1,440 cubic feet — the number an HVAC contractor or a blower-door test actually works with.</p>
            <h2 className="text-2xl font-bold mb-3">Four Units, One Volume</h2>
            <p>Cubic feet is the natural unit for US construction, but HVAC equipment is rated in CFM (per minute), humidifiers in gallons, and some European specs in cubic meters or liters. All the conversions in the calculator are exact: one cubic foot is 0.0283168 cubic meters, 28.3168 liters, and 7.48052 US gallons — no rounding shortcuts.</p>
            <h2 className="text-2xl font-bold mb-3">From Volume to Surface</h2>
            <p>The same dimensions give the room's surface areas: floor and ceiling are length × width, and walls are the perimeter × height. Total surface area — floor plus ceiling plus walls — is the figure behind paint, paneling, and insulation estimates, and it is charted here as a clean distribution of the whole.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/room-volume-calculator" />
          <PopularCalculators exclude="/calculator/room-volume-calculator" />
        </div>
      </div>
    </>
  );
}
