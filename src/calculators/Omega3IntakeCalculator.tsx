"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface Omega3Result {
  dailyALA: number;
  dailyEPA_DHA: number;
  totalOmega3: number;
  status: string;
  recommendation: string;
  chartData: { nutrient: string; recommended: number; userIntake: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcOmega3(
  age: number, gender: string, isPregnant: boolean, isBreastfeeding: boolean,
  currentALA: number, currentEPA_DHA: number, healthGoal: string
): Omega3Result {
  // Base ALA requirements (mg/day)
  let dailyALA = 1600; // default adult male
  if (gender === "female") {
    dailyALA = 1100;
    if (isPregnant) dailyALA = 1400;
    if (isBreastfeeding) dailyALA = 1300;
  }
  if (age < 1) dailyALA = 500;
  else if (age <= 3) dailyALA = 700;
  else if (age <= 8) dailyALA = 900;
  else if (age <= 13) {
    dailyALA = gender === "male" ? 1200 : 1000;
  }

  // Base EPA/DHA requirements (mg/day)
  let dailyEPA_DHA = 250; // minimum general health
  if (isPregnant || isBreastfeeding) dailyEPA_DHA = 300; // Needs specific DHA usually 200mg
  
  if (healthGoal === "heart") dailyEPA_DHA = 1000;
  if (healthGoal === "triglycerides") dailyEPA_DHA = 2000;
  if (healthGoal === "joint") dailyEPA_DHA = 2500;
  if (healthGoal === "brain") dailyEPA_DHA = 1000;

  const totalOmega3 = dailyALA + dailyEPA_DHA;
  const userTotal = currentALA + currentEPA_DHA;

  let status = "Adequate";
  let recommendation = "Your Omega-3 intake meets recommended guidelines.";

  if (currentEPA_DHA < dailyEPA_DHA) {
    status = "Deficient in EPA/DHA";
    recommendation = `You are consuming ${currentEPA_DHA}mg of EPA/DHA, but need at least ${dailyEPA_DHA}mg for your goal. Consider adding fatty fish or an algae/fish oil supplement.`;
  } else if (currentALA < dailyALA) {
    status = "Deficient in ALA";
    recommendation = `You are consuming ${currentALA}mg of ALA, but need at least ${dailyALA}mg. Add flaxseeds, chia seeds, or walnuts to your diet.`;
  }

  if (userTotal > 4000) {
    status = "Excessive Intake";
    recommendation = "Intakes above 4,000mg/day may increase bleeding risk or interact with medications. Consult a physician.";
  }

  const chartData = [
    { nutrient: "ALA (Plant)", recommended: dailyALA, userIntake: currentALA },
    { nutrient: "EPA+DHA (Marine)", recommended: dailyEPA_DHA, userIntake: currentEPA_DHA },
  ];

  const breakdown = [
    { label: "Target ALA (Plant-based)", value: `${dailyALA.toLocaleString()} mg/day` },
    { label: "Target EPA+DHA (Marine-based)", value: `${dailyEPA_DHA.toLocaleString()} mg/day` },
    { label: "Your Total Target", value: `${totalOmega3.toLocaleString()} mg/day` },
    { label: "Your Current ALA", value: `${currentALA.toLocaleString()} mg/day` },
    { label: "Your Current EPA+DHA", value: `${currentEPA_DHA.toLocaleString()} mg/day` },
    { label: "Status", value: status },
  ];

  const summaryStats = [
    { label: "Total Target", value: `${totalOmega3.toLocaleString()} mg/day` },
    { label: "Current Intake", value: `${userTotal.toLocaleString()} mg/day` },
    { label: "Deficit/Surplus", value: `${(userTotal - totalOmega3) >= 0 ? "+" : ""}${(userTotal - totalOmega3).toLocaleString()} mg` },
    { label: "Primary Goal", value: healthGoal.charAt(0).toUpperCase() + healthGoal.slice(1) },
  ];

  return { dailyALA, dailyEPA_DHA, totalOmega3, status, recommendation, chartData, breakdown, summaryStats };
}

export default function Omega3IntakeCalculator() {
  const [age, setAge] = useState("35");
  const [gender, setGender] = useState("male");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);
  const [currentALA, setCurrentALA] = useState("800");
  const [currentEPA_DHA, setCurrentEPA_DHA] = useState("100");
  const [healthGoal, setHealthGoal] = useState("general");
  const [result, setResult] = useState<Omega3Result | null>(null);

  const calculate = () => {
    setResult(calcOmega3(
      parseInt(age) || 35, gender, isPregnant, isBreastfeeding,
      parseInt(currentALA) || 0, parseInt(currentEPA_DHA) || 0, healthGoal
    ));
  };

  useEffect(() => { setResult(calcOmega3(35, "male", false, false, 800, 100, "general")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between ALA, EPA, and DHA?", answer: "ALA (Alpha-linolenic acid) is a plant-based Omega-3 found in flaxseeds, chia seeds, and walnuts. Your body must convert it to EPA and DHA to use it effectively, but this conversion rate is very low (usually under 5%). EPA and DHA are marine-based Omega-3s found directly in fatty fish (salmon, sardines) and algae. They provide the majority of cardiovascular and brain health benefits directly without needing conversion." },
    { question: "How much Omega-3 do I need daily?", answer: "For general health, experts recommend a minimum of 250–500mg combined EPA and DHA daily, plus 1,100mg (women) to 1,600mg (men) of ALA. However, therapeutic doses for specific conditions are higher: 1,000mg for heart disease prevention, 2,000–4,000mg for lowering triglycerides, and 1,000–2,000mg for joint inflammation (rheumatoid arthritis)." },
    { question: "What are the best food sources of Omega-3?", answer: "EPA/DHA Sources: Wild-caught salmon (1,500-2,000mg per 3oz), Sardines (1,000-1,500mg), Mackerel (1,200mg), Anchovies (1,200mg), and Algae oil (vegan source). ALA Sources: Chia seeds (5,000mg per oz), Flaxseeds (6,700mg per oz), English walnuts (2,500mg per oz), and Hemp seeds (1,700mg per oz). Note that because of the poor conversion rate, eating ALA foods alone is often not enough to achieve optimal EPA/DHA levels." },
    { question: "Can I get enough Omega-3 if I am vegan or vegetarian?", answer: "Yes, but it requires intentional supplementation. While you can easily meet your ALA needs through chia, flax, and walnuts, your EPA/DHA levels will likely remain low due to poor conversion. Vegans and vegetarians should strongly consider taking an Algal Oil supplement (derived from marine algae), which is the original source of EPA/DHA that fish eat. It provides the exact same benefits as fish oil without animal products." },
    { question: "Is it possible to take too much Omega-3?", answer: "Yes. While Omega-3s are generally safe, doses exceeding 3,000-4,000mg per day of combined EPA/DHA can thin the blood and increase bleeding risk. This is particularly dangerous if you are taking blood thinners (like Warfarin), NSAIDs, or having surgery. High doses of fish oil can also suppress immune response in some individuals. Always consult a doctor before taking high-dose supplements." },
    { question: "Why do pregnant women need extra Omega-3?", answer: "DHA is a critical structural component of the human brain, cerebral cortex, skin, and retina. During pregnancy, DHA is transferred rapidly from mother to fetus, especially during the third trimester, to support rapid brain and eye development. Guidelines recommend pregnant women consume at least 200-300mg of DHA daily to support fetal development and reduce the risk of early preterm birth." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Omega-3 Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Omega-3 Intake Calculator</h1>
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
              <label className="text-base font-medium mb-1.5 block">Health Goal</label>
              <select value={healthGoal} onChange={e => setHealthGoal(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                <option value="general">General Health Maintenance</option>
                <option value="heart">Heart Health / CVD Prevention</option>
                <option value="triglycerides">Lower Triglycerides</option>
                <option value="joint">Joint Health / Arthritis</option>
                <option value="brain">Brain Health / Cognition</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Daily Intake Estimate</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">ALA (chia, flax, walnuts)</label>
                  <div className={inp}><input type="number" value={currentALA} onChange={e => setCurrentALA(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg/day</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">EPA+DHA (fish, algae, fish oil)</label>
                  <div className={inp}><input type="number" value={currentEPA_DHA} onChange={e => setCurrentEPA_DHA(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg/day</span></div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("35"); setGender("male"); setIsPregnant(false); setIsBreastfeeding(false); setCurrentALA("800"); setCurrentEPA_DHA("100"); setHealthGoal("general"); setResult(calcOmega3(35, "male", false, false, 800, 100, "general")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.status.includes("Deficient") ? "bg-amber-500/10 border-amber-500" : result.status === "Excessive Intake" ? "bg-red-500/10 border-red-500" : "bg-green-500/10 border-green-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.status.includes("Deficient") ? "text-amber-600" : result.status === "Excessive Intake" ? "text-red-600" : "text-green-600"}`}>Status: {result.status}</div>
                <div className="text-3xl font-extrabold text-foreground tracking-tight">{result.totalOmega3.toLocaleString()} mg <span className="text-lg font-normal text-muted-foreground">Daily Target</span></div>
                <div className="text-base text-muted-foreground mt-2">{result.recommendation}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Target ALA", `${result.dailyALA}mg`], ["Current ALA", `${currentALA}mg`], ["Target EPA/DHA", `${result.dailyEPA_DHA}mg`], ["Current EPA/DHA", `${currentEPA_DHA}mg`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm sm:text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Target vs Current Intake</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="nutrient" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`${v} mg`, ""]} />
                    <Bar dataKey="recommended" name="Target Goal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="userIntake" name="Your Intake" fill="#22c55e" radius={[4, 4, 0, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">Understanding Omega-3 Fatty Acids</h2>
            <p>This <strong>Omega-3 intake calculator</strong> determines your recommended daily requirement for both ALA (plant-based) and EPA/DHA (marine-based) Omega-3 fatty acids based on age, sex, and specific health goals. Omega-3s are essential polyunsaturated fats, meaning your body cannot produce them from scratch — they must be obtained through diet or supplementation.</p>
            <h2 className="text-2xl font-bold mb-3">The Importance of EPA and DHA vs ALA</h2>
            <p>The most critical distinction in Omega-3 nutrition is between ALA (alpha-linolenic acid) and EPA/DHA (eicosapentaenoic acid and docosahexaenoic acid). Plant sources like flax, chia, and walnuts contain ALA. While ALA is essential, your body actually needs EPA and DHA to reduce inflammation, support cardiovascular health, and maintain brain function. The body converts ALA to EPA/DHA at a very poor rate (typically less than 5%). Therefore, relying solely on plant sources is often insufficient for optimal health, which is why fatty fish or algae-oil supplements are highly recommended.</p>
            <h2 className="text-2xl font-bold mb-3">Therapeutic Dosing for Health Goals</h2>
            <p>While general health requires about 250-500mg of EPA/DHA daily, therapeutic doses are significantly higher. The American Heart Association recommends 1,000mg daily for patients with coronary heart disease, and 2,000-4,000mg for patients attempting to lower high triglyceride levels. High doses of EPA/DHA have also shown efficacy in reducing joint stiffness in rheumatoid arthritis patients. Related health calculators: <a href="/calculator/macro-calculator">Macro Calculator</a>, <a href="/calculator/tdee-calculator">TDEE Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/omega-3-calculator" />
          <PopularCalculators exclude="/calculator/omega-3-calculator" />
        </div>
      </div>
    </>
  );
}
