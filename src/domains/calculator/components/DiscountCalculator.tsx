"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DiscountInputs {
  original: number;
  discountPercent: number;
  secondDiscountPercent: number;
  taxRate: number;
}

const DEFAULTS: DiscountInputs = {
  original: 120,
  discountPercent: 25,
  secondDiscountPercent: 0,
  taxRate: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v)
    ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const LADDER_LEVELS = [5, 10, 15, 20, 25, 30, 40, 50];

interface LadderRow {
  percent: number;
  saved: number;
  price: number;
}

interface DiscountResult {
  valid: boolean;
  errorMsg: string;
  saved: number;
  afterFirst: number;
  savedSecond: number;
  subtotal: number;
  totalSaved: number;
  effectiveDiscountPct: number;
  multiplier: number;
  tax: number;
  finalPrice: number;
  ladder: LadderRow[];
}

function computeDiscount(input: DiscountInputs): DiscountResult {
  const { original, discountPercent, secondDiscountPercent, taxRate } = input;

  const blank: DiscountResult = {
    valid: false,
    errorMsg: "",
    saved: 0,
    afterFirst: 0,
    savedSecond: 0,
    subtotal: 0,
    totalSaved: 0,
    effectiveDiscountPct: 0,
    multiplier: 1,
    tax: 0,
    finalPrice: 0,
    ladder: [],
  };

  if (!Number.isFinite(original) || !Number.isFinite(discountPercent)) {
    return { ...blank, errorMsg: "Enter the original price and the discount percentage." };
  }
  if (original <= 0) {
    return { ...blank, errorMsg: "The original price must be greater than zero." };
  }
  if (discountPercent < 0 || discountPercent >= 100) {
    return { ...blank, errorMsg: "A discount must be between 0 and 100 percent. Use 0 for no discount." };
  }
  if (secondDiscountPercent < 0 || secondDiscountPercent >= 100) {
    return { ...blank, errorMsg: "The extra stacked discount must be between 0 and 100 percent." };
  }
  if (taxRate < 0) {
    return { ...blank, errorMsg: "A sales tax rate cannot be negative." };
  }

  const saved = original * (discountPercent / 100);
  const afterFirst = original - saved;
  const savedSecond = afterFirst * (secondDiscountPercent / 100);
  const subtotal = afterFirst - savedSecond;
  const totalSaved = original - subtotal;
  const combinedKeep = (1 - discountPercent / 100) * (1 - secondDiscountPercent / 100);
  const effectiveDiscountPct = (1 - combinedKeep) * 100;
  const multiplier = subtotal / original;
  const tax = subtotal * (taxRate / 100);
  const finalPrice = subtotal + tax;

  const ladder: LadderRow[] = LADDER_LEVELS.map((p) => {
    const rowSaved = original * (p / 100);
    return {
      percent: p,
      saved: Number(rowSaved.toFixed(2)),
      price: Number((original - rowSaved).toFixed(2)),
    };
  });

  return {
    valid: true,
    errorMsg: "",
    saved: Number(saved.toFixed(2)),
    afterFirst: Number(afterFirst.toFixed(2)),
    savedSecond: Number(savedSecond.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    totalSaved: Number(totalSaved.toFixed(2)),
    effectiveDiscountPct: Number(effectiveDiscountPct.toFixed(4)),
    multiplier: Number(multiplier.toFixed(4)),
    tax: Number(tax.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
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

export default function DiscountCalculator() {
  const [original, setOriginal] = useState(String(DEFAULTS.original));
  const [discountPercent, setDiscountPercent] = useState(String(DEFAULTS.discountPercent));
  const [secondDiscountPercent, setSecondDiscountPercent] = useState(String(DEFAULTS.secondDiscountPercent));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DiscountInputs => ({
    original: parseFloat(original) || 0,
    discountPercent: parseFloat(discountPercent) || 0,
    secondDiscountPercent: parseFloat(secondDiscountPercent) || 0,
    taxRate: parseFloat(taxRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DiscountInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DiscountResult>(() => computeDiscount(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDiscount(inputs));
  };

  const reset = () => {
    setOriginal(String(DEFAULTS.original));
    setDiscountPercent(String(DEFAULTS.discountPercent));
    setSecondDiscountPercent(String(DEFAULTS.secondDiscountPercent));
    setTaxRate(String(DEFAULTS.taxRate));
    setCalcInputs(DEFAULTS);
    setResults(computeDiscount(DEFAULTS));
  };

  const faqs = [
    {
      question: "How do I calculate a discount?",
      answer:
        "Multiply the original price by the discount rate to get the amount saved, then subtract that amount from the original price. Twenty-five percent off 120 dollars saves 30 dollars and leaves a price of 90 dollars. The same result comes from multiplying by the complement, 120 × 0.75.",
    },
    {
      question: "How do stacked discounts work?",
      answer:
        "Stacked discounts are applied one after another, each calculated on the price left by the previous one. A twenty percent discount followed by ten percent off is not thirty percent off; it is 1 − (0.8 × 0.9) = 28 percent. The second discount always saves less than its headline rate suggests because it works on an already reduced price.",
    },
    {
      question: "How do I work back to the original price?",
      answer:
        "Divide the discounted price by the multiplier you applied. If something cost 90 dollars after a twenty-five percent discount, the multiplier was 0.75, so the original price was 90 ÷ 0.75 = 120 dollars. Add up every stacked discount into a single combined multiplier first, otherwise the reverse calculation will be wrong.",
    },
    {
      question: "Is sales tax charged before or after the discount?",
      answer:
        "Tax is calculated on the discounted price, not the original price, in nearly every jurisdiction that charges sales tax. Subtract the discount, then apply the tax rate to the amount the customer actually pays. The calculator reports tax separately so you can see both the pre-tax subtotal and the true final amount.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Discount Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Discount Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Price & Discount">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="original-price"
                  label="Original Price"
                  value={original}
                  onChange={setOriginal}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The full ticket price before any reduction."
                />
                <CompactInput
                  id="discount-percent"
                  label="Discount"
                  value={discountPercent}
                  onChange={setDiscountPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="The headline percentage off the original price."
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
                  <SubSection title="Stacking & Tax">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="second-discount"
                        label="Extra Discount"
                        value={secondDiscountPercent}
                        onChange={setSecondDiscountPercent}
                        onEnter={runCalculate}
                        suffix="%"
                        tooltip="A second coupon or clearance cut applied after the first discount."
                      />
                      <CompactInput
                        id="tax-rate"
                        label="Sales Tax"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        tooltip="Tax rate charged on the discounted price."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Price You Pay</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.finalPrice) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Save ${money(results.totalSaved)} on a ${money(calcInputs.original)} ticket`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Amount Saved</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.totalSaved) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price Multiplier</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.multiplier, 4)}×` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Off</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.effectiveDiscountPct, 2)}%` : "—"}
                </span>
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
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Original Price</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(calcInputs.original)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">First Discount</td>
                    <td className="p-2.5 text-right text-foreground">{`−${fmt(calcInputs.discountPercent, 2)}%`}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`−${money(results.saved)}`}</td>
                  </tr>
                  {calcInputs.secondDiscountPercent > 0 && (
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Extra Stacked Discount</td>
                      <td className="p-2.5 text-right text-foreground">{`−${fmt(calcInputs.secondDiscountPercent, 2)}%`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`−${money(results.savedSecond)}`}</td>
                    </tr>
                  )}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Subtotal After Discounts</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.subtotal)}</td>
                  </tr>
                  {calcInputs.taxRate > 0 && (
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Sales Tax</td>
                      <td className="p-2.5 text-right text-foreground">{`+${fmt(calcInputs.taxRate, 2)}%`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`+${money(results.tax)}`}</td>
                    </tr>
                  )}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Final Price</td>
                    <td className="p-2.5 text-right text-foreground">{`${fmt(results.effectiveDiscountPct, 2)}% off`}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{money(results.finalPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DISCOUNT LADDER */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Discount Level</th>
                    <th className="p-2.5 text-right">You Save</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">You Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.ladder.map((row) => (
                    <tr
                      key={row.percent}
                      className={
                        row.percent === calcInputs.discountPercent ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"
                      }
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.percent}% off</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.saved)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.price)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ticket Price</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.original)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Headline Discount</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.discountPercent, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">After First Discount</span>
                  <span className="text-base font-bold text-foreground">{money(results.afterFirst)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Saved</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Discount</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveDiscountPct, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax Added</span>
                  <span className="text-base font-bold text-foreground">{money(results.tax)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Discount Calculator?</h2>
            <p>
              A discount calculator converts a percentage off into the actual money you hand over. It shows the amount
              saved, the price you pay and the multiplier that connects the two, so a sale sign reading twenty-five percent
              off becomes a precise figure before you reach the till. The same arithmetic works for coupons, clearance
              events, trade pricing and negotiated reductions.
            </p>
            <p>
              The reason a dedicated tool helps is stacking. Retailers often promote a second discount on top of the first,
              and the two percentages do not simply add together. Knowing the true combined rate lets you compare a single
              forty percent cut with twenty-five percent followed by twenty percent, which are close but not identical offers.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator multiplies the ticket price by the discount rate to find the saving, then subtracts it to get
              the reduced price. That leaves a multiplier of one minus the rate, so a twenty-five percent discount leaves a
              multiplier of 0.75. Any additional discount is applied to the reduced price rather than the original, which is
              exactly how a cash register applies a second coupon.
            </p>
            <p>
              Combining stacked discounts means multiplying the multipliers. Keeping eighty percent after the first cut and
              ninety percent after the second leaves seventy-two percent, an effective discount of twenty-eight percent. The
              calculator works out tax on the final reduced subtotal, because sales tax is charged on the amount paid rather
              than the original ticket price in practically every jurisdiction.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the price you pay, with the total saving and the effective discount rate in the
              three-stat bar. The first table breaks the calculation into lines so you can see the original price, each
              discount, the subtotal and any tax separately, and the second table lists common discount levels applied to
              the same ticket price for quick comparison.
            </p>
            <p>
              Use the multiplier to sanity-check a deal. A multiplier of 0.75 means you keep three quarters of the original
              value, and a multiplier below 0.5 means the discount beat half price. Dividing the final price by the
              multiplier reverses the calculation and recovers the original ticket, which is the fastest way to check that a
              sale price really matches the advertised percentage.
            </p>
            <p>
              The effective discount rate is usually a little lower than the sum of stacked percentages, and the gap grows
              as the discounts get deeper. Two successive fifty percent cuts give seventy-five percent off rather than one
              hundred percent, and the second cut only ever halves what remains. Compare the effective rate, not the
              headline rates, when two stores offer different combinations. Also check the tax line before you commit: a
              deep discount on a taxed item can still cost more at the register than a smaller discount from a seller who
              includes tax in the advertised price, and the difference only becomes visible once both totals are in front
              of you. Buying two smaller items instead of one large one rarely changes the maths, but applying a coupon to
              the more expensive item first always saves the most, because the second discount is calculated on whatever
              price is left after the first has been taken off.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/discount-calculator" />
          <PopularCalculators exclude="/calculator/discount-calculator" />
        </div>
      </div>
    </>
  );
}
