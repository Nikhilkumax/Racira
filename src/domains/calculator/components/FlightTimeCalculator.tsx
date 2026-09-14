"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Plane } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FlightResult {
  distance: number;
  speed: number;
  hours: number;
  minutes: number;
  formatted: string;
  timezoneOffset: number;
  chartData: { h: number; distance: number }[];
}

function calcFlight(distance: number, speed: number, offset: number): FlightResult {
  const hours = speed > 0 ? distance / speed : 0;
  const minutes = hours * 60;
  const fmt = () => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} h ${m} min`;
  };
  const chartData: { h: number; distance: number }[] = [];
  const steps = Math.max(1, Math.ceil(hours * 4));
  for (let i = 0; i <= steps; i++) {
    const h = (hours * i) / steps;
    chartData.push({ h: Number(h.toFixed(2)), distance: Number((speed * h).toFixed(0)) });
  }
  return { distance, speed, hours, minutes, formatted: fmt(), timezoneOffset: offset, chartData };
}

const DEFAULTS = { distance: "5000", speed: "800", offset: "0" };

const faqs = [
  { question: "How is flight time calculated?", answer: "Flight time = distance ÷ average ground speed. A 5,000 km flight at 800 km/h takes 6.25 hours. Real flights add taxi, climb, and holding time, and headwinds reduce ground speed." },
  { question: "Why does the clock time differ from flight time?", answer: "Departure and arrival are shown in different timezones. The local arrival time = departure + flight time + timezone offset — crossing west to east subtracts hours from the wall clock, not from the trip." },
  { question: "What is a realistic cruise speed?", answer: "Commercial jets cruise at 800–900 km/h true airspeed, but ground speed depends on winds: 800 km/h with a 100 km/h headwind gives 700 km/h over the ground. Use the ground-speed figure here." },
];

export default function FlightTimeCalculator() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [offset, setOffset] = useState(DEFAULTS.offset);
  const [result, setResult] = useState<FlightResult>(() => calcFlight(5000, 800, 0));

  useEffect(() => {
    const d = parseFloat(distance);
    const s = parseFloat(speed);
    const o = parseFloat(offset);
    if (!isNaN(d) && !isNaN(s) && !isNaN(o) && d >= 0 && s > 0) setResult(calcFlight(d, s, o));
  }, []);

  const handleCalculate = () => {
    const d = parseFloat(distance);
    const s = parseFloat(speed);
    const o = parseFloat(offset);
    if (!isNaN(d) && !isNaN(s) && !isNaN(o) && d >= 0 && s > 0) setResult(calcFlight(d, s, o));
  };
  const reset = () => { setDistance(DEFAULTS.distance); setSpeed(DEFAULTS.speed); setOffset(DEFAULTS.offset); setResult(calcFlight(parseFloat(DEFAULTS.distance), parseFloat(DEFAULTS.speed), parseFloat(DEFAULTS.offset))); };
  const invalid = isNaN(parseFloat(distance)) || isNaN(parseFloat(speed)) || isNaN(parseFloat(offset)) || parseFloat(distance) < 0 || parseFloat(speed) <= 0;

  const breakdown = [
    { label: "Distance", value: `${result.distance.toLocaleString()} km (${(result.distance / 1.609).toLocaleString("en-US", { maximumFractionDigits: 0 })} mi)` },
    { label: "Average Ground Speed", value: `${result.speed.toLocaleString()} km/h` },
    { label: "Flight Duration", value: result.formatted, highlight: true },
    { label: "Duration (hours)", value: `${result.hours.toFixed(2)} h` },
    { label: "Duration (minutes)", value: `${Math.round(result.minutes).toLocaleString()} min` },
    { label: "Timezone Offset", value: result.timezoneOffset > 0 ? `+${result.timezoneOffset} h` : `${result.timezoneOffset} h` },
    { label: "Clock-Time Shift", value: result.timezoneOffset > 0 ? `Arrive ${result.timezoneOffset} h later on the clock` : result.timezoneOffset < 0 ? `Arrive ${Math.abs(result.timezoneOffset)} h earlier on the clock` : "Same timezone" },
  ];

  const summaryStats = [
    { label: "Flight Time", value: result.formatted },
    { label: "Hours", value: `${result.hours.toFixed(2)} h` },
    { label: "Minutes", value: `${Math.round(result.minutes).toLocaleString()}` },
    { label: "Distance", value: `${result.distance.toLocaleString()} km` },
    { label: "Speed", value: `${result.speed.toLocaleString()} km/h` },
    { label: "Offset", value: `${result.timezoneOffset > 0 ? "+" : ""}${result.timezoneOffset} h` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Flight Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Flight Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="ft-dist" className="block text-sm font-medium mb-1 text-foreground">Flight Distance (km)</label>
              <input id="ft-dist" type="number" min="0" step="100" value={distance} onChange={(e) => setDistance(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="ft-speed" className="block text-sm font-medium mb-1 text-foreground">Average Ground Speed (km/h)</label>
              <input id="ft-speed" type="number" min="1" step="10" value={speed} onChange={(e) => setSpeed(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">Commercial jets: 800–900 km/h ground speed</p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Advanced Options</div>
              <label htmlFor="ft-offset" className="block text-sm font-medium mb-1 text-foreground">Arrival Timezone Offset (h)</label>
              <input id="ft-offset" type="number" min="-12" max="14" step="1" value={offset} onChange={(e) => setOffset(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-2">Departure − arrival timezone, in hours (e.g., +3 if you land 3 h ahead)</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Plane className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative distance and a positive speed.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Flight Duration</div>
              <div className="text-4xl font-extrabold text-primary">{result.formatted}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.distance.toLocaleString()} km at {result.speed.toLocaleString()} km/h</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Hours</div>
                <div className="text-lg font-bold text-primary">{result.hours.toFixed(2)} h</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Minutes</div>
                <div className="text-lg font-bold text-primary">{Math.round(result.minutes).toLocaleString()} min</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Clock Shift</div>
                <div className="text-lg font-bold text-primary">{result.timezoneOffset > 0 ? `+${result.timezoneOffset} h` : result.timezoneOffset < 0 ? `${result.timezoneOffset} h` : "Same"}</div>
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
              <h3 className="text-base font-bold mb-3">Distance Covered Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="flightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="h" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} label={{ value: "hours", position: "insideBottom", fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} km`, "Distance"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="distance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#flightGrad)" />
                </AreaChart>
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
            <h2 className="text-2xl font-bold mb-3">About the Flight Time Calculator</h2>
            <p>Block-to-block time is distance divided by ground speed. A 5,000 km flight at 800 km/h ground speed takes 6.25 hours. Actual schedules add 15–40 minutes of taxi, climb, and approach, and winds can shift ground speed by ±100 km/h.</p>
            <h3>Clock vs. Trip Time</h3>
            <p>The wall-clock arrival is flight time plus the timezone offset: flying 6 hours east from New York to London lands roughly 6 hours later on the local clock (offset +1 vs UTC both ways, roughly canceling). Use the offset field to distinguish 'how long the trip is' from 'what time it will be' at the destination.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/flight-time-calculator" />
          <PopularCalculators exclude="/calculator/flight-time-calculator" />
        </div>
      </div>
    </>
  );
}
