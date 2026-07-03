"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const WorkingCapitalCalculator = () => {
  const [currentAssets, setCurrentAssets] = useState("500000");
  const [cash, setCash] = useState("100000");
  const [receivables, setReceivables] = useState("150000");
  const [inventory, setInventory] = useState("200000");
  const [otherAssets, setOtherAssets] = useState("50000");
  const [currentLiabilities, setCurrentLiabilities] = useState("300000");
  const [payables, setPayables] = useState("120000");
  const [shortTermDebt, setShortTermDebt] = useState("100000");
  const [otherLiabilities, setOtherLiabilities] = useState("80000");
  const [showResults, setShowResults] = useState(false);
  const [mode, setMode] = useState<"simple" | "detailed">("simple");
  const [result, setResult] = useState<{
    workingCapital: number; currentRatio: number; quickRatio: number;
    totalAssets: number; totalLiabilities: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    let assets: number, liabilities: number, quickAssets: number;

    if (mode === "simple") {
      assets = parseFloat(currentAssets) || 0;
      liabilities = parseFloat(currentLiabilities) || 0;
      quickAssets = assets; // simplified
    } else {
      const c = parseFloat(cash) || 0;
      const r = parseFloat(receivables) || 0;
      const inv = parseFloat(inventory) || 0;
      const oa = parseFloat(otherAssets) || 0;
      assets = c + r + inv + oa;

      const p = parseFloat(payables) || 0;
      const std = parseFloat(shortTermDebt) || 0;
      const ol = parseFloat(otherLiabilities) || 0;
      liabilities = p + std + ol;

      quickAssets = c + r; // Quick ratio excludes inventory
    }

    if (liabilities <= 0) return;

    setResult({
      workingCapital: assets - liabilities,
      currentRatio: Math.round((assets / liabilities) * 100) / 100,
      quickRatio: Math.round((quickAssets / liabilities) * 100) / 100,
      totalAssets: assets,
      totalLiabilities: liabilities,
    });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentAssets("500000"); setCurrentLiabilities("300000");
    setCash("100000"); setReceivables("150000"); setInventory("200000"); setOtherAssets("50000");
    setPayables("120000"); setShortTermDebt("100000"); setOtherLiabilities("80000");
    setResult(null);
  };

  const faqs = [
    { question: "What is working capital?", answer: "Working capital is the difference between current assets and current liabilities. It measures a company's short-term financial health and its ability to cover day-to-day operating expenses." },
    { question: "What is a good current ratio?", answer: "A current ratio between 1.5 and 2.0 is generally considered healthy. Below 1.0 means the company may struggle to meet short-term obligations. Above 3.0 may indicate inefficient use of assets." },
    { question: "What is the quick ratio?", answer: "The quick ratio (acid-test ratio) is similar to the current ratio but excludes inventory, as inventory may not be quickly convertible to cash. Quick Ratio = (Cash + Receivables) ÷ Current Liabilities." },
    { question: "Can working capital be negative?", answer: "Yes. Negative working capital means current liabilities exceed current assets. While risky for most businesses, some companies (like Amazon) operate with negative working capital by collecting payment before paying suppliers." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Working Capital Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Working Capital Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6 flex gap-2">
                <button onClick={() => setMode("simple")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === "simple" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Simple</button>
                <button onClick={() => setMode("detailed")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === "detailed" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Detailed</button>
              </div>

              {mode === "simple" ? (
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <InputField id="currentAssets" label="Total Current Assets" value={currentAssets} onChange={setCurrentAssets} prefix="$" />
                  <InputField id="currentLiabilities" label="Total Current Liabilities" value={currentLiabilities} onChange={setCurrentLiabilities} prefix="$" />
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Current Assets</h3>
                  <div className="grid sm:grid-cols-2 gap-5 mb-6">
                    <InputField id="cash" label="Cash & Equivalents" value={cash} onChange={setCash} prefix="$" />
                    <InputField id="receivables" label="Accounts Receivable" value={receivables} onChange={setReceivables} prefix="$" />
                    <InputField id="inventory" label="Inventory" value={inventory} onChange={setInventory} prefix="$" />
                    <InputField id="otherAssets" label="Other Current Assets" value={otherAssets} onChange={setOtherAssets} prefix="$" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Current Liabilities</h3>
                  <div className="grid sm:grid-cols-2 gap-5 mb-6">
                    <InputField id="payables" label="Accounts Payable" value={payables} onChange={setPayables} prefix="$" />
                    <InputField id="shortTermDebt" label="Short-Term Debt" value={shortTermDebt} onChange={setShortTermDebt} prefix="$" />
                    <InputField id="otherLiabilities" label="Other Current Liabilities" value={otherLiabilities} onChange={setOtherLiabilities} prefix="$" />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Working Capital Analysis</h2>
                <ResultDisplay items={[
                  { label: "Working Capital", value: result.workingCapital, highlight: true },
                  { label: "Current Ratio", value: 0, textValue: `${result.currentRatio}:1`, highlight: true },
                  { label: "Quick Ratio", value: 0, textValue: `${result.quickRatio}:1` },
                  { label: "Total Current Assets", value: result.totalAssets },
                  { label: "Total Current Liabilities", value: result.totalLiabilities },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is Working Capital?</h2>
              <p>Working capital is a measure of a company's short-term financial health and operational efficiency. It represents the difference between current assets (cash, receivables, inventory) and current liabilities (payables, short-term debt). Positive working capital means the company can fund its day-to-day operations and invest in growth.</p>

              <h2>Working Capital Formulas</h2>
              <ul>
                <li><strong>Working Capital = Current Assets − Current Liabilities</strong></li>
                <li><strong>Current Ratio = Current Assets ÷ Current Liabilities</strong></li>
                <li><strong>Quick Ratio = (Cash + Receivables) ÷ Current Liabilities</strong></li>
              </ul>

              <h2>Interpreting the Ratios</h2>
              <table className="w-full text-sm mb-4">
                <thead><tr><th className="text-left py-1">Ratio</th><th className="text-left">Value</th><th className="text-left">Meaning</th></tr></thead>
                <tbody>
                  <tr><td>Current Ratio</td><td>&lt; 1.0</td><td>May struggle to pay short-term debts</td></tr>
                  <tr><td>Current Ratio</td><td>1.5–2.0</td><td>Healthy — can comfortably cover obligations</td></tr>
                  <tr><td>Current Ratio</td><td>&gt; 3.0</td><td>May indicate underutilized assets</td></tr>
                  <tr><td>Quick Ratio</td><td>&gt; 1.0</td><td>Can cover liabilities without selling inventory</td></tr>
                </tbody>
              </table>

              <h2>Improving Working Capital</h2>
              <ul>
                <li><strong>Accelerate receivables:</strong> Offer early payment discounts, tighten credit terms</li>
                <li><strong>Optimize inventory:</strong> Reduce excess stock, use just-in-time systems</li>
                <li><strong>Negotiate payables:</strong> Extend payment terms with suppliers</li>
                <li><strong>Reduce unnecessary expenses:</strong> Cut overhead that doesn't generate revenue</li>
                <li><strong>Increase revenue:</strong> Focus on profitable products and customers</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Working capital analysis is one part of financial assessment. Industry norms vary significantly. Consult an accountant for comprehensive financial analysis.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/working-capital-calculator" />
          <PopularCalculators exclude="/working-capital-calculator" />
        </div>
      </div>
    </>
  );
};

export default WorkingCapitalCalculator;


