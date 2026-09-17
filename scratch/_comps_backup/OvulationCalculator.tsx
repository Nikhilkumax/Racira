"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OvResult {
  ovulation: Date;
  nextPeriod: Date;
  windowStart: Date;
  windowEnd: Date;
  cycleLength: number;
  luteal: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDays(d: Date, days: number): Date {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

function calcOv(lmp: Date, cycleLength: number, luteal: number): OvResult {
  const nextPeriod = addDays(lmp, cycleLength);
  const ovulation = addDays(nextPeriod, -luteal);
  const windowStart = addDays(ovulation, -5);
  const windowEnd = addDays(ovulation, 1);
  const breakdown = [
    { label: "Last Menstrual Period", value: fmtDate(lmp) },
    { label: "Cycle Length", value: `${cycleLength} days` },
    { label: "Luteal Phase Length", value: `${luteal} days` },
    { label: "Predicted Ovulation", value: fmtDate(ovulation) },
    { label: "Fertile Window", value: `${fmtDate(windowStart)} – ${fmtDate(windowEnd)}` },
    { label: "Next Period (predicted)", value: fmtDate(nextPeriod) },
  ];
  const summaryStats = [
    { label: "Ovulation", value: fmtDate(ovulation) },
    { label: "Fertile Window", value: `${fmtDate(windowStart)} – ${fmtDate(windowEnd)}` },
    { label: "Next Period", value: fmtDate(nextPeriod) },
    { label: "Cycle", value: `${cycleLength} days` },
  ];
  const chartData = [
    { name: "Cycle Length", value: cycleLength, fill: "hsl(var(--primary))" },
    { name: "Ovulation Day", value: cycleLength - luteal, fill: "#f59e0b" },
    { name: "Luteal Phase", value: luteal, fill: "#10b981" },
  ];
  return { ovulation, nextPeriod, windowStart, windowEnd, cycleLength, luteal, breakdown, summaryStats, chartData };
}

const DEFAULTS = { date: "2026-08-01", cycle: "28", luteal: "14" };

export default function OvulationCalculator() {
  const [date, setDate] = useState(DEFAULTS.date);
  const [cycle, setCycle] = useState(DEFAULTS.cycle);
  const [luteal, setLuteal] = useState(DEFAULTS.luteal);
  const [result, setResult] = useState<OvResult | null>(null);

  const c = parseFloat(cycle);
  const l = parseFloat(luteal);
  const d = new Date(date);
  const errs: string[] = [];
  if (isNaN(d.getTime())) errs.push("Pick a valid last menstrual period date.");
  if (!c || c < 21 || c > 45) errs.push("Cycle length must be between 21 and 45 days.");
  if (!l || l < 10 || l > 17) errs.push("Luteal phase must be between 10 and 17 days.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcOv(d, c, l)); };
  const reset = () => {
    setDate(DEFAULTS.date); setCycle(DEFAULTS.cycle); setLuteal(DEFAULTS.luteal);
    setResult(calcOv(new Date("2026-08-01"), 28, 14));
  };
  useEffect(() => { setResult(calcOv(new Date("2026-08-01"), 28, 14)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is ovulation predicted?", answer: "Ovulation typically occurs 14 days before the next period — the luteal phase is fairly constant (10–17 days, usually 14). The calculator subtracts the luteal length from the predicted next period to find the ovulation day." },
    { question: "When is the fertile window?", answer: "Sperm can survive about five days and the egg about 24 hours, so the fertile window spans roughly five days before ovulation through the day after. The calculator highlights that span — the best days to conceive." },
    { question: "How reliable is this?", answer: "Calendar estimates work best for regular cycles and assume a stable luteal phase. Cycle length varies naturally, so combine this with ovulation test strips or temperature tracking for higher confidence." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Ovulation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ovulation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Last Menstrual Period</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Cycle Length (days)</label>
                <input type="number" value={cycle} onChange={e => setCycle(e.target.value)} className={inp} placeholder="28" />
              </div>
              <div>
                <label className={lbl}>Luteal Phase (days)</label>
                <input type="number" value={luteal} onChange={e => setLuteal(e.target.value)} className={inp} placeholder="14" />
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Predicted Ovulation</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtDate(result.ovulation)}</div>
                <div className="text-sm text-muted-foreground mt-1">Fertile window {fmtDate(result.windowStart)} – {fmtDate(result.windowEnd)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Fertile Window", `${fmtDate(result.windowStart)} – ${fmtDate(result.windowEnd)}`], ["Next Period", fmtDate(result.nextPeriod)], ["Cycle", `${result.cycleLength} days`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xs font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cycle Structure</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [v + " days", ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Ovulation lands cycle-length minus luteal days before the next period</p>
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
            <h2 className="text-2xl font-bold mb-3">Timing the Most Fertile Days</h2>
            <p>Conception is a window, not a moment: sperm survive about five days, the egg about one. This <strong>ovulation calculator</strong> predicts ovulation from your cycle and marks the fertile window — the days that matter most for conceiving.</p>
            <h2 className="text-2xl font-bold mb-3">The Calendar Method</h2>
            <p>The luteal phase — from ovulation to the next period — is remarkably consistent, typically 14 days. So ovulation falls cycle-length minus luteal days before the next period: in a 28-day cycle with a 14-day luteal phase, day 14.</p>
            <h2 className="text-2xl font-bold mb-3">Accuracy Notes</h2>
            <p>Calendar predictions assume regularity. For irregular cycles, supplement with ovulation predictor kits, basal-body-temperature tracking, or cervical-mucus observations — the calculator's date is a strong starting point, not a guarantee.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ovulation-calculator" />
          <PopularCalculators exclude="/calculator/ovulation-calculator" />
        </div>
      </div>
    </>
  );
}
