"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n)>=1e6 ? `$${(n/1e6).toFixed(2)}M` : Math.abs(n)>=1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

function calcTimesInterestEarned(ebit: number, interestExpense: number) {
  const tie = interestExpense > 0 ? ebit / interestExpense : Infinity;
  const coverageRatio = tie;
  const debtServiceCoverage = ebit / interestExpense;
  const status = tie >= 3 ? "Strong" : tie >= 2 ? "Adequate" : tie >= 1.5 ? "Borderline" : tie >= 1 ? "Weak" : "Critical";
  const statusColor = tie >= 3 ? "green" : tie >= 2 ? "blue" : tie >= 1.5 ? "yellow" : "red";
  const benchmarks = [
    { sector: "Technology", tie: 12.5 },
    { sector: "Healthcare", tie: 8.2 },
    { sector: "Retail", tie: 5.1 },
    { sector: "Manufacturing", tie: 4.3 },
    { sector: "Utilities", tie: 3.5 },
    { sector: "Energy", tie: 2.8 },
  ];
  return { tie, coverageRatio, debtServiceCoverage, status, statusColor, benchmarks };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">{label}</p>
    <p className="text-primary font-semibold">TIE: {payload[0]?.value?.toFixed(1)}x</p>
  </div>
) : null;

export default function TimesInterestEarnedCalculator() {
  const [ebit, setEbit] = useState("3500000");
  const [interest, setInterest] = useState("700000");
  const [res, setRes] = useState<ReturnType<typeof calcTimesInterestEarned>|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcTimesInterestEarned(parseFloat(ebit)||0, parseFloat(interest)||1));
  const reset = () => { setEbit("3500000"); setInterest("700000"); setRes(calcTimesInterestEarned(3500000,700000)); };

  const faqs = [
    { question: "What is the Times Interest Earned ratio?", answer: "Times Interest Earned (TIE), also called the Interest Coverage Ratio, measures how many times a company can cover its interest payments from operating earnings. Formula: TIE = EBIT / Interest Expense. A TIE of 5x means the company earns 5 times its interest obligations — strong financial health." },
    { question: "What is a good TIE ratio?", answer: "Generally, TIE ≥ 3x is considered healthy across most industries. TIE of 1.5–2x is borderline — the company can service debt but has little cushion for earnings decline. TIE < 1x means the company cannot cover interest from operations and is at high bankruptcy risk." },
    { question: "Why is EBIT used instead of net income?", answer: "EBIT (Earnings Before Interest and Taxes) is used because interest payments are made before taxes are calculated, and including interest itself in net income would create circular logic. EBIT represents the pure operating earnings available to cover debt obligations." },
    { question: "What is the difference between TIE and DSCR?", answer: "TIE only measures interest coverage. Debt Service Coverage Ratio (DSCR) includes both interest and principal repayments. DSCR = EBITDA / (Interest + Principal). Lenders often require DSCR > 1.25x before approving loans, making it a stricter test than TIE alone." },
    { question: "How do lenders use TIE?", answer: "Banks and bond rating agencies use TIE as a key covenant metric. Many loan agreements include minimum TIE requirements (e.g., must maintain TIE > 2.0x). Breaching these covenants can trigger acceleration clauses requiring immediate debt repayment." },
    { question: "How does industry affect TIE benchmarks?", answer: "Capital-light industries (tech, software) routinely achieve TIE > 10x. Capital-intensive industries (utilities, telecom, real estate) naturally carry more debt, so TIE of 2–4x is normal and acceptable. Always compare TIE to sector peers, not absolute benchmarks." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Financial",href:"/calculator#financial"},{label:"Times Interest Earned Calculator"}]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Times Interest Earned (TIE) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold pb-2 border-b border-border">Income & Debt Data</h2>
            <CompactInput id="ebit" label="EBIT (Earnings Before Interest & Taxes)" value={ebit} onChange={setEbit} prefix="$" />
            <CompactInput id="int" label="Annual Interest Expense" value={interest} onChange={setInterest} prefix="$" />
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground">
              TIE = EBIT ÷ Interest Expense. Measures how many times operating income covers debt interest obligations. Higher is safer.
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold">Coverage Analysis</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>

                <div className={`border rounded-xl p-5 text-center ${res.statusColor === 'green' ? 'bg-green-500/10 border-green-500/30' : res.statusColor === 'blue' ? 'bg-blue-500/10 border-blue-500/30' : res.statusColor === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Times Interest Earned</div>
                  <div className="text-4xl font-extrabold tracking-tight">{isFinite(res.tie) ? `${fmt(res.tie)}x` : "∞"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Coverage Status: <span className="font-bold">{res.status}</span> · EBIT: {fmtM(parseFloat(ebit)||0)}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        {label:"EBIT",value:fmtM(parseFloat(ebit)||0)},
                        {label:"Interest Expense",value:fmtM(parseFloat(interest)||0)},
                        {label:"Times Interest Earned (TIE)",value:`${fmt(res.tie)}x`,bold:true},
                        {label:"Remaining after interest",value:fmtM((parseFloat(ebit)||0)-(parseFloat(interest)||0))},
                        {label:"Coverage Status",value:res.status,bold:true},
                        {label:"Interest burden %",value:`${fmt(((parseFloat(interest)||0)/(parseFloat(ebit)||1))*100)}%`},
                      ].map(r=>(
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold?"font-bold bg-secondary/30":""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">TIE vs Industry Benchmarks</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={195}>
                      <BarChart data={[{sector:"Your Company",tie:Math.min(isFinite(res.tie)?res.tie:20,20)},...res.benchmarks.map(b=>({sector:b.sector,tie:b.tie}))]} margin={{top:4,right:8,left:0,bottom:4}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="sector" tick={{fontSize:10}} />
                        <YAxis tick={{fontSize:11}} tickFormatter={v=>`${v}x`} />
                        <Tooltip content={<TTip />} />
                        <Bar dataKey="tie" radius={[4,4,0,0]} fill="hsl(var(--primary))" name="TIE Ratio" />
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    {label:"TIE Ratio",value:`${fmt(res.tie)}x`},
                    {label:"Status",value:res.status},
                    {label:"EBIT",value:fmtM(parseFloat(ebit)||0)},
                    {label:"Interest Expense",value:fmtM(parseFloat(interest)||0)},
                    {label:"Interest Burden",value:`${fmt(((parseFloat(interest)||0)/(parseFloat(ebit)||1))*100)}%`},
                    {label:"Safety Buffer",value:fmtM((parseFloat(ebit)||0)-(parseFloat(interest)||0))},
                  ].map(item=>(
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold">{item.value}</span>
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
            <h2>What Is the Times Interest Earned Ratio?</h2>
            <p>The Times Interest Earned (TIE) ratio, also called the Interest Coverage Ratio, is one of the most fundamental solvency metrics in financial analysis. It answers a simple but critical question: how many times can a company pay its annual interest expense out of its operating earnings? The formula is TIE = EBIT / Interest Expense, where EBIT is Earnings Before Interest and Taxes.</p>
            <p>A TIE of 5.0x means the company generates five dollars of operating income for every dollar of interest owed — a strong position with significant cushion for earnings downturns. A TIE below 1.5x signals financial stress; below 1.0x, the company cannot cover interest from operations and must draw on cash reserves or borrow more, both unsustainable paths.</p>
            <h2>Why TIE Matters to Investors and Lenders</h2>
            <p>Credit rating agencies like Moody's and S&P use TIE as a primary input for debt ratings. Investment-grade companies (BBB and above) typically maintain TIE of 3.0x or higher. High-yield ("junk") bonds often come from companies with TIE of 1.5–2.5x. Lenders include minimum TIE covenants in loan agreements, with breaches triggering technical defaults that can force debt repayment or restructuring even when the company hasn't missed payments.</p>
            <h2>TIE vs. Debt Service Coverage Ratio (DSCR)</h2>
            <p>TIE measures only interest coverage. DSCR = EBITDA / (Interest + Principal Repayments) measures whether total debt service — including loan amortization — is covered by operating cash flow. DSCR is a stricter test and the preferred metric for banks evaluating commercial real estate loans and project finance. The typical minimum DSCR requirement is 1.25x, meaning cash flows must be 25% above total debt service to provide adequate safety margin.</p>
            <h2>How to Improve Your TIE Ratio</h2>
            <p>Companies can improve TIE by growing EBIT (through revenue growth or cost cuts), refinancing high-interest debt at lower rates, paying down debt to reduce the interest obligation, or restructuring operations to improve margins. Cyclical businesses often track their minimum TIE across economic cycles to ensure they can service debt even in downturns.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/times-interest-earned-calculator" />
          <PopularCalculators exclude="/calculator/times-interest-earned-calculator" />
        </div>
      </div>
    </>
  );
}
