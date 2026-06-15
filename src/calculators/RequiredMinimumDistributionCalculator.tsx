"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RMDResult {
  rmd: number;
  distributionPeriod: number;
  portfolioAfter: number;
  taxOwed: number;
  effectiveRate: number;
  breakdown: { label: string; value: string }[];
  projections: { age: number; balance: number; rmd: number }[];
  summaryStats: { label: string; value: string }[];
}

// IRS Uniform Lifetime Table (simplified - key ages)
const ULT: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4,
};

function calcRMD(balance: number, age: number, taxRate: number, growthRate: number): RMDResult {
  const period = ULT[Math.min(Math.max(age, 72), 100)] || 27.4;
  const rmd = balance / period;
  const portfolioAfter = balance - rmd;
  const taxOwed = rmd * (taxRate / 100);
  const afterTaxRMD = rmd - taxOwed;
  const effectiveRate = taxRate;

  // 10-year projection
  const projections: { age: number; balance: number; rmd: number }[] = [];
  let bal = balance;
  for (let i = 0; i < 10; i++) {
    const a = age + i;
    const dp = ULT[Math.min(a, 100)] || 6.4;
    const r = bal / dp;
    projections.push({ age: a, balance: Math.round(bal), rmd: Math.round(r) });
    bal = (bal - r) * (1 + growthRate / 100);
    if (bal < 0) break;
  }

  const breakdown = [
    { label: "Account Balance", value: `$${balance.toLocaleString()}` },
    { label: "Your Age", value: `${age} years` },
    { label: "Distribution Period", value: `${period} years` },
    { label: "Required Minimum Distribution", value: `$${rmd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Federal Tax (Estimated)", value: `$${taxOwed.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Net After-Tax RMD", value: `$${(rmd - taxOwed).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Remaining Portfolio", value: `$${portfolioAfter.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Withdrawal Rate", value: `${((rmd / balance) * 100).toFixed(2)}%` },
  ];

  const summaryStats = [
    { label: "RMD Amount", value: `$${rmd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "After-Tax RMD", value: `$${(rmd - taxOwed).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Distribution Period", value: `${period} yrs` },
    { label: "Withdrawal %", value: `${((rmd / balance) * 100).toFixed(2)}%` },
    { label: "Tax Owed", value: `$${taxOwed.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "IRS Table", value: "Uniform Lifetime" },
  ];

  return { rmd, distributionPeriod: period, portfolioAfter, taxOwed, effectiveRate, breakdown, projections, summaryStats };
}

export default function RequiredMinimumDistributionCalculator() {
  const [balance, setBalance] = useState("500000");
  const [age, setAge] = useState("73");
  const [taxRate, setTaxRate] = useState("22");
  const [growth, setGrowth] = useState("5");
  const [result, setResult] = useState<RMDResult | null>(null);

  const calculate = () => {
    const b = parseFloat(balance.replace(/,/g, "")) || 0;
    const a = parseInt(age) || 73;
    const t = parseFloat(taxRate) || 22;
    const g = parseFloat(growth) || 5;
    if (b > 0 && a >= 72) setResult(calcRMD(b, a, t, g));
  };

  useEffect(() => { setResult(calcRMD(500000, 73, 22, 5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is a Required Minimum Distribution (RMD)?", answer: "An RMD is the minimum amount the IRS requires you to withdraw from traditional IRAs, 401(k)s, 403(b)s, and other tax-deferred retirement accounts each year once you reach age 73 (as of the SECURE 2.0 Act, effective 2023). RMDs are calculated by dividing your prior year-end account balance by your life expectancy factor from the IRS Uniform Lifetime Table. Failure to take your RMD results in a 25% excise tax on the amount not withdrawn (reduced to 10% if corrected timely)." },
    { question: "At what age do RMDs start?", answer: "Under the SECURE 2.0 Act (2022), the RMD starting age is now 73 for those who turn 72 after December 31, 2022. For those born after 1960, the age will increase to 75. Roth IRAs do NOT have RMDs during the owner's lifetime. If you turned 72 before 2023, you were already subject to RMDs under previous rules (age 72)." },
    { question: "How is the RMD calculated?", answer: "RMD = Account Balance (as of December 31 of prior year) ÷ Life Expectancy Factor (from IRS Uniform Lifetime Table). At age 73, the factor is 26.5, so a $500,000 balance requires an RMD of $500,000 ÷ 26.5 = $18,868. If your sole beneficiary is a spouse more than 10 years younger, you use the more favorable Joint Life Expectancy Table." },
    { question: "Do RMDs apply to Roth IRAs?", answer: "No — Roth IRAs are NOT subject to RMDs during the original owner's lifetime. This is one of the key advantages of Roth accounts for estate planning. However, Roth 401(k)s were subject to RMDs until the SECURE 2.0 Act eliminated this requirement starting in 2024. Roth IRA beneficiaries (non-spouse) are subject to a 10-year distribution rule." },
    { question: "What happens if I don't take my RMD?", answer: "If you fail to withdraw your full RMD, the IRS imposes a 25% excise tax on the amount not withdrawn. If corrected in a timely manner (within the correction window), this is reduced to 10%. The excise tax is reported on Form 5329. There is a process to request a waiver from the IRS in cases of reasonable error. Always take your RMD before December 31 each year (first RMD has until April 1 of the following year)." },
    { question: "Can I withdraw more than my RMD?", answer: "Yes — the RMD is a minimum, not a maximum. You may withdraw any amount above the RMD at any time. However, all withdrawals from traditional IRAs and 401(k)s are taxable as ordinary income. Some people choose to convert excess amounts to Roth IRAs (Roth conversion) to reduce future RMDs and potentially tax-free growth, though this triggers current-year taxes on the converted amount." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "RMD Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Required Minimum Distribution (RMD) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Retirement Account Balance</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Your Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} min={72} max={110} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Federal Tax Rate</label>
                <div className={inp}><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} min={0} max={50} className={ci} /><span className={suf}>%</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Expected Annual Growth Rate</label>
              <div className={inp}><input type="number" value={growth} onChange={e => setGrowth(e.target.value)} min={0} max={20} step={0.5} className={ci} /><span className={suf}>%/yr</span></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate RMD
              </button>
              <button onClick={() => { setBalance("500000"); setAge("73"); setTaxRate("22"); setGrowth("5"); setResult(calcRMD(500000, 73, 22, 5)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Required Minimum Distribution</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.rmd.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-base text-muted-foreground mt-1">Distribution period: {result.distributionPeriod} yrs · After-tax: ${(result.rmd - result.taxOwed).toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Tax Owed", `$${result.taxOwed.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Remaining", `$${result.portfolioAfter.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Withdrawal%", `${((result.rmd / parseFloat(balance)) * 100).toFixed(2)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">RMD Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Required Minimum Distribution" ? "font-bold" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">10-Year RMD Projection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.projections} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} labelFormatter={v => `Age ${v}`} />
                    <Area type="monotone" dataKey="balance" name="Balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" />
                    <Area type="monotone" dataKey="rmd" name="RMD" stroke="#f59e0b" fill="#f59e0b20" />
                  </AreaChart>
                </ResponsiveContainer>
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
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is a Required Minimum Distribution?</h2>
            <p>A Required Minimum Distribution (RMD) is the annual amount the IRS mandates you withdraw from tax-deferred retirement accounts — traditional IRAs, 401(k)s, 403(b)s, SEP IRAs, and SIMPLE IRAs — starting at age 73 (SECURE 2.0 Act, 2022). These rules exist because the IRS deferred taxes when you contributed to these accounts; RMDs ensure those taxes are eventually collected. The <strong>RMD calculator</strong> uses the IRS Uniform Lifetime Table to compute your precise annual distribution requirement.</p>
            <h2>RMD Calculation Formula</h2>
            <p>RMD = Prior Year-End Account Balance ÷ Life Expectancy Factor (IRS Uniform Lifetime Table). Example: $500,000 balance at age 73 (factor: 26.5) = $500,000 ÷ 26.5 = $18,868 RMD. Each year, the factor decreases, meaning the percentage of your portfolio you must withdraw increases as you age. At 75, factor = 24.6 (RMD ≈ 4.1%). At 85, factor = 16.0 (RMD ≈ 6.3%). At 95, factor = 8.9 (RMD ≈ 11.2%).</p>
            <h2>SECURE 2.0 Act Changes (2022)</h2>
            <p>The SECURE 2.0 Act significantly changed RMD rules: RMD age increased from 72 to 73 (and will rise to 75 for those born after 1960). Roth 401(k)s are no longer subject to RMDs starting in 2024. The excise tax for missed RMDs was reduced from 50% to 25% (10% if corrected timely). These changes provide more planning flexibility for retirees.</p>
            <h2>Strategies to Manage RMD Tax Impact</h2>
            <p>Qualified Charitable Distributions (QCDs): donate up to $105,000/year directly from your IRA to charity — counts toward your RMD but excluded from taxable income. Roth conversions before age 73: converting traditional IRA funds to Roth reduces future RMD obligations. Aggregating accounts: multiple IRA RMDs can be satisfied by taking the total from any single IRA. Related calculators: <a href="/calculator/roth-ira-calculator">Roth IRA Calculator</a>, <a href="/calculator/retirement-calculator">Retirement Calculator</a>, <a href="/calculator/401k-calculator">401(k) Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/required-minimum-distribution-calculator" />
          <PopularCalculators exclude="/calculator/required-minimum-distribution-calculator" />
        </div>
      </div>
    </>
  );
}
