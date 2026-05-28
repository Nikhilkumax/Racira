"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const AccelerationCalculator = () => {
  const DEFAULTS = { vf: "30", vi: "0", t: "6" };
  const [vf, setVf] = useState(DEFAULTS.vf);
  const [vi, setVi] = useState(DEFAULTS.vi);
  const [t, setT] = useState(DEFAULTS.t);
  const [result, setResult] = useState<any>(null);

  const calculate = (vfV = vf, viV = vi, tV = t) => {
    const vfN = parseFloat(vfV), viN = parseFloat(viV), tN = parseFloat(tV);
    if (isNaN(vfN) || isNaN(viN) || isNaN(tN) || tN === 0) return;
    const a = (vfN - viN) / tN;
    const deltaV = vfN - viN;
    const dist = viN * tN + 0.5 * a * tN * tN;
    const chartData = Array.from({ length: Math.min(Math.ceil(tN) + 1, 12) }, (_, i) => ({
      name: `t=${i}s`,
      velocity: parseFloat((viN + a * i).toFixed(2)),
    }));
    setResult({
      primary: `${a.toFixed(4)} m/s²`,
      subtitle: `${a > 0 ? "Acceleration" : a < 0 ? "Deceleration" : "Constant velocity"} over ${tN}s`,
      rows: [
        { label: "Initial Velocity (vi)", value: `${viN} m/s` },
        { label: "Final Velocity (vf)", value: `${vfN} m/s` },
        { label: "Time (t)", value: `${tN} s` },
        { label: "Change in Velocity (Δv)", value: `${deltaV.toFixed(4)} m/s` },
        { label: "Acceleration (a)", value: `${a.toFixed(4)} m/s²` },
        { label: "Distance covered", value: `${dist.toFixed(2)} m` },
      ],
      chartData,
      summary: [
        { label: "Acceleration", value: `${a.toFixed(4)} m/s²` },
        { label: "Type", value: a > 0 ? "Positive (speeding up)" : a < 0 ? "Negative (slowing down)" : "Zero (constant)" },
        { label: "Distance covered", value: `${dist.toFixed(2)} m` },
        { label: "In g-force", value: `${(a / 9.81).toFixed(3)} g`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setVf(DEFAULTS.vf); setVi(DEFAULTS.vi); setT(DEFAULTS.t); calculate(DEFAULTS.vf, DEFAULTS.vi, DEFAULTS.t); };

  const faqs = [
    { question: "What is the formula for acceleration?", answer: "Acceleration = (Final Velocity − Initial Velocity) / Time, or a = (vf − vi) / t. The SI unit is meters per second squared (m/s²)." },
    { question: "What is the difference between acceleration and deceleration?", answer: "Deceleration (also called negative acceleration or retardation) is simply acceleration with a negative value — the object is slowing down. Acceleration covers both speeding up and slowing down." },
    { question: "What is 1g of acceleration?", answer: "1g = 9.81 m/s², the acceleration due to Earth's gravity. A car accelerating from 0 to 100 km/h in 5 seconds experiences about 5.7 m/s² ≈ 0.58g." },
    { question: "Can acceleration be negative?", answer: "Yes. Negative acceleration means the velocity is decreasing. For example, if vi = 30 m/s and vf = 0 m/s over 6 seconds, a = −5 m/s²." },
    { question: "What is the distance formula under constant acceleration?", answer: "Distance = vi × t + ½ × a × t². This is one of the kinematic equations of motion. This calculator computes distance automatically." },
    { question: "What units does this calculator use?", answer: "This calculator uses SI units: velocity in m/s, time in seconds, and acceleration in m/s². Convert km/h to m/s by dividing by 3.6." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Acceleration Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Acceleration Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Final Velocity (vf)</label>
              <div className="relative">
                <input type="number" value={vf} onChange={e => setVf(e.target.value)}
                  className="h-10 w-full pl-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="30" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Initial Velocity (vi)</label>
              <div className="relative">
                <input type="number" value={vi} onChange={e => setVi(e.target.value)}
                  className="h-10 w-full pl-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Time (t)</label>
              <div className="relative">
                <input type="number" value={t} onChange={e => setT(e.target.value)}
                  className="h-10 w-full pl-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="6" step="any" min="0.001" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">s</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Acceleration</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Velocity Over Time</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <ReferenceLine y={0} stroke="#666" />
                      <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is an Acceleration Calculator?</h2>
            <p>An acceleration calculator computes the rate of change of velocity over time using the fundamental kinematic equation a = (vf − vi) / t. Acceleration describes how quickly an object speeds up or slows down — it is a vector quantity with both magnitude and direction. This calculator gives you acceleration in m/s², the distance covered during the motion, and a velocity-time chart showing how speed changes at each second.</p>
            <p>Engineers use acceleration calculations in vehicle testing, aerospace design, and structural analysis. Students use this tool for physics homework covering Newton's laws and kinematics. Sports scientists analyze acceleration profiles of athletes. This tool handles both positive acceleration (speeding up) and negative acceleration (braking/deceleration).</p>

            <h2>How Acceleration Is Calculated</h2>
            <p>The primary formula is: <strong>a = (vf − vi) / t</strong> where vf is final velocity in m/s, vi is initial velocity in m/s, and t is time in seconds. The result a is in meters per second squared (m/s²).</p>
            <p>For the example defaults (vi = 0, vf = 30 m/s, t = 6 s): a = (30 − 0) / 6 = 5 m/s². This is close to the acceleration of a sporty car accelerating from rest to 108 km/h in 6 seconds.</p>
            <p>Distance covered under constant acceleration: <strong>d = vi × t + ½ × a × t²</strong>. For the example above: d = 0 × 6 + 0.5 × 5 × 36 = 90 meters. This is another of the four kinematic equations used in classical mechanics.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result shows acceleration in m/s² with the type (positive acceleration, deceleration, or constant velocity). The breakdown table shows all input values, the velocity change (Δv), the acceleration, and the distance covered. The velocity chart shows how speed changes second-by-second throughout the motion interval. The summary converts acceleration to g-force (1g ≈ 9.81 m/s²) for real-world reference.</p>

            <h2>Key Concepts in Acceleration</h2>
            <p><strong>Newton's Second Law:</strong> F = ma relates force, mass, and acceleration. If you know acceleration, you can compute the net force required given the object's mass. For example, accelerating a 1,500 kg car at 5 m/s² requires a net force of 7,500 Newtons.</p>
            <p><strong>Gravitational acceleration:</strong> On Earth's surface, free-falling objects accelerate at g ≈ 9.81 m/s² (downward). This is used as a benchmark — "pulling 2g" in a fighter jet means experiencing twice Earth's gravitational acceleration.</p>
            <p><strong>Unit conversions:</strong> 1 m/s = 3.6 km/h. To convert km/h to m/s, divide by 3.6. For example, 0 to 100 km/h = 0 to 27.78 m/s.</p>

            <h2>Practical Examples</h2>
            <p><strong>Car acceleration:</strong> A Tesla Model 3 accelerates from 0 to 60 mph (0 to 26.8 m/s) in 3.1 seconds. Acceleration = 26.8 / 3.1 ≈ 8.65 m/s² ≈ 0.88g.</p>
            <p><strong>Braking:</strong> A car traveling at 30 m/s brakes to a stop in 4 seconds. a = (0 − 30) / 4 = −7.5 m/s². Distance = 30 × 4 + 0.5 × (−7.5) × 16 = 120 − 60 = 60 meters.</p>
            <p><strong>Elevator:</strong> An elevator accelerates from rest to 3 m/s in 2 seconds. a = 3 / 2 = 1.5 m/s². Combined with the <a href="/calculator/force-calculator">force calculator</a>, you can find the passenger weight change during acceleration.</p>

            <h2>Tips for Using This Calculator</h2>
            <p>Enter velocities in m/s (divide km/h by 3.6 to convert). Enter time in seconds. For deceleration, vf will be less than vi, giving a negative result. The calculator automatically computes distance — useful for braking distance calculations. Pair with the <a href="/calculator/speed-calculator">speed calculator</a> for complete kinematics analysis.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/acceleration-calculator" />
          <PopularCalculators exclude="/calculator/acceleration-calculator" />
        </div>
      </div>
    </>
  );
};
export default AccelerationCalculator;
