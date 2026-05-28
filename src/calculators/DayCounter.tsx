"use client";

import { useState } from "react";
import { format, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, isWeekend, eachDayOfInterval } from "date-fns";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DayCounter = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeEndDay, setIncludeEndDay] = useState(false);
  const [result, setResult] = useState<{
    totalDays: number; weeks: number; weekdays: number; weekendDays: number;
    months: number; years: number;
  } | null>(null);

  const calculate = () => {
    const from = startDate < endDate ? startDate : endDate;
    const to = startDate < endDate ? endDate : startDate;

    let totalDays = differenceInDays(to, from);
    if (includeEndDay) totalDays += 1;

    const allDays = eachDayOfInterval({ start: from, end: to });
    const weekendDays = allDays.filter(d => isWeekend(d)).length;
    const weekdays = allDays.length - weekendDays;

    setResult({
      totalDays,
      weeks: differenceInWeeks(to, from),
      weekdays,
      weekendDays,
      months: differenceInMonths(to, from),
      years: differenceInYears(to, from),
    });
  };

  const reset = () => { setStartDate(new Date()); setEndDate(new Date()); setIncludeEndDay(false); setResult(null); };

  const faqs = [
    { question: "Does the day counter include both start and end dates?", answer: "By default, it counts from the start date up to (but not including) the end date. Toggle 'Include end day' to count both dates." },
    { question: "How are weekdays calculated?", answer: "Weekdays are Monday through Friday. The calculator counts each day in the range and classifies it as a weekday or weekend day." },
    { question: "Can I count days between past and future dates?", answer: "Yes, you can select any two dates regardless of whether they are in the past or future." },
    { question: "Does it account for holidays?", answer: "No, the calculator only distinguishes between weekdays and weekends. Public holidays are counted as regular weekdays." },
  ];

  const DatePicker = ({ label, date, onSelect }: { label: string; date: Date; onSelect: (d: Date) => void }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => d && onSelect(d)} initialFocus className="p-3 pointer-events-auto" captionLayout="dropdown-buttons" fromYear={1900} toYear={2100} />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Day Counter" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Day Counter</h1>
        <p className="text-muted-foreground mb-6 text-lg">Count the number of days between any two dates.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <DatePicker label="Start Date" date={startDate} onSelect={setStartDate} />
                <DatePicker label="End Date" date={endDate} onSelect={setEndDate} />
              </div>

              <label className="flex items-center gap-2 mb-6 text-sm cursor-pointer">
                <input type="checkbox" checked={includeEndDay} onChange={(e) => setIncludeEndDay(e.target.checked)} className="rounded border-border" />
                Include end day in count
              </label>

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Calculator className="h-4 w-4" /> Count Days
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {result && (
              <>
                <h2 className="text-xl font-bold mb-4">Results</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-1">{result.totalDays}</p>
                  <p className="text-lg text-muted-foreground">days</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Weeks", value: result.weeks },
                    { label: "Months", value: result.months },
                    { label: "Years", value: result.years },
                    { label: "Weekdays", value: result.weekdays },
                    { label: "Weekend Days", value: result.weekendDays },
                    { label: "Total Days", value: result.totalDays },
                  ].map(item => (
                    <div key={item.label} className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-lg font-bold">{item.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>About the Day Counter</h2>
              <p>This tool calculates the exact number of days between two dates, along with breakdowns by weeks, months, weekdays, and weekend days.</p>

              <h2>Common Uses</h2>
              <ul>
                <li><strong>Countdown:</strong> Days until a wedding, vacation, or deadline</li>
                <li><strong>Age in days:</strong> How many days old are you?</li>
                <li><strong>Work planning:</strong> Number of business days in a project timeline</li>
                <li><strong>Legal deadlines:</strong> Statute of limitations, filing windows</li>
              </ul>

              <h2>Weekday vs. Calendar Day Counting</h2>
              <p>Calendar days include every day. Weekdays exclude Saturday and Sunday. For business planning, weekday counts are typically more relevant. Note that this tool does not account for public holidays.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/day-counter" />
          <PopularCalculators exclude="/day-counter" />
        </div>
      </div>
    </>
  );
};

export default DayCounter;

