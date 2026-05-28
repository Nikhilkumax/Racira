"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Utensils } from "lucide-react";

const TipAndSplitCalculator = () => {
  const [bill, setBill] = useState("80");
  const [tipPct, setTipPct] = useState("18");
  const [people, setPeople] = useState("2");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const b = parseFloat(bill) || 0;
    const t = parseFloat(tipPct) || 0;
    const p = parseFloat(people) || 1;

    if (b <= 0 || p <= 0) return;

    const tipAmount = b * (t / 100);
    const total = b + tipAmount;
    const perPerson = total / p;

    setResults({
      tipAmount,
      total,
      perPerson,
      tipPerPerson: tipAmount / p
    });
  };

  const reset = () => {
    setShowResults(false);
    setBill("80"); setTipPct("18"); setPeople("2");
    setResults(null);
  };

  const faqs = [
    { question: "What is the standard tipping percentage?", answer: "In the United States, the standard tip for good service in a restaurant is typically 15% to 20%. For exceptional service, 22% to 25% is common." },
    { question: "Should I tip on the total bill before or after tax?", answer: "Traditionally, tipping is calculated based on the pre-tax subtotal of the bill. However, many modern point-of-sale systems suggest tips based on the total after-tax amount." },
    { question: "How do I split a bill fairly if some people ordered more?", answer: "While splitting equally is easiest, if there is a large discrepancy in what people ordered, it's often better to calculate individual subtotals, add a proportionate share of the tax and tip, and pay separately." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tip and Split Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tip and Split Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Quickly calculate the correct tip amount and split the total bill evenly among your group.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="bill" label="Bill Amount" value={bill} onChange={setBill} prefix="$" />
                <InputField id="tip" label="Tip Percentage" value={tipPct} onChange={setTipPct} suffix="%" />
                <InputField id="people" label="Number of People" value={people} onChange={setPeople} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Utensils className="h-5 w-5" /> Calculate Split
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Split Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Per Person</p>
                    <p className="text-5xl font-black text-foreground">${results.perPerson.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Bill + Tip</p>
                    <p className="text-3xl font-black text-foreground">${results.total.toFixed(2)}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Tip Amount", value: 0, textValue: "$" + results.tipAmount.toFixed(2) },
                  { label: "Tip Per Person", value: 0, textValue: "$" + results.tipPerPerson.toFixed(2) },
                  { label: "Suggested Tip (20%)", value: 0, textValue: "$" + (parseFloat(bill) * 0.2).toFixed(2) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Tipping Etiquette</h2>
              <p>Tipping is a way to show appreciation for good service, but the rules can vary significantly depending on where you are in the world. In the US, it is an essential part of service workers' income.</p>
              <h3>When to Tip More</h3>
              <p>It is customary to tip at the higher end of the scale (20-25%) for large groups, exceptional service, or when you stay at a table for a long time after finishing your meal. Conversely, if service was poor, a lower tip is acceptable, but it is often better to speak with a manager to address the issue directly.</p>
              <h3>International Tipping</h3>
              <p>In many European countries, a service charge is often included in the bill, and a small additional tip (rounding up the bill) is appreciated but not mandatory. In Japan, tipping is often seen as unnecessary or even offensive. Always research local customs before traveling!</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tip-and-split" />
          <PopularCalculators exclude="/calculator/tip-and-split-calculator" />
        </div>
      </div>
    </>
  );
};

export default TipAndSplitCalculator;

