"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DistanceInput {
  tvSize: number;
  resolution: "1080p" | "4K" | "8K";
}

interface DistanceResult {
  minDistance: number;
  recommendedDistance: number;
  thxDistance: number;
  smpteDistance: number;
  chartData: { name: string; distance: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDistance(input: DistanceInput): DistanceResult {
  const multipliers = { "1080p": { min: 1.5, rec: 2.5 }, "4K": { min: 1.0, rec: 1.5 }, "8K": { min: 0.65, rec: 1.0 } };
  const m = multipliers[input.resolution];
  const minDistance = input.tvSize * m.min;
  const recommendedDistance = input.tvSize * m.rec;
  const thxDistance = input.tvSize * 1.2; // 40° field of view
  const smpteDistance = input.tvSize * 1.6; // 30° field of view

  const chartData = [
    { name: "Min (Detail)", distance: Number(minDistance.toFixed(1)), fill: "#10b981" },
    { name: "Recommended", distance: Number(recommendedDistance.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "THX 40°", distance: Number(thxDistance.toFixed(1)), fill: "#f59e0b" },
    { name: "SMPTE 30°", distance: Number(smpteDistance.toFixed(1)), fill: "#8b5cf6" },
  ];

  const breakdown = [
    { label: "TV Size", value: `${input.tvSize.toFixed(0)} in` },
    { label: "Resolution", value: input.resolution },
    { label: "Minimum Distance (detail limit)", value: `${minDistance.toFixed(1)} in (${(minDistance / 12).toFixed(1)} ft)` },
    { label: "Recommended Distance", value: `${recommendedDistance.toFixed(1)} in (${(recommendedDistance / 12).toFixed(1)} ft)` },
    { label: "THX Recommended (40°)", value: `${thxDistance.toFixed(1)} in (${(thxDistance / 12).toFixed(1)} ft)` },
    { label: "SMPTE Minimum (30°)", value: `${smpteDistance.toFixed(1)} in (${(smpteDistance / 12).toFixed(1)} ft)` },
    { label: "Ideal Viewing Angle", value: `${Math.round((2 * Math.atan((input.tvSize / 2) / recommendedDistance) * 180) / Math.PI)}°` },
  ];

  const summaryStats = [
    { label: "Recommended", value: `${(recommendedDistance / 12).toFixed(1)} ft` },
    { label: "Minimum (Detail)", value: `${(minDistance / 12).toFixed(1)} ft` },
    { label: "THX 40°", value: `${(thxDistance / 12).toFixed(1)} ft` },
    { label: "SMPTE 30°", value: `${(smpteDistance / 12).toFixed(1)} ft` },
    { label: "Range", value: `${(minDistance / 12).toFixed(1)}–${(recommendedDistance / 12).toFixed(1)} ft` },
    { label: "Resolution", value: input.resolution },
  ];

  return { minDistance, recommendedDistance, thxDistance, smpteDistance, chartData, breakdown, summaryStats };
}

const DEFAULTS: DistanceInput = { tvSize: 55, resolution: "4K" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TvViewingDistanceCalculator() {
  const [size, setSize] = useState(String(DEFAULTS.tvSize));
  const [resolution, setResolution] = useState<DistanceInput["resolution"]>(DEFAULTS.resolution);
  const [result, setResult] = useState<DistanceResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcDistance({ tvSize: parse(size, DEFAULTS.tvSize), resolution }));
  const reset = () => {
    setSize(String(DEFAULTS.tvSize));
    setResolution(DEFAULTS.resolution);
    setResult(calcDistance(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcDistance(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the ideal TV viewing distance?", answer: "For a 4K TV, sit about 1.0–1.5× the screen diagonal away — a 55-inch TV means 55–82 inches (4.6–6.9 ft). The closer end lets you resolve full detail; beyond 1.5× you lose the benefit of 4K. For 1080p, sit farther (1.5–2.5× diagonal) or the pixel structure becomes visible." },
    { question: "Why does resolution change the distance?", answer: "Higher resolution packs more pixels into the same screen, so you can sit closer before individual pixels become visible. 8K's pixel grid vanishes at about 0.65× the diagonal — that's why 8K only pays off on very large screens or very close seating." },
    { question: "What are the THX and SMPTE recommendations?", answer: "SMPTE (film industry) recommends a minimum 30° field of view — about 1.6× the diagonal. THX recommends a more immersive 40° — about 1.2× the diagonal. For most home theaters, anywhere between the two feels natural; closer is more cinematic, farther is easier on the eyes." },
    { question: "How do I measure viewing distance?", answer: "Measure from the TV screen to your eyes, not from the wall. For a living room with flexible seating, use the range this calculator gives and place the sofa so the middle distance lands on the primary seat. Mounting height matters too: the screen center should sit at eye level when seated." },
    { question: "Can I sit too close to a 4K TV?", answer: "Not really — closer than the minimum distance, you may notice slight pixel structure at 1.0× diagonal, but modern 4K is dense enough that most people can't see pixels even at 0.8×. Eye strain comes more from brightness and glare than proximity. If it feels uncomfortable, move back into the recommended range." },
    { question: "What about 8K TVs?", answer: "8K is only distinguishable from 4K at very close range (under 0.75× the diagonal) or on very large screens — above 75 inches. For most rooms, 4K at 1.0–1.5× diagonal remains the practical sweet spot. Buy 8K only if you're planning an oversized screen with close seating." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "TV Viewing Distance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">TV Viewing Distance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">TV Screen Size</label>
                <div className={inp}><input type="number" value={size} onChange={(e) => setSize(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Screen Resolution</label>
                <select value={resolution} onChange={(e) => setResolution(e.target.value as DistanceInput["resolution"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4K">4K (Ultra HD)</option>
                  <option value="8K">8K</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommended Viewing Distance</div>
                  <div className="text-4xl font-extrabold tracking-tight">{(result.recommendedDistance / 12).toFixed(1)} ft</div>
                  <div className="text-sm text-muted-foreground mt-1">Range: {(result.minDistance / 12).toFixed(1)}–{(result.recommendedDistance / 12).toFixed(1)} ft for {result.chartData[1] ? "your " + resolution + " TV" : ""}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Minimum", `${(result.minDistance / 12).toFixed(1)} ft`], ["Recommended", `${(result.recommendedDistance / 12).toFixed(1)} ft`], ["THX (40°)", `${(result.thxDistance / 12).toFixed(1)} ft`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Distance Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Distance Options (inches)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} in (${(v / 12).toFixed(1)} ft)`, ""]} />
                      <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Matching Distance to Resolution</h2>
            <p>Your TV's resolution determines how close you can sit before the pixel grid becomes visible. The rule of thumb: 1080p wants 1.5–2.5× the screen diagonal, 4K wants 1.0–1.5×, and 8K wants 0.65–1.0×. Sit too far and you lose detail; sit too close and you see structure instead of picture.</p>
            <h2 className="text-2xl font-bold mb-3">Field of View Standards</h2>
            <p>The film industry defines comfort and immersion by the field of view the screen occupies. SMPTE's minimum of 30° (1.6× diagonal) suits casual viewing. THX's immersive 40° (1.2× diagonal) brings cinematic impact. For a dedicated home theater with a 4K projector or large TV, 36–40° is the sweet spot.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Setup</h2>
            <p>Measure from screen to eyes, not wall to sofa. Center the screen at seated eye level — usually 40–44 inches from the floor — and avoid glare sources behind the seating. If your room forces a distance outside the recommended range, prefer sitting slightly closer for 4K, slightly farther for 1080p.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tv-viewing-distance-calculator" />
          <PopularCalculators exclude="/calculator/tv-viewing-distance-calculator" />
        </div>
      </div>
    </>
  );
}
