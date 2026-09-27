"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

const DEFAULT_LMP = "2026-01-05";
const DEFAULT_TODAY = "2026-06-15";

interface PregnancyInputs {
  lmp: string;
  today: string;
  cycleLength: number;
}

interface MilestoneRow {
  label: string;
  date: string;
  status: string;
  reached: boolean;
}

interface PregnancyResult {
  valid: boolean;
  errorMsg: string;
  dueDate: string;
  dueDateWeekday: string;
  weeksPregnant: number;
  daysIntoWeek: number;
  daysRemaining: number;
  totalDays: number;
  trimester: string;
  progressPct: number;
  conceptionDate: string;
  viabilityDate: string;
  secondTrimesterDate: string;
  thirdTrimesterDate: string;
  fullTermStart: string;
  milestones: MilestoneRow[];
  currentWeekNote: string;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

const WEEK_NOTES: string[] = [
  "Weeks 1–4: the embryo implants and the neural tube begins to form.",
  "Weeks 5–8: the heart starts beating and major organs take shape.",
  "Weeks 9–12: fingers and toes separate and the risk of miscarriage falls sharply.",
  "Weeks 13–16: the second trimester begins and many people feel more comfortable.",
  "Weeks 17–20: first movements are often felt and the anatomy scan is usually scheduled.",
  "Weeks 21–24: hearing develops and a regular sleep pattern starts to appear.",
  "Weeks 25–28: the third trimester approaches and glucose screening usually happens.",
  "Weeks 29–32: rapid weight gain and stronger, more predictable movements.",
  "Weeks 33–36: lungs mature and the baby usually settles head down.",
  "Weeks 37–40: full term, with weekly checks until delivery.",
];

function noteForWeek(week: number): string {
  if (week <= 4) return WEEK_NOTES[0];
  if (week <= 8) return WEEK_NOTES[1];
  if (week <= 12) return WEEK_NOTES[2];
  if (week <= 16) return WEEK_NOTES[3];
  if (week <= 20) return WEEK_NOTES[4];
  if (week <= 24) return WEEK_NOTES[5];
  if (week <= 28) return WEEK_NOTES[6];
  if (week <= 32) return WEEK_NOTES[7];
  if (week <= 36) return WEEK_NOTES[8];
  return WEEK_NOTES[9];
}

function computePregnancy(input: PregnancyInputs): PregnancyResult {
  const { cycleLength } = input;
  const lmp = toDate(input.lmp);
  const today = toDate(input.today);

  const blank: PregnancyResult = {
    valid: false,
    errorMsg: "",
    dueDate: "",
    dueDateWeekday: "",
    weeksPregnant: 0,
    daysIntoWeek: 0,
    daysRemaining: 0,
    totalDays: 0,
    trimester: "",
    progressPct: 0,
    conceptionDate: "",
    viabilityDate: "",
    secondTrimesterDate: "",
    thirdTrimesterDate: "",
    fullTermStart: "",
    milestones: [],
    currentWeekNote: "",
  };

  if (!lmp) return { ...blank, errorMsg: "Enter the first day of your last menstrual period." };
  if (!today) return { ...blank, errorMsg: "Enter the date you want to measure from." };
  if (today.getTime() < lmp.getTime()) {
    return { ...blank, errorMsg: "The reference date must be after the first day of the last period." };
  }

  const cycle = Number.isFinite(cycleLength) && cycleLength >= 20 && cycleLength <= 45 ? cycleLength : 28;
  const cycleAdjustment = cycle - 28;

  const dueDate = new Date(lmp.getTime() + (280 + cycleAdjustment) * 86400000);
  const conceptionDate = new Date(lmp.getTime() + (14 + cycleAdjustment) * 86400000);
  const viabilityDate = new Date(lmp.getTime() + (24 * 7 + cycleAdjustment) * 86400000);
  const secondTrimesterDate = new Date(lmp.getTime() + (14 * 7 + cycleAdjustment) * 86400000);
  const thirdTrimesterDate = new Date(lmp.getTime() + (28 * 7 + cycleAdjustment) * 86400000);
  const fullTermStart = new Date(lmp.getTime() + (37 * 7 + cycleAdjustment) * 86400000);

  const totalDays = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
  const weeksPregnant = Math.floor(totalDays / 7);
  const daysIntoWeek = totalDays % 7;
  const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / 86400000));
  const progressPct = Math.min(100, (totalDays / (280 + cycleAdjustment)) * 100);

  const trimester =
    totalDays < 14 * 7 ? "First trimester" : totalDays < 28 * 7 ? "Second trimester" : "Third trimester";

  const milestoneSpecs: { label: string; date: Date }[] = [
    { label: "Estimated conception", date: conceptionDate },
    { label: "Second trimester begins", date: secondTrimesterDate },
    { label: "Anatomy scan window (18–22 weeks)", date: new Date(lmp.getTime() + (20 * 7 + cycleAdjustment) * 86400000) },
    { label: "Viability milestone (24 weeks)", date: viabilityDate },
    { label: "Third trimester begins", date: thirdTrimesterDate },
    { label: "Full term begins (37 weeks)", date: fullTermStart },
    { label: "Estimated due date", date: dueDate },
  ];

  const milestones: MilestoneRow[] = milestoneSpecs.map((spec) => {
    const reached = spec.date.getTime() <= today.getTime();
    const daysAway = Math.round((spec.date.getTime() - today.getTime()) / 86400000);
    return {
      label: spec.label,
      date: pretty(spec.date),
      status: reached ? "Passed" : `${Math.abs(daysAway)} days ahead`,
      reached,
    };
  });

  return {
    valid: true,
    errorMsg: "",
    dueDate: pretty(dueDate),
    dueDateWeekday: WEEKDAYS[dueDate.getUTCDay()],
    weeksPregnant,
    daysIntoWeek,
    daysRemaining,
    totalDays,
    trimester,
    progressPct: Number(progressPct.toFixed(1)),
    conceptionDate: pretty(conceptionDate),
    viabilityDate: pretty(viabilityDate),
    secondTrimesterDate: pretty(secondTrimesterDate),
    thirdTrimesterDate: pretty(thirdTrimesterDate),
    fullTermStart: pretty(fullTermStart),
    milestones,
    currentWeekNote: noteForWeek(weeksPregnant),
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

export default function PregnancyCalculator() {
  const [lmp, setLmp] = useState(DEFAULT_LMP);
  const [today, setToday] = useState(DEFAULT_TODAY);
  const [cycleLength, setCycleLength] = useState("28");
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PregnancyInputs => ({
    lmp,
    today,
    cycleLength: parseFloat(cycleLength) || 28,
  });

  const [calcInputs, setCalcInputs] = useState<PregnancyInputs>(() => ({
    lmp: DEFAULT_LMP,
    today: DEFAULT_TODAY,
    cycleLength: 28,
  }));
  const [results, setResults] = useState<PregnancyResult>(() =>
    computePregnancy({ lmp: DEFAULT_LMP, today: DEFAULT_TODAY, cycleLength: 28 }),
  );

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePregnancy(inputs));
  };

  const reset = () => {
    setLmp(DEFAULT_LMP);
    setToday(DEFAULT_TODAY);
    setCycleLength("28");
    setCalcInputs({ lmp: DEFAULT_LMP, today: DEFAULT_TODAY, cycleLength: 28 });
    setResults(computePregnancy({ lmp: DEFAULT_LMP, today: DEFAULT_TODAY, cycleLength: 28 }));
  };

  const faqs = [
    {
      question: "How is the due date calculated?",
      answer:
        "The standard method adds two hundred and eighty days, or forty weeks, to the first day of your last menstrual period. That assumes a twenty-eight day cycle with ovulation around day fourteen. Longer cycles shift the due date later and shorter cycles shift it earlier, which is why the cycle length field adjusts the estimate by the difference from twenty-eight days.",
    },
    {
      question: "Why is pregnancy dated from the last period rather than conception?",
      answer:
        "The exact date of conception is rarely known, while the first day of the last period is a clear, memorable marker. Dating from the period also matches the convention used by scans, test results and medical records, so everyone involved is working from the same timeline. It means the first two weeks of the count happen before conception.",
    },
    {
      question: "How accurate is a due date?",
      answer:
        "Only about four percent of babies arrive on their estimated date. Roughly eighty percent are born within two weeks either side, and a first-trimester ultrasound is more accurate than the period method because it measures the embryo directly. Treat the date as the centre of a window rather than an appointment.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Pregnancy Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pregnancy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Dates">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="lmp"
                  label="First Day of Last Period"
                  value={lmp}
                  onChange={setLmp}
                  onEnter={runCalculate}
                  tooltip="Day one of the most recent menstrual period."
                />
                <CompactInput
                  id="today"
                  label="Measure At"
                  value={today}
                  onChange={setToday}
                  onEnter={runCalculate}
                  tooltip="Change this to any date to see the progress at that point."
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
                  <SubSection title="Cycle">
                    <CompactInput
                      id="cycle-length"
                      label="Average Cycle Length"
                      value={cycleLength}
                      onChange={setCycleLength}
                      onEnter={runCalculate}
                      type="number"
                      min="20"
                      suffix="days"
                      hint="Twenty-eight days is the standard assumption."
                      tooltip="Longer cycles push the due date later."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Weeks Pregnant</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${results.weeksPregnant}w ${results.daysIntoWeek}d` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.trimester} · due ${results.dueDate} (${results.dueDateWeekday})`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Days Remaining</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.daysRemaining : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${results.progressPct}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Conception</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.conceptionDate : "—"}</span>
              </div>
            </div>

            {/* MILESTONE TABLE */}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Days Since Last Period</span>
                  <span className="text-base font-bold text-foreground">{results.totalDays}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Trimester</span>
                  <span className="text-base font-bold text-foreground">{results.trimester || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Second Trimester From</span>
                  <span className="text-base font-bold text-foreground">{results.secondTrimesterDate || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Third Trimester From</span>
                  <span className="text-base font-bold text-foreground">{results.thirdTrimesterDate || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Full Term From</span>
                  <span className="text-base font-bold text-foreground">{results.fullTermStart || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cycle Length Assumed</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.cycleLength} days</span>
                </div>
              </div>
            </div>

            {results.valid && (
              <div className="bg-secondary/20 border border-border rounded-lg p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">
                  What Is Happening Now
                </div>
                <p className="text-sm text-foreground">{results.currentWeekNote}</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Pregnancy Calculator?</h2>
            <p>
              A pregnancy calculator converts the first day of your last menstrual period into a due date, a current week and day
              count, and a stage of pregnancy. It shows how far the pregnancy has progressed, how many days remain, when each
              trimester begins and which milestones have already passed.
            </p>
            <p>
              Knowing the week matters because almost every antenatal decision is tied to it: which scans are offered, which
              screening tests are appropriate, when glucose testing happens and from which point a baby would be considered full
              term. Having the timeline in one place makes appointments and conversations with a midwife much easier to follow.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculation adds two hundred and eighty days to the first day of the last period, which is forty weeks under the
              standard assumption of a twenty-eight day cycle with ovulation on day fourteen. Where the cycle is longer or
              shorter, the difference is added or subtracted, because ovulation shifts by roughly the same amount.
            </p>
            <p>
              The number of completed weeks comes from dividing the days elapsed since the period began by seven. Pregnancy is
              counted from the last period rather than conception, so the first two weeks of the count occur before the pregnancy
              itself starts. That convention keeps dating consistent with scan reports and medical records.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the current week and day with the trimester and due date, and the three-stat bar reports days
              remaining, percentage of the way through and the estimated conception date. The table lists every milestone from
              conception through the scan window and viability to the full-term mark, marking which have passed.
            </p>
            <p>
              The progress percentage is a useful planning tool. The second trimester begins at fourteen weeks and the third at
              twenty-eight, while full term runs from thirty-seven weeks. Anything born before thirty-seven weeks is classified as
              preterm, which is why that date appears separately from the due date rather than being treated as an early version
              of it.
            </p>
            <p>
              Change the reference date to compare appointments. Setting it to a scan date shows exactly how far along you were
              then, and setting it to a future date shows how far along you will be at a planned event, which is often how return
              to work and travel decisions are timed.
            </p>
            <p>
              Finally, treat the due date as an estimate rather than an appointment. Only a small percentage of babies arrive on
              the calculated day, and a first-trimester scan is generally more accurate than the period method because it measures
              the embryo directly. Where              the two disagree by more than a week, clinicians usually adopt the scan date.
            </p>
            <p>
              Keep the week count in your notes alongside any symptoms or questions, because a midwife will almost always ask how
              many weeks you are first. Recording the count at each appointment also makes it easy to spot when a scan or a test
              result refers to a slightly different dating convention, and the difference is usually only a few days either way.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy-calculator" />
          <PopularCalculators exclude="/calculator/pregnancy-calculator" />
        </div>
      </div>
    </>
  );
}
