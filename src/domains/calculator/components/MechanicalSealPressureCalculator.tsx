"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SealInputs {
  systemPressure: number;
  fluidVaporPressure: number;
  springPreload: number;
  sealType: string;
  safetyFactor: number;
}

const DEFAULTS: SealInputs = {
  systemPressure: 150,
  fluidVaporPressure: 5,
  springPreload: 120,
  sealType: "single",
  safetyFactor: 1.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const SEAL_TYPES: Record<string, { label: string; factor: number; margin: number }> = {
  single: { label: "Single seal", factor: 1.0, margin: 1.3 },
  double: { label: "Double seal", factor: 0.85, margin: 1.5 },
  tandem: { label: "Tandem seal", factor: 0.7, margin: 1.7 },
  cartridge: { label: "Cartridge seal", factor: 0.95, margin: 1.4 },
};

interface SealResult {
  sealingPressure: number;
  springLoadPressure: number;
  hydraulicUnbalance: number;
  operatingPressure: number;
  pressureSafetyMargin: number;
  designedSpringLoad: number;
  recommendedSpringLoad: number;
  pressureRatio: number;
  status: string;
  statusTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeSeal(i: SealInputs): SealResult {
  const config = SEAL_TYPES[i.sealType] || SEAL_TYPES.single;
  const invalid =
    i.systemPressure <= 0 ||
    i.fluidVaporPressure < 0 ||
    i.springPreload <= 0 ||
    i.safetyFactor < 1 ||
    !SEAL_TYPES[i.sealType];

  const sealingPressure = (i.systemPressure - i.fluidVaporPressure) * config.factor;
  const springLoadPressure = sealingPressure * i.safetyFactor;
  const hydraulicUnbalance = i.systemPressure - i.springPreload;
  const operatingPressure = Math.max(0, i.systemPressure - i.springPreload * config.factor);
  const designedSpringLoad = i.springPreload * config.margin;
  const pressureSafetyMargin =
    designedSpringLoad > 0 ? ((designedSpringLoad - sealingPressure) / designedSpringLoad) * 100 : 0;
  const recommendedSpringLoad = (sealingPressure + i.systemPressure * 0.1) * i.safetyFactor;
  const pressureRatio = i.springPreload > 0 ? sealingPressure / i.springPreload : 0;

  let status = "Safe";
  let statusTone = "text-emerald-600";
  if (sealingPressure > i.springPreload * 1.2) {
    status = "Critical";
    statusTone = "text-red-600";
  } else if (sealingPressure > i.springPreload * 0.9 || pressureSafetyMargin < 20) {
    status = "Warning";
    statusTone = "text-amber-600";
  }

  return {
    sealingPressure,
    springLoadPressure,
    hydraulicUnbalance,
    operatingPressure,
    pressureSafetyMargin,
    designedSpringLoad,
    recommendedSpringLoad,
    pressureRatio,
    status,
    statusTone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a system pressure and spring preload above zero, non-negative vapor pressure, a safety factor of at least 1, and a valid seal type."
      : "",
  };
}

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

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function MechanicalSealPressureCalculator() {
  const [systemPressure, setSystemPressure] = useState(String(DEFAULTS.systemPressure));
  const [fluidVaporPressure, setFluidVaporPressure] = useState(String(DEFAULTS.fluidVaporPressure));
  const [springPreload, setSpringPreload] = useState(String(DEFAULTS.springPreload));
  const [sealType, setSealType] = useState(DEFAULTS.sealType);
  const [safetyFactor, setSafetyFactor] = useState(String(DEFAULTS.safetyFactor));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SealInputs => ({
    systemPressure: parseFloat(systemPressure) || 0,
    fluidVaporPressure: parseFloat(fluidVaporPressure) || 0,
    springPreload: parseFloat(springPreload) || 0,
    sealType,
    safetyFactor: parseFloat(safetyFactor) || 1.5,
  });

  const [calcInputs, setCalcInputs] = useState<SealInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SealResult>(() => computeSeal(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSeal(inputs));
  };

  const reset = () => {
    setSystemPressure(String(DEFAULTS.systemPressure));
    setFluidVaporPressure(String(DEFAULTS.fluidVaporPressure));
    setSpringPreload(String(DEFAULTS.springPreload));
    setSealType(DEFAULTS.sealType);
    setSafetyFactor(String(DEFAULTS.safetyFactor));
    setCalcInputs(DEFAULTS);
    setResults(computeSeal(DEFAULTS));
  };

  const faqs = [
    {
      question: "What pressure does a mechanical seal have to hold?",
      answer:
        "The seal must hold the pressure differential across its faces, which is the system pressure less any vapor pressure the fluid contributes, adjusted for how the seal geometry exposes those faces. Because the faces are partially balanced, the actual closing load is a fraction of the full differential, which is why different seal configurations carry different factors in the calculation.",
    },
    {
      question: "Why is the spring preload so important?",
      answer:
        "The spring keeps the faces closed when the pump is off and provides the initial contact force during startup, before hydraulic pressure builds. If preload is too low the faces separate and leak at low pressure; too high and the faces run hot, wear quickly and can crack. The recommended spring load in the results targets a modest margin above the sealing pressure rather than an arbitrary figure.",
    },
    {
      question: "What does hydraulic unbalance mean here?",
      answer:
        "It is the difference between the system pressure pushing on the seal and the spring force pushing back. A large positive unbalance means the closing force comes mostly from the process fluid, so the seal depends on pressure to stay tight. A large negative value means the spring dominates, which is safer at low pressure but can overload the faces at high pressure.",
    },
    {
      question: "How should I use the seal type selection?",
      answer:
        "Each configuration exposes the faces differently. Single seals see the full differential and need a higher preload margin; double and tandem seals share the load between two sets of faces and can use a lower factor. Cartridge seals sit slightly above a single seal because the factory-assembled unit holds tighter tolerances, which reduces the amount of excess margin required.",
    },
  ];


  const sealConfig = SEAL_TYPES[calcInputs.sealType] || SEAL_TYPES.single;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Mechanical Seal Pressure Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Mechanical Seal Pressure Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Operating Conditions">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="system-pressure"
                  label="System Pressure"
                  value={systemPressure}
                  onChange={setSystemPressure}
                  onEnter={runCalculate}
                  suffix="psi"
                  tooltip="Process pressure at the seal chamber."
                />
                <CompactInput
                  id="vapor-pressure"
                  label="Fluid Vapor Pressure"
                  value={fluidVaporPressure}
                  onChange={setFluidVaporPressure}
                  onEnter={runCalculate}
                  suffix="psi"
                  min="0"
                  tooltip="Vapor pressure of the fluid at operating temperature."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="spring-preload"
                  label="Spring Preload"
                  value={springPreload}
                  onChange={setSpringPreload}
                  onEnter={runCalculate}
                  suffix="psi"
                  tooltip="Closing pressure the spring applies to the seal faces."
                />
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] text-muted-foreground">
                    Spring preload of 10 to 30 psi keeps the faces closed while the pump is stopped.
                  </span>
                </div>
              </div>
            </SubSection>

            <SubSection title="Seal Configuration">
              <CompactSelect
                id="seal-type"
                label="Seal Type"
                value={sealType}
                onChange={setSealType}
                options={[
                  { value: "single", label: "Single seal" },
                  { value: "double", label: "Double seal" },
                  { value: "tandem", label: "Tandem seal" },
                  { value: "cartridge", label: "Cartridge seal" },
                ]}
                tooltip="Each configuration exposes the faces differently and carries its own factor."
              />
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
                  <SubSection title="Design Margin">
                    <CompactInput
                      id="safety-factor"
                      label="Safety Factor"
                      value={safetyFactor}
                      onChange={setSafetyFactor}
                      onEnter={runCalculate}
                      suffix="x"
                      min="1"
                      tooltip="Multiplier applied to the sealing pressure to size the required spring load."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Sealing Pressure</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.sealingPressure, 1)} psi
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`${sealConfig.label} at ${fmt(sealConfig.factor, 2)}x face factor — status ${results.status.toLowerCase()}`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Spring Load Needed</span>
                <span className="font-extrabold text-foreground">{fmt(results.springLoadPressure, 1)} psi</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hydraulic Unbalance</span>
                <span className="font-extrabold text-foreground">{fmt(results.hydraulicUnbalance, 1)} psi</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Safety Margin</span>
                <span className={`font-extrabold ${results.statusTone}`}>{fmt(results.pressureSafetyMargin, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Pressure Line</th>
                    <th className="p-2.5 text-right w-[130px]">Value</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">System pressure</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.systemPressure, 1)} psi</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">process</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Pressure differential</td>
                    <td className="p-2.5 text-right text-foreground">
                      {fmt(calcInputs.systemPressure - calcInputs.fluidVaporPressure, 1)} psi
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">less vapor pressure</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Sealing pressure</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.sealingPressure, 1)} psi</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(sealConfig.factor, 2)}x face factor</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Required spring load</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.springLoadPressure, 1)} psi</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(calcInputs.safetyFactor, 2)}x safety</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Operating pressure at faces</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.operatingPressure, 1)} psi</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">net of spring load</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Recommended spring load</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.recommendedSpringLoad, 1)} psi</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">with 10% pressure headroom</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Design status</td>
                    <td className={`p-2.5 text-right ${results.statusTone}`}>{results.status}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.pressureRatio, 2)}x preload ratio</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Seal Type</span>
                  <span className="text-base font-bold text-foreground">{sealConfig.label}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Face Factor</span>
                  <span className="text-base font-bold text-foreground">{fmt(sealConfig.factor, 2)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Spring Preload</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.springPreload, 1)} psi</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Designed Spring Load</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.designedSpringLoad, 1)} psi</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Vapor Pressure</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.fluidVaporPressure, 2)} psi</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Status</span>
                  <span className={`text-base font-bold ${results.statusTone}`}>{results.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Mechanical Seal Pressure Calculator?</h2>
            <p>
              A mechanical seal pressure calculator works out the closing load a seal needs to stay tight against the fluid
              it contains. Two forces keep the faces together: the spring that presses them shut when the pump is idle, and
              the process pressure itself, which pushes the faces together through the seal geometry. The calculator
              separates those two contributions so the spring can be sized correctly instead of guessed.
            </p>
            <p>
              Getting the balance right matters in both directions. Too little closing force and the seal weeps at low
              pressure, when the spring is doing all the work. Too much and the faces run hot, wear rapidly and can crack
              under thermal stress. The target is a decisive but measured margin, which is what the safety factor and the
              recommended spring load in the results describe.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The sealing pressure starts from the system pressure less the fluid vapor pressure, then applies a face
              factor that reflects how much of the differential the seal geometry actually exposes. A single seal sees the
              full differential, so its factor is one; double and tandem arrangements share the load between two face sets
              and use lower factors, which is why they need less spring force for the same service.
            </p>
            <p>
              Multiplying the sealing pressure by the safety factor gives the spring load required at the faces. The
              calculator then compares that figure with the installed preload, computes the hydraulic unbalance and the
              operating pressure at the faces, and derives a safety margin from the designed spring load. From those
              numbers it classifies the arrangement as safe, marginal or overloaded, so a marginal design is visible before
              it becomes a leak.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the sealing pressure with the seal type and its face factor. The three-stat bar sets
              the required spring load against the hydraulic unbalance and the pressure safety margin, while the table
              walks through every line from the raw system pressure to the design status.
            </p>
            <p>
              Watch the preload ratio and the safety margin together. A preload ratio well below one means the process
              pressure is doing most of the sealing, so the seal will be reliable at pressure but may weep when the system
              is depressurized. A safety margin under twenty percent is thin for a hot service, where thermal distortion
              changes the face geometry the calculation assumes.
            </p>
            <p>
              Finally, treat the recommended spring load as a starting specification rather than a final answer. Face
              materials, surface finish, fluid lubricity and shaft speed all shift the real limit, and manufacturers publish
              pressure ratings for each seal size and combination. Use the calculator to narrow the options and confirm the
              spring choice, then verify against the seal vendor&apos;s data for the specific cartridge before committing to a
              build. It also pays to log the operating conditions actually seen in service, because vibration, dry running
              and abrasive solids all shorten seal life in ways the pressure arithmetic cannot show. A seal sized with a
              sensible margin, in a chamber that stays flooded and cool, will outlast a theoretically perfect seal running
              in poor conditions every time.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mechanical-seal-pressure-calculator" />
          <PopularCalculators exclude="/calculator/mechanical-seal-pressure-calculator" />
        </div>
      </div>
    </>
  );
}
