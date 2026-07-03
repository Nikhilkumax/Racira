"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, HeartPulse, ShieldAlert, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ChadsVascResult {
  totalScore: number;
  strokeRisk: number;
  statusText: string;
  statusColor: string;
  recommendation: string;
  chartData: { score: string; risk: number; isCurrent: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcChadsVasc(chf: boolean, htn: boolean, ageCat: string, dm: boolean, stroke: boolean, vasc: boolean, female: boolean): ChadsVascResult {
  let score = 0;
  if (chf) score += 1;
  if (htn) score += 1;
  if (dm) score += 1;
  if (stroke) score += 2;
  if (vasc) score += 1;
  if (female) score += 1;

  if (ageCat === "75") score += 2;
  else if (ageCat === "65-74") score += 1;

  // Empirical stroke risk rates (per 100 patient-years) based on Swedish Registry (Friberg et al.)
  const riskMapping = [0.2, 0.6, 2.2, 3.2, 4.8, 7.2, 9.7, 11.2, 10.8, 12.2];
  const strokeRisk = riskMapping[score];

  let statusText = "";
  let statusColor = "";
  let recommendation = "";

  // Clinical guidelines often differentiate by sex. A score of 1 in males or 2 in females is a "moderate" threshold.
  const thresholdOffset = female ? 1 : 0;

  if (score >= (2 + thresholdOffset)) {
    statusText = "High Risk";
    statusColor = "#ef4444"; // Red
    recommendation = "Oral anticoagulation therapy (e.g., DOACs or Warfarin) is strongly recommended to prevent ischemic stroke.";
  } else if (score === (1 + thresholdOffset)) {
    statusText = "Moderate Risk";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "Oral anticoagulation may be considered based on a discussion between the patient and physician regarding bleeding risks.";
  } else {
    statusText = "Low Risk";
    statusColor = "#22c55e"; // Green
    recommendation = "No antithrombotic therapy is recommended. The risk of major bleeding from medication outweighs the stroke risk.";
  }

  const chartData = riskMapping.map((r, i) => ({
    score: `${i}`,
    risk: r,
    isCurrent: i === score
  }));

  const summaryStats = [
    { label: "Annual Stroke Risk", value: `${strokeRisk.toFixed(1)}%` },
    { label: "Clinical Category", value: statusText }
  ];

  return {
    totalScore: score,
    strokeRisk,
    statusText,
    statusColor,
    recommendation,
    chartData,
    summaryStats
  };
}

export default function Cha2ds2VascScoreCalculator() {
  const [chf, setChf] = useState(false);
  const [htn, setHtn] = useState(false);
  const [ageCat, setAgeCat] = useState("under65");
  const [dm, setDm] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [vasc, setVasc] = useState(false);
  const [female, setFemale] = useState(false);

  const [result, setResult] = useState<ChadsVascResult | null>(null);

  useEffect(() => {
    setResult(calcChadsVasc(chf, htn, ageCat, dm, stroke, vasc, female));
  }, [chf, htn, ageCat, dm, stroke, vasc, female]);

  const reset = () => {
    setChf(false);
    setHtn(false);
    setAgeCat("under65");
    setDm(false);
    setStroke(false);
    setVasc(false);
    setFemale(false);
  };

  const Switch = ({ checked, onChange, label, points }: { checked: boolean, onChange: (c: boolean) => void, label: string, points: number }) => (
    <div 
      className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-secondary'}`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex flex-col pr-4">
        <span className="text-sm font-semibold text-foreground leading-tight">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs font-bold px-2 py-1 rounded ${checked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
          +{points} pt{points > 1 ? 's' : ''}
        </span>
        <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-input'}`}>
          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>
    </div>
  );

  const selCls = "w-full p-2.5 rounded-md border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none";

  const faqs = [
    { question: "What is the CHA2DS2-VASc score used for?", answer: "The CHA2DS2-VASc score is a clinical risk assessment tool used by cardiologists to estimate the risk of stroke in patients with non-valvular atrial fibrillation (AFib). It helps determine whether a patient should be prescribed blood thinners (anticoagulants)." },
    { question: "How does it differ from the older CHADS2 score?", answer: "CHA2DS2-VASc is a more comprehensive update to the original CHADS2 score. It adds additional, heavily-weighted risk factors that were previously ignored, specifically: Vascular disease history, Female sex, and expanding the Age criteria to grant 1 point for ages 65-74 and 2 points for ages 75+." },
    { question: "Why does being female add a point?", answer: "Large clinical registries have consistently shown that women with atrial fibrillation have a statistically higher baseline risk of stroke compared to men with the same health conditions. However, current guidelines note that female sex alone (a score of 1 in women) does not usually warrant blood thinners unless other risk factors are present." },
    { question: "What qualifies as 'Vascular Disease'?", answer: "In this scoring system, vascular disease typically refers to a prior heart attack (myocardial infarction), peripheral artery disease (PAD), or the presence of complex aortic plaque documented on an imaging scan." },
    { question: "What is a DOAC?", answer: "DOAC stands for Direct Oral Anticoagulant (such as Apixaban/Eliquis or Rivaroxaban/Xarelto). These are modern blood thinners that are generally preferred over Warfarin because they do not require routine blood monitoring and have a lower risk of causing catastrophic brain bleeds." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "CHA2DS2-VASc Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">CHA2DS2-VASc Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-3">
              <Switch checked={chf} onChange={setChf} label="(C) Congestive Heart Failure / LV Dysfunction" points={1} />
              <Switch checked={htn} onChange={setHtn} label="(H) Hypertension (BP > 140/90)" points={1} />
              
              <div className="p-3 border border-border rounded-lg bg-background">
                <label className="text-sm font-semibold text-foreground block mb-2">(A2/A) Patient Age</label>
                <select value={ageCat} onChange={(e) => setAgeCat(e.target.value)} className={selCls}>
                  <option value="under65">Under 65 years (0 pts)</option>
                  <option value="65-74">65 to 74 years (+1 pt)</option>
                  <option value="75">75 years or older (+2 pts)</option>
                </select>
              </div>

              <Switch checked={dm} onChange={setDm} label="(D) Diabetes Mellitus" points={1} />
              <Switch checked={stroke} onChange={setStroke} label="(S2) Prior Stroke, TIA, or Thromboembolism" points={2} />
              <Switch checked={vasc} onChange={setVasc} label="(V) Vascular Disease (Prior MI, PAD, Aortic Plaque)" points={1} />
              <Switch checked={female} onChange={setFemale} label="(Sc) Sex Category: Female" points={1} />
            </div>

            <div className="flex gap-3 mt-4 border-t border-border pt-4">
              <button onClick={reset} className="w-full flex items-center justify-center gap-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" /> Clear Patient Data
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>CHA2DS2-VASc Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.totalScore}</div>
                      <div className="text-2xl font-bold text-muted-foreground">/ 9</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                    {result.totalScore === 0 || (result.totalScore === 1 && female) ? <CheckCircle className="w-8 h-8" style={{ color: result.statusColor }} /> : <ShieldAlert className="w-8 h-8" style={{ color: result.statusColor }} />}
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
                    <div className="text-xl sm:text-2xl font-black text-foreground">{s.value}</div>
                    {i === 0 && <div className="text-xs text-muted-foreground mt-1">(Without anticoagulation)</div>}
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Annual Stroke Risk Profile (Swedish Cohort)</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Visualizing the increase in annual stroke probability relative to the patient's score.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number, name: string, props: any) => [`${value}%`, `Score: ${props.payload.score}`]} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="risk" radius={[4, 4, 0, 0]} maxBarSize={45}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? result.statusColor : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Evolution of Stroke Risk Assessment</h2>
            <p>Atrial fibrillation (AFib) is a condition where the upper chambers of the heart quiver erratically, causing blood to pool and form clots. If these clots travel to the brain, they cause massive strokes. To prevent this, doctors prescribe powerful blood thinners.</p>
            <p>For years, cardiologists used the CHADS2 score to decide who needed these medications. However, CHADS2 was fundamentally flawed because it failed to account for several major risk factors, leaving thousands of seemingly "low risk" patients unprotected. The <strong>CHA2DS2-VASc score</strong> was introduced in 2010 to fix these blind spots by incorporating age nuances, vascular disease, and sex differences.</p>

            <h2>Why is Female Sex a Risk Factor?</h2>
            <p>One of the most notable additions to the CHA2DS2-VASc score is the "Sc" (Sex category). Massive clinical data registries, including the Swedish Atrial Fibrillation cohort, proved that women inherently suffer from a higher rate of AFib-related strokes than men with the exact same health profiles.</p>
            <p>However, modern clinical guidelines come with a critical caveat: <strong>Female sex alone does not warrant blood thinners</strong>. If a patient is a healthy 50-year-old woman with no other medical issues, her score is 1. The guidelines consider this functionally equivalent to a score of 0 in a man, meaning she should not be prescribed dangerous anticoagulants simply because she is female.</p>

            <h2>The Danger of Over-Prescribing</h2>
            <p>If blood thinners prevent strokes, why not give them to every patient with AFib? Because anticoagulants (like Warfarin, Eliquis, or Xarelto) carry a massive, intrinsic risk of causing internal hemorrhage. If a patient accidentally bumps their head, a minor concussion can turn into a fatal brain bleed because their blood cannot clot.</p>
            <p>Therefore, a doctor must ensure the patient's baseline stroke risk is mathematically higher than the risk of causing a fatal bleed with the medication. If a patient scores a 0 (or a 1 if female), their annual stroke risk is incredibly low (0.2%), and the risks of the medication heavily outweigh the benefits.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cha2ds2-vasc-score-calculator" />
          <PopularCalculators exclude="/calculator/cha2ds2-vasc-score-calculator" />
        </div>
      </div>
    </>
  );
}
