"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { RotateCcw, Plus, Trash2 } from "lucide-react";

interface Course {
  id: number;
  name: string;
  grade: string;
  credits: string;
}

const gradeToGPA: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0, "W": -1, // W = withdrawn
};

const gpaLetterGrades = Object.keys(gradeToGPA).filter(k => k !== "W");

let nextCourseId = 4;

const GPACalculator = () => {
  const [mode, setMode] = useState<"semester" | "cumulative" | "needed">("semester");
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "Mathematics", grade: "A", credits: "3" },
    { id: 2, name: "English Literature", grade: "B+", credits: "3" },
    { id: 3, name: "Physics", grade: "B", credits: "4" },
  ]);

  // Cumulative mode
  const [currentGPA, setCurrentGPA] = useState("3.2");
  const [currentCredits, setCurrentCredits] = useState("60");

  // Needed GPA mode
  const [targetGPA, setTargetGPA] = useState("3.5");
  const [remainingCredits, setRemainingCredits] = useState("30");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const addCourse = () => {
    nextCourseId++;
    setCourses([...courses, { id: nextCourseId, name: `Course ${nextCourseId}`, grade: "B", credits: "3" }]);
  };

  const removeCourse = (id: number) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: number, field: keyof Course, value: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const getGPACategory = (gpa: number): { label: string; color: string } => {
    if (gpa >= 3.9) return { label: "Summa Cum Laude (4.0)", color: "text-emerald-600 dark:text-emerald-400" };
    if (gpa >= 3.7) return { label: "Magna Cum Laude", color: "text-blue-600 dark:text-blue-400" };
    if (gpa >= 3.5) return { label: "Cum Laude", color: "text-indigo-600 dark:text-indigo-400" };
    if (gpa >= 3.0) return { label: "Good Standing", color: "text-primary" };
    if (gpa >= 2.0) return { label: "Satisfactory", color: "text-yellow-600 dark:text-yellow-400" };
    return { label: "Academic Probation Risk", color: "text-red-600 dark:text-red-400" };
  };

  const calcSemesterGPA = () => {
    const validCourses = courses.filter(c => gradeToGPA[c.grade] !== undefined && gradeToGPA[c.grade] >= 0);
    const totalCredits = validCourses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0);
    const totalPoints = validCourses.reduce((s, c) => s + (gradeToGPA[c.grade] * (parseFloat(c.credits) || 0)), 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    const gradeDistribution = gpaLetterGrades.map(g => ({
      grade: g,
      count: courses.filter(c => c.grade === g).length,
      credits: courses.filter(c => c.grade === g).reduce((s, c) => s + (parseFloat(c.credits) || 0), 0),
    })).filter(d => d.count > 0);

    setResults({ mode: "semester", gpa, totalCredits, totalPoints, gradeDistribution, courses: validCourses });
  };

  const calcCumulativeGPA = () => {
    const prevGPA = parseFloat(currentGPA) || 0;
    const prevCredits = parseFloat(currentCredits) || 0;
    const prevPoints = prevGPA * prevCredits;

    const validCourses = courses.filter(c => gradeToGPA[c.grade] !== undefined && gradeToGPA[c.grade] >= 0);
    const newCredits = validCourses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0);
    const newPoints = validCourses.reduce((s, c) => s + (gradeToGPA[c.grade] * (parseFloat(c.credits) || 0)), 0);
    const semGPA = newCredits > 0 ? newPoints / newCredits : 0;

    const totalCredits = prevCredits + newCredits;
    const cumGPA = totalCredits > 0 ? (prevPoints + newPoints) / totalCredits : 0;

    setResults({ mode: "cumulative", cumGPA, semGPA, totalCredits, prevGPA, prevCredits, newCredits });
  };

  const calcNeededGPA = () => {
    const prevGPA = parseFloat(currentGPA) || 0;
    const prevCredits = parseFloat(currentCredits) || 0;
    const target = parseFloat(targetGPA) || 0;
    const remaining = parseFloat(remainingCredits) || 0;

    const totalCredits = prevCredits + remaining;
    const requiredPoints = target * totalCredits;
    const currentPoints = prevGPA * prevCredits;
    const neededPoints = requiredPoints - currentPoints;
    const neededGPA = remaining > 0 ? neededPoints / remaining : 0;

    setResults({ mode: "needed", neededGPA, target, prevGPA, remaining, totalCredits, achievable: neededGPA <= 4.0 });
  };

  const handleCalculate = () => {
    setShowResults(true);
    if (mode === "semester") calcSemesterGPA();
    else if (mode === "cumulative") calcCumulativeGPA();
    else calcNeededGPA();
  };

  const reset = () => {
    setShowResults(false);
    setCourses([
      { id: 1, name: "Mathematics", grade: "A", credits: "3" },
      { id: 2, name: "English Literature", grade: "B+", credits: "3" },
      { id: 3, name: "Physics", grade: "B", credits: "4" },
    ]);
    setCurrentGPA("3.2"); setCurrentCredits("60");
    setTargetGPA("3.5"); setRemainingCredits("30");
    setResults(null);
  };

  const faqs = [
    { question: "What is GPA and how is it calculated?", answer: "GPA (Grade Point Average) is the average of your grade points weighted by credit hours. It's calculated by multiplying each course's grade points by its credit hours, summing all weighted grade points, and dividing by the total credit hours. For example, an A (4.0) in a 3-credit course contributes 12 grade points. A B (3.0) in a 4-credit course contributes 12 grade points." },
    { question: "What GPA is needed for honor roll?", answer: "Honor roll requirements vary by institution. Common thresholds are: Dean's List (3.5 GPA or higher), Cum Laude (3.5–3.69), Magna Cum Laude (3.7–3.89), Summa Cum Laude (3.9–4.0). Some schools use percentage-based criteria rather than GPA cutoffs. Most universities require full-time enrollment with no failing grades for honor roll consideration." },
    { question: "What is the difference between semester GPA and cumulative GPA?", answer: "Semester GPA reflects your performance in a single semester only. Cumulative GPA averages all courses taken across all semesters since enrollment. Graduate schools and employers typically look at your cumulative GPA, though a strong upward trend in semester GPAs can also be compelling evidence of academic improvement." },
    { question: "How do I calculate the GPA I need to maintain a target GPA?", answer: "To find what GPA you need in remaining semesters to reach a target cumulative GPA, use the formula: Required GPA = (Target GPA × Total Credits − Current GPA × Completed Credits) ÷ Remaining Credits. Our 'Needed GPA' mode calculates this automatically and tells you if the target is achievable within the 4.0 maximum." },
    { question: "What is a weighted vs unweighted GPA?", answer: "An unweighted GPA gives each course equal difficulty weight — all A's are 4.0 regardless of course level. A weighted GPA accounts for course difficulty by adding bonus points for honors, AP, or IB courses (typically +0.5 for honors, +1.0 for AP). Most college admissions and employers use unweighted GPA; our calculator uses the standard unweighted 4.0 scale." },
    { question: "Does a plus or minus grade significantly affect GPA?", answer: "Yes, +/- grades matter significantly when calculating GPA. An A- (3.7) vs. A (4.0) vs. A+ (4.0) are all different. Over 120 credit hours, the difference between all A's (4.0) and all A-'s (3.7) is 0.3 GPA points — enough to drop from Summa Cum Laude to Magna Cum Laude. In courses with many credits (4+ hours), the grade impact is proportionally larger." },
    { question: "What GPA do I need for graduate school?", answer: "Graduate school minimum GPA requirements typically range from 3.0 to 3.5 for competitive programs. Medical schools generally expect 3.5+. Law schools at top universities look for 3.7+. MBA programs vary widely — top schools like HBS look for 3.7+ while many strong programs accept 3.3. Research programs may weight research experience more heavily than GPA alone." },
    { question: "Can I improve my GPA after getting bad grades?", answer: "Yes, though it takes time. Starting from a 2.5 GPA after 60 credits, you'd need a 4.0 in all remaining 60 credits to reach approximately 3.25 cumulative. Use our Needed GPA calculator to see exactly what you need. Grade replacement programs (retaking courses) at some schools allow you to replace old grades, potentially accelerating GPA recovery." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "GPA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {/* Mode Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Calculator Mode</label>
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button type="button" onClick={() => { setMode("semester"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "semester" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Semester GPA</button>
                  <button type="button" onClick={() => { setMode("cumulative"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "cumulative" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Cumulative GPA</button>
                  <button type="button" onClick={() => { setMode("needed"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "needed" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Needed GPA</button>
                </div>
              </div>

              {/* Cumulative / Needed: prior GPA inputs */}
              {(mode === "cumulative" || mode === "needed") && (
                <div className="grid sm:grid-cols-2 gap-5 mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <InputField id="curr-gpa" label="Current Cumulative GPA" value={currentGPA} onChange={setCurrentGPA} tooltip="Your GPA before this semester." />
                  <InputField id="curr-credits" label="Total Credits Completed" value={currentCredits} onChange={setCurrentCredits} tooltip="Total credit hours completed so far." />
                </div>
              )}

              {/* Needed GPA target inputs */}
              {mode === "needed" && (
                <div className="grid sm:grid-cols-2 gap-5 mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <InputField id="target-gpa" label="Target Cumulative GPA" value={targetGPA} onChange={setTargetGPA} tooltip="The GPA you want to achieve by graduation." />
                  <InputField id="remaining-credits" label="Remaining Credits" value={remainingCredits} onChange={setRemainingCredits} tooltip="Credit hours remaining until graduation." />
                </div>
              )}

              {/* Courses */}
              {mode !== "needed" && (
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-[2fr_1.5fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                    <span>Course Name</span>
                    <span>Grade</span>
                    <span>Credits</span>
                    <span></span>
                  </div>
                  {courses.map((course) => (
                    <div key={course.id} className="grid grid-cols-[2fr_1.5fr_1fr_auto] gap-2 items-center">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                        className="input-calc text-sm"
                        aria-label="Course name"
                      />
                      <select
                        value={course.grade}
                        onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                        className="input-calc text-sm"
                        aria-label="Grade"
                      >
                        {Object.keys(gradeToGPA).map(g => (
                          <option key={g} value={g}>{g} {gradeToGPA[g] >= 0 ? `(${gradeToGPA[g].toFixed(1)})` : "(W)"}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={course.credits}
                        onChange={(e) => updateCourse(course.id, "credits", e.target.value)}
                        className="input-calc text-sm"
                        min="0.5"
                        step="0.5"
                        aria-label="Credits"
                      />
                      <button onClick={() => removeCourse(course.id)} disabled={courses.length <= 1} className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 p-1" aria-label="Remove course">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {mode !== "needed" && (
                <button onClick={addCourse} className="flex items-center gap-2 text-sm text-primary hover:underline mb-6">
                  <Plus className="h-4 w-4" /> Add Course
                </button>
              )}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">GPA Results</h2>

                {results.mode === "semester" && (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-5xl font-extrabold text-primary">{results.gpa.toFixed(2)}</p>
                      <p className={`text-sm font-semibold mt-1 ${getGPACategory(results.gpa).color}`}>{getGPACategory(results.gpa).label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{results.totalCredits} credit hours · {results.totalPoints.toFixed(1)} grade points</p>
                    </div>

                    <ResultDisplay items={[
                      { label: "Semester GPA", value: 0, textValue: results.gpa.toFixed(2), highlight: true },
                      { label: "Total Credits", value: 0, textValue: `${results.totalCredits}` },
                      { label: "Grade Points", value: 0, textValue: results.totalPoints.toFixed(1) },
                    ]} />

                    {/* Grade Distribution */}
                    {results.gradeDistribution.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Grade Distribution</h3>
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-secondary text-foreground">
                                <th className="px-3 py-2 text-left font-medium">Grade</th>
                                <th className="px-3 py-2 text-right font-medium">GPA Points</th>
                                <th className="px-3 py-2 text-right font-medium">Credits</th>
                                <th className="px-3 py-2 text-right font-medium">Courses</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.gradeDistribution.map((d: any) => (
                                <tr key={d.grade} className="border-t border-border hover:bg-secondary/30">
                                  <td className="px-3 py-2 font-medium">{d.grade}</td>
                                  <td className="px-3 py-2 text-right">{gradeToGPA[d.grade].toFixed(1)}</td>
                                  <td className="px-3 py-2 text-right">{d.credits}</td>
                                  <td className="px-3 py-2 text-right">{d.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* GPA Scale Reference */}
                    <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
                      <h3 className="text-sm font-semibold text-foreground mb-3">4.0 GPA Scale Reference</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {Object.entries(gradeToGPA).filter(([_, v]) => v >= 0).map(([g, v]) => (
                          <div key={g} className="flex justify-between">
                            <span className="text-muted-foreground">{g}</span>
                            <span className="font-medium">{v.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {results.mode === "cumulative" && (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-5xl font-extrabold text-primary">{results.cumGPA.toFixed(2)}</p>
                      <p className={`text-sm font-semibold mt-1 ${getGPACategory(results.cumGPA).color}`}>{getGPACategory(results.cumGPA).label}</p>
                    </div>
                    <ResultDisplay items={[
                      { label: "New Cumulative GPA", value: 0, textValue: results.cumGPA.toFixed(2), highlight: true },
                      { label: "This Semester GPA", value: 0, textValue: results.semGPA.toFixed(2) },
                      { label: "Previous GPA", value: 0, textValue: results.prevGPA.toFixed(2) },
                      { label: "Total Credits", value: 0, textValue: `${results.totalCredits}` },
                      { label: "Previous Credits", value: 0, textValue: `${results.prevCredits}` },
                      { label: "New Credits", value: 0, textValue: `${results.newCredits}` },
                    ]} />
                  </>
                )}

                {results.mode === "needed" && (
                  <>
                    <div className="text-center mb-6">
                      <p className={`text-5xl font-extrabold ${results.achievable ? "text-primary" : "text-red-500"}`}>
                        {results.neededGPA > 4.0 ? ">4.0" : results.neededGPA < 0 ? "N/A" : results.neededGPA.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Required GPA in remaining {results.remaining} credits</p>
                    </div>
                    <ResultDisplay items={[
                      { label: "Required GPA", value: 0, textValue: results.neededGPA > 4.0 ? "Not achievable (>4.0)" : results.neededGPA.toFixed(2), highlight: true },
                      { label: "Target Cumulative GPA", value: 0, textValue: results.target.toFixed(2) },
                      { label: "Current GPA", value: 0, textValue: results.prevGPA.toFixed(2) },
                      { label: "Remaining Credits", value: 0, textValue: `${results.remaining}` },
                    ]} />
                    {!results.achievable && (
                      <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-600 dark:text-red-400">⚠️ The target GPA of {results.target.toFixed(2)} is not achievable in {results.remaining} remaining credits. Consider a more realistic target.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is a GPA Calculator?</h2>
              <p>A GPA (Grade Point Average) calculator converts your letter grades and credit hours into a numerical GPA on the standard 4.0 scale. It's an essential tool for students planning their academic paths, checking honor roll eligibility, preparing graduate school applications, and monitoring academic progress throughout their college career.</p>
              <p>Our advanced calculator offers three modes: Semester GPA for calculating your current term's GPA, Cumulative GPA for updating your overall GPA after a new semester, and Needed GPA for finding exactly what grades you need in remaining courses to reach a target GPA by graduation.</p>

              <h2>How GPA Is Calculated</h2>
              <p>GPA is calculated using weighted averages based on credit hours. Each course's grade is converted to grade points (A = 4.0, B+ = 3.3, etc.), then multiplied by the number of credit hours for that course. All weighted grade points are summed and divided by total credit hours to give the GPA.</p>
              <p>Formula: <strong>GPA = Σ(Grade Points × Credit Hours) / Σ(Credit Hours)</strong></p>
              <p>Example: A (4.0) × 3 credits + B+ (3.3) × 3 credits + B (3.0) × 4 credits = (12 + 9.9 + 12) / (3 + 3 + 4) = 33.9 / 10 = 3.39 GPA</p>

              <h2>How to Use This GPA Calculator</h2>
              <p>For Semester GPA, enter each course name, select the letter grade from the dropdown (including +/- grades), and enter the credit hours. Add additional courses with the Add Course button. For Cumulative GPA mode, first enter your existing cumulative GPA and completed credits, then add your new semester courses. For Needed GPA, enter your current GPA, completed credits, target GPA, and remaining credits to see exactly what GPA you need in upcoming terms.</p>

              <h2>The 4.0 GPA Scale Explained</h2>
              <p>The standard US academic GPA scale converts letter grades to numerical values. A+ and A both equal 4.0 (at most institutions). A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, and F = 0.0. Withdrawn courses (W) typically don't count toward GPA. Plus/minus grading allows more nuance — a B+ (3.3) significantly outperforms a B (3.0) in GPA contribution, especially in high-credit courses.</p>

              <h2>Example Scenario</h2>
              <p>James is a junior with a 3.2 cumulative GPA after 90 credits. He wants to graduate with a 3.5 GPA and has 30 credits remaining. Using the Needed GPA calculator: Required GPA = (3.5 × 120 − 3.2 × 90) / 30 = (420 − 288) / 30 = 132 / 30 = 4.4. This exceeds 4.0, meaning James cannot reach 3.5 cumulative. The calculator immediately flags this as unachievable, helping James set a realistic target like 3.35 instead.</p>

              <h2>Tips for Improving Your GPA</h2>
              <p>Take advantage of grade replacement policies at schools that allow retaking courses. Focus extra effort on high-credit courses where grades have a proportionally larger impact on GPA. Use incomplete/withdrawal options strategically rather than taking a failing grade. Attend office hours — research shows students who attend office hours receive on average 0.5 GPA points higher than those who don't. Balance your course load to avoid taking multiple difficult courses simultaneously.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gpa-calculator" />
          <PopularCalculators exclude="/calculator/gpa-calculator" />
        </div>
      </div>
    </>
  );
};

export default GPACalculator;

