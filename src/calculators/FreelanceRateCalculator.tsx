"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function FreelanceRateCalculator() {
  const [annualIncome, setAnnualIncome] = useState("80000");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksVacation, setWeeksVacation] = useState("2");
  const [nonBillablePercent, setNonBillablePercent] = useState("30");
  const [overheadMonthly, setOverheadMonthly] = useState("500");
  const [profitMargin, setProfitMargin] = useState("20");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ hourlyRate: 0, dailyRate: 0, monthlyRate: 0, breakEvenRate: 0, totalOverhead: 0 });

  const handleCalculate = () => {
    const income = parseFloat(annualIncome) || 0;
    const hrs = parseFloat(hoursPerWeek) || 40;
    const vacation = parseFloat(weeksVacation) || 0;
    const nonBillable = (parseFloat(nonBillablePercent) || 0) / 100;
    const overhead = parseFloat(overheadMonthly) || 0;
    const profit = (parseFloat(profitMargin) || 0) / 100;

    const workingWeeks = 52 - vacation;
    const totalAnnualHours = hrs * workingWeeks;
    const billableHours = totalAnnualHours * (1 - nonBillable);
    const annualOverhead = overhead * 12;
    const totalCost = income + annualOverhead;
    const breakEvenRate = billableHours > 0 ? totalCost / billableHours : 0;
    const hourlyRate = breakEvenRate / (1 - profit);
    const dailyRate = hourlyRate * 8;
    const monthlyRate = hourlyRate * billableHours / 12;

    setResults({ hourlyRate, dailyRate, monthlyRate, breakEvenRate, totalOverhead: annualOverhead });
    setShowResults(true);
  };

  const reset = () => {
    setAnnualIncome("80000"); setHoursPerWeek("40"); setWeeksVacation("2");
    setNonBillablePercent("30"); setOverheadMonthly("500"); setProfitMargin("20"); setShowResults(false);
  };

  const faqs = [
    { question: "How do I calculate my freelance hourly rate?", answer: "Start with your desired annual income, add business overhead costs, account for non-billable hours (admin, marketing, downtime), and divide by total billable hours. Add a profit margin to ensure business growth." },
    { question: "What is the non-billable percentage?", answer: "Non-billable time includes activities like client communication, invoicing, marketing, professional development, and administrative tasks. Typically 25-40% of a freelancer's working hours are non-billable." },
    { question: "What overhead costs should I include?", answer: "Include software subscriptions, equipment, insurance, professional memberships, marketing costs, accounting fees, and any other regular business expenses not directly billed to clients." },
    { question: "Should I charge more than employees with the same salary?", answer: "Yes. Freelancers don't receive benefits like health insurance, paid time off, retirement contributions, or employer tax payments. Your rate should be 1.5-2x the equivalent employee hourly rate to maintain the same net income." },
    { question: "How do I handle self-employment taxes in my rate?", answer: "Self-employed individuals pay both the employee and employer portions of Social Security and Medicare tax (15.3% combined). Factor this into your desired take-home income when calculating your rate." },
    { question: "What is a day rate for freelancers?", answer: "A day rate is typically 7-8 times your hourly rate and is often used for project-based work or consultancy engagements where billing by the hour is impractical." },
    { question: "How often should I raise my rates?", answer: "Most freelancers should review rates annually and increase them by at least the inflation rate. After major skill upgrades, portfolio improvements, or demonstrated client value, larger increases are appropriate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Freelance Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Freelance Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="annual-income" label="Desired Annual Income ($)" value={annualIncome} onChange={setAnnualIncome} prefix="$" tooltip="Your target take-home income before business expenses." />
                <InputField id="hours-week" label="Hours Worked Per Week" value={hoursPerWeek} onChange={setHoursPerWeek} tooltip="Total hours you plan to work per week, including non-billable tasks." />
                <InputField id="vacation" label="Weeks Vacation / Year" value={weeksVacation} onChange={setWeeksVacation} tooltip="Number of weeks off per year (holidays, sick days, vacation)." />
                <InputField id="non-billable" label="Non-Billable Time (%)" value={nonBillablePercent} onChange={setNonBillablePercent} suffix="%" tooltip="Percentage of work time spent on non-billable activities (admin, marketing, etc.)." />
                <InputField id="overhead" label="Monthly Business Overhead ($)" value={overheadMonthly} onChange={setOverheadMonthly} prefix="$" tooltip="Monthly business expenses: software, insurance, equipment, etc." />
                <InputField id="profit" label="Desired Profit Margin (%)" value={profitMargin} onChange={setProfitMargin} suffix="%" tooltip="Extra percentage above costs for business growth and savings." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">Your Recommended Rates</h2>
                <ResultDisplay items={[
                  { label: "Minimum Hourly Rate (Break-Even)", value: results.breakEvenRate },
                  { label: "Recommended Hourly Rate (with Profit)", value: results.hourlyRate, highlight: true },
                  { label: "Daily Rate (8-hour day)", value: results.dailyRate, highlight: true },
                  { label: "Monthly Billing Target", value: results.monthlyRate },
                  { label: "Annual Overhead Costs", value: results.totalOverhead },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>Setting Your Freelance Rate: A Complete Guide</h2>
              <p>Pricing your freelance services is one of the most important business decisions you'll make. Charge too little and you'll be overworked and underpaid. Charge too much without the portfolio to justify it and you'll struggle to win clients. The goal is to find a rate that covers all your costs, compensates for all the time you spend on non-billable activities, and provides a sustainable income for your lifestyle.</p>
              <h2>The Hidden Costs of Freelancing</h2>
              <p>Many new freelancers make the mistake of simply taking their desired salary and dividing it by 2,080 (40 hours × 52 weeks) to get an hourly rate. This is a recipe for financial disaster. A full-time employee with a $80,000 salary actually costs their employer roughly $100,000+ when you include payroll taxes, benefits, and overhead. As a freelancer, you bear all of these costs yourself.</p>
              <h2>Understanding Non-Billable Time</h2>
              <p>The average freelancer spends 25-35% of their working hours on non-billable tasks: responding to emails, creating proposals, invoicing, accounting, marketing their services, professional development, networking, and general administration. If you work 40 hours per week but only 28 of those hours are billable, your effective hourly capacity is dramatically reduced. This is why your billable rate must be significantly higher than a simple division of annual income by working hours would suggest.</p>
              <h2>Accounting for Business Overhead</h2>
              <p>Running a freelance business has real costs: software subscriptions (project management, accounting, design tools), hardware and equipment, professional liability insurance, health insurance (often the largest expense for U.S. freelancers), professional development and courses, marketing and advertising, a dedicated workspace or home office costs, and accounting or legal fees. All of these must be covered by your billable hours.</p>
              <h2>Adding a Profit Margin</h2>
              <p>Beyond covering your personal income and business expenses, you should build in a profit margin (typically 15-25%) that allows your business to grow, invest in better tools, save for slow periods, and build a business reserve fund. Many freelancers treat every dollar above their expenses as "salary," leaving no buffer for slow months, unexpected expenses, or growth investments.</p>
              <h2>Value-Based Pricing vs. Hourly Rates</h2>
              <p>As you gain experience, consider shifting from hourly billing to value-based pricing. Instead of charging for the time it takes you to complete a task, you charge based on the value delivered to the client. A logo that took you 5 hours to design might be worth $2,000 to a startup whose entire brand identity depends on it, far exceeding what an $150/hour rate would yield. Value-based pricing rewards your expertise and efficiency rather than penalizing you for getting faster at your craft.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freelance-rate-calculator" />
          <PopularCalculators exclude="/calculator/freelance-rate-calculator" />
        </div>
      </div>
    </>
  );
}
