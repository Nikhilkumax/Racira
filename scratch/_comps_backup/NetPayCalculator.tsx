"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const BRACKETS_SINGLE: [number, number][] = [[11925, 0.10], [48475, 0.12], [103350, 0.22], [197300, 0.24], [250525, 0.32], [626350, 0.35], [Infinity, 0.37]];
const BRACKETS_MFJ: [number, number][] = [[23850, 0.10], [96950, 0.12], [206700, 0.22], [394600, 0.24], [501050, 0.32], [751600, 0.35], [Infinity, 0.37]];
const STD_SINGLE = 15000;
const STD_MFJ = 30000;
const FICA_RATE = 0.0765; // 6.2% SS + 1.45% Medicare
const SS_CAP = 168600;

interface PayResult {
  gross: number;
  federalTax: number;
  fica: number;
  preTax: number;
  net: number;
  effectiveRate: number;
  marginal: number;
  periodNet: number;
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

function taxOn(income: number, brackets: [number, number][]): number {
  const taxable = Math.max(0, income);
  let tax = 0, prev = 0;
  for (const [cap, rate] of brackets) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, cap) - prev) * rate;
    prev = cap;
  }
  return tax;
}

function marginalRate(income: number, brackets: [number, number][]): number {
  const taxable = Math.max(0, income);
  for (const [cap, rate] of brackets) if (taxable <= cap) return rate;
  return 0.37;
}

