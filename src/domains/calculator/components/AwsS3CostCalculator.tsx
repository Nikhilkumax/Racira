"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Printer, Cloud, HardDrive, ArrowUpRight, Settings2 } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

type StorageClass = "standard" | "intelligent" | "ia" | "oneZoneIA" | "glacier" | "deepArchive";

interface ClassSpec {
  key: StorageClass;
  label: string;
  storageRate: number;
  retrievalRate: number;
  minDurationDays: number;
}

interface S3Inputs {
  storageGB: number;
  storageClass: StorageClass;
  putRequests: number;
  getRequests: number;
  dataTransferOutGB: number;
  transitionToIA: number;
  transitionToGlacier: number;
  proMode: boolean;
  objectCount: number;
  retrievalGB: number;
  versioningOverheadPercent: number;
}

interface ChartSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface S3Result {
  monthlyTotal: number;
  annualTotal: number;
  storageCost: number;
  requestCost: number;
  putCost: number;
  getCost: number;
  dataTransferCost: number;
  lifecycleTransitionCost: number;
  retrievalCost: number;
  monitoringCost: number;
  billableStorageGB: number;
  effectiveRatePerGB: number;
  freeTransferUsed: number;
  chartData: ChartSlice[];
  rows: TableRow[];
}

// US East (N. Virginia) list pricing, first-tier rates.
const CLASSES: ClassSpec[] = [
  { key: "standard", label: "S3 Standard", storageRate: 0.023, retrievalRate: 0, minDurationDays: 0 },
  { key: "intelligent", label: "Intelligent-Tiering", storageRate: 0.023, retrievalRate: 0, minDurationDays: 0 },
  { key: "ia", label: "Standard-IA", storageRate: 0.0125, retrievalRate: 0.01, minDurationDays: 30 },
  { key: "oneZoneIA", label: "One Zone-IA", storageRate: 0.01, retrievalRate: 0.01, minDurationDays: 30 },
  { key: "glacier", label: "Glacier Instant Retrieval", storageRate: 0.004, retrievalRate: 0.03, minDurationDays: 90 },
  { key: "deepArchive", label: "Glacier Deep Archive", storageRate: 0.00099, retrievalRate: 0.02, minDurationDays: 180 },
];

const PUT_PER_1K = 0.005;
const GET_PER_1K = 0.0004;
const FREE_TRANSFER_GB = 10;
const TRANSFER_RATE = 0.09;
const TRANSITION_IA_PER_1K = 0.01;
const TRANSITION_GLACIER_PER_1K = 0.05;
// Intelligent-Tiering monitoring and automation fee, per 1,000 objects per month.
const MONITORING_PER_1K_OBJECTS = 0.0025;

const DEFAULTS: S3Inputs = {
  storageGB: 1000,
  storageClass: "standard",
  putRequests: 100000,
  getRequests: 1000000,
  dataTransferOutGB: 50,
  transitionToIA: 0,
  transitionToGlacier: 0,
  proMode: false,
  objectCount: 250000,
  retrievalGB: 0,
  versioningOverheadPercent: 0,
};

function classSpec(key: StorageClass): ClassSpec {
  return CLASSES.find((c) => c.key === key) ?? CLASSES[0];
}

