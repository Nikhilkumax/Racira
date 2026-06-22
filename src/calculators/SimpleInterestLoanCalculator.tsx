"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Percent, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SimpleResult {
  totalInterest: number;
  totalRepayment: number;
  monthlyPayment: number | null;
  principal: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSimpleInterest(principal: number, interestRate: number, termValue: number, termUnit: "days" | "months" | "years", isInstallment: boolean): SimpleResult {
  // Simple Interest Formula: I = P * R * T
  const rateDecimal = interestRate / 100;
  
  let timeInYears = 0;
  if (termUnit === "days") {
    // Exact days / 365
    timeInYears = termValue / 365;
  } else if (termUnit === "months") {
    timeInYears = termValue / 12;
  } else {
    timeInYears = termValue;
  }

  const totalInterest = principal * rateDecimal * timeInYears;
  const totalRepayment = principal + totalInterest;

  let monthlyPayment = null;
  if (isInstallment && timeInYears > 0) {
    const totalMonths = termUnit === "months" ? termValue : (termUnit === "years" ? termValue * 12 : Math.round(termValue / 30.416));
    if (totalMonths > 0) {
      monthlyPayment = totalRepayment / totalMonths;
    }
  }

  const chartData = [
    { name: "Principal", value: principal, color: "hsl(var(--primary))" },
    { name: "Simple Interest", value: totalInterest, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Principal Amount", value: `$${principal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Rate", value: `${interestRate}%` },
    { label: "Time Period", value: `${termValue} ${termUnit}` },
    { label: "Calculated Time (Years)", value: `${timeInYears.toFixed(3)} yrs` },
    { label: "Repayment Structure", value: isInstallment ? "Fixed Monthly Installments" : "Lump Sum at Maturity" },
  ];

  return { totalInterest, totalRepayment, monthlyPayment, principal, chartData, summaryStats };
}

const DEFAULTS = { principal: "10000", interestRate: "5.5", termValue: "3", termUnit: "years" as const, isInstallment: true };

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

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function SimpleInterestLoanCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [termValue, setTermValue] = useState(DEFAULTS.termValue);
  const [termUnit, setTermUnit] = useState<"days" | "months" | "years">(DEFAULTS.termUnit);
  const [isInstallment, setIsInstallment] = useState(DEFAULTS.isInstallment);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<SimpleResult | null>(null);

  const calc = () => setResults(calcSimpleInterest(parseFloat(principal)||0, parseFloat(interestRate)||0, parseFloat(termValue)||0, termUnit, isInstallment));
  const reset = () => { setPrincipal(DEFAULTS.principal); setInterestRate(DEFAULTS.interestRate); setTermValue(DEFAULTS.termValue); setTermUnit(DEFAULTS.termUnit); setIsInstallment(DEFAULTS.isInstallment); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is simple interest?", answer: "Simple interest is calculated solely on the original principal amount of a loan or deposit. Unlike compound interest, simple interest does not charge you 'interest on interest.' The formula is basic: Interest = Principal × Rate × Time (I = PRT). The rate is always expressed as an annual percentage, and time is expressed in years." },
    { question: "Where is simple interest used?", answer: "Simple interest is most commonly used for short-term personal loans, auto loans, and peer-to-peer lending (like borrowing from a family member). Traditional mortgages and credit cards do not use simple interest; they use complex amortized or daily compounding interest structures." },
    { question: "What is an add-on interest installment loan?", answer: "In a simple interest installment loan (often called an 'add-on' loan), the lender calculates the total simple interest for the entire term of the loan upfront. They add that total interest to the principal, and then divide the entire sum equally over the number of months in the term. This means your monthly payment is perfectly fixed, but you do not save any interest if you pay the loan off early." },
    { question: "How are days calculated in simple interest?", answer: "When calculating simple interest for a period of days, 'Exact Interest' divides the number of days by 365. Some commercial lenders use 'Ordinary Interest' (the Banker's Rule), which divides the days by 360, slightly increasing the amount of interest you pay. This calculator uses the Exact Interest (365-day) method." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Simple Interest Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Simple Interest Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="principal" label="Principal Amount" value={principal} onChange={setPrincipal} prefix="$" />
              <CompactInput id="rate" label="Annual Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Time Period (T)</label>
              <div className="flex">
                <input type="number" step="any" value={termValue} onChange={e => setTermValue(e.target.value)} className="w-20 h-10 px-3 text-sm border border-input border-r-0 rounded-l-md bg-background outline-none focus:ring-2 focus:ring-primary/20" />
                <select value={termUnit} onChange={e => setTermUnit(e.target.value as "days"|"months"|"years")} className="flex-1 h-10 px-2 text-sm border border-input rounded-r-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="days">Days (Exact 365)</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Repayment Structure <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setIsInstallment(true)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${isInstallment ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Monthly Installments</button>
                    <button onClick={() => setIsInstallment(false)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${!isInstallment ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Lump Sum at End</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Percent className="h-4 w-4" /> Calculate Interest
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Simple Interest (I = PRT)</div>
                <div className="text-4xl font-bold text-foreground">${results.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Repayment (P + I)", `$${results.totalRepayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`], ["Fixed Monthly Payment", results.monthlyPayment ? `$${results.monthlyPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}` : "N/A"]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Details</h3>
                  <div className="space-y-2.5">
                    {results.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                        <span className="text-sm text-muted-foreground">{s.label}:</span>
                        <span className="text-sm font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                  <h3 className="text-base font-bold mb-2 w-full text-left">Cost Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                        {results.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                    {results.chartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Math of Simple Interest</h2>
            <p>Simple interest is the most fundamental concept in borrowing and lending. It operates on a straightforward mathematical equation: <strong>I = P × R × T</strong> (Interest = Principal × Rate × Time). The <strong>Simple Interest Loan Calculator</strong> instantly applies this formula to determine exactly how much a loan or investment will cost over its lifespan.</p>

            <h2 className="text-2xl font-bold mb-3">Simple vs. Compound Interest</h2>
            <p>The defining characteristic of simple interest is that it is calculated <em>only</em> on the original principal amount. If you borrow $10,000 at 5% simple interest for 3 years, the interest generated each year is exactly $500 ($10,000 × 0.05). In year two, the interest is still $500. Over 3 years, the total interest is $1,500.</p>
            <p>In contrast, compound interest (like what is used on credit cards or high-yield savings accounts) calculates interest on the principal <em>and</em> on the previously accumulated interest. Simple interest heavily favors the borrower, while compound interest heavily favors the lender/investor.</p>

            <h2 className="text-2xl font-bold mb-3">The "Add-On" Installment Trap</h2>
            <p>While the I=PRT formula is simple, lenders can structure the repayment in ways that make the loan mathematically much more expensive. The most common structure is the "Add-On" simple interest loan, frequently used by "buy-here-pay-here" auto dealerships and personal loan companies.</p>
            <p>The lender calculates the total simple interest for the entire 3-year term upfront (e.g., $1,500). They add that to the principal ($10,000) for a total of $11,500, and divide it by 36 months to get a fixed monthly payment of $319.44. The trap here is that even as you pay down the principal over the three years, the lender is still charging you interest as if you held the full $10,000 for the entire term. This effectively doubles the true Annual Percentage Rate (APR) compared to a standard amortizing loan.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/simple-interest-loan-calculator" />
          <PopularCalculators exclude="/calculator/simple-interest-loan-calculator" />
        </div>
      </div>
    </>
  );
}
