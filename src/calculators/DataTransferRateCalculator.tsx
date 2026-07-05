"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Wifi, HardDrive, Clock, Info } from "lucide-react";

const DataTransferRateCalculator = () => {
  const [fileSize, setFileSize] = useState("10"); // GB
  const [speed, setSpeed] = useState("100"); // Mbps
  const [overhead, setOverhead] = useState("10"); // %

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const sizeGB = parseFloat(fileSize);
    const speedMbps = parseFloat(speed);
    const oh = parseFloat(overhead) / 100;

    if (sizeGB <= 0 || speedMbps <= 0) return;

    // Convert GB to bits (1 GB = 8 * 1024 * 1024 * 1024 bits or 10^9 bytes)
    // We use binary (1024) for file size and decimal (1000) for network speed usually.
    const sizeBits = sizeGB * 8 * 1024 * 1024 * 1024;
    const effectiveSpeedBps = speedMbps * 1000 * 1000 * (1 - oh);

    const seconds = sizeBits / effectiveSpeedBps;
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    setResults({
      timeStr: `${h}h ${m}m ${s}s`,
      mbPerSec: (speedMbps / 8).toFixed(1),
      effectiveMbPerSec: ((speedMbps * (1 - oh)) / 8).toFixed(1),
      totalSeconds: seconds,
      formattedTime: formatTime(seconds)
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)} Seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} Minutes`;
    return `${(seconds / 3600).toFixed(1)} Hours`;
  };

  const reset = () => {
    setShowResults(false);
    setFileSize("10"); setSpeed("100"); setOverhead("10");
    setResults(null);
  };

  const faqs = [
    { question: "Why is my download slower than my speed test?", answer: "Network overhead, server congestion, and 'bottlenecks' in your local hardware (like old Wi-Fi or slow hard drives) can all reduce effective speed. Additionally, internet speeds are measured in bits (Mbps), while file sizes are measured in bytes (MB). 8 bits = 1 byte." },
    { question: "What is network overhead?", answer: "Overhead refers to the extra data required to manage a transfer, such as IP headers and error correction. Typically, you should account for about 10-15% overhead in any network calculation." },
    { question: "Binary vs. Decimal units?", answer: "Operating systems usually use binary units (KiB, MiB, GiB) where 1 KiB = 1024 Bytes. Hard drive manufacturers and network providers often use decimal units (KB, MB, GB) where 1 KB = 1000 Bytes. This is why a '1TB' drive shows up as ~931GB in Windows." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Data Transfer Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Data Transfer Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="size" label="File Size" value={fileSize} onChange={setFileSize} suffix="GB" />
                <InputField id="speed" label="Transfer Speed" value={speed} onChange={setSpeed} suffix="Mbps" />
                <InputField id="overhead" label="Overhead / Loss" value={overhead} onChange={setOverhead} suffix="%" />
              </div>

              <div className="flex gap-3">
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
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Time</p>
                    <p className="text-5xl font-black text-foreground">{results.timeStr}</p>
                    <p className="text-xs text-muted-foreground mt-2">({results.formattedTime})</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Effective Speed</p>
                    <p className="text-3xl font-black text-foreground">{results.effectiveMbPerSec} <span className="text-lg">MB/s</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg text-primary"><HardDrive className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Raw Speed (Bytes)</p>
                      <p className="font-bold">{results.mbPerSec} MB/s</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg text-primary"><Clock className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Transfer Efficiency</p>
                      <p className="font-bold">{100 - parseFloat(overhead)}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                  <p className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Note: Network speeds fluctuate. This calculation assumes a constant speed throughout the entire transfer.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Megabits vs. Megabytes</h2>
              <p>One of the most common points of confusion in technology is the difference between a bit and a byte. There are exactly <strong>8 bits in 1 byte</strong>. Because internet speeds are marketed in Megabits per second (Mbps), you should divide that number by 8 to see how many Megabytes per second (MB/s) you will actually see in your browser or download manager.</p>
              
              <h3>Factors That Slow Down Transfers</h3>
              <ul>
                <li><strong>Protocol Overhead:</strong> The "packaging" around your data (TCP/IP headers) takes up space.</li>
                <li><strong>Congestion:</strong> If many people are using the same node or server, speed will drop.</li>
                <li><strong>Hardware Limits:</strong> A gigabit internet connection won't help if your Wi-Fi router or your PC's network card is capped at 100Mbps.</li>
                <li><strong>Distance (Latency):</strong> While latency doesn't directly reduce bandwidth, it can slow down the "handshaking" process for many small files.</li>
              </ul>
              
              <h3>ISP "Up to" Speeds</h3>
              <p>Most Internet Service Providers sell packages with "up to" speeds. This is a maximum theoretical limit. During peak hours, your actual throughput might be significantly lower than the advertised number.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/data-transfer" />
          <PopularCalculators exclude="/calculator/data-transfer-rate-calculator" />
        </div>
      </div>
    </>
  );
};

export default DataTransferRateCalculator;

