"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Upload } from "lucide-react";

const UploadTimeCalculator = () => {
  const [fileSize, setFileSize] = useState("500");
  const [fileUnit, setFileUnit] = useState("MB");
  const [speed, setSpeed] = useState("10");
  const [speedUnit, setSpeedUnit] = useState("Mbps");
  const [overhead, setOverhead] = useState("10");

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
      sizeInMB: sizeInBytes / (1024 ** 2)
    });
  };

  const reset = () => {
    setShowResults(false);
    setFileSize("500"); setFileUnit("MB");
    setSpeed("10"); setSpeedUnit("Mbps");
    setOverhead("10");
    setResults(null);
  };

  const faqs = [
    { question: "Why is my actual upload time longer than calculated?", answer: "Calculators provide a theoretical estimate. Actual speeds vary due to network congestion, ISP throttling, hardware limitations, and background traffic on your device." },
    { question: "What is network overhead?", answer: "Overhead refers to the extra data required to package and transmit your file (TCP/IP headers, error correction, etc.). This typically adds 5-15% to the total data transferred." },
    { question: "Is Mbps the same as MB/s?", answer: "No. Mbps stands for Megabits per second, while MB/s stands for Megabytes per second. There are 8 bits in 1 byte, so 8 Mbps = 1 MB/s." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Upload Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Upload Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
                      <InputField id="speed" label="Upload Speed" value={speed} onChange={setSpeed} />
                    </div>
                    <div className="w-28 mt-7">
                      <select value={speedUnit} onChange={(e) => setSpeedUnit(e.target.value)} className="input-calc">
                        <option>Kbps</option><option>Mbps</option><option>Gbps</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <InputField id="overhead" label="Overhead (%)" value={overhead} onChange={setOverhead} suffix="%" tooltip="Extra data for protocol headers and error correction." />
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
                <h2 className="text-2xl font-bold mb-3">Transfer Estimate</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Time</p>
                    <p className="text-4xl font-black text-foreground">{results.time}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Seconds</p>
                    <p className="text-4xl font-black text-foreground">{Math.round(results.totalSeconds).toLocaleString()}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Effective Transfer Rate", value: 0, textValue: (results.effectiveSpeed / 1000000).toFixed(2) + " Mbps" },
                  { label: "File Size in MB", value: 0, textValue: results.sizeInMB.toFixed(2) + " MB" },
                  { label: "Bits to Transfer", value: 0, textValue: (results.sizeInMB * 8 * 1.1).toFixed(0) + " Mbits (with overhead)" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How Upload Speeds Work</h2>
              <p>Upload speed refers to how much data you can send from your device to the internet in a given second. Most consumer internet connections (like Cable or DSL) are "asymmetric," meaning they have much slower upload speeds than download speeds.</p>
              <h3>Understanding Bits vs Bytes</h3>
              <p>Network speeds are measured in <strong>bits</strong> (lower case 'b'), while file sizes are measured in <strong>Bytes</strong> (upper case 'B'). Since 1 Byte = 8 bits, an 80 Mbps connection can theoretically upload 10 MB of data per second.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/upload-time" />
          <PopularCalculators exclude="/calculator/upload-time-calculator" />
        </div>
      </div>
    </>
  );
};

export default UploadTimeCalculator;

