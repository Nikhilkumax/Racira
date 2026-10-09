"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RvInputs {
  price: number;
  downPct: number;
  tradeIn: number;
  rate: number;
  termYears: number;
  salesTaxPct: number;
  fees: number;
  extraMonthly: number;
  decimals: number;
}

const DEFAULTS: RvInputs = {
  price: 85000,
  downPct: 10,
  tradeIn: 0,
  rate: 8.49,
  termYears: 15,
  salesTaxPct: 6,
  fees: 850,
  extraMonthly: 0,
  decimals: 2,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + fmt(v, 2) : "—");

const TERM_OPTIONS = [
  { value: "5", label: "5 years (60 months)" },
  { value: "7", label: "7 years (84 months)" },
  { value: "10", label: "10 years (120 months)" },
  { value: "12", label: "12 years (144 months)" },
  { value: "15", label: "15 years (180 months)" },
  { value: "20", label: "20 years (240 months)" },
];

interface PaymentResult {
  monthly: number;
  monthlyTotal: number;
  financed: number;
  totalInterest: number;
  totalCost: number;
  interestShare: number;
  taxAmount: number;
  months: number;
  payoffMonths: number;
  monthsSaved: number;
  interestSaved: number;
  monthlyInterestFirst: number;
  monthlyPrincipalFirst: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateRv(i: RvInputs): PaymentResult {
  const blank = (): PaymentResult => ({
    monthly: 0,
    monthlyTotal: 0,
    financed: 0,
    totalInterest: 0,
    totalCost: 0,
    interestShare: 0,
    taxAmount: 0,
    months: 0,
    payoffMonths: 0,
    monthsSaved: 0,
    interestSaved: 0,
    monthlyInterestFirst: 0,
    monthlyPrincipalFirst: 0,
    breakdown: [],
  });

  const nums = [i.price, i.downPct, i.tradeIn, i.rate, i.termYears, i.salesTaxPct, i.fees, i.extraMonthly, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank();
  if (i.price <= 0 || i.price > 5000000) return blank();
  if (i.downPct < 0 || i.downPct > 100) return blank();
  if (i.tradeIn < 0) return blank();
  if (i.rate <= 0 || i.rate > 36) return blank();
  if (i.termYears < 1 || i.termYears > 20) return blank();
  if (i.salesTaxPct < 0 || i.salesTaxPct > 15) return blank();
  if (i.fees < 0) return blank();
  if (i.extraMonthly < 0) return blank();

  const months = Math.round(i.termYears * 12);
  const r = i.rate / 100 / 12;
  const taxAmount = i.price * (i.salesTaxPct / 100);
  const down = i.price * (i.downPct / 100);
  const financed = Math.max(0, i.price + taxAmount + i.fees - down - i.tradeIn);

  const monthly = financed > 0 ? (financed * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1) : 0;
  const monthlyTotal = monthly + i.extraMonthly;
  const totalInterest = monthly * months - financed;
  const totalCost = i.price + taxAmount + i.fees + totalInterest;

  // months to pay off with the extra payment, using the closed-form amortisation identity
  let payoffMonths = months;
  if (financed > 0 && monthlyTotal > monthly) {
    payoffMonths = Math.ceil(-Math.log(1 - (r * financed) / monthlyTotal) / Math.log(1 + r));
  }
  const monthsSaved = Math.max(0, months - payoffMonths);
  const interestSaved = Math.max(0, totalInterest - (monthlyTotal * payoffMonths - financed));

  const monthlyInterestFirst = financed * r;
  const monthlyPrincipalFirst = monthly - monthlyInterestFirst;
  const interestShare = totalCost > 0 ? (totalInterest / totalCost) * 100 : 0;

  const breakdown = [
    { label: "RV purchase price", value: money(i.price) },
    { label: `Sales tax at ${fmt(i.salesTaxPct, 2)}%`, value: money(taxAmount) },
    { label: "Tax, title and dealer fees", value: money(i.fees) },
    { label: `Down payment (${fmt(i.downPct, 0)}%)`, value: "−" + money(down) },
    i.tradeIn > 0
      ? { label: "Trade-in credit", value: "−" + money(i.tradeIn), highlight: true }
      : { label: "Trade-in credit", value: "$0.00" },
    { label: "Amount financed", value: money(financed), highlight: true },
    { label: `First month interest at ${fmt(i.rate, 2)}% APR`, value: money(monthlyInterestFirst) },
    { label: "First month principal", value: money(monthlyPrincipalFirst) },
    { label: `Scheduled interest over ${months} months`, value: money(totalInterest) },
    { label: "Total cost of the RV", value: money(totalCost), highlight: true },
  ];

  return {
    monthly,
    monthlyTotal,
    financed,
    totalInterest,
    totalCost,
    interestShare,
    taxAmount,
    months,
    payoffMonths,
    monthsSaved,
    interestSaved,
    monthlyInterestFirst,
    monthlyPrincipalFirst,
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

export default function RvLoanPaymentCalculator() {
  const [price, setPrice] = useState(String(DEFAULTS.price));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [tradeIn, setTradeIn] = useState(String(DEFAULTS.tradeIn));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [salesTaxPct, setSalesTaxPct] = useState(String(DEFAULTS.salesTaxPct));
  const [fees, setFees] = useState(String(DEFAULTS.fees));
  const [extraMonthly, setExtraMonthly] = useState(String(DEFAULTS.extraMonthly));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RvInputs => ({
    price: parseFloat(price) || 0,
    downPct: parseFloat(downPct) || 0,
    tradeIn: parseFloat(tradeIn) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
    salesTaxPct: parseFloat(salesTaxPct) || 0,
    fees: parseFloat(fees) || 0,
    extraMonthly: parseFloat(extraMonthly) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<RvInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PaymentResult>(() => calculateRv(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateRv(inputs));
  };

  const reset = () => {
    setPrice(String(DEFAULTS.price));
    setDownPct(String(DEFAULTS.downPct));
    setTradeIn(String(DEFAULTS.tradeIn));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setSalesTaxPct(String(DEFAULTS.salesTaxPct));
    setFees(String(DEFAULTS.fees));
    setExtraMonthly(String(DEFAULTS.extraMonthly));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateRv(DEFAULTS));
  };

  const priceNum = parseFloat(price);
  const rateNum = parseFloat(rate);

  const errors = {
    price: !Number.isFinite(priceNum) || priceNum <= 0 ? "Enter the RV price" : "",
    rate: !Number.isFinite(rateNum) || rateNum <= 0 || rateNum > 36 ? "Enter 0.1–36% APR" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How long can you finance an RV?",
      answer:
        "RV loans run far longer than car loans because the amounts are larger, with 10 to 15 year terms common on new motorhomes and 20 year terms available on high-value diesel pushers through specialist lenders. The trade-off is interest: at 8.5% APR, stretching a $85,000 loan from 10 to 15 years cuts the payment by about $290 a month but adds roughly $18,000 in interest over the life of the loan. Many buyers take the long term for cash-flow safety and then make voluntary extra payments, which is exactly what the extra-payment field in this calculator models.",
    },
    {
      question: "Does an RV loan work like a mortgage or like a car loan?",
      answer:
        "Mechanically it is an amortising instalment loan like a car loan — same monthly payment formula, interest front-loaded, title held by the lender until payoff. Where RV lending differs is in underwriting: lenders often treat the unit as a second-home-qualifying asset if it has cooking, sleeping and toilet facilities, which can open slightly better rates than a plain consumer loan. But RVs depreciate quickly in the first years, so borrowers who roll taxes, fees and negative trade equity into the loan can end up owing more than the RV is worth for a long stretch.",
    },
    {
      question: "How much should I put down on an RV?",
      answer:
        "Lenders typically ask for 10 to 20% down, and putting more down reduces both the payment and the total interest proportionally. The deeper reason to go beyond the minimum is depreciation: a new RV can lose 20% or more of its value in the first two years, so a 10% down payment plus rolled-in tax and fees can leave the owner underwater until well into the loan. If keeping equity positive matters to you, model 20% down and compare the payoff months against the 10% case in the breakdown table.",
    },
    {
      question: "Is it better to pay extra each month or take a shorter term?",
      answer:
        "Mathematically they converge on the same result if the extra payment matches the payment difference of the shorter term — the interest saved is nearly identical. The practical differences are flexibility and rate: extra payments on a longer term keep the contractual payment low, so a hard month does not break the budget, while the shorter term locks in the higher payment and sometimes a better rate. Run both through the calculator: the extra-payment field shows the payoff month and interest saved directly against the scheduled term.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "RV Loan Payment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">RV Loan Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="RV & Payment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="price"
                  label="RV Price"
                  value={price}
                  onChange={setPrice}
                  onEnter={runCalculate}
                  min="1000"
                  max="5000000"
                  step="500"
                  suffix="$"
                  error={errors.price}
                  hint="Out-the-door price before tax and fees."
                  tooltip="Purchase price of the motorhome, travel trailer or fifth wheel."
                />
                <CompactInput
                  id="down"
                  label="Down Payment"
                  value={downPct}
                  onChange={setDownPct}
                  onEnter={runCalculate}
                  min="0"
                  max="100"
                  step="1"
                  suffix="%"
                  hint="Lenders usually ask 10–20%."
                  tooltip="Down payment as a percentage of the purchase price."
                />
              </div>
            </SubSection>

            <SubSection title="Loan Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  min="0.1"
                  max="36"
                  step="0.01"
                  suffix="% APR"
                  error={errors.rate}
                  tooltip="Annual percentage rate quoted by the lender."
                />
                <CompactSelect
                  id="term"
                  label="Term"
                  value={termYears}
                  onChange={setTermYears}
                  options={TERM_OPTIONS}
                  tooltip="RV terms run much longer than car loans — 10 to 20 years is common."
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
                  <SubSection title="Tax, Fees & Trade-In">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax"
                        label="Sales Tax"
                        value={salesTaxPct}
                        onChange={setSalesTaxPct}
                        onEnter={runCalculate}
                        min="0"
                        max="15"
                        step="0.25"
                        suffix="%"
                        tooltip="State and local sales tax applied to the purchase price."
                      />
                      <CompactInput
                        id="fees"
                        label="Title & Dealer Fees"
                        value={fees}
                        onChange={setFees}
                        onEnter={runCalculate}
                        min="0"
                        step="50"
                        suffix="$"
                        tooltip="Registration, title, documentation and any dealer add-ons rolled into the loan."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="trade"
                        label="Trade-In Value"
                        value={tradeIn}
                        onChange={setTradeIn}
                        onEnter={runCalculate}
                        min="0"
                        step="500"
                        suffix="$"
                        tooltip="Net trade credit applied after any payoff balance on the current loan."
                      />
                      <CompactInput
                        id="extra"
                        label="Extra Monthly"
                        value={extraMonthly}
                        onChange={setExtraMonthly}
                        onEnter={runCalculate}
                        min="0"
                        step="25"
                        suffix="$"
                        hint="Voluntary extra principal."
                        tooltip="Additional amount paid every month on top of the scheduled payment."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places shown on money figures."
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
            {!results.financed && results.breakdown.length === 0 && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">Enter a valid price and rate to price the loan.</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.monthlyTotal)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.monthsSaved > 0
                  ? `Includes $${fmt(calcInputs.extraMonthly, 0)} extra — pays off ${fmt(results.monthsSaved, 0)} months early and saves ${money(results.interestSaved)} in interest`
                  : `${money(results.monthly)} scheduled payment · ${fmt(results.months, 0)} months at ${fmt(calcInputs.rate, 2)}% APR`}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Amount Financed</span>
                <span className="font-extrabold text-foreground">{money(results.financed)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">{money(results.totalInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-foreground">{money(results.totalCost)}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Loan Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Amount</th>
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
                    <td className="p-2.5 pl-3 text-foreground">Interest as share of total cost</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.interestShare, 1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scheduled payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthly)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Term</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.termYears, 0)} years ({fmt(results.months, 0)} months)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sales tax added</span>
                  <span className="text-base font-bold text-foreground">{money(results.taxAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First month interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.monthlyInterestFirst)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff with extra</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSaved > 0
                      ? `${fmt(results.payoffMonths, 0)} months (−${fmt(results.monthsSaved, 0)})`
                      : `${fmt(results.months, 0)} months`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest saved by extra</span>
                  <span className="text-base font-bold text-foreground">
                    {results.monthsSaved > 0 ? money(results.interestSaved) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an RV Loan Payment Calculator?</h2>
            <p>
              An RV loan payment calculator works out the monthly payment on a motorhome, travel trailer or fifth wheel loan from the
              price, down payment, trade-in credit, sales tax, fees, interest rate and term. It uses the standard amortising instalment
              formula, so the payment it produces is the same one a lender will quote for a fixed-rate RV loan: interest is charged on
              the declining balance, the payment stays level, and the split between interest and principal shifts over the years.
            </p>
            <p>
              What makes RV lending different from ordinary car finance is the scale of the numbers. Loans routinely run from $50,000 to
              well over $200,000, terms stretch to 15 or even 20 years, and the taxes, titling and dealer fees rolled into the deal can
              add thousands. Those inputs matter more here than in almost any other consumer loan, which is why the calculator models
              them explicitly rather than hiding them behind the sticker price.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The financing amount is built up step by step: the purchase price plus sales tax plus fees, minus the down payment and the
              trade-in credit. That figure is the amount financed, and the monthly payment follows from the classic annuity formula — the
              balance multiplied by the monthly rate and a compounding factor that depends only on the term. Interest in the first month
              is simply the balance times the monthly rate, which is why the earliest payments are almost entirely interest on a long
              RV loan.
            </p>
            <p>
              Total interest over the life of the loan is the scheduled payment multiplied by the number of months, minus the amount
              financed. The total cost of the RV adds that interest back onto the price, tax and fees, and the interest share expresses
              it as a percentage — a figure that routinely reaches a quarter of the whole outlay on 15-year terms, which surprises
              buyers who negotiated hard on the sticker price and then ignored the financing side.
            </p>
            <p>
              The extra-payment field applies a closed-form identity: if you pay more than the scheduled amount every month, the payoff
              time shortens according to a logarithm of the payment ratio, and the interest saved is the difference between scheduled and
              accelerated totals. Because extra payments attack principal directly, a modest $150 a month on a typical 15-year RV loan
              removes years from the payoff and five figures of interest, as the breakdown table shows side by side.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the monthly payment, including any extra you entered, with the early-payoff effect called out
              underneath. The three-stat bar carries the amount financed, total interest and total cost — the three numbers to compare
              across lender offers. The breakdown table walks the deal from price to total cost, including first-month interest versus
              principal, and the summary panel lists the scheduled payment, term, tax, payoff months with extra payments and interest
              saved.
            </p>
            <p>
              Read the interest share against the term: if it is above 30%, the loan is doing more work than the RV is worth stretching
              for, and either a bigger down payment or a shorter term usually beats negotiating another $2,000 off the price. Compare
              offers by total cost rather than monthly payment — the lowest payment on the longest term is almost always the most
              expensive way to buy the same rig, and the calculator makes that trade visible before you sign.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rv-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/rv-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
