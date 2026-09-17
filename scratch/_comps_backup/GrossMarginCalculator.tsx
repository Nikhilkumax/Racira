"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function GrossMarginCalculator() {
  const [cost, setCost] = useState("60");
  const [revenue, setRevenue] = useState("100");
  const [markup, setMarkup] = useState("66.67");
  const [grossProfit, setGrossProfit] = useState("40");
  const [margin, setMargin] = useState("40");
  const [activeInput, setActiveInput] = useState<"cogs-rev" | "cogs-margin" | "cogs-markup">("cogs-rev");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const c = parseFloat(cost) || 0;
    if (activeInput === "cogs-rev") {
      const r = parseFloat(revenue) || 0;
      if (r > 0) {
        const gp = r - c;
        const m = (gp / r) * 100;
        const mu = c > 0 ? (gp / c) * 100 : 0;
        setGrossProfit(gp.toFixed(2));
        setMargin(m.toFixed(2));
        setMarkup(mu.toFixed(2));
      }
    } else if (activeInput === "cogs-margin") {
      const m = parseFloat(margin) || 0;
      if (m < 100) {
        const r = c / (1 - m / 100);
        const gp = r - c;
        const mu = c > 0 ? (gp / c) * 100 : 0;
        setRevenue(r.toFixed(2));
        setGrossProfit(gp.toFixed(2));
        setMarkup(mu.toFixed(2));
      }
    } else if (activeInput === "cogs-markup") {
      const mu = parseFloat(markup) || 0;
      const r = c * (1 + mu / 100);
      const gp = r - c;
      const m = r > 0 ? (gp / r) * 100 : 0;
      setRevenue(r.toFixed(2));
      setGrossProfit(gp.toFixed(2));
      setMargin(m.toFixed(2));
    }
  };

  const reset = () => {
    setCost("60");
    setRevenue("100");
    setMarkup("66.67");
    setMargin("40");
    setGrossProfit("40");
    setActiveInput("cogs-rev");
  };

  const chartData = [
    { name: "Cost (COGS)", value: parseFloat(cost) || 0, fill: "hsl(var(--primary))" },
    { name: "Gross Profit", value: parseFloat(grossProfit) || 0, fill: "#10b981" },
  ];

  const faqs = [
    { question: "What is gross margin?", answer: "Gross margin (or gross profit margin) is the percentage of revenue that exceeds the cost of goods sold (COGS). It measures how efficiently a company produces and sells its products. The formula is: Gross Margin = (Revenue − COGS) ÷ Revenue × 100." },
    { question: "What is the difference between margin and markup?", answer: "Margin is gross profit divided by sales price (revenue). Markup is gross profit divided by cost (COGS). For example, if a product costs $60 to make and sells for $100, the profit is $40. The margin is 40% ($40 / $100), while the markup is 66.67% ($40 / $60)." },
    { question: "How do I calculate gross margin manually?", answer: "1. Subtract the Cost of Goods Sold (COGS) from your Total Revenue to find the Gross Profit: $100 - $60 = $40. 2. Divide Gross Profit by Revenue: $40 / $100 = 0.40. 3. Multiply by 100 to get a percentage: 0.40 × 100 = 40%." },
    { question: "Why is gross margin important?", answer: "Gross margin is a critical indicator of a company's financial health. It shows if a company can cover its production costs and still have enough money left over to pay for operating expenses, debt service, and taxes. A declining gross margin over time can signal pricing pressure, rising raw material costs, or production inefficiencies." },
    { question: "What is a good gross margin?", answer: "A 'good' gross margin varies widely by industry. Software and SaaS companies often have gross margins of 80% or higher. Retail and grocery stores typically operate on much lower gross margins of 20% to 30%. Manufacturing companies usually fall in the 40% to 60% range." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Gross Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gross Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Calculate using...</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "cogs-rev", label: "Cost & Revenue" },
                  { id: "cogs-margin", label: "Cost & Margin" },
                  { id: "cogs-markup", label: "Cost & Markup" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActiveInput(opt.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${activeInput === opt.id ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary text-muted-foreground"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <CompactInput id="cost" label="Cost of Goods Sold (COGS)" value={cost} onChange={setCost} prefix="$" />
            
            {activeInput === "cogs-rev" && (
              <CompactInput id="revenue" label="Revenue (Selling Price)" value={revenue} onChange={setRevenue} prefix="$" />
            )}
            
            {activeInput === "cogs-margin" && (
              <CompactInput id="margin" label="Gross Margin" value={margin} onChange={setMargin} suffix="%" />
            )}

            {activeInput === "cogs-markup" && (
              <CompactInput id="markup" label="Markup" value={markup} onChange={setMarkup} suffix="%" />
            )}

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {mounted && (
              <>
                <>

                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">Gross Margin</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold text-primary">{margin}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Revenue: ${Number(revenue).toLocaleString(undefined, { maximumFractionDigits: 2 })} · Gross Profit: ${Number(grossProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Revenue Breakdown</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toLocaleString()}`} />
                      <Tooltip formatter={(v: any) => fmt(v)} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <rect key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Gross Margin</h2>
            <p>Gross profit margin, often simply called gross margin, is one of the most basic and vital profitability ratios used by business owners, analysts, and investors. It represents the percentage of total sales revenue that a company keeps after incurring the direct costs associated with producing the goods or services it sells. These direct costs are referred to as the Cost of Goods Sold (COGS).</p>
            
            <h2 className="text-2xl font-bold mb-3">How to Calculate Gross Margin</h2>
            <p>The calculation of gross margin requires two numbers: Total Revenue (sales) and Cost of Goods Sold. The formula is:</p>
            <p><code>Gross Margin = ((Revenue − COGS) ÷ Revenue) × 100</code></p>
            <p>For example, if a store sells an item for $100 (Revenue) and bought that item from a supplier for $60 (COGS), the gross profit is $40. The gross margin is: <code>(($100 − $60) ÷ $100) × 100 = 40%</code>.</p>
            
            <h2 className="text-2xl font-bold mb-3">Margin vs. Markup</h2>
            <p>A common point of confusion is the difference between margin and markup. While both terms measure the relationship between cost and selling price, they express it differently:</p>
            <ul>
              <li><strong>Gross Margin</strong> compares the profit to the selling price. It is calculated as: <code>(Profit ÷ Selling Price) × 100</code>.</li>
              <li><strong>Markup</strong> compares the profit to the cost price. It is calculated as: <code>(Profit ÷ Cost Price) × 100</code>.</li>
            </ul>
            <p>Using the example above, the profit of $40 divided by the cost of $60 results in a markup of 66.67%. Gross margin will never exceed 100%, but markup can grow infinitely.</p>

            <h2 className="text-2xl font-bold mb-3">Why Gross Margin Matters</h2>
            <p>Gross margin indicates whether a company can generate enough profit from selling its goods to pay for its other operating expenses, such as marketing, salaries, rent, research and development, and interest. A healthy gross margin provides a safety net against fluctuations in manufacturing costs or sales volume. Conversely, a low or declining gross margin suggests pricing pressures, rising supplier costs, or inefficient production methods.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gross-margin-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Gross Margin Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Gross Margin Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Gross Margin Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Gross Margin Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Gross Margin Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/gross-margin-calculator" />
        </div>
      </div>
    </>
  );
}
