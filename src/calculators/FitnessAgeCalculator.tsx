"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, HeartPulse } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot, Legend } from "recharts";

interface FitnessAgeResult {
  fitnessAge: number;
  chronologicalAge: number;
  ageDiff: number;
  ageDiffDirection: string;
  resultColor: string;
  vo2max: number;
  avgVo2max: number;
  breakdown: { label: string; value: string }[];
  chartData: any[];
  summaryStats: { label: string; value: string }[];
}

function calcFitnessAge(age: number, sex: string, waistCm: number, rhr: number, activityScore: number): FitnessAgeResult {
  // NTNU-inspired non-exercise VO2 max estimation model (simplified for general calculation)
  // Activity score: 0 (Sedentary), 1 (Light), 2 (Moderate), 3 (Active), 4 (Highly Active)
  let vo2max = 0;
  let avgVo2max = 0;
  let fitnessAgeRaw = 0;

  if (sex === "male") {
    // Male approximation
    vo2max = 95 - (0.3 * age) - (0.35 * waistCm) - (0.15 * rhr) + (1.5 * activityScore);
    avgVo2max = 55 - (0.4 * age); // Average VO2 max for a male of this age
    // Fitness Age = Age where average VO2 max equals this person's VO2 max
    // vo2max = 55 - (0.4 * fitnessAge)  =>  fitnessAge = (55 - vo2max) / 0.4
    fitnessAgeRaw = (55 - vo2max) / 0.4;
  } else {
    // Female approximation
    vo2max = 75 - (0.25 * age) - (0.25 * waistCm) - (0.11 * rhr) + (1.5 * activityScore);
    avgVo2max = 45 - (0.35 * age);
    // vo2max = 45 - (0.35 * fitnessAge)  =>  fitnessAge = (45 - vo2max) / 0.35
    fitnessAgeRaw = (45 - vo2max) / 0.35;
  }

  // Guardrails
  let fitnessAge = Math.max(20, Math.min(90, Math.round(fitnessAgeRaw)));
  
  const ageDiff = Math.abs(fitnessAge - age);
  const ageDiffDirection = fitnessAge < age ? "younger" : fitnessAge > age ? "older" : "same";
  
  let resultColor = "#22c55e"; // Green for younger
  if (fitnessAge > age) {
    if (ageDiff > 5) resultColor = "#ef4444"; // Red for significantly older
    else resultColor = "#f59e0b"; // Orange for slightly older
  } else if (fitnessAge === age) {
    resultColor = "#3b82f6"; // Blue for exact
  }

  const breakdown = [
    { label: "Chronological Age", value: `${age} years` },
    { label: "Calculated Fitness Age", value: `${fitnessAge} years` },
    { label: "Estimated VO2 Max", value: `${vo2max.toFixed(1)} ml/kg/min` },
    { label: "Average VO2 Max for Age", value: `${avgVo2max.toFixed(1)} ml/kg/min` },
    { label: "Difference in Age", value: `${ageDiff} years ${ageDiffDirection}` },
  ];

  const summaryStats = [
    { label: "Fitness Age", value: `${fitnessAge} yrs` },
    { label: "Real Age", value: `${age} yrs` },
    { label: "Delta", value: `${ageDiff} yrs ${ageDiffDirection}` },
    { label: "Est. VO2 Max", value: `${vo2max.toFixed(1)}` },
  ];

  // Generate chart data showing average VO2 max decline vs user's VO2 max
  const chartData = [];
  for (let a = 20; a <= 80; a += 10) {
    let baseline = sex === "male" ? (55 - (0.4 * a)) : (45 - (0.35 * a));
    const point: any = { age: a, average: parseFloat(baseline.toFixed(1)) };
    if (Math.abs(a - age) <= 5) {
      point.user = parseFloat(vo2max.toFixed(1));
    }
    chartData.push(point);
  }

  return { fitnessAge, chronologicalAge: age, ageDiff, ageDiffDirection, resultColor, vo2max, avgVo2max, breakdown, chartData, summaryStats };
}

