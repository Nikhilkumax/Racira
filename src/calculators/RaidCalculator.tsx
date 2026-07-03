"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, HardDrive, ShieldCheck, Database, Info } from "lucide-react";

const RaidCalculator = () => {
  const [driveCount, setDriveCount] = useState("4");
  const [driveSize, setDriveSize] = useState("4"); // TB
  const [raidLevel, setRaidLevel] = useState("5");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const n = parseInt(driveCount);
    const s = parseFloat(driveSize);
    
    let usableCapacity = 0;
    let faultTolerance = 0;
    let description = "";

    switch (raidLevel) {
      case "0": // Striping
        usableCapacity = n * s;
        faultTolerance = 0;
        description = "Maximum performance, zero redundancy. If one drive fails, all data is lost.";
        break;
      case "1": // Mirroring
        usableCapacity = n >= 2 ? s : 0;
        faultTolerance = n - 1;
        description = "Full data duplication. High redundancy, but expensive storage-wise.";
        break;
      case "5": // Parity
        usableCapacity = n >= 3 ? (n - 1) * s : 0;
        faultTolerance = 1;
        description = "Balanced performance and redundancy. Can survive one drive failure.";
        break;
      case "6": // Double Parity
        usableCapacity = n >= 4 ? (n - 2) * s : 0;
        faultTolerance = 2;
        description = "High redundancy. Can survive two simultaneous drive failures.";
        break;
      case "10": // Striped Mirrors
        usableCapacity = n >= 4 && n % 2 === 0 ? (n / 2) * s : 0;
        faultTolerance = n / 2;
        description = "Excellent performance and redundancy. Requires even number of drives.";
        break;
    }

    setResults({
      usableCapacity,
      totalCapacity: n * s,
      faultTolerance,
      description,
      efficiency: (usableCapacity / (n * s)) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setDriveCount("4"); setDriveSize("4"); setRaidLevel("5");
    setResults(null);
  };

  const faqs = [
    { question: "What is RAID?", answer: "RAID (Redundant Array of Independent Disks) is a way of storing the same data in different places on multiple hard disks or solid-state drives to protect data in the case of a drive failure." },
    { question: "Which RAID level is best for me?", answer: "For home servers (NAS), RAID 5 or 6 are popular for balancing cost and safety. For high-performance databases, RAID 10 is often preferred. RAID 0 should only be used for temporary data where speed is the only priority." },
    { question: "Can RAID replace backups?", answer: "No. RAID protects against hardware failure, but not against accidental deletion, file corruption, ransomware, or fire. You still need an off-site backup for critical data." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "RAID Capacity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">RAID Capacity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="count" label="Number of Drives" value={driveCount} onChange={setDriveCount} />
                <InputField id="size" label="Drive Size" value={driveSize} onChange={setDriveSize} suffix="TB" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">RAID Level</label>
                  <select value={raidLevel} onChange={(e) => setRaidLevel(e.target.value)} className="input-calc">
                    <option value="0">RAID 0 (Striping)</option>
                    <option value="1">RAID 1 (Mirroring)</option>
                    <option value="5">RAID 5 (Parity)</option>
                    <option value="6">RAID 6 (Double Parity)</option>
                    <option value="10">RAID 10 (1+0)</option>
                  </select>
                </div>
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
                <h2 className="text-2xl font-bold mb-3">Storage Configuration Results</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Usable Capacity</p>
                    <p className="text-5xl font-black text-foreground">{results.usableCapacity.toFixed(1)} <span className="text-xl font-normal text-muted-foreground">TB</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({results.efficiency.toFixed(0)}% efficiency)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Fault Tolerance</p>
                    <p className="text-3xl font-black text-foreground">{results.faultTolerance} <span className="text-lg">Drives</span></p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50 flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm"><ShieldCheck className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="font-bold mb-1">Level Description</h3>
                    <p className="text-sm text-muted-foreground mb-4">{results.description}</p>
                    <ResultDisplay items={[
                      { label: "Total Raw Capacity", value: 0, textValue: results.totalCapacity + " TB" },
                      { label: "Capacity Lost to Redundancy", value: 0, textValue: (results.totalCapacity - results.usableCapacity).toFixed(1) + " TB" },
                    ]} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>A Guide to RAID Levels</h2>
              <p>Choosing the right RAID level is a tradeoff between three factors: <strong>Performance</strong>, <strong>Redundancy</strong>, and <strong>Cost</strong> (Capacity).</p>
              
              <h3>RAID 0 (Performance)</h3>
              <p>Data is split across all drives. It's the fastest, but if any drive fails, you lose everything. Use only for temporary processing or scratch space.</p>
              
              <h3>RAID 1 (Redundancy)</h3>
              <p>Drives are exact copies of each other. Extremely safe, but very expensive because you only get the capacity of one drive regardless of how many you have.</p>
              
              <h3>RAID 5 (The Sweet Spot)</h3>
              <p>Uses "parity" information spread across all drives. You lose the capacity of exactly one drive, but you gain protection against one failure and increased read speeds. Minimum of 3 drives required.</p>
              
              <h3>RAID 6 (The Modern Standard)</h3>
              <p>Similar to RAID 5 but uses double parity. It can survive two simultaneous drive failures. As drive sizes increase (10TB+), RAID 6 is recommended because rebuild times are so long that a second drive might fail during the process.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/raid" />
          <PopularCalculators exclude="/calculator/raid-calculator" />
        </div>
      </div>
    </>
  );
};

export default RaidCalculator;

