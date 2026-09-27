"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type SolveFor = "voltage" | "current" | "turns";

interface TransformerInputs {
  solveFor: SolveFor;
  vp: number;
  ip: number;
  vs: number;
  is: number;
  np: number;
  ns: number;
  powerFactor: number;
  copperLossPct: number;
  coreLossW: number;
}

const DEFAULTS: TransformerInputs = {
  solveFor: "voltage",
  vp: 240,
  ip: 2,
  vs: 24,
  is: 20,
  np: 1000,
  ns: 100,
  powerFactor: 0.9,
  copperLossPct: 2,
  coreLossW: 15,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: d }) : "—";

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  hint?: string;
  type?: string;
  min?: string;
  step?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  prefix,
  suffix,
  tooltip,
  hint,
  type = "number",
  min,
  step,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

interface TransformerResult {
  turnsRatio: number;
  ratioLabel: string;
  transformerType: string;
  computedVs: number;
  computedIs: number;
  computedNs: number;
  headline: { label: string; value: number; unit: string };
  primaryVa: number;
  secondaryVa: number;
  fullLoadKva: number;
  zp: number;
  zs: number;
  reflectedZp: number;
  realPowerW: number;
  reactivePowerVar: number;
  copperLossW: number;
  efficiencyPct: number;
  enteredDeviationPct: number;
  valid: boolean;
  errorMsg: string;
}

function computeTransformer(i: TransformerInputs): TransformerResult {
  const vp = i.vp;
  const ip = i.ip;
  const vs = i.vs;
  const is = i.is;
  const np = i.np;
  const ns = i.ns;

  const turnsRatio = ns > 0 ? np / ns : 0;
  const computedVs = turnsRatio > 0 ? vp / turnsRatio : 0;
  const computedIs = turnsRatio > 0 ? ip * turnsRatio : 0;
  const computedNs = vp > 0 ? (np * vs) / vp : 0;

  const primaryVa = vp * ip;
  const secondaryVa = computedVs * computedIs;
  const fullLoadKva = Math.max(primaryVa, secondaryVa) / 1000;

  const zp = ip > 0 ? vp / ip : 0;
  const zs = computedIs > 0 ? computedVs / computedIs : 0;
  const reflectedZp = turnsRatio > 0 ? zs * turnsRatio * turnsRatio : 0;

  const apparentVa = (primaryVa + secondaryVa) / 2;
  const realPowerW = apparentVa * i.powerFactor;
  const reactivePowerVar = apparentVa * Math.sqrt(Math.max(0, 1 - i.powerFactor * i.powerFactor));
  const copperLossW = (apparentVa * i.copperLossPct) / 100;
  const efficiencyPct =
    realPowerW > 0 ? (realPowerW / (realPowerW + copperLossW + i.coreLossW)) * 100 : 0;

  const ratioLabel =
    turnsRatio > 0 ? `${fmt(np, 0)}:${fmt(ns, 0)} (${fmt(turnsRatio, 2)}:1)` : "—";
  const transformerType =
    turnsRatio > 1.0001 ? "Step-Down" : turnsRatio < 0.9999 ? "Step-Up" : "1:1 Isolation";

  let headline = { label: "Secondary Voltage (Vs)", value: computedVs, unit: "V" };
  let enteredDeviationPct = 0;
  if (i.solveFor === "current") {
    headline = { label: "Secondary Current (Is)", value: computedIs, unit: "A" };
    enteredDeviationPct = computedIs > 0 ? (Math.abs(is - computedIs) / computedIs) * 100 : 0;
  } else if (i.solveFor === "turns") {
    headline = { label: "Secondary Turns (Ns)", value: computedNs, unit: "turns" };
    enteredDeviationPct = computedNs > 0 ? (Math.abs(ns - computedNs) / computedNs) * 100 : 0;
  } else {
    enteredDeviationPct = computedVs > 0 ? (Math.abs(vs - computedVs) / computedVs) * 100 : 0;
  }

  const invalid =
    np <= 0 || ns <= 0 || vp <= 0 || ip <= 0 || i.powerFactor <= 0 || i.powerFactor > 1;

  return {
    turnsRatio,
    ratioLabel,
    transformerType,
    computedVs,
    computedIs,
    computedNs,
    headline,
    primaryVa,
    secondaryVa,
    fullLoadKva,
    zp,
    zs,
    reflectedZp,
    realPowerW,
    reactivePowerVar,
    copperLossW,
    efficiencyPct,
    enteredDeviationPct,
    valid: !invalid,
    errorMsg: invalid
      ? "Primary voltage, primary current, turns, and a power factor between 0 and 1 are required."
      : "",
  };
}

