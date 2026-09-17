"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ImageSizeResult {
  width: number;
  height: number;
  bitDepth: number;
  compression: number;
  megapixels: number;
  totalPixels: number;
  rawBytes: number;
  rawMb: number;
  compressedMb: number;
  aspect: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(mb * 1024).toFixed(1)} KB`;
}

function calcImage(width: number, height: number, bitDepth: number, compression: number): ImageSizeResult {
  const totalPixels = width * height;
  const megapixels = totalPixels / 1000000;
  const rawBytes = totalPixels * (bitDepth / 8);
  const rawMb = rawBytes / 1048576;
  const compressedMb = compression > 1 ? rawMb / compression : rawMb;
  const aspect = height > 0 ? width / height : 0;

  const breakdown = [
    { label: "Image Dimensions", value: `${width} × ${height} px` },
    { label: "Total Pixels", value: `${totalPixels.toLocaleString()} px` },
    { label: "Resolution", value: `${megapixels.toFixed(1)} MP` },
    { label: "Bit Depth", value: `${bitDepth} bits/pixel` },
    { label: "Uncompressed Size", value: fmtSize(rawMb) },
    { label: "Compression Ratio", value: compression > 1 ? `${compression}:1 (e.g. JPEG)` : "None (BMP/RAW)" },
    { label: "Compressed Size", value: fmtSize(compressedMb) },
    { label: "Aspect Ratio", value: `${aspect.toFixed(2)}:1 (W:H)` },
  ];
  const summaryStats = [
    { label: "File Size", value: fmtSize(compressedMb) },
    { label: "Uncompressed", value: fmtSize(rawMb) },
    { label: "Megapixels", value: `${megapixels.toFixed(1)} MP` },
    { label: "Dimensions", value: `${width}×${height}` },
    { label: "Bit Depth", value: `${bitDepth} bpp` },
    { label: "Compression", value: compression > 1 ? `${compression}:1` : "None" },
    { label: "Pixels", value: `${totalPixels.toLocaleString()}` },
    { label: "Aspect", value: `${aspect.toFixed(2)}:1` },
  ];
  const chartData = [
    { name: "Uncompressed", value: Math.round(rawMb), fill: "#8b5cf6" },
    { name: "Compressed", value: Math.round(compressedMb * 100) / 100, fill: "hsl(var(--primary))" },
  ];
  return { width, height, bitDepth, compression, megapixels, totalPixels, rawBytes, rawMb, compressedMb, aspect, breakdown, summaryStats, chartData };
}

const DEFAULTS = { width: "4000", height: "3000", depth: "24", compression: "10" };

export default function ImageFileSizeCalculator() {
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [compression, setCompression] = useState(DEFAULTS.compression);
  const [result, setResult] = useState<ImageSizeResult | null>(null);

  const w = parseInt(width) || 0;
  const h = parseInt(height) || 0;
  const d = parseInt(depth) || 0;
  const c = parseFloat(compression) || 1;
  const errs: string[] = [];
  if (w < 1 || w > 100000) errs.push("Width must be 1–100,000 pixels.");
  if (h < 1 || h > 100000) errs.push("Height must be 1–100,000 pixels.");
  if (d < 1 || d > 64) errs.push("Bit depth must be 1–64 bits.");
  if (c < 1 || c > 1000) errs.push("Compression ratio must be 1–1000 (1 = none).");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcImage(w, h, d, c)); };
  const reset = () => {
    setWidth(DEFAULTS.width); setHeight(DEFAULTS.height); setDepth(DEFAULTS.depth); setCompression(DEFAULTS.compression);
    setResult(calcImage(4000, 3000, 24, 10));
  };
  useEffect(() => { setResult(calcImage(4000, 3000, 24, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is image file size calculated?", answer: "Multiply width × height × bits per pixel and divide by 8 for bytes. A 4000×3000 image at 24-bit depth is 4000 × 3000 × 3 = 36 MB uncompressed." },
    { question: "Why does JPEG differ so much?", answer: "JPEG discards visually redundant detail (lossy compression), typically reaching 10–20:1 with modest quality loss. PNG and BMP are lossless and stay much larger." },
    { question: "What bit depth should I use?", answer: "8-bit grayscale is 8 bits/pixel, 24-bit RGB is 24, and 32-bit adds an alpha channel. RAW photos can be 12–14 bits per channel, which is why they are enormous." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Image File Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Image File Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Width</label>
                <div className={inp}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">px</span></div>
              </div>
              <div>
                <label className={lbl}>Height</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">px</span></div>
              </div>
              <div>
                <label className={lbl}>Bit Depth</label>
                <div className={inp}><input type="number" value={depth} onChange={e => setDepth(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">bpp</span></div>
              </div>
              <div>
                <label className={lbl}>Compression Ratio</label>
                <div className={inp}><input type="number" value={compression} onChange={e => setCompression(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">:1</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated File Size</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtSize(result.compressedMb)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.width}×{result.height} @ {result.bitDepth} bpp · {result.compression > 1 ? `${result.compression}:1` : "no"} compression</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Uncompressed`, fmtSize(result.rawMb)], ["Resolution", `${result.megapixels.toFixed(1)} MP`], ["Pixels", `${result.totalPixels.toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Size Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Raw vs Compressed</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}MB`} />
                    <Tooltip formatter={(v: number) => [`${v} MB`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Pixel Math</h2>
            <p>This <strong>image file size calculator</strong> computes the raw bitmapped size — width × height × bits per pixel ÷ 8 — then divides by a compression ratio to estimate JPEG-style file sizes. Every pixel stores its color in bits: 24 for full RGB, 32 with alpha, 8 for grayscale.</p>
            <h2 className="text-2xl font-bold mb-3">Why Compression Matters</h2>
            <p>A 12 MP camera frame is 36 MB raw. JPEG typically reaches 10–20:1 by discarding high-frequency detail the eye barely notices, dropping the file to a few megabytes — the trade-off between quality and size that every photographer manages.</p>
            <h2 className="text-2xl font-bold mb-3">Planning Storage and Bandwidth</h2>
            <p>Multiply the compressed size by your image count to size CDN, cache, and hosting budgets. For lossless needs, subtract the compression ratio and accept the larger files — PNG and RAW exist precisely because some content can't afford loss.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/image-file-size-calculator" />
          <PopularCalculators exclude="/calculator/image-file-size-calculator" />
        </div>
      </div>
    </>
  );
}
