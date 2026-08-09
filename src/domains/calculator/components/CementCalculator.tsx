"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";

type Grade = "1:1.5:3" | "1:2:4" | "1:3:6" | "1:4:8";

interface CementInputs {
  wetVolume: number;
  grade: Grade;
  bagSize: number;
  wastagePercent: number;
  waterCementRatio: number;
  costPerBag: number;
  sandCostPerTonne: number;
  aggregateCostPerTonne: number;
}

interface CementResult {
  dryVolume: number;
  cementVolume: number;
  sandVolume: number;
  aggregateVolume: number;
  cementWeight: number;
  sandWeight: number;
  aggregateWeight: number;
  cementBags: number;
  waterLitres: number;
  cementSharePct: number;
  sandSharePct: number;
  aggregateSharePct: number;
  cementCost: number;
  sandCost: number;
  aggregateCost: number;
  totalCost: number;
  costPerCubicMetre: number;
  totalDryWeight: number;
}

const GRADES: { key: Grade; label: string; note: string; strength: string }[] = [
  { key: "1:1.5:3", label: "M20 (1 : 1.5 : 3)", note: "Slabs, beams, columns", strength: "20 MPa" },
  { key: "1:2:4", label: "M15 (1 : 2 : 4)", note: "Foundations, pavements", strength: "15 MPa" },
  { key: "1:3:6", label: "M10 (1 : 3 : 6)", note: "Pathways, mass concrete", strength: "10 MPa" },
  { key: "1:4:8", label: "M7.5 (1 : 4 : 8)", note: "Lean mix, levelling course", strength: "7.5 MPa" },
];

// Bulk densities in kg/m³ — standard values for OPC, river sand and crushed stone.
const CEMENT_DENSITY = 1440;
const SAND_DENSITY = 1600;
const AGGREGATE_DENSITY = 1500;
// Dry materials occupy ~54% more volume than the wet concrete they produce.
const DRY_VOLUME_FACTOR = 1.54;

const DEFAULTS: CementInputs = {
  wetVolume: 10,
  grade: "1:2:4",
  bagSize: 50,
  wastagePercent: 5,
  waterCementRatio: 0.5,
  costPerBag: 8.5,
  sandCostPerTonne: 25,
  aggregateCostPerTonne: 30,
};

