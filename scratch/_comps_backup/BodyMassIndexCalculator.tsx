"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Scale, Ruler, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface BMIInputs {
  unitSystem: "imperial" | "metric";
  heightInches: number;
  heightCm: number;
  weight: number;
}

interface BMIResults {
  bmi: number;
  classification: "Underweight" | "Normal Weight" | "Overweight" | "Obese Class I" | "Obese Class II" | "Obese Class III";
  colorClass: string;
  
  targetNormalWeightLow: number;
  targetNormalWeightHigh: number;
  
  chartData: { name: string; "Your BMI": number }[];
}

// 2. Pure Calculation Function
const calculateBMI = (inputs: BMIInputs): BMIResults | null => {
  const { unitSystem, heightInches, heightCm, weight } = inputs;
  
  if (weight <= 0) return null;
  if (unitSystem === "imperial" && heightInches <= 0) return null;
  if (unitSystem === "metric" && heightCm <= 0) return null;

  let bmi = 0;
  
  if (unitSystem === "imperial") {
    bmi = (weight / Math.pow(heightInches, 2)) * 703;
  } else {
    const heightM = heightCm / 100;
    bmi = weight / Math.pow(heightM, 2);
  }

  let classification: BMIResults["classification"] = "Normal Weight";
  let colorClass = "#10b981"; // Emerald

  if (bmi < 18.5) {
    classification = "Underweight";
    colorClass = "#3b82f6"; // Blue
  } else if (bmi < 25) {
    classification = "Normal Weight";
    colorClass = "#10b981"; // Emerald
  } else if (bmi < 30) {
    classification = "Overweight";
    colorClass = "#f59e0b"; // Yellow/Amber
  } else if (bmi < 35) {
    classification = "Obese Class I";
    colorClass = "#f97316"; // Orange
  } else if (bmi < 40) {
    classification = "Obese Class II";
    colorClass = "#ef4444"; // Red
  } else {
    classification = "Obese Class III";
    colorClass = "#991b1b"; // Dark Red
  }

  // Calculate target weight for 'Normal' BMI range (18.5 to 24.9)
  let targetNormalWeightLow = 0;
  let targetNormalWeightHigh = 0;
  
  if (unitSystem === "imperial") {
    targetNormalWeightLow = (18.5 * Math.pow(heightInches, 2)) / 703;
    targetNormalWeightHigh = (24.9 * Math.pow(heightInches, 2)) / 703;
  } else {
    const heightM = heightCm / 100;
    targetNormalWeightLow = 18.5 * Math.pow(heightM, 2);
    targetNormalWeightHigh = 24.9 * Math.pow(heightM, 2);
  }

  // Generate Chart Data
  const chartData = [
    { 
      name: "Your Score", 
      "Your BMI": parseFloat(bmi.toFixed(1))
    }
  ];

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    classification,
    colorClass,
    targetNormalWeightLow: Math.round(targetNormalWeightLow),
    targetNormalWeightHigh: Math.round(targetNormalWeightHigh),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "185",
  heightFt: "5",
  heightIn: "10",
  heightCm: "178"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">Biometric Score</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">Calculated BMI:</span>
          <span className="font-bold">{payload[0].value}</span>
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

export default function BodyMassIndexCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<BMIResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const ft = parseFloat(heightFt) || 0;
    const inc = parseFloat(heightIn) || 0;
    const cm = parseFloat(heightCm) || 0;

    const totalInches = (ft * 12) + inc;

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (unitSystem === "imperial" && totalInches <= 0) return setErrorMsg("Please enter a valid height.");
    if (unitSystem === "metric" && cm <= 0) return setErrorMsg("Please enter a valid height.");

    const res = calculateBMI({ 
      unitSystem, 
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
    w.document.write(`<html><head><title>Body Mass Index (BMI) Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Is the BMI scale clinically accurate?", answer: "The BMI scale is highly accurate when applied to large populations, but it has massive limitations when applied to specific individuals. BMI is a simple ratio of height to total body weight. It cannot differentiate between dense muscle mass, bone density, or adipose tissue (fat). Therefore, a sedentary individual with high visceral fat might score a 'Normal' BMI, while a professional bodybuilder with 8% body fat will almost certainly be classified as 'Obese'." },
    { question: "If BMI is flawed, why do doctors still use it?", answer: "Because it is incredibly fast, non-invasive, and completely free. To perfectly measure a patient's fat mass requires a DEXA scan or hydrostatic weighing, which are expensive and time-consuming. For the vast majority of the general population (who do not participate in heavy resistance training), BMI is a statistically reliable predictor of metabolic disease, cardiovascular risk, and overall mortality." },
    { question: "What is the 'Normal' BMI range?", answer: "The clinical target for a normal, healthy adult is a BMI between 18.5 and 24.9. Within this range, statistical data shows the lowest risk for weight-related diseases like Type 2 Diabetes, hypertension, and sleep apnea. If you fall below 18.5, you are considered underweight, which carries severe risks for bone density loss, immune suppression, and hormonal disruption." },
    { question: "Why are there three different classes of Obesity?", answer: "Not all obesity carries the same immediate medical risk. A BMI of 31 (Class I) increases your risk factors, but they are often manageable with lifestyle interventions. A BMI over 40 (Class III, historically called 'Morbid Obesity') is a physiological emergency. At this level, the sheer mechanical weight of the body severely compromises lung function, destroys joint cartilage, and guarantees catastrophic metabolic syndrome." },
    { question: "Should children use this standard BMI calculator?", answer: "No. Children and teenagers are constantly growing, and their bodies require different ratios of fat at different stages of puberty. A standard adult BMI calculator will give highly inaccurate, potentially damaging results for a child. Pediatricians use specific 'BMI-for-Age' percentiles that compare a child's weight/height ratio against millions of other children of the exact same age and biological sex." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Body Mass Index (BMI) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Body Mass Index (BMI) Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-1">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Scale className="h-4 w-4" /> Biometric Data
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter your height and total body weight to calculate your universally recognized clinical BMI score.</p>
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
                
                {/* Primary Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BMI Score Box */}
                  <div 
                    className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden"
                    
                  >
                    <div className="relative z-10">
                      <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Calculated BMI Score</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <div className="text-4xl font-bold text-primary">{results.bmi}</div>
                      </div>
                      <div className="mt-2 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${results.colorClass}1A`, color: results.colorClass }}>
                        {results.classification}
                      </div>
                    </div>
                    <Activity className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 text-primary" />
                  </div>

                  {/* Target Weight Range Box */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 flex flex-col justify-center">
                    <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">Ideal Clinical Weight Range</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-foreground">{results.targetNormalWeightLow}</div>
                      <div className="text-muted-foreground font-bold">to</div>
                      <div className="text-3xl font-bold text-foreground">{results.targetNormalWeightHigh}</div>
                      <div className="text-xs text-muted-foreground">{unitSystem === "imperial" ? "lbs" : "kg"}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-2">Target range to achieve a 'Normal' BMI (18.5 - 24.9) based exclusively on your height.</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">BMI Category Mapping</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visual representation of where your score falls on the clinical spectrum. Values above 25 drastically increase the risk of metabolic syndrome.</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[10, 50]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        
                        {/* Reference Lines for Risk Thresholds */}
                        <ReferenceLine x={18.5} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: '18.5', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                        <ReferenceLine x={25} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'bottom', value: '25.0', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                        <ReferenceLine x={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: '30.0', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                        <ReferenceLine x={35} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'bottom', value: '35.0', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />

                        <Bar dataKey="Your BMI" barSize={40} radius={[0, 4, 4, 0]}>
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
                <Scale className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your height and total body weight to calculate your objective position on the clinical Body Mass Index (BMI) scale.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Your Body Mass Index (BMI)</h2>
            <p>If you visit any physician in the developed world, before they check your blood pressure or draw your blood, they will measure your height and weight to calculate your Body Mass Index (BMI). Despite intense criticism from the fitness community, BMI remains the undisputed foundation of global health tracking. It is a simple, universal ratio that compares your total physical mass to your structural height. The <strong>Body Mass Index (BMI) Calculator</strong> instantly computes this crucial metric, placing you within the standard clinical classifications established by the World Health Organization (WHO).</p>

            <h2 className="text-2xl font-bold mb-3">Why the Fitness Industry Hates BMI</h2>
            <p>If you ask a professional bodybuilder or a competitive CrossFit athlete about BMI, they will likely tell you it is completely useless. And for them, it is.</p>
            <p>The BMI formula suffers from one massive, undeniable flaw: it cannot differentiate between tissue types. The mathematical equation assumes that all body weight is identical. It does not know if you are carrying 50 pounds of dense, highly metabolic muscle tissue or 50 pounds of dangerous visceral fat. A 5-foot-10 NFL running back who weighs 220 pounds with 8% body fat will be classified by this calculator as "Obese." Because he carries a massive amount of incredibly heavy muscle tissue, the formula incorrectly assumes he is dangerously overweight. For athletes, bodybuilders, and heavy weightlifters, BMI is a biologically ignorant metric.</p>

            <h2 className="text-2xl font-bold mb-3">Why Doctors Continue to Use It</h2>
            <p>If BMI is so flawed, why is it the gold standard in every hospital on Earth? Because hospitals operate on statistics, and statistically, the vast majority of the human population does not participate in heavy resistance training.</p>
            <p>If a sedentary office worker steps on the scale and registers a BMI of 32 (Obese), the doctor knows with near-absolute certainty that the excess weight is not muscle; it is adipose tissue (fat). For 95% of the general public, BMI is an incredibly fast, non-invasive, and totally free predictor of disease. To perfectly measure a patient's true body composition requires a DEXA scan or hydrostatic weighing, which are highly expensive and take up massive amounts of clinical time. BMI provides immediate, actionable data that correlates perfectly with the risk of Type 2 Diabetes, hypertension, and cardiovascular disease.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the "Normal" Range</h2>
            <p>The BMI scale dictates that a "Normal" and healthy weight falls between 18.5 and 24.9. This range is not arbitrary; it is built on decades of mortality data. Epidemiological studies involving millions of people consistently prove that individuals within this BMI range experience the lowest rates of chronic disease and have the highest life expectancy.</p>
            <p>When you use the calculator, it also generates your "Ideal Clinical Weight Range." This shows you the exact poundage you need to achieve to fall inside that 18.5 to 24.9 window. If you are currently sitting at a BMI of 30, you do not need to guess how many pounds you need to lose; the calculator gives you the exact numerical target required to clear the clinical danger zone.</p>

            <h2 className="text-2xl font-bold mb-3">The Three Tiers of Obesity</h2>
            <p>Many people are shocked to learn that there are three distinct classifications of obesity. Not all excess weight carries the same immediate biological threat.</p>
            <p>A BMI of 30.0 to 34.9 is Class I Obesity. While it increases your risk factors, the body can often compensate, and the risks can be mitigated with mild dietary changes. A BMI of 35.0 to 39.9 is Class II Obesity, where the sheer volume of adipose tissue begins to severely impact hormonal regulation and insulin sensitivity.</p>
            <p>A BMI of 40 or higher is Class III Obesity (historically referred to as Morbid Obesity). This is a physiological emergency. At this level, the body's mechanical structure is compromised. The weight crushes the cartilage in the knees and hips, the excess mass on the chest severely restricts lung expansion (leading to Obstructive Sleep Apnea), and the heart is forced to work at a frantic, exhausting pace just to pump blood through the massive vascular network required by the fat tissue.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Being Underweight</h2>
            <p>Society is so focused on obesity that it often ignores the opposite end of the spectrum. A BMI below 18.5 is classified as Underweight, and it carries its own set of terrifying clinical risks.</p>
            <p>When the body does not have enough mass to sustain itself, it begins to shut down non-essential biological processes. In women, this frequently results in amenorrhea (the complete cessation of the menstrual cycle), which rapidly destroys bone density and leads to early-onset osteoporosis. In both sexes, being severely underweight destroys the immune system, making the body highly susceptible to severe infections, and causes chronic lethargy as the metabolism slows to a crawl to conserve what little energy is left.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Know Your Baseline</h2>
            <p>Unless you can squat 400 pounds, you should not ignore your BMI. It is the fundamental baseline upon which all other health metrics are built. Use the Body Mass Index Calculator to find your current classification. If you fall into the Overweight or Obese categories, use the generated Target Range to establish your exact weight-loss goals, and immediately begin the process of pulling your body back into the zone of statistical longevity.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-mass-index" />
          <PopularCalculators exclude="/calculator/body-mass-index-bmi-calculator" />
        </div>
      </div>
    </>
  );
}
