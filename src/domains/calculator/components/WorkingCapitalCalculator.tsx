"use client";

import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

// ── 1. TypeScript interfaces ──────────────────────────────────────────────
interface WorkingCapitalInputs {
  currentAssets: number;
  currentLiabilities: number;
  inventory: number;
  receivables: number;
}

interface WorkingCapitalResult {
  workingCapital: number;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  nwcToAssets: number;
  liquidityLabel: string;
}

// ── 2. Pure calculation function ──────────────────────────────────────────
const calculate = (i: WorkingCapitalInputs): WorkingCapitalResult => {
  const workingCapital = i.currentAssets - i.currentLiabilities;
  const currentRatio = i.currentLiabilities > 0 ? i.currentAssets / i.currentLiabilities : 0;
  const quickAssets = i.currentAssets - i.inventory;
  const quickRatio = i.currentLiabilities > 0 ? quickAssets / i.currentLiabilities : 0;
  const cashRatio = i.currentLiabilities > 0 ? (i.currentAssets - i.inventory - i.receivables) / i.currentLiabilities : 0;
  const nwcToAssets = i.currentAssets > 0 ? workingCapital / i.currentAssets : 0;
  const liquidityLabel =
    currentRatio >= 1.5 && quickRatio >= 1 ? "Strong" : currentRatio >= 1 ? "Stable" : "At Risk";
  return { workingCapital, currentRatio, quickRatio, cashRatio, nwcToAssets, liquidityLabel };
};

// ── 3. DEFAULTS ────────────────────────────────────────────────────────────
const DEFAULTS: WorkingCapitalInputs = {
  currentAssets: 150000,
  currentLiabilities: 60000,
  inventory: 30000,
  receivables: 40000,
};

