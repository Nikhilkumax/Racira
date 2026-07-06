"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Trees, Leaf, Wind } from "lucide-react";

const TreePlantingOffsetCalculator = () => {
  const [targetCO2, setTargetCO2] = useState("5000"); // kg CO2 to offset
  const [treeType, setTreeType] = useState("average");
  const [timePeriod, setTimePeriod] = useState("10"); // years to achieve offset

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const target = parseFloat(targetCO2) || 0;
    const years = parseFloat(timePeriod) || 10;
    
    // Sequestration rates (kg CO2 per tree per year)
    // Source: Arbor Day Foundation / Ecotree
    const rates: any = {
      average: 22,    // General mixed forest average
      tropical: 30,   // Tropical rainforest (high growth)
      coniferous: 18, // Pine/Spruce (evergreen)
      deciduous: 24   // Oak/Maple (leafy)
    };

    const ratePerYear = rates[treeType];
    const totalCapPerTree = ratePerYear * years;
    
    const treesNeeded = Math.ceil(target / totalCapPerTree);
    const forestArea = (treesNeeded * 10) / 10000; // ~10sqm per tree, converted to hectares

    setResults({
      treesNeeded,
      ratePerYear,
      totalCapPerTree,
      forestArea,
      monthlySequestration: (treesNeeded * ratePerYear) / 12
    });
  };

  const reset = () => {
    setShowResults(false);
    setTargetCO2("5000"); setTreeType("average"); setTimePeriod("10");
    setResults(null);
  };

  const faqs = [
    { question: "How much CO2 does one tree absorb?", answer: "On average, a mature tree absorbs about 22 kg (48 lbs) of CO2 per year. During its first 10 years, the rate is lower, and it increases as the tree reaches maturity." },
    { question: "How many trees make a forest?", answer: "In carbon offsetting terms, 1,000 trees can sequester roughly 22 tons of CO2 per year, covering about 1 hectare (2.5 acres) of land depending on the species and spacing." },
    { question: "Can I offset my entire life with trees?", answer: "While planting trees is vital, it takes time. A tree planted today may take 20 years to reach its full absorption potential. Offsetting should be a secondary strategy after reducing direct emissions." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tree Planting Offset Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tree Planting Offset Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="target" label="CO2 to Offset" value={targetCO2} onChange={setTargetCO2} suffix="kg" tooltip="Enter your annual emissions or a specific event's footprint." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tree Category</label>
                  <select value={treeType} onChange={(e) => setTreeType(e.target.value)} className="input-calc">
                    <option value="average">Mixed Average</option>
                    <option value="tropical">Tropical (Fastest)</option>
                    <option value="coniferous">Evergreen (Pine/Spruce)</option>
                    <option value="deciduous">Leafy (Oak/Maple)</option>
                  </select>
                </div>
                <InputField id="period" label="Timeframe (Years)" value={timePeriod} onChange={setTimePeriod} suffix="yrs" />
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
                <h2 className="text-2xl font-bold mb-3">Offset Strategy</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Trees to Plant</p>
                    <p className="text-5xl font-black text-foreground">{results.treesNeeded.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-2">To offset {targetCO2}kg in {timePeriod} years</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Required Area</p>
                    <p className="text-3xl font-black text-foreground">{results.forestArea.toFixed(3)} <span className="text-lg">ha</span></p>
                    <p className="text-xs text-muted-foreground mt-1">({(results.forestArea * 10000).toFixed(0)} m²)</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl"><Wind className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-1">Absorption Power</h3>
                      <p className="text-sm text-muted-foreground mb-4">Each tree will absorb approximately <strong>{results.totalCapPerTree.toFixed(0)} kg</strong> of CO2 over the {timePeriod}-year period.</p>
                      <ResultDisplay items={[
                        { label: "Annual Absorption", value: 0, textValue: (results.treesNeeded * results.ratePerYear).toFixed(0) + " kg/yr" },
                        { label: "Monthly Progress", value: 0, textValue: results.monthlySequestration.toFixed(1) + " kg/mo" },
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
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Nature's Solution</h2>
              <p>Reforestation is one of the most scalable and cost-effective ways to remove existing carbon dioxide from the atmosphere. Trees act as natural "carbon sinks," pulling CO2 from the air to build their trunks, branches, and roots.</p>
              <h3>The Time Factor</h3>
              <p>It's important to remember that tree planting is a long-term commitment. A sapling planted today won't reach its peak absorption rate for 10 to 20 years. This is why preserving existing old-growth forests is even more critical than planting new ones—a mature forest has already done the decades of work required to become a massive carbon storage system.</p>
              <h3>Biodiversity and Ecosystems</h3>
              <p>Effective carbon offsetting isn't just about the number of trees; it's about planting the right species in the right places. Monoculture plantations (planting only one type of tree) are vulnerable to disease and support very little wildlife. Diverse, native forests are much more resilient and provide additional benefits like soil protection and water filtration.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tree-planting-offset" />
          <PopularCalculators exclude="/calculator/tree-planting-offset-calculator" />
        </div>
      </div>
    </>
  );
};

export default TreePlantingOffsetCalculator;

