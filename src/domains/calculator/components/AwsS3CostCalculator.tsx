"use client";
import { RotateCcw, Cloud, Database, ArrowUpRight } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const AwsS3CostCalculator = () => {
  const [storageAmount, setStorageAmount] = useState("100");
  const [storageUnit, setStorageUnit] = useState("GB");
  const [storageClass, setStorageClass] = useState("standard");
  const [putRequests, setPutRequests] = useState("100000"); // 100k
  const [getRequests, setGetRequests] = useState("500000"); // 500k
  const [dataTransferOut, setDataTransferOut] = useState("50"); // GB

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let storageGB = parseFloat(storageAmount) || 0;
    if (storageUnit === "TB") storageGB *= 1024;

    const dataOutGB = parseFloat(dataTransferOut) || 0;
    const puts = parseFloat(putRequests) || 0;
    const gets = parseFloat(getRequests) || 0;

    // Pricing factors (Approximated AWS US-East Pricing)
    const pricing: any = {
      standard: { storage: 0.023, put: 0.005 / 1000, get: 0.0004 / 1000 },
      intelligent: { storage: 0.023, put: 0.005 / 1000, get: 0.0004 / 1000 },
      ia: { storage: 0.0125, put: 0.01 / 1000, get: 0.001 / 1000, retrieval: 0.01 },
      glacier: { storage: 0.004, put: 0.05 / 1000, get: 0.01 / 1000, retrieval: 0.03 }
    };

    const currentPricing = pricing[storageClass];
    
    const storageCost = storageGB * currentPricing.storage;
    const requestCost = (puts * currentPricing.put) + (gets * currentPricing.get);
    
    // Data transfer out (First 100GB is free in modern AWS, but let's assume standard pricing for safety)
    // First 1GB free, then 0.09 per GB
    const transferCost = Math.max(0, dataOutGB - 1) * 0.09;
    
    const retrievalCost = (storageClass === 'ia' || storageClass === 'glacier') 
      ? storageGB * currentPricing.retrieval 
      : 0;

    const monthlyTotal = storageCost + requestCost + transferCost + retrievalCost;

    setResults({
      monthlyTotal,
      storageCost,
      requestCost,
      transferCost,
      retrievalCost,
      totalGB: storageGB
    });
  };

  const reset = () => {
    setShowResults(false);
    setResults(null);
  };

  const faqs = [
    { question: "What is S3 Intelligent-Tiering?", answer: "S3 Intelligent-Tiering is a storage class designed to optimize costs by automatically moving data to the most cost-effective access tier based on access frequency, without operational overhead." },
    { question: "Are S3 requests really that expensive?", answer: "Usually no. At $0.005 per 1,000 PUT requests, you need a very high volume to see a significant impact. However, for applications with millions of small files, request costs can sometimes exceed storage costs." },
    { question: "Why is Data Transfer Out so expensive?", answer: "Cloud providers like AWS use high data transfer fees as a way to keep data within their ecosystem ('data gravity'). While data coming IN is free, data going OUT to the internet is one of the most common hidden costs in cloud bills." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "AWS S3 Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">AWS S3 Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-8">
                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary font-bold text-sm uppercase tracking-wider">
                     <Database className="h-4 w-4" /> Storage
                  </div>
                  <div className="grid grid-cols-[2fr_1fr] gap-2 mb-4">
                    <input type="number" value={storageAmount} onChange={(e) => setStorageAmount(e.target.value)} className="input-calc" />
                    <select value={storageUnit} onChange={(e) => setStorageUnit(e.target.value)} className="input-calc">
                       <option value="GB">GB</option>
                       <option value="TB">TB</option>
                    </select>
                  </div>
                  <label className="block text-sm font-medium text-foreground mb-2">Storage Class</label>
                  <select value={storageClass} onChange={(e) => setStorageClass(e.target.value)} className="input-calc">
                    <option value="standard">S3 Standard</option>
                    <option value="intelligent">Intelligent-Tiering</option>
                    <option value="ia">Standard-IA (Infrequent Access)</option>
                    <option value="glacier">S3 Glacier Instant Retrieval</option>
                  </select>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary font-bold text-sm uppercase tracking-wider">
                     <ArrowUpRight className="h-4 w-4" /> Requests & Transfer
                  </div>
                  <div className="space-y-4">
                    <InputField id="put" label="Monthly PUT/POST Requests" value={putRequests} onChange={setPutRequests} />
                    <InputField id="get" label="Monthly GET/SELECT Requests" value={getRequests} onChange={setGetRequests} />
                    <InputField id="out" label="Data Transfer Out (GB)" value={dataTransferOut} onChange={setDataTransferOut} suffix="GB" />
                  </div>
                </section>
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
                <h2 className="text-2xl font-bold mb-3">Cost Breakdown</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Estimated Monthly Bill</p>
                    <p className="text-5xl font-black text-foreground">${results.monthlyTotal.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on US East (N. Virginia) Pricing</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Cost per GB</p>
                    <p className="text-3xl font-black text-foreground">${(results.monthlyTotal / (results.totalGB || 1)).toFixed(3)}</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Cloud className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold mb-1 text-sm uppercase tracking-wider">Line Item Estimates</h3>
                    </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Storage Cost", value: 0, textValue: "$" + results.storageCost.toFixed(2) },
                    { label: "Request Cost", value: 0, textValue: "$" + results.requestCost.toFixed(2) },
                    { label: "Data Transfer Cost", value: 0, textValue: "$" + results.transferCost.toFixed(2) },
                    { label: "Retrieval Fees", value: 0, textValue: results.retrievalCost > 0 ? "$" + results.retrievalCost.toFixed(2) : "None" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering S3 Storage Costs</h2>
              <p>Amazon S3 (Simple Storage Service) is the backbone of the internet, but its pricing model can be complex. Understanding the three main dimensions of cost—storage, requests, and transfer—is key to keeping your cloud bill under control.</p>
              
              <h3>Which Storage Class?</h3>
              <ul>
                <li><strong>S3 Standard:</strong> Best for active data that is accessed frequently. No retrieval fees.</li>
                <li><strong>S3 Standard-IA:</strong> Best for data that is accessed less frequently (e.g., once a month) but needs immediate access when required. Lower storage cost, but has retrieval fees.</li>
                <li><strong>S3 Glacier:</strong> Best for long-term archives. Very low storage cost, but retrieval can be expensive and sometimes slow.</li>
              </ul>

              <h3>Hidden Costs to Watch For</h3>
              <p><strong>Minimum Storage Duration:</strong> Classes like IA and Glacier have minimum storage durations (e.g., 30 or 90 days). If you delete an object before this time, you still pay for the full duration.</p>
              <p><strong>Object Overhead:</strong> Each object in S3 has a small amount of metadata (typically 8KB-32KB) that is billed at the storage class rate. For billions of tiny files, this overhead can be significant.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aws-s3-cost" />
          <PopularCalculators exclude="/calculator/aws-s3-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default AwsS3CostCalculator;

