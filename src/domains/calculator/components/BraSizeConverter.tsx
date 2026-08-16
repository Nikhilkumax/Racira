"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ConvResult {
  us: string;
  uk: string;
  eu: string;
  au: string;
  jp: string;
  bandInches: number;
  cupIndex: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const BAND_ORDER = ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46"];
const CUP_ORDER = ["AA", "A", "B", "C", "D", "DD", "E", "F", "FF", "G", "GG", "H", "HH", "J", "K"];

function convertSize(band: number, cupIndex: number): ConvResult {
  const bi = Math.max(0, Math.min(BAND_ORDER.length - 1, band));
  const ci = Math.max(0, Math.min(CUP_ORDER.length - 1, cupIndex));
  const usBand = BAND_ORDER[bi];
  const bandInches = 28 + bi * 2;
  const cup = CUP_ORDER[ci];

  const us = `${usBand}${cup}`;
  const uk = `${usBand}${CUP_ORDER[Math.max(0, ci - 1)]}`;
  const eu = `${bandInches - 4}${CUP_ORDER[ci]}`;
  const au = `${usBand}${CUP_ORDER[Math.max(0, ci - 1)]}`;
  const jp = `${bandInches - 4}${CUP_ORDER[Math.max(0, ci - 2)]}`;

  return {
    us,
    uk,
    eu,
    au,
    jp,
    bandInches,
    cupIndex: ci,
    chartData: [
      { name: "US", value: ci + 1 },
      { name: "UK", value: Math.max(0, ci) },
      { name: "EU", value: ci + 1 },
      { name: "AU", value: Math.max(0, ci) },
      { name: "JP", value: Math.max(0, ci - 1) },
    ],
    breakdown: [
      { label: "Band Size", value: `${usBand} (${bandInches} in / ${Math.round(bandInches * 2.54)} cm)` },
      { label: "Cup Letter", value: cup },
      { label: "US Size", value: us },
      { label: "UK Size", value: uk },
      { label: "EU Size", value: eu },
      { label: "AU Size", value: au },
      { label: "JP Size", value: jp },
    ],
    summaryStats: [
      { label: "US", value: us },
      { label: "UK", value: uk },
      { label: "EU", value: eu },
      { label: "AU", value: au },
      { label: "JP", value: jp },
      { label: "Band", value: `${bandInches} in` },
    ],
  };
}

const DEFAULTS = { band: "4", cup: "5" }; // 36D default

export default function BraSizeConverter() {
  const [band, setBand] = useState(DEFAULTS.band);
  const [cup, setCup] = useState(DEFAULTS.cup);
  const [result, setResult] = useState<ConvResult>(() => convertSize(4, 5));

  const calculate = () => setResult(convertSize(parseInt(band) || 0, parseInt(cup) || 0));
  const reset = () => { setBand(DEFAULTS.band); setCup(DEFAULTS.cup); setResult(convertSize(4, 5)); };
  useEffect(() => { setResult(convertSize(4, 5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why do bra sizes differ between countries?", answer: "Each sizing system uses its own band calculation and cup progression. The US and UK share band numbers but differ in cup letters from DD upward (UK adds E, F, FF; US uses DDD). EU sizes are band centimeters minus 4, and JP cups run roughly two letters smaller than US." },
    { question: "How do I convert my band size?", answer: "Band sizes share the same numbers in US, UK, and AU systems. For EU, subtract 4 from the US band number (a US 34 is an EU 80). Japanese sizes use the same numbers as EU but with different cup letters." },
    { question: "How do I convert cup letters?", answer: "Cup progression is letter-based and each system adds letters differently after D. This calculator maps cups by their position in the alphabetically ordered progression, which keeps the underlying volume consistent across systems." },
    { question: "Which system should I use?", answer: "Order from brands using the system they label. When in doubt, use this converter to find the equivalent size and always check the brand's own size guide, since fit varies by manufacturer and style." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Bra Size Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Bra Size Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Band Size</label>
              <select value={band} onChange={e => setBand(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                {BAND_ORDER.map((b, i) => <option key={b} value={i}>{b} ({(28 + i * 2)} in)</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Cup Size</label>
              <select value={cup} onChange={e => setCup(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                {CUP_ORDER.map((c, i) => <option key={c} value={i}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">US Size (Reference)</div>
              <div className="text-4xl font-extrabold text-primary">{result.us}</div>
              <div className="text-sm text-muted-foreground mt-1">Band {result.bandInches} in · Equivalent sizes in 4 other systems below</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["UK", result.uk], ["EU", result.eu], ["AU", result.au]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Size Conversion Table</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cup Progression by System</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [CUP_ORDER[Math.round(v)] || v, "Cup"]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={55} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-3 text-center">Cup letters at the same progression position hold equivalent volume across systems.</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">International Bra Sizing</h2>
            <p>A <strong>bra size converter</strong> translates a size between the US, UK, EU, Australian, and Japanese systems. The band number encodes the underbust measurement in different ways — US/UK/AU use inches rounded to the nearest even number, while EU and JP use the centimeter measurement minus 4. Cup letters then progress differently in each system, which is where most confusion comes from.</p>
            <h2 className="text-2xl font-bold mb-3">How the Conversion Works</h2>
            <p>This converter keeps the cup's progression position fixed and adjusts the letter to each system's alphabet. The UK system adds a letter after every cup (DD, E, F, FF, G), while the US system skips letters (DD, DDD, G). EU and JP cups run smaller relative to US, which is why the same physical bra may be labeled a US D but a JP C.</p>
            <h2 className="text-2xl font-bold mb-3">A Note on Fit</h2>
            <p>Sizing tables give consistent volume equivalence, but real fit varies by brand and fabric. Always check the specific brand's size guide, and remember that sister sizes (a bigger band with a smaller cup) can fine-tune the fit for your body shape.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bra-size-converter" />
          <PopularCalculators exclude="/calculator/bra-size-converter" />
        </div>
      </div>
    </>
  );
}
