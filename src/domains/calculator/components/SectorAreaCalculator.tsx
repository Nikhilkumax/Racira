"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SectorInput {
  radius: number;
  angle: number;
  angleUnit: "deg" | "rad";
}

interface SectorResult {
  angleDeg: number;
  area: number;
  arcLength: number;
  chordLength: number;
  perimeter: number;
  fractionOfCircle: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSector(input: SectorInput): SectorResult {
  const angleDeg = input.angleUnit === "deg" ? input.angle : (input.angle * 180) / Math.PI;
  const fractionOfCircle = angleDeg / 360;
  const area = (angleDeg / 360) * Math.PI * input.radius * input.radius;
  const arcLength = (angleDeg / 360) * 2 * Math.PI * input.radius;
  const chordLength = 2 * input.radius * Math.sin((angleDeg * Math.PI) / 360);
  const perimeter = 2 * input.radius + arcLength;

  const donutData = [
    { name: `Sector (${angleDeg.toFixed(0)}°)`, value: Number(area.toFixed(2)), color: "hsl(var(--primary))" },
    { name: "Rest of circle", value: Number((Math.PI * input.radius * input.radius - area).toFixed(2)), color: "#e2e8f0" },
  ];

  const breakdown = [
    { label: "Radius", value: `${input.radius}` },
    { label: "Central Angle", value: `${angleDeg.toFixed(1)}°` },
    { label: "Fraction of Circle", value: `${(fractionOfCircle * 100).toFixed(1)}%` },
    { label: "Sector Area", value: `${area.toFixed(2)}` },
    { label: "Arc Length", value: `${arcLength.toFixed(2)}` },
    { label: "Chord Length", value: `${chordLength.toFixed(2)}` },
    { label: "Perimeter (2r + arc)", value: `${perimeter.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Sector Area", value: `${area.toFixed(2)}` },
    { label: "Arc Length", value: `${arcLength.toFixed(2)}` },
    { label: "Chord Length", value: `${chordLength.toFixed(2)}` },
    { label: "Perimeter", value: `${perimeter.toFixed(2)}` },
    { label: "Central Angle", value: `${angleDeg.toFixed(1)}°` },
    { label: "Fraction of Circle", value: `${(fractionOfCircle * 100).toFixed(1)}%` },
  ];

  return { angleDeg, area, arcLength, chordLength, perimeter, fractionOfCircle, donutData, breakdown, summaryStats };
}

const DEFAULTS: SectorInput = { radius: 5, angle: 60, angleUnit: "deg" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SectorAreaCalculator() {
  const [radius, setRadius] = useState(String(DEFAULTS.radius));
  const [angle, setAngle] = useState(String(DEFAULTS.angle));
  const [angleUnit, setAngleUnit] = useState<SectorInput["angleUnit"]>(DEFAULTS.angleUnit);
  const [result, setResult] = useState<SectorResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSector({ radius: parse(radius, DEFAULTS.radius), angle: parse(angle, DEFAULTS.angle), angleUnit }));
  const reset = () => {
    setRadius(String(DEFAULTS.radius));
    setAngle(String(DEFAULTS.angle));
    setAngleUnit(DEFAULTS.angleUnit);
    setResult(calcSector(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSector(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a sector?", answer: "A sector is the pie-slice region of a circle bounded by two radii and the arc between them. A 60° sector of a circle is exactly 1/6 of the whole circle (60 ÷ 360)." },
    { question: "How is sector area calculated?", answer: "Area = (θ ÷ 360) × πr² in degrees, or (θ ÷ 2) × r² in radians. It is the circle's area scaled by the fraction of the full rotation the angle covers." },
    { question: "What are arc and chord length?", answer: "Arc length = (θ ÷ 360) × 2πr — the curved edge. Chord length = 2r × sin(θ/2) — the straight line between the two endpoints. Both are useful for measuring and constructing sectors." },
    { question: "Degrees or radians?", answer: "Either works. Degrees are intuitive (60°, 90°); radians make formulas cleaner — sector area is simply ½r²θ. This calculator accepts both and converts internally." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Sector Area Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Sector Area Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Radius</label>
                <div className={inp}><input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Central Angle</label>
                <div className={inp}><input type="number" value={angle} onChange={(e) => setAngle(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Angle Unit</label>
                <select value={angleUnit} onChange={(e) => setAngleUnit(e.target.value as SectorInput["angleUnit"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="deg">Degrees</option>
                  <option value="rad">Radians</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Sector Area</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.area.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.fractionOfCircle * 100}% of the circle · arc {result.arcLength.toFixed(2)} · chord {result.chordLength.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Arc Length", `${result.arcLength.toFixed(2)}`], ["Chord Length", `${result.chordLength.toFixed(2)}`], ["Perimeter", `${result.perimeter.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Sector Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Sector vs Full Circle</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                      <Legend />
                    </PieChart>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Sector</h2>
            <p>A sector is a slice of a circle — the region between two radii and the arc. Its area is the circle's area scaled by the angle fraction: (θ ÷ 360) × πr² in degrees, or ½r²θ in radians, which is why radian formulas are so compact.</p>
            <h2 className="text-2xl font-bold mb-3">Three Lengths, One Slice</h2>
            <p>The sector has two straight radii, a curved arc, and a straight chord connecting the arc endpoints. Perimeter = 2r + arc length; chord = 2r·sin(θ/2). Together they describe the slice completely — useful in fabrication, gearing, and design.</p>
            <h2 className="text-2xl font-bold mb-3">Where Sectors Appear</h2>
            <p>Pizza and pie slices are sectors; gear teeth, fan blades, and pie charts are built from them. Radians make the math flow: arc = rθ and area = ½r²θ, so engineers prefer radians while everyday angles stay in degrees.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sector-area-calculator" />
          <PopularCalculators exclude="/calculator/sector-area-calculator" />
        </div>
      </div>
    </>
  );
}
