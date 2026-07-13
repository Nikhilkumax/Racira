"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Cat } from "lucide-react";

const CatCalorieCalculator = () => {
  const [weight, setWeight] = useState("4");
  const [unit, setUnit] = useState("kg");
  const [lifestage, setLifestage] = useState("adult");
  const [isNeutered, setIsNeutered] = useState("yes");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let wKg = parseFloat(weight) || 0;
    if (unit === "lbs") wKg /= 2.20462;
    if (wKg <= 0) return;

    // RER for cats = 70 * (weight)^0.75
    const rer = 70 * Math.pow(wKg, 0.75);

    let multiplier = 1.2; // neutered adult
    if (isNeutered === "no") multiplier = 1.4;
    if (lifestage === "kitten") multiplier = 2.5;
    if (lifestage === "senior") multiplier = 1.1;
    if (lifestage === "obese_prone") multiplier = 1.0;
    if (lifestage === "lactating") multiplier = 2.0;

    const mer = rer * multiplier;

    setResults({
      rer: Math.round(rer),
      mer: Math.round(mer),
      multiplier,
      treatAllowance: Math.round(mer * 0.1),
      mealCalories: Math.round(mer * 0.9),
    });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("4"); setUnit("kg"); setLifestage("adult"); setIsNeutered("yes");
    setResults(null);
  };

  const faqs = [
    {
      question: "How many calories does a cat need per day?",
      answer: "An average 4kg (8.8lb) neutered adult cat needs about 200–250 calories per day. Kittens and lactating mothers need significantly more — up to 2.5x the resting energy requirement."
    },
    {
      question: "Why is my cat always hungry?",
      answer: "Cats are obligate carnivores and naturally graze throughout the day. If your cat seems perpetually hungry, consider splitting their daily calorie allowance across 3–4 small meals instead of 1–2 large ones."
    },
    {
      question: "How do I convert cat food labels to calories?",
      answer: "Look for 'kcal/kg' or 'kcal/can' on the food label. Divide that by the number of grams per serving to get kcal per gram. Then multiply by grams fed to find total calories per serving."
    },
    {
      question: "Does spaying or neutering reduce caloric needs?",
      answer: "Yes. Neutered cats have lower metabolic rates and a reduced tendency to roam, which cuts energy expenditure. Their daily caloric needs drop by approximately 20–30% compared to intact adults."
    },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cat Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cat Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="weight" label="Weight" value={weight} onChange={setWeight} />
                  </div>
                  <div className="w-20 mt-7">
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Life Stage</label>
                  <select value={lifestage} onChange={(e) => setLifestage(e.target.value)} className="input-calc">
                    <option value="kitten">Kitten (0–1 yr)</option>
                    <option value="adult">Adult (1–7 yr)</option>
                    <option value="senior">Senior (7+ yr)</option>
                    <option value="obese_prone">Obesity-Prone</option>
                    <option value="lactating">Lactating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Neutered / Spayed?</label>
                  <select value={isNeutered} onChange={(e) => setIsNeutered(e.target.value)} className="input-calc">
                    <option value="yes">Yes</option>
                    <option value="no">No (Intact)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Daily Nutrition Plan</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Daily Target (MER)</p>
                    <p className="text-5xl font-black text-foreground">{results.mer} <span className="text-xl">kcal</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Resting Energy (RER)</p>
                    <p className="text-3xl font-black text-foreground">{results.rer} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Life Stage Multiplier", value: 0, textValue: results.multiplier.toFixed(1) + "×" },
                  { label: "Treat Allowance (10%)", value: 0, textValue: results.treatAllowance + " kcal" },
                  { label: "Main Meals (90%)", value: 0, textValue: results.mealCalories + " kcal" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Your Cat's Caloric Needs</h2>
              <p>Feeding a cat the right amount is one of the most important things you can do for their long-term health. Unlike dogs, cats are <strong>obligate carnivores</strong> — their bodies are optimised to derive energy from animal protein and fat rather than carbohydrates. This has a direct impact on how their caloric needs are calculated.</p>

              <h3>Resting Energy Requirement (RER)</h3>
              <p>The RER represents the number of calories a cat would burn if it stayed completely still all day — essentially the energy needed to power their vital organs. The formula used by veterinary nutritionists worldwide is:</p>
              <p><strong>RER (kcal/day) = 70 × (body weight in kg)^0.75</strong></p>

              <h3>Maintenance Energy Requirement (MER)</h3>
              <p>The MER is the RER multiplied by a factor that accounts for the cat's life stage and reproductive status:</p>
              <ul>
                <li><strong>Kittens (under 1 year):</strong> 2.5× RER — rapid growth demands huge energy</li>
                <li><strong>Intact adults:</strong> 1.4× RER</li>
                <li><strong>Neutered adults:</strong> 1.2× RER — the most common adult factor</li>
                <li><strong>Seniors (7+ years):</strong> 1.1× RER — metabolism slows with age</li>
                <li><strong>Obesity-prone:</strong> 1.0× RER — strict caloric control is critical</li>
                <li><strong>Lactating queens:</strong> 2.0× RER — nursing kittens is extremely energy-intensive</li>
              </ul>

              <h3>Indoor vs Outdoor Cats</h3>
              <p>Indoor cats lead a much more sedentary lifestyle than outdoor cats. An outdoor cat that hunts, climbs trees, and patrols a territory can burn 20–30% more calories than its indoor counterpart of the same weight. If your cat has indoor-only access, consider reducing their intake by 10% from the calculated MER.</p>

              <h3>Signs Your Cat Is Getting Too Many Calories</h3>
              <ul>
                <li>You can no longer feel their ribs easily</li>
                <li>They have a visible belly pouch (the "primordial pouch" is normal, but excessive fat is not)</li>
                <li>They become lethargic or reluctant to play</li>
                <li>They have difficulty grooming their back end</li>
              </ul>

              <h3>Reading Commercial Cat Food Labels</h3>
              <p>When comparing cat foods, always check the <strong>caloric content per 100g or per can</strong>, not just the protein percentages. A food with 40% protein on a "dry matter basis" from a tiny can might deliver far fewer calories than expected. The gold standard is kcal/cup or kcal/100g listed under the Guaranteed Analysis section of the label.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cat-calorie" />
          <PopularCalculators exclude="/calculator/cat-calorie-calculator" />
        </div>
      </div>
    </>
  );
};

export default CatCalorieCalculator;

