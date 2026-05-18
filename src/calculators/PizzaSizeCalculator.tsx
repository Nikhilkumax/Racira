"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { Printer, RotateCcw } from "lucide-react";

interface PizzaResults {
  area1: number;
  area2: number;
  pricePerSqIn1: number;
  pricePerSqIn2: number;
  betterDeal: 1 | 2 | 0;
  savingsPct: number;
}

const PizzaSizeCalculator = () => {
  const [dia1, setDia1] = useState("10");
  const [price1, setPrice1] = useState("12");
  const [dia2, setDia2] = useState("14");
  const [price2, setPrice2] = useState("18");

  const [results, setResults] = useState<PizzaResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const d1 = parseFloat(dia1) || 0;
    const p1 = parseFloat(price1) || 0;
    const d2 = parseFloat(dia2) || 0;
    const p2 = parseFloat(price2) || 0;

    if (d1 <= 0 || d2 <= 0) return;

    const area1 = Math.PI * Math.pow(d1 / 2, 2);
    const area2 = Math.PI * Math.pow(d2 / 2, 2);
    
    const ppsi1 = p1 > 0 ? p1 / area1 : 0;
    const ppsi2 = p2 > 0 ? p2 / area2 : 0;

    let betterDeal: 1 | 2 | 0 = 0;
    let savingsPct = 0;

    if (ppsi1 > 0 && ppsi2 > 0) {
      if (ppsi1 < ppsi2) {
        betterDeal = 1;
        savingsPct = ((ppsi2 - ppsi1) / ppsi2) * 100;
      } else if (ppsi2 < ppsi1) {
        betterDeal = 2;
        savingsPct = ((ppsi1 - ppsi2) / ppsi1) * 100;
      }
    }

    setResults({
      area1,
      area2,
      pricePerSqIn1: ppsi1,
      pricePerSqIn2: ppsi2,
      betterDeal,
      savingsPct
    });
  };

  const reset = () => {
    setShowResults(false);
    setDia1("10"); setPrice1("12");
    setDia2("14"); setPrice2("18");
    setResults(null);
  };

  const faqs = [
    { question: "Is a bigger pizza always a better deal?", answer: "Usually, yes. Because the area of a circle increases with the square of the radius, a small increase in diameter results in a large increase in total pizza. For example, a 14-inch pizza is almost twice as large as a 10-inch pizza." },
    { question: "How do you calculate pizza area?", answer: "The area is calculated using the formula Area = π × r², where r is the radius (half the diameter). Since we usually buy pizza by diameter, the formula is π × (diameter/2)²." },
    { question: "What is 'price per square inch'?", answer: "This is the most accurate way to compare pizza value. It tells you exactly how much you are paying for every square inch of dough, cheese, and toppings, regardless of the pizza's shape or size." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pizza Size Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Pizza Size Calculator</h1>
            <p className="text-muted-foreground mb-8">Compare two pizzas to see which one gives you more food for your money using price per square inch analysis.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-8 mb-6">
                <div className="space-y-5">
                  <h3 className="font-bold text-primary">Pizza 1</h3>
                  <InputField id="dia1" label="Diameter (inches)" value={dia1} onChange={setDia1} suffix="in" />
                  <InputField id="price1" label="Price" value={price1} onChange={setPrice1} prefix="$" />
                </div>
                <div className="space-y-5">
                  <h3 className="font-bold text-primary">Pizza 2</h3>
                  <InputField id="dia2" label="Diameter (inches)" value={dia2} onChange={setDia2} suffix="in" />
                  <InputField id="price2" label="Price" value={price2} onChange={setPrice2} prefix="$" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Compare Pizzas</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-6">Comparison Results</h2>
                
                {results.betterDeal !== 0 && (
                  <div className="mb-8 p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Better Deal</p>
                    <p className="text-3xl font-black text-foreground">Pizza {results.betterDeal} is {results.savingsPct.toFixed(1)}% Cheaper!</p>
                    <p className="text-muted-foreground mt-2">per square inch of pizza</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Pizza 1</h3>
                    <ResultDisplay items={[
                      { label: "Total Area", value: 0, textValue: results.area1.toFixed(1) + " sq in" },
                      { label: "Price / Sq In", value: 0, textValue: "$" + results.pricePerSqIn1.toFixed(3) },
                    ]} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Pizza 2</h3>
                    <ResultDisplay items={[
                      { label: "Total Area", value: 0, textValue: results.area2.toFixed(1) + " sq in" },
                      { label: "Price / Sq In", value: 0, textValue: "$" + results.pricePerSqIn2.toFixed(3) },
                    ]} />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Pizza 1 Area", value: results.area1, color: "hsl(211, 100%, 50%)" },
                      { label: "Pizza 2 Area", value: results.area2, color: "hsl(220, 60%, 20%)" },
                    ]}
                    size={160}
                  />
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>The Math of Pizza Value</h2>
              <p>When you're ordering pizza, your eyes often deceive you. A 12-inch pizza might look only slightly smaller than a 14-inch pizza, but the math tells a different story. Because the area of a circle grows exponentially as the diameter increases, those extra two inches actually provide about 36% more pizza!</p>
              
              <h2>Why Area Matters More Than Diameter</h2>
              <p>A circle's area is πr². If you double the diameter, you quadruple the area. This is why "upsizing" for a few extra dollars is almost always the smarter financial move. You're getting significantly more food for a relatively small increase in price.</p>

              <h2>Standard Pizza Sizes Comparison</h2>
              <ul>
                <li><strong>10-inch (Small):</strong> ~78.5 square inches</li>
                <li><strong>12-inch (Medium):</strong> ~113.1 square inches (44% more than Small)</li>
                <li><strong>14-inch (Large):</strong> ~153.9 square inches (36% more than Medium, 96% more than Small)</li>
                <li><strong>18-inch (XL):</strong> ~254.5 square inches (almost 3.3x more than Small!)</li>
              </ul>

              <h2>Tips for Savvy Ordering</h2>
              <p>Always check for "BOGO" (Buy One Get One) deals on smaller sizes, but compare them against the price of one extra-large. Often, one 18-inch pizza contains more food than two 12-inch pizzas, and usually costs less. Use our calculator at the restaurant to ensure you're getting the most crust for your buck.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pizza-size" />
            <PopularCalculators exclude="/calculator/pizza-size-calculator" />
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

export default PizzaSizeCalculator;

