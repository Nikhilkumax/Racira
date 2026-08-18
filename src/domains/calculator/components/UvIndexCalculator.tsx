"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const SKIN_TYPES = [
  { key: "I", label: "Type I — always burns", med: 200 },
  { key: "II", label: "Type II — burns easily", med: 250 },
  { key: "III", label: "Type III — burns moderately", med: 350 },
  { key: "IV", label: "Type IV — burns minimally", med: 450 },
  { key: "V", label: "Type V — rarely burns", med: 600 },
  { key: "VI", label: "Type VI — never burns", med: 1000 },
];

function dayOfYear(month: number, day: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth.slice(0, month - 1).reduce((a, b) => a + b, 0) + day;
}

function solarElevation(latDeg: number, month: number, day: number, hour: number): number {
  const lat = (latDeg * Math.PI) / 180;
  const declination = (23.44 * Math.sin((2 * Math.PI * (284 + dayOfYear(month, day))) / 365) * Math.PI) / 180;
  const hourAngle = (15 * (hour - 12) * Math.PI) / 180;
  const sinElev = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  return (Math.asin(Math.max(-1, Math.min(1, sinElev))) * 180) / Math.PI;
}

function uviFromElevation(elev: number): number {
  if (elev <= 0) return 0;
  const sin = Math.sin((elev * Math.PI) / 180);
  return 12.5 * Math.pow(sin, 1.7);
}

function uviCategory(uvi: number): { label: string; color: string } {
  if (uvi < 3) return { label: "Low", color: "text-emerald-600" };
  if (uvi < 6) return { label: "Moderate", color: "text-yellow-500" };
  if (uvi < 8) return { label: "High", color: "text-orange-500" };
  if (uvi < 11) return { label: "Very High", color: "text-red-500" };
  return { label: "Extreme", color: "text-purple-600" };
}

