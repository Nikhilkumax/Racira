"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const GfrCalculator = () => {
  const [creatinine, setCreatinine] = useState("1.1");
  const [age, setAge] = useState("45");
  const [gender, setGender] = useState("male");
  const [race, setRace] = useState("non-black"); // Keeping historical context but noting CKD-EPI 2021 update

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cr = parseFloat(creatinine);
    const a = parseInt(age);

    if (cr <= 0 || a <= 0) return;

    // CKD-EPI 2021 (Race-free equation recommended by NKF and ASN)
    // Formula components
    const k = gender === "female" ? 0.7 : 0.9;
    const alpha = gender === "female" ? -0.241 : -0.302;
    const min = Math.min(cr / k, 1);
    const max = Math.max(cr / k, 1);

    const genderMultiplier = gender === "female" ? 1.012 : 1.0;

    const gfr2021 = 142 * Math.pow(min, alpha) * Math.pow(max, -1.200) * Math.pow(0.9938, a) * genderMultiplier;

    // CKD-EPI 2009 (Older equation that included race, for comparison if needed, but we'll focus on 2021)
    // We'll calculate it just to show the difference or historical data if they selected race
    const alpha2009 = gender === "female" ? -0.329 : -0.411;
    const genderMult2009 = gender === "female" ? 1.018 : 1;
    const raceMult2009 = race === "black" ? 1.159 : 1;
    const gfr2009 = 141 * Math.pow(min, alpha2009) * Math.pow(max, -1.209) * Math.pow(0.993, a) * genderMult2009 * raceMult2009;

    let stage = "";
    let color = "";

    if (gfr2021 >= 90) { stage = "Stage 1 (Normal or High)"; color = "green"; }
    else if (gfr2021 >= 60) { stage = "Stage 2 (Mildly Decreased)"; color = "yellow"; }
    else if (gfr2021 >= 45) { stage = "Stage 3a (Mild to Moderate)"; color = "orange"; }
    else if (gfr2021 >= 30) { stage = "Stage 3b (Moderate to Severe)"; color = "orange"; }
    else if (gfr2021 >= 15) { stage = "Stage 4 (Severely Decreased)"; color = "red"; }
    else { stage = "Stage 5 (Kidney Failure)"; color = "red"; }

    setResults({ 
      gfr: Math.round(gfr2021),
      stage,
      color,
      gfr2009: Math.round(gfr2009)
    });
  };

  const reset = () => {
    setShowResults(false); setCreatinine("1.1"); setAge("45"); setGender("male"); setRace("non-black"); setResults(null); };

  const faqs = [
    { question: "What is GFR?", answer: "Glomerular Filtration Rate (GFR) is the best overall index of kidney function. It estimates how much blood passes through the glomeruli (tiny filters in the kidneys) each minute." },
    { question: "What is a normal GFR?", answer: "In healthy adults, a normal GFR is 90 or higher. GFR naturally declines with age. A GFR below 60 for three months or more indicates chronic kidney disease (CKD)." },
    { question: "Why doesn't the new equation use race?", answer: "In 2021, the National Kidney Foundation and the American Society of Nephrology recommended the new CKD-EPI 2021 equation, which removes the race variable to eliminate racial disparities in kidney disease diagnosis and treatment." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "GFR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GFR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="cr" label="Serum Creatinine (mg/dL)" value={creatinine} onChange={setCreatinine} />
                <InputField id="age" label="Age" value={age} onChange={setAge} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Sex at Birth</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="input-calc">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Race (For 2009 comparison)</label>
                  <select value={race} onChange={e => setRace(e.target.value)} className="input-calc">
                    <option value="non-black">Non-Black</option>
                    <option value="black">Black</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Kidney Function Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">eGFR (CKD-EPI 2021)</p>
                    <p className="text-5xl font-black text-foreground">{results.gfr}</p>
                    <p className="text-sm text-muted-foreground mt-1">mL/min/1.73m²</p>
                  </div>
                  <div className={`p-6 rounded-2xl text-center flex flex-col justify-center border 
                    ${results.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-600' : 
                      results.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : 
                      results.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' : 
                      'bg-green-500/10 border-green-500/20 text-green-600'}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">CKD Stage</p>
                    <p className="text-xl font-black">{results.stage}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Historical 2009 eGFR", value: 0, textValue: `${results.gfr2009} mL/min/1.73m²` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding eGFR</h2>
              <p>Estimated Glomerular Filtration Rate (eGFR) is a mathematically derived number based on your serum creatinine level, age, and sex. Creatinine is a waste product from muscle breakdown that healthy kidneys filter out. If kidney function drops, creatinine levels in the blood rise.</p>
              <h3>The 2021 Equation Update</h3>
              <p>Historically, equations like the CKD-EPI 2009 included a race multiplier for Black patients based on flawed assumptions about muscle mass. This resulted in artificially higher eGFR scores for Black patients, delaying critical care and transplant listings. The medical community officially shifted to the race-free 2021 equation to ensure equitable care.</p>
              <h3>Why eGFR Fluctuates</h3>
              <p>Because the equation relies on creatinine, anything that affects muscle mass or breakdown can temporarily alter your eGFR. Heavy exercise, dehydration, large amounts of meat consumption, or certain medications can cause a temporary drop in eGFR that does not necessarily indicate chronic kidney damage.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gfr" />
          <PopularCalculators exclude="/calculator/gfr-calculator" />
        </div>
      </div>
    </>
  );
};
export default GfrCalculator;

