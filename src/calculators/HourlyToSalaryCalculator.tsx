"use client";
import { RotateCcw, Calendar, TrendingUp, Clock, Info, Calculator } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";

const HourlyToSalaryCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState("25");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [annualSalary, setAnnualSalary] = useState("52000");
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [calcSource, setCalcSource] = useState<"hourly" | "salary">("hourly");

  const handleCalculate = () => {
    const hours = parseFloat(hoursPerWeek) || 0;
    const weeks = parseFloat(weeksPerYear) || 0;
    if (hours === 0 || weeks === 0) return;

    let annual, rate;
    if (calcSource === "hourly") {
      rate = parseFloat(hourlyRate) || 0;
      annual = rate * hours * weeks;
      setAnnualSalary(annual.toFixed(0));
    } else {
      annual = parseFloat(annualSalary) || 0;
      rate = annual / (hours * weeks);
      setHourlyRate(rate.toFixed(2));
    }

    const monthly = annual / 12;
    const biweekly = annual / 26;
    const weekly = annual / 52;
    const daily = rate * 8;

    setResults({
      annual,
      monthly,
      biweekly,
      weekly,
      daily,
      hourly: rate
    });
    setShowResults(true);
  };

  useEffect(() => {
    // Initial calculation silently
    const rate = parseFloat(hourlyRate) || 0;
    const hours = parseFloat(hoursPerWeek) || 0;
    const weeks = parseFloat(weeksPerYear) || 0;
    const annual = rate * hours * weeks;
    setResults({ annual, monthly: annual/12, biweekly: annual/26, weekly: annual/52, daily: rate*8, hourly: rate });
  }, []);

  const reset = () => {
    setHourlyRate("25");
    setHoursPerWeek("40");
    setWeeksPerYear("52");
    setAnnualSalary("52000");
    setShowResults(false);
    setCalcSource("hourly");
  };

  const faqs = [
    { question: "How do I calculate my annual salary from an hourly rate?", answer: "The standard formula for a full-time employee is: Hourly Rate × 40 Hours/Week × 52 Weeks/Year. For example, $25 per hour equals $52,000 per year." },
    { question: "Is it better to be salaried or hourly?", answer: "It depends on your lifestyle. Hourly employees are generally eligible for overtime pay (1.5x rate) for any hours over 40. Salaried employees often have more consistent paychecks and better benefits." },
    { question: "Does this calculator include taxes?", answer: "No, this calculator provides 'gross' figures (before taxes). To see your take-home pay, you should use our Net Pay Calculator which accounts for federal, state, and FICA taxes." },
    { question: "How many working hours are in a year?", answer: "A standard full-time work year (40 hours per week, 52 weeks per year) consists of 2,080 working hours." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Hourly to Salary Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Hourly to Salary Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Quickly convert between hourly wages and annual, monthly, or weekly salaries.</p>

            <div className="card-calculator mb-8">
              <div className="mb-6 flex gap-2">
                <button onClick={() => setCalcSource("hourly")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${calcSource === "hourly" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Convert Hourly to Salary</button>
                <button onClick={() => setCalcSource("salary")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${calcSource === "salary" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Convert Salary to Hourly</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 mb-6">
                <section className="space-y-4">
                  {calcSource === "hourly" ? (
                    <InputField id="hourly" label="Hourly Rate" value={hourlyRate} onChange={setHourlyRate} prefix="$" />
                  ) : (
                    <InputField id="salary" label="Annual Salary" value={annualSalary} onChange={setAnnualSalary} prefix="$" />
                  )}
                  <InputField id="hours" label="Hours Per Week" value={hoursPerWeek} onChange={setHoursPerWeek} suffix="hrs" />
                  <InputField id="weeks" label="Weeks Per Year" value={weeksPerYear} onChange={setWeeksPerYear} suffix="wks" />
                </section>
                <section>
                   <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                         <Info className="h-4 w-4 text-primary" />
                         <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Standard Work Year</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Calculations assume a standard full-time schedule of 2,080 hours per year (40 hrs × 52 wks) unless adjusted.</p>
                   </div>
                </section>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Calculator className="h-5 w-5" /> Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && results && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="result-card text-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Equivalent Annual Salary</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.annual).toLocaleString()}</p>
                  </div>
                  <div className="result-card text-center py-8 border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Equivalent Hourly Rate</p>
                    <p className="text-5xl font-black text-foreground">${results.hourly.toFixed(2)}</p>
                  </div>
                </div>

                <div className="card-calculator mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Pay Period Breakdown (Gross)
                  </h2>
                  <ResultDisplay items={[
                    { label: "Annual Income", value: results.annual },
                    { label: "Monthly Income", value: results.monthly },
                    { label: "Bi-Weekly Income", value: results.biweekly },
                    { label: "Weekly Income", value: results.weekly },
                    { label: "Daily (8-Hour Day)", value: results.daily },
                  ]} />
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />

            {/* SEO Content Sections */}
            <div className="mt-4 space-y-8 mb-10">
              <section>
                <h2 className="text-2xl font-bold mb-4">How the Hourly to Salary Calculator Works</h2>
                <p className="text-muted-foreground mb-3">Our converter uses the simple but essential relationship between your time and your earnings. Choose whether you want to convert from an hourly rate to an annual salary or vice versa, enter your figures, and click Calculate.</p>
                <p className="text-muted-foreground mb-3">The math is based on your specific work schedule: <strong>Hourly Rate × Hours per Week × Weeks per Year = Annual Salary</strong>. By default, the tool uses a standard 40-hour work week and 52 weeks per year (totaling 2,080 hours), but you can adjust these to fit part-time or seasonal roles.</p>
                <p className="text-muted-foreground">The results provide a comprehensive breakdown across all major pay periods—annual, monthly, bi-weekly, weekly, and daily—allowing you to see exactly how your wages translate to your budget.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Understanding Your Results</h2>
                <p className="text-muted-foreground mb-3">The <strong>Equivalent Annual Salary</strong> represents your total gross earnings before any deductions for taxes, insurance, or retirement contributions. This is the 'sticker price' usually quoted in job offers.</p>
                <p className="text-muted-foreground mb-3">The <strong>Equivalent Hourly Rate</strong> is what you effectively earn for every sixty minutes of work. If you are comparing a salaried role that requires 50 hours a week to an hourly role at 40 hours, this is the most accurate metric for comparison.</p>
                <p className="text-muted-foreground">The <strong>Pay Period Breakdown</strong> shows your gross pay for various cycles. Monthly figures are best for rent and mortgage planning, while weekly or bi-weekly figures match most payroll schedules.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
                <p className="text-muted-foreground mb-3"><strong>Negotiating Job Offers:</strong> When presented with an annual salary, use this tool to find the hourly equivalent to see if it matches your current worth or if you'd be better off with an hourly role that pays overtime.</p>
                <p className="text-muted-foreground mb-3"><strong>Career Planning:</strong> Determine how much of an hourly raise you need to reach a specific annual income goal (e.g., 'What hourly rate do I need to make $75,000 a year?').</p>
                <p className="text-muted-foreground"><strong>Budgeting and Expenses:</strong> Convert your annual salary to a monthly or weekly amount to see if a new apartment or car payment is truly affordable relative to your actual take-home pay periods.</p>
              </section>
            </div>

            <article className="prose-finance">
              <h2>Converting Hourly to Salary: The Full Picture</h2>
              <p>Whether you are negotiating a new job offer or looking to switch from hourly to salaried status, understanding the relationship between these two figures is essential. While the math is simple, there are several "hidden" factors that can make one option more valuable than the other.</p>
              <h3>The Standard Formula</h3>
              <p>For most professionals in the United States, the work year is calculated as 2,080 hours (40 hours/week × 52 weeks/year).</p>
              <h3>Overtime and Non-Exempt Status</h3>
              <p>The biggest difference between hourly and salaried roles is often overtime eligibility. Non-exempt employees must be paid 1.5x their rate for hours over 40, whereas salaried employees often have consistent pay regardless of extra hours worked.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hourly-to-salary-calculator" />
            <PopularCalculators exclude="/calculator/hourly-to-salary-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default HourlyToSalaryCalculator;
