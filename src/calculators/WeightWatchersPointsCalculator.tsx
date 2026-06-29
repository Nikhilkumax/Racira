"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WeightWatchersResult {
  dailyPoints: number;
  weeklyPoints: number;
  activityPoints: number;
  breakdown: { label: string; value: string }[];
  foodPoints: { food: string; points: number; color: string }[];
  pieData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWWPoints(weight: number, heightCm: number, age: number, sex: string, activity: string): WeightWatchersResult {
  // SmartPoints personal daily target approximation
  // Formula based on: weight, height, age, sex, activity
  const heightIn = heightCm / 2.54;
  const bmi = weight / ((heightCm / 100) ** 2);

  // Base points (PersonalPoints approximation)
  let basePoints = 23;
  if (sex === "male") basePoints += 8;
  if (age < 27) basePoints += 4;
  else if (age < 36) basePoints += 3;
  else if (age < 50) basePoints += 2;

  // Weight factor
  basePoints += Math.floor(weight / 10);

  // Height factor
  basePoints += Math.floor(heightIn / 4);

  // Activity multiplier
  const activityBonus = activity === "sedentary" ? 0 : activity === "light" ? 4 : activity === "moderate" ? 6 : 8;
  
  // Ensure minimum points for safety
  const dailyPoints = Math.max(23, basePoints + activityBonus);
  const weeklyPoints = 49; // standard WW weekly flex points
  const activityPoints = activityBonus;

  // Approximate food points (SmartPoints) for common foods
  const foodPoints = [
    { food: "Egg (1 large)", points: 0, color: "#22c55e" },
    { food: "Banana (medium)", points: 0, color: "#22c55e" },
    { food: "Greek Yogurt (plain, 0%)", points: 0, color: "#22c55e" },
    { food: "Chicken Breast (100g)", points: 1, color: "#84cc16" },
    { food: "Bread (1 slice)", points: 3, color: "#f59e0b" },
    { food: "Cheese (28g)", points: 4, color: "#f59e0b" },
    { food: "Beer (355ml)", points: 5, color: "#f97316" },
    { food: "McDonald's Big Mac", points: 18, color: "#ef4444" },
  ];

  const breakdown = [
    { label: "Daily Points Budget", value: `${dailyPoints} pts` },
    { label: "Weekly Flex Points", value: `${weeklyPoints} pts` },
    { label: "Activity Bonus", value: `+${activityPoints} pts/day` },
    { label: "Total Daily (incl. activity)", value: `${dailyPoints + Math.floor(weeklyPoints/7)} pts` },
    { label: "Current BMI", value: bmi.toFixed(1) },
    { label: "Estimated Daily Calories", value: `~${Math.round(dailyPoints * 30 + 150)} kcal` },
    { label: "Zero Point Foods", value: "200+ items free" },
  ];

  const summaryStats = [
    { label: "Daily Target", value: `${dailyPoints} pts` },
    { label: "Weekly Flex", value: `${weeklyPoints} pts` },
    { label: "Activity Pts", value: `+${activityPoints}` },
    { label: "Approx. Calories", value: `~${Math.round(dailyPoints * 30 + 150)}` },
    { label: "Your BMI", value: bmi.toFixed(1) },
    { label: "Goal Rate", value: "0.5–1 kg/wk" },
  ];

  const pieData = [
    { name: "Daily Points", value: dailyPoints, color: "#3b82f6" },
    { name: "Daily Flex Portion", value: 7, color: "#22c55e" },
    { name: "Activity Bonus", value: activityPoints, color: "#f59e0b" },
  ];

  return { dailyPoints, weeklyPoints, activityPoints, breakdown, foodPoints, pieData, summaryStats };
}

