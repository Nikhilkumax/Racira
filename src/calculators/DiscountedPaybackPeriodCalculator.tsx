"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtM = (n: number) => Math.abs(n) >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : Math.abs(n) >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

function parseFlows(raw: string) {
  return raw.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
}

function calcDPP(investment: number, flows: number[], rate: number) {
  const r = rate / 100;
  let cumDisc = -investment, cumSimple = -investment, dpbp: number|null = null, pbp: number|null = null;
  let npv = -investment;
  const schedule = flows.map((cf, i) => {
    const yr = i + 1;
    const dcf = cf / Math.pow(1 + r, yr);
    cumSimple += cf; cumDisc += dcf; npv += dcf;
    if (pbp === null && cumSimple >= 0) pbp = yr - 1 + (cumSimple - cf < 0 ? Math.abs(cumSimple - cf) / cf : 0);
    if (dpbp === null && cumDisc >= 0) dpbp = yr - 1 + (cumDisc - dcf < 0 ? Math.abs(cumDisc - dcf) / dcf : 0);
    return { yr, cf, dcf: parseFloat(dcf.toFixed(2)), cum: parseFloat(cumDisc.toFixed(2)) };
  });
  const pi = investment > 0 ? (npv + investment) / investment : 0;
  let lo = -0.99, hi = 10, irr = 0;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const v = flows.reduce((s, c, i) => s + c / Math.pow(1 + mid, i + 1), -investment);
    if (Math.abs(v) < 0.1) { irr = mid * 100; break; }
    v > 0 ? (lo = mid) : (hi = mid);
    irr = mid * 100;
  }
  return { dpbp, pbp, npv, irr, pi, schedule };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">Year {label}</p>
    {payload.map((p: any) => <p key={p.name} className="font-semibold" style={{ color: p.fill }}>{p.name}: {fmtM(p.value)}</p>)}
  </div>
) : null;

