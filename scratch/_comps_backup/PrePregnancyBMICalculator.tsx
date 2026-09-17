"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Baby, Scale, HeartPulse } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface PrePregnancyInputs {
  unitSystem: "imperial" | "metric";
  heightInches: number;
  heightCm: number;
  weight: number; // Pre-pregnancy
}

interface PrePregnancyResults {
  bmi: number;
  classification: "Underweight" | "Normal Weight" | "Overweight" | "Obese";
  colorClass: string;
  
  targetGainLow: number;
  targetGainHigh: number;
  unitLabel: string;
  
  chartData: { name: string; value: number }[];
}

// 2. Pure Calculation Function
// Uses ACOG (American College of Obstetricians and Gynecologists) guidelines
const calculatePregnancyBMI = (inputs: PrePregnancyInputs): PrePregnancyResults | null => {
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

  let classification: PrePregnancyResults["classification"] = "Normal Weight";
  let colorClass = "#10b981"; // Emerald
  let targetGainLowLbs = 0;
  let targetGainHighLbs = 0;

  // ACOG Guidelines for Single Pregnancy (Twins/Multiples have different targets)
  if (bmi < 18.5) {
    classification = "Underweight";
    colorClass = "#3b82f6"; // Blue
    targetGainLowLbs = 28;
    targetGainHighLbs = 40;
  } else if (bmi < 25) {
    classification = "Normal Weight";
    colorClass = "#10b981"; // Emerald
    targetGainLowLbs = 25;
    targetGainHighLbs = 35;
  } else if (bmi < 30) {
    classification = "Overweight";
    colorClass = "#f59e0b"; // Yellow
    targetGainLowLbs = 15;
    targetGainHighLbs = 25;
  } else {
    classification = "Obese";
    colorClass = "#ef4444"; // Red
    targetGainLowLbs = 11;
    targetGainHighLbs = 20;
  }

  const unitLabel = unitSystem === "imperial" ? "lbs" : "kg";
  const targetGainLow = unitSystem === "imperial" ? targetGainLowLbs : targetGainLowLbs * 0.453592;
  const targetGainHigh = unitSystem === "imperial" ? targetGainHighLbs : targetGainHighLbs * 0.453592;

  // Generate Chart Data: Mapping the ACOG recommended ranges visually
  const chartData = [
    { name: "Underweight (28-40 lbs)", low: unitSystem === "imperial" ? 28 : 12.7, high: unitSystem === "imperial" ? 40 : 18.1 },
    { name: "Normal (25-35 lbs)", low: unitSystem === "imperial" ? 25 : 11.3, high: unitSystem === "imperial" ? 35 : 15.9 },
    { name: "Overweight (15-25 lbs)", low: unitSystem === "imperial" ? 15 : 6.8, high: unitSystem === "imperial" ? 25 : 11.3 },
    { name: "Obese (11-20 lbs)", low: unitSystem === "imperial" ? 11 : 5.0, high: unitSystem === "imperial" ? 20 : 9.1 }
  ];

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    classification,
    colorClass,
    targetGainLow: Math.round(targetGainLow),
    targetGainHigh: Math.round(targetGainHigh),
    unitLabel,
    chartData: chartData.map(item => ({ name: item.name, value: item.high })) // Simplified for BarChart max representation
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
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">{payload[0].payload.name}</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">ACOG Max Limit:</span>
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

export default function PrePregnancyBMICalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<PrePregnancyResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const ft = parseFloat(heightFt) || 0;
    const inc = parseFloat(heightIn) || 0;
    const cm = parseFloat(heightCm) || 0;

    const totalInches = (ft * 12) + inc;

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter your pre-pregnancy weight.");
    if (unitSystem === "imperial" && totalInches <= 0) return setErrorMsg("Please enter a valid height.");
    if (unitSystem === "metric" && cm <= 0) return setErrorMsg("Please enter a valid height.");

    const res = calculatePregnancyBMI({ 
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
    w.document.write(`<html><head><title>Pre-Pregnancy BMI & Target Gain Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does my pre-pregnancy weight matter so much?", answer: "Your pre-pregnancy BMI is the single most critical baseline for determining the safety trajectory of your pregnancy. The American College of Obstetricians and Gynecologists (ACOG) dictates that the amount of weight a woman is medically permitted to gain during the full 9-month term is entirely dependent on her starting size. An underweight mother must gain significantly more weight to support fetal development, while an obese mother must severely restrict her weight gain to prevent deadly complications like preeclampsia and gestational diabetes." },
    { question: "Is the 'Eating for Two' saying medically accurate?", answer: "No. This is one of the most pervasive and dangerous myths surrounding pregnancy. For a woman starting at a 'Normal' BMI, the body only requires approximately 300 to 400 extra calories per day during the second and third trimesters. That is the biological equivalent of a large apple and a handful of almonds. Binge-eating under the guise of 'eating for two' almost guarantees that the mother will massively overshoot her ACOG target range, locking her into severe postpartum obesity." },
    { question: "What happens if I gain too much weight?", answer: "Exceeding your ACOG weight target exponentially increases maternal and fetal risk. For the mother, excessive weight gain is strongly correlated with gestational diabetes, pregnancy-induced hypertension (high blood pressure), and the necessity of emergency Cesarean deliveries. For the child, excessive maternal weight gain frequently leads to macrosomia (a baby weighing more than 8 pounds, 13 ounces), which can cause severe shoulder dystocia and physical trauma to the infant during vaginal delivery." },
    { question: "What if I am already Overweight or Obese before getting pregnant?", answer: "If your pre-pregnancy BMI classifies you as Overweight or Obese, your ACOG weight gain targets are aggressively reduced. An obese mother is only recommended to gain between 11 and 20 pounds for the entire 9-month term. Because the mother's body already possesses massive thermodynamic energy reserves (adipose fat), the growing fetus can draw upon those existing maternal reserves. The 11 to 20 pounds gained should consist almost entirely of the biological weight of the baby, the placenta, amniotic fluid, and increased blood volume, not additional maternal fat." },
    { question: "Does this calculator apply to twins?", answer: "No. The mathematical targets provided by this calculator are strictly for singleton pregnancies (one baby). If you are carrying twins or multiples, the biological demands are drastically different, and the ACOG target weight ranges are significantly increased across all BMI categories. You must consult your OB-GYN for specific multifetal guidelines." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pre-Pregnancy BMI & Weight Target Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pre-Pregnancy BMI & Target Gain Calculator</h1>

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
                <Scale className="h-4 w-4" /> Baseline Metrics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter your exact height and your weight from immediately before you became pregnant to calculate your ACOG safety targets.</p>
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
              <CompactInput id="weight" label="Pre-Pregnancy Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
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
                  {/* BMI Baseline Box */}
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">Pre-Pregnancy Baseline BMI</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <div className="text-4xl font-black text-foreground">{results.bmi}</div>
                      </div>
                      <div className="text-sm font-bold mt-2 bg-slate-500/10 border border-slate-500/20 inline-block px-3 py-1 rounded-full text-slate-600">
                        {results.classification}
                      </div>
                    </div>
                    <HeartPulse className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 text-slate-400" />
                  </div>

                  {/* Target Range Box */}
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: results.colorClass }}>ACOG Maximum Target Gain</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-black text-foreground">{results.targetGainLow}</div>
                        <div className="font-bold text-muted-foreground">to</div>
                        <div className="text-3xl font-black text-foreground">{results.targetGainHigh}</div>
                        <div className="text-xs text-muted-foreground">{results.unitLabel}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2 font-medium">Safe total weight increase for entire 9-month term.</div>
                    </div>
                    <Baby className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 text-primary" />
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">ACOG Biological Ceilings</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visual map of the maximum acceptable weight gain across all maternal starting sizes. Notice how the medical ceiling drops drastically for mothers starting with excess adipose tissue.</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        
                        <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                          {results.chartData.map((entry, index) => {
                            let fill = "hsl(var(--muted))";
                            // Highlight the bar that matches the user's classification
                            if (results.classification === "Underweight" && entry.name.includes("Underweight")) fill = results.colorClass;
                            else if (results.classification === "Normal Weight" && entry.name.includes("Normal")) fill = results.colorClass;
                            else if (results.classification === "Overweight" && entry.name.includes("Overweight")) fill = results.colorClass;
                            else if (results.classification === "Obese" && entry.name.includes("Obese")) fill = results.colorClass;
                            return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Baby className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your exact height and the weight you possessed immediately prior to pregnancy to calculate your clinical ACOG safety targets.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Biological Reality of Pregnancy</h2>
            <p>Pregnancy is arguably the most intense physiological stress test the human body can endure. For nine months, the mother's cardiovascular system, hormonal network, and metabolic engine are pushed to their absolute biological limits. Yet, despite the severity of this medical event, societal mythology continues to push the dangerous narrative that pregnant women should "eat for two" and stop worrying about the scale. The medical community vehemently disagrees. The <strong>Pre-Pregnancy BMI & Target Gain Calculator</strong> utilizes the strict guidelines established by the American College of Obstetricians and Gynecologists (ACOG) to mathematically define exactly how much weight you are permitted to gain, proving that your biological starting point dictates the safety of your entire term.</p>

            <h2 className="text-2xl font-bold mb-3">Why Baseline BMI is the Ultimate Metric</h2>
            <p>Before a physician can tell you how much weight you need to gain to build a healthy baby, they must first understand how much thermodynamic energy you already possess.</p>
            <p>Your pre-pregnancy Body Mass Index (BMI) is a proxy for your body's existing energy reserves. If a woman is clinically Underweight (BMI below 18.5) before conception, she does not possess enough internal fat reserves to safely grow a child. Her body must actively hoard calories to build not just the fetal tissue, but the necessary maternal fat stores required for breastfeeding. Therefore, ACOG dictates she must gain a massive 28 to 40 pounds.</p>
            <p>Conversely, if a woman is Obese (BMI above 30) before conception, she already possesses hundreds of thousands of calories in stored adipose tissue. Her body does not need to build new maternal fat to support the pregnancy. The growing fetus can easily draw upon her existing energy surplus. Therefore, ACOG severely restricts her target to a mere 11 to 20 pounds, which mathematically represents the weight of the biological apparatus (the baby, placenta, and fluid), not maternal fat.</p>

            <h2 className="text-2xl font-bold mb-3">The Anatomy of Weight Gain</h2>
            <p>If an Obese mother is only permitted to gain 11 pounds, where exactly does that weight come from? It is critical to understand the biological breakdown of pregnancy weight. A healthy, full-term pregnancy physically constructs approximately 25 to 30 pounds of necessary, functional mass:</p>
            <ul>
              <li><strong>The Baby:</strong> 7 to 8 pounds</li>
              <li><strong>The Placenta:</strong> 1.5 to 2 pounds</li>
              <li><strong>Amniotic Fluid:</strong> 2 pounds</li>
              <li><strong>Uterine Expansion:</strong> 2 pounds</li>
              <li><strong>Maternal Breast Tissue:</strong> 2 pounds</li>
              <li><strong>Increased Blood Volume:</strong> 4 pounds</li>
              <li><strong>Extracellular Fluid/Water:</strong> 4 pounds</li>
              <li><strong>Maternal Fat Stores (for lactation):</strong> 7 pounds</li>
            </ul>
            <p>If a woman gains 60 pounds during her pregnancy, only 30 pounds of that was biologically necessary. The other 30 pounds is pure, unnecessary adipose tissue (fat) that will remain permanently bonded to her frame after delivery.</p>

            <h2 className="text-2xl font-bold mb-3">The Threat of Gestational Complications</h2>
            <p>Exceeding your specific ACOG target range is not a cosmetic failure; it is a clinical danger. Excessive weight gain during pregnancy exponentially increases the risk of severe medical complications.</p>
            <p>The first major threat is <strong>Gestational Diabetes</strong>. As adipose tissue rapidly accumulates, it forces the mother's cells to become insulin resistant. The pancreas cannot produce enough insulin to handle the massive caloric surplus, resulting in toxic, chronically elevated blood sugar that actively damages both the mother's vascular system and the developing fetus. The second major threat is <strong>Preeclampsia</strong>, a catastrophic condition characterized by skyrocketing blood pressure and potential organ failure, which is highly correlated with rapid, excessive maternal weight gain.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Fetal Macrosomia</h2>
            <p>It is not just the mother who suffers the consequences of excessive caloric intake; the baby pays the price directly. When a mother overconsumes calories, the excess glucose crosses the placenta and floods the fetal bloodstream.</p>
            <p>The baby's pancreas is forced to produce massive amounts of insulin to process the sugar, causing the fetus to rapidly synthesize unnecessary fat tissue. This leads to a condition known as Macrosomia (a baby born weighing more than 8 pounds, 13 ounces). Delivering a macrosomic infant vaginally is incredibly dangerous. It drastically increases the risk of severe vaginal tearing for the mother, shoulder dystocia (the baby's shoulders getting wedged behind the pelvic bone) for the infant, and frequently necessitates emergency Cesarean section surgery.</p>

            <h2 className="text-2xl font-bold mb-3">Breaking the "Eating for Two" Delusion</h2>
            <p>The mathematical reality of pregnancy caloric requirements is shocking to most women. During the entire first trimester, the ACOG states that a woman starting at a "Normal" BMI requires exactly zero additional daily calories. The fetus is the size of a lemon; it does not require an extra bowl of pasta.</p>
            <p>During the second and third trimesters, the maternal body only requires an additional 300 to 400 calories per day to sustain peak fetal growth. This is the caloric equivalent of a single apple and a handful of almonds, or a cup of Greek yogurt. It is absolutely not an excuse to binge eat fast food. The "eating for two" myth is the primary driver of the postpartum obesity epidemic in the modern world.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Protect the Baseline</h2>
            <p>Pregnancy is a massive physiological undertaking that requires clinical precision, not dietary recklessness. Use the Pre-Pregnancy BMI & Target Gain Calculator to establish your exact mathematical ceiling. Anchor your dietary decisions to the ACOG guidelines, protect your body from unnecessary adipose accumulation, and ensure a safer, healthier delivery for both you and your child.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pre-pregnancy-bmi-calculator" />
          <PopularCalculators exclude="/calculator/pre-pregnancy-bmi-calculator" />
        </div>
      </div>
    </>
  );
}
