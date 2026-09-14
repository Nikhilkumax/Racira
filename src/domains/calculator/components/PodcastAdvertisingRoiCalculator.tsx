"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  adCostPerEpisode: string;
  numberOfEpisodes: string;
  listenersPerEpisode: string;
  conversionRate: string;
  avgOrderValue: string;
  grossMargin: string;
  redemptionRate: string;
  productionCost: string;
}

interface Result {
  impressions: number;
  conversions: number;
  revenue: number;
  grossProfit: number;
  totalCost: number;
  roi: number;
  roas: number;
  costPerConversion: number;
  revenuePerListener: number;
}

const DEFAULTS: Inputs = {
  adCostPerEpisode: "1000",
  numberOfEpisodes: "4",
  listenersPerEpisode: "20000",
  conversionRate: "0.5",
  avgOrderValue: "80",
  grossMargin: "50",
  redemptionRate: "60",
  productionCost: "200",
};

function calculate(inputs: Inputs): Result {
  const adCostPerEpisode = Math.max(0, parseFloat(inputs.adCostPerEpisode) || 0);
  const numberOfEpisodes = Math.max(1, parseFloat(inputs.numberOfEpisodes) || 1);
  const listenersPerEpisode = Math.max(0, parseFloat(inputs.listenersPerEpisode) || 0);
  const conversionRate = Math.min(100, Math.max(0, parseFloat(inputs.conversionRate) || 0));
  const avgOrderValue = Math.max(0, parseFloat(inputs.avgOrderValue) || 0);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));
  const redemptionRate = Math.min(100, Math.max(0, parseFloat(inputs.redemptionRate) || 0));
  const productionCost = Math.max(0, parseFloat(inputs.productionCost) || 0);

  const impressions = listenersPerEpisode * numberOfEpisodes;
  const conversions = impressions * (conversionRate / 100) * (redemptionRate / 100);
  const revenue = conversions * avgOrderValue;
  const grossProfit = revenue * (grossMargin / 100);
  const totalCost = (adCostPerEpisode + productionCost) * numberOfEpisodes;
  const roi = totalCost > 0 ? ((grossProfit - totalCost) / totalCost) * 100 : 0;
  const roas = totalCost > 0 ? revenue / totalCost : 0;
  const costPerConversion = conversions > 0 ? totalCost / conversions : 0;
  const revenuePerListener = impressions > 0 ? revenue / impressions : 0;

  return { impressions, conversions, revenue, grossProfit, totalCost, roi, roas, costPerConversion, revenuePerListener };
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

