"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 2025 federal income tax brackets and standard deductions
const BRACKETS_SINGLE: [number, number][] = [
  [11925, 0.10], [48475, 0.12], [103350, 0.22], [197300, 0.24], [250525, 0.32], [626350, 0.35], [Infinity, 0.37],
];
const BRACKETS_MFJ: [number, number][] = [
  [23850, 0.10], [96950, 0.12], [206700, 0.22], [394600, 0.24], [501050, 0.32], [751600, 0.35], [Infinity, 0.37],
];
const STD_SINGLE = 15000;
const STD_MFJ = 30000;

interface MtResult {
  incomeA: number;
  incomeB: number;
  singlesTax: number;
  mfjTax: number;
  penalty: number;
  penaltyPct: number;
  marginalA: number;
  marginalB: number;
  marginalMfj: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function money(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function taxOn(income: number, brackets: [number, number][]): number {
  const taxable = Math.max(0, income);
  let tax = 0;
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, cap) - prev) * rate;
    prev = cap;
  }
  return tax;
}

function marginalRate(income: number, brackets: [number, number][]): number {
  const taxable = Math.max(0, income);
  for (const [cap, rate] of brackets) {
    if (taxable <= cap) return rate;
  }
  return 0.37;
}

function calcMt(a: number, b: number): MtResult {
  const taxA = taxOn(a - STD_SINGLE, BRACKETS_SINGLE);
  const taxB = taxOn(b - STD_SINGLE, BRACKETS_SINGLE);
  const singlesTax = taxA + taxB;
  const mfjTax = taxOn(a + b - STD_MFJ, BRACKETS_MFJ);
  const penalty = mfjTax - singlesTax;
  const penaltyPct = singlesTax > 0 ? (penalty / singlesTax) * 100 : 0;
  const marginalA = marginalRate(a - STD_SINGLE, BRACKETS_SINGLE);
  const marginalB = marginalRate(b - STD_SINGLE, BRACKETS_SINGLE);
  const marginalMfj = marginalRate(a + b - STD_MFJ, BRACKETS_MFJ);
  const breakdown = [
    { label: "Spouse 1 Income", value: money(a) },
    { label: "Spouse 2 Income", value: money(b) },
    { label: "Combined Income", value: money(a + b) },
    { label: "Tax as Two Singles", value: money(singlesTax) },
    { label: "Tax as Married Filing Jointly", value: money(mfjTax) },
    { label: "Marriage Penalty / Bonus", value: `${penalty >= 0 ? "+" : "−"} ${money(Math.abs(penalty))}` },
    { label: "Penalty as % of Singles Tax", value: `${fmt(Math.abs(penaltyPct))}%` },
    { label: "Marginal Rate (A / B)", value: `${fmt(marginalA * 100, 0)}% / ${fmt(marginalB * 100, 0)}%` },
    { label: "Marginal Rate (MFJ)", value: `${fmt(marginalMfj * 100, 0)}%` },
  ];
  const summaryStats = [
    { label: "Marriage Penalty", value: `${penalty >= 0 ? "+" : "−"} ${money(Math.abs(penalty))}` },
    { label: "Tax as Singles", value: money(singlesTax) },
    { label: "Tax as MFJ", value: money(mfjTax) },
    { label: "Penalty % of Singles Tax", value: `${fmt(Math.abs(penaltyPct))}%` },
    { label: "MFJ Marginal Rate", value: `${fmt(marginalMfj * 100, 0)}%` },
  ];
  const chartData = [
    { name: "Two Singles", value: Number(singlesTax.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Married (MFJ)", value: Number(mfjTax.toFixed(0)), fill: "#f59e0b" },
  ];
  return { incomeA: a, incomeB: b, singlesTax, mfjTax, penalty, penaltyPct, marginalA, marginalB, marginalMfj, breakdown, summaryStats, chartData };
}

const DEFAULTS = { a: "120000", b: "80000" };

export default function MarriageTaxCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [result, setResult] = useState<MtResult | null>(null);

  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  const errs: string[] = [];
  if (isNaN(aNum) || aNum < 0) errs.push("Spouse 1 income must be 0 or greater.");
  if (isNaN(bNum) || bNum < 0) errs.push("Spouse 2 income must be 0 or greater.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMt(aNum, bNum)); };
  const reset = () => {
    setA(DEFAULTS.a); setB(DEFAULTS.b);
    setResult(calcMt(120000, 80000));
  };
  useEffect(() => { setResult(calcMt(120000, 80000)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the marriage penalty?", answer: "It is the extra federal income tax a married couple pays compared with the same two people filing as singles. It occurs when the double-income couple is pushed into higher brackets than two separate singles would be. When the opposite happens — MFJ is cheaper — it is called a marriage bonus." },
    { question: "Why does the penalty exist?", answer: "The married filing jointly brackets are not always exactly double the single brackets, and the standard deduction for a couple is less than two individual deductions. The tax code was deliberately reshaped in 2017 to make MFJ brackets nearly double the single ones for most income levels, shrinking but not eliminating the penalty." },
    { question: "Which filing status should we use?", answer: "For most married couples, filing jointly produces the lowest tax because the brackets are wider and credits phase out more slowly. Filing separately only makes sense in narrow situations — like income-driven student loan repayment or when one spouse owes back taxes or has high medical deductions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Marriage Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Marriage Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Spouse 1 Income ($/yr)</label>
                <input type="number" value={a} onChange={e => setA(e.target.value)} className={inp} placeholder="120000" />
              </div>
              <div>
                <label className={lbl}>Spouse 2 Income ($/yr)</label>
                <input type="number" value={b} onChange={e => setB(e.target.value)} className={inp} placeholder="80000" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Uses 2025 federal brackets and standard deductions (single $15,000, MFJ $30,000). Itemized deductions and credits are not modeled.</p>
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
              <div className={`${result.penalty >= 0 ? "bg-primary/10 border-l-4 border-primary" : "bg-emerald-500/10 border-l-4 border-emerald-500"} rounded-lg p-5`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.penalty >= 0 ? "text-primary" : "text-emerald-600"}`}>{result.penalty >= 0 ? "Marriage Penalty" : "Marriage Bonus"}</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.penalty >= 0 ? "+" : "−"} {money(Math.abs(result.penalty))}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.penalty >= 0 ? "More" : "Less"} tax married than single · {fmt(Math.abs(result.penaltyPct))}% of the singles tax</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Tax as Singles", money(result.singlesTax)], ["Tax as MFJ", money(result.mfjTax)], ["Difference", `${result.penalty >= 0 ? "+" : "−"} ${money(Math.abs(result.penalty))}`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Singles vs Married Filing Jointly</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">Compare the same income under both filing statuses</p>
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
            <h2 className="text-2xl font-bold mb-3">Does Marriage Cost You at Tax Time?</h2>
            <p>This <strong>marriage tax calculator</strong> answers one question: would the same two incomes owe less tax as singles or as a married couple filing jointly? It runs 2025 federal brackets and standard deductions under both statuses and reports the penalty or bonus.</p>
            <h2 className="text-2xl font-bold mb-3">Where the Penalty Comes From</h2>
            <p>Two singles each get their own $15,000 standard deduction and their own low brackets. A married couple shares one $30,000 deduction — often a wash — but the second income stacks on top of the first, and the marginal dollars can land in higher brackets than they would separately. Dual high earners feel this most.</p>
            <h2 className="text-2xl font-bold mb-3">Reading Your Result</h2>
            <p>A positive number is a penalty — you pay more married. A negative number is a bonus — the law favors your union. The percentage row scales it against your singles tax so you can judge materiality, and the marginal-rate row shows which bracket your combined income actually sits in.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/marriage-tax-calculator" />
          <PopularCalculators exclude="/calculator/marriage-tax-calculator" />
        </div>
      </div>
    </>
  );
}
