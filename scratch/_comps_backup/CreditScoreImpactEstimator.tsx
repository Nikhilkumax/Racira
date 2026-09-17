"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface ScoreImpactInputs {
  currentScore: number;
  currentUtilization: number;
  newUtilization: number;
  latePayment: boolean;
  hardInquiries: number;
}

interface ScoreImpactResult {
  estimatedScore: number;
  utilizationImpact: number;
  lateImpact: number;
  inquiryImpact: number;
  totalImpact: number;
  utilizationBand: string;
  chartData: { name: string; score: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function utilizationBand(u: number): { label: string; impact: number } {
  if (u <= 9) return { label: "0–9% (excellent)", impact: 0 };
  if (u <= 29) return { label: "10–29% (great)", impact: -5 };
  if (u <= 49) return { label: "30–49% (good)", impact: -15 };
  if (u <= 69) return { label: "50–69% (fair)", impact: -35 };
  if (u <= 89) return { label: "70–89% (poor)", impact: -60 };
  return { label: "90%+ (maxed out)", impact: -90 };
}

function calculateScoreImpact(inputs: ScoreImpactInputs): ScoreImpactResult {
  const { currentScore, currentUtilization, newUtilization, latePayment, hardInquiries } = inputs;

  const curBand = utilizationBand(currentUtilization);
  const newBand = utilizationBand(newUtilization);
  // Impact is the change in band penalty, scaled to the current score level
  const utilizationImpact = Math.max(-90, Math.min(20, newBand.impact - curBand.impact));
  const lateImpact = latePayment ? -100 : 0;
  const inquiryImpact = -5 * hardInquiries;

  const totalImpact = utilizationImpact + lateImpact + inquiryImpact;
  const estimatedScore = Math.max(300, Math.min(850, currentScore + totalImpact));

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const chartData = [
    { name: "Current Score", score: currentScore },
    { name: "Estimated Score", score: estimatedScore },
  ];

  const breakdown = [
    { label: "Current Credit Score", value: fmt(currentScore) },
    { label: "Current Utilization", value: `${currentUtilization}% (${curBand.label})` },
    { label: "New Utilization", value: `${newUtilization}% (${newBand.label})`, highlight: true },
    { label: "Utilization Impact", value: `${utilizationImpact > 0 ? "+" : ""}${utilizationImpact}` },
    { label: "Late Payment Impact", value: `${lateImpact > 0 ? "+" : ""}${lateImpact}`, highlight: true },
    { label: "Hard Inquiry Impact", value: `${inquiryImpact > 0 ? "+" : ""}${inquiryImpact}` },
    { label: "Estimated New Score", value: fmt(estimatedScore), isTotal: true },
  ];

  const summary = [
    { label: "Current Score", value: fmt(currentScore) },
    { label: "New Utilization", value: `${newUtilization}%` },
    { label: "Utilization Δ", value: `${utilizationImpact > 0 ? "+" : ""}${utilizationImpact}` },
    { label: "Late Payment Δ", value: `${lateImpact > 0 ? "+" : ""}${lateImpact}` },
    { label: "Inquiries Δ", value: `${inquiryImpact > 0 ? "+" : ""}${inquiryImpact}` },
    { label: "Estimated Score", value: fmt(estimatedScore) },
  ];

  return { estimatedScore, utilizationImpact, lateImpact, inquiryImpact, totalImpact, utilizationBand: newBand.label, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: ScoreImpactInputs = { currentScore: 700, currentUtilization: 30, newUtilization: 85, latePayment: false, hardInquiries: 0 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow = ({ label, checked, onChange }: ToggleRowProps) => (
  <label className="flex items-center justify-between cursor-pointer select-none">
    <span className="text-sm font-medium text-foreground">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  </label>
);

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string | number; value?: number | string }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">{String(p.name)}</p>
      <p className="text-primary font-extrabold text-sm">{String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function CreditScoreImpactEstimator() {
  const [currentScore, setCurrentScore] = useState(String(DEFAULTS.currentScore));
  const [currentUtil, setCurrentUtil] = useState(String(DEFAULTS.currentUtilization));
  const [newUtil, setNewUtil] = useState(String(DEFAULTS.newUtilization));
  const [latePayment, setLatePayment] = useState(DEFAULTS.latePayment);
  const [inquiries, setInquiries] = useState(String(DEFAULTS.hardInquiries));
  const [results, setResults] = useState<ScoreImpactResult>(() => calculateScoreImpact(DEFAULTS));

  const getInputs = (): ScoreImpactInputs => ({
    currentScore: parseFloat(currentScore) || 0,
    currentUtilization: parseFloat(currentUtil) || 0,
    newUtilization: parseFloat(newUtil) || 0,
    latePayment,
    hardInquiries: parseFloat(inquiries) || 0,
  });

  useEffect(() => {
    setResults(calculateScoreImpact(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  const scoreNum = parseFloat(currentScore) || 0;
  if (scoreNum < 300 || scoreNum > 850) valErrors.currentScore = "Score must be 300–850";
  if ((parseFloat(currentUtil) || 0) < 0 || (parseFloat(currentUtil) || 0) > 100) valErrors.currentUtil = "Utilization must be 0–100%";
  if ((parseFloat(newUtil) || 0) < 0 || (parseFloat(newUtil) || 0) > 100) valErrors.newUtil = "Utilization must be 0–100%";
  if ((parseFloat(inquiries) || 0) < 0 || (parseFloat(inquiries) || 0) > 10) valErrors.inquiries = "Inquiries must be 0–10";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateScoreImpact(getInputs()));
  };

  const reset = () => {
    setCurrentScore(String(DEFAULTS.currentScore));
    setCurrentUtil(String(DEFAULTS.currentUtilization));
    setNewUtil(String(DEFAULTS.newUtilization));
    setLatePayment(DEFAULTS.latePayment);
    setInquiries(String(DEFAULTS.hardInquiries));
    setResults(calculateScoreImpact(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const faqs = [
    {
      question: "How does credit utilization affect my score?",
      answer: "Utilization — the share of your credit limits you're using — is one of the largest FICO factors. Scores reward staying under 30%, and especially under 10%. This estimator applies FICO-style penalty bands: 0–9% costs nothing, 30–49% costs about 15 points, and 90%+ can cost 90 points. The impact shown is the change in band penalty between your current and new utilization.",
    },
    {
      question: "Why is a late payment a bigger hit than maxing out a card?",
      answer: "Payment history is the single heaviest-weighted FICO factor (about 35%). A single 30-day late payment typically drops a score 90–110 points and stays on your report for seven years. By contrast, utilization is recalculated monthly, so a maxed-out card hurts now but recovers within a billing cycle or two after you pay it down.",
    },
    {
      question: "Is this estimator accurate for my real score?",
      answer: "No estimator can be exact — lenders use many versions of FICO and VantageScore with different weightings, and your full credit report matters. Treat this as a planning tool: it shows the direction and rough magnitude of a change using standard band-based heuristics. Your actual score can move more or less depending on your credit mix, account age, and the scoring model the lender pulls.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Credit Score Impact Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Score Impact Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="current-score" label="Current Credit Score" value={currentScore} onChange={setCurrentScore} min="300" error={valErrors.currentScore} />
              <CompactInput id="current-util" label="Current Utilization" value={currentUtil} onChange={setCurrentUtil} suffix="%" error={valErrors.currentUtil} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="new-util" label="New Utilization" value={newUtil} onChange={setNewUtil} suffix="%" error={valErrors.newUtil} />
              <CompactInput id="inquiries" label="Hard Inquiries" value={inquiries} onChange={setInquiries} suffix="count" error={valErrors.inquiries} />
            </div>
            <div className="border border-border rounded-lg p-3 flex flex-col gap-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Credit Events</div>
              <ToggleRow label="30-day late payment this month" checked={latePayment} onChange={setLatePayment} />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calc}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"}`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {hasErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated New Credit Score</div>
              <div className="text-4xl font-bold text-primary tracking-tight">{results.estimatedScore}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.totalImpact >= 0 ? `Gain of ${results.totalImpact} points` : `Drop of ${Math.abs(results.totalImpact)} points`} — {results.utilizationBand} utilization.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Score</span>
                <span className="font-extrabold text-foreground">{(parseFloat(currentScore) || DEFAULTS.currentScore).toLocaleString()}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Utilization Δ</span>
                <span className={`font-extrabold ${results.utilizationImpact < 0 ? "text-red-600" : "text-emerald-600"}`}>{results.utilizationImpact > 0 ? "+" : ""}{results.utilizationImpact}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Impact</span>
                <span className={`font-extrabold ${results.totalImpact < 0 ? "text-red-600" : "text-emerald-600"}`}>{results.totalImpact > 0 ? "+" : ""}{results.totalImpact}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : row.highlight ? "bg-amber-500/10" : "hover:bg-secondary/20"}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-2 w-full text-left">Score Before vs After</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} barSize={64}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[300, 850]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {results.chartData.map((d, i) => (
                      <Cell key={i} fill={i === 0 ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: i === 0 ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))" }} />
                    {d.name} — {d.score}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-3 text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {results.summary.map((row, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Credit Score Impact Estimator?</h2>
            <p>This estimator shows the approximate direction and size of a score change from the three actions people ask about most: raising or lowering credit utilization, taking a hard inquiry, and a 30-day late payment. It applies standard FICO-style heuristics — utilization penalty bands, a roughly 100-point late-payment hit, and 5 points per inquiry.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The current and new utilization levels are each mapped to a penalty band (0–9%, 10–29%, 30–49%, 50–69%, 70–89%, 90%+). The change in band penalty is your utilization impact. A late payment adds a 100-point penalty and each hard inquiry subtracts 5. The sum of the three is applied to your current score, clamped to the 300–850 range.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The headline number is your estimated score after the modeled events. Because utilization recovers monthly while late payments linger for years, the two affect your score on very different timelines — the breakdown table makes each contribution explicit. Use the estimator to decide, for example, whether paying a card down below 30% is worth more than avoiding a hard inquiry.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-score-impact-estimator" />
          <PopularCalculators exclude="/calculator/credit-score-impact-estimator" />
        </div>
      </div>
    </>
  );
}
