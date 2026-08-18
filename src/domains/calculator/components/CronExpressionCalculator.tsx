"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CronResult {
  expression: string;
  nextRuns: Date[];
  runsPerDay: number;
  fields: { name: string; value: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function parseField(expr: string, min: number, max: number): Set<number> | null {
  const values = new Set<number>();
  const parts = expr.split(",");
  for (const part of parts) {
    if (part === "*") {
      for (let v = min; v <= max; v++) values.add(v);
      continue;
    }
    const m = part.match(/^(\d+|\*)(?:-(\d+|\*))?(?:\/(\d+))?$/);
    if (!m) return null;
    const start = m[1] === "*" ? min : parseInt(m[1], 10);
    const endRaw = m[2] === undefined ? start : m[2] === "*" ? max : parseInt(m[2], 10);
    const step = m[3] ? parseInt(m[3], 10) : 1;
    if (step < 1 || start < min || endRaw > max || start > endRaw) return null;
    for (let v = start; v <= endRaw; v += step) values.add(v);
  }
  return values.size ? values : null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function calcCron(expression: string, count: number, start: Date): CronResult | null {
  const tokens = expression.trim().split(/\s+/);
  if (tokens.length !== 5) return null;
  const minutes = parseField(tokens[0], 0, 59);
  const hours = parseField(tokens[1], 0, 23);
  const dom = parseField(tokens[2], 1, 31);
  const months = parseField(tokens[3], 1, 12);
  const dow = parseField(tokens[4], 0, 6);
  if (!minutes || !hours || !dom || !months || !dow) return null;

  const nextRuns: Date[] = [];
  const cursor = new Date(start);
  cursor.setSeconds(0, 0);
  let guard = 0;
  while (nextRuns.length < count && guard < 100000) {
    guard++;
    const y = cursor.getFullYear();
    const mo = cursor.getMonth() + 1;
    const d = cursor.getDate();
    const dowNum = cursor.getDay();
    const domMatch = dom.has(d);
    const dowMatch = dow.has(dowNum);
    const dayMatch = tokens[2] === "*" || tokens[4] === "*" ? (domMatch || dowMatch) : domMatch && dowMatch;
    if (months.has(mo) && dayMatch && hours.has(cursor.getHours()) && minutes.has(cursor.getMinutes())) {
      nextRuns.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  // Estimate runs per day by counting matches over a 7-day window
  let runsPerDay = 0;
  const win = new Date(start);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  while (win.getTime() < end.getTime()) {
    const y = win.getFullYear();
    const mo = win.getMonth() + 1;
    const d = win.getDate();
    const domMatch = dom.has(d);
    const dowMatch = dow.has(win.getDay());
    const dayMatch = tokens[2] === "*" || tokens[4] === "*" ? (domMatch || dowMatch) : domMatch && dowMatch;
    if (months.has(mo) && dayMatch && hours.has(win.getHours()) && minutes.has(win.getMinutes())) runsPerDay++;
    win.setMinutes(win.getMinutes() + 1);
  }
  runsPerDay = Math.round((runsPerDay / 7) * 100) / 100;

  const fields = [
    { name: "Minute", value: tokens[0] },
    { name: "Hour", value: tokens[1] },
    { name: "Day of Month", value: tokens[2] },
    { name: "Month", value: tokens[3] },
    { name: "Day of Week", value: tokens[4] },
  ];
  const breakdown = [
    ...fields.map(f => ({ label: `Field — ${f.name}`, value: f.value })),
    { label: "Next Run", value: nextRuns.length ? fmtDateTime(nextRuns[0]) : "None found" },
    { label: "Runs per Day (avg)", value: `${runsPerDay}` },
    ...nextRuns.slice(0, 5).map((r, i) => ({ label: `Run ${i + 1}`, value: fmtDateTime(r) })),
  ];
  const summaryStats = [
    { label: "Next Run", value: nextRuns.length ? fmtDateTime(nextRuns[0]) : "—" },
    { label: "Runs per Day", value: `${runsPerDay}` },
    { label: "Minute", value: tokens[0] },
    { label: "Hour", value: tokens[1] },
    { label: "Day of Month", value: tokens[2] },
    { label: "Month", value: tokens[3] },
    { label: "Day of Week", value: tokens[4] },
    { label: "Format", value: "5-field standard cron" },
  ];
  const chartData = nextRuns.slice(0, 5).map((r, i) => ({
    name: `Run ${i + 1}`,
    value: r.getHours() + r.getMinutes() / 60,
    fill: i === 0 ? "hsl(var(--primary))" : "#10b981",
  }));
  return { expression, nextRuns, runsPerDay, fields, breakdown, summaryStats, chartData };
}

const DEFAULTS = { expression: "0 9 * * 1-5", count: "5" };

export default function CronExpressionCalculator() {
  const [expression, setExpression] = useState(DEFAULTS.expression);
  const [count, setCount] = useState(DEFAULTS.count);
  const [showAdv, setShowAdv] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [result, setResult] = useState<CronResult | null>(null);

  const n = Math.max(1, Math.min(20, parseInt(count) || 5));
  const [err, setErr] = useState("");
  const valid = !err;

  const calculate = () => {
    const s = new Date(`${startDate}T00:00:00`);
    if (isNaN(s.getTime())) { setErr("Enter a valid start date."); setResult(null); return; }
    const r = calcCron(expression, n, s);
    if (!r) { setErr("Invalid cron expression. Use 5 fields: minute hour day-of-month month day-of-week (e.g. 0 9 * * 1-5)."); setResult(null); return; }
    setErr("");
    setResult(r);
  };
  const reset = () => {
    setExpression(DEFAULTS.expression); setCount(DEFAULTS.count);
    const d = new Date();
    setStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    setErr("");
    setResult(calcCron("0 9 * * 1-5", 5, new Date()));
  };
  useEffect(() => { setResult(calcCron("0 9 * * 1-5", 5, new Date())); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a cron expression?", answer: "A cron expression schedules recurring jobs using five fields: minute, hour, day of month, month, and day of week. For example, '0 9 * * 1-5' runs at 9:00 AM Monday through Friday. It is the standard scheduler syntax on Linux, macOS, and most CI/CD platforms." },
    { question: "What do the special characters mean?", answer: "An asterisk (*) matches every value. A range (1-5) matches within it. A list (1,15) matches any listed value. A step (/2) skips values — '*/15' in the minute field means every 15 minutes. '?' is sometimes used in place of * in tools like Quartz and AWS." },
    { question: "How is day-of-month vs day-of-week handled?", answer: "In standard cron, if both fields are restricted, a run happens when EITHER matches. If one is an asterisk, only the other restricts. This calculator follows that standard Vixie-cron behavior." },
    { question: "Where are cron expressions used?", answer: "System cron jobs (backups, log rotation), CI/CD pipelines (nightly builds, scheduled deploys), serverless schedulers (AWS EventBridge, Google Cloud Scheduler), and database maintenance windows. Knowing the next-fire time is essential for testing and debugging." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Cron Expression Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Cron Expression Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Cron Expression</label>
              <div className={inp}><input type="text" value={expression} onChange={e => setExpression(e.target.value)} placeholder="0 9 * * 1-5" className={ci} /></div>
              <p className="text-[11px] text-muted-foreground mt-1">5 fields: minute hour day-of-month month day-of-week</p>
            </div>
            <div>
              <label className={lbl}>Number of Runs</label>
              <div className={inp}><input type="number" min="1" max="20" value={count} onChange={e => setCount(e.target.value)} className={ci.replace("font-mono", "")} /></div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Start Window</div>
                  <div>
                    <label className={lbl}>Start From Date</label>
                    <div className={inp}><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${ci} cursor-pointer`} /></div>
                  </div>
                </div>
              </div>
            )}
            {err && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{err}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.nextRuns.length > 0 && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Next Run</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtDateTime(result.nextRuns[0])}</div>
                <div className="text-sm text-muted-foreground mt-1 font-mono">{result.expression}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Runs per Day", `${result.runsPerDay}`], ["Runs Shown", `${result.nextRuns.length}`], ["Next (Day)", `${DAYS[result.nextRuns[0].getDay()]} ${result.nextRuns[0].getHours()}:${String(result.nextRuns[0].getMinutes()).padStart(2, "0")}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Schedule Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Next Runs — Hour of Day</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 24]} tickFormatter={v => `${String(Math.floor(v)).padStart(2, "0")}:00`} />
                    <Tooltip formatter={(v: number) => [`${String(Math.floor(v)).padStart(2, "0")}:${String(Math.round((v % 1) * 60)).padStart(2, "0")}`, "Hour"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold font-mono text-sm pt-0.5">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Cron Syntax</h2>
            <p>A cron expression has five space-separated fields: minute (0–59), hour (0–23), day of month (1–31), month (1–12), and day of week (0–6, Sunday = 0). This <strong>cron expression calculator</strong> parses the expression, validates it, and computes the exact next run times.</p>
            <h2 className="text-2xl font-bold mb-3">Wildcards, Ranges, and Steps</h2>
            <p>* matches every value · 1-5 matches a range · 1,15 matches a list · */15 matches every 15th value · 1-30/5 matches 1, 6, 11, 16, 21, 26. Common examples: '0 0 * * *' daily at midnight, '*/10 * * * *' every 10 minutes, '0 2 * * 0' every Sunday at 2 AM.</p>
            <h2 className="text-2xl font-bold mb-3">Day-of-Month and Day-of-Week</h2>
            <p>Standard cron treats a match as running when either the day-of-month OR day-of-week condition matches, unless one field is an asterisk — in which case the other field governs. Verify your intent: '0 0 1 * 1' runs on the 1st of the month AND on every Monday.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cron-expression-calculator" />
          <PopularCalculators exclude="/calculator/cron-expression-calculator" />
        </div>
      </div>
    </>
  );
}
