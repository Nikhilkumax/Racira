"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Shapes, Truck, DollarSign } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

type Shape = "rectangle" | "circle" | "triangle";
type MaterialKey = "pea" | "crushed57" | "crusherRun" | "riverRock" | "decomposedGranite" | "sand";

interface MaterialSpec {
  key: MaterialKey;
  label: string;
  densityLbPerFt3: number;
  defaultCompaction: number;
  pricePerTon: number;
}

interface GravelInputs {
  shape: Shape;
  length: number;
  width: number;
  diameter: number;
  depthInches: number;
  material: MaterialKey;
  wastePercent: number;
  compactionPercent: number;
  pricePerTon: number;
  deliveryFee: number;
  proMode: boolean;
  truckCapacityTons: number;
  bagSizeFt3: number;
}

interface ChartSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface GravelResult {
  areaSqFt: number;
  netVolumeFt3: number;
  orderVolumeFt3: number;
  orderVolumeYd3: number;
  tons: number;
  pounds: number;
  bags: number;
  materialCost: number;
  totalCost: number;
  costPerYd3: number;
  truckLoads: number;
  coverageSqFtPerTon: number;
  chartData: ChartSlice[];
  rows: TableRow[];
}

// Loose (uncompacted) bulk densities in lb/ft3. 27 ft3 = 1 yd3, so 100 lb/ft3
// works out to the familiar 1.35 tons per cubic yard quoted by suppliers.
const MATERIALS: MaterialSpec[] = [
  { key: "pea", label: "Pea Gravel", densityLbPerFt3: 105, defaultCompaction: 5, pricePerTon: 55 },
  { key: "crushed57", label: 'Crushed Stone #57 (3/4")', densityLbPerFt3: 100, defaultCompaction: 8, pricePerTon: 45 },
  { key: "crusherRun", label: "Crusher Run / Base Gravel", densityLbPerFt3: 110, defaultCompaction: 22, pricePerTon: 38 },
  { key: "riverRock", label: "River Rock", densityLbPerFt3: 100, defaultCompaction: 4, pricePerTon: 85 },
  { key: "decomposedGranite", label: "Decomposed Granite", densityLbPerFt3: 105, defaultCompaction: 18, pricePerTon: 60 },
  { key: "sand", label: "Bedding Sand", densityLbPerFt3: 100, defaultCompaction: 12, pricePerTon: 32 },
];

const CUBIC_FEET_PER_YARD = 27;
const POUNDS_PER_TON = 2000;

const DEFAULTS: GravelInputs = {
  shape: "rectangle",
  length: 30,
  width: 12,
  diameter: 20,
  depthInches: 4,
  material: "crushed57",
  wastePercent: 10,
  compactionPercent: 8,
  pricePerTon: 45,
  deliveryFee: 120,
  proMode: false,
  truckCapacityTons: 14,
  bagSizeFt3: 0.5,
};

function materialFor(key: MaterialKey): MaterialSpec {
  return MATERIALS.find((m) => m.key === key) ?? MATERIALS[1];
}

