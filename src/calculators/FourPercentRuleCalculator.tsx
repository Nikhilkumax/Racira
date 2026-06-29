"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Line } from "recharts";

interface RuleResults {
  initialAnnualWithdrawal: number;
  initialMonthlyWithdrawal: number;
  endingBalance: number;
  totalWithdrawn: number;
  yearsLasted: number;
  schedule: { year: number; balance: number; withdrawal: number }[];
  isSuccess: boolean;
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

const calculateRule = (
  savings: number,
  withdrawalRate: number,
  roi: number,
  inflation: number,
  years: number
): RuleResults => {
  if (savings <= 0 || years <= 0) {
    return {
      initialAnnualWithdrawal: 0,
      initialMonthlyWithdrawal: 0,
      endingBalance: 0,
      totalWithdrawn: 0,
      yearsLasted: 0,
      schedule: [],
      isSuccess: false,
    };
  }

  const initialWithdrawal = savings * (withdrawalRate / 100);
  let currentBalance = savings;
  let currentWithdrawal = initialWithdrawal;
  let totalWithdrawn = 0;
  let yearsLasted = 0;
  
  const schedule: { year: number; balance: number; withdrawal: number }[] = [];

  for (let year = 1; year <= years; year++) {
    // End of year calculation:
    // We assume withdrawal happens at the beginning of the year for safety
    if (currentBalance <= 0) {
      schedule.push({ year, balance: 0, withdrawal: 0 });
      continue;
    }

    const actualWithdrawal = Math.min(currentBalance, currentWithdrawal);
    currentBalance -= actualWithdrawal;
    totalWithdrawn += actualWithdrawal;

    // Apply growth to remaining balance
    currentBalance = currentBalance * (1 + roi / 100);
    
    schedule.push({ year, balance: Math.max(0, currentBalance), withdrawal: actualWithdrawal });

    if (currentBalance > 0 || actualWithdrawal > 0) {
      yearsLasted = year;
    }

    // Adjust next year's withdrawal for inflation
    currentWithdrawal = currentWithdrawal * (1 + inflation / 100);
  }

  return {
    initialAnnualWithdrawal: initialWithdrawal,
    initialMonthlyWithdrawal: initialWithdrawal / 12,
    endingBalance: Math.max(0, currentBalance),
    totalWithdrawn,
    yearsLasted,
    schedule,
    isSuccess: currentBalance > 0,
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-sm text-foreground">
        <p className="font-bold mb-1">Year {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: ${entry.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FourPercentRuleCalculator() {
  const [savings, setSavings] = useState("1000000");
  const [withdrawalRate, setWithdrawalRate] = useState("4.0");
  const [roi, setRoi] = useState("6.0");
  const [inflation, setInflation] = useState("2.5");
  const [years, setYears] = useState("30");
  
  const [results, setResults] = useState<RuleResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculateRule(
      parseFloat(savings) || 0,
      parseFloat(withdrawalRate) || 0,
      parseFloat(roi) || 0,
      parseFloat(inflation) || 0,
      parseFloat(years) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setSavings("1000000");
    setWithdrawalRate("4.0");
    setRoi("6.0");
    setInflation("2.5");
    setYears("30");
    setResults(calculateRule(1000000, 4.0, 6.0, 2.5, 30));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>4% Rule Results</title>
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "4% Rule Calculator" }]} />
      <div className="container-page py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">4% Rule Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="savings"
                label="Current Retirement Savings"
                value={savings}
                onChange={setSavings}
                prefix="$"
              />
              <CompactInput
                id="withdrawal-rate"
                label="Initial Withdrawal Rate"
                value={withdrawalRate}
                onChange={setWithdrawalRate}
                suffix="%"
              />
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  id="roi"
                  label="Expected Annual ROI"
                  value={roi}
                  onChange={setRoi}
                  suffix="%"
                />
                <CompactInput
                  id="inflation"
                  label="Expected Inflation"
                  value={inflation}
                  onChange={setInflation}
                  suffix="%"
                />
              </div>
              <CompactInput
                id="years"
                label="Years in Retirement"
                value={years}
                onChange={setYears}
                suffix="Years"
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
                <div className={`border-l-4 rounded-lg p-5 ${results.isSuccess ? 'bg-primary/10 border-primary' : 'bg-destructive/10 border-destructive'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Initial Annual Withdrawal</div>
                  <div className={`text-4xl font-bold mb-2 ${results.isSuccess ? 'text-primary' : 'text-destructive'}`}>
                    ${results.initialAnnualWithdrawal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-foreground/80 font-medium">
                    That is <strong>${results.initialMonthlyWithdrawal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong> per month in Year 1.
                  </div>
                </div>

                {/* Status Message */}
                {results.isSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-emerald-700 mb-1">Portfolio Success!</h4>
                    <p className="text-sm text-foreground/80 mb-0">
                      Based on these assumptions, your portfolio lasted all {results.yearsLasted} years and you have a final balance of <strong>${results.endingBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-destructive mb-1">Portfolio Depleted</h4>
                    <p className="text-sm text-foreground/80 mb-0">
                      Your savings ran out in <strong>Year {results.yearsLasted}</strong>. You may need to lower your withdrawal rate or plan for higher returns.
                    </p>
                  </div>
                )}

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[11px] uppercase text-muted-foreground mb-1">Years Lasted</span>
                    <span className={`text-lg font-bold ${results.yearsLasted < parseInt(years) ? 'text-destructive' : ''}`}>{results.yearsLasted}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[11px] uppercase text-muted-foreground mb-1">Total Withdrawn</span>
                    <span className="text-lg font-bold">${results.totalWithdrawn.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[11px] uppercase text-muted-foreground mb-1">Ending Balance</span>
                    <span className={`text-lg font-bold ${results.endingBalance > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      ${results.endingBalance.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}
                    </span>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <h3 className="text-base font-semibold mb-4">Portfolio Balance Over Time</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.schedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={results.isSuccess ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={results.isSuccess ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `Yr ${val}`}
                        />
                        <YAxis 
                          yAxisId="left"
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                          width={60}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                          width={60}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="balance" 
                          name="Balance"
                          stroke={results.isSuccess ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorBalance)" 
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="withdrawal"
                          name="Withdrawal"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${results.isSuccess ? 'bg-primary' : 'bg-destructive'}`} />
                      <span className="text-muted-foreground">Portfolio Balance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Annual Withdrawal</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[800px] mx-auto mt-16 prose prose-slate dark:prose-invert">
          <h2>What is the 4% Rule for Retirement?</h2>
          <p>
            The 4% Rule is a widely used rule of thumb in retirement planning that helps determine a safe withdrawal rate from your retirement savings. The rule states that you can comfortably withdraw 4% of your total retirement portfolio in your first year of retirement, and then adjust that dollar amount for inflation each subsequent year, without running out of money for at least 30 years.
          </p>
          <p>
            This concept originated from the famous 1994 "Trinity Study" by William Bengen, a financial planner who analyzed historical stock and bond market returns dating back to 1926. He found that, even through the worst economic periods in modern history (including the Great Depression and the 1970s stagflation), a 50/50 stock-to-bond portfolio sustained a 4% inflation-adjusted withdrawal rate for 30 years without failing.
          </p>

          <h2>How to Calculate Your Retirements Needs</h2>
          <p>
            Using the 4% rule, you can quickly estimate how much money you need to retire. The formula is simple:
          </p>
          <p>
            <code>Required Portfolio = Desired Annual Income / 0.04</code>
          </p>
          <p>
            Equivalently, you can multiply your desired annual income by 25. For example, if you want to generate $40,000 a year from your investments, you need a portfolio of $1,000,000 ($40,000 × 25 = $1,000,000).
          </p>

          <h2>How the Annual Adjustments Work</h2>
          <p>
            A common misconception is that you withdraw exactly 4% of your remaining balance every year. If you did that, your withdrawals would fluctuate wildly with the stock market, and you would technically never run out of money (because 4% of a tiny number is just a tinier number), but you would eventually starve.
          </p>
          <p>
            Instead, the 4% rule dictates that you only use 4% in <strong>Year 1</strong>. Every year after that, you adjust the previous year's <em>dollar amount</em> for inflation.
          </p>
          <ul>
            <li><strong>Year 1:</strong> You have $1,000,000. You withdraw 4% ($40,000).</li>
            <li><strong>Year 2:</strong> Inflation was 3%. You increase your withdrawal by 3%. You withdraw $41,200, regardless of whether your portfolio went up or down.</li>
            <li><strong>Year 3:</strong> Inflation was 2%. You increase last year's amount ($41,200) by 2%. You withdraw $42,024.</li>
          </ul>

          <h2>Is the 4% Rule Still Valid Today?</h2>
          <p>
            The 4% rule is an excellent starting point, but modern financial advisors often suggest modifications. Some factors that challenge the 4% rule today include:
          </p>
          <ul>
            <li><strong>Longer Life Expectancies:</strong> The original study tested a 30-year retirement. If you retire early at age 50, you might need your money to last 40 or 50 years. In these cases, experts suggest a more conservative 3% or 3.5% withdrawal rate.</li>
            <li><strong>Lower Yield Environments:</strong> Historical returns used in the Trinity Study featured relatively high bond yields. In periods of very low interest rates, a 4% withdrawal rate carries a slightly higher risk of failure.</li>
            <li><strong>Sequence of Returns Risk:</strong> The order in which you experience investment returns matters massively. If the stock market crashes during the first three years of your retirement, continuing to withdraw inflation-adjusted amounts will devastate your portfolio. This is why flexibility is key.</li>
          </ul>

          <h2>Dynamic Withdrawal Strategies</h2>
          <p>
            To combat the rigidness of the strict 4% rule, many retirees adopt dynamic or flexible withdrawal strategies:
          </p>
          <ul>
            <li><strong>The Guardrails Approach:</strong> You increase your withdrawals if your portfolio grows significantly, but you commit to taking a pay cut (reducing your withdrawal) if the market crashes.</li>
            <li><strong>Skipping Inflation Adjustments:</strong> If your portfolio suffers a negative year, you simply do not adjust your withdrawal for inflation the following year, keeping your spending flat.</li>
            <li><strong>Cash Buffers:</strong> Keeping 1-2 years of living expenses in cash ensures you don't have to sell stocks while the market is down.</li>
          </ul>

          <h2>Benefits of Using This Calculator</h2>
          <p>
            Our 4% Rule Calculator allows you to visualize exactly how your money will behave over time under various economic conditions. By tweaking the expected return (ROI) and inflation rates, you can stress-test your retirement plan. Seeing the trajectory of your portfolio balance alongside your escalating withdrawal amounts provides a clear, mathematical foundation for your financial independence journey.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "Does the 4% rule include taxes?", answer: "No, the 4% rule applies to your gross withdrawal. You must pay income taxes and capital gains taxes out of that 4% amount. Therefore, your actual 'take-home' spendable cash will be less than the 4% you withdraw." },
          { question: "What happens if I retire early?", answer: "If you are pursuing FIRE (Financial Independence, Retire Early) and expect a 40+ year retirement, most experts suggest using a more conservative withdrawal rate of 3.25% to 3.5% to ensure the portfolio survives the longer timeframe." },
          { question: "Should I adjust my withdrawal if the market crashes?", answer: "While the strict 4% rule says no, practical reality says yes. Being willing to reduce your spending by 5-10% during a severe bear market dramatically increases the likelihood that your portfolio will survive." },
          { question: "What asset allocation is required for the 4% rule?", answer: "The original Trinity Study was based on a portfolio holding 50% to 75% large-cap U.S. stocks, with the remainder in intermediate-term bonds. A portfolio that is 100% bonds or cash will almost certainly fail the 4% rule due to inflation." },
          { question: "Is the 4% rule guaranteed?", answer: "No. It is based on historical data. While the U.S. stock market has always recovered historically, past performance is no guarantee of future results. It is a highly reliable rule of thumb, not an absolute guarantee." },
          { question: "Do I have to use exactly 4%?", answer: "Not at all. You can use 3%, 4.5%, or 5% depending on your risk tolerance, age, and flexibility. Our calculator allows you to test any initial withdrawal rate you choose." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
