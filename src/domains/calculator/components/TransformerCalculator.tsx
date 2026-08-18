"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type SolveFor = "voltage" | "current" | "turns";

export default function TransformerCalculator() {
  const [solveFor, setSolveFor] = useState<SolveFor>("voltage");
  const [vp, setVp] = useState("240");
  const [vs, setVs] = useState("24");
  const [np, setNp] = useState("1000");
  const [ns, setNs] = useState("100");
  const [ip, setIp] = useState("2");
  const [is, setIs] = useState("20");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    answer: number;
    unit: string;
    label: string;
    ratio: number;
    vpN: number;
    vsN: number;
    npN: number;
    nsN: number;
    ipN: number;
    isN: number;
  } | null>(null);

  const handleCalculate = () => {
    const vpN = parseFloat(vp) || 0;
    const vsN = parseFloat(vs) || 0;
    const npN = parseFloat(np) || 0;
    const nsN = parseFloat(ns) || 0;
    const ipN = parseFloat(ip) || 0;
    const isN = parseFloat(is) || 0;

    const turnsRatio = npN > 0 ? nsN / npN : 0;
    let answer = 0;
    let unit = "V";
    let label = "";

    if (solveFor === "voltage") {
      // Vs = Vp × (Ns / Np)
      answer = vpN * turnsRatio;
      unit = "V";
      label = "Secondary Voltage (Vs)";
    } else if (solveFor === "current") {
      // Is = Ip × (Np / Ns) — ideal transformer, inverse ratio
      answer = npN > 0 && nsN > 0 ? (ipN * npN) / nsN : 0;
      unit = "A";
      label = "Secondary Current (Is)";
    } else {
      // Turns: Ns = Np × (Vs / Vp)
      answer = vpN > 0 ? (npN * vsN) / vpN : 0;
      unit = "turns";
      label = "Secondary Turns (Ns)";
    }

    setResult({ answer, unit, label, ratio: turnsRatio, vpN, vsN, npN, nsN, ipN, isN });
    setShowResults(true);
  };

  const reset = () => {
    setSolveFor("voltage");
    setVp("240"); setVs("24"); setNp("1000"); setNs("100"); setIp("2"); setIs("20");
    setShowResults(false);
    setResult(null);
  };

  const faqs = [
    { question: "How does a transformer change voltage?", answer: "A transformer uses two coils sharing a magnetic core. The ratio of secondary to primary turns (Ns/Np) sets the voltage ratio: step-down transformers have fewer secondary turns, step-up transformers have more. Power is conserved, so current changes by the inverse ratio." },
    { question: "What is the difference between step-up and step-down?", answer: "A step-up transformer raises voltage (Ns > Np) and lowers current; a step-down transformer lowers voltage (Ns < Np) and raises current. Both conserve power minus losses — that is why transmission lines step voltage up to reduce current and I²R losses over distance." },
    { question: "What is transformer efficiency?", answer: "Real transformers lose energy to copper resistance (I²R), core hysteresis, and eddy currents. Large distribution transformers exceed 98% efficiency, while small audio or signal transformers may be below 90%. The ideal-transformer formula here ignores these losses." },
    { question: "What is the turns ratio?", answer: "The turns ratio is Ns/Np. It directly multiplies the primary voltage: a 10:1 step-down ratio turns 240 V into 24 V. The same ratio divides current — 2 A in becomes 20 A out — which is why transformer wire gauges differ between primary and secondary." },
    { question: "Why do power lines use very high voltages?", answer: "For a given power P = V·I, raising voltage tenfold cuts current tenfold. Since line losses scale with I², that reduces losses a hundredfold. Power stations step up to 110–765 kV for transmission, then step down in stages to the 120/240 V used in homes." },
  ];

  const chartData = result
    ? [
        { name: "Primary", voltage: result.vpN, current: result.ipN },
        { name: "Secondary", voltage: result.vsN, current: result.isN },
      ]
    : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transformer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Transformer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Solve For</label>
                <select value={solveFor} onChange={(e) => setSolveFor(e.target.value as SolveFor)} className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="voltage">Secondary Voltage (Vs)</option>
                  <option value="current">Secondary Current (Is)</option>
                  <option value="turns">Secondary Turns (Ns)</option>
                </select>
              </div>
              <InputField id="vp" label="Primary Voltage (Vp)" value={vp} onChange={setVp} suffix="V" tooltip="Voltage applied to the primary winding." />
              <InputField id="vs" label="Secondary Voltage (Vs)" value={vs} onChange={setVs} suffix="V" tooltip="Voltage needed at the secondary winding (used for turns and voltage solves)." />
              <InputField id="np" label="Primary Turns (Np)" value={np} onChange={setNp} tooltip="Number of turns on the primary winding." />
              <InputField id="ns" label="Secondary Turns (Ns)" value={ns} onChange={setNs} tooltip="Number of turns on the secondary winding." />
              <InputField id="ip" label="Primary Current (Ip)" value={ip} onChange={setIp} suffix="A" tooltip="Current flowing through the primary winding." />
              <InputField id="is" label="Secondary Current (Is)" value={is} onChange={setIs} suffix="A" tooltip="Current through the secondary winding (used for the current solve)." />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Zap className="h-5 w-5" />Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Transformer Results</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{result.label}</p>
                    <p className="text-2xl font-black text-foreground">{result.answer.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-muted-foreground">{result.unit}</span></p>
                  </div>
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Turns Ratio (Ns/Np)</p>
                    <p className="text-2xl font-black text-foreground">1 : {result.ratio === 0 ? "—" : (1 / result.ratio).toLocaleString(undefined, { maximumFractionDigits: 3 })}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Type</p>
                    <p className="text-2xl font-black text-foreground">{result.ratio < 1 ? "Step-Down" : result.ratio > 1 ? "Step-Up" : "1:1 Isolated"}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Primary Voltage", value: result.vpN, textValue: `${result.vpN} V` },
                  { label: "Primary Current", value: result.ipN, textValue: `${result.ipN} A` },
                  { label: "Secondary Voltage", value: result.vsN, textValue: `${result.vsN} V`, highlight: true },
                  { label: "Secondary Current", value: result.isN, textValue: `${result.isN} A` },
                ]} />
                <div className="mt-6 p-4 rounded-2xl border border-border bg-card">
                  <p className="text-sm font-bold text-foreground mb-3">Primary vs Secondary (ideal transformer)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="voltage" name="Voltage (V)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="current" name="Current (A)" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">For an ideal transformer, Vp·Ip ≈ Vs·Is — the secondary voltage and current trade off at the turns ratio.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Transformers Work</h2>
            <p>Transformers are the workhorses of the electrical grid. They transfer electrical energy between circuits through electromagnetic induction — an alternating current in the primary coil creates a changing magnetic field in the iron core, which induces a voltage in the secondary coil. Because the coupling is magnetic rather than electrical, transformers can convert between voltage levels efficiently and safely.</p>
            <h3>The Turns Ratio Is Everything</h3>
            <p>The relationship is remarkably simple: the voltage ratio equals the turns ratio (Vp/Vs = Np/Ns), and the current ratio is its inverse (Ip/Is = Ns/Np). Want 24 V from a 240 V mains supply? Use a 10:1 turns ratio. This is why transformer design is mostly an exercise in choosing the right number of copper turns and the right core size for the power level.</p>
            <h3>Real-World Considerations</h3>
            <p>No transformer is perfect. Copper windings have resistance that heats up under load, the core resists magnetic changes with hysteresis and eddy-current losses, and a small magnetizing current flows even with nothing connected to the secondary. Engineers compensate with larger cores, laminated or ferrite cores, and thicker wire — but the ideal-transformer equations here capture the fundamental behavior that all real transformers approximate.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/transformer-calculator" />
          <PopularCalculators exclude="/calculator/transformer-calculator" />
        </div>
      </div>
    </>
  );
}
