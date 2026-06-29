"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const IrrCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState("50000");
  const [cashFlows, setCashFlows] = useState("15000, 18000, 20000, 22000, 25000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cf0 = -parseFloat(initialInvestment);
    const cfs = cashFlows.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const allCFs = [cf0, ...cfs];

    // Newton-Raphson IRR
    let irr = 0.1;
    for (let iter = 0; iter < 1000; iter++) {
      let npv = 0, dnpv = 0;
      for (let t = 0; t < allCFs.length; t++) {
        npv += allCFs[t] / Math.pow(1 + irr, t);
        if (t > 0) dnpv -= t * allCFs[t] / Math.pow(1 + irr, t + 1);
      }
      const newIrr = irr - npv / dnpv;
      if (Math.abs(newIrr - irr) < 0.00001) { irr = newIrr; break; }
      irr = newIrr;
    }

    const totalCashIn = cfs.reduce((a, b) => a + b, 0);
    const netProfit = totalCashIn - parseFloat(initialInvestment);
    const npvAt10 = allCFs.reduce((s, c, t) => s + c / Math.pow(1.1, t), 0);

    setResults({ irr: irr * 100, totalCashIn, netProfit, npvAt10, periods: cfs.length });
  };

  const reset = () => {
    setShowResults(false); setInitialInvestment("50000"); setCashFlows("15000, 18000, 20000, 22000, 25000"); setResults(null); };

  const faqs = [
    { question: "What is IRR?", answer: "The Internal Rate of Return (IRR) is the discount rate that makes the Net Present Value (NPV) of all cash flows from an investment equal to zero. It represents the effective annual return on an investment." },
    { question: "How do I use IRR to make decisions?", answer: "Compare the IRR to your 'hurdle rate' (minimum acceptable return). If IRR > hurdle rate, accept the investment. If IRR < hurdle rate, reject it." },
    { question: "What are the limitations of IRR?", answer: "IRR assumes cash flows are reinvested at the IRR itself, which may be unrealistic. It can also produce multiple values for projects with alternating positive and negative cash flows (non-conventional cash flows)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "IRR Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">IRR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="inv" label="Initial Investment ($)" value={initialInvestment} onChange={setInitialInvestment} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Annual Cash Flows (comma-separated)</label>
                  <input className="input-calc w-full" value={cashFlows} onChange={e => setCashFlows(e.target.value)} placeholder="e.g. 15000, 18000, 20000" />
                  <p className="text-xs text-muted-foreground mt-1">Enter each year&apos;s cash inflow, separated by commas</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">IRR Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Internal Rate of Return</p>
                    <p className="text-5xl font-black text-foreground">{results.irr.toFixed(2)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Profit</p>
                    <p className="text-3xl font-black text-foreground">${results.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Cash Inflows", value: 0, textValue: "$" + results.totalCashIn.toLocaleString() },
                  { label: "NPV at 10% Discount", value: 0, textValue: "$" + results.npvAt10.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Investment Periods", value: 0, textValue: results.periods + " years" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding Internal Rate of Return</h2>
              <p>IRR is one of the most widely used metrics in capital budgeting and investment analysis. It tells you the annualized return you can expect from an investment, accounting for the timing and magnitude of all cash flows.</p>
              <h3>IRR vs. NPV</h3>
              <p>Both IRR and NPV are discounted cash flow methods. NPV tells you the dollar value added by an investment at a given discount rate. IRR tells you at what rate the NPV equals zero. For most projects, NPV and IRR will lead to the same accept/reject decision.</p>
              <h3>When to Use IRR</h3>
              <p>IRR is particularly useful for comparing projects of different sizes and durations. It provides a single, intuitive percentage that can be benchmarked against a cost of capital or required rate of return.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/irr" />
          <PopularCalculators exclude="/calculator/irr-calculator" />
        </div>
      </div>
    </>
  );
};
export default IrrCalculator;

