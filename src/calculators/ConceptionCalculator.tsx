"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Heart } from "lucide-react";

const ConceptionCalculator = () => {
  const [dueDate, setDueDate] = useState("");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!dueDate) return;

    const due = new Date(dueDate);
    
    // Conception typically occurs 266 days (38 weeks) before the due date
    const conceptionDate = new Date(due);
    conceptionDate.setDate(due.getDate() - 266);

    // Fertility window is typically 5 days before ovulation up to the day of ovulation
    const windowStart = new Date(conceptionDate);
    windowStart.setDate(conceptionDate.getDate() - 5);
    
    const windowEnd = new Date(conceptionDate);
    windowEnd.setDate(conceptionDate.getDate() + 1); // 24 hours post ovulation

    // Estimated LMP (Last Menstrual Period) is 280 days before due date
    const estLmp = new Date(due);
    estLmp.setDate(due.getDate() - 280);

    setResults({ 
      conceptionDate: conceptionDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      fertileWindow: `${windowStart.toLocaleDateString()} – ${windowEnd.toLocaleDateString()}`,
      estLmp: estLmp.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    });
  };

  const reset = () => {
    setShowResults(false); setDueDate(""); setResults(null); };

  const faqs = [
    { question: "How accurate is a conception date calculator?", answer: "It is an estimate. Because sperm can live in the female reproductive tract for up to 5 days, intercourse any time during the fertile window could lead to conception on the day of ovulation. This calculator finds the exact day of expected ovulation." },
    { question: "Is the conception date the same as the intercourse date?", answer: "Not necessarily. Intercourse could have occurred up to 5 days prior to the estimated conception (ovulation) date, as sperm can survive that long waiting for an egg." },
    { question: "Can an ultrasound determine the exact date of conception?", answer: "An early ultrasound (between 8 and 12 weeks) is the most accurate way to date a pregnancy, but it still provides an estimated age of the fetus, usually within a margin of error of +/- 3 to 5 days." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Conception Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Conception Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Estimated Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-calc w-full sm:w-1/2" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Conception Timeline</h2>
                <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center mb-8">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Likely Date of Conception</p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">{results.conceptionDate}</p>
                </div>
                <ResultDisplay items={[
                  { label: "Likely Fertile Window", value: 0, textValue: results.fertileWindow },
                  { label: "Estimated First Day of Last Period", value: 0, textValue: results.estLmp },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Conception Timing</h2>
              <p>Conception strictly occurs when a sperm fertilizes an egg. However, because sperm can survive in the reproductive tract for up to 5 days, the act that led to conception may have happened days prior to the actual conception date.</p>
              <h3>The 266-Day Rule</h3>
              <p>While pregnancy is considered to be 40 weeks (280 days) long, this includes the two weeks prior to ovulation. The actual gestational age of the fetus—the time from conception to birth—averages 266 days (38 weeks).</p>
              <h3>Determining Paternity</h3>
              <p>Because there is a 5-to-7 day window of fertility where intercourse can lead to pregnancy, and because due dates have a margin of error, calculating conception dates cannot be used to definitively determine paternity if multiple partners were involved during the fertile window. A DNA test is required for certainty.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/conception" />
          <PopularCalculators exclude="/calculator/conception-calculator" />
        </div>
      </div>
    </>
  );
};
export default ConceptionCalculator;

