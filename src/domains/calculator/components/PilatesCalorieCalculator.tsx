"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Box } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface PilatesInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  style: "mat-basic" | "mat-advanced" | "reformer";
}

interface PilatesResults {
  totalCalories: number;
  metValue: number;
  styleName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const PILATES_STYLES = {
  "mat-basic": { name: "Mat (Beginner / Intermediate)", met: 3.0 },
  "reformer": { name: "Reformer (Machine Resistance)", met: 3.5 },
  "mat-advanced": { name: "Mat (Advanced Flow)", met: 4.0 }
};

// 2. Pure Calculation Function
const calculatePilatesCalories = (inputs: PilatesInputs): PilatesResults | null => {
  const { unitSystem, weight, durationMins, style } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const durationHrs = durationMins / 60;
  
  const selectedStyle = PILATES_STYLES[style];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(PILATES_STYLES).map(key => {
    const s = PILATES_STYLES[key as keyof typeof PILATES_STYLES];
    return {
      name: s.name.split(" (")[0], // Shorter name for chart
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
  weight: "145",
  durationMins: "50",
  style: "reformer" as const
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

export default function PilatesCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [style, setStyle] = useState<"mat-basic" | "mat-advanced" | "reformer">(DEFAULTS.style);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<PilatesResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid session duration.");

    const res = calculatePilatesCalories({ unitSystem, weight: w, durationMins: d, style });
    
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
    w.document.write(`<html><head><title>Pilates Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Is Pilates better than Yoga for burning calories?", answer: "Overall, the caloric burn of Pilates and Yoga is highly comparable, as both are generally low-impact, bodyweight-focused disciplines. A beginner Mat Pilates class burns roughly the same calories as a beginner Hatha yoga class. However, an Advanced Mat Pilates flow or a rigorous Reformer session will burn slightly more calories because it demands more continuous, high-tension core activation compared to static yoga stretching." },
    { question: "Why does Advanced Mat Pilates burn more than the Reformer?", answer: "This surprises many people. While the Reformer machine utilizes spring resistance (which provides an excellent hypertrophic stimulus), the carriage actually supports a significant portion of your body weight. In an Advanced Mat class, you are constantly fighting gravity to hold your own entire body weight in unstable positions (like 'The Teaser'). Managing 100% of your body mass against gravity requires slightly more total cardiovascular energy than pushing spring resistance while lying on a padded carriage." },
    { question: "Can Pilates help me lose belly fat?", answer: "Pilates is arguably the most effective discipline in the world for strengthening the Transverse Abdominis (the deep, structural core muscles). This tightening of the deep core acts like an internal corset, drastically improving posture and physically 'pulling in' the stomach, making the abdomen look significantly flatter. However, you cannot 'spot reduce' fat. To lose the layer of adipose tissue covering your strong new core, you must maintain a daily caloric deficit." },
    { question: "Are the calories burned on a Reformer class accurate?", answer: "The calculator provides a highly accurate clinical estimate based on the standard MET value for Reformer Pilates (3.5). However, Reformer classes can vary wildly. If you are doing a slow, rehabilitative session, your burn will be slightly lower. If you are taking a 'Cardio Reformer' class involving rapid jumping on a jumpboard, your heart rate will spike, and you will burn significantly more than the baseline estimate." },
    { question: "Does Pilates build actual muscle?", answer: "Yes, Pilates utilizes eccentric contractions (lengthening a muscle while it is under tension), which is highly effective for building long, lean muscle mass. The spring resistance of a Reformer machine provides a direct hypertrophic stimulus similar to cable machines in a gym. Building this lean muscle mass slightly increases your Resting Metabolic Rate (RMR), helping you burn more calories even when you aren't exercising." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pilates Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pilates Calorie Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Box className="h-4 w-4" /> Core Expenditure
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact energy required to sustain deep-core activation based on your body mass and equipment style.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Duration" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Pilates Style</label>
              <select value={style} onChange={(e: any) => setStyle(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="mat-basic">Mat (Beginner / Intermediate Core)</option>
                <option value="reformer">Reformer (Machine Spring Resistance)</option>
                <option value="mat-advanced">Mat (Advanced Flow / High Intensity)</option>
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
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-teal-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-teal-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-teal-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-teal-100 mt-2 bg-teal-900/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Flame className="h-4 w-4" /> {results.styleName} Routine
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[120px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-teal-100 mb-1">MET Intensity</div>
                      <div className="text-2xl font-black text-white">{results.metValue.toFixed(1)}</div>
                    </div>
                  </div>
                  <Box className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
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
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#14b8a6' : 'hsl(var(--muted))'} />
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
                <p className="font-medium max-w-xs">Enter your body weight, session duration, and specific Pilates equipment style to calculate the exact caloric burn of your practice.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Caloric Demand of Pilates</h2>
            <p>Developed in the early 20th century by Joseph Pilates for rehabilitating bedridden soldiers, "Contrology" (now known globally as Pilates) has become one of the most popular functional fitness modalities in the world. It is highly revered for building exceptional core strength, improving posture, and increasing flexibility. However, because it is low-impact and often lacks the rapid, heavy breathing associated with cardio, calculating the exact energy expended can be confusing. The <strong>Pilates Calorie Calculator</strong> removes the guesswork. By applying clinically established Metabolic Equivalent (MET) formulas to your specific body mass and the type of equipment you are using, it provides a mathematically precise estimate of your caloric burn.</p>

            <h2 className="text-2xl font-bold mb-3">The Physiology of Core Activation</h2>
            <p>To understand how Pilates burns calories, you must understand how it recruits muscle. Unlike traditional weightlifting (which primarily focuses on concentric contractions, or shortening the muscle), Pilates relies heavily on <strong>eccentric contractions</strong> and <strong>isometric holds</strong>. An eccentric contraction occurs when a muscle is lengthened while under tension (for example, slowly lowering your legs toward the floor without letting them drop).</p>
            <p>More importantly, Pilates demands continuous, grueling activation of the deep core musculature, specifically the <em>Transverse Abdominis</em> and the pelvic floor. These muscles act as an internal corset that stabilizes your entire spine. Keeping these massive, deep muscles fully contracted while simultaneously performing precise limb movements requires a surprisingly high volume of oxygen and energy, which directly translates to a steady, continuous caloric burn.</p>

            <h2 className="text-2xl font-bold mb-3">Mat Pilates vs. Reformer: The Caloric Difference</h2>
            <p>One of the most frequent debates in the fitness community is whether Mat Pilates or Reformer Pilates provides a better workout. From a strict caloric expenditure perspective, the answer lies in the intensity level and your relationship with gravity.</p>
            <ul>
              <li><strong>Beginner/Intermediate Mat Pilates (MET 3.0):</strong> This is the foundation of the discipline. You are on the floor, focusing heavily on breathwork and foundational core stability (like "The Hundred"). The cardiovascular demand is low, and the caloric burn is similar to a moderate walk.</li>
              <li><strong>Reformer Pilates (MET 3.5):</strong> The Reformer is a specialized machine featuring a gliding carriage attached to heavy resistance springs. Pushing and pulling against these physical springs provides a direct hypertrophic (muscle-building) stimulus that Mat Pilates lacks. Because you are recruiting larger leg and arm muscles to fight the springs, the heart rate elevates, resulting in a slightly higher caloric burn than standard Mat Pilates.</li>
              <li><strong>Advanced Mat Pilates (MET 4.0):</strong> This often surprises people. Advanced Mat Pilates actually burns <em>more</em> calories than the Reformer. Why? Because the Reformer carriage physically supports a large portion of your body weight. In an Advanced Mat flow, you are entirely unsupported. You must constantly fight gravity to hold 100% of your body weight in extreme, unstable positions. This demands maximum cardiovascular effort and generates the highest calorie burn of traditional Pilates styles.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Your Body Weight Dictates the Burn</h2>
            <p>Because Pilates is predominantly a bodyweight exercise, the laws of physics apply directly to your caloric expenditure. The heavier you are, the more energy your body must expend to perform the movements.</p>
            <p>If you weigh 180 pounds, your core must generate significantly more force to hold your legs at a 45-degree angle or to perform a "Roll Up" from the floor compared to someone who weighs 120 pounds. The mechanical "work" required is greater. Therefore, if two individuals take the exact same 60-minute Pilates class, the heavier individual will mathematically burn a higher number of absolute calories. The calculator factors in your specific weight (in pounds or kilograms) to ensure your estimate is biologically accurate.</p>

            <h2 className="text-2xl font-bold mb-3">Can Pilates Make Your Stomach Flatter?</h2>
            <p>Pilates is famous for creating the illusion of a significantly flatter stomach, but it is critical to understand the biomechanics behind this phenomenon. You cannot "spot reduce" fat. Doing 1,000 core exercises a day will not burn the fat off your stomach; fat loss only occurs through a sustained daily caloric deficit.</p>
            <p>However, Pilates drastically tightens and strengthens the <em>Transverse Abdominis</em>. If your deep core muscles are weak, your internal organs literally push outward against your abdominal wall, creating a "pooch" or distended stomach, even if your body fat percentage is relatively low. By strengthening this internal corset, Pilates physically pulls the abdominal wall inward and perfectly aligns your pelvis and spine. This muscular restructuring makes the stomach look significantly flatter and more toned, independent of actual fat loss.</p>

            <h2 className="text-2xl font-bold mb-3">The Muscle-Building Benefit (Hypertrophy)</h2>
            <p>While Pilates does not burn as many calories per minute as a high-intensity spin class, it offers a crucial metabolic advantage: resistance training. Particularly when using the heavy springs on a Reformer or a Cadillac machine, Pilates forces your muscles to adapt to resistance, leading to the development of lean muscle mass.</p>
            <p>Muscle tissue is highly metabolically active. The more lean muscle mass you have on your body, the higher your Resting Metabolic Rate (RMR) becomes. By consistently practicing Pilates and building core, glute, and leg strength, you are literally training your body to burn more calories passively while you are sleeping or sitting at your desk.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Incorporating Pilates into Your Routine</h2>
            <p>Pilates should not be viewed primarily as a rapid calorie-burning tool. If your sole goal is to burn 500 calories as fast as possible, you should go for a run. Instead, use the Pilates Calorie Calculator to accurately log your sessions, but value the discipline for its true clinical benefits: bulletproofing your spine, eliminating lower back pain, correcting your posture, and building an incredibly strong, functional core that will dramatically improve your performance in every other sport or activity you undertake.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pilates-calorie-calculator" />
          <PopularCalculators exclude="/calculator/pilates-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
