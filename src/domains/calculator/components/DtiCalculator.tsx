"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DtiResult {
  backEndRatio: number;
  frontEndRatio: number;
  totalDebt: number;
  income: number;
  housing: number;
  otherDebt: number;
  qualified: boolean;
  debtCapacity: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

function calcDti(income: number, housing: number, otherDebt: number, maxRatio: number): DtiResult {
  const totalDebt = housing + otherDebt;
  const backEndRatio = income > 0 ? (totalDebt / income) * 100 : 0;
  const frontEndRatio = income > 0 ? (housing / income) * 100 : 0;
  const qualified = backEndRatio <= maxRatio;
  const debtCapacity = income * (maxRatio / 100) - totalDebt;
  const fmt = (v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  const breakdown = [
    { label: "Gross Monthly Income", value: fmt(income) },
    { label: "Housing Payment (PITI)", value: fmt(housing) },
    { label: "Other Monthly Debts", value: fmt(otherDebt) },
    { label: "Total Monthly Debt", value: fmt(totalDebt) },
    { label: "Back-End DTI", value: `${backEndRatio.toFixed(1)}%` },
    { label: "Front-End DTI", value: `${frontEndRatio.toFixed(1)}%` },
    { label: `Qualifies at ${maxRatio}% Limit`, value: qualified ? "YES" : "NO" },
    { label: "Remaining Debt Capacity", value: `${debtCapacity >= 0 ? "" : "−"}${fmt(Math.abs(debtCapacity))}/mo` },
  ];
  const summaryStats = [
    { label: "Back-End DTI", value: `${backEndRatio.toFixed(1)}%` },
    { label: "Front-End DTI", value: `${frontEndRatio.toFixed(1)}%` },
    { label: "Total Debt", value: fmt(totalDebt) },
    { label: "Income", value: fmt(income) },
    { label: "Qualifies", value: qualified ? "YES" : "NO" },
    { label: "Debt Capacity", value: `${debtCapacity >= 0 ? "" : "−"}${fmt(Math.abs(debtCapacity))}/mo` },
    { label: "Housing", value: fmt(housing) },
    { label: "Other Debts", value: fmt(otherDebt) },
  ];
  const chartData = [
    { name: "Debt Payments", value: totalDebt },
    { name: "Remaining Income", value: Math.max(0, income - totalDebt) },
  ];
  return { backEndRatio, frontEndRatio, totalDebt, income, housing, otherDebt, qualified, debtCapacity, breakdown, summaryStats, chartData };
}

const DEFAULTS = { income: "8000", housing: "2000", other: "400", maxRatio: "43" };

export default function DtiCalculator() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [housing, setHousing] = useState(DEFAULTS.housing);
  const [other, setOther] = useState(DEFAULTS.other);
  const [maxRatio, setMaxRatio] = useState(DEFAULTS.maxRatio);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<DtiResult | null>(null);

  const i = parseFloat(income) || 0;
  const h = parseFloat(housing) || 0;
  const o = parseFloat(other) || 0;
  const m = parseFloat(maxRatio) || 43;
  const errs: string[] = [];
  if (i <= 0) errs.push("Gross monthly income must be greater than 0.");
  if (h < 0 || o < 0) errs.push("Debt payments cannot be negative.");
  if (h + o > i) errs.push("Total debt payments cannot exceed gross income.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDti(i, h, o, m)); };
  const reset = () => {
    setIncome(DEFAULTS.income); setHousing(DEFAULTS.housing); setOther(DEFAULTS.other); setMaxRatio(DEFAULTS.maxRatio);
    setResult(calcDti(8000, 2000, 400, 43));
  };
  useEffect(() => { setResult(calcDti(8000, 2000, 400, 43)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";
  const PIE_COLORS = ["hsl(var(--primary))", "#10b981"];

  const faqs = [
    { question: "What is a debt-to-income ratio?", answer: "DTI compares your monthly debt payments to your gross monthly income: Total Debt ÷ Income × 100. Lenders use it to judge whether you can afford a new loan. A back-end DTI at or below 43% is the standard cutoff for most qualified mortgages (QMs)." },
    { question: "What is the difference between front-end and back-end DTI?", answer: "Front-end (housing ratio) is housing costs alone — PITI (principal, interest, taxes, insurance) — divided by income. Back-end includes ALL debts: housing plus car loans, student loans, credit cards, and other obligations. Most lenders cap front-end at 28–31% and back-end at 43–50%." },
    { question: "How can I improve my DTI?", answer: "Earn more or borrow less: pay down credit card balances and other debts, refinance to lower payments, or extend loan terms. Increasing your down payment reduces the housing payment, which lowers both ratios. Even a small DTI drop can move you into a lender's qualifying range." },
    { question: "Does DTI affect my credit score?", answer: "No — DTI is not part of credit scores, which look at utilization and payment history. But lenders weigh DTI heavily when deciding whether to approve and at what rate. A high DTI can mean denial even with an excellent credit score." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "DTI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">DTI Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Gross Monthly Income</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Total Monthly Debt Payments</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={other} onChange={e => setOther(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Housing &amp; Limits</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Housing Payment (PITI)</label>
                      <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={housing} onChange={e => setHousing(e.target.value)} className={ci} /></div>
                    </div>
                    <div>
                      <label className={lbl}>Max Back-End Ratio</label>
                      <div className={inp}><input type="number" value={maxRatio} onChange={e => setMaxRatio(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Back-End DTI</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.backEndRatio.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.qualified
                    ? <span className="text-emerald-600 font-semibold">Qualifies at the {maxRatio}% limit</span>
                    : <span className="text-red-500 font-semibold">Above the {maxRatio}% limit — does not qualify</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Front-End DTI", `${result.frontEndRatio.toFixed(1)}%`], ["Total Monthly Debt", `$${result.totalDebt.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["Debt Capacity", `${result.debtCapacity >= 0 ? "" : "−"}$${Math.abs(result.debtCapacity).toLocaleString("en-US", { maximumFractionDigits: 2 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">DTI Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-amber-700" : i === 6 ? (r.value === "YES" ? "text-emerald-600" : "text-red-500") : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Income Allocation</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, ""]} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold">{((d.value / result.income) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
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
            <h2 className="text-2xl font-bold mb-3">Why DTI Matters</h2>
            <p>Debt-to-income ratio is the lender's measure of affordability: how much of your gross income is already committed to debt. This <strong>DTI calculator</strong> computes both the front-end (housing-only) and back-end (all debts) ratios, and checks qualification against your chosen lender limit.</p>
            <h2 className="text-2xl font-bold mb-3">Common Lending Limits</h2>
            <p>Qualified mortgages (QMs) cap back-end DTI at 43%. FHA loans allow up to 57% in some cases; conventional loans typically 36–45%; VA loans are flexible but favor ≤ 41%. Front-end limits usually run 28–31%. Know your program before applying.</p>
            <h2 className="text-2xl font-bold mb-3">Planning Your Purchase</h2>
            <p>Work backward: at a 43% back-end limit and $8,000 monthly income, you have $3,440 of total debt capacity. After existing debts, the remainder sets your maximum housing payment — which, with today's rates, determines the loan size you can carry.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dti-calculator" />
          <PopularCalculators exclude="/calculator/dti-calculator" />
        </div>
      </div>
    </>
  );
}
