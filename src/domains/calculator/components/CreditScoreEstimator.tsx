"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ScoreResult {
  score: number;
  rating: string;
  ratingColor: string;
  range: string;
  contributions: { label: string; points: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

type Mix = "limited" | "moderate" | "rich";

function rateScore(s: number): { rating: string; color: string } {
  if (s >= 800) return { rating: "Excellent", color: "text-emerald-600" };
  if (s >= 740) return { rating: "Very Good", color: "text-emerald-600" };
  if (s >= 670) return { rating: "Good", color: "text-amber-500" };
  if (s >= 580) return { rating: "Fair", color: "text-orange-500" };
  return { rating: "Poor", color: "text-red-500" };
}

function utilizationPoints(util: number): number {
  const base = 255; // 30% weight of 850
  if (util <= 9) return base;
  if (util <= 29) return base * 0.85;
  if (util <= 49) return base * 0.6;
  if (util <= 69) return base * 0.35;
  if (util <= 89) return base * 0.15;
  return base * 0.05;
}

function calcScore(paymentPct: number, util: number, years: number, inquiries: number, mix: Mix): ScoreResult {
  const payment = 297.5 * Math.min(1, Math.max(0, paymentPct) / 100); // 35% weight
  const utilization = utilizationPoints(Math.max(0, Math.min(100, util)));
  const history = 127.5 * Math.min(1, Math.max(0, years) / 7); // 15% weight
  const inqBase = 85; // 10% weight
  const inquiriesPts = inquiries <= 1 ? inqBase : inquiries <= 2 ? inqBase * 0.95 : inquiries <= 4 ? inqBase * 0.7 : inquiries <= 6 ? inqBase * 0.45 : inqBase * 0.3;
  const mixPts = { limited: 85 * 0.55, moderate: 85 * 0.8, rich: 85 }[mix];
  const score = Math.round(Math.min(850, Math.max(300, payment + utilization + history + inquiriesPts + mixPts)));
  const { rating, color } = rateScore(score);
  const range = `${Math.max(300, score - 25)}–${Math.min(850, score + 25)}`;

  const breakdown = [
    { label: "Payment History (35%)", value: `${Math.round(payment)} pts` },
    { label: "Credit Utilization (30%)", value: `${Math.round(utilization)} pts` },
    { label: "History Length (15%)", value: `${Math.round(history)} pts` },
    { label: "Hard Inquiries (10%)", value: `${Math.round(inquiriesPts)} pts` },
    { label: "Credit Mix (10%)", value: `${Math.round(mixPts)} pts` },
    { label: "Estimated Score", value: `${score}` },
    { label: "Rating", value: rating },
    { label: "Typical Range", value: range },
  ];
  const summaryStats = [
    { label: "Estimated Score", value: `${score}` },
    { label: "Rating", value: rating },
    { label: "Range", value: range },
    { label: "Payment History", value: `${paymentPct}% on-time` },
    { label: "Utilization", value: `${util}%` },
    { label: "Credit Age", value: `${years} years` },
    { label: "Inquiries", value: `${inquiries}` },
    { label: "Credit Mix", value: mix === "rich" ? "Rich" : mix === "moderate" ? "Moderate" : "Limited" },
  ];
  const contributions = [
    { label: "Payment History", points: Math.round(payment) },
    { label: "Utilization", points: Math.round(utilization) },
    { label: "History Length", points: Math.round(history) },
    { label: "Inquiries", points: Math.round(inquiriesPts) },
    { label: "Credit Mix", points: Math.round(mixPts) },
  ];
  const chartData = [
    { name: "Payments", value: Math.round(payment), fill: "hsl(var(--primary))" },
    { name: "Utilization", value: Math.round(utilization), fill: "#10b981" },
    { name: "History", value: Math.round(history), fill: "#8b5cf6" },
    { name: "Inquiries", value: Math.round(inquiriesPts), fill: "#f59e0b" },
    { name: "Mix", value: Math.round(mixPts), fill: "#ef4444" },
  ];
  return { score, rating, ratingColor: color, range, contributions, breakdown, summaryStats, chartData };
}

const DEFAULTS = { payment: "100", utilization: "25", years: "6", inquiries: "2", mix: "moderate" as Mix };

export default function CreditScoreEstimator() {
  const [payment, setPayment] = useState(DEFAULTS.payment);
  const [utilization, setUtilization] = useState(DEFAULTS.utilization);
  const [years, setYears] = useState(DEFAULTS.years);
  const [inquiries, setInquiries] = useState(DEFAULTS.inquiries);
  const [mix, setMix] = useState<Mix>("moderate");
  const [result, setResult] = useState<ScoreResult | null>(null);

  const p = parseFloat(payment) || 0;
  const u = parseFloat(utilization) || 0;
  const y = parseFloat(years) || 0;
  const iq = parseFloat(inquiries) || 0;
  const errs: string[] = [];
  if (p < 0 || p > 100) errs.push("Payment history must be 0–100%.");
  if (u < 0 || u > 100) errs.push("Utilization must be 0–100%.");
  if (y < 0 || y > 50) errs.push("Credit history must be 0–50 years.");
  if (iq < 0 || iq > 20) errs.push("Inquiries must be 0–20.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcScore(p, u, y, iq, mix)); };
  const reset = () => {
    setPayment(DEFAULTS.payment); setUtilization(DEFAULTS.utilization); setYears(DEFAULTS.years); setInquiries(DEFAULTS.inquiries); setMix("moderate");
    setResult(calcScore(100, 25, 6, 2, "moderate"));
  };
  useEffect(() => { setResult(calcScore(100, 25, 6, 2, "moderate")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is a credit score calculated?", answer: "FICO scores weight five factors: payment history (35%), amounts owed / utilization (30%), length of credit history (15%), new credit / inquiries (10%), and credit mix (10%). The exact algorithm is proprietary, so this estimator applies a transparent approximation of those weights." },
    { question: "What is credit utilization and why does it matter?", answer: "Utilization is your total credit card balances divided by your total credit limits. Keeping it under 30% is the common rule; under 10% scores even better. Utilization is the second-most important factor and the fastest one to improve." },
    { question: "How long does it take to improve a credit score?", answer: "Late payments stay on your report for 7 years and bankruptcies for 10, but their impact fades as they age. Utilization changes can lift a score within a billing cycle. Consistent on-time payments rebuild a score meaningfully within 6–12 months." },
    { question: "Why is my actual score different from this estimate?", answer: "Lenders use different scoring models (FICO 8, FICO 10, VantageScore) and your report details matter — account types, limits, and balances beyond the five broad factors here. Treat this as a directional estimate, and check your actual score through your card issuer or AnnualCreditReport.com." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Credit Score Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Credit Score Estimator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Payment History</label>
                <div className={inp}><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">% on-time</span></div>
              </div>
              <div>
                <label className={lbl}>Credit Utilization</label>
                <div className={inp}><input type="number" value={utilization} onChange={e => setUtilization(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Credit History Length</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
              <div>
                <label className={lbl}>Hard Inquiries</label>
                <div className={inp}><input type="number" value={inquiries} onChange={e => setInquiries(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">(2 yrs)</span></div>
              </div>
            </div>
            <div>
              <label className={lbl}>Credit Mix</label>
              <select value={mix} onChange={e => setMix(e.target.value as Mix)} className={sel}>
                <option value="limited">Limited (one card type)</option>
                <option value="moderate">Moderate (cards + one installment loan)</option>
                <option value="rich">Rich (cards, installment, mortgage)</option>
              </select>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Credit Score</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.score}</div>
                <div className={`text-sm mt-1 font-semibold ${result.ratingColor}`}>{result.rating} · Typical range {result.range}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Rating", result.rating, result.ratingColor], ["Range", result.range], ["Utilization", `${utilization}%`]].map(([l, v, color], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-base font-bold ${color || ""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Factor Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Points by Factor</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 350]} />
                    <Tooltip formatter={(v: number) => [`${v} points`, "Contribution"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Goes Into a Credit Score</h2>
            <p>This <strong>credit score estimator</strong> applies the five-factor framework used by FICO: payment history (35%), amounts owed (30%), length of history (15%), new credit (10%), and credit mix (10%). The result is a transparent, directional estimate — the exact scoring formula is proprietary and varies by lender and model.</p>
            <h2 className="text-2xl font-bold mb-3">Rating Bands</h2>
            <p>800+: Excellent · 740–799: Very Good · 670–739: Good · 580–669: Fair · Below 580: Poor. Higher scores unlock lower interest rates: a 760+ borrower might pay 1–2 percentage points less on a mortgage than a 660 borrower — tens of thousands of dollars over a 30-year loan.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Your Score</h2>
            <p>Pay every bill on time. Bring utilization below 30% — ideally under 10%. Let old accounts age; keep cards open. Limit new hard inquiries to what you truly need. Mixing installment debt (auto, student) with revolving credit strengthens the mix factor.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-score-estimator" />
          <PopularCalculators exclude="/calculator/credit-score-estimator" />
        </div>
      </div>
    </>
  );
}
