"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Period = "2" | "3" | "5" | "unlimited";
type Inflation = "none" | "3" | "5";
type Elimination = "30" | "60" | "90" | "180";
type Health = "preferred" | "standard" | "substandard";

interface Inputs {
  age: number;
  dailyBenefit: number;
  period: Period;
  inflation: Inflation;
  elimination: Elimination;
  health: Health;
  partner: boolean;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  monthlyPremium: number;
  annualPremium: number;
  monthlyClaim: number;
  benefitPool: number;
  poolMonths: number;
  dailyRate: number;
  chartData: { year: number; premiums: number; pool: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AGE_RATES: { max: number; rate: number }[] = [
  { max: 49, rate: 0.7 },
  { max: 54, rate: 0.85 },
  { max: 59, rate: 1.05 },
  { max: 64, rate: 1.35 },
  { max: 69, rate: 1.8 },
  { max: 74, rate: 2.5 },
  { max: 200, rate: 3.4 },
];

const PERIOD_FACTORS: Record<Period, { label: string; f: number }> = {
  "2": { label: "2 years", f: 0.75 },
  "3": { label: "3 years", f: 0.9 },
  "5": { label: "5 years", f: 1 },
  unlimited: { label: "Unlimited (Lifetime)", f: 1.5 },
};

const INFLATION_FACTORS: Record<Inflation, { label: string; f: number }> = {
  none: { label: "None", f: 0.75 },
  "3": { label: "3% compound", f: 1 },
  "5": { label: "5% compound", f: 1.3 },
};

const ELIMINATION_FACTORS: Record<Elimination, { label: string; f: number }> = {
  "30": { label: "30 days", f: 1.15 },
  "60": { label: "60 days", f: 1.07 },
  "90": { label: "90 days", f: 1 },
  "180": { label: "180 days", f: 0.9 },
};

const HEALTH_FACTORS: Record<Health, { label: string; f: number }> = {
  preferred: { label: "Preferred", f: 0.8 },
  standard: { label: "Standard", f: 1 },
  substandard: { label: "Substandard", f: 1.5 },
};

function dailyRateAt(age: number): number {
  for (const band of AGE_RATES) {
    if (age <= band.max) return band.rate;
  }
  return AGE_RATES[AGE_RATES.length - 1].rate;
}

function calc(inp: Inputs): Result {
  const dailyRate = dailyRateAt(inp.age);
  const fPeriod = PERIOD_FACTORS[inp.period].f;
  const fInflation = INFLATION_FACTORS[inp.inflation].f;
  const fElim = ELIMINATION_FACTORS[inp.elimination].f;
  const fHealth = HEALTH_FACTORS[inp.health].f;
  const monthlyPremium = inp.dailyBenefit * dailyRate * fPeriod * fInflation * fElim * fHealth * (inp.partner ? 0.85 : 1);
  const annualPremium = monthlyPremium * 12;

  const monthlyClaim = inp.dailyBenefit * 30;
  const poolMonths = inp.period === "unlimited" ? 9999 : parseInt(inp.period) * 12;
  const benefitPool = inp.period === "unlimited" ? monthlyClaim * 12 * 25 : monthlyClaim * poolMonths;

  const chartData: { year: number; premiums: number; pool: number }[] = [];
  for (let y = 0; y <= 30; y += 5) {
    chartData.push({
      year: y,
      premiums: Math.round(annualPremium * y),
      pool: benefitPool,
    });
  }

  const inflationLabel = INFLATION_FACTORS[inp.inflation].label;
  const periodLabel = PERIOD_FACTORS[inp.period].label;

  const breakdown: Row[] = [
    { label: "Purchase Age", value: String(inp.age), sum: true },
    { label: "Daily Benefit", value: money(inp.dailyBenefit) + "/day", sum: true },
    { label: "Monthly Claim if Care Needed", value: money(monthlyClaim) + "/mo", highlight: true, sum: true },
    { label: "Benefit Period — " + periodLabel, value: fPeriod.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: "Inflation Protection — " + inflationLabel, value: fInflation.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: "Elimination Period — " + ELIMINATION_FACTORS[inp.elimination].label, value: fElim.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: "Health Class — " + HEALTH_FACTORS[inp.health].label, value: fHealth.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: "Partner Discount", value: inp.partner ? "−15% applied" : "Not applied", sum: true },
    { label: "Base Premium at Age " + inp.age, value: money2(dailyRate * inp.dailyBenefit) + "/mo", sum: true },
    { label: "Estimated Monthly Premium", value: money2(monthlyPremium), isTotal: true, sum: true },
    { label: "Estimated Annual Premium", value: money(annualPremium), isTotal: true, sum: true },
    { label: "Total Benefit Pool" + (inp.period === "unlimited" ? " (illustrative)" : ""), value: money(benefitPool), sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return { monthlyPremium, annualPremium, monthlyClaim, benefitPool, poolMonths, dailyRate, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { age: 60, dailyBenefit: 200, period: "5", inflation: "3", elimination: "90", health: "standard", partner: false };

export default function LongTermCareInsuranceCostEstimator() {
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [dailyBenefit, setDailyBenefit] = useState(String(DEFAULTS.dailyBenefit));
  const [period, setPeriod] = useState<Period>(DEFAULTS.period);
  const [inflation, setInflation] = useState<Inflation>(DEFAULTS.inflation);
  const [elimination, setElimination] = useState<Elimination>(DEFAULTS.elimination);
  const [health, setHealth] = useState<Health>(DEFAULTS.health);
  const [partner, setPartner] = useState(DEFAULTS.partner);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    age: parseInt(age) || 0,
    dailyBenefit: parseFloat(dailyBenefit) || 0,
    period,
    inflation,
    elimination,
    health,
    partner,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setAge(String(DEFAULTS.age));
    setDailyBenefit(String(DEFAULTS.dailyBenefit));
    setPeriod(DEFAULTS.period);
    setInflation(DEFAULTS.inflation);
    setElimination(DEFAULTS.elimination);
    setHealth(DEFAULTS.health);
    setPartner(DEFAULTS.partner);
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const a = parseInt(age) || 0;
  const db = parseFloat(dailyBenefit) || 0;

  const valErrors: Record<string, string> = {};
  if (age === "" || isNaN(parseInt(age))) valErrors.age = "Enter your age";
  else if (a < 18) valErrors.age = "Age must be 18 or older";
  else if (a > 90) valErrors.age = "Age must be 90 or younger";
  if (dailyBenefit === "" || isNaN(parseFloat(dailyBenefit))) valErrors.dailyBenefit = "Enter a daily benefit";
  else if (db <= 0) valErrors.dailyBenefit = "Daily benefit must be greater than 0";
  else if (db > 1000) valErrors.dailyBenefit = "Daily benefit looks too high";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  const res = result;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Long-Term Care Insurance Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Long-Term Care Insurance Cost Estimator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ltc-age" className="text-sm font-medium mb-1 block">Your Age</label>
                <div className={inputCls}>
                  <input id="ltc-age" type="number" min="18" max="90" step="1" value={age} onChange={(e) => setAge(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.age && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.age}</p>}
              </div>
              <div>
                <label htmlFor="ltc-benefit" className="text-sm font-medium mb-1 block">Daily Benefit ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="ltc-benefit" type="number" min="0" step="10" value={dailyBenefit} onChange={(e) => setDailyBenefit(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.dailyBenefit && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.dailyBenefit}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ltc-period" className="text-sm font-medium mb-1 block">Benefit Period</label>
                <div className="relative h-10">
                  <select id="ltc-period" value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={selectCls}>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="5">5 years</option>
                    <option value="unlimited">Unlimited (Lifetime)</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="ltc-inflation" className="text-sm font-medium mb-1 block">Inflation Protection</label>
                <div className="relative h-10">
                  <select id="ltc-inflation" value={inflation} onChange={(e) => setInflation(e.target.value as Inflation)} className={selectCls}>
                    <option value="none">None</option>
                    <option value="3">3% compound</option>
                    <option value="5">5% compound</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Policy Design</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ltc-elim" className="text-sm font-medium mb-1 block">Elimination Period</label>
                      <div className="relative h-10">
                        <select id="ltc-elim" value={elimination} onChange={(e) => setElimination(e.target.value as Elimination)} className={selectCls}>
                          <option value="30">30 days</option>
                          <option value="60">60 days</option>
                          <option value="90">90 days</option>
                          <option value="180">180 days</option>
                        </select>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Days of care you pay before benefits start.</p>
                    </div>
                    <div>
                      <label htmlFor="ltc-health" className="text-sm font-medium mb-1 block">Health Class</label>
                      <div className="relative h-10">
                        <select id="ltc-health" value={health} onChange={(e) => setHealth(e.target.value as Health)} className={selectCls}>
                          <option value="preferred">Preferred</option>
                          <option value="standard">Standard</option>
                          <option value="substandard">Substandard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer select-none">
                      <input type="checkbox" checked={partner} onChange={(e) => setPartner(e.target.checked)} className="h-4 w-4 accent-[#2563eb]" />
                      Married / Partner Discount (−15%)
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {res && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Premium</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(res.monthlyPremium)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ≈ {money(res.annualPremium)}/yr bought at age {a} · {money(db)}/day for {PERIOD_FACTORS[period].label} · {INFLATION_FACTORS[inflation].label} inflation
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Annual Premium", money(res.annualPremium), "text-primary"],
                    ["Monthly Claim If Needed", money(res.monthlyClaim) + "/mo", "text-emerald-600"],
                    ["Benefit Pool", period === "unlimited" ? "Unlimited" : money(res.benefitPool), "text-foreground"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Premiums Paid vs. Benefit Pool</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={res.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} tickFormatter={(v) => (v === 0 ? "Now" : "Yr " + v)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <Tooltip formatter={(v: number, name: string) => [money(Number(v)), name === "premiums" ? "Premiums paid" : "Benefit pool"]} labelFormatter={(l) => (l === 0 ? "Now" : "Year " + l)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="premiums" name="Premiums paid" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
                      <Area type="monotone" dataKey="pool" name="Benefit pool" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">The pool is what the policy can pay out over its life; premiums are what you pay to keep it active. Pool shown flat — inflation riders raise the daily benefit over time.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Premium Build-Up</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {res.breakdown.map((r, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                          <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {res.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Drives a Long-Term Care Premium</h2>
            <p>Long-term care insurance premiums are locked in largely by the age and health class at purchase — buying at 60 rather than 70 can cut the premium roughly in half because the insurer prices decades of potential claims. Beyond that, every policy lever moves the price: a higher daily benefit raises both the premium and the monthly claim payment; longer benefit periods buy more total pool; inflation protection compounds your daily benefit so care bought decades from now is still affordable (at 3% compound, a $200 daily benefit becomes about $361 in 20 years); and a longer elimination period — the deductible-like waiting period before benefits start — lowers the premium. This estimator applies typical rate tables to those levers so you can see the trade-offs before sitting down with an agent.</p>
          </section>
          <FAQSection faqs={[
            { question: "When is the best age to buy long-term care insurance?", answer: "Most advisors target the mid-50s to early 60s: young enough that health underwriting is favorable and premiums are far lower than at 70+, but old enough that the coverage is likely to be used. Waiting until a health condition appears often means a higher rate class or denial altogether." },
            { question: "What daily benefit should I choose?", answer: "A common rule is to cover most of what home care or a private room costs in your area — for 2025 planning, $150–$250 per day covers assisted living in many regions, with skilled nursing higher. Since future care inflation is the biggest risk, most buyers pair a realistic daily benefit with compound inflation protection." },
            { question: "Are long-term care premiums tax-deductible?", answer: "For individuals, premiums count as medical expenses subject to the IRS age-based annual limits (for 2025, roughly $480 at age 40–50 up to about $5,900 at 70+), deductible only if total medical expenses exceed 7.5% of AGI. Self-employed people and businesses can often deduct more — ask a tax professional for your situation." },
          ]} pageUrl="https://racira.com/calculator/long-term-care-insurance-cost-estimator" />
          <PopularCalculators exclude="/calculator/long-term-care-insurance-cost-estimator" />
        </div>
      </div>
    </>
  );
}
