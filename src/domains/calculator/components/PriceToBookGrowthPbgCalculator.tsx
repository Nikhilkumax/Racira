"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PbgInputs {
  sharePrice: number;
  bookValuePerShare: number;
  growthRate: number;
  dividendYield: number;
  benchmarkPbg: number;
}

const DEFAULTS: PbgInputs = {
  sharePrice: 38,
  bookValuePerShare: 16,
  growthRate: 12,
  dividendYield: 2.5,
  benchmarkPbg: 0.2,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function pbgBand(pbg: number, benchmark: number): { label: string; tone: string } {
  if (benchmark <= 0) return { label: "No benchmark", tone: "text-muted-foreground" };
  const ratio = pbg / benchmark;
  if (ratio <= 0.75) return { label: "Deep value", tone: "text-emerald-600" };
  if (ratio <= 1.15) return { label: "Reasonable", tone: "text-emerald-600" };
  if (ratio <= 1.6) return { label: "Rich", tone: "text-amber-600" };
  return { label: "Very rich", tone: "text-red-600" };
}

interface PbgResult {
  priceToBook: number;
  pbg: number;
  adjustedPbg: number;
  totalGrowth: number;
  fairValueAtBenchmark: number;
  upsidePct: number;
  premiumToFairValuePct: number;
  bookValuePerShare: number;
  tolerancePct: number;
  band: string;
  bandTone: string;
  valid: boolean;
  errorMsg: string;
}

function computePbg(i: PbgInputs): PbgResult {
  const invalid =
    i.sharePrice <= 0 ||
    i.bookValuePerShare <= 0 ||
    i.growthRate <= 0 ||
    i.dividendYield < 0 ||
    i.benchmarkPbg <= 0;

  const priceToBook = i.bookValuePerShare > 0 ? i.sharePrice / i.bookValuePerShare : 0;
  const pbg = i.growthRate > 0 ? priceToBook / i.growthRate : 0;
  const totalGrowth = i.growthRate + i.dividendYield;
  const adjustedPbg = totalGrowth > 0 ? priceToBook / totalGrowth : 0;
  const fairValueAtBenchmark = i.bookValuePerShare * i.growthRate * i.benchmarkPbg;
  const band = pbgBand(pbg, i.benchmarkPbg);

  return {
    priceToBook,
    pbg,
    adjustedPbg,
    totalGrowth,
    fairValueAtBenchmark,
    upsidePct: i.sharePrice > 0 ? ((fairValueAtBenchmark - i.sharePrice) / i.sharePrice) * 100 : 0,
    premiumToFairValuePct: i.sharePrice > 0 ? ((i.sharePrice - fairValueAtBenchmark) / fairValueAtBenchmark) * 100 : 0,
    bookValuePerShare: i.bookValuePerShare,
    tolerancePct: i.growthRate > 0 ? (pbg / i.benchmarkPbg - 1) * 100 : 0,
    band: band.label,
    bandTone: band.tone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a share price, book value and growth rate above zero, and non-negative dividend yield with a positive benchmark."
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

export default function PriceToBookGrowthPbgCalculator() {
  const [sharePrice, setSharePrice] = useState(String(DEFAULTS.sharePrice));
  const [bookValuePerShare, setBookValuePerShare] = useState(String(DEFAULTS.bookValuePerShare));
  const [growthRate, setGrowthRate] = useState(String(DEFAULTS.growthRate));
  const [dividendYield, setDividendYield] = useState(String(DEFAULTS.dividendYield));
  const [benchmarkPbg, setBenchmarkPbg] = useState(String(DEFAULTS.benchmarkPbg));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PbgInputs => ({
    sharePrice: parseFloat(sharePrice) || 0,
    bookValuePerShare: parseFloat(bookValuePerShare) || 0,
    growthRate: parseFloat(growthRate) || 0,
    dividendYield: parseFloat(dividendYield) || 0,
    benchmarkPbg: parseFloat(benchmarkPbg) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<PbgInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PbgResult>(() => computePbg(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePbg(inputs));
  };

  const reset = () => {
    setSharePrice(String(DEFAULTS.sharePrice));
    setBookValuePerShare(String(DEFAULTS.bookValuePerShare));
    setGrowthRate(String(DEFAULTS.growthRate));
    setDividendYield(String(DEFAULTS.dividendYield));
    setBenchmarkPbg(String(DEFAULTS.benchmarkPbg));
    setCalcInputs(DEFAULTS);
    setResults(computePbg(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the price-to-book-to-growth ratio?",
      answer:
        "PBG divides the price-to-book multiple by the growth rate, so a company growing quickly is not penalised for carrying a higher book multiple. It works the same way as the better-known PEG ratio, which normalises price-to-earnings by growth: the idea is to pay for growth once rather than twice. A lower reading means the market is charging less per unit of expansion.",
    },
    {
      question: "When is price-to-book more useful than price-to-earnings?",
      answer:
        "Book value is more meaningful for banks, insurers and other balance-sheet-driven businesses, where assets and liabilities are marked close to market and shareholder equity is the core of the franchise. It is far less useful for asset-light companies such as software firms, whose value sits in intangibles that accounting rules do not capitalise. Using P/B on a service business usually produces a multiple with little information in it.",
    },
    {
      question: "What counts as a good PBG ratio?",
      answer:
        "As with PEG, the sensible benchmark is one: a PBG near one suggests the multiple roughly matches the growth rate, and below that suggests growth is underpriced. Because P/B levels vary widely across industries, the more practical approach is to compare a company against its own history and its closest peers rather than applying a universal threshold. The benchmark field in this calculator exists for exactly that comparison.",
    },
    {
      question: "What are the limitations of this ratio?",
      answer:
        "It assumes growth is real, sustainable and eventually converts into cash returns. Rapid book growth funded by issuing shares, or by acquisitions that create goodwill rather than productive assets, can flatter the multiple. Growth also needs to be measured over a stable period; a single exceptional year distorts the ratio badly. Treat PBG as a screening tool that raises questions rather than settles them.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Price to Book Growth (PBG) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Price to Book Growth (PBG) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Per-Share Data">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="share-price"
                  label="Share Price"
                  value={sharePrice}
                  onChange={setSharePrice}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Current market price per share."
                />
                <CompactInput
                  id="book-value"
                  label="Book Value Per Share"
                  value={bookValuePerShare}
                  onChange={setBookValuePerShare}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Shareholder equity divided by shares outstanding."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="growth"
                  label="Book Value Growth"
                  value={growthRate}
                  onChange={setGrowthRate}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Expected annual growth in book value per share."
                />
                <CompactInput
                  id="dividend-yield"
                  label="Dividend Yield"
                  value={dividendYield}
                  onChange={setDividendYield}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Annual dividend as a percentage of price."
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
                  <SubSection title="Benchmark">
                    <CompactInput
                      id="benchmark"
                      label="Benchmark PBG"
                      value={benchmarkPbg}
                      onChange={setBenchmarkPbg}
                      onEnter={runCalculate}
                      tooltip="The PBG level you consider fair — peer or sector median."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">PBG Ratio</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(results.pbg, 3)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {`Book multiple of ${fmt(results.priceToBook, 2)}x against ${fmt(calcInputs.growthRate, 1)}% growth — ${results.band.toLowerCase()}`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price to Book</span>
                <span className="font-extrabold text-foreground">{fmt(results.priceToBook, 2)}x</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fair Value</span>
                <span className="font-extrabold text-foreground">${fmt(results.fairValueAtBenchmark, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Upside</span>
                <span className={`font-extrabold ${results.upsidePct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {fmt(results.upsidePct, 1)}%
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Valuation Line</th>
                    <th className="p-2.5 text-right w-[120px]">Value</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Reading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Price to book</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.priceToBook, 2)}x</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">equity multiple</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">PBG ratio</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.pbg, 3)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">multiple per point of growth</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Dividend-adjusted PBG</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.adjustedPbg, 3)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.totalGrowth, 1)}% total return</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Fair value at benchmark</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.fairValueAtBenchmark, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">vs ${fmt(calcInputs.sharePrice, 2)} price</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Premium to fair value</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.premiumToFairValuePct, 1)}%</td>
                    <td className={`p-2.5 pr-3 text-right ${results.bandTone}`}>{results.band}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Book Value Per Share</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.bookValuePerShare, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Growth Per Point of P/B</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.growthRate / (results.priceToBook || 1), 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Benchmark PBG</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.benchmarkPbg, 3)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Distance From Benchmark</span>
                  <span className={`text-base font-bold ${results.tolerancePct <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {fmt(results.tolerancePct, 1)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dividend Yield</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.dividendYield, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Valuation Signal</span>
                  <span className={`text-base font-bold ${results.bandTone}`}>{results.band}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Price to Book Growth (PBG) Calculator?</h2>
            <p>
              A PBG calculator divides a company&apos;s price-to-book multiple by its rate of growth, the same way the PEG
              ratio divides price-to-earnings by growth. The purpose is to avoid paying twice for expansion: a bank
              growing book value quickly legitimately trades at a higher multiple than a stagnant peer, and dividing by
              growth puts the two on a comparable footing.
            </p>
            <p>
              The measure is most useful for businesses where book value means something — lenders, insurers, and
              capital-intensive operators whose equity reflects real productive assets. For asset-light companies most of
              the value is intangible and never appears on the balance sheet, which makes the multiple noisy and the
              growth-adjusted version noisier still.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator first finds price-to-book by dividing the share price by book value per share. It then
              divides that multiple by the expected growth rate to produce PBG. Because dividends also contribute to the
              return an investor receives, a second version divides the multiple by growth plus dividend yield, giving a
              total-return-adjusted reading that is fairer to income-paying companies.
            </p>
            <p>
              A benchmark field turns the ratio into a valuation tool. Multiplying book value per share by growth and by
              the benchmark PBG gives the price at which this company would trade in line with your reference level. The
              difference between that figure and today&apos;s price is the premium or discount you are paying for the growth
              on offer.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the PBG ratio with the underlying book multiple and growth rate stated beside it.
              The three-stat bar shows price-to-book, the benchmark fair value and the implied upside or downside, while
              the table walks through the multiple, the dividend-adjusted version and the premium being paid.
            </p>
            <p>
              Compare the raw and dividend-adjusted readings. A wide gap means a meaningful share of the expected return
              is coming from cash distributions rather than reinvested book growth, which is a lower-risk profile and
              deserves a different benchmark. If the two readings are similar, the entire case rests on reinvestment
              doing the work.
            </p>
            <p>
              Finally, keep the growth assumption honest. PBG is extremely sensitive to it, and a company that grew book
              value quickly during a boom may not repeat that performance. Check whether growth came from retained
              earnings or from issuing shares and acquisitions, since only the former reliably compounds per-share value.
              When growth is uncertain, a lower multiple is the only real protection. It also pays to pair PBG with a
              quality check on returns on equity, because book value can grow simply by retaining earnings in a mediocre
              business without improving the return those assets generate. Growth in equity that comes from a company
              earning well above its cost of capital is worth a premium; growth produced by a business barely covering its
              capital costs is not, and the multiple alone cannot tell the two apart. Read the ratio as a screening filter,
              then confirm that the underlying growth is genuinely profitable before acting on the ratio in any way.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/price-to-book-growth-pbg-calculator" />
          <PopularCalculators exclude="/calculator/price-to-book-growth-pbg-calculator" />
        </div>
      </div>
    </>
  );
}
