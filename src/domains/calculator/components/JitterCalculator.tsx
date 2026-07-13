"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const JitterCalculator = () => {
  const [samples, setSamples] = useState("20, 22, 19, 25, 21, 40, 20, 23");
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const rawSamples = samples.split(/[,\s]+/).map(s => parseFloat(s)).filter(s => !isNaN(s));
    
    if (rawSamples.length < 2) return;

    const avgLatency = rawSamples.reduce((a, b) => a + b, 0) / rawSamples.length;
    
    // RFC 3550 Jitter: J = J + (|D(i-1,i)| - J)/16
    // Simplified Average Jitter: Average of absolute differences between consecutive samples
    let sumDiff = 0;
    let maxDiff = 0;
    for (let i = 1; i < rawSamples.length; i++) {
      const diff = Math.abs(rawSamples[i] - rawSamples[i-1]);
      sumDiff += diff;
      if (diff > maxDiff) maxDiff = diff;
    }

    const avgJitter = sumDiff / (rawSamples.length - 1);

    setResults({
      avgLatency,
      avgJitter,
      maxDiff,
      sampleCount: rawSamples.length,
      quality: avgJitter < 5 ? "Excellent" : avgJitter < 15 ? "Good" : "Unstable"
    });
  };

  const reset = () => {
    setShowResults(false);
    setSamples("20, 22, 19, 25, 21, 40, 20, 23");
    setResults(null);
  };

  const faqs = [
    { question: "What is network jitter?", answer: "Jitter is the variation in the time delay (latency) between data packets sent over a network. While high latency is bad, high jitter is often worse for real-time services like VoIP and gaming because it causes 'stutter' and synchronization issues." },
    { question: "What causes jitter?", answer: "Network congestion is the most common cause. When routers become overloaded, they buffer packets for varying amounts of time, leading to inconsistent delivery times." },
    { question: "How much jitter is acceptable?", answer: "For high-quality voice calls (VoIP), jitter should stay below 30ms. For gaming, jitter under 10ms is ideal to prevent characters 'warping' or jumping around." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Jitter Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Jitter Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Latency Samples (ms)</label>
                <textarea 
                  value={samples}
                  onChange={(e) => setSamples(e.target.value)}
                  placeholder="e.g. 20, 22, 19, 25..."
                  className="w-full h-32 rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">Enter ping values in milliseconds, separated by commas or spaces.</p>
              </div>

              <div className="flex gap-3 items-center">
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Network Stability Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Average Jitter</p>
                    <p className="text-5xl font-black text-foreground">{results.avgJitter.toFixed(1)} <span className="text-xl">ms</span></p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.quality === "Excellent" ? "bg-green-500/5 border-green-500/10" : "bg-orange-500/5 border-orange-500/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Connection Quality</p>
                    <p className={`text-3xl font-black ${results.quality === "Excellent" ? "text-green-600" : "text-orange-600"}`}>{results.quality}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Mean Latency", value: 0, textValue: results.avgLatency.toFixed(1) + " ms" },
                  { label: "Max Variation (Spike)", value: 0, textValue: results.maxDiff.toFixed(1) + " ms" },
                  { label: "Samples Analyzed", value: 0, textValue: results.sampleCount.toString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Jitter: The Silent Connection Killer</h2>
              <p>You might have a fast connection, but if your jitter is high, your experience will be poor. Jitter represents the inconsistency in your connection. For example, if one packet takes 20ms and the next takes 100ms, the receiving device must wait for the slower packet, causing a glitch in the audio or video.</p>
              <h3>Impact of Jitter</h3>
              <ul>
                <li><strong>VoIP/Calls:</strong> Audio becomes robotic, cuts out, or sounds garbled.</li>
                <li><strong>Gaming:</strong> Characters appear to teleport or "rubber-band" back to previous positions.</li>
                <li><strong>Streaming:</strong> Video may pause for buffering even if the average speed is high enough.</li>
              </ul>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/jitter" />
          <PopularCalculators exclude="/calculator/jitter-calculator" />
        </div>
      </div>
    </>
  );
};

export default JitterCalculator;

