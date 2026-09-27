"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Frequency = "daily" | "weekly" | "monthly";

const FREQ: Record<Frequency, { perMonth: number; label: string }> = {
  daily: { perMonth: 21, label: "Business days" },
  weekly: { perMonth: 4.333, label: "Weeks" },
  monthly: { perMonth: 1, label: "Months" },
};

interface McaInputs {
  advance: number;
  factorRate: number;
  termMonths: number;
  frequency: Frequency;
  adminFee: number;
}

const DEFAULTS: McaInputs = {
  advance: 50000,
  factorRate: 1.35,
  termMonths: 9,
  frequency: "daily",
  adminFee: 500,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

/** Solve the monthly rate for an advance repaid over n months at a level monthly payment. */
function solveMonthlyRate(advance: number, payment: number, n: number): number {
  if (advance <= 0 || payment <= 0 || n <= 0) return 0;
  let lo = 0;
  let hi = 5;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    const f = Math.pow(1 + mid, n);
    const pv = mid > 0 ? (payment * (f - 1)) / (mid * f) : payment * n;
    if (pv > advance) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface McaResult {
  totalRepayment: number;
  factorCost: number;
  totalCost: number;
  remittance: number;
  periods: number;
  equivalentAprPct: number;
  costPerHundred: number;
  valid: boolean;
  errorMsg: string;
}

function computeMca(i: McaInputs): McaResult {
  const invalid = i.advance <= 0 || i.factorRate < 1 || i.termMonths <= 0 || i.adminFee < 0;

  const totalRepayment = i.advance * i.factorRate + i.adminFee;
  const factorCost = i.advance * (i.factorRate - 1);
  const totalCost = totalRepayment - i.advance;
  const periods = Math.round(i.termMonths * FREQ[i.frequency].perMonth);
  const remittance = periods > 0 ? totalRepayment / periods : 0;
  const monthlyPayment = totalRepayment / i.termMonths;
  const equivalentAprPct = solveMonthlyRate(i.advance, monthlyPayment, Math.round(i.termMonths)) * 12 * 100;

  return {
    totalRepayment,
    factorCost,
    totalCost,
    remittance,
    periods,
    equivalentAprPct,
    costPerHundred: (totalCost / i.advance) * 100,
    valid: !invalid,
    errorMsg: invalid ? "Enter a positive advance, a factor rate of 1.0 or higher, a term above zero, and a non-negative fee." : "",
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

export default function MerchantCashAdvanceCostCalculator() {
  const [advance, setAdvance] = useState(String(DEFAULTS.advance));
  const [factorRate, setFactorRate] = useState(String(DEFAULTS.factorRate));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [frequency, setFrequency] = useState<Frequency>(DEFAULTS.frequency);
  const [adminFee, setAdminFee] = useState(String(DEFAULTS.adminFee));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): McaInputs => ({
    advance: parseFloat(advance) || 0,
    factorRate: parseFloat(factorRate) || 0,
    termMonths: parseFloat(termMonths) || 0,
    frequency,
    adminFee: parseFloat(adminFee) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<McaInputs>(() => DEFAULTS);
  const [results, setResults] = useState<McaResult>(() => computeMca(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeMca(inputs));
  };

  const reset = () => {
    setAdvance(String(DEFAULTS.advance));
    setFactorRate(String(DEFAULTS.factorRate));
    setTermMonths(String(DEFAULTS.termMonths));
    setFrequency(DEFAULTS.frequency);
    setAdminFee(String(DEFAULTS.adminFee));
    setCalcInputs(DEFAULTS);
    setResults(computeMca(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is a merchant cash advance priced?",
      answer:
        "A merchant cash advance is quoted with a factor rate rather than an interest rate. The factor is multiplied by the advance amount to give the total you repay, so a $50,000 advance at a factor of 1.35 means $67,500 repaid and a $17,500 cost. Because the cost is expressed as a multiple rather than a rate, it looks modest while the implied annual rate can be very high, especially over a short term.",
    },
    {
      question: "Why is the equivalent APR so high on an MCA?",
      answer:
        "Because the cost is charged on the full advance for the entire term, and the term is short. Expressed as a rate over just nine months, a factor of 1.35 on a fifty-thousand-dollar advance implies an annual percentage rate far above any conventional loan. The calculation treats the repayments as a loan of the advance repaid in equal monthly instalments and solves for the rate that makes their present value equal the advance, then annualises it.",
    },
    {
      question: "What is a holdback and how does it affect cost?",
      answer:
        "Repayment is usually collected as a percentage of daily card sales, called the holdback or retrieval rate, rather than as a fixed instalment. A higher holdback repays the advance faster and lowers the total cost only if the factor rate also falls; the factor itself is what sets the price. Slower sales simply stretch the term, and because the total owed is fixed, a longer term raises the implied annual rate even though the dollar cost does not change.",
    },
    {
      question: "Is a merchant cash advance cheaper than a business loan?",
      answer:
        "Almost never on an annualised basis. A bank loan or an asset-based facility will typically carry a single-digit or low-double-digit effective rate, while an MCA commonly implies triple-digit annual rates once the factor is converted. The MCA advantage is speed and access: it can be funded in days without the financial documentation a bank requires. The calculator reports the effective annual rate precisely so the premium you are paying for that speed is visible.",
    },
    {
      question: "Should I compare the factor rate or the APR?",
      answer:
        "Compare the APR, or the cost per hundred dollars advanced, because factor rates are not directly comparable across different terms. A factor of 1.2 over six months is far more expensive in annual terms than a factor of 1.2 over eighteen months, even though both multiply the advance by 1.2. Normalising to an annual rate is the only way to weigh an MCA against a term loan, a line of credit, or an invoice facility.",
    },
  ];

  const breakdownRows = [
    { label: "Advance Amount", amount: `$${fmt(calcInputs.advance, 0)}`, basis: "Principal advanced" },
    { label: "Factor Cost", amount: `$${fmt(results.factorCost, 0)}`, basis: `Factor ${fmt(calcInputs.factorRate, 2)}` },
    { label: "Administration Fee", amount: `$${fmt(calcInputs.adminFee, 0)}`, basis: "One-off charge" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Merchant Cash Advance Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Merchant Cash Advance Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Advance Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="advance"
                  label="Advance Amount"
                  value={advance}
                  onChange={setAdvance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Cash advanced to the business."
                />
                <CompactInput
                  id="factor"
                  label="Factor Rate"
                  value={factorRate}
                  onChange={setFactorRate}
                  onEnter={runCalculate}
                  step="0.01"
                  min="1"
                  tooltip="Multiplier applied to the advance to give the total repayment."
                />
              </div>
            </SubSection>

            <SubSection title="Repayment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="term"
                  label="Term"
                  value={termMonths}
                  onChange={setTermMonths}
                  onEnter={runCalculate}
                  suffix="months"
                  tooltip="Expected length of the repayment period."
                />
                <div className="flex flex-col">
                  <label htmlFor="freq" className="flex items-center text-sm font-semibold text-foreground mb-1">
                    Remittance
                  </label>
                  <div className="relative h-9">
                    <select
                      id="freq"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as Frequency)}
                      className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                    >
                      <option value="daily">Daily (card sales)</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
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
                  <SubSection title="Fees">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="admin"
                        label="Administration Fee"
                        value={adminFee}
                        onChange={setAdminFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="One-off origination or underwriting charge."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          Repay: ${fmt(results.totalRepayment, 0)}
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Equivalent APR</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.equivalentAprPct, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Implied by a factor of {fmt(calcInputs.factorRate, 2)} over {fmt(calcInputs.termMonths, 0)} months
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Repaid</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalRepayment, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalCost, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Remittance</span>
                <span className="font-extrabold text-foreground">${fmt(results.remittance, 0)}</span>
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
                      <td className="p-2.5 text-right text-foreground">{row.amount}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.basis}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Repayment</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalRepayment, 0)}</td>
                    <td className="p-2.5 pr-3 text-foreground">Cost: ${fmt(results.totalCost, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Advance Amount</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.advance, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Factor Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.factorRate, 3)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Factor Cost</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.factorCost, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Administration Fee</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.adminFee, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Repayment Periods</span>
                  <span className="text-base font-bold text-foreground">
                    {results.periods} ({FREQ[calcInputs.frequency].label})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per $100 Advanced</span>
                  <span className="text-base font-bold text-primary">${fmt(results.costPerHundred)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Merchant Cash Advance Cost Calculator?</h2>
            <p>
              A merchant cash advance cost calculator converts the factor pricing that MCA providers quote into the
              effective annual rate a business owner can actually compare against other financing. A merchant cash advance
              is not a loan: rather than charging interest on a declining balance, the provider multiplies the advance by a
              factor rate to produce a fixed total repayment, then collects that total as a percentage of daily card sales.
              The absence of an interest rate makes the price hard to read, and this calculator supplies the missing
              comparison.
            </p>
            <p>
              The distinction matters because factor rates flatter short-term financing. A factor of 1.35 sounds like
              thirty-five percent, but it is thirty-five percent of the advance charged over the entire term, and when
              that term is measured in months the implied annual rate is far higher than any bank facility. Turning the
              factor into an annualised rate is the only way to judge whether the speed and flexibility of an MCA justify
              its premium.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The total repayment is the advance multiplied by the factor rate, plus any administration fee. The cost is
              that total minus the advance itself, which is split in the breakdown into the factor cost and the one-off
              fee. The remittance is the total repayment divided by the number of collection periods, calculated from the
              term and the frequency you select, whether that is business days for a card-sales holdback, weeks, or
              months.
            </p>
            <p>
              To express the price as a rate, the calculator treats the transaction as a loan of the advance repaid in
              equal monthly instalments totalling the full repayment, and solves by bisection for the monthly rate at
              which the present value of those instalments equals the advance. Annualising that rate by multiplying by
              twelve produces the equivalent APR, which is the figure to hold against the rate on any alternative
              facility.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the equivalent APR, which is almost always dramatic, with the total repaid, total cost
              and remittance figures beside it. The breakdown table separates the factor cost from the administration fee
              so you can see how much of the price is the factor itself, and the summary adds the number of collection
              periods, the cost per hundred dollars advanced, and the factor rate in full precision.
            </p>
            <p>
              A few cautions apply. Because repayment is usually collected as a percentage of sales, the actual term
              depends on your card volume; slower sales stretch the term and raise the implied annual rate without
              changing the dollar cost, while faster sales shorten it. Some agreements also include a prepayment penalty or
              a minimum repayment requirement, and stacking multiple advances dramatically increases both the cost and the
              risk. Use the effective APR here to compare the MCA against a term loan, a business line of credit, or an
              invoice facility before committing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/merchant-cash-advance-cost-calculator" />
          <PopularCalculators exclude="/calculator/merchant-cash-advance-cost-calculator" />
        </div>
      </div>
    </>
  );
}
