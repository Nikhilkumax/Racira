"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type PenaltyMethod = "percent" | "months" | "flat";

interface PenaltyInputs {
  balance: number;
  rate: number;
  remainingMonths: number;
  windowMonths: number;
  penaltyPercent: number;
  monthsOfInterest: number;
  flatFee: number;
  capPercent: number;
  method: PenaltyMethod;
}

const DEFAULTS: PenaltyInputs = {
  balance: 250000,
  rate: 6.5,
  remainingMonths: 300,
  windowMonths: 24,
  penaltyPercent: 2,
  monthsOfInterest: 6,
  flatFee: 500,
  capPercent: 0,
  method: "percent",
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

const METHOD_LABEL: Record<PenaltyMethod, string> = {
  percent: "Percentage of Balance",
  months: "Months of Interest",
  flat: "Flat Fee",
};

interface PenaltyResult {
  monthlyPayment: number;
  byPercent: number;
  byMonths: number;
  byFlat: number;
  selectedRaw: number;
  penalty: number;
  capAmount: number;
  wasCapped: boolean;
  totalPayoff: number;
  penaltyShareOfBalance: number;
  interestInWindow: number;
  balanceAtWindowEnd: number;
  breakEvenMonth: number | null;
  prepayWins: boolean;
  verdict: string;
  verdictTone: string;
  valid: boolean;
  errorMsg: string;
}

function computePenalty(i: PenaltyInputs): PenaltyResult {
  const invalid = i.balance <= 0 || i.rate < 0 || i.remainingMonths <= 0 || i.windowMonths < 0;

  const monthlyPayment = payment(i.balance, i.rate, i.remainingMonths);
  const monthlyInterest = (i.balance * (i.rate / 100)) / 12;

  const byPercent = (i.balance * i.penaltyPercent) / 100;
  const byMonths = monthlyInterest * i.monthsOfInterest;
  const byFlat = i.flatFee;

  const selectedRaw =
    i.method === "percent" ? byPercent : i.method === "months" ? byMonths : byFlat;

  const capAmount = (i.balance * i.capPercent) / 100;
  const wasCapped = i.capPercent > 0 && selectedRaw > capAmount;
  const penalty = wasCapped ? capAmount : selectedRaw;

  // Walk the remaining schedule to find interest accrued and the break-even month.
  const monthlyRate = i.rate / 100 / 12;
  const window = Math.min(i.windowMonths, i.remainingMonths);
  let bal = i.balance;
  let cumulativeInterest = 0;
  let interestInWindow = 0;
  let breakEvenMonth: number | null = null;

  for (let m = 1; m <= window; m++) {
    if (bal <= 0.005) break;
    const int = bal * monthlyRate;
    cumulativeInterest += int;
    interestInWindow += int;
    if (breakEvenMonth === null && cumulativeInterest >= penalty && penalty > 0) breakEvenMonth = m;
    let principalPart = monthlyPayment - int;
    if (principalPart <= 0) principalPart = 0;
    if (principalPart > bal) principalPart = bal;
    bal -= principalPart;
  }

  const prepayWins = penalty < interestInWindow;
  const nonZeroPenalty = penalty > 0;

  let verdict = "No penalty applies during the window";
  let verdictTone = "text-muted-foreground";
  if (nonZeroPenalty && prepayWins) {
    verdict = "Paying off now is cheaper than waiting";
    verdictTone = "text-emerald-600";
  } else if (nonZeroPenalty) {
    verdict = "Waiting out the window costs less";
    verdictTone = "text-amber-600";
  }

  return {
    monthlyPayment,
    byPercent,
    byMonths,
    byFlat,
    selectedRaw,
    penalty,
    capAmount,
    wasCapped,
    totalPayoff: i.balance + penalty,
    penaltyShareOfBalance: i.balance > 0 ? (penalty / i.balance) * 100 : 0,
    interestInWindow,
    balanceAtWindowEnd: bal,
    breakEvenMonth,
    prepayWins,
    verdict,
    verdictTone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan balance, a non-negative rate, and a positive remaining term."
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

export default function PrepaymentPenaltyCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [remainingMonths, setRemainingMonths] = useState(String(DEFAULTS.remainingMonths));
  const [windowMonths, setWindowMonths] = useState(String(DEFAULTS.windowMonths));
  const [penaltyPercent, setPenaltyPercent] = useState(String(DEFAULTS.penaltyPercent));
  const [monthsOfInterest, setMonthsOfInterest] = useState(String(DEFAULTS.monthsOfInterest));
  const [flatFee, setFlatFee] = useState(String(DEFAULTS.flatFee));
  const [capPercent, setCapPercent] = useState(String(DEFAULTS.capPercent));
  const [method, setMethod] = useState<PenaltyMethod>(DEFAULTS.method);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PenaltyInputs => ({
    balance: parseFloat(balance) || 0,
    rate: parseFloat(rate) || 0,
    remainingMonths: parseFloat(remainingMonths) || 0,
    windowMonths: parseFloat(windowMonths) || 0,
    penaltyPercent: parseFloat(penaltyPercent) || 0,
    monthsOfInterest: parseFloat(monthsOfInterest) || 0,
    flatFee: parseFloat(flatFee) || 0,
    capPercent: parseFloat(capPercent) || 0,
    method,
  });

  const [calcInputs, setCalcInputs] = useState<PenaltyInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PenaltyResult>(() => computePenalty(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePenalty(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setRate(String(DEFAULTS.rate));
    setRemainingMonths(String(DEFAULTS.remainingMonths));
    setWindowMonths(String(DEFAULTS.windowMonths));
    setPenaltyPercent(String(DEFAULTS.penaltyPercent));
    setMonthsOfInterest(String(DEFAULTS.monthsOfInterest));
    setFlatFee(String(DEFAULTS.flatFee));
    setCapPercent(String(DEFAULTS.capPercent));
    setMethod(DEFAULTS.method);
    setCalcInputs(DEFAULTS);
    setResults(computePenalty(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a prepayment penalty?",
      answer:
        "A prepayment penalty is a fee a lender charges when a borrower pays a mortgage off early or reduces the balance by a large amount within a set period, usually the first two to five years. It compensates the lender for the interest it expected to earn. Penalties are most common on loans with unusually low rates or generous lender credits, because the lender was effectively buying the borrower's business with a rate discount.",
    },
    {
      question: "How is the penalty amount determined?",
      answer:
        "Most contracts specify one of three formulas. The simplest is a percentage of the outstanding balance, commonly two percent in the first year or two and one percent afterwards. A second common structure charges a set number of months of interest, such as six months, calculated on the balance at the time of payoff. A third is a flat fee. Penalty caps are sometimes written in as well, limiting the charge to a stated percentage of the original or current balance.",
    },
    {
      question: "What is the difference between a hard and a soft prepayment penalty?",
      answer:
        "A hard penalty applies whenever the loan is paid off early, including when the home is sold. A soft penalty applies only to refinancing with a different lender or to a straight payoff, and it waives the fee when the property is sold. Soft penalties are more common on purchase loans and are considerably less restrictive, because a borrower who moves is not punished for the sale.",
    },
    {
      question: "Is it better to pay a penalty or wait out the window?",
      answer:
        "Compare the penalty itself against the interest that accrues while you wait. If you have the cash available and the penalty is smaller than the interest you would pay during the remaining window, paying off now is cheaper. The break-even month reported here is the point at which cumulative interest equals the penalty, so a break-even month of four means the penalty is recovered after roughly four months of interest.",
    },
    {
      question: "Can a prepayment penalty be waived or negotiated?",
      answer:
        "Often it can. Selling the home after the penalty clause expires, choosing a soft penalty loan, or asking the lender to waive the fee when you refinance with the same institution are the usual routes. Some lenders will also drop the penalty if you simply pay extra each month rather than paying the loan off entirely, because partial prepayments frequently sit outside the clause. Always read the prepayment language in the note before signing.",
    },
  ];

  const methodRows = [
    {
      label: `Percentage of Balance (${fmt(calcInputs.penaltyPercent, 2)}%)`,
      value: results.byPercent,
      active: calcInputs.method === "percent",
    },
    {
      label: `Months of Interest (${calcInputs.monthsOfInterest} months)`,
      value: results.byMonths,
      active: calcInputs.method === "months",
    },
    {
      label: "Flat Fee",
      value: results.byFlat,
      active: calcInputs.method === "flat",
    },
  ];

  const methodButton = (value: PenaltyMethod, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setMethod(value)}
      className={`flex-1 h-8 rounded-md text-xs font-bold border transition-colors ${
        method === value
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Prepayment Penalty Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Prepayment Penalty Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Outstanding Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Balance you would need to clear today."
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
                  tooltip="Annual rate on the existing loan."
                />
              </div>
            </SubSection>

            <SubSection title="Penalty Structure">
              <div className="flex gap-2 mb-3">
                {methodButton("percent", "% of Balance")}
                {methodButton("months", "Months Interest")}
                {methodButton("flat", "Flat Fee")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="pct"
                  label="Penalty Rate"
                  value={penaltyPercent}
                  onChange={setPenaltyPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.25"
                  tooltip="Percentage of the balance charged for early payoff."
                />
                <CompactInput
                  id="window"
                  label="Window Remaining"
                  value={windowMonths}
                  onChange={setWindowMonths}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="0"
                  tooltip="Months until the prepayment clause expires."
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
                  <SubSection title="Alternative Penalty Terms">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="months-int"
                        label="Months of Interest"
                        value={monthsOfInterest}
                        onChange={setMonthsOfInterest}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="0"
                        tooltip="Number of monthly interest charges used by this penalty formula."
                      />
                      <CompactInput
                        id="flat"
                        label="Flat Fee"
                        value={flatFee}
                        onChange={setFlatFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Fixed dollar penalty written into the note."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="cap"
                        label="Penalty Cap"
                        value={capPercent}
                        onChange={setCapPercent}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.25"
                        tooltip="Ceiling on the penalty as a share of the balance. Enter 0 for no cap."
                      />
                      <CompactInput
                        id="remaining"
                        label="Remaining Term"
                        value={remainingMonths}
                        onChange={setRemainingMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="1"
                        tooltip="Months left on the amortisation schedule."
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
                Prepayment Penalty &middot; {METHOD_LABEL[calcInputs.method]}
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.penalty)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalPayoff)} to clear the loan today &middot;{" "}
                <span className={results.verdictTone}>{results.verdict}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payoff Today</span>
                <span className="font-extrabold text-foreground">{money(results.totalPayoff)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest in Window</span>
                <span className="font-extrabold text-foreground">{money(results.interestInWindow)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Break-Even Month</span>
                <span className="font-extrabold text-foreground">
                  {results.breakEvenMonth !== null ? `Month ${results.breakEvenMonth}` : "None"}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Penalty Method</th>
                    <th className="p-2.5 text-right w-[120px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[100px]">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {methodRows.map((row) => (
                    <tr
                      key={row.label}
                      className={row.active ? "bg-primary/5 font-semibold" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.value)}</td>
                      <td className="p-2.5 pr-3 text-right">
                        <span className={row.active ? "font-bold text-primary" : "text-muted-foreground"}>
                          {row.active ? "Yes" : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      Penalty Cap{calcInputs.capPercent > 0 ? ` (${fmt(calcInputs.capPercent, 2)}%)` : " (none)"}
                    </td>
                    <td className="p-2.5 text-right text-foreground">
                      {calcInputs.capPercent > 0 ? money(results.capAmount) : "—"}
                    </td>
                    <td className="p-2.5 pr-3 text-right">
                      <span className={results.wasCapped ? "font-bold text-primary" : "text-muted-foreground"}>
                        {results.wasCapped ? "Bound" : "—"}
                      </span>
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Payoff Today</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalPayoff)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.penaltyShareOfBalance, 2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Outstanding Balance</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.balance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scheduled Payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Penalty Charged</span>
                  <span className="text-base font-bold text-primary">{money(results.penalty)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Penalty as % of Balance</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.penaltyShareOfBalance, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Left in Window</span>
                  <span className="text-base font-bold text-foreground">{money(results.interestInWindow)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance at Window End</span>
                  <span className="text-base font-bold text-foreground">{money(results.balanceAtWindowEnd)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Prepay vs Wait</span>
                  <span className={`text-base font-bold ${results.verdictTone}`}>
                    {results.penalty > 0 ? (results.prepayWins ? "Prepay" : "Wait") : "Either"} 
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months in Window</span>
                  <span className="text-base font-bold text-foreground">
                    {Math.min(calcInputs.windowMonths, calcInputs.remainingMonths)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Prepayment Penalty Calculator?</h2>
            <p>
              A prepayment penalty calculator works out what a lender will charge if you pay a mortgage off early, and it
              compares that charge against the interest you would avoid. Prepayment penalties are written into the note
              itself, usually for the first two to five years of the loan, and they are common on loans that came with a
              below-market rate or a large lender credit at closing. The fee exists because the lender priced the loan on
              the assumption that it would collect interest for years.
            </p>
            <p>
              The calculator matters most at three moments: when you are refinancing, when you are selling, and when you
              have come into cash and are deciding whether to clear the balance. In each case the question is identical
              &mdash; does the penalty cost more than the interest that would accrue while you wait for the penalty window
              to expire? Running the numbers before you call the servicer avoids the unpleasant discovery of a five-figure
              fee on the payoff statement.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Penalty Is Calculated</h2>
            <p>
              Three formulas cover almost every contract. A percentage-of-balance penalty multiplies the outstanding balance
              by a stated rate, so two percent of a two hundred and fifty thousand dollar balance is five thousand dollars.
              A months-of-interest penalty takes the monthly interest charge, which is the balance times the annual rate
              divided by twelve, and multiplies it by the number of months named in the note. A flat fee is simply a fixed
              dollar amount. The calculator computes all three and applies whichever one the contract actually uses.
            </p>
            <p>
              A cap, when present, limits the charge to a stated share of the balance. The comparison against waiting is
              built from the amortisation schedule: the same monthly payment is walked forward across the remaining penalty
              window, interest is accumulated month by month, and the first month in which cumulative interest overtakes the
              penalty is reported as the break-even month. If cumulative interest never reaches the penalty inside the
              window, waiting is the cheaper route.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the penalty under the selected formula together with the total needed to clear the loan
              today, and prints a plain-language verdict on whether prepaying beats waiting. The three statistics beside it
              give the full payoff figure, the interest that would accrue during the remaining window, and the break-even
              month. The breakdown table lists every formula side by side, marks the one being applied, and shows whether a
              cap is binding.
            </p>
            <p>
              Summary Statistics collects the balance, the scheduled payment, the penalty, the penalty as a share of the
              balance, the interest left in the window, and the balance the loan would carry at the window's end. A short
              break-even month means the penalty is recovered quickly and prepaying is attractive; a break-even month longer
              than the window itself means the fee outweighs the interest saved. Before acting, confirm whether the clause is
              hard or soft, because a soft penalty usually disappears when the property is sold, and ask the servicer for a
              written payoff quote that itemises the fee.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/prepayment-penalty-calculator" />
          <PopularCalculators exclude="/calculator/prepayment-penalty-calculator" />
        </div>
      </div>
    </>
  );
}
