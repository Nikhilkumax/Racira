"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FeeDragInputs {
  amount: number;
  grossReturn: number;
  expenseRatio: number;
  years: number;
  advisoryFee: number;
  taxDrag: number;
  inflation: number;
}

const DEFAULTS: FeeDragInputs = {
  amount: 100000,
  grossReturn: 7,
  expenseRatio: 0.9,
  years: 25,
  advisoryFee: 0.5,
  taxDrag: 0,
  inflation: 2.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface FeeRow {
  year: number;
  gross: number;
  net: number;
  cumulativeFees: number;
}

interface FeeDragResult {
  valid: boolean;
  errorMsg: string;
  netReturn: number;
  totalFees: number;
  grossTerminal: number;
  netTerminal: number;
  feeDrag: number;
  dragShare: number;
  firstYearFee: number;
  lastYearFee: number;
  returnKept: number;
  realNetTerminal: number;
  extraYears: number;
  totalFeesAlternative: number;
  rows: FeeRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: FeeDragInputs): FeeDragResult {
  const amount = Math.max(0, i.amount);
  const years = Math.max(1, Math.round(i.years));
  const totalFeeRate = Math.max(0, i.expenseRatio) + Math.max(0, i.advisoryFee) + Math.max(0, i.taxDrag);
  const netReturn = i.grossReturn - totalFeeRate;
  const grossTerminal = amount * Math.pow(1 + i.grossReturn / 100, years);
  const netTerminal = amount * Math.pow(1 + netReturn / 100, years);
  const feeDrag = grossTerminal - netTerminal;

  const rows: FeeRow[] = [];
  for (let year = 1; year <= Math.min(30, years); year++) {
    rows.push({
      year,
      gross: amount * Math.pow(1 + i.grossReturn / 100, year),
      net: amount * Math.pow(1 + netReturn / 100, year),
      cumulativeFees: amount * (Math.pow(1 + i.grossReturn / 100, year) - Math.pow(1 + netReturn / 100, year)),
    });
  }

  const realNetTerminal = netTerminal / Math.pow(1 + Math.max(0, i.inflation) / 100, years);
  let extraYears = 0;
  if (netReturn > 0 && grossTerminal > netTerminal) {
    const yearsToMatch = Math.log(grossTerminal / amount) / Math.log(1 + netReturn / 100);
    extraYears = Math.max(0, yearsToMatch - years);
  }

  const valid =
    i.amount > 0 &&
    i.grossReturn > -50 &&
    i.grossReturn < 50 &&
    i.expenseRatio >= 0 &&
    i.expenseRatio <= 10 &&
    i.years > 0 &&
    i.advisoryFee >= 0 &&
    i.advisoryFee <= 10 &&
    i.taxDrag >= 0 &&
    i.taxDrag <= 10 &&
    i.inflation >= 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive amount and holding period, a gross return between -50% and 50%, non-negative fees up to 10% each, and a non-negative inflation rate.";

  return {
    valid,
    errorMsg,
    netReturn,
    totalFees: feeDrag,
    grossTerminal,
    netTerminal,
    feeDrag,
    dragShare: grossTerminal > 0 ? (feeDrag / grossTerminal) * 100 : 0,
    firstYearFee: amount * (totalFeeRate / 100),
    lastYearFee: amount * Math.pow(1 + i.grossReturn / 100, years) * (totalFeeRate / 100),
    returnKept: i.grossReturn > 0 ? (netReturn / i.grossReturn) * 100 : 0,
    realNetTerminal,
    extraYears,
    totalFeesAlternative: amount * totalFeeRate / 100 * years,
    rows,
    summary: [
      { label: "Amount Invested", value: money2(amount) },
      { label: "Gross Return", value: fmt(i.grossReturn, 2) + "%" },
      { label: "Expense Ratio", value: fmt(i.expenseRatio, 2) + "%" },
      { label: "Advisory Fee", value: fmt(i.advisoryFee, 2) + "%" },
      { label: "Tax Drag", value: fmt(i.taxDrag, 2) + "%" },
      { label: "Total Annual Cost", value: fmt(totalFeeRate, 2) + "%", tone: "text-destructive" },
      { label: "Net Return", value: fmt(netReturn, 2) + "%", tone: "text-primary" },
      { label: "Value Without Fees", value: money(grossTerminal) },
      { label: "Value With Fees", value: money(netTerminal) },
      { label: "Fee Drag in Dollars", value: money(feeDrag), tone: "text-destructive" },
      { label: "Drag as % of Gross Result", value: fmt(grossTerminal > 0 ? (feeDrag / grossTerminal) * 100 : 0, 2) + "%", tone: "text-destructive" },
      { label: "Return Kept After Fees", value: fmt(i.grossReturn > 0 ? (netReturn / i.grossReturn) * 100 : 0, 2) + "%" },
      { label: "First-Year Fee", value: money2(amount * (totalFeeRate / 100)) },
      { label: "Final-Year Fee", value: money2(amount * Math.pow(1 + i.grossReturn / 100, years) * (totalFeeRate / 100)) },
      { label: "Extra Years to Match Gross", value: extraYears > 0 ? fmt(extraYears, 1) + " yr" : "—", tone: extraYears > 0 ? "text-destructive" : "text-emerald-600" },
      { label: "Net Value in Today's Dollars", value: money(realNetTerminal) },
      { label: "Fees as % of Deposits", value: fmt((feeDrag / Math.max(amount, 1)) * 100, 2) + "%" },
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

export default function InvestmentFeeDragCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [grossReturn, setGrossReturn] = useState(String(DEFAULTS.grossReturn));
  const [expenseRatio, setExpenseRatio] = useState(String(DEFAULTS.expenseRatio));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [advisoryFee, setAdvisoryFee] = useState(String(DEFAULTS.advisoryFee));
  const [taxDrag, setTaxDrag] = useState(String(DEFAULTS.taxDrag));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FeeDragInputs => ({
    amount: parseFloat(amount) || 0,
    grossReturn: parseFloat(grossReturn) || 0,
    expenseRatio: parseFloat(expenseRatio) || 0,
    years: parseFloat(years) || 0,
    advisoryFee: parseFloat(advisoryFee) || 0,
    taxDrag: parseFloat(taxDrag) || 0,
    inflation: parseFloat(inflation) || 0,
  });

  const [results, setResults] = useState<FeeDragResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setGrossReturn(String(DEFAULTS.grossReturn));
    setExpenseRatio(String(DEFAULTS.expenseRatio));
    setYears(String(DEFAULTS.years));
    setAdvisoryFee(String(DEFAULTS.advisoryFee));
    setTaxDrag(String(DEFAULTS.taxDrag));
    setInflation(String(DEFAULTS.inflation));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is investment fee drag?",
      answer:
        "Fee drag is the difference between what your investment would have grown to without fees and what it actually grows to after them. It is not simply the annual fee multiplied by the years, because fees are charged on a compounding balance: the fee in year twenty is much larger than the fee in year one. Over long horizons the drag can consume a quarter or more of the terminal value, which is why it is measured in dollars rather than basis points.",
    },
    {
      question: "Why does a 1% fee cost so much more than 1%?",
      answer:
        "Because the fee is taken from the balance every year and the money taken is never able to compound again. A 1.4% total annual cost against a 7% gross return leaves 5.6% compounding. After 25 years on $100,000 the fee-free balance is about $543,000 while the net balance is about $390,000 — a drag of roughly $152,000, or 28% of the potential result, from a fee that looks like a rounding error on any single statement.",
    },
    {
      question: "What counts as a fee for this calculation?",
      answer:
        "Anything charged on the balance. Fund expense ratios, platform and custody fees, advisory fees charged as a percentage of assets, and the drag from trading costs all belong here. Tax drag on distributions can be included separately because it behaves identically — it is an annual percentage taken out of the balance. Transaction commissions charged per trade are better modelled by adding them to the expense ratio estimate.",
    },
    {
      question: "How does the extra-years figure work?",
      answer:
        "It answers a question investors find easier to grasp than basis points: if you refused to pay fees, how many more years would it take to reach the same ending value? In the default scenario the net portfolio needs about 31 years to match what the gross portfolio reaches in 25 — more than six extra years of saving to pay for 25 years of fees. The comparison assumes the fee is reinvested in the same market, which understates the difference modestly.",
    },
    {
      question: "Do fees affect all investors equally?",
      answer:
        "No, and the difference is compounding. An investor with a 15-year horizon loses far less to fees than one with a 40-year horizon, because the drag compounds. That is why fee sensitivity is highest for young investors with long horizons, and why small percentage differences that look trivial in early years become decisive later. Someone saving from age 25 to 65 hands over a large share of their final balance to a 1% ongoing charge.",
    },
    {
      question: "Is it worth paying higher fees for better returns?",
      answer:
        "Only if the extra return is both real and repeatable. The break-even arithmetic is straightforward — the manager must out-earn the fee difference every year, before tax, forever. Some active strategies in less efficient markets have done that, but the evidence across large samples shows the average active dollar does not. The practical approach is to demand a very clear reason for each layer of fees and to know what the break-even performance looks like.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Investment Fee Drag Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Investment Fee Drag Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Investment & Return">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Amount Invested"
                  value={amount}
                  onChange={setAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="Starting balance; fees are charged on whatever this grows into."
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
                  tooltip="Market return before any fee is deducted."
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
                  step="0.01"
                  tooltip="Fund expense ratio: the annual charge deducted from the fund's assets."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  max="60"
                  step="1"
                  tooltip="Fee drag compounds with time, so the horizon drives the result."
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
                  <SubSection title="Additional Costs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="advisory-fee"
                        label="Advisory Fee"
                        value={advisoryFee}
                        onChange={setAdvisoryFee}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="10"
                        step="0.05"
                        tooltip="Assets-under-management advice charge layered on top of the fund expense ratio."
                      />
                      <CompactInput
                        id="tax-drag"
                        label="Tax Drag"
                        value={taxDrag}
                        onChange={setTaxDrag}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="10"
                        step="0.05"
                        tooltip="Annual cost of taxes on distributions; set 0 inside a tax-advantaged account."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation"
                        value={inflation}
                        onChange={setInflation}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.1"
                        tooltip="Used to restate the net result in today's purchasing power."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every cost is expressed as an annual percentage of the balance and subtracted from the gross return, so
                      all layers compound against the investor in the same way. The fee-free comparison compounds the gross
                      return untouched, which is what the portfolio would have earned before any charge. The extra-years figure
                      shows how much longer the net portfolio takes to reach the fee-free ending value.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Value Lost to Fees</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-destructive">{money(results.feeDrag)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.dragShare, 2)}% of the fee-free result · {money(results.netTerminal)} kept instead of{" "}
                {money(results.grossTerminal)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Return</span>
                <span className="font-extrabold text-foreground">{fmt(results.netReturn, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Return Kept</span>
                <span className="font-extrabold text-foreground">{fmt(results.returnKept, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extra Years Needed</span>
                <span className="font-extrabold text-destructive">{fmt(results.extraYears, 1)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[120px]">Without Fees</th>
                    <th className="p-2.5 text-right w-[120px]">With Fees</th>
                    <th className="p-2.5 text-right w-[120px]">Fee Drag</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Cumulative Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.gross)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.net)}</td>
                      <td className="p-2.5 text-right text-destructive">{money(row.gross - row.net)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.cumulativeFees)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">End of period</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.grossTerminal)}</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.netTerminal)}</td>
                    <td className="p-2.5 text-right text-destructive">{money(results.feeDrag)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.feeDrag)}</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is Investment Fee Drag?</h2>
            <p>
              Fee drag is the cumulative cost of every annual charge deducted from an investment, measured not in basis points
              but in the dollars missing from the final balance. It is a compounding concept: a 1% fee will always be 1% of the
              balance, but the balance grows, so the fee in the twentieth year is several times the fee in the first. The money
              paid never compounds again, and that lost compounding is what eventually turns a small annual percentage into a
              large share of the result.
            </p>
            <p>
              The tool models each cost layer separately — fund expense ratio, advisory fee and tax drag — so the individual
              contributions to the total drag are visible. It then reports what the same investment would have grown to
              untouched, and how many additional years the net portfolio needs to reach that figure.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              All costs are expressed as annual percentages of the balance and subtracted from the gross return. In the default
              scenario a 0.9% expense ratio plus a 0.5% advisory fee leaves a 5.6% net return against a 7% gross return. Over
              25 years $100,000 grows to about $543,000 without costs and about $390,000 with them; the difference of roughly
              $152,000 is the fee drag, or 28% of the potential result.
            </p>
            <p>
              The table shows the same arithmetic year by year. Early on the gap is small — a few hundred dollars — which is
              exactly why fees feel harmless at the start. By year ten the gap is in the tens of thousands, and by year
              twenty-five it is larger than the original deposit in many scenarios. The extra-years figure converts the drag
              into a currency most people find easier to feel: the net portfolio needs about 31 years to reach what the gross
              portfolio reaches in 25, so more than six years of additional investing are consumed by the fee layers.
            </p>
            <p>
              Tax drag behaves identically to a fee when it is charged on distributions, which is why it is included in the
              same framework. Set it to zero inside a retirement account, where distributions are not taxed annually, and the
              comparison becomes purely about fund and advisory costs.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the value lost to fees with its share of the fee-free result and the two endings side by
              side. The three statistics beside it give the net return, the percentage of the gross return actually kept, and
              the extra years needed to match the fee-free outcome. The table traces both balances year by year with the
              cumulative fee total.
            </p>
            <p>
              Summary Statistics adds the individual cost layers, the total annual cost, the first- and final-year fee in
              dollars, fees as a percentage of the original deposit, and the net result in today&apos;s dollars. Two
              experiments put the numbers in context. First, remove the advisory fee and watch the drag fall substantially —
              layers compound on each other. Second, extend the holding period from 25 to 40 years: the annual cost percentages
              are identical, but the drag grows because the compounding has more time to work.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-fee-drag-calculator" />
          <PopularCalculators exclude="/calculator/investment-fee-drag-calculator" />
        </div>
      </div>
    </>
  );
}
