"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

const DEFAULTS = { lmp: "2026-08-01", cycle: "28", period: "5" };

export default function PeriodCalculator() {
  const [lmp, setLmp] = useState(DEFAULTS.lmp);
  const [cycle, setCycle] = useState(DEFAULTS.cycle);
  const [period, setPeriod] = useState(DEFAULTS.period);
  const [calculated, setCalculated] = useState(false);

  const lmpDate = new Date(lmp + "T00:00:00");
  const c = Math.max(21, Math.min(45, Math.round(parseFloat(cycle) || 28)));
  const pd = Math.max(1, Math.min(10, Math.round(parseFloat(period) || 5)));
  const valid = !isNaN(lmpDate.getTime());

  const nextPeriod = addDays(lmpDate, c);
  const nextNext = addDays(nextPeriod, c);
  const ovulation = addDays(nextPeriod, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  const dueDate = addDays(lmpDate, 280);
  const today = new Date();
  const cycleDay = valid ? Math.min(c, ((daysBetween(lmpDate, today) % c) + c) % c + 1) : 1;
  const daysToNext = valid ? Math.max(0, daysBetween(today, nextPeriod)) : 0;

  const chartData = [
    { name: "Cycle day", value: c, fill: "hsl(var(--primary))" },
    { name: "Fertile window", value: 7, fill: "#10b981" },
    { name: "Period length", value: pd, fill: "#f59e0b" },
    { name: "Luteal phase", value: 14, fill: "#8b5cf6" },
  ];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setLmp(DEFAULTS.lmp); setCycle(DEFAULTS.cycle); setPeriod(DEFAULTS.period); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is the ovulation day estimated?", answer: "The luteal phase — from ovulation to the next period — is remarkably consistent at about 14 days for most people. Counting back 14 days from the predicted next period estimates ovulation; the fertile window spans the 5 days before it plus ovulation day itself." },
    { question: "Why is the fertile window longer than one day?", answer: "Sperm can survive 3–5 days inside the reproductive tract, while the egg lives only about 24 hours after release. Intercourse in the five days before ovulation can therefore result in conception — which is exactly why the fertile window covers that span." },
    { question: "How accurate is this?", answer: "Calendar methods assume a regular cycle. If your cycle varies by more than a few days, predictions drift — this is fine for planning but not reliable as contraception. Tracking basal body temperature or ovulation tests gives much firmer ovulation dates." },
    { question: "What is the estimated due date?", answer: "Pregnancy is dated from the first day of the last menstrual period, adding 280 days (40 weeks) — the standard Naegele's rule. Conception actually happens about two weeks later; the due date is an estimate, with only about 5% of babies born exactly on it." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Period Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Period Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>First day of last period (LMP)</label>
              <input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Average cycle length (days)</label>
              <input type="number" min={21} max={45} value={cycle} onChange={e => setCycle(e.target.value)} className={inp} placeholder="28" />
            </div>
            <div>
              <label className={lbl}>Period length (days)</label>
              <input type="number" min={1} max={10} value={period} onChange={e => setPeriod(e.target.value)} className={inp} placeholder="5" />
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Estimates assume a regular cycle and a fixed 14-day luteal phase. Not a contraceptive — see the FAQ.</p>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Next Period Expected</div>
                <div className="text-2xl font-extrabold tracking-tight">{fmtDate(nextPeriod)}</div>
                <div className="text-sm text-muted-foreground mt-1">{daysToNext} days away · cycle day {cycleDay} today</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Ovulation", fmtDate(ovulation), "count back 14 days"], ["Fertile window", `${fmtDate(fertileStart)} – ${fmtDate(fertileEnd)}`, "5 days + ovulation"], ["Est. due date", fmtDate(dueDate), "LMP + 280 days"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm font-bold leading-snug">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cycle Anatomy ({c}-day cycle)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${Number(v)} days`, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The fertile window straddles ovulation — the key days for planning or avoiding pregnancy</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Upcoming Dates</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cycle length:</span><span className="font-semibold">{c} days</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Period length:</span><span className="font-semibold">{pd} days</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ovulation:</span><span className="font-semibold">{fmtDate(ovulation)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Next period:</span><span className="font-semibold">{fmtDate(nextPeriod)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Period after:</span><span className="font-semibold">{fmtDate(nextNext)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Due date (if pregnant):</span><span className="font-semibold">{fmtDate(dueDate)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Know Your Cycle, Plan Ahead</h2>
            <p>Once you know your average cycle length, the next period is simple arithmetic — and so are the dates that matter around it. This <strong>period calculator</strong> projects your next periods, ovulation day, fertile window, and a due date if you're trying to conceive.</p>
            <h2 className="text-2xl font-bold mb-3">The 14-Day Anchor</h2>
            <p>Ovulation estimates rest on one reliable fact: the luteal phase between ovulation and your next period is almost always 13–15 days, regardless of total cycle length. Counting back 14 days from the predicted period gives the best calendar-based ovulation estimate.</p>
            <h2 className="text-2xl font-bold mb-3">Plan or Conceive</h2>
            <p>Use the fertile window to time intercourse for conception, or avoid those days if you're not trying — but remember calendar methods alone are not reliable contraception. Regular cycles make predictions accurate; irregular ones call for tracking methods.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/period-calculator" />
          <PopularCalculators exclude="/calculator/period-calculator" />
        </div>
      </div>
    </>
  );
}
