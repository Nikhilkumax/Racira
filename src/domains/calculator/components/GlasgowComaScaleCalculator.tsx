"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Brain, AlertOctagon, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface GcsResult {
  totalScore: number;
  statusText: string;
  statusColor: string;
  recommendation: string;
  chartData: { subject: string; score: number; max: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcGcs(eye: number, verbal: number, motor: number): GcsResult {
  const totalScore = eye + verbal + motor;

  let statusText = "";
  let statusColor = "";
  let recommendation = "";

  if (totalScore >= 13) {
    statusText = "Mild Brain Injury";
    statusColor = "#22c55e"; // Green
    recommendation = "Patient is largely conscious and alert. May have suffered a mild concussion. Monitor for any sudden neurological deterioration.";
  } else if (totalScore >= 9) {
    statusText = "Moderate Brain Injury";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "Patient has a depressed level of consciousness. Requires close medical observation and typically a CT scan to check for intracranial bleeding.";
  } else {
    statusText = "Severe Brain Injury (Coma)";
    statusColor = "#ef4444"; // Red
    recommendation = "Medical Emergency. GCS of 8 or less typically requires immediate intubation to protect the airway and mechanical ventilation.";
  }

  // To make the chart intuitive, we map the scores visually
  const chartData = [
    { subject: "Eye (E)", score: eye, max: 4, fill: "#3b82f6" },
    { subject: "Verbal (V)", score: verbal, max: 5, fill: "#a855f7" },
    { subject: "Motor (M)", score: motor, max: 6, fill: "#f97316" }
  ];

  const summaryStats = [
    { label: "Target Score", value: "15" },
    { label: "Clinical Status", value: statusText }
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

export default function GlasgowComaScaleCalculator() {
  const [eye, setEye] = useState<number>(4);
  const [verbal, setVerbal] = useState<number>(5);
  const [motor, setMotor] = useState<number>(6);

  const [result, setResult] = useState<GcsResult | null>(null);

  const calculate = () => {
    setResult(calcGcs(eye, verbal, motor));
  };

  useEffect(() => {
    calculate();
  }, []);

  const reset = () => {
    setEye(4);
    setVerbal(5);
    setMotor(6);
  };

  const selCls = "w-full p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none";

  const faqs = [
    { question: "What is the Glasgow Coma Scale (GCS)?", answer: "The Glasgow Coma Scale is a clinical tool used universally by paramedics and doctors to objectively measure a patient's level of consciousness, usually following a traumatic brain injury (like a car crash). It assesses three specific neurological functions: Eye opening, Verbal response, and Motor (physical) response." },
    { question: "Can a patient score a zero?", answer: "No. The lowest possible score on the GCS is a 3 (scoring 1 point in all three categories). A score of 3 indicates deep coma or brain death. There is no such thing as a GCS of 0." },
    { question: "What does 'GCS less than 8, intubate' mean?", answer: "This is a fundamental rule in emergency medicine. If a patient's brain injury is severe enough that their GCS drops to 8 or below, they lose their natural gag and cough reflexes. This means they can easily choke on their own saliva or vomit. Doctors will immediately 'intubate' (insert a breathing tube) to protect their airway and connect them to a ventilator." },
    { question: "How is 'Motor Response' tested in an unconscious patient?", answer: "If the patient cannot obey commands (like 'squeeze my hand'), the doctor will apply a painful stimulus (such as pressing hard on the fingernail bed or rubbing the sternum). The doctor then observes how the patient's body physically reacts to the pain—whether they try to swat the doctor's hand away (localizing pain), pull away (withdrawal), or rigidly lock their arms and legs (abnormal posturing)." },
    { question: "What is Decorticate vs. Decerebrate posturing?", answer: "These are severe neurological responses to pain. Decorticate posturing (Motor score 3) means the patient rigidly bends their arms inward toward their core. Decerebrate posturing (Motor score 2) means they rigidly extend their arms outward. Both indicate massive brain damage, but Decerebrate is clinically worse because it signals damage deep in the brainstem." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Glasgow Coma Scale Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Glasgow Coma Scale Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-5 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Eye Opening (E)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{eye} pts</span>
                </label>
                <select value={eye} onChange={e => setEye(Number(e.target.value))} className={selCls}>
                  <option value={4}>4 - Spontaneous (Opens eyes normally)</option>
                  <option value={3}>3 - To Voice (Opens eyes when spoken to)</option>
                  <option value={2}>2 - To Pain (Opens eyes only to physical pain)</option>
                  <option value={1}>1 - None (Does not open eyes)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Verbal Response (V)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{verbal} pts</span>
                </label>
                <select value={verbal} onChange={e => setVerbal(Number(e.target.value))} className={selCls}>
                  <option value={5}>5 - Oriented (Knows name, location, and date)</option>
                  <option value={4}>4 - Confused (Converses but is disoriented)</option>
                  <option value={3}>3 - Inappropriate Words (Random speech, no conversation)</option>
                  <option value={2}>2 - Incomprehensible Sounds (Moaning, no words)</option>
                  <option value={1}>1 - None (No sounds)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Motor Response (M)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{motor} pts</span>
                </label>
                <select value={motor} onChange={e => setMotor(Number(e.target.value))} className={selCls}>
                  <option value={6}>6 - Obeys Commands (e.g., "Squeeze my fingers")</option>
                  <option value={5}>5 - Localizes to Pain (Moves hand to stop the pain source)</option>
                  <option value={4}>4 - Withdraws from Pain (Pulls away rapidly)</option>
                  <option value={3}>3 - Abnormal Flexion (Decorticate posturing - arms curl inward)</option>
                  <option value={2}>2 - Abnormal Extension (Decerebrate posturing - arms lock straight)</option>
                  <option value={1}>1 - None (No physical movement)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2 border-t border-border pt-4">
              <button onClick={calculate} className="w-full flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                Calculate
              </button>
              <button onClick={reset} title="Reset Score" className="w-11 flex-shrink-0 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total GCS Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">{result.totalScore}</div>
                      <div className="text-2xl font-bold text-muted-foreground">/ 15</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                    {result.totalScore >= 13 ? <Activity className="w-8 h-8" style={{ color: result.statusColor }} /> : <AlertOctagon className="w-8 h-8" style={{ color: result.statusColor }} />}
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
                    <div className="text-sm sm:text-lg font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Neurological Deficit Profile</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Visualizing the patient's neurological function across the three specific categories.</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 11 }} ticks={[0, 1, 2, 3, 4, 5, 6]} />
                    <YAxis type="category" dataKey="subject" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number, name: string, props: any) => [`${value} / ${props.payload.max}`, 'Score']} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={25}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Consciousness</h2>
            <p>Prior to the 1970s, measuring "consciousness" was entirely subjective. One doctor might chart a patient as "drowsy," while a nurse might chart them as "lethargic," leading to massive confusion regarding whether the patient's brain injury was actively worsening. In 1974, researchers at the University of Glasgow published the <strong>Glasgow Coma Scale (GCS)</strong> to solve this problem.</p>
            <p>The GCS removes the subjectivity. By assigning hard mathematical numbers to three distinct physical responses—Eye Opening (1-4), Verbal Response (1-5), and Motor Response (1-6)—medical professionals can instantly communicate the exact neurological status of a patient worldwide. The score is often communicated shorthand, for example: <em>"GCS 9: E2, V3, M4."</em></p>

            <h2 className="text-2xl font-bold mb-3">Why is 'Motor Response' the Most Important?</h2>
            <p>While all three categories are vital, the <strong>Motor Response (M)</strong> is the most critical indicator of brainstem function and long-term prognosis. This is because physical movement relies on the central nervous system firing correctly.</p>
            <p>If a patient can "localize pain" (Score 5) by reaching up and swatting away a doctor's hand when pinched, it proves their brain is still processing spatial awareness and commanding targeted physical defense mechanisms. However, if the patient responds to pain with "abnormal extension" (Score 2, known as Decerebrate posturing), it indicates the brain's upper cortex has essentially shut down, and only the primitive brainstem is misfiring. This is a sign of catastrophic brain damage.</p>

            <h2 className="text-2xl font-bold mb-3">The 'Magic Number' 8</h2>
            <p>In emergency medicine, the phrase <strong>"GCS less than 8, intubate"</strong> is a golden rule. When a person's neurological function degrades to an 8 or below, they are officially considered to be in a coma. At this level of unconsciousness, the brain no longer properly maintains the involuntary reflexes required to keep the airway open (like the gag reflex).</p>
            <p>Without these reflexes, a patient lying on their back can easily choke to death on their own saliva, blood, or vomit. Therefore, paramedics and doctors will immediately administer paralytics and insert an endotracheal tube (intubation) to physically secure the airway and connect the patient to a mechanical ventilator to breathe for them.</p>

            <h2 className="text-2xl font-bold mb-3">Limitations of the Scale</h2>
            <p>While the GCS is universally adopted, it has a few notable flaws. It is impossible to assess the 'Verbal' score of a patient who has a breathing tube inserted, or who is deaf. Similarly, an intoxicated person might score a very low GCS simply because they are drunk, not because they have suffered a traumatic brain hemorrhage. Therefore, the GCS is always used in conjunction with a physical exam and CT scans.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/glasgow-coma-scale-calculator" />
          <PopularCalculators exclude="/calculator/glasgow-coma-scale-calculator" />
        </div>
      </div>
    </>
  );
}
