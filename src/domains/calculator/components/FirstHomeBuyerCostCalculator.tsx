"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BuyerInputs {
  price: number;
  downPct: number;
  rate: number;
  years: number;
  closingPct: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  pmiRate: number;
}

const DEFAULTS: BuyerInputs = {
  price: 350000,
  downPct: 10,
  rate: 6.5,
  years: 30,
  closingPct: 2.5,
  propertyTax: 4200,
  insurance: 1500,
  hoa: 0,
  pmiRate: 0.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function paymentFor(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0) return 0;
  if (monthlyRate <= 0) return principal / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * f) / (f - 1);
}

interface BuyerResult {
  downPayment: number;
  loanAmount: number;
  ltv: number;
  closingCosts: number;
  cashAtClosing: number;
  principalInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  totalMonthly: number;
  pmiApplies: boolean;
  totalMonthlyWithReserve: number;
  valid: boolean;
  errorMsg: string;
}

function computeBuyer(i: BuyerInputs): BuyerResult {
  const invalid = i.price <= 0 || i.downPct < 0 || i.downPct >= 100 || i.rate < 0 || i.years <= 0 || i.closingPct < 0;

  const downPayment = (i.price * i.downPct) / 100;
  const loanAmount = i.price - downPayment;
  const ltv = i.price > 0 ? (loanAmount / i.price) * 100 : 0;
  const closingCosts = (i.price * i.closingPct) / 100;
  const n = Math.round(i.years * 12);
  const principalInterest = paymentFor(loanAmount, i.rate / 100 / 12, n);
  const monthlyTax = i.propertyTax / 12;
  const monthlyInsurance = i.insurance / 12;
  const pmiApplies = ltv > 80 && loanAmount > 0;
  const monthlyPmi = pmiApplies ? (loanAmount * i.pmiRate) / 100 / 12 : 0;
  const monthlyHoa = i.hoa;
  const totalMonthly = principalInterest + monthlyTax + monthlyInsurance + monthlyPmi + monthlyHoa;

  return {
    downPayment,
    loanAmount,
    ltv,
    closingCosts,
    cashAtClosing: downPayment + closingCosts,
    principalInterest,
    monthlyTax,
    monthlyInsurance,
    monthlyPmi,
    monthlyHoa,
    totalMonthly,
    pmiApplies,
    totalMonthlyWithReserve: totalMonthly * 1.1,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive purchase price and term, a down payment between 0 and 100%, and non-negative rates and costs."
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

export default function FirstHomeBuyerCostCalculator() {
  const [price, setPrice] = useState(String(DEFAULTS.price));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [closingPct, setClosingPct] = useState(String(DEFAULTS.closingPct));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULTS.propertyTax));
  const [insurance, setInsurance] = useState(String(DEFAULTS.insurance));
  const [hoa, setHoa] = useState(String(DEFAULTS.hoa));
  const [pmiRate, setPmiRate] = useState(String(DEFAULTS.pmiRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BuyerInputs => ({
    price: parseFloat(price) || 0,
    downPct: parseFloat(downPct) || 0,
    rate: parseFloat(rate) || 0,
    years: parseFloat(years) || 0,
    closingPct: parseFloat(closingPct) || 0,
    propertyTax: parseFloat(propertyTax) || 0,
    insurance: parseFloat(insurance) || 0,
    hoa: parseFloat(hoa) || 0,
    pmiRate: parseFloat(pmiRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<BuyerInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BuyerResult>(() => computeBuyer(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeBuyer(inputs));
  };

  const reset = () => {
    setPrice(String(DEFAULTS.price));
    setDownPct(String(DEFAULTS.downPct));
    setRate(String(DEFAULTS.rate));
    setYears(String(DEFAULTS.years));
    setClosingPct(String(DEFAULTS.closingPct));
    setPropertyTax(String(DEFAULTS.propertyTax));
    setInsurance(String(DEFAULTS.insurance));
    setHoa(String(DEFAULTS.hoa));
    setPmiRate(String(DEFAULTS.pmiRate));
    setCalcInputs(DEFAULTS);
    setResults(computeBuyer(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much cash does a first-time buyer actually need?",
      answer:
        "More than the down payment. The cash needed at closing is the down payment plus closing costs, which typically run two to five percent of the purchase price and cover lender origination fees, appraisal, title insurance, recording fees, prepaid property taxes and first-year homeowners insurance. First-time buyer programmes and some loan types allow lower down payments, but closing costs almost always apply. This calculator adds the two so the figure you need in the bank is realistic rather than optimistic.",
    },
    {
      question: "What is the minimum down payment for a first home?",
      answer:
        "It depends on the loan programme. Conventional loans often allow as little as three percent down, FHA loans typically require a minimum of three and a half percent, and VA and USDA loans can allow zero down for eligible buyers. Putting less than twenty percent down usually means paying private mortgage insurance until the loan-to-value ratio falls far enough, so the lower down payment trades upfront cash for a recurring monthly cost.",
    },
    {
      question: "Why is my monthly payment higher than the loan payment?",
      answer:
        "Because a mortgage payment is more than principal and interest. Lenders collect property taxes and homeowners insurance monthly into an escrow account, and if your down payment is below twenty percent you also pay private mortgage insurance. Add any homeowners association dues and the total is often several hundred dollars above the principal-and-interest figure. The breakdown in this calculator shows each component separately.",
    },
    {
      question: "When does private mortgage insurance go away?",
      answer:
        "PMI is generally required when the loan-to-value ratio exceeds eighty percent. It drops off when you have paid the balance down enough to reach that threshold, either through scheduled payments or by requesting cancellation once you can document that the home has appreciated. Appreciation can accelerate the process, so a new appraisal a few years after purchase is often worthwhile. The calculator flags whether PMI applies to your current inputs.",
    },
    {
      question: "Should I put down as much as I can afford?",
      answer:
        "Not necessarily. A larger down payment lowers the loan, the monthly payment and the interest, and it may remove PMI, but it also drains the cash you would otherwise keep as an emergency reserve. Most advisers suggest holding back enough to cover several months of expenses, because a home will generate unexpected repair costs in the first year. Enter different down payment percentages to see how the cash-at-closing and monthly figures trade off.",
    },
  ];

  const breakdownRows = [
    { label: "Principal & Interest", monthly: `$${fmt(results.principalInterest)}`, note: `${fmt(calcInputs.years, 0)}-yr loan` },
    { label: "Property Tax", monthly: `$${fmt(results.monthlyTax)}`, note: `$${fmt(calcInputs.propertyTax, 0)}/yr escrowed` },
    { label: "Home Insurance", monthly: `$${fmt(results.monthlyInsurance)}`, note: `$${fmt(calcInputs.insurance, 0)}/yr escrowed` },
    {
      label: "Private Mortgage Insurance",
      monthly: `$${fmt(results.monthlyPmi)}`,
      note: results.pmiApplies ? `LTV ${fmt(results.ltv, 1)}%` : "Not required (LTV ≤ 80%)",
    },
    { label: "HOA / Other", monthly: `$${fmt(results.monthlyHoa)}`, note: "Monthly association dues" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "First Home Buyer Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          First Home Buyer Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Purchase">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="price"
                  label="Purchase Price"
                  value={price}
                  onChange={setPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Agreed purchase price of the home."
                />
                <CompactInput
                  id="down"
                  label="Down Payment"
                  value={downPct}
                  onChange={setDownPct}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.5"
                  tooltip="Percentage of the price paid in cash."
                />
              </div>
            </SubSection>

            <SubSection title="Financing">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Fixed mortgage rate."
                />
                <CompactInput
                  id="years"
                  label="Loan Term"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Amortisation term in years."
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
                  <SubSection title="Closing & Carrying Costs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="closing"
                        label="Closing Costs"
                        value={closingPct}
                        onChange={setClosingPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        min="0"
                        tooltip="Settlement charges as a percentage of the purchase price."
                      />
                      <CompactInput
                        id="pmi-rate"
                        label="PMI Rate"
                        value={pmiRate}
                        onChange={setPmiRate}
                        onEnter={runCalculate}
                        suffix="%/yr"
                        step="0.05"
                        min="0"
                        tooltip="Annual private mortgage insurance rate when LTV exceeds 80%."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Escrow & Dues">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax"
                        label="Property Tax / yr"
                        value={propertyTax}
                        onChange={setPropertyTax}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Annual property tax collected monthly in escrow."
                      />
                      <CompactInput
                        id="insurance"
                        label="Insurance / yr"
                        value={insurance}
                        onChange={setInsurance}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Annual homeowners insurance."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="hoa"
                        label="HOA / mo"
                        value={hoa}
                        onChange={setHoa}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly homeowners association dues, if any."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          LTV: {fmt(results.ltv, 1)}%
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Cash Needed at Closing</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.cashAtClosing, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                ${fmt(results.downPayment, 0)} down plus ${fmt(results.closingCosts, 0)} in closing costs
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Monthly</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalMonthly, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Loan Amount</span>
                <span className="font-extrabold text-foreground">${fmt(results.loanAmount, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">PMI</span>
                <span className="font-extrabold text-foreground">{results.pmiApplies ? `$${fmt(results.monthlyPmi, 0)}` : "None"}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Monthly Component</th>
                    <th className="p-2.5 text-right w-[110px]">Per Month</th>
                    <th className="p-2.5 pr-3">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.monthly}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Housing Payment</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalMonthly, 0)}</td>
                    <td className="p-2.5 pr-3 text-foreground">P&amp;I + escrow + PMI + HOA</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Purchase Price</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.price, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Down Payment</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.downPayment, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Amount</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.loanAmount, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan-to-Value</span>
                  <span className="text-base font-bold text-primary">{fmt(results.ltv, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Closing Costs</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.closingCosts, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cash at Closing</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.cashAtClosing, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Income Needed (30% rule)</span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt((results.totalMonthly * 12) / 0.3, 0)}/yr
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment + 10% buffer</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalMonthlyWithReserve, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a First Home Buyer Cost Calculator?</h2>
            <p>
              A first home buyer cost calculator totals both halves of the cost of buying a first home: the cash you must
              bring to closing, and the monthly payment you will carry afterwards. First-time buyers routinely budget for
              a down payment and are surprised by closing costs, escrow set-up, and insurance, which together can add
              thousands to the amount needed on settlement day. The calculator exists to make that full picture visible
              before you make an offer rather than after.
            </p>
            <p>
              It also separates the monthly payment into its real components. The principal-and-interest figure that
              lenders advertise is only part of the obligation: property taxes and homeowners insurance are collected
              monthly into escrow, private mortgage insurance applies whenever the down payment is below twenty percent,
              and association dues add further where they exist. Seeing each piece makes it obvious how much of the
              payment is equity and how much is fixed cost.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The down payment is the purchase price multiplied by your chosen percentage, and the loan amount is what
              remains. The monthly principal-and-interest payment comes from the amortisation formula
              PMT = P x r / (1 - (1 + r)^-n). Property tax and insurance are divided by twelve, private mortgage insurance
              is calculated as an annual percentage of the loan and divided by twelve when the loan-to-value ratio exceeds
              eighty percent, and association dues are added as entered.
            </p>
            <p>
              Closing costs are estimated as a percentage of the purchase price, which keeps the figure realistic across
              different markets; typical settlement charges land between two and five percent. Cash needed at closing is
              the down payment plus those closing costs. The calculator also reports the loan-to-value ratio, which is what
              determines whether mortgage insurance applies, and a conservative income requirement based on the common
              guideline that housing should consume no more than about thirty percent of gross income.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the cash needed at closing, split into down payment and closing costs so you can see
              where the money goes. The three statistics beneath give the total monthly housing payment, the loan amount
              and the monthly mortgage-insurance cost, if any. The breakdown table itemises every monthly component, from
              principal and interest down to association dues, and the final row sums them into the payment you will
              actually make.
            </p>
            <p>
              Summary Statistics adds the purchase price, down payment, loan amount and loan-to-value ratio, plus an income
              requirement based on the thirty-percent guideline and a buffered payment figure to allow for the
              maintenance and repair costs a new owner should expect. Treat the output as a planning estimate: programmes
              for first-time buyers, seller concessions, and lender-specific fee structures all vary, and closing costs in
              particular should be confirmed with a Loan Estimate before you commit. The safest approach is to hold back a
              reserve on top of the cash-at-closing figure, because the first year of ownership reliably produces expenses
              that no closing statement anticipates.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/first-home-buyer-cost-calculator" />
          <PopularCalculators exclude="/calculator/first-home-buyer-cost-calculator" />
        </div>
      </div>
    </>
  );
}
