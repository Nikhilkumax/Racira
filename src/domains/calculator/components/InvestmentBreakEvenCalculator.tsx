"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BreakEvenInputs {
  amount: number;
  load: number;
  feeRate: number;
  grossReturn: number;
  exitFee: number;
  taxDrag: number;
}

const DEFAULTS: BreakEvenInputs = {
  amount: 25000,
  load: 2,
  feeRate: 1.2,
  grossReturn: 7,
  exitFee: 0.5,
  taxDrag: 0.3,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const duration = (years: number) => {
  if (!Number.isFinite(years)) return "Never";
  const totalMonths = Math.max(0, Math.round(years * 12));
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y === 0) return `${m} mo`;
  return `${y} yr ${m} mo`;
};

interface YearRow {
  year: number;
  value: number;
  fees: number;
  netProceeds: number;
  versusOriginal: number;
}

interface BreakEvenResult {
  valid: boolean;
  errorMsg: string;
  invested: number;
  netReturn: number;
  breakEvenYears: number;
  breakEvenLabel: string;
  reachable: boolean;
  requiredMultiple: number;
  firstYearFee: number;
  feesAtBreakEven: number;
  costAtBreakEven: number;
  valueAt5: number;
  valueAt10: number;
  annualFeeShare: number;
  rows: YearRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: BreakEvenInputs): BreakEvenResult {
  const amount = Math.max(0, i.amount);
  const load = Math.min(50, Math.max(0, i.load));
  const exitFee = Math.min(20, Math.max(0, i.exitFee));
  const invested = amount * (1 - load / 100);
  const netReturn = i.grossReturn - i.feeRate - Math.max(0, i.taxDrag);
  const requiredMultiple = invested > 0 ? amount / (invested * (1 - exitFee / 100)) : Number.POSITIVE_INFINITY;

  let breakEvenYears = 0;
  let reachable = true;
  if (requiredMultiple <= 1) {
    breakEvenYears = 0;
  } else if (netReturn <= 0) {
    reachable = false;
    breakEvenYears = Number.POSITIVE_INFINITY;
  } else {
    breakEvenYears = Math.log(requiredMultiple) / Math.log(1 + netReturn / 100);
  }

  const rows: YearRow[] = [];
  const horizon = reachable && Number.isFinite(breakEvenYears) ? Math.min(40, Math.ceil(breakEvenYears) + 2) : 10;
  for (let year = 1; year <= horizon; year++) {
    const value = invested * Math.pow(1 + netReturn / 100, year);
    const fees = amount * (Math.pow(1 + i.grossReturn / 100, year) - Math.pow(1 + netReturn / 100, year));
    const netProceeds = value * (1 - exitFee / 100);
    rows.push({ year, value, fees, netProceeds, versusOriginal: netProceeds - amount });
  }

  const feesAtBreakEven = Number.isFinite(breakEvenYears)
    ? amount * (Math.pow(1 + i.grossReturn / 100, breakEvenYears) - Math.pow(1 + netReturn / 100, breakEvenYears))
    : 0;
  const costAtBreakEven = reachable
    ? amount - netProceedsFormula(invested, netReturn, breakEvenYears, exitFee)
    : Number.NaN;

  const valid =
    i.amount > 0 &&
    i.load >= 0 &&
    i.load <= 50 &&
    i.feeRate >= 0 &&
    i.feeRate <= 10 &&
    i.grossReturn > -50 &&
    i.grossReturn < 50 &&
    i.exitFee >= 0 &&
    i.exitFee <= 20 &&
    i.taxDrag >= 0 &&
    i.taxDrag <= 10;
  const errorMsg = valid
    ? ""
    : "Enter a positive amount, a load up to 50%, fees within plausible ranges, a gross return between -50% and 50%, and non-negative exit fee and tax drag.";

  return {
    valid,
    errorMsg,
    invested,
    netReturn,
    breakEvenYears,
    breakEvenLabel: breakEvenYears === 0 ? "Immediate" : duration(breakEvenYears),
    reachable,
    requiredMultiple,
    firstYearFee: invested * (i.feeRate / 100) + invested * (Math.max(0, i.taxDrag) / 100),
    feesAtBreakEven,
    costAtBreakEven,
    valueAt5: invested * Math.pow(1 + netReturn / 100, 5),
    valueAt10: invested * Math.pow(1 + netReturn / 100, 10),
    annualFeeShare: i.grossReturn > 0 ? ((i.feeRate + Math.max(0, i.taxDrag)) / i.grossReturn) * 100 : 0,
    rows,
    summary: [
      { label: "Amount Deposited", value: money2(amount) },
      { label: "Amount Invested", value: money2(invested), tone: "text-destructive" },
      { label: "Upfront Load Cost", value: money(amount - invested) },
      { label: "Gross Return", value: fmt(i.grossReturn, 2) + "%" },
      { label: "Annual Fee + Tax Drag", value: fmt(i.feeRate + Math.max(0, i.taxDrag), 2) + "%" },
      { label: "Net Return", value: fmt(netReturn, 2) + "%", tone: "text-primary" },
      { label: "Years to Break Even", value: breakEvenYears === 0 ? "Immediate" : reachable ? duration(breakEvenYears) : "Never", tone: reachable ? "text-emerald-600" : "text-destructive" },
      { label: "Multiple of Capital Needed", value: Number.isFinite(requiredMultiple) ? fmt(requiredMultiple, 4) + "x" : "—" },
      { label: "First-Year Fees", value: money2(invested * (i.feeRate / 100) + invested * (Math.max(0, i.taxDrag) / 100)) },
      { label: "Fees Paid by Break-Even", value: Number.isFinite(feesAtBreakEven) ? money(feesAtBreakEven) : "—", tone: "text-destructive" },
      { label: "Total Cost to Get Whole", value: Number.isFinite(costAtBreakEven) ? money(Math.max(0, costAtBreakEven)) : "—" },
      { label: "Balance After 5 Years", value: money(invested * Math.pow(1 + netReturn / 100, 5)) },
      { label: "Balance After 10 Years", value: money(invested * Math.pow(1 + netReturn / 100, 10)) },
      { label: "Fees as Share of Gross", value: fmt(i.grossReturn > 0 ? ((i.feeRate + Math.max(0, i.taxDrag)) / i.grossReturn) * 100 : 0, 1) + "%", tone: "text-destructive" },
      { label: "Exit Fee", value: fmt(exitFee, 2) + "%" },
      { label: "Reachable", value: reachable ? "Yes" : "No", tone: reachable ? "text-emerald-600" : "text-destructive" },
    ],
  };
}

