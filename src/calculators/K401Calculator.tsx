"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { RotateCcw } from "lucide-react";

const K401Calculator = () => {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [currentBalance, setCurrentBalance] = useState("25000");
  const [annualSalary, setAnnualSalary] = useState("75000");
  const [contributionPct, setContributionPct] = useState("6");
  const [employerMatchPct, setEmployerMatchPct] = useState("3");
  const [employerMatchLimit, setEmployerMatchLimit] = useState("6");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [annualSalaryIncrease, setAnnualSalaryIncrease] = useState("2");
  const [inflationRate, setInflationRate] = useState("3");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // 2024 401k limits
  const MAX_CONTRIBUTION = 23000;
  const CATCH_UP = 7500;

  const handleCalculate = () => {
    setShowResults(true);
    const age = parseInt(currentAge) || 30;
    const retAge = parseInt(retirementAge) || 65;
    const years = Math.max(0, retAge - age);
    const balance = parseFloat(currentBalance) || 0;
    let salary = parseFloat(annualSalary) || 0;
    const contribPct = parseFloat(contributionPct) || 0;
    const matchPct = parseFloat(employerMatchPct) || 0;
    const matchLimit = parseFloat(employerMatchLimit) || 0;
    const returnRate = (parseFloat(annualReturn) || 0) / 100;
    const salaryIncrease = (parseFloat(annualSalaryIncrease) || 0) / 100;
    const inflation = (parseFloat(inflationRate) || 0) / 100;

    const yearlyData: any[] = [];
    let currentBal = balance;
    let totalEmployeeContribs = 0;
    let totalEmployerContribs = 0;

    for (let y = 1; y <= years; y++) {
      const ageAtYear = age + y;
      const catchUp = ageAtYear >= 50 ? CATCH_UP : 0;
      const maxAllowed = MAX_CONTRIBUTION + catchUp;

      const employeeContrib = Math.min(salary * (contribPct / 100), maxAllowed);
      const employerContrib = salary * Math.min(contribPct, matchLimit) / 100 * (matchPct / 100) * (100 / Math.max(matchLimit, 1));
      // Actually: employer match = salary × min(employee%, matchLimit%) × matchPct%/100
      const actualEmployerMatch = (salary * (Math.min(contribPct, matchLimit) / 100)) * (matchPct / 100);

      const monthlyReturn = returnRate / 12;
      const periods = 12;

      // Grow existing balance
      const balGrowth = currentBal * returnRate;
      // Future value of contributions made throughout the year (annuity)
      const empFV = (rn: number) => {
        if (rn === 0) return employeeContrib;
        return (employeeContrib / 12) * ((Math.pow(1 + rn, 12) - 1) / rn);
      };
      const erFV = (rn: number) => {
        if (rn === 0) return actualEmployerMatch;
        return (actualEmployerMatch / 12) * ((Math.pow(1 + rn, 12) - 1) / rn);
      };

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
    const interestGained = currentBal - balance - totalContribs;
    const monthlyWithdrawal4pct = (currentBal * 0.04) / 12;

    setResults({
      finalBalance: currentBal,
      inflationAdjusted,
      totalEmployeeContribs,
      totalEmployerContribs,
      totalContribs,
      interestGained,
      initialBalance: balance,
      years,
      monthlyWithdrawal4pct,
      yearlyData,
    });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentAge("30"); setRetirementAge("65");
    setCurrentBalance("25000"); setAnnualSalary("75000");
    setContributionPct("6"); setEmployerMatchPct("3");
    setEmployerMatchLimit("6"); setAnnualReturn("7");
    setAnnualSalaryIncrease("2"); setInflationRate("3");
    setResults(null);
  };

  const faqs = [
    { question: "What is a 401(k) plan?", answer: "A 401(k) is an employer-sponsored retirement savings plan in the United States that allows employees to contribute a portion of their pre-tax salary to a tax-deferred investment account. Contributions reduce your taxable income in the year made, and investments grow tax-deferred until withdrawal in retirement. Many employers offer matching contributions, making it one of the best employee benefits available." },
    { question: "How much should I contribute to my 401(k)?", answer: "At minimum, contribute enough to capture your employer's full match — this is a guaranteed 50–100% return on your money. Beyond that, many financial advisors recommend saving 10–15% of your gross income for retirement. The 2024 contribution limit is $23,000 ($30,500 if age 50 or older with catch-up contributions). Maximize contributions whenever possible, especially in high-income years." },
    { question: "What is an employer match and how does it work?", answer: "An employer match is when your company contributes to your 401(k) based on your own contributions. A common match is '50% up to 6% of salary' — if you contribute 6% of a $80,000 salary ($4,800), your employer adds 50% × $4,800 = $2,400 for free. Always contribute at least enough to get the full employer match; otherwise you're leaving free money on the table." },
    { question: "What is the 401(k) contribution limit for 2024?", answer: "For 2024, the 401(k) employee contribution limit is $23,000 (up from $22,500 in 2023). Workers aged 50 and older can make an additional $7,500 catch-up contribution, for a total of $30,500. The combined limit (employee + employer contributions) is $69,000 for 2024. These limits are adjusted annually for inflation." },
    { question: "What rate of return should I use for my 401(k) projection?", answer: "The S&P 500 has historically returned about 10% annually (nominal) or 7% after inflation. Financial planners often use 6–7% as a conservative projection for a diversified portfolio in a 401(k). Use a lower rate (5–6%) if you're more conservatively invested (bonds + stocks), and up to 8–9% if heavily weighted toward equities. Always adjust for your specific fund allocations." },
    { question: "When can I withdraw from my 401(k) without penalty?", answer: "You can withdraw from your 401(k) penalty-free starting at age 59½. Withdrawals before this age typically incur a 10% early withdrawal penalty plus ordinary income tax on the amount withdrawn. Required Minimum Distributions (RMDs) must begin at age 73 (as of 2023) for traditional 401(k) accounts. Roth 401(k) accounts have different RMD rules." },
    { question: "What happens to my 401(k) when I change jobs?", answer: "When you leave a job, you have several options: keep the money in your former employer's plan (if allowed), roll it over to your new employer's 401(k), roll it over to an IRA, or cash it out (not recommended — you'll owe taxes plus a 10% penalty if under 59½). A direct rollover to an IRA or new employer plan is usually the best option to avoid taxes and penalties." },
    { question: "What is the 4% rule for retirement withdrawal?", answer: "The 4% rule suggests withdrawing 4% of your retirement portfolio in the first year of retirement, then adjusting for inflation each subsequent year. Historically, this rate has allowed retirees a high probability of not outliving their savings over a 30-year retirement. For a $1 million portfolio, this equals $40,000/year or $3,333/month. Our calculator shows your estimated monthly withdrawal at the 4% rate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "401K Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">401K Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="curr-age" label="Current Age" value={currentAge} onChange={setCurrentAge} tooltip="Your current age in years." min="18" step="1" />
                <InputField id="ret-age" label="Retirement Age" value={retirementAge} onChange={setRetirementAge} tooltip="The age at which you plan to retire." min="50" step="1" />
                <InputField id="curr-balance" label="Current 401(k) Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" tooltip="Your existing 401(k) account balance today." />
                <InputField id="annual-salary" label="Annual Salary" value={annualSalary} onChange={setAnnualSalary} prefix="$" tooltip="Your current gross annual salary before taxes." />
                <InputField id="contrib-pct" label="Your Contribution %" value={contributionPct} onChange={setContributionPct} suffix="%" tooltip="Percentage of your salary you contribute each year (max $23,000 in 2024)." />
                <InputField id="employer-match-pct" label="Employer Match %" value={employerMatchPct} onChange={setEmployerMatchPct} suffix="%" tooltip="Percentage your employer matches per dollar of your contribution." />
                <InputField id="match-limit" label="Employer Match Limit %" value={employerMatchLimit} onChange={setEmployerMatchLimit} suffix="%" tooltip="Maximum % of salary your employer will match (common: 4–6%)." />
                <InputField id="annual-return" label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} suffix="%" tooltip="Historical S&P 500 average ~7% real, 10% nominal." />
                <InputField id="salary-increase" label="Annual Salary Increase %" value={annualSalaryIncrease} onChange={setAnnualSalaryIncrease} suffix="%" tooltip="Expected annual percentage raise or salary growth." />
                <InputField id="inflation" label="Inflation Rate" value={inflationRate} onChange={setInflationRate} suffix="%" tooltip="Historical US inflation average is ~3%. Used to show real purchasing power." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Retirement Savings</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-4">Retirement Projection</h2>

                <ResultDisplay items={[
                  { label: "401(k) Balance at Retirement", value: results.finalBalance, highlight: true },
                  { label: "Inflation-Adjusted Value", value: results.inflationAdjusted, highlight: true },
                  { label: "Monthly Withdrawal (4% Rule)", value: results.monthlyWithdrawal4pct },
                  { label: "Your Total Contributions", value: results.totalEmployeeContribs },
                  { label: "Employer Contributions", value: results.totalEmployerContribs },
                  { label: "Investment Growth", value: results.interestGained },
                ]} />

                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Initial Balance", value: results.initialBalance, color: "hsl(220, 60%, 30%)" },
                      { label: "Your Contributions", value: results.totalEmployeeContribs, color: "hsl(211, 100%, 50%)" },
                      { label: "Employer Match", value: results.totalEmployerContribs, color: "hsl(142, 71%, 45%)" },
                      { label: "Investment Growth", value: Math.max(0, results.interestGained), color: "hsl(48, 96%, 53%)" },
                    ]}
                    size={180}
                  />
                </div>

                {results.yearlyData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Year-by-Year 401(k) Growth</h3>
                    <div className="overflow-x-auto rounded-lg border border-border max-h-96">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0">
                          <tr className="bg-secondary text-foreground">
                            <th className="px-3 py-2 text-left font-medium">Age</th>
                            <th className="px-3 py-2 text-right font-medium">Salary</th>
                            <th className="px-3 py-2 text-right font-medium">You Save</th>
                            <th className="px-3 py-2 text-right font-medium">Employer</th>
                            <th className="px-3 py-2 text-right font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.yearlyData.map((row: any) => (
                            <tr key={row.year} className="border-t border-border hover:bg-secondary/30">
                              <td className="px-3 py-2 text-muted-foreground">{row.age}</td>
                              <td className="px-3 py-2 text-right">${row.salary.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right">${row.employeeContrib.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right text-primary">${row.employerContrib.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right font-medium">${row.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground">
                  <strong>Note:</strong> This projection uses simplified annual compounding and assumes constant contribution percentages. Actual 401(k) growth depends on fund selection, fees, market performance, and plan-specific rules. This is not financial advice.
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is a 401(k) Calculator?</h2>
              <p>A 401(k) calculator projects how much money you'll accumulate in your employer-sponsored retirement account by the time you retire. It factors in your current balance, annual contributions (up to the IRS limit), employer matching contributions, expected investment returns, salary increases, and inflation to provide a comprehensive retirement savings forecast.</p>
              <p>Our advanced 401(k) calculator includes all factors that significantly impact your retirement outcome: employer match with configurable match percentage and limits, annual salary increase projections, inflation-adjusted purchasing power, and a complete year-by-year growth table showing every variable at each age from now until retirement.</p>

              <h2>How 401(k) Growth Is Calculated</h2>
              <p>Each year, your 401(k) grows from three sources: (1) your own contributions (pre-tax, up to $23,000 in 2024), (2) your employer's matching contributions (free money), and (3) investment returns on all accumulated assets. The compound growth formula is applied annually: New Balance = Previous Balance × (1 + Return Rate) + Annual Contributions from both you and your employer. Over 35 years at 7%, the compounding effect can generate 5–8× the total amount you personally contributed.</p>

              <h2>How to Use This 401(k) Calculator</h2>
              <p>Enter your current age and target retirement age. Input your current 401(k) balance, annual salary, and the percentage you contribute. Set your employer's match percentage and the salary ceiling for matching. Use 7% for annual return as a historically-backed conservative estimate. Enable salary increase to model promotions. The inflation field shows what your balance will be worth in today's dollars, giving you a realistic sense of purchasing power at retirement.</p>

              <h2>The Employer Match: Free Money You Can't Ignore</h2>
              <p>The employer 401(k) match is the single most powerful benefit in your compensation package. A typical match of "50% up to 6% of salary" means if you earn $80,000 and contribute 6% ($4,800), your employer adds $2,400 — a guaranteed 50% return on that portion of your savings before any investment return. Over 35 years at 7%, that $2,400/year in employer contributions alone grows to approximately $385,000. Never leave this money on the table.</p>

              <h2>Example Scenario</h2>
              <p>Michael, age 30, earns $75,000 with a $25,000 existing 401(k) balance. He contributes 6% ($4,500/year), and his employer matches 3% ($2,250/year). Assuming 7% annual return, 2% salary growth, and 3% inflation, by age 65 his 401(k) grows to approximately $1.8 million in nominal terms, or about $640,000 in today's purchasing power. This supports a monthly withdrawal of $6,000 using the 4% rule — comparable to a solid middle-class retirement income.</p>

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

