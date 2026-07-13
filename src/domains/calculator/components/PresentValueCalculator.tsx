"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

export default function PresentValueCalculator() {
  const [fv, setFv] = useState("10000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [compound, setCompound] = useState("12");
  const [res, setRes] = useState<{ pv: number; discount: number; factor: number; chartData: { year: number; pv: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const F = parseFloat(fv) || 0;
    const r = parseFloat(rate) / 100;
    const n = parseFloat(years) || 0;
    const m = parseFloat(compound) || 12;
    const pv = F / Math.pow(1 + r / m, m * n);
    const discount = F - pv;
    const factor = pv / F;
    const chartData = Array.from({ length: Math.ceil(n) + 1 }, (_, i) => ({
      year: i,
      pv: +(F / Math.pow(1 + r / m, m * i)).toFixed(2),
    }));
    setRes({ pv, discount, factor, chartData });
  };

  const reset = () => { setFv("10000"); setRate("8"); setYears("10"); setCompound("12"); };

  const faqs = [
    { question: "What is Present Value (PV)?", answer: "Present Value is the current worth of a future sum of money, discounted at a specific interest rate to reflect the time value of money. $10,000 received 10 years from now is worth less than $10,000 today because money today can be invested and grown. PV tells you exactly how much less it's worth today." },
    { question: "What is the Present Value formula?", answer: "PV = FV ÷ (1 + r/n)^(n×t), where FV is the future value, r is the annual interest rate (decimal), n is the number of compounding periods per year, and t is the time in years. For annual compounding (n=1): PV = FV ÷ (1 + r)^t." },
    { question: "What is the discount rate?", answer: "The discount rate is the interest rate used to bring future cash flows back to their present value. It represents your opportunity cost — what you could earn by investing the money elsewhere. Higher discount rates result in lower present values, reflecting that future money is worth less when you have better investment alternatives." },
    { question: "How does compounding frequency affect Present Value?", answer: "More frequent compounding (daily vs annually) slightly reduces the present value. For example, $10,000 at 8% for 10 years: annual compounding gives PV = $4,632. Monthly compounding gives PV = $4,520. The difference grows with higher rates and longer time periods." },
    { question: "What is the difference between PV and NPV?", answer: "Present Value (PV) discounts a single future cash flow to today's dollars. Net Present Value (NPV) sums the present values of multiple future cash flows and subtracts the initial investment. NPV is used for evaluating entire projects, while PV is often used for a single future payment." },
    { question: "When is Present Value used in real life?", answer: "PV is used in many practical scenarios: valuing lottery winnings (lump sum vs annuity), comparing lease vs buy decisions, pricing bonds (sum of PV of all future coupon payments), setting insurance premiums, valuing businesses through DCF analysis, and determining the worth of retirement accounts and pension benefits." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Present Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Present Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            <CompactInput id="fv" label="Future Value (FV)" value={fv} onChange={setFv} prefix="$" />
            <CompactInput id="rate" label="Annual Discount Rate" value={rate} onChange={setRate} suffix="%" />
            <CompactInput id="years" label="Time Period" value={years} onChange={setYears} suffix="years" />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Compounding Frequency</span>
              <div className="grid grid-cols-2 gap-2">
                {[["1", "Annual"], ["2", "Semi-Annual"], ["4", "Quarterly"], ["12", "Monthly"]].map(([v, label]) => (
                  <button key={v} type="button" onClick={() => setCompound(v)} className={`py-2 text-sm font-semibold rounded-md border transition-colors ${compound === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{label}</button>
                ))}
              </div>
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
                  <h2 className="text-2xl font-bold mb-3">Results</h2>
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Present Value</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(res.pv)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Discount: {fmt(res.discount)} · PV Factor: {res.factor.toFixed(4)}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Future Value", value: fmt(parseFloat(fv) || 0) },
                        { label: "Present Value", value: fmt(res.pv) },
                        { label: "Discount Amount", value: fmt(res.discount) },
                        { label: "PV / FV Factor", value: res.factor.toFixed(6) },
                        { label: "Effective Annual Rate", value: fmtPct((Math.pow(1 + parseFloat(rate) / 100 / parseFloat(compound), parseFloat(compound)) - 1) * 100) },
                      ].map(r => (
                        <tr key={r.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 text-muted-foreground font-semibold">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">PV Decay Over Time</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" label={{ value: "Years from Now", position: "insideBottom", offset: -2, fontSize: 10 }} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmt(v)} labelFormatter={l => `Year ${l}`} />
                        <Line type="monotone" dataKey="pv" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Present Value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "Years", value: years },
                    { label: "Discount Rate", value: `${rate}%` },
                    { label: "Compounding", value: ["Annual", "Semi-Annual", "Quarterly", "Monthly"][["1", "2", "4", "12"].indexOf(compound)] },
                    { label: "Total Discount", value: fmtPct((1 - res.factor) * 100) },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Present Value?</h2>
            <p>Present Value (PV) is one of the most fundamental concepts in finance and investing. It answers a simple but powerful question: how much is a future sum of money worth today? The answer depends on the discount rate — the rate of return you could earn if you invested that money right now.</p>
            <p>The principle behind present value is the time value of money: a dollar today is worth more than a dollar in the future. Why? Because money today can be invested to generate returns, while future money carries both inflation risk and opportunity cost. If you can earn 8% per year, receiving $10,000 in 10 years is equivalent to having $4,632 today — the present value at an 8% discount rate.</p>

            <h2 className="text-2xl font-bold mb-3">The Present Value Formula Explained</h2>
            <p>The core formula for calculating present value is: PV = FV ÷ (1 + r/n)^(n×t). Where: FV = future value (the amount you'll receive in the future), r = annual discount/interest rate (as a decimal), n = number of compounding periods per year, t = time in years. The (1 + r/n)^(n×t) portion is called the discount factor or present value interest factor (PVIF).</p>
            <p>For example, to find the present value of $10,000 received in 10 years with an 8% annual rate compounded monthly: PV = $10,000 ÷ (1 + 0.08/12)^(12×10) = $10,000 ÷ (1.006667)^120 = $10,000 ÷ 2.2196 = $4,505.84.</p>

            <h2 className="text-2xl font-bold mb-3">Choosing the Right Discount Rate</h2>
            <p>The discount rate is the critical variable in present value calculations. It should represent the opportunity cost of capital — the best available alternative return for that level of risk. Common choices include: risk-free rate (U.S. Treasury yield, currently around 4–5%), weighted average cost of capital (WACC) for business projects, expected market return (historically 7–10% for equities), or a risk-adjusted hurdle rate for specific investments. Higher discount rates produce lower present values, reflecting that high-return opportunities make future money less valuable today.</p>

            <h2 className="text-2xl font-bold mb-3">Present Value in Real-World Decisions</h2>
            <p>PV analysis drives countless financial decisions: lottery winners choosing between lump sum and annuity payments, businesses evaluating capital projects using discounted cash flow (DCF), bond pricing (summing PV of all future coupon payments and principal), lease vs. buy comparisons, pension and retirement planning, real estate valuation, and insurance premium calculations. Any time you need to compare money received at different points in time, present value provides the common currency for comparison.</p>

            <h2 className="text-2xl font-bold mb-3">Present Value vs Net Present Value</h2>
            <p>Present Value discounts a single future cash flow. Net Present Value (NPV) extends this to multiple cash flows: it sums the present values of all future cash inflows and outflows, then subtracts the initial investment. A positive NPV means the investment creates value above the required return; a negative NPV destroys value. NPV is the gold standard for capital budgeting decisions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/present-value-calculator" />
          <PopularCalculators exclude="/calculator/present-value-calculator" />
        </div>
      </div>
    </>
  );
}
