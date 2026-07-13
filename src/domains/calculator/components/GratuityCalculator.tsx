"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const GratuityCalculator = () => {
  const [salary, setSalary] = useState("50000");
  const [years, setYears] = useState("10");
  const [months, setMonths] = useState("0");
  const [showResults, setShowResults] = useState(false);
  const [type, setType] = useState<"act" | "non-act">("act");
  const [result, setResult] = useState<{ gratuity: number; taxExempt: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const s = parseFloat(salary) || 0;
    const y = parseInt(years) || 0;
    const m = parseInt(months) || 0;
    const totalYears = y + (m >= 7 ? 1 : m / 12); // Round up if >= 7 months

    if (s <= 0 || totalYears < 5) {
      alert("Minimum 5 years of continuous service required for gratuity.");
      return;
    }

    let gratuity: number;
    if (type === "act") {
      // Gratuity Act: (15 × last drawn salary × years of service) / 26
      gratuity = (15 * s * Math.floor(totalYears + (m >= 7 ? 0 : 0))) / 26;
      // Recalculate with rounded years
      const roundedYears = m >= 7 ? y + 1 : y;
      gratuity = (15 * s * roundedYears) / 26;
    } else {
      // Non-Act: (15 × last drawn salary × years of service) / 30
      const roundedYears = m >= 7 ? y + 1 : y;
      gratuity = (15 * s * roundedYears) / 30;
    }

    // Tax exemption limit: ₹20,00,000
    const taxExempt = Math.min(gratuity, 2000000);

    setResult({ gratuity, taxExempt });
  };

  const reset = () => {
    setShowResults(false); setSalary("50000"); setYears("10"); setMonths("0"); setType("act"); setResult(null); };

  const faqs = [
    { question: "Who is eligible for gratuity?", answer: "Any employee who has completed 5 or more years of continuous service is eligible for gratuity. For contract/seasonal workers, the period may differ." },
    { question: "How is gratuity calculated?", answer: "For employees covered under the Gratuity Act: Gratuity = (15 × Last Drawn Salary × Years of Service) / 26. For others, 30 is used instead of 26." },
    { question: "Is gratuity taxable?", answer: "Gratuity is exempt up to ₹20,00,000 for private sector employees. For government employees, it's fully exempt. Amount exceeding the limit is taxable." },
    { question: "What counts as last drawn salary?", answer: "Last drawn salary includes basic salary plus Dearness Allowance (DA). It does not include HRA, bonuses, or other allowances." },
    { question: "What if I complete 4 years and 7 months?", answer: "If you complete more than 6 months beyond a full year, it's rounded up to the next year. So 4 years 7 months is treated as 5 years for gratuity." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gratuity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gratuity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex rounded-lg border border-input overflow-hidden mb-6">
                <button onClick={() => { setType("act"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${type === "act" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Gratuity Act (÷ 26)</button>
                <button onClick={() => { setType("non-act"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${type === "non-act" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Non-Act (÷ 30)</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="salary" label="Last Drawn Salary (Basic + DA)" value={salary} onChange={setSalary} prefix="₹" />
                <InputField id="years" label="Years of Service" value={years} onChange={setYears} suffix="Years" />
                <InputField id="months" label="Additional Months" value={months} onChange={setMonths} suffix="Months" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Gratuity Amount</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Gratuity Amount", value: result.gratuity, highlight: true },
                  { label: "Tax-Exempt Amount", value: result.taxExempt },
                  { label: "Taxable Gratuity", value: Math.max(0, result.gratuity - result.taxExempt) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is a Gratuity Calculator?</h2>
              <p>A gratuity calculator helps employees estimate the gratuity amount they are entitled to receive upon retirement, resignation, or completion of service. Gratuity is a lump sum payment made by employers as a gesture of gratitude for the employee's service.</p>

              <h2 className="text-2xl font-bold mb-3">Gratuity Calculation Formula</h2>
              <p><strong>For employees covered under the Gratuity Act:</strong></p>
              <p>Gratuity = (15 × Last Drawn Salary × Years of Service) / 26</p>
              <p><strong>For employees not covered:</strong></p>
              <p>Gratuity = (15 × Last Drawn Salary × Years of Service) / 30</p>
              <p>Here, "Last Drawn Salary" means Basic Salary + Dearness Allowance. The divisor 26 represents working days in a month.</p>

              <h2 className="text-2xl font-bold mb-3">Gratuity Tax Rules</h2>
              <ul>
                <li><strong>Government employees:</strong> Gratuity is fully exempt from tax.</li>
                <li><strong>Private sector (Gratuity Act):</strong> Exempt up to ₹20,00,000.</li>
                <li><strong>Private sector (Non-Act):</strong> Exempt amount is the least of actual gratuity, ₹20 lakh, or half month's salary for each completed year.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This is an estimate based on the standard formula. Actual gratuity may vary based on company policy and specific employment terms. Consult your HR department.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gratuity-calculator" />
          <PopularCalculators exclude="/gratuity-calculator" />
        </div>
      </div>
    </>
  );
};

export default GratuityCalculator;


