"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface WindResult {
  area: number;
  power: number; // W
  energyDay: number; // kWh
  betzPower: number; // W at 59.3%
  chartData: { name: string; power: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtPower(w: number): string {
  if (w >= 1000000) return `${(w / 1000000).toFixed(2)} MW`;
  if (w >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${w.toFixed(1)} W`;
}

function calcWind(speed: number, diameter: number, rho: number): WindResult {
  const radius = diameter / 2;
  const area = Math.PI * radius * radius;
  const power = 0.5 * rho * area * Math.pow(speed, 3);
  const energyDay = (power * 24) / 1000;
  const betzPower = power * 0.593;

  // Power scales with v^3: show it at v/2, v, 2v
  const factors = [0.5, 1, 1.5, 2];
  const chartData = factors.map((f, i) => ({
    name: `${f}×v`,
    power: 0.5 * rho * area * Math.pow(speed * f, 3),
    fill: i === factors.length - 1 ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Wind Speed", value: `${speed.toFixed(1)} m/s (${(speed * 3.6).toFixed(1)} km/h)` },
    { label: "Rotor Diameter", value: `${diameter.toFixed(1)} m` },
    { label: "Swept Area (A = πr²)", value: `${area.toFixed(2)} m²` },
    { label: "Air Density", value: `${rho.toFixed(3)} kg/m³` },
    { label: "Available Wind Power (½ρAv³)", value: fmtPower(power) },
    { label: "Betz Limit (59.3%)", value: fmtPower(betzPower) },
    { label: "Energy per Day (24 h)", value: `${energyDay.toFixed(1)} kWh` },
    { label: "Equivalent Households", value: `${(energyDay / 30).toFixed(1)} (at 30 kWh/day)` },
  ];

  const summaryStats = [
    { label: "Wind Power", value: fmtPower(power) },
    { label: "After Betz Limit", value: fmtPower(betzPower) },
    { label: "Energy / Day", value: `${energyDay.toFixed(1)} kWh` },
    { label: "Swept Area", value: `${area.toFixed(2)} m²` },
    { label: "Formula", value: "P = ½·ρ·A·v³" },
    { label: "Max Extractable", value: "59.3% (Betz law)" },
  ];

  return { area, power, energyDay, betzPower, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WindSpeedPowerCalculator() {
  const [speed, setSpeed] = useState("12");
  const [diameter, setDiameter] = useState("10");
  const [rho, setRho] = useState("1.225");
  const [result, setResult] = useState<WindResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcWind(
        Math.max(0.1, parse(speed, 12, 0.1)),
        Math.max(0.1, parse(diameter, 10, 0.1)),
        Math.max(0.01, parse(rho, 1.225, 0.01))
      )
    );
  const reset = () => {
    setSpeed("12");
    setDiameter("10");
    setRho("1.225");
    setResult(calcWind(12, 10, 1.225));
  };
  useEffect(() => {
    setResult(calcWind(12, 10, 1.225));
  }, []);

  const faqs = [
    { question: "How is wind power calculated?", answer: "The kinetic energy of moving air is captured as P = ½·ρ·A·v³ — half the air density times the swept area times the wind speed cubed. The cube makes speed the dominant factor: doubling the wind multiplies the power eightfold." },
    { question: "Why does the wind speed cube matter so much?", answer: "Power scales with v³, so a 12 m/s wind carries 2.4× the power of a 9 m/s wind, and 8× the power of a 6 m/s wind. This is why turbine siting is obsessed with average speed — and why low-wind days produce disproportionately little energy." },
    { question: "What is the Betz limit?", answer: "No turbine can extract all the wind's energy — if it did, the air behind it would stop flowing. The Betz limit caps extraction at 59.3%; modern turbines achieve 40–50%. The calculator shows both the raw power and the practical maximum." },
    { question: "What is the swept area?", answer: "The swept area is the circle the blades trace: A = πr². Doubling the blade length quadruples the area and therefore the power — which is why rotor diameter has grown from 15 m in the 1980s to over 200 m today." },
    { question: "How much energy does a turbine produce?", answer: "A 2 MW turbine at a good site generates roughly 5–6 GWh per year, enough for about 500 households. The calculator's daily-energy figure assumes constant wind — real output is roughly 30–45% of that due to variability." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Wind Speed Power Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Wind Speed Power Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Wind Speed (m/s)</label>
                <div className={inp}><input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} className={ci} min={0.1} step={0.1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rotor Diameter (m)</label>
                <div className={inp}><input type="number" value={diameter} onChange={(e) => setDiameter(e.target.value)} className={ci} min={0.1} step={0.5} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Air Density (kg/m³)</label>
              <div className={inp}><input type="number" value={rho} onChange={(e) => setRho(e.target.value)} className={ci} min={0.01} step={0.01} /></div>
              <p className="text-xs text-muted-foreground mt-1">Sea level ≈ 1.225 · at 2,000 m altitude ≈ 1.007 kg/m³.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Available Wind Power</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmtPower(result.power)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Max extractable (Betz): {fmtPower(result.betzPower)} · {result.energyDay.toFixed(1)} kWh/day</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Power", fmtPower(result.power)], ["Betz Max", fmtPower(result.betzPower)], ["Energy/Day", `${result.energyDay.toFixed(1)} kWh`]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Power vs Wind Speed (v³)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)} kW`} />
                      <Tooltip formatter={(v: number) => [fmtPower(v), "Power"]} />
                      <Bar dataKey="power" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Doubling the wind speed octuples the power — the v³ relationship that dominates wind energy economics.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Physics of Wind Power</h2>
            <p>Moving air carries kinetic energy, and the power available to a wind turbine is <strong>P = ½·ρ·A·v³</strong>: density times swept area times the cube of wind speed. The density term is small but constant; the area grows with the square of blade length; and the cubed speed dominates everything.</p>
            <h2 className="text-2xl font-bold mb-3">Why v³ Changes Everything</h2>
            <p>Because power scales with the cube of speed, a site averaging 7 m/s produces nearly twice the energy of one averaging 5.5 m/s — and a 14 m/s gust carries eight times the power of a 7 m/s breeze. Turbine placement, hub height, and cut-in speeds are all engineered around this cubic sensitivity.</p>
            <h2 className="text-2xl font-bold mb-3">The Betz Limit and Reality</h2>
            <p>Albert Betz showed in 1919 that a rotor can capture at most 59.3% of the wind's power — extracting more would stop the air completely. Real turbines achieve 40–50% of the available power, and their annual energy output lands at 30–45% of the rated figure due to wind variability. Both corrections are visible in the calculator's output.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wind-speed-power-calculator" />
          <PopularCalculators exclude="/calculator/wind-speed-power-calculator" />
        </div>
      </div>
    </>
  );
}
