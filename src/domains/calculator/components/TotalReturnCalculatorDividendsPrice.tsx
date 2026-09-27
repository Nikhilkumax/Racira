"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TotalReturnInputs {
  initialPrice: number;
  finalPrice: number;
  dividends: number;
  years: number;
  shares: number;
  reinvest: boolean;
  inflation: number;
}

const DEFAULTS: TotalReturnInputs = {
  initialPrice: 50,
  finalPrice: 68,
  dividends: 6.5,
  years: 4,
  shares: 100,
  reinvest: true,
  inflation: 2.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface TotalReturnRow {
  year: number;
  price: number;
  dividendPerShare: number;
  sharesHeld: number;
  value: number;
  cash: number;
}

interface TotalReturnResult {
  valid: boolean;
  errorMsg: string;
  finalPrice: number;
  priceReturn: number;
  dividendReturn: number;
  simpleTotal: number;
  annualizedTotal: number;
  initialValue: number;
  finalValue: number;
  cashCollected: number;
  finalShares: number;
  reinvestedShares: number;
  profit: number;
  annualizedWithReinvestment: number;
  realValue: number;
  dividendShare: number;
  rows: TotalReturnRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: TotalReturnInputs): TotalReturnResult {
  const p0 = Math.max(0.01, i.initialPrice);
  const p1 = Math.max(0.01, i.finalPrice);
  const years = Math.max(1, Math.round(i.years));
  const dividendsPerShareTotal = Math.max(0, i.dividends);
  const startingShares = Math.max(0, i.shares);
  const initialValue = startingShares * p0;

  const priceReturn = ((p1 - p0) / p0) * 100;
  const dividendReturn = (dividendsPerShareTotal / p0) * 100;
  const simpleTotal = priceReturn + dividendReturn;
  const annualizedTotal = (Math.pow(1 + simpleTotal / 100, 1 / years) - 1) * 100;

  const priceGrowth = Math.pow(p1 / p0, 1 / years) - 1;
  const dividendPerYear = dividendsPerShareTotal / years;

  let shares = startingShares;
  let cash = 0;
  const rows: TotalReturnRow[] = [];
  for (let year = 1; year <= years; year++) {
    const price = p0 * Math.pow(1 + priceGrowth, year);
    const dividend = shares * dividendPerYear;
    if (i.reinvest) {
      shares += dividend / price;
    } else {
      cash += dividend;
    }
    rows.push({
      year,
      price,
      dividendPerShare: dividendPerYear,
      sharesHeld: shares,
      value: shares * price + cash,
      cash,
    });
  }

  const finalValue = shares * p1 + cash;
  const profit = finalValue - initialValue;
  const annualizedWithReinvestment =
    initialValue > 0 ? (Math.pow(Math.max(finalValue, 0.01) / initialValue, 1 / years) - 1) * 100 : 0;
  const realValue = finalValue / Math.pow(1 + Math.max(0, i.inflation) / 100, years);

  const valid = i.initialPrice > 0 && i.finalPrice > 0 && i.years > 0 && i.shares >= 0 && i.dividends >= 0 && i.inflation >= 0;
  const errorMsg = valid
    ? ""
    : "Enter positive initial and final prices, a positive holding period, and non-negative dividends, share count and inflation.";

  return {
    valid,
    errorMsg,
    finalPrice: p1,
    priceReturn,
    dividendReturn,
    simpleTotal,
    annualizedTotal,
    initialValue,
    finalValue,
    cashCollected: i.reinvest ? 0 : cash,
    finalShares: shares,
    reinvestedShares: shares - startingShares,
    profit,
    annualizedWithReinvestment,
    realValue,
    dividendShare: simpleTotal !== 0 ? (dividendReturn / simpleTotal) * 100 : 0,
    rows,
    summary: [
      { label: "Initial Share Price", value: money2(p0) },
      { label: "Final Share Price", value: money2(p1) },
      { label: "Price Return", value: fmt(priceReturn, 2) + "%", tone: priceReturn >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Dividend Return", value: fmt(dividendReturn, 2) + "%" },
      { label: "Total Simple Return", value: fmt(simpleTotal, 2) + "%", tone: "text-primary" },
      { label: "Annualized Total Return", value: fmt(annualizedTotal, 2) + "%" },
      { label: "Shares Purchased", value: startingShares.toLocaleString("en-US") },
      { label: "Initial Value", value: money2(initialValue) },
      { label: "Final Value", value: money(finalValue) },
      { label: "Profit", value: money(profit), tone: profit >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Dividends per Share", value: money2(dividendsPerShareTotal) },
      { label: "Cash Dividends Kept", value: money(i.reinvest ? 0 : cash) },
      { label: "Shares Added by Reinvestment", value: fmt(shares - startingShares, 3) },
      { label: "Annualized Return in Practice", value: fmt(annualizedWithReinvestment, 2) + "%", tone: "text-primary" },
      { label: "Value in Today's Dollars", value: money(realValue) },
      { label: "Dividend Share of Return", value: fmt(simpleTotal !== 0 ? (dividendReturn / simpleTotal) * 100 : 0, 1) + "%" },
      { label: "Reinvestment", value: i.reinvest ? "On" : "Off" },
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

export default function TotalReturnCalculatorDividendsPrice() {
  const [initialPrice, setInitialPrice] = useState(String(DEFAULTS.initialPrice));
  const [finalPrice, setFinalPrice] = useState(String(DEFAULTS.finalPrice));
  const [dividends, setDividends] = useState(String(DEFAULTS.dividends));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [shares, setShares] = useState(String(DEFAULTS.shares));
  const [reinvest, setReinvest] = useState(DEFAULTS.reinvest);
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TotalReturnInputs => ({
    initialPrice: parseFloat(initialPrice) || 0,
    finalPrice: parseFloat(finalPrice) || 0,
    dividends: parseFloat(dividends) || 0,
    years: parseFloat(years) || 0,
    shares: parseFloat(shares) || 0,
    reinvest,
    inflation: parseFloat(inflation) || 0,
  });

  const [results, setResults] = useState<TotalReturnResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setInitialPrice(String(DEFAULTS.initialPrice));
    setFinalPrice(String(DEFAULTS.finalPrice));
    setDividends(String(DEFAULTS.dividends));
    setYears(String(DEFAULTS.years));
    setShares(String(DEFAULTS.shares));
    setReinvest(DEFAULTS.reinvest);
    setInflation(String(DEFAULTS.inflation));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is total return?",
      answer:
        "Total return is the full profit from an investment, combining price changes with the income it paid. A share that rose from $50 to $68 while paying $6.50 in dividends delivered a $24.50 gain on a $50 cost — a 49% total return, of which 36% came from price and 13% from dividends. Price-only returns systematically understate the performance of income-paying investments, which is why total return is the standard measure in fund reporting.",
    },
    {
      question: "Why does reinvesting dividends change the result so much?",
      answer:
        "Because reinvested dividends buy more shares, which then earn their own dividends and participate in future price gains. Over long periods this compounding of income is a large part of the outcome: in the default example, reinvesting the dividend adds shares each year, so the final value rises above the simple total-return calculation. The same mechanism works in reverse if dividends are spent rather than reinvested — the account compounds on a smaller base.",
    },
    {
      question: "How is the annualized total return calculated?",
      answer:
        "The simple total return over the whole period is converted into a compound annual rate: one plus the total return, raised to the power of one divided by the number of years, minus one. A 49% total return over four years is a 10.5% annualized return. Annualizing makes periods of different lengths comparable, which is essential when comparing a three-year holding with a ten-year one.",
    },
    {
      question: "Does this calculator account for dividend taxes?",
      answer:
        "No — it models the pre-tax mechanics of price and income. In a taxable account, dividends are taxed when paid, so reinvestment would add slightly fewer shares each year, and this tool would overstate the reinvested result modestly. If you want the after-tax picture, the after-tax investment return calculator applies dividend and capital gains taxes explicitly and reports the tax drag in percentage points.",
    },
    {
      question: "What counts as a dividend for the purposes of this tool?",
      answer:
        "Any cash distribution: ordinary dividends, qualified dividends, capital gain distributions from a fund, and interest from a bond fund. The distinction matters for tax but not for total return arithmetic, since all of them reduce the fund's net asset value when paid and all can be reinvested. Enter the total amount distributed per share over the holding period, not the annual rate.",
    },
    {
      question: "Should I use total return or price return to judge an investment?",
      answer:
        "Total return, always, for any investment that pays income. Price return tells you what the market quoted at the end; total return tells you what you earned. The difference is especially large for high-dividend strategies such as utilities, REITs and value funds, where income can be half or more of the long-run result. Using price return to compare them with growth stocks produces systematically misleading conclusions.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Total Return Calculator (Dividends + Price)" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Total Return Calculator (Dividends + Price)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Price & Income">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="initial-price"
                  label="Initial Share Price"
                  value={initialPrice}
                  onChange={setInitialPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0.01"
                  step="0.5"
                  tooltip="The price paid per share at the start of the period."
                />
                <CompactInput
                  id="final-price"
                  label="Final Share Price"
                  value={finalPrice}
                  onChange={setFinalPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0.01"
                  step="0.5"
                  tooltip="The price at the end of the period, before any dividend is added."
                />
                <CompactInput
                  id="dividends"
                  label="Dividends per Share"
                  value={dividends}
                  onChange={setDividends}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="0.25"
                  tooltip="Total cash distributions per share over the whole holding period."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="1"
                  max="50"
                  step="1"
                  tooltip="Used to annualize the total return and to spread the dividends across years."
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
                  <SubSection title="Position & Reinvestment">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="shares"
                        label="Shares Held"
                        value={shares}
                        onChange={setShares}
                        onEnter={runCalculate}
                        min="0"
                        step="10"
                        tooltip="Number of shares owned; used for the dollar figures."
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
                        tooltip="Used to restate the final value in today's purchasing power."
                      />
                      <div className="flex flex-col">
                        <span className="flex items-center text-sm font-semibold text-foreground mb-1">Reinvest Dividends</span>
                        <div className="flex items-center gap-2 h-9">
                          <input
                            id="reinvest"
                            type="checkbox"
                            checked={reinvest}
                            onChange={(e) => setReinvest(e.target.checked)}
                            className="h-4 w-4 accent-[hsl(var(--primary))]"
                          />
                          <label htmlFor="reinvest" className="text-sm text-muted-foreground">
                            Buy more shares with each dividend
                          </label>
                        </div>
                      </div>
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The table assumes the price travels in a straight line (geometrically) from the initial to the final
                      price and that the total dividend is spread evenly across the years. Reinvestment buys shares at each
                      year-end price, so the share count grows as the position compounds. Taxes on dividends are not modelled,
                      which makes the reinvestment figure slightly optimistic for a taxable account.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Return</div>
              <div className={`text-4xl font-extrabold mb-1 tracking-tight ${results.simpleTotal >= 0 ? "text-foreground" : "text-destructive"}`}>
                {fmt(results.simpleTotal, 2)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.annualizedTotal, 2)}% a year · {money(results.profit)} profit on {money(results.initialValue)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price Return</span>
                <span className="font-extrabold text-foreground">{fmt(results.priceReturn, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dividend Return</span>
                <span className="font-extrabold text-emerald-600">{fmt(results.dividendReturn, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Final Value</span>
                <span className="font-extrabold text-foreground">{money(results.finalValue)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[95px]">Price</th>
                    <th className="p-2.5 text-right w-[105px]">Dividend</th>
                    <th className="p-2.5 text-right w-[100px]">Shares</th>
                    <th className="p-2.5 pr-3 text-right w-[115px]">Position Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money2(row.price)}</td>
                      <td className="p-2.5 text-right text-emerald-600">{money2(row.dividendPerShare)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.sharesHeld, 2)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.value)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">End of period</td>
                    <td className="p-2.5 text-right text-foreground">{money2(results.finalPrice)}</td>
                    <td className="p-2.5 text-right text-emerald-600">—</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.finalShares, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.finalValue)}</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Total Return Calculator?</h2>
            <p>
              A total return calculator combines the two ways an investment pays you: the change in its price and the income
              it distributes along the way. Price returns are what headlines quote, but they ignore the dividends, interest and
              distributions that frequently make up a large share of an investment&apos;s actual contribution. Total return is
              the standard used across the fund industry for exactly that reason.
            </p>
            <p>
              The tool reports the price and dividend components separately, annualizes the combined result, and then simulates
              what happens to the position depending on whether the income is reinvested or taken as cash. Reinvestment is the
              default because it is what most long-term investors actually do, and because it is where the compounding of
              income becomes visible.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The price return is the change from the initial to the final share price, expressed as a percentage of the
              initial price. The dividend return adds the total distributions per share over the period on the same base.
              Adding the two gives the simple total return, and converting it to an annual rate makes periods of different
              lengths comparable.
            </p>
            <p>
              The projection table then simulates the position year by year. The price travels smoothly from its initial to its
              final level and the period&apos;s total dividend is spread evenly across the years. When reinvestment is enabled,
              each annual dividend buys additional shares at that year&apos;s price, so the share count rises; when it is
              disabled, the dividends accumulate as cash and the share count stays fixed.
            </p>
            <p>
              In the default scenario, 100 shares bought at $50 grow to a $68 price with $6.50 of dividends per share over four
              years. The price return is 36% and the dividend return is 13%, for a 49% total — 10.5% annualized. With
              reinvestment the share count rises each year and the final value includes those extra shares at the ending price;
              the summary reports the shares added and the practical annualized return of the reinvested path.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the total return with the annualized figure and the dollar profit. The three statistics
              beside it split the return into price and dividend components and show the final position value. The table lists
              the price, the dividend per share, the share count and the position value for every year, so the effect of
              reinvestment is visible line by line.
            </p>
            <p>
              Summary Statistics adds the initial and final prices, the initial and final values, dividends kept as cash,
              shares added through reinvestment, the value in today&apos;s dollars and the dividend share of the total return.
              A useful comparison is to toggle reinvestment off and on: the difference in the final value is the compounding
              benefit of income over that horizon, and it grows sharply as the period lengthens, which is why income
              reinvestment is one of the most powerful and most overlooked habits in investing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-return-calculator-dividends-price" />
          <PopularCalculators exclude="/calculator/total-return-calculator-dividends-price" />
        </div>
      </div>
    </>
  );
}
