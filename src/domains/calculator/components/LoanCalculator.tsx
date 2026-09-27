"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";
import { annuityPayment } from "./logicCore";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface LoanInputs {
  amount: string;
  rate: string;
  term: string;
  termUnit: "years" | "months";
  extraMonthly: string;
  oneTimeExtra: string;
  startMonth: string;
  startYear: string;
}

const DEFAULTS: LoanInputs = {
  amount: "25000",
  rate: "6.5",
  term: "5",
  termUnit: "years",
  extraMonthly: "0",
  oneTimeExtra: "0",
  startMonth: "Jan",
  startYear: "2026",
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => `$${fmt(v, 2)}`;

interface ScheduleRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface ScenarioRow {
  label: string;
  monthly: number;
  totalInterest: number;
  highlight: boolean;
}

interface LoanResult {
  valid: boolean;
  errorMsg: string;
  principal: number;
  periods: number;
  monthly: number;
  totalPaid: number;
  totalInterest: number;
  interestShare: number;
  monthsToPayoff: number;
  payoffLabel: string;
  interestSaved: number;
  monthsSaved: number;
  firstMonthInterest: number;
  lastMonthInterest: number;
  schedule: ScheduleRow[];
  yearlyRows: ScheduleRow[];
  termRows: ScenarioRow[];
  rateRows: ScenarioRow[];
}

function addMonths(startYearStr: string, startMonthStr: string, count: number): string {
  const startIdx = Math.max(0, MONTHS.indexOf(startMonthStr));
  const total = startIdx + Math.max(0, count);
  const y = (parseInt(startYearStr) || 2026) + Math.floor(total / 12);
  return `${MONTHS[total % 12]} ${y}`;
}

function scenario(loan: number, ratePct: number, months: number): { monthly: number; totalInterest: number } {
  const r = ratePct / 100 / 12;
  const monthly = annuityPayment(loan, r, months);
  return { monthly, totalInterest: monthly * months - loan };
}

function compute(i: LoanInputs): LoanResult {
  const P = num(i.amount);
  const apr = num(i.rate);
  const months = i.termUnit === "years" ? Math.round(num(i.term) * 12) : Math.round(num(i.term));
  const r = apr / 100 / 12;

  const blank: LoanResult = {
    valid: false,
    errorMsg: "",
    principal: P,
    periods: 0,
    monthly: 0,
    totalPaid: 0,
    totalInterest: 0,
    interestShare: 0,
    monthsToPayoff: 0,
    payoffLabel: "",
    interestSaved: 0,
    monthsSaved: 0,
    firstMonthInterest: 0,
    lastMonthInterest: 0,
    schedule: [],
    yearlyRows: [],
    termRows: [],
    rateRows: [],
  };

  if (P <= 0 || months <= 0) {
    return { ...blank, errorMsg: "Enter a loan amount above zero and a term of at least one month." };
  }

  const monthly = annuityPayment(P, r, months);
  const baselineTotal = monthly * months;
  const baselineInterest = baselineTotal - P;

  const extraEvery = Math.max(0, num(i.extraMonthly));
  const oneTime = Math.max(0, num(i.oneTimeExtra));

  const schedule: ScheduleRow[] = [];
  let balance = P;
  let totalPaid = 0;
  let totalInterest = 0;
  let period = 0;

  while (balance > 0.005 && period < months * 3) {
    period++;
    const interest = balance * r;
    let principal = monthly - interest + extraEvery;
    if (period === 1) principal += oneTime;
    if (principal > balance) principal = balance;
    const payment = interest + principal;
    balance -= principal;
    totalPaid += payment;
    totalInterest += interest;
    schedule.push({
      period,
      payment,
      principal,
      interest,
      balance: Math.max(0, balance),
    });
  }

  const yearlyRows: ScheduleRow[] = [];
  for (let y = 0; y < Math.ceil(schedule.length / 12); y++) {
    const slice = schedule.slice(y * 12, (y + 1) * 12);
    if (slice.length === 0) break;
    yearlyRows.push({
      period: y + 1,
      payment: slice.reduce((s, row) => s + row.payment, 0),
      principal: slice.reduce((s, row) => s + row.principal, 0),
      interest: slice.reduce((s, row) => s + row.interest, 0),
      balance: slice[slice.length - 1].balance,
    });
  }

  const termRows: ScenarioRow[] = [3, 5, 7].map((years) => {
    const s = scenario(P, apr, years * 12);
    return {
      label: `${years} years`,
      monthly: s.monthly,
      totalInterest: s.totalInterest,
      highlight: Math.abs(years * 12 - months) < 1,
    };
  });

  const rateRows: ScenarioRow[] = [apr - 1, apr, apr + 1]
    .filter((v) => v > 0)
    .map((ratePct) => {
      const s = scenario(P, ratePct, months);
      return {
        label: `${fmt(ratePct, 2)}% APR`,
        monthly: s.monthly,
        totalInterest: s.totalInterest,
        highlight: Math.abs(ratePct - apr) < 0.0001,
      };
    });

  const first = schedule[0];
  const last = schedule[schedule.length - 1];

  return {
    valid: true,
    errorMsg: "",
    principal: P,
    periods: schedule.length,
    monthly,
    totalPaid,
    totalInterest,
    interestShare: totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0,
    monthsToPayoff: schedule.length,
    payoffLabel: addMonths(i.startYear, i.startMonth, schedule.length),
    interestSaved: Math.max(0, baselineInterest - totalInterest),
    monthsSaved: Math.max(0, months - schedule.length),
    firstMonthInterest: first ? first.interest : 0,
    lastMonthInterest: last ? last.interest : 0,
    schedule,
    yearlyRows,
    termRows,
    rateRows,
  };
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
    <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{title}</div>
    {children}
  </div>
);

export default function LoanCalculator() {
  const [inputs, setInputs] = useState<LoanInputs>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");

  const [calcInputs, setCalcInputs] = useState<LoanInputs>(DEFAULTS);
  const [results, setResults] = useState<LoanResult>(() => compute(DEFAULTS));

  const set = (key: keyof LoanInputs) => (v: string) => setInputs((prev) => ({ ...prev, [key]: v }));

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

  const amortRows = viewMode === "yearly" ? results.yearlyRows : results.schedule.slice(0, 60);

  const breakdownRows: { label: string; value: string }[] = [
    { label: "Loan amount", value: money(results.principal) },
    { label: "Total interest", value: money(results.totalInterest) },
    { label: "Total paid", value: money(results.totalPaid) },
    { label: "Interest share of payments", value: `${fmt(results.interestShare, 1)}%` },
    { label: "Number of payments", value: fmt(results.periods) },
    { label: "Interest saved by extra payments", value: money(results.interestSaved) },
    { label: "Months saved by extra payments", value: fmt(results.monthsSaved) },
  ];

  const faqs = [
    {
      question: "How is a monthly loan payment calculated?",
      answer:
        "The payment comes from the standard amortisation formula, which sets one level instalment that clears the balance in exactly the agreed number of periods given the interest rate. Interest is charged each period on whatever principal is still outstanding, and the remainder of the payment reduces that balance, so the split shifts from interest towards principal as the loan matures.",
    },
    {
      question: "What is loan amortisation?",
      answer:
        "Amortisation is the process of paying a debt down through scheduled payments rather than in one lump sum. Each payment covers the interest that has accrued since the last one and then chips away at the principal. Early payments are mostly interest because the balance is large; later payments are mostly principal because the balance is small.",
    },
    {
      question: "Do extra payments really save money?",
      answer:
        "Yes, because every extra dollar goes directly against the principal and therefore reduces every future interest charge. Even a small extra amount each month can remove years from a long loan, and the calculator reports exactly how much interest and how many months the extras save compared with paying strictly on schedule.",
    },
    {
      question: "What is the difference between the interest rate and the APR?",
      answer:
        "The interest rate is the cost of borrowing the principal, while the APR folds in most fees charged to arrange the loan and expresses them as an annual rate. The APR is therefore the better number for comparing offers from different lenders, even though the monthly payment is driven by the base interest rate.",
    },
    {
      question: "Should I choose a shorter term or a lower monthly payment?",
      answer:
        "A shorter term raises the monthly payment but cuts the total interest dramatically, while a longer term protects monthly cash flow at a higher lifetime cost. The term comparison table prices the same loan over three standard lengths so the trade-off is visible in both directions before you commit.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Loan Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="flex flex-col gap-3">
                <CompactInput
                  id="loan-amount"
                  label="Loan Amount"
                  value={inputs.amount}
                  onChange={set("amount")}
                  onEnter={runCalculate}
                  min="0"
                  prefix="$"
                  tooltip="The total amount you are borrowing before interest."
                />
                <CompactInput
                  id="loan-rate"
                  label="Interest Rate (APR)"
                  value={inputs.rate}
                  onChange={set("rate")}
                  onEnter={runCalculate}
                  min="0"
                  suffix="%"
                  tooltip="Annual rate. Enter 6.5 for six and a half percent."
                />
                <CompactInput
                  id="loan-term"
                  label="Loan Term"
                  value={inputs.term}
                  onChange={set("term")}
                  onEnter={runCalculate}
                  min="0"
                  suffix={inputs.termUnit === "years" ? "years" : "months"}
                />
                <CompactSelect
                  id="loan-term-unit"
                  label="Term Unit"
                  value={inputs.termUnit}
                  onChange={(v) => setInputs((prev) => ({ ...prev, termUnit: v as "years" | "months" }))}
                  options={[
                    { value: "years", label: "Years" },
                    { value: "months", label: "Months" },
                  ]}
                />
                <div className="grid grid-cols-2 gap-3">
                  <CompactSelect
                    id="loan-start-month"
                    label="First Payment"
                    value={inputs.startMonth}
                    onChange={set("startMonth")}
                    options={MONTHS.map((m) => ({ value: m, label: m }))}
                  />
                  <CompactInput
                    id="loan-start-year"
                    label="Year"
                    value={inputs.startYear}
                    onChange={set("startYear")}
                    onEnter={runCalculate}
                    min="1900"
                  />
                </div>
              </div>
            </SubSection>

            <SubSection title="Prepayment Options">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="bg-secondary/20 border border-border mt-3 rounded-lg p-4 animate-fade-in-up !overflow-visible">
                  <div className="flex flex-col gap-3">
                    <CompactInput
                      id="extra-monthly"
                      label="Extra Monthly Payment"
                      value={inputs.extraMonthly}
                      onChange={set("extraMonthly")}
                      onEnter={runCalculate}
                      min="0"
                      prefix="$"
                      hint="Added to every scheduled payment"
                    />
                    <CompactInput
                      id="extra-one-time"
                      label="One-Time Extra Payment"
                      value={inputs.oneTimeExtra}
                      onChange={set("oneTimeExtra")}
                      onEnter={runCalculate}
                      min="0"
                      prefix="$"
                      hint="Applied together with the first payment"
                    />
                  </div>
                </div>
              )}
            </SubSection>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                aria-label="Reset"
                onClick={reset}
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid ? (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 text-sm text-destructive font-semibold">
                {results.errorMsg || "Enter valid loan details to see results."}
              </div>
            ) : (
              <>
                {/* PRIMARY RESULT CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Payment</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{money(results.monthly)}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {`Results for a ${money(results.principal)} loan at ${fmt(num(calcInputs.rate), 2)}% APR over ${fmt(results.periods)} payments`}
                  </div>
                </div>

                {/* 3-STAT BAR */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Loan Amount</span>
                    <span className="font-extrabold text-foreground">{money(results.principal)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                    <span className="font-extrabold text-foreground">{money(results.totalInterest)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payoff Date</span>
                    <span className="font-extrabold text-foreground">{results.payoffLabel}</span>
                  </div>
                </div>

                {/* PAYMENT SUMMARY */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Loan Summary</th>
                        <th className="p-2.5 pr-3 text-right w-[150px]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {breakdownRows.map((row) => (
                        <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                        </tr>
                      ))}
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
                        {amortRows.map((row) => (
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
                      Showing the first {amortRows.length} of {results.periods} payments. Switch to Yearly for the full schedule.
                    </div>
                  )}
                </div>

                {/* TERM COMPARISON */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Term Comparison</th>
                        <th className="p-2.5 text-right">Monthly Payment</th>
                        <th className="p-2.5 pr-3 text-right w-[150px]">Total Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.termRows.map((row) => (
                        <tr
                          key={row.label}
                          className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-primary/5 font-semibold" : ""}`}
                        >
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 text-right text-foreground">{money(row.monthly)}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{money(row.totalInterest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RATE SCENARIOS */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Rate Scenario</th>
                        <th className="p-2.5 text-right">Monthly Payment</th>
                        <th className="p-2.5 pr-3 text-right w-[150px]">Total Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.rateRows.map((row) => (
                        <tr
                          key={row.label}
                          className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-primary/5 font-semibold" : ""}`}
                        >
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
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
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rate Used</span>
                      <span className="text-base font-bold text-foreground">{`${fmt(num(calcInputs.rate), 2)}% APR`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest as Share of Loan</span>
                      <span className="text-base font-bold text-foreground">
                        {`${fmt(results.principal > 0 ? (results.totalInterest / results.principal) * 100 : 0, 1)}%`}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Month Interest</span>
                      <span className="text-base font-bold text-foreground">{money(results.firstMonthInterest)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final Month Interest</span>
                      <span className="text-base font-bold text-foreground">{money(results.lastMonthInterest)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</span>
                      <span className="text-base font-bold text-foreground">{money(results.totalPaid)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per $1 Borrowed</span>
                      <span className="text-base font-bold text-foreground">
                        {results.principal > 0 ? `${fmt(results.totalPaid / results.principal, 3)}` : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved by Extras</span>
                      <span className="text-base font-bold text-foreground">{money(results.interestSaved)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Time Saved by Extras</span>
                      <span className="text-base font-bold text-foreground">
                        {results.monthsSaved > 0
                          ? `${Math.floor(results.monthsSaved / 12)} yr ${Math.round(results.monthsSaved % 12)} mo`
                          : "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Loan Payment Calculator?</h2>
            <p>
              A loan payment calculator turns the three numbers on every loan agreement, the amount borrowed, the annual
              rate and the term, into the figures that matter: the monthly payment, the total interest and the date the
              debt clears. It replays the loan one payment at a time, so you can see how much of each instalment is
              interest and how much actually reduces the balance, rather than accepting a single figure from a lender.
            </p>
            <p>
              Because the calculator also accepts extra monthly or one-time payments, it doubles as a prepayment planner.
              Small voluntary increases that feel painless month to month can remove years from a long loan, and the report
              quantifies both the interest and the time those extras buy back. That makes it useful before signing any
              fixed-rate instalment loan, whether it is a car loan, a personal loan, a student loan, a home improvement
              loan or a small business loan, and just as useful afterwards as a payoff tracker.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The payment comes from the standard amortisation formula, which sets one level instalment that clears the
              balance in exactly the agreed number of periods at the given rate. The monthly rate is the annual percentage
              rate divided by twelve, and interest for each period is charged on whatever principal is still outstanding.
              The rest of the payment reduces that balance, so the interest share shrinks and the principal share grows as
              the loan matures.
            </p>
            <p>
              The calculator keeps a running balance and repeats that calculation month by month until the debt is
              cleared, recording every payment, the interest inside it and the remaining balance. Extra payments are added
              on top of the scheduled amount and go straight against the principal, which lowers every future interest
              charge. A second run of the same loan without extras produces the baseline totals, and the difference
              between the two runs is reported as the interest and the months you save.
            </p>
            <p>
              Two comparison panels round out the picture. The term table prices the same loan over three standard lengths
              so you can see what a shorter commitment costs each month and saves in total, and the rate panel re-prices
              the loan one point above and below your quoted rate so that the cost of a rate rise, or the benefit of a
              refinance, is visible in dollars rather than described in the abstract.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the level monthly payment, and the three-stat bar reports the loan amount, the total
              interest and the payoff date. The first table itemises the whole loan, the second is the amortisation
              schedule in yearly or monthly form, and the last two panels compare terms and rates against your own
              scenario.
            </p>
            <p>
              Read the schedule to see why early payments are expensive. On a typical car or personal loan a large slice
              of the first year goes to interest, and it is only later that principal dominates. That pattern is the
              entire argument for extra payments made early rather than late, because a dollar of principal removed in
              month three saves interest in every month that follows it.
            </p>
            <p>
              Judge affordability from the payment plus your other obligations rather than from the loan in isolation, and
              remember that the total interest figure assumes you hold the loan to maturity. Most borrowers refinance,
              sell or pay off early, which reduces the realised interest below the printed total. Treat the schedule as a
              plan, re-run it whenever a rate or term changes, and check the interest share of the loan against the term
              comparison to confirm the length you have chosen is the one you actually want.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-calculator" />
          <PopularCalculators exclude="/calculator/loan-calculator" />
        </div>
      </div>
    </>
  );
}
