"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";

interface InvInputs {
  initial: string;
  monthly: string;
  annualReturn: string;
  years: string;
  inflationRate: string;
  annualIncrease: string;
}

const DEFAULTS: InvInputs = {
  initial: "10000",
  monthly: "500",
  annualReturn: "7",
  years: "20",
  inflationRate: "3",
  annualIncrease: "2",
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => `$${fmt(v, 2)}`;

interface ScheduleRow {
  year: number;
  contributions: number;
  growth: number;
  balance: number;
  realBalance: number;
}

interface ScenarioRow {
  label: string;
  rate: number;
  futureValue: number;
  realValue: number;
  highlight: boolean;
}

interface InvResult {
  valid: boolean;
  errorMsg: string;
  initial: number;
  monthly: number;
  annualReturn: number;
  years: number;
  inflationRate: number;
  annualIncrease: number;
  futureValue: number;
  totalContrib: number;
  totalGrowth: number;
  realValue: number;
  realReturn: number;
  effectiveReturn: number;
  inflationDrag: number;
  growthMultiple: number;
  schedule: ScheduleRow[];
  scenarios: ScenarioRow[];
}

function projection(initial: number, annualReturn: number, years: number, monthlyStart: number, annualIncrease: number) {
  const monthlyRate = annualReturn / 100 / 12;
  const months = Math.round(years * 12);
  let balance = initial;
  let contribution = monthlyStart;
  let totalContrib = initial;
  const schedule: ScheduleRow[] = [];
  let yearContrib = 0;
  let yearStart = initial;
  let year = 1;
  const monthsPerYear = 12;

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + contribution;
    totalContrib += contribution;
    yearContrib += contribution;
    if (m % 12 === 0 || m === months) {
      schedule.push({
        year,
        contributions: yearContrib,
        growth: balance - yearStart - yearContrib,
        balance,
        realBalance: 0,
      });
      yearStart = balance;
      yearContrib = 0;
      year++;
    }
    if (m % monthsPerYear === 0) contribution *= 1 + annualIncrease / 100;
  }

  return { futureValue: balance, totalContrib, schedule };
}

