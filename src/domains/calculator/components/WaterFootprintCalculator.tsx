"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import PieChart from "@/domains/calculator/components/ui/PieChart";
import { RotateCcw, Droplets, Info, ShowerHead, Utensils, Calculator } from "lucide-react";

const WaterFootprintCalculator = () => {
  // Indoor usage (Daily)
  const [showers, setShowers] = useState("10"); // minutes/day
  const [toiletFlushes, setToiletFlushes] = useState("5");
  const [dishwashing, setDishwashing] = useState("1"); // loads/day
  const [laundry, setLaundry] = useState("0.3"); // loads/day (roughly 2-3 per week)

  // Diet (Indirect water)
  const [meatIntake, setMeatIntake] = useState("medium"); // meat uses huge water

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    // Indoor factors (gallons)
    const SHOWER_GPM = 2.1;
    const TOILET_GPF = 1.6;
    const DISH_GPL = 10;
    const LAUNDRY_GPL = 25;

    const directWater = (parseFloat(showers) * SHOWER_GPM) +
                      (parseFloat(toiletFlushes) * TOILET_GPF) +
                      (parseFloat(dishwashing) * DISH_GPL) +
                      (parseFloat(laundry) * LAUNDRY_GPL);

    // Indirect factors (liters per day, converted to gallons)
    // Source: Water Footprint Network
    const dietFactors: any = {
      vegan: 600, // 2300L
      vegetarian: 800, // 3000L
      low_meat: 1000, // 3800L
      medium: 1200, // 4500L
      heavy_meat: 1600 // 6000L
    };

    const indirectWater = dietFactors[meatIntake];
    const totalDaily = directWater + indirectWater;

    setResults({
      totalDaily,
      annualTotal: totalDaily * 365,
      directPercent: (directWater / totalDaily) * 100,
      indoorTotal: directWater,
      dietTotal: indirectWater
    });
  };

  const reset = () => {
    setShowResults(false);
    setShowers("10"); setToiletFlushes("5"); setDishwashing("1"); setLaundry("0.3");
    setMeatIntake("medium");
    setResults(null);
  };

  const faqs = [
    { question: "What is a water footprint?", answer: "A water footprint measures the amount of water used to produce each of the goods and services we use. It can be measured for a single process, such as growing rice, for a product, such as a pair of jeans, or for an entire person or country." },
    { question: "Why is meat so water-intensive?", answer: "Most of the water footprint of meat comes from the vast amount of water needed to grow the grain used to feed the animals. For example, it takes roughly 1,800 gallons of water to produce just one pound of beef." },
    { question: "How can I reduce my direct water use?", answer: "Shorter showers, installing low-flow faucets and toilets, and only running dishwashers and washing machines when they are full are the most effective ways to save water at home." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Water Footprint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Water Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <ShowerHead className="h-5 w-5" />
                    <h2 className="text-2xl font-bold mb-3">Direct Usage (Daily)</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputField id="showers" label="Shower Time" value={showers} onChange={setShowers} suffix="min" />
                    <InputField id="toilets" label="Toilet Flushes" value={toiletFlushes} onChange={setToiletFlushes} />
                    <InputField id="dishes" label="Dish Loads" value={dishwashing} onChange={setDishwashing} />
                    <InputField id="laundry" label="Laundry Loads" value={laundry} onChange={setLaundry} />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Utensils className="h-5 w-5" />
                    <h2 className="text-2xl font-bold mb-3">Dietary Impact (Indirect)</h2>
                  </div>
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Typical Diet</label>
                    <select value={meatIntake} onChange={(e) => setMeatIntake(e.target.value)} className="input-calc">
                      <option value="vegan">Vegan (Lowest)</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="low_meat">Low Meat (&lt; 50g/day)</option>
                      <option value="medium">Average Meat Intake</option>
                      <option value="heavy_meat">Heavy Meat (&gt; 100g/day)</option>
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Info className="h-3 w-3" /> Most of our water footprint is hidden in the food we eat.</p>
                  </div>
                </section>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Droplets className="h-5 w-5" /> Calculate Footprint
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Your Water Profile</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Daily Usage</p>
                    <p className="text-5xl font-black text-foreground">{Math.round(results.totalDaily).toLocaleString()} <span className="text-xl font-normal text-muted-foreground">Gal</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Annual Footprint</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.annualTotal).toLocaleString()} Gal</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <ResultDisplay items={[
                    { label: "Direct (Indoor) Water", value: 0, textValue: Math.round(results.indoorTotal) + " gal/day" },
                    { label: "Indirect (Food) Water", value: 0, textValue: Math.round(results.dietTotal) + " gal/day" },
                    { label: "Efficiency Score", value: 0, textValue: results.totalDaily < 800 ? "Excellent" : results.totalDaily < 1500 ? "Average" : "High" },
                  ]} />
                  <div className="flex justify-center">
                    <PieChart
                      segments={[
                        { label: "Indoor", value: results.indoorTotal, color: "hsl(211, 100%, 50%)" },
                        { label: "Food", value: results.dietTotal, color: "hsl(142, 70%, 45%)" },
                      ]}
                      size={160}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Three Colors of Water</h2>
              <p>Water footprints are divided into three categories to help understand the source and impact of consumption:</p>
              <ul>
                <li><strong>Blue Water:</strong> Surface and groundwater used for irrigation, industry, and domestic use.</li>
                <li><strong>Green Water:</strong> Rainwater that is stored in the soil and evaporated, transpired, or incorporated by plants.</li>
                <li><strong>Grey Water:</strong> The volume of freshwater required to assimilate pollutants to meet specific water quality standards.</li>
              </ul>
              <h3>The Virtual Water Trade</h3>
              <p>When we import a t-shirt or a piece of fruit, we are also importing the water that was used to produce it. This is called "virtual water." Many water-scarce regions are effectively exporting their precious water resources in the form of agricultural products to water-rich nations.</p>
              <h3>Why Direct Use is Only the Tip of the Iceberg</h3>
              <p>While we might notice the water flowing from our faucets, direct household use typically accounts for less than 5% of our total water footprint. The other 95% is hidden in the food we eat, the clothes we wear, and the products we use every day.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-footprint" />
          <PopularCalculators exclude="/calculator/water-footprint-calculator" />
        </div>
      </div>
    </>
  );
};

export default WaterFootprintCalculator;

