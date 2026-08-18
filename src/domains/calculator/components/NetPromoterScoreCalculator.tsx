"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface NpsResult {
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
  pPct: number;
  dPct: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
  distData: { score: number; count: number; group: string }[];
}

function fmt(v: number, d = 1): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcNps(promoters: number, passives: number, detractors: number): NpsResult {
  const total = promoters + passives + detractors;
  const pPct = total > 0 ? (promoters / total) * 100 : 0;
  const dPct = total > 0 ? (detractors / total) * 100 : 0;
  const nps = pPct - dPct;
  const breakdown = [
    { label: "Promoters (9–10)", value: `${promoters} responses` },
    { label: "Passives (7–8)", value: `${passives} responses` },
    { label: "Detractors (0–6)", value: `${detractors} responses` },
    { label: "Total Responses", value: `${total}` },
    { label: "Promoter Share", value: `${fmt(pPct)}%` },
    { label: "Detractor Share", value: `${fmt(dPct)}%` },
    { label: "Net Promoter Score", value: `${fmt(nps)}` },
  ];
  const summaryStats = [
    { label: "NPS", value: `${fmt(nps)}` },
    { label: "Promoters", value: `${promoters} (${fmt(pPct)}%)` },
    { label: "Passives", value: `${passives}` },
    { label: "Detractors", value: `${detractors} (${fmt(dPct)}%)` },
    { label: "Responses", value: `${total}` },
  ];
  const chartData = [
    { name: "Promoters", value: promoters, fill: "hsl(var(--primary))" },
    { name: "Passives", value: passives, fill: "#f59e0b" },
    { name: "Detractors", value: detractors, fill: "#ef4444" },
  ];
  const distData = [
    ...Array.from({ length: 10 }, (_, i) => ({ score: i, count: 0, group: "detractor" })),
    { score: 10, count: 0, group: "promoter" },
  ];
  return { nps, promoters, passives, detractors, total, pPct, dPct, breakdown, summaryStats, chartData, distData };
}

const DEFAULTS = { promoters: "120", passives: "60", detractors: "20" };

export default function NetPromoterScoreCalculator() {
  const [promoters, setPromoters] = useState(DEFAULTS.promoters);
  const [passives, setPassives] = useState(DEFAULTS.passives);
  const [detractors, setDetractors] = useState(DEFAULTS.detractors);
  const [result, setResult] = useState<NpsResult | null>(null);

  const p = parseFloat(promoters);
  const pa = parseFloat(passives);
  const d = parseFloat(detractors);
  const errs: string[] = [];
  if (isNaN(p) || p < 0) errs.push("Promoter count must be 0 or greater.");
  if (isNaN(pa) || pa < 0) errs.push("Passive count must be 0 or greater.");
  if (isNaN(d) || d < 0) errs.push("Detractor count must be 0 or greater.");
  if (p + pa + d <= 0) errs.push("Enter at least one response.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcNps(p, pa, d)); };
  const reset = () => {
    setPromoters(DEFAULTS.promoters); setPassives(DEFAULTS.passives); setDetractors(DEFAULTS.detractors);
    setResult(calcNps(120, 60, 20));
  };
  useEffect(() => { setResult(calcNps(120, 60, 20)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is Net Promoter Score?", answer: "A customer-loyalty metric derived from one question — how likely are you to recommend us, 0–10. Promoters (9–10), passives (7–8), and detractors (0–6) split the responses; NPS = %promoters − %detractors, ranging from −100 to +100." },
    { question: "What is a good NPS?", answer: "Above 0 is healthy, 30–50 is strong, 50+ is world-class — though benchmarks vary by industry. Comparing your score to your own trend matters more than chasing an absolute number." },
    { question: "Why ignore passives?", answer: "Passives are satisfied but unenthusiastic — they neither promote nor actively damage the brand, so they cancel out of the formula. Their share still matters for context: a high passive percentage signals untapped advocacy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Net Promoter Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Net Promoter Score Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Promoters (9–10)</label>
                <input type="number" value={promoters} onChange={e => setPromoters(e.target.value)} className={inp} placeholder="120" />
              </div>
              <div>
                <label className={lbl}>Passives (7–8)</label>
                <input type="number" value={passives} onChange={e => setPassives(e.target.value)} className={inp} placeholder="60" />
              </div>
              <div>
                <label className={lbl}>Detractors (0–6)</label>
                <input type="number" value={detractors} onChange={e => setDetractors(e.target.value)} className={inp} placeholder="20" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">From a 0–10 "how likely to recommend" survey. NPS = %Promoters − %Detractors.</p>
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
              <div className={`${result.nps >= 30 ? "bg-primary/10 border-l-4 border-primary" : result.nps >= 0 ? "bg-amber-500/10 border-l-4 border-amber-500" : "bg-destructive/10 border-l-4 border-destructive"} rounded-lg p-5`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.nps >= 30 ? "text-primary" : result.nps >= 0 ? "text-amber-600" : "text-destructive"}`}>Net Promoter Score</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.nps >= 0 ? "+" : ""}{fmt(result.nps)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.pPct)}% promoters − {fmt(result.dPct)}% detractors · {result.total} responses</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Promoters", `${result.promoters} (${fmt(result.pPct)}%)`], ["Passives", `${result.passives}`], ["Detractors", `${result.detractors} (${fmt(result.dPct)}%)`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Response Split</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [v, "responses"]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">NPS is the gap between the green and red bars</p>
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
            <h2 className="text-2xl font-bold mb-3">One Question, One Powerful Number</h2>
            <p>The Net Promoter Score distills customer sentiment into a single metric: "How likely are you to recommend us?" — answered 0 to 10. This <strong>net promoter score calculator</strong> turns your response counts into the industry-standard NPS.</p>
            <h2 className="text-2xl font-bold mb-3">The Segmentation</h2>
            <p>9–10 are promoters — loyal, vocal advocates. 7–8 are passives — content but uncommitted. 0–6 are detractors — at risk of churning and, worse, warning others. NPS subtracts the detractor share from the promoter share, so every detractor must be outweighed by advocates.</p>
            <h2 className="text-2xl font-bold mb-3">Using the Score</h2>
            <p>Track NPS over time and across segments — it is a directional loyalty gauge, not a precise forecast. Benchmarks help ("above 30 is good"), but your own trend, paired with the promoter/detractor split, tells the real story.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-promoter-score-calculator" />
          <PopularCalculators exclude="/calculator/net-promoter-score-calculator" />
        </div>
      </div>
    </>
  );
}
