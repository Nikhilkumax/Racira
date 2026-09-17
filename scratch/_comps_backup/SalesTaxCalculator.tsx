"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Receipt } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface NumInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

function NumInput({ label, value, onChange, min = 0, max = 999999, step = 1, suffix, prefix }: NumInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(min);
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return;
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className={`input-calc ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

const fmt = (n: number) => "$" + n.toFixed(2);

export default function SalesTaxCalculator() {
  const [mode, setMode] = useState<"add" | "reverse">("add");
  const [price, setPrice] = useState(100);
  const [rate, setRate] = useState(8.25);
  const [showResults, setShowResults] = useState(false);

  const r = rate / 100;
  const d =
    mode === "add"
      ? { beforeTax: price, tax: price * r, afterTax: price + price * r, effective: r * 100 }
      : { beforeTax: price / (1 + r), tax: price - price / (1 + r), afterTax: price, effective: r * 100 };

  const taxShare = d.afterTax > 0 ? (d.tax / d.afterTax) * 100 : 0;
  const chartData = [
    { name: "Pre-Tax Price", value: Math.round(d.beforeTax) },
    { name: "Sales Tax", value: Math.round(d.tax) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setMode("add");
    setPrice(100);
    setRate(8.25);
    setShowResults(false);
  };

  const faqs = [
    { question: "How do I add sales tax to a price?", answer: "Multiply the pre-tax price by 1 + the rate. At 8.25%, a $100 item becomes $108.25. The tax itself is price × rate — $8.25 in this case. This is the 'add tax' mode of this calculator." },
    { question: "How do I remove tax from a total?", answer: "Divide the after-tax total by 1 + the rate to recover the pre-tax price, then subtract. A $108.25 total at 8.25% contains $100 of pre-tax price and $8.25 of tax. This is the 'reverse' mode." },
    { question: "What is the average US sales tax rate?", answer: "Combined state and local rates average about 7.12% nationally. Five states (Alaska, Delaware, Montana, New Hampshire, Oregon) have no state sales tax, while combined rates in some cities exceed 10%." },
    { question: "Do I pay sales tax on services?", answer: "It varies by state. Many states tax services like repair work, haircuts, and software, while others exempt them. Business-to-business services are often exempt when the buyer resells or uses them in production." },
    { question: "Is sales tax the same as VAT?", answer: "No. Sales tax is charged once, at the final retail sale, and is usually not shown in the listed price. VAT is charged at every stage of production with credits for tax already paid, and is included in the displayed price — common in most countries outside the US." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sales Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sales Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Receipt className="w-4 h-4" /> Add or Remove Tax
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-input overflow-hidden flex col-span-2">
                <button
                  onClick={() => setMode("add")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === "add" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  Add Tax to Price
                </button>
                <button
                  onClick={() => setMode("reverse")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === "reverse" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  Remove Tax from Total
                </button>
              </div>
              <NumInput
                label={mode === "add" ? "Before-Tax Price" : "After-Tax Total"}
                value={price}
                onChange={setPrice}
                min={0.01}
                max={999999}
                step={0.01}
                prefix="$"
              />
              <NumInput label="Sales Tax Rate" value={rate} onChange={setRate} min={0} max={30} step={0.01} suffix="%" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Sales Tax Amount</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(d.tax)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mode === "add" ? "added to the pre-tax price" : "hidden inside the total"} · {d.effective.toFixed(2)}% rate
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Before-Tax</p>
                    <p className="text-2xl font-bold text-primary">{fmt(d.beforeTax)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Sales Tax</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(d.tax)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">After-Tax Total</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(d.afterTax)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Sales Tax</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(d.tax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Before-Tax Price</td>
                        <td className="py-2.5 px-3 text-right">{fmt(d.beforeTax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">After-Tax Total</td>
                        <td className="py-2.5 px-3 text-right">{fmt(d.afterTax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Tax Rate</td>
                        <td className="py-2.5 px-3 text-right">{d.effective.toFixed(2)}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Tax Share of Total</td>
                        <td className="py-2.5 px-3 text-right">{taxShare.toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Price Composition</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} label>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={["#2563eb", "#f59e0b"][i]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium">{mode === "add" ? "Add Tax" : "Remove Tax"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Tax Rate</span>
                      <span className="font-medium">{rate}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Before-Tax</span>
                      <span className="font-medium">{fmt(d.beforeTax)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">After-Tax</span>
                      <span className="font-medium">{fmt(d.afterTax)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Tax Amount</span>
                      <span className="font-medium">{fmt(d.tax)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Tax Share</span>
                      <span className="font-medium">{taxShare.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Choose add or remove mode, enter your numbers, and click <strong className="text-foreground">Calculate</strong> to see the tax amount, before-tax price, and after-tax total.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Sales Tax Works</h2>
            <p>Add mode: tax = price × rate, total = price + tax. Reverse mode extracts the pre-tax price from a tax-inclusive total: before-tax = total ÷ (1 + rate), tax = total − before-tax.</p>
            <h3>Worked Example</h3>
            <p>A $100 item at 8.25% carries $8.25 of tax for a $108.25 total. Working backward, a $108.25 total at 8.25% reveals a $100 pre-tax price. Combined US state-and-local rates average about 7.12%, from 0% in tax-free states to over 10% in some cities.</p>
            <h3>Who Collects It</h3>
            <p>Sales tax is collected by the retailer at the point of sale and remitted to the state and local governments. Online sellers now collect it in most states following the 2018 Wayfair ruling, which allowed states to require out-of-state sellers to charge tax on remote sales — closing a long-standing e-commerce loophole.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sales-tax-calculator" />
          <PopularCalculators exclude="/calculator/sales-tax-calculator" />
        </div>
      </div>
    </>
  );
}
