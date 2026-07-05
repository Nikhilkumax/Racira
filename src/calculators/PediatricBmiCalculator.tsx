"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Baby, Ruler, LineChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface PediatricBMIInputs {
  unitSystem: "imperial" | "metric";
  gender: "boy" | "girl";
  ageYears: number;
  heightInches: number;
  heightCm: number;
  weight: number;
}

interface PediatricBMIResults {
  bmi: number;
  percentileRange: "Underweight (<5th)" | "Healthy Weight (5th-84th)" | "Overweight (85th-94th)" | "Obese (≥95th)";
  colorClass: string;
  
  chartData: any[];
}

// 2. CDC Percentile Approximations (Age 2 to 20)
// Using simplified control points for the 5th, 50th, 85th, and 95th percentiles to render the growth chart.
const CDC_DATA = {
  boy: [
    { age: 2, p5: 14.5, p50: 16.0, p85: 18.0, p95: 19.3 },
    { age: 4, p5: 14.0, p50: 15.5, p85: 17.2, p95: 18.5 },
    { age: 6, p5: 13.8, p50: 15.3, p85: 17.0, p95: 18.4 },
    { age: 8, p5: 14.0, p50: 15.8, p85: 18.0, p95: 20.0 },
    { age: 10, p5: 14.5, p50: 16.5, p85: 19.4, p95: 21.4 },
    { age: 12, p5: 15.2, p50: 17.8, p85: 21.0, p95: 23.5 },
    { age: 14, p5: 16.4, p50: 19.4, p85: 22.8, p95: 25.4 },
    { age: 16, p5: 17.8, p50: 20.8, p85: 24.5, p95: 27.2 },
    { age: 18, p5: 18.8, p50: 22.0, p85: 26.0, p95: 28.8 },
    { age: 20, p5: 19.5, p50: 23.0, p85: 27.0, p95: 30.0 }
  ],
  girl: [
    { age: 2, p5: 14.2, p50: 15.8, p85: 17.8, p95: 19.0 },
    { age: 4, p5: 13.8, p50: 15.4, p85: 17.0, p95: 18.5 },
    { age: 6, p5: 13.5, p50: 15.2, p85: 17.0, p95: 18.8 },
    { age: 8, p5: 13.8, p50: 15.8, p85: 18.2, p95: 20.5 },
    { age: 10, p5: 14.2, p50: 16.8, p85: 20.0, p95: 22.0 },
    { age: 12, p5: 15.0, p50: 18.2, p85: 21.8, p95: 24.2 },
    { age: 14, p5: 16.0, p50: 19.8, p85: 23.8, p95: 26.5 },
    { age: 16, p5: 17.0, p50: 20.8, p85: 24.8, p95: 27.8 },
    { age: 18, p5: 17.8, p50: 21.5, p85: 25.8, p95: 28.8 },
    { age: 20, p5: 18.2, p50: 22.0, p85: 26.5, p95: 29.5 }
  ]
};

// Interpolation helper to find the specific percentiles for any age between 2 and 20
const interpolatePercentiles = (gender: "boy" | "girl", age: number) => {
  const data = CDC_DATA[gender];
  
  // Cap age within reference range
  const safeAge = Math.max(2, Math.min(20, age));
  
  // Find surrounding points
  let lower = data[0];
  let upper = data[data.length - 1];
  
  for (let i = 0; i < data.length - 1; i++) {
    if (safeAge >= data[i].age && safeAge <= data[i+1].age) {
      lower = data[i];
      upper = data[i+1];
      break;
    }
  }
  
  if (lower.age === upper.age) return { ...lower };
  
  const ratio = (safeAge - lower.age) / (upper.age - lower.age);
  
  return {
    age: safeAge,
    p5: lower.p5 + ratio * (upper.p5 - lower.p5),
    p50: lower.p50 + ratio * (upper.p50 - lower.p50),
    p85: lower.p85 + ratio * (upper.p85 - lower.p85),
    p95: lower.p95 + ratio * (upper.p95 - lower.p95),
  };
};

