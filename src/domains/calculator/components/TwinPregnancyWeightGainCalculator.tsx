"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Baby, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface TwinWeightInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  height: number;
}

interface TwinWeightResults {
  bmi: number;
  bmiCategory: string;
  minGainLbs: number;
  maxGainLbs: number;
  minGainKg: number;
  maxGainKg: number;
  
  targetWeightMinLbs: number;
  targetWeightMaxLbs: number;
  targetWeightMinKg: number;
  targetWeightMaxKg: number;

  chartData: { category: string; min: number; max: number }[];
}

// 2. Pure Calculation Function
const calculateTwinWeightGain = (inputs: TwinWeightInputs): TwinWeightResults | null => {
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

  // IOM (Institute of Medicine) Guidelines for Twin Pregnancies
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    minGainLbs = 50;
    maxGainLbs = 62;
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    bmiCategory = "Normal Weight";
    minGainLbs = 37;
    maxGainLbs = 54;
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    bmiCategory = "Overweight";
    minGainLbs = 31;
    maxGainLbs = 50;
  } else {
    bmiCategory = "Obese";
    minGainLbs = 25;
    maxGainLbs = 42;
  }

  const minGainKg = minGainLbs * 0.453592;
  const maxGainKg = maxGainLbs * 0.453592;

  const baseLbs = unitSystem === "imperial" ? weight : weight * 2.20462;
  const baseKg = unitSystem === "metric" ? weight : weight * 0.453592;

  const chartData = [
    { category: "Your Twin Target", min: unitSystem === "imperial" ? minGainLbs : Math.round(minGainKg), max: unitSystem === "imperial" ? maxGainLbs : Math.round(maxGainKg) },
    // For comparison, standard singleton guidelines for the same BMI category
    { category: "Singleton Target", 
      min: unitSystem === "imperial" ? (bmi < 18.5 ? 28 : bmi <= 24.9 ? 25 : bmi <= 29.9 ? 15 : 11) : Math.round((bmi < 18.5 ? 28 : bmi <= 24.9 ? 25 : bmi <= 29.9 ? 15 : 11) * 0.453592), 
      max: unitSystem === "imperial" ? (bmi < 18.5 ? 40 : bmi <= 24.9 ? 35 : bmi <= 29.9 ? 25 : 20) : Math.round((bmi < 18.5 ? 40 : bmi <= 24.9 ? 35 : bmi <= 29.9 ? 25 : 20) * 0.453592)
    }
  ];

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    bmiCategory,
    minGainLbs,
    maxGainLbs,
    minGainKg: Math.round(minGainKg),
    maxGainKg: Math.round(maxGainKg),
    targetWeightMinLbs: Math.round(baseLbs + minGainLbs),
    targetWeightMaxLbs: Math.round(baseLbs + maxGainLbs),
    targetWeightMinKg: Math.round(baseKg + minGainKg),
    targetWeightMaxKg: Math.round(baseKg + maxGainKg),
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
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-2 text-primary">{payload[0].payload.category}</p>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground">Minimum Gain: <span className="font-bold text-blue-500">{payload[0].value}</span></p>
          <p className="text-muted-foreground">Maximum Gain: <span className="font-bold text-pink-500">{payload[1].value}</span></p>
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

export default function TwinPregnancyWeightGainCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<TwinWeightResults | null>(null);
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

    const inputs: TwinWeightInputs = { unitSystem, weight: w, height: h };
    const res = calculateTwinWeightGain(inputs);
    
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
    w.document.write(`<html><head><title>Twin Pregnancy Weight Target</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why are the weight gain guidelines different for twins?", answer: "Carrying twins requires a drastically different physiological environment than a singleton pregnancy. The mother is growing two fetuses, two placentas, and double the amniotic fluid volume. Furthermore, maternal blood volume expands significantly more to support the uterine blood flow required for two babies, and additional fat stores are needed to support the extreme metabolic demands of tandem breastfeeding." },
    { question: "Why is early weight gain so critical for twins?", answer: "Early weight gain (between 20 and 24 weeks) is heavily correlated with improved birth weights in twins. Because twins are at a significantly higher risk for preterm labor and premature birth (the average twin pregnancy delivers at 35-36 weeks rather than 40 weeks), it is essential to ensure maximum fetal growth in the second trimester before space in the uterus becomes critically restricted." },
    { question: "What happens if I don't gain enough weight?", answer: "Inadequate maternal weight gain in a twin pregnancy significantly increases the risk of Intrauterine Growth Restriction (IUGR), low birth weight (babies born under 5.5 lbs), and preterm delivery. Twins born prematurely at a low birth weight frequently require extended stays in the Neonatal Intensive Care Unit (NICU) to assist with breathing, temperature regulation, and feeding." },
    { question: "How many extra calories do I need for twins?", answer: "While a singleton pregnancy requires roughly 300 extra calories per day in the second and third trimesters, carrying twins generally requires an additional 600 calories per day above your non-pregnant maintenance level (TDEE). These calories should ideally come from nutrient-dense sources: lean proteins, complex carbohydrates, and healthy fats." },
    { question: "Can I exercise while pregnant with twins?", answer: "Light to moderate exercise (like walking or prenatal yoga) is generally considered safe and beneficial in the first and second trimesters, provided the pregnancy is uncomplicated. However, because twin pregnancies carry a higher risk of preterm labor and cervical insufficiency, you must obtain explicit medical clearance from your Maternal-Fetal Medicine (MFM) specialist or OB/GYN before engaging in any exercise regimen." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Twin Pregnancy Weight Gain Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Twin Pregnancy Weight Gain Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Users className="h-4 w-4" /> Multiple Gestation Math
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Your recommended total weight gain is mathematically derived from your <strong>Pre-Pregnancy Body Mass Index (BMI)</strong>.</p>
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
                            <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-pink-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-pink-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Twin Target Weight Gain Range
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-5xl font-extrabold tracking-tight">
                          {unitSystem === "imperial" ? `${results.minGainLbs} - ${results.maxGainLbs}` : `${results.minGainKg} - ${results.maxGainKg}`}
                        </div>
                        <div className="text-xl font-bold text-pink-200">{unitSystem === "imperial" ? "lbs" : "kg"}</div>
                      </div>
                      <div className="text-sm font-medium text-pink-100 mt-3 bg-pink-900/30 inline-block px-3 py-1.5 rounded-full">
                        Based on your pre-pregnancy BMI of {results.bmi} ({results.bmiCategory})
                      </div>
                    </div>
                  </div>
                  <Users className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 2. Breakdown Panel */}
                  <div className="bg-card border border-border rounded-lg p-5 h-full flex flex-col gap-4">
                    <h3 className="text-base font-bold">Delivery Day Targets</h3>
                    
                    <div className="flex flex-col gap-4">
                      <div className="bg-muted/30 border border-border p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-foreground">Target Body Weight</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Estimated weight immediately before delivery</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xl text-primary">
                            {unitSystem === "imperial" ? `${results.targetWeightMinLbs} - ${results.targetWeightMaxLbs}` : `${results.targetWeightMinKg} - ${results.targetWeightMaxKg}`}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground ml-1">{unitSystem === "imperial" ? "lbs" : "kg"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-border/40 p-3 rounded-md text-center">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Starting BMI</div>
                          <div className="text-lg font-black text-foreground">{results.bmi}</div>
                        </div>
                        <div className="border border-border/40 p-3 rounded-md text-center">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Category</div>
                          <div className="text-sm font-black text-foreground mt-1">{results.bmiCategory}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Bar Chart Comparison */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Twin vs. Singleton Demands</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={0} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="category" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                        <Bar dataKey="min" fill="#3b82f6" name={`Min Gain (${unitSystem === 'imperial' ? 'lbs' : 'kg'})`} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="max" fill="#ec4899" name={`Max Gain (${unitSystem === 'imperial' ? 'lbs' : 'kg'})`} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-muted-foreground mt-4 text-center px-4 leading-relaxed">
                      Carrying multiples significantly increases your maternal mass. The chart compares your twin requirement against standard singleton pregnancy guidelines for your identical BMI category.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Users className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your pre-pregnancy physical profile to calculate the optimal Institute of Medicine (IOM) weight gain target for a twin pregnancy.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Twin Pregnancy Weight Gain Guidelines</h2>
            <p>Finding out that you are pregnant with twins is a life-altering moment. Almost immediately, the medical care required shifts from standard obstetrics to specialized, high-risk Maternal-Fetal Medicine (MFM). One of the most immediate, critical conversations you will have with your healthcare provider revolves around maternal nutrition and weight gain. Carrying multiples demands a drastically different physiological environment than a singleton pregnancy. The <strong>Twin Pregnancy Weight Gain Calculator</strong> utilizes the official, peer-reviewed guidelines published by the Institute of Medicine (IOM) to provide you with a mathematically precise target range designed to maximize fetal growth while protecting maternal health.</p>

            <h2 className="text-2xl font-bold mb-3">Why Twins Require Massively Different Guidelines</h2>
            <p>The math is simple, but the biology is incredibly complex. In a singleton pregnancy, maternal weight gain accounts for the baby, one placenta, expanded blood volume, amniotic fluid, and maternal fat stores for lactation. In a twin gestation, that math is amplified.</p>
            <p>A mother carrying twins must grow two entirely separate fetuses. Furthermore, she must construct and maintain either one massive shared placenta (monochorionic) or two entirely separate placentas (dichorionic). The maternal cardiovascular system undergoes extreme hypertrophy, expanding blood volume by over 50% just to maintain adequate uterine perfusion for two fetuses. There is also double the volume of amniotic fluid, and the body must lay down significantly more dense fat tissue to prepare for the massive metabolic demand of tandem breastfeeding. All of these biological necessities equate to a much higher, non-negotiable scale of weight gain.</p>

            <h2 className="text-2xl font-bold mb-3">The BMI Framework: Setting Your Target</h2>
            <p>The Institute of Medicine does not issue a "one-size-fits-all" weight gain recommendation. Instead, the guidelines are strictly tiered based on a mother's starting <strong>Body Mass Index (BMI)</strong> immediately prior to conception. The rationale is simple: women who enter pregnancy with lower fat reserves (low BMI) must gain significantly more weight to provide adequate fuel for fetal growth, while women who enter pregnancy with large fat reserves (high BMI) can safely draw upon those stores to partially fuel the pregnancy.</p>

            <p>The official IOM guidelines for a twin pregnancy are as follows:</p>
            <ul>
              <li><strong>Underweight (BMI below 18.5):</strong> 50 to 62 pounds (22.7 to 28.1 kg). This massive target ensures that the mother's body does not enter a state of starvation while attempting to build two fetuses.</li>
              <li><strong>Normal Weight (BMI 18.5 to 24.9):</strong> 37 to 54 pounds (16.8 to 24.5 kg). The standard benchmark for healthy, optimal fetal development.</li>
              <li><strong>Overweight (BMI 25.0 to 29.9):</strong> 31 to 50 pounds (14.1 to 22.7 kg). A slightly restricted target, assuming the mother has adequate baseline fat reserves.</li>
              <li><strong>Obese (BMI 30.0 and above):</strong> 25 to 42 pounds (11.3 to 19.1 kg). The lowest target bracket, tightly controlled to prevent gestational diabetes and severe preeclampsia while still ensuring twin viability.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Critical Importance of Early Weight Gain</h2>
            <p>In a standard singleton pregnancy, women are often told that the majority of their weight gain will occur in the third trimester. <strong>This logic does not apply to twin pregnancies.</strong></p>
            <p>Because the human uterus has a physical capacity limit, twin pregnancies almost universally run out of room far earlier than singletons. The average twin pregnancy delivers prematurely at roughly 35 to 36 weeks (compared to 40 weeks for a singleton). Because the delivery timeline is heavily compressed, the window for maximizing fetal growth is significantly shorter.</p>
            <p>Maternal-Fetal Medicine specialists place extreme emphasis on aggressive maternal weight gain between weeks 20 and 24. Studies overwhelmingly prove that early maternal weight gain in twin pregnancies is the strongest predictor of higher infant birth weights. By aggressively front-loading maternal nutrition during the second trimester, you give the twins the absolute best chance of crossing the critical 5.5-pound threshold before space restrictions force an early delivery.</p>

            <h2 className="text-2xl font-bold mb-3">The Risks of Inadequate Nutrition</h2>
            <p>Failure to meet the IOM minimum weight gain targets in a twin gestation carries severe, scientifically documented risks. The most prominent danger is <strong>Intrauterine Growth Restriction (IUGR)</strong>, where one or both fetuses fail to grow at the expected rate due to a lack of maternal nutrients or poor placental perfusion.</p>
            <p>Inadequate weight gain also drastically increases the statistical likelihood of extreme preterm labor. Twins born prematurely at very low birth weights (under 3.5 pounds) face grueling, extended stays in the Neonatal Intensive Care Unit (NICU). They frequently require mechanical ventilation for underdeveloped lungs, feeding tubes because they lack the reflex to swallow, and constant thermal regulation in incubators. Adequate maternal nutrition is the primary preventative measure against prolonged NICU admissions.</p>

            <h2 className="text-2xl font-bold mb-3">Caloric Needs: How to Actually Gain the Weight</h2>
            <p>Gaining 40 to 50 pounds in a compressed timeframe is exceptionally difficult, especially when the massive size of the expanding uterus physically crushes the mother's stomach, leading to rapid satiety and severe acid reflux.</p>
            <p>To hit these targets, a mother carrying twins generally needs an additional <strong>600 calories per day</strong> above her pre-pregnancy maintenance level. However, simply eating "junk food" to hit caloric goals will lead to maternal gestational diabetes and poor fetal bone density. The focus must be on hyper-caloric, nutrient-dense foods: avocados, full-fat Greek yogurt, nut butters, salmon, eggs, and heavy complex carbohydrates like sweet potatoes and quinoa. Because the stomach cannot hold massive meals, the mother must transition to eating 5 or 6 small, high-calorie meals throughout the day.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Trust the Process and Your Doctor</h2>
            <p>Watching the scale climb rapidly during a twin pregnancy can be psychologically jarring, especially in a society hyper-fixated on thinness. However, in the context of a multiple gestation, that weight gain is literally building human life and protecting against catastrophic prematurity. Use the Twin Pregnancy Weight Gain Calculator to establish your mathematical baseline, and then work aggressively alongside your high-risk OB/GYN to construct a daily nutritional protocol that ensures you and your babies reach the finish line as safely and healthily as possible.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/twin-pregnancy-weight-gain-calculator" />
          <PopularCalculators exclude="/calculator/twin-pregnancy-weight-gain-calculator" />
        </div>
      </div>
    </>
  );
}