interface UvResult {
  uvi: number;
  elevation: number;
  category: string;
  categoryColor: string;
  burnMinutes: number;
  chartData: { hour: number; uvi: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcUv(lat: number, month: number, day: number, hour: number, med: number): UvResult {
  const elevation = solarElevation(lat, month, day, hour);
  const uvi = uviFromElevation(elevation);
  const cat = uviCategory(uvi);
  const burnMinutes = uvi > 0 ? med / (1.5 * uvi) : Infinity;

  const chartData: { hour: number; uvi: number }[] = [];
  for (let h = 5; h <= 21; h++) {
    chartData.push({ hour: h, uvi: uviFromElevation(solarElevation(lat, month, day, h)) });
  }

  const breakdown = [
    { label: "Latitude", value: `${lat.toFixed(1)}° ${lat >= 0 ? "N" : "S"}` },
    { label: "Date", value: `${month}/${day} (day ${dayOfYear(month, day)})` },
    { label: "Time", value: `${hour.toFixed(1)}:00` },
    { label: "Solar Elevation", value: `${elevation.toFixed(1)}°` },
    { label: "Clear-Sky UV Index", value: uvi.toFixed(1) },
    { label: "Category", value: cat.label },
    { label: "Time to Burn (this skin type)", value: burnMinutes === Infinity ? "— (sun below horizon)" : `~${burnMinutes.toFixed(0)} min` },
  ];

  const summaryStats = [
    { label: "UV Index", value: uvi.toFixed(1) },
    { label: "Category", value: cat.label },
    { label: "Solar Elevation", value: `${elevation.toFixed(1)}°` },
    { label: "Time to Burn", value: burnMinutes === Infinity ? "—" : `~${burnMinutes.toFixed(0)} min` },
    { label: "Model", value: "UVI = 12.5·sin(h)^1.7 (clear sky)" },
    { label: "Max Daily", value: `${Math.max(...chartData.map((d) => d.uvi)).toFixed(1)} at ~${chartData.reduce((best, d) => (d.uvi > best.uvi ? d : best), chartData[0]).hour}:00` },
  ];

  return { uvi, elevation, category: cat.label, categoryColor: cat.color, burnMinutes, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function UvIndexCalculator() {
  const [lat, setLat] = useState("40");
  const [month, setMonth] = useState("6");
  const [day, setDay] = useState("21");
  const [hour, setHour] = useState("13");
  const [skin, setSkin] = useState("II");
  const [result, setResult] = useState<UvResult | null>(null);

  const parse = (s: string, fallback: number, min = -Infinity, max = Infinity) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };

  const calculate = () => {
    const med = SKIN_TYPES.find((s) => s.key === skin)?.med ?? 250;
    const m = Math.round(parse(month, 6, 1, 12));
    const d = Math.round(parse(day, 21, 1, 31));
    setResult(calcUv(parse(lat, 40, -90, 90), m, d, parse(hour, 13, 0, 24), med));
  };
  const reset = () => {
    setLat("40");
    setMonth("6");
    setDay("21");
    setHour("13");
    setSkin("II");
    setResult(calcUv(40, 6, 21, 13, 250));
  };
  useEffect(() => {
    setResult(calcUv(40, 6, 21, 13, 250));
  }, []);

  const faqs = [
    { question: "What is the UV index?", answer: "The UV index (UVI) measures the strength of sunburn-causing ultraviolet radiation on a 0–11+ scale. It is proportional to the erythemal irradiance: each unit is 25 mW/m² of skin-burning UV. The scale was standardized by the WHO in 1994." },
    { question: "What are the categories?", answer: "0–2 Low, 3–5 Moderate, 6–7 High, 8–10 Very High, 11+ Extreme. At 8+, unprotected skin burns in under 20 minutes and sun protection is essential even on cloudy days, since clouds block as little as 10–20% of UV." },
    { question: "Why does the elevation matter so much?", answer: "The sun's rays travel through more atmosphere when low in the sky, so UV intensity scales steeply with solar elevation: UVI ∝ sin(elevation)^1.7. That is why UV peaks at solar noon and drops to near zero after sunset — and why winter UV at high latitudes is weak." },
    { question: "What determines my time to burn?", answer: "Skin type (Fitzpatrick scale) sets the minimal erythema dose — the UV energy that just reddens skin. Type I burns after ~200 J/m², Type VI after ~1,000 J/m². Time to burn = MED ÷ (0.025 W/m² per UVI × UVI), shown in the breakdown." },
    { question: "Why is UV strongest in summer at noon?", answer: "Earth's axial tilt brings the sun higher in summer (declination up to ±23.44°), and noon brings the shortest atmospheric path. Together they maximize sin(elevation), which the cube-like power law amplifies into the summer UV spike." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "UV Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">UV Index Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Latitude (°)</label>
                <div className={inp}><input type="number" value={lat} onChange={(e) => setLat(e.target.value)} className={ci} min={-90} max={90} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Month</label>
                <div className={inp}><input type="number" value={month} onChange={(e) => setMonth(e.target.value)} className={ci} min={1} max={12} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Day of Month</label>
                <div className={inp}><input type="number" value={day} onChange={(e) => setDay(e.target.value)} className={ci} min={1} max={31} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time (24 h)</label>
                <div className={inp}><input type="number" value={hour} onChange={(e) => setHour(e.target.value)} className={ci} min={0} max={24} step={0.5} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Skin Type (for burn time)</label>
              <div className={inp}>
                <select value={skin} onChange={(e) => setSkin(e.target.value)} className={ci}>
                  {SKIN_TYPES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Clear-Sky UV Index</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.categoryColor}`}>{result.uvi.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Category: {result.category} · solar elevation {result.elevation.toFixed(1)}° · burn time ~{result.burnMinutes === Infinity ? "—" : `${result.burnMinutes.toFixed(0)} min`}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["UV Index", result.uvi.toFixed(1)], ["Category", result.category], ["Time to Burn", result.burnMinutes === Infinity ? "—" : `~${result.burnMinutes.toFixed(0)} min`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">UV Through the Day</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} label={{ value: "Hour of day", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, "auto"]} />
                      <Tooltip formatter={(v: number) => [v.toFixed(1), "UV Index"]} labelFormatter={(l) => `${l}:00`} />
                      <ReferenceLine y={3} stroke="#eab308" strokeDasharray="4 4" label={{ value: "Moderate", position: "insideTopRight", fontSize: 10, fill: "#a16207" }} />
                      <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Very High", position: "insideTopRight", fontSize: 10, fill: "#b91c1c" }} />
                      <Line type="monotone" dataKey="uvi" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">UV peaks at solar noon and collapses after sunset — the sin(elevation)^1.7 clear-sky model.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
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
            <h2 className="text-2xl font-bold mb-3">The UV Index, From First Principles</h2>
            <p>The UV index is the erythemal (sunburn) irradiance expressed in units of 25 mW/m². Under a clear sky it is controlled almost entirely by solar elevation: <strong>UVI ≈ 12.5 × sin(h)^1.7</strong>. This calculator derives the elevation from latitude, date, and time using standard solar geometry — solar declination plus the hour angle.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Geometry Matters</h2>
            <p>Earth's 23.44° axial tilt drives the seasons: the sun climbs highest at the summer solstice, so sin(elevation) peaks in June — and the 1.7 power amplifies that peak into the dramatic summer UV spike. Near the equator the sun passes nearly overhead year-round, keeping UV in the 10+ range all year.</p>
            <h2 className="text-2xl font-bold mb-3">From Index to Skin</h2>
            <p>The Fitzpatrick scale quantifies how much UV each skin type tolerates before reddening — the minimal erythema dose, 200–1,000 J/m². Dividing the MED by the UV irradiance gives the time to burn, the number every beachgoer actually cares about. Clouds, ozone, and altitude adjust the clear-sky estimate: high mountains can raise UVI by 10–20%.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/uv-index-calculator" />
          <PopularCalculators exclude="/calculator/uv-index-calculator" />
        </div>
      </div>
    </>
  );
}
