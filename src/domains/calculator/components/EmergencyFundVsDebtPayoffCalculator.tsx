"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FundInputs {
  emergencyFund: number;
  monthlyExpenses: number;
  debtBalance: number;
  debtApr: number;
  monthlyDebtPayment: number;
  savingsApy: number;
  monthlySurplus: number;
  rebuildAllocation: number;
}

const DEFAULTS: FundInputs = {
  emergencyFund: 8000,
  monthlyExpenses: 3200,
  debtBalance: 6000,
  debtApr: 22.99,
  monthlyDebtPayment: 300,
  savingsApy: 4,
  monthlySurplus: 600,
  rebuildAllocation: 300,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function simulateDebt(balance: number, apr: number, pay: number) {
  const r = apr / 100 / 12;
  let bal = balance;
  let interest = 0;
  let m = 0;
  let stalled = false;
  while (bal > 0.005 && m < 1200) {
    const int = bal * r;
    if (pay <= int) {
      stalled = true;
      bal += pay - int;
      interest += int;
      m += 1;
      continue;
    }
    const p = Math.min(pay, bal + int);
    bal -= p - int;
    interest += int;
    m += 1;
  }
  return { interest, months: m, stalled };
}

interface FundResult {
  oneMonthBuffer: number;
  excess: number;
  monthsKeep: number;
  interestKeep: number;
  monthsUse: number;
  interestUse: number;
  interestSaved: number;
  monthsSaved: number;
  fundAfterUse: number;
  runwayNow: number;
  runwayAfter: number;
  rebuildMonths: number;
  savingsInterestKeep: number;
  netCostKeep: number;
  netCostUse: number;
  stalled: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeFund(i: FundInputs): FundResult {
  const invalid =
    i.emergencyFund < 0 ||
    i.monthlyExpenses <= 0 ||
    i.debtBalance <= 0 ||
    i.debtApr < 0 ||
    i.monthlyDebtPayment <= 0 ||
    i.savingsApy < 0 ||
    i.monthlySurplus < 0 ||
    i.rebuildAllocation < 0;

  const oneMonthBuffer = i.monthlyExpenses;
  const excess = Math.max(0, i.emergencyFund - oneMonthBuffer);
  const payKeep = i.monthlyDebtPayment + i.monthlySurplus;

  const keep = simulateDebt(i.debtBalance, i.debtApr, payKeep);
  const use = simulateDebt(Math.max(0, i.debtBalance - excess), i.debtApr, payKeep);

  const monthsKeep = keep.months;
  const monthsUse = use.months;
  const rSave = i.savingsApy / 100 / 12;
  // Interest earned on the emergency fund over the payoff window.
  const savingsInterestKeep = i.emergencyFund * rSave * monthsKeep;
  const fundAfterUse = oneMonthBuffer * Math.pow(1 + rSave, monthsUse);
  const savingsInterestUse = i.emergencyFund > 0 ? fundAfterUse - oneMonthBuffer : 0;

  return {
    oneMonthBuffer,
    excess,
    monthsKeep,
    interestKeep: keep.interest,
    monthsUse,
    interestUse: use.interest,
    interestSaved: Math.max(0, keep.interest - use.interest),
    monthsSaved: Math.max(0, monthsKeep - monthsUse),
    fundAfterUse,
    runwayNow: i.monthlyExpenses > 0 ? i.emergencyFund / i.monthlyExpenses : 0,
    runwayAfter: i.monthlyExpenses > 0 ? oneMonthBuffer / i.monthlyExpenses : 0,
    rebuildMonths: i.rebuildAllocation > 0 ? excess / i.rebuildAllocation : 0,
    savingsInterestKeep,
    netCostKeep: keep.interest - savingsInterestKeep,
    netCostUse: use.interest - savingsInterestUse,
    stalled: keep.stalled || use.stalled,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter expenses, a debt balance and a payment above zero, and non-negative fund, rate and allocation figures."
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

export default function EmergencyFundVsDebtPayoffCalculator() {
  const [emergencyFund, setEmergencyFund] = useState(String(DEFAULTS.emergencyFund));
  const [monthlyExpenses, setMonthlyExpenses] = useState(String(DEFAULTS.monthlyExpenses));
  const [debtBalance, setDebtBalance] = useState(String(DEFAULTS.debtBalance));
  const [debtApr, setDebtApr] = useState(String(DEFAULTS.debtApr));
  const [monthlyDebtPayment, setMonthlyDebtPayment] = useState(String(DEFAULTS.monthlyDebtPayment));
  const [savingsApy, setSavingsApy] = useState(String(DEFAULTS.savingsApy));
  const [monthlySurplus, setMonthlySurplus] = useState(String(DEFAULTS.monthlySurplus));
  const [rebuildAllocation, setRebuildAllocation] = useState(String(DEFAULTS.rebuildAllocation));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FundInputs => ({
    emergencyFund: parseFloat(emergencyFund) || 0,
    monthlyExpenses: parseFloat(monthlyExpenses) || 0,
    debtBalance: parseFloat(debtBalance) || 0,
    debtApr: parseFloat(debtApr) || 0,
    monthlyDebtPayment: parseFloat(monthlyDebtPayment) || 0,
    savingsApy: parseFloat(savingsApy) || 0,
    monthlySurplus: parseFloat(monthlySurplus) || 0,
    rebuildAllocation: parseFloat(rebuildAllocation) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<FundInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FundResult>(() => computeFund(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeFund(inputs));
  };

  const reset = () => {
    setEmergencyFund(String(DEFAULTS.emergencyFund));
    setMonthlyExpenses(String(DEFAULTS.monthlyExpenses));
    setDebtBalance(String(DEFAULTS.debtBalance));
    setDebtApr(String(DEFAULTS.debtApr));
    setMonthlyDebtPayment(String(DEFAULTS.monthlyDebtPayment));
    setSavingsApy(String(DEFAULTS.savingsApy));
    setMonthlySurplus(String(DEFAULTS.monthlySurplus));
    setRebuildAllocation(String(DEFAULTS.rebuildAllocation));
    setCalcInputs(DEFAULTS);
    setResults(computeFund(DEFAULTS));
  };

  const faqs = [
    {
      question: "Should I pay off debt or keep my emergency fund?",
      answer:
        "The standard answer is to keep at least one month of essential expenses in cash and use anything beyond that against high-rate debt. The reason is arithmetic: credit card debt costs 20% or more, while savings earn around 4%, so every dollar moved from savings to the card earns a guaranteed return equal to the rate difference. The exception is the buffer itself — without some cash, an unexpected bill goes straight back onto the card and the progress is undone.",
    },
    {
      question: "Why keep only one month instead of three to six?",
      answer:
        "Three to six months is the right long-term target, but it is the wrong target while carrying high-rate debt. Building a six-month fund while paying 22% interest means the debt keeps growing faster than the fund does. The efficient order is: keep a one-month buffer for genuine emergencies, attack the debt with everything else, then rebuild the full fund afterwards — at which point the same money is not fighting compound interest in the wrong direction.",
    },
    {
      question: "What counts as a genuine emergency?",
      answer:
        "An expense that is necessary, urgent and unexpected: a medical bill, a car repair needed to get to work, a furnace failure in winter. A sale, a holiday, a planned purchase or a subscription renewal is not. The discipline matters because a one-month buffer only works if it is not treated as spending money — the moment it becomes an account you dip into for ordinary life, it stops being a buffer and the debt plan loses its safety net.",
    },
    {
      question: "Does the interest earned on savings change the answer?",
      answer:
        "It narrows the gap but rarely closes it. Earning 4% on the fund while paying 22.99% on the debt means every dollar kept in savings still costs about 19 percentage points a year in net terms — you are paying more for the debt than the savings earn. The calculator shows both flows so the comparison is explicit, and the higher the debt rate, the more one-sided the result becomes.",
    },
    {
      question: "How long does it take to rebuild the fund afterwards?",
      answer:
        "That is what the rebuild allocation field is for: once the debt is gone, the monthly surplus that was going to the card can rebuild the emergency fund at a much faster pace. The calculator reports the months required at the allocation you set. If the rebuild looks uncomfortably long, either raise the allocation after the debt clears or keep a slightly larger buffer now — the trade-off is visible either way.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Emergency Fund vs Debt Payoff Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Emergency Fund vs Debt Payoff Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Emergency Fund">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="emergency-fund"
                  label="Emergency Fund"
                  value={emergencyFund}
                  onChange={setEmergencyFund}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Cash set aside for genuine emergencies."
                />
                <CompactInput
                  id="monthly-expenses"
                  label="Monthly Essential Expenses"
                  value={monthlyExpenses}
                  onChange={setMonthlyExpenses}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Minimum monthly outgoings — the basis for the one-month buffer."
                />
              </div>
            </SubSection>

            <SubSection title="Debt">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="debt-balance"
                  label="Debt Balance"
                  value={debtBalance}
                  onChange={setDebtBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="High-interest balance being repaid."
                />
                <CompactInput
                  id="debt-apr"
                  label="Debt APR"
                  value={debtApr}
                  onChange={setDebtApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Rate on the debt, typically 20%+ on cards."
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
                  <SubSection title="Monthly Cash Flow">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="debt-payment"
                        label="Regular Debt Payment"
                        value={monthlyDebtPayment}
                        onChange={setMonthlyDebtPayment}
                        onEnter={runCalculate}
                        prefix="$"
                        min="1"
                        tooltip="Payment you already make each month."
                      />
                      <CompactInput
                        id="monthly-surplus"
                        label="Extra Monthly Surplus"
                        value={monthlySurplus}
                        onChange={setMonthlySurplus}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional amount available each month for debt or savings."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Savings & Rebuild">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="savings-apy"
                        label="Savings APY"
                        value={savingsApy}
                        onChange={setSavingsApy}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        tooltip="Rate earned on the emergency fund."
                      />
                      <CompactInput
                        id="rebuild-allocation"
                        label="Rebuild Allocation"
                        value={rebuildAllocation}
                        onChange={setRebuildAllocation}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly amount directed to rebuilding the fund once the debt clears."
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
                  The monthly payment does not cover the interest on the debt, so the balance never falls.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Interest Saved by Using the Excess
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.interestSaved, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Excess over the one-month buffer: ${fmt(results.excess, 0)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Debt-Free: Keep
                </span>
                <span className="font-extrabold text-foreground">{results.monthsKeep} mo</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Debt-Free: Use
                </span>
                <span className="font-extrabold text-foreground">{results.monthsUse} mo</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Rebuild Time
                </span>
                <span className="font-extrabold text-foreground">
                  {results.rebuildMonths > 0 ? `${fmt(results.rebuildMonths, 1)} mo` : "—"}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Keep Fund</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Use Excess</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Months to payoff</td>
                    <td className="p-2.5 text-right text-foreground">{results.monthsKeep}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.monthsUse}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt interest paid</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.interestKeep, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.interestUse, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Savings interest earned</td>
                    <td className="p-2.5 text-right text-foreground">+${fmt(results.savingsInterestKeep, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">+${fmt(results.fundAfterUse - results.oneMonthBuffer, 0)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net cost</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netCostKeep, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.netCostUse, 0)}</td>
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
                    Runway Today
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.runwayNow, 1)} months</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Runway After Using Excess
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.runwayAfter, 1)} month</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months Saved</span>
                  <span className="text-base font-bold text-primary">
                    {results.monthsSaved > 0 ? `${results.monthsSaved} months` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Fund After Using Excess
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.fundAfterUse, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    One-Month Buffer
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.oneMonthBuffer, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Monthly Surplus Used
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.monthlySurplus, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Emergency Fund vs Debt Payoff Calculator?</h2>
            <p>
              An emergency fund vs debt payoff calculator answers a decision almost every household carrying a
              high-interest balance faces: should the savings go to the debt, or stay in the bank? Both instincts are
              right in part. Debt at 20%-plus costs far more than a savings account pays, so idle cash sitting beside it
              is losing ground every month. But an empty emergency fund is worse — the next surprise expense goes
              straight back onto the card, and the progress is undone at the worst possible moment.
            </p>
            <p>
              The resolution is a hybrid: keep a minimum buffer in cash and deploy everything above it. This calculator
              models both paths side by side — keeping the whole fund while paying the debt down, or using the excess
              over a one-month buffer as an immediate lump-sum payment — and compares the interest, the payoff dates and
              the state of the fund at the end.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator defines the one-month buffer as a single month of essential expenses, then treats
              everything above that as excess savings available for the debt. In the first scenario, the fund is kept
              intact and the debt is repaid with the regular payment plus the monthly surplus, earning savings interest
              at the APY you enter along the way. In the second, the excess is applied to the debt immediately and the
              same monthly payments follow, with the fund rebuilt afterwards at the allocation you set.
            </p>
            <p>
              Both schedules are simulated month by month, so the interest totals and payoff durations reflect the
              actual repayment path rather than a formula approximation. The comparison then reports the interest saved,
              the months removed and the net cost of each scenario — debt interest paid minus savings interest earned —
              which is the fairest single number for choosing between them.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the interest saved by deploying the excess, with the amount in question beneath
              it. The three-stat bar shows the debt-free month count for each path and the time needed to rebuild the
              fund, and the breakdown table sets the two scenarios against each other across payoff length, debt
              interest, savings interest and net cost.
            </p>
            <p>
              Summary Statistics adds today&apos;s runway in months, the runway remaining after the excess is used, the
              months saved, the rebuilt fund balance and the monthly surplus deployed. Treat the one-month buffer as a
              floor, not a target: once the high-rate debt is gone, the same surplus that cleared it should rebuild the
              fund to three to six months of expenses, and at that point the full safety net no longer competes with
              compound interest. Never deploy money you would need to borrow back at a higher rate — the arithmetic only
              works if the buffer truly covers the emergencies that arrive first. The comparison also ignores
              behaviour — a household that clears its cards and then runs them up again is worse off than one that kept
              the fund and made steady progress — so pair the arithmetic with a plan for what happens to the cleared
              accounts.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/emergency-fund-vs-debt-payoff-calculator" />
          <PopularCalculators exclude="/calculator/emergency-fund-vs-debt-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
