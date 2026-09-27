"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PitiInputs {
  homePrice: number;
  downPercent: number;
  rate: number;
  termYears: number;
  annualTax: number;
  annualInsurance: number;
  hoa: number;
  pmiRate: number;
}

const DEFAULTS: PitiInputs = {
  homePrice: 400000,
  downPercent: 10,
  rate: 6.5,
  termYears: 30,
  annualTax: 6000,
  annualInsurance: 1800,
  hoa: 75,
  pmiRate: 0.55,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface PitiResult {
  loanAmount: number;
  downPayment: number;
  ltv: number;
  months: number;
  principalInterest: number;
  taxMonthly: number;
  insuranceMonthly: number;
  hoaMonthly: number;
  pmiMonthly: number;
  totalMonthly: number;
  totalInterest: number;
  totalPaid: number;
  firstYearCost: number;
  valid: boolean;
  errorMsg: string;
}

function computePiti(i: PitiInputs): PitiResult {
  const invalid =
    i.homePrice <= 0 ||
    i.downPercent < 0 ||
    i.downPercent >= 100 ||
    i.rate < 0 ||
    i.termYears <= 0 ||
    i.annualTax < 0 ||
    i.annualInsurance < 0 ||
    i.hoa < 0;

  const downPayment = i.homePrice * (i.downPercent / 100);
  const loanAmount = Math.max(0, i.homePrice - downPayment);
  const ltv = i.homePrice > 0 ? (loanAmount / i.homePrice) * 100 : 0;
  const months = Math.round(i.termYears * 12);

  const principalInterest = payment(loanAmount, i.rate, months);
  const taxMonthly = i.annualTax / 12;
  const insuranceMonthly = i.annualInsurance / 12;
  const hoaMonthly = i.hoa;
  const pmiMonthly = ltv > 80 && !invalid ? (loanAmount * (i.pmiRate / 100)) / 12 : 0;

  const totalMonthly = principalInterest + taxMonthly + insuranceMonthly + hoaMonthly + pmiMonthly;
  const totalInterest = principalInterest * months - loanAmount;

  return {
    loanAmount,
    downPayment,
    ltv,
    months,
    principalInterest,
    taxMonthly,
    insuranceMonthly,
    hoaMonthly,
    pmiMonthly,
    totalMonthly,
    totalInterest,
    totalPaid: loanAmount + totalInterest,
    firstYearCost: totalMonthly * 12,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive home price, a down payment between 0% and 99%, and a positive loan term."
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

export default function PitiPaymentCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPercent, setDownPercent] = useState(String(DEFAULTS.downPercent));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [annualTax, setAnnualTax] = useState(String(DEFAULTS.annualTax));
  const [annualInsurance, setAnnualInsurance] = useState(String(DEFAULTS.annualInsurance));
  const [hoa, setHoa] = useState(String(DEFAULTS.hoa));
  const [pmiRate, setPmiRate] = useState(String(DEFAULTS.pmiRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PitiInputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPercent: parseFloat(downPercent) || 0,
    rate: parseFloat(rate) || 0,
    termYears: parseFloat(termYears) || 0,
    annualTax: parseFloat(annualTax) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0,
    hoa: parseFloat(hoa) || 0,
    pmiRate: parseFloat(pmiRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<PitiInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PitiResult>(() => computePiti(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePiti(inputs));
  };

  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPercent(String(DEFAULTS.downPercent));
    setRate(String(DEFAULTS.rate));
    setTermYears(String(DEFAULTS.termYears));
    setAnnualTax(String(DEFAULTS.annualTax));
    setAnnualInsurance(String(DEFAULTS.annualInsurance));
    setHoa(String(DEFAULTS.hoa));
    setPmiRate(String(DEFAULTS.pmiRate));
    setCalcInputs(DEFAULTS);
    setResults(computePiti(DEFAULTS));
  };

  const faqs = [
    {
      question: "What does PITI stand for?",
      answer:
        "PITI is principal, interest, taxes and insurance. Principal is the portion of the payment that reduces the loan balance, interest is the lender's charge on the outstanding balance, taxes are the property tax collected in escrow each month, and insurance covers the homeowners policy. Many lenders extend the acronym to include association dues and mortgage insurance, which is why the calculator lists every component separately rather than hiding them inside one figure.",
    },
    {
      question: "Why does my mortgage payment differ from the loan payment?",
      answer:
        "The loan payment quoted by a lender usually covers principal and interest only. The amount you actually send each month also funds the escrow account that pays property taxes and homeowners insurance, and it may include homeowners association dues and private mortgage insurance. Those additional items commonly add thirty to forty percent on top of the principal and interest figure, so the escrow-inclusive number is the one to budget against.",
    },
    {
      question: "When is private mortgage insurance required?",
      answer:
        "Private mortgage insurance is normally required whenever the loan exceeds eighty percent of the property value, which corresponds to a down payment below twenty percent. The calculator applies it automatically once loan-to-value rises above that threshold and removes it at or below it. The premium is usually quoted as an annual percentage of the loan amount and is charged monthly until the balance amortises down or the borrower requests removal.",
    },
    {
      question: "How are property taxes and insurance estimated?",
      answer:
        "Lenders divide the annual property tax bill by twelve and add that amount to each monthly payment, then do the same with the annual insurance premium. The actual figures depend on the assessed value, the local tax rate and the coverage you choose. Because the escrow account is only an estimate, a shortfall or surplus is reconciled once a year and the monthly escrow portion is adjusted accordingly.",
    },
    {
      question: "Does a larger down payment always lower the monthly payment?",
      answer:
        "It lowers the loan amount, so principal and interest fall, and once loan-to-value drops to eighty percent or below the mortgage insurance premium disappears entirely. The tax and insurance components are tied to the property rather than the loan, so they do not change. Reducing the loan also cuts the total interest paid over the life of the loan, which is often a larger saving than the monthly difference suggests.",
    },
  ];

  const share = (v: number) => (results.totalMonthly > 0 ? (v / results.totalMonthly) * 100 : 0);

  const breakdownRows = [
    { label: "Principal & Interest", monthly: results.principalInterest, pct: share(results.principalInterest) },
    { label: "Property Taxes", monthly: results.taxMonthly, pct: share(results.taxMonthly) },
    { label: "Homeowners Insurance", monthly: results.insuranceMonthly, pct: share(results.insuranceMonthly) },
    { label: "HOA / Condo Dues", monthly: results.hoaMonthly, pct: share(results.hoaMonthly) },
    {
      label: calcInputs.pmiRate > 0 && results.pmiMonthly > 0 ? `PMI (${fmt(calcInputs.pmiRate, 2)}%/yr)` : "PMI (not required)",
      monthly: results.pmiMonthly,
      pct: share(results.pmiMonthly),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "PITI Payment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          PITI Payment Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Property & Loan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="price"
                  label="Home Price"
                  value={homePrice}
                  onChange={setHomePrice}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Purchase price or appraised value of the property."
                />
                <CompactInput
                  id="down"
                  label="Down Payment"
                  value={downPercent}
                  onChange={setDownPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.5"
                  tooltip="Percentage of the home price paid upfront."
                />
              </div>
            </SubSection>

            <SubSection title="Financing Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Annual interest rate on the mortgage."
                />
                <CompactInput
                  id="term"
                  label="Loan Term"
                  value={termYears}
                  onChange={setTermYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  min="1"
                  tooltip="Length of the loan in years."
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
                  <SubSection title="Escrow & Carrying Costs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax"
                        label="Property Tax / yr"
                        value={annualTax}
                        onChange={setAnnualTax}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Annual property tax bill collected in escrow."
                      />
                      <CompactInput
                        id="insurance"
                        label="Insurance / yr"
                        value={annualInsurance}
                        onChange={setAnnualInsurance}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Annual homeowners insurance premium."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="hoa"
                        label="HOA Dues / mo"
                        value={hoa}
                        onChange={setHoa}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly association or condo dues."
                      />
                      <CompactInput
                        id="pmi"
                        label="PMI Rate"
                        value={pmiRate}
                        onChange={setPmiRate}
                        onEnter={runCalculate}
                        suffix="%/yr"
                        min="0"
                        step="0.05"
                        tooltip="Annual mortgage insurance rate applied when loan-to-value is above 80%."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Total Monthly PITI Payment
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.totalMonthly)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.firstYearCost)} in the first year &middot; loan of {money(results.loanAmount)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Principal & Interest</span>
                <span className="font-extrabold text-foreground">{money(results.principalInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Loan Amount</span>
                <span className="font-extrabold text-foreground">{money(results.loanAmount)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Loan-to-Value</span>
                <span className={`font-extrabold ${results.ltv > 80 ? "text-amber-600" : "text-emerald-600"}`}>
                  {fmt(results.ltv, 1)}%
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Payment Component</th>
                    <th className="p-2.5 text-right w-[110px]">Monthly</th>
                    <th className="p-2.5 pr-3 text-right w-[90px]">% of PITI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.monthly)}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(row.pct, 1)}%</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Monthly PITI</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalMonthly)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Home Price</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.homePrice)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Down Payment</span>
                  <span className="text-base font-bold text-foreground">
                    {money(results.downPayment)} ({fmt(calcInputs.downPercent, 1)}%)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual Escrow Costs</span>
                  <span className="text-base font-bold text-foreground">
                    {money(calcInputs.annualTax + calcInputs.annualInsurance)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Mortgage Insurance</span>
                  <span className="text-base font-bold text-foreground">{money(results.pmiMonthly)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Monthly PITI</span>
                  <span className="text-base font-bold text-primary">{money(results.totalMonthly)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest Over Term</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid Over Term</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payments Remaining</span>
                  <span className="text-base font-bold text-foreground">{results.months}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a PITI Payment Calculator?</h2>
            <p>
              A PITI payment calculator turns a home price, a down payment and a mortgage rate into the full monthly
              housing payment that a lender will expect. PITI stands for principal, interest, taxes and insurance, and it
              is the number underwriters compare against income when they judge affordability. Principal and interest
              cover the loan itself; taxes and insurance are collected monthly in an escrow account so the servicer can pay
              the county and the insurer on your behalf.
            </p>
            <p>
              The distinction between the loan payment and the housing payment matters because the two can differ by
              hundreds of dollars a month. A quoted mortgage payment often reflects principal and interest alone, while the
              amount actually withdrawn from your account also funds escrow and may include association dues and private
              mortgage insurance. Budgeting against the smaller figure is one of the most common reasons a new homeowner
              feels squeezed after closing.
            </p>

            <h2 className="text-2xl font-bold mb-3">How PITI Is Calculated</h2>
            <p>
              The loan amount is the home price minus the down payment, and principal and interest come from the standard
              amortisation formula: the payment equals the loan amount multiplied by the monthly rate, divided by one minus
              the quantity one plus the monthly rate raised to the negative number of payments. A thirty-year loan has
              three hundred and sixty payments, so the monthly rate is the annual rate divided by twelve and the exponent is
              minus three hundred and sixty.
            </p>
            <p>
              The escrow components are simple monthly conversions: the annual property tax bill divided by twelve, and the
              annual insurance premium divided by twelve. Association dues enter as an already-monthly figure. Private
              mortgage insurance is applied only when the loan exceeds eighty percent of the property value, and it is
              computed as the loan amount multiplied by the annual premium rate and divided by twelve. Adding all five
              components produces the full PITI payment, and multiplying by twelve gives the first-year housing cost.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the total monthly PITI payment, with the first-year cost and the loan amount beneath
              it. The three statistics beside it show principal and interest alone, the loan amount, and the loan-to-value
              ratio, which is flagged in amber whenever it exceeds eighty percent because that is the trigger for mortgage
              insurance. The breakdown table lists each component with its dollar amount and its share of the payment, so it
              is easy to see how much of the total is going to the lender rather than the property.
            </p>
            <p>
              Summary Statistics collects the home price, down payment, annual escrow costs, monthly mortgage insurance, the
              total payment, the interest paid over the full term and the total amount repaid. The interest figure is worth
              pausing over: at a typical thirty-year rate the lifetime interest approaches the size of the loan itself.
              Raising the down payment lowers both the loan and, once loan-to-value falls to eighty percent or below, the
              mortgage insurance premium as well, so try a few down payment levels to see how much of the monthly payment
              the mortgage insurance alone is responsible for.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/piti-payment-calculator" />
          <PopularCalculators exclude="/calculator/piti-payment-calculator" />
        </div>
      </div>
    </>
  );
}
