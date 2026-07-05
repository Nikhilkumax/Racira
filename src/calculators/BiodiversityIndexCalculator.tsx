"use client";
import { RotateCcw, Trees, Plus, Trash2, PieChart } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
interface Species {
  id: number;
  name: string;
  count: number;
}

const BiodiversityIndexCalculator = () => {
  const [speciesList, setSpeciesList] = useState<Species[]>([
    { id: 1, name: "Species A", count: 15 },
    { id: 2, name: "Species B", count: 8 },
    { id: 3, name: "Species C", count: 3 }
  ]);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const addSpecies = () => {
    setSpeciesList([...speciesList, { id: Date.now(), name: `Species ${String.fromCharCode(65 + speciesList.length)}`, count: 0 }]);
  };

  const updateSpecies = (id: number, field: string, value: string | number) => {
    setSpeciesList(speciesList.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSpecies = (id: number) => {
    if (speciesList.length > 1) {
      setSpeciesList(speciesList.filter(s => s.id !== id));
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
    let totalN = 0;
    let sumNnMinus1 = 0;

    speciesList.forEach(s => {
      const n = Number(s.count) || 0;
      totalN += n;
      sumNnMinus1 += n * (n - 1);
    });

    if (totalN <= 1) {
      setResults(null);
      return;
    }

    // Simpson's Index (D)
    const d = sumNnMinus1 / (totalN * (totalN - 1));
    
    // Simpson's Index of Diversity (1 - D)
    const diversityIndex = 1 - d;
    
    // Simpson's Reciprocal Index (1 / D)
    const reciprocalIndex = d > 0 ? 1 / d : 0;

    setResults({
      totalN,
      richness: speciesList.filter(s => s.count > 0).length,
      d,
      diversityIndex,
      reciprocalIndex
    });
  };

  const reset = () => {
    setSpeciesList([
      { id: 1, name: "Species A", count: 15 },
      { id: 2, name: "Species B", count: 8 },
      { id: 3, name: "Species C", count: 3 }
    ]);
  };

  const faqs = [
    { question: "What is Simpson's Diversity Index?", answer: "It is a mathematical measure that characterizes species diversity in a community. The index accounts for both the number of species present (richness) and the relative abundance of each species (evenness)." },
    { question: "What is the difference between D, 1-D, and 1/D?", answer: "Simpson's Index (D) measures the probability that two randomly selected individuals belong to the same species (0 to 1, where 0 is infinite diversity and 1 is no diversity). The Index of Diversity (1-D) flips this, so 1 represents infinite diversity. The Reciprocal Index (1/D) has a lowest value of 1 (a community with only one species) and a maximum value equal to the number of species." },
    { question: "Why is biodiversity important?", answer: "High biodiversity increases ecosystem stability and resilience. It ensures natural sustainability for all life forms and provides essential resources and services, from food to clean water and medicine." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Biodiversity Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Biodiversity Index Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold mb-3">
                     <Trees className="h-5 w-5 text-primary" /> Species Data
                   </h2>
                   <button onClick={addSpecies} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 flex items-center gap-1 transition-colors">
                     <Plus className="h-3 w-3" /> Add
                   </button>
                </div>
                
                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {speciesList.map((species, index) => (
                    <div key={species.id} className="flex gap-2 items-center bg-secondary/10 p-2 rounded-xl border border-border">
                       <span className="text-xs font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                       <input 
                         type="text" 
                         value={species.name} 
                         onChange={(e) => updateSpecies(species.id, "name", e.target.value)}
                         className="flex-1 input-calc py-2 text-sm"
                         placeholder="Species Name"
                       />
                       <input 
                         type="number" 
                         value={species.count === 0 ? "" : species.count} 
                         onChange={(e) => updateSpecies(species.id, "count", parseInt(e.target.value) || 0)}
                         className="w-24 input-calc py-2 text-sm text-center"
                         placeholder="Count"
                         min="0"
                       />
                       <button onClick={() => removeSpecies(species.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" disabled={speciesList.length <= 1}>
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  ))}
                </div>

                <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset Data
                </button>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">
                     <PieChart className="h-5 w-5 text-primary" /> Analysis Results
                  </h2>
                  
                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 text-center mb-6">
                     <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Index of Diversity (1 - D)</p>
                     <p className="text-5xl font-black text-foreground mb-2">{results.diversityIndex.toFixed(4)}</p>
                     <p className="text-xs text-muted-foreground">0 = No diversity, 1 = Infinite diversity</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 flex-1">
                     <div className="bg-secondary/10 rounded-xl p-4 border border-border flex flex-col justify-center text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Individuals (N)</p>
                        <p className="text-2xl font-black">{results.totalN}</p>
                     </div>
                     <div className="bg-secondary/10 rounded-xl p-4 border border-border flex flex-col justify-center text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Species Richness</p>
                        <p className="text-2xl font-black">{results.richness}</p>
                     </div>
                     <div className="bg-secondary/10 rounded-xl p-4 border border-border flex flex-col justify-center text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Simpson's Index (D)</p>
                        <p className="text-xl font-black">{results.d.toFixed(4)}</p>
                     </div>
                     <div className="bg-secondary/10 rounded-xl p-4 border border-border flex flex-col justify-center text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Reciprocal (1/D)</p>
                        <p className="text-xl font-black">{results.reciprocalIndex.toFixed(4)}</p>
                     </div>
                  </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Biodiversity Indexes</h2>
              <p>In ecology, a diversity index is a quantitative measure that reflects how many different types (such as species) there are in a dataset, and simultaneously takes into account how evenly the basic entities (such as individuals) are distributed among those types.</p>
              
              <h3>Richness vs. Evenness</h3>
              <p><strong>Species Richness</strong> is simply the number of different species present in a community. A forest with 50 species is 'richer' than one with 10.</p>
              <p><strong>Species Evenness</strong> compares the similarity of the population size of each of the species present. If one species dominates 90% of the forest, the evenness is low. If all species have roughly equal populations, the evenness is high.</p>

              <h3>How Simpson's Index Works</h3>
              <p>Simpson's Index takes both richness and evenness into account. The formula calculates the probability that two individuals randomly selected from a sample will belong to the same species. A highly diverse ecosystem will have a low probability (a low D value), which is why we often use `1 - D` to represent the final score, where a higher score means higher diversity.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/biodiversity-index" />
          <PopularCalculators exclude="/calculator/biodiversity-index-calculator" />
        </div>
      </div>
    </>
  );
};

export default BiodiversityIndexCalculator;

