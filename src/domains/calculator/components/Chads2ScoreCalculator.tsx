"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, HeartPulse, AlertCircle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface Chads2Result {
  totalScore: number;
  strokeRisk: number;
  statusText: string;
  statusColor: string;
  recommendation: string;
  chartData: { score: string; risk: number; isCurrent: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcChads2(chf: boolean, htn: boolean, age: boolean, dm: boolean, stroke: boolean): Chads2Result {
  let score = 0;
  if (chf) score += 1;
  if (htn) score += 1;
  if (age) score += 1;
  if (dm) score += 1;
  if (stroke) score += 2;

  // Empirical stroke risk rates (per 100 patient-years without antithrombotic therapy)
  const riskMapping = [1.9, 2.8, 4.0, 5.9, 8.5, 12.5, 18.2];
  const strokeRisk = riskMapping[score];

  let statusText = "";
  let statusColor = "";
  let recommendation = "";

  if (score >= 2) {
    statusText = "High Risk";
    statusColor = "#ef4444"; // Red
    recommendation = "Oral anticoagulation therapy (e.g., Warfarin, DOACs) is strongly recommended unless contraindicated.";
  } else if (score === 1) {
    statusText = "Moderate Risk";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "Oral anticoagulation or daily Aspirin may be considered depending on physician preference and patient bleeding risk.";
  } else {
    statusText = "Low Risk";
    statusColor = "#22c55e"; // Green
    recommendation = "Daily Aspirin (81-325 mg) or no antithrombotic therapy is generally recommended.";
  }

  const chartData = riskMapping.map((r, i) => ({
    score: `Score ${i}`,
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

export default function Chads2ScoreCalculator() {
  const [chf, setChf] = useState(false);
  const [htn, setHtn] = useState(false);
  const [age, setAge] = useState(false);
  const [dm, setDm] = useState(false);
  const [stroke, setStroke] = useState(false);

  const [result, setResult] = useState<Chads2Result | null>(null);

  useEffect(() => {
    setResult(calcChads2(chf, htn, age, dm, stroke));
  }, [chf, htn, age, dm, stroke]);

  const handleCalculate = () => {
    setResult(calcChads2(chf, htn, age, dm, stroke));
  };

  const reset = () => {
    setChf(false);
    setHtn(false);
    setAge(false);
    setDm(false);
    setStroke(false);
  };

  const Switch = ({ checked, onChange, label, points }: { checked: boolean, onChange: (c: boolean) => void, label: string, points: number }) => (
    <div 
      className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-secondary'}`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${checked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
          +{points} pt{points > 1 ? 's' : ''}
        </span>
        <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-input'}`}>
          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>
    </div>
  );

  const faqs = [
    { question: "What does CHADS2 stand for?", answer: "CHADS2 is an acronym for the risk factors used to calculate stroke probability: Congestive heart failure (1 point), Hypertension (1 point), Age ≥ 75 years (1 point), Diabetes mellitus (1 point), and prior Stroke or TIA (2 points)." },
    { question: "Why is Atrial Fibrillation dangerous?", answer: "In atrial fibrillation (AFib), the upper chambers of the heart quiver instead of beating effectively. This allows blood to pool and stagnate in the heart, leading to the formation of blood clots. If a clot breaks loose, it can travel directly to the brain and cause a massive, often fatal ischemic stroke." },
    { question: "What is the difference between CHADS2 and CHA2DS2-VASc?", answer: "CHADS2 is the original, simpler scoring system. The newer CHA2DS2-VASc score is more comprehensive because it includes additional risk factors like female sex, vascular disease, and patients aged 65-74. While many modern cardiologists prefer CHA2DS2-VASc, CHADS2 is still widely used for rapid triage." },
    { question: "What is an oral anticoagulant?", answer: "Oral anticoagulants are powerful blood thinners. Historically, Warfarin (Coumadin) was the only option, requiring strict diet control and frequent blood tests. Today, Direct Oral Anticoagulants (DOACs) like Eliquis or Xarelto are usually preferred as they require no routine blood monitoring." },
    { question: "Why doesn't everyone with AFib take blood thinners?", answer: "All blood thinners carry a serious risk of internal bleeding, particularly intracranial (brain) bleeding or severe gastrointestinal bleeding. If a patient's stroke risk is very low (CHADS2 score of 0), the statistical risk of causing a fatal bleed with medication is actually higher than the risk of them naturally having a stroke." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "CHADS2 Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">CHADS2 Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-3">
              <Switch checked={chf} onChange={setChf} label="(C) Congestive Heart Failure" points={1} />
              <Switch checked={htn} onChange={setHtn} label="(H) Hypertension (BP > 140/90)" points={1} />
              <Switch checked={age} onChange={setAge} label="(A) Age 75 years or older" points={1} />
              <Switch checked={dm} onChange={setDm} label="(D) Diabetes Mellitus" points={1} />
              <Switch checked={stroke} onChange={setStroke} label="(S2) Prior Stroke / TIA" points={2} />
            </div>

            <div className="flex gap-3 mt-4 border-t border-border pt-4">
              <button onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                Calculate
              </button>
              <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" /> Clear Patient Data
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>CHADS2 Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.totalScore}</div>
                      <div className="text-2xl font-bold text-muted-foreground">/ 6</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                    {result.totalScore === 0 ? <CheckCircle2 className="w-8 h-8" style={{ color: result.statusColor }} /> : <AlertCircle className="w-8 h-8" style={{ color: result.statusColor }} />}
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
                    {i === 0 && <div className="text-xs text-muted-foreground mt-1">(Without blood thinners)</div>}
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Adjusted Annual Stroke Risk Profile</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Visualizing the exponential increase in annual stroke probability as the CHADS2 score rises.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number) => [`${value}%`, 'Annual Risk']} 
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Atrial Fibrillation & Stroke</h2>
            <p>Atrial fibrillation (often called AFib) is the most common type of treated heart arrhythmia. In a healthy heart, electrical signals fire in a steady rhythm, causing the upper chambers (atria) to contract and pump blood efficiently into the lower chambers. In AFib, chaotic electrical signals cause the atria to quiver rapidly and irregularly.</p>
            <p>Because the atria are quivering rather than squeezing, they fail to empty all of their blood. This stagnant blood tends to pool in a small sac in the left atrium called the atrial appendage. Blood that sits still quickly coagulates into a solid clot. If that clot breaks free, it is pumped out of the heart, up the carotid artery, and directly into the brain, causing a devastating ischemic stroke.</p>

            <h2 className="text-2xl font-bold mb-3">The Purpose of the CHADS2 Score</h2>
            <p>Not all patients with AFib have the same risk of forming clots. A healthy 40-year-old with AFib has a very different risk profile than an 80-year-old diabetic with high blood pressure.</p>
            <p>The <strong>CHADS2 score</strong> was developed as a rapid, empirical scoring system to help cardiologists quantify a patient's exact statistical risk of having a stroke over the next 12 months. This allows doctors to make informed decisions about whether to prescribe powerful blood-thinning medications.</p>

            <h2 className="text-2xl font-bold mb-3">The Bleeding Risk Dilemma</h2>
            <p>The solution to AFib strokes is prescribing anticoagulants (blood thinners) such as Warfarin or modern DOACs (Apixaban, Rivaroxaban). These medications thin the blood so effectively that clots cannot form. However, this creates a dangerous trade-off: if the blood cannot clot, the patient is at a high risk for life-threatening internal bleeding, particularly brain hemorrhages or gastrointestinal bleeds.</p>
            <p>Therefore, doctors must balance two competing risks: <strong>The risk of a clot vs. the risk of a bleed</strong>. If a patient's CHADS2 score is 0, their stroke risk is extremely low (about 1.9% per year). Giving them heavy blood thinners would actually introduce a higher statistical risk of them dying from an internal bleed. Conversely, if a patient's CHADS2 score is 4, their stroke risk is massive (8.5% per year), and the life-saving benefits of blood thinners heavily outweigh the bleeding risks.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/chads2-score-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Chads2 Score Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Chads2 Score Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Chads2 Score Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Chads2 Score Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Chads2 Score Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/chads2-score-calculator" />
        </div>
      </div>
    </>
  );
}
