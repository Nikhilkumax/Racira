"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ChurnResult {
  churnRate: number;
  retentionRate: number;
  avgCustomerLifetime: number;
  revenueChurnRate: number;
  ltv: number;
  customersLostPerMonth: number;
  revenueAtRisk: number;
  chartData: { month: number; customers: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcChurn(customersStart: number, customersLost: number, mrr: number, arpu: number, grossMarginPct: number, cac: number): ChurnResult {
  const churnRate = customersStart > 0 ? (customersLost / customersStart) * 100 : 0;
  const retentionRate = 100 - churnRate;
  const monthlyChurnDecimal = churnRate / 100;
  const avgLifetime = monthlyChurnDecimal > 0 ? 1 / monthlyChurnDecimal : 999;
  const revenueChurnRate = mrr > 0 ? (customersLost * arpu / mrr) * 100 : churnRate;
  const ltv = monthlyChurnDecimal > 0 ? (arpu * (grossMarginPct / 100)) / monthlyChurnDecimal : 0;
  const customersLostPerMonth = customersLost;
  const revenueAtRisk = customersLost * arpu;

  const chartData: { month: number; customers: number }[] = [{ month: 0, customers: customersStart }];
  let cust = customersStart;
  for (let m = 1; m <= 24; m++) {
    cust = cust * (1 - monthlyChurnDecimal);
    chartData.push({ month: m, customers: Math.round(cust) });
  }

  const breakdown = [
    { label: "Customers at Start", value: customersStart.toLocaleString() },
    { label: "Customers Lost", value: customersLost.toLocaleString() },
    { label: "Monthly Churn Rate", value: `${churnRate.toFixed(2)}%` },
    { label: "Retention Rate", value: `${retentionRate.toFixed(2)}%` },
    { label: "Avg Customer Lifetime", value: avgLifetime < 200 ? `${avgLifetime.toFixed(1)} months` : "Excellent" },
    { label: "Revenue Churn Rate", value: `${revenueChurnRate.toFixed(2)}%` },
    { label: "Customer LTV", value: ltv > 0 ? `$${ltv.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "N/A" },
    { label: "Revenue at Risk/Month", value: `$${revenueAtRisk.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "LTV:CAC Ratio", value: cac > 0 && ltv > 0 ? `${(ltv / cac).toFixed(1)}x` : "N/A" },
  ];

  const summaryStats = [
    { label: "Churn Rate", value: `${churnRate.toFixed(2)}%` },
    { label: "Retention Rate", value: `${retentionRate.toFixed(2)}%` },
    { label: "Avg Lifetime", value: avgLifetime < 200 ? `${avgLifetime.toFixed(1)} mo` : "∞" },
    { label: "LTV", value: ltv > 0 ? `$${ltv.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "N/A" },
    { label: "Revenue at Risk", value: `$${revenueAtRisk.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
    { label: "LTV:CAC", value: cac > 0 && ltv > 0 ? `${(ltv / cac).toFixed(1)}x` : "N/A" },
  ];

  return { churnRate, retentionRate, avgCustomerLifetime: avgLifetime, revenueChurnRate, ltv, customersLostPerMonth, revenueAtRisk, chartData, breakdown, summaryStats };
}

const DEFAULTS = { custStart: "1000", custLost: "25", mrr: "50000", arpu: "50", grossMargin: "70", cac: "200" };

export default function ChurnRateCalculator() {
  const [custStart, setCustStart] = useState(DEFAULTS.custStart);
  const [custLost, setCustLost] = useState(DEFAULTS.custLost);
  const [mrr, setMrr] = useState(DEFAULTS.mrr);
  const [arpu, setArpu] = useState(DEFAULTS.arpu);
  const [grossMargin, setGrossMargin] = useState(DEFAULTS.grossMargin);
  const [cac, setCac] = useState(DEFAULTS.cac);
  const [result, setResult] = useState<ChurnResult | null>(null);

  const calculate = () => setResult(calcChurn(parseFloat(custStart)||1000, parseFloat(custLost)||25, parseFloat(mrr)||50000, parseFloat(arpu)||50, parseFloat(grossMargin)||70, parseFloat(cac)||200));
  const reset = () => { setCustStart(DEFAULTS.custStart); setCustLost(DEFAULTS.custLost); setMrr(DEFAULTS.mrr); setArpu(DEFAULTS.arpu); setGrossMargin(DEFAULTS.grossMargin); setCac(DEFAULTS.cac); setResult(calcChurn(1000,25,50000,50,70,200)); };
  useEffect(() => { setResult(calcChurn(1000,25,50000,50,70,200)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a good monthly churn rate?", answer: "World-class SaaS: under 0.5%/month (6% annually). Good SaaS: 1–2%/month. Average: 2–5%/month. Poor: above 5%/month. Enterprise SaaS typically has lower churn (0.5–1%) due to longer contracts. Consumer subscription businesses often see 3–8% monthly churn." },
    { question: "How is churn rate calculated?", answer: "Monthly Churn Rate = (Customers Lost ÷ Customers at Start of Period) × 100. Revenue Churn = (MRR Lost to Cancellations ÷ MRR at Start) × 100. Revenue churn can be negative (net negative churn) if expansion revenue from existing customers exceeds cancellation losses — the gold standard for SaaS." },
    { question: "What is average customer lifetime?", answer: "Average Customer Lifetime = 1 ÷ Monthly Churn Rate. At 2% monthly churn, the average customer stays 50 months (4.2 years). At 5% churn, that drops to 20 months (1.7 years). This directly determines the maximum you can spend to acquire a customer (CAC)." },
    { question: "What is LTV:CAC ratio?", answer: "LTV:CAC measures return on customer acquisition investment. Under 1x: each customer costs more to acquire than they're worth — unsustainable. 1–3x: break-even to marginally profitable. 3–5x: healthy growth. Above 5x: potentially under-investing in growth. Target 3x+ for sustainable SaaS businesses." },
    { question: "What causes high churn?", answer: "Poor product-market fit (customers don't see enough value). Inadequate onboarding (customers don't activate). Pricing misalignment (customers don't perceive ROI). Competitive alternatives. Economic pressures. Ignoring at-risk customer signals. Churn analysis should segment reasons to address root causes." },
    { question: "How do I reduce churn?", answer: "Improve onboarding to drive faster time-to-value. Implement proactive customer success outreach. Build switching costs through integrations and data depth. Use cohort analysis to identify highest-risk customer segments. Annual contracts vs. monthly reduce voluntary churn 30–40%. Monitor product usage signals to identify at-risk accounts." },
  ];

  const churnColor = result ? (result.churnRate < 1 ? "text-emerald-600" : result.churnRate < 3 ? "text-amber-600" : "text-red-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Churn Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Churn Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Customers (Start)</label>
                <div className={inp}><input type="number" value={custStart} onChange={e => setCustStart(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Customers Lost</label>
                <div className={inp}><input type="number" value={custLost} onChange={e => setCustLost(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">MRR</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={mrr} onChange={e => setMrr(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">ARPU / Month</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={arpu} onChange={e => setArpu(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Gross Margin</label>
                <div className={inp}><input type="number" value={grossMargin} onChange={e => setGrossMargin(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">CAC</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={cac} onChange={e => setCac(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Churn Rate</div>
                <div className={`text-4xl font-extrabold tracking-tight ${churnColor}`}>{result.churnRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Retention: {result.retentionRate.toFixed(2)}% · Avg lifetime: {result.avgCustomerLifetime < 200 ? `${result.avgCustomerLifetime.toFixed(1)} months` : "∞"} · LTV: {result.ltv > 0 ? `$${result.ltv.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "N/A"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Retention", `${result.retentionRate.toFixed(2)}%`], ["Revenue Churn", `${result.revenueChurnRate.toFixed(2)}%`], ["Rev at Risk", `$${result.revenueAtRisk.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Churn Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Customer Base Over 24 Months</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), "Customers"]} />
                    <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Churn Rate?</h2>
            <p><strong>Churn rate</strong> measures the percentage of customers who cancel or stop using a service in a given period. For subscription businesses and SaaS companies, churn is the single most important metric after growth — even a small churn rate compounds into massive customer base erosion over time. This <strong>churn rate calculator</strong> computes monthly churn, customer lifetime, LTV, and revenue at risk.</p>
            <h2>Churn Rate Formulas</h2>
            <p>Monthly Churn Rate = (Customers Lost ÷ Starting Customers) × 100. Average Customer Lifetime = 1 ÷ Monthly Churn Rate. Customer LTV = (ARPU × Gross Margin %) ÷ Monthly Churn Rate. Revenue Churn = (MRR Lost ÷ Starting MRR) × 100.</p>
            <h2>The Compounding Impact of Churn</h2>
            <p>A 2% monthly churn means losing 22% of customers per year. At 5% monthly churn, you lose 46% annually. This means you must acquire nearly half your customer base every year just to stay flat. Reducing churn by 1 percentage point often has more financial impact than a 20% increase in new customer acquisition.</p>
            <h2>Net Revenue Retention (NRR)</h2>
            <p>The best SaaS companies achieve NRR above 120% — meaning existing customers spend more over time through upsells and expansion even as some churn. This creates a flywheel where organic growth from existing customers supplements new customer acquisition. Companies with NRR above 130% include Snowflake, Twilio, and Datadog at their peaks.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/churn-rate-calculator" />
          <PopularCalculators exclude="/calculator/churn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
