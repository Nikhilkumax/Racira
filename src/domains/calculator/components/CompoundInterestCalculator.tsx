"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface CompoundInputs {
  principal: string;
  rate: string;
  years: string;
  frequency: string;
  monthly: string;
  growth: string;
}

const DEFAULTS: CompoundInputs = {
  principal: "10000",
  rate: "7",
  years: "20",
  frequency: "12",
  monthly: "200",
  growth: "0",
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => `$${fmt(v, 2)}`;

const FREQ_OPTIONS = [
  { value: "1", label: "Annually" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "365", label: "Daily" },
];

interface ScheduleRow {
  year: number;
  contributions: number;
  interest: number;
  balance: number;
}

interface FreqRow {
  label: string;
  finalBalance: number;
  apy: number;
  highlight: boolean;
}

interface CompoundResult {
  valid: boolean;
  errorMsg: string;
  principal: number;
  monthly: number;
  rate: number;
  years: number;
  periods: number;
  finalBalance: number;
  totalContrib: number;
  totalInterest: number;
  apy: number;
  doublingYears: number;
  interestShare: number;
  growth: number;
  schedule: ScheduleRow[];
  freqRows: FreqRow[];
}

function monthlyRateFor(annualPct: number, n: number): number {
  const rN = annualPct / 100 / n;
  return Math.pow(1 + rN, n / 12) - 1;
}

function apyFor(annualPct: number, n: number): number {
  return Math.pow(1 + annualPct / 100 / n, n) - 1;
}

function project(P: number, annualPct: number, months: number, n: number, C: number, growthPct: number) {
  const i = monthlyRateFor(annualPct, n);
  const g = growthPct / 100;
  let balance = P;
  let contribution = C;
  let totalContrib = 0;
  let totalInterest = 0;
  const rows: ScheduleRow[] = [];
  let yearContrib = 0;
  let yearInterest = 0;
  let year = 1;

  for (let m = 1; m <= months; m++) {
    const interest = balance * i;
    balance += interest;
    balance += contribution;
    yearInterest += interest;
    yearContrib += contribution;
    totalContrib += contribution;
    totalInterest += interest;
    if (m % 12 === 0 || m === months) {
      rows.push({ year, contributions: yearContrib, interest: yearInterest, balance });
      yearContrib = 0;
      yearInterest = 0;
      year++;
    }
    if (m % 12 === 0) contribution *= 1 + g;
  }

  return { balance, totalContrib, totalInterest, rows };
}

function compute(inp: CompoundInputs): CompoundResult {
  const P = num(inp.principal);
  const rate = num(inp.rate);
  const years = num(inp.years);
  const n = num(inp.frequency) || 12;
  const C = num(inp.monthly);
  const growth = num(inp.growth);

  const blank: CompoundResult = {
    valid: false,
    errorMsg: "",
    principal: P,
    monthly: C,
    rate,
    years,
    periods: 0,
    finalBalance: 0,
    totalContrib: 0,
    totalInterest: 0,
    apy: 0,
    doublingYears: 0,
    interestShare: 0,
    growth,
    schedule: [],
    freqRows: [],
  };

  if ((P <= 0 && C <= 0) || years <= 0 || rate < 0) {
    return { ...blank, errorMsg: "Enter an opening balance or a monthly contribution, a non-negative rate and a term above zero." };
  }

  const months = Math.round(years * 12);
  const { balance, totalContrib, totalInterest, rows } = project(P, rate, months, n, C, growth);
  const apy = apyFor(rate, n);
  const i = monthlyRateFor(rate, n);

  const freqRows: FreqRow[] = FREQ_OPTIONS.map((o) => {
    const f = parseInt(o.value);
    const r = project(P, rate, months, f, C, growth);
    return {
      label: o.label,
      finalBalance: r.balance,
      apy: apyFor(rate, f) * 100,
      highlight: f === n,
    };
  });

  return {
    valid: true,
    errorMsg: "",
    principal: P,
    monthly: C,
    rate,
    years,
    periods: months,
    finalBalance: balance,
    totalContrib: totalContrib + P,
    totalInterest,
    apy: apy * 100,
    doublingYears: i > 0 ? Math.log(2) / Math.log(1 + i) / 12 : 0,
    interestShare: balance > 0 ? (totalInterest / balance) * 100 : 0,
    growth,
    schedule: rows,
    freqRows,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, prefix, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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

interface CompactSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  hint?: string;
}

const CompactSelect = ({ id, label, value, options, onChange, hint }: CompactSelectProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 pr-8 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="h-3.5 w-3.5 absolute right-3 text-muted-foreground pointer-events-none" />
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{title}</div>
    {children}
  </div>
);

export default function CompoundInterestCalculator() {
  const [inputs, setInputs] = useState<CompoundInputs>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [calcInputs, setCalcInputs] = useState<CompoundInputs>(DEFAULTS);
  const [results, setResults] = useState<CompoundResult>(() => compute(DEFAULTS));

  const set = (key: keyof CompoundInputs) => (v: string) => setInputs((prev) => ({ ...prev, [key]: v }));

  const runCalculate = () => {
    setCalcInputs(inputs);
    setResults(compute(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setCalcInputs(DEFAULTS);
    setResults(compute(DEFAULTS));
  };

  const breakdownRows: { label: string; value: string }[] = [
    { label: "Opening balance", value: money(results.principal) },
    { label: "Monthly contribution", value: money(results.monthly) },
    { label: "Annual contribution increase", value: `${fmt(results.growth, 1)}%` },
    { label: "Nominal annual rate", value: `${fmt(results.rate, 2)}%` },
    { label: "Compounds per year", value: fmt(num(calcInputs.frequency) || 12) },
    { label: "Compounding periods", value: fmt(results.periods) },
    { label: "Total contributed", value: money(results.totalContrib) },
    { label: "Total interest earned", value: money(results.totalInterest) },
    { label: "Final balance", value: money(results.finalBalance) },
  ];

  const faqs = [
    {
      question: "What is the compound interest formula?",
      answer:
        "For a single deposit the balance is A = P(1 + r/n)^(nt), where P is the opening balance, r is the annual rate as a decimal, n is the number of compounding periods a year and t is the term in years. Regular contributions are handled as an annuity, adding C x [((1 + r/n)^(nt) - 1) / (r/n)] when the contribution C is made each period.",
    },
    {
      question: "How much difference does compounding frequency make?",
      answer:
        "More frequent compounding lifts the effective yield, but the gap shrinks as frequency rises. Ten thousand dollars at 7 percent for twenty years earns about $28,700 with annual compounding and about $30,400 with daily compounding, so the step from annual to monthly matters far more than the step from monthly to daily.",
    },
    {
      question: "What is the difference between the nominal rate and the APY?",
      answer:
        "The nominal rate is the headline number before compounding, while the APY (annual percentage yield) is what you actually earn over a year once interest is reinvested. A 7 percent nominal rate compounded monthly gives an APY of about 7.23 percent, and daily compounding pushes it a little higher still.",
    },
    {
      question: "What is the Rule of 72?",
      answer:
        "Divide 72 by the annual rate to estimate how many years a balance takes to double. At 7 percent the answer is roughly 10.3 years, and at 9 percent roughly 8 years. The calculator reports an exact doubling time for the chosen frequency in the Summary Statistics panel.",
    },
    {
      question: "Do regular contributions matter more than the opening balance?",
      answer:
        "Over long horizons they usually do. A modest monthly contribution invested for decades can overtake a much larger lump sum, because every contribution starts its own compounding clock. The schedule shows the year in which cumulative interest overtakes cumulative contributions, which is the point where the money starts working harder than you do.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Compound Interest Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Compound Interest Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment Details">
              <div className="flex flex-col gap-3">
                <CompactInput
                  id="ci-principal"
                  label="Opening Balance"
                  value={inputs.principal}
                  onChange={set("principal")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                  tooltip="The amount invested at the start."
                />
                <CompactInput
                  id="ci-rate"
                  label="Annual Interest Rate"
                  value={inputs.rate}
                  onChange={set("rate")}
                  onEnter={runCalculate}
                  min="0"
                  suffix="%"
                  tooltip="Nominal annual rate before compounding is applied."
                />
                <CompactInput
                  id="ci-years"
                  label="Time Period"
                  value={inputs.years}
                  onChange={set("years")}
                  onEnter={runCalculate}
                  min="0"
                  suffix="years"
                />
                <CompactSelect
                  id="ci-frequency"
                  label="Compound Frequency"
                  value={inputs.frequency}
                  onChange={set("frequency")}
                  options={FREQ_OPTIONS}
                />
                <CompactInput
                  id="ci-monthly"
                  label="Monthly Contribution"
                  value={inputs.monthly}
                  onChange={set("monthly")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                  hint="Added at the end of every month"
                />
              </div>
            </SubSection>

            <SubSection title="Contribution Growth">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="bg-secondary/20 border border-border mt-3 rounded-lg p-4 animate-fade-in-up !overflow-visible">
                  <div className="flex flex-col gap-3">
                    <CompactInput
                      id="ci-growth"
                      label="Annual Contribution Increase"
                      value={inputs.growth}
                      onChange={set("growth")}
                      onEnter={runCalculate}
                      min="0"
                      suffix="%"
                      hint="Raises the monthly contribution once a year"
                    />
                  </div>
                </div>
              )}
            </SubSection>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                aria-label="Reset"
                onClick={reset}
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid ? (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 text-sm text-destructive font-semibold">
                {results.errorMsg || "Enter valid investment details to see results."}
              </div>
            ) : (
              <>
                {/* PRIMARY RESULT CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Final Balance</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{money(results.finalBalance)}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {`${money(results.totalContrib)} contributed over ${fmt(results.years, 1)} years at ${fmt(results.rate, 2)}% compounding ${calcInputs.frequency === "1" ? "annually" : calcInputs.frequency === "4" ? "quarterly" : calcInputs.frequency === "365" ? "daily" : "monthly"}`}
                  </div>
                </div>

                {/* 3-STAT BAR */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Contributed</span>
                    <span className="font-extrabold text-foreground">{money(results.totalContrib)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Earned</span>
                    <span className="font-extrabold text-foreground">{money(results.totalInterest)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective APY</span>
                    <span className="font-extrabold text-foreground">{`${fmt(results.apy, 3)}%`}</span>
                  </div>
                </div>

                {/* BREAKDOWN */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Projection Inputs</th>
                        <th className="p-2.5 pr-3 text-right w-[150px]">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {breakdownRows.map((row) => (
                        <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* FREQUENCY COMPARISON */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Compounding Frequency</th>
                        <th className="p-2.5 text-right">Effective APY</th>
                        <th className="p-2.5 pr-3 text-right w-[150px]">Final Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.freqRows.map((row) => (
                        <tr
                          key={row.label}
                          className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-primary/5 font-semibold" : ""}`}
                        >
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 text-right text-foreground">{`${fmt(row.apy, 3)}%`}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{money(row.finalBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* YEAR BY YEAR */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Year</th>
                        <th className="p-2.5 text-right">Contributions</th>
                        <th className="p-2.5 text-right text-rose-600">Interest</th>
                        <th className="p-2.5 pr-3 text-right w-[130px]">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.schedule.map((row) => (
                        <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.year}</td>
                          <td className="p-2.5 text-right text-foreground">{money(row.contributions)}</td>
                          <td className="p-2.5 text-right text-rose-600">{money(row.interest)}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{money(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SUMMARY STATISTICS */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Nominal Rate</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.rate, 2)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective APY</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.apy, 3)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Growth Multiple</span>
                      <span className="text-base font-bold text-foreground">
                        {results.totalContrib > 0 ? `${fmt(results.finalBalance / results.totalContrib, 2)}x` : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest as Share of Balance</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.interestShare, 1)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Doubling Time</span>
                      <span className="text-base font-bold text-foreground">
                        {results.doublingYears > 0 ? `${fmt(results.doublingYears, 1)} years` : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                      <span className="text-base font-bold text-foreground">{money(results.totalInterest)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Compounding Periods</span>
                      <span className="text-base font-bold text-foreground">{fmt(results.periods)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Balance</span>
                      <span className="text-base font-bold text-foreground">{money(results.finalBalance)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Compound Interest Calculator?</h2>
            <p>
              A compound interest calculator projects what a balance becomes when the interest it earns is left in place
              to earn interest of its own. Give it an opening balance, an annual rate, a term and a compounding
              frequency, and it returns the final balance along with the split between money you contributed and money
              the investment produced. Add a monthly contribution and the projection becomes a savings plan rather than a
              single deposit.
            </p>
            <p>
              Compounding is the reason long horizons matter more than big headlines. A rate that looks modest produces a
              balance far larger than the arithmetic of simple interest would suggest, and the effect accelerates as the
              base grows. This calculator makes that visible year by year, so the contribution phase and the passive
              phase can be seen separately instead of being blended into one final number.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The nominal annual rate is divided by the number of compounding periods per year, and that periodic rate is
              applied to the balance each period. For a deposit left alone, the balance follows the familiar formula
              P(1 + r/n) raised to the number of periods. Regular contributions are treated as an annuity, added at the
              end of each period and compounded from then on, which is why a contribution made in year one is worth far
              more at the end than the same contribution made in year nineteen.
            </p>
            <p>
              Because contributions here are monthly while compounding may happen annually, quarterly, monthly or daily,
              the calculator converts the chosen frequency into an equivalent monthly rate using the effective annual
              yield. That keeps the projection internally consistent whichever frequency you select, and it allows the
              frequency comparison table to price all four options on the same contribution schedule.
            </p>
            <p>
              The year-by-year schedule is built by replaying the projection month by month and totalling contributions
              and interest into yearly buckets. If you switch on the annual contribution increase, the monthly amount
              steps up once every twelve months, which models a saver who raises contributions alongside pay rises and
              keeps the plan realistic over a multi-decade horizon.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the final balance and the three-stat bar reports total contributions, interest
              earned and the effective APY. The first table lists the inputs used, the second compares all four
              compounding frequencies on the same plan, and the third is the year-by-year schedule showing how much of
              each year change came from new money and how much from growth.
            </p>
            <p>
              Watch the point in the schedule where annual interest overtakes annual contributions. Before that point you
              are mostly funding the balance; after it, the balance is funding itself. Shortening the time to that
              crossover is the real goal of any long-term plan, and raising the contribution or the rate are the only two
              levers that move it.
            </p>
            <p>
              Read the frequency comparison with a little scepticism. Daily compounding beats monthly compounding, but
              the difference is small, and no legitimate product offers a large gap between them. The larger levers are
              time, the rate and the contribution, in roughly that order. Finally, remember that the projection ignores
              taxes, fees and inflation, so treat the final balance as an upper bound and the real value as something
              lower once those costs are counted.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/compound-interest-calculator" />
          <PopularCalculators exclude="/calculator/compound-interest-calculator" />
        </div>
      </div>
    </>
  );
}
