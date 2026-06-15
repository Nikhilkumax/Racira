"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Timer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface TimingResult {
  preWorkoutTime: string;
  preWorkoutMacros: string;
  intraWorkout: string;
  postWorkoutTime: string;
  postWorkoutMacros: string;
  dailyGoal: string;
  recommendation: string;
  schedule: { time: string; action: string; details: string }[];
  chartData: { name: string; carbs: number; protein: number }[];
  summaryStats: { label: string; value: string }[];
}

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(hours, 10));
  d.setMinutes(parseInt(minutes, 10));
  d.setSeconds(0);
  return d;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calcTiming(
  workoutTimeStr: string, durationMins: number, workoutType: string, goal: string
): TimingResult {
  const workoutStart = parseTime(workoutTimeStr);
  const workoutEnd = new Date(workoutStart.getTime() + durationMins * 60000);

  // Pre-workout (2 hours before for solid meal, 45 mins before for snack)
  const preMealTime = new Date(workoutStart.getTime() - 120 * 60000);
  const preSnackTime = new Date(workoutStart.getTime() - 45 * 60000);
  
  // Post-workout (within 45 mins)
  const postMealTime = new Date(workoutEnd.getTime() + 45 * 60000);

  let preWorkoutMacros = "";
  let intraWorkout = "Water only (unless training exceeds 90 minutes)";
  let postWorkoutMacros = "";
  let dailyGoal = "";
  let recommendation = "";
  
  let preCarbs = 0, preProtein = 0, postCarbs = 0, postProtein = 0;

  if (workoutType === "hypertrophy") {
    preCarbs = 40; preProtein = 25;
    postCarbs = 50; postProtein = 35;
    preWorkoutMacros = "30-40g Complex Carbs + 20-30g Protein (Low Fat)";
    postWorkoutMacros = "40-60g Fast-digesting Carbs + 30-40g Whey Protein";
    if (durationMins > 60) intraWorkout = "Water + 10g EAAs or BCAA (Optional)";
    recommendation = "For muscle growth, protein synthesis must be maximized. The post-workout 'anabolic window' is longer than once thought, but getting fast carbs and protein within 1 hour still optimizes glycogen replenishment and aggressively stops muscle catabolism.";
  } else if (workoutType === "endurance") {
    preCarbs = 70; preProtein = 15;
    postCarbs = 75; postProtein = 20;
    preWorkoutMacros = "50-80g Complex Carbs + 10-15g Protein (Very Low Fat/Fiber)";
    postWorkoutMacros = "60-80g Carbs + 20g Protein (Ratio 3:1 or 4:1 Carbs to Protein)";
    if (durationMins > 60) intraWorkout = "Water + 30-60g Carbs per hour (Sports drink/gels) + Electrolytes";
    recommendation = "Endurance athletes drain glycogen stores heavily. High carb intake before, during (if >60m), and immediately after is critical for performance and recovery. Keep pre-workout fat and fiber very low to prevent gastrointestinal distress.";
  } else if (workoutType === "strength") {
    preCarbs = 45; preProtein = 25;
    postCarbs = 35; postProtein = 35;
    preWorkoutMacros = "30-50g Carbs + 20-30g Protein";
    postWorkoutMacros = "30-40g Carbs + 30-40g Protein";
    intraWorkout = "Water + Electrolytes (Sodium/Potassium)";
    recommendation = "Pure strength training (CNS adaptation) depletes less glycogen than hypertrophy or endurance training. Focus on adequate daily protein and sufficient pre-workout carbs to power heavy Central Nervous System output.";
  } else if (workoutType === "fatloss") {
    preCarbs = 15; preProtein = 25;
    postCarbs = 25; postProtein = 35;
    preWorkoutMacros = "15-20g Carbs + 20-30g Protein (or fasted if preferred)";
    postWorkoutMacros = "20-30g Carbs + 30-40g Protein";
    intraWorkout = "Water only";
    recommendation = "If fat loss is the goal, you don't need massive carb intakes around your workout. Total daily calorie deficit matters most. Some prefer fasted cardio for fat loss, but for weight lifting, a small protein/carb meal beforehand prevents muscle breakdown.";
  }

  const schedule = [
    { time: formatTime(preMealTime), action: "Pre-Workout Meal (Optional)", details: "If you prefer solid food, eat 2 hours before. " + preWorkoutMacros.split('+')[0] },
    { time: formatTime(preSnackTime), action: "Pre-Workout Snack", details: "If you skip the meal, have a quick digesting snack 45 mins prior. " + preWorkoutMacros },
    { time: formatTime(workoutStart), action: "Workout Starts", details: `Training type: ${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)}` },
    { time: formatTime(workoutEnd), action: "Workout Ends", details: intraWorkout !== "Water only" ? `Intra-workout: ${intraWorkout}` : "Hydrate" },
    { time: formatTime(postMealTime), action: "Post-Workout Meal/Shake", details: postWorkoutMacros },
  ];

  const chartData = [
    { name: "Pre-Workout", carbs: preCarbs, protein: preProtein },
    { name: "Post-Workout", carbs: postCarbs, protein: postProtein },
  ];

  const summaryStats = [
    { label: "Pre-Workout Carbs", value: `~${preCarbs}g` },
    { label: "Post-Workout Carbs", value: `~${postCarbs}g` },
    { label: "Pre-Workout Protein", value: `~${preProtein}g` },
    { label: "Post-Workout Protein", value: `~${postProtein}g` },
  ];

  return {
    preWorkoutTime: formatTime(preSnackTime),
    preWorkoutMacros,
    intraWorkout,
    postWorkoutTime: formatTime(postMealTime),
    postWorkoutMacros,
    dailyGoal: goal.replace("_", " ").toUpperCase(),
    recommendation,
    schedule,
    chartData,
    summaryStats
  };
}

