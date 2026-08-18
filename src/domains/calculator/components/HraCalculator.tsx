"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface HraResult {
  basic: number;
  hraReceived: number;
  rent: number;
  metro: boolean;
  tenPctBasic: number;
  rentMinusTen: number;
  halfBasic: number;
  exemption: number;
  taxableHra: number;
  exemptPct: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtRs(v: number): string {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function calcHra(basic: number, hraReceived: number, rent: number, metro: boolean): HraResult {
  const tenPctBasic = basic * 0.10;
  const rentMinusTen = Math.max(0, rent - tenPctBasic);
  const halfBasic = basic * (metro ? 0.50 : 0.40);
  const exemption = Math.max(0, Math.min(hraReceived, rentMinusTen, halfBasic));
  const taxableHra = hraReceived - exemption;
  const exemptPct = hraReceived > 0 ? (exemption / hraReceived) * 100 : 0;

  const breakdown = [
    { label: "Basic Salary + DA", value: fmtRs(basic) + "/mo" },
    { label: "HRA Received", value: fmtRs(hraReceived) + "/mo" },
    { label: "Rent Paid", value: fmtRs(rent) + "/mo" },
    { label: "10% of Basic", value: fmtRs(tenPctBasic) },
    { label: "Limit 1 — Actual HRA", value: fmtRs(hraReceived) },
    { label: "Limit 2 — Rent − 10% of Basic", value: fmtRs(rentMinusTen) },
    { label: `Limit 3 — ${metro ? "50%" : "40%"} of Basic (${metro ? "metro" : "non-metro"})`, value: fmtRs(halfBasic) },
    { label: "Exempt HRA (min of limits)", value: fmtRs(exemption) },
    { label: "Taxable HRA", value: fmtRs(taxableHra) },
  ];
  const summaryStats = [
    { label: "HRA Exemption", value: fmtRs(exemption) },
    { label: "Taxable HRA", value: fmtRs(taxableHra) },
    { label: "Exempt %", value: `${exemptPct.toFixed(1)}%` },
    { label: "HRA Received", value: fmtRs(hraReceived) },
    { label: "Rent Paid", value: fmtRs(rent) },
    { label: "Basic + DA", value: fmtRs(basic) },
    { label: "City Type", value: metro ? "Metro" : "Non-metro" },
    { label: "Rent − 10% Limit", value: fmtRs(rentMinusTen) },
  ];
  const chartData = [
    { name: "Exempt", value: Math.round(exemption), fill: "hsl(var(--primary))" },
    { name: "Taxable", value: Math.round(taxableHra), fill: "#f59e0b" },
  ];
  return { basic, hraReceived, rent, metro, tenPctBasic, rentMinusTen, halfBasic, exemption, taxableHra, exemptPct, breakdown, summaryStats, chartData };
}

const DEFAULTS = { basic: "50000", hra: "20000", rent: "18000", metro: true };

export default function HraCalculator() {
  const [basic, setBasic] = useState(DEFAULTS.basic);
  const [hra, setHra] = useState(DEFAULTS.hra);
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [metro, setMetro] = useState(DEFAULTS.metro);
  const [result, setResult] = useState<HraResult | null>(null);

  const bs = parseFloat(basic) || 0;
  const hr = parseFloat(hra) || 0;
  const rn = parseFloat(rent) || 0;
  const errs: string[] = [];
  if (bs <= 0) errs.push("Basic salary must be greater than 0.");
  if (hr < 0) errs.push("HRA received cannot be negative.");
  if (rn < 0) errs.push("Rent paid cannot be negative.");
  if (rn <= bs * 0.10) errs.push("Rent must exceed 10% of basic to claim any HRA exemption.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHra(bs, hr, rn, metro)); };
  const reset = () => {
    setBasic(DEFAULTS.basic); setHra(DEFAULTS.hra); setRent(DEFAULTS.rent); setMetro(DEFAULTS.metro);
    setResult(calcHra(50000, 20000, 18000, true));
  };
  useEffect(() => { setResult(calcHra(50000, 20000, 18000, true)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is HRA exemption calculated?", answer: "Under Section 10(13A), the exempt amount is the minimum of three limits: actual HRA received, rent paid minus 10% of basic salary, and 50% (metro) or 40% (non-metro) of basic salary." },
    { question: "What if my rent is lower than 10% of basic?", answer: "Then limit 2 becomes zero or negative and no exemption is available — the HRA becomes fully taxable. This is common when living with parents and paying no rent." },
    { question: "Do I need rent receipts?", answer: "Yes — keep rent receipts and, if annual rent exceeds ₹1,00,000, provide the landlord's PAN. Salaried employees claim the exemption through their employer's Form 12BB." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "HRA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">HRA Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Basic Salary + DA</label>
                <div className={inp}><input type="number" value={basic} onChange={e => setBasic(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹/mo</span></div>
              </div>
              <div>
                <label className={lbl}>HRA Received</label>
                <div className={inp}><input type="number" value={hra} onChange={e => setHra(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹/mo</span></div>
              </div>
              <div>
                <label className={lbl}>Rent Paid</label>
                <div className={inp}><input type="number" value={rent} onChange={e => setRent(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹/mo</span></div>
              </div>
              <div>
                <label className={lbl}>City Type</label>
                <select value={metro ? "metro" : "nonmetro"} onChange={e => setMetro(e.target.value === "metro")} className={sel}>
                  <option value="metro">Metro (Delhi, Mumbai, Chennai, Kolkata)</option>
                  <option value="nonmetro">Non-metro</option>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">HRA Exemption</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtRs(result.exemption)}<span className="text-2xl">/mo</span></div>
                <div className="text-sm text-muted-foreground mt-1">{fmtRs(result.taxableHra)}/mo taxable · {result.exemptPct.toFixed(1)}% exempt</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Taxable HRA`, fmtRs(result.taxableHra)], ["Limit 2 (Rent − 10%)", fmtRs(result.rentMinusTen)], [`Limit 3 (${result.metro ? "50%" : "40%"})`, fmtRs(result.halfBasic)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Exemption Calculation</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Exempt vs Taxable</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtRs(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Split of your received HRA</p>
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
            <h2 className="text-2xl font-bold mb-3">Section 10(13A) Exemption</h2>
            <p>This <strong>HRA calculator</strong> applies the statutory formula: exempt HRA equals the minimum of actual HRA received, rent paid minus 10% of basic salary, and 50% of basic in metro cities (40% elsewhere). The balance is added to taxable income.</p>
            <h2 className="text-2xl font-bold mb-3">Why the 10% Floor Exists</h2>
            <p>The rent-minus-10% limit assumes you would spend roughly a tenth of basic salary on housing regardless. Only rent above that baseline is treated as incremental housing cost, so the exemption tracks genuine rent burden rather than HRA size.</p>
            <h2 className="text-2xl font-bold mb-3">Claiming It</h2>
            <p>Declare the exemption to your employer through Form 12BB with rent receipts. If you live with parents and pay them rent, that qualifies too — but the landlord's PAN is required once annual rent crosses ₹1,00,000.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hra-calculator" />
          <PopularCalculators exclude="/calculator/hra-calculator" />
        </div>
      </div>
    </>
  );
}
