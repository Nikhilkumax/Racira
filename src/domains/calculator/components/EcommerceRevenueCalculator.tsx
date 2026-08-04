"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";

interface EcomInputs {
  monthlyVisitors: number;
  conversionRate: number;
  avgOrderValue: number;
  cogsPercent: number;
  returnRate: number;
  shippingPerOrder: number;
  processingFeePercent: number;
  adSpend: number;
}

interface EcomResult {
  monthlyOrders: number;
  netOrders: number;
  grossRevenue: number;
  returnsValue: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  shippingCost: number;
  processingCost: number;
  contributionMargin: number;
  netProfit: number;
  netMarginPct: number;
  revenuePerVisitor: number;
  profitPerOrder: number;
  cac: number;
  roas: number;
  breakEvenConversion: number;
  annualRevenue: number;
  annualProfit: number;
  valid: boolean;
}

const DEFAULTS: EcomInputs = {
  monthlyVisitors: 10000,
  conversionRate: 2.5,
  avgOrderValue: 75,
  cogsPercent: 40,
  returnRate: 10,
  shippingPerOrder: 6.5,
  processingFeePercent: 2.9,
  adSpend: 4000,
};

export function calculateEcommerce(i: EcomInputs): EcomResult {
  const cr = Math.min(Math.max(i.conversionRate, 0), 100) / 100;
  const ret = Math.min(Math.max(i.returnRate, 0), 100) / 100;
  const cogsPct = Math.min(Math.max(i.cogsPercent, 0), 100) / 100;
  const feePct = Math.min(Math.max(i.processingFeePercent, 0), 100) / 100;

  const monthlyOrders = i.monthlyVisitors * cr;
  const netOrders = monthlyOrders * (1 - ret);
  const grossRevenue = monthlyOrders * i.avgOrderValue;
  const returnsValue = grossRevenue * ret;
  const netRevenue = grossRevenue - returnsValue;

  const cogs = netRevenue * cogsPct;
  const grossProfit = netRevenue - cogs;

  // Shipping is incurred on fulfilled (non-returned) orders.
  const shippingCost = netOrders * i.shippingPerOrder;
  const processingCost = netRevenue * feePct;

  const contributionMargin = grossProfit - shippingCost - processingCost;
  const netProfit = contributionMargin - i.adSpend;

  // Contribution per order funds ad spend; break-even CR is where they balance.
  const contributionPerOrder = netOrders > 0 ? contributionMargin / netOrders : 0;
  const breakEvenOrders = contributionPerOrder > 0 ? i.adSpend / contributionPerOrder : 0;
  const breakEvenConversion =
    i.monthlyVisitors > 0 && contributionPerOrder > 0
      ? (breakEvenOrders / (1 - ret)) / i.monthlyVisitors * 100
      : 0;

  return {
    monthlyOrders,
    netOrders,
    grossRevenue,
    returnsValue,
    netRevenue,
    cogs,
    grossProfit,
    grossMarginPct: netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0,
    shippingCost,
    processingCost,
    contributionMargin,
    netProfit,
    netMarginPct: netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0,
    revenuePerVisitor: i.monthlyVisitors > 0 ? netRevenue / i.monthlyVisitors : 0,
    profitPerOrder: netOrders > 0 ? netProfit / netOrders : 0,
    cac: netOrders > 0 ? i.adSpend / netOrders : 0,
    roas: i.adSpend > 0 ? netRevenue / i.adSpend : 0,
    breakEvenConversion,
    annualRevenue: netRevenue * 12,
    annualProfit: netProfit * 12,
    valid: i.monthlyVisitors > 0 && i.avgOrderValue > 0,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function EcommerceRevenueCalculator() {
  const [monthlyVisitors, setMonthlyVisitors] = useState(String(DEFAULTS.monthlyVisitors));
  const [conversionRate, setConversionRate] = useState(String(DEFAULTS.conversionRate));
  const [avgOrderValue, setAvgOrderValue] = useState(String(DEFAULTS.avgOrderValue));
  const [cogsPercent, setCogsPercent] = useState(String(DEFAULTS.cogsPercent));
  const [returnRate, setReturnRate] = useState(String(DEFAULTS.returnRate));
  const [shippingPerOrder, setShippingPerOrder] = useState(String(DEFAULTS.shippingPerOrder));
  const [processingFeePercent, setProcessingFeePercent] = useState(String(DEFAULTS.processingFeePercent));
  const [adSpend, setAdSpend] = useState(String(DEFAULTS.adSpend));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<EcomResult>(calculateEcommerce(DEFAULTS));

  const getInputs = (): EcomInputs => ({
    monthlyVisitors: parseFloat(monthlyVisitors) || 0,
    conversionRate: parseFloat(conversionRate) || 0,
    avgOrderValue: parseFloat(avgOrderValue) || 0,
    cogsPercent: parseFloat(cogsPercent) || 0,
    returnRate: parseFloat(returnRate) || 0,
    shippingPerOrder: parseFloat(shippingPerOrder) || 0,
    processingFeePercent: parseFloat(processingFeePercent) || 0,
    adSpend: parseFloat(adSpend) || 0,
  });

  useEffect(() => {
    setResults(calculateEcommerce(DEFAULTS));
  }, []);

  const visitorsNum = parseFloat(monthlyVisitors) || 0;
  const crNum = parseFloat(conversionRate) || 0;
  const aovNum = parseFloat(avgOrderValue) || 0;
  const cogsNum = parseFloat(cogsPercent) || 0;
  const retNum = parseFloat(returnRate) || 0;

  let errorMsg = "";
  if (visitorsNum <= 0) errorMsg = "Monthly visitors must be greater than zero.";
  else if (crNum <= 0 || crNum > 100) errorMsg = "Conversion rate must be between 0% and 100%.";
  else if (aovNum <= 0) errorMsg = "Average order value must be greater than zero.";
  else if (cogsNum < 0 || cogsNum > 100) errorMsg = "COGS must be between 0% and 100%.";
  else if (retNum < 0 || retNum > 100) errorMsg = "Return rate must be between 0% and 100%.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResults(calculateEcommerce(getInputs()));
  };

  const reset = () => {
    setMonthlyVisitors(String(DEFAULTS.monthlyVisitors));
    setConversionRate(String(DEFAULTS.conversionRate));
    setAvgOrderValue(String(DEFAULTS.avgOrderValue));
    setCogsPercent(String(DEFAULTS.cogsPercent));
    setReturnRate(String(DEFAULTS.returnRate));
    setShippingPerOrder(String(DEFAULTS.shippingPerOrder));
    setProcessingFeePercent(String(DEFAULTS.processingFeePercent));
    setAdSpend(String(DEFAULTS.adSpend));
    setResults(calculateEcommerce(DEFAULTS));
  };

  const chartData = [
    { name: "COGS", value: results.cogs, color: "#EF4444" },
    { name: "Shipping", value: results.shippingCost, color: "#F59E0B" },
    { name: "Processing", value: results.processingCost, color: "#8B5CF6" },
    { name: "Ad Spend", value: parseFloat(adSpend) || 0, color: "#F97316" },
    { name: "Net Profit", value: Math.max(results.netProfit, 0), color: "#10B981" },
  ];
  const chartTotal = chartData.reduce((s, d) => s + d.value, 0);
  const chartWithPct = chartData.map(d => ({ ...d, pct: chartTotal > 0 ? (d.value / chartTotal) * 100 : 0 }));

  const profitFlag =
    results.netMarginPct >= 15
      ? { label: "Healthy", color: "text-emerald-600" }
      : results.netMarginPct >= 5
        ? { label: "Thin", color: "text-amber-600" }
        : { label: "At Risk", color: "text-red-600" };

  const breakdown = [
    { label: "Monthly Orders", value: fmtInt(results.monthlyOrders) },
    { label: "Gross Revenue", value: `$${fmtInt(results.grossRevenue)}` },
    { label: "Returns", value: `−$${fmtInt(results.returnsValue)}` },
    { label: "Net Revenue", value: `$${fmtInt(results.netRevenue)}`, highlight: true },
    { label: "Cost of Goods Sold", value: `−$${fmtInt(results.cogs)}` },
    { label: "Gross Profit", value: `$${fmtInt(results.grossProfit)}` },
    { label: "Shipping Cost", value: `−$${fmtInt(results.shippingCost)}` },
    { label: "Payment Processing", value: `−$${fmtInt(results.processingCost)}` },
    { label: "Contribution Margin", value: `$${fmtInt(results.contributionMargin)}` },
    { label: "Ad Spend", value: `−$${fmtInt(parseFloat(adSpend) || 0)}` },
  ];

  const faqs = [
    { question: "How is ecommerce revenue calculated?", answer: "Monthly orders equal visitors multiplied by conversion rate. Gross revenue is orders multiplied by average order value. Net revenue subtracts returns. From there, subtracting COGS, shipping, payment processing, and advertising produces net profit — the number that actually matters." },
    { question: "What is a good ecommerce conversion rate?", answer: "Most stores convert between 1% and 4%, with an average near 2.5%. Top performers exceed 5%. Rates vary sharply by category and traffic source: branded search converts far better than cold social traffic, so a single benchmark is less useful than tracking your own trend." },
    { question: "What is contribution margin and why does it matter?", answer: "Contribution margin is net revenue minus all variable costs — COGS, shipping, and payment processing — before advertising. It tells you how much each order contributes toward fixed costs and ad spend. If contribution margin per order is below your customer acquisition cost, scaling ad spend loses money faster." },
    { question: "How do I calculate customer acquisition cost?", answer: "Divide total ad spend by the number of orders acquired. At $4,000 of monthly spend and 225 net orders, CAC is roughly $17.78. Compare this against contribution margin per order, not against average order value — AOV ignores the cost of the goods you shipped." },
    { question: "What is a good ROAS?", answer: "Return on ad spend is net revenue divided by ad spend. A ROAS of 3 to 4 is a common target for stores with 40% to 60% gross margins, but the correct threshold depends entirely on your margin structure. A store with 20% margins needs far higher ROAS to break even than one with 70% margins." },
    { question: "How does the return rate affect profitability?", answer: "Returns cut revenue while often leaving shipping and processing costs partly sunk. Apparel return rates of 20% to 40% are common and can erase the margin on an otherwise healthy product line. This calculator applies returns to revenue and excludes returned orders from fulfilment shipping." },
    { question: "What is break-even conversion rate?", answer: "The conversion rate at which contribution margin exactly covers ad spend, leaving zero profit. It tells you how much conversion headroom you have before the current spend level becomes unprofitable — a more actionable figure than profit alone, because it converts your margin buffer into the metric you can optimise." },
    { question: "What gross margin should an ecommerce store target?", answer: "Physical product stores typically aim for 40% to 60% gross margin. Apparel runs 40% to 60%, consumer electronics 10% to 20%, food and beverage 25% to 45%, and digital products above 80%. Margins below 30% make paid acquisition extremely difficult to sustain profitably." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ecommerce Revenue Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ecommerce Revenue Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="visitors" label="Monthly Visitors" value={monthlyVisitors} onChange={setMonthlyVisitors} tooltip="Total unique sessions to your store per month." />
              <InputField id="conversion" label="Conversion Rate (%)" value={conversionRate} onChange={setConversionRate} suffix="%" tooltip="Share of visitors who complete a purchase. Industry average is 1-4%." />
              <InputField id="aov" label="Average Order Value ($)" value={avgOrderValue} onChange={setAvgOrderValue} prefix="$" tooltip="Average revenue per order before returns." />
              <InputField id="cogs" label="COGS (%)" value={cogsPercent} onChange={setCogsPercent} suffix="%" tooltip="Cost of goods as a percentage of net revenue: product, packaging, inbound freight." />
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Returns &amp; Fulfilment</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="return-rate" label="Return Rate (%)" value={returnRate} onChange={setReturnRate} suffix="%" tooltip="Percentage of orders returned. Apparel often runs 20-40%." />
                      <InputField id="shipping" label="Shipping / Order ($)" value={shippingPerOrder} onChange={setShippingPerOrder} prefix="$" tooltip="Average outbound shipping and fulfilment cost per fulfilled order." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fees &amp; Marketing</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="processing" label="Processing Fee (%)" value={processingFeePercent} onChange={setProcessingFeePercent} suffix="%" tooltip="Payment gateway fee on net revenue. Typically 2.9% plus a fixed amount." />
                      <InputField id="ad-spend" label="Monthly Ad Spend ($)" value={adSpend} onChange={setAdSpend} prefix="$" tooltip="Total paid acquisition budget per month." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
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
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Monthly Net Profit</div>
              <div className={`text-4xl font-extrabold mb-1 tracking-tight ${results.netProfit >= 0 ? "text-primary" : "text-red-600"}`}>
                ${fmtInt(results.netProfit)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                On ${fmtInt(results.netRevenue)} net revenue — a {fmt(results.netMarginPct, 1)}% net margin
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gross Margin</span>
                <span className="font-extrabold text-foreground">{fmt(results.grossMarginPct, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROAS</span>
                <span className="font-extrabold text-foreground">{fmt(results.roas, 2)}×</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Profitability</span>
                <span className={`font-extrabold ${profitFlag.color}`}>{profitFlag.label}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Revenue &amp; Cost Line</th>
                    <th className="py-2.5 px-3 text-right">Monthly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Net Profit</td>
                    <td className={`py-2.5 px-3 text-right ${results.netProfit >= 0 ? "text-foreground" : "text-red-600"}`}>${fmtInt(results.netProfit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Where Net Revenue Goes</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartWithPct} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                    <Tooltip formatter={(v: number) => [`$${fmtInt(v)}`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartWithPct.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2">
                {chartWithPct.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[12px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-muted-foreground">{d.name}</span>
                    <span className="font-bold text-foreground">{fmt(d.pct, 1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Monthly Orders</span>
                  <span className="font-bold text-foreground">{fmtInt(results.monthlyOrders)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Net Orders (after returns)</span>
                  <span className="font-bold text-foreground">{fmtInt(results.netOrders)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Gross Revenue</span>
                  <span className="font-bold text-foreground">${fmtInt(results.grossRevenue)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Net Revenue</span>
                  <span className="font-bold text-foreground">${fmtInt(results.netRevenue)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Gross Profit</span>
                  <span className="font-bold text-foreground">${fmtInt(results.grossProfit)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Contribution Margin</span>
                  <span className="font-bold text-foreground">${fmtInt(results.contributionMargin)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Net Profit</span>
                  <span className="font-bold text-foreground">${fmtInt(results.netProfit)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Net Margin</span>
                  <span className="font-bold text-foreground">{fmt(results.netMarginPct, 1)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Revenue Per Visitor</span>
                  <span className="font-bold text-foreground">${fmt(results.revenuePerVisitor)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Profit Per Order</span>
                  <span className="font-bold text-foreground">${fmt(results.profitPerOrder)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Customer Acquisition Cost</span>
                  <span className="font-bold text-foreground">${fmt(results.cac)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Break-Even Conversion</span>
                  <span className="font-bold text-foreground">{fmt(results.breakEvenConversion, 2)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Annual Net Revenue</span>
                  <span className="font-bold text-foreground">${fmtInt(results.annualRevenue)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Annual Net Profit</span>
                  <span className="font-bold text-foreground">${fmtInt(results.annualProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Modelling Ecommerce Revenue and Profit</h2>
            <p>Revenue is the easiest ecommerce number to calculate and the least useful on its own. Traffic multiplied by conversion rate multiplied by average order value gives you a headline figure, but it says nothing about whether the business makes money. The costs that determine profitability — goods, returns, shipping, payment processing, and acquisition — all sit below that line, and any of them can consume the entire margin.</p>
            <h2 className="text-2xl font-bold mb-3">The Three Levers of Revenue</h2>
            <p>Only three inputs drive top-line revenue: how many people arrive, what share of them buy, and how much they spend. Improving conversion rate is usually the cheapest of the three, since it multiplies the value of traffic you have already paid for. Raising average order value through bundling, upsells, or free-shipping thresholds is next. Buying more traffic is the most expensive lever, because it scales cost in lockstep with revenue.</p>
            <h2 className="text-2xl font-bold mb-3">Why Contribution Margin Matters More Than Gross Margin</h2>
            <p>Gross margin subtracts only the cost of goods. Contribution margin also strips out shipping and payment processing, leaving what each order genuinely contributes toward fixed costs and advertising. This is the figure that determines whether paid acquisition can work: if contribution margin per order is $22 and your customer acquisition cost is $26, every additional order deepens the loss no matter how impressive the revenue chart looks.</p>
            <h2 className="text-2xl font-bold mb-3">Returns Are a Margin Problem, Not a Revenue Problem</h2>
            <p>A 10% return rate does not reduce profit by 10%. Returned orders often leave outbound shipping, payment processing, and handling costs partly unrecovered, and returned goods may not be resalable at full price. In categories like apparel and footwear, where return rates of 20% to 40% are routine, returns frequently determine whether a product line is viable at all.</p>
            <h2 className="text-2xl font-bold mb-3">Break-Even Conversion Rate</h2>
            <p>The most actionable output in this model is the conversion rate at which contribution margin exactly covers ad spend. It converts your margin buffer into the metric you actually optimise. Knowing that you currently convert at 2.5% and break even at 1.6% tells you how much conversion decline you can absorb before the campaign turns unprofitable — far more useful than a single profit figure.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmarks by Category</h2>
            <p>Gross margins differ enormously across categories: apparel typically runs 40% to 60%, consumer electronics 10% to 20%, food and beverage 25% to 45%, and digital products above 80%. Those structural differences dictate how much a store can afford to pay for a customer. A 20%-margin store needs several times the return on ad spend of a 70%-margin store simply to break even, which is why comparing ROAS across categories is misleading.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ecommerce-revenue-calculator" />
          <PopularCalculators exclude="/calculator/ecommerce-revenue-calculator" />
        </div>
      </div>
    </>
  );
}
