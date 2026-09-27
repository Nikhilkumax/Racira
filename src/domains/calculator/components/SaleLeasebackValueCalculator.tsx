"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SlbInputs {
  propertyValue: number;
  annualRent: number;
  leaseTerm: number;
  taxRatePct: number;
  maintenanceAndInsurance: number;
  propertyTax: number;
  landValuePct: number;
  depreciationLife: number;
  appreciationPct: number;
  transactionCostPct: number;
  reinvestmentPct: number;
  discountRatePct: number;
  decimals: number;
}

const DEFAULTS: SlbInputs = {
  propertyValue: 2500000,
  annualRent: 200000,
  leaseTerm: 15,
  taxRatePct: 25,
  maintenanceAndInsurance: 60000,
  propertyTax: 30000,
  landValuePct: 20,
  depreciationLife: 39,
  appreciationPct: 3,
  transactionCostPct: 2,
  reinvestmentPct: 8,
  discountRatePct: 7,
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

interface SlbResult {
  valid: boolean;
  errorMsg: string;
  netProceeds: number;
  transactionCosts: number;
  depreciableBasis: number;
  annualDepreciation: number;
  depreciationShield: number;
  propertyTaxShield: number;
  afterTaxOwnCost: number;
  afterTaxRent: number;
  appreciationOpportunity: number;
  reinvestmentIncome: number;
  annualAdvantage: number;
  npvAdvantage: number;
  breakEvenRent: number;
  rentAsPctOfValue: number;
  capRatePct: number;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateSlb(input: SlbInputs): SlbResult {
  const blank = (errorMsg: string): SlbResult => ({
    valid: false,
    errorMsg,
    netProceeds: 0,
    transactionCosts: 0,
    depreciableBasis: 0,
    annualDepreciation: 0,
    depreciationShield: 0,
    propertyTaxShield: 0,
    afterTaxOwnCost: 0,
    afterTaxRent: 0,
    appreciationOpportunity: 0,
    reinvestmentIncome: 0,
    annualAdvantage: 0,
    npvAdvantage: 0,
    breakEvenRent: 0,
    rentAsPctOfValue: 0,
    capRatePct: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.propertyValue,
    input.annualRent,
    input.leaseTerm,
    input.taxRatePct,
    input.maintenanceAndInsurance,
    input.propertyTax,
    input.landValuePct,
    input.depreciationLife,
    input.appreciationPct,
    input.transactionCostPct,
    input.reinvestmentPct,
    input.discountRatePct,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to value the transaction.");
  if (input.propertyValue <= 0) return blank("Property value must be greater than zero.");
  if (input.annualRent < 0) return blank("Rent cannot be negative.");
  if (input.leaseTerm <= 0 || input.leaseTerm > 50) return blank("Lease term should be between 1 and 50 years.");
  if (input.taxRatePct < 0 || input.taxRatePct > 60) return blank("Tax rate should be between 0% and 60%.");
  if (input.landValuePct < 0 || input.landValuePct > 100) return blank("Land value share should be between 0% and 100%.");
  if (input.depreciationLife <= 0 || input.depreciationLife > 50) return blank("Depreciation life should be between 1 and 50 years.");
  if (input.transactionCostPct < 0 || input.transactionCostPct > 20) return blank("Transaction costs should be between 0% and 20%.");
  if (input.reinvestmentPct < 0 || input.discountRatePct < 0) return blank("Return and discount rates cannot be negative.");
  const nonNegative = [input.maintenanceAndInsurance, input.propertyTax, input.appreciationPct];
  if (nonNegative.some((v) => v < 0)) return blank("Ownership costs and appreciation cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const taxRate = input.taxRatePct / 100;

  const transactionCosts = input.propertyValue * (input.transactionCostPct / 100);
  const netProceeds = input.propertyValue - transactionCosts;

  // Only the building is depreciable, so the land share is excluded from basis.
  const depreciableBasis = input.propertyValue * (1 - input.landValuePct / 100);
  const annualDepreciation = depreciableBasis / input.depreciationLife;
  const depreciationShield = annualDepreciation * taxRate;
  const propertyTaxShield = input.propertyTax * taxRate;

  // Owning: out-of-pocket costs less the tax shields on depreciation and taxes.
  const afterTaxOwnCost =
    input.maintenanceAndInsurance + input.propertyTax - depreciationShield - propertyTaxShield;

  // Leasing: rent is fully deductible, so the after-tax cost is the rent net of tax.
  const afterTaxRent = input.annualRent * (1 - taxRate);

  // Selling also gives up appreciation and releases capital for reinvestment.
  const appreciationOpportunity = input.propertyValue * (input.appreciationPct / 100);
  const reinvestmentIncome = netProceeds * (input.reinvestmentPct / 100);

  const annualAdvantage = afterTaxOwnCost + appreciationOpportunity + reinvestmentIncome - afterTaxRent;

  const r = input.discountRatePct / 100;
  const annuityFactor =
    r > 0 ? (1 - Math.pow(1 + r, -input.leaseTerm)) / r : input.leaseTerm;
  const npvAdvantage = annualAdvantage * annuityFactor;

  const breakEvenRent =
    (afterTaxOwnCost + appreciationOpportunity + reinvestmentIncome) / (1 - taxRate);
  const rentAsPctOfValue = (input.annualRent / input.propertyValue) * 100;
  const capRatePct = rentAsPctOfValue;

  const verdict =
    annualAdvantage > 0
      ? `Sale-leaseback adds ${money(annualAdvantage, d)} a year while freeing ${money(netProceeds, d)} of capital`
      : `Keeping the property is better by ${money(Math.abs(annualAdvantage), d)} a year — rent exceeds the ownership cost plus the capital return`;
  const verdictColor = annualAdvantage > 0 ? "text-emerald-600" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    { label: "Property market value", value: money(input.propertyValue, d) },
    { label: `Transaction costs at ${fmt(input.transactionCostPct, 1)}%`, value: `−${money(transactionCosts, d)}` },
    { label: "Net sale proceeds released", value: money(netProceeds, d), highlight: true },
    { label: `Depreciable basis (${fmt(100 - input.landValuePct, 0)}% building)`, value: money(depreciableBasis, d) },
    { label: `Annual depreciation over ${fmt(input.depreciationLife, 0)} years`, value: money(annualDepreciation, d) },
    { label: `Tax shield on depreciation and property tax`, value: money(depreciationShield + propertyTaxShield, d) },
    {
      label: "After-tax cost of owning",
      value: money(afterTaxOwnCost, d),
      highlight: true,
    },
    { label: "Annual rent", value: money(input.annualRent, d) },
    { label: `After-tax cost of leasing · ${fmt(input.taxRatePct, 0)}% tax`, value: money(afterTaxRent, d), highlight: true },
    { label: `Appreciation given up at ${fmt(input.appreciationPct, 1)}%/yr`, value: money(appreciationOpportunity, d) },
    { label: `Return on released capital at ${fmt(input.reinvestmentPct, 1)}%`, value: money(reinvestmentIncome, d) },
    { label: "Annual advantage of sale-leaseback", value: money(annualAdvantage, d), highlight: true },
    {
      label: `Present value over ${fmt(input.leaseTerm, 0)} years at ${fmt(input.discountRatePct, 1)}%`,
      value: money(npvAdvantage, d),
    },
    { label: "Break-even annual rent", value: money(breakEvenRent, d) },
  ];

  return {
    valid: true,
    errorMsg: "",
    netProceeds,
    transactionCosts,
    depreciableBasis,
    annualDepreciation,
    depreciationShield,
    propertyTaxShield,
    afterTaxOwnCost,
    afterTaxRent,
    appreciationOpportunity,
    reinvestmentIncome,
    annualAdvantage,
    npvAdvantage,
    breakEvenRent,
    rentAsPctOfValue,
    capRatePct,
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

export default function SaleLeasebackValueCalculator() {
  const [propertyValue, setPropertyValue] = useState(String(DEFAULTS.propertyValue));
  const [annualRent, setAnnualRent] = useState(String(DEFAULTS.annualRent));
  const [leaseTerm, setLeaseTerm] = useState(String(DEFAULTS.leaseTerm));
  const [taxRatePct, setTaxRatePct] = useState(String(DEFAULTS.taxRatePct));
  const [maintenanceAndInsurance, setMaintenanceAndInsurance] = useState(String(DEFAULTS.maintenanceAndInsurance));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULTS.propertyTax));
  const [landValuePct, setLandValuePct] = useState(String(DEFAULTS.landValuePct));
  const [depreciationLife, setDepreciationLife] = useState(String(DEFAULTS.depreciationLife));
  const [appreciationPct, setAppreciationPct] = useState(String(DEFAULTS.appreciationPct));
  const [transactionCostPct, setTransactionCostPct] = useState(String(DEFAULTS.transactionCostPct));
  const [reinvestmentPct, setReinvestmentPct] = useState(String(DEFAULTS.reinvestmentPct));
  const [discountRatePct, setDiscountRatePct] = useState(String(DEFAULTS.discountRatePct));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SlbInputs => ({
    propertyValue: parseFloat(propertyValue) || 0,
    annualRent: parseFloat(annualRent) || 0,
    leaseTerm: parseFloat(leaseTerm) || 0,
    taxRatePct: parseFloat(taxRatePct) || 0,
    maintenanceAndInsurance: parseFloat(maintenanceAndInsurance) || 0,
    propertyTax: parseFloat(propertyTax) || 0,
    landValuePct: parseFloat(landValuePct) || 0,
    depreciationLife: parseFloat(depreciationLife) || 0,
    appreciationPct: parseFloat(appreciationPct) || 0,
    transactionCostPct: parseFloat(transactionCostPct) || 0,
    reinvestmentPct: parseFloat(reinvestmentPct) || 0,
    discountRatePct: parseFloat(discountRatePct) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<SlbInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SlbResult>(() => calculateSlb(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateSlb(inputs));
  };

  const reset = () => {
    setPropertyValue(String(DEFAULTS.propertyValue));
    setAnnualRent(String(DEFAULTS.annualRent));
    setLeaseTerm(String(DEFAULTS.leaseTerm));
    setTaxRatePct(String(DEFAULTS.taxRatePct));
    setMaintenanceAndInsurance(String(DEFAULTS.maintenanceAndInsurance));
    setPropertyTax(String(DEFAULTS.propertyTax));
    setLandValuePct(String(DEFAULTS.landValuePct));
    setDepreciationLife(String(DEFAULTS.depreciationLife));
    setAppreciationPct(String(DEFAULTS.appreciationPct));
    setTransactionCostPct(String(DEFAULTS.transactionCostPct));
    setReinvestmentPct(String(DEFAULTS.reinvestmentPct));
    setDiscountRatePct(String(DEFAULTS.discountRatePct));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateSlb(DEFAULTS));
  };

  const valueNum = parseFloat(propertyValue);
  const rentNum = parseFloat(annualRent);
  const termNum = parseFloat(leaseTerm);
  const taxNum = parseFloat(taxRatePct);

  const errors = {
    propertyValue: !Number.isFinite(valueNum) || valueNum <= 0 ? "Must be greater than zero" : "",
    annualRent: !Number.isFinite(rentNum) || rentNum < 0 ? "Cannot be negative" : "",
    leaseTerm: !Number.isFinite(termNum) || termNum <= 0 || termNum > 50 ? "Use 1–50 years" : "",
    taxRatePct: !Number.isFinite(taxNum) || taxNum < 0 || taxNum > 60 ? "Use 0–60%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is a sale-leaseback?",
      answer:
        "In a sale-leaseback the owner of a property sells it to an investor and simultaneously signs a long lease to keep using it. The company converts an illiquid asset into cash while retaining operational control, and the investor gains a tenant with a long lease and a predictable income stream. It is common in retail, industrial and logistics property and increasingly in corporate headquarters and data centres.",
    },
    {
      question: "How do I judge whether the rent is fair?",
      answer:
        "Compare the annual rent with the property's market value. A rent of two hundred thousand dollars on a two-and-a-half-million-dollar property is eight percent, which would be a high cap rate for most markets; four to seven percent is more typical. The break-even rent this calculator reports is the more useful test, because it accounts for the tax shields you give up and the return you expect on the released cash.",
    },
    {
      question: "What is given up by selling?",
      answer:
        "Three things: the depreciation tax shield on the building, the appreciation of the asset, and the flexibility to redevelop, expand or borrow against it later. The lease also creates a fixed obligation that appears in the accounts and affects borrowing covenants, which matters more to a leveraged business than the headline rent suggests. On the other side, the released capital can be reinvested in the operating business at a far higher return than property appreciation.",
    },
    {
      question: "How is the property taxed on sale?",
      answer:
        "That depends on jurisdiction and holding period. In the United States a sale of trade-or-business property triggers depreciation recapture at ordinary or twenty-five percent rates on prior deductions, plus capital gains on the remainder, and some structures can defer the gain. This calculator models the operating comparison and ignores the sale tax, because it varies too much to generalise — get a tax opinion on the specific structure before deciding.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Sale-Leaseback Value Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sale-Leaseback Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Property & Rent">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="property-value"
                  label="Property Market Value"
                  value={propertyValue}
                  onChange={setPropertyValue}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  prefix="$"
                  error={errors.propertyValue}
                  tooltip="Value the investor would pay for the property."
                />
                <CompactInput
                  id="annual-rent"
                  label="Annual Rent"
                  value={annualRent}
                  onChange={setAnnualRent}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  prefix="$"
                  error={errors.annualRent}
                  hint="$200,000 on $2.5m is an 8% cap rate."
                  tooltip="Rent payable under the leaseback."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="lease-term"
                  label="Lease Term"
                  value={leaseTerm}
                  onChange={setLeaseTerm}
                  onEnter={runCalculate}
                  min="1"
                  max="50"
                  step="1"
                  suffix="years"
                  error={errors.leaseTerm}
                  tooltip="Length of the leaseback used for the present-value comparison."
                />
                <CompactInput
                  id="tax-rate"
                  label="Tax Rate"
                  value={taxRatePct}
                  onChange={setTaxRatePct}
                  onEnter={runCalculate}
                  min="0"
                  max="60"
                  step="any"
                  suffix="%"
                  error={errors.taxRatePct}
                  tooltip="Effective rate applied to rent, depreciation and property tax."
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
                  <SubSection title="Costs of Owning">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="maintenance"
                        label="Maintenance & Insurance"
                        value={maintenanceAndInsurance}
                        onChange={setMaintenanceAndInsurance}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/yr"
                        tooltip="Running costs that leave with the property on sale."
                      />
                      <CompactInput
                        id="property-tax"
                        label="Property Tax"
                        value={propertyTax}
                        onChange={setPropertyTax}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/yr"
                        tooltip="Annual property tax, deductible against income."
                      />
                      <CompactInput
                        id="appreciation"
                        label="Appreciation"
                        value={appreciationPct}
                        onChange={setAppreciationPct}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="%/yr"
                        tooltip="Growth given up by selling, charged as an annual opportunity cost."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Depreciation & Sale Terms">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="land-value"
                        label="Land Value Share"
                        value={landValuePct}
                        onChange={setLandValuePct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%"
                        tooltip="Land is not depreciable, so it is excluded from the basis."
                      />
                      <CompactInput
                        id="depreciation-life"
                        label="Depreciation Life"
                        value={depreciationLife}
                        onChange={setDepreciationLife}
                        onEnter={runCalculate}
                        min="1"
                        max="50"
                        step="1"
                        suffix="years"
                        hint="39 years is standard for US non-residential property."
                        tooltip="Straight-line life used for the annual deduction."
                      />
                      <CompactInput
                        id="transaction-cost"
                        label="Transaction Costs"
                        value={transactionCostPct}
                        onChange={setTransactionCostPct}
                        onEnter={runCalculate}
                        min="0"
                        max="20"
                        step="any"
                        suffix="%"
                        tooltip="Broker, legal and closing costs taken out of the sale price."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <CompactInput
                        id="reinvestment"
                        label="Return on Cash"
                        value={reinvestmentPct}
                        onChange={setReinvestmentPct}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="%/yr"
                        tooltip="Return the business expects on the released capital."
                      />
                      <CompactInput
                        id="discount-rate"
                        label="Discount Rate"
                        value={discountRatePct}
                        onChange={setDiscountRatePct}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="%"
                        tooltip="Rate used to present-value the annual advantage."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Annual Advantage</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.annualAdvantage, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${money(results.afterTaxRent, 0)} after-tax rent against ${money(results.afterTaxOwnCost, 0)} after-tax ownership cost, with ${money(results.netProceeds, 0)} of capital released`
                  : "Fix the highlighted inputs to value the transaction"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Proceeds</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.netProceeds, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">After-Tax Rent</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.afterTaxRent, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cap Rate</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.capRatePct, 2)}%` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Comparison Line</th>
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
                        Enter the property and lease terms to see the comparison.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Annual advantage</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {money(results.annualAdvantage, calcInputs.decimals)}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Property value</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(calcInputs.propertyValue, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rent as % of value</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.rentAsPctOfValue, 2)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Transaction costs</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.transactionCosts, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual depreciation</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.annualDepreciation, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax shields given up</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.depreciationShield + results.propertyTaxShield, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Appreciation forgone</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.appreciationOpportunity, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Income on released cash</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.reinvestmentIncome, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-even rent</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.breakEvenRent, 0) : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Sale-Leaseback Value Calculator?</h2>
            <p>
              A sale-leaseback value calculator compares the cost of keeping a property with the cost of selling it and leasing it
              back. It values the released capital against the rent, adds back the tax shields and appreciation the owner gives up,
              compares the after-tax cost of each route and reports the annual advantage, the present value over the lease term and the
              rent at which the two options break even.
            </p>
            <p>
              Sale-leasebacks are popular because they turn an illiquid asset into cash without disrupting operations, but they are
              routinely justified by the proceeds alone. The proceeds are only worth something if the business can earn more on them
              than the property was earning, and the rent is a fixed obligation that lasts as long as the lease — often fifteen to
              twenty-five years for a corporate property.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The sale side starts with the property value and subtracts transaction costs — brokerage, legal and closing — to give the
              net proceeds actually released. Those proceeds are then credited with the return the business expects to earn on them,
              which is the central assumption of the whole decision. A distribution business that earns twenty percent on invested
              capital will justify a much higher rent than a company earning five percent.
            </p>
            <p>
              The ownership side adds maintenance, insurance and property tax, then subtracts the tax shields those costs and
              depreciation provide. Straight-line depreciation is taken over the building only, since land is not depreciable, so the
              basis is reduced by the land share and divided by the recovery period — thirty-nine years for non-residential property in
              the United States. Appreciation in the property is charged as an annual opportunity cost, because selling means giving
              that growth to the buyer.
            </p>
            <p>
              The lease side is simpler: rent is deductible, so the after-tax cost is the rent multiplied by one minus the tax rate. The
              difference between the after-tax ownership cost plus forgone appreciation plus income on the cash, and the after-tax rent,
              is the annual advantage. Because leases run for many years, that figure is also present-valued at the discount rate the
              business uses for capital decisions, and the break-even rent — the rent at which the annual advantage is zero — is
              reported so a proposed rent can be tested directly.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the annual advantage of the sale-leaseback, with the two after-tax costs and the released capital in
              the subtext. The three-stat bar shows net proceeds, after-tax rent and the implied cap rate, which is the quickest test of
              whether the rent is in line with the market value of the property.
            </p>
            <p>
              The breakdown table walks through the sale, the depreciation basis and shield, the after-tax cost of owning, the rent and
              its after-tax cost, the appreciation forgone, the income on released capital and the annual advantage, followed by its
              present value and the break-even rent. The summary panel reports the rent as a percentage of value, transaction costs, the
              tax shields given up and the break-even rent.
            </p>
            <p>
              Several things are deliberately outside this model: the tax on the sale itself, which varies widely by jurisdiction and
              holding period; the accounting treatment of the lease, which affects reported debt; covenant and credit-rating effects;
              and the strategic option value of owning land for future expansion. Treat the output as the operating comparison, then
              layer those considerations on top with an accountant and a property adviser before signing anything.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sale-leaseback-value-calculator" />
          <PopularCalculators exclude="/calculator/sale-leaseback-value-calculator" />
        </div>
      </div>
    </>
  );
}
