"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type SpeedUnit = "mps" | "kmh" | "mph" | "kn" | "fps" | "mach";
const units: { key: SpeedUnit; label: string; short: string; toMps: number }[] = [
  { key: "mps", label: "Meters per Second", short: "m/s", toMps: 1 },
  { key: "kmh", label: "Kilometers per Hour", short: "km/h", toMps: 1 / 3.6 },
  { key: "mph", label: "Miles per Hour", short: "mph", toMps: 0.44704 },
  { key: "kn", label: "Knots", short: "kn", toMps: 0.514444 },
  { key: "fps", label: "Feet per Second", short: "ft/s", toMps: 0.3048 },
  { key: "mach", label: "Mach (at sea level)", short: "M", toMps: 340.29 },
];

const fmt = (n: number) => {
  if (n === 0) return "0";
  if (Math.abs(n) >= 0.001 && Math.abs(n) < 1e8) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toExponential(4);
};

export default function SpeedConverter() {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<SpeedUnit>("kmh");
  const [to, setTo] = useState<SpeedUnit>("mph");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const v = parseFloat(value) || 0;
  const fromUnit = units.find(u => u.key === from)!;
  const toUnit = units.find(u => u.key === to)!;
  const mps = v * fromUnit.toMps;
  const result = mps / toUnit.toMps;
  const chartData = units.map(u => ({ name: u.short, value: parseFloat((mps / u.toMps).toFixed(4)) }));
  const reset = () => { setValue("100"); setFrom("kmh"); setTo("mph"); };

  const faqs = [
    { question: "How do I convert km/h to mph?", answer: "Multiply the km/h value by 0.621371. For example, 100 km/h = 62.14 mph. To convert mph to km/h, multiply by 1.60934. A useful approximation: 60 mph ≈ 97 km/h (the exact value is 96.56 km/h)." },
    { question: "What is Mach speed?", answer: "Mach 1 is the speed of sound, which depends on air temperature, pressure, and density. At sea level and 15°C, Mach 1 ≈ 340.29 m/s ≈ 1,225 km/h ≈ 761 mph. At high altitude where air is colder, sound travels slower — Mach 1 at 30,000 ft is about 295 m/s." },
    { question: "What is a knot in km/h?", answer: "One knot equals 1.852 km/h exactly. This is because a knot is defined as one nautical mile (1,852 m) per hour. At 100 knots, a ship is traveling at 185.2 km/h or about 115 mph. Knots are the standard unit in maritime and aviation contexts." },
    { question: "How fast is the speed of light in km/h?", answer: "The speed of light in vacuum is exactly 299,792,458 m/s, which equals approximately 1,079,252,848 km/h (about 1.08 billion km/h) or 670,616,629 mph. This is Mach 874,030 at sea level conditions." },
    { question: "How do I convert meters per second to kilometers per hour?", answer: "Multiply m/s by 3.6 to get km/h. This is because 1 m/s = 1 meter × 3600 seconds/hour ÷ 1000 meters/km = 3.6 km/h. So 10 m/s = 36 km/h, and 30 m/s = 108 km/h." },
    { question: "What is the average human walking speed in different units?", answer: "The average human walking speed is about 1.4 m/s, 5 km/h, 3.1 mph, 2.7 knots, or 4.6 ft/s. Running pace for an average jogger is about 3 m/s (10.8 km/h, 6.7 mph). Elite marathon runners run at about 5.6 m/s (20 km/h, 12.4 mph)." },
    { question: "How fast is a Formula 1 car in different units?", answer: "Formula 1 cars reach top speeds of about 370 km/h (230 mph, 200 knots, 102.8 m/s, 337 ft/s, Mach 0.30) on the longest straight sections. Average race speeds are lower, typically 200–250 km/h due to corners and varying track conditions." },
    { question: "What units does aviation use for speed?", answer: "Aviation uses multiple speed conventions: Indicated Airspeed (IAS) and True Airspeed (TAS) measured in knots, Mach number for high-altitude jet aircraft, and Ground Speed (distance over Earth's surface per time) also in knots. Airspace speed limits are typically expressed in knots." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Converters", href: "/calculator#converters" }, { label: "Speed Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Speed Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Convert Speed Units</h2>
            <div className="flex flex-col">
              <label htmlFor="spd-val" className="text-sm font-semibold text-foreground mb-1">Value to Convert</label>
              <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input id="spd-val" type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["From Unit", from, setFrom], ["To Unit", to, setTo]].map(([lbl, val, setter]: any) => (
                <div key={lbl as string} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-foreground">{lbl as string}</label>
                  <select value={val as string} onChange={e => setter(e.target.value as SpeedUnit)} className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    {units.map(u => <option key={u.key} value={u.key}>{u.label} ({u.short})</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button type="button" onClick={reset} className="flex items-center justify-center gap-2 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-2xl font-bold mb-3">Conversion Result</h2>
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">{fromUnit.label} → {toUnit.label}</div>
                <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result)}</div>
                <div className="text-sm font-semibold text-muted-foreground">{toUnit.short}</div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Unit</th><th className="p-2.5 pr-3 text-right">Equivalent of {fmt(v)} {fromUnit.short}</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border/50">
                    {units.map(u => (
                      <tr key={u.key} className={`hover:bg-secondary/20 ${u.key === to ? "bg-primary/5" : ""}`}>
                        <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{u.label} ({u.short})</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-foreground">{fmt(mps / u.toMps)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mounted && (<>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Speed Scale Comparison</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`${val}`, "Value"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              
</>)}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Complete Guide to Speed Unit Conversion</h2>
            <p>Speed is defined as the rate at which an object covers distance over time. Different fields and regions use different speed units, making conversions essential for science, transportation, sports, and engineering. This converter handles all major speed units: meters per second (m/s), kilometers per hour (km/h), miles per hour (mph), knots (kn), feet per second (ft/s), and Mach numbers.</p>
            <p>The SI base unit for speed is meters per second (m/s). However, km/h is the most commonly used unit globally for road speeds and weather, mph is standard in the United States and United Kingdom, and knots are used universally in aviation and maritime navigation. Mach numbers are used for supersonic and high-altitude flight where the speed of sound is a critical reference point.</p>
            <h2 className="text-2xl font-bold mb-3">Meters per Second (m/s) — The SI Unit</h2>
            <p>The meter per second is the SI-derived unit of speed, defined as the distance in meters an object travels in one second. It is the standard unit in physics and scientific calculations. Common reference speeds: light in vacuum = 299,792,458 m/s; sound in air at sea level ≈ 340 m/s; a typical car on a highway ≈ 28 m/s (100 km/h); a human sprinter ≈ 10 m/s; and a pedestrian ≈ 1.4 m/s.</p>
            <h2 className="text-2xl font-bold mb-3">Kilometers per Hour (km/h)</h2>
            <p>Kilometers per hour is the most widely used speed unit globally for road transportation. Nearly every country outside the United States displays road speed limits in km/h. The conversion is: 1 km/h = 1000/3600 m/s ≈ 0.2778 m/s. Common reference speeds: urban speed limit = 50 km/h; highway = 100–130 km/h; high-speed rail = 300–350 km/h; commercial aircraft cruising = 850–900 km/h.</p>
            <h2 className="text-2xl font-bold mb-3">Miles per Hour (mph)</h2>
            <p>Miles per hour is the standard road speed unit in the United States, United Kingdom, and a few other countries. 1 mph = 0.44704 m/s = 1.60934 km/h. Road speed limits in the US are typically 25 mph in urban areas, 55–65 mph on highways, and 75–80 mph on interstates. NASCAR speeds reach 200+ mph on superspeedways.</p>
            <h2 className="text-2xl font-bold mb-3">Knots — Aviation and Maritime Standard</h2>
            <p>The knot is defined as one nautical mile per hour = 1.852 km/h = 0.514444 m/s. It is the universal standard in aviation and maritime contexts because nautical miles relate directly to Earth's coordinate system. Commercial aircraft cruise at 450–500 knots true airspeed. Container ships travel at 20–24 knots. The America's Cup sailing competition features vessels exceeding 50 knots.</p>
            <h2 className="text-2xl font-bold mb-3">Mach Number — Supersonic Flight</h2>
            <p>The Mach number expresses speed as a ratio to the local speed of sound. At sea level and 15°C, Mach 1 = 340.29 m/s = 1,225 km/h = 761 mph. At 30,000 ft altitude (cruise altitude for jets), Mach 1 ≈ 295 m/s because cold air slows sound propagation. Commercial aircraft cruise at Mach 0.78–0.85. The Concorde cruised at Mach 2. The SR-71 Blackbird reconnaissance aircraft reached Mach 3.3.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/speed-converter" />
          <PopularCalculators exclude="/calculator/speed-converter" />
        </div>
      </div>
    </>
  );
}
