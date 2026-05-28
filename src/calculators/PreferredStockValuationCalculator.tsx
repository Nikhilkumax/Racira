"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const CI = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : Math.abs(n) >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

function calcPSV(annualDividend: number, requiredReturn: number, growthRate: number) {
  const r = requiredReturn / 100;
  const g = growthRate / 100;
  if (r <= g && g > 0) return { valuePerShare: 0, dividendYield: 0, currentYield: 0, error: "Required return must exceed growth rate" };
  const valuePerShare = g > 0 ? annualDividend / (r - g) : annualDividend / r;
  const dividendYield = valuePerShare > 0 ? (annualDividend / valuePerShare) * 100 : 0;
  const currentYield = requiredReturn;
  return { valuePerShare, dividendYield, currentYield, error: null };
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b"];

export default function PreferredStockValuationCalculator() {
  const [dividend, setDividend] = useState("5.50");
  const [requiredReturn, setRequiredReturn] = useState("7");
  const [growthRate, setGrowthRate] = useState("0");
  const [parValue, setParValue] = useState("100");
  const [marketPrice, setMarketPrice] = useState("78.57");
  const [res, setRes] = useState<ReturnType<typeof calcPSV> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);

  const run = () => setRes(calcPSV(parseFloat(dividend) || 0, parseFloat(requiredReturn) || 7, parseFloat(growthRate) || 0));
  const reset = () => {
    setDividend("5.50"); setRequiredReturn("7"); setGrowthRate("0"); setParValue("100"); setMarketPrice("78.57");
    setRes(calcPSV(5.50, 7, 0));
  };

  const market = parseFloat(marketPrice) || 0;

  const faqs = [
    { question: "What is preferred stock valuation?", answer: "Preferred stocks pay fixed dividends like bonds but represent equity ownership. Valuation uses a dividend discount model: Value = Annual Dividend / Required Return (for zero growth). For growing dividends: Value = D / (r - g). This gives the intrinsic value you should pay for the stock given your required return." },
    { question: "How does required return affect preferred stock value?", answer: "Required return and value move inversely — exactly like bond prices and interest rates. If required return rises from 7% to 8%, a $5.50/yr dividend stock falls from $78.57 to $68.75. This is why preferred stocks lose value when interest rates rise, making them more bond-like than common equity." },
    { question: "What is the difference between cumulative and non-cumulative preferred?", answer: "Cumulative preferred stocks accumulate unpaid dividends (called arrears) — if dividends are skipped, they must all be paid before common shareholders receive anything. Non-cumulative preferred loses any skipped dividends permanently. Cumulative preferred is more valuable due to this protection." },
    { question: "How do I find the required return for preferred stock?", answer: "Required return should reflect the risk premium over risk-free rates. For investment-grade preferred, this is typically the 10-year Treasury yield + 1-3% spread. For lower-quality preferred, add 3-6%+. Alternatively, use the dividend yield of comparable preferred stocks as a market-implied required return." },
    { question: "What is the relationship between preferred stock and bonds?", answer: "Preferred stock has higher risk than investment-grade bonds (dividends can be suspended; bonds must pay interest) but lower risk than common equity (preferred gets paid first in liquidation). This is why preferred yields typically fall between investment-grade bond yields and common stock dividend yields for the same company." },
    { question: "Can preferred stock have growing dividends?", answer: "Some preferred stocks have adjustable or step-up dividends that increase over time. Perpetual preferred with a constant growth rate g uses the Gordon Growth Model: Value = D / (r - g). Most traditional preferred stocks have fixed dividends (g = 0), but hybrid structures are increasingly common in modern capital markets." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Preferred Stock Valuation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Preferred Stock Valuation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold pb-2 border-b border-border">Stock Parameters</h2>
            <CI id="div" label="Annual Dividend Per Share" value={dividend} onChange={setDividend} prefix="$" />
            <div className="grid grid-cols-2 gap-4">
              <CI id="req" label="Required Return" value={requiredReturn} onChange={setRequiredReturn} suffix="%" />
              <CI id="g" label="Dividend Growth Rate" value={growthRate} onChange={setGrowthRate} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="par" label="Par Value" value={parValue} onChange={setParValue} prefix="$" />
              <CI id="mkt" label="Current Market Price" value={marketPrice} onChange={setMarketPrice} prefix="$" />
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && !res.error && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold">Valuation Results</h2>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className={`rounded-xl p-5 text-center border ${res.valuePerShare >= market && market > 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Intrinsic Value Per Share</div>
                  <div className="text-4xl font-extrabold tracking-tight">${fmt(res.valuePerShare)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Market: ${fmt(market)} · {market > 0 ? (res.valuePerShare >= market ? <span className="text-green-500 font-bold">Undervalued</span> : <span className="text-red-500 font-bold">Overvalued</span>) : "Enter market price to compare"}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { l: "Annual Dividend", v: `$${fmt(parseFloat(dividend) || 0)}` },
                        { l: "Required Return", v: `${requiredReturn}%` },
                        { l: "Growth Rate", v: `${growthRate}%` },
                        { l: "Intrinsic Value", v: `$${fmt(res.valuePerShare)}`, b: true },
                        { l: "Market Price", v: `$${fmt(market)}` },
                        { l: "Premium / Discount", v: market > 0 ? `${fmt((res.valuePerShare / market - 1) * 100)}%` : "N/A" },
                        { l: "Dividend Yield (at intrinsic)", v: `${fmt(res.dividendYield)}%` },
                        { l: "Par Ratio", v: `${fmt((parseFloat(parValue) || 100) / res.valuePerShare * 100)}%` },
                      ].map(r => (
                        <tr key={r.l} className={`hover:bg-secondary/20 ${r.b ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.l}</td>
                          <td className="p-2.5 pr-3 text-right">{r.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">Value vs Market Price vs Par Value</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={[
                        { name: "Intrinsic Value", value: res.valuePerShare, fill: "hsl(var(--primary))" },
                        { name: "Market Price", value: market, fill: "#10b981" },
                        { name: "Par Value", value: parseFloat(parValue) || 100, fill: "#f59e0b" },
                      ]} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                        <Tooltip formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[0, 1, 2].map(i => <Cell key={i} fill={COLORS[i]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    { label: "Intrinsic Value", value: `$${fmt(res.valuePerShare)}` },
                    { label: "Dividend Yield", value: `${fmt(res.dividendYield)}%` },
                    { label: "Annual Dividend", value: `$${fmt(parseFloat(dividend) || 0)}` },
                    { label: "Required Return", value: `${requiredReturn}%` },
                    { label: "Growth Rate", value: `${growthRate}%` },
                    { label: "Premium/(Disc)", value: market > 0 ? `${fmt((res.valuePerShare / market - 1) * 100)}%` : "N/A" },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>What Is Preferred Stock Valuation?</h2>
            <p>Preferred stock is a hybrid security combining features of both bonds (fixed dividends) and equity (ownership claim). Valuation uses a Dividend Discount Model adapted for perpetuities. For non-growing preferred stock: Intrinsic Value = Annual Dividend ÷ Required Return. For growing preferred: Value = Dividend ÷ (Required Return − Growth Rate), which is the Gordon Growth Model.</p>
            <p>Preferred stockholders receive dividends before common shareholders and have priority claims in liquidation. However, dividends can be suspended without triggering default (unlike bond interest), and preferred holders typically don't vote on corporate matters. This risk profile places preferred stock between investment-grade bonds and common equity in the capital structure hierarchy.</p>
            <h2>Comparing Intrinsic Value to Market Price</h2>
            <p>The power of this calculator lies in comparison: if the intrinsic value ($78.57) exceeds the current market price ($65), the stock is undervalued — you'd earn more than your required return. If intrinsic value is below market price, you'd earn less than required — the stock is overvalued relative to your targets. This framework is identical to how bond investors analyze yield to maturity vs. required yield.</p>
            <h2>Types of Preferred Stock</h2>
            <p>Cumulative preferred accumulates unpaid dividends (arrears) and must pay all arrears before common dividends resume — more valuable than non-cumulative. Convertible preferred can be exchanged for common shares at a preset ratio — more complex to value. Adjustable-rate preferred has dividends tied to a benchmark rate. Participating preferred shares in excess profits alongside common dividends. Each type requires different valuation adjustments, with this calculator covering standard fixed-rate perpetual preferred most accurately.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/preferred-stock-valuation-calculator" />
          <PopularCalculators exclude="/calculator/preferred-stock-valuation-calculator" />
        </div>
      </div>
    </>
  );
}
