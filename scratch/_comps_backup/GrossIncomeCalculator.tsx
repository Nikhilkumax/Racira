"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GrossIncomeResult {
  annualGross: number;
  monthlyGross: number;
  biweeklyGross: number;
  weeklyGross: number;
  dailyGross: number;
  hourlyGross: number;
  chartData: { name: string; income: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcGrossIncome(amount: number, period: string, hoursPerWeek: number, daysPerWeek: number, weeksPerYear: number): GrossIncomeResult {
  let annualGross = 0;
  
  switch (period) {
    case "hourly":
      annualGross = amount * hoursPerWeek * weeksPerYear;
      break;
    case "daily":
      annualGross = amount * daysPerWeek * weeksPerYear;
      break;
    case "weekly":
      annualGross = amount * weeksPerYear;
      break;
    case "biweekly":
      annualGross = amount * (weeksPerYear / 2);
      break;
    case "semi-monthly":
      annualGross = amount * 24;
      break;
    case "monthly":
      annualGross = amount * 12;
      break;
    case "annual":
      annualGross = amount;
      break;
  }

  const monthlyGross = annualGross / 12;
  const weeklyGross = weeksPerYear > 0 ? annualGross / weeksPerYear : 0;
  const biweeklyGross = weeksPerYear > 0 ? annualGross / (weeksPerYear / 2) : 0;
  const dailyGross = daysPerWeek > 0 && weeklyGross > 0 ? weeklyGross / daysPerWeek : 0;
  const hourlyGross = hoursPerWeek > 0 && weeklyGross > 0 ? weeklyGross / hoursPerWeek : 0;

  const chartData = [
    { name: "Monthly", income: monthlyGross },
    { name: "Bi-Weekly", income: biweeklyGross },
    { name: "Weekly", income: weeklyGross },
  ];

  const breakdown = [
    { label: "Annual Gross Income", value: `$${annualGross.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Monthly Gross (12/yr)", value: `$${monthlyGross.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Semi-Monthly (24/yr)", value: `$${(annualGross / 24).toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Bi-Weekly Gross (26/yr)", value: `$${biweeklyGross.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Weekly Gross (52/yr)", value: `$${weeklyGross.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Daily Gross", value: `$${dailyGross.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Hourly Equivalent", value: `$${hourlyGross.toLocaleString("en-US", { maximumFractionDigits: 2 })}/hr` },
  ];

  const summaryStats = [
    { label: "Annual Gross", value: `$${annualGross.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Gross", value: `$${monthlyGross.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Hourly Rate", value: `$${hourlyGross.toFixed(2)}/hr` },
    { label: "Weekly Hours", value: `${hoursPerWeek} hrs` },
    { label: "Working Weeks", value: `${weeksPerYear} wks` },
    { label: "Working Days", value: `${daysPerWeek * weeksPerYear} days/yr` },
  ];

  return { annualGross, monthlyGross, biweeklyGross, weeklyGross, dailyGross, hourlyGross, chartData, breakdown, summaryStats };
}

const DEFAULTS = { amount: "35", period: "hourly", hours: "40", days: "5", weeks: "52" };

export default function GrossIncomeCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [period, setPeriod] = useState(DEFAULTS.period);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [weeks, setWeeks] = useState(DEFAULTS.weeks);
  
  const [result, setResult] = useState<GrossIncomeResult | null>(null);

  const calculate = () => setResult(calcGrossIncome(
    parseFloat(amount) || 0, period, parseFloat(hours) || 0, parseFloat(days) || 0, parseFloat(weeks) || 0
  ));
  
  const reset = () => { 
    setAmount(DEFAULTS.amount); setPeriod(DEFAULTS.period); 
    setHours(DEFAULTS.hours); setDays(DEFAULTS.days); setWeeks(DEFAULTS.weeks);
    setShowAdvanced(false);
    setResult(calcGrossIncome(35, "hourly", 40, 5, 52)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is gross income?", answer: "Gross income is the total amount of money you earn before any taxes, retirement contributions, or health insurance premiums are deducted. It represents your full salary or total hourly wages. When an employer offers you '$75,000 a year,' they are quoting your gross income." },
    { question: "Why do lenders use gross income instead of net income?", answer: "Mortgage lenders and auto financiers use gross income to calculate your Debt-to-Income (DTI) ratio because tax situations vary wildly from person to person. One person might have massive deductions for dependents, while another has none. Using gross income provides lenders with a standardized, reliable metric to assess your earning power." },
    { question: "How do I calculate an annual salary from an hourly wage?", answer: "The standard formula assumes a 40-hour work week for 52 weeks a year, which equals 2,080 working hours annually. Simply multiply your hourly rate by 2,080. For example, if you make $25 per hour, your annual gross income is $25 x 2,080 = $52,000." },
    { question: "What is the difference between bi-weekly and semi-monthly pay?", answer: "Bi-weekly means you are paid every two weeks, resulting in 26 paychecks per year. This usually means two months out of the year you will receive three paychecks. Semi-monthly means you are paid twice a month (often the 1st and 15th), resulting in exactly 24 paychecks per year. Bi-weekly checks are slightly smaller than semi-monthly checks for the same annual salary." },
    { question: "Does my bonus count toward my gross income?", answer: "Yes, for tax purposes, all forms of compensation including bonuses, commissions, overtime, and tips count toward your gross income. However, if you are applying for a mortgage, lenders generally require a two-year history of receiving consistent bonuses before they will allow you to include that bonus income in your loan qualification calculations." },
    { question: "How does vacation time affect my gross income?", answer: "If you have paid time off (PTO), your gross income calculation remains the same because you are paid your standard rate while on vacation. However, if you take unpaid leave, you must adjust the 'Weeks / Year' input in our advanced options to accurately reflect your lower annual gross income." },
    { question: "What is the difference between gross income and gross profit?", answer: "Gross income applies to individuals (wage earners). Gross profit applies to businesses. A business's gross profit is its total sales revenue minus the cost of goods sold (COGS). It does not include operating expenses like rent or payroll." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Gross Income Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Gross Income Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Pay Rate Amount</label>
              <div className="flex gap-2">
                <div className={`${inp} flex-1`}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={ci} /></div>
                <select value={period} onChange={e => setPeriod(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus-within:ring-2 focus-within:ring-primary/20 w-36">
                  <option value="hourly">per Hour</option>
                  <option value="daily">per Day</option>
                  <option value="weekly">per Week</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="semi-monthly">Semi-Monthly</option>
                  <option value="monthly">per Month</option>
                  <option value="annual">per Year</option>
                </select>
              </div>
            </div>
            
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Work Schedule {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div><label className="text-xs font-medium mb-1.5 block">Hours/Week</label><div className={inp}><input type="number" value={hours} onChange={e => setHours(e.target.value)} className={ci} /></div></div>
                <div><label className="text-xs font-medium mb-1.5 block">Days/Week</label><div className={inp}><input type="number" value={days} onChange={e => setDays(e.target.value)} className={ci} /></div></div>
                <div><label className="text-xs font-medium mb-1.5 block">Weeks/Year</label><div className={inp}><input type="number" value={weeks} onChange={e => setWeeks(e.target.value)} className={ci} /></div></div>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Gross Income</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.annualGross.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Total earnings before taxes and deductions</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly", `$${result.monthlyGross.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Bi-Weekly", `$${result.biweeklyGross.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Hourly", `$${result.hourlyGross.toFixed(2)}/hr`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Gross Income Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Annual Gross") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Income Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
                    <Bar dataKey="income" name="Gross Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Gross Income Calculator?</h2>
            <p>A gross income calculator is a foundational personal finance tool designed to convert your salary or hourly wages into various pay periods. Whether you are negotiating a job offer, applying for a mortgage, or trying to budget your monthly expenses, understanding your exact gross income across different timeframes is critical. "Gross income" refers to the raw, total amount of money you earn from your employer before any federal taxes, state taxes, Social Security, Medicare, or retirement contributions (like a 401k) are deducted from your paycheck.</p>
            <p>This calculator removes the mental gymnastics of converting an hourly wage into an annual salary, or figuring out exactly how much smaller a bi-weekly paycheck is compared to a semi-monthly paycheck. By standardizing your income into actionable data points, you can navigate financial decisions—from signing a lease to taking out an auto loan—with absolute confidence and precision.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematics behind this calculator rely on standardizing your input into an annual figure, and then dividing that annual figure by industry-standard pay periods. Here is the logic the calculator uses.</p>
            <p>First, the tool converts your input into <strong>Annual Gross Income</strong>. If you input an hourly wage (e.g., $25/hour), the calculator looks at the advanced work schedule settings. By default, it uses the standard American full-time schedule: 40 hours a week for 52 weeks a year, which equals 2,080 working hours. Formula: <code>Annual Gross = Hourly Rate * Hours per Week * Weeks per Year</code>. ($25 * 40 * 52 = $52,000).</p>
            <p>Once the Annual Gross is established, the calculator works backwards to find your pay across different frequencies. For a <strong>Monthly</strong> breakdown, it divides the annual number by 12. For <strong>Weekly</strong>, it divides by 52. For <strong>Daily</strong>, it divides the weekly amount by your days worked per week.</p>
            <p>The calculation also handles the nuanced difference between <strong>Bi-Weekly</strong> (paid every two weeks, resulting in 26 paychecks per year) and <strong>Semi-Monthly</strong> (paid twice a month, resulting in exactly 24 paychecks per year).</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you click calculate, the tool generates five specific analytical zones to help you fully visualize your earning power.</p>
            <p><strong>Primary Result Card:</strong> This highlights your Annual Gross Income. This is the "headline" number you will put on every credit card, loan, or apartment application you ever fill out.</p>
            <p><strong>3-Stat Bar:</strong> This section provides a quick snapshot of the three most common metrics people need when budgeting: your raw Monthly Gross, your Bi-Weekly pay (the most common payroll frequency in the US), and your Equivalent Hourly Rate.</p>
            <p><strong>Gross Income Breakdown:</strong> A comprehensive, line-by-line accounting that converts your pay into every possible time frequency. This is incredibly useful if you are trying to compare a job offer that pays $70,000 a year against a freelance contract that pays $35 an hour.</p>
            <p><strong>Income Distribution Chart:</strong> A visual bar chart that illustrates the scale of your income across the three most common budgeting periods (Monthly, Bi-Weekly, and Weekly), helping you visualize your cash flow.</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating your schedule metrics, reminding you exactly how many hours and weeks the calculation is based upon.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>Understanding how gross income is utilized by the financial system is just as important as knowing how to calculate it. Here is why this metric matters.</p>
            <p><strong>The Foundation of Credit:</strong> Every lender—from mortgage banks to auto financiers—uses your gross income, not your net (take-home) pay, to qualify you for a loan. They do this because tax deductions and health insurance premiums are highly variable and can be changed. Your gross income is the only stable metric of your earning capacity. Lenders apply a Debt-to-Income (DTI) ratio against your gross pay; typically, your total monthly debt payments cannot exceed 43% of your monthly gross income.</p>
            <p><strong>Negotiating Power:</strong> When moving from an hourly position to a salaried position, knowing your exact gross income equivalent is your strongest negotiating tool. If you currently make $30 an hour, and an employer offers you a salary of $55,000, this calculator instantly reveals that the salary offer is a pay cut (as $30/hr is $62,400 annually).</p>
            <p><strong>The "Extra Paycheck" Months:</strong> If you are paid Bi-Weekly (every two weeks), you receive 26 paychecks a year. Since most months have four weeks, you usually get two paychecks a month. However, two months out of the year, the calendar aligns so that you receive three paychecks. Understanding your bi-weekly gross helps you identify and plan for these "bonus" cash-flow months.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Work Schedule tab elevates this tool from a standard calculator into a highly customizable income analyzer, perfect for freelancers, part-time workers, and contractors.</p>
            <p>By default, the calculator assumes a 40-hour work week, 5 days a week, for 52 weeks a year. However, if you are a freelancer who only bills 30 hours a week, or a teacher who only works 40 weeks a year, you can adjust these inputs. Modifying the <strong>Weeks/Year</strong> input instantly recalculates your true annual gross, preventing you from overestimating your income based on a standard corporate calendar.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how utilizing this calculator can prevent massive financial miscalculations.</p>
            <p><strong>Example 1: The Part-Time Contractor.</strong> You are offered a contract position paying $50 an hour. It sounds incredible. However, the contract only guarantees 25 hours a week, and the project pauses for a month during the holidays (meaning you only work 48 weeks). You enter $50/hr, 25 hours/week, and 48 weeks/year into the calculator. Your Annual Gross is $60,000. It is a good income, but far less than the $104,000 you would make if you assumed standard full-time hours.</p>
            <p><strong>Example 2: The Semi-Monthly Surprise.</strong> You take a new job paying $80,000 a year. At your old job, you were paid Bi-Weekly, and your gross checks were $3,076. Your new job pays Semi-Monthly. You use the calculator and see your new gross checks will be $3,333. Because you only get 24 checks instead of 26, each individual check is larger, but you lose the two "three-paycheck" months you used to enjoy. You adjust your monthly budget accordingly.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>While calculating gross income is mathematically straightforward, applying it to your financial life requires discipline. Keep these best practices in mind.</p>
            <p>First, never budget based on your gross income. Your gross income is a phantom number used for taxes and loan qualification; you will never see that full amount in your bank account. Always build your household budget based on your Net Income (Take-Home Pay), which is usually 20% to 30% lower than your gross due to taxes and deductions.</p>
            <p>Second, remember the "2080 Rule" for quick mental math. If you want to know the annual salary of an hourly wage, multiply the wage by 2,000 (which is close to the 2,080 working hours in a year). If you make $20 an hour, $20 x 2,000 = $40,000. If you make $100,000 a year and want to know the hourly rate, divide by 2,000 ($100,000 / 2,000 = $50/hr).</p>
            <p>Third, keep track of supplemental income. If you regularly earn overtime, bonuses, or commissions, you must calculate these separately and add them to your base annual gross. However, if you are applying for a mortgage, be aware that lenders usually will not count this supplemental income toward your gross unless you can prove you have received it consistently for at least two years.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using a Gross Income Calculator provides absolute clarity regarding your earning power. It prevents you from accepting lowball salary offers by instantly revealing their hourly equivalent, and it stops you from overestimating your annual income if you work irregular hours.</p>
            <p>By translating a single pay rate into a comprehensive, annualized financial picture, this tool empowers you to negotiate better salaries, qualify for the right loans, and lay a mathematically sound foundation for your long-term personal finance goals.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gross-income-calculator" />
          <PopularCalculators exclude="/calculator/gross-income-calculator" />
        </div>
      </div>
    </>
  );
}
