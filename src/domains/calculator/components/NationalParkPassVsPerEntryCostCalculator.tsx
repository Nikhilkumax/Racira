"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type FeeBasis = "vehicle" | "person";

interface ParkInputs {
  visitsPerYear: number;
  entryFee: number;
  passPrice: number;
  feeBasis: FeeBasis;
  peoplePerVisit: number;
  parkingFee: number;
  reservationFee: number;
  passDiscountPct: number;
  validityMonths: number;
  decimals: number;
}

const DEFAULTS: ParkInputs = {
  visitsPerYear: 4,
  entryFee: 35,
  passPrice: 80,
  feeBasis: "vehicle",
  peoplePerVisit: 2,
  parkingFee: 0,
  reservationFee: 2,
  passDiscountPct: 0,
  validityMonths: 12,
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

interface ParkResult {
  valid: boolean;
  errorMsg: string;
  perVisitEntry: number;
  perVisitExtras: number;
  perVisitTotal: number;
  perEntryAnnual: number;
  netPassPrice: number;
  coveredVisits: number;
  uncoveredVisits: number;
  uncoveredCost: number;
  passAnnual: number;
  savings: number;
  breakEvenVisits: number;
  beyondBreakEven: number;
  cheaper: "pass" | "entry";
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculatePark(input: ParkInputs): ParkResult {
  const blank = (errorMsg: string): ParkResult => ({
    valid: false,
    errorMsg,
    perVisitEntry: 0,
    perVisitExtras: 0,
    perVisitTotal: 0,
    perEntryAnnual: 0,
    netPassPrice: 0,
    coveredVisits: 0,
    uncoveredVisits: 0,
    uncoveredCost: 0,
    passAnnual: 0,
    savings: 0,
    breakEvenVisits: 0,
    beyondBreakEven: 0,
    cheaper: "entry",
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.visitsPerYear,
    input.entryFee,
    input.passPrice,
    input.peoplePerVisit,
    input.parkingFee,
    input.reservationFee,
    input.passDiscountPct,
    input.validityMonths,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to compare the two options.");
  if (input.visitsPerYear < 0) return blank("Visits per year cannot be negative.");
  if (input.visitsPerYear > 366) return blank("Visits per year should be 366 or fewer.");
  if (input.entryFee < 0 || input.passPrice < 0) return blank("Fees and pass prices cannot be negative.");
  if (input.peoplePerVisit < 1 || input.peoplePerVisit > 12) return blank("People per visit should be between 1 and 12.");
  if (input.parkingFee < 0 || input.reservationFee < 0) return blank("Parking and reservation fees cannot be negative.");
  if (input.passDiscountPct < 0 || input.passDiscountPct > 100) return blank("Pass discount should be between 0% and 100%.");
  if (input.validityMonths <= 0 || input.validityMonths > 12) return blank("Pass validity should be between 1 and 12 months.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const perVisitEntry = input.feeBasis === "person" ? input.entryFee * input.peoplePerVisit : input.entryFee;
  const perVisitExtras = input.parkingFee + input.reservationFee;
  const perVisitTotal = perVisitEntry + perVisitExtras;
  const perEntryAnnual = perVisitTotal * input.visitsPerYear;

  const netPassPrice = input.passPrice * (1 - input.passDiscountPct / 100);
  const coveredVisits = input.visitsPerYear * (input.validityMonths / 12);
  const uncoveredVisits = Math.max(0, input.visitsPerYear - coveredVisits);
  const uncoveredCost = uncoveredVisits * perVisitTotal;
  const passAnnual = netPassPrice + uncoveredCost;

  const savings = perEntryAnnual - passAnnual;
  const breakEvenVisits = perVisitTotal > 0 ? netPassPrice / perVisitTotal : 0;
  const beyondBreakEven = input.visitsPerYear - breakEvenVisits;
  const cheaper: "pass" | "entry" = savings > 0 ? "pass" : "entry";

  const verdict =
    savings > 0
      ? `The annual pass is ${money(savings, d)} cheaper across ${fmt(input.visitsPerYear, 0)} visits`
      : savings === 0
        ? "Both options cost the same at this number of visits"
        : `Paying per entry is ${money(Math.abs(savings), d)} cheaper — the pass needs ${fmt(breakEvenVisits, 1)} visits to break even`;
  const verdictColor = savings > 0 ? "text-emerald-600" : savings < 0 ? "text-orange-600" : "text-muted-foreground";

  const breakdown: BreakdownRow[] = [
    {
      label: `Entry fee per visit (${input.feeBasis === "person" ? `per person × ${fmt(input.peoplePerVisit, 0)}` : "per vehicle"})`,
      value: money(perVisitEntry, d),
    },
    { label: "Parking and reservation fees per visit", value: money(perVisitExtras, d) },
    { label: "Total cost per entry", value: money(perVisitTotal, d), highlight: true },
    { label: `Cost of ${fmt(input.visitsPerYear, 0)} per-entry visits a year`, value: money(perEntryAnnual, d), highlight: true },
    { label: "Annual pass price", value: money(input.passPrice, d) },
    { label: `Discount applied (${fmt(input.passDiscountPct, 1)}%)`, value: `−${money(input.passPrice - netPassPrice, d)}` },
    { label: "Net pass cost", value: money(netPassPrice, d) },
    { label: `Visits covered by a ${fmt(input.validityMonths, 0)}-month pass`, value: fmt(coveredVisits, 1) },
    { label: "Visits outside the pass period", value: `${fmt(uncoveredVisits, 1)} costing ${money(uncoveredCost, d)}` },
    { label: "Total annual cost with the pass", value: money(passAnnual, d), highlight: true },
    { label: "Break-even number of visits", value: `${fmt(breakEvenVisits, 1)} visits` },
    { label: "Visits above or below break-even", value: `${beyondBreakEven >= 0 ? "+" : ""}${fmt(beyondBreakEven, 1)}` },
  ];

  return {
    valid: true,
    errorMsg: "",
    perVisitEntry,
    perVisitExtras,
    perVisitTotal,
    perEntryAnnual,
    netPassPrice,
    coveredVisits,
    uncoveredVisits,
    uncoveredCost,
    passAnnual,
    savings,
    breakEvenVisits,
    beyondBreakEven,
    cheaper,
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

export default function NationalParkPassVsPerEntryCostCalculator() {
  const [visitsPerYear, setVisitsPerYear] = useState(String(DEFAULTS.visitsPerYear));
  const [entryFee, setEntryFee] = useState(String(DEFAULTS.entryFee));
  const [passPrice, setPassPrice] = useState(String(DEFAULTS.passPrice));
  const [feeBasis, setFeeBasis] = useState<string>(DEFAULTS.feeBasis);
  const [peoplePerVisit, setPeoplePerVisit] = useState(String(DEFAULTS.peoplePerVisit));
  const [parkingFee, setParkingFee] = useState(String(DEFAULTS.parkingFee));
  const [reservationFee, setReservationFee] = useState(String(DEFAULTS.reservationFee));
  const [passDiscountPct, setPassDiscountPct] = useState(String(DEFAULTS.passDiscountPct));
  const [validityMonths, setValidityMonths] = useState(String(DEFAULTS.validityMonths));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ParkInputs => ({
    visitsPerYear: parseFloat(visitsPerYear) || 0,
    entryFee: parseFloat(entryFee) || 0,
    passPrice: parseFloat(passPrice) || 0,
    feeBasis: feeBasis as FeeBasis,
    peoplePerVisit: parseFloat(peoplePerVisit) || 1,
    parkingFee: parseFloat(parkingFee) || 0,
    reservationFee: parseFloat(reservationFee) || 0,
    passDiscountPct: parseFloat(passDiscountPct) || 0,
    validityMonths: parseFloat(validityMonths) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<ParkInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ParkResult>(() => calculatePark(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculatePark(inputs));
  };

  const reset = () => {
    setVisitsPerYear(String(DEFAULTS.visitsPerYear));
    setEntryFee(String(DEFAULTS.entryFee));
    setPassPrice(String(DEFAULTS.passPrice));
    setFeeBasis(DEFAULTS.feeBasis);
    setPeoplePerVisit(String(DEFAULTS.peoplePerVisit));
    setParkingFee(String(DEFAULTS.parkingFee));
    setReservationFee(String(DEFAULTS.reservationFee));
    setPassDiscountPct(String(DEFAULTS.passDiscountPct));
    setValidityMonths(String(DEFAULTS.validityMonths));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculatePark(DEFAULTS));
  };

  const visitsNum = parseFloat(visitsPerYear);
  const feeNum = parseFloat(entryFee);
  const passNum = parseFloat(passPrice);
  const validityNum = parseFloat(validityMonths);

  const errors = {
    visitsPerYear: !Number.isFinite(visitsNum) || visitsNum < 0 ? "Cannot be negative" : "",
    entryFee: !Number.isFinite(feeNum) || feeNum < 0 ? "Cannot be negative" : "",
    passPrice: !Number.isFinite(passNum) || passNum < 0 ? "Cannot be negative" : "",
    validityMonths: !Number.isFinite(validityNum) || validityNum <= 0 || validityNum > 12 ? "Use 1–12 months" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How many visits make an annual pass worthwhile?",
      answer:
        "Divide the pass price by the total cost of one entry, including reservation and parking fees. At a thirty-five dollar vehicle fee and an eighty dollar pass, that is fewer than three visits, so a pass pays for itself on the third trip. High-fee parks such as those charging per person shift the break-even even lower, which is why families visiting two or three times a year almost always come out ahead with a pass.",
    },
    {
      question: "Does the pass cover everyone in the vehicle?",
      answer:
        "The standard annual pass admits the pass holder and the passengers in a single private vehicle at parks that charge per vehicle, and the pass holder plus three adults at parks that charge per person. That is why the calculator asks for the fee basis and the number of people travelling: at a per-person park a party of four multiplies the per-entry cost by four, which changes the break-even point sharply.",
    },
    {
      question: "What about discounted passes?",
      answer:
        "Senior, access, military and volunteer passes exist at much lower prices, and some are free. Entering the discounted price you actually qualify for, or a hundred percent discount for a free pass, gives a comparison that reflects your real cost rather than the standard rate. The calculator does not assume eligibility; it uses whatever price you enter.",
    },
    {
      question: "Do reservation and parking fees count towards the comparison?",
      answer:
        "They are charged whether you hold a pass or not, so they add to both options and shift the break-even point upward in favour of the pass. A two-dollar reservation fee on every visit turns four visits into eight dollars of unavoidable cost, which raises the number of visits needed before the pass price is recovered. Because these fees vary by park and season, they are inputs rather than built-in constants.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "National Park Pass vs Per-Entry Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          National Park Pass vs Per-Entry Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Visits & Fees">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="visits"
                  label="Park Visits per Year"
                  value={visitsPerYear}
                  onChange={setVisitsPerYear}
                  onEnter={runCalculate}
                  min="0"
                  max="366"
                  step="1"
                  error={errors.visitsPerYear}
                  tooltip="How many times you expect to enter a fee-charging park this year."
                />
                <CompactInput
                  id="entry-fee"
                  label="Entry Fee per Visit"
                  value={entryFee}
                  onChange={setEntryFee}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  prefix="$"
                  error={errors.entryFee}
                  hint="A seven-day vehicle pass counts as one visit."
                  tooltip="The fee charged at the gate."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="pass-price"
                  label="Annual Pass Price"
                  value={passPrice}
                  onChange={setPassPrice}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  prefix="$"
                  error={errors.passPrice}
                  tooltip="Standard or discounted price of the annual pass you would buy."
                />
                <CompactSelect
                  id="fee-basis"
                  label="Fee Basis"
                  value={feeBasis}
                  onChange={setFeeBasis}
                  options={[
                    { value: "vehicle", label: "Per vehicle" },
                    { value: "person", label: "Per person" },
                  ]}
                  tooltip="Per-person parks multiply the fee by the party size."
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
                  <SubSection title="Party & Extra Fees">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="people"
                        label="People per Visit"
                        value={peoplePerVisit}
                        onChange={setPeoplePerVisit}
                        onEnter={runCalculate}
                        min="1"
                        max="12"
                        step="1"
                        tooltip="Used when the park charges per person."
                      />
                      <CompactInput
                        id="parking"
                        label="Parking per Visit"
                        value={parkingFee}
                        onChange={setParkingFee}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="Charged on top of entry, with or without a pass."
                      />
                      <CompactInput
                        id="reservation"
                        label="Reservation per Visit"
                        value={reservationFee}
                        onChange={setReservationFee}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="Timed-entry or booking fee charged per visit."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Pass Administration">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="discount"
                        label="Pass Discount"
                        value={passDiscountPct}
                        onChange={setPassDiscountPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%"
                        hint="Use 100% for a free senior, access or military pass."
                        tooltip="Discount you qualify for on the pass price."
                      />
                      <CompactInput
                        id="validity"
                        label="Pass Validity"
                        value={validityMonths}
                        onChange={setValidityMonths}
                        onEnter={runCalculate}
                        min="1"
                        max="12"
                        step="1"
                        suffix="months"
                        error={errors.validityMonths}
                        tooltip="Visits outside the pass period are still charged."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                {results.valid && results.savings < 0 ? "Extra Cost of the Pass" : "Annual Pass Savings"}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(Math.abs(results.savings), calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${money(results.passAnnual, calcInputs.decimals)} with the pass versus ${money(results.perEntryAnnual, calcInputs.decimals)} paying at the gate`
                  : "Fix the highlighted inputs to compare the two options"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per-Entry Total</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? money(results.perEntryAnnual, 0) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pass Total</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.passAnnual, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Break-Even</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.breakEvenVisits, 1)} visits` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Line</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Amount</th>
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
                        Enter your visit pattern to see the comparison.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">
                        {results.cheaper === "pass" ? "Pass saves" : "Per-entry saves"}
                      </td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(Math.abs(results.savings), calcInputs.decimals)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Visits planned</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(calcInputs.visitsPerYear, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per entry</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.perVisitTotal, 2) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net pass price</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.netPassPrice, 2) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Visits covered by pass</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.coveredVisits, 1) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cheapest option</span>
                  <span className={`text-base font-bold ${results.verdictColor}`}>
                    {results.valid ? (results.cheaper === "pass" ? "Annual pass" : "Paying per entry") : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Visits beyond break-even</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.beyondBreakEven, 1) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra fees per visit</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.perVisitExtras, 2) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Pass validity</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.validityMonths, 0)} months` : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a National Park Pass vs Per-Entry Cost Calculator?</h2>
            <p>
              A national park pass versus per-entry cost calculator tells you whether an annual pass or paying at the gate costs less
              for the trips you actually plan to take. It totals the gate fees, any per-person charges, parking, and reservation or
              timed-entry fees, compares them with the pass price after any discount you qualify for, and reports the number of visits
              needed to break even.
            </p>
            <p>
              The decision looks trivial and is not. Fee structures differ between parks — some charge per vehicle, some per person,
              some only in peak season — and reservation fees have quietly become part of the cost of a visit. A family of four at a
              per-person park pays several times what a single driver pays at a per-vehicle park, and that changes the arithmetic
              entirely.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The cost of one entry is the gate fee, multiplied by the party size when the park charges per person, plus any parking or
              reservation fee that applies whether or not you hold a pass. Multiplying that by the number of visits gives the
              per-entry annual cost. The pass side of the comparison starts from the pass price, applies any discount — the senior,
              access, military and volunteer passes exist at much lower prices, and some are free — and adds the entry cost of any
              visits that fall outside the pass validity period.
            </p>
            <p>
              Break-even is the pass price divided by the cost of a single entry. At a thirty-five dollar vehicle fee and an eighty
              dollar pass with no other fees, the third visit puts you ahead. Add a two-dollar reservation fee and the break-even falls
              slightly, because that fee is part of every entry you avoid. Enter a hundred percent discount for a free pass and the
              break-even drops to zero, which is the honest answer for anyone who qualifies.
            </p>
            <p>
              The comparison also handles a pass bought part-way through the year. A twelve-month pass is assumed to cover the whole
              year's visits, while a shorter validity covers only that fraction, and the remaining visits are charged at the gate. That
              matters for anyone buying a pass in autumn for a year that starts with a spring trip.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the saving from the cheaper option, or the extra cost if the pass loses at your visit count. The
              three-stat bar shows the two annual totals side by side with the break-even number of visits, which is usually the single
              most useful figure in the whole comparison.
            </p>
            <p>
              The breakdown table lists the entry fee per visit with its basis, the extra fees, the per-entry annual total, the pass
              price with any discount, the visits the pass covers and any visits it does not, and the two annual totals. The summary
              panel reports the cost per entry, the net pass price, the cheapest option and how far your visit count sits above or below
              break-even.
            </p>
            <p>
              Keep the trip plan honest. Passes reward repeat visits, so they only win if the trips actually happen; a pass bought for
              good intentions is the most expensive option of all. Fees also change between seasons and years, so check the current
              published rates for the parks you intend to visit, use the discounted price you genuinely qualify for, and remember that
              some parks charge nothing at all — which makes the pass purely a convenience rather than a saving.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/national-park-pass-vs-per-entry-cost-calculator" />
          <PopularCalculators exclude="/calculator/national-park-pass-vs-per-entry-cost-calculator" />
        </div>
      </div>
    </>
  );
}
