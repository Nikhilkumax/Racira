"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type FilingStatus = "single" | "joint" | "hoh" | "mfs";

interface LtcgInputs {
  proceeds: number;
  basis: number;
  ordinaryIncome: number;
  filing: FilingStatus;
  stateRate: number;
  deduction: number;
  years: number;
  applyNiit: boolean;
}

const DEFAULTS: LtcgInputs = {
  proceeds: 150000,
  basis: 60000,
  ordinaryIncome: 83900,
  filing: "single",
  stateRate: 5,
  deduction: 16100,
  years: 7,
  applyNiit: true,
};

const BRACKETS: Record<FilingStatus, { zero: number; fifteen: number; niit: number; label: string }> = {
  single: { zero: 49450, fifteen: 545500, niit: 200000, label: "Single" },
  joint: { zero: 98900, fifteen: 613700, niit: 250000, label: "Married Filing Jointly" },
  hoh: { zero: 66200, fifteen: 579600, niit: 200000, label: "Head of Household" },
  mfs: { zero: 49450, fifteen: 306850, niit: 125000, label: "Married Filing Separately" },
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface SliceRow {
  bucket: string;
  amount: number;
  rate: number;
  tax: number;
  note: string;
}

interface LtcgResult {
  valid: boolean;
  errorMsg: string;
  gain: number;
  gainPct: number;
  zeroSlice: number;
  fifteenSlice: number;
  twentySlice: number;
  federalTax: number;
  niit: number;
  stateTax: number;
  totalTax: number;
  afterTaxProceeds: number;
  afterTaxProfit: number;
  effectiveRate: number;
  marginalRate: number;
  afterTaxCagr: number;
  taxPerThousand: number;
  magi: number;
  rows: SliceRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: LtcgInputs): LtcgResult {
  const brackets = BRACKETS[i.filing];
  const gain = Math.max(0, i.proceeds - i.basis);
  const ordinary = Math.max(0, i.ordinaryIncome);

  const zeroSlice = ordinary < brackets.zero ? Math.min(gain, brackets.zero - ordinary) : 0;
  const base = Math.max(ordinary, brackets.zero);
  const afterZero = gain - zeroSlice;
  const fifteenSlice = Math.max(0, Math.min(afterZero, Math.max(0, brackets.fifteen - base)));
  const twentySlice = Math.max(0, afterZero - fifteenSlice);

  const federalTax = fifteenSlice * 0.15 + twentySlice * 0.2;
  const magi = ordinary + Math.max(0, i.deduction) + gain;
  const niitBase = i.applyNiit ? Math.min(gain, Math.max(0, magi - brackets.niit)) : 0;
  const niit = niitBase * 0.038;
  const stateTax = gain * (Math.max(0, i.stateRate) / 100);
  const totalTax = federalTax + niit + stateTax;

  const marginalRate = (twentySlice > 0 ? 20 : fifteenSlice > 0 ? 15 : 0) + (niit > 0 ? 3.8 : 0) + Math.max(0, i.stateRate);
  const afterTaxProceeds = i.proceeds - totalTax;
  const afterTaxProfit = gain - totalTax;
  const effectiveRate = gain > 0 ? (totalTax / gain) * 100 : 0;
  const years = Math.max(0, i.years);
  const afterTaxCagr =
    i.basis > 0 && years > 0 ? (Math.pow(Math.max(i.basis + afterTaxProfit, 0.01) / i.basis, 1 / years) - 1) * 100 : 0;

  const rows: SliceRow[] = [
    {
      bucket: "0% bracket",
      amount: zeroSlice,
      rate: 0,
      tax: 0,
      note: `Gain that fits under the ${money(brackets.zero)} 0% ceiling after ordinary income.`,
    },
    {
      bucket: "15% bracket",
      amount: fifteenSlice,
      rate: 15,
      tax: fifteenSlice * 0.15,
      note: `Gain between ${money(brackets.zero)} and ${money(brackets.fifteen)} of taxable income.`,
    },
    {
      bucket: "20% bracket",
      amount: twentySlice,
      rate: 20,
      tax: twentySlice * 0.2,
      note: `Gain above the ${money(brackets.fifteen)} 15% ceiling.`,
    },
    {
      bucket: "Net investment income tax",
      amount: niitBase,
      rate: 3.8,
      tax: niit,
      note: i.applyNiit
        ? `3.8% surtax on the gain to the extent MAGI of ${money(magi)} exceeds the ${money(brackets.niit)} threshold.`
        : "NIIT switched off for this estimate.",
    },
    {
      bucket: "State tax",
      amount: gain,
      rate: Math.max(0, i.stateRate),
      tax: stateTax,
      note: "Flat state rate applied to the whole gain; many states also offer preferential rates or exemptions.",
    },
  ];

  const valid =
    i.proceeds >= 0 &&
    i.basis >= 0 &&
    i.ordinaryIncome >= 0 &&
    i.stateRate >= 0 &&
    i.stateRate <= 15 &&
    i.deduction >= 0 &&
    i.years >= 0;
  const errorMsg = valid
    ? ""
    : "Enter non-negative values for proceeds, cost basis, ordinary taxable income, deductions and years held, with a state rate between 0% and 15%.";

  return {
    valid,
    errorMsg,
    gain,
    gainPct: i.basis > 0 ? (gain / i.basis) * 100 : 0,
    zeroSlice,
    fifteenSlice,
    twentySlice,
    federalTax,
    niit,
    stateTax,
    totalTax,
    afterTaxProceeds,
    afterTaxProfit,
    effectiveRate,
    marginalRate,
    afterTaxCagr,
    taxPerThousand: gain > 0 ? (totalTax / gain) * 1000 : 0,
    magi,
    rows,
    summary: [
      { label: "Gross Proceeds", value: money2(i.proceeds) },
      { label: "Cost Basis", value: money2(i.basis) },
      { label: "Capital Gain", value: money(gain) },
      { label: "Gain as % of Basis", value: fmt(i.basis > 0 ? (gain / i.basis) * 100 : 0, 2) + "%" },
      { label: "Gain at 0%", value: money(zeroSlice), tone: "text-emerald-600" },
      { label: "Gain at 15%", value: money(fifteenSlice) },
      { label: "Gain at 20%", value: money(twentySlice) },
      { label: "Federal Tax", value: money(federalTax), tone: "text-destructive" },
      { label: "NIIT (3.8%)", value: money(niit), tone: "text-destructive" },
      { label: "State Tax", value: money(stateTax), tone: "text-destructive" },
      { label: "Total Tax", value: money(totalTax), tone: "text-destructive" },
      { label: "Effective Rate on Gain", value: fmt(gain > 0 ? (totalTax / gain) * 100 : 0, 2) + "%" },
      { label: "Marginal Rate", value: fmt(marginalRate, 2) + "%" },
      { label: "After-Tax Proceeds", value: money(afterTaxProceeds), tone: "text-emerald-600" },
      { label: "After-Tax Profit", value: money(afterTaxProfit), tone: "text-emerald-600" },
      { label: "After-Tax Annualized", value: fmt(afterTaxCagr, 2) + "%", tone: "text-primary" },
      { label: "Tax per $1,000 Gain", value: money2((totalTax / Math.max(gain, 1)) * 1000) },
      { label: "Est. MAGI", value: money(magi) },
    ],
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
  max?: string;
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
  max,
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
        max={max}
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

export default function LongTermCapitalGainsTaxEstimator() {
  const [proceeds, setProceeds] = useState(String(DEFAULTS.proceeds));
  const [basis, setBasis] = useState(String(DEFAULTS.basis));
  const [ordinaryIncome, setOrdinaryIncome] = useState(String(DEFAULTS.ordinaryIncome));
  const [filing, setFiling] = useState<FilingStatus>(DEFAULTS.filing);
  const [stateRate, setStateRate] = useState(String(DEFAULTS.stateRate));
  const [deduction, setDeduction] = useState(String(DEFAULTS.deduction));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [applyNiit, setApplyNiit] = useState(DEFAULTS.applyNiit);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): LtcgInputs => ({
    proceeds: parseFloat(proceeds) || 0,
    basis: parseFloat(basis) || 0,
    ordinaryIncome: parseFloat(ordinaryIncome) || 0,
    filing,
    stateRate: parseFloat(stateRate) || 0,
    deduction: parseFloat(deduction) || 0,
    years: parseFloat(years) || 0,
    applyNiit,
  });

  const [results, setResults] = useState<LtcgResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setProceeds(String(DEFAULTS.proceeds));
    setBasis(String(DEFAULTS.basis));
    setOrdinaryIncome(String(DEFAULTS.ordinaryIncome));
    setFiling(DEFAULTS.filing);
    setStateRate(String(DEFAULTS.stateRate));
    setDeduction(String(DEFAULTS.deduction));
    setYears(String(DEFAULTS.years));
    setApplyNiit(DEFAULTS.applyNiit);
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "How are long-term capital gains taxed in 2026?",
      answer:
        "Long-term gains — assets held more than one year — are taxed at 0%, 15% or 20% depending on where your taxable income falls. For 2026 the 0% rate applies up to $49,450 of taxable income for single filers and $98,900 for married couples filing jointly; the 15% rate runs to $545,500 and $613,700 respectively, and gains above those levels face 20%. The thresholds come from IRS Rev. Proc. 2025-32.",
    },
    {
      question: "Why does the calculator ask for ordinary taxable income?",
      answer:
        "Because long-term gains stack on top of your ordinary income rather than replacing it. The brackets are applied to the combined total, so a gain that would fall entirely in the 0% bracket for someone with no other income can be pushed entirely into the 15% bracket for someone with a large salary. Enter taxable income — after the standard or itemized deduction — for the stacking to be right.",
    },
    {
      question: "What is the 3.8% net investment income tax?",
      answer:
        "It is a surtax created by the Affordable Care Act that applies to investment income, including capital gains, once modified adjusted gross income exceeds $200,000 for single and head-of-household filers, $250,000 for married couples filing jointly, or $125,000 for married filing separately. Unlike the capital gains brackets, these thresholds are fixed by statute and never adjust for inflation, so more taxpayers cross them each year.",
    },
    {
      question: "Do I still get the 0% rate with a large gain?",
      answer:
        "Only on the slice of the gain that fits under the 0% ceiling after your ordinary income. If your taxable ordinary income is $30,000 and the ceiling is $49,450, the first $19,450 of gain is tax-free and the rest is taxed at 15% or 20%. That is why splitting a sale across two tax years often saves real money — each year has its own 0% band.",
    },
    {
      question: "Does this calculator cover short-term gains?",
      answer:
        "No. Assets held one year or less produce short-term gains taxed at ordinary income rates, which reach 37% in 2026. A short-term gain would need the ordinary brackets and your full deduction picture, so this tool stays scoped to long-term treatment. If you sold inside a year, treat the result here as a lower bound on what you may owe.",
    },
    {
      question: "What about the 28% collectibles and 25% depreciation rates?",
      answer:
        "Gains on collectibles such as art, coins and precious metals are capped at 28%, and the part of a real-estate gain caused by prior depreciation is capped at 25%. Those special rates apply instead of the standard schedule, so this estimator will understate the tax on those assets. Ordinary stocks, funds and long-held real estate are covered by the 0/15/20 brackets.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Long-Term Capital Gains Tax Estimator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Long-Term Capital Gains Tax Estimator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Sale Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="proceeds"
                  label="Sale Proceeds"
                  value={proceeds}
                  onChange={setProceeds}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="Total amount the asset sold for. Assume an asset held more than one year."
                />
                <CompactInput
                  id="basis"
                  label="Cost Basis"
                  value={basis}
                  onChange={setBasis}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="What you paid for the asset, including commissions and reinvested dividends."
                />
                <CompactInput
                  id="ordinary-income"
                  label="Ordinary Taxable Income"
                  value={ordinaryIncome}
                  onChange={setOrdinaryIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="Taxable income after deductions, before the gain. The gain stacks on top of this figure."
                />
                <div className="flex flex-col">
                  <label htmlFor="filing" className="flex items-center text-sm font-semibold text-foreground mb-1">
                    Filing Status
                  </label>
                  <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <select
                      id="filing"
                      value={filing}
                      onChange={(e) => setFiling(e.target.value as FilingStatus)}
                      className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                    >
                      <option value="single">Single</option>
                      <option value="joint">Married Filing Jointly</option>
                      <option value="hoh">Head of Household</option>
                      <option value="mfs">Married Filing Separately</option>
                    </select>
                  </div>
                </div>
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
                  <SubSection title="Deductions & State Tax">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="deduction"
                        label="Deduction"
                        value={deduction}
                        onChange={setDeduction}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="500"
                        tooltip="Standard deduction for 2026 is $16,100 single, $32,200 joint. Used to reconstruct MAGI for the NIIT test."
                      />
                      <CompactInput
                        id="state-rate"
                        label="State Tax Rate"
                        value={stateRate}
                        onChange={setStateRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="15"
                        step="0.5"
                        tooltip="Flat state rate on the gain; set 0 for states with no income tax on gains."
                      />
                      <CompactInput
                        id="years"
                        label="Years Held"
                        value={years}
                        onChange={setYears}
                        onEnter={runCalculate}
                        suffix="yr"
                        min="1"
                        max="50"
                        step="1"
                        tooltip="Used to annualise the after-tax result for comparison with other investments."
                      />
                      <div className="flex flex-col">
                        <span className="flex items-center text-sm font-semibold text-foreground mb-1">NIIT (3.8%)</span>
                        <div className="flex items-center gap-2 h-9">
                          <input
                            id="niit"
                            type="checkbox"
                            checked={applyNiit}
                            onChange={(e) => setApplyNiit(e.target.checked)}
                            className="h-4 w-4 accent-[hsl(var(--primary))]"
                          />
                          <label htmlFor="niit" className="text-sm text-muted-foreground">
                            Apply net investment income tax
                          </label>
                        </div>
                      </div>
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The gain stacks on top of ordinary taxable income, so the 0% band is only available to the extent the
                      combined income stays under the ceiling. MAGI for the NIIT test is reconstructed by adding your
                      deduction back to taxable ordinary income and adding the gain. Special assets — collectibles at 28%,
                      depreciation recapture at 25% — are outside this estimator.
                    </p>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Tax on the Gain</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.totalTax)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.effectiveRate, 2)}% of the {money(results.gain)} gain · {money(results.afterTaxProfit)} kept
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Federal Tax</span>
                <span className="font-extrabold text-destructive">{money(results.federalTax)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Marginal Rate</span>
                <span className="font-extrabold text-foreground">{fmt(results.marginalRate, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">After-Tax Proceeds</span>
                <span className="font-extrabold text-emerald-600">{money(results.afterTaxProceeds)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Bracket</th>
                    <th className="p-2.5 text-right w-[130px]">Gain Taxed</th>
                    <th className="p-2.5 text-right w-[80px]">Rate</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.bucket} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3">
                        <div className="font-semibold text-foreground">{row.bucket}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{row.note}</div>
                      </td>
                      <td className="p-2.5 text-right text-foreground">{money(row.amount)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.rate, 1)}%</td>
                      <td className="p-2.5 pr-3 text-right text-destructive">{money(row.tax)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.gain)}</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-destructive">{money(results.totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                {results.summary.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{item.label}</span>
                    <span className={`text-base font-bold ${item.tone || "text-foreground"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Long-Term Capital Gains Tax Estimator?</h2>
            <p>
              A long-term capital gains tax estimator works out what a sale actually costs in tax. Selling an asset held more
              than a year does not produce a single flat rate: the gain is stacked on top of your ordinary income and sliced
              across the 0%, 15% and 20% brackets, then a 3.8% net investment income tax can apply above the statutory income
              thresholds. State tax may take another cut on top. The estimator turns those rules into a dollar figure so you
              can decide whether to sell now, split the sale, or hold.
            </p>
            <p>
              It is built for the common case: a stock, fund or property held for years and sold at a profit, with the 2026
              federal thresholds hard-coded from the IRS inflation-adjustment release and a flat state rate you supply. That
              makes it useful for planning real decisions — exercising concentrated stock, selling a rental, or harvesting gains
              at the end of a low-income year.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The gain is your sale proceeds minus cost basis. It is then stacked on top of ordinary taxable income, which is
              your income after the standard or itemized deduction. Any part of the gain that fits under the 0% ceiling —
              $49,450 for single filers, $98,900 for married couples filing jointly, $66,200 for heads of household in 2026 —
              is tax-free. The next slice up to the 15% ceiling of $545,500, $613,700 or $579,600 is taxed at 15%, and anything
              above that at 20%.
            </p>
            <p>
              The 3.8% net investment income tax is computed separately. It applies to the lesser of your net investment income
              and the amount by which modified adjusted gross income exceeds $200,000 for single and head-of-household filers,
              $250,000 for joint filers, or $125,000 for married filing separately. Because those thresholds are fixed in
              statute rather than indexed, a high-income seller in the 20% bracket faces 23.8% overall before state tax.
            </p>
            <p>
              The tool also annualises the after-tax result using the holding period, which converts a lump-sum tax bill into a
              comparable rate of return. A gain that looks large in dollars may represent a modest annual return once you
              account for how long the capital was tied up and what tax was paid to release it.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the total tax with the effective rate on the gain, which is almost always lower than the
              marginal rate because the first slice is often taxed at 0% or 15%. The three statistics beside it isolate the
              federal component, the marginal rate you reached, and the after-tax proceeds you would actually receive.
            </p>
            <p>
              The bracket table shows exactly how the gain was sliced, with the amount and tax in each band plus the NIIT and
              state tax lines. Summary Statistics adds the cost basis, the gain as a percentage of basis, the tax per $1,000 of
              gain and the estimated MAGI used for the NIIT test. A useful experiment: raise the ordinary income field and watch
              the 0% slice vanish, then try splitting the sale across two years by halving the proceeds and doubling the years
              held — the annualised return usually improves, which is the arithmetic behind gain harvesting.
            </p>
            <p className="text-sm text-muted-foreground">
              Data vintage: 2026 thresholds per IRS Rev. Proc. 2025-32 (single: $49,450 / $545,500; joint: $98,900 / $613,700;
              head of household: $66,200 / $579,600; married filing separately: $49,450 / $306,850). NIIT thresholds are fixed
              by statute. Re-check the figures each October when the IRS announces the following year&apos;s adjustments.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/long-term-capital-gains-tax-estimator" />
          <PopularCalculators exclude="/calculator/long-term-capital-gains-tax-estimator" />
        </div>
      </div>
    </>
  );
}
