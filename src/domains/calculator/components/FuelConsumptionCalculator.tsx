"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type FuelType = "petrol" | "diesel";

interface FuelInputs {
  distance: number;
  fuelUsed: number;
  pricePerLitre: number;
  tankSize: number;
  fuelType: FuelType;
  decimals: number;
}

const DEFAULTS: FuelInputs = {
  distance: 520,
  fuelUsed: 41,
  pricePerLitre: 1.55,
  tankSize: 55,
  fuelType: "petrol",
  decimals: 2,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const UNIT_ROWS: { label: string; convert: (l100: number) => number; unit: string }[] = [
  { label: "Litres per 100 km", convert: (l100) => l100, unit: "L/100 km" },
  { label: "Kilometres per litre", convert: (l100) => (l100 > 0 ? 100 / l100 : 0), unit: "km/L" },
  { label: "Miles per US gallon", convert: (l100) => (l100 > 0 ? 235.214583 / l100 : 0), unit: "mpg (US)" },
  { label: "Miles per imperial gallon", convert: (l100) => (l100 > 0 ? 282.480936 / l100 : 0), unit: "mpg (UK)" },
  { label: "Miles per litre", convert: (l100) => (l100 > 0 ? 62.1371192 / l100 : 0), unit: "mi/L" },
  { label: "Gallons per 100 miles (US)", convert: (l100) => (l100 > 0 ? (l100 * 100) / 62.1371192 : 0), unit: "gal/100 mi" },
];

interface UnitLine {
  label: string;
  value: number;
  unit: string;
}

interface CostRow {
  distance: number;
  fuel: number;
  cost: number;
}

interface FuelResult {
  valid: boolean;
  errorMsg: string;
  litres100km: number;
  kmPerLitre: number;
  mpgUs: number;
  mpgUk: number;
  costPerKm: number;
  costPerMile: number;
  totalCost: number;
  totalFuelCostPerYear: number;
  rangeOnTank: number;
  co2PerKm: number;
  co2TotalKg: number;
  unitLines: UnitLine[];
  costRows: CostRow[];
  efficiencyNote: string;
}

function computeFuel(input: FuelInputs): FuelResult {
  const { distance, fuelUsed, pricePerLitre, tankSize, fuelType, decimals } = input;

  const blank: FuelResult = {
    valid: false,
    errorMsg: "",
    litres100km: 0,
    kmPerLitre: 0,
    mpgUs: 0,
    mpgUk: 0,
    costPerKm: 0,
    costPerMile: 0,
    totalCost: 0,
    totalFuelCostPerYear: 0,
    rangeOnTank: 0,
    co2PerKm: 0,
    co2TotalKg: 0,
    unitLines: [],
    costRows: [],
    efficiencyNote: "",
  };

  if (![distance, fuelUsed, pricePerLitre, tankSize].every((v) => Number.isFinite(v))) {
    return { ...blank, errorMsg: "Enter distance, fuel used, price and tank size to run the calculation." };
  }
  if (distance <= 0) return { ...blank, errorMsg: "Distance travelled must be greater than zero." };
  if (fuelUsed <= 0) return { ...blank, errorMsg: "Fuel used must be greater than zero." };
  if (pricePerLitre < 0) return { ...blank, errorMsg: "Fuel price cannot be negative." };
  if (tankSize <= 0) return { ...blank, errorMsg: "Tank size must be greater than zero." };

  const litres100km = (fuelUsed / distance) * 100;
  const kmPerLitre = distance / fuelUsed;
  const mpgUs = kmPerLitre * 2.3521458;
  const mpgUk = kmPerLitre * 2.8248094;
  const costPerKm = (litres100km / 100) * pricePerLitre;
  const costPerMile = costPerKm * 1.609344;
  const totalCost = fuelUsed * pricePerLitre;
  const rangeOnTank = kmPerLitre * tankSize;
  const co2Factor = fuelType === "diesel" ? 2.68 : 2.31;
  const co2PerKm = (litres100km / 100) * co2Factor;
  const co2TotalKg = fuelUsed * co2Factor;

  const unitLines: UnitLine[] = UNIT_ROWS.map((row) => ({
    label: row.label,
    value: Number(row.convert(litres100km).toFixed(decimals + 1)),
    unit: row.unit,
  }));

  const costRows: CostRow[] = [100, 250, 500, 1000, 15000, 20000].map((d) => {
    const litres = (litres100km / 100) * d;
    return {
      distance: d,
      fuel: Number(litres.toFixed(2)),
      cost: Number((litres * pricePerLitre).toFixed(2)),
    };
  });

  let efficiencyNote = "Typical for a modern petrol car in mixed driving.";
  if (litres100km < 4) efficiencyNote = "Very efficient: hybrid, small diesel or careful long-distance driving.";
  else if (litres100km < 6.5) efficiencyNote = "Efficient: typical of a compact car or a careful motorway run.";
  else if (litres100km <= 9) efficiencyNote = "Average: normal for a mid-size petrol car in mixed conditions.";
  else if (litres100km <= 13) efficiencyNote = "Thirsty: large vehicle, mostly city driving or a heavy right foot.";
  else efficiencyNote = "Very high consumption: check for a mechanical fault, short trips or heavy towing.";

  return {
    valid: true,
    errorMsg: "",
    litres100km: Number(litres100km.toFixed(decimals)),
    kmPerLitre: Number(kmPerLitre.toFixed(decimals)),
    mpgUs: Number(mpgUs.toFixed(decimals)),
    mpgUk: Number(mpgUk.toFixed(decimals)),
    costPerKm: Number(costPerKm.toFixed(4)),
    costPerMile: Number(costPerMile.toFixed(4)),
    totalCost: Number(totalCost.toFixed(2)),
    totalFuelCostPerYear: Number(((costPerKm * 15000) / 1).toFixed(2)),
    rangeOnTank: Number(rangeOnTank.toFixed(0)),
    co2PerKm: Number(co2PerKm.toFixed(0)),
    co2TotalKg: Number(co2TotalKg.toFixed(1)),
    unitLines,
    costRows,
    efficiencyNote,
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

export default function FuelConsumptionCalculator() {
  const [distance, setDistance] = useState(String(DEFAULTS.distance));
  const [fuelUsed, setFuelUsed] = useState(String(DEFAULTS.fuelUsed));
  const [pricePerLitre, setPricePerLitre] = useState(String(DEFAULTS.pricePerLitre));
  const [tankSize, setTankSize] = useState(String(DEFAULTS.tankSize));
  const [fuelType, setFuelType] = useState<FuelType>(DEFAULTS.fuelType);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FuelInputs => ({
    distance: parseFloat(distance) || 0,
    fuelUsed: parseFloat(fuelUsed) || 0,
    pricePerLitre: parseFloat(pricePerLitre) || 0,
    tankSize: parseFloat(tankSize) || 0,
    fuelType,
    decimals: Math.max(1, Math.min(4, parseFloat(decimals) || 2)),
  });

  const [calcInputs, setCalcInputs] = useState<FuelInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FuelResult>(() => computeFuel(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeFuel(inputs));
  };

  const reset = () => {
    setDistance(String(DEFAULTS.distance));
    setFuelUsed(String(DEFAULTS.fuelUsed));
    setPricePerLitre(String(DEFAULTS.pricePerLitre));
    setTankSize(String(DEFAULTS.tankSize));
    setFuelType(DEFAULTS.fuelType);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(computeFuel(DEFAULTS));
  };

  const faqs = [
    {
      question: "How do I calculate fuel consumption?",
      answer:
        "Divide the fuel used by the distance travelled, then multiply by one hundred for litres per hundred kilometres. Using forty-one litres over five hundred and twenty kilometres gives about seven point nine litres per hundred kilometres. Divide distance by fuel for the same result in kilometres per litre.",
    },
    {
      question: "Why is lower litres per 100 km better but higher mpg better?",
      answer:
        "The two measures run in opposite directions. Litres per hundred kilometres measures fuel consumed for a fixed distance, so smaller is better, while miles per gallon measures distance covered for a fixed amount of fuel, so larger is better. This is why the two numbers can both improve at once and still look like they are moving in opposite ways.",
    },
    {
      question: "What affects real-world fuel consumption the most?",
      answer:
        "Driving style and speed dominate. Hard acceleration, idling in traffic and cruising well above the speed limit all raise consumption sharply, while steady moderate speeds on a clear road can beat the official figure. Tyre pressure, roof racks, air conditioning, load and cold weather each add a measurable penalty on top.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Fuel Consumption Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fuel Consumption Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Trip Data">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="distance"
                  label="Distance Travelled"
                  value={distance}
                  onChange={setDistance}
                  onEnter={runCalculate}
                  suffix="km"
                  tooltip="Distance covered since the last fill-up."
                />
                <CompactInput
                  id="fuel-used"
                  label="Fuel Used"
                  value={fuelUsed}
                  onChange={setFuelUsed}
                  onEnter={runCalculate}
                  suffix="L"
                  tooltip="Litres added at the pump, or litres consumed over the distance."
                />
              </div>
            </SubSection>

            <SubSection title="Cost Data">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="price"
                  label="Fuel Price"
                  value={pricePerLitre}
                  onChange={setPricePerLitre}
                  onEnter={runCalculate}
                  suffix="/L"
                  tooltip="Price per litre at the pump."
                />
                <CompactInput
                  id="tank-size"
                  label="Tank Size"
                  value={tankSize}
                  onChange={setTankSize}
                  onEnter={runCalculate}
                  suffix="L"
                  tooltip="Used to work out the range on a full tank."
                />
              </div>
            </SubSection>

            <SubSection title="Fuel Type">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFuelType("petrol")}
                  aria-pressed={fuelType === "petrol"}
                  className={
                    fuelType === "petrol"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Petrol
                </button>
                <button
                  type="button"
                  onClick={() => setFuelType("diesel")}
                  aria-pressed={fuelType === "diesel"}
                  className={
                    fuelType === "diesel"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Diesel
                </button>
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
                  <SubSection title="Display">
                    <CompactInput
                      id="decimals"
                      label="Decimal Places"
                      value={decimals}
                      onChange={setDecimals}
                      onEnter={runCalculate}
                      min="1"
                      tooltip="How many digits to show in the consumption figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Fuel Consumption</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.litres100km, calcInputs.decimals)} L/100 km` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.mpgUs, calcInputs.decimals)} mpg (US) · ${fmt(results.mpgUk, calcInputs.decimals)} mpg (UK) · ${fmt(results.kmPerLitre, calcInputs.decimals)} km/L`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per km</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.costPerKm, 4) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Range on Tank</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.rangeOnTank, 0)} km` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CO₂ per km</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.co2PerKm, 0)} g` : "—"}
                </span>
              </div>
            </div>

            {results.valid && (
              <div className="bg-secondary/20 border border-border rounded-lg p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Efficiency Check</div>
                <p className="text-sm text-foreground">{results.efficiencyNote}</p>
              </div>
            )}

            {/* UNIT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measurement</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.unitLines.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.value, calcInputs.decimals)} ${row.unit}`}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Cost of this trip</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.totalCost, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* COST TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Distance</th>
                    <th className="p-2.5 text-right">Fuel Needed</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Fuel Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.costRows.map((row) => (
                    <tr key={row.distance} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{`${fmt(row.distance, 0)} km`}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.fuel, 2)} L`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.cost, 2)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Distance</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.distance, 0)} km`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel Used</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.fuelUsed, 2)} L`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel Price</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(calcInputs.pricePerLitre, 3)} per L`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per Mile</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.costPerMile, 4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">CO₂ This Trip</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.co2TotalKg, 1)} kg`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel Cost at 15,000 km/Year</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.totalFuelCostPerYear, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Fuel Consumption Calculator?</h2>
            <p>
              A fuel consumption calculator turns the fuel you used and the distance you covered into every standard efficiency
              measure: litres per hundred kilometres, kilometres per litre, miles per US gallon and miles per imperial gallon. It
              also works out the cost per kilometre and per mile, the range on a full tank and the carbon dioxide the trip produced.
            </p>
            <p>
              Tracking consumption is the fastest way to notice a mechanical problem. A sudden ten percent rise usually means low
              tyre pressures, a dragging brake, a failing sensor or a change in driving pattern, and catching it early is far cheaper
              than diagnosing a fault later. It also gives a firm number for comparing a car against a replacement.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Dividing fuel used by distance and multiplying by one hundred gives litres per hundred kilometres, and dividing
              distance by fuel gives kilometres per litre. From there the conversions are fixed factors: the US gallon is about
              seventeen percent smaller than the imperial gallon, which is why the two miles-per-gallon figures differ by roughly a
              fifth for the same car.
            </p>
            <p>
              Cost follows directly from consumption multiplied by the pump price, and it is usually the more useful figure because
              prices change while the car does not. Multiplying the cost per kilometre by an annual distance produces a yearly fuel
              budget, and the emissions estimate applies a standard factor of about two point three kilograms of carbon dioxide per
              litre of petrol.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows consumption in litres per hundred kilometres with the gallons figures beneath it. The three-stat
              bar reports cost per kilometre, the range on a full tank and carbon dioxide per kilometre, while a note explains whether
              the figure is efficient, average or high for a typical car.
            </p>
            <p>
              The first table converts the same consumption into six units so figures from different sources can be compared
              directly, and the second shows how much fuel and money a range of journey lengths will take. That second table is the
              quickest way to price a commute or a holiday drive before setting off.
            </p>
            <p>
              Measure consumption over a full tank rather than a short trip. Filling to the same point, noting the litres added and
              dividing by the distance covered since the last fill gives a repeatable figure, and averaging three or more tanks
              removes most of the noise from pump cut-off differences and temperature effects.
            </p>
            <p>
              Finally, remember that official consumption figures come from a laboratory cycle. Real-world results are typically ten
              to thirty percent higher, with the gap widest for hybrids and for cars driven mainly in town. Your own measured figure
              is the one that matters for budgeting, and it is the one worth tracking over time. Keep the last few readings
              together with the odometer values they came from, because a single tank is easily distorted by a long motorway run or
              an unusually heavy load, and the trend across several fills is what actually shows whether the car or the driver has
              changed.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fuel-consumption-calculator" />
          <PopularCalculators exclude="/calculator/fuel-consumption-calculator" />
        </div>
      </div>
    </>
  );
}
