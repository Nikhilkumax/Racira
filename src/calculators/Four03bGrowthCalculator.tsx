"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface GrowthResults {
  totalBalance: number;
  totalContributions: number;
  totalEmployerMatch: number;
  totalInterest: number;
  schedule: {
    year: number;
    yourContributions: number;
    employerMatches: number;
    interest: number;
    balance: number;
  }[];
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const calculateGrowth = (
  startingBalance: number,
  salary: number,
  contributionPct: number,
  employerMatchPct: number,
  employerMatchLimit: number,
  annualReturn: number,
  years: number
): GrowthResults => {
  if (years <= 0) {
    return {
      totalBalance: startingBalance,
      totalContributions: startingBalance,
      totalEmployerMatch: 0,
      totalInterest: 0,
      schedule: [],
    };
  }

  const monthlyReturn = annualReturn / 100 / 12;
  const monthlySalary = salary / 12;
  const monthlyContribution = monthlySalary * (contributionPct / 100);
  
  const matchablePct = Math.min(contributionPct, employerMatchLimit);
  const monthlyMatch = monthlySalary * (matchablePct / 100) * (employerMatchPct / 100);

  let currentBalance = startingBalance;
  let runningContributions = startingBalance;
  let runningMatch = 0;
  let runningInterest = 0;

  const schedule: { year: number; yourContributions: number; employerMatches: number; interest: number; balance: number }[] = [];

  for (let year = 1; year <= years; year++) {
    let yearContribution = 0;
    let yearMatch = 0;
    let yearInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interestEarned = currentBalance * monthlyReturn;
      yearInterest += interestEarned;
      runningInterest += interestEarned;

      currentBalance += interestEarned + monthlyContribution + monthlyMatch;
      
      yearContribution += monthlyContribution;
      runningContributions += monthlyContribution;

      yearMatch += monthlyMatch;
      runningMatch += monthlyMatch;
    }

    schedule.push({
      year,
      yourContributions: runningContributions,
      employerMatches: runningMatch,
      interest: runningInterest,
      balance: currentBalance,
    });
  }

  return {
    totalBalance: currentBalance,
    totalContributions: runningContributions,
    totalEmployerMatch: runningMatch,
    totalInterest: runningInterest,
    schedule,
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-sm text-foreground">
        <p className="font-bold mb-2">Year {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium text-xs mb-1">
            {entry.name}: ${entry.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Four03bGrowthCalculator() {
  const [startingBalance, setStartingBalance] = useState("50000");
  const [salary, setSalary] = useState("65000"); // Lower default salary to reflect teachers/non-profits
  const [contributionPct, setContributionPct] = useState("10");
  const [employerMatchPct, setEmployerMatchPct] = useState("50");
  const [employerMatchLimit, setEmployerMatchLimit] = useState("6");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [years, setYears] = useState("30");
  
  const [results, setResults] = useState<GrowthResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculateGrowth(
      parseFloat(startingBalance) || 0,
      parseFloat(salary) || 0,
      parseFloat(contributionPct) || 0,
      parseFloat(employerMatchPct) || 0,
      parseFloat(employerMatchLimit) || 0,
      parseFloat(annualReturn) || 0,
      parseFloat(years) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setStartingBalance("50000");
    setSalary("65000");
    setContributionPct("10");
    setEmployerMatchPct("50");
    setEmployerMatchLimit("6");
    setAnnualReturn("7");
    setYears("30");
    setResults(calculateGrowth(50000, 65000, 10, 50, 6, 7, 30));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>403(b) Growth Results</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "403(b) Growth Calculator" }]} />
      <div className="container-page py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">403(b) Growth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="starting-balance"
                label="Current 403(b) Balance"
                value={startingBalance}
                onChange={setStartingBalance}
                prefix="$"
              />
              <CompactInput
                id="salary"
                label="Current Annual Salary"
                value={salary}
                onChange={setSalary}
                prefix="$"
              />
              <CompactInput
                id="contribution-pct"
                label="Your Contribution"
                value={contributionPct}
                onChange={setContributionPct}
                suffix="%"
              />
              
              <div className="p-4 bg-muted/30 border border-border rounded-lg flex flex-col gap-3">
                <h3 className="text-sm font-semibold mb-1">Employer Match</h3>
                <CompactInput
                  id="employer-match-pct"
                  label="Match Amount (e.g. 50% or 100%)"
                  value={employerMatchPct}
                  onChange={setEmployerMatchPct}
                  suffix="%"
                />
                <CompactInput
                  id="employer-match-limit"
                  label="Up to what % of salary?"
                  value={employerMatchLimit}
                  onChange={setEmployerMatchLimit}
                  suffix="%"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: "100% match up to 5% of salary" means enter 100 and 5. Leave as 0 if no match.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  id="annual-return"
                  label="Expected Return"
                  value={annualReturn}
                  onChange={setAnnualReturn}
                  suffix="%"
                />
                <CompactInput
                  id="years"
                  label="Years to Grow"
                  value={years}
                  onChange={setYears}
                  suffix="Years"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="flex justify-end hidden-print">
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-4 w-4" /> Print Results
                  </button>
                </div>

                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Future 403(b) Balance</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${results.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-foreground/80 font-medium">
                    At the end of {years} years.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-xs uppercase text-muted-foreground mb-1">Your Total Contributions</span>
                    <span className="text-base sm:text-lg font-bold">${results.totalContributions.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-xs uppercase text-muted-foreground mb-1">Total Employer Match</span>
                    <span className="text-base sm:text-lg font-bold">${results.totalEmployerMatch.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-xs uppercase text-muted-foreground mb-1">Total Interest Earned</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-600">${results.totalInterest.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <h3 className="text-base font-semibold mb-4">Balance Breakdown Over Time</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.schedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `Yr ${val}`}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                          width={60}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area 
                          stackId="1"
                          type="monotone" 
                          dataKey="yourContributions" 
                          name="Your Contributions"
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.6}
                        />
                        <Area 
                          stackId="1"
                          type="monotone" 
                          dataKey="employerMatches" 
                          name="Employer Match"
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.6}
                        />
                        <Area 
                          stackId="1"
                          type="monotone" 
                          dataKey="interest" 
                          name="Interest Earned"
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-80" />
                      <span className="text-muted-foreground">Your Contributions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm bg-violet-500 opacity-80" />
                      <span className="text-muted-foreground">Employer Match</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-80" />
                      <span className="text-muted-foreground">Interest Earned</span>
                    </div>
                  </div>
                </div>

                {/* 5. Breakdown Table Snippet */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <h3 className="text-sm font-semibold p-4 border-b border-border bg-muted/30">Milestone Balances</h3>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-4 py-2 text-xs font-semibold text-muted-foreground">Year</th>
                        <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right">Contributions</th>
                        <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right hidden sm:table-cell">Employer Match</th>
                        <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right hidden sm:table-cell">Interest</th>
                        <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right">Total Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.schedule
                        .filter((s) => s.year % 5 === 0 || s.year === parseInt(years) || s.year === 1)
                        .map((row) => (
                        <tr key={row.year}>
                          <td className="px-4 py-3 text-sm font-medium">Year {row.year}</td>
                          <td className="px-4 py-3 text-sm text-right text-muted-foreground">${row.yourContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3 text-sm text-right text-muted-foreground hidden sm:table-cell">${row.employerMatches.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3 text-sm text-right text-emerald-600 hidden sm:table-cell">+${row.interest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold">${row.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[800px] mx-auto mt-16 prose prose-slate dark:prose-invert">
          <h2>What is a 403(b) Growth Calculator?</h2>
          <p>
            A 403(b) Growth Calculator is a specialized financial planning tool designed to forecast the future value of a 403(b) retirement account. By taking into account your current savings, ongoing payroll contributions, employer match (if applicable), and an expected rate of return, it provides a clear picture of how compound interest will build your retirement nest egg over time.
          </p>
          <p>
            A 403(b) plan, often referred to as a tax-sheltered annuity (TSA) plan, is essentially the public sector and non-profit equivalent of a 401(k). These plans are offered by public schools, universities, hospitals, churches, and 501(c)(3) organizations. The tax advantages and contribution limits are nearly identical to those of a 401(k), but the investment options sometimes differ, traditionally leaning toward annuities, though mutual funds are very common today.
          </p>

          <h2>The Math of Compounding in a 403(b)</h2>
          <p>
            The true power of any retirement account lies in compound interest. This means you earn interest not only on the money you contribute but also on the interest that money has already earned. Over decades, this snowball effect is what turns consistent, modest monthly savings into a multi-million dollar portfolio.
          </p>
          <p>
            When you view the chart generated by the calculator, you will see three distinct layers of growth:
          </p>
          <ol>
            <li><strong>Your Contributions:</strong> The straight line representing the actual dollars deducted from your paycheck.</li>
            <li><strong>Employer Match:</strong> The additional linear growth provided by your employer (though many 403(b) plans unfortunately do not offer a match).</li>
            <li><strong>Interest Earned:</strong> The sharply curving, exponential area that eventually dominates the entire chart. After 20 to 30 years, the vast majority of your retirement wealth will consist entirely of compound interest.</li>
          </ol>

          <h2>Special Rules for 403(b) Contributions</h2>
          <p>
            While 403(b) plans share the standard contribution limits with 401(k)s (e.g., $23,000 in 2024, plus a $7,500 catch-up for those 50 and older), 403(b)s have a unique "15-Year Rule" that sets them apart.
          </p>
          <p>
            If you have worked for the same eligible employer (such as a school district or hospital) for 15 years or more, and your previous contributions averaged less than $5,000 per year, you may be allowed to contribute up to $3,000 extra per year, up to a lifetime maximum of $15,000. This is an incredibly valuable catch-up provision for long-tenured educators and healthcare workers who may not have been able to save aggressively early in their careers.
          </p>

          <h2>Dealing with 403(b) Fees</h2>
          <p>
            One crucial factor to consider when estimating your "Expected Return" is the impact of fees. Historically, many 403(b) plans—particularly in K-12 school districts—have been heavily populated by high-fee variable annuities sold by insurance brokers.
          </p>
          <p>
            If your investments are charging you 2% to 3% annually in administrative and mortality fees, you must subtract that from your expected gross market return. For example, if the market returns 8%, but your fees are 2.5%, your actual return is only 5.5%. Over 30 years, that difference will cost you hundreds of thousands of dollars in lost compounding. It is highly recommended to seek out low-cost index mutual funds within your 403(b) lineup whenever possible.
          </p>

          <h2>Benefits of Using This Calculator</h2>
          <p>
            For teachers, nurses, and non-profit employees, pension plans are often a major part of the retirement picture. However, pensions rarely replace 100% of your pre-retirement income. Using a 403(b) Growth Calculator helps you understand exactly how much supplemental income you are building to bridge that gap. By seeing the mathematical reality of your savings rate today, you can make informed adjustments to secure the comfortable, stress-free retirement you have earned through your service.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "What is the difference between a 403(b) and a 401(k)?", answer: "Functionally and mathematically, they are almost identical. The main difference is who offers them. 401(k)s are for private, for-profit companies. 403(b)s are exclusively for public schools, universities, hospitals, and 501(c)(3) tax-exempt organizations." },
          { question: "Do 403(b) plans offer employer matches?", answer: "Some do, but it is much less common than in the corporate 401(k) world. Because many 403(b) participants also have a state or organizational pension plan, the employer often views the pension as their 'match' or contribution to your retirement." },
          { question: "Are my 403(b) contributions pre-tax?", answer: "Yes, standard 403(b) contributions are made with pre-tax dollars, lowering your current taxable income. The money grows tax-deferred, and you pay standard income tax when you withdraw it in retirement. Many plans now also offer a Roth 403(b) option, which uses after-tax dollars." },
          { question: "What is the '15-Year Catch-Up' rule?", answer: "It is a special provision unique to 403(b) plans. If you have worked for the same employer for 15+ years and haven't maximized contributions in the past, you can contribute an extra $3,000 per year, up to a $15,000 lifetime limit, independent of the standard age-50 catch-up." },
          { question: "Why are annuities so common in 403(b) plans?", answer: "When the 403(b) was created in 1958, it was called a Tax-Sheltered Annuity (TSA) and only annuities were allowed. In 1974, the law changed to allow mutual funds, but insurance companies still dominate the sales forces in many school districts. You should always compare the fees of the annuities vs. the mutual funds offered." },
          { question: "Can I have a 403(b) and an IRA at the same time?", answer: "Yes. Contributing to a 403(b) at work does not prevent you from also opening and contributing to a traditional or Roth IRA on your own, provided you meet the income requirements for those accounts." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
