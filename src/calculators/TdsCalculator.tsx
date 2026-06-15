"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const TDSCalculator = () => {
  const [incomeType, setIncomeType] = useState<"salary" | "fd" | "rent" | "professional" | "commission">("salary");
  const [amount, setAmount] = useState("500000");
  const [panAvailable, setPanAvailable] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ tdsRate: number; tdsAmount: number; netAmount: number } | null>(null);

  const tdsRates: Record<string, { withPan: number; withoutPan: number; section: string; threshold: number }> = {
    salary: { withPan: 10, withoutPan: 20, section: "192", threshold: 0 },
    fd: { withPan: 10, withoutPan: 20, section: "194A", threshold: 40000 },
    rent: { withPan: 10, withoutPan: 20, section: "194I", threshold: 240000 },
    professional: { withPan: 10, withoutPan: 20, section: "194J", threshold: 30000 },
    commission: { withPan: 5, withoutPan: 20, section: "194H", threshold: 15000 },
  };

  const handleCalculate = () => {
    setShowResults(true);
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return;

    const config = tdsRates[incomeType];
    const rate = panAvailable ? config.withPan : config.withoutPan;

    let taxableAmount = amt;
    if (incomeType !== "salary" && amt <= config.threshold) {
      setResult({ tdsRate: 0, tdsAmount: 0, netAmount: amt });
      return;
    }

    const tds = (taxableAmount * rate) / 100;
    setResult({ tdsRate: rate, tdsAmount: tds, netAmount: amt - tds });
  };

  const reset = () => {
    setShowResults(false); setAmount("500000"); setIncomeType("salary"); setPanAvailable(true); setResult(null); };

  const incomeTypes = [
    { value: "salary", label: "Salary" },
    { value: "fd", label: "Fixed Deposit Interest" },
    { value: "rent", label: "Rent" },
    { value: "professional", label: "Professional Fees" },
    { value: "commission", label: "Commission / Brokerage" },
  ];

  const faqs = [
    { question: "What is TDS?", answer: "TDS (Tax Deducted at Source) is a method of collecting income tax in India where tax is deducted at the time of payment itself. The deductor remits TDS to the government on behalf of the payee." },
    { question: "What happens if TDS is deducted but my income is below taxable limit?", answer: "If your total income is below the taxable limit, you can claim a TDS refund by filing your Income Tax Return (ITR). The excess TDS will be refunded to your bank account." },
    { question: "What is the TDS rate without PAN?", answer: "If PAN is not furnished by the payee, TDS is deducted at 20% or the applicable rate, whichever is higher. This is to discourage tax evasion." },
    { question: "When is TDS not deducted on FD interest?", answer: "TDS on FD interest is not deducted if the total interest income from a bank in a financial year is below ₹40,000 (₹50,000 for senior citizens)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "TDS Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">TDS Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Income Type</label>
                <div className="flex flex-wrap gap-2">
                  {incomeTypes.map((t) => (
                    <button key={t.value} onClick={() => { setIncomeType(t.value as any); setResult(null); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${incomeType === t.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="amount" label="Payment Amount" value={amount} onChange={setAmount} prefix="₹" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">PAN Status</label>
                  <div className="flex gap-2">
                    <button onClick={() => { setPanAvailable(true); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${panAvailable ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>PAN Available</button>
                    <button onClick={() => { setPanAvailable(false); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${!panAvailable ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>No PAN</button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Section {tdsRates[incomeType].section} | Threshold: ₹{tdsRates[incomeType].threshold.toLocaleString("en-IN")} | Rate: {panAvailable ? tdsRates[incomeType].withPan : tdsRates[incomeType].withoutPan}%
              </p>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate TDS</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">TDS Calculation</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "TDS Rate", value: 0, textValue: `${result.tdsRate}%` },
                  { label: "TDS Amount", value: result.tdsAmount, highlight: true },
                  { label: "Net Payment", value: result.netAmount, highlight: true },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is a TDS Calculator?</h2>
              <p>A TDS (Tax Deducted at Source) calculator helps you estimate the tax that will be deducted from various types of payments. TDS is the Indian government's mechanism to collect tax at the point of income generation.</p>

              <h2>Common TDS Rates</h2>
              <ul>
                <li><strong>Salary (Section 192):</strong> Based on applicable income tax slab rates.</li>
                <li><strong>FD Interest (Section 194A):</strong> 10% if above ₹40,000 threshold (₹50,000 for senior citizens).</li>
                <li><strong>Rent (Section 194I):</strong> 10% if annual rent exceeds ₹2,40,000.</li>
                <li><strong>Professional Fees (Section 194J):</strong> 10% if payment exceeds ₹30,000.</li>
                <li><strong>Commission (Section 194H):</strong> 5% if payment exceeds ₹15,000.</li>
              </ul>

              <h2>How to Avoid Excess TDS</h2>
              <ul>
                <li>Submit Form 15G/15H if your total income is below taxable limit.</li>
                <li>Apply for lower TDS certificate (Section 197) if tax liability is lower than standard TDS.</li>
                <li>Always provide PAN to avoid higher TDS rate (20%).</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> TDS rates and thresholds are subject to change. This calculator provides estimates only. Verify with the latest Income Tax rules or consult a CA.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tds-calculator" />
          <PopularCalculators exclude="/tds-calculator" />
        </div>
      </div>
    </>
  );
};

export default TDSCalculator;


