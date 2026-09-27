"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ForeignFeeInputs {
  monthlySpend: number;
  fxFeePct: number;
  monthsAbroad: number;
  cashAdvancePerTrip: number;
  cashAdvanceFeePct: number;
  noFxAnnualFee: number;
}

const DEFAULTS: ForeignFeeInputs = {
  monthlySpend: 1500,
  fxFeePct: 3,
  monthsAbroad: 4,
  cashAdvancePerTrip: 500,
  cashAdvanceFeePct: 5,
  noFxAnnualFee: 95,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface ForeignFeeResult {
  purchaseFees: number;
  cashAdvanceFees: number;
  totalCost: number;
  totalSpend: number;
  monthlyAverage: number;
  costPer1000: number;
  effectiveCostPct: number;
  noFxCardCost: number;
  netSavings: number;
  spendToJustify: number;
  valid: boolean;
  errorMsg: string;
}

function computeForeignFee(i: ForeignFeeInputs): ForeignFeeResult {
  const invalid =
    i.monthlySpend < 0 ||
    i.fxFeePct < 0 ||
    i.monthsAbroad < 0 ||
    i.monthsAbroad > 12 ||
    i.cashAdvancePerTrip < 0 ||
    i.cashAdvanceFeePct < 0 ||
    i.noFxAnnualFee < 0;

  const purchaseSpend = i.monthlySpend * i.monthsAbroad;
  const cashAdvanceTotal = i.cashAdvancePerTrip * i.monthsAbroad;
  const purchaseFees = purchaseSpend * (i.fxFeePct / 100);
  const cashAdvanceFees = cashAdvanceTotal * (i.cashAdvanceFeePct / 100);
  const totalCost = purchaseFees + cashAdvanceFees;
  const totalSpend = purchaseSpend + cashAdvanceTotal;

  // A no-foreign-fee card removes the purchase fees and pays for itself through
  // its annual fee; cash advance fees still apply on most such cards.
  const noFxCardCost = i.noFxAnnualFee + cashAdvanceFees;

  return {
    purchaseFees,
    cashAdvanceFees,
    totalCost,
    totalSpend,
    monthlyAverage: i.monthsAbroad > 0 ? totalCost / i.monthsAbroad : 0,
    costPer1000: totalSpend > 0 ? (totalCost / totalSpend) * 1000 : 0,
    effectiveCostPct: totalSpend > 0 ? (totalCost / totalSpend) * 100 : 0,
    noFxCardCost,
    netSavings: Math.max(0, totalCost - noFxCardCost),
    spendToJustify: i.fxFeePct > 0 ? i.noFxAnnualFee / (i.fxFeePct / 100) : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative amounts, a fee rate of 0% or more, and months abroad between 0 and 12."
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

export default function ForeignTransactionFeeCostCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(String(DEFAULTS.monthlySpend));
  const [fxFeePct, setFxFeePct] = useState(String(DEFAULTS.fxFeePct));
  const [monthsAbroad, setMonthsAbroad] = useState(String(DEFAULTS.monthsAbroad));
  const [cashAdvancePerTrip, setCashAdvancePerTrip] = useState(String(DEFAULTS.cashAdvancePerTrip));
  const [cashAdvanceFeePct, setCashAdvanceFeePct] = useState(String(DEFAULTS.cashAdvanceFeePct));
  const [noFxAnnualFee, setNoFxAnnualFee] = useState(String(DEFAULTS.noFxAnnualFee));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ForeignFeeInputs => ({
    monthlySpend: parseFloat(monthlySpend) || 0,
    fxFeePct: parseFloat(fxFeePct) || 0,
    monthsAbroad: parseFloat(monthsAbroad) || 0,
    cashAdvancePerTrip: parseFloat(cashAdvancePerTrip) || 0,
    cashAdvanceFeePct: parseFloat(cashAdvanceFeePct) || 0,
    noFxAnnualFee: parseFloat(noFxAnnualFee) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ForeignFeeInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ForeignFeeResult>(() => computeForeignFee(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeForeignFee(inputs));
  };

  const reset = () => {
    setMonthlySpend(String(DEFAULTS.monthlySpend));
    setFxFeePct(String(DEFAULTS.fxFeePct));
    setMonthsAbroad(String(DEFAULTS.monthsAbroad));
    setCashAdvancePerTrip(String(DEFAULTS.cashAdvancePerTrip));
    setCashAdvanceFeePct(String(DEFAULTS.cashAdvanceFeePct));
    setNoFxAnnualFee(String(DEFAULTS.noFxAnnualFee));
    setCalcInputs(DEFAULTS);
    setResults(computeForeignFee(DEFAULTS));
  };

  const purchaseShare = results.totalCost > 0 ? (results.purchaseFees / results.totalCost) * 100 : 0;
  const cashShare = results.totalCost > 0 ? (results.cashAdvanceFees / results.totalCost) * 100 : 0;

  const faqs = [
    {
      question: "What is a foreign transaction fee?",
      answer:
        "A foreign transaction fee is a surcharge of typically 1% to 3% that many credit and debit cards add to any purchase processed outside the card's home country, or in a currency other than your own. It appears as a separate line on your statement, usually described as an international or foreign purchase fee. The fee is charged by the issuer, not the merchant, and it applies even when the purchase is made online from a foreign-based retailer.",
    },
    {
      question: "How much does a 3% foreign transaction fee cost per year?",
      answer:
        "It depends on how much you spend abroad. One month of $1,500 in foreign spending at 3% costs about $45. Four such months cost about $180 a year, before any cash advance fees. Because the fee is a percentage, it scales directly with your spending: doubling the travel doubles the cost. That is why frequent travellers are usually better off with a card that charges no foreign transaction fee, even if it carries an annual fee.",
    },
    {
      question: "Is a no-foreign-fee card worth the annual fee?",
      answer:
        "Compare the annual fee against the fees avoided. At a 3% foreign transaction fee, a $95 annual fee is recovered after roughly $3,167 of foreign spending, so the card pays for itself beyond that point. The calculator shows that break-even spend directly. If you travel only occasionally, or spend modestly abroad, a no-fee card with a foreign transaction fee may still be the cheaper option overall.",
    },
    {
      question: "Do cash advances abroad cost more?",
      answer:
        "Yes, substantially. A cash advance typically triggers a fee of around 5% of the amount withdrawn, often with a minimum charge, and interest usually begins accruing immediately with no grace period. Withdrawing $500 with a 5% cash advance fee costs $25 before any interest, and that is on top of whatever foreign transaction fee the card applies. Paying with a card or withdrawing from a fee-free ATM network is almost always cheaper.",
    },
    {
      question: "How can I avoid foreign transaction fees?",
      answer:
        "Use a card that does not charge them — several major issuers offer travel cards with no foreign transaction fee, and some checking accounts waive foreign ATM fees. Always choose to be billed in the local currency rather than your home currency when a terminal offers the choice, because dynamic currency conversion adds a markup that is effectively another foreign transaction fee. For cash, use bank-affiliated ATMs in the local network rather than airport or hotel machines.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Foreign Transaction Fee Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Foreign Transaction Fee Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Foreign Spending">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="monthly-spend"
                  label="Spending per Month Abroad"
                  value={monthlySpend}
                  onChange={setMonthlySpend}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Average monthly card spending in a foreign currency."
                />
                <CompactInput
                  id="fx-fee"
                  label="Foreign Transaction Fee"
                  value={fxFeePct}
                  onChange={setFxFeePct}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="Fee your card adds to foreign purchases, typically 1% to 3%."
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
                  <SubSection title="Travel Pattern">
                    <CompactInput
                      id="months-abroad"
                      label="Months Abroad per Year"
                      value={monthsAbroad}
                      onChange={setMonthsAbroad}
                      onEnter={runCalculate}
                      suffix="mo"
                      min="0"
                      tooltip="Number of months per year you spend money abroad."
                    />
                  </SubSection>
                  <SubSection title="Cash Advances">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="cash-advance"
                        label="Cash Advance per Month Abroad"
                        value={cashAdvancePerTrip}
                        onChange={setCashAdvancePerTrip}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="ATM withdrawals per month of travel."
                      />
                      <CompactInput
                        id="cash-advance-fee"
                        label="Cash Advance Fee"
                        value={cashAdvanceFeePct}
                        onChange={setCashAdvanceFeePct}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.1"
                        tooltip="Fee charged on ATM cash advances, typically around 5%."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Comparison">
                    <CompactInput
                      id="no-fx-fee"
                      label="No-FX Card Annual Fee"
                      value={noFxAnnualFee}
                      onChange={setNoFxAnnualFee}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Annual fee of a card that charges no foreign transaction fee, for comparison."
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
                Annual Foreign Transaction Fee Cost
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.totalCost, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.effectiveCostPct, 2)}% of everything you spend abroad
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Purchase Fees
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.purchaseFees, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cash Advance Fees
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.cashAdvanceFees, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Monthly Average
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyAverage)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Fee Source</th>
                    <th className="p-2.5 text-right w-[130px]">Annual Cost</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      Foreign transaction fees on purchases
                    </td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.purchaseFees, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(purchaseShare, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Cash advance fees</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.cashAdvanceFees, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(cashShare, 1)}%</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Annual Cost</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalCost, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">100%</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cost per $1,000 Spent Abroad
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.costPer1000, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Spend Abroad
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalSpend, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cost with No-FX Card
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.noFxCardCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Net Savings with No-FX Card
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.netSavings, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Spend to Justify Annual Fee
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.spendToJustify, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Effective Cost Rate
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveCostPct, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Foreign Transaction Fee Cost Calculator?</h2>
            <p>
              A foreign transaction fee cost calculator totals what your card charges you for spending money in another
              country or currency. Most cards add a fee of 1% to 3% to every purchase processed abroad, and the charge
              appears quietly as its own line on the statement. Individually each fee looks trivial — three dollars on a
              hundred-dollar dinner — but over a year of travel the total is often one of the largest avoidable costs in
              a holiday budget.
            </p>
            <p>
              The calculator adds up the two places these fees bite: the percentage charged on card purchases made in a
              foreign currency, and the fee charged on cash advances, which is much larger and usually compounded by
              interest from the day of withdrawal. It then compares the total against a card that charges no foreign
              transaction fee but carries an annual fee, so the trade-off between the two is expressed in dollars and
              the break-even spending level is made explicit.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Purchase fees are calculated by multiplying your foreign spending by the fee percentage. If you spend
              $1,500 a month abroad for four months at a 3% fee, the purchase fees come to $1,500 × 4 × 0.03 = $180 for
              the year. Cash advance fees are calculated separately: the amount withdrawn per month abroad multiplied by
              the months and the cash advance fee percentage, which is commonly around 5%.
            </p>
            <p>
              The comparison scenario prices a no-foreign-fee card as its annual fee plus any cash advance fees, since
              most such cards still charge for cash advances but eliminate the purchase surcharge entirely. Subtracting
              that from your current cost gives the net saving. Finally, the break-even spend is the annual fee divided
              by the foreign transaction fee rate — the amount you must spend abroad each year for the no-fee card to pay
              for itself.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the total annual cost of foreign transaction fees, expressed also as a percentage
              of everything you spend abroad, which is a useful sanity check: a 3% fee on purchases plus 5% on cash
              advances usually works out to an effective cost of 3% to 4% of total foreign spending. The three-stat bar
              splits that into purchase fees, cash advance fees and a monthly average, and the breakdown table shows each
              source&apos;s share of the total.
            </p>
            <p>
              Summary Statistics adds the cost per $1,000 spent, the total spent abroad, the cost of the no-fee
              alternative, the net saving it delivers and the spending level at which its annual fee pays for itself.
              Treat the results as a planning estimate: the fee rate varies by issuer and card network, some cards exclude
              certain currencies, and cash advance interest — which starts immediately and is not modelled here — makes
              withdrawals even more expensive in practice. The most reliable way to cut these costs is to carry a card
              with no foreign transaction fee, always choose to be billed in the local currency, and use bank ATMs in the
              local network for cash rather than hotel or airport machines.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/foreign-transaction-fee-cost-calculator" />
          <PopularCalculators exclude="/calculator/foreign-transaction-fee-cost-calculator" />
        </div>
      </div>
    </>
  );
}
