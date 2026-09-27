"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DcfInputs {
  baseFcf: number;
  growthRate: number;
  forecastYears: number;
  terminalGrowth: number;
  discountRate: number;
  netDebt: number;
  sharesOutstanding: number;
}

const DEFAULTS: DcfInputs = {
  baseFcf: 100000,
  growthRate: 8,
  forecastYears: 5,
  terminalGrowth: 2.5,
  discountRate: 10,
  netDebt: 250000,
  sharesOutstanding: 50000,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface DcfYear {
  year: number;
  fcf: number;
  discountFactor: number;
  presentValue: number;
}

interface DcfResult {
  years: DcfYear[];
  pvExplicit: number;
  finalYearFcf: number;
  terminalValue: number;
  pvTerminal: number;
  enterpriseValue: number;
  equityValue: number;
  valuePerShare: number;
  terminalSharePct: number;
  explicitSharePct: number;
  valid: boolean;
  errorMsg: string;
}

function computeDcf(i: DcfInputs): DcfResult {
  const n = Math.max(0, Math.round(i.forecastYears));
  const invalid =
    i.baseFcf <= 0 ||
    i.discountRate <= 0 ||
    i.discountRate <= i.terminalGrowth ||
    n <= 0 ||
    i.sharesOutstanding <= 0;

  const r = i.discountRate / 100;
  const g = i.growthRate / 100;
  const tg = i.terminalGrowth / 100;
  const years: DcfYear[] = [];
  let pvExplicit = 0;
  let fcf = i.baseFcf;

  for (let y = 1; y <= n; y++) {
    fcf = fcf * (1 + g);
    const discountFactor = Math.pow(1 + r, y);
    const presentValue = fcf / discountFactor;
    pvExplicit += presentValue;
    years.push({ year: y, fcf, discountFactor, presentValue });
  }

  const finalYearFcf = years.length ? years[years.length - 1].fcf : i.baseFcf;
  const terminalValue = i.discountRate > i.terminalGrowth ? (finalYearFcf * (1 + tg)) / (r - tg) : 0;
  const pvTerminal = terminalValue / Math.pow(1 + r, n);
  const enterpriseValue = pvExplicit + pvTerminal;
  const equityValue = enterpriseValue - i.netDebt;

  return {
    years,
    pvExplicit,
    finalYearFcf,
    terminalValue,
    pvTerminal,
    enterpriseValue,
    equityValue,
    valuePerShare: i.sharesOutstanding > 0 ? equityValue / i.sharesOutstanding : 0,
    terminalSharePct: enterpriseValue > 0 ? (pvTerminal / enterpriseValue) * 100 : 0,
    explicitSharePct: enterpriseValue > 0 ? (pvExplicit / enterpriseValue) * 100 : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive cash flow and share count, a forecast period above zero, and a discount rate above the terminal growth rate."
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

export default function DiscountedCashFlowDcfCalculator() {
  const [baseFcf, setBaseFcf] = useState(String(DEFAULTS.baseFcf));
  const [growthRate, setGrowthRate] = useState(String(DEFAULTS.growthRate));
  const [forecastYears, setForecastYears] = useState(String(DEFAULTS.forecastYears));
  const [terminalGrowth, setTerminalGrowth] = useState(String(DEFAULTS.terminalGrowth));
  const [discountRate, setDiscountRate] = useState(String(DEFAULTS.discountRate));
  const [netDebt, setNetDebt] = useState(String(DEFAULTS.netDebt));
  const [sharesOutstanding, setSharesOutstanding] = useState(String(DEFAULTS.sharesOutstanding));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DcfInputs => ({
    baseFcf: parseFloat(baseFcf) || 0,
    growthRate: parseFloat(growthRate) || 0,
    forecastYears: parseFloat(forecastYears) || 0,
    terminalGrowth: parseFloat(terminalGrowth) || 0,
    discountRate: parseFloat(discountRate) || 0,
    netDebt: parseFloat(netDebt) || 0,
    sharesOutstanding: parseFloat(sharesOutstanding) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DcfInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DcfResult>(() => computeDcf(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDcf(inputs));
  };

  const reset = () => {
    setBaseFcf(String(DEFAULTS.baseFcf));
    setGrowthRate(String(DEFAULTS.growthRate));
    setForecastYears(String(DEFAULTS.forecastYears));
    setTerminalGrowth(String(DEFAULTS.terminalGrowth));
    setDiscountRate(String(DEFAULTS.discountRate));
    setNetDebt(String(DEFAULTS.netDebt));
    setSharesOutstanding(String(DEFAULTS.sharesOutstanding));
    setCalcInputs(DEFAULTS);
    setResults(computeDcf(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a discounted cash flow model?",
      answer:
        "A DCF values a business by projecting the cash it will generate in the future and discounting each year's cash flow back to today at a rate that reflects risk and the time value of money. The sum of those present values, plus a terminal value for everything beyond the forecast window, is the estimated enterprise value. Subtract net debt and divide by shares to reach a per-share figure.",
    },
    {
      question: "Why is the terminal value usually so large?",
      answer:
        "Because most of a growing company's value lies beyond a five or ten year forecast. Even with modest terminal growth, discounting a perpetuity produced at the end of the explicit period captures decades of cash flow. It is normal for the terminal value to be sixty to eighty percent of the total, and that concentration is exactly why the terminal growth and discount rate assumptions deserve the most scrutiny.",
    },
    {
      question: "What discount rate should I use?",
      answer:
        "The company's weighted average cost of capital is the conventional choice, because it represents the blended return all capital providers require. For a private company or an uncertain projection, many analysts add a premium. The rate should reflect the risk of the specific cash flows being discounted, not a fixed market average, and it must exceed the terminal growth rate or the model produces a meaningless result.",
    },
    {
      question: "What are the main weaknesses of a DCF?",
      answer:
        "It is highly sensitive to inputs, and the inputs are estimates. A one-point change in the discount rate or terminal growth can move the valuation by twenty percent or more, which is why the output should be treated as a range rather than a price target. Small changes in working capital assumptions or capital expenditure also compound across the forecast, so comparing several scenarios is more informative than trusting a single run.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Discounted Cash Flow (DCF) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Discounted Cash Flow (DCF) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Cash Flow & Growth">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="base-fcf"
                  label="Current Free Cash Flow"
                  value={baseFcf}
                  onChange={setBaseFcf}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Trailing free cash flow for the most recent year."
                />
                <CompactInput
                  id="growth-rate"
                  label="Forecast Growth"
                  value={growthRate}
                  onChange={setGrowthRate}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Annual growth applied during the explicit forecast."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="forecast-years"
                  label="Forecast Years"
                  value={forecastYears}
                  onChange={setForecastYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="Length of the explicit projection period."
                />
                <CompactInput
                  id="discount-rate"
                  label="Discount Rate (WACC)"
                  value={discountRate}
                  onChange={setDiscountRate}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Rate used to discount future cash flows."
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
                  <SubSection title="Terminal Value & Balance Sheet">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="terminal-growth"
                        label="Terminal Growth"
                        value={terminalGrowth}
                        onChange={setTerminalGrowth}
                        onEnter={runCalculate}
                        suffix="%"
                        tooltip="Perpetual growth rate after the forecast period."
                      />
                      <CompactInput
                        id="net-debt"
                        label="Net Debt"
                        value={netDebt}
                        onChange={setNetDebt}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Debt minus cash, subtracted to reach equity value."
                      />
                    </div>
                    <div className="mt-3">
                      <CompactInput
                        id="shares"
                        label="Shares Outstanding"
                        value={sharesOutstanding}
                        onChange={setSharesOutstanding}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="Used to convert equity value into a per-share figure."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Value Per Share</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.valuePerShare, 2)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`Equity value of $${fmt(results.equityValue, 0)} after $${fmt(calcInputs.netDebt, 0)} of net debt`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Enterprise Value</span>
                <span className="font-extrabold text-foreground">${fmt(results.enterpriseValue, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Equity Value</span>
                <span className="font-extrabold text-foreground">${fmt(results.equityValue, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Terminal Value Share</span>
                <span className="font-extrabold text-foreground">{fmt(results.terminalSharePct, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[130px]">Free Cash Flow</th>
                    <th className="p-2.5 text-right w-[120px]">Discount Factor</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Present Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.years.map((y) => (
                    <tr key={y.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {y.year}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(y.fcf, 0)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(y.discountFactor, 3)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">${fmt(y.presentValue, 0)}</td>
                    </tr>
                  ))}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Terminal value</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.terminalValue, 0)}</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.pvTerminal, 0)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Enterprise value</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">${fmt(results.enterpriseValue, 0)}</td>
                  </tr>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Present Value of Forecast</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.pvExplicit, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Present Value of Terminal</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.pvTerminal, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Year Cash Flow</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.finalYearFcf, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Forecast Share of Value</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.explicitSharePct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Discount Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.discountRate, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Terminal Growth</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.terminalGrowth, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Discounted Cash Flow (DCF) Calculator?</h2>
            <p>
              A discounted cash flow calculator values a business from the cash it is expected to produce. Future free
              cash flows are projected forward, each one is discounted back to the present at a rate that reflects risk
              and the time value of money, and a terminal value captures everything after the forecast window. The sum is
              enterprise value; subtracting net debt leaves the equity value that belongs to shareholders.
            </p>
            <p>
              The appeal of the approach is that it depends on fundamentals rather than multiples. Instead of asking what
              a similar company trades for, it asks what this one is worth given the cash it generates, how fast that cash
              grows, and how risky it is. The weakness is symmetrical: because the answer depends entirely on assumptions,
              the model rewards discipline far more than it rewards optimism.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Starting from the current free cash flow, the calculator grows the figure at the forecast rate for each
              year of the explicit period. Every year is divided by one plus the discount rate raised to that year, which
              converts it into today&apos;s dollars. Those discounted amounts are summed to give the present value of the
              forecast period.
            </p>
            <p>
              The terminal value takes the final forecast year&apos;s cash flow, grows it by the terminal rate, and divides
              by the difference between the discount rate and the terminal growth rate — the standard Gordon growth
              formula for a perpetuity. That value is then discounted back from the final forecast year. Net debt is
              deducted from enterprise value, and the remainder is divided by shares outstanding for a per-share estimate.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the estimated value per share, with equity value and the net debt deduction
              beneath it. The three-stat bar sets enterprise value, equity value and the terminal value&apos;s share of the
              total side by side, and the table shows each forecast year with its discount factor and present value.
            </p>
            <p>
              The terminal share is the number worth studying first. When it climbs above roughly three quarters of total
              value, the model is really a bet on the perpetual growth assumption rather than on the five or ten years of
              visible forecasting. Changing terminal growth by half a point in that situation can move the valuation more
              than changing the entire explicit forecast.
            </p>
            <p>
              Treat the output as a range, not a price. Run the model at several discount rates and growth rates, and note
              how far apart the answers are; that spread is the honest measure of the model&apos;s confidence. A DCF is most
              useful when it forces those assumptions into the open, and least useful when a single number is presented as
              if it were a fact. Keep a written record of the assumptions behind each run as well, because a valuation
              is only as repeatable as the reasoning attached to it, and comparing today's inputs with last year's is the
              fastest way to see whether your expectations have drifted with the story or with the cash.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/discounted-cash-flow-dcf-calculator" />
          <PopularCalculators exclude="/calculator/discounted-cash-flow-dcf-calculator" />
        </div>
      </div>
    </>
  );
}
