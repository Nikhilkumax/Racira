"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";

type Shape = "plate" | "round" | "square" | "tube";
type Alloy = "carbon" | "stainless" | "aluminum" | "brass";

interface SteelInputs {
  shape: Shape;
  length: number;
  dimA: number;
  dimB: number;
  quantity: number;
  alloy: Alloy;
  pricePerLb: number;
}

interface SteelResult {
  volumePerPiece: number;
  totalVolume: number;
  density: number;
  weightPerPiece: number;
  totalWeightLbs: number;
  totalWeightKg: number;
  totalTons: number;
  weightPerFoot: number;
  weightPerPieceKg: number;
  totalCost: number;
  costPerPiece: number;
  valid: boolean;
}

const SHAPES: { key: Shape; label: string; labelA: string; labelB: string; usesB: boolean }[] = [
  { key: "plate", label: "Plate / Flat Bar", labelA: "Width (in)", labelB: "Thickness (in)", usesB: true },
  { key: "round", label: "Round Bar", labelA: "Diameter (in)", labelB: "", usesB: false },
  { key: "square", label: "Square Bar", labelA: "Side (in)", labelB: "", usesB: false },
  { key: "tube", label: "Round Tube", labelA: "Outside Dia. (in)", labelB: "Wall Thickness (in)", usesB: true },
];

// Densities in lb/in³ at room temperature.
const ALLOYS: { key: Alloy; label: string; density: number; color: string }[] = [
  { key: "carbon", label: "Carbon Steel A36", density: 0.2836, color: "#2563EB" },
  { key: "stainless", label: "Stainless 304", density: 0.2890, color: "#64748B" },
  { key: "aluminum", label: "Aluminum 6061", density: 0.0975, color: "#10B981" },
  { key: "brass", label: "Brass C360", density: 0.3070, color: "#F59E0B" },
];

const LBS_PER_KG = 0.45359237;

const DEFAULTS: SteelInputs = {
  shape: "plate",
  length: 120,
  dimA: 48,
  dimB: 0.25,
  quantity: 4,
  alloy: "carbon",
  pricePerLb: 0.85,
};

