"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Course = "SCY" | "SCM" | "LCM";
type EventKey = "sprint" | "middle" | "distance";

interface ConvInput {
  sourceCourse: Course;
  event: EventKey;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ConvResult {
  scySeconds: number;
  scmSeconds: number;
  lcmSeconds: number;
  sourceSeconds: number;
  eventLabel: string;
  chartData: { name: string; seconds: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// USA Swimming conversion factors by event bucket
const FACTORS: Record<Course, Record<EventKey, number>> = {
  SCY: { sprint: 1.0, middle: 1.0, distance: 1.0 }, // reference course
  SCM: { sprint: 1.11, middle: 1.08, distance: 1.06 }, // SCY -> SCM
  LCM: { sprint: 1.232, middle: 1.17, distance: 1.113 }, // SCY -> LCM
};

const EVENT_LABELS: Record<EventKey, string> = {
  sprint: "50 / 100 (Sprint)",
  middle: "200 / 400 (Middle)",
  distance: "500 / 800 / 1500 (Distance)",
};

function fmtTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcConv(input: ConvInput): ConvResult {
  const sourceSeconds = input.hours * 3600 + input.minutes * 60 + input.seconds;
  const scmSeconds = sourceSeconds * FACTORS.SCM[input.event];
  const lcmSeconds = sourceSeconds * FACTORS.LCM[input.event];
  const scySeconds = sourceSeconds;

  let scy = scySeconds, scm = scmSeconds, lcm = lcmSeconds;
  if (input.sourceCourse === "SCM") {
    scy = sourceSeconds / FACTORS.SCM[input.event];
    scm = sourceSeconds;
    lcm = sourceSeconds * (FACTORS.LCM[input.event] / FACTORS.SCM[input.event]);
  } else if (input.sourceCourse === "LCM") {
    scy = sourceSeconds / FACTORS.LCM[input.event];
    scm = sourceSeconds / (FACTORS.LCM[input.event] / FACTORS.SCM[input.event]);
    lcm = sourceSeconds;
  }

  const chartData = [
    { name: "SCY (25 yd)", seconds: Number(scy.toFixed(0)), fill: scy === sourceSeconds ? "hsl(var(--primary))" : "#94a3b8" },
    { name: "SCM (25 m)", seconds: Number(scm.toFixed(0)), fill: scm === sourceSeconds ? "hsl(var(--primary))" : "#94a3b8" },
    { name: "LCM (50 m)", seconds: Number(lcm.toFixed(0)), fill: lcm === sourceSeconds ? "hsl(var(--primary))" : "#94a3b8" },
  ];

  const breakdown = [
    { label: "Event Type", value: EVENT_LABELS[input.event] },
    { label: "Source Course", value: input.sourceCourse },
    { label: "Source Time", value: fmtTime(sourceSeconds) },
    { label: "Short Course Yards", value: fmtTime(scy) },
    { label: "Short Course Meters", value: fmtTime(scm) },
    { label: "Long Course Meters", value: fmtTime(lcm) },
  ];

  const summaryStats = [
    { label: "SCY Time", value: fmtTime(scy) },
    { label: "SCM Time", value: fmtTime(scm) },
    { label: "LCM Time", value: fmtTime(lcm) },
    { label: "Source Course", value: input.sourceCourse },
    { label: "Event", value: EVENT_LABELS[input.event] },
    { label: "Fastest Course", value: scy <= scm && scy <= lcm ? "SCY" : scm <= lcm ? "SCM" : "LCM" },
  ];

  return { scySeconds: scy, scmSeconds: scm, lcmSeconds: lcm, sourceSeconds, eventLabel: EVENT_LABELS[input.event], chartData, breakdown, summaryStats };
}

const DEFAULTS: ConvInput = { sourceCourse: "SCY", event: "middle", hours: 0, minutes: 2, seconds: 0 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SwimmingTimeConversion() {
  const [sourceCourse, setSourceCourse] = useState<ConvInput["sourceCourse"]>(DEFAULTS.sourceCourse);
  const [event, setEvent] = useState<ConvInput["event"]>(DEFAULTS.event);
  const [hours, setHours] = useState(String(DEFAULTS.hours));
  const [minutes, setMinutes] = useState(String(DEFAULTS.minutes));
  const [seconds, setSeconds] = useState(String(DEFAULTS.seconds));
  const [result, setResult] = useState<ConvResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcConv({ sourceCourse, event, hours: parse(hours, DEFAULTS.hours), minutes: parse(minutes, DEFAULTS.minutes), seconds: parse(seconds, DEFAULTS.seconds) }));
  const reset = () => {
    setSourceCourse(DEFAULTS.sourceCourse);
    setEvent(DEFAULTS.event);
    setHours(String(DEFAULTS.hours));
    setMinutes(String(DEFAULTS.minutes));
    setSeconds(String(DEFAULTS.seconds));
    setResult(calcConv(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcConv(DEFAULTS));
  }, []);

  const faqs = [
    { question: "Why do swim times differ by course?", answer: "Long-course (50 m) pools have no turn assist — you push off walls half as often — so times are slower than short-course. Yards are shorter than meters, making SCY the fastest course of the three. Conversion factors account for all of this." },
    { question: "What conversion factors are used?", answer: "This calculator uses USA Swimming's standard factors by event bucket: sprint events (50/100) convert SCY→SCM at ×1.11 and SCY→LCM at ×1.232; middle events (200/400) at ×1.08 and ×1.17; distance events (500/800/1500) at ×1.06 and ×1.113." },
    { question: "Are converted times exact?", answer: "No — factors are statistical averages across swimmers and strokes. A converted time is a target or comparison tool, not a guaranteed result. Converted LCM times tend to be the least precise because turn technique varies most in short course." },
    { question: "How should I use conversions?", answer: "Use them to set qualifying targets, compare performances across meets, or plan training paces. For record purposes, always swim the actual course — converted times are never official." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Swimming Time Conversion" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Swimming Time Conversion</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Source Course</label>
                <select value={sourceCourse} onChange={(e) => setSourceCourse(e.target.value as ConvInput["sourceCourse"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="SCY">SCY (25 yd)</option>
                  <option value="SCM">SCM (25 m)</option>
                  <option value="LCM">LCM (50 m)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Event Distance</label>
                <select value={event} onChange={(e) => setEvent(e.target.value as ConvInput["event"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="sprint">50 / 100</option>
                  <option value="middle">200 / 400</option>
                  <option value="distance">500 / 800 / 1500</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Source Time</label>
              <div className="grid grid-cols-3 gap-2">
                <div className={inp}><input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hr</span></div>
                <div className={inp}><input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
                <div className={inp}><input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">sec</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Time · {result.eventLabel}</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{fmtTime(sourceCourse === "SCY" ? result.scySeconds : sourceCourse === "SCM" ? result.scmSeconds : result.lcmSeconds)}</div>
                  <div className="text-sm text-muted-foreground mt-1">SCY {fmtTime(result.scySeconds)} · SCM {fmtTime(result.scmSeconds)} · LCM {fmtTime(result.lcmSeconds)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["SCY (25 yd)", fmtTime(result.scySeconds)], ["SCM (25 m)", fmtTime(result.scmSeconds)], ["LCM (50 m)", fmtTime(result.lcmSeconds)]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Equivalent Times</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, "0")}`, ""]} />
                      <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
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
            <h2 className="text-2xl font-bold mb-3">Why Courses Change Times</h2>
            <p>A 100 m swim in a 25 m pool has four wall pushes; in a 50 m pool it has one. Every push-off is a speed boost, so fewer walls means slower times — that is why LCM times are slower than SCM, and why SCY (25 yd) is fastest of all: shorter lanes and more walls, plus yards being shorter than meters.</p>
            <h2 className="text-2xl font-bold mb-3">The Conversion Factors</h2>
            <p>USA Swimming's published factors convert by event distance: sprints scale the most (turns dominate short races), distance events the least. This calculator applies the standard buckets — sprint, middle, distance — so a 200 free converts differently from a 100 free.</p>
            <h2 className="text-2xl font-bold mb-3">Using Converted Times</h2>
            <p>Conversions are best for targets and comparisons: "I need a 2:00 in SCY to project about a 2:10 in LCM." They are averages, not predictions — individual turn skill changes the real ratio. Official records always require swimming the actual course.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/swimming-time-conversion" />
          <PopularCalculators exclude="/calculator/swimming-time-conversion" />
        </div>
      </div>
    </>
  );
}
