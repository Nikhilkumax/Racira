"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Stethoscope, AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

interface ApgarResult {
  totalScore: number;
  statusText: string;
  statusColor: string;
  recommendation: string;
  chartData: { subject: string; score: number; fullMark: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcApgar(appearance: number, pulse: number, grimace: number, activity: number, respiration: number): ApgarResult {
  const totalScore = appearance + pulse + grimace + activity + respiration;

  let statusText = "";
  let statusColor = "";
  let recommendation = "";

  if (totalScore >= 7) {
    statusText = "Reassuring (Normal)";
    statusColor = "#22c55e"; // Green
    recommendation = "The newborn is transitioning well to life outside the womb. Routine post-delivery care (drying, warming, and clearing the airway if necessary) is sufficient.";
  } else if (totalScore >= 4) {
    statusText = "Moderately Abnormal";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "The newborn is experiencing difficulty transitioning. Medical intervention is required, which usually involves aggressive stimulation, clearing the airway, and administering supplemental oxygen.";
  } else {
    statusText = "Critically Low";
    statusColor = "#ef4444"; // Red
    recommendation = "The newborn is in severe distress and requires immediate advanced neonatal resuscitation, which may involve chest compressions and intubation.";
  }

  const chartData = [
    { subject: "Appearance", score: appearance, fullMark: 2 },
    { subject: "Pulse", score: pulse, fullMark: 2 },
    { subject: "Grimace", score: grimace, fullMark: 2 },
    { subject: "Activity", score: activity, fullMark: 2 },
    { subject: "Respiration", score: respiration, fullMark: 2 }
  ];

  const summaryStats = [
    { label: "Target Score", value: "7 to 10" },
    { label: "Clinical Level", value: statusText }
  ];

  return {
    totalScore,
    statusText,
    statusColor,
    recommendation,
    chartData,
    summaryStats
  };
}

export default function ApgarScoreCalculator() {
  // Default to a perfectly healthy baby (all 2s)
  const [appearance, setAppearance] = useState<number>(2);
  const [pulse, setPulse] = useState<number>(2);
  const [grimace, setGrimace] = useState<number>(2);
  const [activity, setActivity] = useState<number>(2);
  const [respiration, setRespiration] = useState<number>(2);

  const [result, setResult] = useState<ApgarResult | null>(null);

  useEffect(() => {
    setResult(calcApgar(appearance, pulse, grimace, activity, respiration));
  }, [appearance, pulse, grimace, activity, respiration]);

  const reset = () => {
    setAppearance(2);
    setPulse(2);
    setGrimace(2);
    setActivity(2);
    setRespiration(2);
  };

  const selCls = "w-full p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none";

  const faqs = [
    { question: "What does APGAR stand for?", answer: "APGAR is both an acronym and the surname of its inventor, Dr. Virginia Apgar. The five criteria evaluated are Appearance (skin color), Pulse (heart rate), Grimace (reflex irritability), Activity (muscle tone), and Respiration (breathing effort)." },
    { question: "When is the APGAR score recorded?", answer: "The assessment is performed exactly twice on every newborn: at 1 minute after birth, and again at 5 minutes after birth. If the score at 5 minutes is less than 7, the assessment is repeated every 5 minutes for up to 20 minutes to track the effectiveness of resuscitation efforts." },
    { question: "Is a perfect score of 10 common?", answer: "No. A perfect 10 is actually quite rare. Almost all newborns lose 1 point for 'Appearance' because their hands and feet remain slightly blue (acrocyanosis) for a short period after birth while their circulatory system fully activates. A score of 8 or 9 is considered an excellent result." },
    { question: "Does a low 1-minute score mean my baby will have brain damage?", answer: "Not necessarily. The 1-minute score simply tells the doctor how well the baby tolerated the physical stress of the birthing process. Many babies have a low 1-minute score (due to a brief drop in oxygen during delivery) but rebound quickly to a normal score by the 5-minute mark following basic stimulation and oxygen." },
    { question: "Why is the 5-minute score more important?", answer: "The 5-minute score indicates how well the baby is adapting to life outside the womb independently. A persistently low score at 5, 10, and 15 minutes is a clinical red flag that correlates more strongly with an increased risk of long-term neurological complications." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "APGAR Score Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">APGAR Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Appearance (Skin Color)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{appearance} pts</span>
                </label>
                <select value={appearance} onChange={e => setAppearance(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Blue or pale all over</option>
                  <option value={1}>1 - Body pink, extremities blue (Acrocyanosis)</option>
                  <option value={2}>2 - Completely pink / Normal coloration</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Pulse (Heart Rate)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{pulse} pts</span>
                </label>
                <select value={pulse} onChange={e => setPulse(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Absent (No pulse)</option>
                  <option value={1}>1 - Slow (Less than 100 beats per minute)</option>
                  <option value={2}>2 - Normal (Greater than 100 beats per minute)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Grimace (Reflex Irritability)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{grimace} pts</span>
                </label>
                <select value={grimace} onChange={e => setGrimace(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - No response to stimulation</option>
                  <option value={1}>1 - Grimace / Weak cry when stimulated</option>
                  <option value={2}>2 - Vigorous cry, sneeze, or cough</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Activity (Muscle Tone)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{activity} pts</span>
                </label>
                <select value={activity} onChange={e => setActivity(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Limp / Flaccid</option>
                  <option value={1}>1 - Some flexion of arms and legs</option>
                  <option value={2}>2 - Active motion / Well flexed</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Respiration (Breathing Effort)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{respiration} pts</span>
                </label>
                <select value={respiration} onChange={e => setRespiration(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Absent (Not breathing)</option>
                  <option value={1}>1 - Slow, irregular, or gasping</option>
                  <option value={2}>2 - Good, strong, lusty cry</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2 border-t border-border pt-4">
              <button onClick={reset} className="w-full flex items-center justify-center gap-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset Score
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>Total APGAR Score</div>
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
                  {result.statusText}
                </div>
                <div className="text-sm font-medium text-foreground mt-2 leading-relaxed">
                  {result.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-lg font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Clinical Parameter Balance</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Visualizing the 5 factors. A perfect hexagon indicates a score of 10.</p>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.chartData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 2]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="score" stroke={result.statusColor} fill={result.statusColor} fillOpacity={0.4} />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} / 2`, 'Score']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The History of the APGAR Score</h2>
            <p>Prior to the 1950s, the medical community had no standardized way to evaluate the health of a newborn immediately after birth. Because babies were often born pale and unresponsive due to the heavy anesthetics given to mothers at the time, doctors frequently assumed the babies were stillborn or beyond saving, leading to tragic, preventable infant mortality.</p>
            <p>In 1952, Dr. Virginia Apgar, an anesthesiologist, invented a rapid 5-point scoring system to definitively force delivery room staff to assess the baby's vital signs and intervene immediately if necessary. Today, the APGAR score is used in every hospital worldwide and has saved millions of infant lives.</p>

            <h2>The 1-Minute vs. 5-Minute Score</h2>
            <p>The APGAR test is strictly performed twice. The <strong>1-minute score</strong> is essentially a report card on the birthing process itself. It tells the doctor how much the physical stress of labor (and any medications given to the mother) affected the baby. A low score at 1 minute is common and usually resolves quickly with basic stimulation and clearing of the airways.</p>
            <p>The <strong>5-minute score</strong> is significantly more important. It evaluates the baby's ability to transition to life outside the womb and function independently. If the 5-minute score remains below 7, doctors will aggressively intervene with oxygen or chest compressions, and will continue to reassess the baby every 5 minutes until the score improves.</p>

            <h2>Why is 'Pulse' Scored Differently?</h2>
            <p>You may notice that a newborn heart rate of 90 beats per minute scores a '1', which seems abnormal compared to adults. In adults, a normal resting heart rate is between 60 and 100 bpm. However, newborns have incredibly fast metabolisms and require massive amounts of oxygen. A healthy newborn heart rate should be between <strong>110 and 160 beats per minute</strong>. If a newborn's heart rate drops below 100 bpm, it is a sign of clinical bradycardia, usually caused by oxygen deprivation (hypoxia).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apgar-score-calculator" />
          <PopularCalculators exclude="/calculator/apgar-score-calculator" />
        </div>
      </div>
    </>
  );
}
