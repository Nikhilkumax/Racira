"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface Plan529Results {
  totalCollegeCost: number;
  totalSavingsAtStart: number;
  shortfallOrSurplus: number;
  monthlyRequiredToCover: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculate529 = (inputs: typeof DEFAULTS): Plan529Results => {
  const currentSavings = parseFloat(inputs.currentSavings);
  const monthlyContribution = parseFloat(inputs.monthlyContribution);
  const yearsToCollege = parseInt(inputs.yearsToCollege);
  const expectedReturn = parseFloat(inputs.expectedReturn) / 100;
  const annualCollegeCost = parseFloat(inputs.annualCollegeCost);
  const collegeDuration = parseInt(inputs.collegeDuration);
  const collegeInflation = parseFloat(inputs.collegeInflation) / 100;

  if ([currentSavings, monthlyContribution, yearsToCollege, expectedReturn, annualCollegeCost, collegeDuration, collegeInflation].some(v => isNaN(v) || v < 0)) {
    return { totalCollegeCost: 0, totalSavingsAtStart: 0, shortfallOrSurplus: 0, monthlyRequiredToCover: 0, chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid numbers." };
  }
  if (yearsToCollege === 0) {
    return { totalCollegeCost: 0, totalSavingsAtStart: 0, shortfallOrSurplus: 0, monthlyRequiredToCover: 0, chartData: [], schedule: [], isError: true, errorMsg: "Years to college must be greater than 0." };
  }

  const monthlyRate = expectedReturn / 12;
  const totalMonths = yearsToCollege * 12;

  // Calculate savings at start of college
  let futureSavings = currentSavings * Math.pow(1 + monthlyRate, totalMonths);
  if (monthlyRate > 0) {
    futureSavings += monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  } else {
    futureSavings += monthlyContribution * totalMonths;
  }

  // Calculate total college cost accounting for inflation at start of college
  let totalCollegeCost = 0;
  for (let i = 0; i < collegeDuration; i++) {
    const costForYear = annualCollegeCost * Math.pow(1 + collegeInflation, yearsToCollege + i);
    totalCollegeCost += costForYear;
  }

  const shortfallOrSurplus = futureSavings - totalCollegeCost;
  
  // Calculate required monthly to cover cost
  let requiredMonthly = 0;
  const targetFutureValue = totalCollegeCost;
  const futureOfCurrent = currentSavings * Math.pow(1 + monthlyRate, totalMonths);
  const remainingNeeded = Math.max(0, targetFutureValue - futureOfCurrent);
  
  if (monthlyRate > 0) {
    requiredMonthly = remainingNeeded * (monthlyRate / (Math.pow(1 + monthlyRate, totalMonths) - 1));
  } else {
    requiredMonthly = remainingNeeded / totalMonths;
  }

  // Chart data and schedule
  const chartData = [];
  const schedule = [];
  
  let currentBalance = currentSavings;
  let totalContributions = currentSavings;

  for (let year = 1; year <= yearsToCollege; year++) {
    for (let m = 1; m <= 12; m++) {
      currentBalance = currentBalance * (1 + monthlyRate) + monthlyContribution;
      totalContributions += monthlyContribution;
    }
    chartData.push({
      Year: `Year ${year}`,
      "Total Contributions": Math.round(totalContributions),
      "Interest Earned": Math.round(currentBalance - totalContributions),
      "Total Balance": Math.round(currentBalance)
    });
    schedule.push({
      year,
      contributions: Math.round(totalContributions),
      interest: Math.round(currentBalance - totalContributions),
      balance: Math.round(currentBalance)
    });
  }

  return {
    totalCollegeCost: Math.round(totalCollegeCost),
    totalSavingsAtStart: Math.round(futureSavings),
    shortfallOrSurplus: Math.round(shortfallOrSurplus),
    monthlyRequiredToCover: Math.round(requiredMonthly),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  currentSavings: "10000",
  monthlyContribution: "300",
  yearsToCollege: "10",
  expectedReturn: "7",
  annualCollegeCost: "25000",
  collegeDuration: "4",
  collegeInflation: "4",
  showAdvanced: false
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function Plan529Calculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<Plan529Results>(calculate529(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculate529(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculate529(DEFAULTS));
  };

  const faqs = [
    { question: "What is a 529 Plan?", answer: "A 529 plan is an investment account that offers tax-free earnings growth and tax-free withdrawals when the funds are used to pay for qualified education expenses." },
    { question: "What are qualified education expenses?", answer: "Qualified expenses include tuition, mandatory fees, room and board, books, and computers. It can also be used for up to $10,000 per year for K-12 tuition." },
    { question: "Are 529 contributions tax deductible?", answer: "Federal contributions are not tax-deductible, but many states offer state income tax deductions or tax credits for contributions made to your home state's 529 plan." },
    { question: "What if my child doesn't go to college?", answer: "You can transfer the 529 plan to another eligible family member without penalty. Alternatively, thanks to the SECURE 2.0 Act, unused 529 funds (up to $35,000) can be rolled over to a Roth IRA for the beneficiary under certain conditions. Non-qualified withdrawals are subject to income tax and a 10% penalty on earnings." },
    { question: "How does a 529 plan affect financial aid?", answer: "A 529 plan owned by a dependent student or their parent is considered a parental asset on the FAFSA. Parental assets only reduce aid by a maximum of 5.64% of the asset's value, which is much lower than the 20% rate for student-owned assets." },
    { question: "Can I use a 529 plan for student loans?", answer: "Yes, you can use up to a lifetime limit of $10,000 from a 529 plan to repay qualified student loans for the beneficiary or their siblings." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "529 Plan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">529 Plan Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Estimate how much your 529 plan will grow and if it will cover future college costs.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="currentSavings" label="Current Savings" value={inputs.currentSavings} onChange={(v: string) => handleChange("currentSavings", v)} prefix="$" />
              <CompactInput id="monthlyContribution" label="Monthly Contribution" value={inputs.monthlyContribution} onChange={(v: string) => handleChange("monthlyContribution", v)} prefix="$" />
              <CompactInput id="yearsToCollege" label="Years to College" value={inputs.yearsToCollege} onChange={(v: string) => handleChange("yearsToCollege", v)} suffix="Years" />
              <CompactInput id="expectedReturn" label="Expected Annual Return" value={inputs.expectedReturn} onChange={(v: string) => handleChange("expectedReturn", v)} suffix="%" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Advanced College Cost Options</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="annualCollegeCost" label="Current Annual College Cost" value={inputs.annualCollegeCost} onChange={(v: string) => handleChange("annualCollegeCost", v)} prefix="$" />
                  <CompactInput id="collegeDuration" label="College Duration" value={inputs.collegeDuration} onChange={(v: string) => handleChange("collegeDuration", v)} suffix="Years" />
                  <CompactInput id="collegeInflation" label="College Cost Inflation" value={inputs.collegeInflation} onChange={(v: string) => handleChange("collegeInflation", v)} suffix="%" />
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
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total College Cost</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-primary tracking-tighter">${results.totalCollegeCost.toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Estimated future cost</div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">529 Plan Balance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-foreground tracking-tighter">${results.totalSavingsAtStart.toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">At start of college</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Shortfall / Surplus</div>
                    <div className={`text-2xl font-bold ${results.shortfallOrSurplus >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                      {results.shortfallOrSurplus >= 0 ? '+' : '-'}${Math.abs(results.shortfallOrSurplus).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Monthly Required</div>
                    <div className="text-2xl font-bold text-primary">${results.monthlyRequiredToCover.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Current Monthly</div>
                    <div className="text-2xl font-bold text-foreground">${parseFloat(inputs.monthlyContribution || '0').toLocaleString()}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">529 Plan Growth Projection</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Year" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${(val/1000)}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={50} />
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" dataKey="Total Contributions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.8} />
                        <Area type="monotone" dataKey="Interest Earned" stackId="1" stroke="hsl(150, 80%, 40%)" fill="hsl(150, 80%, 40%)" fillOpacity={0.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Growth Schedule</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Year</th>
                          <th className="px-4 py-3 font-semibold text-right">Contributions</th>
                          <th className="px-4 py-3 font-semibold text-right text-emerald-600 dark:text-emerald-500">Interest Earned</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">Total Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.slice(0, 10).map((row) => (
                          <tr key={row.year} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-foreground font-medium">Year {row.year}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">${row.contributions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500">${row.interest.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">${row.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a 529 Plan?</h2>
            <p>A 529 plan is a tax-advantaged savings plan designed to encourage saving for future education costs. Sponsored by states, state agencies, or educational institutions, these plans are legally known as "qualified tuition programs." There are two main types of 529 plans: education savings plans and prepaid tuition plans. This calculator focuses on the more common education savings plans, which allow you to open an investment account to save for the beneficiary's future qualified higher education expenses.</p>
            
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Contributions to a 529 plan are invested in options like mutual funds and ETFs. The account grows tax-deferred, meaning you don't pay annual taxes on investment gains. When money is withdrawn for qualified education expenses, the withdrawal is completely tax-free at the federal level, and usually at the state level as well. Our calculator uses compound interest to project future value: <code>Future Value = P * (1 + r/n)^(n*t) + PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]</code>, where P is initial principal, r is annual rate, n is compounding periods, t is years, and PMT is monthly contribution.</p>
            
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The <strong>Total College Cost</strong> shows the estimated future cost of college after accounting for inflation over the years until enrollment. The <strong>529 Plan Balance</strong> is your projected savings at the start of college. The <strong>Shortfall / Surplus</strong> indicates whether you are on track or falling behind your goal. The <strong>Monthly Required</strong> figure calculates the exact monthly contribution needed from today to fully fund the total college cost by the time the student enrolls.</p>
            
            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>College inflation is often higher than general economic inflation, typically averaging 4% to 6% per year. When selecting an expected return, a common estimate for a diversified portfolio heavily weighted in stocks is 7% to 8%, though this should shift to more conservative, lower-yielding investments as the college enrollment date approaches.</p>
            
            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The advanced options allow you to input current annual college costs, the duration of college, and a specific college cost inflation rate. By default, it assumes a typical 4-year degree with a baseline cost and standard inflation, but adjusting these allows you to tailor the projection to specific institutions, whether public, private, in-state, or out-of-state.</p>
            
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>If you start with $10,000 when your child is born (18 years to college) and contribute $300 a month with an expected 7% return, your plan will grow to over $150,000 by the time they start college. However, if you wait until they are 10 years old, you would need to contribute nearly $1,000 a month to reach that same $150,000 goal, demonstrating the power of compound interest over time.</p>
            
            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Start saving as early as possible to maximize compound growth. Many state plans offer "age-based" or "target-date" portfolios that automatically adjust from aggressive to conservative investments as your child gets closer to college age. Also, consider front-loading contributions if possible, as federal gift tax laws allow you to contribute a lump sum equivalent to five years of gifts at once without triggering gift taxes.</p>
            
            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using a 529 plan calculator helps you set realistic savings goals and track your progress. It takes the guesswork out of planning for education expenses, ensuring you understand exactly what it takes to fund your child's future without resorting entirely to burdensome student loans.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/529-plan-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
