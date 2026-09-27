"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Timing = "end" | "start";

interface DollarInputs {
  initial: number;
  contribution: number;
  ending: number;
  years: number;
  withdrawal: number;
  timing: Timing;
}

const DEFAULTS: DollarInputs = {
  initial: 20000,
  contribution: 5000,
  ending: 60000,
  years: 7,
  withdrawal: 0,
  timing: "end",
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface YearRow {
  year: number;
  beginning: number;
  cashFlow: number;
  growth: number;
  ending: number;
}

interface DollarResult {
  valid: boolean;
  errorMsg: string;
  netAnnual: number;
  endingValue: number;
  totalInvested: number;
  totalWithdrawn: number;
  dollarReturn: number;
  simpleRoi: number;
  moneyWeighted: number;
  multiple: number;
  averageAnnualDollar: number;
  growthShare: number;
  contributionShare: number;
  rows: YearRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: DollarInputs): DollarResult {
  const years = Math.max(1, Math.round(i.years));
  const initial = Math.max(0, i.initial);
  const contribution = Math.max(0, i.contribution);
  const withdrawal = Math.max(0, i.withdrawal);
  const netAnnual = contribution - withdrawal;
  const ending = Math.max(0, i.ending);
  const startTiming = i.timing === "start";

  // NPV of the cash flows at a candidate rate. Contributions are negative flows,
  // the ending value is a positive flow at the horizon.
  const npv = (rate: number) => {
    let total = -initial;
    for (let t = 1; t <= years; t++) {
      const flowTime = startTiming ? t - 1 : t;
      total += (-netAnnual) / Math.pow(1 + rate, flowTime);
    }
    total += ending / Math.pow(1 + rate, years);
    return total;
  };

  let lo = -0.999;
  let hi = 5;
  let moneyWeighted = 0;
  let solvable = true;
  if (npv(lo) < 0) {
    solvable = false;
    moneyWeighted = lo;
  } else if (npv(hi) > 0) {
    solvable = false;
    moneyWeighted = hi;
  } else {
    for (let iter = 0; iter < 200; iter++) {
      const mid = (lo + hi) / 2;
      if (npv(mid) > 0) lo = mid;
      else hi = mid;
    }
    moneyWeighted = (lo + hi) / 2;
  }

  const totalInvested = initial + contribution * years;
  const totalWithdrawn = withdrawal * years;
  const dollarReturn = ending + totalWithdrawn - totalInvested;
  const simpleRoi = totalInvested > 0 ? (dollarReturn / totalInvested) * 100 : 0;
  const multiple = totalInvested > 0 ? (ending + totalWithdrawn) / totalInvested : 0;

  const rows: YearRow[] = [];
  let value = initial;
  for (let year = 1; year <= years; year++) {
    const beginning = value;
    let growth: number;
    if (startTiming) {
      value += netAnnual;
      growth = value * moneyWeighted;
      value += growth;
    } else {
      growth = value * moneyWeighted;
      value += growth;
      value += netAnnual;
    }
    rows.push({ year, beginning, cashFlow: netAnnual, growth, ending: value });
  }

  const growthTotal = rows.reduce((acc, r) => acc + r.growth, 0);

  const valid =
    i.initial >= 0 &&
    i.contribution >= 0 &&
    i.ending >= 0 &&
    i.years > 0 &&
    i.withdrawal >= 0 &&
    (i.initial > 0 || i.contribution > 0);
  const errorMsg = valid
    ? ""
    : "Enter a positive initial amount or annual contribution, a non-negative ending value, withdrawal and holding period.";

  return {
    valid,
    errorMsg,
    netAnnual,
    endingValue: ending,
    totalInvested,
    totalWithdrawn,
    dollarReturn,
    simpleRoi,
    moneyWeighted: moneyWeighted * 100,
    multiple,
    averageAnnualDollar: dollarReturn / years,
    growthShare: dollarReturn !== 0 ? (growthTotal / dollarReturn) * 100 : 0,
    contributionShare: (totalInvested / Math.max(ending + totalWithdrawn, 1)) * 100,
    rows,
    summary: [
      { label: "Initial Investment", value: money2(initial) },
      { label: "Annual Contribution", value: money2(contribution) },
      { label: "Annual Withdrawal", value: money2(withdrawal) },
      { label: "Total Invested", value: money(totalInvested) },
      { label: "Total Withdrawn", value: money(totalWithdrawn) },
      { label: "Ending Value", value: money(ending), tone: "text-primary" },
      { label: "Dollar Return", value: money(dollarReturn), tone: dollarReturn >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Simple ROI", value: fmt(simpleRoi, 2) + "%" },
      { label: "Money-Weighted Return", value: fmt(moneyWeighted * 100, 2) + "% a year", tone: "text-primary" },
      { label: "Multiple of Money", value: fmt(multiple, 2) + "x" },
      { label: "Average Annual Dollars", value: money(dollarReturn / years) },
      { label: "Growth Generated", value: money(growthTotal) },
      { label: "Growth as % of Return", value: fmt(dollarReturn !== 0 ? (growthTotal / dollarReturn) * 100 : 0, 2) + "%" },
      { label: "Contributions in Final Value", value: fmt((totalInvested / Math.max(ending + totalWithdrawn, 1)) * 100, 2) + "%" },
      { label: "Contribution Timing", value: i.timing === "start" ? "Start of year" : "End of year" },
      { label: solvable ? "IRR Found" : "IRR Unreachable", value: solvable ? "Yes" : "No", tone: solvable ? "text-emerald-600" : "text-destructive" },
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

export default function DollarReturnOnInvestmentCalculator() {
  const [initial, setInitial] = useState(String(DEFAULTS.initial));
  const [contribution, setContribution] = useState(String(DEFAULTS.contribution));
  const [ending, setEnding] = useState(String(DEFAULTS.ending));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [withdrawal, setWithdrawal] = useState(String(DEFAULTS.withdrawal));
  const [timing, setTiming] = useState<Timing>(DEFAULTS.timing);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DollarInputs => ({
    initial: parseFloat(initial) || 0,
    contribution: parseFloat(contribution) || 0,
    ending: parseFloat(ending) || 0,
    years: parseFloat(years) || 0,
    withdrawal: parseFloat(withdrawal) || 0,
    timing,
  });

  const [results, setResults] = useState<DollarResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setInitial(String(DEFAULTS.initial));
    setContribution(String(DEFAULTS.contribution));
    setEnding(String(DEFAULTS.ending));
    setYears(String(DEFAULTS.years));
    setWithdrawal(String(DEFAULTS.withdrawal));
    setTiming(DEFAULTS.timing);
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a dollar return?",
      answer:
        "The dollar return is the simplest measure of investment profit: everything you got back minus everything you put in. If you invested $20,000, added $5,000 a year for seven years and finished with $60,000, your dollar return is the ending value plus any withdrawals minus $55,000 of total contributions. It answers 'how much richer am I' rather than 'how fast did I grow'.",
    },
    {
      question: "What is a money-weighted return?",
      answer:
        "The money-weighted return, also called the internal rate of return, is the single annual rate that would reproduce the same ending value given the same sequence of contributions and withdrawals. It accounts for the timing and size of every cash flow, so contributions made when the portfolio was cheap count for more than ones made near a peak. This calculator solves for it by search because the equation has no algebraic inverse.",
    },
    {
      question: "How is the money-weighted return different from a time-weighted return?",
      answer:
        "A time-weighted return ignores cash flow timing and measures the performance of the underlying investments; it is the standard for judging a fund manager. A money-weighted return reflects your actual experience, including when you added money. If you contributed heavily just before a drawdown, your money-weighted return will be worse than the fund's reported time-weighted return — the difference is entirely about timing, not about the fund.",
    },
    {
      question: "Why does the calculator show growth by year using the IRR?",
      answer:
        "The year-by-year table applies the solved rate to the balance each year, so the growth column, the cash-flow column and the final row reconcile exactly with the ending value you entered. It is a way to see how much of your result came from compounding rather than from your own deposits: in the default example, contributions account for most of the money invested but growth accounts for a large share of the final value.",
    },
    {
      question: "Does the timing of contributions matter?",
      answer:
        "It changes the IRR but not the dollar return. Paying in at the start of each year means every contribution compounds for the full year, which raises the terminal value for a given rate — so the rate needed to reach the same ending value is lower. The tool models both conventions; choose the one that matches how you actually invest. Monthly contributions fall between the two and are closely approximated by the end-of-year assumption.",
    },
    {
      question: "What does the multiple of money tell me?",
      answer:
        "The multiple, sometimes called MOIC, divides total value returned by total capital invested. It is the clearest summary for a private investment or a project: 1.8x means you received $1.80 for every $1.00 you put in. The multiple says nothing about time, though, so it should always be paired with the money-weighted return — a 2x multiple over twenty years is a very different outcome from 2x over three.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Dollar Return on Investment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Dollar Return on Investment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Cash Flows">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="initial"
                  label="Initial Investment"
                  value={initial}
                  onChange={setInitial}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="The amount invested at the start."
                />
                <CompactInput
                  id="contribution"
                  label="Annual Contribution"
                  value={contribution}
                  onChange={setContribution}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="500"
                  tooltip="Regular amount added each year."
                />
                <CompactInput
                  id="ending"
                  label="Ending Value"
                  value={ending}
                  onChange={setEnding}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="What the investment is worth at the end of the period."
                />
                <CompactInput
                  id="years"
                  label="Years"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  max="50"
                  step="1"
                  tooltip="Length of the investment period."
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
                  <SubSection title="Withdrawals & Timing">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="withdrawal"
                        label="Annual Withdrawal"
                        value={withdrawal}
                        onChange={setWithdrawal}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="500"
                        tooltip="Regular amount taken out each year, netted against contributions in the IRR."
                      />
                      <div className="flex flex-col">
                        <label htmlFor="timing" className="flex items-center text-sm font-semibold text-foreground mb-1">
                          Contribution Timing
                        </label>
                        <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <select
                            id="timing"
                            value={timing}
                            onChange={(e) => setTiming(e.target.value as Timing)}
                            className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                          >
                            <option value="end">End of each year</option>
                            <option value="start">Start of each year</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </SubSection>
                  <SubSection title="How the Return Is Solved">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The money-weighted return is the rate that makes the present value of all contributions equal the
                      present value of the ending value and withdrawals. Contributions are entered at the timing you choose;
                      the ending value is always at the horizon. The table then grows the balance at that solved rate year by
                      year, so the rows reconcile to the ending value exactly.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Dollar Return</div>
              <div className={`text-4xl font-extrabold mb-1 tracking-tight ${results.dollarReturn >= 0 ? "text-foreground" : "text-destructive"}`}>
                {money(results.dollarReturn)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.simpleRoi, 2)}% simple ROI · {fmt(results.moneyWeighted, 2)}% a year money-weighted · {fmt(results.multiple, 2)}x
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Invested</span>
                <span className="font-extrabold text-foreground">{money(results.totalInvested)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ending Value</span>
                <span className="font-extrabold text-emerald-600">{money(results.endingValue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Growth Share</span>
                <span className="font-extrabold text-foreground">{fmt(results.growthShare, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[115px]">Beginning</th>
                    <th className="p-2.5 text-right w-[115px]">Cash Flow</th>
                    <th className="p-2.5 text-right w-[105px]">Growth</th>
                    <th className="p-2.5 pr-3 text-right w-[115px]">Ending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.slice(0, 30).map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.beginning)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.cashFlow)}</td>
                      <td className="p-2.5 text-right text-emerald-600">{money(row.growth)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.ending)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.netAnnual * results.rows.length)}</td>
                    <td className="p-2.5 text-right text-emerald-600">
                      {money(results.rows.reduce((acc, r) => acc + r.growth, 0))}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {money(results.rows[results.rows.length - 1]?.ending || 0)}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Dollar Return on Investment Calculator?</h2>
            <p>
              A dollar return on investment calculator answers two questions that are easy to confuse: how much money did the
              investment make, and how fast did it grow? The first is the dollar return — everything received minus
              everything paid in. The second is the money-weighted return, the annual rate that would reproduce the same
              outcome given the same sequence of contributions and withdrawals. Reporting both prevents the classic mistake
              of comparing a lump-sum investment with a regular savings plan on simple percentages alone.
            </p>
            <p>
              The tool is built for real cash-flow patterns rather than a single deposit. You can enter an initial amount,
              annual contributions, annual withdrawals and an ending value, then see the dollar profit, the simple
              percentage return on total capital and the internal rate of return that ties the whole series together.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The dollar return is the ending value plus withdrawals minus the initial amount and all contributions. The
              simple ROI divides that figure by total invested capital, which is intuitive but ignores timing: money added
              last year has not had time to grow, yet it is counted in the denominator the same as money invested a decade
              ago. That is why the simple percentage understates the performance of plans that build up contributions over
              time.
            </p>
            <p>
              The money-weighted return fixes that by treating every cash flow at its own date. It finds the rate at which the
              present value of the contributions equals the present value of the ending value and withdrawals. Because the
              equation is not solvable in closed form, the calculator searches for the rate by bisection, halving a wide
              interval two hundred times. The result is the personal return on the money actually invested, which is the
              number that matters for judging your own decisions.
            </p>
            <p>
              The projection table then grows the balance at that solved rate year by year, applying contributions at the
              timing you choose and adding the growth. Each row reconciles to the next, and the final row equals the ending
              value you entered — a useful check that the rate is consistent with the cash-flow story.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the dollar return with the simple ROI, the money-weighted annual rate and the multiple
              of money underneath. The three statistics beside it give total capital invested, the ending value and the share
              of the profit that came from growth rather than from contributions. In a long plan the growth share rises
              steadily — that is compounding doing the work.
            </p>
            <p>
              Summary Statistics adds the annual contribution and withdrawal amounts, the average dollars of profit per year,
              the growth generated by the investment, and how much of the final value consists of your own deposits. A
              revealing experiment: hold the ending value fixed and raise the annual contribution. The dollar return rises
              because you put in more, but the money-weighted return falls — a reminder that percentage returns and dollar
              profits answer different questions.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dollar-return-on-investment-calculator" />
          <PopularCalculators exclude="/calculator/dollar-return-on-investment-calculator" />
        </div>
      </div>
    </>
  );
}
