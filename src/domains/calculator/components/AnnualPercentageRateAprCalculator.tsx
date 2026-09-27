"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AprInputs {
  loanAmount: number;
  interestRate: number;
  years: number;
  originationPct: number;
  otherCosts: number;
  prepaidDays: number;
}

const DEFAULTS: AprInputs = {
  loanAmount: 250000,
  interestRate: 6.5,
  years: 30,
  originationPct: 1,
  otherCosts: 900,
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

/** Solve the monthly rate whose present value of payments equals the net proceeds. */
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

interface AprResult {
  monthlyPayment: number;
  originationFee: number;
  prepaidInterest: number;
  totalFees: number;
  netProceeds: number;
  aprPct: number;
  financeCharge: number;
  totalOfPayments: number;
  rateSpread: number;
  valid: boolean;
  errorMsg: string;
}

function computeApr(i: AprInputs): AprResult {
  const invalid = i.loanAmount <= 0 || i.interestRate < 0 || i.years <= 0 || i.originationPct < 0 || i.prepaidDays < 0;

  const n = Math.round(i.years * 12);
  const monthlyPayment = paymentFor(i.loanAmount, i.interestRate / 100 / 12, n);
  const originationFee = (i.loanAmount * i.originationPct) / 100;
  const prepaidInterest = (i.loanAmount * (i.interestRate / 100) * i.prepaidDays) / 365;
  const totalFees = originationFee + i.otherCosts + prepaidInterest;
  const netProceeds = i.loanAmount - totalFees;
  const monthlyRate = solveMonthlyRate(netProceeds, monthlyPayment, n);
  const aprPct = monthlyRate * 12 * 100;
  const totalOfPayments = monthlyPayment * n;
  const financeCharge = totalOfPayments - i.loanAmount + totalFees;

  return {
    monthlyPayment,
    originationFee,
    prepaidInterest,
    totalFees,
    netProceeds,
    aprPct,
    financeCharge,
    totalOfPayments,
    rateSpread: aprPct - i.interestRate,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive loan amount and term, a non-negative interest rate, and non-negative fee/day figures."
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

export default function AnnualPercentageRateAprCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [originationPct, setOriginationPct] = useState(String(DEFAULTS.originationPct));
  const [otherCosts, setOtherCosts] = useState(String(DEFAULTS.otherCosts));
  const [prepaidDays, setPrepaidDays] = useState(String(DEFAULTS.prepaidDays));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AprInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    interestRate: parseFloat(interestRate) || 0,
    years: parseFloat(years) || 0,
    originationPct: parseFloat(originationPct) || 0,
    otherCosts: parseFloat(otherCosts) || 0,
    prepaidDays: parseFloat(prepaidDays) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<AprInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AprResult>(() => computeApr(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeApr(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setInterestRate(String(DEFAULTS.interestRate));
    setYears(String(DEFAULTS.years));
    setOriginationPct(String(DEFAULTS.originationPct));
    setOtherCosts(String(DEFAULTS.otherCosts));
    setPrepaidDays(String(DEFAULTS.prepaidDays));
    setCalcInputs(DEFAULTS);
    setResults(computeApr(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between the interest rate and the APR?",
      answer:
        "The interest rate is the cost of borrowing the principal, quoted as a yearly percentage of the amount financed. The APR, or annual percentage rate, is a broader measure required by the Truth in Lending Act that folds in most lender fees and charges and expresses them as an annual rate. Because fees are added on top of interest, the APR is always at least as high as the interest rate, and the gap between them tells you how much the fees really cost.",
    },
    {
      question: "Why is APR a better comparison tool than the interest rate?",
      answer:
        "Two lenders can quote the same interest rate and charge very different fees. Comparing only the rate hides those differences, while comparing APR puts both offers on the same footing by translating every cost into a single annual figure. When you are choosing between offers with different mixes of rate and fees, the lower APR is generally the cheaper loan.",
    },
    {
      question: "How is APR calculated here?",
      answer:
        "The calculator first computes the scheduled monthly payment from the interest rate and term, then subtracts origination fees, other closing costs and any prepaid per-diem interest to find the net proceeds actually received. It then solves, by bisection, for the rate that makes the present value of your payments equal those net proceeds, and annualises that periodic rate. This mirrors the actuarial method lenders use under Regulation Z.",
    },
    {
      question: "Which fees are included in APR?",
      answer:
        "Included charges are generally the finance-charge items: origination and underwriting fees, points and prepaid interest. Certain third-party costs such as appraisals, credit reports and title insurance may be excluded from the APR calculation depending on the loan type. This calculator uses the common lending set plus the optional fields you control, so enter the fees your lender actually treats as finance charges for the closest match to a Loan Estimate.",
    },
    {
      question: "Does a higher APR always mean a worse deal?",
      answer:
        "Usually, but not always. A shorter term raises the APR because the same fees are spread across fewer years, even though the loan may cost less in total interest. A loan with a slightly higher APR but much lower total of payments can still be the better choice. Use APR as the primary comparison signal, then confirm with the finance charge and total of payments before deciding.",
    },
  ];

  const breakdownRows = [
    { label: "Loan Amount", value: `$${fmt(calcInputs.loanAmount, 0)}`, note: "Principal borrowed" },
    { label: "Origination Fee", value: `$${fmt(results.originationFee, 0)}`, note: `${fmt(calcInputs.originationPct, 2)}% of loan` },
    { label: "Other Closing Costs", value: `$${fmt(calcInputs.otherCosts, 0)}`, note: "Finance-charge items" },
    { label: "Prepaid Interest", value: `$${fmt(results.prepaidInterest, 0)}`, note: `${fmt(calcInputs.prepaidDays, 0)} days per-diem` },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "APR Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Annual Percentage Rate (APR) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Principal being borrowed."
                />
                <CompactInput
                  id="interest-rate"
                  label="Interest Rate"
                  value={interestRate}
                  onChange={setInterestRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Nominal (note) rate quoted on the loan."
                />
              </div>
            </SubSection>

            <SubSection title="Term & Fees">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Amortisation term in years."
                />
                <CompactInput
                  id="origination"
                  label="Origination Fee"
                  value={originationPct}
                  onChange={setOriginationPct}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.25"
                  min="0"
                  tooltip="Lender fee as a percentage of the loan amount."
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
                  <SubSection title="Additional Charges">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="other-costs"
                        label="Other Closing Costs"
                        value={otherCosts}
                        onChange={setOtherCosts}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Other finance-charge items included in the APR."
                      />
                      <CompactInput
                        id="prepaid"
                        label="Prepaid Interest"
                        value={prepaidDays}
                        onChange={setPrepaidDays}
                        onEnter={runCalculate}
                        suffix="days"
                        min="0"
                        tooltip="Per-diem interest paid at closing before the first payment."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">True APR</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.aprPct, 3)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.rateSpread, 3)} points above the {fmt(calcInputs.interestRate, 3)}% note rate
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Payment</span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyPayment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Finance Charge</span>
                <span className="font-extrabold text-foreground">${fmt(results.financeCharge, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total of Payments</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalOfPayments, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.value}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net Proceeds</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netProceeds, 0)}</td>
                    <td className="p-2.5 pr-3 text-foreground">Amount actually received</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Note Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.interestRate, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">True APR</span>
                  <span className="text-base font-bold text-primary">{fmt(results.aprPct, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Fees</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalFees, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rate Spread</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.rateSpread, 3)} pts</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Finance Charge</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.financeCharge, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total of Payments</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalOfPayments, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an APR Calculator?</h2>
            <p>
              An APR calculator finds the annual percentage rate on a loan, which is the interest rate plus the effect of
              the lender fees bundled into the deal. Where the note rate tells you what the principal costs, the APR tells
              you what the whole loan costs, because it translates origination fees, discount points, prepaid interest and
              other finance charges into a single annual figure. Regulators require lenders to disclose APR precisely so
              that borrowers can compare offers that differ in how they split cost between rate and fees.
            </p>
            <p>
              The gap between the two numbers is the information. A loan quoted at 6.5% with a 1% origination fee and
              ordinary closing costs typically carries an APR a few tenths of a point higher, and that spread widens as
              fees grow and the term shortens. Seeing the spread in points tells you at a glance how much of the deal is
              rate and how much is fee.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator starts with the scheduled payment from the amortisation formula
              PMT = P x r / (1 - (1 + r)^-n), using the note rate and term. It then subtracts every finance charge you
              entered, plus any prepaid per-diem interest, from the loan amount to find the net proceeds you actually
              receive. The APR is the rate at which the present value of your payment stream equals those net proceeds;
              the calculator solves for it by bisection, converging on the periodic rate and then annualising it by
              multiplying by twelve.
            </p>
            <p>
              Two further figures are reported for completeness. The finance charge is the total dollar cost of credit,
              meaning everything you pay above the principal. The total of payments is the sum of every instalment, so it
              equals principal plus the finance charge. Together with the APR, these three numbers are what a Truth in
              Lending disclosure is built around.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the true APR and how far above the note rate it sits, which is the clearest single
              signal of how expensive the fees are. The three statistics beneath give your monthly payment, the finance
              charge, and the total of payments. The breakdown table itemises each fee so you can see which one is driving
              the spread, and net proceeds shows exactly how much of the loan you actually receive after the charges are
              applied.
            </p>
            <p>
              Use the APR as your primary comparison when shopping, then sanity-check with the finance charge and total of
              payments, because a shorter term inflates APR while possibly lowering total cost. Certain third-party fees
              may be excluded from a lender&apos;s APR calculation depending on loan type, so enter the charges your
              lender treats as finance charges for the closest match, and treat the result as a comparison tool rather
              than a substitute for the Loan Estimate.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annual-percentage-rate-apr-calculator" />
          <PopularCalculators exclude="/calculator/annual-percentage-rate-apr-calculator" />
        </div>
      </div>
    </>
  );
}
