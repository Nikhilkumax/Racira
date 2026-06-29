"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Server, ShieldAlert, Clock, Info } from "lucide-react";

const UptimeCalculator = () => {
  const [sla, setSla] = useState("99.9"); // %
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const uptime = parseFloat(sla);
    if (isNaN(uptime) || uptime < 0 || uptime > 100) return;

    const downtimePercent = 100 - uptime;
    const totalSecondsYear = 365.25 * 24 * 3600;
    
    const yearlySeconds = (downtimePercent / 100) * totalSecondsYear;
    const monthlySeconds = yearlySeconds / 12;
    const weeklySeconds = yearlySeconds / 52.17;
    const dailySeconds = yearlySeconds / 365.25;

    const formatTime = (totalSeconds: number) => {
      const d = Math.floor(totalSeconds / 86400);
      const h = Math.floor((totalSeconds % 86400) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.floor(totalSeconds % 60);
      
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0) parts.push(`${m}m`);
      if (s > 0 || parts.length === 0) parts.push(`${s}s`);
      
      return parts.join(" ");
    };

    setResults({
      daily: formatTime(dailySeconds),
      weekly: formatTime(weeklySeconds),
      monthly: formatTime(monthlySeconds),
      yearly: formatTime(yearlySeconds),
      downtimePercent: downtimePercent.toFixed(4)
    });
  };

  const reset = () => {
    setShowResults(false);
    setSla("99.9");
    setResults(null);
  };

  const faqs = [
    { question: "What does 'Three Nines' mean?", answer: "In industry terms, 'Three Nines' refers to 99.9% uptime. This allows for roughly 8.77 hours of downtime per year. 'Five Nines' (99.999%) is considered high availability, allowing only 5.26 minutes of downtime per year." },
    { question: "What is an SLA?", answer: "A Service Level Agreement (SLA) is a contract between a service provider and a customer that defines the level of service expected, often including a minimum uptime percentage and penalties if that target is missed." },
    { question: "Does scheduled maintenance count as downtime?", answer: "This depends on the specific SLA. Many providers exclude 'Scheduled Maintenance Windows' from their uptime calculations, provided they give customers enough advance notice." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Uptime Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Server Uptime SLA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-foreground mb-3 text-center">Desired Uptime Percentage</label>
                <div className="relative mb-8">
                  <input 
                    type="number" 
                    step="0.001"
                    value={sla} 
                    onChange={(e) => setSla(e.target.value)} 
                    className="w-full text-5xl font-black text-center bg-transparent border-b-4 border-primary pb-2 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <span className="absolute right-0 bottom-4 text-2xl font-bold text-muted-foreground">%</span>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {["99.0", "99.9", "99.95", "99.99", "99.999"].map(val => (
                    <button 
                      key={val} 
                      onClick={() => {setSla(val); handleCalculate();}}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-secondary hover:bg-primary hover:text-white transition-all border border-border"
                    >
                      {val}%
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Allowed Downtime Limits</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Daily", value: results.daily },
                    { label: "Weekly", value: results.weekly },
                    { label: "Monthly", value: results.monthly },
                    { label: "Yearly", value: results.yearly },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-secondary/10 border border-border/50 text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-xl font-black text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><ShieldAlert className="h-6 w-6 text-primary" /></div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">Impact Summary</h3>
                      <p className="text-sm text-muted-foreground mb-4">A target of <strong>{sla}%</strong> uptime means your systems can be unavailable for no more than <strong>{results.yearly}</strong> over the course of a full year.</p>
                      <ResultDisplay items={[
                        { label: "Downtime Percentage", value: 0, textValue: results.downtimePercent + "%" },
                        { label: "Availability Category", value: 0, textValue: parseFloat(sla) >= 99.999 ? "High Availability" : parseFloat(sla) >= 99.9 ? "Standard Enterprise" : "Basic Service" },
                      ]} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Cost of Downtime</h2>
              <p>For modern businesses, every minute of downtime translates directly to lost revenue, decreased employee productivity, and potential damage to brand reputation. Calculating your allowed downtime is the first step in designing a resilient infrastructure.</p>
              
              <h3>High Availability (HA)</h3>
              <p>High availability refers to systems that are designed to remain operational for long periods, typically targeting "Five Nines" (99.999%). Achieving this level of reliability usually requires redundant hardware, geographic distribution (multiple data centers), and automated failover systems.</p>
              
              <h3>The Law of Diminishing Returns</h3>
              <p>The cost of increasing uptime follows an exponential curve. Moving from 99% to 99.9% might be relatively inexpensive, but moving from 99.99% to 99.999% often requires massive investments in infrastructure and engineering that may not be justifiable for all types of services.</p>
              
              <h3>MTBF and MTTR</h3>
              <ul>
                <li><strong>MTBF (Mean Time Between Failures):</strong> A measure of how reliable a single component is.</li>
                <li><strong>MTTR (Mean Time To Repair):</strong> How long it takes to bring a system back online after it fails.</li>
              </ul>
              <p>To maximize uptime, you must simultaneously work to increase your MTBF and decrease your MTTR.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/uptime" />
          <PopularCalculators exclude="/calculator/uptime-calculator" />
        </div>
      </div>
    </>
  );
};

export default UptimeCalculator;

