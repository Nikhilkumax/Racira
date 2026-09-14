"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

export const ThreeDPrintPieChart = React.memo(({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

export const ThreeDPrintTimelineChart = React.memo(({ data }: { data: { timeHrs: number; layer: number }[] }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="timeHrs" 
            tickFormatter={(val) => `${val.toFixed(1)}h`}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [Math.round(value), "Layers"]}
            labelFormatter={(label) => `Time: ${Number(label).toFixed(2)}h`}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
          <Line type="monotone" dataKey="layer" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export const ThreeDPrintImpactChart = React.memo(({ data }: { data: { label: string; timeSeconds: number }[] }) => {
  const chartData = data.map(d => ({
    ...d,
    timeHrs: d.timeSeconds / 3600
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number"
            tickFormatter={(val) => `${val}h`}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="label" 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip 
            formatter={(value: number) => [`${Math.floor(value)}h ${Math.round((value % 1) * 60)}m`, "Est. Time"]}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
          <Bar dataKey="timeHrs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.label === 'Current' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// 3D Print Material Cost Calculator (gold-standard rebuild)
// ─────────────────────────────────────────────────────────────

interface MaterialInputs {
  spoolPrice: string;
  spoolWeight: string;
  modelWeight: string;
  printTime: string;
  wastePct: string;
  printerPower: string;
  electricityRate: string;
}

interface MaterialResult {
  costPerGram: number;
  materialCostPerModel: number;
  energyKwh: number;
  energyCost: number;
  totalCostPerModel: number;
  modelsPerSpool: number;
  materialCostPerKg: number;
  wasteGrams: number;
  gramsPerModel: number;
}

const MATERIAL_DEFAULTS: MaterialInputs = {
  spoolPrice: "25",
  spoolWeight: "1",
  modelWeight: "85",
  printTime: "6",
  wastePct: "10",
  printerPower: "150",
  electricityRate: "0.15",
};

function calculateMaterial(inputs: MaterialInputs): MaterialResult {
  const spoolPrice = Math.max(0, parseFloat(inputs.spoolPrice) || 0);
  const spoolWeightKg = Math.max(0, parseFloat(inputs.spoolWeight) || 0);
  const modelWeight = Math.max(0, parseFloat(inputs.modelWeight) || 0);
  const printTime = Math.max(0, parseFloat(inputs.printTime) || 0);
  const wastePct = Math.min(100, Math.max(0, parseFloat(inputs.wastePct) || 0));
  const printerPower = Math.max(0, parseFloat(inputs.printerPower) || 0);
  const electricityRate = Math.max(0, parseFloat(inputs.electricityRate) || 0);

  const spoolGrams = spoolWeightKg * 1000;
  const costPerGram = spoolGrams > 0 ? spoolPrice / spoolGrams : 0;
  const wasteGrams = modelWeight * (wastePct / 100);
  const gramsPerModel = modelWeight + wasteGrams;
  const materialCostPerModel = costPerGram * gramsPerModel;
  const modelsPerSpool = gramsPerModel > 0 ? Math.floor(spoolGrams / gramsPerModel) : 0;
  const materialCostPerKg = spoolWeightKg > 0 ? spoolPrice / spoolWeightKg : 0;
  const energyKwh = (printerPower / 1000) * printTime;
  const energyCost = energyKwh * electricityRate;
  const totalCostPerModel = materialCostPerModel + energyCost;

  return {
    costPerGram,
    materialCostPerModel,
    energyKwh,
    energyCost,
    totalCostPerModel,
    modelsPerSpool,
    materialCostPerKg,
    wasteGrams,
    gramsPerModel,
  };
}

const fmt = (n: number, dec = 2) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(n, 2);
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function ThreeDPrintCharts() {
  const [inputs, setInputs] = useState<MaterialInputs>(MATERIAL_DEFAULTS);
  const [result, setResult] = useState<MaterialResult>(calculateMaterial(MATERIAL_DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculateMaterial(MATERIAL_DEFAULTS));
  }, []);

  const set = (k: keyof MaterialInputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.spoolPrice) < 0 || num(inputs.spoolWeight) <= 0 ||
    num(inputs.modelWeight) < 0 || num(inputs.printTime) < 0 ||
    num(inputs.wastePct) < 0 || num(inputs.wastePct) > 100 ||
    num(inputs.printerPower) < 0 || num(inputs.electricityRate) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculateMaterial(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(MATERIAL_DEFAULTS);
    setResult(calculateMaterial(MATERIAL_DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const breakdown = [
    { label: "Spool Price", value: fmtMoney(inputs.spoolPrice ? num(inputs.spoolPrice) : 0) },
    { label: "Spool Weight", value: `${fmt(num(inputs.spoolWeight), 2)} kg` },
    { label: "Cost per Gram", value: fmtMoney(result.costPerGram) },
    { label: "Model Weight", value: `${fmtInt(num(inputs.modelWeight))} g` },
    { label: "Waste", value: `${fmt(num(inputs.wastePct), 1)}% (${fmt(result.wasteGrams, 1)} g)` },
    { label: "Grams per Model", value: `${fmt(result.gramsPerModel, 1)} g` },
    { label: "Material Cost per Print", value: fmtMoney(result.materialCostPerModel) },
    { label: "Print Time", value: `${fmt(num(inputs.printTime), 1)} hrs` },
    { label: "Energy Used", value: `${fmt(result.energyKwh, 2)} kWh` },
    { label: "Energy Cost", value: fmtMoney(result.energyCost) },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="spool-price" label="Spool Price" value={inputs.spoolPrice} onChange={set("spoolPrice")} prefix="$" />
            <NumInput id="spool-weight" label="Spool Weight" value={inputs.spoolWeight} onChange={set("spoolWeight")} suffix="kg" />
            <NumInput id="model-weight" label="Model Weight" value={inputs.modelWeight} onChange={set("modelWeight")} suffix="g" />
            <NumInput id="print-time" label="Print Time" value={inputs.printTime} onChange={set("printTime")} suffix="hrs" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Print Economics</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="waste-pct" label="Waste" value={inputs.wastePct} onChange={set("wastePct")} suffix="%" />
                  <NumInput id="printer-power" label="Printer Power" value={inputs.printerPower} onChange={set("printerPower")} suffix="W" />
                  <NumInput id="electricity-rate" label="Electricity Rate" value={inputs.electricityRate} onChange={set("electricityRate")} prefix="$" suffix="/kWh" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Cost per Print</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.totalCostPerModel)}</div>
            <div className="text-sm text-muted-foreground mt-1">{fmt(result.gramsPerModel, 1)} g of filament · {fmt(result.energyKwh, 2)} kWh electricity</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Models per Spool</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmtInt(result.modelsPerSpool)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Material Cost / kg</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.materialCostPerKg)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Energy Cost</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{fmtMoney(result.energyCost)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Material Cost Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total per Print</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.totalCostPerModel)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Total per Print</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.totalCostPerModel)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is 3D Print Material Cost?</h2>
            <p className="text-muted-foreground leading-relaxed">The cost of a 3D printed part is more than the price of the filament on your shelf — it is the share of a full spool that a single model actually consumes, plus the electricity the printer draws while the job runs. Filament is sold by weight, and printers deposit plastic by weight, so the honest unit of comparison is cost per gram: divide the spool price by its total weight and multiply by the grams your model uses. Real-world prints never use exactly the modeled weight, because supports, brims, purge lines, failed starts, and the priming tower all consume material that ends up in the waste bin rather than on the part. A 10 percent waste allowance is a common planning figure for reasonably optimized profiles, while heavily supported prints can waste 20 percent or more. Material choice drives the whole economics of printing: PLA is the cheapest and easiest to print, PETG costs a little more and resists heat and moisture far better, ABS adds strength and temperature tolerance but needs an enclosed printer, and engineering filaments such as nylon or polycarbonate can cost two to three times as much per kilogram while demanding hardened nozzles and careful drying. Knowing the true delivered cost of each material lets you choose sensibly instead of defaulting to whatever spool is on sale.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How Material Cost Per Print Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">This calculator works in three steps. First it converts the spool price into a per-gram rate by dividing the spool price by its weight in grams — a $25 spool of 1 kg filament costs 2.5 cents per gram, and a $45 spool of nylon at the same weight costs 4.5 cents per gram. Second, it adds the waste allowance to your model weight to get the true grams consumed per print, then multiplies by the per-gram rate to find the material cost of each part: an 85-gram model with 10 percent waste consumes 93.5 grams, which is about $2.34 of a $25 spool. Third, it estimates the electricity cost by converting your printer's average power draw and the print time into kilowatt-hours, then multiplying by your electricity rate. A 150-watt printer running 6 hours consumes 0.9 kWh, which costs about 14 cents at the U.S. average rate of roughly 16 cents per kWh; a larger machine pulling 400 watts on an 18-hour print can add well over a dollar. The models-per-spool figure divides the spool's usable grams by the grams consumed per print, which is the practical question most makers actually care about — how many parts can I get out of one roll? Adding the material and energy components gives the total cost per print, the number you want when pricing a part for a friend, a shop, or an online storefront.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Material Cost Results</h2>
            <p className="text-muted-foreground leading-relaxed">Material is usually the largest single input cost for hobbyist printing, but it is rarely the whole story. If the total cost per print looks high, check the two levers with the biggest effect: the per-gram filament price and the waste allowance. Switching from a premium specialty filament to a reliable budget brand can cut material cost per gram by half, and tightening your supports and purge settings reduces waste on every subsequent print. The energy figure matters most for long, large-format prints — an 18-hour print at high power draw can add a dollar or more of electricity, so heated-chamber machines and long bed-slingers deserve a realistic power estimate rather than the printer's nameplate average. Knowing your true cost per print also makes selling prints realistic: it gives you the floor for pricing, lets you compare materials honestly before buying, and shows whether a cheaper spool is actually cheaper per part once waste, print success rate, and reliability are factored in. A spool that fails one print in ten is rarely the bargain it appears to be at checkout.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/three-dprint-charts" />
      </div>
    </div>
  );
}