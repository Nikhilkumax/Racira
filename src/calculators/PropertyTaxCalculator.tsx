"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Landmark } from "lucide-react";

const PropertyTaxCalculator = () => {
  const [assessedValue, setAssessedValue] = useState("300000");
  const [taxRate, setTaxRate] = useState("1.2");
  const [rateType, setRateType] = useState("percent");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const value = parseFloat(assessedValue) || 0;
    const rate = parseFloat(taxRate) || 0;

    if (value <= 0) return;

    let annualTax = 0;
    if (rateType === "percent") {
      annualTax = value * (rate / 100);
    } else {
      // Mill rate is per $1000 of value
      annualTax = (value / 1000) * rate;
    }

    setResults({
      annualTax,
      monthlyTax: annualTax / 12,
      effectiveRate: (annualTax / value) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setAssessedValue("300000"); setTaxRate("1.2"); setRateType("percent");
    setResults(null);
  };

  const faqs = [
    { question: "What is a Mill Rate?", answer: "A mill rate is the amount of tax payable per $1,000 of the assessed value of a property. One mill is equal to one-tenth of one cent ($0.001)." },
    { question: "How is assessed value different from market value?", answer: "Market value is what a buyer is willing to pay for your home. Assessed value is a valuation determined by a local government tax assessor for the purpose of calculating property taxes. It is often lower than the market value." },
    { question: "Can I appeal my property tax assessment?", answer: "Yes, most jurisdictions have a process for homeowners to appeal their assessment if they believe it is inaccurately high. This typically requires providing evidence of lower-priced comparable sales in your area." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Property Tax Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Property Tax Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate your annual and monthly property tax obligations based on assessed home value and local tax rates.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="value" label="Assessed Home Value" value={assessedValue} onChange={setAssessedValue} prefix="$" />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="rate" label="Tax Rate" value={taxRate} onChange={setTaxRate} />
                  </div>
                  <div className="w-28 mt-7">
                    <select value={rateType} onChange={(e) => setRateType(e.target.value)} className="input-calc">
                      <option value="percent">Percent (%)</option>
                      <option value="mill">Mill Rate</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Landmark className="h-5 w-5" /> Calculate Taxes
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Tax Estimate</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual Property Tax</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.annualTax).toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Amount</p>
                    <p className="text-3xl font-black text-foreground">${Math.round(results.monthlyTax).toLocaleString()}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Effective Tax Rate", value: 0, textValue: results.effectiveRate.toFixed(3) + "%" },
                  { label: "Assessment Ratio", value: 0, textValue: "Varies by State" },
                  { label: "Next Assessment Date", value: 0, textValue: "Check Local Dept" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>How Property Taxes Work</h2>
              <p>Property taxes are a major source of revenue for local governments, funding schools, roads, police, and fire departments. For many homeowners, these taxes are paid through an escrow account as part of their monthly mortgage payment.</p>
              <h3>Understanding the Assessment</h3>
              <p>Your property tax is not based on what you paid for your house, but on its "assessed value." Local assessors use comparable home sales and property characteristics to determine this value. Some states also have "homestead exemptions" which can reduce the taxable value of your primary residence.</p>
              <h3>Mill Rates vs. Percentages</h3>
              <p>While some areas describe tax as a simple percentage (e.g., 1.2%), many use "mills." A mill is one-thousandth of a dollar. If your city has a mill rate of 25, you pay $25 for every $1,000 of assessed value. Our calculator handles both formats to ensure you get an accurate estimate regardless of how your local government reports its rates.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/property-tax" />
            <PopularCalculators exclude="/calculator/property-tax-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default PropertyTaxCalculator;

