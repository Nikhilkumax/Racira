"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface ChildPughResult {
  totalScore: number;
  cpClass: string;
  survival1Yr: string;
  survival2Yr: string;
  statusColor: string;
  recommendation: string;
  chartData: any[];
  summaryStats: { label: string; value: string }[];
}

function calcChildPugh(
  bilirubin: string,
  albumin: string,
  inr: string,
  ascites: string,
  enceph: string
): ChildPughResult {
  let score = 0;

  // Bilirubin
  if (bilirubin === "1") score += 1;
  else if (bilirubin === "2") score += 2;
  else if (bilirubin === "3") score += 3;

  // Albumin
  if (albumin === "1") score += 1;
  else if (albumin === "2") score += 2;
  else if (albumin === "3") score += 3;

  // INR
  if (inr === "1") score += 1;
  else if (inr === "2") score += 2;
  else if (inr === "3") score += 3;

  // Ascites
  if (ascites === "1") score += 1;
  else if (ascites === "2") score += 2;
  else if (ascites === "3") score += 3;

  // Encephalopathy
  if (enceph === "1") score += 1;
  else if (enceph === "2") score += 2;
  else if (enceph === "3") score += 3;

  let cpClass = "";
  let survival1Yr = "";
  let survival2Yr = "";
  let statusColor = "";
  let recommendation = "";

  if (score >= 10) {
    cpClass = "Class C";
    survival1Yr = "45%";
    survival2Yr = "35%";
    statusColor = "#ef4444"; // Red
    recommendation = "Decompensated cirrhosis. Poor prognosis. Patient requires active transplant evaluation and intensive medical management.";
  } else if (score >= 7) {
    cpClass = "Class B";
    survival1Yr = "80%";
    survival2Yr = "60%";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "Significant functional compromise. High risk for surgical procedures. Close monitoring required.";
  } else {
    cpClass = "Class A";
    survival1Yr = "100%";
    survival2Yr = "85%";
    statusColor = "#22c55e"; // Green
    recommendation = "Well-compensated liver disease. Generally safe for elective surgery with appropriate precautions.";
  }

  const chartData = [
    { period: "1-Year", survival: parseInt(survival1Yr) },
    { period: "2-Year", survival: parseInt(survival2Yr) }
  ];

  const summaryStats = [
    { label: "Child-Pugh Class", value: cpClass },
    { label: "1-Year Survival", value: survival1Yr }
  ];

  return {
    totalScore: score,
    cpClass,
    survival1Yr,
    survival2Yr,
    statusColor,
    recommendation,
    chartData,
    summaryStats
  };
}

