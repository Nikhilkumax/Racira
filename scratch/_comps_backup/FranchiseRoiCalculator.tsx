"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  investment: string;
  revenue: string;
  costs: string;
  royaltyPct: string;
  marketingPct: string;
  termYears: string;
  resaleValue: string;
}

interface Result {
  royalty: number;
  marketing: number;
  netProfit: number;
  roiPct: number;
  paybackYears: number;
  fiveYearProfit: number;
  termProfit: number;
  exitGain: number;
  exitRoiPct: number;
}

const DEFAULTS: Inputs = {
  investment: "350000",
  revenue: "600000",
  costs: "450000",
  royaltyPct: "8",
  marketingPct: "2",
  termYears: "10",
  resaleValue: "250000",
};

function calculate(inputs: Inputs): Result {
  const investment = Math.max(0, parseFloat(inputs.investment) || 0);
  const revenue = Math.max(0, parseFloat(inputs.revenue) || 0);
  const costs = Math.max(0, parseFloat(inputs.costs) || 0);
  const royaltyPct = Math.min(100, Math.max(0, parseFloat(inputs.royaltyPct) || 0));
  const marketingPct = Math.min(100, Math.max(0, parseFloat(inputs.marketingPct) || 0));
  const termYears = Math.max(0, parseFloat(inputs.termYears) || 0);
  const resaleValue = Math.max(0, parseFloat(inputs.resaleValue) || 0);

  const royalty = (revenue * royaltyPct) / 100;
  const marketing = (revenue * marketingPct) / 100;
  const netProfit = Math.max(0, revenue - costs - royalty - marketing);
  const roiPct = investment > 0 ? (netProfit / investment) * 100 : 0;
  const paybackYears = netProfit > 0 ? investment / netProfit : 0;
  const fiveYearProfit = netProfit * 5;
  const termProfit = netProfit * termYears;
  const exitGain = Math.max(0, fiveYearProfit + resaleValue - investment);
  const exitRoiPct = investment > 0 ? ((fiveYearProfit + resaleValue - investment) / investment) * 100 : 0;

  return { royalty, marketing, netProfit, roiPct, paybackYears, fiveYearProfit, termProfit, exitGain, exitRoiPct };
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

export default function FranchiseRoiCalculator() {
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
    num(inputs.investment) <= 0 ||
    num(inputs.revenue) < 0 ||
    num(inputs.costs) < 0 ||
    num(inputs.royaltyPct) < 0 || num(inputs.royaltyPct) > 100 ||
    num(inputs.marketingPct) < 0 || num(inputs.marketingPct) > 100 ||
    num(inputs.termYears) <= 0 ||
    num(inputs.resaleValue) < 0;

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
    { label: "Annual Revenue", value: fmtMoney(num(inputs.revenue)) },
    { label: "Annual Operating Costs", value: fmtMoney(num(inputs.costs)) },
    { label: `Royalty Fees (${fmt(num(inputs.royaltyPct), 1)}%)`, value: fmtMoney(result.royalty) },
    { label: `Marketing Fund (${fmt(num(inputs.marketingPct), 1)}%)`, value: fmtMoney(result.marketing) },
    { label: "Annual Net Profit", value: fmtMoney(result.netProfit), total: true },
    { label: "Annual ROI", value: result.roiPct.toFixed(1) + "%", highlight: true },
    { label: "Payback Period", value: result.paybackYears > 0 ? result.paybackYears.toFixed(1) + " years" : "—" },
    { label: "5-Year Total Profit", value: fmtMoney(result.fiveYearProfit) },
    { label: "5-Year Exit Gain (incl. resale)", value: fmtMoney(result.exitGain) },
    { label: "5-Year Exit ROI", value: result.exitRoiPct.toFixed(1) + "%" },
  ];

  const summaryStats = [
    { label: "Annual Revenue", value: fmtMoney(num(inputs.revenue)) },
    { label: "Annual Operating Costs", value: fmtMoney(num(inputs.costs)) },
    { label: "Royalty Fees", value: fmtMoney(result.royalty) },
    { label: "Marketing Fund", value: fmtMoney(result.marketing) },
    { label: "Annual Net Profit", value: fmtMoney(result.netProfit) },
    { label: "Annual ROI", value: result.roiPct.toFixed(1) + "%", bold: true },
    { label: "Payback Period", value: result.paybackYears > 0 ? result.paybackYears.toFixed(1) + " yrs" : "—" },
    { label: "5-Year Total Profit", value: fmtMoney(result.fiveYearProfit) },
    { label: "Profit Over Full Term", value: fmtMoney(result.termProfit) },
    { label: "5-Year Exit ROI", value: result.exitRoiPct.toFixed(1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Franchise ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Franchise ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="franchise-investment" label="Total Initial Investment" value={inputs.investment} onChange={set("investment")} prefix="$" />
              <NumInput id="franchise-revenue" label="Annual Revenue" value={inputs.revenue} onChange={set("revenue")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="franchise-costs" label="Annual Operating Costs" value={inputs.costs} onChange={set("costs")} prefix="$" />
              <NumInput id="franchise-royalty" label="Royalty Fee" value={inputs.royaltyPct} onChange={set("royaltyPct")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Franchise Structure</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="franchise-marketing" label="Marketing Fund" value={inputs.marketingPct} onChange={set("marketingPct")} suffix="%" />
                    <NumInput id="franchise-term" label="Franchise Term" value={inputs.termYears} onChange={set("termYears")} suffix="yrs" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Exit Planning</div>
                  <NumInput id="franchise-resale" label="Expected Resale Value" value={inputs.resaleValue} onChange={set("resaleValue")} prefix="$" />
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Total investment and franchise term must be greater than zero; all amounts must be non-negative; royalty and marketing percentages must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.roiPct.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">Based on {fmtMoney(result.netProfit)} in annual net profit on a {fmtMoney(num(inputs.investment))} investment</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Net Profit</span>
                <span className={`font-extrabold ${result.netProfit > 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.netProfit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payback Period</span>
                <span className="font-extrabold text-amber-600">{result.paybackYears > 0 ? result.paybackYears.toFixed(1) + " yrs" : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">5-Year Total Profit</span>
                <span className={`font-extrabold ${result.fiveYearProfit > 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.fiveYearProfit)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Franchise Financials</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[160px]">Amount</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Franchise ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A franchise ROI calculator estimates the financial return an owner can expect from purchasing and operating a franchise location. Buying a franchise is different from starting an independent business because the buyer pays an upfront fee for the right to use an established brand, operating system, and supplier network, and then continues to pay ongoing royalties on revenue. Those recurring payments are real costs that directly reduce the annual profit, so a return calculation that ignores them will overstate how attractive the deal actually is. This tool brings all of the major levers into one place: the total cash invested to open the doors, the revenue the location is expected to generate, the operating costs required to run it, and the royalty percentage owed to the franchisor. From those inputs it derives the annual net profit, the return on investment, the payback period, and multi-year projections that show how the deal performs over the life of the franchise agreement.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator starts with four core inputs. Total initial investment is the full amount of cash needed to open the location, including the initial franchise fee, leasehold improvements, equipment, inventory, training, and working capital. Annual revenue is the gross sales the location is expected to produce in a typical year, and annual operating costs cover wages, rent, utilities, supplies, insurance, and every other day-to-day expense except franchise fees. The royalty fee is the percentage of gross revenue paid to the franchisor, which typically falls between 4% and 12% depending on the brand. From these, the annual royalty payment is computed as revenue multiplied by the royalty percentage, and annual net profit is revenue minus operating costs minus royalty payments. The annual ROI is then net profit divided by total investment, and the payback period is total investment divided by net profit, telling you how many years of profit it takes to recover the cash you put in.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds three refinements. The marketing fund is the percentage of revenue many franchisors collect to fund national advertising, and it is subtracted alongside the royalty. The franchise term sets the length of the agreement so the calculator can show total profit over the full term rather than just a single year. The expected resale value is the price you realistically expect to sell the location for, which lets the tool estimate a five-year exit gain and exit ROI that includes the recovery of capital when you eventually leave the business. Together these advanced inputs turn a simple annual return figure into a complete picture of the investment, from opening day through the sale of the location.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the annual ROI, the return the location earns on your invested capital each year. A healthy franchise typically targets an ROI well above what you could earn in a passive investment, because it rewards you for the operational work and risk of running the business. The payback period puts that return in perspective: a three-year payback is generally considered strong, while anything beyond seven years means the deal carries meaningful risk and should be scrutinized carefully. The five-year exit gain shows what the investment is worth if you sell after five years, combining cumulative profit with the resale value of the location. Before you commit to any franchise opportunity, compare your projected figures against the franchisor's own financial disclosure documents, which are required by law and contain the average performance of existing locations. The numbers here are an estimate based on your assumptions, so the value of the tool is testing how the return holds up when revenue comes in lower or costs run higher than planned.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/franchise-roi-calculator" />
        </div>
      </div>
    </>
  );
}