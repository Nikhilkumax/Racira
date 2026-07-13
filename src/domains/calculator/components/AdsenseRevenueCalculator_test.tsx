"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, BarChart3, MousePointer2, TrendingUp, DollarSign, Calculator, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">AdSense Revenue Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="views" label="Daily Page Views" value={dailyPageViews} onChange={setDailyPageViews} />
                <InputField id="ctr" label="CTR (%)" value={ctr} onChange={setCtr} suffix="%" />
                <InputField id="cpc" label="Avg CPC ($)" value={cpc} onChange={setCpc} prefix="$" />
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
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-2xl font-bold mb-3">Earnings Projections</h2>
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative mb-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Estimated Monthly Revenue</p>
                  <p className="text-4xl font-black text-primary">${results.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-muted-foreground mt-1">Based on {Number(dailyPageViews).toLocaleString()} daily views at {ctr}% CTR</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="card-calculator p-4 text-center border border-border bg-card shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Daily Income</p>
                    <p className="text-2xl font-black text-foreground">${results.daily.toFixed(2)}</p>
                  </div>
                  <div className="card-calculator p-4 text-center border border-border bg-card shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Yearly Income</p>
                    <p className="text-2xl font-black text-foreground">${results.yearly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                <ResultDisplay items={[
                  { label: "Effective Page RPM", value: 0, textValue: `$${results.effectiveRPM.toFixed(2)}`, highlight: true },
                  { label: "Annual Page Views", value: 0, textValue: (parseFloat(dailyPageViews) * 365).toLocaleString() },
                  { label: "Ad Impressions (Est.)", value: 0, textValue: (parseFloat(dailyPageViews) * 2).toLocaleString() },
                ]} />

                <div className="card-calculator !p-4 border border-border bg-card mt-2">
                  <h3 className="font-semibold text-sm mb-3">Monthly Revenue by CTR Scenario</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map(c => ({
                        ctr: `${c.toFixed(1)}%`,
                        monthly: (parseFloat(dailyPageViews) || 0) * (c / 100) * (parseFloat(cpc) || 0) * 30.42
                      }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="ctr" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} cursor={{fill: "transparent"}} />
                        <Bar dataKey="monthly" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering the Mathematics of Digital Advertising Revenue</h2>
              <p>For independent digital publishers, bloggers, and specialized niche content creators, the Google AdSense platform frequently represents the most accessible, foundational method for monetizing web traffic. Despite its immense popularity, the actual mathematical mechanics governing how AdSense generates payouts remain deeply misunderstood by the vast majority of new publishers. Developing a highly profitable, sustainable digital publishing business is not merely about writing excellent content or securing viral traffic spikes; it is fundamentally a game of statistical optimization. To truly scale your digital income, you must intimately understand how the three core pillars of advertising revenue—Traffic Volume, Click-Through Rate (CTR), and Cost Per Click (CPC)—mathematically interact to determine your final monthly deposit.</p>
              
              <h2 className="text-2xl font-bold mb-3">Traffic Volume and User Intent</h2>
              <p>Page views are the raw, unrefined material of your digital publishing business. However, the modern digital economy heavily discriminates between different sources of traffic. A million page views acquired through a viral, entertainment-focused social media post will almost universally generate significantly less revenue than a hundred thousand page views generated via organic search engine queries. The primary difference is user intent. When a user actively types a query into a search engine, they are actively seeking a specific solution, product, or piece of information. They possess high commercial intent. When they arrive on your page, they are far more likely to engage deeply with the content and subsequently click on highly relevant, targeted advertisements. Furthermore, the length of time a user remains engaged with your page—frequently referred to as dwell time—directly influences how many distinct ad impressions they trigger and how likely they are to eventually interact with those promotional placements.</p>
              
              <h2 className="text-2xl font-bold mb-3">Optimizing Your Click-Through Rate (CTR)</h2>
              <p>The Click-Through Rate is the percentage of your total site visitors who actually click on an advertisement. In the broader context of digital publishing, a CTR of just one percent might sound remarkably low to an outsider, but it is entirely standard across many informational niches. However, publishers possess significant control over their CTR through aggressive Ad Placement Optimization. Strategically embedding advertisements near the very top of your content—an area universally known as 'above the fold'—ensures that every single visitor sees the ad before they begin scrolling, which reliably maximizes visibility and interaction. Integrating ad units naturally within the flow of your paragraphs also yields substantially higher interaction rates than pushing all promotional content into an isolated, easily ignored side column. The critical challenge for publishers is balancing this aggressive placement strategy against the user experience. Overloading a page with intrusive advertisements will invariably frustrate users, leading to sky-high bounce rates and long-term damage to your organic search engine rankings.</p>
              
              <h2 className="text-2xl font-bold mb-3">The Crucial Role of Cost Per Click (CPC)</h2>
              <p>While publishers can optimize their layouts to improve CTR, the Cost Per Click is almost entirely dictated by the broader economic value of their chosen niche. The CPC represents exactly how much capital an advertiser is willing to bid in an automated auction to secure a click on your specific website. In highly competitive, high-margin industries such as corporate law, commercial insurance, enterprise software, and wealth management, acquiring a single new client can yield tens of thousands of dollars in profit. Consequently, advertisers in these sectors are routinely willing to bid anywhere from ten to fifty dollars for a single click. Conversely, in broad entertainment niches, casual gaming sites, or general news aggregation, advertisers are primarily paying for cheap brand awareness, resulting in CPCs that frequently hover around five to twenty cents. Choosing to operate in a high-CPC, financially lucrative niche is mathematically the most efficient way to scale your revenue without being forced to exponentially scale your traffic volume.</p>
              
              <h2 className="text-2xl font-bold mb-3">Tracking Performance with Page RPM</h2>
              <p>To effectively evaluate the true profitability of your website, you must look beyond raw daily income and focus on Page RPM (Revenue Per Mille). Page RPM calculates exactly how much money your website generates for every one thousand page views it receives. It acts as the ultimate equalizer, allowing you to accurately compare the financial efficiency of a low-traffic financial blog against a high-traffic entertainment site. If a specialized technology blog generates fifty dollars for every thousand visitors, while a meme aggregation site generates only two dollars per thousand visitors, the technology blog is vastly more efficient and arguably possesses far more commercial potential, even if its absolute traffic numbers are currently lower.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/adsense-revenue-calculator" />
          <PopularCalculators exclude="/calculator/adsense-revenue-calculator" />
        </div>
      </div>
    </>
  );
}

