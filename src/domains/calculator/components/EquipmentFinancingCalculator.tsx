"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface EquipInputs {
  cost: number;
  downPayment: number;
  rate: number;
  termMonths: number;
  feePercent: number;
  residual: number;
  monthlyRevenue: number;
}

const DEFAULTS: EquipInputs = {
  cost: 150000,
  downPayment: 15000,
  rate: 8.5,
  termMonths: 60,
  feePercent: 1.5,
  residual: 0,
  monthlyRevenue: 0,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

const payoffDate = (months: number) => {
  if (!Number.isFinite(months) || months > 720) return "—";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(months));
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

interface EquipResult {
  loanAmount: number;
  fee: number;
  financed: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  effectiveApr: number;
  paybackMonths: number | null;
  monthlyRate: number;
  valid: boolean;
  errorMsg: string;
}

function computeEquip(i: EquipInputs): EquipResult {
  const invalid =
    i.cost <= 0 ||
    i.downPayment < 0 ||
    i.downPayment >= i.cost ||
    i.rate < 0 ||
    i.termMonths <= 0 ||
    i.feePercent < 0 ||
    i.residual < 0;

  const loanAmount = Math.max(0, i.cost - i.downPayment);
  const fee = (loanAmount * i.feePercent) / 100;
  const financed = loanAmount + fee;
  const n = Math.round(i.termMonths);
  const iRate = i.rate / 100 / 12;
  const residual = Math.min(i.residual, financed);

  let monthlyPayment = 0;
  if (n > 0) {
    if (iRate <= 0) {
      monthlyPayment = (financed - residual) / n;
    } else {
      const pvResidual = residual / Math.pow(1 + iRate, n);
      monthlyPayment = ((financed - pvResidual) * iRate) / (1 - Math.pow(1 + iRate, -n));
    }
  }

  const totalPayments = monthlyPayment * n + residual;
  const totalInterest = totalPayments - financed;
  const totalCost = totalPayments + i.downPayment;

  // Effective rate: discount the actual payment stream back to the net cash
  // actually made available by the loan (the cost less the down payment).
  const stream = (r: number) => {
    let pv = 0;
    for (let m = 1; m <= n; m++) pv += monthlyPayment / Math.pow(1 + r, m);
    pv += residual / Math.pow(1 + r, n);
    return pv;
  };
  let lo = 0;
  let hi = 1;
  if (stream(hi) > loanAmount) {
    for (let k = 0; k < 120; k++) {
      const mid = (lo + hi) / 2;
      if (stream(mid) > loanAmount) lo = mid;
      else hi = mid;
    }
  }
  const monthlyRate = (lo + hi) / 2;
  const effectiveApr = monthlyRate * 12 * 100;

  const paybackMonths =
    i.monthlyRevenue > 0 ? Math.ceil((i.cost - i.downPayment) / i.monthlyRevenue) : null;

  return {
    loanAmount,
    fee,
    financed,
    monthlyPayment,
    totalPayments,
    totalInterest,
    totalCost,
    effectiveApr,
    paybackMonths,
    monthlyRate,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive equipment cost, a down payment below the cost, and a positive rate and term."
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

export default function EquipmentFinancingCalculator() {
  const [cost, setCost] = useState(String(DEFAULTS.cost));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [feePercent, setFeePercent] = useState(String(DEFAULTS.feePercent));
  const [residual, setResidual] = useState(String(DEFAULTS.residual));
  const [monthlyRevenue, setMonthlyRevenue] = useState(String(DEFAULTS.monthlyRevenue));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): EquipInputs => ({
    cost: parseFloat(cost) || 0,
    downPayment: parseFloat(downPayment) || 0,
    rate: parseFloat(rate) || 0,
    termMonths: parseFloat(termMonths) || 0,
    feePercent: parseFloat(feePercent) || 0,
    residual: parseFloat(residual) || 0,
    monthlyRevenue: parseFloat(monthlyRevenue) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<EquipInputs>(() => DEFAULTS);
  const [results, setResults] = useState<EquipResult>(() => computeEquip(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeEquip(inputs));
  };

  const reset = () => {
    setCost(String(DEFAULTS.cost));
    setDownPayment(String(DEFAULTS.downPayment));
    setRate(String(DEFAULTS.rate));
    setTermMonths(String(DEFAULTS.termMonths));
    setFeePercent(String(DEFAULTS.feePercent));
    setResidual(String(DEFAULTS.residual));
    setMonthlyRevenue(String(DEFAULTS.monthlyRevenue));
    setCalcInputs(DEFAULTS);
    setResults(computeEquip(DEFAULTS));
  };

  const faqs = [
    {
      question: "How does equipment financing work?",
      answer:
        "The lender buys the equipment and takes a security interest in it, while you repay the cost plus interest over a fixed term. Approval usually turns on the equipment itself rather than on your general credit history, and terms commonly run from two to seven years depending on how long the asset is expected to remain productive.",
    },
    {
      question: "What is an equipment financing origination fee?",
      answer:
        "It is a charge levied when the loan is written, quoted either as a flat amount or as a percentage of the amount advanced. It is normally added to the financed balance, so you pay interest on it as well. Because the fee increases the financed amount without increasing the cash you actually receive, it raises the true cost above the quoted rate.",
    },
    {
      question: "Why is the effective rate higher than the quoted rate?",
      answer:
        "The quoted rate applies to the financed amount, which already includes the fee, while the cash made available to you is the cost less the down payment. Discounting your actual payments back to that smaller net amount produces a higher rate. Comparing effective rates across offers is the only reliable way to rank them, because fee structures differ.",
    },
    {
      question: "Should I use a balloon or residual structure?",
      answer:
        "A residual reduces the monthly payment because part of the cost is deferred to the end of the term, but it leaves a lump sum due at maturity. That works when the equipment retains predictable value and you intend to refinance, trade in, or return it. If you plan to keep the asset long term, a fully amortising structure avoids the refinancing risk.",
    },
    {
      question: "How do I know whether the equipment pays for itself?",
      answer:
        "Compare the monthly payment against the incremental revenue or cost saving the equipment generates. If the asset produces more per month than it costs, the payback period shown here tells you how many months of that benefit are needed to recover the cash invested. Include maintenance, insurance and operator time, not just the loan payment.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Equipment Financing Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Equipment Financing Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Equipment & Financing">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="cost"
                  label="Equipment Cost"
                  value={cost}
                  onChange={setCost}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Purchase price of the equipment, excluding tax and delivery."
                />
                <CompactInput
                  id="down"
                  label="Down Payment"
                  value={downPayment}
                  onChange={setDownPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Cash paid upfront, which reduces the amount financed."
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
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Quoted annual rate on the financing."
                />
                <CompactInput
                  id="term"
                  label="Term"
                  value={termMonths}
                  onChange={setTermMonths}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="1"
                  tooltip="Number of monthly payments."
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
                  <SubSection title="Fees & Structure">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="fee"
                        label="Origination Fee"
                        value={feePercent}
                        onChange={setFeePercent}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.25"
                        tooltip="Fee charged on the amount advanced, added to the balance."
                      />
                      <CompactInput
                        id="residual"
                        label="Residual / Balloon"
                        value={residual}
                        onChange={setResidual}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Amount deferred to the end of the term. Enter 0 for full amortisation."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Productivity">
                    <CompactInput
                      id="revenue"
                      label="Monthly Revenue from Equipment"
                      value={monthlyRevenue}
                      onChange={setMonthlyRevenue}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Incremental monthly revenue or cost saving. Enter 0 to skip the payback calculation."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.monthlyPayment)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.financed)} financed over {Math.round(calcInputs.termMonths)} months
                {calcInputs.residual > 0 ? ` \u00b7 ${money(calcInputs.residual)} due at maturity` : ""}
              </div>
            </div>

            {/* 3-STAT BAR */}
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective APR</span>
                <span className="font-extrabold text-primary">{fmt(results.effectiveApr, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[100px]">% of Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Equipment Cost</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.cost)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">100.0%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Down Payment</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.downPayment)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.cost > 0 ? (calcInputs.downPayment / calcInputs.cost) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Loan Amount</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.loanAmount)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.cost > 0 ? (results.loanAmount / calcInputs.cost) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">
                      Origination Fee ({fmt(calcInputs.feePercent, 2)}%)
                    </td>
                    <td className="p-2.5 text-right text-foreground">{money(results.fee)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.cost > 0 ? (results.fee / calcInputs.cost) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Amount Financed</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.financed)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.cost > 0 ? (results.financed / calcInputs.cost) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total Interest</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalInterest)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.cost > 0 ? (results.totalInterest / calcInputs.cost) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Cost of Ownership</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalCost)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(calcInputs.cost > 0 ? (results.totalCost / calcInputs.cost) * 100 : 0, 1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equipment Cost</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.cost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Amount Financed</span>
                  <span className="text-base font-bold text-foreground">{money(results.financed)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Payment</span>
                  <span className="text-base font-bold text-primary">{money(results.monthlyPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Date</span>
                  <span className="text-base font-bold text-foreground">{payoffDate(calcInputs.termMonths)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Cost of Ownership</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveApr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Revenue Payback</span>
                  <span className="text-base font-bold text-foreground">
                    {results.paybackMonths !== null ? `${results.paybackMonths} mo` : "Set revenue"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Equipment Financing Calculator?</h2>
            <p>
              An equipment financing calculator turns the price of a machine, vehicle or system into the monthly payment a
              lender will require, and then shows what the asset costs in total once interest and fees are counted. Because
              the equipment itself secures the loan, approval and pricing often depend more on the asset's value and useful
              life than on the borrower's general credit profile.
            </p>
            <p>
              The figures that matter are not the rate alone. Origination fees are frequently added to the financed balance,
              which means interest is charged on them as well, and a residual or balloon structure lowers the monthly
              payment while leaving a lump sum due at the end. Comparing offers therefore requires an effective rate that
              accounts for fees and timing together.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Payment Is Calculated</h2>
            <p>
              The loan amount is the equipment cost less the down payment, and the origination fee is applied to that
              amount and added to the balance to give the figure actually financed. The monthly payment then comes from the
              standard amortisation formula: the financed amount, less the residual discounted to present value, multiplied
              by the monthly rate, divided by one minus the quantity one plus the monthly rate raised to the negative number
              of payments. With no residual the formula reduces to an ordinary fully amortising loan.
            </p>
            <p>
              The effective annual rate is derived separately. Rather than trusting the quoted figure, the calculator
              discounts the actual payment stream, including any residual, back to the net cash the borrower effectively
              receives, and searches for the rate that makes the two equal. Because the fee inflates the financed balance
              without adding cash to the borrower, the effective rate always exceeds the quoted one.
            </p>
            <p>
              Equipment finance differs from a general-purpose loan in three ways that matter to the arithmetic. The asset itself
              is the collateral, so lenders price against its liquidation value as well as your credit, which usually means a
              better rate on titled, serial-numbered machinery than an unsecured facility would carry but also a tighter limit on
              the term, because the loan rarely outlives a sensible fraction of the equipment's working life. Origination fees are
              quoted as a proportion of the loan rather than a flat cost, so their effect scales with the amount financed and lands
              directly in the effective rate. And many agreements carry end-of-term options — a one-dollar buyout, a fair-market
              value purchase, or a return — with the residual field modelling the second of those.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the monthly payment with the amount financed and, where a residual applies, the sum
              due at maturity. The three statistics beside it show the amount financed, total interest and the effective
              annual rate. The breakdown table itemises the equipment cost, down payment, loan amount, origination fee,
              financed balance, interest and total cost of ownership, each expressed as a percentage of the purchase price
              for easy comparison between offers.
            </p>
            <p>
              Summary Statistics adds the payoff date and, when a monthly revenue figure is supplied, the number of months
              the equipment needs to recover its cost. Judge the deal on that last number alongside the effective rate: an
              asset that pays for itself well inside its useful life can justify a higher rate than one with thin margins.
              Remember to add maintenance, insurance and operator costs to the monthly payment before deciding.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/equipment-financing-calculator" />
          <PopularCalculators exclude="/calculator/equipment-financing-calculator" />
        </div>
      </div>
    </>
  );
}
