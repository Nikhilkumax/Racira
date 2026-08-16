"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Waves } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type UnitKey = "lps" | "lpm" | "m3h" | "gpm" | "cfs" | "gph";

const units: { key: UnitKey; label: string; lps: number }[] = [
  { key: "lps", label: "Liters/second (L/s)", lps: 1 },
  { key: "lpm", label: "Liters/minute (L/min)", lps: 1 / 60 },
  { key: "m3h", label: "Cubic meters/hour (m³/h)", lps: 1 / 3.6 },
  { key: "gpm", label: "US gallons/minute (GPM)", lps: 0.0630902 },
  { key: "cfs", label: "Cubic feet/second (ft³/s)", lps: 28.316847 },
  { key: "gph", label: "US gallons/hour (GPH)", lps: 0.0010515032 },
];

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 4 });

const faqs = [
  { question: "What is volumetric flow rate?", answer: "Flow rate is volume passing a point per unit time — L/s, GPM, or ft³/s. It scales directly with velocity and pipe area: Q = v × A." },
  { question: "How do the units convert?", answer: "All units normalize through liters per second: 1 L/min = 1/60 L/s, 1 m³/h = 1/3.6 L/s, 1 GPM ≈ 0.0631 L/s, and 1 ft³/s ≈ 28.32 L/s (a cubic foot is 28.32 liters)." },
  { question: "Which unit should I use?", answer: "Engineering uses m³/h and L/s; plumbing and irrigation in the US use GPM; hydrology and HVAC use ft³/s (CFS). A typical home faucet flows ~2 GPM ≈ 7.6 L/min ≈ 0.126 L/s." },
];

export default function FlowRateConverter() {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<UnitKey>("lpm");
  const [to, setTo] = useState<UnitKey>("gpm");
  const [result, setResult] = useState<{ lps: number; converted: number; toLabel: string }>(() => {
    const lps = 100 / 60;
    return { lps, converted: lps / 0.0630902, toLabel: "US gallons/minute (GPM)" };
  });

  useEffect(() => {
    const v = parseFloat(value);
    if (!isNaN(v) && v >= 0) {
      const lps = v * units.find(u => u.key === from)!.lps;
      const converted = lps / units.find(u => u.key === to)!.lps;
      setResult({ lps, converted, toLabel: units.find(u => u.key === to)!.label });
    }
  }, [value, from, to]);

  const reset = () => { setValue("100"); setFrom("lpm"); setTo("gpm"); };
  const invalid = isNaN(parseFloat(value)) || parseFloat(value) < 0;

  const breakdown = [
    { label: "Input", value: `${parseFloat(value) || 0} ${from}` },
    { label: "In L/s", value: `${fmt(result.lps)} L/s` },
    { label: "Converted Value", value: `${fmt(result.converted)} ${to}`, highlight: true },
    { label: "In m³/h", value: `${fmt(result.lps * 3.6)} m³/h` },
    { label: "In GPM", value: `${fmt(result.lps / 0.0630902)} GPM` },
    { label: "In ft³/s", value: `${fmt(result.lps / 28.316847)} ft³/s` },
  ];

  const summaryStats = [
    { label: "Converted", value: `${fmt(result.converted)} ${to}` },
    { label: "L/s", value: `${fmt(result.lps)}` },
    { label: "L/min", value: `${fmt(result.lps * 60)}` },
    { label: "m³/h", value: `${fmt(result.lps * 3.6)}` },
    { label: "GPM", value: `${fmt(result.lps / 0.0630902)}` },
    { label: "ft³/s", value: `${fmt(result.lps / 28.316847)}` },
  ];

  const chartData = [
    { name: `From (${from})`, value: parseFloat(value) || 0 },
    { name: `To (${to})`, value: Number(result.converted.toFixed(4)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Flow Rate Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Flow Rate Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="fr-value" className="block text-sm font-medium mb-1 text-foreground">Flow Rate</label>
              <input id="fr-value" type="number" min="0" step="1" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fr-from" className="block text-sm font-medium mb-1 text-foreground">From</label>
                <select id="fr-from" value={from} onChange={(e) => setFrom(e.target.value as UnitKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="fr-to" className="block text-sm font-medium mb-1 text-foreground">To</label>
                <select id="fr-to" value={to} onChange={(e) => setTo(e.target.value as UnitKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Waves className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative flow rate.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Flow Rate</div>
              <div className="text-4xl font-extrabold text-primary">{fmt(result.converted)} <span className="text-xl font-bold">{to}</span></div>
              <div className="text-sm text-muted-foreground mt-1">{fmt(result.lps)} L/s total</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">L/s</div>
                <div className="text-lg font-bold text-primary">{fmt(result.lps)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">m³/h</div>
                <div className="text-lg font-bold text-primary">{fmt(result.lps * 3.6)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">GPM</div>
                <div className="text-lg font-bold text-primary">{fmt(result.lps / 0.0630902)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
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
              <h3 className="text-base font-bold mb-3">Value in From vs To Unit</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Flow"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Flow Rate Converter</h2>
            <p>Volumetric flow rate measures volume per unit time and converts cleanly through liters per second. 100 L/min = 1.667 L/s ≈ 26.4 GPM — a common irrigation pump rating. The conversions are exact multiples: a minute has 60 seconds, an hour 3,600, and a cubic foot holds 28.317 liters.</p>
            <h3>Flow in Context</h3>
            <p>Flow connects velocity and pipe size: Q = v × A, so doubling pipe area doubles flow at the same velocity. It is the quantity that actually moves water, coolant, or gas through a system — pump curves are quoted in GPM or m³/h precisely because that is what the pump delivers.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/flow-rate-converter" />
          <PopularCalculators exclude="/calculator/flow-rate-converter" />
        </div>
      </div>
    </>
  );
}
