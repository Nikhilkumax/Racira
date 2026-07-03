"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface BodyTypeResult {
  type: string;
  description: string;
  traits: string[];
  trainingTips: string[];
  nutritionTips: string[];
  breakdown: { label: string; value: string }[];
  chartData: { trait: string; ecto: number; meso: number; endo: number }[];
  score: { ecto: number; meso: number; endo: number };
}

function calcBodyType(height: number, weight: number, wrist: number, sex: string): BodyTypeResult {
  const bmi = weight / ((height / 100) ** 2);

  // Frame size estimate from wrist circumference
  let frameScore = 0; // -1 = small, 0 = medium, 1 = large
  if (sex === "male") {
    if (wrist < 17) frameScore = -1;
    else if (wrist > 20) frameScore = 1;
  } else {
    if (wrist < 15) frameScore = -1;
    else if (wrist > 17) frameScore = 1;
  }

  // BMI based somatotype tendency
  const bmiFactor = bmi < 20 ? -1 : bmi < 25 ? 0 : 1;
  const totalScore = frameScore + bmiFactor;

  let type: string, description: string, traits: string[], trainingTips: string[], nutritionTips: string[];
  let score = { ecto: 0, meso: 0, endo: 0 };

  if (totalScore <= -1) {
    type = "Ectomorph"; 
    description = "Naturally lean, fast metabolism, difficulty gaining muscle mass.";
    traits = ["Long, lean limbs", "Narrow shoulders and hips", "Low body fat naturally", "Fast metabolism", "Difficulty gaining weight"];
    trainingTips = ["Focus on heavy compound lifts (squats, deadlifts, bench press)", "Keep cardio minimal (2–3x/week max)", "Train 3–4 days/week with heavy weights", "Adequate rest between sessions (48h)", "Progressive overload is essential"];
    nutritionTips = ["Caloric surplus of 300–500 kcal/day", "High carbohydrate intake (50–60% of calories)", "Protein: 1.6–2g/kg bodyweight", "Eat every 3–4 hours", "Add calorie-dense foods: nuts, avocado, olive oil"];
    score = { ecto: 75, meso: 15, endo: 10 };
  } else if (totalScore >= 1) {
    type = "Endomorph"; 
    description = "Naturally higher body fat, slower metabolism, gains both muscle and fat easily.";
    traits = ["Wider, rounder build", "Higher natural body fat", "Shorter, stockier limbs", "Slower metabolism", "Gains weight easily"];
    trainingTips = ["High-intensity training (HIIT) for fat burning", "Mix of strength and cardio (4–5x/week)", "Compound movements with moderate-to-high volume", "Circuit training works well", "Active recovery on rest days"];
    nutritionTips = ["Caloric deficit of 300–500 kcal/day if losing weight", "Moderate carbs (30–40% of calories)", "Higher protein: 2–2.5g/kg bodyweight", "Avoid processed sugars and refined carbs", "Prioritize fiber-rich vegetables"];
    score = { ecto: 10, meso: 20, endo: 70 };
  } else {
    type = "Mesomorph"; 
    description = "Athletic build, responds well to exercise, gains muscle and loses fat with relative ease.";
    traits = ["Athletic, symmetrical build", "Well-defined muscles", "Medium bone structure", "Efficient metabolism", "Responds well to training"];
    trainingTips = ["Balanced training: 4–5 days/week", "Mix of strength, hypertrophy, and cardio", "Varies workouts to avoid plateaus", "Can handle both high volume and high intensity", "Competition-ready with focused training"];
    nutritionTips = ["Maintenance calories with recomp possible", "Balanced macros: 40% carbs, 30% protein, 30% fat", "Protein: 1.8–2.2g/kg bodyweight", "Cycle carbs around workouts", "Moderate tracking is sufficient"];
    score = { ecto: 15, meso: 70, endo: 15 };
  }

  const breakdown = [
    { label: "Calculated Body Mass Index", value: bmi.toFixed(1) },
    { label: "Estimated Frame Size", value: frameScore < 0 ? "Small Frame" : frameScore > 0 ? "Large Frame" : "Medium Frame" },
    { label: "Metabolic Tendency", value: type === "Ectomorph" ? "Fast / High Energy" : type === "Endomorph" ? "Slow / Conserving" : "Efficient / Balanced" },
    { label: "Primary Fitness Challenge", value: type === "Ectomorph" ? "Gaining muscle mass" : type === "Endomorph" ? "Losing adipose tissue" : "Maintaining steady balance" },
  ];

  const chartData = [
    { trait: "Natural Leanness", ecto: 90, meso: 65, endo: 20 },
    { trait: "Muscle Hypertrophy", ecto: 35, meso: 80, endo: 60 },
    { trait: "Cardio Endurance", ecto: 70, meso: 65, endo: 40 },
    { trait: "Raw Strength", ecto: 40, meso: 80, endo: 75 },
  ];

  return { type, description, traits, trainingTips, nutritionTips, breakdown, chartData, score };
}

