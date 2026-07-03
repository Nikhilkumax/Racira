"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Percent, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface PointsResult {
  newInterestRate: number;
  upfrontCost: number;
  originalMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  breakEvenMonths: number;
  totalInterestOriginal: number;
  totalInterestNew: number;
  lifetimeSavings: number;
  chartData: { metric: string; withPoints: number; withoutPoints: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcPoints(loanAmount: number, baseRate: number, termYears: number, pointsBought: number, pointCostPct: number, rateReductionPerPoint: number): PointsResult {
  const n = termYears * 12;
  
  // Original
  const rOrig = baseRate / 100 / 12;
  const origMonthly = loanAmount > 0 && n > 0
    ? (rOrig > 0 ? loanAmount * rOrig * Math.pow(1 + rOrig, n) / (Math.pow(1 + rOrig, n) - 1) : loanAmount / n)
    : 0;
  const totalInterestOriginal = Math.max(0, origMonthly * n - loanAmount);

  // New
  const newRate = Math.max(0, baseRate - (pointsBought * rateReductionPerPoint));
  const rNew = newRate / 100 / 12;
  const newMonthly = loanAmount > 0 && n > 0
    ? (rNew > 0 ? loanAmount * rNew * Math.pow(1 + rNew, n) / (Math.pow(1 + rNew, n) - 1) : loanAmount / n)
    : 0;
  const totalInterestNew = Math.max(0, newMonthly * n - loanAmount);

  // Costs & Savings
  const upfrontCost = loanAmount * (pointsBought * pointCostPct / 100);
  const monthlySavings = origMonthly - newMonthly;
  
  const breakEvenMonths = monthlySavings > 0 ? upfrontCost / monthlySavings : 0;
  const lifetimeSavings = totalInterestOriginal - totalInterestNew - upfrontCost;

  const chartData = [
    { metric: "Monthly Pmt", withPoints: Math.round(newMonthly), withoutPoints: Math.round(origMonthly) },
    { metric: "Total Int ($K)", withPoints: Math.round(totalInterestNew / 1000), withoutPoints: Math.round(totalInterestOriginal / 1000) },
  ];

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Points Purchased", value: `${pointsBought} points` },
    { label: "New Interest Rate", value: `${newRate.toFixed(3)}%` },
    { label: "Upfront Cost of Points", value: `$${upfrontCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Savings", value: `$${monthlySavings.toFixed(2)}/mo` },
    { label: "Break-Even Time", value: `${breakEvenMonths.toFixed(1)} months (${(breakEvenMonths/12).toFixed(1)} yrs)` },
  ];

  return { newInterestRate: newRate, upfrontCost, originalMonthlyPayment: origMonthly, newMonthlyPayment: newMonthly, monthlySavings, breakEvenMonths, totalInterestOriginal, totalInterestNew, lifetimeSavings, chartData, summaryStats };
}

const DEFAULTS = { loanAmount: "350000", baseRate: "7.0", termYears: "30", pointsBought: "2.0", pointCostPct: "1.0", rateReductionPerPoint: "0.25" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function MortgagePointsCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [baseRate, setBaseRate] = useState(DEFAULTS.baseRate);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  const [pointsBought, setPointsBought] = useState(DEFAULTS.pointsBought);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pointCostPct, setPointCostPct] = useState(DEFAULTS.pointCostPct);
  const [rateReductionPerPoint, setRateReductionPerPoint] = useState(DEFAULTS.rateReductionPerPoint);
  const [results, setResults] = useState<PointsResult | null>(null);

  const calc = () => setResults(calcPoints(parseFloat(loanAmount)||0, parseFloat(baseRate)||0, parseFloat(termYears)||30, parseFloat(pointsBought)||0, parseFloat(pointCostPct)||1, parseFloat(rateReductionPerPoint)||0.25));
  const reset = () => { setLoanAmount(DEFAULTS.loanAmount); setBaseRate(DEFAULTS.baseRate); setTermYears(DEFAULTS.termYears); setPointsBought(DEFAULTS.pointsBought); setPointCostPct(DEFAULTS.pointCostPct); setRateReductionPerPoint(DEFAULTS.rateReductionPerPoint); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What are mortgage discount points?", answer: "Mortgage discount points are optional upfront fees paid directly to the lender at closing in exchange for a reduced interest rate on your loan. This process is commonly known as 'buying down the rate'. You are essentially paying some of your loan's interest upfront to secure a lower monthly payment for the life of the loan." },
    { question: "How much does one point cost?", answer: "One discount point traditionally costs exactly 1% of your total loan amount. If you are borrowing $350,000, purchasing one point will cost you $3,500 at closing. Our calculator defaults to 1%, but you can adjust this in the advanced settings if your lender offers a different pricing structure (such as fractional points)." },
    { question: "How much does one point reduce my interest rate?", answer: "There is no standard industry rule, as it depends entirely on the lender, the loan type, and current bond market conditions. However, a common rule of thumb is that one point reduces the interest rate by 0.25% (e.g., dropping a 7.0% rate to 6.75%). You should always ask your loan officer for their specific rate reduction schedule." },
    { question: "What is the 'Break-Even Point'?", answer: "The break-even point is the number of months it takes for your monthly interest savings to equal the upfront cash you paid for the points. If you pay $3,500 for points and save $75 a month, your break-even point is 46.6 months. If you sell the house or refinance the loan before month 47, buying the points was a financial loss. If you stay longer, it was a profit." },
    { question: "Should I buy mortgage points?", answer: "You should buy points if two conditions are met: 1) You have the extra cash available at closing without depleting your emergency fund, and 2) You are absolutely certain you will keep the exact same mortgage (without selling or refinancing) significantly past the calculated break-even point." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Mortgage Points Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Points Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loan" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="base-rate" label="Base Interest Rate" value={baseRate} onChange={setBaseRate} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="points" label="Points to Buy" value={pointsBought} onChange={setPointsBought} suffix="pts" />
              <CompactInput id="term" label="Loan Term" value={termYears} onChange={setTermYears} suffix="years" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Advanced Lender Pricing <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="cost-pct" label="Cost per Point" value={pointCostPct} onChange={setPointCostPct} suffix="% of loan" />
                  <CompactInput id="reduct" label="Rate Cut per Point" value={rateReductionPerPoint} onChange={setRateReductionPerPoint} suffix="%" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className={`border-l-4 rounded-lg p-5 ${results.monthlySavings > 0 ? "bg-primary/10 border-primary" : "bg-destructive/10 border-destructive"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${results.monthlySavings > 0 ? "text-primary" : "text-destructive"}`}>Break-Even Time</div>
                <div className="text-4xl font-bold text-foreground">{results.breakEvenMonths > 0 ? `${results.breakEvenMonths.toFixed(1)} mo` : "Never"}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">You must stay in the loan for {(results.breakEvenMonths/12).toFixed(1)} years to recover the ${results.upfrontCost.toLocaleString("en-US", {maximumFractionDigits:0})} upfront cost.</div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly Savings", `$${results.monthlySavings.toFixed(2)}/mo`], ["Lifetime Net Savings", `$${results.lifetimeSavings.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${i===1&&results.lifetimeSavings>0?"text-emerald-600":i===1?"text-destructive":""}`}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Points Summary</h3>
                  <div className="space-y-2.5">
                    {results.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                        <span className="text-sm text-muted-foreground">{s.label}:</span>
                        <span className="text-sm font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Comparison</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={results.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="withoutPoints" name="Without Points" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="withPoints" name="With Points" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Should You Buy Mortgage Points?</h2>
            <p>Buying mortgage discount points—often referred to as "buying down the rate"—is one of the most common decisions homebuyers face at closing. It represents a classic financial trade-off: paying cash today to secure guaranteed savings over time. The <strong>Mortgage Points Calculator</strong> cuts through the sales pitch and reveals the exact mathematical point at which buying points becomes a profitable decision.</p>

            <h2 className="text-2xl font-bold mb-3">The Break-Even Calculation</h2>
            <p>The only metric that truly matters when evaluating discount points is the "break-even point." This is the number of months it takes for the accumulation of your monthly payment savings to equal the upfront cash you handed to the lender at closing.</p>
            <p>Consider a $350,000 loan. Your lender offers a base rate of 7.0%. They also offer you the option to buy 2 discount points to lower the rate to 6.5%. The cost is 1% per point, so you must pay $7,000 out-of-pocket at closing. Dropping the rate to 6.5% reduces your monthly payment by exactly $111. To find the break-even point, divide the upfront cost by the monthly savings: $7,000 / $111 = 63 months. You must stay in this exact loan for 5 years and 3 months just to break even. If you stay for 30 years, you will generate a massive lifetime net savings of over $33,000. But if you refinance when rates drop after 3 years, you will lose almost $3,000 on the deal.</p>

            <h2 className="text-2xl font-bold mb-3">The Refinance Risk</h2>
            <p>The biggest risk of buying points is the "refinance trap." Many borrowers buy points during high-rate environments with the expectation of keeping the loan forever. However, if macroeconomic interest rates drop significantly two years later, it makes financial sense to refinance the mortgage to an even lower rate with zero points. When you refinance, the old loan is closed, and any upfront cash you paid for discount points on that original loan is gone forever, completely unrecouped.</p>
            
            <h2 className="text-2xl font-bold mb-3">Lender Pricing Variations</h2>
            <p>It is crucial to understand that there is no legally mandated standard for how much one point reduces your rate. While the traditional rule of thumb is a 0.25% reduction per point, lenders adjust this yield curve daily based on bond market volatility and their internal profit margins. Sometimes 1 point buys a 0.375% reduction (an excellent deal with a fast break-even). Other times, 1 point only buys a 0.125% reduction (a terrible deal with a decade-long break-even). Always use this calculator with your lender's exact pricing sheet to verify if their specific offer is mathematically sound.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-points-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-points-calculator" />
        </div>
      </div>
    </>
  );
}
