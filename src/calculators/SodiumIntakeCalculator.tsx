"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface SodiumResult {
  target: number;
  maxLimit: number;
  status: string;
  recommendation: string;
  chartData: { name: string; target: number; current: number; limit: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSodium(
  age: number, bloodPressure: string, activityLevel: string,
  sweatRate: string, currentSodium: number
): SodiumResult {
  // Base targets (American Heart Association / FDA)
  let target = 1500; // Ideal AHA target for most adults
  let maxLimit = 2300; // General FDA max limit

  if (age < 14) {
    maxLimit = 1500;
    target = 1200;
  }

  // Adjust for blood pressure
  if (bloodPressure === "high") {
    target = 1500;
    maxLimit = 1500; // Strict limit for hypertension
  }

  // Adjust for activity and sweat (Athletes lose significant sodium)
  if (activityLevel === "intense" || activityLevel === "athlete") {
    if (sweatRate === "high") {
      target += 1000;
      maxLimit += 1500;
    } else {
      target += 500;
      maxLimit += 1000;
    }
  }

  let status = "Adequate";
  let recommendation = "Your sodium intake is within healthy limits.";

  if (currentSodium > maxLimit) {
    status = "Excessive";
    const excess = currentSodium - maxLimit;
    recommendation = `Your intake is ${excess}mg above your maximum healthy limit. Excess sodium is strongly linked to high blood pressure, heart disease, and stroke. Focus on reducing ultra-processed foods and restaurant meals, which contribute 70% of dietary sodium.`;
  } else if (currentSodium > target && currentSodium <= maxLimit) {
    status = "Moderate / Borderline";
    recommendation = `Your intake is below the absolute maximum, but above the ideal target of ${target}mg. The American Heart Association suggests moving closer to ${target}mg for optimal heart health.`;
  } else if (currentSodium < target) {
    if (activityLevel === "athlete" && currentSodium < 1500) {
      status = "Potentially Deficient";
      recommendation = `Given your intense activity level, your sodium intake may be too low. Severe sodium depletion during exercise (hyponatremia) can cause cramping, dizziness, and fatigue. Ensure adequate electrolyte replacement during heavy sweating.`;
    } else {
      status = "Ideal";
      recommendation = `Excellent. Your sodium intake is right at the ideal target for heart health.`;
    }
  }

  const chartData = [
    { name: "Sodium (mg)", target: target, current: currentSodium, limit: maxLimit }
  ];

  const breakdown = [
    { label: "Ideal Target", value: `${target} mg/day` },
    { label: "Absolute Maximum", value: `${maxLimit} mg/day` },
    { label: "Your Current Intake", value: `${currentSodium} mg/day` },
    { label: "Blood Pressure Risk Profile", value: bloodPressure === "high" ? "High Risk (Strict Limit)" : "Normal" },
    { label: "Activity Modifier", value: activityLevel !== "sedentary" ? "Increased allowance for sweat loss" : "Base allowance" },
    { label: "Status", value: status },
  ];

  const summaryStats = [
    { label: "Current Intake", value: `${currentSodium} mg` },
    { label: "Ideal Target", value: `${target} mg` },
    { label: "Max Limit", value: `${maxLimit} mg` },
    { label: "Salt Equivalent", value: `~${(currentSodium / 400).toFixed(1)} grams of salt` },
  ];

  return { target, maxLimit, status, recommendation, chartData, breakdown, summaryStats };
}

export default function SodiumIntakeCalculator() {
  const [age, setAge] = useState("35");
  const [bloodPressure, setBloodPressure] = useState("normal");
  const [activity, setActivity] = useState("moderate");
  const [sweat, setSweat] = useState("normal");
  const [currentSodium, setCurrentSodium] = useState("3400"); // Average American intake
  const [result, setResult] = useState<SodiumResult | null>(null);

  const calculate = () => {
    setResult(calcSodium(
      parseInt(age) || 35, bloodPressure, activity, sweat, parseInt(currentSodium) || 0
    ));
  };

  useEffect(() => { setResult(calcSodium(35, "normal", "moderate", "normal", 3400)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between sodium and salt?", answer: "Salt (sodium chloride) is a chemical compound made of 40% sodium and 60% chloride. When nutritional guidelines mention 'sodium limits' of 2,300mg, they are specifically talking about the sodium portion. To convert sodium to salt, multiply the sodium amount by 2.5. Therefore, 2,300mg of sodium equals about 5,750mg (5.75 grams) of salt — roughly one level teaspoon." },
    { question: "Why is the average sodium intake so high?", answer: "The average American consumes about 3,400mg of sodium daily — far above the 2,300mg limit. Surprisingly, only about 10% of this comes from the salt shaker at home. Over 70% comes from packaged, processed, and restaurant foods. The top culprits are breads/rolls, pizza, sandwiches, cold cuts, soups, and savory snacks. Manufacturers use sodium not just for flavor, but as a preservative and texture enhancer." },
    { question: "Why is too much sodium dangerous?", answer: "Sodium pulls water into your blood vessels, increasing the total volume of blood inside them. This increased volume puts more pressure on your blood vessel walls (high blood pressure). Over time, this extra strain damages the vessel walls and forces the heart to work harder, dramatically increasing the risk of heart attack, stroke, heart failure, and kidney disease." },
    { question: "I sweat a lot during exercise. Do I need more sodium?", answer: "Yes. Athletes or individuals working physically demanding jobs in hot environments can lose 500mg to 1,500mg of sodium per hour of sweat. For these individuals, sticking strictly to a 1,500mg daily limit could cause hyponatremia (dangerously low blood sodium). If you engage in intense exercise lasting longer than 60-90 minutes, electrolyte replacement is necessary." },
    { question: "How can I flush excess sodium from my body?", answer: "Your kidneys regulate sodium levels. The best way to help them flush excess sodium is by increasing your intake of Potassium-rich foods (like bananas, spinach, sweet potatoes, and avocados) and drinking plenty of water. Potassium physiologically counteracts sodium, helping blood vessels relax and promoting sodium excretion in urine." },
    { question: "What is the 'Salty Six'?", answer: "The American Heart Association identified the 'Salty Six' — the six common foods that add the most sodium to our diets: 1. Breads and rolls. 2. Pizza. 3. Sandwiches. 4. Cold cuts and cured meats. 5. Soup. 6. Burritos and tacos. Reducing portion sizes or choosing low-sodium versions of these six foods can drastically lower your daily sodium intake." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Sodium Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Sodium Intake Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Blood Pressure</label>
                <select value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                  <option value="normal">Normal / Healthy</option>
                  <option value="high">High (Hypertension)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Activity Level</label>
              <select value={activity} onChange={e => setActivity(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                <option value="sedentary">Sedentary (Little/no exercise)</option>
                <option value="moderate">Moderate (Standard gym/cardio)</option>
                <option value="intense">Intense (Long endurance, heavy sweating)</option>
                <option value="athlete">Elite Athlete (Marathon, Triathlon)</option>
              </select>
            </div>
            {(activity === "intense" || activity === "athlete") && (
              <div>
                <label className="text-base font-medium mb-1.5 block">Sweat Rate</label>
                <select value={sweat} onChange={e => setSweat(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                  <option value="normal">Normal Sweating</option>
                  <option value="high">Heavy/Salty Sweater (White stains on clothes)</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-base font-medium mb-1.5 block">Estimated Current Intake</label>
              <div className={inp}><input type="number" value={currentSodium} onChange={e => setCurrentSodium(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg/day</span></div>
              <p className="text-xs text-muted-foreground mt-1.5">Average US adult consumes ~3,400mg daily.</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("35"); setBloodPressure("normal"); setActivity("moderate"); setSweat("normal"); setCurrentSodium("3400"); setResult(calcSodium(35, "normal", "moderate", "normal", 3400)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.status === "Excessive" ? "bg-red-500/10 border-red-500" : result.status === "Ideal" ? "bg-primary/10 border-primary" : "bg-amber-500/10 border-amber-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.status === "Excessive" ? "text-red-600" : result.status === "Ideal" ? "text-primary" : "text-amber-600"}`}>Status: {result.status}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.maxLimit} mg <span className="text-lg font-normal text-muted-foreground">/ max daily</span></div>
                <div className="text-base text-muted-foreground mt-2">{result.recommendation}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Target", `${result.target}mg`], ["Max Limit", `${result.maxLimit}mg`], ["Your Intake", `${currentSodium}mg`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Intake vs Thresholds</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" domain={[0, Math.max(4000, result.maxLimit + 500, parseInt(currentSodium) + 500)]} />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip cursor={{ fill: "transparent" }} formatter={(v: any) => [`${v} mg`, ""]} />
                    <ReferenceLine x={result.target} stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" label={{ value: "Ideal", position: "top", fill: "#22c55e", fontSize: 12 }} />
                    <ReferenceLine x={result.maxLimit} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" label={{ value: "Max Limit", position: "top", fill: "#ef4444", fontSize: 12 }} />
                    <Bar dataKey="current" name="Your Intake" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Your Sodium Limits</h2>
            <p>This <strong>Sodium Intake Calculator</strong> determines your ideal sodium target and maximum healthy limit based on guidelines from the FDA and the American Heart Association (AHA). For most adults, the FDA recommends no more than 2,300mg of sodium per day, but the AHA suggests an ideal limit of 1,500mg for optimal cardiovascular health — especially for those with high blood pressure.</p>
            <h2>The Athlete Exception</h2>
            <p>While the general population consumes too much sodium, high-level athletes and endurance runners face the opposite risk. Intense exercise causes significant sodium loss through sweat. If you are training for a marathon, competing in hot climates, or are a "salty sweater," restricting your sodium to 1,500mg can cause severe cramping and hyponatremia. This calculator adjusts your limits upward if you select intense activity profiles.</p>
            <h2>Hidden Sodium in Your Diet</h2>
            <p>You can throw away your salt shaker and still consume excessive sodium. Over 70% of the sodium in the American diet is added during manufacturing and processing. "The Salty Six" (breads, pizza, sandwiches, cold cuts, soup, and tacos) are responsible for a massive portion of dietary sodium. Reading nutrition labels and choosing "low sodium" (140mg or less per serving) or "no salt added" options is the most effective way to lower your intake. Related tools: <a href="/calculator/blood-pressure-calculator">Blood Pressure Calculator</a>, <a href="/calculator/potassium-intake-calculator">Potassium Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sodium-intake-calculator" />
          <PopularCalculators exclude="/calculator/sodium-intake-calculator" />
        </div>
      </div>
    </>
  );
}
