"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface McaInputs {
  advance: number;
  factorRate: number;
  holdPercent: number;
  monthlySales: number;
  businessDays: number;
}

const DEFAULTS: McaInputs = {
  advance: 50000,
  factorRate: 1.35,
  holdPercent: 12,
  monthlySales: 120000,
  businessDays: 22,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

interface McaResult {
  totalRepayment: number;
  costOfCapital: number;
  costPercent: number;
  dailySales: number;
  dailyRemittance: number;
  daysToRepay: number;
  monthsToRepay: number;
  effectiveApr: number;
  monthlyRemittance: number;
  valid: boolean;
  errorMsg: string;
}

function computeMca(i: McaInputs): McaResult {
  const invalid =
    i.advance <= 0 || i.factorRate <= 0 || i.holdPercent < 0 || i.monthlySales <= 0 || i.businessDays <= 0;

  const totalRepayment = i.advance * i.factorRate;
  const costOfCapital = totalRepayment - i.advance;
  const costPercent = (costOfCapital / i.advance) * 100;

  const dailySales = i.monthlySales / i.businessDays;
  const dailyRemittance = (dailySales * i.holdPercent) / 100;
  const daysToRepay = dailyRemittance > 0 ? totalRepayment / dailyRemittance : Infinity;
  const monthsToRepay = Number.isFinite(daysToRepay) ? daysToRepay / i.businessDays : Infinity;
  const monthlyRemittance = dailyRemittance * i.businessDays;

  // Equivalent annual rate: the discount rate that turns the single repayment
  // obligation into the advance received over the remittance period.
  let effectiveApr = 0;
  if (Number.isFinite(monthsToRepay) && monthsToRepay > 0 && totalRepayment > 0) {
    const monthlyRate = Math.pow(totalRepayment / i.advance, 1 / monthsToRepay) - 1;
    effectiveApr = monthlyRate * 12 * 100;
  }

  return {
    totalRepayment,
    costOfCapital,
    costPercent,
    dailySales,
    dailyRemittance,
    daysToRepay,
    monthsToRepay,
    effectiveApr,
    monthlyRemittance,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive advance, a factor rate of at least one, and a positive sales figure."
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

export default function MerchantCashAdvanceCalculator() {
  const [advance, setAdvance] = useState(String(DEFAULTS.advance));
  const [factorRate, setFactorRate] = useState(String(DEFAULTS.factorRate));
  const [holdPercent, setHoldPercent] = useState(String(DEFAULTS.holdPercent));
  const [monthlySales, setMonthlySales] = useState(String(DEFAULTS.monthlySales));
  const [businessDays, setBusinessDays] = useState(String(DEFAULTS.businessDays));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): McaInputs => ({
    advance: parseFloat(advance) || 0,
    factorRate: parseFloat(factorRate) || 0,
    holdPercent: parseFloat(holdPercent) || 0,
    monthlySales: parseFloat(monthlySales) || 0,
    businessDays: parseFloat(businessDays) || 22,
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
    setHoldPercent(String(DEFAULTS.holdPercent));
    setMonthlySales(String(DEFAULTS.monthlySales));
    setBusinessDays(String(DEFAULTS.businessDays));
    setCalcInputs(DEFAULTS);
    setResults(computeMca(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a merchant cash advance?",
      answer:
        "A merchant cash advance pays a business a lump sum in exchange for a share of future card sales. Rather than charging interest, the provider applies a factor rate to the advance, so a 1.35 factor on fifty thousand dollars means sixty-seven thousand five hundred dollars is collected. Repayment happens automatically as a percentage of daily receipts.",
    },
    {
      question: "How is the factor rate different from an interest rate?",
      answer:
        "The factor rate is a simple multiplier applied once to the amount advanced, regardless of how long repayment takes. Interest compounds over time instead. Because a factor rate sounds small but is charged over a short period, converting it into an annual equivalent is the only fair way to compare it with a bank loan or a line of credit.",
    },
    {
      question: "How does the hold percentage affect the cost?",
      answer:
        "The hold percentage does not change the total amount repaid, but it controls how quickly the balance is collected and therefore how long you are exposed. A higher hold clears the advance sooner at the cost of tighter daily cash flow, while a lower hold stretches the repayment and keeps more cash in the business each day.",
    },
    {
      question: "Why is the effective annual rate so high?",
      answer:
        "Because the cost is compressed into months rather than years. A thirty-five percent factor premium collected over roughly eight months annualises to a rate well into triple digits. That does not make the advance inherently wrong for a business with a fast, profitable use for the cash, but it does mean the money must work extremely hard to justify itself.",
    },
    {
      question: "What are the risks of an advance?",
      answer:
        "The obligation is usually secured by future receivables, so a slow sales month does not reduce what is owed and can strain cash flow precisely when the business can least afford it. Stacking multiple advances compounds the problem. Compare the total dollar cost against a term loan, an equipment loan or a line of credit before committing.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Merchant Cash Advance Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Merchant Cash Advance Calculator
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
                  min="0"
                  tooltip="Cash advanced to the business today."
                />
                <CompactInput
                  id="factor"
                  label="Factor Rate"
                  value={factorRate}
                  onChange={setFactorRate}
                  onEnter={runCalculate}
                  min="1"
                  step="0.01"
                  tooltip="Multiplier applied to the advance, commonly between 1.2 and 1.5."
                />
              </div>
            </SubSection>

            <SubSection title="Sales & Remittance">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="sales"
                  label="Monthly Card Sales"
                  value={monthlySales}
                  onChange={setMonthlySales}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total card and digital receipts per month."
                />
                <CompactInput
                  id="hold"
                  label="Hold Percentage"
                  value={holdPercent}
                  onChange={setHoldPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.5"
                  tooltip="Share of each day's sales withheld to repay the advance."
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
                  <SubSection title="Operating Assumptions">
                    <CompactInput
                      id="days"
                      label="Business Days per Month"
                      value={businessDays}
                      onChange={setBusinessDays}
                      onEnter={runCalculate}
                      min="1"
                      step="1"
                      tooltip="Used to convert daily sales and hold amounts into monthly figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Repayment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.totalRepayment)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(calcInputs.advance)} advanced at a {fmt(calcInputs.factorRate, 2)} factor &middot;{" "}
                {money(results.costOfCapital)} cost
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost of Capital</span>
                <span className="font-extrabold text-foreground">{fmt(results.costPercent, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective APR</span>
                <span className="font-extrabold text-destructive">{fmt(results.effectiveApr, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Time to Repay</span>
                <span className="font-extrabold text-foreground">{fmt(results.monthsToRepay, 1)} mo</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 text-right w-[140px]">Value</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Advance Received</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.advance)}</td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">Cash today</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Factor Rate</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.factorRate, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">Applied once</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total Repayment</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalRepayment)}</td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">Advance x factor</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Cost of Capital</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.costOfCapital)}</td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">
                      {fmt(results.costPercent, 1)}% of advance
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Daily Remittance</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.dailyRemittance)}</td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">
                      {fmt(calcInputs.holdPercent, 1)}% of {money(results.dailySales)} daily sales
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Monthly Remittance</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.monthlyRemittance)}</td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">
                      {Math.round(calcInputs.businessDays)} business days
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Business Days to Clear</td>
                    <td className="p-2.5 text-right text-foreground">
                      {Number.isFinite(results.daysToRepay) ? Math.ceil(results.daysToRepay) : "—"}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">
                      {fmt(results.monthsToRepay, 1)} months
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Effective Annual Rate</td>
                    <td className="p-2.5 text-right text-destructive">{fmt(results.effectiveApr, 1)}%</td>
                    <td className="p-2.5 pr-3 text-right text-xs text-muted-foreground">Annualised cost</td>
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
                  <span className="text-base font-bold text-foreground">{money(calcInputs.advance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Repayment</span>
                  <span className="text-base font-bold text-primary">{money(results.totalRepayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost of Capital</span>
                  <span className="text-base font-bold text-foreground">{money(results.costOfCapital)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost as % of Advance</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.costPercent, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Card Sales</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.monthlySales)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Remittance</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyRemittance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months to Clear</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.monthsToRepay, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Annual Rate</span>
                  <span className="text-base font-bold text-destructive">{fmt(results.effectiveApr, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Merchant Cash Advance Calculator?</h2>
            <p>
              A merchant cash advance calculator converts the factor rate on a cash advance into the dollars actually
              repaid, the pace of collection and an annualised cost that can be compared with any other form of business
              finance. Advances are priced with a multiplier rather than an interest rate, which makes the headline number
              look modest while the true cost can be dramatically higher than a bank facility.
            </p>
            <p>
              The tool matters because the pricing structure hides the time dimension. A factor of 1.35 sounds like a
              thirty-five percent charge, but when that premium is collected over eight or nine months of daily remittances,
              the annualised equivalent runs into triple digits. Seeing that figure alongside the daily hold is the clearest
              way to judge whether the money is worth its cost.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Cost Is Calculated</h2>
            <p>
              Total repayment is the advance multiplied by the factor rate, so the cost of capital is the difference between
              the two and the percentage cost is that difference divided by the advance. Daily sales come from monthly sales
              split across the business days in the month, and the daily remittance is the hold percentage applied to those
              sales. Dividing total repayment by the daily remittance gives the number of business days needed to clear the
              balance.
            </p>
            <p>
              The effective annual rate is derived by finding the monthly discount rate that makes the single repayment
              obligation equivalent to the advance received over the remittance period, and then multiplying by twelve. That
              conversion is what makes the advance comparable with a term loan, an equipment facility or a credit line, all
              of which quote cost per year rather than cost per contract.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports total repayment with the advance, factor rate and dollar cost beneath it. The three
              statistics beside it give the percentage cost of capital, the effective annual rate and the time to clear the
              balance. The breakdown table lists the advance, factor, total repayment, cost, daily and monthly remittances,
              business days to clear and the annualised rate, each with its basis so the mechanics are visible.
            </p>
            <p>
              Summary Statistics collects the same figures in a single block for easy comparison against competing offers.
              Two cautions follow. A higher hold percentage does not raise the total cost, but it drains daily cash flow and
              can strain operations precisely when sales soften, since the repayment obligation does not fall with revenue.
              And stacking a second advance on top of the first multiplies the effective cost, because both are collected
              from the same receipts. Compare the annualised rate against any alternative before signing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/merchant-cash-advance-calculator" />
          <PopularCalculators exclude="/calculator/merchant-cash-advance-calculator" />
        </div>
      </div>
    </>
  );
}
