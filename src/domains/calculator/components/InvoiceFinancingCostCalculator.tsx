"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FinancingInputs {
  invoiceValue: number;
  advanceRate: number;
  feeRate: number;
  days: number;
  serviceFee: number;
  facilityPct: number;
}

const DEFAULTS: FinancingInputs = {
  invoiceValue: 100000,
  advanceRate: 85,
  feeRate: 2,
  days: 60,
  serviceFee: 150,
  facilityPct: 0.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface FinancingResult {
  advance: number;
  periods: number;
  discountFee: number;
  serviceFeeTotal: number;
  facilityFee: number;
  totalCost: number;
  netProceeds: number;
  effectiveAnnualPct: number;
  costPerHundred: number;
  valid: boolean;
  errorMsg: string;
}

function computeFinancing(i: FinancingInputs): FinancingResult {
  const invalid =
    i.invoiceValue <= 0 || i.advanceRate <= 0 || i.advanceRate > 100 || i.feeRate < 0 || i.days <= 0 || i.facilityPct < 0;

  const advance = (i.invoiceValue * i.advanceRate) / 100;
  const periods = i.days / 30;
  const discountFee = advance * (i.feeRate / 100) * periods;
  const serviceFeeTotal = i.serviceFee * periods;
  const facilityFee = advance * (i.facilityPct / 100);
  const totalCost = discountFee + serviceFeeTotal + facilityFee;
  const years = i.days / 365;

  return {
    advance,
    periods,
    discountFee,
    serviceFeeTotal,
    facilityFee,
    totalCost,
    netProceeds: advance - totalCost,
    effectiveAnnualPct: advance > 0 && years > 0 ? (totalCost / advance / years) * 100 : 0,
    costPerHundred: advance > 0 ? (totalCost / advance) * 100 : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive invoice value, an advance rate between 0 and 100%, days above zero, and non-negative fee figures."
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

export default function InvoiceFinancingCostCalculator() {
  const [invoiceValue, setInvoiceValue] = useState(String(DEFAULTS.invoiceValue));
  const [advanceRate, setAdvanceRate] = useState(String(DEFAULTS.advanceRate));
  const [feeRate, setFeeRate] = useState(String(DEFAULTS.feeRate));
  const [days, setDays] = useState(String(DEFAULTS.days));
  const [serviceFee, setServiceFee] = useState(String(DEFAULTS.serviceFee));
  const [facilityPct, setFacilityPct] = useState(String(DEFAULTS.facilityPct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FinancingInputs => ({
    invoiceValue: parseFloat(invoiceValue) || 0,
    advanceRate: parseFloat(advanceRate) || 0,
    feeRate: parseFloat(feeRate) || 0,
    days: parseFloat(days) || 0,
    serviceFee: parseFloat(serviceFee) || 0,
    facilityPct: parseFloat(facilityPct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<FinancingInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FinancingResult>(() => computeFinancing(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeFinancing(inputs));
  };

  const reset = () => {
    setInvoiceValue(String(DEFAULTS.invoiceValue));
    setAdvanceRate(String(DEFAULTS.advanceRate));
    setFeeRate(String(DEFAULTS.feeRate));
    setDays(String(DEFAULTS.days));
    setServiceFee(String(DEFAULTS.serviceFee));
    setFacilityPct(String(DEFAULTS.facilityPct));
    setCalcInputs(DEFAULTS);
    setResults(computeFinancing(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is invoice financing and how does it differ from factoring?",
      answer:
        "Invoice financing, often called invoice discounting, lets a business borrow against outstanding invoices while keeping control of the sales ledger and the collection process. The finance provider advances a percentage of the invoice value and charges a discount fee for the period the money is outstanding. Factoring is different: the provider buys the receivable, takes over collections and usually handles credit control, charging a service fee on top of the discount. Financing is cheaper and lower-touch; factoring is more expensive but removes the administration.",
    },
    {
      question: "How is the cost of invoice financing calculated?",
      answer:
        "The provider advances a percentage of the invoice, typically between seventy and ninety percent, and charges a discount fee expressed as a percentage of the amount advanced for each thirty-day period the money is outstanding. On top of that there may be a monthly service charge and a one-off facility fee. The calculator applies the discount rate per thirty days based on the days until the invoice is expected to be paid, adds the other charges, then annualises the total against the amount advanced.",
    },
    {
      question: "Why is the effective annual rate higher than the quoted discount?",
      answer:
        "Because the discount is charged over a short period but expressed against the whole year. A two percent discount over sixty days is not two percent a year; annualised against the advance it is roughly twelve percent. The calculator performs that conversion so the cost can be compared with a bank overdraft, a business line of credit, or a term loan, all of which quote annual rates and therefore look less expensive than they may actually be at short maturities.",
    },
    {
      question: "What determines the advance rate?",
      answer:
        "The creditworthiness of your customers and the concentration of the invoice book. Providers advance a higher percentage against strong, established debtors and a lower percentage against newer or smaller customers, and they often apply concentration limits so no single debtor dominates the facility. Invoices that are past due, disputed, or due from overseas customers may be excluded from the borrowing base altogether.",
    },
    {
      question: "Is invoice financing suitable for every business?",
      answer:
        "It suits businesses that invoice other businesses on credit terms and have cash tied up in receivables but a healthy order book. It is less useful for businesses that sell to consumers, invoice small amounts infrequently, or already have strong cash flow. Because the cost annualises well above a bank facility, the sensible test is whether the invoice financing lets you take on work or fund growth at a return higher than its effective rate.",
    },
  ];

  const breakdownRows = [
    { label: "Advance Received", amount: `$${fmt(results.advance, 0)}`, basis: `${fmt(calcInputs.advanceRate, 1)}% of invoice` },
    {
      label: "Discount Fee",
      amount: `$${fmt(results.discountFee, 0)}`,
      basis: `${fmt(calcInputs.feeRate, 2)}% × ${fmt(results.periods, 2)} × 30-day periods`,
    },
    { label: "Monthly Service Fee", amount: `$${fmt(results.serviceFeeTotal, 0)}`, basis: `${fmt(results.periods, 2)} months` },
    { label: "Facility Fee", amount: `$${fmt(results.facilityFee, 0)}`, basis: `${fmt(calcInputs.facilityPct, 2)}% one-off` },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Invoice Financing Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Invoice Financing Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Invoice">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="value"
                  label="Invoice Value"
                  value={invoiceValue}
                  onChange={setInvoiceValue}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Total value of the invoices being financed."
                />
                <CompactInput
                  id="advance-rate"
                  label="Advance Rate"
                  value={advanceRate}
                  onChange={setAdvanceRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.5"
                  tooltip="Percentage of the invoice value advanced up front."
                />
              </div>
            </SubSection>

            <SubSection title="Fees & Timing">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="fee-rate"
                  label="Discount Fee"
                  value={feeRate}
                  onChange={setFeeRate}
                  onEnter={runCalculate}
                  suffix="%/30d"
                  step="0.05"
                  tooltip="Fee charged per thirty-day period on the amount advanced."
                />
                <CompactInput
                  id="days"
                  label="Days Until Payment"
                  value={days}
                  onChange={setDays}
                  onEnter={runCalculate}
                  suffix="days"
                  tooltip="Expected time until the customer pays the invoice."
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
                  <SubSection title="Charges">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="service"
                        label="Service Fee / mo"
                        value={serviceFee}
                        onChange={setServiceFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly administration or ledger-management charge."
                      />
                      <CompactInput
                        id="facility"
                        label="Facility Fee"
                        value={facilityPct}
                        onChange={setFacilityPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        min="0"
                        tooltip="One-off fee charged on the amount advanced."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Effective Annual Cost</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.effectiveAnnualPct, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                ${fmt(results.totalCost, 0)} to finance over {fmt(calcInputs.days, 0)} days
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Advance</span>
                <span className="font-extrabold text-foreground">${fmt(results.advance, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Fees</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalCost, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Proceeds</span>
                <span className="font-extrabold text-foreground">${fmt(results.netProceeds, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
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
                    <td className="p-2.5 pl-3 text-foreground">Total Cost of Financing</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalCost, 0)}</td>
                    <td className="p-2.5 pr-3 text-foreground">Annualised {fmt(results.effectiveAnnualPct, 1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Invoice Value</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.invoiceValue, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Advance Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.advanceRate, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Discount Fee</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.discountFee, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Other Fees</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(results.serviceFeeTotal + results.facilityFee, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per $100 Advanced</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.costPerHundred)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Periods (30 days)</span>
                  <span className="text-base font-bold text-primary">{fmt(results.periods, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Invoice Financing Cost Calculator?</h2>
            <p>
              An invoice financing cost calculator works out what it costs to borrow against unpaid invoices while
              keeping control of your own sales ledger. Businesses that invoice other companies on credit terms often have
              large amounts of cash locked up in receivables. Invoice financing unlocks that cash by advancing a
              percentage of the invoice value immediately, with a discount fee charged for as long as the money is
              outstanding. Unlike factoring, the business retains the relationship with the customer and collects the
              invoice itself.
            </p>
            <p>
              The pricing structure is the part that most often causes confusion. Discount fees are quoted per thirty-day
              period rather than per year, so a short financing term makes the cost look small in absolute dollars while
              the annualised equivalent is materially higher. This calculator converts the whole fee package into an
              effective annual rate so the facility can be measured against a bank line, an overdraft or a term loan on
              equal terms.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The advance is the invoice value multiplied by the advance rate. The discount fee is the advance multiplied
              by the discount rate and by the number of thirty-day periods the invoice is expected to remain unpaid, which
              is the days until payment divided by thirty. Any monthly service charge is multiplied by the same number of
              periods, and a facility fee, where charged, is a one-off percentage of the advance. The three are summed into
              a total cost, and net proceeds is the advance minus that cost.
            </p>
            <p>
              To annualise the cost, the calculator divides the total cost by the advance and by the term expressed in
              years, which is the days until payment divided by 365. That yields the effective annual rate that the
              financing is really costing, independent of how short or long the individual invoice term happens to be.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the effective annual cost, with the absolute cost over the term beneath it. The three
              statistics beside it give the advance received, total fees and net proceeds, so the cash actually available
              is never confused with the headline advance figure. The breakdown table itemises the discount fee, service
              charge and facility fee with the basis used to compute each, and the summary adds the cost per hundred
              dollars advanced and the number of thirty-day periods charged.
            </p>
            <p>
              Treat the output as a planning estimate: providers quote discount rates differently, some charge on the
              invoice value rather than the advance, and early payment by the customer shortens the chargeable period and
              therefore the cost. The most useful comparison is the effective annual rate against the alternatives you
              genuinely have. If a bank line is available at single-digit rates, invoice financing will almost always be
              the more expensive option, but if the choice is between financing and turning down work, the relevant test is
              whether the funded work earns more than the effective rate shown here.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/invoice-financing-cost-calculator" />
          <PopularCalculators exclude="/calculator/invoice-financing-cost-calculator" />
        </div>
      </div>
    </>
  );
}
