"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DscrInputs {
  noi: number;
  debtService: number;
  targetDscr: number;
  rate: number;
  termYears: number;
  existingLoan: number;
}

const DEFAULTS: DscrInputs = {
  noi: 120000,
  debtService: 80000,
  targetDscr: 1.25,
  rate: 6,
  termYears: 30,
  existingLoan: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

interface DscrResult {
  dscr: number;
  surplus: number;
  maxDebtService: number;
  maxMonthlyPayment: number;
  maxLoanAmount: number;
  maxTotalLoan: number;
  verdict: string;
  verdictTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeDscr(i: DscrInputs): DscrResult {
  const invalid = i.noi <= 0 || i.debtService < 0 || i.targetDscr <= 0 || i.rate < 0 || i.termYears <= 0;

  const dscr = i.debtService > 0 ? i.noi / i.debtService : 0;
  const surplus = i.noi - i.debtService;
  const maxDebtService = i.noi / i.targetDscr;
  const maxMonthlyPayment = maxDebtService / 12;

  const months = Math.round(i.termYears * 12);
  const monthlyRate = i.rate / 100 / 12;
  const maxLoanAmount =
    months > 0
      ? monthlyRate > 0
        ? (maxMonthlyPayment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate
        : maxMonthlyPayment * months
      : 0;

  let verdict = "Below break-even";
  let verdictTone = "text-destructive";
  if (dscr >= 1.25) {
    verdict = "Lender ready";
    verdictTone = "text-emerald-600";
  } else if (dscr >= 1) {
    verdict = "Marginal cover";
    verdictTone = "text-amber-600";
  }

  return {
    dscr,
    surplus,
    maxDebtService,
    maxMonthlyPayment,
    maxLoanAmount,
    maxTotalLoan: maxLoanAmount + i.existingLoan,
    verdict,
    verdictTone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive net operating income, non-negative debt service, and a positive target ratio and rate."
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function DebtServiceCoverageRatioDscrCalculator() {
  const [noi, setNoi] = useState(String(DEFAULTS.noi));
  const [debtService, setDebtService] = useState(String(DEFAULTS.debtService));
  const [targetDscr, setTargetDscr] = useState(String(DEFAULTS.targetDscr));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [existingLoan, setExistingLoan] = useState(String(DEFAULTS.existingLoan));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DscrInputs => ({
    noi: parseFloat(noi) || 0,
    debtService: parseFloat(debtService) || 0,
    targetDscr: parseFloat(targetDscr) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
    existingLoan: parseFloat(existingLoan) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DscrInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DscrResult>(() => computeDscr(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDscr(inputs));
  };

  const reset = () => {
    setNoi(String(DEFAULTS.noi));
    setDebtService(String(DEFAULTS.debtService));
    setTargetDscr(String(DEFAULTS.targetDscr));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setExistingLoan(String(DEFAULTS.existingLoan));
    setCalcInputs(DEFAULTS);
    setResults(computeDscr(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a debt service coverage ratio?",
      answer:
        "The debt service coverage ratio divides a property's net operating income by its total annual debt service, which is principal plus interest. A ratio of 1.25 means the property produces twenty-five percent more income than it needs to service the debt. Lenders use it to judge whether the asset itself can carry the loan if the borrower's other resources are unavailable.",
    },
    {
      question: "What DSCR do lenders require?",
      answer:
        "Many commercial and rental lenders set a minimum of 1.20 to 1.25, with the strongest terms reserved for 1.30 and above. Below 1.00 the property does not cover its own debt, which usually means either a larger down payment, a smaller loan, or a rate high enough to compensate the lender for the added risk.",
    },
    {
      question: "What counts as net operating income?",
      answer:
        "Gross rent plus other property income, less vacancy allowance and operating expenses such as taxes, insurance, maintenance, management and utilities. Critically, the mortgage payment itself is excluded, because that is the figure the ratio is testing against. Capital expenditures and reserves may also be deducted depending on the lender's convention.",
    },
    {
      question: "How is the maximum loan size determined from DSCR?",
      answer:
        "Divide net operating income by the target ratio to find the maximum annual debt service the property can support, then divide by twelve for a monthly payment. Converting that payment into a loan amount uses the amortisation formula in reverse at the lender's rate and term, which gives the largest loan that satisfies the ratio.",
    },
    {
      question: "Why does a lower rate allow a larger DSCR loan?",
      answer:
        "A lower rate reduces the debt service produced by any given loan amount, so a fixed income stream can support a larger balance while still meeting the ratio. That is why DSCR pricing matters so much for leveraged property: a modest rate difference changes the maximum loan materially, and therefore changes the equity required to close.",
    },
  ];

  const breakdownRows = [
    { label: "Net Operating Income", amount: money(calcInputs.noi), note: "Annual" },
    { label: "Total Debt Service", amount: money(calcInputs.debtService), note: "Principal + interest" },
    { label: "Operating Surplus", amount: money(results.surplus), note: "NOI less debt service" },
    { label: "Max Debt Service at Target", amount: money(results.maxDebtService), note: `${fmt(calcInputs.targetDscr, 2)}x cover` },
    { label: "Max Monthly Payment", amount: money(results.maxMonthlyPayment), note: "Annual figure divided by 12" },
    { label: "Max Loan Amount", amount: money(results.maxLoanAmount), note: "At the rate and term below" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Service Coverage Ratio (DSCR) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Service Coverage Ratio (DSCR) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Property Income">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="noi"
                  label="Net Operating Income"
                  value={noi}
                  onChange={setNoi}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Annual rent less vacancy and operating expenses, before debt service."
                />
                <CompactInput
                  id="service"
                  label="Annual Debt Service"
                  value={debtService}
                  onChange={setDebtService}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total annual principal and interest on the property debt."
                />
              </div>
            </SubSection>

            <SubSection title="Lender Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="target"
                  label="Target DSCR"
                  value={targetDscr}
                  onChange={setTargetDscr}
                  onEnter={runCalculate}
                  suffix="x"
                  min="1"
                  step="0.05"
                  tooltip="Minimum coverage the lender requires, commonly 1.25."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Rate used to convert the allowable payment into a loan amount."
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
                  <SubSection title="Loan Structure">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="term"
                        label="Amortisation Term"
                        value={termYears}
                        onChange={setTermYears}
                        onEnter={runCalculate}
                        suffix="yrs"
                        min="1"
                        tooltip="Amortisation period used to size the loan."
                      />
                      <CompactInput
                        id="existing"
                        label="Other Property Debt"
                        value={existingLoan}
                        onChange={setExistingLoan}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Existing debt on the same property, added to the new loan."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt Service Coverage Ratio</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.dscr, 2)}x
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(calcInputs.noi)} income covering {money(calcInputs.debtService)} of debt &middot;{" "}
                <span className={results.verdictTone}>{results.verdict}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Operating Surplus</span>
                <span className={`font-extrabold ${results.surplus >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {money(results.surplus)}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Monthly</span>
                <span className="font-extrabold text-foreground">{money(results.maxMonthlyPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Loan</span>
                <span className="font-extrabold text-primary">{money(results.maxLoanAmount)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measure</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.amount}</td>
                      <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">DSCR</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.dscr, 2)}x</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.verdict}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Operating Income</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.noi)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt Service</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.debtService)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">DSCR</span>
                  <span className={`text-base font-bold ${results.verdictTone}`}>{fmt(results.dscr, 2)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Target DSCR</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.targetDscr, 2)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Operating Surplus</span>
                  <span className="text-base font-bold text-foreground">{money(results.surplus)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Max Loan Amount</span>
                  <span className="text-base font-bold text-primary">{money(results.maxLoanAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">With Existing Debt</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxTotalLoan)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment at Max Loan</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxMonthlyPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a DSCR Calculator?</h2>
            <p>
              A debt service coverage ratio calculator divides a property's net operating income by the debt service it
              must carry, which is the annual total of principal and interest. The result expresses how many times over the
              income covers the debt. A ratio of 1.30 means thirty percent more income than required, while a ratio below
              1.00 means the property does not generate enough to service its own loan.
            </p>
            <p>
              Lenders rely on this measure because it tests the asset rather than the borrower. It is the standard gate for
              rental and commercial mortgages, and it also drives loan sizing: once the ratio is fixed, the maximum loan
              amount follows directly from the income the property produces. That makes the calculator a planning tool as
              much as an underwriting check.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Ratio and Loan Limit Are Calculated</h2>
            <p>
              Net operating income is gross rent plus other property income, less a vacancy allowance and operating
              expenses such as taxes, insurance, management, maintenance and utilities. Debt service is excluded from that
              figure, because it is the cost the ratio is measured against. The ratio is simply income divided by debt
              service, and the surplus is income less debt service.
            </p>
            <p>
              Loan sizing runs in reverse. Dividing income by the target ratio gives the maximum annual debt service the
              property can support, and dividing by twelve converts it into a monthly payment. That payment is then
              translated into a principal balance using the amortisation formula in reverse at the lender's rate and term: a
              lower rate raises the maximum loan for the same income, which is why pricing has an outsized effect on
              leveraged property returns.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the ratio with a verdict banded around the conventional thresholds, and the three
              statistics beside it show the operating surplus, the maximum monthly payment the property can support and the
              resulting loan amount. The breakdown table sets out income, debt service, surplus and the derived limits with
              the basis for each figure, so the calculation is transparent rather than a black box.
            </p>
            <p>
              Summary Statistics collects the income, debt service, current and target ratios, the surplus, the maximum
              loan and the combined total when other property debt exists. Two points are worth noting. First, lenders vary
              in what they deduct from income, so a ratio computed on your own assumptions may differ from the one a
              servicer produces. Second, if the current ratio falls short of the target, the fastest fixes are a smaller
              loan, a lower rate, or genuinely raising income rather than reducing reserves.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-service-coverage-ratio-dscr-calculator" />
          <PopularCalculators exclude="/calculator/debt-service-coverage-ratio-dscr-calculator" />
        </div>
      </div>
    </>
  );
}
