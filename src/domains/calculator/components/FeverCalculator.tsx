"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Thermometer, AlertTriangle, ShieldCheck, PhoneCall } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceArea, ReferenceLine } from "recharts";

interface FeverResult {
  actionLevel: string;
  actionColor: string;
  icon: any;
  recommendation: string;
  tempF: number;
  tempC: number;
  chartData: { name: string; value: number }[];
  summaryStats: { label: string; value: string }[];
  feverThresholdF: number;
  emergencyThresholdF: number;
}

function calcFever(ageGroup: string, method: string, tempRaw: number, unit: string): FeverResult {
  // Convert to Fahrenheit for internal logic standardization
  let tempF = unit === "C" ? (tempRaw * 9/5) + 32 : tempRaw;

  // Temperature conversions based on method to equivalent Oral temperature
  // Rectal is ~0.5°F to 1°F higher than Oral
  // Axillary (Armpit) is ~0.5°F to 1°F lower than Oral
  // We don't change the absolute number displayed to the user, but we use clinical thresholds.
  
  let actionLevel = "";
  let actionColor = "";
  let icon = ShieldCheck;
  let recommendation = "";
  let feverThresholdF = 100.4; // Standard clinical definition of fever
  let emergencyThresholdF = 104.0;

  if (ageGroup === "0-3m") {
    // Newborns: ANY temp over 100.4 is a medical emergency due to lack of blood-brain barrier
    emergencyThresholdF = 100.4;
    
    if (tempF >= 100.4) {
      actionLevel = "CRITICAL EMERGENCY";
      actionColor = "#ef4444"; // Red
      icon = AlertTriangle;
      recommendation = "Infants under 3 months with a temperature of 100.4°F (38.0°C) or higher require IMMEDIATE medical attention. Do not give fever medication. Go to the nearest Emergency Room for a full sepsis workup.";
    } else {
      actionLevel = "NORMAL RANGE";
      actionColor = "#22c55e"; // Green
      icon = ShieldCheck;
      recommendation = "This temperature is considered normal. Monitor the infant for other signs of illness such as extreme lethargy, refusal to feed, or unusual crying.";
    }
  } else if (ageGroup === "3-6m") {
    feverThresholdF = 100.4;
    emergencyThresholdF = 102.0;

    if (tempF >= 102.0) {
      actionLevel = "CALL DOCTOR NOW";
      actionColor = "#ef4444"; // Red
      icon = PhoneCall;
      recommendation = "For infants 3 to 6 months old, a temperature of 102.0°F (38.9°C) or higher requires immediate evaluation by a pediatrician or urgent care clinic.";
    } else if (tempF >= 100.4) {
      actionLevel = "FEVER - MONITOR";
      actionColor = "#f59e0b"; // Yellow
      icon = AlertTriangle;
      recommendation = "This is a low-grade fever. Call your pediatrician during office hours for advice. You may use infant acetaminophen if approved by your doctor.";
    } else {
      actionLevel = "NORMAL RANGE";
      actionColor = "#22c55e";
      icon = ShieldCheck;
      recommendation = "This temperature is considered normal.";
    }
  } else if (ageGroup === "6-24m") {
    feverThresholdF = 100.4;
    emergencyThresholdF = 103.0;

    if (tempF >= 103.0) {
      actionLevel = "SEVERE FEVER - CALL DOCTOR";
      actionColor = "#ef4444";
      icon = AlertTriangle;
      recommendation = "A fever of 103°F or higher in toddlers warrants a call to your pediatrician. Watch closely for signs of dehydration or febrile seizures.";
    } else if (tempF >= 100.4) {
      actionLevel = "MILD FEVER";
      actionColor = "#f59e0b";
      icon = AlertTriangle;
      recommendation = "This is a standard fever. Ensure the child stays hydrated. You may treat with pediatric acetaminophen or ibuprofen if the child is uncomfortable. Call a doctor if the fever lasts more than 24 hours.";
    } else {
      actionLevel = "NORMAL RANGE";
      actionColor = "#22c55e";
      icon = ShieldCheck;
      recommendation = "This temperature is considered normal.";
    }
  } else {
    // Older Children & Adults
    feverThresholdF = 100.4;
    emergencyThresholdF = 104.0;

    if (tempF >= 104.0) {
      actionLevel = "SEVERE FEVER - SEEK CARE";
      actionColor = "#ef4444";
      icon = AlertTriangle;
      recommendation = "A fever of 104°F (40.0°C) or higher is severe and can be dangerous. Seek medical attention. If accompanied by a stiff neck, severe headache, or confusion, call 911 immediately.";
    } else if (tempF >= 100.4) {
      actionLevel = "FEVER";
      actionColor = "#f59e0b";
      icon = AlertTriangle;
      recommendation = "You have a fever. Rest and stay hydrated. You can take over-the-counter fever reducers like acetaminophen or ibuprofen to improve comfort. Seek care if it lasts more than 3 days.";
    } else if (tempF >= 99.0 && tempF < 100.4) {
      actionLevel = "ELEVATED";
      actionColor = "#3b82f6"; // Blue
      icon = ShieldCheck;
      recommendation = "Your temperature is slightly elevated but does not meet the clinical definition of a true fever. This can be caused by exercise, hot weather, or the onset of a mild illness.";
    } else {
      actionLevel = "NORMAL RANGE";
      actionColor = "#22c55e";
      icon = ShieldCheck;
      recommendation = "Your temperature is perfectly normal.";
    }
  }

  const chartData = [
    { name: "Current Temp", value: Number(tempF.toFixed(1)) }
  ];

  const tempC = (tempF - 32) * 5/9;

  const summaryStats = [
    { label: "Equivalent (°C)", value: `${tempC.toFixed(1)} °C` },
    { label: "Equivalent (°F)", value: `${tempF.toFixed(1)} °F` }
  ];

  return {
    actionLevel,
    actionColor,
    icon,
    recommendation,
    tempF: Number(tempF.toFixed(1)),
    tempC: Number(tempC.toFixed(1)),
    chartData,
    summaryStats,
    feverThresholdF,
    emergencyThresholdF
  };
}

