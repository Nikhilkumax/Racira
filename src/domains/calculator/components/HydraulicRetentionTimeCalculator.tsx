"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULTS = { volume: "500", flowRate: "50", volumeUnit: "m3", flowUnit: "m3/day", deadZonePct: "10", shortCircuitPct: "5" };

function calculate(volume: number, flowRate: number, volumeUnit: string, flowUnit: string, deadZonePct: number, shortCircuitPct: number) {
  if (volume <= 0 || flowRate <= 0) return null;
  let volM3 = volume;
  let flowM3Day = flowRate;
  if (volumeUnit === "L") volM3 = volume / 1000;
  if (volumeUnit === "gal") volM3 = volume * 0.003785;
  if (volumeUnit === "ft3") volM3 = volume * 0.028317;
  if (flowUnit === "m3/hr") flowM3Day = flowRate * 24;
  if (flowUnit === "L/day") flowM3Day = flowRate / 1000;
  if (flowUnit === "MGD") flowM3Day = flowRate * 3785.41;
  const theoreticalDays = volM3 / flowM3Day;
  const effectiveFrac = (1 - deadZonePct / 100) * (1 - shortCircuitPct / 100);
  const effectiveDays = theoreticalDays * effectiveFrac;
  let hrt = theoreticalDays, hrtUnit = "days";
  if (theoreticalDays < 1) { hrt = theoreticalDays * 24; hrtUnit = "hours"; }
  if (theoreticalDays < 1 / 24) { hrt = theoreticalDays * 1440; hrtUnit = "minutes"; }
  return {
    hrt, hrtUnit, theoreticalDays, effectiveDays, volM3, flowM3Day, effectiveFrac,
    chartData: [
      { name: "Theoretical", value: parseFloat(theoreticalDays.toFixed(4)) },
      { name: "Effective", value: parseFloat(effectiveDays.toFixed(4)) },
      { name: "Dead Zone Loss", value: parseFloat((theoreticalDays * deadZonePct / 100).toFixed(4)) },
      { name: "Short-Circuit", value: parseFloat((theoreticalDays * shortCircuitPct / 100).toFixed(4)) },
    ],
    breakdown: [
      { label: "Reactor Volume", value: `${volume} ${volumeUnit}` },
      { label: "Flow Rate", value: `${flowRate} ${flowUnit}` },
      { label: "Volume (m³)", value: `${volM3.toFixed(2)} m³` },
      { label: "Flow Rate (m³/day)", value: `${flowM3Day.toFixed(4)} m³/day` },
      { label: "Theoretical HRT", value: `${theoreticalDays.toFixed(4)} days` },
      { label: "Dead Zone Fraction", value: `${deadZonePct}%` },
      { label: "Short-Circuit Fraction", value: `${shortCircuitPct}%` },
      { label: "Effective Volume Fraction", value: `${(effectiveFrac * 100).toFixed(1)}%` },
      { label: "Effective HRT", value: `${effectiveDays.toFixed(4)} days` },
    ],
  };
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];

