"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Droplet, AlertCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceArea, ReferenceLine } from "recharts";

interface HemoglobinResult {
  status: string;
  color: string;
  recommendation: string;
  estHematocrit: number;
  normalRangeStr: string;
  chartData: { name: string; value: number }[];
  minNormal: number;
  maxNormal: number;
  summaryStats: { label: string; value: string }[];
}

function calcHemoglobin(sex: string, ageGroup: string, pregnant: boolean, hb: number): HemoglobinResult {
  let minNormal = 0;
  let maxNormal = 0;

  // Standard Clinical Ranges for Hemoglobin (g/dL)
  if (ageGroup === "child") {
    minNormal = 11.5;
    maxNormal = 15.5;
  } else {
    // Adult
    if (sex === "male") {
      minNormal = 13.8;
      maxNormal = 17.2;
    } else {
      if (pregnant) {
        // Pregnancy increases blood plasma volume, lowering relative Hb concentration (hemodilution)
        minNormal = 11.0;
        maxNormal = 14.0;
      } else {
        minNormal = 12.1;
        maxNormal = 15.1;
      }
    }
  }

  let status = "";
  let color = "";
  let recommendation = "";

  if (hb < minNormal) {
    status = "Low (Anemia)";
    color = "#ef4444"; // Red
    
    // Severity
    if (hb < 8.0) {
      status = "Severe Anemia";
      recommendation = "Your hemoglobin is critically low. This requires immediate medical attention and potentially a blood transfusion. Contact a doctor or emergency services immediately.";
    } else if (hb < 10.0) {
      status = "Moderate Anemia";
      recommendation = "Your hemoglobin is moderately low. You may experience severe fatigue and shortness of breath. See your primary care physician promptly to determine the cause (e.g., iron deficiency, internal bleeding).";
    } else {
      status = "Mild Anemia";
      recommendation = "Your hemoglobin is slightly below the normal range. Discuss with your doctor; it may be easily corrected with iron supplements or dietary changes.";
    }
  } else if (hb > maxNormal) {
    status = "High (Polycythemia)";
    color = "#f97316"; // Orange
    recommendation = "Your hemoglobin is abnormally high. This can be caused by dehydration, smoking, living at high altitudes, or a bone marrow disorder like polycythemia vera. Consult your physician for further testing.";
  } else {
    status = "Normal Range";
    color = "#22c55e"; // Green
    recommendation = "Your hemoglobin level falls within the healthy, normal clinical range for your demographic.";
  }

  // Clinical Rule of Three: Hematocrit (%) is roughly 3 times Hemoglobin
  const estHematocrit = hb * 3;

  const chartData = [
    { name: "Your Hemoglobin", value: Number(hb.toFixed(1)) }
  ];

  const summaryStats = [
    { label: "Normal Range Target", value: `${minNormal} - ${maxNormal} g/dL` },
    { label: "Rule of 3 (Est. Hematocrit)", value: `${estHematocrit.toFixed(1)}%` }
  ];

  return {
    status,
    color,
    recommendation,
    estHematocrit: Number(estHematocrit.toFixed(1)),
    normalRangeStr: `${minNormal.toFixed(1)} to ${maxNormal.toFixed(1)} g/dL`,
    minNormal,
    maxNormal,
    chartData,
    summaryStats
  };
}

