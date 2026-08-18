"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const DEFAULTS = { mode: "kv", kw: "80", kva: "100", kvar: "60" };

export default function PowerFactorCalculator() {
  const [mode, setMode] = useState<"kv" | "kvr">(DEFAULTS.mode as "kv" | "kvr");
  const [kwStr, setKwStr] = useState(DEFAULTS.kw);
  const [kvaStr, setKvaStr] = useState(DEFAULTS.kva);
  const [kvarStr, setKvarStr] = useState(DEFAULTS.kvar);
  const [calculated, setCalculated] = useState(false);

  const kw = Math.max(0, parseFloat(kwStr) || 0);
  const kvaIn = Math.max(0, parseFloat(kvaStr) || 0);
  const kvarIn = Math.max(0, parseFloat(kvarStr) || 0);

  const kva = mode === "kv" ? kvaIn : (kw > 0 || kvarIn > 0 ? Math.sqrt(kw * kw + kvarIn * kvarIn) : 0);
  const kvar = mode === "kv" ? (kva >= kw ? Math.sqrt(kva * kva - kw * kw) : 0) : kvarIn;
  const pf = kva > 0 ? kw / kva : 0;
  const phaseAngle = kva > 0 ? Math.acos(Math.min(1, Math.max(0, pf))) * 180 / Math.PI : 0;
  const valid = (mode === "kv" ? kvaIn > 0 : kva > 0) && kva >= kw - 1e-6;

  const chartData = [
    { name: "Real (kW)", value: Number(kw.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Reactive (kVAR)", value: Number(kvar.toFixed(2)), fill: "#f59e0b" },
    { name: "Apparent (kVA)", value: Number(kva.toFixed(2)), fill: "#10b981" },
  ];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setMode(DEFAULTS.mode as "kv" | "kvr"); setKwStr(DEFAULTS.kw); setKvaStr(DEFAULTS.kva); setKvarStr(DEFAULTS.kvar); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";
  const seg = "flex-1 py-2 rounded-md text-sm font-semibold transition-all";

  const faqs = [
    { question: "What is power factor?", answer: "The ratio of real power (kW, which does useful work) to apparent power (kVA, what the utility must supply): PF = kW ÷ kVA. A perfect PF of 1 means every volt-amp becomes work; a low PF means a big share circulates as reactive power doing nothing." },
    { question: "What causes low power factor?", answer: "Inductive loads — motors, transformers, fluorescent ballasts — store energy in magnetic fields and return it to the grid each cycle. That back-and-forth current is the reactive component that inflates kVA without contributing kW." },
    { question: "Why do utilities penalize low power factor?", answer: "The grid must be sized for apparent power (kVA): thicker conductors, bigger transformers, more generation — even though only kW does work. Utilities pass that cost through as penalties or demand charges when PF falls below roughly 0.85–0.95." },
    { question: "How is it corrected?", answer: "Capacitors supply leading reactive power that cancels the lagging reactive demand of inductive loads. Adding the right capacitor bank pushes PF toward 1, shrinking kVA and cutting both penalties and distribution losses." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Power Factor Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Power Factor Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="flex gap-1 p-1 rounded-md bg-muted/60">
              <button onClick={() => setMode("kv")} className={`${seg} ${mode === "kv" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>kW + kVA</button>
              <button onClick={() => setMode("kvr")} className={`${seg} ${mode === "kvr" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>kW + kVAR</button>
            </div>
            <div>
              <label className={lbl}>Real power (kW)</label>
              <input type="number" min={0} step="any" value={kwStr} onChange={e => setKwStr(e.target.value)} className={inp} placeholder="80" />
            </div>
            {mode === "kv" ? (
              <div>
                <label className={lbl}>Apparent power (kVA)</label>
                <input type="number" min={0} step="any" value={kvaStr} onChange={e => setKvaStr(e.target.value)} className={inp} placeholder="100" />
              </div>
            ) : (
              <div>
                <label className={lbl}>Reactive power (kVAR)</label>
                <input type="number" min={0} step="any" value={kvarStr} onChange={e => setKvarStr(e.target.value)} className={inp} placeholder="60" />
              </div>
            )}
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Apparent power (kVA) must exceed real power (kW).</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Power Factor</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(pf)}</div>
                <div className="text-sm text-muted-foreground mt-1">{pf >= 0.95 ? "Excellent — no penalty territory" : pf >= 0.85 ? "Acceptable — check utility thresholds" : pf >= 0.7 ? "Low — correction recommended" : "Poor — capacitor bank advised"} · {phaseAngle.toFixed(1)}° phase angle</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Apparent (kVA)", fmt(kva), "what the grid supplies"], ["Reactive (kVAR)", fmt(kvar), "circulating power"], ["Phase angle", `${fmt(phaseAngle)}°`, `acos(${fmt(pf)})`]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">The Power Triangle</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt(Number(v)) + " kVA", ""]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">kVA² = kW² + kVAR² — the real power is always the smallest leg at low PF</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Correction Estimate</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Real power:</span><span className="font-semibold">{fmt(kw)} kW</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Apparent power:</span><span className="font-semibold">{fmt(kva)} kVA</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reactive power:</span><span className="font-semibold">{fmt(kvar)} kVAR</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Power factor:</span><span className="font-semibold">{fmt(pf)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">kVAR to hit 0.95:</span><span className="font-semibold">{fmt(Math.max(0, kvar - kw * Math.tan(Math.acos(0.95))))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">kVA at 0.95 PF:</span><span className="font-semibold">{fmt(kw / 0.95)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Work vs. What the Grid Ships</h2>
            <p>Your factory draws 80 kW of useful power, but the utility bills for something larger: apparent power, which includes the reactive current sloshing back and forth through inductive loads. This <strong>power factor calculator</strong> turns those numbers into the PF ratio — and the correction needed.</p>
            <h2 className="text-2xl font-bold mb-3">The Power Triangle</h2>
            <p>Real, reactive, and apparent power form a right triangle: kVA² = kW² + kVAR². Given any two legs, the third follows, and the angle between real and apparent power is the phase angle whose cosine is the power factor.</p>
            <h2 className="text-2xl font-bold mb-3">Fix It With Capacitors</h2>
            <p>Capacitor banks supply leading reactive power that cancels the lagging reactive demand. The correction readout shows exactly how many kVAR of capacitance would lift PF to 0.95 — usually the point where utility penalties disappear.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/power-factor-calculator" />
          <PopularCalculators exclude="/calculator/power-factor-calculator" />
        </div>
      </div>
    </>
  );
}
