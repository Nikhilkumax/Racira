"use client";
import React, { useState } from "react";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(n, 2);
const PIE_COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#8b5cf6"];

const NumInput = ({ id, label, value, onChange, prefix, suffix, min, step }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; min?: string; step?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" min={min} step={step || "any"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Inputs {
  palletCount: string;
  storagePerPallet: string;
  handlingPerPallet: string;
  durationDays: string;
  palletValue: string;
  insuranceRate: string;
  overhead: string;
}

interface Result {
  storageCost: number;
  handlingCost: number;
  insuranceCost: number;
  totalCost: number;
  costPerPallet: number;
  storagePerPalletTotal: number;
  pie: { name: string; value: number; pct: number; color: string }[];
}

const DEFAULTS: Inputs = { palletCount: "1000", storagePerPallet: "0.5", handlingPerPallet: "2", durationDays: "30", palletValue: "500", insuranceRate: "0.5", overhead: "3000" };

function calculate(inputs: Inputs): Result {
  const pallets = Math.max(1, parseFloat(inputs.palletCount) || 1);
  const storagePerPallet = Math.max(0, parseFloat(inputs.storagePerPallet) || 0);
  const handlingPerPallet = Math.max(0, parseFloat(inputs.handlingPerPallet) || 0);
  const days = Math.max(1, parseFloat(inputs.durationDays) || 1);
  const value = Math.max(0, parseFloat(inputs.palletValue) || 0);
  const rate = Math.min(100, Math.max(0, parseFloat(inputs.insuranceRate) || 0));
  const overhead = Math.max(0, parseFloat(inputs.overhead) || 0);

  const storageCost = storagePerPallet * pallets * days;
  const handlingCost = handlingPerPallet * pallets;
  const insuranceCost = value * pallets * (rate / 100) * (days / 365);
  const totalCost = storageCost + handlingCost + insuranceCost + overhead;
  const parts = [
    { name: "Storage", value: storageCost, color: PIE_COLORS[0] },
    { name: "Handling", value: handlingCost, color: PIE_COLORS[1] },
    { name: "Insurance", value: insuranceCost, color: PIE_COLORS[2] },
    { name: "Facility Overhead", value: overhead, color: PIE_COLORS[3] },
  ];
  let sum = 0;
  const pcts = parts.map(p => {
    if (totalCost <= 0) return 0;
    const v = Math.round((p.value / totalCost) * 1000) / 10;
    sum += v;
    return v;
  });
  if (totalCost > 0 && sum !== 100) {
    const diff = Math.round((100 - sum) * 10) / 10;
    let maxIdx = 0;
    for (let i = 1; i < pcts.length; i++) if (pcts[i] > pcts[maxIdx]) maxIdx = i;
    pcts[maxIdx] = Math.round((pcts[maxIdx] + diff) * 10) / 10;
  }
  const pie = parts.map((p, i) => ({ ...p, pct: pcts[i] })).filter(p => p.value > 0);
  return { storageCost, handlingCost, insuranceCost, totalCost, costPerPallet: totalCost / pallets, storagePerPalletTotal: storagePerPallet + handlingPerPallet + (value * (rate / 100) * (days / 365)) / 1, pie };
}

const WarehouseCostPerPalletCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.palletCount) <= 0 || num(inputs.durationDays) <= 0 || num(inputs.storagePerPallet) < 0 || num(inputs.handlingPerPallet) < 0 || num(inputs.palletValue) < 0 || num(inputs.insuranceRate) < 0 || num(inputs.overhead) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Pallet Count", value: fmt(num(inputs.palletCount)) + " pallets" },
    { label: "Storage Cost per Pallet / Day", value: "$" + fmt(num(inputs.storagePerPallet), 2) },
    { label: "Handling Cost per Pallet", value: "$" + fmt(num(inputs.handlingPerPallet), 2) },
    { label: "Rental Duration", value: fmt(num(inputs.durationDays)) + " days" },
    { label: "Total Storage Cost", value: fmtMoney(result.storageCost) },
    { label: "Total Handling Cost", value: fmtMoney(result.handlingCost) },
    { label: "Insurance Cost", value: fmtMoney(result.insuranceCost), highlight: true },
    { label: "Facility Overhead", value: fmtMoney(num(inputs.overhead)) },
    { label: "Total Warehouse Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Pallet", value: fmtMoney(result.costPerPallet), highlight: true },
  ];

  const faqs = [
    { question: "What is warehouse cost per pallet?", answer: "It is the fully loaded cost of storing and handling one pallet for a given period — storage fees, handling labor, insurance on the inventory, and a share of facility overhead. It is the standard unit for comparing warehouse providers and pricing 3PL contracts." },
    { question: "How is it calculated?", answer: "Total cost = (storage rate per pallet per day × pallets × days) + (handling per pallet × pallets) + insurance + overhead. Cost per pallet = total cost ÷ pallet count. With the defaults: $15,000 storage + $2,000 handling + $205.48 insurance + $3,000 overhead = $20,205.48, or about $20.21 per pallet." },
    { question: "What does a typical storage rate look like?", answer: "Public warehousing commonly charges $0.30–$1.00 per pallet per day plus per-pallet handling fees of $1.50–$3.00 for receiving and putaway. Insurance is usually a small percentage of inventory value per year — this calculator uses 0.5%." },
    { question: "How can I reduce cost per pallet?", answer: "Increase pallet density and cube utilization, negotiate volume rates, reduce handling touches with cross-docking, and lower insurance by improving loss prevention. Because overhead is fixed, higher pallet counts spread it thinner." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Warehouse Cost Per Pallet Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Warehouse Cost Per Pallet Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pallets" label="Pallet Count" value={inputs.palletCount} onChange={set("palletCount")} />
              <NumInput id="days" label="Rental Duration" value={inputs.durationDays} onChange={set("durationDays")} suffix="days" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="storage" label="Storage $ / Pallet / Day" value={inputs.storagePerPallet} onChange={set("storagePerPallet")} prefix="$" step="0.01" />
              <NumInput id="handling" label="Handling $ / Pallet" value={inputs.handlingPerPallet} onChange={set("handlingPerPallet")} prefix="$" step="0.01" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(o => !o)} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Insurance & Overhead</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="value" label="Value per Pallet" value={inputs.palletValue} onChange={set("palletValue")} prefix="$" />
                    <NumInput id="ins" label="Insurance Rate / Year" value={inputs.insuranceRate} onChange={set("insuranceRate")} suffix="%" step="0.1" />
                  </div>
                  <NumInput id="overhead" label="Shared Facility Overhead" value={inputs.overhead} onChange={set("overhead")} prefix="$" />
                </div>
              )}
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Pallet count and duration must be &gt; 0; all rates and costs must be ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost per Pallet</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.costPerPallet)}</div>
              <div className="text-sm text-muted-foreground font-medium">Total warehouse cost: <span className="font-bold text-foreground">{fmtMoney(result.totalCost)}</span> for {fmt(num(inputs.palletCount))} pallets</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Storage Cost</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.storageCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Handling Cost</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.handlingCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-primary">{fmtMoney(result.totalCost)}</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Warehouse Cost Composition</h3>
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
                  { label: "Pallet Count", value: fmt(num(inputs.palletCount)) },
                  { label: "Rental Duration", value: fmt(num(inputs.durationDays)) + " days" },
                  { label: "Storage Cost", value: fmtMoney(result.storageCost) },
                  { label: "Handling Cost", value: fmtMoney(result.handlingCost) },
                  { label: "Insurance Cost", value: fmtMoney(result.insuranceCost) },
                  { label: "Facility Overhead", value: fmtMoney(num(inputs.overhead)) },
                  { label: "Total Warehouse Cost", value: fmtMoney(result.totalCost) },
                  { label: "Cost per Pallet", value: fmtMoney(result.costPerPallet), bold: true },
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
            <h2 className="text-2xl font-bold mb-3">What Does a Pallet Really Cost?</h2>
            <p>Storing a pallet involves more than the storage line item. Handling labor moves it in and out, insurance covers the inventory value, and facility overhead is spread across every pallet slot. With the defaults, 1,000 pallets stored for 30 days cost $20,205.48 — $15,000 in storage, $2,000 in handling, $205.48 in insurance, and $3,000 in overhead — about $20.21 per pallet.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmarking Your Rate</h2>
            <p>3PL storage rates commonly range from $0.30 to $1.00 per pallet per day, with handling $1.50–$3.00 per pallet. If your fully loaded cost per pallet exceeds $25–$30, it is worth renegotiating or re-laying-out the warehouse. The cost-per-pallet figure is also the correct input for SKU-level margin analysis.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/warehouse-cost-per-pallet-calculator" />
          <PopularCalculators exclude="/calculator/warehouse-cost-per-pallet-calculator" />
        </div>
      </div>
    </>
  );
};
export default WarehouseCostPerPalletCalculator;
