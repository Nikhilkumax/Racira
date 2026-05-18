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
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Cron Expression Generator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Build, decode, and generate cron schedule expressions for server tasks and CI/CD pipelines.</p>

            <div className="card-calculator mb-8">
               <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Cron Expression</p>
                  <div className="flex justify-center items-center gap-4 mb-4">
                     <div className="text-5xl sm:text-6xl font-mono font-black text-foreground tracking-widest">{expression}</div>
                     <button onClick={copyToClipboard} className="p-3 bg-primary/10 rounded-xl hover:bg-primary/20 text-primary transition-colors">
                        {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                     </button>
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">"{readable}"</p>
               </div>

              <div className="grid sm:grid-cols-5 gap-4 mb-8">
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
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Day (Month)</label>
                  <input type="text" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                  <p className="text-[10px] text-center mt-1 text-muted-foreground">1-31, *</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Month</label>
                  <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                  <p className="text-[10px] text-center mt-1 text-muted-foreground">1-12, *</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 text-center">Day (Week)</label>
                  <input type="text" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="input-calc text-center font-mono" placeholder="*" />
                  <p className="text-[10px] text-center mt-1 text-muted-foreground">0-6, *</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                 <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Common Presets
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    <button onClick={() => preset("*", "*", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Minute</button>
                    <button onClick={() => preset("0", "*", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Hour</button>
                    <button onClick={() => preset("0", "0", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Day at Midnight</button>
                    <button onClick={() => preset("0", "12", "*", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Day at Noon</button>
                    <button onClick={() => preset("0", "0", "*", "*", "1")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">Every Monday</button>
                    <button onClick={() => preset("0", "0", "1", "*", "*")} className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">1st of Every Month</button>
                 </div>
              </div>
            </div>

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>What is Cron?</h2>
              <p>Cron is a time-based job scheduler in Unix-like computer operating systems. Users who set up and maintain software environments use cron to schedule jobs (commands or shell scripts) to run periodically at fixed times, dates, or intervals. It typically automates system maintenance or administration.</p>
              
              <h3>Special Characters</h3>
              <ul>
                 <li><strong>* (Asterisk)</strong>: Specifies all legal values for a field. E.g., an asterisk in the month field means the command will run every month.</li>
                 <li><strong>, (Comma)</strong>: Used to separate items in a list. E.g., `1,5,10` in the minutes field means at minutes 1, 5, and 10.</li>
                 <li><strong>- (Hyphen)</strong>: Defines ranges. E.g., `1-5` in the day of week field means Monday to Friday.</li>
                 <li><strong>/ (Slash)</strong>: Specifies step values. E.g., `*/5` in the minutes field means every 5 minutes.</li>
              </ul>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cron-expression" />
            <PopularCalculators exclude="/calculator/cron-expression-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default CronExpressionCalculator;

