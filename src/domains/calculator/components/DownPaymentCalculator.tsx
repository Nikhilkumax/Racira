"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Home } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DownPaymentResult {
  homePrice: number;
  downPct: number;
  closingPct: number;
  months: number;
  downPayment: number;
  loanAmount: number;
  ltv: number;
  closingCosts: number;
  cashNeeded: number;
  monthlySavings: number;
  chartData: { name: string; value: number }[];
}

function calcDownPayment(homePrice: number, downPct: number, closingPct: number, months: number): DownPaymentResult {
  const downPayment = homePrice * (downPct / 100);
  const loanAmount = homePrice - downPayment;
  const ltv = (loanAmount / homePrice) * 100;
  const closingCosts = homePrice * (closingPct / 100);
  const cashNeeded = downPayment + closingCosts;
  const monthlySavings = months > 0 ? cashNeeded / months : 0;
  const chartData = [
    { name: "Down Payment", value: downPayment },
    { name: "Loan Amount", value: loanAmount },
  ];
  return { homePrice, downPct, closingPct, months, downPayment, loanAmount, ltv, closingCosts, cashNeeded, monthlySavings, chartData };
}

const DEFAULTS = { price: "400000", pct: "20", closing: "3", months: "24" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`;

const faqs = [
  { question: "How much should I put down?", answer: "20% avoids private mortgage insurance (PMI) and typically gets the best rate, but many programs allow 3–10%. Compare the PMI cost against the cash you'd keep for repairs and emergencies." },
  { question: "What are closing costs?", answer: "Lender, title, appraisal, and escrow fees typically run 2–5% of the purchase price. They are paid at closing on top of the down payment — budget for both together." },
  { question: "What is LTV?", answer: "Loan-to-value is the loan amount divided by the home's value. At 20% down, LTV is 80% — the threshold most lenders use to waive PMI. Higher LTV usually means a higher rate." },
];

export default function DownPaymentCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [pct, setPct] = useState(DEFAULTS.pct);
  const [closing, setClosing] = useState(DEFAULTS.closing);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [result, setResult] = useState<DownPaymentResult>(() => calcDownPayment(400000, 20, 3, 24));

  useEffect(() => {
    const p = parseFloat(price);
    const d = parseFloat(pct);
    const c = parseFloat(closing);
    const m = parseFloat(months);
    if (!isNaN(p) && !isNaN(d) && !isNaN(c) && !isNaN(m) && p > 0 && d >= 0 && d <= 100 && c >= 0 && m > 0) setResult(calcDownPayment(p, d, c, m));
  }, []);

  const handleCalculate = () => {
    const p = parseFloat(price);
    const d = parseFloat(pct);
    const c = parseFloat(closing);
    const m = parseFloat(months);
    if (!isNaN(p) && !isNaN(d) && !isNaN(c) && !isNaN(m) && p > 0 && d >= 0 && d <= 100 && c >= 0 && m > 0) setResult(calcDownPayment(p, d, c, m));
  };
  const reset = () => { setPrice(DEFAULTS.price); setPct(DEFAULTS.pct); setClosing(DEFAULTS.closing); setMonths(DEFAULTS.months); setResult(calcDownPayment(parseFloat(DEFAULTS.price), parseFloat(DEFAULTS.pct), parseFloat(DEFAULTS.closing), parseFloat(DEFAULTS.months))); };
  const invalid = isNaN(parseFloat(price)) || isNaN(parseFloat(pct)) || isNaN(parseFloat(closing)) || isNaN(parseFloat(months)) || parseFloat(price) <= 0 || parseFloat(pct) < 0 || parseFloat(pct) > 100 || parseFloat(closing) < 0 || parseFloat(months) <= 0;

  const breakdown = [
    { label: "Home Price", value: fmtMoney(result.homePrice) },
    { label: "Down Payment %", value: `${result.downPct.toFixed(1)}%` },
    { label: "Down Payment Amount", value: fmtMoney(result.downPayment), highlight: true },
    { label: "Loan Amount", value: fmtMoney(result.loanAmount) },
    { label: "Loan-to-Value (LTV)", value: `${result.ltv.toFixed(1)}%` },
    { label: "Closing Costs", value: fmtMoney(result.closingCosts) },
    { label: "Total Cash Needed at Closing", value: fmtMoney(result.cashNeeded) },
    { label: "Monthly Savings Target", value: `${fmtMoney(result.monthlySavings)}/mo over ${result.months.toFixed(0)} months` },
  ];

  const summaryStats = [
    { label: "Down Payment", value: fmtMoney(result.downPayment) },
    { label: "Loan Amount", value: fmtMoney(result.loanAmount) },
    { label: "LTV", value: `${result.ltv.toFixed(1)}%` },
    { label: "Closing Costs", value: fmtMoney(result.closingCosts) },
    { label: "Cash Needed", value: fmtMoney(result.cashNeeded) },
    { label: "Monthly Savings", value: `${fmtMoney(result.monthlySavings)}/mo` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Down Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Down Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="dp-price" className="block text-sm font-medium mb-1 text-foreground">Home Price ($)</label>
              <input id="dp-price" type="number" min="1000" step="1000" value={price} onChange={(e) => setPrice(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dp-pct" className="block text-sm font-medium mb-1 text-foreground">Down Payment (%)</label>
                <input id="dp-pct" type="number" min="0" max="100" step="0.5" value={pct} onChange={(e) => setPct(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dp-closing" className="block text-sm font-medium mb-1 text-foreground">Closing Costs (%)</label>
                <input id="dp-closing" type="number" min="0" step="0.5" value={closing} onChange={(e) => setClosing(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="dp-months" className="block text-sm font-medium mb-1 text-foreground">Savings Timeline (months)</label>
              <input id="dp-months" type="number" min="1" step="1" value={months} onChange={(e) => setMonths(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Home className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid home price, down payment 0–100%, and a positive timeline.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Down Payment</div>
              <div className="text-4xl font-extrabold text-primary">{fmtMoney(result.downPayment)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.downPct.toFixed(0)}% of {fmtMoney(result.homePrice)} · {fmtMoney(result.monthlySavings)}/mo to save</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Loan Amount</div>
                <div className="text-lg font-bold text-primary">{fmtMoney(result.loanAmount)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">LTV</div>
                <div className="text-lg font-bold text-primary">{result.ltv.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cash Needed</div>
                <div className="text-lg font-bold text-primary">{fmtMoney(result.cashNeeded)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">How the Purchase Is Funded</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmtMoney(v), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Down Payment Calculator</h2>
            <p>The down payment is the cash portion of the purchase: price × down-payment %. The loan covers the rest, giving LTV = loan ÷ price. Closing costs (typically 2–5%) are paid separately at closing, so the true cash requirement is down payment plus closing costs.</p>
            <h3>Planning the Savings</h3>
            <p>Divide the total cash needed by your savings timeline to get a monthly target. On a $400,000 home at 20% down with 3% closing costs, that is $80,000 + $12,000 = $92,000 — $3,833 per month over two years, a budget most buyers need to plan around carefully.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/down-payment-calculator" />
          <PopularCalculators exclude="/calculator/down-payment-calculator" />
        </div>
      </div>
    </>
  );
}
