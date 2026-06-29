"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface WalkingResult {
  caloriesBurned: number;
  caloriesPerHour: number;
  metValue: number;
  timeMins: number;
  paceStr: string;
  chartData: { name: string; calories: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWalking(
  weightLbs: number, distanceMiles: number, durationMins: number,
  incline: string, terrain: string
): WalkingResult {
  const weightKg = weightLbs / 2.20462;
  
  // Calculate speed in MPH
  const durationHours = durationMins / 60;
  const speedMph = distanceMiles / durationHours;

  // Determine base MET value from speed
  let met = 2.0;
  if (speedMph < 2.0) met = 2.0; // Very slow
  else if (speedMph >= 2.0 && speedMph < 2.5) met = 2.8;
  else if (speedMph >= 2.5 && speedMph < 3.0) met = 3.0;
  else if (speedMph >= 3.0 && speedMph < 3.5) met = 3.5; // Moderate pace
  else if (speedMph >= 3.5 && speedMph < 4.0) met = 4.3; // Brisk pace
  else if (speedMph >= 4.0 && speedMph < 4.5) met = 5.0; // Very brisk
  else if (speedMph >= 4.5 && speedMph < 5.0) met = 6.3; // Power walk
  else met = 8.0; // Racewalking

  // Adjust for incline
  if (incline === "slight") met *= 1.2; // ~1-3% grade
  else if (incline === "moderate") met *= 1.4; // ~4-6% grade
  else if (incline === "steep") met *= 1.6; // ~7-10% grade
  else if (incline === "stairs") met = 8.0; // Stair climbing is extremely demanding

  // Adjust for terrain
  if (terrain === "trail") met *= 1.1; // Uneven surface requires more stabilization
  else if (terrain === "sand") met *= 1.5; // Sand requires massive energy
  else if (terrain === "snow") met *= 1.6;

  // Calculate calories
  // Calories/min = (MET * 3.5 * weightKg) / 200
  const calPerMin = (met * 3.5 * weightKg) / 200;
  const caloriesBurned = Math.round(calPerMin * durationMins);
  const caloriesPerHour = Math.round(calPerMin * 60);

  // Pace formatting
  const paceMins = Math.floor(durationMins / distanceMiles);
  const paceSecs = Math.round(((durationMins / distanceMiles) - paceMins) * 60);
  const paceStr = `${paceMins}:${paceSecs.toString().padStart(2, '0')} min/mi`;

  // Chart data
  const chartData = [
    { name: "Slow (2 mph)", calories: Math.round(((2.8 * 3.5 * weightKg) / 200) * durationMins), fill: "#94a3b8" },
    { name: "Moderate (3 mph)", calories: Math.round(((3.5 * 3.5 * weightKg) / 200) * durationMins), fill: "#94a3b8" },
    { name: "Your Walk", calories: caloriesBurned, fill: "#3b82f6" },
    { name: "Power Walk (4.5 mph)", calories: Math.round(((6.3 * 3.5 * weightKg) / 200) * durationMins), fill: "#94a3b8" },
    { name: "Running (6 mph)", calories: Math.round(((9.8 * 3.5 * weightKg) / 200) * durationMins), fill: "#e2e8f0" },
  ];

  // Sort logically by intensity (but we'll just sort by calories to ensure a clean visual step up)
  chartData.sort((a, b) => a.calories - b.calories);

  const summaryStats = [
    { label: "Average Speed", value: `${speedMph.toFixed(1)} mph` },
    { label: "Average Pace", value: paceStr },
    { label: "Intensity (METs)", value: met.toFixed(1) },
    { label: "Burn Rate", value: `${caloriesPerHour} kcal/hr` },
  ];

  return { caloriesBurned, caloriesPerHour, metValue: met, timeMins: durationMins, paceStr, chartData, summaryStats };
}

export default function CaloriesBurnedWalking() {
  const [weight, setWeight] = useState("160");
  const [distance, setDistance] = useState("3");
  const [duration, setDuration] = useState("60");
  const [incline, setIncline] = useState("flat");
  const [terrain, setTerrain] = useState("paved");

  const [result, setResult] = useState<WalkingResult | null>(null);

  const calculate = () => {
    const w = parseInt(weight), dist = parseFloat(distance), dur = parseInt(duration);
    if (w > 0 && dist > 0 && dur > 0) {
      setResult(calcWalking(w, dist, dur, incline, terrain));
    }
  };

  useEffect(() => { setResult(calcWalking(160, 3, 60, "flat", "paved")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Does walking burn as many calories as running?", answer: "Yes and no. Per mile covered, walking and running actually burn a surprisingly similar amount of calories. This is because you are moving the exact same mass across the exact same distance. However, running burns those calories significantly faster (per minute). A 160lb person might burn 110 calories walking a mile in 20 minutes, or 130 calories running a mile in 10 minutes. Running is just more time-efficient." },
    { question: "Why does an incline make such a massive difference?", answer: "Walking on a perfectly flat surface relies heavily on forward momentum. When you add a steep incline (like setting a treadmill to 10% or hiking up a mountain), you completely remove that momentum and force your leg muscles to repeatedly lift your entire body weight straight up against gravity. Walking on a steep incline can easily double your caloric burn per minute, turning a casual stroll into a brutal cardiovascular workout." },
    { question: "Does walking in sand really burn more calories?", answer: "Yes, significantly more. When you walk on paved ground, the hard surface returns kinetic energy to your foot with every step. Sand is a soft, shifting surface that completely absorbs kinetic energy. It provides zero mechanical return, forcing the stabilizing muscles in your calves, ankles, and thighs to work roughly 50% harder just to push off. Walking in soft sand or deep snow drastically increases your METs (Metabolic Equivalent of Task)." },
    { question: "How accurate is this calculator compared to my Apple Watch?", answer: "This calculator uses the clinical METs (Metabolic Equivalent) formula, which is based on laboratory tests of oxygen consumption for specific speeds, weights, and grades. Smartwatches rely on optical heart rate sensors. While useful, heart rate sensors can be severely thrown off by heat, caffeine, or poor wrist contact, sometimes overestimating calorie burn by up to 30%. The MET formula is generally considered the scientific gold standard for dietary planning." },
    { question: "What is officially considered a 'Brisk' pace?", answer: "A brisk walk is clinically defined as 3.5 to 4.0 miles per hour (which equates to a 15 to 17 minute mile). At this pace, you should be breathing noticeably heavier but still able to speak in full sentences. Power walking usually starts above 4.5 mph and requires significant arm pumping." },
    { question: "Can I lose weight just by walking?", answer: "Absolutely. In fact, many bodybuilders rely entirely on walking (specifically incline walking) rather than running to get lean. Walking burns a high percentage of fat, causes virtually zero joint damage, and does not spike cortisol levels or increase hunger the way high-intensity interval training (HIIT) often does." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Calories Burned Walking Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Calories Burned Walking Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">lbs</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Distance Walked</label>
                <div className={inp}><input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">miles</span></div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Total Duration</label>
              <div className={inp}><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mins</span></div>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Difficulty Modifiers</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Incline / Grade</label>
                  <select value={incline} onChange={e => setIncline(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                    <option value="flat">Flat (0%)</option>
                    <option value="slight">Slight Incline (1-3%)</option>
                    <option value="moderate">Moderate Hill (4-6%)</option>
                    <option value="steep">Steep Hill (7-10%+)</option>
                    <option value="stairs">Climbing Stairs</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Terrain Surface</label>
                  <select value={terrain} onChange={e => setTerrain(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                    <option value="paved">Paved / Treadmill</option>
                    <option value="trail">Dirt Trail / Grass</option>
                    <option value="sand">Soft Sand</option>
                    <option value="snow">Deep Snow</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setWeight("160"); setDistance("3"); setDuration("60"); setIncline("flat"); setTerrain("paved"); setResult(calcWalking(160, 3, 60, "flat", "paved")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Energy Expended</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{result.caloriesBurned}</div>
                  <div className="text-xl font-semibold text-muted-foreground">kcal</div>
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                  Burned over a <span className="font-bold text-foreground">{distance} mile</span> walk taking <span className="font-bold text-foreground">{duration} minutes</span>.
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 && i !== 2 ? "border-l border-border" : ""} ${(i === 2 || i === 3) ? "border-t md:border-t-0 border-border" : ""} ${i === 2 ? "md:border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm font-bold text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Burn Comparison (for a {duration}-min session)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} kcal`, "Burn"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Comparing your specific walk parameters against standard fitness benchmarks.</p>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Hidden Power of Walking for Sustainable Fat Loss</h2>
            <p>In the fitness industry, walking is often dismissed in favor of high-intensity interval training (HIIT), heavy weightlifting, or grueling marathons. However, from a physiological perspective, walking is one of the absolute most powerful tools for sustainable fat loss. Why? Because it allows you to burn a significant amount of calories with an exceptionally low impact on your joints and virtually zero stress on your Central Nervous System (CNS).</p>
            <p>This <strong>Calories Burned Walking Calculator</strong> bypasses generic estimates and utilizes clinical MET (Metabolic Equivalent of Task) formulas to precisely calculate your exact energy expenditure. By factoring in your body weight, your exact walking speed, the incline grade of your path, and the terrain you are walking on, it provides laboratory-grade data for your nutritional planning.</p>

            <h2>Understanding the "Fat Burning Zone"</h2>
            <p>You may have heard the term "fat-burning zone" and wondered if it is a myth. It is rooted in very real biology. When you exercise at a high intensity (like sprinting or heavy weightlifting), your body needs energy instantly. To get that energy, it burns stored carbohydrates (glycogen) because they can be broken down rapidly.</p>
            <p>However, when you exercise at a low intensity (like walking), your body has plenty of time to process energy. Instead of burning precious glycogen, it oxidizes stored body fat to fuel the movement. Therefore, while high-intensity exercise burns more <em>total</em> calories per minute, walking burns a significantly higher <em>percentage</em> of its calories directly from body fat.</p>

            <h2>The "Incline Hack" (LISS Cardio)</h2>
            <p>If you want to burn calories like a runner but absolutely despise running (or suffer from knee pain), there is a simple biomechanical hack: use an incline. This is often referred to as LISS (Low-Intensity Steady State) cardio.</p>
            <p>Walking on a perfectly flat surface relies heavily on forward momentum. You take a step, and momentum carries you forward into the next step. When you add a steep incline (such as setting a treadmill to a 10% or 12% grade, or hiking up a steep hill), you completely remove that momentum.</p>
            <p>Suddenly, every single step forces your quadriceps, hamstrings, and glutes to lift your entire body weight straight up against gravity. Walking on a steep incline can easily double your caloric expenditure per minute, turning a casual 3.0 mph stroll into an intense cardiovascular workout that burns as many calories as jogging—all while keeping your heart rate in the fat-burning zone and protecting your joints from impact trauma.</p>

            <h2>How Body Weight Alters Caloric Burn</h2>
            <p>The laws of physics dictate that it takes more energy to move a larger mass across a set distance than a smaller mass. Because of this, body weight is the single most important variable in the MET calorie equation.</p>
            <p>If a 140 lb person and a 220 lb person both walk side-by-side at a brisk 3.5 mph pace for one hour, the 220 lb person will burn drastically more calories. Their cardiovascular system has to pump harder, and their leg muscles must generate significantly more force to move the additional 80 lbs. This is why walking is so highly recommended for obese individuals beginning a weight loss journey: the built-in "weight vest" of their own body mass ensures they burn massive amounts of calories without needing to run.</p>

            <h2>The Terrain Multiplier: Why Sand is Exhausting</h2>
            <p>Have you ever tried to run on a dry beach and found yourself exhausted within minutes? This is due to mechanical energy return.</p>
            <p>When you walk on a hard, paved surface like concrete or an asphalt track, the ground is completely unyielding. It returns almost all of the kinetic energy back into your foot, helping propel you into the next stride. Your body acts like a spring.</p>
            <p>When you walk on soft sand, deep mud, or heavy snow, the surface shifts beneath your feet. It absorbs all of your kinetic energy and returns zero. To take the next step, your calves, ankles, and stabilizing muscles must work up to 50% harder just to push off. Walking in soft sand drastically increases your METs, converting a simple beach walk into a high-level resistance workout for your lower body.</p>

            <h2>Walking vs. Running: The Calorie Debate</h2>
            <p>A common misconception is that running a mile burns wildly more calories than walking a mile. Physiologically, this is false. Per mile covered, walking and running actually burn a surprisingly similar amount of total energy, because you are ultimately moving the exact same mass across the exact same distance.</p>
            <p>The difference lies entirely in <strong>time efficiency</strong>. A 180lb man might burn 125 calories walking a mile in 20 minutes, whereas he would burn roughly 150 calories running that same mile in 8 minutes. Running doesn't burn magically different calories; it simply allows you to burn the required calories in less than half the time. If you have the time to walk, it is just as effective for creating a daily caloric deficit.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calories-burned-walking" />
          <PopularCalculators exclude="/calculator/calories-burned-walking" />
        </div>
      </div>
    </>
  );
}
