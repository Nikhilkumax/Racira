"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type DensityMode = "density" | "mass" | "volume";

interface DensityInputs {
  mode: DensityMode;
  massKg: number;
  volumeL: number;
  densityGcm3: number;
  referenceDensity: number;
  decimals: number;
}

const DEFAULTS: DensityInputs = {
  mode: "density",
  massKg: 2,
  volumeL: 1,
  densityGcm3: 1,
  referenceDensity: 1,
  decimals: 3,
};

const fmt = (v: number, d = 3) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface UnitRow {
  unit: string;
  value: number;
}

interface DensityResult {
  valid: boolean;
  errorMsg: string;
  densityGcm3: number;
  massKg: number;
  volumeL: number;
  massG: number;
  volumeMl: number;
  specificGravity: number;
  units: UnitRow[];
  floats: boolean;
  submergedFraction: number;
  referenceDensity: number;
}

const UNIT_FACTORS: { unit: string; factor: number }[] = [
  { unit: "g/cm³", factor: 1 },
  { unit: "kg/m³", factor: 1000 },
  { unit: "g/mL", factor: 1 },
  { unit: "kg/L", factor: 1 },
  { unit: "lb/ft³", factor: 62.42796 },
  { unit: "lb/in³", factor: 0.0361273 },
  { unit: "oz/in³", factor: 0.578037 },
];

