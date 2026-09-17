"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type AreaUnit =
  | "sqm"
  | "sqft"
  | "sqin"
  | "sqyard"
  | "acre"
  | "hectare"
  | "sqmile"
  | "sqkm";

interface AreaInputs {
  value: string;
  fromUnit: AreaUnit;
  decimals: string;
}

interface AreaResult {
  baseSqm: number;
  conversions: { unit: AreaUnit; label: string; symbol: string; value: number }[];
  primary: { label: string; value: string };
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { unit: string; value: number; fill: string }[];
}

const TO_SQM: Record<AreaUnit, number> = {
  sqm: 1,
  sqft: 0.092903,
  sqin: 0.00064516,
  sqyard: 0.836127,
  acre: 4046.86,
  hectare: 10000,
  sqmile: 2589988.11,
  sqkm: 1000000,
};

const UNIT_META: Record<AreaUnit, { label: string; symbol: string }> = {
  sqm: { label: "Square Meters", symbol: "m²" },
  sqft: { label: "Square Feet", symbol: "ft²" },
  sqin: { label: "Square Inches", symbol: "in²" },
  sqyard: { label: "Square Yards", symbol: "yd²" },
  acre: { label: "Acres", symbol: "ac" },
  hectare: { label: "Hectares", symbol: "ha" },
  sqmile: { label: "Square Miles", symbol: "mi²" },
  sqkm: { label: "Square Kilometers", symbol: "km²" },
};

const COLORS: Record<AreaUnit, string> = {
  sqm: "#3b82f6",
  sqft: "#10b981",
  sqin: "#f59e0b",
  sqyard: "#8b5cf6",
  acre: "#ef4444",
  hectare: "#06b6d4",
  sqmile: "#ec4899",
  sqkm: "#84cc16",
};

function calcArea(inputs: AreaInputs): AreaResult {
  const rawValue = parseFloat(inputs.value);
  const value = Number.isFinite(rawValue) ? rawValue : 0;
  const rawDecimals = parseInt(inputs.decimals);
  const decimals = Number.isFinite(rawDecimals) ? Math.max(0, Math.min(10, rawDecimals)) : 4;
  const fromUnit: AreaUnit = inputs.fromUnit || "sqft";

  const factor = TO_SQM[fromUnit] || 1;
  const baseSqm = value * factor;

  const round = (n: number) => {
    if (!Number.isFinite(n)) return 0;
    return parseFloat(n.toFixed(decimals));
  };

  const conversions = (Object.keys(TO_SQM) as AreaUnit[]).map((unit) => {
    const v = unit === "sqm" ? baseSqm : baseSqm / TO_SQM[unit];
    return {
      unit,
      label: UNIT_META[unit].label,
      symbol: UNIT_META[unit].symbol,
      value: round(v),
    };
  });

  const primaryConv = conversions.find((c) => c.unit === fromUnit)!;

  const primary = {
    label: `Converted Area`,
    value: `${primaryConv.value.toLocaleString("en-US", { maximumFractionDigits: decimals })} ${primaryConv.symbol}`,
  };

  const breakdown = conversions.map((c) => ({
    label: `${c.label} (${c.symbol})`,
    value: c.value.toLocaleString("en-US", { maximumFractionDigits: decimals }),
  }));

  const positive = value > 0;
  const summaryStats = [
    { label: "Input Value", value: `${value.toLocaleString("en-US", { maximumFractionDigits: decimals })} ${UNIT_META[fromUnit].symbol}` },
    { label: "Base (m²)", value: baseSqm.toLocaleString("en-US", { maximumFractionDigits: decimals }) },
    { label: "Total Units", value: `${conversions.length}` },
    { label: "Largest Unit", value: UNIT_META.sqkm.label },
    { label: "Smallest Unit", value: UNIT_META.sqin.label },
    { label: "Status", value: positive ? "Valid" : value < 0 ? "Negative" : "Zero" },
  ];

  const chartData = conversions.map((c) => ({
    unit: c.symbol,
    value: c.value,
    fill: COLORS[c.unit],
  }));

  return {
    baseSqm: round(baseSqm),
    conversions,
    primary,
    breakdown,
    summaryStats,
    chartData,
  };
}

const DEFAULTS: AreaInputs = { value: "1000", fromUnit: "sqft", decimals: "4" };

