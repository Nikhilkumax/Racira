"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CadenceResult {
  speed: number;
  chainring: number;
  cassette: number;
  wheelCirc: number;
  gearRatio: number;
  cadence: number;
  wheelRpm: number;
  development: number;
}

function calcCadence(speed: number, chainring: number, cassette: number, wheelCirc: number): CadenceResult {
  const gearRatio = chainring / cassette;
  const speedMs = speed / 3.6;
  const wheelRpm = wheelCirc > 0 ? (speedMs / wheelCirc) * 60 : 0;
  const cadence = gearRatio > 0 ? wheelRpm / gearRatio : 0;
  const development = gearRatio * wheelCirc;
  return { speed, chainring, cassette, wheelCirc, gearRatio, cadence, wheelRpm, development };
}

const DEFAULTS = { speed: "25", chainring: "50", cassette: "15", wheelCirc: "2.1" };

const faqs = [
  { question: "What is cycling cadence?", answer: "Cadence is pedal revolutions per minute (RPM). Road riders typically spin 80–100 RPM; recreational riders often pedal slower at 60–75 RPM in a big gear." },
  { question: "What cadence should I use?", answer: "Most coaches recommend 80–95 RPM for road riding to reduce knee stress. Climbing usually drops to 60–75 RPM unless you have a low enough gear. Find what feels smooth without bouncing." },
  { question: "How is cadence calculated?", answer: "Cadence = wheel RPM ÷ gear ratio. Wheel RPM comes from speed and wheel circumference; gear ratio is chainring teeth ÷ cassette teeth." },
];

export default function CyclingCadenceCalculator() {
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [chainring, setChainring] = useState(DEFAULTS.chainring);
  const [cassette, setCassette] = useState(DEFAULTS.cassette);
  const [wheelCirc, setWheelCirc] = useState(DEFAULTS.wheelCirc);
  const [result, setResult] = useState<CadenceResult>(() => calcCadence(25, 50, 15, 2.1));

  useEffect(() => {
    const s = parseFloat(speed);
    const c = parseFloat(chainring);
    const k = parseFloat(cassette);
    const w = parseFloat(wheelCirc);
    if (!isNaN(s) && !isNaN(c) && !isNaN(k) && !isNaN(w) && s >= 0 && c > 0 && k > 0 && w > 0) setResult(calcCadence(s, c, k, w));
  }, []);

  const reset = () => { setSpeed(DEFAULTS.speed); setChainring(DEFAULTS.chainring); setCassette(DEFAULTS.cassette); setWheelCirc(DEFAULTS.wheelCirc); setResult(calcCadence(parseFloat(DEFAULTS.speed), parseFloat(DEFAULTS.chainring), parseFloat(DEFAULTS.cassette), parseFloat(DEFAULTS.wheelCirc))); };
  const invalid = isNaN(parseFloat(speed)) || isNaN(parseFloat(chainring)) || isNaN(parseFloat(cassette)) || isNaN(parseFloat(wheelCirc)) || parseFloat(speed) < 0 || parseFloat(chainring) <= 0 || parseFloat(cassette) <= 0 || parseFloat(wheelCirc) <= 0;

  const breakdown = [
    { label: "Speed", value: `${result.speed.toFixed(1)} km/h` },
    { label: "Chainring Teeth", value: `${Math.round(result.chainring)} T` },
    { label: "Cassette Teeth", value: `${Math.round(result.cassette)} T` },
    { label: "Gear Ratio (chainring ÷ cassette)", value: `${result.gearRatio.toFixed(2)}` },
    { label: "Wheel Circumference", value: `${result.wheelCirc.toFixed(2)} m` },
    { label: "Cadence", value: `${result.cadence.toFixed(0)} RPM`, highlight: true },
    { label: "Wheel Speed", value: `${result.wheelRpm.toFixed(0)} RPM` },
    { label: "Development per Stroke", value: `${result.development.toFixed(2)} m` },
  ];

  const summaryStats = [
    { label: "Cadence", value: `${result.cadence.toFixed(0)} RPM` },
    { label: "Wheel Speed", value: `${result.wheelRpm.toFixed(0)} RPM` },
    { label: "Gear Ratio", value: result.gearRatio.toFixed(2) },
    { label: "Development", value: `${result.development.toFixed(2)} m` },
    { label: "Speed", value: `${result.speed.toFixed(1)} km/h` },
    { label: "Zone", value: result.cadence >= 95 ? "High / sprint" : result.cadence >= 80 ? "Spinning range" : result.cadence >= 60 ? "Endurance range" : "Grinding / low" },
  ];

  const chartData = [
    { name: "Pedal (Cadence)", value: Math.round(result.cadence) },
    { name: "Wheel", value: Math.round(result.wheelRpm) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cycling Cadence Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cycling Cadence Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="cc-speed" className="block text-sm font-medium mb-1 text-foreground">Speed (km/h)</label>
              <input id="cc-speed" type="number" min="0" step="0.5" value={speed} onChange={(e) => setSpeed(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-chainring" className="block text-sm font-medium mb-1 text-foreground">Chainring Teeth</label>
                <input id="cc-chainring" type="number" min="1" value={chainring} onChange={(e) => setChainring(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cc-cassette" className="block text-sm font-medium mb-1 text-foreground">Cassette Teeth</label>
                <input id="cc-cassette" type="number" min="1" value={cassette} onChange={(e) => setCassette(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="cc-wheel" className="block text-sm font-medium mb-1 text-foreground">Wheel Circumference (m)</label>
              <input id="cc-wheel" type="number" min="0.1" step="0.01" value={wheelCirc} onChange={(e) => setWheelCirc(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">700c road wheel ≈ 2.10 m · 26" mountain bike ≈ 2.07 m</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Activity className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative speed and positive gear/wheel values.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Cadence</div>
              <div className="text-4xl font-extrabold text-primary">{result.cadence.toFixed(0)} RPM</div>
              <div className="text-sm text-muted-foreground mt-1">At {result.speed.toFixed(1)} km/h in gear {result.gearRatio.toFixed(2)} ({Math.round(result.chainring)}×{Math.round(result.cassette)})</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Wheel Speed</div>
                <div className="text-lg font-bold text-primary">{result.wheelRpm.toFixed(0)} RPM</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Gear Ratio</div>
                <div className="text-lg font-bold text-primary">{result.gearRatio.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Stroke</div>
                <div className="text-lg font-bold text-primary">{result.development.toFixed(2)} m</div>
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
              <h3 className="text-base font-bold mb-3">Pedal vs Wheel Rotation</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} RPM`, "Rotation"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Cycling Cadence Calculator</h2>
            <p>Cadence follows from the drivetrain: wheel RPM = speed ÷ wheel circumference, and pedal RPM = wheel RPM ÷ gear ratio, where gear ratio = chainring teeth ÷ cassette teeth. A 50×15 gear at 25 km/h on a 2.10 m wheel yields about 60 RPM — a comfortable endurance cadence.</p>
            <h3>Cadence and Efficiency</h3>
            <p>Spinning a smaller gear at higher cadence shifts load from the knees to the cardiovascular system, while grinding a big gear taxes muscle and joints. Most riders settle near 85–95 RPM on the flat; use this calculator to find the gear that lets you hold that pace.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cycling-cadence-calculator" />
          <PopularCalculators exclude="/calculator/cycling-cadence-calculator" />
        </div>
      </div>
    </>
  );
}
