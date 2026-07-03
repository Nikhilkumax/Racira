"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Baby, TrendingUp, CalendarDays } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface PregnancyTargetInputs {
  unitSystem: "imperial" | "metric";
  heightInches: number;
  heightCm: number;
  startWeight: number; // Pre-pregnancy
  currentWeight: number;
  currentWeek: number; // 1 to 40
}

interface PregnancyTargetResults {
  startBmi: number;
  classification: "Underweight" | "Normal Weight" | "Overweight" | "Obese";
  
  totalGained: number;
  expectedMinGainAtWeek: number;
  expectedMaxGainAtWeek: number;
  
  trajectoryStatus: "Below Target" | "On Track" | "Exceeding Target";
  colorClass: string;
  unitLabel: string;
  
  chartData: any[];
}

// 2. Pure Calculation Function
// Trimester Math: 
// Q1 (Weeks 1-13): 1 to 4 lbs total (flat line).
// Q2/Q3 (Weeks 14-40): Linear weekly gain based on starting BMI.
const calculatePregnancyTrajectory = (inputs: PregnancyTargetInputs): PregnancyTargetResults | null => {
  const { unitSystem, heightInches, heightCm, startWeight, currentWeight, currentWeek } = inputs;
  
  if (startWeight <= 0 || currentWeight <= 0 || currentWeek < 1 || currentWeek > 40) return null;
  if (unitSystem === "imperial" && heightInches <= 0) return null;
  if (unitSystem === "metric" && heightCm <= 0) return null;

  // 1. Calculate Starting BMI
  let bmi = 0;
  if (unitSystem === "imperial") {
    bmi = (startWeight / Math.pow(heightInches, 2)) * 703;
  } else {
    const heightM = heightCm / 100;
    bmi = startWeight / Math.pow(heightM, 2);
  }

  let classification: PregnancyTargetResults["classification"] = "Normal Weight";
  
  // ACOG Guidelines for Single Pregnancy
  // Trimester 1 (0-13 weeks) flat gain targets:
  const t1Min = unitSystem === "imperial" ? 1.0 : 0.5;
  const t1Max = unitSystem === "imperial" ? 4.0 : 1.8;

  let weeklyMin = 0;
  let weeklyMax = 0;

  if (bmi < 18.5) {
    classification = "Underweight";
    weeklyMin = unitSystem === "imperial" ? 1.0 : 0.44;
    weeklyMax = unitSystem === "imperial" ? 1.3 : 0.58;
  } else if (bmi < 25) {
    classification = "Normal Weight";
    weeklyMin = unitSystem === "imperial" ? 0.8 : 0.35;
    weeklyMax = unitSystem === "imperial" ? 1.0 : 0.50;
  } else if (bmi < 30) {
    classification = "Overweight";
    weeklyMin = unitSystem === "imperial" ? 0.5 : 0.23;
    weeklyMax = unitSystem === "imperial" ? 0.7 : 0.33;
  } else {
    classification = "Obese";
    weeklyMin = unitSystem === "imperial" ? 0.4 : 0.17;
    weeklyMax = unitSystem === "imperial" ? 0.6 : 0.27;
  }

  // 2. Calculate Current Trajectory
  const totalGained = currentWeight - startWeight;
  
  let expectedMinGainAtWeek = 0;
  let expectedMaxGainAtWeek = 0;

  if (currentWeek <= 13) {
    // Pro-rate the 1-4 lb first trimester gain
    expectedMinGainAtWeek = (t1Min / 13) * currentWeek;
    expectedMaxGainAtWeek = (t1Max / 13) * currentWeek;
  } else {
    // Full T1 gain + weekly gain for weeks 14+
    const activeWeeks = currentWeek - 13;
    expectedMinGainAtWeek = t1Min + (activeWeeks * weeklyMin);
    expectedMaxGainAtWeek = t1Max + (activeWeeks * weeklyMax);
  }

  let trajectoryStatus: PregnancyTargetResults["trajectoryStatus"] = "On Track";
  let colorClass = "#10b981"; // Emerald

  if (totalGained > expectedMaxGainAtWeek) {
    trajectoryStatus = "Exceeding Target";
    colorClass = "#ef4444"; // Red
  } else if (totalGained < expectedMinGainAtWeek) {
    trajectoryStatus = "Below Target";
    colorClass = "#f59e0b"; // Yellow
  }

  // Generate Chart Data for the full 40 weeks to show the visual curve
  const chartData = [];
  for (let week = 1; week <= 40; week += 2) {
    let minG = 0;
    let maxG = 0;
    if (week <= 13) {
      minG = (t1Min / 13) * week;
      maxG = (t1Max / 13) * week;
    } else {
      const wActive = week - 13;
      minG = t1Min + (wActive * weeklyMin);
      maxG = t1Max + (wActive * weeklyMax);
    }
    
    chartData.push({
      week: week,
      "Safe Minimum": parseFloat(minG.toFixed(1)),
      "Safe Maximum": parseFloat(maxG.toFixed(1)),
      "Your Progress": Math.abs(currentWeek - week) <= 1 ? parseFloat(totalGained.toFixed(1)) : null
    });
  }

  return {
    startBmi: parseFloat(bmi.toFixed(1)),
    classification,
    totalGained: parseFloat(totalGained.toFixed(1)),
    expectedMinGainAtWeek: parseFloat(expectedMinGainAtWeek.toFixed(1)),
    expectedMaxGainAtWeek: parseFloat(expectedMaxGainAtWeek.toFixed(1)),
    trajectoryStatus,
    colorClass,
    unitLabel: unitSystem === "imperial" ? "lbs" : "kg",
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  startWeight: "150",
  currentWeight: "168",
  currentWeek: "24",
  heightFt: "5",
  heightIn: "6",
  heightCm: "168"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">Gestation Week {label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.name === "Your Progress") {
            return (
              <div key={index} className="flex justify-between items-center mb-1 bg-primary/10 p-1 rounded">
                <span className="font-bold text-primary mr-3">{entry.name}:</span>
                <span className="font-black text-primary">{entry.value}</span>
              </div>
            );
          }
          return (
            <div key={index} className="flex justify-between items-center mb-1">
              <span style={{ color: entry.color }} className="mr-3">{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          );
        })}
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

