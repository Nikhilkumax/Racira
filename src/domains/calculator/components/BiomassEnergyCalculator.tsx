"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

/** Latent heat of vaporisation of water at 25 °C, MJ/kg — used in the net calorific value correction. */
const LATENT_HEAT = 2.443;
/** kWh per GJ (1 GJ = 277.778 kWh). */
const KWH_PER_GJ = 277.7778;

interface BiomassInputs {
  massTonnes: number;
  lhvDry: number;
  moisturePct: number;
  efficiencyPct: number;
  parasiticPct: number;
  availabilityPct: number;
  electricityPrice: number;
  gridCo2PerMwh: number;
  decimals: number;
}

const DEFAULTS: BiomassInputs = {
  massTonnes: 5000,
  lhvDry: 18.5,
  moisturePct: 30,
  efficiencyPct: 80,
  parasiticPct: 8,
  availabilityPct: 85,
  electricityPrice: 0.11,
  gridCo2PerMwh: 400,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
}

interface BiomassResult {
  valid: boolean;
  errorMsg: string;
  lhvNet: number;
  wetTonnes: number;
  dryTonnes: number;
  waterTonnes: number;
  energyInputGj: number;
  thermalMwh: number;
  grossMwh: number;
  netMwh: number;
  revenue: number;
  co2Avoided: number;
  biomassPerMwh: number;
  capacityMw: number;
  breakdown: BreakdownRow[];
}

