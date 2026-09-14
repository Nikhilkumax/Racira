"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, MonitorPlay } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SeatTimeResult {
  totalHours: number;
  sessions: number;
  breakMinutes: number;
  totalMinutes: number;
  breakTotal: number;
  effectiveMinutes: number;
  effectiveHours: number;
  avgSessionMinutes: number;
  breakPct: number;
  chartData: { name: string; value: number }[];
}

function calcSeatTime(totalHours: number, sessions: number, breakMinutes: number): SeatTimeResult {
  const totalMinutes = totalHours * 60;
  const breakTotal = sessions * breakMinutes;
  const effectiveMinutes = Math.max(0, totalMinutes - breakTotal);
  const effectiveHours = effectiveMinutes / 60;
  const avgSessionMinutes = sessions > 0 ? effectiveMinutes / sessions : 0;
  const breakPct = totalMinutes > 0 ? (breakTotal / totalMinutes) * 100 : 0;
  const chartData = [
    { name: "Effective Learning", value: effectiveMinutes },
    { name: "Breaks", value: breakTotal },
  ];
  return { totalHours, sessions, breakMinutes, totalMinutes, breakTotal, effectiveMinutes, effectiveHours, avgSessionMinutes, breakPct, chartData };
}

const DEFAULTS = { hours: "5", sessions: "5", breaks: "15" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "What is seat time in eLearning?", answer: "Seat time is the time a learner spends in training, including breaks between sessions. Effective seat time subtracts breaks to estimate genuine learning time — the number typically reported for compliance hours." },
  { question: "How do breaks affect the estimate?", answer: "Each session starts with setup and break minutes. With 5 sessions at 15 minutes of break each, a 5-hour course loses 75 of its 300 minutes (25%) to breaks — a meaningful chunk of the reported hours." },
  { question: "How does eLearning compare to classroom time?", answer: "Self-paced eLearning typically converts to 30–50% of the equivalent instructor-led seat time, since it removes commute, social pacing, and delivery overhead. Use this ratio when planning blended curricula." },
];

export default function ElearningSeatTimeCalculator() {
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [sessions, setSessions] = useState(DEFAULTS.sessions);
  const [breaks, setBreaks] = useState(DEFAULTS.breaks);
  const [result, setResult] = useState<SeatTimeResult>(() => calcSeatTime(5, 5, 15));

  useEffect(() => {
    const h = parseFloat(hours);
    const s = parseFloat(sessions);
    const b = parseFloat(breaks);
    if (!isNaN(h) && !isNaN(s) && !isNaN(b) && h >= 0 && s >= 1 && b >= 0) setResult(calcSeatTime(h, s, b));
  }, []);

  const handleCalculate = () => {
    const h = parseFloat(hours);
    const s = parseFloat(sessions);
    const b = parseFloat(breaks);
    if (!isNaN(h) && !isNaN(s) && !isNaN(b) && h >= 0 && s >= 1 && b >= 0) setResult(calcSeatTime(h, s, b));
  };
  const reset = () => { setHours(DEFAULTS.hours); setSessions(DEFAULTS.sessions); setBreaks(DEFAULTS.breaks); setResult(calcSeatTime(5, 5, 15)); };
  const invalid = isNaN(parseFloat(hours)) || isNaN(parseFloat(sessions)) || isNaN(parseFloat(breaks)) || parseFloat(hours) < 0 || parseFloat(sessions) < 1 || parseFloat(breaks) < 0;

  const fmtHM = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return h > 0 ? `${h} h ${m} min` : `${m} min`;
  };

  const breakdown = [
    { label: "Total Course Time", value: `${result.totalHours} hours (${result.totalMinutes} min)` },
    { label: "Sessions", value: `${result.sessions}` },
    { label: "Break per Session", value: `${result.breakMinutes} min` },
    { label: "Total Break Time", value: `${result.breakTotal} min (${result.breakPct.toFixed(0)}%)` },
    { label: "Effective Seat Time", value: fmtHM(result.effectiveMinutes), highlight: true },
    { label: "Effective (hours)", value: `${result.effectiveHours.toFixed(2)} h` },
    { label: "Average per Session", value: `${result.avgSessionMinutes.toFixed(1)} min` },
    { label: "Classroom Equivalent", value: `${(result.effectiveHours * 2).toFixed(1)}–${(result.effectiveHours * 3).toFixed(1)} h instructor-led` },
  ];

  const summaryStats = [
    { label: "Effective Seat Time", value: fmtHM(result.effectiveMinutes) },
    { label: "Avg per Session", value: `${result.avgSessionMinutes.toFixed(1)} min` },
    { label: "Total Breaks", value: `${result.breakTotal} min` },
    { label: "Break Share", value: `${result.breakPct.toFixed(1)}%` },
    { label: "Sessions", value: `${result.sessions}` },
    { label: "Total Time", value: `${result.totalHours} h` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "eLearning Seat Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">eLearning Seat Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="est-hours" className="block text-sm font-medium mb-1 text-foreground">Total Course Hours</label>
              <input id="est-hours" type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="est-sessions" className="block text-sm font-medium mb-1 text-foreground">Sessions</label>
                <input id="est-sessions" type="number" min="1" step="1" value={sessions} onChange={(e) => setSessions(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="est-breaks" className="block text-sm font-medium mb-1 text-foreground">Break per Session (min)</label>
                <input id="est-breaks" type="number" min="0" step="5" value={breaks} onChange={(e) => setBreaks(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <MonitorPlay className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter non-negative hours/breaks and at least one session.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Effective Seat Time</div>
              <div className="text-4xl font-extrabold text-primary">{fmtHM(result.effectiveMinutes)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.totalHours} h minus {result.breakTotal} min of breaks · {result.avgSessionMinutes.toFixed(1)} min per session</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Break Time</div>
                <div className="text-lg font-bold text-primary">{result.breakTotal} min</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Avg / Session</div>
                <div className="text-lg font-bold text-primary">{result.avgSessionMinutes.toFixed(1)} min</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Break Share</div>
                <div className="text-lg font-bold text-primary">{result.breakPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Learning vs Break Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toFixed(0)} min (${((v / result.totalMinutes) * 100).toFixed(1)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the eLearning Seat Time Calculator</h2>
            <p>Seat time is the scheduled length of a course. Effective seat time removes the recurring breaks between sessions: with 5 sessions and 15 minutes of break each, a 5-hour (300-minute) course contains 75 minutes of breaks, leaving 3 hours 45 minutes of actual learning time.</p>
            <h3>Planning Realistic Courses</h3>
            <p>Adult learners sustain focus for roughly 45–90 minutes per session, which is why courses are chunked. When estimating development effort, also remember that one hour of polished eLearning typically takes 30–100 hours of design and production time — seat time alone understates the work involved.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/elearning-seat-time-calculator" />
          <PopularCalculators exclude="/calculator/elearning-seat-time-calculator" />
        </div>
      </div>
    </>
  );
}
