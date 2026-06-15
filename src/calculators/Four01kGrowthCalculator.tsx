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

  // Monthly breakdown
  const monthlyReturn = annualReturn / 100 / 12;
  const monthlySalary = salary / 12;
  const monthlyContribution = monthlySalary * (contributionPct / 100);
  
  // Employer match logic: e.g. 50% match up to 6% of salary
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

export default function Four01kGrowthCalculator() {
  const [startingBalance, setStartingBalance] = useState("50000");
  const [salary, setSalary] = useState("80000");
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
    setSalary("80000");
    setContributionPct("10");
    setEmployerMatchPct("50");
    setEmployerMatchLimit("6");
    setAnnualReturn("7");
    setYears("30");
    setResults(calculateGrowth(50000, 80000, 10, 50, 6, 7, 30));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>401(k) Growth Results</title>
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "401(k) Growth Calculator" }]} />
      <div className="container-page py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">401(k) Growth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="starting-balance"
                label="Current 401(k) Balance"
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
                  Example: "100% match up to 5% of salary" means enter 100 and 5.
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
              >
                <Calculator className="h-4 w-4" /> Calculate Growth
              </button>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Future 401(k) Balance</div>
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
          <h2>What is a 401(k) Growth Calculator?</h2>
          <p>
            A 401(k) Growth Calculator is a financial modeling tool that projects the future value of your employer-sponsored retirement account. By factoring in your current balance, your annual contributions, your employer's matching formula, and an estimated rate of return, it visualizes the profound impact of compound interest over time.
          </p>
          <p>
            The 401(k) is the primary retirement savings vehicle for millions of Americans. Because the money is invested in the stock and bond markets, the growth isn't linear—it's exponential. The earnings you make in year one are reinvested, meaning in year two, you earn interest on your original contributions PLUS interest on your interest. This calculator breaks down exactly how that math plays out over decades.
          </p>

          <h2>Understanding Your Employer Match</h2>
          <p>
            One of the most critical components of a 401(k) is the employer match. This is essentially "free money" that your company contributes to your account, provided you contribute your own money first.
          </p>
          <p>
            Matches are usually expressed in two parts: a percentage of your contribution, up to a certain percentage of your salary. 
          </p>
          <ul>
            <li><strong>Example 1:</strong> "100% match up to 5% of salary." If you earn $100,000 and contribute 5% ($5,000), your employer gives you another $5,000. Total invested: $10,000.</li>
            <li><strong>Example 2:</strong> "50% match up to 6% of salary." If you contribute 6% ($6,000), your employer puts in half of that amount, which is 3% ($3,000). Total invested: $9,000.</li>
          </ul>
          <p>
            Financial advisors unanimously recommend contributing at least enough to get your full employer match. Leaving that match on the table is the equivalent of declining a guaranteed raise.
          </p>

          <h2>The Power of Compound Interest</h2>
          <p>
            The chart generated by this calculator perfectly illustrates compound interest. Notice the three distinct sections of the area chart:
          </p>
          <ol>
            <li><strong>Your Contributions:</strong> This grows in a straight, linear line. This is the hard cash you are putting in from your paycheck.</li>
            <li><strong>Employer Match:</strong> This also grows linearly, representing the free money from your company.</li>
            <li><strong>Interest Earned:</strong> Look at the shape of this section. It starts very small, almost invisible in the early years. But by year 20 or 30, it curves upward sharply and dwarfs your actual contributions. This is compounding in action. In a healthy 30-year 401(k), the vast majority of your final balance will simply be interest.</li>
          </ol>

          <h2>How Much Should I Contribute?</h2>
          <p>
            A general rule of thumb suggests saving 15% of your gross income for retirement. This 15% includes your employer match. So, if your employer matches 5%, you only need to contribute 10% to hit that goal.
          </p>
          <p>
            However, this varies wildly based on when you start saving. If you start at age 22, 10% to 15% might be plenty. If you wait until age 45 to start saving, you might need to contribute 25% or more to reach a comfortable retirement balance.
          </p>

          <h2>What Rate of Return Should I Expect?</h2>
          <p>
            The default "Expected Return" in the calculator is often set around 7%. Here is the context behind that number:
          </p>
          <ul>
            <li>Historically, the U.S. stock market (S&P 500) has returned an average of about 10% per year before inflation.</li>
            <li>Inflation averages about 2.5% to 3% historically.</li>
            <li>By using a 7% return, you are modeling <strong>inflation-adjusted growth</strong>. This means the final multi-million dollar number you see on the screen represents what that money can buy in <em>today's</em> dollars, making it much easier to plan for your future lifestyle.</li>
            <li>If you are invested heavily in bonds, or you are nearing retirement and shifting to a conservative portfolio, you should lower the expected return to 4% or 5%.</li>
          </ul>

          <h2>Benefits of Using This Calculator</h2>
          <p>
            Using a 401(k) Growth Calculator provides crucial perspective. When you are deciding whether to increase your contribution from 6% to 8%, the difference in your bi-weekly paycheck might only be $50. But when you plug that 2% increase into the calculator and let it compound over 30 years, you will often find that it results in hundreds of thousands of dollars in extra retirement wealth. This tool bridges the gap between today's small decisions and tomorrow's massive results.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "Are my 401(k) contributions taxed?", answer: "In a traditional 401(k), your contributions are pre-tax, meaning they reduce your taxable income for the year you make them. You won't pay taxes on that money until you withdraw it in retirement. If you have a Roth 401(k), you pay taxes now, but your withdrawals in retirement are completely tax-free." },
          { question: "Is the employer match money mine immediately?", answer: "Not always. Many companies use a 'vesting schedule.' For example, a 4-year graded vesting schedule means you own 25% of the employer's contributions after year one, 50% after year two, etc. If you leave the company before you are fully vested, you forfeit the unvested portion. Your own contributions, however, are always 100% yours." },
          { question: "What is the maximum I can contribute to a 401(k)?", answer: "The IRS sets limits that change frequently due to inflation. For 2024, the employee contribution limit is $23,000. If you are age 50 or older, you can make an additional 'catch-up' contribution of $7,500, bringing your total to $30,500." },
          { question: "Does the IRS limit include the employer match?", answer: "No, the $23,000 limit only applies to your personal contributions. There is a higher overall limit (employee + employer combined), which is $69,000 for 2024, meaning your employer has plenty of room to add their match." },
          { question: "What happens if the stock market crashes?", answer: "Stock market crashes are a normal part of investing. Because you are investing new money from every paycheck, a crash actually means you are buying shares at lower prices. As long as you don't panic and sell your investments, market recoveries historically wipe out the losses over time." },
          { question: "Can I take money out of my 401(k) early?", answer: "Yes, but it is highly discouraged. If you withdraw funds before age 59½, you will owe standard income taxes on the amount PLUS a 10% early withdrawal penalty to the IRS. It also severely damages the compounding interest potential of your account." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
