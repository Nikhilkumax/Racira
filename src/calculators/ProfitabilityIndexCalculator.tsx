"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const CI = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : Math.abs(n) >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

function calcPI(initialInvestment: number, cashFlows: number[], discountRate: number) {
  const r = discountRate / 100;
  let pvCashFlows = 0;
  const yearlyPV: { year: number; cashFlow: number; pv: number; cumPV: number }[] = [];
  let cumPV = 0;
  cashFlows.forEach((cf, i) => {
    const pv = cf / Math.pow(1 + r, i + 1);
    cumPV += pv;
    pvCashFlows += pv;
    yearlyPV.push({ year: i + 1, cashFlow: cf, pv, cumPV });
  });
  const npv = pvCashFlows - initialInvestment;
  const pi = initialInvestment > 0 ? pvCashFlows / initialInvestment : 0;
  const decision = pi > 1 ? "Accept" : pi === 1 ? "Indifferent" : "Reject";
  const irr = (() => {
    let lo = -0.99, hi = 10;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      let npvMid = -initialInvestment;
      cashFlows.forEach((cf, j) => { npvMid += cf / Math.pow(1 + mid, j + 1); });
      if (Math.abs(npvMid) < 0.01) return mid * 100;
      npvMid > 0 ? lo = mid : hi = mid;
    }
    return ((lo + hi) / 2) * 100;
  })();
  return { pvCashFlows, npv, pi, decision, irr, yearlyPV };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">Year {label}</p>
    <p className="text-primary font-semibold">PV: {fmtM(payload[0]?.value || 0)}</p>
  </div>
) : null;

