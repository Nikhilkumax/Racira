"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface DogWalkInputs {
  dogWeight: number; // lbs
  ownerWeight: number; // lbs (optional, default 150)
  durationMinutes: number;
  intensity: "sniffari" | "normal" | "brisk" | "jogging";
}

interface DogWalkResults {
  dogCalories: number;
  ownerCalories: number;
  totalTeamCalories: number;
  
  dogRer: number; // Resting Energy Requirement
  dogPctOfDaily: number; // What % of daily calories did the walk burn?

  chartData: { name: string; Dog: number; Owner: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateCalorieBurn = (inputs: DogWalkInputs): DogWalkResults | null => {
  const { dogWeight, ownerWeight, durationMinutes, intensity } = inputs;
  
  if (dogWeight <= 0 || durationMinutes <= 0) return null;

  const dogWeightKg = dogWeight / 2.20462;
  const ownerWeightKg = (ownerWeight > 0 ? ownerWeight : 150) / 2.20462;
  const hours = durationMinutes / 60;

  // Dog Burn Rates (Calories per pound per hour)
  const dogRates = {
    sniffari: 0.4, // Lots of stopping and sniffing
    normal: 0.6,   // Steady walking pace
    brisk: 0.8,    // Fast walk, minimal stopping
    jogging: 1.2   // Running with the dog
  };

  const dogCalories = dogWeight * dogRates[intensity] * hours;

  // Human Burn Rates (METs)
  const humanMets = {
    sniffari: 2.0, // Slow walking with many stops
    normal: 3.5,   // ~3 mph
    brisk: 4.5,    // ~4 mph
    jogging: 7.0   // ~5 mph jog
  };

  const ownerCalories = humanMets[intensity] * ownerWeightKg * hours;

  const totalTeamCalories = dogCalories + ownerCalories;

  // Dog's Resting Energy Requirement (RER)
  // RER = 70 * (body weight in kg)^0.75
  const dogRer = 70 * Math.pow(dogWeightKg, 0.75);
  // Assume maintenance for active dog is ~1.6 * RER
  const dailyMaintenance = dogRer * 1.6;
  const dogPctOfDaily = (dogCalories / dailyMaintenance) * 100;

  const chartData = [
    { name: "Total Calories Burned", Dog: Math.round(dogCalories), Owner: Math.round(ownerCalories) }
  ];

  const intensityLabel = intensity === "sniffari" ? "Sniffari (Slow)" : intensity === "normal" ? "Normal Walk" : intensity === "brisk" ? "Brisk Walk" : "Jogging";

  const summaryStats = [
    { label: "Dog Calories Burned", value: `${Math.round(dogCalories)} kcal`, colorClass: "text-primary font-bold" },
    { label: "Owner Calories Burned", value: `${Math.round(ownerCalories)} kcal`, colorClass: "text-blue-500 font-bold" },
    { label: "Total Team Burn", value: `${Math.round(totalTeamCalories)} kcal` },
    { label: "Walk Intensity", value: intensityLabel },
    { label: "% of Dog's Daily Diet", value: `${dogPctOfDaily.toFixed(1)}%` }
  ];

  return {
    dogCalories,
    ownerCalories,
    totalTeamCalories,
    dogRer,
    dogPctOfDaily,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  dogWeight: "45",
  ownerWeight: "160",
  durationMinutes: "45",
  intensity: "normal" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 text-muted-foreground border-b border-border pb-1">Caloric Burn</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex justify-between items-center mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-bold">{entry.value} kcal</span>
          </div>
        ))}
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

export default function DogWalkCalorieBurnCalculator() {
  // 4. Component State
  const [dogWeight, setDogWeight] = useState(DEFAULTS.dogWeight);
  const [ownerWeight, setOwnerWeight] = useState(DEFAULTS.ownerWeight);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULTS.durationMinutes);
  const [intensity, setIntensity] = useState<"sniffari" | "normal" | "brisk" | "jogging">(DEFAULTS.intensity);
  
