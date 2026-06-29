"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, PiggyBank } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HYSAInputs {
  principal: number;
  apy: number;
  monthlyDeposit: number;
  years: number;
  compoundFreq: number;
  annualIncrease: number;
}

interface HYSAResults {
  finalBalance: number;
  totalDeposited: number;
  totalInterest: number;
  effectiveYield: number;
  chartData: { year: number; principal: number; interest: number; total: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateHYSA = (inputs: HYSAInputs): HYSAResults => {
  const { principal, apy, monthlyDeposit, years, compoundFreq, annualIncrease } = inputs;
  
  // Convert APY back to nominal rate based on compounding frequency
  // APY = (1 + r/n)^n - 1  =>  r = n * ((1 + APY)^(1/n) - 1)
  const apyDecimal = apy / 100;
  let nominalRate = 0;
  if (apyDecimal > 0) {
    nominalRate = compoundFreq * (Math.pow(1 + apyDecimal, 1 / compoundFreq) - 1);
  }
  
  const ratePerPeriod = nominalRate / compoundFreq;
  const periodsPerYear = compoundFreq;
  const totalPeriods = years * periodsPerYear;
  
  // Calculate month-by-month for accurate annual increases and compounding
  let balance = principal;
  let totalDeposited = principal;
  let currentMonthlyDeposit = monthlyDeposit;
  
  const chartData = [{ year: 0, principal: principal, interest: 0, total: principal }];
  
  // We simulate monthly because deposits are monthly, even if compounding is daily
  let simBalance = principal;
  let simDeposited = principal;
  let simTotalInterest = 0;
  
  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      // Add interest for the month based on the effective monthly rate derived from nominal
      const monthlyRate = Math.pow(1 + nominalRate / compoundFreq, compoundFreq / 12) - 1;
      const interestEarned = simBalance * monthlyRate;
      
      simBalance += interestEarned;
      simTotalInterest += interestEarned;
      
      // Add deposit at end of month
      simBalance += currentMonthlyDeposit;
      simDeposited += currentMonthlyDeposit;
    }
    
    chartData.push({
      year: y,
      principal: Math.round(simDeposited),
      interest: Math.round(simTotalInterest),
      total: Math.round(simBalance)
    });
    
    // Increase monthly deposit for next year
    if (annualIncrease > 0) {
      currentMonthlyDeposit *= (1 + annualIncrease / 100);
    }
  }

  const finalBalance = simBalance;
  const totalInterest = simTotalInterest;
  
  const effectiveYield = simDeposited > 0 ? (totalInterest / simDeposited) * 100 : 0;

