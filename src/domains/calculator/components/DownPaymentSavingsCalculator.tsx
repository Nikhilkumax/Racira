"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SavingsInputs {
  homePrice: number;
  downPercent: number;
  currentSavings: number;
  monthly: number;
  annualReturn: number;
  targetMonths: number;
}

const DEFAULTS: SavingsInputs = {
  homePrice: 400000,
  downPercent: 20,
  currentSavings: 25000,
  monthly: 900,
  annualReturn: 3.5,
  targetMonths: 36,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

const yearsMonths = (months: number) => {
  if (!Number.isFinite(months)) return "Never";
  const m = Math.round(months);
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} mo`;
  return mo === 0 ? `${y} yr` : `${y} yr ${mo} mo`;
};

const targetDate = (months: number) => {
  if (!Number.isFinite(months) || months > 720) return "—";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(months));
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

interface SavingsResult {
  goal: number;
  gap: number;
  monthlyRate: number;
  monthsToGoal: number;
  dateToGoal: string;
  projectedAtTarget: number;
  requiredMonthly: number;
  totalContributions: number;
  investmentGrowth: number;
  onTrack: boolean;
  verdict: string;
  verdictTone: string;
  projection: { year: number; balance: number; pct: number }[];
  valid: boolean;
  errorMsg: string;
}

function simulate(
  start: number,
  monthly: number,
  monthlyRate: number,
  goal: number,
  maxMonths: number,
): { months: number; balance: number; contributions: number } {
  let bal = start;
  let contributions = 0;
  let m = 0;
  while (bal < goal && m < maxMonths) {
    m++;
    bal = bal * (1 + monthlyRate) + monthly;
    contributions += monthly;
    if (monthly <= 0 && monthlyRate <= 0) return { months: Infinity, balance: bal, contributions };
  }
  return { months: bal >= goal ? m : Infinity, balance: bal, contributions };
}

function computeSavings(i: SavingsInputs): SavingsResult {
  const targetMonths = Math.max(0, Math.round(i.targetMonths));
  const invalid =
    i.homePrice <= 0 ||
    i.downPercent <= 0 ||
    i.downPercent >= 100 ||
    i.currentSavings < 0 ||
    i.monthly < 0 ||
    i.annualReturn < 0 ||
    i.targetMonths < 0;

  const goal = i.homePrice * (i.downPercent / 100);
  const gap = Math.max(0, goal - i.currentSavings);
  const monthlyRate = i.annualReturn / 100 / 12;

  const sim = simulate(i.currentSavings, i.monthly, monthlyRate, goal, 1200);
  const monthsToGoal = gap <= 0 ? 0 : sim.months;

  const atTarget = simulate(i.currentSavings, i.monthly, monthlyRate, goal, Math.max(targetMonths, 0));
  const projectedAtTarget = atTarget.balance;

  // Required monthly contribution to reach the goal inside the target window.
  let requiredMonthly = 0;
  if (gap > 0 && targetMonths > 0) {
    const growth = Math.pow(1 + monthlyRate, targetMonths);
    if (monthlyRate > 0) {
      requiredMonthly = ((goal - i.currentSavings * growth) * monthlyRate) / (growth - 1);
    } else {
      requiredMonthly = (goal - i.currentSavings) / targetMonths;
    }
    requiredMonthly = Math.max(0, requiredMonthly);
  } else if (gap > 0) {
    requiredMonthly = gap;
  }

  const horizon = Math.min(Math.max(monthsToGoal === Infinity ? targetMonths : Math.ceil(monthsToGoal), targetMonths, 12), 600);
  const projection: { year: number; balance: number; pct: number }[] = [];
  let bal = i.currentSavings;
  let contributions = 0;
  const years = Math.min(Math.ceil(horizon / 12), 12);
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      bal = bal * (1 + monthlyRate) + i.monthly;
      contributions += i.monthly;
    }
    projection.push({ year: y, balance: bal, pct: goal > 0 ? (bal / goal) * 100 : 0 });
  }

  const investmentGrowth = Math.max(0, bal - i.currentSavings - contributions);
  const onTrack = gap <= 0 || (Number.isFinite(monthsToGoal) && monthsToGoal <= targetMonths);

  let verdict = "Ahead of schedule";
  let verdictTone = "text-emerald-600";
  if (gap > 0 && !Number.isFinite(monthsToGoal)) {
    verdict = "Goal not reachable at this rate";
    verdictTone = "text-destructive";
  } else if (!onTrack) {
    verdict = "Behind your target timeline";
    verdictTone = "text-amber-600";
  }

  return {
    goal,
    gap,
    monthlyRate,
    monthsToGoal,
    dateToGoal: targetDate(monthsToGoal),
    projectedAtTarget,
    requiredMonthly,
    totalContributions: contributions,
    investmentGrowth,
    onTrack,
    verdict,
    verdictTone,
    projection,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive home price, a down payment between 0% and 100%, and non-negative savings figures."
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

export default function DownPaymentSavingsCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPercent, setDownPercent] = useState(String(DEFAULTS.downPercent));
  const [currentSavings, setCurrentSavings] = useState(String(DEFAULTS.currentSavings));
  const [monthly, setMonthly] = useState(String(DEFAULTS.monthly));
  const [annualReturn, setAnnualReturn] = useState(String(DEFAULTS.annualReturn));
  const [targetMonths, setTargetMonths] = useState(String(DEFAULTS.targetMonths));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SavingsInputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPercent: parseFloat(downPercent) || 0,
    currentSavings: parseFloat(currentSavings) || 0,
    monthly: parseFloat(monthly) || 0,
    annualReturn: parseFloat(annualReturn) || 0,
    targetMonths: parseFloat(targetMonths) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<SavingsInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SavingsResult>(() => computeSavings(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSavings(inputs));
  };

  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPercent(String(DEFAULTS.downPercent));
    setCurrentSavings(String(DEFAULTS.currentSavings));
    setMonthly(String(DEFAULTS.monthly));
    setAnnualReturn(String(DEFAULTS.annualReturn));
    setTargetMonths(String(DEFAULTS.targetMonths));
    setCalcInputs(DEFAULTS);
    setResults(computeSavings(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much do I need for a down payment?",
      answer:
        "Twenty percent of the purchase price is the traditional benchmark because it removes the requirement for private mortgage insurance and gives lenders the strongest loan-to-value position. Many conventional loans accept as little as three percent, and FHA loans accept three and a half percent, but a smaller down payment raises the monthly payment, adds mortgage insurance, and increases the total interest paid over the life of the loan.",
    },
    {
      question: "How long will it take to save a down payment?",
      answer:
        "Divide the shortfall by the amount you can genuinely set aside each month, then shorten the answer for the interest the balance earns while it grows. Because the saving habit is monthly and the interest compounds, a modest return makes a meaningful difference over a few years. The calculator walks the balance forward month by month so the timeline reflects the growth rather than a simple division.",
    },
    {
      question: "Where should down payment savings be held?",
      answer:
        "Because the money is needed on a known date, capital preservation matters more than maximum return. High-yield savings accounts, money market funds and short-term certificates of deposit are the usual choices, and treasury bills are another. Equity investments are generally unsuitable for a horizon under about three years, because a market decline shortly before you buy can cost you the house rather than merely denting a portfolio.",
    },
    {
      question: "Do I have to put twenty percent down?",
      answer:
        "No. Twenty percent avoids private mortgage insurance, but lower down payments are common and often the faster route to ownership. The trade-off is a larger loan and an insurance premium that typically runs between half a percent and one and a half percent of the loan each year. Once the balance amortises to eighty percent of value, or the home appreciates, the insurance can usually be removed on request.",
    },
    {
      question: "Can I use gifted money for a down payment?",
      answer:
        "Yes. Lenders accept gift funds, but they will ask for a signed gift letter stating that the money is a gift rather than a loan, evidence of the transfer, and often the donor's bank statement. The funds usually need to be documented and seasoned in your account for at least two months before application, so arrange the transfer early rather than at the last minute.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Down Payment Savings Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Down Payment Savings Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Property Target">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="price"
                  label="Home Price"
                  value={homePrice}
                  onChange={setHomePrice}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Price of the home you plan to buy."
                />
                <CompactInput
                  id="down"
                  label="Down Payment"
                  value={downPercent}
                  onChange={setDownPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.5"
                  tooltip="Target down payment as a share of price."
                />
              </div>
            </SubSection>

            <SubSection title="Savings Plan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="current"
                  label="Current Savings"
                  value={currentSavings}
                  onChange={setCurrentSavings}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Money already set aside for the down payment."
                />
                <CompactInput
                  id="monthly"
                  label="Monthly Deposit"
                  value={monthly}
                  onChange={setMonthly}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Amount added to the fund each month."
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
                  <SubSection title="Growth & Timeline">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="return"
                        label="Annual Return"
                        value={annualReturn}
                        onChange={setAnnualReturn}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.25"
                        tooltip="Expected interest or yield on the savings balance."
                      />
                      <CompactInput
                        id="target"
                        label="Target Timeline"
                        value={targetMonths}
                        onChange={setTargetMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="0"
                        tooltip="Months until you want to buy. Used to compute the required monthly deposit."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Time to Reach Down Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {yearsMonths(results.monthsToGoal)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.goal)} needed &middot; target date {results.dateToGoal} &middot;{" "}
                <span className={results.verdictTone}>{results.verdict}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Down Payment Needed</span>
                <span className="font-extrabold text-foreground">{money(results.goal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Still to Save</span>
                <span className="font-extrabold text-foreground">{money(results.gap)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Required Monthly</span>
                <span className="font-extrabold text-primary">{money(results.requiredMonthly)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Period</th>
                    <th className="p-2.5 text-right w-[130px]">Projected Balance</th>
                    <th className="p-2.5 pr-3 text-right w-[100px]">% of Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.projection.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.year === 1 ? "After 12 months" : `After ${row.year} years`}
                      </td>
                      <td
                        className={`p-2.5 text-right ${row.balance >= results.goal ? "font-semibold text-emerald-600" : "text-foreground"}`}
                      >
                        {money(row.balance)}
                      </td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(Math.min(row.pct, 999), 1)}%</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Goal</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.goal)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Home Price</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.homePrice)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Down Payment Goal</span>
                  <span className="text-base font-bold text-primary">{money(results.goal)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Current Savings</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.currentSavings)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Deposit</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.monthly)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Contributions</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalContributions)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Investment Growth</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.investmentGrowth)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance at Target Date</span>
                  <span className="text-base font-bold text-foreground">{money(results.projectedAtTarget)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Rate on Deposits</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.monthlyRate * 100, 3)}%/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Down Payment Savings Calculator?</h2>
            <p>
              A down payment savings calculator answers two questions at once: how long it will take to accumulate a target
              down payment at your current saving rate, and how much you would need to set aside each month to be ready by a
              chosen date. The target itself is simply the home price multiplied by the down payment percentage. The useful
              part is the second step, because it converts a vague ambition into a specific monthly number.
            </p>
            <p>
              Both answers matter when you are planning a purchase. Knowing the timeline tells you when to start house
              hunting and when to lock in a rate; knowing the required monthly figure tells you whether the goal is
              realistic at your income, or whether you should adjust the price, the percentage, or the deadline. Because the
              fund also earns interest, the two figures interact: raising the expected return shortens the timeline slightly,
              but raising the monthly deposit shortens it dramatically.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Timeline Is Calculated</h2>
            <p>
              The shortfall is the target down payment minus what you have already saved. The balance is then walked forward
              month by month: each month the existing balance grows by the monthly rate, which is the annual return divided
              by twelve, and the monthly deposit is added. The loop stops in the first month the balance reaches the goal,
              and that month count is the timeline. Compounding this way is more accurate than dividing the shortfall by the
              deposit, because the interest earned along the way does part of the work.
            </p>
            <p>
              The required monthly deposit is the inverse problem, solved directly from the future value of an annuity.
              Taking the target as the future value, the present savings as a starting lump sum, and the target timeline as
              the number of periods, the formula rearranges to give the payment needed: the goal less the present savings
              grown at the monthly rate, multiplied by the monthly rate, divided by the growth factor less one. When the
              return is zero this collapses to the shortfall divided by the number of months.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the time to reach the down payment with a verdict on whether that beats your target
              timeline. The three statistics beside it give the down payment required, the amount still to save, and the
              monthly deposit needed to hit the target date exactly. The breakdown table projects the balance forward year
              by year, showing the percentage of the goal reached at each anniversary and highlighting the year the target is
              crossed.
            </p>
            <p>
              Summary Statistics collects the home price, the goal, the current savings, the monthly deposit, the total
              contributions and the investment growth, along with the balance projected at the target date and the monthly
              rate applied. Keep the expected return conservative. Down payment money is needed on a known date, so capital
              preservation matters more than yield, and a high-yield savings account or short-term certificate of deposit is
              usually more appropriate than an equity investment. Also remember that closing costs typically add two to five
              percent of the purchase price on top of the down payment, so consider saving for those alongside the goal.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/down-payment-savings-calculator" />
          <PopularCalculators exclude="/calculator/down-payment-savings-calculator" />
        </div>
      </div>
    </>
  );
}
