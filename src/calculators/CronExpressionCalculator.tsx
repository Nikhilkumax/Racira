"use client";
import { Clock, Check, Copy } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
// Helper to convert simple cron to readable text (basic implementation)
const getReadableCron = (min: string, hr: string, dom: string, mon: string, dow: string) => {
  if (min === "*" && hr === "*" && dom === "*" && mon === "*" && dow === "*") return "Every minute.";
  
  let desc = "";
  if (min !== "*") desc += `At minute ${min}. `;
  if (min === "0" && hr !== "*") desc = `At hour ${hr}. `;
  else if (hr !== "*") desc += `At hour ${hr}. `;
  
  if (dom !== "*") desc += `On day ${dom} of the month. `;
  if (mon !== "*") desc += `In month ${mon}. `;
  if (dow !== "*") {
     const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
     if (!isNaN(parseInt(dow))) desc += `On ${days[parseInt(dow) % 7]}. `;
     else desc += `On ${dow}. `;
  }
  
  if (!desc) return "Every minute.";
  return desc.trim();
};

const CronExpressionCalculator = () => {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  const [expression, setExpression] = useState("* * * * *");
  const [readable, setReadable] = useState("Every minute.");
  const [copied, setCopied] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setExpression(expr);
    setReadable(getReadableCron(minute, hour, dayOfMonth, month, dayOfWeek));
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preset = (m: string, h: string, dom: string, mon: string, dow: string) => {
    setMinute(m); setHour(h); setDayOfMonth(dom); setMonth(mon); setDayOfWeek(dow);
  };

  const faqs = [
    { question: "What is a cron expression?", answer: "A cron expression is a string consisting of five or six fields separated by white space that represents a set of times, normally as a schedule to execute a routine in Unix-like operating systems." },
    { question: "What do the five fields mean?", answer: "From left to right: Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6, where 0 is Sunday)." },
    { question: "What does the asterisk (*) mean?", answer: "The asterisk indicates that the cron expression matches for all values of the field. E.g., using an asterisk in the 4th field (Month) means the task will run in every month." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cron Expression Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cron Expression Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Minute</label>
                <input type="text" value={minute} onChange={(e) => setMinute(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                <p className="text-[10px] text-center mt-1 text-muted-foreground">0-59, *, */n</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Hour</label>
                <input type="text" value={hour} onChange={(e) => setHour(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                <p className="text-[10px] text-center mt-1 text-muted-foreground">0-23, *, */n</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Day (Mo)</label>
                <input type="text" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                <p className="text-[10px] text-center mt-1 text-muted-foreground">1-31, *</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Month</label>
                <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                <p className="text-[10px] text-center mt-1 text-muted-foreground">1-12, *</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Day (We)</label>
                <input type="text" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                <p className="text-[10px] text-center mt-1 text-muted-foreground">0-6, *</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Common Presets
              </h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => preset("*", "*", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Minute</button>
                <button onClick={() => preset("0", "*", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Hour</button>
                <button onClick={() => preset("0", "0", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Daily Midnight</button>
                <button onClick={() => preset("0", "12", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Daily Noon</button>
                <button onClick={() => preset("0", "0", "*", "*", "1")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Monday</button>
                <button onClick={() => preset("0", "0", "1", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">1st of Month</button>
              </div>
            </div>
          </div>

          {/* Live Expression Display */}
          <div className="flex flex-col gap-3">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Cron Expression</p>
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="text-5xl sm:text-6xl font-mono font-black text-foreground tracking-widest">{expression}</div>
                <button onClick={copyToClipboard} className="p-3 bg-primary/10 rounded-xl hover:bg-primary/20 text-primary transition-colors">
                  {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                </button>
              </div>
              <p className="text-lg font-medium text-muted-foreground">"{readable}"</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What is Cron?</h2>
            <p>Cron is a time-based job scheduler in Unix-like computer operating systems. Users who set up and maintain software environments use cron to schedule jobs (commands or shell scripts) to run periodically at fixed times, dates, or intervals.</p>
            <h3>Special Characters</h3>
            <ul>
              <li><strong>* (Asterisk)</strong>: Matches all values for the field.</li>
              <li><strong>, (Comma)</strong>: Separates multiple values, e.g. `1,5,10`.</li>
              <li><strong>- (Hyphen)</strong>: Defines a range, e.g. `1-5` for Mon–Fri.</li>
              <li><strong>/ (Slash)</strong>: Specifies step values, e.g. `*/5` every 5 minutes.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cron-expression" />
          <PopularCalculators exclude="/calculator/cron-expression-calculator" />
        </div>
      </div>
    </>
  );
};

export default CronExpressionCalculator;

