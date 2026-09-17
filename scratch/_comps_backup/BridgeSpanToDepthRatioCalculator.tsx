"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";

type SuperstructureType =
  | "steel-i-beam"
  | "steel-composite"
  | "concrete-tbeam"
  | "concrete-box"
  | "prestressed-igirder"
  | "concrete-slab";
type SpanCondition = "simple" | "continuous";
type DeflectionLimit = "800" | "1000" | "1200";

interface BridgeInputs {
  spanLength: number;
  structureDepth: number;
  superstructure: SuperstructureType;
  spanCondition: SpanCondition;
  girderSpacing: number;
  deckThickness: number;
  deflectionLimit: DeflectionLimit;
}

interface BridgeResult {
  ratio: number;
  minDepthSimple: number;
  minDepthContinuous: number;
  requiredDepth: number;
  maxAllowableRatio: number;
  utilization: number;
  passes: boolean;
  margin: number;
  depthShortfall: number;
  structureLabel: string;
  allowableDeflection: number;
  spanToSpacingRatio: number;
  deckSpanRatio: number;
  verdict: string;
}

interface StructureSpec {
  key: SuperstructureType;
  label: string;
  // AASHTO LRFD Table 2.5.2.6.3-1 traditional minimum depth coefficients.
  simple: number;
  continuous: number;
  color: string;
}

const STRUCTURES: StructureSpec[] = [
  { key: "steel-i-beam", label: "Steel I-Beam (non-composite)", simple: 0.04, continuous: 0.032, color: "#2563EB" },
  { key: "steel-composite", label: "Steel Composite Girder", simple: 0.033, continuous: 0.027, color: "#0EA5E9" },
  { key: "concrete-tbeam", label: "Reinforced Concrete T-Beam", simple: 0.07, continuous: 0.065, color: "#F59E0B" },
  { key: "concrete-box", label: "Reinforced Concrete Box Beam", simple: 0.06, continuous: 0.055, color: "#F97316" },
  { key: "prestressed-igirder", label: "Prestressed Concrete I-Girder", simple: 0.045, continuous: 0.04, color: "#10B981" },
  { key: "concrete-slab", label: "Reinforced Concrete Slab", simple: 0.07, continuous: 0.065, color: "#8B5CF6" },
];

const DEFAULTS: BridgeInputs = {
  spanLength: 120,
  structureDepth: 5.5,
  superstructure: "prestressed-igirder",
  spanCondition: "simple",
  girderSpacing: 8,
  deckThickness: 8,
  deflectionLimit: "800",
};

