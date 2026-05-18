"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Coffee } from "lucide-react";

interface CoffeeResults {
  coffeeGrams: number;
  waterMl: number;
  ratio: string;
  strengthDesc: string;
}

const CoffeeBrewingCalculator = () => {
  const [inputMode, setInputMode] = useState<"water" | "coffee">("water");
  const [waterAmount, setWaterAmount] = useState("350"); // 350ml
  const [coffeeAmount, setCoffeeAmount] = useState("22");
  const [brewRatio, setBrewRatio] = useState("16"); // 1:16
  const [method, setMethod] = useState("pourover");

  const [results, setResults] = useState<CoffeeResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(waterAmount) || 0;
    const c = parseFloat(coffeeAmount) || 0;
    const r = parseFloat(brewRatio) || 16;

    let coffeeG, waterM;

    if (inputMode === "water") {
      waterM = w;
      coffeeG = w / r;
    } else {
      coffeeG = c;
      waterM = c * r;
    }

    let strength = "Balanced";
    if (r < 14) strength = "Very Strong / Bold";
    else if (r < 16) strength = "Strong / Rich";
    else if (r > 18) strength = "Light / Delicate";
    else if (r > 16) strength = "Standard / Balanced";

    setResults({
      coffeeGrams: coffeeG,
      waterMl: waterM,
      ratio: `1:${r}`,
      strengthDesc: strength
    });
  };

  const reset = () => {
    setShowResults(false);
    setWaterAmount("350"); setCoffeeAmount("22"); setBrewRatio("16");
    setResults(null);
  };

  const methods: Record<string, { ratio: number; desc: string }> = {
    pourover: { ratio: 16, desc: "Standard ratio for a clean, balanced cup." },
    frenchpress: { ratio: 15, desc: "Slightly stronger to highlight body and oils." },
    aeropress: { ratio: 13, desc: "Concentrated brew, often diluted later." },
    espresso: { ratio: 2, desc: "Extremely concentrated 1:2 ratio." },
    coldbrew: { ratio: 8, desc: "Strong concentrate for long steeping." }
  };

  const handleMethodChange = (m: string) => {
    setMethod(m);
    setBrewRatio(methods[m].ratio.toString());
  };

  const faqs = [
    { question: "What is the 'Golden Ratio' for coffee?", answer: "The Golden Ratio is generally considered to be 1:15 to 1:18 (one gram of coffee for every 15-18 grams of water). 1:16 is a popular starting point for most manual brewing methods like pour-over." },
    { question: "Should I weigh my coffee or use spoons?", answer: "Weighing your coffee in grams is far more accurate than using volume (spoons). Different roasts have different densities; a dark roast is much lighter and takes up more space than a light roast." },
    { question: "How much coffee do I need for a 12oz cup?", answer: "A standard 12oz cup is about 355ml. At a 1:16 ratio, you would need approximately 22 grams of coffee." },
    { question: "Does water temperature matter?", answer: "Yes! Ideally, brew with water between 195°F and 205°F (90.5°C to 96°C). Boiling water can burn the grounds, while water that is too cool won't extract enough flavor." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Coffee Brewing Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Coffee Brewing Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate the perfect coffee-to-water ratio for any brewing method to ensure a consistent, delicious cup every morning.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Brewing Method</label>
                  <select 
                    value={method} 
                    onChange={(e) => handleMethodChange(e.target.value)}
                    className="input-calc"
                  >
                    <option value="pourover">Pour Over</option>
                    <option value="frenchpress">French Press</option>
                    <option value="aeropress">AeroPress</option>
                    <option value="espresso">Espresso</option>
                    <option value="coldbrew">Cold Brew</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1.5">{methods[method].desc}</p>
                </div>
                <InputField id="ratio" label="Ratio (1:X)" value={brewRatio} onChange={setBrewRatio} prefix="1:" tooltip="Grams of water per 1 gram of coffee." />
                
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground">Calculate based on:</label>
                    <div className="calc-toggle-buttons">
                      <button type="button" onClick={() => setInputMode("water")} className={`calc-toggle-btn${inputMode === "water" ? " active" : ""}`}>Water Amount</button>
                      <button type="button" onClick={() => setInputMode("coffee")} className={`calc-toggle-btn${inputMode === "coffee" ? " active" : ""}`}>Coffee Amount</button>
                    </div>
                  </div>
                  {inputMode === "water" ? (
                    <InputField id="water" label="Total Water (ml)" value={waterAmount} onChange={setWaterAmount} suffix="ml" />
                  ) : (
                    <InputField id="coffee" label="Total Coffee (g)" value={coffeeAmount} onChange={setCoffeeAmount} suffix="g" />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Coffee className="h-5 w-5" /> Calculate Brew
                </button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-6">Your Perfect Recipe</h2>
                
                <div className="grid sm:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Coffee Needed</p>
                    <p className="text-4xl font-black text-foreground">{results.coffeeGrams.toFixed(1)}g</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Water Needed</p>
                    <p className="text-4xl font-black text-foreground">{results.waterMl.toFixed(0)}ml</p>
                  </div>
                </div>

                <ResultDisplay items={[
                  { label: "Brew Ratio", value: 0, textValue: results.ratio },
                  { label: "Estimated Strength", value: 0, textValue: results.strengthDesc },
                  { label: "Coffee in Ounces", value: 0, textValue: (results.coffeeGrams * 0.035274).toFixed(2) + " oz" },
                  { label: "Water in Ounces", value: 0, textValue: (results.waterMl * 0.033814).toFixed(1) + " fl oz" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>The Art of the Brew Ratio</h2>
              <p>Coffee brewing is a delicate science where the ratio of coffee to water is the most critical variable. By controlling this ratio, you control the strength and extraction of your coffee. A lower ratio (like 1:12) will result in a heavy, intense cup, while a higher ratio (like 1:18) will be lighter and more tea-like.</p>
              
              <h2>Why Grams Matter</h2>
              <p>In the world of specialty coffee, we always measure in grams. Volume measurements (like tablespoons or cups) are unreliable because different coffees have different sizes and weights. A dark, oily roast might take up much more volume than a dense, light-roasted bean, even if they weigh exactly the same.</p>

              <h2>Standard Ratios by Method</h2>
              <ul>
                <li><strong>Pour Over (V60, Chemex):</strong> 1:15 to 1:17. This is the sweet spot for clarity and balance.</li>
                <li><strong>French Press:</strong> 1:14 to 1:15. A slightly tighter ratio compensates for the immersion brewing and provides more body.</li>
                <li><strong>AeroPress:</strong> 1:11 to 1:13. Often brewed as a concentrate and then "topped up" with hot water to taste.</li>
                <li><strong>Espresso:</strong> 1:1.5 to 1:2.5. Extremely concentrated pressure-brewed coffee.</li>
              </ul>

              <h2>Refining Your Brew</h2>
              <p>If your coffee tastes too bitter, try using a coarser grind or a slightly higher ratio (more water). If it tastes sour or thin, try a finer grind or a tighter ratio (less water). Remember, the best cup of coffee is the one that tastes best to you — use this calculator as a reliable starting point for your own experimentation.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/coffee-brewing" />
            <PopularCalculators exclude="/calculator/coffee-brewing-calculator" />
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

export default CoffeeBrewingCalculator;

