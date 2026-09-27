"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// WHO/EPA guidelines: 0.7 mg/L optimal fluoride (US), 1.0 mg/L (WHO max)
// Dose = Target Concentration × Flow Rate / (Fluoride Product Purity / 100)
// Fluoride demand = Target - Natural Fluoride
// Product types: Sodium Fluoride (NaF) 45% F, Fluorosilicic Acid 23% F, Sodium Fluorosilicate 60.6% F
const PRODUCTS = [
  { id: "h2sif6", label: "Fluorosilicic Acid (H₂SiF₆)", purity: 23.0, unit: "L/day", form: "liquid" },
  { id: "naf", label: "Sodium Fluoride (NaF)", purity: 45.0, unit: "kg/day", form: "solid" },
  { id: "na2sif6", label: "Sodium Fluorosilicate (Na₂SiF₆)", purity: 60.6, unit: "kg/day", form: "solid" },
];
const PRODUCT_DENSITIES: Record<string, number> = { h2sif6: 1.22, naf: 1.0, na2sif6: 1.0 }; // kg/L for liquid

const DEFAULTS = { flowRate: "10", flowUnit: "ML/day", naturalF: "0.3", targetF: "0.7", productId: "h2sif6" };

function calculate(flowRateStr: string, flowUnit: string, naturalF: number, targetF: number, productId: string) {
  const flowRate = parseFloat(flowRateStr) || 0;
  if (flowRate <= 0 || naturalF < 0 || targetF <= naturalF) return null;

  const product = PRODUCTS.find(p => p.id === productId)!;
  const demand = targetF - naturalF; // mg/L = g/m³

  // Convert flow to m³/day
  let flowM3 = flowRate;
  if (flowUnit === "ML/day") flowM3 = flowRate * 1000;
  if (flowUnit === "L/day") flowM3 = flowRate / 1000;
  if (flowUnit === "MGD") flowM3 = flowRate * 3785.41;
  if (flowUnit === "m3/hr") flowM3 = flowRate * 24;

  // g F / day needed = demand (g/m³) × flow (m³/day)
  const fNeedGday = demand * flowM3;

  // Product dose kg/day = F needed (g) / (purity/100 × 1000)
  const doseKgDay = fNeedGday / (product.purity / 100 * 1000);
  const doseGday = doseKgDay * 1000;

  // For liquid (fluorosilicic acid), convert to L/day
  const doseLday = product.form === "liquid" ? doseKgDay / PRODUCT_DENSITIES[productId] : null;
  const doseDisplay = product.form === "liquid"
    ? `${doseLday!.toFixed(3)} L/day`
    : `${doseKgDay.toFixed(3)} kg/day`;

  // Annual quantities
  const doseAnnual = product.form === "liquid"
    ? `${(doseLday! * 365).toFixed(1)} L/yr`
    : `${(doseKgDay * 365).toFixed(1)} kg/yr`;

  const chartData = [
    { name: "Natural Fluoride", value: naturalF },
    { name: "Fluoride Added", value: parseFloat(demand.toFixed(3)) },
    { name: "Target Level", value: targetF },
    { name: "WHO Max (1.0)", value: 1.0 },
  ];

  const breakdown = [
    { label: "Flow Rate", value: `${flowRate} ${flowUnit}` },
    { label: "Flow Rate (m³/day)", value: `${flowM3.toLocaleString()} m³/day` },
    { label: "Natural Fluoride", value: `${naturalF.toFixed(2)} mg/L` },
    { label: "Target Fluoride", value: `${targetF.toFixed(2)} mg/L` },
    { label: "Fluoride Demand", value: `${demand.toFixed(3)} mg/L` },
    { label: "Fluoride Needed (F only)", value: `${fNeedGday.toFixed(1)} g/day` },
    { label: "Product Purity", value: `${product.purity}% F` },
    { label: "Product Dose Required", value: doseDisplay },
    { label: "Annual Product Required", value: doseAnnual },
  ];

  const summaryStats = [
    { label: "Fluoride Demand", value: `${demand.toFixed(3)} mg/L` },
    { label: "Product Dose", value: doseDisplay },
    { label: "Annual Volume", value: doseAnnual },
    { label: "F Needed", value: `${fNeedGday.toFixed(1)} g/day` },
    { label: "Meets WHO (<1.0)", value: targetF <= 1.0 ? "✓ Yes" : "⚠ No" },
    { label: "Meets US Optimal (0.7)", value: targetF === 0.7 ? "✓ Yes" : `${targetF} mg/L` },
  ];

  return { demand, doseDisplay, doseAnnual, fNeedGday, doseKgDay, doseLday, product, chartData, breakdown, summaryStats };
}

const COLORS = ["#94a3b8", "hsl(var(--primary))", "#10b981", "#f59e0b"];