export default function HydraulicRetentionTimeCalculator() {
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [flowRate, setFlowRate] = useState(DEFAULTS.flowRate);
  const [volumeUnit, setVolumeUnit] = useState(DEFAULTS.volumeUnit);
  const [flowUnit, setFlowUnit] = useState(DEFAULTS.flowUnit);
  const [deadZonePct, setDeadZonePct] = useState(DEFAULTS.deadZonePct);
  const [shortCircuitPct, setShortCircuitPct] = useState(DEFAULTS.shortCircuitPct);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculate>>(null);

  const run = (v=volume,f=flowRate,vu=volumeUnit,fu=flowUnit,dz=deadZonePct,sc=shortCircuitPct) =>
    setResult(calculate(parseFloat(v)||0,parseFloat(f)||0,vu,fu,parseFloat(dz)||0,parseFloat(sc)||0));

  useEffect(() => { run(); }, []);

  const Inp = ({ id, label, value, onChange }: any) => (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
      <input id={id} type="number" value={value} min={0} step="any" onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
        className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" />
    </div>
  );
  const Sel = ({ id, label, value, onChange, opts }: any) => (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground">
        {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Engineering",href:"/calculator/engineering"},{label:"Hydraulic Retention Time Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hydraulic Retention Time (HRT) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <Inp id="volume" label="Reactor Volume" value={volume} onChange={setVolume} />
              <Sel id="vunit" label="Volume Unit" value={volumeUnit} onChange={setVolumeUnit}
                opts={[{v:"m3",l:"m³"},{v:"L",l:"Litres"},{v:"ft3",l:"ft³"},{v:"gal",l:"US gal"}]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Inp id="flowRate" label="Flow Rate" value={flowRate} onChange={setFlowRate} />
              <Sel id="funit" label="Flow Unit" value={flowUnit} onChange={setFlowUnit}
                opts={[{v:"m3/day",l:"m³/day"},{v:"m3/hr",l:"m³/hr"},{v:"L/day",l:"L/day"},{v:"MGD",l:"MGD"}]} />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="mt-3 border border-border rounded-lg p-4 bg-secondary/10 grid grid-cols-2 gap-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground col-span-2">Effective HRT Adjustments</div>
                  <Inp id="deadZone" label="Dead Zone %" value={deadZonePct} onChange={setDeadZonePct} />
                  <Inp id="shortCircuit" label="Short-Circuit %" value={shortCircuitPct} onChange={setShortCircuitPct} />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => run()}
                className="h-10 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-colors">Calculate</button>
              <button type="button" onClick={() => { setVolume(DEFAULTS.volume); setFlowRate(DEFAULTS.flowRate); setVolumeUnit(DEFAULTS.volumeUnit); setFlowUnit(DEFAULTS.flowUnit); setDeadZonePct(DEFAULTS.deadZonePct); setShortCircuitPct(DEFAULTS.shortCircuitPct); run(DEFAULTS.volume,DEFAULTS.flowRate,DEFAULTS.volumeUnit,DEFAULTS.flowUnit,DEFAULTS.deadZonePct,DEFAULTS.shortCircuitPct); }}
                aria-label="Reset" className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Theoretical HRT</div>
                <div className="text-4xl font-bold text-primary">{result.hrt.toFixed(2)} {result.hrtUnit}</div>
                <div className="text-sm text-muted-foreground mt-1">Effective HRT: <span className="font-semibold text-foreground">{result.effectiveDays.toFixed(4)} days</span> ({(result.effectiveDays * 24).toFixed(2)} hrs)</div>
              </div>
              <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  { label: "HRT (days)", value: result.theoreticalDays.toFixed(4), color: "text-primary" },
                  { label: "HRT (hours)", value: (result.theoreticalDays * 24).toFixed(2), color: "" },
                  { label: "HRT (minutes)", value: (result.theoreticalDays * 1440).toFixed(1), color: "" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Parameter</th>
                      <th className="text-right text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label === "Effective HRT" ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="text-sm py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="text-sm py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">HRT Components (days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any) => [`${v} days`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {[
                    { label: "Theoretical HRT", value: `${result.hrt.toFixed(2)} ${result.hrtUnit}` },
                    { label: "HRT (days)", value: result.theoreticalDays.toFixed(4) },
                    { label: "HRT (hours)", value: (result.theoreticalDays * 24).toFixed(2) },
                    { label: "Effective HRT", value: `${result.effectiveDays.toFixed(4)} days` },
                    { label: "Effective Volume %", value: `${(result.effectiveFrac * 100).toFixed(1)}%` },
                    { label: "Reactor Vol (m³)", value: result.volM3.toFixed(2) },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Hydraulic Retention Time (HRT)?</h2>
            <p className="text-muted-foreground leading-relaxed">Hydraulic Retention Time (HRT) is the average time water spends inside a treatment reactor or basin. It is the core design parameter for biological wastewater treatment — a longer HRT provides more contact time for microorganisms to degrade pollutants, but requires larger and more costly infrastructure. HRT governs organic removal efficiency, nutrient transformation, and pathogen inactivation. Typical ranges: activated sludge 6–8 hours, anaerobic digesters 15–30 days, stabilization ponds 5–30 days.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How HRT Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Theoretical HRT (θ) = Volume (V) ÷ Flow Rate (Q). For a 500 m³ reactor with 50 m³/day influent: 500 ÷ 50 = 10 days. Effective HRT adjusts for hydraulic dead zones (stagnant regions that bypass treatment) and short-circuiting (flow that exits without full contact time): Effective HRT = Theoretical HRT × (1 − Dead Zone%) × (1 − Short-Circuit%). These corrections follow Metcalf and Eddy wastewater engineering standards. The Advanced Options panel unlocks these adjustments.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The primary result shows HRT in the most convenient unit (minutes, hours, or days). The 3-stat bar expresses the same value in all three units. The breakdown table shows how volume and flow convert to m³-based values, and how dead zone and short-circuit fractions reduce effective HRT. If the effective HRT is substantially below theoretical — such as due to a 20%+ dead zone — the reactor may need internal baffles, improved mixing, or upsizing to meet treatment standards.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/hydraulic-retention-time-hrt-calculator" />
      </div>
    </>
  );
}
