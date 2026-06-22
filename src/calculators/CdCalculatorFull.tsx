"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, PiggyBank } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number) => `$${fmt(n)}`;

const Inp = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface CDResult {
  maturityValue: number;
  interestEarned: number;
  effectiveAPY: number;
  totalDeposit: number;
  yearlyData: { year: number; balance: number; interest: number }[];
}

export default function CdCalculatorFull() {
  const [principal, setPrincipal] = useState("10000");
  const [apy, setApy] = useState("4.85");
  const [term, setTerm] = useState("12");
  const [termUnit, setTermUnit] = useState<"months" | "years">("months");
  const [compounding, setCompounding] = useState<"daily" | "monthly" | "quarterly" | "annually">("daily");
  const [res, setRes] = useState<CDResult | null>(null);

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const p = parseFloat(principal) || 10000;
    const r = parseFloat(apy) / 100 || 0.0485;
    const months = termUnit === "months" ? parseFloat(term) || 12 : (parseFloat(term) || 1) * 12;
    const years = months / 12;

    const nMap = { daily: 365, monthly: 12, quarterly: 4, annually: 1 };
    const n = nMap[compounding];
    const maturityValue = p * Math.pow(1 + r / n, n * years);
    const interestEarned = maturityValue - p;
    const effectiveAPY = (Math.pow(1 + r / n, n) - 1) * 100;

    const yearlyData: { year: number; balance: number; interest: number }[] = [];
    const totalYears = Math.ceil(years);
    for (let y = 0; y <= totalYears; y++) {
      const t = Math.min(y, years);
      const balance = p * Math.pow(1 + r / n, n * t);
      yearlyData.push({ year: y, balance: parseFloat(balance.toFixed(2)), interest: parseFloat((balance - p).toFixed(2)) });
    }

    setRes({ maturityValue, interestEarned, effectiveAPY, totalDeposit: p, yearlyData });
  };

  const reset = () => {
    setPrincipal("10000"); setApy("4.85"); setTerm("12");
    setTermUnit("months"); setCompounding("daily");
    setTimeout(calculate, 0);
  };

  const faqs = [
    { question: "What is a Certificate of Deposit (CD)?", answer: "A CD is a savings product offered by banks and credit unions where you deposit a fixed sum of money for a specified term (e.g., 6 months, 1 year, 5 years) in exchange for a guaranteed interest rate. CDs are FDIC-insured up to $250,000 per depositor and typically offer higher rates than regular savings accounts because you agree to leave the money untouched for the term." },
    { question: "What is APY vs APR for CDs?", answer: "APY (Annual Percentage Yield) reflects the actual return including compound interest effects. APR (Annual Percentage Rate) is the nominal rate before compounding. CDs are quoted in APY, which is what you truly earn. A CD with 4.85% APY compounded daily gives you exactly 4.85% on your money annually — which is slightly more than 4.85% APR compounded annually." },
    { question: "What happens if I withdraw early?", answer: "Most CDs charge an early withdrawal penalty, typically 3–12 months of interest depending on the term. Some no-penalty CDs exist but usually offer lower rates. If you need liquidity, consider a CD ladder — spreading money across multiple maturities — so some CDs always mature soon." },
    { question: "Are CD rates fixed or variable?", answer: "Standard CDs have fixed rates locked in for the entire term. Some banks offer variable-rate CDs or step-up CDs that adjust at intervals. In a rising rate environment, fixed CDs may become less competitive. Consider shorter-term CDs if you expect rates to continue rising." },
    { question: "How does compounding frequency affect my CD return?", answer: "More frequent compounding means interest earns interest sooner, boosting your return. Daily compounding on a $10,000 CD at 4.85% APR earns slightly more than annual compounding. However, banks typically quote APY, which already accounts for compounding — making APY the apples-to-apples comparison metric." },
    { question: "Is a CD better than a high-yield savings account?", answer: "CDs offer higher rates for committing to a term and locking up funds. HYSAs offer flexibility — you can withdraw anytime — but rates are variable and can drop. For money you won't need for a specific period (e.g., emergency fund buffer, vacation fund), a CD often beats a HYSA rate while keeping funds completely safe with FDIC insurance." },
    { question: "What is a CD ladder strategy?", answer: "A CD ladder involves spreading deposits across multiple CDs with staggered maturities (e.g., 3-month, 6-month, 1-year, 2-year, 3-year). As each CD matures, you reinvest at current rates. This provides regular liquidity while capturing higher rates from longer-term CDs, balancing flexibility and yield." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "CD Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CD Calculator — Certificate of Deposit</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">CD Parameters</h2>
            <div className="flex flex-col gap-3">
              <Inp id="principal" label="Initial Deposit" value={principal} onChange={setPrincipal} prefix="$" />
              <Inp id="apy" label="Annual Percentage Yield (APY)" value={apy} onChange={setApy} suffix="%" />

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">CD Term</span>
                <div className="flex gap-2">
                  <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex-1">
                    <input type="number" step="1" value={term} onChange={e => setTerm(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                  </div>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(["months", "years"] as const).map(u => (
                      <button key={u} type="button" onClick={() => setTermUnit(u)} className={`px-3 text-sm font-semibold transition-colors h-10 ${termUnit === u ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                        {u === "months" ? "Mo" : "Yr"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">Compounding</span>
                <div className="grid grid-cols-2 rounded-md border border-border overflow-hidden">
                  {(["daily", "monthly", "quarterly", "annually"] as const).map(c => (
                    <button key={c} type="button" onClick={() => setCompounding(c)} className={`py-2 text-sm font-semibold transition-colors ${compounding === c ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick term buttons */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Common Terms</span>
                <div className="flex flex-wrap gap-1.5">
                  {[["3 mo", "3", "months"], ["6 mo", "6", "months"], ["1 yr", "1", "years"], ["2 yr", "2", "years"], ["5 yr", "5", "years"]].map(([label, val, unit]) => (
                    <button key={label} type="button" onClick={() => { setTerm(val); setTermUnit(unit as any); }} className="px-2.5 py-1 text-xs font-bold rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Results</h2>
                  <PiggyBank className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Maturity Value</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtUSD(res.maturityValue)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Interest Earned: {fmtUSD(res.interestEarned)}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Detail</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Principal Deposit", value: fmtUSD(res.totalDeposit) },
                        { label: "Interest Earned", value: fmtUSD(res.interestEarned) },
                        { label: "Maturity Value", value: fmtUSD(res.maturityValue) },
                        { label: "Effective APY", value: `${fmt(res.effectiveAPY)}%` },
                        { label: "Return on Investment", value: `${fmt((res.interestEarned / res.totalDeposit) * 100)}%` },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Balance Growth Over Time</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={res.yearlyData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any, n: string) => [fmtUSD(v), n === "balance" ? "Balance" : "Interest"]} labelFormatter={l => `Year ${l}`} />
                      <Legend />
                      <Bar dataKey="balance" name="Balance" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="interest" name="Interest" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Principal", value: fmtUSD(res.totalDeposit) },
                    { label: "Interest", value: fmtUSD(res.interestEarned) },
                    { label: "Maturity", value: fmtUSD(res.maturityValue) },
                    { label: "APY", value: `${fmt(res.effectiveAPY)}%` },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a CD Calculator?</h2>
            <p>A CD (Certificate of Deposit) calculator helps you determine exactly how much you'll earn by depositing a lump sum into a CD at a given Annual Percentage Yield (APY) for a specific term. CDs are one of the safest investments available — they're FDIC-insured up to $250,000 per depositor per institution — and typically offer significantly higher interest rates than standard savings accounts because you agree to leave your money untouched for the CD's term.</p>
            <p>Understanding CD math is critical for planning short-term savings goals: down payment funds, vacation savings, emergency fund top-up, or simply parking cash you won't need soon. This calculator handles all major compounding frequencies and shows you a year-by-year breakdown so you can see exactly how your money grows.</p>

            <h2>How CD Interest Is Calculated</h2>
            <p>CD interest uses the compound interest formula: <strong>A = P × (1 + r/n)^(n×t)</strong>, where A is the maturity value, P is the principal deposit, r is the annual rate (APR), n is the compounding frequency per year, and t is the term in years. Most CD rates are quoted as APY, which already reflects compounding effects.</p>
            <p>Daily compounding (n=365) produces the highest return for a given APR. A $10,000 CD at 4.85% APY compounded daily for 12 months yields $10,485 at maturity — exactly $485 in interest. The same deposit in a standard savings account at 0.50% APY earns only $50. That's nearly a 10x difference for the same FDIC protection level.</p>

            <h2>Current CD Rate Environment</h2>
            <p>As of 2024-2025, high-yield CDs at online banks offer rates between 4.5% and 5.5% APY, well above the long-term average of 2-3%. This is a historically attractive environment for CD investors. Brick-and-mortar banks typically offer much lower rates (0.5-2%) due to higher operating costs and less competition for deposits. Always compare rates at FDIC-insured online banks and credit unions before committing.</p>

            <h2>CD Laddering Strategy</h2>
            <p>Instead of putting all your savings in one long-term CD, consider laddering: divide your savings across 5 CDs maturing at 1, 2, 3, 4, and 5 years. Each year, the shortest CD matures, giving you liquidity. You reinvest that matured CD into a new 5-year CD. Over time, all your CDs are earning 5-year (higher) rates, but you get annual access to a portion of your funds.</p>

            <h2>Choosing the Right CD Term</h2>
            <p>Match your CD term to when you'll need the money. For a home down payment in 18 months, use a 12 or 18-month CD. For retirement savings supplement, 2-5 year CDs may make sense. Don't lock funds away in long-term CDs if there's meaningful probability you'll need them — early withdrawal penalties typically cost 3-6 months of interest.</p>

            <h2>CDs vs High-Yield Savings Accounts</h2>
            <p>Both are FDIC-insured and safe. HYSAs offer variable rates (can rise or fall) and unlimited withdrawals. CDs offer locked-in guaranteed rates for the term. In a rising rate environment, HYSAs outperform over time. In a stable or falling rate environment, locking in a good CD rate beats HYSA rates. Many savvy savers use both: HYSA for true emergency fund, CDs for medium-term savings goals.</p>

            <h2>Tips for Maximizing CD Returns</h2>
            <p>Shop online banks and credit unions — they offer 3-5× higher rates than big banks. Compare APY, not APR. Check for bump-up CDs that let you raise your rate once if rates increase. Consider no-penalty CDs if flexibility matters. Use the FDIC limit of $250,000 per institution as a guide — spread large deposits across multiple banks for full insurance coverage. Always confirm FDIC or NCUA (for credit unions) insurance before depositing.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cd-calculator" />
          <PopularCalculators exclude="/calculator/cd-calculator" />
        </div>
      </div>
    </>
  );
}
