"use client";
import { Timer, GraduationCap, RotateCcw, Brain } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const StudyTimeCalculator = () => {
  const [creditHours, setCreditHours] = useState("12");
  const [difficulty, setDifficulty] = useState("moderate");
  const [targetGrade, setTargetGrade] = useState("A");
  const [termWeeks, setTermWeeks] = useState("15");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const credits = parseFloat(creditHours) || 0;
    const weeks = parseFloat(termWeeks) || 15;

    // Base multiplier (hours per credit hour)
    let multiplier = 2; // Default for moderate
    if (difficulty === "easy") multiplier = 1;
    if (difficulty === "hard") multiplier = 3;
    if (difficulty === "very_hard") multiplier = 4;

    // Grade adjustment
    const gradeMult: any = {
      "A": 1.2,
      "B": 1.0,
      "C": 0.8,
      "D": 0.6
    };

    const weeklyStudyTime = credits * multiplier * (gradeMult[targetGrade] || 1);
    const totalTermTime = weeklyStudyTime * weeks;

    setResults({
      weeklyStudyTime,
      totalTermTime,
      perCreditRatio: weeklyStudyTime / (credits || 1),
      dailyStudyTime: weeklyStudyTime / 7
    });
  };

  const reset = () => {
    setShowResults(false);
    setResults(null);
  };

  const faqs = [
    { question: "What is the '2-to-1' rule?", answer: "A common academic rule of thumb is that for every 1 credit hour you spend in class, you should spend 2 to 3 hours studying outside of class. For a full-time 15-credit load, this means 30 to 45 hours of studying per week." },
    { question: "How does course difficulty affect study time?", answer: "An introductory elective may only require 1 hour of study per credit hour, while a senior-level STEM course or an intensive language class might require 4 or 5 hours to master the material." },
    { question: "How can I balance work and study?", answer: "If you work more than 20 hours a week, it's often recommended to take a reduced credit load. This calculator helps you see if your total time commitment (class + study + work) is realistic." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Study Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Study Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-8">
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                     <GraduationCap className="h-4 w-4" /> Course Details
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Total Credit Hours</label>
                    <input type="number" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} className="input-calc" />
                    <p className="text-[10px] text-muted-foreground mt-1">Total hours spent in class per week.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Course Difficulty</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-calc">
                      <option value="easy">Easy (Low effort)</option>
                      <option value="moderate">Moderate (Standard)</option>
                      <option value="hard">Hard (Technical/Intensive)</option>
                      <option value="very_hard">Very Hard (Pre-med/Engineering)</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                     <Brain className="h-4 w-4" /> Goals & Timeline
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Target Grade</label>
                    <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="input-calc">
                      <option value="A">Grade A (90-100%)</option>
                      <option value="B">Grade B (80-89%)</option>
                      <option value="C">Grade C (70-79%)</option>
                      <option value="D">Grade D (Passing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Term Duration (Weeks)</label>
                    <input type="number" value={termWeeks} onChange={(e) => setTermWeeks(e.target.value)} className="input-calc" />
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
                <h2 className="text-2xl font-bold mb-3">Study Plan Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Recommended Weekly Study</p>
                    <p className="text-5xl font-black text-foreground">{results.weeklyStudyTime.toFixed(1)} <span className="text-xl font-normal text-muted-foreground">Hours</span></p>
                    <p className="text-xs text-muted-foreground mt-2">~{results.dailyStudyTime.toFixed(1)} hours per day</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 flex flex-col justify-center text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Term Commitment</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.totalTermTime).toLocaleString()} Hours</p>
                    <p className="text-xs text-muted-foreground mt-1">(Including Class Time: {Math.round(results.totalTermTime + (parseFloat(creditHours) * parseFloat(termWeeks))).toLocaleString()})</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Timer className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-1 text-sm uppercase tracking-wider">Academic Workload Analysis</h3>
                      <p className="text-xs text-muted-foreground">Based on the Carnegie Credit Hour system and target grade expectations.</p>
                    </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Study-to-Class Ratio", value: 0, textValue: results.perCreditRatio.toFixed(1) + ":1" },
                    { label: "Full-Time Status", value: 0, textValue: parseFloat(creditHours) >= 12 ? "Full-Time" : "Part-Time" },
                    { label: "Workload Category", value: 0, textValue: results.weeklyStudyTime > 40 ? "Intense (Full-time job equivalent)" : results.weeklyStudyTime > 20 ? "Moderate" : "Light" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Planning for Academic Success</h2>
              <p>Success in college is as much about time management as it is about intelligence. Most students underestimate the amount of time required to master complex subjects, leading to stress and lower grades.</p>
              
              <h3>The Carnegie Credit System</h3>
              <p>The US federal government and most universities use the Carnegie Unit to measure academic work. One credit hour is meant to represent one hour of direct faculty instruction and a minimum of two hours of out-of-class student work each week for approximately fifteen weeks.</p>

              <h3>Adjusting for Your Learning Style</h3>
              <p>This calculator provides averages. If you are a naturally fast learner in a specific subject, you may need less time. Conversely, if a subject is completely new to you or you struggle with the prerequisites, you should plan for significantly more time than the average.</p>

              <h3>Burnout Prevention</h3>
              <p>Research suggests that for most people, cognitive performance drops significantly after 4-5 hours of intense study in a single day. Instead of "marathon" study sessions, aim for consistent, daily progress using techniques like the Pomodoro method.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/study-time" />
          <PopularCalculators exclude="/calculator/study-time-calculator" />
        </div>
      </div>
    </>
  );
};

export default StudyTimeCalculator;

