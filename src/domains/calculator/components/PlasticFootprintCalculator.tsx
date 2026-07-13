"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Package, Trash2, Info, ShoppingBag } from "lucide-react";

const PlasticFootprintCalculator = () => {
  // Common plastic items (Weekly usage)
  const [bottles, setBottles] = useState("5"); // PET bottles
  const [bags, setBags] = useState("3"); // Shopping bags
  const [wrappers, setWrappers] = useState("10"); // Food wrappers/packaging
  const [takeout, setTakeout] = useState("2"); // Takeout containers
  const [straws, setStraws] = useState("0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    // Average weight in grams
    const PET_BOTTLE = 25;
    const BAG = 5;
    const WRAPPER = 8;
    const CONTAINER = 30;
    const STRAW = 0.5;

    const weeklyGrams = (parseFloat(bottles) * PET_BOTTLE) +
                        (parseFloat(bags) * BAG) +
                        (parseFloat(wrappers) * WRAPPER) +
                        (parseFloat(takeout) * CONTAINER) +
                        (parseFloat(straws) * STRAW);

    const annualKG = (weeklyGrams * 52) / 1000;

    setResults({
      annualKG,
      lifetimeKG: annualKG * 60, // Assuming 60 more years
      bottlesPerYear: parseFloat(bottles) * 52,
      bagsPerYear: parseFloat(bags) * 52,
      impact: annualKG < 5 ? "Low" : annualKG < 15 ? "Average" : "High"
    });
  };

  const reset = () => {
    setShowResults(false);
    setBottles("5"); setBags("3"); setWrappers("10"); setTakeout("2"); setStraws("0");
    setResults(null);
  };

  const faqs = [
    { question: "How much plastic is produced globally?", answer: "Over 400 million tonnes of plastic are produced every year. Roughly half of that is designed to be used only once and then thrown away." },
    { question: "What happens to most plastic waste?", answer: "Globally, only about 9% of plastic waste is recycled. The rest ends up in landfills, is incinerated, or leaks into the environment, where it can take hundreds of years to decompose." },
    { question: "How can I reduce my plastic footprint?", answer: "Key steps include using reusable water bottles and shopping bags, avoiding products with excessive plastic packaging, and choosing glass or metal containers over plastic ones." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Plastic Footprint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Plastic Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-2xl font-bold mb-3">Weekly Consumption</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="bottles" label="Plastic Bottles" value={bottles} onChange={setBottles} suffix="qty" />
                <InputField id="bags" label="Shopping Bags" value={bags} onChange={setBags} suffix="qty" />
                <InputField id="wrappers" label="Food Wrappers" value={wrappers} onChange={setWrappers} suffix="qty" />
                <InputField id="takeout" label="Takeout Containers" value={takeout} onChange={setTakeout} suffix="qty" />
                <InputField id="straws" label="Plastic Straws" value={straws} onChange={setStraws} suffix="qty" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Package className="h-5 w-5" /> Calculate Footprint
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Waste Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual Plastic Waste</p>
                    <p className="text-5xl font-black text-foreground">{results.annualKG.toFixed(1)} <span className="text-xl font-normal text-muted-foreground">kg</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Impact Rating</p>
                    <p className="text-3xl font-black text-foreground">{results.impact}</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl"><Trash2 className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-2">Long-term Accumulation</h3>
                      <p className="text-sm text-muted-foreground mb-4">If your current habits continue, you will contribute approximately <strong>{results.lifetimeKG.toFixed(0)} kg</strong> of plastic to the environment over the next 60 years.</p>
                      <ResultDisplay items={[
                        { label: "Annual Bottles", value: 0, textValue: results.bottlesPerYear + " units" },
                        { label: "Annual Bags", value: 0, textValue: results.bagsPerYear + " units" },
                        { label: "Daily Plastic Weight", value: 0, textValue: ((results.annualKG * 1000) / 365).toFixed(1) + " g/day" },
                      ]} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Plastic Problem</h2>
              <p>Plastic is a miracle material: it's cheap, durable, and lightweight. However, those same qualities make it a nightmare for the environment. Most single-use plastics are used for just a few minutes but persist in the environment for centuries.</p>
              <h3>Microplastics: The Invisible Threat</h3>
              <p>As plastic items break down, they don't disappear; they simply become smaller. These "microplastics" have been found in the deepest parts of the ocean, in the air we breathe, and even in the human bloodstream. Reducing our use of macro-plastics (like bottles and bags) is the only way to stop the inflow of microplastics into our ecosystems.</p>
              <h3>Refuse, Reduce, Reuse, Recycle</h3>
              <p>While recycling is often promoted as the primary solution, it is actually the last resort. The most effective action is to <strong>refuse</strong> single-use items entirely. If you can't refuse, <strong>reduce</strong> the amount you use. If you must use it, <strong>reuse</strong> it as many times as possible. Only when an item is truly at the end of its life should you <strong>recycle</strong> it.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/plastic-footprint" />
          <PopularCalculators exclude="/calculator/plastic-footprint-calculator" />
        </div>
      </div>
    </>
  );
};

export default PlasticFootprintCalculator;

