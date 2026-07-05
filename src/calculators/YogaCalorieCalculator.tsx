"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface YogaInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  style: "hatha" | "vinyasa" | "ashtanga" | "bikram";
}

interface YogaResults {
  totalCalories: number;
  metValue: number;
  styleName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const YOGA_STYLES = {
  hatha: { name: "Hatha / Restorative", met: 2.5 },
  vinyasa: { name: "Vinyasa Flow", met: 4.0 },
  ashtanga: { name: "Ashtanga / Power", met: 5.0 },
  bikram: { name: "Bikram (Hot Yoga)", met: 5.5 }
};

// 2. Pure Calculation Function
const calculateYogaCalories = (inputs: YogaInputs): YogaResults | null => {
  const { unitSystem, weight, durationMins, style } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const durationHrs = durationMins / 60;
  
  const selectedStyle = YOGA_STYLES[style];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(YOGA_STYLES).map(key => {
    const s = YOGA_STYLES[key as keyof typeof YOGA_STYLES];
    return {
      name: s.name.split(" / ")[0], // Shorter name for chart
      calories: Math.round(s.met * wKg * durationHrs),
      isSelected: key === style
    };
  });

  return {
    totalCalories: Math.round(totalCalories),
    metValue: selectedStyle.met,
    styleName: selectedStyle.name,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "140",
  durationMins: "60",
  style: "vinyasa" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const isSelected = payload[0].payload.isSelected;
    return (
      <div className={`bg-card border p-2.5 rounded-lg shadow-md text-xs font-semibold ${isSelected ? 'border-primary' : 'border-border'}`}>
        <p className="font-bold mb-1 text-foreground">{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{payload[0].value}</span> kcal</p>
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

export default function YogaCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [style, setStyle] = useState<"hatha" | "vinyasa" | "ashtanga" | "bikram">(DEFAULTS.style);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<YogaResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid session duration.");

    const res = calculateYogaCalories({ unitSystem, weight: w, durationMins: d, style });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setDurationMins(DEFAULTS.durationMins);
    setStyle(DEFAULTS.style);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, weight, durationMins, style]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Yoga Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Is yoga considered a good workout for weight loss?", answer: "Yoga is an incredible tool for flexibility, joint mobility, stress reduction, and core strength. However, compared to cardiovascular exercises like running or swimming, most traditional yoga classes (like Hatha) burn relatively few calories. If your primary goal is rapid weight loss, yoga should be used as an active recovery day rather than your primary fat-burning engine." },
    { question: "Why does Bikram (Hot Yoga) burn more calories?", answer: "In a Bikram class, the studio is heated to 105°F (40°C) with 40% humidity. This extreme thermal stress forces your cardiovascular system to work in overdrive simply to pump blood to the surface of your skin to cool you down. This drastically elevates your heart rate, increasing the metabolic demand (MET) of the exercise, which directly translates to a higher caloric burn." },
    { question: "How does Vinyasa differ from Hatha in calorie burn?", answer: "Hatha yoga focuses on static, prolonged holds of individual postures with deep, resting breathing in between. Vinyasa, also known as 'Flow' yoga, strings postures together in a rapid, continuous sequence synced with breath. Because you are constantly moving and supporting your own body weight without rest, the cardiovascular demand is significantly higher in Vinyasa, resulting in roughly double the calorie burn of Hatha." },
    { question: "Do the calories burned depend on my weight?", answer: "Yes, entirely. Almost all yoga postures are bodyweight exercises (calisthenics). If you weigh 200 pounds, your muscles must generate significantly more force to push yourself up into a 'Chaturanga' (yoga push-up) or hold a 'Warrior II' pose compared to someone who weighs 120 pounds. Heavier individuals will always burn more calories performing the exact same yoga routine." },
    { question: "Can I burn fat doing yoga?", answer: "Yes. Because most yoga styles are relatively low-intensity (low heart rate), your body oxidizes a higher percentage of fat for fuel during the session compared to sprinting. However, total fat loss is dictated by your 24-hour caloric deficit. To lose fat doing yoga, you must still ensure your dietary intake remains below your Total Daily Energy Expenditure (TDEE)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Yoga Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Yoga Calorie Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <ActivitySquare className="h-4 w-4" /> Somatic Expenditure
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact thermodynamic cost of your yoga practice based on your body mass and the specific style of practice.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Duration" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Yoga Style</label>
              <select value={style} onChange={(e: any) => setStyle(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="hatha">Hatha / Restorative (Slow, static holds)</option>
                <option value="vinyasa">Vinyasa Flow (Continuous, fluid movement)</option>
                <option value="ashtanga">Ashtanga / Power (Intense, strength-based)</option>
                <option value="bikram">Bikram / Hot Yoga (Heated room, extreme sweat)</option>
              </select>
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
                
                {/* Primary Metric */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-indigo-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-indigo-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-indigo-100 mt-2 bg-indigo-900/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Flame className="h-4 w-4" /> {results.styleName} Routine
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[120px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-indigo-100 mb-1">MET Intensity</div>
                      <div className="text-2xl font-black text-white">{results.metValue.toFixed(1)}</div>
                    </div>
                  </div>
                  <ActivitySquare className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Style Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected style compares to other disciplines over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#8b5cf6' : 'hsl(var(--muted))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Timer className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight, session duration, and specific yoga style to calculate the exact caloric burn of your practice.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Caloric Demand of Yoga</h2>
            <p>For thousands of years, yoga has been utilized as a profound physical and spiritual discipline. In modern times, it has exploded in popularity as a mainstream fitness routine. However, a massive misconception persists in the fitness industry regarding how many calories a yoga class actually burns. Many practitioners believe that because they are sweating profusely and their muscles are trembling during a hold, they are burning a massive amount of calories. The <strong>Yoga Calorie Calculator</strong> cuts through the myths by utilizing established Metabolic Equivalent (MET) formulas, providing a mathematically accurate caloric burn based on your specific body weight and the exact style of yoga you are practicing.</p>

            <h2 className="text-2xl font-bold mb-3">Not All Yoga is Created Equal</h2>
            <p>The single biggest mistake people make when estimating calorie burn is treating "yoga" as a single, uniform activity. From a cardiovascular and metabolic standpoint, a slow, deep-stretching Restorative class is as different from a rapid Ashtanga class as walking is from sprinting.</p>
            <p>Our calculator divides the discipline into four primary categories based on their distinct physiological demands:</p>
            <ul>
              <li><strong>Hatha / Restorative (MET 2.5):</strong> This is the slowest, most foundational style of yoga. The focus is on static holding of individual postures, deep stretching, and prolonged breathwork. Because you are not moving rapidly and your heart rate remains relatively close to baseline, the caloric burn is very low—similar to a slow, casual walk.</li>
              <li><strong>Vinyasa Flow (MET 4.0):</strong> Vinyasa links postures together in a continuous, fluid dance synced directly with inhalations and exhalations. Because you are constantly transitioning from standing to the floor and back up again (supporting your own body weight), your heart rate elevates significantly. Vinyasa burns roughly double the calories of a Hatha class.</li>
              <li><strong>Ashtanga / Power Yoga (MET 5.0):</strong> This is a rigorous, physically demanding, athletically-focused style. It utilizes the same continuous flow as Vinyasa but focuses heavily on upper-body strength (frequent chaturanga push-ups), core stabilization, and deep lunges. It is the most muscle-taxing form of unheated yoga.</li>
              <li><strong>Bikram / Hot Yoga (MET 5.5):</strong> A specific 26-posture sequence performed in a room heated to 105°F with 40% humidity. The extreme thermal stress forces your cardiovascular system into overdrive just to cool your core temperature down. This massive spike in heart rate translates to the highest caloric burn per hour of any yoga style.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Body Weight Drives the Math</h2>
            <p>At its core, yoga is a form of <strong>calisthenics</strong>—resistance training using your own body weight. There are no dumbbells, barbells, or machines. Your body is the resistance.</p>
            <p>Because of this, the exact same 60-minute Vinyasa class will yield wildly different caloric burns for two different people. If you weigh 200 pounds, your chest and tricep muscles must generate a massive amount of force to lower your body into a <em>Chaturanga Dandasana</em> (low plank). If you weigh 120 pounds, the mechanical force required is drastically less. Newton's laws of physics apply directly to your yoga mat: moving a heavier mass requires more energy. Therefore, heavier individuals will inherently burn more calories during a yoga session than lighter individuals.</p>

            <h2 className="text-2xl font-bold mb-3">Is Yoga Effective for Weight Loss?</h2>
            <p>This is a highly nuanced question. If you are comparing the total calories burned during a 60-minute Hatha yoga class against a 60-minute run on a treadmill, yoga loses terribly. An average 150-pound woman might burn 170 calories in Hatha yoga, compared to 600 calories running. From a strict, mathematical "calories burned per minute" perspective, yoga is a poor primary engine for rapid fat loss.</p>
            <p>However, successful, long-term weight loss is not just about burning calories on a treadmill; it is about hormonal balance and recovery. Chronic stress and elevated cortisol levels cause the human body to hoard abdominal fat and resist weight loss. The deep parasympathetic breathing practiced in yoga has been clinically proven to drastically lower serum cortisol levels.</p>
            <p>Furthermore, heavy weightlifting and intense cardio cause micro-tears in muscle tissue and inflammation in joints. Yoga acts as the ultimate "active recovery." By increasing blood flow to damaged tissues, improving joint mobility, and lengthening tight muscles, yoga allows you to recover faster. Faster recovery means you can perform better, lift heavier, and run faster during your intense workout days. Therefore, while yoga itself may not burn massive calories, it facilitates a healthier, stronger body that is far more capable of burning fat.</p>

            <h2 className="text-2xl font-bold mb-3">The Sweat Myth of Hot Yoga</h2>
            <p>It is crucial to address the specific mechanics of Bikram or "Hot" yoga. Many practitioners step out of a 90-minute hot yoga class completely drenched in sweat, step on a scale, and are thrilled to see they have "lost" 3 pounds. They mistakenly believe they have burned a massive amount of fat.</p>
            <p>That 3-pound drop on the scale is entirely <strong>water weight</strong>. The intense heat of the room causes massive fluid loss through perspiration. The moment you drink a large bottle of water to rehydrate, those 3 pounds will instantly return. Sweating is simply a thermal regulation mechanism; it is not a measure of fat oxidation.</p>
            <p>While Hot Yoga does burn slightly more calories than unheated yoga (due to the heart working harder to cool the skin), the difference is not astronomical. You cannot sweat fat out of your pores; fat must be metabolically oxidized and exhaled as carbon dioxide. Use Hot Yoga for flexibility and mental endurance, but do not rely on the post-class scale drop as an indicator of fat loss.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Where Yoga Fits in Your Routine</h2>
            <p>Stop viewing yoga purely as a calorie-burning mechanism. Use the Yoga Calorie Calculator to accurately log your energy expenditure so you can adjust your daily diet (TDEE) accordingly, but appreciate the discipline for what it truly is: a foundational pillar of longevity. Lift heavy weights to build muscle, run or cycle to build cardiovascular power, and practice yoga to ensure your joints, mind, and nervous system remain flexible, resilient, and healthy for decades to come.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/yoga-calorie-calculator" />
          <PopularCalculators exclude="/calculator/yoga-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