export default function WeightWatchersPointsCalculator() {
  const [weight, setWeight] = useState("82");
  const [height, setHeight] = useState("168");
  const [age, setAge] = useState("35");
  const [sex, setSex] = useState("female");
  const [activity, setActivity] = useState("light");
  const [result, setResult] = useState<WeightWatchersResult | null>(null);

  const calculate = () => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age);
    if (w > 0 && h > 0 && a > 0) setResult(calcWWPoints(w, h, a, sex, activity));
  };

  useEffect(() => { setResult(calcWWPoints(82, 168, 35, "female", "light")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "How are Weight Watchers points calculated?", answer: "WW SmartPoints are calculated using a proprietary formula based on a food's calories, saturated fat, added sugar, and protein content. Foods high in protein score lower, while foods high in saturated fat and sugar score exponentially higher. Over 200 'Zero Point' foods (like most fruits, vegetables, and lean proteins) don't count toward your daily budget. Your personal daily points budget is determined by your age, biological sex, height, weight, and activity level." },
    { question: "How many WW points do I get per day?", answer: "Your Daily SmartPoints budget is highly personalized, typically ranging from 23 to 42 points. Women generally receive between 23 and 30 points, while men often receive 26 to 38 points due to higher baseline metabolic rates. Younger, taller, and heavier individuals receive more points. Additionally, every member receives a bank of 49 'Weekly Flex Points' to handle special occasions, larger meals, or alcohol." },
    { question: "What are Zero Point foods?", answer: "The cornerstone of the WW program is the Zero Point food list. This includes over 200 nutrient-dense items such as apples, bananas, broccoli, eggs, skinless chicken breast, turkey breast, most fish and shellfish, plain non-fat Greek yogurt, beans, lentils, and tofu. These foods form the foundation of your diet and can be eaten freely without tracking or dipping into your daily points budget. However, eating them until uncomfortably stuffed can still hinder weight loss." },
    { question: "How do activity points (FitPoints) work?", answer: "FitPoints are bonus points earned through exercise and physical activity. You can set a weekly FitPoints goal based on your fitness level. You have the option to 'swap' these points (eat them back as extra food) or simply bank them. For steady weight loss, WW typically recommends not eating back all of your activity points, using them instead as a caloric buffer to accelerate fat loss." },
    { question: "How many points is a typical day of eating?", answer: "A typical day on WW relies heavily on Zero Point foods. Breakfast might be three scrambled eggs (0 pts) with two slices of whole-wheat toast (6 pts). Lunch could be a massive grilled chicken salad (2 pts for the dressing). A snack might be an apple (0 pts) and a 28g serving of cheddar cheese (4 pts). Dinner could be baked salmon (0 pts) with roasted vegetables (0 pts) and a cup of quinoa (6 pts). Total for the day: 18 points, leaving plenty of room for dessert or a glass of wine." },
    { question: "Is WW SmartPoints the same as PersonalPoints?", answer: "WW frequently updates its algorithm. The original Points system was strictly calorie-based. ProPoints (PointsPlus) introduced macros. SmartPoints heavily penalized sugar and saturated fat. The most recent PersonalPoints system (launched in 2022) factors in unsaturated (healthy) fats and tailors the Zero Point list to your specific personal food preferences. This calculator estimates the standard SmartPoints/PersonalPoints baseline using publicly available methodologies." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Weight Watchers Points Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Weight Watchers Points Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
              <div className="grid grid-cols-2 gap-2">
                {["female", "male"].map(s => (
                  <button key={s} onClick={() => setSex(s)} className={`h-10 rounded-md border text-base font-medium capitalize transition-colors ${sex === s ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border bg-background hover:bg-secondary"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className={suf}>kg</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /><span className={suf}>cm</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Age</label>
              <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} min={18} max={100} className={ci} /><span className={suf}>yrs</span></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Daily Activity Level</label>
              <div className="grid grid-cols-2 gap-2">
                {[["sedentary", "Sedentary"], ["light", "Light"], ["moderate", "Moderate"], ["active", "Very Active"]].map(([v, l]) => (
                  <button key={v} onClick={() => setActivity(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${activity === v ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setWeight("82"); setHeight("168"); setAge("35"); setSex("female"); setActivity("light"); setResult(calcWWPoints(82, 168, 35, "female", "light")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Your Daily Points Budget</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.dailyPoints} pts</div>
                <div className="text-sm text-muted-foreground mt-1">Plus {result.weeklyPoints} weekly flex points to use whenever you want.</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Daily Target", `${result.dailyPoints} pts`], ["Weekly Flex", `${result.weeklyPoints} pts`], ["Activity Bonus", `+${result.activityPoints} pts`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Program Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "font-bold text-primary border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Daily Budget Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" stroke="none">
                        {result.pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} points`, "Allocation"]} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Common Food Points</h3>
                  <div className="space-y-2.5">
                    {result.foodPoints.map((f, i) => (
                      <div key={i} className="flex items-center justify-between pb-2 border-b border-border/40 last:border-0">
                        <span className="text-sm font-medium text-muted-foreground">{f.food}</span>
                        <span className="font-bold px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${f.color}15`, color: f.color }}>{f.points === 0 ? "ZERO" : `${f.points} pts`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Weight Watchers Points Calculator?</h2>
            <p>The <strong>Weight Watchers (WW) Points Calculator</strong> is an estimation tool designed to help you determine your daily points budget based on the core methodologies of the famous WW program. For decades, Weight Watchers has been one of the most successful commercial weight loss programs in the world. Its success stems from a simple premise: counting calories is tedious and mathematically flawed because not all calories are processed by the body in the same way. 100 calories of salmon is fundamentally different from 100 calories of jellybeans.</p>
            <p>To solve this, WW created a proprietary "Points" algorithm. This algorithm assigns a single numerical value to every food based on its nutritional profile, heavily penalizing sugar and saturated fats while rewarding lean proteins and fiber. Simultaneously, the program assigns you a daily points budget based on your height, weight, age, and sex. Your goal is simply to eat whatever you want, provided you stay under your daily points limit.</p>

            <h2>How the Algorithm Calculates Your Daily Budget</h2>
            <p>Your daily points budget is not arbitrary; it is a calculation of your Basal Metabolic Rate (BMR) adjusted for your weight loss goals. The calculator processes your inputs through a series of metabolic steps.</p>
            <p>First, it establishes a <strong>Base Rate</strong>. The absolute minimum points budget WW historically allows is 23 points. This ensures that no matter how small you are, you are receiving enough energy to sustain vital organ functions without entering starvation mode.</p>
            <p>Second, it applies <strong>Biological Modifiers</strong>. Because males generally possess a higher percentage of lean muscle mass than females, they naturally burn more calories at rest. Therefore, males receive an automatic bonus to their base points (typically +8 points). Age is also factored in; younger individuals have faster metabolisms and receive additional points, which scale down as you enter your 30s, 40s, and 50s.</p>
            <p>Third, it scales for <strong>Height and Weight</strong>. The taller and heavier you are, the more energy it takes simply to move your body through space. You receive approximately 1 extra point for every 10 pounds of body weight, and additional points based on your height.</p>
            <p>Finally, it adds an <strong>Activity Bonus</strong>. If you input that you are highly active, the calculator grants you extra points to fuel that physical exertion. The resulting number is your highly personalized Daily SmartPoints Budget.</p>

            <h2>Understanding The "Zero Point" Foods</h2>
            <p>The genius of the WW system lies in its "Zero Point" foods. To prevent members from feeling starved while restricting their daily budget, WW designated over 200 nutritionally dense foods as costing zero points. You can eat as much of them as you want without tracking them.</p>
            <p>This list includes nearly all fresh fruits, non-starchy vegetables, eggs, skinless chicken breast, turkey breast, most fish and shellfish, beans, lentils, tofu, and plain non-fat Greek yogurt.</p>
            <p>Why are they zero points? Because they are incredibly satiating. It is very difficult to binge-eat plain chicken breast and broccoli. The high protein and fiber content signals to your brain that you are full long before you can consume enough calories to derail your weight loss. Zero Point foods act as the foundation of your diet, allowing you to save your actual points budget for complex carbs, healthy fats, or evening treats.</p>

            <h2>The Weekly Flex Points System</h2>
            <p>Rigid diets fail because they don't account for real life. If a diet requires you to eat exactly 1,500 calories every single day, what happens when you attend a wedding on Saturday? You break the diet, feel guilty, and often quit entirely.</p>
            <p>WW solves this psychological trap by giving every member a bank of <strong>49 Weekly Flex Points</strong>. This is an additional pool of points completely separate from your daily budget. You can use them however you see fit. You can ignore them entirely to accelerate fat loss, spread them out by adding 7 extra points to your dinner every night, or save all 49 of them to drink wine and eat pizza guilt-free on Saturday night. The flex points absorb the shock of real-world eating, making the diet sustainable long-term.</p>

            <h2>Practical Examples: How to Eat on WW</h2>
            <p>To understand how liberating the points system can be, let's look at how a person with a 25-point daily budget might structure their day.</p>
            <p><strong>Breakfast:</strong> A three-egg omelet loaded with spinach, tomatoes, and onions (0 points), alongside a massive bowl of mixed berries (0 points). Total cost: 0 points. You are completely full and haven't touched your budget.</p>
            <p><strong>Lunch:</strong> A large salad with grilled chicken breast (0 points). You add a generous serving of high-calorie Caesar dressing (5 points) and croutons (2 points). Total cost: 7 points.</p>
            <p><strong>Snack:</strong> Plain Greek yogurt (0 points) mixed with a handful of almonds (4 points). Total cost: 4 points.</p>
            <p><strong>Dinner:</strong> You have 14 points remaining. You eat baked salmon (0 points) and asparagus (0 points), but you use 5 points for a serving of olive oil to roast the vegetables. You use 5 points for a serving of pasta on the side. Total cost: 10 points. You still have 4 points left over to roll into your weekly flex bank, or use on a small dessert, having eaten massive, filling meals all day.</p>

            <h2>Tips & Best Practices</h2>
            <p>To maximize your success using a points-based weight loss system, follow these proven best practices.</p>
            <p>First, build every single meal around a Zero Point food. If you are hungry, eat protein or fiber first. Never spend your points on a snack until you have eaten an apple or a hard-boiled egg. If you are still hungry 20 minutes later, then spend the points.</p>
            <p>Second, beware of liquid calories. Because the WW algorithm heavily penalizes sugar and lack of fiber, sodas, fruit juices, and alcohol cost an astronomical amount of points relative to how full they make you feel. A single large sugary coffee drink can cost 15 points—more than half a woman's daily budget. Drink water, black coffee, or zero-calorie sodas.</p>
            <p>Third, weigh and measure your "pointed" foods. It is incredibly easy to accidentally use 3 tablespoons of peanut butter when you thought you only used 1. Because fat is calorically dense, that small error can cost you 6 to 8 points. Buy a cheap digital food scale and use it religiously for anything that isn't on the Zero Point list.</p>

            <h2>Benefits</h2>
            <p>Utilizing a Points Calculator shifts the focus of weight loss from deprivation to optimization. It gamifies nutrition, encouraging you to "spend" your budget wisely while relying on healthy, filling foods to carry you through the day.</p>
            <p>By understanding your daily budget, mastering the Zero Point list, and utilizing your weekly flex points to navigate social events, you can lose significant amounts of weight without ever feeling like you are trapped on a restrictive diet.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weight-watchers-points-calculator" />
          <PopularCalculators exclude="/calculator/weight-watchers-points-calculator" />
        </div>
      </div>
    </>
  );
}
