"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Globe } from "lucide-react";

const WebsiteHostingCostCalculator = () => {
  const [traffic, setTraffic] = useState("10000"); // 10k visitors
  const [pageSize, setPageSize] = useState("2"); // 2MB avg page size
  const [hostingType, setHostingType] = useState("shared");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const t = parseFloat(traffic) || 0;
    const p = parseFloat(pageSize) || 2;

    // Est. Bandwidth = Traffic * Page Size
    const bandwidthGB = (t * p) / 1024;

    const costs: any = {
      shared: { low: 3, high: 12, label: "Shared Hosting" },
      vps: { low: 20, high: 80, label: "Managed VPS" },
      dedicated: { low: 100, high: 400, label: "Dedicated Server" },
      cloud: { low: 5, high: 100, label: "Cloud (AWS/GCP/Azure)" }
    };

    const cost = costs[hostingType];

    setResults({
      bandwidthGB,
      estLow: cost.low,
      estHigh: cost.high,
      hostingLabel: cost.label
    });
  };

  const reset = () => {
    setShowResults(false);
    setTraffic("10000"); setPageSize("2"); setHostingType("shared");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between Shared and VPS hosting?", answer: "Shared hosting means your website lives on the same server as hundreds of others, sharing resources. VPS (Virtual Private Server) gives you a dedicated portion of a server's resources, offering better performance and security." },
    { question: "How much bandwidth does my website need?", answer: "Most small to medium websites use less than 10-20GB of bandwidth per month. Large sites with high-resolution images or video can easily exceed 500GB+." },
    { question: "Is Cloud hosting more expensive?", answer: "Cloud hosting is 'pay-as-you-go'. For small sites, it's very cheap (sometimes free). For high-traffic sites, it can become expensive but offers much better scalability than traditional hosting." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Website Hosting Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Website Hosting Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="traffic" label="Monthly Visitors" value={traffic} onChange={setTraffic} />
                <InputField id="pageSize" label="Avg Page Size (MB)" value={pageSize} onChange={setPageSize} suffix="MB" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Hosting Type</label>
                  <select value={hostingType} onChange={(e) => setHostingType(e.target.value)} className="input-calc">
                    <option value="shared">Shared Hosting</option>
                    <option value="vps">Managed VPS</option>
                    <option value="dedicated">Dedicated Server</option>
                    <option value="cloud">Cloud (AWS/Vultr/DO)</option>
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
                <h2 className="text-2xl font-bold mb-3">Cost Projection</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Cost Range</p>
                    <p className="text-4xl font-black text-foreground">${results.estLow} - ${results.estHigh}</p>
                    <p className="text-xs text-muted-foreground mt-2">Estimated for {results.hostingLabel}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Estimated Bandwidth</p>
                    <p className="text-3xl font-black text-foreground">{results.bandwidthGB.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">GB/mo</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Server Maintenance", value: 0, textValue: hostingType === "shared" ? "Included" : "Required" },
                  { label: "SSL Certificate", value: 0, textValue: "Free (Let's Encrypt)" },
                  { label: "Scalability", value: 0, textValue: hostingType === "cloud" ? "Excellent" : "Limited" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Choosing the Right Web Hosting</h2>
              <p>Choosing a hosting provider is one of the most important decisions for your online business. The right choice ensures your site is fast, secure, and always available to your customers.</p>
              <h3>When to Upgrade</h3>
              <p>If your website starts to feel slow during peak traffic times, or if you are exceeding your current plan's bandwidth limits, it's time to upgrade. Moving from shared hosting to a VPS is the most common first step for growing businesses, providing much better reliability and speed.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/website-hosting-cost" />
          <PopularCalculators exclude="/calculator/website-hosting-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default WebsiteHostingCostCalculator;

