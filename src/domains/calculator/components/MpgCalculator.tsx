"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MpgResult {
  unit: string;
  distance: number;
  fuel: number;
  mpg: number;
  lp100: number;
  kmPerL: number;
  costPerUnit: number | null;
  totalCost: number | null;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMpg(unit: string, distance: number, fuel: number, price: number | null): MpgResult {
  // Convert everything to km and liters
  const km = unit === "imperial" ? distance * 1.60934 : distance;
  const liters = unit === "imperial" ? fuel * 3.78541 : fuel;
  const mpg = liters > 0 ? km / 1.60934 / (liters / 3.78541) : 0;
  const lp100 = km > 0 ? (liters / km) * 100 : 0;
  const kmPerL = liters > 0 ? km / liters : 0;
  const costPerUnit = price !== null ? price / (unit === "imperial" ? mpg : kmPerL) : null;
  const totalCost = price !== null ? fuel * price : null;
  const breakdown = [
    { label: "Distance", value: unit === "imperial" ? `${fmt(distance)} miles` : `${fmt(distance)} km` },
    { label: "Fuel Used", value: unit === "imperial" ? `${fmt(fuel)} gallons (US)` : `${fmt(fuel)} liters` },
    { label: "Fuel Economy (MPG)", value: `${fmt(mpg)} mpg` },
    { label: "Fuel Consumption", value: `${fmt(lp100)} L/100km` },
    { label: "Fuel Economy (km/L)", value: `${fmt(kmPerL)} km/L` },
    ...(price !== null ? [
      { label: "Cost per Mile/km", value: unit === "imperial" ? `$${fmt(costPerUnit!)}/mile` : `$${fmt(costPerUnit!)}/km` },
      { label: "Total Fuel Cost", value: `$${fmt(totalCost!)}` },
    ] : []),
  ];
  const summaryStats = [
    { label: "MPG (US)", value: `${fmt(mpg)} mpg` },
    { label: "L/100km", value: `${fmt(lp100)} L/100km` },
    { label: "km/L", value: `${fmt(kmPerL)} km/L` },
    ...(price !== null ? [{ label: "Total Fuel Cost", value: `$${fmt(totalCost!)}` }] : []),
  ];
  const chartData = [
    { name: "MPG", value: Number(mpg.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "L/100km", value: Number(lp100.toFixed(1)), fill: "#f59e0b" },
    { name: "km/L", value: Number(kmPerL.toFixed(1)), fill: "#10b981" },
  ];
  return { unit, distance, fuel, mpg, lp100, kmPerL, costPerUnit, totalCost, breakdown, summaryStats, chartData };
}

const DEFAULTS = { dist: "300", fuel: "12", price: "3.5" };

export default function MpgCalculator() {
  const [unit, setUnit] = useState<string>("imperial");
  const [dist, setDist] = useState(DEFAULTS.dist);
  const [fuel, setFuel] = useState(DEFAULTS.fuel);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<MpgResult | null>(null);

  const d = parseFloat(dist);
  const f = parseFloat(fuel);
  const p = price.trim() === "" ? null : parseFloat(price);
  const errs: string[] = [];
  if (!d || d <= 0) errs.push("Distance must be greater than 0.");
  if (!f || f <= 0) errs.push("Fuel used must be greater than 0.");
  if (p !== null && p < 0) errs.push("Price cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMpg(unit, d, f, p)); };
  const reset = () => {
    setUnit("imperial"); setDist(DEFAULTS.dist); setFuel(DEFAULTS.fuel); setPrice(DEFAULTS.price);
    setResult(calcMpg("imperial", 300, 12, 3.5));
  };
  useEffect(() => { setResult(calcMpg("imperial", 300, 12, 3.5)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is MPG?", answer: "Miles per gallon — the distance a vehicle travels on one US gallon of fuel. Higher is better. Outside the US the same idea is expressed as liters per 100 km (lower is better) or km per liter." },
    { question: "How do I measure it accurately?", answer: "Fill the tank completely, reset the trip odometer, drive normally, and refill to the same level. Divide the miles on the trip meter by the gallons of the second fill. One fill-up is noisy; average several for a reliable number." },
    { question: "How do MPG and L/100km relate?", answer: "They are reciprocals with unit factors: L/100km = 235.215 ÷ mpg, and mpg = 235.215 ÷ L/100km. Because of the reciprocal relationship, a 10 mpg to 15 mpg improvement matters more than 30 to 40 — fuel savings per mile are what matter." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator#transportation" }, { label: "Miles Per Gallon Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Miles Per Gallon Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Units</label>
              <select value={unit} onChange={e => setUnit(e.target.value)} className={inp}>
                <option value="imperial">US — miles &amp; gallons</option>
                <option value="metric">Metric — km &amp; liters</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{unit === "imperial" ? "Distance (miles)" : "Distance (km)"}</label>
                <input type="number" value={dist} onChange={e => setDist(e.target.value)} className={inp} placeholder="300" />
              </div>
              <div>
                <label className={lbl}>{unit === "imperial" ? "Fuel Used (gallons)" : "Fuel Used (liters)"}</label>
                <input type="number" value={fuel} onChange={e => setFuel(e.target.value)} className={inp} placeholder="12" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Fuel Price ({unit === "imperial" ? "$/gallon" : "$/liter"}) — optional</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inp} placeholder="3.50" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Fuel Economy</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.mpg)} mpg</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.lp100)} L/100km · {fmt(result.kmPerL)} km/L</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`MPG (US)`, `${fmt(result.mpg)} mpg`], ["L/100km", `${fmt(result.lp100)} L/100km`], ["km/L", `${fmt(result.kmPerL)} km/L`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Efficiency Metrics Compared</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">MPG and km/L rise with efficiency; L/100km falls</p>
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
            <h2 className="text-2xl font-bold mb-3">The Number Every Driver Quotes</h2>
            <p>Miles per gallon answers a simple question: how far does your tank take you? This <strong>miles per gallon calculator</strong> divides distance by fuel used and converts the result into the three standard metrics — MPG, liters per 100 km, and km per liter — whichever your side of the ocean uses.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring It Yourself</h2>
            <p>Fill the tank to the brim, zero the trip meter, drive your usual mix of roads, and fill again. Divide trip miles by the second fill's gallons. Repeated fills smooth out hills, traffic, and weather — a single fill-up can be off by 10% or more.</p>
            <h2 className="text-2xl font-bold mb-3">The Cost Side</h2>
            <p>Add your fuel price and the calculator reports cost per mile and total fuel cost for the trip. That per-mile number is what actually decides whether a fuel-efficient car pays for itself — and it is why the reciprocal relationship between MPG and L/100km matters when comparing vehicles.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/miles-per-gallon-calculator" />
          <PopularCalculators exclude="/calculator/miles-per-gallon-calculator" />
        </div>
      </div>
    </>
  );
}
