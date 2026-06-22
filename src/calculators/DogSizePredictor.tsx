"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Bone } from "lucide-react";

const DogSizePredictor = () => {
  const [currentWeight, setCurrentWeight] = useState("5");
  const [currentAge, setCurrentAge] = useState("12");
  const [ageUnit, setAgeUnit] = useState("weeks");
  const [breedSize, setBreedSize] = useState("medium");
  const [unit, setUnit] = useState("kg");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let weightKg = parseFloat(currentWeight) || 0;
    if (unit === "lbs") weightKg /= 2.20462;

    let ageWeeks = parseFloat(currentAge) || 0;
    if (ageUnit === "months") ageWeeks *= 4.33;

    if (weightKg <= 0 || ageWeeks <= 0) return;

    // Adult weight prediction:
    // Formula: Current Weight / (Age in weeks / Total growth weeks)
    const growthWeeks: Record<string, number> = {
      toy: 30,
      small: 36,
      medium: 40,
      large: 52,
      giant: 60,
    };

    const maxWeeks = growthWeeks[breedSize] || 40;
    const growthFraction = ageWeeks / maxWeeks;
    const predictedAdultKg = weightKg / growthFraction;

    // Adult weight ranges for validation
    const adultRanges: Record<string, [number, number]> = {
      toy: [1, 5],
      small: [5, 10],
      medium: [10, 25],
      large: [25, 45],
      giant: [45, 90],
    };

    const range = adultRanges[breedSize];
    const low = Math.max(range[0], predictedAdultKg * 0.9);
    const high = Math.min(range[1], predictedAdultKg * 1.1);
    const pctGrown = Math.min(100, growthFraction * 100);

    setResults({
      predictedKg: predictedAdultKg,
      predictedLbs: predictedAdultKg * 2.20462,
      low,
      high,
      pctGrown,
      weeksToAdult: Math.max(0, maxWeeks - ageWeeks),
    });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentWeight("5"); setCurrentAge("12");
    setAgeUnit("weeks"); setBreedSize("medium"); setUnit("kg");
    setResults(null);
  };

  const faqs = [
    {
      question: "How accurate are puppy size predictions?",
      answer: "Predictions are most accurate when the puppy's age is between 16–20 weeks, as they are past the initial 'catch-up' growth phase. Mixed-breed puppies are harder to predict; a DNA test revealing breed composition significantly improves accuracy."
    },
    {
      question: "When do dogs stop growing?",
      answer: "Toy and small breeds finish skeletal growth around 6–8 months. Medium breeds around 10–12 months. Large breeds like Labradors reach full height by 12–14 months but continue filling out until 18+ months. Giant breeds like Great Danes may not reach full adult weight until age 2."
    },
    {
      question: "Is there a simpler rule of thumb?",
      answer: "Yes — for medium dogs, you can double their weight at 14 weeks of age to estimate their adult weight. For small breeds, double their weight at 8 weeks. These are rough estimates and this calculator provides more precision."
    },
    {
      question: "Does paw size predict adult size?",
      answer: "To some degree. Large paws relative to the body suggest the puppy will grow into a larger dog. However, this is not a reliable scientific metric and can be misleading in chondrodystrophic breeds like Basset Hounds."
    },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dog Size Predictor" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Size Predictor</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="weight" label="Current Weight" value={currentWeight} onChange={setCurrentWeight} />
                  </div>
                  <div className="w-20 mt-7">
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="age" label="Current Age" value={currentAge} onChange={setCurrentAge} />
                  </div>
                  <div className="w-28 mt-7">
                    <select value={ageUnit} onChange={(e) => setAgeUnit(e.target.value)} className="input-calc">
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Breed Size Category</label>
                  <select value={breedSize} onChange={(e) => setBreedSize(e.target.value)} className="input-calc">
                    <option value="toy">Toy (&lt;5kg adult)</option>
                    <option value="small">Small (5–10kg adult)</option>
                    <option value="medium">Medium (10–25kg adult)</option>
                    <option value="large">Large (25–45kg adult)</option>
                    <option value="giant">Giant (&gt;45kg adult)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Bone className="h-5 w-5" /> Predict Adult Size
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Growth Prediction</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Predicted Adult Weight</p>
                    <p className="text-4xl font-black text-foreground">{results.predictedKg.toFixed(1)} <span className="text-lg">kg</span></p>
                    <p className="text-sm text-muted-foreground mt-1">({results.predictedLbs.toFixed(1)} lbs)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Likely Range</p>
                    <p className="text-2xl font-black text-foreground">{results.low.toFixed(1)} – {results.high.toFixed(1)} <span className="text-sm font-normal">kg</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Growth Completed", value: 0, textValue: results.pctGrown.toFixed(0) + "%" },
                  { label: "Weeks Until Full Grown", value: 0, textValue: Math.round(results.weeksToAdult) + " weeks" },
                  { label: "Prediction Method", value: 0, textValue: "Growth Fraction Formula" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>How Puppies Grow: The Science of Canine Development</h2>
              <p>Puppy growth follows a predictable curve that varies significantly by breed size. Understanding this curve is essential for new dog owners who want to plan for food costs, crate size, harness upgrades, and even apartment requirements.</p>

              <h3>The Growth Fraction Method</h3>
              <p>The most widely used method for predicting adult weight is the growth fraction formula. It assumes that at any given age, a puppy's weight represents a known percentage of their total adult weight. For example, a medium-breed dog at 20 weeks is approximately 50% of its adult weight.</p>

              <h3>Why Breed Size Matters So Much</h3>
              <p>Different breed sizes have drastically different growth timelines because they achieve different adult sizes through varying lengths of the growth phase:</p>
              <ul>
                <li><strong>Toy breeds</strong> (Chihuahua, Pomeranian): Grow rapidly, finish in 6–8 months</li>
                <li><strong>Small breeds</strong> (Beagle, Shih Tzu): Finish at around 9–10 months</li>
                <li><strong>Medium breeds</strong> (Border Collie, Bulldog): Adult by 12 months</li>
                <li><strong>Large breeds</strong> (German Shepherd, Labrador): Skeletal growth done at 14–16 months</li>
                <li><strong>Giant breeds</strong> (Great Dane, Mastiff): May grow until 18–24 months old</li>
              </ul>

              <h3>The Importance of Not Overfeeding Growing Puppies</h3>
              <p>Especially in large and giant breeds, overfeeding during the growth phase can cause bones and joints to develop faster than the muscles and connective tissue can support them. This increases the risk of Hip Dysplasia, OCD (Osteochondritis Dissecans), and other orthopaedic conditions. Always feed large-breed puppies a diet formulated specifically for their size class.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-size-predictor" />
          <PopularCalculators exclude="/calculator/dog-size-predictor" />
        </div>
      </div>
    </>
  );
};

export default DogSizePredictor;

