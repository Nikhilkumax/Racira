"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BreakevenInputs {
  purchasePrice: number;
  shares: number;
  commission: number;
  targetReturn: number;
  marginLoan: number;
  marginRate: number;
  months: number;
  dividends: number;
  optionPremium: number;
}

const DEFAULTS: BreakevenInputs = {
  purchasePrice: 60,
  shares: 500,
  commission: 10,
  targetReturn: 0,
  marginLoan: 15000,
  marginRate: 8,
  months: 6,
  dividends: 0.8,
  optionPremium: 1.5,
};

const TARGET_LADDER = [0, 5, 10, 15, 20];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface LadderRow {
  targetReturn: number;
  price: number;
  move: number;
  proceeds: number;
  profit: number;
}

interface BreakevenResult {
  valid: boolean;
  errorMsg: string;
  costBasis: number;
  income: number;
  marginInterest: number;
  requiredProceeds: number;
  breakevenPrice: number;
  moveNeeded: number;
  investedCash: number;
  dividendTotal: number;
  optionTotal: number;
  effectiveCostPerShare: number;
  rows: LadderRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: BreakevenInputs): BreakevenResult {
  const shares = Math.max(1, Math.round(i.shares));
  const purchasePrice = Math.max(0.01, i.purchasePrice);
  const costBasis = shares * purchasePrice + Math.max(0, i.commission);
  const dividendTotal = shares * Math.max(0, i.dividends);
  const optionTotal = shares * Math.max(0, i.optionPremium);
  const income = dividendTotal + optionTotal;
  const marginInterest = Math.max(0, i.marginLoan) * (Math.max(0, i.marginRate) / 100) * (Math.max(0, i.months) / 12);
  const requiredProceeds = costBasis + marginInterest - income;
  const breakevenPrice = requiredProceeds / shares;
  const moveNeeded = ((breakevenPrice - purchasePrice) / purchasePrice) * 100;
  const investedCash = Math.max(0, costBasis - Math.max(0, i.marginLoan));

  const rows: LadderRow[] = TARGET_LADDER.map((target) => {
    const proceeds = costBasis + marginInterest - income + (costBasis * target) / 100;
    return {
      targetReturn: target,
      price: proceeds / shares,
      move: ((proceeds / shares - purchasePrice) / purchasePrice) * 100,
      proceeds,
      profit: (costBasis * target) / 100,
    };
  });

  const valid =
    i.purchasePrice > 0 &&
    i.shares > 0 &&
    i.commission >= 0 &&
    i.targetReturn >= -100 &&
    i.marginLoan >= 0 &&
    i.marginLoan <= costBasis &&
    i.marginRate >= 0 &&
    i.marginRate <= 40 &&
    i.months >= 0 &&
    i.months <= 120 &&
    i.dividends >= 0 &&
    i.optionPremium >= 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive purchase price and share count, a margin loan no larger than the cost basis, and non-negative commission, rate, months, dividends and premium.";

  return {
    valid,
    errorMsg,
    costBasis,
    income,
    marginInterest,
    requiredProceeds,
    breakevenPrice,
    moveNeeded,
    investedCash,
    dividendTotal,
    optionTotal,
    effectiveCostPerShare: requiredProceeds / shares,
    rows,
    summary: [
      { label: "Purchase Price", value: money2(purchasePrice) },
      { label: "Shares", value: shares.toLocaleString("en-US") },
      { label: "Cost Basis", value: money2(costBasis) },
      { label: "Commission", value: money2(Math.max(0, i.commission)) },
      { label: "Dividends Received", value: money2(dividendTotal) },
      { label: "Option Premium", value: money2(optionTotal) },
      { label: "Total Income", value: money2(income), tone: "text-emerald-600" },
      { label: "Margin Interest", value: money2(marginInterest), tone: "text-destructive" },
      { label: "Proceeds Needed", value: money2(requiredProceeds) },
      { label: "Break-Even Price", value: money2(breakevenPrice), tone: "text-primary" },
      { label: "Move Needed from Purchase", value: fmt(moveNeeded, 2) + "%", tone: moveNeeded <= 0 ? "text-emerald-600" : "text-foreground" },
      { label: "Cash Invested", value: money(investedCash) },
      { label: "Effective Cost per Share", value: money2(requiredProceeds / shares) },
      { label: "Break-Even on Total Cost", value: fmt(((breakevenPrice - purchasePrice) / purchasePrice) * 100, 2) + "%" },
      { label: "Income per Share", value: money2(income / shares) },
      { label: "Interest per Share", value: money2(marginInterest / shares) },
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

export default function BreakevenStockPriceCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(String(DEFAULTS.purchasePrice));
  const [shares, setShares] = useState(String(DEFAULTS.shares));
  const [commission, setCommission] = useState(String(DEFAULTS.commission));
  const [targetReturn, setTargetReturn] = useState(String(DEFAULTS.targetReturn));
  const [marginLoan, setMarginLoan] = useState(String(DEFAULTS.marginLoan));
  const [marginRate, setMarginRate] = useState(String(DEFAULTS.marginRate));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [dividends, setDividends] = useState(String(DEFAULTS.dividends));
  const [optionPremium, setOptionPremium] = useState(String(DEFAULTS.optionPremium));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BreakevenInputs => ({
    purchasePrice: parseFloat(purchasePrice) || 0,
    shares: parseFloat(shares) || 0,
    commission: parseFloat(commission) || 0,
    targetReturn: parseFloat(targetReturn) || 0,
    marginLoan: parseFloat(marginLoan) || 0,
    marginRate: parseFloat(marginRate) || 0,
    months: parseFloat(months) || 0,
    dividends: parseFloat(dividends) || 0,
    optionPremium: parseFloat(optionPremium) || 0,
  });

  const [results, setResults] = useState<BreakevenResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setPurchasePrice(String(DEFAULTS.purchasePrice));
    setShares(String(DEFAULTS.shares));
    setCommission(String(DEFAULTS.commission));
    setTargetReturn(String(DEFAULTS.targetReturn));
    setMarginLoan(String(DEFAULTS.marginLoan));
    setMarginRate(String(DEFAULTS.marginRate));
    setMonths(String(DEFAULTS.months));
    setDividends(String(DEFAULTS.dividends));
    setOptionPremium(String(DEFAULTS.optionPremium));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a break-even stock price?",
      answer:
        "It is the price at which selling the position returns exactly what the position cost, once every charge is counted. The purchase price alone is not the answer, because commissions, margin interest, dividends and any option premium received all move the number. A break-even below the purchase price means the position is already profitable on an after-cost basis; a break-even above it means the stock has to rise before the trade pays for itself.",
    },
    {
      question: "Why does receiving an option premium lower the break-even?",
      answer:
        "Because the premium is cash income that has already been collected, so less has to be recovered through the share price. Writing a covered call at $1.50 on 500 shares collects $750, which reduces the required sale proceeds by the same amount — about $1.50 per share. That is the mechanical reason covered calls are described as generating income: they shift the break-even down, at the cost of capping the upside above the strike.",
    },
    {
      question: "How does margin interest affect the calculation?",
      answer:
        "Borrowed money costs interest whether or not the trade works, and that interest is an additional cost that the position must cover. A $15,000 margin loan at 8% for six months costs $600, or $1.20 per share on a 500-share position. Margin magnifies both gains and losses, and the interest drag is small only while the holding period is short — carried over a year, the same loan costs $1,200.",
    },
    {
      question: "Should I include dividends in the break-even?",
      answer:
        "Yes, if the shares were held over a period in which they paid. Dividends are cash received, just like option premium, and they reduce the net amount the sale has to recover. Use the total dividend per share received during your holding period rather than the annual rate, since the break-even is measured over the actual holding period.",
    },
    {
      question: "What does the target-return ladder show?",
      answer:
        "It converts your required profit into a price. Break-even is the zero-return case; if you need a 10% return on the cost basis, the ladder shows the price at which the sale would deliver exactly that after all charges. Reading the ladder is often more useful than reading a single break-even figure, because it turns a planning decision into a specific price level you can compare with the market.",
    },
    {
      question: "How is this different from the option profit calculator?",
      answer:
        "The option profit calculator models the payoff of an options position across a range of expiry prices, showing profit and loss for a strategy. This tool starts from a share purchase and works out the single price at which the whole position — shares, commissions, financing and any income — is flat. The two answer different questions: one about a strategy&apos;s shape, the other about the cost floor of a holding.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Breakeven Stock Price Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Breakeven Stock Price Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Position">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="purchase-price"
                  label="Purchase Price"
                  value={purchasePrice}
                  onChange={setPurchasePrice}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0.01"
                  step="0.25"
                  tooltip="The price paid per share, before commissions."
                />
                <CompactInput
                  id="shares"
                  label="Shares"
                  value={shares}
                  onChange={setShares}
                  onEnter={runCalculate}
                  min="1"
                  step="10"
                  tooltip="Number of shares in the position."
                />
                <CompactInput
                  id="commission"
                  label="Commission"
                  value={commission}
                  onChange={setCommission}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1"
                  tooltip="Total commission for the round trip, entry and exit combined."
                />
                <CompactInput
                  id="target-return"
                  label="Target Return"
                  value={targetReturn}
                  onChange={setTargetReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-100"
                  max="200"
                  step="1"
                  tooltip="Return on the cost basis you want the price to deliver; 0% is pure break-even."
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
                  <SubSection title="Financing">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="margin-loan"
                        label="Margin Loan"
                        value={marginLoan}
                        onChange={setMarginLoan}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="1000"
                        tooltip="Amount borrowed to fund the purchase; interest is charged over the holding period."
                      />
                      <CompactInput
                        id="margin-rate"
                        label="Margin Rate"
                        value={marginRate}
                        onChange={setMarginRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="40"
                        step="0.25"
                        tooltip="Annual interest rate on the margin loan."
                      />
                      <CompactInput
                        id="months"
                        label="Holding Period"
                        value={months}
                        onChange={setMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="0"
                        max="120"
                        step="1"
                        tooltip="How long the borrowed money is outstanding."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Income Received">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="dividends"
                        label="Dividends per Share"
                        value={dividends}
                        onChange={setDividends}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="0.05"
                        tooltip="Total dividends per share received while holding the position."
                      />
                      <CompactInput
                        id="option-premium"
                        label="Option Premium"
                        value={optionPremium}
                        onChange={setOptionPremium}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="0.05"
                        tooltip="Premium per share received for writing a covered call or selling a put against the position."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The break-even price solves for the sale proceeds that leave you exactly flat: cost basis plus margin
                      interest, less dividends and option premium received, divided by the share count. The target ladder
                      repeats the calculation for returns of 0% to 20% on the cost basis, so you can read off the price each
                      target requires.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Break-Even Price</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money2(results.breakevenPrice)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.moveNeeded, 2)}% from the purchase price · needs {money2(results.requiredProceeds)} in proceeds
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost Basis</span>
                <span className="font-extrabold text-foreground">{money(results.costBasis)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Income Offset</span>
                <span className="font-extrabold text-emerald-600">{money(results.income)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Margin Interest</span>
                <span className="font-extrabold text-destructive">{money(results.marginInterest)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Target Return</th>
                    <th className="p-2.5 text-right w-[110px]">Price</th>
                    <th className="p-2.5 text-right w-[105px]">Move Needed</th>
                    <th className="p-2.5 text-right w-[115px]">Proceeds</th>
                    <th className="p-2.5 pr-3 text-right w-[95px]">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.targetReturn} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.targetReturn === 0 ? "Break-even" : row.targetReturn + "%"}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{money2(row.price)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.move, 2)}%</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.proceeds)}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {money(row.profit)}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Break-Even Stock Price?</h2>
            <p>
              A break-even stock price is the sale price at which a position returns exactly what it cost — no more, no less.
              It is never simply the purchase price, because a position accumulates costs and income while it is held:
              commissions are paid on both entry and exit, margin borrowing accrues interest, dividends and option premiums
              arrive as cash. The break-even is the price that nets all of those against each other.
            </p>
            <p>
              Knowing the number changes how a position is managed. A covered-call writer discovers that the premium has
              pushed the break-even below the entry price, which is the real source of the perceived income advantage. A
              margin buyer sees exactly how much of the trade is being consumed by financing costs, which is usually more than
              expected when a position is held for months rather than days.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator builds the total cost basis from the purchase price, the share count and the round-trip
              commission. It then adds the financing cost — the margin loan multiplied by the rate and the fraction of a year
              held — and subtracts the income received: dividends plus any option premium. The remainder is the proceeds the
              sale must generate, and dividing by the share count gives the break-even price per share.
            </p>
            <p>
              In the default example, 500 shares at $60 cost $30,010 including commission. Dividends of $0.80 per share and an
              option premium of $1.50 per share provide $1,150 of income, while a $15,000 margin loan at 8% for six months
              costs $600. The position therefore needs $29,460 of proceeds — $58.92 per share, about 1.8% below the purchase
              price. The income has more than covered both the commission and the financing.
            </p>
            <p>
              The target ladder extends the same arithmetic to the returns you might require. At a 10% target the position
              must sell for $63.92 a share; at 20% it needs $69.92. Read against the current market price, the ladder turns a
              return objective into a concrete price level, which is easier to act on than a percentage.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the break-even price with the move required from the purchase price and the total proceeds
              needed. The three statistics beside it separate the three forces at work: the cost basis, the income offset and
              the financing cost. The table then lists the price required for each target return from break-even to 20%.
            </p>
            <p>
              Summary Statistics adds the dollar values of dividends and option premium, the cash actually invested after the
              margin loan, the effective cost per share, and the interest and income broken down per share. A useful exercise
              is to extend the holding period from six months to a year: the break-even price rises by roughly the annual
              interest per share, which is the clearest demonstration of why leveraged positions need a faster resolution than
              unleveraged ones.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/breakeven-stock-price-calculator" />
          <PopularCalculators exclude="/calculator/breakeven-stock-price-calculator" />
        </div>
      </div>
    </>
  );
}
