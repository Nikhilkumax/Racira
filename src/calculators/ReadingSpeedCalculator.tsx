"use client";
import { RotateCcw, BookOpen, Timer, Info, Play, Pause } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const ReadingSpeedCalculator = () => {
  const [testText, setTestText] = useState("The quick brown fox jumps over the lazy dog. Reading is the complex cognitive process of decoding symbols to derive meaning. It is a form of language processing. Success in this process is measured as reading comprehension. Reading is a means for language acquisition, communication, and sharing information and ideas. Like all languages, it is a complex interaction between the text and the reader, which is shaped by the reader’s prior knowledge, experiences, attitude, and language community, which is culturally and socially situated.");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState<number | null>(null);
  const [totalWords, setTotalWords] = useState(0);

  const [bookLength, setBookLength] = useState("50000");
  // Standard novel
  const [readingTime, setReadingTime] = useState<any>(null);

  useEffect(() => {
    const words = testText.trim().split(/\s+/).length;
    setTotalWords(words);
  }, [testText]);

  const startTest = () => {
    setStartTime(Date.now());
    setEndTime(null);
    setIsRunning(true);
    setWpm(null);
  };

  const stopTest = () => {
    const end = Date.now();
    setEndTime(end);
    setIsRunning(false);
    
    if (startTime) {
      const minutes = (end - startTime) / 60000;
      const calculatedWpm = totalWords / minutes;
      setWpm(Math.round(calculatedWpm));
    }
  };

  useEffect(() => {
    if (wpm) {
      const totalSeconds = (parseFloat(bookLength) / wpm) * 60;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      setReadingTime({ hours, minutes });
    }
  }, [wpm, bookLength]);

  const reset = () => {
    setStartTime(null);
    setEndTime(null);
    setIsRunning(false);
    setWpm(null);
    setReadingTime(null);
  };

  const faqs = [
    { question: "What is an average reading speed?", answer: "The average adult reads at a speed of 200 to 250 words per minute (WPM). College students often read at 300 WPM, while high-level speed readers can exceed 1,000 WPM with practice." },
    { question: "Does reading speed affect comprehension?", answer: "There is usually a trade-off. As you read faster, you may miss subtle details or complex nuances. Effective readers adjust their speed based on the material—reading slowly for technical documents and faster for light fiction." },
    { question: "How can I improve my reading speed?", answer: "Techniques include 'chunking' (reading groups of words instead of one by one), minimizing 'subvocalization' (saying words in your head), and using a pointer (like your finger) to maintain focus and pace." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Reading Speed Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reading Speed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <Timer className="h-5 w-5 text-primary" /> Speed Test
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Click Start, read the passage below at your normal pace, then click Stop when you finish.</p>
              
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border mb-6 font-serif text-lg leading-relaxed text-foreground select-none relative">
                 {isRunning && <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />}
                 {testText}
              </div>

              <div className="flex gap-4">
                {!isRunning ? (
                  <button onClick={startTest} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                    <Play className="h-5 w-5" /> Start Test
                  </button>
                ) : (
                  <button onClick={stopTest} className="btn-calculate flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
                    <Pause className="h-5 w-5" /> Stop / Finished
                  </button>
                )}
                
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {wpm && (<>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-xl font-bold mb-6">Your Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Reading Speed</p>
                    <p className="text-5xl font-black text-foreground">{wpm} <span className="text-xl font-normal text-muted-foreground">WPM</span></p>
                    <p className="text-xs text-muted-foreground mt-2">
                       {wpm < 200 ? "Below Average" : wpm < 300 ? "Average" : wpm < 450 ? "Above Average" : "Excellent"}
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Comparison</p>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-medium"><span>Average Adult</span><span>200 - 250 WPM</span></div>
                       <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, (wpm / 400) * 100)}%` }} />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                   <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" /> Book Time Estimator
                   </h3>
                   <div className="grid sm:grid-cols-2 gap-6 items-end">
                      <div>
                         <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Total Words in Book</label>
                         <input type="number" value={bookLength} onChange={(e) => setBookLength(e.target.value)} className="input-calc" />
                         <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Info className="h-3 w-3" /> Avg novel is 50,000 - 80,000 words.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                         <p className="text-xs font-bold text-primary uppercase mb-1">Estimated Completion Time</p>
                         <p className="text-2xl font-black">{readingTime?.hours}h {readingTime?.minutes}m</p>
                      </div>
                   </div>
                </div>
              
              </div>
            
</>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Mechanics of Reading</h2>
              <p>Reading is a complex neurological process that involves vision, language, and memory. While we often think of it as a single skill, it's actually a collection of many sub-skills working in harmony.</p>
              
              <h3>Factors That Influence Speed</h3>
              <ul>
                <li><strong>Complexity:</strong> Academic journals or legal contracts are read much slower than a mystery novel.</li>
                <li><strong>Environment:</strong> Distractions and noise can reduce reading speed and comprehension.</li>
                <li><strong>Subject Knowledge:</strong> The more you know about a topic, the faster you can process new information related to it.</li>
                <li><strong>Fatigue:</strong> Eye strain and mental tiredness significantly reduce WPM over long periods.</li>
              </ul>

              <h3>WPM Benchmarks</h3>
              <p><strong>1st - 3rd Grade:</strong> 80 - 120 WPM</p>
              <p><strong>Middle School:</strong> 150 - 200 WPM</p>
              <p><strong>Average Adult:</strong> 200 - 250 WPM</p>
              <p><strong>College Student:</strong> 300 - 400 WPM</p>
              <p><strong>Speed Readers:</strong> 700+ WPM</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reading-speed" />
          <PopularCalculators exclude="/calculator/reading-speed-calculator" />
        </div>
      </div>
    </>
  );
};

export default ReadingSpeedCalculator;


