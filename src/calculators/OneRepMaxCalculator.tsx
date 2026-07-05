"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Dumbbell } from "lucide-react";

const OneRepMaxCalculator = () => {
  const [weight, setWeight] = useState("225");
  const [reps, setReps] = useState("5");
  const [unit, setUnit] = useState("lbs");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const r = parseInt(reps);

    if (w <= 0 || r <= 0) return;

    // Formulas
    const epley = w * (1 + (r / 30));
    const brzycki = w * (36 / (37 - r));
    const lombardi = w * Math.pow(r, 0.10);
    const oconner = w * (1 + 0.025 * r);
    
    // Average
    const avgOrm = (epley + brzycki + lombardi + oconner) / 4;

    // Percentages of 1RM
    const percentages = [
      { pct: 95, reps: 2, weight: avgOrm * 0.95 },
      { pct: 90, reps: 3, weight: avgOrm * 0.90 },
      { pct: 85, reps: 5, weight: avgOrm * 0.85 },
      { pct: 80, reps: 8, weight: avgOrm * 0.80 },
      { pct: 75, reps: 10, weight: avgOrm * 0.75 },
      { pct: 70, reps: 12, weight: avgOrm * 0.70 },
      { pct: 60, reps: 15, weight: avgOrm * 0.60 }
    ];

    setResults({ 
      orm: Math.round(avgOrm),
      epley: Math.round(epley),
      brzycki: Math.round(brzycki),
      percentages
    });
  };

  const reset = () => {
    setShowResults(false); setWeight("225"); setReps("5"); setUnit("lbs"); setResults(null); };

  const faqs = [
    { question: "What is a 1RM?", answer: "Your One-Repetition Maximum (1RM) is the maximum amount of weight you can lift for a single repetition of a given exercise with proper form." },
    { question: "Why calculate it instead of testing it?", answer: "Testing your true 1RM is incredibly physically taxing and carries a high risk of injury, especially for beginners. Calculating it from a 3-5 rep max is much safer and still provides an accurate number for programming your workouts." },
    { question: "Which formula is most accurate?", answer: "No formula is perfect for everyone. The Epley formula is generally considered the most robust for high reps, while Brzycki is very accurate for low reps (under 10). This calculator averages several validated formulas to give you the most accurate baseline." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "One Rep Max Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">One Rep Max Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="wt" label={`Weight Lifted (${unit})`} value={weight} onChange={setWeight} />
                <InputField id="reps" label="Repetitions Completed" value={reps} onChange={setReps} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="input-calc">
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Estimated Max Strength</h2>
                <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center mb-8">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated 1RM</p>
                  <p className="text-5xl font-black text-foreground">{results.orm} {unit}</p>
                </div>
                
                <h3 className="text-lg font-bold mb-4">Training Percentages</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {results.percentages.map((p: any) => (
                    <div key={p.pct} className="flex justify-between items-center p-3 rounded-xl border border-border bg-card">
                      <span className="font-semibold">{p.pct}% (Est. {p.reps} reps)</span>
                      <span className="font-bold text-primary">{Math.round(p.weight)} {unit}</span>
                    </div>
                  ))}
                </div>

                <ResultDisplay items={[
                  { label: "Epley Formula", value: 0, textValue: `${results.epley} ${unit}` },
                  { label: "Brzycki Formula", value: 0, textValue: `${results.brzycki} ${unit}` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Using Your 1RM for Training</h2>
              <p>Almost all professional strength and hypertrophy programs base your daily working weights on a percentage of your One Rep Max. Instead of guessing how much weight to put on the bar, you use precise percentages to target different physiological adaptations.</p>
              <h3>Training Zones</h3>
              <ul>
                <li><strong>Strength (85-100%):</strong> 1-5 reps. Builds dense myofibrillar muscle and maximizes central nervous system efficiency.</li>
                <li><strong>Hypertrophy (70-85%):</strong> 6-12 reps. The optimal range for building muscle size (sarcoplasmic hypertrophy).</li>
                <li><strong>Endurance (50-70%):</strong> 12-20+ reps. Increases muscular endurance and lactic acid tolerance.</li>
              </ul>
              <h3>When Calculations Fail</h3>
              <p>The higher the reps you input, the less accurate the formula becomes. A 1RM estimated from a 3-rep lift will be extremely accurate. A 1RM estimated from a 20-rep lift will likely heavily overestimate your true strength.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/one-rep-max" />
          <PopularCalculators exclude="/calculator/one-rep-max-calculator" />
        </div>
      </div>
    </>
  );
};
export default OneRepMaxCalculator;

