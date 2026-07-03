"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Droplet, AlertTriangle, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HasBledResult {
  totalScore: number;
  bleedRisk: string;
  statusText: string;
  statusColor: string;
  recommendation: string;
  chartData: { score: string; risk: number; isCurrent: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcHasBled(
  htn: boolean,
  renal: boolean,
  liver: boolean,
  stroke: boolean,
  bleeding: boolean,
  labile: boolean,
  elderly: boolean,
  drugs: boolean,
  alcohol: boolean
): HasBledResult {
  let score = 0;
  if (htn) score += 1;
  if (renal) score += 1;
  if (liver) score += 1;
  if (stroke) score += 1;
  if (bleeding) score += 1;
  if (labile) score += 1;
  if (elderly) score += 1;
  if (drugs) score += 1;
  if (alcohol) score += 1;

  // Empirical major bleeding risk rates (per 100 patient-years)
  const riskMapping = [1.13, 1.02, 1.88, 3.74, 8.70, 12.50];
  const bleedRiskNum = score <= 5 ? riskMapping[score] : 12.50; // Anything above 5 is critically high, treated empirically as highest known
  const bleedRiskStr = score > 5 ? "> 12.5%" : `${bleedRiskNum.toFixed(2)}%`;

  let statusText = "";
  let statusColor = "";
  let recommendation = "";

  if (score >= 3) {
    statusText = "High Risk";
    statusColor = "#ef4444"; // Red
    recommendation = "High risk for major bleeding. This does not necessarily mean anticoagulants should be withheld, but indicates that modifiable risk factors (e.g., controlling blood pressure, stopping NSAIDs/alcohol) must be addressed immediately.";
  } else if (score === 2) {
    statusText = "Moderate Risk";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "Moderate risk. Ensure regular follow-ups and monitor for signs of occult bleeding.";
  } else {
    statusText = "Low Risk";
    statusColor = "#22c55e"; // Green
    recommendation = "Low risk for major bleeding. Anticoagulation therapy can generally be prescribed with standard monitoring.";
  }

  const chartData = [0, 1, 2, 3, 4, 5].map((s) => ({
    score: s === 5 ? "≥5" : `${s}`,
    risk: riskMapping[s],
    isCurrent: score >= 5 ? s === 5 : s === score
  }));

  const summaryStats = [
    { label: "Annual Major Bleed Risk", value: bleedRiskStr },
    { label: "Clinical Category", value: statusText }
  ];

  return {
    totalScore: score,
    bleedRisk: bleedRiskStr,
    statusText,
    statusColor,
    recommendation,
    chartData,
    summaryStats
  };
}

export default function HasBledScoreCalculator() {
  const [htn, setHtn] = useState(false);
  const [renal, setRenal] = useState(false);
  const [liver, setLiver] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [bleeding, setBleeding] = useState(false);
  const [labile, setLabile] = useState(false);
  const [elderly, setElderly] = useState(false);
  const [drugs, setDrugs] = useState(false);
  const [alcohol, setAlcohol] = useState(false);

  const [result, setResult] = useState<HasBledResult | null>(null);

  useEffect(() => {
    setResult(calcHasBled(htn, renal, liver, stroke, bleeding, labile, elderly, drugs, alcohol));
  }, [htn, renal, liver, stroke, bleeding, labile, elderly, drugs, alcohol]);

  const reset = () => {
    setHtn(false);
    setRenal(false);
    setLiver(false);
    setStroke(false);
    setBleeding(false);
    setLabile(false);
    setElderly(false);
    setDrugs(false);
    setAlcohol(false);
  };

  const Switch = ({ checked, onChange, label, subtext = "" }: { checked: boolean, onChange: (c: boolean) => void, label: string, subtext?: string }) => (
    <div 
      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-secondary'}`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex flex-col pr-4">
        <span className="text-sm font-semibold text-foreground leading-tight">{label}</span>
        {subtext && <span className="text-xs text-muted-foreground mt-0.5">{subtext}</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs font-bold px-2 py-1 rounded ${checked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
          +1 pt
        </span>
        <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-input'}`}>
          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>
    </div>
  );

  const faqs = [
    { question: "What does HAS-BLED stand for?", answer: "It is an acronym for the major risk factors of internal bleeding: Hypertension, Abnormal renal/liver function, Stroke, Bleeding history, Labile INRs, Elderly (age > 65), and Drugs/Alcohol." },
    { question: "How is this calculator used by doctors?", answer: "When a patient has atrial fibrillation, doctors use the CHA2DS2-VASc score to determine if the patient needs blood thinners to prevent a stroke. They then use the HAS-BLED score to determine if giving the patient blood thinners is too dangerous due to bleeding risks. It is a balancing act." },
    { question: "If my score is High (≥3), does that mean I shouldn't take blood thinners?", answer: "No. Current clinical guidelines explicitly state that a high HAS-BLED score is NOT a reason to withhold blood thinners if the stroke risk is also high. Instead, it is a checklist for the doctor to fix 'modifiable' risk factors. For example, if a patient scores a 3 because of high blood pressure, taking NSAIDs (like Ibuprofen), and drinking alcohol, the doctor will instruct them to stop drinking, stop the NSAIDs, and prescribe blood pressure medication to lower their HAS-BLED score back to 0 before starting blood thinners." },
    { question: "What are 'Labile INRs'?", answer: "INR is a blood test that measures how quickly your blood clots. Patients taking the older blood thinner Warfarin must have their blood tested frequently. If their INR levels constantly bounce up and down wildly ('labile'), it makes it incredibly difficult to safely dose the medication, drastically increasing the risk of a spontaneous hemorrhage." },
    { question: "Why do NSAID drugs increase the score?", answer: "Nonsteroidal anti-inflammatory drugs (NSAIDs) like Ibuprofen, Naproxen, and Aspirin inherently reduce the ability of blood platelets to stick together. If you take these daily while also taking prescription blood thinners (like Eliquis or Xarelto), you are 'double thinning' your blood, leading to a severe risk of gastrointestinal bleeding." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "HAS-BLED Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">HAS-BLED Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-2">
              <Switch checked={htn} onChange={setHtn} label="(H) Hypertension" subtext="Uncontrolled, systolic > 160 mmHg" />
              <Switch checked={renal} onChange={setRenal} label="(A) Abnormal Renal Function" subtext="Dialysis, transplant, or Cr > 2.26 mg/dL" />
              <Switch checked={liver} onChange={setLiver} label="(A) Abnormal Liver Function" subtext="Cirrhosis or elevated bilirubin/AST/ALT" />
              <Switch checked={stroke} onChange={setStroke} label="(S) Stroke History" subtext="Prior ischemic or hemorrhagic stroke" />
              <Switch checked={bleeding} onChange={setBleeding} label="(B) Bleeding History" subtext="Prior major bleed or predisposition (e.g. anemia)" />
              <Switch checked={labile} onChange={setLabile} label="(L) Labile INRs" subtext="Unstable/high INRs (only applies if on Warfarin)" />
              <Switch checked={elderly} onChange={setElderly} label="(E) Elderly" subtext="Age > 65 years" />
              <Switch checked={drugs} onChange={setDrugs} label="(D) Drugs" subtext="Concomitant antiplatelets or NSAIDs" />
              <Switch checked={alcohol} onChange={setAlcohol} label="(D) Alcohol" subtext="≥ 8 drinks per week" />
            </div>

            <div className="flex gap-3 mt-2 border-t border-border pt-4">
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
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>HAS-BLED Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.totalScore}</div>
                      <div className="text-2xl font-bold text-muted-foreground">/ 9</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                    {result.totalScore >= 3 ? <AlertTriangle className="w-8 h-8" style={{ color: result.statusColor }} /> : <ShieldCheck className="w-8 h-8" style={{ color: result.statusColor }} />}
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
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Annual Major Bleeding Risk Profile</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Visualizing the increase in severe bleeding risk relative to the score.</p>
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
            <h2>The Balancing Act of Cardiology</h2>
            <p>Treating atrial fibrillation is a delicate balancing act. On one hand, a doctor wants to prescribe a powerful blood thinner to ensure the patient does not suffer a catastrophic ischemic stroke. On the other hand, giving a patient a blood thinner dramatically increases their risk of suffering a spontaneous internal hemorrhage (a "major bleed").</p>
            <p>The <strong>HAS-BLED score</strong> was developed as the perfect counterbalance to the stroke risk calculators. Before writing a prescription for a blood thinner like Eliquis, Xarelto, or Warfarin, a doctor calculates the HAS-BLED score to quantify exactly how dangerous that prescription will be.</p>

            <h2>Modifiable vs. Non-Modifiable Risks</h2>
            <p>One of the most important aspects of the HAS-BLED score is that it highlights "modifiable" risk factors. A non-modifiable risk factor is something the patient cannot change, such as their age (&gt;65 years) or the fact that they have a history of having a stroke. The doctor simply has to accept these risks.</p>
            <p>However, several points on the HAS-BLED score are entirely modifiable. If a patient has a highly dangerous score of 4, the doctor might notice that 3 of those points come from high blood pressure, taking daily Advil for knee pain, and drinking two glasses of wine every night. By prescribing blood pressure medication, switching the Advil to Tylenol (which doesn't thin the blood), and advising the patient to stop drinking, the doctor can instantly lower the score from a dangerous 4 to a safe 1.</p>

            <h2>What is a "Major Bleed"?</h2>
            <p>In medical terms, a major bleed is not a nosebleed or a cut on the arm from shaving. The HAS-BLED score calculates the risk of life-threatening events. A major bleed is defined clinically as:</p>
            <ul>
              <li>Intracranial hemorrhage (bleeding inside the skull or brain)</li>
              <li>Bleeding that causes a drop in hemoglobin of at least 2 g/dL</li>
              <li>Bleeding that is so severe it requires a transfusion of at least two units of blood</li>
            </ul>
            <p>Because these events are often fatal, a high HAS-BLED score (≥3) requires intense clinical caution and frequent monitoring, though it is rarely used as an absolute excuse to withhold life-saving stroke prevention medication if the stroke risk is equally severe.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/has-bled-score-calculator" />
          <PopularCalculators exclude="/calculator/has-bled-score-calculator" />
        </div>
      </div>
    </>
  );
}
