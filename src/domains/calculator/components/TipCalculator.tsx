"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type TipBase = "post-tax" | "pre-tax";

interface TipInputs {
  bill: number;
  tipPercent: number;
  people: number;
  taxRate: number;
  roundUpTo: number;
  tipBase: TipBase;
}

const DEFAULTS: TipInputs = {
  bill: 85,
  tipPercent: 18,
  people: 4,
  taxRate: 0,
  roundUpTo: 0,
  tipBase: "post-tax",
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v)
    ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const TIP_LEVELS = [10, 15, 18, 20, 25];

interface TipRow {
  percent: number;
  tip: number;
  total: number;
  perPerson: number;
}

interface TipResult {
  valid: boolean;
  errorMsg: string;
  taxIncluded: number;
  tipBase: number;
  rawTip: number;
  tip: number;
  rounded: boolean;
  total: number;
  perPerson: number;
  tipPerPerson: number;
  effectiveTipPercent: number;
  tipShareOfTotal: number;
  ladder: TipRow[];
}

function computeTip(input: TipInputs): TipResult {
  const { bill, tipPercent, people, taxRate, roundUpTo, tipBase } = input;

  const blank: TipResult = {
    valid: false,
    errorMsg: "",
    taxIncluded: 0,
    tipBase: 0,
    rawTip: 0,
    tip: 0,
    rounded: false,
    total: 0,
    perPerson: 0,
    tipPerPerson: 0,
    effectiveTipPercent: 0,
    tipShareOfTotal: 0,
    ladder: [],
  };

  if (!Number.isFinite(bill) || !Number.isFinite(tipPercent) || !Number.isFinite(people)) {
    return { ...blank, errorMsg: "Enter the bill, the tip percentage and how many people are splitting it." };
  }
  if (bill <= 0) {
    return { ...blank, errorMsg: "The bill amount must be greater than zero." };
  }
  if (tipPercent < 0) {
    return { ...blank, errorMsg: "A tip percentage cannot be negative." };
  }
  if (people < 1) {
    return { ...blank, errorMsg: "The party must include at least one person." };
  }
  if (taxRate < 0) {
    return { ...blank, errorMsg: "A sales tax rate cannot be negative." };
  }

  const taxIncluded = taxRate > 0 ? bill - bill / (1 + taxRate / 100) : 0;
  const base = tipBase === "pre-tax" && taxRate > 0 ? bill / (1 + taxRate / 100) : bill;
  const rawTip = base * (tipPercent / 100);
  const increment = roundUpTo > 0 ? roundUpTo : 0;
  const tip = increment > 0 ? Math.ceil(rawTip / increment) * increment : rawTip;
  const total = bill + tip;
  const partySize = Math.max(1, Math.round(people));
  const perPerson = total / partySize;
  const tipPerPerson = tip / partySize;
  const effectiveTipPercent = base !== 0 ? (tip / base) * 100 : 0;

  const ladder: TipRow[] = TIP_LEVELS.map((p) => {
    const rowTip = base * (p / 100);
    const rowTotal = bill + rowTip;
    return {
      percent: p,
      tip: Number(rowTip.toFixed(2)),
      total: Number(rowTotal.toFixed(2)),
      perPerson: Number((rowTotal / partySize).toFixed(2)),
    };
  });

  return {
    valid: true,
    errorMsg: "",
    taxIncluded: Number(taxIncluded.toFixed(2)),
    tipBase: Number(base.toFixed(2)),
    rawTip: Number(rawTip.toFixed(2)),
    tip: Number(tip.toFixed(2)),
    rounded: tip > rawTip,
    total: Number(total.toFixed(2)),
    perPerson: Number(perPerson.toFixed(2)),
    tipPerPerson: Number(tipPerPerson.toFixed(2)),
    effectiveTipPercent: Number(effectiveTipPercent.toFixed(4)),
    tipShareOfTotal: total !== 0 ? Number(((tip / total) * 100).toFixed(4)) : 0,
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

export default function TipCalculator() {
  const [bill, setBill] = useState(String(DEFAULTS.bill));
  const [tipPercent, setTipPercent] = useState(String(DEFAULTS.tipPercent));
  const [people, setPeople] = useState(String(DEFAULTS.people));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [roundUpTo, setRoundUpTo] = useState(String(DEFAULTS.roundUpTo));
  const [tipBase, setTipBase] = useState<TipBase>(DEFAULTS.tipBase);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TipInputs => ({
    bill: parseFloat(bill) || 0,
    tipPercent: parseFloat(tipPercent) || 0,
    people: parseFloat(people) || 1,
    taxRate: parseFloat(taxRate) || 0,
    roundUpTo: parseFloat(roundUpTo) || 0,
    tipBase,
  });

  const [calcInputs, setCalcInputs] = useState<TipInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TipResult>(() => computeTip(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTip(inputs));
  };

  const reset = () => {
    setBill(String(DEFAULTS.bill));
    setTipPercent(String(DEFAULTS.tipPercent));
    setPeople(String(DEFAULTS.people));
    setTaxRate(String(DEFAULTS.taxRate));
    setRoundUpTo(String(DEFAULTS.roundUpTo));
    setTipBase(DEFAULTS.tipBase);
    setCalcInputs(DEFAULTS);
    setResults(computeTip(DEFAULTS));
  };

  const faqs = [
    {
      question: "How do I calculate a tip?",
      answer:
        "Multiply the bill by the tip percentage as a decimal. Eighteen percent of an eighty-five dollar bill is 85 × 0.18, which equals fifteen dollars and thirty cents, giving a total of one hundred dollars and thirty cents. Splitting the total by the number of diners gives each person's share.",
    },
    {
      question: "What is a standard tip percentage?",
      answer:
        "In the United States, fifteen percent is commonly treated as adequate service, eighteen percent as good and twenty percent as excellent. Twenty-five percent or more recognises outstanding service. Takeout, counter service and buffets usually sit lower, and many guides suggest a small flat amount rather than a percentage.",
    },
    {
      question: "Should I tip on the pre-tax or post-tax amount?",
      answer:
        "Etiquette guides generally suggest tipping on the pre-tax subtotal, since sales tax is not part of the service being rewarded. In practice many people tip on the total because it is easier to read off the receipt. The gap is small: on a hundred dollar bill with eight percent tax the difference is about a dollar and sixty cents.",
    },
    {
      question: "How do tips change when splitting the bill?",
      answer:
        "Work out the total with tip first, then divide by the number of diners. Dividing the bill before adding the tip gives the same result only if everyone tips at the same rate, and it falls apart the moment somebody orders wine or an appetiser the others did not share. The calculator reports both the tip per person and the total per person so the split is transparent.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Tip Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tip Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Bill & Party">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="bill"
                  label="Bill Amount"
                  value={bill}
                  onChange={setBill}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The restaurant bill before the tip is added."
                />
                <CompactInput
                  id="people"
                  label="Party Size"
                  value={people}
                  onChange={setPeople}
                  onEnter={runCalculate}
                  min="1"
                  tooltip="How many people are splitting the bill."
                />
              </div>
            </SubSection>

            <SubSection title="Tip Percentage">
              <div className="grid grid-cols-5 gap-2">
                {TIP_LEVELS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTipPercent(String(p))}
                    aria-pressed={parseFloat(tipPercent) === p}
                    className={
                      parseFloat(tipPercent) === p
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-bold text-sm transition-colors"
                    }
                  >
                    {`${p}%`}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <CompactInput
                  id="tip-percent"
                  label="Custom Tip"
                  value={tipPercent}
                  onChange={setTipPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Pick a preset above or type any percentage here."
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
                  <SubSection title="Tip Base">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTipBase("post-tax")}
                        aria-pressed={tipBase === "post-tax"}
                        className={
                          tipBase === "post-tax"
                            ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                            : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                        }
                      >
                        On Total
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipBase("pre-tax")}
                        aria-pressed={tipBase === "pre-tax"}
                        className={
                          tipBase === "pre-tax"
                            ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                            : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                        }
                      >
                        On Pre-Tax
                      </button>
                    </div>
                  </SubSection>
                  <SubSection title="Tax & Rounding">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax-rate"
                        label="Sales Tax"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        tooltip="Tax already included in the bill, used to find the pre-tax base."
                      />
                      <CompactInput
                        id="round-up-to"
                        label="Round Up To"
                        value={roundUpTo}
                        onChange={setRoundUpTo}
                        onEnter={runCalculate}
                        prefix="$"
                        hint="Zero leaves the tip exact."
                        tooltip="Round the tip up to the next multiple of this amount."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total With Tip</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.total) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${money(calcInputs.bill)} bill plus a ${money(results.tip)} tip at ${fmt(results.effectiveTipPercent, 2)}%`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tip Amount</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.tip) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tip per Person</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.tipPerPerson) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total per Person</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.perPerson) : "—"}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Line</th>
                    <th className="p-2.5 text-right">Per Person</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Bill</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.bill / Math.max(1, calcInputs.people))}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(calcInputs.bill)}</td>
                  </tr>
                  {calcInputs.taxRate > 0 && (
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Sales tax already in bill</td>
                      <td className="p-2.5 text-right text-foreground">
                        {money(results.taxIncluded / Math.max(1, calcInputs.people))}
                      </td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(results.taxIncluded)}</td>
                    </tr>
                  )}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      {calcInputs.tipBase === "pre-tax" && calcInputs.taxRate > 0 ? "Tip (on pre-tax base)" : "Tip"}
                    </td>
                    <td className="p-2.5 text-right text-foreground">{money(results.tipPerPerson)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.tip)}</td>
                  </tr>
                  {results.rounded && (
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Rounding added</td>
                      <td className="p-2.5 text-right text-foreground">—</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(results.tip - results.rawTip)}</td>
                    </tr>
                  )}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-emerald-600">{money(results.perPerson)}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{money(results.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TIP LADDER */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Service Level</th>
                    <th className="p-2.5 text-right">Tip</th>
                    <th className="p-2.5 text-right">Total</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Each</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.ladder.map((row) => (
                    <tr
                      key={row.percent}
                      className={
                        row.percent === calcInputs.tipPercent ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"
                      }
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.percent}%</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.tip)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.total)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.perPerson)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bill</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.bill)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Party Size</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.people, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Requested Tip</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.tipPercent, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Tip</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveTipPercent, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tip Base</span>
                  <span className="text-base font-bold text-foreground">{money(results.tipBase)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tip Share of Total</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.tipShareOfTotal, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Tip Calculator?</h2>
            <p>
              A tip calculator works out a gratuity from a bill and adds it to produce the amount you actually leave. It can
              split that total between any number of diners, round the tip to a convenient figure and separate the tax that
              was already embedded in the bill, so every part of the payment is visible before the card is handed over.
            </p>
            <p>
              Getting a tip right matters in both directions. Too low and you underpay someone whose income depends on
              gratuities, too high and a pleasant dinner quietly costs more than planned. Doing the arithmetic once, in
              advance, removes the guesswork at the table and makes splitting a shared bill much less awkward.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator multiplies the bill by the tip rate to get the gratuity, adds it to the bill for the total, then
              divides both figures by the party size. A bill of eighty-five dollars with an eighteen percent tip produces a
              gratuity of fifteen dollars and thirty cents and a total of one hundred dollars and thirty cents, or about
              twenty-five dollars each across four diners.
            </p>
            <p>
              Two refinements change the answer. If you prefer to tip on the pre-tax amount, entering the sales tax rate lets
              the tool strip tax out of the bill before applying the percentage, which slightly reduces the gratuity. Rounding
              does the opposite: choosing to round the tip up to the next dollar or the next five dollars adds a few cents and
              produces a clean figure to write on the slip.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the total including tip, and the three-stat bar breaks it into the gratuity, the tip per
              person and the total per person. The first table lists the bill, any embedded tax, the tip and the rounding
              adjustment line by line, while the second table applies the common service levels of ten through twenty-five
              percent to the same bill.
            </p>
            <p>
              Use the ladder to decide how service felt before you commit. Moving from eighteen to twenty percent on an
              eighty-five dollar bill costs an extra dollar and seventy cents, which is small in absolute terms but a
              meaningful step in the percentage the server actually receives. Reading the total per person also prevents the
              common mistake of tipping on the split share rather than the full bill.
            </p>
            <p>
              Keep the effective tip percentage in view when rounding or using a pre-tax base, because those settings move the
              real rate away from the number you asked for. Rounding up always raises the effective rate, and using the pre-tax
              base lowers it slightly below the headline figure. The summary panel shows both so the promised service level and
              the delivered one stay aligned. When the whole party has agreed on a rate, share the total before the card is
              swiped so nobody has to chase the difference afterwards, and check whether the restaurant has already added a
              service charge for larger tables before tipping on top of it. A printed service charge is not a gratuity in
              every case, so ask where it goes when the answer matters.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tip-calculator" />
          <PopularCalculators exclude="/calculator/tip-calculator" />
        </div>
      </div>
    </>
  );
}
