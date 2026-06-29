"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const EBITDACalculator = () => {
  const [mode, setMode] = useState<"income" | "revenue">("revenue");
  // Revenue mode
  const [revenue, setRevenue] = useState("1000000");
  const [cogs, setCogs] = useState("400000");
  const [operatingExpenses, setOperatingExpenses] = useState("200000");
  const [depreciation, setDepreciation] = useState("50000");
  const [amortization, setAmortization] = useState("20000");
  // Income mode
  const [netIncome, setNetIncome] = useState("200000");
  const [interest, setInterest] = useState("30000");
  const [taxes, setTaxes] = useState("60000");
  const [showResults, setShowResults] = useState(false);

  const [result, setResult] = useState<{
    ebitda: number; ebitdaMargin: number; ebit: number; ebitMargin: number; revenue: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const dep = parseFloat(depreciation) || 0;
    const amort = parseFloat(amortization) || 0;

    if (mode === "revenue") {
      const rev = parseFloat(revenue) || 0;
      const cost = parseFloat(cogs) || 0;
      const opex = parseFloat(operatingExpenses) || 0;
      if (rev <= 0) return;

      // OpEx includes D&A, so operating income = revenue - cogs - opex
      // EBITDA = operating income + D&A
      const operatingIncome = rev - cost - opex;
      const ebitda = operatingIncome + dep + amort;
      const ebit = operatingIncome;

      setResult({
        ebitda,
        ebitdaMargin: (ebitda / rev) * 100,
        ebit,
        ebitMargin: (ebit / rev) * 100,
        revenue: rev,
      });
    } else {
      const ni = parseFloat(netIncome) || 0;
      const i = parseFloat(interest) || 0;
      const t = parseFloat(taxes) || 0;

      const ebit = ni + i + t;
      const ebitda = ebit + dep + amort;
      // For margin calculation in income mode, estimate revenue as EBITDA / assumed margin
      // We'll show EBITDA without margin in this mode unless revenue is provided

      setResult({
        ebitda,
        ebitdaMargin: 0,
        ebit,
        ebitMargin: 0,
        revenue: 0,
      });
    }
  };

  const reset = () => {
    setShowResults(false);
    setRevenue("1000000"); setCogs("400000"); setOperatingExpenses("200000");
    setDepreciation("50000"); setAmortization("20000");
    setNetIncome("200000"); setInterest("30000"); setTaxes("60000");
    setResult(null);
  };

  const faqs = [
    { question: "What is EBITDA?", answer: "EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization. It's a measure of a company's operating performance that strips out financing decisions, tax environments, and non-cash accounting charges." },
    { question: "Why is EBITDA important?", answer: "EBITDA allows comparing profitability between companies regardless of their capital structure, tax situation, or accounting methods. It's widely used in business valuations (EV/EBITDA multiples) and by investors." },
    { question: "What is a good EBITDA margin?", answer: "It varies by industry. Software/SaaS: 25-40%. Manufacturing: 10-20%. Retail: 5-10%. Professional services: 15-25%. Higher margins indicate better operational efficiency." },
    { question: "What's the difference between EBITDA and EBIT?", answer: "EBIT (Earnings Before Interest and Taxes) includes depreciation and amortization expenses. EBITDA adds those back. EBITDA is preferred for comparing capital-intensive businesses as it removes the impact of large asset purchases." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "EBITDA Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EBITDA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6 flex gap-2">
                <button onClick={() => { setMode("revenue"); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === "revenue" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>From Revenue</button>
                <button onClick={() => { setMode("income"); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === "income" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>From Net Income</button>
              </div>

              {mode === "revenue" ? (
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <InputField id="revenue" label="Revenue" value={revenue} onChange={setRevenue} prefix="$" />
                  <InputField id="cogs" label="Cost of Goods Sold" value={cogs} onChange={setCogs} prefix="$" />
                  <InputField id="operatingExpenses" label="Operating Expenses" value={operatingExpenses} onChange={setOperatingExpenses} prefix="$" tooltip="Includes salaries, rent, etc. (before adding back D&A)" />
                  <InputField id="depreciation" label="Depreciation" value={depreciation} onChange={setDepreciation} prefix="$" />
                  <InputField id="amortization" label="Amortization" value={amortization} onChange={setAmortization} prefix="$" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <InputField id="netIncome" label="Net Income" value={netIncome} onChange={setNetIncome} prefix="$" />
                  <InputField id="interest" label="Interest Expense" value={interest} onChange={setInterest} prefix="$" />
                  <InputField id="taxes" label="Income Tax" value={taxes} onChange={setTaxes} prefix="$" />
                  <InputField id="depreciation2" label="Depreciation" value={depreciation} onChange={setDepreciation} prefix="$" />
                  <InputField id="amortization2" label="Amortization" value={amortization} onChange={setAmortization} prefix="$" />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">EBITDA Analysis</h2>
                <ResultDisplay items={[
                  { label: "EBITDA", value: result.ebitda, highlight: true },
                  ...(result.ebitdaMargin > 0 ? [{ label: "EBITDA Margin", value: 0, textValue: `${result.ebitdaMargin.toFixed(1)}%` }] : []),
                  { label: "EBIT", value: result.ebit },
                  ...(result.ebitMargin > 0 ? [{ label: "EBIT Margin", value: 0, textValue: `${result.ebitMargin.toFixed(1)}%` }] : []),
                  ...(result.revenue > 0 ? [{ label: "Revenue", value: result.revenue }] : []),
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is EBITDA?</h2>
              <p>EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) is a widely used measure of core profitability. By excluding financing costs, tax rates, and non-cash accounting charges, EBITDA reveals a company's operational performance independent of its capital structure and accounting decisions.</p>

              <h2>EBITDA Formulas</h2>
              <ul>
                <li><strong>From Revenue:</strong> EBITDA = Revenue − COGS − Operating Expenses + Depreciation + Amortization</li>
                <li><strong>From Net Income:</strong> EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization</li>
                <li><strong>EBITDA Margin = EBITDA ÷ Revenue × 100</strong></li>
              </ul>

              <h2>EBITDA in Business Valuation</h2>
              <p>EBITDA is the foundation of the most common valuation metric: <strong>EV/EBITDA</strong> (Enterprise Value to EBITDA). Industry-typical multiples:</p>
              <ul>
                <li><strong>Software/SaaS:</strong> 15-30× EBITDA</li>
                <li><strong>Healthcare:</strong> 12-18× EBITDA</li>
                <li><strong>Manufacturing:</strong> 6-10× EBITDA</li>
                <li><strong>Retail:</strong> 5-8× EBITDA</li>
                <li><strong>Restaurants:</strong> 4-7× EBITDA</li>
              </ul>

              <h2>EBITDA vs Other Metrics</h2>
              <ul>
                <li><strong>EBITDA vs Net Income:</strong> Net income includes all expenses. EBITDA strips out non-operating items for operational comparison.</li>
                <li><strong>EBITDA vs EBIT:</strong> EBIT includes D&A. Use EBITDA for capital-intensive businesses to remove asset depreciation impact.</li>
                <li><strong>EBITDA vs Cash Flow:</strong> EBITDA approximates cash generation but ignores working capital changes and capital expenditures. Free Cash Flow is more accurate.</li>
              </ul>

              <h2>Limitations of EBITDA</h2>
              <ul>
                <li>Ignores capital expenditure needs — a company may need heavy reinvestment</li>
                <li>Can be manipulated through aggressive revenue recognition</li>
                <li>Doesn't reflect working capital requirements</li>
                <li>Not a GAAP metric — definitions may vary between companies</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> EBITDA is a non-GAAP metric and should be used alongside other financial measures. Consult a CPA or financial analyst for comprehensive business valuation.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ebitda-calculator" />
          <PopularCalculators exclude="/ebitda-calculator" />
        </div>
      </div>
    </>
  );
};

export default EBITDACalculator;