export function calculateGravel(i: GravelInputs): GravelResult {
  const spec = materialFor(i.material);

  const length = Math.max(0, i.length);
  const width = Math.max(0, i.width);
  const radius = Math.max(0, i.diameter) / 2;

  let areaSqFt: number;
  if (i.shape === "circle") {
    areaSqFt = Math.PI * radius * radius;
  } else if (i.shape === "triangle") {
    areaSqFt = (length * width) / 2;
  } else {
    areaSqFt = length * width;
  }

  const depthFt = Math.max(0, i.depthInches) / 12;
  const netVolumeFt3 = areaSqFt * depthFt;

  // Compacted material settles, so you must order more loose volume than the
  // finished dimensions suggest. Waste covers spillage, edge loss, and re-grading.
  const compactionFactor = 1 + Math.max(0, i.compactionPercent) / 100;
  const wasteFactor = 1 + Math.max(0, i.wastePercent) / 100;

  const compactedVolumeFt3 = netVolumeFt3 * compactionFactor;
  const orderVolumeFt3 = compactedVolumeFt3 * wasteFactor;
  const orderVolumeYd3 = orderVolumeFt3 / CUBIC_FEET_PER_YARD;

  const pounds = orderVolumeFt3 * spec.densityLbPerFt3;
  const tons = pounds / POUNDS_PER_TON;

  const bagSize = Math.max(0.1, i.bagSizeFt3);
  const bags = Math.ceil(orderVolumeFt3 / bagSize);

  const price = Math.max(0, i.pricePerTon);
  const materialCost = tons * price;
  const delivery = Math.max(0, i.deliveryFee);
  const totalCost = materialCost + delivery;
  const costPerYd3 = orderVolumeYd3 > 0 ? totalCost / orderVolumeYd3 : 0;

  const capacity = Math.max(1, i.truckCapacityTons);
  const truckLoads = Math.ceil(tons / capacity);

  // How much surface one ton covers at the chosen depth.
  const coverageSqFtPerTon =
    depthFt > 0 ? POUNDS_PER_TON / spec.densityLbPerFt3 / depthFt : 0;

  // Cost attribution: base material, the extra bought for compaction, the extra
  // bought as waste allowance, and delivery.
  const baseTons = (netVolumeFt3 * spec.densityLbPerFt3) / POUNDS_PER_TON;
  const compactionTons = ((compactedVolumeFt3 - netVolumeFt3) * spec.densityLbPerFt3) / POUNDS_PER_TON;
  const wasteTons = ((orderVolumeFt3 - compactedVolumeFt3) * spec.densityLbPerFt3) / POUNDS_PER_TON;

  const slices = [
    { name: "Base Material", value: baseTons * price, color: "#2563EB" },
    { name: "Compaction Allowance", value: compactionTons * price, color: "#8B5CF6" },
    { name: "Waste Allowance", value: wasteTons * price, color: "#F59E0B" },
    { name: "Delivery", value: delivery, color: "#10B981" },
  ];
  const sliceTotal = slices.reduce((sum, s) => sum + s.value, 0);
  const chartData: ChartSlice[] = slices.map((s) => ({
    ...s,
    percent: sliceTotal > 0 ? (s.value / sliceTotal) * 100 : 0,
  }));

  const num = (v: number, d = 2) =>
    v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const rows: TableRow[] = [
    { label: "Coverage Area", value: `${num(areaSqFt, 1)} sq ft` },
    { label: "Depth", value: `${num(i.depthInches, 1)} in (${num(depthFt, 3)} ft)` },
    { label: "Finished Volume", value: `${num(netVolumeFt3, 1)} cu ft` },
    { label: `Compaction Allowance (${num(i.compactionPercent, 0)}%)`, value: `+${num(compactedVolumeFt3 - netVolumeFt3, 1)} cu ft` },
    { label: `Waste Allowance (${num(i.wastePercent, 0)}%)`, value: `+${num(orderVolumeFt3 - compactedVolumeFt3, 1)} cu ft` },
    { label: "Volume to Order", value: `${num(orderVolumeYd3, 2)} cu yd`, key: true },
    { label: "Weight to Order", value: `${num(tons, 2)} tons (${Math.round(pounds).toLocaleString("en-US")} lb)` },
    { label: "Material Density", value: `${spec.densityLbPerFt3} lb/cu ft` },
    { label: "Bag Equivalent", value: `${bags.toLocaleString("en-US")} bags` },
    { label: "Material Cost", value: money(materialCost) },
    { label: "Delivery", value: money(delivery) },
    { label: "Total Project Cost", value: money(totalCost) },
  ];

  return {
    areaSqFt,
    netVolumeFt3,
    orderVolumeFt3,
    orderVolumeYd3,
    tons,
    pounds,
    bags,
    materialCost,
    totalCost,
    costPerYd3,
    truckLoads,
    coverageSqFtPerTon,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function GravelVolumeCalculator() {
  const [inputs, setInputs] = useState<GravelInputs>(DEFAULTS);
  const [result, setResult] = useState<GravelResult>(calculateGravel(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateGravel(inputs));
  }, []);

  const calculate = () => setResult(calculateGravel(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateGravel(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof GravelInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const changeMaterial = (key: MaterialKey) => {
    const spec = materialFor(key);
    setInputs((prev) => ({
      ...prev,
      material: key,
      compactionPercent: spec.defaultCompaction,
      pricePerTon: spec.pricePerTon,
    }));
  };

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const faqs = [
    {
      question: "How do I calculate how much gravel I need?",
      answer:
        "Multiply the area in square feet by the depth in feet to get cubic feet, then divide by 27 to convert to cubic yards. A 30 by 12 foot driveway at 4 inches deep is 360 square feet times 0.333 feet, which is about 120 cubic feet or 4.44 cubic yards before any allowance for compaction and waste. Suppliers usually quote by the ton, so multiply cubic feet by the material density to get pounds and divide by 2,000.",
    },
    {
      question: "How many tons of gravel are in a cubic yard?",
      answer:
        "Between 1.3 and 1.5 tons for most aggregates. Crushed stone at 100 pounds per cubic foot works out to 2,700 pounds per cubic yard, or 1.35 tons. Denser base gravel at 110 pounds per cubic foot gives about 1.49 tons per cubic yard. This is why ordering by weight and ordering by volume can produce different numbers for the same job, and why you should confirm which unit your supplier is quoting.",
    },
    {
      question: "Why does the calculator add extra for compaction?",
      answer:
        "Because loose gravel settles when compacted. Crusher run and other base materials with a range of particle sizes can lose 20 to 25% of their loose volume once rolled or plate-compacted, since the fines migrate into the voids between the larger stones. If you order only the finished volume you will end up short. Uniformly sized decorative stone like river rock barely compacts at all, which is why the default allowance changes with material.",
    },
    {
      question: "How deep should a gravel driveway be?",
      answer:
        "A residential driveway typically uses 4 to 6 inches of compacted base plus 2 to 3 inches of surface stone. Walkways and garden paths work at 2 to 3 inches. Pea gravel patios need 2 to 3 inches over a compacted base. Anything carrying regular truck traffic should be 8 to 12 inches total in layers, each compacted separately. Building the full depth in one lift does not compact properly regardless of how much you roll it.",
    },
    {
      question: "How much area does one ton of gravel cover?",
      answer:
        "It depends entirely on depth. One ton of stone at 100 pounds per cubic foot is 20 cubic feet, which covers roughly 240 square feet at 1 inch deep, 120 square feet at 2 inches, 80 square feet at 3 inches, and 60 square feet at 4 inches. The calculator reports the coverage figure for your exact depth and material in Professional Mode.",
    },
    {
      question: "Should I buy gravel in bags or in bulk?",
      answer:
        "Bulk is dramatically cheaper past about one cubic yard. A 0.5 cubic foot bag costs several dollars, which works out to well over $150 per cubic yard, while bulk delivered stone runs $40 to $90 per ton. Bags make sense for small repairs, tight access where a truck cannot reach, or when you need to carry material through a house or gate. The calculator shows the bag equivalent so you can compare directly.",
    },
    {
      question: "What waste allowance should I use?",
      answer:
        "Ten percent is a reasonable default for a straightforward rectangular area. Increase it to 15% for irregular shapes, sloped ground, or sites where material will spread beyond the intended edge without borders. Reduce it toward 5% only if you have firm edging, level ground, and are confident in your measurements. Running short mid-project usually means paying a second delivery fee, which costs far more than the extra material.",
    },
    {
      question: "Do I need landscape fabric under gravel?",
      answer:
        "For decorative gravel over soil, yes — a woven geotextile stops the stone from sinking into the subgrade and slows weed growth substantially. For a structural driveway base the answer is more nuanced: a separation geotextile helps considerably over soft or clay subgrades by preventing the aggregate from punching into the soil, but it is often omitted over firm, well-drained ground. Fabric is not included in this calculator's volume or cost figures.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "Gravel Volume Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gravel Volume Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              {inputs.shape === "circle" ? (
                <div className="col-span-2">
                  <label htmlFor="diameter" className={lbl}>Diameter (ft)</label>
                  <input id="diameter" type="number" min="0" step="1" className={inp} value={inputs.diameter}
                    onChange={(e) => setNum("diameter", e.target.value)} />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="length" className={lbl}>{inputs.shape === "triangle" ? "Base (ft)" : "Length (ft)"}</label>
                    <input id="length" type="number" min="0" step="1" className={inp} value={inputs.length}
                      onChange={(e) => setNum("length", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="width" className={lbl}>{inputs.shape === "triangle" ? "Height (ft)" : "Width (ft)"}</label>
                    <input id="width" type="number" min="0" step="1" className={inp} value={inputs.width}
                      onChange={(e) => setNum("width", e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="depthInches" className={lbl}>Depth (in)</label>
                <input id="depthInches" type="number" min="0" step="0.5" className={inp} value={inputs.depthInches}
                  onChange={(e) => setNum("depthInches", e.target.value)} />
              </div>
              <div>
                <label htmlFor="material" className={lbl}>Material</label>
                <select id="material" className={inp} value={inputs.material}
                  onChange={(e) => changeMaterial(e.target.value as MaterialKey)}>
                  {MATERIALS.map((m) => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Shapes className="h-3.5 w-3.5" /> Area Shape &amp; Allowances
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="shape" className={lbl}>Shape</label>
                        <select id="shape" className={inp} value={inputs.shape}
                          onChange={(e) => setInputs((p) => ({ ...p, shape: e.target.value as Shape }))}>
                          <option value="rectangle">Rectangle</option>
                          <option value="circle">Circle</option>
                          <option value="triangle">Triangle</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="wastePercent" className={lbl}>Waste (%)</label>
                        <input id="wastePercent" type="number" min="0" step="1" className={inp} value={inputs.wastePercent}
                          onChange={(e) => setNum("wastePercent", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="compactionPercent" className={lbl}>Compaction Allowance (%)</label>
                        <input id="compactionPercent" type="number" min="0" step="1" className={inp}
                          value={inputs.compactionPercent} onChange={(e) => setNum("compactionPercent", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <DollarSign className="h-3.5 w-3.5" /> Pricing
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="pricePerTon" className={lbl}>Price / Ton</label>
                        <input id="pricePerTon" type="number" min="0" step="1" className={inp} value={inputs.pricePerTon}
                          onChange={(e) => setNum("pricePerTon", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="deliveryFee" className={lbl}>Delivery Fee</label>
                        <input id="deliveryFee" type="number" min="0" step="10" className={inp} value={inputs.deliveryFee}
                          onChange={(e) => setNum("deliveryFee", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Truck className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock delivery logistics and coverage rates
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="truckCapacityTons" className={lbl}>Truck Capacity (tons)</label>
                          <input id="truckCapacityTons" type="number" min="1" step="1" className={inp}
                            value={inputs.truckCapacityTons} onChange={(e) => setNum("truckCapacityTons", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="bagSizeFt3" className={lbl}>Bag Size (cu ft)</label>
                          <input id="bagSizeFt3" type="number" min="0.1" step="0.1" className={inp}
                            value={inputs.bagSizeFt3} onChange={(e) => setNum("bagSizeFt3", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Gravel to Order</div>
              <div className="text-4xl font-bold text-primary my-1">{result.orderVolumeYd3.toFixed(2)} yd³</div>
              <div className="text-sm text-muted-foreground">
                {result.tons.toFixed(2)} tons of {materialFor(inputs.material).label} covering {Math.round(result.areaSqFt).toLocaleString("en-US")} sq ft
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Tons</div>
                <div className="text-lg font-bold text-emerald-600">{result.tons.toFixed(2)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cubic Feet</div>
                <div className="text-lg font-bold text-amber-600">{Math.round(result.orderVolumeFt3).toLocaleString("en-US")}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Cost</div>
                <div className="text-lg font-bold text-red-600">{money(result.totalCost)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 pr-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Total Delivered Cost</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{money(result.totalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Where the Money Goes</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95} paddingAngle={2}>
                      {result.chartData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(value: number) => money(value)}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {result.chartData.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
                      {slice.name} — {slice.percent.toFixed(1)}%
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Delivery Logistics &amp; Coverage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Truck Loads Required</div>
                    <div className="text-base font-bold text-foreground">{result.truckLoads}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Coverage per Ton</div>
                    <div className="text-base font-bold text-foreground">{Math.round(result.coverageSqFtPerTon).toLocaleString("en-US")} sq ft</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per Cubic Yard</div>
                    <div className="text-base font-bold text-foreground">{money(result.costPerYd3)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bagged Equivalent</div>
                    <div className="text-base font-bold text-amber-600">{result.bags.toLocaleString("en-US")} bags</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">From Square Feet to Tons on the Truck</h2>
            <p className="mb-4">
              Every gravel order starts with the same arithmetic: area times depth gives volume, and volume divided by 27
              converts cubic feet to the cubic yards suppliers work in. The complication is that most yards sell by weight
              rather than volume, so the number you actually need to place an order depends on the density of the specific
              material. Crushed stone runs about 100 pounds per cubic foot, base gravel closer to 110, and that difference
              alone changes a five-yard order by nearly a ton.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Compaction Changes What You Order</h2>
            <p className="mb-4">
              The most common way to under-order is to calculate the finished dimensions and stop there. Well-graded
              materials like crusher run contain a range of particle sizes, and when compacted the fines migrate into the
              voids between larger stones — the same mass occupies noticeably less space. Losing 20 to 25% of loose volume
              is normal for base gravel. Uniformly sized decorative stone such as river rock has nowhere for its particles
              to go and barely settles at all, which is why the compaction allowance here defaults differently for each
              material rather than applying one blanket figure.
            </p>

            <h2 className="text-2xl font-bold mb-3">Choosing Depth for the Job</h2>
            <p className="mb-4">
              Depth is where most of the cost lives, since it scales the entire order linearly. Garden paths and decorative
              beds work at 2 to 3 inches. A residential driveway wants 4 to 6 inches of compacted base plus a 2 to 3 inch
              surface course. Anything carrying loaded trucks needs 8 to 12 inches, and critically, it needs to go down in
              separate lifts each compacted on its own — a single thick pour will not densify properly no matter how many
              passes the roller makes. One ton of typical stone covers roughly 240 square feet at 1 inch, 120 at 2 inches,
              and 60 at 4 inches.
            </p>

            <h2 className="text-2xl font-bold mb-3">Bulk Versus Bags, and the Cost of Running Short</h2>
            <p>
              Past about one cubic yard the economics decisively favor bulk delivery. Half-cubic-foot bags work out to well
              over $150 per cubic yard once you account for the packaging premium, against $40 to $90 per ton delivered in
              bulk. Bags earn their place only for small repairs or where a truck genuinely cannot reach. That said, the
              real financial risk on a gravel job is not the material rate — it is a second delivery fee. A 10% waste
              allowance on a straightforward rectangle, or 15% on irregular or sloping ground, costs far less than paying
              to send a truck back out for the last half yard.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gravel-volume-calculator" />
          <PopularCalculators exclude="/calculator/gravel-volume-calculator" />
        </div>
      </div>
    </>
  );
}
