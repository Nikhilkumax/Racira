"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, CartesianGrid } from "recharts";

interface WeightResult {
  bmi: number;
  category: string;
  devine: number;
  robinson: number;
  miller: number;
  hamwi: number;
  avgIdeal: number;
  healthyMin: number;
  healthyMax: number;
  toGainLose: number;
  direction: string;
  chartData: { name: string; weight: number; color: string }[];
  breakdown: { label: string; value: string }[];
}

function calcWithCurrentWeight(weightKg: number, heightCm: number, sex: string): WeightResult {
  const heightM = heightCm / 100;
  const heightIn = heightCm / 2.54;
  const over5ft = Math.max(0, heightIn - 60);

  // Four clinical formulas for ideal body weight
  const devine = sex === "male" ? 50 + 2.3 * over5ft : 45.5 + 2.3 * over5ft;
  const robinson = sex === "male" ? 52 + 1.9 * over5ft : 49 + 1.7 * over5ft;
  const miller = sex === "male" ? 56.2 + 1.41 * over5ft : 53.1 + 1.36 * over5ft;
  const hamwi = sex === "male" ? 48 + 2.7 * over5ft : 45.4 + 2.2 * over5ft;
  
  const avgIdeal = (devine + robinson + miller + hamwi) / 4;

  const healthyMin = 18.5 * (heightM * heightM);
  const healthyMax = 24.9 * (heightM * heightM);

  const bmi = weightKg / (heightM * heightM);
  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal Weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  const toGainLose = Math.abs(weightKg - avgIdeal);
  const direction = weightKg < avgIdeal ? "below ideal" : weightKg > avgIdeal ? "above ideal" : "at ideal";

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6"];
  const chartData = [
    { name: "Devine", weight: devine, color: COLORS[0] },
    { name: "Robinson", weight: robinson, color: COLORS[1] },
    { name: "Miller", weight: miller, color: COLORS[2] },
    { name: "Hamwi", weight: hamwi, color: COLORS[3] },
  ];

  const breakdown = [
    { label: "Devine Formula (1974)", value: `${devine.toFixed(1)} kg` },
    { label: "Robinson Formula (1983)", value: `${robinson.toFixed(1)} kg` },
    { label: "Miller Formula (1983)", value: `${miller.toFixed(1)} kg` },
    { label: "Hamwi Formula (1964)", value: `${hamwi.toFixed(1)} kg` },
    { label: "WHO Healthy BMI Range", value: "18.5 – 24.9 BMI" },
    { label: "Minimum Healthy Mass", value: `${healthyMin.toFixed(1)} kg` },
    { label: "Maximum Healthy Mass", value: `${healthyMax.toFixed(1)} kg` },
  ];

  return { bmi, category, devine, robinson, miller, hamwi, avgIdeal, healthyMin, healthyMax, toGainLose, direction, chartData, breakdown };
}

