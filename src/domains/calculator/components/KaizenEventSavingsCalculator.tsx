"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface KaizenInputs {
  hoursSavedPerWeek: number;
  laborRate: number;
  qualityCostBefore: number;
  eventCost: number;
  workingWeeks: number;
  overtimeHoursPerWeek: number;
  overtimePremium: number;
  qualityReductionPct: number;
  inventoryReduction: number;
  carryingRatePct: number;
  spaceReleased: number;
  spaceRate: number;
  recurringCosts: number;
  paybackTargetMonths: number;
  decimals: number;
}

const DEFAULTS: KaizenInputs = {
  hoursSavedPerWeek: 12,
  laborRate: 38,
  qualityCostBefore: 60000,
  eventCost: 18000,
  workingWeeks: 48,
  overtimeHoursPerWeek: 0,
  overtimePremium: 1.5,
  qualityReductionPct: 40,
  inventoryReduction: 25000,
  carryingRatePct: 25,
  spaceReleased: 800,
  spaceRate: 9,
  recurringCosts: 0,
  paybackTargetMonths: 12,
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

interface KaizenResult {
  valid: boolean;
  errorMsg: string;
  laborSavings: number;
  overtimeSavings: number;
  qualitySavings: number;
  inventorySavings: number;
  spaceSavings: number;
  grossSavings: number;
  netSavings: number;
  annualHoursSaved: number;
  paybackMonths: number;
  firstYearNet: number;
  roiPct: number;
  paybackVerdict: string;
  paybackColor: string;
  meetsTarget: boolean;
  breakdown: BreakdownRow[];
}

function calculateKaizen(input: KaizenInputs): KaizenResult {
  const blank = (errorMsg: string): KaizenResult => ({
    valid: false,
    errorMsg,
    laborSavings: 0,
    overtimeSavings: 0,
    qualitySavings: 0,
    inventorySavings: 0,
    spaceSavings: 0,
    grossSavings: 0,
    netSavings: 0,
    annualHoursSaved: 0,
    paybackMonths: 0,
    firstYearNet: 0,
    roiPct: 0,
    paybackVerdict: "",
    paybackColor: "text-muted-foreground",
    meetsTarget: false,
    breakdown: [],
  });

  const nums = [
    input.hoursSavedPerWeek,
    input.laborRate,
    input.qualityCostBefore,
    input.eventCost,
    input.workingWeeks,
    input.overtimeHoursPerWeek,
    input.overtimePremium,
    input.qualityReductionPct,
    input.inventoryReduction,
    input.carryingRatePct,
    input.spaceReleased,
    input.spaceRate,
    input.recurringCosts,
    input.paybackTargetMonths,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to total the savings.");
  if (input.hoursSavedPerWeek < 0 || input.overtimeHoursPerWeek < 0) return blank("Saved hours cannot be negative.");
  if (input.laborRate <= 0) return blank("The labor rate must be greater than zero.");
  if (input.workingWeeks <= 0 || input.workingWeeks > 52) return blank("Working weeks should be between 1 and 52.");
  if (input.overtimePremium < 1) return blank("The overtime premium cannot be below 1.0.");
  if (input.qualityReductionPct < 0 || input.qualityReductionPct > 100) {
    return blank("The quality cost reduction should be between 0% and 100%.");
  }
  if (input.carryingRatePct < 0 || input.carryingRatePct > 100) {
    return blank("The inventory carrying rate should be between 0% and 100%.");
  }
  const nonNegative = [
    input.qualityCostBefore,
    input.eventCost,
    input.inventoryReduction,
    input.spaceReleased,
    input.spaceRate,
    input.recurringCosts,
    input.paybackTargetMonths,
  ];
  if (nonNegative.some((v) => v < 0)) return blank("Costs, values and the payback target cannot be negative.");
  if (input.eventCost <= 0) return blank("The kaizen event cost must be greater than zero for a payback figure.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const laborSavings = input.hoursSavedPerWeek * input.workingWeeks * input.laborRate;
  const overtimeSavings =
    input.overtimeHoursPerWeek * input.workingWeeks * input.laborRate * (input.overtimePremium - 1);
  const qualitySavings = input.qualityCostBefore * (input.qualityReductionPct / 100);
  const inventorySavings = input.inventoryReduction * (input.carryingRatePct / 100);
  const spaceSavings = input.spaceReleased * input.spaceRate;

  const grossSavings = laborSavings + overtimeSavings + qualitySavings + inventorySavings + spaceSavings;
  const netSavings = grossSavings - input.recurringCosts;

  const annualHoursSaved = input.hoursSavedPerWeek * input.workingWeeks + input.overtimeHoursPerWeek * input.workingWeeks;
  const paybackMonths = netSavings > 0 ? (input.eventCost / netSavings) * 12 : Infinity;
  const firstYearNet = netSavings - input.eventCost;
  const roiPct = input.eventCost > 0 ? (netSavings / input.eventCost) * 100 : 0;

  const meetsTarget = Number.isFinite(paybackMonths) && paybackMonths <= input.paybackTargetMonths;
  const paybackVerdict = !Number.isFinite(paybackMonths)
    ? "The event never pays back at these figures"
    : meetsTarget
      ? `Pays back inside the ${fmt(input.paybackTargetMonths, 0)}-month target`
      : `Pays back after the ${fmt(input.paybackTargetMonths, 0)}-month target`;
  const paybackColor = !Number.isFinite(paybackMonths) ? "text-red-600" : meetsTarget ? "text-emerald-600" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    {
      label: `Labour saved · ${fmt(annualHoursSaved, 0)} h/yr at ${money(input.laborRate, 2)}/h`,
      value: money(laborSavings, d),
    },
    {
      label: `Overtime avoided · ${fmt(input.overtimeHoursPerWeek, 1)} h/wk at ×${fmt(input.overtimePremium, 2)}`,
      value: money(overtimeSavings, d),
    },
    {
      label: `Scrap & rework reduction · ${fmt(input.qualityReductionPct, 0)}% of ${money(input.qualityCostBefore, 0)}`,
      value: money(qualitySavings, d),
    },
    {
      label: `Inventory carrying cost · ${fmt(input.carryingRatePct, 0)}% of ${money(input.inventoryReduction, 0)} released`,
      value: money(inventorySavings, d),
    },
    {
      label: `Floor space released · ${fmt(input.spaceReleased, 0)} ft² at ${money(input.spaceRate, 2)}/ft²`,
      value: money(spaceSavings, d),
    },
    { label: "Gross annual savings", value: money(grossSavings, d), highlight: true },
    { label: "Added recurring annual costs", value: `−${money(input.recurringCosts, d)}` },
    { label: "Net annual savings", value: money(netSavings, d), highlight: true },
    { label: "One-off kaizen event cost", value: money(input.eventCost, d) },
    {
      label: "Payback period",
      value: Number.isFinite(paybackMonths) ? `${fmt(paybackMonths, 1)} months` : "never",
    },
  ];

  return {
    valid: true,
    errorMsg: "",
    laborSavings,
    overtimeSavings,
    qualitySavings,
    inventorySavings,
    spaceSavings,
    grossSavings,
    netSavings,
    annualHoursSaved,
    paybackMonths,
    firstYearNet,
    roiPct,
    paybackVerdict,
    paybackColor,
    meetsTarget,
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

export default function KaizenEventSavingsCalculator() {
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState(String(DEFAULTS.hoursSavedPerWeek));
  const [laborRate, setLaborRate] = useState(String(DEFAULTS.laborRate));
  const [qualityCostBefore, setQualityCostBefore] = useState(String(DEFAULTS.qualityCostBefore));
  const [eventCost, setEventCost] = useState(String(DEFAULTS.eventCost));
  const [workingWeeks, setWorkingWeeks] = useState(String(DEFAULTS.workingWeeks));
  const [overtimeHoursPerWeek, setOvertimeHoursPerWeek] = useState(String(DEFAULTS.overtimeHoursPerWeek));
  const [overtimePremium, setOvertimePremium] = useState(String(DEFAULTS.overtimePremium));
  const [qualityReductionPct, setQualityReductionPct] = useState(String(DEFAULTS.qualityReductionPct));
  const [inventoryReduction, setInventoryReduction] = useState(String(DEFAULTS.inventoryReduction));
  const [carryingRatePct, setCarryingRatePct] = useState(String(DEFAULTS.carryingRatePct));
  const [spaceReleased, setSpaceReleased] = useState(String(DEFAULTS.spaceReleased));
  const [spaceRate, setSpaceRate] = useState(String(DEFAULTS.spaceRate));
  const [recurringCosts, setRecurringCosts] = useState(String(DEFAULTS.recurringCosts));
  const [paybackTargetMonths, setPaybackTargetMonths] = useState(String(DEFAULTS.paybackTargetMonths));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): KaizenInputs => ({
    hoursSavedPerWeek: parseFloat(hoursSavedPerWeek) || 0,
    laborRate: parseFloat(laborRate) || 0,
    qualityCostBefore: parseFloat(qualityCostBefore) || 0,
    eventCost: parseFloat(eventCost) || 0,
    workingWeeks: parseFloat(workingWeeks) || 0,
    overtimeHoursPerWeek: parseFloat(overtimeHoursPerWeek) || 0,
    overtimePremium: parseFloat(overtimePremium) || 1,
    qualityReductionPct: parseFloat(qualityReductionPct) || 0,
    inventoryReduction: parseFloat(inventoryReduction) || 0,
    carryingRatePct: parseFloat(carryingRatePct) || 0,
    spaceReleased: parseFloat(spaceReleased) || 0,
    spaceRate: parseFloat(spaceRate) || 0,
    recurringCosts: parseFloat(recurringCosts) || 0,
    paybackTargetMonths: parseFloat(paybackTargetMonths) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<KaizenInputs>(() => DEFAULTS);
  const [results, setResults] = useState<KaizenResult>(() => calculateKaizen(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateKaizen(inputs));
  };

  const reset = () => {
    setHoursSavedPerWeek(String(DEFAULTS.hoursSavedPerWeek));
    setLaborRate(String(DEFAULTS.laborRate));
    setQualityCostBefore(String(DEFAULTS.qualityCostBefore));
    setEventCost(String(DEFAULTS.eventCost));
    setWorkingWeeks(String(DEFAULTS.workingWeeks));
    setOvertimeHoursPerWeek(String(DEFAULTS.overtimeHoursPerWeek));
    setOvertimePremium(String(DEFAULTS.overtimePremium));
    setQualityReductionPct(String(DEFAULTS.qualityReductionPct));
    setInventoryReduction(String(DEFAULTS.inventoryReduction));
    setCarryingRatePct(String(DEFAULTS.carryingRatePct));
    setSpaceReleased(String(DEFAULTS.spaceReleased));
    setSpaceRate(String(DEFAULTS.spaceRate));
    setRecurringCosts(String(DEFAULTS.recurringCosts));
    setPaybackTargetMonths(String(DEFAULTS.paybackTargetMonths));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateKaizen(DEFAULTS));
  };

  const hoursNum = parseFloat(hoursSavedPerWeek);
  const rateNum = parseFloat(laborRate);
  const qualityNum = parseFloat(qualityCostBefore);
  const eventNum = parseFloat(eventCost);
  const errors = {
    hoursSavedPerWeek: !Number.isFinite(hoursNum) || hoursNum < 0 ? "Cannot be negative" : "",
    laborRate: !Number.isFinite(rateNum) || rateNum <= 0 ? "Must be greater than zero" : "",
    qualityCostBefore: !Number.isFinite(qualityNum) || qualityNum < 0 ? "Cannot be negative" : "",
    eventCost: !Number.isFinite(eventNum) || eventNum <= 0 ? "Must be greater than zero" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What counts as savings from a kaizen event?",
      answer:
        "Anything the improvement permanently removes from the cost base: labour hours released from a process, overtime no longer worked, scrap and rework that stops happening, inventory that frees up cash, floor space that can be used for something else, and avoided expediting or warranty costs. A saving only counts if it is recurring and measurable — a one-off clean-up is not a saving.",
    },
    {
      question: "Which labour rate should I use?",
      answer:
        "Use the fully burdened rate: base wage plus payroll taxes, benefits, shift premiums and supervision overhead, which is typically 1.25 to 1.5 times the base wage. Using the bare wage overstates payback, because the released hours do not release the payroll taxes and benefits that come with them unless the headcount actually changes.",
    },
    {
      question: "How is inventory reduction valued?",
      answer:
        "Inventory does not save its full value when it drops — the cash is released once, while the recurring saving is the carrying cost no longer incurred: capital cost, storage, insurance, obsolescence and handling, commonly estimated at 20 to 30 percent of inventory value per year. The calculator applies that annual rate rather than counting the whole reduction as a yearly gain.",
    },
    {
      question: "What payback period makes a kaizen event worthwhile?",
      answer:
        "Most manufacturing kaizen events are expected to pay back within six to twelve months, and events that need longer usually mean the scope was too broad for a one-week workshop. A short payback is also the strongest argument for the next event, so track the actual result after the event against what was projected here rather than treating the projection as the outcome.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Kaizen Event Savings Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Kaizen Event Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Event & Labour">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="hours-saved"
                  label="Weekly Hours Saved"
                  value={hoursSavedPerWeek}
                  onChange={setHoursSavedPerWeek}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  suffix="h/wk"
                  error={errors.hoursSavedPerWeek}
                  tooltip="Labour hours the new standard work removes each week."
                />
                <CompactInput
                  id="labor-rate"
                  label="Burdened Labour Rate"
                  value={laborRate}
                  onChange={setLaborRate}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  prefix="$"
                  suffix="/h"
                  error={errors.laborRate}
                  hint="Wage plus taxes, benefits and supervision overhead."
                  tooltip="Fully burdened hourly cost of the labour released."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="quality-cost"
                  label="Annual Scrap & Rework Cost"
                  value={qualityCostBefore}
                  onChange={setQualityCostBefore}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  prefix="$"
                  error={errors.qualityCostBefore}
                  tooltip="Current yearly cost of defects, scrap and rework in the area."
                />
                <CompactInput
                  id="event-cost"
                  label="Kaizen Event Cost"
                  value={eventCost}
                  onChange={setEventCost}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  prefix="$"
                  error={errors.eventCost}
                  hint="Facilitation, training, materials and lost production."
                  tooltip="One-off cost of running the event."
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
                  <SubSection title="Productivity & Quality">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="working-weeks"
                        label="Working Weeks"
                        value={workingWeeks}
                        onChange={setWorkingWeeks}
                        onEnter={runCalculate}
                        min="1"
                        max="52"
                        step="1"
                        tooltip="Production weeks per year used to annualise the hour savings."
                      />
                      <CompactInput
                        id="overtime-hours"
                        label="Overtime Saved"
                        value={overtimeHoursPerWeek}
                        onChange={setOvertimeHoursPerWeek}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="h/wk"
                        tooltip="Overtime hours no longer worked after the event."
                      />
                      <CompactInput
                        id="overtime-premium"
                        label="Overtime Premium"
                        value={overtimePremium}
                        onChange={setOvertimePremium}
                        onEnter={runCalculate}
                        min="1"
                        step="0.05"
                        suffix="×"
                        tooltip="Premium multiplier paid for overtime; 1.5 is typical."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="quality-reduction"
                        label="Quality Cost Reduction"
                        value={qualityReductionPct}
                        onChange={setQualityReductionPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%"
                        tooltip="Share of the scrap and rework cost the new standard removes."
                      />
                      <CompactInput
                        id="recurring-costs"
                        label="Added Recurring Costs"
                        value={recurringCosts}
                        onChange={setRecurringCosts}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="New annual costs the countermeasure introduces, such as consumables."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Inventory, Space & Target">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="inventory-reduction"
                        label="Inventory Released"
                        value={inventoryReduction}
                        onChange={setInventoryReduction}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="Value of inventory taken out of the process."
                      />
                      <CompactInput
                        id="carrying-rate"
                        label="Carrying Cost Rate"
                        value={carryingRatePct}
                        onChange={setCarryingRatePct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%/yr"
                        tooltip="Annual cost of holding inventory; 20–30% is a common planning figure."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <CompactInput
                        id="space-released"
                        label="Space Released"
                        value={spaceReleased}
                        onChange={setSpaceReleased}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="ft²"
                        tooltip="Floor area freed by the change."
                      />
                      <CompactInput
                        id="space-rate"
                        label="Space Cost"
                        value={spaceRate}
                        onChange={setSpaceRate}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/ft²"
                        tooltip="Annual cost per square foot of floor space."
                      />
                      <CompactInput
                        id="payback-target"
                        label="Payback Target"
                        value={paybackTargetMonths}
                        onChange={setPaybackTargetMonths}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        suffix="months"
                        tooltip="The payback the event is expected to beat."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="kaizen-decimals"
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Net Annual Savings</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.netSavings, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${money(calcInputs.eventCost, calcInputs.decimals)} event cost recovered in ${Number.isFinite(results.paybackMonths) ? `${fmt(results.paybackMonths, 1)} months` : "no finite period"}`
                  : "Fix the highlighted inputs to see the savings"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payback</span>
                <span className={`font-extrabold ${results.paybackColor}`}>
                  {results.valid
                    ? Number.isFinite(results.paybackMonths)
                      ? `${fmt(results.paybackMonths, 1)} mo`
                      : "never"
                    : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">First-Year Net</span>
                <span className={`font-extrabold ${results.firstYearNet >= 0 ? "text-foreground" : "text-red-600"}`}>
                  {results.valid ? money(results.firstYearNet, calcInputs.decimals) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROI</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.roiPct, 0)}%` : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Savings Line</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Annual</th>
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
                        Enter the event details to see the savings build-up.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Net annual savings</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(results.netSavings, calcInputs.decimals)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual hours released</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.annualHoursSaved, 0)} h` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Labour savings</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.laborSavings, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overtime savings</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.overtimeSavings, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Quality savings</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.qualitySavings, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Inventory carrying</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.inventorySavings, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Space savings</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.spaceSavings, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross annual savings</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.grossSavings, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Recurring costs added</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(calcInputs.recurringCosts, calcInputs.decimals) : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 ${results.paybackColor}`}>{results.paybackVerdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Kaizen Event Savings Calculator?</h2>
            <p>
              A kaizen event savings calculator turns the improvements agreed in a focused improvement workshop into annual
              figures: labour hours released, overtime avoided, scrap and rework reduced, inventory carrying cost removed and floor
              space freed. It then compares the recurring saving against the one-off cost of running the event and reports the
              payback period in months.
            </p>
            <p>
              The reason to quantify rather than estimate is that event costs are real and immediate while savings accrue slowly and
              are easy to overstate. A workshop that ties up a cross-functional team for a week, stops a line for two days and buys
              new fixtures has a genuine bill. That bill is only justified by improvements that persist after the team returns to
              its day jobs, so the arithmetic needs to reflect what the new standard work actually removes.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Labour savings come from weekly hours released multiplied by working weeks and the fully burdened hourly rate — base
              wage plus payroll taxes, benefits, shift premiums and supervision. Overtime is handled separately, because the saving
              is the premium rather than the whole wage: an hour of overtime at time-and-a-half releases half an hour of cost if the
              headcount does not change, which is exactly what the premium field captures.
            </p>
            <p>
              Quality savings apply the expected reduction to the current annual cost of scrap, rework, sorting and containment.
              Inventory is treated differently on purpose: releasing twenty-five thousand dollars of inventory returns cash once, but
              the recurring saving is the carrying cost avoided — typically twenty to thirty percent per year once capital, storage,
              insurance, handling and obsolescence are counted. Floor space is valued at an annual cost per square foot, which is
              only a real saving if the space is genuinely used for something else or given up.
            </p>
            <p>
              The total of those lines is the gross annual saving. Added recurring costs — new consumables, extra fixtures, a
              consumable grease or a software licence — are subtracted to give the net annual saving, which is the figure that pays
              back the event. Payback in months equals the event cost divided by the net annual saving, multiplied by twelve, and the
              first-year net benefit subtracts the event cost from a full year of savings so the cash position at twelve months is
              visible.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the net annual saving, with the payback period in the subtext. The three-stat bar adds the payback
              in months — colour-coded against the target you set — the first-year net benefit and the return on the event cost.
            </p>
            <p>
              The breakdown table lists each savings line with the rate and multiplier behind it, subtotals the gross saving,
              subtracts recurring costs, and finishes with the payback period. The summary panel breaks out the annual hours
              released and each savings category so the largest contributor is obvious at a glance.
            </p>
            <p>
              Two cautions are worth carrying into the event report. First, labour savings only become cash when the hours are
              redeployed or removed — otherwise they are capacity, which is still valuable but should be described that way.
              Second, keep the projection and the actual result side by side after sixty and ninety days. Events whose savings are
              never measured tend to be over-credited, and the credibility of the next event depends on how honestly this one was
              reported.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/kaizen-event-savings-calculator" />
          <PopularCalculators exclude="/calculator/kaizen-event-savings-calculator" />
        </div>
      </div>
    </>
  );
}
