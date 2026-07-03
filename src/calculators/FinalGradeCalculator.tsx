"use client";
import { RotateCcw, TrendingUp, Percent, Target } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const FinalGradeCalculator = () => {
  const [currentGrade, setCurrentGrade] = useState("85");
  const [targetGrade, setTargetGrade] = useState("90");
  const [finalWeight, setFinalWeight] = useState("20");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const current = parseFloat(currentGrade) || 0;
    const target = parseFloat(targetGrade) || 0;
    const weight = (parseFloat(finalWeight) || 0) / 100;

    if (weight <= 0 || weight >= 1) {
      setResults(null);
      return;
    }

    // Formula: Target = (Current * (1 - Weight)) + (Needed * Weight)
    // Needed = (Target - (Current * (1 - Weight))) / Weight
    const needed = (target - (current * (1 - weight))) / weight;

    setResults({
      needed,
      isImpossible: needed > 100,
      isAlreadyAchieved: needed <= 0
    });
  };

  const reset = () => {
    setCurrentGrade("85");
    setTargetGrade("90");
    setFinalWeight("20");
  };

  const faqs = [
    { question: "How does this calculator work?", answer: "It uses your current grade and the percentage weight of your final exam to determine the minimum score you need on that final to reach your desired overall course grade." },
    { question: "What if I need more than 100%?", answer: "If the calculator says you need more than 100%, it means it is mathematically impossible to reach your target grade based on your current performance and the weight of the final, unless your instructor offers extra credit." },
    { question: "Is this for a single test or a whole semester?", answer: "This is typically used for a single 'final' assessment (exam or project) that has a specific percentage weight in your syllabus." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Final Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Final Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="max-w-2xl space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Current Grade (%)</label>
                        <input type="number" value={currentGrade} onChange={(e) => setCurrentGrade(e.target.value)} className="input-calc text-2xl font-black" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Target Grade (%)</label>
                        <input type="number" value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="input-calc text-2xl font-black border-primary/30" />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Final Exam Weight (%)</label>
                        <div className="relative">
                           <input type="number" value={finalWeight} onChange={(e) => setFinalWeight(e.target.value)} className="input-calc text-2xl font-black" />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <button onClick={reset} className="w-full p-4 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold">
                          <RotateCcw className="h-5 w-5" /> Reset
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button
                  onClick={reset}
                  className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-70">Required Final Exam Score</p>
                    <p className={`text-7xl font-black ${results.isImpossible ? "text-red-600" : results.isAlreadyAchieved ? "text-emerald-600" : "text-foreground"}`}>
                      {results.isAlreadyAchieved ? "0" : results.needed.toFixed(1)}<span className="text-3xl font-normal opacity-50">%</span>
                    </p>
                    
                    <div className="mt-8 flex flex-col items-center gap-2">
                       {results.isImpossible ? (
                         <div className="flex items-center gap-2 text-red-700 bg-red-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                           <Target className="h-4 w-4" /> Not Mathematically Possible
                         </div>
                       ) : results.isAlreadyAchieved ? (
                         <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                           <TrendingUp className="h-4 w-4" /> Already Achieved!
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                           <Percent className="h-4 w-4" /> Good luck on your final!
                         </div>
                       )}
                    </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Planning for Your Final Exam</h2>
              <p>The "Final Grade" calculation is a rite of passage for students everywhere. As the semester ends, knowing exactly what score you need can help you prioritize your study time effectively.</p>
              
              <h3>The Impact of Weighting</h3>
              <p>The most important variable in this calculation is the weight of the final. A final worth 40% of your grade gives you a massive opportunity to swing your final mark up (or down), whereas a final worth only 10% will barely move the needle even with a perfect score.</p>

              <h3>Strategic Studying</h3>
              <p>If you find that you need a very low score (like 40%) to maintain your target grade, you might choose to dedicate more study time to a different class where the required score is higher. Conversely, if you need a high score (95%+), you know you need to focus intensely on that subject.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/final-grade" />
          <PopularCalculators exclude="/calculator/final-grade-calculator" />
        </div>
      </div>
    </>
  );
};

export default FinalGradeCalculator;

