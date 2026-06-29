"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { Calculator, RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface ApyInputs {
  nominalRate: number;
  compounding: number;
  initialDeposit: number;
}

interface ApyResults {
  apy: number;
  dailyRate: number;
  monthlyRate: number;
  effectiveDailyRate: number;
  chartData: Array<{ year: string; nominal: number; withCompounding: number }>;
  schedule: Array<{ year: number; balance: number; interestEarned: number }>;
  totalInterest: number;
  finalBalance: number;
}

// 2. Pure Calculation Function
const calculateApy = (inputs: ApyInputs): ApyResults => {
  const r = inputs.nominalRate / 100;
  const n = inputs.compounding;
  const p = inputs.initialDeposit;

  if (r < 0 || n <= 0 || p < 0) {
    return {
      apy: 0,
      dailyRate: 0,
      monthlyRate: 0,
      effectiveDailyRate: 0,
      chartData: [],
      schedule: [],
      totalInterest: 0,
      finalBalance: p
    };
  }

  const apy = (Math.pow(1 + r / n, n) - 1) * 100;
  const dailyRate = (r / 365) * 100;
  const monthlyRate = (r / 12) * 100;
  const effectiveDailyRate = (Math.pow(1 + r / n, n / 365) - 1) * 100;

  // Chart data: 5 years comparison (Nominal simple vs Compounded)
  const chartData = [];
  const schedule = [];
  let currentBalance = p;

  for (let year = 1; year <= 5; year++) {
    const nominalBalance = p + (p * r * year);
    currentBalance = p * Math.pow(1 + r / n, n * year);
    
    chartData.push({
      year: `Year ${year}`,
      nominal: Math.round(nominalBalance),
      withCompounding: Math.round(currentBalance)
    });

    schedule.push({
      year,
      balance: currentBalance,
      interestEarned: currentBalance - p
    });
  }

  const finalBalance = currentBalance;
  const totalInterest = currentBalance - p;

  return {
    apy,
    dailyRate,
    monthlyRate,
    effectiveDailyRate,
    chartData,
    schedule,
    totalInterest,
    finalBalance
  };
};

// 3. Realistic Industry Standard Defaults
const DEFAULTS = {
  nominalRate: "5",
  compounding: "365",
  initialDeposit: "10000"
};

