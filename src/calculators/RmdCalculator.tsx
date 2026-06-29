"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RmdResult {
  rmd: number;
  taxDue: number;
  afterTaxRmd: number;
  remainingBalance: number;
  withdrawalPct: number;
  chartData: { age: number; balance: number; rmd: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// IRS Uniform Lifetime Table (simplified — common ages)
const ULT: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4,
};

function calcRmd(balance: number, age: number, rate: number, taxRate: number): RmdResult {
  const distributionPeriod = ULT[age] ?? (age > 100 ? 6.4 : 27.4);
  const rmd = balance / distributionPeriod;
  const taxDue = rmd * (taxRate / 100);
  const afterTaxRmd = rmd - taxDue;
  const remainingBalance = balance - rmd;
  const withdrawalPct = (rmd / balance) * 100;

  const chartData: { age: number; balance: number; rmd: number }[] = [];
  let bal = balance;
  for (let a = age; a <= Math.min(age + 20, 100); a++) {
    const dp = ULT[a] ?? 6.4;
    const r = bal / dp;
    chartData.push({ age: a, balance: Math.round(bal), rmd: Math.round(r) });
    bal = (bal - r) * (1 + rate / 100);
  }

  const breakdown = [
    { label: "Account Balance (Dec 31, prior yr)", value: `$${balance.toLocaleString()}` },
    { label: "Age", value: `${age} years old` },
    { label: "IRS Distribution Period", value: `${distributionPeriod} years` },
    { label: "RMD Amount", value: `$${rmd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Withdrawal Percentage", value: `${withdrawalPct.toFixed(2)}%` },
    { label: "Estimated Federal Tax", value: `$${taxDue.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${taxRate}%)` },
    { label: "After-Tax RMD", value: `$${afterTaxRmd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Remaining Balance", value: `$${remainingBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "RMD This Year", value: `$${rmd.toFixed(2)}` },
    { label: "Withdrawal %", value: `${withdrawalPct.toFixed(2)}%` },
    { label: "Tax Due", value: `$${taxDue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "After-Tax Income", value: `$${afterTaxRmd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Remaining Balance", value: `$${remainingBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly After-Tax", value: `$${(afterTaxRmd / 12).toFixed(0)}/mo` },
  ];

  return { rmd, taxDue, afterTaxRmd, remainingBalance, withdrawalPct, chartData, breakdown, summaryStats };
}

const DEFAULTS = { balance: "500000", age: "73", rate: "6", taxRate: "22" };

export default function RmdCalculator() {
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [age, setAge] = useState(DEFAULTS.age);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [taxRate, setTaxRate] = useState(DEFAULTS.taxRate);
  const [result, setResult] = useState<RmdResult | null>(null);

  const calculate = () => setResult(calcRmd(parseFloat(balance) || 500000, parseInt(age) || 73, parseFloat(rate) || 6, parseFloat(taxRate) || 22));
  const reset = () => { setBalance(DEFAULTS.balance); setAge(DEFAULTS.age); setRate(DEFAULTS.rate); setTaxRate(DEFAULTS.taxRate); setResult(calcRmd(500000, 73, 6, 22)); };
  useEffect(() => { setResult(calcRmd(500000, 73, 6, 22)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is an RMD (Required Minimum Distribution)?", answer: "The IRS requires owners of Traditional IRAs, 401(k)s, SEP IRAs, and most other retirement accounts to begin withdrawing a minimum amount each year starting at age 73 (SECURE 2.0 Act, 2023). The RMD ensures the government eventually collects taxes on these tax-deferred savings. Roth IRAs are exempt from RMDs during the owner's lifetime." },
    { question: "How is the RMD calculated?", answer: "RMD = Account Balance (December 31 of prior year) ÷ Distribution Period. The distribution period comes from the IRS Uniform Lifetime Table, based on your age. Example: Age 73 → distribution period of 26.5. A $500,000 balance → RMD = $500,000 ÷ 26.5 = $18,868. The distribution period decreases each year, so the RMD percentage increases with age." },
    { question: "When must I take my first RMD?", answer: "Your first RMD must be taken by April 1 of the year following the year you turn 73. All subsequent RMDs must be taken by December 31. Important: if you delay your first RMD to April 1, you'll take two distributions in that year (the first RMD plus the second year's RMD), potentially pushing you into a higher tax bracket." },
    { question: "What happens if I miss an RMD?", answer: "Before 2023: 50% excise tax on the missed amount. After SECURE 2.0 (2023): 25% excise tax, reduced to 10% if corrected within 2 years. The IRS has historically waived the penalty for reasonable cause in the first year. Always take your RMD on time — the penalty is steep regardless." },
    { question: "Can I take more than the RMD?", answer: "Yes — you can always withdraw more than the RMD. However, you cannot use excess withdrawals to count toward future years' RMDs. Some retirees take larger distributions in lower-tax years (Roth conversions before 73) to reduce future RMDs and overall lifetime tax burden — a strategy called 'RMD minimization.'" },
    { question: "Are RMDs taxed?", answer: "Yes, RMD withdrawals from Traditional IRAs and 401(k)s are taxed as ordinary income at your federal tax rate. State taxes may also apply. RMDs can trigger higher Medicare premiums (IRMAA surcharges) if they push your income above certain thresholds ($103,000 single / $206,000 married in 2024). Plan distributions carefully to minimize total tax burden." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "RMD Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">RMD Calculator (Required Minimum Distribution)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Account Balance (Dec 31, Prior Year)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Your Age</label><div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} min="72" max="100" className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Expected Return</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Federal Tax Rate</label><div className={inp}><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Required Minimum Distribution</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.rmd.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">After-tax: ${result.afterTaxRmd.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Withdrawal rate: {result.withdrawalPct.toFixed(2)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["RMD Amount", `$${result.rmd.toFixed(0)}`], ["Tax Due", `$${result.taxDue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["After-Tax", `$${result.afterTaxRmd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">RMD Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "RMD Amount" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance & RMD Projection (20 Years)</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="age" tick={{ fontSize: 11 }} label={{ value: "Age", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="balance" name="Balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} /><Area type="monotone" dataKey="rmd" name="RMD" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={1.5} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an RMD Calculator?</h2>
            <p>A <strong>Required Minimum Distribution (RMD) calculator</strong> computes the mandatory annual withdrawal from your Traditional IRA, 401(k), or other qualified retirement account, as required by the IRS. Using the official IRS Uniform Lifetime Table, it determines the exact distribution period for your age and calculates both your gross RMD and after-tax take-home amount.</p>
            <h2>How RMDs Are Calculated</h2>
            <p>RMD = Prior Year-End Account Balance ÷ IRS Distribution Period (Uniform Lifetime Table). Distribution period decreases with age: 73 years = 26.5 distribution period. 80 years = 20.2. 90 years = 12.2. The percentage of your account you must withdraw increases every year — from about 3.77% at 73 to over 8% at 90.</p>
            <h2>2024 RMD Rules (SECURE 2.0)</h2>
            <p>Starting age: 73 (increased from 72 in 2023 under SECURE 2.0). Missed RMD penalty: 25% of the missed amount (reduced from 50%). Penalty reduction: correcting within 2 years reduces the penalty to 10%. Roth IRAs: no RMDs during the owner&apos;s lifetime. Roth 401(k)s: also exempt from RMDs starting in 2024.</p>
            <h2>RMD Tax Planning Strategies</h2>
            <p>Roth conversions before age 73 reduce future RMD size and tax burden. Qualified Charitable Distributions (QCDs) allow up to $105,000/year (2024) to go directly to charity, satisfying the RMD while excluding it from taxable income. Spread distributions across the year rather than taking a lump sum to manage withholding. Monitor Medicare IRMAA thresholds — higher income triggers surcharges on Part B and D premiums.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/required-minimum-distribution-calculator" />
          <PopularCalculators exclude="/calculator/required-minimum-distribution-calculator" />
        </div>
      </div>
    </>
  );
}
