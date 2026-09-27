"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BreakevenInputs {
  amount: number;
  feeRate: number;
  years: number;
  inflation: number;
  load: number;
  exitFee: number;
  taxRate: number;
  targetReal: number;
}

const DEFAULTS: BreakevenInputs = {
  amount: 50000,
  feeRate: 1,
  years: 5,
  inflation: 2.5,
  load: 1.5,
  exitFee: 0.5,
  taxRate: 20,
  targetReal: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface CostRow {
  cost: string;
  amount: number;
  share: number;
  note: string;
}

interface BreakevenResult {
  valid: boolean;
  errorMsg: string;
  invested: number;
  realRequirement: number;
  nominalRequirement: number;
  requiredGross: number;
  requiredNet: number;
  noCostReturn: number;
  costPremium: number;
  entryLoadCost: number;
  feeCost: number;
  exitFeeCost: number;
  taxCost: number;
  inflationCost: number;
  totalCosts: number;
  yearsOfReturnLost: number;
  rows: CostRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function netProceeds(amount: number, load: number, feeRate: number, exitFee: number, taxRate: number, gross: number, years: number) {
  const invested = amount * (1 - load / 100);
  const growth = gross / 100 - feeRate / 100;
  const grossProceeds = invested * Math.pow(1 + growth, years);
  const gain = Math.max(0, grossProceeds - invested);
  return grossProceeds * (1 - exitFee / 100) - gain * (taxRate / 100);
}

function compute(i: BreakevenInputs): BreakevenResult {
  const amount = Math.max(0, i.amount);
  const years = Math.max(1, i.years);
  const invested = amount * (1 - Math.max(0, Math.min(50, i.load)) / 100);
  const realRequirement = amount * Math.pow(1 + i.targetReal / 100, years);
  const nominalRequirement = realRequirement * Math.pow(1 + i.inflation / 100, years);

  // Bisection on the gross return: net proceeds increase monotonically with the
  // gross return, so a single crossing exists whenever the target is reachable.
  let lo = i.feeRate / 100 - 0.95;
  let hi = 5;
  const f = (gross: number) =>
    netProceeds(amount, i.load, i.feeRate, i.exitFee, i.taxRate, gross, years) - nominalRequirement;
  let requiredGross = 0;
  let reachable = true;
  if (f(lo) > 0) {
    requiredGross = lo * 100;
    reachable = false;
  } else if (f(hi) < 0) {
    requiredGross = hi * 100;
    reachable = false;
  } else {
    for (let iter = 0; iter < 200; iter++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) hi = mid;
      else lo = mid;
    }
    requiredGross = ((lo + hi) / 2) * 100;
  }

  const requiredNet = requiredGross - i.feeRate;
  const noCostReturn = ((1 + i.targetReal / 100) * (1 + i.inflation / 100) - 1) * 100;

  const growth = requiredGross / 100 - i.feeRate / 100;
  const grossProceeds = invested * Math.pow(1 + growth, years);
  const frictionless = amount * Math.pow(1 + requiredGross / 100, years);
  const entryLoadCost = amount - invested;
  const feeCost = Math.max(0, frictionless - grossProceeds - entryLoadCost);
  const exitFeeCost = grossProceeds * (Math.max(0, i.exitFee) / 100);
  const taxCost = Math.max(0, grossProceeds - invested) * (Math.max(0, i.taxRate) / 100);
  const inflationCost = nominalRequirement - realRequirement;
  const totalCosts = entryLoadCost + feeCost + exitFeeCost + taxCost + inflationCost;

  const rows: CostRow[] = [
    {
      cost: "Entry load",
      amount: entryLoadCost,
      share: totalCosts > 0 ? (entryLoadCost / totalCosts) * 100 : 0,
      note: "The front-end charge taken off your deposit, so less capital is invested from day one.",
    },
    {
      cost: "Annual fees",
      amount: feeCost,
      share: totalCosts > 0 ? (feeCost / totalCosts) * 100 : 0,
      note: `${fmt(i.feeRate, 2)}% a year over ${years} years, compounded against you.`,
    },
    {
      cost: "Exit fee",
      amount: exitFeeCost,
      share: totalCosts > 0 ? (exitFeeCost / totalCosts) * 100 : 0,
      note: "Redemption charge applied to the proceeds when you sell.",
    },
    {
      cost: "Capital gains tax",
      amount: taxCost,
      share: totalCosts > 0 ? (taxCost / totalCosts) * 100 : 0,
      note: `${fmt(i.taxRate, 2)}% of the gain, paid on sale.`,
    },
    {
      cost: "Inflation",
      amount: inflationCost,
      share: totalCosts > 0 ? (inflationCost / totalCosts) * 100 : 0,
      note: `Money needed just to keep pace with ${fmt(i.inflation, 2)}% inflation over the period.`,
    },
  ];

  const valid =
    i.amount > 0 &&
    i.feeRate >= 0 &&
    i.feeRate <= 10 &&
    i.years > 0 &&
    i.inflation >= 0 &&
    i.inflation <= 20 &&
    i.load >= 0 &&
    i.load <= 20 &&
    i.exitFee >= 0 &&
    i.exitFee <= 10 &&
    i.taxRate >= 0 &&
    i.taxRate <= 60 &&
    i.targetReal >= -10 &&
    i.targetReal <= 20;
  const errorMsg = valid
    ? ""
    : "Enter a positive amount and holding period, fees and loads within their plausible ranges, a tax rate up to 60%, and a target real return between -10% and 20%.";

  return {
    valid,
    errorMsg,
    invested,
    realRequirement,
    nominalRequirement,
    requiredGross,
    requiredNet,
    noCostReturn,
    costPremium: requiredGross - noCostReturn,
    entryLoadCost,
    feeCost,
    exitFeeCost,
    taxCost,
    inflationCost,
    totalCosts,
    yearsOfReturnLost:
      noCostReturn > 0 ? Math.min(years, (requiredGross - noCostReturn) / Math.max(noCostReturn, 0.01)) : 0,
    rows,
    summary: [
      { label: "Amount Deposited", value: money2(amount) },
      { label: "Amount Invested", value: money2(invested), tone: "text-destructive" },
      { label: "Real Target", value: money(realRequirement) },
      { label: "Nominal Target", value: money(nominalRequirement) },
      { label: "Required Gross Return", value: fmt(requiredGross, 2) + "%", tone: "text-primary" },
      { label: "Required Net Return", value: fmt(requiredNet, 2) + "%" },
      { label: "Return Needed Without Costs", value: fmt(noCostReturn, 2) + "%" },
      { label: "Cost Premium", value: fmt(requiredGross - noCostReturn, 2) + " pp", tone: "text-destructive" },
      { label: "Entry Load Cost", value: money(entryLoadCost) },
      { label: "Annual Fee Cost", value: money(feeCost), tone: "text-destructive" },
      { label: "Exit Fee Cost", value: money(exitFeeCost) },
      { label: "Tax Cost", value: money(taxCost) },
      { label: "Inflation Cost", value: money(inflationCost) },
      { label: "Total Cost Stack", value: money(totalCosts), tone: "text-destructive" },
      { label: "Costs as % of Target", value: fmt((totalCosts / Math.max(nominalRequirement, 1)) * 100, 2) + "%" },
      { label: reachable ? "Target Reachable" : "Target Unreachable", value: reachable ? "Yes" : "No", tone: reachable ? "text-emerald-600" : "text-destructive" },
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

export default function BreakevenInvestmentReturnCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [feeRate, setFeeRate] = useState(String(DEFAULTS.feeRate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [load, setLoad] = useState(String(DEFAULTS.load));
  const [exitFee, setExitFee] = useState(String(DEFAULTS.exitFee));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [targetReal, setTargetReal] = useState(String(DEFAULTS.targetReal));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BreakevenInputs => ({
    amount: parseFloat(amount) || 0,
    feeRate: parseFloat(feeRate) || 0,
    years: parseFloat(years) || 0,
    inflation: parseFloat(inflation) || 0,
    load: parseFloat(load) || 0,
    exitFee: parseFloat(exitFee) || 0,
    taxRate: parseFloat(taxRate) || 0,
    targetReal: parseFloat(targetReal) || 0,
  });

  const [results, setResults] = useState<BreakevenResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setFeeRate(String(DEFAULTS.feeRate));
    setYears(String(DEFAULTS.years));
    setInflation(String(DEFAULTS.inflation));
    setLoad(String(DEFAULTS.load));
    setExitFee(String(DEFAULTS.exitFee));
    setTaxRate(String(DEFAULTS.taxRate));
    setTargetReal(String(DEFAULTS.targetReal));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a break-even investment return?",
      answer:
        "It is the gross annual return an investment must earn before you are no worse off than when you started, once every cost is paid. Front loads, annual fees, exit charges, capital gains tax and inflation all eat into the result, and each one raises the return the investment has to generate. Break-even is the bar the investment must clear before it does you any good at all.",
    },
    {
      question: "Why is the break-even return so much higher than inflation?",
      answer:
        "Because the costs compound in opposite directions. A 1% fee and 2.5% inflation do not add to 3.5% over any meaningful period: fees are charged on the whole balance every year, so their dollar cost grows with the portfolio, and tax takes a share of the gain on top. In the default example the frictionless requirement is about 2.5% a year, but the gross return needed reaches roughly 6%, so more than half of the return is consumed before the investor is ahead in real terms.",
    },
    {
      question: "How does an entry load affect break-even?",
      answer:
        "Immediately and permanently. A 1.5% front load means only 98.5% of your money is ever invested, so the portfolio has to earn back the missing 1.5% before any profit accrues. Because the shortfall is not invested, it earns nothing, and the required return rises by more than the load itself over a long holding period.",
    },
    {
      question: "Should I use nominal or real targets?",
      answer:
        "Both are shown. The real target is what you want in today's purchasing power — usually preserving capital, so 0% — and the nominal target adds inflation over the holding period. Setting a positive real target answers a different question: the return needed not just to stand still but to grow your wealth in real terms.",
    },
    {
      question: "Does this calculator assume the investment is sold at the end?",
      answer:
        "Yes. Capital gains tax and exit fees are applied at the end of the holding period, which is the common case for a fund or a lump sum. If you plan to hold indefinitely and never realise the gain, set the exit fee and tax rate to zero — the break-even return then reflects only fees and inflation, and will be noticeably lower.",
    },
    {
      question: "Why does the tool solve by search rather than a formula?",
      answer:
        "Because tax applies to the gain while fees apply to the balance, the equation for the required return has no clean algebraic inverse. The calculator instead searches for the return at which net proceeds exactly equal the nominal target, narrowing the range two hundred times. The result is precise to far more decimal places than any financial decision requires.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Breakeven Investment Return Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Breakeven Investment Return Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="The Investment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Amount Deposited"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="What you hand over, before any front-end charge."
                />
                <CompactInput
                  id="fee-rate"
                  label="Annual Fee"
                  value={feeRate}
                  onChange={setFeeRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="10"
                  step="0.05"
                  tooltip="Ongoing fund and platform charges, deducted from the balance every year."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  max="40"
                  step="1"
                  tooltip="How long the money is invested before the target is needed."
                />
                <CompactInput
                  id="inflation"
                  label="Inflation"
                  value={inflation}
                  onChange={setInflation}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="20"
                  step="0.1"
                  tooltip="Used to convert the real target into the nominal amount needed at the end."
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
                  <SubSection title="Charges & Tax">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="load"
                        label="Entry Load"
                        value={load}
                        onChange={setLoad}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.1"
                        tooltip="Front-end sales charge deducted from the deposit before anything is invested."
                      />
                      <CompactInput
                        id="exit-fee"
                        label="Exit Fee"
                        value={exitFee}
                        onChange={setExitFee}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="10"
                        step="0.1"
                        tooltip="Redemption charge taken from the proceeds on sale."
                      />
                      <CompactInput
                        id="tax-rate"
                        label="Tax on Gain"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="60"
                        step="1"
                        tooltip="Combined rate on realised gains, including capital gains and state tax."
                      />
                      <CompactInput
                        id="target-real"
                        label="Target Real Return"
                        value={targetReal}
                        onChange={setTargetReal}
                        onEnter={runCalculate}
                        suffix="%"
                        min="-10"
                        max="20"
                        step="0.5"
                        tooltip="0% means preserving purchasing power; higher values require real growth."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="What Counts as Break-Even">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Break-even means the money you receive at the end, after exit fees and tax, buys what the original
                      deposit could have bought at the start — plus your target real return. Because tax applies to the gain
                      while fees apply to the whole balance, the required return is found by search rather than a formula.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Required Gross Return</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{fmt(results.requiredGross, 2)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                a year to break even · costs add {fmt(results.costPremium, 2)} points on top of the {fmt(results.noCostReturn, 2)}% inflation return
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net of Fees Needed</span>
                <span className="font-extrabold text-foreground">{fmt(results.requiredNet, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Nominal Target</span>
                <span className="font-extrabold text-foreground">{money(results.nominalRequirement)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost Stack</span>
                <span className="font-extrabold text-destructive">{money(results.totalCosts)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost</th>
                    <th className="p-2.5 text-right w-[120px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.cost} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3">
                        <div className="font-semibold text-foreground">{row.cost}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{row.note}</div>
                      </td>
                      <td className="p-2.5 text-right text-destructive">{money(row.amount)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.share, 1)}%</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-destructive">{money(results.totalCosts)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">100%</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Break-Even Investment Return?</h2>
            <p>
              The break-even investment return is the gross annual return an investment must produce just to leave you even
              after every cost is paid. Most investors think in terms of gross returns and compare them to inflation, but the
              return that reaches your pocket is reduced by front loads, annual fees, redemption charges, tax on the gain and
              the erosion of purchasing power. Each of those is a withdrawal from the same account, and each one raises the
              bar the investment must clear before it does you any good.
            </p>
            <p>
              That bar is often surprisingly high. A deposit with a 1.5% entry load, a 1% annual fee and a 20% tax on gains
              needs to earn roughly 6% a year over five years simply to preserve purchasing power — while an investment with
              no costs needs only about 2.5%. The difference is the cost of owning the product, and it is fixed regardless of
              how the markets perform.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator first works out the real target: the amount you want back in today&apos;s purchasing power,
              which is normally the original deposit but can be raised to demand real growth. That target is converted to a
              nominal amount by compounding inflation over the holding period. It then searches for the gross annual return at
              which your net proceeds — after the entry load, after annual fees, after the exit fee and after capital gains
              tax — exactly equal that nominal target.
            </p>
            <p>
              The search is done by bisection because tax applies to the gain while fees apply to the whole balance, leaving
              no clean formula for the required return. Two hundred halvings converge to a precision far beyond what any
              financial plan needs. The gross return is then decomposed into the frictionless requirement and the cost
              premium, and the cost premium is split into its five parts: entry load, annual fees, exit fee, tax and inflation.
            </p>
            <p>
              One subtlety worth noting: the cost stack is measured at the break-even return itself. That is deliberate.
              Costs are not fixed dollar amounts — the annual fee is charged on a growing balance, and the tax is charged on a
              gain that only exists if the investment performs. Measuring the stack at the break-even point shows what each
              cost actually consumes on the way to getting your money back.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the required gross return and how many percentage points of it are attributable to costs
              rather than to inflation. The three statistics beside it give the net-of-fee return the underlying portfolio must
              generate, the nominal target in dollars, and the total cost stack. The table then splits that stack across the
              five friction points with a note on each.
            </p>
            <p>
              Summary Statistics adds the deposited and invested amounts, the real and nominal targets, the return needed with
              no costs at all, the cost premium in percentage points, and each cost in dollars. The most useful experiment is
              to strip the costs out one at a time: set the entry load to zero and watch the required return fall, then remove
              the annual fee and watch it fall again. The gap between the frictionless figure and the fully loaded one is the
              price of the wrapper around the investment.
            </p>
            <p className="text-sm text-muted-foreground">
              Data vintage: inflation, fee and tax assumptions are user inputs, not forecasts. Default tax treatment assumes a
              taxable account; retirement accounts defer the gain and would lower the break-even return substantially.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/breakeven-investment-return-calculator" />
          <PopularCalculators exclude="/calculator/breakeven-investment-return-calculator" />
        </div>
      </div>
    </>
  );
}
