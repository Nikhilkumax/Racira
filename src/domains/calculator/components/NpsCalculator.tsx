"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NpsResult {
  corpus: number;
  ownContrib: number;
  employerContrib: number;
  totalContrib: number;
  gains: number;
  lumpSum: number;
  annuityFund: number;
  monthlyPension: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; corpus: number; contributed: number }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

function calcNps(age: number, retireAge: number, ownMonthly: number, employerMonthly: number, expected: number, annuityRate: number): NpsResult {
  const years = retireAge - age;
  const months = years * 12;
  const r = expected / 100 / 12;
  const ownContrib = ownMonthly * months;
  const employerContrib = employerMonthly * months;
  const totalContrib = ownContrib + employerContrib;
  const monthly = ownMonthly + employerMonthly;
  let corpus = 0;
  if (r > 0) corpus = monthly * ((Math.pow(1 + r, months) - 1) / r);
  else corpus = monthly * months;
  const gains = corpus - totalContrib;
  const lumpSum = corpus * 0.6;
  const annuityFund = corpus * 0.4;
  const monthlyPension = annuityFund * (annuityRate / 100 / 12);
  const breakdown = [
    { label: "Current Age", value: `${age} years` },
    { label: "Retirement Age", value: `${retireAge} years` },
    { label: "Years to Retirement", value: `${years} years` },
    { label: "Monthly Contribution (self)", value: money(ownMonthly) },
    { label: "Monthly Contribution (employer)", value: money(employerMonthly) },
    { label: "Expected Annual Return", value: `${fmt(expected)}%` },
    { label: "Total Contributions", value: money(totalContrib) },
    { label: "Estimated Corpus at Retirement", value: money(corpus) },
    { label: "Lump Sum Withdrawal (60%)", value: money(lumpSum) },
    { label: "Annuity Purchase (40%)", value: money(annuityFund) },
    { label: "Estimated Monthly Pension", value: money(monthlyPension) },
  ];
  const summaryStats = [
    { label: "Retirement Corpus", value: money(corpus) },
    { label: "Lump Sum (60%)", value: money(lumpSum) },
    { label: "Monthly Pension", value: money(monthlyPension) },
    { label: "Contributions", value: money(totalContrib) },
    { label: "Wealth Gained", value: money(gains) },
  ];
  const chartData: { year: number; corpus: number; contributed: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const m = y * 12;
    const bal = r > 0 ? monthly * ((Math.pow(1 + r, m) - 1) / r) : monthly * m;
    chartData.push({ year: y, corpus: Number(bal.toFixed(0)), contributed: Number((monthly * m).toFixed(0)) });
  }
  return { corpus, ownContrib, employerContrib, totalContrib, gains, lumpSum, annuityFund, monthlyPension, breakdown, summaryStats, chartData };
}

const DEFAULTS = { age: "30", retire: "60", own: "5000", emp: "5000", ret: "10", annuity: "6" };

