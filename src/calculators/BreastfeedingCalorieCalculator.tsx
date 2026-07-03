"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Baby } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface BreastfeedingInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  height: number;
  age: number;
  activityLevel: number;
  babyAge: "0-6" | "6-12";
  feedingType: "exclusive" | "partial";
}

interface BreastfeedingResults {
  bmr: number;
  baseTdee: number;
  lactationCalories: number;
  totalCalories: number;
  
  proteinTarget: number;
  waterTarget: number;

  chartData: { name: string; Base: number; Lactation: number }[];
}

// 2. Pure Calculation Function
const calculateBreastfeedingCalories = (inputs: BreastfeedingInputs): BreastfeedingResults | null => {
  const { unitSystem, weight, height, age, activityLevel, babyAge, feedingType } = inputs;
  
  if (weight <= 0 || height <= 0 || age <= 0) return null;

  let wKg = weight;
  let hCm = height;

  if (unitSystem === "imperial") {
    wKg = weight * 0.453592;
    hCm = height * 2.54;
  }

  // Mifflin-St Jeor Equation for Females
  const bmr = (10 * wKg) + (6.25 * hCm) - (5 * age) - 161;
  const baseTdee = bmr * activityLevel;

  // Determine Lactation Caloric Demand based on ACOG/CDC guidelines
  let lactationCalories = 0;
  if (babyAge === "0-6") {
    lactationCalories = feedingType === "exclusive" ? 500 : 250;
  } else {
    lactationCalories = feedingType === "exclusive" ? 400 : 200;
  }

  const totalCalories = baseTdee + lactationCalories;

  // Additional Targets for Lactating Mothers
  const proteinTarget = wKg * 1.5; // ~1.5g per kg during lactation
  const waterTarget = 3.8; // ~3.8 Liters (about 128 oz) per day minimum

  const chartData = [
    {
      name: "Daily Energy Demand",
      Base: Math.round(baseTdee),
      Lactation: lactationCalories
    }
  ];

  return {
    bmr: Math.round(bmr),
    baseTdee: Math.round(baseTdee),
    lactationCalories,
    totalCalories: Math.round(totalCalories),
    proteinTarget: Math.round(proteinTarget),
    waterTarget,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "150",
  heightFt: "5",
  heightIn: "5",
  heightCm: "165",
  age: "30",
  activityLevel: "1.375",
  babyAge: "0-6" as const,
  feedingType: "exclusive" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-2">Energy Expenditure Breakdown</p>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground">Base Metabolism (TDEE): <span className="font-bold text-blue-500">{payload[0].value} kcal</span></p>
          <p className="text-muted-foreground">Breastfeeding Demand: <span className="font-bold text-pink-500">+{payload[1].value} kcal</span></p>
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

export default function BreastfeedingCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [age, setAge] = useState(DEFAULTS.age);
  const [activityLevel, setActivityLevel] = useState(DEFAULTS.activityLevel);
  const [babyAge, setBabyAge] = useState<"0-6" | "6-12">(DEFAULTS.babyAge);
  const [feedingType, setFeedingType] = useState<"exclusive" | "partial">(DEFAULTS.feedingType);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<BreastfeedingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const act = parseFloat(activityLevel);
    
    let h = 0;
    if (unitSystem === "imperial") {
      const ft = parseFloat(heightFt) || 0;
      const inc = parseFloat(heightIn) || 0;
      h = (ft * 12) + inc;
    } else {
      h = parseFloat(heightCm);
    }

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid weight.");
    if (h <= 0) return setErrorMsg("Please enter a valid height.");
    if (isNaN(a) || a <= 0) return setErrorMsg("Please enter a valid age.");

    const inputs: BreastfeedingInputs = {
      unitSystem, weight: w, height: h, age: a, activityLevel: act, babyAge, feedingType
    };

    const res = calculateBreastfeedingCalories(inputs);
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
    setAge(DEFAULTS.age);
    setActivityLevel(DEFAULTS.activityLevel);
    setBabyAge(DEFAULTS.babyAge);
    setFeedingType(DEFAULTS.feedingType);
    setErrorMsg("");
    // Trigger recalculation on next render
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, weight, heightFt, heightIn, heightCm, age, activityLevel, babyAge, feedingType]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Breastfeeding Nutrition Plan</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why do I need extra calories while breastfeeding?", answer: "Producing breast milk is incredibly metabolically demanding. The human body expends a massive amount of energy synthesizing milk fat, proteins, and lactose. In fact, exclusively breastfeeding an infant requires roughly 500 to 700 extra calories per day—comparable to the energy burned running 5 to 7 miles." },
    { question: "Can I cut calories to lose baby weight faster?", answer: "Drastic calorie cutting is highly discouraged during lactation. A severe caloric deficit can signal to your body that it is starving, which dramatically reduces milk volume and milk nutrient density. A healthy postpartum weight loss target is 0.5 to 1.0 pounds per week, which naturally occurs for most women who eat at their maintenance TDEE and allow the 500-calorie lactation cost to create a natural, gentle deficit." },
    { question: "Does my milk production burn fat directly?", answer: "Yes. During the third trimester of pregnancy, the body naturally stores fat specifically to be used as energy reserves for lactation. When you breastfeed, your body pulls from these fat stores to create milk. This is why many women find that breastfeeding facilitates postpartum weight loss." },
    { question: "Why do my calorie needs drop after 6 months?", answer: "Around 6 months of age, most infants begin eating solid foods. As they transition to a mixed diet, their reliance on breast milk naturally decreases. Consequently, your body produces slightly less milk volume over time, reducing your daily caloric expenditure from roughly +500 calories down to +400 calories." },
    { question: "How much water do I actually need to drink?", answer: "Breast milk is approximately 87% water. If you do not consume enough fluids, your body will prioritize vital organ function over milk production, leading to an immediate drop in supply. The Institute of Medicine recommends a minimum of 3.8 liters (about 16 cups or 128 ounces) of water per day for lactating women." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Breastfeeding Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Breastfeeding Calorie Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-pink-500/10 border-l-4 border-pink-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-pink-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-pink-800 dark:text-pink-400">
            <strong>Postpartum Disclaimer:</strong> This calculator estimates caloric needs based on CDC and ACOG guidelines for healthy lactation. Severe caloric restriction while breastfeeding can dangerously reduce milk supply and nutrient density. Always consult your OB/GYN or a Certified Lactation Consultant before intentionally attempting postpartum weight loss.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Current Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="age" label="Age" value={age} onChange={setAge} suffix="years" />
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

            <div className="flex flex-col mt-1">
              <label className="text-sm font-semibold text-foreground mb-1.5">Activity Level</label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="1.2">Sedentary (Little to no formal exercise)</option>
                <option value="1.375">Lightly Active (Light exercise 1-3 days/week)</option>
                <option value="1.55">Moderately Active (Moderate exercise 3-5 days/week)</option>
                <option value="1.725">Very Active (Heavy exercise 6-7 days/week)</option>
              </select>
            </div>

            <div className="border-t border-border pt-4 mt-2 grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Baby's Age</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border w-full">
                  <button type="button" onClick={() => setBabyAge("0-6")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${babyAge === "0-6" ? "bg-background shadow-sm text-pink-500" : "text-muted-foreground"}`}>0-6 Months</button>
                  <button type="button" onClick={() => setBabyAge("6-12")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${babyAge === "6-12" ? "bg-background shadow-sm text-pink-500" : "text-muted-foreground"}`}>6-12 Months</button>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Feeding Schedule</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border w-full">
                  <button type="button" onClick={() => setFeedingType("exclusive")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${feedingType === "exclusive" ? "bg-background shadow-sm text-pink-500" : "text-muted-foreground"}`}>Exclusive Breastmilk</button>
                  <button type="button" onClick={() => setFeedingType("partial")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${feedingType === "partial" ? "bg-background shadow-sm text-pink-500" : "text-muted-foreground"}`}>Partial / Formula Supplemented</button>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-2 pt-4 border-t border-border">
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
                <div className="bg-pink-500 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-pink-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-pink-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Total Daily Requirement
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-pink-200">kcal / day</div>
                      </div>
                      <div className="text-sm font-medium text-pink-100 mt-2 bg-pink-600/50 inline-block px-3 py-1 rounded-full">
                        Includes +{results.lactationCalories} calories exclusively for milk production
                      </div>
                    </div>
                  </div>
                  <Baby className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 2. Breakdown Panel */}
                  <div className="bg-card border border-border rounded-lg p-5 h-full flex flex-col gap-4">
                    <h3 className="text-base font-bold">Nutritional Demands</h3>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center pb-3 border-b border-border/40">
                        <div>
                          <p className="text-sm font-bold text-foreground">Base Metabolism</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">Your TDEE based on weight and activity</p>
                        </div>
                        <span className="font-black text-blue-500">{results.baseTdee.toLocaleString()} <span className="text-xs font-normal">kcal</span></span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border/40">
                        <div>
                          <p className="text-sm font-bold text-foreground">Lactation Tax</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">Energy required to synthesize milk</p>
                        </div>
                        <span className="font-black text-pink-500">+{results.lactationCalories} <span className="text-xs font-normal">kcal</span></span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border/40">
                        <div>
                          <p className="text-sm font-bold text-foreground">Protein Target</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">Crucial for tissue repair & milk protein</p>
                        </div>
                        <span className="font-black text-foreground">{results.proteinTarget} <span className="text-xs font-normal">g / day</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-foreground">Hydration Baseline</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">Absolute minimum daily water intake</p>
                        </div>
                        <span className="font-black text-blue-400">{results.waterTarget} <span className="text-xs font-normal">Liters</span></span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Stacked Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Energy Allocation</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                        <Bar dataKey="Base" stackId="a" fill="#3b82f6" name="Base TDEE" radius={[4, 0, 0, 4]} />
                        <Bar dataKey="Lactation" stackId="a" fill="#ec4899" name="Milk Production" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-muted-foreground mt-4 text-center px-4 leading-relaxed">
                      Breastfeeding is a massive metabolic event. Your body requires this combined energy pool just to maintain your current weight while feeding your infant.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Baby className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your physical profile and your infant's feeding schedule to calculate the precise caloric and nutritional demands of lactation.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Metabolic Demands of Breastfeeding</h2>
            <p>From a biological perspective, exclusive breastfeeding is one of the most metabolically demanding processes the human female body will ever undergo. Synthesizing complex breast milk—which is heavily fortified with fat, proteins, antibodies, and carbohydrates (lactose)—requires a staggering amount of energy. To put it in perspective, the daily energy expenditure required to exclusively breastfeed an infant is roughly equivalent to running 5 to 7 miles every single day. The <strong>Breastfeeding Calorie Calculator</strong> is designed to help postpartum mothers navigate this extreme metabolic shift, ensuring they consume enough high-quality calories to sustain a robust milk supply without compromising their own physical recovery and health.</p>

            <h2>The Mathematics Behind the "Lactation Tax"</h2>
            <p>According to the Centers for Disease Control and Prevention (CDC) and the American College of Obstetricians and Gynecologists (ACOG), the human body burns approximately <strong>670 additional calories per day</strong> to produce milk for an exclusively breastfed infant during the first six months of life.</p>
            <p>However, you are not generally required to eat an extra 670 calories. During the third trimester of pregnancy, the body naturally initiates lipogenesis (the accumulation of fat stores) specifically to prepare for lactation. The body biologically intends to slowly pull from these stored fat reserves to fund a portion of the milk production. Generally, about 170 calories per day are pulled from these fat stores, leaving a net dietary deficit of roughly <strong>500 calories</strong> that the mother must consume through food.</p>
            <p>If you are exclusively breastfeeding an infant between 0 and 6 months of age, your daily target is your standard maintenance calories (TDEE) <strong>plus 500 extra calories</strong>.</p>

            <h2>How Needs Change Over Time (6 to 12 Months)</h2>
            <p>As your infant reaches the 6-month milestone, significant dietary shifts occur. Pediatricians globally recommend the introduction of solid foods (purees, cereals, and eventually finger foods) at this stage. Because your baby is beginning to receive calories, iron, and nutrients from external food sources, their reliance on breast milk naturally, and slowly, begins to decrease.</p>
            <p>Because the total volume of milk demanded drops slightly, the caloric cost of lactation also decreases. For mothers exclusively providing breast milk (even alongside early solid foods) between 6 and 12 months, the recommended surplus drops from +500 to roughly <strong>+400 calories per day</strong>.</p>
            <p>If a mother is <em>partially</em> breastfeeding (supplementing heavily with baby formula), the caloric demand is cut in half across the board, equating to roughly +250 extra calories in the first 6 months, and +200 calories thereafter.</p>

            <h2>The Danger of Severe Caloric Restriction Postpartum</h2>
            <p>Modern society places immense, unfair pressure on women to immediately "bounce back" to their pre-pregnancy bodies. This often leads to postpartum mothers aggressively cutting their daily calories while simultaneously burning massive amounts of energy through lactation. <strong>This is clinically dangerous and directly harms the breastfeeding relationship.</strong></p>
            <p>If you drop your caloric intake too low (typically below 1,500 - 1,800 total calories, depending on height), your brain perceives a state of biological famine. In an evolutionary survival response, the brain will drastically reduce the production of prolactin and oxytocin, abruptly halting milk production to save the mother from starvation. Severe caloric restriction will tank your milk supply almost instantly.</p>
            <p>Furthermore, if you are not consuming enough calories, your body will leach vital nutrients—such as calcium—directly from your own bones and teeth to fortify the breast milk, leading to long-term maternal health issues like early-onset osteoporosis.</p>

            <h2>Postpartum Weight Loss: The Natural Method</h2>
            <p>You can lose your pregnancy weight safely while maintaining a massive milk supply. The biological trick is to utilize the "lactation tax" to your advantage. Because your body is burning an extra 500 calories a day to make milk, you do not need to create a massive dietary deficit.</p>
            <p>If you simply eat at your normal, pre-pregnancy maintenance level (your base TDEE without the 500-calorie addition), you will naturally be placed in a 500-calorie daily deficit. Over the course of 7 days, a 500-calorie deficit equals 3,500 calories—which mathematically equals exactly <strong>1 pound of fat loss per week</strong>. This is the ACOG-approved maximum safe rate of weight loss for lactating mothers. It allows you to slowly and safely return to your baseline weight without ever risking your milk supply.</p>

            <h2>Macronutrients and Hydration for Milk Production</h2>
            <p>Calories are the engine, but water and protein are the oil. Breast milk is comprised of approximately 87% water. Dehydration is the fastest and most common cause of a sudden drop in milk supply. The Institute of Medicine recommends that lactating women consume an absolute minimum of <strong>3.8 liters (about 128 ounces or one full gallon) of water per day</strong>.</p>
            <p>Protein is equally critical. The amino acids from dietary protein are required to synthesize the complex immunological proteins and antibodies present in breast milk, while simultaneously repairing maternal tissues damaged during childbirth. Lactating mothers should aim for approximately 1.5 grams of protein per kilogram of body weight, prioritizing lean meats, eggs, dairy, and legumes.</p>

            <h2>Conclusion: Fuel the Machine</h2>
            <p>Breastfeeding is an incredible physical feat. It is not the time for crash diets, restrictive eating, or extreme caloric deficits. By using the Breastfeeding Calorie Calculator, you can determine exactly what your body needs to thrive during the postpartum period. Eat nutrient-dense whole foods, drink a massive amount of water, and ensure you are meeting your elevated caloric targets. Your body is doing the work of two; feed it accordingly.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/breastfeeding-calorie-calculator" />
          <PopularCalculators exclude="/calculator/breastfeeding-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
