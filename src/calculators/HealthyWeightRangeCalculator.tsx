"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Scale, Target, ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceArea, ReferenceLine } from "recharts";

interface WeightRangeResult {
  currentWeight: number;
  minHealthy: number;
  maxHealthy: number;
  bmi: number;
  status: string;
  statusColor: string;
  actionText: string;
  actionIcon: any;
  chartData: { name: string; value: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcHealthyRange(feet: number, inches: number, weightLbs: number): WeightRangeResult {
  const heightInches = (feet * 12) + inches;
  
  // BMI = 703 * (lbs / inches^2)
  // Healthy BMI range is 18.5 to 24.9
  // Min Healthy Weight = (18.5 * inches^2) / 703
  // Max Healthy Weight = (24.9 * inches^2) / 703

  const minHealthy = (18.5 * Math.pow(heightInches, 2)) / 703;
  const maxHealthy = (24.9 * Math.pow(heightInches, 2)) / 703;
  
  const bmi = (703 * weightLbs) / Math.pow(heightInches, 2);

  let status = "";
  let statusColor = "";
  let actionText = "";
  let actionIcon = CheckCircle2;

  if (bmi < 18.5) {
    status = "Underweight";
    statusColor = "#3b82f6"; // Blue
    const diff = minHealthy - weightLbs;
    actionText = `Gain ${diff.toFixed(1)} lbs to reach the healthy range.`;
    actionIcon = ArrowUpRight;
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    status = "Healthy Weight";
    statusColor = "#22c55e"; // Green
    actionText = "Maintain current weight. You are perfectly within the healthy range.";
    actionIcon = CheckCircle2;
  } else if (bmi >= 25 && bmi < 29.9) {
    status = "Overweight";
    statusColor = "#f59e0b"; // Yellow
    const diff = weightLbs - maxHealthy;
    actionText = `Lose ${diff.toFixed(1)} lbs to reach the healthy range.`;
    actionIcon = ArrowDownRight;
  } else {
    status = "Obese";
    statusColor = "#ef4444"; // Red
    const diff = weightLbs - maxHealthy;
    actionText = `Lose ${diff.toFixed(1)} lbs to reach the healthy range.`;
    actionIcon = ArrowDownRight;
  }

  const chartData = [
    { name: "Current Weight", value: weightLbs }
  ];

  const summaryStats = [
    { label: "Target Range", value: `${minHealthy.toFixed(1)} - ${maxHealthy.toFixed(1)} lbs` },
    { label: "Current BMI", value: `${bmi.toFixed(1)}` }
  ];

  return {
    currentWeight: weightLbs,
    minHealthy: Number(minHealthy.toFixed(1)),
    maxHealthy: Number(maxHealthy.toFixed(1)),
    bmi: Number(bmi.toFixed(1)),
    status,
    statusColor,
    actionText,
    actionIcon,
    chartData,
    summaryStats
  };
}

export default function HealthyWeightRangeCalculator() {
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [weight, setWeight] = useState("195");

  const [result, setResult] = useState<WeightRangeResult | null>(null);

  const calculate = () => {
    const f = parseInt(feet) || 0;
    const i = parseInt(inches) || 0;
    const w = parseFloat(weight);

    if ((f > 0 || i > 0) && w > 0) {
      setResult(calcHealthyRange(f, i, w));
    }
  };

  useEffect(() => { setResult(calcHealthyRange(5, 10, 195)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How is the 'healthy range' calculated?", answer: "This calculator uses the international clinical standard established by the World Health Organization (WHO). It reverses the Body Mass Index (BMI) formula. Since a healthy BMI is strictly defined as falling between 18.5 and 24.9, the calculator determines the exact minimum and maximum pounds required for your specific height to stay within those brackets." },
    { question: "Why is the healthy range so wide?", answer: "The healthy weight range for any given height spans roughly 30 to 40 pounds. This is intentional. It accounts for vast differences in human anatomy, including skeletal frame size (small vs. large wrists), bone density, and varying levels of healthy lean muscle mass. As long as you fall anywhere within this wide bracket, you are statistically at the lowest risk for weight-related diseases." },
    { question: "Is this accurate for athletes or bodybuilders?", answer: "No. The BMI formula does not differentiate between the weight of fat and the weight of muscle. Because muscle tissue is significantly denser and heavier than fat, a highly trained athlete with very low body fat can easily weigh enough to be classified as 'Overweight' or even 'Obese' according to this mathematical formula." },
    { question: "What if I am outside the healthy range?", answer: "Being outside the healthy range statistically increases your risk of cardiovascular disease, type 2 diabetes, and joint problems (if overweight), or malnutrition, osteoporosis, and immune deficiency (if underweight). It serves as a clinical screening tool indicating that you should discuss your weight and lifestyle with a physician." },
    { question: "Should I target the middle of the range?", answer: "Not necessarily. A person with a large frame and a moderate amount of muscle should comfortably target the upper end of the healthy range. A person with a very slight, narrow frame might naturally sit at the lower end. There is no 'perfect' number; anywhere inside the green zone is considered biologically optimal." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Healthy Weight Range Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Healthy Weight Range Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Feet)</label>
                <div className={inp}><input type="number" value={feet} onChange={e => setFeet(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Inches)</label>
                <div className={inp}><input type="number" value={inches} onChange={e => setInches(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-1.5 block">Current Weight</label>
              <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">lbs</span></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <Scale className="h-5 w-5" /> Calculate Range
              </button>
              <button onClick={() => { setFeet("5"); setInches("10"); setWeight("195"); setResult(calcHealthyRange(5, 10, 195)); }} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>Clinical Status</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{result.status}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border">
                    <result.actionIcon className="w-7 h-7" style={{ color: result.statusColor }} />
                  </div>
                </div>
                <div className="text-sm font-bold text-foreground mt-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-muted-foreground" /> {result.actionText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-xl sm:text-2xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Weight Range Scale</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Green zone represents the biologically optimal healthy weight bracket (BMI 18.5 - 24.9).</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 20 }}>
                    <XAxis type="number" domain={[Math.max(0, result.minHealthy - 40), result.maxHealthy + 80]} tick={{ fontSize: 11 }} ticks={[Math.round(result.minHealthy), Math.round(result.maxHealthy)]} />
                    <YAxis type="category" dataKey="name" hide />
                    
                    {/* Background Ranges */}
                    <ReferenceArea x1={0} x2={result.minHealthy} fill="#eff6ff" fillOpacity={1} />
                    <ReferenceArea x1={result.minHealthy} x2={result.maxHealthy} fill="#dcfce7" fillOpacity={1} />
                    <ReferenceArea x1={result.maxHealthy} x2={result.maxHealthy + 35} fill="#fef3c7" fillOpacity={1} />
                    <ReferenceArea x1={result.maxHealthy + 35} x2={500} fill="#fee2e2" fillOpacity={1} />

                    <ReferenceLine x={result.minHealthy} stroke="#22c55e" strokeDasharray="3 3" />
                    <ReferenceLine x={result.maxHealthy} stroke="#22c55e" strokeDasharray="3 3" />

                    <Tooltip cursor={false} formatter={(v: number) => [`${v} lbs`, "Your Weight"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" barSize={20} fill={result.statusColor} radius={2} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mt-1">
                  <span>Under</span>
                  <span className="text-green-600">Healthy</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Science Behind the Healthy Weight Range</h2>
            <p>Weight is a highly emotional topic, but biologically, it is simply a metric of physical mass. The medical community uses the <strong>Healthy Weight Range</strong> to identify the optimal amount of mass your specific skeleton is designed to carry.</p>
            <p>This calculator reverse-engineers the standard Body Mass Index (BMI) formula. Instead of telling you your BMI score, it calculates the exact minimum and maximum pounds you can weigh before crossing the clinical threshold into elevated health risks.</p>

            <h2>Why is the Range So Wide?</h2>
            <p>A common critique of height-weight charts is that they do not account for different body types. In reality, this is precisely why the "Healthy" bracket is so wide. For a person who is 5'10", the healthy range spans from roughly 129 pounds all the way to 173 pounds—a massive 44-pound swing.</p>
            <p>This wide bracket naturally accommodates the three main physiological variables:</p>
            <ul>
              <li><strong>Bone Density & Frame Size:</strong> Some individuals have naturally thicker, denser bones and larger joints. They will comfortably sit at the top of the healthy range. Those with slight "small-boned" frames will sit at the bottom.</li>
              <li><strong>Muscle Mass:</strong> Muscle tissue is extremely dense. A sedentary person might weigh 140 lbs, while a highly active person of the same height might weigh 160 lbs, with both falling safely into the green zone.</li>
              <li><strong>Age-Related Fluctuations:</strong> As we age, our body composition naturally shifts. The wide range prevents minor age-related weight gain from immediately triggering an "Overweight" classification.</li>
            </ul>

            <h2>The Danger Zones</h2>
            <p>Falling outside of the healthy range—in either direction—forces your organs to work harder than they were designed to.</p>
            <p><strong>Overweight / Obese:</strong> Every extra pound of fat tissue requires your body to create miles of new microscopic blood vessels to supply it with oxygen. This places a massive, chronic strain on your heart, raising blood pressure. The extra physical weight mechanically degrades the cartilage in your knees and hips, and excess visceral fat causes hormonal changes that trigger insulin resistance (Type 2 Diabetes).</p>
            <p><strong>Underweight:</strong> Being too light is equally dangerous. It deprives the body of the energy reserves required to fight off infections, leads to severe osteoporosis (brittle bones) due to lack of load-bearing mass, and can shut down reproductive functions as the body enters "starvation mode."</p>

            <h2>When the Formula Fails</h2>
            <p>The BMI formula is a statistical screening tool designed for the general population. It fails completely when applied to extreme edge cases. Professional bodybuilders, NFL linebackers, and heavyweight boxers are regularly classified as "Obese" by this calculator simply because muscle is so heavy. If you are a highly trained athlete with visible abs, you can safely ignore this metric and rely on Body Fat Percentage instead.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/healthy-weight-range-calculator" />
          <PopularCalculators exclude="/calculator/healthy-weight-range-calculator" />
        </div>
      </div>
    </>
  );
}
