"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Fish } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Omega3Result {
  epaDhaTarget: string;
  alaTarget: string;
  epaDhaMax: number;
  alaMax: number;
  category: string;
  breakdown: { label: string; value: string }[];
  chartData: any[];
  summaryStats: { label: string; value: string }[];
}

function calcOmega3(sex: string, lifeStage: string, goal: string): Omega3Result {
  let epaDhaMin = 0;
  let epaDhaMax = 0;
  let alaTarget = 0;

  // ALA (Alpha-linolenic acid) targets based on NIH guidelines
  if (sex === "male") {
    alaTarget = 1.6;
  } else {
    if (lifeStage === "pregnancy") alaTarget = 1.4;
    else if (lifeStage === "lactation") alaTarget = 1.3;
    else alaTarget = 1.1; // Standard female adult
  }

  // EPA + DHA targets based on clinical goals
  let category = "";
  if (goal === "general") {
    epaDhaMin = 250;
    epaDhaMax = 500;
    category = "General Health Maintenance";
    if (lifeStage === "pregnancy" || lifeStage === "lactation") {
      epaDhaMin = 300; // Minimum required for fetal brain dev (specifically DHA)
      epaDhaMax = 600;
      category = "Maternal / Fetal Development";
    }
  } else if (goal === "heart") {
    epaDhaMin = 1000;
    epaDhaMax = 1000;
    category = "Cardiovascular Support (CHD)";
  } else if (goal === "triglycerides") {
    epaDhaMin = 2000;
    epaDhaMax = 4000;
    category = "Triglyceride Reduction";
  }

  const epaDhaString = epaDhaMin === epaDhaMax ? `${epaDhaMin} mg/day` : `${epaDhaMin} - ${epaDhaMax} mg/day`;

  const breakdown = [
    { label: "Clinical Goal", value: category },
    { label: "Biological Profile", value: lifeStage !== "adult" ? `Female (${lifeStage})` : sex === "male" ? "Adult Male" : "Adult Female" },
    { label: "Marine Source (EPA + DHA)", value: epaDhaString },
    { label: "Plant Source (ALA)", value: `${alaTarget.toFixed(1)} g/day` },
    { label: "Safe Upper Limit (EPA+DHA)", value: "5000 mg/day (FDA)" },
  ];

  const summaryStats = [
    { label: "EPA + DHA", value: epaDhaString },
    { label: "Plant ALA", value: `${alaTarget.toFixed(1)} g` },
    { label: "Focus", value: goal === "general" ? "Maintenance" : "Therapeutic" },
    { label: "Toxicity Limit", value: "5000 mg" },
  ];

  // Chart data comparing recommendation vs average western diet
  // Avg western diet: EPA+DHA ~ 100mg, ALA ~ 1.5g
  const avgEpaDha = 100;
  
  const chartData = [
    { name: "Target (Min)", amount: epaDhaMin, fill: "#3b82f6" },
    { name: "Target (Max)", amount: epaDhaMax > epaDhaMin ? epaDhaMax : epaDhaMin, fill: "#2563eb" },
    { name: "Avg Diet", amount: avgEpaDha, fill: "#ef4444" },
  ];

  // If Target Min and Target Max are the same, simplify the chart
  if (epaDhaMin === epaDhaMax) {
    chartData.splice(1, 1); // remove max
    chartData[0].name = "Daily Target";
  }

  return { epaDhaTarget: epaDhaString, alaTarget: `${alaTarget.toFixed(1)} g/day`, epaDhaMax, alaMax: alaTarget, category, breakdown, chartData, summaryStats };
}

