"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type FilingStatus = "single" | "mfj" | "hoh";

interface TaxInputs {
  loanAmount: number;
  apr: number;
  years: number;
  filing: FilingStatus;
  marginalRate: number;
  propertyTax: number;
  stateIncomeTax: number;
  standardDeduction: number;
  saltCap: number;
}

/** 2025 tax-year defaults (US federal, as adjusted for the 2025 standard deduction & SALT cap). */
const FILING_DEFAULTS: Record<FilingStatus, { standard: number; salt: number; label: string }> = {
  single: { standard: 15750, salt: 40000, label: "Single" },
  mfj: { standard: 31500, salt: 40000, label: "Married Filing Jointly" },
  hoh: { standard: 23625, salt: 40000, label: "Head of Household" },
};

const TAX_YEAR = "2025";

const DEFAULTS: TaxInputs = {
  loanAmount: 400000,
  apr: 6.5,
  years: 30,
  filing: "mfj",
  marginalRate: 22,
  propertyTax: 4800,
  stateIncomeTax: 3000,
  standardDeduction: FILING_DEFAULTS.mfj.standard,
  saltCap: FILING_DEFAULTS.mfj.salt,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const f = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * f) / (f - 1);
}

interface YearRow {
  year: number;
  interest: number;
  itemized: number;
  savings: number;
}

interface TaxResult {
  payment: number;
  yearRows: YearRow[];
  firstYearInterest: number;
  firstYearItemized: number;
  firstYearSavings: number;
  fiveYearSavings: number;
  termSavings: number;
  deductibleSalt: number;
  incrementalDeduction: number;
  monthlyEquivalent: number;
  valid: boolean;
  errorMsg: string;
}

