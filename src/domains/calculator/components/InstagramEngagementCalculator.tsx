"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface EngagementResult {
  followers: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  total: number;
  rate: number;
  benchmark: string;
  benchmarkColor: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function calcEngagement(followers: number, likes: number, comments: number, saves: number, shares: number): EngagementResult {
  const total = likes + comments + saves + shares;
  const rate = followers > 0 ? (total / followers) * 100 : 0;

  let benchmark: string, benchmarkColor: string;
  if (rate >= 6) { benchmark = "Excellent"; benchmarkColor = "text-emerald-600"; }
  else if (rate >= 3) { benchmark = "Good"; benchmarkColor = "text-primary"; }
  else if (rate >= 1) { benchmark = "Average"; benchmarkColor = "text-amber-500"; }
  else { benchmark = "Below Average"; benchmarkColor = "text-red-500"; }

  const breakdown = [
    { label: "Followers", value: followers.toLocaleString() },
    { label: "Likes", value: likes.toLocaleString() },
    { label: "Comments", value: comments.toLocaleString() },
    { label: "Saves", value: saves.toLocaleString() },
    { label: "Shares", value: shares.toLocaleString() },
    { label: "Total Engagements", value: total.toLocaleString() },
    { label: "Engagement Rate", value: `${rate.toFixed(2)}%` },
    { label: "Benchmark", value: benchmark },
  ];
  const summaryStats = [
    { label: "Engagement Rate", value: `${rate.toFixed(2)}%` },
    { label: "Total Engagements", value: total.toLocaleString() },
    { label: "Likes", value: likes.toLocaleString() },
    { label: "Comments", value: comments.toLocaleString() },
    { label: "Saves", value: saves.toLocaleString() },
    { label: "Shares", value: shares.toLocaleString() },
    { label: "Followers", value: followers.toLocaleString() },
    { label: "Benchmark", value: benchmark },
  ];
  const chartData = [
    { name: "Likes", value: likes, fill: "hsl(var(--primary))" },
    { name: "Comments", value: comments, fill: "#8b5cf6" },
    { name: "Saves", value: saves, fill: "#f59e0b" },
    { name: "Shares", value: shares, fill: "#10b981" },
  ];
  return { followers, likes, comments, saves, shares, total, rate, benchmark, benchmarkColor, breakdown, summaryStats, chartData };
}

const DEFAULTS = { followers: "25000", likes: "900", comments: "45", saves: "60", shares: "20" };

export default function InstagramEngagementCalculator() {
  const [followers, setFollowers] = useState(DEFAULTS.followers);
  const [likes, setLikes] = useState(DEFAULTS.likes);
  const [comments, setComments] = useState(DEFAULTS.comments);
  const [saves, setSaves] = useState(DEFAULTS.saves);
  const [shares, setShares] = useState(DEFAULTS.shares);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<EngagementResult | null>(null);

  const fl = parseInt(followers) || 0;
  const lk = parseInt(likes) || 0;
  const cm = parseInt(comments) || 0;
  const sv = parseInt(saves) || 0;
  const sh = parseInt(shares) || 0;
  const errs: string[] = [];
  if (fl <= 0) errs.push("Followers must be greater than 0.");
  if (lk < 0 || cm < 0 || sv < 0 || sh < 0) errs.push("Engagement counts cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcEngagement(fl, lk, cm, sv, sh)); };
  const reset = () => {
    setFollowers(DEFAULTS.followers); setLikes(DEFAULTS.likes); setComments(DEFAULTS.comments); setSaves(DEFAULTS.saves); setShares(DEFAULTS.shares);
    setResult(calcEngagement(25000, 900, 45, 60, 20));
  };
  useEffect(() => { setResult(calcEngagement(25000, 900, 45, 60, 20)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is engagement rate calculated?", answer: "Add likes, comments, saves, and shares, divide by followers, and multiply by 100. Saves and shares count more heavily in the algorithm, but this standard formula treats all equally." },
    { question: "What is a good engagement rate?", answer: "For most accounts, 1–3% is average, 3–6% is good, and above 6% is excellent. Smaller accounts often see higher rates because the follower base is more intentional." },
    { question: "Why do saves matter?", answer: "Saves signal future value and are weighted heavily by Instagram's ranking. Posts with high save rates get pushed to non-followers, driving reach and new followers." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Instagram Engagement Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Instagram Engagement Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Followers</label>
                <div className={inp}><input type="number" value={followers} onChange={e => setFollowers(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Likes</label>
                <div className={inp}><input type="number" value={likes} onChange={e => setLikes(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Comments</label>
                <div className={inp}><input type="number" value={comments} onChange={e => setComments(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Saves</label>
                <div className={inp}><input type="number" value={saves} onChange={e => setSaves(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Additional Signals</div>
                  <div>
                    <label className={lbl}>Shares</label>
                    <div className={inp}><input type="number" value={shares} onChange={e => setShares(e.target.value)} className={ci} /></div>
                    <p className="text-xs text-muted-foreground mt-1.5">Reposts and message shares — a strong ranking signal included in the total.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Engagement Rate</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.rate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">{result.total.toLocaleString()} engagements on {result.followers.toLocaleString()} followers</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Total Engagements`, result.total.toLocaleString()], ["Benchmark", result.benchmark], ["Engagements/Follower", (result.total / Math.max(result.followers, 1)).toFixed(3)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-base font-bold ${i === 1 ? result.benchmarkColor : ""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Engagement Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Engagement Mix</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Composition of total engagements</p>
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
            <h2 className="text-2xl font-bold mb-3">Measuring Account Health</h2>
            <p>This <strong>Instagram engagement calculator</strong> computes engagement rate — total interactions divided by followers — the standard health metric for social accounts. Unlike raw follower counts, the rate measures how actively your audience responds to content.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Number</h2>
            <p>1–3% is typical, 3–6% is strong, and 6%+ is exceptional. Rates naturally decline as accounts grow past 100K followers, so compare against accounts of similar size rather than celebrity outliers.</p>
            <h2 className="text-2xl font-bold mb-3">Improving It</h2>
            <p>Saves and shares carry outsized algorithmic weight — content people bookmark and forward reaches far beyond followers. Carousels, tutorials, and value-dense posts consistently lift both the rate and the reach that feeds it.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/instagram-engagement-calculator" />
          <PopularCalculators exclude="/calculator/instagram-engagement-calculator" />
        </div>
      </div>
    </>
  );
}
