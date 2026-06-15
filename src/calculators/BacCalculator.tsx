"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Wine } from "lucide-react";

const BacCalculator = () => {
  const [weight, setWeight] = useState("160");
  const [gender, setGender] = useState("male");
  const [drinks, setDrinks] = useState("3"); // standard drinks
  const [hours, setHours] = useState("2");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const d = parseFloat(drinks);
    const h = parseFloat(hours);

    if (w <= 0) return;

    // Widmark Formula
    // BAC = (A * 5.14 / W * r) - 0.015 * H
    // A = liquid ounces of alcohol. A standard drink has 0.6 oz of pure alcohol.
    const A = d * 0.6;
    const r = gender === "male" ? 0.73 : 0.66; // Distribution ratio

    let bac = ((A * 5.14) / (w * r)) - (0.015 * h);
    if (bac < 0) bac = 0;

    // Time to sober
    // The body metabolizes alcohol at roughly 0.015 BAC per hour
    const hoursToZero = bac / 0.015;

    let impairment = "";
    let color = "";

    if (bac === 0) { impairment = "Sober"; color = "green"; }
    else if (bac < 0.04) { impairment = "Mild Relaxation"; color = "blue"; }
    else if (bac < 0.08) { impairment = "Buzzed / Impaired"; color = "yellow"; }
    else if (bac < 0.15) { impairment = "Legally Intoxicated"; color = "orange"; }
    else if (bac < 0.30) { impairment = "Severely Intoxicated"; color = "red"; }
    else { impairment = "Danger / Alcohol Poisoning Risk"; color = "red"; }

    setResults({ 
      bac: bac.toFixed(3),
      impairment,
      color,
      hoursToZero: hoursToZero.toFixed(1)
    });
  };

  const reset = () => {
    setShowResults(false); setWeight("160"); setGender("male"); setDrinks("3"); setHours("2"); setResults(null); };

  const faqs = [
    { question: "What is a standard drink?", answer: "In the United States, a standard drink contains about 14 grams (0.6 ounces) of pure alcohol. This is generally found in 12 ounces of regular beer (5%), 5 ounces of wine (12%), or 1.5 ounces of distilled spirits (40%)." },
    { question: "Why do women get intoxicated faster than men?", answer: "Women typically have less body water than men of similar body weight, meaning the same amount of alcohol becomes more highly concentrated in a woman's blood." },
    { question: "Can I speed up sobering up?", answer: "No. The human liver metabolizes alcohol at a constant rate of approximately 0.015 BAC per hour. Coffee, cold showers, or drinking water will not speed up alcohol elimination, though water can help prevent hangovers." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "BAC Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Blood Alcohol Content (BAC) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="wt" label="Weight (lbs)" value={weight} onChange={setWeight} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="input-calc">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <InputField id="drinks" label="Standard Drinks" value={drinks} onChange={setDrinks} />
                <InputField id="hrs" label="Hours Since First Drink" value={hours} onChange={setHours} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Wine className="h-5 w-5" /> Calculate BAC</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Intoxication Estimate</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated BAC</p>
                    <p className="text-5xl font-black text-foreground">{results.bac}%</p>
                  </div>
                  <div className={`p-6 rounded-2xl text-center flex flex-col justify-center border 
                    ${results.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-600' : 
                      results.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : 
                      results.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' : 
                      results.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' : 
                      'bg-green-500/10 border-green-500/20 text-green-600'}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1">Impairment Level</p>
                    <p className="text-2xl font-black">{results.impairment}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Legal Limit (US)", value: 0, textValue: "0.08%" },
                  { label: "Estimated Time to 0.00% BAC", value: 0, textValue: `${results.hoursToZero} Hours` },
                ]} />
                <div className="mt-6 p-4 bg-secondary/20 border border-border rounded-xl text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> This calculator provides an estimate based on averages. Actual BAC can vary wildly based on genetics, food intake, and liver health. Never rely on a calculator to determine if it is safe to drive.
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>How Alcohol is Metabolized</h2>
              <p>When you consume alcohol, it passes through the stomach and small intestine directly into your bloodstream. Because it is a toxin, your liver immediately begins producing enzymes (alcohol dehydrogenase) to break it down. However, the liver can only process a finite amount of alcohol per hour (roughly one standard drink).</p>
              <h3>The Danger of Binge Drinking</h3>
              <p>If you consume alcohol faster than your liver can break it down, the excess alcohol remains in your bloodstream, causing your BAC to rise. Binge drinking (4+ drinks in two hours for women, 5+ for men) causes BAC to spike rapidly into dangerous territory.</p>
              <h3>Why Food Matters</h3>
              <p>Drinking on an empty stomach allows alcohol to pass immediately into the small intestine, where absorption is incredibly fast. Eating a large meal before drinking slows gastric emptying, significantly flattening the curve of your BAC spike.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bac" />
          <PopularCalculators exclude="/calculator/bac-calculator" />
        </div>
      </div>
    </>
  );
};
export default BacCalculator;

