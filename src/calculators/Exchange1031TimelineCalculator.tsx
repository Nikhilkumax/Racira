"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw, CalendarClock } from "lucide-react";

interface TimelineResults {
  closingDateStr: string;
  day45DateStr: string;
  day45DayOfWeek: string;
  day180DateStr: string;
  day180DayOfWeek: string;
  daysRemaining45: number;
  daysRemaining180: number;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  type = "date",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
    </div>
  </div>
);

const calculateTimeline = (closingDateStr: string): TimelineResults | null => {
  if (!closingDateStr) return null;

  // Make sure we parse the date correctly ignoring timezones if possible, or just treat it as midnight local
  const [year, month, day] = closingDateStr.split("-").map(Number);
  const closingDate = new Date(year, month - 1, day);
  
  if (isNaN(closingDate.getTime())) return null;

  const day45Date = new Date(closingDate);
  day45Date.setDate(day45Date.getDate() + 45);

  const day180Date = new Date(closingDate);
  day180Date.setDate(day180Date.getDate() + 180);

  const formatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysRemaining45 = Math.max(0, Math.ceil((day45Date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining180 = Math.max(0, Math.ceil((day180Date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    closingDateStr: closingDate.toLocaleDateString("en-US", formatOptions),
    day45DateStr: day45Date.toLocaleDateString("en-US", formatOptions),
    day45DayOfWeek: day45Date.toLocaleDateString("en-US", { weekday: 'long' }),
    day180DateStr: day180Date.toLocaleDateString("en-US", formatOptions),
    day180DayOfWeek: day180Date.toLocaleDateString("en-US", { weekday: 'long' }),
    daysRemaining45,
    daysRemaining180
  };
};

export default function Exchange1031TimelineCalculator() {
  const [closingDate, setClosingDate] = useState("");
  
  const [results, setResults] = useState<TimelineResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set default date to today
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setClosingDate(todayStr);
    setResults(calculateTimeline(todayStr));
  }, []);

  const handleCalculate = () => {
    setResults(calculateTimeline(closingDate));
  };

  const handleReset = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setClosingDate(todayStr);
    setResults(calculateTimeline(todayStr));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>1031 Exchange Timeline</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "1031 Exchange Timeline Calculator" }]} />
      <div className="racira-page-container py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">1031 Exchange Timeline Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-2">
              <h3 className="font-semibold text-primary mb-1 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" /> IRS Strict Deadlines
              </h3>
              <p className="text-sm text-foreground/80 mb-0">
                The 45-day and 180-day deadlines are absolute. The IRS does not grant extensions for weekends or holidays.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="closing-date"
                label="Date of Closing on Relinquished Property (Day 0)"
                value={closingDate}
                onChange={setClosingDate}
                type="date"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="flex justify-end hidden-print">
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-4 w-4" /> Print Timeline
                  </button>
                </div>

                {/* Closing Date Header */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <div className="text-sm uppercase tracking-wide text-muted-foreground mb-1">Relinquished Property Closing Date (Day 0)</div>
                  <div className="text-xl font-bold text-foreground">
                    {results.closingDateStr}
                  </div>
                </div>

                {/* 45 Day Deadline */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm uppercase font-bold tracking-wide text-primary">Day 45: Identification Deadline</div>
                    {results.daysRemaining45 > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md hidden-print">
                        {results.daysRemaining45} Days Left
                      </span>
                    )}
                    {results.daysRemaining45 === 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md hidden-print">
                        Deadline Passed
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-extrabold text-foreground mb-1">
                    {results.day45DateStr}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Midnight on {results.day45DayOfWeek}
                  </div>
                </div>

                {/* 180 Day Deadline */}
                <div className="bg-accent/20 border-l-4 border-accent rounded-lg p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm uppercase font-bold tracking-wide text-accent-foreground">Day 180: Purchase Deadline</div>
                    {results.daysRemaining180 > 0 && (
                      <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-md hidden-print">
                        {results.daysRemaining180} Days Left
                      </span>
                    )}
                    {results.daysRemaining180 === 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md hidden-print">
                        Deadline Passed
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-extrabold text-foreground mb-1">
                    {results.day180DateStr}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Midnight on {results.day180DayOfWeek}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    *Or the due date of your income tax return for the year in which the relinquished property was sold, whichever is earlier.
                  </div>
                </div>

                {/* Timeline Visualization */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm mt-2 hidden-print">
                  <h3 className="text-base font-semibold mb-6">Timeline Overview</h3>
                  <div className="relative pt-6 pb-2">
                    {/* The line */}
                    <div className="absolute top-[42px] left-4 right-4 h-1 bg-border rounded"></div>
                    
                    {/* The milestones */}
                    <div className="flex justify-between relative">
                      {/* Day 0 */}
                      <div className="flex flex-col items-center w-24 -ml-12">
                        <div className="w-5 h-5 rounded-full bg-muted-foreground border-4 border-card z-10 flex items-center justify-center relative shadow-sm"></div>
                        <div className="mt-2 text-xs font-bold text-center">Day 0</div>
                        <div className="text-[10px] text-muted-foreground text-center">Closing</div>
                      </div>
                      
                      {/* Day 45 */}
                      <div className="flex flex-col items-center w-24">
                        <div className="w-5 h-5 rounded-full bg-primary border-4 border-card z-10 flex items-center justify-center relative shadow-sm"></div>
                        <div className="mt-2 text-xs font-bold text-center text-primary">Day 45</div>
                        <div className="text-[10px] text-muted-foreground text-center">Identification</div>
                      </div>
                      
                      {/* Day 180 */}
                      <div className="flex flex-col items-center w-24 -mr-12">
                        <div className="w-5 h-5 rounded-full bg-accent-foreground border-4 border-card z-10 flex items-center justify-center relative shadow-sm"></div>
                        <div className="mt-2 text-xs font-bold text-center text-accent-foreground">Day 180</div>
                        <div className="text-[10px] text-muted-foreground text-center">Purchase</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[800px] mt-16 prose prose-slate dark:prose-invert">
          <h2 className="text-2xl font-bold mb-3">What is a 1031 Exchange?</h2>
          <p>
            A 1031 exchange, named after Section 1031 of the U.S. Internal Revenue Code, is a powerful wealth-building strategy that allows real estate investors to defer paying capital gains taxes on the sale of an investment property. By taking the proceeds from the sale and reinvesting them into a new "like-kind" property, the investor defers the tax liability, allowing their wealth to grow tax-free over time.
          </p>
          <p>
            However, the IRS strictly regulates this process, particularly when it comes to the timeline. Missing these deadlines by even one minute can disqualify the entire exchange, resulting in a massive, immediate tax bill.
          </p>

          <h2 className="text-2xl font-bold mb-3">The 45-Day Identification Period</h2>
          <p>
            The clock starts ticking on <strong>Day 0</strong>—the exact date you close on the sale of your relinquished property (the property you are selling).
          </p>
          <p>
            By midnight on the <strong>45th day</strong>, you must formally identify the potential replacement properties you intend to buy. This identification must be made in writing, signed by you, and delivered to a person involved in the exchange, such as your Qualified Intermediary (QI).
          </p>
          <h3>Identification Rules</h3>
          <ul>
            <li><strong>The 3-Property Rule:</strong> You can identify up to three properties of any value, and you can purchase one, two, or all three of them.</li>
            <li><strong>The 200% Rule:</strong> You can identify more than three properties as long as the combined fair market value of all identified properties does not exceed 200% of the value of the relinquished property.</li>
            <li><strong>The 95% Exception:</strong> If you identify more than three properties AND their total value exceeds 200%, the exchange is still valid if you actually acquire 95% of the total value of all identified properties.</li>
          </ul>

          <h2 className="text-2xl font-bold mb-3">The 180-Day Exchange Period</h2>
          <p>
            The second deadline is the 180-Day Exchange Period. You must close on the purchase of one or more of your formally identified replacement properties by midnight on the <strong>180th day</strong> after the sale of the relinquished property.
          </p>
          <p>
            <em>Important Note:</em> The 180-day deadline is technically 180 days <strong>OR</strong> the due date of your income tax return (including extensions) for the tax year in which the relinquished property was sold, <strong>whichever comes first</strong>. If your closing happens late in the year (e.g., November), your tax return due date in April might arrive before day 180. In this case, you must file for a tax extension to get the full 180 days.
          </p>

          <h2 className="text-2xl font-bold mb-3">Why Are Weekends and Holidays Not Exempt?</h2>
          <p>
            One of the most common, and costly, mistakes investors make is assuming that if day 45 or day 180 falls on a Saturday, Sunday, or federal holiday, the deadline rolls over to the next business day. <strong>It does not.</strong>
          </p>
          <p>
            The IRS rules for 1031 exchanges are absolute calendar days. If your 45th day falls on Thanksgiving or Christmas Day, your identification must still be delivered by midnight on that exact day. It is highly recommended to finalize your identification and purchases well in advance of the deadline to account for bank holidays, title company delays, or postal issues.
          </p>

          <h2 className="text-2xl font-bold mb-3">The Role of a Qualified Intermediary (QI)</h2>
          <p>
            To execute a valid 1031 exchange, you cannot ever touch the money from the sale. You must use an independent third party known as a Qualified Intermediary or Exchange Accommodator. The QI holds the funds in escrow from the sale of the relinquished property and wires them directly to the title company for the purchase of the replacement property.
          </p>

          <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
          <p>
            Calculating 45 and 180 days manually on a calendar is prone to human error, especially when crossing into different months. This 1031 Exchange Timeline Calculator removes the risk of miscounting days. By inputting your exact closing date, it provides the precise deadlines required by the IRS, allowing you to confidently plan your real estate transactions and ensure your tax-deferred status remains protected.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "What happens if Day 45 or Day 180 falls on a weekend or holiday?", answer: "The deadline does not change. The IRS does not grant extensions for weekends or holidays. If your deadline falls on a Sunday, you must still have your identification delivered by midnight on that Sunday." },
          { question: "When exactly does 'Day 1' start?", answer: "Day 1 is the day immediately following the closing date of the sale of your relinquished property. The closing date itself is considered 'Day 0'." },
          { question: "Can I get an extension on the 45-day or 180-day deadline?", answer: "Generally, no. The only exceptions ever granted by the IRS are during Presidentially declared natural disasters that severely impact the region where the properties or the taxpayer are located." },
          { question: "What if I file my taxes before the 180 days are up?", answer: "If you file your tax return before acquiring your replacement property, your exchange period ends on the day you file. If your 180th day extends past April 15th, you MUST file a tax extension (Form 4868) to receive the full 180 days." },
          { question: "Can I change my identified properties on Day 46?", answer: "No. Once midnight of the 45th day passes, your list is locked. You can only purchase properties from the list you submitted. If none of the properties on your list work out, your exchange will fail and taxes will be due." },
          { question: "Do I have 45 days PLUS 180 days?", answer: "No. The two timelines run concurrently. You have a total of 180 days to close, and the first 45 of those days are designated for identifying the property." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
