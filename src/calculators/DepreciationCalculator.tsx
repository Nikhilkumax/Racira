"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, TrendingDown } from "lucide-react";

const DepreciationCalculator = () => {
  const [assetCost, setAssetCost] = useState("50000");
  const [salvageValue, setSalvageValue] = useState("5000");
  const [usefulLife, setUsefulLife] = useState("5");
  const [method, setMethod] = useState("sl");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cost = parseFloat(assetCost);
    const salvage = parseFloat(salvageValue);
    const life = parseFloat(usefulLife);
    const depreciable = cost - salvage;

    const schedule: { year: number; depreciation: number; bookValue: number }[] = [];

    if (method === "sl") {
      // Straight-Line
      const annualDep = depreciable / life;
      let bookValue = cost;
      for (let y = 1; y <= life; y++) {
        bookValue -= annualDep;
        schedule.push({ year: y, depreciation: annualDep, bookValue: Math.max(bookValue, salvage) });
      }
    } else if (method === "ddb") {
      // Double Declining Balance
      const rate = 2 / life;
      let bookValue = cost;
      for (let y = 1; y <= life; y++) {
        const dep = Math.min(bookValue * rate, bookValue - salvage);
        bookValue -= dep;
        schedule.push({ year: y, depreciation: dep, bookValue: Math.max(bookValue, salvage) });
      }
    } else {
      // Sum of Years Digits
      const sumYears = (life * (life + 1)) / 2;
      let bookValue = cost;
      for (let y = 1; y <= life; y++) {
        const factor = (life - y + 1) / sumYears;
        const dep = depreciable * factor;
        bookValue -= dep;
        schedule.push({ year: y, depreciation: dep, bookValue: Math.max(bookValue, salvage) });
      }
    }

    setResults({ schedule, totalDepreciation: depreciable });
  };

  const reset = () => {
    setShowResults(false); setAssetCost("50000"); setSalvageValue("5000"); setUsefulLife("5"); setMethod("sl"); setResults(null); };

  const faqs = [
    { question: "What is depreciation?", answer: "Depreciation is the systematic allocation of an asset's cost over its useful life. It reflects the wear and tear, obsolescence, or depletion of an asset's value over time." },
    { question: "What is the most common depreciation method?", answer: "Straight-Line depreciation is the most common for financial reporting. It spreads the cost evenly over the asset's useful life. Accelerated methods like Double Declining Balance are often used for tax purposes." },
    { question: "What is MACRS?", answer: "MACRS (Modified Accelerated Cost Recovery System) is the IRS's required depreciation method for US tax purposes. It assigns specific recovery periods and uses a declining balance method switching to straight-line." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Depreciation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Depreciation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
                <InputField id="cost" label="Asset Cost ($)" value={assetCost} onChange={setAssetCost} />
                <InputField id="salvage" label="Salvage Value ($)" value={salvageValue} onChange={setSalvageValue} />
                <InputField id="life" label="Useful Life (Years)" value={usefulLife} onChange={setUsefulLife} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Depreciation Method</label>
                  <select value={method} onChange={e => setMethod(e.target.value)} className="input-calc">
                    <option value="sl">Straight-Line (SL)</option>
                    <option value="ddb">Double Declining Balance (DDB)</option>
                    <option value="syd">Sum of Years Digits (SYD)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><TrendingDown className="h-5 w-5" /> Generate Schedule</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Depreciation Schedule</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold text-muted-foreground">Year</th>
                        <th className="text-right p-3 font-semibold text-muted-foreground">Depreciation</th>
                        <th className="text-right p-3 font-semibold text-muted-foreground">Book Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.schedule.map((row: any) => (
                        <tr key={row.year} className="border-b border-border/50 hover:bg-secondary/5">
                          <td className="p-3 text-foreground font-medium">Year {row.year}</td>
                          <td className="p-3 text-right text-foreground">${row.depreciation.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="p-3 text-right text-muted-foreground">${row.bookValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Choosing a Depreciation Method</h2>
              <p>The method you choose affects your financial statements and tax liability significantly. Each method is appropriate for different assets and goals.</p>
              <h3>Straight-Line: Simplicity and Consistency</h3>
              <p>Straight-Line depreciation charges the same amount each year. It's easy to calculate, provides consistent expense recognition, and is ideal for assets that wear out evenly over time (e.g., furniture, fixtures).</p>
              <h3>Double Declining Balance: Accelerated Depreciation</h3>
              <p>DDB charges twice the straight-line rate applied to the declining book value. This front-loads expenses, reducing taxable income in early years. It is best for assets that lose value quickly (e.g., computers, vehicles).</p>
              <h3>Sum of Years Digits: Middle Ground</h3>
              <p>SYD is also accelerated but less aggressive than DDB. It's calculated by multiplying the depreciable base by a fraction where the numerator is the remaining life and the denominator is the sum of all years.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/depreciation" />
          <PopularCalculators exclude="/calculator/depreciation-calculator" />
        </div>
      </div>
    </>
  );
};
export default DepreciationCalculator;

