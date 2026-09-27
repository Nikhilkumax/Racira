"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

const DEFAULT_FIRST = "1988-04-12";
const DEFAULT_SECOND = "1995-09-03";
const DEFAULT_REFERENCE = "2026-06-15";

interface AgeDiffInputs {
  firstDate: string;
  secondDate: string;
  referenceDate: string;
}

interface MilestoneRow {
  year: number;
  date: string;
  youngerAge: number;
  olderAge: number;
}

interface AgeDiffResult {
  valid: boolean;
  errorMsg: string;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  olderLabel: string;
  youngerLabel: string;
  olderAgeYears: number;
  youngerAgeYears: number;
  ratio: number;
  doubleAgeDate: string;
  doubleAgeNote: string;
  ruleOfThumbAge: number;
  ruleSatisfied: boolean;
  milestones: MilestoneRow[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDate(value: string): Date | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) return null;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function pretty(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function computeAgeDiff(input: AgeDiffInputs): AgeDiffResult {
  const first = toDate(input.firstDate);
  const second = toDate(input.secondDate);
  const reference = toDate(input.referenceDate);

  const blank: AgeDiffResult = {
    valid: false,
    errorMsg: "",
    years: 0,
    months: 0,
    days: 0,
    totalDays: 0,
    totalWeeks: 0,
    totalMonths: 0,
    totalHours: 0,
    olderLabel: "",
    youngerLabel: "",
    olderAgeYears: 0,
    youngerAgeYears: 0,
    ratio: 1,
    doubleAgeDate: "",
    doubleAgeNote: "",
    ruleOfThumbAge: 0,
    ruleSatisfied: false,
    milestones: [],
  };

  if (!first) return { ...blank, errorMsg: "Enter a valid date for the first person." };
  if (!second) return { ...blank, errorMsg: "Enter a valid date for the second person." };
  if (!reference) return { ...blank, errorMsg: "Enter a valid reference date." };
  if (first.getTime() === second.getTime()) {
    return { ...blank, errorMsg: "The two birth dates are identical, so there is no age difference to measure." };
  }
  if (reference.getTime() < Math.max(first.getTime(), second.getTime())) {
    return { ...blank, errorMsg: "The reference date must come after both birth dates." };
  }

  const older = first.getTime() < second.getTime() ? first : second;
  const younger = first.getTime() < second.getTime() ? second : first;
  const olderLabel = first.getTime() < second.getTime() ? "First person" : "Second person";
  const youngerLabel = first.getTime() < second.getTime() ? "Second person" : "First person";

  let years = younger.getUTCFullYear() - older.getUTCFullYear();
  let months = younger.getUTCMonth() - older.getUTCMonth();
  let days = younger.getUTCDate() - older.getUTCDate();
  if (days < 0) {
    months -= 1;
    const dim = new Date(Date.UTC(younger.getUTCFullYear(), younger.getUTCMonth(), 0)).getUTCDate();
    days += dim;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((younger.getTime() - older.getTime()) / 86400000);
  const olderDays = Math.floor((reference.getTime() - older.getTime()) / 86400000);
  const youngerDays = Math.floor((reference.getTime() - younger.getTime()) / 86400000);
  const ratio = youngerDays > 0 ? olderDays / youngerDays : 0;
  const ruleOfThumbAge = youngerDays / 365.25 / 2 + 7;
  const ruleSatisfied = olderDays / 365.25 <= ruleOfThumbAge;

  const doubleAgeOffset = olderDays - 2 * youngerDays;
  let doubleAgeDate = "Already in the past";
  let doubleAgeNote = "The older person is now less than twice the age of the younger one.";
  if (doubleAgeOffset > 0) {
    const d = new Date(reference.getTime() + doubleAgeOffset * 86400000);
    doubleAgeDate = pretty(d);
    doubleAgeNote = `On this date the older person is exactly twice the age of the younger one, a difference that then shrinks every year.`;
  } else if (doubleAgeOffset === 0) {
    doubleAgeDate = pretty(reference);
    doubleAgeNote = "The older person is exactly twice the age of the younger one today.";
  }

  const milestones: MilestoneRow[] = [10, 16, 18, 21, 25, 30, 40, 50, 65].map((year) => {
    const date = new Date(Date.UTC(younger.getUTCFullYear() + year, younger.getUTCMonth(), younger.getUTCDate()));
    const olderExact = (date.getTime() - older.getTime()) / 86400000 / 365.25;
    return {
      year,
      date: pretty(date),
      youngerAge: year,
      olderAge: Number(olderExact.toFixed(1)),
    };
  });

  return {
    valid: true,
    errorMsg: "",
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths: years * 12 + months,
    totalHours: totalDays * 24,
    olderLabel,
    youngerLabel,
    olderAgeYears: Number((olderDays / 365.25).toFixed(2)),
    youngerAgeYears: Number((youngerDays / 365.25).toFixed(2)),
    ratio: Number(ratio.toFixed(3)),
    doubleAgeDate,
    doubleAgeNote,
    ruleOfThumbAge: Number(ruleOfThumbAge.toFixed(1)),
    ruleSatisfied,
    milestones,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "date", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function AgeDifferenceCalculator() {
  const [firstDate, setFirstDate] = useState(DEFAULT_FIRST);
  const [secondDate, setSecondDate] = useState(DEFAULT_SECOND);
  const [referenceDate, setReferenceDate] = useState(DEFAULT_REFERENCE);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AgeDiffInputs => ({ firstDate, secondDate, referenceDate });

  const [calcInputs, setCalcInputs] = useState<AgeDiffInputs>(() => ({
    firstDate: DEFAULT_FIRST,
    secondDate: DEFAULT_SECOND,
    referenceDate: DEFAULT_REFERENCE,
  }));
  const [results, setResults] = useState<AgeDiffResult>(() =>
    computeAgeDiff({ firstDate: DEFAULT_FIRST, secondDate: DEFAULT_SECOND, referenceDate: DEFAULT_REFERENCE }),
  );

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAgeDiff(inputs));
  };

  const reset = () => {
    setFirstDate(DEFAULT_FIRST);
    setSecondDate(DEFAULT_SECOND);
    setReferenceDate(DEFAULT_REFERENCE);
    setCalcInputs({ firstDate: DEFAULT_FIRST, secondDate: DEFAULT_SECOND, referenceDate: DEFAULT_REFERENCE });
    setResults(
      computeAgeDiff({ firstDate: DEFAULT_FIRST, secondDate: DEFAULT_SECOND, referenceDate: DEFAULT_REFERENCE }),
    );
  };

  const faqs = [
    {
      question: "How do you calculate the age difference between two people?",
      answer:
        "Subtract the earlier birth date from the later one and express the result in years, months and days. The calculator borrows from the month when the day count goes negative and from the year when the month count does, so the answer matches the way people actually count ages rather than a simple division of elapsed days.",
    },
    {
      question: "Does the age gap change over time?",
      answer:
        "The gap in years never changes, but its significance does. A five-year difference between a ten-year-old and a fifteen-year-old is half a childhood, while the same five years between forty and forty-five is a small fraction of adult life. The ratio of the two ages therefore falls every year even though the absolute difference stays fixed.",
    },
    {
      question: "What is the half-your-age-plus-seven rule?",
      answer:
        "It is a widely quoted social guideline suggesting the youngest acceptable partner age is half your own age plus seven. It is not science, and many people ignore it, but it is a useful way to see how age gaps are perceived. The calculator reports the guideline age and whether the older person's age falls inside it.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Age Difference Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Age Difference Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Dates of Birth">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="first-date"
                  label="First Person"
                  value={firstDate}
                  onChange={setFirstDate}
                  onEnter={runCalculate}
                  tooltip="Date of birth of the first person."
                />
                <CompactInput
                  id="second-date"
                  label="Second Person"
                  value={secondDate}
                  onChange={setSecondDate}
                  onEnter={runCalculate}
                  tooltip="Date of birth of the second person."
                />
              </div>
            </SubSection>

            <SubSection title="Measure At">
              <CompactInput
                id="reference-date"
                label="Reference Date"
                value={referenceDate}
                onChange={setReferenceDate}
                onEnter={runCalculate}
                hint="Change this to compare ages on a future or past date."
                tooltip="The date the ages and ratio are measured on."
              />
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="How The Gap Is Read">
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      The absolute difference in years never changes, but the ratio between the two ages falls every year. The
                      calculator reports both, along with the date on which the older person was exactly twice as old as the
                      younger one, which is the point where an age gap feels largest.
                    </p>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Age Difference</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${results.years}y ${results.months}m ${results.days}d` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.olderLabel} is older · ${results.totalDays.toLocaleString()} days apart`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Older Age</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.olderAgeYears, 2)} yrs` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Younger Age</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.youngerAgeYears, 2)} yrs` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Age Ratio</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.ratio, 3)} : 1` : "—"}
                </span>
              </div>
            </div>

            {results.valid && (
              <div className="bg-secondary/20 border border-border rounded-lg p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">
                  Twice-The-Age Point
                </div>
                <p className="text-sm text-foreground">{`${results.doubleAgeDate} — ${results.doubleAgeNote}`}</p>
              </div>
            )}

            {/* GAP TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measurement</th>
                    <th className="p-2.5 pr-3 text-right w-[200px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Gap in years, months and days</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {`${results.years} years, ${results.months} months, ${results.days} days`}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total days apart</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.totalDays.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total weeks apart</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.totalWeeks.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total calendar months apart</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.totalMonths.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total hours apart</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.totalHours.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Half-your-age-plus-seven guideline</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.ruleSatisfied ? `Inside it (${fmt(results.ruleOfThumbAge, 1)} years)` : `Outside it (${fmt(results.ruleOfThumbAge, 1)} years)`}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Age ratio today</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{`${fmt(results.ratio, 3)} : 1`}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* MILESTONE TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">When The Younger Turns</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">The Older Is</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.milestones.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.youngerAge}</td>
                      <td className="p-2.5 text-foreground">{row.date}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.olderAge, 1)} years`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Older Person</span>
                  <span className="text-base font-bold text-foreground">{results.olderLabel || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Younger Person</span>
                  <span className="text-base font-bold text-foreground">{results.youngerLabel || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gap in Years</span>
                  <span className="text-base font-bold text-foreground">{results.years}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gap in Months</span>
                  <span className="text-base font-bold text-foreground">{results.totalMonths}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Measured On</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.referenceDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Guideline Age</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.ruleOfThumbAge, 1)} yrs`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Age Difference Calculator?</h2>
            <p>
              An age difference calculator measures the gap between two birth dates in years, months, days, weeks and hours, and
              shows how that gap looks at the ages the two people have now. It reports who is older, the ratio between the ages, the
              date on which the older was exactly twice the younger, and how the gap reads against the familiar
              half-your-age-plus-seven guideline.
            </p>
            <p>
              The arithmetic behind an age gap is simple, but its meaning is not. Five years is enormous between a ten and a
              fifteen year old and barely noticeable between a forty-five and a fifty year old, even though the difference in days is
              identical in both cases. The ratio between the two ages is what changes, and it falls steadily as both people grow
              older.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator subtracts the earlier birth date from the later one and converts the result into calendar years, months
              and days, borrowing from the month and year wherever a component would otherwise go negative. That is the same method
              used for calculating a single person's age, applied to the space between two birthdays rather than one.
            </p>
            <p>
              The ratio comes from dividing the two ages measured on the reference date, which reveals how quickly the gap is
              shrinking in relative terms. The twice-the-age point is found by solving for the moment when the older age equals twice
              the younger age; once that date has passed, the ratio falls every single year and never returns.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the gap in years, months and days, with both current ages and the age ratio in the three-stat
              bar. The first table lists the gap in every unit together with the guideline check, and the second shows the date of
              each significant birthday for the younger person alongside the age the older person will be on that day.
            </p>
            <p>
              Move the reference date forward to watch the ratio fall. Setting it to a future anniversary shows exactly how the same
              gap will feel in ten or twenty years, which is the most useful part of the calculation for anyone thinking about
              long-term age differences rather than today's snapshot. Because the ratio shrinks as both people age, a gap that looks
              large today will keep looking smaller every year you move the date forward, and the month-by-month breakdown makes that
              gradual change easy to see.
            </p>
            <p>
              Treat the half-your-age-plus-seven guideline as a cultural reference point rather than a rule. It has no scientific
              basis and is applied inconsistently, but it does capture something real: an age gap matters less as both people get
              older, and the calculator's ratio and twice-the-age date both express that same idea in numbers.
            </p>
            <p>
              Finally, remember that the days and hours figures assume the birth dates are exact. Where one or both dates are
              uncertain, the calendar breakdown can shift by a day or two even though the year and month figures stay the same, so
              treat the small units as indicative rather than definitive for anything formal.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/age-difference-calculator" />
          <PopularCalculators exclude="/calculator/age-difference-calculator" />
        </div>
      </div>
    </>
  );
}
