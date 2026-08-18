"use client";
import React, { useState } from "react";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const PIE_COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981"];

const NumInput = ({ id, label, value, onChange, prefix, suffix, min }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; min?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CLASSIFICATIONS = [
  { label: "Consumer Electronics", value: "electronics", rate: 15 },
  { label: "Apparel & Textiles", value: "apparel", rate: 12 },
  { label: "Footwear", value: "footwear", rate: 20 },
  { label: "Toys & Games", value: "toys", rate: 6 },
  { label: "Machinery & Tools", value: "machinery", rate: 2.5 },
  { label: "Automotive Parts", value: "automotive", rate: 2.5 },
  { label: "Furniture", value: "furniture", rate: 8 },
  { label: "Books & Paper Goods", value: "books", rate: 0 },
];

interface Inputs {
  classification: string;
  productCost: string;
  dutyRate: string;
  freight: string;
}

interface Result {
  dutyCost: number;
  landedCost: number;
  dutySharePct: number;
  freightSharePct: number;
  productSharePct: number;
  pie: { name: string; value: number; pct: number; color: string }[];
}

const DEFAULTS: Inputs = { classification: "electronics", productCost: "500", dutyRate: "15", freight: "50" };

function calculate(inputs: Inputs): Result {
  const cost = Math.max(0, parseFloat(inputs.productCost) || 0);
  const rate = Math.min(100, Math.max(0, parseFloat(inputs.dutyRate) || 0));
  const freight = Math.max(0, parseFloat(inputs.freight) || 0);
  const dutyCost = cost * (rate / 100);
  const landedCost = cost + dutyCost + freight;
  const parts = [
    { name: "Product Cost", value: cost, color: PIE_COLORS[0] },
    { name: "Duty Cost", value: dutyCost, color: PIE_COLORS[1] },
    { name: "Freight & Insurance", value: freight, color: PIE_COLORS[2] },
  ];
  let sum = 0;
  const pcts = parts.map(p => {
    if (landedCost <= 0) return 0;
    const v = Math.round((p.value / landedCost) * 1000) / 10;
    sum += v;
    return v;
  });
  if (landedCost > 0 && sum !== 100) {
    const diff = Math.round((100 - sum) * 10) / 10;
    let maxIdx = 0;
    for (let i = 1; i < pcts.length; i++) if (pcts[i] > pcts[maxIdx]) maxIdx = i;
    pcts[maxIdx] = Math.round((pcts[maxIdx] + diff) * 10) / 10;
  }
  const pie = parts.map((p, i) => ({ ...p, pct: pcts[i] })).filter(p => p.value > 0);
  return {
    dutyCost,
    landedCost,
    dutySharePct: landedCost > 0 ? (dutyCost / landedCost) * 100 : 0,
    freightSharePct: landedCost > 0 ? (freight / landedCost) * 100 : 0,
    productSharePct: landedCost > 0 ? (cost / landedCost) * 100 : 0,
    pie,
  };
}

const TariffClassificationCostEstimatorCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.productCost) <= 0 || num(inputs.dutyRate) < 0 || num(inputs.dutyRate) > 100 || num(inputs.freight) < 0;

  const handleClassification = (v: string) => {
    const cls = CLASSIFICATIONS.find(c => c.value === v);
    setInputs(prev => ({ ...prev, classification: v, dutyRate: cls ? String(cls.rate) : prev.dutyRate }));
  };

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Product Classification", value: (CLASSIFICATIONS.find(c => c.value === inputs.classification) || { label: inputs.classification }).label },
    { label: "Product Cost (FOB)", value: fmtMoney(num(inputs.productCost)) },
    { label: "Duty Rate", value: fmt(num(inputs.dutyRate)) + "%" },
    { label: "Duty Cost", value: fmtMoney(result.dutyCost), highlight: true },
    { label: "Freight & Insurance", value: fmtMoney(num(inputs.freight)) },
    { label: "Landed Cost", value: fmtMoney(result.landedCost), total: true },
    { label: "Duty as % of Landed Cost", value: result.dutySharePct.toFixed(1) + "%" },
  ];

  const faqs = [
    { question: "How are import duties calculated?", answer: "Duty is calculated on the customs value of the goods (typically the transaction value: product cost plus freight and insurance) multiplied by the applicable tariff rate for the product's Harmonized System (HS) classification. This calculator applies the rate to the product cost for simplicity." },
    { question: "What is the Harmonized System (HS)?", answer: "The HS is a standardized numerical method of classifying traded products, used by customs authorities worldwide. Each product has a 6-10 digit code; the first 6 digits are universal, and the classification determines the duty rate and any trade agreement benefits." },
    { question: "What is landed cost?", answer: "Landed cost is the true total cost of an imported product: purchase price plus freight, insurance, duties, and any customs broker or handling fees. Pricing and margin decisions should always be based on landed cost, not the factory price." },
    { question: "Why did the duty rate change when I picked a classification?", answer: "Each product category carries a typical U.S. duty rate — electronics around 15%, footwear up to 20%, machinery about 2.5%. Selecting a classification pre-fills that representative rate, which you can override to match your actual HS code and origin country." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Tariff Classification Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tariff Classification Cost Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label htmlFor="classification" className="text-sm font-medium mb-1">Product Classification</label>
              <div className="relative h-10">
                <select id="classification" value={inputs.classification} onChange={(e) => handleClassification(e.target.value)} className="w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium">
                  {CLASSIFICATIONS.map(c => <option key={c.value} value={c.value}>{c.label} — ~{c.rate}%</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="product-cost" label="Product Cost (FOB)" value={inputs.productCost} onChange={set("productCost")} prefix="$" />
              <NumInput id="duty-rate" label="Duty Rate" value={inputs.dutyRate} onChange={set("dutyRate")} suffix="%" />
            </div>
            <div>
              <NumInput id="freight" label="Freight & Insurance per Unit" value={inputs.freight} onChange={set("freight")} prefix="$" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Product cost must be &gt; 0 and duty rate between 0–100%.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Estimated Duty Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.dutyCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">Landed cost: <span className="font-bold text-foreground">{fmtMoney(result.landedCost)}</span> at a {fmt(num(inputs.dutyRate))}% duty rate</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Duty Rate</span>
                <span className="font-extrabold text-foreground">{fmt(num(inputs.dutyRate))}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Duty Cost</span>
                <span className="font-extrabold text-primary">{fmtMoney(result.dutyCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Landed Cost</span>
                <span className={`font-extrabold ${result.dutySharePct <= 15 ? "text-emerald-600" : "text-amber-600"}`}>{fmtMoney(result.landedCost)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Landed Cost Composition</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {result.pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [fmtMoney(v), n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {result.pie.map((p) => (
                  <span key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />{p.name} — {p.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Product Classification", value: (CLASSIFICATIONS.find(c => c.value === inputs.classification) || { label: inputs.classification }).label },
                  { label: "Product Cost", value: fmtMoney(num(inputs.productCost)) },
                  { label: "Duty Rate", value: fmt(num(inputs.dutyRate)) + "%" },
                  { label: "Duty Cost", value: fmtMoney(result.dutyCost), bold: true },
                  { label: "Freight & Insurance", value: fmtMoney(num(inputs.freight)) },
                  { label: "Landed Cost", value: fmtMoney(result.landedCost), bold: true },
                  { label: "Duty as % of Landed Cost", value: result.dutySharePct.toFixed(1) + "%" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Tariff Cost Estimator?</h2>
            <p>Importing goods is rarely as simple as the factory price. Duty, freight and insurance stack on top of the product cost to produce the landed cost — the number that should drive pricing and margin decisions. With the default inputs, a $500 electronics product at a 15% duty rate with $50 freight lands at $625: $75 of duty plus $50 of freight on top of the product cost.</p>
            <h2 className="text-2xl font-bold mb-3">Why Classification Matters</h2>
            <p>Every product has a Harmonized System (HS) code, and that code determines the duty rate. Classifying the same product differently can swing duty from 0% to 20% — which is why proper classification, and using free-trade agreements where available, are among the fastest ways to reduce landed cost. The calculator pre-fills representative U.S. rates per category; always confirm the actual rate for your code and origin country.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tariff-classification-cost-estimator" />
          <PopularCalculators exclude="/calculator/tariff-classification-cost-estimator" />
        </div>
      </div>
    </>
  );
};
export default TariffClassificationCostEstimatorCalculator;