export function calculateAwsS3(i: S3Inputs): S3Result {
  const spec = classSpec(i.storageClass);
  const rawStorage = Math.max(0, i.storageGB);
  const overhead = Math.max(0, i.versioningOverheadPercent) / 100;
  const billableStorageGB = rawStorage * (1 + overhead);

  const storageCost = billableStorageGB * spec.storageRate;

  const puts = Math.max(0, i.putRequests);
  const gets = Math.max(0, i.getRequests);
  const putCost = (puts / 1000) * PUT_PER_1K;
  const getCost = (gets / 1000) * GET_PER_1K;
  const requestCost = putCost + getCost;

  const dataOut = Math.max(0, i.dataTransferOutGB);
  const freeTransferUsed = Math.min(dataOut, FREE_TRANSFER_GB);
  const dataTransferCost = Math.max(0, dataOut - FREE_TRANSFER_GB) * TRANSFER_RATE;

  // Lifecycle transitions are billed per 1,000 objects moved, not per gigabyte.
  const lifecycleTransitionCost =
    (Math.max(0, i.transitionToIA) / 1000) * TRANSITION_IA_PER_1K +
    (Math.max(0, i.transitionToGlacier) / 1000) * TRANSITION_GLACIER_PER_1K;

  const retrievalCost = Math.max(0, i.retrievalGB) * spec.retrievalRate;

  const monitoringCost =
    i.storageClass === "intelligent" ? (Math.max(0, i.objectCount) / 1000) * MONITORING_PER_1K_OBJECTS : 0;

  const monthlyTotal =
    storageCost + requestCost + dataTransferCost + lifecycleTransitionCost + retrievalCost + monitoringCost;
  const annualTotal = monthlyTotal * 12;
  const effectiveRatePerGB = rawStorage > 0 ? monthlyTotal / rawStorage : 0;

  const chartRaw: { name: string; value: number; color: string }[] = [
    { name: "Storage", value: storageCost, color: "#2563EB" },
    { name: "Requests", value: requestCost, color: "#F59E0B" },
    { name: "Data Transfer", value: dataTransferCost, color: "#10B981" },
    { name: "Lifecycle Transitions", value: lifecycleTransitionCost, color: "#8B5CF6" },
    { name: "Retrieval", value: retrievalCost, color: "#EF4444" },
    { name: "Monitoring", value: monitoringCost, color: "#06B6D4" },
  ].filter((s) => s.value > 0);

  const chartTotal = chartRaw.reduce((sum, s) => sum + s.value, 0);
  const chartData: ChartSlice[] = chartRaw.map((s) => ({
    ...s,
    value: Number(s.value.toFixed(4)),
    percent: chartTotal > 0 ? (s.value / chartTotal) * 100 : 0,
  }));

  const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const rows: TableRow[] = [
    { label: `Storage (${billableStorageGB.toLocaleString("en-US", { maximumFractionDigits: 0 })} GB @ $${spec.storageRate}/GB)`, value: money(storageCost) },
    { label: `PUT / COPY / POST Requests (${puts.toLocaleString("en-US")})`, value: money(putCost) },
    { label: `GET / SELECT Requests (${gets.toLocaleString("en-US")})`, value: money(getCost) },
    { label: `Data Transfer Out (${Math.max(0, dataOut - FREE_TRANSFER_GB).toLocaleString("en-US")} GB billable)`, value: money(dataTransferCost) },
    { label: "Lifecycle Transition Requests", value: money(lifecycleTransitionCost) },
    { label: "Data Retrieval Charges", value: money(retrievalCost) },
    { label: "Intelligent-Tiering Monitoring", value: money(monitoringCost) },
    { label: "Estimated Monthly Cost", value: money(monthlyTotal), key: true },
    { label: "Projected Annual Cost", value: money(annualTotal) },
    { label: "Effective Cost per GB Stored", value: `$${effectiveRatePerGB.toFixed(4)}` },
  ];

  return {
    monthlyTotal,
    annualTotal,
    storageCost,
    requestCost,
    putCost,
    getCost,
    dataTransferCost,
    lifecycleTransitionCost,
    retrievalCost,
    monitoringCost,
    billableStorageGB,
    effectiveRatePerGB,
    freeTransferUsed,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function AwsS3CostCalculator() {
  const [inputs, setInputs] = useState<S3Inputs>(DEFAULTS);
  const [result, setResult] = useState<S3Result>(calculateAwsS3(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateAwsS3(inputs));
  }, []);

  const calculate = () => setResult(calculateAwsS3(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateAwsS3(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof S3Inputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const spec = classSpec(inputs.storageClass);

  const storageShare = result.monthlyTotal > 0 ? (result.storageCost / result.monthlyTotal) * 100 : 0;
  const transferShare = result.monthlyTotal > 0 ? (result.dataTransferCost / result.monthlyTotal) * 100 : 0;

  const faqs = [
    {
      question: "What is the cheapest S3 storage class?",
      answer:
        "S3 Glacier Deep Archive is the cheapest at roughly $0.00099 per GB per month, about 23 times cheaper than S3 Standard. The trade-off is real: it is designed for data accessed once or twice a year, carries a 180-day minimum storage duration, charges retrieval fees, and can take up to 12 hours to restore. It is the correct choice for compliance archives and backup copies of last resort, and the wrong choice for anything a user might request interactively.",
    },
    {
      question: "Is S3 Intelligent-Tiering worth it?",
      answer:
        "Intelligent-Tiering is worth it when access patterns are genuinely unpredictable. It automatically moves objects between frequent and infrequent tiers with no retrieval fees and no lifecycle rules to maintain, but it adds a monitoring charge of about $0.0025 per 1,000 objects per month. That math favors Intelligent-Tiering for large objects and works against it for millions of tiny ones, where the per-object fee can exceed the storage savings entirely.",
    },
    {
      question: "Why is data transfer out so expensive?",
      answer:
        "AWS charges for data leaving its network to the internet because outbound bandwidth is a genuine operational cost and because egress fees discourage moving data off the platform. A free allowance applies each month, and beyond that the rate starts around $0.09 per GB and steps down with volume. For public-facing content, fronting S3 with CloudFront usually reduces the bill because CDN egress is priced below direct S3 egress.",
    },
    {
      question: "What is a minimum storage duration charge?",
      answer:
        "The colder storage classes bill you for a minimum retention period whether or not the object survives that long. Standard-IA and One Zone-IA charge for 30 days, Glacier Instant Retrieval for 90, and Deep Archive for 180. If you write an object to Deep Archive and delete it after a week, you are still billed for 180 days of storage. This is why transitioning short-lived data to cold tiers frequently costs more than simply leaving it in Standard.",
    },
    {
      question: "How are lifecycle transitions billed?",
      answer:
        "Transitions are charged per 1,000 objects moved, not per gigabyte, which surprises teams with many small files. Moving to Standard-IA costs about $0.01 per 1,000 objects and moving to Glacier tiers about $0.05 per 1,000. Transitioning ten million small objects to Glacier therefore costs roughly $500 in one-time request fees before any storage savings begin to accrue.",
    },
    {
      question: "Do I pay for deleted objects?",
      answer:
        "Sometimes, and this is a common source of unexplained cost. If versioning is enabled, deleting an object only creates a delete marker while every previous version continues to be stored and billed. Incomplete multipart uploads also persist and bill indefinitely unless a lifecycle rule aborts them. Both are worth auditing. Use the versioning overhead field in Professional Mode to model how much non-current version data is inflating your storage line.",
    },
    {
      question: "Does One Zone-IA save enough to justify the risk?",
      answer:
        "One Zone-IA is about 20% cheaper than Standard-IA because it stores data in a single availability zone rather than three. Durability against ordinary media failure is unchanged, but the data is lost if that one zone is destroyed. It is a reasonable choice for easily reproducible data such as transcoded renditions, thumbnails, or secondary backup copies, and an unreasonable one for anything expensive or impossible to regenerate.",
    },
    {
      question: "How can I reduce my S3 bill fastest?",
      answer:
        "In order of typical impact: add a lifecycle rule to abort incomplete multipart uploads, expire non-current versions after a defined window, transition genuinely cold data to IA or Glacier, and put a CDN in front of any public read traffic. These four changes are configuration only and often cut a bloated bill by 30% to 60% without touching application code or moving a single byte manually.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "AWS S3 Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">AWS S3 Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="storageGB" className={lbl}>Storage Used (GB)</label>
                <input id="storageGB" type="number" min="0" step="100" className={inp} value={inputs.storageGB}
                  onChange={(e) => setNum("storageGB", e.target.value)} />
              </div>
              <div>
                <label htmlFor="storageClass" className={lbl}>Storage Class</label>
                <select id="storageClass" className={inp} value={inputs.storageClass}
                  onChange={(e) => setInputs((p) => ({ ...p, storageClass: e.target.value as StorageClass }))}>
                  {CLASSES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="putRequests" className={lbl}>PUT Requests / mo</label>
                <input id="putRequests" type="number" min="0" step="1000" className={inp} value={inputs.putRequests}
                  onChange={(e) => setNum("putRequests", e.target.value)} />
              </div>
              <div>
                <label htmlFor="getRequests" className={lbl}>GET Requests / mo</label>
                <input id="getRequests" type="number" min="0" step="1000" className={inp} value={inputs.getRequests}
                  onChange={(e) => setNum("getRequests", e.target.value)} />
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <ArrowUpRight className="h-3.5 w-3.5" /> Data Transfer
                    </div>
                    <div>
                      <label htmlFor="dataTransferOutGB" className={lbl}>Transfer Out to Internet (GB)</label>
                      <input id="dataTransferOutGB" type="number" min="0" step="10" className={inp}
                        value={inputs.dataTransferOutGB} onChange={(e) => setNum("dataTransferOutGB", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Cloud className="h-3.5 w-3.5" /> Lifecycle Policies
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="transitionToIA" className={lbl}>Objects &rarr; IA</label>
                        <input id="transitionToIA" type="number" min="0" step="1000" className={inp}
                          value={inputs.transitionToIA} onChange={(e) => setNum("transitionToIA", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="transitionToGlacier" className={lbl}>Objects &rarr; Glacier</label>
                        <input id="transitionToGlacier" type="number" min="0" step="1000" className={inp}
                          value={inputs.transitionToGlacier} onChange={(e) => setNum("transitionToGlacier", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Settings2 className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock retrieval, versioning and per-object analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="objectCount" className={lbl}>Object Count</label>
                          <input id="objectCount" type="number" min="0" step="1000" className={inp}
                            value={inputs.objectCount} onChange={(e) => setNum("objectCount", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="retrievalGB" className={lbl}>Retrieved / mo (GB)</label>
                          <input id="retrievalGB" type="number" min="0" step="10" className={inp}
                            value={inputs.retrievalGB} onChange={(e) => setNum("retrievalGB", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="versioningOverheadPercent" className={lbl}>Versioning Overhead (%)</label>
                          <input id="versioningOverheadPercent" type="number" min="0" step="5" className={inp}
                            value={inputs.versioningOverheadPercent} onChange={(e) => setNum("versioningOverheadPercent", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5" /> Estimated Monthly Cost
              </div>
              <div className="text-4xl font-bold text-primary my-1">{money(result.monthlyTotal)}</div>
              <div className="text-sm text-muted-foreground">
                {spec.label} in US East (N. Virginia) — {money(result.annualTotal)} per year
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Storage Share</div>
                <div className={`text-lg font-bold ${storageShare >= 70 ? "text-emerald-600" : storageShare >= 40 ? "text-amber-600" : "text-red-600"}`}>
                  {storageShare.toFixed(0)}%
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Requests</div>
                <div className="text-lg font-bold text-foreground">{money(result.requestCost)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Egress Share</div>
                <div className={`text-lg font-bold ${transferShare <= 15 ? "text-emerald-600" : transferShare <= 40 ? "text-amber-600" : "text-red-600"}`}>
                  {transferShare.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 pr-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Total Monthly Cost</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{money(result.monthlyTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Cost Breakdown</h3>
                <LazyView minHeight={250}>
                  <ResponsiveContainer width="100%" height={250}>
                    <RPie>
                      <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                        {result.chartData.map((slice) => (
                          <Cell key={slice.name} fill={slice.color} />
                        ))}
                      </Pie>
                      <RTooltip formatter={(value: number) => money(value)} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    </RPie>
                  </ResponsiveContainer>
                </LazyView>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {result.chartData.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
                      {slice.name} — {slice.percent.toFixed(1)}%
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Per-Object &amp; Retention Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average Object Size</div>
                    <div className="text-base font-bold text-foreground">
                      {inputs.objectCount > 0 ? `${((inputs.storageGB * 1024) / inputs.objectCount).toFixed(2)} MB` : "n/a"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per Object / mo</div>
                    <div className="text-base font-bold text-foreground">
                      {inputs.objectCount > 0 ? `$${(result.monthlyTotal / inputs.objectCount).toFixed(6)}` : "n/a"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Minimum Storage Duration</div>
                    <div className="text-base font-bold text-foreground">
                      {spec.minDurationDays > 0 ? `${spec.minDurationDays} days` : "None"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Billable Storage w/ Versions</div>
                    <div className="text-base font-bold text-foreground">
                      {result.billableStorageGB.toLocaleString("en-US", { maximumFractionDigits: 0 })} GB
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Retrieval Rate</div>
                    <div className="text-base font-bold text-foreground">
                      {spec.retrievalRate > 0 ? `$${spec.retrievalRate.toFixed(3)}/GB` : "No retrieval fee"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Free Egress Consumed</div>
                    <div className="text-base font-bold text-emerald-600">
                      {result.freeTransferUsed.toFixed(0)} of {FREE_TRANSFER_GB} GB
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Mastering AWS S3 Storage Costs</h2>
            <p className="mb-4">
              Amazon S3 pricing rests on four pillars: storage volume, request volume, data transfer, and retrieval.
              Storage is charged per gigabyte per month and varies enormously by class, from Standard at roughly $0.023 per
              GB down to Glacier Deep Archive at less than $0.001 per GB. Requests are billed per thousand operations, with
              PUTs around $0.005 and GETs around $0.0004 per thousand. Data transfer out to the internet is free up to a
              monthly allowance, then runs roughly $0.09 per GB. Retrieval charges apply only to the colder classes and are
              the line item teams most often forget when modelling a migration to Glacier.
            </p>

            <h2 className="text-2xl font-bold mb-3">Choosing the Right Storage Class</h2>
            <p className="mb-4">
              S3 Standard suits frequently accessed data, offering immediate availability with no retrieval fee and no
              minimum duration. When data is touched less than once a month, Standard-IA or One Zone-IA roughly halves the
              storage rate while adding a retrieval fee and a 30-day minimum. Glacier Instant Retrieval serves archives
              accessed a few times a year with millisecond access at a much lower storage price, subject to a 90-day
              minimum. Deep Archive is the floor of the market for data touched once or twice annually, with a 180-day
              minimum and restore times measured in hours. Intelligent-Tiering shifts objects between tiers automatically
              based on real access patterns, trading a small per-object monitoring fee for the elimination of lifecycle
              guesswork.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Charges That Surprise People</h2>
            <p className="mb-4">
              Three costs account for most unexplained S3 bills. First, minimum storage durations mean that writing an
              object to Deep Archive and deleting it a week later still bills 180 days. Second, lifecycle transitions are
              charged per thousand objects rather than per gigabyte, so moving ten million small files to Glacier incurs
              roughly $500 in request fees before any savings begin. Third, versioning silently doubles or triples the
              storage line, because deleting a versioned object only writes a delete marker while every prior version keeps
              billing. Incomplete multipart uploads behave the same way and persist until a lifecycle rule aborts them.
            </p>

            <h2 className="text-2xl font-bold mb-3">Optimizing Your Monthly Bill</h2>
            <p>
              Start with the configuration-only wins: add a lifecycle rule to abort incomplete multipart uploads, expire
              non-current versions after a defined retention window, and transition genuinely cold data to IA or Glacier
              once you have confirmed the objects are large enough for transition fees to pay off. For read-heavy public
              workloads, placing CloudFront in front of the bucket usually lowers egress cost while improving latency,
              because CDN transfer is priced below direct S3 transfer. Model each scenario here before changing anything in
              production, paying particular attention to the average object size shown in Professional Mode, since that
              single number determines whether a cold-tier migration saves money or quietly costs more than it saves.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aws-s3-cost-calculator" />
          <PopularCalculators exclude="/calculator/aws-s3-cost-calculator" />
        </div>
      </div>
    </>
  );
}
