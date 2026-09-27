"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface CompareInputs {
  loanAmount: number;
  years: number;
  rateA: number;
  rateB: number;
  feesA: number;
  feesB: number;
  prepaidDays: number;
}

const DEFAULTS: CompareInputs = {
  loanAmount: 300000,
  years: 30,
  rateA: 6.35,
  rateB: 6.1,
  feesA: 1200,
  feesB: 3800,
  prepaidDays: 15,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

function solveMonthlyRate(netProceeds: number, payment: number, n: number): number {
  if (netProceeds <= 0 || payment <= 0 || n <= 0) return 0;
  let lo = 0;
  let hi = 3;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const f = Math.pow(1 + mid, n);
    const pv = mid > 0 ? (payment * (f - 1)) / (mid * f) : payment * n;
    if (pv > netProceeds) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface Offer {
  label: string;
  rate: number;
  fees: number;
  payment: number;
  apr: number;
  totalCost: number;
}

interface CompareResult {
  offerA: Offer;
  offerB: Offer;
  winner: string;
  aprSpread: number;
  totalSavings: number;
  valid: boolean;
  errorMsg: string;
}

function computeCompare(i: CompareInputs): CompareResult {
  const invalid = i.loanAmount <= 0 || i.years <= 0 || i.rateA < 0 || i.rateB < 0 || i.feesA < 0 || i.feesB < 0;

  const n = Math.round(i.years * 12);

  const build = (label: string, rate: number, fees: number): Offer => {
    const payment = paymentFor(i.loanAmount, rate / 100 / 12, n);
    const prepaidInterest = (i.loanAmount * (rate / 100) * i.prepaidDays) / 365;
    const totalFees = fees + prepaidInterest;
    const netProceeds = i.loanAmount - totalFees;
    const apr = solveMonthlyRate(netProceeds, payment, n) * 12 * 100;
    return { label, rate, fees: totalFees, payment, apr, totalCost: payment * n + fees };
  };

  const offerA = build("Offer A", i.rateA, i.feesA);
  const offerB = build("Offer B", i.rateB, i.feesB);
  const aprSpread = Math.abs(offerA.apr - offerB.apr);
  const cheaper = offerA.apr <= offerB.apr ? "A" : "B";
  const totalSavings = Math.abs(offerA.totalCost - offerB.totalCost);

  return {
    offerA,
    offerB,
    winner: aprSpread < 0.0005 ? "Tie" : cheaper,
    aprSpread,
    totalSavings,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan amount and term, non-negative rates, and non-negative fee figures for both offers."
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

export default function InterestRateVsAprComparison() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [rateA, setRateA] = useState(String(DEFAULTS.rateA));
  const [rateB, setRateB] = useState(String(DEFAULTS.rateB));
  const [feesA, setFeesA] = useState(String(DEFAULTS.feesA));
  const [feesB, setFeesB] = useState(String(DEFAULTS.feesB));
  const [prepaidDays, setPrepaidDays] = useState(String(DEFAULTS.prepaidDays));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CompareInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    years: parseFloat(years) || 0,
    rateA: parseFloat(rateA) || 0,
    rateB: parseFloat(rateB) || 0,
    feesA: parseFloat(feesA) || 0,
    feesB: parseFloat(feesB) || 0,
    prepaidDays: parseFloat(prepaidDays) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<CompareInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CompareResult>(() => computeCompare(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeCompare(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setYears(String(DEFAULTS.years));
    setRateA(String(DEFAULTS.rateA));
    setRateB(String(DEFAULTS.rateB));
    setFeesA(String(DEFAULTS.feesA));
    setFeesB(String(DEFAULTS.feesB));
    setPrepaidDays(String(DEFAULTS.prepaidDays));
    setCalcInputs(DEFAULTS);
    setResults(computeCompare(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between an interest rate and an APR?",
      answer:
        "The interest rate is the cost of the loan principal, expressed as a yearly percentage. The APR is a broader figure required by the Truth in Lending Act that also includes most lender fees and charges, expressed as an annual rate. Because the APR folds in costs that the interest rate ignores, it is always at least as high, and the size of the gap tells you how much the fees add to the cost of borrowing.",
    },
    {
      question: "Why can a lower interest rate cost more overall?",
      answer:
        "A lower rate paired with high fees can end up more expensive than a slightly higher rate with low fees. That is exactly the trap APR is designed to expose. If offer B quotes 6.1% but charges $3,800 in fees while offer A quotes 6.35% with $1,200, the fee difference can outweigh the rate advantage and push offer B's APR above offer A's, making A the cheaper loan despite the higher headline rate.",
    },
    {
      question: "Which should I compare first, rate or APR?",
      answer:
        "APR is the better first comparison because it normalises different fee and rate mixes onto one scale. Once you have ranked offers by APR, check the monthly payment and total cost, since a shorter term can inflate APR while lowering total interest. Use APR to eliminate offers, then confirm the winner against the payment you can actually afford and the total dollars you will pay.",
    },
    {
      question: "What fees go into the APR calculation?",
      answer:
        "Origination and underwriting fees, discount points and prepaid per-diem interest are the core finance charges included here. Some third-party costs such as appraisals or title work may be excluded from a lender's APR depending on the loan type. Enter the charges your lender treats as finance charges to reproduce its disclosed APR as closely as possible, and use the same set of fees for both offers so the comparison stays fair.",
    },
    {
      question: "How much APR difference actually matters?",
      answer:
        "On a large long-term loan even a tenth of a point is meaningful, because it compounds across hundreds of payments. On a $300,000 mortgage, an eighth of a percentage point is worth thousands of dollars over thirty years. Use the total-cost figures as well as the APR spread: this calculator reports both, so you can see whether the APR edge translates into a cash saving large enough to matter to your decision.",
    },
  ];

  const rows = [
    {
      label: "Interest Rate",
      a: `${fmt(results.offerA.rate, 3)}%`,
      b: `${fmt(results.offerB.rate, 3)}%`,
    },
    {
      label: "Fees (incl. prepaid interest)",
      a: `$${fmt(results.offerA.fees, 0)}`,
      b: `$${fmt(results.offerB.fees, 0)}`,
    },
    {
      label: "Monthly Payment",
      a: `$${fmt(results.offerA.payment)}`,
      b: `$${fmt(results.offerB.payment)}`,
    },
    {
      label: "APR",
      a: `${fmt(results.offerA.apr, 3)}%`,
      b: `${fmt(results.offerB.apr, 3)}%`,
    },
    {
      label: "Total Cost (payments + fees)",
      a: `$${fmt(results.offerA.totalCost, 0)}`,
      b: `$${fmt(results.offerB.totalCost, 0)}`,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Interest Rate vs APR Comparison" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Interest Rate vs APR Comparison
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Basis">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Principal for both offers."
                />
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Term applied to both offers."
                />
              </div>
            </SubSection>

            <SubSection title="Offer Rates">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate-a"
                  label="Offer A Rate"
                  value={rateA}
                  onChange={setRateA}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Interest rate quoted on offer A."
                />
                <CompactInput
                  id="rate-b"
                  label="Offer B Rate"
                  value={rateB}
                  onChange={setRateB}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Interest rate quoted on offer B."
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
                  <SubSection title="Offer Fees">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="fees-a"
                        label="Offer A Fees"
                        value={feesA}
                        onChange={setFeesA}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Origination and closing fees on offer A."
                      />
                      <CompactInput
                        id="fees-b"
                        label="Offer B Fees"
                        value={feesB}
                        onChange={setFeesB}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Origination and closing fees on offer B."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Prepaid Interest">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="prepaid"
                        label="Prepaid Interest"
                        value={prepaidDays}
                        onChange={setPrepaidDays}
                        onEnter={runCalculate}
                        suffix="days"
                        min="0"
                        tooltip="Per-diem interest paid at closing, computed for each offer's own rate."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Cheaper: Offer {results.winner}
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Cheaper Offer by APR</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.winner === "Tie" ? "Tie" : `Offer ${results.winner}`}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                APR difference of {fmt(results.aprSpread, 3)} points &middot; total-cost gap ${fmt(results.totalSavings, 0)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">APR A</span>
                <span className="font-extrabold text-foreground">{fmt(results.offerA.apr, 3)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">APR B</span>
                <span className="font-extrabold text-foreground">{fmt(results.offerB.apr, 3)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost Gap</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalSavings, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 text-right w-[130px]">Offer A</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Offer B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.a}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cheaper Offer</span>
                  <span className="text-base font-bold text-primary">
                    {results.winner === "Tie" ? "Tie" : `Offer ${results.winner}`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">APR Spread</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.aprSpread, 3)} pts</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment A / B</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(results.offerA.payment, 0)} / ${fmt(results.offerB.payment, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fees A / B</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(results.offerA.fees, 0)} / ${fmt(results.offerB.fees, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Cost A</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.offerA.totalCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Cost B</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.offerB.totalCost, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Interest Rate vs APR Comparison?</h2>
            <p>
              An interest rate versus APR comparison puts two loan offers side by side and shows which one is genuinely
              cheaper. The interest rate tells you what the principal costs; the APR tells you what the whole loan costs
              once lender fees and charges are folded in. Lenders can quote similar rates while charging very different
              fees, so comparing rates alone can lead you to the more expensive deal. This calculator computes both figures
              for both offers and reports the APR spread and the difference in total dollars paid.
            </p>
            <p>
              The classic case it resolves is a lower rate with higher fees against a slightly higher rate with lower fees.
              Only after each offer&apos;s costs are expressed as an annual rate does it become clear which one actually
              leaves more money in your pocket over the life of the loan.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              For each offer the calculator computes the scheduled payment from the amortisation formula
              PMT = P x r / (1 - (1 + r)^-n) using that offer&apos;s rate and the shared term. It then adds the lender
              fees you enter to any prepaid per-diem interest based on that offer&apos;s own rate, and subtracts the total
              from the loan amount to find the net proceeds. The APR is the rate at which the present value of the payment
              stream equals those net proceeds, solved by bisection and annualised by multiplying by twelve.
            </p>
            <p>
              With an APR for each offer the comparison is direct: the lower APR is the cheaper loan. The calculator also
              totals the cost of each offer as payments plus fees, so you can see whether the APR advantage translates
              into a meaningful cash difference. Because both offers share the same principal and term, every difference in
              the output is attributable to the rate and fee mix rather than to loan size or duration.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card names the cheaper offer by APR and reports the spread in points along with the total-cost
              gap. The three statistics underneath give each offer&apos;s APR and the cash difference between them. The
              breakdown table lines up interest rate, fees, monthly payment, APR and total cost for both offers, so you can
              see exactly where the advantage comes from, whether it is a rate edge, a fee edge, or both.
            </p>
            <p>
              Summary Statistics collects the winner, the APR spread, the payments and fees for each offer, and the total
              cost of each. A few tenths of a point of APR can be worth thousands of dollars on a large, long-term loan,
              which is why APR belongs in any mortgage or auto-loan comparison. Note that some third-party fees may be
              excluded from a lender&apos;s own APR figure depending on loan type, so use the same fee set for both offers
              and treat the output as a comparison tool rather than a substitute for each lender&apos;s Loan Estimate.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-rate-vs-apr-comparison" />
          <PopularCalculators exclude="/calculator/interest-rate-vs-apr-comparison" />
        </div>
      </div>
    </>
  );
}
