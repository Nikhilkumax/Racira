"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Zap, Cpu, Monitor, Info, ShieldCheck } from "lucide-react";

const PsuCalculator = () => {
  const [cpu, setCpu] = useState("125"); // Watts (Typical high-end CPU)
  const [gpu, setGpu] = useState("250"); // Watts (Typical high-end GPU)
  const [ramCount, setRamCount] = useState("2");
  const [driveCount, setDriveCount] = useState("2");
  const [fanCount, setFanCount] = useState("4");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cpuW = parseFloat(cpu) || 0;
    const gpuW = parseFloat(gpu) || 0;
    const ramW = (parseInt(ramCount) || 0) * 5;
    const driveW = (parseInt(driveCount) || 0) * 10;
    const fanW = (parseInt(fanCount) || 0) * 3;
    const moboW = 50; // Standard motherboard power

    const totalLoad = cpuW + gpuW + ramW + driveW + fanW + moboW;
    
    // Recommended PSU should be 20-30% higher than peak load for efficiency and headroom
    const recommendedWattage = totalLoad * 1.3;

    setResults({
      totalLoad,
      recommended: Math.ceil(recommendedWattage / 50) * 50, // Round to nearest 50W
      efficiencyRange: `${Math.round(totalLoad * 0.4)}W - ${Math.round(totalLoad * 0.6)}W`,
      co2Annual: (totalLoad / 1000) * 4 * 365 * 0.4 // Assuming 4 hours active use per day
    });
  };

  const reset = () => {
    setShowResults(false);
    setCpu("125"); setGpu("250"); setRamCount("2"); setDriveCount("2"); setFanCount("4");
    setResults(null);
  };

  const faqs = [
    { question: "Why do I need more wattage than my PC uses?", answer: "Power supplies (PSUs) are most efficient when running at 50-60% of their rated capacity. Having extra headroom also allows for future upgrades and prevents the PSU from overheating or running its fan at maximum speed constantly." },
    { question: "What are 80 PLUS ratings?", answer: "80 PLUS is a certification that measures PSU efficiency. Bronze, Silver, Gold, Platinum, and Titanium represent increasing levels of efficiency. A Gold-rated PSU will waste less electricity as heat than a White or Bronze-rated one." },
    { question: "Can a PSU have too much wattage?", answer: "Not really. Your components only draw the power they need. A 1000W PSU will only draw 300W from the wall if your PC only needs 300W. The only downside is the higher initial cost of the unit." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "PSU Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">PC Power Supply Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate the required power supply wattage for your custom PC build to ensure stability and efficiency.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <InputField id="cpu" label="CPU TDP" value={cpu} onChange={setCpu} suffix="W" tooltip="Thermal Design Power (Check manufacturer specs)." />
                <InputField id="gpu" label="GPU TDP" value={gpu} onChange={setGpu} suffix="W" tooltip="Graphics card peak power draw." />
                <InputField id="ram" label="RAM Sticks" value={ramCount} onChange={setRamCount} />
                <InputField id="drives" label="Storage Drives" value={driveCount} onChange={setDriveCount} tooltip="SSD or HDD count." />
                <InputField id="fans" label="Case Fans" value={fanCount} onChange={setFanCount} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" /> Calculate PSU
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Power Recommendation</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Recommended PSU</p>
                    <p className="text-5xl font-black text-foreground">{results.recommended} <span className="text-xl font-normal text-muted-foreground">Watts</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Estimated Load</p>
                    <p className="text-3xl font-black text-foreground">{Math.round(results.totalLoad)} W</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg text-primary"><Cpu className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Peak Efficiency Zone</p>
                      <p className="font-bold">{results.efficiencyRange}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-border/50">
                    <div className="p-2 bg-white rounded-lg text-primary"><ShieldCheck className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Suggested Rating</p>
                      <p className="font-bold">80+ Gold</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                  <p className="flex items-center gap-1.5"><Info className="h-3 w-3" /> This is a conservative estimate. High-end components (Intel i9, RTX 4090) may experience "transient spikes" that draw significantly more power for a fraction of a second.</p>
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Choosing the Right PSU</h2>
              <p>The Power Supply Unit is the heart of your PC. A poor-quality PSU can not only cause crashes and instability but can also damage your expensive CPU and GPU if it fails or experiences a surge.</p>
              
              <h3>Understanding PSU Tiers</h3>
              <p>Efficiency (80 PLUS) is important, but internal component quality matters more. Look for PSUs with 10-year warranties and "Japanese Capacitors," as these are indicators of high-quality engineering that can handle consistent load for years.</p>
              
              <h3>Modular vs. Non-Modular</h3>
              <ul>
                <li><strong>Non-Modular:</strong> All cables are permanently attached. Cheaper, but leads to cable clutter inside the case.</li>
                <li><strong>Semi-Modular:</strong> Essential cables (24-pin, CPU) are attached, others are removable. A good middle ground.</li>
                <li><strong>Fully Modular:</strong> All cables are removable. Best for aesthetics and airflow, as you only plug in what you need.</li>
              </ul>
              
              <h3>Transient Spikes</h3>
              <p>Modern high-end graphics cards can occasionally draw double their rated TDP for just a few milliseconds. These "spikes" can trip the protection circuits on low-wattage power supplies, causing the PC to shut down abruptly. This is why we recommend a 30% margin over your total estimated load.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/psu" />
            <PopularCalculators exclude="/calculator/power-supply-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default PsuCalculator;

