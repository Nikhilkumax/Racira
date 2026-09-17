"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface GstResult {
  amount: number;
  rate: number;
  inclusive: boolean;
  interState: boolean;
  gstAmount: number;
  taxableValue: number;
  total: number;
  cgst: number;
  sgst: number;
  igst: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtRs(v: number): string {
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcGst(amount: number, rate: number, inclusive: boolean, interState: boolean): GstResult {
  const gstAmount = inclusive ? amount - amount / (1 + rate / 100) : amount * (rate / 100);
  const taxableValue = inclusive ? amount / (1 + rate / 100) : amount;
  const total = inclusive ? amount : amount + gstAmount;
  const half = gstAmount / 2;
  const cgst = interState ? 0 : half;
  const sgst = interState ? 0 : half;
  const igst = interState ? gstAmount : 0;

  const breakdown = [
    { label: "Amount", value: fmtRs(amount) },
    { label: "GST Rate", value: `${rate}%` },
    { label: "Mode", value: inclusive ? "GST inclusive" : "GST exclusive" },
    { label: "Supply Type", value: interState ? "Inter-state (IGST)" : "Intra-state (CGST + SGST)" },
    { label: "Taxable Value", value: fmtRs(taxableValue) },
    { label: "GST Amount", value: fmtRs(gstAmount) },
    { label: interState ? "IGST" : "CGST", value: fmtRs(cgst) },
    { label: interState ? "—" : "SGST", value: fmtRs(sgst) },
    { label: "Total (incl. GST)", value: fmtRs(total) },
  ];
  const summaryStats = [
    { label: "GST Amount", value: fmtRs(gstAmount) },
    { label: "Taxable Value", value: fmtRs(taxableValue) },
    { label: "Total", value: fmtRs(total) },
    { label: "Rate", value: `${rate}%` },
    { label: interState ? "IGST" : "CGST", value: fmtRs(cgst) },
    { label: interState ? "—" : "SGST", value: fmtRs(sgst) },
    { label: "Mode", value: inclusive ? "Inclusive" : "Exclusive" },
    { label: "Supply", value: interState ? "IGST" : "CGST+SGST" },
  ];
  const chartData = [
    { name: "Taxable", value: Math.round(taxableValue), fill: "hsl(var(--primary))" },
    { name: "GST", value: Math.round(gstAmount), fill: "#f59e0b" },
  ];
  return { amount, rate, inclusive, interState, gstAmount, taxableValue, total, cgst, sgst, igst, breakdown, summaryStats, chartData };
}

const DEFAULTS = { amount: "50000", rate: "18", inclusive: true, interState: false };

export default function GstCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [inclusive, setInclusive] = useState(DEFAULTS.inclusive);
  const [interState, setInterState] = useState(DEFAULTS.interState);
  const [result, setResult] = useState<GstResult | null>(null);

  const am = parseFloat(amount) || 0;
  const rt = parseFloat(rate) || 0;
  const errs: string[] = [];
  if (am <= 0) errs.push("Amount must be greater than 0.");
  if (rt < 0 || rt > 50) errs.push("GST rate must be between 0% and 50%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcGst(am, rt, inclusive, interState)); };
  const reset = () => {
    setAmount(DEFAULTS.amount); setRate(DEFAULTS.rate); setInclusive(DEFAULTS.inclusive); setInterState(DEFAULTS.interState);
    setResult(calcGst(50000, 18, true, false));
  };
  useEffect(() => { setResult(calcGst(50000, 18, true, false)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the difference between inclusive and exclusive?", answer: "Exclusive means GST is added on top of the base price (₹50,000 + 18%). Inclusive means the quoted price already contains GST (₹50,000 total, with ₹7,627.12 of it being tax)." },
    { question: "When is IGST used instead of CGST + SGST?", answer: "Intra-state supplies split GST equally into CGST (central) and SGST (state). Inter-state supplies charge a single IGST, which the central government then apportions to the destination state." },
    { question: "What are the common GST rates in India?", answer: "Most goods fall under 18% or 12%. Essentials like food grains are 0–5%, while luxury items attract 28%." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "GST Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">GST Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Amount</label>
                <div className={inp}><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">₹</span></div>
              </div>
              <div>
                <label className={lbl}>GST Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Amount Includes GST?</label>
                <select value={inclusive ? "yes" : "no"} onChange={e => setInclusive(e.target.value === "yes")} className={sel}>
                  <option value="no">No — add GST</option>
                  <option value="yes">Yes — GST included</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Supply Type</label>
                <select value={interState ? "inter" : "intra"} onChange={e => setInterState(e.target.value === "inter")} className={sel}>
                  <option value="intra">Intra-state (CGST + SGST)</option>
                  <option value="inter">Inter-state (IGST)</option>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">GST Amount</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtRs(result.gstAmount)}</div>
                <div className="text-sm text-muted-foreground mt-1">on {fmtRs(result.taxableValue)} taxable value · {result.inclusive ? "inclusive" : "exclusive"} mode</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Taxable Value`, fmtRs(result.taxableValue)], [result.interState ? "IGST" : "CGST", fmtRs(result.cgst)], [result.interState ? "Total GST" : "SGST", fmtRs(result.sgst)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">GST Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Taxable vs Tax</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtRs(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Composition of the total amount</p>
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
            <h2 className="text-2xl font-bold mb-3">How GST Is Computed</h2>
            <p>This <strong>GST calculator</strong> supports both modes: exclusive adds the tax to the base price (amount × rate ÷ 100), while inclusive extracts it from the quoted total (amount − amount ÷ (1 + rate ÷ 100)). Intra-state sales split the tax equally into CGST and SGST; inter-state sales charge a single IGST.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Split Matters</h2>
            <p>CGST funds the central government and SGST the state, so every intra-state invoice must show both components. For inter-state supplies, IGST replaces the pair and is later apportioned to the destination state under the GST compensation mechanism.</p>
            <h2 className="text-2xl font-bold mb-3">Filing and Input Credit</h2>
            <p>Businesses claim input tax credit for GST paid on purchases, offsetting it against GST collected on sales. Keeping the taxable value and tax split accurate on every invoice is what makes the credit chain work end to end.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gst-calculator" />
          <PopularCalculators exclude="/calculator/gst-calculator" />
        </div>
      </div>
    </>
  );
}
