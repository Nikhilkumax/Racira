"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CommissionResult {
  commission: number;
  netProceeds: number;
  effectiveRate: number;
  splitShare: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

function calcCommission(salePrice: number, ratePct: number, splitPct: number): CommissionResult {
  const commission = salePrice * (ratePct / 100);
  const netProceeds = salePrice - commission;
  const effectiveRate = salePrice > 0 ? (commission / salePrice) * 100 : 0;
  const splitShare = commission * (splitPct / 100);
  const fmt = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const breakdown = [
    { label: "Sale Price", value: fmt(salePrice) },
    { label: "Commission Rate", value: `${ratePct}%` },
    { label: "Commission Amount", value: fmt(commission) },
    { label: "Net Proceeds (Seller Keeps)", value: fmt(netProceeds) },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Split Percentage", value: `${splitPct}%` },
    { label: "Your Share of Commission", value: fmt(splitShare) },
  ];
  const summaryStats = [
    { label: "Commission Amount", value: fmt(commission) },
    { label: "Net Proceeds", value: fmt(netProceeds) },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Split %", value: `${splitPct}%` },
    { label: "Your Share", value: fmt(splitShare) },
    { label: "Sale Price", value: fmt(salePrice) },
  ];
  const chartData = [
    { name: "Commission", value: commission },
    { name: "Net Proceeds", value: netProceeds },
  ];
  return { commission, netProceeds, effectiveRate, splitShare, breakdown, summaryStats, chartData };
}

const DEFAULTS = { salePrice: "1500", rate: "5", split: "100" };

export default function CommissionCalculator() {
  const [salePrice, setSalePrice] = useState(DEFAULTS.salePrice);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [split, setSplit] = useState(DEFAULTS.split);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<CommissionResult | null>(null);

  const p = parseFloat(salePrice) || 0;
  const r = parseFloat(rate) || 0;
  const s = parseFloat(split) || 0;
  const errs: string[] = [];
  if (p <= 0) errs.push("Sale price must be greater than 0.");
  if (r < 0 || r > 100) errs.push("Commission rate must be between 0% and 100%.");
  if (s <= 0 || s > 100) errs.push("Split percentage must be between 1% and 100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcCommission(p, r, s)); };
  const reset = () => {
    setSalePrice(DEFAULTS.salePrice); setRate(DEFAULTS.rate); setSplit(DEFAULTS.split);
    setResult(calcCommission(1500, 5, 100));
  };
  useEffect(() => { setResult(calcCommission(1500, 5, 100)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";
  const PIE_COLORS = ["hsl(var(--primary))", "#10b981"];

  const faqs = [
    { question: "How is sales commission calculated?", answer: "Commission = Sale Price × Commission Rate. For a $1,500 sale at a 5% rate, the commission is $75 and the seller keeps $1,425. The effective rate is the commission divided by the sale price, expressed as a percentage." },
    { question: "What is a commission split?", answer: "A split divides a commission between multiple parties — brokers, agents, or team members. If a $75 commission is split 60/40, one party receives $45 and the other $30. Enter your share percentage to see your portion." },
    { question: "What is the difference between commission and net proceeds?", answer: "Commission is the fee paid to the salesperson or agent. Net proceeds are what the seller actually receives after the commission is deducted — Sale Price minus Commission." },
    { question: "How do tiered commission plans work?", answer: "Some plans pay different rates at different thresholds, e.g. 5% on the first $10,000 and 7% above it. For tiered or bonus structures, compute each bracket separately — this calculator handles a flat rate; multiply results across tiers." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Commission Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Commission Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Sale Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Commission Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Split &amp; Sharing</div>
                  <div>
                    <label className={lbl}>Your Split Percentage</label>
                    <div className={inp}><input type="number" value={split} onChange={e => setSplit(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Commission Amount</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">On a ${result.netProceeds.toLocaleString("en-US", { maximumFractionDigits: 2 })} net sale · Effective rate {result.effectiveRate.toFixed(2)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Net Proceeds", `$${result.netProceeds.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["Effective Rate", `${result.effectiveRate.toFixed(2)}%`], ["Your Share", `$${result.splitShare.toLocaleString("en-US", { maximumFractionDigits: 2 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Commission Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Proceeds Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, ""]} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold">{((d.value / (result.commission + result.netProceeds)) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">Commission Basics</h2>
            <p>Commission is a performance-based payment calculated as a percentage of a sale. It aligns the seller's incentive with revenue: the higher the sale, the higher the earnings. This <strong>commission calculator</strong> computes the commission, the net proceeds the seller keeps, and the effective rate in one step.</p>
            <h2 className="text-2xl font-bold mb-3">Common Commission Structures</h2>
            <p>Flat-rate: a single percentage on every sale. Tiered: escalating rates as volume crosses thresholds. Split: a shared commission divided by agreed percentages. Draw vs. commission: a guaranteed base advanced against future commissions. Know your plan before quoting an expected payout.</p>
            <h2 className="text-2xl font-bold mb-3">Negotiating Your Rate</h2>
            <p>Benchmarks vary by industry — real estate typically 5–6% total (split between buyer and seller agents), retail sales 2–10%, SaaS 10–30% of first-year value. Higher-ticket items with longer cycles usually carry higher rates to compensate for slower closing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/commission-calculator" />
          <PopularCalculators exclude="/calculator/commission-calculator" />
        </div>
      </div>
    </>
  );
}
