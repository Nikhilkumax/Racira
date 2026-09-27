"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface WithdrawalInputs {
  portfolio: number;
  annualWithdrawal: number;
  inflationRate: number;
  expectedReturn: number;
  retirementYears: number;
  otherIncome: number;
}

const DEFAULTS: WithdrawalInputs = {
  portfolio: 800000,
  annualWithdrawal: 40000,
  inflationRate: 2.5,
  expectedReturn: 6,
  retirementYears: 30,
  otherIncome: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface WithdrawalMilestone {
  year: number;
  withdrawal: number;
  balance: number;
}

interface WithdrawalResult {
  withdrawalRate: number;
  realReturn: number;
  endBalance: number;
  depleted: boolean;
  depletionYear: number;
  yearsLasted: number;
  maxSustainableWithdrawal: number;
  maxSustainableRate: number;
  totalWithdrawn: number;
  finalYearWithdrawal: number;
  netPortfolioDraw: number;
  milestones: WithdrawalMilestone[];
  valid: boolean;
  errorMsg: string;
}

function runSchedule(portfolio: number, withdrawal: number, infl: number, ret: number, years: number) {
  let balance = portfolio;
  let w = withdrawal;
  let totalWithdrawn = 0;
  let depleted = false;
  let depletionYear = 0;
  const milestones: WithdrawalMilestone[] = [];

  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + ret / 100) - w;
    totalWithdrawn += w;
    const ending = Math.max(0, balance);
    if (balance <= 0 && !depleted) {
      depleted = true;
      depletionYear = y;
    }
    if (y % 5 === 0 || y === years) {
      milestones.push({ year: y, withdrawal: w, balance: ending });
    }
    w = w * (1 + infl / 100);
  }

  return {
    endBalance: Math.max(0, balance),
    depleted,
    depletionYear,
    yearsLasted: depleted ? depletionYear : years,
    totalWithdrawn,
    finalYearWithdrawal: w / (1 + infl / 100),
    milestones,
  };
}

