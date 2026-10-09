"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ApyInputs {
  deposit: number;
  nominalRate: number;
  compounding: string;
  years: number;
  monthly: number;
  inflation: number;
  taxRate: number;
}

const DEFAULTS: ApyInputs = {
  deposit: 25000,
  nominalRate: 4.35,
  compounding: "12",
  years: 5,
  monthly: 250,
  inflation: 2.5,
  taxRate: 22,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const usd = (v: number) => (Number.isFinite(v) ? "$" + fmt(v, 2) : "—");

const pct = (v: number) => (Number.isFinite(v) ? fmt(v, 2) + "%" : "—");

const COMPOUNDING = [
  { value: "365", label: "Daily — 365× a year" },
  { value: "52", label: "Weekly — 52× a year" },
  { value: "26", label: "Bi-weekly — 26× a year" },
  { value: "12", label: "Monthly — 12× a year" },
  { value: "4", label: "Quarterly — 4× a year" },
  { value: "2", label: "Semi-annually — 2× a year" },
  { value: "1", label: "Annually — 1× a year" },
  { value: "0", label: "Continuous — infinite" },
];

interface ApyResult {
  ok: boolean;
  apy: number;
  aprCheck: number;
  months: number;
  monthlyRate: number;
  dailyRate: number;
  balance: number;
  principal: number;
  contributions: number;
  interest: number;
  simpleInterest: number;
  compoundingGain: number;
  afterTaxBalance: number;
  afterTaxInterest: number;
  afterTaxApy: number;
  realApy: number;
  realBalance: number;
  doublingYears: number;
  periods: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateApy(i: ApyInputs): ApyResult {
  const blank = (): ApyResult => ({
    ok: false,
    apy: 0,
    aprCheck: 0,
    months: 0,
    monthlyRate: 0,
    dailyRate: 0,
    balance: 0,
    principal: 0,
    contributions: 0,
    interest: 0,
    simpleInterest: 0,
    compoundingGain: 0,
    afterTaxBalance: 0,
    afterTaxInterest: 0,
    afterTaxApy: 0,
    realApy: 0,
    realBalance: 0,
    doublingYears: 0,
    periods: 0,
    breakdown: [],
  });

  const nums = [i.deposit, i.nominalRate, i.years, i.monthly, i.inflation, i.taxRate];
  if (!nums.every((v) => Number.isFinite(v))) return blank();
  if (i.deposit <= 0 || i.deposit > 1e9) return blank();
  if (i.nominalRate <= 0 || i.nominalRate > 100) return blank();
  if (i.years <= 0 || i.years > 60) return blank();
  if (i.monthly < 0 || i.monthly > 1e7) return blank();
  if (i.inflation < 0 || i.inflation > 30) return blank();
  if (i.taxRate < 0 || i.taxRate > 60) return blank();

  const n = parseFloat(i.compounding);
  if (!Number.isFinite(n) || n < 0) return blank();
  const continuous = n === 0;
  const r = i.nominalRate / 100;

  // APY is the effective annual rate: (1 + r/n)^n - 1, and e^r - 1 in the limit.
  const apy = continuous ? Math.exp(r) - 1 : Math.pow(1 + r / n, n) - 1;

  // Inverse conversion, so the quoted rate can be checked against the APY.
  const aprCheck = continuous ? Math.log(1 + apy) : n * (Math.pow(1 + apy, 1 / n) - 1);

  const months = Math.round(i.years * 12);
  const monthlyRate = Math.pow(1 + apy, 1 / 12) - 1;
  const dailyRate = Math.pow(1 + apy, 1 / 365) - 1;
  const periods = continuous ? 0 : n * i.years;

  // Future value of the lump sum plus a level monthly contribution stream, both
  // compounded at the effective monthly rate implied by the APY.
  const growth = Math.pow(1 + monthlyRate, months);
  const balanceFromDeposit = i.deposit * growth;
  const balanceFromContributions =
    monthlyRate > 0 ? i.monthly * ((growth - 1) / monthlyRate) : i.monthly * months;
  const balance = balanceFromDeposit + balanceFromContributions;

  const contributions = i.monthly * months;
  const interest = balance - i.deposit - contributions;
  const simpleInterest = i.deposit * r * i.years;
  const compoundingGain = balanceFromDeposit - i.deposit - simpleInterest;

  const afterTaxInterest = interest * (1 - i.taxRate / 100);
  const afterTaxBalance = i.deposit + contributions + afterTaxInterest;
  const afterTaxApy = apy * (1 - i.taxRate / 100);
  const realApy = (1 + apy) / (1 + i.inflation / 100) - 1;
  const realBalance = balance / Math.pow(1 + i.inflation / 100, i.years);
  const doublingYears = apy > 0 ? Math.log(2) / Math.log(1 + apy) : 0;

  const breakdown = [
    { label: "Deposit at the start", value: usd(i.deposit) },
    { label: `Nominal rate quoted`, value: pct(i.nominalRate) },
    {
      label: "Compounding",
      value: continuous ? "Continuous" : `${fmt(n, 0)}× a year (${fmt(periods, 0)} periods)`,
    },
    { label: "Annual percentage yield", value: pct(apy * 100), highlight: true },
    { label: "Nominal rate implied by that yield", value: pct(aprCheck * 100) },
    { label: "Effective monthly rate", value: fmt(monthlyRate * 100, 4) + "%" },
    { label: "Effective daily rate", value: fmt(dailyRate * 100, 4) + "%" },
    { label: "Monthly contributions over the term", value: usd(contributions) },
    { label: "Balance at the end of the term", value: usd(balance), highlight: true },
    { label: "Interest earned", value: usd(interest) },
    { label: `Simple interest on the deposit alone at ${pct(i.nominalRate)}`, value: usd(simpleInterest) },
    { label: "Extra earned by compounding the deposit", value: usd(compoundingGain) },
    { label: `Tax on interest at ${fmt(i.taxRate, 0)}%`, value: usd(interest - afterTaxInterest) },
    { label: "After-tax interest kept", value: usd(afterTaxInterest) },
    { label: "Balance in today's money after inflation", value: usd(realBalance), highlight: true },
  ];

  return {
    ok: true,
    apy: apy * 100,
    aprCheck: aprCheck * 100,
    months,
    monthlyRate: monthlyRate * 100,
    dailyRate: dailyRate * 100,
    balance,
    principal: i.deposit,
    contributions,
    interest,
    simpleInterest,
    compoundingGain,
    afterTaxBalance,
    afterTaxInterest,
    afterTaxApy: afterTaxApy * 100,
    realApy: realApy * 100,
    realBalance,
    doublingYears,
    periods,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function ApyCalculator() {
  const [deposit, setDeposit] = useState(String(DEFAULTS.deposit));
  const [nominalRate, setNominalRate] = useState(String(DEFAULTS.nominalRate));
  const [compounding, setCompounding] = useState(DEFAULTS.compounding);
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [monthly, setMonthly] = useState(String(DEFAULTS.monthly));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ApyInputs => ({
    deposit: parseFloat(deposit) || 0,
    nominalRate: parseFloat(nominalRate) || 0,
    compounding,
    years: parseFloat(years) || 0,
    monthly: parseFloat(monthly) || 0,
    inflation: parseFloat(inflation) || 0,
    taxRate: parseFloat(taxRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ApyInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ApyResult>(() => calculateApy(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateApy(inputs));
  };

  const reset = () => {
    setDeposit(String(DEFAULTS.deposit));
    setNominalRate(String(DEFAULTS.nominalRate));
    setCompounding(DEFAULTS.compounding);
    setYears(String(DEFAULTS.years));
    setMonthly(String(DEFAULTS.monthly));
    setInflation(String(DEFAULTS.inflation));
    setTaxRate(String(DEFAULTS.taxRate));
    setCalcInputs(DEFAULTS);
    setResults(calculateApy(DEFAULTS));
  };

  const depositNum = parseFloat(deposit);
  const rateNum = parseFloat(nominalRate);
  const yearsNum = parseFloat(years);

  const errors = {
    deposit: !Number.isFinite(depositNum) || depositNum <= 0 ? "Enter a deposit above zero" : "",
    rate: !Number.isFinite(rateNum) || rateNum <= 0 || rateNum > 100 ? "Enter a rate of 0.01–100%" : "",
    years: !Number.isFinite(yearsNum) || yearsNum <= 0 || yearsNum > 60 ? "Enter a term of 0.1–60 years" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const realPositive = results.realApy > 0;

  const faqs = [
    {
      question: "What is the difference between APY and APR?",
      answer:
        "APR is the nominal annual rate as quoted, without any compounding; APY is what that rate actually earns over a year once compounding is applied. On a 4.35% account compounded monthly the APY is 4.44%, and the gap widens as the compounding frequency rises — daily compounding on the same nominal rate gives 4.446%. For money you are saving, APY is the number to compare, because it already accounts for frequency. For money you are borrowing, APR is the one on the disclosure, though the effective rate there also depends on fees. This calculator shows the nominal rate implied by the APY underneath the headline, which is the conversion in reverse.",
    },
    {
      question: "How often should I choose for compounding frequency?",
      answer:
        "Use the frequency printed in the account terms, not the one that looks best. Most high-yield savings accounts compound daily and credit interest monthly, in which case daily is the correct setting; certificates of deposit often compound daily or monthly, and large denomination accounts sometimes quarterly. Continuous compounding is a theoretical limit rather than a product feature, useful for comparison work and for the fact that daily compounding is already within a few hundredths of a percent of it. The practical difference between daily and monthly on a 4.35% rate is under a basis point of yield — 0.79 of a basis point at these figures — so frequency is worth far less attention than the rate itself.",
    },
    {
      question: "Does APY include tax and inflation?",
      answer:
        "No, and that omission is where headline yields mislead most. Interest on a savings account is taxed as ordinary income, so a 4.44% APY in the 22% bracket keeps only about 3.46% after tax; in the 32% bracket it keeps about 3.02%. Inflation does further damage: at 2.5% a year, the same account produces a real return of roughly 1.89%, and any account yielding less than the inflation rate loses purchasing power no matter how healthy the nominal balance looks. Both adjustments are in the advanced panel, and the summary panel reports the after-tax yield, the real yield and the ending balance expressed in today's money.",
    },
    {
      question: "How long does it take to double my balance?",
      answer:
        "The exact answer is the natural logarithm of two divided by the logarithm of one plus the APY, which the summary panel reports. At a 4.44% APY that is about 15.9 years; the familiar Rule of 72, which divides 72 by the percentage yield, gives 16.2 years and is a good mental approximation. The doubling time is driven by the yield alone, so it does not change when you add monthly contributions — contributions shorten the time to reach a target balance, but not the time for money already invested to double. Adding contributions is nonetheless the highest-leverage input in this calculator, because contributions arrive with no tax drag at all.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "APY Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">APY Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Deposit & Rate">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="deposit"
                  label="Initial Deposit"
                  value={deposit}
                  onChange={setDeposit}
                  onEnter={runCalculate}
                  min="1"
                  step="500"
                  suffix="$"
                  error={errors.deposit}
                  tooltip="Lump sum placed in the account today."
                />
                <CompactInput
                  id="rate"
                  label="Nominal Rate"
                  value={nominalRate}
                  onChange={setNominalRate}
                  onEnter={runCalculate}
                  min="0.01"
                  max="100"
                  step="0.01"
                  suffix="%"
                  error={errors.rate}
                  hint="The quoted APR."
                  tooltip="Nominal annual rate before compounding, as advertised on the account."
                />
              </div>
            </SubSection>

            <SubSection title="Term & Frequency">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="comp"
                  label="Compounding"
                  value={compounding}
                  onChange={setCompounding}
                  options={COMPOUNDING}
                  tooltip="How many times per year interest is posted to the balance."
                />
                <CompactInput
                  id="years"
                  label="Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  min="0.1"
                  max="60"
                  step="0.5"
                  suffix="yr"
                  error={errors.years}
                  tooltip="How long the balance stays invested."
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
                  <SubSection title="Contributions">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="monthly"
                        label="Monthly Contribution"
                        value={monthly}
                        onChange={setMonthly}
                        onEnter={runCalculate}
                        min="0"
                        step="50"
                        suffix="$"
                        hint="Leave 0 for a lump sum only."
                        tooltip="Added at the end of every month and compounded at the effective monthly rate."
                      />
                      <CompactInput
                        id="inflation"
                        label="Inflation Rate"
                        value={inflation}
                        onChange={setInflation}
                        onEnter={runCalculate}
                        min="0"
                        max="30"
                        step="0.1"
                        suffix="%"
                        tooltip="Used to convert the nominal yield into a real return and the ending balance into today's money."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Tax">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax"
                        label="Tax on Interest"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        min="0"
                        max="60"
                        step="1"
                        suffix="%"
                        hint="Savings interest is ordinary income."
                        tooltip="Marginal rate applied to interest earned. Use 0 for a tax-advantaged account such as an IRA or ISA."
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
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.ok && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">
                  Enter a deposit, a nominal rate and a term above zero to work out the yield.
                </div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Annual Percentage Yield</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.ok ? pct(results.apy) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.ok
                  ? `${pct(calcInputs.nominalRate)} nominal compounded ${
                      calcInputs.compounding === "0" ? "continuously" : fmt(parseFloat(calcInputs.compounding), 0) + "× a year"
                    } · doubles in ${fmt(results.doublingYears, 1)} years`
                  : "Fill in the deposit, rate and term to see the yield"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ending Balance</span>
                <span className="font-extrabold text-foreground">{usd(results.balance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Earned</span>
                <span className="font-extrabold text-foreground">{usd(results.interest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Real Yield</span>
                <span className={`font-extrabold ${realPositive ? "text-emerald-600" : "text-destructive"}`}>
                  {pct(results.realApy)}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Yield Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                    <td className="p-2.5 pl-3 text-foreground">Conversion check</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.ok ? "APR ↔ APY consistent" : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Yield (APY)</span>
                  <span className="text-base font-bold text-foreground">{pct(results.apy)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective monthly rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.monthlyRate, 4)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective daily rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.dailyRate, 4)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Term</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.years, 1)} years ({fmt(results.months, 0)} months)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Contributions paid in</span>
                  <span className="text-base font-bold text-foreground">{usd(results.contributions)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Simple interest on deposit</span>
                  <span className="text-base font-bold text-foreground">{usd(results.simpleInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">After-tax yield</span>
                  <span className="text-base font-bold text-foreground">{pct(results.afterTaxApy)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">After-tax interest</span>
                  <span className="text-base font-bold text-foreground">{usd(results.afterTaxInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Real yield after inflation</span>
                  <span className="text-base font-bold text-foreground">{pct(results.realApy)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance in today's money</span>
                  <span className="text-base font-bold text-foreground">{usd(results.realBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an APY Calculator?</h2>
            <p>
              An APY calculator converts a quoted nominal interest rate into the annual percentage yield — the figure that reflects what
              the account actually pays over a year once compounding is applied. It takes the deposit, the advertised rate, the
              compounding frequency and the term, and returns the effective annual yield, the balance at maturity, the interest earned,
              and the same numbers adjusted for tax and inflation. It is the calculation that turns a headline rate into a comparable
              number, which is why regulators require savings products to disclose APY rather than APR.
            </p>
            <p>
              The distinction matters because the two figures are not interchangeable.
              A 4.35% rate compounded monthly yields 4.44% a year, and the same rate compounded daily yields 4.446%. Neither is wrong and neither is hidden — they simply measure
              different things, and comparing an APR from one bank against an APY from another flatters whichever account quotes the
              lower number. This calculator states both, plus the effective monthly and daily rates, so the comparison is on one basis.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The yield follows directly from the compounding formula. Dividing the nominal rate by the number of compounding periods
              and raising the result to the power of those periods gives the annual growth factor, and subtracting one leaves the APY.
              Where the period count grows without limit the expression converges on Euler's number raised to the nominal rate, which is
              why continuous compounding appears as a separate setting rather than an extreme value of the discrete one. The reverse
              conversion — the nominal rate implied by an APY — is shown underneath, and it should reproduce the rate you entered.
            </p>
            <p>
              Balance projections work from the effective monthly rate, which is the twelfth root of the annual growth factor rather than
              the nominal rate divided by twelve. That distinction is small but real: it keeps the monthly compounding consistent with
              the stated APY instead of drifting from it. A single deposit grows at that rate for the whole term, and a monthly
              contribution stream is accumulated with the standard future-value-of-an-annuity expression, contributions assumed to be
              made at the end of each month. Interest is then whatever the ending balance exceeds the deposit plus the contributions.
            </p>
            <p>
              Two adjustments run alongside the nominal maths. Tax is applied to interest at the marginal rate entered, producing an
              after-tax yield and an after-tax balance, because savings interest is taxed as ordinary income and the drag is proportional
              rather than fixed. Inflation divides the yield and the balance, converting the nominal result into a real one; a yield below
              the inflation rate produces a negative real return even though the balance grew. A comparison against simple interest on the
              deposit alone isolates how much of the interest is attributable to compounding rather than to the rate itself.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The headline is the APY with the nominal rate, frequency and doubling time beneath it, since that single figure is the one
              to compare across accounts. The three-stat bar puts the ending balance, interest earned and real yield side by side, and the
              breakdown table walks from deposit through monthly contributions to the final balance, with the simple-interest comparison
              and the tax and inflation adjustments spelled out in currency.
            </p>
            <p>
              Read the summary panel before choosing an account. An after-tax yield below the inflation rate means the money is losing
              purchasing power, and no amount of convenience makes that a good place to park cash. Note also that the doubling time
              depends only on the yield, so chasing half a basis point between two accounts is rarely worth the effort compared with
              increasing the monthly contribution, which carries no tax drag at all. Where a term is short, remember that early withdrawal
              penalties on a certificate of deposit can erase more yield than the compounding ever added.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apy-calculator" />
          <PopularCalculators exclude="/calculator/apy-calculator" />
        </div>
      </div>
    </>
  );
}
