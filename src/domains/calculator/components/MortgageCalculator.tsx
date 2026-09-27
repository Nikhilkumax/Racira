"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";
import { calculateMortgage, type MortgageResults } from "./mortgageLogic";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DEFAULT_START_YEAR = "2026";
const DEFAULT_START_MONTH = "Jan";

interface MortgageInputs {
  homePrice: string;
  dpMode: "percent" | "amount";
  downPayment: string;
  downPaymentAmt: string;
  interestRate: string;
  loanTerm: string;
  startMonth: string;
  startYear: string;
  propertyTax: string;
  homeInsurance: string;
  pmi: string;
  hoaFee: string;
  otherCosts: string;
  extraMonthly: string;
  oneTimeExtra: string;
  annualExtra: string;
  paymentFreq: "monthly" | "biweekly";
}

const DEFAULTS: MortgageInputs = {
  homePrice: "400000",
  dpMode: "percent",
  downPayment: "20",
  downPaymentAmt: "80000",
  interestRate: "6.5",
  loanTerm: "30",
  startMonth: DEFAULT_START_MONTH,
  startYear: DEFAULT_START_YEAR,
  propertyTax: "3600",
  homeInsurance: "1200",
  pmi: "150",
  hoaFee: "0",
  otherCosts: "0",
  extraMonthly: "0",
  oneTimeExtra: "0",
  annualExtra: "0",
  paymentFreq: "monthly",
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => `$${fmt(Math.round(v))}`;

function compute(i: MortgageInputs): MortgageResults {
  return calculateMortgage({
    homePriceVal: num(i.homePrice),
    dpModeVal: i.dpMode,
    dpPctVal: num(i.downPayment),
    dpAmtVal: num(i.downPaymentAmt),
    interestRateVal: num(i.interestRate),
    loanTermVal: num(i.loanTerm),
    startDateVal: `${i.startYear}-${i.startMonth}`,
    extraMonthlyVal: num(i.extraMonthly),
    oneTimeExtraVal: num(i.oneTimeExtra),
    annualExtraVal: num(i.annualExtra),
    propertyTaxVal: num(i.propertyTax),
    homeInsuranceVal: num(i.homeInsurance),
    pmiVal: num(i.pmi),
    hoaFeeVal: num(i.hoaFee),
    otherCostsVal: num(i.otherCosts),
    paymentFreqVal: i.paymentFreq,
  });
}

function addMonths(startYearStr: string, startMonthStr: string, months: number): string {
  const startIdx = Math.max(0, MONTHS.indexOf(startMonthStr));
  const total = startIdx + Math.max(0, months);
  const baseYear = parseInt(startYearStr, 10) || parseInt(DEFAULT_START_YEAR, 10) || 2026;
  const y = baseYear + Math.floor(total / 12);
  return `${MONTHS[total % 12]} ${y}`;
}

interface TermRow {
  term: string;
  monthly: number;
  totalInterest: number;
  totalPaid: number;
  months: number;
}

function termScenarios(loan: number, ratePct: number, years: string[]): TermRow[] {
  if (loan <= 0) return [];
  return years.map((label) => {
    const y = parseFloat(label) || 30;
    const r = ratePct / 100 / 12;
    const n = y * 12;
    const monthly = r > 0 ? (loan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : loan / n;
    return {
      term: `${y} years`,
      monthly,
      totalInterest: monthly * n - loan,
      totalPaid: monthly * n,
      months: n,
    };
  });
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, prefix, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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

interface CompactSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  hint?: string;
}

const CompactSelect = ({ id, label, value, options, onChange, hint }: CompactSelectProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 pr-8 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="h-3.5 w-3.5 absolute right-3 text-muted-foreground pointer-events-none" />
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

export default function MortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");

  const [calcInputs, setCalcInputs] = useState<MortgageInputs>(DEFAULTS);
  const [results, setResults] = useState<MortgageResults>(() => compute(DEFAULTS));

  const set = (key: keyof MortgageInputs) => (v: string) => setInputs((prev) => ({ ...prev, [key]: v }));

  const setHomePrice = (v: string) => {
    const hp = num(v);
    setInputs((prev) => {
      if (prev.dpMode === "percent") {
        return { ...prev, homePrice: v, downPaymentAmt: hp > 0 ? String(Math.round((hp * num(prev.downPayment)) / 100)) : "0" };
      }
      return { ...prev, homePrice: v, downPayment: hp > 0 ? ((num(prev.downPaymentAmt) / hp) * 100).toFixed(1) : "0" };
    });
  };

  const setDownPayment = (v: string) => {
    const hp = num(inputs.homePrice);
    setInputs((prev) =>
      prev.dpMode === "percent"
        ? { ...prev, downPayment: v, downPaymentAmt: hp > 0 ? String(Math.round((hp * num(v)) / 100)) : "0" }
        : { ...prev, downPaymentAmt: v, downPayment: hp > 0 ? ((num(v) / hp) * 100).toFixed(1) : "0" }
    );
  };

  const setDpMode = (mode: "percent" | "amount") => {
    const hp = num(inputs.homePrice);
    setInputs((prev) =>
      mode === "percent"
        ? { ...prev, dpMode: mode, downPayment: hp > 0 ? ((num(prev.downPaymentAmt) / hp) * 100).toFixed(1) : "0" }
        : { ...prev, dpMode: mode, downPaymentAmt: hp > 0 ? String(Math.round((hp * num(prev.downPayment)) / 100)) : "0" }
    );
  };

  const runCalculate = () => {
    setCalcInputs(inputs);
    setResults(compute(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setCalcInputs(DEFAULTS);
    setResults(compute(DEFAULTS));
    setViewMode("yearly");
  };

  const d = (() => {
    const price = num(calcInputs.homePrice);
    const loan = results.loanAmount;
    const ltv = price > 0 ? (loan / price) * 100 : 0;
    const taxMonthly = num(calcInputs.propertyTax) / 12;
    const insMonthly = num(calcInputs.homeInsurance) / 12;
    const pmiMonthly = num(calcInputs.pmi);
    const hoaMonthly = num(calcInputs.hoaFee);
    const otherMonthly = num(calcInputs.otherCosts);
    const perYear = calcInputs.paymentFreq === "biweekly" ? 26 : 12;
    const pmiIdx = price > 0 ? results.monthlyRows.findIndex((r) => r.balance <= price * 0.8) : -1;
    const pmiDropLabel =
      pmiIdx >= 0 ? addMonths(calcInputs.startYear, calcInputs.startMonth, Math.ceil(((pmiIdx + 1) * 12) / perYear)) : "";
    const totalMonthly =
      results.monthlyPI + taxMonthly + insMonthly + (ltv > 80 ? pmiMonthly : 0) + hoaMonthly + otherMonthly;
    const downPayment =
      calcInputs.dpMode === "percent" ? (price * num(calcInputs.downPayment)) / 100 : num(calcInputs.downPaymentAmt);
    const monthsToPayoff = Math.ceil((results.monthlyRows.length * 12) / perYear);
    const amortRows = viewMode === "yearly" ? results.yearlyRows : results.monthlyRows.slice(0, 60);
    const scenarios = termScenarios(loan, num(calcInputs.interestRate), ["15", "20", "30"]);
    return {
      price,
      loan,
      ltv,
      taxMonthly,
      insMonthly,
      pmiMonthly,
      hoaMonthly,
      otherMonthly,
      perYear,
      pmiDropLabel,
      totalMonthly,
      downPayment,
      monthsToPayoff,
      amortRows,
      scenarios,
    };
  })();

  const monthlyBreakdown = [
    { label: "Principal & interest", value: results.monthlyPI },
    { label: "Property tax", value: d.taxMonthly },
    { label: "Home insurance", value: d.insMonthly },
    { label: "PMI (while LTV above 80%)", value: d.ltv > 80 ? d.pmiMonthly : 0 },
    { label: "HOA / condo fee", value: d.hoaMonthly },
    { label: "Other monthly costs", value: d.otherMonthly },
  ];

  const faqs = [
    {
      question: "How is the monthly mortgage payment calculated?",
      answer:
        "The principal and interest part comes from the standard amortisation formula, which converts the loan amount, the interest rate and the number of payments into one level payment. Property tax, homeowners insurance, PMI, HOA dues and any extra monthly costs you enter are then added on top to give the total monthly outlay, which is the figure lenders use when checking how much of your income goes to housing.",
    },
    {
      question: "How much of my payment goes to interest at the start?",
      answer:
        "On a long loan the early payments are mostly interest. Interest is charged on the outstanding balance, so with a large balance the interest charge is large and only a small slice of the payment reduces the debt. As the balance falls, interest takes a smaller share and principal accelerates. The amortisation table shows this shift year by year.",
    },
    {
      question: "When does PMI get cancelled?",
      answer:
        "Private mortgage insurance is normally required while the loan-to-value ratio is above 80 percent and is usually cancelled automatically once the balance falls to that level, assuming the value has not dropped. The calculator tracks the balance payment by payment and reports the first month at which the ratio reaches 80 percent, so you can see how much quicker extra payments would remove it.",
    },
    {
      question: "Do extra payments really save interest?",
      answer:
        "Yes, dramatically. Every extra dollar goes straight against the principal, which lowers the balance and therefore every future interest charge. The results show both the interest saved and the time removed from the loan compared with the same mortgage paid on schedule, and a short experiment with the extra payment field is usually the most persuasive part of the whole report.",
    },
    {
      question: "What does the term comparison table show?",
      answer:
        "It prices the same loan over 15, 20 and 30 years at the interest rate you entered. The shorter terms carry a higher monthly payment but a far smaller total interest bill, which makes the trade-off between monthly cash flow and lifetime cost explicit rather than a matter of guesswork.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Mortgage Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="flex flex-col gap-3">
                <CompactInput
                  id="home-price"
                  label="Home Price"
                  value={inputs.homePrice}
                  onChange={setHomePrice}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                />
                <CompactSelect
                  id="dp-mode"
                  label="Down Payment Entered As"
                  value={inputs.dpMode}
                  onChange={(v) => setDpMode(v as "percent" | "amount")}
                  options={[
                    { value: "percent", label: "Percentage of price" },
                    { value: "amount", label: "Dollar amount" },
                  ]}
                />
                {inputs.dpMode === "percent" ? (
                  <CompactInput
                    id="down-payment"
                    label="Down Payment"
                    value={inputs.downPayment}
                    onChange={setDownPayment}
                    onEnter={runCalculate}
                    min="0"
                    suffix="%"
                    hint={`Equals ${money(num(inputs.downPaymentAmt))} down`}
                  />
                ) : (
                  <CompactInput
                    id="down-payment-amt"
                    label="Down Payment"
                    value={inputs.downPaymentAmt}
                    onChange={setDownPayment}
                    onEnter={runCalculate}
                    min="0"
                    prefix="$"
                    hint={`Equals ${fmt(num(inputs.downPayment), 1)}% of the price`}
                  />
                )}
                <CompactInput
                  id="interest-rate"
                  label="Interest Rate"
                  value={inputs.interestRate}
                  onChange={set("interestRate")}
                  onEnter={runCalculate}
                  min="0"
                  suffix="%"
                  tooltip="Your quoted annual rate. Enter 6.5 for six and a half percent."
                />
                <CompactInput
                  id="loan-term"
                  label="Loan Term"
                  value={inputs.loanTerm}
                  onChange={set("loanTerm")}
                  onEnter={runCalculate}
                  min="0"
                  suffix="years"
                />
                <div className="grid grid-cols-2 gap-3">
                  <CompactSelect
                    id="start-month"
                    label="First Payment Month"
                    value={inputs.startMonth}
                    onChange={set("startMonth")}
                    options={MONTHS.map((m) => ({ value: m, label: m }))}
                  />
                  <CompactInput
                    id="start-year"
                    label="Year"
                    value={inputs.startYear}
                    onChange={set("startYear")}
                    onEnter={runCalculate}
                    min="1900"
                  />
                </div>
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Taxes & Insurance (Yearly)">
                    <div className="flex flex-col gap-3">
                      <CompactInput
                        id="property-tax"
                        label="Property Tax"
                        value={inputs.propertyTax}
                        onChange={set("propertyTax")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                        suffix="/yr"
                      />
                      <CompactInput
                        id="home-insurance"
                        label="Home Insurance"
                        value={inputs.homeInsurance}
                        onChange={set("homeInsurance")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                        suffix="/yr"
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Monthly Costs">
                    <div className="flex flex-col gap-3">
                      <CompactInput
                        id="pmi"
                        label="PMI"
                        value={inputs.pmi}
                        onChange={set("pmi")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                        suffix="/mo"
                        hint="Charged only while the loan-to-value ratio stays above 80%."
                      />
                      <CompactInput
                        id="hoa-fee"
                        label="HOA / Condo Fee"
                        value={inputs.hoaFee}
                        onChange={set("hoaFee")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                        suffix="/mo"
                      />
                      <CompactInput
                        id="other-costs"
                        label="Other Monthly Costs"
                        value={inputs.otherCosts}
                        onChange={set("otherCosts")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                        suffix="/mo"
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Extra Payments">
                    <div className="flex flex-col gap-3">
                      <CompactInput
                        id="extra-monthly"
                        label="Extra Every Payment"
                        value={inputs.extraMonthly}
                        onChange={set("extraMonthly")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                      />
                      <CompactInput
                        id="one-time-extra"
                        label="One-Time Extra at Start"
                        value={inputs.oneTimeExtra}
                        onChange={set("oneTimeExtra")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                      />
                      <CompactInput
                        id="annual-extra"
                        label="Extra Once a Year"
                        value={inputs.annualExtra}
                        onChange={set("annualExtra")}
                        onEnter={runCalculate}
                        min="0"
                        prefix="$"
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Payment Frequency">
                    <CompactSelect
                      id="payment-freq"
                      label="Schedule"
                      value={inputs.paymentFreq}
                      onChange={(v) => setInputs((prev) => ({ ...prev, paymentFreq: v as "monthly" | "biweekly" }))}
                      options={[
                        { value: "monthly", label: "Monthly (12 payments a year)" },
                        { value: "biweekly", label: "Biweekly (26 payments a year)" },
                      ]}
                      hint="Biweekly halves the payment and adds two extra payments a year."
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
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{money(d.totalMonthly)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {`${money(results.monthlyPI)} principal & interest plus ${money(d.totalMonthly - results.monthlyPI)} of taxes and fees`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Loan Amount</span>
                <span className="font-extrabold text-foreground">{money(d.loan)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">{money(results.totalInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payoff Date</span>
                <span className="font-extrabold text-foreground">{results.payoffDate}</span>
              </div>
            </div>

            {/* MONTHLY PAYMENT BREAKDOWN */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Monthly Cost</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {monthlyBreakdown.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.value)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total monthly outlay</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(d.totalMonthly)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AMORTIZATION TABLE */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Amortization Schedule</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("yearly")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("monthly")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">{viewMode === "yearly" ? "Year" : "Payment"}</th>
                      <th className="p-2.5 text-right">Payment</th>
                      <th className="p-2.5 text-right text-emerald-600">Principal</th>
                      <th className="p-2.5 text-right text-rose-600">Interest</th>
                      <th className="p-2.5 pr-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {d.amortRows.map((row) => (
                      <tr key={row.period} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.period}</td>
                        <td className="p-2.5 text-right text-foreground">{money(row.payment)}</td>
                        <td className="p-2.5 text-right text-emerald-600">{money(row.principal)}</td>
                        <td className="p-2.5 text-right text-rose-600">{money(row.interest)}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{money(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {viewMode === "monthly" && (
                <div className="p-2.5 pl-3 text-[11px] text-muted-foreground border-t border-border">
                  Showing the first {d.amortRows.length} payments of {results.monthlyRows.length}. Switch to Yearly for the full schedule.
                </div>
              )}
            </div>

            {/* TERM COMPARISON */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Term Comparison</th>
                    <th className="p-2.5 text-right">Monthly P&I</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Total Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {d.scenarios.map((row) => (
                    <tr key={row.term} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.term}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.monthly)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.totalInterest)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Down Payment</span>
                  <span className="text-base font-bold text-foreground">
                    {`${money(d.downPayment)} (${fmt(d.price > 0 ? (d.downPayment / d.price) * 100 : 0, 1)}%)`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan-to-Value</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(d.ltv, 1)}%`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Cost of Ownership</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest as Share of Loan</span>
                  <span className="text-base font-bold text-foreground">
                    {`${fmt(d.loan > 0 ? (results.totalInterest / d.loan) * 100 : 0, 1)}%`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest Saved</span>
                  <span className="text-base font-bold text-foreground">{money(results.interestSaved)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Time Saved by Extras</span>
                  <span className="text-base font-bold text-foreground">
                    {results.timeSavedMonths > 0
                      ? `${Math.floor(results.timeSavedMonths / 12)} yr ${Math.round(results.timeSavedMonths % 12)} mo`
                      : "None"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total PMI Paid</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalPmiCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">PMI Drop-Off</span>
                  <span className="text-base font-bold text-foreground">{d.pmiDropLabel || "Not required"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Taxes & Insurance Over Term</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalTaxInsurance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">HOA & Other Over Term</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalHoaOther)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Mortgage Calculator?</h2>
            <p>
              A mortgage calculator turns a home price, a down payment, an interest rate and a loan term into the numbers
              that actually matter when you buy: the monthly payment, the total interest paid and the date the loan finally
              clears. It also breaks the payment into principal and interest, and adds the property tax, homeowners insurance,
              private mortgage insurance and HOA dues that most buyers forget until they see the first statement.
            </p>
            <p>
              Because a mortgage is the largest loan most households ever take, small differences compound quickly. Half a
              percentage point on a rate or five extra years on a term can move the lifetime cost by tens of thousands of
              dollars. Running the numbers before you make an offer, rather than after, is the entire point of the exercise.
            </p>
            <p>
              The tool is equally useful after you have the loan. Enter your real balance and rate, then test what happens if
              you pay a little extra each month, add a lump sum once a year, or switch to a biweekly schedule. The savings are
              reported as both money and time, which makes the trade-off easy to judge against other uses for the same cash.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Principal and interest come from the amortisation formula. The periodic rate is the annual rate divided by the
              number of payments a year, and the payment is set so that the same amount clears the balance in exactly the
              agreed number of periods. Interest for each period is charged on the outstanding balance, and whatever remains of
              the payment reduces that balance, which is why the interest share falls and the principal share rises over time.
            </p>
            <p>
              The schedule is then replayed payment by payment with your extras included. An extra payment in any period goes
              entirely against the principal, so every later interest charge is smaller and the loan ends earlier. A second
              loop runs the same loan with no extras, and the two totals are compared to produce the interest saved and the
              time saved figures shown in the results.
            </p>
            <p>
              Private mortgage insurance is handled separately because it depends on the balance rather than the calendar. It
              is charged while the loan-to-value ratio sits above 80 percent and stops once the balance falls to that level.
              The calculator follows the balance through the schedule and reports the payment at which the cover ends, so the
              effect of extra payments on PMI is visible too.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the total monthly outlay, with the principal and interest portion called out underneath.
              The three-stat bar reports the loan amount, the total interest and the payoff date. The first table itemises the
              monthly cost line by line, the second is the full amortisation schedule in yearly or monthly form, and the third
              prices the same loan over 15, 20 and 30 years so you can see what shortening the term would cost each month and
              save in total.
            </p>
            <p>
              Read the schedule to see how slowly equity builds at the start. On a thirty-year loan at a typical rate, the
              first years are weighted heavily towards interest, and it is only past the halfway mark that principal begins to
              dominate. That pattern explains why extra payments made early are worth far more than the same money paid later.
              Compare the payoff date with and without extras to see how many years a modest increase removes.
            </p>
            <p>
              Judge affordability from the total monthly outlay rather than the principal and interest figure alone, since
              taxes, insurance and HOA dues are part of the obligation every month. Lenders commonly look for housing costs
              below about a third of gross income, so divide the headline number by your monthly gross pay to check your own
              standing. If the loan-to-value ratio is above 80 percent, the PMI row and the drop-off date deserve attention, as
              reaching that threshold sooner removes a payment that buys you nothing.
            </p>
            <p>
              Finally, treat the output as a plan rather than a promise. Rates move, taxes are reassessed, insurance renews and
              most borrowers refinance at some point. Re-run the numbers whenever one of those inputs changes, and keep an eye
              on the total cost of ownership figure, because that is the true price of the house once every payment, fee and
              insurance premium over the life of the loan has been counted. Buying points, choosing a shorter term or making
              one extra payment a year each shift that number, and seeing the difference in dollars rather than assumptions is
              the fastest way to decide which of them is worth doing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-calculator" />
        </div>
      </div>
    </>
  );
}