export default function NutrientTimingCalculator() {
  const [workoutTime, setWorkoutTime] = useState("17:00");
  const [duration, setDuration] = useState("60");
  const [workoutType, setWorkoutType] = useState("hypertrophy");
  const [goal, setGoal] = useState("muscle_gain");
  const [result, setResult] = useState<TimingResult | null>(null);

  const calculate = () => {
    setResult(calcTiming(workoutTime, parseInt(duration) || 60, workoutType, goal));
  };

  useEffect(() => { setResult(calcTiming("17:00", 60, "hypertrophy", "muscle_gain")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Is the 'anabolic window' real?", answer: "Yes and no. The idea that you must aggressively consume protein within exactly 30 minutes of lifting or you 'lose all your gains' is a myth. Muscle protein synthesis remains elevated for 24-48 hours after resistance training. However, consuming protein and fast-digesting carbohydrates within 1-2 hours post-workout IS optimal for rapidly stopping muscle breakdown (catabolism) and jumpstarting the recovery process, especially if you trained in a fasted or semi-fasted state." },
    { question: "What should I eat before a workout?", answer: "It depends entirely on the timing. If you are eating 2-3 hours before your session, a balanced solid meal of complex carbs (oats, brown rice), lean protein (chicken, whey), and a little fat is ideal. If you are eating 30-45 minutes before, you must avoid fats and fiber entirely, as they significantly slow down gastric emptying. Stick to fast-digesting, low-fiber foods (like a banana, rice cakes, or a liquid protein shake) to prevent debilitating stomach cramps during heavy training." },
    { question: "Should I work out fasted for fat loss?", answer: "Fasted cardio can slightly increase the percentage of calories burned from fat during the actual session, but long-term clinical studies show it does not lead to greater overall body fat loss over a 24-hour period compared to fed cardio. Total caloric deficit dictates fat loss. For resistance training, working out completely fasted is usually suboptimal because it decreases your performance output and increases muscle catabolism. A small pre-workout protein shake is highly recommended." },
    { question: "Do I need intra-workout carbs or BCAAs?", answer: "For most people doing standard 45-60 minute gym sessions, plain water is perfectly fine. However, if you are doing intense endurance training (running, cycling, swimming) lasting longer than 60-90 minutes, or high-volume bodybuilding sessions pushing past 90 minutes, intra-workout carbohydrates (30-60g/hour) and electrolytes are clinically proven to maintain performance output and delay systemic fatigue." },
    { question: "Why do endurance athletes need a 3:1 carb to protein ratio?", answer: "Endurance training heavily depletes muscle glycogen (stored carbohydrates). Consuming carbohydrates with a small amount of protein (typically a 3:1 or 4:1 ratio) has been shown to increase glycogen resynthesis rates significantly faster than consuming carbohydrates alone. The addition of protein stimulates a greater insulin response from the pancreas, which acts as a shuttle, pulling the carbohydrates into the muscle cells more efficiently." },
    { question: "When should I eat dietary fat?", answer: "Dietary fat slows down the digestion of an entire meal. Therefore, you should actively avoid fat in your pre-workout snack and your immediate post-workout meal. You want those nutrients entering your bloodstream as fast as possible. Save your dietary fats (avocado, nuts, olive oil) for meals that are physically distant from your training window, such as breakfast (if you train at night) or dinner (if you train in the morning)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Nutrient Timing Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Nutrient Timing Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Workout Start Time</label>
                <div className={inp}><input type="time" value={workoutTime} onChange={e => setWorkoutTime(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration</label>
                <div className={inp}><input type="number" step="15" value={duration} onChange={e => setDuration(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mins</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Workout Modality</label>
              <select value={workoutType} onChange={e => setWorkoutType(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                <option value="hypertrophy">Bodybuilding / Hypertrophy</option>
                <option value="strength">Powerlifting / Strength</option>
                <option value="endurance">Endurance (Running, Cycling)</option>
                <option value="fatloss">HIIT / Cardio for Fat Loss</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Primary Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                <option value="muscle_gain">Maximize Muscle Gain</option>
                <option value="fat_loss">Maximize Fat Loss</option>
                <option value="performance">Athletic Performance / Speed</option>
              </select>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Generate Schedule
              </button>
              <button onClick={() => { setWorkoutTime("17:00"); setDuration("60"); setWorkoutType("hypertrophy"); setGoal("muscle_gain"); setResult(calcTiming("17:00", 60, "hypertrophy", "muscle_gain")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Protocol Generated</div>
                <div className="text-2xl font-extrabold text-foreground tracking-tight mb-2">{workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Nutrition Plan</div>
                <div className="text-sm text-foreground font-medium leading-relaxed">{result.recommendation}</div>
              </div>
              
              <div className="card-calculator !p-0 border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/50 border-b border-border font-bold flex items-center gap-2 text-base">
                  <Timer className="w-5 h-5 text-primary" /> Peri-Workout Schedule
                </div>
                <div className="flex flex-col">
                  {result.schedule.map((item, index) => (
                    <div key={index} className={`flex flex-col sm:flex-row border-b border-border/50 last:border-0 p-4 ${item.action.includes('Starts') || item.action.includes('Ends') ? 'bg-secondary/30' : ''}`}>
                      <div className="w-full sm:w-28 font-bold text-primary shrink-0 mb-1 sm:mb-0 text-base mt-0.5">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-foreground mb-1 text-base">{item.action}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">{item.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                <h3 className="text-base font-bold mb-4">Peri-Workout Macro Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="carbs" name="Carbohydrates (g)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="protein" name="Protein (g)" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Macro Targets Overview</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Science of Nutrient Timing</h2>
            <p>In the hierarchy of sports nutrition, total daily calorie intake and total daily macronutrient targets are the undisputed king and queen. If you are not eating enough protein over a 24-hour period, or if you are not in a caloric deficit, no amount of precise meal timing will save your physique. However, once those foundational elements are dialed in, <strong>Nutrient Timing</strong> becomes the crucial final layer for optimizing physical performance, delaying systemic fatigue, and maximizing muscular recovery.</p>
            <p>Nutrient timing specifically refers to the strategic manipulation of macronutrients (primarily carbohydrates and protein) directly around your training window. This period is scientifically referred to as the "Peri-Workout Window," which encompasses your pre-workout, intra-workout, and post-workout nutrition.</p>

            <h2>Pre-Workout Nutrition: The Fueling Phase</h2>
            <p>The primary goal of the pre-workout meal is to top off muscle glycogen stores (your body's preferred fuel source for high-intensity exercise) and provide circulating amino acids to prevent muscle breakdown during training.</p>
            <p>The composition of this meal depends entirely on <em>when</em> you eat it.</p>
            <h3>Eating 2 to 3 Hours Before Training</h3>
            <p>If you have a large buffer of time before hitting the gym, you should consume a full, solid meal. This meal should consist of complex, slow-digesting carbohydrates (like oats, brown rice, or sweet potatoes) and a solid source of lean protein (chicken breast, lean beef). Because you have hours to digest, a moderate amount of dietary fat and fiber is perfectly acceptable here.</p>
            <h3>Eating 30 to 45 Minutes Before Training</h3>
            <p>If you are eating a quick snack right before you train, the rules change drastically. You must actively <strong>avoid dietary fat and fiber</strong>. Fat and fiber physically slow down gastric emptying. If you eat a high-fat snack right before training, the food will literally sit in your stomach while you lift, pulling blood flow away from your working muscles and causing severe stomach cramps. Stick to fast-digesting carbohydrates (like rice cakes, a banana, or Gatorade) and a liquid protein source (like whey isolate) that will clear your stomach rapidly.</p>

            <h2>Intra-Workout Nutrition: Delaying Fatigue</h2>
            <p>Do you need to drink a neon-colored sports drink while you lift weights? For the vast majority of people doing standard 45-to-60-minute gym sessions, the answer is no. Plain water is perfectly fine, and you have enough stored glycogen to power through the session.</p>
            <p>However, intra-workout nutrition becomes absolutely critical in two specific scenarios:</p>
            <ol>
              <li><strong>Endurance Athletes:</strong> If you are running, cycling, or swimming at high intensities for longer than 60-90 minutes, your muscle glycogen stores will deplete. Consuming 30 to 60 grams of easily digestible liquid carbohydrates per hour, along with sodium and potassium, is proven to maintain power output and delay the "bonk."</li>
              <li><strong>High-Volume Bodybuilders:</strong> If you are undergoing grueling, high-volume hypertrophy sessions lasting 90 to 120 minutes, sipping on highly branched cyclic dextrin (a fast carb) and essential amino acids (EAAs) can prevent excessive muscle catabolism late in the workout.</li>
            </ol>

            <h2>Post-Workout Nutrition: The Recovery Phase</h2>
            <p>The post-workout period is famous for the "Anabolic Window." For decades, gym-goers believed that if they didn't consume protein within exactly 30 minutes of finishing their last set, they would lose all their gains. We now know this is a myth. Muscle protein synthesis remains elevated for 24 to 48 hours after resistance training.</p>
            <p>However, that does not mean post-workout timing is irrelevant. Consuming protein and fast-digesting carbohydrates within 1 to 2 hours of finishing your workout is highly optimal. Why? Because intense training puts your body in a catabolic (muscle-breakdown) state. The rapid influx of carbohydrates spikes insulin, which aggressively halts the catabolic process and begins shuttling the protein directly into the damaged muscle cells to jumpstart the repair process.</p>

            <h3>The 3:1 Carbohydrate to Protein Ratio</h3>
            <p>For endurance athletes who train multiple times a day or have back-to-back events, rapidly replenishing glycogen is their highest priority. Clinical studies have shown that consuming carbohydrates with a small amount of protein (typically a 3:1 or 4:1 ratio) increases glycogen resynthesis rates significantly faster than consuming carbohydrates alone. The protein acts as an amplifier for the insulin response, pulling the carbs into the muscle cells more efficiently.</p>

            <h2>What About Training Fasted?</h2>
            <p>Training completely fasted (e.g., waking up and immediately running or lifting weights) is a popular trend, particularly for fat loss. Fasted cardio can slightly increase the percentage of calories burned directly from fat <em>during</em> the actual session. However, long-term clinical studies show it does not lead to greater overall body fat loss over a 24-hour period compared to fed cardio. Total caloric deficit dictates fat loss.</p>
            <p>For resistance training (lifting weights), working out completely fasted is almost always suboptimal. Lifting weights requires high neural drive and glycogen. Doing it fasted noticeably decreases your performance output and increases muscle catabolism. If you must train first thing in the morning, consuming a small, fast-digesting protein shake (20g of whey) before you lift is highly recommended to protect your muscle tissue without causing stomach upset.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/nutrient-timing-calculator" />
          <PopularCalculators exclude="/calculator/nutrient-timing-calculator" />
        </div>
      </div>
    </>
  );
}
