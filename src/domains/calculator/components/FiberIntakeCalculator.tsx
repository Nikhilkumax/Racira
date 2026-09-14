"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FiberResult {
  dailyTarget: number;
  solubleTarget: number;
  insolubleTarget: number;
  status: string;
  recommendation: string;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFiber(
  age: number, gender: string, calories: number, currentFiber: number,
  goal: string
): FiberResult {
  // Base fiber calculation: USDA recommends 14g per 1000 calories
  let target = Math.round((calories / 1000) * 14);

  // Age/Gender specific minimums (Institute of Medicine)
  let minimum = 25; // default female
  if (gender === "male") {
    minimum = age <= 50 ? 38 : 30;
  } else {
    minimum = age <= 50 ? 25 : 21;
  }
  
  if (age < 18) {
    minimum = age + 5; // "Age + 5" rule for children
  }

  // Ensure target meets minimum guidelines
  target = Math.max(target, minimum);

  // Adjust for specific goals
  if (goal === "weight_loss") {
    target = Math.max(target, 35); // Higher fiber promotes satiety
  } else if (goal === "cholesterol") {
    target = Math.max(target, 30);
  } else if (goal === "blood_sugar") {
    target = Math.max(target, 35);
  }

  // Calculate soluble vs insoluble breakdown (approx 1:3 ratio generally recommended, or 25% soluble)
  // For cholesterol, higher soluble is better (aim for 10g+ soluble)
  let solubleTarget = Math.round(target * 0.25);
  if (goal === "cholesterol" || goal === "blood_sugar") {
    solubleTarget = Math.max(solubleTarget, 10);
  }
  const insolubleTarget = target - solubleTarget;

  let status = "Adequate";
  let recommendation = "Your current fiber intake meets recommended guidelines.";

  if (currentFiber < target) {
    status = "Deficient";
    const deficit = target - currentFiber;
    recommendation = `You are short by ${deficit}g of fiber daily. Increase your intake slowly (by 3-5g per day) while drinking plenty of water to avoid digestive discomfort. Focus on beans, lentils, whole grains, and berries.`;
  } else if (currentFiber > target + 20) {
    status = "Very High";
    recommendation = `Your intake is very high (${currentFiber}g). While generally healthy, ensure you are drinking at least 2.5-3 liters of water daily to prevent constipation or bowel blockages.`;
  }

  const chartData = [
    { name: "Soluble Fiber (Oats, Beans, Apples)", value: solubleTarget, color: "#3b82f6" },
    { name: "Insoluble Fiber (Wheat bran, Veggies)", value: insolubleTarget, color: "#22c55e" },
  ];

  const breakdown = [
    { label: "Daily Calorie Intake", value: `${calories} kcal` },
    { label: "IOM Minimum Required", value: `${minimum}g/day` },
    { label: "Goal Adjusted Target", value: `${target}g/day` },
    { label: "Your Current Intake", value: `${currentFiber}g/day` },
    { label: "Deficit/Surplus", value: `${currentFiber - target > 0 ? "+" : ""}${currentFiber - target}g/day` },
    { label: "Status", value: status },
  ];

  const summaryStats = [
    { label: "Total Daily Target", value: `${target}g` },
    { label: "Soluble Target", value: `~${solubleTarget}g` },
    { label: "Insoluble Target", value: `~${insolubleTarget}g` },
    { label: "Water Recommendation", value: "2.5 - 3 Liters" },
  ];

  return { dailyTarget: target, solubleTarget, insolubleTarget, status, recommendation, chartData, breakdown, summaryStats };
}

