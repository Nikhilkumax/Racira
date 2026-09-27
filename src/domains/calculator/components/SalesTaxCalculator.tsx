"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Mode = "add" | "extract";

interface SalesTaxInputs {
  amount: number;
  taxRate: number;
  localRate: number;
  mode: Mode;
}

const DEFAULTS: SalesTaxInputs = {
  amount: 100,
  taxRate: 7,
  localRate: 0,
  mode: "add",
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v)
    ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const RATE_LADDER = [4, 5, 6, 7, 7.25, 8, 9, 10];

interface RateRow {
  rate: number;
  tax: number;
  total: number;
}

interface SalesTaxResult {
  valid: boolean;
  errorMsg: string;
  basePrice: number;
  stateTax: number;
  localTax: number;
  totalTax: number;
  total: number;
  effectiveRate: number;
  combinedRate: number;
  ladder: RateRow[];
}

function computeSalesTax(input: SalesTaxInputs): SalesTaxResult {
  const { amount, taxRate, localRate, mode } = input;

  const blank: SalesTaxResult = {
    valid: false,
    errorMsg: "",
    basePrice: 0,
    stateTax: 0,
    localTax: 0,
    totalTax: 0,
    total: 0,
    effectiveRate: 0,
    combinedRate: 0,
    ladder: [],
  };

  if (!Number.isFinite(amount) || !Number.isFinite(taxRate) || !Number.isFinite(localRate)) {
    return { ...blank, errorMsg: "Enter a price and a tax rate to run the calculation." };
  }
  if (amount <= 0) {
    return { ...blank, errorMsg: "The amount must be greater than zero." };
  }
  if (taxRate < 0 || localRate < 0) {
    return { ...blank, errorMsg: "Tax rates cannot be negative." };
  }
  const combinedRate = taxRate + localRate;
  if (mode === "extract" && combinedRate <= 0) {
    return { ...blank, errorMsg: "To pull tax out of a total, enter a tax rate above zero first." };
  }

  let basePrice: number;
  let total: number;

  if (mode === "add") {
    basePrice = amount;
    total = amount * (1 + combinedRate / 100);
  } else {
    total = amount;
    basePrice = amount / (1 + combinedRate / 100);
  }

  const stateTax = basePrice * (taxRate / 100);
  const localTax = basePrice * (localRate / 100);
  const totalTax = stateTax + localTax;
  const effectiveRate = basePrice !== 0 ? (totalTax / basePrice) * 100 : 0;

  const ladder: RateRow[] = RATE_LADDER.map((r) => {
    if (mode === "add") {
      const tax = basePrice * ((r + localRate) / 100);
      return { rate: r + localRate, tax: Number(tax.toFixed(2)), total: Number((basePrice + tax).toFixed(2)) };
    }
    const pre = total / (1 + (r + localRate) / 100);
    return { rate: r + localRate, tax: Number((total - pre).toFixed(2)), total: Number(total.toFixed(2)) };
  });

  return {
    valid: true,
    errorMsg: "",
    basePrice: Number(basePrice.toFixed(2)),
    stateTax: Number(stateTax.toFixed(2)),
    localTax: Number(localTax.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    total: Number(total.toFixed(2)),
    effectiveRate: Number(effectiveRate.toFixed(4)),
    combinedRate: Number(combinedRate.toFixed(4)),
    ladder,
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

export default function SalesTaxCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [localRate, setLocalRate] = useState(String(DEFAULTS.localRate));
  const [mode, setMode] = useState<Mode>(DEFAULTS.mode);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SalesTaxInputs => ({
    amount: parseFloat(amount) || 0,
    taxRate: parseFloat(taxRate) || 0,
    localRate: parseFloat(localRate) || 0,
    mode,
  });

  const [calcInputs, setCalcInputs] = useState<SalesTaxInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SalesTaxResult>(() => computeSalesTax(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSalesTax(inputs));
  };

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setTaxRate(String(DEFAULTS.taxRate));
    setLocalRate(String(DEFAULTS.localRate));
    setMode(DEFAULTS.mode);
    setCalcInputs(DEFAULTS);
    setResults(computeSalesTax(DEFAULTS));
  };

  const MODES: { key: Mode; label: string }[] = [
    { key: "add", label: "Add Tax" },
    { key: "extract", label: "Extract Tax" },
  ];

  const faqs = [
    {
      question: "How do I add sales tax to a price?",
      answer:
        "Multiply the pre-tax price by the tax rate as a decimal and add it back. A hundred dollar item with a seven percent rate carries seven dollars of tax and costs a hundred and seven dollars. Combined state and local rates are simply added together before the multiplication.",
    },
    {
      question: "How do I remove sales tax from a total?",
      answer:
        "Divide the tax-inclusive total by one plus the rate as a decimal. A hundred and seven dollar total at seven percent divides by 1.07 to give exactly one hundred dollars before tax. Do not simply subtract seven percent of the total, because that would take seven dollars off and leave the wrong answer.",
    },
    {
      question: "Do local taxes apply to the same base as state tax?",
      answer:
        "In most jurisdictions city and county rates apply to the same taxable amount as the state rate, so the combined percentage is the sum of the parts. Some areas exempt certain categories from one level but not the other, which is why the calculator reports each layer separately so you can adjust the base if your receipt shows a different split.",
    },
    {
      question: "Why is tax charged on the discounted price?",
      answer:
        "Sales tax is levied on the amount actually paid, so a discount reduces the taxable base along with the price. Apply the discount first, then the tax, and the total will match the receipt. Store coupons funded by the retailer usually reduce the taxable amount, while manufacturer coupons sometimes do not, depending on local rules.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Sales Tax Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sales Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Direction">
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    aria-pressed={mode === m.key}
                    className={
                      mode === m.key
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </SubSection>

            <SubSection title={mode === "add" ? "Pre-Tax Amount" : "Amount Paid"}>
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Amount"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip={
                    mode === "add"
                      ? "The price before any sales tax is added."
                      : "The tax-inclusive figure printed on the receipt."
                  }
                />
                <CompactInput
                  id="tax-rate"
                  label="Sales Tax Rate"
                  value={taxRate}
                  onChange={setTaxRate}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="State rate, or the combined state rate when a local rate is added below."
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
                  <SubSection title="Local Surcharge">
                    <CompactInput
                      id="local-rate"
                      label="City / County Rate"
                      value={localRate}
                      onChange={setLocalRate}
                      onEnter={runCalculate}
                      suffix="%"
                      hint="Added to the state rate to produce the combined rate."
                      tooltip="Local sales tax layered on top of the state rate."
                    />
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
                {calcInputs.mode === "add" ? "Total With Tax" : "Price Before Tax"}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(calcInputs.mode === "add" ? results.total : results.basePrice) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? calcInputs.mode === "add"
                    ? `${money(results.basePrice)} plus ${money(results.totalTax)} of tax at ${fmt(results.combinedRate, 2)}%`
                    : `${money(results.total)} includes ${money(results.totalTax)} of tax at ${fmt(results.combinedRate, 2)}%`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tax Amount</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.totalTax) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Combined Rate</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.combinedRate, 2)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pre-Tax</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.basePrice) : "—"}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Line</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Pre-Tax Price</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.basePrice)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">State Tax</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.taxRate, 2)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.stateTax)}</td>
                  </tr>
                  {calcInputs.localRate > 0 && (
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Local Tax</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.localRate, 2)}%</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(results.localTax)}</td>
                    </tr>
                  )}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total Tax</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.combinedRate, 2)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.totalTax)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Paid</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{money(results.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RATE LADDER */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Combined Rate</th>
                    <th className="p-2.5 text-right">Tax</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Total Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.ladder.map((row) => (
                    <tr
                      key={row.rate}
                      className={row.rate === results.combinedRate ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{fmt(row.rate, 2)}%</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.tax)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.total)}</td>
                    </tr>
                  ))}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mode</span>
                  <span className="text-base font-bold text-foreground">
                    {calcInputs.mode === "add" ? "Adding tax" : "Extracting tax"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Entered Amount</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.amount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Tax Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveRate, 4)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax Share of Total</span>
                  <span className="text-base font-bold text-foreground">
                    {results.total > 0 ? `${fmt((results.totalTax / results.total) * 100, 4)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Pre-Tax Price</span>
                  <span className="text-base font-bold text-foreground">{money(results.basePrice)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</span>
                  <span className="text-base font-bold text-foreground">{money(results.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Sales Tax Calculator?</h2>
            <p>
              A sales tax calculator adds a tax rate to a price or pulls tax back out of a total. Both directions are common:
              shoppers want to know what a shelf price really costs, and anyone reconciling a receipt needs to know how much
              of a total was tax. The tool reports the pre-tax amount, the tax itself and the final figure so all three can be
              checked against the paperwork.
            </p>
            <p>
              State, county and city rates often stack, producing a combined percentage that appears nowhere on the price tag.
              Because every layer is charged on the same taxable amount in most places, the layers can be added together
              before the multiplication, and the calculator shows each one separately so the split on a receipt can be matched.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Adding tax is the simpler direction. Convert the combined rate to a decimal, multiply the pre-tax price by it to
              get the tax, then add the two together. A seventy-five dollar item at 7.25 percent carries about five dollars and
              forty-four cents of tax and totals roughly eighty dollars and forty-four cents, and the same arithmetic scales to
              any basket size.
            </p>
            <p>
              Extracting tax runs the formula backwards, which is where most mistakes happen. Dividing the inclusive total by
              one plus the rate recovers the pre-tax price, and the difference between that figure and the total is the tax.
              Subtracting the tax percentage from the total instead gives an answer that is too low, because the rate applies to
              the smaller pre-tax amount rather than to the total.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the number that matters for the direction you chose, with the tax amount, combined rate
              and pre-tax price in the three-stat bar. The first table itemises the state tax, any local surcharge and the
              total paid, and the second table applies a range of common combined rates to the same amount so you can see how
              a move across a state line changes the bill.
            </p>
            <p>
              Use the summary panels to cross-check a receipt. The effective tax rate should match the combined rate you
              entered, and the tax share of the total shows how much of what you paid is not going to the seller. If the
              receipt shows a different split between state and local tax, the base for one layer is probably narrower than the
              other.
            </p>
            <p>
              Keep the taxable base in mind when discounts are involved. Tax applies to the price after the discount, so
              coupons change the tax as well as the price, and a percent-off sale reduces the tax take proportionally. The
              handy consequence is that a sale is always slightly better than the sticker suggests, because the tax falls with
              the price. Save the combined rate you actually pay so later estimates start from the right figure, because
              rates change with legislation and a figure copied from an old receipt can be a full percentage point out of
              date within a year or two. Businesses pricing across several states should keep a small table of combined rates
              on hand rather than recalculating each time.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sales-tax-calculator" />
          <PopularCalculators exclude="/calculator/sales-tax-calculator" />
        </div>
      </div>
    </>
  );
}
