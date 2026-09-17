"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, MailOpen } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EmailResult {
  delivered: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
  ctr: number;
  unopened: number;
  chartData: { name: string; value: number }[];
}

function calcEmail(delivered: number, opens: number, clicks: number): EmailResult {
  const openRate = delivered > 0 ? (opens / delivered) * 100 : 0;
  const clickRate = delivered > 0 ? (clicks / delivered) * 100 : 0;
  const ctr = opens > 0 ? (clicks / opens) * 100 : 0;
  const unopened = Math.max(0, delivered - opens);
  const chartData = [
    { name: "Opened", value: opens },
    { name: "Not Opened", value: unopened },
  ];
  return { delivered, opens, clicks, openRate, clickRate, ctr, unopened, chartData };
}

const DEFAULTS = { delivered: "10000", opens: "2200", clicks: "250" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "What is email open rate?", answer: "Open rate is the share of delivered emails that were opened: opens ÷ delivered × 100. It measures subject-line appeal and list health — spam filters and list decay directly suppress it." },
  { question: "What is a good open rate?", answer: "Across industries, 20–40% is typical for marketing email (the open rate includes a bounce-inflated denominator on some platforms). Compare against your own history and segment, not just industry averages." },
  { question: "How do opens and clicks relate?", answer: "Click rate (clicks ÷ delivered) measures overall response; CTR (clicks ÷ opens) measures how well the content converts readers. A high open rate with low CTR means the subject line overpromised." },
];

export default function EmailOpenRateCalculator() {
  const [delivered, setDelivered] = useState(DEFAULTS.delivered);
  const [opens, setOpens] = useState(DEFAULTS.opens);
  const [clicks, setClicks] = useState(DEFAULTS.clicks);
  const [result, setResult] = useState<EmailResult>(() => calcEmail(10000, 2200, 250));

  useEffect(() => {
    const d = parseFloat(delivered);
    const o = parseFloat(opens);
    const c = parseFloat(clicks);
    if (!isNaN(d) && !isNaN(o) && !isNaN(c) && d > 0 && o >= 0 && c >= 0) setResult(calcEmail(d, o, c));
  }, []);

  const reset = () => { setDelivered(DEFAULTS.delivered); setOpens(DEFAULTS.opens); setClicks(DEFAULTS.clicks); setResult(calcEmail(parseFloat(DEFAULTS.delivered), parseFloat(DEFAULTS.opens), parseFloat(DEFAULTS.clicks))); };
  const invalid = isNaN(parseFloat(delivered)) || isNaN(parseFloat(opens)) || isNaN(parseFloat(clicks)) || parseFloat(delivered) <= 0 || parseFloat(opens) < 0 || parseFloat(clicks) < 0;

  const breakdown = [
    { label: "Delivered", value: `${Math.round(result.delivered).toLocaleString()}` },
    { label: "Opened", value: `${Math.round(result.opens).toLocaleString()}` },
    { label: "Open Rate", value: `${result.openRate.toFixed(2)}%`, highlight: true },
    { label: "Not Opened", value: `${Math.round(result.unopened).toLocaleString()}` },
    { label: "Clicked", value: `${Math.round(result.clicks).toLocaleString()}` },
    { label: "Click Rate (of delivered)", value: `${result.clickRate.toFixed(2)}%` },
    { label: "CTR (of opens)", value: `${result.ctr.toFixed(2)}%` },
  ];

  const summaryStats = [
    { label: "Open Rate", value: `${result.openRate.toFixed(2)}%` },
    { label: "Click Rate", value: `${result.clickRate.toFixed(2)}%` },
    { label: "CTR", value: `${result.ctr.toFixed(2)}%` },
    { label: "Opened", value: `${Math.round(result.opens).toLocaleString()}` },
    { label: "Not Opened", value: `${Math.round(result.unopened).toLocaleString()}` },
    { label: "Clicks", value: `${Math.round(result.clicks).toLocaleString()}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Email Open Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Email Open Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="eo-delivered" className="block text-sm font-medium mb-1 text-foreground">Emails Delivered</label>
              <input id="eo-delivered" type="number" min="1" step="1" value={delivered} onChange={(e) => setDelivered(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="eo-opens" className="block text-sm font-medium mb-1 text-foreground">Opens</label>
                <input id="eo-opens" type="number" min="0" step="1" value={opens} onChange={(e) => setOpens(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eo-clicks" className="block text-sm font-medium mb-1 text-foreground">Clicks</label>
                <input id="eo-clicks" type="number" min="0" step="1" value={clicks} onChange={(e) => setClicks(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <MailOpen className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive delivered count and non-negative opens/clicks.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Email Open Rate</div>
              <div className="text-4xl font-extrabold text-primary">{result.openRate.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground mt-1">{Math.round(result.opens).toLocaleString()} of {Math.round(result.delivered).toLocaleString()} opened · {Math.round(result.unopened).toLocaleString()} unopened</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Click Rate</div>
                <div className="text-lg font-bold text-primary">{result.clickRate.toFixed(2)}%</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">CTR (of opens)</div>
                <div className="text-lg font-bold text-primary">{result.ctr.toFixed(2)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Unopened</div>
                <div className="text-lg font-bold text-primary">{Math.round(result.unopened).toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Opened vs Unopened</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${Math.round(v).toLocaleString()} (${((v / result.delivered) * 100).toFixed(1)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Email Open Rate Calculator</h2>
            <p>Open rate measures how many delivered emails got opened — the standard health check for subject lines and list quality. With 10,000 delivered and 2,200 opens, the rate is 22%, leaving 7,800 unopened; 250 clicks then give a 2.5% click rate overall and an 11.4% CTR on opens.</p>
            <h3>Reading the Funnel</h3>
            <p>The gap between opens and clicks is the content's job: a strong subject line earns the open; the body earns the click. When CTR on opens falls below ~5%, the message and offer aren't matching the promise of the subject line — test one element at a time.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/email-open-rate-calculator" />
          <PopularCalculators exclude="/calculator/email-open-rate-calculator" />
        </div>
      </div>
    </>
  );
}
