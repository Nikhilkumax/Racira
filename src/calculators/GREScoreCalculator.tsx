"use client";
import { RotateCcw, FileText, Brain } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const GREScoreCalculator = () => {
  const [verbalRaw, setVerbalRaw] = useState("15"); // 0-27 per section, total depends on version
  const [quantRaw, setQuantRaw] = useState("20");
  const [writingScore, setWritingScore] = useState("4.0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const vRaw = parseInt(verbalRaw) || 0;
    const qRaw = parseInt(quantRaw) || 0;
    const wScore = parseFloat(writingScore) || 0;

    // GRE is now a shorter test (started Sept 2023).
    // Total questions: Verbal ~27, Quant ~27.
    // Score range: 130-170 for each section.
    
    // Simplified model: 130 + (Raw / 27) * 40
    const vScaled = Math.min(170, Math.max(130, 130 + Math.round((vRaw / 27) * 40)));
    const qScaled = Math.min(170, Math.max(130, 130 + Math.round((qRaw / 27) * 40)));

    setResults({
      vScaled,
      qScaled,
      total: vScaled + qScaled,
      writing: wScore,
      vPercentile: vScaled >= 165 ? "96th" : vScaled >= 155 ? "65th" : "Below 50th",
      qPercentile: qScaled >= 165 ? "80th" : qScaled >= 160 ? "66th" : "Below 50th"
    });
  };

  const reset = () => {
    setVerbalRaw("15"); setQuantRaw("20"); setWritingScore("4.0");
  };

  const faqs = [
    { question: "How is the GRE scored?", answer: "The GRE General Test provides three scores: Verbal Reasoning (130-170), Quantitative Reasoning (130-170), and Analytical Writing (0-6.0 in half-point increments)." },
    { question: "What is a good GRE score?", answer: "A 'good' score depends on your target graduate program. Generally, a total score of 300 is average, 315 is strong for most master's programs, and 325+ is competitive for top-tier PhD programs and business schools." },
    { question: "Is the GRE adaptive?", answer: "Yes, the GRE is section-level adaptive. This means the difficulty of the second Verbal and Quantitative sections depends on how well you did on the first section. This calculator provides an estimate based on your total raw correct answers across both sections." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "GRE Score Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GRE Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Brain className="h-5 w-5" /> Reasoning Sections
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Verbal Raw Score (0-27)</label>
                    <input type="number" value={verbalRaw} onChange={(e) => setVerbalRaw(e.target.value)} className="input-calc" min="0" max="27" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Quant Raw Score (0-27)</label>
                    <input type="number" value={quantRaw} onChange={(e) => setQuantRaw(e.target.value)} className="input-calc" min="0" max="27" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <FileText className="h-5 w-5" /> Analytical Writing
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">AW Score (0-6.0)</label>
                    <select value={writingScore} onChange={(e) => setWritingScore(e.target.value)} className="input-calc font-bold">
                      {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6].map(v => (
                        <option key={v} value={v.toFixed(1)}>{v.toFixed(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                      <RotateCcw className="h-4 w-4" /> Reset 
                    </button>
                  </div>
                </section>
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
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-10 mb-6 relative overflow-hidden">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated Total GRE Score</p>
                    <p className="text-7xl font-black text-foreground">{results.total}</p>
                    <p className="text-xs text-muted-foreground mt-2">(Verbal + Quantitative)</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                   <div className="card-calculator p-6 text-center border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Verbal</p>
                      <p className="text-3xl font-black text-foreground">{results.vScaled}</p>
                      <p className="text-[10px] text-primary font-bold mt-2">{results.vPercentile}</p>
                   </div>
                   <div className="card-calculator p-6 text-center border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Quantitative</p>
                      <p className="text-3xl font-black text-foreground">{results.qScaled}</p>
                      <p className="text-[10px] text-primary font-bold mt-2">{results.qPercentile}</p>
                   </div>
                   <div className="card-calculator p-6 text-center border-amber-500/10 bg-amber-500/5">
                      <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Analytical Writing</p>
                      <p className="text-3xl font-black text-amber-800">{results.writing.toFixed(1)}</p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>The New, Shorter GRE</h2>
              <p>In September 2023, ETS (Educational Testing Service) introduced a shorter version of the GRE General Test. The new test is under two hours long—nearly half the length of the previous version. While the format changed, the score scale of 130-170 remains the same.</p>
              
              <h3>Section Composition</h3>
              <p>The shorter GRE consists of one Analytical Writing task (the 'Analyze an Issue' essay) and two Verbal and two Quantitative sections. Because there are fewer questions overall, each individual question now has a greater impact on your final scaled score.</p>

              <h3>Adaptive Testing Logic</h3>
              <p>The GRE is "section-level adaptive." This means that the computer selects the difficulty of the second section based on your performance in the first. If you do very well on the first Quant section, the second Quant section will be harder, but your potential score range will be higher.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gre-score" />
          <PopularCalculators exclude="/calculator/gre-score-calculator" />
        </div>
      </div>
    </>
  );
};

export default GREScoreCalculator;