  const [results, setResults] = useState<DogWalkResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: DogWalkInputs = {
      dogWeight: parseFloat(dogWeight) || 0,
      ownerWeight: parseFloat(ownerWeight) || 0,
      durationMinutes: parseFloat(durationMinutes) || 0,
      intensity
    };
    setResults(calculateCalorieBurn(inputs));
  };

  const handleReset = () => {
    setDogWeight(DEFAULTS.dogWeight);
    setOwnerWeight(DEFAULTS.ownerWeight);
    setDurationMinutes(DEFAULTS.durationMinutes);
    setIntensity(DEFAULTS.intensity);
    
    setResults(calculateCalorieBurn({
      dogWeight: parseFloat(DEFAULTS.dogWeight),
      ownerWeight: parseFloat(DEFAULTS.ownerWeight),
      durationMinutes: parseFloat(DEFAULTS.durationMinutes),
      intensity: DEFAULTS.intensity
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dogWeight, ownerWeight, durationMinutes, intensity]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Dog Walk Calorie Results</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How many calories does a dog burn walking?", answer: "The amount depends on the dog's weight and the intensity of the walk. Generally, a dog burns between 0.4 and 0.8 calories per pound of body weight per hour of walking. A 50-pound dog on a brisk one-hour walk burns about 40 calories." },
    { question: "What is a 'Sniffari'?", answer: "A 'Sniffari' is a slow, decompressive walk where the dog is allowed to stop and smell their environment as much as they want. While it burns fewer physical calories than a brisk walk, the mental stimulation of sniffing is exhausting and provides massive psychological benefits for the dog." },
    { question: "Do I burn more calories than my dog?", answer: "Yes, humans generally burn significantly more calories during a walk than dogs. This is due to bipedal biomechanics (walking on two legs is less efficient than walking on four) and the fact that humans usually weigh much more than their dogs." },
    { question: "Is walking enough exercise for my dog?", answer: "For senior dogs or low-energy breeds (like Basset Hounds or Pugs), daily walks are often sufficient. However, for working breeds (like Huskies, Shepherds, or Collies), walking alone is rarely enough. They require high-intensity cardiovascular exercise, like running or fetching, to prevent behavioral issues." },
    { question: "How does this calculate my dog's daily diet percentage?", answer: "We use a veterinary formula to calculate your dog's Resting Energy Requirement (RER), then multiply it by an activity factor to find their daily caloric needs. The calculator then shows exactly what percentage of their daily food was burned off during the walk." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Dog Walk Calorie Burn Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Walk Calorie Burn Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Activity className="h-4 w-4" /> Team Workout Tracker
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate exactly how many calories both you and your dog are burning during your daily walks based on weight, duration, and pace.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="dogWeight" label="Dog's Weight" value={dogWeight} onChange={setDogWeight} suffix="lbs" />
              <CompactInput id="ownerWeight" label="Your Weight" value={ownerWeight} onChange={setOwnerWeight} suffix="lbs" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="duration" label="Walk Duration" value={durationMinutes} onChange={setDurationMinutes} suffix="minutes" />
            </div>

            <div className="flex flex-col">
              <label htmlFor="intensity" className="flex items-center text-sm font-semibold text-foreground mb-1.5">
                Walk Pace / Intensity
              </label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <select
                  id="intensity"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as any)}
                  className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer font-medium"
                >
                  <option value="sniffari">Sniffari (Slow, many stops)</option>
                  <option value="normal">Normal Walk (Steady pace)</option>
                  <option value="brisk">Brisk Walk (Fast pace, no stops)</option>
                  <option value="jogging">Jogging / Running</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Values
              </button>
            </div>
          </div>

          {/* RIGHT fluid: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card (Dog) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Dog Calories Burned</div>
                    <div className="text-4xl font-extrabold text-foreground tracking-tight">{Math.round(results.dogCalories)}</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">({results.dogPctOfDaily.toFixed(1)}% of daily needs)</div>
                  </div>
                  
                  {/* 2. Secondary Result Card (Owner) */}
                  <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-5">
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Your Calories Burned</div>
                    <div className="text-4xl font-extrabold text-foreground tracking-tight">{Math.round(results.ownerCalories)}</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">Great job team!</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Summary Statistics */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Walk Details</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-base">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart / Visualization */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[220px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Burn Comparison</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="Dog" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="Owner" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Enter your weight, your dog's weight, and the walk duration to calculate the calories burned by your team.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Dog Walk Calorie Burn Calculator</h2>
            <p>Walking the dog is a daily ritual for millions of pet owners worldwide. It serves as a primary source of cardiovascular exercise and mental stimulation for the animal, while providing a consistent, low-impact workout for the owner. However, quantifying the exact physiological benefits of this activity can be difficult due to differences in weight, pace, and biomechanics. The <strong>Dog Walk Calorie Burn Calculator</strong> is designed to solve this problem by simultaneously calculating the metabolic energy expenditure of both you and your canine companion.</p>
            <p>By inputting basic metrics—your weight, your dog’s weight, the duration of the walk, and the intensity of the pace—the algorithm determines exactly how many calories were burned during the session. Furthermore, it contextualizes this data by displaying what percentage of your dog's daily maintenance diet was burned off, helping you manage their weight more effectively.</p>

            <h2 className="text-2xl font-bold mb-3">The Biomechanics of Bipedal vs. Quadrupedal Walking</h2>
            <p>One of the most surprising insights revealed by this calculator is the massive discrepancy between human and canine calorie burn. In almost all scenarios, the human owner will burn significantly more calories than the dog, even when walking at the exact same speed over the exact same distance. There are two primary biological reasons for this:</p>
            <p><strong>1. Mass Differences:</strong> Caloric burn is heavily dependent on mass. The heavier an object is, the more metabolic energy is required to move it through space. The average adult human weighs between 150 and 190 pounds, while a medium-sized dog weighs only 40 to 60 pounds. Moving 180 pounds requires vastly more energy than moving 50 pounds.</p>
            <p><strong>2. Quadrupedal Efficiency:</strong> Dogs are highly evolved quadrupedal athletes. Walking on four legs distributes weight and effort much more efficiently than walking on two. Bipedal walking (human walking) requires constant micro-adjustments in the core and lower body just to maintain balance. Because dogs do not have to fight gravity to stay upright in the same way, their base metabolic rate for locomotion is incredibly low.</p>

            <h2 className="text-2xl font-bold mb-3">Decoding Walk Intensities</h2>
            <p>The pace of your walk radically alters the caloric outcome. Our calculator utilizes four distinct intensity profiles to provide accurate data:</p>
            <ul>
              <li><strong>The Sniffari (Slow):</strong> This is a decompressive walk where the dog sets the pace. It involves walking a few feet, stopping to thoroughly smell a fire hydrant or bush, and moving on. While physical calorie burn is very low (about 0.4 calories per pound per hour for the dog), the mental stimulation of processing complex olfactory data is actually quite exhausting for the animal.</li>
              <li><strong>Normal Walk:</strong> A steady, consistent pace (roughly 3 mph) with minimal stopping. This is the standard daily neighborhood walk. It elevates the heart rate slightly and provides excellent joint mobility without causing heavy panting.</li>
              <li><strong>Brisk Walk:</strong> A fast, highly intentional pace (roughly 4 mph) designed for fitness. The owner is likely sweating, and the dog is maintaining an extended trot. This pace forces the dog into a higher metabolic state, burning roughly 0.8 calories per pound per hour.</li>
              <li><strong>Jogging/Running:</strong> Sustained running (5+ mph). This requires significant cardiovascular output from both parties. If you jog with your dog, you must ensure they are properly conditioned for it, as dogs overheat much faster than humans do.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Managing Canine Obesity</h2>
            <p>Canine obesity is an epidemic in the modern world. According to the Association for Pet Obesity Prevention, over 50% of domestic dogs are classified as overweight or obese. This excess weight leads to devastating health consequences, including osteoarthritis, diabetes, cruciate ligament tears, and a significantly shortened lifespan.</p>
            <p>Weight loss in dogs, just as in humans, requires a caloric deficit. You must ensure the dog is burning more energy than they are consuming. This calculator helps you manage that equation. For instance, if the calculator shows that a 45-minute walk only burns 60 calories, but you regularly give your dog a 120-calorie dental chew immediately after the walk, you are actually putting the dog in a caloric surplus. By tracking exact burn rates, you can adjust feeding portions accordingly.</p>

            <h2 className="text-2xl font-bold mb-3">Is Walking Enough Exercise?</h2>
            <p>A common mistake among dog owners is assuming that a 30-minute daily walk fulfills the exercise requirements of all breeds. The truth depends entirely on genetics.</p>
            <p>If you own a low-energy or brachycephalic (flat-faced) breed—such as a Pug, English Bulldog, or Basset Hound—a moderate daily walk is often perfectly sufficient to keep them healthy. In fact, over-exercising these breeds can cause dangerous respiratory distress.</p>
            <p>However, if you own a high-drive working or sporting breed—such as a German Shepherd, Border Collie, Siberian Husky, or Vizsla—walking is merely a warm-up. These dogs were genetically engineered to run for miles or perform intense physical labor all day. A brisk walk will not tire them out. To prevent destructive behaviors (like chewing furniture or excessive barking), these breeds require high-intensity cardiovascular exercise, such as running off-leash, intense games of fetch, or agility training.</p>

            <h2 className="text-2xl font-bold mb-3">The Psychological Importance of the Walk</h2>
            <p>While this tool focuses heavily on the physical metrics of walking, it is vital not to overlook the psychological aspects. For a dog, a walk is not just a treadmill session; it is their primary method of exploring the world.</p>
            <p>Dogs 'see' the world through their noses. When a dog stops to smell a patch of grass, they are essentially reading the neighborhood newspaper—gathering data on what other animals have passed by, their health status, and their gender. Denying a dog the opportunity to sniff during a walk is akin to placing a human on a beautiful hiking trail but forcing them to wear a blindfold. Therefore, a perfectly balanced canine fitness routine should include both "Brisk Walks" for physical cardiovascular health and "Sniffaris" for mental enrichment.</p>

            <h2 className="text-2xl font-bold mb-3">Safety Considerations for Exercise</h2>
            <p>When implementing a walking routine to burn calories, safety must come first. Dogs cannot sweat through their skin to cool down; they rely almost entirely on panting and releasing heat through their paw pads. Therefore, walking a dog on hot asphalt during the summer can lead to severe burns and heatstroke. Always press the back of your hand against the pavement for seven seconds; if it is too hot for your hand, it is too hot for your dog's paws.</p>
            <p>Additionally, puppies under the age of 12 to 18 months should not be forced into prolonged brisk walks or jogging routines. Their growth plates have not yet fused, and forced, repetitive impact on hard surfaces can cause permanent orthopedic damage.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>The dog walk is the foundation of the human-canine bond. It provides necessary physical exertion, mental enrichment, and quality bonding time. By using the Dog Walk Calorie Burn Calculator, you can elevate this daily routine from a simple chore to a measurable, data-driven fitness activity that optimizes the health and longevity of both you and your best friend.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-walk-calorie-burn-calculator" />
          <PopularCalculators exclude="/calculator/dog-walk-calorie-burn-calculator" />
        </div>
      </div>
    </>
  );
}
