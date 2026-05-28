"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Cpu } from "lucide-react";

const SsdTbwCalculator = () => {
  const [capacity, setCapacity] = useState("1000");
  const [tbwRating, setTbwRating] = useState("600");
  const [dailyWrites, setDailyWrites] = useState("50");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const tbw = parseFloat(tbwRating) || 0; // in TB
    const daily = parseFloat(dailyWrites) || 0; // in GB

    if (tbw <= 0 || daily <= 0) return;

    // Daily in TB
    const dailyTB = daily / 1000;
    
    // Years to reach TBW
    const totalDays = tbw / dailyTB;
    const years = totalDays / 365;

    // DWPD (Drive Writes Per Day)
    const cap = parseFloat(capacity) || 1000;
    const dwpd = daily / cap;

    setResults({
      lifespanYears: years,
      totalDays,
      dwpd,
      annualUsagePct: (dailyTB * 365 / tbw) * 100,
      quality: years > 10 ? "Excellent" : years > 5 ? "Good" : "Heavy Usage"
    });
  };

  const reset = () => {
    setShowResults(false);
    setCapacity("1000"); setTbwRating("600"); setDailyWrites("50");
    setResults(null);
  };

  const faqs = [
    { question: "What is SSD TBW?", answer: "TBW stands for Total Bytes Written. It is a measurement provided by manufacturers that predicts how much data can be written to an SSD before the NAND flash memory starts to wear out and fail." },
    { question: "How much data does an average user write per day?", answer: "An average office or home user typically writes 15-40 GB per day. Power users or gamers might write 50-100 GB. Video editors or data scientists can write several hundred GB per day." },
    { question: "Does reading data from an SSD wear it out?", answer: "No. Reading data from NAND flash has virtually zero impact on its lifespan. Only 'write' and 'erase' cycles cause physical wear to the memory cells." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "SSD TBW Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SSD TBW Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate the remaining lifespan of your Solid State Drive (SSD) based on its TBW rating and daily usage.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="capacity" label="SSD Capacity (GB)" value={capacity} onChange={setCapacity} suffix="GB" />
                <InputField id="tbw" label="TBW Rating (TB)" value={tbwRating} onChange={setTbwRating} suffix="TB" tooltip="Total Bytes Written rating from manufacturer." />
                <InputField id="daily" label="Average Daily Writes" value={dailyWrites} onChange={setDailyWrites} suffix="GB" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Cpu className="h-5 w-5" /> Estimate Lifespan
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Lifespan Projection</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Lifespan</p>
                    <p className="text-5xl font-black text-foreground">{results.lifespanYears.toFixed(1)} <span className="text-xl">Years</span></p>
                    <p className="text-xs text-muted-foreground mt-2">At current usage levels</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.quality === "Excellent" ? "bg-green-500/5 border-green-500/10" : "bg-orange-500/5 border-orange-500/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Durability Grade</p>
                    <p className={`text-3xl font-black ${results.quality === "Excellent" ? "text-green-600" : "text-orange-600"}`}>{results.quality}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "DWPD (Drive Writes Per Day)", value: 0, textValue: results.dwpd.toFixed(3) },
                  { label: "Annual TBW Consumption", value: 0, textValue: results.annualUsagePct.toFixed(1) + "%" },
                  { label: "Total Writes Until Failure", value: 0, textValue: (parseFloat(tbwRating) * 1000).toLocaleString() + " GB" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>How Long Will Your SSD Last?</h2>
              <p>Unlike traditional hard drives which have mechanical parts that wear out, SSDs use NAND flash memory cells that can only be written to a finite number of times. This is why manufacturers provide a <strong>TBW (Total Bytes Written)</strong> rating.</p>
              <h3>What is DWPD?</h3>
              <p>DWPD stands for <strong>Drive Writes Per Day</strong>. It describes how many times you can write the full capacity of the drive every single day during the warranty period (usually 5 years). A high DWPD is critical for enterprise servers, while a low DWPD is fine for home users.</p>
              <h3>Monitoring Your SSD</h3>
              <p>You can check your current "Total Host Writes" using free software like CrystalDiskInfo. Compare that number with your drive's TBW rating to see how much 'health' your drive has left.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ssd-tbw" />
          <PopularCalculators exclude="/calculator/ssd-tbw-calculator" />
        </div>
      </div>
    </>
  );
};

export default SsdTbwCalculator;

