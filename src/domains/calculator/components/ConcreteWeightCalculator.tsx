"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Shape = "slab" | "wall" | "footing" | "column";

interface ConcreteInputs {
  shape: Shape;
  length: number;
  width: number;
  thickness: number;
  height: number;
  diameter: number;
  density: number;
  wastePct: number;
  bagSizeKg: number;
}

const DEFAULTS: ConcreteInputs = {
  shape: "slab",
  length: 5,
  width: 4,
  thickness: 0.1,
  height: 2.4,
  diameter: 0.3,
  density: 2400,
  wastePct: 5,
  bagSizeKg: 25,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const DENSITY_PRESETS: { label: string; value: number; note: string }[] = [
  { label: "Normal weight", value: 2400, note: "Standard structural concrete" },
  { label: "Reinforced", value: 2500, note: "Includes typical steel content" },
  { label: "Lightweight", value: 1850, note: "Expanded clay or pumice aggregate" },
  { label: "High density", value: 3000, note: "Barite or magnetite aggregate" },
];

interface DensityRow {
  label: string;
  density: number;
  weightKg: number;
  weightLb: number;
  note: string;
}

interface ConcreteResult {
  valid: boolean;
  errorMsg: string;
  volumeM3: number;
  volumeYd3: number;
  volumeFt3: number;
  weightKg: number;
  weightLb: number;
  weightTonnes: number;
  weightUst: number;
  bags: number;
  bagsWithWaste: number;
  waterLitres: number;
  densityRows: DensityRow[];
  formulaText: string;
}

function computeConcrete(input: ConcreteInputs): ConcreteResult {
  const { shape, length, width, thickness, height, diameter, density, wastePct, bagSizeKg } = input;

  const blank: ConcreteResult = {
    valid: false,
    errorMsg: "",
    volumeM3: 0,
    volumeYd3: 0,
    volumeFt3: 0,
    weightKg: 0,
    weightLb: 0,
    weightTonnes: 0,
    weightUst: 0,
    bags: 0,
    bagsWithWaste: 0,
    waterLitres: 0,
    densityRows: [],
    formulaText: "",
  };

  if (![length, width, thickness, height, diameter, density, wastePct, bagSizeKg].every((v) => Number.isFinite(v))) {
    return { ...blank, errorMsg: "Enter a number in every visible field." };
  }
  if (density <= 0) return { ...blank, errorMsg: "Concrete density must be greater than zero." };
  if (wastePct < 0) return { ...blank, errorMsg: "The waste allowance cannot be negative." };
  if (bagSizeKg <= 0) return { ...blank, errorMsg: "Bag size must be greater than zero." };

  let volume = 0;
  let formulaText = "";

  if (shape === "slab" || shape === "footing") {
    if (length <= 0 || width <= 0 || thickness <= 0) {
      return { ...blank, errorMsg: "Length, width and thickness must all be greater than zero." };
    }
    volume = length * width * thickness;
    formulaText = `${length} m × ${width} m × ${thickness} m`;
  } else if (shape === "wall") {
    if (length <= 0 || height <= 0 || thickness <= 0) {
      return { ...blank, errorMsg: "Length, height and thickness must all be greater than zero." };
    }
    volume = length * height * thickness;
    formulaText = `${length} m × ${height} m × ${thickness} m`;
  } else {
    if (diameter <= 0 || height <= 0) {
      return { ...blank, errorMsg: "Column diameter and height must both be greater than zero." };
    }
    volume = Math.PI * Math.pow(diameter / 2, 2) * height;
    formulaText = `π × (${diameter} m ÷ 2)² × ${height} m`;
  }

  const volumeWithWaste = volume * (1 + wastePct / 100);
  const weightKg = volume * density;
  const weightKgWithWaste = volumeWithWaste * density;

  const densityRows: DensityRow[] = DENSITY_PRESETS.map((preset) => ({
    label: preset.label,
    density: preset.value,
    weightKg: Number((volume * preset.value).toFixed(1)),
    weightLb: Number((volume * preset.value * 2.2046226).toFixed(1)),
    note: preset.note,
  }));

  return {
    valid: true,
    errorMsg: "",
    volumeM3: Number(volume.toFixed(4)),
    volumeYd3: Number((volume * 1.3079506).toFixed(4)),
    volumeFt3: Number((volume * 35.314667).toFixed(3)),
    weightKg: Number(weightKg.toFixed(1)),
    weightLb: Number((weightKg * 2.2046226).toFixed(1)),
    weightTonnes: Number((weightKg / 1000).toFixed(4)),
    weightUst: Number((weightKg / 907.18474).toFixed(4)),
    bags: Math.ceil(weightKg / bagSizeKg),
    bagsWithWaste: Math.ceil(weightKgWithWaste / bagSizeKg),
    waterLitres: Number((weightKg * 0.055).toFixed(1)),
    densityRows,
    formulaText,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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

export default function ConcreteWeightCalculator() {
  const [shape, setShape] = useState<Shape>(DEFAULTS.shape);
  const [length, setLength] = useState(String(DEFAULTS.length));
  const [width, setWidth] = useState(String(DEFAULTS.width));
  const [thickness, setThickness] = useState(String(DEFAULTS.thickness));
  const [height, setHeight] = useState(String(DEFAULTS.height));
  const [diameter, setDiameter] = useState(String(DEFAULTS.diameter));
  const [density, setDensity] = useState(String(DEFAULTS.density));
  const [wastePct, setWastePct] = useState(String(DEFAULTS.wastePct));
  const [bagSizeKg, setBagSizeKg] = useState(String(DEFAULTS.bagSizeKg));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ConcreteInputs => ({
    shape,
    length: parseFloat(length) || 0,
    width: parseFloat(width) || 0,
    thickness: parseFloat(thickness) || 0,
    height: parseFloat(height) || 0,
    diameter: parseFloat(diameter) || 0,
    density: parseFloat(density) || 0,
    wastePct: parseFloat(wastePct) || 0,
    bagSizeKg: parseFloat(bagSizeKg) || 25,
  });

  const [calcInputs, setCalcInputs] = useState<ConcreteInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ConcreteResult>(() => computeConcrete(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeConcrete(inputs));
  };

  const reset = () => {
    setShape(DEFAULTS.shape);
    setLength(String(DEFAULTS.length));
    setWidth(String(DEFAULTS.width));
    setThickness(String(DEFAULTS.thickness));
    setHeight(String(DEFAULTS.height));
    setDiameter(String(DEFAULTS.diameter));
    setDensity(String(DEFAULTS.density));
    setWastePct(String(DEFAULTS.wastePct));
    setBagSizeKg(String(DEFAULTS.bagSizeKg));
    setCalcInputs(DEFAULTS);
    setResults(computeConcrete(DEFAULTS));
  };

  const SHAPES: { key: Shape; label: string }[] = [
    { key: "slab", label: "Slab" },
    { key: "wall", label: "Wall" },
    { key: "footing", label: "Footing" },
    { key: "column", label: "Column" },
  ];

  const isPrismatic = shape !== "column";

  const faqs = [
    {
      question: "How much does a cubic metre of concrete weigh?",
      answer:
        "Normal weight concrete is usually taken as about two thousand four hundred kilograms per cubic metre, which is roughly four thousand and fifty pounds per cubic yard. Reinforced sections sit a little heavier because of the steel, lightweight mixes drop to about eighteen hundred and fifty, and high density mixes made with barite can exceed three thousand.",
    },
    {
      question: "How do I convert volume to weight?",
      answer:
        "Multiply the volume in cubic metres by the density in kilograms per cubic metre. A slab measuring five metres by four metres by one hundred millimetres thick has a volume of two cubic metres, and at normal weight that comes to four thousand eight hundred kilograms, or almost five tonnes.",
    },
    {
      question: "How many bags of concrete do I need?",
      answer:
        "Divide the total weight by the bag size, then round up and add the waste allowance. A twenty-five kilogram bag yields a little over ten litres of mixed concrete, so a two cubic metre slab needs close to two hundred bags, which is why anything more than about one cubic metre is usually ordered ready-mixed.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "Concrete Weight Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Concrete Weight Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Element">
              <div className="grid grid-cols-4 gap-2">
                {SHAPES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setShape(s.key)}
                    aria-pressed={shape === s.key}
                    className={
                      shape === s.key
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-xs transition-colors"
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </SubSection>

            <SubSection title="Dimensions">
              {isPrismatic ? (
                <div className="grid grid-cols-3 gap-3">
                  <CompactInput
                    id="length"
                    label="Length"
                    value={length}
                    onChange={setLength}
                    onEnter={runCalculate}
                    suffix="m"
                    tooltip="Longest horizontal dimension."
                  />
                  <CompactInput
                    id={shape === "wall" ? "wall-height" : "width"}
                    label={shape === "wall" ? "Height" : "Width"}
                    value={shape === "wall" ? height : width}
                    onChange={shape === "wall" ? setHeight : setWidth}
                    onEnter={runCalculate}
                    suffix="m"
                    tooltip="Second horizontal dimension or wall height."
                  />
                  <CompactInput
                    id="thickness"
                    label="Thickness"
                    value={thickness}
                    onChange={setThickness}
                    onEnter={runCalculate}
                    suffix="m"
                    tooltip="Depth or thickness of the concrete."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput
                    id="diameter"
                    label="Column Diameter"
                    value={diameter}
                    onChange={setDiameter}
                    onEnter={runCalculate}
                    suffix="m"
                    tooltip="Diameter of a round column in metres."
                  />
                  <CompactInput
                    id="column-height"
                    label="Column Height"
                    value={height}
                    onChange={setHeight}
                    onEnter={runCalculate}
                    suffix="m"
                    tooltip="Height of the column."
                  />
                </div>
              )}
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
                  <SubSection title="Density & Supply">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="density"
                        label="Density"
                        value={density}
                        onChange={setDensity}
                        onEnter={runCalculate}
                        suffix="kg/m³"
                        tooltip="Normal weight concrete is about 2400 kg/m³."
                      />
                      <CompactInput
                        id="waste"
                        label="Waste"
                        value={wastePct}
                        onChange={setWastePct}
                        onEnter={runCalculate}
                        min="0"
                        suffix="%"
                        tooltip="Extra allowance for spillage and uneven subgrade."
                      />
                      <CompactInput
                        id="bag-size"
                        label="Bag Size"
                        value={bagSizeKg}
                        onChange={setBagSizeKg}
                        onEnter={runCalculate}
                        min="1"
                        suffix="kg"
                        tooltip="Weight of the bagged mix you plan to use."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Concrete Weight</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.weightKg, 0)} kg` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.weightKg / 1000, 3)} tonnes · ${fmt(results.volumeM3, 3)} m³ at ${fmt(calcInputs.density, 0)} kg/m³`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Volume</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.volumeM3, 3)} m³` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weight in Pounds</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.weightLb, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bags Needed</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.bagsWithWaste : "—"}</span>
              </div>
            </div>

            {/* MEASURE TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measure</th>
                    <th className="p-2.5 pr-3 text-right w-[200px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Volume formula</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.formulaText || "—"}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Volume in cubic metres</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.volumeM3, 4)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Volume in cubic yards</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.volumeYd3, 4)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Volume in cubic feet</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.volumeFt3, 3)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Weight in kilograms</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.weightKg, 1)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Weight in metric tonnes</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.weightTonnes, 4)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Weight in US short tons</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.weightUst, 4)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Bags at the chosen size, with waste</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{`${results.bagsWithWaste} bags of ${fmt(calcInputs.bagSizeKg, 0)} kg`}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DENSITY TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Mix Type</th>
                    <th className="p-2.5 text-right">Density</th>
                    <th className="p-2.5 text-right">Weight</th>
                    <th className="p-2.5 pr-3">Typical Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.densityRows.map((row) => (
                    <tr
                      key={row.label}
                      className={row.density === calcInputs.density ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.density, 0)} kg/m³`}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.weightKg, 0)} kg`}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Element</span>
                  <span className="text-base font-bold text-foreground">
                    {calcInputs.shape === "column" ? "Round column" : calcInputs.shape === "wall" ? "Wall" : calcInputs.shape === "slab" ? "Slab" : "Footing"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Density Assumed</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.density, 0)} kg/m³`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Volume Without Waste</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.volumeM3, 4)} m³`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Waste Allowance</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.wastePct, 1)}%`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bags Without Waste</span>
                  <span className="text-base font-bold text-foreground">{results.bags}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Water Needed (approx.)</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.waterLitres, 1)} L`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Concrete Weight Calculator?</h2>
            <p>
              A concrete weight calculator turns the dimensions of a slab, wall, footing or column into a volume and then into a
              weight, using the density of the mix. It reports cubic metres, cubic yards and cubic feet, weight in kilograms,
              pounds, metric tonnes and US short tons, plus the number of bags and an estimate of the water required.
            </p>
            <p>
              Weight matters for more than curiosity. It determines whether a slab needs extra reinforcement, whether a suspended
              floor can take a screed, how many trips a truck needs, whether a crane or pump is required and what the delivery
              charge will be, since ready-mix prices usually include a metric tonne allowance before surcharges apply.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The volume calculation depends on the shape. Rectangular elements multiply length by width by thickness, walls
              multiply length by height by thickness, and round columns multiply pi by the radius squared by the height. The result
              is a volume in cubic metres, which is the standard unit for ordering ready-mixed concrete in most of the world.
            </p>
            <p>
              Weight follows by multiplying volume by density. Normal weight concrete sits at about two thousand four hundred
              kilograms per cubic metre, and the calculator also shows what the same pour would weigh in lightweight, reinforced and
              high density mixes so the effect of the specification is visible before the order is placed.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the weight in kilograms with the volume and density beneath it, and the three-stat bar reports
              volume, weight in pounds and the number of bags including the waste allowance. The first table sets out every volume
              and weight unit with the formula used, so the arithmetic can be checked.
            </p>
            <p>
              Bag counts climb very quickly, which is the most common surprise. A two cubic metre slab needs nearly two hundred
              twenty-five kilogram bags, and mixing that volume by hand is impractical. Above roughly one cubic metre, ordering
              ready-mixed concrete is usually cheaper, faster and more consistent than mixing on site.
            </p>
            <p>
              Keep the waste allowance in the plan. Five to ten percent covers spillage, uneven subgrade, formwork deflection and
              the last bit left in the chute. Running short mid-pour is far more expensive than ordering slightly over, because a
              cold joint between two deliveries weakens the finished element.
            </p>
            <p>
              Finally, check the density against the specification rather than assuming normal weight. Lightweight mixes can be a
              quarter lighter and high density mixes a quarter heavier, and on a suspended slab that difference decides whether the
              design load is respected. The mix type table makes the comparison explicit for the volume you entered.
            </p>
            <p>
              For anything structural, treat this figure as a check rather than a design. Reinforcement quantities, cover,
              formwork pressure and the sequence of pours all belong to an engineer, and the weight calculated here feeds into
              those decisions rather than replacing them. Use it to sanity-check a delivery ticket, plan lifting equipment and
              confirm a truck can reach the pour without overloading a driveway. Recording the volume ordered against the volume
              poured is a useful habit as well, since it is the quickest way to notice a formwork leak or an over-ordered load
              while the truck is still on site.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/concrete-weight-calculator" />
          <PopularCalculators exclude="/calculator/concrete-weight-calculator" />
        </div>
      </div>
    </>
  );
}
