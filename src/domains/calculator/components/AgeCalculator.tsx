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
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Age Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative mb-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Your Exact Age</p>
                  <p className="text-4xl font-black text-primary">{result.years} <span className="text-xl text-muted-foreground font-semibold">years</span>, {result.months} <span className="text-xl text-muted-foreground font-semibold">months</span>, {result.days} <span className="text-xl text-muted-foreground font-semibold">days</span></p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Total Months", value: result.totalMonths.toLocaleString() },
                    { label: "Total Weeks", value: result.totalWeeks.toLocaleString() },
                    { label: "Total Days", value: result.totalDays.toLocaleString() },
                    { label: "Total Hours", value: result.totalHours.toLocaleString() },
                  ].map(item => (
                    <div key={item.label} className="card-calculator p-3 text-center border border-border bg-card shadow-sm">
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">{item.label}</p>
                      <p className="text-lg font-black">{item.value}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-accent/30 rounded-lg p-4 text-center border border-border/50 mb-4">
                  <p className="text-sm text-muted-foreground mb-1 font-bold tracking-wide uppercase">Next Birthday</p>
                  <p className="font-semibold text-lg">{result.nextBirthday}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.daysUntilBirthday} days away</p>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">Time Elapsed Breakdown (Log Scale)</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Months", value: result.totalMonths, fill: "#3b82f6" },
                        { name: "Weeks", value: result.totalWeeks, fill: "#10b981" },
                        { name: "Days", value: result.totalDays, fill: "#f59e0b" },
                        { name: "Hours", value: result.totalHours, fill: "#ef4444" }
                      ]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis scale="log" domain={['auto', 'auto']} tickFormatter={(val) => val.toLocaleString()} tick={{ fontSize: 11 }} width={50} />
                        <RTooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} cursor={{fill: "transparent"}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {["#3b82f6", "#10b981", "#f59e0b", "#ef4444"].map((c, i) => <Cell key={i} fill={c} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Mathematical Complexity of Chronological Age Calculation</h2>
              <p>Calculating a human being's exact chronological age might initially seem like a trivial arithmetic problem easily solved with basic subtraction. However, the modern Gregorian calendar introduces a staggering amount of mathematical complexity into this seemingly simple calculation. Because our calendar system is based on the solar orbital period of the Earth, which takes approximately three hundred and sixty-five point two four days to complete, our months are intentionally irregular. Unlike a standardized mathematical unit where every instance is identical, calendar months violently fluctuate between twenty-eight, twenty-nine, thirty, and thirty-one days depending entirely on the specific time of year and whether or not the current orbital cycle triggers a leap year. Consequently, accurately determining the exact number of years, months, and days between two specific dates requires a highly sophisticated algorithmic approach rather than simple linear subtraction.</p>

              <h2 className="text-2xl font-bold mb-3">The Gregorian Calendar Algorithm</h2>
              <p>Our Age Calculator utilizes the universally accepted Gregorian calendar algorithm to ensure absolute chronological precision. When you input your date of birth alongside a target date—which defaults to the current day—the calculator first calculates the absolute difference in years by subtracting the birth year from the target year. However, it cannot stop there. It must immediately evaluate the specific month and day of the target date relative to the birth date. If the target month occurs earlier in the year than the birth month, or if it is the exact same month but the target day occurs earlier than the birth day, the algorithm must subtract a full year from the initial calculation, because the individual has not yet reached their birthday in the current calendar cycle.</p>

              <p>Once the exact number of full years is established, the calculator determines the remaining months and days by carrying over remainders. If subtracting the days results in a negative number, the algorithm borrows a full month from the month column. Crucially, the algorithm must determine exactly how many days were in that specific borrowed month based on the actual historical calendar. Borrowing February during a leap year will yield twenty-nine days, whereas borrowing March will always yield thirty-one days. This dynamic borrowing mechanism is what makes our calculator perfectly accurate down to the individual day, regardless of how many leap years have occurred since your date of birth.</p>

              <h2 className="text-2xl font-bold mb-3">Practical Applications of Exact Chronological Age</h2>
              <p>While discovering your age in total hours or weeks is certainly an entertaining novelty, calculating your exact chronological age has profound practical and legal applications. In the medical field, pediatricians strictly rely on exact chronological age—frequently calculated in precise weeks and days rather than years—to accurately track a child's developmental milestones against clinical growth charts. Administering vaccines or prescribing pediatric medications relies entirely on absolute age precision, as a difference of a few weeks can significantly alter a child's physiological tolerance to a specific drug. Furthermore, in specialized geriatric care, precise chronological tracking assists physicians in monitoring the velocity of cognitive decline or bone density loss relative to standard aging curves.</p>

              <p>In the legal and financial sectors, exact age calculation is universally mandatory. Life insurance underwriters utilize complex actuarial tables that price premiums based on an applicant's exact age down to the day the policy is finalized. Crossing a specific age threshold can instantly increase a premium by thousands of dollars over the lifetime of the policy. Similarly, governmental retirement benefits, such as Social Security in the United States, mandate precise age calculations to determine eligibility for early or full retirement payouts. Claiming benefits even one month before reaching the legally mandated full retirement age results in a permanent, mathematically guaranteed reduction in monthly capital distribution. By utilizing our calculator to determine your precise chronological distance from these critical financial milestones, you can make highly informed, mathematically sound decisions regarding your long-term wealth management.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/age-calculator" />
          <PopularCalculators exclude="/age-calculator" />
        </div>
      </div>
    </>
  );
};

export default AgeCalculator;
