"use client";
import { RotateCcw, LayoutList, Trash2, Plus, PieChart } from "lucide-react";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const WeightedGradeCalculator = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Homework", weight: "20", grade: "95" },
    { id: 2, name: "Quizzes", weight: "30", grade: "88" },
    { id: 3, name: "Final Exam", weight: "50", grade: "82" }
  ]);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const addCategory = () => {
    setCategories([...categories, { id: Date.now(), name: "New Category", weight: "0", grade: "0" }]);
  };

  const removeCategory = (id: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const updateCategory = (id: number, field: string, value: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCalculate = () => {
    setShowResults(true);
    let totalWeightedGrade = 0;
    let totalWeight = 0;

    categories.forEach(c => {
      const weight = parseFloat(c.weight) || 0;
      const grade = parseFloat(c.grade) || 0;
      totalWeightedGrade += (grade * (weight / 100));
      totalWeight += weight;
    });

    setResults({
      finalGrade: totalWeight > 0 ? (totalWeightedGrade / (totalWeight / 100)) : 0,
      totalWeight,
      isWarning: totalWeight !== 100
    });
  };

  const reset = () => {
    setCategories([
      { id: 1, name: "Homework", weight: "20", grade: "95" },
      { id: 2, name: "Quizzes", weight: "30", grade: "88" },
      { id: 3, name: "Final Exam", weight: "50", grade: "82" }
    ]);
  };

  const faqs = [
    { question: "What is a weighted grade?", answer: "A weighted grade is a calculation that takes into account the relative importance (weight) of different assignments or categories. For example, a final exam might be worth 50% of your grade, while homework is only worth 10%." },
    { question: "Do weights have to add up to 100%?", answer: "Usually, yes. If your weights don't add up to 100%, this calculator will automatically normalize them so you can still see your relative standing, but you should check your syllabus to ensure you haven't missed a category." },
    { question: "How do I calculate my current grade if I haven't taken the final?", answer: "To see your current grade, only enter the categories you have completed. The calculator will determine your average based only on the weight of completed work." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Weighted Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weighted Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <section className="space-y-4">
                <h2 className="text-2xl font-bold mb-3">
                  <LayoutList className="h-5 w-5 text-primary" /> Grade Categories
                </h2>
                <div className="grid grid-cols-[1fr_80px_80px_40px] gap-4 mb-2 px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                   <span>Category Name</span>
                   <span className="text-center">Weight (%)</span>
                   <span className="text-center">Grade (%)</span>
                   <span></span>
                </div>
                <div className="space-y-3">
                  {categories.map((c) => (
                    <div key={c.id} className="grid grid-cols-[1fr_80px_80px_40px] gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                      <input type="text" value={c.name} onChange={(e) => updateCategory(c.id, "name", e.target.value)} className="input-calc h-11 text-sm" placeholder="e.g. Exams" />
                      <input type="number" value={c.weight} onChange={(e) => updateCategory(c.id, "weight", e.target.value)} className="input-calc h-11 text-sm text-center" />
                      <input type="number" value={c.grade} onChange={(e) => updateCategory(c.id, "grade", e.target.value)} className="input-calc h-11 text-sm text-center font-bold" />
                      <button onClick={() => removeCategory(c.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={addCategory} className="flex-1 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-sm text-muted-foreground">
                    <Plus className="h-4 w-4" /> Add Category
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
                <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Overall Weighted Grade</p>
                    <p className="text-7xl font-black text-foreground">{results.finalGrade.toFixed(2)}<span className="text-3xl font-normal text-muted-foreground">%</span></p>
                    
                    {results.isWarning && (
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider mx-auto">
                        <PieChart className="h-3 w-3" /> Weights sum to {results.totalWeight}% (Normalized)
                      </div>
                    )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding Weighted Grading</h2>
              <p>Most college and high school courses use weighted grading systems to ensure that significant assessments, like midterms and finals, contribute more to your final mark than smaller assignments like daily homework or participation.</p>
              
              <h3>The Calculation Formula</h3>
              <p>The math behind a weighted grade is straightforward: multiply each category's average by its weight (expressed as a decimal), and then add those values together. For example: `(Exam Average * 0.40) + (Homework Average * 0.20) + (Final Project * 0.40) = Final Grade`.</p>

              <h3>What if I don't have 100% yet?</h3>
              <p>During the semester, your total weights will likely be less than 100% because you haven't taken the final exam yet. To find your *current* standing, you simply divide your current weighted points by the total weight of the categories you've completed. This calculator does that automatically by normalizing your inputs.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weighted-grade-calculator" />
          <PopularCalculators exclude="/calculator/weighted-grade-calculator" />
        </div>
      </div>
    </>
  );
};

export default WeightedGradeCalculator;

