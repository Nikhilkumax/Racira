"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Check, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type TextType = "normal" | "large";
type Level = "aa" | "aaa";

interface ContrastResult {
  ratio: number;
  fgLum: number;
  bgLum: number;
  fgHex: string;
  bgHex: string;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace(/^#/, "");
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return null;
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}

function calcContrast(fgHex: string, bgHex: string): ContrastResult | null {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;
  const fgLum = relativeLuminance(fg);
  const bgLum = relativeLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  const r = parseFloat(ratio.toFixed(2));
  const aaNormal = r >= 4.5;
  const aaLarge = r >= 3.0;
  const aaaNormal = r >= 7.0;
  const aaaLarge = r >= 4.5;
  const f = (h: string) => h.toUpperCase().replace(/^0/, "");

  const breakdown = [
    { label: `Foreground (${f(fgHex)}) Relative Luminance`, value: fgLum.toFixed(4) },
    { label: `Background (${f(bgHex)}) Relative Luminance`, value: bgLum.toFixed(4) },
    { label: "Contrast Ratio", value: `${r}:1` },
    { label: "WCAG AA — Normal Text (4.5:1)", value: aaNormal ? "PASS" : "FAIL" },
    { label: "WCAG AA — Large Text (3.0:1)", value: aaLarge ? "PASS" : "FAIL" },
    { label: "WCAG AAA — Normal Text (7.0:1)", value: aaaNormal ? "PASS" : "FAIL" },
    { label: "WCAG AAA — Large Text (4.5:1)", value: aaaLarge ? "PASS" : "FAIL" },
  ];
  const summaryStats = [
    { label: "Contrast Ratio", value: `${r}:1` },
    { label: "FG Luminance", value: fgLum.toFixed(4) },
    { label: "BG Luminance", value: bgLum.toFixed(4) },
    { label: "AA Normal Text", value: aaNormal ? "PASS" : "FAIL" },
    { label: "AA Large Text", value: aaLarge ? "PASS" : "FAIL" },
    { label: "AAA Normal Text", value: aaaNormal ? "PASS" : "FAIL" },
    { label: "AAA Large Text", value: aaaLarge ? "PASS" : "FAIL" },
    { label: "Formula", value: "(L1 + 0.05) / (L2 + 0.05)" },
  ];
  const chartData = [
    { name: "Foreground", value: parseFloat(fgLum.toFixed(4)), fill: `#${fgHex.replace(/^#/, "")}` },
    { name: "Background", value: parseFloat(bgLum.toFixed(4)), fill: `#${bgHex.replace(/^#/, "")}` },
  ];
  return { ratio: r, fgLum, bgLum, fgHex: f(fgHex), bgHex: f(bgHex), aaNormal, aaLarge, aaaNormal, aaaLarge, breakdown, summaryStats, chartData };
}

const DEFAULTS = { fg: "333333", bg: "FFFFFF", textType: "normal", level: "aa" };

export default function ContrastRatioCalculator() {
  const [fg, setFg] = useState(DEFAULTS.fg);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const [textType, setTextType] = useState<TextType>("normal");
  const [level, setLevel] = useState<Level>("aa");
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<ContrastResult | null>(null);

  const fgValid = hexToRgb(fg) !== null;
  const bgValid = hexToRgb(bg) !== null;
  const errs: string[] = [];
  if (!fgValid) errs.push("Foreground must be a 3 or 6 digit hex color (e.g. 333333).");
  if (!bgValid) errs.push("Background must be a 3 or 6 digit hex color (e.g. FFFFFF).");
  const valid = fgValid && bgValid;

  const calculate = () => { if (valid) setResult(calcContrast(fg, bg)); };
  const reset = () => {
    setFg(DEFAULTS.fg); setBg(DEFAULTS.bg); setTextType("normal"); setLevel("aa");
    setResult(calcContrast("333333", "FFFFFF"));
  };
  useEffect(() => { setResult(calcContrast("333333", "FFFFFF")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground uppercase";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const selectedPass = result
    ? (textType === "normal" ? (level === "aa" ? result.aaNormal : result.aaaNormal) : (level === "aa" ? result.aaLarge : result.aaaLarge))
    : false;

  const faqs = [
    { question: "What is the WCAG contrast ratio?", answer: "WCAG 2.x defines contrast as (L1 + 0.05) / (L2 + 0.05), where L1 is the relative luminance of the lighter color and L2 the darker. Relative luminance is computed from the sRGB channels after gamma linearization, weighted 0.2126 red, 0.7152 green, 0.0722 blue." },
    { question: "What contrast ratios does WCAG require?", answer: "AA requires 4.5:1 for normal text and 3.0:1 for large text (18pt or 14pt bold). AAA requires 7.0:1 for normal text and 4.5:1 for large text. Large text is defined as at least 18pt regular or 14pt bold." },
    { question: "Why is contrast important for accessibility?", answer: "Low-contrast text is unreadable for people with low vision, color deficiencies, or glare conditions. Meeting WCAG contrast standards is a core requirement for accessible web design, and is legally mandated in many jurisdictions (ADA, EAA/EN 301 549, Section 508)." },
    { question: "How do I improve a failing contrast ratio?", answer: "Darken the text color or lighten the background — increasing the luminance difference. For text on white (#FFFFFF), colors darker than about #767676 pass AA for normal text. Avoid light gray text on white backgrounds entirely." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Color Contrast Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Color Contrast Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Foreground Color</label>
                <div className={inp}>
                  <span className="pl-2 pr-1 text-muted-foreground text-sm">#</span>
                  <input type="text" value={fg} onChange={e => setFg(e.target.value)} maxLength={6} className={ci} aria-label="Foreground hex color" />
                  <span className="w-8 h-8 m-1 rounded shrink-0 border border-border" style={{ background: fgValid ? `#${fg}` : "#fff" }} />
                </div>
              </div>
              <div>
                <label className={lbl}>Background Color</label>
                <div className={inp}>
                  <span className="pl-2 pr-1 text-muted-foreground text-sm">#</span>
                  <input type="text" value={bg} onChange={e => setBg(e.target.value)} maxLength={6} className={ci} aria-label="Background hex color" />
                  <span className="w-8 h-8 m-1 rounded shrink-0 border border-border" style={{ background: bgValid ? `#${bg}` : "#fff" }} />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Compliance Target</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Text Type</label>
                      <select value={textType} onChange={e => setTextType(e.target.value as TextType)} className={sel}>
                        <option value="normal">Normal Text</option>
                        <option value="large">Large Text (18pt / 14pt bold)</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>WCAG Level</label>
                      <select value={level} onChange={e => setLevel(e.target.value as Level)} className={sel}>
                        <option value="aa">AA (minimum)</option>
                        <option value="aaa">AAA (enhanced)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${selectedPass ? "text-emerald-600" : "text-red-500"}`}>Contrast Ratio</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.ratio}:1</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {level.toUpperCase()} {textType === "large" ? "Large Text" : "Normal Text"}: <span className={`font-bold ${selectedPass ? "text-emerald-600" : "text-red-500"}`}>{selectedPass ? "PASS" : "FAIL"}</span> · #${result.fgHex} on #${result.bgHex}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Best WCAG Level", result.aaaNormal && result.aaaLarge ? "AAA" : result.aaNormal && result.aaaLarge ? "AA+" : result.aaNormal || result.aaaLarge ? "AA" : "Below AA", result.aaaNormal ? "text-emerald-600" : result.aaNormal ? "text-amber-500" : "text-red-500"], ["AA Large Text (3:1)", result.aaLarge ? "PASS" : "FAIL", result.aaLarge ? "text-emerald-600" : "text-red-500"], ["AA Normal Text (4.5:1)", result.aaNormal ? "PASS" : "FAIL", result.aaNormal ? "text-emerald-600" : "text-red-500"]].map(([l, v, color], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-base font-bold ${color}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">WCAG Compliance Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-amber-700" : i >= 3 ? (r.value === "PASS" ? "text-emerald-600" : "text-red-500") : ""}`}>
                        <span className="inline-flex items-center gap-1">{i >= 3 && (r.value === "PASS" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />)}{r.value}</span>
                      </td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Relative Luminance Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} />
                    <Tooltip formatter={(v: number) => [v.toFixed(4), "Luminance"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} stroke="#00000022" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className={`font-semibold ${s.value === "PASS" ? "text-emerald-600" : s.value === "FAIL" ? "text-red-500" : ""}`}>{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Contrast Ratio Is Computed</h2>
            <p>WCAG 2.x defines contrast ratio using relative luminance, which accounts for the nonlinear way human vision perceives brightness. Each sRGB channel is first linearized: c/12.92 when c ≤ 0.03928, otherwise ((c + 0.055)/1.055)^2.4. Luminance L = 0.2126R + 0.7152G + 0.0722B. The ratio is (L_light + 0.05) / (L_dark + 0.05).</p>
            <h2 className="text-2xl font-bold mb-3">WCAG Requirements</h2>
            <p>AA: 4.5:1 for normal text, 3.0:1 for large text (18pt or 14pt bold). AAA: 7.0:1 for normal text, 4.5:1 for large text. UI components and graphical objects need 3.0:1. This <strong>color contrast calculator</strong> checks every combination so you can pick the right level for each element.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Guidance</h2>
            <p>Dark text on light backgrounds is the most reliable pattern. For white backgrounds, text at or darker than #767676 passes AA normal. Avoid pure black-on-white extremes in large areas — they cause afterimages — and never rely on color alone to convey meaning; combine contrast compliance with labels, icons, and patterns.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/contrast-ratio-calculator" />
          <PopularCalculators exclude="/calculator/contrast-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
