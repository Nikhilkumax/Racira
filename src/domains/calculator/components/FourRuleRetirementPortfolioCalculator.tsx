"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FourPercentInputs {
  portfolio: number;
  withdrawalRate: number;
  inflationRate: number;
  expectedReturn: number;
  retirementYears: number;
}

const DEFAULTS: FourPercentInputs = {
  portfolio: 1000000,
  withdrawalRate: 4,
  inflationRate: 2.5,
  expectedReturn: 7,
  retirementYears: 30,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface RateScenario {
  rate: number;
  income: number;
  monthly: number;
  yearsLasted: number;
  success: boolean;
  endBalance: number;
}

interface FourPercentResult {
  firstYearIncome: number;
  monthlyIncome: number;
  yearsLasted: number;
  success: boolean;
  depletionYear: number;
  endBalance: number;
  finalYearIncome: number;
  totalWithdrawn: number;
  realReturn: number;
  portfolioPerDollarIncome: number;
  scenarios: RateScenario[];
  valid: boolean;
  errorMsg: string;
}

function simulateRule(
  portfolio: number,
  firstYearIncome: number,
  infl: number,
  ret: number,
  years: number,
) {
  let balance = portfolio;
  let w = firstYearIncome;
  let total = 0;
  let depleted = false;
  let depletionYear = 0;

  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + ret / 100) - w;
    total += w;
    if (balance <= 0 && !depleted) {
      depleted = true;
      depletionYear = y;
    }
    w = w * (1 + infl / 100);
  }

  return {
    endBalance: Math.max(0, balance),
    depleted,
    depletionYear,
    yearsLasted: depleted ? depletionYear : years,
    total,
  };
}