function netProceedsFormula(invested: number, netReturn: number, years: number, exitFee: number): number {
  if (!Number.isFinite(years) || netReturn <= -100) return 0;
  return invested * Math.pow(1 + netReturn / 100, years) * (1 - exitFee / 100);
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

export default function InvestmentBreakEvenCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [load, setLoad] = useState(String(DEFAULTS.load));
  const [feeRate, setFeeRate] = useState(String(DEFAULTS.feeRate));
  const [grossReturn, setGrossReturn] = useState(String(DEFAULTS.grossReturn));
  const [exitFee, setExitFee] = useState(String(DEFAULTS.exitFee));
  const [taxDrag, setTaxDrag] = useState(String(DEFAULTS.taxDrag));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BreakEvenInputs => ({
    amount: parseFloat(amount) || 0,
    load: parseFloat(load) || 0,
    feeRate: parseFloat(feeRate) || 0,
    grossReturn: parseFloat(grossReturn) || 0,
    exitFee: parseFloat(exitFee) || 0,
    taxDrag: parseFloat(taxDrag) || 0,
  });

  const [results, setResults] = useState<BreakEvenResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setLoad(String(DEFAULTS.load));
    setFeeRate(String(DEFAULTS.feeRate));
    setGrossReturn(String(DEFAULTS.grossReturn));
    setExitFee(String(DEFAULTS.exitFee));
    setTaxDrag(String(DEFAULTS.taxDrag));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What does break-even mean for an investment?",
      answer:
        "It means the point at which the money you would receive by selling — after every entry charge, annual fee, tax and exit cost — is worth what you originally deposited. Before that point the investment has not made you whole, no matter what the account statement says about returns: costs are charged on the balance, so a positive reported return can coexist with a loss relative to your original capital.",
    },
    {
      question: "Why does the break-even take years instead of months?",
      answer:
        "Because the costs compound against you while the return compounds for you, and the fee applies every year to the whole balance. In the default case a 2% entry load, a 1.2% annual fee and a 0.3% tax drag reduce a 7% gross return to 5.5% net, and the load means only 98% of the deposit is invested — so the portfolio must grow about 3.6% before the investor is even, which takes roughly eight months. Larger fees push the break-even out substantially.",
    },
    {
      question: "What happens if the net return is negative?",
      answer:
        "Then there is no break-even at any horizon. If the annual fee and tax drag together exceed the gross return, the balance shrinks every year and the shortfall only widens; the calculator reports that the break-even is unreachable rather than returning a meaningless number. This matters for products sold with high fees relative to conservative return expectations — a bond fund charging 1.5% against a 3% yield is a quarter gone before tax.",
    },
    {
      question: "Should I count tax in a break-even calculation?",
      answer:
        "If the money is in a taxable account, yes, because tax on distributions reduces the compounding balance each year just as a fee does. If the account is tax-advantaged, set the tax drag to zero. Deferred gains that you have not sold are a different matter: this calculator measures the break-even if you sold at that point, which is the conservative reading and the right one for comparing where to put money.",
    },
    {
      question: "How does the result change with a longer holding period?",
      answer:
        "The break-even year itself is fixed by the cost structure and the return, but the significance of the costs grows with time. Once you are past break-even, every additional year of compounding works on a balance the fees have already reduced, so a small annual fee difference produces a large terminal difference over several decades. That is why long-horizon investors are the most sensitive to expense ratios.",
    },
    {
      question: "Is break-even the same as the payback period?",
      answer:
        "They are close cousins. Payback period is used for projects with cash flows and measures how long until cumulative cash covers the outlay; break-even here measures how long until the after-cost market value covers the deposit. Both express the same idea — how long until you are whole again — and both are sensitive to the return assumption, which is why the calculator reports the fee share of gross return alongside the years.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Investment Break-Even Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Investment Break-Even Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment & Costs">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Amount Deposited"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="The full amount handed over, including any front-end charge."
                />
                <CompactInput
                  id="load"
                  label="Entry Load"
                  value={load}
                  onChange={setLoad}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="50"
                  step="0.1"
                  tooltip="Front-end charge deducted before anything is invested."
                />
                <CompactInput
                  id="fee-rate"
                  label="Annual Fee"
                  value={feeRate}
                  onChange={setFeeRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="10"
                  step="0.05"
                  tooltip="Ongoing charge deducted from the balance each year."
                />
                <CompactInput
                  id="gross-return"
                  label="Gross Return"
                  value={grossReturn}
                  onChange={setGrossReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-50"
                  max="50"
                  step="0.1"
                  tooltip="Market return before fees and tax; the portfolio earns this rate each year."
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
                  <SubSection title="Exit Costs & Tax">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="exit-fee"
                        label="Exit Fee"
                        value={exitFee}
                        onChange={setExitFee}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.1"
                        tooltip="Redemption charge on proceeds at sale."
                      />
                      <CompactInput
                        id="tax-drag"
                        label="Annual Tax Drag"
                        value={taxDrag}
                        onChange={setTaxDrag}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="10"
                        step="0.05"
                        tooltip="Annual cost of taxes on distributions; set 0 in a tax-advantaged account."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The break-even horizon is the point at which the balance, after the exit fee, equals the original
                      deposit again. It is solved directly from the compound growth equation because the exit fee scales with
                      the balance. If the net return — gross return less the annual fee and tax drag — is zero or negative, the
                      horizon does not exist and the tool says so.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Break-Even Holding Period</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{results.breakEvenLabel}</div>
              <div className="text-sm text-muted-foreground font-medium">
                at a {fmt(results.netReturn, 2)}% net return · cost of getting whole{" "}
                {Number.isFinite(results.costAtBreakEven) ? money(Math.max(0, results.costAtBreakEven)) : "—"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Amount Invested</span>
                <span className="font-extrabold text-foreground">{money(results.invested)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fees by Break-Even</span>
                <span className="font-extrabold text-destructive">
                  {Number.isFinite(results.feesAtBreakEven) ? money(results.feesAtBreakEven) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fees vs Gross</span>
                <span className="font-extrabold text-destructive">{fmt(results.annualFeeShare, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[115px]">Value</th>
                    <th className="p-2.5 text-right w-[115px]">Fees Paid</th>
                    <th className="p-2.5 text-right w-[130px]">Net If Sold</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">vs. Original</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.value)}</td>
                      <td className="p-2.5 text-right text-destructive">{money(row.fees)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.netProceeds)}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.versusOriginal >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {money(row.versusOriginal)}
                      </td>
                    </tr>
                  ))}
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
            <h2 className="text-2xl font-bold mb-3">What Is an Investment Break-Even Calculator?</h2>
            <p>
              An investment break-even calculator works out how long an investment must be held before its after-cost sale
              value equals the amount originally deposited. It is a different question from &quot;what return does it
              need&quot;, because the answer depends on time as well as return, and on a set of costs that are charged in
              different ways: an entry load takes a slice up front, annual fees take a slice every year, tax takes a slice of
              distributions, and an exit fee takes a slice when you sell.
            </p>
            <p>
              The distinction matters because a positive reported return is not the same as being ahead. A fund that reports
              5% may still leave an investor worse off than the day they invested if a load reduced the amount put to work and
              the fees compound against the balance. Break-even is the honest benchmark for &quot;has this done anything for
              me yet?&quot;.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator reduces the deposit by the entry load to get the amount actually invested, then reduces the gross
              return by the annual fee and tax drag to get the net return the portfolio compounds at. The exit fee scales with
              the balance, so the required multiple to get whole is the original deposit divided by the invested amount net of
              the exit fee. The break-even horizon is the logarithm of that multiple divided by the logarithm of one plus the
              net return.
            </p>
            <p>
              In the default case, a 2% load leaves $24,500 invested from a $25,000 deposit, and the 0.5% exit fee means the
              balance only has to reach about $25,126 to be even — a multiple of 1.0256. At a net return of 5.5% a year that
              takes roughly six months, and the fees paid along the way are small because the balance is still small. Stretch
              the horizon out and the same fee rates extract much more: fees are charged on the whole balance every year.
            </p>
            <p>
              The year-by-year table is the part that makes the cost structure concrete. It shows the balance, the cumulative
              fees paid and what you would actually keep if you sold that year, alongside the difference from your original
              deposit. The row where that difference turns positive is the break-even, and everything after it is genuine
              profit.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card gives the break-even period in years and months with the net return it assumes and the dollar
              cost of getting whole. The three statistics beside it show the amount actually invested, the fees paid by the
              break-even point, and the share of the gross return that fees and tax consume each year. That last figure is
              often the most sobering: if fees take 20% of the return every year, the investor keeps four-fifths of a return
              they took the full risk to earn.
            </p>
            <p>
              Summary Statistics adds the upfront load cost in dollars, the multiple of capital required, the first-year fee,
              the value after five and ten years, and whether a break-even horizon exists at all. A useful experiment is to
              raise the annual fee by half a point and watch the break-even date move: with higher fees the invested capital
              has to work harder just to stand still, and the value after ten years falls noticeably even though the gross
              return is unchanged.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-break-even-calculator" />
          <PopularCalculators exclude="/calculator/investment-break-even-calculator" />
        </div>
      </div>
    </>
  );
}
