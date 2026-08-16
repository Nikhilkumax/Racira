"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Hourglass } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CountdownResult {
  target: string;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  weekday: string;
  isPast: boolean;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function defaultTarget(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T12:00`;
}

function calcCountdown(targetStr: string): CountdownResult {
  const target = new Date(targetStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const totalSeconds = Math.max(0, Math.floor(Math.abs(diffMs) / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const days = totalDays;
  const hours = Math.floor(totalHours % 24);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = totalSeconds % 60;
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const chartData = [
    { name: "Days", value: days },
    { name: "Hours", value: hours },
    { name: "Minutes", value: minutes },
    { name: "Seconds", value: seconds },
  ];

  const breakdown = [
    { label: "Target Date", value: target.toLocaleString() },
    { label: "Weekday", value: weekdays[target.getDay()] },
    { label: "Total Days", value: `${totalDays.toLocaleString()}` },
    { label: "Total Hours", value: `${totalHours.toLocaleString()}` },
    { label: "Total Minutes", value: `${totalMinutes.toLocaleString()}` },
    { label: "Total Seconds", value: `${totalSeconds.toLocaleString()}` },
    { label: "Status", value: isPast ? "Already passed" : "Countdown active" },
    { label: "Weeks (approx.)", value: `${(totalDays / 7).toFixed(1)}` },
  ];

  const summaryStats = [
    { label: "Days", value: `${days.toLocaleString()}` },
    { label: "Hours", value: `${hours}` },
    { label: "Minutes", value: `${minutes}` },
    { label: "Seconds", value: `${seconds}` },
    { label: "Total Days", value: `${totalDays.toLocaleString()}` },
    { label: "Weekday", value: weekdays[target.getDay()] },
  ];

  return { target: targetStr, totalDays, totalHours, totalMinutes, totalSeconds, days, hours, minutes, seconds, weekday: weekdays[target.getDay()], isPast, chartData, breakdown, summaryStats };
}

export default function CountdownCalculator() {
  const [target, setTarget] = useState(defaultTarget);
  const [result, setResult] = useState<CountdownResult>(() => calcCountdown(defaultTarget()));

  useEffect(() => {
    if (target && !isNaN(new Date(target).getTime())) setResult(calcCountdown(target));
  }, [target]);

  const reset = () => setTarget(defaultTarget());
  const invalid = !target || isNaN(new Date(target).getTime());

  const faqs = [
    { question: "How does the countdown update?", answer: "The countdown is computed live from your device clock at the moment of calculation. For a ticking live counter, refresh or recalculate to see the latest time remaining." },
    { question: "What happens if the date has already passed?", answer: "The calculator reports the total elapsed time and marks the event as passed, so you can see how long ago it occurred." },
    { question: "What time zone is used?", answer: "Your local device time zone. The datetime input uses your browser's local time, which keeps the countdown aligned with the time you experience." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Countdown Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Countdown Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="target" className="block text-sm font-medium mb-1 text-foreground">Target Date &amp; Time</label>
              <input id="target" type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Hourglass className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Pick a valid target date and time.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Time Remaining</div>
              <div className="text-4xl font-extrabold text-primary">{result.totalDays.toLocaleString()} days</div>
              <div className="text-sm text-muted-foreground mt-1">{result.hours}h {result.minutes}m {result.seconds}s · {result.weekday} {new Date(result.target).toLocaleDateString()}</div>
            </div>

            <div className="grid grid-cols-4 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Days</div>
                <div className="text-lg font-bold text-primary">{result.days.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Hours</div>
                <div className="text-lg font-bold text-primary">{result.hours}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Minutes</div>
                <div className="text-lg font-bold text-primary">{result.minutes}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Seconds</div>
                <div className="text-lg font-bold text-primary">{result.seconds}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Remaining Time Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()}`, "Units"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Countdown Calculator</h2>
            <p>Pick any future date and time and this calculator tells you exactly how much time remains — in days, hours, minutes, and seconds — computed from your device clock in your local time zone.</p>
            <h3>Planning Ahead</h3>
            <p>Countdowns help with project deadlines, trips, event planning, and anticipation. The breakdown view also shows the total in a single unit (total hours, total minutes) for precise scheduling math.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/countdown-calculator" />
          <PopularCalculators exclude="/calculator/countdown-calculator" />
        </div>
      </div>
    </>
  );
}
