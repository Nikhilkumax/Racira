"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const KineticEnergyCalculator = () => {
  const DEFAULTS = { mass: "1200", velocity: "27.78" };
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [result, setResult] = useState<any>(null);

  const calculate = (mV = mass, vV = velocity) => {
    const m = parseFloat(mV), v = parseFloat(vV);
    if (isNaN(m) || isNaN(v) || m <= 0) return;
    const ke = 0.5 * m * v * v;
    const keKJ = ke / 1000;
    const keMJ = ke / 1e6;
    const momentum = m * v;
    const chartData = [
      { name: "1/4 speed", value: parseFloat((0.5 * m * (v * 0.25) ** 2).toFixed(0)) },
      { name: "1/2 speed", value: parseFloat((0.5 * m * (v * 0.5) ** 2).toFixed(0)) },
      { name: "3/4 speed", value: parseFloat((0.5 * m * (v * 0.75) ** 2).toFixed(0)) },
      { name: "Full speed", value: parseFloat(ke.toFixed(0)) },
      { name: "2× speed", value: parseFloat((0.5 * m * (v * 2) ** 2).toFixed(0)) },
    ];
    setResult({
      primary: keKJ >= 1000 ? `${keMJ.toFixed(3)} MJ` : keKJ >= 1 ? `${keKJ.toFixed(3)} kJ` : `${ke.toFixed(2)} J`,
      subtitle: `KE = ½ × ${m} kg × (${v} m/s)² = ${ke.toFixed(2)} J`,
      rows: [
        { label: "Mass (m)", value: `${m.toLocaleString()} kg` },
        { label: "Velocity (v)", value: `${v} m/s  (${(v * 3.6).toFixed(1)} km/h)` },
        { label: "Kinetic Energy (J)", value: `${ke.toFixed(2)} J` },
        { label: "Kinetic Energy (kJ)", value: `${keKJ.toFixed(4)} kJ` },
        { label: "Momentum (p = mv)", value: `${momentum.toFixed(2)} kg·m/s` },
        { label: "Speed doubling effect", value: `4× more KE` },
      ],
      chartData,
      summary: [
        { label: "Kinetic Energy", value: `${ke.toFixed(2)} J` },
        { label: "In kilojoules", value: `${keKJ.toFixed(3)} kJ` },
        { label: "In megajoules", value: `${keMJ.toFixed(4)} MJ` },
        { label: "Momentum", value: `${momentum.toFixed(2)} kg·m/s`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setMass(DEFAULTS.mass); setVelocity(DEFAULTS.velocity); calculate(DEFAULTS.mass, DEFAULTS.velocity); };

  const faqs = [
    { question: "What is the kinetic energy formula?", answer: "KE = ½mv² where m is mass in kilograms and v is velocity in meters per second. The result is in Joules (J)." },
    { question: "Why does speed affect KE so much more than mass?", answer: "Because velocity is squared in the formula. Doubling the mass doubles KE, but doubling the speed quadruples KE. This is why highway speeds are so much more dangerous than city speeds." },
    { question: "What is the kinetic energy of a 1200 kg car at 100 km/h?", answer: "100 km/h = 27.78 m/s. KE = 0.5 × 1200 × 27.78² = 463,012 J ≈ 463 kJ. This energy must be dissipated by the brakes when stopping." },
    { question: "What are the units of kinetic energy?", answer: "Joules (J) in SI units. 1 J = 1 kg·m²/s². Larger values are expressed in kJ (1000 J) or MJ (1,000,000 J)." },
    { question: "What is the difference between kinetic and potential energy?", answer: "Kinetic energy is the energy of motion (KE = ½mv²). Potential energy is stored energy due to position, such as gravitational PE = mgh. Together they form mechanical energy." },
    { question: "How does kinetic energy relate to momentum?", answer: "Momentum p = mv and KE = p²/(2m). They are related but different: KE depends on v², while momentum depends on v linearly. In collisions, momentum is always conserved; KE is conserved only in elastic collisions." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Kinetic Energy Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Kinetic Energy Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Mass (m)</label>
              <div className="relative">
                <input type="number" value={mass} onChange={e => setMass(e.target.value)}
                  className="h-10 w-full pl-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1200" step="any" min="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Velocity (v)</label>
              <div className="relative">
                <input type="number" value={velocity} onChange={e => setVelocity(e.target.value)}
                  className="h-10 w-full pl-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="27.78" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Kinetic Energy</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1 break-words">{result.subtitle}</div>
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
                  <h3 className="text-base font-semibold mb-3">KE vs Speed (same mass)</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`${v.toLocaleString()} J`, "KE"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Kinetic Energy Calculator?</h2>
            <p>A kinetic energy calculator computes the energy of motion for any moving object using the formula KE = ½mv². It is one of the most fundamental quantities in classical mechanics. This calculator instantly converts your mass (kg) and velocity (m/s) inputs into kinetic energy in Joules, kilojoules, or megajoules — and shows how KE scales as speed changes. Pre-filled with a typical passenger car (1,200 kg) traveling at 100 km/h (27.78 m/s), you can see immediately how much energy must be dissipated when braking.</p>
            <p>Engineers use kinetic energy calculations in vehicle crash safety testing, rollercoaster design, projectile analysis, sports equipment testing, and turbine design. The dramatic square relationship between speed and KE makes these calculations critical for safety planning across all engineering disciplines.</p>

            <h2>The Kinetic Energy Formula</h2>
            <p><strong>KE = ½ × m × v²</strong> where m = mass in kilograms and v = velocity in meters per second. The result is in Joules (J). Key observations from this formula: (1) KE is always positive since v² is always positive. (2) Doubling the mass doubles KE linearly. (3) Doubling the velocity quadruples KE — the square relationship makes speed much more important than mass in safety contexts.</p>
            <p>For the default example: KE = 0.5 × 1200 kg × (27.78 m/s)² = 0.5 × 1200 × 771.7 = 463,020 J ≈ 463 kJ. This is the energy that disc brakes, tire friction, and air resistance must absorb to bring the car to a stop.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result card displays energy in the most readable unit (J, kJ, or MJ depending on magnitude). The breakdown table shows all inputs, unit conversions, and momentum (p = mv). The bar chart shows how KE scales at ¼ speed, ½ speed, ¾ speed, full speed, and double speed — dramatically illustrating the v² relationship. Notice the bar for 2× speed is 4× taller than the full-speed bar.</p>

            <h2>Kinetic Energy in Real-World Contexts</h2>
            <p><strong>Vehicle safety:</strong> A 100 kg motorcyclist at 60 km/h (16.67 m/s) has KE = 0.5 × 100 × 277.9 = 13,889 J. At 120 km/h, KE = 55,556 J — four times as much energy for only double the speed, which is why highway crashes are so much more severe.</p>
            <p><strong>Bullet:</strong> A 9mm bullet (7.5 g) at 370 m/s has KE = 0.5 × 0.0075 × 136,900 = 513 J. Despite its small mass, the extremely high velocity generates lethal energy levels.</p>
            <p><strong>Wind turbine:</strong> Wind kinetic energy per unit time (power) = ½ρAv³, where ρ is air density and A is rotor area. The cubic relationship means doubling wind speed increases power by 8×.</p>

            <h2>Kinetic vs Potential Energy</h2>
            <p>In a closed mechanical system, the total mechanical energy (KE + PE) is conserved. A roller coaster at the top of a hill has maximum PE = mgh and minimum KE. At the bottom, all PE converts to KE. In reality, friction converts some mechanical energy to heat, so final KE is less than initial PE. This energy accounting is performed with the <a href="/calculator/potential-energy-calculator">potential energy calculator</a>.</p>

            <h2>Tips for Using This Calculator</h2>
            <p>Convert km/h to m/s by dividing by 3.6 before entering velocity. For mph, multiply by 0.447. Enter mass in kilograms — convert pounds by multiplying by 0.4536. The bar chart showing KE at different speeds is particularly useful for engineers and safety analysts comparing scenarios. Pair with the <a href="/calculator/acceleration-calculator">acceleration calculator</a> to compute force (F = ma) and with the <a href="/calculator/momentum-calculator">momentum calculator</a> for collision analysis.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/kinetic-energy-calculator" />
          <PopularCalculators exclude="/calculator/kinetic-energy-calculator" />
        </div>
      </div>
    </>
  );
};
export default KineticEnergyCalculator;
