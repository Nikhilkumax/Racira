"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface BoilInputs {
  volume: number;    // liters
  startTemp: number; // °C
  targetTemp: number;// °C
  power: number;     // watts
  efficiency: number;// %
  pricePerKwh: number; // $
}

interface ChartPoint {
  time: number;
  temp: number;
}

interface BoilResults {
  energyJ: number;
  energyKwh: number;
  timeSeconds: number;
  timeMinutes: number;
  cost: number;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const WATER_C = 4186; // J/(kg·°C)
const MASS_PER_LITER = 1.0; // kg/L

function calcBoil(i: BoilInputs): BoilResults {
  const mass = i.volume * MASS_PER_LITER;
  const deltaT = i.targetTemp - i.startTemp;
  const energyJ = mass * WATER_C * Math.max(0, deltaT);
  const energyKwh = energyJ / 3_600_000;
  const effectivePower = i.power * (i.efficiency / 100);
  const timeSeconds = effectivePower > 0 ? energyJ / effectivePower : 0;
  const timeMinutes = timeSeconds / 60;
  const cost = energyKwh * i.pricePerKwh;

  const chartData: ChartPoint[] = [];
  const totalPoints = Math.max(10, Math.min(60, Math.ceil(timeSeconds / 30)));
  for (let p = 0; p <= totalPoints; p++) {
    const t = (p / totalPoints) * timeSeconds;
    const temp = i.startTemp + (effectivePower * t) / (mass * WATER_C);
    chartData.push({ time: Math.round(t), temp: Math.round(temp * 10) / 10 });
  }

  const breakdown = [
    { label: "Volume of Water", value: `${i.volume} L` },
    { label: "Starting Temperature", value: `${i.startTemp}°C` },
    { label: "Target Temperature", value: `${i.targetTemp}°C` },
    { label: "Temperature Rise", value: `${Math.max(0, deltaT)}°C` },
    { label: "Heater Power", value: `${i.power} W` },
    { label: "Efficiency", value: `${i.efficiency}%` },
    { label: "Heat Energy Required", value: `${(energyJ / 1000).toFixed(1)} kJ` },
    { label: "Energy Consumed", value: `${energyKwh.toFixed(3)} kWh` },
    { label: "Time to Boil", value: `${timeMinutes.toFixed(1)} min`, highlight: true, isTotal: true },
    { label: "Electricity Cost", value: `$${cost.toFixed(3)}` },
  ];

  const summaryStats = [
    { label: "Time to Boil", value: `${timeMinutes.toFixed(1)} min` },
    { label: "Energy Required", value: `${(energyJ / 1000).toFixed(1)} kJ` },
    { label: "Energy Consumed", value: `${energyKwh.toFixed(3)} kWh` },
    { label: "Electricity Cost", value: `$${cost.toFixed(3)}` },
    { label: "Volume", value: `${i.volume} L` },
    { label: "Temperature Rise", value: `${Math.max(0, deltaT)}°C` },
    { label: "Effective Power", value: `${(effectivePower).toFixed(0)} W` },
    { label: "Efficiency", value: `${i.efficiency}%` },
  ];

  return { energyJ, energyKwh, timeSeconds, timeMinutes, cost, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  volume: "1.5",
  startTemp: "20",
  targetTemp: "100",
  power: "1500",
  efficiency: "85",
  pricePerKwh: "0.16",
};

// 4. Component
export default function WaterBoilingTimeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<BoilResults>(() =>
    calcBoil({ volume: 1.5, startTemp: 20, targetTemp: 100, power: 1500, efficiency: 85, pricePerKwh: 0.16 })
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcBoil({ volume: 1.5, startTemp: 20, targetTemp: 100, power: 1500, efficiency: 85, pricePerKwh: 0.16 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcBoil({
        volume: parseFloat(inputs.volume) || 0,
        startTemp: parseFloat(inputs.startTemp) || 0,
        targetTemp: parseFloat(inputs.targetTemp) || 0,
        power: parseFloat(inputs.power) || 0,
        efficiency: parseFloat(inputs.efficiency) || 0,
        pricePerKwh: parseFloat(inputs.pricePerKwh) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcBoil({ volume: 1.5, startTemp: 20, targetTemp: 100, power: 1500, efficiency: 85, pricePerKwh: 0.16 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const volume = parseFloat(inputs.volume) || 0;
  const startTemp = parseFloat(inputs.startTemp) || 0;
  const targetTemp = parseFloat(inputs.targetTemp) || 0;
  const power = parseFloat(inputs.power) || 0;
  if (volume <= 0) errors.volume = "Must be greater than 0";
  if (startTemp < -273) errors.startTemp = "Must be ≥ -273";
  if (targetTemp <= startTemp) errors.targetTemp = "Must exceed start temp";
  if (power <= 0) errors.power = "Must be greater than 0";
  if ((parseFloat(inputs.efficiency) || 0) <= 0 || (parseFloat(inputs.efficiency) || 0) > 100) errors.efficiency = "Must be 1-100";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What formula does this use?", answer: "Heating water requires energy Q = m × c × ΔT, where m is the mass in kg, c is water's specific heat (4,186 J/kg·°C), and ΔT is the temperature rise. Time = Q ÷ (power × efficiency). The calculator applies this physics exactly — it is not an estimate." },
    { question: "Why does a kettle take longer than the rating suggests?", answer: "Stated power is electrical input; some is lost as heat to the kettle body and air. Typical electric kettles operate at 80-90% efficiency, and starting tap water in winter is colder than 20°C — both increase time. Adjust the efficiency and start temperature to match your setup." },
    { question: "How much does boiling water cost?", answer: "Boiling 1.5 L with a 1,500 W kettle at 85% efficiency uses about 0.14 kWh — roughly $0.02 at typical residential rates. Boiling a kettle twice a day for a year costs about $15. Energy-efficient kettles with good insulation save only pennies, but every bit counts." },
    { question: "Does altitude affect boiling time?", answer: "At higher altitude, water boils at a lower temperature (about 1°C lower per 300 m above sea level), so less energy is needed to reach a lower boiling point. Set the target temperature to your local boiling point for an accurate time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Water Boiling Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Water Boiling Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="volume" className={lbl}>Volume of Water</label>
                <div className={inp}>
                  <input id="volume" type="number" min="0.1" step="0.1" value={inputs.volume} onChange={(e) => set("volume")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">L</span>
                </div>
                {errors.volume && <p className="text-xs text-red-500 font-medium mt-1">{errors.volume}</p>}
              </div>
              <div>
                <label htmlFor="power" className={lbl}>Heater Power</label>
                <div className={inp}>
                  <input id="power" type="number" min="1" value={inputs.power} onChange={(e) => set("power")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">W</span>
                </div>
                {errors.power && <p className="text-xs text-red-500 font-medium mt-1">{errors.power}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start" className={lbl}>Starting Temperature</label>
                <div className={inp}>
                  <input id="start" type="number" value={inputs.startTemp} onChange={(e) => set("startTemp")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">°C</span>
                </div>
                {errors.startTemp && <p className="text-xs text-red-500 font-medium mt-1">{errors.startTemp}</p>}
              </div>
              <div>
                <label htmlFor="target" className={lbl}>Target Temperature</label>
                <div className={inp}>
                  <input id="target" type="number" value={inputs.targetTemp} onChange={(e) => set("targetTemp")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">°C</span>
                </div>
                {errors.targetTemp && <p className="text-xs text-red-500 font-medium mt-1">{errors.targetTemp}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Efficiency & Cost</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="eff" className={lbl}>Heater Efficiency</label>
                        <div className={inp}>
                          <input id="eff" type="number" min="1" max="100" value={inputs.efficiency} onChange={(e) => set("efficiency")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.efficiency && <p className="text-xs text-red-500 font-medium mt-1">{errors.efficiency}</p>}
                      </div>
                      <div>
                        <label htmlFor="price" className={lbl}>Electricity Price</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="price" type="number" min="0" step="0.01" value={inputs.pricePerKwh} onChange={(e) => set("pricePerKwh")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">/kWh</span>
                        </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Time to Boil</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.timeMinutes.toFixed(1)} <span className="text-xl text-muted-foreground">min</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.timeSeconds.toFixed(0)} seconds · {result.energyKwh.toFixed(3)} kWh · ~${result.cost.toFixed(2)}</div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Time", `${result.timeMinutes.toFixed(1)} min`],
                ["Energy", `${result.energyKwh.toFixed(3)} kWh`],
                ["Cost", `$${result.cost.toFixed(3)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Physics Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Water Temperature Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 110]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                  <Tooltip formatter={(v: number, n: string) => [n === "temp" ? `${v}°C` : `${v}s`, n === "temp" ? "Temperature" : "Time"]} labelFormatter={(v) => `Time: ${v}s`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Line type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "100°C", fontSize: 11, fill: "#ef4444", position: "insideTopRight" }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Temperature rises linearly until the water reaches its target.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Physics of Boiling Water</h2>
            <p>Heating water is a textbook thermodynamics problem. The energy required to raise the temperature is Q = m × c × ΔT, where m is the mass (1 liter of water = 1 kg), c is the specific heat of water (4,186 J per kg per °C), and ΔT is the temperature rise. Divide by the heater's effective power — rated watts multiplied by efficiency — to get the time.</p>
            <h2 className="text-2xl font-bold mb-3">Why Efficiency Matters</h2>
            <p>An electric kettle rated at 1,500 W rarely delivers all 1,500 W to the water: heat escapes through the walls, and the heating element itself is not 100% efficient. Using 85% efficiency (a typical value) adds roughly 18% to the theoretical time. Adjust the number if your kettle is old or uninsulated.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Tips</h2>
            <p>Boil only what you need — heating 0.5 L instead of 1.5 L cuts both time and energy by two-thirds. Use hot tap water to start, which raises the start temperature and reduces ΔT. And remember altitude: water boils below 100°C at high elevations, so less energy is needed there.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-boiling-time-calculator" />
          <PopularCalculators exclude="/calculator/water-boiling-time-calculator" />
        </div>
      </div>
    </>
  );
}
