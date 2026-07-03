"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 6) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const AngleConverter = () => {
  const DEFAULTS = { value: "45", from: "degrees" };
  const [value, setValue] = useState(DEFAULTS.value);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [result, setResult] = useState<any>(null);

  const toDeg = (v: number, unit: string): number => {
    if (unit === "degrees") return v;
    if (unit === "radians") return v * (180 / Math.PI);
    if (unit === "gradians") return v * (360 / 400);
    if (unit === "turns") return v * 360;
    if (unit === "arcminutes") return v / 60;
    if (unit === "arcseconds") return v / 3600;
    if (unit === "milliradians") return v * (180 / Math.PI) / 1000;
    return v;
  };

  const fromDeg = (deg: number, unit: string): number => {
    if (unit === "degrees") return deg;
    if (unit === "radians") return deg * (Math.PI / 180);
    if (unit === "gradians") return deg * (400 / 360);
    if (unit === "turns") return deg / 360;
    if (unit === "arcminutes") return deg * 60;
    if (unit === "arcseconds") return deg * 3600;
    if (unit === "milliradians") return deg * (Math.PI / 180) * 1000;
    return deg;
  };

  const UNITS = ["degrees", "radians", "gradians", "turns", "arcminutes", "arcseconds", "milliradians"];
  const UNIT_LABELS: Record<string, string> = {
    degrees: "° Degrees", radians: "rad Radians", gradians: "grad Gradians",
    turns: "turns Turns", arcminutes: "′ Arcminutes", arcseconds: "″ Arcseconds", milliradians: "mrad Milliradians",
  };

  const calculate = (v = value, f = from) => {
    const num = parseFloat(v);
    if (isNaN(num)) return;

    const deg = toDeg(num, f);
    const conversions: Record<string, number> = {};
    UNITS.forEach((u) => { conversions[u] = fromDeg(deg, u); });

    // Special values reference: 0, 30, 45, 60, 90, 120, 135, 150, 180
    const specialDeg = [0, 30, 45, 60, 90, 120, 180, 270, 360];
    const specialRef = specialDeg.map((d) => ({
      deg: d, rad: parseFloat((d * Math.PI / 180).toFixed(5)), grad: d * 400 / 360,
      sin: parseFloat(Math.sin(d * Math.PI / 180).toFixed(6)),
      cos: parseFloat(Math.cos(d * Math.PI / 180).toFixed(6)),
    }));

    // Trig values for the input
    const degNorm = ((deg % 360) + 360) % 360;
    const sin = Math.sin(deg * Math.PI / 180);
    const cos = Math.cos(deg * Math.PI / 180);
    const tan = Math.abs(cos) > 1e-10 ? Math.tan(deg * Math.PI / 180) : Infinity;

    // Quadrant determination
    const quadrant = degNorm < 90 ? "I" : degNorm < 180 ? "II" : degNorm < 270 ? "III" : "IV";

    const chartData = [
      { label: "Degrees", value: parseFloat(conversions.degrees.toFixed(4)), color: "#3b82f6" },
      { label: "Radians (×π/4)", value: parseFloat((conversions.radians * 4 / Math.PI).toFixed(4)), color: "#10b981" },
      { label: "Gradians (÷100)", value: parseFloat((conversions.gradians / 100).toFixed(4)), color: "#f59e0b" },
    ];

    setResult({ num, deg, conversions, sin, cos, tan, quadrant, degNorm, specialRef });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setValue(DEFAULTS.value); setFrom(DEFAULTS.from);
    calculate(DEFAULTS.value, DEFAULTS.from);
  };

  const faqs = [
    { question: "How do you convert degrees to radians?", answer: "Multiply by π/180. Examples: 90° = 90 × π/180 = π/2 ≈ 1.5708 rad. 180° = π rad. 360° = 2π rad. 45° = π/4 rad. The conversion factor π/180 ≈ 0.01745. To convert radians to degrees, multiply by 180/π ≈ 57.296." },
    { question: "What are gradians (grad)?", answer: "A gradian (also called a gon or grad) divides a full circle into 400 equal parts. 100 gradians = 90 degrees = π/2 radians = one right angle. Gradians are used in surveying and civil engineering because right angles work out to exact round numbers (100 grad). 45° = 50 grad, 180° = 200 grad, 360° = 400 grad." },
    { question: "What is a turn?", answer: "One turn = one full revolution = 360 degrees = 2π radians = 400 gradians. Expressing angles in turns simplifies many formulas: frequency in turns/second = Hz, angular velocity in turns/second = revolution frequency. Turns make the circular relationship explicit: 0.5 turn = half circle, 0.25 turn = quarter circle." },
    { question: "What are arcminutes and arcseconds?", answer: "Arcminutes and arcseconds are used in astronomy and navigation. 1 degree = 60 arcminutes (′). 1 arcminute = 60 arcseconds (″). So 1 degree = 3600 arcseconds. Astronomers express star positions and separations in degrees, arcminutes, arcseconds (DMS format). Earth's axial tilt is 23°26′. The Moon's angular diameter is about 31 arcminutes." },
    { question: "Why do mathematicians use radians instead of degrees?", answer: "Radians make calculus formulas simpler. With radians: d/dx(sin x) = cos x, d/dx(cos x) = −sin x (clean). With degrees: d/dx(sin x°) = (π/180)cos x° (messy factor). Arc length = r × θ (radians). The Taylor series sin(x) = x − x³/3! + x⁵/5! − ... only works with radians. Radians are the 'natural' unit because they are dimensionless ratios (arc length / radius)." },
    { question: "What are milliradians used for?", answer: "Milliradians (mrad) are used in military and long-range shooting for angular measurements. The useful property: 1 mrad subtends approximately 1 unit at 1000 units distance (e.g., 1 cm at 10 m, 1 inch at ~28 yards, 10 cm at 100 m). Scopes are often calibrated in mrad (MILS) or MOA (Minutes of Angle). 1 mrad = 0.057296°, 1 NATO mil = π/3200 ≈ 0.001 rad." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Angle Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Angle Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Convert From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20">
                {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Value</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-full h-12 px-3 text-2xl rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="Enter angle" />
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
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">All Conversions</h3>
                <table className="w-full text-base"><tbody>
                  {UNITS.map((u, i) => (
                    <tr key={i} className={`border-b last:border-0 ${u === from ? "bg-primary/5" : ""}`}>
                      <td className="py-2 text-muted-foreground capitalize">{u}</td>
                      <td className="text-right font-medium font-mono">{fmt(result.conversions[u])}</td>
                      <td className="text-right text-muted-foreground text-sm pl-2">{u === "degrees" ? "°" : u === "radians" ? "rad" : u === "gradians" ? "grad" : u === "turns" ? "turn" : u === "arcminutes" ? "′" : u === "arcseconds" ? "″" : "mrad"}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Trigonometric Values</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Angle (degrees)", value: fmt(result.deg, 6) + "°" },
                    { label: "Normalized (0–360°)", value: fmt(result.degNorm, 4) + "°" },
                    { label: "Quadrant", value: result.quadrant },
                    { label: "sin(θ)", value: fmt(result.sin, 8) },
                    { label: "cos(θ)", value: fmt(result.cos, 8) },
                    { label: "tan(θ)", value: isFinite(result.tan) ? fmt(result.tan, 8) : "undefined" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Key Angle Reference</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[500px]"><tbody>
                    <tr className="border-b font-semibold">
                      <td className="py-1 text-muted-foreground">Degrees</td>
                      <td className="text-right">0°</td>
                      <td className="text-right">30°</td>
                      <td className="text-right">45°</td>
                      <td className="text-right">60°</td>
                      <td className="text-right">90°</td>
                      <td className="text-right">180°</td>
                      <td className="text-right">360°</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 text-muted-foreground">Radians</td>
                      {[0, 30, 45, 60, 90, 180, 360].map((d) => (
                        <td key={d} className="text-right font-mono">{["0", "π/6", "π/4", "π/3", "π/2", "π", "2π"][d === 0 ? 0 : d === 30 ? 1 : d === 45 ? 2 : d === 60 ? 3 : d === 90 ? 4 : d === 180 ? 5 : 6]}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1 text-muted-foreground">Gradians</td>
                      {[0, 30, 45, 60, 90, 180, 360].map((d) => (
                        <td key={d} className="text-right font-mono">{fmt(d * 400 / 360, 1)}</td>
                      ))}
                    </tr>
                  </tbody></table>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an Angle Converter?</h2>
            <p>An angle converter converts between all common angular units: degrees, radians, gradians, turns, arcminutes, arcseconds, and milliradians. Pre-filled at 45° — a fundamental angle that equals π/4 radians, 50 gradians, 1/8 turn, 2700 arcminutes, and 785.4 milliradians. The calculator also computes sin, cos, and tan for the converted angle.</p>
            <h2>Degrees vs Radians</h2>
            <p>Degrees divide a circle into 360 equal parts (a Babylonian convention based on their base-60 number system). Radians define angle by arc length: 1 radian = the angle where arc length equals the radius. Since circumference = 2πr, a full circle = 2π radians = 360°. Conversion: radians = degrees × π/180, degrees = radians × 180/π.</p>
            <h2>Gradians in Surveying</h2>
            <p>Gradians (gons) divide a circle into 400 parts, making right angles exactly 100 grad. Created during the French Revolution as part of the metric system. Still used in surveying, especially in Europe. A theodolite reading of 200.0000 grad means due south. Gradians simplify calculations when dealing with perpendiculars, since a right turn is exactly 100 grad.</p>
            <h2>Arcminutes and Arcseconds in Astronomy</h2>
            <p>Astronomers use the sexagesimal (base-60) system: degrees, arcminutes, arcseconds (DMS). Betelgeuse has an angular diameter of ~56 milliarcseconds — the smallest angle resolvable by early VLBI. The Hubble Space Telescope can resolve about 0.05 arcseconds. GPS coordinates are typically given in decimal degrees (e.g., 40.7128°N) rather than DMS for computational convenience.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/angle-converter" />
          <PopularCalculators exclude="/calculator/angle-converter" />
        </div>
      </div>
    </>
  );
};

export default AngleConverter;
