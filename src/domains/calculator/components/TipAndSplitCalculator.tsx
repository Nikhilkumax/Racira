"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const NumInput = ({ id, label, value, onChange, min, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 text-sm text-muted-foreground font-medium">{prefix}</span>}
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Inputs { bill: string; tipPct: string; people: string; }

interface Result {
  tipAmount: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { bill: "80", tipPct: "18", people: "2" };

function calculate(inputs: Inputs): Result | null {
  const bill = Math.max(0, parseFloat(inputs.bill) || 0);
  const tipPct = Math.max(0, parseFloat(inputs.tipPct) || 0);
  const people = Math.max(1, parseFloat(inputs.people) || 1);
  if (bill <= 0) return null;
  const tipAmount = bill * (tipPct / 100);
  const total = bill + tipAmount;
  const perPerson = total / people;
  const tipPerPerson = tipAmount / people;
  return {
    tipAmount,
    total,
    perPerson,
    tipPerPerson,
    chart: [
      { name: "Bill", value: Math.round(bill * 100) / 100 },
      { name: "Tip", value: Math.round(tipAmount * 100) / 100 },
    ],
  };
}

const TipAndSplitCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.bill) <= 0 || num(inputs.tipPct) < 0 || num(inputs.people) < 1;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "Bill Amount", value: money(num(inputs.bill)) },
    { label: "Tip Percentage", value: fmt(num(inputs.tipPct)) + "%" },
    { label: "Number of People", value: fmt(num(inputs.people)) },
    { label: "Tip Amount", value: money(r.tipAmount), highlight: true },
    { label: "Tip per Person", value: money(r.tipPerPerson) },
    { label: "Total Bill + Tip", value: money(r.total), highlight: true },
    { label: "Total per Person", value: money(r.perPerson), total: true },
  ] : [];

  const faqs = [
    { question: "What is the standard tipping percentage?", answer: "In the US, 15-20% for good restaurant service is standard, with 20-25% for large groups or exceptional service. Many point-of-sale systems now suggest tips on the after-tax total." },
    { question: "Should I tip on the pre- or post-tax total?", answer: "Traditionally tip on the pre-tax subtotal, but modern check presenters often compute on the total including tax. Either is accepted; tipping on the total is slightly more generous." },
    { question: "How do I split a bill fairly if people ordered differently?", answer: "Equal splits are easiest, but with big discrepancies it's fairer to total each person's items, add a proportionate share of tax and tip, and pay separately." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Tip and Split Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tip and Split Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Bill Details</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bill" label="Bill Amount" value={inputs.bill} onChange={set("bill")} min="0" prefix="$" />
              <NumInput id="tipPct" label="Tip Percentage" value={inputs.tipPct} onChange={set("tipPct")} min="0" suffix="%" />
            </div>
            <div>
              <NumInput id="people" label="Number of People" value={inputs.people} onChange={set("people")} min="1" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Bill must be greater than 0, tip ≥ 0, and people ≥ 1.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {r && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total per Person</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{money(r.perPerson)}</div>
                  <div className="text-sm text-muted-foreground font-medium">for {fmt(num(inputs.people))} people · {money(r.tipAmount)} tip included</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Bill + Tip</span>
                    <span className="font-extrabold text-primary">{money(r.total)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tip Amount</span>
                    <span className="font-extrabold text-emerald-600">{money(r.tipAmount)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tip per Person</span>
                    <span className="font-extrabold text-foreground">{money(r.tipPerPerson)}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Detail</th>
                        <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {rows.map((row) => (
                        <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                          <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Bill vs Tip Split</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={r.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${money(value)}`} labelLine={false}>
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--secondary))" />
                      </Pie>
                      <Tooltip formatter={(v: number) => [money(v), ""]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Bill", value: money(num(inputs.bill)) },
                      { label: "Tip %", value: fmt(num(inputs.tipPct)) + "%" },
                      { label: "Tip Amount", value: money(r.tipAmount), bold: true },
                      { label: "Total", value: money(r.total), bold: true },
                      { label: "Tip per Person", value: money(r.tipPerPerson) },
                      { label: "Per Person", value: money(r.perPerson), bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                        <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">What the Numbers Mean</h2>
            <p>An <strong>$80 bill at 18% split two ways</strong> comes to a $14.40 tip and $94.40 total — <strong>$47.20 per person</strong> ($40 bill + $7.20 tip each). Bumping to 20% adds just $0.80 per person and is the more common standard for good service.</p>
            <h2 className="text-2xl font-bold mb-3">Tipping Etiquette</h2>
            <p>Tipping is core to US service income, so tip on the higher end (20-25%) for large groups, long table holds, and exceptional service. Outside the US, service charges are often included and rounding up suffices — and in Japan, tipping can be unwelcome. Always check local customs.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tip-and-split-calculator" />
          <PopularCalculators exclude="/calculator/tip-and-split-calculator" />
        </div>
      </div>
    </>
  );
};
export default TipAndSplitCalculator;