export default function PregnancyWeightTargetCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [startWeight, setStartWeight] = useState(DEFAULTS.startWeight);
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [currentWeek, setCurrentWeek] = useState(DEFAULTS.currentWeek);
  
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<PregnancyTargetResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const s = parseFloat(startWeight);
    const c = parseFloat(currentWeight);
    const w = parseInt(currentWeek, 10);
    const ft = parseFloat(heightFt) || 0;
    const inc = parseFloat(heightIn) || 0;
    const cm = parseFloat(heightCm) || 0;

    const totalInches = (ft * 12) + inc;

    if (isNaN(s) || s <= 0) return setErrorMsg("Please enter your pre-pregnancy weight.");
    if (isNaN(c) || c <= 0) return setErrorMsg("Please enter your current weight.");
    if (isNaN(w) || w < 1 || w > 40) return setErrorMsg("Please enter a valid pregnancy week (1-40).");
    if (unitSystem === "imperial" && totalInches <= 0) return setErrorMsg("Please enter a valid height.");
    if (unitSystem === "metric" && cm <= 0) return setErrorMsg("Please enter a valid height.");

    const res = calculatePregnancyTrajectory({ 
      unitSystem, 
      startWeight: s, 
      currentWeight: c,
      currentWeek: w,
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
    setStartWeight(DEFAULTS.startWeight);
    setCurrentWeight(DEFAULTS.currentWeight);
    setCurrentWeek(DEFAULTS.currentWeek);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setHeightCm(DEFAULTS.heightCm);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, startWeight, currentWeight, currentWeek, heightFt, heightIn, heightCm]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Pregnancy Trajectory Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    win.document.write(printRef.current.innerHTML);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
  };

  const faqs = [
    { question: "Why does the chart show almost no weight gain in the first 13 weeks?", answer: "During the first trimester (Weeks 1-13), the fetus grows from a microscopic cluster of cells into something roughly the size of a peach. The biological mass requirement is incredibly small. The American College of Obstetricians and Gynecologists (ACOG) guidelines state that a woman should only gain a total of 1 to 4 pounds during the entire first trimester. Gaining 15 pounds in the first trimester is not 'baby weight'; it is mathematically purely maternal adipose tissue (fat) caused by excess caloric consumption." },
    { question: "Why does the target change in the second trimester?", answer: "At week 14, the pregnancy enters a phase of rapid, linear fetal growth. The body is actively building the baby's skeletal structure, expanding the placenta, increasing amniotic fluid, and drastically expanding maternal blood volume. Because of this massive biological construction, the ACOG guidelines shift from a flat total target to a linear weekly target (e.g., gaining 1 pound per week for a mother with a 'Normal' starting BMI)." },
    { question: "What happens if I am 'Exceeding Target'?", answer: "If your trajectory status is 'Exceeding Target,' it means you are accumulating thermodynamic energy faster than the biological apparatus (the baby and placenta) can utilize it. This excess energy is stored as maternal visceral and subcutaneous fat. Exceeding the target trajectory significantly increases your risk of developing Gestational Diabetes, increases the likelihood of a Macrosomic (overweight) infant, and exponentially increases the difficulty of postpartum weight loss." },
    { question: "Is it dangerous to be 'Below Target'?", answer: "It depends entirely on your starting BMI. If you started the pregnancy 'Underweight,' falling below the target is highly dangerous, as the fetus may suffer from severe intrauterine growth restriction (IUGR). However, if you started the pregnancy 'Obese,' falling slightly below the target is often not concerning to physicians, as the fetus can draw upon your massive existing internal fat reserves for energy. Always consult your OB-GYN." },
    { question: "Why is height required for this calculator?", answer: "A flat target of 'gaining 25 pounds' is biologically ignorant unless you know the size of the organism. The only way the medical community can determine your safe weight-gain trajectory is by first calculating your pre-pregnancy BMI (which requires height). An obese mother requires a drastically slower weekly weight-gain trajectory than an underweight mother to prevent catastrophic metabolic complications." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pregnancy Weight Gain Target Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pregnancy Weight Gain Trajectory Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-1 mb-1">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <CalendarDays className="h-4 w-4" /> Timeline Metrics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter your starting weight, current weight, and exact gestation week to determine if your velocity of mass accumulation is mathematically safe.</p>
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

            <div className="grid grid-cols-2 gap-3 mt-1 border-t border-border pt-4">
              <CompactInput id="start" label="Starting Weight" value={startWeight} onChange={setStartWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="current" label="Current Weight" value={currentWeight} onChange={setCurrentWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            <div className="grid grid-cols-1 gap-3 mt-1">
              <CompactInput id="week" label="Current Gestation Week" value={currentWeek} onChange={setCurrentWeek} suffix="wks (1-40)" />
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
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Box */}
                  <div 
                    className="text-white rounded-lg p-5 shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: results.colorClass }}
                  >
                    <div className="relative z-10">
                      <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Trajectory Status (Week {currentWeek})</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <div className="text-3xl font-black">{results.trajectoryStatus}</div>
                      </div>
                      <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Total Gained: {results.totalGained} {results.unitLabel}
                      </div>
                    </div>
                    <Baby className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                  </div>

                  {/* Target Range Box */}
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-5 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">Safe Biological Channel (Week {currentWeek})</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-black text-white">{results.expectedMinGainAtWeek}</div>
                      <div className="text-slate-400 font-bold">to</div>
                      <div className="text-3xl font-black text-white">{results.expectedMaxGainAtWeek}</div>
                      <div className="text-xs text-slate-400">{results.unitLabel}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono">STARTING BMI: {results.startBmi} ({results.classification})</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">ACOG Safety Curve Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visual map of the acceptable weight gain channel based on your starting biology. The first trimester (Weeks 1-13) mandates minimal gain, followed by linear escalation.</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Stacked Areas for Percentile Bands */}
                        <Area type="monotone" dataKey="Safe Maximum" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
                        <Area type="monotone" dataKey="Safe Minimum" stroke="#3b82f6" strokeWidth={2} fill="#background" fillOpacity={1} />
                        
                        {/* Plot User's Specific Point if it exists on the chart */}
                        {results.chartData.map((entry, index) => {
                          if (entry["Your Progress"] !== null) {
                            return <ReferenceDot key={`dot-${index}`} x={entry.week} y={entry["Your Progress"]} r={8} fill={results.colorClass} stroke="white" strokeWidth={3} />;
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
                <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your current pregnancy week and weight to map your trajectory against the safe biological channel established by obstetricians.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Gestation</h2>
            <p>Pregnancy is a masterclass in structural biology. For 40 weeks, the female body acts as a hyper-efficient construction zone, synthesizing complex neurological networks, skeletal structures, and a temporary organ (the placenta) from scratch. Because this process is so biologically demanding, the medical community established strict guidelines for how much raw mass a woman must acquire to support it safely. However, this process is not linear. Gaining 10 pounds in the first trimester is a massive medical red flag, whereas gaining 10 pounds in the third trimester is perfectly normal. The <strong>Pregnancy Weight Gain Trajectory Calculator</strong> maps your weekly progress against the exact biological curve established by the American College of Obstetricians and Gynecologists (ACOG), ensuring your body is scaling correctly.</p>

            <h2>The First Trimester Anomaly</h2>
            <p>The most common point of failure in pregnancy weight management occurs between weeks 1 and 13. When women discover they are pregnant, they often immediately succumb to the "eating for two" fallacy, drastically increasing their caloric intake.</p>
            <p>Biologically, this is absurd. During the first trimester, the fetus is growing from a microscopic organism into something roughly the size of a peach. The total caloric demand of the fetus is negligible (zero additional calories are required per day). Therefore, the ACOG guidelines dictate that a healthy woman should only gain a total of 1 to 4 pounds during the entire first trimester. If a mother gains 15 pounds by week 12, the mathematics are undeniable: she did not build 15 pounds of "baby weight." She built 15 pounds of pure maternal visceral and subcutaneous fat, placing enormous, unnecessary strain on her cardiovascular system.</p>

            <h2>The Second and Third Trimester Acceleration</h2>
            <p>At week 14, the rules change entirely. The pregnancy enters the second trimester, and fetal construction accelerates rapidly. The baby begins developing dense bone, the placenta expands significantly, and the mother's body begins desperately hoarding fluid, effectively doubling her internal blood volume to support the massive vascular network required by the womb.</p>
            <p>Because of this massive biological demand, the target curve shifts from a flat line to a strict linear trajectory. A mother starting with a "Normal" BMI is medically mandated to gain approximately 1 pound per week until delivery. An "Overweight" mother is mandated to gain 0.6 pounds per week. This linear growth is absolutely critical. If the weekly weight gain suddenly stops or reverses in the third trimester, it is a severe medical warning sign indicating potential intrauterine growth restriction (the baby has stopped developing).</p>

            <h2>Why is 'Exceeding Target' So Dangerous?</h2>
            <p>If your calculator result flashes red with "Exceeding Target," it means your body is acquiring mass much faster than the biological apparatus can utilize it. This excess mass is converted into maternal fat.</p>
            <p>Maternal obesity during pregnancy acts as a catalyst for a cascade of systemic failures. The massive accumulation of adipose tissue rapidly degrades insulin sensitivity, triggering <strong>Gestational Diabetes</strong>. This toxic, sugar-rich blood crosses the placenta, forcing the fetus to produce massive amounts of its own insulin, which causes the baby to grow unnaturally large (Macrosomia). An oversized baby drastically increases the probability of a traumatic vaginal delivery, severe maternal hemorrhaging, and the necessity of an emergency Cesarean section. Exceeding the curve is not a cosmetic issue; it is a profound clinical threat.</p>

            <h2>The Risks of Falling 'Below Target'</h2>
            <p>While excess weight is the primary focus of modern obstetrics, falling "Below Target" carries its own terrifying risks, specifically for women who entered the pregnancy with a "Normal" or "Underweight" BMI.</p>
            <p>If a mother does not consume enough calories to support the immense thermodynamic cost of fetal construction, the body must steal energy from the mother's own skeleton and organs. The fetus will physically leech calcium from the mother's teeth and bones, and strip protein from her muscle tissue. Despite this survival mechanism, extreme maternal caloric restriction frequently leads to preterm labor, critically low infant birth weights, and severe developmental deficits in the child's neurological system.</p>

            <h2>How Starting BMI Dictates the Rules</h2>
            <p>The ACOG curve is not identical for every woman. The trajectory is strictly governed by the mother's starting Body Mass Index (BMI). This calculator automatically adjusts the acceptable mathematical channel based on your starting size.</p>
            <p>An underweight mother requires a very steep trajectory, gaining up to 40 pounds total, because she must build both the baby and the essential maternal fat stores required to survive the exhausting process of breastfeeding. An obese mother requires a very flat trajectory, gaining a maximum of 20 pounds. Because an obese mother already possesses hundreds of thousands of calories in stored adipose fat, the fetus can easily siphon that existing energy. The 20 pounds gained by the obese mother should consist entirely of the baby, the blood, and the fluid—zero new maternal fat should be synthesized.</p>

            <h2>Conclusion: Trust the Curve</h2>
            <p>Do not attempt to blindly manage your pregnancy weight by guessing. Use the Pregnancy Weight Gain Trajectory Calculator weekly to verify that your velocity of mass accumulation is locked safely inside the ACOG biological channel. By hitting the mathematical targets, you actively protect yourself from the horrors of preeclampsia and gestational diabetes, ensuring a safer delivery and a healthier foundation for your child's life.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weight-gain-during-pregnancy-target-calculator" />
          <PopularCalculators exclude="/calculator/weight-gain-during-pregnancy-target-calculator" />
        </div>
      </div>
    </>
  );
}
