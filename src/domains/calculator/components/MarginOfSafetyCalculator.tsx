"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface SafetyInputs {
  intrinsicValue: number;
  currentPrice: number;
  desiredMarginPct: number;
  stressHaircutPct: number;
}

const DEFAULTS: SafetyInputs = {
  intrinsicValue: 80,
  currentPrice: 52,
  desiredMarginPct: 25,
  stressHaircutPct: 20,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function safetyBand(margin: number): { label: string; tone: string } {
  if (margin >= 40) return { label: "Wide margin", tone: "text-emerald-600" };
  if (margin >= 20) return { label: "Adequate margin", tone: "text-emerald-600" };
  if (margin >= 0) return { label: "Thin margin", tone: "text-amber-600" };
  return { label: "Trading above value", tone: "text-red-600" };
}

interface SafetyResult {
  marginOfSafetyPct: number;
  marginOfSafetyDollars: number;
  buyPrice: number;
  upsidePct: number;
  discountToBuyPricePct: number;
  stressValue: number;
  stressMarginPct: number;
  inBuyZone: boolean;
  passedStressTest: boolean;
  band: string;
  bandTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeSafety(i: SafetyInputs): SafetyResult {
  const invalid =
    i.intrinsicValue <= 0 ||
    i.currentPrice <= 0 ||
    i.desiredMarginPct < 0 ||
    i.desiredMarginPct >= 100 ||
    i.stressHaircutPct < 0 ||
    i.stressHaircutPct >= 100;

  const marginOfSafetyPct = ((i.intrinsicValue - i.currentPrice) / i.intrinsicValue) * 100;
  const buyPrice = i.intrinsicValue * (1 - i.desiredMarginPct / 100);
  const upsidePct = ((i.intrinsicValue - i.currentPrice) / i.currentPrice) * 100;
  const stressValue = i.intrinsicValue * (1 - i.stressHaircutPct / 100);
  const stressMarginPct = ((stressValue - i.currentPrice) / stressValue) * 100;
  const band = safetyBand(marginOfSafetyPct);

  return {
    marginOfSafetyPct,
    marginOfSafetyDollars: i.intrinsicValue - i.currentPrice,
    buyPrice,
    upsidePct,
    discountToBuyPricePct: i.currentPrice > 0 ? ((i.currentPrice - buyPrice) / i.currentPrice) * 100 : 0,
    stressValue,
    stressMarginPct,
    inBuyZone: i.currentPrice <= buyPrice,
    passedStressTest: stressMarginPct >= 0,
    band: band.label,
    bandTone: band.tone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter an intrinsic value and price above zero, and target margin and stress figures between 0% and 100%."
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

export default function MarginOfSafetyCalculator() {
  const [intrinsicValue, setIntrinsicValue] = useState(String(DEFAULTS.intrinsicValue));
  const [currentPrice, setCurrentPrice] = useState(String(DEFAULTS.currentPrice));
  const [desiredMarginPct, setDesiredMarginPct] = useState(String(DEFAULTS.desiredMarginPct));
  const [stressHaircutPct, setStressHaircutPct] = useState(String(DEFAULTS.stressHaircutPct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SafetyInputs => ({
    intrinsicValue: parseFloat(intrinsicValue) || 0,
    currentPrice: parseFloat(currentPrice) || 0,
    desiredMarginPct: parseFloat(desiredMarginPct) || 0,
    stressHaircutPct: parseFloat(stressHaircutPct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<SafetyInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SafetyResult>(() => computeSafety(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeSafety(inputs));
  };

  const reset = () => {
    setIntrinsicValue(String(DEFAULTS.intrinsicValue));
    setCurrentPrice(String(DEFAULTS.currentPrice));
    setDesiredMarginPct(String(DEFAULTS.desiredMarginPct));
    setStressHaircutPct(String(DEFAULTS.stressHaircutPct));
    setCalcInputs(DEFAULTS);
    setResults(computeSafety(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a margin of safety?",
      answer:
        "It is the gap between the price you pay and your estimate of what an asset is actually worth. Buying a business you value at eighty dollars for fifty-two dollars leaves a margin of safety of thirty-five percent. The margin exists because your valuation will sometimes be wrong: it absorbs estimation error, bad luck and unforeseen deterioration without turning the investment into a loss.",
    },
    {
      question: "How large should the margin be?",
      answer:
        "It should scale with uncertainty. A stable, cash-generative business with predictable demand can be bought with a smaller discount than a cyclical or fast-changing one. Many value investors look for twenty to thirty percent on quality businesses and fifty percent or more where the future is genuinely hard to forecast. The margin is compensation for being wrong, so the wider the range of plausible outcomes, the wider it should be.",
    },
    {
      question: "Is margin of safety the same as a discount to peers?",
      answer:
        "No, and the distinction matters. Trading below a peer multiple only tells you the market values the company less than its competitors, which may be entirely justified by weaker economics. A margin of safety is measured against your own estimate of intrinsic value derived from cash flows, not against someone else's price. Relative cheapness can be a useful signal, but it is not the same as a buffer.",
    },
    {
      question: "What if the price never reaches my buy target?",
      answer:
        "Then you do not buy, and that is a legitimate outcome. Waiting with cash has an opportunity cost, but buying without a margin converts a cautious decision into a hopeful one. A practical compromise is to build the position in stages, buying a partial stake when the discount is reasonable and adding if the price falls further, which keeps some exposure while preserving the discipline of valuation.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Margin of Safety Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Margin of Safety Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Valuation">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="intrinsic-value"
                  label="Intrinsic Value"
                  value={intrinsicValue}
                  onChange={setIntrinsicValue}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Your estimate of what one share is worth."
                />
                <CompactInput
                  id="current-price"
                  label="Current Price"
                  value={currentPrice}
                  onChange={setCurrentPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The price the market is asking today."
                />
              </div>
            </SubSection>

            <SubSection title="Target Discount">
              <CompactInput
                id="desired-margin"
                label="Desired Margin of Safety"
                value={desiredMarginPct}
                onChange={setDesiredMarginPct}
                onEnter={runCalculate}
                suffix="%"
                min="0"
                tooltip="The discount to intrinsic value you require before buying."
              />
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
                  <SubSection title="Stress Test">
                    <CompactInput
                      id="stress-haircut"
                      label="Valuation Haircut"
                      value={stressHaircutPct}
                      onChange={setStressHaircutPct}
                      onEnter={runCalculate}
                      suffix="%"
                      min="0"
                      tooltip="How far your estimate could be too high — used to recheck the buffer."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Margin of Safety</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.marginOfSafetyPct, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`Paying $${fmt(calcInputs.currentPrice, 2)} for an asset valued at $${fmt(calcInputs.intrinsicValue, 2)} — ${results.band.toLowerCase()}`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Buy Price</span>
                <span className="font-extrabold text-foreground">${fmt(results.buyPrice, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Upside to Value</span>
                <span className="font-extrabold text-emerald-600">{fmt(results.upsidePct, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Safety in Dollars</span>
                <span className="font-extrabold text-foreground">${fmt(results.marginOfSafetyDollars, 2)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Valuation Line</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Reading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Intrinsic value</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.intrinsicValue, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">your estimate</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Current price</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.currentPrice, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">market ask</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Margin of safety</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.marginOfSafetyPct, 1)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">buffer against error</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Buy price at target discount</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.buyPrice, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.inBuyZone ? "price is inside the zone" : "price is above the zone"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Stressed intrinsic value</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.stressValue, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.stressMarginPct, 1)}% margin</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Distance to buy price</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.discountToBuyPricePct, 1)}%</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Target Margin</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.desiredMarginPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Current Margin</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.marginOfSafetyPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Upside to Intrinsic</span>
                  <span className="text-base font-bold text-emerald-600">{fmt(results.upsidePct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Stress Haircut</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.stressHaircutPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Survives Stress Test</span>
                  <span className={`text-base font-bold ${results.passedStressTest ? "text-emerald-600" : "text-amber-600"}`}>
                    {results.passedStressTest ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Buy Decision</span>
                  <span className={`text-base font-bold ${results.inBuyZone ? "text-emerald-600" : "text-amber-600"}`}>
                    {results.inBuyZone ? "Inside buy zone" : "Wait for a wider gap"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Margin of Safety Calculator?</h2>
            <p>
              A margin of safety calculator measures the gap between the price you would pay and the value you believe an
              asset is worth. If your estimate of intrinsic value is eighty dollars and the shares trade at fifty-two, the
              margin is thirty-five percent. That gap is not extra profit; it is the cushion that absorbs the times your
              estimate turns out to be too optimistic.
            </p>
            <p>
              The concept, popularised by Benjamin Graham and central to value investing, rests on a simple admission: no
              valuation is precise. Since you cannot know the future exactly, the only reliable protection is to buy at a
              price low enough that ordinary disappointments do not turn into permanent losses.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The margin is expressed as a percentage of intrinsic value: the difference between value and price, divided
              by value. The calculator also converts your target discount into an actual buy price, which is the number
              you would work with in practice — for a twenty-five percent target, eighty dollars of value implies a sixty
              dollar limit.
            </p>
            <p>
              A stress-test field then revalues the asset after a haircut to your estimate, asking whether the buffer
              survives if you were too optimistic. That second check is the more demanding one, because it tests the
              decision against the possibility that your analysis, not just the market, is wrong.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the margin of safety as a percentage of intrinsic value. The three-stat bar shows
              the target buy price, the upside to your valuation and the buffer in dollars, while the table walks through
              the estimate, the price, the resulting margin and the stressed value.
            </p>
            <p>
              Read the stressed margin alongside the headline figure. If a twenty percent haircut to your valuation leaves
              no margin at all, the position depends entirely on your estimate being right — which is precisely the
              situation a margin of safety is designed to avoid. A wide margin that survives a pessimistic revision is
              worth far more than a narrow one that does not.
            </p>
            <p>
              Finally, pair the number with patience. A margin of safety only pays if you resist the temptation to widen
              your valuation estimate whenever the price rises. Set the buy price in advance, write down the assumptions
              behind it, and let the discipline of the calculation — rather than the mood of the market — decide when to
              act. That is what separates a rule from a reaction. One further discipline helps: review the intrinsic value
              estimate on a schedule — after each earnings report, for instance — and only change it when the underlying
              cash flow assumptions genuinely change. Revising a valuation upward simply because the share price has risen
              turns the margin of safety into a justification for paying more, which defeats its entire purpose. The
              calculator is most useful when both the value estimate and the required discount are decided before emotions
              are involved in the decision, and then held steady through all of the noise of the following months of market trading.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/margin-of-safety-calculator" />
          <PopularCalculators exclude="/calculator/margin-of-safety-calculator" />
        </div>
      </div>
    </>
  );
}
