"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Coins } from "lucide-react";

const AnnuityCalculator = () => {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("20");
  const [type, setType] = useState("pv"); // pv or fv

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;

    if (p <= 0 || r <= 0 || n <= 0) return;

    // Monthly payment from PV (annuity immediate)
    const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - p;

    // FV of annuity (how much do regular payments grow to?)
    const monthlyDeposit = parseFloat(principal) / n; // reuse principal as monthly deposit
    const fvAnnuity = monthlyDeposit * ((Math.pow(1 + r, n) - 1) / r);

    setResults({ monthlyPayment, totalPaid, totalInterest, fvAnnuity, monthlyDeposit });
  };

  const reset = () => {
    setShowResults(false); setPrincipal("100000"); setRate("5"); setYears("20"); setType("pv"); setResults(null); };

  const faqs = [
    { question: "What is an annuity?", answer: "An annuity is a financial contract that provides a series of regular payments. They can be used to receive income from a lump sum (immediate annuity) or to accumulate savings through regular deposits (deferred annuity)." },
    { question: "What is the difference between an ordinary annuity and annuity due?", answer: "An ordinary annuity makes payments at the end of each period (most common). An annuity due makes payments at the beginning of each period, resulting in slightly higher total value." },
    { question: "Are annuity payments taxable?", answer: "For non-qualified annuities, the earnings portion of each payment is taxable as ordinary income. For qualified annuities (funded with pre-tax dollars), the entire payment is typically taxable." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Annuity Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Annuity Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate monthly annuity payouts from a lump sum or project the future value of regular deposits.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="princ" label="Principal / Lump Sum ($)" value={principal} onChange={setPrincipal} />
                <InputField id="rate" label="Annual Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="yrs" label="Period (Years)" value={years} onChange={setYears} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Coins className="h-5 w-5" /> Calculate Annuity</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Annuity Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Payout (from Lump Sum)</p>
                    <p className="text-5xl font-black text-foreground">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Received</p>
                    <p className="text-3xl font-black text-foreground">${results.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Interest Earned", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Annuity Period", value: 0, textValue: years + " years (" + parseFloat(years) * 12 + " payments)" },
                  { label: "Effective Monthly Yield", value: 0, textValue: (parseFloat(rate) / 12).toFixed(3) + "%" },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>How Annuities Work</h2>
              <p>An annuity converts a lump sum of money into a reliable income stream. Insurance companies use sophisticated mortality tables to calculate payouts, ensuring the income can last for your entire lifetime.</p>
              <h3>Immediate vs. Deferred Annuities</h3>
              <p>An <strong>immediate annuity</strong> begins paying out almost immediately after purchase. A <strong>deferred annuity</strong> accumulates value over time before converting to an income stream, typically used for retirement savings.</p>
              <h3>Fixed vs. Variable Annuities</h3>
              <p>Fixed annuities offer a guaranteed payout rate. Variable annuities tie payouts to investment performance, offering more growth potential but also more risk.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annuity" />
            <PopularCalculators exclude="/calculator/annuity-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default AnnuityCalculator;

