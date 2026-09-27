"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface HelocInputs {
  lineAmount: number;
  drawn: number;
  apr: number;
  drawYears: number;
  repayYears: number;
  homeValue: number;
  extraDuringDraw: number;
}

const DEFAULTS: HelocInputs = {
  lineAmount: 100000,
  drawn: 50000,
  apr: 8.5,
  drawYears: 10,
  repayYears: 20,
  homeValue: 500000,
  extraDuringDraw: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

interface HelocResult {
  interestOnlyPayment: number;
  repayPayment: number;
  drawMonths: number;
  repayMonths: number;
  drawInterest: number;
  repayInterest: number;
  totalInterest: number;
  totalCost: number;
  availableCredit: number;
  cltv: number;
  requiredEquityOk: boolean;
  balanceAtRepayment: number;
  valid: boolean;
  errorMsg: string;
}

function computeHeloc(i: HelocInputs): HelocResult {
  const invalid =
    i.lineAmount <= 0 ||
    i.drawn <= 0 ||
    i.drawn > i.lineAmount * 1.0001 ||
    i.apr < 0 ||
    i.drawYears <= 0 ||
    i.repayYears <= 0;

  const monthlyRate = i.apr / 100 / 12;
  const interestOnlyPayment = i.drawn * monthlyRate;
  const drawMonths = Math.round(i.drawYears * 12);
  const repayMonths = Math.round(i.repayYears * 12);
  const drawInterest = interestOnlyPayment * drawMonths;

  // Interest-only draw keeps the balance flat; repayment then amortises the drawn amount.
  const repayPayment = paymentFor(i.drawn, monthlyRate, repayMonths);
  const repayInterest = Math.max(0, repayPayment * repayMonths - i.drawn);
  const totalInterest = drawInterest + repayInterest;
  const cltv = i.homeValue > 0 ? (i.drawn / i.homeValue) * 100 : 0;

  return {
    interestOnlyPayment,
    repayPayment,
    drawMonths,
    repayMonths,
    drawInterest,
    repayInterest,
    totalInterest,
    totalCost: i.drawn + totalInterest,
    availableCredit: Math.max(0, i.lineAmount - i.drawn),
    cltv,
    requiredEquityOk: cltv <= 80,
    balanceAtRepayment: i.drawn,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive line and draw amount (draw cannot exceed the line), a non-negative rate, and draw/repayment periods above zero."
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

export default function HelocHomeEquityLineOfCreditPaymentCalculator() {
  const [lineAmount, setLineAmount] = useState(String(DEFAULTS.lineAmount));
  const [drawn, setDrawn] = useState(String(DEFAULTS.drawn));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [drawYears, setDrawYears] = useState(String(DEFAULTS.drawYears));
  const [repayYears, setRepayYears] = useState(String(DEFAULTS.repayYears));
  const [homeValue, setHomeValue] = useState(String(DEFAULTS.homeValue));
  const [extraDuringDraw, setExtraDuringDraw] = useState(String(DEFAULTS.extraDuringDraw));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): HelocInputs => ({
    lineAmount: parseFloat(lineAmount) || 0,
    drawn: parseFloat(drawn) || 0,
    apr: parseFloat(apr) || 0,
    drawYears: parseFloat(drawYears) || 0,
    repayYears: parseFloat(repayYears) || 0,
    homeValue: parseFloat(homeValue) || 0,
    extraDuringDraw: parseFloat(extraDuringDraw) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<HelocInputs>(() => DEFAULTS);
  const [results, setResults] = useState<HelocResult>(() => computeHeloc(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeHeloc(inputs));
  };

  const reset = () => {
    setLineAmount(String(DEFAULTS.lineAmount));
    setDrawn(String(DEFAULTS.drawn));
    setApr(String(DEFAULTS.apr));
    setDrawYears(String(DEFAULTS.drawYears));
    setRepayYears(String(DEFAULTS.repayYears));
    setHomeValue(String(DEFAULTS.homeValue));
    setExtraDuringDraw(String(DEFAULTS.extraDuringDraw));
    setCalcInputs(DEFAULTS);
    setResults(computeHeloc(DEFAULTS));
  };

  const faqs = [
    {
      question: "How do HELOC payments work?",
      answer:
        "A home equity line of credit runs in two phases. During the draw period, usually five to ten years, you can borrow up to your limit and the minimum payment is normally interest only, so the balance does not fall. When the draw period ends the line enters repayment, typically ten to twenty years, and the outstanding balance amortises into a fixed principal-and-interest payment sized to clear the debt by the end of that term.",
    },
    {
      question: "Why does my payment jump when the draw period ends?",
      answer:
        "During the draw period you pay only interest, so a $50,000 balance at 8.5% costs about $354 a month and never reduces. In repayment the same balance must clear within the repayment term, so the payment includes principal and the figure can multiply several times over. Planning for that step-up in advance, by paying extra principal during the draw period, is the single most effective way to avoid payment shock.",
    },
    {
      question: "What interest rate should I enter?",
      answer:
        "HELOC rates are variable and are quoted as a margin over an index such as the US prime rate, so the rate changes whenever the index moves. Enter the current rate your lender is charging, or a conservative estimate of where the rate could sit across the life of the line. Because the drawn balance reprices with the index, the repayment payment you see here will change too if rates move.",
    },
    {
      question: "Is HELOC interest tax deductible?",
      answer:
        "Interest is generally deductible only when the funds are used to buy, build or substantially improve the home that secures the line, and only for taxpayers who itemise. Using the money for debt consolidation, a car, or day-to-day spending makes the interest personal and non-deductible. Confirm your specific use with a tax professional, and note the SALT and standard-deduction limits can reduce or eliminate the benefit.",
    },
    {
      question: "How much can I borrow against my home?",
      answer:
        "Lenders usually cap the combined loan-to-value ratio, the total of all loans against the home divided by its value, at 80% to 85% for a HELOC. This calculator reports the CLTV of your drawn balance so you can see whether your line sits inside that guideline; if it exceeds 80% you will typically need more equity, a lower drawn amount, or a second-lien lender that accepts higher combined LTV.",
    },
  ];

  const breakdownRows = [
    {
      label: "Draw period (interest-only)",
      payment: `$${fmt(results.interestOnlyPayment)}`,
      periods: `${results.drawMonths} mo`,
      interest: `$${fmt(results.drawInterest, 0)}`,
    },
    {
      label: "Repayment period (amortising)",
      payment: `$${fmt(results.repayPayment)}`,
      periods: `${results.repayMonths} mo`,
      interest: `$${fmt(results.repayInterest, 0)}`,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "HELOC Payment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          HELOC (Home Equity Line of Credit) Payment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Credit Line">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="line-amount"
                  label="Credit Line Limit"
                  value={lineAmount}
                  onChange={setLineAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Maximum amount the lender will extend."
                />
                <CompactInput
                  id="drawn"
                  label="Amount Drawn"
                  value={drawn}
                  onChange={setDrawn}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance currently outstanding on the line."
                />
              </div>
            </SubSection>

            <SubSection title="Rate & Periods">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="apr"
                  label="Interest Rate"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="Current variable rate (index + margin)."
                />
                <CompactInput
                  id="draw-years"
                  label="Draw Period"
                  value={drawYears}
                  onChange={setDrawYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Interest-only draw period."
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
                  <SubSection title="Repayment & Equity">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="repay-years"
                        label="Repayment Period"
                        value={repayYears}
                        onChange={setRepayYears}
                        onEnter={runCalculate}
                        suffix="yrs"
                        tooltip="Years over which the balance amortises after the draw period."
                      />
                      <CompactInput
                        id="home-value"
                        label="Home Value"
                        value={homeValue}
                        onChange={setHomeValue}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Current market value, used for the combined loan-to-value ratio."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Extra Principal">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="extra-draw"
                        label="Extra Monthly (draw)"
                        value={extraDuringDraw}
                        onChange={setExtraDuringDraw}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Extra principal paid each month during the draw period, reducing the balance at repayment."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          CLTV: {fmt(results.cltv, 1)}%
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

            {results.valid && !results.requiredEquityOk && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-700 mb-1 uppercase tracking-wider">High combined LTV</div>
                <div className="text-sm font-medium text-foreground">
                  CLTV is {fmt(results.cltv, 1)}%. Most lenders cap a HELOC at 80% combined loan-to-value, so you may need
                  more equity or a smaller draw.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Draw-Period Payment (Interest-Only)
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.interestOnlyPayment)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Then ${fmt(results.repayPayment)} / mo for {results.repayMonths} months in repayment
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Repayment Pmt</span>
                <span className="font-extrabold text-foreground">${fmt(results.repayPayment, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalInterest, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CLTV</span>
                <span className="font-extrabold text-foreground">{fmt(results.cltv, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Phase</th>
                    <th className="p-2.5 text-right w-[110px]">Payment</th>
                    <th className="p-2.5 text-right w-[90px]">Months</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.payment}</td>
                      <td className="p-2.5 text-right text-foreground">{row.periods}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.interest}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total over life of line</td>
                    <td className="p-2.5 text-right text-muted-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">
                      {results.drawMonths + results.repayMonths} mo
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">${fmt(results.totalInterest, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Credit Line Limit</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.lineAmount, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Available Credit</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.availableCredit, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Draw Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.drawInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Repayment Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.repayInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Cost</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Repayment Payment</span>
                  <span className="text-base font-bold text-primary">${fmt(results.repayPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a HELOC Payment Calculator?</h2>
            <p>
              A home equity line of credit, or HELOC, lets you borrow against the equity in your home as a revolving
              line rather than a single lump sum. You are approved for a limit, you draw what you need as you need it,
              and you pay interest only on the outstanding balance. Structurally the line has two chapters: an
              interest-only draw period while you spend, and an amortising repayment period during which the balance
              must be cleared. This calculator models both phases so you can see the payment you will face now and the
              much larger one waiting at the end of the draw period.
            </p>
            <p>
              HELOC rates are variable, quoted as a margin over an index such as the US prime rate, so the rate you pay
              rises and falls with the market. The calculator takes the rate you are being charged and holds it flat so
              the numbers are readable, but the repayment payment should be treated as a rate-sensitive estimate rather
              than a fixed commitment.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              During the draw period the balance stays level because the payment covers only interest, so the monthly
              figure is simply the drawn amount multiplied by the monthly rate, which is the annual rate divided by
              twelve. Total draw-period interest is that payment multiplied by the number of months in the draw period.
              When repayment begins, the same balance is amortised into a fixed payment using
              PMT = P x r / (1 - (1 + r)^-n), where n is the number of months in the repayment term. Repayment interest
              is the sum of all those payments minus the principal, and total cost is the drawn balance plus both
              interest totals.
            </p>
            <p>
              The calculator also divides your drawn balance by the home value to report the combined loan-to-value
              ratio, the figure lenders use to decide how large a line they will allow. If the CLTV exceeds the typical
              80% guideline the result panel flags it, because exceeding that threshold usually means a smaller draw, a
              larger home value, or a specialist second-lien lender.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the interest-only payment you make during the draw period and, directly beneath it,
              the amortising payment that takes over when the draw period ends. The gap between those two numbers is the
              payment shock that catches many borrowers out, and the reason financial planners advise paying principal
              during the draw period even when only interest is required. The breakdown table separates the two phases
              so the interest accumulated in each is visible.
            </p>
            <p>
              Summary Statistics adds the available credit remaining on the line, the interest accumulated in each phase,
              the total cost of the borrowing, and the CLTV of your drawn balance. A practical strategy is to size the
              line well below your limit, pay extra principal during the draw years, and confirm with the lender whether
              a fixed-rate conversion or rate-lock option is available before repayment starts, since a variable rate
              that has drifted upward can make the repayment payment substantially higher than the figure modelled here.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heloc-home-equity-line-of-credit-payment-calculator" />
          <PopularCalculators exclude="/calculator/heloc-home-equity-line-of-credit-payment-calculator" />
        </div>
      </div>
    </>
  );
}
