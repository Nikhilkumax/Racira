"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type FilingStatus = "single" | "married" | "head";

interface TaxInputs {
  grossIncome: number;
  withheld: number;
  filingStatus: FilingStatus;
  dependents: number;
  preTaxDeductions: number;
  itemizedDeductions: number;
  otherCredits: number;
  decimals: number;
}

const DEFAULTS: TaxInputs = {
  grossIncome: 75000,
  withheld: 10000,
  filingStatus: "single",
  dependents: 0,
  preTaxDeductions: 6000,
  itemizedDeductions: 12000,
  otherCredits: 0,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const money = (v: number, d = 0) => (Number.isFinite(v) ? "$" + fmt(v, d) : "—");

const STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "head", label: "Head of Household" },
];

const DECIMAL_OPTIONS = [
  { value: "0", label: "Whole dollars" },
  { value: "2", label: "2 decimals" },
];

interface TaxResult {
  valid: boolean;
  errorMsg: string;
  taxableIncome: number;
  taxLiability: number;
  totalCredits: number;
  netTax: number;
  refundAmount: number;
  isRefund: boolean;
  effectiveRate: number;
  marginalRate: number;
  standardDeduction: number;
  deductionUsed: number;
  isItemized: boolean;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

/** 2024 progressive brackets by filing status. */
function calculateTaxRefund(i: TaxInputs): TaxResult {
  const blank = (errorMsg: string): TaxResult => ({
    valid: false,
    errorMsg,
    taxableIncome: 0,
    taxLiability: 0,
    totalCredits: 0,
    netTax: 0,
    refundAmount: 0,
    isRefund: true,
    effectiveRate: 0,
    marginalRate: 0,
    standardDeduction: 0,
    deductionUsed: 0,
    isItemized: false,
    breakdown: [],
  });

  const nums = [i.grossIncome, i.withheld, i.dependents, i.preTaxDeductions, i.itemizedDeductions, i.otherCredits, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field.");
  if (i.grossIncome <= 0 || i.grossIncome > 10000000) return blank("Gross income should be between $1 and $10,000,000.");
  if (i.withheld < 0) return blank("Withheld tax cannot be negative.");
  if (i.preTaxDeductions < 0 || i.itemizedDeductions < 0 || i.otherCredits < 0)
    return blank("Deductions and credits cannot be negative.");
  if (i.preTaxDeductions > i.grossIncome) return blank("Pre-tax deductions cannot exceed gross income.");
  if (i.dependents < 0 || i.dependents > 12) return blank("Dependents should be between 0 and 12.");

  const standardDeduction =
    i.filingStatus === "married" ? 29200 : i.filingStatus === "head" ? 21900 : 14600;
  const deductionUsed = Math.max(standardDeduction, i.itemizedDeductions);
  const isItemized = i.itemizedDeductions > standardDeduction;

  const adjustedGrossIncome = Math.max(0, i.grossIncome - i.preTaxDeductions);
  const taxableIncome = Math.max(0, adjustedGrossIncome - deductionUsed);

  const singleBrackets = [
    { limit: 11600, rate: 0.1 }, { limit: 47150, rate: 0.12 }, { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 }, { limit: 243725, rate: 0.32 }, { limit: 609350, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];
  const marriedBrackets = [
    { limit: 23200, rate: 0.1 }, { limit: 94300, rate: 0.12 }, { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 }, { limit: 487450, rate: 0.32 }, { limit: 731200, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];
  const headBrackets = [
    { limit: 16550, rate: 0.1 }, { limit: 63100, rate: 0.12 }, { limit: 100500, rate: 0.22 },
    { limit: 191950, rate: 0.24 }, { limit: 243700, rate: 0.32 }, { limit: 609350, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];
  const brackets =
    i.filingStatus === "married" ? marriedBrackets : i.filingStatus === "head" ? headBrackets : singleBrackets;

  let taxLiability = 0;
  let remaining = taxableIncome;
  let prevLimit = 0;
  let marginalRate = 0;
  for (const b of brackets) {
    if (remaining > 0) {
      marginalRate = b.rate * 100;
      const slice = Math.min(remaining, b.limit - prevLimit);
      taxLiability += slice * b.rate;
      remaining -= slice;
    }
    prevLimit = b.limit;
    if (remaining <= 0) break;
  }

  const totalCredits = i.dependents * 2000 + i.otherCredits;
  const netTax = Math.max(0, taxLiability - totalCredits);
  const refundAmount = Math.abs(i.withheld - netTax);
  const isRefund = i.withheld - netTax >= 0;
  const effectiveRate = i.grossIncome > 0 ? (netTax / i.grossIncome) * 100 : 0;

  const d = Math.max(0, Math.min(2, i.decimals));
  const breakdown = [
    { label: "Gross income", value: money(i.grossIncome, d) },
    { label: "Pre-tax deductions (401k, HSA)", value: "−" + money(i.preTaxDeductions, d) },
    { label: isItemized ? "Itemized deductions" : `Standard deduction (${i.filingStatus === "married" ? "MFJ" : i.filingStatus === "head" ? "HoH" : "single"})`, value: "−" + money(deductionUsed, d) },
    { label: "Taxable income", value: money(taxableIncome, d), highlight: true },
    { label: "Tax liability before credits", value: money(taxLiability, d) },
    { label: `Credits (${i.dependents} × $2,000 CTC + other)`, value: "−" + money(totalCredits, d) },
    { label: "Net tax after credits", value: money(netTax, d) },
    { label: "Federal tax withheld", value: money(i.withheld, d) },
    { label: isRefund ? "Refund due to you" : "Balance due with return", value: money(refundAmount, d), highlight: true },
    { label: "Marginal bracket (rate on your next dollar)", value: `${fmt(marginalRate, 0)}%` },
    { label: "Effective rate (average tax on all income)", value: `${fmt(effectiveRate, 1)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    taxableIncome,
    taxLiability,
    totalCredits,
    netTax,
    refundAmount,
    isRefund,
    effectiveRate,
    marginalRate,
    standardDeduction,
    deductionUsed,
    isItemized,
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

export default function TaxRefundCalculator() {
  const [grossIncome, setGrossIncome] = useState(String(DEFAULTS.grossIncome));
  const [withheld, setWithheld] = useState(String(DEFAULTS.withheld));
  const [filingStatus, setFilingStatus] = useState(String(DEFAULTS.filingStatus));
  const [dependents, setDependents] = useState(String(DEFAULTS.dependents));
  const [preTaxDeductions, setPreTaxDeductions] = useState(String(DEFAULTS.preTaxDeductions));
  const [itemizedDeductions, setItemizedDeductions] = useState(String(DEFAULTS.itemizedDeductions));
  const [otherCredits, setOtherCredits] = useState(String(DEFAULTS.otherCredits));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TaxInputs => ({
    grossIncome: parseFloat(grossIncome) || 0,
    withheld: parseFloat(withheld) || 0,
    filingStatus: (filingStatus as FilingStatus) || "single",
    dependents: parseInt(dependents, 10) || 0,
    preTaxDeductions: parseFloat(preTaxDeductions) || 0,
    itemizedDeductions: parseFloat(itemizedDeductions) || 0,
    otherCredits: parseFloat(otherCredits) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<TaxInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TaxResult>(() => calculateTaxRefund(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateTaxRefund(inputs));
  };

  const reset = () => {
    setGrossIncome(String(DEFAULTS.grossIncome));
    setWithheld(String(DEFAULTS.withheld));
    setFilingStatus(String(DEFAULTS.filingStatus));
    setDependents(String(DEFAULTS.dependents));
    setPreTaxDeductions(String(DEFAULTS.preTaxDeductions));
    setItemizedDeductions(String(DEFAULTS.itemizedDeductions));
    setOtherCredits(String(DEFAULTS.otherCredits));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateTaxRefund(DEFAULTS));
  };

  const incomeNum = parseFloat(grossIncome);
  const withheldNum = parseFloat(withheld);
  const pretaxNum = parseFloat(preTaxDeductions);

  const errors = {
    grossIncome: !Number.isFinite(incomeNum) || incomeNum <= 0 ? "Enter income above $0" : "",
    withheld: !Number.isFinite(withheldNum) || withheldNum < 0 ? "Enter 0 or more" : "",
    preTaxDeductions: Number.isFinite(incomeNum) && pretaxNum > incomeNum ? "Cannot exceed gross income" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const d = Math.max(0, Math.min(2, calcInputs.decimals || 0));

  const faqs = [
    {
      question: "What is the standard deduction for 2024?",
      answer:
        "For the 2024 tax year the standard deduction is $14,600 for single filers, $29,200 for married couples filing jointly, and $21,900 for heads of household. This amount is subtracted from adjusted gross income to arrive at taxable income, and the calculator automatically uses whichever is larger — the standard deduction or the itemized deductions you enter — because that is exactly how the IRS computes it.",
    },
    {
      question: "How does the Child Tax Credit affect my refund?",
      answer:
        "The Child Tax Credit provides up to $2,000 per qualifying child under age 17. As a credit it reduces tax liability dollar-for-dollar, making it far more powerful than a deduction of the same size — a $2,000 credit is worth more than a $2,000 deduction at any tax rate. The calculator applies the full $2,000 per dependent entered, so a household with two qualifying children effectively wipes $4,000 off its liability.",
    },
    {
      question: "Why did I owe money instead of getting a refund?",
      answer:
        "You owe when your total tax liability exceeds the tax withheld from your paychecks. This often happens with multiple jobs where each employer withholds as if it were your only one, investment and side income with no withholding at all, or a W-4 that was never updated after marriage, a new baby, or a raise. The fix is mechanical: increase withholding or make an estimated payment, and the next filing lands closer to zero on both sides.",
    },
    {
      question: "How long does it take to get a tax refund?",
      answer:
        "Most taxpayers receive refunds within 21 days of e-filing with direct deposit. Paper returns take six to twelve weeks. By law, returns claiming the Earned Income Tax Credit or the Additional Child Tax Credit cannot be issued before mid-February, so those refunds typically arrive in late February or early March even when the return is filed in January.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Tax Refund Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tax Refund Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income & Withholding">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="gross-income"
                  label="Gross Income"
                  value={grossIncome}
                  onChange={setGrossIncome}
                  onEnter={runCalculate}
                  min="1"
                  max="10000000"
                  step="500"
                  prefix="$"
                  error={errors.grossIncome}
                  hint="Wages before pre-tax deductions."
                  tooltip="Total annual gross pay from all employers."
                />
                <CompactInput
                  id="withheld"
                  label="Federal Withheld"
                  value={withheld}
                  onChange={setWithheld}
                  onEnter={runCalculate}
                  min="0"
                  step="100"
                  prefix="$"
                  error={errors.withheld}
                  hint="Box 2 of your W-2."
                  tooltip="Federal income tax withheld year to date."
                />
              </div>
            </SubSection>

            <SubSection title="Household">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="filing-status"
                  label="Filing Status"
                  value={filingStatus}
                  onChange={setFilingStatus}
                  options={STATUS_OPTIONS}
                  tooltip="Sets both the standard deduction and the bracket table."
                />
                <CompactInput
                  id="dependents"
                  label="Dependents"
                  value={dependents}
                  onChange={setDependents}
                  onEnter={runCalculate}
                  min="0"
                  max="12"
                  step="1"
                  suffix="kids"
                  hint="Under 17, for the CTC."
                  tooltip="Qualifying children under 17 for the $2,000 Child Tax Credit."
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
                  <SubSection title="Deductions">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="pretax"
                        label="Pre-Tax Deductions"
                        value={preTaxDeductions}
                        onChange={setPreTaxDeductions}
                        onEnter={runCalculate}
                        min="0"
                        step="500"
                        prefix="$"
                        hint="401k, HSA, premiums."
                        tooltip="Pre-tax contributions subtracted before AGI."
                      />
                      <CompactInput
                        id="itemized"
                        label="Itemized Deductions"
                        value={itemizedDeductions}
                        onChange={setItemizedDeductions}
                        onEnter={runCalculate}
                        min="0"
                        step="500"
                        prefix="$"
                        hint="Used only if larger."
                        tooltip="Itemized total; the larger of this and the standard deduction is applied."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Credits & Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="other-credits"
                        label="Other Tax Credits"
                        value={otherCredits}
                        onChange={setOtherCredits}
                        onEnter={runCalculate}
                        min="0"
                        step="100"
                        prefix="$"
                        tooltip="Any credits beyond the Child Tax Credit, applied dollar-for-dollar."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                {results.valid ? (results.isRefund ? "Estimated Tax Refund" : "Estimated Amount Owed") : "Tax Refund Estimate"}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.refundAmount, d) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? results.isRefund
                    ? "You overpaid through withholding — this is your money coming back"
                    : "You underpaid — this is the balance due with your return"
                  : "Enter income and withholding to estimate the filing outcome"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Rate</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.effectiveRate, 1)}%` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Marginal Bracket</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.marginalRate, 0)}%` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Deduction Used</span>
                <span className="font-extrabold text-foreground">{results.valid ? (results.isItemized ? "Itemized" : "Standard") : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Return Line Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Amount</th>
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
                        Enter your income and withholding to build the return estimate.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Filing outcome</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${results.isRefund ? "Refund" : "Owe"} ${money(results.refundAmount, d)} · effective ${fmt(results.effectiveRate, 1)}%`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Filing outcome</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? (results.isRefund ? "Refund" : "Balance due") : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Amount</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.refundAmount, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Taxable income</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.taxableIncome, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax liability</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.taxLiability, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total credits</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.totalCredits, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net tax after credits</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.netTax, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Standard deduction (2024)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.standardDeduction, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective rate</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.effectiveRate, 1)}%` : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Tax Refund Calculator?</h2>
            <p>
              A tax refund calculator projects whether you will receive a refund or owe a balance when you file, based on your income,
              withholding, filing status and deductions. It applies the official IRS standard deductions and progressive tax brackets to
              your gross income, subtracts any credits, and compares the resulting tax bill against what your employer already withheld
              from your paychecks across the year. A refund is not a bonus — it is simply the return of money you overpaid through
              withholding, and the calculator makes that visible before you file rather than after.
            </p>
            <p>
              The distinction the tool is built around is the one taxpayers most often miss: withholding and liability are two independent
              numbers. Liability is what the tax code says you owe on your income; withholding is what happened to be collected along the
              way. When withholding runs ahead of liability the Treasury owes you the difference, and when it runs behind you owe the
              difference. Neither outcome is inherently good — both are timing artifacts that the calculator surfaces so you can adjust
              your W-4 deliberately instead of discovering them in April.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculation follows the IRS sequence. Start with gross income and subtract pre-tax deductions such as 401(k) or HSA
              contributions to reach adjusted gross income. From there, subtract the larger of the standard deduction — $14,600 for single
              filers, $29,200 for married filing jointly and $21,900 for heads of household in 2024 — or your itemized deductions. The
              remainder is taxable income, which is pushed through the seven progressive brackets so that each slice of income is taxed
              only at its own rate, never the whole income at the top rate.
            </p>
            <p>
              Tax credits then reduce the liability dollar-for-dollar, which makes them far more powerful than a deduction of the same
              size: the calculator applies $2,000 per qualifying child under 17 plus any other credits you enter. Finally the net tax is
              compared with federal withholding. More withheld than owed produces a refund; less produces a balance due with the return.
              The Advanced Options expose the three inputs that move the answer most — pre-tax retirement deductions, itemized deductions
              and additional credits — so the estimate can track a specific household rather than an average one.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the refund or balance due, and the label flips depending on which side of the line you land on. The
              three-stat bar carries the effective rate — your true average tax on total income — the marginal bracket, which is the rate
              applied only to your next dollar of earnings, and which deduction was used. The gap between effective and marginal rates is
              normal: progressive brackets tax only the top slice of income at the highest rate, so a 22% marginal filer usually pays an
              effective rate closer to 12 or 14%.
            </p>
            <p>
              The breakdown table walks the return line by line — gross income, deductions, taxable income, liability, credits, net tax —
              so you can see exactly where the number came from rather than trusting a single output. Read the results as a planning
              signal: a very large refund means you financed the government interest-free for a year and should loosen your W-4; a balance
              due means withholding lagged reality and should be tightened, or an estimated payment made. Treat the estimate as
              educational — dividends, capital gains, self-employment tax and state income taxes sit outside its scope, and the IRS
              withholding estimator remains the authority for W-4 decisions.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tax-refund-calculator" />
          <PopularCalculators exclude="/calculator/tax-refund-calculator" />
        </div>
      </div>
    </>
  );
}
