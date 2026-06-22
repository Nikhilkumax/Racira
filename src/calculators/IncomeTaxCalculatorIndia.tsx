"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

// FY 2024-25 slabs
const newRegimeSlabs = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const oldRegimeSlabs = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const calcTax = (income: number, slabs: typeof newRegimeSlabs) => {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const taxable = Math.min(income, slab.max) - slab.min;
    tax += taxable * slab.rate / 100;
  }
  return tax;
};

const IncomeTaxCalculatorIndia = () => {
  const [grossIncome, setGrossIncome] = useState("1200000");
  const [ded80C, setDed80C] = useState("150000");
  const [ded80D, setDed80D] = useState("25000");
  const [hra, setHra] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");
  const [stdDeduction, setStdDeduction] = useState("75000");
  const [showResults, setShowResults] = useState(false); // New regime 75K from FY24-25
  const [age, setAge] = useState<"below60" | "60to80" | "above80">("below60");
  const [result, setResult] = useState<{
    oldTax: number; newTax: number; oldCess: number; newCess: number;
    oldTotal: number; newTotal: number; savings: number; betterRegime: string;
    oldTaxableIncome: number; newTaxableIncome: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const gross = parseFloat(grossIncome) || 0;
    const d80c = Math.min(parseFloat(ded80C) || 0, 150000);
    const d80d = Math.min(parseFloat(ded80D) || 0, age === "above80" ? 100000 : age === "60to80" ? 50000 : 25000);
    const hraExempt = parseFloat(hra) || 0;
    const other = parseFloat(otherDeductions) || 0;
    const std = parseFloat(stdDeduction) || 0;

    // Old regime
    const oldTaxable = Math.max(0, gross - 50000 - d80c - d80d - hraExempt - other); // Old std deduction = 50K
    let oldTax = calcTax(oldTaxable, oldRegimeSlabs);
    // Rebate u/s 87A for old regime (income up to 5L)
    if (oldTaxable <= 500000) oldTax = 0;
    const oldCess = oldTax * 0.04;

    // New regime (FY 2024-25)
    const newTaxable = Math.max(0, gross - std); // Only standard deduction in new regime
    let newTax = calcTax(newTaxable, newRegimeSlabs);
    // Rebate u/s 87A for new regime (income up to 7L)
    if (newTaxable <= 700000) newTax = 0;
    const newCess = newTax * 0.04;

    const oldTotal = oldTax + oldCess;
    const newTotal = newTax + newCess;

    setResult({
      oldTax, newTax, oldCess, newCess, oldTotal, newTotal,
      savings: Math.abs(oldTotal - newTotal),
      betterRegime: oldTotal <= newTotal ? "Old Regime" : "New Regime",
      oldTaxableIncome: oldTaxable,
      newTaxableIncome: newTaxable,
    });
  };

  const reset = () => {
    setShowResults(false); setGrossIncome("1200000"); setDed80C("150000"); setDed80D("25000"); setHra("0"); setOtherDeductions("0"); setStdDeduction("75000"); setAge("below60"); setResult(null); };

  const ageGroups = [
    { value: "below60", label: "Below 60" },
    { value: "60to80", label: "60-80 (Senior)" },
    { value: "above80", label: "80+ (Super Senior)" },
  ];

  const faqs = [
    { question: "Which tax regime is better — old or new?", answer: "It depends on your deductions. If your total deductions (80C, 80D, HRA, etc.) exceed ₹3-4 lakh, the old regime is usually better. If you have minimal deductions, the new regime with lower slab rates is advantageous." },
    { question: "What is the standard deduction in FY 2024-25?", answer: "Standard deduction is ₹50,000 in the old regime and ₹75,000 in the new regime (increased from ₹50,000 in Budget 2024)." },
    { question: "What is the rebate under Section 87A?", answer: "In the old regime, if taxable income is up to ₹5,00,000, tax is nil. In the new regime, the rebate applies up to ₹7,00,000 taxable income." },
    { question: "Is the 4% cess applicable on both regimes?", answer: "Yes, Health & Education Cess of 4% is charged on the total tax amount in both old and new regimes." },
    { question: "Can I switch between regimes every year?", answer: "Salaried employees can switch between old and new regimes every financial year. Business/professional income taxpayers can switch only once in a lifetime." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Income Tax Calculator (India)" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Income Tax Calculator (India)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Age Group</label>
                <div className="flex flex-wrap gap-2">
                  {ageGroups.map(a => (
                    <button key={a.value} onClick={() => { setAge(a.value as any); setResult(null); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${age === a.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-4">
                <InputField id="grossIncome" label="Gross Annual Income" value={grossIncome} onChange={setGrossIncome} prefix="₹" tooltip="Total annual salary before deductions" />
                <InputField id="ded80C" label="Section 80C Deductions" value={ded80C} onChange={setDed80C} prefix="₹" tooltip="PPF, ELSS, LIC, EPF, etc. (max ₹1.5L)" />
                <InputField id="ded80D" label="Section 80D (Medical)" value={ded80D} onChange={setDed80D} prefix="₹" tooltip="Health insurance premium" />
                <InputField id="hra" label="HRA Exemption" value={hra} onChange={setHra} prefix="₹" tooltip="HRA exempt under Section 10(13A)" />
                <InputField id="otherDeductions" label="Other Deductions" value={otherDeductions} onChange={setOtherDeductions} prefix="₹" tooltip="80E (education loan), 80G (donations), etc." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Compare Tax Regimes</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Tax Comparison — FY 2024-25</h2>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 mb-6 text-center">
                  <p className="text-sm text-muted-foreground">Better Regime</p>
                  <p className="text-2xl font-bold text-[hsl(217,91%,40%)] dark:text-primary">{result.betterRegime}</p>
                  <p className="text-sm text-muted-foreground">You save ₹{result.savings.toLocaleString("en-IN")}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Old Regime</h3>
                    <ResultDisplay currency="₹" items={[
                      { label: "Taxable Income", value: result.oldTaxableIncome },
                      { label: "Income Tax", value: result.oldTax },
                      { label: "Cess (4%)", value: result.oldCess },
                      { label: "Total Tax", value: result.oldTotal, highlight: true },
                    ]} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">New Regime</h3>
                    <ResultDisplay currency="₹" items={[
                      { label: "Taxable Income", value: result.newTaxableIncome },
                      { label: "Income Tax", value: result.newTax },
                      { label: "Cess (4%)", value: result.newCess },
                      { label: "Total Tax", value: result.newTotal, highlight: true },
                    ]} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>Income Tax Slabs FY 2024-25 (New Regime)</h2>
              <ul>
                <li>Up to ₹3,00,000 — Nil</li>
                <li>₹3,00,001 to ₹7,00,000 — 5%</li>
                <li>₹7,00,001 to ₹10,00,000 — 10%</li>
                <li>₹10,00,001 to ₹12,00,000 — 15%</li>
                <li>₹12,00,001 to ₹15,00,000 — 20%</li>
                <li>Above ₹15,00,000 — 30%</li>
              </ul>

              <h2>Income Tax Slabs FY 2024-25 (Old Regime)</h2>
              <ul>
                <li>Up to ₹2,50,000 — Nil (₹3L for seniors, ₹5L for super seniors)</li>
                <li>₹2,50,001 to ₹5,00,000 — 5%</li>
                <li>₹5,00,001 to ₹10,00,000 — 20%</li>
                <li>Above ₹10,00,000 — 30%</li>
              </ul>

              <h2>Key Deductions in Old Regime</h2>
              <ul>
                <li><strong>Section 80C (₹1.5L):</strong> PPF, ELSS, EPF, LIC, NSC, SCSS, 5-yr FD, tuition fees</li>
                <li><strong>Section 80D:</strong> Health insurance — ₹25K (self), ₹25K (parents), ₹50K for senior citizen parents</li>
                <li><strong>Section 80E:</strong> Interest on education loan (no limit)</li>
                <li><strong>Section 80G:</strong> Donations to approved charities (50-100%)</li>
                <li><strong>HRA Exemption:</strong> Calculated under Section 10(13A)</li>
                <li><strong>Standard Deduction:</strong> ₹50,000 from salary income</li>
              </ul>

              <h2>When to Choose Old vs New Regime</h2>
              <p>As a thumb rule, if your total deductions (80C + 80D + HRA + others) exceed approximately ₹3.75 lakh, the old regime is likely better. With fewer deductions, the new regime's lower slab rates and higher standard deduction (₹75,000) make it more beneficial.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Tax slabs and rules are for FY 2024-25 (AY 2025-26). Surcharge and marginal relief are not included. Consult a CA for precise calculation.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/income-tax-calculator-india" />
          <PopularCalculators exclude="/income-tax-calculator-india" />
        </div>
      </div>
    </>
  );
};

export default IncomeTaxCalculatorIndia;


