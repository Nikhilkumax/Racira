"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface TaxResult { federalTax: number; stateTax: number; ficaTax: number; totalTax: number; effectiveRate: number; marginalRate: number; takeHome: number; monthlyTakeHome: number; }
const DEFAULTS = { income: "85000", state: "CA", filingStatus: "single", stateRate: "9.3" };

const BRACKETS_SINGLE_2024 = [
  { min: 0, max: 11600, rate: 0.10 }, { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 }, { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 }, { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];
const BRACKETS_MFJ_2024 = [
  { min: 0, max: 23200, rate: 0.10 }, { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 }, { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 }, { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
];

function calcFederal(income: number, status: string): { tax: number; marginalRate: number } {
  const standardDeduction = status === "mfj" ? 29200 : status === "hoh" ? 21900 : 14600;
  const taxableIncome = Math.max(0, income - standardDeduction);
  const brackets = status === "mfj" ? BRACKETS_MFJ_2024 : BRACKETS_SINGLE_2024;
  let tax = 0, marginalRate = 0;
  for (const b of brackets) {
    if (taxableIncome > b.min) {
      tax += Math.min(taxableIncome - b.min, b.max - b.min) * b.rate;
      marginalRate = b.rate;
    }
  }
  return { tax: Math.round(tax), marginalRate };
}

function calculate(d: typeof DEFAULTS): TaxResult {
  const income = parseFloat(d.income)||0;
  const { tax: federalTax, marginalRate } = calcFederal(income, d.filingStatus);
  const stateTax = Math.round(income * (parseFloat(d.stateRate)||0) / 100);
  const ficaTax = Math.round(Math.min(income, 168600) * 0.062 + income * 0.0145);
  const totalTax = federalTax + stateTax + ficaTax;
  const effectiveRate = income > 0 ? totalTax / income : 0;
  return { federalTax, stateTax, ficaTax, totalTax, effectiveRate, marginalRate, takeHome: income - totalTax, monthlyTakeHome: Math.round((income - totalTax) / 12) };
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function IncomeTaxCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<TaxResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const income = parseFloat(f.income)||0;
  const pieData = [
    { name: "Federal Tax", value: r.federalTax, fill: "#ef4444" },
    { name: "State Tax", value: r.stateTax, fill: "#f59e0b" },
    { name: "FICA", value: r.ficaTax, fill: "#8b5cf6" },
    { name: "Take-Home", value: r.takeHome, fill: "hsl(var(--primary))" },
  ];

  const faqs = [
    { question: "How is US federal income tax calculated?", answer: "The US uses progressive marginal tax brackets. Only income within each bracket is taxed at that rate — not all income. For 2024 (single): 10% on $0–$11,600, 12% on $11,600–$47,150, 22% on $47,150–$100,525, etc. The standard deduction ($14,600 for single in 2024) reduces taxable income first." },
    { question: "What is the difference between effective and marginal tax rate?", answer: "Marginal rate: the rate applied to your last dollar of income (your highest bracket). Effective rate: total tax divided by total income — your average rate. Always consider both: the marginal rate affects decisions about additional income; the effective rate shows actual tax burden. Most people's effective rate is significantly lower than their marginal rate." },
    { question: "What is FICA tax?", answer: "FICA = Federal Insurance Contributions Act. It includes: Social Security tax (6.2% on wages up to $168,600 in 2024) + Medicare tax (1.45% on all wages, plus 0.9% Additional Medicare Tax on wages above $200K for single filers). Employers pay an equal amount, making total FICA contribution 15.3% (split 50/50)." },
    { question: "Should I take the standard deduction or itemize?", answer: "Take whichever is larger. Standard deduction (2024): $14,600 single, $29,200 MFJ. Itemize if: mortgage interest + property taxes + state income taxes (SALT cap $10K) + charitable contributions + medical expenses above 7.5% AGI > standard deduction. About 90% of filers take the standard deduction post-2017 TCJA." },
    { question: "How can I reduce my federal tax liability?", answer: "Contribute to pre-tax retirement accounts (401(k), Traditional IRA) — reduces taxable income dollar for dollar. Maximize HSA contributions if eligible. Use FSA for medical and childcare expenses. Harvest tax losses in brokerage accounts to offset gains. Defer income to lower-income years. These strategies can reduce effective rate by 3–8 percentage points." },
    { question: "What is the 2024 standard deduction?", answer: "2024 standard deductions: Single / Married Filing Separately: $14,600. Married Filing Jointly: $29,200. Head of Household: $21,900. Add $1,550 per person over 65 or blind. The standard deduction is adjusted annually for inflation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Income Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Income Tax Calculator 2024</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Annual Gross Income</label>
              <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                <input type="number" value={f.income} onChange={e => set("income")(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Filing Status</label>
              <select value={f.filingStatus} onChange={e => set("filingStatus")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                <option value="single">Single</option>
                <option value="mfj">Married Filing Jointly</option>
                <option value="mfs">Married Filing Separately</option>
                <option value="hoh">Head of Household</option>
              </select></div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">State Income Tax Rate (%)</label>
              <p className="text-xs text-muted-foreground mb-1">Enter your state&apos;s effective rate (0% for TX, FL, WA, etc.)</p>
              <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <input type="number" value={f.stateRate} onChange={e => set("stateRate")(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                <span className="pr-3 text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Annual Take-Home Pay</div>
              <div className="text-4xl font-extrabold text-foreground">{fmt(r.takeHome)}</div>
              <div className="text-sm text-muted-foreground mt-1">{fmt(r.monthlyTakeHome)}/month · Effective rate: {pct(r.effectiveRate)} · Marginal: {pct(r.marginalRate)}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Federal Tax</div><div className="font-bold text-red-600">{fmt(r.federalTax)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">State + FICA</div><div className="font-bold text-amber-600">{fmt(r.stateTax + r.ficaTax)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Total Tax</div><div className="font-bold">{fmt(r.totalTax)}</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Tax & Take-Home Breakdown</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData} barSize={50}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                    <RTooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Tax Summary 2024</h3></div>
              {[
                { label: "Gross Income", val: fmt(income) },
                { label: "Standard Deduction", val: fmt(f.filingStatus === "mfj" ? 29200 : f.filingStatus === "hoh" ? 21900 : 14600) },
                { label: "Federal Taxable Income", val: fmt(Math.max(0, income - (f.filingStatus === "mfj" ? 29200 : f.filingStatus === "hoh" ? 21900 : 14600))) },
                { label: "Federal Income Tax", val: fmt(r.federalTax), bold: true },
                { label: "State Income Tax", val: fmt(r.stateTax) },
                { label: "FICA (SS + Medicare)", val: fmt(r.ficaTax) },
                { label: "Total Tax Burden", val: fmt(r.totalTax), bold: true, highlight: true },
                { label: "Effective Tax Rate", val: pct(r.effectiveRate), bold: true },
                { label: "Marginal Tax Rate", val: pct(r.marginalRate) },
                { label: "Annual Take-Home", val: fmt(r.takeHome), bold: true },
                { label: "Monthly Take-Home", val: fmt(r.monthlyTakeHome), bold: true },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How US Federal Income Tax Works (2024)</h2>
            <p>The United States uses a progressive federal income tax system with seven brackets. The key insight most people misunderstand: you do not pay your highest bracket rate on all income. You pay 10% on the first $11,600, 12% on the next portion, and so forth. Only income within each bracket is taxed at that rate. The standard deduction ($14,600 for single filers in 2024) is subtracted before any brackets apply, significantly reducing taxable income for most people.</p>
            <h2 className="text-2xl font-bold mb-3">2024 Federal Tax Brackets (Single Filers)</h2>
            <p>10%: $0–$11,600. 12%: $11,601–$47,150. 22%: $47,151–$100,525. 24%: $100,526–$191,950. 32%: $191,951–$243,725. 35%: $243,726–$609,350. 37%: Over $609,350. These brackets are indexed for inflation annually. Married Filing Jointly brackets are approximately double the single filer thresholds.</p>
            <h2 className="text-2xl font-bold mb-3">FICA Taxes Explained</h2>
            <p>Social Security: 6.2% on wages up to $168,600 (2024 wage base). Medicare: 1.45% on all wages (no cap). Additional Medicare: 0.9% on wages above $200,000 (single). Self-employed individuals pay the full 15.3% themselves (employer + employee share) but deduct half as a business expense. FICA taxes fund Social Security retirement benefits and Medicare health insurance — a form of forced savings for future retirement and healthcare.</p>
            <h2 className="text-2xl font-bold mb-3">Tax Reduction Strategies</h2>
            <p>401(k) contributions reduce federal taxable income dollar-for-dollar (max $23,000 in 2024, $30,500 if 50+). Traditional IRA: deductible if income limits allow (max $7,000, $8,000 if 50+). HSA: triple tax advantage — deductible contribution + tax-free growth + tax-free medical withdrawals (max $4,150 individual, $8,300 family for 2024). These accounts combined can reduce taxable income by $30,000–$40,000+ for a single filer, potentially dropping a bracket and saving thousands in federal taxes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/income-tax-calculator" />
          <PopularCalculators exclude="/calculator/income-tax-calculator" />
        </div>
      </div>
    </>
  );
}
