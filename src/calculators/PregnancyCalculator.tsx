"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Baby } from "lucide-react";

const PregnancyCalculator = () => {
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!lmpDate) return;

    const lmp = new Date(lmpDate);
    const cycle = parseInt(cycleLength);

    // Adjusted Naegele's rule based on cycle length
    // Add 280 days, then add/subtract days based on cycle length difference from 28
    const dueDate = new Date(lmp);
    dueDate.setDate(lmp.getDate() + 280 + (cycle - 28));

    // Current progress
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmp.getTime());
    const daysPregnant = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let weeks = Math.floor(daysPregnant / 7);
    let days = daysPregnant % 7;

    // Trimester calculations
    const trimester1End = new Date(lmp);
    trimester1End.setDate(lmp.getDate() + 13 * 7); // Week 13
    
    const trimester2End = new Date(lmp);
    trimester2End.setDate(lmp.getDate() + 27 * 7); // Week 27

    let currentTrimester = "Third Trimester";
    if (weeks < 14) currentTrimester = "First Trimester";
    else if (weeks < 28) currentTrimester = "Second Trimester";

    // Fix future/past logic
    let progressPct = (daysPregnant / 280) * 100;
    if (progressPct > 100) progressPct = 100;
    if (today < lmp) {
      weeks = 0;
      days = 0;
      progressPct = 0;
      currentTrimester = "Not Pregnant Yet";
    }

    setResults({ 
      dueDate: dueDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      weeks,
      days,
      currentTrimester,
      trimester1End: trimester1End.toLocaleDateString(),
      trimester2End: trimester2End.toLocaleDateString(),
      progressPct: progressPct.toFixed(1)
    });
  };

  const reset = () => {
    setShowResults(false); setLmpDate(""); setCycleLength("28"); setResults(null); };

  const faqs = [
    { question: "How is a pregnancy due date calculated?", answer: "The most common method is Naegele's rule, which adds 280 days (40 weeks) to the first day of your last menstrual period (LMP). It assumes a standard 28-day cycle with ovulation occurring on day 14." },
    { question: "Are due dates accurate?", answer: "A due date is merely an estimate. Only about 4% to 5% of babies are actually born on their exact due date. Most babies are born between 38 and 42 weeks of pregnancy." },
    { question: "When does the second trimester begin?", answer: "The second trimester typically begins at week 14 of pregnancy and lasts through week 27. The third trimester begins at week 28 and lasts until birth." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pregnancy Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Pregnancy Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your estimated due date, track your current trimester, and monitor your pregnancy progress.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Day of Last Period (LMP)</label>
                  <input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)} className="input-calc w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Average Cycle Length (Days)</label>
                  <input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className="input-calc w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Baby className="h-5 w-5" /> Calculate Due Date</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Pregnancy Overview</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Due Date</p>
                    <p className="text-2xl sm:text-3xl font-black text-foreground">{results.dueDate}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Progress</p>
                    <p className="text-3xl font-black text-foreground">{results.weeks} Weeks, {results.days} Days</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Pregnancy Progress</span>
                    <span>{results.progressPct}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full transition-all duration-1000" style={{ width: `${results.progressPct}%` }}></div>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Current Stage", value: 0, textValue: results.currentTrimester },
                  { label: "End of 1st Trimester", value: 0, textValue: results.trimester1End },
                  { label: "End of 2nd Trimester", value: 0, textValue: results.trimester2End },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>How Pregnancy Weeks are Counted</h2>
              <p>It can be confusing, but medical professionals count the 40 weeks of pregnancy starting from the first day of your last menstrual period (LMP) — not from the date of conception.</p>
              <h3>Why Use LMP?</h3>
              <p>Because the exact date of ovulation and conception is often difficult or impossible to pinpoint, the LMP provides a reliable, universally understood starting line for tracking a pregnancy.</p>
              <h3>Ultrasound Dating</h3>
              <p>While an LMP calculation is a great starting point, your doctor will likely perform an early ultrasound (usually around 8-12 weeks) to measure the fetus. This crown-rump length measurement is the most accurate way to date a pregnancy and may adjust your final due date.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy" />
            <PopularCalculators exclude="/calculator/pregnancy-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default PregnancyCalculator;

