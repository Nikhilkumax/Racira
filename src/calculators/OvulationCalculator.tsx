"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CalendarHeart } from "lucide-react";

const OvulationCalculator = () => {
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [lutealPhase, setLutealPhase] = useState("14");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!lmpDate) return;

    const lmp = new Date(lmpDate);
    const cycle = parseInt(cycleLength);
    const luteal = parseInt(lutealPhase);

    // Ovulation typically occurs 'luteal phase' days before the next period
    const nextPeriod = new Date(lmp);
    nextPeriod.setDate(lmp.getDate() + cycle);

    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(nextPeriod.getDate() - luteal);

    // Fertile window: 5 days before ovulation + day of ovulation
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 1);

    // Peak fertility: 2 days before + day of ovulation
    const peakStart = new Date(ovulationDate);
    peakStart.setDate(ovulationDate.getDate() - 2);

    setResults({ 
      ovulationDate: ovulationDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      nextPeriodDate: nextPeriod.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      fertileWindow: `${fertileStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${fertileEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      peakFertility: `${peakStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${ovulationDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    });
  };

  const reset = () => {
    setShowResults(false); setLmpDate(""); setCycleLength("28"); setLutealPhase("14"); setResults(null); };

  const faqs = [
    { question: "What is ovulation?", answer: "Ovulation is the release of a mature egg from one of the ovaries. It is the only time during a menstrual cycle when a woman can get pregnant. The egg survives for 12 to 24 hours after release." },
    { question: "When does ovulation occur?", answer: "Ovulation usually occurs about 14 days before your next period begins (this 14-day window is called the luteal phase). If you have a 28-day cycle, you ovulate around day 14. If you have a 32-day cycle, you ovulate around day 18." },
    { question: "What is the fertile window?", answer: "Because sperm can live inside the female reproductive tract for up to 5 days, intercourse in the 5 days leading up to ovulation, or on the day of ovulation itself, can result in pregnancy. This 6-day period is the fertile window." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ovulation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ovulation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Day of Last Period</label>
                  <input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)} className="input-calc w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Average Cycle Length</label>
                  <input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className="input-calc w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Luteal Phase (Days)</label>
                  <input type="number" value={lutealPhase} onChange={e => setLutealPhase(e.target.value)} className="input-calc w-full" title="Usually 14 days for most women. Only change if you track BBT or OPKs and know yours." />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Fertility Forecast</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Ovulation</p>
                    <p className="text-3xl sm:text-4xl font-black text-foreground">{results.ovulationDate}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-pink-600 uppercase tracking-widest mb-1">Peak Fertility</p>
                    <p className="text-2xl font-black text-foreground">{results.peakFertility}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Full Fertile Window (Low to High)", value: 0, textValue: results.fertileWindow },
                  { label: "Expected Next Period", value: 0, textValue: results.nextPeriodDate },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Maximizing Your Chances of Conception</h2>
              <p>Timing intercourse correctly is the most important factor in getting pregnant. The egg only survives for a short window (12-24 hours), so waiting until you ovulate is often too late.</p>
              <h3>The Luteal Phase</h3>
              <p>The time between ovulation and your next period is called the luteal phase. While total cycle length varies wildly among women (from 21 to 35 days), the luteal phase is remarkably consistent, almost always lasting exactly 14 days. This is why ovulation is calculated backwards from your next expected period.</p>
              <h3>Tracking Methods</h3>
              <p>Calculators are based on averages. For absolute precision, combine this calculator's results with physical tracking methods: observing cervical mucus changes, tracking Basal Body Temperature (BBT), or using Ovulation Predictor Kits (OPKs) which detect LH surges in urine.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ovulation" />
          <PopularCalculators exclude="/calculator/ovulation-calculator" />
        </div>
      </div>
    </>
  );
};
export default OvulationCalculator;

