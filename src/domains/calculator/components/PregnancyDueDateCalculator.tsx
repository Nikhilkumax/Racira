"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Method = "lmp" | "conception" | "ultrasound" | "ivf";

interface DueDateInputs {
  method: Method;
  lmp: string;
  cycleLength: number;
  conception: string;
  scanDate: string;
  scanWeeks: number;
  scanDays: number;
  transferDate: string;
  transferDay: number;
}

const DEFAULTS: DueDateInputs = {
  method: "lmp",
  lmp: "2026-01-05",
  cycleLength: 28,
  conception: "2026-01-19",
  scanDate: "2026-03-01",
  scanWeeks: 8,
  scanDays: 3,
  transferDate: "2026-01-19",
  transferDay: 5,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface WeekRow {
  week: number;
  date: string;
  note: string;
}

interface DueDateResult {
  valid: boolean;
  errorMsg: string;
  dueDate: string;
  dueDateWeekday: string;
  gestationalDays: number;
  gestationalWeeks: number;
  daysUntilDue: number;
  conceptionDate: string;
  methodLabel: string;
  methodNote: string;
  trimeterRows: { label: string; date: string; detail: string }[];
  weeks: WeekRow[];
  cycleAdjustment: number;
}

const WEEK_NOTES: Record<number, string> = {
  8: "First scan usually offered",
  12: "End of the first trimester",
  16: "Screening blood tests may be offered",
  20: "Anatomy scan window",
  24: "Viability milestone",
  28: "Third trimester begins",
  32: "Growth scans may start",
  36: "Weekly checks begin",
  37: "Full term begins",
  40: "Estimated due date",
};

function computeDueDate(input: DueDateInputs, anchorToday: Date): DueDateResult {
  const cycle =
    Number.isFinite(input.cycleLength) && input.cycleLength >= 20 && input.cycleLength <= 45 ? input.cycleLength : 28;
  const cycleAdjustment = cycle - 28;

  let due: Date | null = null;
  let gestationalDays = 0;
  let methodLabel = "";
  let methodNote = "";

  if (input.method === "lmp") {
    const lmp = toDate(input.lmp);
    if (!lmp) return blankResult("Enter the first day of the last menstrual period.");
    due = new Date(lmp.getTime() + (280 + cycleAdjustment) * 86400000);
    gestationalDays = Math.floor((anchorToday.getTime() - lmp.getTime()) / 86400000);
    methodLabel = "Last menstrual period";
    methodNote = `Assumes a ${cycle}-day cycle with ovulation around day ${14 + cycleAdjustment}.`;
  } else if (input.method === "conception") {
    const conception = toDate(input.conception);
    if (!conception) return blankResult("Enter the estimated conception date.");
    due = new Date(conception.getTime() + 266 * 86400000);
    gestationalDays = Math.floor((anchorToday.getTime() - conception.getTime()) / 86400000) + 14;
    methodLabel = "Conception date";
    methodNote = "Adds two hundred and sixty-six days from conception, the equivalent of forty weeks from the last period.";
  } else if (input.method === "ultrasound") {
    const scan = toDate(input.scanDate);
    if (!scan) return blankResult("Enter the date of the ultrasound scan.");
    const weeks = Number.isFinite(input.scanWeeks) ? Math.max(0, input.scanWeeks) : 0;
    const days = Number.isFinite(input.scanDays) ? Math.max(0, input.scanDays) : 0;
    const ageAtScan = weeks * 7 + days;
    if (ageAtScan <= 0) return blankResult("Enter the gestational age measured at the scan.");
    const lmpEquivalent = new Date(scan.getTime() - ageAtScan * 86400000);
    due = new Date(lmpEquivalent.getTime() + 280 * 86400000);
    gestationalDays = ageAtScan + Math.floor((anchorToday.getTime() - scan.getTime()) / 86400000);
    methodLabel = "Ultrasound dating";
    methodNote = `Derived from a measurement of ${weeks} weeks and ${days} days on the scan date.`;
  } else {
    const transfer = toDate(input.transferDate);
    if (!transfer) return blankResult("Enter the date of the embryo transfer.");
    const transferDay = Number.isFinite(input.transferDay) && input.transferDay > 0 ? input.transferDay : 5;
    const conceptionEquivalent = new Date(transfer.getTime() - (transferDay - 0) * 86400000 + 0);
    due = new Date(conceptionEquivalent.getTime() + 266 * 86400000);
    gestationalDays = Math.floor((anchorToday.getTime() - conceptionEquivalent.getTime()) / 86400000) + 14;
    methodLabel = "IVF embryo transfer";
    methodNote = `Assumes a day-${transferDay} transfer, so the transfer date is treated as conception minus ${transferDay} days.`;
  }

  if (!due) return blankResult("The dates entered could not be interpreted. Check each field.");

  const conceptionDate = new Date(due.getTime() - 266 * 86400000);
  const daysUntilDue = Math.ceil((due.getTime() - anchorToday.getTime()) / 86400000);

  const trimeterRows = [
    {
      label: "First trimester",
      date: pretty(new Date(due.getTime() - 267 * 86400000)),
      detail: "Weeks 0 to 13, ending 267 days before the due date",
    },
    {
      label: "Second trimester",
      date: pretty(new Date(due.getTime() - 182 * 86400000)),
      detail: "Weeks 14 to 27, the usual window for the anatomy scan",
    },
    {
      label: "Third trimester",
      date: pretty(new Date(due.getTime() - 84 * 86400000)),
      detail: "Weeks 28 to birth, with more frequent appointments",
    },
    {
      label: "Full term begins",
      date: pretty(new Date(due.getTime() - 21 * 86400000)),
      detail: "Week 37, the start of the full-term window",
    },
  ];

  const weeks: WeekRow[] = [8, 12, 16, 20, 24, 28, 32, 36, 37, 40].map((w) => {
    const d = new Date(due.getTime() - (40 - w) * 7 * 86400000);
    return { week: w, date: pretty(d), note: WEEK_NOTES[w] ?? "" };
  });

  return {
    valid: true,
    errorMsg: "",
    dueDate: pretty(due),
    dueDateWeekday: WEEKDAYS[due.getUTCDay()],
    gestationalDays: Math.max(0, gestationalDays),
    gestationalWeeks: Math.max(0, Math.floor(gestationalDays / 7)),
    daysUntilDue,
    conceptionDate: pretty(conceptionDate),
    methodLabel,
    methodNote,
    trimeterRows,
    weeks,
    cycleAdjustment,
  };
}

function blankResult(errorMsg: string): DueDateResult {
  return {
    valid: false,
    errorMsg,
    dueDate: "",
    dueDateWeekday: "",
    gestationalDays: 0,
    gestationalWeeks: 0,
    daysUntilDue: 0,
    conceptionDate: "",
    methodLabel: "",
    methodNote: "",
    trimeterRows: [],
    weeks: [],
    cycleAdjustment: 0,
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

export default function PregnancyDueDateCalculator() {
  const [method, setMethod] = useState<Method>(DEFAULTS.method);
  const [lmp, setLmp] = useState(DEFAULTS.lmp);
  const [cycleLength, setCycleLength] = useState(String(DEFAULTS.cycleLength));
  const [conception, setConception] = useState(DEFAULTS.conception);
  const [scanDate, setScanDate] = useState(DEFAULTS.scanDate);
  const [scanWeeks, setScanWeeks] = useState(String(DEFAULTS.scanWeeks));
  const [scanDays, setScanDays] = useState(String(DEFAULTS.scanDays));
  const [transferDate, setTransferDate] = useState(DEFAULTS.transferDate);
  const [transferDay, setTransferDay] = useState(String(DEFAULTS.transferDay));
  const [anchor, setAnchor] = useState("2026-04-15");
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DueDateInputs => ({
    method,
    lmp,
    cycleLength: parseFloat(cycleLength) || 28,
    conception,
    scanDate,
    scanWeeks: parseFloat(scanWeeks) || 0,
    scanDays: parseFloat(scanDays) || 0,
    transferDate,
    transferDay: parseFloat(transferDay) || 5,
  });

  const anchorDate = () => toDate(anchor) ?? new Date(Date.UTC(2026, 3, 15));

  const [calcInputs, setCalcInputs] = useState<DueDateInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DueDateResult>(() =>
    computeDueDate(DEFAULTS, new Date(Date.UTC(2026, 3, 15))),
  );

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDueDate(inputs, anchorDate()));
  };

  const reset = () => {
    setMethod(DEFAULTS.method);
    setLmp(DEFAULTS.lmp);
    setCycleLength(String(DEFAULTS.cycleLength));
    setConception(DEFAULTS.conception);
    setScanDate(DEFAULTS.scanDate);
    setScanWeeks(String(DEFAULTS.scanWeeks));
    setScanDays(String(DEFAULTS.scanDays));
    setTransferDate(DEFAULTS.transferDate);
    setTransferDay(String(DEFAULTS.transferDay));
    setAnchor("2026-04-15");
    setCalcInputs(DEFAULTS);
    setResults(computeDueDate(DEFAULTS, new Date(Date.UTC(2026, 3, 15))));
  };

  const METHODS: { key: Method; label: string }[] = [
    { key: "lmp", label: "Last Period" },
    { key: "conception", label: "Conception" },
    { key: "ultrasound", label: "Ultrasound" },
    { key: "ivf", label: "IVF Transfer" },
  ];

  const faqs = [
    {
      question: "Which dating method is most accurate?",
      answer:
        "An early ultrasound is the most accurate, particularly between eight and thirteen weeks when crown-rump length can be measured precisely. After twenty weeks the margin of error grows because babies of the same age vary more in size. When a scan and the period method disagree by more than a week, clinicians normally adopt the scan date for the rest of the pregnancy.",
    },
    {
      question: "How does IVF dating work?",
      answer:
        "In IVF the date of fertilisation is known, so dating runs from the embryo transfer rather than a period. A day-five blastocyst transfer is treated as conception five days before the transfer date, and a day-three transfer as three days before. The due date is then two hundred and sixty-six days after that conception equivalent.",
    },
    {
      question: "Can my due date change during pregnancy?",
      answer:
        "Yes, and it is common. A first-trimester scan often adjusts the date set from the last period, and a later growth scan can revise it again if measurements differ substantially. The final agreed date is the one recorded in your notes, so it is worth checking which method your clinic used whenever the estimate here differs slightly.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Pregnancy Due Date Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Pregnancy Due Date Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Dating Method">
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    aria-pressed={method === m.key}
                    className={
                      method === m.key
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </SubSection>

            <SubSection title="Dates">
              <div className="flex flex-col gap-3">
                {method === "lmp" && (
                  <CompactInput
                    id="lmp"
                    label="First Day of Last Period"
                    value={lmp}
                    onChange={setLmp}
                    onEnter={runCalculate}
                    tooltip="Day one of the most recent menstrual period."
                  />
                )}
                {method === "conception" && (
                  <CompactInput
                    id="conception"
                    label="Conception Date"
                    value={conception}
                    onChange={setConception}
                    onEnter={runCalculate}
                    tooltip="Known or estimated date of conception."
                  />
                )}
                {method === "ultrasound" && (
                  <>
                    <CompactInput
                      id="scan-date"
                      label="Scan Date"
                      value={scanDate}
                      onChange={setScanDate}
                      onEnter={runCalculate}
                      tooltip="Date the ultrasound was performed."
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="scan-weeks"
                        label="Gestational Age"
                        value={scanWeeks}
                        onChange={setScanWeeks}
                        onEnter={runCalculate}
                        type="number"
                        min="0"
                        suffix="wks"
                        tooltip="Weeks measured at the scan."
                      />
                      <CompactInput
                        id="scan-days"
                        label="Extra Days"
                        value={scanDays}
                        onChange={setScanDays}
                        onEnter={runCalculate}
                        type="number"
                        min="0"
                        suffix="days"
                        tooltip="Days beyond the whole weeks measured at the scan."
                      />
                    </div>
                  </>
                )}
                {method === "ivf" && (
                  <>
                    <CompactInput
                      id="transfer-date"
                      label="Embryo Transfer Date"
                      value={transferDate}
                      onChange={setTransferDate}
                      onEnter={runCalculate}
                      tooltip="Date the embryo was transferred."
                    />
                    <CompactInput
                      id="transfer-day"
                      label="Transfer Day"
                      value={transferDay}
                      onChange={setTransferDay}
                      onEnter={runCalculate}
                      type="number"
                      min="1"
                      suffix="day"
                      hint="Day 3 or day 5 are the usual options."
                      tooltip="How many days the embryo developed before transfer."
                    />
                  </>
                )}
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
                  <SubSection title="Cycle & Reference Date">
                    <div className="grid grid-cols-2 gap-3">
                      {method === "lmp" && (
                        <CompactInput
                          id="cycle-length"
                          label="Cycle Length"
                          value={cycleLength}
                          onChange={setCycleLength}
                          onEnter={runCalculate}
                          type="number"
                          min="20"
                          suffix="days"
                          tooltip="Average cycle length, used to adjust the due date."
                        />
                      )}
                      <CompactInput
                        id="anchor"
                        label="Measure At"
                        value={anchor}
                        onChange={setAnchor}
                        onEnter={runCalculate}
                        tooltip="Reference date for the gestational age figures."
                      />
                    </div>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Due Date</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? results.dueDate : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.dueDateWeekday} · ${results.trimeterRows.length > 0 ? "forty weeks" : ""} from ${results.methodLabel.toLowerCase()}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gestational Age</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${results.gestationalWeeks} weeks` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Days to Go</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.daysUntilDue : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Conception Est.</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.conceptionDate : "—"}</span>
              </div>
            </div>

            {/* TRIMESTER TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Stage</th>
                    <th className="p-2.5">Begins</th>
                    <th className="p-2.5 pr-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.trimeterRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-foreground">{row.date}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* WEEK TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Week</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 pr-3">What Happens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.weeks.map((row) => (
                    <tr key={row.week} className={row.week === 40 ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{`${row.week} weeks`}</td>
                      <td className="p-2.5 text-foreground">{row.date}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dating Method</span>
                  <span className="text-base font-bold text-foreground">{results.methodLabel || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Conception Estimate</span>
                  <span className="text-base font-bold text-foreground">{results.conceptionDate || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gestational Days</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.gestationalDays) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Calendar Days Left</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(Math.max(0, results.daysUntilDue)) : "—"}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Method Note</span>
                  <span className="text-sm font-medium text-foreground">{results.methodNote || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Pregnancy Due Date Calculator?</h2>
            <p>
              A pregnancy due date calculator estimates the day a baby is expected and works backwards to map the whole
              pregnancy. It supports four dating methods: the first day of the last period, a known conception date, an
              ultrasound measurement and an IVF embryo transfer, plus a reference date so the gestational age can be read at any
              point in the pregnancy.
            </p>
            <p>
              Dating matters because almost every clinical decision depends on it. Screening windows, scan timings, growth
              checks and decisions about induction are all tied to gestational age, and a due date that is a week out can change
              which tests are offered. Using the same method as your clinic keeps every appointment on the same timeline.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The standard method adds two hundred and eighty days to the first day of the last period, adjusted for cycle
              length because ovulation shifts with it. Dating from conception adds two hundred and sixty-six days instead, which
              is the same total once the two weeks before ovulation are included. All methods end up describing the same forty
              week timeline.
            </p>
            <p>
              Ultrasound dating measures how far the pregnancy has already progressed on the day of the scan, then works out the
              corresponding start date and adds forty weeks. IVF is simpler still, because the moment of fertilisation is known:
              a day-five blastocyst transfer counts as conception five days before the transfer date.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the estimated due date with the weekday, and the three-stat bar reports the gestational age,
              the days remaining and the estimated conception date. The first table marks when each trimester begins, while the
              second lists the significant weeks from the first scan through the anatomy scan and full term to the due date.
            </p>
            <p>
              Note how the trimester dates are derived from the due date rather than the other way round. The second trimester
              begins at fourteen weeks and the third at twenty-eight, with full term starting at thirty-seven. Those boundaries
              explain why a baby born at thirty-six weeks is described as late preterm even when everything looks healthy.
            </p>
            <p>
              Compare methods when the dates differ. A period-based estimate and a first-trimester scan commonly disagree by a
              few days, and anything beyond a week usually means the scan wins, since it measures the embryo directly rather than
              inferring from a cycle that may not have been typical.
            </p>
            <p>
              Finally, plan for the window rather than the day. Only a small minority of babies arrive on their due date, and
              the full-term period runs from thirty-seven to forty-two weeks. Arranging work leave, child care and hospital bags
              around the beginning of that window is far more practical than aiming at a single date. Write the agreed date and
              the method used to reach it at the top of your notes, so every later appointment can be checked against the same
              reference instead of a date remembered from an earlier conversation. Booking help early is easier once the window is
              clear, because family and friends can plan around a fortnight rather than a single uncertain day.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy-due-date-calculator" />
          <PopularCalculators exclude="/calculator/pregnancy-due-date-calculator" />
        </div>
      </div>
    </>
  );
}
