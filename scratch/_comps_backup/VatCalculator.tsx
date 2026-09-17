"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface VatInput {
  amount: number;
  rate: number;
  mode: "add" | "remove";
}

interface VatResult {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  chartData: { name: string; amount: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcVat(input: VatInput): VatResult {
  let netAmount: number, vatAmount: number, grossAmount: number;
  if (input.mode === "add") {
    netAmount = input.amount;
    vatAmount = (input.amount * input.rate) / 100;
    grossAmount = netAmount + vatAmount;
  } else {
    grossAmount = input.amount;
    netAmount = input.amount / (1 + input.rate / 100);
    vatAmount = grossAmount - netAmount;
  }

  const chartData = [
    { name: "Net (Pre-VAT)", amount: Number(netAmount.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "VAT Amount", amount: Number(vatAmount.toFixed(2)), fill: "#f59e0b" },
    { name: "Gross (Incl. VAT)", amount: Number(grossAmount.toFixed(2)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Mode", value: input.mode === "add" ? "Add VAT to net" : "Remove VAT from gross" },
    { label: "Net Amount", value: `$${netAmount.toFixed(2)}` },
    { label: "VAT Rate", value: `${input.rate.toFixed(1)}%` },
    { label: "VAT Amount", value: `$${vatAmount.toFixed(2)}` },
    { label: "Gross Amount", value: `$${grossAmount.toFixed(2)}` },
    { label: "VAT as % of Gross", value: `${grossAmount > 0 ? ((vatAmount / grossAmount) * 100).toFixed(1) : 0}%` },
  ];

  const summaryStats = [
    { label: "Net Amount", value: `$${netAmount.toFixed(2)}` },
    { label: "VAT Amount", value: `$${vatAmount.toFixed(2)}` },
    { label: "Gross Amount", value: `$${grossAmount.toFixed(2)}` },
    { label: "VAT Rate", value: `${input.rate.toFixed(1)}%` },
    { label: "VAT Share", value: `${grossAmount > 0 ? ((vatAmount / grossAmount) * 100).toFixed(1) : 0}%` },
    { label: "Tax on $1", value: `$${(vatAmount / Math.max(1, grossAmount)).toFixed(3)}` },
  ];

  return { netAmount, vatAmount, grossAmount, chartData, breakdown, summaryStats };
}

const DEFAULTS: VatInput = { amount: 100, rate: 8, mode: "add" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function VatCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [mode, setMode] = useState<VatInput["mode"]>(DEFAULTS.mode);
  const [result, setResult] = useState<VatResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcVat({ amount: parse(amount, DEFAULTS.amount), rate: parse(rate, DEFAULTS.rate), mode }));
  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setRate(String(DEFAULTS.rate));
    setMode(DEFAULTS.mode);
    setResult(calcVat(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcVat(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is VAT?", answer: "Value Added Tax is a consumption tax applied at each stage of production and distribution. Businesses collect VAT on sales and reclaim VAT paid on purchases, so the final consumer bears the full cost. Rates vary by country — from 5% in some jurisdictions to 27% in Hungary, with most of Europe around 20%." },
    { question: "How do I add VAT to a price?", answer: "Multiply the net price by (1 + rate). At 8% VAT, a $100 net price becomes $108. The VAT portion is $8. This is the 'exclusive' convention used when quoting wholesale prices or B2B rates that don't include tax." },
    { question: "How do I remove VAT from a price?", answer: "Divide the gross price by (1 + rate). A $108 price including 8% VAT contains $100 net and $8 VAT: 108 ÷ 1.08 = 100. This is the 'inclusive' convention used when a consumer price already includes tax and you need the pre-tax figure." },
    { question: "Is VAT the same as sales tax?", answer: "Not quite. Sales tax is charged once at the final sale. VAT is charged at every stage with credits for input tax, which makes it harder to evade and neutral for business-to-business transactions. Consumers usually see no practical difference, but the accounting differs." },
    { question: "How is VAT calculated from a gross amount?", answer: "VAT = Gross − Gross ÷ (1 + rate). For $108 at 8%: 108 − 108 ÷ 1.08 = 108 − 100 = $8. Equivalently, VAT = Gross × rate ÷ (1 + rate). The 'VAT as % of gross' figure in this calculator shows the tax's true share of the final price." },
    { question: "What rate should I use?", answer: "Use your country's standard rate — or the reduced rate for eligible goods like food and books. This calculator's default is 8% (common for reduced-rate goods and several countries' standard rate); change it to match your jurisdiction before relying on the result." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "VAT Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">VAT Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">VAT Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Calculation Mode</label>
                <div className="flex gap-3">
                  {([["add", "Add VAT to net price"], ["remove", "Remove VAT from gross price"]] as [VatInput["mode"], string][]).map(([m, label]) => (
                    <button key={m} onClick={() => setMode(m)} className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{mode === "add" ? "Price Including VAT" : "Price Excluding VAT"}</div>
                  <div className="text-4xl font-extrabold tracking-tight">${(mode === "add" ? result.grossAmount : result.netAmount).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">VAT: ${result.vatAmount.toFixed(2)} at {rate}% · Net: ${result.netAmount.toFixed(2)} · Gross: ${result.grossAmount.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Net Amount", `$${result.netAmount.toFixed(2)}`], ["VAT", `$${result.vatAmount.toFixed(2)}`], ["Gross", `$${result.grossAmount.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">VAT Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Price Components</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                      <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, ""]} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Adding and Removing VAT</h2>
            <p>VAT appears in two common situations: quoting a price that must include tax, and extracting the tax from a price that already includes it. Adding VAT multiplies the net price by (1 + rate). Removing VAT divides the gross price by (1 + rate) — the reverse operation that yields the pre-tax base.</p>
            <h2 className="text-2xl font-bold mb-3">The Inclusive vs Exclusive Distinction</h2>
            <p>Business-to-consumer prices almost always include VAT; business-to-business quotes often exclude it so buyers can reclaim the input tax. Confusing the two is a classic pricing error. This calculator's mode toggle handles both directions so you never have to reverse-engineer the math.</p>
            <h2 className="text-2xl font-bold mb-3">VAT Compliance</h2>
            <p>For businesses, VAT collected must be reported and remitted, and input VAT reclaimed. Keep invoices itemized with the VAT amount and rate shown separately. Accurate reverse-calculation — extracting VAT from inclusive prices — is essential for claiming input credits on expense receipts.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vat-calculator" />
          <PopularCalculators exclude="/calculator/vat-calculator" />
        </div>
      </div>
    </>
  );
}
