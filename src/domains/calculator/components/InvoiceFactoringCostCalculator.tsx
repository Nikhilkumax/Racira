"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FactoringInputs {
  invoiceValue: number;
  advanceRate: number;
  feeRate: number;
  days: number;
  servicePct: number;
}

const DEFAULTS: FactoringInputs = {
  invoiceValue: 100000,
  advanceRate: 85,
  feeRate: 2,
  days: 45,
  servicePct: 1,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface FactoringResult {
  advance: number;
  periods: number;
  discountFee: number;
  serviceFee: number;
  totalCost: number;
  reserve: number;
  effectiveAnnualPct: number;
  costPerHundred: number;
  netIfCollectedOnTime: number;
  valid: boolean;
  errorMsg: string;
}

function computeFactoring(i: FactoringInputs): FactoringResult {
  const invalid =
    i.invoiceValue <= 0 || i.advanceRate <= 0 || i.advanceRate > 100 || i.feeRate < 0 || i.days <= 0 || i.servicePct < 0;

  const advance = (i.invoiceValue * i.advanceRate) / 100;
  const periods = i.days / 30;
  // Factors typically charge the discount on the invoice face value per 30-day period.
  const discountFee = i.invoiceValue * (i.feeRate / 100) * periods;
  const serviceFee = i.invoiceValue * (i.servicePct / 100);
  const totalCost = discountFee + serviceFee;
  const reserve = i.invoiceValue - advance - totalCost;
  const years = i.days / 365;

  return {
    advance,
    periods,
    discountFee,
    serviceFee,
    totalCost,
    reserve,
    effectiveAnnualPct: advance > 0 && years > 0 ? (totalCost / advance / years) * 100 : 0,
    costPerHundred: advance > 0 ? (totalCost / advance) * 100 : 0,
    netIfCollectedOnTime: advance + reserve,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive invoice value, an advance rate between 0 and 100%, days above zero, and non-negative fee percentages."
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

export default function InvoiceFactoringCostCalculator() {
  const [invoiceValue, setInvoiceValue] = useState(String(DEFAULTS.invoiceValue));
  const [advanceRate, setAdvanceRate] = useState(String(DEFAULTS.advanceRate));
  const [feeRate, setFeeRate] = useState(String(DEFAULTS.feeRate));
  const [days, setDays] = useState(String(DEFAULTS.days));
  const [servicePct, setServicePct] = useState(String(DEFAULTS.servicePct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FactoringInputs => ({
    invoiceValue: parseFloat(invoiceValue) || 0,
    advanceRate: parseFloat(advanceRate) || 0,
    feeRate: parseFloat(feeRate) || 0,
    days: parseFloat(days) || 0,
    servicePct: parseFloat(servicePct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<FactoringInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FactoringResult>(() => computeFactoring(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeFactoring(inputs));
  };

  const reset = () => {
    setInvoiceValue(String(DEFAULTS.invoiceValue));
    setAdvanceRate(String(DEFAULTS.advanceRate));
    setFeeRate(String(DEFAULTS.feeRate));
    setDays(String(DEFAULTS.days));
    setServicePct(String(DEFAULTS.servicePct));
    setCalcInputs(DEFAULTS);
    setResults(computeFactoring(DEFAULTS));
  };

  const faqs = [
    {
      question: "How does invoice factoring work?",
      answer:
        "In factoring you sell your invoices to a finance company, which takes over collection and often credit control. The factor advances a percentage of the invoice value immediately, typically eighty to ninety percent, and holds the remainder as a reserve. When your customer pays, the factor releases the reserve minus its fees. In exchange for the fee, the business converts a receivable into cash, outsources collections, and, in non-recourse arrangements, transfers the risk of non-payment.",
    },
    {
      question: "What fees does a factor charge?",
      answer:
        "Two main charges: a discount fee, quoted as a percentage of the invoice value per thirty-day period, and a service fee, quoted as a percentage of the invoice value for administration and collections. Some agreements add a minimum monthly volume charge or an application fee. Because the discount fee is charged on the face value for each thirty-day period the invoice remains unpaid, a slow-paying customer directly increases the cost of the facility.",
    },
    {
      question: "What is the reserve and when do I receive it?",
      answer:
        "The reserve is the portion of the invoice the factor withholds: the invoice value minus the advance and minus the fees. It is released once the customer has paid in full and the factor has deducted its charges. If the customer pays late, the reserve is held longer and the discount fee continues to accrue, which is why collecting promptly is in the client&apos;s financial interest even though the factor handles the process.",
    },
    {
      question: "Is factoring more expensive than invoice financing?",
      answer:
        "Usually yes. Factoring bundles credit control and collections into the price, so it carries a service fee that invoice discounting does not. Where a business has its own efficient credit function, invoice financing is generally the cheaper route, since it charges only the discount cost of the advance. Factoring earns its premium when the administration saved, and the risk transferred in non-recourse arrangements, are worth more than the service fee.",
    },
    {
      question: "Does factoring affect my customers or my credit?",
      answer:
        "Customers are notified in disclosed factoring and instructed to pay the factor directly, which some businesses see as a signal about their cash position; undisclosed factoring avoids that by keeping collections in your name. Factoring itself does not appear as debt on your balance sheet because you have sold an asset rather than borrowed, though lenders will still want to see the commitments. The creditworthiness of your customers, not your own, drives approval in most non-recourse arrangements.",
    },
  ];

  const breakdownRows = [
    { label: "Advance Paid Up Front", amount: `$${fmt(results.advance, 0)}`, basis: `${fmt(calcInputs.advanceRate, 1)}% of invoice` },
    {
      label: "Discount Fee",
      amount: `$${fmt(results.discountFee, 0)}`,
      basis: `${fmt(calcInputs.feeRate, 2)}% × ${fmt(results.periods, 2)} × 30-day periods`,
    },
    { label: "Service Fee", amount: `$${fmt(results.serviceFee, 0)}`, basis: `${fmt(calcInputs.servicePct, 2)}% of invoice` },
    { label: "Reserve Held Back", amount: `$${fmt(results.reserve, 0)}`, basis: "Released on collection" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Invoice Factoring Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Invoice Factoring Cost Calculator
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
                  tooltip="Face value of the invoice being factored."
                />
                <CompactInput
                  id="advance-rate"
                  label="Advance Rate"
                  value={advanceRate}
                  onChange={setAdvanceRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.5"
                  tooltip="Percentage of the invoice advanced immediately."
                />
              </div>
            </SubSection>

            <SubSection title="Fees & Collection">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="fee-rate"
                  label="Discount Fee"
                  value={feeRate}
                  onChange={setFeeRate}
                  onEnter={runCalculate}
                  suffix="%/30d"
                  step="0.05"
                  tooltip="Discount charge per thirty-day period on the invoice value."
                />
                <CompactInput
                  id="days"
                  label="Days to Collection"
                  value={days}
                  onChange={setDays}
                  onEnter={runCalculate}
                  suffix="days"
                  tooltip="Expected time until the customer settles the invoice."
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
                  <SubSection title="Service Charge">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="service"
                        label="Service Fee"
                        value={servicePct}
                        onChange={setServicePct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        min="0"
                        tooltip="Administration and collections fee as a percentage of the invoice."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Reserve: ${fmt(results.reserve, 0)}
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Cost of Factoring</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${fmt(results.totalCost, 0)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.effectiveAnnualPct, 1)}% effective annual cost on the advance
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reserve</span>
                <span className="font-extrabold text-foreground">${fmt(results.reserve, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Annual</span>
                <span className="font-extrabold text-foreground">{fmt(results.effectiveAnnualPct, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
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
                    <td className="p-2.5 pl-3 text-foreground">Total Fees</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalCost, 0)}</td>
                    <td className="p-2.5 pr-3 text-foreground">${fmt(results.costPerHundred)} per $100 advanced</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Service Fee</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.serviceFee, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Received on Time</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.netIfCollectedOnTime, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Annual Cost</span>
                  <span className="text-base font-bold text-primary">{fmt(results.effectiveAnnualPct, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Invoice Factoring Cost Calculator?</h2>
            <p>
              An invoice factoring cost calculator shows what a business pays to sell its receivables and have the factor
              collect them. Factoring converts an outstanding invoice into immediate cash: the factor advances most of the
              value up front, retains a reserve, and charges both a discount fee and a service fee. Because the factor
              takes over credit control and collections, factoring is a managed service as much as a source of finance,
              and its cost structure reflects both.
            </p>
            <p>
              The two charge types pull in different directions. The discount fee works like interest, growing with each
              thirty-day period the invoice stays unpaid, while the service fee is a percentage of the invoice value for
              handling administration. Together they can make factoring the most expensive form of receivables finance
              available, so converting the whole package into an effective annual rate is the only fair way to judge
              whether the convenience and risk transfer are worth the price.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The advance is the invoice value multiplied by the advance rate. The discount fee is the invoice face value
              multiplied by the discount rate and by the number of thirty-day periods to collection, which is the days
              divided by thirty, reflecting the common practice of charging the discount on face value rather than on the
              advance. The service fee is a percentage of the invoice value, and the total of the two is the cost of
              factoring.
            </p>
            <p>
              The reserve is what remains: the invoice value minus the advance and minus the fees. It is released when the
              customer pays, making the total received on time equal to the advance plus the reserve, which in turn equals
              the invoice value minus the fees. The effective annual cost is the total fees divided by the advance and by
              the term in years, giving a rate that can be compared directly with invoice financing or a bank line.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the total dollar cost of factoring, with the effective annual cost stated beneath it
              because the raw figure can understate the expense on short terms. The three statistics beside it give the
              advance, the reserve held back, and the effective annual rate. The breakdown table lays out the advance, both
              fee types, and the reserve so the cash flow at each stage is clear.
            </p>
            <p>
              Summary Statistics adds the total received when the customer pays on time and repeats the effective annual
              cost, which is the number to weigh against alternatives. Two cautions apply. First, late-paying customers
              extend the chargeable period and therefore raise the cost, since the discount fee keeps accruing until
              collection. Second, some agreements include minimum volume commitments and recourse terms that shift
              unpaid-invoice risk back to you, so the risk transfer factored into the price should be verified before
              relying on it. Treat these results as a planning estimate and confirm the exact fee schedule and recourse
              terms with the factor.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/invoice-factoring-cost-calculator" />
          <PopularCalculators exclude="/calculator/invoice-factoring-cost-calculator" />
        </div>
      </div>
    </>
  );
}
