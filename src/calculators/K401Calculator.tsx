"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface K401Inputs {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualSalary: number;
  contributionPct: number;
  employerMatchPct: number;
  employerMatchLimit: number;
  annualReturn: number;
  annualSalaryIncrease: number;
  inflationRate: number;
}

interface K401Results {
  finalBalance: number;
  inflationAdjusted: number;
  totalEmployeeContribs: number;
  totalEmployerContribs: number;
  totalContribs: number;
  interestGained: number;
  initialBalance: number;
  years: number;
  monthlyWithdrawal4pct: number;
  yearlyData: { year: number; age: number; salary: number; employeeContrib: number; employerContrib: number; balance: number; }[];
}

const DEFAULTS = {
  currentAge: "30",
  retirementAge: "65",
  currentBalance: "25000",
  annualSalary: "75000",
  contributionPct: "6",
  employerMatchPct: "50",
  employerMatchLimit: "6",
  annualReturn: "7",
  annualSalaryIncrease: "2",
  inflationRate: "3"
};

const calculate401k = (inputs: K401Inputs): K401Results => {
  const {
    currentAge, retirementAge, currentBalance, annualSalary, contributionPct,
    employerMatchPct, employerMatchLimit, annualReturn, annualSalaryIncrease, inflationRate
  } = inputs;

  const years = Math.max(0, retirementAge - currentAge);
  if (years <= 0) {
    return {
      finalBalance: currentBalance, inflationAdjusted: currentBalance,
      totalEmployeeContribs: 0, totalEmployerContribs: 0, totalContribs: 0,
      interestGained: 0, initialBalance: currentBalance, years: 0,
      monthlyWithdrawal4pct: (currentBalance * 0.04) / 12, yearlyData: []
    };
  }

  const returnRate = annualReturn / 100;
  const salaryIncrease = annualSalaryIncrease / 100;
  const inflation = inflationRate / 100;

  const MAX_CONTRIBUTION = 23000;
  const CATCH_UP = 7500;

  const yearlyData: { year: number; age: number; salary: number; employeeContrib: number; employerContrib: number; balance: number; }[] = [];
  let currentBal = currentBalance;
  let totalEmployeeContribs = 0;
  let totalEmployerContribs = 0;
  let salary = annualSalary;

  for (let y = 1; y <= years; y++) {
    const ageAtYear = currentAge + y;
    const catchUp = ageAtYear >= 50 ? CATCH_UP : 0;
    const maxAllowed = MAX_CONTRIBUTION + catchUp;

    const employeeContrib = Math.min(salary * (contributionPct / 100), maxAllowed);
    const actualEmployerMatch = (salary * (Math.min(contributionPct, employerMatchLimit) / 100)) * (employerMatchPct / 100);

    const totalNewContribs = employeeContrib + actualEmployerMatch;
    currentBal = currentBal * (1 + returnRate) + totalNewContribs;

    totalEmployeeContribs += employeeContrib;
    totalEmployerContribs += actualEmployerMatch;

    yearlyData.push({
      year: y,
      age: ageAtYear,
      salary: Math.round(salary),
      employeeContrib: Math.round(employeeContrib),
      employerContrib: Math.round(actualEmployerMatch),
      balance: Math.round(currentBal),
    });

    salary *= (1 + salaryIncrease);
  }

  const inflationAdjusted = currentBal / Math.pow(1 + inflation, years);
  const totalContribs = totalEmployeeContribs + totalEmployerContribs;
  const interestGained = currentBal - currentBalance - totalContribs;
  const monthlyWithdrawal4pct = (currentBal * 0.04) / 12;

  return {
    finalBalance: currentBal,
    inflationAdjusted,
    totalEmployeeContribs,
    totalEmployerContribs,
    totalContribs,
    interestGained,
    initialBalance: currentBalance,
    years,
    monthlyWithdrawal4pct,
    yearlyData,
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

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
      </div>
    );
  }
  return null;
};

