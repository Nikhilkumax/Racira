"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Scale } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface MaintenanceInputs {
  age: number;
  gender: "male" | "female";
  weightLbs: number;
  heightInches: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  bodyFatPct?: number; // Optional, used if Katch-McArdle selected
  formula: "mifflin" | "harris" | "katch";
}

interface MaintenanceResults {
  tdee: number;
  bmr: number;
  neat: number; // Non-Exercise Activity Thermogenesis
  tef: number; // Thermic Effect of Food
  eat: number; // Exercise Activity Thermogenesis
  
  formulaUsed: string;
  recommendation: string;

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateMaintenance = (inputs: MaintenanceInputs): MaintenanceResults | null => {
  const { age, gender, weightLbs, heightInches, activityLevel, bodyFatPct, formula } = inputs;
  
  if (age <= 0 || weightLbs <= 0 || heightInches <= 0) return null;

  // Conversions
  const weightKg = weightLbs / 2.20462;
  const heightCm = heightInches * 2.54;

  let bmr = 0;
  let formulaUsed = "";

  if (formula === "katch" && bodyFatPct && bodyFatPct > 0) {
    const leanMassKg = weightKg * (1 - (bodyFatPct / 100));
    bmr = 370 + (21.6 * leanMassKg);
    formulaUsed = "Katch-McArdle (Body Composition Based)";
  } else if (formula === "harris") {
    // Revised Harris-Benedict (Roza and Shizgal, 1984)
    if (gender === "male") {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }
    formulaUsed = "Harris-Benedict Equation";
  } else {
    // Mifflin-St Jeor (Default, most accurate without body fat)
    if (gender === "male") {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
    formulaUsed = "Mifflin-St Jeor Equation";
  }

  // Activity Multipliers
  let multiplier = 1.2;
  let activityDesc = "";
  
  switch (activityLevel) {
    case "sedentary": multiplier = 1.2; activityDesc = "Little or no exercise, desk job."; break;
    case "light": multiplier = 1.375; activityDesc = "Light exercise/sports 1-3 days/week."; break;
    case "moderate": multiplier = 1.55; activityDesc = "Moderate exercise/sports 3-5 days/week."; break;
    case "active": multiplier = 1.725; activityDesc = "Hard exercise/sports 6-7 days a week."; break;
    case "very_active": multiplier = 1.9; activityDesc = "Very hard exercise/physical job or 2x training."; break;
  }

  const tdee = bmr * multiplier;

  // Breakdown TDEE Components (Estimations based on standard physiological models)
  // TEF is roughly 10% of TDEE
  const tef = tdee * 0.10;
  
  // The remaining non-BMR energy is split between NEAT and EAT.
  // Sedentary: EAT is 0, NEAT is the rest.
  // Active: EAT is higher.
  const physicalActivityEnergy = tdee - bmr - tef;
  let neat = 0;
  let eat = 0;

  if (activityLevel === "sedentary") {
    neat = physicalActivityEnergy;
    eat = 0;
  } else if (activityLevel === "light") {
    eat = physicalActivityEnergy * 0.3;
    neat = physicalActivityEnergy * 0.7;
  } else if (activityLevel === "moderate") {
    eat = physicalActivityEnergy * 0.5;
    neat = physicalActivityEnergy * 0.5;
  } else if (activityLevel === "active") {
    eat = physicalActivityEnergy * 0.7;
    neat = physicalActivityEnergy * 0.3;
  } else {
    eat = physicalActivityEnergy * 0.8;
    neat = physicalActivityEnergy * 0.2;
  }

  const chartData = [
    { name: "Basal Metabolic Rate (BMR)", value: Math.round(bmr), color: "hsl(var(--primary))" },
    { name: "Non-Exercise Activity (NEAT)", value: Math.round(neat), color: "#3b82f6" },
    { name: "Thermic Effect of Food (TEF)", value: Math.round(tef), color: "#10b981" },
    { name: "Exercise Activity (EAT)", value: Math.round(eat), color: "#f59e0b" }
  ];

  // Filter out EAT if 0 for cleaner chart
  const filteredChartData = chartData.filter(d => d.value > 0);

  const recommendation = "To maintain your current weight, consume exactly this number of calories daily. This is the foundation of all dieting; you must know your maintenance baseline before determining a deficit for fat loss or a surplus for muscle gain.";

  const summaryStats = [
    { label: "BMR (Resting Energy)", value: `${Math.round(bmr)} kcal`, colorClass: "text-primary font-bold" },
    { label: "NEAT (Daily Movement)", value: `${Math.round(neat)} kcal`, colorClass: "text-blue-500 font-medium" },
    { label: "EAT (Structured Exercise)", value: `${Math.round(eat)} kcal`, colorClass: "text-amber-500 font-medium" },
    { label: "TEF (Food Digestion)", value: `${Math.round(tef)} kcal`, colorClass: "text-green-500 font-medium" },
    { label: "Formula Used", value: formulaUsed }
  ];

  return {
    tdee: Math.round(tdee),
    bmr: Math.round(bmr),
    neat: Math.round(neat),
    tef: Math.round(tef),
    eat: Math.round(eat),
    formulaUsed,
    recommendation,
    chartData: filteredChartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  age: "30",
  gender: "male" as const,
  weightLbs: "180",
  heightFt: "5",
  heightIn: "10",
  activityLevel: "moderate" as const,
  formula: "mifflin" as const,
  bodyFatPct: ""
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className="font-bold text-foreground">{payload[0].value}</span> kcal / day</p>
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

export default function MaintenanceCalorieCalculator() {
  // 4. Component State
  const [age, setAge] = useState(DEFAULTS.age);
  const [gender, setGender] = useState<"male" | "female">(DEFAULTS.gender);
  const [weightLbs, setWeightLbs] = useState(DEFAULTS.weightLbs);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [activityLevel, setActivityLevel] = useState<any>(DEFAULTS.activityLevel);
  const [formula, setFormula] = useState<any>(DEFAULTS.formula);
  const [bodyFatPct, setBodyFatPct] = useState(DEFAULTS.bodyFatPct);
  
  const [results, setResults] = useState<MaintenanceResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const totalInches = (parseInt(heightFt) || 0) * 12 + (parseInt(heightIn) || 0);
    const inputs: MaintenanceInputs = {
      age: parseInt(age) || 0,
      gender,
      weightLbs: parseFloat(weightLbs) || 0,
      heightInches: totalInches,
      activityLevel,
      formula,
      bodyFatPct: parseFloat(bodyFatPct) || undefined
    };
    setResults(calculateMaintenance(inputs));
  };

  const handleReset = () => {
    setAge(DEFAULTS.age);
    setGender(DEFAULTS.gender);
    setWeightLbs(DEFAULTS.weightLbs);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setActivityLevel(DEFAULTS.activityLevel);
    setFormula(DEFAULTS.formula);
    setBodyFatPct(DEFAULTS.bodyFatPct);
    
    setResults(calculateMaintenance({
      age: parseInt(DEFAULTS.age),
      gender: DEFAULTS.gender,
      weightLbs: parseFloat(DEFAULTS.weightLbs),
      heightInches: parseInt(DEFAULTS.heightFt) * 12 + parseInt(DEFAULTS.heightIn),
      activityLevel: DEFAULTS.activityLevel,
      formula: DEFAULTS.formula,
      bodyFatPct: undefined
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age, gender, weightLbs, heightFt, heightIn, activityLevel, formula, bodyFatPct]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Maintenance Calories</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is the difference between BMR and TDEE?", answer: "BMR (Basal Metabolic Rate) is the energy your body burns strictly to stay alive in a comatose state (pumping blood, breathing, maintaining body temperature). TDEE (Total Daily Energy Expenditure) is your BMR plus all the calories you burn through digestion, walking, fidgeting, and exercise. Your Maintenance Calories are equal to your TDEE." },
    { question: "Which formula should I use?", answer: "If you don't know your exact body fat percentage, use the Mifflin-St Jeor equation. It is widely considered the most accurate formula for the general population. If you are very lean and muscular and know your exact body fat percentage, use the Katch-McArdle formula, as it accounts for lean muscle mass being more metabolically active than fat." },
    { question: "What is NEAT?", answer: "NEAT stands for Non-Exercise Activity Thermogenesis. It accounts for all the calories you burn doing subconscious physical movements—fidgeting, tapping your foot, walking to the fridge, or maintaining posture. For people with active jobs, NEAT can burn more calories than a brutal 60-minute gym session." },
    { question: "What is TEF?", answer: "TEF stands for Thermic Effect of Food. Your body burns calories simply digesting the food you eat. Protein has the highest TEF (about 20-30% of its calories are burned during digestion), while fat has the lowest (0-3%). Eating a high-protein diet naturally increases your total daily calorie burn." },
    { question: "Why is 'Sedentary' the default for desk workers who hit the gym?", answer: "A common mistake is selecting 'Highly Active' because you lift weights for an hour a day. If you lift for one hour but sit in an office chair for 9 hours and sleep for 8 hours, your overall lifestyle is heavily sedentary. To avoid overestimating your maintenance calories, it is safer to select Sedentary or Lightly Active, and treat your gym calories as a bonus buffer." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Maintenance Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Maintenance Calorie Calculator (TDEE)</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Scale className="h-4 w-4" /> Baseline Energy Profiler
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact number of calories your body burns daily to maintain your current weight, broken down by biological component.</p>
            </div>

            <div className="flex flex-col">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Biological Sex</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                <button type="button" onClick={() => setGender("male")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${gender === "male" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Male</button>
                <button type="button" onClick={() => setGender("female")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${gender === "female" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Female</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="age" label="Age" value={age} onChange={setAge} suffix="years" />
              <CompactInput id="weight" label="Weight" value={weightLbs} onChange={setWeightLbs} suffix="lbs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="ht-ft" label="Height (Ft)" value={heightFt} onChange={setHeightFt} suffix="ft" />
              <CompactInput id="ht-in" label="Height (In)" value={heightIn} onChange={setHeightIn} suffix="in" />
            </div>

            <div className="flex flex-col mb-1 mt-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Daily Activity Level</label>
              <select 
                value={activityLevel} 
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="sedentary">Sedentary (Desk Job, little exercise)</option>
                <option value="light">Lightly Active (Light exercise 1-3 days/wk)</option>
                <option value="moderate">Moderately Active (Sports 3-5 days/wk)</option>
                <option value="active">Very Active (Hard training 6-7 days/wk)</option>
                <option value="very_active">Extra Active (Physical job + training)</option>
              </select>
            </div>

            <div className="flex flex-col mb-1 mt-1">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Calculation Formula</label>
              <select 
                value={formula} 
                onChange={(e) => setFormula(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="mifflin">Mifflin-St Jeor (Most Accurate Default)</option>
                <option value="harris">Harris-Benedict (Original 1984)</option>
                <option value="katch">Katch-McArdle (Requires Body Fat %)</option>
              </select>
            </div>

            {formula === "katch" && (
              <div className="grid grid-cols-1 gap-4 mt-1">
                <CompactInput id="bf" label="Body Fat Percentage" value={bodyFatPct} onChange={setBodyFatPct} suffix="%" />
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
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border border-primary rounded-lg p-5 relative overflow-hidden">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                      Daily Maintenance Calories (TDEE)
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.tdee}</div>
                      <div className="text-xl font-bold text-muted-foreground">kcal / day</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      {results.recommendation}
                    </p>
                  </div>
                  <Scale className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Energy Expenditure Breakdown</h3>
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
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">TDEE Component Ratio</h3>
                    <div className="text-center w-full relative">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={70}
                            paddingAngle={2} dataKey="value"
                            startAngle={90} endAngle={-270}
                          >
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-foreground leading-none">{results.tdee}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 w-full text-center">BMR is the baseline; NEAT, TEF, and EAT compose the remainder.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Scale className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your biometrics and lifestyle activity level to calculate your exact biological maintenance baseline.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Maintenance Calorie Calculator</h2>
            <p>In the realm of nutritional science and body composition, every diet plan, every bulking protocol, and every fat-loss strategy begins with a single foundational number: your Maintenance Calories. Also known as your Total Daily Energy Expenditure (TDEE), this number represents the exact amount of energy (measured in kilocalories) your body burns in a 24-hour period. If you consume exactly this number of calories, your body weight will not change by a single ounce. The <strong>Maintenance Calorie Calculator</strong> uses clinically validated biological equations to pinpoint this number, allowing you to build an effective diet based on mathematical certainty rather than guesswork.</p>
            <p>Attempting to cut fat or build muscle without knowing your maintenance baseline is akin to driving a car with a blindfold on. You might arrive at your destination eventually, but you are far more likely to crash. By calculating your exact TDEE, you can dial in precise caloric deficits or surpluses to sculpt your physique efficiently and safely.</p>

            <h2>The Four Pillars of TDEE</h2>
            <p>Many people mistakenly believe that their metabolism is a single, static engine. In reality, your Total Daily Energy Expenditure is composed of four distinct biological components. Understanding these components is the key to manipulating your metabolism.</p>

            <h3>1. Basal Metabolic Rate (BMR)</h3>
            <p>Your BMR is the absolute minimum amount of energy required to keep you alive if you were in a coma. It is the fuel needed to pump your heart, inflate your lungs, maintain your core body temperature, and power brain function. For the average adult, BMR accounts for a massive <strong>60% to 70%</strong> of total daily energy expenditure. Because it takes energy to maintain mass, larger people inherently have higher BMRs. Similarly, because muscle tissue is "metabolically active," an athletic person with high muscle mass will have a higher BMR than a sedentary person of the exact same weight.</p>

            <h3>2. Non-Exercise Activity Thermogenesis (NEAT)</h3>
            <p>NEAT represents all the calories you burn through subconscious or unstructured physical movement. This includes walking to your car, pacing while on the phone, tapping your foot, maintaining an upright posture at your desk, and even fidgeting. NEAT is the most highly variable component of human metabolism. An office worker might burn 300 calories via NEAT, while a construction worker or waitress might burn 1,500 calories. Increasing your NEAT is the easiest way to break through a fat-loss plateau.</p>

            <h3>3. Thermic Effect of Food (TEF)</h3>
            <p>Digestion is a mechanical and chemical process that requires energy. When you eat food, your body must burn calories simply to break that food down and absorb its nutrients. This is the Thermic Effect of Food, which generally accounts for roughly <strong>10%</strong> of your TDEE. However, TEF varies wildly by macronutrient:</p>
            <ul>
              <li><strong>Fats:</strong> 0-3% of calories burned during digestion.</li>
              <li><strong>Carbohydrates:</strong> 5-10% of calories burned.</li>
              <li><strong>Protein:</strong> 20-30% of calories burned.</li>
            </ul>
            <p>This is why high-protein diets are so effective for fat loss. If you eat 100 calories of pure protein, your body burns 30 of those calories just to digest it, leaving you with a net intake of only 70 calories.</p>

            <h3>4. Exercise Activity Thermogenesis (EAT)</h3>
            <p>EAT represents the calories burned during structured, intentional exercise (e.g., lifting weights, running on a treadmill, or playing basketball). Surprisingly to many beginners, EAT accounts for the smallest portion of the daily calorie burn for the average person, usually only <strong>5% to 10%</strong>. A grueling 45-minute weightlifting session might only burn 250 calories. This underscores the classic fitness adage: <em>"You cannot out-train a bad diet."</em></p>

            <h2>Decoding the Mathematical Formulas</h2>
            <p>Our calculator provides three distinct formulas to estimate your BMR. Each has its own historical context and specific use case:</p>
            <p><strong>Mifflin-St Jeor (1990):</strong> This is the default formula and the most widely recommended by dietitians for the general population. It is highly accurate because it accounts for the obesity epidemic that was not present when earlier formulas were developed. It relies on age, height, weight, and biological sex.</p>
            <p><strong>Harris-Benedict (1984 Revised):</strong> Originally developed in 1919 and revised in 1984, this was the standard for decades. However, studies have shown it tends to overestimate baseline energy requirements in modern, sedentary individuals by about 5%. It is provided in our calculator primarily for historical continuity and for those comparing past medical records.</p>
            <p><strong>Katch-McArdle:</strong> This is the absolute gold standard for athletes and bodybuilders. Unlike the other formulas, it completely ignores biological sex, age, and height. Instead, it calculates BMR based exclusively on your <strong>Lean Body Mass</strong> (total weight minus fat weight). If you are a 220-pound bodybuilder with 10% body fat, Mifflin-St Jeor will vastly underestimate your metabolism because it assumes you are an overweight 220-pound man. Katch-McArdle corrects this by recognizing your massive, metabolically expensive muscle mass. You should only use this formula if you have an accurate DEXA scan or caliper reading of your body fat percentage.</p>

            <h2>The Danger of Overestimating Activity Levels</h2>
            <p>The most common error users make when utilizing a TDEE calculator is lying to themselves about their activity level. Many people will select "Highly Active" simply because they go to the gym for 45 minutes, five days a week.</p>
            <p>Consider the math: There are 168 hours in a week. If you sleep for 56 hours, sit at a desk for 40 hours, commute in a car for 10 hours, and sit on the couch watching Netflix for 30 hours, your lifestyle is overwhelmingly sedentary. Spending 4 hours a week in a gym does not negate 130 hours of sitting. If you work a desk job, you should almost always select "Sedentary" or "Lightly Active." It is far better to calculate a conservative TDEE and treat your gym calories as a bonus deficit, rather than overestimating your TDEE and failing to lose weight.</p>

            <h2>How to Use Your TDEE Results</h2>
            <p>Once you have calculated your Maintenance Calories (TDEE), you hold the mathematical keys to your physique. From here, you must apply a specific modifier based on your goal:</p>
            <ul>
              <li><strong>To Lose Fat:</strong> Subtract 500 calories from your TDEE. This creates a 3,500-calorie weekly deficit, resulting in approximately one pound of fat loss per week.</li>
              <li><strong>To Build Muscle:</strong> Add 200 to 400 calories to your TDEE. This small surplus provides the required energy to construct new muscle tissue without piling on unnecessary body fat.</li>
              <li><strong>To Recomp:</strong> Eat exactly at your TDEE. Focus on eating a massive amount of protein and lifting heavy weights. Over time, your body will burn fat to fuel the construction of new muscle, altering your body composition while keeping your weight static.</li>
            </ul>

            <h2>Conclusion: The Science of Certainty</h2>
            <p>Metabolism is not a mystery, nor is it "broken." It is a highly predictable biological engine governed by the laws of thermodynamics. By using the Maintenance Calorie Calculator, you remove the emotion and the guesswork from dieting. You now have a scientifically validated baseline. Track your food intake meticulously to hit this number, monitor the scale, and take total control of your health.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/maintenance-calorie-calculator" />
          <PopularCalculators exclude="/calculator/maintenance-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
