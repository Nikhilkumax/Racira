"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

// ── 1. TypeScript interfaces ──────────────────────────────────────────────
type HostingType = "shared" | "vps" | "dedicated" | "cloud";

interface HostingInputs {
  monthlyVisitors: number;
  avgPageSizeMb: number;
  hostingType: HostingType;
}

interface HostingResult {
  bandwidthGb: number;
  estLow: number;
  estHigh: number;
  annualLow: number;
  annualHigh: number;
  hostingLabel: string;
  scalability: string;
}

// ── 2. Pure calculation function ──────────────────────────────────────────
const COSTS: Record<HostingType, { low: number; high: number; label: string; scalability: string }> = {
  shared: { low: 3, high: 12, label: "Shared Hosting", scalability: "Limited" },
  vps: { low: 20, high: 80, label: "Managed VPS", scalability: "Good" },
  dedicated: { low: 100, high: 400, label: "Dedicated Server", scalability: "Excellent" },
  cloud: { low: 5, high: 100, label: "Cloud (AWS/GCP/Azure)", scalability: "Excellent" },
};

const calculate = (i: HostingInputs): HostingResult => {
  const bandwidthGb = (i.monthlyVisitors * i.avgPageSizeMb) / 1024;
  const cost = COSTS[i.hostingType];
  return {
    bandwidthGb,
    estLow: cost.low,
    estHigh: cost.high,
    annualLow: cost.low * 12,
    annualHigh: cost.high * 12,
    hostingLabel: cost.label,
    scalability: cost.scalability,
  };
};

