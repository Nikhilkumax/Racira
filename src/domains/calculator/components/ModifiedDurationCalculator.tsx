"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DurResult {
  price: number;
  macaulay: number;
  modified: number;
  change100: number;
  changeMinus100: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcDur(face: number, couponPct: number, ytmPct: number, years: number, perYear: number): DurResult {
  const coupon = (couponPct / 100) * face / perYear;
  const y = ytmPct / 100 / perYear;
  const n = years * perYear;
  let price = 0;
  let weighted = 0;
  const cf: { period: number; pv: number }[] = [];
  for (let t = 1; t <= n; t++) {
    const c = t === n ? coupon + face : coupon;
    const pv = c / Math.pow(1 + y, t);
    price += pv;
    weighted += pv * t;
    cf.push({ period: t, pv });
  }
  const macaulay = price > 0 ? weighted / price / perYear : 0;
  const modified = macaulay / (1 + y);
  const change100 = -modified * 0.01 * price;
  const changeMinus100 = -modified * (-0.01) * price;
  const breakdown = [
    { label: "Face Value", value: `$${fmt(face, 0)}` },
    { label: "Coupon Rate", value: `${fmt(couponPct)}%` },
    { label: "Yield to Maturity", value: `${fmt(ytmPct)}%` },
    { label: "Term", value: `${years} years, ${perYear} payments/yr` },
    { label: "Bond Price (PV of cash flows)", value: `$${fmt(price)}` },
    { label: "Macaulay Duration", value: `${fmt(macaulay)} years` },
    { label: "Modified Duration", value: `${fmt(modified)} years` },
    { label: "ΔPrice per +100bp", value: `${change100 >= 0 ? "+" : "−"} $${fmt(Math.abs(change100))}` },
    { label: "ΔPrice per −100bp", value: `${changeMinus100 >= 0 ? "+" : "−"} $${fmt(Math.abs(changeMinus100))}` },
  ];
  const summaryStats = [
    { label: "Modified Duration", value: `${fmt(modified)} yr` },
    { label: "Macaulay Duration", value: `${fmt(macaulay)} yr` },
    { label: "Price", value: `$${fmt(price)}` },
    { label: "ΔPrice +100bp", value: `${change100 >= 0 ? "+" : "−"} $${fmt(Math.abs(change100))}` },
  ];
  const chartData = [
    { name: "+100bp", value: Number(change100.toFixed(2)), fill: "#f59e0b" },
    { name: "Base Price", value: Number(price.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "−100bp", value: Number(changeMinus100.toFixed(2)), fill: "#10b981" },
  ];
  return { price, macaulay, modified, change100, changeMinus100, breakdown, summaryStats, chartData };
}

const DEFAULTS = { face: "1000", coupon: "5", ytm: "5", years: "5", perYear: "2" };

export default function ModifiedDurationCalculator() {
  const [face, setFace] = useState(DEFAULTS.face);
  const [coupon, setCoupon] = useState(DEFAULTS.coupon);
  const [ytm, setYtm] = useState(DEFAULTS.ytm);
  const [years, setYears] = useState(DEFAULTS.years);
  const [perYear, setPerYear] = useState(DEFAULTS.perYear);
  const [result, setResult] = useState<DurResult | null>(null);

  const f = parseFloat(face);
  const c = parseFloat(coupon);
  const y = parseFloat(ytm);
  const yrs = parseFloat(years);
  const py = parseInt(perYear, 10);
  const errs: string[] = [];
  if (!f || f <= 0) errs.push("Face value must be greater than 0.");
  if (isNaN(c) || c < 0) errs.push("Coupon rate must be 0 or greater.");
  if (isNaN(y) || y < 0) errs.push("Yield to maturity must be 0 or greater.");
  if (!yrs || yrs <= 0) errs.push("Term must be greater than 0.");
  if (py < 1 || py > 12) errs.push("Payments per year must be between 1 and 12.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDur(f, c, y, yrs, py)); };
  const reset = () => {
    setFace(DEFAULTS.face); setCoupon(DEFAULTS.coupon); setYtm(DEFAULTS.ytm); setYears(DEFAULTS.years); setPerYear(DEFAULTS.perYear);
    setResult(calcDur(1000, 5, 5, 5, 2));
  };
  useEffect(() => { setResult(calcDur(1000, 5, 5, 5, 2)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is modified duration?", answer: "A measure of a bond's interest-rate sensitivity: roughly, the percentage price change for a 1% (100 bp) change in yield. A modified duration of 4.5 means a 1% yield rise lowers the price about 4.5%." },
    { question: "How does it relate to Macaulay duration?", answer: "Macaulay duration is the weighted average time until cash flows arrive, weighted by their present values. Modified duration divides Macaulay by (1 + yield per period) to convert the time measure into a price-sensitivity measure." },
    { question: "Why does the price change estimate matter?", answer: "It is the bond portfolio manager's first-order risk tool: duration × Δyield ≈ Δprice. It is exact for small yield moves; for large moves convexity corrects the residual error. Shorter duration means less rate risk." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Modified Duration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Modified Duration Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Face Value ($)</label>
                <input type="number" value={face} onChange={e => setFace(e.target.value)} className={inp} placeholder="1000" />
              </div>
              <div>
                <label className={lbl}>Coupon Rate (%)</label>
                <input type="number" value={coupon} onChange={e => setCoupon(e.target.value)} className={inp} placeholder="5" />
              </div>
              <div>
                <label className={lbl}>Yield to Maturity (%)</label>
                <input type="number" value={ytm} onChange={e => setYtm(e.target.value)} className={inp} placeholder="5" />
              </div>
              <div>
                <label className={lbl}>Years to Maturity</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} className={inp} placeholder="5" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Coupon Payments per Year</label>
                <select value={perYear} onChange={e => setPerYear(e.target.value)} className={inp}>
                  <option value="1">Annual</option>
                  <option value="2">Semi-annual</option>
                  <option value="4">Quarterly</option>
                  <option value="12">Monthly</option>
                </select>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Modified Duration</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.modified)} yr</div>
                <div className="text-sm text-muted-foreground mt-1">Price ≈ ${fmt(result.price)} · ±100bp moves price by ∓ ${fmt(Math.abs(result.change100))}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Macaulay", `${fmt(result.macaulay)} yr`], ["Price", `$${fmt(result.price)}`], ["+100bp ΔPrice", `${result.change100 >= 0 ? "+" : "−"} $${fmt(Math.abs(result.change100))}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Price Sensitivity to ±100bp</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`$${fmt(v)}`, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Duration × yield change ≈ price change — larger duration, larger swings</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Much Does a Bond Fear Rates?</h2>
            <p>When yields rise, bond prices fall — but by how much? That is the question <strong>modified duration</strong> answers. This <strong>modified duration calculator</strong> prices a bond from its cash flows, computes the Macaulay duration, and converts it into the sensitivity measure portfolio managers quote.</p>
            <h2 className="text-2xl font-bold mb-3">From Cash Flows to Duration</h2>
            <p>Discount every coupon and the final principal at the yield to maturity to get the price. Macaulay duration weights each cash-flow time by its present-value share — the average "wait" of your money. Dividing by (1 + yield per period) gives modified duration in years.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Risk</h2>
            <p>Modified duration 4.44 means each 100 bp yield move shifts the price about 4.4%. The calculator shows the estimated dollar change for ±100 bp. Long maturities and low coupons mean higher duration — and higher stakes when the Fed moves.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/modified-duration-calculator" />
          <PopularCalculators exclude="/calculator/modified-duration-calculator" />
        </div>
      </div>
    </>
  );
}
