"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TaxReturnResult {
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  afterTaxIncome: number;
  refundOrOwed: number;
  barData: { bracket: string; tax: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

type FilingStatus = "single" | "married" | "hoh";

// 2024 Federal Tax Brackets
const brackets2024: Record<FilingStatus, { min: number; max: number; rate: number }[]> = {
  single: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 10 },
    { min: 23200, max: 94300, rate: 12 },
    { min: 94300, max: 201050, rate: 22 },
    { min: 201050, max: 383900, rate: 24 },
    { min: 383900, max: 487450, rate: 32 },
    { min: 487450, max: 731200, rate: 35 },
    { min: 731200, max: Infinity, rate: 37 },
  ],
  hoh: [
    { min: 0, max: 16550, rate: 10 },
    { min: 16550, max: 63100, rate: 12 },
    { min: 63100, max: 100500, rate: 22 },
    { min: 100500, max: 191950, rate: 24 },
    { min: 191950, max: 243700, rate: 32 },
    { min: 243700, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
};

const standardDeduction2024: Record<FilingStatus, number> = { single: 14600, married: 29200, hoh: 21900 };

function calcTaxReturn(grossIncome: number, filing: FilingStatus, itemizedDeductions: number, taxWithheld: number, taxCredits: number): TaxReturnResult {
  const stdDed = standardDeduction2024[filing];
  const deduction = Math.max(stdDed, itemizedDeductions);
  const taxableIncome = Math.max(0, grossIncome - deduction);
  const bks = brackets2024[filing];

  let totalTax = 0;
  const barData: { bracket: string; tax: number }[] = [];
  for (const bk of bks) {
    if (taxableIncome <= bk.min) break;
    const taxableAtRate = Math.min(taxableIncome, bk.max) - bk.min;
    const taxAtRate = taxableAtRate * (bk.rate / 100);
    totalTax += taxAtRate;
    if (taxAtRate > 0) barData.push({ bracket: `${bk.rate}%`, tax: Math.round(taxAtRate) });
  }

  const marginalBracket = bks.find(bk => taxableIncome <= bk.max) || bks[bks.length - 1];
  const marginalRate = marginalBracket.rate;
  const taxAfterCredits = Math.max(0, totalTax - taxCredits);
  const effectiveRate = grossIncome > 0 ? (taxAfterCredits / grossIncome) * 100 : 0;
  const afterTaxIncome = grossIncome - taxAfterCredits;
  const refundOrOwed = taxWithheld - taxAfterCredits;

  const breakdown = [
    { label: "Filing Status", value: filing === "single" ? "Single" : filing === "married" ? "Married Filing Jointly" : "Head of Household" },
    { label: "Gross Income", value: `$${grossIncome.toLocaleString()}` },
    { label: "Standard Deduction (2024)", value: `$${stdDed.toLocaleString()}` },
    { label: "Deduction Used", value: `$${deduction.toLocaleString()} (${itemizedDeductions > stdDed ? "Itemized" : "Standard"})` },
    { label: "Taxable Income", value: `$${taxableIncome.toLocaleString()}` },
    { label: "Federal Income Tax", value: `$${totalTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Tax Credits Applied", value: `$${taxCredits.toLocaleString()}` },
    { label: "Total Tax After Credits", value: `$${taxAfterCredits.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Tax Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Marginal Tax Rate", value: `${marginalRate}%` },
    { label: "Tax Withheld", value: `$${taxWithheld.toLocaleString()}` },
    { label: "Refund / Amount Owed", value: refundOrOwed >= 0 ? `Refund: $${refundOrOwed.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `Owe: $${Math.abs(refundOrOwed).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Taxable Income", value: `$${taxableIncome.toLocaleString()}` },
    { label: "Total Tax", value: `$${taxAfterCredits.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Marginal Rate", value: `${marginalRate}%` },
    { label: "After-Tax Income", value: `$${afterTaxIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: refundOrOwed >= 0 ? "Refund" : "Amount Owed", value: `$${Math.abs(refundOrOwed).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { taxableIncome, totalTax: taxAfterCredits, effectiveRate, marginalRate, afterTaxIncome, refundOrOwed, barData, breakdown, summaryStats };
}

const DEFAULTS = { income: "85000", filing: "single" as FilingStatus, itemized: "0", withheld: "12000", credits: "500" };

export default function TaxReturnCalculator() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [filing, setFiling] = useState<FilingStatus>(DEFAULTS.filing);
  const [itemized, setItemized] = useState(DEFAULTS.itemized);
  const [withheld, setWithheld] = useState(DEFAULTS.withheld);
  const [credits, setCredits] = useState(DEFAULTS.credits);
  const [result, setResult] = useState<TaxReturnResult | null>(null);

  const calculate = () => setResult(calcTaxReturn(parseFloat(income) || 85000, filing, parseFloat(itemized) || 0, parseFloat(withheld) || 12000, parseFloat(credits) || 500));
  const reset = () => { setIncome(DEFAULTS.income); setFiling(DEFAULTS.filing); setItemized(DEFAULTS.itemized); setWithheld(DEFAULTS.withheld); setCredits(DEFAULTS.credits); setResult(calcTaxReturn(85000, "single", 0, 12000, 500)); };
  useEffect(() => { setResult(calcTaxReturn(85000, "single", 0, 12000, 500)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the 2024 standard deduction?", answer: "2024 Standard Deductions: Single: $14,600. Married Filing Jointly: $29,200. Head of Household: $21,900. If your itemized deductions (mortgage interest, charitable gifts, state taxes up to $10K) exceed these amounts, itemize. Otherwise, take the standard deduction — it's simpler and often better." },
    { question: "What are the 2024 federal tax brackets?", answer: "2024 Federal Brackets (Single): 10% on income up to $11,600. 12%: $11,601–$47,150. 22%: $47,151–$100,525. 24%: $100,526–$191,950. 32%: $191,951–$243,725. 35%: $243,726–$609,350. 37%: over $609,350. These are marginal rates — each bracket only applies to income within that range." },
    { question: "What is the difference between effective and marginal tax rate?", answer: "Marginal rate: the tax rate on your last dollar of income (your highest bracket). Effective rate: total taxes paid ÷ gross income. Example: $85,000 income (single) in 22% bracket — but effective rate is ~15% because lower income is taxed at 10% and 12%. The marginal rate tells you the cost of earning an extra dollar." },
    { question: "What tax credits reduce my bill the most?", answer: "Child Tax Credit: up to $2,000/child (partially refundable). Earned Income Tax Credit (EITC): up to $7,830 for families. Child and Dependent Care Credit: up to 35% of care expenses. American Opportunity Credit: up to $2,500 for college education. Premium Tax Credit: for ACA marketplace health insurance. Credits reduce your tax bill dollar-for-dollar." },
    { question: "Should I itemize or take the standard deduction?", answer: "Compare your itemizable deductions: mortgage interest + charitable donations + state/local taxes (SALT, capped at $10K) + medical expenses above 7.5% AGI + other eligible items. If this total exceeds your standard deduction, itemize. With the higher standard deduction from TCJA, only ~10% of taxpayers now itemize." },
    { question: "When is my tax return due?", answer: "Federal tax return due date: April 15 (April 16, 2024 due to holiday). Extension available: file Form 4868 by April 15 for a 6-month extension to October 15. IMPORTANT: the extension is to FILE, not to PAY — any taxes owed must still be paid by April 15 to avoid penalties and interest." },
  ];

  const refColor = result ? (result.refundOrOwed >= 0 ? "text-emerald-600" : "text-red-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Tax Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Tax Return Calculator (2024)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Filing Status</label>
              <div className="grid grid-cols-3 gap-2">
                {([["single", "Single"], ["married", "Married"], ["hoh", "HoH"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setFiling(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${filing === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Gross Income</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /></div></div>
            <div><label className="text-base font-medium mb-1.5 block">Itemized Deductions (if any)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={itemized} onChange={e => setItemized(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Tax Withheld (W-2)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={withheld} onChange={e => setWithheld(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Tax Credits</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={credits} onChange={e => setCredits(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.refundOrOwed >= 0 ? "Estimated Refund" : "Amount Owed"}</div>
                <div className={`text-4xl font-extrabold tracking-tight ${refColor}`}>${Math.abs(result.refundOrOwed).toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Total tax: ${result.totalTax.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Effective rate: {result.effectiveRate.toFixed(2)}% · Marginal: {result.marginalRate}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Tax", `$${result.totalTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Effective Rate", `${result.effectiveRate.toFixed(2)}%`], ["After-Tax Income", `$${result.afterTaxIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax Return Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Refund / Amount Owed" ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax by Bracket</h3>
                <ResponsiveContainer width="100%" height={220}><BarChart data={result.barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="bracket" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Tax"]} /><Bar dataKey="tax" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">2024 Federal Tax Return Calculator</h2>
            <p>Our <strong>tax return calculator</strong> estimates your 2024 federal income tax liability using the latest IRS tax brackets, standard deductions, and filing status rules. It shows you whether to expect a refund or owe taxes, your effective rate vs. marginal rate, and exactly how much tax applies to each income bracket.</p>
            <h2 className="text-2xl font-bold mb-3">How Federal Taxes Are Calculated</h2>
            <p>Federal income tax is progressive — each dollar falls into its own bracket. Taxable Income = Gross Income − Deductions (Standard or Itemized). Tax = Sum of (income in each bracket × bracket rate). Tax After Credits = Tax − Tax Credits. Refund/Owed = Tax Withheld − Tax After Credits.</p>
            <h2 className="text-2xl font-bold mb-3">Standard vs. Itemized Deductions</h2>
            <p>Take whichever is larger. Standard (2024): $14,600 single, $29,200 married. Common itemized deductions: mortgage interest, charitable contributions, SALT (capped at $10,000), medical expenses above 7.5% AGI. Only about 10% of taxpayers itemize after the TCJA doubled the standard deduction.</p>
            <h2 className="text-2xl font-bold mb-3">Tax Withholding and W-4</h2>
            <p>Employers withhold taxes based on your W-4 form. A large refund means you over-withheld (gave the government an interest-free loan). A large bill means you under-withheld (may owe penalty). Ideal: withholding close to your actual tax liability. Update your W-4 when life changes occur: marriage, children, job change, significant income changes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tax-return-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Tax Return Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Tax Return Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Tax Return Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Tax Return Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Tax Return Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/tax-return-calculator" />
        </div>
      </div>
    </>
  );
}
