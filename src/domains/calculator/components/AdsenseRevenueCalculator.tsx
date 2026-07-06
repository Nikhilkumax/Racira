"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AdsenseResult {
  daily: number;
  monthly: number;
  yearly: number;
  effectiveRPM: number;
  clicksPerDay: number;
  totalImpressions: number;
  chartData: { name: string; earnings: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcAdsense(views: number, ctr: number, cpc: number, pagesPerVisit: number, adUnits: number): AdsenseResult {
  const ctrPct = ctr / 100;
  
  // Total impressions based on ad units and views
  const totalImpressions = views * adUnits;
  
  const clicksPerDay = views * ctrPct;
  const daily = clicksPerDay * cpc;
  const monthly = daily * 30.42;
  const yearly = daily * 365;
  const effectiveRPM = views > 0 ? (daily / views) * 1000 : 0;
  
  const visitors = pagesPerVisit > 0 ? views / pagesPerVisit : views;

  const chartData = [
    { name: "Daily", earnings: daily },
    { name: "Monthly", earnings: monthly },
    { name: "Yearly", earnings: yearly },
  ];

  const breakdown = [
    { label: "Daily Page Views", value: views.toLocaleString() },
    { label: "Estimated Daily Visitors", value: Math.round(visitors).toLocaleString() },
    { label: "Ad Clicks Per Day", value: Math.round(clicksPerDay).toLocaleString() },
    { label: "Daily Ad Impressions", value: Math.round(totalImpressions).toLocaleString() },
    { label: "Average Cost Per Click (CPC)", value: `$${cpc.toFixed(2)}` },
    { label: "Effective Page RPM", value: `$${effectiveRPM.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Daily Earnings", value: `$${daily.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Monthly Earnings", value: `$${monthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Yearly Earnings", value: `$${yearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Page RPM", value: `$${effectiveRPM.toFixed(2)}` },
    { label: "Est. Ad Impressions/Mo", value: (totalImpressions * 30.42).toLocaleString("en-US", { maximumFractionDigits: 0 }) },
    { label: "Est. Clicks/Mo", value: (clicksPerDay * 30.42).toLocaleString("en-US", { maximumFractionDigits: 0 }) },
  ];

  return { daily, monthly, yearly, effectiveRPM, clicksPerDay, totalImpressions, chartData, breakdown, summaryStats };
}

const DEFAULTS = { views: "5000", ctr: "1.5", cpc: "0.25", pagesPerVisit: "1.5", adUnits: "3" };

export default function AdsenseRevenueCalculator() {
  const [views, setViews] = useState(DEFAULTS.views);
  const [ctr, setCtr] = useState(DEFAULTS.ctr);
  const [cpc, setCpc] = useState(DEFAULTS.cpc);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pagesPerVisit, setPagesPerVisit] = useState(DEFAULTS.pagesPerVisit);
  const [adUnits, setAdUnits] = useState(DEFAULTS.adUnits);
  
  const [result, setResult] = useState<AdsenseResult | null>(null);

  const calculate = () => setResult(calcAdsense(
    parseFloat(views) || 0, parseFloat(ctr) || 0, parseFloat(cpc) || 0, parseFloat(pagesPerVisit) || 0, parseFloat(adUnits) || 0
  ));
  
  const reset = () => { 
    setViews(DEFAULTS.views); setCtr(DEFAULTS.ctr); setCpc(DEFAULTS.cpc);
    setPagesPerVisit(DEFAULTS.pagesPerVisit); setAdUnits(DEFAULTS.adUnits);
    setShowAdvanced(false);
    setResult(calcAdsense(5000, 1.5, 0.25, 1.5, 3)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "AdSense Revenue Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">AdSense Revenue Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Daily Page Views</label><div className={inp}><input type="number" value={views} onChange={e => setViews(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Click-Through Rate</label><div className={inp}><input type="number" value={ctr} onChange={e => setCtr(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Avg CPC</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={cpc} onChange={e => setCpc(e.target.value)} step={0.01} className={ci} /></div></div>
            </div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div><label className="text-sm font-medium mb-1.5 block">Pages Per Visit</label><div className={inp}><input type="number" value={pagesPerVisit} onChange={e => setPagesPerVisit(e.target.value)} step={0.1} className={ci} /></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Ad Units Per Page</label><div className={inp}><input type="number" value={adUnits} onChange={e => setAdUnits(e.target.value)} className={ci} /></div></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Earnings</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Daily: ${result.daily.toFixed(2)} · Yearly: ${result.yearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Page RPM", `$${result.effectiveRPM.toFixed(2)}`], ["Daily Clicks", `${Math.round(result.clicksPerDay).toLocaleString()}`], ["Yearly Income", `$${result.yearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Traffic & Revenue Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Effective Page RPM") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Earnings Projection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
                    <Bar dataKey="earnings" name="Earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">What Is an AdSense Revenue Calculator?</h2>
            <p>An AdSense revenue calculator is a vital predictive tool for webmasters, bloggers, and digital publishers looking to forecast their earnings from Google's ubiquitous advertising network. Google AdSense works by displaying contextually relevant text, display, or video advertisements on your website. When a visitor engages with these ads, you receive a portion of the revenue that the advertiser paid to Google. However, because earnings fluctuate wildly based on dozens of variables, predicting your monthly payout can be frustratingly complex.</p>
            <p>This calculator simplifies that complexity by isolating the three most important metrics in the display advertising industry: Traffic (Page Views), Click-Through Rate (CTR), and Cost Per Click (CPC). By adjusting these inputs, publishers can mathematically determine exactly how much traffic they need to quit their day jobs, or how improving their site's layout to boost CTR could double their income without requiring a single new visitor. It transforms the mystery of digital monetization into a solvable algebraic equation.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematics behind AdSense revenue forecasting rely on a standard advertising formula. The core engine of this calculator processes your inputs using the following logic.</p>
            <p>First, it calculates your <strong>Daily Clicks</strong>. It does this by multiplying your Daily Page Views by your Click-Through Rate percentage. Formula: <code>Daily Clicks = Page Views * (CTR / 100)</code>. For instance, if you have 10,000 views and a 1.5% CTR, you generate 150 clicks per day.</p>
            <p>Next, it calculates your <strong>Daily Revenue</strong> by multiplying those Daily Clicks by your average Cost Per Click (CPC). Formula: <code>Daily Revenue = Daily Clicks * CPC</code>. If your average CPC is $0.30, your 150 clicks will generate $45.00 a day.</p>
            <p>Finally, the calculator extrapolates this daily revenue out to find your Monthly and Yearly estimates (multiplying by 30.42 and 365, respectively). Furthermore, it reverse-engineers these numbers to provide your <strong>Page RPM (Revenue Per Mille)</strong>. Formula: <code>RPM = (Daily Revenue / Page Views) * 1000</code>. This metric tells you exactly how much you earn for every 1,000 visitors, making it the ultimate benchmark for site performance.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you generate a calculation, the tool provides five distinct analytical sections designed to help you interpret your site's monetization potential.</p>
            <p><strong>Primary Result Card:</strong> This highlights your Estimated Monthly Earnings. For most publishers, the monthly figure is the most important, as it aligns with Google's monthly payout schedule (net-21 terms) and household budgeting cycles.</p>
            <p><strong>3-Stat Bar:</strong> This section displays your Page RPM, the raw number of Daily Clicks you are generating, and your annualized Yearly Income. Tracking your RPM is crucial because it allows you to compare the efficiency of your site against industry standards, regardless of how much traffic you actually have.</p>
            <p><strong>Traffic & Revenue Breakdown:</strong> A line-item accounting that breaks down the math, showing exactly how your views translate into clicks, and how those clicks translate into revenue.</p>
            <p><strong>Earnings Projection Chart:</strong> A visual bar chart that dramatically illustrates the compounding effect of daily earnings over a month and a year. It reinforces the concept that small daily improvements in CTR or CPC lead to massive annual revenue gains.</p>
            <p><strong>Summary Statistics:</strong> A comprehensive grid aggregating the most critical metrics, including estimated ad impressions per month (based on your advanced inputs for ad units per page).</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>To successfully maximize your AdSense earnings, you must deeply understand the primary variables that dictate your payout and how to manipulate them in your favor.</p>
            <p><strong>Cost Per Click (CPC):</strong> This is the most volatile metric, and it is almost entirely dictated by your website's niche (industry) and the geographic location of your audience. Advertisers bid higher for keywords with high commercial intent. For example, a click on a "Mesothelioma Lawyer" ad might pay $50.00, while a click on a "Funny Cat Videos" ad might pay $0.02. Traffic from Tier 1 countries (US, UK, Canada, Australia) commands vastly higher CPCs than traffic from developing nations.</p>
            <p><strong>Click-Through Rate (CTR):</strong> This measures how effectively your ads capture your audience's attention. A standard CTR is around 1%. If your CTR is 0.2%, your ads are likely hidden, blind to the user, or irrelevant. If your CTR is 5%, you either have incredible ad placement or you risk being penalized by Google for encouraging accidental clicks. Ad placement above the fold and within content typically yields the best CTR.</p>
            <p><strong>Traffic Volume (Page Views):</strong> Ultimately, AdSense is a numbers game. Even with a fantastic RPM of $20, you need 50,000 page views a month to make $1,000. Scaling your traffic through SEO (Search Engine Optimization), social media marketing, and consistent content creation is the most reliable way to scale your revenue.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options tab in this calculator provides deeper insights for professional webmasters who track more granular user behavior.</p>
            <p>By inputting <strong>Pages Per Visit</strong>, the calculator can estimate your actual Daily Visitors (Users) versus raw Page Views. If a user visits your site and reads three articles, they generated one visit but three page views. Understanding this ratio helps you determine if you should focus on acquiring new users or improving the internal linking structure to keep existing users on the site longer.</p>
            <p>The <strong>Ad Units Per Page</strong> input allows the calculator to estimate your total Ad Impressions. While AdSense pays primarily on clicks, tracking impressions is vital for understanding ad blindness and preparing your site for potential transitions to CPM-based ad networks (like Mediavine or Raptive) in the future.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how tweaking these variables changes the viability of two different websites.</p>
            <p><strong>Example 1: The High-Volume Entertainment Blog.</strong> You run a celebrity gossip site generating a massive 50,000 page views per day. However, because entertainment has low commercial intent, your CPC is only $0.05. Your CTR is a standard 1.2%. Your Daily Revenue is $30.00. Your Monthly Earnings are $912. Your Page RPM is a very low $0.60. Despite massive traffic, the revenue is mediocre.</p>
            <p><strong>Example 2: The Niche Finance Site.</strong> You run a highly targeted blog about commercial real estate investing. You only get 2,000 page views per day. However, your audience is highly valuable to advertisers, resulting in an average CPC of $1.50. You have optimized your ad placements, achieving a 1.8% CTR. Your Daily Revenue is $54.00. Your Monthly Earnings are $1,642. Your Page RPM is an incredible $27.00. With only 4% of the traffic of the entertainment blog, you make nearly double the money.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Optimizing AdSense requires continuous A/B testing and a focus on both user experience and advertiser value. Follow these proven strategies.</p>
            <p>First, aggressively test ad placements. Do not just rely on Google Auto Ads, which can sometimes clutter your site and ruin the user experience. Manually place ad units within your content (in-article ads) after the 3rd and 7th paragraphs. These tend to have the highest viewability and CTR without annoying the reader.</p>
            <p>Second, focus on improving your site speed. Google's algorithm heavily favors fast-loading sites, but more importantly, if your site loads slowly, users will bounce before the AdSense script even has time to render the ad, destroying your impressions and revenue.</p>
            <p>Third, pivot your content strategy toward high-CPC keywords. Use keyword research tools to find topics within your niche that advertisers are actively bidding on. Writing a comprehensive guide on "Best Small Business Credit Cards" will generate infinitely more AdSense revenue than an opinion piece on "Why I love my bank."</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using an AdSense revenue calculator removes the guesswork from your digital publishing business. It forces you to look at your website not just as a creative outlet, but as a mathematical machine.</p>
            <p>By understanding the exact relationship between Traffic, CTR, and CPC, you can stop wasting time on strategies that don't move the needle. You'll know exactly whether you need to focus your energy on writing more content to drive traffic, tweaking your layout to improve CTR, or shifting your niche entirely to chase higher CPCs, ultimately empowering you to build a highly profitable online business.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/adsense-revenue-calculator" />
          <PopularCalculators exclude="/calculator/adsense-revenue-calculator" />
        </div>
      </div>
    </>
  );
}
