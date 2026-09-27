"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AfterTaxInputs {
  amount: number;
  grossReturn: number;
  years: number;
  ordinaryRate: number;
  dividendYield: number;
  ltcgRate: number;
  expenseRatio: number;
  stateRate: number;
  inflation: number;
}

const DEFAULTS: AfterTaxInputs = {
  amount: 50000,
  grossReturn: 8,
  years: 10,
  ordinaryRate: 24,
  dividendYield: 1.5,
  ltcgRate: 15,
  expenseRatio: 0.2,
  stateRate: 5,
  inflation: 2.5,
};

const NOTE =
  "Federal rates used here are the 2026 long-term capital gains brackets: 0% up to $49,450 of taxable income for single filers and $98,900 for married filing jointly, 15% up to $545,500 and $613,700, and 20% above those levels, per IRS Rev. Proc. 2025-32. Thresholds are indexed each year, so re-check the bracket that applies to you.";

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface YearRow {
  year: number;
  pretax: number;
  dividends: number;
  taxPaid: number;
  afterTaxIfSold: number;
}

interface AfterTaxResult {
  valid: boolean;
  errorMsg: string;
  netReturn: number;
  pretaxValue: number;
  pretaxGain: number;
  afterTaxValue: number;
  afterTaxGain: number;
  totalTax: number;
  dividendTax: number;
  capitalGainsTax: number;
  effectiveTaxRate: number;
  amountInvested: number;
  pretaxCagr: number;
  afterTaxCagr: number;
  taxDrag: number;
  realAfterTax: number;
  realCagr: number;
  perYearTax: number;
  rows: YearRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: AfterTaxInputs): AfterTaxResult {
  const amount = Math.max(0, i.amount);
  const years = Math.max(1, Math.round(i.years));
  const netReturn = (i.grossReturn || 0) - (i.expenseRatio || 0);
  const divYield = Math.max(0, i.dividendYield) / 100;
  const capitalTax = Math.max(0, i.ltcgRate + i.stateRate) / 100;
  const dividendTaxRate = Math.max(0, i.ltcgRate + i.stateRate) / 100;
  const r = netReturn / 100;
  const priceGrowth = r - divYield;
  const inflation = Math.max(0, i.inflation) / 100;

  let balance = amount;
  let dividendsReceived = 0;
  let dividendTax = 0;
  const rows: YearRow[] = [];

  for (let year = 1; year <= years; year++) {
    const div = balance * divYield;
    const divTax = div * dividendTaxRate;
    balance = balance + balance * priceGrowth - divTax;
    dividendsReceived += div;
    dividendTax += divTax;
    const gain = Math.max(0, balance - amount);
    rows.push({
      year,
      pretax: amount * Math.pow(1 + r, year),
      dividends: div,
      taxPaid: dividendTax,
      afterTaxIfSold: balance - gain * capitalTax,
    });
  }

  const pretaxValue = amount * Math.pow(1 + r, years);
  const capitalGain = Math.max(0, balance - amount);
  const capitalGainsTax = capitalGain * capitalTax;
  const totalTax = dividendTax + capitalGainsTax;
  const afterTaxValue = balance - capitalGainsTax;
  const pretaxGain = pretaxValue - amount;
  const taxBase = pretaxGain + dividendsReceived;
  const effectiveTaxRate = taxBase > 0 ? (totalTax / taxBase) * 100 : 0;
  const pretaxCagr = amount > 0 ? (Math.pow(pretaxValue / amount, 1 / years) - 1) * 100 : 0;
  const afterTaxCagr = amount > 0 ? (Math.pow(Math.max(afterTaxValue, 0.01) / amount, 1 / years) - 1) * 100 : 0;
  const realAfterTax = afterTaxValue / Math.pow(1 + inflation, years);
  const realCagr = (Math.pow(Math.max(realAfterTax, 0.01) / Math.max(amount, 1), 1 / years) - 1) * 100;

  const valid =
    i.amount > 0 &&
    i.grossReturn >= 0 &&
    i.years > 0 &&
    i.ordinaryRate >= 0 &&
    i.ordinaryRate <= 60 &&
    i.ltcgRate >= 0 &&
    i.ltcgRate <= 40 &&
    i.dividendYield >= 0 &&
    i.dividendYield <= 20 &&
    i.expenseRatio >= 0 &&
    i.stateRate >= 0 &&
    i.inflation >= 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive amount and holding period, a non-negative gross return, expense ratio, dividend yield, state rate and inflation, and tax rates within their plausible ranges.";

  return {
    valid,
    errorMsg,
    netReturn,
    pretaxValue,
    pretaxGain,
    afterTaxValue,
    afterTaxGain: afterTaxValue - amount,
    totalTax,
    dividendTax,
    capitalGainsTax,
    effectiveTaxRate,
    amountInvested: amount,
    pretaxCagr,
    afterTaxCagr,
    taxDrag: pretaxCagr - afterTaxCagr,
    realAfterTax,
    realCagr,
    perYearTax: years > 0 ? totalTax / years : 0,
    rows,
    summary: [
      { label: "Amount Invested", value: money2(amount) },
      { label: "Net Return After Fees", value: fmt(netReturn, 2) + "%" },
      { label: "Pre-Tax Value", value: money(pretaxValue) },
      { label: "Pre-Tax Annualized", value: fmt(pretaxCagr, 2) + "%" },
      { label: "After-Tax Value", value: money(afterTaxValue), tone: "text-emerald-600" },
      { label: "After-Tax Profit", value: money(afterTaxValue - amount), tone: "text-emerald-600" },
      { label: "After-Tax Annualized", value: fmt(afterTaxCagr, 2) + "%", tone: "text-primary" },
      { label: "Tax Drag", value: fmt(pretaxCagr - afterTaxCagr, 2) + " pp", tone: "text-destructive" },
      { label: "Total Tax Paid", value: money(totalTax), tone: "text-destructive" },
      { label: "Tax on Dividends", value: money(dividendTax) },
      { label: "Tax on Price Gain", value: money(capitalGainsTax) },
      { label: "Effective Tax Rate", value: fmt(effectiveTaxRate, 2) + "%" },
      { label: "Average Tax Per Year", value: money((totalTax / years) || 0) },
      { label: "Real (Today's Dollars)", value: money(realAfterTax) },
      { label: "Real Annualized Return", value: fmt(realCagr, 2) + "%" },
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

export default function AfterTaxInvestmentReturnCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [grossReturn, setGrossReturn] = useState(String(DEFAULTS.grossReturn));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [ordinaryRate, setOrdinaryRate] = useState(String(DEFAULTS.ordinaryRate));
  const [dividendYield, setDividendYield] = useState(String(DEFAULTS.dividendYield));
  const [ltcgRate, setLtcgRate] = useState(String(DEFAULTS.ltcgRate));
  const [expenseRatio, setExpenseRatio] = useState(String(DEFAULTS.expenseRatio));
  const [stateRate, setStateRate] = useState(String(DEFAULTS.stateRate));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AfterTaxInputs => ({
    amount: parseFloat(amount) || 0,
    grossReturn: parseFloat(grossReturn) || 0,
    years: parseFloat(years) || 0,
    ordinaryRate: parseFloat(ordinaryRate) || 0,
    dividendYield: parseFloat(dividendYield) || 0,
    ltcgRate: parseFloat(ltcgRate) || 0,
    expenseRatio: parseFloat(expenseRatio) || 0,
    stateRate: parseFloat(stateRate) || 0,
    inflation: parseFloat(inflation) || 0,
  });

  const [results, setResults] = useState<AfterTaxResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setGrossReturn(String(DEFAULTS.grossReturn));
    setYears(String(DEFAULTS.years));
    setOrdinaryRate(String(DEFAULTS.ordinaryRate));
    setDividendYield(String(DEFAULTS.dividendYield));
    setLtcgRate(String(DEFAULTS.ltcgRate));
    setExpenseRatio(String(DEFAULTS.expenseRatio));
    setStateRate(String(DEFAULTS.stateRate));
    setInflation(String(DEFAULTS.inflation));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is an after-tax investment return?",
      answer:
        "It is the return you actually keep once the tax code has taken its share. A fund can report an 8% gross return, but management fees, dividends taxed each year and capital gains taxed on sale all reduce the figure that reaches your account. The after-tax return restates the outcome as an annualised rate so it can be compared fairly with other investments that are taxed differently.",
    },
    {
      question: "How are dividends and price gains taxed differently?",
      answer:
        "Qualified dividends and long-term capital gains share the same preferential rate schedule, but they are taxed at different times. Dividends are taxed every year they are paid, so the tax money leaves the account and cannot compound. Price gains are only taxed when you sell, which means the government's share keeps compounding alongside your own until the sale. That difference is why a buy-and-hold strategy can beat a higher-yielding, actively traded one even when the pre-tax returns look identical.",
    },
    {
      question: "What is tax drag?",
      answer:
        "Tax drag is the gap between the pre-tax annualised return and the after-tax annualised return, expressed in percentage points. A portfolio that compounds at 7.8% before tax and 6.1% after tax has a drag of 1.7 percentage points. Tax drag is useful because it lets you compare strategies: a lower-return investment held in a tax-advantaged account may beat a higher-return one held in a taxable account once the drag is counted.",
    },
    {
      question: "Why does the calculator use an ordinary income rate?",
      answer:
        "The ordinary rate is shown for reference and for the case where gains are realised inside a tax-deferred account and eventually withdrawn as ordinary income. In a taxable account, long-term gains use the capital gains schedule, and short-term gains realised inside a year are taxed at the ordinary rate. This tool models long-term holding, so the capital gains rate drives the result; the ordinary rate is there for the comparison figure.",
    },
    {
      question: "Does the calculator account for inflation?",
      answer:
        "Yes. The final figures include the after-tax balance converted into today's purchasing power using your inflation assumption, plus the real annualised return. A nominal after-tax return of 6% with 2.5% inflation leaves roughly 3.4% of real growth, which is the number that describes how much better off you actually are.",
    },
    {
      question: "What are the 2026 capital gains thresholds?",
      answer: NOTE,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "After-Tax Investment Return Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          After-Tax Investment Return Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment">
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
                  tooltip="The amount you put in at the start, before any growth or tax."
                />
                <CompactInput
                  id="gross-return"
                  label="Gross Return"
                  value={grossReturn}
                  onChange={setGrossReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="40"
                  step="0.1"
                  tooltip="Annual return before fees and taxes, including dividends."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  max="60"
                  step="1"
                  tooltip="How long the money stays invested before the gain is realised."
                />
                <CompactInput
                  id="ordinary-rate"
                  label="Ordinary Rate"
                  value={ordinaryRate}
                  onChange={setOrdinaryRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="60"
                  step="1"
                  tooltip="Marginal ordinary income rate, used for the comparison figure and retirement withdrawals."
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
                  <SubSection title="Income & Fees">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="dividend-yield"
                        label="Dividend Yield"
                        value={dividendYield}
                        onChange={setDividendYield}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.1"
                        tooltip="Share of the gross return paid out and taxed every year rather than deferred."
                      />
                      <CompactInput
                        id="expense-ratio"
                        label="Expense Ratio"
                        value={expenseRatio}
                        onChange={setExpenseRatio}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="5"
                        step="0.05"
                        tooltip="Annual fund fee deducted from the gross return before tax is considered."
                      />
                      <CompactInput
                        id="ltcg-rate"
                        label="Capital Gains Rate"
                        value={ltcgRate}
                        onChange={setLtcgRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="40"
                        step="1"
                        tooltip="Federal rate on long-term gains and qualified dividends: 0%, 15% or 20% under the 2026 brackets."
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
                        tooltip="State income tax on investment income; set 0 in states with no tax on gains."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation"
                        value={inflation}
                        onChange={setInflation}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="15"
                        step="0.1"
                        tooltip="Used to restate the final balance in today's purchasing power."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Dividends are taxed in the year they are paid and the tax is assumed to be paid from the account, so
                      that money never compounds. Price appreciation is taxed once, at the end, when the position is sold.
                      Fees reduce the gross return every year. Short-term gains, which would be taxed at the ordinary rate,
                      are outside this model — the name of the tool is long-term after-tax return.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">After-Tax Value</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.afterTaxValue)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.afterTaxCagr, 2)}% a year after tax · {money(results.afterTaxValue - results.amountInvested)} profit
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pre-Tax Value</span>
                <span className="font-extrabold text-foreground">{money(results.pretaxValue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Tax</span>
                <span className="font-extrabold text-destructive">{money(results.totalTax)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tax Drag</span>
                <span className="font-extrabold text-destructive">{fmt(results.taxDrag, 2)} pp</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[120px]">Pre-Tax Value</th>
                    <th className="p-2.5 text-right w-[110px]">Dividends</th>
                    <th className="p-2.5 text-right w-[110px]">Tax Paid</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">After-Tax If Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.slice(0, 30).map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.pretax)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.dividends)}</td>
                      <td className="p-2.5 text-right text-destructive">{money(row.taxPaid)}</td>
                      <td className="p-2.5 pr-3 text-right text-emerald-600">{money(row.afterTaxIfSold)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.pretaxValue)}</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-destructive">{money(results.totalTax)}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{money(results.afterTaxValue)}</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is an After-Tax Investment Return Calculator?</h2>
            <p>
              An after-tax investment return calculator restates an investment's performance as the rate you actually keep.
              Market returns are quoted before tax because funds, brokers and indexes have no reason to know your bracket —
              but fees, dividend taxes and capital gains taxes all reduce the number that lands in your account. The tool
              takes a gross annual return, splits it into dividend income and price growth, applies the right tax treatment
              to each, and reports both the pre-tax and after-tax outcomes side by side.
            </p>
            <p>
              The distinction matters because two investments with the same headline return can deliver very different
              after-tax results. A high-dividend strategy taxes you every year on money you may not need, while a
              lower-yielding growth strategy defers the tax until sale. Over long horizons the deferred tax compounds, and
              the gap between the two can run to several percentage points a year — far more than the fee differences that
              dominate most fund comparisons.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The model begins with your gross annual return and subtracts the expense ratio, because fees are paid before
              any tax is assessed. The remaining return is divided into a dividend yield, taxed in the year it is paid at
              your qualified dividend rate, and price appreciation, taxed once at the end when the position is sold. The
              dividend tax is assumed to be paid from the account rather than from other income, so the money that goes to
              tax never compounds.
            </p>
            <p>
              Each year the calculator compounds the price growth on the remaining balance and records what the position
              would be worth if it were sold that year, after paying the capital gains tax on the accumulated gain. The
              final year drives the headline result. The after-tax annualised return is the compound annual growth rate of
              the after-tax balance, and tax drag is the difference between the pre-tax and after-tax annualised rates,
              measured in percentage points.
            </p>
            <p>
              Taxes on dividends use the same preferential schedule as long-term gains. For covered funds this is usually
              accurate because dividends from domestic equities are normally qualified; interest from bonds is not, and
              would be taxed at the ordinary rate instead. Bond-heavy portfolios should therefore treat the result as
              slightly optimistic and use the ordinary rate field to sanity-check the difference.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the after-tax value and the after-tax annualised return, with the total after-tax
              profit underneath. The three statistics beside it contrast the pre-tax value, the total tax bill and the tax
              drag in percentage points. If the drag looks small, multiply it by the number of years: a 1.5 point drag over
              25 years removes well over a third of the terminal value.
            </p>
            <p>
              The table projects the position year by year, showing the pre-tax value, the dividends received, the
              cumulative tax paid and what you would keep if you sold that year. Summary Statistics collects the net return
              after fees, the split between dividend tax and capital gains tax, the effective tax rate on the total gain,
              the average tax paid per year, and the real, inflation-adjusted result. Use the capital gains rate field to
              test the 0% bracket: for a single filer with taxable income under $49,450 in 2026, long-term gains can be
              entirely tax-free, which can reshape the comparison between taxable and retirement accounts.
            </p>
            <p className="text-sm text-muted-foreground">Data vintage: {NOTE}</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/after-tax-investment-return-calculator" />
          <PopularCalculators exclude="/calculator/after-tax-investment-return-calculator" />
        </div>
      </div>
    </>
  );
}
