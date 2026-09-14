"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  spend: string;
  views: string;
  impressions: string;
  clicks: string;
  conversions: string;
  viewRatePct: string;
}

interface Result {
  cpv: number;
  vpm: number;
  viewRatePct: number;
  ctrPct: number;
  conversionRatePct: number;
  costPerConversion: number;
  viewsPerDollar: number;
}

const DEFAULTS: Inputs = {
  spend: "2000",
  views: "260000",
  impressions: "400000",
  clicks: "5200",
  conversions: "65",
  viewRatePct: "65",
};

function calculate(inputs: Inputs): Result {
  const spend = Math.max(0, parseFloat(inputs.spend) || 0);
  const views = Math.max(0, parseFloat(inputs.views) || 0);
  const impressions = Math.max(0, parseFloat(inputs.impressions) || 0);
  const clicks = Math.max(0, parseFloat(inputs.clicks) || 0);
  const conversions = Math.max(0, parseFloat(inputs.conversions) || 0);
  const viewRatePct = Math.min(100, Math.max(0, parseFloat(inputs.viewRatePct) || 0));

  const cpv = views > 0 ? spend / views : 0;
  const vpm = impressions > 0 ? (views / impressions) * 1000 : 0;
  const ctrPct = views > 0 ? (clicks / views) * 100 : 0;
  const conversionRatePct = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const costPerConversion = conversions > 0 ? spend / conversions : 0;
  const viewsPerDollar = cpv > 0 ? 1 / cpv : 0;

  return { cpv, vpm, viewRatePct, ctrPct, conversionRatePct, costPerConversion, viewsPerDollar };
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
const fmtMoney = (n: number, dec = 3) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function CostPerViewCpvCalculator() {
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
    num(inputs.views) <= 0 ||
    num(inputs.impressions) < 0 ||
    num(inputs.clicks) < 0 ||
    num(inputs.conversions) < 0 ||
    num(inputs.viewRatePct) < 0 || num(inputs.viewRatePct) > 100;

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
    { label: "Total Spend", value: fmtMoney(num(inputs.spend), 0) },
    { label: "Video Views", value: fmt(num(inputs.views)) },
    { label: "Cost Per View (CPV)", value: fmtMoney(result.cpv), highlight: true },
    { label: "Views Per Dollar", value: fmt(result.viewsPerDollar) },
    { label: "Impressions", value: fmt(num(inputs.impressions)) },
    { label: "View Rate", value: result.viewRatePct.toFixed(1) + "%" },
    { label: "Views Per Mille (VPM)", value: fmt(result.vpm) },
    { label: "Clicks", value: fmt(num(inputs.clicks)) },
    { label: "Click-Through Rate", value: result.ctrPct.toFixed(2) + "%" },
    { label: "Conversions", value: fmt(num(inputs.conversions)) },
    { label: "Cost Per Conversion", value: fmtMoney(result.costPerConversion, 0) },
  ];

  const summaryStats = [
    { label: "CPV", value: fmtMoney(result.cpv) },
    { label: "Views / $", value: fmt(result.viewsPerDollar) },
    { label: "View Rate", value: result.viewRatePct.toFixed(1) + "%" },
    { label: "CTR", value: result.ctrPct.toFixed(2) + "%" },
    { label: "Conv. Rate", value: result.conversionRatePct.toFixed(2) + "%" },
    { label: "Cost / Conv.", value: fmtMoney(result.costPerConversion, 0) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost Per View (CPV) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost Per View (CPV) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpv-spend" label="Total Spend" value={inputs.spend} onChange={set("spend")} prefix="$" />
              <NumInput id="cpv-views" label="Video Views" value={inputs.views} onChange={set("views")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpv-impressions" label="Impressions" value={inputs.impressions} onChange={set("impressions")} />
              <NumInput id="cpv-clicks" label="Clicks" value={inputs.clicks} onChange={set("clicks")} />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Conversion Tracking</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cpv-conversions" label="Conversions" value={inputs.conversions} onChange={set("conversions")} />
                    <NumInput id="cpv-viewrate" label="View Rate" value={inputs.viewRatePct} onChange={set("viewRatePct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Spend and views must be greater than zero; impressions, clicks, and conversions must be non-negative; view rate must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost Per View</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.cpv)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.spend), 0)} across {fmt(num(inputs.views))} views</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Views / $</span>
                <span className="font-extrabold text-foreground">{fmt(result.viewsPerDollar)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">View Rate</span>
                <span className="font-extrabold text-foreground">{result.viewRatePct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Conv.</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerConversion, 0)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Video Campaign Metrics</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is Cost Per View?</h2>
              <p className="text-muted-foreground leading-relaxed">Cost per view (CPV) is the amount an advertiser pays each time a video ad is viewed, where a view is usually defined by the platform — YouTube counts a view at 30 seconds (or the full ad if it is shorter), while social platforms count a few seconds of playback. CPV is the billing model for TrueView-style video advertising, and it aligns advertiser cost with audience attention far better than impression pricing. CPV is calculated as spend divided by views. Typical YouTube TrueView CPVs run from $0.01 to $0.03 for broad targeting up to $0.10 or more for competitive niches, making video one of the cheapest attention formats on the market.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your spend and views for the headline CPV and the views-per-dollar figure. Providing impressions lets the calculator derive the view rate — the share of impressions that became views — which is the creative's report card: a low view rate means the first frames are not earning attention. Clicks and conversions extend the analysis into the full funnel: click-through rate measures how compelling the call to action is, and cost per conversion reveals what a video customer actually costs. Compare that to customer value to judge whether the video campaign is a profit engine or a vanity-metric playground.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">CPV vs Other Pricing Models</h2>
              <p className="text-muted-foreground leading-relaxed">CPV sits between CPM and CPC in the pricing spectrum. CPM charges for exposure whether or not anyone watches; CPC charges for clicks, which video formats rarely produce directly; CPV charges only for genuine attention. Because a view is closer to engagement than an impression, CPV rates look higher than CPMs but usually deliver better downstream performance. When comparing video campaigns to display, always normalize to cost per conversion or cost per engaged user rather than comparing raw rates, since a viewed video ad carries far more persuasion weight than a banner impression.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/cost-per-view-cpv-calculator" />
        </div>
      </div>
    </>
  );
}