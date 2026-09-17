"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, CalendarCheck, CalendarX, Clock, TrendingUp } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AttendanceInputs {
  totalDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  lateMinutesThreshold: number;
}

interface AttendanceResult {
  attendancePct: number;
  absentPct: number;
  latePct: number;
  effectiveAttendancePct: number;
  daysAbsentCalculated: number;
  daysAbsentUsed: number;
  daysPresent: number;
  totalDays: number;
}

const DEFAULTS: AttendanceInputs = {
  totalDays: 180,
  daysPresent: 165,
  daysAbsent: 12,
  daysLate: 3,
  lateMinutesThreshold: 15,
};

function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function calculate(input: AttendanceInputs): AttendanceResult {
  const totalDays = Math.round(safe(input.totalDays)) || 0;
  const daysPresent = Math.round(safe(input.daysPresent)) || 0;
  let daysAbsent = Math.round(safe(input.daysAbsent));
  const daysLate = Math.round(safe(input.daysLate)) || 0;
  const lateMinutesThreshold = Math.round(safe(input.lateMinutesThreshold)) || 0;

  const daysAbsentCalculated = Math.max(0, totalDays - daysPresent);
  const daysAbsentUsed = Math.max(0, Math.min(daysAbsent, totalDays - daysPresent));

  const attendancePct = totalDays > 0 ? (daysPresent / totalDays) * 100 : 0;
  const absentPct = totalDays > 0 ? (daysAbsentUsed / totalDays) * 100 : 0;
  const latePct = totalDays > 0 ? (daysLate / totalDays) * 100 : 0;
  const effectiveAttendancePct = totalDays > 0 ? ((daysPresent + daysLate * 0.5) / totalDays) * 100 : 0;

  return {
    attendancePct,
    absentPct,
    latePct,
    effectiveAttendancePct,
    daysAbsentCalculated,
    daysAbsentUsed,
    daysPresent,
    totalDays,
  };
}