function computeWithdrawal(i: WithdrawalInputs): WithdrawalResult {
  const years = Math.max(1, Math.round(i.retirementYears));
  const netWithdrawal = Math.max(0, i.annualWithdrawal - i.otherIncome);
  const invalid =
    i.portfolio <= 0 ||
    i.annualWithdrawal < 0 ||
    i.inflationRate < 0 ||
    i.expectedReturn < 0 ||
    i.retirementYears <= 0;

  const schedule = runSchedule(i.portfolio, netWithdrawal, i.inflationRate, i.expectedReturn, years);

  // Largest inflation-adjusted withdrawal the portfolio sustains for the full horizon.
  let lo = 0;
  let hi = Math.max(i.portfolio, netWithdrawal) * 2;
  for (let k = 0; k < 90; k++) {
    const mid = (lo + hi) / 2;
    const test = runSchedule(i.portfolio, mid, i.inflationRate, i.expectedReturn, years);
    if (test.endBalance > 0 && !test.depleted) lo = mid;
    else hi = mid;
  }
  const maxSustainable = (lo + hi) / 2;

  return {
    withdrawalRate: i.portfolio > 0 ? (netWithdrawal / i.portfolio) * 100 : 0,
    realReturn: i.expectedReturn - i.inflationRate,
    endBalance: schedule.endBalance,
    depleted: schedule.depleted,
    depletionYear: schedule.depletionYear,
    yearsLasted: schedule.yearsLasted,
    maxSustainableWithdrawal: maxSustainable,
    maxSustainableRate: i.portfolio > 0 ? (maxSustainable / i.portfolio) * 100 : 0,
    totalWithdrawn: schedule.totalWithdrawn,
    finalYearWithdrawal: schedule.finalYearWithdrawal,
    netPortfolioDraw: netWithdrawal,
    milestones: schedule.milestones,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a portfolio and horizon above zero, and non-negative withdrawal, inflation and return figures."
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

export default function RetirementWithdrawalRateCalculator() {
  const [portfolio, setPortfolio] = useState(String(DEFAULTS.portfolio));
  const [annualWithdrawal, setAnnualWithdrawal] = useState(String(DEFAULTS.annualWithdrawal));
  const [inflationRate, setInflationRate] = useState(String(DEFAULTS.inflationRate));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [retirementYears, setRetirementYears] = useState(String(DEFAULTS.retirementYears));
  const [otherIncome, setOtherIncome] = useState(String(DEFAULTS.otherIncome));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): WithdrawalInputs => ({
    portfolio: parseFloat(portfolio) || 0,
    annualWithdrawal: parseFloat(annualWithdrawal) || 0,
    inflationRate: parseFloat(inflationRate) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    retirementYears: parseFloat(retirementYears) || 0,
    otherIncome: parseFloat(otherIncome) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<WithdrawalInputs>(() => DEFAULTS);
  const [results, setResults] = useState<WithdrawalResult>(() => computeWithdrawal(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeWithdrawal(inputs));
  };

  const reset = () => {
    setPortfolio(String(DEFAULTS.portfolio));
    setAnnualWithdrawal(String(DEFAULTS.annualWithdrawal));
    setInflationRate(String(DEFAULTS.inflationRate));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setRetirementYears(String(DEFAULTS.retirementYears));
    setOtherIncome(String(DEFAULTS.otherIncome));
    setCalcInputs(DEFAULTS);
    setResults(computeWithdrawal(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a safe withdrawal rate?",
      answer:
        "It is the percentage of a portfolio that can be withdrawn each year, adjusted for inflation, without running the money out over a planned horizon. The classic research answer is around four percent for a thirty-year retirement, but that figure came from a specific historical period and a specific asset mix. Lower expected returns and longer retirements push the sustainable figure lower, which is why rate calculators use your own horizon and return assumptions.",
    },
    {
      question: "How does inflation change the picture?",
      answer:
        "Dramatically, because the withdrawals themselves grow. A four percent withdrawal that rises with inflation doubles in roughly twenty-eight years at two and a half percent, so the portfolio has to keep growing just to fund the same lifestyle. This is why the real return — the return after inflation — matters far more than the headline figure, and why a portfolio earning less than inflation cannot survive an inflation-adjusted withdrawal for long.",
    },
    {
      question: "Should I use a fixed rate or a dynamic strategy?",
      answer:
        "Fixed inflation-adjusted withdrawals are simple and predictable, but they ignore market conditions. Dynamic strategies reduce spending after bad years or cap increases to inflation, which materially improves survival odds at the cost of variable income. Many retirees combine the two: a base withdrawal subject to a guardrail, so spending adjusts when the portfolio drifts far from its target path.",
    },
    {
      question: "What role does other income play?",
      answer:
        "A large one. Social Security, a pension or annuity income reduces the amount the portfolio must produce, and that reduction is directly comparable to a lower withdrawal rate. Reducing the net draw by a few thousand dollars a year can extend a portfolio by a decade, which is why the calculation should start with the income you already expect rather than the total spending you want.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Retirement Withdrawal Rate Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Retirement Withdrawal Rate Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Portfolio & Spending">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="portfolio"
                  label="Retirement Portfolio"
                  value={portfolio}
                  onChange={setPortfolio}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Invested assets available to fund retirement."
                />
                <CompactInput
                  id="annual-withdrawal"
                  label="Annual Spending"
                  value={annualWithdrawal}
                  onChange={setAnnualWithdrawal}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total yearly spending the portfolio must support."
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
                  tooltip="Nominal annual return on the portfolio after fees."
                />
                <CompactInput
                  id="inflation"
                  label="Inflation Rate"
                  value={inflationRate}
                  onChange={setInflationRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Rate at which withdrawals rise each year."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="retirement-years"
                  label="Retirement Length"
                  value={retirementYears}
                  onChange={setRetirementYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="How many years the portfolio must last."
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
                  <SubSection title="Guaranteed Income">
                    <CompactInput
                      id="other-income"
                      label="Other Annual Income"
                      value={otherIncome}
                      onChange={setOtherIncome}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Social Security, pension or annuity income that offsets spending."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Withdrawal Rate</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.withdrawalRate, 2)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.depleted
                  ? `Portfolio runs out in year ${fmt(results.depletionYear, 0)} of ${fmt(calcInputs.retirementYears, 0)}`
                  : `Portfolio survives all ${fmt(calcInputs.retirementYears, 0)} years with $${fmt(results.endBalance, 0)} left`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Real Return</span>
                <span className="font-extrabold text-foreground">{fmt(results.realReturn, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sustainable Draw</span>
                <span className="font-extrabold text-foreground">${fmt(results.maxSustainableWithdrawal, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sustainable Rate</span>
                <span className="font-extrabold text-foreground">{fmt(results.maxSustainableRate, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Milestone</th>
                    <th className="p-2.5 text-right w-[140px]">Withdrawal</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Portfolio Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.milestones.map((ms) => (
                    <tr key={ms.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {fmt(ms.year, 0)}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(ms.withdrawal, 0)}</td>
                      <td className={`p-2.5 pr-3 text-right ${ms.balance > 0 ? "text-foreground" : "text-red-600"}`}>
                        ${fmt(ms.balance, 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total withdrawn</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalWithdrawn, 0)}</td>
                    <td className={`p-2.5 pr-3 text-right ${results.depleted ? "text-red-600" : "text-emerald-600"}`}>
                      {results.depleted ? "Depleted" : "Sustained"}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Portfolio Draw</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.netPortfolioDraw, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Other Income</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.otherIncome, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final-Year Withdrawal</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.finalYearWithdrawal, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Years Covered</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.yearsLasted, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Horizon</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.retirementYears, 0)} years</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Plan Status</span>
                  <span className={`text-base font-bold ${results.depleted ? "text-red-600" : "text-emerald-600"}`}>
                    {results.depleted ? "Shortfall" : "Fully funded"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Retirement Withdrawal Rate Calculator?</h2>
            <p>
              A retirement withdrawal rate calculator answers a deceptively simple question: how much can you take out of
              a portfolio each year without running out? It divides your planned spending by the portfolio balance to get
              a percentage, then simulates that withdrawal growing with inflation across your expected retirement length
              to see whether the money lasts.
            </p>
            <p>
              The percentage matters because it is portable. A rule of thumb lets you sanity-check any plan quickly, while
              the simulation shows what your specific horizon, return and inflation assumptions do to the answer. The two
              together turn a vague hope into a testable plan.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each year the portfolio grows at the expected return and the withdrawal is subtracted. The withdrawal then
              increases by the inflation rate, so year ten spends noticeably more than year one. The simulation records
              the balance at the end of every year and flags the first year the balance turns negative, if it does.
            </p>
            <p>
              The calculator also solves the reverse problem: it searches for the largest inflation-adjusted withdrawal
              the portfolio can sustain for the entire horizon, using a bisection search across possible amounts. That
              maximum, expressed as a percentage of the portfolio, is your personal sustainable rate — the number to
              compare against the spending you actually need.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows your withdrawal rate and states whether the portfolio survives the horizon or is
              depleted and in which year. The three-stat bar reports the real return, the sustainable withdrawal amount
              and the sustainable rate, while the milestone table tracks withdrawals and balances at five-year intervals.
            </p>
            <p>
              Compare your rate with the sustainable rate, not with a generic rule of thumb. A thirty-year horizon at a
              six percent return supports a higher draw than a forty-year horizon at four percent, and the difference is
              larger than most retirees expect. If your spending exceeds the sustainable figure, closing the gap with
              other income is usually easier than trying to earn a higher return.
            </p>
            <p>
              Finally, treat this as a deterministic check rather than a forecast. Real markets deliver good and bad
              decades in unpredictable order, and a portfolio that survives on average can still fail if the early years
              are poor. Running several return scenarios, and planning a flexible spending adjustment for bad stretches,
              is the most practical protection against that sequence risk. One more habit helps: review the rate annually
              rather than setting it once at retirement. After a strong market year the sustainable rate rises, and after
              a weak one it falls, so a planned pause or reduction following poor performance does far more for longevity
              than any single assumption made decades earlier. Retirees who adjust spending to market conditions have
              historically sustained meaningfully higher withdrawals than those who lock in a fixed inflation-adjusted
              amount and never look at it again, which remains the single most useful and durable takeaway from decades of
              withdrawal-rate research on retirement portfolios and on how long retirement savings actually need to last
              in practice.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/retirement-withdrawal-rate-calculator" />
          <PopularCalculators exclude="/calculator/retirement-withdrawal-rate-calculator" />
        </div>
      </div>
    </>
  );
}
