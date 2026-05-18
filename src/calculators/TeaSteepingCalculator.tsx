"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Timer } from "lucide-react";

interface TeaInfo {
  tempC: string;
  tempF: string;
  time: string;
  desc: string;
}

const TeaSteepingCalculator = () => {
  const [teaType, setTeaType] = useState("black");
  const [results, setResults] = useState<TeaInfo | null>(null);
  const [showResults, setShowResults] = useState(false);

  const teaData: Record<string, TeaInfo> = {
    black: { tempC: "95-100°C", tempF: "203-212°F", time: "3-5 minutes", desc: "Full-bodied and robust. Use boiling water and steep longer for strength." },
    green: { tempC: "75-80°C", tempF: "167-176°F", time: "2-3 minutes", desc: "Delicate and sensitive. Too much heat or time will make it bitter." },
    white: { tempC: "70-75°C", tempF: "158-167°F", time: "4-5 minutes", desc: "The most delicate tea. Needs lower temperatures and longer steeping." },
    oolong: { tempC: "80-85°C", tempF: "176-185°F", time: "3-5 minutes", desc: "Complex and aromatic. Can often be steeped multiple times." },
    herbal: { tempC: "100°C", tempF: "212°F", time: "5-10 minutes", desc: "Technically infusions. Needs high heat and long steeping for full flavor." }
  };

  const handleCalculate = () => {
    setShowResults(true);
    setResults(teaData[teaType]);
  };

  const reset = () => {
    setShowResults(false);
    setTeaType("black");
    setResults(null);
  };

  const faqs = [
    { question: "Why does tea get bitter?", answer: "Bitterness is usually caused by steeping for too long or using water that is too hot, especially for green and white teas. High heat releases tannins too quickly, resulting in an astringent taste." },
    { question: "Can I re-steep my tea leaves?", answer: "Yes, especially Oolong and high-quality Green teas. Each subsequent steep might reveal different flavor profiles. Increase the steeping time by 30-60 seconds for each additional steep." },
    { question: "Should I cover the tea while steeping?", answer: "Yes. Covering your cup or teapot helps maintain a consistent temperature and prevents aromatic oils from escaping with the steam, leading to a more flavorful cup." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tea Steeping Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Tea Steeping Calculator</h1>
            <p className="text-muted-foreground mb-8">Get the perfect temperature and timing for any variety of tea to ensure the best possible flavor profile without bitterness.</p>

            <div className="card-calculator mb-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Type of Tea</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(teaData).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTeaType(type)}
                      className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${teaType === type ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Timer className="h-5 w-5" /> Get Brewing Guide
                </button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Brewing Guide: {teaType.charAt(0).toUpperCase() + teaType.slice(1)} Tea</h2>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Water Temperature</p>
                    <p className="text-2xl font-black text-foreground">{results.tempC}</p>
                    <p className="text-sm text-muted-foreground mt-1">{results.tempF}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Steeping Time</p>
                    <p className="text-2xl font-black text-foreground">{results.time}</p>
                    <p className="text-sm text-muted-foreground mt-1">minutes</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
                  <h3 className="font-bold text-foreground mb-1">Brewer's Note</h3>
                  <p className="text-sm text-muted-foreground">{results.desc}</p>
                </div>

                <ResultDisplay items={[
                  { label: "Optimal Temp (C)", value: 0, textValue: results.tempC },
                  { label: "Optimal Temp (F)", value: 0, textValue: results.tempF },
                  { label: "Duration", value: 0, textValue: results.time },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>The Importance of Temperature</h2>
              <p>Not all tea leaves are created equal. Black teas are fully oxidized and can withstand (and often require) boiling water to extract their deep flavors. Green and white teas, however, are delicate. Using boiling water on green tea "cooks" the leaves, resulting in a bitter, grassy taste rather than the sweet, nutty profile intended.</p>
              
              <h2>Steeping Time vs. Strength</h2>
              <p>If you want a stronger cup of tea, don't steep it for longer. Instead, use more tea leaves. Steeping beyond the recommended time will only release more bitter tannins without adding significant flavor or caffeine.</p>

              <h2>Water Quality</h2>
              <p>Since tea is 99% water, the quality of your water matters. Use filtered water if possible, and avoid re-boiling water, as this removes dissolved oxygen which helps release the tea's aromatics.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tea-steeping" />
            <PopularCalculators exclude="/calculator/tea-steeping-calculator" />
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

export default TeaSteepingCalculator;

