"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RadiatorInputs {
  horsepower: number;
  coreRows: number;
  ambientTempF: number;
  airflowDeratePct: number;
}

const DEFAULTS: RadiatorInputs = {
  horsepower: 400,
  coreRows: 2,
  ambientTempF: 90,
  airflowDeratePct: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const ROW_MULTIPLIERS: Record<number, number> = { 1: 1.0, 2: 1.6, 3: 2.0, 4: 2.2 };

function rowMultiplier(rows: number): number {
  const r = Math.round(rows);
  return ROW_MULTIPLIERS[r] ?? ROW_MULTIPLIERS[2];
}

interface RowOption {
  rows: number;
  multiplier: number;
  requiredArea: number;
  width: number;
  height: number;
  label: string;
  selected: boolean;
}

interface RadiatorResult {
  baselineArea: number;
  rowMult: number;
  areaFactor: number;
  requiredCoreArea: number;
  recommendedWidth: number;
  recommendedHeight: number;
  areaPerHorsepower: number;
  options: RowOption[];
  valid: boolean;
  errorMsg: string;
}

const ROW_LABELS: Record<number, string> = {
  1: "1-row thin core",
  2: "2-row standard",
  3: "3-row heavy duty",
  4: "4-row maximum",
};

function computeRadiator(i: RadiatorInputs): RadiatorResult {
  const rows = Math.min(4, Math.max(1, Math.round(i.coreRows) || 2));
  const invalid = i.horsepower <= 0 || i.coreRows < 1 || i.coreRows > 4 || i.airflowDeratePct < 0;

  // Baseline: 1.7 sq-in of single-row core area per horsepower.
  const baselineArea = i.horsepower * 1.7;

  // Hotter ambient air carries less heat away, so more core is needed.
  const ambientFactor = 1 + Math.max(0, i.ambientTempF - 70) * 0.004;
  const derateFactor = 1 / Math.max(0.5, 1 - i.airflowDeratePct / 100);
  const areaFactor = ambientFactor * derateFactor;

  const rowMult = rowMultiplier(rows);
  const requiredCoreArea = (baselineArea / rowMult) * areaFactor;

  // Assume a rectangular core with a 1.5 : 1 width-to-height ratio.
  const estimatedHeight = Math.sqrt(requiredCoreArea / 1.5);
  const estimatedWidth = estimatedHeight * 1.5;

  const options: RowOption[] = [1, 2, 3, 4].map((r) => {
    const mult = ROW_MULTIPLIERS[r];
    const area = (baselineArea / mult) * areaFactor;
    const h = Math.sqrt(area / 1.5);
    return {
      rows: r,
      multiplier: mult,
      requiredArea: area,
      width: h * 1.5,
      height: h,
      label: ROW_LABELS[r],
      selected: r === rows,
    };
  });

  return {
    baselineArea,
    rowMult,
    areaFactor,
    requiredCoreArea,
    recommendedWidth: estimatedWidth,
    recommendedHeight: estimatedHeight,
    areaPerHorsepower: i.horsepower > 0 ? requiredCoreArea / i.horsepower : 0,
    options,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter horsepower above zero, core rows between 1 and 4, and a non-negative airflow derate."
      : "",
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
  max?: string;
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
  max,
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
        max={max}
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

export default function RadiatorSizeCalculator() {
  const [horsepower, setHorsepower] = useState(String(DEFAULTS.horsepower));
  const [coreRows, setCoreRows] = useState(String(DEFAULTS.coreRows));
  const [ambientTempF, setAmbientTempF] = useState(String(DEFAULTS.ambientTempF));
  const [airflowDeratePct, setAirflowDeratePct] = useState(String(DEFAULTS.airflowDeratePct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RadiatorInputs => ({
    horsepower: parseFloat(horsepower) || 0,
    coreRows: parseFloat(coreRows) || 0,
    ambientTempF: parseFloat(ambientTempF) || 70,
    airflowDeratePct: parseFloat(airflowDeratePct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<RadiatorInputs>(() => DEFAULTS);
  const [results, setResults] = useState<RadiatorResult>(() => computeRadiator(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeRadiator(inputs));
  };

  const reset = () => {
    setHorsepower(String(DEFAULTS.horsepower));
    setCoreRows(String(DEFAULTS.coreRows));
    setAmbientTempF(String(DEFAULTS.ambientTempF));
    setAirflowDeratePct(String(DEFAULTS.airflowDeratePct));
    setCalcInputs(DEFAULTS);
    setResults(computeRadiator(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much radiator core area does an engine need?",
      answer:
        "A long-standing rule of thumb for copper and brass radiators is roughly 1.5 to 2.0 square inches of single-row core area per horsepower, and 1.7 is a safe conservative baseline. The figure assumes a properly ducted core with cool air passing through it and a thermostat that keeps the engine at temperature; it does not compensate for a missing fan shroud or a blocked grille.",
    },
    {
      question: "Do more rows always mean more cooling?",
      answer:
        "No. Each additional row sees air that the row ahead has already heated, so capacity rises with diminishing returns: a two-row core delivers about 1.6 times the capacity of a single row, three rows about 2.0 times, and four rows only about 2.2 times. Beyond that, thicker cores add weight, cost and fan loading without proportional benefit, which is why two and three row cores dominate real builds.",
    },
    {
      question: "Why does ambient temperature change the answer?",
      answer:
        "Heat transfer depends on the temperature difference between the coolant and the air passing through the core. A hot day narrows that difference, so the same radiator sheds less heat and more core area is needed to compensate. The calculator adds roughly 0.4 percent more required area per degree Fahrenheit above 70, which reflects why cooling problems appear on the hottest days of summer.",
    },
    {
      question: "What is a typical width-to-height ratio for a radiator?",
      answer:
        "Most production radiators are wider than they are tall, commonly around 1.5 to 1.8 times as wide as they are high, so the calculator projects a core at a 1.5 : 1 ratio from the required area. The real constraint is usually the engine bay: measure the available width, height and thickness first, then pick the row count that fits the space with the required area.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Radiator Size Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Radiator Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Engine & Core">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="horsepower"
                  label="Engine Horsepower"
                  value={horsepower}
                  onChange={setHorsepower}
                  onEnter={runCalculate}
                  suffix="hp"
                  tooltip="Peak horsepower the cooling system must support."
                />
                <CompactInput
                  id="core-rows"
                  label="Core Rows"
                  value={coreRows}
                  onChange={setCoreRows}
                  onEnter={runCalculate}
                  min="1"
                  max="4"
                  tooltip="Number of tube rows in the core, from 1 to 4."
                />
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
                  <SubSection title="Air Conditions">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="ambient-temp"
                        label="Ambient Temperature"
                        value={ambientTempF}
                        onChange={setAmbientTempF}
                        onEnter={runCalculate}
                        suffix="°F"
                        tooltip="Air temperature at the core; hotter air needs more area."
                      />
                      <CompactInput
                        id="airflow-derate"
                        label="Airflow Derate"
                        value={airflowDeratePct}
                        onChange={setAirflowDeratePct}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Estimated loss of airflow from a weak fan, shroud gap or blocked grille."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Required Core Area</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.requiredCoreArea, 0)} in²
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`About ${fmt(results.recommendedWidth, 0)}" × ${fmt(results.recommendedHeight, 0)}" at a 1.5 : 1 width-to-height ratio`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Row Multiplier</span>
                <span className="font-extrabold text-foreground">{fmt(results.rowMult, 2)}x</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Area per HP</span>
                <span className="font-extrabold text-foreground">{fmt(results.areaPerHorsepower, 2)} in²</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Air Factor</span>
                <span className="font-extrabold text-foreground">{fmt(results.areaFactor, 3)}x</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Core Option</th>
                    <th className="p-2.5 text-right w-[110px]">Multiplier</th>
                    <th className="p-2.5 text-right w-[130px]">Area Needed</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Suggested Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.options.map((o) => (
                    <tr key={o.rows} className={o.selected ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {o.label}
                        {o.selected ? " (selected)" : ""}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{fmt(o.multiplier, 2)}x</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(o.requiredArea, 0)} in²</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {fmt(o.width, 0)}" × {fmt(o.height, 0)}"
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Your configuration</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.rowMult, 2)}x</td>
                    <td className="p-2.5 text-right text-emerald-600">{fmt(results.requiredCoreArea, 0)} in²</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.recommendedWidth, 0)}" × {fmt(results.recommendedHeight, 0)}"
                    </td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Horsepower</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.horsepower, 0)} hp</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Core Rows</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.coreRows, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Baseline 1-Row Area</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.baselineArea, 0)} in²</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ambient Temperature</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.ambientTempF, 0)} °F</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Airflow Derate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.airflowDeratePct, 0)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Recommended Core</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(results.recommendedWidth, 0)}" × {fmt(results.recommendedHeight, 0)}" × {fmt(calcInputs.coreRows, 0)} rows
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Radiator Size Calculator?</h2>
            <p>
              A radiator size calculator converts engine output into the cooling core area needed to keep it at temperature.
              The rule it applies is simple: cooling demand scales with horsepower, and core area supplies that cooling. For
              copper and brass cores, the classic planning figure is about 1.7 square inches of single-row core area per
              horsepower, which leaves enough margin for real-world conditions without adding unnecessary weight.
            </p>
            <p>
              The catch is that core area is not a single number. The same box can hold one thin row of tubes or four thick
              ones, and each added row provides less extra capacity than the last because the air entering it has already
              been warmed by the rows ahead. Choosing between a large single-row core and a compact multi-row core is the
              actual engineering decision, and the calculator lays both out side by side.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator multiplies horsepower by 1.7 to produce a baseline single-row area, then divides that area by
              a row multiplier: 1.0 for a single row, 1.6 for two rows, 2.0 for three and 2.2 for four. The result is the
              core face area required at your chosen row count. From there it projects a rectangular core using a 1.5 : 1
              width-to-height ratio, which matches the proportions of most production radiators and gives a starting point
              you can compare with the space actually available under the hood.
            </p>
            <p>
              Two corrections refine the estimate. Hotter ambient air narrows the temperature difference between coolant
              and air, so the calculator adds roughly four tenths of a percent more area for every degree Fahrenheit above
              seventy. An airflow derate accounts for a weak fan, an open shroud or a grille packed with debris, all of
              which reduce the air actually passing through the core and therefore the heat it can carry away.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the required core area with a suggested width and height. The three-stat bar reports
              the row multiplier for your configuration, the resulting area per horsepower and the combined air factor,
              while the table compares all four row options so the trade-off between thickness and face size is visible in
              one place.
            </p>
            <p>
              Read the comparison table as a shopping constraint. A four-row core needs far less face area, which helps in
              a cramped engine bay, but it is heavier, harder for a fan to pull air through and more expensive. A single-row
              core needs the largest face, which usually means cutting and clearancing. Most builds land on two or three
              rows, and the table shows exactly how much face area each choice saves or costs.
            </p>
            <p>
              Finally, treat the number as a minimum rather than a target. Production cooling systems are sized to survive
              the worst conditions the manufacturer expected, including trailer towing in summer and stop-and-go traffic
              with the air conditioning on. If your build adds boost, raises compression or runs on track days, size the
              core above the calculated figure and confirm the fan, shroud and ducting can actually deliver air to it,
              because the best core in the world cools nothing if the airflow never reaches it.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/radiator-size-calculator" />
          <PopularCalculators exclude="/calculator/radiator-size-calculator" />
        </div>
      </div>
    </>
  );
}
