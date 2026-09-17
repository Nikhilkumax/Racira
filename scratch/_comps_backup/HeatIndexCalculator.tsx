"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface HeatIndexResult {
  tempF: number;
  rh: number;
  heatIndex: number;
  risk: string;
  riskColor: string;
  riskDesc: string;
  curve: { rh: number; hi: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { rh: number; hi: number }[];
}

function rothfusz(t: number, rh: number): number {
  const hi = -42.379
    + 2.04901523 * t
    + 10.14333127 * rh
    - 0.22475541 * t * rh
    - 0.00683783 * t * t
    - 0.05481717 * rh * rh
    + 0.00122874 * t * t * rh
    + 0.00085282 * t * rh * rh
    - 0.00000199 * t * t * rh * rh;
  if (rh < 13 && t >= 80 && t <= 112) {
    return hi - ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  }
  if (rh > 85 && t >= 80 && t <= 87) {
    return hi + ((rh - 85) / 10) * ((87 - t) / 5);
  }
  return hi;
}

function calcHeatIndex(tempF: number, rh: number): HeatIndexResult {
  const heatIndex = tempF <= 80
    ? 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094)
    : rothfusz(tempF, rh);

  let risk: string, riskColor: string, riskDesc: string;
  if (heatIndex >= 125) { risk = "Extreme Danger"; riskColor = "text-red-600"; riskDesc = "Heat stroke highly likely with continued exposure."; }
  else if (heatIndex >= 103) { risk = "Danger"; riskColor = "text-orange-500"; riskDesc = "Heat cramps and exhaustion likely; heat stroke possible."; }
  else if (heatIndex >= 90) { risk = "Extreme Caution"; riskColor = "text-amber-500"; riskDesc = "Heat cramps and heat exhaustion possible."; }
  else { risk = "Caution"; riskColor = "text-emerald-600"; riskDesc = "Fatigue possible with prolonged exposure and activity."; }

  const curve: { rh: number; hi: number }[] = [];
  for (let h = 10; h <= 100; h += 10) {
    curve.push({ rh: h, hi: Math.round((tempF <= 80 ? 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + h * 0.094) : rothfusz(tempF, h)) * 10) / 10 });
  }

  const breakdown = [
    { label: "Air Temperature", value: `${tempF.toFixed(1)} °F (${(((tempF - 32) * 5) / 9).toFixed(1)} °C)` },
    { label: "Relative Humidity", value: `${rh.toFixed(0)}%` },
    { label: "Heat Index (feels like)", value: `${heatIndex.toFixed(1)} °F` },
    { label: "Risk Category", value: risk },
    { label: "Risk Guidance", value: riskDesc },
    { label: "Formula", value: tempF <= 80 ? "NWS simplified formula" : "NWS Rothfusz regression" },
    { label: "Dew Point Estimate", value: `${(tempF - (100 - rh) / 5).toFixed(1)} °F` },
    { label: "Temp Range", value: tempF <= 80 ? "Below 80 °F — apparent ≈ actual" : "Heat index applies" },
  ];
  const summaryStats = [
    { label: "Heat Index", value: `${heatIndex.toFixed(1)} °F` },
    { label: "Air Temp", value: `${tempF.toFixed(1)} °F` },
    { label: "Humidity", value: `${rh.toFixed(0)}%` },
    { label: "Risk", value: risk },
    { label: "Dew Point", value: `${(tempF - (100 - rh) / 5).toFixed(1)} °F` },
    { label: "Formula", value: tempF <= 80 ? "Simplified" : "Rothfusz" },
    { label: "Feels Like", value: `${((heatIndex - tempF) >= 0 ? "+" : "")}${(heatIndex - tempF).toFixed(1)} °F` },
    { label: "Caution Line", value: "90 °F" },
  ];
  return { tempF, rh, heatIndex, risk, riskColor, riskDesc, curve, breakdown, summaryStats, chartData: curve };
}

const DEFAULTS = { temp: "95", rh: "55" };

export default function HeatIndexCalculator() {
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [rh, setRh] = useState(DEFAULTS.rh);
  const [result, setResult] = useState<HeatIndexResult | null>(null);

  const t = parseFloat(temp) || 0;
  const h = parseFloat(rh) || 0;
  const errs: string[] = [];
  if (t < -60 || t > 140) errs.push("Temperature must be between −60 °F and 140 °F.");
  if (h < 0 || h > 100) errs.push("Relative humidity must be between 0% and 100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHeatIndex(t, h)); };
  const reset = () => {
    setTemp(DEFAULTS.temp); setRh(DEFAULTS.rh);
    setResult(calcHeatIndex(95, 55));
  };
  useEffect(() => { setResult(calcHeatIndex(95, 55)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the heat index?", answer: "The heat index is the temperature it feels like when humidity is factored in. High humidity slows sweat evaporation, so the body can't cool as effectively at the same air temperature." },
    { question: "Which formula is used?", answer: "The NWS Rothfusz regression applies at 80 °F and above, with corrections for very low and very high humidity. Below 80 °F, the simplified apparent-temperature formula is used." },
    { question: "Is heat index the same as temperature?", answer: "No — it is a perceived temperature. At 95 °F with 55% humidity, the index is about 110 °F, meaning your body experiences conditions equivalent to a 110 °F dry day." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Heat Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Heat Index Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Air Temperature</label>
                <div className={inp}><input type="number" value={temp} onChange={e => setTemp(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">°F</span></div>
              </div>
              <div>
                <label className={lbl}>Relative Humidity</label>
                <div className={inp}><input type="number" value={rh} onChange={e => setRh(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Heat Index (Feels Like)</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.heatIndex.toFixed(1)} °F</div>
                <div className="text-sm text-muted-foreground mt-1">{result.tempF.toFixed(1)} °F at {result.rh.toFixed(0)}% humidity</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Risk Category`, result.risk], ["Dew Point", `${(result.tempF - (100 - result.rh) / 5).toFixed(1)} °F`], ["vs Air Temp", `${result.heatIndex >= result.tempF ? "+" : ""}${(result.heatIndex - result.tempF).toFixed(1)} °F`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-base font-bold ${i === 0 ? result.riskColor : ""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Heat Index Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Heat Index vs Humidity</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="rh" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}°F`} />
                    <Tooltip formatter={(v: number) => [`${v} °F`, "Heat Index"]} labelFormatter={(l: number) => `${l}% humidity`} />
                    <Line type="monotone" dataKey="hi" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">How the index rises with humidity at your air temperature</p>
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
            <h2 className="text-2xl font-bold mb-3">What the Heat Index Means</h2>
            <p>This <strong>heat index calculator</strong> applies the National Weather Service Rothfusz regression for temperatures of 80 °F and above, with the standard corrections for humidity below 13% or above 85%. Below 80 °F it uses the simplified apparent-temperature formula. The result is the temperature the air feels like once humidity is considered.</p>
            <h2 className="text-2xl font-bold mb-3">Why Humidity Changes the Feeling</h2>
            <p>Sweating cools the body by evaporation. Humid air is already saturated with water vapor, so sweat evaporates slowly and the cooling effect fades. That is why a 95 °F day at 55% humidity feels like 110 °F.</p>
            <h2 className="text-2xl font-bold mb-3">Staying Safe</h2>
            <p>Above 90 °F, heat cramps and exhaustion become possible; above 103 °F, heat stroke risk rises sharply. Hydrate, take shade breaks, and reschedule strenuous outdoor work when the index climbs into the Danger zone.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heat-index-calculator" />
          <PopularCalculators exclude="/calculator/heat-index-calculator" />
        </div>
      </div>
    </>
  );
}
