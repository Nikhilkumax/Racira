"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, Thermometer, Mountain, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface GeothermalResult {
  surfaceTemp: number;
  depth: number;
  gradient: number;
  bottomTemp: number;
  totalGradient: number;
  tempAtDepth: number;
  chartData: { name: string; temp: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  surfaceTemp: "15",
  bottomTemp: "200",
  depth: "3000",
  depthUnit: "meters",
  tempUnit: "celsius",
};

const calculate = (v: typeof DEFAULTS): GeothermalResult => {
  const surfaceTemp = parseFloat(v.surfaceTemp) || 0;
  const bottomTemp = parseFloat(v.bottomTemp) || 0;
  const depth = parseFloat(v.depth) || 0;

  const totalGradient = depth > 0 ? (bottomTemp - surfaceTemp) / depth : 0;
  const gradient = totalGradient * 1000;

  const tempAtDepth = surfaceTemp + totalGradient * depth;

  const chartData = [
    { name: "Surface", temp: parseFloat(surfaceTemp.toFixed(1)), fill: "#ef4444" },
    { name: "Target Depth", temp: parseFloat(bottomTemp.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Midpoint", temp: parseFloat(((surfaceTemp + bottomTemp) / 2).toFixed(1)), fill: "#f59e0b" },
    { name: "Gradient", temp: parseFloat(gradient.toFixed(2)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Surface Temperature", value: `${surfaceTemp.toFixed(1)} °C` },
    { label: "Bottom Temperature", value: `${bottomTemp.toFixed(1)} °C` },
    { label: "Depth", value: `${depth.toFixed(0)} ${v.depthUnit}` },
    { label: "Temperature Difference", value: `${(bottomTemp - surfaceTemp).toFixed(1)} °C` },
    { label: "Total Gradient", value: `${totalGradient.toFixed(4)} °C/m` },
    { label: "Gradient (per km)", value: `${gradient.toFixed(2)} °C/km` },
    { label: "Temp at Target Depth", value: `${tempAtDepth.toFixed(1)} °C` },
  ];

  const summaryStats = [
    { label: "Surface Temp", value: `${surfaceTemp.toFixed(1)} °C` },
    { label: "Bottom Temp", value: `${bottomTemp.toFixed(1)} °C` },
    { label: "Depth", value: `${depth.toFixed(0)} ${v.depthUnit}` },
    { label: "Gradient", value: `${gradient.toFixed(2)} °C/km` },
    { label: "Temp at Depth", value: `${tempAtDepth.toFixed(1)} °C` },
  ];

  return {
    surfaceTemp,
    depth,
    gradient,
    bottomTemp,
    totalGradient,
    tempAtDepth,
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
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value} °C</p>
      </div>
    );
  }
  return null;
};

export default function GeothermalGradientCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<GeothermalResult | null>(null);
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
    { question: "What is the geothermal gradient?", answer: "The geothermal gradient is the rate of temperature increase with depth inside the Earth. The global average is about 25-30 °C per kilometer of depth, though this varies significantly by location." },
    { question: "Why does temperature increase with depth?", answer: "The Earth's interior is heated by the decay of radioactive isotopes (uranium, thorium, potassium) and residual heat from planetary formation. Heat flows from the hot interior to the cooler surface through conduction and convection." },
    { question: "What is a typical geothermal gradient?", answer: "The average geothermal gradient is about 25-30 °C/km. In volcanic regions, it can be 50-100 °C/km or higher. In stable continental cratons, it can be as low as 15-20 °C/km." },
    { question: "How is geothermal energy used?", answer: "Geothermal energy is used for electricity generation (geothermal power plants), direct heating (district heating, greenhouses), and heat pumps for building climate control. The temperature at depth determines the feasibility of each application." },
    { question: "What factors affect the geothermal gradient?", answer: "Tectonic activity, crustal thickness, radioactive heat production, groundwater flow, and proximity to magma chambers all affect the local geothermal gradient. Volcanic and tectonically active regions have steeper gradients." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Geothermal Gradient Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Geothermal Gradient Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" /> Temperature Data
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Surface Temperature</label>
                  <div className="relative">
                    <input type="number" value={vals.surfaceTemp} onChange={(e) => updateVal("surfaceTemp", e.target.value)} className="input-calc" step="any" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">°C</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Bottom Temperature</label>
                  <div className="relative">
                    <input type="number" value={vals.bottomTemp} onChange={(e) => updateVal("bottomTemp", e.target.value)} className="input-calc" step="any" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">°C</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5" /> Depth
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Depth</label>
                  <div className="relative">
                    <input type="number" value={vals.depth} onChange={(e) => updateVal("depth", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{vals.depthUnit}</span>
                  </div>
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
                  <Layers className="h-3 w-3" /> Geothermal Gradient
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{result.gradient.toFixed(2)} °C/km</div>
                <p className="text-sm text-muted-foreground">
                  Temperature at {vals.depth}m depth: {result.tempAtDepth.toFixed(1)} °C
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Surface</div>
                  <div className="text-lg font-bold text-foreground">{result.surfaceTemp.toFixed(1)} °C</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Bottom</div>
                  <div className="text-lg font-bold text-foreground">{result.bottomTemp.toFixed(1)} °C</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">ΔT</div>
                  <div className="text-lg font-bold text-foreground">{(result.bottomTemp - result.surfaceTemp).toFixed(1)} °C</div>
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
                <h3 className="text-sm font-semibold mb-3">Temperature Profile</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="temp" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={result.chartData[i].fill} />
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
            <h2 className="text-2xl font-bold mb-3">Understanding the Geothermal Gradient</h2>
            <p>The geothermal gradient describes how temperature increases with depth beneath the Earth's surface. This natural phenomenon is the driving force behind geothermal energy, volcanic activity, and the formation of mineral deposits. Understanding the geothermal gradient is essential for geothermal energy exploration, deep mining operations, and geological research.</p>

            <h3>1. How the Geothermal Gradient Works</h3>
            <p>The Earth's internal heat comes from two primary sources: the decay of radioactive isotopes (primarily uranium-238, thorium-232, and potassium-40) and residual heat from the planet's formation. Heat flows from the hot interior toward the cooler surface through conduction in the crust and convection in the mantle. The geothermal gradient is the rate at which temperature increases per unit depth, typically measured in °C per kilometer.</p>

            <h3>2. Factors Affecting the Gradient</h3>
            <p>The geothermal gradient varies significantly by location. In tectonically active regions (mid-ocean ridges, volcanic arcs, rift valleys), the gradient can be 50-100 °C/km. In stable continental interiors (cratons), it may be as low as 15-20 °C/km. Local factors include crustal thickness, heat-producing rock types, groundwater circulation, and proximity to magma bodies.</p>

            <h3>3. Applications of Geothermal Gradient Calculations</h3>
            <p>Geothermal gradient calculations are used in: (1) Geothermal energy exploration — identifying locations where temperatures are high enough for economic power generation (typically &gt;150°C at depth); (2) Deep drilling operations — predicting downhole temperatures for equipment selection and safety; (3) Climate science — understanding Earth's heat budget; and (4) Mineral exploration — predicting where certain minerals form at specific temperature-pressure conditions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/geothermal-gradient-calculator" />
          <PopularCalculators exclude="/calculator/geothermal-gradient-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#ef4444", "hsl(var(--primary))", "#f59e0b", "#10b981"];