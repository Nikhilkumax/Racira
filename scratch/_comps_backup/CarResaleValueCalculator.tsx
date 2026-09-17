"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Printer, Car, Gauge, Wrench } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Segment = "economy" | "midsize" | "luxury" | "truck" | "suv" | "sports" | "ev";
type Condition = "excellent" | "good" | "fair" | "poor";
type SaleChannel = "private" | "dealer-trade" | "instant-offer";

interface SegmentSpec {
  key: Segment;
  label: string;
  firstYearDrop: number;
  annualDrop: number;
  floorPercent: number;
}

interface CarInputs {
  purchasePrice: number;
  ageYears: number;
  currentMileage: number;
  segment: Segment;
  condition: Condition;
  annualMileageDriven: number;
  accidentHistory: boolean;
  ownerCount: number;
  serviceRecords: boolean;
  saleChannel: SaleChannel;
  proMode: boolean;
  holdYears: number;
  annualInsurance: number;
  annualMaintenance: number;
}

interface ChartPoint {
  year: string;
  value: number;
  isNow: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface CarResult {
  resaleValue: number;
  baselineValue: number;
  totalDepreciation: number;
  depreciationPercent: number;
  retentionPercent: number;
  annualDepreciation: number;
  mileageAdjustment: number;
  conditionAdjustment: number;
  historyAdjustment: number;
  channelAdjustment: number;
  expectedMileage: number;
  mileageDelta: number;
  chartData: ChartPoint[];
  rows: TableRow[];
  // Professional mode
  futureValue: number;
  futureDepreciation: number;
  costPerMile: number;
  totalCostOfOwnership: number;
  monthlyDepreciationCost: number;
}

// Segment-level depreciation curves reflect published industry retention studies:
// steep first-year drop, then a flatter geometric decline toward a residual floor.
const SEGMENTS: SegmentSpec[] = [
  { key: "economy", label: "Economy / Compact", firstYearDrop: 0.19, annualDrop: 0.13, floorPercent: 0.1 },
  { key: "midsize", label: "Midsize Sedan", firstYearDrop: 0.21, annualDrop: 0.145, floorPercent: 0.09 },
  { key: "suv", label: "SUV / Crossover", firstYearDrop: 0.18, annualDrop: 0.125, floorPercent: 0.12 },
  { key: "truck", label: "Pickup Truck", firstYearDrop: 0.15, annualDrop: 0.11, floorPercent: 0.15 },
  { key: "luxury", label: "Luxury Sedan", firstYearDrop: 0.27, annualDrop: 0.175, floorPercent: 0.07 },
  { key: "sports", label: "Sports / Performance", firstYearDrop: 0.2, annualDrop: 0.12, floorPercent: 0.14 },
  { key: "ev", label: "Electric Vehicle", firstYearDrop: 0.26, annualDrop: 0.16, floorPercent: 0.08 },
];

const CONDITION_FACTORS: Record<Condition, number> = {
  excellent: 1.06,
  good: 1.0,
  fair: 0.88,
  poor: 0.72,
};

const CONDITION_LABELS: Record<Condition, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const CHANNEL_FACTORS: Record<SaleChannel, number> = {
  private: 1.0,
  "dealer-trade": 0.85,
  "instant-offer": 0.9,
};

const CHANNEL_LABELS: Record<SaleChannel, string> = {
  private: "Private party sale",
  "dealer-trade": "Dealer trade-in",
  "instant-offer": "Instant cash offer",
};

// Industry convention treats 12,000 miles per year as baseline usage.
const BASELINE_ANNUAL_MILES = 12000;
// Excess or shortfall mileage is valued at roughly $0.06 per mile against the curve value.
const MILEAGE_VALUE_PER_MILE = 0.06;

const DEFAULTS: CarInputs = {
  purchasePrice: 35000,
  ageYears: 4,
  currentMileage: 52000,
  segment: "suv",
  condition: "good",
  annualMileageDriven: 12000,
  accidentHistory: false,
  ownerCount: 1,
  serviceRecords: true,
  saleChannel: "private",
  proMode: false,
  holdYears: 3,
  annualInsurance: 1600,
  annualMaintenance: 900,
};

function segmentSpec(key: Segment): SegmentSpec {
  return SEGMENTS.find((s) => s.key === key) ?? SEGMENTS[0];
}

// Geometric depreciation: first year carries the steepest drop, later years decline
// at the segment rate, bounded below by the segment residual floor.
function curveValue(price: number, spec: SegmentSpec, years: number): number {
  if (years <= 0) return price;
  let value = price * (1 - spec.firstYearDrop);
  for (let y = 1; y < years; y += 1) {
    value *= 1 - spec.annualDrop;
  }
  const partial = years % 1;
  if (partial > 0) {
    value *= 1 - spec.annualDrop * partial;
  }
  return Math.max(value, price * spec.floorPercent);
}

export function calculateCarResale(i: CarInputs): CarResult {
  const price = Math.max(0, i.purchasePrice);
  const spec = segmentSpec(i.segment);
  const age = Math.max(0, i.ageYears);

  const baselineValue = curveValue(price, spec, age);

  const expectedMileage = age * BASELINE_ANNUAL_MILES;
  const mileageDelta = Math.max(0, i.currentMileage) - expectedMileage;
  // Above-average mileage subtracts value; below-average adds it.
  const rawMileageAdjustment = -mileageDelta * MILEAGE_VALUE_PER_MILE;
  const mileageAdjustment = Math.max(Math.min(rawMileageAdjustment, baselineValue * 0.15), -baselineValue * 0.3);

  const afterMileage = Math.max(0, baselineValue + mileageAdjustment);

  const conditionFactor = CONDITION_FACTORS[i.condition];
  const conditionAdjustment = afterMileage * (conditionFactor - 1);
  const afterCondition = afterMileage + conditionAdjustment;

  // Reported accident history costs roughly 12% of value; each owner past the first
  // costs about 2%; complete service records recover about 3%.
  let historyFactor = 1;
  if (i.accidentHistory) historyFactor -= 0.12;
  historyFactor -= Math.max(0, Math.min(i.ownerCount, 6) - 1) * 0.02;
  if (i.serviceRecords) historyFactor += 0.03;
  historyFactor = Math.max(0.5, historyFactor);
  const historyAdjustment = afterCondition * (historyFactor - 1);
  const afterHistory = afterCondition + historyAdjustment;

  const channelFactor = CHANNEL_FACTORS[i.saleChannel];
  const channelAdjustment = afterHistory * (channelFactor - 1);
  const resaleValue = Math.max(0, afterHistory + channelAdjustment);

  const totalDepreciation = Math.max(0, price - resaleValue);
  const depreciationPercent = price > 0 ? (totalDepreciation / price) * 100 : 0;
  const retentionPercent = price > 0 ? (resaleValue / price) * 100 : 0;
  const annualDepreciation = age > 0 ? totalDepreciation / age : totalDepreciation;

  const adjustmentRatio = baselineValue > 0 ? resaleValue / baselineValue : 1;
  const chartYears = Math.max(Math.ceil(age) + 3, 6);
  const chartData: ChartPoint[] = [];
  for (let y = 0; y <= chartYears; y += 1) {
    chartData.push({
      year: y === 0 ? "New" : `Yr ${y}`,
      value: Math.round(curveValue(price, spec, y) * adjustmentRatio),
      isNow: y === Math.round(age),
    });
  }

  const whole = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
  const signed = (v: number) => `${v < 0 ? "-" : "+"}$${Math.round(Math.abs(v)).toLocaleString("en-US")}`;

  const rows: TableRow[] = [
    { label: "Original Purchase Price", value: whole(price) },
    { label: `Curve Value at ${age} yr (${spec.label})`, value: whole(baselineValue) },
    { label: `Mileage Adjustment (${mileageDelta >= 0 ? "+" : ""}${Math.round(mileageDelta).toLocaleString("en-US")} mi)`, value: signed(mileageAdjustment) },
    { label: `Condition Adjustment (${CONDITION_LABELS[i.condition]})`, value: signed(conditionAdjustment) },
    { label: "Vehicle History Adjustment", value: signed(historyAdjustment) },
    { label: `Sale Channel (${CHANNEL_LABELS[i.saleChannel]})`, value: signed(channelAdjustment) },
    { label: "Estimated Resale Value", value: whole(resaleValue), key: true },
    { label: "Total Depreciation to Date", value: whole(totalDepreciation) },
    { label: "Average Depreciation per Year", value: whole(annualDepreciation) },
    { label: "Value Retained", value: `${retentionPercent.toFixed(1)}%` },
  ];

  // Professional mode
  const hold = Math.max(0, i.holdYears);
  const futureValue = Math.max(0, curveValue(price, spec, age + hold) * adjustmentRatio);
  const futureDepreciation = Math.max(0, resaleValue - futureValue);
  const futureMiles = Math.max(1, hold * Math.max(0, i.annualMileageDriven));
  const carryingCosts = hold * (Math.max(0, i.annualInsurance) + Math.max(0, i.annualMaintenance));
  const totalCostOfOwnership = futureDepreciation + carryingCosts;
  const costPerMile = totalCostOfOwnership / futureMiles;
  const monthlyDepreciationCost = hold > 0 ? futureDepreciation / (hold * 12) : 0;

  return {
    resaleValue,
    baselineValue,
    totalDepreciation,
    depreciationPercent,
    retentionPercent,
    annualDepreciation,
    mileageAdjustment,
    conditionAdjustment,
    historyAdjustment,
    channelAdjustment,
    expectedMileage,
    mileageDelta,
    chartData,
    rows,
    futureValue,
    futureDepreciation,
    costPerMile,
    totalCostOfOwnership,
    monthlyDepreciationCost,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function CarResaleValueCalculator() {
  const [inputs, setInputs] = useState<CarInputs>(DEFAULTS);
  const [result, setResult] = useState<CarResult>(calculateCarResale(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateCarResale(inputs));
  }, []);

  const calculate = () => setResult(calculateCarResale(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCarResale(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof CarInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const whole = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const retentionColor =
    result.retentionPercent >= 55 ? "text-emerald-600" : result.retentionPercent >= 35 ? "text-amber-600" : "text-red-600";

  const faqs = [
    {
      question: "How much value does a new car lose in the first year?",
      answer:
        "Most vehicles lose between 15% and 27% of their value in the first twelve months, with the exact figure depending heavily on segment. Pickup trucks hold value best, shedding roughly 15%, while luxury sedans and electric vehicles are the steepest at 26% to 27%. This first-year cliff is why buying a one-year-old vehicle is often the single highest-leverage decision in car ownership economics.",
    },
    {
      question: "How does mileage affect resale value?",
      answer:
        "Appraisers compare your odometer against an expected 12,000 miles per year and adjust from there. Roughly six cents per mile of deviation is typical, so a four-year-old car with 70,000 miles instead of the expected 48,000 loses about $1,300 relative to the curve. The adjustment is capped in both directions because a garage-kept low-mileage car still suffers age-related wear to seals, belts, and tires.",
    },
    {
      question: "Why is a dealer trade-in worth less than a private sale?",
      answer:
        "A dealer has to recondition the vehicle, floor-plan it on their lot for weeks or months, and still clear a margin when it sells. That spread typically runs about 15% below private-party value. An instant online cash offer usually lands in between, around 10% below private party, because those buyers operate at higher volume and lower reconditioning standards. The trade-off is speed and certainty against price.",
    },
    {
      question: "How much does an accident on the vehicle history report cost?",
      answer:
        "A reported accident typically costs about 12% of the vehicle's value even after a flawless repair, because the branding follows the VIN permanently and buyers discount it regardless of workmanship. Severity matters at the margins, but the existence of the report is what drives most of the loss. Frame damage or airbag deployment can push the discount well past 20%.",
    },
    {
      question: "Do electric vehicles depreciate faster than gas cars?",
      answer:
        "Historically yes. EVs have carried some of the steepest depreciation curves in the market, driven by rapid improvements in battery range, shifting tax credit availability, and uncertainty about long-term battery health. A 26% first-year drop and 16% annually afterward is a reasonable planning assumption, though this varies more by model than in any other segment.",
    },
    {
      question: "Does the number of previous owners matter?",
      answer:
        "Each owner beyond the first costs roughly 2% of value. The logic is that multiple short ownership periods correlate with unresolved problems and with gaps in maintenance continuity. A three-owner car is not necessarily worse mechanically than a one-owner car, but buyers cannot verify that, so they price in the risk.",
    },
    {
      question: "Are complete service records worth keeping?",
      answer:
        "Yes, and they are close to free. A documented maintenance history recovers about 3% of value at sale because it converts an unverifiable claim into evidence. This is one of very few resale levers you control entirely, and it matters most on higher-mileage vehicles where buyers are specifically worried about deferred maintenance.",
    },
    {
      question: "What is the cheapest point in a car's life to own it?",
      answer:
        "Depreciation per year falls sharply after roughly year five, while maintenance costs rise gradually. The combined cost of ownership usually bottoms out somewhere between years four and eight for most mainstream vehicles. Turn on Professional Mode above to model your own crossover point using your actual insurance and maintenance figures.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator/transportation" },
          { label: "Car Resale Value Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Resale Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="purchasePrice" className={lbl}>Purchase Price</label>
                <input id="purchasePrice" type="number" min="0" step="500" className={inp} value={inputs.purchasePrice}
                  onChange={(e) => setNum("purchasePrice", e.target.value)} />
              </div>
              <div>
                <label htmlFor="ageYears" className={lbl}>Vehicle Age (yrs)</label>
                <input id="ageYears" type="number" min="0" step="0.5" className={inp} value={inputs.ageYears}
                  onChange={(e) => setNum("ageYears", e.target.value)} />
              </div>
              <div>
                <label htmlFor="currentMileage" className={lbl}>Current Mileage</label>
                <input id="currentMileage" type="number" min="0" step="1000" className={inp} value={inputs.currentMileage}
                  onChange={(e) => setNum("currentMileage", e.target.value)} />
              </div>
              <div>
                <label htmlFor="segment" className={lbl}>Vehicle Segment</label>
                <select id="segment" className={inp} value={inputs.segment}
                  onChange={(e) => setInputs((p) => ({ ...p, segment: e.target.value as Segment }))}>
                  {SEGMENTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
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

              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Gauge className="h-3.5 w-3.5" /> Condition &amp; Usage
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="condition" className={lbl}>Condition Grade</label>
                        <select id="condition" className={inp} value={inputs.condition}
                          onChange={(e) => setInputs((p) => ({ ...p, condition: e.target.value as Condition }))}>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="annualMileageDriven" className={lbl}>Miles Driven / yr</label>
                        <input id="annualMileageDriven" type="number" min="0" step="1000" className={inp}
                          value={inputs.annualMileageDriven} onChange={(e) => setNum("annualMileageDriven", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Car className="h-3.5 w-3.5" /> History &amp; Sale Channel
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="ownerCount" className={lbl}>Number of Owners</label>
                        <input id="ownerCount" type="number" min="1" max="6" step="1" className={inp}
                          value={inputs.ownerCount} onChange={(e) => setNum("ownerCount", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="saleChannel" className={lbl}>Sale Channel</label>
                        <select id="saleChannel" className={inp} value={inputs.saleChannel}
                          onChange={(e) => setInputs((p) => ({ ...p, saleChannel: e.target.value as SaleChannel }))}>
                          <option value="private">Private party</option>
                          <option value="instant-offer">Instant cash offer</option>
                          <option value="dealer-trade">Dealer trade-in</option>
                        </select>
                      </div>
                      <label htmlFor="accidentHistory" className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                        <input id="accidentHistory" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.accidentHistory}
                          onChange={(e) => setInputs((p) => ({ ...p, accidentHistory: e.target.checked }))} />
                        Reported accident
                      </label>
                      <label htmlFor="serviceRecords" className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                        <input id="serviceRecords" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.serviceRecords}
                          onChange={(e) => setInputs((p) => ({ ...p, serviceRecords: e.target.checked }))} />
                        Full service records
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Wrench className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock hold-period forecast and cost per mile
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="holdYears" className={lbl}>Additional Hold (yrs)</label>
                          <input id="holdYears" type="number" min="0" step="1" className={inp} value={inputs.holdYears}
                            onChange={(e) => setNum("holdYears", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="annualInsurance" className={lbl}>Insurance / yr</label>
                          <input id="annualInsurance" type="number" min="0" step="100" className={inp}
                            value={inputs.annualInsurance} onChange={(e) => setNum("annualInsurance", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="annualMaintenance" className={lbl}>Maintenance &amp; Repairs / yr</label>
                          <input id="annualMaintenance" type="number" min="0" step="100" className={inp}
                            value={inputs.annualMaintenance} onChange={(e) => setNum("annualMaintenance", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Resale Value</div>
              <div className="text-4xl font-bold text-primary my-1">{whole(result.resaleValue)}</div>
              <div className="text-sm text-muted-foreground">
                {result.retentionPercent.toFixed(1)}% of original price retained after {inputs.ageYears} years
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Value Retained</div>
                <div className={`text-lg font-bold ${retentionColor}`}>{result.retentionPercent.toFixed(1)}%</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Lost</div>
                <div className="text-lg font-bold text-red-600">{whole(result.totalDepreciation)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Per Year</div>
                <div className="text-lg font-bold text-amber-600">{whole(result.annualDepreciation)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Valuation Component</th>
                    <th className="p-2.5 pr-3 text-right">Amount</th>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Depreciation to Date</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.depreciationPercent.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Depreciation Curve</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
                    <RTooltip formatter={(value: number) => whole(value)} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.year} fill={point.isNow ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Current age
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Projected value
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Hold-Period Cost Forecast</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Value in {inputs.holdYears} Years</div>
                    <div className="text-base font-bold text-foreground">{whole(result.futureValue)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Further Depreciation</div>
                    <div className="text-base font-bold text-red-600">{whole(result.futureDepreciation)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Depreciation / Month</div>
                    <div className="text-base font-bold text-amber-600">{whole(result.monthlyDepreciationCost)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">All-In Cost per Mile</div>
                    <div className="text-base font-bold text-primary">${result.costPerMile.toFixed(2)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Cost of Ownership over Hold</div>
                    <div className="text-base font-bold text-foreground">{whole(result.totalCostOfOwnership)}</div>
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
            <h2 className="text-2xl font-bold mb-3">How Car Depreciation Actually Works</h2>
            <p className="mb-4">
              Depreciation is not linear, and treating it as though it were is the most common mistake in vehicle
              budgeting. A car sheds the largest share of its value in the first twelve months, typically 15% to 27%
              depending on segment, then declines geometrically at a slower rate each year afterward. Because the decline
              compounds against a shrinking base, the dollar loss per year falls steadily even though the percentage rate
              stays roughly constant. Eventually the curve flattens against a residual floor, the point below which a
              running vehicle retains value simply because it is transportation.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Segment Matters More Than Brand</h2>
            <p className="mb-4">
              Pickup trucks are the strongest value holders in the market, losing about 15% in year one and 11% annually
              thereafter, because demand for used work vehicles is deep and relatively insensitive to model year. SUVs and
              crossovers follow. Luxury sedans and electric vehicles sit at the opposite end, both around a 26% first-year
              drop, though for different reasons. Luxury sedans depreciate because their new-car price includes substantial
              brand premium that evaporates on resale, and because maintenance costs frighten second owners. Electric
              vehicles depreciate because the technology improves quickly enough that a four-year-old battery and range
              figure look dated against current models.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Adjustments That Follow the Curve</h2>
            <p className="mb-4">
              Once the curve produces a baseline, appraisers layer adjustments on top. Mileage is measured against an
              expected 12,000 miles per year and valued at roughly six cents per mile of deviation. Condition grade moves
              the number by up to six percent upward for excellent examples and nearly thirty percent downward for poor
              ones. A reported accident costs about 12% regardless of repair quality, each additional owner costs about 2%,
              and complete service records recover about 3%. Finally, the sale channel applies: a dealer trade-in lands
              roughly 15% below private-party value, and an instant cash offer about 10% below, in exchange for speed.
            </p>

            <h2 className="text-2xl font-bold mb-3">Using Depreciation to Time a Sale</h2>
            <p>
              Because annual depreciation falls while maintenance costs rise, total cost of ownership per year usually
              bottoms out somewhere between years four and eight for mainstream vehicles. Selling before that point means
              paying for the steepest part of the curve without collecting the cheap years that follow. Holding well past
              it means absorbing rising repair bills for a vehicle that has little value left to lose. Professional Mode
              lets you project a hold period forward and see the all-in cost per mile, combining further depreciation with
              your actual insurance and maintenance figures, which is the number that should drive the decision rather
              than the sticker value alone.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-resale-value-calculator" />
          <PopularCalculators exclude="/calculator/car-resale-value-calculator" />
        </div>
      </div>
    </>
  );
}
