"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, PlugZap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PowerResult {
  voltage: number;
  current: number;
  power: number;
  resistance: number;
  hours: number;
  energyKwh: number;
  cost: number;
  rate: number;
  chartData: { h: number; kwh: number }[];
}

function calcPower(voltage: number, current: number, hours: number, rate: number): PowerResult {
  const power = voltage * current;
  const resistance = current > 0 ? voltage / current : 0;
  const energyKwh = (power / 1000) * hours;
  const cost = energyKwh * rate;
  const chartData: { h: number; kwh: number }[] = [];
  for (let i = 0; i <= 12; i++) {
    const h = (hours * i) / 12;
    chartData.push({ h: Number(h.toFixed(2)), kwh: Number(((power / 1000) * h).toFixed(3)) });
  }
  return { voltage, current, power, resistance, hours, energyKwh, cost, rate, chartData };
}

const DEFAULTS = { voltage: "120", current: "10", hours: "2", rate: "0.15" };

const faqs = [
  { question: "What is electric power?", answer: "Power is the rate of energy use: P = V × I. A 120 V appliance drawing 10 A consumes 1,200 W. In AC circuits with phase shift, multiply by the power factor: P = V·I·cos(φ)." },
  { question: "How is energy billed?", answer: "Energy = power × time, billed in kilowatt-hours. 1,200 W for 2 hours is 2.4 kWh; at $0.15/kWh that costs $0.36. Power is instantaneous; energy accumulates." },
  { question: "How do I find resistance from voltage and current?", answer: "Ohm's law: R = V ÷ I. At 120 V and 10 A the load is 12 Ω. Knowing resistance helps size fuses and check whether a device's current draw is healthy." },
];

export default function ElectricPowerCalculator() {
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [result, setResult] = useState<PowerResult>(() => calcPower(120, 10, 2, 0.15));

  useEffect(() => {
    const v = parseFloat(voltage);
    const i = parseFloat(current);
    const h = parseFloat(hours);
    const r = parseFloat(rate);
    if (!isNaN(v) && !isNaN(i) && !isNaN(h) && !isNaN(r) && v >= 0 && i >= 0 && h >= 0 && r >= 0) setResult(calcPower(v, i, h, r));
  }, [voltage, current, hours, rate]);

  const reset = () => { setVoltage(DEFAULTS.voltage); setCurrent(DEFAULTS.current); setHours(DEFAULTS.hours); setRate(DEFAULTS.rate); };
  const invalid = isNaN(parseFloat(voltage)) || isNaN(parseFloat(current)) || isNaN(parseFloat(hours)) || isNaN(parseFloat(rate)) || parseFloat(voltage) < 0 || parseFloat(current) < 0 || parseFloat(hours) < 0 || parseFloat(rate) < 0;

  const breakdown = [
    { label: "Voltage", value: `${result.voltage.toFixed(1)} V` },
    { label: "Current", value: `${result.current.toFixed(1)} A` },
    { label: "Power (P = V × I)", value: `${result.power.toLocaleString()} W`, highlight: true },
    { label: "Power (kW)", value: `${(result.power / 1000).toFixed(2)} kW` },
    { label: "Resistance (R = V ÷ I)", value: `${result.resistance.toFixed(2)} Ω` },
    { label: `Energy for ${result.hours.toFixed(1)} h`, value: `${result.energyKwh.toFixed(2)} kWh` },
    { label: "Electricity Cost", value: `$${result.cost.toFixed(2)} @ $${result.rate.toFixed(2)}/kWh` },
  ];

  const summaryStats = [
    { label: "Power", value: `${result.power.toLocaleString()} W` },
    { label: "Energy", value: `${result.energyKwh.toFixed(2)} kWh` },
    { label: "Cost", value: `$${result.cost.toFixed(2)}` },
    { label: "Resistance", value: `${result.resistance.toFixed(2)} Ω` },
    { label: "Voltage", value: `${result.voltage.toFixed(0)} V` },
    { label: "Current", value: `${result.current.toFixed(1)} A` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Electric Power Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Electric Power Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ep-v" className="block text-sm font-medium mb-1 text-foreground">Voltage (V)</label>
                <input id="ep-v" type="number" min="0" step="1" value={voltage} onChange={(e) => setVoltage(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ep-i" className="block text-sm font-medium mb-1 text-foreground">Current (A)</label>
                <input id="ep-i" type="number" min="0" step="0.1" value={current} onChange={(e) => setCurrent(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ep-h" className="block text-sm font-medium mb-1 text-foreground">Usage Time (hours)</label>
                <input id="ep-h" type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ep-rate" className="block text-sm font-medium mb-1 text-foreground">Rate ($/kWh)</label>
                <input id="ep-rate" type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <PlugZap className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter non-negative values for all fields.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Electric Power</div>
              <div className="text-4xl font-extrabold text-primary">{result.power.toLocaleString()} W</div>
              <div className="text-sm text-muted-foreground mt-1">{result.voltage.toFixed(0)} V × {result.current.toFixed(1)} A · {result.energyKwh.toFixed(2)} kWh costs ${result.cost.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Resistance</div>
                <div className="text-lg font-bold text-primary">{result.resistance.toFixed(1)} Ω</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Energy ({result.hours} h)</div>
                <div className="text-lg font-bold text-primary">{result.energyKwh.toFixed(2)} kWh</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cost</div>
                <div className="text-lg font-bold text-primary">${result.cost.toFixed(2)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Energy Accumulation Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="h" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} label={{ value: "hours", position: "insideBottom", fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} kWh`, "Energy"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="kwh" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#energyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Cumulative energy at {(result.power / 1000).toFixed(2)} kW</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Electric Power Calculator</h2>
            <p>Power is the product of voltage and current: P = V × I. At 120 V and 10 A, a space heater draws 1,200 W. Over 2 hours it consumes 2.4 kWh, and at $0.15/kWh that is $0.36 — the calculation behind every appliance energy label.</p>
            <h3>Power, Energy, and Cost</h3>
            <p>Power (watts) is instantaneous; energy (kWh) is power integrated over time; cost is energy times the rate. Appliances list power because it determines both current draw (circuit sizing) and cost (via usage time). The derived resistance R = V/I is useful for load checks and fuse selection.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/electric-power-calculator" />
          <PopularCalculators exclude="/calculator/electric-power-calculator" />
        </div>
      </div>
    </>
  );
}
