"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Fish, Waves, Ruler, Box } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AquariumInputs {
  length: number;
  width: number;
  height: number;
  glassThickness: number;
  gravelDepth: number;
  decorVolume: number;
}

interface AquariumResult {
  internalLength: number;
  internalWidth: number;
  internalHeight: number;
  waterVolumeCuIn: number;
  waterVolumeGal: number;
  waterVolumeLiters: number;
  surfaceArea: number;
  fishCapacity: number;
  gravelDisplacement: number;
  externalVolume: number;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULTS: AquariumInputs = {
  length: 48,
  width: 24,
  height: 12,
  glassThickness: 0.25,
  gravelDepth: 2,
  decorVolume: 500,
};

// ---------------------------------------------------------------------------
// Pure calculation (zero React) — safe against zero / negative / NaN inputs
// ---------------------------------------------------------------------------

function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function calculate(input: AquariumInputs): AquariumResult {
  const length = safe(input.length);
  const width = safe(input.width);
  const height = safe(input.height);
  const glassThickness = Math.max(0, safe(input.glassThickness));
  const gravelDepth = Math.max(0, safe(input.gravelDepth));
  const decorVolume = Math.max(0, safe(input.decorVolume));

  const internalLength = Math.max(0, length - 2 * glassThickness);
  const internalWidth = Math.max(0, width - 2 * glassThickness);
  const internalHeight = Math.max(0, height - glassThickness);

  const gravelDisplacement = length * width * gravelDepth;
  const waterVolumeCuIn = Math.max(0, internalLength * internalWidth * internalHeight - gravelDisplacement - decorVolume);
  const waterVolumeGal = waterVolumeCuIn / 231;
  const waterVolumeLiters = waterVolumeCuIn / 61.024;
  const surfaceArea = internalLength * internalWidth;
  const fishCapacity = waterVolumeGal;
  const externalVolume = length * width * height;

  return {
    internalLength,
    internalWidth,
    internalHeight,
    waterVolumeCuIn,
    waterVolumeGal,
    waterVolumeLiters,
    surfaceArea,
    fishCapacity,
    gravelDisplacement,
    externalVolume,
  };
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

const CI = ({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AquariumVolumeCalculator() {
  const [inputs, setInputs] = useState<AquariumInputs>(DEFAULTS);
  const [result, setResult] = useState<AquariumResult>(calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calculate(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key: keyof AquariumInputs) => (v: string) =>
    setInputs((prev) => ({ ...prev, [key]: v === "" ? 0 : parseFloat(v) || 0 }));

  const handleCalculate = () => setResult(calculate(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setShowAdvanced(false);
    setResult(calculate(DEFAULTS));
  };

  const chartData = [
    { label: "Gallons", value: parseFloat(result.waterVolumeGal.toFixed(2)), color: "#3b82f6" },
    { label: "Liters", value: parseFloat(result.waterVolumeLiters.toFixed(2)), color: "#10b981" },
  ];

  const faqs = [
    { question: "How do I calculate aquarium volume?", answer: "Measure the external length, width, and height of your tank in inches. Use the Advanced Options to enter glass thickness, gravel depth, and decor volume for a more accurate water volume. Click Calculate to get results in gallons and liters instantly." },
    { question: "What is the 1 inch per gallon rule?", answer: "The 1 inch per gallon rule is a rough guideline stating that you can keep 1 inch of fish per gallon of water. For a 48x24x12 tank, this yields about 47 gallons and supports roughly 47 inches of fish. Always research specific species needs, as some fish produce more waste or require more swimming space than others." },
    { question: "Why does glass thickness matter?", answer: "Glass thickness reduces the internal dimensions of your aquarium. A standard 0.25-inch pane on each side removes 0.5 inches from length and width, and 0.25 inches from height. For large tanks, this displacement is significant — ignoring it can lead to underestimating the actual water capacity and overstocking." },
    { question: "How do I account for gravel and decorations?", answer: "Gravel and decorations displace water that would otherwise fill the tank. Our calculator subtracts the volume of your gravel bed (length × width × depth) and the volume of any large decor items. This gives you the true water volume rather than the theoretical tank volume, which is what determines fish capacity and filtration needs." },
    { question: "What size filter do I need?", answer: "A general rule is to choose a filter rated for 4–6 times your tank's gallon capacity per hour. For a 47-gallon tank, look for a filter rated at 188–282 GPH (gallons per hour). Heavy-stocked or saltwater tanks may need higher turnover rates." },
    { question: "How many fish can I keep?", answer: "Start with the 1-inch-per-gallon rule as a baseline, then adjust for fish adult size, activity level, and bioload. Community tanks with small peaceful fish often stay near this rule, while large or messy fish like goldfish or cichlids need significantly more water per inch of body length." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home", href: "/calculator#home" }, { label: "Aquarium Volume Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Aquarium Volume Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: inputs + second tier + Calculate + Reset */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="length" label="Length" value={String(inputs.length)} onChange={setField("length")} suffix="in" />
              <CI id="width" label="Width" value={String(inputs.width)} onChange={setField("width")} suffix="in" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="height" label="Height" value={String(inputs.height)} onChange={setField("height")} suffix="in" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Unit</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm">
                  <span className="w-full px-3 py-1 text-base text-foreground">Gallons / Liters</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <RotateCcw className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up flex flex-col gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Displacement</div>
                    <div className="grid grid-cols-2 gap-4">
                      <CI id="gravel" label="Gravel Depth" value={String(inputs.gravelDepth)} onChange={setField("gravelDepth")} suffix="in" />
                      <CI id="decor" label="Decor Volume" value={String(inputs.decorVolume)} onChange={setField("decorVolume")} suffix="in³" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Glass Thickness</div>
                    <div className="grid grid-cols-1 gap-4">
                      <CI id="glass" label="Glass Thickness" value={String(inputs.glassThickness)} onChange={setField("glassThickness")} suffix="in" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm active:scale-[0.98]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: results */}
          <div className="flex flex-col gap-4">
            {/* 1. Primary Result Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 relative">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Aquarium Volume</div>
              <div className="text-4xl font-bold text-primary">{fmt(result.waterVolumeGal)} gal</div>
              <div className="text-sm text-muted-foreground mt-1">{fmt(result.waterVolumeLiters)} liters • {fmt(result.waterVolumeCuIn, 0)} cubic inches</div>
            </div>

            {/* 2. 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card-calculator !p-4 border border-border bg-card">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Surface Area</div>
                <div className="text-xl font-bold text-foreground">{fmt(result.surfaceArea)} in²</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Fish Capacity</div>
                <div className="text-xl font-bold text-foreground">{fmt(result.fishCapacity)} in</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Ext. Volume</div>
                <div className="text-xl font-bold text-foreground">{fmt(result.externalVolume, 0)} in³</div>
              </div>
            </div>

            {/* 3. Breakdown Table */}
            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-semibold mb-3">Breakdown</h3>
              <table className="w-full text-base">
                <tbody>
                  {[
                    { label: "External Length", value: `${fmt(inputs.length)} in` },
                    { label: "External Width", value: `${fmt(inputs.width)} in` },
                    { label: "External Height", value: `${fmt(inputs.height)} in` },
                    { label: "Glass Thickness", value: `${fmt(inputs.glassThickness)} in` },
                    { label: "Internal Length", value: `${fmt(result.internalLength)} in` },
                    { label: "Internal Width", value: `${fmt(result.internalWidth)} in` },
                    { label: "Internal Height", value: `${fmt(result.internalHeight)} in` },
                    { label: "Water Volume", value: `${fmt(result.waterVolumeGal)} gal` },
                    { label: "Water Volume", value: `${fmt(result.waterVolumeLiters)} liters` },
                    { label: "Surface Area", value: `${fmt(result.surfaceArea)} in²` },
                    { label: "Fish Capacity", value: `${fmt(result.fishCapacity)} inches` },
                    { label: "Gravel Displacement", value: `${fmt(result.gravelDisplacement, 0)} in³` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Recharts BarChart */}
            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-semibold mb-3">Volume by Unit</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()}`, ""]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 5. Summary Statistics */}
            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-semibold mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Total Displacement</div>
                  <div className="text-lg font-bold">{fmt(result.gravelDisplacement + result.waterVolumeCuIn, 0)} in³</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Water Ratio</div>
                  <div className="text-lg font-bold">{result.externalVolume > 0 ? fmt((result.waterVolumeCuIn / result.externalVolume) * 100) + "%" : "0%"}</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Internal Volume</div>
                  <div className="text-lg font-bold">{fmt(result.internalLength * result.internalWidth * result.internalHeight, 0)} in³</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground mb-1">1 Inch Per Gallon</div>
                  <div className="text-lg font-bold">{fmt(result.fishCapacity)} inches of fish</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Aquarium Volume and Fish Stocking</h2>
            <p>Accurately calculating your aquarium&apos;s water volume is the foundation of responsible fishkeeping. Many beginners make the mistake of using external tank dimensions, which overestimates the actual water capacity. Our Aquarium Volume Calculator corrects for glass thickness, substrate displacement, and decor volume to give you the true usable water volume. This matters because fish stocking limits, filtration requirements, and chemical dosing all depend on the actual water volume — not the size of the box that holds it. A standard 48x24x12 inch tank may hold roughly 47 gallons of water, but adding 2 inches of gravel and 500 cubic inches of decor can reduce that usable volume by several gallons, directly affecting how many fish the tank can safely support.</p>

            <h2 className="text-2xl font-bold mb-3">Filtration and Water Quality</h2>
            <p>Once you know your tank&apos;s true volume, you can properly size your filtration system. A widely accepted rule is to select a filter rated for 4 to 6 times the tank&apos;s gallon capacity per hour. For a 47-gallon aquarium, that means looking for a filter with a flow rate between 188 and 282 gallons per hour. Heavily stocked tanks, those with large messy fish like goldfish, or planted tanks with nutrient-rich substrates may require even higher turnover. Canister filters, hang-on-back filters, and sponge filters each have different strengths, but the key metric is always your tank&apos;s actual water volume. Our calculator gives you the precise number needed to make an informed filtration choice and maintain water quality.</p>

            <h2 className="text-2xl font-bold mb-3">The 1 Inch Per Gallon Rule and Its Limits</h2>
            <p>The classic 1 inch of fish per gallon guideline provides a quick starting point for stocking, but it is only a rough rule. It works best for small, peaceful community fish with similar adult sizes and activity levels. Large active fish, messy eaters like cichlids or goldfish, and species that grow significantly larger than their juvenile size all demand more water per inch of body length. Additionally, the shape of the tank matters: a tall narrow tank has less surface area for gas exchange than a long wide one, even if both hold the same volume. Our calculator reports surface area alongside volume so you can account for this critical factor when planning your aquarium community.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aquarium-volume-calculator" />
          <PopularCalculators exclude="/calculator/aquarium-volume-calculator" />
        </div>
      </div>
    </>
  );
}
