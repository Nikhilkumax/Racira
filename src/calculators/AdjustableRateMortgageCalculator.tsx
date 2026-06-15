"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ArmResults {
  initialPayment: number;
  maxPayment: number;
  totalCost: number;
  totalInterest: number;
  loanAmount: number;
  payoffDate: string;
  chartData: { year: number; payment: number; rate: number }[];
  breakdownRows: { year: number; rate: number; payment: number; balance: number }[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateArm = (inputs: any): ArmResults => {
  const hp = parseFloat(inputs.homePrice) || 0;
  const dp = parseFloat(inputs.downPayment) || 0;
  const loanAmount = hp - dp;
  const term = parseFloat(inputs.loanTerm) || 30;
  const initialRate = parseFloat(inputs.initialRate) || 0;
  const fixedPeriod = parseFloat(inputs.fixedPeriod) || 5;
  const adjFreq = parseFloat(inputs.adjustmentFrequency) || 1;
  const expAdj = parseFloat(inputs.expectedAdjustment) || 0;
  const cap = parseFloat(inputs.rateCap) || 0;

  if (loanAmount <= 0 || term <= 0) {
    return { initialPayment: 0, maxPayment: 0, totalCost: 0, totalInterest: 0, loanAmount: 0, payoffDate: "N/A", chartData: [], breakdownRows: [] };
  }

  let balance = loanAmount;
  let currentRate = initialRate;
  let months = term * 12;
  const chartData = [];
  const breakdownRows = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let initialPayment = 0;
  let maxPayment = 0;

  for (let year = 1; year <= term; year++) {
    if (year > fixedPeriod && (year - fixedPeriod - 1) % adjFreq === 0) {
      currentRate = Math.min(currentRate + expAdj, cap);
    }
    const r = currentRate / 100 / 12;
    const n = months - (year - 1) * 12;
    let payment = r > 0 ? balance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : balance / n;
    
    if (year === 1) initialPayment = payment;
    if (payment > maxPayment) maxPayment = payment;

    let yearInterest = 0;
    let yearPrincipal = 0;
    for (let m = 1; m <= 12; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      let principal = payment - interest;
      if (principal > balance) principal = balance;
      yearInterest += interest;
      yearPrincipal += principal;
      balance -= principal;
    }
    
    totalInterest += yearInterest;
    totalPaid += (yearInterest + yearPrincipal);

    chartData.push({ year, payment, rate: currentRate });
    breakdownRows.push({ year, rate: currentRate, payment, balance: Math.max(0, balance) });
  }

  const d = new Date();
  const payoffYear = d.getFullYear() + term;

  return {
    initialPayment,
    maxPayment,
    totalCost: totalPaid,
    totalInterest,
    loanAmount,
    payoffDate: `Dec ${payoffYear}`,
    chartData,
    breakdownRows
  };
};

const DEFAULTS = {
  homePrice: "400000",
  downPayment: "80000",
  loanTerm: "30",
  initialRate: "5.5",
  fixedPeriod: "5",
  adjustmentFrequency: "1",
  expectedAdjustment: "0.25",
  rateCap: "10.5"
};

export default function AdjustableRateMortgageCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<ArmResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateArm(inputs));
  }, []); // Run on mount

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateArm(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateArm(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Adjustable Rate Mortgage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Adjustable Rate Mortgage (ARM) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="homePrice" label="Home Price" value={inputs.homePrice} onChange={(v: string) => handleChange("homePrice", v)} prefix="$" />
              <CompactInput id="downPayment" label="Down Payment" value={inputs.downPayment} onChange={(v: string) => handleChange("downPayment", v)} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loanTerm" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="years" />
              <CompactInput id="initialRate" label="Initial Interest Rate" value={inputs.initialRate} onChange={(v: string) => handleChange("initialRate", v)} suffix="%" />
            </div>
            
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
              Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <CompactInput id="fixedPeriod" label="Fixed Rate Period" value={inputs.fixedPeriod} onChange={(v: string) => handleChange("fixedPeriod", v)} suffix="years" />
                <CompactInput id="adjustmentFrequency" label="Adjustment Freq." value={inputs.adjustmentFrequency} onChange={(v: string) => handleChange("adjustmentFrequency", v)} suffix="years" />
                <CompactInput id="expectedAdjustment" label="Expected Adj/Period" value={inputs.expectedAdjustment} onChange={(v: string) => handleChange("expectedAdjustment", v)} suffix="%" />
                <CompactInput id="rateCap" label="Interest Rate Cap" value={inputs.rateCap} onChange={(v: string) => handleChange("rateCap", v)} suffix="%" />
              </div>
            )}
            
            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                <div className="flex justify-end">
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Initial Monthly Payment</div>
                  <div className="text-4xl font-bold text-primary">${results.initialPayment.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1">Maximum Payment: ${results.maxPayment.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-border py-3 my-2">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Loan Amount</div>
                    <div className="text-sm font-bold">${results.loanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Interest</div>
                    <div className="text-sm font-bold">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Payoff Date</div>
                    <div className="text-sm font-bold">{results.payoffDate}</div>
                  </div>
                </div>

                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => `$\${val}`} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val: number) => `$\${val.toFixed(2)}`} labelFormatter={(label) => `Year \${label}`} />
                      <Line type="monotone" dataKey="payment" name="Monthly Payment" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-bold mb-2">Yearly Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Year</th>
                          <th className="py-2 font-semibold">Rate</th>
                          <th className="py-2 font-semibold">Payment</th>
                          <th className="py-2 font-semibold">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row) => (
                          <tr key={row.year} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                            <td className="text-left py-2.5 font-medium">{row.year}</td>
                            <td className="py-2.5">{row.rate.toFixed(2)}%</td>
                            <td className="py-2.5">${row.payment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            <td className="py-2.5">${row.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5 mt-4">
                  <h3 className="text-base font-semibold mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Initial Rate</span>
                      <span className="font-medium">{inputs.initialRate}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Rate Cap</span>
                      <span className="font-medium">{inputs.rateCap}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Initial Payment</span>
                      <span className="font-medium">${results.initialPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Max Payment</span>
                      <span className="font-medium text-destructive">${results.maxPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-3 mt-1 font-bold text-primary">
                    <span>Total Cost of Loan</span>
                    <span>${results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mx-auto mt-12 prose prose-slate dark:prose-invert">
          <h2>What Is an Adjustable Rate Mortgage (ARM) Calculator?</h2>
          <p>An adjustable-rate mortgage (ARM) calculator helps homebuyers understand how their monthly payments might change over time. Unlike a fixed-rate mortgage where the interest rate remains constant, an ARM has an initial fixed period followed by adjustments based on market conditions.</p>
          
          <h2>How It Works</h2>
          <p>The calculation uses the standard amortization formula for the initial fixed period: <strong>M = P[r(1+r)^n] / [(1+r)^n - 1]</strong>. After the fixed period, the remaining balance is re-amortized over the remaining term using the new interest rate.</p>

          <h2>Understanding Your Results</h2>
          <p>The calculator provides your initial monthly payment and estimates your maximum possible payment based on the rate cap you specify. The chart visually demonstrates how your payments could escalate over time if interest rates rise steadily.</p>
          
          <h2>Key Factors</h2>
          <p>Important variables include the initial fixed period (typically 5, 7, or 10 years), the expected adjustment per period (e.g., 0.25%), and the lifetime rate cap, which protects you from astronomical rate hikes.</p>
          
          <h2>Advanced Features</h2>
          <p>Our calculator allows you to model worst-case scenarios by setting the expected adjustment to a high value until it hits the rate cap, giving you a clear picture of potential financial risk.</p>
          
          <h2>Practical Examples</h2>
          <p>For example, a 5/1 ARM starts with a fixed rate for 5 years, then adjusts every 1 year. If the initial rate is lower than fixed-rate options, it can save you money if you plan to move before the 5 years are up.</p>
          
          <h2>Tips & Best Practices</h2>
          <p>Only consider an ARM if you have a solid plan to sell the property or refinance before the fixed period ends, or if you can comfortably afford the maximum possible payment.</p>
          
          <h2>Benefits</h2>
          <p>Using an ARM calculator ensures you are fully prepared for payment shock and can make an informed decision between fixed and adjustable-rate mortgages.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/adjustable-rate-mortgage-calculator" faqs={[
          { question: "What does 5/1 ARM mean?", answer: "A 5/1 ARM means the interest rate is fixed for the first 5 years, and then adjusts once every 1 year for the remainder of the loan." },
          { question: "Can my payment go down with an ARM?", answer: "Yes, if the underlying index rate decreases, your interest rate and monthly payment can decrease during the adjustment period." },
          { question: "What is an interest rate cap?", answer: "A cap limits how much your interest rate can increase. There are typically periodic caps (per adjustment) and lifetime caps (over the life of the loan)." },
          { question: "Is an ARM better than a fixed-rate mortgage?", answer: "An ARM often has a lower initial rate, making it cheaper early on. It's ideal if you plan to move or refinance before the rate adjusts." },
          { question: "How does the expected adjustment work in this calculator?", answer: "It simulates a scenario where your rate increases by that amount at every adjustment period until it hits the lifetime cap." },
          { question: "What happens if I make extra payments?", answer: "Extra payments reduce your principal balance faster, which means your future payments after an adjustment will be based on a smaller loan amount." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
