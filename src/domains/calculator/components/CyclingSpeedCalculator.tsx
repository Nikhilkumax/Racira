"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SpeedResult {
  distance: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
  speed: number;
  pacePerKm: number;
  pacePerMile: number;
  pacePerKmText: string;
  pacePerMileText: string;
}

function calcSpeed(distance: number, hours: number, minutes: number): SpeedResult {
  const totalMinutes = hours * 60 + minutes;
  const speed = totalMinutes > 0 ? distance / (totalMinutes / 60) : 0;
  const pacePerKm = speed > 0 ? 60 / speed : 0;
  const pacePerMile = speed > 0 ? 60 / (speed * 1.609344) : 0;
  const fmtPace = (sec: number) => {
    const m = Math.floor(sec);
    const s = Math.round((sec - m) * 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  return {
    distance, hours, minutes, totalMinutes, speed,
    pacePerKm, pacePerMile,
    pacePerKmText: fmtPace(pacePerKm),
    pacePerMileText: fmtPace(pacePerMile),
  };
}

const DEFAULTS = { distance: "40", hours: "2", minutes: "0" };

const faqs = [
  { question: "What is a good average cycling speed?", answer: "Recreational riders average 16–22 km/h on mixed terrain; club rides 25–30 km/h; competitive riders 35+ km/h. Speed depends heavily on terrain, wind, bike, and fitness." },
  { question: "How is average speed calculated?", answer: "Average speed = total distance ÷ total moving time. It is a simple ratio — total time includes stops and red lights, which drags the average down, so use moving time for training comparisons." },
  { question: "How do I improve my average speed?", answer: "Ride more in zone 2 for endurance, add weekly intervals, reduce weight and rolling resistance, and improve aerodynamics — position and tight kit matter more than bike weight at speed." },
];

export default function CyclingSpeedCalculator() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [result, setResult] = useState<SpeedResult>(() => calcSpeed(40, 2, 0));

  useEffect(() => {
    const d = parseFloat(distance);
    const h = parseFloat(hours);
    const m = parseFloat(minutes);
    if (!isNaN(d) && !isNaN(h) && !isNaN(m) && d >= 0 && h >= 0 && m >= 0 && h + m > 0) setResult(calcSpeed(d, h, m));
  }, [distance, hours, minutes]);

  const reset = () => { setDistance(DEFAULTS.distance); setHours(DEFAULTS.hours); setMinutes(DEFAULTS.minutes); };
  const invalid = isNaN(parseFloat(distance)) || isNaN(parseFloat(hours)) || isNaN(parseFloat(minutes)) || parseFloat(distance) < 0 || parseFloat(hours) < 0 || parseFloat(minutes) < 0 || parseFloat(hours) + parseFloat(minutes) <= 0;

  const speedMph = result.speed / 1.609344;

  const breakdown = [
    { label: "Distance", value: `${result.distance.toLocaleString()} km` },
    { label: "Ride Time", value: `${result.hours > 0 ? `${Math.floor(result.hours)} h ` : ""}${Math.round(result.minutes)} min (${result.totalMinutes} min)` },
    { label: "Average Speed", value: `${result.speed.toFixed(1)} km/h (${speedMph.toFixed(1)} mph)`, highlight: true },
    { label: "Pace per km", value: `${result.pacePerKmText} min/km` },
    { label: "Pace per mile", value: `${result.pacePerMileText} min/mi` },
    { label: "Time per 10 km", value: `${Math.floor(result.pacePerKm * 10)}:${(Math.round((result.pacePerKm * 10 - Math.floor(result.pacePerKm * 10)) * 60)).toString().padStart(2, "0")} min` },
  ];

  const summaryStats = [
    { label: "Average Speed", value: `${result.speed.toFixed(1)} km/h` },
    { label: "Speed (mph)", value: `${speedMph.toFixed(1)} mph` },
    { label: "Pace per km", value: `${result.pacePerKmText} min/km` },
    { label: "Pace per mile", value: `${result.pacePerMileText} min/mi` },
    { label: "Ride Time", value: `${result.totalMinutes} min` },
    { label: "Distance", value: `${result.distance.toLocaleString()} km` },
  ];

  const chartData = [
    { name: "Your Speed", value: Math.round(result.speed) },
    { name: "Recreational (20)", value: 20 },
    { name: "Club Ride (28)", value: 28 },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cycling Speed Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cycling Speed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="cs-dist" className="block text-sm font-medium mb-1 text-foreground">Distance (km)</label>
              <input id="cs-dist" type="number" min="0" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cs-hours" className="block text-sm font-medium mb-1 text-foreground">Hours</label>
                <input id="cs-hours" type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cs-mins" className="block text-sm font-medium mb-1 text-foreground">Minutes</label>
                <input id="cs-mins" type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Gauge className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative distance and a ride time greater than zero.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Average Speed</div>
              <div className="text-4xl font-extrabold text-primary">{result.speed.toFixed(1)} km/h</div>
              <div className="text-sm text-muted-foreground mt-1">{result.distance.toLocaleString()} km in {result.totalMinutes} min · {result.pacePerKmText} min/km</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Pace / km</div>
                <div className="text-lg font-bold text-primary">{result.pacePerKmText} min/km</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Pace / mile</div>
                <div className="text-lg font-bold text-primary">{result.pacePerMileText} min/mi</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Speed (mph)</div>
                <div className="text-lg font-bold text-primary">{speedMph.toFixed(1)} mph</div>
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
              <h3 className="text-base font-bold mb-3">Your Speed vs Reference Paces (km/h)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} km/h`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Reference bars: typical recreational and club-ride averages</p>
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
            <h2 className="text-2xl font-bold mb-3">About the Cycling Speed Calculator</h2>
            <p>Average speed is distance divided by total time: 40 km in 2 hours is 20 km/h. Pace — the inverse — is the time per unit distance (minutes per km or mile), which most riders find easier to plan with on long rides.</p>
            <h3>Speed Realities</h3>
            <p>At 25 km/h, roughly 80% of a rider's power goes to overcoming air resistance, and the power requirement rises with the cube of speed — going 10% faster needs about 33% more power. That is why group riding and drafting matter so much on the flat.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cycling-speed-calculator" />
          <PopularCalculators exclude="/calculator/cycling-speed-calculator" />
        </div>
      </div>
    </>
  );
}