// ── 3. DEFAULTS ────────────────────────────────────────────────────────────
const DEFAULTS: HostingInputs = {
  monthlyVisitors: 10000,
  avgPageSizeMb: 2,
  hostingType: "shared",
};

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const parse = (v: string, fallback: number) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// ── 4. Component ───────────────────────────────────────────────────────────
export default function WebsiteHostingCostCalculator() {
  const [inputs, setInputs] = useState({
    monthlyVisitors: String(DEFAULTS.monthlyVisitors),
    avgPageSizeMb: String(DEFAULTS.avgPageSizeMb),
    hostingType: DEFAULTS.hostingType,
  });
  const [result, setResult] = useState<HostingResult>(() => calculate(DEFAULTS));
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const parsed: HostingInputs = {
    monthlyVisitors: parse(inputs.monthlyVisitors, 0),
    avgPageSizeMb: parse(inputs.avgPageSizeMb, 0),
    hostingType: inputs.hostingType as HostingType,
  };

  const valErrors: Record<string, string> = {};
  if (parsed.monthlyVisitors <= 0) valErrors.monthlyVisitors = "Monthly visitors must be greater than 0";
  if (parsed.avgPageSizeMb <= 0) valErrors.avgPageSizeMb = "Average page size must be greater than 0";
  const hasErrors = Object.keys(valErrors).length > 0;

  const handleCalculate = () => {
    setResult(calculate(parsed));
  };

  const reset = () => {
    setInputs({
      monthlyVisitors: String(DEFAULTS.monthlyVisitors),
      avgPageSizeMb: String(DEFAULTS.avgPageSizeMb),
      hostingType: DEFAULTS.hostingType,
    });
    setResult(calculate(DEFAULTS));
  };

  const handlePrint = () => {
    window.print();
  };

  const r = result;

  const faqs = [
    {
      question: "What is the difference between shared and VPS hosting?",
      answer:
        "Shared hosting places your website on the same server as hundreds of other sites, sharing CPU, memory, and disk. A VPS (Virtual Private Server) carves out a dedicated slice of a server's resources, giving you predictable performance and better isolation from noisy neighbors.",
    },
    {
      question: "How much bandwidth does my website need?",
      answer:
        "Most small to medium websites use less than 10–20 GB per month. A 10,000-visitor site with 2 MB pages consumes about 19.5 GB, while large sites with high-resolution images or video can easily exceed 500 GB.",
    },
    {
      question: "Is cloud hosting more expensive?",
      answer:
        "Cloud hosting is pay-as-you-go. Small sites can run for a few dollars a month, but high-traffic sites with managed services and autoscaling can quickly exceed dedicated server pricing — the trade-off is near-infinite scalability.",
    },
    {
      question: "What does this estimate include?",
      answer:
        "The range covers typical monthly subscription pricing for each hosting tier. Domain registration, premium themes, managed security add-ons, and overage charges are not included, so your actual bill may sit at either edge of the range.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator/technology" }, { label: "Website Hosting Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Website Hosting Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div
            className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible"
            onKeyDown={(e) => { if (e.key === "Enter") handleCalculate(); }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <CompactInput id="monthly-visitors" label="Monthly Visitors" value={inputs.monthlyVisitors} onChange={(v) => setInputs({ ...inputs, monthlyVisitors: v })} />
                {valErrors.monthlyVisitors && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.monthlyVisitors}</p>}
              </div>
              <div className="flex flex-col">
                <CompactInput id="page-size" label="Avg Page Size (MB)" value={inputs.avgPageSizeMb} onChange={(v) => setInputs({ ...inputs, avgPageSizeMb: v })} suffix="MB" />
                {valErrors.avgPageSizeMb && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.avgPageSizeMb}</p>}
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="hosting-type" className="text-sm font-medium text-foreground mb-1">
                Hosting Type
              </label>
              <div className="relative">
                <select
                  id="hosting-type"
                  value={inputs.hostingType}
                  onChange={(e) => setInputs({ ...inputs, hostingType: e.target.value as HostingType })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium appearance-none pr-8"
                >
                  <option value="shared">Shared Hosting</option>
                  <option value="vps">Managed VPS</option>
                  <option value="dedicated">Dedicated Server</option>
                  <option value="cloud">Cloud (AWS/GCP/Azure)</option>
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4 print-section" ref={printRef}>
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Monthly Cost</div>
              <div className="text-4xl font-bold text-primary">${fmt(r.estLow)} – ${fmt(r.estHigh)}</div>
              <div className="text-sm text-muted-foreground">{r.hostingLabel} · annual range ${fmt(r.annualLow)} – ${fmt(r.annualHigh)}</div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bandwidth Used</span>
                <span className="font-extrabold text-foreground">{fmt(r.bandwidthGb, 1)} GB/mo</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hosting Tier</span>
                <span className="font-extrabold text-orange-500">{r.hostingLabel}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Scalability</span>
                <span className={`font-extrabold ${r.scalability === "Excellent" ? "text-emerald-600" : r.scalability === "Good" ? "text-orange-500" : "text-red-500"}`}>{r.scalability}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-3 pl-4">Metric</th>
                    <th className="p-3 pr-4 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Monthly Visitors</td>
                    <td className="py-2.5 px-4 text-right font-semibold">{fmt(parsed.monthlyVisitors)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Average Page Size</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{fmt(parsed.avgPageSizeMb, 1)} MB</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Bandwidth Consumption</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{fmt(r.bandwidthGb, 1)} GB/mo</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Hosting Type</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{r.hostingLabel}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Monthly Cost Range</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">${fmt(r.estLow)} – ${fmt(r.estHigh)}</td>
                  </tr>
                  <tr className="bg-amber-500/10 border-t-2 border-border font-bold">
                    <td className="py-2.5 px-4 text-amber-700">Annual Cost Range</td>
                    <td className="py-2.5 px-4 text-right text-amber-700">${fmt(r.annualLow)} – ${fmt(r.annualHigh)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Bandwidth / mo:</span><span className="font-semibold">{fmt(r.bandwidthGb, 1)} GB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cost / mo:</span><span className="font-semibold">${fmt(r.estLow)} – ${fmt(r.estHigh)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cost / year:</span><span className="font-semibold">${fmt(r.annualLow)} – ${fmt(r.annualHigh)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Hosting Tier:</span><span className="font-semibold">{r.hostingLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Scalability:</span><span className="font-semibold">{r.scalability}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SSL Certificate:</span><span className="font-semibold">Free (Let's Encrypt)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Website Hosting Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A website hosting cost calculator turns your traffic and page-size figures into a realistic monthly and annual hosting budget. Hosting pricing is not a single number — shared plans start around three dollars a month, managed VPS plans run twenty to eighty dollars, and dedicated servers cost hundreds — so the right budget depends on what your site actually needs. The two variables that matter most are how many visitors you serve each month and how heavy each page is, because together they determine bandwidth consumption. Multiply visitors by average page size and you know roughly how many gigabytes your server must push every month, which tells you whether a budget shared plan will suffice or whether you will hit bandwidth caps and slowdowns.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                Enter your monthly visitor count, your average page size in megabytes, and pick the hosting tier you are considering. The calculator estimates monthly bandwidth by multiplying visitors by page size and dividing by 1024 to convert to gigabytes — 10,000 visitors viewing 2 MB pages consume about 19.5 GB per month. It then applies the typical market range for your chosen tier: shared hosting runs about $3–$12 monthly, a managed VPS about $20–$80, a dedicated server about $100–$400, and cloud hosting about $5–$100 depending on usage. Monthly figures are multiplied by twelve for the annual view. The results are estimates rather than quotes — actual pricing varies by provider, contract length, and add-ons — but they give you a defensible planning range and a clear picture of how traffic growth will push you toward the next tier.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                Compare the bandwidth figure against your plan's allowance first. If your estimated consumption sits near or above the cap of your current tier, expect overage fees or forced upgrades. The scalability rating tells you how much room your chosen tier has before you must move up: shared hosting grows cramped quickly, a VPS handles a solid mid-size site, and dedicated or cloud setups scale furthest. Budget for the annual figure rather than the monthly one — hosting is usually billed yearly, and many providers discount multi-year contracts. If your site is just starting out, shared hosting is almost always the right call; move up only when performance metrics, not fear, tell you to.
              </p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/website-hosting-cost-calculator" />
          <PopularCalculators exclude="/calculator/website-hosting-cost-calculator" />
        </div>
      </div>
    </>
  );
}