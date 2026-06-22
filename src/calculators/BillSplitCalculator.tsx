"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const BillSplitCalculator = () => {
  const [totalBill, setTotalBill] = useState("120");
  const [numPeople, setNumPeople] = useState("4");
  const [tipPct, setTipPct] = useState("15");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const bill = parseFloat(totalBill) || 0;
    const people = parseInt(numPeople) || 1;
    const tip = (parseFloat(tipPct) || 0) / 100;

    const totalTip = bill * tip;
    const totalWithTip = bill + totalTip;
    const perPerson = totalWithTip / people;

    setResults({
      totalTip,
      totalWithTip,
      perPerson,
    });
  };

  const reset = () => {
    setShowResults(false);
    setTotalBill("120");
    setNumPeople("4");
    setTipPct("15");
    setResults(null);
  };

  const faqs = [
    { question: "How do you split a bill with different tips?", answer: "Our calculator applies a single tip percentage to the entire bill and then splits the total evenly. If people want to pay different amounts, you can calculate the total with tip first and then divide the final sum manually." },
    { question: "Is tip calculated before or after tax?", answer: "In most countries, it is customary to tip on the pre-tax amount. However, many modern POS systems suggest tips based on the total after-tax bill. Choose whichever method aligns with local customs." },
    { question: "What is a standard tip for large groups?", answer: "For groups of 6 or more, many restaurants automatically add a 'gratuity' of 18% or 20%. Always check your receipt before adding an additional tip to avoid double-tipping." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Bill Split" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bill Split Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="totalBill" label="Total Bill" value={totalBill} onChange={setTotalBill} prefix="$" />
                <InputField id="numPeople" label="Number of People" value={numPeople} onChange={setNumPeople} />
                <InputField id="tipPct" label="Tip Percentage" value={tipPct} onChange={setTipPct} suffix="%" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Split Bill</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Amount Per Person</h2>
                  <p className="text-5xl font-extrabold mb-2">${results.perPerson.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total with tip: ${results.totalWithTip.toFixed(2)}</p>
                </div>

                <ResultDisplay items={[
                  { label: "Per Person Share", value: results.perPerson, highlight: true },
                  { label: "Total Tip Amount", value: results.totalTip },
                  { label: "Final Total Bill", value: results.totalWithTip, highlight: true },
                  { label: "People Splitting", value: 0, textValue: numPeople },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2>Sharing Expenses Without the Stress</h2>
              <p>Dining out or traveling with friends is fun until the bill arrives. A bill split calculator removes the awkwardness and math errors from the table, ensuring everyone pays their fair share exactly.</p>
              <h3>When to Split Evenly</h3>
              <p>Splitting evenly is best for meals where everyone ordered similar items or for shared costs like a vacation rental or utility bill. If one person ordered significantly more expensive items, it's often more fair to calculate individual subtotals first.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bill-split-calculator" />
          <PopularCalculators exclude="/calculator/bill-split-calculator" />
        </div>
      </div>
    </>
  );
};

export default BillSplitCalculator;

