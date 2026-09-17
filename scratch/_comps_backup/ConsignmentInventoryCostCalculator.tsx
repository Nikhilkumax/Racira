"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, PackageCheck, Printer, Info } from "lucide-react";
import {
  BarChart as RBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ConsignmentInputs {
  inventoryValue: string;
  holdingRate: string;
  months: string;
  spoilageRate: string;
  // Tier 2A
  shrinkageBorneBySupplier: string; // percent of shrinkage the supplier eats
  freightOut: string;
  returnFreight: string;
  returnRate: string;
  // Tier 2B
  proMode: boolean;
  retailerMarginPercent: string;
  shelfOpportunityRate: string;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface ChartRow {
  id: string;
  name: string;
  Supplier: number;
  Retailer: number;
}

interface ConsignmentResults {
  holdingCost: number;
  spoilageCost: number;
  supplierShrinkage: number;
  retailerShrinkage: number;
  freightCost: number;
  returnCost: number;
  totalSupplierCost: number;
  totalRetailerCost: number;
  costAsPercentOfInventory: number;
  effectiveAnnualisedDrag: number;
  breakEvenMarginUplift: number;
  retailerShelfCost: number;
  retailerGrossProfit: number;
  chartData: ChartRow[];
  rows: TableRow[];
}

const DEFAULTS: ConsignmentInputs = {
  inventoryValue: "75000",
  holdingRate: "12",
  months: "4",
  spoilageRate: "5",
  shrinkageBorneBySupplier: "100",
  freightOut: "1200",
  returnFreight: "900",
  returnRate: "15",
  proMode: false,
  retailerMarginPercent: "40",
  shelfOpportunityRate: "8",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const money2 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const calculateConsignment = (v: ConsignmentInputs): ConsignmentResults => {
  const inventoryValue = Math.max(0, parseFloat(v.inventoryValue) || 0);
  const holdingRate = Math.max(0, parseFloat(v.holdingRate) || 0);
  const months = Math.max(0, parseFloat(v.months) || 0);
  const spoilageRate = Math.max(0, parseFloat(v.spoilageRate) || 0);
  const supplierShare = Math.min(100, Math.max(0, parseFloat(v.shrinkageBorneBySupplier) || 0));
  const freightOut = Math.max(0, parseFloat(v.freightOut) || 0);
  const returnFreight = Math.max(0, parseFloat(v.returnFreight) || 0);
  const returnRate = Math.min(100, Math.max(0, parseFloat(v.returnRate) || 0));
  const retailerMargin = Math.max(0, parseFloat(v.retailerMarginPercent) || 0);
  const shelfRate = Math.max(0, parseFloat(v.shelfOpportunityRate) || 0);

  // Cost of capital tied up for the sell-through period
  const holdingCost = inventoryValue * (holdingRate / 100) * (months / 12);

  // Total shrinkage/obsolescence, then split by whatever the contract says
  const spoilageCost = inventoryValue * (spoilageRate / 100);
  const supplierShrinkage = spoilageCost * (supplierShare / 100);
  const retailerShrinkage = spoilageCost - supplierShrinkage;

  const freightCost = freightOut;
  // Unsold goods come back, and someone pays to ship them
  const returnCost = returnFreight * (returnRate / 100);

  const totalSupplierCost = holdingCost + supplierShrinkage + freightCost + returnCost;

  // The retailer's real exposure: shelf space has an opportunity cost even at zero capital
  const retailerShelfCost = v.proMode ? inventoryValue * (shelfRate / 100) * (months / 12) : 0;
  const totalRetailerCost = retailerShrinkage + retailerShelfCost;

  const costAsPercentOfInventory = inventoryValue > 0 ? (totalSupplierCost / inventoryValue) * 100 : 0;
  // Annualised drag on the supplier's capital
  const effectiveAnnualisedDrag = months > 0 ? costAsPercentOfInventory * (12 / months) : 0;
  // Extra wholesale margin needed just to stay whole on the consignment terms
  const breakEvenMarginUplift = costAsPercentOfInventory;

  const retailerGrossProfit = v.proMode ? inventoryValue * (retailerMargin / 100) : 0;

  const chartData: ChartRow[] = [
    { id: "capital", name: "Capital tied up", Supplier: Math.round(inventoryValue), Retailer: 0 },
    { id: "holding", name: "Holding cost", Supplier: Math.round(holdingCost), Retailer: 0 },
    { id: "shrink", name: "Shrinkage risk", Supplier: Math.round(supplierShrinkage), Retailer: Math.round(retailerShrinkage) },
    { id: "freight", name: "Freight & returns", Supplier: Math.round(freightCost + returnCost), Retailer: 0 },
    ...(v.proMode ? [{ id: "shelf", name: "Shelf opportunity", Supplier: 0, Retailer: Math.round(retailerShelfCost) }] : []),
  ];

  const rows: TableRow[] = [
    { rowId: "value", label: "Wholesale inventory value placed", value: money(inventoryValue) },
    { rowId: "months", label: "Estimated months to sell through", value: `${months} months` },
    { rowId: "holding", label: `Cost of capital (${holdingRate}% APR × ${months}/12)`, value: money2(holdingCost) },
    { rowId: "spoilage-total", label: `Total shrinkage / obsolescence (${spoilageRate}%)`, value: money2(spoilageCost) },
    { rowId: "spoilage-sup", label: `— borne by supplier (${supplierShare}%)`, value: money2(supplierShrinkage) },
    { rowId: "spoilage-ret", label: `— borne by retailer (${(100 - supplierShare).toFixed(0)}%)`, value: money2(retailerShrinkage) },
    { rowId: "freight", label: "Outbound freight", value: money2(freightCost) },
    { rowId: "returns", label: `Return freight (${returnRate}% unsold)`, value: money2(returnCost) },
    { rowId: "supplier", label: "Total supplier cost and risk", value: money2(totalSupplierCost), key: true },
    ...(v.proMode
      ? [
          { rowId: "shelf", label: `Retailer shelf opportunity cost (${shelfRate}% APR)`, value: money2(retailerShelfCost) },
          { rowId: "retailer", label: "Total retailer cost and risk", value: money2(totalRetailerCost) },
          { rowId: "retgp", label: `Retailer gross profit at ${retailerMargin}% margin`, value: money2(retailerGrossProfit) },
        ]
      : [{ rowId: "retailer", label: "Total retailer cost and risk", value: money2(totalRetailerCost) }]),
    { rowId: "pct", label: "Supplier cost as % of inventory value", value: `${costAsPercentOfInventory.toFixed(2)}%` },
    { rowId: "annualised", label: "Annualised drag on supplier capital", value: `${effectiveAnnualisedDrag.toFixed(2)}%` },
    { rowId: "uplift", label: "Margin uplift needed to break even", value: `+${breakEvenMarginUplift.toFixed(2)} pts`, total: true },
  ];

  return {
    holdingCost, spoilageCost, supplierShrinkage, retailerShrinkage, freightCost, returnCost,
    totalSupplierCost, totalRetailerCost, costAsPercentOfInventory, effectiveAnnualisedDrag,
    breakEvenMarginUplift, retailerShelfCost, retailerGrossProfit, chartData, rows,
  };
};

interface TooltipEntry {
  name: string;
  value: number;
  fill: string;
  payload: ChartRow;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
        <p className="mb-2 text-foreground font-bold border-b border-border pb-1">{payload[0].payload.name}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex justify-between gap-4 mb-1">
            <span style={{ color: entry.fill }}>{entry.name}:</span>
            <span className="text-foreground">{money(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, hint }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const FAQS = [
  {
    question: "What is consignment inventory?",
    answer:
      "Consignment is an arrangement where a supplier places goods in a retailer's store but retains legal ownership until a customer buys them. The retailer pays only after the sale, keeping an agreed margin. It is common in fashion boutiques, art galleries, bookshops, automotive parts, and medical devices, and it is the standard route for an unproven brand trying to win shelf space it could not otherwise buy.",
  },
  {
    question: "Who actually bears the risk in a consignment deal?",
    answer:
      "Predominantly the supplier, but not exclusively — which is why this calculator models both sides. The supplier finances the inventory, absorbs the cost of capital, usually eats shrinkage, and pays freight in both directions. The retailer commits no capital, but shelf space is finite and has an opportunity cost: floor area holding slow-moving consigned stock is area not holding something that sells. Professional Mode quantifies that side too, because pretending retailer risk is exactly zero makes for a worse negotiation, not a better one.",
  },
  {
    question: "How is the cost of capital calculated?",
    answer:
      "Inventory value multiplied by your annual holding rate, prorated for the months the stock sits before selling. The holding rate should reflect your true cost of capital, not just a bank interest rate — include insurance, warehousing that would otherwise be freed, and the return you would earn deploying that money elsewhere. Manufacturers commonly use 15 to 25 percent annually; a well-capitalised business might use 8 to 12.",
  },
  {
    question: "What is shrinkage and who pays for it?",
    answer:
      "Shrinkage covers theft, damage, spoilage, and obsolescence — anything that leaves the inventory unsellable. Under most consignment contracts, the supplier absorbs it, because the goods remain their property. That default is negotiable and frequently should be negotiated: a retailer with no financial exposure to theft has little incentive to control it. Set the shrinkage-share field to whatever your contract actually says, and if it says 100 percent supplier, treat that as a term to push back on.",
  },
  {
    question: "How much extra margin should I demand for consignment terms?",
    answer:
      "At minimum, enough to cover the total cost as a percentage of inventory value — this calculator reports that as the required margin uplift. If consignment costs you 9 percent of inventory value, your wholesale margin needs to be 9 points higher than on a standard purchase-order deal simply to break even. Most suppliers should ask for more than break-even, because they are also absorbing the risk and the cash-flow uncertainty, neither of which is priced by the break-even figure.",
  },
  {
    question: "What happens if the store closes or goes bankrupt?",
    answer:
      "This is the scenario that ruins suppliers, and it turns on paperwork rather than good intentions. In the United States, consigned goods can be treated as property of the bankruptcy estate unless the supplier has perfected a security interest by filing a UCC-1 financing statement and giving notice to prior secured creditors. Without that filing, your inventory may be sold to satisfy the retailer's creditors while you queue as an unsecured claimant. File the UCC-1 before the goods ship.",
  },
  {
    question: "What is Vendor Managed Inventory and how does it differ?",
    answer:
      "VMI is a related model, common in grocery and large-format retail, where the supplier monitors shelf levels and automatically replenishes. It can be structured with or without consignment terms. The distinction matters: VMI is about who decides replenishment, consignment is about who owns the stock and when payment occurs. A VMI arrangement on standard purchase-order terms transfers ownership at delivery and carries none of the risk modelled here.",
  },
  {
    question: "When does consignment actually make sense for a supplier?",
    answer:
      "When the alternative is no distribution at all. For a new brand, consignment buys shelf space and sell-through data that no purchase order would have granted, and that proof can convert the account to standard terms within a season or two. It also makes sense for genuinely high-margin goods where the holding cost is small relative to the markup. It rarely makes sense for low-margin commodity products with long sell-through, where the holding cost can consume the entire profit on the order.",
  },
];

export default function ConsignmentInventoryCostCalculator() {
  const [inputs, setInputs] = useState<ConsignmentInputs>(DEFAULTS);
  const [results, setResults] = useState<ConsignmentResults>(calculateConsignment(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof ConsignmentInputs>(key: K, val: ConsignmentInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResults(calculateConsignment(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateConsignment(DEFAULTS));
    setShowAdvanced(false);
  };

  useEffect(() => {
    setMounted(true);
    setResults(calculateConsignment(DEFAULTS));
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Consignment Cost Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Business", href: "/calculator#business" },
          { label: "Consignment Inventory Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Consignment Inventory Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Consignment Agreement</h2>
            </div>

            <CompactInput
              id="val"
              label="Total Wholesale Inventory Value"
              value={inputs.inventoryValue}
              onChange={(v) => set("inventoryValue", v)}
              prefix="$"
              hint="The value of the goods being placed in the retailer's store."
            />

            <div className="grid grid-cols-2 gap-3">
              <CompactInput
                id="rate"
                label="Holding Cost (APR)"
                value={inputs.holdingRate}
                onChange={(v) => set("holdingRate", v)}
                suffix="%"
              />
              <CompactInput
                id="mon"
                label="Est. Time to Sell"
                value={inputs.months}
                onChange={(v) => set("months", v)}
                suffix="mo"
              />
            </div>

            <CompactInput
              id="spoil"
              label="Shrinkage / Obsolescence Rate"
              value={inputs.spoilageRate}
              onChange={(v) => set("spoilageRate", v)}
              suffix="%"
              hint="Share of inventory likely stolen, damaged, or expired before it sells."
            />

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-sm font-semibold text-primary hover:underline text-left"
            >
              {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contract Terms</div>
                  <CompactInput
                    id="share"
                    label="Shrinkage Borne By Supplier"
                    value={inputs.shrinkageBorneBySupplier}
                    onChange={(v) => set("shrinkageBorneBySupplier", v)}
                    suffix="%"
                    hint="Most contracts default to 100%. It is negotiable, and usually should be negotiated."
                  />
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Freight</div>
                  <div className="grid grid-cols-2 gap-3">
                    <CompactInput
                      id="freight"
                      label="Outbound Freight"
                      value={inputs.freightOut}
                      onChange={(v) => set("freightOut", v)}
                      prefix="$"
                    />
                    <CompactInput
                      id="retfreight"
                      label="Return Freight"
                      value={inputs.returnFreight}
                      onChange={(v) => set("returnFreight", v)}
                      prefix="$"
                    />
                  </div>
                  <div className="mt-3">
                    <CompactInput
                      id="retrate"
                      label="Expected Unsold / Returned"
                      value={inputs.returnRate}
                      onChange={(v) => set("returnRate", v)}
                      suffix="%"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Models the retailer&apos;s side too — shelf-space opportunity cost and gross profit — for negotiation.
                  </p>
                  {inputs.proMode && (
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="retmargin"
                        label="Retailer Margin"
                        value={inputs.retailerMarginPercent}
                        onChange={(v) => set("retailerMarginPercent", v)}
                        suffix="%"
                      />
                      <CompactInput
                        id="shelfrate"
                        label="Shelf Opportunity"
                        value={inputs.shelfOpportunityRate}
                        onChange={(v) => set("shelfOpportunityRate", v)}
                        suffix="%"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>
                In a standard consignment model the <strong>supplier</strong> finances the inventory and absorbs most of the
                holding and shrinkage risk, while the <strong>retailer</strong> commits no capital.
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold text-base flex items-center justify-center transition-colors shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div ref={printRef} className="flex flex-col gap-4">
              {/* 1. Primary */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <button
                  onClick={handlePrint}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden"
                  aria-label="Print Results"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                  Total Supplier Cost &amp; Risk
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{money(results.totalSupplierCost)}</div>
                <div className="text-sm text-muted-foreground">
                  {results.costAsPercentOfInventory.toFixed(2)}% of inventory value over {inputs.months} months &middot;{" "}
                  {results.effectiveAnnualisedDrag.toFixed(1)}% annualised &middot; retailer bears{" "}
                  {money(results.totalRetailerCost)}
                </div>
              </div>

              {/* 2. Three-stat bar */}
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="p-4 text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Capital Tied Up</div>
                  <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>
                    {money(parseFloat(inputs.inventoryValue) || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">unpaid for {inputs.months} months</div>
                </div>
                <div className="p-4 text-center border-l border-border">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Holding Cost</div>
                  <div className="text-2xl font-bold" style={{ color: "hsl(0 84% 60%)" }}>{money(results.holdingCost)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{inputs.holdingRate}% APR prorated</div>
                </div>
                <div className="p-4 text-center border-l border-border">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Margin Uplift</div>
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color:
                        results.breakEvenMarginUplift < 5
                          ? "hsl(142 71% 45%)"
                          : results.breakEvenMarginUplift < 12
                          ? "hsl(25 95% 53%)"
                          : "hsl(0 84% 60%)",
                    }}
                  >
                    +{results.breakEvenMarginUplift.toFixed(1)} pts
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">to break even</div>
                </div>
              </div>

              {/* 3. Breakdown table */}
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Cost &amp; Risk Breakdown</h3>
                <table className="w-full text-base border-collapse">
                  <tbody>
                    {results.rows.map((r) => (
                      <tr
                        key={r.rowId}
                        className={`border-b border-border/60 last:border-0 ${r.key ? "bg-primary/10" : ""} ${r.total ? "border-t-2 border-t-border font-bold" : ""}`}
                      >
                        <td className={`py-2.5 px-3 ${r.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.label}</td>
                        <td className={`py-2.5 px-3 text-right tabular-nums ${r.key ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Chart */}
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-1">Risk Asymmetry</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Who carries what. Capital tied up dwarfs every other line, and it sits entirely on the supplier&apos;s balance
                  sheet until the goods sell.
                </p>
                <div style={{ height: 250 }}>
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RBar data={results.chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(215 16% 65% / 0.25)" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(215 16% 65%)"
                          tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={120}
                          tick={{ fontSize: 11, fill: "hsl(215 16% 65%)" }}
                        />
                        <RTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(215 16% 65% / 0.1)" }} />
                        <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Supplier" stackId="a" fill="hsl(25 95% 53%)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Retailer" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
                      </RBar>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>

              {/* 5. Summary statistics — same rows as the breakdown table */}
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {results.rows.map((r) => (
                    <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  These terms cost the supplier {results.costAsPercentOfInventory.toFixed(2)}% of inventory value over{" "}
                  {inputs.months} months, an annualised drag of {results.effectiveAnnualisedDrag.toFixed(1)}%. To be no worse off
                  than on standard purchase-order terms, the wholesale margin on this deal needs to be at least{" "}
                  {results.breakEvenMarginUplift.toFixed(2)} percentage points higher — and that is break-even, before any
                  compensation for bearing the risk itself.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Consignment Inventory Actually Costs</h2>
            <p>
              <strong>Consignment inventory</strong> is an arrangement in which a supplier places goods in a retailer&apos;s store
              but retains legal ownership until a customer buys them. Only at the point of sale does the retailer owe anything.
              The model is standard in fashion boutiques, art galleries, bookshops, automotive parts, and medical devices, and it
              is often the only route a new brand has into shelf space it could never buy outright.
            </p>
            <p>
              The reason it needs a calculator is that the cost is almost entirely invisible on an income statement. No line item
              says &ldquo;consignment.&rdquo; The expense shows up as financing cost, as write-offs, as freight, and as capital
              that was unavailable for something else — spread across four different places, none of which is labelled with the
              decision that caused it. This tool reassembles them into one number and, more usefully, converts that number into
              the margin uplift you need to negotiate.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Four Costs the Supplier Absorbs</h2>
            <p>
              <strong>Cost of capital</strong> is the largest and least visible. Goods worth 75,000 dollars sitting on a shelf for
              four months represent 75,000 dollars that is not funding production, marketing, or payroll. At a 12 percent annual
              cost of capital, that is 3,000 dollars — effectively an interest-free loan extended to the retailer, on terms the
              retailer never had to negotiate for.
            </p>
            <p>
              <strong>Shrinkage and obsolescence</strong> follow. Because the goods remain the supplier&apos;s property, theft,
              damage, and expiry are typically the supplier&apos;s loss. This default deserves scrutiny: a retailer with zero
              financial exposure to theft has correspondingly little incentive to prevent it. <strong>Freight</strong> runs in both
              directions, and the return leg is the one suppliers forget to price — unsold stock comes back, and someone pays to
              ship it. Finally there is the <strong>option cost</strong> the model cannot price: inventory committed to one
              retailer cannot be sold to another who might have moved it faster.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Retailer Risk Is Not Actually Zero</h2>
            <p>
              It is tempting to state that the retailer bears no risk, and most descriptions of consignment do exactly that. It is
              close to true and it is a bad negotiating position, because a supplier who believes it has nothing to argue with.
            </p>
            <p>
              Shelf space is finite. Floor area occupied by slow-moving consigned stock is area not occupied by something that
              turns. That opportunity cost is real, it scales with how long the goods sit, and it is why retailers do eventually
              return unsold consignment rather than leaving it indefinitely — the space costs them even when the inventory does
              not. Professional Mode prices that shelf cost alongside the retailer&apos;s gross profit on the same goods, which
              gives both parties a defensible basis for discussing terms. A retailer earning 30,000 dollars of gross profit while
              carrying 2,000 dollars of shelf cost is in a very different position from the zero-risk caricature, and the
              conversation goes better when both numbers are on the table.
            </p>

            <h2 className="text-2xl font-bold mb-3">Negotiating Consignment Terms That Work</h2>
            <p>
              The headline output of this calculator is the <strong>margin uplift</strong>: the number of percentage points your
              wholesale margin must rise, relative to a standard purchase-order deal, simply to leave you no worse off. If
              consignment costs 9 percent of inventory value, a 9-point uplift is break-even, not profit. Asking only for
              break-even means bearing all the risk for nothing.
            </p>
            <p>
              Three further terms are worth as much as the margin. Cap the sell-through window with an automatic return or
              conversion-to-purchase date, so the holding cost cannot run indefinitely. Split shrinkage rather than accepting a
              100 percent allocation, both for the money and for the incentive it creates. And in the United States, file a UCC-1
              financing statement to perfect your security interest before the goods ship: without it, consigned inventory can be
              treated as property of the retailer&apos;s bankruptcy estate and sold to satisfy their creditors while you queue as
              an unsecured claimant. That single filing is the difference between a bad quarter and a catastrophic one, and it is
              the risk that no percentage in this calculator can express.
            </p>
          </section>

          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/consignment-inventory-cost-calculator" />
          <PopularCalculators exclude="/calculator/consignment-inventory-cost-calculator" />
        </div>
      </div>
    </>
  );
}
