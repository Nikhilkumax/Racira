"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Download } from "lucide-react";

const DownloadTimeCalculator = () => {
  const [fileSize, setFileSize] = useState("10");
  const [fileUnit, setFileUnit] = useState("GB");
  const [speed, setSpeed] = useState("100");
  const [speedUnit, setSpeedUnit] = useState("Mbps");
  const [overhead, setOverhead] = useState("5");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let sizeInBytes = parseFloat(fileSize) || 0;
    const units: any = { "KB": 1024, "MB": 1024 ** 2, "GB": 1024 ** 3, "TB": 1024 ** 4 };
    sizeInBytes *= units[fileUnit] || 1;

    let speedInBps = parseFloat(speed) || 0;
    const speedUnits: any = { "Kbps": 1000, "Mbps": 1000 ** 2, "Gbps": 1000 ** 3 };
    speedInBps *= speedUnits[speedUnit] || 1;

    if (sizeInBytes <= 0 || speedInBps <= 0) return;

    const totalBits = sizeInBytes * 8;
    const overheadFactor = 1 + (parseFloat(overhead) || 0) / 100;
    const effectiveBits = totalBits * overheadFactor;

    const seconds = effectiveBits / speedInBps;
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    setResults({
      time: `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`,
      totalSeconds: seconds,
      effectiveSpeed: speedInBps / overheadFactor,
      sizeInGB: sizeInBytes / (1024 ** 3)
    });
  };

  const reset = () => {
    setShowResults(false);
    setFileSize("10"); setFileUnit("GB");
    setSpeed("100"); setSpeedUnit("Mbps");
    setOverhead("5");
    setResults(null);
  };

  const faqs = [
    { question: "Why is my download slower than my advertised speed?", answer: "Advertised speeds are 'up to' limits. Factors like server congestion, your router's performance, and whether you are using Wi-Fi vs. Ethernet significantly impact real-world speeds." },
    { question: "How does distance affect download time?", answer: "The further you are from the server (geographically), the more 'hops' your data must take across routers, which can increase latency and decrease throughput." },
    { question: "What is a good download speed for gaming?", answer: "While low latency (ping) is more important for gaming, a download speed of 25-50 Mbps is generally sufficient for downloading updates and streaming game data." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Download Time Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Download Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <InputField id="fileSize" label="File Size" value={fileSize} onChange={setFileSize} />
                    </div>
                    <div className="w-24 mt-7">
                      <select value={fileUnit} onChange={(e) => setFileUnit(e.target.value)} className="input-calc">
                        <option>KB</option><option>MB</option><option>GB</option><option>TB</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <InputField id="speed" label="Download Speed" value={speed} onChange={setSpeed} />
                    </div>
                    <div className="w-28 mt-7">
                      <select value={speedUnit} onChange={(e) => setSpeedUnit(e.target.value)} className="input-calc">
                        <option>Kbps</option><option>Mbps</option><option>Gbps</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <InputField id="overhead" label="Overhead (%)" value={overhead} onChange={setOverhead} suffix="%" tooltip="Network overhead and packet retransmissions." />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Download Estimate</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Time</p>
                    <p className="text-4xl font-black text-foreground">{results.time}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Transfer Rate (Effective)</p>
                    <p className="text-4xl font-black text-foreground">{(results.effectiveSpeed / (1000 ** 2)).toFixed(1)} <span className="text-lg">Mbps</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Download Speed in MB/s", value: 0, textValue: (results.effectiveSpeed / (8 * 1024 ** 2)).toFixed(2) + " MB/s" },
                  { label: "Total Data in GB", value: 0, textValue: results.sizeInGB.toFixed(2) + " GB" },
                  { label: "Recommended Speed for 4K", value: 0, textValue: "25+ Mbps" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Speed Up Your Downloads</h2>
              <p>Download speed is the rate at which data is transferred from the internet to your local machine. It is the most common metric used by ISPs to market their services.</p>
              <h3>Practical Tips</h3>
              <ul>
                <li><strong>Ethernet vs. Wi-Fi:</strong> Always use a wired Ethernet cable for maximum stability and speed when downloading massive files.</li>
                <li><strong>Time of Day:</strong> Network traffic often peaks in the evenings. Downloading large files overnight or during off-peak hours can be faster.</li>
                <li><strong>Background Apps:</strong> Close streaming services, cloud sync apps (like OneDrive or Dropbox), and browser tabs to free up bandwidth.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/download-time" />
          <PopularCalculators exclude="/calculator/download-time-calculator" />
        </div>
      </div>
    </>
  );
};

export default DownloadTimeCalculator;