  const summaryStats = [
    { label: "Total Contributions", value: `$${simDeposited.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Earned", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Final APY", value: `${apy.toFixed(2)}%` },
    { label: "Time Horizon", value: `${years} Years` },
  ];

  const breakdown = [
    { label: "Initial Deposit", amount: `$${principal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Subsequent Contributions", amount: `$${(simDeposited - principal).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-primary" },
    { label: "Total Interest Accrued", amount: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-emerald-500" },
    { label: "Final Account Balance", amount: `$${finalBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true },
  ];

  return {
    finalBalance, totalDeposited: simDeposited, totalInterest, effectiveYield, chartData, summaryStats, breakdown
  };
};

const DEFAULTS = { principal: "10000", apy: "5.0", monthlyDeposit: "500", years: "3", compoundFreq: "365", annualIncrease: "0" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function HighYieldSavingsCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [apy, setApy] = useState(DEFAULTS.apy);
  const [monthlyDeposit, setMonthlyDeposit] = useState(DEFAULTS.monthlyDeposit);
  const [years, setYears] = useState(DEFAULTS.years);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [compoundFreq, setCompoundFreq] = useState(DEFAULTS.compoundFreq);
  const [annualIncrease, setAnnualIncrease] = useState(DEFAULTS.annualIncrease);

  const [results, setResults] = useState<HYSAResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateHYSA({
      principal: parseFloat(principal) || 0,
      apy: parseFloat(apy) || 0,
      monthlyDeposit: parseFloat(monthlyDeposit) || 0,
      years: parseFloat(years) || 1,
      compoundFreq: parseInt(compoundFreq) || 365,
      annualIncrease: parseFloat(annualIncrease) || 0
    }));
  };

  const handleReset = () => {
    setPrincipal(DEFAULTS.principal); setApy(DEFAULTS.apy); setMonthlyDeposit(DEFAULTS.monthlyDeposit); setYears(DEFAULTS.years);
    setCompoundFreq(DEFAULTS.compoundFreq); setAnnualIncrease(DEFAULTS.annualIncrease);
    setShowAdvanced(false);
    setResults(calculateHYSA({ principal: parseFloat(DEFAULTS.principal), apy: parseFloat(DEFAULTS.apy), monthlyDeposit: parseFloat(DEFAULTS.monthlyDeposit), years: parseFloat(DEFAULTS.years), compoundFreq: parseInt(DEFAULTS.compoundFreq), annualIncrease: parseFloat(DEFAULTS.annualIncrease) }));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>HYSA Projection</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.find((p: any) => p.dataKey === "total")?.value || 0;
      const principal = payload.find((p: any) => p.dataKey === "principal")?.value || 0;
      const interest = payload.find((p: any) => p.dataKey === "interest")?.value || 0;
      return (
        <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
          <p className="font-bold text-muted-foreground mb-2">Year {label}</p>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-primary">Contributions:</span>
            <span>${principal.toLocaleString("en-US")}</span>
          </div>
          <div className="flex justify-between gap-4 mb-2">
            <span className="text-emerald-500">Interest:</span>
            <span>${interest.toLocaleString("en-US")}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-border font-bold">
            <span>Total Balance:</span>
            <span>${total.toLocaleString("en-US")}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const faqs = [
    { question: "What is a high-yield savings account (HYSA)?", answer: "A HYSA is a specialized savings account that earns a significantly higher interest rate (often 10x to 15x higher) than traditional bank savings accounts. They are primarily offered by online banks, which pass the savings from lower overhead costs onto their customers in the form of higher APYs." },
    { question: "What is the difference between APY and interest rate?", answer: "The nominal interest rate is the base rate the bank pays. APY (Annual Percentage Yield) is the actual return you earn over a year because it includes the effect of compound interest. A 4.9% interest rate compounded daily results in a 5.0% APY. Always compare accounts by APY, as it reflects your true earnings." },
    { question: "Is my money safe in a HYSA?", answer: "Yes. As long as the bank is FDIC-insured (or NCUA-insured for credit unions), your money is protected up to $250,000 per depositor, per institution. If the bank fails, the federal government guarantees you will not lose your insured deposits." },
    { question: "Why do HYSA rates change?", answer: "HYSA rates are variable, meaning they can change at any time without notice. They are heavily influenced by the Federal Reserve's benchmark interest rate. When the Fed raises rates to combat inflation, HYSA rates go up. When the Fed cuts rates, HYSA yields drop." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "High-Yield Savings Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">High-Yield Savings Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <CompactInput id="prin" label="Initial Deposit" value={principal} onChange={setPrincipal} prefix="$" />
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="apy" label="APY (Annual Yield)" value={apy} onChange={setApy} suffix="%" />
              <CompactInput id="years" label="Time Horizon" value={years} onChange={setYears} suffix="yrs" />
            </div>
            <CompactInput id="mo" label="Monthly Contribution" value={monthlyDeposit} onChange={setMonthlyDeposit} prefix="$" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1.5">Compounding Frequency</label>
                    <select value={compoundFreq} onChange={(e) => setCompoundFreq(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="365">Daily (Standard for HYSA)</option>
                      <option value="12">Monthly</option>
                      <option value="1">Annually</option>
                    </select>
                  </div>
                  <CompactInput id="inc" label="Annual Contribution Increase" value={annualIncrease} onChange={setAnnualIncrease} suffix="%" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Final Balance</div>
                  <div className="text-4xl font-bold text-primary tracking-tighter mb-2">
                    ${results.finalBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" /> You earned ${results.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} in free interest.
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[14px] py-3 px-3">{item.label}</td>
                            <td className={`text-[14px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Growth Trajectory</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          </linearGradient>
                          <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="principal" stackId="1" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrin)" strokeWidth={2} name="Contributions" />
                        <Area type="monotone" dataKey="interest" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorInt)" strokeWidth={2} name="Interest Earned" />
                        <Area type="monotone" dataKey="total" stroke="none" fill="none" name="Total Balance" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a High-Yield Savings Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A high-yield savings calculator is a financial tool designed to project the future growth of cash held in a High-Yield Savings Account (HYSA). While traditional brick-and-mortar banks often pay negligible interest (around 0.01% to 0.10%), online-only banks and fintech platforms regularly offer highly competitive Annual Percentage Yields (APYs). This calculator models exactly how your initial deposit and regular monthly contributions will grow over time through the massive mathematical advantage of compound interest.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Compound Interest</h2>
              <p className="text-muted-foreground leading-relaxed">
                The secret behind exponential wealth growth is compound interest—you earn interest not just on the money you deposited, but also on the interest that money previously earned. Most high-yield savings accounts compound interest daily and credit it to your account on the last day of the month. This means every single day, your balance grows slightly, and the next day's interest is calculated on that new, higher balance. Over a period of five to ten years, this snowball effect generates thousands of dollars in "free" money without requiring you to take on the risk of the stock market.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">Why Use a HYSA?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A HYSA is the absolute best vehicle for holding an emergency fund or saving for short-term goals (like a house down payment or a wedding within 1 to 3 years). Because the funds are FDIC-insured (up to $250,000), you cannot lose your principal. Unlike a Certificate of Deposit (CD), a HYSA is completely liquid, meaning you can withdraw your cash instantly without facing early withdrawal penalties if an emergency strikes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Key Variables in the Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your <strong>Initial Deposit</strong> acts as the foundation of your compound growth. The <strong>Annual Percentage Yield (APY)</strong> is the critical engine; even a 1% difference in APY can result in thousands of dollars of difference over a decade. Your <strong>Monthly Contribution</strong> is the fuel that accelerates the growth. By utilizing the advanced option to model an <strong>Annual Contribution Increase</strong>, you can simulate raising your savings rate as your salary grows over your career, providing a highly realistic projection of your future wealth.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={[
            { question: "What is a high-yield savings account (HYSA)?", answer: "A HYSA is a specialized savings account that earns a significantly higher interest rate (often 10x to 15x higher) than traditional bank savings accounts. They are primarily offered by online banks, which pass the savings from lower overhead costs onto their customers in the form of higher APYs." },
            { question: "What is the difference between APY and interest rate?", answer: "The nominal interest rate is the base rate the bank pays. APY (Annual Percentage Yield) is the actual return you earn over a year because it includes the effect of compound interest. A 4.9% interest rate compounded daily results in a 5.0% APY. Always compare accounts by APY, as it reflects your true earnings." },
            { question: "Is my money safe in a HYSA?", answer: "Yes. As long as the bank is FDIC-insured (or NCUA-insured for credit unions), your money is protected up to $250,000 per depositor, per institution. If the bank fails, the federal government guarantees you will not lose your insured deposits." },
            { question: "Why do HYSA rates change?", answer: "HYSA rates are variable, meaning they can change at any time without notice. They are heavily influenced by the Federal Reserve's benchmark interest rate. When the Fed raises rates to combat inflation, HYSA rates go up. When the Fed cuts rates, HYSA yields drop." }
          ]} pageUrl="https://racira.com/calculator/high-yield-savings-calculator" />
          <PopularCalculators exclude="/calculator/high-yield-savings-calculator" />
        </div>
      </div>
    </>
  );
}
