"use client";

import { useState, useEffect } from "react";
import { format, differenceInSeconds } from "date-fns";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Calendar as CalendarIcon, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TimeDurationCalculator = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  useEffect(() => {
    const now = new Date();
    if (!startDate) setStartDate(now);
    if (!endDate) setEndDate(now);
  }, []);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    years: number; months: number; days: number;
    hours: number; minutes: number; seconds: number;
    totalHours: number; totalMinutes: number; totalSeconds: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    if (!startDate || !endDate) return;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);

    const from = new Date(startDate);
    from.setHours(sh || 0, sm || 0, 0, 0);
    const to = new Date(endDate);
    to.setHours(eh || 0, em || 0, 0, 0);

    if (from >= to) return;

    const totalSec = differenceInSeconds(to, from);
    const totalMinutes = Math.floor(totalSec / 60);
    const totalHours = Math.floor(totalSec / 3600);

    // Breakdown
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();
    let hours = to.getHours() - from.getHours();
    let minutes = to.getMinutes() - from.getMinutes();

    if (minutes < 0) { hours--; minutes += 60; }
    if (hours < 0) { days--; hours += 24; }
    if (days < 0) { months--; const prev = new Date(to.getFullYear(), to.getMonth(), 0); days += prev.getDate(); }
    if (months < 0) { years--; months += 12; }

    setResult({
      years, months, days, hours, minutes, seconds: 0,
      totalHours, totalMinutes, totalSeconds: totalSec,
    });
  };

  const reset = () => {
    setShowResults(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime("09:00");
    setEndTime("17:00");
    setResult(null);
  };

  const faqs = [
    { question: "How is the duration calculated?", answer: "The calculator finds the exact difference between the start and end date/time, breaking it down into years, months, days, hours, and minutes." },
    { question: "Can I calculate time between dates only?", answer: "Yes, the time fields default to midnight. You can leave the times as-is to calculate the duration between dates alone." },
    { question: "Does it handle overnight durations?", answer: "Yes, set the end date to the next day with an earlier time to calculate overnight durations correctly." },
    { question: "What is this useful for?", answer: "Common uses include calculating work hours, project durations, event planning, travel time, and time tracking." },
  ];

  const DatePicker = ({ label, date, onSelect }: { label: string; date: Date | undefined; onSelect: (d: Date) => void }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => d && onSelect(d)} initialFocus className="pointer-events-auto" fromYear={1900} toYear={2100} />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Time Duration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Duration Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <DatePicker label="Start Date" date={startDate} onSelect={setStartDate} />
                <InputField id="startTime" label="Start Time" value={startTime} onChange={setStartTime} type="time" />
              </div>
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <DatePicker label="End Date" date={endDate} onSelect={setEndDate} />
                <InputField id="endTime" label="End Time" value={endTime} onChange={setEndTime} type="time" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Duration Results</h2>
                <div className="text-center mb-8 p-8 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-4xl font-black text-foreground">
                    {result.years > 0 && <>{result.years}y </>}
                    {result.months > 0 && <>{result.months}m </>}
                    {result.days > 0 && <>{result.days}d </>}
                    {result.hours}h {result.minutes}m
                  </p>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mt-2">Exact Time Elapsed</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Hours", value: result.totalHours.toLocaleString() },
                    { label: "Total Minutes", value: result.totalMinutes.toLocaleString() },
                    { label: "Total Seconds", value: result.totalSeconds.toLocaleString() },
                  ].map(item => (
                    <div key={item.label} className="bg-secondary/30 rounded-xl p-4 text-center border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{item.label}</p>
                      <p className="text-lg font-black text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>About Time Duration Calculator</h2>
              <p>This tool calculates the precise duration between any two dates and times. It accounts for varying month lengths, leap years, and provides results in multiple units.</p>

              <h2>Common Uses</h2>
              <ul>
                <li><strong>Work hours:</strong> Calculate time spent on projects or shifts</li>
                <li><strong>Event planning:</strong> Find exact time until or since an event</li>
                <li><strong>Travel:</strong> Compute journey duration across dates</li>
                <li><strong>Legal:</strong> Determine precise time periods for contracts or statutes</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-duration-calculator" />
          <PopularCalculators exclude="/time-duration-calculator" />
        </div>
      </div>
    </>
  );
};

export default TimeDurationCalculator;
