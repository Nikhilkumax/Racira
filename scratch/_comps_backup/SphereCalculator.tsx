"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SphereInput {
  inputMode: "radius" | "diameter";
  value: number;
}

interface SphereResult {
  radius: number;
  diameter: number;
  circumference: number;
  volume: number;
  surfaceArea: number;
  crossSection: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSphere(input: SphereInput): SphereResult {
  const radius = input.inputMode === "radius" ? input.value : input.value / 2;
  const diameter = radius * 2;
  const circumference = 2 * Math.PI * radius;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const surfaceArea = 4 * Math.PI * radius * radius;
  const crossSection = Math.PI * radius * radius;

  // Sphere occupies 2/3 of its circumscribed cylinder
  const cylinderVolume = Math.PI * radius * radius * diameter;
  const donutData = [
    { name: "Sphere (2/3 of cylinder)", value: Number(volume.toFixed(0)), color: "hsl(var(--primary))" },
    { name: "Cylinder remainder", value: Number((cylinderVolume - volume).toFixed(0)), color: "#e2e8f0" },
  ];

  const breakdown = [
    { label: "Input", value: `${input.value} (${input.inputMode === "radius" ? "radius" : "diameter"})` },
    { label: "Radius", value: `${radius.toFixed(2)}` },
    { label: "Diameter", value: `${diameter.toFixed(2)}` },
    { label: "Circumference (2πr)", value: `${circumference.toFixed(2)}` },
    { label: "Cross-Section Area (πr²)", value: `${crossSection.toFixed(2)}` },
    { label: "Volume (4/3πr³)", value: `${volume.toFixed(2)}` },
    { label: "Surface Area (4πr²)", value: `${surfaceArea.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Volume", value: `${volume.toFixed(2)}` },
    { label: "Surface Area", value: `${surfaceArea.toFixed(2)}` },
    { label: "Radius", value: `${radius.toFixed(2)}` },
    { label: "Diameter", value: `${diameter.toFixed(2)}` },
    { label: "Circumference", value: `${circumference.toFixed(2)}` },
    { label: "Cross-Section", value: `${crossSection.toFixed(2)}` },
  ];

  return { radius, diameter, circumference, volume, surfaceArea, crossSection, donutData, breakdown, summaryStats };
}

const DEFAULTS: SphereInput = { inputMode: "radius", value: 5 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SphereCalculator() {
  const [inputMode, setInputMode] = useState<SphereInput["inputMode"]>(DEFAULTS.inputMode);
  const [value, setValue] = useState(String(DEFAULTS.value));
  const [result, setResult] = useState<SphereResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSphere({ inputMode, value: parse(value, DEFAULTS.value) }));
  const reset = () => {
    setInputMode(DEFAULTS.inputMode);
    setValue(String(DEFAULTS.value));
    setResult(calcSphere(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSphere(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I calculate the volume of a sphere?", answer: "V = 4/3 × π × r³, where r is the radius. If you know the diameter, halve it first. A sphere of radius 5 has volume ≈ 523.6 cubic units." },
    { question: "What is the surface area formula?", answer: "A = 4πr² — equal to four great circles, or the lateral area of its circumscribed cylinder. It is Archimedes' most famous geometric result." },
    { question: "Why is the sphere 2/3 of its cylinder?", answer: "A sphere fits exactly inside a cylinder of the same radius and height 2r. The sphere's volume is exactly 2/3 of the cylinder's (πr²·2r), a ratio Archimedes proved and asked to be engraved on his tomb." },
    { question: "How is this used in practice?", answer: "Volume and surface area of spheres size balloons, tanks, planets, and medicine doses (sphere geometry appears in pharmacology and physics). Surface area also governs heat loss and evaporation rates." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Sphere Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Sphere Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Measure From</label>
              <select value={inputMode} onChange={(e) => setInputMode(e.target.value as SphereInput["inputMode"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="radius">Radius</option>
                <option value="diameter">Diameter</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{inputMode === "radius" ? "Radius" : "Diameter"}</label>
              <div className={inp}><input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Volume</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.volume.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Surface area {result.surfaceArea.toFixed(2)} · circumference {result.circumference.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Surface Area", `${result.surfaceArea.toFixed(2)}`], ["Diameter", `${result.diameter.toFixed(2)}`], ["Circumference", `${result.circumference.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Sphere Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Sphere vs Its Circumscribed Cylinder</h3>
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
            <h2 className="text-2xl font-bold mb-3">The Sphere's Key Measures</h2>
            <p>From a single radius everything follows: diameter 2r, circumference 2πr, cross-section area πr², surface area 4πr², and volume 4/3πr³. Enter either the radius or diameter — the calculator derives the rest.</p>
            <h2 className="text-2xl font-bold mb-3">Archimedes' Masterpiece</h2>
            <p>Archimedes proved the sphere's surface area equals four great circles and its volume equals two-thirds of its circumscribed cylinder — the result he considered his greatest and asked to be carved on his tombstone. The donut chart above shows that exact 2:1 ratio with the cylinder's leftover space.</p>
            <h2 className="text-2xl font-bold mb-3">Why Spheres Matter</h2>
            <p>The sphere is the most efficient container — maximum volume for minimum surface — which is why drops, planets, and bubbles are spherical. Surface area governs cooling, evaporation, and drag, so both measures matter in engineering and physics.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sphere-calculator" />
          <PopularCalculators exclude="/calculator/sphere-calculator" />
        </div>
      </div>
    </>
  );
}
