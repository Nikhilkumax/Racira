"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface EncashResult {
  mode: string;
  basic: number;
  days: number;
  years: number;
  avgSalary: number;
  gross: number;
  compA: number;
  compB: number;
  compC: number;
  compD: number;
  exempt: number;
  taxable: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtRupees(v: number): string {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function calcEncash(mode: string, basic: number, days: number, years: number, avgSalary: number): EncashResult {
  const cappedDays = Math.min(days, 300);
  const gross = (basic / 30) * cappedDays;
  // Section 10(10AA): least of the following
  const compA = gross; // actual amount received
  const compB = mode === "retirement" ? avgSalary * 10 : Infinity; // 10 months' average salary (retirement only)
  const compC = mode === "retirement" ? (basic / 30) * 30 * years : Infinity; // 30 days per completed year of service
  const compD = 2500000; // statutory cap
  const exempt = Math.min(compA, compB, compC, compD);
  const taxable = Math.max(0, gross - exempt);
  const breakdown = [
    { label: "Monthly Basic + DA", value: fmtRupees(basic) },
    { label: "Unused Leave Days", value: `${days} (capped at 300 for exemption)` },
    { label: "Completed Years of Service", value: `${years}` },
    { label: "Gross Encashment", value: fmtRupees(gross) },
    { label: "Exemption (a) Actual Amount", value: fmtRupees(compA) },
    { label: "Exemption (b) 10-Month Avg Salary", value: mode === "retirement" ? fmtRupees(compB) : "— (retirement only)" },
    { label: "Exemption (c) 30 Days per Year", value: mode === "retirement" ? fmtRupees(compC) : "— (retirement only)" },
    { label: "Exemption (d) Statutory Cap", value: fmtRupees(compD) },
    { label: "Exempt Amount", value: fmtRupees(exempt) },
    { label: "Taxable Amount", value: fmtRupees(taxable) },
  ];
  const summaryStats = [
    { label: "Gross Encashment", value: fmtRupees(gross) },
    { label: "Exempt", value: fmtRupees(exempt) },
    { label: "Taxable", value: fmtRupees(taxable) },
    { label: "Mode", value: mode === "retirement" ? "Retirement" : "Resignation" },
    { label: "Effective Tax Rate", value: `${((taxable / gross) * 100).toFixed(1)}%` },
    { label: "Monthly Salary", value: fmtRupees(basic) },
    { label: "Leave Days", value: `${days}` },
    { label: "Avg Salary (10 months)", value: fmtRupees(avgSalary) },
  ];
  const chartData = [
    { name: "Exempt", value: Math.round(exempt), fill: "hsl(var(--primary))" },
    { name: "Taxable", value: Math.round(taxable), fill: "#f59e0b" },
  ];
  return { mode, basic, days, years, avgSalary, gross, compA, compB, compC, compD, exempt, taxable, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mode: "retirement", basic: "60000", days: "300", years: "20", avg: "50000" };

export default function LeaveEncashmentCalculator() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [basic, setBasic] = useState(DEFAULTS.basic);
  const [days, setDays] = useState(DEFAULTS.days);
  const [years, setYears] = useState(DEFAULTS.years);
  const [avg, setAvg] = useState(DEFAULTS.avg);
  const [result, setResult] = useState<EncashResult | null>(null);

  const b = parseFloat(basic) || 0;
  const d = Math.round(parseFloat(days) || 0);
  const y = parseFloat(years) || 0;
  const a = parseFloat(avg) || 0;
  const errs: string[] = [];
  if (b <= 0 || d <= 0 || y <= 0 || a <= 0) errs.push("All inputs must be greater than 0.");
  if (d > 300) errs.push("Unused leave above 300 days is not exempt — the excess is fully taxable.");
  if (y > 60) errs.push("Service years look unusual — check that it is completed years (e.g. 20).");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcEncash(mode, b, d, y, a)); };
  const reset = () => {
    setMode(DEFAULTS.mode); setBasic(DEFAULTS.basic); setDays(DEFAULTS.days); setYears(DEFAULTS.years); setAvg(DEFAULTS.avg);
    setResult(calcEncash("retirement", 60000, 300, 20, 50000));
  };
  useEffect(() => { setResult(calcEncash("retirement", 60000, 300, 20, 50000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is leave encashment?", answer: "It is the payment an employee receives for earned leave not availed — typically basic salary plus dearness allowance divided by 30, multiplied by the unused days. It is paid at retirement, resignation, or on leaving a job." },
    { question: "How does the Section 10(10AA) exemption work?", answer: "The exempt amount is the least of four figures: the actual encashment, 10 months' average salary (retirement only), cash equivalent of 30 days per completed year of service (retirement only), and the statutory cap of ₹25,00,000. Only the excess over the least figure is taxable." },
    { question: "Why does resignation get a smaller exemption?", answer: "The 10-months-average and 30-days-per-year components apply only at retirement. On resignation, exemption is limited to the actual amount and the ₹25,00,000 cap, so a large balance is more likely to be partially taxed." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Leave Encashment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Leave Encashment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Scenario</label>
                <select value={mode} onChange={e => setMode(e.target.value)} className={sel}>
                  <option value="retirement">Retirement</option>
                  <option value="resignation">Resignation</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Monthly Basic + DA</label>
                <div className={inp}><input type="number" value={basic} onChange={e => setBasic(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
              </div>
              <div>
                <label className={lbl}>Unused Leave Days</label>
                <div className={inp}><input type="number" value={days} onChange={e => setDays(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Completed Years of Service</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Average Salary (10 months)</label>
                <div className={inp}><input type="number" value={avg} onChange={e => setAvg(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Taxable Leave Encashment</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtRupees(result.taxable)}</div>
                <div className="text-sm text-muted-foreground mt-1">of {fmtRupees(result.gross)} gross — {fmtRupees(result.exempt)} exempt under Section 10(10AA)</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Gross`, fmtRupees(result.gross)], ["Exempt", fmtRupees(result.exempt)], ["Taxable", fmtRupees(result.taxable)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Exemption Calculation</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 8 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 8 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Exempt vs Taxable</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => [fmtRupees(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">How the gross encashment splits between exempt and taxable</p>
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
            <h2 className="text-2xl font-bold mb-3">Computing the Encashment</h2>
            <p>This <strong>leave encashment calculator</strong> starts from monthly basic salary plus dearness allowance, divides by 30 for the daily rate, and multiplies by unused leave days — capped at 300 for exemption purposes. The result is the gross amount owed to the employee.</p>
            <h2 className="text-2xl font-bold mb-3">The Four-Part Exemption</h2>
            <p>Under Section 10(10AA), the exempt portion is the least of the actual amount, 10 months' average salary, the cash equivalent of 30 days for each completed year of service, and ₹25,00,000. At retirement all four apply; at resignation only the actual amount and the statutory cap matter.</p>
            <h2 className="text-2xl font-bold mb-3">Planning the Tax</h2>
            <p>Encashment is taxed as salary income in the year received, at your marginal slab rate. Knowing the taxable portion up front lets you plan advance tax or time the encashment across financial years when that is an option.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/leave-encashment-calculator" />
          <PopularCalculators exclude="/calculator/leave-encashment-calculator" />
        </div>
      </div>
    </>
  );
}
