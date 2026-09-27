"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BnplInputs {
  purchaseAmount: number;
  instalments: number;
  lateFee: number;
  missedInstalments: number;
  upliftPct: number;
  returnFee: number;
  cardApr: number;
}

const DEFAULTS: BnplInputs = {
  purchaseAmount: 400,
  instalments: 4,
  lateFee: 8,
  missedInstalments: 1,
  upliftPct: 0,
  returnFee: 0,
  cardApr: 24.99,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

/** Solve the periodic rate for a present value, single payment and number of periods. */
function solvePeriodicRate(pv: number, payment: number, n: number): number {
  if (pv <= 0 || payment <= 0 || n <= 0) return 0;
  let lo = 0;
  let hi = 3;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const f = Math.pow(1 + mid, n);
    const value = mid > 0 ? (payment * (f - 1)) / (mid * f) : payment * n;
    if (value > pv) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface BnplResult {
  instalmentAmount: number;
  upliftCost: number;
  lateFeeTotal: number;
  totalPaid: number;
  extraCost: number;
  equivalentAprPct: number;
  cardInterest: number;
  cardTotal: number;
  cheaper: string;
  valid: boolean;
  errorMsg: string;
}

function computeBnpl(i: BnplInputs): BnplResult {
  const invalid = i.purchaseAmount <= 0 || i.instalments <= 0 || i.lateFee < 0 || i.missedInstalments < 0 || i.upliftPct < 0;

  const upliftCost = (i.purchaseAmount * i.upliftPct) / 100;
  const lateFeeTotal = i.lateFee * i.missedInstalments;
  const totalPaid = i.purchaseAmount + upliftCost + lateFeeTotal + i.returnFee;
  const extraCost = totalPaid - i.purchaseAmount;
  const instalmentAmount = totalPaid / i.instalments;

  // Treat the BNPL plan as a loan of the purchase amount repaid in equal instalments.
  const periodicRate = solvePeriodicRate(i.purchaseAmount, instalmentAmount, i.instalments);
  const equivalentAprPct = periodicRate * 12 * 100;

  // Same purchase financed on a credit card repaid over the same number of months.
  const cardMonthly = i.purchaseAmount / i.instalments;
  const cardR = i.cardApr / 100 / 12;
  let bal = i.purchaseAmount;
  let cardInterest = 0;
  for (let m = 0; m < i.instalments && bal > 0.005; m++) {
    const int = bal * cardR;
    const pay = Math.min(cardMonthly, bal + int);
    bal -= pay - int;
    cardInterest += int;
  }
  const cardTotal = i.purchaseAmount + cardInterest;

  return {
    instalmentAmount,
    upliftCost,
    lateFeeTotal,
    totalPaid,
    extraCost,
    equivalentAprPct,
    cardInterest,
    cardTotal,
    cheaper: extraCost <= cardInterest ? "BNPL" : "Credit Card",
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive purchase amount and instalment count, and non-negative fee and uplift figures."
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

export default function BuyNowPayLaterTrueCostCalculator() {
  const [purchaseAmount, setPurchaseAmount] = useState(String(DEFAULTS.purchaseAmount));
  const [instalments, setInstalments] = useState(String(DEFAULTS.instalments));
  const [lateFee, setLateFee] = useState(String(DEFAULTS.lateFee));
  const [missedInstalments, setMissedInstalments] = useState(String(DEFAULTS.missedInstalments));
  const [upliftPct, setUpliftPct] = useState(String(DEFAULTS.upliftPct));
  const [returnFee, setReturnFee] = useState(String(DEFAULTS.returnFee));
  const [cardApr, setCardApr] = useState(String(DEFAULTS.cardApr));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BnplInputs => ({
    purchaseAmount: parseFloat(purchaseAmount) || 0,
    instalments: parseFloat(instalments) || 0,
    lateFee: parseFloat(lateFee) || 0,
    missedInstalments: parseFloat(missedInstalments) || 0,
    upliftPct: parseFloat(upliftPct) || 0,
    returnFee: parseFloat(returnFee) || 0,
    cardApr: parseFloat(cardApr) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<BnplInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BnplResult>(() => computeBnpl(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeBnpl(inputs));
  };

  const reset = () => {
    setPurchaseAmount(String(DEFAULTS.purchaseAmount));
    setInstalments(String(DEFAULTS.instalments));
    setLateFee(String(DEFAULTS.lateFee));
    setMissedInstalments(String(DEFAULTS.missedInstalments));
    setUpliftPct(String(DEFAULTS.upliftPct));
    setReturnFee(String(DEFAULTS.returnFee));
    setCardApr(String(DEFAULTS.cardApr));
    setCalcInputs(DEFAULTS);
    setResults(computeBnpl(DEFAULTS));
  };

  const faqs = [
    {
      question: "Is buy now pay later really interest free?",
      answer:
        "The instalment plan itself usually charges no interest if every payment is made on time, which is why it is marketed as zero cost. The cost appears when a payment fails or is late: most providers charge a fixed late fee per missed instalment, and repeated misses can lead to the account being paused and the full remaining balance falling due. Because the plan is not reported as a revolving tradeline, it also builds no credit history, and missing payments can still be reported to the bureaus by some providers.",
    },
    {
      question: "What is the true cost of a buy now pay later plan?",
      answer:
        "It is the total you pay above the sticker price. That includes late fees on missed instalments, any merchant price uplift baked into the item's listed price, return or restocking fees, and the opportunity cost of the cash flow. When the extra amount is converted into an annualised interest rate, even a small fixed late fee on a short plan produces a surprisingly high equivalent APR, which is why the comparison against a credit card is not the walkover it appears to be.",
    },
    {
      question: "How is the equivalent APR calculated?",
      answer:
        "The plan is treated as a loan of the purchase amount repaid in equal instalments. The calculator solves, by bisection, for the monthly rate at which the present value of those instalments equals the purchase price, then annualises it by multiplying by twelve. If a plan is fully on time and carries no uplift, that rate is zero; add a late fee and the rate rises sharply because the fee is spread over only a few short instalment periods.",
    },
    {
      question: "When should I use buy now pay later instead of a credit card?",
      answer:
        "BNPL works well when you can guarantee every instalment will be paid on time and the price is the same as paying in full, because it converts a purchase into an interest-free budget plan with no credit impact. It is a poor choice when there is any risk of missing a payment, since a fixed late fee on a small balance dwarfs the interest a card would charge over the same short period, and when the merchant has raised the list price to absorb the provider&apos;s fee.",
    },
    {
      question: "Does buy now pay later affect my credit score?",
      answer:
        "Most pay-in-four plans do not report to the credit bureaus, so on-time payments build no history and the plan is invisible to future lenders. That cuts both ways: it means the plan does not help you build credit, and a lender assessing your affordability may not see the commitment either. Some longer-term instalment products do report, and unpaid balances referred to collections can appear on your report, so always check the provider&apos;s terms before relying on BNPL being invisible.",
    },
  ];

  const breakdownRows = [
    { label: "Purchase Price", amount: `$${fmt(calcInputs.purchaseAmount)}`, note: "Sticker price" },
    { label: "Price Uplift", amount: `$${fmt(results.upliftCost)}`, note: `${fmt(calcInputs.upliftPct, 2)}% merchant markup` },
    { label: "Late Fees", amount: `$${fmt(results.lateFeeTotal)}`, note: `${fmt(calcInputs.missedInstalments, 0)} missed × $${fmt(calcInputs.lateFee, 2)}` },
    { label: "Return Fee", amount: `$${fmt(calcInputs.returnFee)}`, note: "If returned or cancelled" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Buy Now Pay Later True Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Buy Now Pay Later True Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Purchase & Plan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="amount"
                  label="Purchase Amount"
                  value={purchaseAmount}
                  onChange={setPurchaseAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Price of the item being financed."
                />
                <CompactInput
                  id="instalments"
                  label="Number of Instalments"
                  value={instalments}
                  onChange={setInstalments}
                  onEnter={runCalculate}
                  suffix="x"
                  min="1"
                  tooltip="How many instalments the plan splits the purchase into."
                />
              </div>
            </SubSection>

            <SubSection title="Missed Payments">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="late-fee"
                  label="Late Fee"
                  value={lateFee}
                  onChange={setLateFee}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Fixed fee charged for each missed or late instalment."
                />
                <CompactInput
                  id="missed"
                  label="Missed Instalments"
                  value={missedInstalments}
                  onChange={setMissedInstalments}
                  onEnter={runCalculate}
                  suffix="x"
                  min="0"
                  tooltip="Number of instalments you expect to pay late."
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
                  <SubSection title="Hidden Costs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="uplift"
                        label="Merchant Price Uplift"
                        value={upliftPct}
                        onChange={setUpliftPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        min="0"
                        tooltip="Markup embedded in the price to cover the provider's merchant fee."
                      />
                      <CompactInput
                        id="return-fee"
                        label="Return Fee"
                        value={returnFee}
                        onChange={setReturnFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Fee charged if the item is returned or the plan cancelled."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Comparison Card">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="card-apr"
                        label="Credit Card APR"
                        value={cardApr}
                        onChange={setCardApr}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        tooltip="Card APR used to price the same purchase on revolving credit."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Cheaper: {results.cheaper}
                        </div>
                      </div>
                    </div>
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

            {results.valid && results.extraCost === 0 && (
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5">
                <div className="text-sm font-bold text-emerald-700 mb-1 uppercase tracking-wider">Zero-cost plan</div>
                <div className="text-sm font-medium text-foreground">
                  Every instalment is on time with no uplift, so this plan costs nothing above the purchase price.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Extra Cost vs Paying in Full</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${fmt(results.extraCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(calcInputs.instalments, 0)} payments of ${fmt(results.instalmentAmount)} &middot; equivalent APR{" "}
                {fmt(results.equivalentAprPct, 2)}%
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalPaid)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Equivalent APR</span>
                <span className="font-extrabold text-foreground">{fmt(results.equivalentAprPct, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Card Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.cardInterest)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 text-right w-[120px]">Amount</th>
                    <th className="p-2.5 pr-3">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.amount}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Paid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalPaid)}</td>
                    <td className="p-2.5 pr-3 text-foreground">Extra: ${fmt(results.extraCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Purchase Amount</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.purchaseAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Instalment</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.instalmentAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Cost</span>
                  <span className="text-base font-bold text-primary">${fmt(results.extraCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equivalent APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.equivalentAprPct, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Credit Card Total</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.cardTotal)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cheaper Option</span>
                  <span className="text-base font-bold text-foreground">{results.cheaper}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Saving vs Card</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(Math.abs(results.extraCost - results.cardInterest))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Buy Now Pay Later True Cost Calculator?</h2>
            <p>
              A buy now pay later true cost calculator works out what an instalment plan actually costs once late fees,
              merchant price markups and return charges are included. BNPL is marketed as interest-free, and when every
              payment is made on time it genuinely is. The cost appears at the edges: a fixed fee for each missed
              instalment, a price uplift where the merchant has absorbed the provider&apos;s commission, and the loss of
              the discount you might have negotiated for paying in full. The calculator converts all of that into a single
              extra-cost figure and an equivalent annual interest rate.
            </p>
            <p>
              The comparison that matters is against the realistic alternative, which for most shoppers is a credit card.
              Because BNPL spreads a small purchase across only a handful of short periods, even a modest fixed late fee
              translates into a very high annualised rate, and the calculator makes that translation explicit so the choice
              can be made on numbers rather than on the promise of zero percent.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator starts from the purchase price and adds any merchant price uplift, the late fee multiplied by
              the number of missed instalments, and any return fee, to arrive at the total paid. The extra cost is that
              total minus the sticker price, and the instalment amount is the total divided by the number of payments. To
              express the cost as a rate, the plan is treated as a loan of the purchase amount repaid in equal instalments,
              and the calculator solves by bisection for the monthly rate at which the present value of those instalments
              equals the price, then multiplies by twelve to annualise it.
            </p>
            <p>
              For the comparison, the same purchase is amortised on a credit card at the APR you enter, repaid over the
              same number of months with a level payment, so the interest the card would charge is computed on the actual
              declining balance rather than as a flat percentage. Whichever route has the lower total cost is reported as
              the cheaper option.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the extra cost above paying in full, with the instalment amount and equivalent APR
              beneath it. A zero-cost plan, where every instalment is on time and no uplift is present, is flagged
              explicitly. The three statistics beside the card give the total paid, the equivalent APR, and the interest a
              credit card would have charged, and the breakdown table itemises each cost component so you can see exactly
              where the money goes.
            </p>
            <p>
              Summary Statistics adds the instalment amount, the credit-card total, the cheaper option and the cash saving
              between the two. Treat the output as a planning estimate: providers vary in how late fees escalate, some cap
              total charges, and the merchant uplift is often invisible because it is embedded in the list price rather
              than shown as a fee. The practical rule the numbers support is that BNPL is genuinely free only when every
              instalment is certain to be paid on time, and that the moment a payment is at risk, a fixed late fee on a
              short plan is usually more expensive than the interest a card would accrue over the same period.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/buy-now-pay-later-true-cost-calculator" />
          <PopularCalculators exclude="/calculator/buy-now-pay-later-true-cost-calculator" />
        </div>
      </div>
    </>
  );
}
