"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface TaxResult {
  income: number;
  regime: string;
  deductions: number;
  standardDeduction: number;
  taxable: number;
  tax: number;
  cess: number;
  totalTax: number;
  marginalRate: number;
  effectiveRate: number;
  rebate: number;
  takeHome: number;
  slabs: { label: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtRs(v: number): string {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

const NEW_SLABS: [number, number][] = [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]];
const OLD_SLABS: [number, number][] = [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];

function slabTax(taxable: number, slabs: [number, number][]): number {
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of slabs) {
    if (taxable > prev) {
      tax += (Math.min(taxable, limit) - prev) * rate;
    }
    prev = limit;
  }
  return tax;
}

function calcTax(income: number, regime: string, deductions: number): TaxResult {
  const standardDeduction = regime === "new" ? 75000 : 50000;
  const taxable = Math.max(0, income - standardDeduction - (regime === "new" ? 0 : Math.min(deductions, 150000)));
  const rawTax = slabTax(taxable, regime === "new" ? NEW_SLABS : OLD_SLABS);
  const rebate = regime === "new" ? (taxable <= 1200000 ? rawTax : 0) : (taxable <= 500000 ? rawTax : 0);
  const tax = Math.max(0, rawTax - rebate);
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const marginalRate = slabTax(taxable + 1, regime === "new" ? NEW_SLABS : OLD_SLABS) - rawTax;
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
  const takeHome = income - totalTax;

  const slabs = (regime === "new" ? NEW_SLABS : OLD_SLABS).map(([limit, rate]) => ({
    label: limit === Infinity ? `Above ${prevL(regime)}` : `Up to ₹${(limit / 100000).toFixed(0)}L`,
    value: rate * 100,
  }));
  function prevL(r: string): string {
    return r === "new" ? "₹24L" : "₹10L";
  }

  const breakdown = [
    { label: "Annual Income", value: fmtRs(income) },
    { label: "Regime", value: regime === "new" ? "New (FY 2025-26)" : "Old (FY 2025-26)" },
    { label: "Standard Deduction", value: `−${fmtRs(standardDeduction)}` },
    { label: regime === "new" ? "Section 80C Deductions" : "Deductions (80C etc., capped)", value: regime === "new" ? "Not applicable (old-regime only)" : `−${fmtRs(Math.min(deductions, 150000))}` },
    { label: "Taxable Income", value: fmtRs(taxable) },
    { label: "Tax Before Rebate", value: fmtRs(rawTax) },
    { label: "87A Rebate", value: rebate > 0 ? fmtRs(rebate) : "None" },
    { label: "Income Tax", value: fmtRs(tax) },
    { label: "Health & Education Cess (4%)", value: fmtRs(cess) },
    { label: "Total Tax Payable", value: fmtRs(totalTax) },
  ];
  const summaryStats = [
    { label: "Total Tax", value: fmtRs(totalTax) },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(1)}%` },
    { label: "Marginal Rate", value: `${marginalRate * 100}%` },
    { label: "Taxable Income", value: fmtRs(taxable) },
    { label: "Cess", value: fmtRs(cess) },
    { label: "Rebate", value: rebate > 0 ? fmtRs(rebate) : "None" },
    { label: "Take-Home", value: fmtRs(takeHome) },
    { label: "Monthly Tax", value: fmtRs(totalTax / 12) },
  ];
  const chartData = [
    { name: "Take-Home", value: Math.max(0, Math.round(takeHome)), fill: "hsl(var(--primary))" },
    { name: "Income Tax", value: Math.max(0, Math.round(totalTax)), fill: "#ef4444" },
  ];
  return { income, regime, deductions, standardDeduction, taxable, tax, cess, totalTax, marginalRate, effectiveRate, rebate, takeHome, slabs, breakdown, summaryStats, chartData };
}

const DEFAULTS = { income: "1500000", regime: "new", deductions: "150000" };

export default function IncomeTaxCalculator() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [deductions, setDeductions] = useState(DEFAULTS.deductions);
  const [result, setResult] = useState<TaxResult | null>(null);

  const inc = parseFloat(income) || 0;
  const dd = parseFloat(deductions) || 0;
  const errs: string[] = [];
  if (inc <= 0) errs.push("Annual income must be greater than 0.");
  if (dd < 0) errs.push("Deductions cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcTax(inc, regime, dd)); };
  const reset = () => {
    setIncome(DEFAULTS.income); setRegime(DEFAULTS.regime); setDeductions(DEFAULTS.deductions);
    setResult(calcTax(1500000, "new", 150000));
  };
  useEffect(() => { setResult(calcTax(1500000, "new", 150000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What changed in the new regime?", answer: "For FY 2025-26 the new regime offers six slabs from 0% to 30%, a ₹75,000 standard deduction, and a full rebate for taxable income up to ₹12 lakh — effectively tax-free below that." },
    { question: "New or old regime?", answer: "The new regime wins for most salaried taxpayers unless you use heavy 80C, HRA, and other deductions (typically ₹3L+). Compare both sides with your actual deduction numbers." },
    { question: "What is the 87A rebate?", answer: "Section 87A cancels the entire tax liability when taxable income stays under the rebate threshold — ₹12 lakh in the new regime, ₹5 lakh in the old. Above it, tax applies from the first slab." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Income Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Income Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Annual Income</label>
                <div className={inp}><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
              </div>
              <div>
                <label className={lbl}>Tax Regime</label>
                <select value={regime} onChange={e => setRegime(e.target.value)} className={sel}>
                  <option value="new">New Regime (FY 2025-26)</option>
                  <option value="old">Old Regime</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Deductions (80C etc.)</label>
                <div className={inp}><input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
                <p className="text-xs text-muted-foreground mt-1.5">Old regime only — capped at ₹1.5L.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Income Tax Payable (FY 2025-26)</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtRs(result.totalTax)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.effectiveRate.toFixed(1)}% effective on {fmtRs(result.income)} · {result.regime === "new" ? "New" : "Old"} regime</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Marginal Rate`, `${result.marginalRate * 100}%`], ["Cess (4%)", fmtRs(result.cess)], ["Take-Home", fmtRs(result.takeHome)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax Calculation</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 9 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 9 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 9 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Slab Rates ({result.regime === "new" ? "New" : "Old"} Regime)</h3>
                <table className="w-full text-base"><tbody>
                  {result.slabs.map((s, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{s.label}</td>
                      <td className="py-2.5 text-right font-semibold">{s.value.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody></table>
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
            <h2 className="text-2xl font-bold mb-3">How the New Regime Works</h2>
            <p>This <strong>income tax calculator</strong> applies the FY 2025-26 slab structure — 0% up to ₹4L, then 5/10/15/20/25/30% — with the ₹75,000 standard deduction and the ₹12 lakh 87A rebate. The old regime is modeled with its classic slabs, ₹50,000 standard deduction, and 80C deductions up to ₹1.5L.</p>
            <h2 className="text-2xl font-bold mb-3">Effective vs Marginal Rate</h2>
            <p>Marginal rate is the tax on your next rupee; effective rate is total tax divided by income. At ₹15L in the new regime the marginal rate is 20% but the effective rate is far lower because the first ₹12L are taxed lightly or not at all.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Regime</h2>
            <p>Run both numbers with your real deductions. The new regime wins when deductions stay below roughly ₹3L; heavy investors and renters may still do better in the old regime. Either way, the 4% cess applies on top.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/income-tax-calculator" />
          <PopularCalculators exclude="/calculator/income-tax-calculator" />
        </div>
      </div>
    </>
  );
}
