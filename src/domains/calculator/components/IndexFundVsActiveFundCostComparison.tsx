"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FundInputs {
  amount: number;
  indexExpense: number;
  activeExpense: number;
  years: number;
  indexGross: number;
  activeGross: number;
  activeTaxDrag: number;
  indexTaxDrag: number;
}

const DEFAULTS: FundInputs = {
  amount: 50000,
  indexExpense: 0.04,
  activeExpense: 0.75,
  years: 20,
  indexGross: 7,
  activeGross: 7.5,
  activeTaxDrag: 0.5,
  indexTaxDrag: 0.05,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface FundRow {
  year: number;
  index: number;
  active: number;
  difference: number;
  indexFees: number;
  activeFees: number;
}

interface FundResult {
  valid: boolean;
  errorMsg: string;
  indexNet: number;
  activeNet: number;
  indexTerminal: number;
  activeTerminal: number;
  difference: number;
  winner: string;
  breakEvenActiveGross: number;
  requiredAlpha: number;
  indexFeeTotal: number;
  activeFeeTotal: number;
  feeDifference: number;
  taxDifference: number;
  indexFeeShare: number;
  activeFeeShare: number;
  rows: FundRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: FundInputs): FundResult {
  const amount = Math.max(0, i.amount);
  const years = Math.max(1, Math.round(i.years));
  const indexNet = i.indexGross - i.indexExpense - i.indexTaxDrag;
  const activeNet = i.activeGross - i.activeExpense - i.activeTaxDrag;
  const indexTerminal = amount * Math.pow(1 + indexNet / 100, years);
  const activeTerminal = amount * Math.pow(1 + activeNet / 100, years);
  const difference = activeTerminal - indexTerminal;

  const indexFeeTotal = amount * (Math.pow(1 + i.indexGross / 100, years) - Math.pow(1 + indexNet / 100, years));
  const activeFeeTotal = amount * (Math.pow(1 + i.activeGross / 100, years) - Math.pow(1 + activeNet / 100, years));

  const breakEvenActiveGross = indexNet + i.activeExpense + i.activeTaxDrag;
  const requiredAlpha = breakEvenActiveGross - i.indexGross;

  const rows: FundRow[] = [];
  for (let year = 1; year <= Math.min(30, years); year++) {
    const indexValue = amount * Math.pow(1 + indexNet / 100, year);
    const activeValue = amount * Math.pow(1 + activeNet / 100, year);
    rows.push({
      year,
      index: indexValue,
      active: activeValue,
      difference: activeValue - indexValue,
      indexFees: amount * (Math.pow(1 + i.indexGross / 100, year) - Math.pow(1 + indexNet / 100, year)),
      activeFees: amount * (Math.pow(1 + i.activeGross / 100, year) - Math.pow(1 + activeNet / 100, year)),
    });
  }

  const valid =
    i.amount > 0 &&
    i.indexExpense >= 0 &&
    i.activeExpense >= 0 &&
    i.years > 0 &&
    i.indexGross > -50 &&
    i.indexGross < 50 &&
    i.activeGross > -50 &&
    i.activeGross < 50 &&
    i.activeTaxDrag >= 0 &&
    i.indexTaxDrag >= 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive amount and holding period, non-negative expense ratios and tax drags, and gross returns between -50% and 50%.";

  return {
    valid,
    errorMsg,
    indexNet,
    activeNet,
    indexTerminal,
    activeTerminal,
    difference,
    winner: difference > 0 ? "Active fund" : difference < 0 ? "Index fund" : "Tie",
    breakEvenActiveGross,
    requiredAlpha,
    indexFeeTotal,
    activeFeeTotal,
    feeDifference: activeFeeTotal - indexFeeTotal,
    taxDifference: amount * (1 - Math.pow(1 - i.indexTaxDrag / 100, 1)) * years,
    indexFeeShare: indexTerminal > 0 ? (indexFeeTotal / indexTerminal) * 100 : 0,
    activeFeeShare: activeTerminal > 0 ? (activeFeeTotal / activeTerminal) * 100 : 0,
    rows,
    summary: [
      { label: "Amount Invested", value: money2(amount) },
      { label: "Index Gross Return", value: fmt(i.indexGross, 2) + "%" },
      { label: "Index Expense Ratio", value: fmt(i.indexExpense, 2) + "%" },
      { label: "Index Net Return", value: fmt(indexNet, 2) + "%" },
      { label: "Active Gross Return", value: fmt(i.activeGross, 2) + "%" },
      { label: "Active Expense Ratio", value: fmt(i.activeExpense, 2) + "%" },
      { label: "Active Net Return", value: fmt(activeNet, 2) + "%" },
      { label: "Index Terminal Value", value: money(indexTerminal), tone: "text-foreground" },
      { label: "Active Terminal Value", value: money(activeTerminal) },
      { label: "Difference", value: money(difference), tone: difference >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Better Outcome", value: difference > 0 ? "Active fund" : difference < 0 ? "Index fund" : "Tie", tone: "text-primary" },
      { label: "Break-Even Active Gross", value: fmt(breakEvenActiveGross, 2) + "%" },
      { label: "Alpha Required to Match", value: fmt(requiredAlpha, 2) + " pp", tone: requiredAlpha > 0 ? "text-destructive" : "text-emerald-600" },
      { label: "Index Fees Paid", value: money(indexFeeTotal) },
      { label: "Active Fees Paid", value: money(activeFeeTotal), tone: "text-destructive" },
      { label: "Extra Fees for Active", value: money(activeFeeTotal - indexFeeTotal), tone: "text-destructive" },
      { label: "Fees as % of Index Result", value: fmt((indexFeeTotal / Math.max(indexTerminal, 1)) * 100, 2) + "%" },
      { label: "Fees as % of Active Result", value: fmt((activeFeeTotal / Math.max(activeTerminal, 1)) * 100, 2) + "%" },
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

export default function IndexFundVsActiveFundCostComparison() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [indexExpense, setIndexExpense] = useState(String(DEFAULTS.indexExpense));
  const [activeExpense, setActiveExpense] = useState(String(DEFAULTS.activeExpense));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [indexGross, setIndexGross] = useState(String(DEFAULTS.indexGross));
  const [activeGross, setActiveGross] = useState(String(DEFAULTS.activeGross));
  const [activeTaxDrag, setActiveTaxDrag] = useState(String(DEFAULTS.activeTaxDrag));
  const [indexTaxDrag, setIndexTaxDrag] = useState(String(DEFAULTS.indexTaxDrag));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FundInputs => ({
    amount: parseFloat(amount) || 0,
    indexExpense: parseFloat(indexExpense) || 0,
    activeExpense: parseFloat(activeExpense) || 0,
    years: parseFloat(years) || 0,
    indexGross: parseFloat(indexGross) || 0,
    activeGross: parseFloat(activeGross) || 0,
    activeTaxDrag: parseFloat(activeTaxDrag) || 0,
    indexTaxDrag: parseFloat(indexTaxDrag) || 0,
  });

  const [results, setResults] = useState<FundResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setIndexExpense(String(DEFAULTS.indexExpense));
    setActiveExpense(String(DEFAULTS.activeExpense));
    setYears(String(DEFAULTS.years));
    setIndexGross(String(DEFAULTS.indexGross));
    setActiveGross(String(DEFAULTS.activeGross));
    setActiveTaxDrag(String(DEFAULTS.activeTaxDrag));
    setIndexTaxDrag(String(DEFAULTS.indexTaxDrag));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much does a higher expense ratio really cost?",
      answer:
        "More than most investors expect, because the fee applies to the whole balance every year and the money it consumes never compounds. A 0.75% active fund versus a 0.04% index fund on a $50,000 investment over 20 years leaves the active fund roughly $22,000 behind on a 7% gross return once fees and distributions are counted — capital that would otherwise have kept growing. The fee itself is small in any single year; its cumulative effect is not.",
    },
    {
      question: "What is break-even alpha?",
      answer:
        "It is the extra gross return an active fund must generate before its fees to match the index fund's net result. If the index fund nets 6.9% after costs and the active fund charges 0.75%, the active manager must earn 7.65% gross just to tie. That figure is the honest hurdle for an active strategy, and it is why the calculator reports it in percentage points above the index's own return.",
    },
    {
      question: "Do active funds earn enough to cover their fees?",
      answer:
        "On average, across large studies of US equity funds, most active funds underperform their benchmark after fees over ten- and twenty-year periods. That does not mean no active fund wins — a minority do, sometimes by wide margins — but the evidence says the average active dollar does not clear the break-even hurdle. Persistence studies add a second problem: funds that outperform in one period frequently do not repeat in the next.",
    },
    {
      question: "What is tax drag and why does it hit active funds harder?",
      answer:
        "Tax drag is the annual cost of taxes on distributions the fund must pass through to holders. Actively managed funds trade more, realise gains more often and distribute them, so their holders pay tax on gains they did not choose to realise. An index fund holds its positions, so it distributes far less and lets unrealised gains compound untaxed until the investor sells. The field models that gap explicitly.",
    },
    {
      question: "Should I ignore active funds entirely?",
      answer:
        "No — but go in with the arithmetic in front of you. There are genuine inefficiencies in less efficient corners of the market, such as small caps, emerging markets and certain credit markets, where a skilled manager has more room to add value. If you are considering an active fund, the useful question is not whether the manager is smart but whether the expected outperformance is plausibly larger than the break-even alpha shown here.",
    },
    {
      question: "Does the comparison include trading costs and bid-ask spreads?",
      answer:
        "Only to the extent they show up in the difference between gross and net returns you enter. Real trading costs — commissions, spreads, market impact — reduce an active fund's gross return before the expense ratio is even charged, so if you are entering published returns, they usually already reflect those costs. The expense ratio and any tax drag are then applied separately here, which mirrors how fund returns are reported.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Index Fund vs Active Fund Cost Comparison" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Index Fund vs Active Fund Cost Comparison
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Fund Costs">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Amount Invested"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="One-off amount invested in either fund at the start."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  max="50"
                  step="1"
                  tooltip="How long the money stays invested before comparison."
                />
                <CompactInput
                  id="index-expense"
                  label="Index Expense Ratio"
                  value={indexExpense}
                  onChange={setIndexExpense}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="3"
                  step="0.01"
                  tooltip="Total annual charge on the index fund; broad-market index funds typically run 0.03–0.10%."
                />
                <CompactInput
                  id="active-expense"
                  label="Active Expense Ratio"
                  value={activeExpense}
                  onChange={setActiveExpense}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="3"
                  step="0.01"
                  tooltip="Total annual charge on the active fund, including any platform or advisory layer."
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
                  <SubSection title="Return & Tax Assumptions">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="index-gross"
                        label="Index Gross Return"
                        value={indexGross}
                        onChange={setIndexGross}
                        onEnter={runCalculate}
                        suffix="%"
                        min="-50"
                        max="50"
                        step="0.1"
                        tooltip="Market return before costs; the fund earns this and then pays its expenses."
                      />
                      <CompactInput
                        id="active-gross"
                        label="Active Gross Return"
                        value={activeGross}
                        onChange={setActiveGross}
                        onEnter={runCalculate}
                        suffix="%"
                        min="-50"
                        max="50"
                        step="0.1"
                        tooltip="Gross return before costs. Set it higher than the index to assume the manager creates alpha."
                      />
                      <CompactInput
                        id="index-tax-drag"
                        label="Index Tax Drag"
                        value={indexTaxDrag}
                        onChange={setIndexTaxDrag}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="5"
                        step="0.05"
                        tooltip="Annual cost of taxes on distributions from the index fund; typically very small."
                      />
                      <CompactInput
                        id="active-tax-drag"
                        label="Active Tax Drag"
                        value={activeTaxDrag}
                        onChange={setActiveTaxDrag}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="5"
                        step="0.05"
                        tooltip="Annual cost of taxes on the active fund's distributions, which are larger because turnover is higher."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Both funds earn their gross return, then pay their expense ratio and any tax drag, and the net rate
                      compounds for the holding period. &quot;Break-even active gross&quot; is the gross return the active
                      fund would need to end level with the index fund after all costs — the alpha hurdle, expressed in
                      percentage points above the index&apos;s own gross return.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Break-Even Active Gross Return</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{fmt(results.breakEvenActiveGross, 2)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                alpha of {fmt(results.requiredAlpha, 2)} points needed just to match the index fund after costs
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Index Fund</span>
                <span className="font-extrabold text-foreground">{money(results.indexTerminal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Fund</span>
                <span className={`font-extrabold ${results.difference >= 0 ? "text-emerald-600" : "text-foreground"}`}>
                  {money(results.activeTerminal)}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extra Fees Paid</span>
                <span className="font-extrabold text-destructive">{money(results.activeFeeTotal - results.indexFeeTotal)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[115px]">Index Fund</th>
                    <th className="p-2.5 text-right w-[115px]">Active Fund</th>
                    <th className="p-2.5 text-right w-[110px]">Difference</th>
                    <th className="p-2.5 pr-3 text-right w-[115px]">Active Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.index)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.active)}</td>
                      <td className={`p-2.5 text-right font-semibold ${row.difference >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {money(row.difference)}
                      </td>
                      <td className="p-2.5 pr-3 text-right text-destructive">{money(row.activeFees)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">End of period</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.indexTerminal)}</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.activeTerminal)}</td>
                    <td className={`p-2.5 text-right ${results.difference >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {money(results.difference)}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-destructive">{money(results.activeFeeTotal)}</td>
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
            <h2 className="text-2xl font-bold mb-3">What Does an Index vs Active Fund Comparison Show?</h2>
            <p>
              It answers a question that fund marketing rarely puts in dollar terms: how much gross outperformance must an
              active manager generate just to cover the higher cost of their fund? Expense ratios are small numbers — 0.75%
              against 0.04% — but they apply to the entire balance every year, and the money they consume never compounds. The
              comparison tracks both funds side by side and reports the break-even gross return the active fund would need to
              tie.
            </p>
            <p>
              The tool also models a cost that fee comparisons often miss: tax drag. Active funds trade more, realise more
              gains and distribute them to holders, who pay tax on gains they did not choose to realise. Index funds hold
              positions, distribute far less and let unrealised gains compound until the investor decides to sell. In a
              taxable account that difference can be as large as the expense ratio gap itself.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each fund earns its gross return, pays its expense ratio and its tax drag, and compounds at the remaining net
              rate for the holding period. The default scenario gives the active fund a half-point of genuine gross
              outperformance — 7.5% against 7% — and a 0.75% expense ratio against 0.04%. Despite the manager&apos;s skill,
              the active fund still needs a gross return of about 8.16% just to match the index fund after costs, and falls
              roughly $22,000 behind over twenty years once the tax drag from its higher turnover is counted.
            </p>
            <p>
              The table traces both balances year by year and shows the cumulative fees each fund has paid, which makes the
              compounding of cost visible: the fee total is not the expense ratio multiplied by the years, because the fee is
              charged on a growing balance. Summary Statistics reports the net returns each fund delivers, the break-even
              active gross return, the alpha required in percentage points, and fees as a share of each fund&apos;s result.
            </p>
            <p>
              The break-even figure is the most useful output for a decision. It converts a fee difference into a performance
              hurdle, which is the form in which the choice should actually be evaluated. A 0.7-point fee gap demands
              0.7 points of gross alpha — every year, for decades — before the active fund has done anything for its holder.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the break-even gross return for the active fund with the alpha hurdle implied by the
              cost gap. The three statistics beside it give the terminal value of each fund and the extra fees the active fund
              consumed. A useful exercise is to set the active gross return equal to the index gross return: the difference in
              terminal values is then entirely cost, which is the honest baseline for any active-versus-index argument.
            </p>
            <p>
              Summary Statistics breaks out the net returns, the fees each fund paid, the fee difference and the share of
              each result consumed by fees. Note that the tax drag input applies every year, which mirrors how distributed
              gains are taxed, but it is a simplification: real tax outcomes depend on your bracket and on whether the
              account is tax-advantaged. If the money is in an IRA or 401(k), set both tax drags to zero and the comparison
              becomes purely about expense ratios and gross returns.
            </p>
            <p className="text-sm text-muted-foreground">
              Data vintage: expense ratios, tax drag and gross returns are user inputs, not forecasts. Typical broad-market
              index funds charge 0.03–0.10% and active equity funds 0.5–1.2%; advisory layers add a further 0.5–1%.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/index-fund-vs-active-fund-cost-comparison" />
          <PopularCalculators exclude="/calculator/index-fund-vs-active-fund-cost-comparison" />
        </div>
      </div>
    </>
  );
}
