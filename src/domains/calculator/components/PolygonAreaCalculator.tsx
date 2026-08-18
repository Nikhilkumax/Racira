"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

// shoelace formula
function shoelace(pts: { x: number; y: number }[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

const DEFAULTS = { vertices: "(0,0), (4,0), (4,3), (0,3)" };

export default function PolygonAreaCalculator() {
  const [vertices, setVertices] = useState(DEFAULTS.vertices);
  const [calculated, setCalculated] = useState(false);

  const pts = vertices.split(/[()]/).map(s => s.trim()).filter(s => /-?\d/.test(s)).map(s => {
    const [x, y] = s.split(",").map(n => parseFloat(n));
    return { x, y };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y));
  const valid = pts.length >= 3;

  const area = valid ? shoelace(pts) : 0;
  // perimeter
  let perimeter = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    perimeter += Math.hypot(b.x - a.x, b.y - a.y);
  }
  // centroid
  let cx = 0, cy = 0;
  if (valid) {
    let csum = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const cross = a.x * b.y - b.x * a.y;
      csum += cross;
      cx += (a.x + b.x) * cross;
      cy += (a.y + b.y) * cross;
    }
    cx = cx / (3 * csum);
    cy = cy / (3 * csum);
  }

  const chartData = [...pts.map(p => ({ ...p })), { ...pts[0] }];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setVertices(DEFAULTS.vertices); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the shoelace formula?", answer: "It computes the area of any simple polygon from its vertex coordinates: sum the cross products xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ around the perimeter, take the absolute value, and halve it. It works for any shape — triangle, pentagon, or a 20-sided blob." },
    { question: "What order should the vertices be in?", answer: "Clockwise or counterclockwise, but consistently around the perimeter — never criss-crossing. The formula handles either winding direction (hence the absolute value), but a self-intersecting order produces a meaningless result." },
    { question: "What units is the area in?", answer: "Whatever units your coordinates use, squared: meters → m², feet → ft², degrees-of-lon/lat → (degrees)². For real-world land area in acres or hectares, convert the coordinate units first, then apply the area formula." },
    { question: "Does the centroid matter?", answer: "It's the polygon's geometric center of mass — the balance point if the shape were cut from uniform material. It comes free from the shoelace computation, which is handy for labeling shapes on maps or placing text inside drawn regions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Polygon Area Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Polygon Area Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Vertices as (x, y) pairs</label>
              <textarea rows={4} value={vertices} onChange={e => setVertices(e.target.value)} className={`${inp} resize-y`} placeholder="(0,0), (4,0), (4,3), (0,3)" />
            </div>
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Enter at least three (x, y) vertex pairs.</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">List the corners in order around the perimeter — clockwise or counterclockwise — and the shoelace formula handles the rest.</p>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Polygon Area</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(area)}</div>
                <div className="text-sm text-muted-foreground mt-1">units² · shoelace formula over {pts.length} vertices</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Perimeter", fmt(perimeter), "edge length total"], ["Vertices", `${pts.length}`, "corner points"], ["Centroid", `(${fmt(cx)}, ${fmt(cy)})`, "geometric center"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Shape Outline</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, name: string) => [`${fmt(Number(v))}`, name === "y" ? "y" : "x"]} />
                    <Line type="linear" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Closed outline of your polygon — the shoelace sum wraps back to the first vertex</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Geometry Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Area (shoelace):</span><span className="font-semibold">{fmt(area)} units²</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Perimeter:</span><span className="font-semibold">{fmt(perimeter)} units</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Centroid x:</span><span className="font-semibold">{fmt(cx)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Centroid y:</span><span className="font-semibold">{fmt(cy)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vertex count:</span><span className="font-semibold">{pts.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Winding:</span><span className="font-semibold">{(() => { let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i]; const b = pts[(i + 1) % pts.length]; s += (b.x - a.x) * (b.y + a.y); } return s > 0 ? "CCW" : "CW"; })()}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Any Shape, One Formula</h2>
            <p>Rectangles and triangles have neat formulas; real polygons don't. This <strong>polygon area calculator</strong> applies the shoelace formula, which handles any simple polygon — regular or wildly irregular — using nothing but its corner coordinates.</p>
            <h2 className="text-2xl font-bold mb-3">How the Shoelace Works</h2>
            <p>Walk the perimeter, multiplying each x by the next vertex's y and subtracting the reverse, then sum and halve. The cross products measure signed trapezoid areas that cancel for everything outside the polygon — leaving exactly the enclosed area.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond Area</h2>
            <p>The same vertex list yields the perimeter and centroid almost for free. That makes the tool useful for surveying plots, mapping irregular regions, or any layout work where the shape defies a textbook formula.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/polygon-area-calculator" />
          <PopularCalculators exclude="/calculator/polygon-area-calculator" />
        </div>
      </div>
    </>
  );
}
