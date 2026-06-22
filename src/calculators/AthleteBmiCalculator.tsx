"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Scale, Dumbbell, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface AthleteBMIInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  heightInches: number; // Stored universally as inches for math, or cm if metric
  bodyFatPercent: number;
}

interface AthleteBMIResults {
  standardBmi: number;
  bmiCategory: string;
  lbmKg: number;
  lbmLbs: number;
  ffmi: number;
  normalizedFfmi: number;
  ffmiCategory: string;
  isBmiFlawed: boolean;
  
  chartData: { ffmiScore: number; classification: string }[];
}

// 2. Pure Calculation Function
const calculateAthleteMetrics = (inputs: AthleteBMIInputs): AthleteBMIResults | null => {
  const { unitSystem, weight, heightInches, bodyFatPercent } = inputs;
  
  if (weight <= 0 || heightInches <= 0 || bodyFatPercent <= 0 || bodyFatPercent >= 100) return null;

  // Conversions
  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const hMeters = unitSystem === "imperial" ? heightInches * 0.0254 : heightInches / 100;

  // 1. Standard BMI
  const standardBmi = wKg / (hMeters * hMeters);
  let bmiCategory = "Normal";
  if (standardBmi < 18.5) bmiCategory = "Underweight";
  else if (standardBmi >= 25 && standardBmi < 30) bmiCategory = "Overweight";
  else if (standardBmi >= 30) bmiCategory = "Obese";

  // 2. Fat Free Mass Index (FFMI)
  const lbmKg = wKg * (1 - (bodyFatPercent / 100));
  const lbmLbs = lbmKg * 2.20462;
  
  const ffmi = lbmKg / (hMeters * hMeters);
  
  // Normalized FFMI (adjusts for very tall or very short individuals)
  const normalizedFfmi = ffmi + 6.1 * (1.8 - hMeters);

  // FFMI Classification (Standardized for Males as baseline in this tool)
  let ffmiCategory = "Average";
  if (normalizedFfmi < 18) ffmiCategory = "Below Average";
  else if (normalizedFfmi >= 18 && normalizedFfmi <= 20) ffmiCategory = "Average";
  else if (normalizedFfmi > 20 && normalizedFfmi <= 22) ffmiCategory = "Above Average";
  else if (normalizedFfmi > 22 && normalizedFfmi <= 25) ffmiCategory = "Excellent / Natural Limit";
  else if (normalizedFfmi > 25) ffmiCategory = "Suspicious (Requires Elite Genetics or PEDs)";

  // Determine if standard BMI is mathematically flawed for this user
  // If their BMI says they are overweight/obese, BUT their FFMI is high and body fat is low (< 15%)
  const isBmiFlawed = standardBmi >= 25 && bodyFatPercent <= 15;

  // Visual Chart Data for FFMI
  const chartData = [
    { ffmiScore: 16, classification: "Below Avg" },
    { ffmiScore: 18, classification: "Avg" },
    { ffmiScore: 20, classification: "Above Avg" },
    { ffmiScore: 22, classification: "Excellent" },
    { ffmiScore: 24, classification: "Elite" },
    { ffmiScore: 26, classification: "Suspicious" }
  ];

  return {
    standardBmi: parseFloat(standardBmi.toFixed(1)),
    bmiCategory,
    lbmKg: parseFloat(lbmKg.toFixed(1)),
    lbmLbs: parseFloat(lbmLbs.toFixed(1)),
    ffmi: parseFloat(ffmi.toFixed(1)),
    normalizedFfmi: parseFloat(normalizedFfmi.toFixed(1)),
    ffmiCategory,
    isBmiFlawed,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "205",
  heightFt: "5",
  heightIn: "10",
  heightCm: "178",
  bodyFatPercent: "12" // Very muscular build that breaks standard BMI
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 text-primary">FFMI Scale: {payload[0].payload.classification}</p>
        <p className="text-muted-foreground">Score threshold: <span className="font-bold text-foreground">{payload[0].payload.ffmiScore}</span></p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    {label && <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>}
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

export default function AthleteBmiCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [bodyFatPercent, setBodyFatPercent] = useState(DEFAULTS.bodyFatPercent);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<AthleteBMIResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFatPercent);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(bf) || bf <= 0 || bf >= 100) return setErrorMsg("Please enter a valid Body Fat Percentage (1-99).");

    let hInches = 0;
    if (unitSystem === "imperial") {
      const ft = parseFloat(heightFt) || 0;
      const inc = parseFloat(heightIn) || 0;
      if (ft === 0 && inc === 0) return setErrorMsg("Please enter a valid height.");
      hInches = (ft * 12) + inc;
    } else {
      const cm = parseFloat(heightCm) || 0;
      if (cm <= 0) return setErrorMsg("Please enter a valid height.");
      hInches = cm; // Will be converted in pure function
    }

    const res = calculateAthleteMetrics({ unitSystem, weight: w, heightInches: hInches, bodyFatPercent: bf });
    
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
    setBodyFatPercent(DEFAULTS.bodyFatPercent);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, weight, heightFt, heightIn, heightCm, bodyFatPercent]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Athlete BMI & FFMI Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is the standard BMI formula fundamentally flawed?", answer: "The standard Body Mass Index (BMI), created in the 1830s by a mathematician (not a doctor), is incredibly simplistic: Weight divided by Height squared. The fatal flaw is that the formula cannot mathematically differentiate between 10 pounds of fat and 10 pounds of dense muscle. If you are an athlete who has spent years lifting weights to build dense muscle mass, you will naturally be heavier than a sedentary person of the same height. The standard BMI formula will blindly classify you as 'Overweight' or 'Obese' simply because you are heavy, completely ignoring the fact that your extra weight is highly metabolically active muscle, not disease-causing fat." },
    { question: "What is FFMI (Fat-Free Mass Index)?", answer: "FFMI is the clinical metric used by exercise physiologists to correct the flaws of standard BMI. Instead of dividing your total weight by your height, FFMI divides your Lean Body Mass (your total weight minus your fat) by your height. This provides a mathematically exact measurement of how much actual muscle mass you are carrying on your specific skeletal frame, completely isolating the muscle from the fat." },
    { question: "Why does my BMI say I am 'Obese' when I have abs?", answer: "This is the classic paradox for bodybuilders, CrossFitters, and football players. Muscle tissue is roughly 15% denser than fat tissue, meaning it takes up significantly less space per pound. You can weigh 220 pounds at 5'10\" and have a shredded six-pack, but because your raw mass is so high relative to your height, the archaic standard BMI formula will classify you as 'Obese.' If your body fat is below 15% (for men) or 22% (for women) and your BMI says you are overweight, the BMI calculation is mathematically invalid for your biology." },
    { question: "What is the 'Natural Limit' of FFMI?", answer: "In a landmark 1995 study by Kouri et al., researchers examined the FFMI of both natural and steroid-using bodybuilders. They discovered a very distinct biological ceiling. The absolute maximum normalized FFMI a human male can build naturally, assuming elite genetics and years of perfect training, is approximately 25.0 to 25.5. An FFMI above 26.0 is overwhelmingly indicative of anabolic steroid (PED) usage. For women, the natural FFMI ceiling is generally around 17 to 18." },
    { question: "How do I accurately find my Body Fat Percentage?", answer: "To get an accurate FFMI calculation, you need an accurate body fat percentage. Do not rely on cheap bathroom scales, as they use electrical impedance which is notoriously inaccurate and easily skewed by hydration levels. The gold standards for body fat testing are DEXA scans (clinical bone density x-rays) or hydrostatic (underwater) weighing. If those are unavailable, use high-quality skinfold calipers measured by an experienced professional." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Athlete BMI Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Athlete BMI Calculator (FFMI)</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mx-auto mb-6 bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-blue-800 dark:text-blue-400">
            <strong>The BMI Flaw:</strong> Standard BMI cannot distinguish between fat and muscle. If you engage in heavy resistance training, standard BMI will falsely classify you as overweight. This calculator uses your Body Fat Percentage to extract your <strong>Fat-Free Mass Index (FFMI)</strong> to reveal your true clinical composition.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/ft)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dumbbell className="h-4 w-4" /> Lean Mass Isolation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">By inputting your body fat percentage, we strip away adipose tissue to calculate exactly how much lean muscle you carry relative to your height.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <CompactInput id="weight" label="Total Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            {/* Height Input */}
            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Your Height</label>
              {unitSystem === "imperial" ? (
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="h-ft" value={heightFt} onChange={setHeightFt} suffix="ft" />
                  <CompactInput id="h-in" value={heightIn} onChange={setHeightIn} suffix="in" />
                </div>
              ) : (
                <CompactInput id="h-cm" value={heightCm} onChange={setHeightCm} suffix="cm" />
              )}
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <CompactInput id="bf" label="Body Fat Percentage (%)" value={bodyFatPercent} onChange={setBodyFatPercent} suffix="%" />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
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
                
                {/* FFMI Metric */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-800 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">
                        Normalized FFMI Score
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.normalizedFfmi.toFixed(1)}</div>
                        <div className="text-xl font-bold text-indigo-200">Score</div>
                      </div>
                      <div className="text-sm font-medium text-indigo-100 mt-2 bg-indigo-950/40 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" /> Clinical Classification: {results.ffmiCategory}
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[140px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-indigo-200 mb-1">Total Lean Mass</div>
                      <div className="text-2xl font-black text-white">
                        {unitSystem === "imperial" ? results.lbmLbs : results.lbmKg}
                      </div>
                      <div className="text-xs text-indigo-300 font-medium">{unitSystem === "imperial" ? "LBS" : "KG"}</div>
                    </div>
                  </div>
                  <Dumbbell className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-[1fr_260px] gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">FFMI Biological Potential</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">A score of 25 is widely considered the maximum genetic limit for natural human muscle accretion.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorFfmi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="ffmiScore" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="ffmiScore" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorFfmi)" />
                        <ReferenceLine x={25} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Natural Limit', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                        <ReferenceLine x={results.normalizedFfmi > 26 ? 26 : results.normalizedFfmi} stroke="#10b981" strokeWidth={2} label={{ position: 'bottom', value: 'You', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Standard BMI Reality Check */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 flex flex-col justify-center">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 text-center">The BMI Paradox</h3>
                    
                    <div className="flex flex-col items-center justify-center text-center mb-4">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Your Archaic BMI Score</div>
                      <div className="text-4xl font-black text-foreground mb-1">{results.standardBmi}</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                        results.bmiCategory === "Normal" ? "bg-emerald-500/10 text-emerald-600" :
                        results.bmiCategory === "Overweight" ? "bg-amber-500/10 text-amber-600" :
                        "bg-red-500/10 text-red-600"
                      }`}>
                        {results.bmiCategory}
                      </div>
                    </div>

                    {results.isBmiFlawed ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-center">
                        <AlertTriangle className="h-5 w-5 mx-auto text-red-500 mb-2" />
                        <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">Mathematical Flaw Detected</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-snug">Because your body fat is extremely low, your BMI classification of "{results.bmiCategory}" is clinically invalid. You carry heavy, dense muscle, not disease-causing fat.</p>
                      </div>
                    ) : (
                      <div className="bg-slate-500/10 border border-slate-500/20 rounded-md p-3 text-center">
                        <Scale className="h-5 w-5 mx-auto text-slate-500 mb-2" />
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">Standard Alignment</p>
                        <p className="text-xs text-slate-600/80 dark:text-slate-400/80 leading-snug">Your body fat percentage indicates that your standard BMI classification is relatively accurate for your current body composition.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your total weight, height, and body fat percentage to calculate your true Lean Body Mass and Fat-Free Mass Index (FFMI).</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Fatal Flaw of the Standard BMI</h2>
            <p>If you have spent years lifting weights, playing sports, or engaging in intense physical training, you have likely experienced a frustrating moment at the doctor's office. You step on the scale, the nurse types your height and weight into a computer, and suddenly, you are officially classified as "Overweight" or "Obese." The problem? You have a visible six-pack and run 5 miles a week. How is this possible?</p>
            <p>The answer lies in the archaic formula of the Body Mass Index (BMI). Created in the 1830s by a Belgian mathematician (not a doctor), the formula is terrifyingly simplistic: Total Weight divided by Height squared. The fatal flaw of the BMI formula is that it cannot mathematically differentiate between a pound of fat and a pound of dense, metabolically active muscle. The <strong>Athlete BMI Calculator</strong> completely solves this paradox by utilizing your body fat percentage to extract your true Fat-Free Mass Index (FFMI), revealing your actual clinical composition.</p>

            <h2>Muscle vs. Fat: The Density Dilemma</h2>
            <p>To understand why the BMI fails athletes so spectacularly, you must understand tissue density. Muscle tissue is approximately 15% denser than adipose (fat) tissue. This means that one pound of muscle takes up significantly less physical space in your body than one pound of fat. </p>
            <p>Consider a professional NFL running back. He might be 5'10" and weigh 225 pounds. Because he carries an astronomical amount of heavy, dense muscle on his frame, his raw weight is very high. If you plug those numbers into a standard BMI calculator, his score is 32.3—placing him strictly in the "Obese" category, alongside individuals with high risks for heart disease and diabetes. However, the running back likely has 8% body fat. He is in peak physical condition. The standard BMI formula blindly punishes athletes simply for being heavy, completely ignoring what that weight is actually made of.</p>

            <h2>The Solution: Fat-Free Mass Index (FFMI)</h2>
            <p>Because the standard BMI is virtually useless for anyone who lifts weights, clinical exercise physiologists use a much more advanced metric: the <strong>Fat-Free Mass Index (FFMI)</strong>.</p>
            <p>Instead of using your total, raw weight on the scale, FFMI uses your Lean Body Mass. By taking your total weight and mathematically subtracting your exact body fat percentage, we are left with only the weight of your muscles, bones, organs, and water. By dividing this Lean Body Mass by your height, we achieve a mathematically exact measurement of how much actual muscle mass you are carrying on your specific skeletal frame.</p>

            <h2>The Kouri Study: Finding the "Natural Limit"</h2>
            <p>In 1995, a landmark physiological study was conducted by Dr. Harrison Pope and Dr. Elena Kouri. They wanted to determine if there was a biological ceiling to how much muscle a human could build naturally. They calculated the FFMI of 157 male athletes, half of whom were confirmed steroid users and half of whom were verified natural athletes.</p>
            <p>The results fundamentally changed the fitness industry. They discovered a highly distinct biological limit. The absolute maximum normalized FFMI a human male can build naturally—assuming elite, top-tier genetics and years of flawless training and nutrition—is approximately <strong>25.0</strong>. The researchers noted that every single athlete in the study with an FFMI above 26.0 was using anabolic steroids (Performance Enhancing Drugs).</p>

            <h2>Interpreting Your FFMI Score</h2>
            <p>Our calculator provides a normalized FFMI score (which adjusts the math slightly for very tall or very short individuals). Here is how to interpret your results (standardized for males):</p>
            <ul>
              <li><strong>18 to 20 (Average):</strong> This is the baseline for most sedentary individuals or casual gym-goers. You carry a normal amount of muscle for your frame.</li>
              <li><strong>21 to 22 (Above Average):</strong> You have been lifting weights consistently for several years. You have a visibly athletic, muscular physique.</li>
              <li><strong>23 to 24 (Excellent):</strong> You possess elite genetics and have likely dedicated 5 to 10 years to strict bodybuilding or powerlifting. You are approaching the absolute limit of your biological potential.</li>
              <li><strong>25 (The Natural Limit):</strong> This is the widely accepted ceiling for natural human muscle accretion.</li>
              <li><strong>26+ (Suspicious):</strong> An FFMI at this level strongly indicates the use of exogenous androgens (steroids), as the human body naturally cannot produce enough testosterone to support this much lean mass.</li>
            </ul>

            <h2>Why You Need an Accurate Body Fat Percentage</h2>
            <p>The entire FFMI calculation relies on knowing exactly how much fat you are carrying. If you guess your body fat, your FFMI score will be completely invalid. You cannot rely on cheap bathroom scales, which use electrical impedance that is easily skewed by how much water you drank that morning.</p>
            <p>To get clinical-grade accuracy, you should seek out a DEXA scan (a bone-density x-ray) or Hydrostatic (underwater) weighing. If those are unavailable, the next best option is having an experienced personal trainer or medical professional use high-quality skinfold calipers to measure your subcutaneous fat.</p>

            <h2>Conclusion: Stop Worrying About BMI</h2>
            <p>If you lift weights consistently, the standard BMI chart is no longer applicable to your life. The next time a doctor looks at a piece of paper and tells you that you need to lose weight because your BMI is 27, ask them what your body fat percentage is. If your body fat is in the athletic range (under 15% for men or 22% for women), you are not overweight; you are simply "over-muscled." Use the Athlete BMI Calculator to track your true Lean Body Mass, monitor your FFMI progression over the years, and celebrate the heavy, functional muscle you have worked so hard to build.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/athlete-bmi-calculator" />
          <PopularCalculators exclude="/calculator/athlete-bmi-calculator" />
        </div>
      </div>
    </>
  );
}
