"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SipInputs {
  lumpsum: number;
  monthlyInvestment: number;
  expectedReturn: number;
  years: number;
  stepUpPct: number;
  inflationRate: number;
}

const DEFAULTS: SipInputs = {
  lumpsum: 5000,
  monthlyInvestment: 500,
  expectedReturn: 12,
  years: 15,
  stepUpPct: 10,
  inflationRate: 3,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface SipMilestone {
  year: number;
  invested: number;
  value: number;
}

interface SipResult {
  months: number;
  futureValue: number;
  noStepFutureValue: number;
  totalInvested: number;
  gains: number;
  gainsPct: number;
  stepUpAdvantage: number;
  realValue: number;
  lastMonthly: number;
  effectiveMultiple: number;
  milestones: SipMilestone[];
  valid: boolean;
  errorMsg: string;
}

function computeSip(i: SipInputs): SipResult {
  const invalid =
    i.lumpsum < 0 || i.monthlyInvestment < 0 || i.expectedReturn < 0 || i.years <= 0 || i.stepUpPct < 0 || i.inflationRate < 0;

  const months = Math.max(0, Math.round(i.years * 12));
  const rm = i.expectedReturn / 100 / 12;
  const ri = i.inflationRate / 100 / 12;

  let fv = i.lumpsum;
  let fvNoStep = i.lumpsum;
  let invested = i.lumpsum;
  let monthlyNow = i.monthlyInvestment;
  let lastMonthly = i.monthlyInvestment;
  const milestones: SipMilestone[] = [];

  for (let m = 0; m < months; m++) {
    fv = fv * (1 + rm) + monthlyNow;
    fvNoStep = fvNoStep * (1 + rm) + i.monthlyInvestment;
    invested += monthlyNow;
    lastMonthly = monthlyNow;
    if ((m + 1) % 12 === 0) monthlyNow = monthlyNow * (1 + i.stepUpPct / 100);

    const completedYears = Math.floor((m + 1) / 12);
    const isMilestone =
      (m + 1) % 12 === 0 && (completedYears % 5 === 0 || m + 1 === months);
    if (isMilestone && completedYears > 0) {
      milestones.push({ year: completedYears, invested, value: fv });
    }
  }
  if (months > 0 && months % 12 !== 0) {
    milestones.push({ year: Math.round((months / 12) * 10) / 10, invested, value: fv });
  }

  const gains = fv - invested;

  return {
    months,
    futureValue: fv,
    noStepFutureValue: fvNoStep,
    totalInvested: invested,
    gains,
    gainsPct: invested > 0 ? (gains / invested) * 100 : 0,
    stepUpAdvantage: Math.max(0, fv - fvNoStep),
    realValue: months > 0 ? fv / Math.pow(1 + ri, months) : fv,
    lastMonthly,
    effectiveMultiple: invested > 0 ? fv / invested : 0,
    milestones,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative contributions and rates, and a horizon above zero."
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

export default function SystematicInvestmentPlanSipCalculator() {
  const [lumpsum, setLumpsum] = useState(String(DEFAULTS.lumpsum));
  const [monthlyInvestment, setMonthlyInvestment] = useState(String(DEFAULTS.monthlyInvestment));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [stepUpPct, setStepUpPct] = useState(String(DEFAULTS.stepUpPct));
  const [inflationRate, setInflationRate] = useState(String(DEFAULTS.inflationRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SipInputs => ({
    lumpsum: parseFloat(lumpsum) || 0,
    monthlyInvestment: parseFloat(monthlyInvestment) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    years: parseFloat(years) || 0,
    stepUpPct: parseFloat(stepUpPct) || 0,
    inflationRate: parseFloat(inflationRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<SipInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SipResult>(() => computeSip(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSip(inputs));
  };

  const reset = () => {
    setLumpsum(String(DEFAULTS.lumpsum));
    setMonthlyInvestment(String(DEFAULTS.monthlyInvestment));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setYears(String(DEFAULTS.years));
    setStepUpPct(String(DEFAULTS.stepUpPct));
    setInflationRate(String(DEFAULTS.inflationRate));
    setCalcInputs(DEFAULTS);
    setResults(computeSip(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a systematic investment plan?",
      answer:
        "A systematic investment plan invests a fixed amount at regular intervals — usually monthly — regardless of what markets are doing. The idea is to remove timing decisions from the process so discipline replaces prediction. Because the same amount buys more units when prices fall and fewer when they rise, the average purchase cost tends to sit below the average price over the period.",
    },
    {
      question: "What does the step-up option add?",
      answer:
        "A step-up increases the contribution by a set percentage every year, typically in line with expected raises. Because later contributions still have years to compound, a ten percent annual increase raises the final value far more than ten percent — and it costs much less than raising the starting contribution by the same amount. The comparison figure in the results shows exactly what the step-up is worth.",
    },
    {
      question: "Should a lumpsum be invested at once or spread out?",
      answer:
        "Historically, investing a lump sum immediately has produced better average outcomes than spreading it out, because markets rise more often than they fall. Spreading reduces regret and sequence risk, which matters for large amounts or anxious investors. This calculator puts the lumpsum to work from month one and then layers monthly contributions on top, so you can see both effects separately.",
    },
    {
      question: "How should I read the inflation-adjusted figure?",
      answer:
        "Nominal projections overstate purchasing power, sometimes dramatically over long horizons. The inflation-adjusted value discounts the final balance back to today's money, giving a more honest sense of lifestyle. At three percent inflation, fifteen years of growth loses roughly a third of its purchasing power, which is why the real value is often the number worth planning around.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Systematic Investment Plan (SIP) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Systematic Investment Plan (SIP) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Contribution Plan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="lumpsum"
                  label="Initial Lumpsum"
                  value={lumpsum}
                  onChange={setLumpsum}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Amount invested at the start of month one."
                />
                <CompactInput
                  id="monthly"
                  label="Monthly Investment"
                  value={monthlyInvestment}
                  onChange={setMonthlyInvestment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The amount invested every month to begin with."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="return"
                  label="Expected Return"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Assumed annual return on invested amounts."
                />
                <CompactInput
                  id="years"
                  label="Investment Horizon"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="How many years contributions continue."
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
                  <SubSection title="Step-Up & Inflation">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="step-up"
                        label="Annual Step-Up"
                        value={stepUpPct}
                        onChange={setStepUpPct}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="How much the monthly amount rises each year."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation Rate"
                        value={inflationRate}
                        onChange={setInflationRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Used to express the result in today's money."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Projected Value</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.futureValue, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`${fmt(results.months, 0)} monthly contributions at ${fmt(calcInputs.expectedReturn, 1)}% a year`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Invested</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalInvested, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Wealth Gained</span>
                <span className="font-extrabold text-emerald-600">${fmt(results.gains, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In Today's Money</span>
                <span className="font-extrabold text-foreground">${fmt(results.realValue, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Milestone</th>
                    <th className="p-2.5 text-right w-[140px]">Invested to Date</th>
                    <th className="p-2.5 pr-3 text-right w-[160px]">Projected Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.milestones.map((ms) => (
                    <tr key={ms.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {fmt(ms.year, ms.year % 1 === 0 ? 0 : 1)}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(ms.invested, 0)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">${fmt(ms.value, 0)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Final position</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalInvested, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">${fmt(results.futureValue, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Monthly Amount</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.monthlyInvestment, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Monthly Amount</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.lastMonthly, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Growth Multiple</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveMultiple, 2)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gains on Contributions</span>
                  <span className="text-base font-bold text-emerald-600">{fmt(results.gainsPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Value Without Step-Up</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.noStepFutureValue, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Step-Up Advantage</span>
                  <span className="text-base font-bold text-emerald-600">${fmt(results.stepUpAdvantage, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Systematic Investment Plan (SIP) Calculator?</h2>
            <p>
              A systematic investment plan calculator projects what regular contributions grow into over time. Rather
              than asking what a single amount becomes, it models a stream: a monthly investment made every month for
              years, an optional starting lumpsum, and a return assumption that compounds across every contribution for
              however long it remains invested. The result is the balance at the end, split into money you contributed
              and money the market added.
            </p>
            <p>
              The format suits ordinary income because it matches how people earn: a fixed amount invested on a schedule,
              automatically, without a decision each month. The calculator also handles a step-up, the practice of raising
              the contribution every year, which is how long-term plans keep up with rising salaries and inflation.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each month the existing balance is multiplied by one-twelfth of the expected annual return, then the
              current contribution is added. Early contributions compound for the entire horizon; the last contribution
              compounds for a single month. That is why time matters more than size in the early years, and why the
              milestone table usually shows value accelerating in the later rows even though the contributions have not
              changed.
            </p>
            <p>
              When a step-up percentage is entered, the monthly amount rises once every twelve months. The calculator
              also runs the same projection without the step-up, so the difference between the two final values isolates
              the effect of increasing contributions over time. A final calculation discounts the balance by the inflation
              rate to express it in today&apos;s purchasing power.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the projected value along with the number of contributions behind it. The three-stat
              bar separates total invested, wealth gained and the inflation-adjusted value, while the milestone table
              tracks invested and projected value at each five-year mark.
            </p>
            <p>
              Compare the step-up figure with the value without any step-up. The gap is often the most striking number on
              the page, because a ten percent annual increase compounds alongside the returns rather than replacing them.
              If the gap looks large, the strategy to consider is designing the starting contribution so the step-up stays
              affordable in later years, when the monthly amount has grown substantially.
            </p>
            <p>
              Treat the return assumption carefully. A projection is only as honest as its rate, and the same plan at
              eight percent instead of twelve produces a materially smaller balance. Run the numbers at a conservative
              rate for planning, then enjoy the upside if markets deliver more. Consistency, not precision, is what makes
              a systematic plan work.
            </p>
            <p>
              One practical detail is where the contributions come from. Automating the transfer for the day after payday
              keeps the plan running without willpower, and it removes the monthly decision that most often turns into a
              skipped contribution. If cash is tight in a given month, lowering the amount temporarily is far better than
              pausing the plan entirely, because restarting a paused plan is harder than continuing a smaller one. The
              projection assumes uninterrupted contributions, so treat continuity as the input that matters most.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/systematic-investment-plan-sip-calculator" />
          <PopularCalculators exclude="/calculator/systematic-investment-plan-sip-calculator" />
        </div>
      </div>
    </>
  );
}