function computeDensity(input: DensityInputs): DensityResult {
  const { mode, massKg, volumeL, densityGcm3, referenceDensity } = input;

  const blank: DensityResult = {
    valid: false,
    errorMsg: "",
    densityGcm3: 0,
    massKg: 0,
    volumeL: 0,
    massG: 0,
    volumeMl: 0,
    specificGravity: 0,
    units: [],
    floats: false,
    submergedFraction: 0,
    referenceDensity,
  };

  if (
    !Number.isFinite(massKg) ||
    !Number.isFinite(volumeL) ||
    !Number.isFinite(densityGcm3) ||
    !Number.isFinite(referenceDensity)
  ) {
    return { ...blank, errorMsg: "Enter a number in every visible field to run the calculation." };
  }

  let d = densityGcm3;
  let m = massKg;
  let v = volumeL;

  if (mode === "density") {
    if (m <= 0 || v <= 0) {
      return { ...blank, errorMsg: "Mass and volume must both be greater than zero to find a density." };
    }
    d = m / v;
  } else if (mode === "mass") {
    if (d <= 0 || v <= 0) {
      return { ...blank, errorMsg: "Density and volume must both be greater than zero to find a mass." };
    }
    m = d * v;
  } else {
    if (d <= 0) {
      return { ...blank, errorMsg: "Density must be greater than zero to find a volume." };
    }
    if (m <= 0) {
      return { ...blank, errorMsg: "Mass must be greater than zero to find a volume." };
    }
    v = m / d;
  }

  const specificGravity = d / 1;
  const units: UnitRow[] = UNIT_FACTORS.map((u) => ({ unit: u.unit, value: Number((d * u.factor).toFixed(6)) }));
  const floats = d < referenceDensity;
  const submergedFraction = d > 0 && referenceDensity > 0 ? Math.min(1, d / referenceDensity) * 100 : 0;

  return {
    valid: true,
    errorMsg: "",
    densityGcm3: Number(d.toFixed(6)),
    massKg: Number(m.toFixed(6)),
    volumeL: Number(v.toFixed(6)),
    massG: Number((m * 1000).toFixed(6)),
    volumeMl: Number((v * 1000).toFixed(6)),
    specificGravity: Number(specificGravity.toFixed(6)),
    units,
    floats,
    submergedFraction: Number(submergedFraction.toFixed(4)),
    referenceDensity,
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

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function DensityCalculator() {
  const [mode, setMode] = useState<DensityMode>(DEFAULTS.mode);
  const [massKg, setMassKg] = useState(String(DEFAULTS.massKg));
  const [volumeL, setVolumeL] = useState(String(DEFAULTS.volumeL));
  const [densityGcm3, setDensityGcm3] = useState(String(DEFAULTS.densityGcm3));
  const [referenceDensity, setReferenceDensity] = useState(String(DEFAULTS.referenceDensity));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DensityInputs => ({
    mode,
    massKg: parseFloat(massKg) || 0,
    volumeL: parseFloat(volumeL) || 0,
    densityGcm3: parseFloat(densityGcm3) || 0,
    referenceDensity: parseFloat(referenceDensity) || 1,
    decimals: Math.max(0, Math.min(8, parseFloat(decimals) || 3)),
  });

  const [calcInputs, setCalcInputs] = useState<DensityInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DensityResult>(() => computeDensity(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDensity(inputs));
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setMassKg(String(DEFAULTS.massKg));
    setVolumeL(String(DEFAULTS.volumeL));
    setDensityGcm3(String(DEFAULTS.densityGcm3));
    setReferenceDensity(String(DEFAULTS.referenceDensity));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(computeDensity(DEFAULTS));
  };

  const MODES: { key: DensityMode; label: string }[] = [
    { key: "density", label: "Density" },
    { key: "mass", label: "Mass" },
    { key: "volume", label: "Volume" },
  ];

  const primaryValue = () => {
    if (!results.valid) return "—";
    if (calcInputs.mode === "density") return `${fmt(results.densityGcm3, calcInputs.decimals)} g/cm³`;
    if (calcInputs.mode === "mass") return `${fmt(results.massKg, calcInputs.decimals)} kg`;
    return `${fmt(results.volumeL, calcInputs.decimals)} L`;
  };

  const primaryLabel = () =>
    calcInputs.mode === "density" ? "Density" : calcInputs.mode === "mass" ? "Mass" : "Volume";

  const faqs = [
    {
      question: "What is the formula for density?",
      answer:
        "Density equals mass divided by volume, usually written ρ = m ÷ V. Rearranging gives mass from density times volume and volume from mass divided by density, which is why the calculator can solve any of the three from the other two. Units matter: grams per cubic centimetre and kilograms per litre are numerically identical.",
    },
    {
      question: "Why do some objects float and others sink?",
      answer:
        "An object floats when its average density is lower than the density of the fluid around it. Water sits at about one gram per cubic centimetre, so anything below that floats and anything above sinks. Steel sinks, but a steel ship floats because its hull contains enough air that the average density of the whole vessel drops below water.",
    },
    {
      question: "What is specific gravity?",
      answer:
        "Specific gravity compares a material's density with the density of water, so it is the density in grams per cubic centimetre with the units removed. A specific gravity of 2.7 for aluminium means it is two point seven times as dense as water. Because it is a pure ratio, the same number works in metric or imperial calculations.",
    },
    {
      question: "How does temperature affect density?",
      answer:
        "Most materials expand when heated and contract when cooled, so density falls as temperature rises for a fixed mass. Water is unusual in that it reaches maximum density at about four degrees Celsius and becomes less dense as it freezes, which is why ice floats. Always quote the temperature when a precise density figure matters.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Density Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Density Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Solve For">
              <div className="grid grid-cols-3 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    aria-pressed={mode === m.key}
                    className={
                      mode === m.key
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </SubSection>

            <SubSection title="Known Values">
              <div className="grid grid-cols-2 gap-3">
                {mode !== "mass" && (
                  <CompactInput
                    id="mass"
                    label="Mass"
                    value={massKg}
                    onChange={setMassKg}
                    onEnter={runCalculate}
                    suffix="kg"
                    tooltip="Mass in kilograms. One kilogram is 1000 grams or about 2.205 pounds."
                  />
                )}
                {mode !== "volume" && (
                  <CompactInput
                    id="volume"
                    label="Volume"
                    value={volumeL}
                    onChange={setVolumeL}
                    onEnter={runCalculate}
                    suffix="L"
                    tooltip="Volume in litres, which is the same as 1000 cubic centimetres."
                  />
                )}
                {mode !== "density" && (
                  <CompactInput
                    id="density"
                    label="Density"
                    value={densityGcm3}
                    onChange={setDensityGcm3}
                    onEnter={runCalculate}
                    suffix="g/cm³"
                    tooltip="Density in grams per cubic centimetre, numerically equal to kilograms per litre."
                  />
                )}
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
                  <SubSection title="Buoyancy & Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="reference-density"
                        label="Fluid Density"
                        value={referenceDensity}
                        onChange={setReferenceDensity}
                        onEnter={runCalculate}
                        suffix="g/cm³"
                        tooltip="Density of the surrounding fluid. Water is 1.0 g/cm³."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimal Places"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="How many digits to show after the decimal point."
                      />
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
                {primaryLabel()}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{primaryValue()}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.massKg, calcInputs.decimals)} kg occupying ${fmt(results.volumeL, calcInputs.decimals)} L at ${fmt(results.densityGcm3, calcInputs.decimals)} g/cm³`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Specific Gravity</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.specificGravity, calcInputs.decimals) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mass in Grams</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.massG, 1) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Buoyancy</span>
                <span className="font-extrabold text-foreground">{results.valid ? (results.floats ? "Floats" : "Sinks") : "—"}</span>
              </div>
            </div>

            {/* UNIT CONVERSION TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Density In</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.units.map((row, i) => (
                    <tr key={row.unit} className={i === 0 ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.unit}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.value, calcInputs.decimals)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Volume in millilitres</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.volumeMl, 1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BUOYANCY TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Buoyancy Check</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Fluid density</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {`${fmt(results.referenceDensity, calcInputs.decimals)} g/cm³`}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Object density</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {`${fmt(results.densityGcm3, calcInputs.decimals)} g/cm³`}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Verdict</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.floats ? "Floats in the fluid" : "Sinks in the fluid"}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Submerged when floating</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.submergedFraction, 2)}%</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Solving For</span>
                  <span className="text-base font-bold text-foreground">{primaryLabel()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Density</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.densityGcm3, calcInputs.decimals)} g/cm³`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mass</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.massKg, calcInputs.decimals)} kg`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Volume</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.volumeL, calcInputs.decimals)} L`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mass in Pounds</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.massKg * 2.2046226, 3)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Volume in Gallons (US)</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.volumeL * 0.264172, 4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Density Calculator?</h2>
            <p>
              A density calculator works with the relationship between mass, volume and density, so any one of the three can
              be found from the other two. Tell it the mass and volume and it returns density, give it density and volume and
              it returns mass, or supply density and mass to get volume. Every answer is also expressed in seven different
              density units.
            </p>
            <p>
              Density is the property that links how heavy something feels with how much space it takes up. It explains why
              a kilogram of feathers fills a duvet while a kilogram of lead fits in a pocket, why ships float and why hot air
              rises. In engineering it drives buoyancy, flow and strength calculations, and in the kitchen it decides whether
              a cake batter sinks or rises.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator divides mass by volume to get density, multiplies density by volume to get mass, and divides mass
              by density to get volume. The units are chosen so the arithmetic is seamless: a kilogram per litre is exactly the
              same as a gram per cubic centimetre, so the numbers can be read directly in either system without conversion
              factors creeping in.
            </p>
            <p>
              Once density is known, the tool multiplies it by fixed conversion factors to fill in the unit table and divides
              it by the reference fluid density to produce specific gravity. Comparing the object density with the fluid density
              gives the buoyancy verdict, and the ratio between them gives the percentage of the object that would sit below the
              surface if it floats, which is the same calculation used to trim a boat.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows whichever quantity you asked for, with specific gravity, mass in grams and the buoyancy
              verdict in the three-stat bar. The first table converts the density into grams per cubic centimetre, kilograms
              per cubic metre, grams per millilitre, kilograms per litre, pounds per cubic foot, pounds per cubic inch and
              ounces per cubic inch.
            </p>
            <p>
              The second table handles flotation. An object floats when its average density is below the density of the fluid,
              and the submerged percentage tells you how much of it sits under the surface. Ice at about 0.92 grams per cubic
              centimetre floats with roughly ninety-two percent of its volume underwater, which is why only the tip of an
              iceberg shows above the waterline.
            </p>
            <p>
              Use specific gravity when comparing materials, because it removes the units entirely and makes the comparison
              scale-free. Water is the benchmark at one, aluminium sits near 2.7, steel near 7.8 and gold near 19.3. A specific
              gravity below one means the material floats in water, and the further above one it sits, the more it will sink.
            </p>
            <p>
              Finally, remember that density changes with temperature and pressure. Gases are especially sensitive, which is why
              a balloon stiffens in the cold, and liquids change by a fraction of a percent over ordinary temperature ranges.
              For precise work, use a density measured at the temperature you care about, and treat the figure here as a
              reference value at room conditions.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/density-calculator" />
          <PopularCalculators exclude="/calculator/density-calculator" />
        </div>
      </div>
    </>
  );
}
