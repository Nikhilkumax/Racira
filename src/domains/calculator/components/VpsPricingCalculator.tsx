"use client";
import { HardDrive, RotateCcw, Cloud, Cpu } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const VpsPricingCalculator = () => {
  const [cpu, setCpu] = useState("2");
  const [ram, setRam] = useState("4");
  const [storage, setStorage] = useState("80");
  const [bandwidth, setBandwidth] = useState("2");
  const [region, setRegion] = useState("us-east");
  
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    // Basic baseline pricing factors (Average of DigitalOcean, Vultr, Linode)
    const CPU_PRICE = 5; // $5 per core
    const RAM_PRICE = 4; // $4 per GB
    const STORAGE_PRICE = 0.10; // $0.10 per GB
    const BANDWIDTH_PRICE = 0.01; // $0.01 per GB (above free tier)

    const baseCost = (parseFloat(cpu) * CPU_PRICE) + 
                     (parseFloat(ram) * RAM_PRICE) + 
                     (parseFloat(storage) * STORAGE_PRICE);
    
    // Bandwidth usually has a free tier of 1TB per TB of RAM approx
    const freeBandwidth = parseFloat(ram) * 1000; // 1TB per GB RAM
    const extraBandwidth = Math.max(0, (parseFloat(bandwidth) * 1000) - freeBandwidth);
    const bandwidthCost = extraBandwidth * BANDWIDTH_PRICE;

    // Region multiplier
    const regionMult: any = {
      "us-east": 1.0,
      "us-west": 1.0,
      "eu-west": 1.05,
      "ap-south": 1.2,
      "ap-east": 1.3
    };

    const monthlyTotal = (baseCost + bandwidthCost) * (regionMult[region] || 1);

    setResults({
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
      hourlyTotal: monthlyTotal / 730, // Average hours in month
      breakdown: {
        cpu: parseFloat(cpu) * CPU_PRICE,
        ram: parseFloat(ram) * RAM_PRICE,
        storage: parseFloat(storage) * STORAGE_PRICE,
        bandwidth: bandwidthCost
      }
    });
  };

  const reset = () => {
    setShowResults(false);
    setResults(null);
  };

  const setPreset = (type: string) => {
    if (type === "basic") { setCpu("1"); setRam("1"); setStorage("25"); setBandwidth("1"); }
    if (type === "standard") { setCpu("2"); setRam("4"); setStorage("80"); setBandwidth("4"); }
    if (type === "high-performance") { setCpu("8"); setRam("32"); setStorage("640"); setBandwidth("10"); }
  };

  const faqs = [
    { question: "What is a VPS?", answer: "A Virtual Private Server (VPS) is a virtual machine sold as a service by an Internet hosting provider. It runs its own copy of an operating system, and customers have superuser-level access to that operating system instance." },
    { question: "How much RAM do I need for my website?", answer: "A simple blog or personal site typically needs 1-2GB. A high-traffic WordPress site or small e-commerce store needs 4-8GB. Complex applications or high-traffic databases may require 16GB or more." },
    { question: "What is bandwidth in VPS hosting?", answer: "Bandwidth refers to the amount of data transferred between your server and the internet. Most VPS providers include a generous monthly quota (e.g., 2TB to 5TB) and charge extra only if you exceed it." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "VPS Pricing Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">VPS Pricing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex flex-wrap gap-2 mb-8">
                 <button onClick={() => setPreset('basic')} className="px-4 py-2 rounded-full border border-border text-xs font-bold hover:bg-primary hover:text-white transition-colors uppercase tracking-widest">Basic</button>
                 <button onClick={() => setPreset('standard')} className="px-4 py-2 rounded-full border border-border text-xs font-bold hover:bg-primary hover:text-white transition-colors uppercase tracking-widest">Standard</button>
                 <button onClick={() => setPreset('high-performance')} className="px-4 py-2 rounded-full border border-border text-xs font-bold hover:bg-primary hover:text-white transition-colors uppercase tracking-widest">Enterprise</button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                     <Cpu className="h-4 w-4" /> CPU Cores
                  </div>
                  <input type="range" min="1" max="64" step="1" value={cpu} onChange={(e) => setCpu(e.target.value)} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs font-bold text-muted-foreground"><span>1 Core</span><span>{cpu} Cores</span><span>64 Cores</span></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                     <Cpu className="h-4 w-4" /> RAM (GB)
                  </div>
                  <input type="range" min="1" max="512" step="1" value={ram} onChange={(e) => setRam(e.target.value)} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs font-bold text-muted-foreground"><span>1 GB</span><span>{ram} GB</span><span>512 GB</span></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                     <HardDrive className="h-4 w-4" /> Storage (GB)
                  </div>
                  <input type="range" min="10" max="2000" step="10" value={storage} onChange={(e) => setStorage(e.target.value)} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs font-bold text-muted-foreground"><span>10 GB</span><span>{storage} GB</span><span>2 TB</span></div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                <InputField id="bw" label="Monthly Bandwidth (TB)" value={bandwidth} onChange={setBandwidth} suffix="TB" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cloud Region</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="input-calc">
                    <option value="us-east">US East (N. Virginia)</option>
                    <option value="us-west">US West (Oregon)</option>
                    <option value="eu-west">Europe (London/Frankfurt)</option>
                    <option value="ap-south">Asia Pacific (Mumbai)</option>
                    <option value="ap-east">Asia Pacific (Tokyo)</option>
                  </select>
                </div>
              </div>
            
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button
                  onClick={reset}
                  className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Cost Estimation</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Estimated Monthly Cost</p>
                    <p className="text-5xl font-black text-foreground">${results.monthlyTotal.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">~${results.hourlyTotal.toFixed(3)} per hour</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Annual Total</p>
                    <p className="text-3xl font-black text-foreground">${results.annualTotal.toFixed(0)}</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Cloud className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-1 text-sm uppercase tracking-wider">Resource Allocation</h3>
                      <p className="text-xs text-muted-foreground">Estimated prices based on market averages for unmanaged VPS instances.</p>
                    </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Compute (vCPU)", value: 0, textValue: "$" + results.breakdown.cpu.toFixed(2) },
                    { label: "Memory (RAM)", value: 0, textValue: "$" + results.breakdown.ram.toFixed(2) },
                    { label: "Block Storage", value: 0, textValue: "$" + results.breakdown.storage.toFixed(2) },
                    { label: "Egress Bandwidth", value: 0, textValue: results.breakdown.bandwidth > 0 ? "$" + results.breakdown.bandwidth.toFixed(2) : "Included (Free Tier)" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">VPS Pricing Decoded</h2>
              <p>Virtual Private Server (VPS) pricing is generally more predictable than "serverless" or "managed" services because you are paying for reserved capacity. However, there are several factors that can influence your final bill.</p>
              
              <h3>Managed vs. Unmanaged</h3>
              <p>Unmanaged VPS (like DigitalOcean Droplets or AWS Lightsail) are cheaper because you are responsible for security, updates, and maintenance. Managed VPS can cost 2-3 times more but include professional support and server management.</p>

              <h3>Bandwidth and Egress Fees</h3>
              <p>While many providers offer a high monthly bandwidth quota for free, others (like AWS EC2 or Google Cloud Engine) charge per GB for data leaving the server. If your application serves large video files or high-resolution images, bandwidth can easily become your largest expense.</p>

              <h3>Storage Types</h3>
              <ul>
                <li><strong>SATA SSD:</strong> Standard speed, reliable for most web applications.</li>
                <li><strong>NVMe SSD:</strong> High-performance storage, essential for database-heavy applications.</li>
                <li><strong>Block Storage:</strong> External drives that can be detached and attached to different servers, usually priced per GB/month.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vps-pricing" />
          <PopularCalculators exclude="/calculator/vps-pricing-calculator" />
        </div>
      </div>
    </>
  );
};

export default VpsPricingCalculator;

