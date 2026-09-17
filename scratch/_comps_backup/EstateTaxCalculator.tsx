"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface EstateTaxResult {
  gross: number;
  debts: number;
  costs: number;
  charitable: number;
  exemption: number;
  deductions: number;
  taxable: number;
  tax: number;
  effectiveRate: number;
  netToHeirs: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function calcEstateTax(gross: number, debts: number, costs: number, charitable: number, exemption: number): EstateTaxResult {
  const deductions = debts + costs + charitable;
  const taxable = Math.max(0, gross - deductions - exemption);
  const tax = taxable * 0.40;
  const effectiveRate = gross > 0 ? (tax / gross) * 100 : 0;
  const netToHeirs = gross - debts - costs - tax;

  const breakdown = [
    { label: "Gross Estate Value", value: fmt$(gross) },
    { label: "− Debts & Liabilities", value: `−${fmt$(debts)}` },
    { label: "− Funeral & Admin Costs", value: `−${fmt$(costs)}` },
    { label: "− Charitable Bequests", value: `−${fmt$(charitable)}` },
    { label: "− Federal Exemption", value: `−${fmt$(exemption)}` },
    { label: "Taxable Estate", value: fmt$(taxable) },
    { label: "Federal Estate Tax (40%)", value: fmt$(tax) },
    { label: "Effective Tax Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Net to Heirs", value: fmt$(netToHeirs) },
  ];
  const summaryStats = [
    { label: "Estate Tax Due", value: fmt$(tax) },
    { label: "Taxable Estate", value: fmt$(taxable) },
    { label: "Exemption Used", value: fmt$(exemption) },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Gross Estate", value: fmt$(gross) },
    { label: "Deductions", value: fmt$(deductions) },
    { label: "Net to Heirs", value: fmt$(netToHeirs) },
    { label: "Tax Bracket", value: taxable > 0 ? "40% (top)" : "Below exemption" },
  ];
  const chartData = [
    { name: "Net to Heirs", value: Math.round(netToHeirs), fill: "hsl(var(--primary))" },
    { name: "Estate Tax", value: Math.round(tax), fill: "#ef4444" },
    { name: "Debts & Costs", value: Math.round(debts + costs), fill: "#f59e0b" },
    { name: "Charitable", value: Math.round(charitable), fill: "#10b981" },
  ];
  return { gross, debts, costs, charitable, exemption, deductions, taxable, tax, effectiveRate, netToHeirs, breakdown, summaryStats, chartData };
}

const DEFAULTS = { gross: "15000000", debts: "300000", costs: "75000", charitable: "250000", exemption: "13990000" };

export default function EstateTaxCalculator() {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [debts, setDebts] = useState(DEFAULTS.debts);
  const [costs, setCosts] = useState(DEFAULTS.costs);
  const [charitable, setCharitable] = useState(DEFAULTS.charitable);
  const [exemption, setExemption] = useState(DEFAULTS.exemption);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<EstateTaxResult | null>(null);

  const gr = parseFloat(gross) || 0;
  const db = parseFloat(debts) || 0;
  const cs = parseFloat(costs) || 0;
  const ch = parseFloat(charitable) || 0;
  const ex = parseFloat(exemption) || 0;
  const errs: string[] = [];
  if (gr <= 0) errs.push("Gross estate value must be greater than 0.");
  if (db < 0 || cs < 0 || ch < 0) errs.push("Deductions cannot be negative.");
  if (ex < 0) errs.push("Exemption cannot be negative.");
  if (db + cs + ch > gr) errs.push("Deductions exceed the gross estate value.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcEstateTax(gr, db, cs, ch, ex)); };
  const reset = () => {
    setGross(DEFAULTS.gross); setDebts(DEFAULTS.debts); setCosts(DEFAULTS.costs); setCharitable(DEFAULTS.charitable); setExemption(DEFAULTS.exemption);
    setResult(calcEstateTax(15000000, 300000, 75000, 250000, 13990000));
  };
  useEffect(() => { setResult(calcEstateTax(15000000, 300000, 75000, 250000, 13990000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Who owes federal estate tax?", answer: "Only estates above the exemption amount owe tax. The 2025 exemption is $13.99 million per person, so fewer than 1 in 1,000 estates file a taxable return." },
    { question: "What happens to the exemption in 2026?", answer: "Under current law the exemption is scheduled to drop to roughly $7 million per person after 2025. Consult a professional before relying on the higher figure for planning." },
    { question: "What deductions reduce the taxable estate?", answer: "Debts, funeral and administration expenses, charitable bequests, and property passing to a surviving spouse (unlimited marital deduction) all reduce the taxable estate before the exemption applies." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Estate Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Estate Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Gross Estate Value</label>
                <div className={inp}><input type="number" value={gross} onChange={e => setGross(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Debts & Liabilities</label>
                <div className={inp}><input type="number" value={debts} onChange={e => setDebts(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Funeral & Admin Costs</label>
                <div className={inp}><input type="number" value={costs} onChange={e => setCosts(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Charitable Bequests</label>
                <div className={inp}><input type="number" value={charitable} onChange={e => setCharitable(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Exemption</div>
                  <div>
                    <label className={lbl}>Federal Estate Exemption</label>
                    <div className={inp}><input type="number" value={exemption} onChange={e => setExemption(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
                    <p className="text-xs text-muted-foreground mt-1.5">$13,990,000 per person for 2025. The unlimited marital deduction is not modeled here.</p>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Federal Estate Tax Due</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.tax)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt$(result.taxable)} taxable after {fmt$(result.exemption)} exemption · {result.effectiveRate.toFixed(2)}% effective</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Taxable Estate`, fmt$(result.taxable)], ["Exemption", fmt$(result.exemption)], ["Net to Heirs", fmt$(result.netToHeirs)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Estate Calculation</h3>
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
                <h3 className="text-base font-bold mb-4">Where the Estate Goes</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Distribution of gross estate by destination</p>
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
            <h2 className="text-2xl font-bold mb-3">How Federal Estate Tax Works</h2>
            <p>This <strong>estate tax calculator</strong> models the US federal estate tax: gross estate minus debts, expenses, and charitable bequests, then minus the unified credit exemption, with the remainder taxed at the top 40% rate. The 2025 exemption is $13.99 million per person; the unlimited spousal (marital) deduction is not modeled.</p>
            <h2 className="text-2xl font-bold mb-3">Planning Notes</h2>
            <p>The exemption is scheduled to sunset to roughly $7 million per person after 2025 unless Congress acts. Lifetime gifts use the same unified credit, so large gifts during life reduce the exemption available at death.</p>
            <h2 className="text-2xl font-bold mb-3">What to Do Next</h2>
            <p>If your estate approaches the exemption, consider trusts, annual exclusion gifts ($19,000 per recipient in 2025), and spousal planning. Estate law is state-specific — consult an attorney or CPA for definitive guidance.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/estate-tax-calculator" />
          <PopularCalculators exclude="/calculator/estate-tax-calculator" />
        </div>
      </div>
    </>
  );
}
