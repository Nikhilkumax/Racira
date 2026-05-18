"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CalendarDays } from "lucide-react";

const PeriodCalculator = () => {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [periodDuration, setPeriodDuration] = useState("5");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!lastPeriod) return;

    const lmp = new Date(lastPeriod);
    const cycle = parseInt(cycleLength);
    const duration = parseInt(periodDuration);

    const nextPeriods: { start: string, end: string }[] = [];
    let currentLmp = new Date(lmp);

    for (let i = 0; i < 3; i++) {
      const nextStart = new Date(currentLmp);
      nextStart.setDate(currentLmp.getDate() + cycle);
      
      const nextEnd = new Date(nextStart);
      nextEnd.setDate(nextStart.getDate() + duration - 1);

      nextPeriods.push({
        start: nextStart.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        end: nextEnd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
      });

      currentLmp = nextStart;
    }

    setResults({ nextPeriods });
  };

  const reset = () => {
    setShowResults(false); setLastPeriod(""); setCycleLength("28"); setPeriodDuration("5"); setResults(null); };

  const faqs = [
    { question: "What is a normal menstrual cycle length?", answer: "A normal menstrual cycle length can range from 21 to 35 days, with the average being 28 days. The length is counted from the first day of bleeding in one cycle to the first day of bleeding in the next cycle." },
    { question: "How long does a normal period last?", answer: "Normal bleeding lasts anywhere from 2 to 7 days, with most women experiencing 3 to 5 days of bleeding." },
    { question: "Why is my period irregular?", answer: "Irregular cycles can be caused by stress, significant weight changes, intense exercise, PCOS (Polycystic Ovary Syndrome), thyroid issues, or changes in birth control. If irregularity persists, consult a healthcare provider." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Period Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Period Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Forecast your next three menstrual cycles based on your average cycle length and duration.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Day of Last Period</label>
                  <input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} className="input-calc w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Average Cycle Length</label>
                  <input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className="input-calc w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Bleeding Duration (Days)</label>
                  <input type="number" value={periodDuration} onChange={e => setPeriodDuration(e.target.value)} className="input-calc w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><CalendarDays className="h-5 w-5" /> Calculate Future Periods</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Cycle Forecast</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Your Next Period</p>
                    <p className="text-2xl sm:text-3xl font-black text-foreground">{results.nextPeriods[0].start}</p>
                    <p className="text-sm text-muted-foreground mt-1">Through {results.nextPeriods[0].end}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Cycle Length</p>
                    <p className="text-3xl font-black text-foreground">{cycleLength} Days</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Cycle 2 Forecast", value: 0, textValue: `${results.nextPeriods[1].start} – ${results.nextPeriods[1].end}` },
                  { label: "Cycle 3 Forecast", value: 0, textValue: `${results.nextPeriods[2].start} – ${results.nextPeriods[2].end}` },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>The Phases of the Menstrual Cycle</h2>
              <p>Your cycle is divided into four distinct phases, each driven by changing hormone levels that affect mood, energy, and physical symptoms.</p>
              <h3>Menstruation & The Follicular Phase</h3>
              <p>Day 1 of bleeding is Day 1 of your cycle. As bleeding stops, the follicular phase continues, driven by rising estrogen levels. This phase often brings high energy, clear skin, and a positive mood.</p>
              <h3>Ovulation & The Luteal Phase</h3>
              <p>Around the middle of the cycle, an egg is released (ovulation). Immediately after, the luteal phase begins. Progesterone rises, which can lead to PMS symptoms (bloating, fatigue, mood swings) in the days leading up to your next period.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/period" />
            <PopularCalculators exclude="/calculator/period-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default PeriodCalculator;

