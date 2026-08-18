"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OtResult {
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  overtimeHours: number;
  effectiveRate: number;
  overtimeRate: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function calcOt(rate: number, regularHours: number, overtimeHours: number, multiplier: number): OtResult {
  const regularPay = rate * regularHours;
  const overtimePay = rate * multiplier * overtimeHours;
  const totalPay = regularPay + overtimePay;
  const effectiveRate = totalPay / Math.max(1, regularHours + overtimeHours);
  const breakdown = [
    { label: "Hourly Rate", value: money(rate) },
    { label: "Regular Hours", value: `${fmt(regularHours, 0)} h` },
    { label: "Overtime Hours", value: `${fmt(overtimeHours, 0)} h` },
    { label: "Overtime Multiplier", value: `${fmt(multiplier)}×` },
    { label: "Overtime Rate", value: money(rate * multiplier) },
    { label: "Regular Pay", value: money(regularPay) },
    { label: "Overtime Pay", value: money(overtimePay) },
    { label: "Total Pay", value: money(totalPay) },
    { label: "Effective Hourly Rate", value: money(effectiveRate) },
  ];
  const summaryStats = [
    { label: "Total Pay", value: money(totalPay) },
    { label: "Overtime Pay", value: money(overtimePay) },
    { label: "Regular Pay", value: money(regularPay) },
    { label: "Overtime Rate", value: money(rate * multiplier) },
    { label: "Effective Rate", value: money(effectiveRate) },
  ];
  const chartData = [
    { name: "Regular Pay", value: Number(regularPay.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Overtime Pay", value: Number(overtimePay.toFixed(0)), fill: "#f59e0b" },
  ];
  return { regularPay, overtimePay, totalPay, overtimeHours, effectiveRate, overtimeRate: rate * multiplier, breakdown, summaryStats, chartData };
}

const DEFAULTS = { rate: "20", reg: "40", ot: "8", mult: "1.5" };

export default function OvertimeCalculator() {
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [reg, setReg] = useState(DEFAULTS.reg);
  const [ot, setOt] = useState(DEFAULTS.ot);
  const [mult, setMult] = useState(DEFAULTS.mult);
  const [result, setResult] = useState<OtResult | null>(null);

  const r = parseFloat(rate);
  const rg = parseFloat(reg);
  const o = parseFloat(ot);
  const m = parseFloat(mult);
  const errs: string[] = [];
  if (!r || r <= 0) errs.push("Hourly rate must be greater than 0.");
  if (isNaN(rg) || rg < 0) errs.push("Regular hours must be 0 or greater.");
  if (isNaN(o) || o < 0) errs.push("Overtime hours must be 0 or greater.");
  if (!m || m <= 1) errs.push("Overtime multiplier must be greater than 1.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcOt(r, rg, o, m)); };
  const reset = () => {
    setRate(DEFAULTS.rate); setReg(DEFAULTS.reg); setOt(DEFAULTS.ot); setMult(DEFAULTS.mult);
    setResult(calcOt(20, 40, 8, 1.5));
  };
  useEffect(() => { setResult(calcOt(20, 40, 8, 1.5)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is overtime pay calculated?", answer: "Hours beyond 40 in a workweek are paid at 1.5× the regular rate under the FLSA: overtime pay = rate × multiplier × overtime hours. Some states mandate double time (2×) for long shifts or seventh-day work." },
    { question: "What counts as overtime?", answer: "Under federal law, nonexempt employees earn overtime for hours worked over 40 in a week. Hours worked include time the employer requires you to be on duty — even training, travel between sites, and waiting time." },
    { question: "What is the effective hourly rate?", answer: "Total pay divided by all hours worked. It sits between your regular rate and your overtime rate and is the honest number for comparing jobs — a job with more mandated overtime can beat a nominally higher hourly wage." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Overtime Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Overtime Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Hourly Rate ($)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} className={inp} placeholder="20" />
              </div>
              <div>
                <label className={lbl}>Regular Hours</label>
                <input type="number" value={reg} onChange={e => setReg(e.target.value)} className={inp} placeholder="40" />
              </div>
              <div>
                <label className={lbl}>Overtime Hours</label>
                <input type="number" value={ot} onChange={e => setOt(e.target.value)} className={inp} placeholder="8" />
              </div>
              <div>
                <label className={lbl}>Overtime Multiplier</label>
                <select value={mult} onChange={e => setMult(e.target.value)} className={inp}>
                  <option value="1.5">1.5× (time and a half)</option>
                  <option value="2">2× (double time)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">FLSA standard: 1.5× for hours beyond 40 in a week. Some states require 2× for long shifts.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Pay</div>
                <div className="text-4xl font-extrabold tracking-tight">{money(result.totalPay)}</div>
                <div className="text-sm text-muted-foreground mt-1">{money(result.overtimePay)} overtime on {fmt(result.overtimeHours, 0)} h @ {money(result.overtimeRate)}/h</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Regular Pay", money(result.regularPay)], ["Overtime Pay", money(result.overtimePay)], ["Effective Rate", money(result.effectiveRate)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Regular vs Overtime Pay</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [money(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Overtime hours earn more per hour — the bar shows the split</p>
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
            <h2 className="text-2xl font-bold mb-3">Time and a Half, Made Clear</h2>
            <p>After 40 hours, the Fair Labor Standards Act requires most workers be paid 1.5× their regular rate. This <strong>overtime calculator</strong> separates regular and overtime pay, adds them up, and shows the effective hourly rate for the whole week.</p>
            <h2 className="text-2xl font-bold mb-3">The Math</h2>
            <p>Regular pay is rate × regular hours; overtime pay is rate × multiplier × overtime hours. With a $20 rate, 40 regular and 8 overtime hours at 1.5×: $800 + $240 = $1,040 for 48 hours — an effective rate of $21.67.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Effective Rate Matters</h2>
            <p>Comparing jobs by hourly wage alone ignores overtime reality. A $19 job with guaranteed 10 overtime hours can out-earn a $21 job that stays at 40. The effective rate is the number to compare.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/overtime-calculator" />
          <PopularCalculators exclude="/calculator/overtime-calculator" />
        </div>
      </div>
    </>
  );
}
