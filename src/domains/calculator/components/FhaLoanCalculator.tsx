"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FhaInputs {
  price: number;
  downPct: number;
  rate: number;
  termYears: number;
  upfrontMipPct: number;
  annualMipPct: number;
  propertyTaxPct: number;
  homeInsAnnual: number;
  hoaMonthly: number;
  decimals: number;
}

const DEFAULTS: FhaInputs = {
  price: 350000,
  downPct: 3.5,
  rate: 6.5,
  termYears: 30,
  upfrontMipPct: 1.75,
  annualMipPct: 0.55,
  propertyTaxPct: 1.2,
  homeInsAnnual: 1200,
  hoaMonthly: 0,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const money = (v: number, d = 0) => (Number.isFinite(v) ? "$" + fmt(v, d) : "—");

const TERM_OPTIONS = [
  { value: "15", label: "15-year fixed" },
  { value: "20", label: "20-year fixed" },
  { value: "30", label: "30-year fixed" },
];

const DECIMAL_OPTIONS = [
  { value: "0", label: "Whole dollars" },
  { value: "2", label: "2 decimals" },
];

/** Standard amortising payment. */
function paymentFor(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r <= 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

interface FhaResult {
  valid: boolean;
  errorMsg: string;
  downPayment: number;
  baseLoan: number;
  upfrontMip: number;
  totalLoan: number;
  monthlyPI: number;
  monthlyMip: number;
  monthlyTaxes: number;
  monthlyIns: number;
  monthlyTotal: number;
  totalMipPaid: number;
  totalInterest: number;
  totalCost: number;
  paymentAfterMipEnds: number;
  mipEndsMonth: number;
  ltvAtClose: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateFha(i: FhaInputs): FhaResult {
  const blank = (errorMsg: string): FhaResult => ({
    valid: false,
    errorMsg,
    downPayment: 0,
    baseLoan: 0,
    upfrontMip: 0,
    totalLoan: 0,
    monthlyPI: 0,
    monthlyMip: 0,
    monthlyTaxes: 0,
    monthlyIns: 0,
    monthlyTotal: 0,
    totalMipPaid: 0,
    totalInterest: 0,
    totalCost: 0,
    paymentAfterMipEnds: 0,
    mipEndsMonth: 0,
    ltvAtClose: 0,
    breakdown: [],
  });

  const nums = [i.price, i.downPct, i.rate, i.termYears, i.upfrontMipPct, i.annualMipPct, i.propertyTaxPct, i.homeInsAnnual, i.hoaMonthly, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field.");
  if (i.price < 50000 || i.price > 3000000) return blank("Home price should be between $50,000 and $3,000,000.");
  if (i.downPct < 3.5 || i.downPct > 100) return blank("FHA down payments start at 3.5% — enter 3.5 or more.");
  if (i.rate <= 0 || i.rate > 20) return blank("Rate should be between 0.1% and 20%.");
  if (i.termYears < 5 || i.termYears > 40) return blank("Term should be between 5 and 40 years.");
  if (i.upfrontMipPct < 0 || i.upfrontMipPct > 5) return blank("Upfront MIP should be between 0% and 5%.");
  if (i.annualMipPct < 0 || i.annualMipPct > 2) return blank("Annual MIP should be between 0% and 2%.");
  if (i.propertyTaxPct < 0 || i.propertyTaxPct > 5) return blank("Property tax rate should be between 0% and 5%.");
  if (i.homeInsAnnual < 0 || i.hoaMonthly < 0) return blank("Insurance and HOA costs cannot be negative.");

  const months = Math.round(i.termYears * 12);
  const downPayment = i.price * (i.downPct / 100);
  const baseLoan = i.price - downPayment;
  const upfrontMip = baseLoan * (i.upfrontMipPct / 100);
  const totalLoan = baseLoan + upfrontMip;

  const monthlyPI = paymentFor(totalLoan, i.rate, months);
  // Annual MIP is charged on the average outstanding balance; the standard
  // first-year approximation applies it to the base loan amount.
  const monthlyMip = baseLoan * (i.annualMipPct / 100) / 12;
  const monthlyTaxes = i.price * (i.propertyTaxPct / 100) / 12;
  const monthlyIns = i.homeInsAnnual / 12;
  const monthlyTotal = monthlyPI + monthlyMip + monthlyTaxes + monthlyIns + i.hoaMonthly;

  // With less than 10% down, annual MIP runs for the life of the loan; with 10%
  // or more down it ends after 132 months (11 years) of mortgage insurance.
  const mipEndsMonth = i.downPct >= 10 ? Math.min(132, months) : months;
  const totalMipPaid = monthlyMip * mipEndsMonth;
  const paymentAfterMipEnds = monthlyTotal - monthlyMip;

  const totalInterest = monthlyPI * months - totalLoan;
  const totalCost = downPayment + upfrontMip + monthlyTotal * months - monthlyMip * Math.max(0, months - mipEndsMonth);
  const ltvAtClose = (totalLoan / i.price) * 100;

  const d = Math.max(0, Math.min(2, i.decimals));
  const breakdown = [
    { label: "Home price", value: money(i.price, d) },
    { label: `Down payment (${fmt(i.downPct, 1)}%)`, value: "−" + money(downPayment, d) },
    { label: "Base loan amount", value: money(baseLoan, d) },
    { label: `Upfront MIP (${fmt(i.upfrontMipPct, 2)}%, financed)`, value: money(upfrontMip, d) },
    { label: "Total loan amount", value: money(totalLoan, d), highlight: true },
    { label: "Loan-to-value at closing", value: `${fmt(ltvAtClose, 1)}%` },
    { label: `Principal & interest at ${fmt(i.rate, 3)}%`, value: money(monthlyPI, 2) },
    { label: `Annual MIP (${fmt(i.annualMipPct, 2)}%)`, value: money(monthlyMip, 2) },
    { label: `Property taxes (${fmt(i.propertyTaxPct, 2)}%/yr)`, value: money(monthlyTaxes, 2) },
    { label: "Homeowners insurance", value: money(monthlyIns, 2) },
    ...(i.hoaMonthly > 0 ? [{ label: "HOA dues", value: money(i.hoaMonthly, 2) }] : []),
    { label: "Total monthly payment", value: money(monthlyTotal, 2), highlight: true },
    {
      label: i.downPct >= 10 ? "MIP ends after 11 years (10%+ down)" : "MIP runs for the life of the loan (under 10% down)",
      value: i.downPct >= 10 ? `${money(paymentAfterMipEnds, 2)}/mo from month ${fmt(mipEndsMonth + 1, 0)}` : `paid all ${fmt(months, 0)} months`,
    },
    { label: `MIP paid over the loan (${fmt(mipEndsMonth, 0)} months)`, value: money(totalMipPaid, d) },
    { label: "Total interest over the term", value: money(totalInterest, d), highlight: true },
    { label: "Total cost of the home", value: money(totalCost, d), highlight: true },
  ];

  return {
    valid: true,
    errorMsg: "",
    downPayment,
    baseLoan,
    upfrontMip,
    totalLoan,
    monthlyPI,
    monthlyMip,
    monthlyTaxes,
    monthlyIns,
    monthlyTotal,
    totalMipPaid,
    totalInterest,
    totalCost,
    paymentAfterMipEnds,
    mipEndsMonth,
    ltvAtClose,
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

export default function FhaLoanCalculator() {
  const [price, setPrice] = useState(String(DEFAULTS.price));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [upfrontMipPct, setUpfrontMipPct] = useState(String(DEFAULTS.upfrontMipPct));
  const [annualMipPct, setAnnualMipPct] = useState(String(DEFAULTS.annualMipPct));
  const [propertyTaxPct, setPropertyTaxPct] = useState(String(DEFAULTS.propertyTaxPct));
  const [homeInsAnnual, setHomeInsAnnual] = useState(String(DEFAULTS.homeInsAnnual));
  const [hoaMonthly, setHoaMonthly] = useState(String(DEFAULTS.hoaMonthly));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FhaInputs => ({
    price: parseFloat(price) || 0,
    downPct: parseFloat(downPct) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
    upfrontMipPct: parseFloat(upfrontMipPct) || 0,
    annualMipPct: parseFloat(annualMipPct) || 0,
    propertyTaxPct: parseFloat(propertyTaxPct) || 0,
    homeInsAnnual: parseFloat(homeInsAnnual) || 0,
    hoaMonthly: parseFloat(hoaMonthly) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<FhaInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FhaResult>(() => calculateFha(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateFha(inputs));
  };

  const reset = () => {
    setPrice(String(DEFAULTS.price));
    setDownPct(String(DEFAULTS.downPct));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setUpfrontMipPct(String(DEFAULTS.upfrontMipPct));
    setAnnualMipPct(String(DEFAULTS.annualMipPct));
    setPropertyTaxPct(String(DEFAULTS.propertyTaxPct));
    setHomeInsAnnual(String(DEFAULTS.homeInsAnnual));
    setHoaMonthly(String(DEFAULTS.hoaMonthly));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateFha(DEFAULTS));
  };

  const priceNum = parseFloat(price);
  const downNum = parseFloat(downPct);
  const rateNum = parseFloat(rate);

  const errors = {
    price: !Number.isFinite(priceNum) || priceNum < 50000 ? "Enter $50,000 or more" : "",
    downPct: !Number.isFinite(downNum) || downNum < 3.5 ? "FHA minimum is 3.5%" : "",
    rate: !Number.isFinite(rateNum) || rateNum <= 0 || rateNum > 20 ? "Enter 0.1–20%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const d = Math.max(0, Math.min(2, calcInputs.decimals || 0));

  const faqs = [
    {
      question: "What is an FHA loan?",
      answer:
        "An FHA loan is a mortgage insured by the Federal Housing Administration, a government agency. It exists to widen access to homeownership: qualified borrowers can put down as little as 3.5% and credit standards are more forgiving than conventional loans, with scores from 580 typically accepted at that down payment level. The insurance that protects the lender is paid by the borrower as MIP — an upfront premium rolled into the loan and an annual premium paid monthly.",
    },
    {
      question: "What are the two FHA insurance premiums?",
      answer:
        "The Upfront MIP is 1.75% of the base loan, charged at closing and almost always financed rather than paid in cash — so a $337,750 base loan adds about $5,911 to the balance. The Annual MIP is charged yearly on the outstanding balance and collected in twelve monthly installments; the standard rate is 0.55% for typical down payments. Unlike conventional PMI, which cancels automatically at 20% equity, FHA annual MIP has its own rules — that difference is what this calculator prices explicitly.",
    },
    {
      question: "Does FHA mortgage insurance ever go away?",
      answer:
        "It depends on your down payment. If you put down less than 10%, the annual MIP runs for the entire life of the loan and the only way out is to refinance into a conventional loan once you have enough equity. If you put down 10% or more, the annual MIP ends after 11 years of mortgage insurance payments. The calculator applies that rule automatically: watch the MIP line in the breakdown table as you move the down payment across the 10% threshold.",
    },
    {
      question: "How does an FHA loan compare to a conventional loan?",
      answer:
        "FHA wins on accessibility — a 3.5% down payment and softer credit requirements — but usually loses on cost for strong borrowers, because the annual MIP never falls off automatically with a small down payment and the upfront premium inflates the balance from day one. A conventional loan at 5% down with PMI is often cheaper within a few years, once PMI cancels and the FHA MIP keeps running. The honest test is to price both on the same home: the FHA total cost includes insurance the conventional comparison sheds after cancellation.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "FHA Loan Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">FHA Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Home & Down Payment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="price"
                  label="Home Price"
                  value={price}
                  onChange={setPrice}
                  onEnter={runCalculate}
                  min="50000"
                  max="3000000"
                  step="5000"
                  prefix="$"
                  error={errors.price}
                  hint="Purchase price, not appraised value."
                  tooltip="Contract price of the home being purchased or refinanced."
                />
                <CompactInput
                  id="down"
                  label="Down Payment"
                  value={downPct}
                  onChange={setDownPct}
                  onEnter={runCalculate}
                  min="3.5"
                  max="100"
                  step="0.5"
                  suffix="%"
                  error={errors.downPct}
                  hint="FHA minimum is 3.5%."
                  tooltip="Down payment as a percentage of the price. Below 10% down, annual MIP lasts for the life of the loan."
                />
              </div>
            </SubSection>

            <SubSection title="Loan Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  min="0.1"
                  max="20"
                  step="0.125"
                  suffix="%"
                  error={errors.rate}
                  tooltip="Annual percentage rate quoted by the lender."
                />
                <CompactSelect
                  id="term"
                  label="Term"
                  value={termYears}
                  onChange={setTermYears}
                  options={TERM_OPTIONS}
                  tooltip="Most FHA loans are 30-year fixed."
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
                  <SubSection title="FHA Insurance Premiums">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="ufmip"
                        label="Upfront MIP"
                        value={upfrontMipPct}
                        onChange={setUpfrontMipPct}
                        onEnter={runCalculate}
                        min="0"
                        max="5"
                        step="0.05"
                        suffix="%"
                        hint="Current rate 1.75%."
                        tooltip="Upfront mortgage insurance premium as a percentage of the base loan, financed into the balance."
                      />
                      <CompactInput
                        id="amip"
                        label="Annual MIP"
                        value={annualMipPct}
                        onChange={setAnnualMipPct}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="0.05"
                        suffix="%"
                        hint="Typically 0.55%."
                        tooltip="Annual mortgage insurance premium; 0.55% for most down payments, lower above 5% down on 15-year terms."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Escrow & Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax"
                        label="Property Tax"
                        value={propertyTaxPct}
                        onChange={setPropertyTaxPct}
                        onEnter={runCalculate}
                        min="0"
                        max="5"
                        step="0.05"
                        suffix="%/yr"
                        tooltip="Annual property tax as a percentage of the home price."
                      />
                      <CompactInput
                        id="ins"
                        label="Home Insurance"
                        value={homeInsAnnual}
                        onChange={setHomeInsAnnual}
                        onEnter={runCalculate}
                        min="0"
                        step="100"
                        prefix="$"
                        suffix="/yr"
                        tooltip="Annual homeowners insurance premium."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="hoa"
                        label="HOA Dues"
                        value={hoaMonthly}
                        onChange={setHoaMonthly}
                        onEnter={runCalculate}
                        min="0"
                        step="10"
                        prefix="$"
                        suffix="/mo"
                        tooltip="Monthly homeowners association dues, if any."
                      />
                      <CompactSelect
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        options={DECIMAL_OPTIONS}
                        tooltip="Decimal places shown on money figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Monthly Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.monthlyTotal, 2) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `P&I ${money(results.monthlyPI, 0)} + MIP ${money(results.monthlyMip, 0)} + taxes ${money(results.monthlyTaxes, 0)} + insurance ${money(results.monthlyIns, 0)}${calcInputs.hoaMonthly > 0 ? ` + HOA ${money(calcInputs.hoaMonthly, 0)}` : ""}`
                  : "Fix the highlighted inputs to price the FHA loan"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Loan</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.totalLoan, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly MIP</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.monthlyMip, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.totalInterest, 0) : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Loan Item</th>
                    <th className="p-2.5 pr-3 text-right w-[230px]">Amount</th>
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
                        Enter the price, down payment and rate to build the FHA estimate.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">MIP over the life of the loan</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${money(results.totalMipPaid, d)} · LTV at close ${fmt(results.ltvAtClose, 1)}%`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Down payment</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.downPayment, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Upfront MIP (financed)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.upfrontMip, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Base loan amount</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.baseLoan, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total loan amount</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.totalLoan, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Principal & interest</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.monthlyPI, 2) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly MIP</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.monthlyMip, 2) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total interest over term</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.totalInterest, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total cost of the home</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.totalCost, d) : "—"}</span>
                </div>
              </div>
              {results.valid && (
                <p className="text-[11px] mt-3 font-semibold text-muted-foreground">
                  {calcInputs.downPct >= 10
                    ? `With 10%+ down, annual MIP ends after 11 years — the payment drops to ${money(results.paymentAfterMipEnds, 2)} from month ${fmt(results.mipEndsMonth + 1, 0)}.`
                    : "With under 10% down, annual MIP runs for the life of the loan — refinancing to conventional is the usual exit."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an FHA Loan Calculator?</h2>
            <p>
              An FHA loan calculator estimates the true monthly payment and total cost of a mortgage insured by the Federal Housing
              Administration. It exists to answer the question ordinary payment calculators get wrong: an FHA loan carries two insurance
              premiums that a conventional quote does not — an upfront premium financed into the loan balance, and an annual premium
              collected monthly — and ignoring either one understates the payment by a meaningful margin on exactly the loan FHA buyers
              actually take.
            </p>
            <p>
              The calculator prices the whole structure: base loan after the down payment, the upfront MIP rolled in, principal and
              interest on that larger balance, monthly MIP, property taxes, homeowners insurance and HOA dues. The result is the payment a
              lender will actually collect, not the payment an advertisement implies.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The base loan is the home price minus the down payment — 3.5% minimum for qualified borrowers. The upfront MIP, currently
              1.75% of that base loan, is added to the balance rather than paid in cash, so on a $337,750 base loan the amount financed
              becomes roughly $343,660 and every month of interest is charged on the larger figure. Principal and interest follow from the
              standard amortising formula on that total.
            </p>
            <p>
              The annual MIP is charged on the outstanding balance and collected monthly; this calculator uses the standard first-year
              approximation of applying it to the base loan amount. The rule that matters most is tenure: with less than 10% down, annual
              MIP runs for the life of the loan, while 10% or more down ends it after eleven years. The calculator applies that rule
              automatically, so moving the down payment across the 10% line visibly changes both the total MIP paid and the payment that
              remains after it ends. Property taxes, insurance and HOA dues are annualised into the monthly figure the same way a lender's
              escrow analysis would.
            </p>
            <p>
              Total interest is the P&I payment across the term minus the amount financed; the total cost of the home adds the down
              payment, the upfront premium and every monthly payment including MIP. Because the financed MIP compounds for thirty years,
              the gap between base loan and total cost is where FHA loans quietly get expensive — a $5,900 premium becomes more than
              twice that by payoff.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the total monthly payment with every component itemised beneath it — P&I, MIP, taxes, insurance and HOA.
              The three-stat bar carries the total loan amount including the financed premium, the monthly MIP, and total interest over
              the term. The breakdown table walks from price to total cost and flags the MIP tenure rule that applies to your down
              payment, and the summary panel lists the premium, base and total loan figures side by side.
            </p>
            <p>
              Two comparisons are worth making before you sign. First, price the same home at 5% conventional with PMI: PMI cancels at
              20 to 22% equity while FHA MIP with a small down payment never does, so the conventional loan usually wins for strong-credit
              borrowers within a few years. Second, check the effect of stretching to 10% down — the MIP end-date rule can be worth five
              figures over the loan, which is often a better use of savings than a larger emergency fund earning 4%. FHA loans are a
              genuine tool for buyers who need the low barrier; the calculator's job is to show what that barrier actually costs.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fha-loan-calculator" />
          <PopularCalculators exclude="/calculator/fha-loan-calculator" />
        </div>
      </div>
    </>
  );
}
