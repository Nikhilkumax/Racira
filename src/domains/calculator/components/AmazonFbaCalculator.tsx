"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

// 1. TypeScript interfaces
interface FbaResults {
  referralFee: number;
  totalFees: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
  roi: number;
  breakEven: number;
  chartData: { name: string; value: number; color: string }[];
  isError: boolean;
  errorMsg?: string;
}

// 3. DEFAULTS object
const DEFAULTS = {
  salePrice: "29.99",
  productCost: "8.50",
  shippingToAmazon: "1.20",
  referralFeePct: "15",

  showAdvanced: false,
  fbaFulfillmentFee: "5.40",
  monthlyStorageFee: "0.45",
  miscCosts: "0.50",
};

// 2. Pure calculation function
const calculateFba = (inputs: typeof DEFAULTS): FbaResults => {
  const price = parseFloat(inputs.salePrice) || 0;
  const cost = parseFloat(inputs.productCost) || 0;
  const ship = parseFloat(inputs.shippingToAmazon) || 0;
  const refFeePct = parseFloat(inputs.referralFeePct) || 0;
  const fbaFee = parseFloat(inputs.fbaFulfillmentFee) || 0;
  const storage = parseFloat(inputs.monthlyStorageFee) || 0;
  const misc = parseFloat(inputs.miscCosts) || 0;

  if (price <= 0) {
    return { referralFee: 0, totalFees: 0, totalExpenses: 0, netProfit: 0, margin: 0, roi: 0, breakEven: 0, chartData: [], isError: true, errorMsg: "Selling Price must be greater than zero." };
  }

  const referralFee = price * refFeePct / 100;
  const totalFees = referralFee + fbaFee + storage;
  const totalExpenses = cost + ship + totalFees + misc;
  const netProfit = price - totalExpenses;
  const margin = price > 0 ? (netProfit / price) * 100 : 0;
  const roi = (cost + ship) > 0 ? (netProfit / (cost + ship)) * 100 : 0;
  const breakEven = totalExpenses;

  const chartData: { name: string; value: number; color: string }[] = [
    { name: "Product Cost", value: Number(cost.toFixed(2)), color: "#94a3b8" },
    { name: "Inbound Shipping", value: Number(ship.toFixed(2)), color: "#cbd5e1" },
    { name: "Amazon Referral Fee", value: Number(referralFee.toFixed(2)), color: "#f59e0b" },
    { name: "FBA Fulfillment Fee", value: Number(fbaFee.toFixed(2)), color: "#ef4444" },
    { name: "Storage & Misc", value: Number((storage + misc).toFixed(2)), color: "#64748b" },
  ];
  if (netProfit > 0) {
    chartData.push({ name: "Net Profit", value: Number(netProfit.toFixed(2)), color: "hsl(var(--primary))" });
  }

  return {
    referralFee: Number(referralFee.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    margin: Number(margin.toFixed(1)),
    roi: Number(roi.toFixed(0)),
    breakEven: Number(breakEven.toFixed(2)),
    chartData,
    isError: false,
  };
};

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1 text-foreground">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function AmazonFbaCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<FbaResults>(calculateFba(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResults(calculateFba(DEFAULTS));
  }, []);

  const handleCalculate = () => setResults(calculateFba(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateFba(DEFAULTS));
  };
  const updateVal = (key: keyof typeof DEFAULTS, val: string | boolean) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is Amazon FBA?", answer: "Fulfillment by Amazon (FBA) is a service where Amazon stores, picks, packs, and ships your products to customers. They also handle customer service and returns for these orders." },
    { question: "How much is the Amazon Referral Fee?", answer: "For most categories, Amazon charges a 15% referral fee on the total sales price. Some categories like Electronics (8%) or Clothing (17%) have different rates." },
    { question: "What determines the FBA Fulfillment Fee?", answer: "The FBA fee is based on the weight and dimensions of your product. Amazon categorizes products into 'Size Tiers' (e.g., Small Standard, Large Standard, Oversize) to determine the flat per-unit shipping fee." },
    { question: "How do I calculate my Amazon ROI?", answer: "ROI (Return on Investment) is calculated by dividing your net profit by your initial investment (Product Cost + Shipping to Amazon). A 100% ROI means you doubled your money." },
    { question: "Are storage fees fixed?", answer: "No, Amazon storage fees vary by month and volume. Fees are significantly higher during the Q4 holiday season (October–December) than during the rest of the year." },
    { question: "What is a good profit margin for FBA?", answer: "Most successful FBA sellers aim for a 20-30% net profit margin. Anything below 15% leaves very little room for advertising (PPC) or unexpected costs." },
    { question: "Does this calculator include Amazon PPC costs?", answer: "No, PPC (Pay-Per-Click) advertising costs vary wildly by seller. You should subtract your estimated PPC cost per unit from the 'Net Profit' shown here to get your 'True Profit'." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Amazon FBA Profit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amazon FBA Profit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="salePrice" label="Selling Price" value={inputs.salePrice} onChange={(v: string) => updateVal("salePrice", v)} prefix="$" />
              <CompactInput id="productCost" label="Product Cost" value={inputs.productCost} onChange={(v: string) => updateVal("productCost", v)} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="shippingToAmazon" label="Ship to Amazon" value={inputs.shippingToAmazon} onChange={(v: string) => updateVal("shippingToAmazon", v)} prefix="$" />
              <CompactInput id="referralFeePct" label="Referral Fee" value={inputs.referralFeePct} onChange={(v: string) => updateVal("referralFeePct", v)} suffix="%" />
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => updateVal("showAdvanced", !inputs.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${inputs.showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {inputs.showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Amazon Platform Fees</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="fbaFulfillmentFee" label="FBA Fulfillment Fee" value={inputs.fbaFulfillmentFee} onChange={(v: string) => updateVal("fbaFulfillmentFee", v)} prefix="$" />
                      <CompactInput id="monthlyStorageFee" label="Monthly Storage" value={inputs.monthlyStorageFee} onChange={(v: string) => updateVal("monthlyStorageFee", v)} prefix="$" />
                      <CompactInput id="miscCosts" label="Misc Costs" value={inputs.miscCosts} onChange={(v: string) => updateVal("miscCosts", v)} prefix="$" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT - Results */}
          <div className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* Component 1: Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Net Profit</div>
                  <div className="text-4xl font-bold text-primary my-1">${results.netProfit.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Net Margin: {results.margin}%</div>
                </div>

                {/* Component 2: 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">ROI</div>
                    <div className={`text-lg font-bold ${results.roi >= 100 ? "text-emerald-500" : results.roi >= 50 ? "text-orange-500" : "text-destructive"}`}>{results.roi}%</div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Total Fees</div>
                    <div className="text-lg font-bold text-foreground">${results.totalFees.toFixed(2)}</div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Break-Even</div>
                    <div className="text-lg font-bold text-foreground">${results.breakEven.toFixed(2)}</div>
                  </div>
                </div>

                {/* Component 3: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Cost Component</th>
                        <th className="p-2.5 pr-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Product Cost</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${(parseFloat(inputs.productCost) || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Inbound Shipping</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${(parseFloat(inputs.shippingToAmazon) || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-secondary/20">
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Amazon Referral Fee ({inputs.referralFeePct}%)</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${results.referralFee.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">FBA Fulfillment Fee</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${(parseFloat(inputs.fbaFulfillmentFee) || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Monthly Storage</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${(parseFloat(inputs.monthlyStorageFee) || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Misc Costs</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">${(parseFloat(inputs.miscCosts) || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="font-bold border-t-2 border-border">
                        <td className="text-base py-2.5 px-3 text-foreground">Total Expenses</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">${results.totalExpenses.toFixed(2)}</td>
                      </tr>
                      <tr className="font-bold">
                        <td className="text-base py-2.5 px-3 text-primary">Net Profit</td>
                        <td className="text-base py-2.5 px-3 text-right text-primary">${results.netProfit.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Component 4: Chart */}
                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4">Cost vs. Profit Breakdown</h3>
                    <LazyView minHeight={250}>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={results.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => `$${value.toFixed(2)}`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </LazyView>
                  </div>
                )}

                {/* Component 5: Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Profit</span>
                      <span className="text-base font-bold text-primary">${results.netProfit.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Margin</span>
                      <span className="text-base font-bold text-foreground">{results.margin}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ROI</span>
                      <span className="text-base font-bold text-foreground">{results.roi}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Amazon Fees</span>
                      <span className="text-base font-bold text-foreground">${results.totalFees.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-Even Price</span>
                      <span className="text-base font-bold text-foreground">${results.breakEven.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Referral Fee</span>
                      <span className="text-base font-bold text-foreground">${results.referralFee.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Amazon FBA Fees and Profitability</h2>
            <p>Selling physical products on the internet through the Amazon platform utilizing the Fulfillment by Amazon program is widely considered one of the most powerful and structurally scalable methods for constructing a modern e-commerce enterprise. However, the absolute reality of this business model is that it operates strictly on exceptionally thin, highly sensitive profit margins. Amazon systematically extracts a significant portion of every single transaction to cover their massive logistical overhead and customer acquisition costs. To successfully build a sustainable, highly profitable brand on this hyper competitive marketplace, a seller must aggressively move far beyond intuition or estimating. You must possess a mathematically flawless, crystal clear understanding of your precise unit economics down to the absolute final cent. This proprietary, algorithmically accurate Amazon FBA Profit Calculator was explicitly engineered to empower sellers by granularly analyzing every conceivable fraction of their revenue against their inbound and outbound logistical expenses.</p>

            <h2 className="text-2xl font-bold mb-3">The Fundamental Architecture of Platform Fees</h2>
            <p>To accurately forecast net profitability, a seller must first master the intricate architecture of Amazon's mandatory fee structure. The marketplace systematically divides its operational costs into three massive, unavoidable primary categories. First, every transaction incurs a baseline Referral Fee. This functions essentially as a mandatory commission or a digital finder's fee for leveraging Amazon's immense organic customer traffic and high conversion marketplace infrastructure. For the vast majority of consumer categories, this fee is statically set at exactly fifteen percent of the total gross price paid by the customer, which strictly includes any shipping charges levied against the buyer. Second, the platform imposes structural Fulfillment Fees. These specific costs are directly associated with the intense physical labor and heavy industrial logistics required to process an order. The fulfillment fee completely covers the warehouse robotics, the human labor required to physically pick the item from the massive warehouse shelf, the corrugated packaging materials, and the final outbound carrier shipping expense to the end consumer. Amazon rigorously calculates this specific fee by mathematically analyzing the precise dimensional volume and absolute shipping weight of your packaged product, classifying the item into rigidly enforced size tiers. Third, the platform continuously charges Monthly Storage Fees. Amazon aggressively monetizes every single cubic foot of atmospheric space your physical inventory occupies within their concrete fulfillment centers. These storage fees are dynamically calculated on a monthly basis and automatically skyrocket to significantly higher premium rates during the critical fourth quarter holiday peak season, running aggressively from October through the end of December.</p>

            <h2 className="text-2xl font-bold mb-3">Deciphering Net Profit versus Net Margin</h2>
            <p>While many amateur sellers conflate the two terms, professional merchants understand that Net Profit and Net Margin represent entirely different financial realities. Net Profit simply represents the absolute, raw dollar amount that physically remains in your corporate bank account after every single operational expense, manufacturing cost, and platform fee has been fully settled. Conversely, Net Margin mathematically expresses that raw profit as a definitive percentage of your total gross revenue. While the absolute Net Profit simply dictates whether your business is currently generating positive cash flow, the Net Margin serves as a critical diagnostic metric that reveals exactly how structurally healthy and resilient your enterprise actually is. Launching a product that yields a mere ten percent net margin is incredibly risky; a singular, unexpected increase in international ocean freight costs, or a sudden algorithmic price war initiated by an aggressive offshore competitor, could instantly obliterate that razor thin buffer and plunge the entire product line into a negative cash flow death spiral. Consequently, veteran sellers systematically target high margin products, typically refusing to launch any item that mathematically projects below a strictly enforced twenty five percent net margin, thereby establishing a massive financial buffer capable of absorbing unexpected operational shocks.</p>

            <h2 className="text-2xl font-bold mb-3">Accounting for Hidden Logistical Expenditures</h2>
            <p>A remarkably common and frequently fatal mathematical error made by newly established sellers is aggressively failing to account for the massive hidden logistical costs required simply to position their products within the Amazon ecosystem. Regardless of whether you are importing commercial containers via slow ocean freight from massive manufacturing hubs in mainland China, or utilizing domestic ground carriers to transport master cartons across the country, inbound shipping represents a massive, structurally unavoidable capital expense. Furthermore, strict accounting practices mandate the inclusion of miscellaneous auxiliary costs. These vital secondary expenditures include the manufacturing of custom retail packaging, the printing of high conversion marketing inserts, the procurement of required polybags, and mathematically modeling the statistical inevitability of customer returns. When a customer returns a product that is subsequently deemed unsellable, the seller must absorb the entire manufacturing cost of that unit, drastically impacting the overall profitability equation.</p>

            <h2 className="text-2xl font-bold mb-3">Optimizing Return on Investment Dynamics</h2>
            <p>Return on Investment, commonly referred to as ROI, is arguably the single most critical mathematical metric required for aggressively scaling an e-commerce operation. ROI quantitatively measures exactly how hard your deployed capital is working to generate new wealth. If a merchant structurally invests exactly ten dollars in landed product costs and successfully generates exactly ten dollars in clean net profit upon the final sale, the system has achieved a massive one hundred percent ROI. This mathematically dictates that every time the merchant successfully turns over their inventory cycle, they effectively double their deployed capital. Securing and maintaining a massive ROI directly allows an aggressive seller to rapidly reinvest surging profits into substantially larger inventory orders and aggressively fund the research and development of entirely new product lines, ultimately engineering a highly sustainable trajectory of exponential financial growth.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amazon-fba-calculator" />
          <PopularCalculators exclude="/calculator/amazon-fba-profit-calculator" />
        </div>
      </div>
    </>
  );
}