"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, HeartPulse, AlertTriangle, ShieldCheck, Baby } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ApgarInputs {
  appearance: number;
  pulse: number;
  grimace: number;
  activity: number;
  respiration: number;
  gestationalAge: number;
  babyName: string;
}

interface ApgarResult {
  totalScore: number;
  status: string;
  category: string;
  statusColor: string;
  recommendation: string;
  chartData: { name: string; score: number; max: number; fill: string }[];
  breakdown: { category: string; score: number; description: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS: ApgarInputs = {
  appearance: 2,
  pulse: 2,
  grimace: 2,
  activity: 2,
  respiration: 2,
  gestationalAge: 40,
  babyName: "",
};

function calculateApgar(inputs: ApgarInputs): ApgarResult {
  const a = Math.max(0, Math.min(2, Number(inputs.appearance) || 0));
  const p = Math.max(0, Math.min(2, Number(inputs.pulse) || 0));
  const g = Math.max(0, Math.min(2, Number(inputs.grimace) || 0));
  const ac = Math.max(0, Math.min(2, Number(inputs.activity) || 0));
  const r = Math.max(0, Math.min(2, Number(inputs.respiration) || 0));
  const totalScore = a + p + g + ac + r;

  let status = "";
  let category = "";
  let statusColor = "";
  let recommendation = "";

  if (totalScore >= 7) {
    status = "Normal";
    category = "Normal";
    statusColor = "#22c55e";
    recommendation = "The newborn is transitioning well to life outside the womb. Routine post-delivery care (drying, warming, and clearing the airway if necessary) is sufficient. No immediate medical intervention is required.";
  } else if (totalScore >= 4) {
    status = "Low";
    category = "Low";
    statusColor = "#f59e0b";
    recommendation = "The newborn may need assistance. Medical intervention is typically required, including aggressive stimulation, clearing the airway, and administering supplemental oxygen. Closer monitoring is essential.";
  } else {
    status = "Critical";
    category = "Critical";
    statusColor = "#ef4444";
    recommendation = "The newborn requires immediate intervention. Advanced neonatal resuscitation, chest compressions, or intubation may be necessary. Every second counts in this scenario.";
  }

  const chartData = [
    { name: "Appearance", score: a, max: 2, fill: "#3b82f6" },
    { name: "Pulse", score: p, max: 2, fill: "#ef4444" },
    { name: "Grimace", score: g, max: 2, fill: "#f59e0b" },
    { name: "Activity", score: ac, max: 2, fill: "#22c55e" },
    { name: "Respiration", score: r, max: 2, fill: "#8b5cf6" },
  ];

  const breakdown = [
    { category: "Appearance (Skin Color)", score: a, description: a === 0 ? "Blue or pale all over" : a === 1 ? "Body pink, extremities blue" : "Completely pink / Normal coloration" },
    { category: "Pulse (Heart Rate)", score: p, description: p === 0 ? "Absent (No pulse)" : p === 1 ? "Slow (Less than 100 bpm)" : "Normal (Greater than 100 bpm)" },
    { category: "Grimace (Reflex Irritability)", score: g, description: g === 0 ? "No response to stimulation" : g === 1 ? "Grimace / Weak cry when stimulated" : "Vigorous cry, sneeze, or cough" },
    { category: "Activity (Muscle Tone)", score: ac, description: ac === 0 ? "Limp / Flaccid" : ac === 1 ? "Some flexion of arms and legs" : "Active motion / Well flexed" },
    { category: "Respiration (Breathing Effort)", score: r, description: r === 0 ? "Absent (Not breathing)" : r === 1 ? "Slow, irregular, or gasping" : "Good, strong, lusty cry" },
  ];

  const summaryStats = [
    { label: "Normal Range", value: "7 to 10" },
    { label: "Score Category", value: category },
    { label: "Gestational Age", value: `${Math.max(20, Number(inputs.gestationalAge) || 40)} weeks` },
    { label: "Total Score", value: `${totalScore} / 10` },
  ];

  return {
    totalScore,
    status,
    category,
    statusColor,
    recommendation,
    chartData,
    breakdown,
    summaryStats,
  };
}

const selCls = "w-full p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none";

export default function ApgarScoreCalculator() {
  const [inputs, setInputs] = useState<ApgarInputs>(DEFAULTS);
  const [result, setResult] = useState<ApgarResult>(calculateApgar(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCalculate = () => {
    setResult(calculateApgar(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateApgar(DEFAULTS));
  };

  useEffect(() => {
    setResult(calculateApgar(inputs));
  }, []);

  const updateInput = (field: keyof ApgarInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const faqs = [
    { question: "What does APGAR stand for?", answer: "APGAR is both an acronym and the surname of its inventor, Dr. Virginia Apgar. The five criteria evaluated are Appearance (skin color), Pulse (heart rate), Grimace (reflex irritability), Activity (muscle tone), and Respiration (breathing effort)." },
    { question: "When is the APGAR score recorded?", answer: "The assessment is performed exactly twice on every newborn: at 1 minute after birth, and again at 5 minutes after birth. If the score at 5 minutes is less than 7, the assessment is repeated every 5 minutes for up to 20 minutes to track the effectiveness of resuscitation efforts." },
    { question: "Is a perfect score of 10 common?", answer: "No. A perfect 10 is actually quite rare. Almost all newborns lose 1 point for Appearance because their hands and feet remain slightly blue (acrocyanosis) for a short period after birth while their circulatory system fully activates. A score of 8 or 9 is considered an excellent result." },
    { question: "Does a low 1-minute score mean my baby will have brain damage?", answer: "Not necessarily. The 1-minute score simply tells the doctor how well the baby tolerated the physical stress of the birthing process. Many babies have a low 1-minute score due to a brief drop in oxygen during delivery but rebound quickly to a normal score by the 5-minute mark following basic stimulation and oxygen." },
    { question: "Why is the 5-minute score more important?", answer: "The 5-minute score indicates how well the baby is adapting to life outside the womb independently. A persistently low score at 5, 10, and 15 minutes is a clinical red flag that correlates more strongly with an increased risk of long-term neurological complications." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "APGAR Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">APGAR Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-5 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>Appearance (Skin Color)</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.appearance} pts</span>
                  </label>
                  <select value={inputs.appearance} onChange={e => updateInput("appearance", Number(e.target.value))} className={selCls}>
                    <option value={0}>0 - Blue or pale all over</option>
                    <option value={1}>1 - Body pink, extremities blue</option>
                    <option value={2}>2 - Completely pink</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>Pulse (Heart Rate)</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.pulse} pts</span>
                  </label>
                  <select value={inputs.pulse} onChange={e => updateInput("pulse", Number(e.target.value))} className={selCls}>
                    <option value={0}>0 - Absent (No pulse)</option>
                    <option value={1}>1 - Slow (Less than 100 bpm)</option>
                    <option value={2}>2 - Normal (Greater than 100 bpm)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>Grimace (Reflex Irritability)</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.grimace} pts</span>
                  </label>
                  <select value={inputs.grimace} onChange={e => updateInput("grimace", Number(e.target.value))} className={selCls}>
                    <option value={0}>0 - No response to stimulation</option>
                    <option value={1}>1 - Grimace / Weak cry when stimulated</option>
                    <option value={2}>2 - Vigorous cry, sneeze, or cough</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold mb-1.5 flex justify-between">
                    <span>Activity (Muscle Tone)</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.activity} pts</span>
                  </label>
                  <select value={inputs.activity} onChange={e => updateInput("activity", Number(e.target.value))} className={selCls}>
                    <option value={0}>0 - Limp / Flaccid</option>
                    <option value={1}>1 - Some flexion of arms and legs</option>
                    <option value={2}>2 - Active motion / Well flexed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Respiration (Breathing Effort)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.respiration} pts</span>
                </label>
                <select value={inputs.respiration} onChange={e => updateInput("respiration", Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Absent (Not breathing)</option>
                  <option value={1}>1 - Slow, irregular, or gasping</option>
                  <option value={2}>2 - Good, strong, lusty cry</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2 focus:outline-none">
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <label className="text-sm font-bold mb-1.5 flex justify-between">
                      <span>Gestational Age (weeks)</span>
                      <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{inputs.gestationalAge} wks</span>
                    </label>
                    <input type="number" value={inputs.gestationalAge} onChange={e => updateInput("gestationalAge", Number(e.target.value))} className={selCls} />
                    <p className="text-xs text-muted-foreground mt-1">Used to interpret score for preterm infants. Typical term is 37–42 weeks.</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-1.5 flex justify-between">
                      <span>Baby&apos;s Name</span>
                    </label>
                    <input type="text" value={inputs.babyName} onChange={e => updateInput("babyName", e.target.value)} placeholder="Optional" className={selCls} />
                    <p className="text-xs text-muted-foreground mt-1">Not used in calculation. Displayed for personalization.</p>
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
                <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>APGAR Score</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.totalScore}</div>
                        <div className="text-2xl font-bold text-muted-foreground">/ 10</div>
                      </div>
                    </div>
                    <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                      {result.totalScore >= 7 ? <ShieldCheck className="w-8 h-8" style={{ color: result.statusColor }} /> : <AlertTriangle className="w-8 h-8" style={{ color: result.statusColor }} />}
                    </div>
                  </div>
                  <div className="text-base font-bold mt-2" style={{ color: result.statusColor }}>
                    {result.status}
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
                    <h3 className="text-base font-bold">Score Breakdown by Category</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Each category is scored 0–2. The maximum possible APGAR score is 10.</p>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis domain={[0, 2]} tick={{ fontSize: 11, fill: '#64748b' }} ticks={[0, 1, 2]} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value: number) => [`${value} / 2`, 'Score']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
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
                        <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Category</th>
                        <th className="p-3 text-center text-xs font-bold uppercase text-muted-foreground tracking-wider">Score</th>
                        <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.breakdown.map((item, idx) => (
                        <tr key={idx}>
                          <td className="text-[14px] py-3 px-3 font-medium">{item.category}</td>
                          <td className="text-[14px] py-3 px-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {item.score}
                            </span>
                          </td>
                          <td className="text-[14px] py-3 px-3 text-right text-muted-foreground">{item.description}</td>
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
            <h2 className="text-2xl font-bold mb-3">The History of the APGAR Score</h2>
            <p>Prior to the 1950s, the medical community had no standardized way to evaluate the health of a newborn immediately after birth. Because babies were often born pale and unresponsive due to the heavy anesthetics given to mothers at the time, doctors frequently assumed the babies were stillborn or beyond saving, leading to tragic, preventable infant mortality.</p>
            <p>In 1952, Dr. Virginia Apgar, an anesthesiologist, invented a rapid 5-point scoring system to definitively force delivery room staff to assess the baby's vital signs and intervene immediately if necessary. Today, the APGAR score is used in every hospital worldwide and has saved millions of infant lives.</p>

            <h2 className="text-2xl font-bold mb-3">The 1-Minute vs. 5-Minute Score</h2>
            <p>The APGAR test is strictly performed twice. The 1-minute score is essentially a report card on the birthing process itself. It tells the doctor how much the physical stress of labor affected the baby. A low score at 1 minute is common and usually resolves quickly with basic stimulation and clearing of the airways.</p>
            <p>The 5-minute score is significantly more important. It evaluates the baby's ability to transition to life outside the womb and function independently. If the 5-minute score remains below 7, doctors will aggressively intervene with oxygen or chest compressions, and will continue to reassess the baby every 5 minutes until the score improves.</p>

            <h2 className="text-2xl font-bold mb-3">Why is 'Pulse' Scored Differently?</h2>
            <p>You may notice that a newborn heart rate of 90 beats per minute scores a '1', which seems abnormal compared to adults. In adults, a normal resting heart rate is between 60 and 100 bpm. However, newborns have incredibly fast metabolisms and require massive amounts of oxygen. A healthy newborn heart rate should be between 110 and 160 beats per minute. If a newborn's heart rate drops below 100 bpm, it is a sign of clinical bradycardia, usually caused by oxygen deprivation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apgar-score-calculator" />
          <PopularCalculators exclude="/calculator/apgar-score-calculator" />
        </div>
      </div>
    </>
  );
}
