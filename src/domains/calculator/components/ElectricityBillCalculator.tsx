"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BillResult {
  power: number;
  hours: number;
  days: number;
  rate: number;
  kwhPerDay: number;
  kwhPerMonth: number;
  costPerDay: number;
  costPerMonth: number;
  chartData: { name: string; value: number }[];
}

function calcBill(power: number, hours: number, days: number, rate: number): BillResult {
  const kwhPerDay = (power / 1000) * hours;
  const kwhPerMonth = kwhPerDay * days;
  const costPerDay = kwhPerDay * rate;
  const costPerMonth = kwhPerMonth * rate;
  const chartData = [
    { name: "Cost / Day", value: Number(costPerDay.toFixed(2)) },
    { name: "Cost / Month", value: Number(costPerMonth.toFixed(2)) },
  ];
  return { power, hours, days, rate, kwhPerDay, kwhPerMonth, costPerDay, costPerMonth, chartData };
}

const DEFAULTS = { power: "1500", hours: "3", days: "30", rate: "0.15" };

const faqs = [
  { question: "How is my electricity bill estimated?", answer: "Energy = power × usage time: a 1,500 W appliance run 3 hours a day uses 4.5 kWh daily. Monthly cost = kWh × days × rate. For 30 days at $0.15/kWh that is $20.25." },
  { question: "Why do rates vary?", answer: "Utilities charge per-kWh prices that vary by region, time of day (time-of-use plans), and tier (more usage = higher bracket). This calculator uses a flat rate; check your bill for your actual marginal rate." },
  { question: "How can I lower the bill?", answer: "Cut hours first (turn off standby devices — they draw 1–10 W each), then replace high-wattage resistive loads (heaters, dryers) with efficient ones. Each 100 W saved for 3 h/day at $0.15 saves ~$1.35/month." },
];

export default function ElectricityBillCalculator() {
  const [power, setPower] = useState(DEFAULTS.power);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [result, setResult] = useState<BillResult>(() => calcBill(1500, 3, 30, 0.15));

  useEffect(() => {
    const p = parseFloat(power);
    const h = parseFloat(hours);
    const d = parseFloat(days);
    const r = parseFloat(rate);
    if (!isNaN(p) && !isNaN(h) && !isNaN(d) && !isNaN(r) && p >= 0 && h >= 0 && d >= 0 && r >= 0) setResult(calcBill(p, h, d, r));
  }, [power, hours, days, rate]);

  const reset = () => { setPower(DEFAULTS.power); setHours(DEFAULTS.hours); setDays(DEFAULTS.days); setRate(DEFAULTS.rate); };
  const invalid = isNaN(parseFloat(power)) || isNaN(parseFloat(hours)) || isNaN(parseFloat(days)) || isNaN(parseFloat(rate)) || parseFloat(power) < 0 || parseFloat(hours) < 0 || parseFloat(days) < 0 || parseFloat(rate) < 0;

  const breakdown = [
    { label: "Appliance Power", value: `${result.power.toLocaleString()} W` },
    { label: "Usage per Day", value: `${result.hours.toFixed(1)} hours` },
    { label: "Days per Month", value: `${result.days}` },
    { label: "Electricity Rate", value: `$${result.rate.toFixed(2)}/kWh` },
    { label: "Energy per Day", value: `${result.kwhPerDay.toFixed(2)} kWh` },
    { label: "Energy per Month", value: `${result.kwhPerMonth.toFixed(1)} kWh` },
    { label: "Cost per Day", value: `$${result.costPerDay.toFixed(2)}` },
    { label: "Cost per Month", value: `$${result.costPerMonth.toFixed(2)}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Monthly Cost", value: `$${result.costPerMonth.toFixed(2)}` },
    { label: "Daily Cost", value: `$${result.costPerDay.toFixed(2)}` },
    { label: "Monthly Energy", value: `${result.kwhPerMonth.toFixed(1)} kWh` },
    { label: "Daily Energy", value: `${result.kwhPerDay.toFixed(2)} kWh` },
    { label: "Power", value: `${result.power.toLocaleString()} W` },
    { label: "Annual Cost", value: `$${(result.costPerMonth * 12).toFixed(2)}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Electricity Bill Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Electricity Bill Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="eb-power" className="block text-sm font-medium mb-1 text-foreground">Appliance Power (W)</label>
              <input id="eb-power" type="number" min="0" step="10" value={power} onChange={(e) => setPower(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="eb-hours" className="block text-sm font-medium mb-1 text-foreground">Hours / Day</label>
                <input id="eb-hours" type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eb-days" className="block text-sm font-medium mb-1 text-foreground">Days / Month</label>
                <input id="eb-days" type="number" min="0" max="31" step="1" value={days} onChange={(e) => setDays(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="eb-rate" className="block text-sm font-medium mb-1 text-foreground">Electricity Rate ($/kWh)</label>
              <input id="eb-rate" type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Receipt className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter non-negative values for all fields.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Monthly Cost</div>
              <div className="text-4xl font-extrabold text-primary">${result.costPerMonth.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.kwhPerMonth.toFixed(1)} kWh/month · ${result.costPerDay.toFixed(2)}/day</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Daily Cost</div>
                <div className="text-lg font-bold text-primary">${result.costPerDay.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Daily Energy</div>
                <div className="text-lg font-bold text-primary">{result.kwhPerDay.toFixed(2)} kWh</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Annual Cost</div>
                <div className="text-lg font-bold text-primary">${(result.costPerMonth * 12).toFixed(2)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
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
              <h3 className="text-base font-bold mb-3">Daily vs Monthly Cost</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">About the Electricity Bill Calculator</h2>
            <p>The bill follows a three-step chain: power × time = energy, energy × rate = cost. A 1,500 W space heater on 3 hours a day burns 4.5 kWh daily; over 30 days that is 135 kWh, or $20.25 at $0.15/kWh — a meaningful share of a typical residential bill.</p>
            <h3>Finding the Biggest Savings</h3>
            <p>Resistive loads — space heaters, electric dryers, water heaters — dominate because they convert current directly to heat. Replacing or reducing them moves the needle far more than LED swaps. Use this calculator per appliance to rank where the money actually goes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/electricity-bill-calculator" />
          <PopularCalculators exclude="/calculator/electricity-bill-calculator" />
        </div>
      </div>
    </>
  );
}
