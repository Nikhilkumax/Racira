"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Printer, Grid3x3, DoorOpen, HardHat } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

type BrickKey = "modular" | "standard" | "queen" | "king" | "roman" | "norman" | "utility";

interface BrickSpec {
  key: BrickKey;
  label: string;
  faceLength: number;
  faceHeight: number;
}

interface BrickInputs {
  wallLength: number;
  wallHeight: number;
  brickType: BrickKey;
  jointThickness: number;
  openingArea: number;
  wastePercent: number;
  wythes: number;
  pricePerBrick: number;
  proMode: boolean;
  bricksPerPallet: number;
  masonBricksPerDay: number;
  laborRatePerDay: number;
  mortarBagPrice: number;
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

interface BrickResult {
  grossAreaSqFt: number;
  netAreaSqFt: number;
  bricksPerSqFt: number;
  baseBricks: number;
  wasteBricks: number;
  totalBricks: number;
  courses: number;
  bricksPerCourse: number;
  mortarBags: number;
  sandYd3: number;
  pallets: number;
  laborDays: number;
  brickCost: number;
  mortarCost: number;
  laborCost: number;
  totalCost: number;
  chartData: ChartSlice[];
  rows: TableRow[];
}

// Actual (not nominal) face dimensions in inches. Nominal sizes already include
// the mortar joint; these are the fired unit dimensions, so the joint is added.
const BRICKS: BrickSpec[] = [
  { key: "modular", label: 'Modular (7⅝ × 2¼")', faceLength: 7.625, faceHeight: 2.25 },
  { key: "standard", label: 'Standard (8 × 2¼")', faceLength: 8, faceHeight: 2.25 },
  { key: "queen", label: 'Queen (7⅝ × 2¾")', faceLength: 7.625, faceHeight: 2.75 },
  { key: "king", label: 'King (9⅝ × 2⅝")', faceLength: 9.625, faceHeight: 2.625 },
  { key: "roman", label: 'Roman (11⅝ × 1⅝")', faceLength: 11.625, faceHeight: 1.625 },
  { key: "norman", label: 'Norman (11⅝ × 2¼")', faceLength: 11.625, faceHeight: 2.25 },
  { key: "utility", label: 'Utility (11⅝ × 3⅝")', faceLength: 11.625, faceHeight: 3.625 },
];

const SQ_INCHES_PER_SQ_FOOT = 144;
// Type N mortar: roughly 7 bags per 1,000 modular brick at a 3/8" joint,
// with about 1 cubic yard of sand per 7 bags.
const MORTAR_BAGS_PER_1000 = 7;
const SAND_YD3_PER_BAG = 1 / 7;

const DEFAULTS: BrickInputs = {
  wallLength: 24,
  wallHeight: 8,
  brickType: "modular",
  jointThickness: 0.375,
  openingArea: 32,
  wastePercent: 5,
  wythes: 1,
  pricePerBrick: 0.65,
  proMode: false,
  bricksPerPallet: 500,
  masonBricksPerDay: 550,
  laborRatePerDay: 480,
  mortarBagPrice: 9.5,
};

function brickFor(key: BrickKey): BrickSpec {
  return BRICKS.find((b) => b.key === key) ?? BRICKS[0];
}

export function calculateBricks(i: BrickInputs): BrickResult {
  const spec = brickFor(i.brickType);
  const joint = Math.max(0, i.jointThickness);

  // The repeating module is the brick plus one joint in each direction.
  const moduleLength = spec.faceLength + joint;
  const moduleHeight = spec.faceHeight + joint;
  const bricksPerSqFt = SQ_INCHES_PER_SQ_FOOT / (moduleLength * moduleHeight);

  const grossAreaSqFt = Math.max(0, i.wallLength) * Math.max(0, i.wallHeight);
  const netAreaSqFt = Math.max(0, grossAreaSqFt - Math.max(0, i.openingArea));

  const wythes = Math.max(1, Math.round(i.wythes));
  const baseBricks = Math.ceil(netAreaSqFt * bricksPerSqFt * wythes);
  const wasteBricks = Math.ceil(baseBricks * (Math.max(0, i.wastePercent) / 100));
  const totalBricks = baseBricks + wasteBricks;

  const courses = Math.floor((Math.max(0, i.wallHeight) * 12) / moduleHeight);
  const bricksPerCourse = Math.ceil((Math.max(0, i.wallLength) * 12) / moduleLength);

  const mortarBags = Math.ceil((totalBricks / 1000) * MORTAR_BAGS_PER_1000);
  const sandYd3 = mortarBags * SAND_YD3_PER_BAG;

  const perPallet = Math.max(1, i.bricksPerPallet);
  const pallets = Math.ceil(totalBricks / perPallet);

  const rate = Math.max(1, i.masonBricksPerDay);
  const laborDays = totalBricks / rate;

  const brickCost = totalBricks * Math.max(0, i.pricePerBrick);
  const mortarCost = mortarBags * Math.max(0, i.mortarBagPrice);
  const laborCost = laborDays * Math.max(0, i.laborRatePerDay);
  const totalCost = brickCost + mortarCost + laborCost;

  const slices = [
    { name: "Brick", value: brickCost, color: "#B45309" },
    { name: "Mortar & Sand", value: mortarCost, color: "#94A3B8" },
    { name: "Labor", value: laborCost, color: "#2563EB" },
  ];
  const sliceTotal = slices.reduce((sum, s) => sum + s.value, 0);
  const chartData: ChartSlice[] = slices.map((s) => ({
    ...s,
    percent: sliceTotal > 0 ? (s.value / sliceTotal) * 100 : 0,
  }));

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
  const int = (v: number) => Math.round(v).toLocaleString("en-US");

  const rows: TableRow[] = [
    { label: "Gross Wall Area", value: `${grossAreaSqFt.toFixed(1)} sq ft` },
    { label: "Openings Deducted", value: `${Math.max(0, i.openingArea).toFixed(1)} sq ft` },
    { label: "Net Wall Area", value: `${netAreaSqFt.toFixed(1)} sq ft` },
    { label: "Bricks per Square Foot", value: bricksPerSqFt.toFixed(2) },
    { label: `Bricks (${wythes} wythe${wythes > 1 ? "s" : ""})`, value: int(baseBricks) },
    { label: `Waste Allowance (${Math.max(0, i.wastePercent).toFixed(0)}%)`, value: `+${int(wasteBricks)}` },
    { label: "Total Bricks to Order", value: int(totalBricks), key: true },
    { label: "Courses (height)", value: `${courses} courses` },
    { label: "Bricks per Course", value: int(bricksPerCourse) },
    { label: "Mortar Bags (Type N, 80 lb)", value: int(mortarBags) },
    { label: "Masonry Sand", value: `${sandYd3.toFixed(2)} cu yd` },
    { label: "Estimated Total Cost", value: money(totalCost) },
  ];

  return {
    grossAreaSqFt,
    netAreaSqFt,
    bricksPerSqFt,
    baseBricks,
    wasteBricks,
    totalBricks,
    courses,
    bricksPerCourse,
    mortarBags,
    sandYd3,
    pallets,
    laborDays,
    brickCost,
    mortarCost,
    laborCost,
    totalCost,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function BrickCountCalculator() {
  const [inputs, setInputs] = useState<BrickInputs>(DEFAULTS);
  const [result, setResult] = useState<BrickResult>(calculateBricks(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateBricks(inputs));
  }, []);

  const calculate = () => setResult(calculateBricks(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateBricks(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof BrickInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const faqs = [
    {
      question: "How many bricks are in a square foot?",
      answer:
        "For modular brick with a 3/8 inch joint, 6.75 bricks per square foot is the standard figure. The math is 144 square inches divided by the module area, where the module is the brick face plus one joint in each direction: (7.625 + 0.375) × (2.25 + 0.375) = 8 × 2.625 = 21 square inches, giving 6.86. Suppliers round to 6.75 to account for the running bond offset. Larger units cover more area per brick — Norman gives about 4.5 per square foot and Utility about 3.",
    },
    {
      question: "Why does the mortar joint change the brick count?",
      answer:
        "Because you are not tiling brick faces edge to edge — you are laying a repeating module made of one brick plus one joint. A 3/8 inch joint is standard in the United States, but 1/2 inch joints are common in some regional practice and in restoration work. Moving from 3/8 to 1/2 inch on modular brick drops the count from roughly 6.86 to 6.55 per square foot, which on a 200 square foot wall is about 60 fewer bricks.",
    },
    {
      question: "Should I deduct window and door openings?",
      answer:
        "Deduct openings larger than about 10 square feet. Very small openings are usually left in the count because the cuts around them generate waste that roughly cancels the saving. For large openings, deduct the full area but keep your waste allowance at or above 5%, since the brick cut to fit around a jamb or sill often cannot be reused elsewhere.",
    },
    {
      question: "What is a wythe and when do I need two?",
      answer:
        "A wythe is a single continuous vertical layer of brick one unit thick. Modern residential construction is almost always a single wythe of brick veneer tied back to a framed or block wall behind it. Double wythe construction — two layers bonded together — appears in older solid masonry buildings, freestanding garden walls, and structural applications. A freestanding wall over about 3 feet tall generally needs two wythes for stability.",
    },
    {
      question: "How much mortar do I need per thousand bricks?",
      answer:
        "About 7 bags of 80 pound Type N mortar mix per 1,000 modular brick at a 3/8 inch joint, plus roughly one cubic yard of masonry sand per 7 bags if you are mixing from portland and lime rather than a pre-blended bag mix. Thicker joints, larger units, and hollow brick all increase consumption. Type N suits most above-grade veneer; Type S is specified where higher strength or below-grade exposure is involved.",
    },
    {
      question: "How many bricks can a mason lay in a day?",
      answer:
        "A skilled mason with a laborer tending typically lays 500 to 700 standard bricks per day on straightforward running bond. Complex bond patterns, arches, corbels, tight tolerances, and lots of cutting can cut that in half. Scaffolding time, weather, and wall height also matter. Professional Mode uses your own production rate so the labor estimate reflects the crew actually doing the work.",
    },
    {
      question: "What waste percentage should I plan for?",
      answer:
        "Five percent covers a plain running-bond wall with few openings. Go to 10% when there are many openings, corners, or angled returns that require cutting, and to 15% for herringbone, basketweave, or other patterns with heavy cut waste. Also order slightly generously for the simple reason that brick color varies between production runs — a top-up order months later may not match the wall you already built.",
    },
    {
      question: "How many bricks come on a pallet?",
      answer:
        "Typically 500 to 534 modular bricks per pallet, though it varies by manufacturer and unit size, and larger units come fewer to a cube. This matters for delivery planning and for site access, since a loaded pallet weighs on the order of 2,000 to 2,500 pounds and needs a boom truck or forklift to place. Professional Mode converts your total into pallet count using whatever figure your supplier quotes.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "Brick Count Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Brick Count Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wallLength" className={lbl}>Wall Length (ft)</label>
                <input id="wallLength" type="number" min="0" step="1" className={inp} value={inputs.wallLength}
                  onChange={(e) => setNum("wallLength", e.target.value)} />
              </div>
              <div>
                <label htmlFor="wallHeight" className={lbl}>Wall Height (ft)</label>
                <input id="wallHeight" type="number" min="0" step="1" className={inp} value={inputs.wallHeight}
                  onChange={(e) => setNum("wallHeight", e.target.value)} />
              </div>
              <div>
                <label htmlFor="brickType" className={lbl}>Brick Size</label>
                <select id="brickType" className={inp} value={inputs.brickType}
                  onChange={(e) => setInputs((p) => ({ ...p, brickType: e.target.value as BrickKey }))}>
                  {BRICKS.map((b) => (
                    <option key={b.key} value={b.key}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="jointThickness" className={lbl}>Joint (in)</label>
                <select id="jointThickness" className={inp} value={inputs.jointThickness}
                  onChange={(e) => setNum("jointThickness", e.target.value)}>
                  <option value="0.25">1/4&quot;</option>
                  <option value="0.375">3/8&quot; (standard)</option>
                  <option value="0.5">1/2&quot;</option>
                  <option value="0.625">5/8&quot;</option>
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
                      <DoorOpen className="h-3.5 w-3.5" /> Openings &amp; Wall Build-Up
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="openingArea" className={lbl}>Openings (sq ft)</label>
                        <input id="openingArea" type="number" min="0" step="1" className={inp} value={inputs.openingArea}
                          onChange={(e) => setNum("openingArea", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="wythes" className={lbl}>Wythes</label>
                        <select id="wythes" className={inp} value={inputs.wythes}
                          onChange={(e) => setNum("wythes", e.target.value)}>
                          <option value="1">Single wythe (veneer)</option>
                          <option value="2">Double wythe (solid)</option>
                          <option value="3">Triple wythe</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="wastePercent" className={lbl}>Waste Allowance (%)</label>
                        <input id="wastePercent" type="number" min="0" step="1" className={inp} value={inputs.wastePercent}
                          onChange={(e) => setNum("wastePercent", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Grid3x3 className="h-3.5 w-3.5" /> Pricing
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="pricePerBrick" className={lbl}>Price / Brick</label>
                        <input id="pricePerBrick" type="number" min="0" step="0.05" className={inp}
                          value={inputs.pricePerBrick} onChange={(e) => setNum("pricePerBrick", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="mortarBagPrice" className={lbl}>Mortar Bag Price</label>
                        <input id="mortarBagPrice" type="number" min="0" step="0.5" className={inp}
                          value={inputs.mortarBagPrice} onChange={(e) => setNum("mortarBagPrice", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <HardHat className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock labor, pallet, and delivery planning
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="masonBricksPerDay" className={lbl}>Bricks / Mason-Day</label>
                          <input id="masonBricksPerDay" type="number" min="1" step="25" className={inp}
                            value={inputs.masonBricksPerDay} onChange={(e) => setNum("masonBricksPerDay", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="laborRatePerDay" className={lbl}>Labor Rate / Day</label>
                          <input id="laborRatePerDay" type="number" min="0" step="10" className={inp}
                            value={inputs.laborRatePerDay} onChange={(e) => setNum("laborRatePerDay", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="bricksPerPallet" className={lbl}>Bricks per Pallet</label>
                          <input id="bricksPerPallet" type="number" min="1" step="10" className={inp}
                            value={inputs.bricksPerPallet} onChange={(e) => setNum("bricksPerPallet", e.target.value)} />
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
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Bricks to Order</div>
              <div className="text-4xl font-bold text-primary my-1">{result.totalBricks.toLocaleString("en-US")}</div>
              <div className="text-sm text-muted-foreground">
                {result.bricksPerSqFt.toFixed(2)} per sq ft across {result.netAreaSqFt.toFixed(0)} sq ft of net wall
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Courses</div>
                <div className="text-lg font-bold text-emerald-600">{result.courses}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Mortar Bags</div>
                <div className="text-lg font-bold text-amber-600">{result.mortarBags}</div>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Total Installed Cost</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{money(result.totalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Cost Composition</h3>
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
                <h3 className="text-sm font-bold text-foreground mb-3">Delivery &amp; Labor Planning</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Pallets Required</div>
                    <div className="text-base font-bold text-foreground">{result.pallets}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mason-Days</div>
                    <div className="text-base font-bold text-foreground">{result.laborDays.toFixed(1)} days</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Brick Cost</div>
                    <div className="text-base font-bold text-foreground">{money(result.brickCost)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Labor Cost</div>
                    <div className="text-base font-bold text-amber-600">{money(result.laborCost)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Approximate Pallet Weight on Site</div>
                    <div className="text-base font-bold text-foreground">
                      {(Math.max(1, inputs.bricksPerPallet) * 4.5).toLocaleString("en-US")} lb per pallet — requires boom truck or forklift
                    </div>
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
            <h2 className="text-2xl font-bold mb-3">The Module, Not the Brick, Sets the Count</h2>
            <p className="mb-4">
              The single most common mistake in estimating brick is dividing wall area by brick face area. What actually
              repeats across a wall is the module — one brick plus one mortar joint in each direction. For modular brick
              with a 3/8 inch joint that module is 8 by 2.625 inches, or 21 square inches, which yields 6.86 bricks per
              square foot before the running bond offset. Change the joint to 1/2 inch and the count drops to about 6.55.
              On a 200 square foot wall that is roughly 60 bricks, which is exactly the sort of gap that turns into a
              second delivery.
            </p>

            <h2 className="text-2xl font-bold mb-3">Unit Sizes and What They Cost You</h2>
            <p className="mb-4">
              Modular and standard brick dominate residential work at roughly 6.75 and 6.55 units per square foot. Larger
              formats cover more ground per unit and per minute of labor: Norman gives about 4.5 per square foot and
              Utility about 3, which is why oversized units frequently win on installed cost even when the unit price is
              higher. The trade-off is appearance and, on veneer, the tie spacing and lintel details that the larger
              coursing dimension implies. Roman brick runs the other way — long and thin at about 6 per square foot, more
              joints, more labor, a very particular horizontal look.
            </p>

            <h2 className="text-2xl font-bold mb-3">Mortar, Sand, and the Consumables Nobody Budgets</h2>
            <p className="mb-4">
              Plan on roughly 7 bags of 80 pound Type N mortar per 1,000 modular brick at a 3/8 inch joint, plus about one
              cubic yard of masonry sand per 7 bags if mixing from portland and lime rather than a pre-blended product.
              Thicker joints, larger units, and hollow brick all push consumption up. Type N is the workhorse for
              above-grade veneer; specify Type S where higher compressive strength or below-grade exposure is involved.
              These quantities are small relative to the brick line item but they stop work entirely when you run out
              mid-wall.
            </p>

            <h2 className="text-2xl font-bold mb-3">Waste, Color Lots, and Ordering Generously</h2>
            <p>
              A 5% allowance covers plain running bond with few openings. Push to 10% with many openings, corners, or
              angled returns, and to 15% for herringbone, basketweave, or soldier-course detailing where cutting is
              constant. There is a second reason to order generously that has nothing to do with breakage: brick color
              varies measurably between production runs. A top-up order placed weeks later may come from a different lot
              and will not blend into a finished wall. Buy the whole job in one lot, and keep the leftovers for future
              repairs.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/brick-count-calculator" />
          <PopularCalculators exclude="/calculator/brick-count-calculator" />
        </div>
      </div>
    </>
  );
}
