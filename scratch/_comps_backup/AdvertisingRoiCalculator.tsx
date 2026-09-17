"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  adSpend: string;
  attributedRevenue: string;
  platformFees: string;
  creativeCosts: string;
  attributionRate: string;
  refundRate: string;
}

interface Result {
  totalCost: number;
  netRevenue: number;
  netProfit: number;
  roi: number;
  roas: number;
  breakEvenRevenue: number;
}

const DEFAULTS: Inputs = {
  adSpend: "10000",
  attributedRevenue: "35000",
  platformFees: "1500",
  creativeCosts: "1000",
  attributionRate: "85",
  refundRate: "5",
};

function calculate(inputs: Inputs): Result {
  const adSpend = Math.max(0, parseFloat(inputs.adSpend) || 0);
  const attributedRevenue = Math.max(0, parseFloat(inputs.attributedRevenue) || 0);
  const platformFees = Math.max(0, parseFloat(inputs.platformFees) || 0);
  const creativeCosts = Math.max(0, parseFloat(inputs.creativeCosts) || 0);
  const attributionRate = Math.min(100, Math.max(0, parseFloat(inputs.attributionRate) || 0));
  const refundRate = Math.min(100, Math.max(0, parseFloat(inputs.refundRate) || 0));

  const totalCost = adSpend + platformFees + creativeCosts;
  const netRevenue = attributedRevenue * (attributionRate / 100) * (1 - refundRate / 100);
  const netProfit = netRevenue - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const roas = adSpend > 0 ? netRevenue / adSpend : 0;
  const breakEvenRevenue = attributionRate > 0 ? totalCost / (attributionRate / 100) / (1 - refundRate / 100) : 0;

  return { totalCost, netRevenue, netProfit, roi, roas, breakEvenRevenue };
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

export default function AdvertisingRoiCalculator() {
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
    num(inputs.attributedRevenue) < 0 ||
    num(inputs.platformFees) < 0 ||
    num(inputs.creativeCosts) < 0 ||
    num(inputs.attributionRate) < 0 || num(inputs.attributionRate) > 100 ||
    num(inputs.refundRate) < 0 || num(inputs.refundRate) > 100;

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
    { label: "Platform & Agency Fees", value: fmtMoney(num(inputs.platformFees)) },
    { label: "Creative & Production Costs", value: fmtMoney(num(inputs.creativeCosts)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Attributed Revenue", value: fmtMoney(num(inputs.attributedRevenue)) },
    { label: `Attribution Rate (${fmt(num(inputs.attributionRate))}%)`, value: fmtMoney(num(inputs.attributedRevenue) * (num(inputs.attributionRate) / 100)) },
    { label: `Refund Rate (${fmt(num(inputs.refundRate))}%)`, value: "-" + fmtMoney(num(inputs.attributedRevenue) * (num(inputs.attributionRate) / 100) * (num(inputs.refundRate) / 100)) },
    { label: "Net Revenue", value: fmtMoney(result.netRevenue) },
    { label: "Net Profit", value: fmtMoney(result.netProfit) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Ad Spend", value: fmtMoney(num(inputs.adSpend)) },
    { label: "Platform & Agency Fees", value: fmtMoney(num(inputs.platformFees)) },
    { label: "Creative & Production", value: fmtMoney(num(inputs.creativeCosts)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "Attributed Revenue", value: fmtMoney(num(inputs.attributedRevenue)) },
    { label: "Attribution Rate", value: fmt(num(inputs.attributionRate)) + "%" },
    { label: "Refund Rate", value: fmt(num(inputs.refundRate)) + "%" },
    { label: "Net Revenue", value: fmtMoney(result.netRevenue) },
    { label: "Net Profit", value: fmtMoney(result.netProfit) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "ROAS", value: fmt(result.roas, 2) },
    { label: "Break-Even Revenue", value: fmtMoney(result.breakEvenRevenue) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Advertising ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Advertising ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ar-spend" label="Total Ad Spend" value={inputs.adSpend} onChange={set("adSpend")} prefix="$" />
              <NumInput id="ar-revenue" label="Attributed Revenue" value={inputs.attributedRevenue} onChange={set("attributedRevenue")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ar-fees" label="Platform & Agency Fees" value={inputs.platformFees} onChange={set("platformFees")} prefix="$" />
              <NumInput id="ar-creative" label="Creative & Production Costs" value={inputs.creativeCosts} onChange={set("creativeCosts")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Revenue & Attribution</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ar-attribution" label="Attribution Rate" value={inputs.attributionRate} onChange={set("attributionRate")} suffix="%" />
                    <NumInput id="ar-refund" label="Refund / Return Rate" value={inputs.refundRate} onChange={set("refundRate")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; attribution rate and refund rate must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Advertising ROI</div>
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Revenue</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.netRevenue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Break-Even Revenue</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.breakEvenRevenue)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost & Revenue Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Advertising ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An advertising ROI calculator measures whether paid campaigns are actually making money after every cost is counted. The obvious cost is the ad spend itself, but the real return calculation also includes platform and agency fees and the creative and production work behind the campaign. On the revenue side, most platforms overstate what advertising truly contributed, so the calculator applies an attribution rate that discounts revenue the ads assisted but did not drive, and a refund rate that removes the portion of attributed sales that end up returned or charged back. The result is a net-profit-based ROI rather than the optimistic headline numbers platforms report. With the defaults, $10,000 in ad spend, $1,500 in fees, and $1,000 in creative costs faces $35,000 of platform-attributed revenue, which shrinks to $28,262 after an 85% attribution rate and a 5% refund rate — still a 126% return, but a very different number than the 280% a naive spend-versus-revenue calculation would claim.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">Total cost is the sum of ad spend, platform and agency fees, and creative and production costs. Net revenue applies the attribution rate first — multiplying the reported revenue by the share you believe the ads genuinely drove — and then subtracts refunds by multiplying by one minus the refund rate. Return on investment divides the net profit by the total cost and expresses it as a percentage, using the standard (gain minus cost) over cost formula. The return on ad spend, or ROAS, divides net revenue by the raw ad spend only, which is the number agencies and platforms like to quote because it ignores fees and creative. The break-even revenue figure works the calculation backward: it shows how much reported revenue the campaign needed to produce in order to cover its total cost, given the same attribution and refund assumptions. Anything above break-even is profit, and the distance between the actual attributed revenue and break-even is the campaign's true margin of safety.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">A positive ROI means the campaign earned back its full cost plus profit; a negative one means the campaign destroyed cash even if the platform reports impressive volume. The gap between ROAS and ROI is itself informative — if ROAS looks healthy but ROI is thin, fees and creative costs are eating the margin, and the fix is operational rather than creative. The break-even revenue is the floor for campaign planning: set the target above it and keep the attribution assumptions honest, because inflating attribution is the most common way advertising ROI reports deceive their own authors. Compare the ROI across campaigns and channels rather than in isolation, and weight the comparison by scale — a small campaign at 200% ROI beats a large one at 40% if capital is scarce. Re-run the calculation after refunds settle rather than on the day the campaign closes, since return rates for some categories arrive weeks later and can flip a marginal winner into a loser.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/advertising-roi-calculator" />
        </div>
      </div>
    </>
  );
}