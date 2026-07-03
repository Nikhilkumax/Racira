"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Clock } from "lucide-react";

const OvertimeCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState("20");
  const [regularHours, setRegularHours] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("10");
  const [overtimeMultiplier, setOvertimeMultiplier] = useState("1.5");
  const [weeksPerYear, setWeeksPerYear] = useState("52");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const rate = parseFloat(hourlyRate);
    const regular = parseFloat(regularHours);
    const ot = parseFloat(overtimeHours);
    const mult = parseFloat(overtimeMultiplier);
    const wks = parseFloat(weeksPerYear);

    const otRate = rate * mult;
    const regularPay = rate * regular;
    const overtimePay = otRate * ot;
    const weeklyTotal = regularPay + overtimePay;
    const annualTotal = weeklyTotal * wks;
    const annualRegular = rate * regular * wks;
    const overtimePremium = annualTotal - annualRegular;

    setResults({ regularPay, otRate, overtimePay, weeklyTotal, annualTotal, overtimePremium });
  };

  const reset = () => {
    setShowResults(false); setHourlyRate("20"); setRegularHours("40"); setOvertimeHours("10"); setOvertimeMultiplier("1.5"); setWeeksPerYear("52"); setResults(null); };

  const faqs = [
    { question: "What is the standard overtime rate?", answer: "Under the US Fair Labor Standards Act (FLSA), non-exempt employees must be paid at least 1.5x their regular hourly rate for all hours worked over 40 in a workweek. Some states (e.g., California) have stricter daily overtime rules." },
    { question: "Who qualifies for overtime?", answer: "Most hourly workers qualify. Salaried employees earning less than $684/week ($35,568/year) must also receive overtime. Salaried workers above this threshold may be exempt depending on their job duties." },
    { question: "Is overtime pay taxed at a higher rate?", answer: "Overtime is taxed as regular income. However, because it increases your paycheck, it may push you into a higher withholding bracket for that specific period. Your effective annual tax rate doesn't change significantly." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Overtime Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Overtime Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="rate" label="Regular Hourly Rate ($)" value={hourlyRate} onChange={setHourlyRate} />
                <InputField id="reg" label="Regular Hours/Week" value={regularHours} onChange={setRegularHours} />
                <InputField id="ot" label="Overtime Hours/Week" value={overtimeHours} onChange={setOvertimeHours} />
                <InputField id="mult" label="Overtime Multiplier" value={overtimeMultiplier} onChange={setOvertimeMultiplier} tooltip="Usually 1.5x (time-and-a-half) or 2x (double time)." />
                <InputField id="wks" label="Weeks Per Year" value={weeksPerYear} onChange={setWeeksPerYear} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Pay Breakdown</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Weekly Total Pay</p>
                    <p className="text-5xl font-black text-foreground">${results.weeklyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Annual Total</p>
                    <p className="text-3xl font-black text-foreground">${results.annualTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Overtime Hourly Rate", value: 0, textValue: "$" + results.otRate.toLocaleString(undefined, { minimumFractionDigits: 2 }) + "/hr" },
                  { label: "Weekly Regular Pay", value: 0, textValue: "$" + results.regularPay.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
                  { label: "Annual Overtime Premium", value: 0, textValue: "$" + results.overtimePremium.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Overtime Pay Explained</h2>
              <p>Overtime compensation is a legal protection for workers, ensuring that employers pay a premium for demanding extra hours. Understanding your overtime rights and potential earnings is essential for every hourly worker.</p>
              <h3>The FLSA and Overtime Rules</h3>
              <p>The Fair Labor Standards Act (FLSA) requires all non-exempt employees to receive at least 1.5x their regular rate for hours worked over 40 per workweek. This is a federal minimum — many states have additional protections.</p>
              <h3>California's Daily Overtime Rule</h3>
              <p>California employees are entitled to 1.5x pay for any hours over 8 in a single workday (and 2x for hours over 12). This is more generous than the federal weekly standard and applies regardless of how many total hours are worked that week.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/overtime" />
          <PopularCalculators exclude="/calculator/overtime-calculator" />
        </div>
      </div>
    </>
  );
};
export default OvertimeCalculator;

