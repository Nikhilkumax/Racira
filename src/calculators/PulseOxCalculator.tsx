"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Wind, AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceArea, ReferenceLine } from "recharts";

interface PulseOxResult {
  actionLevel: string;
  actionColor: string;
  icon: any;
  recommendation: string;
  clinicalStatus: string;
  chartData: { name: string; value: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcPulseOx(spo2: number, copd: boolean, symptoms: boolean): PulseOxResult {
  let actionLevel = "";
  let actionColor = "";
  let icon = ShieldCheck;
  let recommendation = "";
  let clinicalStatus = "";

  if (copd) {
    // COPD Specific Guidelines (Target is generally 88-92%)
    if (spo2 < 88) {
      clinicalStatus = "Severe Hypoxemia";
      actionLevel = "MEDICAL EMERGENCY";
      actionColor = "#ef4444"; // Red
      icon = AlertTriangle;
      recommendation = "Your oxygen level has fallen dangerously below the COPD target range. You must seek emergency medical care immediately. Call 911 or go to the nearest emergency room.";
    } else if (spo2 >= 88 && spo2 <= 92) {
      clinicalStatus = "Target Normoxemia (COPD)";
      actionLevel = "NORMAL RANGE";
      actionColor = "#22c55e"; // Green
      icon = ShieldCheck;
      recommendation = "Your oxygen saturation is perfectly within the 88-92% target range prescribed for patients with chronic lung disease.";
    } else {
      clinicalStatus = "Hyperoxemia Risk";
      actionLevel = "CONSULT DOCTOR";
      actionColor = "#f59e0b"; // Yellow
      icon = AlertTriangle;
      recommendation = "Your oxygen level is above 92%. If you are on supplemental oxygen, high SpO2 can dangerously suppress your natural drive to breathe. Contact your pulmonologist immediately to adjust your oxygen flow.";
    }
  } else {
    // Standard Guidelines for Healthy Adults
    if (spo2 >= 95) {
      clinicalStatus = "Normoxemia";
      actionLevel = "NORMAL";
      actionColor = "#22c55e"; // Green
      icon = ShieldCheck;
      recommendation = "Your oxygen saturation is perfectly normal. No immediate action is required.";
      if (symptoms) {
        actionLevel = "MONITOR";
        actionColor = "#3b82f6"; // Blue
        recommendation = "Your oxygen is normal, but because you are experiencing severe symptoms (like chest pain or shortness of breath), you should still seek medical evaluation immediately.";
      }
    } else if (spo2 >= 91 && spo2 <= 94) {
      clinicalStatus = "Mild Hypoxemia";
      actionLevel = "CONSULT DOCTOR";
      actionColor = "#f59e0b"; // Yellow
      icon = AlertTriangle;
      recommendation = "Your oxygen is slightly low. You should contact your primary care doctor or visit an urgent care clinic for evaluation.";
      if (symptoms) {
        actionLevel = "MEDICAL EMERGENCY";
        actionColor = "#ef4444"; // Red
        recommendation = "Low oxygen combined with severe symptoms is a medical emergency. Call 911 or visit an emergency room immediately.";
      }
    } else {
      clinicalStatus = "Severe Hypoxemia";
      actionLevel = "CRITICAL EMERGENCY";
      actionColor = "#ef4444"; // Red
      icon = AlertTriangle;
      recommendation = "Your oxygen level is critically low. This can cause organ damage within minutes. Call 911 or go to the nearest emergency room immediately.";
    }
  }

  const chartData = [
    { name: "Your SpO2", value: spo2 }
  ];

  const summaryStats = [
    { label: "Target Range", value: copd ? "88% - 92%" : "95% - 100%" },
    { label: "Clinical Status", value: clinicalStatus }
  ];

  return {
    actionLevel,
    actionColor,
    icon,
    recommendation,
    clinicalStatus,
    chartData,
    summaryStats
  };
}

export default function PulseOxCalculator() {
  const [spo2, setSpo2] = useState("98");
  const [copd, setCopd] = useState(false);
  const [symptoms, setSymptoms] = useState(false);

  const [result, setResult] = useState<PulseOxResult | null>(null);

  const calculate = () => {
    const s = parseInt(spo2);
    if (s >= 50 && s <= 100) {
      setResult(calcPulseOx(s, copd, symptoms));
    } else {
      alert("Please enter a valid SpO2 percentage between 50 and 100.");
    }
  };

  useEffect(() => { setResult(calcPulseOx(98, false, false)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is SpO2?", answer: "SpO2 stands for peripheral capillary oxygen saturation. It is an estimate of the amount of oxygen your blood is carrying. Your body tightly regulates oxygen levels because your organs (especially your brain) begin to suffer irreversible damage if deprived of oxygen for even a few minutes." },
    { question: "Can a pulse oximeter be wrong?", answer: "Yes. Home pulse oximeters shine light through your skin to measure the color of your blood. The reading can be falsely lowered by cold hands, poor circulation, dark nail polish, artificial nails, or excessive movement. If you get a low reading, try warming your hands and testing a different finger while sitting completely still." },
    { question: "Why is the target lower for COPD patients?", answer: "In healthy adults, the brain monitors carbon dioxide (CO2) levels to trigger the urge to breathe. In patients with severe COPD, CO2 is chronically trapped in the lungs, so the brain switches to monitoring oxygen levels instead. If a COPD patient's oxygen is pushed too high (above 92%) by supplemental oxygen, their brain 'thinks' they have enough oxygen and literally stops telling the lungs to breathe, which is fatal." },
    { question: "What should I do if my oxygen is dropping?", answer: "If your oxygen drops below 90% (or 88% if you have COPD), it is a medical emergency. Do not attempt to treat it at home. Call 911 immediately. Hypoxia (low oxygen) can cause sudden confusion or loss of consciousness." },
    { question: "Which finger is best for testing?", answer: "Clinical studies show that the middle finger or the thumb on your dominant hand usually yields the most accurate readings. Ensure the finger is fully inserted so the LED light shines directly through the nail bed." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pulse Oximetry Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Pulse Oximetry (SpO2) Triage Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div>
              <label className="text-sm font-bold mb-1.5 block">SpO2 Reading</label>
              <div className={inp}><input type="number" min="50" max="100" value={spo2} onChange={e => setSpo2(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground font-bold">%</span></div>
              <p className="text-xs text-muted-foreground mt-1.5">Enter the percentage shown on your pulse oximeter.</p>
            </div>

            <div className="border-t border-border pt-4 mt-1 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={copd} onChange={e => setCopd(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary/20" />
                <div>
                  <span className="text-sm font-bold block">I have severe COPD</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">Check this ONLY if a pulmonologist has explicitly told you to target a lower oxygen saturation.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={symptoms} onChange={e => setSymptoms(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary/20" />
                <div>
                  <span className="text-sm font-bold block">I am experiencing severe symptoms</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">Chest pain, trouble breathing, or confusion.</span>
                </div>
              </label>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <Wind className="h-5 w-5" /> Analyze Reading
              </button>
              <button onClick={() => { setSpo2("98"); setCopd(false); setSymptoms(false); setResult(calcPulseOx(98, false, false)); }} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.actionColor}10`, borderColor: result.actionColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.actionColor }}>Triage Action</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{result.actionLevel}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border">
                    <result.icon className="w-7 h-7" style={{ color: result.actionColor }} />
                  </div>
                </div>
                <div className="text-sm font-medium text-foreground mt-2 leading-relaxed">
                  {result.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Oxygen Saturation Scale</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">The highlighted green area represents your personalized target range.</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 20 }}>
                    <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 11 }} ticks={[70, 80, 88, 92, 95, 100]} />
                    <YAxis type="category" dataKey="name" hide />
                    
                    {/* Background Ranges dynamically set based on COPD status */}
                    {copd ? (
                      <>
                        <ReferenceArea x1={70} x2={88} fill="#fee2e2" fillOpacity={1} />
                        <ReferenceArea x1={88} x2={92} fill="#dcfce7" fillOpacity={1} />
                        <ReferenceArea x1={92} x2={100} fill="#fef3c7" fillOpacity={1} />
                        <ReferenceLine x={88} stroke="#22c55e" strokeDasharray="3 3" />
                        <ReferenceLine x={92} stroke="#22c55e" strokeDasharray="3 3" />
                      </>
                    ) : (
                      <>
                        <ReferenceArea x1={70} x2={90} fill="#fee2e2" fillOpacity={1} />
                        <ReferenceArea x1={90} x2={94} fill="#fef3c7" fillOpacity={1} />
                        <ReferenceArea x1={95} x2={100} fill="#dcfce7" fillOpacity={1} />
                        <ReferenceLine x={95} stroke="#22c55e" strokeDasharray="3 3" />
                      </>
                    )}

                    <Tooltip cursor={false} formatter={(v: number) => [`${v}%`, "Your SpO2"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" barSize={20} fill={result.actionColor} radius={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Pulse Oximetry (SpO2)</h2>
            <p>A pulse oximeter is a small, non-invasive medical device that clips onto your finger to measure the oxygen saturation level of your blood (SpO2). It works by shining specialized wavelengths of light through your skin and nail bed, analyzing how much of that light is absorbed by the hemoglobin in your blood. Fully oxygenated blood absorbs light differently than oxygen-depleted blood.</p>
            <p>This <strong>Pulse Ox Triage Calculator</strong> provides immediate clinical context for your reading, distinguishing between normal healthy ranges and the specialized ranges required for patients with severe chronic lung disease.</p>

            <h2>Standard Guidelines for Healthy Adults</h2>
            <p>For individuals without chronic respiratory diseases, the body is incredibly efficient at extracting oxygen from the air, even at high altitudes.</p>
            <ul>
              <li><strong>Normal (95% to 100%):</strong> Your lungs are functioning perfectly. The vast majority of healthy adults sit consistently between 97% and 99%.</li>
              <li><strong>Mild Hypoxemia (91% to 94%):</strong> Your blood oxygen is mildly depleted. This is common during respiratory infections (like pneumonia, COVID-19, or the flu) or during asthma attacks. It warrants immediate medical evaluation, but is not necessarily life-threatening if you are breathing comfortably.</li>
              <li><strong>Severe Hypoxemia (90% or lower):</strong> This is a severe medical emergency. At this saturation level, critical organs like the heart and brain are being starved of oxygen, which can cause permanent tissue death within minutes. Immediate emergency room care is required.</li>
            </ul>

            <h2>The COPD Paradox: Why 100% is Dangerous</h2>
            <p>If you have healthy lungs, your brain monitors the buildup of carbon dioxide (CO2) in your blood. When CO2 gets too high, your brain forces you to take a breath. This is your primary respiratory drive.</p>
            <p>However, patients with severe COPD (Chronic Obstructive Pulmonary Disease) cannot fully exhale, meaning CO2 is chronically trapped in their blood. Over time, their brains become numb to high CO2 levels. To survive, their brain switches to a backup system: <em>Hypoxic Drive</em>. The brain begins monitoring oxygen levels instead, only forcing a breath when oxygen drops.</p>
            <p>Because of this biological switch, the target oxygen range for severe COPD patients is intentionally lowered to <strong>88% to 92%</strong>. If you place a COPD patient on high-flow supplemental oxygen and force their SpO2 up to 98%, their brain assumes they have plenty of oxygen and simply stops sending the signal to breathe. The patient will quietly suffocate from CO2 poisoning while their pulse ox reads 98%.</p>

            <div className="p-4 bg-muted/30 border border-border rounded-lg mt-6 text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This tool is for educational triage purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician regarding oxygen therapy protocols.
            </div>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pulse-ox-calculator" />
          <PopularCalculators exclude="/calculator/pulse-ox-calculator" />
        </div>
      </div>
    </>
  );
}