export default function ChildPughScoreCalculator() {
  const [bilirubin, setBilirubin] = useState("1");
  const [albumin, setAlbumin] = useState("1");
  const [inr, setInr] = useState("1");
  const [ascites, setAscites] = useState("1");
  const [enceph, setEnceph] = useState("1");

  const [result, setResult] = useState<ChildPughResult | null>(null);

  useEffect(() => {
    setResult(calcChildPugh(bilirubin, albumin, inr, ascites, enceph));
  }, [bilirubin, albumin, inr, ascites, enceph]);

  const reset = () => {
    setBilirubin("1");
    setAlbumin("1");
    setInr("1");
    setAscites("1");
    setEnceph("1");
  };

  const selCls = "w-full p-2.5 rounded-md border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none";

  const faqs = [
    { question: "What is the Child-Pugh Score?", answer: "The Child-Pugh score is a clinical staging system used to assess the prognosis of chronic liver disease, primarily cirrhosis. It classifies patients into three categories (A, B, or C) based on their severity of liver dysfunction." },
    { question: "How does it differ from the MELD score?", answer: "While the MELD score is a purely objective mathematical formula used by UNOS to prioritize liver transplants, the Child-Pugh score is older and includes subjective clinical assessments (like the severity of ascites and encephalopathy). Despite this, Child-Pugh is still widely used to predict surgical mortality and adjust medication dosing." },
    { question: "What is Ascites?", answer: "Ascites is an abnormal buildup of fluid in the abdomen. In cirrhosis, severe scarring restricts blood flow through the liver, causing massive pressure in the portal vein. This pressure, combined with low protein levels (albumin), causes fluid to leak directly out of the blood vessels and fill the abdominal cavity." },
    { question: "What is Hepatic Encephalopathy?", answer: "Hepatic encephalopathy is a decline in brain function that occurs as a result of severe liver disease. When the liver cannot filter toxins (like ammonia) out of the blood, those toxins travel to the brain, causing confusion, personality changes, lethargy, and eventually coma." },
    { question: "What do the classes (A, B, C) mean?", answer: "Class A (5-6 points) represents 'compensated' cirrhosis, meaning the liver is scarred but still functioning well. Class B (7-9 points) shows significant functional decline. Class C (10-15 points) is 'decompensated' cirrhosis, indicating end-stage liver failure with severe risk of mortality without a transplant." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Child-Pugh Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Child-Pugh Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-4">
              <div className="p-3 border border-border rounded-lg bg-background">
                <label className="text-sm font-semibold text-foreground block mb-2">Total Bilirubin (mg/dL)</label>
                <select value={bilirubin} onChange={(e) => setBilirubin(e.target.value)} className={selCls}>
                  <option value="1">&lt; 2.0 mg/dL (1 pt)</option>
                  <option value="2">2.0 - 3.0 mg/dL (2 pts)</option>
                  <option value="3">&gt; 3.0 mg/dL (3 pts)</option>
                </select>
              </div>

              <div className="p-3 border border-border rounded-lg bg-background">
                <label className="text-sm font-semibold text-foreground block mb-2">Serum Albumin (g/dL)</label>
                <select value={albumin} onChange={(e) => setAlbumin(e.target.value)} className={selCls}>
                  <option value="1">&gt; 3.5 g/dL (1 pt)</option>
                  <option value="2">2.8 - 3.5 g/dL (2 pts)</option>
                  <option value="3">&lt; 2.8 g/dL (3 pts)</option>
                </select>
              </div>

              <div className="p-3 border border-border rounded-lg bg-background">
                <label className="text-sm font-semibold text-foreground block mb-2">INR (Prothrombin Time)</label>
                <select value={inr} onChange={(e) => setInr(e.target.value)} className={selCls}>
                  <option value="1">&lt; 1.7 (1 pt)</option>
                  <option value="2">1.7 - 2.2 (2 pts)</option>
                  <option value="3">&gt; 2.2 (3 pts)</option>
                </select>
              </div>

              <div className="p-3 border border-border rounded-lg bg-background">
                <label className="text-sm font-semibold text-foreground block mb-2">Ascites (Fluid in Abdomen)</label>
                <select value={ascites} onChange={(e) => setAscites(e.target.value)} className={selCls}>
                  <option value="1">Absent / None (1 pt)</option>
                  <option value="2">Mild / Diuretic responsive (2 pts)</option>
                  <option value="3">Severe / Diuretic refractory (3 pts)</option>
                </select>
              </div>

              <div className="p-3 border border-border rounded-lg bg-background">
                <label className="text-sm font-semibold text-foreground block mb-2">Hepatic Encephalopathy</label>
                <select value={enceph} onChange={(e) => setEnceph(e.target.value)} className={selCls}>
                  <option value="1">None (1 pt)</option>
                  <option value="2">Grade I-II / Mild confusion (2 pts)</option>
                  <option value="3">Grade III-IV / Severe, stupor, coma (3 pts)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2 border-t border-border pt-4">
              <button onClick={reset} className="w-full flex items-center justify-center gap-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset Patient Data
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>Child-Pugh Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.totalScore}</div>
                      <div className="text-2xl font-bold text-muted-foreground">/ 15</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                    {result.cpClass === "Class A" ? <CheckCircle2 className="w-8 h-8" style={{ color: result.statusColor }} /> : 
                     result.cpClass === "Class B" ? <AlertCircle className="w-8 h-8" style={{ color: result.statusColor }} /> :
                     <ShieldAlert className="w-8 h-8" style={{ color: result.statusColor }} />}
                  </div>
                </div>
                <div className="text-base font-bold mt-2" style={{ color: result.statusColor }}>
                  {result.cpClass} ({result.totalScore >= 10 ? "Decompensated" : result.totalScore >= 7 ? "Significant Disease" : "Compensated"})
                </div>
                <div className="text-sm font-medium text-foreground mt-2 leading-relaxed">
                  {result.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-2xl sm:text-3xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Estimated Survival Probability</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Visualizing empirical 1-year and 2-year survival rates for {result.cpClass} cirrhosis.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number) => [`${value}%`, `Survival`]} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="survival" radius={[4, 4, 0, 0]} maxBarSize={60} fill={result.statusColor} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Child-Pugh Score</h2>
            <p>The Child-Turcotte-Pugh (CTP) score, commonly known as the Child-Pugh score, was originally developed in 1964 to predict the surgical mortality risk of patients with cirrhosis undergoing liver portocaval shunt operations. Over time, it became the gold standard for predicting the overall severity and prognosis of chronic liver disease.</p>
            <p>While the modern MELD score has largely replaced the Child-Pugh score for determining liver transplant priority due to its purely objective mathematical nature, the Child-Pugh score remains critically important in everyday medicine. It is universally used to adjust medication dosing for patients with liver failure and to assess whether a patient can survive elective surgeries.</p>

            <h2>The Five Pillars of Liver Health</h2>
            <p>The scoring system relies on five clinical parameters that measure the liver's synthetic function and its complications:</p>
            <ul>
              <li><strong>Albumin:</strong> The liver manufactures albumin, a protein that keeps fluid inside blood vessels. Low albumin indicates the liver's manufacturing plant is failing.</li>
              <li><strong>INR / Prothrombin Time:</strong> The liver also manufactures clotting factors. A high INR means the blood is taking too long to clot, representing a dangerous decline in liver function.</li>
              <li><strong>Bilirubin:</strong> The liver clears bilirubin (a yellow breakdown product of red blood cells). High bilirubin means the liver's filtration system is failing, leading to jaundice.</li>
              <li><strong>Ascites:</strong> A physical complication of cirrhosis where severe scarring creates backpressure in the veins, causing fluid to leak and pool massively in the abdomen.</li>
              <li><strong>Encephalopathy:</strong> When the liver fails to filter toxins (like ammonia), those toxins travel to the brain, causing confusion, personality changes, and eventually coma.</li>
            </ul>

            <h2>Compensated vs. Decompensated</h2>
            <p>The medical community uses the Child-Pugh classes to determine if a patient is compensated or decompensated:</p>
            <p><strong>Class A (Score 5-6):</strong> Compensated. The liver is scarred, but it is still performing its vital functions. Life expectancy remains high.</p>
            <p><strong>Class B (Score 7-9):</strong> Transitioning. The liver is beginning to struggle to keep up with the body's demands, and complications are arising.</p>
            <p><strong>Class C (Score 10-15):</strong> Decompensated. The liver has functionally failed. The patient is at extreme risk of death from bleeding or infection and urgently requires a transplant.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/child-pugh-score-calculator" />
          <PopularCalculators exclude="/calculator/child-pugh-score-calculator" />
        </div>
      </div>
    </>
  );
}