export default function NpsCalculator() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [retire, setRetire] = useState(DEFAULTS.retire);
  const [own, setOwn] = useState(DEFAULTS.own);
  const [emp, setEmp] = useState(DEFAULTS.emp);
  const [ret, setRet] = useState(DEFAULTS.ret);
  const [annuity, setAnnuity] = useState(DEFAULTS.annuity);
  const [result, setResult] = useState<NpsResult | null>(null);

  const a = parseFloat(age);
  const rt = parseFloat(retire);
  const o = parseFloat(own);
  const e = parseFloat(emp);
  const rr = parseFloat(ret);
  const ar = parseFloat(annuity);
  const errs: string[] = [];
  if (!a || a < 18 || a > 65) errs.push("Current age must be between 18 and 65.");
  if (!rt || rt <= a || rt > 75) errs.push("Retirement age must be above current age and at most 75.");
  if (isNaN(o) || o < 0) errs.push("Monthly contribution must be 0 or greater.");
  if (isNaN(e) || e < 0) errs.push("Employer contribution must be 0 or greater.");
  if (isNaN(rr) || rr < 0) errs.push("Expected return must be 0 or greater.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcNps(a, rt, o, e, rr, ar || 6)); };
  const reset = () => {
    setAge(DEFAULTS.age); setRetire(DEFAULTS.retire); setOwn(DEFAULTS.own); setEmp(DEFAULTS.emp); setRet(DEFAULTS.ret); setAnnuity(DEFAULTS.annuity);
    setResult(calcNps(30, 60, 5000, 5000, 10, 6));
  };
  useEffect(() => { setResult(calcNps(30, 60, 5000, 5000, 10, 6)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the National Pension System?", answer: "India's government-backed retirement scheme. Subscribers contribute monthly (mandatory for most government employees, voluntary for others); contributions grow in a mix of equity and debt funds, and at retirement 60% is withdrawn tax-free as a lump sum while 40% must buy an annuity." },
    { question: "What tax benefits does NPS offer?", answer: "Under Section 80C, employee contributions up to ₹1.5 lakh are deductible; the employer's contribution up to 14% of basic salary (10% for non-government) is deductible under 80CCD(2). The 60% lump sum withdrawal is tax-free; the annuity is taxed when received." },
    { question: "How is the corpus estimated?", answer: "Monthly contributions grow at your expected annual return, compounded monthly, until retirement. The calculator assumes contributions continue unchanged — real-world growth varies with equity/debt allocation, which you can approximate by adjusting the expected return." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "NPS Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">NPS Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Current Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} className={inp} placeholder="30" />
              </div>
              <div>
                <label className={lbl}>Retirement Age</label>
                <input type="number" value={retire} onChange={e => setRetire(e.target.value)} className={inp} placeholder="60" />
              </div>
              <div>
                <label className={lbl}>Monthly Contribution (₹)</label>
                <input type="number" value={own} onChange={e => setOwn(e.target.value)} className={inp} placeholder="5000" />
              </div>
              <div>
                <label className={lbl}>Employer Contribution (₹)</label>
                <input type="number" value={emp} onChange={e => setEmp(e.target.value)} className={inp} placeholder="5000" />
              </div>
              <div>
                <label className={lbl}>Expected Return (%/yr)</label>
                <input type="number" value={ret} onChange={e => setRet(e.target.value)} className={inp} placeholder="10" />
              </div>
              <div>
                <label className={lbl}>Annuity Rate (%/yr)</label>
                <input type="number" value={annuity} onChange={e => setAnnuity(e.target.value)} className={inp} placeholder="6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Assumes 60% lump sum + 40% annuity at retirement. Equity-heavy allocations historically return 9–12%.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Retirement Corpus</div>
                <div className="text-4xl font-extrabold tracking-tight">{money(result.corpus)}</div>
                <div className="text-sm text-muted-foreground mt-1">Lump sum {money(result.lumpSum)} · monthly pension ≈ {money(result.monthlyPension)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Corpus", money(result.corpus)], ["Lump Sum (60%)", money(result.lumpSum)], ["Monthly Pension", money(result.monthlyPension)]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-4">Corpus vs Contributions Over Time</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="npsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [money(v), ""]} labelFormatter={(l) => `Age ${parseFloat(DEFAULTS.age) + (typeof l === "number" ? l : 0)}`} />
                    <Area type="monotone" dataKey="corpus" name="Corpus" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#npsGrad)" />
                    <Area type="monotone" dataKey="contributed" name="Contributed" stroke="#f59e0b" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The gap between the lines is compounding growth</p>
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
            <h2 className="text-2xl font-bold mb-3">India's Pension Answer</h2>
            <p>The <strong>National Pension System</strong> builds a retirement corpus through disciplined monthly contributions invested across equity and debt. This <strong>NPS calculator</strong> projects the corpus at retirement and splits it the way NPS does: 60% tax-free lump sum, 40% annuity.</p>
            <h2 className="text-2xl font-bold mb-3">The Projection</h2>
            <p>Your monthly contribution plus your employer's grows at the expected annual return, compounded monthly over the years to retirement. The chart separates your contributions from the corpus so the power of compounding — and the value of starting early — is unmistakable.</p>
            <h2 className="text-2xl font-bold mb-3">The Retirement Split</h2>
            <p>At maturity, 60% of the corpus is yours tax-free; the remaining 40% buys an annuity that pays a monthly pension for life at the annuity rate you select. Raising the expected return shows how allocation choices ripple into retirement income.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/nps-calculator" />
          <PopularCalculators exclude="/calculator/nps-calculator" />
        </div>
      </div>
    </>
  );
}