function calculateBiomass(input: BiomassInputs): BiomassResult {
  const blank = (errorMsg: string): BiomassResult => ({
    valid: false,
    errorMsg,
    lhvNet: 0,
    wetTonnes: 0,
    dryTonnes: 0,
    waterTonnes: 0,
    energyInputGj: 0,
    thermalMwh: 0,
    grossMwh: 0,
    netMwh: 0,
    revenue: 0,
    co2Avoided: 0,
    biomassPerMwh: 0,
    capacityMw: 0,
    breakdown: [],
  });

  const nums = [
    input.massTonnes,
    input.lhvDry,
    input.moisturePct,
    input.efficiencyPct,
    input.parasiticPct,
    input.availabilityPct,
    input.electricityPrice,
    input.gridCo2PerMwh,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to size the plant.");
  if (input.massTonnes <= 0) return blank("Biomass quantity must be greater than zero.");
  if (input.lhvDry <= 0) return blank("Dry calorific value must be greater than zero.");
  if (input.moisturePct < 0 || input.moisturePct >= 100) return blank("Moisture content must be between 0% and 99%.");
  if (input.efficiencyPct <= 0 || input.efficiencyPct > 100) return blank("Conversion efficiency should be between 1% and 100%.");
  if (input.parasiticPct < 0 || input.parasiticPct > 100) return blank("Parasitic load should be between 0% and 100%.");
  if (input.availabilityPct <= 0 || input.availabilityPct > 100) return blank("Availability should be between 1% and 100%.");
  if (input.electricityPrice < 0 || input.gridCo2PerMwh < 0) return blank("Price and carbon factor cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const mc = input.moisturePct / 100;

  // Net calorific value of the wet fuel: dry energy content scaled to the dry
  // fraction, less the latent heat needed to evaporate the moisture it carries.
  const lhvNet = input.lhvDry * (1 - mc) - LATENT_HEAT * mc;
  if (lhvNet <= 0) return blank("At this moisture content the fuel carries no net energy — dry it further or raise the calorific value.");

  const wetTonnes = input.massTonnes;
  const dryTonnes = wetTonnes * (1 - mc);
  const waterTonnes = wetTonnes * mc;

  const energyInputGj = wetTonnes * lhvNet;
  const thermalMwh = energyInputGj * KWH_PER_GJ / 1000;
  const grossMwh = thermalMwh * (input.efficiencyPct / 100);
  const netMwh = grossMwh * (1 - input.parasiticPct / 100) * (input.availabilityPct / 100);

  const revenue = netMwh * 1000 * input.electricityPrice;
  const co2Avoided = (netMwh * input.gridCo2PerMwh) / 1000;
  const biomassPerMwh = netMwh > 0 ? wetTonnes / netMwh : 0;
  const capacityMw = (netMwh * 1000) / (8760 * (input.availabilityPct / 100)) / 1000;

  const breakdown: BreakdownRow[] = [
    { label: "Biomass delivered (as received)", value: `${fmt(wetTonnes, 0)} t · ${fmt(dryTonnes, 0)} t dry` },
    { label: "Water carried in the fuel", value: `${fmt(waterTonnes, 0)} t` },
    { label: "Dry calorific value", value: `${fmt(input.lhvDry, 2)} GJ/t` },
    {
      label: `Net calorific value at ${fmt(input.moisturePct, 0)}% moisture`,
      value: `${fmt(lhvNet, 2)} GJ/t · ${fmt(lhvNet, 2)} MJ/kg`,
      highlight: true,
    },
    { label: "Energy input to the plant", value: `${fmt(energyInputGj, 0)} GJ · ${fmt(thermalMwh, 0)} MWh thermal` },
    { label: `Conversion efficiency at ${fmt(input.efficiencyPct, 0)}%`, value: `${fmt(grossMwh, 0)} MWh gross` },
    { label: `Parasitic load ${fmt(input.parasiticPct, 0)}% and ${fmt(input.availabilityPct, 0)}% availability`, value: `−${fmt(grossMwh - netMwh, 0)} MWh` },
    { label: "Net electricity exported", value: `${fmt(netMwh, d)} MWh/year`, highlight: true },
    { label: "Biomass required per MWh", value: `${fmt(biomassPerMwh, 2)} t/MWh` },
    { label: "Equivalent generating capacity", value: `${fmt(capacityMw, 2)} MWe` },
    { label: `Revenue at $${fmt(input.electricityPrice, 3)}/kWh`, value: `$${fmt(revenue, 0)}` },
    { label: `CO₂ avoided against ${fmt(input.gridCo2PerMwh, 0)} kg/MWh grid`, value: `${fmt(co2Avoided, 1)} t CO₂e` },
  ];

  return {
    valid: true,
    errorMsg: "",
    lhvNet,
    wetTonnes,
    dryTonnes,
    waterTonnes,
    energyInputGj,
    thermalMwh,
    grossMwh,
    netMwh,
    revenue,
    co2Avoided,
    biomassPerMwh,
    capacityMw,
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

export default function BiomassEnergyCalculator() {
  const [massTonnes, setMassTonnes] = useState(String(DEFAULTS.massTonnes));
  const [lhvDry, setLhvDry] = useState(String(DEFAULTS.lhvDry));
  const [moisturePct, setMoisturePct] = useState(String(DEFAULTS.moisturePct));
  const [efficiencyPct, setEfficiencyPct] = useState(String(DEFAULTS.efficiencyPct));
  const [parasiticPct, setParasiticPct] = useState(String(DEFAULTS.parasiticPct));
  const [availabilityPct, setAvailabilityPct] = useState(String(DEFAULTS.availabilityPct));
  const [electricityPrice, setElectricityPrice] = useState(String(DEFAULTS.electricityPrice));
  const [gridCo2PerMwh, setGridCo2PerMwh] = useState(String(DEFAULTS.gridCo2PerMwh));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BiomassInputs => ({
    massTonnes: parseFloat(massTonnes) || 0,
    lhvDry: parseFloat(lhvDry) || 0,
    moisturePct: parseFloat(moisturePct) || 0,
    efficiencyPct: parseFloat(efficiencyPct) || 0,
    parasiticPct: parseFloat(parasiticPct) || 0,
    availabilityPct: parseFloat(availabilityPct) || 0,
    electricityPrice: parseFloat(electricityPrice) || 0,
    gridCo2PerMwh: parseFloat(gridCo2PerMwh) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<BiomassInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BiomassResult>(() => calculateBiomass(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateBiomass(inputs));
  };

  const reset = () => {
    setMassTonnes(String(DEFAULTS.massTonnes));
    setLhvDry(String(DEFAULTS.lhvDry));
    setMoisturePct(String(DEFAULTS.moisturePct));
    setEfficiencyPct(String(DEFAULTS.efficiencyPct));
    setParasiticPct(String(DEFAULTS.parasiticPct));
    setAvailabilityPct(String(DEFAULTS.availabilityPct));
    setElectricityPrice(String(DEFAULTS.electricityPrice));
    setGridCo2PerMwh(String(DEFAULTS.gridCo2PerMwh));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateBiomass(DEFAULTS));
  };

  const massNum = parseFloat(massTonnes);
  const lhvNum = parseFloat(lhvDry);
  const mcNum = parseFloat(moisturePct);
  const effNum = parseFloat(efficiencyPct);

  const errors = {
    massTonnes: !Number.isFinite(massNum) || massNum <= 0 ? "Must be greater than zero" : "",
    lhvDry: !Number.isFinite(lhvNum) || lhvNum <= 0 ? "Must be greater than zero" : "",
    moisturePct: !Number.isFinite(mcNum) || mcNum < 0 || mcNum >= 100 ? "Use 0–99%" : "",
    efficiencyPct: !Number.isFinite(effNum) || effNum <= 0 || effNum > 100 ? "Use 1–100%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "Why does moisture content matter so much?",
      answer:
        "Because the water in the fuel has to be boiled off before the combustible fraction can burn, and that evaporation consumes energy from the fuel itself. Each percentage point of moisture removes roughly 2.4 megajoules per kilogram of fuel, which is why green wood chips at fifty percent moisture deliver less than half the useful energy of the same chips dried to twenty percent. Drying is often the cheapest way to raise the output of a biomass plant.",
    },
    {
      question: "What are typical calorific values for biomass fuels?",
      answer:
        "On a dry basis, wood chips and sawdust sit around 18 to 20 GJ per tonne, wood pellets 17 to 19, cereal straw about 17, bagasse around 17, and municipal solid waste considerably lower at 8 to 12. These are gross figures; the net calorific value used in a plant calculation is always lower because it subtracts the energy needed to evaporate moisture and the hydrogen-bound water in the fuel.",
    },
    {
      question: "What efficiency should I assume?",
      answer:
        "A well-run biomass boiler driving a steam turbine converts 20 to 30 percent of the fuel energy into electricity; the higher figure in this calculator is appropriate for a boiler or combined heat and power scheme where useful heat is also recovered. Organic Rankine cycle plants on smaller wood-fuel systems sit between 15 and 20 percent, and gasification with a reciprocating engine can reach 25 to 30 percent at small scale.",
    },
    {
      question: "How is the carbon benefit counted?",
      answer:
        "Biomass is treated as biogenic carbon that was recently taken out of the atmosphere, so the electricity generated is usually credited with avoiding the emissions of the grid it displaces — around 400 kg of carbon dioxide per megawatt hour on a gas-heavy grid and considerably less on a low-carbon one. The credit depends entirely on what it displaces, which is why the grid factor is an input rather than a fixed constant.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Environment", href: "/calculator#environment" },
          { label: "Biomass Energy Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Biomass Energy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Fuel & Conversion">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="mass"
                  label="Biomass Quantity"
                  value={massTonnes}
                  onChange={setMassTonnes}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="t/yr"
                  error={errors.massTonnes}
                  tooltip="Fuel delivered as received, including its water content."
                />
                <CompactInput
                  id="lhv-dry"
                  label="Dry Calorific Value"
                  value={lhvDry}
                  onChange={setLhvDry}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="GJ/t"
                  error={errors.lhvDry}
                  hint="Wood chips 18–20 GJ/t dry; straw ≈17."
                  tooltip="Energy content of the dry matter."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="moisture"
                  label="Moisture Content"
                  value={moisturePct}
                  onChange={setMoisturePct}
                  onEnter={runCalculate}
                  min="0"
                  max="99"
                  step="any"
                  suffix="%"
                  error={errors.moisturePct}
                  hint="Green chips 45–55%; dried fuel 15–25%."
                  tooltip="Water content of the fuel as received."
                />
                <CompactInput
                  id="efficiency"
                  label="Conversion Efficiency"
                  value={efficiencyPct}
                  onChange={setEfficiencyPct}
                  onEnter={runCalculate}
                  min="1"
                  max="100"
                  step="any"
                  suffix="%"
                  error={errors.efficiencyPct}
                  hint="Steam turbine 20–30%; boiler or CHP up to 80%."
                  tooltip="Share of fuel energy converted to useful output."
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
                  <SubSection title="Plant Performance">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="parasitic"
                        label="Parasitic Load"
                        value={parasiticPct}
                        onChange={setParasiticPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%"
                        tooltip="Plant's own consumption: fans, pumps, fuel handling, drying."
                      />
                      <CompactInput
                        id="availability"
                        label="Availability"
                        value={availabilityPct}
                        onChange={setAvailabilityPct}
                        onEnter={runCalculate}
                        min="1"
                        max="100"
                        step="any"
                        suffix="%"
                        tooltip="Fraction of the year the plant runs; 85% is realistic for base-load biomass."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Revenue & Carbon">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="price"
                        label="Electricity Price"
                        value={electricityPrice}
                        onChange={setElectricityPrice}
                        onEnter={runCalculate}
                        min="0"
                        step="0.001"
                        prefix="$"
                        suffix="/kWh"
                        tooltip="Price received per kilowatt hour exported."
                      />
                      <CompactInput
                        id="grid-co2"
                        label="Grid Carbon Factor"
                        value={gridCo2PerMwh}
                        onChange={setGridCo2PerMwh}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="kg/MWh"
                        tooltip="Emissions of the generation being displaced; about 400 on a gas-heavy grid."
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
                        tooltip="Decimal places used for the output figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Net Electricity Output</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.netMwh, calcInputs.decimals)} MWh` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(calcInputs.massTonnes, 0)} t/yr at ${fmt(calcInputs.moisturePct, 0)}% moisture gives ${fmt(results.lhvNet, 2)} GJ/t net, about ${fmt(results.biomassPerMwh, 2)} t per MWh`
                  : "Fix the highlighted inputs to size the plant"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net CV</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.lhvNet, 2)} GJ/t` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `$${fmt(results.revenue, 0)}` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CO₂ Avoided</span>
                <span className="font-extrabold text-emerald-600">
                  {results.valid ? `${fmt(results.co2Avoided, 0)} t` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Energy Balance</th>
                    <th className="p-2.5 pr-3 text-right w-[210px]">Value</th>
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
                        Enter the fuel quantity and moisture to see the energy balance.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Net electricity</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.netMwh, calcInputs.decimals)} MWh</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel as received</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.wetTonnes, 0)} t/yr` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dry matter</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.dryTonnes, 0)} t/yr` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Energy input</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.energyInputGj, 0)} GJ` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Thermal equivalent</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.thermalMwh, 0)} MWh` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross generation</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.grossMwh, 0)} MWh` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equivalent capacity</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.capacityMw, 2)} MWe` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel per MWh</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.biomassPerMwh, 2)} t` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Revenue per MWh</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `$${fmt((results.revenue / (results.netMwh || 1)) * 1, 2)}` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Net calorific value uses the 2.443 MJ/kg latent-heat correction for the moisture carried in the fuel. Availability
                  accounts for downtime, so the capacity figure assumes the plant runs only for that share of the year.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Biomass Energy Calculator?</h2>
            <p>
              A biomass energy calculator converts a quantity of fuel into the electricity a plant can export from it. It applies the
              moisture correction that turns a dry calorific value into the net value of the fuel as received, multiplies through by the
              conversion efficiency, subtracts the plant's own parasitic load and applies availability, then reports the output in
              megawatt hours along with revenue and the carbon dioxide avoided against the grid it displaces.
            </p>
            <p>
              The calculation is worth doing before equipment is chosen because biomass output depends mostly on three things that are
              easy to get wrong: how wet the fuel is, how efficient the conversion is, and how much of the year the plant actually runs.
              A plant specified on dry-fuel calorific values and ideal efficiency will routinely fall short of its nameplate output in
              its first winter.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The net calorific value of the wet fuel is the dry value scaled to the dry fraction, minus the latent heat needed to
              evaporate the moisture it carries — 2.443 megajoules per kilogram of water. Green wood chips at fifty percent moisture
              therefore retain less than half the energy per tonne of the same chips dried to twenty percent, and each additional
              percentage point of moisture costs about 0.02 gigajoules per tonne. Multiplying fuel mass by this net value gives the
              energy delivered to the furnace gate.
            </p>
            <p>
              Conversion efficiency then converts thermal energy into electricity, typically 20 to 30 percent for a steam cycle and up
              to 80 percent for a boiler or combined heat and power scheme where the heat is the product. The plant's parasitic load —
              fans, pumps, fuel handling, dryers and controls — is deducted next, and availability reduces the figure for the time the
              plant is down for maintenance. Only what survives all three is exported.
            </p>
            <p>
              The results are expressed per unit of output as well as per year. Biomass per megawatt hour, in tonnes of fuel as
              received, is the operational number that matters when ordering fuel, and the equivalent generating capacity converts the
              annual output into a nameplate size using 8,760 hours multiplied by availability. The carbon line multiplies net
              generation by the grid carbon factor of the displaced generation, which is why the same plant looks very different on a
              coal-heavy grid and a nuclear-heavy one.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is net annual electricity with the fuel quantity, moisture content and fuel-per-megawatt-hour figure in
              the subtext. The three-stat bar adds the net calorific value, the revenue and the carbon dioxide avoided, so the fuel
              quality, the economics and the environmental case are all visible together.
            </p>
            <p>
              The breakdown table traces the path from wet tonnes and dry matter through net calorific value, energy input, gross
              generation, parasitic losses and availability to the exported total, followed by fuel intensity, capacity, revenue and
              avoided emissions. The summary panel repeats the mass and energy figures, equivalent capacity and revenue per megawatt
              hour.
            </p>
            <p>
              Treat the output as a pre-feasibility estimate. Actual plant performance varies with fuel particle size, ash chemistry,
              boiler fouling and seasonal moisture, and the carbon credit depends on what the installation displaces. Site-specific
              fuel analysis and a competent boiler-house design will always beat a spreadsheet, but the arithmetic here will tell you
              quickly whether a proposed plant is in the right size range and which of moisture, efficiency or availability deserves
              attention first.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/biomass-energy-calculator" />
          <PopularCalculators exclude="/calculator/biomass-energy-calculator" />
        </div>
      </div>
    </>
  );
}
