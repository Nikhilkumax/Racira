"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}
function fmtGB(n: number): string {
  if (n >= 1024) return `${fmt(n / 1024, 2)} TB`;
  return `${fmt(n, 1)} GB`;
}
function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

const DEFAULTS = { episodes: "4", size: "80", downloads: "2500", price: "0.08", retention: "24" };

export default function PodcastHostingCostCalculator() {
  const [episodes, setEpisodes] = useState(DEFAULTS.episodes);
  const [size, setSize] = useState(DEFAULTS.size);
  const [downloads, setDownloads] = useState(DEFAULTS.downloads);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [retention, setRetention] = useState(DEFAULTS.retention);
  const [calculated, setCalculated] = useState(false);

  const eps = Math.max(0, Math.round(parseFloat(episodes) || 0));
  const sz = Math.max(0, parseFloat(size) || 0); // MB
  const dl = Math.max(0, Math.round(parseFloat(downloads) || 0));
  const p = Math.max(0, parseFloat(price) || 0); // $/GB
  const ret = Math.max(1, Math.round(parseFloat(retention) || 24)); // months

  // bandwidth: each download fetches the full episode size
  const monthlyBwGB = (eps * dl * sz) / 1024;
  const bwCost = monthlyBwGB * p;
  // storage: episodes accumulate over the retention window
  const storedGB = (eps * sz * ret) / 1024;
  const storageCost = storedGB * p * 0.15; // storage is a fraction of transfer cost on most plans
  const totalCost = bwCost + storageCost;
  const monthlyDownloads = eps * dl;

  const chartData = [
    { name: "Bandwidth", value: Number(monthlyBwGB.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Storage", value: Number(storedGB.toFixed(1)), fill: "#f59e0b" },
  ];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setEpisodes(DEFAULTS.episodes); setSize(DEFAULTS.size); setDownloads(DEFAULTS.downloads); setPrice(DEFAULTS.price); setRetention(DEFAULTS.retention); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What drives podcast hosting costs?", answer: "Bandwidth — every download moves the full episode file, so cost scales with listeners × episode size × episode count. Storage matters less but accumulates: episodes stay on the server for the retention window, and most plans charge a fraction of the transfer rate for it." },
    { question: "Why do downloads cost more than storage?", answer: "Serving a file to thousands of listeners requires traffic through content delivery networks, which is billed per gigabyte transferred. Storing the file is cheap — disks are plentiful; moving data is not. That is why the calculator prices bandwidth at the full rate and storage at ~15% of it." },
    { question: "How accurate is this estimate?", answer: "It models a metered, pay-per-GB hosting plan — the raw infrastructure cost. Most podcast hosts bundle bandwidth into flat monthly tiers, so compare the estimate against tier pricing: if your usage exceeds a tier, the difference is what you'd pay to the next tier up." },
    { question: "Does streaming count like a download?", answer: "Mostly yes. Whether a listener downloads or streams, the file is transferred over the network and billed the same way. What differs is behavior: streamers may replay clips (more transfers) while downloaders fetch once and listen offline." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Podcast Hosting Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Podcast Hosting Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Episodes / month</label>
                <input type="number" min={0} value={episodes} onChange={e => setEpisodes(e.target.value)} className={inp} placeholder="4" />
              </div>
              <div>
                <label className={lbl}>Avg episode size (MB)</label>
                <input type="number" min={0} value={size} onChange={e => setSize(e.target.value)} className={inp} placeholder="80" />
              </div>
              <div>
                <label className={lbl}>Downloads / episode</label>
                <input type="number" min={0} value={downloads} onChange={e => setDownloads(e.target.value)} className={inp} placeholder="2500" />
              </div>
              <div>
                <label className={lbl}>Hosting rate ($/GB)</label>
                <input type="number" min={0} step={0.005} value={price} onChange={e => setPrice(e.target.value)} className={inp} placeholder="0.08" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Storage retention (months)</label>
                <input type="number" min={1} value={retention} onChange={e => setRetention(e.target.value)} className={inp} placeholder="24" />
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Models metered pay-per-GB hosting. Compare the result against flat-tier plans — most hosts bundle bandwidth.</p>
          </div>

          {calculated && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Hosting Cost</div>
                <div className="text-3xl font-extrabold tracking-tight">{fmtUSD(totalCost)}/mo</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtUSD(bwCost)} bandwidth + {fmtUSD(storageCost)} storage</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Bandwidth", fmtGB(monthlyBwGB), "per month served"], ["Storage", fmtGB(storedGB), `${ret} months retained`], ["Downloads", fmt(monthlyDownloads, 0), "per month total"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Bandwidth vs. Storage</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => fmtGB(Number(v))} />
                    <Tooltip formatter={(v: number) => [fmtGB(Number(v)), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Bandwidth is billed every month; storage grows only until the retention window fills</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Monthly transfers:</span><span className="font-semibold">{fmtGB(monthlyBwGB)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Transfer cost:</span><span className="font-semibold">{fmtUSD(bwCost)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Stored episodes:</span><span className="font-semibold">{eps * ret} files</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Storage cost:</span><span className="font-semibold">{fmtUSD(storageCost)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cost per download:</span><span className="font-semibold">{fmtUSD((sz / 1024) * p)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cost per episode:</span><span className="font-semibold">{fmtUSD((dl * sz / 1024) * p)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Where Hosting Money Goes</h2>
            <p>Every podcast listener downloads a file, and every download moves megabytes through a content network that bills per gigabyte. This <strong>podcast hosting cost calculator</strong> models the two bills — bandwidth and storage — behind your show's infrastructure.</p>
            <h2 className="text-2xl font-bold mb-3">Bandwidth Grows With Success</h2>
            <p>Downloads scale linearly with audience: double the listeners, double the transfer, double the bandwidth bill. Episode size matters just as much — cutting an 80 MB file to 60 MB trims 25% off transfer costs before a single new listener arrives.</p>
            <h2 className="text-2xl font-bold mb-3">Compare Against Flat Tiers</h2>
            <p>Most podcast hosts sell flat monthly tiers that bundle generous bandwidth. Run your usage through this calculator to find your raw cost, then compare it to tier pricing — the tier that covers your usage with room to grow is usually the right pick.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/podcast-hosting-cost-calculator" />
          <PopularCalculators exclude="/calculator/podcast-hosting-cost-calculator" />
        </div>
      </div>
    </>
  );
}