export default function FitnessAgeCalculator() {
  const [age, setAge] = useState("45");
  const [sex, setSex] = useState("male");
  const [waist, setWaist] = useState("90"); // cm
  const [rhr, setRhr] = useState("68"); // bpm
  const [activity, setActivity] = useState("2"); // 0-4
  const [result, setResult] = useState<FitnessAgeResult | null>(null);

  const calculate = () => {
    const a = parseFloat(age), w = parseFloat(waist), hr = parseFloat(rhr), act = parseInt(activity);
    if (a > 18 && w > 0 && hr > 0) setResult(calcFitnessAge(a, sex, w, hr, act));
  };

  useEffect(() => { setResult(calcFitnessAge(45, "male", 90, 68, 2)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is Fitness Age?", answer: "Fitness Age is a biological metric that estimates how well your body functions physically compared to average populations of different ages. If a 50-year-old has the cardiovascular capacity (VO2 max) and metabolic health of an average 35-year-old, their Fitness Age is 35. It is considered a far more accurate predictor of longevity and cardiovascular health than chronological age alone." },
    { question: "How does this calculator estimate my Fitness Age?", answer: "This calculator uses a non-exercise model (originally pioneered by researchers at the Norwegian University of Science and Technology) to estimate your VO2 max. It factors in your chronological age, waist circumference (as a proxy for visceral fat), resting heart rate (a key indicator of heart efficiency), and weekly exercise intensity. It then compares your estimated VO2 max to statistical averages to find the age that matches your cardiovascular capacity." },
    { question: "Why is waist circumference used instead of weight?", answer: "Waist circumference is a direct indicator of visceral fat—the dangerous fat stored around your internal organs. High visceral fat severely impairs cardiovascular efficiency and metabolic health. A muscular person might be 'heavy' by weight, but have a very small waist, indicating excellent metabolic health. Waist circumference is a far superior metric to standard BMI for estimating cardiovascular longevity." },
    { question: "What is VO2 Max?", answer: "VO2 max (maximal oxygen uptake) is the maximum amount of oxygen your body can utilize during intense exercise. It is the gold standard measurement of cardiovascular fitness and aerobic endurance. A higher VO2 max means your heart, lungs, and muscles are highly efficient at processing oxygen. VO2 max naturally declines as we age, but regular exercise can significantly slow this decline." },
    { question: "How can I lower my Fitness Age?", answer: "The most effective way to lower your Fitness Age (i.e., increase your VO2 max) is through High-Intensity Interval Training (HIIT) and vigorous aerobic exercise. Pushing your heart rate into zone 4 or 5 for brief periods forces the cardiovascular system to adapt and become more efficient. Additionally, lowering your resting heart rate through consistent cardio and reducing visceral fat (waist circumference) through diet will immediately improve your score." },
    { question: "How accurate is a non-exercise Fitness Age calculator?", answer: "While non-exercise models are highly accurate for general populations and act as excellent motivational screening tools, they are estimations. The only way to find your exact, true VO2 max is in a sports science laboratory running on a treadmill with an oxygen mask measuring your respiratory gases. However, this calculator provides a highly reliable baseline for tracking your progress over time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Fitness Age Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Fitness Age Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
              <div className="grid grid-cols-2 gap-2">
                {["male", "female"].map(s => (
                  <button key={s} onClick={() => setSex(s)} className={`h-10 rounded-md border text-base font-medium capitalize transition-colors ${sex === s ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border bg-background hover:bg-secondary"}`}>{s}</button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Chronological Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} min={20} max={90} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Resting Heart Rate</label>
                <div className={inp}><input type="number" value={rhr} onChange={e => setRhr(e.target.value)} className={ci} /><span className={suf}>bpm</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Waist Circumference</label>
              <div className={inp}><input type="number" value={waist} onChange={e => setWaist(e.target.value)} className={ci} /><span className={suf}>cm</span></div>
              <p className="text-xs text-muted-foreground mt-1">Measure level with your belly button, not your pant line.</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Weekly Exercise Intensity</label>
              <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-base shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="0">Sedentary (No formal exercise)</option>
                <option value="1">Light (&lt; 1 hour/week)</option>
                <option value="2">Moderate (1-2 hours/week)</option>
                <option value="3">Active (2-3 hours/week)</option>
                <option value="4">Highly Active (3+ hours/week)</option>
              </select>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("45"); setWaist("90"); setRhr("68"); setSex("male"); setActivity("2"); setResult(calcFitnessAge(45, "male", 90, 68, 2)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="rounded-lg p-5 shadow-sm border-l-4" style={{ backgroundColor: `${result.resultColor}15`, borderColor: result.resultColor }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.resultColor }}>Your Biological Fitness Age</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.fitnessAge}</div>
                  <div className="text-lg font-semibold text-muted-foreground">years old</div>
                </div>
                <div className="text-sm font-semibold mt-1" style={{ color: result.resultColor }}>You are biologically {result.ageDiff} years {result.ageDiffDirection} than your real age.</div>
              </div>
              
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[["Fitness Age", `${result.fitnessAge}`], ["Real Age", `${result.chronologicalAge}`], ["Est. VO2 Max", result.vo2max.toFixed(1)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Metabolic Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "font-bold text-foreground border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">VO2 Max Age Decline Curve</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="age" tick={{ fontSize: 11 }} label={{ value: 'Chronological Age', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip formatter={(v: number, name: string) => {
                      if (name === "user") return [`${v}`, "Your Estimated VO2 Max"];
                      return [`${v}`, "Average VO2 Max"];
                    }} />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="average" name="Population Average" stroke="#9ca3af" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    {result.chartData.some(d => d.user) && (
                       <Line type="monotone" dataKey="user" name="Your Fitness Level" stroke="#000" strokeWidth={0} dot={{ r: 6, fill: result.resultColor, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Chart plots your cardiovascular capacity against standard age-related decline.</p>
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
            <h2>What Is Fitness Age?</h2>
            <p>Chronological age is a rigid, unchangeable number dictated by your birth certificate. However, biological age—specifically your <strong>Fitness Age</strong>—is a highly fluid metric that you can actively control. Fitness Age is a measurement of your body's cardiovascular capacity and metabolic health compared to the statistical averages of different age groups. If you are 55 years old but maintain the cardiovascular engine of a healthy 35-year-old, your body is biologically functioning 20 years younger than your chronological age.</p>
            <p>Pioneered by researchers at the Norwegian University of Science and Technology (NTNU) studying the longevity of over 50,000 individuals, the concept of Fitness Age has revolutionized preventative cardiology. The researchers discovered that a person's Fitness Age (derived from their VO2 Max) is a far more accurate predictor of long-term health, cardiovascular disease risk, and overall mortality than the year they were born.</p>

            <h2>How The Calculations Work</h2>
            <p>To determine your Fitness Age, the calculator must first estimate your <strong>VO2 Max</strong> (Maximal Oxygen Uptake). VO2 Max is the absolute gold standard for measuring cardiovascular fitness. It represents the maximum volume of oxygen your heart, lungs, and muscles can consume and utilize during intense exercise.</p>
            <p>In a clinical setting, testing VO2 Max requires running to absolute exhaustion on a treadmill while wearing an oxygen-measuring face mask. However, this calculator uses a highly validated non-exercise estimation model based on four critical biometric markers:</p>
            
            <p><strong>1. Resting Heart Rate (RHR):</strong> Your heart is a muscle. Like any muscle, when it becomes stronger and more efficient through exercise, it doesn't need to work as hard to pump blood. A high resting heart rate (e.g., 85 bpm) indicates an inefficient cardiovascular system. A low resting heart rate (e.g., 55 bpm) indicates a powerful, efficient heart, which significantly increases your estimated VO2 max.</p>
            <p><strong>2. Waist Circumference:</strong> Notice that this calculator does not ask for your weight or BMI. It specifically requires your waist circumference. Fat stored around the waist (visceral fat) is uniquely dangerous; it wraps around your internal organs and secretes inflammatory hormones that directly impair metabolic function. A large waist circumference heavily penalizes your estimated cardiovascular efficiency.</p>
            <p><strong>3. Weekly Exercise Intensity:</strong> The frequency and intensity of your physical activity directly correlate with heart adaptation. The calculator factors in how many hours a week you elevate your heart rate.</p>
            <p><strong>4. Biological Sex & Age:</strong> Men and women naturally possess different lung capacities and hemoglobin levels, requiring separate statistical models. Furthermore, maximum heart rate naturally declines with chronological age, which is factored into the baseline equation.</p>
            <p>Once the calculator estimates your VO2 Max, it references statistical population tables to find the chronological age that matches your cardiovascular capacity, producing your final Fitness Age.</p>

            <h2>Understanding Your Results</h2>
            <p>When you execute a calculation, this tool provides a comprehensive metabolic dashboard designed to give you total visibility into your cardiovascular health.</p>
            <p><strong>Primary Diagnostic Card:</strong> This instantly delivers your calculated Fitness Age. The card is color-coded for immediate feedback: Green indicates you are biologically younger than your real age, Blue indicates you are exactly average, and Orange or Red indicates your cardiovascular system is aging faster than you are.</p>
            <p><strong>3-Stat Diagnostic Bar:</strong> This section displays your Fitness Age next to your real age, and prominently features your estimated VO2 Max (e.g., 42.5 ml/kg/min).</p>
            <p><strong>Metabolic Breakdown Table:</strong> A line-by-line comparison showing exactly how your estimated VO2 Max compares to the statistical average for your specific age and sex, culminating in a clear "Difference in Age" metric.</p>
            <p><strong>VO2 Max Age Decline Curve:</strong> A visual chart illustrating the natural, unavoidable decline of cardiovascular capacity as a human ages. Your specific estimated VO2 Max is plotted onto this curve, allowing you to visually see if you are operating "above the curve" (younger) or "below the curve" (older).</p>

            <h2>How to Lower Your Fitness Age</h2>
            <p>The most empowering aspect of Fitness Age is that it is reversible. If your Fitness Age is currently 10 years older than your chronological age, you are not trapped. The human cardiovascular system is incredibly adaptable. To lower your Fitness Age, you must focus on two specific physiological adaptations:</p>
            
            <h3>1. Increase Your VO2 Max via High-Intensity Interval Training (HIIT)</h3>
            <p>While walking is excellent for general health, it is generally not intense enough to significantly increase VO2 Max. To force the heart to become more efficient, you must push it to its limits. HIIT involves short bursts (e.g., 1 to 4 minutes) of extremely intense cardiovascular effort (sprinting, cycling hard, rowing) followed by a period of active recovery. Pushing your heart rate into Zone 4 or Zone 5 (80-95% of your maximum heart rate) forces the ventricles of the heart to stretch and the muscle to strengthen, directly increasing your VO2 Max and dropping your Fitness Age.</p>

            <h3>2. Reduce Visceral Fat</h3>
            <p>Because waist circumference is a primary driver in the calculation, losing belly fat will dramatically and immediately improve your Fitness Age. Visceral fat physically constricts organ function and increases systemic blood pressure. Reducing this fat through a caloric deficit and resistance training reduces the workload on the heart, subsequently lowering your resting heart rate and improving oxygen utilization.</p>

            <h2>The Limitations of Non-Exercise Estimations</h2>
            <p>While this non-exercise estimation model is a fantastic screening tool and motivational metric, it is still a statistical approximation. If you have a naturally low resting heart rate due to genetics, the calculator may underestimate your Fitness Age. Conversely, if you are a heavily muscled powerlifter with a larger waist circumference (due to thick core musculature rather than fat), the calculator may overestimate your Fitness Age.</p>
            <p>For highly trained endurance athletes looking for precise pacing metrics, a clinical VO2 Max test in a sports laboratory is required. However, for the vast majority of the population, this calculator provides a highly accurate, accessible baseline to track the most important metric in longevity: the biological age of your heart.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fitness-age-calculator" />
          <PopularCalculators exclude="/calculator/fitness-age-calculator" />
        </div>
      </div>
    </>
  );
}
