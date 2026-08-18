"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface InterviewInputs {
  academic: number;   // 0-100
  testScore: number;  // 0-100 (admissions test / written work)
  interview: number;  // 0-100 (predicted/actual interview performance)
  competition: string; // low | medium | high
}

interface ChartPoint {
  name: string;
  score: number;
}

interface InterviewResults {
  readiness: number;
  probability: number;
  band: string;
  academicWeighted: number;
  testWeighted: number;
  interviewWeighted: number;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function bandFor(p: number): string {
  if (p < 25) return "Long shot (< 25%)";
  if (p < 50) return "Possible (25-50%)";
  if (p < 75) return "Strong chance (50-75%)";
  return "Very strong (75%+)";
}

function calcInterview(i: InterviewInputs): InterviewResults {
  const academicWeighted = i.academic * 0.3;
  const testWeighted = i.testScore * 0.3;
  const interviewWeighted = i.interview * 0.4;
  const base = academicWeighted + testWeighted + interviewWeighted;

  // Competition adjusts the effective probability: high competition dampens the odds.
  const competitionFactor = i.competition === "low" ? 1.15 : i.competition === "high" ? 0.85 : 1.0;
  const probability = Math.min(95, Math.max(5, base * competitionFactor));
  const readiness = Math.min(100, Math.max(0, base));

  const chartData: ChartPoint[] = [
    { name: "Academic Record", score: i.academic },
    { name: "Admissions Test", score: i.testScore },
    { name: "Interview", score: i.interview },
  ];

  const breakdown = [
    { label: "Academic Record (30%)", value: `${i.academic}/100` },
    { label: "Admissions Test / Written Work (30%)", value: `${i.testScore}/100` },
    { label: "Interview Performance (40%)", value: `${i.interview}/100` },
    { label: "Competition Level", value: i.competition.charAt(0).toUpperCase() + i.competition.slice(1) },
    { label: "Weighted Readiness Score", value: `${readiness.toFixed(1)}/100`, highlight: true },
    { label: "Estimated Offer Probability", value: `${probability.toFixed(1)}%`, isTotal: true },
  ];

  const summaryStats = [
    { label: "Readiness Score", value: `${readiness.toFixed(1)}/100` },
    { label: "Offer Probability", value: `${probability.toFixed(1)}%` },
    { label: "Academic (30%)", value: `${i.academic}/100` },
    { label: "Test (30%)", value: `${i.testScore}/100` },
    { label: "Interview (40%)", value: `${i.interview}/100` },
    { label: "Competition", value: i.competition.charAt(0).toUpperCase() + i.competition.slice(1) },
    { label: "Assessment Band", value: bandFor(probability) },
    { label: "Max Possible", value: "100" },
  ];

  return { readiness, probability, band: bandFor(probability), academicWeighted, testWeighted, interviewWeighted, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  academic: "78",
  testScore: "72",
  interview: "80",
  competition: "high",
};

// 4. Component
export default function OxbridgeInterviewCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<InterviewResults>(() =>
    calcInterview({ academic: 78, testScore: 72, interview: 80, competition: "high" })
  );

  useEffect(() => {
    setResult(calcInterview({ academic: 78, testScore: 72, interview: 80, competition: "high" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcInterview({
        academic: parseFloat(inputs.academic) || 0,
        testScore: parseFloat(inputs.testScore) || 0,
        interview: parseFloat(inputs.interview) || 0,
        competition: inputs.competition as "low" | "medium" | "high",
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcInterview({ academic: 78, testScore: 72, interview: 80, competition: "high" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  (["academic", "testScore", "interview"] as (keyof typeof DEFAULTS)[]).forEach((k) => {
    const v = parseFloat(inputs[k]) || 0;
    if (v < 0 || v > 100) errors[k] = "Must be 0 - 100";
  });
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How accurate is this probability?", answer: "This is a calibrated estimate, not a guarantee. Oxford and Cambridge interview roughly 50-80% of applicants in most subjects and make offers to a large share of those interviewed, but outcomes depend on factors no calculator can see — specific tutor impressions, subject demand, and college pool decisions." },
    { question: "What weight should I give each component?", answer: "This calculator uses 30% academic record, 30% admissions test or written work, and 40% interview performance — reflecting that the interview is the decisive stage for most candidates. Adjust the scores to match your actual position: candidates who aced the admissions test should score it higher than their interview." },
    { question: "What makes a strong Oxbridge interview?", answer: "Tutors look for how you think, not what you know: reason aloud, ask clarifying questions, and engage with hints. Practise explaining your subject out loud, revisit your personal statement and written work, and prepare to discuss problems you have never seen before." },
    { question: "What is a realistic interview rate?", answer: "Across all subjects, Cambridge interviews about 70-80% of applicants; Oxford about 50-60%. After interview, roughly half of interviewed candidates receive an offer. Because the pool is already strong, the interview is genuinely decisive for many candidates." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Oxbridge Interview Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Oxbridge Interview Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="academic" className={lbl}>Academic Record</label>
                <div className={inp}>
                  <input id="academic" type="number" min="0" max="100" value={inputs.academic} onChange={(e) => set("academic")(e.target.value)} className={ci} />
                </div>
                {errors.academic && <p className="text-xs text-red-500 font-medium mt-1">{errors.academic}</p>}
              </div>
              <div>
                <label htmlFor="test" className={lbl}>Admissions Test / Written Work</label>
                <div className={inp}>
                  <input id="test" type="number" min="0" max="100" value={inputs.testScore} onChange={(e) => set("testScore")(e.target.value)} className={ci} />
                </div>
                {errors.testScore && <p className="text-xs text-red-500 font-medium mt-1">{errors.testScore}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="interview" className={lbl}>Interview Performance</label>
                <div className={inp}>
                  <input id="interview" type="number" min="0" max="100" value={inputs.interview} onChange={(e) => set("interview")(e.target.value)} className={ci} />
                </div>
                {errors.interview && <p className="text-xs text-red-500 font-medium mt-1">{errors.interview}</p>}
              </div>
              <div>
                <label htmlFor="competition" className={lbl}>Competition Level</label>
                <select id="competition" value={inputs.competition} onChange={(e) => set("competition")(e.target.value)} className={`${inp} cursor-pointer font-medium`}>
                  <option value="low">Low (5-10 per place)</option>
                  <option value="medium">Medium (10-20 per place)</option>
                  <option value="high">High (20+ per place)</option>
                </select>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Offer Probability</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.probability.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">Readiness: {result.readiness.toFixed(1)}/100 · {result.band}</div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Readiness Score", `${result.readiness.toFixed(1)}/100`],
                ["Offer Probability", `${result.probability.toFixed(1)}%`],
                ["Interview Weight", `40% of score`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Assessment Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Component Scores (0-100)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => [`${v}/100`, "Score"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={idx === 2 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The interview carries the highest weight (40%) in the readiness score.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How the Estimate Works</h2>
            <p>This calculator combines three components into a readiness score: academic record (30%), admissions test or written work (30%), and interview performance (40%). A competition factor then adjusts the score into an estimated offer probability — high-demand courses (20+ applicants per place) dampen the odds, while lower-demand subjects improve them.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Interview Carries the Most Weight</h2>
            <p>By the time a candidate is invited to interview, the academic record and admissions test have already been scored. The interview is where tutors test how candidates think under pressure, so it dominates the final decision for most applicants. Score your interview honestly — an average interview with a strong record usually cannot save an application in a competitive subject.</p>
            <h2 className="text-2xl font-bold mb-3">Using This Before and After</h2>
            <p>Use it before the interview with predicted scores to set preparation priorities, then re-run it after with your actual sense of how the interview went. If your probability drops sharply, focus on realistic alternatives; if it holds, prepare your post-interview paperwork and reappraisal options in parallel.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/oxbridge-interview-calculator" />
          <PopularCalculators exclude="/calculator/oxbridge-interview-calculator" />
        </div>
      </div>
    </>
  );
}
