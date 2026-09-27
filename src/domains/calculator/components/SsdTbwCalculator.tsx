"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type UnitBase = "decimal" | "binary";

interface SsdInputs {
  capacityGb: number;
  tbwTb: number;
  dailyWritesGb: number;
  warrantyYears: number;
  annualGrowthPct: number;
  unitBase: UnitBase;
  decimals: number;
}

const DEFAULTS: SsdInputs = {
  capacityGb: 1000,
  tbwTb: 600,
  dailyWritesGb: 50,
  warrantyYears: 5,
  annualGrowthPct: 0,
  unitBase: "decimal",
  decimals: 1,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const fmtInt = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SsdResult {
  valid: boolean;
  errorMsg: string;
  bytesPerTb: number;
  tbwBytes: number;
  dailyBytes: number;
  dwpd: number;
  annualWritesTb: number;
  annualPct: number;
  yearsConstant: number;
  yearsWithGrowth: number;
  warrantyWritesTb: number;
  warrantyPct: number;
  endurancePerGb: number;
  multiplyByBinary: number;
  ratioToWarranty: number;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateSsd(input: SsdInputs): SsdResult {
  const blank = (errorMsg: string): SsdResult => ({
    valid: false,
    errorMsg,
    bytesPerTb: 0,
    tbwBytes: 0,
    dailyBytes: 0,
    dwpd: 0,
    annualWritesTb: 0,
    annualPct: 0,
    yearsConstant: 0,
    yearsWithGrowth: 0,
    warrantyWritesTb: 0,
    warrantyPct: 0,
    endurancePerGb: 0,
    multiplyByBinary: 0,
    ratioToWarranty: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [input.capacityGb, input.tbwTb, input.dailyWritesGb, input.warrantyYears, input.annualGrowthPct, input.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to size the endurance.");
  if (input.capacityGb <= 0) return blank("Capacity must be greater than zero.");
  if (input.tbwTb <= 0) return blank("TBW rating must be greater than zero.");
  if (input.dailyWritesGb < 0) return blank("Daily writes cannot be negative.");
  if (input.warrantyYears < 0 || input.warrantyYears > 20) return blank("Warranty should be between 0 and 20 years.");
  if (input.annualGrowthPct < 0 || input.annualGrowthPct > 200) return blank("Annual growth should be between 0% and 200%.");
  if (input.dailyWritesGb === 0) return blank("Enter the host writes per day you expect from the workload.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const bytesPerTb = input.unitBase === "decimal" ? 1e12 : 1024 ** 4;
  const bytesPerGb = input.unitBase === "decimal" ? 1e9 : 1024 ** 3;

  const tbwBytes = input.tbwTb * bytesPerTb;
  const dailyBytes = input.dailyWritesGb * bytesPerGb;

  // Drive writes per day: host bytes written per day relative to the drive's capacity.
  const dwpd = dailyBytes / (input.capacityGb * bytesPerGb);
  const annualWritesTb = (dailyBytes * 365) / bytesPerTb;
  const annualPct = (annualWritesTb / input.tbwTb) * 100;

  const yearsConstant = tbwBytes / (dailyBytes * 365);

  // With an annual growth rate the writes compound, so the TBW budget is
  // consumed sooner: cumulative writes after n years form a geometric series.
  const g = input.annualGrowthPct / 100;
  let yearsWithGrowth = yearsConstant;
  if (g > 0) {
    yearsWithGrowth = 0;
    let cumulative = 0;
    let yearly = dailyBytes * 365;
    while (cumulative < tbwBytes && yearsWithGrowth < 100) {
      cumulative += yearly;
      yearly *= 1 + g;
      yearsWithGrowth += 1;
    }
  }

  const warrantyWritesTb = annualWritesTb * input.warrantyYears;
  const warrantyPct = (warrantyWritesTb / input.tbwTb) * 100;
  const endurancePerGb = (input.tbwTb * 1000) / input.capacityGb;
  const multiplyByBinary = input.unitBase === "decimal" ? 1024 ** 3 : 0;
  const ratioToWarranty = input.warrantyYears > 0 ? yearsConstant / input.warrantyYears : 0;

  const verdict =
    yearsConstant < input.warrantyYears
      ? "TBW runs out before the warranty period ends at this write rate"
      : ratioToWarranty < 2
        ? "Endurance roughly matches the warranty — limited headroom"
        : "Endurance comfortably outlasts the warranty period";
  const verdictColor =
    yearsConstant < input.warrantyYears ? "text-red-600" : ratioToWarranty < 2 ? "text-orange-600" : "text-emerald-600";

  const breakdown: BreakdownRow[] = [
    { label: "Drive capacity", value: `${fmt(input.capacityGb, 0)} GB` },
    { label: "Endurance rating", value: `${fmt(input.tbwTb, 0)} TB written` },
    { label: "Total bytes writable (TBW)", value: `${fmtInt(tbwBytes / 1e12)} × 10¹² bytes` },
    { label: "Host writes per day", value: `${fmt(input.dailyWritesGb, 1)} GB` },
    { label: "Drive writes per day (DWPD)", value: fmt(dwpd, 3), highlight: true },
    { label: "Annual writes", value: `${fmt(annualWritesTb, 1)} TB · ${fmt(annualPct, 2)}% of TBW` },
    { label: "Endurance per GB of capacity", value: `${fmt(endurancePerGb, 1)} TB per 1000 GB` },
    { label: "Lifespan at a constant write rate", value: `${fmt(yearsConstant, 2)} years`, highlight: true },
    {
      label: `Lifespan with ${fmt(input.annualGrowthPct, 0)}% annual write growth`,
      value: `${fmt(yearsWithGrowth, 2)} years`,
    },
    { label: `Total written across a ${fmt(input.warrantyYears, 0)}-year warranty`, value: `${fmt(warrantyWritesTb, 1)} TB` },
    { label: "TBW consumed within the warranty", value: `${fmt(warrantyPct, 1)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    bytesPerTb,
    tbwBytes,
    dailyBytes,
    dwpd,
    annualWritesTb,
    annualPct,
    yearsConstant,
    yearsWithGrowth,
    warrantyWritesTb,
    warrantyPct,
    endurancePerGb,
    multiplyByBinary,
    ratioToWarranty,
    verdict,
    verdictColor,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function SsdTbwCalculator() {
  const [capacityGb, setCapacityGb] = useState(String(DEFAULTS.capacityGb));
  const [tbwTb, setTbwTb] = useState(String(DEFAULTS.tbwTb));
  const [dailyWritesGb, setDailyWritesGb] = useState(String(DEFAULTS.dailyWritesGb));
  const [warrantyYears, setWarrantyYears] = useState(String(DEFAULTS.warrantyYears));
  const [annualGrowthPct, setAnnualGrowthPct] = useState(String(DEFAULTS.annualGrowthPct));
  const [unitBase, setUnitBase] = useState<string>(DEFAULTS.unitBase);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SsdInputs => ({
    capacityGb: parseFloat(capacityGb) || 0,
    tbwTb: parseFloat(tbwTb) || 0,
    dailyWritesGb: parseFloat(dailyWritesGb) || 0,
    warrantyYears: parseFloat(warrantyYears) || 0,
    annualGrowthPct: parseFloat(annualGrowthPct) || 0,
    unitBase: unitBase as UnitBase,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<SsdInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SsdResult>(() => calculateSsd(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateSsd(inputs));
  };

  const reset = () => {
    setCapacityGb(String(DEFAULTS.capacityGb));
    setTbwTb(String(DEFAULTS.tbwTb));
    setDailyWritesGb(String(DEFAULTS.dailyWritesGb));
    setWarrantyYears(String(DEFAULTS.warrantyYears));
    setAnnualGrowthPct(String(DEFAULTS.annualGrowthPct));
    setUnitBase(DEFAULTS.unitBase);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateSsd(DEFAULTS));
  };

  const capNum = parseFloat(capacityGb);
  const tbwNum = parseFloat(tbwTb);
  const dailyNum = parseFloat(dailyWritesGb);
  const warrantyNum = parseFloat(warrantyYears);

  const errors = {
    capacityGb: !Number.isFinite(capNum) || capNum <= 0 ? "Must be greater than zero" : "",
    tbwTb: !Number.isFinite(tbwNum) || tbwNum <= 0 ? "Must be greater than zero" : "",
    dailyWritesGb:
      !Number.isFinite(dailyNum) || dailyNum < 0 ? "Cannot be negative" : dailyNum === 0 ? "Enter the expected writes" : "",
    warrantyYears: !Number.isFinite(warrantyNum) || warrantyNum < 0 || warrantyNum > 20 ? "Use 0–20 years" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What does TBW actually measure?",
      answer:
        "Terabytes written is the total volume of host data the manufacturer rates the drive to accept before it reaches the end of its designed endurance. It is measured in host writes, so write amplification inside the drive is already accounted for by the rating. A 1 TB drive rated at 600 TBW can therefore absorb about 600 times its own capacity in written data.",
    },
    {
      question: "How do I estimate my own daily writes?",
      answer:
        "Add up the real write load: operating-system telemetry, page file and hibernation, browser caches, log files, virtual machines, video capture and database writes. Modern operating systems write tens of gigabytes a day under normal desktop use, video editing or virtual machines can push hundreds of gigabytes, and a mostly-read database workload may write only a few gigabytes. Measuring with SMART data for a week is more reliable than guessing.",
    },
    {
      question: "What does DWPD mean and when does it matter?",
      answer:
        "Drive writes per day expresses the daily write volume as a multiple of the drive's capacity, which is how enterprise endurance grades are specified: 0.3 to 1 DWPD for read-intensive drives, 1 to 3 for mixed use and 3 or more for write-intensive work. The same absolute write volume is far harder on a small drive than a large one, so DWPD is the comparison to use when choosing capacity for a write-heavy task.",
    },
    {
      question: "Does the endurance figure predict failure?",
      answer:
        "No. TBW marks the end of the rated endurance, not a switch-off point: drives routinely keep working past it, and many fail earlier for unrelated reasons such as controller faults, firmware bugs or power loss. The realistic use of TBW is to compare options and to size a drive so the workload sits comfortably inside the rating, with SMART values such as percentage used and total host writes checked occasionally to see how fast the budget is really being consumed.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "SSD TBW Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SSD TBW Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Drive & Workload">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="capacity"
                  label="Drive Capacity"
                  value={capacityGb}
                  onChange={setCapacityGb}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="GB"
                  error={errors.capacityGb}
                  tooltip="Advertised capacity of the SSD."
                />
                <CompactInput
                  id="tbw-rating"
                  label="TBW Rating"
                  value={tbwTb}
                  onChange={setTbwTb}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="TB"
                  error={errors.tbwTb}
                  hint="Typical consumer TLC: 600 TBW per 1 TB."
                  tooltip="Endurance rating from the datasheet."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="daily-writes"
                  label="Daily Host Writes"
                  value={dailyWritesGb}
                  onChange={setDailyWritesGb}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  suffix="GB/day"
                  error={errors.dailyWritesGb}
                  tooltip="Total data written to the drive each day."
                />
                <CompactInput
                  id="warranty"
                  label="Warranty Period"
                  value={warrantyYears}
                  onChange={setWarrantyYears}
                  onEnter={runCalculate}
                  min="0"
                  max="20"
                  step="1"
                  suffix="years"
                  error={errors.warrantyYears}
                  tooltip="Manufacturer warranty, compared against the TBW-limited life."
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
                  <SubSection title="Workload Growth & Units">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="annual-growth"
                        label="Annual Write Growth"
                        value={annualGrowthPct}
                        onChange={setAnnualGrowthPct}
                        onEnter={runCalculate}
                        min="0"
                        max="200"
                        step="any"
                        suffix="%/yr"
                        tooltip="Compounding growth in daily writes, such as more video or larger datasets."
                      />
                      <CompactSelect
                        id="unit-base"
                        label="Capacity Units"
                        value={unitBase}
                        onChange={setUnitBase}
                        options={[
                          { value: "decimal", label: "Decimal — 1 TB = 1000 GB" },
                          { value: "binary", label: "Binary — 1 TiB = 1024 GiB" },
                        ]}
                        tooltip="Manufacturers quote decimal; operating systems often report binary."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for the lifespan figures."
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
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">TBW-Limited Lifespan</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.yearsConstant, calcInputs.decimals)} years` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(calcInputs.dailyWritesGb, 1)} GB written per day against ${fmt(calcInputs.tbwTb, 0)} TBW on a ${fmt(calcInputs.capacityGb, 0)} GB drive`
                  : "Fix the highlighted inputs to see the endurance"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">DWPD</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.dwpd, 3) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">TBW per year</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.annualPct, 2)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vs warranty</span>
                <span className={`font-extrabold ${results.verdictColor}`}>
                  {results.valid ? `${fmt(results.ratioToWarranty, 1)}×` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Endurance Measure</th>
                    <th className="p-2.5 pr-3 text-right w-[200px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter the drive and workload figures to see the endurance arithmetic.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Years until TBW is written</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {fmt(results.yearsConstant, calcInputs.decimals)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Capacity</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.capacityGb, 0)} GB` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">TBW rating</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.tbwTb, 0)} TB` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Daily writes</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.dailyWritesGb, 1)} GB` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual writes</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.annualWritesTb, 1)} TB` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lifespan with growth</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.yearsWithGrowth, calcInputs.decimals)} years` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Written during warranty</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.warrantyPct, 1)}% of TBW` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Warranty period</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.warrantyYears, 0)} years` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Endurance per TB capacity</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.endurancePerGb, 0)} TBW` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an SSD TBW Calculator?</h2>
            <p>
              An SSD TBW calculator turns an endurance rating into a realistic lifespan. It divides the terabytes written that the
              drive is rated for by the bytes you actually write each day, reports the result in years, expresses the workload as
              drive writes per day and as a percentage of the rating consumed annually, and compares the endurance limit against the
              warranty period.
            </p>
            <p>
              Endurance ratings are easy to misread. Six hundred terabytes written on a one terabyte drive sounds enormous until the
              workload is measured: backups, virtual machines, video capture and even operating system telemetry write far more than
              most people assume, and the rating is consumed continuously rather than all at once.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The core arithmetic converts everything to bytes on a common base. Decimal units are used by manufacturers — one TB is
              10¹² bytes and one GB is 10⁹ bytes — while operating systems often report binary units, where a tebibyte is 1024⁴ bytes.
              The TBW rating multiplied by the byte size of a terabyte gives total writable bytes, and daily writes multiplied by the
              byte size of a gigabyte gives the daily burn. Dividing one by the other yields the constant-rate lifespan.
            </p>
            <p>
              Two derived figures make the workload comparable. Drive writes per day divides the daily bytes by the drive capacity, so
              a drive that absorbs its own capacity once a day is running at 1 DWPD — the band where enterprise mixed-use drives sit —
              while 0.3 DWPD marks a read-intensive workload and 3 DWPD or more marks write-intensive work. Annual writes divided by
              the rating gives the share of endurance consumed each year, which makes a ten-year lifespan look like the ten-percent-a-year
              budget it really is.
            </p>
            <p>
              Because write loads grow, the calculator also handles compounding. With an annual growth rate the writes each year form a
              geometric series, and the TBW budget is consumed sooner than a constant-rate estimate suggests. The output reports both the
              constant-rate lifespan and the lifespan with growth applied, and finally compares the endurance limit with the warranty
              period, cross-checking how much TBW would be consumed within the warranty if the workload held steady.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the years until the TBW rating is written, showing the daily writes, rating and capacity behind the
              figure. The three-stat bar adds drive writes per day, the percentage of the rating consumed annually and the ratio of
              endurance life to warranty length, colour-coded when endurance ends before the warranty does.
            </p>
            <p>
              The breakdown table lists capacity, rating, total writable bytes, daily and annual writes, endurance per unit of capacity,
              lifespans with and without growth, and the TBW consumed inside the warranty. The summary panel repeats the inputs and
              outputs in a compact block that is easy to paste into a specification or a purchase justification.
            </p>
            <p>
              Remember what the number is and is not. TBW marks the end of rated endurance, not a failure date — drives commonly carry
              on writing past it — and drives fail for reasons unrelated to endurance as well. Use the figure to compare candidates, to
              choose capacity for a write-heavy role, and then monitor actual writes through SMART data so the estimate is corrected by
              measurement over time.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ssd-tbw-calculator" />
          <PopularCalculators exclude="/calculator/ssd-tbw-calculator" />
        </div>
      </div>
    </>
  );
}
