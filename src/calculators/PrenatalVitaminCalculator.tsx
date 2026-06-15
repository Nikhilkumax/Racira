"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Apple } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface VitaminResult {
  folicAcidTarget: number;
  ironTarget: number;
  calciumTarget: number;
  dhaTarget: number;
  status: string;
  recommendation: string;
  chartData: { name: string; target: number; current: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPrenatalVitamins(
  trimester: string, twins: boolean, dietaryStyle: string,
  anemiaRisk: boolean, currentFolic: number, currentIron: number, currentDha: number
): VitaminResult {
  
  // Base ACOG / WHO Guidelines for Pregnancy
  let folicAcidTarget = 600; // mcg (often 400mcg before pregnancy, 600 during)
  let ironTarget = 27; // mg
  let calciumTarget = 1000; // mg
  let dhaTarget = 200; // mg

  // Adjustments based on Trimester
  if (trimester === "preconception") {
    folicAcidTarget = 400;
    ironTarget = 18; // Normal adult female requirement
  }

  // Adjustments for Twins/Multiples
  if (twins) {
    folicAcidTarget = 1000; // Some doctors recommend 1mg (1000mcg)
    ironTarget += 30; // Increased blood volume needs
    calciumTarget += 500;
    dhaTarget += 100;
  }

  // Diet Adjustments
  if (dietaryStyle === "vegan" || dietaryStyle === "vegetarian") {
    // Vegans absorb non-heme iron poorly, need more
    ironTarget = Math.round(ironTarget * 1.5);
    // DHA is primarily in fish
    dhaTarget = Math.max(dhaTarget, 300);
  }

  // Medical conditions
  if (anemiaRisk) {
    ironTarget = twins ? 60 : Math.max(ironTarget, 60); // Therapeutic dose often prescribed
  }

  // Status calculation
  let status = "Adequate Intake";
  let recommendation = "Your current intake looks adequate based on general guidelines. Always confirm with your OB-GYN.";

  if (currentFolic < folicAcidTarget) {
    status = "Deficient (Folic Acid)";
    recommendation = `You are under the recommended ${folicAcidTarget}mcg of Folic Acid. Folic acid is critical in the first 28 days of pregnancy to prevent neural tube defects.`;
  } else if (currentIron < ironTarget && trimester !== "preconception") {
    status = "Deficient (Iron)";
    recommendation = `You are under the recommended ${ironTarget}mg of Iron. Your blood volume increases by 50% during pregnancy; adequate iron prevents maternal anemia and low birth weight.`;
  } else if (currentDha < dhaTarget) {
    status = "Deficient (DHA)";
    recommendation = `You are under the recommended ${dhaTarget}mg of DHA. DHA is an Omega-3 fatty acid crucial for fetal brain and eye development, especially in the 3rd trimester.`;
  }

  const chartData = [
    { name: "Folic Acid (mcg)", target: folicAcidTarget, current: currentFolic },
    { name: "Iron (mg)", target: ironTarget, current: currentIron },
    { name: "DHA (mg)", target: dhaTarget, current: currentDha },
  ];

  const breakdown = [
    { label: "Folic Acid / Folate", value: `${folicAcidTarget} mcg daily` },
    { label: "Iron", value: `${ironTarget} mg daily` },
    { label: "Calcium", value: `${calciumTarget} mg daily` },
    { label: "DHA (Omega-3)", value: `${dhaTarget} mg daily` },
    { label: "Phase", value: trimester.charAt(0).toUpperCase() + trimester.slice(1) },
  ];

  const summaryStats = [
    { label: "Folic Target", value: `${folicAcidTarget} mcg` },
    { label: "Iron Target", value: `${ironTarget} mg` },
    { label: "DHA Target", value: `${dhaTarget} mg` },
    { label: "Status", value: status },
  ];

  return { folicAcidTarget, ironTarget, calciumTarget, dhaTarget, status, recommendation, chartData, breakdown, summaryStats };
}

export default function PrenatalVitaminCalculator() {
  const [trimester, setTrimester] = useState("first");
  const [diet, setDiet] = useState("omnivore");
  const [twins, setTwins] = useState(false);
  const [anemiaRisk, setAnemiaRisk] = useState(false);
  
  const [curFolic, setCurFolic] = useState("800");
  const [curIron, setCurIron] = useState("27");
  const [curDha, setCurDha] = useState("0");

  const [result, setResult] = useState<VitaminResult | null>(null);

  const calculate = () => {
    setResult(calcPrenatalVitamins(
      trimester, twins, diet, anemiaRisk,
      parseInt(curFolic) || 0, parseInt(curIron) || 0, parseInt(curDha) || 0
    ));
  };

  useEffect(() => { setResult(calcPrenatalVitamins("first", false, "omnivore", false, 800, 27, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why is Folic Acid so important?", answer: "Folic acid (Vitamin B9) is crucial for the proper closing of the fetal neural tube, which eventually becomes the brain and spinal cord. Neural tube defects occur within the first 28 days of pregnancy—often before a woman even knows she is pregnant. This is why it is recommended to take at least 400mcg daily during the preconception phase." },
    { question: "Why does the Iron requirement jump so high?", answer: "During pregnancy, a woman's blood volume increases by up to 50% to supply oxygen to the growing fetus. Your body requires massive amounts of iron to produce this extra hemoglobin. The requirement jumps from 18mg (preconception) to 27mg during pregnancy. If you do not consume enough, you will develop iron-deficiency anemia, causing severe fatigue." },
    { question: "Are gummy prenatal vitamins okay?", answer: "Gummy vitamins are a great option for women suffering from severe nausea or 'morning sickness' who cannot swallow large pills. However, gummies almost never contain Iron or Calcium because those minerals are difficult to mask in a sweet gummy. If you take gummies, you will likely need a separate iron supplement in your 2nd and 3rd trimesters." },
    { question: "What is DHA and do I need it?", answer: "DHA is an Omega-3 fatty acid essential for fetal brain and eye development. It is naturally found in low-mercury fish (like salmon). Many standard prenatal vitamins do not contain DHA. If you do not eat fish regularly, you should ensure your prenatal contains at least 200mg of DHA, or take a separate algae-based or fish-oil DHA supplement." },
    { question: "Can I take too much of a vitamin?", answer: "Yes. While water-soluble vitamins (like Vitamin C and B-complex) are flushed out in your urine if you take too much, fat-soluble vitamins (Vitamins A, D, E, K) are stored in your liver. High doses of Vitamin A, in particular, can be toxic and cause birth defects. Stick to standard prenatal formulations rather than trying to piece together individual high-dose vitamins." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Prenatal Vitamin Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Prenatal Vitamin Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Pregnancy Phase</label>
              <select value={trimester} onChange={e => setTrimester(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                <option value="preconception">Preconception (Trying to conceive)</option>
                <option value="first">First Trimester (0-13 Weeks)</option>
                <option value="second">Second Trimester (14-26 Weeks)</option>
                <option value="third">Third Trimester (27-40+ Weeks)</option>
              </select>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Dietary Style</label>
              <select value={diet} onChange={e => setDiet(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                <option value="omnivore">Omnivore (Eats meat/fish)</option>
                <option value="vegetarian">Vegetarian (No meat, eats dairy/eggs)</option>
                <option value="vegan">Vegan (No animal products)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-2 border border-border rounded-md bg-secondary/30 cursor-pointer">
                <input type="checkbox" checked={twins} onChange={e => setTwins(e.target.checked)} className="w-4 h-4 rounded border-input text-primary" />
                <span className="text-sm font-semibold">Twins / Multiples</span>
              </label>
              <label className="flex items-center gap-2 p-2 border border-border rounded-md bg-secondary/30 cursor-pointer">
                <input type="checkbox" checked={anemiaRisk} onChange={e => setAnemiaRisk(e.target.checked)} className="w-4 h-4 rounded border-input text-primary" />
                <span className="text-sm font-semibold">History of Anemia</span>
              </label>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Apple className="w-4 h-4" /> Current Supplement Intake</p>
              <p className="text-xs text-muted-foreground mb-3">Check the nutrition label on your current prenatal vitamin.</p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Folic Acid / Folate</label>
                  <div className={inp}><input type="number" value={curFolic} onChange={e => setCurFolic(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mcg</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Iron</label>
                  <div className={inp}><input type="number" value={curIron} onChange={e => setCurIron(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">DHA / Omega-3</label>
                  <div className={inp}><input type="number" value={curDha} onChange={e => setCurDha(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Analyze Nutrients
              </button>
              <button onClick={() => { setTrimester("first"); setDiet("omnivore"); setTwins(false); setAnemiaRisk(false); setCurFolic("800"); setCurIron("27"); setCurDha("0"); setResult(calcPrenatalVitamins("first", false, "omnivore", false, 800, 27, 0)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.status.includes("Deficient") ? "bg-amber-500/10 border-amber-500" : "bg-primary/10 border-primary"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.status.includes("Deficient") ? "text-amber-600" : "text-primary"}`}>Evaluation: {result.status}</div>
                <div className="text-base font-medium text-foreground">{result.recommendation}</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {result.breakdown.slice(0, 4).map((b, i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{b.label} Target</div>
                    <div className="text-sm font-bold text-primary">{b.value.replace(' daily', '')}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Your Intake vs. Required Targets</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "var(--secondary)" }} />
                    <Bar dataKey="target" name="Recommended Target" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="current" name="Your Current Intake" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between border-b border-border/50 pb-1 last:border-0"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Demystifying Prenatal Vitamins</h2>
            <p>This <strong>Prenatal Vitamin Calculator</strong> compares your current supplement stack against guidelines from the American College of Obstetricians and Gynecologists (ACOG). While a balanced diet is the best source of nutrients, the massive physical demands of building a new human require supplementation. The "big three" nutrients you must monitor are Folic Acid, Iron, and DHA.</p>
            <h2>Gummy Vitamins: The Hidden Trap</h2>
            <p>Many women switch to gummy prenatal vitamins in the first trimester because large pills trigger nausea. What many don't realize is that <strong>gummy vitamins almost never contain Iron</strong>. The metallic taste of iron is incredibly difficult to mask in a sweet gummy, and iron poses a toxicity risk to young children who might mistake the gummies for candy. If you take gummies during your 2nd and 3rd trimesters, you will likely need a separate iron pill to prevent maternal anemia.</p>
            <h2>Dietary Adjustments</h2>
            <p>If you eat a plant-based (vegan or vegetarian) diet, your nutrient targets shift. Plant-based (non-heme) iron is absorbed much less efficiently than meat-based (heme) iron, meaning vegans need to consume nearly 1.5 times the standard iron target. Furthermore, DHA is primarily found in marine life. Vegans should seek out an algae-based DHA supplement to ensure proper fetal brain development. Related tools: <a href="/calculator/pregnancy-calculator">Pregnancy Calculator</a>, <a href="/calculator/fetal-weight-calculator">Fetal Weight Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/prenatal-vitamin-calculator" />
          <PopularCalculators exclude="/calculator/prenatal-vitamin-calculator" />
        </div>
      </div>
    </>
  );
}
