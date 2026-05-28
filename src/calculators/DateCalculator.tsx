"use client";

import { useState } from "react";
import { format, addDays, addMonths, addYears, subDays, subMonths, subYears } from "date-fns";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Calculator, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DateCalculator = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [daysVal, setDaysVal] = useState("0");
  const [monthsVal, setMonthsVal] = useState("0");
  const [yearsVal, setYearsVal] = useState("0");
  const [result, setResult] = useState<{ resultDate: string; dayOfWeek: string; formatted: string } | null>(null);

  const handleCalculate = () => {
    const d = parseInt(daysVal) || 0;
    const m = parseInt(monthsVal) || 0;
    const y = parseInt(yearsVal) || 0;

    let resultDate = new Date(startDate);
    if (operation === "add") {
      resultDate = addYears(resultDate, y);
      resultDate = addMonths(resultDate, m);
      resultDate = addDays(resultDate, d);
    } else {
      resultDate = subYears(resultDate, y);
      resultDate = subMonths(resultDate, m);
      resultDate = subDays(resultDate, d);
    }

    setResult({
      resultDate: format(resultDate, "PPP"),
      dayOfWeek: format(resultDate, "EEEE"),
      formatted: format(resultDate, "yyyy-MM-dd"),
    });
  };

  const reset = () => { setStartDate(new Date()); setDaysVal("0"); setMonthsVal("0"); setYearsVal("0"); setResult(null); };

  const faqs = [
    { question: "How does this date calculator work?", answer: "Enter a start date, choose to add or subtract, then specify the number of years, months, and/or days. The calculator computes the resulting date accounting for month lengths and leap years." },
    { question: "Does it handle leap years?", answer: "Yes, the calculator uses the date-fns library which correctly handles leap years, varying month lengths, and edge cases like adding months to dates at the end of a month." },
    { question: "Can I subtract dates?", answer: "Yes, toggle to 'Subtract' mode to go backwards in time from your start date." },
    { question: "What if I add months to January 31?", answer: "Adding 1 month to January 31 results in February 28 (or 29 in a leap year), as the calculator clamps to the last valid day of the target month." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Date Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Date Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Add or subtract days, months, and years from any date.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus className="p-3 pointer-events-auto" captionLayout="dropdown-buttons" fromYear={1900} toYear={2100} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mb-5">
                <div className="flex gap-2">
                  <button onClick={() => setOperation("add")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${operation === "add" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Add (+)</button>
                  <button onClick={() => setOperation("subtract")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${operation === "subtract" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Subtract (−)</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <InputField id="years" label="Years" value={yearsVal} onChange={setYearsVal} />
                <InputField id="months" label="Months" value={monthsVal} onChange={setMonthsVal} />
                <InputField id="days" label="Days" value={daysVal} onChange={setDaysVal} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Calculator className="h-4 w-4" /> Calculate Date
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {result && (
              <>
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <div className="text-center mb-4">
                  <p className="text-3xl font-extrabold mb-1">{result.resultDate}</p>
                  <p className="text-lg text-muted-foreground">{result.dayOfWeek}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">ISO Format</p>
                  <p className="font-mono font-bold">{result.formatted}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>About the Date Calculator</h2>
              <p>This tool lets you quickly find a date in the future or past by adding or subtracting a specific number of years, months, and days from any starting date.</p>

              <h2>Common Uses</h2>
              <ul>
                <li><strong>Contract deadlines:</strong> "90 days from today"</li>
                <li><strong>Warranty expiration:</strong> "2 years from purchase date"</li>
                <li><strong>Project planning:</strong> "6 months and 15 days from kickoff"</li>
                <li><strong>Historical research:</strong> "What date was 1000 days ago?"</li>
              </ul>

              <h2>How Month Addition Works</h2>
              <p>When adding months, if the resulting month has fewer days than the starting day, the date is clamped to the last day of the target month. For example, adding 1 month to January 31 yields February 28 (or 29 in a leap year).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/date-calculator" />
          <PopularCalculators exclude="/date-calculator" />
        </div>
      </div>
    </>
  );
};

export default DateCalculator;

