"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface VDOTResult { vdot: number; easyPace: string; tempoPace: string; intervalPace: string; racePaces: { dist: string; time: string }[]; }

function calcVDOT(d: { distance: string; hours: string; minutes: string; seconds: string }): VDOTResult {
  const distMap: Record<string, number> = { "1500m": 1.5, "mile": 1.60934, "3000m": 3, "5k": 5, "8k": 8, "10k": 10, "half": 21.0975, "marathon": 42.195 };
  const distKm = distMap[d.distance] || 10;
  const totalMin = (parseFloat(d.hours)||0)*60 + (parseFloat(d.minutes)||0) + (parseFloat(d.seconds)||0)/60;
  if (totalMin === 0) return { vdot: 0, easyPace: "0:00", tempoPace: "0:00", intervalPace: "0:00", racePaces: [] };
  const speed = distKm / (totalMin / 60);
  const vo2 = (-4.60 + 0.182258 * speed + 0.000104 * speed * speed);
  const vo2max = vo2 / (-0.2989558 + 0.0139322 * totalMin + 0.000005 * totalMin * totalMin);
  const vdot = Math.max(20, Math.min(85, vo2max));
  const fmtPace = (minPerKm: number) => `${Math.floor(minPerKm)}:${String(Math.round((minPerKm % 1) * 60)).padStart(2,"0")}`;
  const easySpeed = 0.7 * vdot * 0.4; const easyPace = 60 / (easySpeed || 1);
  const tempoSpeed = 0.875 * vdot * 0.4; const tempoPace = 60 / (tempoSpeed || 1);
  const iSpeed = vdot * 0.4; const intervalPace = 60 / (iSpeed || 1);
  const raceDists = [
    { dist: "5K", km: 5 }, { dist: "10K", km: 10 }, { dist: "Half Marathon", km: 21.0975 }, { dist: "Marathon", km: 42.195 },
  ];
  const racePaces = raceDists.map(({ dist, km }) => {
    const raceSpeed = vdot * 0.38;
    const mins = (km / raceSpeed) * 60;
    const h = Math.floor(mins / 60), m = Math.floor(mins % 60), s = Math.round((mins * 60) % 60);
    return { dist, time: h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}` };
  });
  return { vdot: Math.round(vdot * 10) / 10, easyPace: fmtPace(easyPace), tempoPace: fmtPace(tempoPace), intervalPace: fmtPace(intervalPace), racePaces };
}

const DEFAULTS = { distance: "10k", hours: "0", minutes: "48", seconds: "0" };

export default function VdotCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<VDOTResult>(() => calcVDOT(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calcVDOT(f));
  const reset = () => { setF(DEFAULTS); setR(calcVDOT(DEFAULTS)); };

  const paceData = [
    { zone: "Easy", pace: parseFloat(r.easyPace.split(":")[0]) + parseFloat(r.easyPace.split(":")[1]) / 60, fill: "#10b981" },
    { zone: "Tempo", pace: parseFloat(r.tempoPace.split(":")[0]) + parseFloat(r.tempoPace.split(":")[1]) / 60, fill: "hsl(var(--primary))" },
    { zone: "Interval", pace: parseFloat(r.intervalPace.split(":")[0]) + parseFloat(r.intervalPace.split(":")[1]) / 60, fill: "#ef4444" },
  ];

  const faqs = [
    { question: "What is VDOT?", answer: "VDOT is a performance-based estimate of VO2max developed by legendary running coach Jack Daniels. It is derived from race performance and accounts for running economy — unlike lab VO2max which measures pure oxygen uptake capacity. VDOT is used to set precise training pace zones." },
    { question: "How is VDOT different from VO2max?", answer: "Lab VO2max measures maximum oxygen uptake in a controlled setting. VDOT is calculated from actual race performance, incorporating running economy (how efficiently you use oxygen). Two runners with the same VO2max can have different VDOTs if one has better running economy." },
    { question: "What is a good VDOT score?", answer: "VDOT 30–39: Recreational runner. 40–49: Competitive amateur. 50–59: Sub-elite. 60–69: Elite club runner. 70+: Elite/sub-elite national level. World-record marathon performance corresponds to approximately VDOT 85." },
    { question: "How do I use VDOT training paces?", answer: "Easy pace: daily recovery runs and long runs (65–79% max HR). Tempo pace: threshold runs, 20–40 min continuous (83–88% max HR). Interval pace: 800m–1-mile repeats with full recovery (95–100% max HR). Match training volumes to your current VDOT level and increase gradually." },
    { question: "Can I improve my VDOT?", answer: "Yes. Consistent aerobic base building raises VDOT 1–2 points every 6–8 weeks for beginner/intermediate runners. Advanced runners improve more slowly. Key factors: weekly mileage, speed work quality, recovery, and nutrition all contribute to VDOT improvement over time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "VDOT Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">VDOT Calculator — Jack Daniels Running Formula</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Race Distance</label>
              <select value={f.distance} onChange={e => set("distance")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                {["1500m","mile","3000m","5k","8k","10k","half","marathon"].map(d => <option key={d} value={d}>{d === "half" ? "Half Marathon" : d === "marathon" ? "Marathon" : d.toUpperCase()}</option>)}
              </select></div>
            <label className="text-sm font-semibold -mb-1">Race Finish Time</label>
            <div className="grid grid-cols-3 gap-3">
              {(["hours","minutes","seconds"] as const).map(k => (
                <div key={k} className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1 capitalize">{k}</label>
                  <input type="number" value={f[k]} onChange={e => set(k)(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">VDOT Score</div>
              <div className="text-5xl font-extrabold text-foreground">{r.vdot}</div>
              <div className="text-sm text-muted-foreground mt-1">{r.vdot >= 60 ? "Elite" : r.vdot >= 50 ? "Sub-Elite" : r.vdot >= 40 ? "Competitive Amateur" : "Recreational Runner"}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Easy Pace</div><div className="font-bold text-lg text-emerald-600">{r.easyPace}/km</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Tempo Pace</div><div className="font-bold text-lg text-primary">{r.tempoPace}/km</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Interval Pace</div><div className="font-bold text-lg text-red-500">{r.intervalPace}/km</div></div>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Equivalent Race Performance Predictions</h3></div>
              {r.racePaces.map((p, i) => (
                <div key={i} className="grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-secondary/20">
                  <span className="text-muted-foreground text-sm">{p.dist}</span>
                  <span className="text-right font-bold text-sm text-foreground">{p.time}</span>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Training Pace Zones (min/km)</h3>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
                    <YAxis reversed tick={{ fontSize: 11 }} tickFormatter={v => `${Math.floor(v)}:${String(Math.round((v%1)*60)).padStart(2,"0")}`} />
                    <RTooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="pace" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 6, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is VDOT?</h2>
            <p>VDOT is a performance index developed by exercise physiologist Jack Daniels, Ph.D., author of &quot;Daniels&apos; Running Formula&quot; — considered the bible of distance running training. Rather than requiring a laboratory VO2max test, VDOT is derived from race performance and represents an integrated measure of aerobic capacity and running economy. It provides a single number that precisely determines optimal training paces across all workout types.</p>
            <h2>Training Zones Explained</h2>
            <p><strong>Easy (E) pace:</strong> Used for 80%+ of weekly mileage. Builds aerobic base, promotes recovery, improves fat metabolism. Approximately 59–74% of VDOT effort. <strong>Tempo (T) pace:</strong> Lactate threshold training. Improves the body&apos;s ability to sustain faster speeds before lactate accumulates. Run in 20–40 minute continuous efforts or cruise intervals. <strong>Interval (I) pace:</strong> VO2max training. 800m–1 mile repeats with equal rest. Maximally stresses the aerobic system to drive VO2max adaptations. <strong>Repetition (R) pace:</strong> Speed and economy training. 200m–400m at mile race pace with full recovery.</p>
            <h2>Race Prediction Accuracy</h2>
            <p>VDOT-based race predictions assume equivalent training preparation for each distance. A runner who primarily trains for 10K may underperform at the marathon relative to VDOT prediction (insufficient endurance base). Similarly, a high-mileage marathon runner may outperform VDOT predictions at shorter distances (aerobic capacity exceeds current 5K fitness). Use predictions as training targets, not guarantees.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vdot-calculator" />
          <PopularCalculators exclude="/calculator/vdot-calculator" />
        </div>
      </div>
    </>
  );
}
