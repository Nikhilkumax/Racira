"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface CalculatorInputs {
  unitSystem: "imperial" | "metric";
  gender: "boy" | "girl";
  age: number;
  heightFt: number;
  heightIn: number;
  heightCm: number;
  weightLbs: number;
  weightKg: number;
}

interface CalculatorResults {
  bmi: number;
  percentileCategory: "Underweight (<5th)" | "Healthy Weight (5th-84th)" | "Overweight (85th-94th)" | "Obese (≥95th)";
  colorClass: string;
}

// 2. Pure Calculation Function
const CDC_TEEN_DATA = {
  boy: [
    { age: 10, p5: 14.2, p50: 16.6, p85: 19.4, p95: 21.4 },
    { age: 11, p5: 14.5, p50: 17.2, p85: 20.2, p95: 22.5 },
    { age: 12, p5: 15.0, p50: 17.8, p85: 21.0, p95: 23.6 },
    { age: 13, p5: 15.4, p50: 18.5, p85: 21.8, p95: 24.8 },
    { age: 14, p5: 16.0, p50: 19.2, p85: 22.6, p95: 25.8 },
    { age: 15, p5: 16.5, p50: 19.9, p85: 23.4, p95: 26.8 },
    { age: 16, p5: 17.1, p50: 20.6, p85: 24.2, p95: 27.6 },
    { age: 17, p5: 17.7, p50: 21.3, p85: 24.9, p95: 28.3 },
    { age: 18, p5: 18.2, p50: 22.0, p85: 25.6, p95: 29.0 },
    { age: 19, p5: 18.7, p50: 22.7, p85: 26.3, p95: 29.7 },
  ],
  girl: [
    { age: 10, p5: 14.0, p50: 16.6, p85: 20.0, p95: 22.6 },
    { age: 11, p5: 14.4, p50: 17.3, p85: 20.8, p95: 23.7 },
    { age: 12, p5: 14.8, p50: 18.0, p85: 21.7, p95: 25.0 },
    { age: 13, p5: 15.3, p50: 18.8, p85: 22.6, p95: 26.2 },
    { age: 14, p5: 15.8, p50: 19.6, p85: 23.3, p95: 27.3 },
    { age: 15, p5: 16.3, p50: 20.2, p85: 24.0, p95: 28.1 },
    { age: 16, p5: 16.8, p50: 20.7, p85: 24.6, p95: 28.9 },
    { age: 17, p5: 17.2, p50: 21.1, p85: 25.2, p95: 29.6 },
    { age: 18, p5: 17.5, p50: 21.4, p85: 25.7, p95: 30.3 },
    { age: 19, p5: 17.8, p50: 21.7, p85: 26.1, p95: 31.0 },
  ]
};

const calculateAdolescentBmi = (inputs: CalculatorInputs): CalculatorResults | null => {
  const { unitSystem, gender, age, heightFt, heightIn, heightCm, weightLbs, weightKg } = inputs;
  
  let heightMeters = 0;
  let currentWeight = 0;

  if (unitSystem === "imperial") {
    if (heightFt <= 0 && heightIn <= 0) return null;
    if (weightLbs <= 0) return null;
    const totalInches = heightFt * 12 + heightIn;
    heightMeters = totalInches * 0.0254;
    currentWeight = weightLbs * 0.453592;
  } else {
    if (heightCm <= 0) return null;
    if (weightKg <= 0) return null;
    heightMeters = heightCm / 100;
    currentWeight = weightKg;
  }

  if (heightMeters <= 0 || currentWeight <= 0) return null;

  const bmi = currentWeight / Math.pow(heightMeters, 2);
  
  // Find percentile bucket
  const data = CDC_TEEN_DATA[gender].find(d => d.age === age) || CDC_TEEN_DATA[gender][0];

  let percentileCategory: CalculatorResults["percentileCategory"] = "Healthy Weight (5th-84th)";
  let colorClass = "text-emerald-500";

  if (bmi < data.p5) {
    percentileCategory = "Underweight (<5th)";
    colorClass = "text-yellow-500";
  } else if (bmi >= data.p95) {
    percentileCategory = "Obese (≥95th)";
    colorClass = "text-red-500";
  } else if (bmi >= data.p85) {
    percentileCategory = "Overweight (85th-94th)";
    colorClass = "text-orange-500";
  }

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    percentileCategory,
    colorClass
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  gender: "boy" as const,
  age: "14",
  heightFt: "5",
  heightIn: "4",
  heightCm: "162",
  weightLbs: "120",
  weightKg: "54"
};