export default function FiberIntakeCalculator() {
  const [age, setAge] = useState("35");
  const [gender, setGender] = useState("male");
  const [calories, setCalories] = useState("2000");
  const [currentFiber, setCurrentFiber] = useState("15");
  const [goal, setGoal] = useState("general");
  const [result, setResult] = useState<FiberResult | null>(null);

  const calculate = () => {
    setResult(calcFiber(
      parseInt(age) || 35, gender, parseInt(calories) || 2000,
      parseInt(currentFiber) || 15, goal
    ));
  };

  useEffect(() => { setResult(calcFiber(35, "male", 2000, 15, "general")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why is fiber so important?", answer: "Fiber is a type of carbohydrate that your body cannot digest. Instead of being broken down into sugar molecules, it passes through the body undigested. It normalizes bowel movements, lowers cholesterol levels, helps control blood sugar levels, aids in achieving healthy weight, and feeds the healthy bacteria in your gut microbiome." },
    { question: "What is the difference between soluble and insoluble fiber?", answer: "Soluble fiber dissolves in water to form a gel-like material. It helps lower blood cholesterol and glucose levels (found in oats, peas, beans, apples, citrus fruits, carrots, barley, and psyllium). Insoluble fiber promotes the movement of material through your digestive system and increases stool bulk (found in whole-wheat flour, wheat bran, nuts, beans, and vegetables like cauliflower and green beans)." },
    { question: "What happens if I eat too much fiber too fast?", answer: "Increasing your fiber intake too rapidly can cause abdominal cramping, bloating, and intestinal gas. This occurs because the bacteria in your gut need time to adjust to breaking down the increased fiber. To avoid this, increase your fiber intake by just 3-5 grams per day over a few weeks, and absolutely ensure you increase your water intake simultaneously." },
    { question: "Why do I need to drink more water when eating fiber?", answer: "Fiber (especially soluble fiber) acts like a sponge in your digestive tract, absorbing water to form a soft gel. If you eat a high-fiber diet but don't drink enough water, the fiber can actually cause severe constipation or even an intestinal blockage. Aim for at least 8-10 glasses (2-2.5 liters) of water daily when consuming 30g+ of fiber." },
    { question: "Can fiber help with weight loss?", answer: "Yes. High-fiber foods tend to be more filling than low-fiber foods, so you're likely to eat less and stay satisfied longer. They also tend to take longer to eat and to be less 'energy dense,' which means they have fewer calories for the same volume of food. Soluble fiber particularly slows digestion, keeping hunger hormones at bay." },
    { question: "What are the best high-fiber foods?", answer: "Legumes are the kings of fiber: Navy beans (19g per cup), Lentils (15.6g per cup), and Black beans (15g per cup). Other top sources include Chia seeds (10g per ounce), Raspberries (8g per cup), Avocados (10g per medium avocado), and Oats (8g per cup raw). Most Americans only get about 15g of fiber daily, heavily reliant on highly processed grains." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Daily Fiber Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Daily Fiber Intake Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Biological Sex</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["male", "Male"], ["female", "Female"]].map(([v, l]) => (
                    <button key={v} onClick={() => setGender(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${gender === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Daily Calories</label>
                <div className={inp}><input type="number" value={calories} onChange={e => setCalories(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">kcal</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Current Fiber</label>
                <div className={inp}><input type="number" value={currentFiber} onChange={e => setCurrentFiber(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">g/day</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Primary Health Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                <option value="general">General Digestive Health</option>
                <option value="weight_loss">Weight Loss / Satiety</option>
                <option value="cholesterol">Lower LDL Cholesterol</option>
                <option value="blood_sugar">Manage Blood Sugar / Diabetes</option>
              </select>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("35"); setGender("male"); setCalories("2000"); setCurrentFiber("15"); setGoal("general"); setResult(calcFiber(35, "male", 2000, 15, "general")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.status === "Deficient" ? "text-amber-600" : "text-primary"}`}>Status: {result.status}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.dailyTarget} g <span className="text-lg font-normal text-muted-foreground">/ daily</span></div>
                <div className="text-base text-muted-foreground mt-2">{result.recommendation}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Target", `${result.dailyTarget}g`], ["Current", `${currentFiber}g`], ["Soluble", `~${result.solubleTarget}g`], ["Insoluble", `~${result.insolubleTarget}g`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm sm:text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Recommended Fiber Breakdown</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-1/2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                          {result.chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`${v} grams`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-3">
                    {result.chartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{d.name}</div>
                          <div className="text-xs text-muted-foreground">{Math.round((d.value / result.dailyTarget) * 100)}% of total target ({d.value}g)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Much Fiber Should You Eat?</h2>
            <p>This <strong>Daily Fiber Intake Calculator</strong> determines your personalized fiber needs based on USDA guidelines (14g per 1,000 calories) while ensuring you meet the Institute of Medicine's absolute minimums (38g for men, 25g for women under 50). It also adjusts your target upward if your primary health goal is weight loss, cholesterol reduction, or blood sugar management.</p>
            <h2 className="text-2xl font-bold mb-3">The Soluble vs Insoluble Ratio</h2>
            <p>While you don't need to obsessively track the exact ratio, a healthy diet naturally provides about 1 part soluble fiber to 3 parts insoluble fiber. <strong>Soluble fiber</strong> (oats, beans, apples) forms a gel in the gut, binding to cholesterol and slowing sugar absorption. <strong>Insoluble fiber</strong> (wheat bran, leafy greens, nuts) acts like a broom, sweeping material through the digestive tract and adding bulk to stool. Both are critical for a healthy microbiome.</p>
            <h2 className="text-2xl font-bold mb-3">The Water Warning</h2>
            <p>The most common mistake people make when increasing fiber is failing to increase their water intake. Fiber absorbs water. If you eat 35g of fiber but are dehydrated, the fiber turns into a hard mass in your intestines, causing severe constipation, bloating, and cramping. When you increase your fiber, you must simultaneously increase your hydration. Related tools: <a href="/calculator/macro-calculator">Macro Calculator</a>, <a href="/calculator/calorie-calculator">Calorie Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fiber-intake-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Fiber Intake Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Fiber Intake Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Fiber Intake Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Fiber Intake Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Fiber Intake Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/fiber-intake-calculator" />
        </div>
      </div>
    </>
  );
}
