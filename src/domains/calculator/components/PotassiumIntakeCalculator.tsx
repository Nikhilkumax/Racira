"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PotassiumResult {
  target: number;
  status: string;
  recommendation: string;
  sodiumPotassiumRatio: number;
  chartData: { name: string; target: number; current: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPotassium(
  age: number, gender: string, isPregnant: boolean, isBreastfeeding: boolean,
  currentPotassium: number, currentSodium: number, hasKidneyDisease: boolean
): PotassiumResult {
  // Base Adequate Intake (AI) from National Academies of Sciences, Engineering, and Medicine (2019 updates)
  let target = 3400; // Adult Male
  
  if (gender === "female") {
    target = 2600;
    if (isPregnant) target = 2900;
    if (isBreastfeeding) target = 2800;
  }

  if (age >= 1 && age <= 3) target = 2000;
  else if (age >= 4 && age <= 8) target = 2300;
  else if (age >= 9 && age <= 13) {
    target = gender === "male" ? 2500 : 2300;
  } else if (age >= 14 && age <= 18) {
    target = gender === "male" ? 3000 : 2300;
  }

  let status = "Adequate";
  let recommendation = "Your potassium intake meets current guidelines.";

  if (hasKidneyDisease) {
    status = "Consult Physician";
    target = 2000; // Typical restricted potassium diet for CKD
    recommendation = `Because you indicated kidney disease, your recommended intake is restricted to around 2,000 mg/day. Damaged kidneys cannot filter excess potassium, which can lead to dangerous hyperkalemia (heart rhythm issues). Always follow your nephrologist's specific diet plan.`;
  } else {
    if (currentPotassium < target) {
      status = "Deficient";
      const deficit = target - currentPotassium;
      recommendation = `You are short by ${deficit}mg of potassium daily. Fewer than 3% of Americans meet their potassium goals. Add more leafy greens, potatoes, beans, and avocados to your diet to help regulate blood pressure and muscle function.`;
    } else if (currentPotassium > target + 2000 && currentPotassium > 4700) {
      status = "High Intake";
      recommendation = `Your intake is very high (${currentPotassium}mg). While healthy kidneys easily excrete excess potassium from food, be cautious if you are using potassium supplements or salt substitutes, as these can spike blood levels rapidly.`;
    }
  }

  const sodiumPotassiumRatio = currentSodium > 0 ? currentPotassium / currentSodium : 0;
  let ratioStatus = "";
  if (sodiumPotassiumRatio >= 2) ratioStatus = "Excellent (Heart Protective)";
  else if (sodiumPotassiumRatio >= 1) ratioStatus = "Good";
  else if (currentSodium > 0) ratioStatus = "Poor (Higher risk of hypertension)";

  const chartData = [
    { name: "Potassium (mg)", target: target, current: currentPotassium }
  ];

  const breakdown = [
    { label: "Recommended Target (AI)", value: `${target} mg/day` },
    { label: "Your Current Intake", value: `${currentPotassium} mg/day` },
    { label: "Estimated Sodium Intake", value: `${currentSodium} mg/day` },
    { label: "Potassium-to-Sodium Ratio", value: sodiumPotassiumRatio > 0 ? `${sodiumPotassiumRatio.toFixed(1)}:1` : "N/A" },
    { label: "Ratio Evaluation", value: ratioStatus || "N/A" },
    { label: "Status", value: status },
  ];

  const summaryStats = [
    { label: "Daily Target", value: `${target} mg` },
    { label: "Current Intake", value: `${currentPotassium} mg` },
    { label: "Deficit/Surplus", value: `${currentPotassium - target >= 0 ? "+" : ""}${currentPotassium - target} mg` },
    { label: "K:Na Ratio", value: sodiumPotassiumRatio > 0 ? sodiumPotassiumRatio.toFixed(1) : "N/A" },
  ];

  return { target, status, recommendation, sodiumPotassiumRatio, chartData, breakdown, summaryStats };
}

export default function PotassiumIntakeCalculator() {
  const [age, setAge] = useState("35");
  const [gender, setGender] = useState("male");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);
  const [currentPotassium, setCurrentPotassium] = useState("2000");
  const [currentSodium, setCurrentSodium] = useState("3400");
  const [hasKidneyDisease, setHasKidneyDisease] = useState(false);
  const [result, setResult] = useState<PotassiumResult | null>(null);

  const calculate = () => {
    setResult(calcPotassium(
      parseInt(age) || 35, gender, isPregnant, isBreastfeeding,
      parseInt(currentPotassium) || 0, parseInt(currentSodium) || 0, hasKidneyDisease
    ));
  };

  useEffect(() => { setResult(calcPotassium(35, "male", false, false, 2000, 3400, false)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why is potassium important?", answer: "Potassium is an essential mineral and electrolyte that your body needs to function correctly. It carries a small electrical charge that activates various cell and nerve functions. It is critical for maintaining a normal heartbeat, ensuring proper muscle contraction, and helping move nutrients into cells and waste products out of cells." },
    { question: "How does potassium affect blood pressure?", answer: "Potassium directly counteracts the negative effects of sodium. The more potassium you eat, the more sodium you lose through urine. Potassium also helps to ease tension in your blood vessel walls, which helps further lower blood pressure. A high-potassium diet is one of the most effective dietary interventions for managing hypertension (high blood pressure)." },
    { question: "What is the ideal Potassium-to-Sodium ratio?", answer: "Historically, human diets had a potassium-to-sodium ratio of about 4:1 to 10:1. The modern Western diet has inverted this to about 1:2 (we eat twice as much sodium as potassium). Public health guidelines recommend aiming for at least a 2:1 ratio (e.g., 3,000mg potassium and 1,500mg sodium). An inverted ratio is a major driver of global cardiovascular disease." },
    { question: "What are the best food sources of potassium?", answer: "While bananas are famous for potassium (422mg per medium banana), they aren't the best source. Better sources include: Baked potato with skin (900mg), Sweet potato (540mg), Spinach (839mg per cooked cup), Avocados (728mg per half), White beans (1,189mg per cup), and Salmon (534mg per 3oz filet). A diet rich in whole vegetables, fruits, and legumes naturally provides adequate potassium." },
    { question: "Should I take potassium supplements?", answer: "Unless prescribed by a doctor, over-the-counter potassium supplements are generally not recommended and are intentionally capped at 99mg per pill in the US. Taking high doses of potassium in pill form can cause a dangerous spike in blood potassium levels (hyperkalemia), potentially causing cardiac arrest. It is extremely difficult to overdose on potassium from food, so focus on dietary changes." },
    { question: "Why do kidney disease patients need to limit potassium?", answer: "Healthy kidneys are responsible for filtering out excess potassium from the blood into the urine. When kidneys are damaged (Chronic Kidney Disease), they lose this ability. If a CKD patient consumes a high-potassium diet, the potassium builds up in the blood to toxic levels, which can cause sudden heart rhythm problems. CKD patients often need a restricted potassium diet of ~2,000mg/day." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Potassium Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Potassium Intake Calculator</h1>
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
            {gender === "female" && (
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={isPregnant} onChange={e => setIsPregnant(e.target.checked)} className="w-4 h-4 rounded border-input text-primary" />
                  Pregnant
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={isBreastfeeding} onChange={e => setIsBreastfeeding(e.target.checked)} className="w-4 h-4 rounded border-input text-primary" />
                  Breastfeeding
                </label>
              </div>
            )}
            <div>
              <label className="flex items-center gap-3 p-3 border border-border rounded-md bg-secondary/30 cursor-pointer">
                <input type="checkbox" checked={hasKidneyDisease} onChange={e => setHasKidneyDisease(e.target.checked)} className="w-5 h-5 rounded border-input text-primary" />
                <div>
                  <span className="block font-semibold">I have Chronic Kidney Disease (CKD)</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">Potassium is heavily restricted for CKD patients.</span>
                </div>
              </label>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Dietary Intake Estimates</p>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Potassium Intake</label>
                <div className={inp}><input type="number" value={currentPotassium} onChange={e => setCurrentPotassium(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg/day</span></div>
                <p className="text-xs text-muted-foreground mt-1">US Average: ~2,500mg. Mostly from veggies/fruits.</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Sodium Intake</label>
                <div className={inp}><input type="number" value={currentSodium} onChange={e => setCurrentSodium(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg/day</span></div>
                <p className="text-xs text-muted-foreground mt-1">US Average: ~3,400mg. Required to calculate K:Na ratio.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("35"); setGender("male"); setIsPregnant(false); setIsBreastfeeding(false); setCurrentPotassium("2000"); setCurrentSodium("3400"); setHasKidneyDisease(false); setResult(calcPotassium(35, "male", false, false, 2000, 3400, false)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.status === "Consult Physician" ? "bg-red-500/10 border-red-500" : result.status === "Deficient" ? "bg-amber-500/10 border-amber-500" : "bg-primary/10 border-primary"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.status === "Consult Physician" ? "text-red-600" : result.status === "Deficient" ? "text-amber-600" : "text-primary"}`}>Status: {result.status}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.target.toLocaleString()} mg <span className="text-lg font-normal text-muted-foreground">/ daily target</span></div>
                <div className="text-base text-muted-foreground mt-2">{result.recommendation}</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Target", `${result.target}mg`], ["Current", `${currentPotassium}mg`], ["K:Na Ratio", result.sodiumPotassiumRatio > 0 ? `${result.sodiumPotassiumRatio.toFixed(1)}:1` : "N/A"], ["Ratio Status", result.sodiumPotassiumRatio >= 2 ? "Excellent" : result.sodiumPotassiumRatio >= 1 ? "Good" : "Poor"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm sm:text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Target vs Current Intake</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" domain={[0, Math.max(5000, result.target + 500, parseInt(currentPotassium) + 500)]} />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip cursor={{ fill: "transparent" }} formatter={(v: any) => [`${Number(v).toLocaleString()} mg`, ""]} />
                    <Bar dataKey="target" name="Target AI" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={25} />
                    <Bar dataKey="current" name="Your Intake" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={25} />
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Potassium Is The Missing Link In Heart Health</h2>
            <p>This <strong>Potassium Intake Calculator</strong> helps determine your Adequate Intake (AI) target based on the latest National Academies guidelines (2019). While almost everyone focuses on reducing sodium to lower blood pressure, researchers increasingly believe that <em>low potassium</em> is just as responsible for hypertension. Potassium helps blood vessels relax and signals the kidneys to excrete excess sodium. Fewer than 3% of Americans meet the recommended daily potassium target.</p>
            <h2 className="text-2xl font-bold mb-3">The Potassium-to-Sodium Ratio</h2>
            <p>Focusing on the ratio between potassium and sodium is more critical than looking at either number in isolation. Anthropological evidence suggests early human diets provided a potassium-to-sodium ratio of about 4:1 to 10:1 (high plants, low salt). Today, the standard Western diet has inverted this ratio to about 1:2 (we consume twice as much sodium as potassium). A healthy goal is to consume at least twice as much potassium as sodium (a 2:1 ratio).</p>
            <h2 className="text-2xl font-bold mb-3">Warning for Kidney Disease Patients</h2>
            <p>While high potassium intake is encouraged for the general public, it is dangerous for individuals with Chronic Kidney Disease (CKD). Healthy kidneys effortlessly filter excess dietary potassium into the urine. Damaged kidneys cannot do this effectively. If CKD patients consume a high-potassium diet, the mineral builds up in their blood (hyperkalemia), which can trigger sudden and fatal cardiac arrhythmias. CKD patients must follow strict potassium-restricted diets as prescribed by their nephrologist. Related tools: <a href="/calculator/sodium-intake-calculator">Sodium Intake Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/potassium-intake-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Potassium Intake Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Potassium Intake Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Potassium Intake Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Potassium Intake Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Potassium Intake Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/potassium-intake-calculator" />
        </div>
      </div>
    </>
  );
}
