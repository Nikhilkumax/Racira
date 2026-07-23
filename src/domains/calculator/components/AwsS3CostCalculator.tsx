"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Cloud, HardDrive, ArrowUpRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

interface S3Result {
  monthlyTotal: number;
  storageCost: number;
  requestCost: number;
  dataTransferCost: number;
  lifecycleTransitionCost: number;
  totalGB: number;
  chartData: { name: string; value: number; color: string }[];
}

const DEFAULTS = {
  storageAmount: "1000",
  storageClass: "standard",
  putRequests: "100000",
  getRequests: "1000000",
  dataTransferOut: "50",
  transitionToIA: "0",
  transitionToGlacier: "0",
  showAdvanced: false,
};

function safeParse(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function calculateAwsS3(inputs: typeof DEFAULTS): S3Result {
  const storageGB = safeParse(inputs.storageAmount);
  const puts = safeParse(inputs.putRequests);
  const gets = safeParse(inputs.getRequests);
  const dataOutGB = safeParse(inputs.dataTransferOut);
  const transitionIAGB = safeParse(inputs.transitionToIA);
  const transitionGlacierGB = safeParse(inputs.transitionToGlacier);
  const storageClass = inputs.storageClass;

  const storageRates: Record<string, number> = {
    standard: 0.023,
    intelligent: 0.023,
    ia: 0.0125,
    oneZoneIA: 0.01,
    glacier: 0.004,
    deepArchive: 0.00099,
  };

  const storagePricePerGB = storageRates[storageClass] || 0.023;
  const storageCost = storageGB * storagePricePerGB;

  const putCost = (puts / 1000) * 0.005;
  const getCost = (gets / 1000) * 0.0004;
  const requestCost = putCost + getCost;

  const freeTransferGB = 10;
  const dataTransferCost = dataOutGB > freeTransferGB ? (dataOutGB - freeTransferGB) * 0.09 : 0;

  const lifecycleTransitionCost = (transitionIAGB * 0.01) + (transitionGlacierGB * 0.004);

  const monthlyTotal = storageCost + requestCost + dataTransferCost + lifecycleTransitionCost;

  const chartData: { name: string; value: number; color: string }[] = [
    { name: "Storage", value: Number(storageCost.toFixed(2)), color: "#3b82f6" },
    { name: "Requests", value: Number(requestCost.toFixed(2)), color: "#f59e0b" },
    { name: "Data Transfer", value: Number(dataTransferCost.toFixed(2)), color: "#10b981" },
  ];

  if (lifecycleTransitionCost > 0) {
    chartData.push({ name: "Lifecycle Transitions", value: Number(lifecycleTransitionCost.toFixed(2)), color: "#8b5cf6" });
  }

  return {
    monthlyTotal: Number(monthlyTotal.toFixed(2)),
    storageCost: Number(storageCost.toFixed(2)),
    requestCost: Number(requestCost.toFixed(2)),
    dataTransferCost: Number(dataTransferCost.toFixed(2)),
    lifecycleTransitionCost: Number(lifecycleTransitionCost.toFixed(2)),
    totalGB: storageGB,
    chartData,
  };
}

const CompactInput = ({ id, label, value, onChange, suffix }: { id: string; label: string; value: string; onChange: (val: string) => void; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1.5 text-foreground">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      <input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (val: string) => void; options: { value: string; label: string }[] }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1.5 text-foreground">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 text-base rounded-md border border-input bg-background shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export default function AwsS3CostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<S3Result>(calculateAwsS3(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateAwsS3(inputs));
  }, []);

  const handleCalculate = () => setResult(calculateAwsS3(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateAwsS3(DEFAULTS));
  };
  const updateVal = (key: keyof typeof DEFAULTS, val: string | boolean) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is the cheapest S3 storage class?", answer: "S3 Glacier Deep Archive is the cheapest at roughly $0.00099 per GB per month, but it is designed for data that is accessed once or twice a year and can tolerate retrieval times of several hours." },
    { question: "Is S3 Intelligent-Tiering worth it?", answer: "Intelligent-Tiering is worth it if your access patterns are unpredictable. It automatically moves objects between frequent and infrequent access tiers without retrieval fees, but it does add a small per-object monitoring fee." },
    { question: "Why is data transfer out so expensive?", answer: "AWS charges for data leaving its network to the internet because outbound bandwidth is a real operational cost. The first 10 GB per month are free, but beyond that the price rises quickly across tiered volume discounts." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "AWS S3 Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">AWS S3 Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="storageAmount" label="Storage Used" value={inputs.storageAmount} onChange={(v: string) => updateVal("storageAmount", v)} suffix="GB" />
              <SelectInput id="storageClass" label="Storage Class" value={inputs.storageClass} onChange={(v: string) => updateVal("storageClass", v)} options={[
                { value: "standard", label: "S3 Standard" },
                { value: "intelligent", label: "Intelligent-Tiering" },
                { value: "ia", label: "Standard-IA" },
                { value: "oneZoneIA", label: "One Zone-IA" },
                { value: "glacier", label: "Glacier IR" },
                { value: "deepArchive", label: "Glacier Deep Archive" },
              ]} />
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => updateVal("showAdvanced", !inputs.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${inputs.showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {inputs.showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5" /> Request Patterns
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="putRequests" label="PUT Requests" value={inputs.putRequests} onChange={(v: string) => updateVal("putRequests", v)} suffix="/mo" />
                      <CompactInput id="getRequests" label="GET Requests" value={inputs.getRequests} onChange={(v: string) => updateVal("getRequests", v)} suffix="/mo" />
                    </div>
                    <div className="mt-3">
                      <CompactInput id="dataTransferOut" label="Data Transfer Out" value={inputs.dataTransferOut} onChange={(v: string) => updateVal("dataTransferOut", v)} suffix="GB" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5">
                      <Cloud className="h-3.5 w-3.5" /> Lifecycle Policies
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="transitionToIA" label="Transition to IA" value={inputs.transitionToIA} onChange={(v: string) => updateVal("transitionToIA", v)} suffix="GB" />
                      <CompactInput id="transitionToGlacier" label="Transition to Glacier" value={inputs.transitionToGlacier} onChange={(v: string) => updateVal("transitionToGlacier", v)} suffix="GB" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT - Results */}
          <div className="flex flex-col gap-4">
            {result.monthlyTotal === 0 && result.chartData.every(d => d.value === 0) ? (
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Monthly Cost</div>
                <div className="text-4xl font-bold text-primary my-1">$0.00</div>
                <div className="text-sm text-muted-foreground">Enter values to see your estimated S3 bill</div>
              </div>
            ) : (
              <>
                {/* Component 1: Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5" /> Monthly Cost
                  </div>
                  <div className="text-4xl font-bold text-primary my-1">${result.monthlyTotal.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Based on US East (N. Virginia) Pricing</div>
                </div>

                {/* Component 2: 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Storage</div>
                    <div className="text-lg font-bold text-foreground">${result.storageCost.toFixed(2)}</div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Requests</div>
                    <div className="text-lg font-bold text-foreground">${result.requestCost.toFixed(2)}</div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Transfer</div>
                    <div className="text-lg font-bold text-foreground">${result.dataTransferCost.toFixed(2)}</div>
                  </div>
                </div>

                {/* Component 3: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Cost Component</th>
                        <th className="p-2.5 pr-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Storage ({inputs.storageAmount} GB)</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${result.storageCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Requests (PUT + GET)</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${result.requestCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Data Transfer Out</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${result.dataTransferCost.toFixed(2)}</td>
                      </tr>
                      {result.lifecycleTransitionCost > 0 && (
                        <tr>
                          <td className="text-base py-2.5 px-3 text-muted-foreground">Lifecycle Transitions</td>
                          <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${result.lifecycleTransitionCost.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="font-bold border-t-2 border-border">
                        <td className="text-base py-2.5 px-3 text-foreground">Total Monthly Cost</td>
                        <td className="text-base py-2.5 px-3 text-right text-primary">${result.monthlyTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Component 4: Recharts PieChart */}
                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4">Cost Breakdown</h3>
                    <LazyView minHeight={250}>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                            {result.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => `$${value.toFixed(2)}`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </LazyView>
                  </div>
                )}

                {/* Component 5: Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Storage Used</span>
                      <span className="text-base font-bold text-foreground">{inputs.storageAmount} GB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Storage Class</span>
                      <span className="text-base font-bold text-foreground">{inputs.storageClass}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">PUT Requests</span>
                      <span className="text-base font-bold text-foreground">{inputs.putRequests}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">GET Requests</span>
                      <span className="text-base font-bold text-foreground">{inputs.getRequests}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Data Transfer Out</span>
                      <span className="text-base font-bold text-foreground">{inputs.dataTransferOut} GB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per GB</span>
                      <span className="text-base font-bold text-primary">${result.totalGB > 0 ? (result.monthlyTotal / result.totalGB).toFixed(3) : "0.000"}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO Article section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Mastering AWS S3 Storage Costs</h2>
            <p>
              Amazon S3 pricing is built on three pillars: storage volume, request volume, and data transfer. Storage is charged per gigabyte per month and varies significantly by class, from Standard at roughly $0.023 per GB down to Glacier Deep Archive at less than $0.001 per GB. Requests are billed in millions of operations, with PUTs costing about $0.005 per 1,000 and GETs about $0.0004 per 1,000. Data transfer out to the internet is free for the first 10 GB each month, then jumps to roughly $0.09 per GB for the first terabyte.
            </p>

            <h2 className="text-2xl font-bold mb-3">Choosing the Right Storage Class</h2>
            <p>
              S3 Standard is the default for frequently accessed data and offers immediate availability with no retrieval fees. If your data is accessed less than once a month, Standard-IA or One Zone-IA cuts the storage rate roughly in half, but adds a retrieval fee and minimum storage duration. For archives accessed a few times per year, Glacier Instant Retrieval provides rapid access at a lower storage price. For true cold storage accessed once or twice annually, Glacier Deep Archive is the cheapest option, though retrieval can take hours. Intelligent-Tiering is unique because it automatically shifts objects between tiers based on usage, making it ideal for unpredictable access patterns without manual lifecycle management.
            </p>

            <h2 className="text-2xl font-bold mb-3">Optimizing Your Monthly Bill</h2>
            <p>
              Start by right-sizing your storage class: move older or infrequently accessed data to IA or Glacier tiers using lifecycle policies. Deleting incomplete multipart uploads and expired object versions also removes hidden storage costs. For request-heavy workloads, batching writes and using S3 Transfer Acceleration or CloudFront for reads can reduce both latency and billable operations. Finally, keep an eye on data transfer out. If you serve large amounts of data to end users, pairing S3 with a CDN like CloudFront usually lowers egress costs and improves performance. Use this calculator to model each tier and transition scenario, then implement lifecycle rules that match your actual access patterns.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aws-s3-cost-calculator" />
          <PopularCalculators exclude="/calculator/aws-s3-cost-calculator" />
        </div>
      </div>
    </>
  );
}
