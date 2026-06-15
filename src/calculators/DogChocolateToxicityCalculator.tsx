"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calculator, AlertTriangle } from "lucide-react";

// Theobromine content per oz of different chocolate types (mg/oz)
const CHOCOLATE_TYPES: Record<string, { theobromine: number; caffeine: number; label: string }> = {
  white: { theobromine: 0.25, caffeine: 0.85, label: "White Chocolate" },
  milk: { theobromine: 58, caffeine: 6, label: "Milk Chocolate" },
  semisweet: { theobromine: 138, caffeine: 22, label: "Semi-Sweet / Dark Chocolate" },
  baking: { theobromine: 393, caffeine: 47, label: "Baker's / Unsweetened Chocolate" },
  cocoa_powder: { theobromine: 737, caffeine: 70, label: "Dry Cocoa Powder" },
  cacao_nibs: { theobromine: 720, caffeine: 60, label: "Raw Cacao Nibs" },
};

const DogChocolateToxicityCalculator = () => {
  const [dogWeight, setDogWeight] = useState("10");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [chocolateType, setChocolateType] = useState("milk");
  const [amountEaten, setAmountEaten] = useState("30");
  const [amountUnit, setAmountUnit] = useState("g");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let weightKg = parseFloat(dogWeight) || 0;
    if (weightUnit === "lbs") weightKg /= 2.20462;

    let amountOz = parseFloat(amountEaten) || 0;
    if (amountUnit === "g") amountOz /= 28.3495;

    if (weightKg <= 0 || amountOz <= 0) return;

    const choc = CHOCOLATE_TYPES[chocolateType];
    const theoMg = choc.theobromine * amountOz;
    const caffMg = choc.caffeine * amountOz;
    const theoPerKg = theoMg / weightKg;

    // Toxicity thresholds (mg/kg theobromine)
    // < 20 mg/kg: Mild (GI upset)
    // 20-40 mg/kg: Moderate (vomiting, diarrhea, restlessness)
    // 40-60 mg/kg: Severe (muscle tremors, seizures)
    // > 60 mg/kg: Potentially fatal
    let severity = "None / Minimal";
    let color = "green";
    let action = "Monitor for any symptoms. Call your vet if concerned.";

    if (theoPerKg >= 60) {
      severity = "CRITICAL — Potentially Fatal";
      color = "red";
      action = "EMERGENCY — Call your vet or Animal Poison Control immediately.";
    } else if (theoPerKg >= 40) {
      severity = "Severe Toxicity";
      color = "red";
      action = "URGENT — Contact your vet NOW. Do not wait for symptoms.";
    } else if (theoPerKg >= 20) {
      severity = "Moderate Toxicity";
      color = "orange";
      action = "Contact your vet within the next 1–2 hours.";
    } else if (theoPerKg >= 5) {
      severity = "Mild Toxicity";
      color = "yellow";
      action = "Call your vet for guidance. GI upset is likely.";
    }

    setResults({ theoMg, caffMg, theoPerKg, severity, color, action, chocolateLabel: choc.label });
  };

  const reset = () => {
    setShowResults(false);
    setDogWeight("10"); setWeightUnit("kg");
    setChocolateType("milk"); setAmountEaten("30"); setAmountUnit("g");
    setResults(null);
  };

  const faqs = [
    {
      question: "Why is chocolate toxic to dogs?",
      answer: "Chocolate contains theobromine and caffeine, both methylxanthines that dogs metabolise much more slowly than humans. The build-up causes hyperactivity, vomiting, diarrhea, abnormal heart rhythm, tremors, and in severe cases, death."
    },
    {
      question: "How much chocolate is lethal to a dog?",
      answer: "The LD50 (dose lethal to 50% of animals) for theobromine is approximately 300 mg/kg. That said, symptoms appear at far lower doses — as little as 20 mg/kg can cause moderate illness. Dark chocolate and baking chocolate are the most dangerous."
    },
    {
      question: "What should I do if my dog ate chocolate?",
      answer: "Call your vet or the ASPCA Animal Poison Control Center (888-426-4435) immediately. Do not wait for symptoms. If ingestion was very recent (under 2 hours), your vet may induce vomiting to prevent further absorption."
    },
    {
      question: "Is white chocolate dangerous?",
      answer: "White chocolate contains virtually no theobromine (it's made from cocoa butter, not cocoa solids), so it's rarely a toxicity concern. However, the high fat and sugar content can still cause pancreatitis."
    },
  ];

  const colorMap: Record<string, string> = {
    green: "bg-green-500/5 border-green-500/10 text-green-600",
    yellow: "bg-yellow-500/5 border-yellow-500/10 text-yellow-600",
    orange: "bg-orange-500/5 border-orange-500/10 text-orange-600",
    red: "bg-red-500/5 border-red-500/10 text-red-600",
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dog Chocolate Toxicity" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Chocolate Toxicity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="dogWeight" label="Dog's Weight" value={dogWeight} onChange={setDogWeight} />
                  </div>
                  <div className="w-20 mt-7">
                    <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="input-calc">
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type of Chocolate</label>
                  <select value={chocolateType} onChange={(e) => setChocolateType(e.target.value)} className="input-calc">
                    {Object.entries(CHOCOLATE_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="amount" label="Amount Eaten" value={amountEaten} onChange={setAmountEaten} />
                  </div>
                  <div className="w-20 mt-7">
                    <select value={amountUnit} onChange={(e) => setAmountUnit(e.target.value)} className="input-calc">
                      <option value="g">g</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Check Toxicity
                </button>
                <button onClick={reset} className="btn-reset flex items-center justify-center gap-2 px-4">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Toxicity Assessment</h2>
                <div className={`p-6 rounded-2xl border mb-6 ${colorMap[results.color]}`}>
                  <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Risk Level</p>
                  <p className="text-2xl font-black mb-2">{results.severity}</p>
                  <p className="text-sm font-semibold">{results.action}</p>
                </div>
                <ResultDisplay items={[
                  { label: "Theobromine Ingested", value: 0, textValue: results.theoMg.toFixed(1) + " mg" },
                  { label: "Theobromine per kg Body Weight", value: 0, textValue: results.theoPerKg.toFixed(1) + " mg/kg" },
                  { label: "Caffeine Ingested", value: 0, textValue: results.caffMg.toFixed(1) + " mg" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Science of Chocolate Toxicity in Dogs</h2>
              <p>Chocolate poisoning is one of the most common emergencies seen by veterinarians, particularly around holidays like Halloween, Christmas, and Easter. Understanding exactly why chocolate is dangerous and how different types vary in their potency can help pet owners respond appropriately.</p>

              <h3>What Makes Chocolate Toxic?</h3>
              <p>The culprit is <strong>theobromine</strong>, a bitter alkaloid in the methylxanthine family (related to caffeine). In humans, theobromine is metabolised quickly and poses little threat. In dogs, the half-life of theobromine is approximately 17.5 hours — meaning it builds up in the body much more effectively, allowing toxic concentrations to accumulate.</p>

              <h3>Theobromine Content by Chocolate Type</h3>
              <p>The danger is directly proportional to how much cocoa solid the chocolate contains:</p>
              <ul>
                <li><strong>White Chocolate:</strong> ~0.25 mg/oz — Essentially non-toxic</li>
                <li><strong>Milk Chocolate:</strong> ~58 mg/oz — Dangerous in moderate amounts</li>
                <li><strong>Dark / Semi-Sweet:</strong> ~138 mg/oz — High risk</li>
                <li><strong>Baker's Chocolate:</strong> ~393 mg/oz — Very high risk, even small amounts</li>
                <li><strong>Dry Cocoa Powder:</strong> ~737 mg/oz — Extremely concentrated, most dangerous</li>
              </ul>

              <h3>Clinical Signs of Theobromine Toxicosis</h3>
              <p>Signs typically appear within 6–12 hours of ingestion and can last up to 72 hours:</p>
              <ul>
                <li><strong>Mild (5–20 mg/kg):</strong> Vomiting, diarrhea, increased urination, restlessness</li>
                <li><strong>Moderate (20–40 mg/kg):</strong> Tachycardia, hyperactivity, muscle tremors</li>
                <li><strong>Severe (40–60+ mg/kg):</strong> Seizures, cardiac arrhythmias, potentially fatal</li>
              </ul>

              <h3>Treatment Options</h3>
              <p>If ingestion occurred within 2 hours, a vet may induce vomiting. Activated charcoal may be administered to slow absorption. Severe cases require hospitalisation for IV fluids, cardiac monitoring, and anticonvulsant therapy. There is no specific antidote — treatment is supportive.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-chocolate-toxicity" />
          <PopularCalculators exclude="/calculator/dog-chocolate-toxicity-calculator" />
        </div>
      </div>
    </>
  );
};

export default DogChocolateToxicityCalculator;

