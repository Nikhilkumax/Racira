"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BreakBulkInputs {
  weightT: number;
  volumeCbm: number;
  stevedorePerT: number;
  storageDays: number;
  handlingPerCbm: number;
  portDues: number;
  lashingPerT: number;
  storagePerTDay: number;
  haulagePerKm: number;
  distanceKm: number;
  trucks: number;
  documentationFee: number;
  cargoValue: number;
  insurancePct: number;
  containerAlternative: number;
  decimals: number;
}

const DEFAULTS: BreakBulkInputs = {
  weightT: 250,
  volumeCbm: 400,
  stevedorePerT: 18,
  storageDays: 5,
  handlingPerCbm: 3.5,
  portDues: 1200,
  lashingPerT: 4,
  storagePerTDay: 0.9,
  haulagePerKm: 2.4,
  distanceKm: 60,
  trucks: 2,
  documentationFee: 450,
  cargoValue: 250000,
  insurancePct: 0.3,
  containerAlternative: 9000,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number, d = 0) => `$${fmt(v, d)}`;

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CostResult {
  valid: boolean;
  errorMsg: string;
  stevedoring: number;
  handling: number;
  lashing: number;
  storage: number;
  inland: number;
  insurance: number;
  portDues: number;
  documentation: number;
  total: number;
  perTonne: number;
  perCbm: number;
  freightTonnes: number;
  perFreightTonne: number;
  density: number;
  vsContainer: number;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateBreakBulk(input: BreakBulkInputs): CostResult {
  const blank = (errorMsg: string): CostResult => ({
    valid: false,
    errorMsg,
    stevedoring: 0,
    handling: 0,
    lashing: 0,
    storage: 0,
    inland: 0,
    insurance: 0,
    portDues: 0,
    documentation: 0,
    total: 0,
    perTonne: 0,
    perCbm: 0,
    freightTonnes: 0,
    perFreightTonne: 0,
    density: 0,
    vsContainer: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.weightT,
    input.volumeCbm,
    input.stevedorePerT,
    input.storageDays,
    input.handlingPerCbm,
    input.portDues,
    input.lashingPerT,
    input.storagePerTDay,
    input.haulagePerKm,
    input.distanceKm,
    input.trucks,
    input.documentationFee,
    input.cargoValue,
    input.insurancePct,
    input.containerAlternative,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to total the cargo cost.");
  if (input.weightT <= 0) return blank("Cargo weight must be greater than zero.");
  if (input.volumeCbm <= 0) return blank("Cargo volume must be greater than zero.");
  if (input.storageDays < 0) return blank("Storage days cannot be negative.");
  if (input.trucks < 0) return blank("Truck count cannot be negative.");
  if (input.distanceKm < 0) return blank("Distance cannot be negative.");
  if (input.cargoValue < 0) return blank("Cargo value cannot be negative.");
  if (input.insurancePct < 0 || input.insurancePct > 100) return blank("Insurance rate should be between 0% and 100%.");
  const negatives = [
    input.stevedorePerT,
    input.handlingPerCbm,
    input.portDues,
    input.lashingPerT,
    input.storagePerTDay,
    input.haulagePerKm,
    input.documentationFee,
    input.containerAlternative,
  ];
  if (negatives.some((v) => v < 0)) return blank("Rates and charges cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const stevedoring = input.weightT * input.stevedorePerT;
  const handling = input.volumeCbm * input.handlingPerCbm;
  const lashing = input.weightT * input.lashingPerT;
  const storage = input.weightT * input.storagePerTDay * input.storageDays;
  const inland = input.haulagePerKm * input.distanceKm * input.trucks;
  const insurance = input.cargoValue * (input.insurancePct / 100);
  const portDues = input.portDues;
  const documentation = input.documentationFee;

  const total = stevedoring + handling + lashing + storage + inland + insurance + portDues + documentation;
  const perTonne = total / input.weightT;
  const perCbm = total / input.volumeCbm;
  const density = input.weightT / input.volumeCbm;
  // Revenue-tonne convention: a break-bulk freight tonne is the greater of one
  // tonne of weight or one cubic metre of volume (the W/M rule).
  const freightTonnes = Math.max(input.weightT, input.volumeCbm);
  const perFreightTonne = total / freightTonnes;

  const vsContainer = total - input.containerAlternative;
  const verdict =
    vsContainer <= 0
      ? `Break-bulk is ${money(Math.abs(vsContainer), d)} cheaper than the container option`
      : `Break-bulk costs ${money(vsContainer, d)} more than the container option`;
  const verdictColor = vsContainer <= 0 ? "text-emerald-600" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    { label: `Stevedoring · ${fmt(input.weightT, 0)} t at ${money(input.stevedorePerT, 2)}/t`, value: money(stevedoring, d) },
    { label: `Cargo handling · ${fmt(input.volumeCbm, 0)} m³ at ${money(input.handlingPerCbm, 2)}/m³`, value: money(handling, d) },
    { label: `Lashing, dunnage & securing · ${money(input.lashingPerT, 2)}/t`, value: money(lashing, d) },
    { label: `Storage · ${fmt(input.storageDays, 0)} day(s) at ${money(input.storagePerTDay, 2)}/t/day`, value: money(storage, d) },
    { label: `Inland haulage · ${fmt(input.trucks, 0)} truck(s) × ${fmt(input.distanceKm, 0)} km`, value: money(inland, d) },
    { label: `Marine cargo insurance · ${fmt(input.insurancePct, 2)}% of ${money(input.cargoValue, 0)}`, value: money(insurance, d) },
    { label: "Port dues, wharfage & terminal charges", value: money(portDues, d) },
    { label: "Documentation, agency & customs fees", value: money(documentation, d) },
    { label: "Cost per tonne of cargo", value: money(perTonne, 2), highlight: true },
    { label: "Cost per cubic metre", value: money(perCbm, 2), highlight: true },
    { label: `Cost per freight tonne (W/M basis ${fmt(freightTonnes, 0)})`, value: money(perFreightTonne, 2) },
  ];

  return {
    valid: true,
    errorMsg: "",
    stevedoring,
    handling,
    lashing,
    storage,
    inland,
    insurance,
    portDues,
    documentation,
    total,
    perTonne,
    perCbm,
    freightTonnes,
    perFreightTonne,
    density,
    vsContainer,
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
  prefix?: string;
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
  prefix,
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
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
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

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function BreakBulkCargoCostCalculator() {
  const [weightT, setWeightT] = useState(String(DEFAULTS.weightT));
  const [volumeCbm, setVolumeCbm] = useState(String(DEFAULTS.volumeCbm));
  const [stevedorePerT, setStevedorePerT] = useState(String(DEFAULTS.stevedorePerT));
  const [storageDays, setStorageDays] = useState(String(DEFAULTS.storageDays));
  const [handlingPerCbm, setHandlingPerCbm] = useState(String(DEFAULTS.handlingPerCbm));
  const [portDues, setPortDues] = useState(String(DEFAULTS.portDues));
  const [lashingPerT, setLashingPerT] = useState(String(DEFAULTS.lashingPerT));
  const [storagePerTDay, setStoragePerTDay] = useState(String(DEFAULTS.storagePerTDay));
  const [haulagePerKm, setHaulagePerKm] = useState(String(DEFAULTS.haulagePerKm));
  const [distanceKm, setDistanceKm] = useState(String(DEFAULTS.distanceKm));
  const [trucks, setTrucks] = useState(String(DEFAULTS.trucks));
  const [documentationFee, setDocumentationFee] = useState(String(DEFAULTS.documentationFee));
  const [cargoValue, setCargoValue] = useState(String(DEFAULTS.cargoValue));
  const [insurancePct, setInsurancePct] = useState(String(DEFAULTS.insurancePct));
  const [containerAlternative, setContainerAlternative] = useState(String(DEFAULTS.containerAlternative));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BreakBulkInputs => ({
    weightT: parseFloat(weightT) || 0,
    volumeCbm: parseFloat(volumeCbm) || 0,
    stevedorePerT: parseFloat(stevedorePerT) || 0,
    storageDays: parseFloat(storageDays) || 0,
    handlingPerCbm: parseFloat(handlingPerCbm) || 0,
    portDues: parseFloat(portDues) || 0,
    lashingPerT: parseFloat(lashingPerT) || 0,
    storagePerTDay: parseFloat(storagePerTDay) || 0,
    haulagePerKm: parseFloat(haulagePerKm) || 0,
    distanceKm: parseFloat(distanceKm) || 0,
    trucks: parseFloat(trucks) || 0,
    documentationFee: parseFloat(documentationFee) || 0,
    cargoValue: parseFloat(cargoValue) || 0,
    insurancePct: parseFloat(insurancePct),
    containerAlternative: parseFloat(containerAlternative) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<BreakBulkInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CostResult>(() => calculateBreakBulk(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateBreakBulk(inputs));
  };

  const reset = () => {
    setWeightT(String(DEFAULTS.weightT));
    setVolumeCbm(String(DEFAULTS.volumeCbm));
    setStevedorePerT(String(DEFAULTS.stevedorePerT));
    setStorageDays(String(DEFAULTS.storageDays));
    setHandlingPerCbm(String(DEFAULTS.handlingPerCbm));
    setPortDues(String(DEFAULTS.portDues));
    setLashingPerT(String(DEFAULTS.lashingPerT));
    setStoragePerTDay(String(DEFAULTS.storagePerTDay));
    setHaulagePerKm(String(DEFAULTS.haulagePerKm));
    setDistanceKm(String(DEFAULTS.distanceKm));
    setTrucks(String(DEFAULTS.trucks));
    setDocumentationFee(String(DEFAULTS.documentationFee));
    setCargoValue(String(DEFAULTS.cargoValue));
    setInsurancePct(String(DEFAULTS.insurancePct));
    setContainerAlternative(String(DEFAULTS.containerAlternative));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateBreakBulk(DEFAULTS));
  };

  const weightNum = parseFloat(weightT);
  const volumeNum = parseFloat(volumeCbm);
  const stevNum = parseFloat(stevedorePerT);
  const daysNum = parseFloat(storageDays);

  const errors = {
    weightT: !Number.isFinite(weightNum) || weightNum <= 0 ? "Must be greater than zero" : "",
    volumeCbm: !Number.isFinite(volumeNum) || volumeNum <= 0 ? "Must be greater than zero" : "",
    stevedorePerT: !Number.isFinite(stevNum) || stevNum < 0 ? "Cannot be negative" : "",
    storageDays: !Number.isFinite(daysNum) || daysNum < 0 ? "Cannot be negative" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What counts as break-bulk cargo?",
      answer:
        "Break-bulk is cargo carried as individual units rather than in a container or as a pumped liquid: bagged rice, steel coils, timber, machinery, palletised bags and project equipment. Each piece or parcel is loaded, lashed and discharged separately, which is why the cost structure has lines for stevedoring, lashing and dunnage that a container booking would bury inside a single door-to-door rate.",
    },
    {
      question: "What is the W/M or freight tonne basis?",
      answer:
        "Break-bulk and conventional liner tariffs quote per freight tonne, defined as the greater of one metric tonne of weight or one cubic metre of volume. A dense cargo such as steel is charged on weight, and a light cargo such as timber is charged on measurement. The calculator reports cost per tonne, per cubic metre and per freight tonne so you can see which basis your tariff is really using.",
    },
    {
      question: "Which costs dominate a break-bulk movement?",
      answer:
        "Stevedoring and shore handling usually lead, followed by storage if the cargo waits for customs or a berth. Lashing and dunnage is a smaller but unavoidable line for awkward or stacked cargo, and inland haulage scales directly with distance and truck count. Insurance is proportional to declared value, so it is the line that moves most when the cargo is expensive relative to its weight.",
    },
    {
      question: "When is a container cheaper than break-bulk?",
      answer:
        "Containers win when the cargo fits standard dimensions, when volumes are steady and when the destination can handle container handling efficiently. Break-bulk becomes competitive for over-dimensional project pieces, very dense cargo where weight limits bind, and ports without container berths. Comparing the two totals side by side, as this calculator does, is the quickest way to see the crossover for a specific shipment.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Business", href: "/calculator#business" },
          { label: "Break-Bulk Cargo Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Break-Bulk Cargo Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Cargo & Terminal">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="cargo-weight"
                  label="Cargo Weight"
                  value={weightT}
                  onChange={setWeightT}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="t"
                  error={errors.weightT}
                  tooltip="Total cargo weight in metric tonnes."
                />
                <CompactInput
                  id="cargo-volume"
                  label="Cargo Volume"
                  value={volumeCbm}
                  onChange={setVolumeCbm}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="m³"
                  error={errors.volumeCbm}
                  tooltip="Total measurement of the cargo in cubic metres."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="stevedore-rate"
                  label="Stevedoring Rate"
                  value={stevedorePerT}
                  onChange={setStevedorePerT}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  prefix="$"
                  suffix="/t"
                  error={errors.stevedorePerT}
                  hint="Typical break-bulk loading and discharge runs $15–25 per tonne."
                  tooltip="Cost to load and discharge one tonne of cargo."
                />
                <CompactInput
                  id="storage-days"
                  label="Storage Days"
                  value={storageDays}
                  onChange={setStorageDays}
                  onEnter={runCalculate}
                  min="0"
                  step="1"
                  suffix="days"
                  error={errors.storageDays}
                  tooltip="Days the cargo waits in the terminal or shed after discharge."
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
                  <SubSection title="Port Charges & Securing">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="handling-rate"
                        label="Handling Rate"
                        value={handlingPerCbm}
                        onChange={setHandlingPerCbm}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/m³"
                        tooltip="Shore handling charged on measurement."
                      />
                      <CompactInput
                        id="port-dues"
                        label="Port Dues & Wharfage"
                        value={portDues}
                        onChange={setPortDues}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="Terminal, wharfage and port dues for the shipment."
                      />
                      <CompactInput
                        id="lashing-rate"
                        label="Lashing & Dunnage"
                        value={lashingPerT}
                        onChange={setLashingPerT}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/t"
                        tooltip="Securing materials and labour charged per tonne."
                      />
                      <CompactInput
                        id="storage-rate"
                        label="Storage Rate"
                        value={storagePerTDay}
                        onChange={setStoragePerTDay}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/t/day"
                        tooltip="Shed or yard storage per tonne per day."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Inland & Documentation">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="haulage-rate"
                        label="Haulage Rate"
                        value={haulagePerKm}
                        onChange={setHaulagePerKm}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/km"
                        tooltip="Trucking rate per kilometre per truck."
                      />
                      <CompactInput
                        id="distance"
                        label="Distance"
                        value={distanceKm}
                        onChange={setDistanceKm}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="km"
                        tooltip="One-way road distance to the final destination."
                      />
                      <CompactInput
                        id="trucks"
                        label="Trucks"
                        value={trucks}
                        onChange={setTrucks}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        tooltip="Number of truck loads required."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="documentation"
                        label="Documentation & Agency"
                        value={documentationFee}
                        onChange={setDocumentationFee}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="Customs brokerage, agency and paperwork."
                      />
                      <CompactInput
                        id="cargo-value"
                        label="Cargo Value"
                        value={cargoValue}
                        onChange={setCargoValue}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="Declared value used to price marine cargo insurance."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Insurance, Comparison & Display">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="insurance-pct"
                        label="Insurance Rate"
                        value={insurancePct}
                        onChange={setInsurancePct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%"
                        tooltip="Cargo insurance as a percentage of declared value."
                      />
                      <CompactInput
                        id="container-alt"
                        label="Container Option"
                        value={containerAlternative}
                        onChange={setContainerAlternative}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="All-in cost of shipping the same cargo in containers."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for money figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Cargo Cost</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.total, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${money(results.perTonne, 2)} per tonne across ${fmt(calcInputs.weightT, 0)} t and ${fmt(calcInputs.volumeCbm, 0)} m³`
                  : "Fix the highlighted inputs to see the total"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Tonne</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.perTonne, 2) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per m³</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.perCbm, 2) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vs Container</span>
                <span className={`font-extrabold ${results.verdictColor}`}>
                  {results.valid ? `${results.vsContainer <= 0 ? "−" : "+"}${money(Math.abs(results.vsContainer), 0)}` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Line</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Amount</th>
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
                        Enter the shipment details to see the cost build-up.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Total landed cost</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(results.total, calcInputs.decimals)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cargo weight</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.weightT, 1)} t` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cargo volume</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.volumeCbm, 1)} m³` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cargo density</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.density, 3)} t/m³` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Freight tonne basis</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.freightTonnes, 0)} W/M` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Stevedoring share</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt((results.stevedoring / results.total) * 100, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Storage charges</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.storage, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Insurance premium</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.insurance, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Per freight tonne</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.perFreightTonne, 2) : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Break-Bulk Cargo Cost Calculator?</h2>
            <p>
              A break-bulk cargo cost calculator totals the individual charges that arise when cargo is handled piece by piece
              instead of in a container: stevedoring, shore handling, lashing and dunnage, terminal storage, port dues, inland
              haulage, documentation and marine cargo insurance. It returns the landed cost, the unit costs per tonne, per cubic
              metre and per freight tonne, and a comparison against a container alternative.
            </p>
            <p>
              Break-bulk quotes are hard to compare because the lines are quoted on different bases. Stevedoring follows weight,
              shore handling follows measurement, storage follows time in the terminal, and insurance follows declared value. A
              single all-in figure hides which of those is driving the total, which is exactly what this tool makes visible.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each cost line is computed from its own driver. Stevedoring multiplies cargo weight by the per-tonne rate, handling
              multiplies volume by the per-cubic-metre rate, lashing and dunnage follows weight, and storage is weight multiplied
              by the daily rate multiplied by days waiting. Port dues and documentation are flat charges, and inland haulage is the
              per-kilometre rate multiplied by distance and truck count. Insurance is the declared value multiplied by the rate in
              percent.
            </p>
            <p>
              The totals are then normalised three ways. Cost per tonne divides the total by cargo weight, cost per cubic metre
              divides it by volume, and cost per freight tonne divides it by the greater of the two, which is the W/M convention
              used in liner tariffs for break-bulk and bagged cargo. Comparing the three shows immediately whether the shipment is
              being priced on weight or on measurement, since a dense cargo such as steel coils produces a much lower cost per cubic
              metre than a light one such as timber.
            </p>
            <p>
              Cargo density, weight divided by volume in tonnes per cubic metre, is the number that decides which basis binds. Sea
              water sits near one tonne per cubic metre, so cargo denser than that is charged on weight and lighter cargo on
              measurement. The comparison against a container option subtracts the alternative total from the break-bulk total and
              states which is cheaper, so the crossover for a particular shipment is explicit rather than assumed.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the total landed break-bulk cost with the cost per tonne underneath. The three-stat bar adds the
              cost per cubic metre and the difference against the container alternative, so the headline comparison is available
              without reading the table.
            </p>
            <p>
              The breakdown table lists each charge with the rate and multiplier that produced it, then the three unit costs, and
              finishes with the total. The summary panel reports the shipment's physical characteristics, the freight-tonne basis
              in use, the share of the total taken by stevedoring, and the storage, insurance and per-freight-tonne figures.
            </p>
            <p>
              Rates vary widely between ports and by commodity, so use the rates from your own quotations rather than the defaults.
              Heavy-lift surcharges, demurrage after free time, port congestion and currency effects are not modelled, and neither
              are cargo-specific requirements such as fumigation or surveying. Treat the total as the core operating cost that those
              extras will be added to, and check that the comparison cargo would actually fit the container option you are pricing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/break-bulk-cargo-cost-calculator" />
          <PopularCalculators exclude="/calculator/break-bulk-cargo-cost-calculator" />
        </div>
      </div>
    </>
  );
}