export default function Omega3Calculator() {
  const [sex, setSex] = useState("male");
  const [lifeStage, setLifeStage] = useState("adult"); // adult, pregnancy, lactation
  const [goal, setGoal] = useState("general"); // general, heart, triglycerides
  const [result, setResult] = useState<Omega3Result | null>(null);

  const calculate = () => {
    setResult(calcOmega3(sex, lifeStage, goal));
  };

  useEffect(() => { setResult(calcOmega3("male", "adult", "general")); }, []);

  const faqs = [
    { question: "What is the difference between EPA, DHA, and ALA?", answer: "EPA and DHA are 'marine' Omega-3s found primarily in fatty fish and algae. They are biologically active and instantly utilized by the body to reduce inflammation and support brain health. ALA is a 'plant' Omega-3 found in flaxseeds, walnuts, and chia seeds. The human body must convert ALA into EPA and DHA to use it, but this conversion process is extremely inefficient (often less than 5%). Therefore, relying solely on ALA is generally insufficient for optimal health." },
    { question: "Why are the recommendations for High Triglycerides so large?", answer: "While 250mg to 500mg of EPA/DHA is sufficient to prevent a deficiency in healthy adults, clinical trials have proven that 'mega-dosing' Omega-3s acts as a powerful pharmaceutical agent. Doses between 2,000mg and 4,000mg per day have been clinically shown to lower circulating triglyceride levels by 20% to 30%, significantly reducing the risk of acute pancreatitis and cardiovascular events." },
    { question: "Do I need to take a supplement to hit these targets?", answer: "Not necessarily, but it depends on your goal. For 'General Health' (250-500mg), eating two 4-ounce servings of fatty fish (like wild salmon, mackerel, or sardines) per week will easily fulfill your requirement. However, if your goal is 'Triglyceride Reduction' (4,000mg/day), you would need to eat enormous amounts of fish daily, which carries a risk of heavy metal toxicity. In therapeutic cases, highly purified fish oil supplements are recommended." },
    { question: "Why do pregnant women have specific DHA requirements?", answer: "DHA is a primary structural component of the human brain, cerebral cortex, skin, and retina. During the third trimester, the fetus rapidly accumulates DHA for neurological development. If the mother's diet is deficient, the fetus will literally strip DHA from the mother's own brain reserves (contributing to 'pregnancy brain'). A minimum of 300mg of EPA+DHA (with at least 200mg being pure DHA) is recommended daily." },
    { question: "Is it possible to take too much Omega-3?", answer: "Yes. Omega-3 fatty acids naturally thin the blood. The FDA has set a Safe Upper Limit of 5,000 mg (5 grams) per day of combined EPA and DHA. Exceeding this amount can suppress immune function and significantly increase the risk of internal bleeding, especially if you are already taking blood-thinning medications like Warfarin or Aspirin." },
    { question: "How do I read a fish oil supplement label?", answer: "This is a critical skill. A bottle might say '1,000 mg Fish Oil' on the front, but that refers to the total weight of the oil, NOT the active ingredients. You must turn the bottle over and look at the Nutrition Facts panel. Add the specific amounts of 'EPA' and 'DHA' together. Often, a 1,000mg pill only contains 300mg of actual EPA+DHA, meaning you would need to take four pills a day to hit a therapeutic target." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Omega 3 Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Omega 3 Dosage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
              <div className="grid grid-cols-2 gap-2">
                {["male", "female"].map(s => (
                  <button key={s} onClick={() => { setSex(s); if(s==="male") setLifeStage("adult"); }} className={`h-10 rounded-md border text-base font-medium capitalize transition-colors ${sex === s ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border bg-background hover:bg-secondary"}`}>{s}</button>
                ))}
              </div>
            </div>

            {sex === "female" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Life Stage</label>
                <select value={lifeStage} onChange={e => setLifeStage(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-base shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="adult">Standard Adult</option>
                  <option value="pregnancy">Pregnancy (Fetal Development)</option>
                  <option value="lactation">Lactation (Breastfeeding)</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Primary Health Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-base shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="general">General Health & Maintenance</option>
                <option value="heart">Cardiovascular Support (History of CHD)</option>
                <option value="triglycerides">Therapeutic: High Triglycerides</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Select therapeutic targets only if directed by a physician.</p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Fish className="h-4 w-4" /> Calculate Requirement
              </button>
              <button onClick={() => { setSex("male"); setLifeStage("adult"); setGoal("general"); setResult(calcOmega3("male", "adult", "general")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="rounded-lg p-5 shadow-sm border-l-4 border-primary bg-primary/5">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Marine Target (EPA + DHA)</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.epaDhaTarget}</div>
                </div>
                <div className="text-sm font-semibold mt-1 text-primary">{result.category}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[["Marine (EPA+DHA)", result.epaDhaTarget], ["Plant (ALA)", result.alaTarget]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Requirement Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "font-bold text-foreground border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">EPA + DHA: Target vs. Average Diet</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} mg`, "EPA+DHA"]} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">The average Western diet is highly deficient in marine Omega-3s.</p>
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
            <h2>Understanding Omega-3 Fatty Acids</h2>
            <p>Omega-3 fatty acids are "essential" fats. Unlike saturated fats or cholesterol, the human body lacks the enzymes required to produce Omega-3s from scratch. Therefore, you must obtain them directly through your diet or via supplementation. They play a critical structural role in the cell membranes of every tissue in your body, particularly in the brain, retina, and cardiovascular system.</p>
            <p>While the supplement industry often groups all Omega-3s together, from a clinical perspective, they are absolutely not equal. There are three primary types of Omega-3 fatty acids, separated into "Marine" and "Plant" sources:</p>

            <h3>1. EPA (Eicosapentaenoic Acid) - Marine Source</h3>
            <p>EPA is biologically active and is the body's primary weapon against cellular inflammation. It acts as a precursor to signaling molecules called eicosanoids, which actively reduce inflammation throughout the cardiovascular system. Clinical trials consistently show that high doses of EPA significantly lower the risk of coronary heart disease and reduce blood triglyceride levels.</p>

            <h3>2. DHA (Docosahexaenoic Acid) - Marine Source</h3>
            <p>DHA is a structural powerhouse. It constitutes roughly 40% of the polyunsaturated fatty acids in your brain and 60% in your retina. It is crucial for neurological function, cognitive preservation as you age, and maternal fetal development. Like EPA, it is biologically active and instantly utilized by the body.</p>

            <h3>3. ALA (Alpha-Linolenic Acid) - Plant Source</h3>
            <p>ALA is the most common Omega-3 found in the Western diet, abundant in flaxseeds, chia seeds, walnuts, and canola oil. However, <strong>ALA is not biologically active.</strong> To utilize it, your liver must convert ALA into EPA and DHA. This conversion process is extremely inefficient. Studies show that only 1-10% of ALA is successfully converted into EPA, and less than 0.5% is converted into DHA. Therefore, while ALA is healthy, you cannot rely on plant sources alone to meet your cardiovascular or neurological EPA/DHA requirements.</p>

            <h2>How The Calculator Determines Your Dosage</h2>
            <p>Because the conversion of ALA is so poor, clinical guidelines separate your Omega-3 requirements into two distinct targets: a Plant Target (ALA) and a Marine Target (EPA + DHA).</p>

            <h3>The Plant Target (ALA)</h3>
            <p>The National Institutes of Health (NIH) has established baseline Adequate Intakes for ALA based purely on biological sex and life stage. Adult males require 1.6 grams per day, while adult females require 1.1 grams per day. During pregnancy and lactation, female requirements increase to 1.4g and 1.3g, respectively, to support the metabolic demands of the fetus/infant.</p>

            <h3>The Marine Target (EPA + DHA)</h3>
            <p>Your EPA + DHA requirement is highly dynamic and depends entirely on your current state of health and your clinical goals.</p>
            
            <p><strong>General Health & Maintenance (250 - 500 mg/day):</strong> For a healthy adult with no history of cardiovascular disease, consuming 250 to 500 mg of combined EPA and DHA per day is sufficient to prevent deficiency and maintain normal cellular function. This target is easily achieved by eating two servings of fatty fish per week.</p>
            
            <p><strong>Maternal & Fetal Development (300 - 600 mg/day):</strong> During pregnancy, the fetus requires massive amounts of DHA to build its brain and nervous system. If the mother does not consume enough, the fetus will extract DHA directly from the mother's brain tissue. Obstetricians recommend a minimum of 300 mg of EPA/DHA daily, ensuring that at least 200 mg is pure DHA.</p>
            
            <p><strong>Cardiovascular Support (1,000 mg/day):</strong> The American Heart Association (AHA) recommends that patients with documented coronary heart disease (CHD) consume exactly 1 gram (1,000 mg) of EPA and DHA daily. This therapeutic dose helps prevent arrhythmias, slows the growth of atherosclerotic plaque, and slightly lowers blood pressure.</p>
            
            <p><strong>Triglyceride Reduction (2,000 - 4,000 mg/day):</strong> High triglycerides (fat in the blood) drastically increase the risk of heart attacks and acute pancreatitis. The FDA has approved prescription "mega-doses" of Omega-3s (up to 4 grams a day) as a pharmaceutical treatment for hypertriglyceridemia. At these massive doses, EPA and DHA inhibit the liver from synthesizing triglycerides, lowering blood levels by 20% to 30%. Because this requires taking multiple pills a day, it should only be done under a doctor's supervision.</p>

            <h2>How to Read a Fish Oil Supplement Label</h2>
            <p>The supplement industry is notorious for misleading labeling regarding Omega-3s. A massive label screaming "1,200 mg Fish Oil!" on the front of the bottle is virtually meaningless. That number refers to the total weight of the oil inside the capsule, not the active ingredients.</p>
            <p>To determine if a supplement is actually effective, you must turn the bottle over and look at the "Supplement Facts" panel. Look for the specific lines labeled <strong>EPA</strong> and <strong>DHA</strong>. Add those two numbers together.</p>
            <p>For example, a cheap "1,000 mg" fish oil pill might only contain 180 mg of EPA and 120 mg of DHA. That means you are only getting 300 mg of active Omega-3s, and 700 mg of useless "filler" fat. If your cardiologist told you to take 2,000 mg for your triglycerides, you would have to swallow <em>seven</em> of those cheap pills every single day. Always buy highly concentrated supplements where the EPA+DHA content makes up at least 60% of the total pill weight.</p>

            <h2>Toxicity and the Safe Upper Limit</h2>
            <p>Can you overdose on Omega-3s? Yes. Because EPA and DHA actively reduce platelet aggregation (they make your blood less sticky), consuming massive doses acts as a blood thinner.</p>
            <p>The FDA has established a Safe Upper Limit of 5,000 mg (5 grams) per day of combined EPA and DHA. Exceeding this amount can suppress your immune system and significantly increase the risk of severe bleeding episodes. If you are already taking pharmaceutical blood thinners (like Warfarin, Plavix, or even daily Aspirin), you must consult your doctor before starting high-dose Omega-3 therapy, as the compounding blood-thinning effects can be fatal.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/omega-3-calculator" />
          <PopularCalculators exclude="/calculator/omega-3-calculator" />
        </div>
      </div>
    </>
  );
}
