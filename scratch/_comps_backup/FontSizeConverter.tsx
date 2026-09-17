"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface FontSizeResult {
  value: number;
  unit: string;
  basePx: number;
  rootPx: number;
  px: number;
  pt: number;
  em: number;
  rem: number;
  percent: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const UNIT_LABELS: Record<string, string> = { pt: "Points", px: "Pixels", em: "EM", rem: "REM", pct: "Percent" };

function calcFont(value: number, unit: string, basePx: number, rootPx: number): FontSizeResult {
  let px = 0;
  if (unit === "pt") px = value * (96 / 72);
  else if (unit === "px") px = value;
  else if (unit === "em") px = value * basePx;
  else if (unit === "rem") px = value * rootPx;
  else if (unit === "pct") px = (value / 100) * basePx;

  const pt = px * (72 / 96);
  const em = px / basePx;
  const rem = px / rootPx;
  const percent = em * 100;

  const fmt = (v: number, d = 4) => `${parseFloat(v.toFixed(d))}`;
  const breakdown = [
    { label: "Input", value: `${fmt(value)} ${UNIT_LABELS[unit]}` },
    { label: "Base (Body) Size", value: `${basePx} px` },
    { label: "Root Size", value: `${rootPx} px` },
    { label: "Pixels (px)", value: `${fmt(px, 2)} px` },
    { label: "Points (pt)", value: `${fmt(pt, 2)} pt` },
    { label: "EM", value: `${fmt(em)} em` },
    { label: "REM", value: `${fmt(rem)} rem` },
    { label: "Percent (%)", value: `${fmt(percent, 2)}%` },
  ];
  const summaryStats = [
    { label: "Pixels", value: `${fmt(px, 2)} px` },
    { label: "Points", value: `${fmt(pt, 2)} pt` },
    { label: "EM", value: `${fmt(em)} em` },
    { label: "REM", value: `${fmt(rem)} rem` },
    { label: "Percent", value: `${fmt(percent, 2)}%` },
    { label: "Base Size", value: `${basePx} px` },
    { label: "Root Size", value: `${rootPx} px` },
    { label: "Unit", value: UNIT_LABELS[unit] },
  ];
  const chartData = [
    { name: "pt", value: Math.round(pt), fill: "hsl(var(--primary))" },
    { name: "px", value: Math.round(px), fill: "#8b5cf6" },
    { name: "em", value: Math.round(em * basePx), fill: "#f59e0b" },
    { name: "rem", value: Math.round(rem * rootPx), fill: "#10b981" },
    { name: "%", value: Math.round((percent / 100) * basePx), fill: "#ef4444" },
  ];
  return { value, unit, basePx, rootPx, px, pt, em, rem, percent, breakdown, summaryStats, chartData };
}

const DEFAULTS = { value: "16", unit: "px", base: "16", root: "16" };

export default function FontSizeConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [base, setBase] = useState(DEFAULTS.base);
  const [root, setRoot] = useState(DEFAULTS.root);
  const [result, setResult] = useState<FontSizeResult | null>(null);

  const v = parseFloat(value) || 0;
  const bs = parseFloat(base) || 0;
  const rt = parseFloat(root) || 0;
  const errs: string[] = [];
  if (v < 0) errs.push("Font size cannot be negative.");
  if (bs <= 0) errs.push("Base (body) size must be greater than 0.");
  if (rt <= 0) errs.push("Root size must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcFont(v, unit, bs, rt)); };
  const reset = () => {
    setValue(DEFAULTS.value); setUnit(DEFAULTS.unit); setBase(DEFAULTS.base); setRoot(DEFAULTS.root);
    setResult(calcFont(16, "px", 16, 16));
  };
  useEffect(() => { setResult(calcFont(16, "px", 16, 16)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do pt and px relate?", answer: "One point is 1/72 of an inch and one CSS pixel is 1/96 of an inch, so 1 pt = 96/72 = 1.333 px. Multiply points by 4/3 to get pixels." },
    { question: "What is the difference between em and rem?", answer: "An em is relative to the font size of the current element (inherited from its parent), while a rem is relative to the root element's font size. REMs make scaling consistent across the page." },
    { question: "Why does my em value depend on base size?", answer: "EM and percent are relative units: 1 em equals the current base font size. With a 16 px base, 1 em = 16 px; with a 20 px base, 1 em = 20 px." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Font Size Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Font Size Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Font Size Value</label>
                <div className={inp}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className={sel}>
                  <option value="pt">Points (pt)</option>
                  <option value="px">Pixels (px)</option>
                  <option value="em">EM</option>
                  <option value="rem">REM</option>
                  <option value="pct">Percent (%)</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Base (Body) Size</label>
                <div className={inp}><input type="number" value={base} onChange={e => setBase(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">px</span></div>
              </div>
              <div>
                <label className={lbl}>Root Size</label>
                <div className={inp}><input type="number" value={root} onChange={e => setRoot(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">px</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pixels Equivalent</div>
                <div className="text-4xl font-extrabold tracking-tight">{parseFloat(result.px.toFixed(2))} px</div>
                <div className="text-sm text-muted-foreground mt-1">{parseFloat(result.pt.toFixed(2))} pt · {parseFloat(result.em.toFixed(4))} em · {parseFloat(result.rem.toFixed(4))} rem · {parseFloat(result.percent.toFixed(2))}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Points`, `${parseFloat(result.pt.toFixed(2))} pt`], ["EM", `${parseFloat(result.em.toFixed(4))} em`], ["REM", `${parseFloat(result.rem.toFixed(4))} rem`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Unit Conversions</h3>
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
                <h3 className="text-base font-bold mb-4">Equivalent Sizes (px)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}px`} />
                    <Tooltip formatter={(v: number) => [`${v} px`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Each unit expressed as its pixel equivalent</p>
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
            <h2 className="text-2xl font-bold mb-3">Absolute vs Relative Units</h2>
            <p>This <strong>font size converter</strong> handles both families. Points and pixels are absolute — 1 pt equals 1/72 inch and 1 CSS pixel equals 1/96 inch, giving the exact 4:3 ratio. EM, REM, and percent are relative: they scale against a reference size rather than physical units.</p>
            <h2 className="text-2xl font-bold mb-3">Why REM for Accessibility</h2>
            <p>Root-relative sizing respects browser zoom and user font-size preferences. If a user sets their default to 18 px, a 1 rem headline scales up automatically, while a fixed 16 px size stays put. That makes REM the recommended unit for fluid, accessible type systems.</p>
            <h2 className="text-2xl font-bold mb-3">Converting Between Systems</h2>
            <p>Design tools default to points, the web defaults to pixels, and modern CSS prefers relative units. Convert through pixels as the common denominator: points to pixels first, then to em or rem using the relevant base size.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/font-size-converter" />
          <PopularCalculators exclude="/calculator/font-size-converter" />
        </div>
      </div>
    </>
  );
}
