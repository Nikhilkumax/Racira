"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type StateKey = "maharashtra" | "karnataka" | "delhi" | "tamil_nadu" | "uttar_pradesh" | "telangana" | "west_bengal" | "rajasthan";

const stateRates: Record<StateKey, { label: string; stampDutyMale: number; stampDutyFemale: number; registration: number }> = {
  maharashtra: { label: "Maharashtra", stampDutyMale: 6, stampDutyFemale: 5, registration: 1 },
  karnataka: { label: "Karnataka", stampDutyMale: 5, stampDutyFemale: 5, registration: 1 },
  delhi: { label: "Delhi", stampDutyMale: 6, stampDutyFemale: 4, registration: 1 },
  tamil_nadu: { label: "Tamil Nadu", stampDutyMale: 7, stampDutyFemale: 7, registration: 4 },
  uttar_pradesh: { label: "Uttar Pradesh", stampDutyMale: 7, stampDutyFemale: 6, registration: 1 },
  telangana: { label: "Telangana", stampDutyMale: 6, stampDutyFemale: 6, registration: 0.5 },
  west_bengal: { label: "West Bengal", stampDutyMale: 7, stampDutyFemale: 7, registration: 1 },
  rajasthan: { label: "Rajasthan", stampDutyMale: 6, stampDutyFemale: 5, registration: 1 },
};

const StampDutyCalculator = () => {
  const [propertyValue, setPropertyValue] = useState("5000000");
  const [showResults, setShowResults] = useState(false);
  const [state, setState] = useState<StateKey>("maharashtra");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [result, setResult] = useState<{
    stampDuty: number; registrationCharge: number; totalCharges: number; effectiveRate: number; stampDutyRate: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const value = parseFloat(propertyValue) || 0;
    if (value <= 0) return;

    const rates = stateRates[state];
    const sdRate = gender === "female" ? rates.stampDutyFemale : rates.stampDutyMale;
    const stampDuty = (value * sdRate) / 100;
    const registration = (value * rates.registration) / 100;

    setResult({
      stampDuty: Math.round(stampDuty),
      registrationCharge: Math.round(registration),
      totalCharges: Math.round(stampDuty + registration),
      effectiveRate: sdRate + rates.registration,
      stampDutyRate: sdRate,
    });
  };

  const reset = () => {
    setShowResults(false); setPropertyValue("5000000"); setState("maharashtra"); setGender("male"); setResult(null); };

  const faqs = [
    { question: "What is Stamp Duty?", answer: "Stamp duty is a tax levied by state governments on property transactions. It is a legal requirement to register the property and serves as proof of ownership. Rates vary by state, property type, and buyer's gender." },
    { question: "Is stamp duty different for men and women?", answer: "Yes, in many states like Delhi, Maharashtra, Rajasthan, and UP, women buyers pay lower stamp duty (1-2% less) to encourage property ownership among women." },
    { question: "Can stamp duty be claimed as tax deduction?", answer: "Yes, stamp duty and registration charges paid on a residential property can be claimed as deduction under Section 80C (up to ₹1.5 lakh combined limit) in the year of payment." },
    { question: "What is the difference between stamp duty and registration charges?", answer: "Stamp duty is the tax on the property transaction, while registration charges are the fee for registering the property document with the sub-registrar office. Both are mandatory for legal ownership transfer." },
    { question: "Is stamp duty calculated on agreement value or market value?", answer: "Stamp duty is calculated on the higher of the agreement value (sale price) or the government's circle rate/ready reckoner rate. This prevents undervaluation of properties." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Stamp Duty Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Stamp Duty Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate stamp duty and registration charges for property purchases across Indian states.</p>

            <div className="card-calculator mb-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(stateRates) as StateKey[]).map(k => (
                    <button key={k} onClick={() => { setState(k); setResult(null); }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${state === k ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      {stateRates[k].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="propertyValue" label="Property Value" value={propertyValue} onChange={setPropertyValue} prefix="₹" tooltip="Agreement value or circle rate, whichever is higher" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Buyer's Gender</label>
                  <div className="flex gap-2">
                    <button onClick={() => { setGender("male"); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "male" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Male</button>
                    <button onClick={() => { setGender("female"); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gender === "female" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Female</button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                {stateRates[state].label}: Stamp Duty {gender === "female" ? stateRates[state].stampDutyFemale : stateRates[state].stampDutyMale}% | Registration {stateRates[state].registration}%
              </p>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Charges</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Stamp Duty & Registration — {stateRates[state].label}</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Stamp Duty", value: result.stampDuty, highlight: true },
                  { label: "Registration Charges", value: result.registrationCharge },
                  { label: "Total Charges", value: result.totalCharges, highlight: true },
                  { label: "Stamp Duty Rate", value: 0, textValue: `${result.stampDutyRate}%` },
                  { label: "Effective Rate", value: 0, textValue: `${result.effectiveRate}%` },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is Stamp Duty?</h2>
              <p>Stamp duty is a legal tax imposed by state governments on property transactions. It must be paid before or at the time of executing a sale deed, and the property registration is incomplete without it. The rates vary significantly across states and are influenced by factors like property type, location, buyer's gender, and property value.</p>

              <h2>Stamp Duty Rates Across India (2024-25)</h2>
              <ul>
                <li><strong>Maharashtra:</strong> 6% (men), 5% (women) + 1% registration. Additional 1% metro cess in Mumbai.</li>
                <li><strong>Delhi:</strong> 6% (men), 4% (women) + 1% registration.</li>
                <li><strong>Karnataka:</strong> 5% for all + 1% registration.</li>
                <li><strong>Tamil Nadu:</strong> 7% + 4% registration — one of the highest in India.</li>
                <li><strong>UP:</strong> 7% (men), 6% (women) + 1% registration.</li>
                <li><strong>Telangana:</strong> 6% + 0.5% registration.</li>
              </ul>

              <h2>How to Save on Stamp Duty</h2>
              <ul>
                <li><strong>Register in a woman's name:</strong> Many states offer 1-2% lower rates for female buyers.</li>
                <li><strong>Joint ownership:</strong> If jointly owned with a woman, lower rates may apply.</li>
                <li><strong>Claim Section 80C:</strong> Stamp duty and registration charges qualify for deduction up to ₹1.5 lakh.</li>
                <li><strong>Check for concessions:</strong> Some states offer reduced rates for affordable housing, first-time buyers, or properties below a certain value.</li>
              </ul>

              <h2>Documents Required for Property Registration</h2>
              <ul>
                <li>Sale deed / agreement to sell</li>
                <li>Identity proof (Aadhaar, PAN) of buyer and seller</li>
                <li>Property card / 7/12 extract</li>
                <li>Previous ownership documents (chain of title)</li>
                <li>NOC from society/builder (if applicable)</li>
                <li>Stamp duty and registration fee payment receipts</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Rates are indicative and may not include additional surcharges, metro cess, or local body taxes. Verify with the local sub-registrar office for exact charges.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stamp-duty-calculator" />
            <PopularCalculators exclude="/stamp-duty-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default StampDutyCalculator;


