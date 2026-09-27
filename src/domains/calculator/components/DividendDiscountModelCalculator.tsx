"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type DdmMode = "gordon" | "two-stage";

interface DdmInputs {
  dividend: number;
  requiredReturn: number;
  growth: number;
  price: number;
  mode: DdmMode;
  highYears: number;
  highGrowth: number;
  terminalGrowth: number;
}

const DEFAULTS: DdmInputs = {
  dividend: 2,
  requiredReturn: 9,
  growth: 4.5,
  price: 40,
  mode: "gordon",
  highYears: 5,
  highGrowth: 12,
  terminalGrowth: 3,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface ProjectionRow {
  year: number;
  dividend: number;
  presentValue: number;
}

interface DdmResult {
  valid: boolean;
  errorMsg: string;
  mode: DdmMode;
  sharePrice: number;
  valuePerShare: number;
  dividendNextYear: number;
  terminalValue: number;
  terminalPresentValue: number;
  projectionPresentValue: number;
  impliedReturn: number;
  marginOfSafety: number;
  dividendYield: number;
  upside: number;
  verdict: string;
  yearsToDouble: number;
  rows: ProjectionRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: DdmInputs): DdmResult {
  const d0 = Math.max(0.01, i.dividend);
  const r = i.requiredReturn / 100;
  const g = i.growth / 100;
  const price = Math.max(0, i.price);
  const mode = i.mode;
  const projectionYears = mode === "two-stage" ? Math.max(1, Math.round(i.highYears)) : 10;
  const growthFirst = mode === "two-stage" ? i.highGrowth / 100 : g;
  const terminal = mode === "two-stage" ? i.terminalGrowth / 100 : g;

  const rows: ProjectionRow[] = [];
  let projectionPv = 0;
  for (let t = 1; t <= projectionYears; t++) {
    const dividend = d0 * Math.pow(1 + growthFirst, t);
    const pv = dividend / Math.pow(1 + r, t);
    projectionPv += pv;
    rows.push({ year: t, dividend, presentValue: pv });
  }

  const dividendAtHorizon = d0 * Math.pow(1 + growthFirst, projectionYears);
  const dividendNextYear = dividendAtHorizon * (1 + terminal);
  const terminalValue = r > terminal ? dividendNextYear / (r - terminal) : Number.POSITIVE_INFINITY;
  const terminalPv = terminalValue / Math.pow(1 + r, projectionYears);
  const valuePerShare = projectionPv + terminalPv;

  const gordonNext = d0 * (1 + g);
  const impliedReturn = price > 0 ? ((gordonNext / price) + g) * 100 : 0;
  const marginOfSafety = Number.isFinite(valuePerShare) && valuePerShare > 0 ? ((valuePerShare - price) / valuePerShare) * 100 : 0;
  const upside = price > 0 ? ((valuePerShare - price) / price) * 100 : 0;
  const yearsToDouble = growthFirst > 0 ? Math.log(2) / Math.log(1 + growthFirst) : 0;

  const verdict = !Number.isFinite(valuePerShare)
    ? "Discount rate must exceed the growth rate"
    : valuePerShare > price * 1.2
    ? "Undervalued on these assumptions"
    : valuePerShare < price * 0.8
    ? "Overvalued on these assumptions"
    : "Fairly valued on these assumptions";

  const valid =
    i.dividend > 0 &&
    i.requiredReturn > 0 &&
    i.requiredReturn <= 40 &&
    i.growth >= -10 &&
    i.growth <= 30 &&
    i.price >= 0 &&
    i.highYears >= 1 &&
    i.highYears <= 30 &&
    i.highGrowth >= -10 &&
    i.highGrowth <= 60 &&
    i.terminalGrowth >= -10 &&
    i.terminalGrowth <= 15;
  const errorMsg = valid
    ? ""
    : "Enter a positive dividend and discount rate (up to 40%), growth rates within their ranges, a non-negative share price, and a high-growth period of 1 to 30 years.";

  return {
    valid,
    errorMsg,
    mode,
    sharePrice: price,
    valuePerShare,
    dividendNextYear,
    terminalValue,
    terminalPresentValue: terminalPv,
    projectionPresentValue: projectionPv,
    impliedReturn,
    marginOfSafety,
    dividendYield: price > 0 ? (d0 / price) * 100 : 0,
    upside,
    verdict,
    yearsToDouble,
    rows,
    summary: [
      { label: "Current Dividend", value: money2(d0) },
      { label: "Discount Rate", value: fmt(i.requiredReturn, 2) + "%" },
      { label: "Growth Rate Used", value: fmt(growthFirst * 100, 2) + "%" },
      { label: "Terminal Growth", value: fmt(terminal * 100, 2) + "%" },
      { label: "Next Year's Dividend", value: money2(mode === "two-stage" ? rows[0].dividend : d0 * (1 + g)) },
      { label: "Value per Share", value: Number.isFinite(valuePerShare) ? money2(valuePerShare) : "Undefined", tone: "text-primary" },
      { label: "Share Price", value: money2(price) },
      { label: "Margin of Safety", value: fmt(marginOfSafety, 2) + "%", tone: marginOfSafety >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Upside to Fair Value", value: fmt(upside, 2) + "%", tone: upside >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Implied Return at Price", value: fmt(impliedReturn, 2) + "%" },
      { label: "Dividend Yield", value: fmt((d0 / Math.max(price, 0.01)) * 100, 2) + "%" },
      { label: "PV of Projected Dividends", value: money2(projectionPv) },
      { label: "Terminal Value", value: Number.isFinite(terminalValue) ? money2(terminalValue) : "Undefined" },
      { label: "PV of Terminal Value", value: Number.isFinite(terminalPv) ? money2(terminalPv) : "Undefined" },
      { label: "Terminal Share of Value", value: Number.isFinite(terminalPv) && valuePerShare > 0 ? fmt((terminalPv / valuePerShare) * 100, 1) + "%" : "—" },
      { label: "Years to Double Dividend", value: yearsToDouble > 0 ? fmt(yearsToDouble, 1) + " yr" : "—" },
      { label: "Valuation Verdict", value: verdict },
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

export default function DividendDiscountModelCalculator() {
  const [dividend, setDividend] = useState(String(DEFAULTS.dividend));
  const [requiredReturn, setRequiredReturn] = useState(String(DEFAULTS.requiredReturn));
  const [growth, setGrowth] = useState(String(DEFAULTS.growth));
  const [price, setPrice] = useState(String(DEFAULTS.price));
  const [mode, setMode] = useState<DdmMode>(DEFAULTS.mode);
  const [highYears, setHighYears] = useState(String(DEFAULTS.highYears));
  const [highGrowth, setHighGrowth] = useState(String(DEFAULTS.highGrowth));
  const [terminalGrowth, setTerminalGrowth] = useState(String(DEFAULTS.terminalGrowth));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DdmInputs => ({
    dividend: parseFloat(dividend) || 0,
    requiredReturn: parseFloat(requiredReturn) || 0,
    growth: parseFloat(growth) || 0,
    price: parseFloat(price) || 0,
    mode,
    highYears: parseFloat(highYears) || 0,
    highGrowth: parseFloat(highGrowth) || 0,
    terminalGrowth: parseFloat(terminalGrowth) || 0,
  });

  const [results, setResults] = useState<DdmResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setDividend(String(DEFAULTS.dividend));
    setRequiredReturn(String(DEFAULTS.requiredReturn));
    setGrowth(String(DEFAULTS.growth));
    setPrice(String(DEFAULTS.price));
    setMode(DEFAULTS.mode);
    setHighYears(String(DEFAULTS.highYears));
    setHighGrowth(String(DEFAULTS.highGrowth));
    setTerminalGrowth(String(DEFAULTS.terminalGrowth));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the dividend discount model?",
      answer:
        "The dividend discount model values a share by the dividends it will pay, discounted back to today. The logic is that a shareholder's only cash return is the dividend stream — buybacks and takeover proceeds ultimately serve the same end — so the fair price is the present value of those future payments at an appropriate discount rate. The Gordon growth version assumes dividends grow at a single constant rate forever.",
    },
    {
      question: "How does the Gordon growth formula work?",
      answer:
        "Divide next year's dividend by the difference between the required return and the growth rate. If a share pays $2.00 now, grows 4.5% a year and the required return is 9%, next year's dividend is $2.09 and the value is $2.09 divided by 4.5%, or $46.44. The whole model hinges on that spread: as the growth rate approaches the required return, the value rises towards infinity, which is why the formula fails for high-growth companies.",
    },
    {
      question: "What is a two-stage dividend discount model?",
      answer:
        "It splits the future into a high-growth phase and a mature phase. Dividends grow quickly for a set number of years — five years at 12%, say — and then settle to a sustainable terminal rate such as 3%. The present value of the fast-growth dividends is added to the present value of the terminal value. This fits companies that currently reinvest heavily but will eventually mature into dividend payers.",
    },
    {
      question: "What discount rate should I use?",
      answer:
        "The required return should reflect the risk of the cash flows: the risk-free rate plus an equity risk premium, adjusted for the company's beta and any specific risks. In practice most analysts use 8–12% for developed-market equities. A higher discount rate lowers the valuation sharply, so the discount rate matters as much as the growth assumption — always run both.",
    },
    {
      question: "What is margin of safety?",
      answer:
        "Margin of safety is the discount between the model's fair value and the market price, expressed as a percentage of fair value. It exists because every input is an estimate: growth, discount rate and terminal assumptions all carry error. Buying at a 25% discount means the investment can still work out if the estimates are somewhat optimistic, which is why value investors demand a margin rather than paying fair value.",
    },
    {
      question: "When does the model not work?",
      answer:
        "When the company pays no dividend, when growth exceeds the discount rate, or when the payout is unstable. The model is also highly sensitive near the boundary: a terminal growth rate of 4.9% against a 5% discount rate produces an enormous value that is really an artifact of the arithmetic. Use it for mature, steady dividend payers and treat any result where growth is close to the discount rate as unusable.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Dividend Discount Model Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Dividend Discount Model Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Dividend & Required Return">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="dividend"
                  label="Current Dividend"
                  value={dividend}
                  onChange={setDividend}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0.01"
                  step="0.05"
                  tooltip="Annual dividend per share paid over the last twelve months."
                />
                <CompactInput
                  id="required-return"
                  label="Required Return"
                  value={requiredReturn}
                  onChange={setRequiredReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0.1"
                  max="40"
                  step="0.25"
                  tooltip="The discount rate: the return you demand for holding the equity risk."
                />
                <CompactInput
                  id="growth"
                  label="Growth Rate"
                  value={growth}
                  onChange={setGrowth}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-10"
                  max="30"
                  step="0.25"
                  tooltip="Perpetual dividend growth rate used by the Gordon growth model."
                />
                <CompactInput
                  id="price"
                  label="Share Price"
                  value={price}
                  onChange={setPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="0.5"
                  tooltip="Current market price, used for the margin of safety and implied return."
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
                  <SubSection title="Model & Two-Stage Growth">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label htmlFor="mode" className="flex items-center text-sm font-semibold text-foreground mb-1">
                          Model
                        </label>
                        <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <select
                            id="mode"
                            value={mode}
                            onChange={(e) => setMode(e.target.value as DdmMode)}
                            className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                          >
                            <option value="gordon">Gordon growth (constant)</option>
                            <option value="two-stage">Two-stage growth</option>
                          </select>
                        </div>
                      </div>
                      <CompactInput
                        id="high-years"
                        label="High-Growth Years"
                        value={highYears}
                        onChange={setHighYears}
                        onEnter={runCalculate}
                        suffix="yr"
                        min="1"
                        max="30"
                        step="1"
                        tooltip="Length of the fast-growth phase in the two-stage model."
                      />
                      <CompactInput
                        id="high-growth"
                        label="High Growth Rate"
                        value={highGrowth}
                        onChange={setHighGrowth}
                        onEnter={runCalculate}
                        suffix="%"
                        min="-10"
                        max="60"
                        step="0.5"
                        tooltip="Dividend growth during the first phase of the two-stage model."
                      />
                      <CompactInput
                        id="terminal-growth"
                        label="Terminal Growth"
                        value={terminalGrowth}
                        onChange={setTerminalGrowth}
                        onEnter={runCalculate}
                        suffix="%"
                        min="-10"
                        max="15"
                        step="0.25"
                        tooltip="Sustainable growth after the high-growth phase; keep it at or below long-run nominal GDP growth."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Model Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The terminal value dominates long-dated valuations: with a 10-year projection it typically accounts for
                      most of the fair value. Treat any result where terminal growth approaches the discount rate as
                      undefined rather than infinite, because small assumption changes swing the answer enormously. A
                      terminal growth rate above nominal GDP growth is not sustainable forever.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Fair Value per Share</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {Number.isFinite(results.valuePerShare) ? money2(results.valuePerShare) : "Undefined"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.marginOfSafety, 2)}% margin of safety at a {money2(results.sharePrice)} price · {results.verdict}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Implied Return</span>
                <span className="font-extrabold text-foreground">{fmt(results.impliedReturn, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dividend Yield</span>
                <span className="font-extrabold text-foreground">{fmt(results.dividendYield, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Upside</span>
                <span className={`font-extrabold ${results.upside >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {fmt(results.upside, 2)}%
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[130px]">Dividend per Share</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Present Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money2(row.dividend)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money2(row.presentValue)}</td>
                    </tr>
                  ))}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Terminal value</td>
                    <td className="p-2.5 text-right text-muted-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {Number.isFinite(results.terminalPresentValue) ? money2(results.terminalPresentValue) : "Undefined"}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Value per share</td>
                    <td className="p-2.5 text-right text-muted-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {Number.isFinite(results.valuePerShare) ? money2(results.valuePerShare) : "Undefined"}
                    </td>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Dividend Discount Model?</h2>
            <p>
              The dividend discount model values a share by the cash it pays out. The argument is that a shareholder&apos;s
              only direct return is the dividend stream, so the fair price today is the present value of every future
              dividend, discounted at the return an investor requires. The model is the oldest formal valuation approach in
              equity analysis and remains a standard tool for mature businesses with stable payouts — utilities, consumer
              staples and established financials.
            </p>
            <p>
              Its appeal is transparency. Unlike a discounted cash flow model built on forecasts of reinvestment and margins,
              the dividend discount model works from a single observable payment and two assumptions: the growth rate and the
              required return. That also makes its weaknesses visible: it is useless for companies that do not pay dividends,
              and it is extremely sensitive to its inputs when growth approaches the discount rate.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              In the Gordon growth form, next year&apos;s dividend is divided by the difference between the required return
              and the perpetual growth rate. With a $2.00 dividend, 4.5% growth and a 9% required return, next year&apos;s
              payment is $2.09 and the value is $46.44. The gap between the two rates is doing all the work: a 1% increase in
              growth raises the value by roughly 30% in that example, and if growth ever reaches the discount rate the
              arithmetic breaks down entirely.
            </p>
            <p>
              The two-stage form handles companies in transition. Dividends grow quickly for a defined number of years — the
              calculator defaults to five years at 12% — and then settle into a mature terminal rate such as 3%. Each
              fast-growth dividend is discounted individually, and a terminal value is computed from the first mature-year
              dividend and discounted back over the same period. The model then reports how much of the total value rests on
              that terminal figure, which is usually the majority.
            </p>
            <p>
              The calculator also inverts the relationship. Given the market price, the implied return is the dividend yield
              plus the growth rate, which is the return an investor buying at today&apos;s price would earn if the growth
              assumption proves right. Comparing that implied return with the required return shows whether the market is
              more optimistic or more cautious than you are.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card gives the fair value per share with the margin of safety against the market price and a plain
              verdict. The three statistics beside it show the implied return at that price, the current dividend yield, and
              the percentage upside to fair value. The table lists each projected dividend with its present value, the
              discounted terminal value, and the total.
            </p>
            <p>
              Summary Statistics collects the rates and growth assumptions, the next year&apos;s dividend, the terminal value
              and the share of fair value it represents, the years the dividend takes to double at the assumed growth rate,
              and the margin of safety. Two experiments are worth running. First, raise the required return by a point and
              watch fair value fall — discount rate risk usually exceeds growth risk. Second, switch to the two-stage model
              and lower terminal growth: the terminal share figure shows how much of the valuation depends on a growth rate
              that must be sustainable for decades.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-discount-model-calculator" />
          <PopularCalculators exclude="/calculator/dividend-discount-model-calculator" />
        </div>
      </div>
    </>
  );
}
