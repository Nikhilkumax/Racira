"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface IrrResult {
  initial: number;
  cf: number[];
  discountRate: number;
  irr: number;
  npv: number;
  npvAtDiscount: number;
  totalCashFlow: number;
  profit: number;
  paybackYears: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function npv(rate: number, initial: number, cf: number[]): number {
  let v = -initial;
  cf.forEach((c, i) => { v += c / Math.pow(1 + rate, i + 1); });
  return v;
}

function npvDeriv(rate: number, cf: number[]): number {
  let v = 0;
  cf.forEach((c, i) => { v -= (i + 1) * c / Math.pow(1 + rate, i + 2); });
  return v;
}

function findIrr(initial: number, cf: number[]): number {
  let rate = 0.10;
  for (let i = 0; i < 100; i++) {
    const f = npv(rate, initial, cf);
    const d = npvDeriv(rate, cf);
    if (Math.abs(f) < 1e-9) break;
    if (Math.abs(d) < 1e-12) break;
    rate = rate - f / d;
    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }
  return rate;
}

function calcIrr(initial: number, cf: number[], discountRate: number): IrrResult {
  const irr = findIrr(initial, cf);
  const npvAtIrr = npv(irr, initial, cf);
  const npvAtDiscount = npv(discountRate / 100, initial, cf);
  const totalCashFlow = cf.reduce((s, c) => s + c, 0);
  const profit = totalCashFlow - initial;
  let cumulative = 0;
  let paybackYears = 0;
  for (let i = 0; i < cf.length; i++) {
    cumulative += cf[i];
    if (cumulative >= initial) { paybackYears = i + (cumulative - initial) / cf[i]; break; }
  }
  if (paybackYears === 0) paybackYears = cf.length;

  const breakdown = [
    { label: "Initial Investment", value: `−${fmt$(initial)}` },
    { label: "Cash Flows", value: cf.map((c, i) => `Y${i + 1}: ${fmt$(c)}`).join(" · ") },
    { label: "Total Cash Flow", value: fmt$(totalCashFlow) },
    { label: "Net Profit", value: fmt$(profit) },
    { label: "IRR (Newton-Raphson)", value: `${(irr * 100).toFixed(2)}%` },
    { label: "NPV at IRR", value: fmt$(npvAtIrr) },
    { label: `NPV at ${discountRate}%`, value: fmt$(npvAtDiscount) },
    { label: "Payback Period", value: `${paybackYears.toFixed(1)} years` },
  ];
  const summaryStats = [
    { label: "IRR", value: `${(irr * 100).toFixed(2)}%` },
    { label: "NPV at IRR", value: fmt$(npvAtIrr) },
    { label: `NPV at ${discountRate}%`, value: fmt$(npvAtDiscount) },
    { label: "Total Cash Flow", value: fmt$(totalCashFlow) },
    { label: "Net Profit", value: fmt$(profit) },
    { label: "Payback", value: `${paybackYears.toFixed(1)} yrs` },
    { label: "Initial", value: fmt$(initial) },
    { label: "Years", value: `${cf.length}` },
  ];
  const chartData = [
    { name: "IRR", value: Math.round(irr * 10000) / 100, fill: "hsl(var(--primary))" },
    { name: "Discount", value: Math.round(discountRate * 100) / 100, fill: "#f59e0b" },
  ];
  return { initial, cf, discountRate, irr, npv: npvAtIrr, npvAtDiscount, totalCashFlow, profit, paybackYears, breakdown, summaryStats, chartData };
}

const DEFAULTS = { initial: "100000", cf1: "30000", cf2: "40000", cf3: "50000", cf4: "30000", cf5: "20000", discount: "10" };

