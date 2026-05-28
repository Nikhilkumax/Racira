"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Share2, DollarSign, Calculator, TrendingUp, Users, Heart, MessageCircle } from "lucide-react";

export default function TiktokEarningsCalculator() {
  const [views, setViews] = useState("100000");
  const [followers, setFollowers] = useState("50000");
  const [engagement, setEngagement] = useState("4.5");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    fundLow: 0,
    fundHigh: 0,
    brandDealLow: 0,
    brandDealHigh: 0,
    monthlyPotential: 0,
  });

  const handleCalculate = () => {
    const v = parseFloat(views) || 0;
    const f = parseFloat(followers) || 0;
    const e = parseFloat(engagement) || 0;

    // TikTok Creator Rewards Program (Newer version of Creator Fund)
    // Pays roughly $0.20 to $1.00 per 1,000 views for 1min+ videos
    const fundLow = (v / 1000) * 0.20;
    const fundHigh = (v / 1000) * 0.80;

    // Brand Deal estimates based on follower count and engagement
    // Standard industry rate: $10-$25 per 1,000 followers per post
    const baseRate = (f / 1000) * 15;
    const engagementMultiplier = e / 3; // 3% is average
    const brandDealLow = baseRate * Math.max(0.5, engagementMultiplier * 0.8);
    const brandDealHigh = baseRate * Math.max(1.2, engagementMultiplier * 1.5);

    const monthlyPotential = (fundLow * 30) + (brandDealLow * 2); // Assuming daily uploads and 2 brand deals a month

    setResults({
      fundLow,
      fundHigh,
      brandDealLow,
      brandDealHigh,
      monthlyPotential,
    });
    setShowResults(true);
  };

  const reset = () => {
    setViews("100000");
    setFollowers("50000");
    setEngagement("4.5");
    setShowResults(false);
  };

  const faqs = [
    { question: "How much does the TikTok Creator Rewards Program pay?", answer: "The newer TikTok Creator Rewards Program (which replaced the Creator Fund) pays significantly more, typically between $0.20 and $1.00 per 1,000 qualified views. This applies primarily to high-quality videos longer than one minute." },
    { question: "What are the requirements for TikTok monetization?", answer: "To join the Rewards Program, you must be 18+ years old, have at least 10,000 followers, and have accrued at least 100,000 valid video views in the last 30 days." },
    { question: "How much do brands pay for a TikTok post?", answer: "Brand deal rates vary wildly, but a common industry benchmark is $10 to $50 per 1,000 followers. However, engagement is the bigger driver; a creator with 50,000 highly engaged followers can often out-earn one with 500,000 inactive followers." },
    { question: "What counts as a 'qualified view' on TikTok?", answer: "A qualified view is one that lasts for at least 5 seconds, is not a paid promotion, and is from a unique user. Repeated views from the same user or very short views do not count toward your rewards payout." },
    { question: "How do I increase my TikTok engagement rate?", answer: "Hook viewers in the first 3 seconds, use trending but relevant audio, reply to comments to build community, and use 'Stitch' or 'Duet' features to interact with other popular content." },
    { question: "Do TikTok Likes help you get paid?", answer: "Not directly. TikTok doesn't pay for likes. However, high like counts signal to the algorithm that your content is engaging, which leads to more views, which then leads to more revenue." },
    { question: "Can I make money with TikTok Shop?", answer: "Yes, the TikTok Shop Affiliate program is currently one of the highest-earning methods for creators. By tagging products in your videos, you can earn a 5-20% commission on every sale made through your link." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "TikTok Earnings Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">TikTok Earnings Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your potential TikTok income from the Creator Rewards Program and sponsored brand partnerships.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="views" label="Avg. Views per Video" value={views} onChange={setViews} tooltip="Average views you expect per video upload." />
                <InputField id="followers" label="Total Followers" value={followers} onChange={setFollowers} tooltip="Your current total follower count." />
                <InputField id="engagement" label="Engagement Rate (%)" value={engagement} onChange={setEngagement} suffix="%" tooltip="Average likes/comments as a percentage of your followers." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Calculator className="h-5 w-5" /> Estimate My Earnings
                </button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-6">Revenue Projections</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Rewards Program (Per Video)</p>
                    <p className="text-4xl font-black text-foreground">${results.fundLow.toFixed(2)} - ${results.fundHigh.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Brand Deal Est. (Per Post)</p>
                    <p className="text-3xl font-black text-foreground">${results.brandDealLow.toLocaleString(undefined, { maximumFractionDigits: 0 })} - ${results.brandDealHigh.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center mb-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Est. Total Monthly Potential</p>
                    <p className="text-5xl font-black text-foreground">${results.monthlyPotential.toLocaleString(undefined, { maximumFractionDigits: 0 })}+</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on consistent posting and occasional sponsorships.</p>
                </div>
                <ResultDisplay items={[
                  { label: "Follower Tier", value: 0, textValue: parseFloat(followers) >= 100000 ? "Macro-Influencer" : "Micro-Influencer" },
                  { label: "Monetization Eligibility", value: 0, textValue: parseFloat(followers) >= 10000 ? "Qualified" : "Need 10k Followers" },
                  { label: "Engagement Benchmark", value: 0, textValue: parseFloat(engagement) > 4 ? "Above Average" : "Industry Standard" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>The New Era of TikTok Monetization</h2>
              <p>TikTok has evolved from a lip-syncing app into one of the most powerful wealth-creation platforms for the creator economy. Unlike YouTube, which relies heavily on long-form ad revenue, TikTok offers a multi-faceted monetization ecosystem that rewards viral reach, niche community building, and direct social commerce. This TikTok Earnings Calculator helps you navigate these different income streams to understand your true market value.</p>

              <h3>1. From Creator Fund to Creator Rewards Program</h3>
              <p>For years, the 'TikTok Creator Fund' was criticized for paying very little (often $0.02 to $0.04 per 1,000 views). In 2023, TikTok introduced the <strong>Creator Rewards Program</strong> (initially called the Creativity Program Beta), which completely changed the math. By incentivizing videos longer than 60 seconds, TikTok began paying RPMs that rival YouTube, ranging from $0.20 to $1.00+. If you are serious about making money directly from TikTok, transition your content to the 1-minute+ format immediately.</p>

              <h3>2. The Brand Deal Economy: Engagement Over Followers</h3>
              <p>In the TikTok ecosystem, a creator's value is not just their follower count; it's their <strong>engagement rate</strong>. Brands are moving away from 'Macro-influencers' with millions of followers but low engagement in favor of 'Micro-influencers' who have deep trust with a smaller niche. A 5% engagement rate on TikTok is considered excellent, while 2-3% is the industry average. If your engagement is high, you can command 'premium' rates that exceed the standard $15 per 1,000 follower benchmark.</p>

              <h3>3. TikTok Shop: The Biggest Opportunity in 2024</h3>
              <p>The launch of TikTok Shop has created a 'gold rush' for creators. By becoming a TikTok Shop Affiliate, you can earn commissions on products you feature in your videos. Unlike traditional brand deals, which are one-time payments, TikTok Shop revenue is uncapped. A single viral video featuring a $30 product with a 15% commission can generate thousands of dollars in a single day, regardless of your follower count.</p>

              <h3>4. LIVE Gifting and Subscriptions</h3>
              <p>For creators who enjoy direct interaction, TikTok LIVE is a massive revenue stream. Viewers can buy 'Coins' to send virtual 'Gifts' during a live stream, which the creator can then convert into 'Diamonds' and eventually cash out. While TikTok takes a significant 50% cut of LIVE revenue, top streamers earn five or even six figures a month solely through the generosity of their community.</p>

              <h3>5. How to Scale Your TikTok Income</h3>
              <p>To maximize the numbers you see on this calculator, follow these three scaling laws:</p>
              <ul>
                <li><strong>Quantity Leads to Quality:</strong> The TikTok algorithm is a volume game. Posting 1-3 times daily increases your surface area for virality.</li>
                <li><strong>Build a 'Searchable' Niche:</strong> TikTok is increasingly becoming a search engine. Create content that answers specific questions to gain 'evergreen' views that pay long after the video is posted.</li>
                <li><strong>Diversify Immediately:</strong> Don't wait for the Rewards Program. Start using affiliate links and seeking small brand partnerships as soon as you hit 1,000 followers.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tiktok-earnings-calculator" />
          <PopularCalculators exclude="/calculator/tiktok-earnings-calculator" />
        </div>
      </div>
    </>
  );
}
