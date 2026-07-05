"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

function calcEAA(npv: number, r: number, n: number) {
  const rPer = r / 100;
  const eaa = rPer > 0 ? (npv * rPer) / (1 - Math.pow(1 + rPer, -n)) : npv / n;
  return eaa;
}

function calcResult(cashFlows: number[], discountRate: number, projectLife: number) {
  const r = discountRate / 100;
  let npv = cashFlows[0]; // Year 0 is negative investment
  const yearData: { year: number; cf: number; pv: number }[] = [{ year: 0, cf: cashFlows[0], pv: cashFlows[0] }];
  for (let i = 1; i <= projectLife; i++) {
    const cf = cashFlows[i] || 0;
    const pv = cf / Math.pow(1 + r, i);
    npv += pv;
    yearData.push({ year: i, cf, pv });
  }
  const eaa = calcEAA(npv, discountRate, projectLife);
  return { npv, eaa, yearData };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">{label === 0 ? "Initial" : `Year ${label}`}</p>
    <p className="text-primary font-semibold">EAA: {fmtM(payload[0]?.value || 0)}</p>
  </div>
) : null;

export default function EquivalentAnnualAnnuityCalculator() {
  const [investment, setInvestment] = useState("500000");
  const [rate, setRate] = useState("10");
  const [life, setLife] = useState("5");
  const [annualCF, setAnnualCF] = useState("150000");
  const [salvage, setSalvage] = useState("50000");
  const [res, setRes] = useState<{ npv: number; eaa: number; yearData: { year: number; cf: number; pv: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);

  const run = () => {
    const inv = -(parseFloat(investment) || 500000);
    const cf = parseFloat(annualCF) || 150000;
    const sv = parseFloat(salvage) || 50000;
    const n = parseInt(life) || 5;
    const flows = [inv, ...Array(n - 1).fill(cf), cf + sv];
    setRes(calcResult(flows, parseFloat(rate) || 10, n));
  };

  const reset = () => {
    setInvestment("500000"); setRate("10"); setLife("5"); setAnnualCF("150000"); setSalvage("50000");
    const flows = [-500000, 150000, 150000, 150000, 150000, 200000];
    setRes(calcResult(flows, 10, 5));
  };

  const faqs = [
    { question: "What is the Equivalent Annual Annuity?", answer: "EAA converts a project's NPV into a uniform annual cash flow over the project's life. It answers: 'How much per year would this project need to pay, as a perpetuity, to be equivalent to its NPV?' EAA = NPV × r / (1 - (1+r)^-n). This allows fair comparison of projects with different lifespans." },
    { question: "When should I use EAA instead of NPV?", answer: "Use EAA when comparing mutually exclusive projects with different lives. A 3-year project with NPV of $100K vs a 6-year project with NPV of $160K cannot be compared directly — the 6-year project lasts twice as long. EAA normalizes them to annual terms for fair comparison." },
    { question: "What is the EAA formula?", answer: "EAA = NPV × [r / (1 - (1+r)^-n)], where r is the discount rate per period and n is the number of periods. The bracketed term is the Capital Recovery Factor — the inverse of the Present Value of Annuity Factor. Higher discount rates increase EAA relative to NPV." },
    { question: "What does a higher EAA mean?", answer: "A higher EAA means the project generates more value per year. When comparing two projects, the one with the higher EAA is preferred if they will be repeated indefinitely. If the projects will NOT be repeated, compare NPVs adjusted for equal time horizons instead." },
    { question: "Does EAA assume projects are repeatable?", answer: "Yes — EAA implicitly assumes the project can be repeated at the same terms after it ends (a chain substitution assumption). If projects have different lives but are truly one-time opportunities, NPV is the better comparison metric." },
    { question: "What is the relationship between EAA and Annualized NPV?", answer: "EAA and Annualized NPV are the same concept with different names. Both express NPV as a per-period amount. Some textbooks call it the Annual Equivalent, Annual Worth, or Net Annual Benefit. All use the same Capital Recovery Factor formula." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Equivalent Annual Annuity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Equivalent Annual Annuity (EAA) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Project Parameters</h2>
            <CI id="inv" label="Initial Investment (Year 0)" value={investment} onChange={setInvestment} prefix="$" />
            <div className="grid grid-cols-2 gap-4">
              <CI id="rate" label="Discount Rate" value={rate} onChange={setRate} suffix="%" />
              <CI id="life" label="Project Life" value={life} onChange={setLife} suffix="years" />
            </div>
            <CI id="cf" label="Annual Cash Flow (each year)" value={annualCF} onChange={setAnnualCF} prefix="$" />
            <CI id="sv" label="Salvage Value (final year)" value={salvage} onChange={setSalvage} prefix="$" />
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
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
                  <h2 className="text-2xl font-bold mb-3">EAA Results</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Equivalent Annual Annuity</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmtM(res.eaa)}/yr</div>
                  <div className="text-sm text-muted-foreground mt-1">NPV: {fmtM(res.npv)} · Life: {life} years</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { l: "Initial Investment", v: fmtM(parseFloat(investment) || 0) },
                        { l: "Annual Cash Flow", v: fmtM(parseFloat(annualCF) || 0) },
                        { l: "Salvage Value", v: fmtM(parseFloat(salvage) || 0) },
                        { l: "Project NPV", v: fmtM(res.npv), b: true },
                        { l: "EAA (per year)", v: fmtM(res.eaa), b: true },
                        { l: "Decision", v: res.eaa > 0 ? "Accept" : "Reject" },
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
                  <h3 className="text-sm font-bold mb-3">Cash Flow Schedule</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={190}>
                      <BarChart data={res.yearData.slice(1)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                        <Tooltip content={<TTip />} />
                        <Bar dataKey="cf" radius={[4, 4, 0, 0]} name="Cash Flow">
                          {res.yearData.slice(1).map((_, i) => <Cell key={i} fill={`hsl(var(--primary) / ${0.5 + i * 0.1})`} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    { label: "NPV", value: fmtM(res.npv) },
                    { label: "EAA / Year", value: fmtM(res.eaa) },
                    { label: "Discount Rate", value: `${rate}%` },
                    { label: "Project Life", value: `${life} years` },
                    { label: "Annual Cash Flow", value: fmtM(parseFloat(annualCF) || 0) },
                    { label: "Salvage Value", value: fmtM(parseFloat(salvage) || 0) },
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
            <h2 className="text-2xl font-bold mb-3">What Is the Equivalent Annual Annuity?</h2>
            <p>The Equivalent Annual Annuity (EAA), also called Annualized NPV, Annual Worth, or Annual Equivalent, converts a project's Net Present Value into a uniform annual cash flow. The formula is EAA = NPV × [r / (1 - (1+r)^-n)], where r is the discount rate and n is the project life. This metric is essential for comparing projects with different lifespans because it expresses value in comparable annual terms.</p>
            <p>Consider two machines: Machine A costs $300K, lasts 3 years, with NPV $80K. Machine B costs $500K, lasts 5 years, with NPV $100K. NPV comparison favors B — but Machine A lasts only 3 years. EAA normalizes this: Machine A EAA = $29K/yr, Machine B EAA = $26K/yr. Machine A is actually more efficient per year, which is the correct comparison when both machines will be replaced indefinitely.</p>
            <h2 className="text-2xl font-bold mb-3">Capital Recovery Factor</h2>
            <p>The term [r / (1 - (1+r)^-n)] is the Capital Recovery Factor (CRF). It converts a present value into a level annual payment. When you multiply NPV by CRF, you get the EAA. Equivalently, EAA = NPV / PVIFA, where PVIFA is the Present Value Interest Factor of an Annuity = (1 - (1+r)^-n) / r. Understanding this relationship is fundamental to engineering economics and financial analysis.</p>
            <h2 className="text-2xl font-bold mb-3">When EAA Is Most Useful</h2>
            <p>EAA is most valuable in three scenarios: (1) Comparing mutually exclusive projects with different lives, assuming indefinite repetition (chain substitution). (2) Lease vs. buy analysis where costs must be compared over different contract periods. (3) Equipment replacement decisions where the optimal replacement cycle minimizes annual cost. For one-time, non-repeating projects, NPV remains the superior criterion.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/equivalent-annual-annuity-calculator" />
          <PopularCalculators exclude="/calculator/equivalent-annual-annuity-calculator" />
        </div>
      </div>
    </>
  );
}
