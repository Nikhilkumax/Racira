"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface LumpSumInputs {
  amount: number;
  expectedReturn: number;
  years: number;
  delayMonths: number;
  expenseRatio: number;
  inflation: number;
  taxRate: number;
}

const DEFAULTS: LumpSumInputs = {
  amount: 50000,
  expectedReturn: 7,
  years: 20,
  delayMonths: 12,
  expenseRatio: 0.1,
  inflation: 2.5,
  taxRate: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface LumpRow {
  year: number;
  investedNow: number;
  investedLater: number;
  difference: number;
}

interface LumpResult {
  valid: boolean;
  errorMsg: string;
  netReturn: number;
  terminalValue: number;
  delayedValue: number;
  costOfWaiting: number;
  costPerMonth: number;
  growth: number;
  growthShare: number;
  realValue: number;
  afterTaxValue: number;
  afterTaxGain: number;
  doublingTime: number;
  effectiveYears: number;
  rows: LumpRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: LumpSumInputs): LumpResult {
  const amount = Math.max(0, i.amount);
  const years = Math.max(0.5, i.years);
  const delayMonths = Math.max(0, i.delayMonths);
  const delayYears = Math.min(delayMonths / 12, years);
  const netReturn = i.expectedReturn - Math.max(0, i.expenseRatio);
  const r = netReturn / 100;
  const effectiveYears = years - delayYears;

  const terminalValue = amount * Math.pow(1 + r, years);
  const delayedValue = delayYears < years ? amount * Math.pow(1 + r, effectiveYears) : amount;
  const costOfWaiting = terminalValue - delayedValue;
  const growth = terminalValue - amount;
  const realValue = terminalValue / Math.pow(1 + Math.max(0, i.inflation) / 100, years);
  const afterTaxGain = Math.max(0, growth) * (Math.max(0, i.taxRate) / 100);
  const afterTaxValue = terminalValue - afterTaxGain;

  const rows: LumpRow[] = [];
  for (let year = 1; year <= Math.min(30, Math.ceil(years)); year++) {
    const investedNow = amount * Math.pow(1 + r, year);
    const laterYears = year - delayYears;
    const investedLater = laterYears > 0 ? amount * Math.pow(1 + r, laterYears) : 0;
    rows.push({ year, investedNow, investedLater, difference: investedNow - investedLater });
  }

  const valid =
    i.amount > 0 &&
    i.expectedReturn > -50 &&
    i.expectedReturn < 50 &&
    i.years > 0 &&
    i.delayMonths >= 0 &&
    i.expenseRatio >= 0 &&
    i.expenseRatio <= 10 &&
    i.inflation >= 0 &&
    i.inflation <= 25 &&
    i.taxRate >= 0 &&
    i.taxRate <= 60;
  const errorMsg = valid
    ? ""
    : "Enter a positive amount and holding period, a return between -50% and 50%, non-negative fees and delay, an inflation rate up to 25% and a tax rate up to 60%.";

  return {
    valid,
    errorMsg,
    netReturn,
    terminalValue,
    delayedValue,
    costOfWaiting,
    costPerMonth: delayMonths > 0 ? costOfWaiting / delayMonths : 0,
    growth,
    growthShare: terminalValue > 0 ? (growth / terminalValue) * 100 : 0,
    realValue,
    afterTaxValue,
    afterTaxGain,
    doublingTime: netReturn > 0 ? Math.log(2) / Math.log(1 + netReturn / 100) : 0,
    effectiveYears,
    rows,
    summary: [
      { label: "Lump Sum", value: money2(amount) },
      { label: "Expected Return", value: fmt(i.expectedReturn, 2) + "%" },
      { label: "Net of Fees", value: fmt(netReturn, 2) + "%" },
      { label: "Holding Period", value: fmt(years, 1) + " yr" },
      { label: "Invested Immediately", value: money(terminalValue), tone: "text-primary" },
      { label: "Invested After Delay", value: money(delayedValue) },
      { label: "Cost of Waiting", value: money(costOfWaiting), tone: "text-destructive" },
      { label: "Cost per Month Delayed", value: money(delayMonths > 0 ? costOfWaiting / delayMonths : 0), tone: "text-destructive" },
      { label: "Delay", value: delayMonths + " months" },
      { label: "Effective Investing Years", value: fmt(effectiveYears, 2) },
      { label: "Total Growth", value: money(growth), tone: "text-emerald-600" },
      { label: "Growth Share of Result", value: fmt(terminalValue > 0 ? (growth / terminalValue) * 100 : 0, 2) + "%" },
      { label: "Value in Today's Dollars", value: money(realValue) },
      { label: "After-Tax Value", value: money(afterTaxValue) },
      { label: "Tax on Gain", value: money(afterTaxGain), tone: "text-destructive" },
      { label: "Years to Double", value: netReturn > 0 ? fmt(Math.log(2) / Math.log(1 + netReturn / 100), 2) : "—" },
      { label: "Multiple of Money", value: fmt(terminalValue / Math.max(amount, 1), 2) + "x" },
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

export default function LumpSumInvestmentCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [delayMonths, setDelayMonths] = useState(String(DEFAULTS.delayMonths));
  const [expenseRatio, setExpenseRatio] = useState(String(DEFAULTS.expenseRatio));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): LumpSumInputs => ({
    amount: parseFloat(amount) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    years: parseFloat(years) || 0,
    delayMonths: parseFloat(delayMonths) || 0,
    expenseRatio: parseFloat(expenseRatio) || 0,
    inflation: parseFloat(inflation) || 0,
    taxRate: parseFloat(taxRate) || 0,
  });

  const [results, setResults] = useState<LumpResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setYears(String(DEFAULTS.years));
    setDelayMonths(String(DEFAULTS.delayMonths));
    setExpenseRatio(String(DEFAULTS.expenseRatio));
    setInflation(String(DEFAULTS.inflation));
    setTaxRate(String(DEFAULTS.taxRate));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a lump sum investment?",
      answer:
        "It is a single, one-off investment of capital rather than a series of regular contributions. Lump sums come from proceeds of a sale, a bonus, an inheritance or a maturing deposit. Because the whole amount is invested from day one, a lump sum compounds on the largest possible base, which is why delaying it even for a few months has a measurable cost over a long horizon.",
    },
    {
      question: "How much does delaying an investment actually cost?",
      answer:
        "More than intuition suggests. On a $50,000 lump sum earning 6.9% net, the first year's growth forgone is about $3,450 — but because that money never compounds, the cost over a twenty-year horizon is roughly $12,200, over $1,000 for every month of delay. The cost per month figure in the results turns that into a concrete number, and it grows with the expected return and the length of the remaining horizon.",
    },
    {
      question: "Is investing a lump sum all at once better than spreading it out?",
      answer:
        "Historically, yes, most of the time. Markets rise more often than they fall, so cash invested earlier is exposed to more of that upward drift, and studies generally find lump-sum investing beats staged investing in roughly two-thirds of periods. The exception is behavioural: if investing everything at once makes you so anxious that you sell after the first drawdown, spreading the entry over a few months is the better plan for you.",
    },
    {
      question: "How do fees and inflation affect the result?",
      answer:
        "The expense ratio reduces the return every year, so it compounds against you exactly as the return compounds for you; over twenty years a 0.5% fee takes a noticeable slice of the terminal value. Inflation does not reduce the account balance but reduces what it buys, so the real value figure — the nominal balance discounted by inflation — is the number to compare against today's prices. Tax is applied to the gain at the end if the account is taxable.",
    },
    {
      question: "Should I wait for a market dip before investing?",
      answer:
        "That is the most expensive form of delay, because it requires being right twice: you must know that prices will fall and know when they will recover. Time out of the market also removes the dividends and compounding the money would have earned. The cost-of-waiting figure shows what a planned delay of a fixed number of months costs; waiting for a dip adds an unpredictable delay on top of that, which no calculator can bound.",
    },
    {
      question: "What return assumption should I use?",
      answer:
        "For a diversified portfolio, a long-run nominal figure in the 5–8% range is a reasonable planning assumption, with the exact number depending on the asset mix and on valuations at the time of investing. Whatever you choose, test the sensitivity: moving the expected return by two points changes the terminal value by a large fraction over multi-decade horizons, because compounding amplifies both directions.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Lump Sum Investment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lump Sum Investment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Lump Sum"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="The one-off amount available to invest."
                />
                <CompactInput
                  id="expected-return"
                  label="Expected Return"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-50"
                  max="50"
                  step="0.1"
                  tooltip="Annual nominal return before fees."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="0.5"
                  max="60"
                  step="1"
                  tooltip="How long the money stays invested."
                />
                <CompactInput
                  id="delay-months"
                  label="Delay Before Investing"
                  value={delayMonths}
                  onChange={setDelayMonths}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="0"
                  max="120"
                  step="1"
                  tooltip="How long the money sits uninvested before it is put to work."
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
                  <SubSection title="Costs & Tax">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="expense-ratio"
                        label="Expense Ratio"
                        value={expenseRatio}
                        onChange={setExpenseRatio}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="10"
                        step="0.05"
                        tooltip="Annual fund cost, subtracted from the expected return."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation"
                        value={inflation}
                        onChange={setInflation}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="25"
                        step="0.1"
                        tooltip="Used to restate the ending balance in today's purchasing power."
                      />
                      <CompactInput
                        id="tax-rate"
                        label="Tax Rate on Gain"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="60"
                        step="1"
                        tooltip="Combined rate applied to the gain at the end; set 0 for a tax-advantaged account."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The comparison holds everything constant except timing: one path invests today and one path invests after
                      the delay you set, both ending on the same date. The difference is the cost of waiting. Growth is the
                      terminal value minus the original lump sum; the real value discounts the result by inflation, and tax is
                      charged on the nominal gain at the end.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Value at the End</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.terminalValue)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.costOfWaiting)} lost to waiting · {money(results.growth)} of growth on the original lump sum
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">If Delayed</span>
                <span className="font-extrabold text-destructive">{money(results.delayedValue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Month</span>
                <span className="font-extrabold text-destructive">{money(results.costPerMonth)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Real Value</span>
                <span className="font-extrabold text-emerald-600">{money(results.realValue)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[130px]">Invested Now</th>
                    <th className="p-2.5 text-right w-[130px]">Invested Later</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.investedNow)}</td>
                      <td className="p-2.5 text-right text-foreground">{row.investedLater > 0 ? money(row.investedLater) : "—"}</td>
                      <td className="p-2.5 pr-3 text-right text-destructive">{money(row.difference)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">End of period</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.terminalValue)}</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.delayedValue)}</td>
                    <td className="p-2.5 pr-3 text-right text-destructive">{money(results.costOfWaiting)}</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Lump Sum Investment Calculator?</h2>
            <p>
              A lump sum investment calculator projects the future value of a single deposit and, just as usefully, prices
              the delay before it is invested. The first question — what will this become — is standard compound growth. The
              second — what does it cost to wait — is the one that changes behaviour, because the answer is usually larger
              than people expect and it is entirely avoidable.
            </p>
            <p>
              The tool compares two paths with identical assumptions: one invests today and one invests after a delay you
              choose, both measured on the same future date. The gap between them is the cost of waiting, expressed in total
              dollars and per month of delay. It also reports the real, inflation-adjusted result and the after-tax value, so
              the projection can be read in the terms that matter for spending.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The invested-now path compounds the lump sum at the expected return less any expense ratio for the whole
              holding period. The delayed path compounds for the same period minus the delay. In the default scenario,
              $50,000 at 6.9% net over twenty years grows to about $190,000 if invested immediately, and roughly $178,000 if
              invested twelve months later — a cost of waiting near $12,200, or about $1,020 for every month of delay.
            </p>
            <p>
              The table makes the mechanism visible. In the early years the two balances are close together, and the
              difference is small enough to dismiss. By the final years the gap has widened substantially, because the delayed
              path permanently lost a year of compounding at the start — the money that was not invested could not earn
              anything, and the growth it would have generated never had a chance to compound further.
            </p>
            <p>
              The remaining outputs adapt the projection to real life. The real value divides the terminal balance by
              compounded inflation, showing what it will buy in today&apos;s terms. The after-tax value applies the tax rate
              to the gain, which matters for taxable accounts and is the reason a large gain can look smaller after the tax
              bill is counted. The doubling time and multiple-of-money figures give quick intuition for how many times the
              capital multiplies.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the terminal value with the cost of waiting and the total growth earned. The three
              statistics beside it give the delayed-path value, the monthly cost of delay and the real value in today&apos;s
              dollars. Summary Statistics collects the return net of fees, the effective investing years, the growth share of
              the final balance, the tax on the gain, the multiple of money and the doubling time.
            </p>
            <p>
              The most useful way to read the output is as a decision aid rather than a prediction. If the money is available
              and the plan is long-term, the cost of waiting is a real, unavoidable transfer of wealth away from you. If the
              delay is unavoidable — a house sale settling in three months, a bonus vesting next year — the same figure tells
              you what that delay is worth and lets you plan around it instead of being surprised by it.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lump-sum-investment-calculator" />
          <PopularCalculators exclude="/calculator/lump-sum-investment-calculator" />
        </div>
      </div>
    </>
  );
}