export default function IrrCalculator() {
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [cf1, setCf1] = useState(DEFAULTS.cf1);
  const [cf2, setCf2] = useState(DEFAULTS.cf2);
  const [cf3, setCf3] = useState(DEFAULTS.cf3);
  const [cf4, setCf4] = useState(DEFAULTS.cf4);
  const [cf5, setCf5] = useState(DEFAULTS.cf5);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<IrrResult | null>(null);

  const init = parseFloat(initial) || 0;
  const flows = [parseFloat(cf1) || 0, parseFloat(cf2) || 0, parseFloat(cf3) || 0, parseFloat(cf4) || 0, parseFloat(cf5) || 0];
  const dc = parseFloat(discount) || 0;
  const errs: string[] = [];
  if (init <= 0) errs.push("Initial investment must be greater than 0.");
  if (flows.some(f => f < 0)) errs.push("Cash flows cannot be negative.");
  if (flows.reduce((s, f) => s + f, 0) <= init) errs.push("Total cash flow must exceed the investment to find an IRR.");
  if (dc < 0 || dc > 50) errs.push("Discount rate must be between 0% and 50%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcIrr(init, flows, dc)); };
  const reset = () => {
    setInitial(DEFAULTS.initial); setCf1(DEFAULTS.cf1); setCf2(DEFAULTS.cf2); setCf3(DEFAULTS.cf3); setCf4(DEFAULTS.cf4); setCf5(DEFAULTS.cf5); setDiscount(DEFAULTS.discount);
    setResult(calcIrr(100000, [30000, 40000, 50000, 30000, 20000], 10));
  };
  useEffect(() => { setResult(calcIrr(100000, [30000, 40000, 50000, 30000, 20000], 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is IRR?", answer: "The internal rate of return is the discount rate that makes the net present value of a project's cash flows zero — the compound annual return the project earns on the money still invested in it." },
    { question: "How is it computed?", answer: "This calculator solves NPV = Σ CFₜ/(1+r)ᵗ = 0 with Newton-Raphson iteration, updating the guess by the ratio of NPV to its derivative until the residual vanishes." },
    { question: "IRR vs NPV?", answer: "NPV is the dollar value created at your discount rate; IRR is the breakeven rate. Accept projects with IRR above your hurdle rate or NPV above zero — but when they disagree on mutually exclusive projects, trust NPV." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "IRR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">IRR Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Initial Investment</label>
                <div className={inp}><input type="number" value={initial} onChange={e => setInitial(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Year 1 Cash Flow</label>
                <div className={inp}><input type="number" value={cf1} onChange={e => setCf1(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Year 2 Cash Flow</label>
                <div className={inp}><input type="number" value={cf2} onChange={e => setCf2(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Year 3 Cash Flow</label>
                <div className={inp}><input type="number" value={cf3} onChange={e => setCf3(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Year 4 Cash Flow</label>
                <div className={inp}><input type="number" value={cf4} onChange={e => setCf4(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Extended Cash Flows</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Year 5 Cash Flow</label>
                      <div className={inp}><input type="number" value={cf5} onChange={e => setCf5(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Discount Rate</label>
                      <div className={inp}><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Internal Rate of Return</div>
                <div className="text-4xl font-extrabold tracking-tight">{(result.irr * 100).toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">NPV at IRR ≈ {fmt$(result.npv)} · payback {result.paybackYears.toFixed(1)} years</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`NPV @ ${result.discountRate}%`, fmt$(result.npvAtDiscount)], ["Net Profit", fmt$(result.profit)], ["Payback", `${result.paybackYears.toFixed(1)} yrs`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cash Flow Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">IRR vs Discount Rate</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Project return vs your required discount rate</p>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The IRR Definition</h2>
            <p>This <strong>IRR calculator</strong> finds the rate r where NPV = Σ CFₜ/(1+r)ᵗ equals zero — the discount rate at which a project breaks even in present-value terms. It is the standard metric for comparing projects of different sizes and durations.</p>
            <h2 className="text-2xl font-bold mb-3">Newton-Raphson in Action</h2>
            <p>Starting from 10%, the solver iterates r ← r − NPV(r)/NPV′(r), using the derivative of the present-value sum to leap toward the root. The default example converges to roughly 27% in a handful of iterations.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Results</h2>
            <p>Compare IRR to your hurdle rate: above it, the project earns more than your cost of capital. The NPV at your discount rate confirms the decision in dollars — a positive NPV and an IRR above the hurdle should agree.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/irr-calculator" />
          <PopularCalculators exclude="/calculator/irr-calculator" />
        </div>
      </div>
    </>
  );
}
