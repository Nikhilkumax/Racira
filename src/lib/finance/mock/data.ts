import type { Author, Category, Post, Tag, MediaItem } from "@/types/finance/db";

export const authors: Author[] = [
  {
    id: "a1",
    slug: "amelia-chen",
    name: "Amelia Chen",
    bio: "Former hedge fund analyst writing about portfolio construction, market structure, and behavioral finance.",
    avatar_url: "https://i.pravatar.cc/200?img=47",
    role: "Markets Editor",
    twitter: "ameliachen",
    linkedin: "ameliachen",
  },
  {
    id: "a2",
    slug: "marcus-okafor",
    name: "Marcus Okafor",
    bio: "Personal finance writer. Ex-banker turned independent advisor focused on long-term wealth building.",
    avatar_url: "https://i.pravatar.cc/200?img=12",
    role: "Personal Finance Lead",
    twitter: "marcusokafor",
  },
  {
    id: "a3",
    slug: "priya-raman",
    name: "Priya Raman",
    bio: "Macro economist covering central banks, rates, and the global economy.",
    avatar_url: "https://i.pravatar.cc/200?img=32",
    role: "Macro Correspondent",
    linkedin: "priyaraman",
  },
];

export const categories: Category[] = [
  { id: "c1", slug: "investing", name: "Investing", description: "Markets, portfolios, and long-term capital allocation.", color: "#059669" },
  { id: "c2", slug: "personal-finance", name: "Personal Finance", description: "Budgeting, saving, debt, and household money.", color: "#0ea5e9" },
  { id: "c3", slug: "markets", name: "Markets", description: "Equities, fixed income, FX, and commodities.", color: "#f59e0b" },
  { id: "c4", slug: "economy", name: "Economy", description: "Macro trends, policy, and the global outlook.", color: "#8b5cf6" },
  { id: "c5", slug: "crypto", name: "Crypto", description: "Digital assets, tokenomics, and on-chain finance.", color: "#ec4899" },
];

export const tags: Tag[] = [
  { id: "t1", slug: "etfs", name: "ETFs" },
  { id: "t2", slug: "retirement", name: "Retirement" },
  { id: "t3", slug: "inflation", name: "Inflation" },
  { id: "t4", slug: "fed", name: "Federal Reserve" },
  { id: "t5", slug: "bonds", name: "Bonds" },
  { id: "t6", slug: "stocks", name: "Stocks" },
  { id: "t7", slug: "budgeting", name: "Budgeting" },
  { id: "t8", slug: "bitcoin", name: "Bitcoin" },
  { id: "t9", slug: "risk", name: "Risk Management" },
];

const longBody = `
Markets reward patience as much as insight. The discipline of long-term capital allocation is less about picking winners and more about avoiding catastrophic losses while compounding modest, repeatable returns.

## The case for boring portfolios

The strongest evidence from four decades of academic research is unromantic: low-cost, broadly diversified index funds, held with discipline, outperform the overwhelming majority of actively managed strategies after fees.

There are three reasons this works:

1. **Costs compound, just like returns.** A 1% expense ratio over 30 years can consume a quarter of your terminal wealth.
2. **Diversification removes uncompensated risk.** You're not paid for risks you can eliminate for free.
3. **Behavior is the silent killer.** The largest gap in investor returns isn't strategy — it's the difference between what funds earn and what investors capture, because they trade at the wrong moments.

## A simple framework

Start with three questions before you allocate a single dollar:

- What is the **time horizon** of this money?
- What is the **drawdown** I can actually tolerate?
- What is my **opportunity cost** versus the simplest passive alternative?

> The market doesn't care about your conviction. It cares about the size of your position when you're wrong.

If you can answer those honestly, the asset allocation question becomes mechanical.

## What changes in 2026

Higher real yields, persistent geopolitical risk, and the maturation of alternative income strategies have shifted the calculus for traditional 60/40 portfolios. But the core lesson hasn't changed: time in the market, not timing the market, remains the dominant variable.
`.trim();

const altBody = `
Inflation is a tax on cash and a quiet redistribution from lenders to borrowers. Understanding how it propagates through your portfolio is the difference between protecting purchasing power and watching it erode silently.

## What actually hedges inflation

Not what you think. Gold's record is mixed. Commodities are volatile. The most durable inflation hedge over multi-decade periods has been **productive assets that can raise prices** — high-quality equities with pricing power, real estate with rent escalators, and inflation-linked bonds.

## Three practical moves

- Shorten duration on the fixed income side when real rates are negative.
- Tilt equity exposure toward sectors with demonstrated pricing power.
- Keep an emergency cash buffer, but no more — cash loses value every day inflation runs above your savings rate.

The goal isn't to predict inflation. It's to build a portfolio that doesn't depend on a forecast.
`.trim();

