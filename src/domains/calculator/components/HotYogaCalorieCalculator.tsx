"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface YogaInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  style: "hatha" | "vinyasa" | "bikram";
}

interface YogaResults {
  totalCalories: number;
  metValue: number;
  styleName: string;
  waterLossLbs: number; // Estimated water weight lost through sweat (16oz = 1lb)
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const YOGA_STYLES = {
  "hatha": { name: "Hatha / Restorative (Room Temp)", met: 2.5, sweatFactor: 0.1 },
  "vinyasa": { name: "Vinyasa Flow (Active Movement)", met: 4.0, sweatFactor: 0.5 },
  "bikram": { name: "Bikram / Hot Yoga (105°F Heat)", met: 5.0, sweatFactor: 1.5 } // High sweat
};

// 2. Pure Calculation Function
const calculateYogaCalories = (inputs: YogaInputs): YogaResults | null => {
  const { unitSystem, weight, durationMins, style } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const durationHrs = durationMins / 60;
  
  const selectedStyle = YOGA_STYLES[style];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Estimate water weight loss (lbs) based on duration and style intensity/heat
  // E.g. Bikram for 60 mins might lose 1.5 lbs of water
  const waterLossLbs = selectedStyle.sweatFactor * durationHrs * (wKg / 70); // normalized to 70kg person

  // Generate comparison data
  const chartData = Object.keys(YOGA_STYLES).map(key => {
    const s = YOGA_STYLES[key as keyof typeof YOGA_STYLES];
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
    waterLossLbs: parseFloat(waterLossLbs.toFixed(1)),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "150",
  durationMins: "60",
  style: "bikram" as const
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

export default function HotYogaCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [style, setStyle] = useState<"hatha" | "vinyasa" | "bikram">(DEFAULTS.style);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<YogaResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid duration.");

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
    w.document.write(`<html><head><title>Hot Yoga Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why doesn't the heavy sweating in Hot Yoga burn more calories?", answer: "This is the single biggest misconception in the fitness industry. Sweating is an autonomic thermal response, not a mechanical exertion. Your body sweats simply to cool down your skin via evaporation. Standing perfectly still in a 105°F sauna will cause you to sweat profusely, but you are burning almost zero calories because you are not performing any mechanical 'work' against gravity. Hot Yoga burns calories because of the poses, not the temperature." },
    { question: "Why do I weigh less immediately after a Hot Yoga class?", answer: "You have lost water, not fat. A rigorous 90-minute Bikram class in 105°F heat can easily cause an adult to sweat out 2 to 3 pounds of water weight. When you step on the scale afterward, the lower number makes you feel like you burned massive amounts of fat. However, the moment you drink a large bottle of water or eat a meal, that weight will instantly return. True fat loss is a slow thermodynamic process, completely unrelated to immediate fluid loss." },
    { question: "Why does my fitness watch say I burned 800 calories?", answer: "Fitness trackers rely heavily on heart rate to estimate caloric burn. Because the room is 105°F, your body must drastically increase blood flow to the skin to cool you down. This massive vasodilation causes a significant artificial spike in your heart rate. Your watch senses a heart rate of 145 BPM and assumes you are jogging on a treadmill, wildly overestimating the calories. The clinical MET formula used in this calculator ignores the false heart rate spike and measures the true mechanical effort of the poses." },
    { question: "Does Hot Yoga burn more calories than Vinyasa?", answer: "Yes, but only slightly. The MET value for active Vinyasa is roughly 4.0, while Bikram is roughly 5.0. The slight increase is because the extreme heat forces your cardiovascular system to work harder to maintain homeostasis (cooling), which does require some extra metabolic energy. However, the difference is nowhere near the 500+ calorie difference that people assume when they see how much they are sweating." },
    { question: "Is Hot Yoga good for fat loss?", answer: "Hot Yoga is phenomenal for flexibility, mental resilience, balance, and reducing cortisol (stress). However, it is not a highly efficient tool for rapid fat loss compared to weightlifting or high-intensity intervals. To lose fat, you should use Hot Yoga as a supplemental recovery tool while maintaining a strict caloric deficit in your daily diet." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Hot Yoga Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hot Yoga Calorie Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-amber-800 dark:text-amber-400">
            <strong>The Sweat Illusion:</strong> Sweating is a thermal response, not a measure of calorie burn. The massive weight lost during a Hot Yoga class is almost entirely <strong>water weight</strong>, which returns as soon as you hydrate. Do not rely on fitness watches, as extreme heat artificially spikes heart rate and causes massive caloric overestimations.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Flame className="h-4 w-4" /> Thermal vs Mechanical
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the true clinical energy expenditure of your practice by stripping away the false heart rate spikes caused by extreme heat.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Class Duration" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Yoga Discipline / Heat Level</label>
              <select value={style} onChange={(e: any) => setStyle(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="hatha">Hatha / Restorative (Room Temp, Slow)</option>
                <option value="vinyasa">Vinyasa Flow (Room Temp, Active Poses)</option>
                <option value="bikram">Bikram / Hot Yoga (105°F, Extreme Sweat)</option>
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
                <div className="bg-gradient-to-br from-amber-600 to-orange-800 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-amber-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-amber-200 text-sm font-bold uppercase tracking-wider mb-1">
                        True Mechanical Output
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-amber-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-amber-100 mt-2 bg-amber-950/40 border border-amber-500/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <ActivitySquare className="h-4 w-4" /> {results.styleName}
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[140px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-amber-200 mb-1">Est. Water Loss</div>
                      <div className="text-2xl font-black text-white">{results.waterLossLbs}</div>
                      <div className="text-xs text-amber-300 font-medium">LBS of Fluid</div>
                    </div>
                  </div>
                  <Droplets className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">Notice that the extreme 105°F heat of Bikram only slightly increases total caloric output compared to standard Vinyasa flow.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#d97706' : 'hsl(var(--muted))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Flame className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight, the duration of your class, and the style of yoga to calculate the true thermodynamic cost of your practice, independent of fluid loss.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Illusion of the Hot Room</h2>
            <p>If you have ever taken a 90-minute Bikram or Hot Yoga class in a room cranked to 105°F and 40% humidity, you know the feeling of profound exhaustion. Your heart is pounding, you are completely drenched in sweat, and when you step on the scale in the locker room, you are thrilled to see you have miraculously "lost" 3 pounds in an hour and a half. This intense physical feedback makes it incredibly easy to believe that Hot Yoga is the ultimate calorie-burning, fat-melting workout on Earth. Unfortunately, human physiology tells a very different, mathematically strict story. The <strong>Hot Yoga Calorie Calculator</strong> strips away the illusions of thermal stress and water weight to reveal the true thermodynamic reality of your practice.</p>

            <h2 className="text-2xl font-bold mb-3">Sweat is Not Fat: The Thermal Response</h2>
            <p>The single biggest misconception in the fitness industry is equating sweat with calorie burn. Sweat is not melting fat; sweat is simply water and electrolytes.</p>
            <p>When you exercise, your body temperature rises. To prevent your internal organs from overheating, your autonomic nervous system triggers the sweat glands. Water is pushed to the surface of your skin, where it evaporates, taking heat with it. This is a thermal cooling mechanism, not a mechanical exertion. If you stand perfectly still in a 110°F sauna for 30 minutes, you will sweat profusely, but you will burn almost zero calories because your muscles are not performing any physical "work" against gravity. Hot Yoga forces massive sweating due to the external room temperature, but this sweat has almost no correlation to the actual thermodynamic calories burned.</p>

            <h2 className="text-2xl font-bold mb-3">The Scale Deception: Understanding Water Weight</h2>
            <p>If sweat is just water, why does the scale go down so drastically after a Hot Yoga class?</p>
            <p>The human body is roughly 60% water. One gallon of water weighs 8.3 pounds. If you sweat out just 32 ounces (four cups) of fluid during a rigorous 90-minute class, you have physically expelled 2 pounds of water from your body. When you step on the locker room scale, you weigh 2 pounds less. This creates a massive psychological reward, tricking users into believing they just burned 2 pounds of pure body fat. However, the moment you drink a large bottle of water or eat a meal later that day, your body reabsorbs the fluids, and the 2 pounds instantly returns. True fat loss requires a sustained, prolonged caloric deficit, not acute dehydration.</p>

            <h2 className="text-2xl font-bold mb-3">Why Your Smart Watch is Lying to You</h2>
            <p>Many yogis look at their Apple Watch after a Bikram class and are ecstatic to see a readout of "900 Calories Burned." Sadly, the watch is being fooled by the heat.</p>
            <p>Smart watches calculate calories primarily by monitoring your heart rate. In a 105°F room, your body enters a state of thermal stress. To cool you down, your blood vessels dilate (vasodilation) and your heart has to pump significantly faster just to circulate blood to the surface of your skin to initiate sweating. This means your heart rate might jump to 140 BPM, even when you are just holding a static pose. The watch sees 140 BPM and assumes you are jogging on a treadmill, rewarding you with hundreds of phantom calories. The clinical MET formula used in this calculator ignores the false heart rate spike and measures the actual physical exertion of the poses.</p>

            <h2 className="text-2xl font-bold mb-3">Vinyasa vs. Bikram: The Real Difference</h2>
            <p>How much of a difference does the heat actually make? Exercise physiologists measure physical effort using METs (Metabolic Equivalents). </p>
            <p>A rigorous Vinyasa flow at normal room temperature carries a MET value of roughly 4.0. The continuous chaturangas, lunges, and balancing poses require significant muscular endurance. Bikram (Hot Yoga) carries a slightly higher MET value of roughly 5.0. The increase is legitimate, but it is small. The extra 1.0 MET comes from the fact that your cardiovascular system must work harder in the heat to maintain homeostasis, and the extreme flexibility demands more stabilizer engagement. However, it does not mathematically double your calorie burn as many people assume.</p>

            <h2 className="text-2xl font-bold mb-3">The True Value of Hot Yoga</h2>
            <p>If Hot Yoga is not a magical fat-burning furnace, is it a waste of time? Absolutely not. Hot Yoga is one of the most beneficial practices you can incorporate into a fitness routine.</p>
            <p>The heat allows the fascia and connective tissues to become incredibly pliable, allowing for deep, profound stretching that drastically improves mobility and prevents weightlifting injuries. The mental resilience required to endure 90 minutes of thermal discomfort builds massive discipline. Furthermore, the practice dramatically lowers chronic cortisol (the stress hormone), which is highly beneficial for overall metabolic health. Hot Yoga is a phenomenal tool for recovery, mobility, and mental strength; it is simply not a substitute for a caloric deficit when it comes to fat loss.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Trust the Physics, Not the Sweat</h2>
            <p>Stop chasing the illusion of the locker room scale, and stop trusting fitness watches that cannot differentiate between thermal stress and mechanical work. To achieve real body recomposition, you need cold, hard data. Use the Hot Yoga Calorie Calculator to track the true, clinical thermodynamic output of your practice, understand your exact fluid loss, and seamlessly integrate your yoga routine into a mathematically sound nutritional plan.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hot-yoga-calorie-calculator" />
          <PopularCalculators exclude="/calculator/hot-yoga-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
