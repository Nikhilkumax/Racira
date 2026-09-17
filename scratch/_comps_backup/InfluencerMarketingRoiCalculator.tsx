"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  influencerFee: string;
  campaignRevenue: string;
  cogsPct: string;
  managementCost: string;
  numberOfPosts: string;
  usageRights: string;
  boostSpend: string;
}

interface Result {
  cogsCost: number;
  totalCost: number;
  netProfit: number;
  roi: number;
  roas: number;
  costPerPost: number;
  revenuePerPost: number;
}

const DEFAULTS: Inputs = {
  influencerFee: "3000",
  campaignRevenue: "12000",
  cogsPct: "40",
  managementCost: "500",
  numberOfPosts: "4",
  usageRights: "500",
  boostSpend: "800",
};

function calculate(inputs: Inputs): Result {
  const influencerFee = Math.max(0, parseFloat(inputs.influencerFee) || 0);
  const campaignRevenue = Math.max(0, parseFloat(inputs.campaignRevenue) || 0);
  const cogsPct = Math.min(100, Math.max(0, parseFloat(inputs.cogsPct) || 0));
  const managementCost = Math.max(0, parseFloat(inputs.managementCost) || 0);
  const numberOfPosts = Math.max(1, parseFloat(inputs.numberOfPosts) || 1);
  const usageRights = Math.max(0, parseFloat(inputs.usageRights) || 0);
  const boostSpend = Math.max(0, parseFloat(inputs.boostSpend) || 0);

  const cogsCost = campaignRevenue * (cogsPct / 100);
  const totalCost = influencerFee + cogsCost + managementCost + usageRights + boostSpend;
  const netProfit = campaignRevenue - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const roas = totalCost > 0 ? campaignRevenue / totalCost : 0;
  const costPerPost = totalCost / numberOfPosts;
  const revenuePerPost = campaignRevenue / numberOfPosts;

  return { cogsCost, totalCost, netProfit, roi, roas, costPerPost, revenuePerPost };
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

export default function InfluencerMarketingRoiCalculator() {
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
    num(inputs.influencerFee) < 0 ||
    num(inputs.campaignRevenue) < 0 ||
    num(inputs.cogsPct) < 0 || num(inputs.cogsPct) > 100 ||
    num(inputs.managementCost) < 0 ||
    num(inputs.numberOfPosts) <= 0 ||
    num(inputs.usageRights) < 0 ||
    num(inputs.boostSpend) < 0;

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
    { label: "Influencer Fee", value: fmtMoney(num(inputs.influencerFee)) },
    { label: `Product Cost (COGS ${fmt(num(inputs.cogsPct))}%)`, value: fmtMoney(result.cogsCost) },
    { label: "Campaign Management", value: fmtMoney(num(inputs.managementCost)) },
    { label: "Content Usage Rights", value: fmtMoney(num(inputs.usageRights)) },
    { label: "Paid Boost Spend", value: fmtMoney(num(inputs.boostSpend)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Campaign Revenue", value: fmtMoney(num(inputs.campaignRevenue)) },
    { label: "Net Profit", value: fmtMoney(result.netProfit) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
    { label: "Cost per Post", value: fmtMoney(result.costPerPost) },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Influencer Fee", value: fmtMoney(num(inputs.influencerFee)) },
    { label: "Campaign Revenue", value: fmtMoney(num(inputs.campaignRevenue)) },
    { label: "Product Cost (COGS)", value: fmtMoney(result.cogsCost) },
    { label: "Campaign Management", value: fmtMoney(num(inputs.managementCost)) },
    { label: "Content Usage Rights", value: fmtMoney(num(inputs.usageRights)) },
    { label: "Paid Boost Spend", value: fmtMoney(num(inputs.boostSpend)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "Net Profit", value: fmtMoney(result.netProfit) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "ROAS", value: fmt(result.roas, 2) },
    { label: "Cost per Post", value: fmtMoney(result.costPerPost) },
    { label: "Revenue per Post", value: fmtMoney(result.revenuePerPost) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Influencer Marketing ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Influencer Marketing ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="im-fee" label="Influencer Fee" value={inputs.influencerFee} onChange={set("influencerFee")} prefix="$" />
              <NumInput id="im-revenue" label="Campaign Revenue" value={inputs.campaignRevenue} onChange={set("campaignRevenue")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="im-cogs" label="Product Cost (COGS)" value={inputs.cogsPct} onChange={set("cogsPct")} suffix="% of revenue" />
              <NumInput id="im-management" label="Campaign Management Cost" value={inputs.managementCost} onChange={set("managementCost")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Campaign Details</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="im-posts" label="Number of Posts" value={inputs.numberOfPosts} onChange={set("numberOfPosts")} suffix="posts" />
                    <NumInput id="im-usage" label="Content Usage Rights" value={inputs.usageRights} onChange={set("usageRights")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="im-boost" label="Paid Boost Spend" value={inputs.boostSpend} onChange={set("boostSpend")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; number of posts must be greater than zero; COGS must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Influencer Marketing ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.netProfit)} net profit on {fmtMoney(result.totalCost)} total cost</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROAS</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.roas, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Profit</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.netProfit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Post</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerPost)}</span>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Influencer Marketing ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An influencer marketing ROI calculator determines whether a creator campaign earned back more than it cost. The headline number — the influencer fee — is only one part of the total investment. The full cost also includes the product given away or sold at cost, the campaign management time, licensing the content for your own channels, and any paid boost that amplifies the posts beyond the creator's organic reach. On the return side, the campaign revenue must cover all of those layers before the partnership is profitable. With the default scenario, a $3,000 fee on a campaign that drives $12,000 of revenue has plenty of headroom, but once product costs, management, usage rights, and boosting are counted, the total cost rises to $6,600 and the true return lands at 81.8% — still strong, but the margin is thinner than the fee alone suggests, which is exactly the point of running the full calculation.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The product cost is the campaign revenue multiplied by the COGS percentage, capturing the inventory that leaves the business at cost. Total cost is the sum of the influencer fee, product cost, campaign management, content usage rights, and paid boost spend. Net profit subtracts total cost from campaign revenue, and ROI divides net profit by total cost, expressed as a percentage. Return on ad spend divides revenue by total cost, showing how many dollars came back for every dollar invested. Dividing total cost and revenue by the number of posts produces the per-post economics, which is the fairest way to compare creators who charge different rates for different post counts — a $3,000 fee across four posts costs $1,650 per post once all campaign costs are allocated, and each post needs to return $3,000 of revenue to justify the spend. Tracking these per-post figures across creators builds a benchmark table that makes future negotiation faster and more disciplined.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">A positive ROI means the campaign generated more revenue than its full cost; the margin of safety is how far above zero the percentage sits. Content usage rights deserve special attention because they can transform a one-off campaign into a year of repurposed assets — a $500 license that feeds six months of paid social is frequently the highest-ROI line in the entire budget, even though it looks like pure cost on this page. The cost per post is the number to benchmark: top creators justify premium per-post costs with premium conversion, so compare cost per post against revenue per post across creators rather than judging fees alone. If ROI is negative, examine each layer in order — product cost and boost spend are the most controllable, while the fee reflects the creator's market rate. Re-run the calculation after the full attribution window closes, since influencer-driven sales often arrive in waves across several weeks rather than in the first few days.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/influencer-marketing-roi-calculator" />
        </div>
      </div>
    </>
  );
}