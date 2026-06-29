"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calendar } from "lucide-react";

const DueDateCalculator = () => {
  const [calcMethod, setCalcMethod] = useState("lmp"); // lmp, conception, ivf, ultrasound
  const [baseDate, setBaseDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [ivfType, setIvfType] = useState("3"); // 3-day or 5-day transfer

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!baseDate) return;

    const base = new Date(baseDate);
    const cycle = parseInt(cycleLength);
    let dueDate = new Date(base);

    if (calcMethod === "lmp") {
      dueDate.setDate(base.getDate() + 280 + (cycle - 28));
    } else if (calcMethod === "conception") {
      // 266 days from conception
      dueDate.setDate(base.getDate() + 266);
    } else if (calcMethod === "ivf") {
      // IVF 3-day transfer: Add 263 days
      // IVF 5-day transfer: Add 261 days
      const daysToAdd = ivfType === "3" ? 263 : 261;
      dueDate.setDate(base.getDate() + daysToAdd);
    } else if (calcMethod === "ultrasound") {
      // If ultrasound date and gestational age were provided, but we'll simplify
      // For this calculator, ultrasound method just asks for the estimated due date from the scan
      dueDate = new Date(base);
    }

    // Ensure valid date
    if (isNaN(dueDate.getTime())) return;

    // Timeline calculation
    const conceptionDate = new Date(dueDate);
    conceptionDate.setDate(dueDate.getDate() - 266);
    
    const secondTrimester = new Date(dueDate);
    secondTrimester.setDate(dueDate.getDate() - 182); // 26 weeks before due date (start of week 14)
    
    const thirdTrimester = new Date(dueDate);
    thirdTrimester.setDate(dueDate.getDate() - 84); // 12 weeks before due date (start of week 28)

    setResults({ 
      dueDate: dueDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      conceptionDate: conceptionDate.toLocaleDateString(),
      secondTrimester: secondTrimester.toLocaleDateString(),
      thirdTrimester: thirdTrimester.toLocaleDateString(),
    });
  };

  const reset = () => {
    setShowResults(false); setBaseDate(""); setCycleLength("28"); setResults(null); };

  const faqs = [
    { question: "Can a due date change?", answer: "Yes. Due dates calculated from your Last Menstrual Period (LMP) are often adjusted after your first early ultrasound, which provides a much more accurate measurement of fetal age." },
    { question: "How is an IVF due date calculated?", answer: "An IVF due date is extremely accurate because the exact date of conception is known. It is calculated by adding 261 days to a 5-day embryo transfer, or 263 days to a 3-day embryo transfer." },
    { question: "What percentage of babies are born on their due date?", answer: "Only about 4-5% of babies arrive exactly on their estimated due date. A due date is better thought of as the middle of a 'due month', spanning from week 38 to week 42." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Due Date Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Due Date Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Calculation Method</label>
                  <select value={calcMethod} onChange={e => { setCalcMethod(e.target.value); setResults(null); }} className="input-calc">
                    <option value="lmp">First Day of Last Period</option>
                    <option value="conception">Exact Conception Date</option>
                    <option value="ivf">IVF Transfer Date</option>
                  </select>
                </div>
                
                {calcMethod === "lmp" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Date of Last Period</label>
                      <input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)} className="input-calc w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Average Cycle Length</label>
                      <input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className="input-calc w-full" />
                    </div>
                  </>
                )}

                {calcMethod === "conception" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Date of Conception</label>
                    <input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)} className="input-calc w-full" />
                  </div>
                )}

                {calcMethod === "ivf" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Date of Embryo Transfer</label>
                      <input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)} className="input-calc w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Embryo Age</label>
                      <select value={ivfType} onChange={e => setIvfType(e.target.value)} className="input-calc">
                        <option value="3">Day 3 Transfer</option>
                        <option value="5">Day 5 Transfer</option>
                      </select>
                    </div>
                  </>
                )}

              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Your Due Date</h2>
                <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center mb-8">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated Arrival</p>
                  <p className="text-3xl sm:text-4xl font-black text-foreground">{results.dueDate}</p>
                </div>
                <ResultDisplay items={[
                  { label: "Estimated Conception", value: 0, textValue: results.conceptionDate },
                  { label: "Start of 2nd Trimester (Week 14)", value: 0, textValue: results.secondTrimester },
                  { label: "Start of 3rd Trimester (Week 28)", value: 0, textValue: results.thirdTrimester },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Multiple Ways to Calculate a Due Date</h2>
              <p>Depending on how your pregnancy occurred and what data you have, different calculation methods yield different levels of accuracy.</p>
              <h3>The LMP Method (Naegele's Rule)</h3>
              <p>This is the standard clinical method. It assumes ovulation occurs exactly on day 14 of a 28-day cycle. If your cycles are longer or shorter than 28 days, this calculator adjusts the date accordingly, providing a more accurate estimate than standard generic wheels used in doctor's offices.</p>
              <h3>Conception and IVF Methods</h3>
              <p>If you tracked ovulation via temperature or hormone strips, or if you underwent IVF, you bypass the cycle-length guesswork entirely. These methods calculate directly from the age of the embryo, making them highly accurate baselines prior to an ultrasound.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/due-date" />
          <PopularCalculators exclude="/calculator/due-date-calculator" />
        </div>
      </div>
    </>
  );
};
export default DueDateCalculator;