export default function FeverCalculator() {
  const [ageGroup, setAgeGroup] = useState("adult");
  const [method, setMethod] = useState("oral");
  const [unit, setUnit] = useState("F");
  const [tempRaw, setTempRaw] = useState("98.6");

  const [result, setResult] = useState<FeverResult | null>(null);

  const calculate = () => {
    const t = parseFloat(tempRaw);
    if (t > 0) {
      setResult(calcFever(ageGroup, method, t, unit));
    }
  };

  useEffect(() => { setResult(calcFever("adult", "oral", 98.6, "F")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why is a fever in a newborn (0-3 months) so dangerous?", answer: "Infants under 3 months old do not have a fully developed blood-brain barrier. If they contract a bacterial infection, it can rapidly enter their spinal fluid and brain, causing severe meningitis or full-body sepsis within hours. Because they cannot localize infections, ANY fever of 100.4°F (38.0°C) or higher requires an immediate, comprehensive ER workup." },
    { question: "When is a temperature officially considered a 'fever'?", answer: "Clinically, a true fever is strictly defined as an oral or rectal temperature of 100.4°F (38.0°C) or higher. Temperatures between 99.0°F and 100.3°F are considered 'elevated' but are not true fevers, and can simply be caused by wearing heavy clothing, exercising, or sitting in a hot room." },
    { question: "Is a higher fever always more dangerous?", answer: "In children over 6 months and adults, the height of the fever does not necessarily indicate the severity of the illness. A simple, harmless virus can cause a 103°F fever, while a dangerous bacterial infection might only cause a 101°F fever. Doctors are much more concerned with the patient's behavior (extreme lethargy, confusion, dehydration) than the exact number on the thermometer." },
    { question: "Should I always treat a fever with medication?", answer: "No. A fever is not an illness; it is your immune system's primary weapon against an illness. Viruses and bacteria replicate poorly at higher temperatures. If you or your child has a mild fever (101°F) but is otherwise playing, drinking fluids, and resting comfortably, you do not need to artificially lower the temperature with medication." },
    { question: "Which thermometer method is the most accurate?", answer: "Rectal thermometers are the gold standard for clinical accuracy, which is why they are mandatory for infants under 6 months. For older children and adults, oral thermometers are highly accurate provided the patient has not eaten or drank anything hot/cold in the last 15 minutes. Axillary (armpit) and forehead scanners are the least accurate and often read 0.5 to 1 degree lower than true core temperature." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Fever Triage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Fever Triage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Age of Patient</label>
              <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="0-3m">Newborn (0 to 3 Months)</option>
                <option value="3-6m">Infant (3 to 6 Months)</option>
                <option value="6-24m">Toddler (6 to 24 Months)</option>
                <option value="adult">Child (2+ years) or Adult</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Measurement Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="oral">Oral (Mouth)</option>
                <option value="rectal">Rectal (Most accurate for infants)</option>
                <option value="tympanic">Tympanic (Ear)</option>
                <option value="temporal">Temporal (Forehead Scan)</option>
                <option value="axillary">Axillary (Armpit)</option>
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold block">Temperature</label>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                  <button onClick={() => setUnit("F")} className={`px-2 py-0.5 text-xs font-bold rounded ${unit === "F" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>°F</button>
                  <button onClick={() => setUnit("C")} className={`px-2 py-0.5 text-xs font-bold rounded ${unit === "C" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>°C</button>
                </div>
              </div>
              <div className={inp}><input type="number" step="0.1" value={tempRaw} onChange={e => setTempRaw(e.target.value)} className={ci} /></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <Thermometer className="h-5 w-5" /> Calculate
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.actionColor}10`, borderColor: result.actionColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.actionColor }}>Clinical Triage Level</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{result.actionLevel}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border">
                    <result.icon className="w-7 h-7" style={{ color: result.actionColor }} />
                  </div>
                </div>
                <div className="text-base font-medium text-foreground mt-3 leading-relaxed">
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
                  <h3 className="text-base font-bold">Temperature Severity Scale</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Chart thresholds dynamically adjusted based on the patient's age group.</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 20 }}>
                    <XAxis type="number" domain={[96, 106]} tick={{ fontSize: 11 }} ticks={[96, 98.6, result.feverThresholdF, result.emergencyThresholdF, 106]} />
                    <YAxis type="category" dataKey="name" hide />
                    
                    {/* Background Ranges dynamically set based on Age Group */}
                    <ReferenceArea x1={96} x2={result.feverThresholdF} fill="#dcfce7" fillOpacity={1} />
                    <ReferenceArea x1={result.feverThresholdF} x2={result.emergencyThresholdF} fill="#fef3c7" fillOpacity={1} />
                    <ReferenceArea x1={result.emergencyThresholdF} x2={106} fill="#fee2e2" fillOpacity={1} />
                    
                    <ReferenceLine x={result.feverThresholdF} stroke="#f59e0b" strokeDasharray="3 3" />
                    <ReferenceLine x={result.emergencyThresholdF} stroke="#ef4444" strokeDasharray="3 3" />

                    <Tooltip cursor={false} formatter={(v: number) => [`${v} °F`, "Reading"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" barSize={20} fill={result.actionColor} radius={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Medical Reality of Fevers</h2>
            <p>One of the most common reasons for emergency room visits and panicked calls to pediatricians is a fever. However, there is widespread misunderstanding about what a fever actually is. A fever is not a disease; it is a highly evolved, biological defense mechanism. When your immune system detects a viral or bacterial invader, the hypothalamus (the brain's thermostat) intentionally raises your core body temperature. Why? Because most pathogens replicate very poorly in high heat, and your immune cells operate more efficiently at higher temperatures.</p>

            <h2 className="text-2xl font-bold mb-3">When is a Fever Dangerous?</h2>
            <p>For children over the age of 6 months and healthy adults, the height of the fever is rarely a cause for panic. A temperature of 103°F (39.4°C) sounds scary, but the brain has internal fail-safes that prevent the body from raising its own temperature past 106°F. Therefore, a fever caused by an infection will almost never cause brain damage.</p>
            <p>Doctors are much more concerned with the patient's <strong>behavior and appearance</strong>. If a child has a 103°F fever but is sitting up, drinking juice, and watching cartoons, they are likely fine. If a child has a 100.5°F fever but is completely unresponsive, refusing all fluids, and has a stiff neck, that is a medical emergency.</p>

            <h2 className="text-2xl font-bold mb-3">The Exception: The First 90 Days of Life</h2>
            <p>The rules change entirely for newborns (0 to 3 months of age). In this specific age group, <strong>any temperature of 100.4°F (38.0°C) or higher is an absolute medical emergency.</strong></p>
            <p>Newborns do not have fully formed immune systems, and their blood-brain barrier is incomplete. If a newborn catches a seemingly minor bacterial infection (like a UTI), that bacteria can replicate exponentially, breach the blood-brain barrier, and cause meningitis or full-body sepsis in a matter of hours. Because newborns cannot localize or fight off these infections, emergency room doctors must aggressively treat any newborn fever with blood cultures, spinal taps, and broad-spectrum IV antibiotics until the exact cause is identified.</p>

            <h2 className="text-2xl font-bold mb-3">Febrile Seizures in Toddlers</h2>
            <p>Between the ages of 6 months and 5 years, some children may experience a febrile seizure when their temperature spikes rapidly. Witnessing a child convulse and lose consciousness is terrifying for parents. However, neurological studies have definitively proven that simple febrile seizures are benign. They do not cause brain damage, they do not lower intelligence, and they do not mean the child has epilepsy. If a seizure lasts longer than 5 minutes, call 911.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fever-calculator" />
          <PopularCalculators exclude="/calculator/fever-calculator" />
        </div>
      </div>
    </>
  );
}
