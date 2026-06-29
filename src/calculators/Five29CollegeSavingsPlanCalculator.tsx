"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw, GraduationCap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface SavingsResults {
  projectedBalance: number;
  totalContributions: number;
  totalEarnings: number;
  shortfallOrSurplus: number;
  estimatedCost: number;
  schedule: {
    year: number;
    yourContributions: number;
    earnings: number;
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

const calculateSavings = (
  startingBalance: number,
  monthlyContribution: number,
  annualReturn: number,
  yearsToCollege: number,
  estimatedCost: number
): SavingsResults => {
  if (yearsToCollege <= 0) {
    return {
      projectedBalance: startingBalance,
      totalContributions: startingBalance,
      totalEarnings: 0,
      shortfallOrSurplus: startingBalance - estimatedCost,
      estimatedCost,
      schedule: [],
    };
  }

  const monthlyReturn = annualReturn / 100 / 12;

  let currentBalance = startingBalance;
  let runningContributions = startingBalance;
  let runningEarnings = 0;

  const schedule: { year: number; yourContributions: number; earnings: number; balance: number }[] = [];

  for (let year = 1; year <= yearsToCollege; year++) {
    for (let month = 1; month <= 12; month++) {
      const interestEarned = currentBalance * monthlyReturn;
      runningEarnings += interestEarned;
      currentBalance += interestEarned + monthlyContribution;
      runningContributions += monthlyContribution;
    }

    schedule.push({
      year,
      yourContributions: runningContributions,
      earnings: runningEarnings,
      balance: currentBalance,
    });
  }

  return {
    projectedBalance: currentBalance,
    totalContributions: runningContributions,
    totalEarnings: runningEarnings,
    shortfallOrSurplus: currentBalance - estimatedCost,
    estimatedCost,
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

export default function Five29CollegeSavingsPlanCalculator() {
  const [startingBalance, setStartingBalance] = useState("5000");
  const [monthlyContribution, setMonthlyContribution] = useState("300");
  const [annualReturn, setAnnualReturn] = useState("6");
  const [yearsToCollege, setYearsToCollege] = useState("10");
  const [estimatedCost, setEstimatedCost] = useState("120000");
  
  const [results, setResults] = useState<SavingsResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculateSavings(
      parseFloat(startingBalance) || 0,
      parseFloat(monthlyContribution) || 0,
      parseFloat(annualReturn) || 0,
      parseFloat(yearsToCollege) || 0,
      parseFloat(estimatedCost) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setStartingBalance("5000");
    setMonthlyContribution("300");
    setAnnualReturn("6");
    setYearsToCollege("10");
    setEstimatedCost("120000");
    setResults(calculateSavings(5000, 300, 6, 10, 120000));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>529 College Savings Results</title>
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "529 College Savings Plan Calculator" }]} />
      <div className="container-page py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">529 College Savings Plan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="starting-balance"
                label="Current 529 Balance"
                value={startingBalance}
                onChange={setStartingBalance}
                prefix="$"
              />
              <CompactInput
                id="monthly-contribution"
                label="Monthly Contribution"
                value={monthlyContribution}
                onChange={setMonthlyContribution}
                prefix="$"
              />
              <CompactInput
                id="years-to-college"
                label="Years Until College Starts"
                value={yearsToCollege}
                onChange={setYearsToCollege}
                suffix="Years"
              />
              <CompactInput
                id="estimated-cost"
                label="Estimated Total Cost of College"
                value={estimatedCost}
                onChange={setEstimatedCost}
                prefix="$"
              />
              <CompactInput
                id="annual-return"
                label="Expected Annual Return"
                value={annualReturn}
                onChange={setAnnualReturn}
                suffix="%"
              />
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
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    <GraduationCap className="h-4 w-4 text-primary" /> Projected 529 Balance
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${results.projectedBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-foreground/80 font-medium">
                    Available for college expenses in {yearsToCollege} years.
                  </div>
                </div>

                {/* Shortfall or Surplus Banner */}
                {results.shortfallOrSurplus < 0 ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-destructive mb-1">Funding Shortfall</h4>
                    <p className="text-sm text-foreground/80 mb-0">
                      You are projected to fall short of your ${results.estimatedCost.toLocaleString()} goal by <strong>${Math.abs(results.shortfallOrSurplus).toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>. Consider increasing your monthly contribution.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-emerald-700 mb-1">Funding Surplus!</h4>
                    <p className="text-sm text-foreground/80 mb-0">
                      You are projected to exceed your ${results.estimatedCost.toLocaleString()} goal by <strong>${results.shortfallOrSurplus.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>.
                    </p>
                  </div>
                )}

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-2 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-xs uppercase text-muted-foreground mb-1">Total Contributions</span>
                    <span className="text-lg font-bold">${results.totalContributions.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-xs uppercase text-muted-foreground mb-1">Tax-Free Earnings</span>
                    <span className="text-lg font-bold text-emerald-600">${results.totalEarnings.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <h3 className="text-base font-semibold mb-4">529 Balance Growth Over Time</h3>
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
                          dataKey="earnings" 
                          name="Tax-Free Earnings"
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
                      <span className="text-muted-foreground">Your Contributions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-80" />
                      <span className="text-muted-foreground">Tax-Free Earnings</span>
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
                        <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right hidden sm:table-cell">Earnings</th>
                        <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right">Total Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.schedule
                        .filter((s) => s.year % 3 === 0 || s.year === parseInt(yearsToCollege) || s.year === 1)
                        .map((row) => (
                        <tr key={row.year}>
                          <td className="px-4 py-3 text-sm font-medium">Year {row.year}</td>
                          <td className="px-4 py-3 text-sm text-right text-muted-foreground">${row.yourContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3 text-sm text-right text-emerald-600 hidden sm:table-cell">+${row.earnings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
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
          <h2>What is a 529 College Savings Plan?</h2>
          <p>
            A 529 plan is a specialized, tax-advantaged investment account designed specifically to encourage saving for future education costs. Sponsored by states, state agencies, or educational institutions, these plans are legally known as "qualified tuition programs."
          </p>
          <p>
            The primary draw of a 529 plan is its incredible tax benefits. While contributions are made with after-tax money (meaning you don't get a federal tax deduction when you put the money in), the investments grow <strong>completely tax-free</strong>. Furthermore, when you withdraw the money to pay for qualified education expenses, those withdrawals are also 100% exempt from federal and state income taxes.
          </p>

          <h2>The Power of Tax-Free Compounding</h2>
          <p>
            To understand the value of a 529 plan, you must understand tax drag. If you save for college in a standard brokerage account, you have to pay taxes on dividends and capital gains every year. These taxes act as a drag, slowing down the growth of your investments.
          </p>
          <p>
            In a 529 plan, there is zero tax drag. Every penny of interest, dividends, and capital gains is automatically reinvested to compound upon itself. Over an 18-year period (from a child's birth to college enrollment), this tax-free environment can result in a final balance that is tens of thousands of dollars higher than what you would achieve in a taxable account with the exact same contributions.
          </p>

          <h2>What Are "Qualified Education Expenses"?</h2>
          <p>
            To keep your withdrawals tax-free, the money must be spent on qualified expenses. The IRS defines these broadly:
          </p>
          <ul>
            <li>College tuition and mandatory fees.</li>
            <li>Room and board (if the student is enrolled at least half-time).</li>
            <li>Textbooks, supplies, and equipment required for enrollment.</li>
            <li>Computers, software, and internet access used primarily by the beneficiary during their enrollment.</li>
            <li>Up to $10,000 per year in tuition for K-12 public, private, or religious schools.</li>
            <li>Up to $10,000 (lifetime limit) to pay down student loans for the beneficiary or their sibling.</li>
          </ul>

          <h2>What If My Child Doesn't Go to College?</h2>
          <p>
            This is the most common fear parents have about 529 plans, but it is largely unfounded due to the extreme flexibility of the accounts. If your child decides not to attend college, or receives a full scholarship, you have several options:
          </p>
          <ul>
            <li><strong>Change the Beneficiary:</strong> You can transfer the 529 plan to another qualifying family member, including a sibling, cousin, niece, nephew, or even yourself, without any tax penalty.</li>
            <li><strong>Use for Trade School:</strong> 529 funds can be used for eligible trade, vocational, and technical schools.</li>
            <li><strong>The Roth IRA Rollover:</strong> Under new rules introduced by the SECURE 2.0 Act, starting in 2024, you can roll up to $35,000 of unused 529 funds into a Roth IRA for the beneficiary, subject to certain aging requirements and annual limits. This effectively jumpstarts your child's retirement savings.</li>
            <li><strong>Non-Qualified Withdrawal:</strong> If you simply want the cash back for non-educational purposes, you can withdraw it. You will pay standard income tax and a 10% penalty <em>only on the earnings</em>, not on your original contributions.</li>
          </ul>

          <h2>Superfunding a 529 Plan</h2>
          <p>
            For high-net-worth families, 529 plans offer a unique estate planning benefit known as "superfunding." The IRS allows you to front-load five years' worth of the annual gift tax exclusion into a 529 plan at once. For example, in 2024, the annual gift exclusion is $18,000. A married couple could contribute $180,000 to a child's 529 plan in a single day without triggering gift taxes, removing that money from their taxable estate and giving it 18 years to compound tax-free.
          </p>

          <h2>Benefits of Using This Calculator</h2>
          <p>
            College costs are rising rapidly, often outpacing general inflation. By using a 529 College Savings Plan Calculator, parents and grandparents can set realistic expectations early. It visually separates your hard-earned contributions from the tax-free earnings, proving that time in the market is just as important as the amount of money you invest. By identifying potential shortfalls now, you can make small adjustments to your monthly contributions that will prevent the need for crippling student loans down the road.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "Do I get a tax deduction for contributing to a 529 plan?", answer: "Not at the federal level. However, over 30 states offer a state income tax deduction or credit for contributions made to their specific state-sponsored 529 plan. Check your state's specific tax code." },
          { question: "Can I invest in another state's 529 plan?", answer: "Yes. You do not have to use your home state's plan. You can choose any state's plan (for example, if they offer better investment options or lower fees), and the funds can be used at any eligible college in the country." },
          { question: "How does a 529 plan affect financial aid (FAFSA)?", answer: "If the 529 plan is owned by a dependent student or their parent, it is reported as a parental asset on the FAFSA. Parental assets only reduce financial aid eligibility by a maximum of 5.64% of the account value, which is generally a very favorable treatment compared to student-owned assets." },
          { question: "What happens if my child gets a full scholarship?", answer: "If your child receives a tax-free scholarship, you can withdraw an amount equal to the scholarship from the 529 plan without paying the 10% IRS penalty. You will only pay standard income taxes on the earnings portion of the withdrawal." },
          { question: "Are there contribution limits to a 529 plan?", answer: "There are no annual contribution limits (though massive contributions may trigger the gift tax). However, states set aggregate balance limits ranging from $235,000 to over $500,000. Once the account reaches the limit, you can no longer contribute, though it can continue to grow through interest." },
          { question: "What investment options do 529 plans offer?", answer: "Most plans offer mutual fund portfolios, including 'age-based' or 'target enrollment' portfolios. These act like target-date retirement funds, automatically shifting from aggressive stocks to conservative bonds and cash as your child gets closer to college age." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
