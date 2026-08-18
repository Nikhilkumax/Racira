"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface FertilityResult {
  lmp: string;
  cycleLength: number;
  luteal: number;
  nextPeriod: string;
  ovulation: string;
  fertileStart: string;
  fertileEnd: string;
  cycleDay: number;
  daysUntilFertile: number;
  inWindow: boolean;
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

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function calcFertility(lmpS: string, cycle: number, luteal: number): FertilityResult {
  const today = new Date();
  const lmp = parseDate(lmpS)!;
  const nextPeriod = addDays(lmp, cycle);
  const ovulation = addDays(nextPeriod, -luteal);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  const cycleDay = daysBetween(lmp, today) % cycle + 1;
  const daysUntilFertile = daysBetween(today, fertileStart);
  const inWindow = daysBetween(today, fertileStart) <= 0 && daysBetween(today, fertileEnd) >= 0;

  const breakdown = [
    { label: "First Day of Last Period", value: fmtDate(lmp) },
    { label: "Cycle Length", value: `${cycle} days` },
    { label: "Luteal Phase", value: `${luteal} days` },
    { label: "Predicted Ovulation", value: fmtDate(ovulation) },
    { label: "Fertile Window", value: `${fmtShort(fertileStart)} – ${fmtShort(fertileEnd)}` },
    { label: "Next Period Expected", value: fmtDate(nextPeriod) },
    { label: "Cycle Day Today", value: `Day ${cycleDay} of ${cycle}` },
    { label: "Fertility Status", value: inWindow ? "In fertile window" : daysUntilFertile > 0 ? `${daysUntilFertile} days until window` : "Window passed this cycle" },
  ];
  const summaryStats = [
    { label: "Ovulation", value: fmtShort(ovulation) },
    { label: "Fertile Window", value: `${fmtShort(fertileStart)} – ${fmtShort(fertileEnd)}` },
    { label: "Next Period", value: fmtShort(nextPeriod) },
    { label: "Cycle Day", value: `Day ${cycleDay}` },
    { label: "Luteal Phase", value: `${luteal} days` },
    { label: "Cycle Length", value: `${cycle} days` },
    { label: "Window Days", value: "7 (5 before + 1 after)" },
    { label: "Status", value: inWindow ? "In window" : daysUntilFertile > 0 ? `${daysUntilFertile}d to go` : "Passed" },
  ];
  const chartData = [
    { name: "Fertile Days", value: 7, fill: "hsl(var(--primary))" },
    { name: "Non-Fertile Days", value: Math.max(1, cycle - 7), fill: "var(--border)" },
  ];
  return { lmp: fmtDate(lmp), cycleLength: cycle, luteal, nextPeriod: fmtDate(nextPeriod), ovulation: fmtDate(ovulation), fertileStart: fmtShort(fertileStart), fertileEnd: fmtShort(fertileEnd), cycleDay, daysUntilFertile, inWindow, breakdown, summaryStats, chartData };
}

const DEFAULTS = { lmp: "06/01/2026", cycle: "28", luteal: "14" };

export default function FertilityCalculator() {
  const [lmp, setLmp] = useState(DEFAULTS.lmp);
  const [cycle, setCycle] = useState(DEFAULTS.cycle);
  const [luteal, setLuteal] = useState(DEFAULTS.luteal);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<FertilityResult | null>(null);

  const cy = parseInt(cycle) || 0;
  const lu = parseInt(luteal) || 0;
  const errs: string[] = [];
  if (!parseDate(lmp)) errs.push("Enter the first day of your last period as MM/DD/YYYY.");
  else if (daysBetween(parseDate(lmp)!, new Date()) < 0) errs.push("LMP date cannot be in the future.");
  if (cy < 21 || cy > 45) errs.push("Cycle length must be between 21 and 45 days.");
  if (lu < 10 || lu > 17) errs.push("Luteal phase must be between 10 and 17 days.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcFertility(lmp, cy, lu)); };
  const reset = () => {
    setLmp(DEFAULTS.lmp); setCycle(DEFAULTS.cycle); setLuteal(DEFAULTS.luteal);
    setResult(calcFertility("06/01/2026", 28, 14));
  };
  useEffect(() => { setResult(calcFertility("06/01/2026", 28, 14)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the fertile window?", answer: "The fertile window spans the 5 days before ovulation plus the day after — sperm can survive up to 5 days in the reproductive tract, and the egg lives about 24 hours after release." },
    { question: "How is ovulation predicted?", answer: "Ovulation typically occurs about 14 days before your next period starts. This calculator predicts the next period from your cycle length, then counts back your luteal phase to find ovulation day." },
    { question: "How accurate is this?", answer: "Cycle lengths vary, so treat these dates as estimates. Tracking basal temperature, cervical mucus, or ovulation test strips can confirm the actual window." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Fertility Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Fertility Calculator</h1>
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
                    <label className={lbl}>Luteal Phase Length</label>
                    <div className={inp}><input type="number" value={luteal} onChange={e => setLuteal(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">days</span></div>
                    <p className="text-xs text-muted-foreground mt-1.5">The days from ovulation to the next period — usually 14, but 10–16 is normal.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Fertile Window</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.fertileStart} – {result.fertileEnd}</div>
                <div className="text-sm text-muted-foreground mt-1">Ovulation ~{result.ovulation.split(", ")[0] === result.fertileStart.split(", ")[0] ? result.ovulation : result.ovulation} · {result.inWindow ? "You are in your fertile window" : result.daysUntilFertile > 0 ? `${result.daysUntilFertile} days until it opens` : "Window passed this cycle"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Predicted Ovulation`, result.ovulation.split(", 20")[0]], ["Next Period", result.nextPeriod.split(", 20")[0]], ["Cycle Day", `Day ${result.cycleDay}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cycle Timeline</h3>
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
                <h3 className="text-base font-bold mb-4">Cycle Days</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} days`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Fertile vs non-fertile days per cycle</p>
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
            <h2 className="text-2xl font-bold mb-3">Finding Your Fertile Window</h2>
            <p>This <strong>fertility calculator</strong> predicts ovulation by counting back the luteal phase from your expected next period — ovulation happens about 14 days before menstruation in a typical cycle. The fertile window extends 5 days before ovulation through 1 day after, covering sperm survival and egg viability.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Window Is Six to Seven Days</h2>
            <p>Sperm can remain fertile inside the reproductive tract for up to 5 days, while the released egg survives only about 24 hours. That asymmetry is why conception is most likely when intercourse happens in the days leading up to ovulation, not on ovulation day itself.</p>
            <h2 className="text-2xl font-bold mb-3">Confirming with Tracking</h2>
            <p>Cycle lengths shift month to month. Basal body temperature rises after ovulation, cervical mucus becomes clear and stretchy beforehand, and LH test strips surge 24–48 hours before release — combine a couple of these methods for the most reliable window.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fertility-calculator" />
          <PopularCalculators exclude="/calculator/fertility-calculator" />
        </div>
      </div>
    </>
  );
}