export function calculateCement(i: CementInputs): CementResult {
  const parts = i.grade.split(":").map(p => parseFloat(p));
  const totalParts = parts[0] + parts[1] + parts[2];

  const dryVolume = i.wetVolume * DRY_VOLUME_FACTOR * (1 + i.wastagePercent / 100);

  const cementVolume = (parts[0] / totalParts) * dryVolume;
  const sandVolume = (parts[1] / totalParts) * dryVolume;
  const aggregateVolume = (parts[2] / totalParts) * dryVolume;

  const cementWeight = cementVolume * CEMENT_DENSITY;
  const sandWeight = sandVolume * SAND_DENSITY;
  const aggregateWeight = aggregateVolume * AGGREGATE_DENSITY;

  const cementBags = i.bagSize > 0 ? Math.ceil(cementWeight / i.bagSize) : 0;
  // 1 kg of water = 1 litre.
  const waterLitres = cementWeight * i.waterCementRatio;

  const cementCost = cementBags * i.costPerBag;
  const sandCost = (sandWeight / 1000) * i.sandCostPerTonne;
  const aggregateCost = (aggregateWeight / 1000) * i.aggregateCostPerTonne;
  const totalCost = cementCost + sandCost + aggregateCost;

  return {
    dryVolume,
    cementVolume,
    sandVolume,
    aggregateVolume,
    cementWeight,
    sandWeight,
    aggregateWeight,
    cementBags,
    waterLitres,
    cementSharePct: dryVolume > 0 ? (cementVolume / dryVolume) * 100 : 0,
    sandSharePct: dryVolume > 0 ? (sandVolume / dryVolume) * 100 : 0,
    aggregateSharePct: dryVolume > 0 ? (aggregateVolume / dryVolume) * 100 : 0,
    cementCost,
    sandCost,
    aggregateCost,
    totalCost,
    costPerCubicMetre: i.wetVolume > 0 ? totalCost / i.wetVolume : 0,
    totalDryWeight: cementWeight + sandWeight + aggregateWeight,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const CementCalculator = () => {
  const [wetVolume, setWetVolume] = useState(String(DEFAULTS.wetVolume));
  const [grade, setGrade] = useState<Grade>(DEFAULTS.grade);
  const [bagSize, setBagSize] = useState(String(DEFAULTS.bagSize));
  const [wastagePercent, setWastagePercent] = useState(String(DEFAULTS.wastagePercent));
  const [waterCementRatio, setWaterCementRatio] = useState(String(DEFAULTS.waterCementRatio));
  const [costPerBag, setCostPerBag] = useState(String(DEFAULTS.costPerBag));
  const [sandCostPerTonne, setSandCostPerTonne] = useState(String(DEFAULTS.sandCostPerTonne));
  const [aggregateCostPerTonne, setAggregateCostPerTonne] = useState(String(DEFAULTS.aggregateCostPerTonne));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<CementResult>(calculateCement(DEFAULTS));
  const [calcGrade, setCalcGrade] = useState<Grade>(DEFAULTS.grade);
  const [calcVolume, setCalcVolume] = useState(DEFAULTS.wetVolume);

  const getInputs = (): CementInputs => ({
    wetVolume: parseFloat(wetVolume) || 0,
    grade,
    bagSize: parseFloat(bagSize) || 0,
    wastagePercent: parseFloat(wastagePercent) || 0,
    waterCementRatio: parseFloat(waterCementRatio) || 0,
    costPerBag: parseFloat(costPerBag) || 0,
    sandCostPerTonne: parseFloat(sandCostPerTonne) || 0,
    aggregateCostPerTonne: parseFloat(aggregateCostPerTonne) || 0,
  });

  useEffect(() => {
    setResult(calculateCement(DEFAULTS));
  }, []);

  const volNum = parseFloat(wetVolume) || 0;
  const bagNum = parseFloat(bagSize) || 0;
  const wastageNum = parseFloat(wastagePercent) || 0;
  const wcrNum = parseFloat(waterCementRatio) || 0;

  let errorMsg = "";
  if (volNum <= 0) errorMsg = "Wet volume must be greater than zero.";
  else if (bagNum <= 0) errorMsg = "Bag size must be greater than zero.";
  else if (wastageNum < 0 || wastageNum > 50) errorMsg = "Wastage must be between 0% and 50%.";
  else if (wcrNum < 0.3 || wcrNum > 0.8) errorMsg = "Water-cement ratio must be between 0.30 and 0.80.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    const inputs = getInputs();
    setResult(calculateCement(inputs));
    setCalcGrade(inputs.grade);
    setCalcVolume(inputs.wetVolume);
  };

  const reset = () => {
    setWetVolume(String(DEFAULTS.wetVolume));
    setGrade(DEFAULTS.grade);
    setBagSize(String(DEFAULTS.bagSize));
    setWastagePercent(String(DEFAULTS.wastagePercent));
    setWaterCementRatio(String(DEFAULTS.waterCementRatio));
    setCostPerBag(String(DEFAULTS.costPerBag));
    setSandCostPerTonne(String(DEFAULTS.sandCostPerTonne));
    setAggregateCostPerTonne(String(DEFAULTS.aggregateCostPerTonne));
    setCalcGrade(DEFAULTS.grade);
    setCalcVolume(DEFAULTS.wetVolume);
    setResult(calculateCement(DEFAULTS));
  };

  const gradeRow = GRADES.find(g => g.key === calcGrade) ?? GRADES[1];

  const chartData = [
    { name: "Cement", value: result.cementSharePct, color: "#64748B" },
    { name: "Sand", value: result.sandSharePct, color: "#F59E0B" },
    { name: "Aggregate", value: result.aggregateSharePct, color: "#3B82F6" },
  ];

  const wcrFlag =
    wcrNum <= 0.5 ? "text-emerald-600" : wcrNum <= 0.6 ? "text-amber-600" : "text-red-600";

  const breakdown = [
    { label: "Wet Concrete Volume", value: `${fmt(calcVolume, 2)} m³` },
    { label: `Dry Volume Factor (×1.54 +${fmt(wastageNum, 0)}% wastage)`, value: `${fmt(result.dryVolume, 2)} m³` },
    { label: "Cement Volume", value: `${fmt(result.cementVolume, 3)} m³` },
    { label: "Cement Weight", value: `${fmtInt(result.cementWeight)} kg` },
    { label: `Cement Bags (${fmtInt(bagNum)} kg)`, value: `${fmtInt(result.cementBags)} bags`, highlight: true },
    { label: "Sand Volume", value: `${fmt(result.sandVolume, 3)} m³` },
    { label: "Sand Weight", value: `${fmtInt(result.sandWeight)} kg` },
    { label: "Aggregate Volume", value: `${fmt(result.aggregateVolume, 3)} m³` },
    { label: "Aggregate Weight", value: `${fmtInt(result.aggregateWeight)} kg` },
    { label: "Mixing Water", value: `${fmtInt(result.waterLitres)} L` },
    { label: "Cement Cost", value: `$${fmt(result.cementCost, 2)}` },
    { label: "Sand + Aggregate Cost", value: `$${fmt(result.sandCost + result.aggregateCost, 2)}` },
  ];

  const faqs = [
    { question: "What is the difference between cement and concrete?", answer: "Cement is an ingredient, not the finished material. It is the fine grey powder made by firing limestone and clay, and it acts as the binder. Concrete is the hardened product created when cement, water, sand and aggregate are mixed together. A wall built from cement alone would crack and crumble, because the sand and stone provide the structural body." },
    { question: "What do mix ratios like 1:2:4 mean?", answer: "They give the volumetric proportions of the dry ingredients in the order cement : sand : aggregate. A 1:2:4 mix uses one part cement, two parts sand and four parts gravel by volume. This calculator converts those parts into cubic metres, then into kilograms using standard bulk densities of 1440, 1600 and 1500 kg/m³ respectively." },
    { question: "Why multiply the wet volume by 1.54?", answer: "Dry sand and gravel contain substantial air voids between grains. When water and cement paste are added, that paste fills the voids and the mixture shrinks noticeably. To end up with one cubic metre of placed concrete you must start with roughly 1.54 cubic metres of dry material. For mortar, which contains no coarse aggregate, the equivalent factor is about 1.33." },
    { question: "Which grade should I use?", answer: "M20 (1:1.5:3) is the residential standard for structural slabs, beams and load-bearing columns. M15 (1:2:4) suits foundations, driveways and pavements. M10 (1:3:6) is for non-structural pathways and mass concrete. M7.5 (1:4:8) is a lean mix used for thin levelling courses beneath a structural pour." },
    { question: "How much wastage should I allow?", answer: "Five percent is a reasonable default for a well-managed small pour. Allow eight to ten percent for awkward access, hand mixing, uneven subgrade, or when concrete has to be barrowed a long distance. Ordering slightly over is far cheaper than stopping a pour half-finished, since a cold joint permanently weakens the slab." },
    { question: "What does the water-cement ratio control?", answer: "It is the weight of mixing water divided by the weight of cement, and it governs the final strength more than any other single variable. Around 0.45 gives a strong, dense concrete that is stiff to place. At 0.60 the mix pours easily but cures noticeably weaker. Ratios above 0.65 leave microscopic voids as the excess water evaporates, producing a flaky, crack-prone surface." },
    { question: "How many 50 kg bags are in a cubic metre of cement?", answer: "Cement has a bulk density of about 1440 kg/m³, so one cubic metre of loose cement weighs 1440 kg — roughly 29 bags of 50 kg. Note that this is cubic metres of cement powder alone, not of finished concrete; a cubic metre of M15 concrete needs only about six to seven bags." },
    { question: "Does this calculator include reinforcement steel?", answer: "No. It covers cement, sand, coarse aggregate and mixing water only. Reinforcing bar, mesh, formwork, admixtures and labour are priced separately and vary far more by region and project than the concrete constituents do." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction", href: "/calculator#construction" }, { label: "Cement Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cement Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="wet-volume" label="Wet Volume (m³)" value={wetVolume} onChange={setWetVolume} suffix="m³" step="any" tooltip="Final volume of placed concrete you need to pour." />
              <div>
                <label htmlFor="grade" className="flex items-center text-sm font-medium text-foreground mb-1">Mix Grade</label>
                <select
                  id="grade"
                  value={grade}
                  onChange={e => setGrade(e.target.value as Grade)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {GRADES.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                </select>
              </div>
              <InputField id="bag-size" label="Bag Size (kg)" value={bagSize} onChange={setBagSize} suffix="kg" tooltip="Weight of one cement bag. 50 kg is the global standard; US bags are often 42.6 kg (94 lb)." />
              <InputField id="wastage" label="Wastage (%)" value={wastagePercent} onChange={setWastagePercent} suffix="%" tooltip="Allowance for spillage, over-excavation and mixing losses." />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Mix Adjustments</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="wcr" label="Water-Cement Ratio" value={waterCementRatio} onChange={setWaterCementRatio} step="0.01" tooltip="Water weight divided by cement weight. 0.45 for structural mixes, 0.60 for lean mixes." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Material Pricing</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="cost-bag" label="Cement ($/bag)" value={costPerBag} onChange={setCostPerBag} prefix="$" step="any" tooltip="Delivered price of one cement bag." />
                      <InputField id="cost-sand" label="Sand ($/tonne)" value={sandCostPerTonne} onChange={setSandCostPerTonne} prefix="$" step="any" tooltip="Delivered price of sand per metric tonne." />
                      <InputField id="cost-agg" label="Aggregate ($/tonne)" value={aggregateCostPerTonne} onChange={setAggregateCostPerTonne} prefix="$" step="any" tooltip="Delivered price of crushed stone per metric tonne." />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Cement Bags Required</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtInt(result.cementBags)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmtInt(bagNum)} kg bags for {fmt(calcVolume, 2)} m³ of {gradeRow.label.split(" ")[0]} concrete
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dry Volume</span>
                <span className="font-extrabold text-foreground">{fmt(result.dryVolume, 2)} m³</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mixing Water</span>
                <span className={`font-extrabold ${wcrFlag}`}>{fmtInt(result.waterLitres)} L</span>
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
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
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
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Dry Volume Composition</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPie>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} stroke="none">
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${fmt(v, 1)}%`, "Share of dry volume"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </RPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {chartData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[12px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-muted-foreground">{d.name}</span>
                    <span className="font-bold text-foreground">{fmt(d.value, 1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Cement Bags</span>
                  <span className="font-bold text-foreground">{fmtInt(result.cementBags)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Dry Volume</span>
                  <span className="font-bold text-foreground">{fmt(result.dryVolume, 2)} m³</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Cement Weight</span>
                  <span className="font-bold text-foreground">{fmtInt(result.cementWeight)} kg</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Sand Weight</span>
                  <span className="font-bold text-foreground">{fmtInt(result.sandWeight)} kg</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Aggregate Weight</span>
                  <span className="font-bold text-foreground">{fmtInt(result.aggregateWeight)} kg</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Mixing Water</span>
                  <span className="font-bold text-foreground">{fmtInt(result.waterLitres)} L</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Dry Weight</span>
                  <span className="font-bold text-foreground">{fmtInt(result.totalDryWeight)} kg</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Design Strength</span>
                  <span className="font-bold text-foreground">{gradeRow.strength}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Material Cost</span>
                  <span className="font-bold text-foreground">${fmt(result.totalCost, 2)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Cost per m³</span>
                  <span className="font-bold text-foreground">${fmt(result.costPerCubicMetre, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Cement and Concrete Are Not the Same Thing</h2>
            <p>The single most common error in small-scale construction is treating the two words as interchangeable. Cement is a manufactured powder produced by firing limestone and clay at roughly 1,450°C and grinding the result. It is the binder, nothing more. Concrete is what you get when that binder is combined with water, sand and coarse aggregate. Without the sand and stone providing bulk and internal friction, a cement-and-water paste has very little useful strength and shrinks severely as it cures.</p>
            <h2 className="text-2xl font-bold mb-3">Why Dry Volume Exceeds Wet Volume</h2>
            <p>A heap of dry sand and gravel is riddled with air voids between the individual particles. Adding water and cement produces a paste that flows into every one of those voids, so the mixture consolidates and its total volume falls sharply. The industry convention is to multiply the required wet volume by 1.54 to obtain the dry material volume to order. Mortar, which omits coarse aggregate, uses a smaller factor of about 1.33 because sand packs more tightly than a graded stone mix.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Mix Ratio</h2>
            <p>Ratios are always written cement : sand : aggregate, by volume. A 1:2:4 mix therefore contains seven parts in total, of which one seventh is cement. This calculator distributes the dry volume across those parts, then converts each fraction to weight using standard bulk densities — 1440 kg/m³ for cement, 1600 for river sand and 1500 for crushed stone. Because cement is sold by weight and sand and stone by the tonne, working in kilograms is what makes an order sheet possible.</p>
            <h2 className="text-2xl font-bold mb-3">The Water-Cement Ratio Decides the Strength</h2>
            <p>Of every variable under a builder's control, the water-cement ratio has the largest effect on cured strength. A ratio near 0.45 produces dense, durable concrete that is stiff and takes effort to place. Pushing toward 0.60 makes the mix pour and level far more easily, which is exactly why it happens so often on site, and it costs a substantial fraction of the design strength. Water beyond what the cement can chemically bind eventually evaporates, leaving a network of capillary voids that show up as surface flaking and early cracking.</p>
            <h2 className="text-2xl font-bold mb-3">Ordering With Realistic Wastage</h2>
            <p>Five percent wastage covers normal spillage and minor over-excavation on a controlled pour. Increase it to eight or ten percent when the subgrade is uneven, access is poor, or the concrete is being mixed and barrowed by hand. The asymmetry matters: surplus material is a small cost, whereas running out mid-pour forces a cold joint, and a cold joint is a permanent plane of weakness through the slab that no amount of later work will repair.</p>
            <h2 className="text-2xl font-bold mb-3">What This Estimate Excludes</h2>
            <p>The figures here cover the four concrete constituents only. Reinforcing steel, mesh, formwork, chemical admixtures, curing compounds, plant hire and labour are all priced separately and vary far more by region than cement, sand and stone do. Treat the total shown as a materials baseline for the pour itself, then build the remaining trades on top of it.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cement-calculator" />
          <PopularCalculators exclude="/calculator/cement-calculator" />
        </div>
      </div>
    </>
  );
};

export default CementCalculator;
