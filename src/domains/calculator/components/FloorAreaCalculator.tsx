"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FloorResult {
  length: number;
  width: number;
  areaSqFt: number;
  areaSqM: number;
  areaSqYd: number;
  perimeter: number;
  pricePerSqFt: number;
  cost: number;
  chartData: { name: string; value: number }[];
}

function calcFloor(length: number, width: number, price: number): FloorResult {
  const areaSqFt = length * width;
  const areaSqM = areaSqFt * 0.092903;
  const areaSqYd = areaSqFt / 9;
  const perimeter = 2 * (length + width);
  const cost = areaSqFt * price;
  const chartData = [
    { name: "Sq ft", value: Number(areaSqFt.toFixed(1)) },
    { name: "Sq m", value: Number(areaSqM.toFixed(1)) },
    { name: "Sq yd", value: Number(areaSqYd.toFixed(1)) },
  ];
  return { length, width, areaSqFt, areaSqM, areaSqYd, perimeter, pricePerSqFt: price, cost, chartData };
}

const DEFAULTS = { length: "20", width: "20", price: "5" };

const faqs = [
  { question: "How is floor area measured?", answer: "For a rectangular room, area = length × width. For irregular shapes, split into rectangles, add the pieces, and subtract cutouts like stairwells or closets." },
  { question: "Why do sq ft and sq m differ so much?", answer: "One square meter is about 10.76 square feet (1 m = 3.281 ft, squared). A 400 sq ft room is only about 37.2 sq m — listings in different countries use different units, so convert before comparing." },
  { question: "What is perimeter used for?", answer: "Perimeter (2 × (L + W)) sizes baseboards, crown molding, and flooring waste. For real-world material orders, add 5–10% waste for cuts — diagonal layouts need more." },
];

export default function FloorAreaCalculator() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<FloorResult>(() => calcFloor(20, 20, 5));

  useEffect(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const p = parseFloat(price);
    if (!isNaN(l) && !isNaN(w) && !isNaN(p) && l > 0 && w > 0 && p >= 0) setResult(calcFloor(l, w, p));
  }, [length, width, price]);

  const reset = () => { setLength(DEFAULTS.length); setWidth(DEFAULTS.width); setPrice(DEFAULTS.price); };
  const invalid = isNaN(parseFloat(length)) || isNaN(parseFloat(width)) || isNaN(parseFloat(price)) || parseFloat(length) <= 0 || parseFloat(width) <= 0 || parseFloat(price) < 0;

  const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const breakdown = [
    { label: "Length", value: `${result.length} ft` },
    { label: "Width", value: `${result.width} ft` },
    { label: "Floor Area", value: `${result.areaSqFt.toLocaleString("en-US", { maximumFractionDigits: 1 })} sq ft`, highlight: true },
    { label: "Area (sq m)", value: `${result.areaSqM.toLocaleString("en-US", { maximumFractionDigits: 1 })} m²` },
    { label: "Area (sq yd)", value: `${result.areaSqYd.toLocaleString("en-US", { maximumFractionDigits: 1 })} yd²` },
    { label: "Perimeter", value: `${result.perimeter.toLocaleString()} ft` },
    { label: "Flooring Price", value: `${fmtMoney(result.pricePerSqFt)}/sq ft` },
    { label: "Material Cost", value: fmtMoney(result.cost) },
  ];

  const summaryStats = [
    { label: "Area (sq ft)", value: `${result.areaSqFt.toLocaleString("en-US", { maximumFractionDigits: 1 })}` },
    { label: "Area (m²)", value: `${result.areaSqM.toLocaleString("en-US", { maximumFractionDigits: 1 })}` },
    { label: "Area (yd²)", value: `${result.areaSqYd.toLocaleString("en-US", { maximumFractionDigits: 1 })}` },
    { label: "Perimeter", value: `${result.perimeter.toLocaleString()} ft` },
    { label: "Est. Cost", value: fmtMoney(result.cost) },
    { label: "Rooms (400 sq ft each)", value: `${(result.areaSqFt / 400).toFixed(1)}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Floor Area Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Floor Area Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fa-len" className="block text-sm font-medium mb-1 text-foreground">Length (ft)</label>
                <input id="fa-len" type="number" min="0.1" step="0.5" value={length} onChange={(e) => setLength(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="fa-wid" className="block text-sm font-medium mb-1 text-foreground">Width (ft)</label>
                <input id="fa-wid" type="number" min="0.1" step="0.5" value={width} onChange={(e) => setWidth(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Advanced Options</div>
              <label htmlFor="fa-price" className="block text-sm font-medium mb-1 text-foreground">Flooring Price ($/sq ft)</label>
              <input id="fa-price" type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Ruler className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter positive dimensions and a non-negative price.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Floor Area</div>
              <div className="text-4xl font-extrabold text-primary">{result.areaSqFt.toLocaleString("en-US", { maximumFractionDigits: 1 })} sq ft</div>
              <div className="text-sm text-muted-foreground mt-1">{result.areaSqM.toLocaleString("en-US", { maximumFractionDigits: 1 })} m² · {result.areaSqYd.toLocaleString("en-US", { maximumFractionDigits: 1 })} yd²</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Area (m²)</div>
                <div className="text-lg font-bold text-primary">{result.areaSqM.toLocaleString("en-US", { maximumFractionDigits: 1 })}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Perimeter</div>
                <div className="text-lg font-bold text-primary">{result.perimeter.toLocaleString()} ft</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Est. Cost</div>
                <div className="text-lg font-bold text-primary">{fmtMoney(result.cost)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Area in Different Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Floor Area Calculator</h2>
            <p>Rectangular floor area is the product of length and width. The same 20 × 20 ft room measures 400 sq ft, 37.2 sq m, and 44.4 sq yd — the three units most commonly quoted in real-estate listings worldwide, which is why comparing international properties requires conversion.</p>
            <h3>Beyond the Rectangle</h3>
            <p>Real floors aren't always rectangular: split L-shaped rooms into rectangles, subtract closets and stairwells, and measure to the interior walls (excluding trim). For material purchasing, add 5–10% for waste — the perimeter figure helps budget baseboards and moldings.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/floor-area-calculator" />
          <PopularCalculators exclude="/calculator/floor-area-calculator" />
        </div>
      </div>
    </>
  );
}
