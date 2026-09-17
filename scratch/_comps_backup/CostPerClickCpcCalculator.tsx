"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  spend: string;
  clicks: string;
  impressions: string;
  conversions: string;
}

interface Result {
  cpc: number;
  cpm: number;
  ctrPct: number;
  conversionRatePct: number;
  costPerConversion: number;
  averagePosition: number;
  impressionsFromClicks: number;
}

const DEFAULTS: Inputs = {
  spend: "2500",
  clicks: "5200",
  impressions: "180000",
  conversions: "180",
};

function calculate(inputs: Inputs): Result {
  const spend = Math.max(0, parseFloat(inputs.spend) || 0);
  const clicks = Math.max(0, parseFloat(inputs.clicks) || 0);
  const impressions = Math.max(0, parseFloat(inputs.impressions) || 0);
  const conversions = Math.max(0, parseFloat(inputs.conversions) || 0);

  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctrPct = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRatePct = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const costPerConversion = conversions > 0 ? spend / conversions : 0;
  const impressionsFromClicks = impressions > 0 ? impressions : clicks * 40;

  return { cpc, cpm, ctrPct, conversionRatePct, costPerConversion, averagePosition: 2.4, impressionsFromClicks };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number, dec = 2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function CostPerClickCpcCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.spend) <= 0 ||
    num(inputs.clicks) <= 0 ||
    num(inputs.impressions) < 0 ||
    num(inputs.conversions) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const handlePrint = () => window.print();

  const rows = [
    { label: "Total Ad Spend", value: fmtMoney(num(inputs.spend), 0) },
    { label: "Total Clicks", value: fmt(num(inputs.clicks)) },
    { label: "Total Impressions", value: fmt(num(inputs.impressions)) },
    { label: "Conversions", value: fmt(num(inputs.conversions)) },
    { label: "Cost Per Click (CPC)", value: fmtMoney(result.cpc), highlight: true },
    { label: "Cost Per Mille (CPM)", value: fmtMoney(result.cpm) },
    { label: "Click-Through Rate", value: result.ctrPct.toFixed(2) + "%" },
    { label: "Conversion Rate", value: result.conversionRatePct.toFixed(2) + "%" },
    { label: "Cost Per Conversion", value: fmtMoney(result.costPerConversion) },
  ];

  const summaryStats = [
    { label: "CPC", value: fmtMoney(result.cpc) },
    { label: "CPM", value: fmtMoney(result.cpm) },
    { label: "CTR", value: result.ctrPct.toFixed(2) + "%" },
    { label: "Conv. Rate", value: result.conversionRatePct.toFixed(2) + "%" },
    { label: "Cost / Conv.", value: fmtMoney(result.costPerConversion) },
    { label: "Total Spend", value: fmtMoney(num(inputs.spend), 0) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost Per Click (CPC) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost Per Click (CPC) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpc-spend" label="Total Ad Spend" value={inputs.spend} onChange={set("spend")} prefix="$" />
              <NumInput id="cpc-clicks" label="Total Clicks" value={inputs.clicks} onChange={set("clicks")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpc-impressions" label="Total Impressions" value={inputs.impressions} onChange={set("impressions")} />
              <NumInput id="cpc-conversions" label="Conversions" value={inputs.conversions} onChange={set("conversions")} />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Benchmarks</div>
                  <p className="text-sm text-muted-foreground">Average CPC by industry (Google Ads, 2024): Legal $6.75, Finance $3.44, Technology $2.05, Retail $1.16, E-commerce $1.27. Benchmarks help you judge whether your CPC is competitive for your sector.</p>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Ad spend and clicks must be greater than zero; impressions and conversions must be non-negative.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost Per Click</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.cpc)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.spend), 0)} across {fmt(num(inputs.clicks))} clicks</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CPM</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.cpm)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CTR</span>
                <span className={`font-extrabold ${result.ctrPct > 1 ? "text-emerald-600" : "text-amber-600"}`}>{result.ctrPct.toFixed(2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Conv.</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.costPerConversion)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Campaign Metrics</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={r.highlight ? "bg-amber-500/10" : ""}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is Cost Per Click?</h2>
              <p className="text-muted-foreground leading-relaxed">Cost per click (CPC) is the amount an advertiser pays each time someone clicks on an ad. It is the pricing model used by Google Ads, Microsoft Advertising, and most social platforms: the advertiser sets a maximum bid, and the platform charges an amount determined by an auction that balances bid, ad quality, and expected click-through rate. The actual CPC an advertiser pays is usually lower than the maximum bid, because second-price auction mechanics mean you only pay one cent more than the next-highest qualified competitor. CPC is calculated as total spend divided by total clicks, and it is one of the three headline metrics — alongside CPM and CPA — that define the economics of paid acquisition.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your total ad spend, the number of clicks the campaign produced, and optionally the impressions and conversions. The calculator derives CPC as spend divided by clicks, CPM as spend per thousand impressions, and click-through rate as clicks divided by impressions. When conversion data is provided it also reports the conversion rate and the cost per conversion, which is the number that actually matters for profitability — a low CPC is meaningless if those clicks do not convert. Use the results to compare campaigns against each other and against industry benchmarks for your sector.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">CPC Benchmarks and Interpretation</h2>
              <p className="text-muted-foreground leading-relaxed">Average CPCs vary widely by industry because they reflect both competition and the value of the customer being acquired. Legal keywords routinely cost $6–7 per click, finance around $3.50, while retail and e-commerce often sit near $1. A higher CPC can be entirely rational when the conversion rate and customer lifetime value justify it. The right way to evaluate CPC is therefore in combination with the conversion rate: multiply the two to get the cost per acquisition, and compare that against the profit a customer generates. This calculator makes that chain explicit so you can see exactly where your campaign economics break.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/cost-per-click-cpc-calculator" />
        </div>
      </div>
    </>
  );
}