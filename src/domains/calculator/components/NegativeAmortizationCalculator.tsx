"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface NegAmInputs {
  balance: number;
  rate: number;
  payment: number;
  capPercent: number;
  termYears: number;
}

const DEFAULTS: NegAmInputs = {
  balance: 300000,
  rate: 7,
  payment: 1400,
  capPercent: 110,
  termYears: 30,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface NegAmResult {
  monthlyInterest: number;
  shortfall: number;
  capBalance: number;
  monthsToCap: number;
  projectedBalance: number;
  recastPayment: number;
  addedToBalance: number;
  totalInterestPaid: number;
  annualisedGrowth: number;
  negative: boolean;
  payoffMonths: number;
  schedule: { year: number; balance: number; interest: number; added: number }[];
  verdict: string;
  verdictTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeNegAm(i: NegAmInputs): NegAmResult {
  const invalid = i.balance <= 0 || i.rate < 0 || i.payment <= 0 || i.capPercent < 100 || i.termYears <= 0;

  const iRate = i.rate / 100 / 12;
  const monthlyInterest = i.balance * iRate;
  const capBalance = (i.balance * i.capPercent) / 100;
  const schedule: { year: number; balance: number; interest: number; added: number }[] = [];

  let bal = i.balance;
  let month = 0;
  let interestPaid = 0;
  const negative = i.payment < monthlyInterest;

  // Walk the schedule until either the capitalisation cap is hit or the loan clears.
  let yearInterest = 0;
  let yearAdded = 0;
  const startBalance = i.balance;
  while (month < 1200) {
    if (bal <= 0.005) break;
    if (bal >= capBalance) break;
    const charge = bal * iRate;
    interestPaid += charge;
    yearInterest += charge;
    const delta = i.payment - charge;
    bal = bal + charge - i.payment;
    if (bal > startBalance) yearAdded = bal - startBalance;
    month++;
    if (month % 12 === 0) {
      schedule.push({ year: month / 12, balance: bal, interest: yearInterest, added: yearAdded });
      yearInterest = 0;
      yearAdded = 0;
    }
  }

  const hitCap = bal >= capBalance && i.payment < monthlyInterest;
  const monthsToCap = hitCap ? month : 0;
  const projectedBalance = hitCap ? capBalance : bal;
  const remainingMonths = Math.max(1, Math.round(i.termYears * 12) - monthsToCap);
  const recastPayment = hitCap ? payment(capBalance, i.rate, remainingMonths) : i.payment;
  const addedToBalance = Math.max(0, projectedBalance - i.balance);

  let verdict = "No negative amortisation";
  let verdictTone = "text-emerald-600";
  if (i.payment < monthlyInterest) {
    verdict = "Payment below interest accrual";
    verdictTone = "text-destructive";
  }

  return {
    monthlyInterest,
    shortfall: Math.max(0, monthlyInterest - i.payment),
    capBalance,
    monthsToCap,
    projectedBalance,
    recastPayment,
    addedToBalance,
    totalInterestPaid: interestPaid,
    annualisedGrowth: i.balance > 0 ? (addedToBalance / i.balance) * 100 : 0,
    negative,
    payoffMonths: month,
    schedule: schedule.slice(0, 10),
    verdict,
    verdictTone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive balance and payment, a non-negative rate, and a cap of at least 100%."
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function NegativeAmortizationCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [paymentAmount, setPaymentAmount] = useState(String(DEFAULTS.payment));
  const [capPercent, setCapPercent] = useState(String(DEFAULTS.capPercent));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): NegAmInputs => ({
    balance: parseFloat(balance) || 0,
    rate: parseFloat(rate) || 0,
    payment: parseFloat(paymentAmount) || 0,
    capPercent: parseFloat(capPercent) || 100,
    termYears: parseFloat(termYears) || 30,
  });

  const [calcInputs, setCalcInputs] = useState<NegAmInputs>(() => DEFAULTS);
  const [results, setResults] = useState<NegAmResult>(() => computeNegAm(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeNegAm(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setRate(String(DEFAULTS.rate));
    setPaymentAmount(String(DEFAULTS.payment));
    setCapPercent(String(DEFAULTS.capPercent));
    setTermYears(String(DEFAULTS.termYears));
    setCalcInputs(DEFAULTS);
    setResults(computeNegAm(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is negative amortisation?",
      answer:
        "Negative amortisation happens when the payment due is smaller than the interest accruing on the loan, so the unpaid interest is added to the principal and the balance grows instead of shrinking. It appears in option adjustable-rate mortgages and in some student loan and deferred-payment arrangements where a minimum payment is deliberately set below the interest charge.",
    },
    {
      question: "What is a capitalisation cap?",
      answer:
        "Because a growing balance is dangerous for both parties, most negative amortisation loans specify a ceiling, usually somewhere between one hundred and ten and one hundred and twenty-five percent of the original balance. Once the balance reaches that cap, the payment is recalculated on the larger balance and the borrower faces a substantial jump in the monthly obligation.",
    },
    {
      question: "How much can the payment rise at the cap?",
      answer:
        "The recast payment is calculated on the capped balance over the remaining term, so it rises both because the balance is larger and because fewer months remain to repay it. A loan that reaches a hundred and ten percent of its original balance with twenty-five years still to run can see the required payment increase sharply rather than gradually.",
    },
    {
      question: "Does negative amortisation happen on regular mortgages?",
      answer:
        "Not on standard fixed-rate loans, where the payment always exceeds the interest charge and principal reduces from the first instalment. It can occur on interest-only products during the interest-only period, and on adjustable-rate loans if the rate rises above the level assumed when a low introductory payment was calculated. Read the note for the minimum payment definition.",
    },
    {
      question: "What should I do if my loan is negatively amortising?",
      answer:
        "Increase the payment to at least the interest due, which stops the balance from growing, and then to the fully amortising amount so the principal begins to reduce. Ask the servicer for the fully amortising payment so there is a concrete target. If the loan reaches its cap, plan for the recast increase in advance rather than discovering it in the month it takes effect.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Negative Amortization Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Negative Amortization Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Loan Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Outstanding principal today."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Current annual rate charged on the balance."
                />
              </div>
            </SubSection>

            <SubSection title="Payment Structure">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="payment"
                  label="Monthly Payment"
                  value={paymentAmount}
                  onChange={setPaymentAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The minimum payment currently required under the note."
                />
                <CompactInput
                  id="cap"
                  label="Capitalisation Cap"
                  value={capPercent}
                  onChange={setCapPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  min="100"
                  step="1"
                  tooltip="Ceiling on the balance as a percentage of the original loan."
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
                  <SubSection title="Recast Assumptions">
                    <CompactInput
                      id="term"
                      label="Original Term"
                      value={termYears}
                      onChange={setTermYears}
                      onEnter={runCalculate}
                      suffix="yrs"
                      min="1"
                      tooltip="Used to calculate the payment after the cap is reached."
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
                {results.negative ? "Monthly Balance Growth" : "Balance Reduction"}
              </div>
              <div
                className={`text-4xl font-extrabold mb-1 tracking-tight ${
                  results.negative ? "text-destructive" : "text-foreground"
                }`}
              >
                {money(results.negative ? results.shortfall : Math.max(0, calcInputs.payment - results.monthlyInterest))}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.monthlyInterest)} of interest on a {money(calcInputs.payment)} payment &middot;{" "}
                <span className={results.verdictTone}>{results.verdict}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Months to Cap</span>
                <span className="font-extrabold text-foreground">
                  {results.monthsToCap > 0 ? results.monthsToCap : "Not reached"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Balance Added</span>
                <span className="font-extrabold text-destructive">{money(results.addedToBalance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Recast Payment</span>
                <span className="font-extrabold text-primary">{money(results.recastPayment)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[130px]">Balance</th>
                    <th className="p-2.5 text-right w-[120px]">Interest</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.balance)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.interest)}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.added > 0 ? "text-destructive" : "text-emerald-600"}`}>
                        {row.added > 0 ? money(row.added) : "—"}
                      </td>
                    </tr>
                  ))}
                  {results.schedule.length === 0 && (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={4}>
                        The loan clears inside the first year at this payment.
                      </td>
                    </tr>
                  )}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">At Recast</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.projectedBalance)}</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalInterestPaid)}</td>
                    <td className="p-2.5 pr-3 text-right text-destructive">{money(results.addedToBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Starting Balance</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.balance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Shortfall</span>
                  <span className={`text-base font-bold ${results.shortfall > 0 ? "text-destructive" : "text-emerald-600"}`}>
                    {money(results.shortfall)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Capitalisation Cap</span>
                  <span className="text-base font-bold text-foreground">{money(results.capBalance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months to Cap</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsToCap > 0 ? results.monthsToCap : "Not reached"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance Added</span>
                  <span className="text-base font-bold text-destructive">{money(results.addedToBalance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Growth on Original</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.annualisedGrowth, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment After Recast</span>
                  <span className="text-base font-bold text-primary">{money(results.recastPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Negative Amortization Calculator?</h2>
            <p>
              A negative amortization calculator shows what happens when a loan payment is smaller than the interest the
              balance accrues. Instead of reducing principal, each payment leaves a shortfall that is added to the balance,
              so the amount owed grows month after month. The tool quantifies that growth, the point at which the loan
              reaches its capitalisation cap, and the payment required afterwards.
            </p>
            <p>
              The pattern appears in option adjustable-rate mortgages, in interest-only products once the rate rises above
              the assumed level, and in some deferred-payment arrangements. It is not automatically a sign of a bad loan, but
              it is a structure with a delayed reckoning: the balance is larger and the remaining term is shorter when the
              payment is eventually recalculated, so the increase arrives all at once.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Balance Growth Is Calculated</h2>
            <p>
              Monthly interest is the outstanding balance multiplied by the annual rate divided by twelve. If the payment
              exceeds that charge, the difference reduces the balance and the loan amortises normally. If the payment is
              below it, the shortfall is added to the balance, and because the next month's interest is charged on the larger
              figure, the growth compounds modestly rather than staying linear.
            </p>
            <p>
              The simulation runs month by month until the balance reaches the capitalisation cap, which is the original loan
              multiplied by the cap percentage, commonly a hundred and ten percent. At that point the balance is recast: the
              capped balance is amortised over the months remaining in the original term at the same rate, producing the new
              required payment. Comparing that figure with the current payment is the practical purpose of the calculation.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the monthly balance growth where the payment falls short, or the balance reduction where
              it does not, together with the monthly interest charge and the payment. The three statistics beside it give the
              months until the cap is reached, the amount added to the balance and the recast payment. The breakdown table
              traces the balance year by year, with interest charged and principal added in each period.
            </p>
            <p>
              Summary Statistics collects the starting balance, monthly interest, shortfall, capitalisation cap, months to
              cap, balance added, growth as a percentage of the original loan and the payment after recasting. The most
              useful action is usually the least dramatic: raising the payment to the fully amortising amount now, which
              stops the balance from growing and avoids both the larger recast and the extra interest that a growing balance
              generates. Ask the servicer for that figure in writing and compare it with the cap scenario above.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/negative-amortization-calculator" />
          <PopularCalculators exclude="/calculator/negative-amortization-calculator" />
        </div>
      </div>
    </>
  );
}
