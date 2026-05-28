"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Globe, Search, Tag, Calculator, TrendingUp, ShieldCheck } from "lucide-react";

export default function DomainValuationCalculator() {
  const [domainName, setDomainName] = useState("");
  const [domainLength, setDomainLength] = useState("8");
  const [extension, setExtension] = useState(".com");
  const [monthlyTraffic, setMonthlyTraffic] = useState("0");
  const [keywordsCount, setKeywordsCount] = useState("1");
  const [isDictionaryWord, setIsDictionaryWord] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    baseValue: 0,
    extensionMultiplier: 0,
    lengthAdjustment: 0,
    trafficValue: 0,
    totalValuation: 0,
    confidenceScore: 0,
  });

  const handleCalculate = () => {
    const length = parseInt(domainLength) || 8;
    const traffic = parseFloat(monthlyTraffic) || 0;
    const keywords = parseInt(keywordsCount) || 1;

    let baseValue = 50; // Starting point for any domain

    // Extension Multipliers
    const extensionMap: Record<string, number> = {
      ".com": 10,
      ".net": 2.5,
      ".org": 2,
      ".io": 5,
      ".ai": 8,
      ".co": 3,
      ".me": 1.5,
      ".info": 0.5,
    };
    const extensionMultiplier = extensionMap[extension] || 1;

    // Length Adjustment (Shorter is better)
    let lengthAdjustment = 1;
    if (length <= 3) lengthAdjustment = 20;
    else if (length <= 4) lengthAdjustment = 10;
    else if (length <= 6) lengthAdjustment = 5;
    else if (length <= 10) lengthAdjustment = 2;
    else lengthAdjustment = 0.5;

    // Word quality
    const wordBonus = isDictionaryWord ? 10 : 1;
    const keywordFactor = keywords > 0 ? 1 + (keywords * 0.2) : 1;

    // Traffic Value (Rough estimate of $1 per monthly visitor value)
    const trafficValue = traffic * 12 * 0.5; // Value based on 6 months of revenue

    const estimatedValue = baseValue * extensionMultiplier * lengthAdjustment * wordBonus * keywordFactor + trafficValue;
    
    // Confidence score based on data provided
    const confidenceScore = domainName ? 85 : 40;

    setResults({
      baseValue,
      extensionMultiplier,
      lengthAdjustment,
      trafficValue,
      totalValuation: Math.round(estimatedValue),
      confidenceScore,
    });
    setShowResults(true);
  };

  const reset = () => {
    setDomainName("");
    setDomainLength("8");
    setExtension(".com");
    setMonthlyTraffic("0");
    setKeywordsCount("1");
    setIsDictionaryWord(false);
    setShowResults(false);
  };

  const faqs = [
    { question: "How are domain names valued?", answer: "Domain valuation is based on several factors: length (shorter is better), top-level domain extension (.com is king), search engine visibility (keywords), traffic volume, and brandability (dictionary words or easy-to-pronounce made-up words)." },
    { question: "Why is .com the most valuable extension?", answer: ".com is the original and most recognized TLD. It carries the most trust, has high global recognition, and is the 'default' extension people type when they guess a website name." },
    { question: "What is a 'liquid' domain?", answer: "Liquid domains are those that can be sold quickly at a predictable market price. This includes 3-letter .coms, 2-letter .coms, and high-value single dictionary words." },
    { question: "Do keywords in domain names still help with SEO?", answer: "Keywords in a domain name (Exact Match Domains) provide less SEO benefit than they used to, but they still help with user trust and click-through rates because users immediately understand what the site is about." },
    { question: "How does traffic affect domain value?", answer: "If a domain already has natural type-in traffic or existing search rankings, its value increases significantly because it is effectively a revenue-generating asset rather than just an address." },
    { question: "What is the most expensive domain ever sold?", answer: "Voice.com was sold for $30 million in 2019. Other high-value sales include Business.com ($345 million as part of a company sale) and LasVegas.com ($90 million over time)." },
    { question: "Should I buy .ai or .io domains?", answer: "For technology and artificial intelligence startups, .ai and .io have become very valuable and highly 'brandable.' However, they often lack the mass-market trust of a .com extension." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Domain Valuation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Domain Name Valuation Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate the market value of a domain name based on length, TLD, keywords, and traffic potential.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="domain-name" label="Domain Name (Optional)" value={domainName} onChange={setDomainName} placeholder="e.g., racira.com" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Extension (TLD)</label>
                  <select 
                    value={extension} 
                    onChange={(e) => setExtension(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value=".com">.com (Most Valuable)</option>
                    <option value=".net">.net</option>
                    <option value=".org">.org</option>
                    <option value=".io">.io / .ai (Premium Tech)</option>
                    <option value=".co">.co</option>
                    <option value=".info">.info / .biz</option>
                  </select>
                </div>
                <InputField id="length" label="Character Length (No extension)" value={domainLength} onChange={setDomainLength} tooltip="Number of characters in the domain name (excluding .com)." />
                <InputField id="traffic" label="Est. Monthly Traffic" value={monthlyTraffic} onChange={setMonthlyTraffic} tooltip="How many visitors per month does the domain already receive?" />
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="checkbox" 
                  id="dict-word" 
                  checked={isDictionaryWord} 
                  onChange={(e) => setIsDictionaryWord(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="dict-word" className="text-sm font-medium text-foreground cursor-pointer">Is it a single dictionary word?</label>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Globe className="h-5 w-5" /> Estimate Value
                </button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-6">Valuation Summary</h2>
                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 text-center mb-8">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Estimated Market Value</p>
                  <p className="text-6xl font-black text-foreground mb-4">${results.totalValuation.toLocaleString()}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Confidence Score: {results.confidenceScore}%</span>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "TLD Quality Multiplier", value: 0, textValue: `${results.extensionMultiplier}x` },
                  { label: "Length Scarcity Score", value: 0, textValue: results.lengthAdjustment > 5 ? "Rare" : "Common" },
                  { label: "Existing Traffic Value", value: results.trafficValue },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Makes a Domain Name Valuable?</h2>
              <p>In the digital age, a domain name is more than just a website address — it is virtual real estate. Just like physical property, some addresses are worth more than others because of their location (extension), accessibility (length), and development (traffic). This calculator uses professional appraisal methodologies to give you a realistic window into what your domain might be worth on the open market.</p>

              <h3>1. The .com Dominance</h3>
              <p>While hundreds of new domain extensions (gTLDs) have launched in recent years (like .club, .store, and .site), the <strong>.com</strong> extension remains the undisputed king of the internet. It accounts for over 50% of all registrations and nearly 95% of high-value secondary market sales. If you have a choice between a great word on .net or a slightly worse word on .com, the .com is almost always the better long-term investment.</p>

              <h3>2. The Length Factor: Brevity is Value</h3>
              <p>There is a finite number of short domain names. There are only 17,576 possible 3-letter .com domains, and every single one of them was registered decades ago. Because short domains are easier to remember, harder to mistype, and look more professional on branding, they command massive premiums. A 3-letter .com domain is considered a 'liquid' asset that can often be sold for $10,000 to $50,000 even if the letters don't spell a word.</p>

              <h3>3. Brandability vs. Keyword Match</h3>
              <p>Domainers generally look at two types of value:</p>
              <ul>
                <li><strong>Brandable Domains:</strong> These are made-up words that are easy to pronounce and remember (like Google, Skype, or Racira). Their value depends on how 'commercial' they sound.</li>
                <li><strong>Keyword Domains:</strong> These are domains that match what people search for (like Hotels.com, CarInsurance.com, or Bitcoin.com). These are valuable because they provide instant authority and organic search traffic in high-value industries.</li>
              </ul>

              <h3>4. Traffic and Revenue History</h3>
              <p>If a domain has been active for years and has established backlink profiles or natural type-in traffic, its value skyrockets. Type-in traffic is the 'holy grail' of domaining — it refers to users who type the domain directly into their browser bar without using a search engine. A domain that receives 1,000 type-in visitors a month is essentially a billboard that never stops working.</p>

              <h3>5. Scarcity and Liquid Assets</h3>
              <p>Certain domains are considered 'liquid,' meaning they have a known floor price and can be sold quickly to other investors. This includes 2-letter .coms, 3-letter .coms, and short numeric domains (like 88.com). These assets are often used as stores of value, similar to gold or fine art, because their supply is strictly limited by the architecture of the DNS system.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/domain-name-valuation-calculator" />
          <PopularCalculators exclude="/calculator/domain-name-valuation-calculator" />
        </div>
      </div>
    </>
  );
}
