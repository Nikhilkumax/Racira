"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface HourlyWageResult {
  hourlyWage: number;
  dailyWage: number;
  weeklyWage: number;
  biweeklyWage: number;
  monthlyWage: number;
  annualWage: number;
  chartData: { name: string; wage: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHourlyWage(annualSalary: number, hoursPerWeek: number, daysPerWeek: number, weeksPerYear: number): HourlyWageResult {
  const annualWage = annualSalary;
  
  const weeklyWage = weeksPerYear > 0 ? annualSalary / weeksPerYear : 0;
  const biweeklyWage = weeksPerYear > 0 ? annualSalary / (weeksPerYear / 2) : 0;
  const monthlyWage = annualSalary / 12;
  const dailyWage = daysPerWeek > 0 && weeklyWage > 0 ? weeklyWage / daysPerWeek : 0;
  const hourlyWage = hoursPerWeek > 0 && weeklyWage > 0 ? weeklyWage / hoursPerWeek : 0;

  const chartData = [
    { name: "Monthly", wage: monthlyWage },
    { name: "Bi-Weekly", wage: biweeklyWage },
    { name: "Weekly", wage: weeklyWage },
  ];

  const breakdown = [
    { label: "Annual Salary", value: `$${annualWage.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Monthly Gross Equivalent", value: `$${monthlyWage.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Bi-Weekly Equivalent", value: `$${biweeklyWage.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Weekly Equivalent", value: `$${weeklyWage.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Daily Equivalent", value: `$${dailyWage.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Hourly Wage", value: `$${hourlyWage.toLocaleString("en-US", { maximumFractionDigits: 2 })}/hr` },
  ];

  const summaryStats = [
    { label: "Calculated Hourly Rate", value: `$${hourlyWage.toFixed(2)}/hr` },
    { label: "Monthly Gross", value: `$${monthlyWage.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Gross", value: `$${annualWage.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Working Hours/Year", value: `${(hoursPerWeek * weeksPerYear).toLocaleString()} hrs` },
    { label: "Working Weeks/Year", value: `${weeksPerYear} wks` },
    { label: "Working Days/Year", value: `${daysPerWeek * weeksPerYear} days` },
  ];

  return { hourlyWage, dailyWage, weeklyWage, biweeklyWage, monthlyWage, annualWage, chartData, breakdown, summaryStats };
}

const DEFAULTS = { salary: "65000", hours: "40", days: "5", weeks: "52" };

export default function HourlyWageCalculator() {
  const [salary, setSalary] = useState(DEFAULTS.salary);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [weeks, setWeeks] = useState(DEFAULTS.weeks);
  
  const [result, setResult] = useState<HourlyWageResult | null>(null);

  const calculate = () => setResult(calcHourlyWage(
    parseFloat(salary) || 0, parseFloat(hours) || 0, parseFloat(days) || 0, parseFloat(weeks) || 0
  ));
  
  const reset = () => { 
    setSalary(DEFAULTS.salary); 
    setHours(DEFAULTS.hours); setDays(DEFAULTS.days); setWeeks(DEFAULTS.weeks);
    setShowAdvanced(false);
    setResult(calcHourlyWage(65000, 40, 5, 52)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How do you calculate an hourly wage from an annual salary?", answer: "The standard formula takes your annual salary and divides it by the total number of hours you work in a year. For a standard American full-time worker (40 hours a week for 52 weeks), you work 2,080 hours. Therefore, a $50,000 salary divided by 2,080 equals an hourly wage of $24.04." },
    { question: "What is the '2080 rule'?", answer: "The 2080 rule is a fast mental math shortcut. Since 40 hours/week × 52 weeks/year = 2,080 hours, you can quickly estimate your hourly wage by simply dividing your annual salary by 2,000. Example: $60,000 ÷ 2,000 = $30/hour. Conversely, if you know your hourly wage, double it and add three zeros to estimate your annual salary ($30/hour × 2,000 = $60,000)." },
    { question: "Do I get paid for holidays and vacation time?", answer: "If you are a salaried employee, yes—your salary typically covers 52 weeks of pay, meaning you are paid your standard rate during paid time off (PTO) and holidays. If you are an hourly employee, it depends on your specific employer's policies. Some provide paid holidays and PTO, while others only pay you for the exact hours you physically clock in." },
    { question: "Is it better to be a salaried or hourly employee?", answer: "It depends on your work habits and industry. Salaried employees enjoy income stability regardless of how many hours they work, and often receive comprehensive benefits packages. However, hourly employees get paid for exactly the time they work. If an hourly employee is non-exempt under the FLSA, they must be paid time-and-a-half for any overtime worked beyond 40 hours in a week. Most salaried employees are exempt and do not receive overtime pay, meaning a 60-hour week dilutes their effective hourly rate." },
    { question: "How does unpaid leave affect my hourly calculation?", answer: "If you are taking unpaid leave (such as an unpaid maternity leave or a summer break for teachers), you must adjust the 'Weeks / Year' input in our advanced options. If you only work 40 weeks a year but make $50,000, your effective hourly rate while working is much higher than someone making $50,000 working 52 weeks." },
    { question: "Are bonuses included in this calculation?", answer: "Generally, no. Hourly wage calculations are meant to determine your base rate of pay. While bonuses and commissions increase your total annual gross income, they are typically excluded when trying to determine your standard hourly worth." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Hourly Wage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hourly Wage Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Annual Salary</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={salary} onChange={e => setSalary(e.target.value)} className={ci} /></div></div>
            
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
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate Hourly Rate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Hourly Wage Equivalent</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.hourlyWage.toFixed(2)}<span className="text-2xl font-semibold text-muted-foreground">/hr</span></div>
                <div className="text-sm text-muted-foreground mt-1">Based on a {hours}-hour work week</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Daily Rate", `$${result.dailyWage.toFixed(2)}/day`], ["Weekly Rate", `$${result.weeklyWage.toFixed(2)}/wk`], ["Monthly Gross", `$${result.monthlyWage.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pay Breakdown (Before Taxes)</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Hourly") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Gross Income Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
                    <Bar dataKey="wage" name="Gross Pay" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Why Convert Salary to an Hourly Wage?</h2>
            <p>At first glance, converting an annual salary into an hourly wage might seem like a simple mathematical exercise. However, for professionals, it is a critical step in understanding the true, granular value of their time. Society often measures career success by the "headline" salary number—$70,000, $100,000, or $150,000. But that headline number hides the reality of how many hours of your life you are actually trading for that money.</p>
            <p>By converting your salary to an hourly wage, you uncover your "Effective Hourly Rate." This metric is essential for evaluating job offers, understanding the financial impact of unpaid overtime, and making better day-to-day spending decisions based on the time-value of your money.</p>

            <h2>How It Works</h2>
            <p>The mathematics behind this calculator are straightforward but rely heavily on standardizing your work schedule. The core logic involves dividing your annual salary by the total number of hours you work in a year.</p>
            <p>First, the calculator determines your <strong>Total Annual Hours</strong>. By default, it uses the standard American full-time schedule: 40 hours a week for 52 weeks a year. Formula: <code>Total Hours = Hours per Week * Weeks per Year</code>. (40 * 52 = 2,080 hours).</p>
            <p>Next, it calculates your <strong>Hourly Wage</strong> by dividing your salary by those total hours. Formula: <code>Hourly Wage = Annual Salary / Total Annual Hours</code>. If you make $75,000 a year, the math is $75,000 / 2,080 = $36.06 per hour.</p>
            <p>The calculator then works backwards to provide your pay across different frequencies. Your <strong>Weekly Wage</strong> is your Annual Salary divided by your Weeks per Year. Your <strong>Daily Wage</strong> is your Weekly Wage divided by your Days per Week.</p>

            <h2>Understanding Your Results</h2>
            <p>When you execute a calculation, the tool provides five distinct analytical sections designed to help you fully visualize your earning power.</p>
            <p><strong>Primary Result Card:</strong> This highlights your exact Hourly Wage Equivalent. This is the amount of money you earn for every 60 minutes you spend at your desk.</p>
            <p><strong>3-Stat Bar:</strong> This section breaks down your daily and weekly earning rates, providing a micro-view of your cash flow. It also displays your standard monthly gross, which is the number you will use for housing budgets and loan applications.</p>
            <p><strong>Pay Breakdown Table:</strong> A comprehensive, line-by-line accounting that converts your salary into every possible time frequency, allowing you to instantly compare a salaried job against a temporary hourly contract.</p>
            <p><strong>Gross Income Chart:</strong> A visual bar chart that illustrates the scale of your income across the three most common budgeting periods (Monthly, Bi-Weekly, and Weekly).</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating your schedule metrics, reminding you exactly how many total hours the calculation is based upon (usually 2,080).</p>

            <h2>Key Factors</h2>
            <p>Your effective hourly rate is highly sensitive to the hours you actually work. Understanding how salary structure impacts this rate is vital.</p>
            <p><strong>The Overtime Dilution Trap:</strong> The biggest danger of a salaried (exempt) position is unpaid overtime. If you earn $100,000 a year, your standard hourly rate is $48.08 (based on 40 hours). However, if your company culture demands 60-hour work weeks, you are now working 3,120 hours a year. Your effective hourly rate plummets to $32.05. You are making the same hourly rate as someone earning $66,000 working standard hours, but you have sacrificed your personal life to do it.</p>
            <p><strong>The Paid Time Off (PTO) Factor:</strong> Salaried employees are usually paid for 52 weeks a year, regardless of whether they take a two-week vacation. Because PTO is paid, you do not adjust the "Weeks / Year" input to 50; you leave it at 52 because you are still generating income during those weeks off.</p>
            <p><strong>Contract and Freelance Work:</strong> If you are transitioning from a salaried job to freelancing, you cannot just charge your salaried hourly rate. A $40/hour W-2 employee might need to charge $80/hour as a 1099 contractor to break even. This is because contractors must pay their own self-employment taxes (both halves of FICA), buy their own health insurance, fund their own retirement, and account for unbillable administrative time.</p>

            <h2>Advanced Features</h2>
            <p>The Advanced Work Schedule tab allows this calculator to adapt to non-standard work environments, which are becoming increasingly common.</p>
            <p>By adjusting the <strong>Hours/Week</strong> input, you can instantly see the dilution effect of mandatory overtime, or conversely, the massive hourly rate boost of a 4-day (32-hour) work week. By adjusting the <strong>Weeks/Year</strong> input, seasonal workers, contractors, and teachers (who often work 40-42 weeks but have their pay spread over 12 months) can determine their true hourly earning power while on the clock.</p>

            <h2>Practical Examples</h2>
            <p>Let's look at how utilizing this calculator can change your perspective on job offers and daily spending.</p>
            <p><strong>Example 1: The Counter-Offer Dilemma.</strong> You currently make $60,000 working a strict 40-hour week ($28.85/hr). A competing firm offers you $75,000, which sounds like a massive 25% raise. However, you know the new firm expects 55-hour weeks. You plug $75,000 and 55 hours into the calculator. The result? Your new hourly wage is $26.22/hr. You are actually taking an hourly pay cut to take on significantly more stress.</p>
            <p><strong>Example 2: The Time-Value of Spending.</strong> You make $85,000 a year, which the calculator translates to roughly $40.87 per hour (gross). You see a new jacket on sale for $250. Instead of just swiping your card, you divide $250 by $40.87. You realize that jacket costs you just over 6 hours of sitting at your desk. Framing the purchase in terms of "hours of your life" often curbs impulsive spending habits.</p>

            <h2>Tips & Best Practices</h2>
            <p>Knowing your hourly rate is only useful if you apply it to your financial decisions. Keep these best practices in mind.</p>
            <p>First, always remember the difference between Gross and Net. This calculator, like all standard financial tools, calculates your Gross Hourly Wage (before taxes). To find your true "Take-Home" hourly wage, you generally need to subtract 20% to 30% from the result to account for federal, state, and payroll taxes.</p>
            <p>Second, memorize the "2080 Rule" for quick negotiations. If a recruiter asks for your hourly requirement and you want to make $90,000 a year, divide $90,000 by 2,000 (rounding down 2,080 for easy mental math). The answer is $45/hour. If an hourly job pays $35/hour, multiply by 2,000 to know it equates to roughly $70,000 a year.</p>
            <p>Third, use your hourly rate to justify outsourcing tasks. If your effective hourly rate is $60/hour, and you can hire a neighborhood kid to mow your lawn for $40, it is financially efficient to pay them and use that hour to either rest, work on a side hustle, or spend time with family.</p>

            <h2>Benefits</h2>
            <p>Using an Hourly Wage Calculator shifts your mindset from "salary-focused" to "time-focused." It strips away the illusion of a high salary if that salary is built on the back of excessive, unpaid overtime.</p>
            <p>By defining exactly what an hour of your professional life is worth, this tool empowers you to negotiate fiercely for better work-life balance, evaluate job transitions with mathematical precision, and make purchasing decisions that align with the true value of your time.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hourly-wage-calculator" />
          <PopularCalculators exclude="/calculator/hourly-wage-calculator" />
        </div>
      </div>
    </>
  );
}
