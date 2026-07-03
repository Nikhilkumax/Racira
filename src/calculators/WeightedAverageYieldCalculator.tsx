"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

const fmt = (n: number, d = 4) => n.toFixed(d);

interface Bond { face: number; coupon: number; price: number; weight: number; yield: number; }

function calcWAY(bonds: Bond[]) {
  const totalValue = bonds.reduce((s, b) => s + b.price * b.weight, 0);
  if (totalValue === 0) return { way: 0, totalValue: 0, breakdown: [] };
  const way = bonds.reduce((s, b) => s + (b.yield * b.price * b.weight) / totalValue, 0);
  const breakdown = bonds.map(b => ({
    name: `Bond ${bonds.indexOf(b) + 1}`,
    yield: b.yield,
    weight: (b.price * b.weight) / totalValue * 100,
    contribution: (b.yield * b.price * b.weight) / totalValue,
  }));
  return { way, totalValue, breakdown };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">{label}</p>
    <p className="text-primary font-semibold">Yield: {payload[0]?.value?.toFixed(2)}%</p>
    <p className="text-muted-foreground">Weight: {payload[1]?.value?.toFixed(1)}%</p>
  </div>
) : null;

export default function WeightedAverageYieldCalculator() {
  const [bonds, setBonds] = useState([
    { face: "1000", coupon: "5", price: "980", weight: "100", yield: "5.20" },
    { face: "1000", coupon: "7", price: "1050", weight: "150", yield: "6.50" },
    { face: "1000", coupon: "4", price: "960", weight: "75", yield: "4.50" },
  ]);
  const [res, setRes] = useState<ReturnType<typeof calcWAY> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);

  const parsedBonds = (): Bond[] => bonds.map(b => ({
    face: parseFloat(b.face) || 1000,
    coupon: parseFloat(b.coupon) || 0,
    price: parseFloat(b.price) || 1000,
    weight: parseFloat(b.weight) || 0,
    yield: parseFloat(b.yield) || 0,
  }));

  const run = () => setRes(calcWAY(parsedBonds()));

  const updateBond = (i: number, field: keyof typeof bonds[0], val: string) => {
    const nb = [...bonds]; nb[i] = { ...nb[i], [field]: val }; setBonds(nb);
  };

  const reset = () => {
    setBonds([
      { face: "1000", coupon: "5", price: "980", weight: "100", yield: "5.20" },
      { face: "1000", coupon: "7", price: "1050", weight: "150", yield: "6.50" },
      { face: "1000", coupon: "4", price: "960", weight: "75", yield: "4.50" },
    ]);
    setRes(calcWAY([{ face: 1000, coupon: 5, price: 980, weight: 100, yield: 5.20 }, { face: 1000, coupon: 7, price: 1050, weight: 150, yield: 6.50 }, { face: 1000, coupon: 4, price: 960, weight: 75, yield: 4.50 }]));
  };

  const faqs = [
    { question: "What is Weighted Average Yield?", answer: "Weighted Average Yield (WAY) is the portfolio yield that accounts for both individual bond yields and their relative value (price × quantity). WAY = Σ(Yield_i × Value_i) / Total Portfolio Value. It gives more weight to larger positions, providing an accurate picture of a portfolio's overall income generation." },
    { question: "How is WAY different from a simple average yield?", answer: "Simple average weights each bond equally. WAY weights by market value. If you hold 100 units of a 4% bond and 10 units of a 7% bond, simple average = 5.5%. But WAY = (100×4% + 10×7%) / 110 = 4.27%, accurately reflecting that most of your money is in the lower-yield bond." },
    { question: "What inputs do I need for WAY calculation?", answer: "You need: the yield (YTM or coupon rate) for each holding, and the market value or quantity of each holding. Market value = price × quantity. The weight of each holding is its market value as a percentage of the total portfolio value." },
    { question: "What is a good WAY for a bond portfolio?", answer: "This depends entirely on the interest rate environment and risk tolerance. In 2024's high-rate environment, short-term Treasuries yielded 5%+. A conservative portfolio might target 4-5% WAY; a higher-risk portfolio might target 6-8%+ by including corporate or high-yield bonds." },
    { question: "Can WAY be applied to non-bond assets?", answer: "Yes — the weighted average yield concept applies to any income-generating portfolio: dividend stocks (using dividend yield), REITs, preferred stocks, or mixed portfolios. Simply replace 'bond yield' with 'income yield' for each position." },
  ];

  const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Weighted Average Yield Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weighted Average Yield Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Portfolio Holdings</h2>
            {bonds.map((b, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-secondary/10">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Bond / Holding {i + 1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <CI id={`y${i}`} label="Yield (%)" value={b.yield} onChange={v => updateBond(i, "yield", v)} suffix="%" />
                  <CI id={`p${i}`} label="Price" value={b.price} onChange={v => updateBond(i, "price", v)} prefix="$" />
                  <CI id={`w${i}`} label="Quantity (units)" value={b.weight} onChange={v => updateBond(i, "weight", v)} />
                </div>
              </div>
            ))}
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Portfolio Yield</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Weighted Average Yield</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(res.way)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Portfolio Value: ${res.totalValue.toLocaleString()}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Holding</th><th className="p-2 text-right">Yield</th><th className="p-2 text-right">Weight</th><th className="p-2.5 pr-3 text-right">Contribution</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {res.breakdown.map((r, i) => (
                        <tr key={i} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-semibold">{r.name}</td>
                          <td className="p-2 text-right">{fmt(r.yield)}%</td>
                          <td className="p-2 text-right">{r.weight.toFixed(1)}%</td>
                          <td className="p-2.5 pr-3 text-right">{fmt(r.contribution)}%</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 border-t border-border">
                        <td className="p-2.5 pl-3">Portfolio Total</td>
                        <td className="p-2 text-right" colSpan={2}>100%</td>
                        <td className="p-2.5 pr-3 text-right">{fmt(res.way)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">Yield by Holding</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={190}>
                      <BarChart data={res.breakdown} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toFixed(1)}%`} />
                        <Tooltip content={<TTip />} />
                        <Bar dataKey="yield" radius={[4, 4, 0, 0]} name="Yield">
                          {res.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                        <Bar dataKey="weight" radius={[4, 4, 0, 0]} name="Weight %" fill="hsl(var(--primary)/0.3)" />
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    { label: "WAY", value: `${fmt(res.way)}%` },
                    { label: "Holdings", value: `${bonds.length}` },
                    { label: "Portfolio Value", value: `$${res.totalValue.toLocaleString()}` },
                    { label: "Highest Yield", value: `${fmt(Math.max(...parsedBonds().map(b => b.yield)))}%` },
                    { label: "Lowest Yield", value: `${fmt(Math.min(...parsedBonds().map(b => b.yield)))}%` },
                    { label: "Spread", value: `${fmt(Math.max(...parsedBonds().map(b => b.yield)) - Math.min(...parsedBonds().map(b => b.yield)))}%` },
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Weighted Average Yield?</h2>
            <p>Weighted Average Yield (WAY) is the portfolio-level yield that accounts for the relative market value of each holding. Unlike a simple arithmetic average, WAY assigns more influence to larger positions — accurately reflecting the true income-generating capacity of a portfolio. The formula is WAY = Σ(Yield_i × Market Value_i) / Total Portfolio Value.</p>
            <p>Fixed income portfolio managers, bond fund analysts, and institutional investors use WAY daily to measure portfolio income efficiency, compare against benchmark indices, and track yield trends over time. A rising WAY suggests the portfolio is being repositioned toward higher-yielding (typically higher-risk) instruments; a falling WAY suggests a flight to quality or interest rate decline.</p>
            <h2>Yield Weighting vs Equal Weighting</h2>
            <p>The difference between equal-weighted and value-weighted yield can be substantial. In a portfolio of 90% investment-grade bonds yielding 4% and 10% high-yield bonds yielding 9%, the equal-weighted average would be 6.5% — a misleading figure suggesting far more high-yield exposure than actually exists. The WAY of 4.5% correctly reflects the portfolio's income profile and risk character.</p>
            <h2>Applications in Portfolio Management</h2>
            <p>WAY is used to benchmark against indices (e.g., Bloomberg US Aggregate Bond Index yield), measure pickup from switching between securities, monitor portfolio duration alongside yield, and report portfolio income to clients and stakeholders. Bond ladder managers use WAY to ensure they maintain target yield levels as bonds mature and are reinvested. ETF managers disclose WAY (as SEC 30-Day Yield) to enable investor comparisons.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weighted-average-yield-calculator" />
          <PopularCalculators exclude="/calculator/weighted-average-yield-calculator" />
        </div>
      </div>
    </>
  );
}
