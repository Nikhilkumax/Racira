"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, BarChart3, MousePointer2, TrendingUp, DollarSign, Calculator, Eye } from "lucide-react";

export default function AdsenseRevenueCalculator() {
  const [dailyPageViews, setDailyPageViews] = useState("5000");
  const [ctr, setCtr] = useState("1.5");
  const [cpc, setCpc] = useState("0.25");
  const [results, setResults] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
    effectiveRPM: 0,
  });

  useEffect(() => { handleCalculate(); }, []);

  const [showResults, setShowResults] = useState(false);
  const handleCalculate = () => {
    const views = parseFloat(dailyPageViews) || 0;
    const ctrPct = (parseFloat(ctr) || 0) / 100;
    const cpcVal = parseFloat(cpc) || 0;

    const daily = views * ctrPct * cpcVal;
    const monthly = daily * 30.42;
    const yearly = daily * 365;
    const effectiveRPM = views > 0 ? (daily / views) * 1000 : 0;

    setResults({
      daily,
      monthly,
      yearly,
      effectiveRPM,
    });
  };

  const reset = () => {
    setDailyPageViews("5000");
    setCtr("1.5");
    setCpc("0.25");
  };

  const faqs = [
    { question: "How does Google AdSense pay you?", answer: "AdSense primarily pays based on CPC (Cost Per Click). Every time a visitor clicks an ad on your site, you earn a share of what the advertiser paid Google. In some cases, you also earn small amounts based on CPM (Cost Per Mille) impressions." },
    { question: "What is a good CTR for AdSense?", answer: "A typical AdSense CTR (Click-Through Rate) ranges from 0.5% to 2%. Anything above 2% is considered very good. CTR depends heavily on ad placement, your site's niche, and the intent of your visitors." },
    { question: "Which niches have the highest AdSense CPC?", answer: "Niches with high commercial value like Insurance, Finance, Law, Software, and Healthcare usually have the highest CPCs, often exceeding $2.00 to $5.00 per click. Entertainment and hobby sites usually have lower CPCs ($0.05 to $0.20)." },
    { question: "How much traffic do I need to make $100 a month with AdSense?", answer: "If your average CPC is $0.20 and your CTR is 1%, you earn $0.002 per page view. To reach $100, you would need roughly 50,000 page views per month." },
    { question: "Is there a minimum payout for AdSense?", answer: "Yes, Google AdSense typically has a minimum payout threshold of $100 (or equivalent in your local currency). Your earnings will roll over each month until you reach this threshold." },
    { question: "Does AdSense revenue depend on visitor location?", answer: "Absolutely. Advertisers pay significantly more for clicks from Tier 1 countries like the USA, UK, Canada, and Australia. A click from the US can be worth 10-20 times more than a click from an emerging market." },
    { question: "Can I increase my AdSense revenue without more traffic?", answer: "Yes, by optimizing ad placements (placing ads 'above the fold'), using 'Auto Ads,' improving site speed, and creating content for higher CPC keywords, you can increase your CTR and CPC even if your traffic stays the same." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "AdSense Revenue Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">AdSense Revenue Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="views" label="Daily Page Views" value={dailyPageViews} onChange={setDailyPageViews} />
                <InputField id="ctr" label="CTR (%)" value={ctr} onChange={setCtr} suffix="%" />
                <InputField id="cpc" label="Avg CPC ($)" value={cpc} onChange={setCpc} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Calculate Earnings
                </button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-xl font-bold mb-6">Earnings Projections</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Daily Income</p>
                    <p className="text-3xl font-black text-foreground">${results.daily.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Income</p>
                    <p className="text-3xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Yearly Income</p>
                    <p className="text-3xl font-black text-foreground">${results.yearly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Effective Page RPM", value: 0, textValue: `$${results.effectiveRPM.toFixed(2)}`, highlight: true },
                  { label: "Annual Page Views", value: 0, textValue: (parseFloat(dailyPageViews) * 365).toLocaleString() },
                  { label: "Ad Impressions (Est.)", value: 0, textValue: (parseFloat(dailyPageViews) * 2).toLocaleString() },
                ]} />
              
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Mastering the Math of AdSense Revenue</h2>
              <p>Google AdSense remains the most accessible way for bloggers, news sites, and niche publishers to monetize their content. However, success with AdSense is a game of statistics. To build a sustainable income, you need to understand how the three pillars of revenue — Traffic, CTR, and CPC — interact to determine your final payout. This calculator is designed to help you run 'what-if' scenarios to find the most efficient path to your income goals.</p>

              <h3>1. Traffic: The Raw Material</h3>
              <p>Page views are the foundation of your revenue, but not all page views are created equal. High-intent traffic from search engines (organic traffic) typically converts at a higher rate than social media traffic. Furthermore, the length of time a user stays on your page (dwell time) affects how many ads they see and how likely they are to engage with them.</p>

              <h3>2. CTR (Click-Through Rate): The Engagement Metric</h3>
              <p>CTR is the percentage of your visitors who actually click an ad. While a 1% CTR might sound low, it is actually the industry standard for many niches. You can influence CTR through 'Ad Placement Optimization.' Placing ads near the top of the content (above the fold) or within the natural flow of text usually yields the highest CTR. However, you must balance this with user experience — too many ads will drive users away, hurting your long-term traffic.</p>

              <h3>3. CPC (Cost Per Click): The Value of the Niche</h3>
              <p>CPC is determined by how much advertisers are willing to bid in an auction to show their ads on your site. This is where your choice of niche matters most. In competitive industries like <strong>Law, Insurance, and Business Finance</strong>, advertisers are willing to pay $10, $20, or even $50 per click because a single lead can be worth thousands. In the entertainment or 'fun facts' niche, advertisers might only pay $0.05 per click. Choosing a high-CPC niche is the fastest way to increase your revenue without necessarily increasing your traffic.</p>

              <h3>4. Page RPM: The Ultimate Benchmark</h3>
              <p>Page RPM (Revenue Per Mille) represents how much you earn for every 1,000 page views. It is calculated by dividing your total earnings by total page views and multiplying by 1,000. RPM is the most useful metric for comparing the profitability of different websites or different sections of your own site. A site with 10,000 views and a $15 RPM is more valuable than a site with 50,000 views and a $2 RPM.</p>

              <h3>5. Strategies for Increasing Your Revenue</h3>
              <p>To maximize your AdSense earnings, focus on three strategies simultaneously:</p>
              <ul>
                <li><strong>Optimize for Tier 1 Traffic:</strong> Create content specifically for users in high-GDP countries to attract higher CPC ads.</li>
                <li><strong>Improve User Intent:</strong> Focus on 'Commercial Intent' keywords where users are looking to buy or sign up for a service.</li>
                <li><strong>Experiment with Ad Formats:</strong> Use Anchor ads, Vignette ads (which appear between page loads), and responsive display ads to find the combination that works best for your layout.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/adsense-revenue-calculator" />
          <PopularCalculators exclude="/calculator/adsense-revenue-calculator" />
        </div>
      </div>
    </>
  );
}

