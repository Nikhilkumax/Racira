"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
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

const fmtVal = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default function BusinessValuationCalculator() {
  const [earnings, setEarnings] = useState("500000");
  const [growth, setGrowth] = useState("6.0");
  const [discountRate, setDiscountRate] = useState("10.0");
  const [multiplier, setMultiplier] = useState("8.0");
  const [assets, setAssets] = useState("2500000");
  const [liabilities, setLiabilities] = useState("1000000");

  const [res, setRes] = useState<{
    dcfVal: number;
    multVal: number;
    assetVal: number;
    blendedVal: number;
    chartData: { name: string; value: number }[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const earn = parseFloat(earnings) || 0;
    const g = (parseFloat(growth) || 0) / 100;
    const r = (parseFloat(discountRate) || 0) / 100;
    const m = parseFloat(multiplier) || 0;
    const ass = parseFloat(assets) || 0;
    const liab = parseFloat(liabilities) || 0;

    // 1. DCF Valuation (5 year projections + terminal value)
    let pvSum = 0;
    let currentFlow = earn;
    for (let year = 1; year <= 5; year++) {
      currentFlow *= (1 + g);
      pvSum += currentFlow / Math.pow(1 + r, year);
    }
    // Terminal value assuming terminal growth rate of 2%
    const terminalGrowth = 0.025;
    const terminalValue = r > terminalGrowth ? (currentFlow * (1 + terminalGrowth)) / (r - terminalGrowth) : 0;
    const pvTerminal = terminalValue / Math.pow(1 + r, 5);
    const dcfVal = pvSum + pvTerminal;

    // 2. Earnings Multiplier Valuation
    const multVal = earn * m;

    // 3. Asset-Based Valuation
    const assetVal = Math.max(0, ass - liab);

    // 4. Blended average valuation
    const blendedVal = (dcfVal + multVal + assetVal) / 3;

    const chartData = [
      { name: "DCF Model", value: dcfVal },
      { name: "Multiplier", value: multVal },
      { name: "Asset-Based", value: assetVal },
      { name: "Blended Avg", value: blendedVal },
    ];

    setRes({ dcfVal, multVal, assetVal, blendedVal, chartData });
  };

  const reset = () => {
    setEarnings("500000");
    setGrowth("6.0");
    setDiscountRate("10.0");
    setMultiplier("8.0");
    setAssets("2500000");
    setLiabilities("1000000");
  };

  const faqs = [
    { question: "What is the Discounted Cash Flow (DCF) method?", answer: "The DCF method values a business by projecting its future cash flows and discounting them back to present value using a discount rate (typically WACC). It is considered the most theoretically sound valuation model because it captures the business's future growth potential and the time value of money." },
    { question: "What is the Earnings Multiplier method?", answer: "The earnings multiplier method estimates business value by applying a multiple to its current earnings (often EBITDA, SDE, or Net Income). The multiple represents how many years of earnings an buyer is willing to pay upfront. Small businesses typically trade at 2x to 5x multipliers, while larger public corporations can trade at 15x to 30x+ multipliers depending on growth and risk." },
    { question: "What is the Asset-Based valuation method?", answer: "Asset-based valuation calculates the net asset value (NAV) of a business by subtracting total liabilities from total assets. It is a liquidation-value baseline, useful for asset-heavy firms or businesses that are not currently profitable but own valuable property, inventory, or equipment." },
    { question: "How should I choose the discount rate?", answer: "The discount rate represents the hurdle rate or required rate of return. A higher discount rate represents higher investment risk. For small private businesses, discount rates typically range from 15% to 25% to account for risk, illiquidity, and size. For larger, stable enterprises, 8% to 12% is common." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Business Valuation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Business Valuation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Business Financials</h2>
            <CompactInput id="earn" label="Annual Earnings (EBITDA / Net Income)" value={earnings} onChange={setEarnings} prefix="$" />
            <CompactInput id="g" label="Expected Growth Rate (Next 5 Years)" value={growth} onChange={setGrowth} suffix="%" />
            <CompactInput id="dr" label="Discount Rate / Hurdle Rate" value={discountRate} onChange={setDiscountRate} suffix="%" />
            <CompactInput id="mult" label="Earnings Multiplier (e.g., 5x, 10x)" value={multiplier} onChange={setMultiplier} suffix="x" />
            
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <span className="text-sm font-semibold text-foreground">Balance Sheet Assets</span>
              <CompactInput id="ass" label="Total Market Value of Assets" value={assets} onChange={setAssets} prefix="$" />
              <CompactInput id="liab" label="Total Liabilities" value={liabilities} onChange={setLiabilities} prefix="$" />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Valuation Summary</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Blended Valuation Estimate</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">{fmtVal(res.blendedVal)}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Valuation Method</th><th className="p-2.5 pr-3 text-right">Value Estimate</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Discounted Cash Flow (DCF)", value: fmtVal(res.dcfVal) },
                        { label: "Earnings Multiplier", value: fmtVal(res.multVal) },
                        { label: "Asset-Based (Net Asset Value)", value: fmtVal(res.assetVal) },
                        { label: "Blended Valuation (Average)", value: fmtVal(res.blendedVal), bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Model Comparison</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmtVal(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Business Valuation</h2>
            <p>Business valuation is the process of determining the economic value of a whole business or company unit. It is used to establish the fair value of a business for sale, merger, acquisition, partner buyouts, tax reporting, or capital allocation. A thorough valuation typically employs multiple methodologies to establish a realistic valuation range rather than relying on a single approach.</p>
            
            <h2 className="text-2xl font-bold mb-3">Valuation Methods Compared</h2>
            <h3>1. Discounted Cash Flow (DCF) Method</h3>
            <p>The DCF method calculates the present value of the business's projected future cash flows. Projections are discounted using a rate that reflects the investment hurdle or risk. In addition, a terminal value is computed to estimate the value of the firm's cash flows beyond the projection window (e.g., Year 6 and onwards).</p>

            <h3>2. Earnings Multiplier Method</h3>
            <p>This model is popular for small to mid-sized businesses. It multiples earnings (EBITDA or Seller's Discretionary Earnings) by an industry multiple. Riskier, smaller businesses command low multiples (2x to 4x), while fast-growing tech firms command higher multiples (10x to 30x+).</p>

            <h3>3. Asset-Based Method</h3>
            <p>Calculates the Net Asset Value (NAV) of a firm by taking Total Fair Market Value of Assets and subtracting Total Liabilities. This reflects the liquidation value or tangible value floor of the enterprise.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/business-valuation-calculator" />
          <PopularCalculators exclude="/calculator/business-valuation-calculator" />
        </div>
      </div>
    </>
  );
}
