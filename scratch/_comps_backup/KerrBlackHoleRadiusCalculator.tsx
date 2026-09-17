"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, Atom, Globe, Activity, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface KerrResult {
  schwarzschildRadius: number;
  eventHorizon: number;
  ergosphere: number;
  innerCauchy: number;
  spinParameter: number;
  irrotationalKerr: number;
  massInSolar: number;
  chartData: { name: string; km: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const G = 6.6743e-11;
const c = 299792458;
const c2 = c * c;
const SOLAR_MASS_KG = 1.98847e30;
const KM_PER_M = 1 / 1000;

const DEFAULTS = {
  mass: "1.4",
  massUnit: "solar",
  spin: "0.7",
  theta: "0",
};

const calculate = (v: typeof DEFAULTS): KerrResult => {
  const massInput = parseFloat(v.mass) || 0;
  const spin = Math.min(Math.max(parseFloat(v.spin), 0), 0.999);
  const theta = parseFloat(v.theta) || 0;
  const thetaRad = (theta * Math.PI) / 180;

  let massKg: number;
  let massInSolar: number;

  if (v.massUnit === "kg") {
    massKg = massInput;
    massInSolar = massKg / SOLAR_MASS_KG;
  } else if (v.massUnit === "earth") {
    massKg = massInput * 5.972e24;
    massInSolar = massKg / SOLAR_MASS_KG;
  } else {
    massInSolar = massInput;
    massKg = massInSolar * SOLAR_MASS_KG;
  }

  if (massKg <= 0) {
    return {
      schwarzschildRadius: 0, eventHorizon: 0, ergosphere: 0, innerCauchy: 0,
      spinParameter: 0, irrotationalKerr: 0, massInSolar: 0,
      chartData: [], breakdown: [], summaryStats: [],
    };
  }

  const GM_c2 = (G * massKg) / c2;
  const Rs = 2 * GM_c2;
  const a = spin * GM_c2;

  const sqrtTerm = Math.sqrt(Math.max(0, Math.pow(GM_c2, 2) - Math.pow(a, 2)));

  const eventHorizon = GM_c2 + sqrtTerm;
  const ergosphere = GM_c2 + Math.sqrt(Math.max(0, Math.pow(GM_c2, 2) - Math.pow(a, 2) * Math.pow(Math.cos(thetaRad), 2)));
  const innerCauchy = GM_c2 - sqrtTerm;
  const spinParameter = spin;

  const irrotationalKerr = Rs * KM_PER_M;

  const chartData = [
    { name: "Schwarzschild", km: parseFloat((Rs * KM_PER_M).toFixed(3)), fill: "#3b82f6" },
    { name: "Event Horizon", km: parseFloat((eventHorizon * KM_PER_M).toFixed(3)), fill: "hsl(var(--primary))" },
    { name: "Ergosphere", km: parseFloat((ergosphere * KM_PER_M).toFixed(3)), fill: "#10b981" },
    { name: "Inner Cauchy", km: parseFloat((innerCauchy * KM_PER_M).toFixed(3)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Mass (solar masses)", value: `${massInSolar.toFixed(3)} M☉` },
    { label: "Mass (kg)", value: `${massKg.toExponential(3)} kg` },
    { label: "Dimensionless Spin (a)", value: `${spin.toFixed(3)}` },
    { label: "Spin Angle (θ)", value: `${theta.toFixed(1)}°` },
    { label: "GM/c² (gravitational radius)", value: `${(GM_c2 * KM_PER_M).toFixed(3)} km` },
    { label: "Spin Parameter a", value: `${(a * KM_PER_M).toFixed(3)} km` },
    { label: "Schwarzschild Radius", value: `${(Rs * KM_PER_M).toFixed(3)} km` },
    { label: "Event Horizon (r₊)", value: `${(eventHorizon * KM_PER_M).toFixed(3)} km` },
    { label: "Ergosphere (static limit)", value: `${(ergosphere * KM_PER_M).toFixed(3)} km` },
    { label: "Inner Cauchy Horizon (r₋)", value: `${(innerCauchy * KM_PER_M).toFixed(3)} km` },
  ];

  const summaryStats = [
    { label: "Mass", value: `${massInSolar.toFixed(2)} M☉` },
    { label: "Spin Parameter", value: `${spin.toFixed(3)}` },
    { label: "Event Horizon", value: `${(eventHorizon * KM_PER_M).toFixed(2)} km` },
    { label: "Ergosphere", value: `${(ergosphere * KM_PER_M).toFixed(2)} km` },
    { label: "Schwarzschild Rs", value: `${(Rs * KM_PER_M).toFixed(2)} km` },
    { label: "Inner Horizon", value: `${(innerCauchy * KM_PER_M).toFixed(2)} km` },
  ];

  return {
    schwarzschildRadius: Rs,
    eventHorizon,
    ergosphere,
    innerCauchy,
    spinParameter: spin,
    irrotationalKerr,
    massInSolar,
    chartData,
    breakdown,
    summaryStats,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value} km</p>
      </div>
    );
  }
  return null;
};

export default function KerrBlackHoleRadiusCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<KerrResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is a Kerr black hole?", answer: "A Kerr black hole is a rotating black hole. Once a black hole forms from the collapse of a massive star, conservation of angular momentum means it should spin. The Kerr solution is the exact mathematical solution to Einstein's field equations that describes this rotating black hole." },
    { question: "What is the difference between Schwarzschild and Kerr radius?", answer: "The Schwarzschild radius only depends on mass and applies to non-rotating (Schwarzschild) black holes. The Kerr (event horizon) radius depends on both mass and spin. As spin increases, the event horizon shrinks, reaching half the Schwarzschild radius at maximum spin." },
    { question: "What is the ergosphere?", answer: "The ergosphere is the region outside the Kerr event horizon where spacetime itself is dragged along by the rotation of the black hole (frame-dragging). Within the ergosphere, it is impossible to remain stationary relative to a distant observer. This region allows for energy extraction via the Penrose process." },
    { question: "What is the inner Cauchy horizon?", answer: "The inner Cauchy horizon is an inner boundary of the Kerr spacetime. In theory, you could pass through it, but in reality, the inner horizon is believed to be unstable to perturbations and likely collapses into a singularity. It is not physically traversable in realistic astrophysical black holes." },
    { question: "Why do stellar-mass black holes have such small radii?", answer: "Even though a black hole may have several times the mass of the Sun, the gravitational radius is surprisingly small due to the enormous value of c²/G. For example, a 10-solar-mass black hole has a Schwarzschild radius of about 30 km." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Kerr Black Hole Radius Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Kerr Black Hole Radius Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Black Hole Properties
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mass</label>
                  <input type="number" value={vals.mass} onChange={(e) => updateVal("mass", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mass Unit</label>
                  <select value={vals.massUnit} onChange={(e) => updateVal("massUnit", e.target.value)} className="input-calc">
                    <option value="solar">Solar Masses (M☉)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="earth">Earth Masses</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Spin Parameter (a)</label>
                  <input type="number" value={vals.spin} onChange={(e) => updateVal("spin", e.target.value)} className="input-calc" step="0.001" min="0" max="0.999" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Spin Angle (θ)</label>
                  <input type="number" value={vals.theta} onChange={(e) => updateVal("theta", e.target.value)} className="input-calc" step="any" min="0" max="90" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Atom className="h-3 w-3" /> Event Horizon Radius
                </div>
                <div className="text-4xl font-bold text-primary mb-1">
                  {result.eventHorizon !== 0
                    ? `${(result.eventHorizon * KM_PER_M).toFixed(2)} km`
                    : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">
                  Spin: {result.spinParameter.toFixed(3)} · Mass: {result.massInSolar.toFixed(3)} M☉
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Event Horizon</div>
                  <div className="text-lg font-bold text-foreground">{(result.eventHorizon * KM_PER_M).toFixed(2)} km</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Ergosphere</div>
                  <div className="text-lg font-bold text-foreground">{(result.ergosphere * KM_PER_M).toFixed(2)} km</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Schwarzschild</div>
                  <div className="text-lg font-bold text-foreground">{(result.schwarzschildRadius * KM_PER_M).toFixed(2)} km</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Parameter</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Kerr Geometry Overview
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="km" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Kerr Black Holes: The Rotating Giants of Spacetime</h2>
            <p>A Kerr black hole is the astrophysical counterpart of the exact solution to Einstein's field equations that describes a black hole with angular momentum (spin). Unlike the simpler Schwarzschild black hole, which is static and spherically symmetric, a Kerr black hole possesses an ergosphere, two horizons, and exhibits frame-dragging — the phenomenon where spacetime itself is twisted by the black hole's rotation. This makes Kerr black holes dramatically more complex and interesting than their non-rotating counterparts.</p>

            <h3>1. Key Radii in Kerr Geometry</h3>
            <p>The Kerr solution defines four critical radii. The <strong>gravitational radius</strong> (GM/c²) is the fundamental length scale. The <strong>event horizon</strong> (r₊) is the outer boundary beyond which nothing, not even light, can escape. The <strong>inner Cauchy horizon</strong> (r₋) is a theoretical inner boundary within the event horizon. The <strong>ergosphere</strong> is the oblate region outside the event horizon where spacetime is dragged so forcefully that no observer can remain stationary — they must co-rotate with the black hole.</p>

            <h3>2. The Spin Parameter and Its Effects</h3>
            <p>The dimensionless spin parameter (a) ranges from 0 (non-rotating, pure Schwarzschild) to 0.999+ (near-maximal rotation). As spin increases, the event horizon radius decreases from the Schwarzschild value down to half. A maximally spinning black hole has the smallest possible event horizon for a given mass, concentrating the same mass into a smaller region. The ergosphere extends further and rotates faster.</p>

            <h3>3. Real-World Astrophysical Black Holes</h3>
            <p>Stellar-mass black holes (5–50 solar masses) form from the gravitational collapse of massive stars. Supermassive black holes (millions to billions of solar masses) reside at galactic centers. The spin of a black hole can be measured through X-ray spectroscopy of the inner accretion disk or through gravitational wave observations during black hole mergers. The largest known black holes have masses exceeding 100 billion solar masses.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/kerr-black-hole-radius-calculator" />
          <PopularCalculators exclude="/calculator/kerr-black-hole-radius-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981", "#f59e0b"];
