"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  adSpend: string;
  impressions: string;
  clicks: string;
  conversions: string;
  agencyFees: string;
  landingCosts: string;
  conversionValue: string;
}

interface Result {
  ctr: number;
  cvr: number;
  cpc: number;
  cpa: number;
  totalCost: number;
  effectiveCpa: number;
  revenue: number;
  roas: number;
}

const DEFAULTS: Inputs = {
  adSpend: "8000",
  impressions: "500000",
  clicks: "12000",
  conversions: "400",
  agencyFees: "800",
  landingCosts: "500",
  conversionValue: "75",
};

function calculate(inputs: Inputs): Result {
  const adSpend = Math.max(0, parseFloat(inputs.adSpend) || 0);
  const impressions = Math.max(0, parseFloat(inputs.impressions) || 0);
  const clicks = Math.max(0, parseFloat(inputs.clicks) || 0);
  const conversions = Math.max(0, parseFloat(inputs.conversions) || 0);
  const agencyFees = Math.max(0, parseFloat(inputs.agencyFees) || 0);
  const landingCosts = Math.max(0, parseFloat(inputs.landingCosts) || 0);
  const conversionValue = Math.max(0, parseFloat(inputs.conversionValue) || 0);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const cpc = clicks > 0 ? adSpend / clicks : 0;
  const cpa = conversions > 0 ? adSpend / conversions : 0;
  const totalCost = adSpend + agencyFees + landingCosts;
  const effectiveCpa = conversions > 0 ? totalCost / conversions : 0;
  const revenue = conversions * conversionValue;
  const roas = adSpend > 0 ? revenue / adSpend : 0;

  return { ctr, cvr, cpc, cpa, totalCost, effectiveCpa, revenue, roas };
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
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function CostPerAcquisitionCalculator() {
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
    num(inputs.adSpend) < 0 ||
    num(inputs.impressions) < 0 ||
    num(inputs.clicks) < 0 ||
    num(inputs.conversions) < 0 ||
    num(inputs.agencyFees) < 0 ||
    num(inputs.landingCosts) < 0 ||
    num(inputs.conversionValue) < 0;

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

  const rows: { label: string; value: string; total?: boolean; highlight?: boolean }[] = [
    { label: "Ad Spend", value: fmtMoney(num(inputs.adSpend)) },
    { label: "Agency Fees", value: fmtMoney(num(inputs.agencyFees)) },
    { label: "Landing Page & Tools", value: fmtMoney(num(inputs.landingCosts)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Impressions", value: fmt(Math.round(num(inputs.impressions))) },
    { label: "Clicks", value: fmt(Math.round(num(inputs.clicks))) },
    { label: "Conversions", value: fmt(Math.round(num(inputs.conversions))) },
    { label: "Click-Through Rate", value: fmt(result.ctr, 2) + "%" },
    { label: "Conversion Rate", value: fmt(result.cvr, 1) + "%" },
    { label: "Cost per Click", value: fmtMoney(result.cpc) },
    { label: "Cost per Acquisition", value: fmtMoney(result.cpa), highlight: true },
    { label: "Effective CPA (incl. fees)", value: fmtMoney(result.effectiveCpa) },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Ad Spend", value: fmtMoney(num(inputs.adSpend)) },
    { label: "Impressions", value: fmt(Math.round(num(inputs.impressions))) },
    { label: "Clicks", value: fmt(Math.round(num(inputs.clicks))) },
    { label: "Conversions", value: fmt(Math.round(num(inputs.conversions))) },
    { label: "CTR", value: fmt(result.ctr, 2) + "%" },
    { label: "Conversion Rate", value: fmt(result.cvr, 1) + "%" },
    { label: "CPC", value: fmtMoney(result.cpc) },
    { label: "CPA", value: fmtMoney(result.cpa) },
    { label: "Effective CPA", value: fmtMoney(result.effectiveCpa) },
    { label: "Revenue", value: fmtMoney(result.revenue) },
    { label: "ROAS", value: fmt(result.roas, 2) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost per Acquisition (CPA) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost per Acquisition (CPA) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpa-spend" label="Total Ad Spend" value={inputs.adSpend} onChange={set("adSpend")} prefix="$" />
              <NumInput id="cpa-impressions" label="Impressions" value={inputs.impressions} onChange={set("impressions")} suffix="impressions" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpa-clicks" label="Clicks" value={inputs.clicks} onChange={set("clicks")} suffix="clicks" />
              <NumInput id="cpa-conversions" label="Conversions" value={inputs.conversions} onChange={set("conversions")} suffix="conversions" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Campaign Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cpa-agency" label="Agency Fees" value={inputs.agencyFees} onChange={set("agencyFees")} prefix="$" />
                    <NumInput id="cpa-landing" label="Landing Page & Tools" value={inputs.landingCosts} onChange={set("landingCosts")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="cpa-value" label="Avg Conversion Value" value={inputs.conversionValue} onChange={set("conversionValue")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost per Acquisition</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.cpa)}</div>
              <div className="text-sm text-muted-foreground font-medium">across {fmt(Math.round(num(inputs.conversions)))} conversions</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Click</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.cpc)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Click-Through Rate</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.ctr, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.cvr, 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Campaign Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
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
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Cost per Acquisition (CPA) Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A cost per acquisition calculator works out what a single conversion costs across a paid campaign. Conversions are the actions that matter — a purchase, a signup, a demo booking — and CPA divides the total ad spend by the number of conversions produced. It is the purest measure of paid-channel efficiency because it combines two earlier funnel stages into one number: how cheaply you earn clicks and how well those clicks convert. The same CPA can hide very different funnels, which is why the calculator also reports the click-through rate, conversion rate, and cost per click that sit behind it. With the default inputs, $8,000 of ad spend producing 400 conversions costs $20 per acquisition, built on a 2.4% click-through rate, 500,000 impressions, and 12,000 clicks at 67 cents each. Adding the agency fees and landing page tools that support the campaign, the effective CPA rises to $23.25 — the difference between the number a media buyer reports and the number finance actually pays.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core figures — ad spend, impressions, clicks, and conversions — describe the full funnel. The click-through rate divides clicks by impressions, measuring how compelling the ad itself is. The conversion rate divides conversions by clicks, measuring how compelling the landing page is. Cost per click divides ad spend by clicks, and cost per acquisition divides it by conversions. The effective CPA adds the agency fees and landing page and tooling costs to the spend before dividing by conversions, capturing the true all-in cost of each customer. Revenue multiplies conversions by the average conversion value, and return on ad spend divides that revenue by the raw spend, giving the revenue-multiple view. With the defaults, the funnel produces $30,000 of revenue on $8,000 of spend, a ROAS of 3.75. The funnel logic is what makes the calculator useful: if CPA is climbing, either CPC is rising, the conversion rate is slipping, or both — and the breakdown shows which lever to pull.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The CPA number only means something against the value of a conversion. If each conversion is worth $75 in revenue, a $20 CPA leaves healthy margin; if the conversion is a free signup that monetizes at $5, the campaign loses money on every user. The effective CPA is the number to compare against customer lifetime value, using the same 3:1 LTV-to-CAC benchmark that applies to acquisition costs generally. Watch the two rates independently: a falling conversion rate with stable CPA means the traffic is getting cheaper but worse, usually a targeting or creative problem, while a rising CPC with stable conversion rate means the market is getting more expensive. Benchmark your CTR and CVR against your industry — display ads typically convert below 1%, search ads above 3%, and paid social somewhere between. Track CPA per campaign and per channel, not just blended, because the aggregate number hides winners subsidizing losers.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/cost-per-acquisition-cpa-calculator" />
        </div>
      </div>
    </>
  );
}