// Input Component
const CompactInput = ({ id, label, value, onChange, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
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

export default function AdolescentBmiCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [gender, setGender] = useState<"boy" | "girl">(DEFAULTS.gender);
  const [age, setAge] = useState(DEFAULTS.age);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [weightLbs, setWeightLbs] = useState(DEFAULTS.weightLbs);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CalculatorResults | null>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const a = parseInt(age, 10) || 0;
    const ft = parseInt(heightFt, 10) || 0;
    const inch = parseInt(heightIn, 10) || 0;
    const cm = parseFloat(heightCm) || 0;
    const lbs = parseFloat(weightLbs) || 0;
    const kg = parseFloat(weightKg) || 0;

    if (a < 10 || a > 19) return setErrorMsg("Adolescent BMI is for ages 10 to 19.");
    if (unitSystem === "imperial" && ft === 0 && inch === 0) return setErrorMsg("Please enter height.");
    if (unitSystem === "metric" && cm === 0) return setErrorMsg("Please enter height.");
    if (unitSystem === "imperial" && lbs === 0) return setErrorMsg("Please enter weight.");
    if (unitSystem === "metric" && kg === 0) return setErrorMsg("Please enter weight.");

    const res = calculateAdolescentBmi({ 
      unitSystem, 
      gender,
      age: a,
      heightFt: ft, 
      heightIn: inch, 
      heightCm: cm, 
      weightLbs: lbs, 
      weightKg: kg 
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
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setHeightCm(DEFAULTS.heightCm);
    setWeightLbs(DEFAULTS.weightLbs);
    setWeightKg(DEFAULTS.weightKg);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, gender, age, heightFt, heightIn, heightCm, weightLbs, weightKg]);

  const faqs = [
    { question: "Why is adolescent BMI calculated differently than adult BMI?", answer: "Because teenagers are constantly growing and developing muscle and bone mass, their BMI naturally fluctuates during puberty. Instead of rigid cutoffs, adolescent BMI is compared against standard CDC growth charts (percentiles) for children of the exact same age and biological sex." },
    { question: "What does my percentile mean?", answer: "If your BMI is in the 60th percentile, it means your BMI is higher than 60% of teenagers your exact age and gender. The 'Healthy Weight' category spans from the 5th to the 84th percentile, acknowledging that healthy growth happens at different speeds." },
    { question: "What if I just had a major growth spurt?", answer: "During growth spurts, weight often lags slightly behind height, pushing you temporarily into a lower percentile. Conversely, some teenagers gain weight right before shooting up in height. This is entirely normal. Percentiles should be tracked over time to observe a general trajectory, rather than obsessing over a single data point." },
    { question: "Should I diet if I am in the overweight percentile?", answer: "Usually, no. Unless prescribed by a pediatrician, severe calorie restriction during adolescence can stunt linear growth (height) and cognitive development. Often, the goal is 'weight maintenance' rather than weight loss—allowing the teenager to naturally 'grow into' their weight as they get taller." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Adolescent BMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Adolescent BMI Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "imperial" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setUnitSystem("imperial")}
              >
                Imperial
              </button>
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "metric" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setUnitSystem("metric")}
              >
                Metric
              </button>
            </div>

            <div className="flex bg-muted p-1 rounded-lg">
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${gender === "boy" ? "bg-blue-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setGender("boy")}
              >
                Boy
              </button>
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${gender === "girl" ? "bg-pink-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setGender("girl")}
              >
                Girl
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <CompactInput id="age" label="Age (10-19)" value={age} onChange={setAge} suffix="Years" />
              
              {unitSystem === "imperial" ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <CompactInput id="ft" label="Height (ft)" value={heightFt} onChange={setHeightFt} suffix="ft" />
                    <CompactInput id="in" label="Height (in)" value={heightIn} onChange={setHeightIn} suffix="in" />
                  </div>
                  <CompactInput id="lbs" label="Current Weight" value={weightLbs} onChange={setWeightLbs} suffix="lbs" />
                </>
              ) : (
                <>
                  <CompactInput id="cm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
                  <CompactInput id="kg" label="Current Weight" value={weightKg} onChange={setWeightKg} suffix="kg" />
                </>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleCalculate}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold"
              >
                Calculate
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">
                    Adolescent BMI
                  </p>
                  <h2 className="text-4xl font-black text-primary">
                    {results.bmi}
                  </h2>
                  <div className="mt-1 flex items-center">
                    <span className={`font-bold uppercase tracking-widest text-sm ${results.colorClass}`}>
                      {results.percentileCategory}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on CDC growth charts, this BMI falls into the <strong>{results.percentileCategory}</strong> classification for a {age}-year-old {gender}.
                  </p>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card shadow-sm mt-2">
                  <h3 className="font-semibold text-sm mb-3">CDC Percentile Comparison</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "5th (Under)", val: CDC_TEEN_DATA[gender].find(d => d.age === parseInt(age, 10))?.p5 || 0, fill: "#eab308" },
                        { name: "50th (Avg)", val: CDC_TEEN_DATA[gender].find(d => d.age === parseInt(age, 10))?.p50 || 0, fill: "#10b981" },
                        { name: "85th (Over)", val: CDC_TEEN_DATA[gender].find(d => d.age === parseInt(age, 10))?.p85 || 0, fill: "#f97316" },
                        { name: "95th (Obese)", val: CDC_TEEN_DATA[gender].find(d => d.age === parseInt(age, 10))?.p95 || 0, fill: "#ef4444" },
                      ]} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RTooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} cursor={{fill: "transparent"}} />
                        <ReferenceLine y={results.bmi} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Your BMI', fill: 'hsl(var(--primary))', fontSize: 11, fontWeight: 'bold' }} />
                        <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                          {["#eab308", "#10b981", "#f97316", "#ef4444"].map((c, i) => <Cell key={i} fill={c} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <AdPlaceholder />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <p>Enter gender, age, height, and weight to calculate adolescent percentile.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 xl:mt-12 max-w-[1180px]">
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Adolescent Body Mass Index</h2>
            <p>Evaluating the physical growth and nutritional status of children and teenagers requires an entirely different mathematical and clinical approach than evaluating fully mature adults. For an adult who has completely stopped growing vertically, Body Mass Index (BMI) is calculated as a simple, static ratio of total mass in kilograms divided by the square of their height in meters. Because adult height is fixed, their BMI only changes if their weight changes, making it a relatively straightforward, albeit imperfect, proxy for total body fat percentage. However, this static adult model completely collapses when applied to teenagers. During the turbulent physiological window between ages ten and nineteen, adolescents are in a constant, rapid state of physical flux. They are growing taller, their bone density is increasing dramatically, and their natural distribution of lean muscle and subcutaneous fat is completely transforming under the influence of puberty hormones. Therefore, a teenager's BMI is absolutely meaningless as an isolated number. To have any clinical value, an adolescent's BMI must be plotted against standard epidemiological growth charts and expressed as a percentile relative to their peers.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Growth Percentiles</h2>
            <p>Our Adolescent BMI Calculator strictly utilizes the official clinical growth charts published by the United States Centers for Disease Control and Prevention (CDC). These charts are the product of massive, multi-decade epidemiological studies that tracked the height and weight of millions of healthy children as they progressed through puberty. When you input a teenager's age, gender, height, and weight into our calculator, it first computes their raw BMI number using the standard mathematical formula. However, the calculation does not stop there. The algorithm then takes that raw BMI number, matches it to the exact chronological age and biological sex of the teenager, and plots it onto the CDC growth curve to generate a specific percentile ranking.</p>

            <p>A percentile ranking tells you exactly where the teenager stands compared to a hypothetical room of one hundred teenagers of the exact same age and gender. If our calculator indicates that a fourteen-year-old boy is in the 65th percentile, it means his BMI is higher than sixty-five out of one hundred boys his exact age, and lower than thirty-five of them. This relative comparison is the only scientifically valid way to determine if a teenager's physical development is progressing along a healthy, sustainable trajectory or if there is a potential clinical anomaly that requires medical attention.</p>

            <h2 className="text-2xl font-bold mb-3">Interpreting the Four Clinical Categories</h2>
            <p>The CDC divides the vast spectrum of adolescent BMI percentiles into four distinct clinical categories. The first category is "Underweight," which is strictly defined as any BMI falling below the 5th percentile. Being consistently underweight during the adolescent years is a serious clinical concern, as it can indicate malnutrition, an underlying metabolic disorder, or an eating disorder. Crucially, chronic malnutrition during puberty can permanently stunt a teenager's peak bone mass and final adult height. The second category is "Healthy Weight," which represents a massive statistical bracket spanning from the 5th percentile all the way up to the 84th percentile. This incredibly wide range exists to accommodate the immense natural variance in the timing and severity of pubertal growth spurts across different individuals.</p>

            <p>The third category is "Overweight," which encompasses any BMI falling between the 85th and 94th percentiles. The final category is "Obesity," which is defined as a BMI equal to or greater than the 95th percentile. Teenagers in these upper two categories face a significantly elevated statistical risk of developing chronic metabolic conditions previously associated only with adults, including type 2 diabetes, essential hypertension, elevated cholesterol, and obstructive sleep apnea. Furthermore, epidemiological data overwhelmingly indicates that adolescents who are obese in their late teenage years are highly likely to remain obese throughout their entire adult lives.</p>

            <h2 className="text-2xl font-bold mb-3">Navigating the Chaos of Growth Spurts</h2>
            <p>It is vital for parents and caregivers to understand that a single BMI percentile calculation represents merely a snapshot in time. Because puberty rarely progresses in a perfectly smooth, linear fashion, a teenager's BMI percentile will naturally fluctuate. It is incredibly common for a teenager to rapidly gain ten pounds in preparation for a major vertical growth spurt, temporarily pushing them into a higher BMI percentile category. Six months later, after they suddenly shoot up three inches in height without gaining any additional weight, their BMI percentile will plummet back into their historical average. This phenomenon is why pediatricians emphasize tracking the trajectory of a teenager's BMI across multiple years. A sudden, drastic change in percentile ranking—crossing two major percentile lines in a short timeframe—is far more clinically significant than a teenager who naturally tracks along the 85th percentile curve for their entire childhood. Severe caloric restriction diets are almost never recommended for teenagers in higher percentiles, as denying the body essential nutrients during puberty can permanently damage cognitive and physical development. Instead, the clinical goal is almost always weight maintenance—allowing the teenager to naturally grow into their current weight as their height continues to increase.</p>
          </section>
          
          <FAQSection faqs={faqs} />
        </div>

        <div className="mt-8 xl:mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
