"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type CapMode = "once" | "annual";

interface CapitalizationInputs {
  principal: number;
  rate: number;
  graceYears: number;
  repayYears: number;
  capMode: CapMode;
}

const DEFAULTS: CapitalizationInputs = {
  principal: 30000,
  rate: 6.53,
  graceYears: 4,
  repayYears: 10,
  capMode: "once",
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

interface CapResult {
  accruedInterest: number;
  newPrincipal: number;
  principalGrowthPct: number;
  paymentBefore: number;
  paymentAfter: number;
  paymentIncrease: number;
  interestBefore: number;
  interestAfter: number;
  extraLifetimeInterest: number;
  valid: boolean;
  errorMsg: string;
}

function computeCapitalization(i: CapitalizationInputs): CapResult {
  const invalid = i.principal <= 0 || i.rate < 0 || i.graceYears < 0 || i.repayYears <= 0;

  const rate = i.rate / 100;
  // Simple interest during deferment; annual capitalization compounds the interest.
  const accruedInterest =
    i.capMode === "annual" ? i.principal * (Math.pow(1 + rate, i.graceYears) - 1) : i.principal * rate * i.graceYears;
  const newPrincipal = i.principal + accruedInterest;

  const n = Math.round(i.repayYears * 12);
  const paymentBefore = paymentFor(i.principal, rate / 12, n);
  const paymentAfter = paymentFor(newPrincipal, rate / 12, n);
  const interestBefore = paymentBefore * n - i.principal;
  const interestAfter = paymentAfter * n - newPrincipal;

  return {
    accruedInterest,
    newPrincipal,
    principalGrowthPct: (accruedInterest / i.principal) * 100,
    paymentBefore,
    paymentAfter,
    paymentIncrease: paymentAfter - paymentBefore,
    interestBefore,
    interestAfter,
    extraLifetimeInterest: interestAfter - interestBefore,
    valid: !invalid,
    errorMsg: invalid ? "Enter a positive principal and repayment term, a non-negative rate, and non-negative deferment years." : "",
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

export default function InterestCapitalizationCalculator() {
  const [principal, setPrincipal] = useState(String(DEFAULTS.principal));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [graceYears, setGraceYears] = useState(String(DEFAULTS.graceYears));
  const [repayYears, setRepayYears] = useState(String(DEFAULTS.repayYears));
  const [capMode, setCapMode] = useState<CapMode>(DEFAULTS.capMode);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CapitalizationInputs => ({
    principal: parseFloat(principal) || 0,
    rate: parseFloat(rate) || 0,
    graceYears: parseFloat(graceYears) || 0,
    repayYears: parseFloat(repayYears) || 0,
    capMode,
  });

  const [calcInputs, setCalcInputs] = useState<CapitalizationInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CapResult>(() => computeCapitalization(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeCapitalization(inputs));
  };

  const reset = () => {
    setPrincipal(String(DEFAULTS.principal));
    setRate(String(DEFAULTS.rate));
    setGraceYears(String(DEFAULTS.graceYears));
    setRepayYears(String(DEFAULTS.repayYears));
    setCapMode(DEFAULTS.capMode);
    setCalcInputs(DEFAULTS);
    setResults(computeCapitalization(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is interest capitalization on a student loan?",
      answer:
        "Capitalization is the moment unpaid interest is added to your loan principal, so it begins accruing interest itself. On federal student loans interest accrues while you are in school and during the six-month grace period, but it is not charged to you until a triggering event, most commonly the end of the grace period, the end of a deferment or forbearance, or a change in repayment plan. Each event adds the accumulated interest to the balance permanently.",
    },
    {
      question: "Why does capitalization cost so much?",
      answer:
        "Because the capitalised interest starts compounding. A $30,000 loan at 6.53% accruing interest across a four-year study period accumulates roughly $7,800 of unpaid interest, which pushes the principal to about $37,800. Every future interest charge is calculated on that larger balance, so the eventual cost is far greater than the interest itself. Paying the interest as it accrues, even partially, prevents it from ever being capitalised.",
    },
    {
      question: "What is the difference between simple and annual capitalization?",
      answer:
        "Simple accrual charges interest on the original principal only, so the deferment interest is a straight percentage applied to the principal for the number of years. Annual capitalization adds the interest to the principal each year, so the next year's interest is charged on a larger base. The calculator offers both so you can model a single end-of-grace capitalisation or a loan that capitalises every year while you are enrolled.",
    },
    {
      question: "How do I avoid interest capitalization?",
      answer:
        "Pay the interest as it accrues during school and deferment. Unsubsidised federal loans and private loans both begin accruing interest immediately, and any payment you make against that interest keeps it from being added to principal later. Even a modest monthly payment during school can eliminate the capitalisation step entirely and reduce the balance you face at repayment.",
    },
    {
      question: "Do subsidised loans capitalise?",
      answer:
        "Direct Subsidised loans do not accrue interest while you are enrolled at least half-time and during the grace period, because the government pays the interest during those periods, so there is nothing to capitalise at that point. Interest does accrue during a grace period on unsubsidised loans, and on all loan types during deferment and forbearance, which is when capitalisation typically bites.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Interest Capitalization Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Interest Capitalization Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="principal"
                  label="Loan Principal"
                  value={principal}
                  onChange={setPrincipal}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Amount originally borrowed."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Fixed annual rate on the loan."
                />
              </div>
            </SubSection>

            <SubSection title="Timeline">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="grace-years"
                  label="Deferment Period"
                  value={graceYears}
                  onChange={setGraceYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Years in school plus grace during which interest accrues unpaid."
                />
                <CompactInput
                  id="repay-years"
                  label="Repayment Term"
                  value={repayYears}
                  onChange={setRepayYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Years over which the loan is repaid after capitalisation."
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
                  <SubSection title="Capitalization Method">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label htmlFor="cap-mode" className="flex items-center text-sm font-semibold text-foreground mb-1">
                          Frequency
                        </label>
                        <div className="relative h-9">
                          <select
                            id="cap-mode"
                            value={capMode}
                            onChange={(e) => setCapMode(e.target.value as CapMode)}
                            className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                          >
                            <option value="once">Once, at end of deferment</option>
                            <option value="annual">Annually during deferment</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Interest: {fmt(calcInputs.rate, 2)}% {capMode === "annual" ? "compounding" : "simple"}
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

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">New Principal</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.newPrincipal, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Original ${fmt(calcInputs.principal, 0)} grew {fmt(results.principalGrowthPct, 1)}% by capitalisation
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Capitalised Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.accruedInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payment Increase</span>
                <span className="font-extrabold text-foreground">${fmt(results.paymentIncrease)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extra Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.extraLifetimeInterest, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Stage</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Monthly Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Before Capitalisation</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.principal, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">${fmt(results.paymentBefore)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Interest Accrued</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.accruedInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">—</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">After Capitalisation</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.newPrincipal, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.paymentAfter)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Original Principal</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.principal, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Accrued</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.accruedInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">New Principal</span>
                  <span className="text-base font-bold text-primary">${fmt(results.newPrincipal, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Payment</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.paymentAfter)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lifetime Interest (after)</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.interestAfter, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Extra Cost of Capitalisation</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.extraLifetimeInterest, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Interest Capitalization Calculator?</h2>
            <p>
              An interest capitalization calculator shows what happens to a student loan balance when unpaid interest is
              added to the principal. While you are in school and during the six-month grace period, interest accrues on
              unsubsidised and private loans, but it is not billed to you immediately. Instead it accumulates until a
              triggering event, such as the end of the grace period or a deferment, at which point it is capitalised:
              added to the principal so that it begins generating interest of its own.
            </p>
            <p>
              That single step is why two loans with identical rates can cost very different amounts. A dollar of
              capitalised interest earns interest for the entire repayment term, so paying interest as it accrues is one of
              the highest-return moves a borrower can make. This calculator quantifies the growth so you can decide whether
              in-school payments are worth the effort.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator accrues interest across your deferment period using the rate you enter. In the simple mode it
              charges interest on the original principal only, giving an accrued figure of principal multiplied by rate
              multiplied by years. In the annual-capitalisation mode it compounds, growing the balance by the annual rate
              each year so that later interest is charged on an increasing base. The accrued interest is then added to the
              principal to produce the new balance.
            </p>
            <p>
              With both the original and the capitalised principal in hand, the calculator computes the monthly payment
              under the amortisation formula PMT = P x r / (1 - (1 + r)^-n) in each case, along with the total interest
              over the repayment term. The difference between those two lifetime interest figures is the extra cost that
              capitalisation directly causes, separate from the interest that simply accrued.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the new principal after capitalisation and how much it grew, which is the number that
              changes everything downstream. The three statistics beside it give the capitalised interest itself, the
              increase in your monthly payment, and the extra lifetime interest the larger balance produces. The breakdown
              table lays the three stages side by side, before capitalisation, the accrued interest, and after, so the
              growth is visible at a glance.
            </p>
            <p>
              Summary Statistics collects the original principal, the accrued interest, the new balance, the resulting
              monthly payment, the lifetime interest under the capitalised loan, and the extra cost attributable to
              capitalisation. Treat the figures as planning estimates that assume a constant rate and a level repayment
              term; federal loans can change rate structure and repayment plans, and subsidised loans do not accrue
              interest during qualified in-school periods. The safest strategy the numbers support is to pay interest
              during deferment wherever possible so there is nothing left to capitalise.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-capitalization-calculator" />
          <PopularCalculators exclude="/calculator/interest-capitalization-calculator" />
        </div>
      </div>
    </>
  );
}
