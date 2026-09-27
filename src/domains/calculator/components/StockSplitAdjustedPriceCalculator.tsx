"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SplitInputs {
  originalPrice: number;
  splitFrom: number;
  splitTo: number;
  sharesHeld: number;
  currentPrice: number;
}

const DEFAULTS: SplitInputs = {
  originalPrice: 240,
  splitFrom: 1,
  splitTo: 4,
  sharesHeld: 100,
  currentPrice: 62,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface SplitResult {
  multiplier: number;
  adjustedPrice: number;
  newShares: number;
  costBasisTotal: number;
  basisPerShare: number;
  currentValue: number;
  totalGain: number;
  returnPct: number;
  adjustedReturnPct: number;
  unadjustedEquivalent: number;
  dilutionPct: number;
  reverseSplit: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeSplit(i: SplitInputs): SplitResult {
  const invalid =
    i.originalPrice <= 0 ||
    i.splitFrom <= 0 ||
    i.splitTo <= 0 ||
    i.sharesHeld <= 0 ||
    i.currentPrice < 0;

  const multiplier = i.splitTo / i.splitFrom;
  const adjustedPrice = i.originalPrice * (i.splitFrom / i.splitTo);
  const newShares = i.sharesHeld * multiplier;
  const costBasisTotal = i.originalPrice * i.sharesHeld;
  const basisPerShare = newShares > 0 ? costBasisTotal / newShares : 0;
  const currentValue = i.currentPrice * newShares;
  const totalGain = currentValue - costBasisTotal;

  return {
    multiplier,
    adjustedPrice,
    newShares,
    costBasisTotal,
    basisPerShare,
    currentValue,
    totalGain,
    returnPct: costBasisTotal > 0 ? (totalGain / costBasisTotal) * 100 : 0,
    adjustedReturnPct: adjustedPrice > 0 ? ((i.currentPrice - adjustedPrice) / adjustedPrice) * 100 : 0,
    unadjustedEquivalent: i.currentPrice * multiplier,
    dilutionPct: multiplier > 0 ? (1 / multiplier) * 100 : 0,
    reverseSplit: multiplier < 1,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter prices and share counts above zero, and a split ratio with positive values on both sides."
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

export default function StockSplitAdjustedPriceCalculator() {
  const [originalPrice, setOriginalPrice] = useState(String(DEFAULTS.originalPrice));
  const [splitFrom, setSplitFrom] = useState(String(DEFAULTS.splitFrom));
  const [splitTo, setSplitTo] = useState(String(DEFAULTS.splitTo));
  const [sharesHeld, setSharesHeld] = useState(String(DEFAULTS.sharesHeld));
  const [currentPrice, setCurrentPrice] = useState(String(DEFAULTS.currentPrice));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SplitInputs => ({
    originalPrice: parseFloat(originalPrice) || 0,
    splitFrom: parseFloat(splitFrom) || 0,
    splitTo: parseFloat(splitTo) || 0,
    sharesHeld: parseFloat(sharesHeld) || 0,
    currentPrice: parseFloat(currentPrice) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<SplitInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SplitResult>(() => computeSplit(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSplit(inputs));
  };

  const reset = () => {
    setOriginalPrice(String(DEFAULTS.originalPrice));
    setSplitFrom(String(DEFAULTS.splitFrom));
    setSplitTo(String(DEFAULTS.splitTo));
    setSharesHeld(String(DEFAULTS.sharesHeld));
    setCurrentPrice(String(DEFAULTS.currentPrice));
    setCalcInputs(DEFAULTS);
    setResults(computeSplit(DEFAULTS));
  };

  const faqs = [
    {
      question: "What does a stock split actually change?",
      answer:
        "Only the number of shares and the price per share. The total value of your position, the total cost basis and the company's market capitalisation are all unaffected. A four-for-one split turns one hundred shares at two hundred and forty dollars into four hundred shares at sixty dollars, which is the same twenty-four thousand dollars of stock. Nothing was created and nothing was lost.",
    },
    {
      question: "Why adjust historical prices for splits?",
      answer:
        "Because a price series that mixes pre-split and post-split quotes is meaningless. Charting a stock that traded at two hundred and forty dollars before a four-for-one split against a current price of sixty-two dollars makes it look like a collapse when the position is actually ahead. Adjusting all historical prices by the split factor puts the entire series on today's share basis, which is the only way to read a long-term chart or compare returns.",
    },
    {
      question: "How does a split affect cost basis for taxes?",
      answer:
        "The total basis does not change; it is simply spread across more shares. If you paid twenty-four thousand dollars for one hundred shares, after a four-for-one split you own four hundred shares with a basis of sixty dollars each. The holding period carries over, so long-term shares remain long-term, and nothing is taxable at the moment of the split because no gain has been realised.",
    },
    {
      question: "What about reverse splits?",
      answer:
        "A reverse split works in the same direction but with the ratio inverted: a one-for-ten reverse split turns one hundred shares into ten and multiplies the price by ten. Companies use them to lift a share price above exchange minimums or to appeal to institutional investors. The arithmetic is identical; only the direction changes, and your total value is equally unaffected.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Stock Split Adjusted Price Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Stock Split Adjusted Price Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Original Position">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="original-price"
                  label="Price Before Split"
                  value={originalPrice}
                  onChange={setOriginalPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The share price before the split took effect."
                />
                <CompactInput
                  id="shares-held"
                  label="Shares Held Then"
                  value={sharesHeld}
                  onChange={setSharesHeld}
                  onEnter={runCalculate}
                  min="0"
                  tooltip="Number of shares owned before the split."
                />
              </div>
            </SubSection>

            <SubSection title="Split Ratio">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="split-from"
                  label="Old Shares"
                  value={splitFrom}
                  onChange={setSplitFrom}
                  onEnter={runCalculate}
                  min="0"
                  tooltip="Left side of the ratio, for example 1 in a 1-for-4 split."
                />
                <CompactInput
                  id="split-to"
                  label="New Shares"
                  value={splitTo}
                  onChange={setSplitTo}
                  onEnter={runCalculate}
                  min="0"
                  tooltip="Right side of the ratio, for example 4 in a 1-for-4 split."
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
                  <SubSection title="Current Market">
                    <CompactInput
                      id="current-price"
                      label="Current Share Price"
                      value={currentPrice}
                      onChange={setCurrentPrice}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Today's price, used to measure the return since the split."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Split-Adjusted Price</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.adjustedPrice, 2)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.reverseSplit
                  ? `Reverse split: 1 share becomes ${fmt(1 / results.multiplier, 4)} shares`
                  : `Each old share becomes ${fmt(results.multiplier, 2)} shares at the adjusted price`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shares Now</span>
                <span className="font-extrabold text-foreground">{fmt(results.newShares, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Basis Per Share</span>
                <span className="font-extrabold text-foreground">${fmt(results.basisPerShare, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Return</span>
                <span className={`font-extrabold ${results.returnPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {fmt(results.returnPct, 2)}%
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Split Line</th>
                    <th className="p-2.5 text-right w-[130px]">Before</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Price per share</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.originalPrice, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.adjustedPrice, 2)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Shares owned</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.sharesHeld, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.newShares, 2)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total cost basis</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.costBasisTotal, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.costBasisTotal, 2)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Value at current price</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.unadjustedEquivalent * calcInputs.sharesHeld / results.multiplier, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.currentValue, 2)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Gain against cost basis</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className={`p-2.5 pr-3 text-right ${results.totalGain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      ${fmt(results.totalGain, 2)}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Split Factor</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.multiplier, 4)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Old Price Equivalent</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.unadjustedEquivalent, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Adjusted Return</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.adjustedReturnPct, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Position Value</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.currentValue, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Current Price</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.currentPrice, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Split Direction</span>
                  <span className="text-base font-bold text-foreground">
                    {results.reverseSplit ? "Reverse split" : "Forward split"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Stock Split Adjusted Price Calculator?</h2>
            <p>
              A stock split adjusted price calculator converts a pre-split share price into its equivalent on today&apos;s
              share count, so that old and new quotes can be compared directly. A four-for-one split drops the price to a
              quarter of its previous level without any change in the value of a position, and only by adjusting the
              historical figure can you tell a real decline from a merely mechanical one.
            </p>
            <p>
              The tool also restates your holding. It multiplies your share count by the split factor, recalculates the
              cost basis per share and checks the total value against what you originally paid, which is the arithmetic
              behind every brokerage statement after a split takes effect.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The split factor is the ratio of new shares to old shares. A one-for-four split has a factor of four, so the
              adjusted price is the original divided by four and your share count is multiplied by four. A reverse split
              such as one-for-ten has a factor of a tenth, which multiplies the price by ten and divides the share count by
              the same amount.
            </p>
            <p>
              Cost basis is unchanged in total and simply redistributed across the new share count. The total value of the
              position is also unchanged at the moment of the split, because the price falls exactly in proportion to the
              increase in shares. Any subsequent gain or loss is measured from the adjusted price against the current
              market price, not from the old headline figure.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the adjusted price, with the new share count, the recalculated basis per share and
              the return on the position in the three-stat bar. The table lists price, shares, basis and value before and
              after the split, and the summary restates the split factor and the old-price equivalent.
            </p>
            <p>
              Watch the old-price equivalent line. It shows what the share price would be if no split had ever occurred,
              which is the figure to use when comparing a current quote with a decade-old chart or an analyst&apos;s historical
              target. Keeping that conversion straight prevents the single most common error in reading long-term price
              data.
            </p>
            <p>
              Finally, remember that splitting shares changes none of the fundamentals. The earnings per share, dividend
              per share and book value per share all divide by the same factor, so every per-share metric in an old report
              needs the same adjustment before it can be compared with today. The company is the same business at the same
              valuation; only the unit of measurement has changed. It is also worth knowing that splits are usually a
              signal of confidence rather than a source of value. Companies that split tend to be growing and widely held,
              and the lower price can improve liquidity and make the stock accessible to more investors, but none of that
              changes the underlying business. Treat the split as a bookkeeping event affecting presentation, and keep
              judging the investment on cash flow, competitive position and the price you are paying for both.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stock-split-adjusted-price-calculator" />
          <PopularCalculators exclude="/calculator/stock-split-adjusted-price-calculator" />
        </div>
      </div>
    </>
  );
}
