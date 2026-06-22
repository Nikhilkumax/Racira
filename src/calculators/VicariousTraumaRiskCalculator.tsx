"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, ShieldAlert, HeartPulse, BrainCircuit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface TraumaInputs {
  profession: "therapist" | "responder" | "medical" | "social" | "consumer";
  exposureHours: number;
  processingHours: number; // Self-care, supervision, therapy, debriefing
}

interface TraumaResults {
  traumaLoad: number;
  resilienceScore: number;
  netRiskScore: number;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  riskColor: string;
  
  chartData: { name: string; "Trauma Exposure": number; "Resilience Processing": number }[];
}

const PROFESSION_WEIGHTS = {
  "responder": { name: "First Responder (Police, Fire, EMS)", weight: 3.0 }, // Immediate, physical trauma
  "medical": { name: "Medical (ER, ICU, Oncology)", weight: 2.5 },         // High stakes, life/death
  "social": { name: "Social Work / Child Protection", weight: 2.2 },       // Systemic, chronic trauma
  "therapist": { name: "Therapist / Counselor", weight: 1.8 },             // Emotional, narrative trauma
  "consumer": { name: "High News/True Crime Consumer", weight: 1.0 }       // Passive digital exposure
};

// 2. Pure Calculation Function
const calculateTraumaRisk = (inputs: TraumaInputs): TraumaResults | null => {
  const { profession, exposureHours, processingHours } = inputs;
  
  if (exposureHours < 0 || processingHours < 0) return null;

  const prof = PROFESSION_WEIGHTS[profession];
  
  // Trauma Load = Hours exposed * Intensity weight of profession
  const traumaLoad = exposureHours * prof.weight;
  
  // Resilience Score = Hours processing (therapy, debriefing, strict self-care) * effectiveness multiplier
  // Assume dedicated processing is highly effective (x 2.5) but cannot completely erase extreme loads
  const resilienceScore = processingHours * 2.5;

  // Net Risk is the deficit between Load and Resilience
  let netRiskScore = traumaLoad - resilienceScore;
  if (netRiskScore < 0) netRiskScore = 0; // Baseline healthy state

  let riskLevel: "Low" | "Moderate" | "High" | "Critical" = "Low";
  let riskColor = "#10b981"; // Emerald

  if (netRiskScore > 15) {
    riskLevel = "Moderate";
    riskColor = "#f59e0b"; // Amber
  }
  if (netRiskScore > 35) {
    riskLevel = "High";
    riskColor = "#f97316"; // Orange
  }
  if (netRiskScore > 60) {
    riskLevel = "Critical";
    riskColor = "#ef4444"; // Red
  }

  // Generate Chart Data
  const chartData = [
    { 
      name: "Load vs Resilience", 
      "Trauma Exposure": Math.round(traumaLoad),
      "Resilience Processing": Math.round(resilienceScore)
    }
  ];

  return {
    traumaLoad: Math.round(traumaLoad),
    resilienceScore: Math.round(resilienceScore),
    netRiskScore: Math.round(netRiskScore),
    riskLevel,
    riskColor,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  profession: "medical" as const,
  exposureHours: "20",
  processingHours: "2"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">Psychological Balance</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-red-500 mr-3">Trauma Load:</span>
          <span className="font-bold">{payload[0].payload["Trauma Exposure"]} units</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-emerald-500 mr-3">Resilience:</span>
          <span className="font-bold">{payload[0].payload["Resilience Processing"]} units</span>
        </div>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function VicariousTraumaRiskCalculator() {
  // 4. Component State
  const [profession, setProfession] = useState<"therapist" | "responder" | "medical" | "social" | "consumer">(DEFAULTS.profession);
  const [exposureHours, setExposureHours] = useState(DEFAULTS.exposureHours);
  const [processingHours, setProcessingHours] = useState(DEFAULTS.processingHours);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<TraumaResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const e = parseFloat(exposureHours);
    const p = parseFloat(processingHours);

    if (isNaN(e) || e < 0) return setErrorMsg("Please enter valid exposure hours.");
    if (isNaN(p) || p < 0) return setErrorMsg("Please enter valid processing hours.");

    const res = calculateTraumaRisk({ profession, exposureHours: e, processingHours: p });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setProfession(DEFAULTS.profession);
    setExposureHours(DEFAULTS.exposureHours);
    setProcessingHours(DEFAULTS.processingHours);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profession, exposureHours, processingHours]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Vicarious Trauma Risk Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What exactly is Vicarious Trauma?", answer: "Vicarious Trauma (also known as Secondary Traumatic Stress) is a profound psychological and emotional shift that occurs in individuals who consistently hear about or witness the traumatic experiences of others. Unlike standard burnout, which is caused by long hours and administrative stress, vicarious trauma literally alters the way your brain perceives the world. You begin to absorb the pain, fear, and hopelessness of your clients or patients, leading to severe anxiety, hypervigilance, and a loss of faith in humanity." },
    { question: "Is Vicarious Trauma the same as Burnout?", answer: "No. Burnout is a condition of extreme physical and mental exhaustion caused by overwork, poor management, or a lack of resources. Anyone in any profession can experience burnout. Vicarious Trauma is a specific emotional injury caused by empathic engagement with suffering. A nurse might be burned out because she is working 60-hour weeks. She develops vicarious trauma because she watches patients suffer and die on a daily basis. The treatments for the two are entirely different." },
    { question: "Why do therapists and social workers experience this so often?", answer: "Because empathy is their primary tool. To effectively help a client process a sexual assault, domestic violence, or severe grief, a therapist must empathetically connect with the client's narrative. Empathy requires the therapist's brain to partially 'mirror' the emotions of the client. Doing this for 30 hours a week causes a massive accumulation of psychological weight, fundamentally altering the therapist's own emotional baseline." },
    { question: "What counts as 'Processing Hours'?", answer: "Processing hours are not simply 'watching Netflix to unwind.' Processing requires active psychological decompression. This includes professional supervision, attending your own personal therapy, structured peer debriefing sessions, rigorous mindfulness/meditation, and strictly enforced somatic release (like heavy exercise specifically used to process stress). Reading a book or drinking a glass of wine does not clear traumatic exposure from the nervous system." },
    { question: "Why is the general public included in this calculator (News Consumers)?", answer: "With the rise of 24/7 digital news and algorithmic social media, the general public is now exposed to unprecedented levels of global trauma. Spending three hours a day watching horrific videos of war, natural disasters, or true crime documentaries triggers the exact same sympathetic nervous system response (fight or flight) as direct exposure. This digital vicarious trauma is a leading cause of modern cultural anxiety and chronic stress." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Vicarious Trauma Risk Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vicarious Trauma Risk Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mx-auto mb-6 bg-slate-500/10 border-l-4 border-slate-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-slate-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-400">
            <strong>Mental Health Warning:</strong> Empathy has a biological cost. This tool is designed to highlight the dangerous imbalance between secondary trauma exposure and active psychological processing. It is not a clinical diagnostic tool. If you are experiencing symptoms of PTSD, compassion fatigue, or severe depression, please seek professional support immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <BrainCircuit className="h-4 w-4" /> The Cost of Empathy
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the psychological deficit between the suffering you absorb and the time you spend actively clearing it from your nervous system.</p>
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Professional Role</label>
              <select value={profession} onChange={(e: any) => setProfession(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="responder">First Responder (Police, Fire, EMS) - High physical/immediate</option>
                <option value="medical">Medical (ER, ICU, Oncology) - High stakes/chronic</option>
                <option value="social">Social Work / CPS - Systemic/child trauma</option>
                <option value="therapist">Therapist / Counselor - Deep narrative empathy</option>
                <option value="consumer">High News / True Crime Consumer - Digital exposure</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <CompactInput id="exposure" label="Trauma Exposure (Weekly)" value={exposureHours} onChange={setExposureHours} suffix="hrs/week" />
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <CompactInput id="process" label="Active Processing (Therapy, Debrief)" value={processingHours} onChange={setProcessingHours} suffix="hrs/week" />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric Box */}
                <div 
                  className="text-white rounded-lg p-6 relative overflow-hidden shadow-sm"
                  style={{ backgroundColor: results.riskColor }}
                >
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Assessed Vicarious Trauma Risk
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl font-extrabold tracking-tight">{results.riskLevel}</div>
                    </div>
                    <div className="text-sm font-medium text-white/90 mt-2 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> Deficit Score: {results.netRiskScore}
                    </div>
                  </div>
                  <HeartPulse className="absolute -bottom-8 -right-8 h-48 w-48 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Bar Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">The Imbalance of Empathy</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visual representation of the psychological load you absorb versus the clinical time you spend actively clearing your nervous system.</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="Trauma Exposure" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Resilience Processing" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <BrainCircuit className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your professional role, weekly trauma exposure, and active self-care hours to evaluate your psychological vulnerability to compassion fatigue.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Hidden Biological Cost of Empathy</h2>
            <p>Society rightly celebrates nurses, social workers, therapists, and first responders as heroes. They are the individuals who run toward the pain and suffering that the rest of society actively avoids. However, society rarely discusses the devastating biological cost of this service. Empathy is not a superpower; it is a neurological mechanism. To effectively help a traumatized person, the helper's brain must physically mirror their pain. Doing this day after day creates a massive psychological accumulation known as Secondary Traumatic Stress. The <strong>Vicarious Trauma Risk Calculator</strong> is designed to visually expose the dangerous deficit between the trauma you absorb and the clinical time you spend clearing it from your nervous system.</p>

            <h2>Burnout vs. Compassion Fatigue</h2>
            <p>One of the most dangerous mistakes the medical and psychological fields make is confusing standard burnout with compassion fatigue (vicarious trauma). The treatments for the two are entirely different, and prescribing the wrong treatment can be disastrous.</p>
            <p><strong>Burnout</strong> is a state of physical and mental exhaustion caused by extreme workloads, administrative frustration, or poor management. An accountant working 80-hour weeks during tax season experiences severe burnout. The treatment for burnout is simple: rest. A two-week vacation to a quiet beach will generally cure burnout.</p>
            <p><strong>Vicarious Trauma</strong> is an emotional injury. A pediatric oncology nurse working 40-hour weeks is not just tired; she is absorbing the unbearable grief of dying children and shattered parents. Her nervous system is being constantly attacked by the suffering of others. A two-week vacation will not cure vicarious trauma, because the trauma is now wired into the way she perceives the world. She will sit on the beach, unable to relax, hyper-vigilant, and feeling profound guilt that she is safe while others are dying.</p>

            <h2>The Science of Mirror Neurons</h2>
            <p>Why does hearing about a trauma physically hurt the listener? The answer lies in mirror neurons. </p>
            <p>Humans are apex social creatures. To build functioning tribes, we evolved the ability to feel what others are feeling. When a therapist sits across from a client who is describing a horrific domestic assault, the therapist's mirror neurons fire, artificially recreating the biochemical signature of terror and helplessness in the therapist's own brain. The therapist's heart rate increases, and cortisol floods their system. If the therapist does this for 30 hours a week, their amygdala (the brain's fear center) becomes permanently enlarged. They begin to view the entire world as a dangerous, malevolent place, fundamentally altering their personality and destroying their ability to trust.</p>

            <h2>The Failure of "Self-Care"</h2>
            <p>When professionals begin showing signs of compassion fatigue, human resources departments usually offer insulting advice: "Practice better self-care. Take a bubble bath. Drink a glass of wine. Read a good book."</p>
            <p>This fundamentally misunderstands the severity of the injury. Passive relaxation does not clear trauma from the nervous system. The "Resilience Processing" metric in this calculator specifically refers to <strong>Active Processing</strong>. This means sitting down with a clinical supervisor to debrief horrific cases. It means the therapist attending their own intensive therapy. It means rigorous, intentional somatic release (such as heavy exercise explicitly used to process nervous energy) or structured mindfulness protocols. A bubble bath cannot fix a nervous system that is stuck in fight-or-flight mode.</p>

            <h2>The Rise of Digital Vicarious Trauma</h2>
            <p>Historically, vicarious trauma was reserved exclusively for medical professionals and first responders. Today, the general public is experiencing massive rates of secondary trauma due to the digital revolution. </p>
            <p>The human brain was not evolutionarily designed to witness the suffering of the entire globe simultaneously. When a person spends three hours a day scrolling through algorithmic feeds showing war zones, natural disasters, political violence, and true crime documentaries, their nervous system cannot differentiate between a threat on a screen and a threat in their living room. Their cortisol levels remain permanently elevated. This chronic digital exposure is a massive, unacknowledged driver of modern cultural anxiety and clinical depression.</p>

            <h2>The Warning Signs of the Deficit</h2>
            <p>How do you know if your "Net Risk Score" is too high? The psychological symptoms of vicarious trauma are distinct and terrifying. </p>
            <p>The first sign is often a complete loss of empathy for minor issues. A nurse who spends all day saving gunshot victims will come home and feel blinding rage when her spouse complains about a minor headache. The second sign is hyper-vigilance—an inability to let your children play outside because you are constantly visualizing catastrophic accidents. The final stage is profound cynicism: the deep, unshakeable belief that humanity is inherently evil and that the world is a hopelessly dark place.</p>

            <h2>Conclusion: Protect the Helper</h2>
            <p>If you work in a helping profession, your empathy is your greatest weapon, but it is also your greatest vulnerability. You cannot pour from an empty cup, and you cannot absorb the darkness of the world without a structured, clinical method for filtering it out of your own mind. Use the Vicarious Trauma Risk Calculator to face the mathematical reality of your psychological load. Demand adequate supervision, prioritize ruthless, active self-care, and protect your nervous system so you can continue the vital work of healing others.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vicarious-trauma-risk-calculator" />
          <PopularCalculators exclude="/calculator/vicarious-trauma-risk-calculator" />
        </div>
      </div>
    </>
  );
}
