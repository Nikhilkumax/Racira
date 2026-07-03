"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type StateKey = "maharashtra" | "karnataka" | "west_bengal" | "andhra_pradesh" | "telangana" | "tamil_nadu" | "gujarat" | "madhya_pradesh";

const stateSlabs: Record<StateKey, { label: string; slabs: { min: number; max: number; tax: number }[] }> = {
  maharashtra: {
    label: "Maharashtra",
    slabs: [
      { min: 0, max: 7500, tax: 0 },
      { min: 7501, max: 10000, tax: 175 },
      { min: 10001, max: Infinity, tax: 200 }, // ₹300 for Feb
    ],
  },
  karnataka: {
    label: "Karnataka",
    slabs: [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: 25000, tax: 200 },
      { min: 25001, max: Infinity, tax: 200 },
    ],
  },
  west_bengal: {
    label: "West Bengal",
    slabs: [
      { min: 0, max: 10000, tax: 0 },
      { min: 10001, max: 15000, tax: 110 },
      { min: 15001, max: 25000, tax: 130 },
      { min: 25001, max: 40000, tax: 150 },
      { min: 40001, max: Infinity, tax: 200 },
    ],
  },
  andhra_pradesh: {
    label: "Andhra Pradesh",
    slabs: [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: 20000, tax: 150 },
      { min: 20001, max: Infinity, tax: 200 },
    ],
  },
  telangana: {
    label: "Telangana",
    slabs: [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: 20000, tax: 150 },
      { min: 20001, max: Infinity, tax: 200 },
    ],
  },
  tamil_nadu: {
    label: "Tamil Nadu",
    slabs: [
      { min: 0, max: 21000, tax: 0 },
      { min: 21001, max: 30000, tax: 100 },
      { min: 30001, max: 45000, tax: 235 },
      { min: 45001, max: 60000, tax: 510 },
      { min: 60001, max: 75000, tax: 760 },
      { min: 75001, max: Infinity, tax: 1095 },
    ],
  },
  gujarat: {
    label: "Gujarat",
    slabs: [
      { min: 0, max: 5999, tax: 0 },
      { min: 6000, max: 8999, tax: 80 },
      { min: 9000, max: 11999, tax: 150 },
      { min: 12000, max: Infinity, tax: 200 },
    ],
  },
  madhya_pradesh: {
    label: "Madhya Pradesh",
    slabs: [
      { min: 0, max: 18750, tax: 0 },
      { min: 18751, max: 25000, tax: 125 },
      { min: 25001, max: Infinity, tax: 208 },
    ],
  },
};

const ProfessionalTaxCalculator = () => {
  const [monthlySalary, setMonthlySalary] = useState("50000");
  const [showResults, setShowResults] = useState(false);
  const [state, setState] = useState<StateKey>("maharashtra");
  const [result, setResult] = useState<{ monthlyTax: number; annualTax: number; effectiveRate: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const salary = parseFloat(monthlySalary) || 0;
    if (salary <= 0) return;

    const slabs = stateSlabs[state].slabs;
    let monthlyTax = 0;
    for (const slab of slabs) {
      if (salary >= slab.min && salary <= slab.max) {
        monthlyTax = slab.tax;
        break;
      }
    }

    // Max PT in India is ₹2,500/year
    const annualTax = Math.min(monthlyTax * 12, 2500);
    setResult({ monthlyTax, annualTax, effectiveRate: (annualTax / (salary * 12)) * 100 });
  };

  const reset = () => {
    setShowResults(false); setMonthlySalary("50000"); setState("maharashtra"); setResult(null); };

  const faqs = [
    { question: "What is Professional Tax?", answer: "Professional Tax (PT) is a state-level tax levied on salaried individuals and professionals. It is deducted by the employer from salary and remitted to the state government. The maximum PT is capped at ₹2,500 per year by the Constitution." },
    { question: "Which states levy Professional Tax?", answer: "States like Maharashtra, Karnataka, West Bengal, Andhra Pradesh, Telangana, Tamil Nadu, Gujarat, Madhya Pradesh, Kerala, Assam, and others levy PT. Some states like Delhi, UP, Rajasthan, and Haryana do not charge PT." },
    { question: "Is Professional Tax deductible from income tax?", answer: "Yes, Professional Tax paid is fully deductible under Section 16(iii) of the Income Tax Act as a deduction from salary income." },
    { question: "Who is exempt from Professional Tax?", answer: "Exemptions vary by state but typically include parents of children with disabilities, members of armed forces, and individuals above a certain age. Some states exempt women or persons with disabilities." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Professional Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Professional Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(stateSlabs) as StateKey[]).map(k => (
                    <button key={k} onClick={() => { setState(k); setResult(null); }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${state === k ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      {stateSlabs[k].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="monthlySalary" label="Monthly Gross Salary" value={monthlySalary} onChange={setMonthlySalary} prefix="₹" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Professional Tax — {stateSlabs[state].label}</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Monthly PT", value: result.monthlyTax, highlight: true },
                  { label: "Annual PT", value: result.annualTax, highlight: true },
                  { label: "Effective Rate", value: 0, textValue: `${result.effectiveRate.toFixed(3)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is Professional Tax?</h2>
              <p>Professional Tax (PT) is a direct tax levied by state governments on individuals earning income through employment, trade, or profession. It is one of the oldest forms of taxation in India and is governed by Article 276 of the Indian Constitution, which caps it at ₹2,500 per year.</p>

              <h2>How Is Professional Tax Calculated?</h2>
              <p>Each state has its own slab structure based on monthly gross salary. The employer deducts PT from the employee's salary and deposits it with the state government. The slabs vary significantly — for example, Maharashtra charges ₹200/month for salaries above ₹10,000, while Tamil Nadu has a graduated structure reaching ₹1,095/half-year.</p>

              <h2>Professional Tax Rates by State</h2>
              <ul>
                <li><strong>Maharashtra:</strong> ₹175-200/month (₹300 in February to meet ₹2,500 cap)</li>
                <li><strong>Karnataka:</strong> ₹200/month for salary above ₹15,000</li>
                <li><strong>West Bengal:</strong> ₹110-200/month depending on salary slab</li>
                <li><strong>Tamil Nadu:</strong> Half-yearly payment, ₹100-1,095 based on salary</li>
                <li><strong>Gujarat:</strong> ₹80-200/month</li>
              </ul>

              <h2>Tax Benefits</h2>
              <p>Professional Tax paid during the financial year is <strong>deductible under Section 16(iii)</strong> of the Income Tax Act. This means it reduces your taxable salary income. The deduction is available in both old and new tax regimes.</p>

              <h2>States Without Professional Tax</h2>
              <p>Several states and union territories do not levy Professional Tax, including Delhi, Uttar Pradesh, Rajasthan, Haryana, Uttarakhand, Punjab, Himachal Pradesh, and Jammu & Kashmir.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> PT rates vary by state and are subject to change. Some states have special rates for February. Verify with your employer or state government portal.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/professional-tax-calculator" />
          <PopularCalculators exclude="/professional-tax-calculator" />
        </div>
      </div>
    </>
  );
};

export default ProfessionalTaxCalculator;


