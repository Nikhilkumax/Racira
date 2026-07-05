"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const SalaryCalculator = () => {
  const [amount, setAmount] = useState("50000");
  const [frequency, setFrequency] = useState("annually");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [holidays, setHolidays] = useState("10");
  const [vacationDays, setVacationDays] = useState("15");
  const [showResults, setShowResults] = useState(false);

  const [result, setResult] = useState<{
    hourly: number; daily: number; weekly: number; biweekly: number; monthly: number; annually: number;
    adjustedAnnual: number; workDays: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const val = parseFloat(amount) || 0;
    const hpw = parseFloat(hoursPerWeek) || 40;
    const hol = parseFloat(holidays) || 0;
    const vac = parseFloat(vacationDays) || 0;

    let annual: number;
    switch (frequency) {
      case "hourly": annual = val * hpw * 52; break;
      case "daily": annual = val * 260; break;
      case "weekly": annual = val * 52; break;
      case "biweekly": annual = val * 26; break;
      case "monthly": annual = val * 12; break;
      default: annual = val;
    }

    const workDays = 260 - hol - vac;
    const workHours = workDays * (hpw / 5);
    const hourly = annual / (52 * hpw);
    const adjustedHourly = annual / workHours;

    setResult({
      hourly,
      daily: hourly * (hpw / 5),
      weekly: hourly * hpw,
      biweekly: hourly * hpw * 2,
      monthly: annual / 12,
      annually: annual,
      adjustedAnnual: adjustedHourly * workHours,
      workDays,
    });
  };

  const reset = () => {
    setShowResults(false); setAmount("50000"); setFrequency("annually"); setHoursPerWeek("40"); setHolidays("10"); setVacationDays("15"); setResult(null); };

  const faqs = [
    { question: "How do I convert hourly to annual salary?", answer: "Multiply your hourly rate by the number of hours you work per week, then multiply by 52 weeks. For example, $25/hour × 40 hours × 52 weeks = $52,000 annual salary." },
    { question: "How are holidays and vacation days factored in?", answer: "Our calculator adjusts for paid holidays and vacation days. While your annual salary stays the same, the effective hourly rate increases because you work fewer actual days. The adjusted calculation shows your true hourly rate based on actual working days." },
    { question: "What is the difference between gross and net salary?", answer: "Gross salary is your total pay before any deductions. Net salary (take-home pay) is what you receive after taxes, insurance, retirement contributions, and other deductions. This calculator shows gross salary conversions. Use our Income Tax Calculator for net pay estimates." },
    { question: "How many work days are in a year?", answer: "A standard year has 260 work days (52 weeks × 5 days). After subtracting typical US holidays (10) and average vacation days (15), the actual working days are approximately 235." },
    { question: "Does this account for overtime?", answer: "This calculator assumes standard hours without overtime. For overtime calculations, you would need to add overtime hours at 1.5× (or 2× for double-time) to your regular calculation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Salary Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Salary Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="amount" label="Salary Amount" value={amount} onChange={setAmount} prefix="$" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Pay Frequency</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-calc">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <InputField id="hours" label="Hours per Week" value={hoursPerWeek} onChange={setHoursPerWeek} />
                <InputField id="holidays" label="Paid Holidays/Year" value={holidays} onChange={setHolidays} />
                <InputField id="vacation" label="Vacation Days/Year" value={vacationDays} onChange={setVacationDays} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Salary Breakdown</h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary text-foreground">
                        <th className="px-4 py-3 text-left font-medium">Period</th>
                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Hourly", result.hourly],
                        ["Daily", result.daily],
                        ["Weekly", result.weekly],
                        ["Bi-Weekly", result.biweekly],
                        ["Monthly", result.monthly],
                        ["Annually", result.annually],
                      ].map(([label, val]) => (
                        <tr key={label as string} className="border-t border-border hover:bg-secondary/30">
                          <td className="px-4 py-3 font-medium text-foreground">{label}</td>
                          <td className="px-4 py-3 text-right text-[hsl(217,91%,40%)] dark:text-primary font-semibold">${(val as number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground">
                  <p>Adjusted for {result.workDays} working days ({parseFloat(holidays)} holidays + {parseFloat(vacationDays)} vacation days excluded from 260 total work days).</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is a Salary Calculator?</h2>
              <p>A salary calculator converts your pay between different time periods — hourly, daily, weekly, bi-weekly, monthly, and annually. Whether you're evaluating a job offer, comparing different positions, or budgeting, understanding your salary across different timeframes is essential.</p>
              <p>Our calculator also accounts for paid holidays and vacation days, giving you a more accurate picture of your actual working hours and effective hourly rate.</p>

              <h2 className="text-2xl font-bold mb-3">How Salary Conversions Work</h2>
              <p>The standard conversions assume a typical full-time schedule: 40 hours per week, 52 weeks per year, yielding 2,080 working hours annually. From an annual salary, the hourly rate is simply annual ÷ 2,080.</p>
              <p>For example, a $52,000 annual salary translates to $25/hour, $200/day, $1,000/week, $2,000 bi-weekly, and $4,333.33 monthly.</p>

              <h2 className="text-2xl font-bold mb-3">The Impact of Hours and Days Off</h2>
              <p>Standard calculations assume you work every scheduled day, but paid holidays and vacation reduce your actual working days. If you receive 10 holidays and 15 vacation days, you only work 235 out of 260 possible days. This means your effective hourly rate is higher than the standard calculation suggests.</p>

              <h2 className="text-2xl font-bold mb-3">Tips for Salary Negotiation</h2>
              <ul>
                <li><strong>Know your market rate:</strong> Research salary ranges for your role and location.</li>
                <li><strong>Consider total compensation:</strong> Benefits like health insurance, retirement matching, and equity can be worth 20-40% of base salary.</li>
                <li><strong>Factor in work-life balance:</strong> A slightly lower salary with more PTO might be worth more to you.</li>
                <li><strong>Account for cost of living:</strong> A $100K salary in a high-cost city may buy less than $70K in a lower-cost area.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides gross salary conversions. Actual take-home pay depends on taxes, deductions, and benefits. Use our Income Tax Calculator for net pay estimates.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/salary-calculator" />
          <PopularCalculators exclude="/salary-calculator" />
        </div>
      </div>
    </>
  );
};

export default SalaryCalculator;


