"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RunPaceResult { paceMinPerKm: string; paceMinPerMile: string; speed: number; calPerHour: number; calTotal: number; finishTime: string; }
const DEFAULTS = { distance: "10", hours: "0", minutes: "50", seconds: "0", weight: "70", unit: "km" };

function calcPace(d: typeof DEFAULTS): RunPaceResult {
  const dist = parseFloat(d.distance) || 0;
  const totalSec = (parseFloat(d.hours)||0)*3600 + (parseFloat(d.minutes)||0)*60 + (parseFloat(d.seconds)||0);
  const weight = parseFloat(d.weight) || 70;
  if (dist === 0 || totalSec === 0) return { paceMinPerKm: "0:00", paceMinPerMile: "0:00", speed: 0, calPerHour: 0, calTotal: 0, finishTime: "0:00:00" };
  const distKm = d.unit === "miles" ? dist * 1.60934 : dist;
  const secPerKm = totalSec / distKm;
  const speed = distKm / (totalSec / 3600);
  const met = speed < 6 ? 6 : speed < 8 ? 8 : speed < 10 ? 10 : speed < 12 ? 11.5 : 13.5;
  const calPerHour = met * weight;
  const calTotal = calPerHour * (totalSec / 3600);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,"0")}`;
  const fmtT = (s: number) => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(Math.round(s%60)).padStart(2,"0")}`;
  return {
    paceMinPerKm: fmt(secPerKm),
    paceMinPerMile: fmt(secPerKm * 1.60934),
    speed: +speed.toFixed(2),
    calPerHour: Math.round(calPerHour),
    calTotal: Math.round(calTotal),
    finishTime: fmtT(totalSec),
  };
}

export default function RunningPaceCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<RunPaceResult>(() => calcPace(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calcPace(f));
  const reset = () => { setF(DEFAULTS); setR(calcPace(DEFAULTS)); };

  const pacesByDist = [5, 10, 21.1, 42.2].map(d => {
    const base = parseFloat(f.distance) || 10;
    const sec = (parseFloat(f.hours)||0)*3600 + (parseFloat(f.minutes)||0)*60 + (parseFloat(f.seconds)||0);
    const secPerKm = sec / (f.unit === "miles" ? base * 1.60934 : base);
    const finish = secPerKm * d;
    return {
      distance: d === 21.1 ? "Half Marathon" : d === 42.2 ? "Marathon" : `${d}K`,
      timeHrs: +(finish / 3600).toFixed(2),
    };
  });

  const faqs = [
    { question: "How do I calculate running pace?", answer: "Pace = Total Time ÷ Distance. For a 10K run in 50 minutes: 50 ÷ 10 = 5:00 min/km. In miles: 50 ÷ 6.21 = 8:03 min/mile. This calculator also converts between km and mile pace automatically." },
    { question: "What is a good running pace?", answer: "Beginner: 7–9 min/km. Intermediate: 5–7 min/km. Advanced: 4–5 min/km. Elite amateur: under 4 min/km. Elite marathon: ~2:50/km (sub-2-hour pace is 2:50/km). Context matters — 5 min/km for a 5K is different from 5 min/km for a marathon." },
    { question: "How are running calories calculated?", answer: "Running calorie burn uses MET (Metabolic Equivalent of Task) values: Calories = MET × Body Weight (kg) × Duration (hours). MET values increase with speed: jogging 6 km/h ≈ MET 6, running 10 km/h ≈ MET 10, racing 14+ km/h ≈ MET 13.5+." },
    { question: "What pace do I need for a sub-4-hour marathon?", answer: "Sub-4:00 marathon requires average pace under 5:41/km (9:09/mile). Sub-3:30 requires under 4:58/km. Sub-3:00 requires under 4:15/km. Our calculator projects your current pace to all standard race distances." },
    { question: "How do I improve my running pace?", answer: "Key training elements: tempo runs at race pace, interval training (800m repeats at faster than race pace), long slow runs for aerobic base, hill training for strength, and consistent weekly mileage progression (no more than 10% increase per week)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Running Pace Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Running Pace Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Distance</label>
                <input type="number" value={f.distance} onChange={e => set("distance")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Unit</label>
                <select value={f.unit} onChange={e => set("unit")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="km">Kilometers</option><option value="miles">Miles</option>
                </select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["hours","minutes","seconds"] as const).map(k => (
                <div key={k} className="flex flex-col">
                  <label className="text-sm font-semibold mb-1 capitalize">{k}</label>
                  <input type="number" value={f[k]} onChange={e => set(k)(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
              ))}
            </div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Body Weight (kg) — for calorie estimate</label>
              <input type="number" value={f.weight} onChange={e => set("weight")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Pace</div>
              <div className="text-5xl font-extrabold text-foreground">{r.paceMinPerKm}<span className="text-xl text-muted-foreground"> min/km</span></div>
              <div className="text-sm text-muted-foreground mt-1">{r.paceMinPerMile} min/mile · {r.speed} km/h · {r.calTotal} kcal burned</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Speed</div><div className="font-bold text-lg">{r.speed} km/h</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Cal/hour</div><div className="font-bold text-lg">{r.calPerHour}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Total Cals</div><div className="font-bold text-lg">{r.calTotal}</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Projected Finish Times at Current Pace</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pacesByDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="distance" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `${v}h`} tick={{ fontSize: 10 }} />
                    <RTooltip formatter={(v: number) => [`${Math.floor(v)}h ${Math.round((v % 1) * 60)}m`, "Finish Time"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="timeHrs" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Race Projections</h3></div>
              {pacesByDist.map((d, i) => (
                <div key={i} className="grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-secondary/20">
                  <span className="text-muted-foreground text-sm">{d.distance}</span>
                  <span className="text-right font-semibold text-sm">{Math.floor(d.timeHrs)}h {Math.round((d.timeHrs % 1) * 60)}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Use the Running Pace Calculator</h2>
            <p>Enter your distance, completion time, and body weight to instantly calculate pace per km and mile, running speed, calories burned, and projected finish times for all major race distances. Whether you are training for a 5K or targeting a sub-3-hour marathon, this tool provides the data you need to structure your training.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Running Pace</h2>
            <p>Pace is expressed as minutes per kilometer (min/km) or minutes per mile (min/mile) — the time it takes to cover one unit of distance. Speed is the inverse: kilometers (or miles) per hour. Pace = 60 ÷ Speed. At 10 km/h, your pace is 6:00/km. At 12 km/h, it&apos;s 5:00/km. Elite marathon runners sustain approximately 3:00/km (20 km/h) for 42.2 kilometers.</p>
            <h2 className="text-2xl font-bold mb-3">Calorie Burn During Running</h2>
            <p>Running burns roughly 70 calories per kilometer for a 70 kg runner — largely independent of speed (slower speed burns the same calories over a given distance, just takes longer). The MET-based formula used here accounts for the increase in energy expenditure at higher intensities. For weight management, total calorie burn matters most — longer slower runs burn as many calories as shorter faster ones covering the same distance.</p>
            <h2 className="text-2xl font-bold mb-3">Training Pace Zones</h2>
            <p>Easy pace: 65–75% max HR, 90–120 seconds/km slower than race pace. Tempo: 80–88% max HR, approximately 20–30 sec/km slower than 10K race pace. Intervals: 90–95% max HR, faster than 5K race pace. Long run: same as easy pace, used to build aerobic base and fat-burning efficiency. 80% of training volume should be easy, 20% quality (tempo + intervals).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/running-pace-calculator" />
          <PopularCalculators exclude="/calculator/running-pace-calculator" />
        </div>
      </div>
    </>
  );
}
