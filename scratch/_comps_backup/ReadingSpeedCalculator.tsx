"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

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

interface Inputs { words: string; minutes: string; seconds: string; bookLength: string; }

interface Result {
  wpm: number;
  timeMinutes: number;
  level: string;
  bookHours: number;
  bookMinutes: number;
  bookDays: number;
  chart: { name: string; wpm: number }[];
}

const DEFAULTS: Inputs = { words: "250", minutes: "1", seconds: "15", bookLength: "50000" };

function calculate(inputs: Inputs): Result {
  const words = Math.max(0, parseFloat(inputs.words) || 0);
  const minutes = Math.max(0, parseFloat(inputs.minutes) || 0);
  const seconds = Math.max(0, Math.min(59, parseFloat(inputs.seconds) || 0));
  const bookLength = Math.max(0, parseFloat(inputs.bookLength) || 0);
  const timeMinutes = minutes + seconds / 60;
  const wpm = timeMinutes > 0 ? Math.round(words / timeMinutes) : 0;
  const level = wpm < 200 ? "Below Average" : wpm < 300 ? "Average" : wpm < 450 ? "Above Average" : "Excellent";
  const bookMinutes = wpm > 0 ? bookLength / wpm : 0;
  const bookHours = Math.floor(bookMinutes / 60);
  const bookRem = Math.round(bookMinutes % 60);
  return {
    wpm,
    timeMinutes,
    level,
    bookHours,
    bookMinutes: bookRem,
    bookDays: wpm > 0 ? bookLength / wpm / 30 : 0,
    chart: [
      { name: "Your Speed", wpm: Math.max(wpm, 0) },
      { name: "Average Adult", wpm: 225 },
      { name: "College Student", wpm: 350 },
      { name: "Speed Reader", wpm: 700 },
    ],
  };
}

const ReadingSpeedCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.words) < 0 || num(inputs.minutes) < 0 || num(inputs.seconds) < 0 || num(inputs.seconds) > 59 || (num(inputs.minutes) === 0 && num(inputs.seconds) === 0);

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Words Read", value: fmt(num(inputs.words)) },
    { label: "Reading Time", value: `${fmt(num(inputs.minutes))}m ${fmt(num(inputs.seconds))}s` },
    { label: "Reading Speed", value: fmt(result.wpm) + " WPM", highlight: true },
    { label: "Reading Level", value: result.level },
    { label: "Book Length (Words)", value: fmt(num(inputs.bookLength)) },
    { label: "Book Reading Time", value: `${fmt(result.bookHours)}h ${fmt(result.bookMinutes)}m`, total: true },
  ];

  const faqs = [
    { question: "What is an average reading speed?", answer: "The average adult reads at 200-250 words per minute. College students often reach 300-400 WPM, while trained speed readers can exceed 700 WPM — usually with some trade-off in comprehension." },
    { question: "How do I measure my reading speed?", answer: "Read a passage at your normal pace, note the word count (most book pages hold about 250-300 words), and divide words read by the time in minutes. Reading a few passages and averaging gives the most reliable number." },
    { question: "Can reading speed be improved?", answer: "Yes — chunking words into groups, reducing subvocalization, and using a pointer or pacing guide can raise WPM over several weeks of practice. Reading speed is a skill, not a fixed trait." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Reading Speed Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reading Speed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Speed Test</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="words" label="Words Read" value={inputs.words} onChange={set("words")} min="0" />
              <NumInput id="minutes" label="Time — Minutes" value={inputs.minutes} onChange={set("minutes")} min="0" />
            </div>
            <div>
              <NumInput id="seconds" label="Time — Seconds (0-59)" value={inputs.seconds} onChange={set("seconds")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold mt-1">Advanced Options</div>
            <div>
              <NumInput id="bookLength" label="Book Length (Words)" value={inputs.bookLength} onChange={set("bookLength")} min="0" hint="Average novel: 50,000-80,000 words." />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Time must be greater than zero and seconds must be 0-59.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Your Reading Speed</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.wpm)} <span className="text-2xl">WPM</span></div>
              <div className="text-sm text-muted-foreground font-medium"><span className="font-bold text-foreground">{result.level}</span> compared to adult benchmarks</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reading Level</span>
                <span className="font-extrabold text-primary">{result.level}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">50K-Word Book</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.bookHours)}h {fmt(result.bookMinutes)}m</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reading Time</span>
                <span className="font-extrabold text-foreground">{fmt(result.timeMinutes, 1)} min</span>
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
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Your Speed vs Benchmarks (WPM)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), "WPM"]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="wpm" name="Words per minute" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Words Read", value: fmt(num(inputs.words)) },
                  { label: "Reading Time", value: `${fmt(result.timeMinutes, 1)} min` },
                  { label: "Reading Speed", value: fmt(result.wpm) + " WPM", bold: true },
                  { label: "Reading Level", value: result.level },
                  { label: "Book Length", value: fmt(num(inputs.bookLength)) + " words" },
                  { label: "Book Time (30 min/day)", value: `~${fmt(result.bookDays, 1)} days`, bold: true },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Your Number Means</h2>
            <p>With the defaults (250 words in 1 minute 15 seconds), the result is <strong>200 WPM — Average</strong> for an adult reader. A 50,000-word novel would take about 4 hours 10 minutes of reading time, or roughly 8 days at 30 minutes per day.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmarks</h2>
            <p>First through third graders read at 80-120 WPM, middle schoolers at 150-200, average adults at 200-250, college students at 300-400, and trained speed readers above 700. Match the material to your pace — technical documents are read slowly even by fast readers.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reading-speed-calculator" />
          <PopularCalculators exclude="/calculator/reading-speed-calculator" />
        </div>
      </div>
    </>
  );
};
export default ReadingSpeedCalculator;
