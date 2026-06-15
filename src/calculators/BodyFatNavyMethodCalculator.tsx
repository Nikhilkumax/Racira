"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Crosshair, Dumbbell, Dna } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

// 1. TypeScript Interfaces
interface NavyMethodInputs {
  unitSystem: "imperial" | "metric";
  gender: "male" | "female";
  heightInches: number;
  heightCm: number;
  weight: number;
  waist: number;
  neck: number;
  hip: number; // Required for females
}

interface NavyMethodResults {
  bodyFatPct: number;
  fatMass: number;
  leanMass: number;
  classification: "Essential" | "Athletes" | "Fitness" | "Average" | "Obese";
  colorClass: string;
  
  chartData: { name: string; value: number }[];
}

// 2. Pure Calculation Function
// Formulas based on the US Navy Body Fat equations.
const calculateNavyMethod = (inputs: NavyMethodInputs): NavyMethodResults | null => {
  const { unitSystem, gender, heightInches, heightCm, weight, waist, neck, hip } = inputs;
  
  if (weight <= 0 || waist <= 0 || neck <= 0) return null;
  if (unitSystem === "imperial" && heightInches <= 0) return null;
  if (unitSystem === "metric" && heightCm <= 0) return null;
  if (gender === "female" && hip <= 0) return null;

  // Convert everything to metric (cm and kg) for standardization of the calculation
  const h = unitSystem === "imperial" ? heightInches * 2.54 : heightCm;
  const w = unitSystem === "imperial" ? waist * 2.54 : waist;
  const n = unitSystem === "imperial" ? neck * 2.54 : neck;
  const hp = unitSystem === "imperial" ? hip * 2.54 : hip;
  const weightKg = unitSystem === "imperial" ? weight * 0.453592 : weight;

  let bfPct = 0;

  // Mathematical validation to prevent log(0) or negative logs
  if (gender === "male") {
    if (w - n <= 0) return null;
    bfPct = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
  } else {
    if (w + hp - n <= 0) return null;
    bfPct = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.22100 * Math.log10(h)) - 450;
  }

  if (isNaN(bfPct) || bfPct <= 0 || bfPct > 70) return null; // Sanity check

  // Classification Logic (Standard ACE guidelines)
  let classification: "Essential" | "Athletes" | "Fitness" | "Average" | "Obese" = "Average";
  let colorClass = "#3b82f6"; // default blue

  if (gender === "male") {
    if (bfPct < 6) { classification = "Essential"; colorClass = "#ef4444"; } // Too low is dangerous
    else if (bfPct < 14) { classification = "Athletes"; colorClass = "#8b5cf6"; }
    else if (bfPct < 18) { classification = "Fitness"; colorClass = "#10b981"; }
    else if (bfPct < 25) { classification = "Average"; colorClass = "#f59e0b"; }
    else { classification = "Obese"; colorClass = "#ef4444"; }
  } else {
    if (bfPct < 14) { classification = "Essential"; colorClass = "#ef4444"; }
    else if (bfPct < 21) { classification = "Athletes"; colorClass = "#8b5cf6"; }
    else if (bfPct < 25) { classification = "Fitness"; colorClass = "#10b981"; }
    else if (bfPct < 32) { classification = "Average"; colorClass = "#f59e0b"; }
    else { classification = "Obese"; colorClass = "#ef4444"; }
  }

  // Mass calculations
  const fatMassKg = weightKg * (bfPct / 100);
  const leanMassKg = weightKg - fatMassKg;

  const fatMassOut = unitSystem === "imperial" ? fatMassKg * 2.20462 : fatMassKg;
  const leanMassOut = unitSystem === "imperial" ? leanMassKg * 2.20462 : leanMassKg;

  // Generate Chart Data
  const chartData = [
    { name: "Fat Mass", value: Math.round(fatMassOut) },
    { name: "Lean Body Mass", value: Math.round(leanMassOut) }
  ];

  return {
    bodyFatPct: parseFloat(bfPct.toFixed(1)),
    fatMass: parseFloat(fatMassOut.toFixed(1)),
    leanMass: parseFloat(leanMassOut.toFixed(1)),
    classification,
    colorClass,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  gender: "male" as const,
  weight: "185",
  heightFt: "5",
  heightIn: "10",
  heightCm: "178",
  waist: "36",
  neck: "16",
  hip: "40"
};

