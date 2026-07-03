"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const ArcLengthCalculator = () => {
  const DEFAULTS = { radius: "5", angle: "72", angleUnit: "degrees" };
  const [radius, setRadius] = useState(DEFAULTS.radius);
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [angleUnit, setAngleUnit] = useState(DEFAULTS.angleUnit);
  const [result, setResult] = useState<any>(null);

  const calculate = (r = radius, ang = angle, unit = angleUnit) => {
    const R = parseFloat(r);
    const A = parseFloat(ang);
    if (isNaN(R) || isNaN(A) || R <= 0) return;

    const thetaRad = unit === "degrees" ? A * Math.PI / 180 : A;
    const thetaDeg = unit === "degrees" ? A : A * 180 / Math.PI;

    // Arc length: s = r × θ (θ in radians)
    const arcLength = R * thetaRad;
    // Chord length: c = 2r × sin(θ/2)
    const chordLength = 2 * R * Math.sin(thetaRad / 2);
    // Sector area: A = r²θ/2
    const sectorArea = 0.5 * R * R * thetaRad;
    // Segment area: A_seg = r²/2 × (θ - sin θ)
    const segmentArea = 0.5 * R * R * (thetaRad - Math.sin(thetaRad));
    // Apothem (distance from center to chord midpoint): ap = r × cos(θ/2)
    const apothem = R * Math.cos(thetaRad / 2);
    // Full circle perimeter & area for reference
    const fullCircumference = 2 * Math.PI * R;
    const fullArea = Math.PI * R * R;
    const arcFraction = thetaRad / (2 * Math.PI);

    const chartData = [
      { label: "Arc Length", value: parseFloat(arcLength.toFixed(4)), color: "#3b82f6" },
      { label: "Chord Length", value: parseFloat(chordLength.toFixed(4)), color: "#10b981" },
      { label: "Sector Area", value: parseFloat(sectorArea.toFixed(4)), color: "#f59e0b" },
      { label: "Segment Area", value: parseFloat(segmentArea.toFixed(4)), color: "#8b5cf6" },
    ];

    setResult({ R, thetaRad, thetaDeg, arcLength, chordLength, sectorArea, segmentArea, apothem, fullCircumference, fullArea, arcFraction, chartData });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setRadius(DEFAULTS.radius); setAngle(DEFAULTS.angle); setAngleUnit(DEFAULTS.angleUnit);
    calculate(DEFAULTS.radius, DEFAULTS.angle, DEFAULTS.angleUnit);
  };

  const faqs = [
    { question: "What is the arc length formula?", answer: "Arc length s = r × θ, where r = radius and θ = central angle in radians. If the angle is in degrees: s = r × (θ° × π/180) = πrθ°/180. Example: radius = 5, angle = 72° = 72×π/180 = 2π/5 radians. Arc length = 5 × 2π/5 = 2π ≈ 6.283. This is exactly 1/5 of the full circumference (2π×5 = 10π), since 72° = 1/5 of 360°." },
    { question: "What is the difference between arc length and chord length?", answer: "Arc length: the curved distance along the circle's edge from one point to another. Chord length: the straight-line distance between the two endpoints. Arc length ≥ chord length (equality only at θ=0). Chord = 2r × sin(θ/2). For small angles, chord ≈ arc (since sin(x) ≈ x for small x). For 72°: arc = 6.283, chord = 2×5×sin(36°) = 10×0.588 = 5.878." },
    { question: "What is a sector vs a segment?", answer: "Sector: the 'pie slice' area bounded by two radii and the arc. Area = r²θ/2. Segment: the region bounded by the chord and the arc (crescent shape). Area = sector area − triangle area = r²/2 × (θ − sin θ). For our 72° example: sector = 25×2π/5/2 = 5π ≈ 15.708 sq units. Segment = 5π − 25/2×sin(72°) = 5π − 11.888 ≈ 3.820 sq units." },
    { question: "How do you find the radius from arc length?", answer: "r = s / θ (where θ is in radians). If you know arc length and central angle in degrees: r = 180s / (πθ°). Example: arc = 12 units, angle = 90°. Radius = 180×12 / (π×90) = 2160 / 282.74 ≈ 7.64. This rearrangement of s = rθ is useful in engineering: gear design, road curve design, and antenna reflector calculations." },
    { question: "What is the apothem of a sector?", answer: "The apothem is the perpendicular distance from the center to the chord. Apothem = r × cos(θ/2). For a regular polygon, the apothem is the distance from center to the midpoint of each edge — identical concept. The height of the triangle (formed by the two radii and chord) equals the apothem. It is used in polygon area calculations: Area = (perimeter × apothem) / 2." },
    { question: "How are arc lengths used in engineering?", answer: "Road and railway curve design: horizontal curves are arcs. Gear teeth: pitch of a gear is arc length per tooth. Belt/pulley systems: arc of contact determines friction. Antenna design: parabolic reflectors are designed using arc-based calculations. CNC machining: arc moves (G02/G03) require radius and arc length calculations. Irrigation: center-pivot systems rotate in arcs, covering sector-shaped areas." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Arc Length Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Arc Length Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Radius (r)</label>
              <input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} min={0} className="w-full h-12 px-3 text-2xl rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. 5" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Central Angle</label>
              <div className="flex gap-2">
                <input type="number" value={angle} onChange={(e) => setAngle(e.target.value)} className="flex-1 h-12 px-3 text-2xl rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. 72" />
                <select value={angleUnit} onChange={(e) => setAngleUnit(e.target.value)} className="h-12 px-3 rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 text-base">
                  <option value="degrees">Degrees °</option>
                  <option value="radians">Radians rad</option>
                </select>
              </div>
              {result && (
                <div className="text-xs text-muted-foreground mt-1">
                  = {fmt(result.thetaDeg, 4)}° = {fmt(result.thetaRad, 6)} rad = {fmt(result.arcFraction * 100, 2)}% of full circle
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Arc Length (s)</div>
                  <div className="text-3xl font-bold text-primary">{fmt(result.arcLength)}</div>
                  <div className="text-xs text-muted-foreground mt-1">s = r × θ = {fmt(result.R)} × {fmt(result.thetaRad, 4)}</div>
                </div>
                <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Sector Area</div>
                  <div className="text-3xl font-bold text-amber-600">{fmt(result.sectorArea)}</div>
                  <div className="text-xs text-muted-foreground mt-1">A = r²θ/2 = {fmt(result.R)}² × {fmt(result.thetaRad, 4)}/2</div>
                </div>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">All Measurements</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Radius (r)", value: fmt(result.R) },
                    { label: "Central Angle", value: `${fmt(result.thetaDeg, 4)}° = ${fmt(result.thetaRad, 6)} rad` },
                    { label: "Arc Length (s = rθ)", value: fmt(result.arcLength) },
                    { label: "Chord Length (2r sin θ/2)", value: fmt(result.chordLength) },
                    { label: "Sector Area (r²θ/2)", value: fmt(result.sectorArea) },
                    { label: "Segment Area", value: fmt(result.segmentArea) },
                    { label: "Apothem (r cos θ/2)", value: fmt(result.apothem) },
                    { label: "Arc / Circumference", value: `${fmt(result.arcFraction * 100, 3)}%` },
                    { label: "Full Circumference", value: fmt(result.fullCircumference) },
                    { label: "Full Circle Area", value: fmt(result.fullArea) },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Measurement Comparison</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [Number(v).toLocaleString(undefined, { maximumFractionDigits: 4 }), ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an Arc Length Calculator?</h2>
            <p>An arc length calculator computes the arc length, chord length, sector area, segment area, and apothem of a circular sector. Pre-filled with radius=5 and angle=72° (1/5 of a circle): arc length = 2π ≈ 6.283, sector area = 5π ≈ 15.708 sq units. The formula is s = rθ where θ must be in radians.</p>
            <h2>Arc Length Formula</h2>
            <p><strong>s = r × θ</strong> (θ in radians). Since 360° = 2π radians, arc length = r × 2π × (degrees/360) = πd × (degrees/360) where d = diameter. For a semicircle: s = πr. For a quarter circle: s = πr/2. The proportional relationship makes sense: doubling the radius doubles the arc length; doubling the angle doubles the arc length.</p>
            <h2>Sector vs Segment Area</h2>
            <p><strong>Sector area</strong> = (1/2)r²θ — the pie-slice shape including the two radii and arc. <strong>Segment area</strong> = (1/2)r²(θ − sin θ) — the crescent between the chord and arc (sector minus the triangle). The triangle area = (1/2)r² sin θ. For small angles, sin θ ≈ θ, so segment area ≈ 0. For θ = π (semicircle): segment = (1/2)r²(π − 0) = πr²/2 = half the circle area.</p>
            <h2>Chord Length Formula</h2>
            <p><strong>Chord = 2r × sin(θ/2)</strong>. A chord is the straight-line distance across the arc. For θ = 180° (semicircle), chord = 2r × sin(90°) = 2r = diameter ✓. For θ = 60°: chord = 2r × sin(30°) = 2r × 0.5 = r — an equilateral triangle inscribed in the circle has sides equal to the radius. For small angles, chord ≈ arc (both ≈ rθ).</p>
            <h2>Applications in Road Design</h2>
            <p>Horizontal curves in road design are circular arcs. Engineers specify curves by their radius (R) and degree of curvature (D° — the central angle subtended by a 100-foot arc). Arc length between stations tells how far the road curves. Superelevation (banking angle) is calculated from the design speed and radius. The sight distance around a curve is the arc length visible to the driver.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/arc-length-calculator" />
          <PopularCalculators exclude="/calculator/arc-length-calculator" />
        </div>
      </div>
    </>
  );
};

export default ArcLengthCalculator;
