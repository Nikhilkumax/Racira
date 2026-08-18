"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DueDateResult {
  lmp: string;
  cycleLength: number;
  conception: string;
  dueDate: string;
  dueDateShort: string;
  weeks: number;
  remDays: number;
  trimester: string;
  daysPregnant: number;
  daysUntilDue: number;
  progressPct: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function parseDate(s: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const month = parseInt(m[1], 10), day = parseInt(m[2], 10), year = parseInt(m[3], 10);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function calcDueDate(lmpS: string, cycle: number, conceptionS: string): DueDateResult {
  const today = new Date();
  const lmp = parseDate(lmpS);
  const conception = parseDate(conceptionS);
  const edd = conception ? addDays(conception, 266) : addDays(lmp!, 280 + (cycle - 28));

  const daysPregnant = Math.max(0, daysBetween(lmp!, today));
  const weeks = Math.floor(daysPregnant / 7);
  const remDays = daysPregnant % 7;
  const trimester = weeks < 14 ? "First Trimester" : weeks < 27 ? "Second Trimester" : "Third Trimester";
  const daysUntilDue = daysBetween(today, edd);
  const progressPct = Math.min(100, (daysPregnant / 280) * 100);
  const conceptionEstimate = addDays(edd, -266);

  const breakdown = [
    { label: "First Day of Last Period", value: fmtDate(lmp!) },
    { label: "Cycle Length", value: `${cycle} days` },
    { label: "Estimated Conception Date", value: fmtDate(conceptionEstimate) },
    { label: "Pregnancy Length", value: "280 days (40 weeks)" },
    { label: "Estimated Due Date (Naegele)", value: fmtDate(edd) },
    { label: "Gestational Age", value: `${weeks} weeks ${remDays} days` },
    { label: "Trimester", value: trimester },
    { label: "Days Pregnant", value: `${daysPregnant} days` },
  ];
  const summaryStats = [
    { label: "Due Date", value: fmtDate(edd) },
    { label: "Conception", value: fmtDate(conceptionEstimate) },
    { label: "Gestational Age", value: `${weeks}w ${remDays}d` },
    { label: "Trimester", value: trimester },
    { label: "Days Pregnant", value: `${daysPregnant}` },
    { label: "Days Until Due", value: daysUntilDue >= 0 ? `${daysUntilDue}` : "past due" },
    { label: "Progress", value: `${progressPct.toFixed(1)}%` },
    { label: "Cycle Length", value: `${cycle} days` },
  ];
  const chartData = [
    { name: "Elapsed", value: Math.round(progressPct), fill: "hsl(var(--primary))" },
    { name: "Remaining", value: Math.round(100 - progressPct), fill: "var(--border)" },
  ];
  return { lmp: fmtDate(lmp!), cycleLength: cycle, conception: fmtDate(conceptionEstimate), dueDate: fmtDate(edd), dueDateShort: edd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), weeks, remDays, trimester, daysPregnant, daysUntilDue, progressPct, breakdown, summaryStats, chartData };
}

const DEFAULTS = { lmp: "05/15/2026", cycle: "28", conception: "" };

export default function DueDateCalculator() {
  const [lmp, setLmp] = useState(DEFAULTS.lmp);
  const [cycle, setCycle] = useState(DEFAULTS.cycle);
  const [conception, setConception] = useState(DEFAULTS.conception);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<DueDateResult | null>(null);

  const cy = parseInt(cycle) || 0;
  const errs: string[] = [];
  if (!parseDate(lmp)) errs.push("Enter the first day of your last period as MM/DD/YYYY.");
  else if (daysBetween(parseDate(lmp)!, new Date()) < 0) errs.push("LMP date cannot be in the future.");
  if (cy < 20 || cy > 45) errs.push("Cycle length must be between 20 and 45 days.");
  if (conception.trim() && !parseDate(conception)) errs.push("Conception date must be MM/DD/YYYY or blank.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDueDate(lmp, cy, conception)); };
  const reset = () => {
    setLmp(DEFAULTS.lmp); setCycle(DEFAULTS.cycle); setConception(DEFAULTS.conception);
    setResult(calcDueDate("05/15/2026", 28, ""));
  };
  useEffect(() => { setResult(calcDueDate("05/15/2026", 28, "")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is my due date calculated?", answer: "This calculator uses Naegele's Rule: 280 days (40 weeks) from the first day of your last menstrual period. The cycle-length field corrects the estimate for longer or shorter cycles." },
    { question: "Why is conception about two weeks after my period?", answer: "Ovulation typically occurs about 14 days before the next expected period, so conception usually happens roughly two weeks after the LMP. The estimate is the due date minus 266 days." },
    { question: "Will my baby be born on the exact due date?", answer: "Only about 5% of babies arrive on their exact due date. A full-term pregnancy is 37 to 42 weeks, so treat the date as an estimate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Due Date Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Due Date Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>First Day of Last Period</label>
                <div className={inp}><input value={lmp} onChange={e => setLmp(e.target.value)} placeholder="MM/DD/YYYY" className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Cycle Length</label>
                <div className={inp}><input type="number" value={cycle} onChange={e => setCycle(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">days</span></div>
              </div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Refinements</div>
                  <div>
                    <label className={lbl}>Conception Date (optional)</label>
                    <div className={inp}><input value={conception} onChange={e => setConception(e.target.value)} placeholder="MM/DD/YYYY — overrides LMP" className={ci} /></div>
                    <p className="text-xs text-muted-foreground mt-1.5">If you know the conception date, the due date is computed as conception + 266 days.</p>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Due Date</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.dueDate}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.weeks} weeks {result.remDays} days pregnant · {result.trimester}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Week ${result.weeks}`, `${result.weeks}w ${result.remDays}d`], ["Trimester", result.trimester], ["Days Until Due", result.daysUntilDue >= 0 ? `${result.daysUntilDue}` : "past due"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pregnancy Timeline</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pregnancy Progress</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">{result.progressPct.toFixed(1)}% of pregnancy completed · legend: elapsed vs remaining</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Naegele's Rule</h2>
            <p>This <strong>due date calculator</strong> estimates your due date by adding 280 days to the first day of your last menstrual period — the standard Naegele's Rule used by most clinicians. For cycles other than 28 days, the estimate shifts by the difference, and if you know your conception date, adding 266 days is the most accurate estimate.</p>
            <h2 className="text-2xl font-bold mb-3">Trimester Milestones</h2>
            <p>The first trimester (weeks 1–13) covers implantation and organ development, the second (weeks 14–26) rapid growth and movement, and the third (weeks 27–40) lung and brain maturation. Your care provider will confirm the estimate with an early ultrasound, which is most accurate between 8 and 13 weeks.</p>
            <h2 className="text-2xl font-bold mb-3">What to Expect</h2>
            <p>Less than 1 in 20 babies arrives on the exact estimated date. A normal delivery window runs from 37 to 42 weeks, so plan around the date but expect flexibility. Discuss any concerns about gestational age or growth with your healthcare provider.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/due-date-calculator" />
          <PopularCalculators exclude="/calculator/due-date-calculator" />
        </div>
      </div>
    </>
  );
}