export default function ProfitabilityIndexCalculator() {
  const [investment, setInvestment] = useState("500000");
  const [rate, setRate] = useState("10");
  const [cf1, setCf1] = useState("150000");
  const [cf2, setCf2] = useState("180000");
  const [cf3, setCf3] = useState("200000");
  const [cf4, setCf4] = useState("220000");
  const [cf5, setCf5] = useState("180000");
  const [res, setRes] = useState<ReturnType<typeof calcPI> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcPI(parseFloat(investment) || 500000, [cf1, cf2, cf3, cf4, cf5].map(v => parseFloat(v) || 0), parseFloat(rate) || 10));
  const reset = () => { setInvestment("500000"); setRate("10"); setCf1("150000"); setCf2("180000"); setCf3("200000"); setCf4("220000"); setCf5("180000"); setRes(calcPI(500000, [150000, 180000, 200000, 220000, 180000], 10)); };

  const faqs = [
    { question: "What is the Profitability Index?", answer: "Profitability Index (PI) = Present Value of Future Cash Flows ÷ Initial Investment. A PI > 1 means the project creates value (accept); PI = 1 means break-even; PI < 1 means value destruction (reject). It is also called the Benefit-Cost Ratio in capital budgeting." },
    { question: "How does PI differ from NPV?", answer: "NPV gives an absolute dollar value of value created. PI gives a relative measure — how many dollars of PV you get per dollar invested. PI is superior when comparing projects of different sizes or when capital is rationed, since a $1M project with PI of 1.5 may be preferable to a $10M project with NPV of $1M." },
    { question: "What is a good Profitability Index?", answer: "PI > 1.0 means the project is profitable. PI of 1.2 means you're getting $1.20 in present value for every $1 invested. For capital rationing decisions, projects are typically ranked by PI and selected from highest to lowest until the budget is exhausted." },
    { question: "What discount rate should I use?", answer: "The discount rate should reflect the required rate of return or opportunity cost of capital. Companies typically use their Weighted Average Cost of Capital (WACC). For personal investments, use your expected alternative return. Higher discount rates make future cash flows worth less today." },
    { question: "What is the relationship between PI and IRR?", answer: "Both measure project attractiveness. IRR is the discount rate that makes NPV = 0 (and PI = 1). If IRR > cost of capital, the project is attractive. PI > 1 when the discount rate is below IRR. When PI = 1, IRR = discount rate exactly." },
    { question: "Can PI be used to rank mutually exclusive projects?", answer: "Caution is needed — PI can give misleading rankings for mutually exclusive projects of different sizes. A small project with PI of 2.0 may rank above a large project with PI of 1.3, but the large project may create more absolute value. Always use PI together with NPV for mutually exclusive decisions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Profitability Index Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Profitability Index Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold pb-2 border-b border-border">Project Cash Flows</h2>
            <CI id="inv" label="Initial Investment (Year 0)" value={investment} onChange={setInvestment} prefix="$" />
            <CI id="rate" label="Discount Rate (WACC)" value={rate} onChange={setRate} suffix="%" />
            <div className="border-t border-border pt-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Annual Cash Flows (Years 1–5)</p>
              <div className="grid grid-cols-2 gap-3">
                <CI id="cf1" label="Year 1" value={cf1} onChange={setCf1} prefix="$" />
                <CI id="cf2" label="Year 2" value={cf2} onChange={setCf2} prefix="$" />
                <CI id="cf3" label="Year 3" value={cf3} onChange={setCf3} prefix="$" />
                <CI id="cf4" label="Year 4" value={cf4} onChange={setCf4} prefix="$" />
                <CI id="cf5" label="Year 5" value={cf5} onChange={setCf5} prefix="$" />
              </div>
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
                  <h2 className="text-lg font-bold">Investment Analysis</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className={`rounded-xl p-5 text-center border ${res.pi >= 1 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Profitability Index</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(res.pi, 3)}x</div>
                  <div className="text-sm text-muted-foreground mt-1">Decision: <span className={`font-bold ${res.pi >= 1 ? "text-green-500" : "text-red-500"}`}>{res.decision}</span> · NPV: {fmtM(res.npv)}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { l: "Initial Investment", v: fmtM(parseFloat(investment) || 0) },
                        { l: "PV of Cash Flows", v: fmtM(res.pvCashFlows), b: true },
                        { l: "Net Present Value (NPV)", v: fmtM(res.npv), b: true },
                        { l: "Profitability Index (PI)", v: `${fmt(res.pi, 3)}x`, b: true },
                        { l: "Internal Rate of Return", v: `${fmt(res.irr)}%` },
                        { l: "Decision", v: res.decision },
                      ].map(r => (
                        <tr key={r.l} className={`hover:bg-secondary/20 ${r.b ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.l}</td>
                          <td className="p-2.5 pr-3 text-right">{r.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">Present Value of Cash Flows by Year</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={195}>
                      <BarChart data={res.yearlyPV} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                        <Tooltip content={<TTip />} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="pv" radius={[4, 4, 0, 0]} name="PV">
                          {res.yearlyPV.map((_, i) => <Cell key={i} fill={`hsl(var(--primary) / ${0.5 + i * 0.1})`} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border font-bold text-muted-foreground uppercase">
                      <th className="p-2 pl-3">Year</th><th className="p-2 text-right">Cash Flow</th><th className="p-2 text-right">PV</th><th className="p-2 pr-3 text-right">Cumulative PV</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {res.yearlyPV.map(row => (
                        <tr key={row.year} className="hover:bg-secondary/20">
                          <td className="p-2 pl-3 font-semibold">Year {row.year}</td>
                          <td className="p-2 text-right">{fmtM(row.cashFlow)}</td>
                          <td className="p-2 text-right">{fmtM(row.pv)}</td>
                          <td className="p-2 pr-3 text-right">{fmtM(row.cumPV)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>What Is the Profitability Index?</h2>
            <p>The Profitability Index (PI), also called the Benefit-Cost Ratio or Value Investment Ratio, is a capital budgeting metric that measures the value created per dollar invested in a project. The formula is PI = Present Value of Future Cash Flows ÷ Initial Investment. A PI greater than 1 means the project creates more value than it costs — it should be accepted. A PI below 1 means the project destroys value and should be rejected.</p>
            <p>Unlike Net Present Value (NPV), which gives an absolute dollar figure, the Profitability Index provides a relative efficiency measure. This makes it especially valuable when a company has limited capital and must choose between multiple profitable projects — a situation called capital rationing. By ranking projects from highest to lowest PI, managers can maximize total value creation within their budget constraints.</p>
            <h2>How to Calculate Profitability Index</h2>
            <p>Step 1: Identify the initial investment (cash outflow at Year 0). Step 2: Forecast all future cash inflows for each period. Step 3: Choose a discount rate reflecting the project's risk (typically the company's WACC). Step 4: Calculate the present value of each cash flow: PV = CF / (1 + r)^t. Step 5: Sum all PVs to get total PV of cash flows. Step 6: Divide by initial investment: PI = Total PV ÷ Investment. A PI of 1.3x means every dollar invested returns $1.30 in present value terms — a 30% value premium.</p>
            <h2>PI vs NPV: When to Use Each</h2>
            <p>For a single project decision, NPV and PI will always agree — both will say accept or reject the same project. The difference emerges when ranking multiple competing projects. Consider Project A: $1M investment, $1.5M PV → PI = 1.5x. Project B: $5M investment, $6M PV → PI = 1.2x. Project B has higher absolute NPV ($1M vs $500K) but lower PI. If your budget is $1M, Project A uses it more efficiently. Capital-constrained firms should use PI; unconstrained firms can focus on NPV alone.</p>
            <h2>Relationship to IRR and Payback Period</h2>
            <p>The Internal Rate of Return (IRR) is the discount rate that makes NPV = 0 and PI = 1. When the actual discount rate is below IRR, PI &gt; 1. The Discounted Payback Period measures how long it takes for cumulative discounted cash flows to recover the investment — complementary to PI as it adds a time dimension. Together, NPV, PI, IRR, and Payback Period give a comprehensive picture of project attractiveness.</p>
            <h2>Practical Application: Capital Rationing</h2>
            <p>A company with $1M to invest evaluates five projects: Project A (PI 2.0, cost $300K), B (PI 1.8, cost $400K), C (PI 1.6, cost $500K), D (PI 1.4, cost $600K), E (PI 1.2, cost $800K). Ranking by PI and selecting until budget is exhausted: Projects A ($300K) + B ($400K) + partial C = optimal allocation. This maximizes total NPV within the budget constraint — the core value of PI in capital rationing.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/profitability-index-calculator" />
          <PopularCalculators exclude="/calculator/profitability-index-calculator" />
        </div>
      </div>
    </>
  );
}