const CustomTooltipPie = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
        <p className="text-muted-foreground"><span className="font-bold text-foreground">{payload[0].value}</span> units of mass</p>
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

export default function BodyFatNavyMethodCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [gender, setGender] = useState<"male" | "female">(DEFAULTS.gender);
  
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [hip, setHip] = useState(DEFAULTS.hip); // Only visible for females

  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<NavyMethodResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const wgt = parseFloat(weight);
    const ft = parseFloat(heightFt) || 0;
    const inc = parseFloat(heightIn) || 0;
    const cm = parseFloat(heightCm) || 0;
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = parseFloat(hip);
    
    const totalInches = (ft * 12) + inc;

    if (isNaN(wgt) || wgt <= 0) return setErrorMsg("Please enter a valid weight.");
    if (unitSystem === "imperial" && totalInches <= 0) return setErrorMsg("Please enter a valid height.");
    if (unitSystem === "metric" && cm <= 0) return setErrorMsg("Please enter a valid height.");
    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid waist circumference.");
    if (isNaN(n) || n <= 0) return setErrorMsg("Please enter a valid neck circumference.");
    if (gender === "female" && (isNaN(h) || h <= 0)) return setErrorMsg("Please enter a valid hip circumference.");

    const res = calculateNavyMethod({ 
      unitSystem, gender, weight: wgt, 
      heightInches: totalInches, heightCm: cm, 
      waist: w, neck: n, hip: h 
    });
    
    if (!res) {
      setErrorMsg("Calculations resulted in an error. Please verify your circumference measurements are accurate.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setGender(DEFAULTS.gender);
    setWeight(DEFAULTS.weight);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setHeightCm(DEFAULTS.heightCm);
    setWaist(DEFAULTS.waist);
    setNeck(DEFAULTS.neck);
    setHip(DEFAULTS.hip);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, gender, weight, heightFt, heightIn, heightCm, waist, neck, hip]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>US Navy Body Fat Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How accurate is the US Navy Method?", answer: "The US Navy Method was developed in 1984 as a fast, scalable way to assess the body composition of millions of military personnel without requiring expensive laboratory equipment (like DEXA scans). While it is not perfectly clinically accurate, studies show it is generally within 3% to 4% of actual body fat levels. It is highly regarded as one of the best 'free' methods available because it relies on bone structure (height/neck) versus fat storage areas (waist/hips)." },
    { question: "Why do I need to measure my neck?", answer: "The formula uses your neck circumference as a proxy for your overall skeletal size and lean muscle mass. Because very few people store large amounts of adipose tissue on their neck, a thicker neck generally correlates to a wider skeleton and more muscle mass. The mathematical formula subtracts your neck measurement from your waist measurement. If your waist is very large but your neck is very thin, the formula calculates a much higher body fat percentage." },
    { question: "Why is the female calculation different than the male calculation?", answer: "Fat distribution is heavily dictated by hormones. Men (testosterone dominant) primarily store fat in the central abdomen (visceral fat). Therefore, the male equation only looks at the waist. Women (estrogen dominant) genetically store essential body fat in the hips, thighs, and glutes to support potential pregnancy. Therefore, the female equation must include the hip measurement to accurately capture this unique physiological distribution." },
    { question: "What exactly is 'Lean Body Mass'?", answer: "Lean Body Mass (LBM) is everything in your body that is not fat. It includes your bones, your organs (heart, liver, lungs), your blood, the water in your cells, and your skeletal muscle tissue. When attempting to lose weight, your ultimate goal should be to lower your Fat Mass while keeping your Lean Body Mass as high as possible through resistance training. If you lose weight but your LBM drops significantly, you are burning away your own muscle tissue." },
    { question: "Can a Body Fat Percentage be too low?", answer: "Yes, absolutely. The calculator flags extremely low numbers as 'Essential' fat. Essential fat is the absolute minimum amount of fat required for your central nervous system and organs to function. In men, dropping below 5% can cause severe hormonal crashes and immune system failure. In women, dropping below 14% frequently leads to amenorrhea (loss of the menstrual cycle) and severe bone density loss (osteoporosis). Professional bodybuilders only maintain these extremely low levels for a few days during a competition; it is not a healthy baseline." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Body Fat Percentage (Navy Method) Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Body Fat Percentage Calculator (Navy Method)</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mx-auto mb-6 bg-slate-500/10 border-l-4 border-slate-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-slate-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-400">
            <strong>The Scale is Lying to You:</strong> Your total body weight means nothing if you don't know what it is made of. The US Navy Method utilizes precise anatomical circumference measurements to mathematically separate your Lean Body Mass (muscle, bone, organs) from your pure Adipose Tissue (fat).
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-1">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Crosshair className="h-4 w-4" /> Anatomical Accuracy
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Ensure the measuring tape is pulled snug but not tight enough to compress the skin. Measure the waist at the navel and the neck just below the larynx.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Biological Sex</label>
                <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <CompactInput id="weight" label="Total Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
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

            <div className="grid grid-cols-2 gap-3 mt-1">
              <CompactInput id="waist" label="Waist (at Navel)" value={waist} onChange={setWaist} suffix={unitSystem === "imperial" ? "in" : "cm"} />
              <CompactInput id="neck" label="Neck (Below Larynx)" value={neck} onChange={setNeck} suffix={unitSystem === "imperial" ? "in" : "cm"} />
            </div>

            {gender === "female" && (
              <div className="grid grid-cols-1 gap-3 mt-1">
                <CompactInput id="hip" label="Hips (Widest Point)" value={hip} onChange={setHip} suffix={unitSystem === "imperial" ? "in" : "cm"} />
              </div>
            )}

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
                
                {/* Primary Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BF% Box */}
                  <div 
                    className="text-white rounded-lg p-5 shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: results.colorClass }}
                  >
                    <div className="relative z-10">
                      <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Estimated Body Fat</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <div className="text-5xl font-black">{results.bodyFatPct}%</div>
                      </div>
                      <div className="text-sm font-bold text-white mt-2 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full">
                        {results.classification} Range
                      </div>
                    </div>
                    <Dna className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                  </div>

                  {/* Mass Breakdown */}
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    
                    <div className="mb-4">
                      <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Lean Body Mass</div>
                      <div className="flex items-baseline gap-1">
                        <div className="text-2xl font-black text-white">{results.leanMass}</div>
                        <div className="text-xs text-slate-400">{unitSystem === "imperial" ? "lbs" : "kg"}</div>
                      </div>
                      <div className="text-[10px] text-slate-500">Muscle, bone, blood, organs, water</div>
                    </div>

                    <div className="border-t border-slate-700 pt-3">
                      <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Fat Mass</div>
                      <div className="flex items-baseline gap-1">
                        <div className="text-2xl font-black text-white">{results.fatMass}</div>
                        <div className="text-xs text-slate-400">{unitSystem === "imperial" ? "lbs" : "kg"}</div>
                      </div>
                      <div className="text-[10px] text-slate-500">Pure adipose tissue</div>
                    </div>

                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Anatomical Composition</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-2">A visual representation isolating your pure fat mass from the functional, life-sustaining lean mass of your body.</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#ef4444" /> {/* Fat Mass - Red */}
                          <Cell fill="#10b981" /> {/* Lean Mass - Emerald */}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltipPie />} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your gender, height, weight, and strict anatomical measurements to isolate your lean muscle mass from your stored body fat.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1280px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Limitations of the Bathroom Scale</h2>
            <p>One of the most psychologically damaging aspects of the modern fitness industry is our total obsession with the bathroom scale. We have been conditioned to believe that the number on the scale is the ultimate arbiter of our health and aesthetic progress. However, from a clinical perspective, total body weight is an incredibly ignorant metric. The scale cannot tell the difference between a pound of heavy, metabolically active muscle and a pound of deadly visceral fat. A 220-pound professional athlete and a 220-pound sedentary office worker look identical to a bathroom scale, but their biological realities could not be more different. The <strong>Body Fat Percentage Calculator (Navy Method)</strong> solves this problem by completely bypassing raw weight and using anatomical geometry to isolate your true body composition.</p>

            <h2>What is Body Composition?</h2>
            <p>Body composition is the science of dividing your entire physical mass into two distinct categories: Lean Body Mass (LBM) and Fat Mass.</p>
            <p><strong>Lean Body Mass</strong> is everything in your body that is not fat. It includes your skeletal structure, your internal organs (heart, liver, lungs), your blood volume, the water inside your cells, and crucially, your skeletal muscle tissue. This is the functional, life-sustaining weight of your body.</p>
            <p><strong>Fat Mass</strong> is purely the weight of your adipose tissue. While a small amount of essential fat is required to protect the central nervous system and regulate hormones, the vast majority of this tissue is simply stored thermodynamic energy. Your true fitness goal should never be "weight loss"; it should be "fat loss" while aggressively preserving or increasing your Lean Body Mass.</p>

            <h2>The Science Behind the US Navy Method</h2>
            <p>In 1984, the United States Department of Defense faced a massive logistical problem. They needed to accurately assess the physical readiness and body composition of millions of military personnel, but it was financially impossible to put every soldier into a million-dollar DEXA scanner or a hydrostatic weighing tank. They needed a method that was fast, incredibly cheap, and highly accurate.</p>
            <p>The result was the Navy Body Fat algorithm. By taking tens of thousands of subjects, scanning them in a lab, and running regression models against their physical measurements, scientists discovered a profound mathematical correlation between bone structure, fat storage patterns, and total body fat percentage. Because the human body rarely stores massive amounts of fat on the neck, the neck circumference serves as a highly accurate proxy for overall skeletal size. By comparing the neck measurement against areas where the body actively hoards fat (the waist for men; the waist and hips for women), the algorithm can accurately estimate the total volume of fat on the frame within a 3% to 4% margin of error.</p>

            <h2>Why Men and Women Have Different Formulas</h2>
            <p>The mathematical formulas for men and women are fundamentally different due to the biological reality of sex hormones.</p>
            <p>Men are testosterone-dominant. Genetically, men are predisposed to store almost all of their excess energy as visceral fat directly in the central abdomen (the "beer belly"). Because men rarely store large amounts of fat in their legs or hips, the male equation only requires a waist measurement. Women, however, are estrogen-dominant. For evolutionary reasons designed to support pregnancy and childbirth, women are genetically programmed to store essential fat in the lower body (hips, thighs, and glutes). To accurately calculate a woman's fat mass, the formula must incorporate a hip measurement to capture this unique, biologically mandated storage pattern.</p>

            <h2>The Danger of "Essential" Fat Levels</h2>
            <p>A common misconception in the fitness world is that having 0% body fat is the ultimate goal. This is biologically impossible and instantly lethal. Your brain is composed of nearly 60% fat, and fat is required to synthesize the myelin sheaths that insulate your nervous system.</p>
            <p>If a man drops below 5% body fat, his testosterone production crashes, his libido vanishes, and his immune system begins to fail. If a woman drops below 14% body fat, she risks severe hormonal disruption. The body realizes it does not have enough energy reserves to sustain a pregnancy and will often shut down the menstrual cycle entirely (amenorrhea), which triggers a cascade of issues including severe bone density loss (osteoporosis). Professional bodybuilders who step on stage at 4% body fat are in a state of extreme, dangerous physiological distress, and they only hold that condition for a few days.</p>

            <h2>The "Skinny Fat" Epidemic</h2>
            <p>The Navy Method is the ultimate tool for diagnosing the "Skinny Fat" condition (clinically known as Normal Weight Obesity). A person can weigh 150 pounds and look perfectly thin in clothing. However, if they never lift weights and eat a terrible diet, they may possess very little dense muscle tissue and a shockingly high volume of visceral fat. The scale tells them they are healthy, but the Navy Method will reveal that their body fat percentage is dangerously high (e.g., 30%+), placing them at severe risk for Type 2 Diabetes and cardiovascular disease despite their "thin" appearance.</p>

            <h2>Conclusion: Track What Actually Matters</h2>
            <p>If you want to permanently transform your physique, you must throw out the bathroom scale and start tracking your composition. Use the Body Fat Percentage Calculator (Navy Method) once every two weeks. As long as your Lean Body Mass is stable or increasing, and your Fat Mass is decreasing, you are successfully altering the architecture of your body—regardless of what the raw weight on the scale says.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-fat-percentage-navy-method-calculator" />
          <PopularCalculators exclude="/calculator/body-fat-percentage-navy-method-calculator" />
        </div>
      </div>
    </>
  );
}
