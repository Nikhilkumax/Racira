"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MidResult {
  dims: number;
  mid: number[];
  distance: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function fmtPt(p: number[]): string {
  return "(" + p.map((v) => fmt(v)).join(", ") + ")";
}

function calcMid(dims: number, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): MidResult {
  const p1 = dims === 2 ? [x1, y1] : [x1, y1, z1];
  const p2 = dims === 2 ? [x2, y2] : [x2, y2, z2];
  const mid = p1.map((v, i) => (v + p2[i]) / 2);
  const distance = Math.sqrt(p1.reduce((s, v, i) => s + (v - p2[i]) ** 2, 0));
  const breakdown = [
    { label: "Point 1", value: fmtPt(p1) },
    { label: "Point 2", value: fmtPt(p2) },
    { label: "Dimensions", value: `${dims}D` },
    { label: "Midpoint M", value: fmtPt(mid) },
    { label: "Distance |P₁P₂|", value: `${fmt(distance)} units` },
  ];
  const summaryStats = [
    { label: "Midpoint", value: fmtPt(mid) },
    { label: "Distance", value: `${fmt(distance)} units` },
    { label: "Point 1", value: fmtPt(p1) },
    { label: "Point 2", value: fmtPt(p2) },
  ];
  const chartData = dims === 2
    ? [
        { name: "x1 / x2", value: Number(((x1 + x2) / 2).toFixed(3)), fill: "hsl(var(--primary))" },
        { name: "y1 / y2", value: Number(((y1 + y2) / 2).toFixed(3)), fill: "#f59e0b" },
      ]
    : [
        { name: "x-avg", value: Number(((x1 + x2) / 2).toFixed(3)), fill: "hsl(var(--primary))" },
        { name: "y-avg", value: Number(((y1 + y2) / 2).toFixed(3)), fill: "#f59e0b" },
        { name: "z-avg", value: Number(((z1 + z2) / 2).toFixed(3)), fill: "#10b981" },
      ];
  return { dims, mid, distance, breakdown, summaryStats, chartData };
}

const DEFAULTS = { x1: "2", y1: "3", z1: "1", x2: "8", y2: "7", z2: "5" };

export default function MidpointCalculator() {
  const [dims, setDims] = useState("2");
  const [x1, setX1] = useState(DEFAULTS.x1);
  const [y1, setY1] = useState(DEFAULTS.y1);
  const [z1, setZ1] = useState(DEFAULTS.z1);
  const [x2, setX2] = useState(DEFAULTS.x2);
  const [y2, setY2] = useState(DEFAULTS.y2);
  const [z2, setZ2] = useState(DEFAULTS.z2);
  const [result, setResult] = useState<MidResult | null>(null);

  const n = dims === "2" ? 2 : 3;
  const v = (s: string) => parseFloat(s);
  const errs: string[] = [];
  if (isNaN(v(x1)) || isNaN(v(y1)) || isNaN(v(x2)) || isNaN(v(y2))) errs.push("All coordinates must be numbers.");
  if (n === 3 && (isNaN(v(z1)) || isNaN(v(z2)))) errs.push("All z coordinates must be numbers.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMid(n, v(x1), v(y1), v(z1), v(x2), v(y2), v(z2))); };
  const reset = () => {
    setDims("2"); setX1(DEFAULTS.x1); setY1(DEFAULTS.y1); setZ1(DEFAULTS.z1); setX2(DEFAULTS.x2); setY2(DEFAULTS.y2); setZ2(DEFAULTS.z2);
    setResult(calcMid(2, 2, 3, 1, 8, 7, 5));
  };
  useEffect(() => { setResult(calcMid(2, 2, 3, 1, 8, 7, 5)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the midpoint of a segment?", answer: "The point exactly halfway between two endpoints. In 2D, M = ((x₁+x₂)/2, (y₁+y₂)/2); in 3D the same averaging extends to the z coordinate. It is the center of the segment." },
    { question: "How is the midpoint different from the average of numbers?", answer: "A midpoint is a point — it averages each coordinate separately, giving a location in space. Averaging two numbers gives a single value. For points on a number line the two ideas coincide; for points in the plane they do not." },
    { question: "What is the distance between the points?", answer: "The straight-line separation: √((x₂−x₁)² + (y₂−y₁)²) in 2D, with the z difference squared added in 3D. It is the Pythagorean theorem applied to the coordinate differences — shown alongside the midpoint for convenience." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Midpoint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Midpoint Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Dimensions</label>
              <select value={dims} onChange={e => setDims(e.target.value)} className={inp}>
                <option value="2">2D (x, y)</option>
                <option value="3">3D (x, y, z)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Point 1 — x₁</label>
                <input type="number" value={x1} onChange={e => setX1(e.target.value)} className={inp} placeholder="2" />
              </div>
              <div>
                <label className={lbl}>Point 1 — y₁</label>
                <input type="number" value={y1} onChange={e => setY1(e.target.value)} className={inp} placeholder="3" />
              </div>
              {n === 3 && (
                <div>
                  <label className={lbl}>Point 1 — z₁</label>
                  <input type="number" value={z1} onChange={e => setZ1(e.target.value)} className={inp} placeholder="1" />
                </div>
              )}
              <div>
                <label className={lbl}>Point 2 — x₂</label>
                <input type="number" value={x2} onChange={e => setX2(e.target.value)} className={inp} placeholder="8" />
              </div>
              <div>
                <label className={lbl}>Point 2 — y₂</label>
                <input type="number" value={y2} onChange={e => setY2(e.target.value)} className={inp} placeholder="7" />
              </div>
              {n === 3 && (
                <div>
                  <label className={lbl}>Point 2 — z₂</label>
                  <input type="number" value={z2} onChange={e => setZ2(e.target.value)} className={inp} placeholder="5" />
                </div>
              )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Midpoint M</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtPt(result.mid)}</div>
                <div className="text-sm text-muted-foreground mt-1">Distance |P₁P₂| = {fmt(result.distance)} units</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Dimensions", `${result.dims}D`], ["Midpoint", fmtPt(result.mid)], ["Distance", `${fmt(result.distance)} units`]].map(([l, v], i) => (
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
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""} font-mono`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Coordinate Averages</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">Each coordinate of the midpoint is the average of the two endpoints' coordinates</p>
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
            <h2 className="text-2xl font-bold mb-3">The Point in the Middle</h2>
            <p>Given two endpoints, the <strong>midpoint</strong> is the point exactly halfway between them. This <strong>midpoint calculator</strong> averages each coordinate separately — in 2D or 3D — and also reports the straight-line distance between the endpoints.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>For P₁ = (x₁, y₁) and P₂ = (x₂, y₂), the midpoint is ((x₁+x₂)/2, (y₁+y₂)/2). In 3D, add the z-average. It is coordinate-by-coordinate averaging, which is why the midpoint of a segment is also the center of its bounding box and the center of its circle of rotation.</p>
            <h2 className="text-2xl font-bold mb-3">Pairing with Distance</h2>
            <p>The distance formula √((x₂−x₁)² + (y₂−y₁)²) is the Pythagorean theorem in coordinates. Together, midpoint and distance give you the full picture of a segment: where its center lies and how long it is — the two numbers you reach for in geometry and design work.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/midpoint-calculator" />
          <PopularCalculators exclude="/calculator/midpoint-calculator" />
        </div>
      </div>
    </>
  );
}
