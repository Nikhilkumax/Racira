"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MmResult {
  futureValue: number;
  contributions: number;
  interest: number;
  growthPct: number;
  apy: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; balance: number; contributed: number }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function calcMm(initial: number, monthly: number, apy: number, years: number, comp: number): MmResult {
  const r = apy / 100 / comp;
  const n = years * comp;
  // FV of initial deposit + FV of annuity of monthly contributions (monthly compounding at equivalent monthly rate)
  const monthlyRate = Math.pow(1 + apy / 100, 1 / 12) - 1;
  let fv = initial * Math.pow(1 + apy / 100, years);
  if (monthly > 0 && monthlyRate > 0) {
    fv += monthly * ((Math.pow(1 + monthlyRate, years * 12) - 1) / monthlyRate);
  } else {
    fv += monthly * years * 12;
  }
  const contributions = initial + monthly * years * 12;
  const interest = fv - contributions;
  const growthPct = contributions > 0 ? (interest / contributions) * 100 : 0;
  const chartData: { year: number; balance: number; contributed: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const t = y;
    const bal = initial * Math.pow(1 + apy / 100, t) + (monthlyRate > 0 && monthly > 0 ? monthly * ((Math.pow(1 + monthlyRate, t * 12) - 1) / monthlyRate) : monthly * t * 12);
    chartData.push({ year: y, balance: Number(bal.toFixed(0)), contributed: Number((initial + monthly * t * 12).toFixed(0)) });
  }
  const breakdown = [
    { label: "Initial Deposit", value: money(initial) },
    { label: "Monthly Contribution", value: money(monthly) },
    { label: "APY", value: `${fmt(apy)}%` },
    { label: "Compounding", value: comp === 12 ? "Monthly" : comp === 4 ? "Quarterly" : comp === 1 ? "Annually" : "Daily" },
    { label: "Term", value: `${years} years` },
    { label: "Total Contributions", value: money(contributions) },
    { label: "Interest Earned", value: money(interest) },
    { label: "Future Value", value: money(fv) },
    { label: "Growth vs Contributions", value: `+${fmt(growthPct)}%` },
  ];
  const summaryStats = [
    { label: "Future Value", value: money(fv) },
    { label: "Interest Earned", value: money(interest) },
    { label: "Contributions", value: money(contributions) },
    { label: "Growth vs Contributions", value: `+${fmt(growthPct)}%` },
    { label: "APY", value: `${fmt(apy)}%` },
  ];
  return { futureValue: fv, contributions, interest, growthPct, apy, breakdown, summaryStats, chartData };
}

const DEFAULTS = { initial: "10000", monthly: "500", apy: "4.5", years: "10", comp: "12" };

export default function MoneyMarketCalculator() {
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [apy, setApy] = useState(DEFAULTS.apy);
  const [years, setYears] = useState(DEFAULTS.years);
  const [comp, setComp] = useState(DEFAULTS.comp);
  const [result, setResult] = useState<MmResult | null>(null);

  const i0 = parseFloat(initial);
  const m = parseFloat(monthly);
  const a = parseFloat(apy);
  const y = parseFloat(years);
  const c = parseInt(comp, 10);
  const errs: string[] = [];
  if (isNaN(i0) || i0 < 0) errs.push("Initial deposit must be 0 or greater.");
  if (isNaN(m) || m < 0) errs.push("Monthly contribution must be 0 or greater.");
  if (isNaN(a) || a < 0) errs.push("APY must be 0 or greater.");
  if (!y || y <= 0 || y > 100) errs.push("Term must be between 0 and 100 years.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMm(i0, m, a, y, c)); };
  const reset = () => {
    setInitial(DEFAULTS.initial); setMonthly(DEFAULTS.monthly); setApy(DEFAULTS.apy); setYears(DEFAULTS.years); setComp(DEFAULTS.comp);
    setResult(calcMm(10000, 500, 4.5, 10, 12));
  };
  useEffect(() => { setResult(calcMm(10000, 500, 4.5, 10, 12)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a money market account?", answer: "A savings-style account at a bank or credit union that pays interest on a tiered scale — usually higher than a regular savings account because the bank invests the pooled funds in short-term, low-risk instruments." },
    { question: "What is APY and why does it matter?", answer: "APY is the effective annual return including compounding — the number that tells you what your money actually earns in a year. Two accounts with the same nominal rate can have different APYs if they compound differently." },
    { question: "How does compounding grow my balance?", answer: "Interest is credited to your balance, and the next period's interest is computed on the larger balance. With monthly contributions, the curve bends upward — early contributions do most of the work, which is why starting early beats starting big." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Money Market Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Money Market Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Initial Deposit ($)</label>
                <input type="number" value={initial} onChange={e => setInitial(e.target.value)} className={inp} placeholder="10000" />
              </div>
              <div>
                <label className={lbl}>Monthly Contribution ($)</label>
                <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={inp} placeholder="500" />
              </div>
              <div>
                <label className={lbl}>APY (%)</label>
                <input type="number" value={apy} onChange={e => setApy(e.target.value)} className={inp} placeholder="4.5" />
              </div>
              <div>
                <label className={lbl}>Term (years)</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} className={inp} placeholder="10" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Compounding Frequency</label>
                <select value={comp} onChange={e => setComp(e.target.value)} className={inp}>
                  <option value="365">Daily</option>
                  <option value="12">Monthly</option>
                  <option value="4">Quarterly</option>
                  <option value="1">Annually</option>
                </select>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Future Value</div>
                <div className="text-4xl font-extrabold tracking-tight">{money(result.futureValue)}</div>
                <div className="text-sm text-muted-foreground mt-1">{money(result.interest)} interest on {money(result.contributions)} contributed · +{fmt(result.growthPct)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Contributions", money(result.contributions)], ["Interest", money(result.interest)], ["APY", `${fmt(result.apy)}%`]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-4">Balance vs Contributions Over Time</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [money(v), ""]} labelFormatter={(l) => `Year ${l}`} />
                    <Area type="monotone" dataKey="balance" name="Balance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#mmGrad)" />
                    <Area type="monotone" dataKey="contributed" name="Contributed" stroke="#f59e0b" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The widening gap between the lines is compounding interest</p>
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
            <h2 className="text-2xl font-bold mb-3">Savings That Pay You Back</h2>
            <p>A money market account blends savings-account safety with interest rates closer to short-term investments. This <strong>money market calculator</strong> projects how an initial deposit plus monthly contributions grows at your APY — and shows exactly how much of the final balance is your own money.</p>
            <h2 className="text-2xl font-bold mb-3">How the Math Works</h2>
            <p>Interest compounds on the running balance at the APY, with contributions added monthly. The future value combines two pieces: the initial deposit compounding over the full term and the contribution stream compounding as each deposit arrives. The chart separates balance from contributions so the interest's accelerating effect is visible.</p>
            <h2 className="text-2xl font-bold mb-3">The Early-Money Advantage</h2>
            <p>Compounding rewards time, not size: the interest earned in later years dwarfs earlier years, and contributions made sooner earn far more than identical ones made later. Compare terms and APYs here — a fraction of a percent compounds into a meaningful difference.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/money-market-calculator" />
          <PopularCalculators exclude="/calculator/money-market-calculator" />
        </div>
      </div>
    </>
  );
}
