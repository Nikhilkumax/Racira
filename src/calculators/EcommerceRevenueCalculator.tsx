"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function EcommerceRevenueCalculator() {
  const [monthlyVisitors, setMonthlyVisitors] = useState("10000");
  const [conversionRate, setConversionRate] = useState("2.5");
  const [avgOrderValue, setAvgOrderValue] = useState("75");
  const [returnRate, setReturnRate] = useState("10");
  const [cogsPercent, setCogsPercent] = useState("40");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ monthlyOrders: 0, grossRevenue: 0, netRevenue: 0, grossProfit: 0, netProfit: 0 });

  const handleCalculate = () => {
    const visitors = parseFloat(monthlyVisitors) || 0;
    const cr = (parseFloat(conversionRate) || 0) / 100;
    const aov = parseFloat(avgOrderValue) || 0;
    const returns = (parseFloat(returnRate) || 0) / 100;
    const cogs = (parseFloat(cogsPercent) || 0) / 100;

    const monthlyOrders = visitors * cr;
    const grossRevenue = monthlyOrders * aov;
    const returnValue = grossRevenue * returns;
    const netRevenue = grossRevenue - returnValue;
    const grossProfit = netRevenue * (1 - cogs);
    const netProfit = grossProfit;

    setResults({ monthlyOrders, grossRevenue, netRevenue, grossProfit, netProfit });
    setShowResults(true);
  };

  const reset = () => { setMonthlyVisitors("10000"); setConversionRate("2.5"); setAvgOrderValue("75"); setReturnRate("10"); setCogsPercent("40"); setShowResults(false); };

  const faqs = [
    { question: "What is ecommerce conversion rate?", answer: "Ecommerce conversion rate is the percentage of website visitors who complete a purchase. The average ecommerce conversion rate is 1-4%, with top-performing stores achieving 5%+." },
    { question: "What is Average Order Value (AOV)?", answer: "AOV is the average dollar amount spent each time a customer places an order. Increasing AOV through upselling, bundling, and free shipping thresholds is one of the highest-leverage growth strategies." },
    { question: "What is COGS in ecommerce?", answer: "Cost of Goods Sold (COGS) includes all direct costs to produce or acquire your products: manufacturing, wholesale cost, packaging, and inbound shipping. The difference between revenue and COGS is gross profit." },
    { question: "What is a good gross profit margin for ecommerce?", answer: "Gross margins vary widely: apparel (40-60%), software (80%+), consumer electronics (10-20%), and food products (25-45%). Physical product ecommerce typically targets 40-60% gross margins." },
    { question: "How can I improve my ecommerce conversion rate?", answer: "Key levers include: product page quality, site speed, mobile optimization, checkout simplification, trust signals (reviews, secure payment badges), personalization, and retargeting campaigns." },
    { question: "What is a return rate and how does it affect profit?", answer: "Return rate is the percentage of orders returned. High return rates directly reduce net revenue and incur additional processing costs. Fashion ecommerce averages 20-30% returns vs. 5-10% for other categories." },
    { question: "How do I calculate revenue from organic traffic?", answer: "Use this calculator with your organic visitor count and the conversion rate specific to that channel. Organic traffic often converts at different rates than paid or social traffic." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ecommerce Revenue Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Ecommerce Revenue Calculator</h1>
            <p className="text-muted-foreground mb-8">Estimate monthly ecommerce revenue, gross profit, and net profit based on traffic, conversion rate, and order metrics.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="visitors" label="Monthly Website Visitors" value={monthlyVisitors} onChange={setMonthlyVisitors} tooltip="Total unique visitors to your ecommerce site per month." />
                <InputField id="cr" label="Conversion Rate (%)" value={conversionRate} onChange={setConversionRate} suffix="%" tooltip="Percentage of visitors who complete a purchase. Average: 1-4%." />
                <InputField id="aov" label="Average Order Value ($)" value={avgOrderValue} onChange={setAvgOrderValue} prefix="$" tooltip="The average dollar amount per order placed." />
                <InputField id="return-rate" label="Return Rate (%)" value={returnRate} onChange={setReturnRate} suffix="%" tooltip="Percentage of orders that are returned and refunded." />
                <InputField id="cogs" label="Cost of Goods Sold (%)" value={cogsPercent} onChange={setCogsPercent} suffix="%" tooltip="Direct product costs as a percentage of revenue." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Revenue</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Monthly Ecommerce Projections</h2>
                <ResultDisplay items={[
                  { label: "Monthly Orders", value: 0, textValue: Math.round(results.monthlyOrders).toLocaleString(), highlight: true },
                  { label: "Gross Revenue", value: results.grossRevenue, highlight: true },
                  { label: "Net Revenue (after returns)", value: results.netRevenue },
                  { label: "Gross Profit", value: results.grossProfit, highlight: true },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>The Ecommerce Revenue Formula</h2>
              <p>Ecommerce revenue is fundamentally driven by three metrics: Traffic × Conversion Rate × Average Order Value = Gross Revenue. This simple formula has profound implications. A 10% increase in each metric alone doesn't just add 10% to revenue — if all three improve by 10% simultaneously, revenue increases by 33.1% (1.1 × 1.1 × 1.1 = 1.331). This multiplicative effect is why ecommerce growth strategies often focus on improving multiple metrics in parallel.</p>
              <h2>Understanding Traffic Quality vs. Quantity</h2>
              <p>Not all website visitors are equally valuable. Visitors from organic search terms with high purchase intent convert far better than social media traffic from a viral post with irrelevant demographics. A store with 5,000 highly targeted visitors from Google Shopping ads may generate more revenue than one with 50,000 visitors from a poorly targeted social media campaign. Conversion rate and traffic source are inseparable when analyzing ecommerce performance.</p>
              <h2>Increasing Average Order Value</h2>
              <p>AOV is one of the most powerful levers in ecommerce because it requires no additional traffic acquisition cost. Proven AOV optimization strategies include: product bundles and kits, volume discounts ("buy 3, save 15%"), complementary product cross-sells on the cart page, free shipping thresholds ("add $12 more for free shipping"), subscription upgrades, and extended warranties or protection plans.</p>
              <h2>Return Rate: The Silent Profit Killer</h2>
              <p>A 20% return rate doesn't just reduce revenue by 20% — it also incurs return shipping costs, restocking labor, inspection costs, and potential product write-downs if items can't be resold. In apparel, return rates of 30-40% are common, fundamentally reshaping unit economics. Reducing returns through better product descriptions, accurate sizing guides, and high-quality product photography pays dividends throughout the entire profit and loss statement.</p>
              <h2>From Gross to Net Profit</h2>
              <p>After COGS, ecommerce businesses must account for many more expense layers before arriving at net profit: customer acquisition costs (CAC), platform fees (Shopify, Amazon, etc.), payment processing fees (2.5-3.5%), warehouse and fulfillment costs, customer service overhead, and marketing/advertising spend. Healthy ecommerce businesses typically target 10-20% net profit margins after all operating expenses.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ecommerce-revenue-calculator" />
            <PopularCalculators exclude="/calculator/ecommerce-revenue-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
}