export default function DrinkingWaterFluorideDoseCalculator() {
  const [flowRate, setFlowRate] = useState(DEFAULTS.flowRate);
  const [flowUnit, setFlowUnit] = useState(DEFAULTS.flowUnit);
  const [naturalF, setNaturalF] = useState(DEFAULTS.naturalF);
  const [targetF, setTargetF] = useState(DEFAULTS.targetF);
  const [productId, setProductId] = useState(DEFAULTS.productId);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculate>>(null);

  const run = (fr=flowRate,fu=flowUnit,nf=naturalF,tf=targetF,pid=productId) =>
    setResult(calculate(fr, fu, parseFloat(nf)||0, parseFloat(tf)||0, pid));

  useEffect(() => { run(); }, []);

  const Inp = ({ id, label, value, onChange, suffix }: any) => (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
      <div className="relative flex items-center h-10 rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
        <input id={id} type="number" value={value} min={0} step="any" onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
          className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
        {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">{suffix}</span>}
      </div>
    </div>
  );
  const Sel = ({ id, label, value, onChange, opts }: any) => (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className="h-10 w-full px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground">
        {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Engineering",href:"/calculator/engineering"},{label:"Drinking Water Fluoride Dose Calculator"}]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Drinking Water Fluoride Dose Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <Inp id="flowRate" label="Treatment Flow Rate" value={flowRate} onChange={setFlowRate} />
              <Sel id="flowUnit" label="Flow Unit" value={flowUnit} onChange={setFlowUnit}
                opts={[{v:"ML/day",l:"ML/day"},{v:"m3/day",l:"m³/day"},{v:"m3/hr",l:"m³/hr"},{v:"L/day",l:"L/day"},{v:"MGD",l:"MGD"}]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Inp id="naturalF" label="Natural Fluoride" value={naturalF} onChange={setNaturalF} suffix="mg/L" />
              <Inp id="targetF" label="Target Fluoride" value={targetF} onChange={setTargetF} suffix="mg/L" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none">
                Fluoride Product <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="mt-3 border border-border rounded-lg p-4 bg-secondary/10">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Chemical Product</div>
                  <div className="flex flex-col gap-2">
                    {PRODUCTS.map(p => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="product" value={p.id} checked={productId === p.id}
                          onChange={() => { setProductId(p.id); run(flowRate, flowUnit, naturalF, targetF, p.id); }}
                          className="accent-primary" />
                        <span>{p.label} <span className="text-muted-foreground">({p.purity}% F)</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => run()}
                className="h-10 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-colors">Calculate</button>
              <button type="button" onClick={() => { setFlowRate(DEFAULTS.flowRate); setFlowUnit(DEFAULTS.flowUnit); setNaturalF(DEFAULTS.naturalF); setTargetF(DEFAULTS.targetF); setProductId(DEFAULTS.productId); run(DEFAULTS.flowRate,DEFAULTS.flowUnit,DEFAULTS.naturalF,DEFAULTS.targetF,DEFAULTS.productId); }}
                aria-label="Reset" className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
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
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Required Product Dose</div>
                <div className="text-4xl font-bold text-primary">{result.doseDisplay}</div>
                <div className="text-sm text-muted-foreground mt-1">Annual: <span className="font-semibold text-foreground">{result.doseAnnual}</span> — {result.product.label}</div>
              </div>
              <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  { label: "Fluoride Demand", value: `${result.demand.toFixed(3)} mg/L`, color: "text-primary" },
                  { label: "F Needed", value: `${result.fNeedGday.toFixed(1)} g/day`, color: "" },
                  { label: "WHO Compliant", value: parseFloat(targetF) <= 1.0 ? "✓ Yes" : "⚠ No", color: parseFloat(targetF) <= 1.0 ? "text-emerald-500" : "text-red-500" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Parameter</th>
                      <th className="text-right text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label.includes("Dose Required") ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="text-sm py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="text-sm py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Fluoride Levels (mg/L)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 1.5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any) => [`${v} mg/L`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: 12 }} />
                    <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "WHO Max 1.0", position: "insideTopRight", fontSize: 10, fill: "#ef4444" }} />
                    <ReferenceLine y={0.7} stroke="#10b981" strokeDasharray="4 2" label={{ value: "US Optimal 0.7", position: "insideBottomRight", fontSize: 10, fill: "#10b981" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is a Drinking Water Fluoride Dose Calculator?</h2>
            <p className="text-muted-foreground leading-relaxed">This calculator determines how much fluoride chemical product must be dosed into a water treatment plant to raise the fluoride concentration from its natural level to a target level. It supports the three most common fluoridation chemicals — fluorosilicic acid (H₂SiF₆, used in ~90% of US fluoridation systems), sodium fluoride (NaF), and sodium fluorosilicate (Na₂SiF₆). Defaults show a 10 ML/day plant with 0.3 mg/L natural fluoride targeting the US optimal of 0.7 mg/L, requiring fluorosilicic acid at the calculated dose.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Dose Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Fluoride Demand (mg/L) = Target Fluoride − Natural Fluoride. Fluoride Needed (g/day) = Demand × Flow Rate (m³/day). Product Dose (kg/day) = Fluoride Needed ÷ (Product Purity% ÷ 100 × 1000). For liquid fluorosilicic acid, kg/day is further divided by the product density (1.22 kg/L) to get litres/day. The WHO maximum fluoride guideline is 1.0 mg/L; the US optimal is 0.7 mg/L (CDC, 2015 update). The bar chart shows natural fluoride, the dose increment, and the target level against WHO and US reference lines.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The primary result gives the daily product dose in litres (for liquid) or kilograms (for solid chemicals), plus the annual consumption for procurement planning. The 3-stat bar shows demand, daily fluoride mass needed, and WHO compliance status. The breakdown table shows every conversion step from flow and concentration to final product mass. Always verify calculated doses against laboratory jar testing and online dosing pump calibration data — this calculator provides the theoretical dose based on product purity, which may vary between manufacturer batches.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/drinking-water-fluoride-dose-calculator" />
      </div>
    </>
  );
}
