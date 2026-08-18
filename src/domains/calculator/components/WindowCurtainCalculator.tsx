"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CurtainInput {
  windowWidth: number;
  windowLength: number;
  fullness: number;
  panels: number;
  fabricWidth: number;
}

interface CurtainResult {
  curtainWidth: number;
  panelWidth: number;
  fabricPerPanelYards: number;
  totalFabricYards: number;
  rodLength: number;
  chartData: { name: string; yards: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCurtains(input: CurtainInput): CurtainResult {
  const curtainWidth = input.windowWidth * input.fullness;
  const panelWidth = input.panels > 0 ? curtainWidth / input.panels : 0;
  const widthsPerPanel = input.fabricWidth > 0 ? Math.ceil(panelWidth / input.fabricWidth) : 0;
  const cutLength = input.windowLength + 6; // 3" hem allowance top + bottom
  const fabricPerPanelYards = (widthsPerPanel * cutLength) / 36;
  const totalFabricYards = fabricPerPanelYards * input.panels;
  const rodLength = input.windowWidth + 12; // 6" overhang each side

  const chartData = [
    { name: "Panel 1", yards: Number(fabricPerPanelYards.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Panel 2", yards: Number(fabricPerPanelYards.toFixed(1)), fill: "#8b5cf6" },
  ];

  const breakdown = [
    { label: "Window Width", value: `${input.windowWidth.toFixed(0)} in` },
    { label: "Window Length", value: `${input.windowLength.toFixed(0)} in` },
    { label: "Fullness Factor", value: `${input.fullness.toFixed(1)}×` },
    { label: "Total Curtain Width", value: `${curtainWidth.toFixed(0)} in` },
    { label: "Width per Panel", value: `${panelWidth.toFixed(0)} in` },
    { label: "Fabric Width Used", value: `${input.fabricWidth.toFixed(0)} in` },
    { label: "Fabric per Panel", value: `${fabricPerPanelYards.toFixed(1)} yd` },
    { label: "Total Fabric Needed", value: `${totalFabricYards.toFixed(1)} yd` },
    { label: "Recommended Rod Length", value: `${rodLength.toFixed(0)} in` },
  ];

  const summaryStats = [
    { label: "Total Curtain Width", value: `${curtainWidth.toFixed(0)} in` },
    { label: "Fabric per Panel", value: `${fabricPerPanelYards.toFixed(1)} yd` },
    { label: "Total Fabric", value: `${totalFabricYards.toFixed(1)} yd` },
    { label: "Rod Length", value: `${rodLength.toFixed(0)} in` },
    { label: "Panels", value: `${input.panels}` },
    { label: "Fullness", value: `${input.fullness.toFixed(1)}×` },
  ];

  return { curtainWidth, panelWidth, fabricPerPanelYards, totalFabricYards, rodLength, chartData, breakdown, summaryStats };
}

const DEFAULTS: CurtainInput = { windowWidth: 60, windowLength: 84, fullness: 2, panels: 2, fabricWidth: 54 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WindowCurtainCalculator() {
  const [width, setWidth] = useState(String(DEFAULTS.windowWidth));
  const [length, setLength] = useState(String(DEFAULTS.windowLength));
  const [fullness, setFullness] = useState(String(DEFAULTS.fullness));
  const [panels, setPanels] = useState(String(DEFAULTS.panels));
  const [fabricWidth, setFabricWidth] = useState(String(DEFAULTS.fabricWidth));
  const [result, setResult] = useState<CurtainResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcCurtains({ windowWidth: parse(width, DEFAULTS.windowWidth), windowLength: parse(length, DEFAULTS.windowLength), fullness: Math.max(1, parse(fullness, DEFAULTS.fullness)), panels: Math.max(1, Math.round(parse(panels, DEFAULTS.panels))), fabricWidth: parse(fabricWidth, DEFAULTS.fabricWidth) }));
  const reset = () => {
    setWidth(String(DEFAULTS.windowWidth));
    setLength(String(DEFAULTS.windowLength));
    setFullness(String(DEFAULTS.fullness));
    setPanels(String(DEFAULTS.panels));
    setFabricWidth(String(DEFAULTS.fabricWidth));
    setResult(calcCurtains(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcCurtains(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is curtain fullness?", answer: "Fullness is the ratio of finished curtain width to window width. 1.5× gives a flat, tailored look; 2× is the classic full-gather standard most decorators recommend; 2.5× creates a rich, luxurious drape. Multiply window width by fullness to get the total fabric width needed." },
    { question: "How wide should curtains be?", answer: "For a 60-inch window with 2× fullness, curtains should total 120 inches of width — 60 inches per panel for a two-panel set. This allows the fabric to gather properly when open and close without looking stretched. Never buy curtains exactly equal to the window width." },
    { question: "How much fabric do I need to sew curtains?", answer: "Divide the per-panel width by the fabric's width (standard 54 inches) and round up to whole widths, then multiply by the cut length (window length plus 6 inches for hems) divided by 36. Two panels for a 60×84 window need about 10 yards of 54-inch fabric." },
    { question: "How long should the curtain rod be?", answer: "Mount the rod 6 inches wider than the window on each side — 12 inches total overhang — so panels can be pulled fully clear of the glass. Install the rod 4–6 inches above the frame (or halfway to the ceiling for a taller look). This makes windows appear larger." },
    { question: "How many panels do I need?", answer: "Standard drapery sets use two panels that meet in the middle. A single panel can work for small windows under 36 inches. For very wide windows (over 90 inches), use four panels or a wider single traverse rod with multiple carriers per panel." },
    { question: "Do curtains need lining?", answer: "Lining protects fabric from sun fade, adds opacity for privacy, and improves insulation — worth it for most windows. If adding lining, plan the outer fabric widths the same way and add the lining fabric as a separate material of the same yardage. Blackout lining blocks nearly all light." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Window Curtain Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Window Curtain Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Window Width</label>
                <div className={inp}><input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Window Length</label>
                <div className={inp}><input type="number" value={length} onChange={(e) => setLength(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Fullness Factor</label>
                <div className={inp}><input type="number" value={fullness} onChange={(e) => setFullness(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">×</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Panels</label>
                <div className={inp}><input type="number" value={panels} onChange={(e) => setPanels(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Fabric Width</label>
                <div className={inp}><input type="number" value={fabricWidth} onChange={(e) => setFabricWidth(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Fabric Needed</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.totalFabricYards.toFixed(1)} yd</div>
                  <div className="text-sm text-muted-foreground mt-1">Curtain width: {result.curtainWidth.toFixed(0)} in · Rod: {result.rodLength.toFixed(0)} in</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Curtain Width", `${result.curtainWidth.toFixed(0)} in`], ["Fabric per Panel", `${result.fabricPerPanelYards.toFixed(1)} yd`], ["Rod Length", `${result.rodLength.toFixed(0)} in`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Fabric Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Fabric per Panel (yards)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} yd`, ""]} />
                      <Bar dataKey="yards" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">The 2× Fullness Standard</h2>
            <p>Decorators agree that curtains should be about twice the window width for proper gathers. A 60-inch window calls for 120 inches of finished curtain — 60 per panel. Skimping on fullness is the most common curtain mistake; flat, stretched panels always look like a compromise.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring for Sewing</h2>
            <p>When sewing your own curtains, plan whole fabric widths per panel. A 54-inch-wide panel fabric means a 60-inch finished panel requires two fabric widths seamed together. Add 6 inches to the finished length for hems, then convert to yards. Buy all fabric at once to avoid dye-lot variation.</p>
            <h2 className="text-2xl font-bold mb-3">Mounting for Proportion</h2>
            <p>Wider and higher beats bigger. Extend the rod 6 inches past each side of the frame and mount it 4–6 inches above the top — or halfway to the ceiling for drama. Panels should just kiss the floor or hover 1/2 inch above it for a tailored finish; pooling fabric reads as casual, not intentional.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/window-curtain-calculator" />
          <PopularCalculators exclude="/calculator/window-curtain-calculator" />
        </div>
      </div>
    </>
  );
}
