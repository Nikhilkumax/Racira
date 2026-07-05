"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Video } from "lucide-react";

const TwitchEarningsCalculator = () => {
  const [subs, setSubs] = useState("100");
  const [tier, setTier] = useState("50"); // 50% split (Affiliate) or 70% (Partner)
  const [bits, setBits] = useState("5000");
  const [adRevenue, setAdRevenue] = useState("150");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const sCount = parseInt(subs) || 0;
    const sSplit = (parseFloat(tier) || 50) / 100;
    const bCount = parseInt(bits) || 0;
    const ads = parseFloat(adRevenue) || 0;

    // Sub Revenue (Tier 1 is $4.99)
    const subRevenue = sCount * 4.99 * sSplit;
    
    // Bits Revenue ($0.01 per bit)
    const bitRevenue = bCount * 0.01;

    const totalMonthly = subRevenue + bitRevenue + ads;

    setResults({
      subRevenue,
      bitRevenue,
      adRevenue: ads,
      totalMonthly,
      totalYearly: totalMonthly * 12
    });
  };

  const reset = () => {
    setShowResults(false);
    setSubs("100"); setTier("50"); setBits("5000"); setAdRevenue("150");
    setResults(null);
  };

  const faqs = [
    { question: "How much does a Twitch streamer make per sub?", answer: "Most affiliates receive 50% of the subscription price (about $2.50 for a Tier 1 sub). Top-tier partners can sometimes negotiate a 70/30 split." },
    { question: "How much are Twitch Bits worth?", answer: "Streamers receive exactly $0.01 (one cent) for every bit cheered in their channel. The cost of buying bits is higher to cover Twitch's processing fees and profit." },
    { question: "Do Twitch streamers get paid for ads?", answer: "Yes, streamers receive a share of the ad revenue generated during their broadcasts. This is usually measured in CPM (Cost Per Mille) and varies based on the time of year and the streamer's location." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Twitch Earnings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Twitch Earnings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="subs" label="Monthly Subscriptions" value={subs} onChange={setSubs} tooltip="Total number of active Tier 1 subscribers." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Revenue Split (%)</label>
                  <select value={tier} onChange={(e) => setTier(e.target.value)} className="input-calc">
                    <option value="50">50% (Affiliate)</option>
                    <option value="70">70% (Partner Plus)</option>
                  </select>
                </div>
                <InputField id="bits" label="Monthly Bits Cheered" value={bits} onChange={setBits} />
                <InputField id="ads" label="Estimated Monthly Ad Revenue" value={adRevenue} onChange={setAdRevenue} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Earnings Breakdown</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Total</p>
                    <p className="text-4xl font-black text-foreground">${results.totalMonthly.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Yearly Estimate</p>
                    <p className="text-4xl font-black text-foreground">${results.totalYearly.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Subscription Share", value: 0, textValue: "$" + results.subRevenue.toFixed(2) },
                  { label: "Bits Income", value: 0, textValue: "$" + results.bitRevenue.toFixed(2) },
                  { label: "Ad Revenue", value: 0, textValue: "$" + results.adRevenue.toFixed(2) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How Twitch Streamers Make Money</h2>
              <p>Streaming on Twitch can be a lucrative career, but it requires building a loyal community. Unlike YouTube, where ad revenue is the primary driver, Twitch relies heavily on direct support from viewers.</p>
              <h3>The Three Pillars of Twitch Income</h3>
              <ul>
                <li><strong>Subscriptions:</strong> Viewers pay a monthly fee (starting at $4.99) to support the channel and unlock custom emotes and badges.</li>
                <li><strong>Bits:</strong> A virtual currency that viewers buy and then "cheer" in chat. Streamers get $0.01 per bit.</li>
                <li><strong>Ads:</strong> Pre-roll and mid-roll advertisements. Earnings depend on the number of viewers and the advertiser demand in your region.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/twitch-earnings" />
          <PopularCalculators exclude="/calculator/twitch-earnings-calculator" />
        </div>
      </div>
    </>
  );
};

export default TwitchEarningsCalculator;

