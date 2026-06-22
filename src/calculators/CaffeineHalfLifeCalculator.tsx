"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface HalfLifeResult {
  initialDose: number;
  halfLifeHours: number;
  timeToClear: number; // hours until < 5mg
  remainingAtBedtime: number;
  chartData: { hourStr: string; amount: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcCaffeineHalfLife(
  doseMg: number, timeStr: string, bedTimeStr: string,
  sensitivity: string, isPregnant: boolean, usesNicotine: boolean, usesOralContraceptives: boolean
): HalfLifeResult {
  // Parse times
  const intakeDate = new Date(`1970-01-01T${timeStr}:00`);
  let bedDate = new Date(`1970-01-01T${bedTimeStr}:00`);
  
  // If bedtime is earlier in the day than intake, assume bedtime is the next day
  if (bedDate <= intakeDate) {
    bedDate = new Date(`1970-01-02T${bedTimeStr}:00`);
  }

  // Base half-life for average healthy adult is ~5 hours
  let halfLifeHours = 5;

  // Genetic / Phenotypic metabolism
  if (sensitivity === "high") halfLifeHours = 8; // Slow metabolizer (CYP1A2)
  else if (sensitivity === "low") halfLifeHours = 3.5; // Fast metabolizer

  // Medical / Lifestyle Modifiers (These affect liver enzyme CYP1A2)
  if (isPregnant) {
    // Pregnancy severely inhibits caffeine metabolism, especially in 2nd/3rd trimester.
    // Half-life can extend up to 11-15 hours. We'll use 11 as a standard pregnant modifier.
    halfLifeHours = 11; 
  } else if (usesOralContraceptives) {
    // Birth control pills double the half-life of caffeine
    halfLifeHours *= 1.8;
  }
  
  if (usesNicotine) {
    // Smoking / Nicotine induces CYP1A2, cutting caffeine half-life nearly in half
    halfLifeHours *= 0.6;
  }

  halfLifeHours = Math.max(2, Math.min(halfLifeHours, 15)); // Safeguard bounds

  // Calculate exponential decay: N(t) = N0 * (0.5)^(t / t_half)
  // We'll generate data for the next 24 hours
  const chartData = [];
  let remainingAtBedtime = 0;
  let timeToClear = 0; // Hours until less than 5mg (clinically insignificant for most)
  let foundClearTime = false;

  const hoursToSimulate = 24;

  for (let h = 0; h <= hoursToSimulate; h++) {
    const currentSimDate = new Date(intakeDate.getTime() + h * 60 * 60 * 1000);
    const amount = doseMg * Math.pow(0.5, h / halfLifeHours);
    
    // Format hour for chart X axis
    const hr = currentSimDate.getHours();
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    const hourStr = `${hr12}${ampm}`;

    chartData.push({ hourStr, amount: Number(amount.toFixed(1)) });

    if (!foundClearTime && amount < 5) {
      timeToClear = h;
      foundClearTime = true;
    }

    // Check if this sim hour matches bedtime hour roughly
    if (h === Math.round((bedDate.getTime() - intakeDate.getTime()) / 3600000)) {
      remainingAtBedtime = Number(amount.toFixed(1));
    }
  }

  if (!foundClearTime) timeToClear = 24; // > 24 hours

  const summaryStats = [
    { label: "Your Half-Life", value: `${halfLifeHours.toFixed(1)} hrs` },
    { label: "Clearance Time (<5mg)", value: `~${timeToClear} hrs` },
    { label: "Bedtime Residue", value: `${remainingAtBedtime} mg` },
    { label: "Status", value: remainingAtBedtime > 30 ? "Sleep Disruption Likely" : "Sleep Safe" },
  ];

  return { initialDose: doseMg, halfLifeHours, timeToClear, remainingAtBedtime, chartData, summaryStats };
}

export default function CaffeineHalfLifeCalculator() {
  const [dose, setDose] = useState("160"); // Monster energy drink
  const [intakeTime, setIntakeTime] = useState("15:00"); // 3:00 PM
  const [bedTime, setBedTime] = useState("22:30"); // 10:30 PM
  
  const [sensitivity, setSensitivity] = useState("normal");
  const [isPregnant, setIsPregnant] = useState(false);
  const [usesNicotine, setUsesNicotine] = useState(false);
  const [usesBc, setUsesBc] = useState(false);

  const [result, setResult] = useState<HalfLifeResult | null>(null);

  const calculate = () => {
    setResult(calcCaffeineHalfLife(
      parseInt(dose) || 0, intakeTime, bedTime,
      sensitivity, isPregnant, usesNicotine, usesBc
    ));
  };

  useEffect(() => { setResult(calcCaffeineHalfLife(160, "15:00", "22:30", "normal", false, false, false)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What does 'Half-Life' mean for caffeine?", answer: "The half-life of a drug is the time it takes for the concentration of that drug in your bloodstream to reduce by exactly 50%. For caffeine, the average half-life is about 5 hours. This means if you drink 200mg at 12:00 PM, you will have 100mg left at 5:00 PM, 50mg left at 10:00 PM, and 25mg left at 3:00 AM." },
    { question: "Why does caffeine disrupt sleep even if I can fall asleep?", answer: "Many people claim they can drink espresso after dinner and 'fall right asleep.' However, caffeine is an adenosine-receptor antagonist. While you may lose consciousness, the residual caffeine circulating in your brain prevents you from entering Stage 3 and Stage 4 deep, restorative sleep. You wake up feeling exhausted despite getting 8 hours of 'sleep.'" },
    { question: "Why do smokers process caffeine faster?", answer: "Nicotine and the hydrocarbons in cigarette smoke strongly induce (speed up) the CYP1A2 enzyme in the liver, which is responsible for clearing caffeine. Smokers metabolize caffeine nearly twice as fast as non-smokers. Interestingly, when a smoker quits, their caffeine tolerance plummets because their liver stops clearing it so rapidly, often leading to severe jitters." },
    { question: "How does birth control affect caffeine?", answer: "Oral contraceptives (birth control pills) have the opposite effect of nicotine—they inhibit the CYP1A2 enzyme. Women taking oral contraceptives often see their caffeine half-life double from 5 hours to 10 hours. A morning cup of coffee stays in their system nearly all day." },
    { question: "At what level does caffeine stop affecting sleep?", answer: "Sleep specialists generally recommend having less than 30-50mg of active caffeine in your system at bedtime. Given a standard 5-hour half-life, this usually means implementing a 'caffeine curfew' and stopping all consumption by 2:00 PM to protect nighttime sleep architecture." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Caffeine Half-Life Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Caffeine Half-Life Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Caffeine Dose</label>
              <div className={inp}><input type="number" value={dose} onChange={e => setDose(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mg</span></div>
              <p className="text-xs text-muted-foreground mt-1.5">Standard Cup of Coffee = 95mg. Energy Drink = 160mg.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Time Consumed</label>
                <div className={inp}><input type="time" value={intakeTime} onChange={e => setIntakeTime(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Your Bedtime</label>
                <div className={inp}><input type="time" value={bedTime} onChange={e => setBedTime(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Genetic & Lifestyle Modifiers</p>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Genetic Sensitivity</label>
                <select value={sensitivity} onChange={e => setSensitivity(e.target.value)} className={`${inp} w-full px-3 text-sm mb-4`}>
                  <option value="normal">Normal / Average (~5 hr half-life)</option>
                  <option value="high">Slow Metabolizer / Jittery (~8 hr half-life)</option>
                  <option value="low">Fast Metabolizer / High Tolerance (~3.5 hr half-life)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-border rounded-md bg-secondary/30 cursor-pointer">
                  <input type="checkbox" checked={usesNicotine} onChange={e => setUsesNicotine(e.target.checked)} className="w-5 h-5 rounded border-input text-primary" />
                  <div>
                    <span className="block font-semibold">I smoke or use Nicotine</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">Nicotine dramatically speeds up caffeine clearance.</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-border rounded-md bg-secondary/30 cursor-pointer">
                  <input type="checkbox" checked={usesBc} onChange={e => setUsesBc(e.target.checked)} className="w-5 h-5 rounded border-input text-primary" disabled={isPregnant} />
                  <div className={isPregnant ? "opacity-50" : ""}>
                    <span className="block font-semibold">I take Oral Contraceptives (The Pill)</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">Birth control slows caffeine clearance.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-border rounded-md bg-secondary/30 cursor-pointer">
                  <input type="checkbox" checked={isPregnant} onChange={e => setIsPregnant(e.target.checked)} className="w-5 h-5 rounded border-input text-primary" disabled={usesBc} />
                  <div className={usesBc ? "opacity-50" : ""}>
                    <span className="block font-semibold">I am Pregnant</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">Pregnancy severely delays caffeine clearance.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Clearance
              </button>
              <button onClick={() => { setDose("160"); setIntakeTime("15:00"); setBedTime("22:30"); setSensitivity("normal"); setIsPregnant(false); setUsesNicotine(false); setUsesBc(false); setResult(calcCaffeineHalfLife(160, "15:00", "22:30", "normal", false, false, false)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.remainingAtBedtime > 30 ? "bg-amber-500/10 border-amber-500" : "bg-primary/10 border-primary"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.remainingAtBedtime > 30 ? "text-amber-600" : "text-primary"}`}>Remaining at Bedtime</div>
                <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.remainingAtBedtime} <span className="text-xl font-normal text-muted-foreground">mg</span></div>
                <div className="text-base text-muted-foreground mt-2 font-medium">
                  {result.remainingAtBedtime > 30 
                    ? "This level of active caffeine will strongly inhibit restorative deep sleep architecture." 
                    : "This level is low enough that sleep should not be significantly disrupted."}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm font-bold text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Caffeine Exponential Decay Curve (24 Hours)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="hourStr" tick={{ fontSize: 11 }} interval={3} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: any) => [`${v} mg`, 'Active Caffeine']} />
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                    <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Sleep Threshold (~30mg)', fill: '#ef4444', fontSize: 10 }} />
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Caffeine Metabolism</h2>
            <p>This <strong>Caffeine Half-Life Calculator</strong> visualizes exactly how long your afternoon coffee stays in your bloodstream. Caffeine is processed by the liver using the CYP1A2 enzyme. Because of genetic and lifestyle variations, the "half-life" (the time it takes your body to eliminate 50% of the drug) can vary wildly from person to person.</p>
            <h2>The Invisible Sleep Thief</h2>
            <p>If you consume a large 160mg energy drink at 3:00 PM, and you have an average 5-hour half-life, you will still have 80mg in your system at 8:00 PM, and nearly 40mg circulating in your brain at midnight. Caffeine works by blocking adenosine receptors in the brain. Even if you fall asleep, that 40mg of active caffeine will prevent your brain from entering Stage 3 and 4 deep sleep. You will spend the night in lighter sleep stages and wake up feeling exhausted, leading you to reach for more caffeine the next morning.</p>
            <h2>Surprising Modifiers (The Pill and Smoking)</h2>
            <p>Most people don't realize how much outside factors influence their caffeine tolerance. Women taking oral contraceptives (birth control pills) experience inhibited CYP1A2 function, causing caffeine to stay in their system nearly twice as long. Conversely, smokers metabolize caffeine incredibly fast. This is why smokers often drink large amounts of coffee without getting the jitters—their liver is clearing the stimulant much faster than a non-smoker. Related tools: <a href="/calculator/caffeine-calculator">Caffeine Intake Calculator</a>, <a href="/calculator/sleep-calculator">Sleep Cycle Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/caffeine-half-life-calculator" />
          <PopularCalculators exclude="/calculator/caffeine-half-life-calculator" />
        </div>
      </div>
    </>
  );
}
