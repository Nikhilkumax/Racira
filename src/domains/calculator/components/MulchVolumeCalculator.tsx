"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Shapes, DollarSign, Leaf } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

type Shape = "rectangle" | "circle" | "triangle";
type MulchKey =
  | "shreddedHardwood"
  | "pineBark"
  | "cedar"
  | "cypress"
  | "rubber"
  | "straw"
  | "compost";

interface MulchSpec {
  key: MulchKey;
  label: string;
  densityLbPerFt3: number;
  settlementFactor: number;
  pricePerYd3: number;
  lifespanYears: number;
}

interface MulchInputs {
  shape: Shape;
  length: number;
  width: number;
  diameter: number;
  depthInches: number;
  material: MulchKey;
  wastePercent: number;
  pricePerYd3: number;
  deliveryFee: number;
  proMode: boolean;
  bagSizeFt3: number;
  bagPrice: number;
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

interface MulchResult {
  areaSqFt: number;
  netVolumeFt3: number;
  orderVolumeFt3: number;
  orderVolumeYd3: number;
  pounds: number;
  tons: number;
  bags: number;
  bagTotalCost: number;
  bulkCost: number;
  deliveryFee: number;
  totalCost: number;
  costPerYd3: number;
  settledDepthIn: number;
  topUpYd3: number;
  coverageSqFtPerYd3: number;
  cheaperOption: string;
  chartData: ChartSlice[];
  rows: TableRow[];
}

// Loose bulk densities in lb/ft3. Settlement factor is the fraction of the
// installed depth still present after one season of compaction and decay.
const MATERIALS: MulchSpec[] = [
  { key: "shreddedHardwood", label: "Shredded Hardwood Bark", densityLbPerFt3: 22, settlementFactor: 0.85, pricePerYd3: 35, lifespanYears: 1 },
  { key: "pineBark", label: "Pine Bark Nuggets", densityLbPerFt3: 18, settlementFactor: 0.9, pricePerYd3: 40, lifespanYears: 2 },
  { key: "cedar", label: "Cedar Mulch", densityLbPerFt3: 20, settlementFactor: 0.88, pricePerYd3: 45, lifespanYears: 2 },
  { key: "cypress", label: "Cypress Mulch", densityLbPerFt3: 19, settlementFactor: 0.87, pricePerYd3: 42, lifespanYears: 2 },
  { key: "rubber", label: "Rubber Mulch", densityLbPerFt3: 65, settlementFactor: 0.98, pricePerYd3: 80, lifespanYears: 10 },
  { key: "straw", label: "Straw Mulch", densityLbPerFt3: 10, settlementFactor: 0.75, pricePerYd3: 25, lifespanYears: 1 },
  { key: "compost", label: "Compost Mulch", densityLbPerFt3: 35, settlementFactor: 0.7, pricePerYd3: 30, lifespanYears: 1 },
];

function materialFor(key: MulchKey): MulchSpec {
  return MATERIALS.find((m) => m.key === key) ?? MATERIALS[0];
}

const DEFAULTS: MulchInputs = {
  shape: "rectangle",
  length: 20,
  width: 10,
  diameter: 12,
  depthInches: 3,
  material: "shreddedHardwood",
  wastePercent: 10,
  pricePerYd3: 35,
  deliveryFee: 65,
  proMode: false,
  bagSizeFt3: 2,
  bagPrice: 4.5,
};

function calculateMulch(inputs: MulchInputs): MulchResult {
  const spec = materialFor(inputs.material);

  const areaSqFt =
    inputs.shape === "circle"
      ? Math.PI * Math.pow(inputs.diameter / 2, 2)
      : inputs.shape === "triangle"
        ? (inputs.length * inputs.width) / 2
        : inputs.length * inputs.width;

  const depthFt = inputs.depthInches / 12;
  const netVolumeFt3 = areaSqFt * depthFt;
  const orderVolumeFt3 = netVolumeFt3 * (1 + inputs.wastePercent / 100);
  const orderVolumeYd3 = orderVolumeFt3 / 27;

  const pounds = orderVolumeFt3 * spec.densityLbPerFt3;
  const tons = pounds / 2000;

  const bagSize = inputs.bagSizeFt3 > 0 ? inputs.bagSizeFt3 : 2;
  const bags = Math.ceil(orderVolumeFt3 / bagSize);
  const bagTotalCost = bags * inputs.bagPrice;

  const bulkCost = orderVolumeYd3 * inputs.pricePerYd3;
  const totalCost = bulkCost + inputs.deliveryFee;
  const costPerYd3 = orderVolumeYd3 > 0 ? totalCost / orderVolumeYd3 : 0;

  const settledDepthIn = inputs.depthInches * spec.settlementFactor;
  const topUpDepthIn = inputs.depthInches - settledDepthIn;
  const topUpYd3 = (areaSqFt * (topUpDepthIn / 12)) / 27;

  const coverageSqFtPerYd3 = depthFt > 0 ? 27 / depthFt : 0;
  const cheaperOption = bagTotalCost <= totalCost ? "Bagged" : "Bulk delivered";

  const chartData: ChartSlice[] = [
    { name: "Material", value: bulkCost, percent: 0, color: "#16a34a" },
    { name: "Delivery", value: inputs.deliveryFee, percent: 0, color: "#f59e0b" },
  ].filter((slice) => slice.value > 0);
  const chartTotal = chartData.reduce((sum, slice) => sum + slice.value, 0);
  chartData.forEach((slice) => {
    slice.percent = chartTotal > 0 ? (slice.value / chartTotal) * 100 : 0;
  });

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
  const num = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const rows: TableRow[] = [
    { label: "Bed Area", value: `${num(areaSqFt, 0)} sq ft` },
    { label: "Installed Depth", value: `${num(inputs.depthInches)} in` },
    { label: "Net Volume", value: `${num(netVolumeFt3)} cu ft` },
    { label: "Waste Allowance", value: `${num(inputs.wastePercent, 0)}%` },
    { label: "Volume to Order", value: `${num(orderVolumeYd3, 2)} cu yd`, key: true },
    { label: "Volume in Cubic Feet", value: `${num(orderVolumeFt3, 0)} cu ft` },
    { label: "Delivered Weight", value: `${num(pounds, 0)} lb (${num(tons, 2)} tons)` },
    { label: `Bags Needed (${num(bagSize, 1)} cu ft)`, value: `${bags.toLocaleString("en-US")} bags` },
    { label: "Bagged Cost", value: money(bagTotalCost) },
    { label: "Bulk Material Cost", value: money(bulkCost) },
    { label: "Delivery Fee", value: money(inputs.deliveryFee) },
    { label: "Settled Depth (Year 1)", value: `${num(settledDepthIn)} in` },
  ];

  return {
    areaSqFt,
    netVolumeFt3,
    orderVolumeFt3,
    orderVolumeYd3,
    pounds,
    tons,
    bags,
    bagTotalCost,
    bulkCost,
    deliveryFee: inputs.deliveryFee,
    totalCost,
    costPerYd3,
    settledDepthIn,
    topUpYd3,
    coverageSqFtPerYd3,
    cheaperOption,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function MulchVolumeCalculator() {
  const [inputs, setInputs] = useState<MulchInputs>(DEFAULTS);
  const [result, setResult] = useState<MulchResult>(calculateMulch(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateMulch(inputs));
  }, []);

  const calculate = () => setResult(calculateMulch(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateMulch(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof MulchInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const changeMaterial = (key: MulchKey) => {
    const spec = materialFor(key);
    setInputs((prev) => ({ ...prev, material: key, pricePerYd3: spec.pricePerYd3 }));
  };

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
  const spec = materialFor(inputs.material);

  const faqs = [
    {
      question: "How much mulch do I need for my garden bed?",
      answer:
        "Multiply the bed area in square feet by the depth in feet, then divide by 27 to get cubic yards. A 20 by 10 foot bed at 3 inches deep works out to 50 cubic feet, or about 1.85 cubic yards before any waste allowance. The calculator handles rectangular, circular, and triangular beds and adds your waste percentage automatically, since ordering the exact theoretical volume nearly always leaves you short.",
    },
    {
      question: "How deep should mulch be?",
      answer:
        "Two to three inches suits most established beds. That is enough to block light from reaching weed seeds and to slow evaporation, without holding so much moisture against stems that rot sets in. Vegetable beds and annual plantings do well at 2 inches, perennial borders and tree rings at 3 to 4 inches, especially in hot or dry climates. Going past 4 inches on organic mulch starts to restrict oxygen exchange at the root zone.",
    },
    {
      question: "How many bags of mulch equal a cubic yard?",
      answer:
        "A cubic yard is 27 cubic feet, so it takes 13.5 bags of the common 2 cubic foot size or 9 bags of the 3 cubic foot size. Bagged mulch typically runs $4 to $6 for 2 cubic feet, which puts a cubic yard somewhere between $54 and $81 before tax. Bulk delivered mulch is usually $25 to $50 per yard plus a flat delivery fee, so the crossover point is generally between two and three yards.",
    },
    {
      question: "Why does the calculator show a settled depth?",
      answer:
        "Organic mulch compacts and decomposes. Shredded hardwood typically holds about 85% of its installed depth after one season, pine bark nuggets closer to 90% because the larger particles resist packing, and compost as little as 70% because soil organisms actively consume it. The settled depth tells you what you will actually have next spring, and Professional Mode converts the difference into the top-up volume you will need.",
    },
    {
      question: "Is bulk or bagged mulch cheaper?",
      answer:
        "Bulk wins on price past roughly two cubic yards, even with a delivery fee. Bagged mulch wins when the quantity is small, when a truck cannot reach the site, or when you need to carry material through a gate or house. Bags are also easier to store and spread over multiple weekends. This calculator prices both paths side by side using your actual bag size and local rates rather than assuming national averages.",
    },
    {
      question: "How should mulch be applied around trees?",
      answer:
        "Spread 2 to 4 inches out toward the drip line and pull it back 3 inches from the trunk. Piling mulch against bark, the so-called mulch volcano, traps moisture against the trunk, invites decay fungi and rodents, and encourages girdling roots to form in the mulch layer instead of the soil. A flat ring is both healthier and cheaper than a mound.",
    },
    {
      question: "Should I choose rubber or organic mulch?",
      answer:
        "Rubber mulch does not decompose, so it lasts roughly a decade and suits playgrounds and permanent pathways where impact absorption matters. It contributes nothing to the soil, is about three times denser than wood at 65 pounds per cubic foot, and costs considerably more upfront. Organic mulches break down into the soil, which is exactly what you want in a planting bed but does mean budgeting for replacement.",
    },
    {
      question: "What waste allowance should I use?",
      answer:
        "Ten percent covers a straightforward rectangular bed on level ground. Push it to 15% for curved borders, sloped sites where material migrates downhill, or beds crowded with shrubs and hardscape that make even spreading harder. Drop toward 5% only with firm edging and confident measurements. Running short usually means a second trip or a second delivery fee, both of which cost more than the extra material would have.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Mulch Volume Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mulch Volume Calculator</h1>

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
                <label htmlFor="material" className={lbl}>Mulch Type</label>
                <select id="material" className={inp} value={inputs.material}
                  onChange={(e) => changeMaterial(e.target.value as MulchKey)}>
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
                      <Shapes className="h-3.5 w-3.5" /> Bed Shape &amp; Allowances
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
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <DollarSign className="h-3.5 w-3.5" /> Pricing
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="pricePerYd3" className={lbl}>Price / Cubic Yard</label>
                        <input id="pricePerYd3" type="number" min="0" step="1" className={inp} value={inputs.pricePerYd3}
                          onChange={(e) => setNum("pricePerYd3", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="deliveryFee" className={lbl}>Delivery Fee</label>
                        <input id="deliveryFee" type="number" min="0" step="5" className={inp} value={inputs.deliveryFee}
                          onChange={(e) => setNum("deliveryFee", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Leaf className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock bag-vs-bulk comparison and settlement top-up
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="bagSizeFt3" className={lbl}>Bag Size (cu ft)</label>
                          <input id="bagSizeFt3" type="number" min="0.1" step="0.5" className={inp}
                            value={inputs.bagSizeFt3} onChange={(e) => setNum("bagSizeFt3", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="bagPrice" className={lbl}>Price / Bag</label>
                          <input id="bagPrice" type="number" min="0" step="0.25" className={inp}
                            value={inputs.bagPrice} onChange={(e) => setNum("bagPrice", e.target.value)} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Mulch to Order</div>
              <div className="text-4xl font-bold text-primary">{result.orderVolumeYd3.toFixed(2)} yd³</div>
              <div className="text-sm text-muted-foreground">
                {Math.round(result.orderVolumeFt3).toLocaleString("en-US")} cu ft of {spec.label} covering {Math.round(result.areaSqFt).toLocaleString("en-US")} sq ft
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cubic Yards</div>
                <div className="text-lg font-bold text-emerald-600">{result.orderVolumeYd3.toFixed(2)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Bags Needed</div>
                <div className="text-lg font-bold text-amber-600">{result.bags.toLocaleString("en-US")}</div>
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
                <h3 className="text-sm font-bold text-foreground mb-3">Bag vs Bulk &amp; Settlement Planning</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cheaper Option</div>
                    <div className="text-base font-bold text-emerald-600">{result.cheaperOption}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bagged Total</div>
                    <div className="text-base font-bold text-foreground">{money(result.bagTotalCost)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per Cubic Yard</div>
                    <div className="text-base font-bold text-foreground">{money(result.costPerYd3)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Coverage per Yard</div>
                    <div className="text-base font-bold text-foreground">{Math.round(result.coverageSqFtPerYd3).toLocaleString("en-US")} sq ft</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Top-Up Next Season</div>
                    <div className="text-base font-bold text-amber-600">{result.topUpYd3.toFixed(2)} yd³</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Expected Lifespan</div>
                    <div className="text-base font-bold text-foreground">{spec.lifespanYears} {spec.lifespanYears === 1 ? "year" : "years"}</div>
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
            <h2 className="text-2xl font-bold mb-3">From Bed Dimensions to Cubic Yards</h2>
            <p className="mb-4">
              Mulch is sold by volume, so every order begins with the same arithmetic: area times depth, converted into
              cubic yards by dividing by 27. The step most people skip is that depth belongs in feet, not inches, and a
              three-inch layer is only a quarter of a foot. A twenty by ten foot bed at three inches is fifty cubic feet,
              which sounds substantial until it converts to just 1.85 cubic yards. Suppliers quote in yards, garden centers
              sell in two and three cubic foot bags, and reconciling those two units is where most ordering mistakes start.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Depth Matters More Than Coverage Claims</h2>
            <p className="mb-4">
              A cubic yard covers 324 square feet at one inch, 162 at two inches, and 108 at three. Those numbers are fixed
              geometry, yet bagged products often advertise coverage without stating the depth assumed, which makes bags
              look far more productive than they are. Two to three inches is the working range for established beds: enough
              to keep light off weed seeds and slow evaporation, not so much that oxygen exchange at the root zone suffers.
              Vegetable beds do well at two inches, tree rings and perennial borders at three to four.
            </p>

            <h2 className="text-2xl font-bold mb-3">Settlement Is Not the Same as Waste</h2>
            <p className="mb-4">
              Waste covers what you lose during installation — spillage, uneven spreading, material that drifts past the
              bed edge. Settlement is what happens afterward. Organic mulch compacts under rain and foot traffic while soil
              organisms consume it from below, and the two effects together take shredded hardwood down to roughly 85% of
              its installed depth within a season. Compost fares worse at around 70% because decomposition is the entire
              point of the material. Rubber mulch barely moves. This calculator applies waste to the order and reports
              settled depth separately, so the top-up volume next spring is a planned figure rather than a surprise.
            </p>

            <h2 className="text-2xl font-bold mb-3">Deciding Between Bags and Bulk</h2>
            <p className="mb-4">
              Bagged mulch at five dollars for two cubic feet works out to about $67 per cubic yard, against $25 to $50 for
              bulk plus a flat delivery fee that typically runs $50 to $80. The crossover generally lands between two and
              three yards, but the honest comparison depends on your own delivery quote and bag price, which is why both
              appear as editable inputs. Bags still win when a truck cannot reach the site, when material must be carried
              through a gate, or when the job will be spread across several weekends and a pile in the driveway is not
              practical.
            </p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mulch-volume-calculator" />
          <PopularCalculators exclude="/calculator/mulch-volume-calculator" />
        </div>
      </div>
    </>
  );
}

