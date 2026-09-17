"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

// Magnus formula saturation vapor pressure (kPa) — accurate over -40..50 °C
function saturationVp(tC: number): number {
  return 0.61094 * Math.exp((17.625 * tC) / (tC + 243.04));
}

interface HumidityResult {
  rh: number;
  actualVp: number;
  satVp: number;
  dewPointDepression: number;
  chartData: { name: string; pressure: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHumidity(temp: number, dewPoint: number): HumidityResult {
  const satVp = saturationVp(temp);
  const actualVp = saturationVp(dewPoint);
  const rh = satVp > 0 ? (actualVp / satVp) * 100 : 0;
  const dewPointDepression = temp - dewPoint;

  const chartData = [
    { name: "Actual Vapor Pressure", pressure: actualVp, fill: "hsl(var(--primary))" },
    { name: "Saturation (100% RH)", pressure: satVp, fill: "#a3a3a3" },
  ];

  const breakdown = [
    { label: "Air Temperature", value: `${temp.toFixed(1)} °C` },
    { label: "Dew Point", value: `${dewPoint.toFixed(1)} °C` },
    { label: "Saturation Vapor Pressure", value: `${satVp.toFixed(3)} kPa` },
    { label: "Actual Vapor Pressure", value: `${actualVp.toFixed(3)} kPa` },
    { label: "Dew Point Depression", value: `${dewPointDepression.toFixed(1)} °C` },
    { label: "Relative Humidity", value: `${rh.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Relative Humidity", value: `${rh.toFixed(1)}%` },
    { label: "Dew Point", value: `${dewPoint.toFixed(1)} °C` },
    { label: "Actual Vapor Pressure", value: `${actualVp.toFixed(3)} kPa` },
    { label: "Saturation Pressure", value: `${satVp.toFixed(3)} kPa` },
    { label: "Comfort", value: rh > 70 ? "Humid — feels sticky" : rh > 40 ? "Comfortable range" : "Dry — may cause static" },
    { label: "Formula", value: "RH = e(Td) ÷ eₛ(T) × 100" },
  ];

  return { rh, actualVp, satVp, dewPointDepression, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function HumidityCalculator() {
  const [temp, setTemp] = useState("25");
  const [dewPoint, setDewPoint] = useState("15");
  const [result, setResult] = useState<HumidityResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () => setResult(calcHumidity(parse(temp, 25), Math.min(parse(dewPoint, 15), parse(temp, 25))));
  const reset = () => {
    setTemp("25");
    setDewPoint("15");
    setResult(calcHumidity(25, 15));
  };
  useEffect(() => {
    setResult(calcHumidity(25, 15));
  }, []);

  const faqs = [
    { question: "What is relative humidity?", answer: "Relative humidity is the amount of water vapor in the air as a percentage of the maximum the air can hold at that temperature: RH = e(Td) ÷ eₛ(T) × 100. Warm air holds more vapor, so RH falls as temperature rises even when the vapor amount is unchanged." },
    { question: "What is the dew point?", answer: "The dew point is the temperature at which the air would become saturated (100% RH) and condensation begins. It is a direct measure of actual moisture — a 15 °C dew point feels humid whether the air is 20 °C or 35 °C." },
    { question: "Why does 50% feel different in summer and winter?", answer: "Relative humidity is relative to temperature, so it understates winter dryness. In summer, a 50% RH at 30 °C holds far more actual vapor than 50% at 5 °C — the dew point reveals this: 19 °C vs 4 °C. The calculator shows both sides." },
    { question: "What is a comfortable level?", answer: "Most people feel comfortable between 40% and 60% RH. Above 70% sweat stops evaporating efficiently and the air feels sticky; below 30% skin dries and static electricity builds up. The dew point tells the real story: under 10 °C is dry, 15–20 °C is humid." },
    { question: "How is humidity measured?", answer: "Sling psychrometers measure the wet-bulb depression; electronic hygrometers use capacitance changes in a polymer film; and dew-point mirrors cool a mirror until condensation forms. All ultimately trace back to the saturation curve the Magnus formula models here." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Humidity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Humidity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Air Temperature (°C)</label>
                <div className={inp}><input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Dew Point (°C)</label>
                <div className={inp}><input type="number" value={dewPoint} onChange={(e) => setDewPoint(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Dew point is clamped to the air temperature (100% RH max).</p>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Relative Humidity</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.rh.toFixed(1)}<span className="text-2xl text-muted-foreground">%</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Dew point {dewPoint} °C · depression {result.dewPointDepression.toFixed(1)} °C</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["RH", `${result.rh.toFixed(1)}%`], ["Dew Point", `${result.dewPointDepression > 0 ? parseFloat(dewPoint).toFixed(1) : parseFloat(temp).toFixed(1)} °C`], ["Depression", `${result.dewPointDepression.toFixed(1)} °C`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Vapor Pressure Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(3) + " kPa", "Pressure"]} />
                      <Bar dataKey="pressure" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">RH is the ratio of the highlighted bar to the saturation bar — at 100%, the two meet and fog forms.</p>
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
            <h2 className="text-2xl font-bold mb-3">How Humidity Is Defined</h2>
            <p>Air holds a maximum amount of water vapor that grows sharply with temperature. Relative humidity expresses how full the air is: <strong>RH = e(Td)/eₛ(T) × 100</strong>, computed here with the Magnus formula for saturation vapor pressure, accurate to a fraction of a percent across the −40 to +50 °C range.</p>
            <h2 className="text-2xl font-bold mb-3">The Dew Point Tells the Truth</h2>
            <p>Because RH is relative to temperature, it can mislead: 50% at 30 °C is more moisture than 60% at 15 °C. The dew point — the temperature where the air would saturate — removes the temperature illusion. It is the number forecasters and HVAC engineers actually design around.</p>
            <h2 className="text-2xl font-bold mb-3">Why Humidity Matters</h2>
            <p>Humidity drives heat stress (sweat can't evaporate in muggy air), condensation and mold (dew point crossing surface temperature), static discharge in dry air, and even how crisp audio and paper products feel. Understanding it is the first step to comfort in every climate.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/humidity-calculator" />
          <PopularCalculators exclude="/calculator/humidity-calculator" />
        </div>
      </div>
    </>
  );
}
