"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

type Mode = "add" | "reverse";

const SalesTaxCalculator = () => {
  const [mode, setMode] = useState<Mode>("add");
  const [price, setPrice] = useState("100");
  const [taxRate, setTaxRate] = useState("8.25");
  const [showResults, setShowResults] = useState(false);

  const [result, setResult] = useState<{ taxAmount: number; beforeTax: number; afterTax: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(price) || 0;
    const r = (parseFloat(taxRate) || 0) / 100;
    if (p <= 0) return;

    if (mode === "add") {
      const tax = p * r;
      setResult({ taxAmount: tax, beforeTax: p, afterTax: p + tax });
    } else {
      const beforeTax = p / (1 + r);
      const tax = p - beforeTax;
      setResult({ taxAmount: tax, beforeTax, afterTax: p });
    }
  };

  const reset = () => {
    setShowResults(false); setPrice("100"); setTaxRate("8.25"); setResult(null); };

  const faqs = [
    { question: "How is sales tax calculated?", answer: "Sales tax is calculated by multiplying the pre-tax price by the tax rate. For example, an item priced at $100 with an 8.25% tax rate would have $8.25 in sales tax, for a total of $108.25." },
    { question: "How do I find the pre-tax price from a total?", answer: "Divide the total price by (1 + tax rate). For example, if the total is $108.25 and the tax rate is 8.25%, the pre-tax price is $108.25 ÷ 1.0825 = $100.00." },
    { question: "Do all states have sales tax?", answer: "No. Five US states have no state sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. However, some cities in Alaska do levy local sales taxes." },
    { question: "What is the average US sales tax rate?", answer: "The average combined state and local sales tax rate in the US is approximately 7.12%. Rates range from 0% (in tax-free states) to over 10% in some jurisdictions." },
    { question: "Is sales tax included in the listed price?", answer: "In the US, sales tax is typically added at checkout and not included in the listed price. In many other countries (EU, UK, Australia), tax (VAT/GST) is included in the displayed price." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sales Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sales Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex rounded-lg border border-input overflow-hidden mb-6">
                <button onClick={() => { setMode("add"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "add" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Add Tax to Price</button>
                <button onClick={() => { setMode("reverse"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "reverse" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Remove Tax from Total</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="price" label={mode === "add" ? "Before-Tax Price" : "After-Tax Total"} value={price} onChange={setPrice} prefix="$" />
                <InputField id="rate" label="Sales Tax Rate" value={taxRate} onChange={setTaxRate} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Results</h2>
                <ResultDisplay items={[
                  { label: "Before-Tax Price", value: result.beforeTax },
                  { label: "Sales Tax", value: result.taxAmount, highlight: true },
                  { label: "After-Tax Total", value: result.afterTax, highlight: true },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is a Sales Tax Calculator?</h2>
              <p>A sales tax calculator helps you determine the amount of sales tax on a purchase, or reverse-calculate the pre-tax price from a total that includes tax. It's useful for budgeting, price comparisons across states, and verifying receipts.</p>
              <p>Our calculator offers two modes: forward calculation (add tax to a pre-tax price) and reverse calculation (extract tax from a total amount). Simply enter the price and your local tax rate to get instant results.</p>

              <h2 className="text-2xl font-bold mb-3">How Sales Tax Works</h2>
              <p>Sales tax is a consumption tax imposed by state and local governments on retail transactions. The rate varies by jurisdiction and can range from 0% to over 10% when combining state and local rates.</p>
              <p>The forward formula is straightforward: Total = Price × (1 + Tax Rate). For reverse calculation: Pre-tax Price = Total ÷ (1 + Tax Rate).</p>

              <h2 className="text-2xl font-bold mb-3">US Sales Tax Overview</h2>
              <p>The United States has a complex sales tax system where rates vary by state, county, and city. Some key points:</p>
              <ul>
                <li><strong>No federal sales tax:</strong> Unlike many countries, the US has no national sales tax or VAT.</li>
                <li><strong>State rates:</strong> Range from 0% (tax-free states) to 7.25% (California).</li>
                <li><strong>Local surcharges:</strong> Cities and counties may add their own taxes, pushing combined rates over 10% in some areas.</li>
                <li><strong>Exemptions:</strong> Many states exempt groceries, medicine, and clothing from sales tax.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Sales Tax vs. VAT</h2>
              <p>Sales tax (used in the US) is collected only at the point of final sale. Value Added Tax (VAT), used in most other countries, is collected at every stage of production and distribution. While both ultimately tax consumption, the mechanism and compliance requirements differ significantly.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates. Actual tax rates vary by location and product category. Verify rates with your local tax authority.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sales-tax-calculator" />
          <PopularCalculators exclude="/sales-tax-calculator" />
        </div>
      </div>
    </>
  );
};

export default SalesTaxCalculator;


