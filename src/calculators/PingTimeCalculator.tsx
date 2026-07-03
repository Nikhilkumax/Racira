"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Activity } from "lucide-react";

const PingTimeCalculator = () => {
  const [distance, setDistance] = useState("1000"); // 1000 km
  const [medium, setMedium] = useState("fiber");
  const [hops, setHops] = useState("5");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const d = parseFloat(distance) || 0;
    const h = parseInt(hops) || 0;

    // Speed of light in vacuum c = 299,792,458 m/s
    const c = 299792.458; // km/s
    
    // Refractive index for media
    const refractiveIndex: any = {
      fiber: 1.47,
      copper: 1.6,
      satellite: 1.0, // Radio in air/space is close to c
      wireless: 1.05
    };

    const speedInMedium = c / refractiveIndex[medium];
    
    // Theoretical RTT (2x distance)
    const theoreticalRTT = (2 * d) / speedInMedium * 1000; // ms

    // Estimated hop delay (average 1-5ms per router hop)
    const hopDelay = h * 2; // 2ms per hop average

    const estimatedPing = theoreticalRTT + hopDelay;

    setResults({
      theoreticalMin: theoreticalRTT,
      hopDelay,
      estimatedPing,
      speedPct: (speedInMedium / c) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setDistance("1000"); setMedium("fiber"); setHops("5");
    setResults(null);
  };

  const faqs = [
    { question: "What is a 'good' ping for gaming?", answer: "Generally, under 20ms is excellent, 20-50ms is very good, 50-100ms is playable, and anything over 150ms will cause noticeable 'lag' or delay in fast-paced games." },
    { question: "Why is fiber faster than copper for ping?", answer: "While electrical signals in copper are fast, they are more prone to interference and signal degradation over long distances compared to light pulses in fiber optic cables, which require fewer repeaters." },
    { question: "How does satellite internet have such high ping?", answer: "Geostationary satellites are about 35,786 km above Earth. Even at the speed of light, the trip up and back down takes ~240ms, making RTT at least 480-600ms." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ping Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ping Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <InputField id="distance" label="One-Way Distance (km)" value={distance} onChange={setDistance} suffix="km" />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Transmission Medium</label>
                    <select value={medium} onChange={(e) => setMedium(e.target.value)} className="input-calc">
                      <option value="fiber">Fiber Optic</option>
                      <option value="copper">Copper (DSL/Cable)</option>
                      <option value="satellite">Satellite (Starlink/GEO)</option>
                      <option value="wireless">Wireless / Mobile</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <InputField id="hops" label="Estimated Network Hops" value={hops} onChange={setHops} tooltip="Number of routers/switches between you and the destination." />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Activity className="h-5 w-5" /> Estimate Latency
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Latency Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Ping (RTT)</p>
                    <p className="text-5xl font-black text-foreground">{results.estimatedPing.toFixed(1)} <span className="text-xl">ms</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Medium Efficiency</p>
                    <p className="text-3xl font-black text-foreground">{results.speedPct.toFixed(0)}% <span className="text-sm font-normal">of light speed</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Theoretical Min Latency", value: 0, textValue: results.theoreticalMin.toFixed(2) + " ms" },
                  { label: "Network Processing Delay", value: 0, textValue: results.hopDelay + " ms (est.)" },
                  { label: "Stability Category", value: 0, textValue: results.estimatedPing < 50 ? "Gaming Grade" : results.estimatedPing < 150 ? "Web / Streaming" : "High Latency" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>What is Ping?</h2>
              <p>Ping is the time it takes for a small packet of data to travel from your device to a server and back again. It is also called Round Trip Time (RTT). While download speed tells you how much data you can move, ping tells you how fast that data starts moving.</p>
              <h3>Why Distance Matters</h3>
              <p>Even light has a speed limit. At 300,000 km/s, it takes about 133ms just to travel once around the Earth. When you add the refractive index of glass in fiber optics and the delay of processing data at every router (hop), physical distance becomes the primary bottleneck for low-latency applications like video calls and competitive gaming.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ping-time" />
          <PopularCalculators exclude="/calculator/ping-time-calculator" />
        </div>
      </div>
    </>
  );
};

export default PingTimeCalculator;

