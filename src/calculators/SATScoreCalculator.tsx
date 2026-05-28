"use client";
import { RotateCcw, BookOpen, Calculator, CheckCircle2 } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const SATScoreCalculator = () => {
  const [readingRaw, setReadingRaw] = useState("45"); // 0-52
  const [writingRaw, setWritingRaw] = useState("40"); // 0-44
  const [mathRaw, setMathRaw] = useState("50"); // 0-58

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const rRaw = parseInt(readingRaw) || 0;
    const wRaw = parseInt(writingRaw) || 0;
    const mRaw = parseInt(mathRaw) || 0;

    // SAT Scoring is complex and uses a conversion table (scaled score).
    // This is a simplified linear approximation of the 2024 SAT tables.
    
    // Reading/Writing (800)
    // Reading Raw (52) -> Reading Scaled (10-40)
    // Writing Raw (44) -> Writing Scaled (10-40)
    // ERW Score = (Reading Scaled + Writing Scaled) * 10
    
    const rScaled = Math.round(10 + (rRaw / 52) * 30);
    const wScaled = Math.round(10 + (wRaw / 44) * 30);
    const erwScore = Math.min(800, Math.max(200, (rScaled + wScaled) * 10));

    // Math (800)
    // Math Raw (58) -> Math Scaled (200-800)
    const mathScore = Math.min(800, Math.max(200, Math.round(200 + (mRaw / 58) * 600)));

    const totalScore = erwScore + mathScore;

    setResults({
      erwScore,
      mathScore,
      totalScore,
      percentile: totalScore >= 1550 ? "99th" : totalScore >= 1400 ? "95th" : totalScore >= 1200 ? "75th" : totalScore >= 1050 ? "50th" : "Below 50th"
    });
  };

  const reset = () => {
    setReadingRaw("45");
    setWritingRaw("40");
    setMathRaw("50");
  };

  const faqs = [
    { question: "How is the SAT scored?", answer: "The SAT is scored on a scale of 400-1600. It consists of two main sections: Evidence-Based Reading and Writing (ERW) and Math, each worth 200-800 points." },
    { question: "What is a good SAT score?", answer: "A 1200 is above average and considered a good score for many state universities. A 1400+ is competitive for top-tier universities, and a 1500+ is usually required for Ivy League schools." },
    { question: "Does this calculator use the Digital SAT scale?", answer: "This calculator uses an approximation of the traditional SAT scoring curve. The new Digital SAT uses multistage adaptive testing, meaning the difficulty of the second module depends on your performance in the first, making exact raw-to-scaled conversion impossible without full test data." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "SAT Score Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SAT Score Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your total SAT score and section scores based on your raw correct answers.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-primary" /> Reading & Writing
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Reading Raw Score (0-52)</label>
                    <input type="number" value={readingRaw} onChange={(e) => setReadingRaw(e.target.value)} className="input-calc" min="0" max="52" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Writing Raw Score (0-44)</label>
                    <input type="number" value={writingRaw} onChange={(e) => setWritingRaw(e.target.value)} className="input-calc" min="0" max="44" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5 text-primary" /> Mathematics
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Math Raw Score (0-58)</label>
                    <input type="number" value={mathRaw} onChange={(e) => setMathRaw(e.target.value)} className="input-calc" min="0" max="58" />
                    <p className="text-[10px] text-muted-foreground mt-1">Total correct across both No-Calculator and Calculator sections.</p>
                  </div>
                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                      <RotateCcw className="h-4 w-4" /> Reset 
                    </button>
                  </div>
                </section>
              </div>
            
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Score</button>
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
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-10 mb-6 relative overflow-hidden">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated Total SAT Score</p>
                    <p className="text-7xl font-black text-foreground">{results.totalScore}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mx-auto">
                      <CheckCircle2 className="h-4 w-4" /> Approx. {results.percentile} Percentile
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                   <div className="card-calculator p-6 text-center border-emerald-500/20 bg-emerald-500/5">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Reading & Writing</p>
                      <p className="text-3xl font-black text-foreground">{results.erwScore}</p>
                   </div>
                   <div className="card-calculator p-6 text-center border-blue-500/20 bg-blue-500/5">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Mathematics</p>
                      <p className="text-3xl font-black text-foreground">{results.mathScore}</p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Understanding the SAT Curve</h2>
              <p>The SAT uses a process called "equating" to ensure that scores are consistent across different test dates, regardless of slight variations in difficulty. This means that missing two questions on a particularly hard test might result in the same scaled score as missing zero questions on an easier test.</p>
              
              <h3>Raw Score vs. Scaled Score</h3>
              <p>Your raw score is simply the number of questions you answered correctly. There is no penalty for guessing. This raw score is then converted to a scaled score (200-800) using a table specific to that test form. This calculator provides an average conversion based on historical SAT curves.</p>

              <h3>Section Weighting</h3>
              <p>The SAT is divided into two 800-point halves. The first is the Evidence-Based Reading and Writing section, which combines your performance on the Reading test and the Writing & Language test. The second is the Math section, which combines the calculator and non-calculator portions.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sat-score" />
          <PopularCalculators exclude="/calculator/sat-score-calculator" />
        </div>
      </div>
    </>
  );
};

export default SATScoreCalculator;

