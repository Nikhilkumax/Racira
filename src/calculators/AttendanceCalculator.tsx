"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const AttendanceCalculator = () => {
  const [totalClasses, setTotalClasses] = useState("40");
  const [presentClasses, setPresentClasses] = useState("32");
  const [requiredPct, setRequiredPct] = useState("75");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const total = parseInt(totalClasses) || 0;
    const present = parseInt(presentClasses) || 0;
    const required = parseFloat(requiredPct) || 75;

    const currentPct = total > 0 ? (present / total) * 100 : 0;
    
    let message = "";
    let status = "";
    let statusColor = "";

    if (currentPct >= required) {
      // How many more can I skip?
      // (present) / (total + x) = required/100
      // 100 * present = required * total + required * x
      // x = (100 * present - required * total) / required
      const maxSkip = Math.floor((100 * present - required * total) / required);
      status = "Safe";
      statusColor = "text-green-500";
      message = maxSkip > 0 
        ? `You can skip up to ${maxSkip} more classes and still maintain ${required}% attendance.`
        : `You are exactly at ${required}%. You cannot skip any more classes.`;
    } else {
      // How many more must I attend?
      // (present + x) / (total + x) = required/100
      // 100 * present + 100 * x = required * total + required * x
      // (100 - required) * x = required * total - 100 * present
      // x = (required * total - 100 * present) / (100 - required)
      const needAttend = Math.ceil((required * total - 100 * present) / (100 - required));
      status = "Shortage";
      statusColor = "text-red-500";
      message = `You need to attend ${needAttend} more classes consecutively to reach ${required}% attendance.`;
    }

    setResults({
      currentPct,
      status,
      statusColor,
      message
    });
  };

  const reset = () => {
    setShowResults(false);
    setTotalClasses("40");
    setPresentClasses("32");
    setResults(null);
  };

  const faqs = [
    { question: "What is the standard attendance requirement?", answer: "Most universities and colleges require a minimum of 75% attendance to be eligible for exams. Some institutions have stricter rules (80-85%) or lenient ones (60%), so check your student handbook." },
    { question: "How does 'bunking' affect my attendance?", answer: "Skipping (bunking) classes reduces your 'Present' count relative to the 'Total' classes conducted. The impact is higher early in the semester when the total count is low." },
    { question: "Can I make up for low attendance?", answer: "The only way to improve attendance is to attend future classes. This calculator helps you find the exact number of consecutive classes you must attend to meet the threshold." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Attendance Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Attendance Calculator</h1>
            <p className="text-muted-foreground mb-8">Track your class attendance and find out exactly how many more classes you can skip or must attend to meet your goal.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="totalClasses" label="Total Classes" value={totalClasses} onChange={setTotalClasses} />
                <InputField id="presentClasses" label="Classes Present" value={presentClasses} onChange={setPresentClasses} />
                <InputField id="requiredPct" label="Required (%)" value={requiredPct} onChange={setRequiredPct} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Check Status</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 text-center">
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Current Attendance</h2>
                  <p className="text-6xl font-extrabold">{results.currentPct.toFixed(1)}%</p>
                  <p className={`font-bold mt-2 ${results.statusColor}`}>Status: {results.status}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-foreground font-medium">{results.message}</p>
                </div>
              </div>
            )}

            <article className="prose-finance">
              <h2>Managing Your Academic Attendance</h2>
              <p>Maintaining a minimum attendance percentage is a common hurdle for students worldwide. Whether due to illness, family emergencies, or extracurricular activities, it's easy to fall behind the required threshold.</p>
              <h3>Why 75%?</h3>
              <p>The 75% rule is widely used because it balances the need for classroom instruction with a reasonable margin for unavoidable absences. It ensures that students engage with at least three-quarters of the curriculum delivered in person.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/attendance-calculator" />
            <PopularCalculators exclude="/calculator/attendance-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder label="Sidebar Ad" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default AttendanceCalculator;

