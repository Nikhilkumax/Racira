"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const PercentageToCgpaConverter = () => {
  const [percentage, setPercentage] = useState("75");
  const [cgpa, setCgpa] = useState("7.89");
  const [mode, setMode] = useState<"pctToCgpa" | "cgpaToPct">("pctToCgpa");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (mode === "pctToCgpa") {
      const pct = parseFloat(percentage) || 0;
      const resCgpa = pct / 9.5;
      setResults({ value: resCgpa, label: "Calculated CGPA", mode: "CGPA" });
    } else {
      const valCgpa = parseFloat(cgpa) || 0;
      const resPct = valCgpa * 9.5;
      setResults({ value: resPct, label: "Calculated Percentage", mode: "%" });
    }
  };

  const reset = () => {
    setShowResults(false);
    setPercentage("75");
    setCgpa("7.89");
    setResults(null);
  };

  const faqs = [
    { question: "How do you convert percentage to CGPA?", answer: "The standard formula used by many boards (like CBSE in India) is to divide the percentage by 9.5. For example, 76% divided by 9.5 equals a CGPA of 8.0." },
    { question: "How do you convert CGPA to percentage?", answer: "To convert CGPA to percentage, you multiply the CGPA by 9.5. For example, a CGPA of 9.0 multiplied by 9.5 equals 85.5%." },
    { question: "Is the 9.5 multiplier universal?", answer: "No. While 9.5 is standard for CBSE and many Indian universities, some institutions use a 10.0 scale or a 4.0 scale with different conversion tables. Always check your specific institution's guidelines." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Percentage/CGPA Converter" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Percentage to CGPA Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex bg-secondary rounded-lg p-1 mb-6">
                <button 
                  onClick={() => setMode("pctToCgpa")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "pctToCgpa" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Percentage to CGPA
                </button>
                <button 
                  onClick={() => setMode("cgpaToPct")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "cgpaToPct" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  CGPA to Percentage
                </button>
              </div>

              <div className="mb-6">
                {mode === "pctToCgpa" ? (
                  <InputField id="percentage" label="Enter Percentage" value={percentage} onChange={setPercentage} suffix="%" />
                ) : (
                  <InputField id="cgpa" label="Enter CGPA" value={cgpa} onChange={setCgpa} />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Convert Value</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">{results.label}</h2>
                <p className="text-6xl font-extrabold">{results.value.toFixed(2)}{results.mode === "%" ? "%" : ""}</p>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2>Academic Grading Conversions</h2>
              <p>Converting between percentage and Cumulative Grade Point Average (CGPA) is a common requirement for students applying to higher education or jobs. Different educational systems use different scales, but the 10-point scale is the most prevalent in modern systems.</p>
              <h3>The 9.5 Multiplier Rule</h3>
              <p>The multiplier 9.5 is derived from statistical analysis of board results. It is designed to ensure that the converted percentage reflects the student's relative performance accurately across different difficulty levels of exams.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percentage-to-cgpa-converter" />
          <PopularCalculators exclude="/calculator/percentage-to-cgpa-converter" />
        </div>
      </div>
    </>
  );
};

export default PercentageToCgpaConverter;

