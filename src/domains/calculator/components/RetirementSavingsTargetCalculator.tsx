"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TargetInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  preRetirementReturn: number;
  postRetirementReturn: number;
  retirementYears: number;
  desiredIncome: number;
  otherIncome: number;
  inflationRate: number;
}

const DEFAULTS: TargetInputs = {
  currentAge: 40,
  retirementAge: 65,
  currentSavings: 150000,
  monthlyContribution: 1000,
  preRetirementReturn: 7,
  postRetirementReturn: 5,
  retirementYears: 25,
  desiredIncome: 60000,
  otherIncome: 18000,
  inflationRate: 2.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface TargetResult {
  yearsToRetirement: number;
  monthsToRetirement: number;
  projectedSavings: number;
  needAtRetirement: number;
  requiredCorpus: number;
  gap: number;
  additionalMonthly: number;
  totalMonthlyNeeded: number;
  replacementRatio: number;
  fundedRatio: number;
  incomeFromProjected: number;
  realReturn: number;
  onTrack: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeTarget(i: TargetInputs): TargetResult {
  const yearsToRetirement = Math.max(0, i.retirementAge - i.currentAge);
  const monthsToRetirement = Math.round(yearsToRetirement * 12);
  const years = Math.max(1, Math.round(i.retirementYears));
  const yearsToRetirementRounded = Math.max(0, Math.round(yearsToRetirement));
  const invalid =
    i.retirementAge <= i.currentAge ||
    i.currentSavings < 0 ||
    i.monthlyContribution < 0 ||
    i.preRetirementReturn < 0 ||
    i.postRetirementReturn < 0 ||
    i.retirementYears <= 0 ||
    i.desiredIncome < 0 ||
    i.otherIncome < 0 ||
    i.inflationRate < 0;

  // Accumulation phase: monthly compounding of savings and contributions.
  const rm = i.preRetirementReturn / 100 / 12;
  let balance = i.currentSavings;
  for (let m = 0; m < monthsToRetirement; m++) {
    balance = balance * (1 + rm) + i.monthlyContribution;
  }
  const projectedSavings = balance;

  // Income needed in the first retirement year, stated in the dollars of that year.
  const annualNeedToday = Math.max(0, i.desiredIncome - i.otherIncome);
  const needAtRetirement = annualNeedToday * Math.pow(1 + i.inflationRate / 100, yearsToRetirementRounded);

  // Present value at retirement of the inflation-adjusted income stream.
  const ri = i.inflationRate / 100;
  const rp = i.postRetirementReturn / 100;
  let requiredCorpus = 0;
  for (let k = 1; k <= years; k++) {
    const incomeK = needAtRetirement * Math.pow(1 + ri, k - 1);
    requiredCorpus += incomeK / Math.pow(1 + rp, k);
  }

  const gap = Math.max(0, requiredCorpus - projectedSavings);
  const annuityFactor = rm > 0 ? (Math.pow(1 + rm, monthsToRetirement) - 1) / rm : monthsToRetirement;
  const additionalMonthly = monthsToRetirement > 0 && annuityFactor > 0 ? gap / annuityFactor : 0;

  return {
    yearsToRetirement,
    monthsToRetirement,
    projectedSavings,
    needAtRetirement,
    requiredCorpus,
    gap,
    additionalMonthly,
    totalMonthlyNeeded: i.monthlyContribution + additionalMonthly,
    replacementRatio: i.desiredIncome > 0 ? (annualNeedToday / i.desiredIncome) * 100 : 0,
    fundedRatio: requiredCorpus > 0 ? (projectedSavings / requiredCorpus) * 100 : 100,
    incomeFromProjected: projectedSavings * 0.04,
    realReturn: i.preRetirementReturn - i.inflationRate,
    onTrack: gap <= 0.005,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a retirement age above your current age, non-negative savings, income and rates, and a retirement length above zero."
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

export default function RetirementSavingsTargetCalculator() {
  const [currentAge, setCurrentAge] = useState(String(DEFAULTS.currentAge));
  const [retirementAge, setRetirementAge] = useState(String(DEFAULTS.retirementAge));
  const [currentSavings, setCurrentSavings] = useState(String(DEFAULTS.currentSavings));
  const [monthlyContribution, setMonthlyContribution] = useState(String(DEFAULTS.monthlyContribution));
  const [preRetirementReturn, setPreRetirementReturn] = useState(String(DEFAULTS.preRetirementReturn));
  const [postRetirementReturn, setPostRetirementReturn] = useState(String(DEFAULTS.postRetirementReturn));
  const [retirementYears, setRetirementYears] = useState(String(DEFAULTS.retirementYears));
  const [desiredIncome, setDesiredIncome] = useState(String(DEFAULTS.desiredIncome));
  const [otherIncome, setOtherIncome] = useState(String(DEFAULTS.otherIncome));
  const [inflationRate, setInflationRate] = useState(String(DEFAULTS.inflationRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TargetInputs => ({
    currentAge: parseFloat(currentAge) || 0,
    retirementAge: parseFloat(retirementAge) || 0,
    currentSavings: parseFloat(currentSavings) || 0,
    monthlyContribution: parseFloat(monthlyContribution) || 0,
    preRetirementReturn: parseFloat(preRetirementReturn) || 0,
    postRetirementReturn: parseFloat(postRetirementReturn) || 0,
    retirementYears: parseFloat(retirementYears) || 0,
    desiredIncome: parseFloat(desiredIncome) || 0,
    otherIncome: parseFloat(otherIncome) || 0,
    inflationRate: parseFloat(inflationRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<TargetInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TargetResult>(() => computeTarget(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTarget(inputs));
  };

  const reset = () => {
    setCurrentAge(String(DEFAULTS.currentAge));
    setRetirementAge(String(DEFAULTS.retirementAge));
    setCurrentSavings(String(DEFAULTS.currentSavings));
    setMonthlyContribution(String(DEFAULTS.monthlyContribution));
    setPreRetirementReturn(String(DEFAULTS.preRetirementReturn));
    setPostRetirementReturn(String(DEFAULTS.postRetirementReturn));
    setRetirementYears(String(DEFAULTS.retirementYears));
    setDesiredIncome(String(DEFAULTS.desiredIncome));
    setOtherIncome(String(DEFAULTS.otherIncome));
    setInflationRate(String(DEFAULTS.inflationRate));
    setCalcInputs(DEFAULTS);
    setResults(computeTarget(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is a retirement savings target calculated?",
      answer:
        "It works backwards from the income you want. First, the annual income needed is stated in the dollars of your retirement year by growing today's figure with inflation. Then that stream is discounted back to the retirement date to find the lump sum — the corpus — that can fund it. A separate projection grows your current savings and future contributions forward to the same date, and the difference between the two numbers is your gap.",
    },
    {
      question: "Why is the required corpus often much larger than expected?",
      answer:
        "Because it has to fund an income that rises with inflation for every year of retirement, and because withdrawals continue while the remaining balance still needs to grow. A sixty thousand dollar income growing at three percent for twenty-five years totals well over two million dollars of spending, and the corpus required to fund it without running dry is a large fraction of that. Retirees who expect the corpus to equal ten times their annual income are often surprised by the arithmetic.",
    },
    {
      question: "Should other income be counted in today's dollars?",
      answer:
        "Yes, and consistently. The tool subtracts other income from desired spending before inflating the result, which assumes the other income keeps pace with inflation. Social Security does adjust for inflation, so that assumption is reasonable; a fixed private pension does not, so its real value erodes and a portion of it should be entered with that in mind.",
    },
    {
      question: "What if I cannot afford the additional monthly contribution?",
      answer:
        "Then adjust one of the other levers. Delaying retirement by a few years adds contributions and shortens the withdrawal period, which is usually the single most powerful change. Spending less in retirement lowers the required corpus directly. Many people combine a modest delay with a slightly lower target income, and the pair closes gaps that looks hopeless when considered one at a time.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Retirement Savings Target Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Retirement Savings Target Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Timeline">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="current-age"
                  label="Current Age"
                  value={currentAge}
                  onChange={setCurrentAge}
                  onEnter={runCalculate}
                  tooltip="Your age today."
                />
                <CompactInput
                  id="retirement-age"
                  label="Retirement Age"
                  value={retirementAge}
                  onChange={setRetirementAge}
                  onEnter={runCalculate}
                  tooltip="The age contributions stop and withdrawals begin."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="current-savings"
                  label="Current Savings"
                  value={currentSavings}
                  onChange={setCurrentSavings}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Retirement savings you already hold."
                />
                <CompactInput
                  id="monthly-contribution"
                  label="Monthly Contribution"
                  value={monthlyContribution}
                  onChange={setMonthlyContribution}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Amount added to retirement savings each month."
                />
              </div>
            </SubSection>

            <SubSection title="Retirement Income Goal">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="desired-income"
                  label="Desired Annual Income"
                  value={desiredIncome}
                  onChange={setDesiredIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Pre-tax income you want each year of retirement, in today's dollars."
                />
                <CompactInput
                  id="retirement-years"
                  label="Retirement Length"
                  value={retirementYears}
                  onChange={setRetirementYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="How many years the corpus must fund."
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
                  <SubSection title="Returns, Inflation & Other Income">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="pre-return"
                        label="Return Before Retirement"
                        value={preRetirementReturn}
                        onChange={setPreRetirementReturn}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Assumed annual return while accumulating."
                      />
                      <CompactInput
                        id="post-return"
                        label="Return After Retirement"
                        value={postRetirementReturn}
                        onChange={setPostRetirementReturn}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Assumed annual return while withdrawing."
                      />
                      <CompactInput
                        id="other-income"
                        label="Other Annual Income"
                        value={otherIncome}
                        onChange={setOtherIncome}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Social Security or pension income that offsets the target."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation Rate"
                        value={inflationRate}
                        onChange={setInflationRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Applied to both the income goal and each withdrawal year."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Projected Savings at Retirement
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.projectedSavings, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.onTrack
                  ? `Ahead of the $${fmt(results.requiredCorpus, 0)} target for your income goal`
                  : `Short of the $${fmt(results.requiredCorpus, 0)} needed — gap of $${fmt(results.gap, 0)}`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Required Corpus</span>
                <span className="font-extrabold text-foreground">${fmt(results.requiredCorpus, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Funded Ratio</span>
                <span className="font-extrabold text-foreground">{fmt(results.fundedRatio, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extra Monthly Needed</span>
                <span className={`font-extrabold ${results.onTrack ? "text-emerald-600" : "text-red-600"}`}>
                  ${fmt(results.additionalMonthly, 0)}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Target Line</th>
                    <th className="p-2.5 text-right w-[150px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Corpus needed at retirement</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.requiredCorpus, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">target</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Projected savings</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.projectedSavings, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">current path</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Gap to close</td>
                    <td className={`p-2.5 text-right font-semibold ${results.onTrack ? "text-emerald-600" : "text-red-600"}`}>
                      ${fmt(results.gap, 0)}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">over {fmt(results.monthsToRetirement, 0)} months</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Income first year of retirement</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.needAtRetirement, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">inflated</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Monthly contribution required</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalMonthlyNeeded, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">from today</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Income from projected savings at 4%</td>
                    <td className="p-2.5 text-right text-emerald-600">${fmt(results.incomeFromProjected, 0)}</td>
                    <td className={`p-2.5 pr-3 text-right ${results.onTrack ? "text-emerald-600" : "text-amber-600"}`}>
                      {results.onTrack ? "sufficient" : "below goal"}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Years to Retirement</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.yearsToRetirement, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Current Monthly Saving</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.monthlyContribution, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Need From Today</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalMonthlyNeeded, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Replacement Ratio</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.replacementRatio, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Real Return Before Retirement</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.realReturn, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Funding Status</span>
                  <span className={`text-base font-bold ${results.onTrack ? "text-emerald-600" : "text-red-600"}`}>
                    {results.onTrack ? "On track" : "Contribution gap"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Retirement Savings Target Calculator?</h2>
            <p>
              A retirement savings target calculator tells you how much you need to have accumulated by the day you stop
              working, and how much to save each month to get there. It works from both ends at once: projecting your
              current savings and contributions forward at an assumed return, and discounting the income you want back to
              the retirement date to find the corpus that funds it.
            </p>
            <p>
              The two numbers rarely match on the first try, and that is the point. The gap between them, expressed as an
              additional monthly contribution, turns a vague worry about retirement into a specific, adjustable figure.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The accumulation phase compounds month by month: the existing balance grows at the pre-retirement return
              and each contribution is added at the end of the month. The result is the projected balance at retirement.
              Separately, the income you want is reduced by other guaranteed income, then inflated to the retirement year
              so it is stated in the dollars that will actually be needed then.
            </p>
            <p>
              That inflation-adjusted income is then discounted back to the retirement date using the post-retirement
              return, one year at a time, because each year of retirement income is itself growing with inflation. The sum
              of those discounted amounts is the required corpus. Subtracting projected savings from the corpus gives the
              gap, and dividing the gap by the future value of a monthly annuity gives the extra monthly contribution.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows projected savings at retirement next to the corpus you need. The three-stat bar
              reports the required corpus, the funded ratio and the additional monthly contribution, and the table walks
              through each line from the target corpus to the income your current path supports.
            </p>
            <p>
              Read the funded ratio carefully. Ninety percent funded sounds close, but the last ten percent is often the
              hardest, because it is funded entirely by future contributions over fewer remaining years. The additional
              monthly figure tells you the true size of the fix, and it is usually smaller than people fear — a few
              hundred dollars a month starting early can close a gap that looks enormous in lump-sum terms.
            </p>
            <p>
              Finally, remember that this is a projection built on assumptions, not a forecast. Returns will not arrive
              evenly, and inflation will not be constant. The value of running it is behavioral: seeing the gap now, while
              there are still decades to compound, is what makes the required contribution affordable rather than
              impossible. Revisit the numbers yearly and adjust, because small course corrections early are far cheaper
              than large ones later. Two habits make the gap easier to close: raise the contribution whenever income rises,
              so the increase is absorbed before it becomes lifestyle spending, and treat any windfall as a direct deposit
              into retirement savings rather than as a temporary raise. Together they routinely bridge shortfalls that look
              intimidating when measured in today's dollars, because both add money in the years when it has the longest
              possible time to compound.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/retirement-savings-target-calculator" />
          <PopularCalculators exclude="/calculator/retirement-savings-target-calculator" />
        </div>
      </div>
    </>
  );
}
