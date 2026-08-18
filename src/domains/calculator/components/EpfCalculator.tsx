"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface EpfResult {
  basic: number;
  empPct: number;
  empShare: number;
  epsShare: number;
  employerEpf: number;
  monthlyTotal: number;
  years: number;
  rate: number;
  epsCap: number;
  totalContributions: number;
  interestEarned: number;
  corpus: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; corpus: number }[];
}

function fmtRs(v: number): string {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function calcEpf(basic: number, empPct: number, years: number, rate: number, epsCap: number): EpfResult {
  const empShare = basic * (empPct / 100);
  const epsShare = Math.min(basic, epsCap) * (8.33 / 100);
  const employerEpf = basic * 0.12 - epsShare;
  const monthlyTotal = empShare + employerEpf;

  let balance = 0;
  const chartData: { year: number; corpus: number }[] = [];
  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + rate / 100) + 12 * monthlyTotal;
    chartData.push({ year: y, corpus: Math.round(balance) });
  }
  const totalContributions = 12 * monthlyTotal * years;
  const interestEarned = balance - totalContributions;
  const corpus = balance;

  const breakdown = [
    { label: "Monthly Basic + DA", value: fmtRs(basic) },
    { label: "Employee Contribution", value: `${empPct}% → ${fmtRs(empShare)}/mo` },
    { label: "Employer EPF Share", value: fmtRs(employerEpf) + "/mo" },
    { label: "Employer EPS Share", value: fmtRs(epsShare) + "/mo (8.33% capped)" },
    { label: "Total Monthly EPF", value: fmtRs(monthlyTotal) },
    { label: "Investment Period", value: `${years} years` },
    { label: "Total Contributions", value: fmtRs(totalContributions) },
    { label: "Interest Earned", value: fmtRs(interestEarned) },
    { label: "EPF Corpus at Retirement", value: fmtRs(corpus) },
  ];
  const summaryStats = [
    { label: "Corpus at Retirement", value: fmtRs(corpus) },
    { label: "Total Contributions", value: fmtRs(totalContributions) },
    { label: "Interest Earned", value: fmtRs(interestEarned) },
    { label: "Monthly EPF", value: fmtRs(monthlyTotal) },
    { label: "Employee Share", value: fmtRs(empShare) },
    { label: "Employer EPF", value: fmtRs(employerEpf) },
    { label: "EPS Share", value: fmtRs(epsShare) },
    { label: "Interest Rate", value: `${rate}%` },
  ];
  return { basic, empPct, empShare, epsShare, employerEpf, monthlyTotal, years, rate, epsCap, totalContributions, interestEarned, corpus, breakdown, summaryStats, chartData };
}

const DEFAULTS = { basic: "50000", empPct: "12", years: "20", rate: "8.25", epsCap: "15000" };

export default function EpfCalculator() {
  const [basic, setBasic] = useState(DEFAULTS.basic);
  const [empPct, setEmpPct] = useState(DEFAULTS.empPct);
  const [years, setYears] = useState(DEFAULTS.years);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [epsCap, setEpsCap] = useState(DEFAULTS.epsCap);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<EpfResult | null>(null);

  const bs = parseFloat(basic) || 0;
  const ep = parseFloat(empPct) || 0;
  const yr = parseInt(years) || 0;
  const rt = parseFloat(rate) || 0;
  const cap = parseFloat(epsCap) || 0;
  const errs: string[] = [];
  if (bs <= 0) errs.push("Monthly basic + DA must be greater than 0.");
  if (ep < 0 || ep > 100) errs.push("Employee contribution must be between 0% and 100%.");
  if (yr < 1 || yr > 45) errs.push("Years to retirement must be 1–45.");
  if (rt < 0 || rt > 20) errs.push("Interest rate must be between 0% and 20%.");
  if (cap <= 0) errs.push("EPS wage ceiling must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcEpf(bs, ep, yr, rt, cap)); };
  const reset = () => {
    setBasic(DEFAULTS.basic); setEmpPct(DEFAULTS.empPct); setYears(DEFAULTS.years); setRate(DEFAULTS.rate); setEpsCap(DEFAULTS.epsCap);
    setResult(calcEpf(50000, 12, 20, 8.25, 15000));
  };
  useEffect(() => { setResult(calcEpf(50000, 12, 20, 8.25, 15000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is EPF interest calculated?", answer: "Interest is credited annually on the EPF balance, declared each financial year (8.25% for FY 2024-25). Contributions are assumed to earn that rate compounded yearly in this calculator." },
    { question: "What is the EPS component?", answer: "Of the employer's 12% contribution, 8.33% of basic salary (capped at the EPS wage ceiling, ₹15,000) goes to the Employees' Pension Scheme; the remainder goes to your EPF account." },
    { question: "Can I withdraw the full corpus at retirement?", answer: "At age 58 (or 55 in some cases) you can withdraw the full EPF balance plus interest. Withdrawals for retirement are tax-exempt; earlier withdrawals may be taxable." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "EPF Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">EPF Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Monthly Basic + DA</label>
                <div className={inp}><input type="number" value={basic} onChange={e => setBasic(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
              </div>
              <div>
                <label className={lbl}>Employee Contribution</label>
                <div className={inp}><input type="number" value={empPct} onChange={e => setEmpPct(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Years to Retirement</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
              <div>
                <label className={lbl}>EPF Interest Rate</label>
                <div className={inp}><input type="number" step="0.05" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Statutory Details</div>
                  <div>
                    <label className={lbl}>EPS Wage Ceiling</label>
                    <div className={inp}><input type="number" value={epsCap} onChange={e => setEpsCap(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹/mo</span></div>
                    <p className="text-xs text-muted-foreground mt-1.5">8.33% of basic up to this ceiling funds the pension scheme; the balance of the employer's 12% goes to EPF.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">EPF Corpus at Retirement</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtRs(result.corpus)}</div>
                <div className="text-sm text-muted-foreground mt-1">₹{Math.round(result.monthlyTotal).toLocaleString("en-IN")}/mo saved · {result.years} years at {result.rate}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Total Contributions`, fmtRs(result.totalContributions)], ["Interest Earned", fmtRs(result.interestEarned)], ["Monthly EPF", fmtRs(result.monthlyTotal)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Contribution Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Corpus Growth</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(v: number) => [fmtRs(v), "Corpus"]} labelFormatter={(l: number) => `Year ${l}`} />
                    <Area type="monotone" dataKey="corpus" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="hsl(var(--primary) / 0.15)" />
                  </AreaChart>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How EPF Works</h2>
            <p>Under the Employees' Provident Fund scheme, you contribute 12% of basic salary and DA, and your employer matches it. Of the employer's 12%, 8.33% of basic (capped at ₹15,000) funds the Employees' Pension Scheme, with the remainder credited to your EPF account. This <strong>EPF calculator</strong> compounds both shares at the declared annual interest rate.</p>
            <h2 className="text-2xl font-bold mb-3">Interest and Tax</h2>
            <p>Interest is declared each financial year and credited annually. Contributions, interest, and the final corpus are tax-exempt under Section 80C and the EEE regime, provided the account has been active for five years.</p>
            <h2 className="text-2xl font-bold mb-3">Building the Corpus</h2>
            <p>The longer you stay in the scheme, the more compounding does the work — a 30-year horizon can triple the value of contributions alone. Voluntary contributions above 12% can accelerate growth further.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/epf-calculator" />
          <PopularCalculators exclude="/calculator/epf-calculator" />
        </div>
      </div>
    </>
  );
}