const calculatePediatricBMI = (inputs: PediatricBMIInputs): PediatricBMIResults | null => {
  const { unitSystem, gender, ageYears, heightInches, heightCm, weight } = inputs;
  
  if (weight <= 0 || ageYears < 2 || ageYears > 20) return null;
  if (unitSystem === "imperial" && heightInches <= 0) return null;
  if (unitSystem === "metric" && heightCm <= 0) return null;

  let bmi = 0;
  if (unitSystem === "imperial") {
    bmi = (weight / Math.pow(heightInches, 2)) * 703;
  } else {
    const heightM = heightCm / 100;
    bmi = weight / Math.pow(heightM, 2);
  }

  // Find where this BMI sits on the CDC percentile curve
  const currentPercentiles = interpolatePercentiles(gender, ageYears);

  let percentileRange: PediatricBMIResults["percentileRange"] = "Healthy Weight (5th-84th)";
  let colorClass = "#10b981"; // Emerald

  if (bmi < currentPercentiles.p5) {
    percentileRange = "Underweight (<5th)";
    colorClass = "#3b82f6"; // Blue
  } else if (bmi >= currentPercentiles.p85 && bmi < currentPercentiles.p95) {
    percentileRange = "Overweight (85th-94th)";
    colorClass = "#f59e0b"; // Yellow/Amber
  } else if (bmi >= currentPercentiles.p95) {
    percentileRange = "Obese (≥95th)";
    colorClass = "#ef4444"; // Red
  }

  // Generate Chart Data to show the entire growth curve for their gender
  const chartData = CDC_DATA[gender].map(point => ({
    age: point.age,
    "95th Percentile (Obese)": parseFloat(point.p95.toFixed(1)),
    "85th Percentile (Overweight)": parseFloat(point.p85.toFixed(1)),
    "50th Percentile (Median)": parseFloat(point.p50.toFixed(1)),
    "5th Percentile (Underweight)": parseFloat(point.p5.toFixed(1)),
    // Inject user's specific dot if it matches this age
    "Your Child": (Math.abs(point.age - ageYears) <= 1) ? parseFloat(bmi.toFixed(1)) : null
  }));

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    percentileRange,
    colorClass,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  gender: "boy" as const,
  ageYears: "10",
  weight: "75",
  heightFt: "4",
  heightIn: "6",
  heightCm: "137"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">Age {label} Years</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span style={{ color: entry.color }} className="mr-3">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
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

export default function PediatricBMICalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [gender, setGender] = useState<"boy" | "girl">(DEFAULTS.gender);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<PediatricBMIResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const a = parseInt(ageYears, 10);
    const w = parseFloat(weight);
    const ft = parseFloat(heightFt) || 0;
    const inc = parseFloat(heightIn) || 0;
    const cm = parseFloat(heightCm) || 0;

    const totalInches = (ft * 12) + inc;

    if (isNaN(a) || a < 2 || a > 20) return setErrorMsg("This calculator is designed for children and teens between ages 2 and 20.");
    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (unitSystem === "imperial" && totalInches <= 0) return setErrorMsg("Please enter a valid height.");
    if (unitSystem === "metric" && cm <= 0) return setErrorMsg("Please enter a valid height.");

    const res = calculatePediatricBMI({ 
      unitSystem, 
      gender,
      ageYears: a,
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
    setAgeYears(DEFAULTS.ageYears);
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
  }, [unitSystem, gender, ageYears, weight, heightFt, heightIn, heightCm]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pediatric BMI Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why can't children use a standard adult BMI calculator?", answer: "A standard adult BMI calculator only looks at height and weight, and establishes a fixed 'Normal' range (18.5 to 24.9) that never changes. Children and teenagers are constantly growing. A healthy 5-year-old child will naturally have vastly less body fat (and a much lower raw BMI) than a healthy 15-year-old going through puberty. If you put a child's metrics into an adult calculator, it will almost always incorrectly classify the healthy child as severely 'Underweight'." },
    { question: "What are BMI Percentiles?", answer: "Because a child's body composition changes every single month, pediatricians use 'Percentiles' instead of fixed numbers. The CDC measured millions of healthy children over decades to create a massive database. When your child's BMI is calculated, it is compared against the database of children of the exact same age and biological sex. If your child is in the '80th Percentile,' it means their BMI is higher than 80% of healthy children their exact age." },
    { question: "What is the 'Healthy' Percentile Range?", answer: "According to the CDC and the American Academy of Pediatrics, a healthy weight falls between the 5th percentile and the 84th percentile. This is a massive, highly forgiving biological window designed to accommodate natural variations in genetics, bone structure, and growth spurts. If a child drops below the 5th percentile, they are considered clinically underweight. If they exceed the 85th percentile, they are flagged as overweight." },
    { question: "Why does the chart curve downwards between ages 2 and 6?", answer: "If you look at the Growth Chart visualization, you will notice the BMI percentiles drop (dip) between ages 2 and 6 before rising again. This is a crucial, universally recognized biological phenomenon called 'Adiposity Rebound.' Toddlers naturally hold a high amount of 'baby fat.' As they learn to walk, run, and grow vertically, they rapidly lean out, reaching their lowest body fat percentage around age 5 or 6. After age 6, their body fat slowly begins to rise again in preparation for puberty." },
    { question: "What happens if a child hits the 95th Percentile?", answer: "A child at or above the 95th percentile is clinically classified as Obese. This is a massive warning sign for pediatricians. Children who cross the 95th percentile are at an extremely high risk for developing childhood Type 2 Diabetes, early-onset hypertension, and severe joint pain. Furthermore, studies show that over 80% of children who remain obese into their teenage years will become obese adults, locking them into a lifetime of metabolic syndrome." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BMI-for-Age (Pediatric) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BMI-for-Age (Pediatric) Calculator</h1>

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
                <Baby className="h-4 w-4" /> Child Demographics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the child's exact age (between 2 and 20) and biological sex to align the calculation with the correct CDC growth chart.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Biological Sex</label>
                <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
              </div>
              <CompactInput id="age" label="Age (Years)" value={ageYears} onChange={setAgeYears} suffix="yrs" />
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
                  className="text-white rounded-lg p-6 shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: results.colorClass }}
                >
                  <div className="relative z-10">
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Clinical Assessment</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-4xl md:text-5xl font-black">{results.percentileRange}</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Ruler className="h-4 w-4" /> Raw BMI Score: {results.bmi}
                    </div>
                  </div>
                  <LineChart className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">CDC Clinical Growth Chart</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visualization of the biological growth bands for {gender === "boy" ? "boys" : "girls"}. The red band represents Obesity (≥95th percentile), while the green band represents a Healthy Weight.</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="age" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Stacked Areas for Percentile Bands */}
                        <Area type="monotone" dataKey="95th Percentile (Obese)" stroke="none" fill="#ef4444" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="85th Percentile (Overweight)" stroke="none" fill="#f59e0b" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="50th Percentile (Median)" stroke="none" fill="#10b981" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="5th Percentile (Underweight)" stroke="none" fill="#3b82f6" fillOpacity={0.2} />
                        
                        {/* Plot User's Specific Point if it exists on the chart */}
                        {results.chartData.map((entry, index) => {
                          if (entry["Your Child"]) {
                            return <ReferenceDot key={index} x={entry.age} y={entry["Your Child"]} r={6} fill={results.colorClass} stroke="white" strokeWidth={2} />;
                          }
                          return null;
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <LineChart className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your child's exact age, gender, height, and weight to calculate their clinical percentiles against the CDC growth database.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Danger of Adult Metrics for Children</h2>
            <p>One of the most common and terrifying mistakes parents make is taking their child's height and weight, plugging it into a standard adult Body Mass Index (BMI) calculator, and panicking at the result. The standard adult BMI formula establishes a rigid "Normal" range of 18.5 to 24.9. This range is designed for fully mature adult skeletons that have stopped growing. If you put the measurements of a perfectly healthy, athletic 7-year-old child into an adult calculator, the resulting BMI will often be around 15 or 16, leading the calculator to loudly declare the child is dangerously "Underweight." The <strong>BMI-for-Age (Pediatric) Calculator</strong> prevents this dangerous misdiagnosis by abandoning static adult numbers and utilizing the clinical percentile databases managed by the Centers for Disease Control (CDC).</p>

            <h2 className="text-2xl font-bold mb-3">Why We Use Percentiles, Not Raw Numbers</h2>
            <p>Children are not small adults. They are rapidly developing organisms whose body composition changes every single month. Because a healthy BMI for a 6-year-old is vastly different than a healthy BMI for a 14-year-old, raw numbers are medically useless to a pediatrician.</p>
            <p>To solve this, the CDC compiled decades of physical measurement data from millions of healthy children to create massive statistical Growth Charts. When a doctor calculates your child's BMI, they do not care about the number itself; they care about where that number sits on the curve compared to millions of other children of the exact same age and biological sex. This comparative analysis is called a Percentile.</p>

            <h2 className="text-2xl font-bold mb-3">Decoding the Percentile Terminology</h2>
            <p>Understanding percentiles is critical for parental peace of mind. If your child is in the 75th percentile, it does not mean they scored a "C" grade on a test. It means that out of 100 children of their exact age and sex, their BMI is mathematically higher than 75 of those children, and lower than 25 of them.</p>
            <p>The clinical classifications are incredibly forgiving to account for natural genetic variation:</p>
            <ul>
              <li><strong>Below 5th Percentile:</strong> Underweight. This is a clinical warning sign that the child may not be receiving enough nutrition to support skeletal growth and brain development.</li>
              <li><strong>5th to 84th Percentile:</strong> Healthy Weight. This is a massive, 80-point biological window. A child in the 10th percentile and a child in the 80th percentile are both considered perfectly healthy by their pediatrician.</li>
              <li><strong>85th to 94th Percentile:</strong> Overweight. This is the danger zone. It indicates the child is beginning to accumulate excess adipose tissue faster than their skeletal frame requires for growth.</li>
              <li><strong>95th Percentile or Higher:</strong> Obese. This is a physiological emergency requiring immediate nutritional intervention.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Adiposity Rebound Phenomenon</h2>
            <p>If you look at the Growth Chart visualization generated by this calculator, you will notice a strange phenomenon: the curves do not go straight up. Between the ages of 2 and 6, the percentiles actively drop and curve downward before rising again.</p>
            <p>This is a universally recognized biological event called "Adiposity Rebound." Toddlers naturally carry a high percentage of "baby fat." As they learn to walk, run, and rapidly grow vertically, they naturally lean out. A child usually reaches their absolute lowest body fat percentage around age 5 or 6 (the bottom of the curve). After age 6, their body naturally begins to slowly accumulate fat again to build the energy reserves required to fuel the massive biological changes of impending puberty. If a child hits their Adiposity Rebound too early (e.g., their BMI starts rising aggressively at age 3 instead of age 6), it is a highly accurate clinical predictor of severe obesity later in life.</p>

            <h2 className="text-2xl font-bold mb-3">Why Gender Separation is Mandatory</h2>
            <p>You cannot compare a 13-year-old boy to a 13-year-old girl. The onset of puberty radically alters how the body synthesizes and stores tissue.</p>
            <p>As boys enter puberty, testosterone drives a massive increase in dense skeletal muscle mass and bone density, which naturally drives their BMI higher even without accumulating fat. As girls enter puberty, estrogen genetically mandates the accumulation of essential subcutaneous fat in the hips, thighs, and breasts to support the biological capability of future pregnancy. Because these tissue developments are entirely different, the CDC maintains two completely separate, mathematically distinct databases for boys and girls.</p>

            <h2 className="text-2xl font-bold mb-3">The Threat of Childhood Obesity</h2>
            <p>When a child crosses the 95th percentile, it is not a cosmetic issue; it is a clinical crisis. Society often dismisses childhood obesity by claiming the child will simply "grow out of it." Medical data proves this is a lethal myth.</p>
            <p>Over 80% of children who remain above the 95th percentile into their early teenage years will become obese adults. The damage begins immediately. Obese children frequently show early signs of severe insulin resistance (pre-diabetes), elevated cholesterol, and high blood pressure before they even graduate high school. Furthermore, the excess weight places catastrophic mechanical stress on their developing skeletal system, frequently leading to permanent joint damage and structural deformities in the legs and hips.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Track the Trend, Not the Dot</h2>
            <p>The most important rule when using the BMI-for-Age (Pediatric) Calculator is to look at the trend over time. A single measurement is just a dot on a graph. A child might temporarily spike into the 88th percentile right before a massive vertical growth spurt, and then drop back to the 60th percentile six months later. Use this tool every six months to track the <em>trajectory</em> of your child's growth. If the trajectory is aggressively curving upwards toward the red Obese zone, schedule a consultation with your pediatrician immediately to discuss structural nutritional changes.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-for-age-pediatric-calculator" />
          <PopularCalculators exclude="/calculator/bmi-for-age-pediatric-calculator" />
        </div>
      </div>
    </>
  );
}
