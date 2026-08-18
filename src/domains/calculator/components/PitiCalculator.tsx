"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

const DEFAULTS = { loan: "350000", rate: "6.5", term: "30", tax: "4200", insurance: "1400", hoa: "0" };

export default function PitiCalculator() {
  const [loan, setLoan] = useState(DEFAULTS.loan);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [hoa, setHoa] = useState(DEFAULTS.hoa);
  const [calculated, setCalculated] = useState(false);

  const L = Math.max(0, parseFloat(loan) || 0);
  const r = Math.max(0, Math.min(30, parseFloat(rate) || 0)) / 100 / 12;
  const n = Math.max(1, Math.min(50, Math.round(parseFloat(term) || 30))) * 12;
  const t = Math.max(0, parseFloat(tax) || 0);
  const ins = Math.max(0, parseFloat(insurance) || 0);
  const hoaM = Math.max(0, parseFloat(hoa) || 0);

  const pi = L > 0 && r > 0 ? (L * r) / (1 - Math.pow(1 + r, -n)) : L / n;
  const taxM = t / 12;
  const insM = ins / 12;
  const total = pi + taxM + insM + hoaM;

  // first-payment split
  const firstInterest = L * r;
  const firstPrincipal = Math.max(0, pi - firstInterest);

  const chartData = [
    { name: "Principal & Interest", value: Number(pi.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Property Tax", value: Number(taxM.toFixed(2)), fill: "#f59e0b" },
    { name: "Insurance", value: Number(insM.toFixed(2)), fill: "#10b981" },
    { name: "HOA", value: Number(hoaM.toFixed(2)), fill: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setLoan(DEFAULTS.loan); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); setTax(DEFAULTS.tax); setInsurance(DEFAULTS.insurance); setHoa(DEFAULTS.hoa); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What does PITI stand for?", answer: "Principal, Interest, Taxes, and Insurance — the four components of a full mortgage payment. Principal and interest repay the loan; taxes and insurance are collected monthly by the lender into an escrow account and paid out annually." },
    { question: "Why do lenders quote PITI instead of just the mortgage?", answer: "The payment that actually leaves your bank account includes escrow. A $2,211 principal-and-interest payment can become $2,686 once property tax and insurance are added — and lenders use the full PITI for debt-to-income ratios." },
    { question: "What is the escrow for?", answer: "Property taxes and homeowners insurance are large annual bills that many borrowers would struggle to pay in one shot. The lender collects 1/12 each month, holds it in escrow, and pays the county and insurer when due — smoothing the cost into the monthly payment." },
    { question: "How much of my first payment is interest?", answer: "Early in the loan, almost all of it. On a $350,000 loan at 6.5%, the first month's payment is about $1,896 in interest and only $315 in principal. Over 30 years the split flips — the amortization curve accelerates in the later years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "PITI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">PITI Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Loan amount</label>
                <input type="number" min={0} value={loan} onChange={e => setLoan(e.target.value)} className={inp} placeholder="350000" />
              </div>
              <div>
                <label className={lbl}>Interest rate %</label>
                <input type="number" min={0} max={30} step={0.01} value={rate} onChange={e => setRate(e.target.value)} className={inp} placeholder="6.5" />
              </div>
              <div>
                <label className={lbl}>Term (years)</label>
                <input type="number" min={1} max={50} value={term} onChange={e => setTerm(e.target.value)} className={inp} placeholder="30" />
              </div>
              <div>
                <label className={lbl}>Property tax / year</label>
                <input type="number" min={0} value={tax} onChange={e => setTax(e.target.value)} className={inp} placeholder="4200" />
              </div>
              <div>
                <label className={lbl}>Homeowners ins. / year</label>
                <input type="number" min={0} value={insurance} onChange={e => setInsurance(e.target.value)} className={inp} placeholder="1400" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>HOA dues / month (optional)</label>
                <input type="number" min={0} value={hoa} onChange={e => setHoa(e.target.value)} className={inp} placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Monthly PITI</div>
                <div className="text-3xl font-extrabold tracking-tight">{fmtUSD(total)}/mo</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtUSD(pi)} P&I + {fmtUSD(taxM)} tax + {fmtUSD(insM)} insurance{hoaM > 0 ? ` + ${fmtUSD(hoaM)} HOA` : ""}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Principal & Interest", fmtUSD(pi), "loan payment"], ["Escrow", fmtUSD(taxM + insM), "tax + insurance"], ["Annual PITI", fmtUSD(total * 12), "per year"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Payment Composition</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={0}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtUSD(Number(v)), ""]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">P&I dominates early — taxes and insurance usually add 10–25% on top</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Payment Detail</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Principal & interest:</span><span className="font-semibold">{fmtUSD(pi)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Property tax:</span><span className="font-semibold">{fmtUSD(taxM)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Homeowners insurance:</span><span className="font-semibold">{fmtUSD(insM)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">HOA:</span><span className="font-semibold">{hoaM > 0 ? fmtUSD(hoaM) : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">First month interest:</span><span className="font-semibold">{fmtUSD(firstInterest)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">First month principal:</span><span className="font-semibold">{fmtUSD(firstPrincipal)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Real Monthly Payment</h2>
            <p>The mortgage payment you see on ads is often just principal and interest. This <strong>PITI calculator</strong> adds the escrow components — property tax and homeowners insurance — plus HOA dues, producing the number that actually leaves your bank account every month.</p>
            <h2 className="text-2xl font-bold mb-3">What Escrow Buys You</h2>
            <p>Rolling taxes and insurance into the monthly payment spreads two big annual bills across twelve smaller ones, and protects the lender's collateral: a property can be seized for unpaid taxes and loses value uninsured. The escrow balance is your money, held in trust.</p>
            <h2 className="text-2xl font-bold mb-3">Budget With the Total</h2>
            <p>Lenders cap the full PITI around 28% of gross income and total debts at 36%. Check the total here against your own budget before you shop — the difference between P&I-only and full PITI is exactly where affordability surprises hide.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/piti-calculator" />
          <PopularCalculators exclude="/calculator/piti-calculator" />
        </div>
      </div>
    </>
  );
}