const fmt = (n: number, dec = 2) =>
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
  prefix,
  suffix,
  type = "number",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
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
export default function WorkingCapitalCalculator() {
  const [inputs, setInputs] = useState({
    currentAssets: String(DEFAULTS.currentAssets),
    currentLiabilities: String(DEFAULTS.currentLiabilities),
    inventory: String(DEFAULTS.inventory),
    receivables: String(DEFAULTS.receivables),
  });
  const [result, setResult] = useState<WorkingCapitalResult>(() => calculate(DEFAULTS));
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const parsed = {
    currentAssets: parse(inputs.currentAssets, 0),
    currentLiabilities: parse(inputs.currentLiabilities, 0),
    inventory: parse(inputs.inventory, 0),
    receivables: parse(inputs.receivables, 0),
  };

  const valErrors: Record<string, string> = {};
  if (parsed.currentAssets <= 0) valErrors.currentAssets = "Current Assets must be greater than 0";
  if (parsed.currentLiabilities <= 0) valErrors.currentLiabilities = "Current Liabilities must be greater than 0";
  const hasErrors = Object.keys(valErrors).length > 0;

  const handleCalculate = () => {
    setResult(calculate(parsed));
  };

  const reset = () => {
    setInputs({
      currentAssets: String(DEFAULTS.currentAssets),
      currentLiabilities: String(DEFAULTS.currentLiabilities),
      inventory: String(DEFAULTS.inventory),
      receivables: String(DEFAULTS.receivables),
    });
    setResult(calculate(DEFAULTS));
  };

  const handlePrint = () => {
    window.print();
  };

  const r = result;

  const faqs = [
    {
      question: "What happens if working capital is negative?",
      answer:
        "Negative working capital means short-term liabilities exceed short-term assets — the business may struggle to pay bills on time and may need a credit line or invoice financing to bridge the gap.",
    },
    {
      question: "Can a business have too much working capital?",
      answer:
        "Yes — idle cash earns little. Excess working capital is often better invested in growth or returned to owners, as long as a prudent buffer for unexpected costs is kept.",
    },
    {
      question: "What is a healthy current ratio?",
      answer:
        "A current ratio between 1.5 and 2.0 is the typical target. Above 2.0 usually signals idle assets, while below 1.0 means the business may not cover obligations due within a year.",
    },
    {
      question: "How often should I track working capital?",
      answer:
        "Monthly is standard for small businesses. Lenders and investors look at the trend over quarters, not a single snapshot, so consistent tracking matters more than any one reading.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator/business" }, { label: "Working Capital Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Working Capital Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div
            className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible"
            onKeyDown={(e) => { if (e.key === "Enter") handleCalculate(); }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <CompactInput id="current-assets" label="Current Assets" value={inputs.currentAssets} onChange={(v) => setInputs({ ...inputs, currentAssets: v })} prefix="$" />
                {valErrors.currentAssets && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.currentAssets}</p>}
              </div>
              <div className="flex flex-col">
                <CompactInput id="current-liabilities" label="Current Liabilities" value={inputs.currentLiabilities} onChange={(v) => setInputs({ ...inputs, currentLiabilities: v })} prefix="$" />
                {valErrors.currentLiabilities && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.currentLiabilities}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="inventory" label="Inventory" value={inputs.inventory} onChange={(v) => setInputs({ ...inputs, inventory: v })} prefix="$" />
              <CompactInput id="receivables" label="Accounts Receivable" value={inputs.receivables} onChange={(v) => setInputs({ ...inputs, receivables: v })} prefix="$" />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Working Capital</div>
              <div className="text-4xl font-bold text-primary">${fmt(r.workingCapital, 0)}</div>
              <div className="text-sm text-muted-foreground">Current Assets − Current Liabilities · Liquidity: <span className="font-semibold text-foreground">{r.liquidityLabel}</span></div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Ratio</span>
                <span className={`font-extrabold ${r.currentRatio >= 1.5 ? "text-emerald-600" : r.currentRatio >= 1 ? "text-orange-500" : "text-red-500"}`}>{fmt(r.currentRatio)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quick Ratio</span>
                <span className={`font-extrabold ${r.quickRatio >= 1 ? "text-emerald-600" : "text-red-500"}`}>{fmt(r.quickRatio)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cash Ratio</span>
                <span className="font-extrabold text-foreground">{fmt(r.cashRatio)}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-3 pl-4">Component</th>
                    <th className="p-3 pr-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Current Assets</td>
                    <td className="py-2.5 px-4 text-right font-semibold">${fmt(parsed.currentAssets, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Current Liabilities</td>
                    <td className="py-2.5 px-4 text-right font-semibold">−${fmt(parsed.currentLiabilities, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Inventory</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">${fmt(parsed.inventory, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Accounts Receivable</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">${fmt(parsed.receivables, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Quick Assets (CA − Inventory)</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">${fmt(parsed.currentAssets - parsed.inventory, 0)}</td>
                  </tr>
                  <tr className="bg-amber-500/10 border-t-2 border-border font-bold">
                    <td className="py-2.5 px-4 text-amber-700">Working Capital</td>
                    <td className="py-2.5 px-4 text-right text-amber-700">${fmt(r.workingCapital, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Working Capital:</span><span className="font-semibold">${fmt(r.workingCapital, 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Current Ratio:</span><span className="font-semibold">{fmt(r.currentRatio)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quick Ratio:</span><span className="font-semibold">{fmt(r.quickRatio)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cash Ratio:</span><span className="font-semibold">{fmt(r.cashRatio)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">NWC / Assets:</span><span className="font-semibold">{fmt(r.nwcToAssets)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Liquidity Verdict:</span><span className={`font-semibold ${r.liquidityLabel === "Strong" ? "text-emerald-600" : r.liquidityLabel === "Stable" ? "text-orange-500" : "text-red-500"}`}>{r.liquidityLabel}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is Working Capital?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Working capital is the cash a business has available to run its day-to-day operations after covering short-term obligations. It is simply current assets minus current liabilities: the money tied up in inventory, receivables, and cash that will be converted or spent within the next twelve months, less the bills, supplier invoices, and short-term debt due in the same window. A positive figure means the business can pay its near-term obligations without selling long-term assets or borrowing. A negative figure signals a cash crunch where suppliers and employees may go unpaid. Lenders, investors, and suppliers all watch this number because it is the clearest single measure of a company's short-term financial health and its ability to survive a slow month.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The core formula is Working Capital = Current Assets − Current Liabilities. Beyond that headline figure, analysts use liquidity ratios to judge how comfortably those obligations are covered. The current ratio divides total current assets by total current liabilities; a result between 1.5 and 2.0 is the traditional target. The quick ratio subtracts inventory before dividing, because inventory takes time to convert into cash and may sell at a discount; a quick ratio of 1.0 or higher is considered healthy. The cash ratio goes further and subtracts both inventory and receivables, measuring only cash-like assets against liabilities — the most conservative view, with readings of 0.2 to 0.5 being common. This calculator also shows net working capital as a share of total assets, which reveals how much of the balance sheet is tied up in short-term operations. Enter your asset and liability balances, press Calculate, and all four ratios update together so you can see the full liquidity picture at a glance.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                Read the verdict first: Strong means both the current and quick ratios clear their healthy thresholds, Stable means obligations are covered but the buffer is thin, and At Risk means current liabilities exceed what liquid assets can comfortably repay. Then compare the three ratios against each other. A strong current ratio but weak quick ratio means inventory is doing the heavy lifting — check how fast it turns over. A healthy cash ratio on top of that means genuine cash strength rather than paper assets. Watch the trend over several months rather than judging a single snapshot, and remember that seasonal businesses naturally swing between high and low working capital through the year. If working capital stays negative, prioritize collecting receivables, trimming inventory, and renegotiating payment terms with suppliers before growth spending.
              </p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/working-capital-calculator" />
          <PopularCalculators exclude="/calculator/working-capital-calculator" />
        </div>
      </div>
    </>
  );
}