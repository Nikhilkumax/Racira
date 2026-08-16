"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CaloriesBurnedCalculator = () => {
  const [weight, setWeight] = useState("160");
  const [unit, setUnit] = useState("lb");
  const [duration, setDuration] = useState("60"); // minutes
  const [activityType, setActivityType] = useState("walking");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Approximate MET (Metabolic Equivalent of Task) values
  const metValues: Record<string, number> = {
    walking: 3.5, // brisk
    running: 9.8, // 6 mph
    cycling: 7.5, // moderate
    swimming: 6.0, // leisurely
    weightlifting: 3.0, // general
    yoga: 2.5, // hatha
    hiit: 8.0, // vigorous
    tennis: 7.3,
    basketball: 8.0
  };

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const m = parseFloat(duration);

    if (w <= 0 || m <= 0) return;

    const weightKg = unit === "lb" ? w / 2.20462 : w;
    const met = metValues[activityType] || 3.5;

    // Formula: Calories = MET * Weight (kg) * Time (hrs)
    const calories = met * weightKg * (m / 60);

    setResults({ 
      calories: Math.round(calories),
      caloriesPerHour: Math.round(met * weightKg),
      met: met.toFixed(1)
    });
  };

  const reset = () => {
    setShowResults(false); setWeight("160"); setUnit("lb"); setDuration("60"); setActivityType("walking"); setResults(null); };

  const faqs = [
    { question: "What is a MET?", answer: "MET stands for Metabolic Equivalent of Task. One MET is the amount of energy you use while sitting quietly. An activity with a MET of 4 means you are burning 4 times as many calories as you would if you were just resting." },
    { question: "Are calorie counters on cardio machines accurate?", answer: "Usually not. Machines often overestimate calories burned by 15-20% because they don't account for your specific body composition, resting metabolic rate, and efficiency of movement. MET-based calculators offer a more standardized estimate." },
    { question: "Does weightlifting burn a lot of calories?", answer: "During the workout, weightlifting burns fewer calories than continuous cardio (like running). However, lifting builds muscle, which increases your Basal Metabolic Rate (BMR), meaning you burn more calories at rest 24/7." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Calories Burned Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calories Burned Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="wt" label={`Weight (${unit})`} value={weight} onChange={setWeight} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="input-calc">
                    <option value="lb">Pounds (lb)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
                <InputField id="dur" label="Duration (Minutes)" value={duration} onChange={setDuration} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Activity</label>
                  <select value={activityType} onChange={e => setActivityType(e.target.value)} className="input-calc">
                    <option value="walking">Walking (Brisk)</option>
                    <option value="running">Running (6 mph)</option>
                    <option value="cycling">Cycling (Moderate)</option>
                    <option value="swimming">Swimming (Moderate)</option>
                    <option value="weightlifting">Weightlifting</option>
                    <option value="hiit">HIIT (Vigorous)</option>
                    <option value="yoga">Yoga</option>
                    <option value="tennis">Tennis (Singles)</option>
                    <option value="basketball">Basketball</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Energy Expenditure</h2>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 mb-2">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Calories Burned</div>
                  <div className="text-4xl font-extrabold text-primary">{results.calories} <span className="text-2xl">kcal</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{results.caloriesPerHour} kcal/hour at MET {results.met}</div>
                </div>
                <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card mb-4">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Burn Rate</div>
                    <div className="text-base font-bold">{results.caloriesPerHour} kcal/hr</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">MET Value</div>
                    <div className="text-base font-bold">{results.met}</div>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Activity MET Value", value: 0, textValue: results.met },
                  { label: "Activity Type", value: 0, textValue: activityType.charAt(0).toUpperCase() + activityType.slice(1) },
                ]} />
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calories by Duration</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[15, 30, 45, 60, 90, 120].map(min => ({ name: `${min}m`, value: Math.round(results.calories * (min / (parseFloat(duration) || 60))) }))} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} kcal`]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How Calorie Burning Works</h2>
              <p>Your total daily energy expenditure (TDEE) is made up of your resting metabolic rate (which accounts for about 60-70% of your calories), the thermic effect of food (digestion), and physical activity.</p>
              <h3>The Role of Body Weight</h3>
              <p>Heavier individuals burn more calories doing the exact same activity as lighter individuals. This is simple physics: it takes more energy to move more mass across a distance or against gravity.</p>
              <h3>The Afterburn Effect (EPOC)</h3>
              <p>High-Intensity Interval Training (HIIT) and heavy resistance training cause Excess Post-exercise Oxygen Consumption (EPOC). This means your body continues to burn calories at an elevated rate for hours after the workout is finished as it repairs muscle tissue and replenishes oxygen stores.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calories-burned" />
          <PopularCalculators exclude="/calculator/calories-burned-calculator" />
        </div>
      </div>
    </>
  );
};
export default CaloriesBurnedCalculator;

