"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface LateInputs {
  balance: number;
  standardApr: number;
  penaltyApr: number;
  lateFee: number;
  penaltyMonths: number;
  latesPerYear: number;
}

const DEFAULTS: LateInputs = {
  balance: 2000,
  standardApr: 19.99,
  penaltyApr: 29.99,
  lateFee: 35,
  penaltyMonths: 6,
  latesPerYear: 2,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface LateResult {
  monthlyPenaltyExtra: number;
  extraInterestPerLate: number;
  costPerLate: number;
  annualCost: number;
  aprPremium: number;
  costPer1000: number;
  annualExtraInterest: number;
  annualLateFees: number;
  valid: boolean;
  errorMsg: string;
}

function computeLate(i: LateInputs): LateResult {
  const invalid =
    i.balance < 0 ||
    i.standardApr < 0 ||
    i.penaltyApr < 0 ||
    i.lateFee < 0 ||
    i.penaltyMonths < 0 ||
    i.penaltyMonths > 24 ||
    i.latesPerYear < 0 ||
    i.latesPerYear > 12;

  const aprPremium = Math.max(0, i.penaltyApr - i.standardApr);
  const monthlyPenaltyExtra = i.balance * (aprPremium / 100 / 12);
  const extraInterestPerLate = monthlyPenaltyExtra * i.penaltyMonths;
  const costPerLate = i.lateFee + extraInterestPerLate;

  return {
    monthlyPenaltyExtra,
    extraInterestPerLate,
    costPerLate,
    annualCost: costPerLate * i.latesPerYear,
    aprPremium,
    costPer1000: i.balance > 0 ? (costPerLate / i.balance) * 1000 : 0,
    annualExtraInterest: extraInterestPerLate * i.latesPerYear,
    annualLateFees: i.lateFee * i.latesPerYear,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative amounts, a penalty window of 0 to 24 months, and 0 to 12 late payments per year."
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

export default function LatePaymentFeeImpactCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [standardApr, setStandardApr] = useState(String(DEFAULTS.standardApr));
  const [penaltyApr, setPenaltyApr] = useState(String(DEFAULTS.penaltyApr));
  const [lateFee, setLateFee] = useState(String(DEFAULTS.lateFee));
  const [penaltyMonths, setPenaltyMonths] = useState(String(DEFAULTS.penaltyMonths));
  const [latesPerYear, setLatesPerYear] = useState(String(DEFAULTS.latesPerYear));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): LateInputs => ({
    balance: parseFloat(balance) || 0,
    standardApr: parseFloat(standardApr) || 0,
    penaltyApr: parseFloat(penaltyApr) || 0,
    lateFee: parseFloat(lateFee) || 0,
    penaltyMonths: parseFloat(penaltyMonths) || 0,
    latesPerYear: parseFloat(latesPerYear) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<LateInputs>(() => DEFAULTS);
  const [results, setResults] = useState<LateResult>(() => computeLate(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeLate(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setStandardApr(String(DEFAULTS.standardApr));
    setPenaltyApr(String(DEFAULTS.penaltyApr));
    setLateFee(String(DEFAULTS.lateFee));
    setPenaltyMonths(String(DEFAULTS.penaltyMonths));
    setLatesPerYear(String(DEFAULTS.latesPerYear));
    setCalcInputs(DEFAULTS);
    setResults(computeLate(DEFAULTS));
  };

  const feeShare = results.costPerLate > 0 ? (calcInputs.lateFee / results.costPerLate) * 100 : 0;

  const faqs = [
    {
      question: "What happens when I pay late with a credit card?",
      answer:
        "Most issuers charge a late fee — commonly up to $30 for a first offence and up to $41 for a repeat within six billing cycles, the limits set by the CARD Act — and any payment that is 60 days or more past due can trigger a penalty APR of up to 29.99%, which applies to new transactions and often to the existing balance as well. The penalty rate generally stays in place for at least six months, and some issuers remove it only after six consecutive on-time payments.",
    },
    {
      question: "How long does a penalty APR last?",
      answer:
        "The CARD Act requires issuers to review accounts whose rates were increased due to late payment at least every six months, and to reduce the rate if you have made timely payments during that period. In practice the penalty window is often six months of on-time payments, though issuers may extend it. This calculator lets you set the window between 0 and 24 months so you can model anything from a single billing cycle to a two-year penalty period.",
    },
    {
      question: "What does a penalty APR really cost on a typical balance?",
      answer:
        "On a $2,000 balance, a 10-point penalty premium costs about $16.67 a month in extra interest, so a six-month window costs roughly $100 on top of the late fee — about $135 in total for one late payment. Two lates a year would run closer to $270. The cost scales directly with the balance, which is why the penalty matters most to borrowers carrying the largest balances.",
    },
    {
      question: "Does one late payment always trigger the penalty APR?",
      answer:
        "No. The penalty rate generally applies only when a payment is 60 days or more past due, and many issuers allow a grace period where a single missed due date incurs only the late fee. A payment that is a few days late will typically cost you the fee and possibly a negative mark on your credit report, but not the penalty rate. Check your card agreement for the exact thresholds, because they vary by issuer.",
    },
    {
      question: "Can a late payment be removed from my credit report?",
      answer:
        "A goodwill adjustment is possible but not guaranteed. Late payments are reported once you are 30 days past due, and they can remain on your report for seven years. If you have a long record of on-time payments and the lapse was a one-off error or hardship, writing to the issuer and asking for a goodwill deletion occasionally works. Setting up autopay for at least the minimum payment is the reliable way to avoid the problem entirely.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Late Payment Fee Impact Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Late Payment Fee Impact Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance & Rates">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance the penalty rate would apply to."
                />
                <CompactInput
                  id="standard-apr"
                  label="Standard APR"
                  value={standardApr}
                  onChange={setStandardApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Your normal purchase APR."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="penalty-apr"
                  label="Penalty APR"
                  value={penaltyApr}
                  onChange={setPenaltyApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="The higher rate applied after a payment is 60+ days late, up to 29.99%."
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
                  <SubSection title="Fees & Penalty Window">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="late-fee"
                        label="Late Fee"
                        value={lateFee}
                        onChange={setLateFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Fee charged per late payment, typically $30 to $41."
                      />
                      <CompactInput
                        id="penalty-months"
                        label="Penalty Window"
                        value={penaltyMonths}
                        onChange={setPenaltyMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="0"
                        tooltip="Months the penalty APR stays in force after going 60+ days late."
                      />
                      <CompactInput
                        id="lates-per-year"
                        label="Lates per Year"
                        value={latesPerYear}
                        onChange={setLatesPerYear}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="Number of late events per year, for the annual cost projection."
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

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Cost of One Late Payment
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.costPerLate, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Late fee plus {fmt(calcInputs.penaltyMonths, 0)} months at the penalty rate
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Late Fee</span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.lateFee, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Extra Interest
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.extraInterestPerLate, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Annual Cost
                </span>
                <span className="font-extrabold text-primary">${fmt(results.annualCost, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Per Late</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">
                      Per Year ({fmt(calcInputs.latesPerYear, 0)} lates)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Late fee</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.lateFee, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.annualLateFees, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      Extra interest at penalty APR
                    </td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.extraInterestPerLate, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.annualExtraInterest, 0)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Cost</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.costPerLate, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.annualCost, 0)}</td>
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
                    APR Premium
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.aprPremium, 2)} points</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Extra Interest per Month
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.monthlyPenaltyExtra)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cost per $1,000 Balance
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.costPer1000)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Fee Share of Cost
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(feeShare, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Penalty Window
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.penaltyMonths, 0)} months
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Lates per Year
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.latesPerYear, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Late Payment Fee Impact Calculator?</h2>
            <p>
              A late payment fee impact calculator totals what one missed due date actually costs on a credit card: the
              flat late fee, plus the extra interest charged while a penalty APR is in force. The second cost is easy to
              overlook because it never appears as a line item. It is buried in a higher rate applied to the whole
              balance, and it keeps charging every month until the issuer reviews the account and restores the normal
              rate.
            </p>
            <p>
              The stakes are larger than the fee itself. Under the CARD Act, issuers may charge up to $30 for a first
              late payment and up to $41 for a repeat within six billing cycles, but the penalty APR can reach 29.99%
              and stays until you make a run of on-time payments — typically at least six months. On a large balance the
              rate increase costs several times the fee, which is why the total impact is worth modelling before a
              one-off slip becomes a habit.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator first measures the penalty premium — the difference between your penalty APR and your
              standard APR. It converts that premium to a monthly cost by dividing by twelve and applying it to the
              balance. That gives the extra interest charged each month the penalty rate is in force. Multiplying by the
              penalty window gives the extra interest attributable to one late event, and adding the flat late fee gives
              the full cost of a single late payment.
            </p>
            <p>
              Multiplying the per-event cost by the number of late payments per year projects the annual impact, and
              splitting the result shows how much of it is fees and how much is penalty interest — a split that shifts
              toward interest as the balance grows. The model holds the balance constant through the penalty window,
              which is the conservative assumption: if the balance is still growing, the real cost is higher.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the total cost of one late payment — fee plus penalty interest — and the
              three-stat bar separates the fee, the extra interest and the annual cost at your stated frequency. The
              breakdown table sets the two components against each other per event and per year, so the relationship
              between the flat fee and the compounding penalty rate is visible at a glance.
            </p>
            <p>
              Summary Statistics adds the APR premium in percentage points, the extra interest charged each month, the
              cost per $1,000 of balance, the fee&apos;s share of the total and the assumptions behind the projection.
              Treat the results as a planning estimate: issuers differ in when the penalty rate applies, some charge
              different tiers of fee, and the penalty may extend beyond the window you enter if on-time payments lapse.
              The reliable defences are automatic payments for at least the minimum, a calendar reminder a few days
              before each due date, and — if a penalty rate has already been applied — a call to the issuer to ask
              exactly what sequence of payments restores the original rate.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/late-payment-fee-impact-calculator" />
          <PopularCalculators exclude="/calculator/late-payment-fee-impact-calculator" />
        </div>
      </div>
    </>
  );
}
