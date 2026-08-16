"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface BounceResult {
  bounceRate: number;
  nonBounceRate: number;
  bouncedSessions: number;
  nonBouncedSessions: number;
  totalSessions: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBounce(singlePage: number, total: number): BounceResult {
  const bounced = Math.max(0, singlePage);
  const totalSessions = Math.max(1, Math.round(total));
  const bouncedClamped = Math.min(bounced, totalSessions);
  const nonBounced = totalSessions - bouncedClamped;
  const bounceRate = (bouncedClamped / totalSessions) * 100;
  const nonBounceRate = 100 - bounceRate;

  return {
    bounceRate,
    nonBounceRate,
    bouncedSessions: bouncedClamped,
    nonBouncedSessions: nonBounced,
    totalSessions,
    chartData: [
      { name: "Bounced", value: bouncedClamped },
      { name: "Non-Bounced", value: nonBounced },
    ],
    breakdown: [
      { label: "Total Sessions", value: `${totalSessions.toLocaleString()}` },
      { label: "Single-Page Sessions (Bounced)", value: `${bouncedClamped.toLocaleString()}` },
      { label: "Multi-Page Sessions", value: `${nonBounced.toLocaleString()}` },
      { label: "Bounce Rate", value: `${bounceRate.toFixed(1)}%` },
      { label: "Non-Bounce Rate", value: `${nonBounceRate.toFixed(1)}%` },
      { label: "Engaged Sessions (if >10s)", value: `${Math.round(nonBounced * 0.8).toLocaleString()} (est.)` },
    ],
    summaryStats: [
      { label: "Bounce Rate", value: `${bounceRate.toFixed(1)}%` },
      { label: "Non-Bounce Rate", value: `${nonBounceRate.toFixed(1)}%` },
      { label: "Bounced Sessions", value: `${bouncedClamped.toLocaleString()}` },
      { label: "Multi-Page Sessions", value: `${nonBounced.toLocaleString()}` },
      { label: "Total Sessions", value: `${totalSessions.toLocaleString()}` },
      { label: "Bounce/Total Ratio", value: `1:${totalSessions > 0 ? (totalSessions / bouncedClamped).toFixed(1) : "0"}` },
    ],
  };
}

const DEFAULTS = { singlePage: "350", total: "1000" };

export default function BounceRateCalculator() {
  const [singlePage, setSinglePage] = useState(DEFAULTS.singlePage);
  const [total, setTotal] = useState(DEFAULTS.total);
  const [result, setResult] = useState<BounceResult>(() => calcBounce(350, 1000));

  const calculate = () => setResult(calcBounce(parseFloat(singlePage) || 0, parseFloat(total) || 0));
  const reset = () => { setSinglePage(DEFAULTS.singlePage); setTotal(DEFAULTS.total); setResult(calcBounce(350, 1000)); };
  useEffect(() => { setResult(calcBounce(350, 1000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const COLORS = ["#ef4444", "#2563eb"];

  const faqs = [
    { question: "What is bounce rate?", answer: "Bounce rate is the percentage of sessions in which a visitor leaves your site after viewing only one page. It is calculated as single-page sessions divided by total sessions, multiplied by 100." },
    { question: "What is a good bounce rate?", answer: "A typical site sits between 40% and 60%. Blog posts and landing pages naturally bounce higher (70–90%), while transactional pages like product and checkout pages should stay below 40%. Context matters more than the raw number." },
    { question: "Is bounce rate the same as exit rate?", answer: "No. Bounce rate counts sessions that leave after one page. Exit rate counts how often a specific page is the last one viewed, regardless of how many pages came before it. A high exit rate on a thank-you page is normal and good." },
    { question: "How can I lower my bounce rate?", answer: "Improve page load speed, make your value proposition clear above the fold, write specific headlines that match ad intent, add internal links, and ensure the page is mobile-friendly. Reducing bounce rate usually means matching visitor intent better." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Bounce Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Bounce Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Single-Page Sessions (Bounced)</label>
              <div className={inp}><input type="number" value={singlePage} onChange={e => setSinglePage(e.target.value)} className={ci} min={0} /></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Total Sessions</label>
              <div className={inp}><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={ci} min={0} /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Bounce Rate</div>
              <div className="text-4xl font-extrabold text-primary">{result.bounceRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">{result.bouncedSessions.toLocaleString()} of {result.totalSessions.toLocaleString()} sessions left after one page</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Non-Bounce Rate", `${result.nonBounceRate.toFixed(1)}%`], ["Bounced", `${result.bouncedSessions.toLocaleString()}`], ["Engaged", `${result.nonBouncedSessions.toLocaleString()}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Session Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Bounced vs Engaged Sessions</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} sessions`]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#ef4444]" />Bounced ({Math.round(result.bounceRate)}%)</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#2563eb]" />Engaged ({Math.round(result.nonBounceRate)}%)</div>
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
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Bounce Rate?</h2>
            <p>Bounce rate is the percentage of sessions where a visitor views exactly one page and then leaves. The formula is simple: single-page sessions divided by total sessions. It is one of the most-watched metrics in web analytics because it is a rough proxy for how well a page matches what visitors were looking for.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>Bounce Rate = (Single-Page Sessions ÷ Total Sessions) × 100. The complement — the non-bounce rate — is the percentage of visitors who continued to a second page, a stronger engagement signal than a bounce.</p>
            <h2 className="text-2xl font-bold mb-3">What the Number Really Tells You</h2>
            <p>A high bounce rate on a blog post can be perfectly healthy — the visitor read the article and left satisfied. A high bounce rate on a product or pricing page usually means a problem: wrong traffic, weak headline, slow load, or a poor mobile experience. Always interpret bounce rate alongside the page's purpose and the traffic source.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bounce-rate-calculator" />
          <PopularCalculators exclude="/calculator/bounce-rate-calculator" />
        </div>
      </div>
    </>
  );
}
