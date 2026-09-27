"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RuleOf78Inputs {
  principal: number;
  apr: number;
  termMonths: number;
  monthsPaid: number;
}

const DEFAULTS: RuleOf78Inputs = {
  principal: 12000,
  apr: 18,
  termMonths: 36,
  monthsPaid: 12,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";

const money0 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface RuleOf78Row {
  month: number;
  rebate: number;
  rulePayoff: number;
  actuarialPayoff: number;
  difference: number;
  selected: boolean;
}

interface RuleOf78Result {
  monthlyPayment: number;
  financeCharge: number;
  totalSum: number;
  remainingSum: number;
  rebate: number;
  rebatePercent: number;
  rulePayoff: number;
  actuarialPayoff: number;
  extraCost: number;
  earnedInterest: number;
  interestPaidSoFar: number;
  monthsRemaining: number;
  remainingDigits: number;
  schedule: RuleOf78Row[];
  valid: boolean;
  errorMsg: string;
}

function computeRuleOf78(i: RuleOf78Inputs): RuleOf78Result {
  const n = Math.max(0, Math.round(i.termMonths));
  const paid = Math.min(Math.max(0, Math.round(i.monthsPaid)), Math.max(0, n - 1));
  const ir = i.apr / 100 / 12;
  const pmt = payment(i.principal, i.apr, n);
  const financeCharge = Math.max(0, pmt * n - i.principal);

  // Sum-of-digits: a twelve-month loan carries the digits one to twelve, which total 78.
  const totalSum = (n * (n + 1)) / 2;
  const remaining = n - paid;
  const remainingSum = (remaining * (remaining + 1)) / 2;
  const rebate = totalSum > 0 ? (financeCharge * remainingSum) / totalSum : 0;
  const rulePayoff = Math.max(0, pmt * remaining - rebate);

  const actuarialBalance = (afterMonths: number) => {
    let bal = i.principal;
    for (let m = 0; m < afterMonths; m++) {
      bal = bal + bal * ir - pmt;
      if (bal < 0) {
        bal = 0;
        break;
      }
    }
    return Math.max(0, bal);
  };

  const actuarialPayoff = actuarialBalance(paid);
  const earnedInterest = Math.max(0, financeCharge - rebate);
  const interestPaidSoFar = Math.max(0, pmt * paid - (i.principal - actuarialPayoff));

  const schedule: RuleOf78Row[] = [];
  for (let m = 6; m < n; m += 6) {
    const rem = n - m;
    const remSum = (rem * (rem + 1)) / 2;
    const reb = totalSum > 0 ? (financeCharge * remSum) / totalSum : 0;
    const rule = Math.max(0, pmt * rem - reb);
    const act = actuarialBalance(m);
    schedule.push({
      month: m,
      rebate: reb,
      rulePayoff: rule,
      actuarialPayoff: act,
      difference: rule - act,
      selected: m === paid,
    });
  }
  if (!schedule.some((r) => r.selected) && paid >= 0) {
    const rem = n - paid;
    const remSum = (rem * (rem + 1)) / 2;
    const reb = totalSum > 0 ? (financeCharge * remSum) / totalSum : 0;
    schedule.push({
      month: paid,
      rebate: reb,
      rulePayoff: Math.max(0, pmt * rem - reb),
      actuarialPayoff,
      difference: Math.max(0, pmt * rem - reb) - actuarialPayoff,
      selected: true,
    });
    schedule.sort((a, b) => a.month - b.month);
  }

  const invalid =
    i.principal <= 0 ||
    i.apr < 0 ||
    i.termMonths < 1 ||
    i.monthsPaid < 0 ||
    Math.round(i.monthsPaid) >= Math.round(i.termMonths);
  const errorMsg = invalid
    ? "Enter a positive amount financed, a term of at least one month, a non-negative rate, and fewer payments made than the term."
    : "";

  return {
    monthlyPayment: pmt,
    financeCharge,
    totalSum,
    remainingSum,
    rebate,
    rebatePercent: financeCharge > 0 ? (rebate / financeCharge) * 100 : 0,
    rulePayoff,
    actuarialPayoff,
    extraCost: rulePayoff - actuarialPayoff,
    earnedInterest,
    interestPaidSoFar,
    monthsRemaining: remaining,
    remainingDigits: remainingSum,
    schedule,
    valid: !invalid,
    errorMsg,
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

export default function RuleOf78RebateCalculator() {
  const [principal, setPrincipal] = useState(String(DEFAULTS.principal));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [monthsPaid, setMonthsPaid] = useState(String(DEFAULTS.monthsPaid));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RuleOf78Inputs => ({
    principal: parseFloat(principal) || 0,
    apr: parseFloat(apr) || 0,
    termMonths: parseFloat(termMonths) || 0,
    monthsPaid: parseFloat(monthsPaid) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<RuleOf78Inputs>(() => DEFAULTS);
  const [results, setResults] = useState<RuleOf78Result>(() => computeRuleOf78(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeRuleOf78(inputs));
  };

  const reset = () => {
    setPrincipal(String(DEFAULTS.principal));
    setApr(String(DEFAULTS.apr));
    setTermMonths(String(DEFAULTS.termMonths));
    setMonthsPaid(String(DEFAULTS.monthsPaid));
    setCalcInputs(DEFAULTS);
    setResults(computeRuleOf78(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the rule of 78?",
      answer:
        "The rule of 78 is a method of working out how much interest a lender has earned when a precomputed loan is repaid early. It allocates the finance charge across the payments in proportion to the digits of each payment number, so a thirty-six month loan assigns far more interest to the early months than a declining-balance calculation would. The name comes from the total of the digits one to twelve, which is seventy-eight.",
    },
    {
      question: "How is the rebate calculated?",
      answer:
        "The sum of the digits for the remaining payments is divided by the sum of the digits for the whole term, and that fraction is multiplied by the total finance charge. The result is the unearned interest the borrower gets back when the loan is settled early. Subtracting it from the remaining scheduled payments gives the payoff figure.",
    },
    {
      question: "Is the rule of 78 always worse for the borrower?",
      answer:
        "Yes, whenever the rebate is smaller than the interest that has actually accrued under a declining-balance calculation, which is the normal case for any early payoff. The gap is widest very early in the term and narrows to nothing by the final payment. In the United States the method is restricted for consumer credit over sixty-one months and banned outright for terms longer than that.",
    },
    {
      question: "What loans still use it?",
      answer:
        "It survives mainly in some short-term instalment contracts, certain dealer-arranged vehicle finance, and older agreements still running. Many jurisdictions now require a simple actuarial rebate, sometimes called the actuarial method, which credits interest only as it is earned. Check the prepayment clause of your own contract for the formula it names.",
    },
    {
      question: "How can I avoid the extra cost?",
      answer:
        "If the contract specifies the rule of 78, the only way to escape the penalty is to repay as late as possible or to negotiate the clause before signing. Where a rebate method is still negotiable, insist on an actuarial rebate: it gives back the interest that has not been earned, so settling early costs only what you have genuinely been charged.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Rule of 78 Rebate Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Rule of 78 Rebate Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="principal"
                  label="Amount Financed"
                  value={principal}
                  onChange={setPrincipal}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The amount borrowed, before the finance charge is added."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.25"
                  tooltip="Annual rate used to build the precomputed payment."
                />
              </div>
            </SubSection>

            <SubSection title="Term and Progress">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="term"
                  label="Term"
                  value={termMonths}
                  onChange={setTermMonths}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="1"
                  tooltip="Number of scheduled payments in the contract."
                />
                <CompactInput
                  id="paid"
                  label="Payments Made"
                  value={monthsPaid}
                  onChange={setMonthsPaid}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="0"
                  tooltip="How many instalments have already been paid when you settle."
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
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The rebate is compared with an actuarial payoff on the same balance. A precomputed loan charges the full
                      finance charge up front, so the rule of 78 keeps more interest in the early months than accrual
                      accounting would. Terms over 61 months cannot use the method for most United States consumer credit.
                    </p>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Payoff to Settle Today</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {money(results.rulePayoff)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.rebate)} rebate of the remaining finance charge &middot; {results.monthsRemaining} payments left
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rebate</span>
                <span className="font-extrabold text-emerald-600">{money(results.rebate)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Actuarial Payoff</span>
                <span className="font-extrabold text-foreground">{money(results.actuarialPayoff)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extra Cost</span>
                <span className={`font-extrabold ${results.extraCost > 0.005 ? "text-destructive" : "text-emerald-600"}`}>
                  {money(results.extraCost)}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Settle After</th>
                    <th className="p-2.5 text-right w-[105px]">Rebate</th>
                    <th className="p-2.5 text-right w-[120px]">Rule of 78</th>
                    <th className="p-2.5 text-right w-[120px]">Actuarial</th>
                    <th className="p-2.5 pr-3 text-right w-[95px]">Extra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.schedule.map((row) => (
                    <tr
                      key={row.month}
                      className={`transition-colors ${row.selected ? "bg-primary/5" : "hover:bg-secondary/20"}`}
                    >
                      <td className={`p-2.5 pl-3 ${row.selected ? "font-bold text-primary" : "font-semibold text-foreground"}`}>
                        {row.month} payments
                      </td>
                      <td className="p-2.5 text-right text-emerald-600">{money(row.rebate)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.rulePayoff)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.actuarialPayoff)}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.difference > 0.005 ? "text-destructive" : "text-emerald-600"}`}>
                        {money(row.difference)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Pay in Full on Schedule</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">{money0(results.monthlyPayment * calcInputs.termMonths)}</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money0(results.financeCharge)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Amount Financed</span>
                  <span className="text-base font-bold text-foreground">{money0(calcInputs.principal)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Finance Charge</span>
                  <span className="text-base font-bold text-foreground">{money0(results.financeCharge)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total if Paid as Agreed</span>
                  <span className="text-base font-bold text-foreground">
                    {money0(results.monthlyPayment * calcInputs.termMonths)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payments Made</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.monthsPaid}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payments Remaining</span>
                  <span className="text-base font-bold text-foreground">{results.monthsRemaining}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sum of Digits</span>
                  <span className="text-base font-bold text-foreground">{results.totalSum}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Remaining Digits</span>
                  <span className="text-base font-bold text-foreground">{results.remainingDigits}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Remaining Scheduled</span>
                  <span className="text-base font-bold text-foreground">
                    {money(results.monthlyPayment * results.monthsRemaining)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rebate Share</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.rebatePercent, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Kept (Rule of 78)</span>
                  <span className="text-base font-bold text-foreground">{money(results.earnedInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Earned (Actuarial)</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.interestPaidSoFar)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rule of 78 Payoff</span>
                  <span className="text-base font-bold text-primary">{money(results.rulePayoff)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost of the Method</span>
                  <span className="text-base font-bold text-destructive">{money(results.extraCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Rule of 78 Rebate Calculator?</h2>
            <p>
              A rule of 78 rebate calculator works out the interest a borrower gets back when a precomputed instalment loan
              is settled early. Precomputed contracts add the whole finance charge to the amount financed at the outset and
              then divide the total into equal payments. When the borrower pays the balance off ahead of schedule, part of
              that pre-charged interest has not been earned yet and must be refunded. The rule of 78 decides how much.
            </p>
            <p>
              The name comes from the arithmetic. For a twelve-month loan the payment numbers are one to twelve, and their
              total is seventy-eight. Interest is allocated in the proportion of twelve, eleven, ten and so on down to one, so
              the first payment carries twelve seventy-eighths of the finance charge and the last carries one seventy-eighth.
              That front-loaded split is why an early payoff returns less interest than accrual accounting would suggest.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Rebate Is Calculated</h2>
            <p>
              The calculator builds the precomputed payment from the amount financed, the rate and the term, then multiplies
              that payment by the number of instalments to get the finance charge. The sum of the digits for the whole term is
              the term multiplied by the term plus one, divided by two. For the payments still outstanding, the same formula
              applied to the remaining months gives the remaining sum of digits.
            </p>
            <p>
              The rebate is the finance charge multiplied by the remaining sum of digits divided by the total sum of digits, and
              the payoff is the remaining scheduled payments less that rebate. Alongside it the calculator runs an actuarial
              amortisation of the same loan, crediting interest only as it is earned on the declining balance. The difference
              between the two payoffs is the amount the rule of 78 charges for settling early.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the payoff figure for settling today, with the rebate and the number of payments
              remaining underneath. The three statistics beside it show the rebate, the actuarial payoff on the same balance,
              and the extra cost of the rule of 78. The breakdown table compares both methods at six-payment intervals so the
              penalty is visible at every point in the term, with your own payoff month highlighted.
            </p>
            <p>
              Summary Statistics collects the amount financed, monthly payment, finance charge, the total if the loan runs to
              term, payments made and remaining, both sums of digits, the remaining scheduled payments, the rebate as a share
              of the finance charge, the interest each method leaves with the lender, the rule of 78 payoff and the cost of the
              method. The extra cost shrinks the further into the term you go, which is the practical argument for waiting
              before settling a precomputed contract early.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rule-of-78-rebate-calculator" />
          <PopularCalculators exclude="/calculator/rule-of-78-rebate-calculator" />
        </div>
      </div>
    </>
  );
}
