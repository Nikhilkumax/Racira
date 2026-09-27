"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AblInputs {
  borrowingBase: number;
  advanceRate: number;
  interestRate: number;
  months: number;
  commitmentPct: number;
  monitoringFee: number;
  servicingFee: number;
}

const DEFAULTS: AblInputs = {
  borrowingBase: 1000000,
  advanceRate: 80,
  interestRate: 9.5,
  months: 12,
  commitmentPct: 0.5,
  monitoringFee: 500,
  servicingFee: 250,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface AblResult {
  advance: number;
  monthlyInterest: number;
  interestCost: number;
  commitmentFee: number;
  monitoringCost: number;
  servicingCost: number;
  totalCost: number;
  effectiveAnnualPct: number;
  costPerHundred: number;
  totalRepaid: number;
  valid: boolean;
  errorMsg: string;
}

function computeAbl(i: AblInputs): AblResult {
  const invalid =
    i.borrowingBase <= 0 || i.advanceRate <= 0 || i.advanceRate > 100 || i.interestRate < 0 || i.months <= 0;

  const years = i.months / 12;
  const advance = (i.borrowingBase * i.advanceRate) / 100;
  const monthlyInterest = (advance * i.interestRate) / 100 / 12;
  const interestCost = monthlyInterest * i.months;
  const commitmentFee = advance * (i.commitmentPct / 100) * years;
  const monitoringCost = i.monitoringFee * i.months;
  const servicingCost = i.servicingFee * i.months;
  const totalCost = interestCost + commitmentFee + monitoringCost + servicingCost;

  return {
    advance,
    monthlyInterest,
    interestCost,
    commitmentFee,
    monitoringCost,
    servicingCost,
    totalCost,
    effectiveAnnualPct: advance > 0 && years > 0 ? (totalCost / advance / years) * 100 : 0,
    costPerHundred: advance > 0 ? (totalCost / advance) * 100 : 0,
    totalRepaid: advance + totalCost,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive borrowing base and term, an advance rate between 0 and 100%, and a non-negative interest rate."
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

export default function AssetBasedLendingCostCalculator() {
  const [borrowingBase, setBorrowingBase] = useState(String(DEFAULTS.borrowingBase));
  const [advanceRate, setAdvanceRate] = useState(String(DEFAULTS.advanceRate));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [commitmentPct, setCommitmentPct] = useState(String(DEFAULTS.commitmentPct));
  const [monitoringFee, setMonitoringFee] = useState(String(DEFAULTS.monitoringFee));
  const [servicingFee, setServicingFee] = useState(String(DEFAULTS.servicingFee));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AblInputs => ({
    borrowingBase: parseFloat(borrowingBase) || 0,
    advanceRate: parseFloat(advanceRate) || 0,
    interestRate: parseFloat(interestRate) || 0,
    months: parseFloat(months) || 0,
    commitmentPct: parseFloat(commitmentPct) || 0,
    monitoringFee: parseFloat(monitoringFee) || 0,
    servicingFee: parseFloat(servicingFee) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<AblInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AblResult>(() => computeAbl(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAbl(inputs));
  };

  const reset = () => {
    setBorrowingBase(String(DEFAULTS.borrowingBase));
    setAdvanceRate(String(DEFAULTS.advanceRate));
    setInterestRate(String(DEFAULTS.interestRate));
    setMonths(String(DEFAULTS.months));
    setCommitmentPct(String(DEFAULTS.commitmentPct));
    setMonitoringFee(String(DEFAULTS.monitoringFee));
    setServicingFee(String(DEFAULTS.servicingFee));
    setCalcInputs(DEFAULTS);
    setResults(computeAbl(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is asset-based lending?",
      answer:
        "Asset-based lending is a form of business financing secured by specific assets, most commonly accounts receivable, inventory and equipment. The lender advances a percentage of the value of those assets, called the borrowing base, and monitors the collateral on an ongoing basis. Because the loan is secured by liquid collateral rather than by cash flow alone, asset-based facilities are available to companies that might not qualify for an unsecured line of credit.",
    },
    {
      question: "What is an advance rate and why does it matter?",
      answer:
        "The advance rate is the percentage of eligible collateral the lender will lend against. A lender might advance eighty percent of accounts receivable under ninety days and fifty percent of inventory. The rate is effectively the lender's margin of safety against a shortfall in collection or liquidation, so lower-quality or slower-moving collateral carries a lower advance rate. A small change in the rate moves the amount of credit available considerably on a large borrowing base.",
    },
    {
      question: "Why is my effective cost higher than the stated interest rate?",
      answer:
        "Because interest is only one of the charges. Asset-based facilities typically also carry a commitment fee on the unused portion, a collateral monitoring or field-examination fee, servicing charges, and sometimes a minimum interest requirement. When every fee is expressed as a percentage of the amount actually advanced and annualised, the effective cost is almost always above the quoted rate. The calculator reports that blended figure, which is the number to compare against alternative financing.",
    },
    {
      question: "How is the borrowing base calculated?",
      answer:
        "The lender totals the eligible portion of your collateral, which for receivables means invoices that are current and within concentration limits, and for inventory means finished goods with a defined turnover. Ineligible items such as past-due invoices, foreign receivables and consigned stock are excluded. The advance rate is then applied to the eligible total to determine how much you can borrow at any given time, and the base is recalculated as invoices are paid and new ones are issued.",
    },
    {
      question: "Is asset-based lending expensive compared with a term loan?",
      answer:
        "Usually yes, on a percentage basis. The secured, monitored and revolving nature of the facility means more work for the lender, so the all-in cost is typically several points above a bank term loan or unsecured line. The trade-off is availability: asset-based lending provides scalable, asset-linked liquidity to businesses whose cash flow profile would not support conventional credit. Comparing the effective annual cost here against the rate on any alternative you are offered is the practical way to make the decision.",
    },
  ];

  const breakdownRows = [
    { label: "Interest", amount: `$${fmt(results.interestCost, 0)}`, basis: `$${fmt(results.monthlyInterest, 0)}/mo` },
    { label: "Commitment Fee", amount: `$${fmt(results.commitmentFee, 0)}`, basis: `${fmt(calcInputs.commitmentPct, 2)}%/yr` },
    { label: "Collateral Monitoring", amount: `$${fmt(results.monitoringCost, 0)}`, basis: `$${fmt(calcInputs.monitoringFee, 0)}/mo` },
    { label: "Servicing", amount: `$${fmt(results.servicingCost, 0)}`, basis: `$${fmt(calcInputs.servicingFee, 0)}/mo` },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Asset-Based Lending Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Asset-Based Lending Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Borrowing Base">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="base"
                  label="Eligible Borrowing Base"
                  value={borrowingBase}
                  onChange={setBorrowingBase}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Total eligible accounts receivable and inventory."
                />
                <CompactInput
                  id="advance"
                  label="Advance Rate"
                  value={advanceRate}
                  onChange={setAdvanceRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.5"
                  tooltip="Percentage of the borrowing base the lender will advance."
                />
              </div>
            </SubSection>

            <SubSection title="Rate & Term">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={interestRate}
                  onChange={setInterestRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="Annual interest rate on outstanding advances."
                />
                <CompactInput
                  id="months"
                  label="Term"
                  value={months}
                  onChange={setMonths}
                  onEnter={runCalculate}
                  suffix="months"
                  tooltip="Length of time the facility is outstanding."
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
                  <SubSection title="Fees">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="commitment"
                        label="Commitment Fee"
                        value={commitmentPct}
                        onChange={setCommitmentPct}
                        onEnter={runCalculate}
                        suffix="%/yr"
                        step="0.05"
                        min="0"
                        tooltip="Annual fee charged on the committed facility."
                      />
                      <CompactInput
                        id="monitoring"
                        label="Monitoring Fee"
                        value={monitoringFee}
                        onChange={setMonitoringFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly collateral monitoring or field-exam charge."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="servicing"
                        label="Servicing Fee"
                        value={servicingFee}
                        onChange={setServicingFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly servicing or administration fee."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Advance: ${fmt(results.advance, 0)}
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Effective Annual Cost</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.effectiveAnnualPct, 2)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                All-in cost vs a {fmt(calcInputs.interestRate, 2)}% stated rate
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Advance Amount</span>
                <span className="font-extrabold text-foreground">${fmt(results.advance, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalCost, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 text-right w-[130px]">Total</th>
                    <th className="p-2.5 pr-3">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.amount}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.basis}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Cost of Facility</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalCost, 0)}</td>
                    <td className="p-2.5 pr-3 text-foreground">Over {fmt(calcInputs.months, 0)} months</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Borrowing Base</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.borrowingBase, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Advance Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.advanceRate, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Credit Available</span>
                  <span className="text-base font-bold text-primary">${fmt(results.advance, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Cost</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.interestCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fees</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(results.commitmentFee + results.monitoringCost + results.servicingCost, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per $100 Advanced</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.costPerHundred)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Asset-Based Lending Cost Calculator?</h2>
            <p>
              An asset-based lending cost calculator works out the true, all-in cost of a facility secured by a
              company&apos;s receivables, inventory or equipment. Asset-based lending gives businesses access to a
              revolving line sized against the value of eligible collateral, which makes it available to companies whose
              cash flow would not support an unsecured loan. The trade-off is cost: because the facility is monitored and
              revolving, it carries fees beyond a simple interest rate, and those fees are easy to overlook when comparing
              offers.
            </p>
            <p>
              The headline interest rate is only part of the story. Commitment fees, collateral monitoring charges and
              servicing fees all add to the burden, and when they are expressed against the amount actually advanced the
              effective cost can sit well above the quoted rate. This calculator converts the whole package into a single
              annualised figure so the facility can be compared fairly against a term loan, an unsecured line, or a
              merchant cash advance.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The borrowing base, the total eligible collateral, is multiplied by the advance rate to determine the credit
              available. Interest is then charged on that advance at the stated annual rate, divided by twelve for a
              monthly figure and multiplied by the number of months the facility is outstanding. The commitment fee is
              applied to the advance as an annual percentage and pro-rated for the term, while the monitoring and servicing
              fees are charged per month and multiplied by the term.
            </p>
            <p>
              Every component is summed into a total cost, which is then divided by the advance and by the term in years to
              produce the effective annual cost. The calculator also expresses the total as a cost per hundred dollars
              advanced, which is a familiar way for borrowers to compare facilities of very different sizes on the same
              basis.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the effective annual cost, and the gap between it and the stated rate is the price of
              the fees. The three statistics beside it give the advance amount, the monthly interest charge and the total
              cost of the facility over the term. The breakdown table lists each component with its basis, so a fee that
              looks small in isolation can be judged against the whole.
            </p>
            <p>
              Summary Statistics adds the borrowing base, advance rate, credit available, total interest, total fees and
              the cost per hundred dollars advanced. Treat the output as a planning estimate: real facilities often
              include a minimum interest requirement, minimum usage conditions, and a termination fee, and the borrowing
              base itself fluctuates as invoices are issued and collected, so the average outstanding advance may differ
              from the figure used here. The most defensible comparison is the effective annual cost, since that is the
              number that captures the full price of the facility.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/asset-based-lending-cost-calculator" />
          <PopularCalculators exclude="/calculator/asset-based-lending-cost-calculator" />
        </div>
      </div>
    </>
  );
}
