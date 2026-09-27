"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

const DEFAULT_BIRTH = "1990-06-15";
const DEFAULT_ASOF = "2026-06-15";

interface AgeInputs {
  birthDate: string;
  asOfDate: string;
  lifeExpectancy: number;
}

interface AgeBreakdownRow {
  label: string;
  value: string;
}

interface MilestoneRow {
  label: string;
  date: string;
  status: string;
  reached: boolean;
}

interface AgeResult {
  valid: boolean;
  errorMsg: string;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  weekdayBorn: string;
  nextBirthdayWeekday: string;
  daysUntilBirthday: number;
  nextBirthdayAge: number;
  zodiac: string;
  generations: string;
  breakdown: AgeBreakdownRow[];
  milestones: MilestoneRow[];
  lifeElapsedPct: number;
  remainingYears: number;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmtInt = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString() : "—");

function toDate(value: string): Date | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) return null;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function prettyDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} (${WEEKDAYS[d.getUTCDay()].slice(0, 3)})`;
}

function zodiacOf(month: number, day: number): string {
  const keys: [number, number, string][] = [
    [1, 20, "Capricorn"],
    [2, 19, "Aquarius"],
    [3, 21, "Pisces"],
    [4, 20, "Aries"],
    [5, 21, "Taurus"],
    [6, 21, "Gemini"],
    [7, 23, "Cancer"],
    [8, 23, "Leo"],
    [9, 23, "Virgo"],
    [10, 23, "Libra"],
    [11, 22, "Scorpio"],
    [12, 22, "Sagittarius"],
  ];
  for (const [m, d, sign] of keys) {
    if (month === m && day < d) return sign;
  }
  const idx = (month - 1 + 12) % 12;
  const names = [
    "Capricorn",
    "Aquarius",
    "Pisces",
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
  ];
  return names[idx];
}

function generationOf(year: number): string {
  if (year <= 1945) return "Silent Generation";
  if (year <= 1964) return "Baby Boomer";
  if (year <= 1980) return "Generation X";
  if (year <= 1996) return "Millennial";
  if (year <= 2012) return "Generation Z";
  return "Generation Alpha";
}

function computeAge(input: AgeInputs): AgeResult {
  const { lifeExpectancy } = input;
  const birth = toDate(input.birthDate);
  const asOf = toDate(input.asOfDate);

  const blank: AgeResult = {
    valid: false,
    errorMsg: "",
    years: 0,
    months: 0,
    days: 0,
    totalDays: 0,
    totalWeeks: 0,
    totalMonths: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalSeconds: 0,
    weekdayBorn: "",
    nextBirthdayWeekday: "",
    daysUntilBirthday: 0,
    nextBirthdayAge: 0,
    zodiac: "",
    generations: "",
    breakdown: [],
    milestones: [],
    lifeElapsedPct: 0,
    remainingYears: 0,
  };

  if (!birth) return { ...blank, errorMsg: "Enter a valid date of birth in the first field." };
  if (!asOf) return { ...blank, errorMsg: "Enter a valid reference date in the second field." };
  if (birth.getTime() > asOf.getTime()) {
    return { ...blank, errorMsg: "The date of birth must come before the reference date." };
  }

  let years = asOf.getUTCFullYear() - birth.getUTCFullYear();
  let months = asOf.getUTCMonth() - birth.getUTCMonth();
  let days = asOf.getUTCDate() - birth.getUTCDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 0)).getUTCDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = asOf.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  let nextBirthday = new Date(Date.UTC(asOf.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()));
  if (nextBirthday.getTime() < asOf.getTime()) {
    nextBirthday = new Date(Date.UTC(asOf.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate()));
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - asOf.getTime()) / 86400000);
  const nextBirthdayAge = nextBirthday.getUTCFullYear() - birth.getUTCFullYear();

  const breakdown: AgeBreakdownRow[] = [
    { label: "Calendar age", value: `${years} years, ${months} months, ${days} days` },
    { label: "Total months", value: fmtInt(totalMonths) },
    { label: "Total weeks", value: fmtInt(totalWeeks) },
    { label: "Total days", value: fmtInt(totalDays) },
    { label: "Total hours", value: fmtInt(totalHours) },
    { label: "Total minutes", value: fmtInt(totalMinutes) },
    { label: "Total seconds", value: fmtInt(totalSeconds) },
    { label: "Day of the week born", value: WEEKDAYS[birth.getUTCDay()] },
  ];

  const milestoneSpecs: { label: string; days: number }[] = [
    { label: "10,000 days alive", days: 10000 },
    { label: "1 billion seconds alive", days: Math.round(1000000000 / 86400) },
    { label: "Next decade birthday", days: 0 },
    { label: "Average life expectancy", days: Math.round(Math.max(1, lifeExpectancy) * 365.25) },
  ];

  const milestones: MilestoneRow[] = milestoneSpecs.map((spec) => {
    let targetDate: Date;
    if (spec.days === 0) {
      const decade = Math.floor(years / 10 + 1) * 10;
      targetDate = new Date(Date.UTC(birth.getUTCFullYear() + decade, birth.getUTCMonth(), birth.getUTCDate()));
    } else {
      targetDate = new Date(birth.getTime() + spec.days * 86400000);
    }
    const reached = targetDate.getTime() <= asOf.getTime();
    const daysAway = Math.round((targetDate.getTime() - asOf.getTime()) / 86400000);
    return {
      label: spec.label,
      date: prettyDate(targetDate),
      status: reached ? "Reached" : `${fmtInt(Math.abs(daysAway))} days away`,
      reached,
    };
  });

  const lifeElapsedPct = lifeExpectancy > 0 ? Math.min(100, (years / lifeExpectancy) * 100) : 0;
  const remainingYears = Math.max(0, lifeExpectancy - years);

  return {
    valid: true,
    errorMsg: "",
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    totalSeconds,
    weekdayBorn: WEEKDAYS[birth.getUTCDay()],
    nextBirthdayWeekday: WEEKDAYS[nextBirthday.getUTCDay()],
    daysUntilBirthday,
    nextBirthdayAge,
    zodiac: zodiacOf(birth.getUTCMonth() + 1, birth.getUTCDate()),
    generations: generationOf(birth.getUTCFullYear()),
    breakdown,
    milestones,
    lifeElapsedPct: Number(lifeElapsedPct.toFixed(2)),
    remainingYears: Number(remainingYears.toFixed(1)),
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

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH);
  const [asOfDate, setAsOfDate] = useState(DEFAULT_ASOF);
  const [lifeExpectancy, setLifeExpectancy] = useState("80");
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AgeInputs => ({
    birthDate,
    asOfDate,
    lifeExpectancy: parseFloat(lifeExpectancy) || 80,
  });

  const [calcInputs, setCalcInputs] = useState<AgeInputs>(() => ({
    birthDate: DEFAULT_BIRTH,
    asOfDate: DEFAULT_ASOF,
    lifeExpectancy: 80,
  }));
  const [results, setResults] = useState<AgeResult>(() =>
    computeAge({ birthDate: DEFAULT_BIRTH, asOfDate: DEFAULT_ASOF, lifeExpectancy: 80 }),
  );

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAge(inputs));
  };

  const reset = () => {
    setBirthDate(DEFAULT_BIRTH);
    setAsOfDate(DEFAULT_ASOF);
    setLifeExpectancy("80");
    setCalcInputs({ birthDate: DEFAULT_BIRTH, asOfDate: DEFAULT_ASOF, lifeExpectancy: 80 });
    setResults(computeAge({ birthDate: DEFAULT_BIRTH, asOfDate: DEFAULT_ASOF, lifeExpectancy: 80 }));
  };

  const faqs = [
    {
      question: "How is age calculated exactly?",
      answer:
        "Age is counted in complete years, months and days: subtract the birth date from the reference date, borrow from the month when the day count goes negative, and borrow from the year when the month count does. Chronological age therefore increases on a birthday rather than at the start of a calendar year, which is why two people born months apart can still be the same age for part of the year.",
    },
    {
      question: "Why does my age in months differ from my age in years times twelve?",
      answer:
        "Multiplying whole years by twelve ignores the leftover months, so it always understates the total. The calculator adds the partial months to the completed years to give total months, which is the figure used for infant growth charts, eligibility rules and any benefit or deadline measured in months rather than years.",
    },
    {
      question: "How do leap years affect the calculation?",
      answer:
        "Total days counts every day actually elapsed, so leap days are included automatically. Calendar age on a February 29 birthday is usually treated by counting the anniversary on March 1 in non-leap years, and the same convention applies to legal deadlines. The difference only ever amounts to a single day.",
    },
    {
      question: "What are milestone ages in days and seconds?",
      answer:
        "Ten thousand days lands at about twenty-seven years and four months, and a billion seconds lands at roughly thirty-one years and eight months. They are fun markers rather than legal ones, but they also illustrate how large numbers grow quickly with age: by forty you have lived more than three hundred and fifty thousand hours.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Age Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Age Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Dates">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="birth-date"
                  label="Date of Birth"
                  value={birthDate}
                  onChange={setBirthDate}
                  onEnter={runCalculate}
                  tooltip="The date the person was born."
                />
                <CompactInput
                  id="as-of-date"
                  label="Age At Date"
                  value={asOfDate}
                  onChange={setAsOfDate}
                  onEnter={runCalculate}
                  tooltip="The date to measure age on. Change it to any date you need."
                />
              </div>
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
                  <SubSection title="Reference Point">
                    <CompactInput
                      id="life-expectancy"
                      label="Life Expectancy"
                      value={lifeExpectancy}
                      onChange={setLifeExpectancy}
                      onEnter={runCalculate}
                      type="number"
                      min="1"
                      suffix="yrs"
                      hint="Used for the life-elapsed percentage and remaining years."
                      tooltip="A planning figure, not a prediction."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Age</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${results.years}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.years} years, ${results.months} months and ${results.days} days old`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Days</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmtInt(results.totalDays) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Next Birthday</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${results.daysUntilBirthday} days` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Turns</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.nextBirthdayAge : "—"}</span>
              </div>
            </div>

            {/* AGE BREAKDOWN */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measurement</th>
                    <th className="p-2.5 pr-3 text-right w-[230px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Next birthday falls on</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{results.nextBirthdayWeekday || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* MILESTONES */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Milestone</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.milestones.map((row) => (
                    <tr key={row.label} className={row.reached ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-foreground">{row.date}</td>
                      <td className={row.reached ? "p-2.5 pr-3 text-right text-emerald-600 font-semibold" : "p-2.5 pr-3 text-right text-foreground"}>
                        {row.status}
                      </td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Born On A</span>
                  <span className="text-base font-bold text-foreground">{results.weekdayBorn || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Star Sign</span>
                  <span className="text-base font-bold text-foreground">{results.zodiac || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Generation</span>
                  <span className="text-base font-bold text-foreground">{results.generations || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Weeks</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmtInt(results.totalWeeks) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Heartbeats (approx.)</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmtInt((results.totalMinutes * 72) / 1000) + "k" : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Life Elapsed</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${results.lifeElapsedPct}% of ${calcInputs.lifeExpectancy} years` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Age Calculator?</h2>
            <p>
              An age calculator converts a date of birth into a precise age on any chosen reference date. It reports the
              standard years, months and days figure, but also the totals most forms and eligibility rules actually ask for:
              months, weeks, days, hours, minutes and even seconds of life so far, plus the day of the week the person was
              born and how far away the next birthday is.
            </p>
            <p>
              It is useful far beyond curiosity. Schools check admission cut-offs in months, pension and visa rules are
              written in exact ages, paediatric growth charts use months rather than years for young children, and insurers
              price by completed years. Having the full set of totals in one place removes the guesswork from those forms.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator subtracts the birth date from the reference date in the calendar parts. If the day of the month
              has gone backwards, it borrows the length of the previous month; if the month count is negative, it borrows a
              year. That borrowing is what makes the answer match how people actually count age, rather than a simple division
              of the elapsed days.
            </p>
            <p>
              Alongside the calendar figure, the tool divides the elapsed milliseconds into every convenient unit. Because
              the actual number of days between two dates is used, leap years are handled automatically and the totals stay
              accurate over long spans. The next birthday is found by moving the birth month and day into the current year and
              rolling forward one more year when that date has already passed.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows completed years, and the three-stat bar adds total days lived, the countdown to the next
              birthday and the age that birthday will bring. The first table lists every unit total together with the weekday
              of birth, and the second tracks milestones such as ten thousand days, one billion seconds and the next decade
              birthday, marking each as reached or upcoming.
            </p>
            <p>
              Pay attention to which figure a form wants. Legal age is measured in completed years, so a person is eighteen
              only from the anniversary, not from the start of the year they turn eighteen. Immigration, insurance and school
              rules often measure in months, where the totals differ noticeably from years multiplied by twelve because of
              the leftover months.
            </p>
            <p>
              The reference date field makes the calculator useful for planning as well as recording. Setting it to a future
              date shows how old someone will be on a wedding day, a competition cut-off or a visa deadline, and setting it to
              a past date reconstructs ages at historical events. Remember that a February 29 birthday is commonly treated as
              March 1 in non-leap years for official purposes.
            </p>
            <p>
              Finally, treat the life expectancy figure in the advanced panel as a planning tool rather than a prediction. It
              drives only the elapsed percentage and remaining years, and it can be changed to any horizon you prefer. Many
              people find the percentage figure a more motivating way to think about long-term savings and health goals than
              the raw number of birthday candles.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/age-calculator" />
          <PopularCalculators exclude="/calculator/age-calculator" />
        </div>
      </div>
    </>
  );
}
