"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const HRACalculator = () => {
  const [basicSalary, setBasicSalary] = useState("40000");
  const [da, setDa] = useState("5000");
  const [hraReceived, setHraReceived] = useState("20000");
  const [rentPaid, setRentPaid] = useState("15000");
  const [isMetro, setIsMetro] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ exempt: number; taxable: number; rule1: number; rule2: number; rule3: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const basic = parseFloat(basicSalary) || 0;
    const daVal = parseFloat(da) || 0;
    const hra = parseFloat(hraReceived) || 0;
    const rent = parseFloat(rentPaid) || 0;

    if (basic <= 0 || hra <= 0) return;

    const totalBasic = basic + daVal;

    // HRA exemption is LEAST of:
    // 1. Actual HRA received
    // 2. 50% of basic+DA (metro) or 40% (non-metro)
    // 3. Rent paid - 10% of basic+DA

    const rule1 = hra; // Actual HRA received
    const rule2 = totalBasic * (isMetro ? 0.50 : 0.40); // 50%/40% of salary
    const rule3 = Math.max(0, rent - totalBasic * 0.10); // Rent - 10% of salary

    const exempt = Math.min(rule1, rule2, rule3);
    const taxable = hra - exempt;

    setResult({ exempt, taxable, rule1, rule2, rule3 });
  };

  const reset = () => {
    setShowResults(false); setBasicSalary("40000"); setDa("5000"); setHraReceived("20000"); setRentPaid("15000"); setIsMetro(true); setResult(null); };

  const faqs = [
    { question: "What is HRA exemption?", answer: "HRA (House Rent Allowance) exemption is a tax benefit under Section 10(13A) for salaried employees who pay rent. The exempt portion reduces your taxable income." },
    { question: "How is HRA exemption calculated?", answer: "HRA exemption is the minimum of: (1) Actual HRA received, (2) 50% of salary for metro cities or 40% for non-metro, (3) Rent paid minus 10% of salary." },
    { question: "Which cities are considered metro for HRA?", answer: "Mumbai, Delhi, Chennai, and Kolkata are considered metro cities for HRA exemption calculation. All other cities fall under non-metro category." },
    { question: "Can I claim HRA if I own a house?", answer: "Yes, you can claim HRA exemption even if you own a house in a different city and are paying rent where you work. You can also claim both HRA and home loan deduction simultaneously." },
    { question: "What if my rent is less than 10% of salary?", answer: "If your rent is less than 10% of your basic salary + DA, the third rule gives zero, making the HRA exemption zero. You cannot claim any exemption in this case." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "HRA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">HRA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="basic" label="Monthly Basic Salary" value={basicSalary} onChange={setBasicSalary} prefix="₹" />
                <InputField id="da" label="Dearness Allowance (DA)" value={da} onChange={setDa} prefix="₹" />
                <InputField id="hra" label="HRA Received (Monthly)" value={hraReceived} onChange={setHraReceived} prefix="₹" />
                <InputField id="rent" label="Rent Paid (Monthly)" value={rentPaid} onChange={setRentPaid} prefix="₹" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <label className="text-sm font-medium text-foreground">City Type:</label>
                <button onClick={() => { setIsMetro(true); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isMetro ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Metro (50%)</button>
                <button onClick={() => { setIsMetro(false); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!isMetro ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Non-Metro (40%)</button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">HRA Exemption Breakdown</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "HRA Exempt (Monthly)", value: result.exempt, highlight: true },
                  { label: "Taxable HRA (Monthly)", value: result.taxable },
                  { label: "Annual Exemption", value: result.exempt * 12, highlight: true },
                ]} />

                <div className="mt-6 bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-sm">Exemption Rules (Least of the three):</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1. Actual HRA Received</span>
                      <span className={`font-medium ${result.exempt === result.rule1 ? "text-[hsl(217,91%,40%)] dark:text-primary" : ""}`}>₹{result.rule1.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">2. {isMetro ? "50%" : "40%"} of Basic + DA</span>
                      <span className={`font-medium ${result.exempt === result.rule2 ? "text-[hsl(217,91%,40%)] dark:text-primary" : ""}`}>₹{result.rule2.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">3. Rent - 10% of Basic + DA</span>
                      <span className={`font-medium ${result.exempt === result.rule3 ? "text-[hsl(217,91%,40%)] dark:text-primary" : ""}`}>₹{result.rule3.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-semibold">
                      <span>Exempt Amount (Minimum)</span>
                      <span className="text-primary">₹{result.exempt.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is an HRA Calculator?</h2>
              <p>An HRA (House Rent Allowance) calculator helps salaried employees determine how much of their HRA is exempt from income tax under Section 10(13A) of the Income Tax Act. The exempt portion depends on your salary, rent paid, and city of residence.</p>

              <h2 className="text-2xl font-bold mb-3">HRA Exemption Formula</h2>
              <p>HRA exemption is the <strong>minimum</strong> of these three amounts:</p>
              <ul>
                <li><strong>Rule 1:</strong> Actual HRA received from employer.</li>
                <li><strong>Rule 2:</strong> 50% of (Basic + DA) for metro cities, or 40% for non-metro cities.</li>
                <li><strong>Rule 3:</strong> Rent paid minus 10% of (Basic + DA).</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Metro vs Non-Metro Cities</h2>
              <p>For HRA calculation, only four cities are classified as metro: <strong>Mumbai, Delhi, Chennai, and Kolkata</strong>. All other cities, including Bangalore, Hyderabad, Pune, etc., are classified as non-metro and qualify for the 40% rule.</p>

              <h2 className="text-2xl font-bold mb-3">Important Points</h2>
              <ul>
                <li>HRA exemption is only available under the <strong>old tax regime</strong>. The new regime does not allow HRA deduction.</li>
                <li>If annual rent exceeds ₹1,00,000, you must provide your landlord's PAN.</li>
                <li>Rent receipts are required as proof for claiming HRA exemption.</li>
                <li>Self-employed individuals cannot claim HRA under Section 10(13A), but can claim rent deduction under Section 80GG.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for tax planning purposes. Actual exemption depends on your specific employment terms and tax filing. Consult a tax advisor.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hra-calculator" />
          <PopularCalculators exclude="/hra-calculator" />
        </div>
      </div>
    </>
  );
};

export default HRACalculator;


