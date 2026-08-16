"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, BarChart2, PlusCircle, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface CashFlow { id: number; year: number; amount: string; }

export default function NpvCalculator() {
  const [initialInv, setInitialInv] = useState("50000");
  const [rate, setRate] = useState("10");
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: 1, year: 1, amount: "15000" },
    { id: 2, year: 2, amount: "18000" },
    { id: 3, year: 3, amount: "20000" },
    { id: 4, year: 4, amount: "22000" },
    { id: 5, year: 5, amount: "25000" },
  ]);
  const [res, setRes] = useState<{ npv: number; irr: number; pi: number; pvOfFlows: number; chartData: { year: string; pv: number; cumulative: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const inv = parseFloat(initialInv) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    let pvOfFlows = 0;
    const cumulativeData: { year: string; pv: number; cumulative: number }[] = [];
    let cumulative = -inv;
    cashFlows.forEach(cf => {
      const pv = (parseFloat(cf.amount) || 0) / Math.pow(1 + r, cf.year);
      pvOfFlows += pv;
      cumulative += pv;
      cumulativeData.push({ year: `Y${cf.year}`, pv: +pv.toFixed(2), cumulative: +cumulative.toFixed(2) });
    });
    const npv = pvOfFlows - inv;
    const pi = inv > 0 ? pvOfFlows / inv : 0;

    // Estimate IRR via Newton-Raphson
    let irr = 0.1;
    for (let i = 0; i < 100; i++) {
      let f = -inv, df = 0;
      cashFlows.forEach(cf => {
        const flow = parseFloat(cf.amount) || 0;
        const t = cf.year;
        f += flow / Math.pow(1 + irr, t);
        df -= t * flow / Math.pow(1 + irr, t + 1);
      });
      if (Math.abs(df) < 1e-10) break;
      irr -= f / df;
      if (Math.abs(f / df) < 1e-8) break;
    }

    setRes({ npv, irr: irr * 100, pi, pvOfFlows, chartData: cumulativeData });
  };

  const addFlow = () => {
    const nextYear = cashFlows.length > 0 ? Math.max(...cashFlows.map(c => c.year)) + 1 : 1;
    setCashFlows([...cashFlows, { id: Date.now(), year: nextYear, amount: "15000" }]);
  };
  const removeFlow = (id: number) => setCashFlows(cashFlows.filter(c => c.id !== id));
  const updateFlow = (id: number, field: "year" | "amount", value: string) =>
    setCashFlows(cashFlows.map(c => c.id === id ? { ...c, [field]: value } : c));

  const reset = () => {
    setInitialInv("50000"); setRate("10");
    setCashFlows([
      { id: 1, year: 1, amount: "15000" }, { id: 2, year: 2, amount: "18000" },
      { id: 3, year: 3, amount: "20000" }, { id: 4, year: 4, amount: "22000" },
      { id: 5, year: 5, amount: "25000" },
    ]);
  };

  const faqs = [
    { question: "What is Net Present Value (NPV)?", answer: "NPV is the difference between the present value of all future cash inflows and the initial investment. A positive NPV means the project earns more than the required rate of return — it creates value. A negative NPV means the project destroys value and should be rejected (assuming the discount rate represents the true opportunity cost)." },
    { question: "What is the NPV formula?", answer: "NPV = −Initial Investment + Σ[CFt / (1 + r)^t]. Where CFt = cash flow in period t, r = discount rate, t = time period. Each future cash flow is discounted to today's dollars, summed together, then the initial outlay is subtracted." },
    { question: "What is a good NPV?", answer: "Any positive NPV is technically acceptable (it means the project earns above the required return). However, most businesses set higher hurdle rates and prefer projects with NPV well above zero to account for estimation uncertainty. Projects with NPVs closest to zero should be scrutinized most carefully." },
    { question: "What is Internal Rate of Return (IRR)?", answer: "IRR is the discount rate that makes NPV equal to zero. It represents the project's inherent return rate. If IRR > cost of capital (required return), the project adds value. IRR is useful for ranking multiple projects but can be misleading for mutually exclusive projects or non-conventional cash flow patterns." },
    { question: "What is the Profitability Index (PI)?", answer: "PI = PV of Cash Flows ÷ Initial Investment. A PI > 1 indicates a positive NPV (acceptable project). PI is useful for capital rationing — ranking projects when capital is limited, as it measures value created per dollar invested. A project with PI = 1.4 creates $0.40 in NPV for every $1 invested." },
    { question: "What discount rate should I use for NPV?", answer: "The discount rate should reflect the project's risk. Common choices: WACC (for projects of average firm risk), cost of equity (for equity-funded projects), risk-free rate + risk premium (CAPM). Higher-risk projects warrant higher discount rates, which reduces NPV and filters out marginal investments." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "NPV Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">NPV Calculator — Net Present Value</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Project Parameters</h2>
            <CompactInput id="inv" label="Initial Investment" value={initialInv} onChange={setInitialInv} prefix="$" />
            <CompactInput id="rate" label="Discount Rate (WACC / Required Return)" value={rate} onChange={setRate} suffix="%" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Cash Flows by Year</span>
                <button type="button" onClick={addFlow} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                  <PlusCircle className="h-3.5 w-3.5" /> Add Year
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {cashFlows.map(cf => (
                  <div key={cf.id} className="grid grid-cols-[60px_1fr_32px] gap-2 items-center">
                    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm">
                      <span className="pl-2 text-xs text-muted-foreground shrink-0">Yr</span>
                      <input type="number" value={cf.year} onChange={e => updateFlow(cf.id, "year", e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none border-none text-foreground" min={1} />
                    </div>
                    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm">
                      <span className="pl-2 text-sm text-muted-foreground shrink-0">$</span>
                      <input type="number" value={cf.amount} onChange={e => updateFlow(cf.id, "amount", e.target.value)} className="w-full h-full px-2 text-sm bg-transparent outline-none border-none text-foreground" />
                    </div>
                    <button type="button" onClick={() => removeFlow(cf.id)} className="h-9 w-8 flex items-center justify-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <h2 className="text-2xl font-bold mb-3">NPV Analysis</h2>
                  <BarChart2 className="h-5 w-5 text-primary" />
                </div>
                <div className={`bg-primary/10 border-l-4 bg-gradient-to-br border rounded-xl p-5 text-center ${res.npv >= 0 ? "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" : "from-red-500/10 to-red-500/5 border-red-500/20"}`}>
                  <div className={`text-[13px] font-bold mb-1 uppercase tracking-wider ${res.npv >= 0 ? "text-emerald-600" : "text-red-600"}`}>Net Present Value</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(res.npv)}</div>
                  <div className={`text-sm font-bold ${res.npv >= 0 ? "text-emerald-600" : "text-red-600"}`}>{res.npv >= 0 ? "✓ ACCEPT — Project creates value" : "✗ REJECT — Project destroys value"}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Year</th><th className="p-2.5 pr-3 text-right">Cash Flow</th><th className="p-2.5 pr-3 text-right">Present Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="bg-red-500/5">
                        <td className="p-2.5 pl-3 text-muted-foreground font-semibold">Year 0</td>
                        <td className="p-2.5 pr-3 text-right text-red-500 font-bold">{fmt(-parseFloat(initialInv))}</td>
                        <td className="p-2.5 pr-3 text-right text-red-500 font-bold">{fmt(-parseFloat(initialInv))}</td>
                      </tr>
                      {cashFlows.map(cf => {
                        const flow = parseFloat(cf.amount) || 0;
                        const pv = flow / Math.pow(1 + parseFloat(rate) / 100, cf.year);
                        return (
                          <tr key={cf.id} className="hover:bg-secondary/20">
                            <td className="p-2.5 pl-3 text-muted-foreground font-semibold">Year {cf.year}</td>
                            <td className="p-2.5 pr-3 text-right text-foreground">{fmt(flow)}</td>
                            <td className="p-2.5 pr-3 text-right text-primary font-semibold">{fmt(pv)}</td>
                          </tr>
                        );
                      })}
                      <tr className="font-bold bg-secondary/30">
                        <td className="p-2.5 pl-3 text-foreground">NPV</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">—</td>
                        <td className={`p-2.5 pr-3 text-right ${res.npv >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(res.npv)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Cumulative PV Trajectory</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmt(v)} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                        <Bar dataKey="cumulative" name="Cumulative NPV" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "NPV", value: fmt(res.npv) },
                    { label: "IRR", value: `${res.irr.toFixed(2)}%` },
                    { label: "Prof. Index", value: res.pi.toFixed(3) },
                    { label: "PV of Flows", value: fmt(res.pvOfFlows) },
                    { label: "Initial Inv.", value: fmt(parseFloat(initialInv) || 0) },
                    { label: "Decision", value: res.npv >= 0 ? "Accept" : "Reject" },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className={`text-base font-extrabold ${item.label === "Decision" ? (res.npv >= 0 ? "text-emerald-600" : "text-red-600") : "text-foreground"}`}>{item.value}</span>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Net Present Value (NPV)?</h2>
            <p>Net Present Value (NPV) is the most widely used method for evaluating the financial viability of an investment or project. It calculates the difference between the present value of all future cash inflows generated by an investment and the initial cost of that investment. A positive NPV means the project creates more value than it costs; a negative NPV means it destroys value.</p>
            <p>NPV is superior to simpler metrics like payback period or accounting rate of return because it accounts for the time value of money — recognizing that $1 received today is worth more than $1 received in the future. By discounting all cash flows to today's dollars using the required rate of return (discount rate), NPV provides a true measure of value creation in today's terms.</p>

            <h2 className="text-2xl font-bold mb-3">The NPV Formula</h2>
            <p>NPV = −C₀ + CF₁/(1+r)¹ + CF₂/(1+r)² + ... + CFₙ/(1+r)ⁿ. Where C₀ = initial investment, CFₜ = cash flow in period t, r = discount rate (required rate of return), n = project life in years. The formula sums the present value of each year's cash flow and subtracts the upfront cost.</p>

            <h2 className="text-2xl font-bold mb-3">How to Interpret NPV</h2>
            <p>NPV &gt; 0: The project earns more than the required rate of return. Accept the project — it creates shareholder value. NPV = 0: The project earns exactly the required return. Accept or reject based on strategic considerations. NPV &lt; 0: The project fails to meet the required return. Reject the project — you'd earn more by investing elsewhere at the discount rate.</p>

            <h2 className="text-2xl font-bold mb-3">NPV vs IRR: When to Use Each</h2>
            <p>While both NPV and IRR are DCF methods, NPV is generally superior for decision-making. IRR can give misleading results for projects with non-conventional cash flows (multiple sign changes), mutually exclusive projects of different scales, or projects with very different time horizons. NPV always gives the correct accept/reject decision when the discount rate represents the true opportunity cost. IRR is best used as a secondary metric to understand the project's inherent return rate.</p>

            <h2 className="text-2xl font-bold mb-3">Choosing the Right Discount Rate</h2>
            <p>The discount rate is the most critical — and most debated — input in NPV analysis. For corporate projects, the standard choice is WACC (Weighted Average Cost of Capital), which blends the cost of debt and equity weighted by their proportions in the capital structure. For higher-risk projects, a risk premium is added. Personal investors often use their expected portfolio return (e.g., 7–10% for stock market returns) as the hurdle rate. The discount rate should always reflect the risk of the specific project, not the company's average risk.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-present-value-calculator" />
          <PopularCalculators exclude="/calculator/net-present-value-calculator" />
        </div>
      </div>
    </>
  );
}
