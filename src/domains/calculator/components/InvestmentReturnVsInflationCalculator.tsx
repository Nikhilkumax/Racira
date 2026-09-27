"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RealInputs {
  investment: number;
  nominalReturn: number;
  inflation: number;
  years: number;
  taxRate: number;
  contribution: number;
  expenseRatio: number;
}

const DEFAULTS: RealInputs = {
  investment: 50000,
  nominalReturn: 6,
  inflation: 3,
  years: 15,
  taxRate: 20,
  contribution: 0,
  expenseRatio: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface RealRow {
  year: number;
  nominal: number;
  real: number;
  inflationCost: number;
}

interface RealResult {
  valid: boolean;
  errorMsg: string;
  netReturn: number;
  realReturn: number;
  nominalTerminal: number;
  realTerminal: number;
  afterTaxNominal: number;
  afterTaxReal: number;
  totalGain: number;
  purchasingPowerOnly: number;
  inflationTax: number;
  inflationShare: number;
  growthShare: number;
  breakEvenReturn: number;
  totalInvested: number;
  rows: RealRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: RealInputs): RealResult {
  const investment = Math.max(0, i.investment);
  const years = Math.max(1, Math.round(i.years));
  const contribution = Math.max(0, i.contribution);
  const netReturn = i.nominalReturn - Math.max(0, i.expenseRatio);
  const r = netReturn / 100;
  const inf = Math.max(0, i.inflation) / 100;
  const taxRate = Math.max(0, Math.min(60, i.taxRate)) / 100;

  let balance = investment;
  const rows: RealRow[] = [];
  for (let year = 1; year <= years; year++) {
    balance = balance * (1 + r) + contribution;
    const real = balance / Math.pow(1 + inf, year);
    rows.push({
      year,
      nominal: balance,
      real,
      inflationCost: balance - real,
    });
  }

  const nominalTerminal = balance;
  const totalInvested = investment + contribution * years;
  const realTerminal = nominalTerminal / Math.pow(1 + inf, years);
  const afterTaxNominal = nominalTerminal - Math.max(0, nominalTerminal - totalInvested) * taxRate;
  const afterTaxReal = afterTaxNominal / Math.pow(1 + inf, years);
  const totalGain = nominalTerminal - totalInvested;
  const purchasingPowerOnly = totalInvested * (Math.pow(1 + inf, years) - 1);
  const realReturn = ((1 + r) / (1 + inf) - 1) * 100;

  const valid =
    i.investment >= 0 &&
    i.nominalReturn > -50 &&
    i.nominalReturn < 50 &&
    i.inflation >= 0 &&
    i.inflation <= 25 &&
    i.years > 0 &&
    i.taxRate >= 0 &&
    i.taxRate <= 60 &&
    i.contribution >= 0 &&
    i.expenseRatio >= 0 &&
    i.expenseRatio <= 10;
  const errorMsg = valid
    ? ""
    : "Enter non-negative amounts and fees, an inflation rate up to 25%, a nominal return between -50% and 50%, and a tax rate up to 60%.";

  return {
    valid,
    errorMsg,
    netReturn,
    realReturn,
    nominalTerminal,
    realTerminal,
    afterTaxNominal,
    afterTaxReal,
    totalGain,
    purchasingPowerOnly,
    inflationTax: nominalTerminal - realTerminal,
    inflationShare: nominalTerminal > 0 ? ((nominalTerminal - realTerminal) / nominalTerminal) * 100 : 0,
    growthShare: nominalTerminal > 0 ? (Math.max(0, totalGain) / nominalTerminal) * 100 : 0,
    breakEvenReturn: i.inflation + Math.max(0, i.expenseRatio),
    totalInvested,
    rows,
    summary: [
      { label: "Total Invested", value: money(totalInvested) },
      { label: "Nominal Return", value: fmt(netReturn, 2) + "%" },
      { label: "Inflation", value: fmt(i.inflation, 2) + "%" },
      { label: "Real Return", value: fmt(realReturn, 2) + "%", tone: realReturn >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Nominal Ending Value", value: money(nominalTerminal) },
      { label: "Real Ending Value", value: money(realTerminal), tone: "text-primary" },
      { label: "Purchasing Power Erosion", value: money(nominalTerminal - realTerminal), tone: "text-destructive" },
      { label: "Erosion as % of Nominal", value: fmt(nominalTerminal > 0 ? ((nominalTerminal - realTerminal) / nominalTerminal) * 100 : 0, 2) + "%" },
      { label: "Nominal Gain", value: money(totalGain) },
      { label: "Gain Needed Just for Inflation", value: money(purchasingPowerOnly) },
      { label: "After-Tax Nominal", value: money(afterTaxNominal) },
      { label: "After-Tax Real", value: money(afterTaxReal), tone: "text-emerald-600" },
      { label: "Tax Rate on Gains", value: fmt(i.taxRate, 2) + "%" },
      { label: "Break-Even Return", value: fmt(i.inflation + Math.max(0, i.expenseRatio), 2) + "%" },
      { label: "Return Above Inflation", value: fmt(netReturn - i.inflation, 2) + " pp" },
      { label: "Growth Share of Ending Value", value: fmt(nominalTerminal > 0 ? (Math.max(0, totalGain) / nominalTerminal) * 100 : 0, 2) + "%" },
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

export default function InvestmentReturnVsInflationCalculator() {
  const [investment, setInvestment] = useState(String(DEFAULTS.investment));
  const [nominalReturn, setNominalReturn] = useState(String(DEFAULTS.nominalReturn));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [contribution, setContribution] = useState(String(DEFAULTS.contribution));
  const [expenseRatio, setExpenseRatio] = useState(String(DEFAULTS.expenseRatio));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RealInputs => ({
    investment: parseFloat(investment) || 0,
    nominalReturn: parseFloat(nominalReturn) || 0,
    inflation: parseFloat(inflation) || 0,
    years: parseFloat(years) || 0,
    taxRate: parseFloat(taxRate) || 0,
    contribution: parseFloat(contribution) || 0,
    expenseRatio: parseFloat(expenseRatio) || 0,
  });

  const [results, setResults] = useState<RealResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setInvestment(String(DEFAULTS.investment));
    setNominalReturn(String(DEFAULTS.nominalReturn));
    setInflation(String(DEFAULTS.inflation));
    setYears(String(DEFAULTS.years));
    setTaxRate(String(DEFAULTS.taxRate));
    setContribution(String(DEFAULTS.contribution));
    setExpenseRatio(String(DEFAULTS.expenseRatio));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between nominal and real return?",
      answer:
        "Nominal return is the percentage the account balance grows by. Real return is what is left after inflation, expressed as the growth in purchasing power. A 6% nominal return with 3% inflation is roughly a 2.9% real return, because the two interact multiplicatively rather than subtracting. Real return is the honest measure of whether an investment made you better off.",
    },
    {
      question: "What is the inflation tax on investment returns?",
      answer:
        "It is an informal name for the part of your nominal gain that exists only to keep pace with rising prices. If a portfolio grows from $50,000 to $78,000 over fifteen years with 3% inflation, about $27,000 of that gain simply restores the purchasing power of the original deposit — it is a gain on paper that buys no additional goods. The sting of the 'inflation tax' is that tax is collected on the full nominal gain, so part of what you pay is levied on inflation you never pocketed.",
    },
    {
      question: "Why is real return relevant for taxes?",
      answer:
        "Because capital gains tax is charged on the nominal gain, not the real one. If an asset doubles over twenty years while prices also rise, part of the taxable gain is inflation, and you pay tax on it as though it were profit. This is one of the arguments for tax-advantaged accounts and for holding periods that defer realisation: the longer the holding period, the larger the share of the gain that inflation has created, and the more punishing the tax on it becomes.",
    },
    {
      question: "How do fees fit into this calculation?",
      answer:
        "Fees reduce the nominal return before inflation is applied, so they hit purchasing power twice: they lower the growth rate, and they guarantee that less of the remaining growth covers the inflation gap. An expense ratio equal to the inflation rate means the investor is running to stand still in real terms before tax. The break-even field shows the nominal return required to maintain purchasing power after fees.",
    },
    {
      question: "What inflation rate should I assume?",
      answer:
        "Over long horizons, most planners use 2–3% for developed economies, which matches central bank targets and long-run averages. Shorter, recent periods can be much higher or lower, and using a single number hides the volatility. A sensible approach is to run the calculation at 2% and 4% and notice how much of the result depends on that assumption — small changes in inflation have large effects over decades.",
    },
    {
      question: "Does the real value of the portfolio depend on when I spend it?",
      answer:
        "Yes, and this is where the real figure is most useful. A dollar of nominal balance in year fifteen buys what $0.64 buys today at 3% inflation. If your spending plan assumes today's prices, comparing the account balance against the real value is the correct way to check whether it will cover the lifestyle you intend, rather than being misled by a large nominal number.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Investment Return vs Inflation Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Investment Return vs Inflation Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment & Inflation">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="investment"
                  label="Initial Investment"
                  value={investment}
                  onChange={setInvestment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="The amount invested today."
                />
                <CompactInput
                  id="nominal-return"
                  label="Nominal Return"
                  value={nominalReturn}
                  onChange={setNominalReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-50"
                  max="50"
                  step="0.1"
                  tooltip="Expected annual return before inflation and before any fee you enter below."
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
                  tooltip="Average annual inflation; 2–3% matches long-run developed-market targets."
                />
                <CompactInput
                  id="years"
                  label="Years"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  max="60"
                  step="1"
                  tooltip="Holding period over which the comparison is run."
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
                  <SubSection title="Tax, Fees & Contributions">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax-rate"
                        label="Tax Rate on Gains"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="60"
                        step="1"
                        tooltip="Combined rate applied to the nominal gain at the end of the period."
                      />
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
                        tooltip="Annual fees, deducted from the nominal return before inflation is applied."
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
                        tooltip="Added at the end of each year; contributions are counted in the amount invested."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The nominal balance is discounted by compounding inflation, which produces the real value in
                      today&apos;s money. Tax is applied to the nominal gain because that is how capital gains rules work,
                      which is precisely why the inflation portion of a gain is so costly in a taxable account. The break-even
                      return is the nominal return needed to preserve purchasing power after fees.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Real Ending Value</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.realTerminal)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                in today's money · {fmt(results.realReturn, 2)}% real return · nominal {money(results.nominalTerminal)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Purchasing Power Lost</span>
                <span className="font-extrabold text-destructive">{money(results.nominalTerminal - results.realTerminal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">After-Tax Real</span>
                <span className="font-extrabold text-emerald-600">{money(results.afterTaxReal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Break-Even Return</span>
                <span className="font-extrabold text-foreground">{fmt(results.breakEvenReturn, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[130px]">Nominal Balance</th>
                    <th className="p-2.5 text-right w-[130px]">Real Value</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Inflation Erosion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.slice(0, 30).map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.nominal)}</td>
                      <td className="p-2.5 text-right text-primary">{money(row.real)}</td>
                      <td className="p-2.5 pr-3 text-right text-destructive">{money(row.inflationCost)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">End of period</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.nominalTerminal)}</td>
                    <td className="p-2.5 text-right text-primary">{money(results.realTerminal)}</td>
                    <td className="p-2.5 pr-3 text-right text-destructive">
                      {money(results.nominalTerminal - results.realTerminal)}
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
            <h2 className="text-2xl font-bold mb-3">What Is an Investment Return vs Inflation Calculator?</h2>
            <p>
              An investment return vs inflation calculator converts a nominal return into the only figure that describes
              your standard of living: the real return. Nominal returns are what account statements show; real returns are
              what the balance can actually buy. With 6% nominal growth and 3% inflation, a portfolio is not 6% better off —
              it is roughly 2.9% better off, and that gap compounds in exactly the same way the return does.
            </p>
            <p>
              The tool reports the nominal ending value, the same balance discounted to today&apos;s purchasing power, the
              slice of the gain that inflation created, and the after-tax version of each figure. That last comparison is
              where the arithmetic gets uncomfortable in a taxable account, because tax is charged on the nominal gain even
              when a large part of it merely restored purchasing power.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The balance compounds at the nominal return you supply, less any expense ratio, with contributions added at the
              end of each year. To produce the real value, the nominal balance at each point is divided by one plus inflation
              raised to the number of years. The difference between the two is the purchasing-power erosion at that date.
            </p>
            <p>
              The real return is computed as the ratio of one plus the nominal rate to one plus inflation, minus one, rather
              than by simple subtraction. The difference is small at low rates and grows at higher ones — at 10% nominal and
              6% inflation the exact real return is 3.77%, not 4%. The break-even return field shows the nominal return needed
              to hold purchasing power after fees, which is inflation plus the expense ratio.
            </p>
            <p>
              Tax enters at the end, applied to the nominal gain because that is what the tax code measures. This is the
              mechanic behind the &quot;inflation tax&quot;: if a $50,000 investment grows to $78,000 in a period when
              inflation was 3%, roughly $27,000 of the gain is required to restore the purchasing power of the original
              deposit, yet tax is charged on the whole $28,000 gain. The after-tax real value shows the true outcome.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the real ending value with the real return and the nominal figure for comparison. The
              three statistics beside it give the purchasing power lost over the period, the after-tax real value, and the
              break-even nominal return. The table traces the nominal balance, the real balance and the cumulative inflation
              erosion year by year.
            </p>
            <p>
              Summary Statistics adds the amount invested, the nominal and real returns, the erosion as a percentage of the
              nominal result, the gain needed purely to keep pace with prices, the tax rate used and the return above
              inflation in percentage points. A good stress test is to raise inflation by one point: the nominal ending value
              barely moves, but the real value falls by several percentage points over a long horizon, which is the sense in
              which inflation is the quiet risk in any long-term plan.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-return-vs-inflation-calculator" />
          <PopularCalculators exclude="/calculator/investment-return-vs-inflation-calculator" />
        </div>
      </div>
    </>
  );
}
