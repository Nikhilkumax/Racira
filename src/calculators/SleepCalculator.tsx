"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Moon } from "lucide-react";

const SleepCalculator = () => {
  const [mode, setMode] = useState("wake"); // wake, sleep
  const [time, setTime] = useState("07:00");
  const [sleepLatency, setSleepLatency] = useState("15"); // minutes to fall asleep

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (!time) return;

    // Parse input time
    const [hours, minutes] = time.split(":").map(Number);
    const baseDate = new Date();
    baseDate.setHours(hours, minutes, 0, 0);

    const latency = parseInt(sleepLatency);
    const cycleLengthMs = 90 * 60 * 1000; // 90 minutes in ms

    const suggestions = [];

    if (mode === "wake") {
      // I want to wake up at `time`. When should I go to sleep?
      // We subtract cycles, then subtract latency
      for (let i = 6; i >= 3; i--) { // 6 to 3 cycles (9 hrs to 4.5 hrs)
        const sleepTime = new Date(baseDate.getTime() - (i * cycleLengthMs) - (latency * 60 * 1000));
        suggestions.push({
          time: sleepTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          cycles: i,
          duration: `${(i * 90) / 60} Hours`
        });
      }
    } else {
      // I am going to sleep at `time`. When should I wake up?
      // We add latency, then add cycles
      const actualSleepTime = new Date(baseDate.getTime() + (latency * 60 * 1000));
      for (let i = 3; i <= 6; i++) {
        const wakeTime = new Date(actualSleepTime.getTime() + (i * cycleLengthMs));
        suggestions.push({
          time: wakeTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          cycles: i,
          duration: `${(i * 90) / 60} Hours`
        });
      }
    }

    setResults({ suggestions });
  };

  const reset = () => {
    setShowResults(false); setMode("wake"); setTime("07:00"); setSleepLatency("15"); setResults(null); };

  const faqs = [
    { question: "What is a sleep cycle?", answer: "A sleep cycle consists of several stages: light sleep, deep sleep, and REM (Rapid Eye Movement) sleep. On average, a full cycle takes about 90 minutes to complete. A typical night's sleep consists of 4 to 6 of these cycles." },
    { question: "Why do I feel groggy even after 8 hours of sleep?", answer: "This is known as sleep inertia. It often happens if your alarm wakes you up in the middle of deep sleep (Stage 3). Waking up at the end of a 90-minute cycle, even if you slept slightly less, usually results in feeling more refreshed." },
    { question: "How long does it take to fall asleep?", answer: "The average adult takes 15 to 20 minutes to fall asleep (sleep latency). If you fall asleep the moment your head hits the pillow, you are likely sleep-deprived. If it regularly takes you over an hour, you may have insomnia." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sleep Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sleep Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">What are you trying to figure out?</label>
                <select value={mode} onChange={e => { setMode(e.target.value); setResults(null); }} className="input-calc w-full sm:w-1/2">
                  <option value="wake">I want to wake up at...</option>
                  <option value="sleep">I am going to sleep at...</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{mode === 'wake' ? 'Target Wake Time' : 'Time Going to Bed'}</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-calc w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Minutes to Fall Asleep</label>
                  <select value={sleepLatency} onChange={e => setSleepLatency(e.target.value)} className="input-calc">
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes (Average)</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
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
                <h2 className="text-2xl font-bold mb-3">{mode === 'wake' ? 'Suggested Bedtimes' : 'Suggested Wake Times'}</h2>
                <p className="text-muted-foreground mb-6">These times factor in the {sleepLatency} minutes it takes you to fall asleep, aiming to wake you up between 90-minute sleep cycles.</p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {results.suggestions.map((s: any, index: number) => {
                    const isOptimal = s.cycles === 5 || s.cycles === 6; // 7.5 to 9 hours
                    return (
                      <div key={index} className={`p-4 rounded-xl border ${isOptimal ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className={`text-2xl font-black ${isOptimal ? 'text-primary' : 'text-foreground'}`}>{s.time}</p>
                          {isOptimal && <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">Optimal</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{s.cycles} Cycles • {s.duration} of Sleep</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Science of Sleep Cycles</h2>
              <p>Sleep is not a uniform state. Throughout the night, your brain cycles through different stages of activity. Waking up during deep sleep (Stage 3) leads to grogginess and disorientation, whereas waking up at the end of a cycle (during light sleep or REM) leaves you feeling alert.</p>
              <h3>How Long Should You Sleep?</h3>
              <p>Most adults need 5 or 6 full sleep cycles per night, which equates to 7.5 to 9 hours of actual sleep. However, individual needs vary based on genetics, daily physical exertion, and age.</p>
              <h3>Improving Sleep Hygiene</h3>
              <p>Calculators help with timing, but quality matters just as much. To improve your sleep architecture, maintain a cool bedroom temperature (around 65°F), avoid blue light from screens an hour before bed, and try to go to sleep at the exact same time every night.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sleep" />
          <PopularCalculators exclude="/calculator/sleep-calculator" />
        </div>
      </div>
    </>
  );
};
export default SleepCalculator;

