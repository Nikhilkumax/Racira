"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ShippingInputs {
  declaredValue: number;
  carrier: string;
  destination: string;
  shipmentType: string;
  annualShipments: number;
}

const DEFAULTS: ShippingInputs = {
  declaredValue: 500,
  carrier: "usps",
  destination: "domestic",
  shipmentType: "standard",
  annualShipments: 120,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const CARRIERS: Record<string, { label: string; ratePer100: number; freeCoverage: number }> = {
  usps: { label: "USPS", ratePer100: 1.65, freeCoverage: 100 },
  fedex_ups: { label: "FedEx / UPS", ratePer100: 1.5, freeCoverage: 100 },
  third_party: { label: "Third-party insurer", ratePer100: 0.8, freeCoverage: 0 },
};

interface CarrierRow {
  key: string;
  label: string;
  ratePer100: number;
  freeCoverage: number;
  chargeableValue: number;
  units: number;
  cost: number;
  cheapest: boolean;
  selected: boolean;
}

interface ShippingResult {
  ratePer100: number;
  freeCoverage: number;
  chargeableValue: number;
  units: number;
  estimatedCost: number;
  annualCost: number;
  protectionPct: number;
  costPerThousand: number;
  minimumApplied: boolean;
  rows: CarrierRow[];
  cheapestLabel: string;
  savingsVsCheapest: number;
  valid: boolean;
  errorMsg: string;
}

function rateFor(carrier: string, destination: string, shipmentType: string): number {
  const base = (CARRIERS[carrier] || CARRIERS.usps).ratePer100;
  let rate = base;
  if (destination === "international") rate *= 1.5;
  if (shipmentType === "fragile") rate *= 1.25;
  return rate;
}

function costFor(value: number, carrier: string, destination: string, shipmentType: string) {
  const config = CARRIERS[carrier] || CARRIERS.usps;
  const rate = rateFor(carrier, destination, shipmentType);
  const chargeable = Math.max(0, value - config.freeCoverage);
  const units = Math.ceil(chargeable / 100);
  let cost = units * rate;
  const raw = cost;
  if (chargeable > 0 && cost < 1.5) cost = 1.5;
  return { chargeable, units, cost, minimumApplied: chargeable > 0 && raw < 1.5 };
}

function computeShipping(i: ShippingInputs): ShippingResult {
  const invalid =
    i.declaredValue <= 0 || !CARRIERS[i.carrier] || i.annualShipments < 0;
  const selected = CARRIERS[i.carrier] || CARRIERS.usps;
  const main = costFor(i.declaredValue, i.carrier, i.destination, i.shipmentType);

  const rawRows = Object.entries(CARRIERS).map(([key, cfg]) => {
    const r = costFor(i.declaredValue, key, i.destination, i.shipmentType);
    return {
      key,
      label: cfg.label,
      ratePer100: rateFor(key, i.destination, i.shipmentType),
      freeCoverage: cfg.freeCoverage,
      chargeableValue: r.chargeable,
      units: r.units,
      cost: r.cost,
      cheapest: false,
      selected: key === i.carrier,
    };
  });
  const cheapestCost = Math.min(...rawRows.map((r) => r.cost));
  const rows = rawRows.map((r) => ({ ...r, cheapest: r.cost === cheapestCost }));
  const cheapestLabel = rows.find((r) => r.cheapest)?.label || "";

  return {
    ratePer100: main.units > 0 ? main.cost / main.units : 0,
    freeCoverage: selected.freeCoverage,
    chargeableValue: main.chargeable,
    units: main.units,
    estimatedCost: main.cost,
    annualCost: main.cost * i.annualShipments,
    protectionPct: i.declaredValue > 0 ? (main.cost / i.declaredValue) * 100 : 0,
    costPerThousand: i.declaredValue > 0 ? (main.cost / i.declaredValue) * 1000 : 0,
    minimumApplied: main.minimumApplied,
    rows,
    cheapestLabel,
    savingsVsCheapest: Math.max(0, main.cost - cheapestCost),
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a declared value above zero, a non-negative annual shipment count, and a valid carrier selection."
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
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
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

export default function ShippingInsuranceCostCalculator() {
  const [declaredValue, setDeclaredValue] = useState(String(DEFAULTS.declaredValue));
  const [carrier, setCarrier] = useState(DEFAULTS.carrier);
  const [destination, setDestination] = useState(DEFAULTS.destination);
  const [shipmentType, setShipmentType] = useState(DEFAULTS.shipmentType);
  const [annualShipments, setAnnualShipments] = useState(String(DEFAULTS.annualShipments));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ShippingInputs => ({
    declaredValue: parseFloat(declaredValue) || 0,
    carrier,
    destination,
    shipmentType,
    annualShipments: parseFloat(annualShipments) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ShippingInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ShippingResult>(() => computeShipping(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeShipping(inputs));
  };

  const reset = () => {
    setDeclaredValue(String(DEFAULTS.declaredValue));
    setCarrier(DEFAULTS.carrier);
    setDestination(DEFAULTS.destination);
    setShipmentType(DEFAULTS.shipmentType);
    setAnnualShipments(String(DEFAULTS.annualShipments));
    setCalcInputs(DEFAULTS);
    setResults(computeShipping(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is declared-value shipping insurance priced?",
      answer:
        "Carriers and insurers charge a rate per hundred dollars of insured value, applied to every full or partial hundred above the coverage included with the service. A parcel worth eight hundred dollars sent with a one hundred dollar included limit is insured on seven hundred dollars, which at a rate of 1.65 per hundred costs about eleven dollars and fifty-five cents.",
    },
    {
      question: "Is the carrier's included coverage enough?",
      answer:
        "Rarely. Included limits are typically one hundred dollars, and some services exclude it entirely. For anything you cannot afford to replace out of pocket, declared value is the difference between a claim and a write-off. The calculator shows both the included limit and the chargeable portion so the gap is explicit.",
    },
    {
      question: "Why are third-party insurers cheaper?",
      answer:
        "Third-party insurers buy coverage in bulk and price on the aggregate loss experience of their book, so their per-hundred rate is often roughly half the carrier rate but with no included coverage and a separate claims process. The trade-off is convenience and claim handling rather than coverage itself, which is why the comparison table is worth reading before defaulting to the carrier you ship with.",
    },
    {
      question: "Does shipping insurance cover everything?",
      answer:
        "No. Damage caused by poor packaging, prohibited items, and losses from confiscation or ordinary wear are standard exclusions, and fragile goods usually need additional packing standards met before a claim is paid. Insurance protects against loss and damage in transit, not against a parcel that was never packed well enough to survive the trip.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Business", href: "/calculator#business" },
          { label: "Shipping Insurance Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Shipping Insurance Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Declared Value">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="declared-value"
                  label="Declared Value"
                  value={declaredValue}
                  onChange={setDeclaredValue}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The insured value of the shipment, typically the retail replacement value."
                />
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] text-muted-foreground">
                    Carriers limit liability by default, so the declared value is what a claim is measured against.
                  </span>
                </div>
              </div>
            </SubSection>

            <SubSection title="Service & Route">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="carrier"
                  label="Carrier"
                  value={carrier}
                  onChange={setCarrier}
                  options={[
                    { value: "usps", label: "USPS" },
                    { value: "fedex_ups", label: "FedEx / UPS" },
                    { value: "third_party", label: "Third-party" },
                  ]}
                  tooltip="Carrier included coverage and rate per hundred dollars."
                />
                <CompactSelect
                  id="destination"
                  label="Destination"
                  value={destination}
                  onChange={setDestination}
                  options={[
                    { value: "domestic", label: "Domestic" },
                    { value: "international", label: "International" },
                  ]}
                  tooltip="International transit carries a rate surcharge."
                />
              </div>
              <div className="mt-3">
                <CompactSelect
                  id="shipment-type"
                  label="Shipment Type"
                  value={shipmentType}
                  onChange={setShipmentType}
                  options={[
                    { value: "standard", label: "Standard goods" },
                    { value: "fragile", label: "Fragile goods" },
                  ]}
                  tooltip="Fragile declarations carry a higher rate because claims are more frequent."
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
                  <SubSection title="Annual Volume">
                    <CompactInput
                      id="annual-shipments"
                      label="Shipments Per Year"
                      value={annualShipments}
                      onChange={setAnnualShipments}
                      onEnter={runCalculate}
                      min="0"
                      tooltip="Used to project the annual insurance spend at this declared value."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Estimated Insurance Premium
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.estimatedCost, 2)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`${fmt(results.protectionPct, 2)}% of declared value, on ${fmt(results.units, 0)} charged unit(s) of $100`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Chargeable Value</span>
                <span className="font-extrabold text-foreground">${fmt(results.chargeableValue, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rate per $100</span>
                <span className="font-extrabold text-foreground">${fmt(results.ratePer100, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.annualCost, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Premium Line</th>
                    <th className="p-2.5 text-right w-[140px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[160px]">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Declared value</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.declaredValue, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">insured amount</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Carrier included coverage</td>
                    <td className="p-2.5 text-right text-emerald-600">-${fmt(results.freeCoverage, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">free limit</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Chargeable value</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.chargeableValue, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.units, 0)} units of $100</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Rate applied</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.ratePer100, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">per $100 or fraction</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Minimum premium</td>
                    <td className="p-2.5 text-right text-foreground">$1.50</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.minimumApplied ? "applied" : "not triggered"}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Premium per shipment</td>
                    <td className="p-2.5 text-right text-emerald-600">${fmt(results.estimatedCost, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.costPerThousand, 2)} per $1,000 insured</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CARRIER COMPARISON */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Provider</th>
                    <th className="p-2.5 text-right w-[120px]">Included</th>
                    <th className="p-2.5 text-right w-[110px]">Rate</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((r) => (
                    <tr key={r.key} className={r.selected ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {r.label}
                        {r.selected ? " (selected)" : r.cheapest ? " (cheapest)" : ""}
                      </td>
                      <td className="p-2.5 text-right text-foreground">${fmt(r.freeCoverage, 0)}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(r.ratePer100, 2)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">${fmt(r.cost, 2)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Carrier</span>
                  <span className="text-base font-bold text-foreground">
                    {(CARRIERS[calcInputs.carrier] || CARRIERS.usps).label}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Route & Type</span>
                  <span className="text-base font-bold text-foreground">
                    {calcInputs.destination === "international" ? "International" : "Domestic"} / {calcInputs.shipmentType}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual Shipments</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.annualShipments, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual Insurance Spend</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.annualCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cheapest Option</span>
                  <span className="text-base font-bold text-emerald-600">{results.cheapestLabel || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Savings vs Cheapest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.savingsVsCheapest, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Shipping Insurance Cost Calculator?</h2>
            <p>
              A shipping insurance cost calculator converts a declared value into the premium you pay to protect a parcel
              in transit. The mechanics are straightforward: each carrier or insurer sets a rate per hundred dollars of
              insured value, applies it to the value above whatever coverage is included with the service, and rounds up to
              whole hundreds. That arithmetic produces the figure that appears on the label or invoice.
            </p>
            <p>
              The reason to run it before shipping is that the same parcel can cost three different amounts depending on
              who insures it. Carrier coverage is bundled and convenient but priced accordingly, while third-party insurers
              work at roughly half the rate with no included limit and a separate claims process. Seeing the numbers side
              by side turns a habit into a decision.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator starts from your declared value and subtracts the free coverage included with the chosen
              service, which is typically one hundred dollars for major carriers and zero for a third-party policy. The
              remaining chargeable value is divided into units of one hundred dollars, rounded up, and multiplied by the
              applicable rate. International destinations multiply the rate by one and a half, and a fragile declaration
              adds a further quarter on top.
            </p>
            <p>
              A minimum premium applies once anything is chargeable, so a small declared value still costs about a dollar
              and fifty to insure. The calculator also runs the same shipment through every provider option, which is what
              the comparison table shows, and projects the premium across your annual shipment count so the figure can be
              judged against the value of the goods rather than in isolation.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the premium with the protection cost as a percentage of declared value. The
              three-stat bar shows the chargeable value, the effective rate per hundred and the annual spend, while the
              premium table walks through the included coverage, the units billed and the final cost.
            </p>
            <p>
              Read the protection percentage first. Paying well under one percent of value to insure a shipment is cheap
              peace of mind; paying several percent means the carrier considers the route or the packing risky, and that
              signal is worth acting on by improving the packaging rather than simply buying more coverage. The annual
              figure matters too, because a business shipping hundreds of parcels is making a recurring purchase that
              deserves the same scrutiny as any other insurance line.
            </p>
            <p>
              Finally, remember what insurance does and does not do. It shifts the financial cost of loss or damage to the
              insurer, but it cannot recover a customer relationship, a one-of-a-kind item or the time spent filing a
              claim. Pack to the standard the insurer requires, keep the receipt that proves the declared value, and treat
              the premium as the price of a fallback rather than a substitute for care. It also helps to compare the annual
              premium with the expected loss on the same volume of shipments: if the goods are robust, the packaging is
              proven and the value is modest, self-insuring a portion of the volume is a legitimate business decision,
              while for fragile or high-value goods the premium is almost always the cheaper option.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/shipping-insurance-cost-calculator" />
          <PopularCalculators exclude="/calculator/shipping-insurance-cost-calculator" />
        </div>
      </div>
    </>
  );
}
