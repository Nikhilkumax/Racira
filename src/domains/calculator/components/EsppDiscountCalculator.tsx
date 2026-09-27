"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface EsppInputs {
  offeringPrice: number;
  priceAtPurchase: number;
  discountPct: number;
  contributionAmount: number;
  marginalTaxRate: number;
}

const DEFAULTS: EsppInputs = {
  offeringPrice: 100,
  priceAtPurchase: 120,
  discountPct: 15,
  contributionAmount: 10000,
  marginalTaxRate: 24,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface EsppResult {
  purchaseBase: number;
  purchasePrice: number;
  discountPerShare: number;
  shares: number;
  positionValue: number;
  immediateGain: number;
  effectiveReturnPct: number;
  discountIncome: number;
  taxOnDiscount: number;
  netGainAfterTax: number;
  netReturnPct: number;
  lookbackBenefit: number;
  trueDiscountPct: number;
  usedLookback: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeEspp(i: EsppInputs): EsppResult {
  const invalid =
    i.offeringPrice <= 0 ||
    i.priceAtPurchase <= 0 ||
    i.discountPct < 0 ||
    i.discountPct >= 100 ||
    i.contributionAmount <= 0 ||
    i.marginalTaxRate < 0 ||
    i.marginalTaxRate > 100;

  const purchaseBase = Math.min(i.offeringPrice, i.priceAtPurchase);
  const purchasePrice = purchaseBase * (1 - i.discountPct / 100);
  const discountPerShare = purchaseBase - purchasePrice;
  const shares = purchasePrice > 0 ? i.contributionAmount / purchasePrice : 0;
  const positionValue = shares * i.priceAtPurchase;
  const immediateGain = positionValue - i.contributionAmount;
  const discountIncome = shares * Math.max(0, i.priceAtPurchase - purchasePrice);
  const taxOnDiscount = discountIncome * (i.marginalTaxRate / 100);

  return {
    purchaseBase,
    purchasePrice,
    discountPerShare,
    shares,
    positionValue,
    immediateGain,
    effectiveReturnPct: i.contributionAmount > 0 ? (immediateGain / i.contributionAmount) * 100 : 0,
    discountIncome,
    taxOnDiscount,
    netGainAfterTax: immediateGain - taxOnDiscount,
    netReturnPct: i.contributionAmount > 0 ? ((immediateGain - taxOnDiscount) / i.contributionAmount) * 100 : 0,
    lookbackBenefit: shares * Math.max(0, i.priceAtPurchase - i.offeringPrice),
    trueDiscountPct: i.priceAtPurchase > 0 ? (discountPerShare / i.priceAtPurchase) * 100 : 0,
    usedLookback: i.priceAtPurchase > i.offeringPrice,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter prices and a contribution above zero, a discount below 100%, and a tax rate between 0% and 100%."
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

export default function EsppDiscountCalculator() {
  const [offeringPrice, setOfferingPrice] = useState(String(DEFAULTS.offeringPrice));
  const [priceAtPurchase, setPriceAtPurchase] = useState(String(DEFAULTS.priceAtPurchase));
  const [discountPct, setDiscountPct] = useState(String(DEFAULTS.discountPct));
  const [contributionAmount, setContributionAmount] = useState(String(DEFAULTS.contributionAmount));
  const [marginalTaxRate, setMarginalTaxRate] = useState(String(DEFAULTS.marginalTaxRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): EsppInputs => ({
    offeringPrice: parseFloat(offeringPrice) || 0,
    priceAtPurchase: parseFloat(priceAtPurchase) || 0,
    discountPct: parseFloat(discountPct) || 0,
    contributionAmount: parseFloat(contributionAmount) || 0,
    marginalTaxRate: parseFloat(marginalTaxRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<EsppInputs>(() => DEFAULTS);
  const [results, setResults] = useState<EsppResult>(() => computeEspp(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeEspp(inputs));
  };

  const reset = () => {
    setOfferingPrice(String(DEFAULTS.offeringPrice));
    setPriceAtPurchase(String(DEFAULTS.priceAtPurchase));
    setDiscountPct(String(DEFAULTS.discountPct));
    setContributionAmount(String(DEFAULTS.contributionAmount));
    setMarginalTaxRate(String(DEFAULTS.marginalTaxRate));
    setCalcInputs(DEFAULTS);
    setResults(computeEspp(DEFAULTS));
  };

  const faqs = [
    {
      question: "How does an employee stock purchase plan discount work?",
      answer:
        "You contribute after-tax money through payroll, and at the end of the offering period the accumulated cash buys shares at a discount — commonly fifteen percent — off the lower of the price at the start of the offering period and the price at the end. That lookback feature is the powerful part: if the stock rises over the offering period, your discount is calculated from the old, lower price.",
    },
    {
      question: "What is the immediate return?",
      answer:
        "If the stock is unchanged and you sell immediately, the gain is the discount itself, which on a fifteen percent discount is roughly seventeen point six percent of the money you paid, before tax. When the share price has risen since the offering began, the lookback adds more, and the effective return on your contributions can exceed forty percent in a strong period. That is why ESPPs are often described as one of the few free lunches in employee benefits.",
    },
    {
      question: "How is the discount taxed?",
      answer:
        "On a qualifying disposition held long enough, part of the gain is treated as ordinary income and the rest as capital gain. On a disqualifying disposition — typically a sale soon after purchase — the discount is taxed as ordinary compensation income in the year of sale, and any further movement is a capital gain or loss. Many participants sell immediately and accept the ordinary income treatment rather than carrying concentrated stock risk.",
    },
    {
      question: "Should I hold the shares or sell them right away?",
      answer:
        "Holding can earn better tax treatment and continued upside, but it also concentrates both your salary and your savings in one company. A common middle path is to sell immediately, lock in the discount, and reinvest the proceeds into a diversified portfolio. If you do hold, size the position deliberately — the discount is certain, while the extra return from holding is not.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "ESPP Discount Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ESPP Discount Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Plan Prices">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="offering-price"
                  label="Price at Offering Start"
                  value={offeringPrice}
                  onChange={setOfferingPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Share price when the offering period began."
                />
                <CompactInput
                  id="purchase-price"
                  label="Price at Purchase"
                  value={priceAtPurchase}
                  onChange={setPriceAtPurchase}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Share price at the end of the offering period."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="discount"
                  label="Plan Discount"
                  value={discountPct}
                  onChange={setDiscountPct}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Discount off the lower of the two prices, commonly 15%."
                />
                <CompactInput
                  id="contribution"
                  label="Payroll Contribution"
                  value={contributionAmount}
                  onChange={setContributionAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Total after-tax money accumulated for this purchase."
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
                  <SubSection title="Taxation on a Quick Sale">
                    <CompactInput
                      id="tax-rate"
                      label="Marginal Tax Rate"
                      value={marginalTaxRate}
                      onChange={setMarginalTaxRate}
                      onEnter={runCalculate}
                      suffix="%"
                      min="0"
                      tooltip="Rate applied to the discount element if shares are sold immediately."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Immediate Gain</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.immediateGain, 2)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`A ${fmt(results.effectiveReturnPct, 1)}% return on $${fmt(calcInputs.contributionAmount, 0)} of contributions at purchase`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Purchase Price</span>
                <span className="font-extrabold text-foreground">${fmt(results.purchasePrice, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shares Bought</span>
                <span className="font-extrabold text-foreground">{fmt(results.shares, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net After Tax</span>
                <span className="font-extrabold text-emerald-600">${fmt(results.netGainAfterTax, 2)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Purchase Line</th>
                    <th className="p-2.5 text-right w-[140px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[180px]">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Purchase price</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.purchasePrice, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(calcInputs.discountPct, 0)}% off ${fmt(results.purchaseBase, 2)}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Shares purchased</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.shares, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">at ${fmt(calcInputs.priceAtPurchase, 2)} market</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Position value at purchase</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.positionValue, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">market value</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Discount per share</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.discountPerShare, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.trueDiscountPct, 1)}% of market price</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Lookback benefit</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.lookbackBenefit, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.usedLookback ? "price rose over period" : "no lookback gain"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Tax on discount element</td>
                    <td className="p-2.5 text-right text-foreground">-${fmt(results.taxOnDiscount, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">ordinary income</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net gain after tax</td>
                    <td className="p-2.5 text-right text-emerald-600">${fmt(results.netGainAfterTax, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.netReturnPct, 1)}% on contributions</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Contribution</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.contributionAmount, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Position Value</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.positionValue, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross Return</span>
                  <span className="text-base font-bold text-emerald-600">{fmt(results.effectiveReturnPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Return</span>
                  <span className="text-base font-bold text-emerald-600">{fmt(results.netReturnPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Discount Income</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.discountIncome, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lookback Used</span>
                  <span className="text-base font-bold text-foreground">{results.usedLookback ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an ESPP Discount Calculator?</h2>
            <p>
              An ESPP discount calculator works out what an employee stock purchase plan actually hands you at the moment
              shares are bought. You contribute through payroll, and at the end of the offering period the plan purchases
              stock for you at a discount — most commonly fifteen percent — off the lower of the price at the start and the
              price at the end of the period.
            </p>
            <p>
              This calculator shows the purchase price, the number of shares, the value of the position and the immediate
              gain, then subtracts the tax on the discount element so the number that lands in your account is clear rather
              than theoretical.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The lookback rule is applied first: the purchase price base is the lower of the offering-period start price
              and the price at purchase. The plan discount is then applied to that base. If the stock rose during the
              period, you buy at a discount to the old, lower price while the shares are worth the higher current price,
              which is where the lookback benefit appears as a separate line.
            </p>
            <p>
              Dividing your accumulated contribution by the purchase price gives the share count. Multiplying by the market
              price at purchase gives the position value, and the difference from your contribution is the gross gain. The
              discount element — the market price less the price you paid — is ordinary compensation income, so the
              calculator taxes it at your marginal rate to produce a realistic net figure for an immediate sale.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the immediate gain with its return on contributions. The three-stat bar shows the
              purchase price, the shares bought and the net gain after tax, while the table breaks out the discount per
              share, the lookback benefit, the tax on the discount and the resulting net return.
            </p>
            <p>
              Compare the gross and net return lines. Tax meaningfully reduces an ESPP gain, but even after ordinary income
              treatment the return on contributions is usually far above anything available in a savings account for a
              comparable period. That gap is the reason the discount is worth capturing whenever the plan is offered.
            </p>
            <p>
              The remaining question is what to do with the shares afterwards. Selling immediately converts a certain
              discount into certain cash and keeps your savings diversified; holding adds upside and possibly better tax
              treatment but concentrates your salary and investments in one company. Many participants choose a middle
              path, selling enough to recover contributions and holding a portion only if they would buy that stock with
              cash today. Whatever you decide, decide it deliberately rather than by default. One last planning point:
              because contributions come out of payroll automatically, an ESPP is one of the few savings mechanisms that
              requires no monthly willpower. Raising the contribution rate by a percentage point or two is often the
              simplest available way to increase long-term saving, and if you sell immediately, that money can be swept
              straight into a diversified account before it is ever spent. Treat the plan as a pipeline rather than a
              destination, and its value compounds quietly in the background.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/espp-discount-calculator" />
          <PopularCalculators exclude="/calculator/espp-discount-calculator" />
        </div>
      </div>
    </>
  );
}
