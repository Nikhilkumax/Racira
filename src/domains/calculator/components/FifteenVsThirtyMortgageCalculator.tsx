"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Home, Scale, TrendingDown, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

interface CompInputs {
  loanAmount: number;
  rate15: number;
  rate30: number;
  taxIns: number;
}

interface CompResult {
  payment15: number;
  payment30: number;
  interest15: number;
  interest30: number;
  total15: number;
  total30: number;
  chartData: { name: string; "15-Year": number; "30-Year": number }[];
}

const DEFAULTS = {
  loanAmount: "300000",
  rate15: "5.5",
  rate30: "6.5",
  taxIns: "500",
};

const calculateComparison = (inputs: CompInputs): CompResult => {
  const { loanAmount, rate15, rate30, taxIns } = inputs;
  
  const r15 = rate15 / 100 / 12;
  const r30 = rate30 / 100 / 12;
  
  const n15 = 15 * 12;
  const n30 = 30 * 12;

  let pi15 = 0;
  if (r15 > 0) {
    pi15 = loanAmount * (r15 * Math.pow(1 + r15, n15)) / (Math.pow(1 + r15, n15) - 1);
  } else {
    pi15 = loanAmount / n15;
  }

  let pi30 = 0;
  if (r30 > 0) {
    pi30 = loanAmount * (r30 * Math.pow(1 + r30, n30)) / (Math.pow(1 + r30, n30) - 1);
  } else {
    pi30 = loanAmount / n30;
  }

  const interest15 = (pi15 * n15) - loanAmount;
  const interest30 = (pi30 * n30) - loanAmount;

  const payment15 = pi15 + taxIns;
  const payment30 = pi30 + taxIns;

  const total15 = loanAmount + interest15;
  const total30 = loanAmount + interest30;

  const chartData = [
    { name: "Monthly P&I", "15-Year": Math.round(pi15), "30-Year": Math.round(pi30) },
    { name: "Total Interest", "15-Year": Math.round(interest15), "30-Year": Math.round(interest30) },
  ];

  return {
    payment15,
    payment30,
    interest15,
    interest30,
    total15,
    total30,
    chartData
  };
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function FifteenVsThirtyMortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [rate15, setRate15] = useState(DEFAULTS.rate15);
  const [rate30, setRate30] = useState(DEFAULTS.rate30);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [taxIns, setTaxIns] = useState(DEFAULTS.taxIns);

  const [result, setResult] = useState<CompResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    setResult(calculateComparison({
      loanAmount: parseFloat(loanAmount) || 0,
      rate15: parseFloat(rate15) || 0,
      rate30: parseFloat(rate30) || 0,
      taxIns: parseFloat(taxIns) || 0,
    }));
  };

  const reset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setRate15(DEFAULTS.rate15);
    setRate30(DEFAULTS.rate30);
    setTaxIns(DEFAULTS.taxIns);
    setShowAdvanced(false);
    setResult(calculateComparison({
      loanAmount: parseFloat(DEFAULTS.loanAmount),
      rate15: parseFloat(DEFAULTS.rate15),
      rate30: parseFloat(DEFAULTS.rate30),
      taxIns: parseFloat(DEFAULTS.taxIns),
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "Why is a 15-year mortgage rate usually lower?", answer: "Lenders offer lower interest rates on 15-year mortgages because the shorter term represents less risk to them. They get their money back faster, and there is a shorter window for inflation to erode the value of the payments or for the borrower to default." },
    { question: "Is a 15-year mortgage always better?", answer: "Mathematically, a 15-year mortgage saves you tens of thousands of dollars in interest. However, the forced higher monthly payment reduces your cash flow. Many financial advisors suggest taking the 30-year mortgage for flexibility but paying it off like a 15-year mortgage. This gives you a safety net if you lose your job, though you'll pay the slightly higher 30-year interest rate." },
    { question: "Can I pay off a 30-year mortgage in 15 years?", answer: "Yes, almost all modern mortgages allow for prepayments without penalty. If you calculate the monthly payment for a 15-year term and pay that amount every month toward your 30-year mortgage (ensuring the extra goes to principal), you will pay it off in roughly 15 years." },
    { question: "How much harder is it to qualify for a 15-year mortgage?", answer: "Because the monthly payments are significantly higher, it requires a higher income to keep your Debt-to-Income (DTI) ratio within the lender's acceptable limits (usually under 43%)." },
    { question: "What is an adjustable-rate mortgage (ARM) vs fixed?", answer: "In a fixed-rate mortgage (like a standard 15- or 30-year), your interest rate never changes. In an ARM, the rate is fixed for an introductory period (e.g., 5 or 7 years) and then adjusts annually based on market indexes, meaning your payment can go up or down." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "15-Year vs 30-Year Mortgage Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">15-Year vs 30-Year Mortgage Comparison</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <CompactInput id="loanAmount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate15" label="15-Year Rate" value={rate15} onChange={setRate15} suffix="%" step="0.1" />
              <CompactInput id="rate30" label="30-Year Rate" value={rate30} onChange={setRate30} suffix="%" step="0.1" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Include Taxes & Insurance
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="taxIns" label="Monthly Taxes, Ins, & HOA" value={taxIns} onChange={setTaxIns} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-5 bg-card relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">15-Year Monthly Payment</p>
                    <p className="text-3xl font-black text-foreground">{formatCurrency(result.payment15)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Interest: <strong className="text-foreground">{formatCurrency(result.interest15)}</strong></p>
                  </div>
                  <div className="border border-border rounded-lg p-5 bg-card relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-500"></div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">30-Year Monthly Payment</p>
                    <p className="text-3xl font-black text-foreground">{formatCurrency(result.payment30)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Interest: <strong className="text-foreground">{formatCurrency(result.interest30)}</strong></p>
                  </div>
                </div>

                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Total Interest Saved with 15-Year</p>
                    <p className="text-2xl font-black text-primary">{formatCurrency(result.interest30 - result.interest15)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">Extra Monthly Cost</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(result.payment15 - result.payment30)} / mo</p>
                  </div>
                </div>

                {mounted && (
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-4">Cost Comparison</p>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="15-Year" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="30-Year" fill="#64748b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Classic Homebuyer's Dilemma</h2>
            <p>When financing a home purchase, the most common decision borrowers face is choosing between a 15-year fixed-rate mortgage and a 30-year fixed-rate mortgage. The choice fundamentally dictates your monthly cash flow, the total cost of the home, and the speed at which you build equity. While the 30-year mortgage is the undisputed king of popularity in the United States — prized for its lower monthly payments — the 15-year mortgage offers a rapid path to debt freedom and massive interest savings. Our calculator lets you input your specific loan amounts and rates to see the exact mathematical divergence between these two paths.</p>

            <h2 className="text-2xl font-bold mb-3">The 30-Year Mortgage</h2>
            <p>A 30-year mortgage spreads the repayment of the principal over 360 months. This elongated timeline significantly reduces your mandatory monthly payment and makes it easier to qualify for a larger home, since your Debt-to-Income ratio stays lower. Over three decades, inflation also erodes the value of the dollar, meaning you pay back the loan with progressively cheaper money in the final years. The trade-off is steep: you will pay tens or even hundreds of thousands of dollars more in total interest, and in the first decade the vast majority of each payment goes to interest rather than building equity. Lenders also price the longer duration into the rate, typically charging 0.5% to 1.0% more than on a 15-year product.</p>

            <h2 className="text-2xl font-bold mb-3">The 15-Year Mortgage</h2>
            <p>A 15-year mortgage compresses repayment into 180 months. Because the bank receives its money back faster, it rewards you with a lower interest rate. Not only is the term cut in half, but the lower rate compounds the savings — from day one, a far greater share of each payment attacks the principal balance rather than servicing interest. You own the home free and clear in half the time, perfectly positioning yourself for early retirement or redirecting cash flow toward college savings. The cost is a monthly payment typically 50% to 60% higher than the equivalent 30-year loan, which constrains cash flow and sets a higher income bar for qualification.</p>

            <h2 className="text-2xl font-bold mb-3">The Hybrid Strategy</h2>
            <p>Many financial planners recommend a best-of-both-worlds approach: originate a 30-year mortgage to secure the low mandatory monthly payment, then voluntarily pay the amount a 15-year mortgage would require. This protects you in a job loss or emergency — you only have to pay the lower amount — while still dramatically accelerating payoff and reducing interest when cash flow allows. The downside is that you forgo the lower 15-year rate, so you pay somewhat more in interest compared to a true 15-year mortgage, and the strategy demands genuine discipline to sustain the overpayment rather than spending it.</p>

            <h2 className="text-2xl font-bold mb-3">Making the Right Call</h2>
            <p>The correct choice depends entirely on your financial goals, risk tolerance, and income stability. If you prioritize absolute debt freedom and have comfortable income to cover the higher payments, the 15-year mortgage is unparalleled. If you prioritize liquidity, want to maximize market investments, or need to stretch your budget to enter an expensive housing market, the 30-year mortgage is the pragmatic choice. Use the comparison calculator above to quantify exactly what you are trading in either direction before you sign.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/15-year-vs-30-year-mortgage-comparison" />
          <PopularCalculators exclude="/calculator/15-year-vs-30-year-mortgage-comparison" />
        </div>
      </div>
    </>
  );
}
