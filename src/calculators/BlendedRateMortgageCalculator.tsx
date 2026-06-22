"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Home, Percent, PieChart, Info } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface BlendedInputs {
  firstBalance: number;
  firstRate: number;
  secondBalance: number;
  secondRate: number;
}

interface BlendedResult {
  blendedRate: number;
  totalBalance: number;
  firstAnnualInterest: number;
  secondAnnualInterest: number;
  totalAnnualInterest: number;
  chartData: { name: string; value: number; fill: string }[];
}

const DEFAULTS = {
  firstBalance: "300000",
  firstRate: "3.5",
  secondBalance: "50000",
  secondRate: "8.5",
};

const calculateBlended = (inputs: BlendedInputs): BlendedResult => {
  const { firstBalance, firstRate, secondBalance, secondRate } = inputs;
  
  const totalBalance = firstBalance + secondBalance;
  
  let blendedRate = 0;
  if (totalBalance > 0) {
    blendedRate = ((firstBalance * firstRate) + (secondBalance * secondRate)) / totalBalance;
  }

  const firstAnnualInterest = firstBalance * (firstRate / 100);
  const secondAnnualInterest = secondBalance * (secondRate / 100);
  const totalAnnualInterest = firstAnnualInterest + secondAnnualInterest;

  const chartData = [
    { name: "1st Mortgage Principal", value: firstBalance, fill: "#3b82f6" },
    { name: "2nd Mortgage/HELOC Principal", value: secondBalance, fill: "#f59e0b" },
  ];

  return {
    blendedRate,
    totalBalance,
    firstAnnualInterest,
    secondAnnualInterest,
    totalAnnualInterest,
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

export default function BlendedRateMortgageCalculator() {
  const [firstBalance, setFirstBalance] = useState(DEFAULTS.firstBalance);
  const [firstRate, setFirstRate] = useState(DEFAULTS.firstRate);
  const [secondBalance, setSecondBalance] = useState(DEFAULTS.secondBalance);
  const [secondRate, setSecondRate] = useState(DEFAULTS.secondRate);

  const [result, setResult] = useState<BlendedResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    setResult(calculateBlended({
      firstBalance: parseFloat(firstBalance) || 0,
      firstRate: parseFloat(firstRate) || 0,
      secondBalance: parseFloat(secondBalance) || 0,
      secondRate: parseFloat(secondRate) || 0,
    }));
  };

  const reset = () => {
    setFirstBalance(DEFAULTS.firstBalance);
    setFirstRate(DEFAULTS.firstRate);
    setSecondBalance(DEFAULTS.secondBalance);
    setSecondRate(DEFAULTS.secondRate);
    setResult(calculateBlended({
      firstBalance: parseFloat(DEFAULTS.firstBalance),
      firstRate: parseFloat(DEFAULTS.firstRate),
      secondBalance: parseFloat(DEFAULTS.secondBalance),
      secondRate: parseFloat(DEFAULTS.secondRate),
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "What exactly is a blended mortgage rate?", answer: "A blended mortgage rate is the combined, weighted average interest rate of two separate loans on the same property. It is most commonly calculated when a homeowner has a primary mortgage and decides to take out a second mortgage, like a HELOC or Home Equity Loan, instead of doing a cash-out refinance." },
    { question: "Why should I calculate a blended rate?", answer: "Calculating your blended rate is crucial when deciding whether to do a 'cash-out refinance' or take out a second mortgage. If current market rates are 7%, but you have a primary mortgage locked in at 3%, a cash-out refinance forces you to give up that 3% rate. Taking out a second mortgage at 8% might seem expensive, but your 'blended rate' across both loans might only be 4%, making the second mortgage mathematically superior to the refinance." },
    { question: "How is the blended rate calculated?", answer: "It is a weighted average. The formula is: [(Primary Loan Balance × Primary Rate) + (Second Loan Balance × Second Rate)] ÷ Total Combined Loan Balance. This ensures that the loan with the larger balance has more 'weight' in determining the final effective interest rate." },
    { question: "Does the blended rate include closing costs?", answer: "No, a blended rate calculation purely looks at the nominal interest rates of the two loans. When comparing a second mortgage to a cash-out refinance, you must also factor in closing costs. Refinances usually have significantly higher closing costs (2% to 5% of the entire loan) compared to HELOCs or Home Equity Loans." },
    { question: "Can I blend more than two loans?", answer: "Yes. If you have three loans on a property (e.g., a primary mortgage, a HELOC, and a PACE energy loan), you multiply each balance by its respective rate, add them all together, and divide by the total balance of all three loans." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Blended Rate Mortgage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Blended Rate Mortgage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <h3 className="text-sm font-bold text-primary border-b border-border pb-2">1st Mortgage</h3>
            <CompactInput id="firstBalance" label="Remaining Balance" value={firstBalance} onChange={setFirstBalance} prefix="$" />
            <CompactInput id="firstRate" label="Interest Rate" value={firstRate} onChange={setFirstRate} suffix="%" step="0.1" />

            <h3 className="text-sm font-bold text-primary border-b border-border pb-2 mt-2">2nd Mortgage / HELOC</h3>
            <CompactInput id="secondBalance" label="Loan Amount" value={secondBalance} onChange={setSecondBalance} prefix="$" />
            <CompactInput id="secondRate" label="Interest Rate" value={secondRate} onChange={setSecondRate} suffix="%" step="0.1" />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Percent className="h-4 w-4" /> Calculate Blended Rate
              </button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="border-l-4 rounded-lg p-5 bg-primary/10 border-primary flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Combined Effective (Blended) Rate</p>
                    <p className="text-4xl font-black text-primary">{result.blendedRate.toFixed(3)}%</p>
                  </div>
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Percent className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Total Debt Owed</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(result.totalBalance)}</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Total Annual Interest</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(result.totalAnnualInterest)}</p>
                  </div>
                </div>

                {mounted && (
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-1/2 h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="hsl(var(--card))" strokeWidth={2}>
                            {result.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">1st Mortgage ({firstRate}%)</p>
                          <p className="text-sm font-bold">{formatCurrency(parseFloat(firstBalance))}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">2nd Mortgage ({secondRate}%)</p>
                          <p className="text-sm font-bold">{formatCurrency(parseFloat(secondBalance))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-500/10 border border-blue-500 text-blue-700 dark:text-blue-400 p-4 rounded-lg text-sm flex gap-3">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>
                    <strong>Decision Matrix:</strong> Compare this <strong className="font-bold">{result.blendedRate.toFixed(3)}%</strong> blended rate to current market rates for a Cash-Out Refinance. If the market rate is higher than {result.blendedRate.toFixed(3)}%, you are mathematically better off keeping your first mortgage and taking out the second mortgage.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Golden Handcuffs Dilemma</h2>
            <p>During periods of historically low interest rates, millions of homeowners locked in mortgages at 3% or 4%. Fast forward a few years, and those same homeowners may need cash for home improvements, tuition, or debt consolidation. If current market rates have risen to 7% or 8%, a traditional cash-out refinance forces them to surrender their low primary rate on the entire balance — replacing a 3% loan with a 7% loan on $350,000 is a punishing monthly payment increase. The blended rate calculation exists precisely to model the alternative.</p>

            <h2>How a Blended Rate Works</h2>
            <p>Instead of refinancing the primary mortgage, the homeowner can leave it completely untouched and take out a second mortgage or Home Equity Line of Credit at the prevailing market rate. The blended rate is the weighted average interest cost across both loans. The formula is straightforward: multiply each loan balance by its respective interest rate, add the two products, then divide by the total combined balance. For example, a $300,000 loan at 3% generates $9,000 of annual interest, and a $50,000 HELOC at 9% generates $4,500. Together, $13,500 of annual interest on $350,000 of total debt equals a blended rate of just 3.86% — far below the 7% a full refinance would cost.</p>

            <h2>Blended Rate vs. Cash-Out Refinance</h2>
            <p>Once you know your blended rate, the decision is clear. If the blended rate is lower than the rate being offered for a cash-out refinance, you are better off leaving the primary mortgage alone and using the second mortgage or HELOC. If the blended rate exceeds the refinance rate — which could happen if the second loan is very large relative to the first — consolidating into a single new primary mortgage makes more financial sense. The calculator above computes this comparison instantly.</p>

            <h2>Don't Overlook Closing Costs</h2>
            <p>While the blended rate comparison tells the pure interest story, closing costs often tip the decision in favor of the second mortgage even when the rates are close. A cash-out refinance on a $350,000 balance typically carries closing costs of 2% to 5% — potentially $10,000 to $17,500 in fees. By contrast, many HELOCs and home equity loans come with minimal or even waived closing costs. If the blended rate and the refinance rate are within a fraction of a percent of each other, the avoided closing costs alone usually make the second mortgage the financially superior choice.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/blended-rate-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/blended-rate-mortgage-calculator" />
        </div>
      </div>
    </>
  );
}