export default function HealthyWeightCalculator() {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("70");
  const [sex, setSex] = useState("male");
  const [result, setResult] = useState<WeightResult | null>(null);

  const calculate = () => {
    const h = parseFloat(height), w = parseFloat(weight);
    if (h > 0 && w > 0) setResult(calcWithCurrentWeight(w, h, sex));
  };

  useEffect(() => { setResult(calcWithCurrentWeight(70, 170, "male")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What exactly is a healthy weight?", answer: "Clinically, a healthy weight is defined as a weight that places your Body Mass Index (BMI) within the 'normal' range of 18.5 to 24.9. For an adult who is 170 cm tall, this translates to a body weight between roughly 53.5 kg and 71.9 kg. Staying within this range is statistically correlated with a lower risk of chronic diseases like type 2 diabetes and hypertension." },
    { question: "Why does the calculator use four different formulas?", answer: "There is no single universally accepted 'perfect' weight. Over the decades, medical researchers developed different formulas for different purposes. The Devine formula (1974) was created specifically to determine proper dosages for medications that shouldn't be dosed on fat mass. Robinson, Miller, and Hamwi modified these baseline equations based on different population data. We provide the average of all four to give you the most well-rounded target." },
    { question: "Is BMI an accurate measurement for healthy weight?", answer: "BMI is an excellent screening tool for large populations, but it has flaws for individuals. Because BMI only uses height and weight, it cannot distinguish between fat mass and muscle mass. A highly trained, heavily muscled athlete might have a BMI of 28 (technically 'overweight') while carrying only 8% body fat. For non-athletes, however, BMI remains a highly reliable indicator of healthy mass." },
    { question: "How does biological sex affect healthy weight?", answer: "All clinical ideal weight formulas differentiate between biological sex. Men naturally possess larger skeletal structures (bone density) and a higher baseline of lean muscle mass due to different hormonal profiles (testosterone). Consequently, the formulas calculate a healthy weight for a male to be approximately 4 to 5 kilograms heavier than a female of the exact same height." },
    { question: "What is the safest rate to lose weight?", answer: "To reach a healthy weight safely, medical professionals recommend aiming for a loss of 0.5 to 1 kilogram per week (1 to 2 pounds). This requires a daily caloric deficit of approximately 500 to 1,000 calories. Weight lost at this slower rate is much more likely to be pure fat rather than muscle tissue, and the results are significantly more sustainable long-term than those from 'crash' diets." },
    { question: "What should I do if I am below my minimum healthy weight?", answer: "Being underweight (a BMI below 18.5) carries its own set of health risks, including a weakened immune system, osteoporosis, and chronic fatigue. To reach a healthy weight safely, you should consume a caloric surplus composed of nutrient-dense foods (nuts, avocados, whole grains, lean proteins) rather than simply eating 'junk food', and incorporate resistance training to build healthy muscle mass." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Healthy Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Healthy Weight Calculator</h1>
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
                <label className="text-sm font-medium mb-1.5 block">Current Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className={suf}>kg</span></div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setHeight("170"); setWeight("70"); setSex("male"); setResult(calcWithCurrentWeight(70, 170, "male")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Average Ideal Target Weight</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.avgIdeal.toFixed(1)} kg</div>
                <div className="text-sm text-muted-foreground mt-1">Difference: {result.toGainLose.toFixed(1)} kg {result.direction}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Healthy Min", `${result.healthyMin.toFixed(1)} kg`], ["Healthy Max", `${result.healthyMax.toFixed(1)} kg`], ["Your BMI", `${result.bmi.toFixed(1)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Formula Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "font-bold border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Ideal Weight Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[Math.floor(Math.min(...result.chartData.map(d => d.weight)) - 5), Math.ceil(Math.max(...result.chartData.map(d => d.weight)) + 5)]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kg`, "Target Weight"]} />
                    <ReferenceLine y={result.avgIdeal} stroke="#6366f1" strokeDasharray="4 4" label={{ value: `Avg: ${result.avgIdeal.toFixed(1)}`, position: 'insideTopLeft', fontSize: 11, fill: "#6366f1" }} />
                    <Bar dataKey="weight" radius={[4, 4, 0, 0]}>{result.chartData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Status</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {[["Medical Category", result.category], ["Target Delta", `${result.toGainLose.toFixed(1)} kg ${result.direction}`], ["WHO Healthy Min", `${result.healthyMin.toFixed(1)} kg`], ["WHO Healthy Max", `${result.healthyMax.toFixed(1)} kg`]].map(([k, v], i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{k}:</span><span className="font-semibold">{v}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Your Healthy Weight Range</h2>
            <p>Determining a "healthy weight" is one of the most critical steps in preventative medicine and personal fitness. Unlike the aesthetic goals pushed by fitness magazines, a clinically healthy weight is rooted in statistical biology. It represents the specific weight range at which your body functions optimally, significantly reducing your statistical risk for chronic conditions such as cardiovascular disease, hypertension, type 2 diabetes, and certain forms of cancer.</p>
            <p>However, calculating this target is not a one-size-fits-all equation. Because human bodies vary wildly in bone density, muscle distribution, and genetic frame size, a single "perfect" number does not exist. Instead, medical science uses a combination of established clinical formulas and Body Mass Index (BMI) ranges to define a target zone. This Healthy Weight Calculator aggregates four decades of medical research to provide you with the most accurate, personalized weight target possible.</p>

            <h2 className="text-2xl font-bold mb-3">How The Calculations Work</h2>
            <p>This calculator relies on two distinct methodologies: the absolute boundaries set by the World Health Organization (WHO) via BMI, and the specific target weights generated by four famous clinical equations.</p>
            <p>First, it determines your <strong>Healthy Weight Range</strong> using BMI. The WHO defines a "normal" or healthy BMI as resting strictly between 18.5 and 24.9. The calculator reverses this equation based on your height to find the absolute minimum and maximum weights that keep you within this safe zone. Formula: <code>Weight (kg) = BMI * Height (m)²</code>. For a person who is 170 cm (1.7m) tall, the minimum healthy weight is 18.5 * (1.7)² = 53.5 kg. The maximum is 24.9 * (1.7)² = 71.9 kg. This provides an 18-kilogram buffer for natural human variance.</p>
            <p>Next, the calculator applies the <strong>Four Clinical Formulas</strong> to pinpoint a specific target within that broad range. These formulas—Devine (1974), Robinson (1983), Miller (1983), and Hamwi (1964)—were created by doctors to calculate proper medication dosages for patients, ensuring that drugs were dosed based on lean body mass rather than excess adipose tissue (fat). Each formula uses a base weight for a person who is 5 feet (152.4 cm) tall, and adds a specific amount of weight for every inch over 5 feet.</p>
            <p>Finally, the calculator averages the results of all four clinical formulas to provide you with a single, highly reliable <strong>Average Ideal Weight</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you execute a calculation, the tool provides five distinct analytical sections designed to give you total visibility into your current health status and future targets.</p>
            <p><strong>Primary Target Card:</strong> This highlights your Average Ideal Weight. Crucially, it also displays your "Target Delta," explicitly stating exactly how many kilograms you need to gain or lose to hit the mathematical average.</p>
            <p><strong>3-Stat Target Bar:</strong> This section clearly defines the boundaries of your WHO Healthy Range (the absolute minimum and maximum). As long as your weight sits between these two numbers, you are statistically at a lower risk for weight-related diseases.</p>
            <p><strong>Formula Breakdown Table:</strong> A transparent, line-by-line accounting that shows exactly what weight each of the four clinical formulas (Devine, Robinson, Miller, Hamwi) predicted for your specific height and sex.</p>
            <p><strong>Ideal Weight Comparison Chart:</strong> A visual bar chart comparing the four clinical formulas against the generated average. This illustrates the slight variance in medical opinion regarding optimal body mass.</p>
            <p><strong>Summary Status:</strong> A fast, readable grid aggregating your current status, prominently featuring your current medical category (Underweight, Normal Weight, Overweight, or Obese) based on your inputs.</p>

            <h2 className="text-2xl font-bold mb-3">The Role of Biological Sex</h2>
            <p>You will notice that all four clinical formulas require you to input your biological sex. This is not arbitrary; it is rooted in fundamental physiology.</p>
            <p>Male and female bodies store mass differently. Due to differing hormonal profiles (specifically testosterone), men naturally carry a higher baseline of lean muscle mass. Furthermore, men generally possess a slightly denser skeletal structure. As a result, the clinical formulas calculate the ideal weight for a male to be approximately 4 to 5 kilograms (10 to 12 pounds) heavier than a female of the exact same height.</p>

            <h2 className="text-2xl font-bold mb-3">The Limitations of BMI</h2>
            <p>While this calculator uses BMI to set the outer boundaries of your healthy range, it is vital to understand the limitations of the Body Mass Index system.</p>
            <p>BMI was created in the 19th century by a mathematician, not a physician. Its fatal flaw is that it only measures total mass relative to height; it cannot distinguish between fat tissue and muscle tissue. Muscle is significantly denser than fat, meaning it takes up less space but weighs more.</p>
            <p>Consequently, a highly trained powerlifter or heavily muscled athlete may weigh 95 kg at a height of 175 cm. Their BMI would be over 31, classifying them as "Obese," even if their body fat percentage is exceptionally low. Conversely, an elderly person might sit perfectly within the "Normal Weight" BMI range, but carry very little muscle and high amounts of visceral fat (a condition often called "skinny fat"), leaving them at high risk for metabolic disease. BMI is an excellent baseline, but it must be contextualized with your body composition.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how utilizing this calculator provides a roadmap for different individuals.</p>
            <p><strong>Example 1: The Frustrated Dieter.</strong> A female who is 165 cm tall currently weighs 75 kg. Her BMI is 27.5 (Overweight). She feels she needs to lose 20 kg to be healthy. She uses the calculator. The WHO Healthy Range shows she only needs to drop below 67.8 kg to re-enter the "Normal" category. The average ideal weight is calculated at roughly 58 kg. Armed with this data, she sets a realistic, achievable goal of losing 8 kg to eliminate her health risks, rather than pursuing a dangerous crash diet to lose 20 kg.</p>
            <p><strong>Example 2: The Underweight Hardgainer.</strong> A male who is 185 cm tall weighs 60 kg. He feels fine but struggles with chronic fatigue. He uses the calculator. His BMI is 17.5 (Underweight). The calculator reveals his absolute minimum healthy weight should be 63.3 kg, and his average ideal target is roughly 78 kg. He now understands that his fatigue may be linked to insufficient mass and begins a structured program of caloric surplus and weightlifting to safely add 15 kg to his frame.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Reaching and maintaining a healthy weight is a lifelong endeavor that requires sustainable habits, not temporary extremes. Follow these absolute best practices.</p>
            <p>First, if your goal is weight loss, target a sustainable deficit. Medical science dictates that a deficit of 500 calories a day will result in approximately 0.5 kg (1 pound) of fat loss per week. Trying to lose weight faster than this usually results in muscle loss and inevitable rebound weight gain.</p>
            <p>Second, ignore the scale on a daily basis. Your body weight fluctuates by up to 2 kg every single day due to water retention, sodium intake, and glycogen storage. Weigh yourself once a week, under the exact same conditions (e.g., Friday morning, before eating), and track the long-term trend line, not the daily spikes.</p>
            <p>Third, pair your weight goals with resistance training. Whether you are gaining weight to reach the healthy minimum, or losing weight to escape the overweight category, lifting weights ensures that the mass you gain is muscle, and the mass you lose is fat.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Utilizing a comprehensive Healthy Weight Calculator bridges the gap between aesthetic vanity and true medical health. It removes the emotional component of stepping on a scale and replaces it with cold, actionable, statistically sound targets.</p>
            <p>By defining your absolute healthy boundaries and providing specific targets based on four decades of clinical pharmacology, this tool empowers you to set realistic goals, protect your long-term health, and build a sustainable, mathematically sound approach to your physical well-being.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/healthy-weight-calculator" />
          <PopularCalculators exclude="/calculator/healthy-weight-calculator" />
        </div>
      </div>
    </>
  );
}
