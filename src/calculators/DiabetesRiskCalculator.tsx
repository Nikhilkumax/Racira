"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Activity, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DiabetesRiskResult {
  totalScore: number;
  riskCategory: string;
  categoryColor: string;
  recommendation: string;
  bmi: number;
  chartData: { name: string; points: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDiabetesRisk(
  age: number, sex: string,
  gestationalDb: boolean,
  familyHistory: boolean,
  highBp: boolean,
  active: boolean,
  heightInches: number, weightLbs: number
): DiabetesRiskResult {
  let score = 0;
  const chartData = [];

  // 1. Age
  let agePoints = 0;
  if (age >= 40 && age <= 49) agePoints = 1;
  else if (age >= 50 && age <= 59) agePoints = 2;
  else if (age >= 60) agePoints = 3;
  score += agePoints;
  if (agePoints > 0) chartData.push({ name: "Age", points: agePoints, fill: "#e2e8f0" });

  // 2. Sex & Gestational
  let sexPoints = 0;
  if (sex === "male") {
    sexPoints = 1;
    score += sexPoints;
    chartData.push({ name: "Biological Sex", points: sexPoints, fill: "#cbd5e1" });
  } else if (sex === "female" && gestationalDb) {
    sexPoints = 1;
    score += sexPoints;
    chartData.push({ name: "Gestational DB", points: sexPoints, fill: "#f87171" });
  }

  // 3. Family History
  if (familyHistory) {
    score += 1;
    chartData.push({ name: "Family History", points: 1, fill: "#fca5a5" });
  }

  // 4. High Blood Pressure
  if (highBp) {
    score += 1;
    chartData.push({ name: "High BP", points: 1, fill: "#ef4444" });
  }

  // 5. Physical Activity
  if (!active) {
    score += 1;
    chartData.push({ name: "Inactivity", points: 1, fill: "#f59e0b" });
  }

  // 6. BMI Weight Status
  let bmiPoints = 0;
  let bmi = 0;
  if (heightInches > 0 && weightLbs > 0) {
    bmi = (weightLbs / (heightInches * heightInches)) * 703;
    if (bmi >= 25 && bmi < 30) bmiPoints = 1;
    else if (bmi >= 30 && bmi < 40) bmiPoints = 2;
    else if (bmi >= 40) bmiPoints = 3;
  }
  score += bmiPoints;
  if (bmiPoints > 0) chartData.push({ name: "Weight (BMI)", points: bmiPoints, fill: "#3b82f6" });

  // Sort chart data so biggest contributors are at the bottom (for vertical layout) or left (for horizontal)
  chartData.sort((a, b) => b.points - a.points);

  let riskCategory = "";
  let categoryColor = "";
  let recommendation = "";

  if (score < 5) {
    riskCategory = "Low Risk";
    categoryColor = "#22c55e"; // Green
    recommendation = "Your score is below 5, indicating a lower risk of undiagnosed Type 2 Diabetes. Continue maintaining a healthy lifestyle, diet, and physical activity.";
  } else {
    riskCategory = "High Risk";
    categoryColor = "#ef4444"; // Red
    recommendation = "Your score is 5 or higher. You are at increased risk for having undiagnosed Type 2 Diabetes. The ADA strongly recommends you see your doctor for a formal blood test (A1C or Fasting Plasma Glucose).";
  }

  const summaryStats = [
    { label: "Calculated BMI", value: bmi.toFixed(1) },
    { label: "BMI Category", value: bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese" },
    { label: "Total Risk Factors", value: `${chartData.length} identified` }
  ];

  return {
    totalScore: score,
    riskCategory,
    categoryColor,
    recommendation,
    bmi: Number(bmi.toFixed(1)),
    chartData,
    summaryStats
  };
}

export default function DiabetesRiskCalculator() {
  const [age, setAge] = useState("45");
  const [sex, setSex] = useState("male");
  const [gestationalDb, setGestationalDb] = useState(false);
  const [familyHistory, setFamilyHistory] = useState(false);
  const [highBp, setHighBp] = useState(false);
  const [active, setActive] = useState(true);
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [weight, setWeight] = useState("190");

  const [result, setResult] = useState<DiabetesRiskResult | null>(null);

  const calculate = () => {
    const a = parseInt(age), f = parseInt(feet) || 0, i = parseInt(inches) || 0, w = parseInt(weight);
    const totalInches = (f * 12) + i;
    if (a >= 0 && totalInches > 0 && w > 0) {
      setResult(calcDiabetesRisk(a, sex, gestationalDb, familyHistory, highBp, active, totalInches, w));
    }
  };

  useEffect(() => { setResult(calcDiabetesRisk(45, "male", false, false, false, true, 70, 190)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is this score based on?", answer: "This calculator implements the official American Diabetes Association (ADA) Type 2 Diabetes Risk Test. It assigns specific point values to 7 scientifically validated risk factors to determine if you should seek formal clinical testing." },
    { question: "Does a high score mean I have diabetes?", answer: "No. A score of 5 or higher simply means you are at a statistically higher risk of currently having undiagnosed prediabetes or Type 2 Diabetes. Only a doctor can diagnose diabetes using a formal blood test, such as a Hemoglobin A1C test or a Fasting Plasma Glucose test." },
    { question: "Why does biological sex affect the score?", answer: "The ADA algorithm assigns 1 point to biological males. Statistically, men are at a slightly higher risk of developing Type 2 Diabetes at lower weight thresholds than women, primarily because men tend to store fat viscerally (around the internal organs in the abdomen), which is highly linked to insulin resistance." },
    { question: "Can I reverse my risk score?", answer: "Yes! Many of the points in this calculation are controllable. If you are inactive (1 point) and overweight (1-3 points), simply starting a walking routine and losing a small percentage of your body weight can immediately drop your score from 'High Risk' back into the 'Low Risk' category." },
    { question: "Does this apply to Type 1 Diabetes?", answer: "No. This assessment is exclusively for Type 2 Diabetes, which is heavily linked to metabolic syndrome, insulin resistance, and lifestyle factors. Type 1 Diabetes is an autoimmune disease where the pancreas completely stops producing insulin, and it cannot be predicted or prevented using these metrics." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Diabetes Risk Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Type 2 Diabetes Risk Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" min="18" max="120" value={age} onChange={e => setAge(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Feet)</label>
                <div className={inp}><input type="number" value={feet} onChange={e => setFeet(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Inches)</label>
                <div className={inp}><input type="number" value={inches} onChange={e => setInches(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Current Weight</label>
              <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">lbs</span></div>
            </div>

            <div className="border-t border-border pt-4 mt-1 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Medical & Lifestyle History</p>
              
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <input type="checkbox" checked={familyHistory} onChange={e => setFamilyHistory(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Mother, father, sister, or brother with diabetes?</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <input type="checkbox" checked={highBp} onChange={e => setHighBp(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Ever been diagnosed with high blood pressure?</span>
              </label>

              {sex === "female" && (
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                  <input type="checkbox" checked={gestationalDb} onChange={e => setGestationalDb(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                  <span className="text-sm font-medium">Ever diagnosed with gestational diabetes?</span>
                </label>
              )}

              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Physically active (exercise) during the week?</span>
              </label>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Activity className="h-4 w-4" /> Calculate Risk Score
              </button>
              <button onClick={() => { setAge("45"); setSex("male"); setGestationalDb(false); setFamilyHistory(false); setHighBp(false); setActive(true); setFeet("5"); setInches("10"); setWeight("190"); setResult(calcDiabetesRisk(45, "male", false, false, false, true, 70, 190)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.categoryColor}10`, borderColor: result.categoryColor }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.categoryColor }}>ADA Risk Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.totalScore}</div>
                      <div className="text-xl font-bold text-muted-foreground">/ 10 points</div>
                    </div>
                  </div>
                  {result.totalScore >= 5 && (
                    <div className="bg-background rounded-full p-2 shadow-sm border border-border">
                      <AlertTriangle className="w-6 h-6" style={{ color: result.categoryColor }} />
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

              {result.chartData.length > 0 ? (
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-bold mb-4">What is Driving Your Score?</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 3]} hide />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} points`, "Score contribution"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="points" radius={[0, 4, 4, 0]} maxBarSize={20}>
                        {result.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-muted-foreground mt-2">A breakdown of the specific risk factors contributing to your total point calculation.</p>
                </div>
              ) : (
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex items-center justify-center h-[160px]">
                  <p className="text-sm text-muted-foreground font-medium">No risk factors identified.</p>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className={`text-center ${i === 0 ? "border-r border-border/50" : ""}`}>
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className="text-sm font-bold text-foreground">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Silent Epidemic: Undiagnosed Diabetes</h2>
            <p>According to the CDC, over 37 million Americans have diabetes, but an estimated <strong>1 in 5 do not know they have it</strong>. Even more alarming, over 96 million adults have <em>prediabetes</em>, a condition where blood sugar is chronically elevated but not yet high enough for a formal diabetes diagnosis. More than 80% of those people are completely unaware.</p>
            <p>Type 2 diabetes is often called a "silent disease" because the early symptoms (fatigue, increased thirst, frequent urination) are mild and easily dismissed. Unfortunately, while it remains undiagnosed, chronically high blood sugar slowly causes irreversible microscopic damage to your blood vessels, kidneys, retinas, and nerves. This is why screening is absolutely critical.</p>

            <h2>The Science Behind the ADA Risk Score</h2>
            <p>This <strong>Diabetes Risk Calculator</strong> implements the official scoring system developed by the American Diabetes Association (ADA). It uses 7 scientifically validated variables to assess your statistical risk. If your score reaches <strong>5 points or higher</strong>, it is a clinical indicator that you need formal blood testing. Here is why the algorithm weights these specific factors:</p>

            <h3>1. Body Mass Index (BMI)</h3>
            <p>Your weight relative to your height is the single largest controllable risk factor for Type 2 Diabetes. Excess body fat, particularly visceral fat stored around the organs in the abdomen, actively releases inflammatory chemicals that block insulin from doing its job. This is called insulin resistance. The heavier a patient is, the more resistant their cells become, forcing the pancreas into overdrive until it eventually fails. The ADA assigns up to 3 points for severe obesity.</p>

            <h3>2. Age and Family History</h3>
            <p>As you age, the pancreas naturally becomes less efficient at producing insulin, which is why the algorithm assigns points incrementally as you cross the ages of 40, 50, and 60. Furthermore, Type 2 diabetes has a massive genetic component. If a primary blood relative (mother, father, brother, sister) has the disease, your risk effectively doubles.</p>

            <h3>3. Biological Sex and Gestational Diabetes</h3>
            <p>Biological males receive an automatic 1-point penalty in the ADA algorithm. Statistically, men are more prone to developing diabetes at lower BMI thresholds than women because men genetically tend to store fat viscerally (the "beer belly"), whereas pre-menopausal women tend to store fat subcutaneously (under the skin on the hips and thighs), which is metabolically less dangerous. However, females who have previously developed <em>gestational diabetes</em> during a pregnancy have a highly elevated risk of developing full Type 2 diabetes later in life, and receive 1 point.</p>

            <h3>4. High Blood Pressure and Inactivity</h3>
            <p>Hypertension (high blood pressure) is incredibly common in prediabetic patients because the two conditions share the same root cause: metabolic syndrome. If you have been diagnosed with high blood pressure, you receive 1 point. Additionally, physical activity is one of the only ways to force your muscles to absorb glucose from the blood <em>without</em> needing insulin. A sedentary lifestyle (receiving 1 point) robs your body of this natural blood sugar control mechanism.</p>

            <h2>What to do if your score is 5 or Higher</h2>
            <p>Do not panic. A high score is not a diagnosis; it is simply a statistical flag indicating that you need data. Your immediate next step should be scheduling an appointment with your primary care physician to request a simple blood test.</p>
            <ul>
              <li><strong>Hemoglobin A1C:</strong> This test measures the percentage of your red blood cells that have sugar attached to them. It provides a highly accurate 3-month average of your blood sugar levels. An A1C of 5.7% to 6.4% indicates prediabetes, while 6.5% or higher indicates diabetes.</li>
              <li><strong>Fasting Plasma Glucose (FPG):</strong> A simple blood draw taken after you have fasted for 8 hours. A level of 100 to 125 mg/dL indicates prediabetes, while 126 mg/dL or higher indicates diabetes.</li>
            </ul>
            <p>If you discover you have prediabetes, the condition is highly reversible. Losing just 5% to 7% of your body weight and engaging in 150 minutes of brisk walking per week can cut your risk of developing full Type 2 Diabetes by nearly 60%.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/diabetes-risk-calculator" />
          <PopularCalculators exclude="/calculator/diabetes-risk-calculator" />
        </div>
      </div>
    </>
  );
}
