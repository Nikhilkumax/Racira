"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Activity } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface ThyroidInputs {
  age: number;
  sex: "female" | "male";
  familyHistory: boolean;
  symptoms: string[];
}

interface ThyroidResults {
  hypoScore: number;
  hyperScore: number;
  overallRisk: "Low Risk" | "Moderate Hypothyroidism Risk" | "High Hypothyroidism Risk" | "Moderate Hyperthyroidism Risk" | "High Hyperthyroidism Risk" | "Mixed/Complex Risk";
  recommendation: string;

  chartData: { subject: string; score: number; fullMark: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// Symptom Definitions
const SYMPTOMS = [
  // Hypo Symptoms
  { id: "fatigue", label: "Unexplained Fatigue / Lethargy", type: "hypo", weight: 2 },
  { id: "weight_gain", label: "Unexplained Weight Gain", type: "hypo", weight: 2 },
  { id: "cold_intol", label: "Cold Intolerance (always freezing)", type: "hypo", weight: 2 },
  { id: "dry_skin", label: "Dry Skin / Brittle Nails", type: "hypo", weight: 1 },
  { id: "hair_loss", label: "Hair Thinning / Loss", type: "hypo", weight: 1 },
  { id: "constipation", label: "Chronic Constipation", type: "hypo", weight: 1 },
  { id: "depression", label: "Depression / Brain Fog", type: "hypo", weight: 1 },
  
  // Hyper Symptoms
  { id: "weight_loss", label: "Unexplained Weight Loss", type: "hyper", weight: 2 },
  { id: "rapid_heart", label: "Rapid Heart Rate / Palpitations", type: "hyper", weight: 2 },
  { id: "heat_intol", label: "Heat Intolerance / Excessive Sweating", type: "hyper", weight: 2 },
  { id: "anxiety", label: "Severe Anxiety / Nervousness", type: "hyper", weight: 1 },
  { id: "tremors", label: "Hand Tremors / Shaking", type: "hyper", weight: 2 },
  { id: "insomnia", label: "Insomnia / Trouble Sleeping", type: "hyper", weight: 1 },
  { id: "frequent_bm", label: "Frequent Bowel Movements", type: "hyper", weight: 1 }
];

// 2. Pure Calculation Function
const calculateThyroidRisk = (inputs: ThyroidInputs): ThyroidResults | null => {
  const { age, sex, familyHistory, symptoms } = inputs;
  
  if (age <= 0) return null;

  let hypoScore = 0;
  let hyperScore = 0;

  // Base Risk Factors
  if (sex === "female") {
    hypoScore += 1;
    hyperScore += 1;
  }
  if (age > 60) {
    hypoScore += 1; // Hypo is much more common in elderly females
  }
  if (familyHistory) {
    hypoScore += 2;
    hyperScore += 2;
  }

  // Calculate Symptom Scores
  symptoms.forEach(sympId => {
    const symptom = SYMPTOMS.find(s => s.id === sympId);
    if (symptom) {
      if (symptom.type === "hypo") hypoScore += symptom.weight;
      if (symptom.type === "hyper") hyperScore += symptom.weight;
    }
  });

  // Determine Category
  let overallRisk: ThyroidResults["overallRisk"] = "Low Risk";
  let recommendation = "Your symptom profile does not currently indicate high risk for thyroid dysfunction. However, consult a doctor if you feel unwell.";
  let color = "hsl(var(--primary))";

  const maxHypo = 13; // Max possible is 10 from symptoms + 3 from demographics
  const maxHyper = 14; 

  const hypoPct = (hypoScore / maxHypo) * 100;
  const hyperPct = (hyperScore / maxHyper) * 100;

  if (hypoPct > 50 && hyperPct > 50) {
    overallRisk = "Mixed/Complex Risk";
    recommendation = "You have significant symptoms of both overactive and underactive thyroid, which can occur in autoimmune conditions like Hashimoto's during flare-ups. A full thyroid panel (TSH, Free T3, Free T4) is highly recommended.";
    color = "#f59e0b"; // amber
  } else if (hypoPct >= 60) {
    overallRisk = "High Hypothyroidism Risk";
    recommendation = "Your symptoms strongly align with an underactive thyroid (Hypothyroidism). You should request a blood test from your doctor measuring TSH and Free T4.";
    color = "#3b82f6"; // blue
  } else if (hyperPct >= 60) {
    overallRisk = "High Hyperthyroidism Risk";
    recommendation = "Your symptoms strongly align with an overactive thyroid (Hyperthyroidism). You should request a blood test from your doctor immediately, as this can affect your heart.";
    color = "#ef4444"; // red
  } else if (hypoPct >= 30) {
    overallRisk = "Moderate Hypothyroidism Risk";
    recommendation = "You have a few symptoms of an underactive thyroid. If these persist and affect your quality of life, a routine thyroid check is a good idea.";
    color = "#3b82f6";
  } else if (hyperPct >= 30) {
    overallRisk = "Moderate Hyperthyroidism Risk";
    recommendation = "You have a few symptoms of an overactive thyroid. Monitor your heart rate and weight, and consult a doctor if symptoms worsen.";
    color = "#ef4444";
  }

  const chartData = [
    { subject: 'Hypo Risk Factors', score: hypoPct, fullMark: 100 },
    { subject: 'Hyper Risk Factors', score: hyperPct, fullMark: 100 },
    { subject: 'Family History', score: familyHistory ? 100 : 0, fullMark: 100 },
    { subject: 'Demographic Risk', score: sex === "female" ? (age > 60 ? 100 : 60) : 20, fullMark: 100 }
  ];

  const summaryStats = [
    { label: "Hypothyroid Indication", value: `${Math.round(hypoPct)}%`, colorClass: "text-blue-500 font-bold" },
    { label: "Hyperthyroid Indication", value: `${Math.round(hyperPct)}%`, colorClass: "text-red-500 font-bold" },
    { label: "Clinical Risk Status", value: overallRisk, colorClass: `text-[${color}] font-black` },
    { label: "Reported Symptoms", value: `${symptoms.length} items` }
  ];

  return {
    hypoScore,
    hyperScore,
    overallRisk,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  age: "45",
  sex: "female" as const,
  familyHistory: false,
  symptoms: [] as string[]
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5" style={{ color: "hsl(var(--primary))" }}>{payload[0].payload.subject}</p>
        <p className="text-muted-foreground">Relative Intensity: {Math.round(payload[0].value)}%</p>
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

// Checkbox Component
const CheckboxInput = ({ label, checked, onChange, isHyper }: any) => (
  <label className="flex items-start gap-2 text-sm font-medium text-foreground cursor-pointer group p-2 rounded-md hover:bg-secondary/50 transition-colors">
    <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? (isHyper ? 'bg-red-500 border-red-500 text-white' : 'bg-blue-500 border-blue-500 text-white') : 'border-input bg-background group-hover:border-primary/50'}`}>
      {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
    <span className="select-none leading-tight pt-0.5">{label}</span>
  </label>
);

export default function ThyroidRiskScoreCalculator() {
  // 4. Component State
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState<"female" | "male">(DEFAULTS.sex);
  const [familyHistory, setFamilyHistory] = useState(DEFAULTS.familyHistory);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(DEFAULTS.symptoms);
  
  const [results, setResults] = useState<ThyroidResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleCalculate = () => {
    const inputs: ThyroidInputs = {
      age: parseInt(age) || 0,
      sex,
      familyHistory,
      symptoms: selectedSymptoms
    };
    setResults(calculateThyroidRisk(inputs));
  };

  const handleReset = () => {
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setFamilyHistory(DEFAULTS.familyHistory);
    setSelectedSymptoms([]);
    setResults(null);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age, sex, familyHistory, selectedSymptoms]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Thyroid Risk Assessment</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is the difference between Hypothyroidism and Hyperthyroidism?", answer: "Hypothyroidism means your thyroid is underactive; it doesn't produce enough hormone, causing your metabolism to slow down (leading to fatigue, weight gain, and feeling cold). Hyperthyroidism means your thyroid is overactive, producing too much hormone and driving your metabolism too fast (causing weight loss, rapid heart rate, and anxiety)." },
    { question: "Is this calculator a diagnostic tool?", answer: "No. This tool provides an educational risk assessment based on clinical symptom profiles. Thyroid disorders share symptoms with many other conditions (like menopause, depression, or anemia). A formal diagnosis requires a blood test measuring TSH, Free T3, and Free T4 levels." },
    { question: "Why does gender matter for thyroid risk?", answer: "Women are five to eight times more likely to develop thyroid problems than men. Autoimmune conditions that attack the thyroid, such as Hashimoto's disease and Graves' disease, have a strong predilection for females, particularly during hormonal shifts like pregnancy or menopause." },
    { question: "Can I have symptoms of both at the same time?", answer: "Yes, this is known as a 'Mixed' or 'Complex' risk profile. In autoimmune thyroiditis (Hashimoto's), the immune system attacks the thyroid. As the thyroid cells are destroyed, they can dump stored hormone into the bloodstream, causing a temporary hyperthyroid 'flare' before settling into chronic hypothyroidism." },
    { question: "What should I ask my doctor to test for?", answer: "Do not let a doctor test only 'TSH'. Request a 'Full Thyroid Panel', which includes TSH, Free T4, Free T3, and Thyroid Antibodies (TPOAb and TgAb) to check for autoimmune disease." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Thyroid Risk Score Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Thyroid Risk Score Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[560px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Activity className="h-4 w-4" /> Endocrine Symptom Profiler
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Select your demographics and any current, unexplained symptoms to calculate your relative risk for Hypothyroidism vs Hyperthyroidism.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="age" label="Patient Age" value={age} onChange={setAge} suffix="years" />
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Biological Sex</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setSex("female")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${sex === "female" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Female</button>
                  <button type="button" onClick={() => setSex("male")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${sex === "male" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Male</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col mb-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Family History of Thyroid Disease?</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                <button type="button" onClick={() => setFamilyHistory(true)} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${familyHistory === true ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Yes</button>
                <button type="button" onClick={() => setFamilyHistory(false)} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${familyHistory === false ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>No</button>
              </div>
            </div>

            <div className="h-px bg-border my-2"></div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Hypo List */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-blue-500 border-b border-border pb-2 mb-1">Underactive Symptoms</h3>
                {SYMPTOMS.filter(s => s.type === "hypo").map(s => (
                  <CheckboxInput key={s.id} label={s.label} checked={selectedSymptoms.includes(s.id)} onChange={() => toggleSymptom(s.id)} isHyper={false} />
                ))}
              </div>

              {/* Hyper List */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-red-500 border-b border-border pb-2 mb-1">Overactive Symptoms</h3>
                {SYMPTOMS.filter(s => s.type === "hyper").map(s => (
                  <CheckboxInput key={s.id} label={s.label} checked={selectedSymptoms.includes(s.id)} onChange={() => toggleSymptom(s.id)} isHyper={true} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4">
                
                {/* 1. Primary Result Card */}
                <div className={`border-l-4 rounded-lg p-5 relative ${
                  results.overallRisk.includes("Hyper") ? "bg-red-500/10 border-red-500" :
                  results.overallRisk.includes("Hypo") ? "bg-blue-500/10 border-blue-500" :
                  results.overallRisk.includes("Mixed") ? "bg-amber-500/10 border-amber-500" :
                  "bg-primary/10 border-primary"
                }`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: results.overallRisk.includes("Hyper") ? "#ef4444" : results.overallRisk.includes("Hypo") ? "#3b82f6" : results.overallRisk.includes("Mixed") ? "#f59e0b" : "hsl(var(--primary))" }}>
                    Clinical Risk Category
                  </div>
                  <div className="text-3xl font-black text-foreground tracking-tight mb-3">
                    {results.overallRisk}
                  </div>
                  <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                    <strong>Recommendation:</strong> {results.recommendation}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Risk Profile Summary</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Symptom Radar</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={results.chartData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Risk Intensity" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Enter your demographic data and select your symptoms to generate your Thyroid Risk Profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Thyroid Risk Score Calculator</h2>
            <p>The thyroid is a small, butterfly-shaped gland located at the base of your neck. Despite its small size, it acts as the master control center for your entire body's metabolism. It regulates how fast your heart beats, how quickly you burn calories, how you regulate body temperature, and even how your brain functions. When this gland malfunctions, the physical and psychological symptoms can be devastating.</p>
            <p>The <strong>Thyroid Risk Score Calculator</strong> is an educational clinical profiling tool designed to help you quantify your symptoms. Because thyroid disease shares symptoms with many other common conditions (such as aging, menopause, stress, or depression), it is frequently misdiagnosed or ignored for years. By algorithmically weighting your demographics against the classic presentation of both overactive and underactive thyroid states, this calculator provides a clear visual risk profile to discuss with your endocrinologist.</p>

            <h2>Hypothyroidism: The Sluggish Engine</h2>
            <p>Hypothyroidism occurs when the thyroid gland is underactive and fails to produce enough thyroid hormones (T3 and T4). Without these hormones, every system in your body slows down. You can think of it as an engine running without enough oil. The most common cause of hypothyroidism in the developed world is <strong>Hashimoto's Thyroiditis</strong>, an autoimmune condition where the body's immune system mistakenly attacks and destroys the thyroid tissue.</p>
            <p>The classic symptoms of hypothyroidism (which are heavily weighted in our calculator) include:</p>
            <ul>
              <li><strong>Unexplained Fatigue:</strong> A bone-deep exhaustion that does not improve with sleep.</li>
              <li><strong>Weight Gain:</strong> Putting on 10 to 20 pounds without changing your diet, and finding it impossible to lose.</li>
              <li><strong>Cold Intolerance:</strong> Feeling freezing cold when everyone else in the room is comfortable.</li>
              <li><strong>Cognitive Issues:</strong> Often described as "brain fog," memory loss, and severe depression.</li>
              <li><strong>Physical Changes:</strong> Dry skin, brittle nails, severe hair thinning, and chronic constipation.</li>
            </ul>

            <h2>Hyperthyroidism: The Overheated Engine</h2>
            <p>Conversely, Hyperthyroidism occurs when the gland is overactive, pumping massive amounts of hormone into the bloodstream. This throws the body into overdrive. The most common cause is <strong>Graves' Disease</strong>, another autoimmune condition that binds to the thyroid and forces it to overproduce.</p>
            <p>The classic symptoms of hyperthyroidism include:</p>
            <ul>
              <li><strong>Unexplained Weight Loss:</strong> Dropping weight rapidly despite having a ravenous appetite.</li>
              <li><strong>Cardiovascular Stress:</strong> A resting heart rate over 100 bpm, palpitations, and elevated blood pressure.</li>
              <li><strong>Heat Intolerance:</strong> Sweating profusely in cool environments.</li>
              <li><strong>Neurological Symptoms:</strong> Severe anxiety, panic attacks, insomnia, and visible hand tremors.</li>
              <li><strong>Digestive Issues:</strong> Frequent bowel movements or diarrhea due to hyper-motility.</li>
            </ul>

            <h2>Why Demographics Matter in Thyroid Disease</h2>
            <p>When you input your data into our calculator, you will notice that biological sex and age immediately alter your baseline risk. This is because thyroid disease is highly discriminatory.</p>
            <p><strong>Women are five to eight times more likely to develop thyroid disease than men.</strong> The primary trigger for autoimmune thyroid conditions is massive hormonal fluctuation, which is why onset frequently occurs during puberty, postpartum (after giving birth), or during perimenopause. If you are a woman over the age of 60, your risk of hypothyroidism is roughly 20%, which is why age is a heavily weighted factor in the clinical algorithm.</p>
            <p><strong>Family history</strong> is another critical factor. Because Hashimoto's and Graves' diseases are autoimmune disorders, they run heavily in families. If your mother, sister, or grandmother required thyroid medication, your genetic risk is exponentially higher.</p>

            <h2>The Danger of the "Mixed/Complex" Profile</h2>
            <p>Our calculator may output a "Mixed/Complex Risk" result if you check multiple boxes for both hyperthyroid and hypothyroid symptoms. While this might seem contradictory, it is actually a common clinical presentation during the early stages of Hashimoto's Thyroiditis.</p>
            <p>As the immune system attacks the thyroid gland, the dying thyroid cells rupture. When they rupture, they dump all of their stored thyroid hormone into the bloodstream at once. This causes a temporary, severe hyperthyroid "flare"—resulting in anxiety, palpitations, and weight loss. Once that dumped hormone is metabolized, the gland is now damaged and cannot produce enough hormone, causing the patient to crash into deep hypothyroidism (fatigue, weight gain). This rollercoaster of symptoms is the hallmark of autoimmune thyroid destruction.</p>

            <h2>Why TSH Testing is Not Enough</h2>
            <p>If your calculator results indicate a high risk, the immediate next step is to request a blood test. However, the standard medical protocol is deeply flawed. Most primary care doctors will only order a single test: TSH (Thyroid Stimulating Hormone).</p>
            <p>TSH is a pituitary hormone, not a thyroid hormone. Relying solely on TSH can completely miss early-stage autoimmune disease or problems with cellular hormone conversion. You must advocate for a <strong>Full Thyroid Panel</strong>, which includes:</p>
            <ul>
              <li><strong>TSH:</strong> To see the brain's signal to the thyroid.</li>
              <li><strong>Free T4:</strong> The inactive storage hormone produced by the thyroid.</li>
              <li><strong>Free T3:</strong> The active metabolic hormone utilized by the cells.</li>
              <li><strong>TPOAb and TgAb (Antibodies):</strong> To determine if your immune system is actively attacking the gland (confirming Hashimoto's).</li>
            </ul>

            <h2>The Impact on Cardiovascular Health</h2>
            <p>Ignoring a high thyroid risk score can have devastating consequences for your heart. Hyperthyroidism (an overactive thyroid) forces the heart to beat too fast and too hard, which can lead to Atrial Fibrillation (a dangerous irregular heartbeat) and eventual congestive heart failure. Conversely, Hypothyroidism (an underactive thyroid) causes LDL (bad) cholesterol levels to skyrocket and weakens the heart muscle, significantly increasing the risk of a major heart attack.</p>

            <h2>Conclusion: Taking Control of Your Endocrine Health</h2>
            <p>The Thyroid Risk Score Calculator is your first step toward diagnosis and recovery. Thyroid disorders are insidious; they creep up slowly, stealing your energy, altering your physical appearance, and destroying your mental health. Do not allow a medical professional to dismiss your symptoms as "just getting older" or "just stress."</p>
            <p>If your risk score points toward dysfunction, print these results, schedule an appointment with an endocrinologist, and demand comprehensive blood testing. With the correct diagnosis and proper hormone replacement therapy, thyroid disease is highly manageable, and you can fully reclaim your quality of life.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/thyroid-risk-score-calculator" />
          <PopularCalculators exclude="/calculator/thyroid-risk-score-calculator" />
        </div>
      </div>
    </>
  );
}
