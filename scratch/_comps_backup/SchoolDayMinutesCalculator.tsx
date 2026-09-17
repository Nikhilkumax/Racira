"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const TimeInput = ({ id, label, value, onChange }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="time" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
  </div>
);

const NumInput = ({ id, label, value, onChange, min, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs { start: string; end: string; lunch: string; breakMin: string; numBreaks: string; }

interface Result {
  totalMinutes: number;
  lunchMinutes: number;
  breakMinutes: number;
  instructionalMinutes: number;
  instructionalHours: number;
  remMinutes: number;
  instructionalPct: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { start: "08:00", end: "15:00", lunch: "60", breakMin: "15", numBreaks: "2" };

function parseTime(t: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return -1;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return -1;
  return h * 60 + min;
}

function calculate(inputs: Inputs): Result | null {
  const startMin = parseTime(inputs.start);
  const endMin = parseTime(inputs.end);
  const lunch = Math.max(0, parseFloat(inputs.lunch) || 0);
  const breakMin = Math.max(0, parseFloat(inputs.breakMin) || 0);
  const numBreaks = Math.max(0, parseFloat(inputs.numBreaks) || 0);
  if (startMin < 0 || endMin < 0) return null;
  let total = endMin - startMin;
  if (total < 0) total += 24 * 60; // wrap past midnight
  const breakMinutes = breakMin * numBreaks;
  const instructionalMinutes = total - lunch - breakMinutes;
  if (instructionalMinutes < 0) return null;
  return {
    totalMinutes: total,
    lunchMinutes: lunch,
    breakMinutes,
    instructionalMinutes,
    instructionalHours: Math.floor(instructionalMinutes / 60),
    remMinutes: Math.round(instructionalMinutes % 60),
    instructionalPct: total > 0 ? (instructionalMinutes / total) * 100 : 0,
    chart: [
      { name: "Instruction", value: Math.round(instructionalMinutes) },
      { name: "Lunch", value: Math.round(lunch) },
      { name: "Breaks", value: Math.round(breakMinutes) },
    ],
  };
}

const SchoolDayMinutesCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = parseTime(inputs.start) < 0 || parseTime(inputs.end) < 0 || num(inputs.lunch) < 0 || num(inputs.breakMin) < 0 || num(inputs.numBreaks) < 0 || (result === null && (parseTime(inputs.start) >= 0 && parseTime(inputs.end) >= 0));

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "School Day Start", value: inputs.start },
    { label: "School Day End", value: inputs.end },
    { label: "Total Day Length", value: `${fmt(Math.floor(r.totalMinutes / 60))}h ${fmt(Math.round(r.totalMinutes % 60))}m` },
    { label: "Lunch Duration", value: fmt(r.lunchMinutes) + " min" },
    { label: "Breaks (×" + fmt(num(inputs.numBreaks)) + ")", value: fmt(r.breakMinutes) + " min" },
    { label: "Instructional Minutes", value: `${fmt(r.instructionalHours)}h ${fmt(r.remMinutes)}m`, highlight: true },
    { label: "Instructional Share of Day", value: fmt(r.instructionalPct, 1) + "%", total: true },
  ] : [];

  const faqs = [
    { question: "What counts as instructional time?", answer: "Instructional time is the portion of the school day spent on teaching and learning — total time from start bell to end bell minus lunch and recess/breaks. Many states use this figure to enforce minimum instructional-hour requirements." },
    { question: "What is a typical school day?", answer: "A common US schedule is 8:00 AM to 3:00 PM (420 minutes) with 60 minutes of lunch and two 15-minute breaks, leaving about 330 minutes — 5.5 hours — of instructional time per day." },
    { question: "How many instructional minutes are required?", answer: "State requirements vary widely, from roughly 450 hours per year in elementary grades to 1,080 in some high schools. Divide your state's annual requirement by 180 school days to find the daily target." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "School Day Minutes Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">School Day Minutes Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">School Day Hours</div>
            <div className="grid grid-cols-2 gap-3">
              <TimeInput id="start" label="Start Time" value={inputs.start} onChange={set("start")} />
              <TimeInput id="end" label="End Time" value={inputs.end} onChange={set("end")} />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Breaks & Lunch</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="lunch" label="Lunch (minutes)" value={inputs.lunch} onChange={set("lunch")} min="0" />
              <NumInput id="breakMin" label="Break Length (min)" value={inputs.breakMin} onChange={set("breakMin")} min="0" />
            </div>
            <div>
              <NumInput id="numBreaks" label="Number of Breaks" value={inputs.numBreaks} onChange={set("numBreaks")} min="0" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Enter valid times (HH:MM) and ensure lunch + breaks don't exceed the day length.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {r && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Instructional Minutes Per Day</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.instructionalMinutes)} <span className="text-2xl">min</span></div>
                  <div className="text-sm text-muted-foreground font-medium">{fmt(r.instructionalHours)}h {fmt(r.remMinutes)}m of instruction · <span className="font-bold text-foreground">{fmt(r.instructionalPct, 1)}%</span> of the school day</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Day Length</span>
                    <span className="font-extrabold text-primary">{fmt(Math.floor(r.totalMinutes / 60))}h {fmt(Math.round(r.totalMinutes % 60))}m</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lunch</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.lunchMinutes)} min</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Breaks</span>
                    <span className="font-extrabold text-foreground">{fmt(r.breakMinutes)} min</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Detail</th>
                        <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {rows.map((row) => (
                        <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                          <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">How the School Day Breaks Down (minutes)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[{ name: "School Day", ...Object.fromEntries(r.chart.map((c) => [c.name, c.value])) }]} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [fmt(v) + " min", ""]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Instruction" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Lunch" stackId="a" fill="hsl(var(--secondary))" />
                      <Bar dataKey="Breaks" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Day Length", value: `${fmt(Math.floor(r.totalMinutes / 60))}h ${fmt(Math.round(r.totalMinutes % 60))}m` },
                      { label: "Lunch", value: fmt(r.lunchMinutes) + " min" },
                      { label: "Breaks", value: fmt(r.breakMinutes) + " min" },
                      { label: "Instructional Time", value: fmt(r.instructionalMinutes) + " min", bold: true },
                      { label: "Instruction / Day", value: `${fmt(r.instructionalHours)}h ${fmt(r.remMinutes)}m` },
                      { label: "Share of Day", value: fmt(r.instructionalPct, 1) + "%", bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                        <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Numbers Mean</h2>
            <p>With the defaults (8:00-3:00, 60 min lunch, 2×15 min breaks), the day is 420 minutes long and yields <strong>330 instructional minutes</strong> — 5.5 hours, or about 79% of the day. Over a 180-day school year that's 59,400 instructional minutes (990 hours).</p>
            <h2 className="text-2xl font-bold mb-3">State Requirements</h2>
            <p>Instructional-time mandates vary from about 450 annual hours at the low end to over 1,080 at the high end, usually expressed in days or hours rather than minutes. Use this calculator to check a proposed schedule against your district's daily target.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/school-day-minutes-calculator" />
          <PopularCalculators exclude="/calculator/school-day-minutes-calculator" />
        </div>
      </div>
    </>
  );
};
export default SchoolDayMinutesCalculator;