export function calculateBridgeRatio(i: BridgeInputs): BridgeResult {
  const spec = STRUCTURES.find(s => s.key === i.superstructure) ?? STRUCTURES[0];

  const ratio = i.structureDepth > 0 ? i.spanLength / i.structureDepth : 0;
  const minDepthSimple = spec.simple * i.spanLength;
  const minDepthContinuous = spec.continuous * i.spanLength;
  const requiredDepth = i.spanCondition === "simple" ? minDepthSimple : minDepthContinuous;
  const coefficient = i.spanCondition === "simple" ? spec.simple : spec.continuous;

  // The depth limit expressed as a span-to-depth ratio is simply the inverse of the coefficient.
  const maxAllowableRatio = coefficient > 0 ? 1 / coefficient : 0;
  const passes = i.structureDepth >= requiredDepth;

  // Allowable live-load deflection, converted from feet of span to inches.
  const allowableDeflection = (i.spanLength * 12) / Number(i.deflectionLimit);

  return {
    ratio,
    minDepthSimple,
    minDepthContinuous,
    requiredDepth,
    maxAllowableRatio,
    utilization: maxAllowableRatio > 0 ? (ratio / maxAllowableRatio) * 100 : 0,
    passes,
    margin: i.structureDepth - requiredDepth,
    depthShortfall: Math.max(requiredDepth - i.structureDepth, 0),
    structureLabel: spec.label,
    allowableDeflection,
    spanToSpacingRatio: i.girderSpacing > 0 ? i.spanLength / i.girderSpacing : 0,
    deckSpanRatio: i.deckThickness > 0 ? (i.girderSpacing * 12) / i.deckThickness : 0,
    verdict: passes
      ? "Depth satisfies the AASHTO traditional minimum. No deflection check waiver required."
      : "Depth is below the AASHTO traditional minimum. An explicit live-load deflection check is required.",
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function BridgeSpanToDepthRatioCalculator() {
  const [spanLength, setSpanLength] = useState(String(DEFAULTS.spanLength));
  const [structureDepth, setStructureDepth] = useState(String(DEFAULTS.structureDepth));
  const [superstructure, setSuperstructure] = useState<SuperstructureType>(DEFAULTS.superstructure);
  const [spanCondition, setSpanCondition] = useState<SpanCondition>(DEFAULTS.spanCondition);
  const [girderSpacing, setGirderSpacing] = useState(String(DEFAULTS.girderSpacing));
  const [deckThickness, setDeckThickness] = useState(String(DEFAULTS.deckThickness));
  const [deflectionLimit, setDeflectionLimit] = useState<DeflectionLimit>(DEFAULTS.deflectionLimit);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<BridgeResult>(calculateBridgeRatio(DEFAULTS));

  const getInputs = (): BridgeInputs => ({
    spanLength: parseFloat(spanLength) || 0,
    structureDepth: parseFloat(structureDepth) || 0,
    superstructure,
    spanCondition,
    girderSpacing: parseFloat(girderSpacing) || 0,
    deckThickness: parseFloat(deckThickness) || 0,
    deflectionLimit,
  });

  useEffect(() => {
    setResult(calculateBridgeRatio(DEFAULTS));
  }, []);

  const spanNum = parseFloat(spanLength) || 0;
  const depthNum = parseFloat(structureDepth) || 0;
  const spacingNum = parseFloat(girderSpacing) || 0;
  const deckNum = parseFloat(deckThickness) || 0;

  let errorMsg = "";
  if (spanNum <= 0) errorMsg = "Span length must be greater than zero.";
  else if (depthNum <= 0) errorMsg = "Structure depth must be greater than zero.";
  else if (depthNum > spanNum) errorMsg = "Structure depth cannot exceed the span length.";
  else if (spacingNum <= 0) errorMsg = "Girder spacing must be greater than zero.";
  else if (deckNum <= 0) errorMsg = "Deck thickness must be greater than zero.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResult(calculateBridgeRatio(getInputs()));
  };

  const reset = () => {
    setSpanLength(String(DEFAULTS.spanLength));
    setStructureDepth(String(DEFAULTS.structureDepth));
    setSuperstructure(DEFAULTS.superstructure);
    setSpanCondition(DEFAULTS.spanCondition);
    setGirderSpacing(String(DEFAULTS.girderSpacing));
    setDeckThickness(String(DEFAULTS.deckThickness));
    setDeflectionLimit(DEFAULTS.deflectionLimit);
    setResult(calculateBridgeRatio(DEFAULTS));
  };

  const passColor = result.passes ? "text-emerald-600" : "text-red-600";
  const utilColor =
    result.utilization <= 85 ? "text-emerald-600" : result.utilization <= 100 ? "text-amber-600" : "text-red-600";

  const chartData = STRUCTURES.map(s => {
    const coefficient = spanCondition === "simple" ? s.simple : s.continuous;
    return { name: s.label.split(" ")[0] + (s.key === "steel-composite" ? " Comp" : s.key === "concrete-box" ? " Box" : s.key === "concrete-slab" ? " Slab" : ""), value: coefficient > 0 ? 1 / coefficient : 0, color: s.key === superstructure ? s.color : "#CBD5E1" };
  });

  const breakdown = [
    { label: "Span Length", value: `${fmt(spanNum, 1)} ft` },
    { label: "Structure Depth", value: `${fmt(depthNum, 2)} ft` },
    { label: "Superstructure Type", value: result.structureLabel },
    { label: "Span Condition", value: spanCondition === "simple" ? "Simple span" : "Continuous span" },
    { label: "Span-to-Depth Ratio", value: `${fmt(result.ratio, 2)} : 1`, highlight: true },
    { label: "Maximum Allowable Ratio", value: `${fmt(result.maxAllowableRatio, 2)} : 1` },
    { label: "Minimum Depth (simple span)", value: `${fmt(result.minDepthSimple, 2)} ft` },
    { label: "Minimum Depth (continuous span)", value: `${fmt(result.minDepthContinuous, 2)} ft` },
    { label: "Governing Minimum Depth", value: `${fmt(result.requiredDepth, 2)} ft` },
    { label: "Depth Margin", value: `${result.margin >= 0 ? "+" : ""}${fmt(result.margin, 2)} ft` },
    { label: `Allowable Deflection (L/${deflectionLimit})`, value: `${fmt(result.allowableDeflection, 2)} in` },
    { label: "Deck Span-to-Thickness Ratio", value: `${fmt(result.deckSpanRatio, 1)} : 1` },
  ];

  const faqs = [
    { question: "What is the span-to-depth ratio?", answer: "It is the clear span of a bridge divided by the overall depth of its superstructure, both measured in the same units. A 120-foot span on a 5.5-foot deep girder has a ratio of about 21.8 to 1. The figure is a quick proxy for stiffness: shallower structures relative to their span deflect more under live load, vibrate more noticeably, and require more material to control both." },
    { question: "What does AASHTO specify?", answer: "AASHTO LRFD Table 2.5.2.6.3-1 gives traditional minimum depths as a fraction of span length, differing by superstructure type and by whether the span is simple or continuous. Simple-span prestressed concrete I-girders use 0.045L, composite steel girders 0.033L, and reinforced concrete T-beams 0.070L. Continuous spans use slightly smaller coefficients because negative moment over the supports reduces midspan deflection." },
    { question: "Are the minimum depths mandatory?", answer: "No. They are traditional values, and the specification permits shallower structures provided an explicit live-load deflection check is performed and satisfied. Meeting the table depth is effectively a deemed-to-satisfy route that lets the designer skip that check. Falling below it is not a failure — it is a trigger for additional analysis, which this calculator flags rather than prohibits." },
    { question: "Why do continuous spans permit shallower sections?", answer: "Continuity develops negative bending moment over the interior supports, which reduces the positive moment and the deflection at midspan compared with a simple span of the same length. The structure is stiffer for the same depth, so the code allows a smaller depth coefficient. The trade-off is greater sensitivity to differential support settlement and more complex detailing at the piers." },
    { question: "What deflection limits apply?", answer: "The common optional criterion is L/800 for general vehicular bridges and L/1000 where pedestrians are present, tightening to L/1200 for pedestrian bridges in some jurisdictions. On a 120-foot span, L/800 permits 1.80 inches of live-load deflection. These limits address user comfort and secondary damage to deck joints and wearing surfaces rather than structural capacity." },
    { question: "How does girder spacing interact with depth?", answer: "Wider girder spacing distributes more of the deck load to each line of girders, increasing the moment each must carry and typically driving depth up. Spacing also governs the deck slab itself: the deck's own span-to-thickness ratio is a separate serviceability check, and an eight-inch deck spanning eight feet between girders gives a ratio of twelve to one, which is conventional practice." },
    { question: "Does a passing ratio mean the bridge is adequate?", answer: "No. The span-to-depth check is a serviceability screen, and satisfying it says nothing about flexural capacity, shear capacity, fatigue, stability, or the load rating. A girder can comfortably exceed the minimum depth and still be inadequate for the design vehicle. Treat a pass as clearance of one preliminary hurdle in a sizing exercise, not as verification." },
    { question: "Where is this most useful?", answer: "During preliminary sizing and feasibility work, where the depth available is often fixed by vertical clearance beneath the bridge or by approach grade above it. Checking the ratio early establishes whether a given superstructure type can work within the available envelope before any detailed analysis is commissioned, and identifies when a different structure type or an additional pier is the cheaper answer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Engineering", href: "/calculator#engineering" }, { label: "Bridge Span-to-Depth Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bridge Span-to-Depth Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="span" label="Span Length (ft)" value={spanLength} onChange={setSpanLength} suffix="ft" step="any" tooltip="Clear span between supports, in feet." />
              <InputField id="depth" label="Structure Depth (ft)" value={structureDepth} onChange={setStructureDepth} suffix="ft" step="any" tooltip="Overall depth of the superstructure including the deck slab." />
              <div className="col-span-2">
                <label htmlFor="superstructure" className="flex items-center text-sm font-medium text-foreground mb-1">Superstructure Type</label>
                <select
                  id="superstructure"
                  value={superstructure}
                  onChange={e => setSuperstructure(e.target.value as SuperstructureType)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {STRUCTURES.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="span-condition" className="flex items-center text-sm font-medium text-foreground mb-1">Span Condition</label>
                <select
                  id="span-condition"
                  value={spanCondition}
                  onChange={e => setSpanCondition(e.target.value as SpanCondition)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="simple">Simple span</option>
                  <option value="continuous">Continuous span</option>
                </select>
              </div>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Deck Geometry</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="spacing" label="Girder Spacing (ft)" value={girderSpacing} onChange={setGirderSpacing} suffix="ft" step="any" tooltip="Centre-to-centre spacing between girder lines." />
                      <InputField id="deck" label="Deck Thickness (in)" value={deckThickness} onChange={setDeckThickness} suffix="in" step="any" tooltip="Structural thickness of the deck slab, in inches." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Serviceability Criterion</div>
                    <div>
                      <label htmlFor="deflection" className="flex items-center text-sm font-medium text-foreground mb-1">Live-Load Deflection Limit</label>
                      <select
                        id="deflection"
                        value={deflectionLimit}
                        onChange={e => setDeflectionLimit(e.target.value as DeflectionLimit)}
                        className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="800">L/800 — general vehicular</option>
                        <option value="1000">L/1000 — pedestrian traffic present</option>
                        <option value="1200">L/1200 — pedestrian bridge</option>
                      </select>
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Span-to-Depth Ratio</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.ratio, 1)} : 1</div>
              <div className="text-sm text-muted-foreground font-medium">
                limit {fmt(result.maxAllowableRatio, 1)} : 1 · minimum depth {fmt(result.requiredDepth, 2)} ft
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">AASHTO Check</span>
                <span className={`font-extrabold ${passColor}`}>{result.passes ? "Pass" : "Below minimum"}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Utilization</span>
                <span className={`font-extrabold ${utilColor}`}>{fmt(result.utilization, 0)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Depth Margin</span>
                <span className={`font-extrabold ${result.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {result.margin >= 0 ? "+" : ""}{fmt(result.margin, 2)} ft
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Parameter</th>
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
                    <td className="py-2.5 px-3 text-foreground">Ratio Utilization</td>
                    <td className={`py-2.5 px-3 text-right ${utilColor}`}>{fmt(result.utilization, 1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Allowable Ratio by Superstructure Type</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" width={35} />
                    <Tooltip formatter={(v: number) => [`${fmt(v, 1)} : 1`, "Allowable ratio"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                    <ReferenceLine y={result.ratio} stroke="#EF4444" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STRUCTURES.find(s => s.key === superstructure)?.color ?? "#2563EB" }} />
                  <span className="font-semibold text-muted-foreground">Selected type limit</span>
                  <span className="font-bold text-foreground">{fmt(result.maxAllowableRatio, 1)} : 1</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#EF4444" }} />
                  <span className="font-semibold text-muted-foreground">Your ratio</span>
                  <span className="font-bold text-foreground">{fmt(result.ratio, 1)} : 1</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#CBD5E1" }} />
                  <span className="font-semibold text-muted-foreground">Other types</span>
                </div>
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Span Length</span>
                  <span className="font-bold text-foreground">{fmt(spanNum, 1)} ft</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Structure Depth</span>
                  <span className="font-bold text-foreground">{fmt(depthNum, 2)} ft</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Superstructure Type</span>
                  <span className="font-bold text-foreground">{result.structureLabel}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Span Condition</span>
                  <span className="font-bold text-foreground">{spanCondition === "simple" ? "Simple" : "Continuous"}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Span-to-Depth Ratio</span>
                  <span className={`font-bold ${passColor}`}>{fmt(result.ratio, 2)} : 1</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Maximum Allowable Ratio</span>
                  <span className="font-bold text-foreground">{fmt(result.maxAllowableRatio, 2)} : 1</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Min Depth (simple)</span>
                  <span className="font-bold text-foreground">{fmt(result.minDepthSimple, 2)} ft</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Min Depth (continuous)</span>
                  <span className="font-bold text-foreground">{fmt(result.minDepthContinuous, 2)} ft</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Governing Minimum Depth</span>
                  <span className="font-bold text-foreground">{fmt(result.requiredDepth, 2)} ft</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Depth Margin</span>
                  <span className={`font-bold ${result.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {result.margin >= 0 ? "+" : ""}{fmt(result.margin, 2)} ft
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Allowable Deflection (L/{deflectionLimit})</span>
                  <span className="font-bold text-foreground">{fmt(result.allowableDeflection, 2)} in</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Deck Span-to-Thickness</span>
                  <span className="font-bold text-foreground">{fmt(result.deckSpanRatio, 1)} : 1</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {result.verdict}
                {result.depthShortfall > 0 ? ` Increasing depth by ${fmt(result.depthShortfall, 2)} ft would satisfy the traditional minimum.` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Span-to-Depth Ratio Tells You</h2>
            <p>The span-to-depth ratio is the clear span of a bridge divided by the overall depth of its superstructure, measured in consistent units. A 120-foot span carried on a 5.5-foot deep girder gives roughly 21.8 to 1. The figure works as a fast proxy for stiffness: a shallower structure relative to its span deflects further under live load, vibrates more perceptibly under traffic, and generally needs more material to bring both within acceptable bounds. Because it can be computed from two dimensions, it is the first check most engineers run when sizing a superstructure.</p>
            <h2 className="text-2xl font-bold mb-3">The AASHTO Minimum Depths</h2>
            <p>AASHTO LRFD Table 2.5.2.6.3-1 sets traditional minimum depths as a fraction of span length, varying by superstructure type and span condition. Simple-span prestressed concrete I-girders use 0.045 times the span, composite steel girders 0.033, non-composite steel I-beams 0.040, and reinforced concrete T-beams 0.070. Continuous spans use slightly smaller coefficients throughout, because negative moment developing over the interior supports reduces the deflection at midspan for the same section. Expressed as a ratio, the limit is simply the inverse of the coefficient, so 0.045 corresponds to a maximum span-to-depth ratio of about 22.2 to 1.</p>
            <h2 className="text-2xl font-bold mb-3">These Are Not Hard Limits</h2>
            <p>Falling below the table depth is not a code violation. The specification explicitly permits shallower structures provided the designer performs and satisfies an explicit live-load deflection check. Meeting the traditional depth is a deemed-to-satisfy route that lets that check be skipped. This calculator therefore reports a shortfall as a trigger for further analysis rather than as a failure, and reports how much additional depth would clear the traditional minimum if that is the simpler path.</p>
            <h2 className="text-2xl font-bold mb-3">Deflection and Deck Geometry</h2>
            <p>The common optional deflection criterion is span over 800 for general vehicular bridges, tightening to span over 1000 where pedestrians are present and span over 1200 for dedicated pedestrian structures. On a 120-foot span, L/800 permits 1.80 inches of live-load deflection. These limits exist for user comfort and to protect deck joints and wearing surfaces, not to guarantee capacity. Girder spacing matters too: wider spacing loads each girder line more heavily and pushes depth up, while the deck slab carries its own separate span-to-thickness check — an eight-inch deck spanning eight feet between girders gives twelve to one, which is conventional.</p>
            <h2 className="text-2xl font-bold mb-3">Scope of This Check</h2>
            <p>A passing ratio confirms one serviceability screen and nothing more. It says nothing about flexural or shear capacity, fatigue life, lateral-torsional stability, or the load rating against any design vehicle. A girder can sit comfortably above the minimum depth and still be inadequate. Use this calculator for preliminary sizing and feasibility work — particularly where vertical clearance beneath the bridge or approach grade above it constrains the depth envelope — and follow it with full structural analysis under the applicable code before committing to any design.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bridge-span-to-depth-ratio-calculator" />
          <PopularCalculators exclude="/calculator/bridge-span-to-depth-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
