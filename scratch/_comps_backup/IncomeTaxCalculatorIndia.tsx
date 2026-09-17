"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TaxResult {
  income: number;
  ageGroup: string;
  newTaxable: number;
  oldTaxable: number;
  newTax: number;
  oldTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  savings: number;
  betterRegime: string;
  takeHome: number;
  newSlabs: { label: string; rate: number; tax: number }[];
  oldSlabs: { label: string; rate: number; tax: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; tax: number; fill: string }[];
}

function fmtRupees(v: number): string {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(2)}%`;
}

const STANDARD_DEDUCTION_NEW = 75000;
const STANDARD_DEDUCTION_OLD = 50000;
const REBATE_LIMIT_NEW = 1200000;
const REBATE_LIMIT_OLD = 500000;

function slabTax(income: number, slabs: [number, number][]): number {
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of slabs) {
    const band = Math.max(0, Math.min(income, limit) - prev);
    tax += band * rate;
    prev = limit;
    if (income <= limit) break;
  }
  return tax;
}

function surcharge(tax: number, income: number): number {
  if (income > 20000000) return tax * 0.25;
  if (income > 10000000) return tax * 0.15;
  if (income > 5000000) return tax * 0.10;
  return 0;
}

function calcTax(income: number, ageGroup: string, deduct80c: number, deductNps: number, deduct80d: number, regime: string): TaxResult {
  // New regime slabs (FY 2025-26) — same for all ages
  const newSlabsDef: [number, number][] = [
    [400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30],
  ];
  // Old regime slabs depend on age
  let oldSlabsDef: [number, number][];
  if (ageGroup === "80+") {
    oldSlabsDef = [[500000, 0], [1000000, 0.20], [Infinity, 0.30]];
  } else if (ageGroup === "60-80") {
    oldSlabsDef = [[300000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];
  } else {
    oldSlabsDef = [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];
  }

  const newTaxable = Math.max(0, income - STANDARD_DEDUCTION_NEW);
  const oldTaxable = Math.max(0, income - STANDARD_DEDUCTION_OLD - deduct80c - deductNps - deduct80d);

  const newSurcharge = surcharge(slabTax(newTaxable, newSlabsDef), income);
  const oldSurcharge = surcharge(slabTax(oldTaxable, oldSlabsDef), income);
  const newPreCess = (newTaxable <= REBATE_LIMIT_NEW ? 0 : slabTax(newTaxable, newSlabsDef)) + newSurcharge;
  const oldPreCess = (oldTaxable <= REBATE_LIMIT_OLD ? Math.min(slabTax(oldTaxable, oldSlabsDef), 12500) : slabTax(oldTaxable, oldSlabsDef)) + oldSurcharge;
  const newTax = newPreCess * 1.04; // health & education cess
  const oldTax = oldPreCess * 1.04;

  const betterRegime = newTax <= oldTax ? "New" : "Old";
  const selected = regime === "New" ? newTax : oldTax;
  const totalTax = selected;
  const savings = Math.abs(newTax - oldTax);
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
  const marginalRate = regime === "New" ? 0.30 : oldSlabsDef[oldSlabsDef.length - 1][1];

  // slab detail rows for the better regime
  const slabRows = (taxable: number, slabs: [number, number][]): { label: string; rate: number; tax: number }[] => {
    const rows: { label: string; rate: number; tax: number }[] = [];
    let prev = 0;
    for (const [limit, rate] of slabs) {
      const band = Math.max(0, Math.min(taxable, limit) - prev);
      rows.push({
        label: limit === Infinity ? `Above ₹${prev.toLocaleString("en-IN")}` : `₹${prev.toLocaleString("en-IN")} – ₹${limit.toLocaleString("en-IN")}`,
        rate,
        tax: band * rate,
      });
      prev = limit;
      if (taxable <= limit) break;
    }
    return rows;
  };
  const newSlabs = slabRows(newTaxable, newSlabsDef);
  const oldSlabs = slabRows(oldTaxable, oldSlabsDef);

  const takeHome = income - totalTax;
  const betterTaxable = regime === "New" ? newTaxable : oldTaxable;
  const betterSurcharge = regime === "New" ? newSurcharge : oldSurcharge;
  const betterPreCess = regime === "New" ? newPreCess : oldPreCess;
  const otherTax = regime === "New" ? oldTax : newTax;
  const breakdown = [
    { label: "Gross Annual Income", value: fmtRupees(income) },
    { label: "Standard Deduction", value: fmtRupees(-(regime === "New" ? STANDARD_DEDUCTION_NEW : STANDARD_DEDUCTION_OLD)) },
    { label: "Deductions (80C + NPS + 80D)", value: fmtRupees(-(regime === "New" ? 0 : deduct80c + deductNps + deduct80d)) },
    { label: "Taxable Income", value: fmtRupees(betterTaxable) },
    { label: "Income Tax (after rebate)", value: fmtRupees(betterPreCess - betterSurcharge) },
    { label: "Surcharge", value: fmtRupees(betterSurcharge) },
    { label: "Health & Education Cess (4%)", value: fmtRupees(totalTax - betterPreCess) },
    { label: "Total Tax Payable", value: fmtRupees(totalTax) },
    { label: `Tax Under ${regime === "New" ? "Old" : "New"} Regime`, value: fmtRupees(otherTax) },
    { label: `${betterRegime === regime ? "You Save" : "Other Regime Saves"}`, value: fmtRupees(savings) },
  ];
  const summaryStats = [
    { label: "Total Tax Payable", value: fmtRupees(totalTax) },
    { label: "Effective Tax Rate", value: fmtPct(effectiveRate) },
    { label: "Marginal Tax Rate", value: fmtPct(marginalRate * 100) },
    { label: "Better Regime", value: betterRegime },
    { label: "Savings vs Other Regime", value: fmtRupees(savings) },
    { label: "Annual Take-Home", value: fmtRupees(takeHome) },
    { label: "Taxable Income", value: fmtRupees(betterTaxable) },
    { label: "Monthly Take-Home", value: fmtRupees(takeHome / 12) },
  ];
  const chartData = [
    { name: "New Regime", tax: Math.round(newTax), fill: "hsl(var(--primary))" },
    { name: "Old Regime", tax: Math.round(oldTax), fill: "#f59e0b" },
  ];
  return { income, ageGroup, newTaxable, oldTaxable, newTax, oldTax, totalTax, effectiveRate, marginalRate, savings, betterRegime, takeHome, newSlabs, oldSlabs, breakdown, summaryStats, chartData };
}

const DEFAULTS = { income: "1500000", age: "Below 60", d80c: "150000", nps: "50000", d80d: "25000" };

export default function IncomeTaxCalculatorIndia() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [ageGroup, setAgeGroup] = useState(DEFAULTS.age);
  const [regime, setRegime] = useState("New");
  const [d80c, setD80c] = useState(DEFAULTS.d80c);
  const [nps, setNps] = useState(DEFAULTS.nps);
  const [d80d, setD80d] = useState(DEFAULTS.d80d);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);

  const inc = parseFloat(income) || 0;
  const c80 = parseFloat(d80c) || 0;
  const npsAmt = parseFloat(nps) || 0;
  const d80 = parseFloat(d80d) || 0;
  const errs: string[] = [];
  if (inc <= 0) errs.push("Annual income must be greater than 0.");
  if (c80 < 0 || npsAmt < 0 || d80 < 0) errs.push("Deduction amounts cannot be negative.");
  if (c80 > 150000) errs.push("Section 80C deduction is capped at ₹1,50,000.");
  if (npsAmt > 50000) errs.push("NPS 80CCD(1B) deduction is capped at ₹50,000.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcTax(inc, ageGroup, c80, npsAmt, d80, regime)); };
  const reset = () => {
    setIncome(DEFAULTS.income); setAgeGroup(DEFAULTS.age); setRegime("New"); setD80c(DEFAULTS.d80c); setNps(DEFAULTS.nps); setD80d(DEFAULTS.d80d);
    setResult(calcTax(1500000, "Below 60", 150000, 50000, 25000, "New"));
  };
  useEffect(() => { setResult(calcTax(1500000, "Below 60", 150000, 50000, 25000, "New")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do the old and new tax regimes differ?", answer: "The new regime (default from FY 2023-24) offers lower slab rates but disallows most deductions and exemptions. The old regime keeps higher slabs but allows Section 80C, NPS 80CCD(1B), 80D insurance, HRA, and other deductions. This calculator compares both and shows which saves you more." },
    { question: "What is the Section 87A rebate?", answer: "The rebate fully eliminates tax if taxable income is at or below ₹12 lakh under the new regime (FY 2025-26) or ₹5 lakh under the old regime. Above those limits the rebate no longer applies and slabs are taxed normally." },
    { question: "Do the results include surcharge and cess?", answer: "Yes. A 10%/15%/25% surcharge is applied when total income exceeds ₹50 lakh, ₹1 crore, or ₹2 crore respectively, and a 4% Health & Education Cess is added to the final tax under both regimes." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Income Tax Calculator (India)" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Income Tax Calculator (India)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Annual Income</label>
                <div className={inp}><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
              </div>
              <div>
                <label className={lbl}>Age Group</label>
                <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className={sel}>
                  <option>Below 60</option><option>60-80</option><option>80+</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Assessment Regime</label>
                <select value={regime} onChange={e => setRegime(e.target.value)} className={sel}>
                  <option value="New">New Regime (FY 2025-26)</option>
                  <option value="Old">Old Regime</option>
                </select>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Deductions (Old Regime Only)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>80C Investments</label>
                      <div className={inp}><input type="number" value={d80c} onChange={e => setD80c(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
                    </div>
                    <div>
                      <label className={lbl}>NPS 80CCD(1B)</label>
                      <div className={inp}><input type="number" value={nps} onChange={e => setNps(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
                    </div>
                    <div className="col-span-2">
                      <label className={lbl}>Health Insurance 80D</label>
                      <div className={inp}><input type="number" value={d80d} onChange={e => setD80d(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Tax Payable · {regime} Regime</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtRupees(result.totalTax)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtPct(result.effectiveRate)} effective rate on {fmtRupees(result.income)} · {result.betterRegime === regime ? `saves ${fmtRupees(result.savings)} vs the ${result.betterRegime === "New" ? "old" : "new"} regime` : `the ${result.betterRegime} regime is cheaper by ${fmtRupees(result.savings)}`}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Total Tax`, fmtRupees(result.totalTax)], ["Effective Rate", fmtPct(result.effectiveRate)], ["Annual Take-Home", fmtRupees(result.takeHome)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Slab-Wise Tax Breakdown ({regime} Regime)</h3>
                <table className="w-full text-base"><tbody>
                  {(regime === "New" ? result.newSlabs : result.oldSlabs).map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label} @ {Math.round(r.rate * 100)}%</td>
                      <td className="py-2.5 text-right font-semibold">{fmtRupees(r.tax)}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/10">
                    <td className="py-2.5 text-primary font-bold">Total Tax Payable</td>
                    <td className="py-2.5 text-right font-bold text-primary">{fmtRupees(result.totalTax)}</td>
                  </tr>
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Regime Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => [fmtRupees(v), "Tax"]} />
                    <Bar dataKey="tax" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Annual tax under each regime (including cess)</p>
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
            <h2 className="text-2xl font-bold mb-3">Old vs New Regime, Side by Side</h2>
            <p>This <strong>income tax calculator for India</strong> computes your tax under both the old and new regimes for FY 2025-26 and highlights the cheaper option. The new regime applies lower slab rates — nil up to ₹4 lakh, then 5%, 10%, 15%, 20%, 25%, and 30% — with a ₹75,000 standard deduction and no other exemptions. The old regime keeps higher exemption limits but allows Section 80C, NPS 80CCD(1B), and 80D deductions entered in Advanced Options.</p>
            <h2 className="text-2xl font-bold mb-3">Rebate and Cess</h2>
            <p>Under the new regime, the Section 87A rebate eliminates tax entirely when taxable income is ₹12 lakh or less. A 4% Health & Education Cess is charged on the tax amount, and a surcharge of 10%–25% applies once income crosses ₹50 lakh.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Regime</h2>
            <p>Salaried taxpayers can switch regimes each year. The new regime usually wins when deductions are small; the old regime wins with heavy 80C, housing-loan, HRA, and insurance deductions. Compare both columns on this page before you file.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/income-tax-calculator-india" />
          <PopularCalculators exclude="/calculator/income-tax-calculator-india" />
        </div>
      </div>
    </>
  );
}