interface CIProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: string) => void;
  suffix?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CI = ({ id, label, value, onChange, suffix, onKeyDown }: CIProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const AttendanceCalculator = () => {
  const [inputs, setInputs] = useState<AttendanceInputs>(DEFAULTS);
  const [result, setResult] = useState<AttendanceResult>(calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const setField = (key: keyof AttendanceInputs) => (v: string) =>
    setInputs((prev) => ({ ...prev, [key]: v === "" ? 0 : parseFloat(v) || 0 }));

  const handleCalculate = () => setResult(calculate(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setShowAdvanced(false);
    setResult(calculate(DEFAULTS));
  };

  const pieData = [
    { name: "Present", value: Math.max(0, result.daysPresent), color: "#10b981" },
    { name: "Absent", value: Math.max(0, result.daysAbsentUsed), color: "#ef4444" },
    { name: "Late", value: Math.max(0, inputs.daysLate), color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const faqs = [
    { question: "What is a good attendance percentage?", answer: "Most schools and employers consider 90%+ attendance as excellent. Many institutions require a minimum of 75–80% to remain in good standing or qualify for exams. Below 60% often triggers academic probation or workplace disciplinary action." },
    { question: "How does being late affect attendance?", answer: "Lateness is often counted as a partial absence. This calculator treats each late day as half an absence, but your institution may have its own rules — some count 3 lates as 1 absence, others use minute thresholds. Check your student handbook or HR policy for exact rules." },
    { question: "Can I calculate how many days I can miss?", answer: "Yes. If you know your allowed minimum (e.g., 75%), divide your current present days by the minimum percentage to find the maximum total days you can have, then subtract your current total to find how many more classes you can skip." },
  ];

  const fmt = (n: number, decimals = 1) => `${n.toFixed(decimals)}%`;
  const daysFmt = (n: number) => `${Math.round(n)} days`;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Attendance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Attendance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="totalDays" label="Total Days" value={inputs.totalDays} onChange={setField("totalDays")} onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
              <CI id="daysPresent" label="Days Present" value={inputs.daysPresent} onChange={setField("daysPresent")} onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Absence Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <CI id="daysAbsent" label="Days Absent" value={inputs.daysAbsent} onChange={setField("daysAbsent")} onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
                    <CI id="daysLate" label="Days Late" value={inputs.daysLate} onChange={setField("daysLate")} onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
                    <CI id="lateThreshold" label="Late Minutes Threshold" value={inputs.lateMinutesThreshold} onChange={setField("lateMinutesThreshold")} suffix="min" onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Days Absent auto-calculates as Total − Present but can be overridden. Late days count as partial absences.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm active:scale-[0.98]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result.totalDays > 0 && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Attendance Percentage</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">{fmt(result.attendancePct)}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">
                    Effective Attendance: {fmt(result.effectiveAttendancePct)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-4 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Attendance</div>
                    <div className="text-lg font-bold text-emerald-600">{fmt(result.attendancePct)}</div>
                  </div>
                  <div className="p-4 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Absent</div>
                    <div className="text-lg font-bold text-red-600">{fmt(result.absentPct)}</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Effective</div>
                    <div className="text-lg font-bold text-primary">{fmt(result.effectiveAttendancePct)}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right w-[100px]">Days</th>
                        <th className="p-3 text-right w-[120px]">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Present</td>
                        <td className="p-3 text-right text-foreground">{daysFmt(result.daysPresent)}</td>
                        <td className="p-3 text-right text-emerald-600 font-medium">{fmt(result.attendancePct)}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Absent</td>
                        <td className="p-3 text-right text-foreground">{daysFmt(result.daysAbsentUsed)}</td>
                        <td className="p-3 text-right text-red-600 font-medium">{fmt(result.absentPct)}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Late</td>
                        <td className="p-3 text-right text-foreground">{daysFmt(inputs.daysLate)}</td>
                        <td className="p-3 text-right text-amber-600 font-medium">{fmt(result.latePct)}</td>
                      </tr>
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t-2 border-border">
                        <td className="p-3">Effective Attendance</td>
                        <td className="p-3 text-right">{daysFmt(result.daysPresent + inputs.daysLate * 0.5)}</td>
                        <td className="p-3 text-right text-primary">{fmt(result.effectiveAttendancePct)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Attendance Distribution</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                      {pieData.length > 0 ? (
                        <div className="w-[200px] h-[200px] relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                                {pieData.map((entry, i) => (
                                  <Cell key={`c-${i}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v: number) => `${Math.round(v)} days`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                            <span className="text-lg font-extrabold text-foreground">{result.totalDays} days</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground py-16">No data to display.</div>
                      )}
                    </div>
                    <div className="w-full sm:w-1/2 flex flex-col gap-2">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                          <span className="text-foreground font-medium flex-1">{d.name}</span>
                          <span className="text-muted-foreground tabular-nums">{pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(1) : "0.0"}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Days:</span><span className="font-medium text-foreground">{result.totalDays}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Days Present:</span><span className="font-medium text-emerald-600">{result.daysPresent}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Days Absent:</span><span className="font-medium text-red-600">{result.daysAbsentUsed}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Days Late:</span><span className="font-medium text-amber-600">{inputs.daysLate}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Late Threshold:</span><span className="font-medium text-foreground">{inputs.lateMinutesThreshold} min</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Effective Attendance:</span><span className="font-medium text-primary">{fmt(result.effectiveAttendancePct)}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Attendance Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                An attendance calculator measures how often a student or employee shows up over a defined period — typically a semester, term, or work quarter. Attendance percentage is one of the strongest predictors of academic success and workplace reliability. Schools use it to enforce exam eligibility rules, and employers rely on it for compliance with labor contracts and professional standards. This tool computes the core metrics you need: raw attendance, absence rate, late rate, and effective attendance that treats tardiness as a partial absence.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How Attendance Percentages Are Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">
                The core formula divides days present by total days: Attendance % = (Present / Total) × 100. Absence percentage works the same way with absent days. Effective attendance goes further by weighting late days at half value: Effective % = ((Present + Late × 0.5) / Total) × 100. This rewards consistency without punishing a single tardy day as harshly as a full absence. Many institutions set minimum thresholds — 75% to sit for exams, 90% for honors consideration — so knowing your exact percentage helps you plan recovery strategies before you fall below the cutoff.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Using Attendance Data for Academic and Work Compliance</h2>
              <p className="text-muted-foreground leading-relaxed">
                Beyond the raw number, attendance data drives real decisions. Students below the threshold may lose exam privileges, fail a course automatically, or be placed on academic probation. Employees with poor attendance face disciplinary action, lost pay, or termination under most attendance policies. By tracking present, absent, and late days separately, you can identify patterns — a spike in tardiness often precedes a drop in overall attendance. Use the advanced options to model scenarios: if you are late three more times, does your effective attendance still clear the minimum? This kind of proactive planning prevents surprises at the end of a term or pay period.
              </p>
            </div>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/attendance-calculator" />
          <PopularCalculators exclude="/calculator/attendance-calculator" />
        </div>
      </div>
    </>
  );
};

export default AttendanceCalculator;
