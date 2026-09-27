"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface MeansInputs {
  monthlyIncome: number;
  householdSize: number;
  unsecuredDebt: number;
  stateMedian: number;
  livingExpenses: number;
  securedPayments: number;
  priorityPayments: number;
}

const DEFAULTS: MeansInputs = {
  monthlyIncome: 5800,
  householdSize: 3,
  unsecuredDebt: 28000,
  stateMedian: 6375,
  livingExpenses: 3900,
  securedPayments: 950,
  priorityPayments: 300,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface MeansResult {
  annualizedIncome: number;
  aboveMedian: boolean;
  disposable: number;
  sixtyMonthTotal: number;
  thresholdA: number;
  thresholdB: number;
  testAPass: boolean;
  testBPass: boolean;
  presumption: boolean;
  debtSharePct: number;
  valid: boolean;
  errorMsg: string;
}

function computeMeans(i: MeansInputs): MeansResult {
  const invalid =
    i.monthlyIncome <= 0 ||
    i.householdSize < 1 ||
    i.unsecuredDebt < 0 ||
    i.stateMedian <= 0 ||
    i.livingExpenses < 0 ||
    i.securedPayments < 0 ||
    i.priorityPayments < 0;

  const annualizedIncome = i.monthlyIncome * 12;
  const aboveMedian = i.monthlyIncome > i.stateMedian;
  const allowed = i.livingExpenses + i.securedPayments + i.priorityPayments;
  const disposable = Math.max(0, i.monthlyIncome - allowed);
  const sixtyMonthTotal = disposable * 60;

  // Statutory presumption thresholds: the greater of 25% of nonpriority
  // unsecured debt or $9,075 (test A), capped by $15,150 (test B).
  const thresholdA = Math.max(i.unsecuredDebt * 0.25, 9075);
  const thresholdB = 15150;
  const testAPass = sixtyMonthTotal >= thresholdA && i.unsecuredDebt * 0.25 >= 9075;
  const testBPass = sixtyMonthTotal >= thresholdB;
  const presumption = aboveMedian && (testAPass || testBPass);

  return {
    annualizedIncome,
    aboveMedian,
    disposable,
    sixtyMonthTotal,
    thresholdA,
    thresholdB,
    testAPass,
    testBPass,
    presumption,
    debtSharePct: i.unsecuredDebt > 0 ? (sixtyMonthTotal / i.unsecuredDebt) * 100 : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter an income above zero, a household size of at least one, and non-negative debts and deductions."
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

export default function BankruptcyMeansTestCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(String(DEFAULTS.monthlyIncome));
  const [householdSize, setHouseholdSize] = useState(String(DEFAULTS.householdSize));
  const [unsecuredDebt, setUnsecuredDebt] = useState(String(DEFAULTS.unsecuredDebt));
  const [stateMedian, setStateMedian] = useState(String(DEFAULTS.stateMedian));
  const [livingExpenses, setLivingExpenses] = useState(String(DEFAULTS.livingExpenses));
  const [securedPayments, setSecuredPayments] = useState(String(DEFAULTS.securedPayments));
  const [priorityPayments, setPriorityPayments] = useState(String(DEFAULTS.priorityPayments));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): MeansInputs => ({
    monthlyIncome: parseFloat(monthlyIncome) || 0,
    householdSize: parseFloat(householdSize) || 0,
    unsecuredDebt: parseFloat(unsecuredDebt) || 0,
    stateMedian: parseFloat(stateMedian) || 0,
    livingExpenses: parseFloat(livingExpenses) || 0,
    securedPayments: parseFloat(securedPayments) || 0,
    priorityPayments: parseFloat(priorityPayments) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<MeansInputs>(() => DEFAULTS);
  const [results, setResults] = useState<MeansResult>(() => computeMeans(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeMeans(inputs));
  };

  const reset = () => {
    setMonthlyIncome(String(DEFAULTS.monthlyIncome));
    setHouseholdSize(String(DEFAULTS.householdSize));
    setUnsecuredDebt(String(DEFAULTS.unsecuredDebt));
    setStateMedian(String(DEFAULTS.stateMedian));
    setLivingExpenses(String(DEFAULTS.livingExpenses));
    setSecuredPayments(String(DEFAULTS.securedPayments));
    setPriorityPayments(String(DEFAULTS.priorityPayments));
    setCalcInputs(DEFAULTS);
    setResults(computeMeans(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the Chapter 7 means test?",
      answer:
        "The means test is the formula Congress created in 2005 to decide whether a debtor with mostly consumer debt may file Chapter 7 or must instead repay under Chapter 13. It compares your current monthly income with your state's median income for a household of your size. Below the median you generally pass; above it, the test subtracts allowed expenses from income and checks whether the leftover is large enough to repay a meaningful share of your unsecured debts over five years.",
    },
    {
      question: "What counts as current monthly income?",
      answer:
        "Current monthly income is the average monthly income from all sources for the six full calendar months before you file, with certain exclusions such as Social Security benefits for most filers. It is not your income on the day of filing, and irregular income — bonuses, commissions, seasonal work — is averaged. Because the window is fixed, the timing of a filing can change the result, which is why attorneys often model several filing dates.",
    },
    {
      question: "How is disposable income calculated above the median?",
      answer:
        "The means test uses standardized allowances rather than your actual spending. Living expenses come from IRS National and Local Standards for your county and household size, plus actual payments on secured debts like mortgages and car loans, and priority debts like taxes and support. Charitable contributions and some other obligations are added. What remains after those deductions, multiplied by sixty, is compared with the statutory thresholds to test for a presumption of abuse.",
    },
    {
      question: "When does the means test presume abuse?",
      answer:
        "If your annualized income exceeds the state median, the presumption of abuse arises when sixty times your monthly disposable income is at least $15,150, or at least the greater of 25% of your nonpriority unsecured debt or $9,075. The amount over the line is what you could theoretically pay creditors over five years; if it is large enough, the court presumes Chapter 7 is abusive and the case is generally dismissed or converted unless you rebut the presumption with special circumstances.",
    },
    {
      question: "Is this calculator a substitute for legal advice?",
      answer:
        "No. The real means test is a detailed form — Official Form 122A — that applies county-level standards, treats different debt types under specific rules, and includes special circumstances that can rebut a presumption of abuse. This tool condenses the arithmetic so you can see where the statutory lines fall, but a bankruptcy attorney should run the official form before you act on the result.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Bankruptcy Means Test Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Bankruptcy Means Test Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income & Household">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="monthly-income"
                  label="Current Monthly Income"
                  value={monthlyIncome}
                  onChange={setMonthlyIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Six-month average of all income before filing."
                />
                <CompactInput
                  id="household-size"
                  label="Household Size"
                  value={householdSize}
                  onChange={setHouseholdSize}
                  onEnter={runCalculate}
                  min="1"
                  tooltip="Number of people in the household, which sets the median comparison."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="unsecured-debt"
                  label="Nonpriority Unsecured Debt"
                  value={unsecuredDebt}
                  onChange={setUnsecuredDebt}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Credit cards, medical bills, personal loans — the debt the test measures."
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
                  <SubSection title="Median & Deductions">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="state-median"
                        label="State Median Income"
                        value={stateMedian}
                        onChange={setStateMedian}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Median monthly income for your household size in your state."
                      />
                      <CompactInput
                        id="living-expenses"
                        label="Allowed Living Expenses"
                        value={livingExpenses}
                        onChange={setLivingExpenses}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="IRS National and Local Standards allowance for your county."
                      />
                      <CompactInput
                        id="secured-payments"
                        label="Secured Debt Payments"
                        value={securedPayments}
                        onChange={setSecuredPayments}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Mortgage and car payments contractually due."
                      />
                      <CompactInput
                        id="priority-payments"
                        label="Priority Debt Payments"
                        value={priorityPayments}
                        onChange={setPriorityPayments}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Taxes, support and other priority obligations."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Disposable Income</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.disposable, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.aboveMedian
                  ? "Income is above your state median — the full test applies"
                  : "Income is below your state median — generally passes"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Annualized Income
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.annualizedIncome, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  60-Month Total
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.sixtyMonthTotal, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Outcome</span>
                <span className={`font-extrabold ${results.presumption ? "text-red-600" : "text-emerald-600"}`}>
                  {results.presumption ? "Abuse presumed" : "No presumption"}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Statutory Step</th>
                    <th className="p-2.5 text-right w-[150px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Monthly income vs median</td>
                    <td className="p-2.5 text-right text-foreground">
                      ${fmt(calcInputs.monthlyIncome, 0)} vs ${fmt(calcInputs.stateMedian, 0)}
                    </td>
                    <td className={`p-2.5 pr-3 text-right font-semibold ${results.aboveMedian ? "text-red-600" : "text-emerald-600"}`}>
                      {results.aboveMedian ? "Above" : "Below"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Allowed deductions</td>
                    <td className="p-2.5 text-right text-foreground">
                      ${fmt(calcInputs.livingExpenses + calcInputs.securedPayments + calcInputs.priorityPayments, 0)}
                    </td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">Deducted</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Test A: 25% of unsecured debt</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.thresholdA, 0)}</td>
                    <td className={`p-2.5 pr-3 text-right font-semibold ${results.testAPass ? "text-red-600" : "text-emerald-600"}`}>
                      {results.testAPass ? "Met" : "Not met"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Test B: statutory cap</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.thresholdB, 0)}</td>
                    <td className={`p-2.5 pr-3 text-right font-semibold ${results.testBPass ? "text-red-600" : "text-emerald-600"}`}>
                      {results.testBPass ? "Met" : "Not met"}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Presumption of abuse</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.sixtyMonthTotal, 0)} x 60</td>
                    <td className={`p-2.5 pr-3 text-right ${results.presumption ? "text-red-600" : "text-emerald-600"}`}>
                      {results.presumption ? "Presumed" : "None"}
                    </td>
                  </tr>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Household Size</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.householdSize, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    State Median (Monthly)
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.stateMedian, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Allowed Deductions
                  </span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(calcInputs.livingExpenses + calcInputs.securedPayments + calcInputs.priorityPayments, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    60-Month Total vs Debt
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.debtSharePct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Chapter 7 Signal
                  </span>
                  <span className={`text-base font-bold ${results.presumption ? "text-red-600" : "text-emerald-600"}`}>
                    {results.presumption ? "Chapter 13 likely" : "Chapter 7 generally available"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Threshold Used
                  </span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(Math.min(results.thresholdA, results.thresholdB), 0)} to ${fmt(Math.max(results.thresholdA, results.thresholdB), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Bankruptcy Means Test Calculator?</h2>
            <p>
              A bankruptcy means test calculator condenses the arithmetic behind the Chapter 7 eligibility test into a
              single page. The means test exists to keep debtors who can afford to repay part of their unsecured debts
              out of Chapter 7, steering them into a five-year Chapter 13 plan instead. The first question it asks is
              simple: is your current monthly income above or below the median income for a household of your size in
              your state? Below the median, you generally pass and the deeper calculation is never reached.
            </p>
            <p>
              Above the median the test becomes a subtraction exercise governed by statute. Allowed living expenses —
              the IRS National and Local Standards for your county — secured debt payments and priority obligations are
              deducted from income. What remains is disposable income, and the law asks whether sixty months of it could
              pay a meaningful share of what you owe. Two thresholds answer that: twenty-five percent of your nonpriority
              unsecured debt, and a fixed statutory cap. Cross the right line and the court presumes abuse.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator annualizes current monthly income and compares it with the state median for your household
              size. If income is above the median, it totals the allowed deductions, subtracts them from income and
              multiplies the residue by sixty. That five-year total is then tested against both statutory thresholds:
              the greater of twenty-five percent of nonpriority unsecured debt or $9,075 for the first test, and the
              $15,150 cap for the second. Meeting either test, while above the median, produces a presumption of abuse.
            </p>
            <p>
              The table shows each step — the median comparison, the deductions, both threshold tests and the final
              presumption — so the path to the answer is auditable. The calculator also reports how large the sixty-month
              total is relative to your unsecured debt, which is the ratio the test is ultimately measuring. Note how
              sensitive the result is to the deduction figures: because sixty times a single month&apos;s disposable
              income is compared with the thresholds, a deduction difference of a few hundred dollars can move the
              outcome by more than a thousand dollars of tested capacity, which is why the official form is worth running
              with precise county standards rather than comfortable estimates.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports monthly disposable income and whether your income sits above or below the state
              median. The three-stat bar frames the statutory question: annualized income, the sixty-month total and
              whether a presumption of abuse arises. A result of &quot;no presumption&quot; below the median means Chapter
              7 is generally available; above the median it means the deeper arithmetic did not reach the thresholds.
            </p>
            <p>
              Treat this as an estimate, not a ruling. The official test is Form 122A, which applies county-specific
              standards, distinguishes debt types under detailed rules, and allows special circumstances to rebut a
              presumption of abuse. Median figures change twice a year and vary by household size and state, so update
              the median input with current published data. If you are anywhere near a threshold, have a bankruptcy
              attorney run the official form before filing — small differences in deductions frequently decide the
              outcome.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bankruptcy-means-test-calculator" />
          <PopularCalculators exclude="/calculator/bankruptcy-means-test-calculator" />
        </div>
      </div>
    </>
  );
}