const ApyCalculator = () => {
  const [nominalRate, setNominalRate] = useState(DEFAULTS.nominalRate);
  const [compounding, setCompounding] = useState(DEFAULTS.compounding);
  const [initialDeposit, setInitialDeposit] = useState(DEFAULTS.initialDeposit);
  const [results, setResults] = useState<ApyResults | null>(null);

  const performCalculation = () => {
    const inputs: ApyInputs = {
      nominalRate: parseFloat(nominalRate) || 0,
      compounding: parseFloat(compounding) || 1,
      initialDeposit: parseFloat(initialDeposit) || 0
    };
    setResults(calculateApy(inputs));
  };

  useEffect(() => {
    performCalculation();
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    performCalculation();
  };

  const reset = () => {
    setNominalRate(DEFAULTS.nominalRate);
    setCompounding(DEFAULTS.compounding);
    setInitialDeposit(DEFAULTS.initialDeposit);
    setTimeout(() => {
      setResults(calculateApy({
        nominalRate: parseFloat(DEFAULTS.nominalRate),
        compounding: parseFloat(DEFAULTS.compounding),
        initialDeposit: parseFloat(DEFAULTS.initialDeposit)
      }));
    }, 0);
  };

  const faqs = [
    { question: "What is APY?", answer: "Annual Percentage Yield (APY) is the effective annual rate of return taking into account the effect of compounding interest. It is always higher than the nominal APR for the same annual rate." },
    { question: "What is the difference between APY and APR?", answer: "APR (Annual Percentage Rate) is the nominal annual rate without compounding. APY includes compounding and shows the true annual yield. For savings, APY is more relevant. For loans, APR is more commonly used." },
    { question: "How does compounding frequency affect APY?", answer: "More frequent compounding (daily vs. monthly vs. annually) increases APY for the same nominal rate. Daily compounding yields slightly more than monthly compounding, which yields more than annual compounding." },
    { question: "Why do banks advertise APY instead of APR?", answer: "For savings accounts, APY is always higher than the nominal rate, making the account appear more attractive. When comparing savings products, always compare APYs since they account for compounding differences." },
    { question: "What is continuous compounding?", answer: "Continuous compounding is the mathematical limit of compounding frequency (infinite times per year). The effective APY approaches e^r - 1, where e is Euler's number (~2.71828). In practice, daily compounding is virtually equivalent." },
    { question: "How do I convert APY to monthly rate?", answer: "To find the equivalent monthly rate from an APY: Monthly Rate = (1 + APY)^(1/12) - 1. This is more accurate than simply dividing APY by 12 because it properly accounts for compounding." },
    { question: "Does APY include fees?", answer: "No. APY only reflects interest earnings, not fees. Always check the fee schedule of a savings account or CD. Monthly maintenance fees can easily negate earned interest, especially on smaller balances." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Finance", href: "/finance" }, { label: "APY Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight text-foreground">APY Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              <InputField id="deposit" label="Initial Deposit ($)" value={initialDeposit} onChange={setInitialDeposit} type="number" />
              <InputField id="nominal-rate" label="Nominal Annual Rate (APR, %)" value={nominalRate} onChange={setNominalRate} type="number" />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-base font-medium text-foreground">Compounding Frequency</label>
                <select 
                  value={compounding} 
                  onChange={e => setCompounding(e.target.value)} 
                  className="h-10 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="365">Daily (365x/year)</option>
                  <option value="52">Weekly (52x/year)</option>
                  <option value="26">Bi-Weekly (26x/year)</option>
                  <option value="12">Monthly (12x/year)</option>
                  <option value="6">Bi-Monthly (6x/year)</option>
                  <option value="4">Quarterly (4x/year)</option>
                  <option value="2">Semi-Annually (2x/year)</option>
                  <option value="1">Annually (1x/year)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className="h-10 w-full bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">Calculate</button>
                <button type="button" onClick={reset} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground" aria-label="Reset">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && results.apy >= 0 && (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Effective Annual Percentage Yield (APY)</p>
                  <p className="text-4xl font-bold text-primary mt-1">{results.apy.toFixed(4)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Versus stated rate of {parseFloat(nominalRate).toFixed(2)}%</p>
                  <button className="absolute top-4 right-4 p-2 rounded-md hover:bg-primary/10 text-primary transition-colors" title="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 bg-card border border-border rounded-lg overflow-hidden divide-x divide-border">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Effective Daily</p>
                    <p className="text-lg font-bold">{results.effectiveDailyRate.toFixed(4)}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Nominal Monthly</p>
                    <p className="text-lg font-bold">{results.monthlyRate.toFixed(4)}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Nominal Daily</p>
                    <p className="text-lg font-bold">{results.dailyRate.toFixed(4)}%</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 border-b border-border">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground">5-Year Growth Schedule</h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 text-muted-foreground text-left">
                            <th className="py-2.5 px-3 font-medium">Year</th>
                            <th className="py-2.5 px-3 font-medium text-right">Interest</th>
                            <th className="py-2.5 px-3 font-medium text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.schedule.map((row) => (
                            <tr key={row.year} className="border-b border-border/50">
                              <td className="py-2.5 px-3 font-medium">{row.year}</td>
                              <td className="py-2.5 px-3 text-right text-green-600">+${row.interestEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="py-2.5 px-3 text-right font-medium">${row.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                          ))}
                          <tr className="bg-muted/10 border-t-2 border-border">
                            <td className="py-3 px-3 font-bold">Total (5y)</td>
                            <td className="py-3 px-3 text-right font-bold text-green-600">${results.totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-3 px-3 text-right font-bold text-primary">${results.finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold text-muted-foreground w-full text-center mb-2">Compounding vs Simple Interest</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={results.chartData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `$${value/1000}k`}
                            domain={['dataMin - 1000', 'dataMax + 1000']}
                          />
                          <Tooltip 
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                            cursor={{fill: 'rgba(0,0,0,0.05)'}}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          <Bar dataKey="nominal" name="Simple Interest" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="withCompounding" name="With Compounding" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-3">Key Takeaways</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Initial Deposit:</div>
                    <div className="font-medium text-right">${parseFloat(initialDeposit).toLocaleString()}</div>
                    <div className="text-muted-foreground">Total 5-Year Interest:</div>
                    <div className="font-medium text-right text-green-600">${results.totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="text-muted-foreground">Final 5-Year Balance:</div>
                    <div className="font-medium text-right text-primary">${results.finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-8" />
          <article className="prose prose-slate max-w-none lg:prose-lg dark:prose-invert">
            <h2>What Is an APY Calculator?</h2>
            <p>
              An <strong>APY Calculator</strong> (Annual Percentage Yield Calculator) is an essential financial tool that helps consumers determine the actual, effective return on their savings or investments. While banks frequently advertise a "nominal interest rate," that rate does not tell the whole story if the interest is compounded over time. The APY calculation takes into account the magical effect of compounding—where you earn interest not only on your initial deposit but also on the accumulated interest from previous periods.
            </p>
            <p>
              Whether you are opening a high-yield savings account, purchasing a Certificate of Deposit (CD), or investing in a money market account, knowing your exact APY allows you to make precise, apples-to-apples comparisons between competing financial institutions and maximize the growth of your wealth.
            </p>

            <h2>How the APY Formula Works</h2>
            <p>
              The difference between the nominal rate (APR) and the yield (APY) lies entirely in the mathematics of compounding. A nominal rate is just the stated percentage without considering frequency. 
            </p>
            <p>
              The standard formula for determining the Annual Percentage Yield is:
              <br />
              <strong>APY = [ (1 + r/n)^n ] - 1</strong>
              <br />
              Where <strong>r</strong> is the nominal annual interest rate (expressed as a decimal, so 5% becomes 0.05), and <strong>n</strong> is the number of compounding periods per year.
            </p>
            <p>
              If a bank offers you a 5.0% nominal rate that compounds daily, n is equal to 365. Plugging this into the formula:
              <br />
              <strong>APY = [ (1 + 0.05/365)^365 ] - 1</strong>
              <br />
              <strong>APY = 0.051267</strong> or <strong>5.1267%</strong>
              <br />
              This mathematically proves that daily compounding yields a higher return than simple interest.
            </p>

            <h2>Understanding Your Results</h2>
            <p>
              When you use our calculator, the results provide an in-depth look at your financial trajectory. Here is how to interpret the outputs:
            </p>
            <ul>
              <li><strong>Effective APY:</strong> This is the true, annualized rate of return you will receive over 12 months. It incorporates the snowball effect of your chosen compounding frequency.</li>
              <li><strong>Effective Daily/Monthly Rate:</strong> While your nominal rate divided by 12 gives you the nominal monthly rate, the effective rate reveals exactly how much your money is growing in that exact timeframe considering compounding.</li>
              <li><strong>5-Year Growth Schedule:</strong> The breakdown table illustrates how compounding accelerates over time. As the years progress, you earn more total interest per year simply because your principal balance is consistently increasing.</li>
              <li><strong>Chart (Compounding vs Simple):</strong> This visual comparison highlights the "free money" generated specifically by compounding, separating it from the linear growth of simple interest.</li>
            </ul>

            <h2>Key Factors That Influence APY</h2>
            <p>
              Two primary variables dictate the power of your Annual Percentage Yield:
            </p>
            <p>
              <strong>1. The Nominal Interest Rate:</strong> The foundational rate set by the bank or the Federal Reserve. Naturally, a higher base rate will always lead to a higher APY, regardless of the compounding frequency.
            </p>
            <p>
              <strong>2. Compounding Frequency:</strong> This is the engine of wealth generation. The more frequently interest is calculated and added to your balance, the faster your money grows. Common frequencies include:
              <ul>
                <li><strong>Daily (365x):</strong> The most lucrative and increasingly common standard for high-yield savings accounts.</li>
                <li><strong>Monthly (12x):</strong> Very common for standard savings accounts and CDs.</li>
                <li><strong>Quarterly (4x):</strong> Common for dividend-paying stocks and older savings products.</li>
                <li><strong>Annually (1x):</strong> Results in an APY that is exactly equal to the nominal APR.</li>
              </ul>
            </p>

            <h2>Advanced Features: Continuous Compounding</h2>
            <p>
              While daily compounding is the standard for modern banking, the mathematical limit of compounding is known as "continuous compounding" — where interest is calculated at every infinitely small fraction of a second. The formula for continuous compounding is <strong>APY = e^r - 1</strong> (where 'e' is Euler's number). While fascinating mathematically, the actual monetary difference between daily compounding and continuous compounding on a $10,000 balance at 5% is a mere fraction of a cent per year.
            </p>

            <h2>Practical Examples of APY in Action</h2>
            <p>
              Consider a scenario where you have $50,000 to invest and two banks are competing for your business:
            </p>
            <p>
              <strong>Bank A:</strong> Offers a 4.50% nominal rate compounding <em>annually</em>.<br/>
              <strong>Bank B:</strong> Offers a 4.45% nominal rate compounding <em>daily</em>.
            </p>
            <p>
              A novice might choose Bank A because 4.50% looks bigger than 4.45%. However, using the APY calculator:
              <br/>
              Bank A APY = <strong>4.50%</strong>
              <br/>
              Bank B APY = <strong>4.55%</strong>
              <br/>
              Bank B is actually the superior choice. The daily compounding pushes the effective yield higher than Bank A's superficially higher nominal rate.
            </p>

            <h2>Tips & Best Practices for Savers</h2>
            <p>
              <strong>Beware of Account Fees:</strong> A fantastic APY can be instantly destroyed by a $12 monthly maintenance fee. A $5,000 balance earning 5% APY generates about $20 a month in interest. If the bank charges a $15 fee, your true return is drastically slashed.
            </p>
            <p>
              <strong>Promo Rates vs. Ongoing Rates:</strong> Many institutions lure customers in with a massive APY that only lasts for an introductory 3-month period. Always calculate what your blended APY will be over a full year before moving your money.
            </p>
            <p>
              <strong>Tax Implications:</strong> Remember that interest earned in standard savings accounts and CDs is taxable as ordinary income. Your 'after-tax APY' will be lower depending on your federal and state tax brackets.
            </p>

            <h2>Benefits of Using Our Calculator</h2>
            <p>
              Calculating APY by hand, especially when adjusting for daily or continuous compounding, is mathematically tedious. Our tool provides instantaneous, pinpoint-accurate conversions that empower you to outsmart banking marketing tactics. By utilizing the 5-year growth schedules and visual charts, you can clearly see the long-term impact of your financial decisions and optimize your passive income strategy with absolute confidence.
            </p>
          </article>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apy-calculator" />
          <PopularCalculators exclude="/calculator/apy-calculator" />
        </div>
      </div>
    </>
  );
};

export default ApyCalculator;