function computeTaxBenefit(i: TaxInputs): TaxResult {
  const invalid =
    i.loanAmount <= 0 || i.apr < 0 || i.years <= 0 || i.marginalRate < 0 || i.marginalRate > 60 || i.propertyTax < 0 || i.stateIncomeTax < 0;

  const months = Math.round(i.years * 12);
  const r = i.apr / 100 / 12;
  const payment = monthlyPayment(i.loanAmount, r, months);

  const localTaxes = i.propertyTax + i.stateIncomeTax;
  const deductibleSalt = Math.min(localTaxes, i.saltCap);

  const yearRows: YearRow[] = [];
  let balance = i.loanAmount;
  let yearInterest = 0;
  let yearIndex = 0;
  for (let m = 1; m <= months && balance > 0.005; m++) {
    const interest = balance * r;
    const principal = Math.min(payment - interest, balance);
    yearInterest += interest;
    balance -= principal;
    const endOfYear = m % 12 === 0 || m === months;
    if (endOfYear) {
      yearIndex += 1;
      const itemized = yearInterest + deductibleSalt;
      const savings = Math.max(0, itemized - i.standardDeduction) * (i.marginalRate / 100);
      yearRows.push({ year: yearIndex, interest: yearInterest, itemized, savings });
      yearInterest = 0;
    }
  }

  const first = yearRows[0] || { year: 1, interest: 0, itemized: deductibleSalt, savings: 0 };
  const firstYearItemized = first.interest + deductibleSalt;
  const fiveYearSavings = yearRows.slice(0, 5).reduce((s, y) => s + y.savings, 0);
  const termSavings = yearRows.reduce((s, y) => s + y.savings, 0);
  const incrementalDeduction = Math.max(0, firstYearItemized - i.standardDeduction);

  return {
    payment,
    yearRows,
    firstYearInterest: first.interest,
    firstYearItemized,
    firstYearSavings: first.savings,
    fiveYearSavings,
    termSavings,
    deductibleSalt,
    incrementalDeduction,
    monthlyEquivalent: first.savings / 12,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan amount and term, a non-negative rate, and a marginal tax rate between 0 and 60%."
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

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function MortgageTaxDeductionBenefitCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [filing, setFiling] = useState<FilingStatus>(DEFAULTS.filing);
  const [marginalRate, setMarginalRate] = useState(String(DEFAULTS.marginalRate));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULTS.propertyTax));
  const [stateIncomeTax, setStateIncomeTax] = useState(String(DEFAULTS.stateIncomeTax));
  const [standardDeduction, setStandardDeduction] = useState(String(DEFAULTS.standardDeduction));
  const [saltCap, setSaltCap] = useState(String(DEFAULTS.saltCap));
  const [showAdv, setShowAdv] = useState(false);

  const applyFiling = (status: FilingStatus) => {
    setFiling(status);
    setStandardDeduction(String(FILING_DEFAULTS[status].standard));
    setSaltCap(String(FILING_DEFAULTS[status].salt));
  };

  const getInputs = (): TaxInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    apr: parseFloat(apr) || 0,
    years: parseFloat(years) || 0,
    filing,
    marginalRate: parseFloat(marginalRate) || 0,
    propertyTax: parseFloat(propertyTax) || 0,
    stateIncomeTax: parseFloat(stateIncomeTax) || 0,
    standardDeduction: parseFloat(standardDeduction) || 0,
    saltCap: parseFloat(saltCap) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<TaxInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TaxResult>(() => computeTaxBenefit(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTaxBenefit(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setApr(String(DEFAULTS.apr));
    setYears(String(DEFAULTS.years));
    setFiling(DEFAULTS.filing);
    setMarginalRate(String(DEFAULTS.marginalRate));
    setPropertyTax(String(DEFAULTS.propertyTax));
    setStateIncomeTax(String(DEFAULTS.stateIncomeTax));
    setStandardDeduction(String(DEFAULTS.standardDeduction));
    setSaltCap(String(DEFAULTS.saltCap));
    setCalcInputs(DEFAULTS);
    setResults(computeTaxBenefit(DEFAULTS));
  };

  const faqs = [
    {
      question: "Is mortgage interest still tax deductible?",
      answer:
        "Yes, for most homeowners. Interest on mortgage debt used to buy, build or substantially improve your home is deductible if you itemise and the debt stays within the acquisition-debt limits. Because the 2017 standard deduction is now much larger, many households take the standard deduction and never itemise, which means the mortgage interest deduction delivers no benefit at all to them. This calculator shows exactly where that break-even point sits.",
    },
    {
      question: "How much property tax and state tax can I deduct?",
      answer:
        "Combined state and local taxes, including property tax and state income tax, are capped by the SALT limit. For the " +
        TAX_YEAR +
        " tax year the cap is $40,000 for single and joint filers and $20,000 for married-filing-separately, with a phase-down for very high earners. The calculator applies the cap to your combined local taxes before adding them to interest.",
    },
    {
      question: "Why is my tax benefit smaller than I expected?",
      answer:
        "Because deductions only help above the standard deduction. If your itemisable amounts total less than the standard deduction, you itemise nothing and gain nothing. The benefit equals only the excess of your itemised deductions over the standard deduction, multiplied by your marginal tax rate, so a 22% bracket turns a $1,000 excess deduction into $220 of savings, not $1,000.",
    },
    {
      question: "Should I include my state income tax?",
      answer:
        "Yes. SALT is a combined cap, so property tax and state income tax compete for the same room under it. If you already deduct large state income tax, less of your property tax fits, and vice versa. Enter both to see the real deductible total rather than optimistically counting each one in full.",
    },
    {
      question: "Does the benefit change over the life of the loan?",
      answer:
        "It falls steadily. Mortgage interest is front-loaded, so the first year is always the most valuable. As the balance amortises, annual interest shrinks and can drop below the standard deduction, at which point the deduction stops helping. The calculator projects the benefit year by year and totals it over five years and the full term.",
    },
  ];

  const breakdownRows = [
    { label: "Mortgage Interest (Year 1)", value: `$${fmt(results.firstYearInterest)}`, note: "Deductible in full" },
    {
      label: "State & Local Taxes (deductible)",
      value: `$${fmt(results.deductibleSalt)}`,
      note: `Capped at $${fmt(calcInputs.saltCap)}`,
    },
    { label: "Itemised Deductions (Year 1)", value: `$${fmt(results.firstYearItemized)}`, note: "Interest + capped SALT" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Mortgage Tax Deduction Benefit Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Mortgage Tax Deduction Benefit Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Original mortgage principal."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="Fixed annual interest rate."
                />
              </div>
            </SubSection>

            <SubSection title="Tax Profile">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label htmlFor="filing" className="flex items-center text-sm font-semibold text-foreground mb-1">
                    Filing Status
                  </label>
                  <div className="relative h-9">
                    <select
                      id="filing"
                      value={filing}
                      onChange={(e) => applyFiling(e.target.value as FilingStatus)}
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                    >
                      <option value="single">Single</option>
                      <option value="mfj">Married Filing Jointly</option>
                      <option value="hoh">Head of Household</option>
                    </select>
                  </div>
                </div>
                <CompactInput
                  id="marginal-rate"
                  label="Marginal Tax Rate"
                  value={marginalRate}
                  onChange={setMarginalRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="1"
                  tooltip="Your top federal bracket (plus state, if itemising against state tax)."
                />
              </div>
            </SubSection>

            <SubSection title="Term & Local Taxes">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Amortisation term in years."
                />
                <CompactInput
                  id="property-tax"
                  label="Property Tax / yr"
                  value={propertyTax}
                  onChange={setPropertyTax}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Annual property tax paid."
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
                  <SubSection title="SALT & Income Tax">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="state-income"
                        label="State Income Tax / yr"
                        value={stateIncomeTax}
                        onChange={setStateIncomeTax}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Annual state/local income tax, combined with property tax under the SALT cap."
                      />
                      <CompactInput
                        id="salt-cap"
                        label="SALT Cap"
                        value={saltCap}
                        onChange={setSaltCap}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip={`Combined SALT limit for ${TAX_YEAR}: $40,000 (single/joint), $20,000 MFS.`}
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Standard Deduction">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="standard"
                        label="Standard Deduction"
                        value={standardDeduction}
                        onChange={setStandardDeduction}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip={`${TAX_YEAR} standard deduction auto-set by filing status; edit for a different year.`}
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          {TAX_YEAR} tax year
                        </div>
                      </div>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                First-Year Tax Savings
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.firstYearSavings)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                About ${fmt(results.monthlyEquivalent)} / month &middot; {FILING_DEFAULTS[calcInputs.filing].label} &middot;{" "}
                {TAX_YEAR} rules
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Year-1 Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.firstYearInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Itemised</span>
                <span className="font-extrabold text-foreground">${fmt(results.firstYearItemized)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">5-Yr Savings</span>
                <span className="font-extrabold text-foreground">${fmt(results.fiveYearSavings)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Deduction Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.value}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Standard Deduction</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.standardDeduction)}</td>
                    <td className="p-2.5 pr-3 text-muted-foreground">Below this, itemising does not pay</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Extra Deduction (Itemise − Standard)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.incrementalDeduction)}</td>
                    <td className="p-2.5 pr-3 text-foreground">× {fmt(calcInputs.marginalRate, 1)}% tax rate</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Payment (P&amp;I)</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.payment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Marginal Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.marginalRate, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Deductible SALT</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.deductibleSalt)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First-Year Savings</span>
                  <span className="text-base font-bold text-primary">${fmt(results.firstYearSavings)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Five-Year Savings</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.fiveYearSavings)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Full-Term Savings</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.termSavings)}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Figures use {TAX_YEAR} US federal standard-deduction and SALT-cap amounts and assume you itemise. Verify
                against the current-year IRS schedule before filing.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Mortgage Tax Deduction Benefit Calculator?</h2>
            <p>
              This calculator estimates how much federal income tax you actually save from deducting mortgage interest
              and state and local taxes. It answers a question the headline rules hide: a deduction is only worth
              something if it lifts your itemised total above the standard deduction. Because the standard deduction is
              now very large, a substantial share of homeowners receive no benefit from their mortgage interest at all,
              and this tool shows immediately whether you are one of them.
            </p>
            <p>
              The model follows the US federal schedule for the {TAX_YEAR} tax year: interest on qualifying acquisition
              debt plus state and local taxes, with property tax and state income tax sharing a single SALT cap. Both
              the standard deduction and the SALT cap are seeded from {TAX_YEAR} figures and remain editable, so you can
              re-run the numbers for a different year or filing status without leaving the page.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator builds the full mortgage amortisation schedule from the standard payment formula
              PMT = P x r / (1 - (1 + r)^-n). For each calendar year it sums the interest charged in that year, adds the
              deductible portion of your state and local taxes (property tax plus state income tax, limited by the SALT
              cap), and calls that total your itemised deductions for the year. It then subtracts the standard deduction
              and multiplies the remainder, if positive, by your marginal tax rate to produce the year&apos;s tax saving.
              If the itemised total is below the standard deduction the saving is zero.
            </p>
            <p>
              Because mortgage interest is front-loaded, year one carries the largest interest charge and therefore the
              largest benefit. The calculator repeats the yearly calculation across the whole term so you can see the
              five-year and full-term totals, and it reports the incremental deduction, which is the only portion of
              your itemised deductions that changes what you owe.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows first-year tax savings, with year-one interest, your itemised total, and the
              five-year running total beside it. The breakdown table lays out each deduction component, the standard
              deduction you must beat, and the incremental deduction that actually reduces tax. If the incremental
              deduction is zero, the honest answer is that the mortgage interest deduction is worth nothing to you this
              year and you are better off taking the standard deduction.
            </p>
            <p>
              Summary Statistics adds the mortgage payment, your marginal rate, the deductible SALT amount, and savings
              over five years and the full term. Treat these figures as planning estimates rather than a prepared
              return. Deductions can be limited by acquisition-debt caps, the SALT phase-down for high earners, and
              state rules, and the standard deduction and SALT cap change with legislation, so confirm the current-year
              amounts with the IRS or a tax professional before relying on them.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-tax-deduction-benefit-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-tax-deduction-benefit-calculator" />
        </div>
      </div>
    </>
  );
}
