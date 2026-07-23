"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, GraduationCap, TrendingUp, BookOpen, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ApScoreInputs {
  mcCorrect: number;
  mcTotal: number;
  frScore: number;
  frTotal: number;
  mcWeight: number;
  frWeight: number;
  passingThreshold: number;
}

interface ApScoreResult {
  apScore: number;
  mcPercentage: number;
  frPercentage: number;
  compositePercentage: number;
  passFail: string;
  passFailColor: string;
  recommendation: string;
  chartData: { name: string; value: number; max: number; fill: string }[];
  breakdown: { section: string; raw: number; total: number; percentage: number; contribution: number }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS: ApScoreInputs = {
  mcCorrect: 35,
  mcTotal: 55,
  frScore: 18,
  frTotal: 30,
  mcWeight: 60,
  frWeight: 40,
  passingThreshold: 3,
};

function apScoreToLabel(score: number): string {
  if (score >= 5) return "Extremely Well Qualified";
  if (score === 4) return "Well Qualified";
  if (score === 3) return "Qualified";
  if (score === 2) return "Possibly Qualified";
  return "No Recommendation";
}

function calculateApScore(inputs: ApScoreInputs): ApScoreResult {
  const mcTotal = Math.max(1, Number(inputs.mcTotal) || 0);
  const mcCorrect = Math.max(0, Math.min(mcTotal, Number(inputs.mcCorrect) || 0));
  const frTotal = Math.max(1, Number(inputs.frTotal) || 0);
  const frScore = Math.max(0, Math.min(frTotal, Number(inputs.frScore) || 0));
  const mcWeight = Math.max(0, Math.min(100, Number(inputs.mcWeight) || 60));
  const frWeight = Math.max(0, Math.min(100 - mcWeight, Number(inputs.frWeight) || 40));
  const passingThreshold = Math.max(1, Math.min(5, Number(inputs.passingThreshold) || 3));

  const mcPercentage = mcTotal > 0 ? (mcCorrect / mcTotal) * 100 : 0;
  const frPercentage = frTotal > 0 ? (frScore / frTotal) * 100 : 0;
  const compositePercentage = (mcPercentage * (mcWeight / 100)) + (frPercentage * (frWeight / 100));

  let apScore: number;
  if (compositePercentage >= 85) apScore = 5;
  else if (compositePercentage >= 70) apScore = 4;
  else if (compositePercentage >= 55) apScore = 3;
  else if (compositePercentage >= 40) apScore = 2;
  else apScore = 1;

  const passFail = apScore >= passingThreshold ? "Pass" : "Not Yet";
  const passFailColor = apScore >= passingThreshold ? "#22c55e" : "#ef4444";
  const recommendation = apScore >= passingThreshold
    ? `Congratulations! Your estimated AP score of ${apScore} meets the typical passing threshold of ${passingThreshold}. You are well positioned for college credit at most institutions. Consider taking additional practice exams to confirm readiness.`
    : `Your estimated AP score of ${apScore} is below the typical passing threshold of ${passingThreshold}. Focus on reviewing weak content areas, completing additional practice problems, and retaking practice exams to improve your score before test day.`;

  const chartData = [
    { name: "Multiple Choice", value: parseFloat((compositePercentage * (mcWeight / 100)).toFixed(1)), max: mcWeight, fill: "#3b82f6" },
    { name: "Free Response", value: parseFloat((compositePercentage * (frWeight / 100)).toFixed(1)), max: frWeight, fill: "#10b981" },
  ];

  const breakdown = [
    { section: "Multiple Choice", raw: mcCorrect, total: mcTotal, percentage: parseFloat(mcPercentage.toFixed(1)), contribution: parseFloat((mcPercentage * (mcWeight / 100)).toFixed(1)) },
    { section: "Free Response", raw: frScore, total: frTotal, percentage: parseFloat(frPercentage.toFixed(1)), contribution: parseFloat((frPercentage * (frWeight / 100)).toFixed(1)) },
  ];

  const summaryStats = [
    { label: "AP Score", value: `${apScore} / 5` },
    { label: "Composite %", value: `${compositePercentage.toFixed(1)}%` },
    { label: "Status", value: passFail },
    { label: "Label", value: apScoreToLabel(apScore) },
  ];

  return {
    apScore,
    mcPercentage,
    frPercentage,
    compositePercentage,
    passFail,
    passFailColor,
    recommendation,
    chartData,
    breakdown,
    summaryStats,
  };
}

export default function ApScoreCalculator() {
  const [inputs, setInputs] = useState<ApScoreInputs>(DEFAULTS);
  const [result, setResult] = useState<ApScoreResult>(calculateApScore(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCalculate = () => {
    setResult(calculateApScore(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateApScore(DEFAULTS));
  };

  useEffect(() => {
    setResult(calculateApScore(inputs));
  }, []);

  const updateInput = (field: keyof ApScoreInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const faqs = [
    { question: "How is the AP score calculated?", answer: "The AP score is estimated using a weighted combination of your multiple-choice and free-response performance. The multiple-choice section typically counts for about 60% of your score, while the free-response section counts for about 40%. Your raw scores in each section are converted to percentages, weighted accordingly, and then mapped to the 1-5 AP scale." },
    { question: "What does each AP score mean?", answer: "A score of 5 means 'Extremely Well Qualified', 4 means 'Well Qualified', 3 means 'Qualified', 2 means 'Possibly Qualified', and 1 means 'No Recommendation'. Most colleges grant credit or advanced placement for scores of 3 or higher, though policies vary by institution." },
    { question: "Can I use this calculator for any AP exam?", answer: "This calculator provides a general estimate based on the standard College Board scoring methodology. While the exact raw-to-scaled conversion varies by exam and test date due to equating, the weighted formula used here closely approximates how the College Board calculates final AP scores." },
    { question: "What is a good AP score for college credit?", answer: "A score of 3 or higher is generally considered passing and may qualify you for college credit or advanced placement. However, policies vary widely: some elite universities only accept 4 or 5, while most public universities accept 3 or higher. Always check your target school's AP credit policy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "AP Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-foreground">AP Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-5 !p-5 border border-border bg-card shadow-sm sticky top-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>MC Questions Correct</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.mcCorrect} / {inputs.mcTotal}</span>
                  </label>
                  <input type="number" value={inputs.mcCorrect} onChange={e => updateInput("mcCorrect", Number(e.target.value))} className="input-calc" min="0" max={inputs.mcTotal} />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>MC Total Questions</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.mcTotal} q</span>
                  </label>
                  <input type="number" value={inputs.mcTotal} onChange={e => updateInput("mcTotal", Number(e.target.value))} className="input-calc" min="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>FR Score Earned</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.frScore} / {inputs.frTotal}</span>
                  </label>
                  <input type="number" value={inputs.frScore} onChange={e => updateInput("frScore", Number(e.target.value))} className="input-calc" min="0" max={inputs.frTotal} step="0.5" />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>FR Total Points</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.frTotal} pts</span>
                  </label>
                  <input type="number" value={inputs.frTotal} onChange={e => updateInput("frTotal", Number(e.target.value))} className="input-calc" min="1" />
                </div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2 focus:outline-none">
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1.5 flex justify-between">
                        <span>MC Weight %</span>
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.mcWeight}%</span>
                      </label>
                      <input type="number" value={inputs.mcWeight} onChange={e => updateInput("mcWeight", Number(e.target.value))} className="input-calc" min="0" max="100" />
                      <p className="text-xs text-muted-foreground mt-1">Typical MC weight is 55-65%.</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 flex justify-between">
                        <span>FR Weight %</span>
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.frWeight}%</span>
                      </label>
                      <input type="number" value={inputs.frWeight} onChange={e => updateInput("frWeight", Number(e.target.value))} className="input-calc" min="0" max="100" />
                      <p className="text-xs text-muted-foreground mt-1">Typical FR weight is 35-45%.</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-1.5 flex justify-between">
                      <span>Passing Threshold</span>
                      <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.passingThreshold} / 5</span>
                    </label>
                    <input type="number" value={inputs.passingThreshold} onChange={e => updateInput("passingThreshold", Number(e.target.value))} className="input-calc" min="1" max="5" step="0.5" />
                    <p className="text-xs text-muted-foreground mt-1">Most colleges accept AP 3+. Some require 4+.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2 border-t border-border pt-4">
              <button type="button" onClick={handleCalculate} className="w-full flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} title="Reset" className="w-11 flex-shrink-0 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (
              <>
                <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.passFailColor}10`, borderColor: result.passFailColor }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.passFailColor }}>Estimated AP Score</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.apScore}</div>
                        <div className="text-2xl font-bold text-muted-foreground">/ 5</div>
                      </div>
                    </div>
                    <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                      {result.apScore >= 3 ? <Award className="w-8 h-8" style={{ color: result.passFailColor }} /> : <TrendingUp className="w-8 h-8" style={{ color: result.passFailColor }} />}
                    </div>
                  </div>
                  <div className="text-base font-bold mt-2" style={{ color: result.passFailColor }}>
                    {result.passFail} — {apScoreToLabel(result.apScore)}
                  </div>
                  <div className="text-sm font-medium text-foreground mt-2 leading-relaxed">
                    {result.recommendation}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {result.summaryStats.slice(0, 3).map((s, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className="text-sm sm:text-lg font-black text-foreground">{s.value}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-base font-bold">Score Breakdown</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Visualizing how your MC and FR scores contribute to the composite percentage.</p>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value: number) => [`${value}%`, 'Weighted Contribution']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {result.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Section</th>
                        <th className="p-3 text-center text-xs font-bold uppercase text-muted-foreground tracking-wider">Raw</th>
                        <th className="p-3 text-center text-xs font-bold uppercase text-muted-foreground tracking-wider">Total</th>
                        <th className="p-3 text-center text-xs font-bold uppercase text-muted-foreground tracking-wider">Pct</th>
                        <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Weighted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.breakdown.map((item, idx) => (
                        <tr key={idx}>
                          <td className="text-[14px] py-3 px-3 font-medium">{item.section}</td>
                          <td className="text-[14px] py-3 px-3 text-center">{item.raw}</td>
                          <td className="text-[14px] py-3 px-3 text-center">{item.total}</td>
                          <td className="text-[14px] py-3 px-3 text-center">{item.percentage}%</td>
                          <td className="text-[14px] py-3 px-3 text-right">{item.contribution}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-base font-bold">Summary Statistics</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card mt-4">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i >= 2 ? "max-sm:border-t max-sm:border-l-0" : ""}`}>
                        <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                        <div className="text-sm font-black text-foreground">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding AP Exam Scoring</h2>
            <p>The College Board administers Advanced Placement (AP) exams each May to high school students seeking college-level credit. Each exam combines a multiple-choice section with a free-response section, and the final score is determined through a weighted conversion process rather than a simple raw percentage. The multiple-choice section is machine-scored for accuracy, while the free-response section is evaluated by trained readers using detailed rubrics. This dual-scoring model ensures that both factual knowledge and applied reasoning are measured fairly. Understanding how these sections combine to produce your final 1-5 AP score is critical for effective test preparation and strategic studying.</p>

            <h2 className="text-2xl font-bold mb-3">How Weighted Scoring Works</h2>
            <p>AP scores are not calculated as a straight average of raw points. Instead, the College Board applies a weighted formula where the multiple-choice section typically accounts for roughly 55 to 65 percent of the composite score, and the free-response section accounts for the remaining 35 to 45 percent. This weighting reflects the exam's design philosophy: the multiple-choice section tests breadth of knowledge across many topics, while the free-response section tests depth of understanding and the ability to construct coherent arguments under timed conditions. The weighted composite percentage is then mapped to the 1-5 scale using equating, which adjusts for variations in test difficulty across different administrations. Our calculator uses a generalized version of this model so you can estimate your score based on practice performance.</p>

            <h2 className="text-2xl font-bold mb-3">What Your AP Score Means for College</h2>
            <p>A score of 3 is generally considered the passing threshold and is accepted for credit or advanced placement at the majority of four-year colleges and universities in the United States. However, more selective institutions, particularly Ivy League and top engineering programs, often require a 4 or 5 for placement into higher-level courses. Some schools award full semester credit for a 5, advanced standing for a 4, and elective credit for a 3. A score of 2 is typically not accepted for credit, while a score of 1 provides no benefit. Because policies differ significantly between schools, always verify your target institution's AP credit guidelines. Earning a strong AP score can save thousands of dollars in tuition, accelerate your degree timeline, and demonstrate academic rigor to admissions officers.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ap-score-calculator" />
          <PopularCalculators exclude="/calculator/ap-score-calculator" />
        </div>
      </div>
    </>
  );
}
