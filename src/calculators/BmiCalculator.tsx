"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calculator } from "lucide-react";

const getBMICategory = (bmi: number) => {
  if (bmi < 16) return { label: "Severe Thinness", color: "text-red-500" };
  if (bmi < 17) return { label: "Moderate Thinness", color: "text-orange-500" };
  if (bmi < 18.5) return { label: "Mild Thinness", color: "text-yellow-500" };
  if (bmi < 25) return { label: "Normal", color: "text-green-500" };
  if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
  if (bmi < 35) return { label: "Obese Class I", color: "text-orange-500" };
  if (bmi < 40) return { label: "Obese Class II", color: "text-red-500" };
  return { label: "Obese Class III", color: "text-red-700" };
};

const BMICalculator = () => {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [heightCm, setHeightCm] = useState("170");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weightLbs, setWeightLbs] = useState("154");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    bmi: number; category: string; categoryColor: string;
    healthyWeightMin: number; healthyWeightMax: number; weightUnit: string;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    let heightM: number, w: number, wUnit: string;
    if (unit === "metric") {
      w = parseFloat(weight) || 0;
      heightM = (parseFloat(heightCm) || 0) / 100;
      wUnit = "kg";
    } else {
      w = parseFloat(weightLbs) || 0;
      const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightM = totalInches * 0.0254;
      wUnit = "lbs";
    }
    if (w <= 0 || heightM <= 0) return;

    const bmi = w / (heightM * heightM) * (unit === "imperial" ? 0.453592 : 1);
    const cat = getBMICategory(bmi);

    const healthyMin = 18.5 * heightM * heightM;
    const healthyMax = 24.9 * heightM * heightM;

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category: cat.label,
      categoryColor: cat.color,
      healthyWeightMin: Math.round(unit === "imperial" ? healthyMin / 0.453592 : healthyMin),
      healthyWeightMax: Math.round(unit === "imperial" ? healthyMax / 0.453592 : healthyMax),
      weightUnit: wUnit,
    });
  };

  const reset = () => {
    setShowResults(false); setWeight("70"); setHeightCm("170"); setHeightFt("5"); setHeightIn("7"); setWeightLbs("154"); setResult(null);
  };

  const faqs = [
    { question: "What is BMI?", answer: "Body Mass Index (BMI) is a numerical value calculated from your weight and height. It's used as a screening tool to categorize individuals into underweight, normal, overweight, or obese categories." },
    { question: "Is BMI accurate?", answer: "BMI is a useful screening tool but has limitations. It doesn't distinguish between muscle and fat mass, so muscular individuals may have a high BMI despite being healthy. It also doesn't account for fat distribution, age, or ethnicity." },
    { question: "What is a healthy BMI range?", answer: "A BMI between 18.5 and 24.9 is considered normal/healthy. Below 18.5 is underweight, 25-29.9 is overweight, and 30+ is obese." },
    { question: "Does BMI differ for children?", answer: "Yes, for children and teens (ages 2-20), BMI is interpreted using age- and sex-specific percentiles rather than fixed categories, as body composition changes with growth." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "BMI Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">BMI Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate your Body Mass Index and find your healthy weight range.</p>

            <div className="card-calculator mb-8">
              <div className="mb-6">
                <div className="flex gap-2">
                  <button onClick={() => setUnit("metric")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${unit === "metric" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Metric (kg/cm)</button>
                  <button onClick={() => setUnit("imperial")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${unit === "imperial" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Imperial (lbs/ft)</button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                {unit === "metric" ? (
                  <>
                    <InputField id="weight" label="Weight" value={weight} onChange={setWeight} suffix="kg" />
                    <InputField id="heightCm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
                  </>
                ) : (
                  <>
                    <InputField id="weightLbs" label="Weight" value={weightLbs} onChange={setWeightLbs} suffix="lbs" />
                    <div className="grid grid-cols-2 gap-2">
                      <InputField id="heightFt" label="Height (ft)" value={heightFt} onChange={setHeightFt} suffix="ft" />
                      <InputField id="heightIn" label="(in)" value={heightIn} onChange={setHeightIn} suffix="in" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Calculator className="h-5 w-5" /> Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-4">Your BMI Result</h2>
                <div className="text-center mb-6">
                  <p className="text-5xl font-extrabold mb-2">{result.bmi}</p>
                  <p className={`text-lg font-semibold ${result.categoryColor}`}>{result.category}</p>
                </div>
                <ResultDisplay items={[
                  { label: "BMI", value: result.bmi, textValue: `${result.bmi} kg/m²` },
                  { label: "Category", value: 0, textValue: result.category },
                  { label: "Healthy Weight Range", value: 0, textValue: `${result.healthyWeightMin}–${result.healthyWeightMax} ${result.weightUnit}` },
                ]} />

                {/* BMI Scale visual */}
                <div className="mt-6">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div className="bg-blue-400 flex-1" title="Underweight" />
                    <div className="bg-green-400 flex-[1.3]" title="Normal" />
                    <div className="bg-yellow-400 flex-1" title="Overweight" />
                    <div className="bg-orange-400 flex-1" title="Obese I" />
                    <div className="bg-red-400 flex-1" title="Obese II+" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>16</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40+</span>
                  </div>
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            {/* SEO Content Sections */}
            <div className="mt-4 space-y-8 mb-10">
              <section>
                <h2 className="text-2xl font-bold mb-4">How the BMI Calculator Works</h2>
                <p className="text-muted-foreground mb-3">Our BMI Calculator uses your height and weight to determine your body mass index, a standard measure of body fat based on your physical dimensions. Simply enter your weight and height in either metric (kg/cm) or imperial (lbs/ft) units and click Calculate.</p>
                <p className="text-muted-foreground mb-3">The tool applies the Quetelet index formula: BMI = weight ÷ height². For imperial measurements, a conversion factor of 703 is applied to ensure accuracy. The result is then mapped to World Health Organization (WHO) categories ranging from Underweight to Obese Class III.</p>
                <p className="text-muted-foreground">In addition to your BMI, the calculator provides a healthy weight range tailored to your height, giving you a clear target for weight management goals.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Understanding Your Results</h2>
                <p className="text-muted-foreground mb-3">Your <strong>BMI value</strong> is a relative measure of your body composition. A BMI between 18.5 and 24.9 is generally considered the 'Normal' or 'Healthy' range for most adults.</p>
                <p className="text-muted-foreground mb-3">The <strong>BMI Category</strong> tells you where you fall on the clinical spectrum. Underweight (&lt; 18.5) may indicate nutritional deficiencies, while Overweight (25–29.9) or Obese (30+) categories are associated with increased risks for cardiovascular disease, type 2 diabetes, and other health conditions.</p>
                <p className="text-muted-foreground">The <strong>Healthy Weight Range</strong> shown in the results display provides the minimum and maximum weight your body should ideally maintain for your specific height to stay within the 18.5–24.9 BMI bracket.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
                <p className="text-muted-foreground mb-3"><strong>Health screening:</strong> Doctors and nutritionists use BMI as a rapid initial assessment tool to identify individuals who may be at risk due to their weight-to-height ratio.</p>
                <p className="text-muted-foreground mb-3"><strong>Fitness tracking:</strong> Individuals starting a weight loss or muscle-building journey use BMI to baseline their progress, though they often supplement it with body fat percentage for better accuracy.</p>
                <p className="text-muted-foreground"><strong>Insurance and medical forms:</strong> BMI is a standard metric required for life insurance applications and general health checkup documentation to assess overall health risk levels.</p>
              </section>
            </div>

            <article className="prose-finance">
              <h2>What Is BMI?</h2>
              <p>Body Mass Index (BMI) is a simple calculation using your height and weight to estimate body fat. Developed by Adolphe Quetelet in the 1830s, it remains the most widely used screening tool for weight categories by healthcare providers worldwide.</p>

              <h2>BMI Formula</h2>
              <p><strong>Metric:</strong> BMI = weight (kg) ÷ height² (m²)</p>
              <p><strong>Imperial:</strong> BMI = weight (lbs) × 703 ÷ height² (in²)</p>

              <h2>BMI Categories (WHO Standards)</h2>
              <ul>
                <li><strong>Severe Thinness:</strong> BMI &lt; 16</li>
                <li><strong>Moderate Thinness:</strong> 16–16.9</li>
                <li><strong>Mild Thinness:</strong> 17–18.4</li>
                <li><strong>Normal:</strong> 18.5–24.9</li>
                <li><strong>Overweight:</strong> 25–29.9</li>
                <li><strong>Obese Class I:</strong> 30–34.9</li>
                <li><strong>Obese Class II:</strong> 35–39.9</li>
                <li><strong>Obese Class III:</strong> ≥ 40</li>
              </ul>

              <h2>Limitations of BMI</h2>
              <p>BMI does not differentiate between fat and lean mass. Athletes and bodybuilders may be classified as overweight or obese despite having low body fat. For a more complete picture, consider using body fat percentage calculators, waist-to-hip ratio, or DEXA scans alongside BMI.</p>

              <h2>BMI for Different Populations</h2>
              <p>Asian populations may have higher health risks at lower BMI values. The WHO suggests that for Asians, overweight begins at BMI 23 and obesity at BMI 27.5, compared to 25 and 30 for other populations.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> BMI is a screening tool, not a diagnostic measure. Consult a healthcare professional for a complete health assessment.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-calculator" />
            <PopularCalculators exclude="/bmi-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BMICalculator;
