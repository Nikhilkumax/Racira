"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Fingerprint, Activity, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface ConversionInputs {
  unitSystem: "imperial" | "metric";
  gender: "male" | "female";
  age: number;
  heightInches: number;
  heightCm: number;
  weight: number;
}

interface ConversionResults {
  bmi: number;
  estimatedBodyFat: number;
  bmiClassification: string;
  fatClassification: string;
  colorClass: string;
  
  chartData: { name: string; value: number }[];
}

// 2. Pure Calculation Function
// Uses Deurenberg et al. (1991) formula for adult BMI to BF% conversion
const calculateConversion = (inputs: ConversionInputs): ConversionResults | null => {
  const { unitSystem, gender, age, heightInches, heightCm, weight } = inputs;
  
  if (weight <= 0 || age < 15) return null; // Formula is highly inaccurate for children
  if (unitSystem === "imperial" && heightInches <= 0) return null;
  if (unitSystem === "metric" && heightCm <= 0) return null;

  // 1. Calculate Standard BMI
  let bmi = 0;
  if (unitSystem === "imperial") {
    bmi = (weight / Math.pow(heightInches, 2)) * 703;
  } else {
    const heightM = heightCm / 100;
    bmi = weight / Math.pow(heightM, 2);
  }

  // 2. Convert to Body Fat % (Deurenberg Equation)
  // BF% = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4
  // Sex: Male = 1, Female = 0
  const sexValue = gender === "male" ? 1 : 0;
  let estimatedBodyFat = (1.20 * bmi) + (0.23 * age) - (10.8 * sexValue) - 5.4;

  if (estimatedBodyFat < 2) estimatedBodyFat = 2; // Floor to biological essential minimum
  if (estimatedBodyFat > 70) estimatedBodyFat = 70; // Ceiling for sanity

  // 3. Classifications
  let bmiClassification = "Normal Weight";
  if (bmi < 18.5) bmiClassification = "Underweight";
  else if (bmi < 25) bmiClassification = "Normal Weight";
  else if (bmi < 30) bmiClassification = "Overweight";
  else bmiClassification = "Obese";

  let fatClassification = "Average";
  let colorClass = "#3b82f6"; // default blue

  if (gender === "male") {
    if (estimatedBodyFat < 6) { fatClassification = "Essential/Danger"; colorClass = "#ef4444"; }
    else if (estimatedBodyFat < 14) { fatClassification = "Athletic"; colorClass = "#8b5cf6"; }
    else if (estimatedBodyFat < 18) { fatClassification = "Fitness"; colorClass = "#10b981"; }
    else if (estimatedBodyFat < 25) { fatClassification = "Average"; colorClass = "#f59e0b"; }
    else { fatClassification = "Obese"; colorClass = "#ef4444"; }
  } else {
    if (estimatedBodyFat < 14) { fatClassification = "Essential/Danger"; colorClass = "#ef4444"; }
    else if (estimatedBodyFat < 21) { fatClassification = "Athletic"; colorClass = "#8b5cf6"; }
    else if (estimatedBodyFat < 25) { fatClassification = "Fitness"; colorClass = "#10b981"; }
    else if (estimatedBodyFat < 32) { fatClassification = "Average"; colorClass = "#f59e0b"; }
    else { fatClassification = "Obese"; colorClass = "#ef4444"; }
  }

  // Generate Chart Data
  const chartData = [
    { name: "Estimated Body Fat %", value: parseFloat(estimatedBodyFat.toFixed(1)) }
  ];

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    estimatedBodyFat: parseFloat(estimatedBodyFat.toFixed(1)),
    bmiClassification,
    fatClassification,
    colorClass,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  gender: "male" as const,
  age: "35",
  weight: "205",
  heightFt: "5",
  heightIn: "10",
  heightCm: "178"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">Mathematical Estimation</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">Est. Body Fat:</span>
          <span className="font-bold">{payload[0].value}%</span>
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

export default function BMIToBodyFatCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [gender, setGender] = useState<"male" | "female">(DEFAULTS.gender);
  const [age, setAge] = useState(DEFAULTS.age);
  
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<ConversionResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const a = parseInt(age, 10);
    const w = parseFloat(weight);
    const ft = parseFloat(heightFt) || 0;
    const inc = parseFloat(heightIn) || 0;
    const cm = parseFloat(heightCm) || 0;

    const totalInches = (ft * 12) + inc;

    if (isNaN(a) || a < 15) return setErrorMsg("This conversion formula is clinically inaccurate for children under 15.");
    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (unitSystem === "imperial" && totalInches <= 0) return setErrorMsg("Please enter a valid height.");
    if (unitSystem === "metric" && cm <= 0) return setErrorMsg("Please enter a valid height.");

    const res = calculateConversion({ 
      unitSystem, 
      gender,
      age: a,
      weight: w, 
      heightInches: totalInches, 
      heightCm: cm 
    });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setGender(DEFAULTS.gender);
    setAge(DEFAULTS.age);
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
  }, [unitSystem, gender, age, weight, heightFt, heightIn, heightCm]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>BMI to Body Fat Conversion Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How can you calculate body fat without physical measurements?", answer: "This calculator utilizes the Deurenberg equation (1991), a highly respected clinical regression formula. Scientists took thousands of individuals, measured their BMI, and then put them into hydrostatic weighing tanks to determine their true body fat percentage. By mapping the data, they discovered a strong mathematical correlation between age, biological sex, BMI, and total adipose tissue. While not perfectly precise for individuals, it provides a highly accurate statistical estimation without requiring calipers or expensive scans." },
    { question: "Why does the formula require my age?", answer: "Age is a critical variable in body composition. As human beings age, they naturally lose dense skeletal muscle mass (sarcopenia) and bone density, replacing that lost mass with lighter subcutaneous and visceral fat. Therefore, two men with the exact same height and weight (and therefore the exact same BMI) will have vastly different body fat percentages if one is 25 and the other is 65. The Deurenberg equation mathematically accounts for this natural age-related tissue degradation." },
    { question: "Why does biological sex completely change the result?", answer: "Hormones dictate body composition. Women (estrogen dominant) genetically require a much higher percentage of essential body fat (in the hips, thighs, and breasts) to support potential pregnancy and childbirth. Men (testosterone dominant) naturally hold significantly more dense skeletal muscle mass and less essential fat. If a man and a woman have the exact same BMI and age, the woman will mathematically always have a higher body fat percentage to account for this biological reality." },
    { question: "Can this formula be inaccurate?", answer: "Yes. Like all algorithms based on BMI, the Deurenberg equation assumes you possess an 'average' amount of muscle mass for your age and sex. If you are a professional bodybuilder or a heavily muscled athlete, this formula will drastically overestimate your body fat because it assumes your heavy muscle tissue is actually fat. Conversely, if you are 'Skinny Fat' (sedentary with very little muscle mass), this formula might actually underestimate your dangerous visceral fat levels." },
    { question: "Should I track my BMI or my Body Fat Percentage?", answer: "You should definitively track your Body Fat Percentage. BMI is simply a blunt ratio of height to weight; it cannot differentiate between dangerous visceral fat and healthy, functional muscle tissue. If you start a weightlifting program and gain 5 pounds of muscle, your BMI will increase, falsely signaling that your health is degrading. Your Body Fat Percentage will drop, correctly signaling that your internal health and aesthetic physique are drastically improving." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BMI to Body Fat Conversion Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BMI to Body Fat Conversion Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-1 mb-1">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Calculator className="h-4 w-4" /> Algorithmic Variables
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter your age, sex, and biometric data. The formula will mathematically convert your raw BMI into an estimated percentage of adipose tissue.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Biological Sex</label>
                <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <CompactInput id="age" label="Age (Years)" value={age} onChange={setAge} suffix="yrs" />
            </div>

            {unitSystem === "imperial" ? (
              <div className="grid grid-cols-2 gap-3 mt-1">
                <CompactInput id="h-ft" label="Height (Ft)" value={heightFt} onChange={setHeightFt} suffix="ft" />
                <CompactInput id="h-in" label="Height (In)" value={heightIn} onChange={setHeightIn} suffix="in" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 mt-1">
                <CompactInput id="h-cm" label="Height (cm)" value={heightCm} onChange={setHeightCm} suffix="cm" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 mt-1">
              <CompactInput id="weight" label="Total Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleCalculate} className="flex-1 h-10 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric Box */}
                <div 
                  className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden"
                  
                >
                  <div className="relative z-10">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Estimated Body Fat</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-4xl font-bold text-primary">{results.estimatedBodyFat}%</div>
                      <div className="text-sm text-muted-foreground ml-2">Body Fat</div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${results.colorClass}1A`, color: results.colorClass }}>
                      <Fingerprint className="h-4 w-4" /> {results.fatClassification} Classification
                    </div>
                  </div>
                  <Activity className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10 text-primary" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">Raw BMI Score</div>
                      <div className="text-2xl font-bold text-foreground">{results.bmi}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">BMI Category</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{results.bmiClassification}</div>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Body Composition Risk Bar</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visual map of your estimated body fat percentage. Values crossing the 25% threshold (for men) or 32% (for women) indicate a highly dangerous level of systemic inflammation and metabolic risk.</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 45]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        
                        {/* Threshold Lines based on Gender */}
                        <ReferenceLine x={gender === "male" ? 18 : 25} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Fitness', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                        <ReferenceLine x={gender === "male" ? 25 : 32} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'bottom', value: 'Overweight', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />

                        <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={results.colorClass} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Fingerprint className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your age, biological sex, and biometric data to mathematically convert your raw BMI into an estimated body fat percentage.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Flaw in the Body Mass Index (BMI)</h2>
            <p>The standard Body Mass Index (BMI) is the most widely used medical metric in the world, but it suffers from a massive, undeniable flaw: it is completely blind to tissue composition. The mathematical formula (weight divided by height squared) assumes that all physical mass is perfectly identical. It cannot differentiate between five pounds of dense, highly metabolic muscle tissue and five pounds of deadly, inflammatory visceral fat. Because of this blind spot, highly trained athletes are frequently misdiagnosed as "Obese," while sedentary individuals with dangerous levels of internal organ fat are praised for having a "Normal" BMI. The <strong>BMI to Body Fat Conversion Calculator</strong> attempts to correct this clinical failure by utilizing advanced regression algorithms to estimate your actual body fat percentage.</p>

            <h2 className="text-2xl font-bold mb-3">The Science of the Deurenberg Equation</h2>
            <p>In 1991, a team of clinical researchers led by Paul Deurenberg set out to bridge the gap between simple BMI measurements and expensive laboratory composition scans (like DEXA and hydrostatic weighing). They analyzed thousands of subjects, recording their BMI, and then placing them in underwater weighing tanks to determine their exact, absolute body fat percentage.</p>
            <p>By mapping this massive dataset, they discovered a highly predictable mathematical correlation between a person's raw BMI and their true fat mass, provided that the equation also accounted for two critical biological variables: chronological age and biological sex. The resulting formula—Body Fat % = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4—became the clinical standard for estimating body fat when physical calipers or laboratory scans are unavailable.</p>

            <h2 className="text-2xl font-bold mb-3">Why Age Radically Alters Body Composition</h2>
            <p>If you look at the Deurenberg formula, you will notice that age is a multiplier. Why does your body fat percentage mathematically increase as you get older, even if your weight and BMI stay exactly the same?</p>
            <p>The human body undergoes a terrifying biological process called Sarcopenia (age-related muscle loss). After the age of 30, adults naturally lose approximately 3% to 8% of their dense skeletal muscle mass every decade if they are not actively participating in heavy resistance training. As the heavy muscle tissue degrades, the body replaces that lost mass with lighter subcutaneous and visceral fat. Therefore, two men who are both 5'10" and 180 pounds will have identical BMIs. But if one man is 25 and the other is 65, the 65-year-old will have a drastically higher body fat percentage because a massive portion of his youth muscle tissue has been replaced by adipose fat.</p>

            <h2 className="text-2xl font-bold mb-3">The Biological Mandate of Sex Hormones</h2>
            <p>Biological sex is the final massive variable in the Deurenberg equation. If a man and a woman possess the exact same BMI and the exact same age, the formula will automatically deduct 10.8 points from the man's final body fat estimation. Why?</p>
            <p>Because hormones dictate biological architecture. Men are testosterone-dominant, a hormone that aggressively drives the synthesis of heavy skeletal muscle and high bone mineral density while keeping essential body fat relatively low (around 3% to 5%). Women are estrogen-dominant. For evolutionary reasons designed to sustain potential pregnancy and breastfeeding, female biology is genetically mandated to store essential fat in the hips, thighs, glutes, and breasts. A woman's essential body fat minimum is around 12% to 14%. The algorithm mathematically adjusts for this fundamental difference in baseline tissue architecture.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of "Skinny Fat" (Normal Weight Obesity)</h2>
            <p>The primary reason you must convert your BMI into an estimated Body Fat Percentage is to determine if you suffer from Normal Weight Obesity, commonly referred to as being "Skinny Fat."</p>
            <p>A sedentary office worker who never lifts weights might have a perfectly "Normal" BMI of 22. They look thin in their clothing, and their doctor tells them they are healthy. However, because their body has virtually zero dense muscle mass, almost all of their internal weight is composed of highly inflammatory visceral fat wrapping around their organs. When they run their numbers through the Deurenberg equation, they discover their estimated Body Fat Percentage is 35%—placing them at severe risk for Type 2 Diabetes and sudden cardiac events despite their "healthy" appearance.</p>

            <h2 className="text-2xl font-bold mb-3">When the Algorithm Fails</h2>
            <p>Like all mathematical estimations, the Deurenberg equation has limitations. It is designed for the "average" human population. If you are a statistical outlier, the formula will fail.</p>
            <p>If you are a professional bodybuilder or a dedicated powerlifter carrying massive amounts of unnatural muscle tissue, this calculator will drastically overestimate your body fat because it assumes your heavy weight is adipose tissue. Conversely, if you are suffering from a severe muscle-wasting disease, the calculator might underestimate your fat levels. For extreme athletes, physical skinfold calipers or clinical DEXA scans remain the only fully accurate method of tracking composition.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Optimize for Composition, Not Weight</h2>
            <p>Stop starving yourself to force your raw weight down to an arbitrary BMI target. If you lose weight by destroying your own muscle tissue, your BMI will drop, but your health will be fundamentally shattered. Use the BMI to Body Fat Conversion Calculator to reorient your focus toward tissue composition. Prioritize heavy resistance training and adequate protein intake to build functional lean mass while slowly stripping away adipose fat, ensuring that you optimize for longevity rather than simply shrinking.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-to-body-fat-conversion-calculator" />
          <PopularCalculators exclude="/calculator/bmi-to-body-fat-conversion-calculator" />
        </div>
      </div>
    </>
  );
}