function compute(inp: InvInputs): InvResult {
  const initial = num(inp.initial);
  const monthly = num(inp.monthly);
  const annualReturn = num(inp.annualReturn);
  const years = num(inp.years);
  const inflationRate = num(inp.inflationRate);
  const annualIncrease = num(inp.annualIncrease);

  const blank: InvResult = {
    valid: false,
    errorMsg: "",
    initial,
    monthly,
    annualReturn,
    years,
    inflationRate,
    annualIncrease,
    futureValue: 0,
    totalContrib: 0,
    totalGrowth: 0,
    realValue: 0,
    realReturn: 0,
    effectiveReturn: 0,
    inflationDrag: 0,
    growthMultiple: 0,
    schedule: [],
    scenarios: [],
  };

  if ((initial <= 0 && monthly <= 0) || years <= 0) {
    return { ...blank, errorMsg: "Enter an opening investment or a monthly contribution, and a period above zero." };
  }

  const { futureValue, totalContrib, schedule } = projection(initial, annualReturn, years, monthly, annualIncrease);
  const totalGrowth = futureValue - totalContrib;
  const deflator = Math.pow(1 + inflationRate / 100, years);
  const realValue = deflator > 0 ? futureValue / deflator : futureValue;
  const realReturn =
    inflationRate > -100 ? ((1 + annualReturn / 100) / (1 + inflationRate / 100) - 1) * 100 : annualReturn;

  const growth = 1 + inflationRate / 100;
  schedule.forEach((row) => {
    row.realBalance = growth > 0 ? row.balance / Math.pow(growth, row.year) : row.balance;
  });

  const scenarios: ScenarioRow[] = [annualReturn - 2, annualReturn, annualReturn + 2]
    .filter((r) => r > -100)
    .map((rate) => {
      const r = projection(initial, rate, years, monthly, annualIncrease);
      return {
        label: `${fmt(rate, 1)}%`,
        rate,
        futureValue: r.futureValue,
        realValue: deflator > 0 ? r.futureValue / deflator : r.futureValue,
        highlight: Math.abs(rate - annualReturn) < 0.0001,
      };
    });

  return {
    valid: true,
    errorMsg: "",
    initial,
    monthly,
    annualReturn,
    years,
    inflationRate,
    annualIncrease,
    futureValue,
    totalContrib,
    totalGrowth,
    realValue,
    realReturn,
    effectiveReturn: totalContrib > 0 ? (futureValue / totalContrib - 1) * 100 : 0,
    inflationDrag: futureValue - realValue,
    growthMultiple: totalContrib > 0 ? futureValue / totalContrib : 0,
    schedule,
    scenarios,
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

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{title}</div>
    {children}
  </div>
);

export default function InvestmentCalculator() {
  const [inputs, setInputs] = useState<InvInputs>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [calcInputs, setCalcInputs] = useState<InvInputs>(DEFAULTS);
  const [results, setResults] = useState<InvResult>(() => compute(DEFAULTS));

  const set = (key: keyof InvInputs) => (v: string) => setInputs((prev) => ({ ...prev, [key]: v }));

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
    { label: "Initial investment", value: money(results.initial) },
    { label: "Monthly contribution", value: money(results.monthly) },
    { label: "Annual return", value: `${fmt(results.annualReturn, 2)}%` },
    { label: "Inflation assumption", value: `${fmt(results.inflationRate, 2)}%` },
    { label: "Contribution increase", value: `${fmt(results.annualIncrease, 2)}% a year` },
    { label: "Investment period", value: `${fmt(results.years, 1)} years` },
    { label: "Total invested", value: money(results.totalContrib) },
    { label: "Investment growth", value: money(results.totalGrowth) },
    { label: "Projected balance", value: money(results.futureValue) },
    { label: "Value in today's money", value: money(results.realValue) },
  ];

  const faqs = [
    {
      question: "How does an investment calculator project growth?",
      answer:
        "It compounds the opening balance at the monthly equivalent of the annual return, adds each contribution at the end of the month and repeats that for every month of the term. Contributions can be raised once a year to model a saver whose income grows, and the final balance is then divided by cumulative inflation to show what it would be worth in today's purchasing power.",
    },
    {
      question: "What is the difference between nominal and real value?",
      answer:
        "The nominal balance is the number that appears on the statement. The real value discounts that number by inflation over the whole term, so it answers a different question: what standard of living would that money buy today? Over twenty years at 3 percent inflation, prices roughly double, so a nominal balance worth 1.8 times its real value is normal.",
    },
    {
      question: "What annual return should I assume?",
      answer:
        "A diversified global equity portfolio has historically returned around 7 percent a year before inflation, though the sequence of returns is never smooth. Bonds have returned less with lower volatility, and cash barely keeps pace with inflation. The scenario table prices the plan two points either side of your assumption so a poor decade does not come as a surprise.",
    },
    {
      question: "Should I increase my contribution every year?",
      answer:
        "If your income rises with inflation, an annual increase in your contribution keeps your savings rate constant rather than letting it drift down in real terms. The default of 2 percent a year models that, and the schedule shows how much of the final balance comes from those raises rather than from market growth.",
    },
    {
      question: "Why does the final balance fall short of my mental arithmetic?",
      answer:
        "Because inflation quietly eats the difference and because returns arrive unevenly. The projection also ignores taxes, fund fees and the drag of holding cash between investments, all of which reduce the realised outcome. Treat the headline as an optimistic case and the inflation-adjusted figure as the more honest planning number.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Investment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Investment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment Plan">
              <div className="flex flex-col gap-3">
                <CompactInput
                  id="inv-initial"
                  label="Initial Investment"
                  value={inputs.initial}
                  onChange={set("initial")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                  tooltip="Money already invested at the start."
                />
                <CompactInput
                  id="inv-monthly"
                  label="Monthly Contribution"
                  value={inputs.monthly}
                  onChange={set("monthly")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                />
                <CompactInput
                  id="inv-return"
                  label="Annual Return"
                  value={inputs.annualReturn}
                  onChange={set("annualReturn")}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Expected average yearly return before inflation."
                />
                <CompactInput
                  id="inv-years"
                  label="Investment Period"
                  value={inputs.years}
                  onChange={set("years")}
                  onEnter={runCalculate}
                  min="0"
                  suffix="years"
                />
                <CompactInput
                  id="inv-inflation"
                  label="Inflation Rate"
                  value={inputs.inflationRate}
                  onChange={set("inflationRate")}
                  onEnter={runCalculate}
                  suffix="%"
                  hint="Used to convert the balance into today's money"
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
                      id="inv-increase"
                      label="Annual Contribution Increase"
                      value={inputs.annualIncrease}
                      onChange={set("annualIncrease")}
                      onEnter={runCalculate}
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
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Projected Balance</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{money(results.futureValue)}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {`After ${fmt(results.years, 1)} years at ${fmt(results.annualReturn, 2)}% a year, worth ${money(results.realValue)} in today's money`}
                  </div>
                </div>

                {/* 3-STAT BAR */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Invested</span>
                    <span className="font-extrabold text-foreground">{money(results.totalContrib)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Investment Growth</span>
                    <span className="font-extrabold text-foreground">{money(results.totalGrowth)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In Today's Money</span>
                    <span className="font-extrabold text-foreground">{money(results.realValue)}</span>
                  </div>
                </div>

                {/* BREAKDOWN */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Plan Inputs</th>
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

                {/* RETURN SCENARIOS */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Return Scenario</th>
                        <th className="p-2.5 text-right">Projected Balance</th>
                        <th className="p-2.5 pr-3 text-right w-[150px]">In Today's Money</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.scenarios.map((row) => (
                        <tr
                          key={row.label}
                          className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-primary/5 font-semibold" : ""}`}
                        >
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 text-right text-foreground">{money(row.futureValue)}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{money(row.realValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* GROWTH SCHEDULE */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Year</th>
                        <th className="p-2.5 text-right">Invested</th>
                        <th className="p-2.5 text-right text-emerald-600">Growth</th>
                        <th className="p-2.5 text-right">Balance</th>
                        <th className="p-2.5 pr-3 text-right w-[130px]">Today's Money</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.schedule.map((row) => (
                        <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.year}</td>
                          <td className="p-2.5 text-right text-foreground">{money(row.contributions)}</td>
                          <td className="p-2.5 text-right text-emerald-600">{money(row.growth)}</td>
                          <td className="p-2.5 text-right text-foreground">{money(row.balance)}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{money(row.realBalance)}</td>
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
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Nominal Return</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.annualReturn, 2)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Real Return</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.realReturn, 2)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Inflation Drag</span>
                      <span className="text-base font-bold text-foreground">{money(results.inflationDrag)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Return on Contributions</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(results.effectiveReturn, 1)}%`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Growth Multiple</span>
                      <span className="text-base font-bold text-foreground">
                        {results.growthMultiple > 0 ? `${fmt(results.growthMultiple, 2)}x` : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Invested</span>
                      <span className="text-base font-bold text-foreground">{money(results.totalContrib)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Value in Today's Money</span>
                      <span className="text-base font-bold text-foreground">{money(results.realValue)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Projected Balance</span>
                      <span className="text-base font-bold text-foreground">{money(results.futureValue)}</span>
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
            <h2 className="text-2xl font-bold mb-3">What Is an Investment Calculator?</h2>
            <p>
              An investment calculator shows what a portfolio becomes if it is left to compound for a chosen number of
              years. It takes an opening balance, a monthly contribution, an expected annual return and a time horizon,
              then projects the balance month by month while tracking how much of the result came from money you put in
              and how much came from market growth.
            </p>
            <p>
              What separates a useful projection from a misleading one is inflation. A balance of half a million dollars
              in twenty years does not buy what half a million buys today, so this calculator also reports the
              inflation-adjusted value and the real return, which is the growth rate after the rising cost of living has
              been stripped out. Contributions can be increased once a year to reflect pay rises, which keeps the plan
              honest across decades rather than assuming a fixed monthly amount forever.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The nominal return is converted into a monthly rate and applied to the running balance. Each contribution
              is added at the end of the month and compounds from then on, so early contributions carry the most weight in
              the final result. Once a year the monthly amount is raised by the contribution-increase percentage, which
              models a saver who keeps pace with inflation rather than letting their savings rate erode in real terms.
            </p>
            <p>
              Inflation is handled with the Fisher relationship: the real return equals the nominal return minus the
              inflation rate once both are expressed as growth factors, which is close to a simple subtraction for the
              small numbers involved but exact for larger ones. The projected balance is then discounted back over the
              full term to express it in today's purchasing power, and the difference between the two figures is reported
              as the inflation drag.
            </p>
            <p>
              A scenario table prices the same plan two percentage points above and below your assumed return. That range
              is a fair representation of a good and a bad decade for a diversified portfolio, and it demonstrates how
              strongly the outcome depends on the return assumption, which is the input you control least.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the projected balance and the three-stat bar separates total invested, investment
              growth and the value in today's money. The tables below list the inputs, the return scenarios and the
              annual schedule, where contributions, growth and the inflation-adjusted balance are shown together for
              every year.
            </p>
            <p>
              Look for the year in which growth exceeds contributions. Before that point your deposits dominate the
              balance; afterwards the portfolio does most of the work. Delaying the start by even a few years pushes that
              crossover later and costs far more than most investors expect, which is the strongest argument for
              investing early rather than waiting for a perfect entry point.
            </p>
            <p>
              Finally, treat the projected balance as a range rather than a target. Taxes, fund fees and the uneven
              arrival of returns all reduce the realised total, and a bad sequence of returns in the final years before
              you need the money matters as much as the average return over the whole term. Compare the nominal schedule
              with the inflation-adjusted column, and plan your spending around the lower of the two rather than the
              headline number.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-calculator" />
          <PopularCalculators exclude="/calculator/investment-calculator" />
        </div>
      </div>
    </>
  );
}
