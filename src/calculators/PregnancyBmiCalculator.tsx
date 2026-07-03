"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Baby, Ruler } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface PregnancyBmiInputs {
  unitSystem: "imperial" | "metric";
  weight: number; // Pre-pregnancy weight
  height: number;
}

interface PregnancyBmiResults {
  bmi: number;
  bmiCategory: string;
  minGainLbs: number;
  maxGainLbs: number;
  minGainKg: number;
  maxGainKg: number;
  
  chartData: { week: number; minLbs: number; maxLbs: number; minKg: number; maxKg: number }[];
}

// 2. Pure Calculation Function
const calculatePregnancyBmi = (inputs: PregnancyBmiInputs): PregnancyBmiResults | null => {
  const { unitSystem, weight, height } = inputs;
  
  if (weight <= 0 || height <= 0) return null;

  let wKg = weight;
  let hM = height / 100;

  if (unitSystem === "imperial") {
    wKg = weight * 0.453592;
    hM = (height * 2.54) / 100;
  }

  const bmi = wKg / (hM * hM);
  let bmiCategory = "";
  let minGainLbs = 0;
  let maxGainLbs = 0;

  // IOM (Institute of Medicine) Guidelines for Singleton Pregnancies
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    minGainLbs = 28;
    maxGainLbs = 40;
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    bmiCategory = "Normal Weight";
    minGainLbs = 25;
    maxGainLbs = 35;
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    bmiCategory = "Overweight";
    minGainLbs = 15;
    maxGainLbs = 25;
  } else {
    bmiCategory = "Obese";
    minGainLbs = 11;
    maxGainLbs = 20;
  }

  const minGainKg = minGainLbs * 0.453592;
  const maxGainKg = maxGainLbs * 0.453592;

  // Create a timeline chart over 40 weeks
  // First trimester (0-13 weeks): 1-4 lbs total gain regardless of BMI
  // Second & Third (14-40 weeks): remaining gain distributed
  const chartData = [];
  for (let w = 0; w <= 40; w += 2) {
    let currentMin = 0;
    let currentMax = 0;

    if (w <= 13) {
      // First trimester slow gain
      const trim1Max = 4;
      const trim1Min = 1;
      currentMin = (w / 13) * trim1Min;
      currentMax = (w / 13) * trim1Max;
    } else {
      // Steady gain afterwards
      const trim1Max = 4;
      const trim1Min = 1;
      const weeksLeft = 40 - 13;
      const progress = (w - 13) / weeksLeft;
      
      currentMin = trim1Min + (progress * (minGainLbs - trim1Min));
      currentMax = trim1Max + (progress * (maxGainLbs - trim1Max));
    }

    chartData.push({
      week: w,
      minLbs: parseFloat(currentMin.toFixed(1)),
      maxLbs: parseFloat(currentMax.toFixed(1)),
      minKg: parseFloat((currentMin * 0.453592).toFixed(1)),
      maxKg: parseFloat((currentMax * 0.453592).toFixed(1))
    });
  }

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    bmiCategory,
    minGainLbs,
    maxGainLbs,
    minGainKg: Math.round(minGainKg * 10) / 10,
    maxGainKg: Math.round(maxGainKg * 10) / 10,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "140",
  heightFt: "5",
  heightIn: "5",
  heightCm: "165"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, unitSystem }: any) => {
  if (active && payload && payload.length) {
    const isImperial = unitSystem === "imperial";
    const unit = isImperial ? "lbs" : "kg";
    const minKey = isImperial ? "minLbs" : "minKg";
    const maxKey = isImperial ? "maxLbs" : "maxKg";
    
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-2 text-primary">Week {payload[0].payload.week}</p>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground">Minimum Gain: <span className="font-bold text-blue-500">+{payload[0].payload[minKey]} {unit}</span></p>
          <p className="text-muted-foreground">Maximum Gain: <span className="font-bold text-pink-500">+{payload[0].payload[maxKey]} {unit}</span></p>
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

export default function PregnancyBmiCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<PregnancyBmiResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    
    let h = 0;
    if (unitSystem === "imperial") {
      const ft = parseFloat(heightFt) || 0;
      const inc = parseFloat(heightIn) || 0;
      h = (ft * 12) + inc;
    } else {
      h = parseFloat(heightCm);
    }

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid pre-pregnancy weight.");
    if (h <= 0) return setErrorMsg("Please enter a valid height.");

    const inputs: PregnancyBmiInputs = { unitSystem, weight: w, height: h };
    const res = calculatePregnancyBmi(inputs);
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setHeightCm(DEFAULTS.heightCm);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, weight, heightFt, heightIn, heightCm]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pregnancy BMI & Weight Target</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is Pre-Pregnancy BMI important?", answer: "Your pre-pregnancy Body Mass Index (BMI) is the baseline metric used by obstetricians to determine exactly how much weight you should safely gain over 40 weeks. Women with low fat reserves (low BMI) need to gain more weight to support fetal growth, while women with higher fat reserves (high BMI) should gain less weight to prevent gestational complications." },
    { question: "Do I calculate my BMI using my current pregnant weight?", answer: "No. Standard BMI formulas are not designed for pregnant bodies, as the equation cannot differentiate between maternal fat, a fetus, the placenta, and expanded blood volume. You must always calculate your Pregnancy BMI using the weight you were immediately prior to conception." },
    { question: "Why is the weight gain in the first trimester so small?", answer: "During the first 13 weeks, the embryo is extremely small, requiring very few extra calories. The Institute of Medicine (IOM) recommends gaining only 1 to 4 pounds total during the entire first trimester. Most of the maternal weight gain should occur in the second and third trimesters during the phase of rapid fetal growth." },
    { question: "What happens if I gain too much weight?", answer: "Exceeding the IOM weight gain guidelines significantly increases the risk of Gestational Diabetes, pregnancy-induced hypertension (preeclampsia), and delivering a macrosomic (excessively large) baby. Large babies often complicate vaginal deliveries, resulting in a higher rate of emergency Cesarean sections." },
    { question: "Is it safe to diet and lose weight while pregnant?", answer: "Intentional weight loss during pregnancy is heavily discouraged by the American College of Obstetricians and Gynecologists (ACOG), even for women who are obese. Dieting can lead to a deficiency in critical micronutrients needed for fetal brain development. Instead of losing weight, focus on hitting the exact, controlled weight gain target prescribed for your BMI category." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pregnancy BMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pregnancy BMI Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-pink-500/10 border-l-4 border-pink-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-pink-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-pink-800 dark:text-pink-400">
            <strong>Clinical Guidelines:</strong> This tool utilizes the official Institute of Medicine (IOM) weight gain guidelines based on pre-pregnancy BMI for singleton pregnancies. Always consult your obstetrician to establish a personalized weight gain target tailored to your specific medical history.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Ruler className="h-4 w-4" /> Pre-Conception Metrics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter your weight from <strong>immediately before you became pregnant</strong>. Standard BMI equations cannot be accurately applied to current pregnant weights.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <CompactInput id="weight" label="Pre-Pregnancy Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            {unitSystem === "imperial" ? (
              <div className="grid grid-cols-2 gap-3">
                <CompactInput id="heightFt" label="Height (Feet)" value={heightFt} onChange={setHeightFt} suffix="ft" />
                <CompactInput id="heightIn" label="Height (Inches)" value={heightIn} onChange={setHeightIn} suffix="in" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="heightCm" label="Height (cm)" value={heightCm} onChange={setHeightCm} suffix="cm" />
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
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
                
                {/* 1. Primary Result Card */}
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-pink-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-pink-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Pre-Pregnancy BMI
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-5xl font-extrabold tracking-tight">{results.bmi}</div>
                      </div>
                      <div className="text-sm font-medium text-pink-100 mt-2 bg-pink-900/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <ActivitySquare className="h-4 w-4" /> Category: {results.bmiCategory}
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[160px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-pink-100 mb-1">Recommended Total Gain</div>
                      <div className="text-2xl font-black text-white">
                        {unitSystem === "imperial" ? `+${results.minGainLbs} - ${results.maxGainLbs}` : `+${results.minGainKg} - ${results.maxGainKg}`} <span className="text-xs">{unitSystem === "imperial" ? "lbs" : "kg"}</span>
                      </div>
                    </div>
                  </div>
                  <Baby className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* 2. Progressive Gain Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <div className="w-full flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold">Gestational Weight Gain Trajectory</h3>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickCount={10} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip unitSystem={unitSystem} />} />
                        <Area type="monotone" dataKey={unitSystem === "imperial" ? "maxLbs" : "maxKg"} stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorMax)" name="Max Range" />
                        <Area type="monotone" dataKey={unitSystem === "imperial" ? "minLbs" : "minKg"} stroke="#3b82f6" strokeWidth={2} fill="none" name="Min Range" />
                        <ReferenceLine x={13} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'End Tri 1', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <ReferenceLine x={27} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'End Tri 2', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    
                    <p className="text-[10px] text-muted-foreground mt-4 text-center px-4 leading-relaxed">
                      The shaded area represents the healthy weight gain corridor for your specific starting BMI. Notice the curve remains relatively flat during the first 13 weeks, followed by a steady upward trajectory.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Ruler className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your pre-pregnancy weight and height to determine your baseline BMI and calculate your optimal gestational weight gain trajectory.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Pregnancy BMI Calculator</h2>
            <p>Weight gain during pregnancy is entirely expected, biologically necessary, and universally monitored by obstetricians. However, exactly how much weight you should safely gain depends entirely on the size of your body the day before you became pregnant. The <strong>Pregnancy BMI Calculator</strong> utilizes the official Institute of Medicine (IOM) clinical guidelines to analyze your pre-pregnancy Body Mass Index (BMI). By determining your starting body composition, the calculator provides a mathematically precise, 40-week weight gain trajectory designed to ensure maximum fetal health while minimizing maternal complications.</p>

            <h2>Why Standard BMI Calculators Fail Pregnant Women</h2>
            <p>Body Mass Index (BMI) is a simple mathematical ratio: your weight in kilograms divided by your height in meters squared. In a non-pregnant adult, this formula attempts to estimate body fat percentage. However, once you become pregnant, standard BMI calculators become completely useless and highly misleading.</p>
            <p>When you step on a scale at 30 weeks pregnant, the number you see is not just maternal fat. You are weighing:</p>
            <ul>
              <li>The fetus (average 3 to 5 pounds at this stage).</li>
              <li>The placenta (roughly 1.5 pounds).</li>
              <li>Expanded maternal blood volume (which increases by over 50%, adding roughly 4 pounds).</li>
              <li>Amniotic fluid (roughly 2 pounds).</li>
              <li>Enlarged breast tissue preparing for lactation (roughly 2 pounds).</li>
              <li>A rapidly expanding uterus (roughly 2 pounds).</li>
            </ul>
            <p>If you plug your 30-week pregnant weight into a standard BMI calculator, it will incorrectly classify you as "Obese" simply because it assumes all the added weight is adipose tissue (fat). This is why obstetricians only care about your <strong>Pre-Pregnancy BMI</strong>. Your baseline BMI dictates your fat reserves prior to conception, which dictates your clinical weight gain target.</p>

            <h2>The Institute of Medicine (IOM) Weight Gain Guidelines</h2>
            <p>In 2009, the Institute of Medicine (in conjunction with the National Research Council) overhauled the maternal weight gain guidelines based on decades of epidemiological data. The current standards are strictly tiered by pre-pregnancy BMI for singleton (one baby) pregnancies:</p>
            <ul>
              <li><strong>Underweight (BMI below 18.5):</strong> 28 to 40 pounds total gain. Women in this category lack the baseline fat reserves needed to support extreme fetal metabolic demand and must actively gain more weight.</li>
              <li><strong>Normal Weight (BMI 18.5 to 24.9):</strong> 25 to 35 pounds total gain. The standard, baseline target for optimal maternal and fetal outcomes.</li>
              <li><strong>Overweight (BMI 25.0 to 29.9):</strong> 15 to 25 pounds total gain. Because these women have adequate starting fat reserves, they can safely gain less overall weight.</li>
              <li><strong>Obese (BMI 30.0 and above):</strong> 11 to 20 pounds total gain. The most tightly restricted category, specifically designed to prevent severe gestational complications.</li>
            </ul>

            <h2>The Danger of Gaining Too Much Weight</h2>
            <p>The old adage of "eating for two" is a dangerous medical myth. A developing fetus is incredibly small and requires very few additional calories (roughly 300 extra calories a day in the second and third trimesters—the equivalent of a small sandwich). Exceeding the IOM guidelines significantly increases the risk of severe maternal and fetal complications.</p>
            <p>Excessive weight gain is heavily correlated with <strong>Gestational Diabetes Mellitus (GDM)</strong>, a condition where pregnancy hormones cause massive insulin resistance, leading to chronically high maternal blood sugar. This sugar crosses the placenta, overfeeding the fetus and leading to <strong>Macrosomia</strong> (a baby weighing over 8 pounds, 13 ounces). Macrosomic babies drastically complicate vaginal deliveries, increasing the risk of shoulder dystocia (the baby's shoulder getting stuck behind the pelvic bone), severe maternal tearing, and emergency Cesarean sections.</p>
            <p>Furthermore, excessive maternal weight gain is the leading controllable risk factor for Pregnancy-Induced Hypertension and Preeclampsia, a potentially fatal condition characterized by soaring blood pressure and organ damage.</p>

            <h2>The Danger of Inadequate Weight Gain</h2>
            <p>Conversely, failing to meet the minimum threshold of your designated weight gain category carries its own severe risks, primarily <strong>Intrauterine Growth Restriction (IUGR)</strong> and low birth weight. Babies born weighing less than 5.5 pounds are statistically far more likely to suffer from hypoglycemia, temperature regulation issues, and require extended admissions to the Neonatal Intensive Care Unit (NICU).</p>
            <p>ACOG (The American College of Obstetricians and Gynecologists) strictly forbids intentional dieting or calorie restriction during pregnancy, even for women classified as morbidly obese. Restricting food intake deprives the rapidly developing fetal brain of essential fatty acids and macronutrients. The goal is never weight loss; the goal is strictly controlled, nutrient-dense weight gain.</p>

            <h2>The First Trimester Exception</h2>
            <p>Many newly pregnant women panic when they step on the scale at week 12 and realize they haven't gained any weight—or have even lost a few pounds. This is completely normal and clinically safe.</p>
            <p>During the first trimester (weeks 1 through 13), the embryo grows from a microscopic cluster of cells to roughly the size of a plum (about 1 ounce). It requires almost zero additional maternal calories. The IOM only recommends a total gain of 1 to 4 pounds during the entire first trimester. Furthermore, severe nausea, vomiting (Hyperemesis Gravidarum), and food aversions frequently cause a slight weight loss early on. Provided the mother can stay hydrated, early weight loss is rarely detrimental to the fetus, as the body will ruthlessly pull from maternal reserves to fund embryonic development.</p>

            <h2>Tracking the Trajectory: Second and Third Trimesters</h2>
            <p>As illustrated by the Area Chart in our calculator, the weight gain curve should remain flat for the first 13 weeks, and then pitch sharply upwards into a steady, linear climb. During the second and third trimesters, women in the Normal BMI category should aim to gain approximately 1 pound per week. Women in the Overweight or Obese categories should aim for roughly 0.5 pounds per week.</p>
            <p>By monitoring your weight weekly and plotting it against your calculated trajectory, you and your obstetrician can make real-time dietary adjustments. If your weight spikes by 5 pounds in a single week, your doctor will immediately check for sudden fluid retention (edema)—a massive red flag for preeclampsia. If your weight stalls for three consecutive weeks in the third trimester, your doctor may order a growth ultrasound to ensure the placenta is still functioning properly. By knowing your precise, BMI-driven targets, you transform a simple scale into a powerful diagnostic tool for fetal health.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy-bmi-calculator" />
          <PopularCalculators exclude="/calculator/pregnancy-bmi-calculator" />
        </div>
      </div>
    </>
  );
}
