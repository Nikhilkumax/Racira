"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function WaccCalculator() {
  const [equity, setEquity] = useState("60000000");
  const [debt, setDebt] = useState("40000000");
  const [costEquityMode, setCostEquityMode] = useState<"direct" | "capm">("direct");
  const [costEquity, setCostEquity] = useState("8.5");
  // CAPM Inputs
  const [riskFree, setRiskFree] = useState("3.5");
  const [beta, setBeta] = useState("1.1");
  const [marketPremium, setMarketPremium] = useState("5.5");
  
  const [costDebt, setCostDebt] = useState("5.0");
  const [taxRate, setTaxRate] = useState("21.0");

  const [res, setRes] = useState<{
    wacc: number;
    eqWeight: number;
    dtWeight: number;
    calcCostEquity: number;
    afterTaxCostDebt: number;
    totalValue: number;
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const eq = parseFloat(equity) || 0;
    const dt = parseFloat(debt) || 0;
    const tot = eq + dt;

    let ce = parseFloat(costEquity) || 0;
    if (costEquityMode === "capm") {
      const rf = parseFloat(riskFree) || 0;
      const b = parseFloat(beta) || 0;
      const mp = parseFloat(marketPremium) || 0;
      ce = rf + b * mp;
    }

    const cd = parseFloat(costDebt) || 0;
    const tax = parseFloat(taxRate) || 0;

    const eqWeight = tot > 0 ? eq / tot : 0;
    const dtWeight = tot > 0 ? dt / tot : 0;
    const afterTaxCostDebt = cd * (1 - tax / 100);

    const wacc = (eqWeight * ce) + (dtWeight * afterTaxCostDebt);

    setRes({
      wacc,
      eqWeight: eqWeight * 100,
      dtWeight: dtWeight * 100,
      calcCostEquity: ce,
      afterTaxCostDebt,
      totalValue: tot,
    });
  };

  const reset = () => {
    setEquity("60000000");
    setDebt("40000000");
    setCostEquityMode("direct");
    setCostEquity("8.5");
    setRiskFree("3.5");
    setBeta("1.1");
    setMarketPremium("5.5");
    setCostDebt("5.0");
    setTaxRate("21.0");
  };

  const chartData = res ? [
    { name: "Equity Weight", value: res.eqWeight, color: "hsl(var(--primary))" },
    { name: "Debt Weight", value: res.dtWeight, color: "#10b981" }
  ] : [];

  const faqs = [
    { question: "What is WACC?", answer: "Weighted Average Cost of Capital (WACC) represents a firm's average cost of capital from all sources, including common stock, preferred stock, and debt. It is the average rate a company expects to pay to finance its assets. WACC is commonly used as the discount rate for Net Present Value (NPV) analyses and corporate valuation." },
    { question: "What is the CAPM formula for cost of equity?", answer: "The Capital Asset Pricing Model (CAPM) formula is: Cost of Equity = Risk-Free Rate + (Beta × Market Risk Premium). For example, if the risk-free rate is 3%, beta is 1.2, and market risk premium is 5%, the cost of equity is 3% + (1.2 × 5%) = 9%." },
    { question: "Why is the cost of debt adjusted for taxes?", answer: "Interest payments on debt are tax-deductible in most jurisdictions. This creates a 'tax shield' that reduces the actual cost of debt to the company. The after-tax cost of debt is calculated as: Cost of Debt × (1 − Tax Rate). Equity dividends are not tax-deductible, so the cost of equity is not adjusted for taxes." },
    { question: "How does capital structure affect WACC?", answer: "Debt is generally cheaper than equity because it is less risky for investors (debt holders are paid first) and its interest is tax-deductible. Therefore, adding debt to the capital structure usually lowers WACC. However, too much debt increases financial distress and bankruptcy risk, which causes both lenders and equity investors to demand higher returns, eventually driving WACC back up." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "WACC Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">WACC Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Capital Structure Inputs</h2>
            <CompactInput id="eq" label="Total Market Value of Equity" value={equity} onChange={setEquity} prefix="$" />
            <CompactInput id="dt" label="Total Market Value of Debt" value={debt} onChange={setDebt} prefix="$" />

            <div className="border-t border-border pt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Cost of Equity Calculation</span>
                <div className="flex border border-border rounded-md overflow-hidden text-xs">
                  <button type="button" onClick={() => setCostEquityMode("direct")} className={`px-2.5 py-1 font-bold ${costEquityMode === "direct" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Direct</button>
                  <button type="button" onClick={() => setCostEquityMode("capm")} className={`px-2.5 py-1 font-bold ${costEquityMode === "capm" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>CAPM</button>
                </div>
              </div>

              {costEquityMode === "direct" ? (
                <CompactInput id="ce" label="Cost of Equity" value={costEquity} onChange={setCostEquity} suffix="%" />
              ) : (
                <div className="flex flex-col gap-3 bg-secondary/20 p-3 rounded-lg border border-border">
                  <CompactInput id="rf" label="Risk-Free Rate" value={riskFree} onChange={setRiskFree} suffix="%" />
                  <CompactInput id="b" label="Equity Beta" value={beta} onChange={setBeta} />
                  <CompactInput id="mp" label="Market Risk Premium" value={marketPremium} onChange={setMarketPremium} suffix="%" />
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <CompactInput id="cd" label="Cost of Debt (Pre-Tax)" value={costDebt} onChange={setCostDebt} suffix="%" />
              <CompactInput id="tax" label="Corporate Tax Rate" value={taxRate} onChange={setTaxRate} suffix="%" />
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
                  <h2 className="text-2xl font-bold mb-3">WACC Breakdown</h2>
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Weighted Average Cost of Capital (WACC)</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">{fmtPct(res.wacc)}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-sm">
                      <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Component</th><th className="p-2.5 pr-3 text-right">Value</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border/50">
                        {[
                          { label: "Cost of Equity", value: fmtPct(res.calcCostEquity) },
                          { label: "Cost of Debt (Pre-Tax)", value: fmtPct(parseFloat(costDebt) || 0) },
                          { label: "After-Tax Cost of Debt", value: fmtPct(res.afterTaxCostDebt) },
                          { label: "Equity Weight", value: fmtPct(res.eqWeight) },
                          { label: "Debt Weight", value: fmtPct(res.dtWeight) },
                          { label: "Total Capital Value", value: fmtVal(res.totalValue) },
                        ].map(r => (
                          <tr key={r.label} className="hover:bg-secondary/20">
                            <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                            <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {mounted && (<>

                    <div className="p-4 rounded-xl border border-border bg-card flex flex-col items-center justify-center min-h-[200px]">
                      <h3 className="text-xs font-bold text-foreground mb-2 self-start">Capital Structure Weights</h3>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} fill="hsl(var(--primary))" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                            {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => fmtPct(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  
</>)}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Weighted Average Cost of Capital (WACC)</h2>
            <p>The Weighted Average Cost of Capital (WACC) is a financial metric used to calculate a company's cost of capital. It represents the minimum rate of return a company must earn on its existing asset base to satisfy its creditors, owners, and other providers of capital. If a company's investments yield returns below its WACC, it is destroying corporate value.</p>
            
            <h2>The WACC Formula</h2>
            <p>WACC is calculated by multiplying the cost of each capital component (equity and debt) by its proportional weight in the overall capital structure, and summing the results:</p>
            <p><code>WACC = (E/V × Re) + (D/V × Rd × (1 − T))</code></p>
            <p>Where E is the market value of equity, D is the market value of debt, V is the total capital (E + D), Re is the cost of equity, Rd is the pre-tax cost of debt, and T is the corporate tax rate.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wacc-calculator" />
          <PopularCalculators exclude="/calculator/wacc-calculator" />
        </div>
      </div>
    </>
  );
}
