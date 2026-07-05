"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Heart, Calculator, Users, MessageCircle, TrendingUp, BarChart3, Camera } from "lucide-react";

export default function InstagramEngagementCalculator() {
  const [followers, setFollowers] = useState("10000");
  const [avgLikes, setAvgLikes] = useState("450");
  const [avgComments, setAvgComments] = useState("25");
  const [avgSaves, setAvgSaves] = useState("15");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    engagementRate: 0,
    status: "",
    totalInteractions: 0,
    estimatedValuePerPost: 0,
  });

  const handleCalculate = () => {
    const f = parseFloat(followers) || 0;
    const l = parseFloat(avgLikes) || 0;
    const c = parseFloat(avgComments) || 0;
    const s = parseFloat(avgSaves) || 0;

    const totalInteractions = l + c + s;
    const engagementRate = f > 0 ? (totalInteractions / f) * 100 : 0;

    let status = "Average";
    if (engagementRate > 6) status = "Elite";
    else if (engagementRate > 3.5) status = "Good";
    else if (engagementRate < 1.5) status = "Below Average";

    // Rough estimate of value per post based on engagement and market rates
    const estimatedValuePerPost = (totalInteractions * 0.5) + (f * 0.01);

    setResults({
      engagementRate,
      status,
      totalInteractions,
      estimatedValuePerPost,
    });
    setShowResults(true);
  };

  const reset = () => {
    setFollowers("10000");
    setAvgLikes("450");
    setAvgComments("25");
    setAvgSaves("15");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is a good engagement rate on Instagram?", answer: "A 'good' engagement rate typically ranges from 1.5% to 3.5%. For accounts with fewer than 10,000 followers, rates are often higher (5-10%). As your follower count grows, your engagement rate naturally tends to decrease due to the algorithm's reach limitations." },
    { question: "How is Instagram engagement calculated?", answer: "The most common formula is: ((Likes + Comments + Saves) / Total Followers) * 100. Some professionals also calculate engagement based on 'Reach' (people who actually saw the post) instead of total followers, which often yields a higher and more accurate percentage of active interest." },
    { question: "Why is my engagement rate dropping?", answer: "Engagement can drop due to algorithm changes, posting inconsistent content, using 'shadowbanned' hashtags, or having a high number of inactive or bot followers. It can also happen if your content no longer resonates with the specific interests of your audience." },
    { question: "Do Saves and Shares count toward engagement?", answer: "Yes! In fact, the Instagram algorithm currently values 'Saves' and 'Shares' more than 'Likes' because they represent a deeper level of interest and intent. Saves tell Instagram that your content is high-value and worth revisiting." },
    { question: "What is the best time to post on Instagram?", answer: "The best time varies by audience location and habits. However, generally, posting between 9 AM and 11 AM (local time of your majority audience) on weekdays yields the highest initial engagement, which helps propel the post into more feeds." },
    { question: "How many followers do I need for brands to pay me?", answer: "There is no magic number. 'Nano-influencers' with as few as 1,000 followers can get paid if their engagement rate is extremely high (7%+) and they are in a specific, valuable niche like high-end fashion or tech." },
    { question: "Does the number of hashtags affect engagement?", answer: "Research suggests that using 3 to 5 highly relevant hashtags is currently more effective than using the maximum limit of 30. Using too many irrelevant hashtags can lead the algorithm to categorize your content incorrectly." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Instagram Engagement Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Instagram Engagement Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <InputField id="followers" label="Total Followers" value={followers} onChange={setFollowers} tooltip="Your current total follower count." />
                <InputField id="likes" label="Avg. Likes" value={avgLikes} onChange={setAvgLikes} />
                <InputField id="comments" label="Avg. Comments" value={avgComments} onChange={setAvgComments} />
                <InputField id="saves" label="Avg. Saves" value={avgSaves} onChange={setAvgSaves} />
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
                <h2 className="text-2xl font-bold mb-3">Account Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Engagement Rate</p>
                    <p className="text-5xl font-black text-foreground">{results.engagementRate.toFixed(2)}%</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.status === "Elite" || results.status === "Good" ? "bg-green-500/5 border-green-500/10" : "bg-orange-500/5 border-orange-500/10"}`}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Benchmark Status</p>
                    <p className={`text-3xl font-black ${results.status === "Elite" || results.status === "Good" ? "text-green-600" : "text-orange-600"}`}>{results.status}</p>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center mb-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Est. Sponsored Post Value</p>
                    <p className="text-4xl font-black text-foreground">${results.estimatedValuePerPost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on current engagement metrics and industry averages.</p>
                </div>
                <ResultDisplay items={[
                  { label: "Avg. Interactions", value: 0, textValue: results.totalInteractions.toLocaleString() },
                  { label: "Follower Tier", value: 0, textValue: parseFloat(followers) < 10000 ? "Nano-Influencer" : "Micro-Influencer" },
                  { label: "Algorithm Health", value: 0, textValue: results.engagementRate > 2.5 ? "Very Healthy" : "Needs Improvement" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering Instagram Engagement Metrics</h2>
              <p>In the early days of Instagram, a high follower count was the only metric that mattered. Today, the landscape has shifted entirely. Brands, agencies, and the Instagram algorithm itself now prioritize <strong>engagement</strong> over raw numbers. This Instagram Engagement Calculator is designed to help you see past the 'vanity metrics' and understand the true health and commercial value of your social presence.</p>

              <h3>1. The Shift from Followers to Interaction</h3>
              <p>Why does engagement matter so much? Because it is easy to fake followers but difficult to fake consistent, meaningful interaction. A 'ghost' follower who never sees your posts adds zero value to your account. In fact, having too many inactive followers actually hurts you, as it tells the algorithm that even your own audience isn't interested in your content, leading to lower reach for your active followers.</p>

              <h3>2. Decoding the Algorithm: Likes vs. Comments vs. Saves</h3>
              <p>Not all engagement is created equal. Instagram uses a weighted system to determine which posts to push to the 'Explore' page and the top of user feeds:</p>
              <ul>
                <li><strong>Likes:</strong> The most common but least valuable. It's a low-effort interaction.</li>
                <li><strong>Comments:</strong> More valuable, especially if they are more than 4 words long. This signals deep engagement and community.</li>
                <li><strong>Shares:</strong> Extremely valuable as it brings new users to your profile and signals high virality potential.</li>
                <li><strong>Saves:</strong> The current 'Holy Grail.' A save tells Instagram your content is evergreen, useful, and high-quality.</li>
              </ul>

              <h3>3. Benchmarking: What is 'Good' Engagement?</h3>
              <p>Engagement rates are relative to your account size. A small account with 2,000 followers should aim for an engagement rate of 7-10%. As you scale toward 100,000 followers, a rate of 2-3% becomes the healthy standard. If you have 50,000 followers but only get 100 likes per post (0.2% ER), your account is likely suffering from 'follower decay' or has a high percentage of bot accounts.</p>

              <h3>4. Influencer Valuation: What Are You Worth?</h3>
              <p>When brands look to partner with influencers, they use engagement rate to calculate their ROI. A common industry formula is the <strong>CPE (Cost Per Engagement)</strong>. If a brand pays you $500 for a post that generates 1,000 interactions, their CPE is $0.50. High-quality influencers in specific niches can often command $1.00 to $2.00 per engagement. Use our calculator's 'Estimated Value' as a starting point for your next brand negotiation.</p>

              <h3>5. How to Boost Your Engagement Rate</h3>
              <p>If the results of this calculator were lower than you hoped, don't worry. Engagement is a dynamic metric that can be improved with strategy:</p>
              <ul>
                <li><strong>Leverage Instagram Reels:</strong> Reels currently receive the highest organic reach and engagement of any post type on the platform.</li>
                <li><strong>Engage First:</strong> Spend 15 minutes before and after posting engaging with other accounts in your niche. This signals the algorithm that you are an active member of the community.</li>
                <li><strong>Use Interactive Stories:</strong> Polls, sliders, and 'Add Yours' stickers are low-friction ways to keep your audience interacting with your brand daily.</li>
                <li><strong>Clean Your Follower List:</strong> Periodically removing 'ghost' or bot accounts can actually increase your overall engagement percentage and reach.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/instagram-engagement-calculator" />
          <PopularCalculators exclude="/calculator/instagram-engagement-calculator" />
        </div>
      </div>
    </>
  );
}
