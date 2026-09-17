"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ElectricityResult {
  powerWatts: number;
  hoursDay: number;
  daysWeek: number;
  rate: number;
  units: number;
  kwhDay: number;
  kwhWeek: number;
  kwhMonth: number;
  costDay: number;
  costWeek: number;
  costMonth: number;
  costYear: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcElectricity(powerWatts: number, hoursDay: number, daysWeek: number, rate: number, units: number): ElectricityResult {
  const kwhDay = ((powerWatts * units) / 1000) * hoursDay;
  const kwhWeek = kwhDay * daysWeek;
  const kwhMonth = kwhWeek * 4.345;
  const costDay = kwhDay * rate;
  const costWeek = kwhWeek * rate;
  const costMonth = kwhMonth * rate;
  const costYear = kwhWeek * 52.14 * rate;

  const breakdown = [
    { label: "Appliance Power", value: `${powerWatts} W (${(powerWatts / 1000).toFixed(2)} kW)` },
    { label: "Usage", value: `${hoursDay} hrs/day · ${daysWeek} days/week` },
    { label: "Electricity Rate", value: `$${rate.toFixed(3)}/kWh` },
    { label: "Identical Units", value: `${units}` },
    { label: "Daily Usage", value: `${kwhDay.toFixed(2)} kWh` },
    { label: "Weekly Usage", value: `${kwhWeek.toFixed(2)} kWh` },
    { label: "Monthly Usage", value: `${kwhMonth.toFixed(2)} kWh` },
    { label: "Daily Cost", value: fmt$(costDay) },
    { label: "Monthly Cost", value: fmt$(costMonth) },
    { label: "Yearly Cost", value: fmt$(costYear) },
  ];
  const summaryStats = [
    { label: "Monthly Cost", value: fmt$(costMonth) },
    { label: "Yearly Cost", value: fmt$(costYear) },
    { label: "Daily Cost", value: fmt$(costDay) },
    { label: "Monthly Usage", value: `${kwhMonth.toFixed(1)} kWh` },
    { label: "Daily Usage", value: `${kwhDay.toFixed(2)} kWh` },
    { label: "Power", value: `${powerWatts} W` },
    { label: "Rate", value: `$${rate.toFixed(3)}/kWh` },
    { label: "Units", value: `${units}` },
  ];
  const chartData = [
    { name: "Daily", value: Math.round(costDay * 100) / 100, fill: "hsl(var(--primary))" },
    { name: "Weekly", value: Math.round(costWeek * 100) / 100, fill: "#8b5cf6" },
    { name: "Monthly", value: Math.round(costMonth * 100) / 100, fill: "#f59e0b" },
    { name: "Yearly", value: Math.round(costYear * 100) / 100, fill: "#10b981" },
  ];
  return { powerWatts, hoursDay, daysWeek, rate, units, kwhDay, kwhWeek, kwhMonth, costDay, costWeek, costMonth, costYear, breakdown, summaryStats, chartData };
}

const DEFAULTS = { power: "1500", hours: "3", days: "7", rate: "0.16", units: "1" };

export default function ElectricityCostCalculator() {
  const [power, setPower] = useState(DEFAULTS.power);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [units, setUnits] = useState(DEFAULTS.units);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<ElectricityResult | null>(null);

  const pw = parseFloat(power) || 0;
  const hr = parseFloat(hours) || 0;
  const dy = parseFloat(days) || 0;
  const rt = parseFloat(rate) || 0;
  const un = parseInt(units) || 1;
  const errs: string[] = [];
  if (pw <= 0) errs.push("Appliance power must be greater than 0.");
  if (hr < 0 || hr > 24) errs.push("Hours per day must be between 0 and 24.");
  if (dy < 1 || dy > 7) errs.push("Days per week must be between 1 and 7.");
  if (rt <= 0) errs.push("Electricity rate must be greater than 0.");
  if (un < 1 || un > 100) errs.push("Number of units must be 1–100.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcElectricity(pw, hr, dy, rt, un)); };
  const reset = () => {
    setPower(DEFAULTS.power); setHours(DEFAULTS.hours); setDays(DEFAULTS.days); setRate(DEFAULTS.rate); setUnits(DEFAULTS.units);
    setResult(calcElectricity(1500, 3, 7, 0.16, 1));
  };
  useEffect(() => { setResult(calcElectricity(1500, 3, 7, 0.16, 1)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do I find my electricity rate?", answer: "Look at the energy section of your utility bill. It is usually shown in cents per kilowatt-hour (e.g., 16 cents = $0.16/kWh) and may include supply plus delivery charges." },
    { question: "Why is my appliance wattage printed on it?", answer: "Most appliances list power draw in watts on a label or nameplate. For devices that cycle on and off, like fridges, the rated watts overestimate usage — use actual run time instead." },
    { question: "How can I reduce the cost?", answer: "Reduce run time, use ENERGY STAR appliances, shift usage to off-peak hours if your utility offers time-of-use rates, and unplug devices with standby draw." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Electricity Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Electricity Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Appliance Power</label>
                <div className={inp}><input type="number" value={power} onChange={e => setPower(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">W</span></div>
              </div>
              <div>
                <label className={lbl}>Hours per Day</label>
                <div className={inp}><input type="number" value={hours} onChange={e => setHours(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hrs</span></div>
              </div>
              <div>
                <label className={lbl}>Days per Week</label>
                <div className={inp}><input type="number" value={days} onChange={e => setDays(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">days</span></div>
              </div>
              <div>
                <label className={lbl}>Electricity Rate</label>
                <div className={inp}><input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/kWh</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Multi-Unit</div>
                  <div>
                    <label className={lbl}>Number of Identical Units</label>
                    <div className={inp}><input type="number" value={units} onChange={e => setUnits(e.target.value)} className={ci} /></div>
                    <p className="text-xs text-muted-foreground mt-1.5">Scales all usage and cost figures for multiple identical appliances.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Cost</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.costMonth)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.kwhMonth.toFixed(1)} kWh/month · {fmt$(result.costYear)}/year</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Daily Cost`, fmt$(result.costDay)], ["Weekly Cost", fmt$(result.costWeek)], ["Yearly Cost", fmt$(result.costYear)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cost Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 8 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 8 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cost by Period</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number) => [fmt$(v), "Cost"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Electricity Cost Is Computed</h2>
            <p>This <strong>electricity cost calculator</strong> converts appliance wattage to kilowatts, multiplies by hours of use to get kilowatt-hours, then multiplies by your rate. Daily usage × days per week gives the weekly figure, which is scaled to monthly (4.345 weeks) and yearly (52.14 weeks) for planning.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Numbers</h2>
            <p>One kilowatt-hour is 1,000 watts run for one hour — roughly what a 1,500 W space heater consumes in 40 minutes. Devices with heating elements or motors, such as dryers, AC units, and kettles, dominate household electricity bills.</p>
            <h2 className="text-2xl font-bold mb-3">Cutting the Bill</h2>
            <p>Target the biggest consumers first: heating and cooling, water heating, laundry, and refrigeration. Replacing incandescent bulbs with LEDs, sealing drafts, and washing in cold water typically deliver the fastest payback.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/electricity-cost-calculator" />
          <PopularCalculators exclude="/calculator/electricity-cost-calculator" />
        </div>
      </div>
    </>
  );
}
