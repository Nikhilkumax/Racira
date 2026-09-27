"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface GrowthInputs {
  initial: number;
  final: number;
  years: number;
  dividends: number;
  inflation: number;
}

const DEFAULTS: GrowthInputs = {
  initial: 10000,
  final: 25000,
  years: 8,
  dividends: 800,
  inflation: 2.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface GrowthRow {
  year: number;
  value: number;
  gain: number;
  cumulative: number;
}

interface GrowthResult {
  valid: boolean;
  errorMsg: string;
  initialValue: number;
  finalValue: number;
  multiple: number;
  totalGrowth: number;
  cagr: number;
  simpleAnnual: number;
  cagrWithDividends: number;
  doublingTime: number;
  rule72: number;
  realCagr: number;
  realFinal: number;
  perYearDollars: number;
  rows: GrowthRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: GrowthInputs): GrowthResult {
  const initial = Math.max(0.01, i.initial);
  const final = Math.max(0, i.final);
  const years = Math.max(1, i.years);
  const dividends = Math.max(0, i.dividends);
  const inflation = Math.max(0, i.inflation) / 100;

  const totalGrowth = ((final - initial) / initial) * 100;
  const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
  const simpleAnnual = totalGrowth / years;
  const cagrWithDividends = (Math.pow((final + dividends) / initial, 1 / years) - 1) * 100;
  const doublingTime = cagr > 0 ? Math.log(2) / Math.log(1 + cagr / 100) : 0;
  const realCagr = ((1 + cagr / 100) / (1 + inflation) - 1) * 100;
  const realFinal = final / Math.pow(1 + inflation, years);

  let value = initial;
  const rows: GrowthRow[] = [];
  for (let year = 1; year <= Math.min(30, Math.ceil(years)); year++) {
    const gain = value * (cagr / 100);
    value += gain;
    rows.push({ year, value, gain, cumulative: ((value - initial) / initial) * 100 });
  }

  const valid = i.initial > 0 && i.final >= 0 && i.years > 0 && i.inflation >= 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive initial value and holding period, a non-negative final value, dividends and inflation rate.";

  return {
    valid,
    errorMsg,
    initialValue: initial,
    finalValue: final,
    multiple: final / initial,
    totalGrowth,
    cagr,
    simpleAnnual,
    cagrWithDividends,
    doublingTime,
    rule72: cagr > 0 ? 72 / cagr : 0,
    realCagr,
    realFinal,
    perYearDollars: (final - initial) / years,
    rows,
    summary: [
      { label: "Initial Value", value: money2(initial) },
      { label: "Final Value", value: money2(final) },
      { label: "Holding Period", value: fmt(years, 1) + " yr" },
      { label: "Total Growth", value: fmt(totalGrowth, 2) + "%", tone: totalGrowth >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "CAGR", value: fmt(cagr, 2) + "%", tone: "text-primary" },
      { label: "CAGR With Dividends", value: fmt(cagrWithDividends, 2) + "%" },
      { label: "Simple Annual Growth", value: fmt(simpleAnnual, 2) + "%" },
      { label: "Growth in Dollars", value: money(final - initial) },
      { label: "Average Dollars per Year", value: money((final - initial) / years) },
      { label: "Dividends Received", value: money(dividends) },
      { label: "Years to Double", value: doublingTime > 0 ? fmt(doublingTime, 2) + " yr" : "—" },
      { label: "Rule of 72 Estimate", value: cagr > 0 ? fmt(72 / cagr, 2) + " yr" : "—" },
      { label: "Inflation", value: fmt(i.inflation, 2) + "%" },
      { label: "Real CAGR", value: fmt(realCagr, 2) + "%" },
      { label: "Final Value in Today's Dollars", value: money(realFinal) },
      { label: "Multiple of Money", value: fmt(final / initial, 2) + "x" },
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

export default function GrowthRateOfInvestmentCalculator() {
  const [initial, setInitial] = useState(String(DEFAULTS.initial));
  const [final, setFinal] = useState(String(DEFAULTS.final));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [dividends, setDividends] = useState(String(DEFAULTS.dividends));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): GrowthInputs => ({
    initial: parseFloat(initial) || 0,
    final: parseFloat(final) || 0,
    years: parseFloat(years) || 0,
    dividends: parseFloat(dividends) || 0,
    inflation: parseFloat(inflation) || 0,
  });

  const [results, setResults] = useState<GrowthResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setInitial(String(DEFAULTS.initial));
    setFinal(String(DEFAULTS.final));
    setYears(String(DEFAULTS.years));
    setDividends(String(DEFAULTS.dividends));
    setInflation(String(DEFAULTS.inflation));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the growth rate of an investment?",
      answer:
        "The growth rate is the compound annual rate at which an investment grew from its starting value to its ending value. It is not the same as the total return divided by the number of years: compounding means a 150% total gain over eight years is a 12.1% annual rate, not 18.75%. The compound annual growth rate, or CAGR, is the standard way to express performance because it accounts for the fact that gains are reinvested.",
    },
    {
      question: "How is CAGR calculated?",
      answer:
        "Divide the final value by the initial value, raise the result to the power of one over the number of years, and subtract one. A $10,000 investment that becomes $25,000 in eight years grows by a factor of 2.5; the eighth root of 2.5 is 1.1215, so the CAGR is 12.15%. The formula uses only the endpoints, which makes it easy to apply and also hides everything that happened in between.",
    },
    {
      question: "What does CAGR not tell you?",
      answer:
        "It ignores volatility. Two investments can deliver the same CAGR with wildly different paths — one smooth, one halving and then quadrupling. It also ignores cash flows: if you added or withdrew money during the period, the endpoint ratio no longer describes your actual experience, and a money-weighted return is the right measure. Finally, a spectacular CAGR over a short period is statistically meaningless.",
    },
    {
      question: "Should dividends be included in the growth rate?",
      answer:
        "For total return, yes. A share that appreciates 6% a year and pays a 3% dividend grew your wealth by roughly 9% a year if the dividends were reinvested. The calculator reports two figures: the price CAGR using the final value alone, and a total-return CAGR that adds dividends received to the final value. The difference is the contribution of income to your result.",
    },
    {
      question: "What is the rule of 72?",
      answer:
        "It is a mental shortcut: divide 72 by the annual growth rate to estimate how many years it takes to double your money. At 8% the estimate is nine years; the exact answer is 9.01 years. The rule is accurate between about 4% and 15% and drifts at very high rates, which is why the calculator shows both the shortcut and the exact doubling time.",
    },
    {
      question: "Why does the real growth rate matter more than the nominal one?",
      answer:
        "Because purchasing power is what you can spend. A 12.15% nominal CAGR with 2.5% inflation is a real growth rate of about 9.4% a year, and the final value in today's dollars is meaningfully smaller than the nominal figure. Over long periods the gap compounds: a nominal double can be barely a 45% real gain after twenty years of moderate inflation.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Growth Rate of Investment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Growth Rate of Investment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Start & End Values">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="initial"
                  label="Initial Value"
                  value={initial}
                  onChange={setInitial}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0.01"
                  step="1000"
                  tooltip="What the investment was worth at the start of the period."
                />
                <CompactInput
                  id="final"
                  label="Final Value"
                  value={final}
                  onChange={setFinal}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="What it is worth at the end, before adding any dividends received along the way."
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
                  tooltip="Length of the period in years; fractional years are allowed."
                />
                <CompactInput
                  id="dividends"
                  label="Dividends Received"
                  value={dividends}
                  onChange={setDividends}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="100"
                  tooltip="Total dividends or interest collected over the period, reinvested or not."
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
                  <SubSection title="Real Return">
                    <div className="grid grid-cols-2 gap-3">
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
                        tooltip="Average annual inflation over the period, used to convert the result into today's dollars."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      CAGR uses only the endpoints, so it ignores the path taken and any cash added or withdrawn during the
                      period. The table grows the initial value at the CAGR each year, which is a smooth restatement of the
                      same result rather than a forecast. For the growth rate of a plan with ongoing contributions, use a
                      money-weighted return instead.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Compound Annual Growth Rate</div>
              <div className={`text-4xl font-extrabold mb-1 tracking-tight ${results.cagr >= 0 ? "text-foreground" : "text-destructive"}`}>
                {fmt(results.cagr, 2)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.totalGrowth, 2)}% total growth over the period · {fmt(results.realCagr, 2)}% after inflation
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Years to Double</span>
                <span className="font-extrabold text-foreground">{results.doublingTime > 0 ? fmt(results.doublingTime, 1) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">With Dividends</span>
                <span className="font-extrabold text-emerald-600">{fmt(results.cagrWithDividends, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Multiple</span>
                <span className="font-extrabold text-foreground">{fmt(results.multiple, 2)}x</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[130px]">Value at CAGR</th>
                    <th className="p-2.5 text-right w-[120px]">Gain That Year</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Cumulative Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money2(row.value)}</td>
                      <td className="p-2.5 text-right text-emerald-600">{money2(row.gain)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.cumulative, 2)}%</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">End of period</td>
                    <td className="p-2.5 text-right text-foreground">{money2(results.finalValue)}</td>
                    <td className="p-2.5 text-right text-emerald-600">{money2(results.finalValue - results.initialValue)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.totalGrowth, 2)}%</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Growth Rate of Investment Calculator?</h2>
            <p>
              A growth rate of investment calculator converts a beginning value, an ending value and a holding period into a
              single annual rate. That rate — the compound annual growth rate, or CAGR — is the number investors use to
              compare investments of different sizes and durations on equal footing. It answers the question &quot;what
              constant annual rate would turn the start value into the end value?&quot;.
            </p>
            <p>
              The tool also handles two adjustments that change the answer materially. Dividends turn the price CAGR into a
              total-return CAGR, which is what an investor who reinvested income actually experienced. Inflation converts the
              nominal result into a real one, showing how much of the growth was purchasing power and how much was simply
              currency debasement.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              CAGR is the ratio of final to initial value raised to the power of one divided by the number of years, minus
              one. A $10,000 investment that becomes $25,000 in eight years has a ratio of 2.5; the eighth root of 2.5 is
              1.1215, so the CAGR is 12.15% a year. Note how different that is from the simple average: the total gain is
              150%, and dividing by eight gives 18.75% a year, which would overshoot the ending value dramatically if it were
              accurate.
            </p>
            <p>
              The table restates the same result as a smooth annual path, growing the initial value at the CAGR and showing
              the gain each year and the cumulative growth. It is not a forecast — it is the constant-rate equivalent of what
              actually happened. The final row reconciles to the ending value you entered, which makes the arithmetic easy to
              audit.
            </p>
            <p>
              Two supporting figures round out the picture. The doubling time is the exact number of years needed for the
              value to double at the calculated rate, which is the logarithm of two divided by the logarithm of one plus the
              rate. The rule of 72 gives the familiar mental estimate — 72 divided by the percentage rate — and the
              calculator shows both so the shortcut can be sanity-checked against the precise figure.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the CAGR with the total growth and the real growth rate underneath. The three statistics
              beside it give the doubling time, the total-return CAGR including dividends, and the multiple of money
              earned. Summary Statistics adds the dollar growth, the average dollars gained per year, the dividend total, the
              rule-of-72 estimate, and the final value expressed in today&apos;s purchasing power.
            </p>
            <p>
              Because CAGR uses only the endpoints, it can flatter a volatile investment: a fund that fell 60% and then
              tripled shows an attractive rate while an investor who lived through the drawdown may have sold at the bottom.
              Use the growth rate as the headline summary, and pair it with drawdown or volatility data when judging whether
              the path was tolerable. For plans with ongoing contributions, the endpoint ratio describes the account but not
              your decisions, so a money-weighted return is the better measure there.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/growth-rate-of-investment-calculator" />
          <PopularCalculators exclude="/calculator/growth-rate-of-investment-calculator" />
        </div>
      </div>
    </>
  );
}