export function calculateSteelWeight(i: SteelInputs): SteelResult {
  let volumePerPiece = 0;
  let valid = i.length > 0 && i.dimA > 0 && i.quantity > 0;

  if (i.shape === "plate") {
    valid = valid && i.dimB > 0;
    volumePerPiece = i.length * i.dimA * i.dimB;
  } else if (i.shape === "round") {
    volumePerPiece = Math.PI * Math.pow(i.dimA / 2, 2) * i.length;
  } else if (i.shape === "square") {
    volumePerPiece = Math.pow(i.dimA, 2) * i.length;
  } else {
    // Round tube: outer cylinder minus the bore.
    valid = valid && i.dimB > 0 && i.dimB < i.dimA / 2;
    const rOuter = i.dimA / 2;
    const rInner = rOuter - i.dimB;
    volumePerPiece = Math.PI * (Math.pow(rOuter, 2) - Math.pow(rInner, 2)) * i.length;
  }

  if (!valid) volumePerPiece = 0;

  const density = (ALLOYS.find(a => a.key === i.alloy) ?? ALLOYS[0]).density;
  const weightPerPiece = volumePerPiece * density;
  const totalWeightLbs = weightPerPiece * i.quantity;

  return {
    volumePerPiece,
    totalVolume: volumePerPiece * i.quantity,
    density,
    weightPerPiece,
    totalWeightLbs,
    totalWeightKg: totalWeightLbs * LBS_PER_KG,
    totalTons: totalWeightLbs / 2000,
    weightPerFoot: i.length > 0 ? weightPerPiece / (i.length / 12) : 0,
    weightPerPieceKg: weightPerPiece * LBS_PER_KG,
    totalCost: totalWeightLbs * i.pricePerLb,
    costPerPiece: weightPerPiece * i.pricePerLb,
    valid,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const SteelWeightCalculator = () => {
  const [shape, setShape] = useState<Shape>(DEFAULTS.shape);
  const [length, setLength] = useState(String(DEFAULTS.length));
  const [dimA, setDimA] = useState(String(DEFAULTS.dimA));
  const [dimB, setDimB] = useState(String(DEFAULTS.dimB));
  const [quantity, setQuantity] = useState(String(DEFAULTS.quantity));
  const [alloy, setAlloy] = useState<Alloy>(DEFAULTS.alloy);
  const [pricePerLb, setPricePerLb] = useState(String(DEFAULTS.pricePerLb));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<SteelResult>(calculateSteelWeight(DEFAULTS));
  const [calcInputs, setCalcInputs] = useState<SteelInputs>(DEFAULTS);

  const getInputs = (): SteelInputs => ({
    shape,
    length: parseFloat(length) || 0,
    dimA: parseFloat(dimA) || 0,
    dimB: parseFloat(dimB) || 0,
    quantity: parseFloat(quantity) || 0,
    alloy,
    pricePerLb: parseFloat(pricePerLb) || 0,
  });

  useEffect(() => {
    setResult(calculateSteelWeight(DEFAULTS));
  }, []);

  const shapeRow = SHAPES.find(s => s.key === shape) ?? SHAPES[0];
  const lengthNum = parseFloat(length) || 0;
  const aNum = parseFloat(dimA) || 0;
  const bNum = parseFloat(dimB) || 0;
  const qtyNum = parseFloat(quantity) || 0;

  let errorMsg = "";
  if (lengthNum <= 0) errorMsg = "Length must be greater than zero.";
  else if (aNum <= 0) errorMsg = `${shapeRow.labelA.replace(" (in)", "")} must be greater than zero.`;
  else if (shapeRow.usesB && bNum <= 0) errorMsg = `${shapeRow.labelB.replace(" (in)", "")} must be greater than zero.`;
  else if (shape === "tube" && bNum >= aNum / 2) errorMsg = "Wall thickness must be less than half the outside diameter.";
  else if (qtyNum <= 0) errorMsg = "Quantity must be at least one piece.";

  const hasValidationErrors = errorMsg !== "";

  const handleShapeChange = (next: Shape) => {
    setShape(next);
    if (next === "plate") { setDimA("48"); setDimB("0.25"); }
    else if (next === "round") { setDimA("2"); setDimB("0"); }
    else if (next === "square") { setDimA("2"); setDimB("0"); }
    else { setDimA("2"); setDimB("0.12"); }
  };

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    const inputs = getInputs();
    setResult(calculateSteelWeight(inputs));
    setCalcInputs(inputs);
  };

  const reset = () => {
    setShape(DEFAULTS.shape);
    setLength(String(DEFAULTS.length));
    setDimA(String(DEFAULTS.dimA));
    setDimB(String(DEFAULTS.dimB));
    setQuantity(String(DEFAULTS.quantity));
    setAlloy(DEFAULTS.alloy);
    setPricePerLb(String(DEFAULTS.pricePerLb));
    setCalcInputs(DEFAULTS);
    setResult(calculateSteelWeight(DEFAULTS));
  };

  const calcShape = SHAPES.find(s => s.key === calcInputs.shape) ?? SHAPES[0];
  const calcAlloy = ALLOYS.find(a => a.key === calcInputs.alloy) ?? ALLOYS[0];

  // Same geometry priced across every alloy, so the material choice is directly comparable.
  const chartData = ALLOYS.map(a => ({
    name: a.label.split(" ")[0],
    value: result.totalVolume * a.density,
    color: a.key === calcInputs.alloy ? a.color : "#CBD5E1",
  }));

  const handling =
    result.totalWeightLbs <= 50
      ? { label: "One-Person Lift", color: "text-emerald-600" }
      : result.totalWeightLbs <= 1000
        ? { label: "Forklift Required", color: "text-amber-600" }
        : { label: "Crane Required", color: "text-red-600" };

  const dimsText =
    calcShape.key === "plate"
      ? `${fmt(calcInputs.length, 2)} × ${fmt(calcInputs.dimA, 2)} × ${fmt(calcInputs.dimB, 3)} in`
      : calcShape.key === "tube"
        ? `${fmt(calcInputs.dimA, 3)} in OD × ${fmt(calcInputs.dimB, 3)} in wall × ${fmt(calcInputs.length, 2)} in`
        : `${fmt(calcInputs.dimA, 3)} in × ${fmt(calcInputs.length, 2)} in`;

  const breakdown = [
    { label: "Shape", value: calcShape.label },
    { label: "Dimensions", value: dimsText },
    { label: "Volume per Piece", value: `${fmt(result.volumePerPiece, 2)} in³` },
    { label: "Material", value: calcAlloy.label },
    { label: "Density", value: `${fmt(result.density, 4)} lb/in³` },
    { label: "Weight per Piece", value: `${fmt(result.weightPerPiece, 2)} lb` },
    { label: "Weight per Piece (metric)", value: `${fmt(result.weightPerPieceKg, 2)} kg` },
    { label: "Weight per Foot", value: `${fmt(result.weightPerFoot, 2)} lb/ft` },
    { label: "Quantity", value: `${fmtInt(calcInputs.quantity)} pieces` },
    { label: "Total Weight", value: `${fmt(result.totalWeightLbs, 2)} lb`, highlight: true },
    { label: "Total Weight (metric)", value: `${fmt(result.totalWeightKg, 2)} kg` },
    { label: "Cost per Piece", value: `$${fmt(result.costPerPiece, 2)}` },
  ];

  const faqs = [
    { question: "How dense is steel?", answer: "Carbon steel such as A36 has a density of about 0.2836 pounds per cubic inch, equivalent to 7,850 kg/m³. A solid one-foot cube of it weighs roughly 490 pounds. That density is why weight estimation matters before anything is moved: a beam that looks manageable on a drawing is frequently beyond what a forklift can safely handle." },
    { question: "What is the formula for steel weight?", answer: "Calculate the geometric volume in cubic inches, then multiply by the density in pounds per cubic inch. A plate is length × width × thickness. A round bar is π × radius² × length. A round tube is π × (outer radius² − inner radius²) × length. Multiply the result by the number of pieces for the total lift weight." },
    { question: "Is stainless steel heavier than carbon steel?", answer: "Marginally. Carbon steel sits near 0.2836 lb/in³ and 304 stainless near 0.2890 lb/in³, a difference of under two percent. For shipping and lifting purposes the two are effectively interchangeable. Aluminum is the outlier at roughly 0.0975 lb/in³, about one third the weight of steel for identical geometry." },
    { question: "How do I calculate the weight of a tube?", answer: "Subtract the bore from the solid cylinder. Take the outside radius, subtract the wall thickness to get the inside radius, then compute π × (outer radius² − inner radius²) × length. A common error is subtracting the wall thickness once rather than twice when converting outside diameter to inside diameter — the wall exists on both sides." },
    { question: "Why does weight per foot matter?", answer: "Steel is specified and priced by linear weight in most catalogues, so weight per foot is how a calculated figure gets checked against a published section table. It also drives the practical questions: how many lengths fit on a truck below its axle limit, and whether a given rack or trestle can carry the bundle." },
    { question: "Does this cover I-beams and channels?", answer: "No. Structural shapes such as W-beams, channels and angles have fillets, tapered flanges and rolling tolerances that a simple geometric formula cannot capture. Their weights come from published section tables in AISC or the equivalent regional standard. This calculator covers plate, flat bar, round bar, square bar and round tube, where the geometry is exact." },
    { question: "How accurate is the estimated cost?", answer: "The arithmetic is exact for the price per pound entered, but mill pricing moves constantly and rarely appears as a flat rate. Real quotes add size extras, grade extras, cutting charges, freight and often a minimum order quantity. Treat the figure as a baseline for comparing options rather than as a quotable price." },
    { question: "Should I add an allowance for mill tolerance?", answer: "For estimating purposes, yes. Hot-rolled plate is permitted to run over its nominal thickness, so delivered weight commonly exceeds the calculated figure by a small margin. Adding two to three percent when sizing lifting equipment or booking transport gives a sensible safety margin at negligible cost." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction", href: "/calculator#construction" }, { label: "Steel Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Steel Weight Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="shape" className="flex items-center text-sm font-medium text-foreground mb-1">Shape</label>
                <select
                  id="shape"
                  value={shape}
                  onChange={e => handleShapeChange(e.target.value as Shape)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {SHAPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <InputField id="length" label="Length (in)" value={length} onChange={setLength} suffix="in" step="any" tooltip="Length of a single piece in inches. 120 in = 10 ft." />
              <InputField id="dim-a" label={shapeRow.labelA} value={dimA} onChange={setDimA} suffix="in" step="any" tooltip="Primary cross-section dimension in inches." />
              {shapeRow.usesB ? (
                <InputField id="dim-b" label={shapeRow.labelB} value={dimB} onChange={setDimB} suffix="in" step="any" tooltip="Secondary cross-section dimension in inches." />
              ) : (
                <InputField id="quantity" label="Quantity" value={quantity} onChange={setQuantity} tooltip="Number of identical pieces." />
              )}
              {shapeRow.usesB && (
                <InputField id="quantity" label="Quantity" value={quantity} onChange={setQuantity} tooltip="Number of identical pieces." />
              )}
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Material</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="alloy" className="flex items-center text-sm font-medium text-foreground mb-1">Alloy</label>
                        <select
                          id="alloy"
                          value={alloy}
                          onChange={e => setAlloy(e.target.value as Alloy)}
                          className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {ALLOYS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Pricing</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="price-lb" label="Price ($/lb)" value={pricePerLb} onChange={setPricePerLb} prefix="$" step="any" tooltip="Mill or supplier price per pound, excluding freight and extras." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total Weight</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.totalWeightLbs, 2)} lb</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmtInt(calcInputs.quantity)} × {calcShape.label} in {calcAlloy.label} — {fmt(result.totalWeightKg, 1)} kg
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Piece</span>
                <span className="font-extrabold text-foreground">{fmt(result.weightPerPiece, 1)} lb</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Handling</span>
                <span className={`font-extrabold ${handling.color}`}>{handling.label}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Material Cost</span>
                <span className="font-extrabold text-foreground">${fmtInt(result.totalCost)}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Total Material Cost</td>
                    <td className="py-2.5 px-3 text-right text-foreground">${fmt(result.totalCost, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Total Weight by Alloy — Same Geometry</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v: number) => `${fmtInt(v)}`} />
                    <Tooltip formatter={(v: number) => [`${fmt(v, 1)} lb`, "Total weight"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: calcAlloy.color }} />
                  <span className="font-semibold text-muted-foreground">{calcAlloy.label}</span>
                  <span className="font-bold text-foreground">{fmt(result.totalWeightLbs, 1)} lb</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#CBD5E1" }} />
                  <span className="font-semibold text-muted-foreground">Alternative alloys</span>
                </div>
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Weight</span>
                  <span className="font-bold text-foreground">{fmt(result.totalWeightLbs, 2)} lb</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Weight (metric)</span>
                  <span className="font-bold text-foreground">{fmt(result.totalWeightKg, 2)} kg</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Weight per Piece</span>
                  <span className="font-bold text-foreground">{fmt(result.weightPerPiece, 2)} lb</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Weight per Piece (metric)</span>
                  <span className="font-bold text-foreground">{fmt(result.weightPerPieceKg, 2)} kg</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Weight per Foot</span>
                  <span className="font-bold text-foreground">{fmt(result.weightPerFoot, 2)} lb/ft</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Volume per Piece</span>
                  <span className="font-bold text-foreground">{fmt(result.volumePerPiece, 2)} in³</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Density</span>
                  <span className="font-bold text-foreground">{fmt(result.density, 4)} lb/in³</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Short Tons</span>
                  <span className="font-bold text-foreground">{fmt(result.totalTons, 3)} t</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Cost per Piece</span>
                  <span className="font-bold text-foreground">${fmt(result.costPerPiece, 2)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Material Cost</span>
                  <span className="font-bold text-foreground">${fmt(result.totalCost, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Weight Is Volume Times Density, Nothing More</h2>
            <p>Every steel weight calculation reduces to the same two steps: establish the geometric volume, then multiply by the density of the alloy. Carbon steel A36 sits at 0.2836 pounds per cubic inch, or 7,850 kilograms per cubic metre. The arithmetic is trivial; the errors almost always come from the geometry, particularly when a cross-section is more complicated than it first appears.</p>
            <h2 className="text-2xl font-bold mb-3">Getting the Geometry Right</h2>
            <p>A plate is simply length × width × thickness. A round bar is π × radius² × length, and a square bar is side² × length. Tube is where mistakes cluster: the inside diameter equals the outside diameter minus twice the wall thickness, because the wall exists on both sides of the bore. Subtracting the wall only once inflates the calculated weight substantially on thin-wall sections.</p>
            <h2 className="text-2xl font-bold mb-3">Alloy Makes Less Difference Than Expected — Except Aluminum</h2>
            <p>Carbon steel and 304 stainless differ by under two percent in density, so substituting one for the other changes almost nothing for lifting or freight planning. Brass runs about eight percent heavier than steel. Aluminum 6061 is the genuine outlier at roughly 0.0975 lb/in³, about a third of steel's density, which is precisely why it dominates applications where weight rather than raw strength is the binding constraint.</p>
            <h2 className="text-2xl font-bold mb-3">Why Weight per Foot Is the Working Number</h2>
            <p>Steel is catalogued and priced by linear weight, so weight per foot is the figure that lets a calculated result be checked against a published section table. It also answers the practical questions directly: how many lengths a truck can carry before hitting its axle limit, whether a storage rack is rated for the bundle, and what a fabricator will actually be invoiced for.</p>
            <h2 className="text-2xl font-bold mb-3">Structural Shapes Need Section Tables</h2>
            <p>Wide-flange beams, channels and angles cannot be calculated from nominal dimensions. Their real cross-sections include root fillets, tapered flanges and rolling tolerances that a rectangle-and-circle model does not represent. Published weights in AISC or the equivalent regional standard already account for all of it, and they should be used directly. This calculator deliberately covers only the shapes whose geometry is exact.</p>
            <h2 className="text-2xl font-bold mb-3">Building In a Tolerance Allowance</h2>
            <p>Hot-rolled plate is permitted to run over nominal thickness, and mills generally take advantage of that allowance since material is sold by weight. Delivered weight therefore tends to exceed the calculated figure slightly. Adding two to three percent when sizing lifting equipment, booking transport or checking a floor loading costs nothing at the estimating stage and prevents an unpleasant discovery on delivery day.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/steel-weight-calculator" />
          <PopularCalculators exclude="/calculator/steel-weight-calculator" />
        </div>
      </div>
    </>
  );
};

export default SteelWeightCalculator;