export default function DiscountedPaybackPeriodCalculator() {
  const [inv, setInv] = useState("100000");
  const [flows, setFlows] = useState("20000, 25000, 30000, 35000, 30000, 25000");
  const [rate, setRate] = useState("10");
  const [res, setRes] = useState<ReturnType<typeof calcDPP>|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcDPP(parseFloat(inv)||100000, parseFlows(flows), parseFloat(rate)||10));
  const reset = () => { setInv("100000"); setFlows("20000, 25000, 30000, 35000, 30000, 25000"); setRate("10"); setRes(calcDPP(100000,[20000,25000,30000,35000,30000,25000],10)); };

  const faqs = [
    { question: "What is the Discounted Payback Period?", answer: "The DPP measures how long it takes to recover an investment using present-value cash flows, not nominal ones. It accounts for the time value of money, always yielding a longer (more conservative) result than the simple payback period." },
    { question: "How is DPP different from the simple Payback Period?", answer: "Simple payback sums nominal cash flows. DPP discounts each cash flow first using your required rate of return. At a 10% discount rate, $25,000 in Year 2 is worth only $20,661 today — meaning DPP will always be ≥ the simple payback period." },
    { question: "What discount rate should I use?", answer: "Use your WACC (Weighted Average Cost of Capital) for business investments, or your required rate of return for personal projects. Common ranges: 8–10% for low-risk projects, 12–15% for moderate risk, 20%+ for startup or high-risk ventures." },
    { question: "What is the Profitability Index (PI)?", answer: "PI = (NPV + Initial Investment) / Initial Investment. PI > 1.0 means the project creates value. PI = 1.0 means breakeven. PI < 1.0 means value destruction. It's used to rank mutually exclusive projects when capital is constrained." },
    { question: "What are DPP's limitations?", answer: "DPP ignores all cash flows occurring after payback — potentially rejecting high-value long-term projects. Always combine DPP with NPV and IRR for a complete capital budgeting decision." },
    { question: "Can DPP be used for projects with uneven cash flows?", answer: "Yes — this is where DPP is most valuable. This calculator handles any stream of annual cash flows, including negative mid-project cash flows (reinvestment periods). The cumulative discounted schedule shows exactly when recovery occurs." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Financial",href:"/calculator#financial"},{label:"Discounted Payback Period Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Discounted Payback Period Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Investment Details</h2>
            <CompactInput id="inv" label="Initial Investment" value={inv} onChange={setInv} prefix="$" />
            <CompactInput id="rate" label="Discount Rate (WACC)" value={rate} onChange={setRate} suffix="%" />
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Annual Cash Flows (comma-separated)</label>
              <textarea value={flows} onChange={e => setFlows(e.target.value)} rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Enter each year's cash flow separated by commas (e.g. 20000, 25000, 30000)</p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center justify-center" aria-label="Reset">
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
                  <h2 className="text-2xl font-bold mb-3">Analysis Results</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Discounted Payback Period</div>
                  <div className="text-4xl font-extrabold tracking-tight">{res.dpbp !== null ? `${fmt(res.dpbp,1)} years` : "Not Recovered"}</div>
                  <div className="text-sm text-muted-foreground mt-1">NPV: {fmtM(res.npv)} · PI: {fmt(res.pi,2)}x · IRR: {fmt(res.irr)}%</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Year</th><th className="p-2.5 text-right">Cash Flow</th>
                      <th className="p-2.5 text-right">Discounted CF</th><th className="p-2.5 pr-3 text-right">Cumulative</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {res.schedule.map(r => (
                        <tr key={r.yr} className={`hover:bg-secondary/20 ${r.cum >= 0 ? "bg-green-500/10 font-semibold" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.yr}</td>
                          <td className="p-2.5 text-right">{fmtM(r.cf)}</td>
                          <td className="p-2.5 text-right">{fmtM(r.dcf)}</td>
                          <td className={`p-2.5 pr-3 text-right font-bold ${r.cum >= 0 ? "text-green-600 dark:text-green-400" : ""}`}>{fmtM(r.cum)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">Cumulative Discounted Cash Flow</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={190}>
                      <BarChart data={[{yr:0,cum:-(parseFloat(inv)||0)},...res.schedule.map(r=>({yr:r.yr,cum:r.cum}))]} margin={{top:4,right:8,left:0,bottom:4}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="yr" tick={{fontSize:11}} />
                        <YAxis tick={{fontSize:11}} tickFormatter={v=>fmtM(v)} />
                        <Tooltip content={<TTip />} />
                        <ReferenceLine y={0} stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4 2" />
                        <Bar dataKey="cum" fill="hsl(var(--primary))" radius={[3,3,0,0]} name="Cum. Disc. CF" />
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    {label:"Disc. Payback",value:res.dpbp!==null?`${fmt(res.dpbp,1)} yrs`:"N/A"},
                    {label:"Simple Payback",value:res.pbp!==null?`${fmt(res.pbp,1)} yrs`:"N/A"},
                    {label:"Discount Rate",value:`${rate}%`},
                    {label:"NPV",value:fmtM(res.npv)},
                    {label:"IRR",value:`${fmt(res.irr)}%`},
                    {label:"Profitability Index",value:`${fmt(res.pi,2)}x`},
                  ].map(item => (
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Discounted Payback Period?</h2>
            <p>The Discounted Payback Period (DPP) is a capital budgeting metric that calculates how long it takes to recover an initial investment using the present value of future cash flows. Unlike the simple payback period, DPP accounts for the time value of money — a dollar received in the future is worth less than a dollar today, and DPP quantifies this rigorously by discounting every cash flow at your required rate of return before accumulating them.</p>
            <p>This makes DPP a more conservative and realistic measure of investment recovery. A project that recovers its cost in 3 years on a simple basis may take 3.8 years on a discounted basis at a 10% rate. The difference matters enormously for capital allocation decisions in corporations, private equity, and real estate development.</p>
            <h2>How to Calculate the Discounted Payback Period</h2>
            <p>Step 1: Identify your initial investment (Year 0 outflow). Step 2: Discount each future cash flow: DCF_t = CF_t / (1 + r)^t where r is your discount rate and t is the year. Step 3: Accumulate discounted cash flows, starting at −(Initial Investment). Step 4: The DPP is the year when this running total first crosses zero, interpolated for precision.</p>
            <p>This calculator automates all steps and produces a full year-by-year discounted schedule. Rows highlighted in green indicate the payback threshold has been crossed. The chart visually identifies the break-even point where the cumulative line crosses the zero axis.</p>
            <h2>Reading the Results</h2>
            <p>The <strong>Net Present Value (NPV)</strong> tells you the total value created or destroyed in today's dollars — positive NPV means the project is worth doing at your discount rate. The <strong>IRR</strong> is the discount rate at which NPV equals zero — compare it to your cost of capital. The <strong>Profitability Index (PI)</strong> of 1.0 means you get exactly your investment back in present value terms; above 1.0 means value creation. Use all four metrics together for a complete capital budgeting decision.</p>
            <h2>Practical Applications</h2>
            <p>Manufacturing facilities use DPP to evaluate equipment purchases and assess how quickly capital is recovered in a capital-intensive environment. Real estate developers use DPP to compare project timelines when credit lines have time-sensitive covenants. Tech companies evaluating software projects use DPP alongside NPV to balance speed-to-recovery with total value. Private equity investors use DPP when evaluating add-on acquisitions with defined hold periods.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/discounted-payback-period-calculator" />
          <PopularCalculators exclude="/calculator/discounted-payback-period-calculator" />
        </div>
      </div>
    </>
  );
}
