"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Receipt } from "lucide-react";
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

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const RATES = [5, 7, 10, 12, 15, 18, 20, 25];

export default function VatCalculator() {
  const [price, setPrice] = useState("1000");
  const [rate, setRate] = useState("20");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [res, setRes] = useState<{ net: number; vat: number; gross: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const p = parseFloat(price) || 0, r = parseFloat(rate) || 0;
    if (mode === "add") setRes({ net: p, vat: p * r / 100, gross: p * (1 + r / 100) });
    else { const net = p / (1 + r / 100); setRes({ net, vat: p - net, gross: p }); }
  };

  // Reactive recalc removed - user must click Calculate;

  const reset = () => { setPrice("1000"); setRate("20"); setMode("add"); };

  const faqs = [
    { question: "What is VAT?", answer: "Value Added Tax (VAT) is a consumption tax levied at each stage of the supply chain. Over 170 countries use VAT. The end consumer bears the full tax burden, while businesses collect it on behalf of the government and can reclaim VAT paid on their own purchases." },
    { question: "How do I add VAT to a price?", answer: "To add VAT: Gross Price = Net Price × (1 + VAT Rate ÷ 100). Example: $1,000 at 20% VAT = $1,000 × 1.20 = $1,200. VAT amount = $200." },
    { question: "How do I remove VAT from a price?", answer: "To remove VAT (reverse VAT): Net Price = Gross Price ÷ (1 + VAT Rate ÷ 100). Example: $1,200 ÷ 1.20 = $1,000. Never simply subtract the percentage from the gross — that gives the wrong answer." },
    { question: "What are standard VAT rates?", answer: "Rates vary widely: UK 20%, most EU countries 20–25%, Hungary 27%, Australia 10%, India 5–28% (GST), UAE 5%, Canada 5% (GST). Reduced rates apply to essential goods like food and medicine in most countries." },
    { question: "What is the difference between VAT-exempt and zero-rated?", answer: "Zero-rated items (0% VAT, e.g. most food, children's clothing) allow businesses to reclaim input VAT. Exempt items (e.g. financial services, healthcare) have no VAT charged and no input VAT reclaim. The distinction significantly affects business cash flow." },
    { question: "When must a business register for VAT?", answer: "Registration is mandatory once taxable turnover exceeds the threshold: UK £90,000, EU varies by country (€25,000–€100,000). Voluntary registration is also possible and beneficial for businesses with high capital expenditure or B2B sales." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "VAT Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">VAT Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">VAT Details</h2>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Calculation Mode</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["add", "remove"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                    {m === "add" ? "Add VAT" : "Remove VAT"}
                  </button>
                ))}
              </div>
            </div>
            <CompactInput id="price" label={mode === "add" ? "Net Price (Excl. VAT)" : "Gross Price (Incl. VAT)"} value={price} onChange={setPrice} prefix="$" />
            <CompactInput id="rate" label="VAT Rate" value={rate} onChange={setRate} suffix="%" />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Common Rates</span>
              <div className="flex flex-wrap gap-1.5">
                {RATES.map(r => (
                  <button key={r} type="button" onClick={() => setRate(String(r))} className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${rate === String(r) ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary text-muted-foreground"}`}>{r}%</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate VAT
              </button>
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
                  <h2 className="text-lg font-bold text-foreground">VAT Results</h2>
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Net Price", value: fmt(res.net), cls: "from-primary/10 to-primary/5 border-primary/20" },
                    { label: "VAT Amount", value: fmt(res.vat), cls: "from-amber-500/10 to-amber-500/5 border-amber-500/20" },
                    { label: "Gross Price", value: fmt(res.gross), cls: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" },
                  ].map(item => (
                    <div key={item.label} className={`bg-gradient-to-br ${item.cls} border rounded-xl p-4 text-center`}>
                      <div className="text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{item.label}</div>
                      <div className="text-xl font-extrabold text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Component</th><th className="p-2.5 pr-3 text-right">Amount</th><th className="p-2.5 pr-3 text-right">% of Gross</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Net Price (Excl. VAT)", value: fmt(res.net), pct: `${(res.net / res.gross * 100).toFixed(1)}%` },
                        { label: `VAT at ${rate}%`, value: fmt(res.vat), pct: `${(res.vat / res.gross * 100).toFixed(1)}%` },
                        { label: "Gross Price (Incl. VAT)", value: fmt(res.gross), pct: "100.0%", bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{r.value}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground">{r.pct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Net vs VAT Breakdown</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={[{ name: "Net Price", value: +res.net.toFixed(2) }, { name: "VAT Amount", value: +res.vat.toFixed(2) }]} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toLocaleString()}`} />
                        <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Amount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Rate Comparison (on ${Number(price || 0).toLocaleString()})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RATES.map(r => (
                      <div key={r} className={`flex justify-between items-center p-2 rounded-md text-sm ${parseFloat(rate) === r ? "bg-primary/10 border border-primary/20 font-bold" : "bg-secondary/30"}`}>
                        <span className="text-muted-foreground">{r}%</span>
                        <span className="font-semibold text-foreground">{fmt(parseFloat(price || "0") * r / 100)}</span>
                      </div>
                    ))}
                  </div>
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
            <h2>What Is VAT (Value Added Tax)?</h2>
            <p>Value Added Tax (VAT) is a consumption-based tax levied on the value added to goods and services at each stage of production and distribution. Unlike a simple sales tax collected only at the point of final sale, VAT is charged incrementally throughout the supply chain, with each business able to reclaim the VAT it paid on its own purchases (input tax) and remitting only the net VAT on the value it added. This mechanism creates a self-auditing chain that reduces tax evasion significantly compared to traditional sales taxes.</p>
            <p>Over 170 countries worldwide use VAT or a closely related system (called GST — Goods and Services Tax — in countries like Australia, Canada, and India). The EU mandates VAT across all member states. The UK retained its VAT system after Brexit. The United States remains one of the few major economies without a federal VAT, relying instead on state-level sales taxes.</p>

            <h2>How to Calculate VAT: The Two Core Formulas</h2>
            <p><strong>Adding VAT (tax-exclusive to tax-inclusive):</strong> Gross Price = Net Price × (1 + VAT Rate ÷ 100). Example: $1,000 at 20% = $1,200. VAT = $200.</p>
            <p><strong>Removing VAT (reverse VAT):</strong> Net Price = Gross Price ÷ (1 + VAT Rate ÷ 100). Example: $1,200 ÷ 1.20 = $1,000. The common mistake is to simply subtract the percentage from the gross price — this gives an incorrect result. Always divide by the VAT factor.</p>

            <h2>VAT Rates Around the World</h2>
            <p>Standard rates vary significantly: EU countries range from 17% (Luxembourg) to 27% (Hungary). UK: 20% standard, 5% reduced. Australia: 10% GST. India: tiered GST at 5%, 12%, 18%, or 28%. UAE: 5%. Canada: 5% federal GST plus provincial taxes. Most countries also apply zero rates to exports and reduced rates to essential goods such as food, medicine, and children's products.</p>

            <h2>VAT for Businesses: Input Tax and Output Tax</h2>
            <p>VAT-registered businesses charge output tax on their sales and pay input tax on their purchases. The net VAT — output tax minus input tax — is remitted to the tax authority on a periodic return (typically quarterly). If input tax exceeds output tax (common for exporters), the business receives a VAT refund. This input tax credit mechanism means that VAT is effectively borne only by the final consumer, making it economically neutral for businesses in the supply chain.</p>

            <h2>When Must You Register for VAT?</h2>
            <p>Mandatory registration is triggered once taxable turnover exceeds the national threshold: UK £90,000 (2024), varying EU thresholds from €25,000 to €100,000, Australia AUD 75,000, Canada CAD 30,000. Voluntary registration is also possible below the threshold, which is beneficial for businesses with significant input VAT (e.g., startups with heavy capital expenditure) or those primarily selling to other VAT-registered businesses who can reclaim the VAT anyway.</p>

            <h2>Zero-Rated vs. Exempt Supplies</h2>
            <p>Understanding this distinction is critical for businesses. Zero-rated supplies (0% VAT) allow full input tax recovery — common examples include food, children's clothing, books, and exports. Exempt supplies (no VAT charged and no input VAT recovery) include financial services, healthcare, and education in most jurisdictions. Businesses with both taxable and exempt supplies must carefully apportion their input tax claims, which adds significant compliance complexity.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vat-calculator" />
          <PopularCalculators exclude="/calculator/vat-calculator" />
        </div>
      </div>
    </>
  );
}
