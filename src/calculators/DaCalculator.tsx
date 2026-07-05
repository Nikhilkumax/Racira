"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const DACalculator = () => {
  const [basicPay, setBasicPay] = useState("56100");
  const [daPercent, setDaPercent] = useState("50");
  const [showResults, setShowResults] = useState(false);
  const [employeeType, setEmployeeType] = useState<"central" | "psu" | "custom">("central");
  const [result, setResult] = useState<{ daAmount: number; totalSalary: number; monthlyDA: number } | null>(null);

  // Recent DA rates for Central Govt employees (7th CPC)
  const presetRates: Record<string, number> = { central: 50, psu: 46 };

  const handleCalculate = () => {
    setShowResults(true);
    const basic = parseFloat(basicPay) || 0;
    const rate = employeeType === "custom" ? (parseFloat(daPercent) || 0) : presetRates[employeeType];
    if (basic <= 0) return;

    const monthlyDA = (basic * rate) / 100;
    setResult({ daAmount: monthlyDA * 12, totalSalary: (basic + monthlyDA) * 12, monthlyDA });
    if (employeeType !== "custom") setDaPercent(String(rate));
  };

  const reset = () => {
    setShowResults(false); setBasicPay("56100"); setDaPercent("50"); setEmployeeType("central"); setResult(null); };

  const faqs = [
    { question: "What is Dearness Allowance (DA)?", answer: "DA is a cost-of-living adjustment allowance paid by the government to its employees and pensioners to offset the impact of inflation. It is calculated as a percentage of the basic pay." },
    { question: "How often is DA revised?", answer: "For central government employees, DA is revised twice a year — effective from January 1 and July 1. The revised rates are usually announced a few months after the effective date." },
    { question: "How is DA calculated for central government employees?", answer: "DA% = ((Average AICPI for last 12 months – 115.76) / 115.76) × 100. The All India Consumer Price Index (AICPI) base year 2001=100 is used for 7th CPC employees." },
    { question: "Is DA taxable?", answer: "Yes, Dearness Allowance is fully taxable as part of salary income. It is added to your gross salary for income tax calculation." },
    { question: "What is the current DA rate?", answer: "As of January 2025, the DA for central government employees under the 7th CPC is 53%. This rate is subject to revision every six months." },
  ];

  const types = [
    { value: "central", label: "Central Govt (7th CPC)" },
    { value: "psu", label: "PSU Employee" },
    { value: "custom", label: "Custom Rate" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "DA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">DA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Employee Type</label>
                <div className="flex flex-wrap gap-2">
                  {types.map(t => (
                    <button key={t.value} onClick={() => { setEmployeeType(t.value as any); setResult(null); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${employeeType === t.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="basicPay" label="Basic Pay (Monthly)" value={basicPay} onChange={setBasicPay} prefix="₹" tooltip="Your monthly basic pay" />
                <InputField id="daPercent" label="DA Rate" value={employeeType === "custom" ? daPercent : String(presetRates[employeeType])} onChange={setDaPercent} suffix="%" tooltip="Dearness Allowance percentage" min="0" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">DA Calculation</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Monthly DA", value: result.monthlyDA, highlight: true },
                  { label: "Annual DA", value: result.daAmount, highlight: true },
                  { label: "Basic + DA (Annual)", value: result.totalSalary },
                  { label: "DA Rate Applied", value: 0, textValue: `${daPercent}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is a DA Calculator?</h2>
              <p>A Dearness Allowance (DA) calculator helps government employees and pensioners estimate their DA component based on their basic pay and the applicable DA rate. DA is revised semi-annually by the central government to compensate for rising cost of living.</p>

              <h2 className="text-2xl font-bold mb-3">How Is DA Calculated?</h2>
              <p>The formula is straightforward: <strong>DA = Basic Pay × DA Rate ÷ 100</strong>. For central government employees under the 7th CPC, the DA percentage is determined using the All India Consumer Price Index (AICPI) with 2001 as the base year.</p>
              <p>The formula used by the government: <strong>DA% = ((Average of AICPI for last 12 months – 115.76) / 115.76) × 100</strong></p>

              <h2 className="text-2xl font-bold mb-3">DA Rate History (7th CPC)</h2>
              <ul>
                <li><strong>Jan 2024:</strong> 50%</li>
                <li><strong>Jul 2023:</strong> 46%</li>
                <li><strong>Jan 2023:</strong> 42%</li>
                <li><strong>Jul 2022:</strong> 38%</li>
                <li><strong>Jan 2022:</strong> 34%</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">DA for Pensioners</h2>
              <p>Pensioners also receive DA at the same rate as serving employees. The DA is calculated on the basic pension amount. For pre-2016 retirees who haven't opted for 7th CPC revision, a different DA rate applies.</p>

              <h2 className="text-2xl font-bold mb-3">Impact of DA on Other Allowances</h2>
              <ul>
                <li><strong>HRA:</strong> Not directly affected by DA, but when DA crosses 25% or 50%, HRA classification may change.</li>
                <li><strong>Transport Allowance:</strong> Gets a DA component added to it.</li>
                <li><strong>Gratuity:</strong> DA is included in the last drawn salary for gratuity calculation.</li>
                <li><strong>PF:</strong> DA is part of PF-eligible salary in many organizations.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> DA rates are revised by the government periodically. The preset rates may not reflect the latest revision. Always verify with official government orders.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/da-calculator" />
          <PopularCalculators exclude="/da-calculator" />
        </div>
      </div>
    </>
  );
};

export default DACalculator;


