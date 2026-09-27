"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DtiInputs {
  income: number;
  housing: number;
  otherDebts: number;
  targetDti: number;
  downPercent: number;
  rate: number;
  termYears: number;
}

const DEFAULTS: DtiInputs = {
  income: 8000,
  housing: 2000,
  otherDebts: 500,
  targetDti: 36,
  downPercent: 20,
  rate: 6.5,
  termYears: 30,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

interface DtiResult {
  totalDebt: number;
  frontEnd: number;
  backEnd: number;
  residualIncome: number;
  maxHousingAtTarget: number;
  maxTotalAtTarget: number;
  maxTotalAt43: number;
  maxLoan: number;
  maxHomePrice: number;
  maxDownPayment: number;
  verdict: string;
  verdictTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeDti(i: DtiInputs): DtiResult {
  const invalid =
    i.income <= 0 || i.housing < 0 || i.otherDebts < 0 || i.targetDti <= 0 || i.downPercent < 0 || i.downPercent >= 100;

  const totalDebt = i.housing + i.otherDebts;
  const frontEnd = i.income > 0 ? (i.housing / i.income) * 100 : 0;
  const backEnd = i.income > 0 ? (totalDebt / i.income) * 100 : 0;
  const residualIncome = i.income - totalDebt;

  const maxTotalAtTarget = (i.income * i.targetDti) / 100;
  const maxHousingAtTarget = Math.max(0, maxTotalAtTarget - i.otherDebts);
  const maxTotalAt43 = (i.income * 43) / 100;

  const months = Math.round(i.termYears * 12);
  const monthlyRate = i.rate / 100 / 12;
  let maxLoan = 0;
  if (months > 0) {
    maxLoan =
      monthlyRate > 0
        ? (maxHousingAtTarget * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate
        : maxHousingAtTarget * months;
  }
  const maxHomePrice = i.downPercent < 100 ? maxLoan / (1 - i.downPercent / 100) : 0;
  const maxDownPayment = maxHomePrice - maxLoan;

  let verdict = "High debt load";
  let verdictTone = "text-destructive";
  if (backEnd <= 36) {
    verdict = "Strong";
    verdictTone = "text-emerald-600";
  } else if (backEnd <= 43) {
    verdict = "Acceptable";
    verdictTone = "text-amber-600";
  }

  return {
    totalDebt,
    frontEnd,
    backEnd,
    residualIncome,
    maxHousingAtTarget,
    maxTotalAtTarget,
    maxTotalAt43,
    maxLoan,
    maxHomePrice,
    maxDownPayment,
    verdict,
    verdictTone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive monthly income, non-negative debt payments, and a down payment below 100%."
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

export default function DebtToIncomeDtiRatioCalculator() {
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [housing, setHousing] = useState(String(DEFAULTS.housing));
  const [otherDebts, setOtherDebts] = useState(String(DEFAULTS.otherDebts));
  const [targetDti, setTargetDti] = useState(String(DEFAULTS.targetDti));
  const [downPercent, setDownPercent] = useState(String(DEFAULTS.downPercent));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DtiInputs => ({
    income: parseFloat(income) || 0,
    housing: parseFloat(housing) || 0,
    otherDebts: parseFloat(otherDebts) || 0,
    targetDti: parseFloat(targetDti) || 0,
    downPercent: parseFloat(downPercent) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DtiInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DtiResult>(() => computeDti(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDti(inputs));
  };

  const reset = () => {
    setIncome(String(DEFAULTS.income));
    setHousing(String(DEFAULTS.housing));
    setOtherDebts(String(DEFAULTS.otherDebts));
    setTargetDti(String(DEFAULTS.targetDti));
    setDownPercent(String(DEFAULTS.downPercent));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setCalcInputs(DEFAULTS);
    setResults(computeDti(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a debt-to-income ratio?",
      answer:
        "The debt-to-income ratio is the share of your gross monthly income that goes to debt payments, including housing, car loans, student loans, personal loans and minimum credit card payments. Lenders use it as the primary measure of whether an additional loan payment will fit your budget, and it is generally the most important number in a mortgage application.",
    },
    {
      question: "What are the standard DTI limits?",
      answer:
        "The long-standing guideline is that housing should stay within twenty-eight percent of gross income and all debt within thirty-six percent. Automated underwriting frequently approves higher back-end ratios when credit and reserves are strong, and qualified mortgages generally allow up to forty-three percent. Above that, options narrow considerably and pricing may rise.",
    },
    {
      question: "How much house can I afford at a given DTI?",
      answer:
        "Work backwards from the target ratio. Multiply income by the target to get the maximum total debt payment, subtract existing debts to find the housing payment available, then convert that payment into a loan amount using the rate and term. Adding the down payment gives the purchase price. This calculator performs that sequence automatically.",
    },
    {
      question: "Does the DTI use gross or net income?",
      answer:
        "Gross income, before taxes and deductions. Lenders underwrite on gross because take-home pay varies with withholding and benefits elections. The consequence is that a ratio which looks comfortable on paper can still feel tight once taxes, retirement contributions and living costs are subtracted, especially in high-tax states.",
    },
    {
      question: "How can I lower my DTI quickly?",
      answer:
        "Pay down revolving balances, because minimum payments fall as card balances drop, and minimums are counted in full. Paying off a small instalment loan entirely removes its payment from the calculation. Increasing documented income helps, as does adding a co-borrower. Refinancing to extend a loan's term can lower the payment but rarely changes underwriting thresholds.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt-to-Income (DTI) Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt-to-Income (DTI) Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income & Obligations">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="income"
                  label="Gross Monthly Income"
                  value={income}
                  onChange={setIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Income before tax and deductions."
                />
                <CompactInput
                  id="housing"
                  label="Housing Payment"
                  value={housing}
                  onChange={setHousing}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Rent or full mortgage payment including taxes and insurance."
                />
              </div>
            </SubSection>

            <SubSection title="Debt & Target">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="debts"
                  label="Other Monthly Debts"
                  value={otherDebts}
                  onChange={setOtherDebts}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Car, student and personal loan payments plus card minimums."
                />
                <CompactInput
                  id="target"
                  label="Target DTI"
                  value={targetDti}
                  onChange={setTargetDti}
                  onEnter={runCalculate}
                  suffix="%"
                  min="1"
                  step="1"
                  tooltip="Ratio you want to stay within, commonly 36%."
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
                  <SubSection title="Loan Sizing">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="down"
                        label="Down Payment"
                        value={downPercent}
                        onChange={setDownPercent}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.5"
                        tooltip="Share of the purchase price paid upfront."
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
                        tooltip="Expected mortgage rate used to convert payment into loan size."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="term"
                        label="Loan Term"
                        value={termYears}
                        onChange={setTermYears}
                        onEnter={runCalculate}
                        suffix="yrs"
                        min="1"
                        tooltip="Amortisation period for the loan."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Back-End Debt-to-Income</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(results.backEnd, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalDebt)} of {money(calcInputs.income)} income &middot;{" "}
                <span className={results.verdictTone}>{results.verdict}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Front-End</span>
                <span className="font-extrabold text-foreground">{fmt(results.frontEnd, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Housing</span>
                <span className="font-extrabold text-foreground">{money(results.maxHousingAtTarget)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Loan</span>
                <span className="font-extrabold text-primary">{money(results.maxLoan)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Monthly Obligation</th>
                    <th className="p-2.5 text-right w-[120px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[100px]">% Income</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Proposed Housing Payment</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.housing)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.frontEnd, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Other Monthly Debts</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.otherDebts)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.income > 0 ? (calcInputs.otherDebts / calcInputs.income) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Residual Income</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.residualIncome)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.income > 0 ? (results.residualIncome / calcInputs.income) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Max Housing at Target</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.maxHousingAtTarget)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.income > 0 ? (results.maxHousingAtTarget / calcInputs.income) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Max Total Debt at 43%</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.maxTotalAt43)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">43.0%</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Debt Payments</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalDebt)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.backEnd, 1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross Monthly Income</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.income)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Debt Payments</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalDebt)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Front-End Ratio</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.frontEnd, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Back-End Ratio</span>
                  <span className={`text-base font-bold ${results.verdictTone}`}>{fmt(results.backEnd, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Max Monthly Debt at Target</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxTotalAtTarget)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Max Loan Amount</span>
                  <span className="text-base font-bold text-primary">{money(results.maxLoan)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Max Home Price</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxHomePrice)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Down Payment at That Price</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxDownPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt-to-Income Ratio Calculator?</h2>
            <p>
              A debt-to-income ratio calculator measures the share of gross monthly income consumed by debt payments and
              then works backwards to show how much additional borrowing the income can carry. It reports two figures: the
              front-end ratio, which counts only housing, and the back-end ratio, which adds every other recurring debt
              payment including car loans, student loans and minimum credit card payments.
            </p>
            <p>
              The back-end ratio is usually the binding constraint on a mortgage application, but the front-end figure
              explains why similar incomes support very different loans. A household with large student or car payments has
              less room for housing even when it earns well, which is why paying down instalment debt before applying often
              does more for purchasing power than saving an equivalent amount towards the down payment.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Ratios and Limits Are Calculated</h2>
            <p>
              Each ratio divides a payment total by gross monthly income and multiplies by one hundred. The front-end
              ratio uses the housing payment alone; the back-end ratio adds all other monthly obligations. The reverse
              calculation begins with the target ratio: income multiplied by the target gives the maximum total debt
              payment, and subtracting existing debts leaves the housing payment that fits within the limit.
            </p>
            <p>
              That payment is then converted into a loan amount using the amortisation formula in reverse, where the loan
              equals the payment multiplied by one minus the quantity one plus the monthly rate raised to the negative
              number of payments, all divided by the monthly rate. Dividing the loan by one minus the down payment
              percentage produces the maximum purchase price, and the difference between the two is the cash needed at
              closing.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the back-end ratio with a plain-language verdict, and the three statistics beside it
              give the front-end ratio, the maximum housing payment allowed at your target and the resulting loan amount.
              The breakdown table lists each obligation with its share of income, the residual income left after all debt
              payments, and the ceilings at both the target ratio and the forty-three percent qualified-mortgage limit.
            </p>
            <p>
              Summary Statistics collects the income, total debt payments, both ratios, the maximum loan and the purchase
              price it implies together with the down payment required. Treat the verdict as guidance rather than a
              guarantee, since underwriting also weighs credit score, reserves and the type of loan. If the ratio is above
              the threshold, clearing a small instalment loan or reducing card balances lowers it fastest, because a paid-off
              debt disappears from the calculation entirely.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-to-income-dti-ratio-calculator" />
          <PopularCalculators exclude="/calculator/debt-to-income-dti-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
