"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface YoutubeRevenueResult {
  daily: number;
  monthly: number;
  yearly: number;
  viewsPerYear: number;
  viewsPerMonth: number;
  chartData: { name: string; revenue: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcYoutubeRevenue(dailyViews: number, rpm: number, uploadFreq: number, ctr: number): YoutubeRevenueResult {
  const daily = (dailyViews / 1000) * rpm;
  const monthly = daily * 30.42;
  const yearly = daily * 365;
  const viewsPerYear = dailyViews * 365;
  const viewsPerMonth = dailyViews * 30.42;

  const chartData = [
    { name: "Daily", revenue: daily },
    { name: "Monthly", revenue: monthly },
    { name: "Yearly", revenue: yearly },
  ];

  const breakdown = [
    { label: "Daily Views", value: dailyViews.toLocaleString() },
    { label: "Estimated RPM", value: `$${rpm.toFixed(2)}` },
    { label: "Daily Revenue", value: `$${daily.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Monthly Revenue", value: `$${monthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Yearly Revenue", value: `$${yearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Revenue", value: `$${monthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Yearly Revenue", value: `$${yearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Views", value: viewsPerYear.toLocaleString("en-US", { maximumFractionDigits: 0 }) },
    { label: "Monthly Views", value: viewsPerMonth.toLocaleString("en-US", { maximumFractionDigits: 0 }) },
    { label: "Videos/Month", value: `${uploadFreq} uploads` },
    { label: "Est. CTR", value: `${ctr.toFixed(1)}%` },
  ];

  return { daily, monthly, yearly, viewsPerYear, viewsPerMonth, chartData, breakdown, summaryStats };
}

const DEFAULTS = { dailyViews: "10000", rpm: "4.50", uploadFreq: "4", ctr: "5.5" };

export default function YoutubeRevenueCalculator() {
  const [dailyViews, setDailyViews] = useState(DEFAULTS.dailyViews);
  const [rpm, setRpm] = useState(DEFAULTS.rpm);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadFreq, setUploadFreq] = useState(DEFAULTS.uploadFreq);
  const [ctr, setCtr] = useState(DEFAULTS.ctr);
  
  const [result, setResult] = useState<YoutubeRevenueResult | null>(null);

  const calculate = () => setResult(calcYoutubeRevenue(
    parseFloat(dailyViews) || 0, parseFloat(rpm) || 0, parseFloat(uploadFreq) || 0, parseFloat(ctr) || 0
  ));
  
  const reset = () => { 
    setDailyViews(DEFAULTS.dailyViews); setRpm(DEFAULTS.rpm); 
    setUploadFreq(DEFAULTS.uploadFreq); setCtr(DEFAULTS.ctr);
    setShowAdvanced(false);
    setResult(calcYoutubeRevenue(10000, 4.50, 4, 5.5)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between CPM and RPM?", answer: "CPM (Cost Per Mille) is the gross cost an advertiser pays for 1,000 ad impressions. RPM (Revenue Per Mille) is the net amount you actually earn per 1,000 views. RPM accounts for YouTube's 45% revenue share and factors in views that didn't show ads (monetized playbacks). RPM is the only number that truly dictates your take-home pay." },
    { question: "How much does YouTube pay per 1,000 views?", answer: "On average, YouTube pays between $2 and $12 per 1,000 views (RPM). However, this varies wildly by your niche and audience demographics. Finance, investing, and software channels can earn $30+ RPM, while gaming, prank, or compilation channels might earn closer to $1 to $3 RPM." },
    { question: "How many views do I need to make $100 a day?", answer: "This depends entirely on your RPM. If your channel has an average RPM of $4.00, you would need 25,000 daily views to earn $100 a day. If you are in a highly lucrative niche with a $10.00 RPM, you only need 10,000 daily views to hit that same $100 goal." },
    { question: "Does YouTube pay for likes or subscribers?", answer: "No, YouTube does not pay creators directly for likes, comments, shares, or subscribers. However, these engagement metrics are critical for the algorithm. High engagement signals to YouTube that your video is good, causing them to recommend it to more people, which increases your views and, consequently, your revenue." },
    { question: "When do I start getting paid by YouTube?", answer: "To start earning ad revenue, you must join the YouTube Partner Program (YPP). The standard requirements are reaching 1,000 subscribers and accumulating either 4,000 valid public watch hours on long-form videos in the last 12 months, or 10 million public Shorts views in the last 90 days." },
    { question: "Which countries pay the highest CPM?", answer: "Views from 'Tier 1' countries—such as the United States, United Kingdom, Canada, Australia, and Norway—command the highest CPMs. Advertisers in these markets are willing to pay a premium because consumers in these countries generally possess higher disposable purchasing power." },
    { question: "How do mid-roll ads affect revenue?", answer: "Videos longer than 8 minutes are eligible for mid-roll ads (ads placed in the middle of the video). By strategically adding mid-rolls, you increase the 'ad density' of your content, meaning one viewer might watch three ads instead of one. This can significantly increase your RPM on long-form content." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "YouTube Revenue Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">YouTube Revenue Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Average Daily Views</label><div className={inp}><input type="number" value={dailyViews} onChange={e => setDailyViews(e.target.value)} className={ci} /></div></div>
            <div><label className="text-sm font-medium mb-1.5 block">Estimated RPM ($)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={rpm} onChange={e => setRpm(e.target.value)} step={0.1} className={ci} /></div></div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Channel Metrics {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div><label className="text-sm font-medium mb-1.5 block">Uploads/Month</label><div className={inp}><input type="number" value={uploadFreq} onChange={e => setUploadFreq(e.target.value)} className={ci} /></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Avg CTR (%)</label><div className={inp}><input type="number" value={ctr} onChange={e => setCtr(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Yearly Earnings</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.yearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Monthly: ${result.monthly.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Daily: ${result.daily.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Daily Views", result.breakdown[0].value], ["Monthly Views", result.viewsPerMonth.toLocaleString("en-US", { maximumFractionDigits: 0 })], ["Yearly Views", result.viewsPerYear.toLocaleString("en-US", { maximumFractionDigits: 0 })]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Earnings Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Yearly Revenue") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Revenue Projection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
                    <Bar dataKey="revenue" name="Earnings" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a YouTube Revenue Calculator?</h2>
            <p>A YouTube revenue calculator is an essential forecasting tool for content creators, digital marketers, and entrepreneurs looking to understand the financial viability of building a YouTube channel. YouTube has evolved from a simple video-sharing platform into a massive global economic engine, minting millionaires and providing sustainable, full-time careers for millions of creators worldwide. However, the actual mathematics behind how YouTube pays its creators is famously opaque and confusing for beginners.</p>
            <p>Because earnings fluctuate wildly based on dozens of algorithmic variables—from viewer demographics to video length—predicting your monthly AdSense payout can be frustrating. This calculator cuts through the complexity by isolating the two most critical metrics in the YouTube Partner Program: Traffic (Daily Views) and Revenue Per Mille (RPM). By adjusting these inputs, creators can mathematically determine exactly how much traffic they need to quit their day jobs, or how improving their niche to boost RPM could double their income without requiring a single new subscriber.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematics behind YouTube AdSense forecasting rely on a standardized advertising formula. The core engine of this calculator processes your inputs using the following logic to project your earnings.</p>
            <p>First, it identifies your <strong>Monetized View Units</strong>. Because YouTube pays per 1,000 views, the calculator divides your Average Daily Views by 1,000. For example, if you generate 50,000 views a day, you have 50 monetized units.</p>
            <p>Next, it calculates your <strong>Daily Revenue</strong> by multiplying those units by your Estimated RPM (Revenue Per Mille). Formula: <code>Daily Revenue = (Daily Views / 1000) * RPM</code>. If your RPM is $5.00, those 50 units will generate $250.00 a day in pure profit.</p>
            <p>Finally, the calculator extrapolates this daily revenue out to find your Monthly and Yearly estimates by multiplying by 30.42 (the average days in a month) and 365, respectively. It also tracks the total volume of traffic required to hit those numbers, providing a stark reality check on the scale required to build a massive YouTube business.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you generate a calculation, the tool provides five distinct analytical sections designed to help you interpret your channel's monetization potential.</p>
            <p><strong>Primary Result Card:</strong> This highlights your Estimated Yearly Earnings. For full-time creators treating YouTube as a business, the annualized figure is the most critical for tax planning and determining a true salary equivalent.</p>
            <p><strong>3-Stat Bar:</strong> This section breaks down the sheer volume of traffic your channel is pushing, displaying your Daily, Monthly, and Yearly Views. Generating millions of views annually is often a prerequisite for a full-time income in low-RPM niches.</p>
            <p><strong>Earnings Breakdown Table:</strong> A line-item accounting that breaks down the math, showing exactly how your views and RPM translate into tiered revenue payouts over time.</p>
            <p><strong>Revenue Projection Chart:</strong> A visual bar chart that dramatically illustrates the compounding effect of daily earnings over a month and a year. It reinforces the concept that consistency (earning a small amount every single day) scales into massive annual revenue.</p>
            <p><strong>Summary Statistics:</strong> A comprehensive grid aggregating the most critical metrics, including advanced inputs like your Click-Through Rate (CTR) and upload frequency, which are vital for channel growth analysis.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors: CPM vs RPM</h2>
            <p>To successfully maximize your YouTube earnings, you must deeply understand the difference between CPM and RPM, and why RPM is the only metric you should focus on.</p>
            <p><strong>CPM (Cost Per Mille):</strong> This is the gross amount that an advertiser pays YouTube to display 1,000 ad impressions on your videos. If an advertiser bids a $10 CPM, they pay $10. However, you do not keep $10. YouTube takes a 45% revenue share, leaving 55% for the creator.</p>
            <p><strong>RPM (Revenue Per Mille):</strong> This is the net amount you actually earn and deposit into your bank account for every 1,000 views. RPM accounts for YouTube's 45% cut. Furthermore, it accounts for the fact that not every view is monetized (some viewers use ad-blockers, and sometimes YouTube simply doesn't have an ad to serve). RPM is your true, blended earning rate. If you want to forecast your income accurately, always use RPM, never CPM.</p>

            <h2 className="text-2xl font-bold mb-3">The "Niche" Factor</h2>
            <p>One of the biggest shocks to new creators is that two channels with identical view counts can have vastly different incomes. This disparity is entirely driven by the channel's niche (subject matter).</p>
            <p>Advertisers bid aggressively for audiences with high commercial intent and disposable income. A personal finance channel discussing stocks or a software review channel discussing SaaS products might enjoy an RPM of $20 to $40. Why? Because a single customer acquired from those ads might be worth thousands of dollars to an advertiser.</p>
            <p>Conversely, general entertainment channels—like gaming, pranks, vlogs, or meme compilations—attract a younger, broader audience with less purchasing power. These channels often suffer from very low RPMs, ranging from $1 to $3. A finance channel might need 50,000 views to make $1,000, while a gaming channel might need 1,000,000 views to make that same $1,000.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Channel Metrics tab in this calculator provides deeper contextual data for creators actively managing their growth strategy.</p>
            <p>By inputting <strong>Uploads/Month</strong>, you can mentally align your production schedule with your revenue goals. If you need 500,000 views a month to hit your financial target, and you only upload 4 videos a month, you know each video must average 125,000 views.</p>
            <p>The <strong>Avg CTR (Click-Through Rate)</strong> input is a reminder of the most important growth metric on YouTube. Your CTR (how often people click your thumbnail) dictates your impressions. While CTR doesn't directly alter the mathematical revenue formula, a high CTR is the only way to generate the massive "Average Daily Views" required to fuel the revenue engine.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how the niche dictates the financial reality of two different YouTube channels.</p>
            <p><strong>Example 1: The Viral Gamer.</strong> You run a successful gaming channel generating a massive 100,000 daily views. However, because gaming has low advertiser demand, your RPM is only $1.50. You input these numbers. Your Daily Revenue is $150. Your Monthly Revenue is $4,563. Your Yearly Revenue is $54,750. Despite pushing 36 million views a year, the revenue is comparable to a standard entry-level salary.</p>
            <p><strong>Example 2: The B2B Tech Reviewer.</strong> You run a highly targeted channel reviewing business software. You only get 5,000 daily views. However, because software companies bid heavily for your audience, your RPM is a staggering $25.00. You input these numbers. Your Daily Revenue is $125. Your Monthly Revenue is $3,802. Your Yearly Revenue is $45,625. With only 5% of the traffic of the gaming channel, you are making nearly the same amount of money, requiring vastly less viral pressure.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Relying solely on YouTube AdSense is risky. The most successful creators use AdSense as a baseline and build a diverse business around it.</p>
            <p>First, always push your videos past the 8-minute mark. Videos longer than 8 minutes are eligible for mid-roll ads. Adding mid-rolls can immediately double or triple your RPM because you are showing multiple ads to a single viewer during one watch session.</p>
            <p>Second, diversify your income. Brand sponsorships (direct deals where you promote a product in the video) often pay 3x to 5x more than AdSense for the same amount of views. Additionally, utilize affiliate marketing, channel memberships, and digital products (like courses or merchandise) to monetize your most loyal fans directly.</p>
            <p>Third, study your geography. Views from Tier 1 countries (US, UK, Canada, Australia) pay significantly more than views from emerging markets. Tailoring your content style, language, and cultural references to appeal to Tier 1 audiences is the fastest way to artificially inflate your RPM.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using a YouTube revenue calculator transforms your channel from a creative hobby into a predictable business model. It removes the mystery of the algorithm and replaces it with cold, actionable mathematics.</p>
            <p>By understanding exactly how Traffic and RPM interact, you can stop blindly chasing viral views and instead focus on strategic growth. You'll know exactly whether you need to increase your upload frequency to boost total views, or if you need to pivot your content into a more lucrative niche to raise your RPM, ultimately giving you a clear roadmap to becoming a full-time professional creator.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/youtube-revenue-calculator" />
          <PopularCalculators exclude="/calculator/youtube-revenue-calculator" />
        </div>
      </div>
    </>
  );
}
