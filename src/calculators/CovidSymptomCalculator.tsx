"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Stethoscope, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SymptomResult {
  actionLevel: string;
  actionColor: string;
  icon: any;
  recommendation: string;
  chartData: { category: string; count: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

export default function CovidSymptomCalculator() {
  // Emergency Symptoms
  const [breathing, setBreathing] = useState(false);
  const [chestPain, setChestPain] = useState(false);
  const [confusion, setConfusion] = useState(false);
  const [blueSkin, setBlueSkin] = useState(false);
  const [stayAwake, setStayAwake] = useState(false);

  // Common Symptoms
  const [fever, setFever] = useState(false);
  const [cough, setCough] = useState(false);
  const [tasteSmell, setTasteSmell] = useState(false);
  const [fatigue, setFatigue] = useState(false);
  const [muscleAche, setMuscleAche] = useState(false);
  const [soreThroat, setSoreThroat] = useState(false);
  const [congestion, setCongestion] = useState(false);
  const [nausea, setNausea] = useState(false);
  const [diarrhea, setDiarrhea] = useState(false);

  // High Risk Factors
  const [age65, setAge65] = useState(false);
  const [immune, setImmune] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [heartLung, setHeartLung] = useState(false);
  const [pregnant, setPregnant] = useState(false);

  const [result, setResult] = useState<SymptomResult | null>(null);

  const calculate = () => {
    // Categorize Symptoms for Chart
    const emergencyCount = [breathing, chestPain, confusion, blueSkin, stayAwake].filter(Boolean).length;
    
    // Group common symptoms
    const respiratoryCount = [cough, soreThroat, congestion].filter(Boolean).length;
    const systemicCount = [fever, tasteSmell, fatigue, muscleAche].filter(Boolean).length;
    const gastroCount = [nausea, diarrhea].filter(Boolean).length;
    const riskCount = [age65, immune, diabetes, heartLung, pregnant].filter(Boolean).length;

    let actionLevel = "";
    let actionColor = "";
    let icon = CheckCircle;
    let recommendation = "";

    if (emergencyCount > 0) {
      actionLevel = "CRITICAL EMERGENCY";
      actionColor = "#ef4444"; // Red
      icon = AlertTriangle;
      recommendation = "You have reported a critical emergency warning sign (such as trouble breathing or chest pain). You must seek emergency medical care immediately. Call 911 or go to the nearest emergency room. Tell the dispatcher your symptoms.";
    } 
    else if ((respiratoryCount > 0 || systemicCount > 0 || gastroCount > 0) && riskCount > 0) {
      actionLevel = "MODERATE RISK";
      actionColor = "#f97316"; // Orange
      icon = ShieldAlert;
      recommendation = "You have COVID-19 symptoms AND high-risk health factors. Please isolate yourself from others immediately. Call your primary care physician or a telehealth provider to get tested and discuss early treatment options like antivirals.";
    }
    else if (respiratoryCount > 0 || systemicCount > 0 || gastroCount > 0) {
      actionLevel = "MILD SYMPTOMS";
      actionColor = "#eab308"; // Yellow
      icon = ShieldAlert;
      recommendation = "You are experiencing symptoms consistent with COVID-19 or other viral infections. Isolate yourself from others, wear a high-quality mask, and take an at-home rapid test. Rest and stay hydrated. Monitor your symptoms closely.";
    }
    else {
      actionLevel = "NO CURRENT SYMPTOMS";
      actionColor = "#22c55e"; // Green
      icon = CheckCircle;
      recommendation = "You have not reported any active symptoms. Continue to practice standard preventative measures, such as washing hands frequently and staying up-to-date with vaccinations.";
    }

    const chartData = [
      { category: "Emergency", count: emergencyCount, fill: "#ef4444" },
      { category: "Systemic", count: systemicCount, fill: "#f59e0b" },
      { category: "Respiratory", count: respiratoryCount, fill: "#3b82f6" },
      { category: "Gastro.", count: gastroCount, fill: "#8b5cf6" },
    ];

    const totalSymptoms = emergencyCount + respiratoryCount + systemicCount + gastroCount;

    const summaryStats = [
      { label: "Total Symptoms Reported", value: `${totalSymptoms}` },
      { label: "Underlying Risk Factors", value: `${riskCount}` }
    ];

    setResult({ actionLevel, actionColor, icon, recommendation, chartData, summaryStats });
  };

  const reset = () => {
    setBreathing(false); setChestPain(false); setConfusion(false); setBlueSkin(false); setStayAwake(false);
    setFever(false); setCough(false); setTasteSmell(false); setFatigue(false); setMuscleAche(false); setSoreThroat(false); setCongestion(false); setNausea(false); setDiarrhea(false);
    setAge65(false); setImmune(false); setDiabetes(false); setHeartLung(false); setPregnant(false);
    setResult(null);
  };

  const faqs = [
    { question: "Is this calculator a medical diagnosis?", answer: "No. This tool provides a symptom triage assessment based on public health guidelines from the CDC and WHO. It cannot diagnose COVID-19, the flu, or any other illness. A formal diagnosis requires a laboratory or rapid antigen test." },
    { question: "When should I go to the Emergency Room?", answer: "You should seek emergency medical care immediately if you experience trouble breathing, persistent pain or pressure in the chest, new confusion, inability to wake or stay awake, or pale, gray, or blue-colored skin, lips, or nail beds." },
    { question: "What is the difference between systemic and respiratory symptoms?", answer: "Systemic symptoms affect the entire body, such as fever, fatigue, and muscle aches. Respiratory symptoms are localized to the breathing tract, such as coughing, sore throat, and congestion. COVID-19 often causes both simultaneously." },
    { question: "Why do 'High-Risk Factors' change the recommendation?", answer: "Individuals over the age of 65, or those with underlying conditions like diabetes, heart disease, or compromised immune systems, are at a significantly higher statistical risk of developing severe complications. If these individuals develop symptoms, they need to contact a doctor earlier to potentially receive antiviral medications." },
    { question: "I have symptoms but my rapid test was negative. What now?", answer: "At-home rapid antigen tests are highly specific but can lack sensitivity in the very early stages of infection. If you have symptoms but test negative, you should remain isolated and test again 48 hours later, or request a highly sensitive PCR test from your doctor." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "COVID-19 Symptom Checker" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">COVID-19 Symptom Triage Checker</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-5 border border-border bg-card shadow-sm">
            
            {/* Emergency Warnings */}
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Emergency Warning Signs</p>
              <div className="space-y-2.5">
                {[
                  { state: breathing, set: setBreathing, label: "Trouble breathing or severe shortness of breath" },
                  { state: chestPain, set: setChestPain, label: "Persistent pain or pressure in the chest" },
                  { state: confusion, set: setConfusion, label: "New confusion or severe dizziness" },
                  { state: stayAwake, set: setStayAwake, label: "Inability to wake up or stay awake" },
                  { state: blueSkin, set: setBlueSkin, label: "Pale, gray, or blue skin, lips, or nail beds" }
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-md bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors border border-red-100 dark:border-red-900/50">
                    <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-600/20" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Common Symptoms */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Common Symptoms</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { state: fever, set: setFever, label: "Fever or Chills" },
                  { state: cough, set: setCough, label: "Cough" },
                  { state: tasteSmell, set: setTasteSmell, label: "New loss of taste/smell" },
                  { state: fatigue, set: setFatigue, label: "Severe Fatigue" },
                  { state: muscleAche, set: setMuscleAche, label: "Muscle or body aches" },
                  { state: soreThroat, set: setSoreThroat, label: "Sore throat" },
                  { state: congestion, set: setCongestion, label: "Congestion / Runny nose" },
                  { state: nausea, set: setNausea, label: "Nausea or vomiting" },
                  { state: diarrhea, set: setDiarrhea, label: "Diarrhea" }
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                    <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* High Risk Factors */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Underlying Risk Factors</p>
              <div className="space-y-2">
                {[
                  { state: age65, set: setAge65, label: "Age 65 or older" },
                  { state: immune, set: setImmune, label: "Immunocompromised (Cancer, organ transplant, HIV)" },
                  { state: heartLung, set: setHeartLung, label: "Heart disease, Asthma, or COPD" },
                  { state: diabetes, set: setDiabetes, label: "Diabetes or Chronic Kidney Disease" },
                  { state: pregnant, set: setPregnant, label: "Currently Pregnant" }
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                    <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <Stethoscope className="h-5 w-5" /> Run Triage Assessment
              </button>
              <button onClick={reset} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result ? (<>
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.actionColor}10`, borderColor: result.actionColor }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-black uppercase tracking-widest" style={{ color: result.actionColor }}>
                    {result.actionLevel}
                  </div>
                  <result.icon className="w-6 h-6" style={{ color: result.actionColor }} />
                </div>
                <div className="text-base font-medium text-foreground leading-relaxed">
                  {result.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-2xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              {result.chartData.some(d => d.count > 0) && (
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-bold mb-4">Symptom Load Analysis</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 'dataMax + 1']} hide />
                      <YAxis type="category" dataKey="category" width={90} tick={{ fontSize: 11, fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} symptoms`, "Count"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
                        {result.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/50 text-muted-foreground p-8 text-center">
                <Stethoscope className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium mb-2">Awaiting Assessment</p>
                <p className="text-sm max-w-[280px]">Select your symptoms and risk factors on the left, then click "Run Triage Assessment" to view clinical recommendations.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding COVID-19 Triage</h2>
            <p>COVID-19 affects different people in drastically different ways. While some individuals remain entirely asymptomatic, others can develop life-threatening respiratory failure within days. Understanding when to isolate at home and when to seek emergency medical care is the cornerstone of managing the virus safely.</p>
            <p>This <strong>COVID-19 Symptom Triage Checker</strong> is designed using the official symptom categorizations established by the Centers for Disease Control and Prevention (CDC) and the World Health Organization (WHO).</p>

            <h2>The Difference Between "Symptoms" and "Emergencies"</h2>
            <p>It is perfectly normal for the human body to feel terrible when fighting off a virus. A fever of 101°F, intense muscle aches, and severe fatigue are signs that your immune system is actively fighting the infection. While highly uncomfortable, these are considered <strong>standard symptoms</strong> that can typically be managed at home with rest, hydration, and over-the-counter fever reducers.</p>
            <p>However, <strong>Emergency Warning Signs</strong> indicate that the virus is actively damaging critical organs (the lungs, heart, or brain). If you experience persistent pain in the chest, confusion, or lips turning blue (cyanosis), it indicates that your blood oxygen levels have dropped to a dangerous level. You must bypass urgent care and immediately call 911 or visit an emergency room.</p>

            <h2>The Importance of High-Risk Factors</h2>
            <p>Age and underlying health conditions are the primary drivers of severe COVID-19 complications. If you are over the age of 65, or have conditions such as diabetes, chronic kidney disease, or an immunocompromised state (such as undergoing chemotherapy), your immune system cannot fight the virus as effectively.</p>
            <p>If you have high-risk factors and develop <em>any</em> symptoms, public health guidelines strongly recommend contacting your doctor immediately, even if your symptoms feel mild. Doctors can prescribe highly effective antiviral medications (such as Paxlovid), but these drugs must be started within the first 5 days of symptom onset to be effective.</p>

            <h2>Isolation Guidelines</h2>
            <p>If you have symptoms of a respiratory virus (COVID-19, Flu, or RSV), you should isolate yourself from others to prevent spreading the disease. You can generally return to normal activities when, for at least 24 hours, both of the following are true:</p>
            <ol>
              <li>Your symptoms are getting consistently better overall.</li>
              <li>You have not had a fever (and are not using fever-reducing medication).</li>
            </ol>
            <p>Even after resuming normal activities, the CDC recommends taking added precautions for the next 5 days, such as wearing a well-fitting mask and keeping physical distance from others.</p>

            <div className="p-4 bg-muted/30 border border-border rounded-lg mt-6 text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This tool is for informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </div>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/covid-symptom-calculator" />
          <PopularCalculators exclude="/calculator/covid-symptom-calculator" />
        </div>
      </div>
    </>
  );
}