export default function TransformerCalculator() {
  const [solveFor, setSolveFor] = useState<SolveFor>(DEFAULTS.solveFor);
  const [vp, setVp] = useState(String(DEFAULTS.vp));
  const [ip, setIp] = useState(String(DEFAULTS.ip));
  const [vs, setVs] = useState(String(DEFAULTS.vs));
  const [is, setIs] = useState(String(DEFAULTS.is));
  const [np, setNp] = useState(String(DEFAULTS.np));
  const [ns, setNs] = useState(String(DEFAULTS.ns));
  const [powerFactor, setPowerFactor] = useState(String(DEFAULTS.powerFactor));
  const [copperLossPct, setCopperLossPct] = useState(String(DEFAULTS.copperLossPct));
  const [coreLossW, setCoreLossW] = useState(String(DEFAULTS.coreLossW));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TransformerInputs => ({
    solveFor,
    vp: parseFloat(vp) || 0,
    ip: parseFloat(ip) || 0,
    vs: parseFloat(vs) || 0,
    is: parseFloat(is) || 0,
    np: parseFloat(np) || 0,
    ns: parseFloat(ns) || 0,
    powerFactor: parseFloat(powerFactor) || 0,
    copperLossPct: parseFloat(copperLossPct) || 0,
    coreLossW: parseFloat(coreLossW) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<TransformerInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TransformerResult>(() => computeTransformer(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTransformer(inputs));
  };

  const reset = () => {
    setSolveFor(DEFAULTS.solveFor);
    setVp(String(DEFAULTS.vp));
    setIp(String(DEFAULTS.ip));
    setVs(String(DEFAULTS.vs));
    setIs(String(DEFAULTS.is));
    setNp(String(DEFAULTS.np));
    setNs(String(DEFAULTS.ns));
    setPowerFactor(String(DEFAULTS.powerFactor));
    setCopperLossPct(String(DEFAULTS.copperLossPct));
    setCoreLossW(String(DEFAULTS.coreLossW));
    setCalcInputs(DEFAULTS);
    setResults(computeTransformer(DEFAULTS));
  };

  const faqs = [
    {
      question: "How does a transformer change voltage?",
      answer:
        "A transformer links two coils through a shared magnetic core. The AC current in the primary winding creates a changing flux, which induces a voltage in the secondary winding. The voltage ratio equals the turns ratio: Vp/Vs = Np/Ns. Fewer secondary turns step the voltage down, more secondary turns step it up, and power is conserved so the current changes by the inverse ratio.",
    },
    {
      question: "What is the difference between step-up and step-down transformers?",
      answer:
        "A step-up transformer has more secondary turns than primary turns (Np/Ns < 1), so the output voltage is higher and the available current is lower. A step-down transformer has fewer secondary turns (Np/Ns > 1), lowering the voltage and raising the current. This is exactly what this calculator reports in the 'Transformer Type' stat.",
    },
    {
      question: "How do I read the turns ratio?",
      answer:
        "The turns ratio is Np/Ns. A 1000:100 winding pair is a 10:1 transformer, turning 240 V into 24 V and 2 A into 20 A in the ideal case. The calculator prints both the raw winding pair and the simplified ratio so you can compare designs quickly.",
    },
    {
      question: "Why is the real output lower than the ideal calculation?",
      answer:
        "Real transformers lose energy to winding resistance (I²R or copper loss), core hysteresis, and eddy currents. The advanced options let you enter an estimated copper loss as a percentage of the apparent power and a fixed core loss in watts; the efficiency statistic then shows what fraction of the real input power reaches the load.",
    },
    {
      question: "When should I use the impedance figures?",
      answer:
        "Primary and secondary impedance (Zp, Zs) describe how the winding pair looks to the circuits on either side, while the reflected impedance is the secondary impedance seen through the transformer (Zs × ratio²). They matter when you are matching a speaker, an amplifier stage, or a distribution load where the ratio scales the effective resistance.",
    },
  ];

  const breakdownRows = [
    { label: "Voltage", primary: `${fmt(calcInputs.vp, 2)} V`, secondary: `${fmt(results.computedVs, 2)} V` },
    { label: "Current", primary: `${fmt(calcInputs.ip, 3)} A`, secondary: `${fmt(results.computedIs, 3)} A` },
    { label: "Turns", primary: fmt(calcInputs.np, 0), secondary: fmt(calcInputs.ns, 0) },
    {
      label: "Apparent Power",
      primary: `${fmt(results.primaryVa, 1)} VA`,
      secondary: `${fmt(results.secondaryVa, 1)} VA`,
    },
    { label: "Impedance", primary: `${fmt(results.zp, 3)} Ω`, secondary: `${fmt(results.zs, 4)} Ω` },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Transformer Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Transformer Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Solve For">
              <div className="relative h-9">
                <select
                  id="solve-for"
                  value={solveFor}
                  onChange={(e) => setSolveFor(e.target.value as SolveFor)}
                  className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                >
                  <option value="voltage">Secondary Voltage (Vs)</option>
                  <option value="current">Secondary Current (Is)</option>
                  <option value="turns">Secondary Turns (Ns)</option>
                </select>
              </div>
            </SubSection>

            <SubSection title="Primary Winding">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="vp"
                  label="Primary Voltage"
                  value={vp}
                  onChange={setVp}
                  onEnter={runCalculate}
                  suffix="V"
                  tooltip="RMS voltage applied to the primary winding."
                />
                <CompactInput
                  id="ip"
                  label="Primary Current"
                  value={ip}
                  onChange={setIp}
                  onEnter={runCalculate}
                  suffix="A"
                  tooltip="Current drawn by the primary winding under load."
                />
              </div>
            </SubSection>

            <SubSection title="Secondary Winding">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="vs"
                  label="Secondary Voltage"
                  value={vs}
                  onChange={setVs}
                  onEnter={runCalculate}
                  suffix="V"
                  tooltip="Voltage at the secondary terminals; used as a known value in the turns solve."
                  hint={solveFor === "voltage" ? "This value is solved by Calculate." : undefined}
                />
                <CompactInput
                  id="is"
                  label="Secondary Current"
                  value={is}
                  onChange={setIs}
                  onEnter={runCalculate}
                  suffix="A"
                  tooltip="Expected load current on the secondary side."
                  hint={solveFor === "current" ? "This value is solved by Calculate." : undefined}
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Winding Turns">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="np"
                        label="Primary Turns"
                        value={np}
                        onChange={setNp}
                        onEnter={runCalculate}
                        suffix="t"
                        min="1"
                        tooltip="Number of turns on the primary winding."
                      />
                      <CompactInput
                        id="ns"
                        label="Secondary Turns"
                        value={ns}
                        onChange={setNs}
                        onEnter={runCalculate}
                        suffix="t"
                        min="1"
                        tooltip="Number of turns on the secondary winding."
                        hint={solveFor === "turns" ? "Solved by Calculate." : undefined}
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Load & Losses">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="power-factor"
                        label="Load Power Factor"
                        value={powerFactor}
                        onChange={setPowerFactor}
                        onEnter={runCalculate}
                        step="0.01"
                        min="0.01"
                        tooltip="Ratio of real power to apparent power drawn by the load (0.01–1)."
                      />
                      <CompactInput
                        id="copper-loss"
                        label="Copper Loss"
                        value={copperLossPct}
                        onChange={setCopperLossPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        tooltip="Winding I²R loss, expressed as a percentage of apparent power."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="core-loss"
                        label="Core Loss"
                        value={coreLossW}
                        onChange={setCoreLossW}
                        onEnter={runCalculate}
                        suffix="W"
                        step="1"
                        tooltip="Hysteresis and eddy-current loss in the magnetic core."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Ratio: {results.turnsRatio > 0 ? fmt(results.turnsRatio, 2) : "—"}:1
                        </div>
                      </div>
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                {results.headline.label}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.headline.value, 2)}{" "}
                <span className="text-lg font-semibold text-muted-foreground">{results.headline.unit}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Solved from a {results.ratioLabel} winding pair in {results.transformerType.toLowerCase()} mode
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Turns Ratio</span>
                <span className="font-extrabold text-foreground">
                  {results.turnsRatio > 0 ? `${fmt(results.turnsRatio, 2)}:1` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Type</span>
                <span className="font-extrabold text-foreground">{results.transformerType}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full-Load</span>
                <span className="font-extrabold text-foreground">{fmt(results.fullLoadKva, 3)} kVA</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Winding Quantity</th>
                    <th className="p-2.5 text-right w-[130px]">Primary</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Secondary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.primary}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.secondary}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Reflected Secondary Impedance</td>
                    <td className="p-2.5 text-right text-muted-foreground">{fmt(results.reflectedZp, 3)} Ω</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">Zs × ratio²</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Primary Apparent Power</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.primaryVa, 1)} VA</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Secondary Apparent Power</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.secondaryVa, 1)} VA</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Real Power</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.realPowerW, 1)} W</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Reactive Power</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.reactivePowerVar, 1)} VAR</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Copper Loss</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.copperLossW, 2)} W</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Core Loss</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.coreLossW, 1)} W</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Efficiency</span>
                  <span className="text-base font-bold text-primary">{fmt(results.efficiencyPct, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Entered vs Solved
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(results.enteredDeviationPct, 2)}% apart
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What a Transformer Calculator Solves</h2>
            <p>
              A transformer moves electrical energy between two circuits that share a magnetic core. Because the two
              windings never touch, the only quantities that link them are the number of turns on each coil (Np and Ns)
              and the magnetic flux they both see. That gives three simple relationships for an ideal transformer: the
              voltage ratio equals the turns ratio (Vp / Vs = Np / Ns), the current ratio is its inverse (Ip / Is =
              Ns / Np), and apparent power is preserved on both sides (Vp × Ip ≈ Vs × Is).
            </p>
            <p>
              This calculator applies those relationships to your winding data and reports the derived quantity, the
              turns ratio, the winding-by-winding breakdown, the reflected impedance, and an efficiency estimate built
              from your copper and core losses. Choose whether you want the secondary voltage, the secondary current,
              or the secondary turns solved, enter the known values, and press Calculate.
            </p>

            <h2 className="text-2xl font-bold mb-3">How to Use the Results</h2>
            <p>
              The headline number is the value produced by your selected solve mode. Under it, the turns ratio and
              transformer type tell you at a glance whether you are stepping voltage up, stepping it down, or building
              an isolation transformer. A 1000:100 winding pair is a 10:1 step-down transformer, so 240 V on the
              primary becomes 24 V on the secondary while 2 A of primary current becomes 20 A of secondary current.
            </p>
            <p>
              The breakdown table compares both windings side by side. Voltage and current should trade off inversely,
              and the apparent power figures should match closely — when they do not, the difference comes from the
              losses you entered in Advanced Options. The reflected secondary impedance row is the secondary impedance
              as seen through the ratio (Zs × ratio²), which is the number to use when matching loads and sources.
            </p>
            <p>
              Summary Statistics collects the load-facing figures: primary and secondary apparent power, real and
              reactive power at your chosen power factor, copper and core loss, estimated efficiency, and how far your
              typed-in value sits from the solved one. That last figure is useful for sanity checking a nameplate: a
              large gap usually means a mistyped turn count or a winding pair that does not match the rated ratio.
            </p>

            <h2 className="text-2xl font-bold mb-3">Practical Notes and Limits of the Ideal Model</h2>
            <p>
              Real transformers lose energy three ways: copper loss from winding resistance (I²R), hysteresis loss as
              the core material resists magnetisation changes, and eddy-current loss circulating inside the core
              laminations. Large distribution transformers still exceed 98% efficiency because those losses are small
              relative to the power they carry, while small signal transformers often sit below 90%. The Advanced
              Options let you express copper loss as a percentage of apparent power and core loss as a fixed number of
              watts, which is enough to produce a realistic efficiency estimate without a full magnetics simulation.
            </p>
            <p>
              The model assumes sinusoidal excitation at the frequency the transformer was rated for, no saturation,
              no leakage flux between windings, and a load described by a single power factor. Those assumptions are
              standard for first-pass design work and for checking whether an existing transformer is suited to a new
              voltage level. For high-frequency switching magnetics, saturable reactors, or anything running near core
              saturation, treat the results as a starting point and verify against the manufacturer&apos;s data sheet,
              because leakage inductance and winding capacitance begin to dominate at those extremes.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/transformer-calculator" />
          <PopularCalculators exclude="/calculator/transformer-calculator" />
        </div>
      </div>
    </>
  );
}
