"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ROOM_LUX: Record<string, number> = {
  "Living Room": 150, "Bedroom": 150, "Kitchen": 300, "Bathroom": 300,
  "Home Office": 500, "Dining Room": 200, "Hallway": 100, "Garage": 100, "Reading Nook": 500,
};

interface LumensResult {
  room: string;
  lux: number;
  length: number;
  width: number;
  area: number;
  uf: number;
  mf: number;
  lumens: number;
  bulbs800: number;
  bulbs1600: number;
  wattsLed: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 1): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcLumens(room: string, length: number, width: number, uf: number, mf: number): LumensResult {
  const lux = ROOM_LUX[room] || 150;
  const area = length * width;
  const lumens = (lux * area) / (uf * mf);
  const bulbs800 = Math.ceil(lumens / 800);
  const bulbs1600 = Math.ceil(lumens / 1600);
  const wattsLed = Math.ceil(lumens / 100) * 10; // ~100 lm/W typical LED efficacy
  const breakdown = [
    { label: "Room Type", value: room },
    { label: "Recommended Illuminance", value: `${lux} lux` },
    { label: "Room Dimensions", value: `${fmt(length)} m × ${fmt(width)} m` },
    { label: "Floor Area", value: `${fmt(area, 2)} m²` },
    { label: "Utilization Factor", value: `${fmt(uf, 2)}` },
    { label: "Maintenance Factor", value: `${fmt(mf, 2)}` },
    { label: "Required Lumens", value: `${fmt(lumens, 0)} lm` },
    { label: "8W LED Bulbs (≈800 lm)", value: `${bulbs800}` },
    { label: "16W LED Bulbs (≈1600 lm)", value: `${bulbs1600}` },
  ];
  const summaryStats = [
    { label: "Required Lumens", value: `${fmt(lumens, 0)} lm` },
    { label: "Illuminance Target", value: `${lux} lux` },
    { label: "Floor Area", value: `${fmt(area, 2)} m²` },
    { label: "800 lm Bulbs", value: `${bulbs800}` },
    { label: "1600 lm Bulbs", value: `${bulbs1600}` },
    { label: "LED Power Estimate", value: `~${wattsLed} W` },
    { label: "Lumens / m²", value: `${fmt(lumens / area, 1)}` },
    { label: "Utilization × Maintenance", value: `${fmt(uf * mf, 3)}` },
  ];
  const chartData = [
    { name: "800 lm bulbs", value: bulbs800, fill: "hsl(var(--primary))" },
    { name: "1600 lm bulbs", value: bulbs1600, fill: "#f59e0b" },
  ];
  return { room, lux, length, width, area, uf, mf, lumens, bulbs800, bulbs1600, wattsLed, breakdown, summaryStats, chartData };
}

const DEFAULTS = { room: "Living Room", length: "5", width: "4", uf: "0.5", mf: "0.8" };

export default function LightingLumensCalculator() {
  const [room, setRoom] = useState(DEFAULTS.room);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [showAdv, setShowAdv] = useState(false);
  const [uf, setUf] = useState(DEFAULTS.uf);
  const [mf, setMf] = useState(DEFAULTS.mf);
  const [result, setResult] = useState<LumensResult | null>(null);

  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const u = parseFloat(uf) || 0;
  const m = parseFloat(mf) || 0;
  const errs: string[] = [];
  if (l <= 0 || w <= 0) errs.push("Room length and width must be greater than 0.");
  if (u <= 0 || u > 1 || m <= 0 || m > 1) errs.push("Utilization and maintenance factors must be between 0 and 1.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLumens(room, l, w, u, m)); };
  const reset = () => {
    setRoom(DEFAULTS.room); setLength(DEFAULTS.length); setWidth(DEFAULTS.width); setUf(DEFAULTS.uf); setMf(DEFAULTS.mf); setShowAdv(false);
    setResult(calcLumens("Living Room", 5, 4, 0.5, 0.8));
  };
  useEffect(() => { setResult(calcLumens("Living Room", 5, 4, 0.5, 0.8)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the lumen method?", answer: "Required lumens = (target lux × floor area) ÷ (utilization factor × maintenance factor). The utilization factor accounts for light lost to walls and fixtures; the maintenance factor for dirt and lamp aging over time." },
    { question: "How many lux does each room need?", answer: "Common targets: living rooms and bedrooms around 150 lux, kitchens and bathrooms 300, offices 500, hallways 100. Task areas like reading nooks go higher — the calculator uses standard recommended values per room type." },
    { question: "How do I choose bulbs?", answer: "LED bulbs list their lumen output on the box — a typical 8-10 W LED produces about 800 lumens, a 16 W about 1600. Divide your required lumens by the bulb's output and round up for the fixture count." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Lighting Lumens Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Lighting Lumens Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Room Type</label>
                <select value={room} onChange={e => setRoom(e.target.value)} className={sel}>
                  {Object.keys(ROOM_LUX).map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Room Length (m)</label>
                <div className={inp}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">m</span></div>
              </div>
              <div>
                <label className={lbl}>Room Width (m)</label>
                <div className={inp}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">m</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Efficiency Factors</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Utilization Factor (0-1)</label>
                      <div className={inp}><input type="number" value={uf} onChange={e => setUf(e.target.value)} className={ci} /></div>
                    </div>
                    <div>
                      <label className={lbl}>Maintenance Factor (0-1)</label>
                      <div className={inp}><input type="number" value={mf} onChange={e => setMf(e.target.value)} className={ci} /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Required Lumens</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.lumens, 0)} lm</div>
                <div className="text-sm text-muted-foreground mt-1">{result.lux} lux across {fmt(result.area, 2)} m² · {result.bulbs1600} × 16 W LED bulbs</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Area`, `${fmt(result.area, 2)} m²`], ["Illuminance", `${result.lux} lux`], ["1600 lm Bulbs", `${result.bulbs1600}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Lumen Method Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Bulbs Needed by Output</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [`${v} bulbs`, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Number of LED bulbs needed to hit the lumen target</p>
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
            <h2 className="text-2xl font-bold mb-3">The Lumen Method</h2>
            <p>This <strong>lighting lumens calculator</strong> applies the standard lumen method: multiply the recommended illuminance for your room type by the floor area, then divide by the utilization and maintenance factors. The result is the total luminous flux the fixtures must deliver.</p>
            <h2 className="text-2xl font-bold mb-3">Lux, Lumens, and Wattage</h2>
            <p>Lux measures illuminance — lumens per square meter — so a bigger room needs more lumens for the same brightness. LEDs deliver roughly 100 lumens per watt, so the calculator also estimates total LED wattage and the number of common 800 lm and 1600 lm bulbs.</p>
            <h2 className="text-2xl font-bold mb-3">Tuning the Factors</h2>
            <p>Dark walls, high ceilings, and dirty fixtures lower the utilization and maintenance factors — the defaults of 0.5 and 0.8 are typical. Light-colored rooms with clean fixtures can raise utilization toward 0.6-0.7 and cut the bulb count.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lighting-lumens-calculator" />
          <PopularCalculators exclude="/calculator/lighting-lumens-calculator" />
        </div>
      </div>
    </>
  );
}
