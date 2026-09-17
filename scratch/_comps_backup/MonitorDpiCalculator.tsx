"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DpiResult {
  ppi: number;
  dotPitch: number;
  megapixels: number;
  aspect: string;
  widthIn: number;
  heightIn: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function calcDpi(w: number, h: number, diag: number): DpiResult {
  const ppi = Math.sqrt(w * w + h * h) / diag;
  const dotPitch = 25.4 / ppi;
  const megapixels = (w * h) / 1e6;
  const g = gcd(w, h);
  const arW = w / g, arH = h / g;
  const aspect = arW >= 100 ? `${(w / h).toFixed(2)}:1 (${arW}:${arH})` : `${arW}:${arH}`;
  const heightIn = diag / Math.sqrt(1 + (w / h) ** 2);
  const widthIn = heightIn * (w / h);
  const breakdown = [
    { label: "Resolution", value: `${w} × ${h} px` },
    { label: "Diagonal Size", value: `${fmt(diag)} in` },
    { label: "Diagonal Pixels", value: `${fmt(Math.sqrt(w * w + h * h), 0)} px` },
    { label: "Pixel Density (PPI)", value: `${fmt(ppi)} px/in` },
    { label: "Dot Pitch", value: `${fmt(dotPitch, 3)} mm` },
    { label: "Total Pixels", value: `${fmt(megapixels)} MP` },
    { label: "Aspect Ratio", value: aspect },
    { label: "Physical Width", value: `${fmt(widthIn)} in` },
    { label: "Physical Height", value: `${fmt(heightIn)} in` },
  ];
  const summaryStats = [
    { label: "PPI", value: `${fmt(ppi)} px/in` },
    { label: "Dot Pitch", value: `${fmt(dotPitch, 3)} mm` },
    { label: "Megapixels", value: `${fmt(megapixels)} MP` },
    { label: "Aspect Ratio", value: aspect },
  ];
  const chartData = [
    { name: "PPI", value: Number(ppi.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Dot Pitch (mm)", value: Number(dotPitch.toFixed(2)), fill: "#f59e0b" },
    { name: "Megapixels", value: Number(megapixels.toFixed(1)), fill: "#10b981" },
  ];
  return { ppi, dotPitch, megapixels, aspect, widthIn, heightIn, breakdown, summaryStats, chartData };
}

const DEFAULTS = { w: "3840", h: "2160", diag: "27" };

export default function MonitorDpiCalculator() {
  const [w, setW] = useState(DEFAULTS.w);
  const [h, setH] = useState(DEFAULTS.h);
  const [diag, setDiag] = useState(DEFAULTS.diag);
  const [result, setResult] = useState<DpiResult | null>(null);

  const wNum = parseFloat(w);
  const hNum = parseFloat(h);
  const dNum = parseFloat(diag);
  const errs: string[] = [];
  if (!wNum || wNum < 100) errs.push("Width must be at least 100 pixels.");
  if (!hNum || hNum < 100) errs.push("Height must be at least 100 pixels.");
  if (!dNum || dNum <= 0) errs.push("Diagonal size must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDpi(wNum, hNum, dNum)); };
  const reset = () => {
    setW(DEFAULTS.w); setH(DEFAULTS.h); setDiag(DEFAULTS.diag);
    setResult(calcDpi(3840, 2160, 27));
  };
  useEffect(() => { setResult(calcDpi(3840, 2160, 27)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const presets = [
    { label: "4K 27\"", w: "3840", h: "2160", d: "27" },
    { label: "1440p 27\"", w: "2560", h: "1440", d: "27" },
    { label: "1080p 24\"", w: "1920", h: "1080", d: "24" },
    { label: "1080p 27\"", w: "1920", h: "1080", d: "27" },
    { label: "MacBook 14\"", w: "3024", h: "1964", d: "14.2" },
  ];

  const faqs = [
    { question: "What is PPI / DPI?", answer: "Pixels per inch — how many pixels fit in one inch of screen. It is computed as the diagonal pixel count divided by the diagonal size in inches. Higher PPI means sharper text and finer detail; DPI is the same idea from the printer world." },
    { question: "What PPI do I need?", answer: "At typical viewing distances, ~90 PPI looks fine, 110–140 looks sharp, and beyond ~200 PPI most people cannot distinguish individual pixels. Apple's Retina displays target roughly 220 PPI for laptops and 326+ for phones." },
    { question: "Why does dot pitch matter?", answer: "Dot pitch is the center-to-center distance between pixels (mm). It is the inverse of PPI — smaller means denser. For print design, knowing PPI and dot pitch tells you whether a photo will look soft when scaled to a given size." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Monitor DPI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Monitor DPI Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Presets</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => { setW(p.w); setH(p.h); setDiag(p.d); setResult(calcDpi(parseFloat(p.w), parseFloat(p.h), parseFloat(p.d))); }} className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors bg-secondary text-muted-foreground hover:bg-accent">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Width (px)</label>
                <input type="number" value={w} onChange={e => setW(e.target.value)} className={inp} placeholder="3840" />
              </div>
              <div>
                <label className={lbl}>Height (px)</label>
                <input type="number" value={h} onChange={e => setH(e.target.value)} className={inp} placeholder="2160" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Diagonal Size (inches)</label>
                <input type="number" value={diag} onChange={e => setDiag(e.target.value)} className={inp} placeholder="27" />
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pixel Density (PPI)</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.ppi)} px/in</div>
                <div className="text-sm text-muted-foreground mt-1">Dot pitch {fmt(result.dotPitch, 3)} mm · {fmt(result.megapixels)} MP · {result.aspect}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["PPI", `${fmt(result.ppi)} px/in`], ["Dot Pitch", `${fmt(result.dotPitch, 3)} mm`], ["Megapixels", `${fmt(result.megapixels)} MP`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Density Metrics</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">PPI up means sharper; dot pitch down means denser pixels</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Sharp Is That Screen?</h2>
            <p>Two monitors can share a resolution yet look very different — a 27" 4K panel is far denser than a 43" 4K TV. This <strong>monitor DPI calculator</strong> computes pixels per inch from resolution and diagonal size, the number that actually determines sharpness.</p>
            <h2 className="text-2xl font-bold mb-3">The Math</h2>
            <p>The Pythagorean theorem gives the diagonal in pixels: √(w² + h²). Dividing by the diagonal in inches yields PPI. Dot pitch, the pixel spacing in millimeters, is its reciprocal (25.4/PPI). The same two inputs also reveal aspect ratio and physical dimensions.</p>
            <h2 className="text-2xl font-bold mb-3">What to Look For</h2>
            <p>For office work and reading, aim above ~100 PPI; for photo editing and design, 140+ keeps fine detail crisp. Phones and laptops push past 200. Run your own screen through the calculator — you may be surprised how dense (or sparse) your pixels really are.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/monitor-dpi-calculator" />
          <PopularCalculators exclude="/calculator/monitor-dpi-calculator" />
        </div>
      </div>
    </>
  );
}
