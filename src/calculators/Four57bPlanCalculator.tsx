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
  totalInterest: number;
  schedule: {
    year: number;
    yourContributions: number;
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
  annualContribution: number,
  annualReturn: number,
  years: number
): GrowthResults => {
  if (years <= 0) {
    return {
      totalBalance: startingBalance,
      totalContributions: startingBalance,
      totalInterest: 0,
      schedule: [],
    };
  }

  const monthlyReturn = annualReturn / 100 / 12;
  const monthlyContribution = annualContribution / 12;

  let currentBalance = startingBalance;
  let runningContributions = startingBalance;
  let runningInterest = 0;

  const schedule: { year: number; yourContributions: number; interest: number; balance: number }[] = [];

  for (let year = 1; year <= years; year++) {
    let yearContribution = 0;
    let yearInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interestEarned = currentBalance * monthlyReturn;
      yearInterest += interestEarned;
      runningInterest += interestEarned;

      currentBalance += interestEarned + monthlyContribution;
      
      yearContribution += monthlyContribution;
      runningContributions += monthlyContribution;
    }

    schedule.push({
      year,
      yourContributions: runningContributions,
      interest: runningInterest,
      balance: currentBalance,
    });
  }

  return {
    totalBalance: currentBalance,
    totalContributions: runningContributions,
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

export default function Four57bPlanCalculator() {
  const [startingBalance, setStartingBalance] = useState("50000");
  const [annualContribution, setAnnualContribution] = useState("6000");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [years, setYears] = useState("30");
  
  const [results, setResults] = useState<GrowthResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculateGrowth(
      parseFloat(startingBalance) || 0,
      parseFloat(annualContribution) || 0,
      parseFloat(annualReturn) || 0,
      parseFloat(years) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setStartingBalance("50000");
    setAnnualContribution("6000");
    setAnnualReturn("7");
    setYears("30");
    setResults(calculateGrowth(50000, 6000, 7, 30));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>457(b) Growth Results</title>
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "457(b) Plan Calculator" }]} />
      <div className="racira-page-container py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">457(b) Plan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="starting-balance"
                label="Current 457(b) Balance"
                value={startingBalance}
                onChange={setStartingBalance}
                prefix="$"
              />
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <CompactInput
                  id="annual-contribution"
                  label="Total Annual Contribution"
                  value={annualContribution}
                  onChange={setAnnualContribution}
                  prefix="$"
                />
                <p className="text-xs text-muted-foreground mt-2 mb-0">
                  Enter the total dollar amount you contribute per year. Remember the IRS limit is $23,000 for 2024, but the 457(b) "Special 3-Year Catch-Up" allows you to contribute up to double that amount if you are within 3 years of normal retirement age.
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Future 457(b) Balance</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${results.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-foreground/80 font-medium">
                    At the end of {years} years.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-2 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-xs uppercase text-muted-foreground mb-1">Total Contributions</span>
                    <span className="text-lg font-bold">${results.totalContributions.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-xs uppercase text-muted-foreground mb-1">Total Interest Earned</span>
                    <span className="text-lg font-bold text-emerald-600">${results.totalInterest.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
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
                          name="Contributions"
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
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
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-80" />
                      <span className="text-muted-foreground">Contributions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
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
        <div className="max-w-[800px] mt-16 prose prose-slate dark:prose-invert">
          <h2>What is a 457(b) Plan?</h2>
          <p>
            A 457(b) plan is a tax-advantaged retirement savings plan offered primarily to state and local government employees (such as police officers, firefighters, and municipal workers) as well as some non-profit executives. Like a 401(k) or 403(b), it allows employees to defer a portion of their salary into a retirement account where it can grow tax-deferred.
          </p>
          <p>
            However, the 457(b) has two massive advantages over its 401(k) and 403(b) cousins: independent contribution limits and no early withdrawal penalties. This makes it one of the most powerful and flexible retirement vehicles available in the United States.
          </p>

          <h2>The Superpower of the 457(b): No Age 59½ Rule</h2>
          <p>
            In a standard 401(k) or 403(b), if you withdraw money before age 59½, you are hit with a harsh 10% early withdrawal penalty from the IRS on top of standard income taxes.
          </p>
          <p>
            <strong>The 457(b) does not have a 10% early withdrawal penalty.</strong> 
          </p>
          <p>
            Once you separate from service (i.e., you quit, retire, or are fired from the employer sponsoring the plan), you can access your 457(b) funds immediately without any penalty, regardless of your age. You will still pay standard income taxes on the withdrawal, but the lack of a penalty makes the 457(b) the absolute best retirement account for individuals pursuing FIRE (Financial Independence, Retire Early) or those who simply plan to retire in their 40s or 50s.
          </p>

          <h2>Double Limits: The Special 3-Year Catch-Up</h2>
          <p>
            While all retirement accounts have an "Age 50 Catch-Up" provision (allowing you to contribute an extra $7,500 per year starting at age 50), the 457(b) has a unique "Special 3-Year Catch-Up" rule.
          </p>
          <p>
            If you are within three years of the normal retirement age specified by your plan, you can contribute up to <strong>twice the standard annual limit</strong>, provided you did not max out your contributions in previous years. For example, if the standard limit is $23,000, a government worker within 3 years of retirement could potentially contribute up to $46,000 per year into their 457(b). (Note: You cannot use both the Age 50 catch-up and the Special 3-Year catch-up in the same year; you must choose the one that provides the larger benefit).
          </p>

          <h2>Independent Contribution Limits</h2>
          <p>
            If you work for an employer that offers both a 403(b) and a 457(b) (which is common for teachers and hospital workers), the contribution limits are <strong>independent</strong>.
          </p>
          <p>
            Normally, if you have two 401(k)s from different jobs, you can only contribute a total of $23,000 across both accounts. But if you have a 403(b) and a 457(b), you can max out <em>both</em>. This allows a super-saver to shelter up to $46,000 of income per year from taxes ($23,000 in the 403(b) + $23,000 in the 457(b)).
          </p>

          <h2>Governmental vs. Non-Governmental 457(b)s</h2>
          <p>
            It is crucial to know which type of 457(b) you have:
          </p>
          <ul>
            <li><strong>Governmental 457(b):</strong> This is the standard plan for state/local workers. The money is held in a trust, meaning it is legally yours and protected from the employer's creditors. You can roll this money into an IRA when you leave.</li>
            <li><strong>Non-Governmental 457(b):</strong> Often offered to highly compensated executives at non-profits. The money in this plan legally belongs to the employer until it is distributed to you. If the non-profit goes bankrupt, your retirement savings could be seized by their creditors. You also cannot roll a non-governmental 457(b) into an IRA.</li>
          </ul>

          <h2>Benefits of Using This Calculator</h2>
          <p>
            A 457(b) Growth Calculator helps public servants and non-profit workers visualize the long-term impact of their savings. Because many 457(b) participants also have a traditional pension, they often use the 457(b) to fund the "gap" years—the time between retiring early (e.g., at age 52) and when they can officially draw their full pension or Social Security. By estimating your future balance with this calculator, you can determine exactly when you have enough money saved to confidently walk away and enjoy early retirement.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "Is there a 10% penalty for withdrawing from a 457(b) early?", answer: "No. Unlike a 401(k) or IRA, there is no 10% early withdrawal penalty for accessing your 457(b) funds before age 59½, provided you have separated from service with the employer that sponsored the plan." },
          { question: "Can I contribute to a 403(b) and a 457(b) at the same time?", answer: "Yes, and the limits are independent. For 2024, you could theoretically contribute the $23,000 maximum to your 403(b) AND the $23,000 maximum to your 457(b), for a total of $46,000." },
          { question: "What is the 'Special 3-Year Catch-Up'?", answer: "A rule unique to 457(b) plans that allows participants within three years of normal retirement age to contribute up to twice the standard annual limit (e.g., up to $46,000) to make up for years they did not max out the plan." },
          { question: "Are my contributions pre-tax or post-tax?", answer: "Standard 457(b) contributions are pre-tax, which lowers your taxable income for the year. Many employers now also offer a Roth 457(b) option, allowing you to contribute after-tax dollars that will be tax-free upon withdrawal." },
          { question: "Do employers match 457(b) contributions?", answer: "While legally permissible, it is extremely rare. Because most 457(b) participants also participate in a state or local pension system, the employer's pension contribution generally takes the place of a traditional 401(k)-style match." },
          { question: "Can I roll my 457(b) into an IRA?", answer: "If you have a Governmental 457(b), yes, you can roll it into an IRA after leaving your job. However, if you do, the money loses its special status, and any withdrawals from the IRA before age 59½ will be subject to the 10% penalty." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
