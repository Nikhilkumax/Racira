"use client";
import { RotateCcw, Zap, Timer, Coffee } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const PomodoroCalculator = () => {
  const [sessionCount, setSessionCount] = useState("4");
  const [workDuration, setWorkDuration] = useState("25");
  const [shortBreak, setShortBreak] = useState("5");
  const [longBreak, setLongBreak] = useState("15");
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState("4");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const sessions = parseInt(sessionCount) || 0;
    const work = parseInt(workDuration) || 0;
    const short = parseInt(shortBreak) || 0;
    const long = parseInt(longBreak) || 0;
    const interval = parseInt(sessionsBeforeLongBreak) || 4;

    if (sessions <= 0) {
      setResults(null);
      return;
    }

    const totalWorkMinutes = sessions * work;
    
    // Calculate breaks
    let totalShortBreaks = 0;
    let totalLongBreaks = 0;

    for (let i = 1; i < sessions; i++) {
      if (i % interval === 0) {
        totalLongBreaks++;
      } else {
        totalShortBreaks++;
      }
    }

    const totalBreakMinutes = (totalShortBreaks * short) + (totalLongBreaks * long);
    const totalTimeMinutes = totalWorkMinutes + totalBreakMinutes;

    setResults({
      totalWorkMinutes,
      totalBreakMinutes,
      totalTimeMinutes,
      hours: Math.floor(totalTimeMinutes / 60),
      mins: totalTimeMinutes % 60,
      shortBreaks: totalShortBreaks,
      longBreaks: totalLongBreaks
    });
  };

  const reset = () => {
    setSessionCount("4"); setWorkDuration("25"); setShortBreak("5"); setLongBreak("15"); setSessionsBeforeLongBreak("4");
  };

  const faqs = [
    { question: "What is the Pomodoro Technique?", answer: "The Pomodoro Technique is a time management method developed by Francesco Cirillo. It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks." },
    { question: "Why is it called Pomodoro?", answer: "It is named after the tomato-shaped kitchen timer ('pomodoro' is Italian for tomato) that Cirillo used as a university student." },
    { question: "How long should a long break be?", answer: "The standard technique recommends a 15-30 minute break after completing four 'pomodoros' (work sessions)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pomodoro Cycle Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pomodoro Cycle Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Timer className="h-5 w-5 text-primary" /> Work Sessions
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Number of Sessions</label>
                    <input type="number" value={sessionCount} onChange={(e) => setSessionCount(e.target.value)} className="input-calc text-2xl font-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Work Duration (Mins)</label>
                    <select value={workDuration} onChange={(e) => setWorkDuration(e.target.value)} className="input-calc">
                      <option value="15">15 Minutes</option>
                      <option value="25">25 Minutes (Standard)</option>
                      <option value="45">45 Minutes</option>
                      <option value="50">50 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Coffee className="h-5 w-5 text-primary" /> Break Settings
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Short Break</label>
                      <input type="number" value={shortBreak} onChange={(e) => setShortBreak(e.target.value)} className="input-calc text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Long Break</label>
                      <input type="number" value={longBreak} onChange={(e) => setLongBreak(e.target.value)} className="input-calc text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Sessions per Long Break</label>
                    <input type="number" value={sessionsBeforeLongBreak} onChange={(e) => setSessionsBeforeLongBreak(e.target.value)} className="input-calc" />
                  </div>
                  <div className="pt-2">
                    <button onClick={reset} className="w-full p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                      <RotateCcw className="h-4 w-4" /> Reset 
                    </button>
                  </div>
                </section>
              </div>
            
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button
                  onClick={reset}
                  className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-10 mb-6 relative overflow-hidden">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Total Time Required</p>
                    <p className="text-7xl font-black text-foreground">
                       {results.hours > 0 ? `${results.hours}h ${results.mins}m` : `${results.mins}m`}
                    </p>
                    <div className="mt-6 flex justify-center gap-8 border-t border-primary/10 pt-6">
                       <div>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase">Work</p>
                         <p className="text-xl font-black text-foreground">{results.totalWorkMinutes}m</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase">Breaks</p>
                         <p className="text-xl font-black text-foreground">{results.totalBreakMinutes}m</p>
                       </div>
                    </div>
                </div>

                <div className="card-calculator">
                  <h2 className="text-2xl font-bold mb-3">
                    <Zap className="h-5 w-5 text-primary" /> Session Summary
                  </h2>
                  <ResultDisplay items={[
                    { label: "Total Pomodoros", value: sessionCount },
                    { label: "Short Break Count", value: results.shortBreaks },
                    { label: "Long Break Count", value: results.longBreaks },
                    { label: "Completion Time", value: new Date(Date.now() + results.totalTimeMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering the Pomodoro Technique</h2>
              <p>The Pomodoro Technique is one of the most effective ways to maintain deep focus while preventing mental burnout. By breaking your day into small, manageable chunks, you can maintain high productivity throughout the entire day.</p>
              
              <h3>The Science of Breaks</h3>
              <p>Your brain is like a muscle—it needs rest to function at its peak. Short 5-minute breaks help "reset" your attention span, while the longer 15-30 minute breaks allow your brain to consolidate the information you've just learned and recover from the intense focus of the work sessions.</p>

              <h3>Customizing Your Flow</h3>
              <p>While the standard 25/5 rhythm works for many, some people prefer longer sessions. For complex tasks like coding or writing, a 50-minute work session followed by a 10-minute break (often called the '50/10' rule) might be more effective to maintain "flow state."</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pomodoro-cycle" />
          <PopularCalculators exclude="/calculator/pomodoro-calculator" />
        </div>
      </div>
    </>
  );
};

export default PomodoroCalculator;