export default function HemoglobinCalculator() {
  const [sex, setSex] = useState("male");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [pregnant, setPregnant] = useState(false);
  const [hb, setHb] = useState("14.5");

  const [result, setResult] = useState<HemoglobinResult | null>(null);

  const calculate = () => {
    const h = parseFloat(hb);
    if (h > 0) {
      setResult(calcHemoglobin(sex, ageGroup, pregnant, h));
    }
  };

  useEffect(() => { setResult(calcHemoglobin("male", "adult", false, 14.5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is Hemoglobin (Hb)?", answer: "Hemoglobin is an iron-rich protein found inside your red blood cells. Its primary job is to bind to oxygen molecules in your lungs and carry them through your bloodstream to fuel every organ and tissue in your body." },
    { question: "Why are the normal ranges different for men and women?", answer: "Biological males generally have higher hemoglobin levels than females. This is driven by testosterone, which stimulates the kidneys to produce more erythropoietin (EPO), a hormone that commands the bone marrow to produce red blood cells. Additionally, women of childbearing age regularly lose iron through menstruation." },
    { question: "Why does pregnancy lower the normal range?", answer: "During pregnancy, a woman's total blood volume expands dramatically to support the fetus. However, the liquid portion of the blood (plasma) expands much faster than the red blood cells. This effectively dilutes the blood, resulting in a naturally lower hemoglobin concentration (a condition known as 'dilutional anemia of pregnancy')." },
    { question: "What is the 'Rule of Three'?", answer: "In clinical hematology, the Rule of Three is a quick mental shortcut used by doctors. A patient's Hematocrit (the percentage of total blood volume consisting of red blood cells) is almost always exactly three times their Hemoglobin level. If the math doesn't align, it indicates a laboratory error or a structural abnormality in the red blood cells." },
    { question: "What are the symptoms of low hemoglobin?", answer: "Low hemoglobin (Anemia) means your organs are starving for oxygen. Symptoms include severe fatigue, pale skin, shortness of breath, a rapid or irregular heartbeat, cold hands and feet, and frequent headaches." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Hemoglobin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Hemoglobin (Hb) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age Group</label>
                <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                  <option value="adult">Adult (18+)</option>
                  <option value="child">Child / Teen</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
                <select value={sex} onChange={e => {
                  setSex(e.target.value);
                  if (e.target.value === "male") setPregnant(false);
                }} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {sex === "female" && ageGroup === "adult" && (
              <div className="border border-border rounded-lg p-3 bg-muted/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={pregnant} onChange={e => setPregnant(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                  <span className="text-sm font-medium">Currently Pregnant</span>
                </label>
                <p className="text-[10px] text-muted-foreground mt-1 ml-8">Pregnancy alters blood plasma volume, changing normal hemoglobin ranges.</p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <label className="text-sm font-bold mb-1.5 block">Hemoglobin Level (Hb)</label>
              <div className={inp}><input type="number" step="0.1" value={hb} onChange={e => setHb(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">g/dL</span></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <Activity className="h-5 w-5" /> Analyze Result
              </button>
              <button onClick={() => { setSex("male"); setAgeGroup("adult"); setPregnant(false); setHb("14.5"); setResult(calcHemoglobin("male", "adult", false, 14.5)); }} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.color}10`, borderColor: result.color }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.color }}>Clinical Status</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.status}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border">
                    {result.color === "#ef4444" || result.color === "#f97316" ? (
                      <AlertCircle className="w-7 h-7" style={{ color: result.color }} />
                    ) : (
                      <Droplet className="w-7 h-7" style={{ color: result.color }} />
                    )}
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
                <h3 className="text-base font-bold mb-1">Hemoglobin Scale</h3>
                <p className="text-xs text-muted-foreground mb-6">Green area represents the normal healthy range for your specific demographic.</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 20 }}>
                    <XAxis type="number" domain={[4, 22]} tick={{ fontSize: 11 }} ticks={[4, 8, 12, 16, 20]} />
                    <YAxis type="category" dataKey="name" hide />
                    
                    {/* Background Ranges */}
                    <ReferenceArea x1={4} x2={result.minNormal} fill="#fee2e2" fillOpacity={1} />
                    <ReferenceArea x1={result.minNormal} x2={result.maxNormal} fill="#dcfce7" fillOpacity={1} />
                    <ReferenceArea x1={result.maxNormal} x2={22} fill="#ffedd5" fillOpacity={1} />

                    {/* Normal Limits Lines */}
                    <ReferenceLine x={result.minNormal} stroke="#22c55e" strokeDasharray="3 3" />
                    <ReferenceLine x={result.maxNormal} stroke="#22c55e" strokeDasharray="3 3" />

                    <Tooltip cursor={false} formatter={(v: number) => [`${v} g/dL`, "Your Level"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" barSize={20} fill={result.color} radius={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Your Hemoglobin (Hb) Results</h2>
            <p>A Complete Blood Count (CBC) is one of the most common laboratory tests performed in medicine. Within that test, Hemoglobin is arguably the most critical metric. Hemoglobin is the iron-rich protein residing inside your red blood cells that is solely responsible for carrying oxygen from your lungs to the rest of your body.</p>
            <p>This <strong>Hemoglobin Calculator</strong> analyzes your blood test results, automatically cross-referencing your value against the exact clinical ranges established for your specific demographic (age, biological sex, and pregnancy status).</p>

            <h2>What is Anemia? (Low Hemoglobin)</h2>
            <p>If your hemoglobin falls below the green target range, you are clinically classified as having Anemia. Because your blood lacks the physical capacity to transport adequate oxygen, your organs essentially begin to suffocate at a microscopic level. The severity of the symptoms correlates directly with how low your hemoglobin drops.</p>
            <ul>
              <li><strong>Mild Anemia (Just below normal to 10 g/dL):</strong> You may feel slightly more fatigued than usual, particularly during exercise. Often caused by mild iron deficiency or a heavy menstrual cycle.</li>
              <li><strong>Moderate Anemia (8.0 to 10.0 g/dL):</strong> Severe exhaustion, dizziness when standing up, pale skin, and a fast heart rate (tachycardia) as your heart pumps faster trying to circulate what little oxygen is available.</li>
              <li><strong>Severe Anemia (Below 8.0 g/dL):</strong> This is a medical emergency. Organs can begin to fail due to hypoxia. Doctors will often order an immediate blood transfusion.</li>
            </ul>

            <h2>What is Polycythemia? (High Hemoglobin)</h2>
            <p>A hemoglobin level that is significantly above the normal range is less common but equally dangerous. It means your blood is too thick. Blood that is viscous and sludge-like cannot flow easily through the microscopic capillaries in your brain and heart, drastically increasing your risk of suffering a spontaneous stroke or heart attack.</p>
            <p>High hemoglobin is most frequently caused by chronic dehydration, heavy cigarette smoking (the body produces more red blood cells to compensate for the carbon monoxide in smoke), or living at very high altitudes. In rare cases, it is caused by a bone marrow cancer known as Polycythemia Vera.</p>

            <h2>The Clinical Rule of Three</h2>
            <p>You will often see both Hemoglobin (Hb) and Hematocrit (Hct) reported next to each other on a blood test. Hematocrit is the percentage of your total blood volume that consists of red blood cells.</p>
            <p>In a healthy patient with normal-shaped red blood cells, a mathematical constant known as the <em>Rule of Three</em> applies: your Hematocrit percentage should be almost exactly three times your Hemoglobin value in g/dL. If you have a hemoglobin of 15 g/dL, your hematocrit should be roughly 45%. Hematologists use this rule to quickly spot laboratory errors or identify structural abnormalities in the red blood cells.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hemoglobin-calculator" />
          <PopularCalculators exclude="/calculator/hemoglobin-calculator" />
        </div>
      </div>
    </>
  );
}
