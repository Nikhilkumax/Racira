"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface HelocResult {
  drawPeriodPayment: number;
  repaymentPayment: number;
  totalInterestDraw: number;
  totalInterestRepay: number;
  totalInterest: number;
  totalCost: number;
  availableCredit: number;
  chartData: { period: string; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcHeloc(homeValue: number, mortgageBalance: number, drawAmount: number, drawRate: number, repayRate: number, drawYears: number, repayYears: number): HelocResult {
  const maxLtv = 0.85;
  const maxCredit = homeValue * maxLtv - mortgageBalance;
  const availableCredit = Math.max(0, maxCredit);

  const rDraw = drawRate / 100 / 12;
  const drawMonths = drawYears * 12;
  const drawPayment = drawAmount * rDraw; // interest only during draw

  const totalInterestDraw = drawPayment * drawMonths;

  const rRepay = repayRate / 100 / 12;
  const repayMonths = repayYears * 12;
  const repayPayment = repayMonths > 0 && rRepay > 0
    ? (drawAmount * rRepay) / (1 - Math.pow(1 + rRepay, -repayMonths))
    : drawAmount / repayMonths;

  const totalInterestRepay = repayPayment * repayMonths - drawAmount;
  const totalInterest = totalInterestDraw + totalInterestRepay;
  const totalCost = drawAmount + totalInterest;

  const chartData: { period: string; balance: number }[] = [];
  // Draw period — balance stays at draw amount (interest only)
  for (let y = 0; y <= drawYears; y++) {
    chartData.push({ period: `Yr ${y}`, balance: Math.round(drawAmount) });
  }
  // Repayment period
  let bal = drawAmount;
  for (let y = 1; y <= repayYears; y++) {
    for (let m = 0; m < 12; m++) {
      const int = bal * rRepay;
      bal = bal - (repayPayment - int);
    }
    chartData.push({ period: `Yr ${drawYears + y}`, balance: Math.max(0, Math.round(bal)) });
  }

  const breakdown = [
    { label: "Home Value", value: `$${homeValue.toLocaleString()}` },
    { label: "Mortgage Balance", value: `$${mortgageBalance.toLocaleString()}` },
    { label: "Max Credit Line (85% LTV)", value: `$${availableCredit.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Draw Amount", value: `$${drawAmount.toLocaleString()}` },
    { label: "Draw Period Payment (Int. Only)", value: `$${drawPayment.toFixed(2)}/mo` },
    { label: "Draw Rate (Variable)", value: `${drawRate}%` },
    { label: "Repayment Payment", value: `$${repayPayment.toFixed(2)}/mo` },
    { label: "Repayment Rate", value: `${repayRate}%` },
    { label: "Interest During Draw", value: `$${totalInterestDraw.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest During Repayment", value: `$${totalInterestRepay.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Cost of HELOC", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Draw Payment", value: `$${drawPayment.toFixed(2)}/mo` },
    { label: "Repayment Payment", value: `$${repayPayment.toFixed(2)}/mo` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Available Credit", value: `$${availableCredit.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Current LTV", value: `${((mortgageBalance / homeValue) * 100).toFixed(1)}%` },
  ];

  return { drawPeriodPayment: drawPayment, repaymentPayment: repayPayment, totalInterestDraw, totalInterestRepay, totalInterest, totalCost, availableCredit, chartData, breakdown, summaryStats };
}

const DEFAULTS = { homeValue: "500000", mortgage: "250000", draw: "80000", drawRate: "8.5", repayRate: "8.5", drawYears: "10", repayYears: "20" };

export default function HelocCalculator() {
  const [homeValue, setHomeValue] = useState(DEFAULTS.homeValue);
  const [mortgage, setMortgage] = useState(DEFAULTS.mortgage);
  const [draw, setDraw] = useState(DEFAULTS.draw);
  const [drawRate, setDrawRate] = useState(DEFAULTS.drawRate);
  const [repayRate, setRepayRate] = useState(DEFAULTS.repayRate);
  const [drawYears, setDrawYears] = useState(DEFAULTS.drawYears);
  const [repayYears, setRepayYears] = useState(DEFAULTS.repayYears);
  const [result, setResult] = useState<HelocResult | null>(null);

  const calculate = () => setResult(calcHeloc(parseFloat(homeValue)||500000, parseFloat(mortgage)||250000, parseFloat(draw)||80000, parseFloat(drawRate)||8.5, parseFloat(repayRate)||8.5, parseInt(drawYears)||10, parseInt(repayYears)||20));
  const reset = () => { setHomeValue(DEFAULTS.homeValue); setMortgage(DEFAULTS.mortgage); setDraw(DEFAULTS.draw); setDrawRate(DEFAULTS.drawRate); setRepayRate(DEFAULTS.repayRate); setDrawYears(DEFAULTS.drawYears); setRepayYears(DEFAULTS.repayYears); setResult(calcHeloc(500000,250000,80000,8.5,8.5,10,20)); };
  useEffect(() => { setResult(calcHeloc(500000,250000,80000,8.5,8.5,10,20)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a HELOC?", answer: "A Home Equity Line of Credit (HELOC) lets you borrow against your home equity — the difference between your home's value and mortgage balance. HELOCs work like a credit card: you get a credit limit, draw funds as needed during the draw period (usually 10 years), then repay over the repayment period (usually 20 years)." },
    { question: "How much can I borrow with a HELOC?", answer: "Most lenders allow a combined loan-to-value (CLTV) of up to 80–85%. Formula: Max HELOC = (Home Value × 85%) − Mortgage Balance. Example: $500,000 home, $250,000 mortgage → Max HELOC = $175,000. Your actual credit line may be less based on credit score, income, and lender policies." },
    { question: "What are current HELOC rates?", answer: "HELOC rates are variable, tied to the prime rate. As of 2024, HELOC rates range from 8–10% for qualified borrowers. During the draw period you typically pay interest only, which makes payments lower but means no principal reduction. Rates reset regularly based on the prime rate." },
    { question: "HELOC vs. Home Equity Loan?", answer: "HELOC: variable rate, revolving credit line, flexible draws, interest-only payments during draw period. Home Equity Loan: fixed rate, lump sum upfront, fixed monthly payments immediately. HELOCs are better for ongoing projects with uncertain costs. Home equity loans are better for one-time large expenses where rate certainty matters." },
    { question: "What can I use a HELOC for?", answer: "Best uses: home renovations (adds value), consolidating high-interest debt, education expenses, emergency fund access. Poor uses: vacations, everyday spending, car purchases. Interest may be tax-deductible when used for home improvement (consult a tax advisor). Risk: defaulting means losing your home." },
    { question: "What happens at the end of the draw period?", answer: "When the draw period ends, you can no longer borrow and must repay the outstanding balance. Payments increase significantly because they now include principal. This 'payment shock' catches many borrowers off guard. Some HELOCs require a lump-sum balloon payment; others convert to a 20-year amortizing loan." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "HELOC Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">HELOC Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Home Value</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homeValue} onChange={e => setHomeValue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Mortgage Balance</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={mortgage} onChange={e => setMortgage(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Draw Amount</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={draw} onChange={e => setDraw(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Draw Rate</label>
                <div className={inp}><input type="number" value={drawRate} onChange={e => setDrawRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Repay Rate</label>
                <div className={inp}><input type="number" value={repayRate} onChange={e => setRepayRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Draw Period</label>
                <div className={inp}><input type="number" value={drawYears} onChange={e => setDrawYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Repay Period</label>
                <div className={inp}><input type="number" value={repayYears} onChange={e => setRepayYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Draw Period Payment (Interest Only)</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.drawPeriodPayment.toFixed(2)}/mo</div>
                <div className="text-sm text-muted-foreground mt-1">Repayment payment: ${result.repaymentPayment.toFixed(2)}/mo · Total interest: ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Available Credit", `$${result.availableCredit.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Cost", `$${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">HELOC Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Cost of HELOC" ? "font-bold border-t-2 border-border text-primary" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Over Loan Life</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} />
                    <Bar dataKey="balance" name="Balance" fill="hsl(var(--primary))" radius={[2,2,0,0]} />
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a HELOC?</h2>
            <p>A Home Equity Line of Credit (HELOC) is a revolving credit line secured by your home equity. Unlike a traditional loan, you draw funds as needed up to your credit limit during the draw period, making it ideal for ongoing expenses like home renovations. This <strong>HELOC calculator</strong> estimates your interest-only draw period payments, principal-and-interest repayment payments, and total interest cost over the life of the line.</p>
            <h2 className="text-2xl font-bold mb-3">How HELOC Payments Are Calculated</h2>
            <p>Draw Period (interest only): Payment = Balance × Monthly Rate. Repayment Period: Payment = P × [r(1+r)^n] ÷ [(1+r)^n − 1]. Where P = outstanding balance, r = monthly rate, n = repayment months. Maximum credit line = (Home Value × 85%) − Existing Mortgage Balance.</p>
            <h2 className="text-2xl font-bold mb-3">HELOC Rates and Terms</h2>
            <p>HELOCs are variable-rate products tied to the prime rate (currently 8.5% as of 2024). Draw periods typically run 5–10 years with interest-only payments. Repayment periods are 10–20 years. Some lenders offer rate caps to limit how high your rate can go. Compare HELOCs from credit unions, banks, and online lenders.</p>
            <h2 className="text-2xl font-bold mb-3">Smart HELOC Strategies</h2>
            <p>Use HELOCs for home improvements that increase property value — the interest may be tax-deductible. Avoid drawing for consumer spending or depreciating assets. Have a repayment plan before drawing — the payment shock at end of draw period catches many homeowners unprepared. Consider fixing the rate during repayment if rates are expected to rise.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/heloc-calculator" />
          <PopularCalculators exclude="/calculator/heloc-calculator" />
        </div>
      </div>
    </>
  );
}
