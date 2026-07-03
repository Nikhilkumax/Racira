"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, HeartPulse, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface ASCVDResult {
  riskPercentage: number;
  riskCategory: string;
  categoryColor: string;
  recommendation: string;
  optimalRiskPercentage: number;
  chartData: { name: string; risk: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcASCVD(
  age: number, sex: string, race: string,
  totalChol: number, hdl: number,
  sysBP: number, treatedBP: boolean,
  smoker: boolean, diabetes: boolean
): ASCVDResult {
  // 2013 ACC/AHA Pooled Cohort Equations (simplified clinical logic for 10-year risk)
  // These coefficients are standardized from the ASCVD guidelines.
  
  let lnAge = Math.log(age);
  let lnTotalChol = Math.log(totalChol);
  let lnHdl = Math.log(hdl);
  let lnSysBP = Math.log(sysBP);

  let sum = 0;
  let meanSum = 0;
  let baselineSurvival = 0;

  if (sex === "female" && race === "aa") {
    sum = 17.114 * lnAge + 0.940 * lnTotalChol - 18.920 * lnHdl + 4.475 * lnAge * lnHdl;
    if (treatedBP) sum += 29.291 * lnSysBP - 6.432 * lnAge * lnSysBP;
    else sum += 27.820 * lnSysBP - 6.087 * lnAge * lnSysBP;
    if (smoker) sum += 0.691;
    if (diabetes) sum += 0.874;
    meanSum = 86.61;
    baselineSurvival = 0.9533;
  } 
  else if (sex === "female" && race !== "aa") { // White/Other Female
    sum = -29.799 * lnAge + 4.884 * lnAge * lnAge + 13.540 * lnTotalChol - 3.114 * lnAge * lnTotalChol - 13.578 * lnHdl + 3.149 * lnAge * lnHdl;
    if (treatedBP) sum += 2.019 * lnSysBP;
    else sum += 1.957 * lnSysBP;
    if (smoker) sum += 7.574 - 1.665 * lnAge;
    if (diabetes) sum += 0.661;
    meanSum = -29.18;
    baselineSurvival = 0.9665;
  }
  else if (sex === "male" && race === "aa") {
    sum = 2.469 * lnAge + 0.302 * lnTotalChol - 0.307 * lnHdl;
    if (treatedBP) sum += 1.916 * lnSysBP;
    else sum += 1.809 * lnSysBP;
    if (smoker) sum += 0.549;
    if (diabetes) sum += 0.645;
    meanSum = 19.54;
    baselineSurvival = 0.8954;
  }
  else { // White/Other Male
    sum = 12.344 * lnAge + 11.853 * lnTotalChol - 2.664 * lnAge * lnTotalChol - 7.990 * lnHdl + 1.769 * lnAge * lnHdl;
    if (treatedBP) sum += 1.797 * lnSysBP;
    else sum += 1.764 * lnSysBP;
    if (smoker) sum += 7.837 - 1.795 * lnAge;
    if (diabetes) sum += 0.658;
    meanSum = 61.18;
    baselineSurvival = 0.9144;
  }

  const risk = 1 - Math.pow(baselineSurvival, Math.exp(sum - meanSum));
  const riskPercentage = Math.min(100, Math.max(0, risk * 100));

  // Calculate "Optimal Risk" (same age/sex/race, but optimal risk factors: BP 110 untreasted, TC 170, HDL 50, No Smoke/Diabetes)
  let optSum = 0;
  let optLnTC = Math.log(170);
  let optLnHdl = Math.log(50);
  let optLnBP = Math.log(110);

  if (sex === "female" && race === "aa") {
    optSum = 17.114 * lnAge + 0.940 * optLnTC - 18.920 * optLnHdl + 4.475 * lnAge * optLnHdl + 27.820 * optLnBP - 6.087 * lnAge * optLnBP;
  } else if (sex === "female" && race !== "aa") {
    optSum = -29.799 * lnAge + 4.884 * lnAge * lnAge + 13.540 * optLnTC - 3.114 * lnAge * optLnTC - 13.578 * optLnHdl + 3.149 * lnAge * optLnHdl + 1.957 * optLnBP;
  } else if (sex === "male" && race === "aa") {
    optSum = 2.469 * lnAge + 0.302 * optLnTC - 0.307 * optLnHdl + 1.809 * optLnBP;
  } else {
    optSum = 12.344 * lnAge + 11.853 * optLnTC - 2.664 * lnAge * optLnTC - 7.990 * optLnHdl + 1.769 * lnAge * optLnHdl + 1.764 * optLnBP;
  }
  const optRisk = 1 - Math.pow(baselineSurvival, Math.exp(optSum - meanSum));
  const optimalRiskPercentage = Math.max(0, optRisk * 100);

  // Categorize Risk
  let riskCategory = "";
  let categoryColor = "";
  let recommendation = "";

  if (riskPercentage < 5) {
    riskCategory = "Low Risk";
    categoryColor = "#22c55e"; // Green
    recommendation = "Continue your current healthy lifestyle. Ensure you maintain a healthy diet and regular physical activity.";
  } else if (riskPercentage >= 5 && riskPercentage < 7.5) {
    riskCategory = "Borderline Risk";
    categoryColor = "#eab308"; // Yellow
    recommendation = "Discuss risk-enhancing factors with your doctor. A healthy lifestyle is critical, and statin therapy may be considered if other risk factors are present.";
  } else if (riskPercentage >= 7.5 && riskPercentage < 20) {
    riskCategory = "Intermediate Risk";
    categoryColor = "#f97316"; // Orange
    recommendation = "Initiation of moderate-intensity statin therapy is generally recommended by clinical guidelines. Speak with your cardiologist or primary care physician immediately.";
  } else {
    riskCategory = "High Risk";
    categoryColor = "#ef4444"; // Red
    recommendation = "You are at a high risk for a cardiovascular event in the next 10 years. Aggressive risk reduction and high-intensity statin therapy are strongly recommended. Seek medical consultation.";
  }

  const chartData = [
    { name: "Optimal Risk", risk: Number(optimalRiskPercentage.toFixed(1)), fill: "#94a3b8" },
    { name: "Your Risk", risk: Number(riskPercentage.toFixed(1)), fill: categoryColor }
  ];

  const summaryStats = [
    { label: "Blood Pressure", value: `${sysBP} mmHg` },
    { label: "Total Cholesterol", value: `${totalChol} mg/dL` },
    { label: "Smoker Status", value: smoker ? "Current" : "Non-Smoker" },
    { label: "Diabetic Status", value: diabetes ? "Positive" : "Negative" }
  ];

  return {
    riskPercentage: Number(riskPercentage.toFixed(1)),
    riskCategory,
    categoryColor,
    recommendation,
    optimalRiskPercentage: Number(optimalRiskPercentage.toFixed(1)),
    chartData,
    summaryStats
  };
}

export default function HeartAttackRiskCalculator() {
  const [age, setAge] = useState("55");
  const [sex, setSex] = useState("male");
  const [race, setRace] = useState("white");
  const [totalChol, setTotalChol] = useState("210");
  const [hdl, setHdl] = useState("45");
  const [sysBP, setSysBP] = useState("130");
  const [treatedBP, setTreatedBP] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [diabetes, setDiabetes] = useState(false);

  const [result, setResult] = useState<ASCVDResult | null>(null);

  const calculate = () => {
    const a = parseInt(age), tc = parseInt(totalChol), h = parseInt(hdl), sbp = parseInt(sysBP);
    if (a >= 40 && a <= 79 && tc > 0 && h > 0 && sbp > 0) {
      setResult(calcASCVD(a, sex, race, tc, h, sbp, treatedBP, smoker, diabetes));
    } else if (a < 40 || a > 79) {
      alert("The ASCVD algorithm is only validated for ages 40 to 79.");
    }
  };

  useEffect(() => { setResult(calcASCVD(55, "male", "white", 210, 45, 130, false, false, false)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What does this percentage actually mean?", answer: "The resulting percentage is your absolute risk of having a 'hard' atherosclerotic cardiovascular disease (ASCVD) event in the next 10 years. A hard event is specifically defined as a non-fatal heart attack, a non-fatal stroke, or death from coronary heart disease." },
    { question: "Why is the calculator only for ages 40 to 79?", answer: "The clinical algorithms (Pooled Cohort Equations) used by the American College of Cardiology and American Heart Association were developed using massive sets of patient data exclusively from adults aged 40 to 79. Statistically, using this specific formula on a 30-year-old or an 85-year-old would produce highly inaccurate and scientifically unvalidated results." },
    { question: "Why does Race affect the calculation?", answer: "In the United States, African Americans have statistically different cardiovascular risk profiles, often exhibiting a higher risk of heart disease and stroke at the exact same blood pressure and cholesterol levels as White Americans. The American Heart Association built a separate algorithm specifically tuned for African American patients to ensure they receive properly aggressive preventative care." },
    { question: "What is 'Optimal' Risk?", answer: "Optimal risk is what your 10-year risk percentage would be if you were the exact same age, sex, and race, but possessed flawless health markers: untreated blood pressure of 110 mmHg, Total Cholesterol of 170 mg/dL, HDL of 50 mg/dL, no diabetes, and no history of smoking. It serves as a visual benchmark for how much of your current risk is controllable." },
    { question: "Does this replace my doctor?", answer: "Absolutely not. This calculator strictly provides the standard ASCVD baseline score. It does not account for family history of early heart attacks, highly sensitive C-reactive protein (hs-CRP), coronary artery calcium (CAC) scores, or triglycerides. You must discuss these results with a board-certified cardiologist or primary care physician." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Heart Attack Risk Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Heart Attack Risk Calculator (ASCVD)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age (40-79)</label>
                <div className={inp}><input type="number" min="40" max="79" value={age} onChange={e => setAge(e.target.value)} className={ci} /></div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Race / Ethnicity</label>
              <select value={race} onChange={e => setRace(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="white">White / Non-Hispanic</option>
                <option value="aa">African American</option>
                <option value="other">Other / Hispanic / Asian</option>
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">Due to statistical data limits, "Other" utilizes the White risk equations.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Total Chol.</label>
                <div className={inp}><input type="number" value={totalChol} onChange={e => setTotalChol(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">mg/dL</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">HDL Chol.</label>
                <div className={inp}><input type="number" value={hdl} onChange={e => setHdl(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">mg/dL</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Systolic Blood Pressure (Top Number)</label>
              <div className={inp}><input type="number" value={sysBP} onChange={e => setSysBP(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">mmHg</span></div>
            </div>

            <div className="border-t border-border pt-3 mt-1 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <input type="checkbox" checked={treatedBP} onChange={e => setTreatedBP(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Currently on Blood Pressure Medication</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <input type="checkbox" checked={diabetes} onChange={e => setDiabetes(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Diagnosed with Diabetes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <input type="checkbox" checked={smoker} onChange={e => setSmoker(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Current Cigarette Smoker</span>
              </label>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("55"); setSex("male"); setRace("white"); setTotalChol("210"); setHdl("45"); setSysBP("130"); setTreatedBP(false); setDiabetes(false); setSmoker(false); setResult(calcASCVD(55, "male", "white", 210, 45, 130, false, false, false)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.categoryColor}10`, borderColor: result.categoryColor }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.categoryColor }}>10-Year ASCVD Risk</div>
                    <div className="flex items-baseline gap-1">
                      <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.riskPercentage}</div>
                      <div className="text-3xl font-bold text-muted-foreground">%</div>
                    </div>
                  </div>
                  {result.riskPercentage >= 7.5 && (
                    <div className="bg-background rounded-full p-2.5 shadow-sm border border-border">
                      <AlertTriangle className="w-7 h-7" style={{ color: result.categoryColor }} />
                    </div>
                  )}
                </div>
                <div className="inline-block px-3 py-1 mt-3 text-sm font-bold uppercase tracking-widest rounded-full text-white shadow-sm" style={{ backgroundColor: result.categoryColor }}>
                  {result.riskCategory}
                </div>
                <div className="text-sm font-medium text-foreground mt-3 leading-relaxed">
                  {result.recommendation}
                </div>
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Risk Comparison</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 'dataMax + 2']} hide />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v}%`, "10-Year Risk"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="risk" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2 text-center">"Optimal Risk" reflects your identical profile if all controllable variables were perfect.</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Clinical Profile Overview</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between flex-col sm:flex-row sm:items-center border-b border-border/50 last:border-0 pb-1 sm:pb-0 sm:border-0">
                      <span className="text-xs sm:text-sm text-muted-foreground">{s.label}:</span>
                      <span className="font-semibold text-foreground text-sm">{s.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 text-center">Disclaimer: This calculator is for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult your physician regarding cardiovascular health.</p>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the 10-Year ASCVD Risk Score</h2>
            <p>Cardiovascular disease remains the leading cause of death globally. However, heart attacks and strokes rarely occur without warning. They are the climax of a slow, multi-decade process of plaque buildup in the arteries known as atherosclerosis.</p>
            <p>This <strong>Heart Attack Risk Calculator</strong> implements the exact algorithms used by the American College of Cardiology (ACC) and the American Heart Association (AHA). These algorithms, known as the <em>Pooled Cohort Equations</em>, do not guess your future; they calculate your absolute statistical probability of experiencing a "hard" atherosclerotic cardiovascular disease (ASCVD) event within the next 10 years. A "hard event" is strictly defined as a non-fatal heart attack, a non-fatal stroke, or cardiovascular death.</p>

            <h2>How to Interpret Your Risk Category</h2>
            <p>The calculation will yield a specific percentage. Clinical guidelines categorize this percentage into four tiers of risk to help doctors dictate treatment plans:</p>
            <ul>
              <li><strong>Low Risk (Less than 5%):</strong> Your 10-year risk is statistically low. The primary medical recommendation is to maintain healthy lifestyle choices (diet, exercise, stress reduction) to keep the risk low as you age.</li>
              <li><strong>Borderline Risk (5% to 7.4%):</strong> Your risk is elevating. Doctors will typically engage in a "risk discussion." If you have other risk-enhancing factors (like a strong family history of early heart disease, or chronic kidney disease), they may consider pharmacological intervention.</li>
              <li><strong>Intermediate Risk (7.5% to 19.9%):</strong> This is a critical threshold. The ACC/AHA guidelines strongly recommend the initiation of a moderate-intensity statin to lower your cholesterol, assuming the treatment is tolerated well.</li>
              <li><strong>High Risk (20% or greater):</strong> A 1 in 5 chance of suffering a heart attack or stroke in the next decade. Aggressive risk reduction is required, typically involving high-intensity statin therapy and strict blood pressure management.</li>
            </ul>

            <h2>The Science Behind the Variables</h2>
            <p>The Pooled Cohort Equations require 9 specific data points. Why are these exact variables chosen, and why are others (like weight) excluded?</p>

            <h3>Age, Sex, and Race</h3>
            <p>Age is the single strongest biological predictor of cardiovascular disease. As you age, your blood vessels naturally stiffen and accumulate microscopic damage. Biological sex is also critical; estrogen provides a protective effect for women until menopause, meaning men generally experience heart attacks at much younger ages. Race is included because massive statistical cohorts proved that African American patients face a significantly higher risk of stroke and heart failure at the exact same blood pressure levels as White patients, necessitating a specialized algorithm to ensure they receive adequately aggressive preventative care.</p>

            <h3>Cholesterol (Total and HDL)</h3>
            <p>Atherosclerosis is driven by cholesterol embedding itself in the walls of your arteries. However, not all cholesterol is bad. The algorithm requires your Total Cholesterol, but it heavily weights your High-Density Lipoprotein (HDL) cholesterol. HDL acts as the body's cardiovascular "garbage trucks," pulling dangerous plaque out of the arteries and taking it back to the liver to be destroyed. A high HDL score actually <em>reduces</em> your calculated risk percentage.</p>

            <h3>Systolic Blood Pressure</h3>
            <p>The algorithm only asks for the top number (Systolic), ignoring the bottom number (Diastolic). Why? Because systolic pressure measures the maximum force exerted against your arterial walls when the heart beats. High systolic pressure causes microscopic tears in the arteries, allowing cholesterol to burrow in and form plaque blockages. It is the most reliable blood pressure metric for predicting stroke risk.</p>

            <h3>Diabetes and Smoking</h3>
            <p>These two variables act as massive multipliers for cardiovascular risk. Cigarette smoke contains chemicals that actively strip the protective lining (endothelium) off your blood vessels, triggering immediate inflammation and clotting. Diabetes causes elevated blood sugar, which physically damages blood vessels and alters cholesterol particles, making them stickier and more atherogenic. Having diabetes effectively doubles your cardiovascular risk profile.</p>

            <h2>Why is Weight/BMI Excluded?</h2>
            <p>Patients are often confused why a Heart Attack Risk Calculator doesn't ask for their weight or Body Mass Index (BMI). In the complex statistical models used by the AHA, obesity is not an <em>independent</em> predictor of 10-year risk. Obesity causes high blood pressure, low HDL, and diabetes. Because those three specific downstream effects are already measured in the calculator, adding weight into the equation would result in "double counting" the risk and mathematically inflating the score.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heart-attack-risk-calculator" />
          <PopularCalculators exclude="/calculator/heart-attack-risk-calculator" />
        </div>
      </div>
    </>
  );
}
