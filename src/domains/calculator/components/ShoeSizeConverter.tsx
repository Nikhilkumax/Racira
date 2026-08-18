"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface ShoeInputs {
  cm: number;       // foot length in cm
  gender: string;   // "men" | "women"
  fit: string;      // "true" | "small" | "large"
}

interface ShoeResults {
  usSize: number;
  ukSize: number;
  euSize: number;
  jpSize: number;
  usLabel: string;
  ukLabel: string;
  chartData: { name: string; size: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const FIT_ADJUST: Record<string, number> = { true: 0, small: 0.5, large: -0.5 };

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

function calcShoe(i: ShoeInputs): ShoeResults {
  const inches = i.cm / 2.54;
  // Standard formulas: US men = 3×in − 23; women +1.5; UK men = US men − 0.5; EU = cm×1.5 + 2; JP = cm (mondopoint)
  const fit = FIT_ADJUST[i.fit] ?? 0;
  const baseUsMen = roundHalf(3 * inches - 23 + fit);
  const usSize = roundHalf(i.gender === "women" ? baseUsMen + 1.5 : baseUsMen);
  const ukSize = roundHalf(i.gender === "women" ? usSize - 1 : usSize - 0.5);
  const euSize = Math.round(i.cm * 1.5 + 2);
  const jpSize = Math.round(i.cm * 2) / 2;

  const usLabel = `${usSize}`;
  const ukLabel = `${ukSize}`;

  const sizes = i.gender === "men" ? [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12] : [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13];
  const chartData = sizes.map((s) => ({
    name: String(s),
    size: +(((i.gender === "men" ? s : s - 1.5) + 23) / 3 * 2.54).toFixed(1),
    selected: Math.abs(s - usSize) < 0.01,
  }));

  const breakdown = [
    { label: "Foot Length", value: `${i.cm.toFixed(1)} cm (${inches.toFixed(1)} in)` },
    { label: "Gender", value: i.gender === "men" ? "Men's" : "Women's" },
    { label: "US Size", value: usLabel, highlight: true, isTotal: true },
    { label: "UK Size", value: ukLabel },
    { label: "EU Size", value: `${euSize}` },
    { label: "Japan (mondopoint)", value: `${jpSize}` },
    { label: "Brand Fit", value: i.fit === "true" ? "True to size" : i.fit === "small" ? "Runs small (+0.5)" : "Runs large (−0.5)" },
  ];

  const summaryStats = [
    { label: "US Size", value: usLabel },
    { label: "UK Size", value: ukLabel },
    { label: "EU Size", value: `${euSize}` },
    { label: "Japan (mondopoint)", value: `${jpSize}` },
    { label: "Foot Length", value: `${i.cm.toFixed(1)} cm` },
    { label: "Foot Length (in)", value: `${inches.toFixed(1)} in` },
    { label: "Gender", value: i.gender === "men" ? "Men's" : "Women's" },
    { label: "Brand Fit", value: i.fit === "true" ? "True to size" : i.fit === "small" ? "Runs small" : "Runs large" },
  ];

  return { usSize, ukSize, euSize, jpSize, usLabel, ukLabel, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  cm: "26.7",
  gender: "men",
  fit: "true",
};

// 4. Component
export default function ShoeSizeConverter() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<ShoeResults>(() => calcShoe({ cm: 26.7, gender: "men", fit: "true" }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcShoe({ cm: 26.7, gender: "men", fit: "true" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcShoe({
        cm: parseFloat(inputs.cm) || 0,
        gender: inputs.gender,
        fit: inputs.fit,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcShoe({ cm: 26.7, gender: "men", fit: "true" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const cm = parseFloat(inputs.cm) || 0;
  if (cm < 15 || cm > 35) errors.cm = "Must be 15–35 cm";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I measure my foot length?", answer: "Stand on a piece of paper with your heel against a wall, mark the longest toe, and measure to the mark in centimeters. Measure both feet and use the longer one — feet are rarely identical. Measure in the evening, when feet are at their largest after a day of standing." },
    { question: "Why do US men's and women's sizes differ?", answer: "Women's sizing starts 1.5 sizes below men's on the same scale: a men's 8.5 and a women's 10.0 fit the same foot. The conversion is standard across brands, though women's shoes are also built on a slightly different last (foot shape), so the same length can feel different between genders." },
    { question: "What is the difference between US, UK, and EU sizes?", answer: "US men's = 3 × foot inches − 23 (women's +1.5); UK men's is US minus 0.5; EU sizes are roughly foot length in cm × 1.5 + 2; Japan uses mondopoint — the foot length in centimeters directly. A 26.7 cm foot is a US 8.5 / UK 8 / EU 42 / JP 26.5." },
    { question: "Why does EU sizing vary so much between brands?", answer: "EU sizes are derived from a formula, but brands use different lasts (foot molds) and manufacturing tolerances, so a '42' can fit like a 41.5 or 42.5 depending on the maker. When in doubt, compare by foot length in centimeters — the one measurement that doesn't lie." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Shoe Size Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Shoe Size Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cm" className={lbl}>Foot Length</label>
                <div className={inp}>
                  <input id="cm" type="number" min="15" max="35" step="0.1" value={inputs.cm} onChange={(e) => set("cm")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">cm</span>
                </div>
                {errors.cm && <p className="text-xs text-red-500 font-medium mt-1">{errors.cm}</p>}
              </div>
              <div>
                <label htmlFor="gender" className={lbl}>Sizing System</label>
                <select id="gender" value={inputs.gender} onChange={(e) => set("gender")(e.target.value)} className={sel}>
                  <option value="men">Men's</option>
                  <option value="women">Women's</option>
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Fit Adjustments</div>
                    <div>
                      <label htmlFor="fit" className={lbl}>Brand Fit</label>
                      <select id="fit" value={inputs.fit} onChange={(e) => set("fit")(e.target.value)} className={sel}>
                        <option value="true">True to size</option>
                        <option value="small">Runs small (+0.5 size)</option>
                        <option value="large">Runs large (−0.5 size)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">US Size ({inputs.gender === "men" ? "Men's" : "Women's"})</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.usLabel}</div>
              <div className="text-sm text-muted-foreground mt-1">
                UK {result.ukLabel} · EU {result.euSize} · JP {result.jpSize} · {parseFloat(inputs.cm).toFixed(1)} cm foot
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["UK Size", result.ukLabel],
                ["EU Size", `${result.euSize}`],
                ["Japan (mondo)", `${result.jpSize}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Size Conversion</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Foot Length by US Size</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)} cm`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="size" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">A US size step is roughly 0.85 cm of foot length — brands still vary, so measure in cm when ordering online.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">One Foot, Four Numbering Systems</h2>
            <p>Shoe sizes are four different rulers measuring the same foot. The US scale is linear in inches (US men's = 3 × inches − 23, women's 1.5 sizes higher), the UK scale runs a half size below US men's, EU sizes follow foot length (≈ cm × 1.5 + 2), and Japan's mondopoint system simply uses the foot length in centimeters. The converter shows all four for any foot.</p>
            <h2 className="text-2xl font-bold mb-3">Centimeters Are the Common Denominator</h2>
            <p>Every size system was built around foot length, which is why centimeters — or mondopoint — is the only measurement that converts cleanly across brands and regions. When ordering internationally, compare the cm length in the product listing against your own measurement; the labeled size is a translation, and translations vary.</p>
            <h2 className="text-2xl font-bold mb-3">Brands Are the Wildcard</h2>
            <p>Lasts differ: a running shoe fits differently than a dress shoe in the same size, and brands drift a half size in either direction. The Advanced Options fit adjustment shifts the result for brands that run small or large, and the honest rule still applies — if a brand's chart lists foot length, use it over the size number.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/shoe-size-converter" />
          <PopularCalculators exclude="/calculator/shoe-size-converter" />
        </div>
      </div>
    </>
  );
}
