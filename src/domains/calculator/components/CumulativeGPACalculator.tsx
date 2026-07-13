"use client";
import { RotateCcw, BookOpen, GraduationCap, Trash2, Plus } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const gradeValues: { [key: string]: number } = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0
};

const CumulativeGPACalculator = () => {
  const [currentGPA, setCurrentGPA] = useState("3.5");
  const [totalCredits, setTotalCredits] = useState("60");
  const [semesters, setSemesters] = useState([{ id: 1, name: "New Semester", credits: "15", grade: "A" }]);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const addSemester = () => {
    setSemesters([...semesters, { id: Date.now(), name: `Course ${semesters.length + 1}`, credits: "3", grade: "A" }]);
  };

  const removeSemester = (id: number) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(s => s.id !== id));
    }
  };

  const updateSemester = (id: number, field: string, value: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleCalculate = () => {
    setShowResults(true);
    const curGPA = parseFloat(currentGPA) || 0;
    const curCredits = parseFloat(totalCredits) || 0;
    
    let currentTotalPoints = curGPA * curCredits;
    let newSemesterPoints = 0;
    let newSemesterCredits = 0;

    semesters.forEach(s => {
      const creds = parseFloat(s.credits) || 0;
      const val = gradeValues[s.grade] || 0;
      newSemesterPoints += val * creds;
      newSemesterCredits += creds;
    });

    const finalGPA = (currentTotalPoints + newSemesterPoints) / (curCredits + newSemesterCredits);
    const semesterGPA = newSemesterCredits > 0 ? newSemesterPoints / newSemesterCredits : 0;

    setResults({
      finalGPA,
      semesterGPA,
      totalCredits: curCredits + newSemesterCredits
    });
  };

  const reset = () => {
    setCurrentGPA("3.5");
    setTotalCredits("60");
    setSemesters([{ id: 1, name: "Course 1", credits: "3", grade: "A" }]);
  };

  const faqs = [
    { question: "What is a cumulative GPA?", answer: "Your cumulative GPA (Grade Point Average) is the average of all grades you have received throughout your entire academic career at a specific institution, weighted by the number of credit hours for each course." },
    { question: "How do credit hours affect GPA?", answer: "Courses with more credit hours have a greater impact on your GPA. For example, getting an 'A' in a 4-credit science lab course will raise your GPA more than getting an 'A' in a 1-credit physical education course." },
    { question: "Can I use this for weighted high school GPA?", answer: "This calculator uses the standard 4.0 scale. If your school uses a 5.0 scale for AP or Honors classes, you should manually enter the weighted grade value (e.g., enter 5.0 instead of 4.0 for an A)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cumulative GPA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cumulative GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold mb-3">
                    <GraduationCap className="h-5 w-5 text-primary" /> Current Standing
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Current GPA</label>
                      <input type="number" value={currentGPA} onChange={(e) => setCurrentGPA(e.target.value)} className="input-calc" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Total Credits</label>
                      <input type="number" value={totalCredits} onChange={(e) => setTotalCredits(e.target.value)} className="input-calc" />
                    </div>
                  </div>
                </section>
                <div className="flex items-center justify-center">
                   <p className="text-xs text-muted-foreground bg-secondary/50 p-4 rounded-xl italic">"Enter your current GPA and the total credits you've completed to see how this semester affects your long-term average."</p>
                </div>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold mb-3">
                  <BookOpen className="h-5 w-5 text-primary" /> New Courses
                </h2>
                <div className="space-y-3">
                  {semesters.map((s, idx) => (
                    <div key={s.id} className="grid grid-cols-[1fr_80px_80px_40px] gap-3 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                      <input type="text" value={s.name} onChange={(e) => updateSemester(s.id, "name", e.target.value)} className="input-calc h-10 text-sm" placeholder="Course Name" />
                      <input type="number" value={s.credits} onChange={(e) => updateSemester(s.id, "credits", e.target.value)} className="input-calc h-10 text-sm text-center" placeholder="Credits" />
                      <select value={s.grade} onChange={(e) => updateSemester(s.id, "grade", e.target.value)} className="input-calc h-10 text-sm font-bold">
                        {Object.keys(gradeValues).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button onClick={() => removeSemester(s.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={addSemester} className="flex-1 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-sm text-muted-foreground">
                    <Plus className="h-4 w-4" /> Add Course
                  </button>
                  <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm px-6">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </section>
            
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
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-10">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">New Cumulative GPA</p>
                    <p className="text-6xl font-black text-foreground">{results.finalGPA.toFixed(3)}</p>
                    <p className="text-xs text-muted-foreground mt-4">Across {results.totalCredits} total credits</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-10">
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Semester GPA</p>
                    <p className="text-6xl font-black text-foreground">{results.semesterGPA.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-4">Current semester only</p>
                  </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering Your GPA</h2>
              <p>Maintaining a strong GPA is often a requirement for scholarships, graduate school admissions, and even certain job opportunities. A cumulative GPA provides a birds-eye view of your entire academic performance, but it can be surprisingly difficult to move once you've accumulated a large number of credits.</p>
              
              <h3>The Weight of History</h3>
              <p>The more credits you have already completed, the less impact a single semester's grades will have on your cumulative GPA. This is known as "GPA Inertia." For example, if you have 100 credits, a perfect 4.0 semester of 15 credits will only raise a 3.0 GPA to approximately 3.13.</p>

              <h3>Strategic Grade Improvement</h3>
              <p>If you are trying to raise your GPA, focus your best efforts on courses with the highest credit values. A high grade in a 4 or 5-credit course will pull your average up significantly faster than the same grade in a 1 or 2-credit elective.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cumulative-gpa" />
          <PopularCalculators exclude="/calculator/cumulative-gpa-calculator" />
        </div>
      </div>
    </>
  );
};

export default CumulativeGPACalculator;