function computeRule(i: FourPercentInputs): FourPercentResult {
  const years = Math.max(1, Math.round(i.retirementYears));
  const invalid =
    i.portfolio <= 0 ||
    i.withdrawalRate < 0 ||
    i.inflationRate < 0 ||
    i.expectedReturn < 0 ||
    i.retirementYears <= 0;

  const firstYearIncome = i.portfolio * (i.withdrawalRate / 100);
  const main = simulateRule(i.portfolio, firstYearIncome, i.inflationRate, i.expectedReturn, years);
  const finalYearIncome = firstYearIncome * Math.pow(1 + i.inflationRate / 100, years - 1);

  const scenarios: RateScenario[] = [3, 3.5, 4, 4.5, 5].map((rate) => {
    const income = i.portfolio * (rate / 100);
    const outcome = simulateRule(i.portfolio, income, i.inflationRate, i.expectedReturn, years);
    return {
      rate,
      income,
      monthly: income / 12,
      yearsLasted: outcome.yearsLasted,
      success: !outcome.depleted,
      endBalance: outcome.endBalance,
    };
  });

  return {
    firstYearIncome,
    monthlyIncome: firstYearIncome / 12,
    yearsLasted: main.yearsLasted,
    success: !main.depleted,
    depletionYear: main.depletionYear,
    endBalance: main.endBalance,
    finalYearIncome,
    totalWithdrawn: main.total,
    realReturn: i.expectedReturn - i.inflationRate,
    portfolioPerDollarIncome: firstYearIncome > 0 ? i.portfolio / firstYearIncome : 0,
    scenarios,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a portfolio and horizon above zero, and non-negative rate, inflation and return figures."
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

export default function FourRuleRetirementPortfolioCalculator() {
  const [portfolio, setPortfolio] = useState(String(DEFAULTS.portfolio));
  const [withdrawalRate, setWithdrawalRate] = useState(String(DEFAULTS.withdrawalRate));
  const [inflationRate, setInflationRate] = useState(String(DEFAULTS.inflationRate));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [retirementYears, setRetirementYears] = useState(String(DEFAULTS.retirementYears));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FourPercentInputs => ({
    portfolio: parseFloat(portfolio) || 0,
    withdrawalRate: parseFloat(withdrawalRate) || 0,
    inflationRate: parseFloat(inflationRate) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    retirementYears: parseFloat(retirementYears) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<FourPercentInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FourPercentResult>(() => computeRule(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeRule(inputs));
  };

  const reset = () => {
    setPortfolio(String(DEFAULTS.portfolio));
    setWithdrawalRate(String(DEFAULTS.withdrawalRate));
    setInflationRate(String(DEFAULTS.inflationRate));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setRetirementYears(String(DEFAULTS.retirementYears));
    setCalcInputs(DEFAULTS);
    setResults(computeRule(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the 4% rule?",
      answer:
        "The 4% rule says a retiree can withdraw four percent of a starting portfolio in the first year, then increase that amount with inflation each year, with a high probability of the money lasting thirty years. It came from the Trinity study and similar research that backtested historical returns for diversified portfolios. It is a planning starting point, not a guarantee, and it assumes a specific asset mix and a thirty-year horizon.",
    },
    {
      question: "Why do many planners now suggest 3% to 3.5%?",
      answer:
        "Because the assumptions behind the original research have shifted. Bond yields were historically low for years, equity valuations are elevated relative to earnings, and retirees are living longer than the thirty-year window the rule was built around. A lower starting rate provides margin for a longer retirement, for sequence risk in the early years, and for fees and taxes that the simple rule does not model.",
    },
    {
      question: "How should I adjust the rate for early retirement?",
      answer:
        "Shorten the rate, not the horizon, because early retirement stretches the period the portfolio must cover. A withdrawal beginning at fifty may need to support forty or even fifty years, and research suggests a starting rate closer to three percent for those horizons. Many early retirees also bridge the years before pension or Social Security income begins, which temporarily raises the required draw and argues for an even larger cushion.",
    },
    {
      question: "What is sequence of returns risk?",
      answer:
        "It is the danger that poor market returns in the first years of retirement permanently damage the portfolio, because withdrawals during a decline lock in losses that later gains cannot fully repair. Two retirees with identical average returns can end with very different balances depending on the order those returns arrived. That is why the rule is safest when paired with a spending adjustment that kicks in after bad years.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "4% Rule Retirement Portfolio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          4% Rule Retirement Portfolio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Portfolio & Rate">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="portfolio"
                  label="Portfolio Value"
                  value={portfolio}
                  onChange={setPortfolio}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Invested assets at the start of retirement."
                />
                <CompactInput
                  id="withdrawal-rate"
                  label="Withdrawal Rate"
                  value={withdrawalRate}
                  onChange={setWithdrawalRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Share of the portfolio withdrawn in year one."
                />
              </div>
            </SubSection>

            <SubSection title="Assumptions">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="expected-return"
                  label="Expected Return"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Average annual return after fees."
                />
                <CompactInput
                  id="retirement-years"
                  label="Retirement Length"
                  value={retirementYears}
                  onChange={setRetirementYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="Years the portfolio must support."
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
                  <SubSection title="Inflation">
                    <CompactInput
                      id="inflation"
                      label="Inflation Rate"
                      value={inflationRate}
                      onChange={setInflationRate}
                      onEnter={runCalculate}
                      suffix="%"
                      min="0"
                      tooltip="Annual increase applied to the withdrawal each year."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">First-Year Income</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.firstYearIncome, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`$${fmt(results.monthlyIncome, 0)} per month, rising with inflation for ${fmt(calcInputs.retirementYears, 0)} years`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Withdrawal Rate</span>
                <span className="font-extrabold text-foreground">{fmt(calcInputs.withdrawalRate, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Portfolio Lasts</span>
                <span className="font-extrabold text-foreground">{fmt(results.yearsLasted, 0)} yr</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ending Balance</span>
                <span className="font-extrabold text-foreground">${fmt(results.endBalance, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Withdrawal Rate</th>
                    <th className="p-2.5 text-right w-[140px]">Year 1 Income</th>
                    <th className="p-2.5 text-right w-[120px]">Monthly</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.scenarios.map((s) => (
                    <tr key={s.rate} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{fmt(s.rate, 1)}%</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(s.income, 0)}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(s.monthly, 0)}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${s.success ? "text-emerald-600" : "text-red-600"}`}>
                        {s.success ? `Lasts ${fmt(s.yearsLasted, 0)} yr` : `Ends year ${fmt(s.yearsLasted, 0)}`}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Your plan</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.firstYearIncome, 0)}</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.monthlyIncome, 0)}</td>
                    <td className={`p-2.5 pr-3 text-right ${results.success ? "text-emerald-600" : "text-red-600"}`}>
                      {results.success ? "Sustained" : "Shortfall"}
                    </td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Income</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.monthlyIncome, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final-Year Income</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.finalYearIncome, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Withdrawn</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalWithdrawn, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Real Return</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.realReturn, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Portfolio per $1 of Income</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.portfolioPerDollarIncome, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Plan Status</span>
                  <span className={`text-base font-bold ${results.success ? "text-emerald-600" : "text-red-600"}`}>
                    {results.success ? "Supported" : `Depleted in year ${fmt(results.depletionYear, 0)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a 4% Rule Retirement Portfolio Calculator?</h2>
            <p>
              A 4% rule calculator applies the classic retirement guide to your own portfolio. The rule says the first
              year of retirement spending should not exceed four percent of the starting balance, and that the same
              dollar amount can then rise with inflation each year for thirty years. The calculator turns that percentage
              into an income figure and tests whether it actually survives your assumptions.
            </p>
            <p>
              Because the four percent figure came from historical research rather than a law of nature, the useful part
              of this tool is the scenario table. It shows what happens at three, three and a half, four, four and a half
              and five percent, so you can see where your plan sits on the risk spectrum rather than trusting a single
              number.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The starting withdrawal is the portfolio multiplied by the rate, and each subsequent year&apos;s withdrawal
              grows by the inflation rate. Meanwhile the portfolio earns the expected return. The difference between the
              return and the growing withdrawal determines whether the balance rises, holds or falls; when it reaches zero
              the plan has failed and the year is recorded.
            </p>
            <p>
              The same simulation is repeated for each scenario rate, holding every other assumption constant. That
              isolates the effect of the withdrawal percentage itself. Repeating it across return assumptions as well is
              the standard way to build a range, because real returns vary and a plan that works in the base case can fail
              in a weaker one.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports first-year income with its monthly equivalent. The three-stat bar shows the
              withdrawal rate, how long the portfolio lasts and the ending balance, while the table compares all five
              rate scenarios against your own plan.
            </p>
            <p>
              Watch the difference between the rate that merely survives and the rate that leaves a comfortable cushion.
              A plan ending with a substantial balance at age ninety-five is resilient; one that survives by a whisker has
              no room for a long illness, a market collapse or a rise in inflation. If your rate is above four percent and
              the horizon is long, the scenario table is likely to show depletion well before the end.
            </p>
            <p>
              The final point is that the rule is a guardrail rather than an instruction. Spending less after a bad year
              and taking a raise only after strong years keeps a portfolio alive far more reliably than any fixed
              percentage. Used with that discipline, even a modest portfolio can support a long retirement with
              considerably less anxiety about whether the money will last. It also helps to separate essential spending
              from discretionary spending before choosing a rate, because the portion you can trim in a bad year is what
              actually makes flexibility possible. A retiree who knows that ten thousand dollars of the budget is optional
              can safely start at a higher rate than one whose entire withdrawal funds fixed obligations, and the scenario
              scenario table is far easier to read once that distinction is clear in your own plan.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/4-rule-retirement-portfolio-calculator" />
          <PopularCalculators exclude="/calculator/4-rule-retirement-portfolio-calculator" />
        </div>
      </div>
    </>
  );
}
