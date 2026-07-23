"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Calendar, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BalloonMortgageInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  balloonTerm: number;
  propertyTax: number;
  homeInsurance: number;
  pmiRate: number;
  downPaymentPercent: number;
  refinanceRate: number;
  refinanceTerm: number;
}

interface BalloonMortgageResults {
  monthlyPI: number;
  monthlyTaxIns: number;
  monthlyPMI: number;
  monthlyTotal: number;
  balloonBalance: number;
  totalInterest: number;
  paymentsBeforeBalloon: number;
  principalPaid: number;
  balloonPaymentDate: string;
  amortizationEndDate: string;
  refinancePayment: number;
  refinanceTotalCost: number;
  refinanceInterestCost: number;
}

const DEFAULTS = {
  loanAmount: "300000",
  interestRate: "6.5",
  loanTerm: "30",
  balloonTerm: "7",
  propertyTax: "3000",
  homeInsurance: "1200",
  pmiRate: "0.5",
  downPaymentPercent: "10",
  refinanceRate: "7.0",
  refinanceTerm: "15",
};

const num = (v: number): number => (isNaN(v) || !isFinite(v) || v < 0 ? 0 : v);

const calculateBalloonMortgage = (inputs: BalloonMortgageInputs): BalloonMortgageResults => {
  const {
    loanAmount: P,
    interestRate,
    loanTerm,
    balloonTerm,
    propertyTax,
    homeInsurance,
    pmiRate,
    downPaymentPercent,
    refinanceRate,
    refinanceTerm,
  } = inputs;

  const safeP = num(P);
  const safeRate = num(interestRate);
  const safeTerm = num(loanTerm);
  const safeBalloon = num(balloonTerm);

  if (safeP <= 0 || safeRate <= 0 || safeTerm <= 0 || safeBalloon <= 0) {
    return {
      monthlyPI: 0,
      monthlyTaxIns: 0,
      monthlyPMI: 0,
      monthlyTotal: 0,
      balloonBalance: 0,
      totalInterest: 0,
      paymentsBeforeBalloon: 0,
      principalPaid: 0,
      balloonPaymentDate: "",
      amortizationEndDate: "",
      refinancePayment: 0,
      refinanceTotalCost: 0,
      refinanceInterestCost: 0,
    };
  }

  const r = (safeRate / 100) / 12;
  const n = Math.round(safeTerm * 12);
  const p = Math.round(safeBalloon * 12);
  const paymentsBeforeBalloon = Math.min(p, n);

  // Standard fully-amortizing monthly payment
  const M = r === 0
    ? safeP / n
    : safeP * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // Remaining balance after p payments (amortization formula)
  const balloonBalance = r === 0
    ? Math.max(0, safeP - M * paymentsBeforeBalloon)
    : safeP * ((Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1));

  const principalPaid = Math.max(0, safeP - balloonBalance);

  // Additional monthly costs
  const monthlyTaxIns = (num(propertyTax) + num(homeInsurance)) / 12;
  const dp = num(downPaymentPercent) / 100;
  const needsPMI = dp > 0 && dp < 0.2;
  const pmiAnnual = needsPMI ? safeP * (num(pmiRate) / 100) : 0;
  const monthlyPMI = pmiAnnual / 12;
  const monthlyTotal = M + monthlyTaxIns + monthlyPMI;

  // Total interest paid across the balloon period
  const totalPaidBeforeBalloon = M * paymentsBeforeBalloon;
  const totalInterest = Math.max(0, totalPaidBeforeBalloon - principalPaid);

  // Dates
  const today = new Date();
  const balloonPaymentDate = new Date(today.getFullYear(), today.getMonth() + paymentsBeforeBalloon, today.getDate())
    .toLocaleDateString(undefined, { year: "numeric", month: "long" });
  const amortizationEndDate = new Date(today.getFullYear(), today.getMonth() + n, today.getDate())
    .toLocaleDateString(undefined, { year: "numeric", month: "long" });

  // Refinance comparison
  const refRate = num(refinanceRate);
  const refTerm = num(refinanceTerm);
  let refinancePayment = 0;
  let refinanceInterestCost = 0;
  if (balloonBalance > 0 && refRate > 0 && refTerm > 0) {
    const rr = (refRate / 100) / 12;
    const rn = Math.round(refTerm * 12);
    refinancePayment = balloonBalance * (rr * Math.pow(1 + rr, rn)) / (Math.pow(1 + rr, rn) - 1);
    refinanceInterestCost = Math.max(0, refinancePayment * rn - balloonBalance);
  }
  const refinanceTotalCost = refinancePayment * (refTerm > 0 ? Math.round(refTerm * 12) : 0);

  return {
    monthlyPI: M,
    monthlyTaxIns,
    monthlyPMI,
    monthlyTotal,
    balloonBalance,
    totalInterest,
    paymentsBeforeBalloon,
    principalPaid,
    balloonPaymentDate,
    amortizationEndDate,
    refinancePayment,
    refinanceTotalCost,
    refinanceInterestCost,
  };
};

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  [key: string]: unknown;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; fill: string }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="font-extrabold text-sm" style={{ color: payload[0].fill }}>${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      </div>
    );
  }
  return null;
};

const BalloonMortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTerm, setLoanTerm] = useState(DEFAULTS.loanTerm);
  const [balloonTerm, setBalloonTerm] = useState(DEFAULTS.balloonTerm);
  const [propertyTax, setPropertyTax] = useState(DEFAULTS.propertyTax);
  const [homeInsurance, setHomeInsurance] = useState(DEFAULTS.homeInsurance);
  const [pmiRate, setPmiRate] = useState(DEFAULTS.pmiRate);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULTS.downPaymentPercent);
  const [refinanceRate, setRefinanceRate] = useState(DEFAULTS.refinanceRate);
  const [refinanceTerm, setRefinanceTerm] = useState(DEFAULTS.refinanceTerm);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<BalloonMortgageResults>(calculateBalloonMortgage({
    loanAmount: parseFloat(DEFAULTS.loanAmount),
    interestRate: parseFloat(DEFAULTS.interestRate),
    loanTerm: parseFloat(DEFAULTS.loanTerm),
    balloonTerm: parseFloat(DEFAULTS.balloonTerm),
    propertyTax: parseFloat(DEFAULTS.propertyTax),
    homeInsurance: parseFloat(DEFAULTS.homeInsurance),
    pmiRate: parseFloat(DEFAULTS.pmiRate),
    downPaymentPercent: parseFloat(DEFAULTS.downPaymentPercent),
    refinanceRate: parseFloat(DEFAULTS.refinanceRate),
    refinanceTerm: parseFloat(DEFAULTS.refinanceTerm),
  }));

  const parse = (v: string) => parseFloat(v) || 0;

  const calculate = (inputs: typeof DEFAULTS): BalloonMortgageResults => {
    return calculateBalloonMortgage({
      loanAmount: parse(inputs.loanAmount),
      interestRate: parse(inputs.interestRate),
      loanTerm: parse(inputs.loanTerm),
      balloonTerm: parse(inputs.balloonTerm),
      propertyTax: parse(inputs.propertyTax),
      homeInsurance: parse(inputs.homeInsurance),
      pmiRate: parse(inputs.pmiRate),
      downPaymentPercent: parse(inputs.downPaymentPercent),
      refinanceRate: parse(inputs.refinanceRate),
      refinanceTerm: parse(inputs.refinanceTerm),
    });
  };

  useEffect(() => {
    setResults(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResults(calculate({
      loanAmount, interestRate, loanTerm, balloonTerm, propertyTax,
      homeInsurance, pmiRate, downPaymentPercent, refinanceRate, refinanceTerm,
    }));
  };

  const reset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTerm(DEFAULTS.loanTerm);
    setBalloonTerm(DEFAULTS.balloonTerm);
    setPropertyTax(DEFAULTS.propertyTax);
    setHomeInsurance(DEFAULTS.homeInsurance);
    setPmiRate(DEFAULTS.pmiRate);
    setDownPaymentPercent(DEFAULTS.downPaymentPercent);
    setRefinanceRate(DEFAULTS.refinanceRate);
    setRefinanceTerm(DEFAULTS.refinanceTerm);
    setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const barData = [
    { name: "Monthly P&I", value: results.monthlyPI, fill: "hsl(var(--primary))" },
    { name: "Monthly Total", value: results.monthlyTotal, fill: "#10b981" },
    { name: "Balloon Amt", value: results.balloonBalance, fill: "#f59e0b" },
  ];

  const faqs = [
    { question: "What is a balloon mortgage?", answer: "A balloon mortgage is a loan that has a fixed monthly payment calculated as if it were a standard long-term loan, but the loan does not fully amortize. After a set number of years (the balloon term), the entire remaining principal balance becomes due as one large lump-sum payment." },
    { question: "What happens when the balloon payment is due?", answer: "When the balloon term ends, you must pay off the remaining balance in full. Most borrowers either sell the property, refinance into a new loan, or use savings. Planning ahead is essential because the lump sum can be a very large amount." },
    { question: "Why choose a balloon mortgage?", answer: "Balloon mortgages typically offer lower monthly payments than fully-amortizing loans because you are only paying interest and a small amount of principal during the balloon period. They can be useful for borrowers who expect to sell or refinance before the balloon date." },
    { question: "Should I worry about the refinance rate?", answer: "Yes. If you plan to refinance at the balloon date, your new rate may be higher than today's rate — as shown in the refinance comparison. Locking in a longer fixed-rate loan may be safer if you intend to stay in the home long term." },
    { question: "Does PMI apply to balloon mortgages?", answer: "If your down payment is below 20%, Private Mortgage Insurance (PMI) is typically required, adding to your monthly payment. Our calculator includes PMI only when the down payment is under 20%." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Balloon Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Balloon Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">

            {/* Normal Tier */}
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="interest-rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <CompactInput id="loan-term" label="Loan Term" value={loanTerm} onChange={setLoanTerm} suffix="years" />
              <CompactInput id="balloon-term" label="Balloon Term" value={balloonTerm} onChange={setBalloonTerm} suffix="years" />
            </div>

            {/* Advanced Tier */}
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
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Additional Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <CompactInput id="property-tax" label="Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" suffix="/yr" />
                    <CompactInput id="home-insurance" label="Home Insurance" value={homeInsurance} onChange={setHomeInsurance} prefix="$" suffix="/yr" />
                    <CompactInput id="pmi-rate" label="PMI Rate" value={pmiRate} onChange={setPmiRate} suffix="%" />
                    <CompactInput id="down-payment" label="Down Payment" value={downPaymentPercent} onChange={setDownPaymentPercent} suffix="%" />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold mt-2">Refinance</div>
                  <div className="grid grid-cols-2 gap-3">
                    <CompactInput id="refinance-rate" label="Refinance Rate" value={refinanceRate} onChange={setRefinanceRate} suffix="%" />
                    <CompactInput id="refinance-term" label="Refinance Term" value={refinanceTerm} onChange={setRefinanceTerm} suffix="years" />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                <Calculator className="h-4 w-4" />
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="flex flex-col gap-4">
            <>
              {/* 1. Primary Result Card */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Monthly Payment (P&I)</p>
                <p className="text-4xl font-black text-primary">${results.monthlyPI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Balloon payment of <strong>${results.balloonBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> due after {results.paymentsBeforeBalloon} payments ({results.balloonPaymentDate}).
                </p>
              </div>

              {/* 2. 3-Stat Bar */}
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-border">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Monthly</p>
                  <p className="text-lg font-bold text-green-600">${results.monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Balloon Amt</p>
                  <p className="text-lg font-bold">${results.balloonBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-lg font-bold text-primary">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              {/* 3. Breakdown Table */}
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Component</th>
                      <th className="text-right font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Principal & Interest</td>
                      <td className="px-4 py-3 text-right">${results.monthlyPI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Taxes & Insurance</td>
                      <td className="px-4 py-3 text-right">${results.monthlyTaxIns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">PMI</td>
                      <td className="px-4 py-3 text-right">${results.monthlyPMI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="bg-muted/20 font-bold">
                      <td className="px-4 py-3 text-foreground">Total Monthly Payment</td>
                      <td className="px-4 py-3 text-right text-primary">${results.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Principal Paid (first {results.paymentsBeforeBalloon} mo)</td>
                      <td className="px-4 py-3 text-right">${results.principalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Balloon Balance Due</td>
                      <td className="px-4 py-3 text-right font-bold">${results.balloonBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Interest Paid (balloon period)</td>
                      <td className="px-4 py-3 text-right">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* 4. Chart - Recharts BarChart */}
                <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                  <p className="text-sm font-semibold text-foreground mb-4 text-center">Payment vs Balloon</p>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-12} textAnchor="end" height={40} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary)/0.4)" }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Loan Summary</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Loan Amt</span>
                      <span className="text-sm font-medium">${parseFloat(loanAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Rate</span>
                      <span className="text-sm font-medium">{interestRate}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Balloon Date</span>
                      <span className="text-sm font-medium">{results.balloonPaymentDate}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Amort. End</span>
                      <span className="text-sm font-medium">{results.amortizationEndDate}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">Refinance Pmt</span>
                      <span className="text-sm font-black text-primary">${results.refinancePayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">Refi Interest</span>
                      <span className="text-sm font-medium">${results.refinanceInterestCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What happens next context */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-lg p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                  <AlertTriangle className="h-4 w-4" /> What Happens When the Balloon Is Due?
                </p>
                <p className="text-sm text-muted-foreground">
                  After {results.paymentsBeforeBalloon} payments, you owe the full balance of <strong>${results.balloonBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>. Most borrowers refinance (est. {refinanceRate}% → ${results.refinancePayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo over {refinanceTerm} yrs), sell, or pay from savings. The risk: if rates rise or equity is low, refinancing may be costly or unavailable.
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3.5 w-3.5" /> Balloon due {results.balloonPaymentDate} · Full amortization ends {results.amortizationEndDate}
                </p>
              </div>
            </>
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mt-12">
          <AdPlaceholder className="mb-10" />

          <section className="mt-12 space-y-8 text-base text-foreground">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">What Is a Balloon Mortgage Calculator?</h2>
              <p>
                A balloon mortgage calculator estimates the monthly payment and the large lump-sum "balloon" payment that comes due at the end of a short fixed period on a balloon loan. Unlike a fully-amortizing mortgage, where each payment chips away at both interest and principal until the balance reaches zero, a balloon mortgage keeps payments low for a set number of years and then demands the remaining principal all at once.
              </p>
              <p>
                This calculator uses the standard mortgage payment formula to find your monthly principal and interest, then applies the remaining-balance formula to reveal exactly how much you will still owe at the balloon date. It also layers in taxes, insurance, and PMI for a true monthly cost, and projects a refinance scenario so you can plan what happens next.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">How the Balloon Payment Is Calculated</h2>
              <p>
                The monthly principal and interest payment <code>M</code> is computed with the standard amortization formula:
              </p>
              <p>
                <code>M = P[r(1+r)^n] / [(1+r)^n - 1]</code>
              </p>
              <p>
                Where <code>P</code> is the loan amount, <code>r</code> is the monthly interest rate (APR / 12 / 100), and <code>n</code> is the total number of months in the full loan term. The balloon balance after <code>p</code> payments (the balloon term in months) is the unpaid principal:
              </p>
              <p>
                <code>B = P[(1+r)^n - (1+r)^p] / [(1+r)^n - 1]</code>
              </p>
              <p>
                This is the amount you must pay — or refinance — when the balloon term ends. Because <code>p</code> is much smaller than <code>n</code>, the balance barely shrinks, which is why the balloon amount is so large.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Planning for the Balloon and Refinancing</h2>
              <p>
                The biggest risk with a balloon mortgage is the due date itself. You should decide early whether you will sell, refinance, or pay the balance from savings. Our Advanced Options estimate a refinance at your expected future rate and term, showing the new monthly payment and total interest so you can compare strategies.
              </p>
              <p>
                If your down payment is below 20%, PMI is automatically added to your monthly payment. Property tax and home insurance are also spread across the year and included in your total monthly obligation. Use the results above to confirm the balloon fits your long-term plan — and remember that rising rates at refinance time can raise your future payment significantly.
              </p>
            </div>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/balloon-mortgage" />
          <PopularCalculators exclude="/calculator/balloon-mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default BalloonMortgageCalculator;