export default function BodyTypeCalculator() {
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [wrist, setWrist] = useState("17");
  const [sex, setSex] = useState("male");
  const [result, setResult] = useState<BodyTypeResult | null>(null);

  const calculate = () => {
    const h = parseFloat(height), w = parseFloat(weight), wr = parseFloat(wrist);
    if (h > 0 && w > 0 && wr > 0) setResult(calcBodyType(h, w, wr, sex));
  };

  useEffect(() => { setResult(calcBodyType(175, 70, 17, "male")); }, []);

  const TYPE_COLORS: Record<string, string> = { Ectomorph: "#3b82f6", Mesomorph: "#22c55e", Endomorph: "#f59e0b" };
  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What are the three main body types?", answer: "The three somatotypes, originally categorized by psychologist William Sheldon in the 1940s, are: Ectomorph (naturally lean, fast metabolism, difficult to gain weight), Mesomorph (athletic, muscular, responds quickly to exercise), and Endomorph (higher body fat, slower metabolism, gains weight easily). Most individuals are a blend of two types rather than a pure singular type." },
    { question: "How does this calculator determine my body type?", answer: "This calculator uses a combination of your Body Mass Index (BMI) and your wrist circumference. Your wrist circumference acts as a highly accurate proxy for your skeletal frame size (small, medium, or large bone structure). By combining your frame size with your current tissue mass (BMI), we can estimate your dominant genetic somatotype." },
    { question: "Can I change my body type?", answer: "Your somatotype represents your genetic baseline—your starting point—not your final destiny. While you cannot change your underlying bone structure, you can absolutely change your body composition through targeted training and nutrition. An endomorph can achieve a lean, shredded physique with disciplined dieting and cardio. An ectomorph can become heavily muscled through a consistent caloric surplus and heavy weightlifting." },
    { question: "What is the best diet for an Ectomorph?", answer: "Ectomorphs typically require a significant caloric surplus to gain muscle. Their diet should be rich in complex carbohydrates (making up 50–60% of daily calories) to fuel workouts and prevent their fast metabolism from burning muscle for energy. They should focus on calorie-dense foods like peanut butter, avocados, nuts, and olive oil to hit their caloric goals without feeling overly full." },
    { question: "What is the best workout for an Endomorph?", answer: "Endomorphs generally respond best to high-intensity interval training (HIIT) and metabolic conditioning. Because they tend to store fat easily, incorporating cardio 4 to 5 times a week is often necessary for fat loss. Weightlifting should feature compound movements with shorter rest periods (60 to 90 seconds) to keep the heart rate elevated during the entire session." },
    { question: "Is the somatotype theory scientifically proven?", answer: "Sheldon's original 1940s theory, which attempted to link body types to personality traits, has been entirely debunked by modern science. However, the physical classifications (ecto, meso, endo) remain widely used in exercise physiology and sports nutrition as a practical heuristic. It helps personal trainers quickly categorize a client's metabolic baseline and structure a highly customized program." },
    { question: "Why is wrist size used for frame size?", answer: "The wrist is one of the few areas on the human body where minimal fat is stored, making it a highly reliable indicator of sheer bone thickness. By measuring the wrist, we can determine if your skeleton is naturally built to carry large amounts of muscle mass (large frame/meso) or built for endurance and agility (small frame/ecto)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Body Type Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Body Type Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
                <label className="text-sm font-medium mb-1.5 block">Height</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /><span className={suf}>cm</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className={suf}>kg</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Wrist Circumference</label>
              <div className={inp}><input type="number" value={wrist} onChange={e => setWrist(e.target.value)} step={0.5} className={ci} /><span className={suf}>cm</span></div>
              <p className="text-xs text-muted-foreground mt-1">Measure firmly around the narrowest part of your wrist.</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setHeight("175"); setWeight("70"); setWrist("17"); setSex("male"); setResult(calcBodyType(175, 70, 17, "male")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="rounded-lg p-5 border-l-4" style={{ backgroundColor: `${TYPE_COLORS[result.type]}15`, borderColor: TYPE_COLORS[result.type] }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TYPE_COLORS[result.type] }}>Dominant Somatotype</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.type}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.description}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {(["Ectomorph", "Mesomorph", "Endomorph"] as const).map((t, i) => (
                  <div key={t} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${result.type === t ? "bg-primary/5" : ""}`}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TYPE_COLORS[t] }}>{t}</div>
                    <div className="text-lg font-bold">{result.score[t.toLowerCase() as "ecto" | "meso" | "endo"]}%</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Physiological Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Genetic Trait Scaling</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="trait" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => [`${v}/100`, "Potential"]} />
                    <Bar dataKey="ecto" name="Ectomorph" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="meso" name="Mesomorph" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="endo" name="Endomorph" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-3">Key Training Tips</h3>
                <ul className="space-y-1.5 mb-5">{result.trainingTips.map((t, i) => <li key={i} className="text-sm flex gap-2"><span style={{ color: TYPE_COLORS[result.type] }}>■</span>{t}</li>)}</ul>
                <h3 className="text-base font-bold mb-3">Nutrition Directives</h3>
                <ul className="space-y-1.5">{result.nutritionTips.map((t, i) => <li key={i} className="text-sm flex gap-2"><span style={{ color: TYPE_COLORS[result.type] }}>■</span>{t}</li>)}</ul>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Your Genetic Blueprint</h2>
            <p>A body type calculator is a crucial first step in designing an effective, highly personalized fitness regimen. For decades, frustrated gym-goers have downloaded generic workout templates from fitness magazines, only to find they yield zero results. The reason is simple: a high-volume, low-rest workout designed for a naturally muscular athlete will absolutely destroy the nervous system of a naturally skinny beginner. By determining your dominant somatotype—Ectomorph, Mesomorph, or Endomorph—you unlock the specific metabolic rules that govern your body, allowing you to stop fighting your genetics and start working with them.</p>
            <p>Originally categorized by American psychologist William Sheldon in the 1940s, somatotyping provides a framework for understanding human physical variation. While modern exercise science rejects Sheldon's psychological assumptions, the physiological classifications remain the gold standard heuristic used by elite personal trainers and sports dietitians to establish baseline training protocols for new clients.</p>

            <h2>How It Works</h2>
            <p>The mathematics behind this specific calculator rely on combining your soft tissue mass with your skeletal frame size to pinpoint your position on the somatotype spectrum.</p>
            <p>First, the tool calculates your <strong>Body Mass Index (BMI)</strong>. This provides a baseline understanding of how much mass (both fat and muscle) you currently carry relative to your height.</p>
            <p>Second, and most importantly, it analyzes your <strong>Wrist Circumference</strong>. Why the wrist? The wrist is one of the few areas on the human body that stores virtually no body fat. Therefore, measuring your wrist provides an incredibly accurate proxy for your overall bone thickness and skeletal frame size. A thick wrist indicates a dense, large skeletal structure capable of supporting massive muscle growth (Mesomorph/Endomorph traits). A thin wrist indicates a lighter, more fragile skeletal structure built for endurance (Ectomorph traits).</p>
            <p>By cross-referencing your frame size against your current mass and biological sex, the calculator scores your physical traits and categorizes you into your dominant genetic somatotype.</p>

            <h2>The Three Somatotypes Explained</h2>
            <p>It is important to remember that almost nobody is a 100% pure example of a single body type. You are a blend of all three, but one will heavily dominate your physical responses.</p>
            
            <h3>The Ectomorph</h3>
            <p>Ectomorphs are the classic "hardgainers." They are naturally thin, with long, lean limbs, narrow shoulders, and a fast metabolism. While they excel at endurance sports like marathon running, they struggle immensely to gain muscle mass or weight. Because their bodies burn calories at an accelerated rate, putting them on a standard fitness diet (like chicken and broccoli) will cause them to shrink. Ectomorphs must focus heavily on a caloric surplus, emphasizing calorie-dense foods, and utilizing heavy, low-rep weightlifting to force nervous system adaptation.</p>

            <h3>The Mesomorph</h3>
            <p>Mesomorphs won the genetic lottery for aesthetics and bodybuilding. They have a naturally athletic, symmetrical build with broad shoulders and a narrow waist (the classic V-taper). They possess an efficient metabolism, allowing them to gain muscle rapidly and lose fat with relative ease. Mesomorphs respond exceptionally well to almost any type of resistance training and can handle high-volume workouts that would overtrain an ectomorph.</p>

            <h3>The Endomorph</h3>
            <p>Endomorphs are naturally powerful but tend to have a slower, more conserving metabolism. They typically have a wider, stockier build with shorter limbs. They gain weight incredibly easily—both muscle and fat—and struggle the most to achieve a lean, "shredded" look. Endomorphs must be highly disciplined with their nutrition, often requiring lower carbohydrate diets to manage insulin sensitivity. Their training must prioritize high-intensity interval training (HIIT) and metabolic conditioning to force their bodies to burn stored fat.</p>

            <h2>Understanding Your Results</h2>
            <p>When you execute a calculation, the tool provides five distinct analytical sections designed to give you a comprehensive blueprint for your fitness journey.</p>
            <p><strong>Primary Result Card:</strong> This displays your dominant somatotype, accompanied by a brief summary of your metabolic tendencies.</p>
            <p><strong>3-Stat Bar:</strong> This section displays your precise blend percentage. For example, you might be 70% Mesomorph and 15% Ectomorph, indicating you are an athlete who leans slightly toward the leaner side of the spectrum.</p>
            <p><strong>Physiological Breakdown Table:</strong> A line-item accounting that explicitly states your estimated frame size, metabolic speed, and the primary fitness challenge you will face (e.g., losing adipose tissue vs. gaining mass).</p>
            <p><strong>Genetic Trait Scaling Chart:</strong> A visual bar chart comparing how the three different body types naturally perform across key fitness metrics: Leanness, Muscle Hypertrophy, Cardio Endurance, and Raw Strength.</p>
            <p><strong>Actionable Directives:</strong> A curated list of highly specific training and nutrition tips tailored exclusively to your dominant body type. This is the playbook you take to the gym.</p>

            <h2>Overcoming Your Genetic Baseline</h2>
            <p>The most dangerous trap in fitness is the belief that your body type is your destiny. If you are an endomorph, you are not cursed to be overweight. If you are an ectomorph, you are not cursed to be weak. Your somatotype simply dictates the <strong>methods</strong> you must use to reach your goals.</p>
            <p>An ectomorph who wants to look like a bodybuilder must eat an uncomfortable amount of food—far more than a mesomorph—and focus exclusively on heavy compound movements like deadlifts and squats, resting up to 3 minutes between sets. An endomorph who wants to see their abs must tightly restrict refined carbohydrates, prioritize lean proteins, and commit to grueling cardio sessions 4 to 5 times a week.</p>
            <p>Genetics dictate the starting line, not the finish line. The fitness industry is filled with elite ectomorph bodybuilders and elite endomorph fitness models who learned the rules of their specific body type and executed their plans flawlessly.</p>

            <h2>Practical Examples</h2>
            <p>Let's look at how utilizing this calculator can prevent months of wasted effort in the gym.</p>
            <p><strong>Example 1: The Frustrated Runner.</strong> You are an Ectomorph. You want to build a bigger chest and wider shoulders. You start doing high-volume workouts (4 sets of 15 reps) and running 3 miles on the treadmill every day to "stay lean." Result: After six months, you are weaker and skinnier than when you started. Why? Because your fast metabolism burned through your muscle tissue to survive the cardio. If you had known your body type, you would have stopped running, dropped your reps to 5-8 per set, and increased your caloric intake.</p>
            <p><strong>Example 2: The Stalled Powerlifter.</strong> You are an Endomorph. You want to lose 20 pounds of body fat. You start lifting heavy weights for 3 reps per set and taking long 5-minute rests between sets. Result: You get incredibly strong, but you don't lose any fat, and you actually look larger because the new muscle is sitting under the existing fat layer. If you had known your body type, you would have switched to high-intensity circuit training to keep your heart rate elevated and implemented a strict caloric deficit.</p>

            <h2>Tips & Best Practices</h2>
            <p>To successfully leverage your body type classification, you must integrate it into a comprehensive fitness strategy. Follow these best practices.</p>
            <p>First, be brutally honest about your nutrition. Training for your body type is useless if your diet contradicts it. Endomorphs cannot out-train a high-sugar diet. Ectomorphs cannot out-lift a low-calorie diet. Nutrition is the key that unlocks your genetic potential.</p>
            <p>Second, track your progress and adjust. Somatotypes are generalizations. You may be an endomorph who uniquely responds well to moderate carbohydrates, or a mesomorph who needs extra recovery time. Start with the baseline recommendations provided in this calculator, track your weight and strength for 4 weeks, and adjust the variables based on empirical data.</p>
            <p>Third, prioritize compound movements regardless of your body type. Squats, deadlifts, bench presses, overhead presses, and pull-ups form the foundation of human strength. Whether you are doing them for heavy singles (ecto) or in a fast-paced circuit (endo), these movements trigger the highest neuroendocrine response and drive the fastest physical changes.</p>

            <h2>Benefits</h2>
            <p>Utilizing a comprehensive Body Type Calculator eliminates the guesswork from your fitness journey. It stops you from blindly following the routines of genetic elites and forces you to confront the reality of your own physiological baseline.</p>
            <p>By understanding your inherent strengths and weaknesses, you can immediately discard training philosophies that conflict with your metabolism and adopt the specific nutritional strategies required to force adaptation. It empowers you to train smarter, recover faster, and finally build the physique you have been working toward.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-type-calculator" />
          <PopularCalculators exclude="/calculator/body-type-calculator" />
        </div>
      </div>
    </>
  );
}
