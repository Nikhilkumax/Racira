"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ConversionResult {
  conversionRate: number;
  conversions: number;
  nonConverters: number;
  revenue: number;
  gapPct: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

function calcConversion(visitors: number, conversions: number, aov: number, targetPct: number): ConversionResult {
  const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
  const nonConverters = Math.max(0, visitors - conversions);
  const revenue = conversions * aov;
  const gapPct = targetPct - conversionRate;
  const fmtMoney = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const breakdown = [
    { label: "Total Visitors", value: visitors.toLocaleString() },
    { label: "Conversions", value: conversions.toLocaleString() },
    { label: "Non-Converters", value: nonConverters.toLocaleString() },
    { label: "Conversion Rate", value: `${conversionRate.toFixed(2)}%` },
    { label: "Average Order Value", value: fmtMoney(aov) },
    { label: "Revenue from Conversions", value: fmtMoney(revenue) },
    { label: "Target Rate Gap", value: `${gapPct >= 0 ? "+" : ""}${gapPct.toFixed(2)}%` },
  ];
  const summaryStats = [
    { label: "Conversion Rate", value: `${conversionRate.toFixed(2)}%` },
    { label: "Conversions", value: conversions.toLocaleString() },
    { label: "Non-Converters", value: nonConverters.toLocaleString() },
    { label: "Revenue", value: fmtMoney(revenue) },
    { label: "Avg Order Value", value: fmtMoney(aov) },
    { label: "Target Gap", value: `${gapPct >= 0 ? "+" : ""}${gapPct.toFixed(2)}%` },
  ];
  const chartData = [
    { name: "Converted", value: conversions },
    { name: "Not Converted", value: nonConverters },
  ];
  return { conversionRate, conversions, nonConverters, revenue, gapPct, breakdown, summaryStats, chartData };
}

const DEFAULTS = { visitors: "10000", conversions: "250", aov: "40", target: "2" };

export default function ConversionRateCalculator() {
  const [visitors, setVisitors] = useState(DEFAULTS.visitors);
  const [conversions, setConversions] = useState(DEFAULTS.conversions);
  const [aov, setAov] = useState(DEFAULTS.aov);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const v = parseFloat(visitors) || 0;
  const c = parseFloat(conversions) || 0;
  const a = parseFloat(aov) || 0;
  const t = parseFloat(target) || 0;
  const errs: string[] = [];
  if (v <= 0) errs.push("Visitors must be greater than 0.");
  if (c < 0) errs.push("Conversions cannot be negative.");
  if (c > v) errs.push("Conversions cannot exceed visitors.");
  if (a < 0) errs.push("Average order value cannot be negative.");
  if (t < 0 || t > 100) errs.push("Target rate must be between 0% and 100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcConversion(v, c, a, t)); };
  const reset = () => {
    setVisitors(DEFAULTS.visitors); setConversions(DEFAULTS.conversions); setAov(DEFAULTS.aov); setTarget(DEFAULTS.target);
    setResult(calcConversion(10000, 250, 40, 2));
  };
  useEffect(() => { setResult(calcConversion(10000, 250, 40, 2)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";
  const PIE_COLORS = ["hsl(var(--primary))", "#e2e8f0"];

  const faqs = [
    { question: "What is a conversion rate?", answer: "Conversion rate is the percentage of visitors who complete a desired action — a purchase, signup, or lead form. It equals Conversions ÷ Visitors × 100. If 250 of 10,000 visitors convert, the rate is 2.5%." },
    { question: "What is a good conversion rate?", answer: "Across all industries, the median e-commerce conversion rate is around 2–3%. Top-quartile sites reach 5% or higher. Benchmarks vary widely: high-intent traffic (product pages, email) converts far better than cold social traffic." },
    { question: "How do I improve my conversion rate?", answer: "Focus on clear value propositions, faster page load, simplified checkout, trust signals (reviews, guarantees), and A/B testing headlines and calls-to-action. Each percentage point gained compounds directly into revenue: at $40 per order, lifting 2.5% to 3.5% adds $4,000 per 10,000 visitors." },
    { question: "What is the difference between conversion rate and CPA?", answer: "Conversion rate measures efficiency of traffic; Cost Per Acquisition (CPA) measures the cost of each conversion. CPA = total marketing spend ÷ conversions. Together they show both effectiveness and profitability of campaigns." },
  ];

  const gapColor = result ? (result.gapPct <= 0 ? "text-emerald-600" : "text-amber-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Conversion Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Conversion Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Total Visitors</label>
                <div className={inp}><input type="number" value={visitors} onChange={e => setVisitors(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Conversions</label>
                <div className={inp}><input type="number" value={conversions} onChange={e => setConversions(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Revenue &amp; Targets</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Average Order Value</label>
                      <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={aov} onChange={e => setAov(e.target.value)} className={ci} /></div>
                    </div>
                    <div>
                      <label className={lbl}>Target Rate</label>
                      <div className={inp}><input type="number" value={target} onChange={e => setTarget(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Conversion Rate</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.conversionRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">{result.conversions.toLocaleString()} of {result.chartData.reduce((s, d) => s + d.value, 0).toLocaleString()} visitors converted</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Conversions", result.conversions.toLocaleString()], ["Revenue", `$${result.revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["Gap to Target", `${result.gapPct >= 0 ? "+" : ""}${result.gapPct.toFixed(2)}%`, gapColor]].map(([l, v, color], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-base font-bold ${color || ""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Visitor Outcomes</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), ""]} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold">{((d.value / (result.conversions + result.nonConverters)) * 100).toFixed(1)}%</span>
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
            <h2 className="text-2xl font-bold mb-3">What Is Conversion Rate?</h2>
            <p>Conversion rate measures how effectively your traffic turns into results: Conversion Rate = Conversions ÷ Visitors × 100. It is the single most important efficiency metric in digital marketing — improving it increases revenue without spending a cent more on traffic.</p>
            <h2 className="text-2xl font-bold mb-3">Revenue Impact</h2>
            <p>Pair conversion rate with average order value to estimate revenue: Revenue = Conversions × AOV. A 10,000-visitor campaign converting at 2.5% with a $40 AOV generates $10,000. Raising the rate to 3.5% adds $4,000 — a 40% revenue lift from the same traffic.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmarking</h2>
            <p>Compare your rate against your industry: e-commerce 2–3%, B2B lead generation 2–5%, SaaS free-trial signup 3–10%, landing pages 5–15%. Segment by traffic source — branded search and email convert 3–5× higher than social or display — before setting targets.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/conversion-rate-calculator" />
          <PopularCalculators exclude="/calculator/conversion-rate-calculator" />
        </div>
      </div>
    </>
  );
}
