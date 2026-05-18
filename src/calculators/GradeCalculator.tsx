"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Plus, Trash2 } from "lucide-react";

const GradeCalculator = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Homework", grade: "90", weight: "20" },
    { id: 2, name: "Midterm", grade: "85", weight: "30" },
    { id: 3, name: "Final Exam", grade: "88", weight: "50" },
  ]);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "New Assignment", grade: "", weight: "" }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleCalculate = () => {
    setShowResults(true);
    let totalWeight = 0;
    let weightedSum = 0;

    items.forEach(item => {
      const g = parseFloat(item.grade) || 0;
      const w = parseFloat(item.weight) || 0;
      weightedSum += (g * w);
      totalWeight += w;
    });

    const finalGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;

    setResults({
      finalGrade,
      totalWeight
    });
  };

  const reset = () => {
    setShowResults(false);
    setItems([
      { id: 1, name: "Homework", grade: "90", weight: "20" },
      { id: 2, name: "Midterm", grade: "85", weight: "30" },
      { id: 3, name: "Final Exam", grade: "88", weight: "50" },
    ]);
    setResults(null);
  };

  const faqs = [
    { question: "How is a weighted grade calculated?", answer: "To calculate a weighted grade, multiply each assignment's grade by its weight percentage, add those values together, and divide by the total weight. For example, if you have 90% on a 20% weight and 80% on an 80% weight, your grade is (90*0.2) + (80*0.8) = 82%." },
    { question: "What if my weights don't add up to 100?", answer: "Our calculator automatically adjusts if weights don't add up to 100. It calculates the weighted average based on whatever total weight you provide." },
    { question: "Why should I use a weighted grade calculator?", answer: "Many college courses use weighted categories (e.g., Exams are 60%, Lab is 20%, Quizzes are 20%). A simple average of all points doesn't accurately reflect your standing in such courses." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Grade Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Weighted Grade Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate your current class grade or find out what you need on the final exam to reach your goal.</p>

            <div className="card-calculator mb-8">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-3 px-1 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Category</span>
                  <span>Grade (%)</span>
                  <span>Weight (%)</span>
                  <span></span>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_40px] gap-3 items-center">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input 
                      type="number" 
                      placeholder="90"
                      value={item.grade} 
                      onChange={(e) => updateItem(item.id, "grade", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input 
                      type="number" 
                      placeholder="20"
                      value={item.weight} 
                      onChange={(e) => updateItem(item.id, "weight", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" /> Add Item
                </button>
                <div className="flex-1" />
                <button onClick={handleCalculate} className="btn-calculate px-8">Calculate Grade</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 text-center py-10">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Your Weighted Grade</h2>
                <p className="text-6xl font-extrabold">{results.finalGrade.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground mt-2">Total Weight Accounted: {results.totalWeight}%</p>
              </div>
            )}

            <article className="prose-finance">
              <h2>Mastering Course Grading Scales</h2>
              <p>In high school and college, grading systems vary widely. The two most common types are point-based systems and weighted systems. Point-based systems are straightforward, but weighted systems can be tricky to track without a dedicated calculator.</p>
              <h3>Why Weighted Grades Matter</h3>
              <p>Weighted grades allow instructors to emphasize certain parts of a course over others. For example, a final exam might be worth as much as all homework assignments combined. This means a single high-stakes test has a massive impact on your final GPA, making it essential to know exactly where you stand before walking into the exam hall.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/grade-calculator" />
            <PopularCalculators exclude="/calculator/grade-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder label="Sidebar Ad" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default GradeCalculator;

