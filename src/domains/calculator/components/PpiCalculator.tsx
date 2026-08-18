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

const DEFAULTS = { width: "2560", height: "1440", diagonal: "27" };

export default function PpiCalculator() {
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [diagonal, setDiagonal] = useState(DEFAULTS.diagonal);
  const [calculated, setCalculated] = useState(false);

  const w = Math.max(1, Math.round(parseFloat(width) || 0));
  const h = Math.max(1, Math.round(parseFloat(height) || 0));
  const d = Math.max(0.1, parseFloat(diagonal) || 0);
  const valid = w > 0 && h > 0 && d > 0;

  const ppi = Math.sqrt(w * w + h * h) / d;
  const dotPitchIn = 1 / ppi;
  const dotPitchMm = dotPitchIn * 25.4;
  const megapixels = (w * h) / 1e6;
  const aspect = w / h;
  // derived screen width/height at this PPI
  const screenW = w / ppi;
  const screenH = h / ppi;

  const verdict = ppi >= 300 ? "Retina-class — text is crisp at arm's length" : ppi >= 150 ? "Sharp — fine for desktop and photo work" : ppi >= 100 ? "Standard — noticeable pixels up close" : "Coarse — pixels visible at normal distance";

  const chartData = [
    { name: "Width", value: w, fill: "hsl(var(--primary))" },
    { name: "Height", value: h, fill: "#f59e0b" },
    { name: "Total pixels", value: w * h, fill: "#10b981" },
  ];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setWidth(DEFAULTS.width); setHeight(DEFAULTS.height); setDiagonal(DEFAULTS.diagonal); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is PPI?", answer: "Pixels per inch — the number of pixels packed into each linear inch of a display. It is computed by dividing the screen's diagonal resolution (√(width² + height²)) by its physical diagonal size in inches. Higher PPI means finer detail." },
    { question: "What PPI do I need?", answer: "For a screen you hold at arm's length, roughly 150 PPI is fine and 300+ (Apple's 'Retina' threshold) is indistinguishable at typical viewing distances. Phones sit closer, so 400+ PPI is common there; a 65\" 4K TV viewed from 8 feet needs far less." },
    { question: "What is dot pitch?", answer: "The physical distance between the centers of adjacent pixels — the reciprocal of PPI. A 0.25 mm dot pitch is standard desktop territory; the smaller the number, the tighter the pixels and the sharper the image." },
    { question: "Why do same-resolution screens differ in sharpness?", answer: "Resolution is only half the story. A 27\" and a 32\" monitor can both be 2560×1440, but the 32\" spreads those pixels over more area — lower PPI, visibly coarser text. PPI is what actually measures perceived sharpness." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Pixel Density Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Pixel Density (PPI) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Resolution width (px)</label>
              <input type="number" min={1} value={width} onChange={e => setWidth(e.target.value)} className={inp} placeholder="2560" />
            </div>
            <div>
              <label className={lbl}>Resolution height (px)</label>
              <input type="number" min={1} value={height} onChange={e => setHeight(e.target.value)} className={inp} placeholder="1440" />
            </div>
            <div>
              <label className={lbl}>Diagonal screen size (inches)</label>
              <input type="number" min={0.1} step={0.1} value={diagonal} onChange={e => setDiagonal(e.target.value)} className={inp} placeholder="27" />
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pixel Density</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(ppi)} PPI</div>
                <div className="text-sm text-muted-foreground mt-1">{verdict}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Dot pitch", `${fmt(dotPitchMm, 3)} mm`, "between pixels"], ["Resolution", `${w}×${h}`, `${fmt(megapixels, 2)} MP`], ["Screen size", `${fmt(screenW, 2)}" × ${fmt(screenH, 2)}"`, `${d}" diagonal`]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Resolution Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${Math.round(v / 1e3)}k`} />
                    <Tooltip formatter={(v: number) => [fmt(Number(v), 0), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Total pixel count determines how much detail the panel holds — PPI decides how visible it is</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Display Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">PPI:</span><span className="font-semibold">{fmt(ppi)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Dot pitch:</span><span className="font-semibold">{fmt(dotPitchMm, 3)} mm</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Aspect ratio:</span><span className="font-semibold">{fmt(aspect, 2)}:1</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Megapixels:</span><span className="font-semibold">{fmt(megapixels, 2)} MP</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Viewable width:</span><span className="font-semibold">{fmt(screenW, 2)}"</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Viewable height:</span><span className="font-semibold">{fmt(screenH, 2)}"</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Sharpness Is Density, Not Resolution</h2>
            <p>A 4K screen on a phone and a 4K screen on a 65\" TV have identical pixel counts but wildly different sharpness. This <strong>pixel density calculator</strong> computes the PPI — resolution spread over physical size — which is the number that actually determines perceived crispness.</p>
            <h2 className="text-2xl font-bold mb-3">One Formula, Three Answers</h2>
            <p>Diagonal resolution divided by diagonal size gives PPI; its reciprocal is the dot pitch in inches, which is easier to think about in millimeters. The calculator also derives the physical width and height of the panel, so you can picture exactly how big that 27\" really is.</p>
            <h2 className="text-2xl font-bold mb-3">Buying With PPI in Mind</h2>
            <p>Before buying, check the PPI at your intended viewing distance. Desktop monitors around 110 PPI (1080p at 24\") are fine; 1440p at 27\" (~109 PPI) is the sweet spot for most; and 4K at 27\" (~163 PPI) starts to approach the limit of what eyes can resolve.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pixel-density-calculator" />
          <PopularCalculators exclude="/calculator/pixel-density-calculator" />
        </div>
      </div>
    </>
  );
}