function buildPost(
  id: string,
  slug: string,
  title: string,
  excerpt: string,
  cat: string,
  author: string,
  tagIds: string[],
  cover: string,
  daysAgo: number,
  featured = false,
  body = longBody,
): Post {
  const words = body.split(/\s+/).length;
  const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return {
    id,
    slug,
    title,
    excerpt,
    content: body,
    cover_url: cover,
    author_id: author,
    category_id: cat,
    tag_ids: tagIds,
    status: "published",
    meta_title: `${title} — Racira Finance`,
    meta_description: excerpt,
    reading_time: Math.max(2, Math.round(words / 220)),
    published_at: date,
    updated_at: date,
    featured,
  };
}

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1600&q=80`;

export const posts: Post[] = [
  buildPost("p1", "boring-portfolios-win-decade", "Why Boring Portfolios Win the Decade", "The unromantic truth behind compounding: discipline beats brilliance, costs compound, and time in the market is the dominant variable.", "c1", "a1", ["t1", "t6", "t9"], img("photo-1611974789855-9c2a0a7236a3"), 1, true),
  buildPost("p2", "inflation-toolkit-2026", "The Inflation Toolkit for 2026", "How to position a real-asset portfolio when real yields are positive, the Fed is patient, and pricing power matters more than ever.", "c4", "a3", ["t3", "t4"], img("photo-1554224155-6726b3ff858f"), 3, false, altBody),
  buildPost("p3", "fed-pause-what-it-means", "The Fed Pause: What It Means for Your Bonds", "A practical guide to duration, the yield curve, and the trade-offs facing fixed income investors heading into the next cycle.", "c3", "a3", ["t4", "t5"], img("photo-1590283603385-17ffb3a7f29f"), 5),
  buildPost("p4", "first-100k-hardest", "Why Your First $100K Is the Hardest", "Charlie Munger was right. The math, the psychology, and the five habits that get you there faster than you think.", "c2", "a2", ["t2", "t7"], img("photo-1579621970795-87facc2f976d"), 7),
  buildPost("p5", "etfs-vs-mutual-funds", "ETFs vs. Mutual Funds: The Decision Framework", "Tax efficiency, intraday liquidity, and total cost of ownership — a clear-eyed comparison without the marketing spin.", "c1", "a1", ["t1", "t6"], img("photo-1556761175-5973dc0f32e7"), 9),
  buildPost("p6", "budgeting-without-spreadsheets", "Budgeting Without Spreadsheets", "Three behavioral systems that beat any app or template — for people who hate budgeting but want control over their money.", "c2", "a2", ["t7"], img("photo-1554224154-26032ffc0d07"), 12),
  buildPost("p7", "bitcoin-treasury-thesis", "The Bitcoin Treasury Thesis, Reconsidered", "Corporate treasury allocation to digital assets has matured. We examine the arguments — and the risks rarely discussed.", "c5", "a1", ["t8", "t9"], img("photo-1518546305927-5a555bb7020d"), 14),
  buildPost("p8", "retirement-glide-paths", "Rethinking Retirement Glide Paths", "Why target-date funds may be too conservative for early retirees — and how to design your own equity glide path.", "c2", "a2", ["t2", "t6"], img("photo-1450101499163-c8848c66ca85"), 18),
  buildPost("p9", "global-macro-2026", "Global Macro Outlook: A Tale of Two Continents", "Divergent monetary policy, supply-chain reshoring, and the implications for cross-asset allocation in the year ahead.", "c4", "a3", ["t3", "t4"], img("photo-1633158829585-23ba8f7c8caf"), 22, false, altBody),
  buildPost("p10", "draft-emerging-markets-debt", "Emerging Markets Debt in a High-Yield World", "Draft — exploring the case for selective EM sovereign exposure as a complement to developed-market credit.", "c3", "a3", ["t5"], img("photo-1640340434855-6084b1f4901c"), 0),
];
// Mark last as draft
posts[9].status = "draft";

export const media: MediaItem[] = posts.map((p, i) => ({
  id: `m${i + 1}`,
  url: p.cover_url,
  alt: p.title,
  width: 1600,
  height: 1067,
  created_at: p.published_at,
}));