export default function PodcastAdvertisingRoiCalculator() {
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
    num(inputs.adCostPerEpisode) < 0 ||
    num(inputs.numberOfEpisodes) <= 0 ||
    num(inputs.listenersPerEpisode) < 0 ||
    num(inputs.conversionRate) < 0 || num(inputs.conversionRate) > 100 ||
    num(inputs.avgOrderValue) < 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100 ||
    num(inputs.redemptionRate) < 0 || num(inputs.redemptionRate) > 100 ||
    num(inputs.productionCost) < 0;

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
    { label: "Ad Cost", value: fmtMoney(num(inputs.adCostPerEpisode) * num(inputs.numberOfEpisodes)) },
    { label: "Production Cost", value: fmtMoney(num(inputs.productionCost) * num(inputs.numberOfEpisodes)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Total Impressions", value: fmt(Math.round(result.impressions)) },
    { label: `Conversion Rate (${fmt(num(inputs.conversionRate), 1)}%)`, value: fmt(result.conversions, 1) + " conversions" },
    { label: `Promo Redemption (${fmt(num(inputs.redemptionRate))}%)`, value: fmt(num(inputs.redemptionRate)) + "%" },
    { label: "Revenue", value: fmtMoney(result.revenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
    { label: "Cost per Conversion", value: fmtMoney(result.costPerConversion) },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Ad Cost / Episode", value: fmtMoney(num(inputs.adCostPerEpisode)) },
    { label: "Number of Episodes", value: fmt(num(inputs.numberOfEpisodes)) },
    { label: "Listeners / Episode", value: fmt(Math.round(num(inputs.listenersPerEpisode))) },
    { label: "Conversion Rate", value: fmt(num(inputs.conversionRate), 1) + "%" },
    { label: "Avg Order Value", value: fmtMoney(num(inputs.avgOrderValue)) },
    { label: "Total Impressions", value: fmt(Math.round(result.impressions)) },
    { label: "Conversions", value: fmt(result.conversions, 1) },
    { label: "Revenue", value: fmtMoney(result.revenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "Cost per Conversion", value: fmtMoney(result.costPerConversion) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Podcast Advertising ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Podcast Advertising ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pa-adcost" label="Ad Cost per Episode" value={inputs.adCostPerEpisode} onChange={set("adCostPerEpisode")} prefix="$" />
              <NumInput id="pa-episodes" label="Number of Episodes" value={inputs.numberOfEpisodes} onChange={set("numberOfEpisodes")} suffix="episodes" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pa-listeners" label="Listeners per Episode" value={inputs.listenersPerEpisode} onChange={set("listenersPerEpisode")} suffix="listeners" />
              <NumInput id="pa-cvr" label="Conversion Rate" value={inputs.conversionRate} onChange={set("conversionRate")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pa-aov" label="Average Order Value" value={inputs.avgOrderValue} onChange={set("avgOrderValue")} prefix="$" />
              <NumInput id="pa-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Campaign Assumptions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="pa-redemption" label="Promo Code Redemption Rate" value={inputs.redemptionRate} onChange={set("redemptionRate")} suffix="%" />
                    <NumInput id="pa-production" label="Production Cost per Episode" value={inputs.productionCost} onChange={set("productionCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; number of episodes must be greater than zero; rates and margin must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Podcast Advertising ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.grossProfit)} gross profit on {fmtMoney(result.totalCost)} total cost</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Conversions</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.conversions, 1)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.revenue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Conversion</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerConversion)}</span>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Podcast Advertising ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A podcast advertising ROI calculator measures whether host-read ads and sponsorships earn back their cost. Podcast ads are sold per episode at rates based on audience size, so the investment grows with every episode you sponsor. The return comes from listeners who hear the ad, use the promo code or link, and buy — but not every listener converts and not every conversion is trackable, which is why the calculator applies both a conversion rate and a promo code redemption rate. Production costs, often overlooked in media buys, belong in the total alongside the media rate itself. In the default scenario, four episodes at $1,000 each with $200 of production per episode cost $4,800 in total, reach 80,000 listeners, and convert 240 of them into buyers at $80 each, producing $19,200 of revenue and $9,600 of gross profit at a 50% margin — a return of 100%, which is the realistic middle ground between podcast hype and outright losses.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">Total impressions are the listeners per episode multiplied by the number of episodes. The conversion rate converts a share of those impressions into actual purchases, and the promo code redemption rate then filters that further, because only a fraction of buyers use the code that proves the podcast drove the sale — the standard for attributing revenue in audio advertising. Revenue is conversions times the average order value, gross profit applies the margin, and total cost is the ad rate plus production cost multiplied by the number of episodes. Return on investment divides gross profit minus total cost by total cost. With the defaults, 80,000 impressions at a 0.5% conversion rate produce 400 buyers, of whom 60% use the code, leaving 240 attributed conversions and $19,200 in revenue. The cost per conversion of $20 is the number to compare against other channels: if your social or search campaigns acquire customers for less, the podcast's broader reach and brand lift must justify the difference.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">A 100% ROI means the campaign doubled its money in gross profit terms before operating costs; anything above zero is worth comparing against your alternative uses of the budget. Podcast advertising has a well-known attribution gap — many listeners hear the ad and buy later without the code, so the real return is almost always higher than the tracked number. Keep that in mind when the calculator shows a thin margin: the redemption rate assumption is where you can be honest or conservative. Listeners per episode deserves scrutiny too, since podcast platforms report downloads, and true listeners are typically 60–80% of downloads. If the cost per conversion looks high, consider shorter flight lengths, mid-roll placement, or a stronger offer — creative and placement move conversion more than audience size does. Re-run the calculation after the attribution window closes, and negotiate future rates using the per-listener revenue this calculator produces.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/podcast-advertising-roi-calculator" />
        </div>
      </div>
    </>
  );
}