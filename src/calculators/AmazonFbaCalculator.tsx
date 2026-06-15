"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, ShoppingCart, DollarSign, Package, Truck, Calculator, TrendingUp, BarChart3 } from "lucide-react";

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

    setResults({
      totalFees,
      netProfit,
      margin,
      roi,
      breakEven,
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
    { question: "Does this calculator include Amazon PPC costs?", answer: "No, PPC (Pay-Per-Click) advertising costs vary wildly by seller. You should subtract your estimated PPC cost per unit from the 'Net Profit' shown here to get your 'True Profit'." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Amazon FBA Profit Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amazon FBA Profit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="sale-price" label="Selling Price ($)" value={salePrice} onChange={setSalePrice} prefix="$" tooltip="The final price the customer pays on Amazon." />
                <InputField id="product-cost" label="Product Cost ($)" value={productCost} onChange={setProductCost} prefix="$" tooltip="Your cost per unit from the manufacturer." />
                <InputField id="shipping" label="Ship to Amazon ($)" value={shippingToAmazon} onChange={setShippingToAmazon} prefix="$" tooltip="Estimated cost per unit to ship from your supplier to Amazon's warehouse." />
                <InputField id="referral" label="Referral Fee (%)" value={referralFeePct} onChange={setReferralFeePct} suffix="%" tooltip="Amazon's commission, usually 15% for most categories." />
                <InputField id="fba-fee" label="Fulfillment Fee ($)" value={fbaFulfillmentFee} onChange={setFbaFulfillmentFee} prefix="$" tooltip="Amazon's fee for picking, packing, and shipping your product." />
                <InputField id="storage" label="Monthly Storage ($)" value={monthlyStorageFee} onChange={setMonthlyStorageFee} prefix="$" tooltip="Estimated storage fee per unit per month." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Calculate Profit
                </button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-6">Financial Analysis</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Net Profit</p>
                    <p className="text-3xl font-black text-foreground">${results.netProfit.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Net Margin</p>
                    <p className="text-3xl font-black text-foreground">{results.margin.toFixed(1)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">ROI (Product)</p>
                    <p className="text-3xl font-black text-foreground">{results.roi.toFixed(0)}%</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Amazon Fees", value: 0, textValue: `$${results.totalFees.toFixed(2)}` },
                  { label: "Break-Even Price", value: 0, textValue: `$${results.breakEven.toFixed(2)}` },
                  { label: "Profit After 10% Ads (PPC)", value: 0, textValue: `$${(results.netProfit - (parseFloat(salePrice) * 0.1)).toFixed(2)}` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Mastering Amazon FBA Profitability</h2>
              <p>Selling on Amazon through the Fulfillment by Amazon (FBA) program is one of the most popular ways to build a scalable e-commerce business. However, it is also a business of 'thin margins' where Amazon takes a significant portion of every sale. To succeed, you must move beyond 'guessing' and have a crystal-clear understanding of your unit economics. This Amazon FBA Profit Calculator is designed to help you analyze every cent of your revenue and expenses.</p>

              <h3>1. The Three Pillars of Amazon Fees</h3>
              <p>Amazon's fee structure is divided into three primary categories that every seller must understand:</p>
              <ul>
                <li><strong>Referral Fees:</strong> This is essentially a 'finder's fee' for using Amazon's marketplace. For most items, this is a flat 15% of the total price the customer pays (including shipping).</li>
                <li><strong>Fulfillment Fees:</strong> These are the costs associated with Amazon's labor and logistics. It covers the picking of the item from the shelf, packing it in an Amazon box, and shipping it to the customer. This fee is fixed based on the 'Size Tier' and 'Shipping Weight' of your product.</li>
                <li><strong>Storage Fees:</strong> Amazon charges you for every cubic foot of space your inventory occupies in their warehouses. These fees are calculated monthly and increase significantly during the 'Peak Season' (October through December).</li>
              </ul>

              <h3>2. Understanding Net Profit vs. Net Margin</h3>
              <p><strong>Net Profit</strong> is the actual dollar amount you keep after every single expense has been paid. <strong>Net Margin</strong> is that profit expressed as a percentage of your revenue. While Net Profit tells you if you're making money, Net Margin tells you how 'healthy' your business is. A product with a 10% margin is risky; a single increase in shipping costs or a price war with a competitor could turn your profit into a loss. Most professional sellers look for 'High Margin' products (25%+) to ensure long-term stability.</p>

              <h3>3. The 'Hidden' Costs: Shipping and Misc</h3>
              <p>Many new sellers forget to account for the cost of getting their products <strong>to</strong> Amazon. Whether you are shipping by sea from China or using a domestic carrier to send boxes to an Amazon Fulfillment Center, 'Inbound Shipping' is a major expense. Additionally, you must account for 'Misc Costs' like packaging inserts, polybags, and the small percentage of products that are returned by customers and cannot be resold.</p>

              <h3>4. ROI: The Speed of Wealth Creation</h3>
              <p>Return on Investment (ROI) is perhaps the most important metric for scaling. It measures how hard your money is working for you. If you spend $10 to make $10 in profit, your ROI is 100%. This means every time you 'flip' your inventory, you double your capital. High ROI allows you to reinvest in more inventory and new product lines faster, leading to exponential growth.</p>

              <h3>5. Strategies for Improving Your Amazon Margins</h3>
              <ul>
                <li><strong>Optimize Packaging:</strong> Shaving just half an inch off a box can sometimes drop a product into a lower FBA Size Tier, saving you $1.00+ per unit instantly.</li>
                <li><strong>Increase Your AOV:</strong> Selling 'Multi-packs' or 'Bundles' allows you to pay the FBA fulfillment fee only once for multiple items, significantly increasing your per-unit profit.</li>
                <li><strong>Negotiate with Suppliers:</strong> As your volume grows, your manufacturing cost should decrease. Even a 5% reduction in COGS (Cost of Goods Sold) can lead to a 15-20% increase in Net Profit.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amazon-fba-profit-calculator" />
          <PopularCalculators exclude="/calculator/amazon-fba-profit-calculator" />
        </div>
      </div>
    </>
  );
}