const K401Calculator = () => {
  const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAge] = useState(DEFAULTS.retirementAge);
  const [currentBalance, setCurrentBalance] = useState(DEFAULTS.currentBalance);
  const [annualSalary, setAnnualSalary] = useState(DEFAULTS.annualSalary);
  const [contributionPct, setContributionPct] = useState(DEFAULTS.contributionPct);
  
  const [employerMatchPct, setEmployerMatchPct] = useState(DEFAULTS.employerMatchPct);
  const [employerMatchLimit, setEmployerMatchLimit] = useState(DEFAULTS.employerMatchLimit);
  const [annualReturn, setAnnualReturn] = useState(DEFAULTS.annualReturn);
  const [annualSalaryIncrease, setAnnualSalaryIncrease] = useState(DEFAULTS.annualSalaryIncrease);
  const [inflationRate, setInflationRate] = useState(DEFAULTS.inflationRate);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<K401Results | null>(null);

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    const inputs: K401Inputs = {
      currentAge: parseFloat(currentAge) || 0,
      retirementAge: parseFloat(retirementAge) || 0,
      currentBalance: parseFloat(currentBalance) || 0,
      annualSalary: parseFloat(annualSalary) || 0,
      contributionPct: parseFloat(contributionPct) || 0,
      employerMatchPct: parseFloat(employerMatchPct) || 0,
      employerMatchLimit: parseFloat(employerMatchLimit) || 0,
      annualReturn: parseFloat(annualReturn) || 0,
      annualSalaryIncrease: parseFloat(annualSalaryIncrease) || 0,
      inflationRate: parseFloat(inflationRate) || 0,
    };
    setResults(calculate401k(inputs));
  };

  const reset = () => {
    setCurrentAge(DEFAULTS.currentAge);
    setRetirementAge(DEFAULTS.retirementAge);
    setCurrentBalance(DEFAULTS.currentBalance);
    setAnnualSalary(DEFAULTS.annualSalary);
    setContributionPct(DEFAULTS.contributionPct);
    setEmployerMatchPct(DEFAULTS.employerMatchPct);
    setEmployerMatchLimit(DEFAULTS.employerMatchLimit);
    setAnnualReturn(DEFAULTS.annualReturn);
    setAnnualSalaryIncrease(DEFAULTS.annualSalaryIncrease);
    setInflationRate(DEFAULTS.inflationRate);
    setShowAdvanced(false);
    
    setResults(calculate401k({
      currentAge: parseFloat(DEFAULTS.currentAge),
      retirementAge: parseFloat(DEFAULTS.retirementAge),
      currentBalance: parseFloat(DEFAULTS.currentBalance),
      annualSalary: parseFloat(DEFAULTS.annualSalary),
      contributionPct: parseFloat(DEFAULTS.contributionPct),
      employerMatchPct: parseFloat(DEFAULTS.employerMatchPct),
      employerMatchLimit: parseFloat(DEFAULTS.employerMatchLimit),
      annualReturn: parseFloat(DEFAULTS.annualReturn),
      annualSalaryIncrease: parseFloat(DEFAULTS.annualSalaryIncrease),
      inflationRate: parseFloat(DEFAULTS.inflationRate),
    }));
  };

  const pieData = results ? [
    { name: "Initial Balance", value: results.initialBalance, color: "hsl(220, 60%, 30%)" },
    { name: "Your Contributions", value: results.totalEmployeeContribs, color: "hsl(211, 100%, 50%)" },
    { name: "Employer Match", value: results.totalEmployerContribs, color: "hsl(142, 71%, 45%)" },
    { name: "Investment Growth", value: Math.max(0, results.interestGained), color: "hsl(48, 96%, 53%)" },
  ].filter(d => d.value > 0) : [];

  const faqs = [
    { question: "What is a 401(k) plan?", answer: "A 401(k) is an employer-sponsored retirement savings plan in the United States that allows employees to contribute a portion of their pre-tax salary to a tax-deferred investment account. Contributions reduce your taxable income in the year made, and investments grow tax-deferred until withdrawal in retirement." },
    { question: "How much should I contribute to my 401(k)?", answer: "At minimum, contribute enough to capture your employer's full match — this is a guaranteed 50–100% return on your money. Beyond that, many financial advisors recommend saving 10–15% of your gross income for retirement." },
    { question: "What is an employer match and how does it work?", answer: "An employer match is when your company contributes to your 401(k) based on your own contributions. A common match is '50% up to 6% of salary' — if you contribute 6% of an $80,000 salary ($4,800), your employer adds 50% × $4,800 = $2,400 for free." },
    { question: "What is the 401(k) contribution limit for 2024?", answer: "For 2024, the 401(k) employee contribution limit is $23,000. Workers aged 50 and older can make an additional $7,500 catch-up contribution, for a total of $30,500. The combined limit (employee + employer contributions) is $69,000 for 2024." },
    { question: "What rate of return should I use for my 401(k) projection?", answer: "The S&P 500 has historically returned about 10% annually (nominal) or 7% after inflation. Financial planners often use 6–7% as a conservative projection for a diversified portfolio in a 401(k)." },
    { question: "When can I withdraw from my 401(k) without penalty?", answer: "You can withdraw from your 401(k) penalty-free starting at age 59½. Withdrawals before this age typically incur a 10% early withdrawal penalty plus ordinary income tax on the amount withdrawn." },
    { question: "What is the 4% rule for retirement withdrawal?", answer: "The 4% rule suggests withdrawing 4% of your retirement portfolio in the first year of retirement, then adjusting for inflation each subsequent year. Historically, this rate has allowed retirees a high probability of not outliving their savings over a 30-year retirement." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "401K Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">401K Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT COLUMN: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            {/* Normal Tier */}
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="current-age"
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
              />
              <CompactInput
                id="retirement-age"
                label="Retirement Age"
                value={retirementAge}
                onChange={setRetirementAge}
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <CompactInput
                id="current-balance"
                label="Current Balance"
                value={currentBalance}
                onChange={setCurrentBalance}
                prefix="$"
              />
              <CompactInput
                id="annual-salary"
                label="Annual Salary"
                value={annualSalary}
                onChange={setAnnualSalary}
                prefix="$"
              />
              <CompactInput
                id="contribution-pct"
                label="Your Contribution"
                value={contributionPct}
                onChange={setContributionPct}
                suffix="%"
              />
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
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="col-span-2 text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Employer & Growth Settings</div>
                  <CompactInput
                    id="employer-match-pct"
                    label="Employer Match"
                    value={employerMatchPct}
                    onChange={setEmployerMatchPct}
                    suffix="%"
                  />
                  <CompactInput
                    id="employer-match-limit"
                    label="Match Limit"
                    value={employerMatchLimit}
                    onChange={setEmployerMatchLimit}
                    suffix="%"
                  />
                  <CompactInput
                    id="annual-return"
                    label="Expected Return"
                    value={annualReturn}
                    onChange={setAnnualReturn}
                    suffix="%"
                  />
                  <CompactInput
                    id="salary-increase"
                    label="Salary Increase"
                    value={annualSalaryIncrease}
                    onChange={setAnnualSalaryIncrease}
                    suffix="%"
                  />
                  <div className="col-span-2">
                    <CompactInput
                      id="inflation"
                      label="Inflation Rate"
                      value={inflationRate}
                      onChange={setInflationRate}
                      suffix="%"
                    />
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
            {results && (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Balance at Retirement</p>
                  <p className="text-4xl font-black text-primary">${results.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    In today's dollars (adjusted for inflation), this is worth <strong>${results.inflationAdjusted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>.
                  </p>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Your Total Contribs</p>
                    <p className="text-lg font-bold text-foreground">${results.totalEmployeeContribs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Employer Match</p>
                    <p className="text-lg font-bold text-foreground">${results.totalEmployerContribs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Investment Growth</p>
                    <p className="text-lg font-bold text-green-600">${results.interestGained.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                {/* 3. Monthly Income Card */}
                <div className="flex justify-between items-center p-4 rounded-lg border border-border bg-card">
                  <div>
                    <p className="font-bold text-base">Estimated Monthly Retirement Income</p>
                    <p className="text-sm text-muted-foreground">Based on the 4% withdrawal rule</p>
                  </div>
                  <div className="font-black text-2xl text-primary">${results.monthlyWithdrawal4pct.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 4. Chart - Recharts */}
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-4 text-center">Portfolio Breakdown</p>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 max-w-[200px] mx-auto">
                      {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                            {entry.name}
                          </div>
                          <span className="font-medium text-foreground">${entry.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Year-by-Year Table Snippet */}
                  <div className="bg-card border border-border rounded-lg p-0 flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-foreground p-4 pb-2 text-center border-b border-border">Growth Milestones</p>
                    <div className="overflow-y-auto max-h-[260px]">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left font-semibold text-muted-foreground px-4 py-2">Age</th>
                            <th className="text-right font-semibold text-muted-foreground px-4 py-2">Contributed</th>
                            <th className="text-right font-semibold text-muted-foreground px-4 py-2">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {results.yearlyData.filter((row, idx) => idx % 5 === 0 || idx === results.yearlyData.length - 1).map((row) => (
                            <tr key={row.age} className="hover:bg-muted/30">
                              <td className="px-4 py-2 font-medium">{row.age}</td>
                              <td className="px-4 py-2 text-right">${(row.employeeContrib + row.employerContrib).toLocaleString()}</td>
                              <td className="px-4 py-2 text-right font-bold text-primary">${row.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 border-t border-border mt-auto">
                      Showing 5-year milestones
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          
          <article className="prose-finance">
            <h2>What Is a 401(k) Calculator?</h2>
            <p>A 401(k) calculator projects how much money you'll accumulate in your employer-sponsored retirement account by the time you retire. It factors in your current balance, annual contributions (up to the IRS limit), employer matching contributions, expected investment returns, salary increases, and inflation to provide a comprehensive retirement savings forecast.</p>
            <p>Our advanced 401(k) calculator includes all factors that significantly impact your retirement outcome: employer match with configurable match percentage and limits, annual salary increase projections, inflation-adjusted purchasing power, and a complete growth table showing milestones until retirement.</p>

            <h2>How 401(k) Growth Is Calculated</h2>
            <p>Each year, your 401(k) grows from three sources: (1) your own contributions (pre-tax, up to $23,000 in 2024), (2) your employer's matching contributions (free money), and (3) investment returns on all accumulated assets. The compound growth formula is applied annually. Over 35 years at 7%, the compounding effect can generate 5–8× the total amount you personally contributed.</p>

            <h2>How to Use This 401(k) Calculator</h2>
            <p>Enter your current age and target retirement age. Input your current 401(k) balance, annual salary, and the percentage you contribute. Under Advanced Options, set your employer's match percentage and the salary ceiling for matching. Use 7% for annual return as a historically-backed conservative estimate. Enable salary increase to model promotions. The inflation field shows what your balance will be worth in today's dollars, giving you a realistic sense of purchasing power at retirement.</p>

            <h2>The Employer Match: Free Money You Can't Ignore</h2>
            <p>The employer 401(k) match is the single most powerful benefit in your compensation package. A typical match of "50% up to 6% of salary" means if you earn $80,000 and contribute 6% ($4,800), your employer adds $2,400 — a guaranteed 50% return on that portion of your savings before any investment return. Over 35 years at 7%, that $2,400/year in employer contributions alone grows to approximately $385,000. Never leave this money on the table.</p>

            <h2>Example Scenario</h2>
            <p>Michael, age 30, earns $75,000 with a $25,000 existing 401(k) balance. He contributes 6% ($4,500/year), and his employer matches 50% up to 6% ($2,250/year). Assuming 7% annual return, 2% salary growth, and 3% inflation, by age 65 his 401(k) grows to approximately $1.6 million in nominal terms, or about $580,000 in today's purchasing power. This supports a monthly withdrawal of $5,400 using the 4% rule — comparable to a solid middle-class retirement income.</p>

            <h2>2024 401(k) Contribution Limits</h2>
            <p>The IRS sets annual limits on how much you can contribute to your 401(k). For 2024: the employee contribution limit is $23,000 (up from $22,500 in 2023). Workers aged 50 and older can contribute an additional $7,500 "catch-up" contribution, for a total of $30,500. The combined limit including employer contributions is $69,000. Maximizing contributions, especially in your 50s with catch-up contributions, can significantly accelerate retirement savings in the final years before retirement.</p>

            <h2>Tips to Maximize Your 401(k)</h2>
            <p>Always contribute at least enough to get the full employer match first. Then maximize an IRA (Roth or Traditional). Then maximize the 401(k) to the full $23,000 limit. Increase your contribution rate by 1% each time you receive a raise. Choose low-cost index funds — expense ratios of 0.03–0.10% vs 1%+ for actively managed funds can mean hundreds of thousands of dollars difference at retirement. At age 50+, take full advantage of the $7,500 catch-up contribution. Review and rebalance your asset allocation annually.</p>
          </article>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/401k-calculator" />
          <PopularCalculators exclude="/calculator/401k-calculator" />
        </div>
      </div>
    </>
  );
};

export default K401Calculator;
