"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, ShoppingCart, DollarSign, Package, Truck, Calculator, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

export default function AmazonFbaCalculator() {
  const [salePrice, setSalePrice] = useState("29.99");
  const [productCost, setProductCost] = useState("8.50");
  const [shippingToAmazon, setShippingToAmazon] = useState("1.20");
  const [referralFeePct, setReferralFeePct] = useState("15");
  const [fbaFulfillmentFee, setFbaFulfillmentFee] = useState("5.40");
  const [miscCosts, setMiscCosts] = useState("0.50");
  const [monthlyStorageFee, setMonthlyStorageFee] = useState("0.45");

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    totalFees: 0,
    netProfit: 0,
    margin: 0,
    roi: 0,
    breakEven: 0,
    chartData: [] as any[]
  });

  const handleCalculate = () => {
    const price = parseFloat(salePrice) || 0;
    const cost = parseFloat(productCost) || 0;
    const ship = parseFloat(shippingToAmazon) || 0;
    const refFee = price * (parseFloat(referralFeePct) || 0) / 100;
    const fbaFee = parseFloat(fbaFulfillmentFee) || 0;
    const misc = parseFloat(miscCosts) || 0;
    const storage = parseFloat(monthlyStorageFee) || 0;

    const totalFees = refFee + fbaFee + storage;
    const totalExpenses = cost + ship + totalFees + misc;
    const netProfit = price - totalExpenses;
    const margin = price > 0 ? (netProfit / price) * 100 : 0;
    const roi = (cost + ship) > 0 ? (netProfit / (cost + ship)) * 100 : 0;
    const breakEven = totalExpenses;

    const chartData = [
      { name: "Product Cost", value: cost, color: "#94a3b8" },
      { name: "Inbound Shipping", value: ship, color: "#cbd5e1" },
      { name: "Amazon Referral Fee", value: refFee, color: "#f59e0b" },
      { name: "FBA Fulfillment Fee", value: fbaFee, color: "#ef4444" },
      { name: "Storage & Misc", value: storage + misc, color: "#64748b" }
    ];
    if (netProfit > 0) {
      chartData.push({ name: "Net Profit", value: netProfit, color: "hsl(var(--primary))" });
    }

    setResults({
      totalFees,
      netProfit,
      margin,
      roi,
      breakEven,
      chartData
    });
    setShowResults(true);
  };

  const reset = () => {
    setSalePrice("29.99");
    setProductCost("8.50");
    setShippingToAmazon("1.20");
    setReferralFeePct("15");
    setFbaFulfillmentFee("5.40");
    setMiscCosts("0.50");
    setMonthlyStorageFee("0.45");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is Amazon FBA?", answer: "Fulfillment by Amazon (FBA) is a service where Amazon stores, picks, packs, and ships your products to customers. They also handle customer service and returns for these orders." },
    { question: "How much is the Amazon Referral Fee?", answer: "For most categories, Amazon charges a 15% referral fee on the total sales price. Some categories like Electronics (8%) or Clothing (17%) have different rates." },
    { question: "What determines the FBA Fulfillment Fee?", answer: "The FBA fee is based on the weight and dimensions of your product. Amazon categorizes products into 'Size Tiers' (e.g., Small Standard, Large Standard, Oversize) to determine the flat per-unit shipping fee." },
    { question: "How do I calculate my Amazon ROI?", answer: "ROI (Return on Investment) is calculated by dividing your net profit by your initial investment (Product Cost + Shipping to Amazon). A 100% ROI means you doubled your money." },
    { question: "Are storage fees fixed?", answer: "No, Amazon storage fees vary by month and volume. Fees are significantly higher during the Q4 holiday season (October–December) than during the rest of the year." },
    { question: "What is a good profit margin for FBA?", answer: "Most successful FBA sellers aim for a 20-30% net profit margin. Anything below 15% leaves very little room for advertising (PPC) or unexpected costs." },
    { question: "Does this calculator include Amazon PPC costs?", answer: "No, PPC (Pay-Per-Click) advertising costs vary wildly by seller. You should subtract your estimated PPC cost per unit from the 'Net Profit' shown here to get your 'True Profit'." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Amazon FBA Profit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amazon FBA Profit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-2">
                <InputField id="sale-price" label="Selling Price ($)" value={salePrice} onChange={setSalePrice} prefix="$" tooltip="The final price the customer pays on Amazon." />
                <InputField id="product-cost" label="Product Cost ($)" value={productCost} onChange={setProductCost} prefix="$" tooltip="Your cost per unit from the manufacturer." />
                <InputField id="shipping" label="Ship to Amazon ($)" value={shippingToAmazon} onChange={setShippingToAmazon} prefix="$" tooltip="Estimated cost per unit to ship from your supplier to Amazon's warehouse." />
                <InputField id="referral" label="Referral Fee (%)" value={referralFeePct} onChange={setReferralFeePct} suffix="%" tooltip="Amazon's commission, usually 15% for most categories." />
                <InputField id="fba-fee" label="Fulfillment Fee ($)" value={fbaFulfillmentFee} onChange={setFbaFulfillmentFee} prefix="$" tooltip="Amazon's fee for picking, packing, and shipping your product." />
                <InputField id="storage" label="Monthly Storage ($)" value={monthlyStorageFee} onChange={setMonthlyStorageFee} prefix="$" tooltip="Estimated storage fee per unit per month." />
                <InputField id="misc" label="Misc Costs ($)" value={miscCosts} onChange={setMiscCosts} prefix="$" tooltip="Packaging, inserts, or labeling." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative mb-4">
                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Net Profit</p>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${results.netProfit.toFixed(2)}</div>
                  <p className="text-base text-muted-foreground font-medium mt-2">Net Margin: {results.margin.toFixed(1)}%</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl border border-border text-center bg-card shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">ROI (Product)</p>
                    <p className="text-2xl font-black text-foreground">{results.roi.toFixed(0)}%</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border text-center bg-card shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Amazon Fees</p>
                    <p className="text-2xl font-black text-foreground">${results.totalFees.toFixed(2)}</p>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cost vs. Profit Breakdown</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={results.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `$${value.toFixed(2)}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Mastering the Mathematics of Amazon FBA</h2>
            <p>Selling physical products on the internet through the Amazon platform utilizing the Fulfillment by Amazon program is widely considered one of the most powerful and structurally scalable methods for constructing a modern e-commerce enterprise. However, the absolute reality of this business model is that it operates strictly on exceptionally thin, highly sensitive profit margins. Amazon systematically extracts a significant portion of every single transaction to cover their massive logistical overhead and customer acquisition costs. To successfully build a sustainable, highly profitable brand on this hyper competitive marketplace, a seller must aggressively move far beyond intuition or estimating. You must possess a mathematically flawless, crystal clear understanding of your precise unit economics down to the absolute final cent. This proprietary, algorithmically accurate Amazon FBA Profit Calculator was explicitly engineered to empower sellers by granularly analyzing every conceivable fraction of their revenue against their inbound and outbound logistical expenses.</p>

            <h2 className="text-2xl font-bold mb-3">The Fundamental Architecture of Platform Fees</h2>
            <p>To accurately forecast net profitability, a seller must first master the intricate architecture of Amazon's mandatory fee structure. The marketplace systematically divides its operational costs into three massive, unavoidable primary categories. First, every transaction incurs a baseline Referral Fee. This functions essentially as a mandatory commission or a digital finder's fee for leveraging Amazon's immense organic customer traffic and high conversion marketplace infrastructure. For the vast majority of consumer categories, this fee is statically set at exactly fifteen percent of the total gross price paid by the customer, which strictly includes any shipping charges levied against the buyer. Second, the platform imposes structural Fulfillment Fees. These specific costs are directly associated with the intense physical labor and heavy industrial logistics required to process an order. The fulfillment fee completely covers the warehouse robotics, the human labor required to physically pick the item from the massive warehouse shelf, the corrugated packaging materials, and the final outbound carrier shipping expense to the end consumer. Amazon rigorously calculates this specific fee by mathematically analyzing the precise dimensional volume and absolute shipping weight of your packaged product, classifying the item into rigidly enforced size tiers. Third, the platform continuously charges Monthly Storage Fees. Amazon aggressively monetizes every single cubic foot of atmospheric space your physical inventory occupies within their concrete fulfillment centers. These storage fees are dynamically calculated on a monthly basis and automatically skyrocket to significantly higher premium rates during the critical fourth quarter holiday peak season, running aggressively from October through the end of December.</p>

            <h2 className="text-2xl font-bold mb-3">Deciphering Net Profit versus Net Margin</h2>
            <p>While many amateur sellers conflate the two terms, professional merchants understand that Net Profit and Net Margin represent entirely different financial realities. Net Profit simply represents the absolute, raw dollar amount that physically remains in your corporate bank account after every single operational expense, manufacturing cost, and platform fee has been fully settled. Conversely, Net Margin mathematically expresses that raw profit as a definitive percentage of your total gross revenue. While the absolute Net Profit simply dictates whether your business is currently generating positive cash flow, the Net Margin serves as a critical diagnostic metric that reveals exactly how structurally healthy and resilient your enterprise actually is. Launching a product that yields a mere ten percent net margin is incredibly risky; a singular, unexpected increase in international ocean freight costs, or a sudden algorithmic price war initiated by an aggressive offshore competitor, could instantly obliterate that razor thin buffer and plunge the entire product line into a negative cash flow death spiral. Consequently, veteran sellers systematically target high margin products, typically refusing to launch any item that mathematically projects below a strictly enforced twenty five percent net margin, thereby establishing a massive financial buffer capable of absorbing unexpected operational shocks.</p>

            <h2 className="text-2xl font-bold mb-3">Accounting for Hidden Logistical Expenditures</h2>
            <p>A remarkably common and frequently fatal mathematical error made by newly established sellers is aggressively failing to account for the massive hidden logistical costs required simply to position their products within the Amazon ecosystem. Regardless of whether you are importing commercial containers via slow ocean freight from massive manufacturing hubs in mainland China, or utilizing domestic ground carriers to transport master cartons across the country, inbound shipping represents a massive, structurally unavoidable capital expense. Furthermore, strict accounting practices mandate the inclusion of miscellaneous auxiliary costs. These vital secondary expenditures include the manufacturing of custom retail packaging, the printing of high conversion marketing inserts, the procurement of required polybags, and mathematically modeling the statistical inevitability of customer returns. When a customer returns a product that is subsequently deemed unsellable, the seller must absorb the entire manufacturing cost of that unit, drastically impacting the overall profitability equation.</p>

            <h2 className="text-2xl font-bold mb-3">Optimizing Return on Investment Dynamics</h2>
            <p>Return on Investment, commonly referred to as ROI, is arguably the single most critical mathematical metric required for aggressively scaling an e-commerce operation. ROI quantitatively measures exactly how hard your deployed capital is working to generate new wealth. If a merchant structurally invests exactly ten dollars in landed product costs and successfully generates exactly ten dollars in clean net profit upon the final sale, the system has achieved a massive one hundred percent ROI. This mathematically dictates that every time the merchant successfully turns over their inventory cycle, they effectively double their deployed capital. Securing and maintaining a massive ROI directly allows an aggressive seller to rapidly reinvest surging profits into substantially larger inventory orders and aggressively fund the research and development of entirely new product lines, ultimately engineering a highly sustainable trajectory of exponential financial growth.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amazon-fba-profit-calculator" />
          <PopularCalculators exclude="/calculator/amazon-fba-profit-calculator" />
        </div>
      </div>
    </>
  );
}
