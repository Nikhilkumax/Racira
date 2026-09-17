"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ConceptionResult {
  dueDate: string;
  gestationalWeeks: number;
  gestationalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  trimester: string;
  dayOfPregnancy: number;
  progressPct: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function fmtDate(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function calcConception(conceptionStr: string, lengthDays: number, today: Date): ConceptionResult | null {
  const conception = new Date(conceptionStr + "T00:00:00");
  if (isNaN(conception.getTime())) return null;
  const due = addDays(conception, lengthDays);
  const daysElapsed = Math.floor((today.getTime() - conception.getTime()) / 86400000);
  const daysRemaining = Math.max(0, lengthDays - daysElapsed);
  const gestationalWeeks = Math.floor(Math.max(0, daysElapsed) / 7);
  const gestationalDays = Math.max(0, daysElapsed) % 7;
  const trimester = daysElapsed < 0 ? "Pre-conception" : daysElapsed < 91 ? "First Trimester" : daysElapsed < 196 ? "Second Trimester" : "Third Trimester";
  const progressPct = Math.min(100, Math.max(0, (daysElapsed / lengthDays) * 100));

  const breakdown = [
    { label: "Conception Date", value: fmtDate(conception) },
    { label: "Estimated Due Date", value: fmtDate(due) },
    { label: "Gestational Age", value: daysElapsed < 0 ? "Not yet conceived" : `${gestationalWeeks} weeks ${gestationalDays} days` },
    { label: "Day of Pregnancy", value: daysElapsed < 0 ? "—" : `${Math.max(0, daysElapsed)}` },
    { label: "Days Remaining", value: `${daysRemaining}` },
    { label: "Trimester", value: trimester },
    { label: "Progress", value: `${progressPct.toFixed(1)}%` },
  ];
  const summaryStats = [
    { label: "Due Date", value: fmtDate(due) },
    { label: "Gestational Age", value: `${gestationalWeeks}w ${gestationalDays}d` },
    { label: "Days Remaining", value: `${daysRemaining}` },
    { label: "Trimester", value: trimester },
    { label: "Progress", value: `${progressPct.toFixed(1)}%` },
    { label: "Conception", value: fmtDate(conception) },
  ];
  return { dueDate: fmtDate(due), gestationalWeeks, gestationalDays, daysElapsed, daysRemaining, trimester, dayOfPregnancy: Math.max(0, daysElapsed), progressPct, breakdown, summaryStats };
}

const DEFAULTS = { conception: "2026-06-01", length: "266" };

export default function ConceptionCalculator() {
  const [conception, setConception] = useState(DEFAULTS.conception);
  const [length, setLength] = useState(DEFAULTS.length);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<ConceptionResult | null>(null);
  const today = new Date();

  const len = parseInt(length) || 0;
  const c = new Date(conception + "T00:00:00");
  const errs: string[] = [];
  if (isNaN(c.getTime())) errs.push("Enter a valid conception date.");
  else if (c.getTime() > today.getTime() + 86400000) errs.push("Conception date cannot be in the future.");
  if (len < 200 || len > 320) errs.push("Pregnancy length must be between 200 and 320 days.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcConception(conception, len, today)); };
  const reset = () => {
    setConception(DEFAULTS.conception); setLength(DEFAULTS.length);
    setResult(calcConception("2026-06-01", 266, today));
  };
  useEffect(() => { setResult(calcConception("2026-06-01", 266, new Date())); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";
  const PIE_COLORS = ["hsl(var(--primary))", "#e2e8f0"];

  const faqs = [
    { question: "How is the due date calculated from conception?", answer: "Pregnancy is typically counted from the first day of the last menstrual period (LMP) — 280 days. Conception occurs about two weeks later, so the due date from conception is conception + 266 days (38 weeks)." },
    { question: "What is the difference between LMP and conception dating?", answer: "LMP dating starts at the first day of your last period (280 days to due date). Conception dating starts at fertilization (266 days to due date). They describe the same due date — LMP is just measured two weeks earlier." },
    { question: "When do trimesters start and end?", answer: "First trimester: weeks 1–13 (day 0–90). Second trimester: weeks 14–27 (day 91–195). Third trimester: weeks 28–40 (day 196 onward). Only about 4% of babies arrive exactly on the due date; most arrive within two weeks either side." },
    { question: "How accurate is a conception-based due date?", answer: "Conception dating is accurate to within a few days when the conception date is known from ovulation tracking or assisted reproduction. Ultrasound dating in the first trimester is the clinical gold standard for confirming gestational age." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Conception Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Conception Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Conception Date</label>
              <div className={inp}><input type="date" value={conception} onChange={e => setConception(e.target.value)} className={`${ci} cursor-pointer`} /></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Gestational Timing</div>
                  <div>
                    <label className={lbl}>Pregnancy Length</label>
                    <div className={inp}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">days</span></div>
                    <p className="text-[11px] text-muted-foreground mt-1">266 days (38 weeks) is standard from conception; 280 days equals LMP-based dating.</p>
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
                <div className="text-sm text-muted-foreground mt-1">{result.gestationalWeeks} weeks {result.gestationalDays} days pregnant · {result.trimester}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Gestational Age", `${result.gestationalWeeks}w ${result.gestationalDays}d`], ["Days Remaining", `${result.daysRemaining}`], ["Trimester", result.trimester.split(" ")[0]]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 1 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pregnancy Progress</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RPie>
                    <Pie data={[{ name: "Elapsed", value: result.progressPct }, { name: "Remaining", value: 100 - result.progressPct }]} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {[0, 1].map(i => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
                  </RPie>
                </ResponsiveContainer>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  <span className="font-semibold text-primary">{result.progressPct.toFixed(1)}%</span> of pregnancy complete · day {result.dayOfPregnancy} of {parseInt(length)}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">How the Due Date Is Estimated</h2>
            <p>This <strong>conception calculator</strong> estimates your due date by adding 266 days (38 weeks) to the conception date — the standard gestational length measured from fertilization. Clinicians usually quote the LMP-based date (280 days from the first day of the last period), which is the same due date counted from two weeks earlier.</p>
            <h2 className="text-2xl font-bold mb-3">What to Expect</h2>
            <p>Only about 4% of babies are born exactly on their due date. A full-term pregnancy spans 39–40 weeks (days 266–280); early term is 37–38 weeks and late term is 41 weeks. Your healthcare provider will confirm dating with an early ultrasound, which is the most accurate method.</p>
            <h2 className="text-2xl font-bold mb-3">Disclaimer</h2>
            <p>This tool provides an estimate for informational purposes only and is not medical advice. Always consult a doctor or midwife for clinical pregnancy dating, prenatal care, and any concerns about your pregnancy.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/conception-calculator" />
          <PopularCalculators exclude="/calculator/conception-calculator" />
        </div>
      </div>
    </>
  );
}
