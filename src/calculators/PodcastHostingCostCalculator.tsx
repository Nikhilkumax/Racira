"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Mic, HardDrive, Users, Calculator, Headphones } from "lucide-react";

export default function PodcastHostingCalculator() {
  const [monthlyEpisodes, setMonthlyEpisodes] = useState("4");
  const [avgEpisodeSize, setAvgEpisodeSize] = useState("60");
  const [monthlyDownloads, setMonthlyDownloads] = useState("5000");
  const [storageCostPerGB, setStorageCostPerGB] = useState("0.10");
  const [bandwidthCostPerGB, setBandwidthCostPerGB] = useState("0.05");
  const [platformFee, setPlatformFee] = useState("15");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    monthlyStorage: 0,
    monthlyBandwidth: 0,
    storageCost: 0,
    bandwidthCost: 0,
    totalMonthlyCost: 0,
    costPerDownload: 0,
  });

  const handleCalculate = () => {
    const episodes = parseFloat(monthlyEpisodes) || 0;
    const size = parseFloat(avgEpisodeSize) || 0; // in MB
    const downloads = parseFloat(monthlyDownloads) || 0;
    const sCost = parseFloat(storageCostPerGB) || 0;
    const bCost = parseFloat(bandwidthCostPerGB) || 0;
    const pFee = parseFloat(platformFee) || 0;

    const monthlyNewStorageGB = (episodes * size) / 1024;
    const monthlyBandwidthGB = (downloads * size) / 1024;

    const storageCost = monthlyNewStorageGB * sCost; // Simplified: only charging for new storage this month
    const bandwidthCost = monthlyBandwidthGB * bCost;
    const totalMonthlyCost = pFee + storageCost + bandwidthCost;
    const costPerDownload = downloads > 0 ? totalMonthlyCost / downloads : 0;

    setResults({
      monthlyStorage: monthlyNewStorageGB,
      monthlyBandwidth: monthlyBandwidthGB,
      storageCost,
      bandwidthCost,
      totalMonthlyCost,
      costPerDownload,
    });
    setShowResults(true);
  };

  const reset = () => {
    setMonthlyEpisodes("4");
    setAvgEpisodeSize("60");
    setMonthlyDownloads("5000");
    setPlatformFee("15");
    setShowResults(false);
  };

  const faqs = [
    { question: "How much does it cost to host a podcast?", answer: "Podcast hosting typically ranges from $0 (free plans with limits) to $50+ per month for professional features. Most mid-range plans for weekly episodes cost between $15 and $25 per month." },
    { question: "What is the biggest cost in podcast hosting?", answer: "For most podcasters, the flat platform fee is the primary cost. However, for high-traffic shows, bandwidth (data transfer) costs can become the dominant expense if the platform doesn't offer 'unlimited' downloads." },
    { question: "How large is the average podcast episode file?", answer: "A 60-minute MP3 file at 128kbps (standard quality) is approximately 60MB. Higher quality bitrates (like 192kbps) will result in larger files (around 90MB for 60 minutes)." },
    { question: "What is the difference between storage and bandwidth?", answer: "Storage is the space required to keep your audio files on the server. Bandwidth (or Data Transfer) is the amount of data moved from the server to your listeners' devices when they stream or download an episode." },
    { question: "Should I use a free podcast host?", answer: "Free hosts like Spotify for Podcasters (formerly Anchor) are great for beginners. However, professional shows often prefer paid hosts for better analytics, more control over the RSS feed, and dedicated support." },
    { question: "How many downloads does a typical podcast get?", answer: "The median podcast receives about 150 downloads per episode within the first 30 days. Top 1% podcasts receive over 40,000 downloads per episode." },
    { question: "Do I need to pay for a CDN?", answer: "Most podcast hosting platforms include a CDN (Content Delivery Network) in their monthly fee. A CDN ensures your audio files are delivered quickly to listeners regardless of their geographic location." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Podcast Hosting Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Podcast Hosting Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="episodes" label="Episodes Per Month" value={monthlyEpisodes} onChange={setMonthlyEpisodes} tooltip="How many new episodes do you plan to publish each month?" />
                <InputField id="size" label="Avg Episode Size (MB)" value={avgEpisodeSize} onChange={setAvgEpisodeSize} tooltip="Average file size of your episodes. A 128kbps 60min MP3 is ~60MB." />
                <InputField id="downloads" label="Monthly Downloads" value={monthlyDownloads} onChange={setMonthlyDownloads} tooltip="Total combined downloads across all your episodes in a month." />
                <InputField id="fee" label="Monthly Platform Fee ($)" value={platformFee} onChange={setPlatformFee} prefix="$" tooltip="The fixed monthly price of your hosting provider (e.g., Libsyn, Buzzsprout)." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Calculator className="h-5 w-5" /> Calculate Costs
                </button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-6">Monthly Cost Breakdown</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Monthly Cost</p>
                    <p className="text-3xl font-black text-foreground">${results.totalMonthlyCost.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Cost Per Download</p>
                    <p className="text-3xl font-black text-foreground">${results.costPerDownload.toFixed(4)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Bandwidth Used</p>
                    <p className="text-3xl font-black text-foreground">{results.monthlyBandwidth.toFixed(1)} GB</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "New Monthly Storage", value: 0, textValue: `${results.monthlyStorage.toFixed(2)} GB` },
                  { label: "Fixed Platform Fee", value: 0, textValue: `$${parseFloat(platformFee).toFixed(2)}` },
                  { label: "Variable Infrastructure Cost", value: 0, textValue: `$${(results.storageCost + results.bandwidthCost).toFixed(2)}` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Hidden Economics of Podcast Hosting</h2>
              <p>Choosing a podcast host is one of the first and most critical technical decisions for any creator. While it might seem like a simple matter of uploading an MP3 file, the infrastructure required to serve high-fidelity audio to thousands of listeners simultaneously is complex and costly. This calculator helps you understand exactly where your money is going and how your costs will scale as your show grows.</p>

              <h3>1. The Monthly Platform Fee</h3>
              <p>Most podcasters use specialized hosting services like Libsyn, Buzzsprout, Transistor, or Captivate. These platforms charge a monthly subscription fee that usually covers the core features: an RSS feed, a basic website, analytics, and an audio player. These fees typically start around $15 to $20 per month and increase based on the amount of audio you upload or the number of downloads you receive.</p>

              <h3>2. Storage vs. Bandwidth: What You're Paying For</h3>
              <p>In the world of web hosting, there's a major difference between storage and bandwidth. <strong>Storage</strong> is the 'closet space' where your audio files live. Once you upload an episode, it stays in storage forever (or until you delete it). <strong>Bandwidth</strong> (also called Data Transfer) is the 'shipping cost' of moving that file from the host's server to a listener's phone. If 1,000 people download a 60MB file, you have used 60,000MB (60GB) of bandwidth. Professional hosts often have 'fair use' policies for bandwidth, but if you become a mega-hit, you may find yourself needing custom enterprise pricing.</p>

              <h3>3. File Sizes and Quality Trade-offs</h3>
              <p>The size of your podcast file is determined by its duration and its <strong>bitrate</strong>. Bitrate is measured in kilobits per second (kbps). Most podcasts use 128kbps, which offers a great balance between sound quality and file size. If you switch to 192kbps (higher quality), your file sizes will increase by 50%, which means your storage and bandwidth usage will also increase by 50%. For spoken-word content, 128kbps is usually the industry standard, while music-heavy shows might opt for 192kbps or higher.</p>

              <h3>4. The Cost of Success: Scaling Your Show</h3>
              <p>One of the beautiful things about podcasting is that your costs don't scale linearly with your audience. A show with 10,000 downloads might cost the same to host as a show with 1,000 downloads, provided you stay within the limits of your hosting plan. However, once you cross into the 'Elite' territory (50,000+ downloads per month), you may need to upgrade to Pro or Enterprise plans, which can cost $50 to $150 per month. This is usually when podcasters start looking at sponsorships to cover their increasing infrastructure costs.</p>

              <h3>5. Free vs. Paid Hosting</h3>
              <p>Services like Spotify for Podcasters offer free hosting because they benefit from having your content on their platform. While free hosting is an excellent way to start, paid hosts offer significant advantages: ownership of your RSS feed, advanced IAB-certified analytics (which advertisers require), private podcasting features, and better customer support. For serious creators, the $15-$20 monthly investment is usually worth the peace of mind and data accuracy.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/podcast-hosting-cost-calculator" />
          <PopularCalculators exclude="/calculator/podcast-hosting-cost-calculator" />
        </div>
      </div>
    </>
  );
}
