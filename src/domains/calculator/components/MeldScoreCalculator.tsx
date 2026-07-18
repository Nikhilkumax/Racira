"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Activity, ShieldAlert, HeartPulse } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface MeldResult {
  meldScore: number;
  meldNaScore: number;
  mortality: number;
  statusText: string;
  statusColor: string;
  recommendation: string;
  chartData: { range: string; risk: number; isCurrent: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcMeld(
  creatinine: number,
  bilirubin: number,
  inr: number,
  sodium: number,
  dialysis: boolean
): MeldResult {
  // UNOS rules: Values < 1.0 must be rounded up to 1.0
  let cr = Math.max(1.0, creatinine);
  const bil = Math.max(1.0, bilirubin);
  const inrVal = Math.max(1.0, inr);

  // If patient had dialysis twice in the last week, Creatinine is automatically set to 4.0
  // Additionally, maximum allowed Creatinine in the formula is 4.0
  if (dialysis || cr > 4.0) {
    cr = 4.0;
  }

  // Original MELD(i) formula (2002)
  // MELD = 10 * (0.957 * ln(Cr) + 0.378 * ln(Bil) + 1.120 * ln(INR) + 0.643)
  const meldI = 10 * (0.957 * Math.log(cr) + 0.378 * Math.log(bil) + 1.120 * Math.log(inrVal) + 0.643);
  let finalMeldI = Math.round(meldI);
  if (finalMeldI > 40) finalMeldI = 40;

  let meldNa = finalMeldI;

  // UNOS 2016 Update: MELD-Na adjustment applies only if original MELD > 11
  if (finalMeldI > 11) {
    // Sodium is bound between 125 and 137 mEq/L
    let na = sodium;
    if (na < 125) na = 125;
    if (na > 137) na = 137;

    const meldNaCalc = finalMeldI + 1.32 * (137 - na) - (0.033 * finalMeldI * (137 - na));
    meldNa = Math.round(meldNaCalc);
    if (meldNa > 40) meldNa = 40;
  }

  // Determine 3-month mortality risk based on empirical UNOS data
  let mortality = 0;
  let statusText = "";
  let statusColor = "";
  let recommendation = "";

  if (meldNa >= 40) {
    mortality = 71.3;
    statusText = "Critically High Risk (MELD ≥ 40)";
    statusColor = "#7f1d1d"; // Dark Red
    recommendation = "Severe end-stage liver disease. Extremely high priority for liver transplantation.";
  } else if (meldNa >= 30) {
    mortality = 52.6;
    statusText = "High Risk (MELD 30-39)";
    statusColor = "#ef4444"; // Red
    recommendation = "High 3-month mortality risk. Patient requires urgent hepatology intervention and active transplant listing.";
  } else if (meldNa >= 20) {
    mortality = 19.6;
    statusText = "Moderate Risk (MELD 20-29)";
    statusColor = "#f97316"; // Orange
    recommendation = "Significant liver dysfunction. Active evaluation for liver transplantation is typically indicated.";
  } else if (meldNa >= 10) {
    mortality = 6.0;
    statusText = "Low-Moderate Risk (MELD 10-19)";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "Moderate disease progression. Monitor labs routinely and manage complications of cirrhosis.";
  } else {
    mortality = 1.9;
    statusText = "Low Risk (MELD ≤ 9)";
    statusColor = "#22c55e"; // Green
    recommendation = "Low 3-month mortality risk. Routine outpatient hepatology monitoring is recommended.";
  }

  const chartData = [
    { range: "≤9", risk: 1.9, isCurrent: meldNa <= 9 },
    { range: "10-19", risk: 6.0, isCurrent: meldNa >= 10 && meldNa <= 19 },
    { range: "20-29", risk: 19.6, isCurrent: meldNa >= 20 && meldNa <= 29 },
    { range: "30-39", risk: 52.6, isCurrent: meldNa >= 30 && meldNa <= 39 },
    { range: "40", risk: 71.3, isCurrent: meldNa >= 40 }
  ];

  const summaryStats = [
    { label: "Est. 3-Month Mortality", value: `${mortality}%` },
    { label: "Original MELD Score", value: `${finalMeldI}` }
  ];

  return {
    meldScore: finalMeldI,
    meldNaScore: meldNa,
    mortality,
    statusText,
    statusColor,
    recommendation,
    chartData,
    summaryStats
  };
}

export default function MeldScoreCalculator() {
  const [creatinine, setCreatinine] = useState("1.8");
  const [bilirubin, setBilirubin] = useState("2.5");
  const [inr, setInr] = useState("1.4");
  const [sodium, setSodium] = useState("135");
  const [dialysis, setDialysis] = useState(false);

  const [result, setResult] = useState<MeldResult | null>(null);

  const calculate = () => {
    const cr = parseFloat(creatinine) || 0;
    const bil = parseFloat(bilirubin) || 0;
    const inrVal = parseFloat(inr) || 0;
    const na = parseFloat(sodium) || 0;
    
    if (cr > 0 && bil > 0 && inrVal > 0 && na > 0) {
      setResult(calcMeld(cr, bil, inrVal, na, dialysis));
    }
  };

  useEffect(() => {
    calculate();
  }, []);

  const reset = () => {
    setCreatinine("1.8");
    setBilirubin("2.5");
    setInr("1.4");
    setSodium("135");
    setDialysis(false);
  };

  const inpCls = "w-full p-2.5 rounded-md border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none";

  const faqs = [
    { question: "What is the MELD Score?", answer: "MELD stands for Model for End-Stage Liver Disease. It is a highly accurate mathematical formula used by hepatologists to predict a patient's exact chance of surviving the next 3 months (90 days) with their current liver. It is universally used by UNOS (United Network for Organ Sharing) to prioritize patients on the liver transplant waiting list." },
    { question: "What is MELD-Na vs. the original MELD?", answer: "The original MELD formula only used Bilirubin, Creatinine, and INR. However, doctors realized that patients with severely low sodium levels (hyponatremia) were dying while waiting for a transplant because the original formula underestimated their risk. In 2016, UNOS officially updated the formula to 'MELD-Na', which includes Serum Sodium levels to provide a much more accurate mortality prediction." },
    { question: "Why is Creatinine included in a liver test?", answer: "Creatinine measures kidney function. In advanced cirrhosis, the scarred liver severely restricts blood flow, causing blood to back up into the portal vein (portal hypertension). This dramatically alters blood pressure throughout the body, eventually choking off blood flow to the kidneys. When the kidneys begin to fail due to liver disease (a condition called hepatorenal syndrome), mortality skyrockets. Therefore, kidney function is actually one of the strongest predictors of liver failure." },
    { question: "What is the maximum MELD score?", answer: "The maximum MELD score is 40. Patients with a score of 40 are critically ill, usually hospitalized in the ICU, and are placed at the absolute top of the national liver transplant waiting list. Without a transplant, their 90-day mortality risk exceeds 71%." },
    { question: "Why is the score automatically adjusted if I am on dialysis?", answer: "UNOS rules dictate that if a patient has undergone dialysis at least twice in the past 7 days, their Creatinine value is automatically maxed out at 4.0 in the calculation. This ensures that patients whose kidneys have completely failed (requiring machine filtration) receive the maximum possible MELD points for the kidney portion of the formula." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "MELD Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">MELD Score Calculator (UNOS 2016)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-5 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Serum Bilirubin</span>
                  <span className="text-muted-foreground font-normal">mg/dL</span>
                </label>
                <input type="number" step="0.1" value={bilirubin} onChange={e => setBilirubin(e.target.value)} className={inpCls} />
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Serum Creatinine</span>
                  <span className="text-muted-foreground font-normal">mg/dL</span>
                </label>
                <input type="number" step="0.1" value={creatinine} onChange={e => setCreatinine(e.target.value)} className={inpCls} />
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>INR (Prothrombin Time)</span>
                  <span className="text-muted-foreground font-normal">Ratio</span>
                </label>
                <input type="number" step="0.1" value={inr} onChange={e => setInr(e.target.value)} className={inpCls} />
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Serum Sodium (Na)</span>
                  <span className="text-muted-foreground font-normal">mEq/L</span>
                </label>
                <input type="number" step="1" value={sodium} onChange={e => setSodium(e.target.value)} className={inpCls} />
              </div>

              <div 
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${dialysis ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-secondary'}`}
                onClick={() => setDialysis(!dialysis)}
              >
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-semibold text-foreground leading-tight">Patient on Dialysis?</span>
                  <span className="text-xs text-muted-foreground mt-0.5">≥2 times in the past 7 days</span>
                </div>
                <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${dialysis ? 'bg-primary' : 'bg-input'}`}>
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${dialysis ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2 border-t border-border pt-4">
              <button onClick={calculate} className="w-full flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                Calculate
              </button>
              <button onClick={reset} title="Reset Patient Data" className="w-11 flex-shrink-0 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>MELD-Na Score (UNOS 2016)</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.meldNaScore}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                    <Activity className="w-8 h-8" style={{ color: result.statusColor }} />
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
                    <div className="text-2xl sm:text-3xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">90-Day Mortality Risk Profile</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Empirical 3-month mortality rates based on UNOS registry data.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number, name: string, props: any) => [`${value}%`, `MELD: ${props.payload.range}`]} 
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
            <h2 className="text-2xl font-bold mb-3">The Science of End-Stage Liver Disease</h2>
            <p>The liver is the body's primary chemical processing plant. It is responsible for filtering toxins out of the blood, manufacturing the proteins required for blood to clot, and producing bile to digest food. When a patient develops cirrhosis (severe scarring of the liver from alcohol, hepatitis, or fatty liver disease), these vital functions begin to shut down.</p>
            <p>Before the year 2002, prioritizing patients on the liver transplant waiting list was heavily subjective. Patients were ranked largely based on how long they had been waiting. Unfortunately, this meant that critically ill patients who had just been added to the list were dying before patients who were relatively stable but had been waiting longer. To fix this, the medical community adopted the <strong>MELD Score</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">Why These Four Labs?</h2>
            <p>The MELD score removes all subjectivity by relying entirely on four objective, mathematical lab values:</p>
            <ul>
              <li><strong>Bilirubin:</strong> A yellow pigment formed when old red blood cells break down. The liver is supposed to clear it. If the liver fails, bilirubin builds up, causing the patient's skin and eyes to turn yellow (jaundice). High bilirubin means the liver's filtration system is failing.</li>
              <li><strong>INR (Prothrombin Time):</strong> The liver manufactures the proteins (clotting factors) that allow blood to scab and clot. If the liver is failing, it stops making these proteins, causing the blood to become dangerously thin. INR measures how long it takes blood to clot; a high INR means the liver's manufacturing plant has shut down.</li>
              <li><strong>Creatinine:</strong> Measures kidney function. In advanced liver disease, massive pressure changes in the circulatory system essentially choke off blood flow to the kidneys (hepatorenal syndrome). When the kidneys fail secondary to the liver, mortality risk skyrockets.</li>
              <li><strong>Sodium (Na):</strong> Added to the formula by UNOS in 2016. In advanced cirrhosis, the body begins retaining massive amounts of water (ascites), which dilutes the sodium in the bloodstream (hyponatremia). Severely low sodium is a major red flag for impending mortality.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Transplant Waiting List</h2>
            <p>A patient's MELD score directly correlates to their 90-day survival probability. A patient with a MELD of 10 has a 94% chance of surviving the next three months. A patient with a MELD of 40 has less than a 29% chance. Therefore, when a donor liver becomes available in a specific region, it is offered to the compatible patient with the highest MELD score first, ensuring the sickest patients are saved.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/meld-score-calculator" />
          <PopularCalculators exclude="/calculator/meld-score-calculator" />
        </div>
      </div>
    </>
  );
}
