"use client";
import { RotateCcw, Book, GraduationCap, Calculator } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const ACTScoreCalculator = () => {
  const [englishRaw, setEnglishRaw] = useState("65"); // 0-75
  const [mathRaw, setMathRaw] = useState("50"); // 0-60
  const [readingRaw, setReadingRaw] = useState("35"); // 0-40
  const [scienceRaw, setScienceRaw] = useState("35"); // 0-40

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const rawToScaled = (raw: number, maxRaw: number) => {
    // ACT scale is 1-36.
    // Simplified linear model: 1 + (raw/maxRaw) * 35
    if (raw === 0) return 1;
    if (raw >= maxRaw) return 36;
    return Math.round(1 + (raw / maxRaw) * 35);
  };

  const handleCalculate = () => {
    setShowResults(true);
    const e = parseInt(englishRaw) || 0;
    const m = parseInt(mathRaw) || 0;
    const r = parseInt(readingRaw) || 0;
    const s = parseInt(scienceRaw) || 0;

    const eScaled = rawToScaled(e, 75);
    const mScaled = rawToScaled(m, 60);
    const rScaled = rawToScaled(r, 40);
    const sScaled = rawToScaled(s, 40);

    const composite = Math.round((eScaled + mScaled + rScaled + sScaled) / 4);

    setResults({
      eScaled, mScaled, rScaled, sScaled,
      composite,
      percentile: composite >= 34 ? "99th" : composite >= 30 ? "93rd" : composite >= 25 ? "78th" : composite >= 21 ? "50th" : "Below 50th"
    });
  };

  const reset = () => {
    setEnglishRaw("65"); setMathRaw("50"); setReadingRaw("35"); setScienceRaw("35");
  };

  const faqs = [
    { question: "How is the ACT composite score calculated?", answer: "Your ACT composite score is the average of your four section scores (English, Math, Reading, and Science), rounded to the nearest whole number. Each section is scored on a scale of 1-36." },
    { question: "What is a good ACT score?", answer: "An ACT score of 21 is the national average. A 24+ is considered a good score, a 30+ is very strong, and a 34-36 is elite (top 1% of test-takers)." },
    { question: "Is the ACT easier than the SAT?", answer: "Neither test is 'easier'—they just test different strengths. The ACT has a faster pace (less time per question) and includes a dedicated Science section, whereas the SAT has more time per question and a heavier focus on advanced vocabulary and multi-step math problems." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "ACT Score Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">ACT Score Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Predict your ACT composite score by converting your raw scores into the standard 1-36 scale.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                <section className="space-y-6">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
                    <Book className="h-5 w-5" /> Language & Reading
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">English Raw (0-75)</label>
                    <input type="number" value={englishRaw} onChange={(e) => setEnglishRaw(e.target.value)} className="input-calc" min="0" max="75" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Reading Raw (0-40)</label>
                    <input type="number" value={readingRaw} onChange={(e) => setReadingRaw(e.target.value)} className="input-calc" min="0" max="40" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-600">
                    <Calculator className="h-5 w-5" /> Math & Science
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Math Raw (0-60)</label>
                    <input type="number" value={mathRaw} onChange={(e) => setMathRaw(e.target.value)} className="input-calc" min="0" max="60" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Science Raw (0-40)</label>
                    <input type="number" value={scienceRaw} onChange={(e) => setScienceRaw(e.target.value)} className="input-calc" min="0" max="40" />
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Score</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-12 mb-6">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated Composite Score</p>
                    <p className="text-8xl font-black text-foreground">{results.composite}</p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mx-auto">
                      <GraduationCap className="h-4 w-4" /> Approx. {results.percentile} Percentile
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="card-calculator p-4 text-center border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">English</p>
                      <p className="text-2xl font-black text-foreground">{results.eScaled}</p>
                   </div>
                   <div className="card-calculator p-4 text-center border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Math</p>
                      <p className="text-2xl font-black text-foreground">{results.mScaled}</p>
                   </div>
                   <div className="card-calculator p-4 text-center border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Reading</p>
                      <p className="text-2xl font-black text-foreground">{results.rScaled}</p>
                   </div>
                   <div className="card-calculator p-4 text-center border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Science</p>
                      <p className="text-2xl font-black text-foreground">{results.sScaled}</p>
                   </div>
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />
            <article className="prose-finance">
              <h2>The ACT Scoring System</h2>
              <p>The ACT uses a unique scoring system that can be confusing for first-time test-takers. Unlike the SAT's 1600-point scale, the ACT focuses on a compact 1-36 range. Every question is worth the same amount of points, and there is no deduction for wrong answers.</p>
              
              <h3>Section Breakdown</h3>
              <ul>
                 <li><strong>English (75 Questions):</strong> Focuses on grammar, punctuation, and sentence structure.</li>
                 <li><strong>Math (60 Questions):</strong> Covers Algebra, Geometry, and Trigonometry.</li>
                 <li><strong>Reading (40 Questions):</strong> Tests reading comprehension through four passages.</li>
                 <li><strong>Science (40 Questions):</strong> Focuses on data interpretation and scientific reasoning rather than specific scientific facts.</li>
              </ul>

              <h3>How the Composite is Formed</h3>
              <p>The composite score is the average of the four sections. If the average ends in a decimal of .5 or higher, it is rounded up to the next whole number. For example, if your average is 28.25, your composite is 28. If your average is 28.5, your composite is 29.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/act-score" />
            <PopularCalculators exclude="/calculator/act-score-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ACTScoreCalculator;

