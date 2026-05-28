"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Video, DollarSign, Calculator, TrendingUp, BarChart3, Globe, Users } from "lucide-react";

export default function YoutubeRevenueCalculator() {
  const [dailyViews, setDailyViews] = useState("10000");
  const [rpm, setRpm] = useState("4.50");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
    viewsPerYear: 0,
  });

  const handleCalculate = () => {
    const views = parseFloat(dailyViews) || 0;
    const rpmVal = parseFloat(rpm) || 0;

    const daily = (views / 1000) * rpmVal;
    const monthly = daily * 30.42;
    const yearly = daily * 365;

    setResults({
      daily,
      monthly,
      yearly,
      viewsPerYear: views * 365,
    });
    setShowResults(true);
  };

  const reset = () => {
    setDailyViews("10000");
    setRpm("4.50");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is the difference between CPM and RPM?", answer: "CPM (Cost Per Mille) is the cost an advertiser pays for 1,000 ad impressions. RPM (Revenue Per Mille) is what you actually earn per 1,000 views after YouTube's 45% revenue share and accounting for views that didn't show ads. RPM is the more accurate measure of your actual take-home pay." },
    { question: "How much does YouTube pay per 1,000 views?", answer: "On average, YouTube pays between $2 and $12 per 1,000 views (RPM). However, this varies wildly by niche. Finance and business channels can earn $30+ RPM, while gaming or comedy channels might earn closer to $1-$3." },
    { question: "How many views do I need to make $100 a day?", answer: "At an average RPM of $4.00, you would need 25,000 monetized views per day to earn $100. If your RPM is higher ($10.00), you only need 10,000 views per day." },
    { question: "Does YouTube pay for likes or subscribers?", answer: "No, YouTube does not pay for likes, comments, or subscribers directly. However, these metrics are critical for the algorithm to recommend your videos to more people, which increases your view count and potential revenue." },
    { question: "When do I start getting paid by YouTube?", answer: "You must first join the YouTube Partner Program (YPP), which requires 1,000 subscribers and either 4,000 valid public watch hours in the last 12 months or 10 million public Shorts views in the last 90 days." },
    { question: "Which countries pay the highest CPM?", answer: "Views from 'Tier 1' countries like the United States, United Kingdom, Canada, Australia, and Norway typically command the highest CPMs because advertisers in those markets are willing to pay more to reach consumers with high purchasing power." },
    { question: "How do mid-roll ads affect revenue?", answer: "Videos longer than 8 minutes are eligible for mid-roll ads. Adding mid-rolls can significantly increase your RPM because you are showing more than one ad per viewer, effectively doubling or tripling the revenue from a single long-form view." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "YouTube Revenue Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">YouTube Revenue Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your potential YouTube earnings based on daily views and your channel's specific RPM.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="daily-views" label="Average Daily Views" value={dailyViews} onChange={setDailyViews} tooltip="Total views your channel receives across all videos in a typical 24-hour period." />
                <InputField id="rpm" label="Estimated RPM ($)" value={rpm} onChange={setRpm} prefix="$" tooltip="Revenue Per Mille: What you earn per 1,000 views after YouTube's cut." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Calculator className="h-5 w-5" /> Calculate Earnings
                </button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-6">Earnings Forecast</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Daily Profit</p>
                    <p className="text-3xl font-black text-foreground">${results.daily.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Profit</p>
                    <p className="text-3xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Yearly Profit</p>
                    <p className="text-3xl font-black text-foreground">${results.yearly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Annual Views", value: 0, textValue: results.viewsPerYear.toLocaleString(), highlight: true },
                  { label: "Estimated RPM", value: 0, textValue: `$${parseFloat(rpm).toFixed(2)}` },
                  { label: "Daily View Target", value: 0, textValue: dailyViews },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Maximizing Your YouTube Revenue: The Definitive Guide</h2>
              <p>YouTube has transformed from a simple video-sharing site into a global economic engine, minting millionaires and providing sustainable careers for millions of creators. However, understanding the actual math behind YouTube payments is often confusing for new creators. This YouTube Revenue Calculator is designed to demystify those numbers and help you plan your content strategy for maximum profitability.</p>

              <h3>Understanding CPM vs. RPM</h3>
              <p>The two most important acronyms in the YouTube economy are CPM and RPM. While they sound similar, they represent very different parts of the financial chain:</p>
              <ul>
                <li><strong>CPM (Cost Per Mille):</strong> This is the gross amount that advertisers pay to show 1,000 ads on your channel. YouTube takes a 45% cut of this amount before it ever reaches you.</li>
                <li><strong>RPM (Revenue Per Mille):</strong> This is the net amount you actually earn for every 1,000 views. It accounts for YouTube's revenue share and also includes revenue from other sources like YouTube Premium, Channel Memberships, and Super Chats. <strong>RPM is the only number that truly matters for your bank account.</strong></li>
              </ul>

              <h3>The "Niche" Factor: Why Some Channels Earn 10x More</h3>
              <p>One of the biggest shocks to new creators is that two channels with identical view counts can have vastly different incomes. A gaming channel with 1 million views might earn $2,000, while a personal finance channel with the same 1 million views could earn $30,000. This is due to advertiser demand.</p>
              <p>High-value niches like <strong>Finance, Real Estate, Insurance, and Business Software (SaaS)</strong> have high CPMs because the customers being reached are worth thousands of dollars to the advertisers. Conversely, general entertainment, memes, or gaming niches have lower CPMs because the audience is broader and less targeted for specific high-ticket purchases.</p>

              <h3>Geographic Impact on Earnings</h3>
              <p>Where your viewers live is just as important as what they watch. Advertisers in the United States, Canada, the UK, Australia, and Western Europe (Tier 1 countries) pay the highest rates because their consumers have higher disposable income. A view from a high-GDP country can be worth 10 to 50 times more than a view from a lower-GDP country. Successful global creators often optimize their content (using English and specific cultural references) to attract a more valuable Tier 1 audience.</p>

              <h3>The 8-Minute Milestone: Mid-Roll Ads</h3>
              <p>If you want to significantly boost your RPM, your videos should be at least 8 minutes long. Videos of this length are eligible for <strong>mid-roll ads</strong>, which are ads that play during the middle of the video. By strategically placing mid-rolls, you increase the "ad density" of your content. Instead of just one ad at the beginning, a viewer might see three or four, effectively multiplying your revenue from that single viewer.</p>

              <h3>Diversifying Revenue Beyond AdSense</h3>
              <p>Top-tier YouTubers rarely rely on AdSense alone. In fact, for many, ad revenue represents less than 30% of their total income. To truly build a YouTube business, you must diversify:</p>
              <ul>
                <li><strong>Brand Sponsorships:</strong> Direct deals where you promote a product inside your video. These often pay 2-5x more than AdSense.</li>
                <li><strong>Affiliate Marketing:</strong> Earning a commission on products linked in your description (e.g., Amazon Associates).</li>
                <li><strong>Digital Products:</strong> Selling courses, presets, or e-books directly to your audience.</li>
                <li><strong>Merchandise:</strong> Selling physical products like t-shirts or hats through platforms like Fourthwall or Shopify.</li>
                <li><strong>Channel Memberships:</strong> Monthly recurring revenue from your most loyal fans in exchange for perks.</li>
              </ul>

              <h3>The Impact of YouTube Shorts</h3>
              <p>YouTube Shorts has its own monetization model. Instead of a direct revenue share on each video, Shorts revenue is pulled from a "Creator Pool" and distributed based on your share of total views and music usage. While Shorts RPM is much lower than long-form content (typically $0.02 to $0.10), the potential for massive, viral reach is much higher, making it a powerful tool for channel growth and brand awareness.</p>

              <h3>Using This Calculator for Goal Setting</h3>
              <p>Don't just use this calculator to see what you're earning now — use it to set targets. If your goal is to earn $5,000 per month and your current RPM is $5.00, you know you need to reach 1,000,000 views per month. If that seems impossible, you have two choices: find a way to get more views, or find a way to increase your RPM (by shifting your niche or targeting a different audience).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/youtube-revenue-calculator" />
          <PopularCalculators exclude="/calculator/youtube-revenue-calculator" />
        </div>
      </div>
    </>
  );
}
