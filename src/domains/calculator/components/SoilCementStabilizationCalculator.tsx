"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Shovel, Scale, Droplets, Package, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface StabilizationResult {
  soilVolume: number;
  drySoilMass: number;
  cementMass: number;
  numCementBags: number;
  waterMass: number;
  mixRatio: string;
  totalMixMass: number;
  totalMixVolume: number;
  chartData: { name: string; kg: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  area: "100",
  depth: "0.3",
  dryDensity: "1.6",
  moistureContent: "12",
  cementContent: "6",
  waterCementRatio: "0.5",
  compactionEff: "95",
};

const calculate = (v: typeof DEFAULTS): StabilizationResult => {
  const area = parseFloat(v.area) || 0;
  const depth = parseFloat(v.depth) || 0;
  const dryDensity = parseFloat(v.dryDensity) || 0;
  const moisture = parseFloat(v.moistureContent) || 0;
  const cementPct = parseFloat(v.cementContent) || 0;
  const wcr = parseFloat(v.waterCementRatio) || 0;
  const compaction = parseFloat(v.compactionEff) || 100;

  const soilVolume = area * depth;
  const drySoilMass = soilVolume * dryDensity * (compaction / 100);
  const cementMass = drySoilMass * (cementPct / 100);
  const numCementBags = Math.ceil(cementMass / 50);
  const waterMass = cementMass * wcr;
  const cementWaterMass = cementMass + waterMass;
  const totalMixMass = drySoilMass + cementMass + waterMass;
  const mixRatio = `1:${(drySoilMass / cementMass).toFixed(1)}:${wcr.toFixed(2)}`;

  const chartData = [
    { name: "Dry Soil", kg: parseFloat(drySoilMass.toFixed(0)), fill: "#a78bfa" },
    { name: "Cement", kg: parseFloat(cementMass.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Water", kg: parseFloat(waterMass.toFixed(0)), fill: "#3b82f6" },
    { name: "Cement+Wtr", kg: parseFloat(cementWaterMass.toFixed(0)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Area", value: `${area.toFixed(1)} m²` },
    { label: "Depth", value: `${depth.toFixed(2)} m` },
    { label: "Soil Volume", value: `${soilVolume.toFixed(2)} m³` },
    { label: "Dry Density", value: `${dryDensity.toFixed(2)} t/m³` },
    { label: "Compaction Eff.", value: `${compaction.toFixed(0)}%` },
    { label: "Dry Soil Mass", value: `${drySoilMass.toFixed(0)} kg` },
    { label: "Cement Content", value: `${cementPct.toFixed(1)}%` },
    { label: "Cement Required", value: `${cementMass.toFixed(0)} kg` },
    { label: "Cement Bags (50kg)", value: `${numCementBags} bags` },
    { label: "Water-Cement Ratio", value: `${wcr.toFixed(2)}` },
    { label: "Water Required", value: `${waterMass.toFixed(0)} kg (${(waterMass / 1000).toFixed(2)} m³)` },
    { label: "Total Mix Mass", value: `${totalMixMass.toFixed(0)} kg` },
    { label: "Mix Ratio (S:C:W)", value: mixRatio },
  ];

  const summaryStats = [
    { label: "Dry Soil Mass", value: `${drySoilMass.toFixed(0)} kg` },
    { label: "Cement Needed", value: `${cementMass.toFixed(0)} kg` },
    { label: "Cement Bags", value: `${numCementBags}` },
    { label: "Water Needed", value: `${waterMass.toFixed(0)} kg` },
    { label: "Total Mix", value: `${(totalMixMass / 1000).toFixed(2)} tonnes` },
    { label: "Mix Ratio", value: mixRatio },
  ];

  const totalMixVolume = totalMixMass / (dryDensity * 1000 * (1 + moisture / 100));

  return {
    soilVolume,
    drySoilMass,
    cementMass,
    numCementBags,
    waterMass,
    mixRatio,
    totalMixMass,
    totalMixVolume,
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
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export default function SoilCementStabilizationCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<StabilizationResult | null>(null);
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
    { question: "What is soil-cement stabilization?", answer: "Soil-cement is a mixture of pulverized soil, Portland cement, water, and sometimes additives, compacted to form a hard, durable paving. It is commonly used for road bases, parking lots, and building pads." },
    { question: "What cement content percentage is typical?", answer: "Cement content typically ranges from 3% to 12% of the dry soil weight, depending on soil type. Cohesive soils (clay) require 8-12%, while granular soils (sand) require 3-8%." },
    { question: "What is the water-cement ratio?", answer: "The water-cement ratio is the ratio of water to cement by weight. A lower ratio yields stronger soil-cement but is harder to mix and compact. Typical values range from 0.35 to 0.55." },
    { question: "How many kilograms in a cement bag?", answer: "Standard Portland cement bags weigh 50 kg (or 94 lb in the US). The calculator rounds up to give you the total number of bags needed." },
    { question: "Does moisture content affect the calculation?", answer: "Yes. Existing moisture in the soil affects the total water you need to add. If the soil is already wet, you may need less mixing water. This calculator uses the moisture-adjusted dry density." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "Soil Cement Stabilization Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Soil Cement Stabilization Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Shovel className="w-3.5 h-3.5" /> Project Dimensions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Area</label>
                  <div className="relative">
                    <input type="number" value={vals.area} onChange={(e) => updateVal("area", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">m²</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Depth</label>
                  <div className="relative">
                    <input type="number" value={vals.depth} onChange={(e) => updateVal("depth", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">m</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" /> Soil Properties
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Dry Density</label>
                  <div className="relative">
                    <input type="number" value={vals.dryDensity} onChange={(e) => updateVal("dryDensity", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">t/m³</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Moisture Content</label>
                  <div className="relative">
                    <input type="number" value={vals.moistureContent} onChange={(e) => updateVal("moistureContent", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Compaction Eff.</label>
                  <div className="relative">
                    <input type="number" value={vals.compactionEff} onChange={(e) => updateVal("compactionEff", e.target.value)} className="input-calc" step="any" min="1" max="100" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> Mix Design
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Cement Content</label>
                  <div className="relative">
                    <input type="number" value={vals.cementContent} onChange={(e) => updateVal("cementContent", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Water-Cement Ratio</label>
                  <input type="number" value={vals.waterCementRatio} onChange={(e) => updateVal("waterCementRatio", e.target.value)} className="input-calc" step="0.01" min="0" />
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
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Cement Required
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{result.numCementBags} bags</div>
                <p className="text-sm text-muted-foreground">
                  {result.cementMass.toFixed(0)} kg · Mix Ratio: {result.mixRatio}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Dry Soil</div>
                  <div className="text-lg font-bold text-foreground">{result.drySoilMass.toFixed(0)} kg</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Cement</div>
                  <div className="text-lg font-bold text-foreground">{result.cementMass.toFixed(0)} kg</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Water</div>
                  <div className="text-lg font-bold text-foreground">{result.waterMass.toFixed(0)} kg</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Component</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label === "Total Mix Mass" ? "font-bold border-t-2 border-border" : ""}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Mix Proportions by Weight
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="kg" radius={[6, 6, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Soil-Cement Stabilization: Engineering Strong Foundations</h2>
            <p>Soil-cement stabilization is a cost-effective ground improvement technique that involves mixing Portland cement into in-situ or excavated soil to improve its strength, durability, and water resistance. By adding cement to soil, weak or expansive soils can be transformed into a hard, concrete-like material suitable for road bases, parking lots, building foundations, and slope stabilization. The key to successful soil-cement lies in achieving the correct proportions of soil, cement, water, and compaction energy.</p>

            <h3>1. Calculating Cement Requirements</h3>
            <p>To determine how much cement you need, first calculate the volume of soil to be treated (area × depth). Then, multiply by the dry density of the soil and the compaction efficiency to get the dry soil mass. The cement mass is simply the dry soil mass multiplied by the desired cement content percentage. Standard cement bags weigh 50 kg, so divide the total cement mass by 50 and round up to find the number of bags required.</p>

            <h3>2. The Water-Cement Ratio Explained</h3>
            <p>The water-cement (W/C) ratio is the weight of water divided by the weight of cement in the mix. A lower W/C ratio produces a stronger, more durable result but makes the mix harder to work with. A typical W/C ratio for soil-cement is 0.40 to 0.55. Too much water reduces strength; too little makes compaction difficult and leads to poor binding of the cementitious compounds.</p>

            <h3>3. Compaction Efficiency</h3>
            <p>Compaction efficiency measures how much of the theoretical maximum dry density your compacted soil achieves. Standard proctor compaction typically achieves 95% efficiency, while vibratory or dynamic compaction may reach 98-100%. Lower compaction efficiency means more loose soil and reduced strength, so ensure your compaction equipment matches the specifications.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/soil-cement-stabilization-calculator" />
          <PopularCalculators exclude="/calculator/soil-cement-stabilization-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#a78bfa", "hsl(var(--primary))", "#3b82f6", "#10b981"];
