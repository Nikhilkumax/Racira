"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ConsolidationInputs {
  balance: number;
  currentApr: number;
  newApr: number;
  currentPayment: number;
  newTermMonths: number;
  originationFee: number;
}

const DEFAULTS: ConsolidationInputs = {
  balance: 18000,
  currentApr: 22.5,
  newApr: 11,
  currentPayment: 650,
  newTermMonths: 60,
  originationFee: 250,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

interface ConsolidationResult {
  currentInterest: number;
  currentMonths: number;
  newPayment: number;
  newInterest: number;
  newTotalCost: number;
  netSavings: number;
  paymentChange: number;
  monthsChange: number;
  aprReduction: number;
  totalCurrentCost: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeConsolidation(i: ConsolidationInputs): ConsolidationResult {
  const invalid =
    i.balance <= 0 ||
    i.currentApr < 0 ||
    i.newApr < 0 ||
    i.currentPayment <= 0 ||
    i.newTermMonths <= 0 ||
    i.originationFee < 0;

  const r = i.currentApr / 100 / 12;
  let bal = i.balance;
  let currentInterest = 0;
  let m = 0;
  let stalled = false;
  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    if (i.currentPayment <= int) {
      stalled = true;
      bal += i.currentPayment - int;
      currentInterest += int;
      m += 1;
      continue;
    }
    const p = Math.min(i.currentPayment, bal + int);
    bal -= p - int;
    currentInterest += int;
    m += 1;
  }

  const n = Math.round(i.newTermMonths);
  const newPayment = paymentFor(i.balance + i.originationFee, i.newApr / 100 / 12, n);
  const newInterest = newPayment * n - (i.balance + i.originationFee);
  const newTotalCost = newInterest + i.originationFee;

  return {
    currentInterest,
    currentMonths: m,
    newPayment,
    newInterest,
    newTotalCost,
    netSavings: currentInterest - newTotalCost,
    paymentChange: newPayment - i.currentPayment,
    monthsChange: m - n,
    aprReduction: Math.max(0, i.currentApr - i.newApr),
    totalCurrentCost: i.balance + currentInterest,
    stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance, payment and term above zero, non-negative rates, and a non-negative fee."
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

export default function DebtConsolidationSavingsCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [currentApr, setCurrentApr] = useState(String(DEFAULTS.currentApr));
  const [newApr, setNewApr] = useState(String(DEFAULTS.newApr));
  const [currentPayment, setCurrentPayment] = useState(String(DEFAULTS.currentPayment));
  const [newTermMonths, setNewTermMonths] = useState(String(DEFAULTS.newTermMonths));
  const [originationFee, setOriginationFee] = useState(String(DEFAULTS.originationFee));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ConsolidationInputs => ({
    balance: parseFloat(balance) || 0,
    currentApr: parseFloat(currentApr) || 0,
    newApr: parseFloat(newApr) || 0,
    currentPayment: parseFloat(currentPayment) || 0,
    newTermMonths: parseFloat(newTermMonths) || 0,
    originationFee: parseFloat(originationFee) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ConsolidationInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ConsolidationResult>(() => computeConsolidation(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeConsolidation(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setCurrentApr(String(DEFAULTS.currentApr));
    setNewApr(String(DEFAULTS.newApr));
    setCurrentPayment(String(DEFAULTS.currentPayment));
    setNewTermMonths(String(DEFAULTS.newTermMonths));
    setOriginationFee(String(DEFAULTS.originationFee));
    setCalcInputs(DEFAULTS);
    setResults(computeConsolidation(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much can debt consolidation save?",
      answer:
        "The saving is the difference between the interest you would pay on your current balances and the interest plus fees on the consolidation loan. On $18,000 of debt at a 22.5% average rate repaid at $650 a month, you would pay roughly $9,000 in interest. Refinancing at 11% over five years costs around $5,500 in interest plus any origination fee — a saving of several thousand dollars, provided you do not extend the repayment so far that the extra months cancel the lower rate.",
    },
    {
      question: "Does a longer term always mean more interest?",
      answer:
        "Not necessarily — the rate matters more. Stretching a high-rate balance into a longer, much cheaper loan usually still saves money, because the rate reduction outweighs the extra months. But the comparison is not automatic: a 22% balance paid off in three years can cost less than an 11% loan over seven. Run both in the calculator, and remember that the longer term is a genuine risk if it tempts you to borrow again on the cleared cards.",
    },
    {
      question: "What fees should I expect on a consolidation loan?",
      answer:
        "Origination fees of 1% to 6% of the loan amount are common on personal loans, sometimes deducted from the proceeds rather than added to the balance. Balance transfer fees on cards run 3% to 5%. Some lenders charge no origination fee but price it into a higher rate. The calculator adds the fee to the financed balance, which is the conservative treatment — if it is deducted from proceeds instead, your effective borrowing is slightly larger than modelled.",
    },
    {
      question: "Will consolidation hurt my credit score?",
      answer:
        "The application involves a hard inquiry and a new account, which can cost a few points temporarily. The longer-term effect is usually positive if the consolidation lowers your credit utilization — revolving balances move to an installment account and the cards report zero — and if you keep the payments on time. The damage comes from repeating the cycle: consolidating the balances, charging the cleared cards back up, and ending with both the loan and the old debt.",
    },
    {
      question: "What is the biggest mistake people make with consolidation?",
      answer:
        "Treating the lower payment as new spending money. When the monthly obligation falls from $650 to $400, the difference is exactly what buys back the interest saving — or destroys it. The disciplined approach is to keep paying the old amount against the new loan as extra principal, which shortens the term and increases the saving beyond what the calculator shows for the scheduled payment alone.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Consolidation Savings Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt Consolidation Savings Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Current Debt">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Total Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Combined balance being consolidated."
                />
                <CompactInput
                  id="current-apr"
                  label="Weighted Average APR"
                  value={currentApr}
                  onChange={setCurrentApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Average rate across the balances, weighted by size."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="new-apr"
                  label="Consolidation APR"
                  value={newApr}
                  onChange={setNewApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Rate offered on the consolidation loan."
                />
                <CompactInput
                  id="current-payment"
                  label="Current Monthly Payment"
                  value={currentPayment}
                  onChange={setCurrentPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="1"
                  tooltip="Amount you pay across the debts today."
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
                  <SubSection title="Loan Terms">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="new-term"
                        label="New Term"
                        value={newTermMonths}
                        onChange={setNewTermMonths}
                        onEnter={runCalculate}
                        suffix="months"
                        min="1"
                        tooltip="Length of the consolidation loan."
                      />
                      <CompactInput
                        id="origination-fee"
                        label="Origination Fee"
                        value={originationFee}
                        onChange={setOriginationFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Fee charged to originate the loan, financed into the balance."
                      />
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
            {results.valid && results.stalled && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Payment too low</div>
                <div className="text-base font-medium text-foreground">
                  The current payment does not cover the monthly interest, so the existing balance never falls.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Net Interest Savings</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.netSavings, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                After the ${fmt(calcInputs.originationFee, 0)} origination fee · {fmt(results.aprReduction, 2)} pt rate reduction
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Interest Today
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.currentInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Interest + Fees New
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.newTotalCost, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New Payment</span>
                <span className="font-extrabold text-foreground">${fmt(results.newPayment)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest on current debts</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.currentInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{results.currentMonths} months</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest on consolidation loan</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.newInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">
                      {fmt(calcInputs.newTermMonths, 0)} months
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Origination fee</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.originationFee, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">Upfront</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net savings</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netSavings, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">
                      {results.paymentChange <= 0
                        ? `$${fmt(Math.abs(results.paymentChange), 0)}/mo lower`
                        : `$${fmt(results.paymentChange, 0)}/mo higher`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Cost Today
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalCurrentCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Cost Consolidated
                  </span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(calcInputs.balance + results.newTotalCost, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Payment Change
                  </span>
                  <span className={`text-base font-bold ${results.paymentChange <= 0 ? "text-primary" : "text-red-600"}`}>
                    {results.paymentChange <= 0 ? "−" : "+"}${fmt(Math.abs(results.paymentChange), 2)}/mo
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Change</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsChange >= 0 ? `${results.monthsChange} fewer` : `${Math.abs(results.monthsChange)} more`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Weighted Average APR
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.currentApr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Consolidated APR
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.newApr, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Consolidation Savings Calculator?</h2>
            <p>
              A debt consolidation savings calculator measures what you save by replacing several high-rate balances
              with one lower-rate loan, after accounting for the fee that comes with it. The pitch for consolidation is
              simple: one payment, one rate, one date when the debt ends. The arithmetic behind it is less obvious,
              because a lower rate and a longer term pull in opposite directions, and an origination fee can quietly
              consume a meaningful share of the saving.
            </p>
            <p>
              The comparison that matters is the total cost of each path — all the interest and fees until the debt is
              gone. If the existing balances sit at a weighted average of 22.5% and the consolidation loan comes at 11%,
              the rate reduction is large enough to absorb both the fee and a longer term, and the calculator shows the
              net saving in dollars. If the rate gap is small, or the new term much longer, the same arithmetic can show
              a loss, which is why the calculation is worth running before signing.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator simulates the current path first: it repays the combined balance at the weighted average
              APR with your stated monthly payment, month by month, and totals the interest until the balance reaches
              zero. It then prices the consolidation loan conventionally — the balance plus the origination fee financed
              at the new APR over the new term — to produce the level payment, the total interest and the total cost of
              credit.
            </p>
            <p>
              Net savings is the interest on the current path minus the interest and fee on the consolidation path.
              The calculator also reports the change in the monthly payment and in the number of months, so the trade-off
              is explicit: a consolidation that lowers the payment and shortens the term saves on both counts, while one
              that lowers the payment but stretches the term relies entirely on the rate reduction to win.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the net interest saving after the origination fee, with the size of the rate
              reduction beneath it. The three-stat bar sets interest today against interest plus fees on the new loan,
              and shows the new monthly payment, while the breakdown table lines up all three components — old interest,
              new interest and the fee — with the timing of each.
            </p>
            <p>
              Summary Statistics adds the total cost of each path, the monthly payment change and the change in payoff
              duration. Two habits protect the saving shown here. First, keep paying the old amount after consolidating:
              directing the difference to principal makes the real saving larger than the scheduled figure. Second, avoid
              re-borrowing on the cleared cards — carrying a consolidation loan and rebuilt card balances at the same
              time costs more than doing nothing, which is the failure mode consolidation is meant to prevent. A useful
              discipline is to remove the cleared cards from wallets and subscriptions entirely for the life of the loan,
              so the lower rate actually reaches the finish line. Recheck the quote before signing, too, because a longer
              term lowers the payment while quietly rebuilding the interest the fee was supposed to erase.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-consolidation-savings-calculator" />
          <PopularCalculators exclude="/calculator/debt-consolidation-savings-calculator" />
        </div>
      </div>
    </>
  );
}
