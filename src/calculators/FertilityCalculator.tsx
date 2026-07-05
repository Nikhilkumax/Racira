"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Heart } from "lucide-react";

const FertilityCalculator = () => {
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!lmpDate) return;

    const lmp = new Date(lmpDate);
    const cycle = parseInt(cycleLength);

    const nextPeriod = new Date(lmp);
    nextPeriod.setDate(lmp.getDate() + cycle);

    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(nextPeriod.getDate() - 14);

    const windowStart = new Date(ovulationDate);
    windowStart.setDate(ovulationDate.getDate() - 5);

    const windowEnd = new Date(ovulationDate);
    windowEnd.setDate(ovulationDate.getDate() + 1);

    // Provide next 3 months
    const periods = [];
    const windows = [];
    
    let currentLmp = new Date(lmp);
    for (let i = 0; i < 3; i++) {
      const pNext = new Date(currentLmp);
      pNext.setDate(currentLmp.getDate() + cycle);
      
      const pOvul = new Date(pNext);
      pOvul.setDate(pNext.getDate() - 14);
      
      const pStart = new Date(pOvul);
      pStart.setDate(pOvul.getDate() - 5);
      
      const pEnd = new Date(pOvul);
      pEnd.setDate(pOvul.getDate() + 1);

      periods.push(pNext);
      windows.push({ start: pStart, end: pEnd, ovulation: pOvul });
      
      currentLmp = pNext;
    }

    setResults({ 
      currentOvulation: ovulationDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' }),
      currentWindow: `${windowStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${windowEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      windows: windows.map(w => ({
        range: `${w.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} to ${w.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        ovulation: w.ovulation.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }))
    });
  };

  const reset = () => {
    setShowResults(false); setLmpDate(""); setCycleLength("28"); setResults(null); };

  const faqs = [
    { question: "What is the fertile window?", answer: "The fertile window is the 6 days leading up to and including ovulation. Because sperm can survive in the reproductive tract for up to 5 days, intercourse during this time provides the best chance of conception." },
    { question: "When are my chances highest?", answer: "Your chances are highest in the 2 days immediately preceding ovulation, and the day of ovulation itself. This is often referred to as peak fertility." },
    { question: "Can I get pregnant outside the fertile window?", answer: "It is highly unlikely. An egg only survives for 12-24 hours after ovulation. However, because cycle lengths can vary, it is possible to miscalculate the window, leading to unexpected conception." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fertility Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fertility Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Day of Last Period</label>
                  <input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)} className="input-calc w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Average Cycle Length (Days)</label>
                  <input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className="input-calc w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Your Upcoming Fertile Window</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-pink-600 uppercase tracking-widest mb-1">Fertile Window</p>
                    <p className="text-3xl font-black text-foreground">{results.currentWindow}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Ovulation</p>
                    <p className="text-2xl sm:text-3xl font-black text-foreground">{results.currentOvulation}</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-4">Next 3 Months Forecast</h3>
                <ResultDisplay items={[
                  { label: "Cycle 1 Window", value: 0, textValue: results.windows[0].range + " (Ovulation: " + results.windows[0].ovulation + ")" },
                  { label: "Cycle 2 Window", value: 0, textValue: results.windows[1].range + " (Ovulation: " + results.windows[1].ovulation + ")" },
                  { label: "Cycle 3 Window", value: 0, textValue: results.windows[2].range + " (Ovulation: " + results.windows[2].ovulation + ")" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How Fertility Tracking Works</h2>
              <p>For pregnancy to occur, live sperm must be present in the fallopian tubes when an egg is released. Because sperm can live in optimal conditions for up to 5 days, a woman's fertile window is roughly 6 days long: the 5 days before ovulation, plus the day of ovulation.</p>
              <h3>Why Ovulation Day Matters</h3>
              <p>An egg typically survives for only 12 to 24 hours after being released. If intercourse happens after ovulation, the chances of conception drop to near zero for that cycle.</p>
              <h3>Increasing Accuracy</h3>
              <p>Because this calculator relies on standard averages (a 14-day luteal phase), cycles that vary due to stress, travel, or illness may cause the actual window to shift. For higher accuracy, combine these dates with tracking your Basal Body Temperature (BBT) and using Ovulation Predictor Kits (OPKs).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fertility" />
          <PopularCalculators exclude="/calculator/fertility-calculator" />
        </div>
      </div>
    </>
  );
};
export default FertilityCalculator;

