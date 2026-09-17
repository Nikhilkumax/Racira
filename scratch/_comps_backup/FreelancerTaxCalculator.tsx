"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface TaxInputs {
  grossIncome: number;
  businessExpenses: number;
  filingStatus: "single" | "married" | "head";
  state: string;
  stateTaxRate: number;
  quarterPayments: number;
}

interface TaxResult {
  netEarnings: number;
  seTax: number;
  seDeduction: number;
  adjustedIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  effectiveRate: number;
  afterTaxIncome: number;
  quarterlyPayment: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

/* ─── 2024 Federal Tax Brackets ──────────────────────────────────────────── */

const BRACKETS = {
  single: [[11600, 0.10], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35], [Infinity, 0.37]] as [number, number][],
  married: [[23200, 0.10], [94300, 0.12], [201050, 0.22], [383900, 0.24], [487450, 0.32], [731200, 0.35], [Infinity, 0.37]] as [number, number][],
  head: [[16550, 0.10], [63100, 0.12], [100500, 0.22], [191950, 0.24], [243700, 0.32], [609350, 0.35], [Infinity, 0.37]] as [number, number][],
};

function calcFederalTax(taxableIncome: number, status: "single" | "married" | "head"): number {
  if (taxableIncome <= 0) return 0;
  const brackets = BRACKETS[status];
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of brackets) {
    const taxable = Math.min(taxableIncome, limit) - prev;
    if (taxable <= 0) break;
    tax += taxable * rate;
    prev = limit;
  }
  return tax;
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcFreelancerTax(inp: TaxInputs): TaxResult {
  const netEarnings = Math.max(0, inp.grossIncome - inp.businessExpenses);
  const seTax = netEarnings * 0.153; // 12.4% SS + 2.9% Medicare
  const seDeduction = seTax * 0.5; // 50% of SE tax deductible
  const adjustedIncome = Math.max(0, netEarnings - seDeduction);
  const standardDeduction = inp.filingStatus === "married" ? 29200 : inp.filingStatus === "head" ? 21900 : 14600;
  const federalTaxable = Math.max(0, adjustedIncome - standardDeduction);
  const federalTax = calcFederalTax(federalTaxable, inp.filingStatus);
  const stateTax = adjustedIncome * (inp.stateTaxRate / 100);
  const totalTax = seTax + federalTax + stateTax;
  const effectiveRate = inp.grossIncome > 0 ? (totalTax / inp.grossIncome) * 100 : 0;
  const afterTaxIncome = inp.grossIncome - totalTax - inp.businessExpenses;
  const quarterlyPayment = totalTax / 4;

  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
  const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Gross Income", value: `$${fmt(inp.grossIncome)}` },
    { label: "Business Expenses", value: `−$${fmt(inp.businessExpenses)}` },
    { label: "Net Earnings", value: `$${fmt(netEarnings)}`, highlight: true },
    { label: "Self-Employment Tax (15.3%)", value: `$${fmt(seTax)}` },
    { label: "SE Tax Deduction (50%)", value: `−$${fmt(seDeduction)}` },
    { label: "Adjusted Gross Income", value: `$${fmt(adjustedIncome)}` },
    { label: "Federal Taxable Income", value: `$${fmt(federalTaxable)}` },
    { label: "Federal Income Tax", value: `$${fmt(federalTax)}` },
    { label: `State Tax (${inp.state} @ ${inp.stateTaxRate}%)`, value: `$${fmt(stateTax)}` },
    { label: "Total Tax", value: `$${fmt(totalTax)}`, highlight: true },
    { label: "After-Tax Income", value: `$${fmt(afterTaxIncome)}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Total Tax", value: `$${fmt(totalTax)}` },
    { label: "After-Tax Income", value: `$${fmt(afterTaxIncome)}` },
    { label: "Effective Tax Rate", value: `${effectiveRate.toFixed(1)}%` },
    { label: "Self-Employment Tax", value: `$${fmt(seTax)}` },
    { label: "Federal Income Tax", value: `$${fmt(federalTax)}` },
    { label: "State Tax", value: `$${fmt(stateTax)}` },
    { label: "Quarterly Payment", value: `$${fmt(quarterlyPayment)}` },
    { label: "SE Tax Deduction", value: `$${fmt(seDeduction)}` },
  ];

  const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];
  const chartData = [
    { name: "Self-Employment Tax", value: Math.round(seTax), color: PIE_COLORS[0] },
    { name: "Federal Income Tax", value: Math.round(federalTax), color: PIE_COLORS[1] },
    { name: "State Tax", value: Math.round(stateTax), color: PIE_COLORS[2] },
    { name: "After-Tax Income", value: Math.round(afterTaxIncome), color: PIE_COLORS[3] },
  ].filter(d => d.value > 0);

  return { netEarnings, seTax, seDeduction, adjustedIncome, federalTax, stateTax, totalTax, effectiveRate, afterTaxIncome, quarterlyPayment, breakdown, summaryStats, chartData };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: TaxInputs = { grossIncome: 85000, businessExpenses: 15000, filingStatus: "single", state: "California", stateTaxRate: 9.3, quarterPayments: 4 };

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function FreelancerTaxCalculator() {
  const [grossIncome, setGrossIncome] = useState(String(DEFAULTS.grossIncome));
  const [businessExpenses, setBusinessExpenses] = useState(String(DEFAULTS.businessExpenses));
  const [filingStatus, setFilingStatus] = useState(DEFAULTS.filingStatus);
  const [state, setState] = useState(DEFAULTS.state);
  const [stateTaxRate, setStateTaxRate] = useState(String(DEFAULTS.stateTaxRate));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);

  const getInputs = (): TaxInputs => ({
    grossIncome: parseFloat(grossIncome) || 0, businessExpenses: parseFloat(businessExpenses) || 0,
    filingStatus, state, stateTaxRate: parseFloat(stateTaxRate) || 0, quarterPayments: 4,
  });

  const calculate = () => setResult(calcFreelancerTax(getInputs()));
  const reset = () => {
    setGrossIncome(String(DEFAULTS.grossIncome)); setBusinessExpenses(String(DEFAULTS.businessExpenses));
    setFilingStatus(DEFAULTS.filingStatus); setState(DEFAULTS.state); setStateTaxRate(String(DEFAULTS.stateTaxRate));
    setResult(calcFreelancerTax(DEFAULTS));
  };

  useEffect(() => { setResult(calcFreelancerTax(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is self-employment tax?", answer: "Self-employment (SE) tax is the freelancer equivalent of Social Security and Medicare taxes that employers normally pay half of. As a freelancer, you pay the full 15.3% — 12.4% for Social Security (capped at $168,600 for 2024) and 2.9% for Medicare (no cap). You can deduct half of SE tax from your gross income." },
    { question: "How do quarterly estimated taxes work?", answer: "Freelancers must pay estimated taxes quarterly (April 15, June 15, Sept 15, Jan 15) using IRS Form 1040-ES. The minimum safe harbor is 100% of last year's tax liability (110% if AGI > $150K). Underpaying triggers penalties. A common approach: set aside 25–35% of each payment into a separate savings account." },
    { question: "What deductions can freelancers take?", answer: "Common deductions include: home office (simplified: $5/sqft up to 300sqft), equipment (Section 179 or depreciation), health insurance premiums (above-the-line deduction), retirement contributions (SEP-IRA up to $69K), vehicle expenses (standard mileage or actual), and the 50% SE tax deduction." },
    { question: "How is state tax calculated for freelancers?", answer: "Most states tax self-employment income the same as W-2 income. Some states like Texas, Florida, and Nevada have no income tax. California has the highest top rate at 13.3%. Your state tax rate depends on your total income and filing status. Our calculator uses a simplified flat rate for quick estimation." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Freelancer Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Freelancer Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Gross Income ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={grossIncome} onChange={e => setGrossIncome(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Business Expenses ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={businessExpenses} onChange={e => setBusinessExpenses(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Filing Status</label>
                <div className="relative h-10">
                  <select value={filingStatus} onChange={e => setFilingStatus(e.target.value as TaxInputs["filingStatus"])} className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium">
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                    <option value="head">Head of Household</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">State</label>
                <div className="relative h-10">
                  <select value={state} onChange={e => { setState(e.target.value); }} className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium">
                    <option value="California">California</option><option value="New York">New York</option><option value="Texas">Texas (0%)</option><option value="Florida">Florida (0%)</option>
                    <option value="Washington">Washington (0%)</option><option value="Illinois">Illinois</option><option value="Pennsylvania">Pennsylvania</option><option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options
                <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">State Tax Rate</div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Effective State Tax Rate (%)</label>
                    <div className={inp}><input type="number" value={stateTaxRate} onChange={e => setStateTaxRate(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    <p className="text-[11px] text-muted-foreground mt-1">CA: 9.3% · NY: 6.85% · TX/FL/WA: 0% · IL: 4.95%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Tax</div>
                <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.totalTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Effective Rate: {result.effectiveRate.toFixed(1)}% · After-Tax: ${result.afterTaxIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["SE Tax", `$${Math.round(result.seTax).toLocaleString()}`],
                  ["Federal Tax", `$${Math.round(result.federalTax).toLocaleString()}`],
                  ["State Tax", `$${Math.round(result.stateTax).toLocaleString()}`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
                <div className="shrink-0">
                  {result.chartData.length > 0 ? (
                    <div className="w-[160px] h-[160px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RPie>
                          <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">
                            {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                        </RPie>
                      </ResponsiveContainer>
                    </div>
                  ) : <div className="w-[160px] h-[160px] flex items-center justify-center text-muted-foreground text-xs">No data</div>}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Tax Composition</h4>
                  {result.chartData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">${item.value.toLocaleString()}</span>
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
            <h2 className="text-2xl font-bold mb-3">How Freelancer Taxes Work</h2>
            <p>As a freelancer, you&apos;re both the employer and employee — meaning you pay the full 15.3% self-employment tax (Social Security 12.4% + Medicare 2.9%) that W-2 workers split with their employer. On top of that, you owe federal and state income tax on your net earnings.</p>
            <h2 className="text-2xl font-bold mb-3">Quarterly Estimated Payments</h2>
            <p>The IRS requires freelancers to pay estimated taxes quarterly if you expect to owe $1,000+ for the year. Deadlines: April 15, June 15, September 15, and January 15 of the following year. Missing these triggers underpayment penalties of 5–8% annually.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freelancer-tax-calculator" />
          <PopularCalculators exclude="/calculator/freelancer-tax-calculator" />
        </div>
      </div>
    </>
  );
}