export default function AreaConverter() {
  const [inputs, setInputs] = useState<AreaInputs>(DEFAULTS);
  const [result, setResult] = useState<AreaResult>(calcArea(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calcArea(inputs));
  }, []);

  const calculate = () => setResult(calcArea(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcArea(DEFAULTS));
  };

  const update = (patch: Partial<AreaInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How do I convert square feet to square meters?", answer: "Multiply square feet by 0.092903. For example, 1,000 sq ft × 0.092903 = 92.903 m². This converter does the math for any pair of units instantly." },
    { question: "How many square feet are in an acre?", answer: "One acre equals 43,560 square feet, which is about 4,046.86 square meters. Acres are commonly used for land measurement in the US and UK." },
    { question: "What is the difference between a hectare and an acre?", answer: "A hectare is 10,000 square meters (about 2.471 acres). Hectares are the standard metric land unit used worldwide, while acres are imperial units used mainly in the US and UK." },
    { question: "Why would a negative area appear?", answer: "A negative input value produces a negative converted area, which can represent a deficit, removal, or reversed measurement. The calculator handles negatives without errors and simply mirrors the sign." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Area Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Area Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-base font-medium block mb-1.5">Value</label>
                <div className={inp}>
                   <input type="number" value={inputs.value} onChange={(e) => update({ value: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} placeholder="1000" />
                </div>
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">From Unit</label>
                <div className={inp}>
                  <select value={inputs.fromUnit} onChange={(e) => update({ fromUnit: e.target.value as AreaUnit })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci}>
                    {(Object.keys(TO_SQM) as AreaUnit[]).map((u) => (
                      <option key={u} value={u}>{UNIT_META[u].label} ({UNIT_META[u].symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={() => setShowAdv(!showAdv)} className="text-sm text-primary font-medium text-left">
              Advanced Options {showAdv ? "▲" : "▼"}
            </button>
            {showAdv && (
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Precision</div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Decimal Places</label>
                    <div className={inp}>
                       <input type="number" value={inputs.decimals} onChange={(e) => update({ decimals: e.target.value })} min={0} max={10} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.primary.label}</div>
              <div className="text-4xl font-extrabold tracking-tight text-primary">{result.primary.value}</div>
              <div className="text-sm text-muted-foreground mt-1">Base: {result.baseSqm.toLocaleString("en-US")} m²</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {result.conversions.slice(0, 3).map((c, i) => (
                <div key={c.unit} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{c.symbol}</div>
                  <div className="text-base font-bold">{c.value.toLocaleString("en-US", { maximumFractionDigits: 4 })}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Area in All Units</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${i === (result.breakdown.findIndex((b) => b.label.startsWith(UNIT_META[inputs.fromUnit].label))) ? "bg-primary/5" : ""}`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Equivalent Areas (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US"), "Area"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Area Conversion Across Units</h2>
            <p>An area converter is a practical measurement utility that translates a single land or surface area into every common unit of area simultaneously. The foundation of area conversion is the square meter (m²), the SI-derived unit from which all other area units are defined through fixed, exact factors. Whether you are working in square feet, square yards, acres, hectares, square kilometers, or square miles, every value can be normalized to square meters and then redistributed to the target unit. This calculator converts your input into all units at once using precise factors—such as 1 square foot = 0.092903 m², 1 acre = 4,046.86 m², and 1 square mile = 2,589,988.11 m²—so you see the complete picture in a single pass without juggling multiple tools.</p>

            <h2 className="text-2xl font-bold mb-3">Real Estate, Construction, and Land Measurement</h2>
            <p>Area conversion is essential in real estate and construction, where property records, floor plans, and zoning codes frequently mix imperial and metric units. In the United States, homes are listed in square feet while large parcels are described in acres; internationally, listings use square meters and hectares. A builder estimating material quantities—flooring, drywall, paint, or turf—must convert blueprint dimensions into purchasable units, and a landscaper pricing a lawn must move between square feet, square yards, and acres. Converting correctly prevents costly over- or under-ordering. The bar chart in this tool lets you visually compare how the same physical space scales across units, making it easy to spot when an acre dwarfs a square foot or when a hectare sits between the two.</p>

            <h2 className="text-2xl font-bold mb-3">Precision, Rounding, and Practical Use</h2>
            <p>Because area values span many orders of magnitude—from a tiny square inch to a vast square mile—rounding precision matters. The Advanced Options panel lets you set decimal places (default 4) to control rounding for every conversion, breakdown row, and chart value at once. Zero, negative, and empty inputs are all handled safely: an empty or invalid field is treated as zero rather than producing an error, and a negative value simply mirrors its sign to represent a deficit or removal. Use the decimal control to tighten results for engineering specs or loosen them for quick estimates, then read the primary result card, the three-unit stat bar, the full breakdown table, and the summary statistics to fully understand your converted area.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/area-converter" />
          <PopularCalculators exclude="/calculator/area-converter" />
        </div>
      </div>
    </>
  );
}
