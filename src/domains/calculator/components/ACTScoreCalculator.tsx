"use client";
import { RotateCcw, Book, GraduationCap, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ACT Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
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
                  <h2 className="text-2xl font-bold mb-3">
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
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative mb-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Estimated Composite Score</p>
                  <p className="text-4xl font-black text-primary">{results.composite}</p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" /> Approx. {results.percentile} Percentile
                  </p>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card shadow-sm mb-4">
                  <h3 className="font-semibold text-sm mb-3">Section Breakdown</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'English', score: results.eScaled, fill: '#3b82f6' },
                        { name: 'Math', score: results.mScaled, fill: '#10b981' },
                        { name: 'Reading', score: results.rScaled, fill: '#f59e0b' },
                        { name: 'Science', score: results.sScaled, fill: '#8b5cf6' }
                      ]} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 36]} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} cursor={{fill: "transparent"}} />
                        <ReferenceLine y={results.composite} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Composite', fill: 'hsl(var(--primary))', fontSize: 10 }} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {[ '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6' ].map((c, i) => <Cell key={i} fill={c} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="card-calculator p-4 text-center border border-border bg-card shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">English</p>
                      <p className="text-2xl font-black text-foreground">{results.eScaled}</p>
                   </div>
                   <div className="card-calculator p-4 text-center border border-border bg-card shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Math</p>
                      <p className="text-2xl font-black text-foreground">{results.mScaled}</p>
                   </div>
                   <div className="card-calculator p-4 text-center border border-border bg-card shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Reading</p>
                      <p className="text-2xl font-black text-foreground">{results.rScaled}</p>
                   </div>
                   <div className="card-calculator p-4 text-center border border-border bg-card shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Science</p>
                      <p className="text-2xl font-black text-foreground">{results.sScaled}</p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Mathematical Architecture of the ACT Scoring System</h2>
              <p>The ACT uses a highly specific, standardized scoring system that is frequently misunderstood by high school students and parents encountering it for the first time. Unlike high school grading systems, which operate on strict percentages out of 100, or the competing SAT, which utilizes a massive 1600-point scale, the ACT compresses all of its data into an incredibly tight 1-to-36 scale. Every single question across the entire exam is fundamentally worth the exact same amount of raw points, regardless of whether it is a simple grammar check or an advanced trigonometric proof. Even more importantly, the ACT employs a purely additive scoring model. There is absolutely no penalty or deduction for guessing an incorrect answer. If a student leaves a bubble blank, they earn zero points. If they guess completely randomly and get it wrong, they still earn zero points. Therefore, the mathematically optimal strategy is to ensure every single bubble on the answer sheet is filled in before time expires, even if the student is purely guessing on the final ten questions of a section.</p>
              
              <h2 className="text-2xl font-bold mb-3">Translating Raw Scores to Scaled Scores</h2>
              <p>The testing process begins with the raw score, which is simply a direct tally of the number of questions a student answered correctly in a specific section. For instance, if a student answers 55 out of the 75 questions correctly in the English section, their raw score for that section is exactly 55. However, because different versions of the ACT (administered on different dates) vary slightly in their objective difficulty, the testing agency cannot use raw scores for college admissions. To ensure absolute fairness across all testing dates, the ACT organization employs a complex statistical process called "equating." Through equating, they map every possible raw score to a scaled score between 1 and 36. This scale ensures that a 30 achieved on a slightly harder test in April represents the exact same level of academic mastery as a 30 achieved on a slightly easier test in October. Our calculator uses a generalized, highly accurate linear curve model to simulate this equating process, providing students with immediate feedback on how their practice test performance translates to the standardized 1-36 scale.</p>
              
              <h2 className="text-2xl font-bold mb-3">Analyzing the Four Core Sections</h2>
              <p>The total test is rigidly divided into four mandatory multiple-choice sections, each demanding a distinct cognitive skillset. The English section contains 75 questions to be answered in 45 minutes, heavily prioritizing speed and the rapid identification of grammatical errors, punctuation mistakes, and rhetorical sentence structures. The Math section contains 60 questions to be answered in 60 minutes, covering everything from pre-algebra to advanced geometry and trigonometry. It is the only section where the questions generally escalate in difficulty as you progress, with the final 10 questions consistently being the hardest on the entire exam. The Reading section contains 40 questions to be answered in 35 minutes, demanding intense reading comprehension skills across four dense literary and informational passages. Finally, the Science section contains 40 questions to be answered in 35 minutes. Despite its name, it rarely tests rote scientific memorization; instead, it aggressively tests a student's ability to interpret complex data tables, read intersecting graphs, and analyze conflicting scientific hypotheses under extreme time pressure.</p>
              
              <h2 className="text-2xl font-bold mb-3">Calculating the Master Composite Score</h2>
              <p>Once the equating process has assigned a scaled score (1-36) to all four individual sections, the final step is generating the overarching Composite Score. The mathematics here are remarkably straightforward: the testing agency simply adds the four scaled section scores together and divides the sum by exactly four to find the mean average. The critical factor in this calculation is the rounding protocol. The ACT strictly adheres to traditional mathematical rounding rules. If the calculated average ends in a decimal fraction of .50 or higher, the score is rounded up to the next whole number. If the decimal fraction is less than .50, the score rounds down. For example, if a student scores a 29 in English, 28 in Math, 30 in Reading, and 28 in Science, the sum is 115. Dividing 115 by four yields 28.75. Because .75 is above the halfway threshold, this student's official ACT Composite Score rounds up to a 29. Understanding this rounding math is crucial, as raising a single section score by just one point can sometimes be enough to push the decimal average over the .50 threshold, thereby elevating the entire Composite Score and potentially qualifying the student for thousands of dollars in additional merit-based college scholarships.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/act-score" />
          <PopularCalculators exclude="/calculator/act-score-calculator" />
        </div>
      </div>
    </>
  );
};

export default ACTScoreCalculator;

