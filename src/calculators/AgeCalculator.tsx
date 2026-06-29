"use client";
import { RotateCcw, CalendarDays, Calculator } from "lucide-react";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  // Avoid hydration mismatch by setting today's date client-side only
  useEffect(() => {
    if (!toDate) setToDate(new Date());
  }, []);
  const [result, setResult] = useState<{
    years: number;
    months: number; days: number;
    totalMonths: number; totalWeeks: number; totalDays: number; totalHours: number;
    nextBirthday: string; daysUntilBirthday: number;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!birthDate || !toDate) return;
    const from = new Date(birthDate);
    const to = new Date(toDate);
    if (from >= to) return;

    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = to.getTime() - from.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    // Next birthday
    let nextBday = new Date(to.getFullYear(), from.getMonth(), from.getDate());
    if (nextBday <= to) nextBday = new Date(to.getFullYear() + 1, from.getMonth(), from.getDate());
    const daysUntilBirthday = Math.ceil((nextBday.getTime() - to.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years, months, days, totalMonths, totalWeeks, totalDays, totalHours,
      nextBirthday: format(nextBday, "EEEE, MMMM d, yyyy"),
      daysUntilBirthday,
    });
  };

  const reset = () => { setBirthDate(undefined); setToDate(undefined); setResult(null); setTimeout(() => setToDate(new Date()), 0); };

  const faqs = [
    { question: "How is age calculated?", answer: "Age is calculated by finding the difference between your birth date and the current (or selected) date in years, months, and days, accounting for varying month lengths and leap years." },
    { question: "Does this calculator account for leap years?", answer: "Yes, the calculator uses actual calendar dates and correctly handles leap years when computing the difference." },
    { question: "Can I calculate age to a future date?", answer: "Yes, you can set the 'Age at Date' to any future date to see what your age will be on that day." },
    { question: "How are total days calculated?", answer: "Total days are calculated as the exact number of calendar days between the two dates using millisecond precision." },
  ];

  const DatePicker = ({ label, date, onSelect, maxDate }: { label: string; date: Date | undefined; onSelect: (d: Date | undefined) => void; maxDate?: Date }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12", !date && "text-muted-foreground")}>
            <CalendarDays className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            disabled={(d) => maxDate ? d > maxDate : false}
            initialFocus
            className="pointer-events-auto"
            fromYear={1900}
            toYear={2040}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Age Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Age Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <DatePicker label="Date of Birth" date={birthDate} onSelect={setBirthDate} />
                <DatePicker label="Age at Date" date={toDate} onSelect={(d) => d && setToDate(d)} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Your Age</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-1">{result.years}<span className="text-2xl text-muted-foreground ml-1">years</span></p>
                  <p className="text-lg text-muted-foreground">{result.months} months, {result.days} days</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Months", value: result.totalMonths.toLocaleString() },
                    { label: "Total Weeks", value: result.totalWeeks.toLocaleString() },
                    { label: "Total Days", value: result.totalDays.toLocaleString() },
                    { label: "Total Hours", value: result.totalHours.toLocaleString() },
                  ].map(item => (
                    <div key={item.label} className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">🎂 Next Birthday</p>
                  <p className="font-semibold">{result.nextBirthday}</p>
                  <p className="text-sm text-muted-foreground">{result.daysUntilBirthday} days away</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>How Age Calculation Works</h2>
              <p>This calculator computes the exact difference between two dates by counting complete years, then remaining months, then remaining days. It properly handles varying month lengths (28–31 days) and leap years.</p>

              <h2>Age in Different Units</h2>
              <p>Besides years-months-days, we display your age in total months, weeks, days, and hours for a comprehensive view. These are useful for medical records, legal documents, and curiosity.</p>

              <h2>Next Birthday Countdown</h2>
              <p>The calculator also tells you exactly how many days remain until your next birthday and what day of the week it falls on.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Note:</strong> This calculator uses the Gregorian calendar system for all computations.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/age-calculator" />
          <PopularCalculators exclude="/age-calculator" />
        </div>
      </div>
    </>
  );
};

export default AgeCalculator;
