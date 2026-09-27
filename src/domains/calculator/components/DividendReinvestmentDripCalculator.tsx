"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DripInputs {
  initialInvestment: number;
  sharePrice: number;
  annualDividend: number;
  dividendGrowthPct: number;
  priceGrowthPct: number;
  years: number;
  dividendTaxRate: number;
}

const DEFAULTS: DripInputs = {
  initialInvestment: 25000,
  sharePrice: 50,
  annualDividend: 1.2,
  dividendGrowthPct: 5,
  priceGrowthPct: 6,
  years: 20,
  dividendTaxRate: 15,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface DripMilestone {
  year: number;
  shares: number;
  dividends: number;
  value: number;
}

interface DripResult {
  initialShares: number;
  finalShares: number;
  totalSharesAdded: number;
  finalPrice: number;
  finalValue: number;
  totalDividends: number;
  netDividends: number;
  annualIncome: number;
  yieldOnCost: number;
  reinvestAdvantage: number;
  valueWithoutReinvest: number;
  priceAppreciation: number;
  totalReturnPct: number;
  milestones: DripMilestone[];
  valid: boolean;
  errorMsg: string;
}

function computeDrip(i: DripInputs): DripResult {
  const invalid =
    i.initialInvestment <= 0 ||
    i.sharePrice <= 0 ||
    i.annualDividend < 0 ||
    i.dividendGrowthPct < 0 ||
    i.priceGrowthPct < 0 ||
    i.years <= 0 ||
    i.dividendTaxRate < 0 ||
    i.dividendTaxRate > 100;

  const initialShares = i.sharePrice > 0 ? i.initialInvestment / i.sharePrice : 0;
  const reinvestRate = 1 - i.dividendTaxRate / 100;
  let shares = initialShares;
  let price = i.sharePrice;
  let dps = i.annualDividend;
  let totalDividends = 0;
  let netDividends = 0;
  let dividendsNotReinvested = 0;
  let costBasis = i.initialInvestment;
  const milestones: DripMilestone[] = [];
  const years = Math.max(0, Math.round(i.years));

  for (let y = 1; y <= years; y++) {
    const gross = shares * dps;
    const net = gross * reinvestRate;
    totalDividends += gross;
    netDividends += net;
    price = price * (1 + i.priceGrowthPct / 100);

    // Dividends are reinvested at the price prevailing after the year's growth.
    const newShares = price > 0 ? net / price : 0;
    shares += newShares;
    costBasis += net;
    dividendsNotReinvested += net;
    dps = dps * (1 + i.dividendGrowthPct / 100);

    if (y % 5 === 0 || y === years) {
      milestones.push({ year: y, shares, dividends: totalDividends, value: shares * price });
    }
  }

  const finalValue = shares * price;
  const valueWithoutReinvest = initialShares * price + dividendsNotReinvested;

  return {
    initialShares,
    finalShares: shares,
    totalSharesAdded: shares - initialShares,
    finalPrice: price,
    finalValue,
    totalDividends,
    netDividends,
    annualIncome: shares * dps,
    yieldOnCost: costBasis > 0 ? ((shares * dps) / costBasis) * 100 : 0,
    reinvestAdvantage: Math.max(0, finalValue - valueWithoutReinvest),
    valueWithoutReinvest,
    priceAppreciation: price - i.sharePrice,
    totalReturnPct: i.initialInvestment > 0 ? ((finalValue - i.initialInvestment) / i.initialInvestment) * 100 : 0,
    milestones,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter an investment, share price and horizon above zero, and non-negative growth rates and tax."
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

export default function DividendReinvestmentDripCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(String(DEFAULTS.initialInvestment));
  const [sharePrice, setSharePrice] = useState(String(DEFAULTS.sharePrice));
  const [annualDividend, setAnnualDividend] = useState(String(DEFAULTS.annualDividend));
  const [dividendGrowthPct, setDividendGrowthPct] = useState(String(DEFAULTS.dividendGrowthPct));
  const [priceGrowthPct, setPriceGrowthPct] = useState(String(DEFAULTS.priceGrowthPct));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [dividendTaxRate, setDividendTaxRate] = useState(String(DEFAULTS.dividendTaxRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DripInputs => ({
    initialInvestment: parseFloat(initialInvestment) || 0,
    sharePrice: parseFloat(sharePrice) || 0,
    annualDividend: parseFloat(annualDividend) || 0,
    dividendGrowthPct: parseFloat(dividendGrowthPct) || 0,
    priceGrowthPct: parseFloat(priceGrowthPct) || 0,
    years: parseFloat(years) || 0,
    dividendTaxRate: parseFloat(dividendTaxRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DripInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DripResult>(() => computeDrip(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDrip(inputs));
  };

  const reset = () => {
    setInitialInvestment(String(DEFAULTS.initialInvestment));
    setSharePrice(String(DEFAULTS.sharePrice));
    setAnnualDividend(String(DEFAULTS.annualDividend));
    setDividendGrowthPct(String(DEFAULTS.dividendGrowthPct));
    setPriceGrowthPct(String(DEFAULTS.priceGrowthPct));
    setYears(String(DEFAULTS.years));
    setDividendTaxRate(String(DEFAULTS.dividendTaxRate));
    setCalcInputs(DEFAULTS);
    setResults(computeDrip(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a dividend reinvestment plan?",
      answer:
        "A DRIP automatically uses the cash dividends your shares pay to buy additional shares, often with no commission and sometimes at a small discount. Instead of receiving a check, you receive more ownership. Those new shares pay dividends of their own in the next period, so the share count and the income it produces both grow without any new money being contributed.",
    },
    {
      question: "How much does reinvesting really add?",
      answer:
        "Over long periods, a great deal — because the effect is compounding on both sides. Reinvested dividends buy shares, those shares pay more dividends, and the share price is usually rising at the same time. Historically, dividends have accounted for a large share of total equity returns, and reinvesting them is the difference between collecting that income and compounding it.",
    },
    {
      question: "Is reinvesting dividends always the right choice?",
      answer:
        "Not always. If the income is needed for living expenses, taking it in cash is correct. If the position is overly concentrated, adding more of the same stock increases risk. And in taxable accounts each reinvestment creates a new lot with its own cost basis, which adds bookkeeping at sale time. The projection assumes full reinvestment so you can see the ceiling; adjust your own expectations accordingly.",
    },
    {
      question: "How does dividend growth affect the outcome?",
      answer:
        "It compounds twice. A rising dividend per share increases the cash received on every share you own, while reinvestment increases the number of shares receiving it. A company growing its dividend five percent a year can double the income produced by the same holding in roughly fifteen years, even before any reinvested shares are counted.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Dividend Reinvestment (DRIP) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Dividend Reinvestment (DRIP) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Position">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="initial-investment"
                  label="Initial Investment"
                  value={initialInvestment}
                  onChange={setInitialInvestment}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Amount invested at the start."
                />
                <CompactInput
                  id="share-price"
                  label="Share Price"
                  value={sharePrice}
                  onChange={setSharePrice}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Current price per share."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="annual-dividend"
                  label="Dividend Per Share"
                  value={annualDividend}
                  onChange={setAnnualDividend}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Annual cash dividend paid per share."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="How many years dividends are reinvested."
                />
              </div>
            </SubSection>

            <SubSection title="Growth Assumptions">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="dividend-growth"
                  label="Dividend Growth"
                  value={dividendGrowthPct}
                  onChange={setDividendGrowthPct}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Annual growth in the dividend per share."
                />
                <CompactInput
                  id="price-growth"
                  label="Price Growth"
                  value={priceGrowthPct}
                  onChange={setPriceGrowthPct}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Annual share-price appreciation."
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
                  <SubSection title="Dividend Tax">
                    <CompactInput
                      id="dividend-tax"
                      label="Tax on Dividends"
                      value={dividendTaxRate}
                      onChange={setDividendTaxRate}
                      onEnter={runCalculate}
                      suffix="%"
                      min="0"
                      tooltip="Rate applied before dividends are reinvested."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Portfolio Value With Reinvestment
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.finalValue, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`${fmt(results.finalShares, 1)} shares after ${fmt(calcInputs.years, 0)} years at $${fmt(results.finalPrice, 2)} each`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shares Added</span>
                <span className="font-extrabold text-foreground">{fmt(results.totalSharesAdded, 1)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Dividends</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalDividends, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reinvest Gain</span>
                <span className="font-extrabold text-emerald-600">${fmt(results.reinvestAdvantage, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Milestone</th>
                    <th className="p-2.5 text-right w-[110px]">Shares</th>
                    <th className="p-2.5 text-right w-[140px]">Dividends to Date</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Portfolio Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.milestones.map((ms) => (
                    <tr key={ms.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {fmt(ms.year, 0)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(ms.shares, 1)}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(ms.dividends, 0)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">${fmt(ms.value, 0)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Final position</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.finalShares, 1)}</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalDividends, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">${fmt(results.finalValue, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Starting Shares</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.initialShares, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Price Appreciation</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.priceAppreciation, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Income Next Year</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.annualIncome, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Yield on Cost</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.yieldOnCost, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Value Taking Dividends</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.valueWithoutReinvest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Return</span>
                  <span className="text-base font-bold text-emerald-600">{fmt(results.totalReturnPct, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Dividend Reinvestment (DRIP) Calculator?</h2>
            <p>
              A dividend reinvestment calculator projects what happens when the income a holding produces is used to buy
              more of the same position instead of being spent. Each dividend buys additional shares, those shares pay
              dividends of their own, and the dividend per share itself often grows over time. The result is compounding
              from three directions at once, which is why long holding periods produce figures that look surprising at
              first glance.
            </p>
            <p>
              The tool is useful for answering a specific question: how much of a portfolio&apos;s eventual value comes from
              dividends rather than price appreciation? It also quantifies the cost of taking income as cash, which is the
              comparison most investors never actually run before deciding.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The initial investment buys a starting number of shares at the current price. Each year the shares pay a
              dividend per share, which is taxed at your rate and then used to buy new shares at the prevailing price.
              The dividend per share grows annually by its own rate, and the share price grows by the appreciation rate,
              so both the income base and the compounding base expand over the holding period.
            </p>
            <p>
              The calculator runs a parallel path where dividends are collected in cash and never reinvested. Comparing
              the two final values isolates the contribution of reinvestment itself, separate from price growth. It also
              reports yield on cost — the dividend income now produced relative to everything you have put into the
              position — which is often far higher than the yield available on new money today.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports portfolio value with reinvestment, along with the share count and price behind it.
              The three-stat bar shows shares added, total dividends received and the value the reinvestment itself
              created, while the milestone table tracks shares, cumulative dividends and portfolio value at five-year
              intervals.
            </p>
            <p>
              Pay attention to the gap between reinvested and cash-taken value. That gap grows with time, which is why
              the decision matters far more over twenty years than over five. It is also sensitive to the dividend
              growth rate: a company raising its payout every year compounds noticeably faster than one paying a fixed
              amount, even at the same starting yield.
            </p>
            <p>
              Finally, weigh the practical considerations the model cannot capture, particularly concentration and taxes.
              Reinvesting into a single stock increases exposure to that company, and each reinvestment creates a separate
              tax lot with its own basis. Tax-advantaged accounts avoid the bookkeeping entirely, which is one reason
              reinvestment is most often recommended where the income is sheltered.
            </p>
            <p>
              One structural point is worth remembering: a reinvested dividend is not free money. The share price drops
              by roughly the dividend on the ex-dividend date, so reinvestment buys back exposure you already had rather
              than creating value by itself. What it creates is a habit and a compounding mechanism — automatic growth in
              the share count that would otherwise require new savings. Over decades, that quiet mechanism is really the
              entire point of reinvesting dividends year after year.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-reinvestment-drip-calculator" />
          <PopularCalculators exclude="/calculator/dividend-reinvestment-drip-calculator" />
        </div>
      </div>
    </>
  );
}