function calcPay(gross: number, status: string, preTax: number, periods: number): PayResult {
  const brackets = status === "mfj" ? BRACKETS_MFJ : BRACKETS_SINGLE;
  const std = status === "mfj" ? STD_MFJ : STD_SINGLE;
  const taxable = Math.max(0, gross - std - preTax);
  const federalTax = taxOn(taxable, brackets);
  const fica = Math.min(gross, SS_CAP) * 0.062 + gross * 0.0145;
  const net = gross - federalTax - fica - preTax;
  const periodNet = net / periods;
  const effectiveRate = gross > 0 ? ((federalTax + fica) / gross) * 100 : 0;
  const marginal = marginalRate(taxable, brackets) * 100;
  const breakdown = [
    { label: "Gross Annual Salary", value: money(gross) },
    { label: "Filing Status", value: status === "mfj" ? "Married Filing Jointly" : "Single" },
    { label: "Pre-Tax Deductions (401k, HSA)", value: money(preTax) },
    { label: "Standard Deduction", value: money(std) },
    { label: "Taxable Income", value: money(taxable) },
    { label: "Federal Income Tax", value: money(federalTax) },
    { label: "FICA (SS 6.2% + Medicare 1.45%)", value: money(fica) },
    { label: "Net Annual Pay", value: money(net) },
    { label: "Net per Pay Period", value: money(periodNet) },
    { label: "Effective Tax Rate", value: `${fmt(effectiveRate)}%` },
    { label: "Marginal Tax Rate", value: `${fmt(marginal, 0)}%` },
  ];
  const summaryStats = [
    { label: "Net Annual Pay", value: money(net) },
    { label: "Net / Pay Period", value: money(periodNet) },
    { label: "Federal Tax", value: money(federalTax) },
    { label: "FICA", value: money(fica) },
    { label: "Effective Rate", value: `${fmt(effectiveRate)}%` },
    { label: "Marginal Rate", value: `${fmt(marginal, 0)}%` },
  ];
  const chartData = [
    { name: "Net Pay", value: Number(net.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Federal Tax", value: Number(federalTax.toFixed(0)), fill: "#f59e0b" },
    { name: "FICA", value: Number(fica.toFixed(0)), fill: "#ef4444" },
    { name: "Pre-Tax Deductions", value: Number(preTax.toFixed(0)), fill: "#10b981" },
  ].filter((d) => d.value > 0);
  return { gross, federalTax, fica, preTax, net, effectiveRate, marginal, periodNet, breakdown, summaryStats, chartData };
}

const DEFAULTS = { gross: "95000", status: "single", preTax: "8000", periods: "26" };

export default function NetPayCalculator() {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [status, setStatus] = useState(DEFAULTS.status);
  const [preTax, setPreTax] = useState(DEFAULTS.preTax);
  const [periods, setPeriods] = useState(DEFAULTS.periods);
  const [result, setResult] = useState<PayResult | null>(null);

  const g = parseFloat(gross);
  const p = parseFloat(preTax);
  const per = parseInt(periods, 10);
  const errs: string[] = [];
  if (!g || g <= 0) errs.push("Gross salary must be greater than 0.");
  if (isNaN(p) || p < 0) errs.push("Pre-tax deductions must be 0 or greater.");
  if (![12, 24, 26, 52].includes(per)) errs.push("Pay periods per year must be 12, 24, 26, or 52.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcPay(g, status, p || 0, per)); };
  const reset = () => {
    setGross(DEFAULTS.gross); setStatus(DEFAULTS.status); setPreTax(DEFAULTS.preTax); setPeriods(DEFAULTS.periods);
    setResult(calcPay(95000, "single", 8000, 26));
  };
  useEffect(() => { setResult(calcPay(95000, "single", 8000, 26)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is net pay?", answer: "Take-home pay — gross salary minus federal income tax, FICA (Social Security + Medicare), and pre-tax deductions. State and local taxes are not modeled here, so your real net pay will be lower in most states." },
    { question: "How is federal tax computed?", answer: "The calculator subtracts the 2025 standard deduction ($15,000 single / $30,000 MFJ) and pre-tax deductions, then applies the 2025 marginal brackets: 10% through 37%. Each bracket applies only to the income within its range." },
    { question: "What about FICA?", answer: "Social Security is 6.2% up to the 2025 wage cap of $168,600, and Medicare is 1.45% on all wages (plus 0.9% above $200,000, not modeled). Your employer matches both, which is why the true cost of your salary is higher than your gross." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Net Pay Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Net Pay Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Gross Annual Salary ($)</label>
                <input type="number" value={gross} onChange={e => setGross(e.target.value)} className={inp} placeholder="95000" />
              </div>
              <div>
                <label className={lbl}>Pre-Tax Deductions ($/yr)</label>
                <input type="number" value={preTax} onChange={e => setPreTax(e.target.value)} className={inp} placeholder="8000" />
              </div>
              <div>
                <label className={lbl}>Filing Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
                  <option value="single">Single</option>
                  <option value="mfj">Married Filing Jointly</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Pay Periods / Year</label>
                <select value={periods} onChange={e => setPeriods(e.target.value)} className={inp}>
                  <option value="12">Monthly</option>
                  <option value="24">Semi-monthly</option>
                  <option value="26">Bi-weekly</option>
                  <option value="52">Weekly</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">2025 federal brackets and standard deductions. State/local tax not included.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Annual Pay</div>
                <div className="text-4xl font-extrabold tracking-tight">{money(result.net)}</div>
                <div className="text-sm text-muted-foreground mt-1">{money(result.periodNet)} per period · effective rate {fmt(result.effectiveRate)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Federal Tax", money(result.federalTax)], ["FICA", money(result.fica)], ["Marginal Rate", `${fmt(result.marginal, 0)}%`]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-4">Where Your Salary Goes</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [money(v), ""]} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Net pay dominates — but tax and FICA take a real slice</p>
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
            <h2 className="text-2xl font-bold mb-3">From Gross to Take-Home</h2>
            <p>Your offer letter says one number; your bank account sees another. This <strong>net pay calculator</strong> walks gross salary through 2025 federal income tax and FICA to arrive at take-home pay, per year and per pay period.</p>
            <h2 className="text-2xl font-bold mb-3">The Deductions</h2>
            <p>Federal tax starts after the standard deduction ($15,000 single / $30,000 MFJ) and any pre-tax deductions like 401(k) contributions and HSA deposits. FICA adds 7.65% — 6.2% Social Security on wages up to the $168,600 cap plus 1.45% Medicare on everything.</p>
            <h2 className="text-2xl font-bold mb-3">Rates Worth Knowing</h2>
            <p>The effective rate is what you actually lose to taxes overall; the marginal rate is what the next dollar is taxed at — the number that matters when weighing a raise, an extra shift, or a side gig. Both are reported, and state taxes would add on top.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-pay-calculator" />
          <PopularCalculators exclude="/calculator/net-pay-calculator" />
        </div>
      </div>
    </>
  );
}
