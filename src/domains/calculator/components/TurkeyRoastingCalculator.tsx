"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Utensils } from "lucide-react";

interface TurkeyResults {
  roastTimeMin: number;
  roastTimeMax: number;
  thawFridgeDays: number;
  thawWaterHours: number;
  servings: number;
}

const TurkeyRoastingCalculator = () => {
  const [weight, setWeight] = useState("15");
  const [isStuffed, setIsStuffed] = useState(false);
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");

  const [results, setResults] = useState<TurkeyResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let lbs = parseFloat(weight) || 0;
    if (unit === "kg") lbs = lbs * 2.20462;

    if (lbs <= 0) return;

    // Roasting time (325°F)
    // Unstuffed: 13-15 mins per lb
    // Stuffed: 15-20 mins per lb
    let minPerLb = isStuffed ? 15 : 13;
    let maxPerLb = isStuffed ? 20 : 15;

    // Small birds cook faster per lb than large birds, but we'll use standard ranges
    const roastTimeMin = lbs * minPerLb;
    const roastTimeMax = lbs * maxPerLb;

    // Thawing
    // Refrigerator: 24 hours per 4-5 lbs
    const thawFridgeDays = lbs / 4;
    // Cold Water: 30 mins per lb
    const thawWaterHours = lbs * 0.5;

    // Servings: approx 1 lb per person (generous)
    const servings = lbs;

    setResults({
      roastTimeMin,
      roastTimeMax,
      thawFridgeDays,
      thawWaterHours,
      servings
    });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("15"); setIsStuffed(false); setUnit("lbs");
    setResults(null);
  };

  const faqs = [
    { question: "What is the safe internal temperature for turkey?", answer: "The USDA recommends a minimum internal temperature of 165°F (74°C) as measured with a food thermometer. Check the temperature in the innermost part of the thigh and wing and the thickest part of the breast." },
    { question: "Should I roast my turkey stuffed or unstuffed?", answer: "Unstuffed turkeys cook more evenly and faster. If you do stuff the bird, the stuffing must also reach 165°F for safety, which often means the breast meat gets overcooked. Many chefs recommend cooking stuffing in a separate dish." },
    { question: "How long can I keep a thawed turkey in the fridge?", answer: "Once fully thawed in the refrigerator, a turkey is safe for 1 to 2 days before cooking. If thawed in cold water, it should be cooked immediately." },
    { question: "How much turkey do I need per person?", answer: "A good rule of thumb is 1 to 1.5 pounds of turkey per person. This accounts for the weight of the bones and ensures plenty of leftovers!" }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Turkey Roasting Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Turkey Roasting Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground">Turkey Weight</label>
                    <div className="calc-toggle-buttons">
                      <button type="button" onClick={() => setUnit("lbs")} className={`calc-toggle-btn${unit === "lbs" ? " active" : ""}`}>Lbs</button>
                      <button type="button" onClick={() => setUnit("kg")} className={`calc-toggle-btn${unit === "kg" ? " active" : ""}`}>Kg</button>
                    </div>
                  </div>
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-calc" />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                    <input type="checkbox" checked={isStuffed} onChange={(e) => setIsStuffed(e.target.checked)} className="h-5 w-5 rounded border-input text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Stuffed Turkey</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Roasting & Preparation Guide</h2>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Roasting Time (325°F)</p>
                    <p className="text-2xl font-black text-foreground">
                      {Math.floor(results.roastTimeMin / 60)}h {Math.round(results.roastTimeMin % 60)}m – {Math.floor(results.roastTimeMax / 60)}h {Math.round(results.roastTimeMax % 60)}m
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Always use a meat thermometer to verify safety.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 text-center">
                    <p className="text-sm font-bold text-accent-foreground uppercase tracking-widest mb-1">Recommended Servings</p>
                    <p className="text-4xl font-black text-foreground">{Math.floor(results.servings)} Persons</p>
                    <p className="text-xs text-muted-foreground mt-2">Includes enough for leftovers.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">Thawing Time</h3>
                    <ResultDisplay items={[
                      { label: "Refrigerator Thaw", value: 0, textValue: results.thawFridgeDays.toFixed(1) + " Days" },
                      { label: "Cold Water Thaw", value: 0, textValue: results.thawWaterHours.toFixed(1) + " Hours" },
                    ]} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">Roasting Checklist</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">✓ Oven preheated to 325°F</li>
                      <li className="flex items-center gap-2">✓ Giblets removed from cavity</li>
                      <li className="flex items-center gap-2">✓ Bird patted dry for crispy skin</li>
                      <li className="flex items-center gap-2">✓ Rest for 20-30 mins after roasting</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering the Holiday Roast</h2>
              <p>Roasting a turkey can be intimidating, but with proper planning, it's a straightforward process. The most important step isn't the cooking—it's the thawing. A partially frozen turkey will cook unevenly, leaving some parts raw while others are dry. Always plan your thawing time several days in advance.</p>
              
              <h2 className="text-2xl font-bold mb-3">Thawing Methods</h2>
              <ul>
                <li><strong>Refrigerator Thawing (Recommended):</strong> The safest method. Keep the turkey in its original wrapper and place it on a tray to catch any drips. Allow 24 hours for every 4-5 pounds of turkey.</li>
                <li><strong>Cold Water Thawing:</strong> Faster but requires more attention. Submerge the wrapped turkey in cold tap water, changing the water every 30 minutes. Allow 30 minutes per pound.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Internal Temperature is King</h2>
              <p>Forget the 'plastic pop-up' timers that often come with turkeys—they are notoriously unreliable. Use a digital meat thermometer. Insert it into the thickest part of the thigh without touching the bone. Once it reaches 165°F (74°C), the turkey is safe to eat. Note that the temperature will continue to rise by about 5 degrees while the bird rests.</p>

              <h2 className="text-2xl font-bold mb-3">Why You Must Rest the Bird</h2>
              <p>Resistance is futile—you must let the turkey rest for at least 20 to 30 minutes after taking it out of the oven. This allows the juices to redistribute throughout the meat. If you carve it immediately, all those delicious juices will run out onto the cutting board, leaving the meat dry.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/turkey-roasting" />
          <PopularCalculators exclude="/calculator/turkey-roasting-calculator" />
        </div>
      </div>
    </>
  );
};

export default TurkeyRoastingCalculator;

