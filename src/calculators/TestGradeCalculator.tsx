"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, FileText, Info, Calculator, CheckCircle, XCircle } from "lucide-react";

const TestGradeCalculator = () => {
  const [numQuestions, setNumQuestions] = useState("50");
  const [numWrong, setNumWrong] = useState("5");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const total = parseInt(numQuestions);
    const wrong = parseInt(numWrong);

    if (isNaN(total) || total <= 0) return;
    if (isNaN(wrong) || wrong < 0) return;

    const score = ((total - wrong) / total) * 100;
    
    // Generate scale
    const scale = [];
    for (let i = 0; i <= Math.min(total, 20); i++) {
      scale.push({
        wrong: i,
        grade: (((total - i) / total) * 100).toFixed(1)
      });
    }

    setResults({
      score,
      letterGrade: getLetterGrade(score),
      correct: total - wrong,
      scale
    });
  };

  const getLetterGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const reset = () => {
    setShowResults(false);
    setNumQuestions("50"); setNumWrong("5");
    setResults(null);
  };

  const faqs = [
    { question: "How is the test grade calculated?", answer: "The grade is calculated by subtracting the number of wrong answers from the total number of questions, then dividing by the total number of questions and multiplying by 100." },
    { question: "What if I have half-points?", answer: "You can enter decimals in the 'Number Wrong' field (e.g., 2.5) if you give partial credit for some answers." },
    { question: "Is this based on a standard curve?", answer: "This tool provides a straight percentage grade. It does not account for bell curves or other custom grading scales unless you manually adjust your letter grade thresholds." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Test Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Test Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="total" label="Number of Questions" value={numQuestions} onChange={setNumQuestions} />
                <InputField id="wrong" label="Number Wrong" value={numWrong} onChange={setNumWrong} />
              </div>

                <button
                  onClick={handleCalculate}
                  className="flex-1 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >Calculate</button>
                <button onClick={reset} className="w-full mt-4 p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Final Score</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Percentage Score</p>
                    <p className="text-5xl font-black text-foreground">{results.score.toFixed(1)} <span className="text-xl font-normal text-muted-foreground">%</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Letter Grade</p>
                    <p className="text-4xl font-black text-foreground">{results.letterGrade}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-[10px] text-green-700 uppercase font-bold">Correct</p>
                      <p className="font-bold text-green-800">{results.correct}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-[10px] text-red-700 uppercase font-bold">Incorrect</p>
                      <p className="font-bold text-red-800">{numWrong}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Quick Grading Scale</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {results.scale.map((item: any) => (
                      <div key={item.wrong} className="flex justify-between p-2 rounded-lg bg-secondary/10 text-xs font-medium">
                        <span className="text-muted-foreground">-{item.wrong}</span>
                        <span className="text-foreground">{item.grade}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Effective Grading for Teachers</h2>
              <p>Grading a stack of papers can be time-consuming. Using a test grade calculator allows you to quickly determine a student's percentage score without having to perform manual division for every single paper.</p>
              
              <h3>Standard Grading Scales</h3>
              <p>While specific schools may vary, the most common grading scale in the United States is:</p>
              <ul>
                <li><strong>A:</strong> 90% - 100%</li>
                <li><strong>B:</strong> 80% - 89%</li>
                <li><strong>C:</strong> 70% - 79%</li>
                <li><strong>D:</strong> 60% - 69%</li>
                <li><strong>F:</strong> Below 60%</li>
              </ul>
              
              <h3>The Impact of Partial Credit</h3>
              <p>Many educators use partial credit to reward students who understand the process even if the final answer is wrong. In these cases, you can simply subtract the total points lost from the total points possible. For example, if a student misses a 5-point question but earns 3 points of partial credit, they only lost 2 points.</p>
              
              <h3>Grading with Weights</h3>
              <p>If you have different sections of a test that are worth more than others (e.g., Essay vs. Multiple Choice), you should use a Weighted Grade Calculator for a more accurate final score.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/test-grade" />
          <PopularCalculators exclude="/calculator/test-grade-calculator" />
        </div>
      </div>
    </>
  );
};

export default TestGradeCalculator;

