"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface BaristaFireResults {
  targetPortfolio: number;
  traditionalTargetPortfolio: number;
  projectedPortfolioAtBaristaAge: number;
  projectedPortfolioAtFullAge: number;
  monthlyShortfallOrSurplus: number;
  yearsToBaristaFire: number;
  isCovered: boolean;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBaristaFire = (inputs: typeof DEFAULTS): BaristaFireResults => {
  const currentAge = parseInt(inputs.currentAge);
  const baristaAge = parseInt(inputs.baristaAge);
  const fullAge = parseInt(inputs.fullAge);
  const currentSavings = parseFloat(inputs.currentSavings);
  const monthlyContribution = parseFloat(inputs.monthlyContribution);
  const annualReturn = parseFloat(inputs.annualReturn) / 100;
  const inflationRate = parseFloat(inputs.inflationRate) / 100;
  const withdrawalRate = parseFloat(inputs.withdrawalRate) / 100;
  
  const annualExpenses = parseFloat(inputs.annualExpenses);
  const baristaIncome = parseFloat(inputs.baristaIncome);

  if ([currentAge, baristaAge, fullAge, currentSavings, monthlyContribution, annualReturn, inflationRate, withdrawalRate, annualExpenses, baristaIncome].some(v => isNaN(v) || v < 0)) {
    return { targetPortfolio: 0, traditionalTargetPortfolio: 0, projectedPortfolioAtBaristaAge: 0, projectedPortfolioAtFullAge: 0, monthlyShortfallOrSurplus: 0, yearsToBaristaFire: 0, isCovered: false, chartData: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }
  if (baristaAge <= currentAge) {
    return { targetPortfolio: 0, traditionalTargetPortfolio: 0, projectedPortfolioAtBaristaAge: 0, projectedPortfolioAtFullAge: 0, monthlyShortfallOrSurplus: 0, yearsToBaristaFire: 0, isCovered: false, chartData: [], isError: true, errorMsg: "Barista FIRE age must be greater than current age." };
  }
  if (fullAge <= baristaAge) {
    return { targetPortfolio: 0, traditionalTargetPortfolio: 0, projectedPortfolioAtBaristaAge: 0, projectedPortfolioAtFullAge: 0, monthlyShortfallOrSurplus: 0, yearsToBaristaFire: 0, isCovered: false, chartData: [], isError: true, errorMsg: "Full retirement age must be greater than Barista FIRE age." };
  }
  if (withdrawalRate === 0) {
    return { targetPortfolio: 0, traditionalTargetPortfolio: 0, projectedPortfolioAtBaristaAge: 0, projectedPortfolioAtFullAge: 0, monthlyShortfallOrSurplus: 0, yearsToBaristaFire: 0, isCovered: false, chartData: [], isError: true, errorMsg: "Withdrawal rate must be greater than 0." };
  }

  const realReturn = (1 + annualReturn) / (1 + inflationRate) - 1;
  const monthlyRate = realReturn / 12;

  // Traditional Target (Full FIRE) = Annual Expenses / Safe Withdrawal Rate
  const traditionalTargetPortfolio = annualExpenses / withdrawalRate;

  // Barista Target = (Annual Expenses - Barista Income) / Safe Withdrawal Rate
  // We floor it at 0. If Barista income > Expenses, target is 0.
  const shortfallToCover = Math.max(0, annualExpenses - baristaIncome);
  const targetPortfolio = shortfallToCover / withdrawalRate;

  const yearsToBaristaFire = baristaAge - currentAge;
  const monthsToBaristaFire = yearsToBaristaFire * 12;

  // Calculate Projected Portfolio at Barista FIRE Age using Future Value of an Annuity formula
  let projectedPortfolioAtBaristaAge = currentSavings;
  if (monthlyRate === 0) {
    projectedPortfolioAtBaristaAge = currentSavings + (monthlyContribution * monthsToBaristaFire);
  } else {
    const fvCurrent = currentSavings * Math.pow(1 + monthlyRate, monthsToBaristaFire);
    const fvContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToBaristaFire) - 1) / monthlyRate);
    projectedPortfolioAtBaristaAge = fvCurrent + fvContributions;
  }

  const isCovered = projectedPortfolioAtBaristaAge >= targetPortfolio;
  
  // Calculate what monthly contribution is actually needed to hit Barista FIRE target
  let requiredMonthly = 0;
  if (targetPortfolio > (currentSavings * Math.pow(1 + monthlyRate, monthsToBaristaFire))) {
    const fvNeeded = targetPortfolio - (currentSavings * Math.pow(1 + monthlyRate, monthsToBaristaFire));
    requiredMonthly = fvNeeded * (monthlyRate / (Math.pow(1 + monthlyRate, monthsToBaristaFire) - 1));
  }
  const monthlyShortfallOrSurplus = monthlyContribution - requiredMonthly;

  // Calculate projection to Full Retirement Age
  // During Barista phase, they withdraw (shortfallToCover) annually, but we'll do it monthly for smoother charting
  const monthsToFullRetirement = (fullAge - baristaAge) * 12;
  const monthlyWithdrawal = shortfallToCover / 12;
  
  let projectedPortfolioAtFullAge = projectedPortfolioAtBaristaAge;

  const chartData = [];
  
  // Accumulation Phase
  let currentBalance = currentSavings;
  chartData.push({
    Age: currentAge,
    "Projected Portfolio": Math.round(currentBalance),
    "Barista FIRE Target": Math.round(targetPortfolio),
    "Full FIRE Target": Math.round(traditionalTargetPortfolio)
  });

  for (let year = 1; year <= yearsToBaristaFire; year++) {
    if (monthlyRate === 0) {
      currentBalance += (monthlyContribution * 12);
    } else {
      const fvCurrent = currentBalance * Math.pow(1 + monthlyRate, 12);
      const fvContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate);
      currentBalance = fvCurrent + fvContributions;
    }
    
    chartData.push({
      Age: currentAge + year,
      "Projected Portfolio": Math.round(currentBalance),
      "Barista FIRE Target": Math.round(targetPortfolio),
      "Full FIRE Target": Math.round(traditionalTargetPortfolio)
    });
  }

  // Barista Phase (Withdrawing gap, or growing if Barista income covers everything)
  for (let year = 1; year <= (fullAge - baristaAge); year++) {
    if (monthlyRate === 0) {
      currentBalance -= (monthlyWithdrawal * 12);
    } else {
      const fvCurrent = currentBalance * Math.pow(1 + monthlyRate, 12);
      // Withdrawal is negative contribution
      const fvWithdrawals = -monthlyWithdrawal * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate);
      currentBalance = fvCurrent + fvWithdrawals;
    }
    
    // Can't go below 0
    currentBalance = Math.max(0, currentBalance);
    projectedPortfolioAtFullAge = currentBalance;

    chartData.push({
      Age: baristaAge + year,
      "Projected Portfolio": Math.round(currentBalance),
      "Barista FIRE Target": Math.round(targetPortfolio),
      "Full FIRE Target": Math.round(traditionalTargetPortfolio)
    });
  }

  return {
    targetPortfolio: Math.round(targetPortfolio),
    traditionalTargetPortfolio: Math.round(traditionalTargetPortfolio),
    projectedPortfolioAtBaristaAge: Math.round(projectedPortfolioAtBaristaAge),
    projectedPortfolioAtFullAge: Math.round(projectedPortfolioAtFullAge),
    monthlyShortfallOrSurplus: Math.round(monthlyShortfallOrSurplus),
    yearsToBaristaFire,
    isCovered,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  currentAge: "35",
  baristaAge: "50",
  fullAge: "65",
  currentSavings: "100000",
  monthlyContribution: "1500",
  annualExpenses: "60000",
  baristaIncome: "24000",
  annualReturn: "9",
  inflationRate: "3",
  withdrawalRate: "4",
  showAdvanced: false
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", step = "any" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function BaristaFireCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BaristaFireResults>(calculateBaristaFire(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateBaristaFire(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBaristaFire(DEFAULTS));
  };

  const faqs = [
    { question: "What is Barista FIRE?", answer: "Barista FIRE is a variation of the Financial Independence, Retire Early (FIRE) movement. Instead of saving enough to cover 100% of your expenses without working, you save enough to cover a portion of them, and work a low-stress, part-time job (like a barista) to cover the rest and potentially get health insurance." },
    { question: "Why choose Barista FIRE over normal FIRE?", answer: "Barista FIRE requires a significantly smaller nest egg, allowing you to quit your stressful corporate job years or even decades earlier. It also prevents the total boredom some people feel in full early retirement by keeping them slightly engaged in the workforce." },
    { question: "How is the Barista FIRE number calculated?", answer: "Take your estimated annual expenses and subtract the income you expect from your part-time job. Divide the remaining amount (the shortfall) by your safe withdrawal rate (typically 4%). This gives you the portfolio size needed to bridge the gap." },
    { question: "What about health insurance?", answer: "Health insurance is a massive expense for early retirees in the US. Many pursue Barista FIRE specifically because companies like Starbucks offer health insurance to part-time employees working as few as 20 hours a week, completely eliminating that line item from their retirement budget." },
    { question: "Does my portfolio continue to grow during Barista FIRE?", answer: "It depends. If your part-time income covers 100% of your expenses, your portfolio will continue to compound untouched until full retirement age (Coast FIRE). If you withdraw from it to bridge a gap, it will grow slower, stay flat, or decrease, depending on your withdrawal rate and market returns." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Barista FIRE Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Barista FIRE Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Find out when you can quit the corporate grind for a low-stress part-time job.</p>

            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="currentAge" label="Current Age" value={inputs.currentAge} onChange={(v: string) => handleChange("currentAge", v)} />
              <CompactInput id="baristaAge" label="Barista Age" value={inputs.baristaAge} onChange={(v: string) => handleChange("baristaAge", v)} />
              <CompactInput id="fullAge" label="Full FIRE Age" value={inputs.fullAge} onChange={(v: string) => handleChange("fullAge", v)} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="currentSavings" label="Current Savings" value={inputs.currentSavings} onChange={(v: string) => handleChange("currentSavings", v)} prefix="$" />
              <CompactInput id="monthlyContribution" label="Monthly Saving" value={inputs.monthlyContribution} onChange={(v: string) => handleChange("monthlyContribution", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="annualExpenses" label="Est. Annual Expenses" value={inputs.annualExpenses} onChange={(v: string) => handleChange("annualExpenses", v)} prefix="$" />
              <CompactInput id="baristaIncome" label="Part-Time Income" value={inputs.baristaIncome} onChange={(v: string) => handleChange("baristaIncome", v)} prefix="$" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Market & Withdrawal Assumptions</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-3 gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="annualReturn" label="Est Return" value={inputs.annualReturn} onChange={(v: string) => handleChange("annualReturn", v)} suffix="%" />
                  <CompactInput id="inflationRate" label="Inflation" value={inputs.inflationRate} onChange={(v: string) => handleChange("inflationRate", v)} suffix="%" />
                  <CompactInput id="withdrawalRate" label="SWR" value={inputs.withdrawalRate} onChange={(v: string) => handleChange("withdrawalRate", v)} suffix="%" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Barista FIRE Target</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-primary tracking-tighter">${results.targetPortfolio.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 ${results.isCovered ? 'border-emerald-500' : 'border-destructive'}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Projected Portfolio @ Age {inputs.baristaAge}</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-4xl font-black tracking-tighter ${results.isCovered ? 'text-emerald-600 dark:text-emerald-500' : 'text-foreground'}`}>${results.projectedPortfolioAtBaristaAge.toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1">
                      {results.isCovered 
                        ? <span className="text-emerald-600 dark:text-emerald-500 font-bold">On track!</span> 
                        : <>Shortfall: <span className="font-bold text-destructive">-${Math.abs(results.monthlyShortfallOrSurplus).toLocaleString()}</span> / month</>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Full FIRE Target</div>
                    <div className="text-xl font-bold text-foreground">${results.traditionalTargetPortfolio.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Time to Barista FIRE</div>
                    <div className="text-xl font-bold text-foreground">{results.yearsToBaristaFire} Years</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm border-l-2 border-orange-500">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Portfolio @ Age {inputs.fullAge}</div>
                    <div className="text-xl font-bold text-foreground">${results.projectedPortfolioAtFullAge.toLocaleString()}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Portfolio Trajectory (Inflation-Adjusted)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Age" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} minTickGap={20} />
                        <YAxis tickFormatter={(val) => `$${(val/1000)}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={60} />
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} labelFormatter={(label) => `Age: ${label}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" dataKey="Projected Portfolio" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} strokeWidth={2} />
                        <Area type="step" dataKey="Barista FIRE Target" stroke="hsl(var(--orange-500))" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                        <Area type="step" dataKey="Full FIRE Target" stroke="hsl(var(--emerald-500))" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                        {/* Reference lines for ages */}
                        <ReferenceLine x={parseInt(inputs.baristaAge)} stroke="hsl(var(--destructive))" strokeOpacity={0.5} strokeDasharray="3 3" label={{ position: 'top', value: 'Barista', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4 italic">
                    Assumes a {inputs.annualReturn}% return with {inputs.inflationRate}% inflation ({((parseFloat(inputs.annualReturn) - parseFloat(inputs.inflationRate))).toFixed(1)}% real return). 
                    After age {inputs.baristaAge}, assumes a monthly withdrawal of ${Math.round(Math.max(0, parseFloat(inputs.annualExpenses) - parseFloat(inputs.baristaIncome)) / 12).toLocaleString()} from the portfolio.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is Barista FIRE?</h2>
            <p>Barista FIRE is a hybrid approach to the Financial Independence, Retire Early (FIRE) movement. Traditional FIRE requires you to save a massive portfolio (usually 25x your annual expenses) so you can stop working entirely. Barista FIRE requires a much smaller portfolio because you continue to work a low-stress, part-time job (like a barista) to cover a portion of your living expenses and, crucially, to secure employer-sponsored health insurance.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Math Behind Barista FIRE</h2>
            <p>In traditional FIRE, if you spend $60,000 a year, you need a $1.5 Million portfolio (assuming a 4% safe withdrawal rate). In Barista FIRE, if you spend $60,000 a year but earn $24,000 from a part-time job, you only have a $36,000 "gap" to fill. At a 4% withdrawal rate, you only need a $900,000 portfolio to bridge that gap. This drastically reduces the time you have to spend in a high-stress corporate career.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Healthcare Factor</h2>
            <p>For Americans, health insurance is one of the most unpredictable and expensive parts of early retirement. Buying insurance on the open market can cost thousands of dollars a month for a family. Companies like Starbucks (which popularized the "Barista" FIRE name), Costco, and UPS offer comprehensive health insurance to part-time employees. By working 20 hours a week, you effectively erase healthcare from your retirement budget.</p>
            
            <h2 className="text-2xl font-bold mb-3">Coast FIRE vs. Barista FIRE</h2>
            <p>These two terms are closely related but slightly different. <strong>Coast FIRE</strong> means you have saved enough money that, if left untouched to grow for decades, it will fund your traditional retirement. During the "coast" phase, your job only needs to cover your current living expenses (you stop saving). <strong>Barista FIRE</strong> implies you are actually drawing down on your portfolio to subsidize your part-time income.</p>
            
            <h2 className="text-2xl font-bold mb-3">Is it Right for You?</h2>
            <p>Barista FIRE is perfect for people experiencing intense corporate burnout who want to slow down in their 40s or 50s but aren't wealthy enough to stop working entirely. It provides structure, social interaction, and income, while freeing up 20+ hours a week for hobbies, family, or building a small business.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/barista-fire-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
