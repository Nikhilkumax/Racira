"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface HIITResult {
  caloriesBurned: number;
  epocCalories: number;
  totalBurn: number;
  activeMins: number;
  restMins: number;
  metValue: number;
  chartData: { name: string; active: number; rest: number; epoc: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcHIIT(
  weightLbs: number, activeDurationSecs: number, restDurationSecs: number, 
  rounds: number, intensity: string
): HIITResult {
  const weightKg = weightLbs / 2.20462;
  
  // Calculate total times
  const activeMins = (activeDurationSecs * rounds) / 60;
  const restMins = (restDurationSecs * (rounds - 1)) / 60; // No rest after the last round
  const totalSessionMins = activeMins + restMins;

  // Determine MET for the Active intervals
  let activeMet = 8.0; 
  if (intensity === "moderate") activeMet = 8.0; // Standard circuit training
  else if (intensity === "vigorous") activeMet = 10.0; // Very hard circuit (burpees/squat jumps)
  else if (intensity === "allout") activeMet = 14.0; // True Tabata style, maximal effort

  // Rest MET (Usually light walking or standing)
  const restMet = 2.5;

  // Calculate calories for Active and Rest phases
  // Calories = (MET * 3.5 * weightKg * minutes) / 200
  const activeCalories = (activeMet * 3.5 * weightKg * activeMins) / 200;
  const restCalories = (restMet * 3.5 * weightKg * restMins) / 200;
  const caloriesBurned = Math.round(activeCalories + restCalories);

  // EPOC (Excess Post-exercise Oxygen Consumption) - the "Afterburn" effect
  // HIIT creates a larger oxygen debt than steady state cardio.
  // Generally ranges from 6% to 15% of total session calories based on intensity
  let epocMultiplier = 0.06;
  if (intensity === "vigorous") epocMultiplier = 0.10;
  if (intensity === "allout") epocMultiplier = 0.15; // True HIIT creates massive EPOC

  const epocCalories = Math.round(caloriesBurned * epocMultiplier);
  const totalBurn = caloriesBurned + epocCalories;

  // Average MET for the whole session
  const avgMet = (caloriesBurned * 200) / (3.5 * weightKg * totalSessionMins);

  const chartData = [
    { name: "Your HIIT", active: Math.round(activeCalories), rest: Math.round(restCalories), epoc: epocCalories },
    // Compare against standard LISS (Low Intensity Steady State) for the EXACT same total time
    { name: "Steady Jog", active: Math.round(((8.0 * 3.5 * weightKg * totalSessionMins) / 200)), rest: 0, epoc: 0 } 
  ];

  const summaryStats = [
    { label: "Total Session Time", value: `${Math.round(totalSessionMins)} mins` },
    { label: "Active Work Time", value: `${Math.round(activeMins)} mins` },
    { label: "Avg Session METs", value: avgMet.toFixed(1) },
    { label: "The 'Afterburn'", value: `+${epocCalories} kcal` },
  ];

  return { caloriesBurned, epocCalories, totalBurn, activeMins, restMins, metValue: avgMet, chartData, summaryStats };
}

export default function HiitCalorieCalculator() {
  const [weight, setWeight] = useState("160");
  const [activeSecs, setActiveSecs] = useState("40");
  const [restSecs, setRestSecs] = useState("20");
  const [rounds, setRounds] = useState("20"); // e.g. 20 min workout
  const [intensity, setIntensity] = useState("vigorous");

  const [result, setResult] = useState<HIITResult | null>(null);

  const calculate = () => {
    setResult(calcHIIT(
      parseInt(weight) || 160, parseInt(activeSecs) || 0, parseInt(restSecs) || 0,
      parseInt(rounds) || 0, intensity
    ));
  };

  useEffect(() => { setResult(calcHIIT(160, 40, 20, 20, "vigorous")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is EPOC or the 'Afterburn' effect?", answer: "EPOC stands for Excess Post-exercise Oxygen Consumption. During true High-Intensity Interval Training (HIIT), you push your body so hard that it cannot take in enough oxygen to meet the energy demand, creating an 'oxygen debt'. After the workout, your body must burn extra calories for hours to restore oxygen levels, clear lactic acid, and repair muscle fibers. This means you keep burning calories while sitting on the couch later that day." },
    { question: "Is HIIT better than steady-state cardio (LISS) for fat loss?", answer: "HIIT is more time-efficient. A 20-minute true HIIT session can burn a similar amount of total calories (when including EPOC) as a 45-minute steady jog. However, true HIIT is incredibly taxing on the Central Nervous System (CNS) and requires significant recovery time. Doing true HIIT every single day leads to overtraining. A mix of 1-2 HIIT sessions and 2-3 LISS sessions per week is optimal." },
    { question: "Why is true HIIT so difficult?", answer: "Most people who say they do 'HIIT' are actually just doing moderate circuit training. True HIIT requires pushing your heart rate to 85-95% of its maximum during the active intervals. If you can easily speak a full sentence during the active phase, you are not doing true HIIT. Because the intensity must be maximal, true HIIT sessions generally cannot last longer than 15-20 minutes." },
    { question: "What is a Tabata workout?", answer: "Tabata is a very specific, scientifically studied form of HIIT. It consists of exactly 8 rounds of 20 seconds of 'all-out' maximal effort, followed by 10 seconds of complete rest. The total workout lasts only 4 minutes. Despite its brevity, studies show it improves both aerobic and anaerobic capacity significantly." },
    { question: "Do I burn more calories during the rest periods?", answer: "You burn fewer calories per minute during the rest periods compared to the active work, but the rest periods are crucial. By resting, you allow your ATP (cellular energy) stores to partially replenish, which allows you to hit the next active interval with maximal intensity again. If you skip the rest, you are just doing steady-state cardio." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "HIIT Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">HIIT Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Your Weight</label>
              <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">lbs</span></div>
            </div>
            
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Interval Structure</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Active Time (per round)</label>
                  <div className={inp}><input type="number" value={activeSecs} onChange={e => setActiveSecs(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">sec</span></div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Rest Time (per round)</label>
                  <div className={inp}><input type="number" value={restSecs} onChange={e => setRestSecs(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">sec</span></div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Total Number of Rounds</label>
                <div className={inp}><input type="number" value={rounds} onChange={e => setRounds(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div>
              <label className="text-base font-medium mb-1.5 block mt-2">Active Interval Intensity</label>
              <select value={intensity} onChange={e => setIntensity(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                <option value="moderate">Moderate Circuit (e.g. standard OrangeTheory)</option>
                <option value="vigorous">Vigorous (e.g. heavy kettlebells, sprinting)</option>
                <option value="allout">True Maximal / All-Out (e.g. Tabata sprints)</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate HIIT Burn
              </button>
              <button onClick={() => { setWeight("160"); setActiveSecs("40"); setRestSecs("20"); setRounds("20"); setIntensity("vigorous"); setResult(calcHIIT(160, 40, 20, 20, "vigorous")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold uppercase tracking-wider mb-1 text-primary">Total Caloric Impact</div>
                <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.totalBurn} <span className="text-xl font-normal text-muted-foreground">kcal</span></div>
                <div className="text-base text-muted-foreground mt-2">
                  <span className="font-medium text-foreground">{result.caloriesBurned} kcal</span> burned during the session, plus an estimated <span className="font-medium text-foreground">{result.epocCalories} kcal</span> burned post-workout (EPOC).
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm font-bold text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">HIIT vs. Steady State Cardio (Time Equivalency)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip cursor={{ fill: "var(--secondary)" }} formatter={(v: any, name: string) => [`${v} kcal`, name === 'epoc' ? 'Afterburn (EPOC)' : name === 'active' ? 'Active Work' : 'Rest Periods']} />
                    <Bar dataKey="active" stackId="a" fill="#3b82f6" name="Active Intervals" />
                    <Bar dataKey="rest" stackId="a" fill="var(--muted-foreground)" name="Rest Intervals" />
                    <Bar dataKey="epoc" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} name="EPOC Afterburn" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Science of High-Intensity Interval Training</h2>
            <p>This <strong>HIIT Calorie Calculator</strong> uses clinical METs formulas to estimate the energy you burn during the active and rest phases of an interval workout, and crucially, calculates the "Afterburn" (EPOC) effect. HIIT is a training technique where you give 100% maximal effort through quick, intense bursts of exercise, followed by short, sometimes active, recovery periods. This type of training keeps your heart rate up and burns more fat in less time.</p>
            <h2>The Magic of EPOC</h2>
            <p>EPOC stands for Excess Post-exercise Oxygen Consumption. When you push your body near its VO2 Max (maximal oxygen uptake) during a sprint or burpee, you create an oxygen debt. After the workout ends, your body must work overtime to restore oxygen levels in the blood, clear lactic acid, and begin repairing muscle fibers. This recovery process requires significant energy. As a result, a true HIIT session causes your body to continue burning calories at an elevated rate for several hours after you leave the gym. The EPOC effect can add 6% to 15% more total calories to your session's burn.</p>
            <h2>Why Rest Intervals Matter</h2>
            <p>It is tempting to shorten the rest intervals (e.g. 10 seconds of rest for 50 seconds of work) thinking it will burn more calories. While it does increase total active time, it usually prevents you from hitting true maximal intensity during the active phases because you are too fatigued. By taking a proper 20 or 30-second rest, your ATP stores partially replenish, allowing you to hit 95% heart rate again. The extreme spikes and drops in heart rate are what create the massive EPOC effect. Related tools: <a href="/calculator/mets-calculator">METs Activity Calculator</a>, <a href="/calculator/daily-calorie-burn-calculator">TDEE Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hiit-calorie-calculator" />
          <PopularCalculators exclude="/calculator/hiit-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
