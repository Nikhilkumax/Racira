"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  variableCostPerUnit: string;
  desiredMarginPct: string;
  overheadPct: string;
  expectedQty: string;
  competitorPrice: string;
  maxMarketPrice: string;
}

interface Result {
  costPlusPrice: number;
  priceFloor: number;
  marginAtFloor: number;
  revenueAtFloor: number;
  profitAtFloor: number;
  competitorGap: number;
  marketHeadroom: number;
}

const DEFAULTS: Inputs = {
  variableCostPerUnit: "25",
  desiredMarginPct: "40",
  overheadPct: "20",
  expectedQty: "5000",
  competitorPrice: "48",
  maxMarketPrice: "55",
};

function calculate(inputs: Inputs): Result {
  const variableCostPerUnit = Math.max(0, parseFloat(inputs.variableCostPerUnit) || 0);
  const desiredMarginPct = Math.min(100, Math.max(0, parseFloat(inputs.desiredMarginPct) || 0));
  const overheadPct = Math.min(1000, Math.max(0, parseFloat(inputs.overheadPct) || 0));
  const expectedQty = Math.max(0, parseFloat(inputs.expectedQty) || 0);
  const competitorPrice = Math.max(0, parseFloat(inputs.competitorPrice) || 0);
  const maxMarketPrice = Math.max(0, parseFloat(inputs.maxMarketPrice) || 0);

  const fullCost = variableCostPerUnit * (1 + overheadPct / 100);
  const costPlusPrice = fullCost / (1 - desiredMarginPct / 100);
  const priceFloor = fullCost;
  const marginAtFloor = priceFloor > 0 ? ((priceFloor - variableCostPerUnit) / priceFloor) * 100 : 0;
  const revenueAtFloor = priceFloor * expectedQty;
  const profitAtFloor = (priceFloor - fullCost) * expectedQty;
  const competitorGap = competitorPrice > 0 ? costPlusPrice - competitorPrice : 0;
  const marketHeadroom = maxMarketPrice > 0 ? maxMarketPrice - costPlusPrice : 0;

  return { costPlusPrice, priceFloor, marginAtFloor, revenueAtFloor, profitAtFloor, competitorGap, marketHeadroom };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const fmt2 = (n: number) => "$" + fmt(n, 2);

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

const CostPlusPricingCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.variableCostPerUnit) < 0 ||
    num(inputs.desiredMarginPct) < 0 || num(inputs.desiredMarginPct) >= 100 ||
    num(inputs.overheadPct) < 0 ||
    num(inputs.expectedQty) < 0 ||
    num(inputs.competitorPrice) < 0 ||
    num(inputs.maxMarketPrice) < 0;

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

  const breakdown = [
    { label: "Variable Cost per Unit", value: fmt2(result.priceFloor > 0 ? num(inputs.variableCostPerUnit) : 0) },
    { label: "Overhead Allocation", value: `${fmt(num(inputs.overheadPct), 1)}%` },
    { label: "Full Cost per Unit", value: fmt2(result.priceFloor) },
    { label: "Desired Margin", value: `${fmt(num(inputs.desiredMarginPct), 1)}%` },
    { label: "Price Floor (Full Cost)", value: fmt2(result.priceFloor) },
    { label: "Margin at Floor", value: `${fmt(result.marginAtFloor, 1)}%` },
    { label: "Expected Quantity", value: fmt(num(inputs.expectedQty)) },
    { label: "Revenue at Floor Price", value: fmtMoney(result.revenueAtFloor) },
    { label: "Competitor Gap", value: `${result.competitorGap >= 0 ? "+" : ""}${fmt2(result.competitorGap)}` },
    { label: "Market Headroom", value: `${result.marketHeadroom >= 0 ? "+" : ""}${fmt2(result.marketHeadroom)}` },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="variable-cost" label="Variable Cost per Unit" value={inputs.variableCostPerUnit} onChange={set("variableCostPerUnit")} prefix="$" />
            <NumInput id="desired-margin" label="Desired Margin" value={inputs.desiredMarginPct} onChange={set("desiredMarginPct")} suffix="%" />
            <NumInput id="overhead" label="Overhead" value={inputs.overheadPct} onChange={set("overheadPct")} suffix="%" />
            <NumInput id="expected-qty" label="Expected Quantity" value={inputs.expectedQty} onChange={set("expectedQty")} />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Market Check</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="competitor-price" label="Competitor Price" value={inputs.competitorPrice} onChange={set("competitorPrice")} prefix="$" />
                  <NumInput id="max-market-price" label="Max Market Price" value={inputs.maxMarketPrice} onChange={set("maxMarketPrice")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — margin must be below 100%.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Cost-Plus Price</div>
            <div className="text-4xl font-bold text-primary">{fmt2(result.costPlusPrice)}</div>
            <div className="text-sm text-muted-foreground mt-1">per unit at {fmt(num(inputs.desiredMarginPct), 1)}% margin on full cost</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Price Floor</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmt2(result.priceFloor)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Margin at Floor</div>
              <div className="text-lg font-bold mt-1">{fmt(result.marginAtFloor, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Revenue at Floor</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.revenueAtFloor)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Pricing Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Cost-Plus Price</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt2(result.costPlusPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Cost-Plus Price</div>
                <div className="text-base font-bold text-primary">{fmt2(result.costPlusPrice)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Cost-Plus Pricing?</h2>
            <p className="text-muted-foreground leading-relaxed">Cost-plus pricing sets a selling price by starting from the full cost of producing a unit and adding a target margin on top. The full cost is more than the variable cost of materials and direct labor — it also carries a share of overhead such as rent, utilities, equipment depreciation, and administrative support, which this calculator applies as a percentage of the variable cost. Once the full cost is known, the price is set so that the margin is a percentage of the final price rather than of the cost, which is how retail margins are conventionally quoted. Cost-plus is popular in manufacturing, contracting, and services because it guarantees a contribution on every unit and is easy to defend to stakeholders, though it can drift out of line with what the market will actually pay.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Cost-Plus Price Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculation runs in two stages. First, the full cost per unit is built by adding the overhead percentage to the variable cost: a $25 variable cost with 20 percent overhead gives a $30 full cost. Second, the price is found by dividing the full cost by one minus the desired margin: at a 40 percent margin, the price is $30 divided by 0.6, or $50. The margin is taken on the price because that is the standard convention — a 40 percent margin on a $50 price leaves $20 of contribution, which is 40 percent of the selling price and 66 percent of the cost. The calculator also reports the price floor (the full cost itself, below which every sale loses money), the revenue at the floor price for your expected quantity, and the competitive context: the gap between your cost-plus price and a competitor's price, and the headroom between your price and the maximum the market will bear. The advanced market inputs make it clear whether the mathematically derived price is actually sellable. For multi-product operations the same method applies line by line, and for services it converts directly into an hourly or project price: estimate the fully loaded cost of the engagement, apply the target margin, and quote. The method's main weakness is that it looks inward — cost determines price rather than the market setting the ceiling — which is precisely why the competitor and market inputs are included, so the outward check happens at the same moment the price is derived.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Start with the cost-plus price and check it against the market rows. If the price sits below the competitor's price with healthy headroom to the market ceiling, the margin target is realistic and the product can be launched at the full price. If the price exceeds the ceiling, you have three levers: raise the expected quantity to spread fixed overhead thinner, trim the overhead percentage, or accept a lower margin — the floor price shows exactly how low you can go before losing money. The margin-at-floor figure is the contribution rate you give up at the minimum viable price, and the revenue-at-floor line shows the cash the product would generate at that price across the expected quantity. For contract work, cost-plus pricing is also the basis of transparent billing: you show the client the cost build-up and the agreed margin, so the same numbers that drive this calculator can go straight into the proposal. When margins are thin, watch the overhead percentage closely — an underestimated overhead rate silently converts planned profit into a loss, which is why the full-cost build-up deserves the same scrutiny as the final price. Re-run the calculation whenever costs or volumes change materially, and keep the market inputs current, because a price that cleared the ceiling last quarter may be unsellable this one.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/cost-plus-pricing-calculator" />
      </div>
    </div>
  );
};

export default CostPlusPricingCalculator;