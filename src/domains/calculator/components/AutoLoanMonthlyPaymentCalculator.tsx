"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs {
  vehiclePrice: number;
  downPayment: number;
  apr: number;
  termMonths: number;
  tradeIn: number;
  salesTaxPct: number;
  fees: number;
}

interface MonthRow {
  int: number;
  prin: number;
}

interface YearRow {
  year: string;
  principal: number;
  interest: number;
}

interface Result {
  financedAmount: number;
  salesTax: number;
  taxablePrice: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalCost: number;
  years: YearRow[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const taxablePrice = Math.max(0, inp.vehiclePrice - inp.tradeIn);
  const salesTax = taxablePrice * (inp.salesTaxPct / 100);
  const financedAmount = Math.max(0, inp.vehiclePrice - inp.downPayment - inp.tradeIn + salesTax + inp.fees);
  const r = inp.apr / 100 / 12;
  const n = inp.termMonths;
  const monthlyPayment = r > 0 && financedAmount > 0 ? (financedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : financedAmount > 0 ? financedAmount / n : 0;
  const totalPayment = monthlyPayment * n;
  const totalInterest = Math.max(0, totalPayment - financedAmount);
  const totalCost = inp.downPayment + inp.tradeIn + totalPayment;

  const sched: MonthRow[] = [];
  let bal = financedAmount;
  while (bal > 0.5 && sched.length < n) {
    const int = bal * r;
    const prin = Math.min(monthlyPayment - int, bal);
    sched.push({ int, prin });
    bal -= prin;
  }
  const years: YearRow[] = [];
  const yCount = Math.ceil(sched.length / 12);
  for (let y = 0; y < yCount && y < 12; y++) {
    const slice = sched.slice(y * 12, (y + 1) * 12);
    years.push({
      year: "Yr " + (y + 1),
      principal: Math.round(slice.reduce((a, m) => a + m.prin, 0)),
      interest: Math.round(slice.reduce((a, m) => a + m.int, 0)),
    });
  }

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Vehicle Price", value: fmt(inp.vehiclePrice) },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Trade-In Value", value: inp.tradeIn > 0 ? fmt(inp.tradeIn) : "None" },
    { label: "Sales Tax (" + inp.salesTaxPct + "%)", value: fmt(salesTax) },
    { label: "Doc & Other Fees", value: inp.fees > 0 ? fmt(inp.fees) : "None" },
    { label: "Amount Financed", value: fmt(financedAmount), highlight: true },
    { label: "APR / Term", value: inp.apr + "% / " + inp.termMonths + " mo" },
    { label: "Monthly Payment", value: fmtD(monthlyPayment), highlight: true },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Paid Over Term", value: fmt(totalPayment), isTotal: true },
    { label: "Total Cost of Vehicle", value: fmt(totalCost), isTotal: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: fmtD(monthlyPayment) },
    { label: "Amount Financed", value: fmt(financedAmount) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Paid Over Term", value: fmt(totalPayment) },
    { label: "Sales Tax", value: fmt(salesTax) },
    { label: "Down Payment", value: fmt(inp.downPayment) },
    { label: "Trade-In", value: inp.tradeIn > 0 ? fmt(inp.tradeIn) : "None" },
    { label: "Total Cost", value: fmt(totalCost) },
  ];

  return { financedAmount, salesTax, taxablePrice, monthlyPayment, totalPayment, totalInterest, totalCost, years, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { vehiclePrice: 32000, downPayment: 4000, apr: 6.5, termMonths: 60, tradeIn: 5000, salesTaxPct: 7, fees: 500 };

export default function AutoLoanMonthlyPaymentCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(String(DEFAULTS.vehiclePrice));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [tradeIn, setTradeIn] = useState(String(DEFAULTS.tradeIn));
  const [salesTaxPct, setSalesTaxPct] = useState(String(DEFAULTS.salesTaxPct));
  const [fees, setFees] = useState(String(DEFAULTS.fees));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    vehiclePrice: parseFloat(vehiclePrice) || 0,
    downPayment: parseFloat(downPayment) || 0,
    apr: parseFloat(apr) || 0,
    termMonths: parseInt(termMonths) || 1,
    tradeIn: parseFloat(tradeIn) || 0,
    salesTaxPct: parseFloat(salesTaxPct) || 0,
    fees: parseFloat(fees) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setVehiclePrice(String(DEFAULTS.vehiclePrice));
    setDownPayment(String(DEFAULTS.downPayment));
    setApr(String(DEFAULTS.apr));
    setTermMonths(String(DEFAULTS.termMonths));
    setTradeIn(String(DEFAULTS.tradeIn));
    setSalesTaxPct(String(DEFAULTS.salesTaxPct));
    setFees(String(DEFAULTS.fees));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const price = parseFloat(vehiclePrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const rate = parseFloat(apr) || 0;
  const term = parseInt(termMonths) || 0;
  const trade = parseFloat(tradeIn) || 0;
  const taxPct = parseFloat(salesTaxPct) || 0;
  const fee = parseFloat(fees) || 0;

  const valErrors: Record<string, string> = {};
  if (!vehiclePrice || price <= 0) valErrors.vehiclePrice = "Vehicle price must be greater than $0";
  if (down < 0) valErrors.downPayment = "Down payment must be $0 or more";
  else if (down >= price) valErrors.downPayment = "Down payment must be less than the vehicle price";
  if (!apr || rate <= 0) valErrors.apr = "APR must be greater than 0%";
  else if (rate > 25) valErrors.apr = "APR must be 25% or less";
  if (!termMonths || term <= 0) valErrors.termMonths = "Term must be greater than 0 months";
  else if (term > 96) valErrors.termMonths = "Term must be 96 months or less";
  if (trade < 0) valErrors.tradeIn = "Trade-in must be $0 or more";
  else if (trade >= price) valErrors.tradeIn = "Trade-in must be less than the vehicle price";
  if (taxPct < 0 || taxPct > 30) valErrors.salesTaxPct = "Sales tax must be 0%–30%";
  if (fee < 0) valErrors.fees = "Fees must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Auto Loan Monthly Payment Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Loan Monthly Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Vehicle Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={vehiclePrice} onChange={e => setVehiclePrice(e.target.value)} className={c} /></div>{valErrors.vehiclePrice && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.vehiclePrice}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={c} /></div>{valErrors.downPayment && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPayment}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">APR (%)</label><div className={i}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Months)</label><div className={i}><input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>{valErrors.termMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termMonths}</p>}</div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Price Adjustments</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium mb-1 block">Trade-In Value ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={tradeIn} onChange={e => setTradeIn(e.target.value)} className={c} /></div>{valErrors.tradeIn && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.tradeIn}</p>}</div>
                    <div><label className="text-sm font-medium mb-1 block">Sales Tax (%)</label><div className={i}><input type="number" value={salesTaxPct} onChange={e => setSalesTaxPct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.salesTaxPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.salesTaxPct}</p>}</div>
                    <div className="col-span-2"><label className="text-sm font-medium mb-1 block">Doc &amp; Other Fees ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={fees} onChange={e => setFees(e.target.value)} className={c} /></div>{valErrors.fees && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.fees}</p>}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Financing {result.financedAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} for {termMonths} months at {apr}% APR</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Amount Financed", "$" + Math.round(result.financedAmount).toLocaleString("en-US"), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-red-500"],
                ["Total Cost of Vehicle", "$" + Math.round(result.totalCost).toLocaleString("en-US"), "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Yearly Principal vs Interest</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.years} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                  <Tooltip formatter={(v: number) => ["$" + Math.round(v).toLocaleString("en-US"), ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="principal" name="Principal Paid" stackId="a"><Cell fill="#2563eb" /></Bar>
                  <Bar dataKey="interest" name="Interest Paid" stackId="a" radius={[3, 3, 0, 0]}><Cell fill="#f59e0b" /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, idx) => (
                    <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">What Drives Your Auto Payment</h2>
          <p>Your monthly auto payment is the amortized installment on the amount financed: price minus down payment and trade-in, plus sales tax and fees. Because sales tax is often charged on the price after trade-in (in most states), the trade-in can shrink both the financed amount and the tax. Lengthening the term lowers the payment but raises total interest — a 72-month loan at the same rate can cost thousands more than 60 months, which is why the total-cost figures here matter more than the monthly number alone.</p>
        </section>
        <FAQSection faqs={[
          { question: "How is an auto loan payment calculated?", answer: "Payment = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where P is the amount financed (price − down − trade-in + tax + fees), r is the monthly APR, and n is the number of months." },
          { question: "Does a trade-in reduce sales tax?", answer: "In most states, sales tax is levied on the price minus the trade-in value, which is why the calculator applies tax to the taxable price after the trade-in. A handful of states tax the full price regardless." },
          { question: "Is a longer term ever better?", answer: "Only if the lower payment is essential to your budget. Longer terms carry more interest and can leave you owing more than the car is worth. If you extend the term, make extra principal payments to offset the drag." },
        ]} pageUrl="https://racira.com/calculator/auto-loan-monthly-payment-calculator" />
        <PopularCalculators exclude="/calculator/auto-loan-monthly-payment-calculator" />
      </div>
    </div>
  </>);
}
