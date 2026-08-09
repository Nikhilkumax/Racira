"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartPoint {
  name: string;
  "Your Payment": number;
  "Subsidy Paid": number;
}

interface BreakdownRow {
  year: number | string;
  rate: number;
  payment: number;
  monthlySaving: number;
  yearlySaving: number;
}

interface BuyDownInputs {
  loanAmount: string;
  baseRate: string;
  loanTerm: string;
  buyDownType: string;
  customRed1: string;
  customRed2: string;
}

interface BuyDownResults {
  basePayment: number;
  upfrontCost: number;
  totalSavings: number;
  loanAmount: number;
  baseRate: number;
  costAsPercent: number;
  subsidizedYears: number;
  firstYearPayment: number;
  firstYearRate: number;
  chartData: ChartPoint[];
  breakdownRows: BreakdownRow[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {type === "select" ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium cursor-pointer" {...props}>
          {props.children}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateBuyDown = (inputs: BuyDownInputs): BuyDownResults => {
  const loanAmount = parseFloat(inputs.loanAmount) || 0;
  const baseRate = parseFloat(inputs.baseRate) || 0;
  const term = parseFloat(inputs.loanTerm) || 30;
  const type = inputs.buyDownType;

  if (loanAmount <= 0 || baseRate <= 0 || term <= 0) {
    return {
      basePayment: 0, upfrontCost: 0, totalSavings: 0, loanAmount: 0, baseRate: 0,
      costAsPercent: 0, subsidizedYears: 0, firstYearPayment: 0, firstYearRate: 0,
      chartData: [], breakdownRows: []
    };
  }

  const getPmt = (ratePct: number) => {
    const r = ratePct / 100 / 12;
    const n = term * 12;
    if (r === 0) return loanAmount / n;
    return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const basePayment = getPmt(baseRate);
  
  let rateReductions: number[] = [];
  if (type === "3-2-1") rateReductions = [3, 2, 1];
  else if (type === "2-1") rateReductions = [2, 1];
  else if (type === "1-0") rateReductions = [1];
  else rateReductions = [parseFloat(inputs.customRed1) || 0, parseFloat(inputs.customRed2) || 0];

  const breakdownRows = [];
  const chartData = [];
  let upfrontCost = 0;
  let totalSavings = 0;

  for (let year = 1; year <= rateReductions.length; year++) {
    const reduction = rateReductions[year - 1];
    const reducedRate = Math.max(0, baseRate - reduction);
    const reducedPayment = getPmt(reducedRate);
    const monthlySaving = Math.max(0, basePayment - reducedPayment);
    const yearlySaving = monthlySaving * 12;
    
    upfrontCost += yearlySaving;
    totalSavings += yearlySaving;
    
    breakdownRows.push({
      year,
      rate: reducedRate,
      payment: reducedPayment,
      monthlySaving,
      yearlySaving
    });
    
    chartData.push({
      name: `Year ${year}`,
      "Your Payment": parseFloat(reducedPayment.toFixed(2)),
      "Subsidy Paid": parseFloat(monthlySaving.toFixed(2))
    });
  }

  // Base years
  breakdownRows.push({
    year: `${rateReductions.length + 1}-${term}`,
    rate: baseRate,
    payment: basePayment,
    monthlySaving: 0,
    yearlySaving: 0
  });

  chartData.push({
    name: `Years ${rateReductions.length + 1}+`,
    "Your Payment": parseFloat(basePayment.toFixed(2)),
    "Subsidy Paid": 0
  });

  return {
    basePayment,
    upfrontCost,
    totalSavings,
    loanAmount,
    baseRate,
    costAsPercent: loanAmount > 0 ? (upfrontCost / loanAmount) * 100 : 0,
    subsidizedYears: rateReductions.length,
    firstYearPayment: breakdownRows[0]?.payment ?? basePayment,
    firstYearRate: breakdownRows[0]?.rate ?? baseRate,
    chartData,
    breakdownRows
  };
};

const DEFAULTS = {
  loanAmount: "350000",
  baseRate: "7.0",
  loanTerm: "30",
  buyDownType: "2-1",
  // Only read by the custom fallback in calculateBuyDown. No "Custom" option is
  // exposed in the Buy Down Type select yet, so that branch is unreachable today;
  // these keep the state shape matching BuyDownInputs.
  customRed1: "0",
  customRed2: "0"
};

export default function BuyDownCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BuyDownResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateBuyDown(inputs));
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateBuyDown(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBuyDown(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Buy Down Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Buy Down Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loanAmount" label="Loan Amount" value={inputs.loanAmount} onChange={(v: string) => handleChange("loanAmount", v)} prefix="$" />
              <CompactInput id="buyDownType" label="Buy Down Type" value={inputs.buyDownType} onChange={(v: string) => handleChange("buyDownType", v)} type="select">
                <option value="3-2-1">3-2-1 Buy Down</option>
                <option value="2-1">2-1 Buy Down</option>
                <option value="1-0">1-0 Buy Down</option>
              </CompactInput>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="baseRate" label="Base Interest Rate" value={inputs.baseRate} onChange={(v: string) => handleChange("baseRate", v)} suffix="%" />
              <CompactInput id="loanTerm" label="Loan Term" value={inputs.loanTerm} onChange={(v: string) => handleChange("loanTerm", v)} suffix="years" />
            </div>
            
            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Upfront Cost of Buy Down</div>
                  <div className="text-4xl font-bold text-primary">${results.upfrontCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total savings during reduced period: ${results.totalSavings.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-border py-3 my-2">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Base Monthly Payment</div>
                    <div className="text-sm font-bold">${results.basePayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Year 1 Payment</div>
                    <div className="text-sm font-bold text-green-600">${results.breakdownRows[0]?.payment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} cursor={{fill: 'transparent'}} />
                      <Legend />
                      <Bar dataKey="Your Payment" stackId="a" fill="hsl(var(--primary))" maxBarSize={60} />
                      <Bar dataKey="Subsidy Paid" stackId="a" fill="hsl(var(--muted-foreground))" opacity={0.3} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-bold mb-2">Year-by-Year Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Year</th>
                          <th className="py-2 font-semibold">Interest Rate</th>
                          <th className="py-2 font-semibold">Monthly Payment</th>
                          <th className="py-2 font-semibold">Monthly Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row, idx) => (
                          <tr key={idx} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                            <td className="text-left py-2.5 font-medium">{row.year}</td>
                            <td className="py-2.5">{row.rate.toFixed(3)}%</td>
                            <td className="py-2.5 font-bold">${row.payment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            <td className="py-2.5 text-green-600">
                              {row.monthlySaving > 0 ? `+\$${row.monthlySaving.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "$0.00"}
                            </td>
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
                      <span className="text-muted-foreground">Loan Amount</span>
                      <span className="font-medium">${results.loanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Base Interest Rate</span>
                      <span className="font-medium">{results.baseRate.toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Buy-Down Structure</span>
                      <span className="font-medium">{inputs.buyDownType}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Subsidized Years</span>
                      <span className="font-medium">{results.subsidizedYears}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Base Monthly Payment</span>
                      <span className="font-medium">${results.basePayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Year 1 Payment</span>
                      <span className="font-medium text-green-600">${results.firstYearPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Year 1 Effective Rate</span>
                      <span className="font-medium">{results.firstYearRate.toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Cost as % of Loan</span>
                      <span className="font-medium">{results.costAsPercent.toFixed(3)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t-2 border-border pt-3 mt-1 font-bold text-primary">
                    <span>Total Upfront Buy-Down Cost</span>
                    <span>${results.upfrontCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mt-12 prose prose-slate dark:prose-invert">
          <h2 className="text-2xl font-bold mb-3">What Is a Mortgage Buy Down?</h2>
          <p>A mortgage buy-down is a financing technique where the borrower, home seller, or builder pays an upfront fee to temporarily lower the interest rate on a mortgage. The most common structures are the 3-2-1 and 2-1 buy-downs, which lower the rate for the first three or two years, respectively.</p>
          
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p>The upfront cost of a buy-down is exactly equal to the total interest savings over the buy-down period. This money is deposited into an escrow account at closing and is used to subsidize your monthly payments. <strong>Upfront Cost = Σ (Base Payment - Reduced Payment) × 12</strong>.</p>

          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p>Our calculator shows the exact upfront cost required to fund the buy-down. The chart illustrates how your monthly out-of-pocket payment increases over time while the subsidy from the escrow account decreases until the base rate applies.</p>
          
          <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
          <p>Important factors include the loan amount, base interest rate, and the type of buy-down. In a 2-1 buy-down, your interest rate is 2% lower in year one and 1% lower in year two. In year three, the rate returns to the permanent base rate.</p>
          
          <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
          <p>Consider a $350,000 loan at a 7% base rate with a 2-1 buy-down. In year 1, your rate is 5%, saving you $447 per month. In year 2, your rate is 6%, saving you $230 per month. The total upfront cost funded by the seller would be around $8,127.</p>
          
          <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
          <p>Seller concessions are the best way to fund a temporary buy-down. If you are negotiating a home purchase, asking the seller to pay for a 2-1 buy-down can make your first two years of homeownership much more affordable.</p>
          
          <h2 className="text-2xl font-bold mb-3">Benefits</h2>
          <p>A buy-down eases you into your full mortgage payment, providing extra cash flow in the early years of homeownership to pay for furniture, renovations, or unexpected expenses.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/buy-down-calculator" faqs={[
          { question: "Who pays for a temporary buy down?", answer: "Usually, the seller or the home builder pays for it as an incentive to sell the property. Borrowers can also pay for it, but it's essentially paying your interest upfront, which has fewer benefits." },
          { question: "What happens if I refinance before the buy down period ends?", answer: "If you refinance or sell the home before the buy-down funds are fully used, the remaining balance in the buy-down escrow account is typically applied as a principal reduction on your current loan." },
          { question: "What is a 3-2-1 buy down?", answer: "In a 3-2-1 buy-down, the interest rate is reduced by 3% in the first year, 2% in the second year, and 1% in the third year, before returning to the permanent base rate in year four." },
          { question: "Is a buy-down better than an ARM?", answer: "Yes, in terms of safety. With a temporary buy-down, your permanent maximum rate is fixed and known from day one. With an ARM, your rate could adjust much higher depending on the market." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
