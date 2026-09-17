"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  balance: number;
  currentApr: number;
  monthlyPayment: number;
  transferFeePct: number;
  transferApr: number;
  promoMonths: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  feeAmount: number;
  interestStay: number;
  interestTransfer: number;
  netSavings: number;
  breakevenMonth: number | null;
  payoffStay: number;
  payoffTransfer: number;
  chartData: { month: number; stay: number; transfer: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const signed = (n: number) => (n < 0 ? "−" : "") + money(Math.abs(n));

function calc(inp: Inputs): Result {
  const feeAmount = (inp.balance * inp.transferFeePct) / 100;
  const iStay = inp.currentApr / 100 / 12;
  const iTrans = inp.transferApr / 100 / 12;
  const pay = inp.monthlyPayment;

  // Simulate both paths month by month until each is paid off
  let bStay = inp.balance;
  let bTrans = inp.balance;
  let intStay = 0;
  let intTrans = 0;
  let month = 0;
  let payoffStay = 0;
  let payoffTransfer = 0;
  let saved = 0;
  let breakevenMonth: number | null = null;
  const chartData: { month: number; stay: number; transfer: number }[] = [];
  chartData.push({ month: 0, stay: Math.round(bStay), transfer: Math.round(bTrans) });

  while ((bStay > 0 || bTrans > 0) && month < 600) {
    month++;
    if (bStay > 0) {
      const interest = bStay * iStay;
      intStay += interest;
      bStay = bStay + interest - pay;
      if (bStay <= 0) {
        bStay = 0;
        payoffStay = month;
      }
    }
    if (bTrans > 0) {
      const rate = month <= inp.promoMonths ? iTrans : iStay;
      const interest = bTrans * rate;
      intTrans += interest;
      bTrans = bTrans + interest - pay;
      if (bTrans <= 0) {
        bTrans = 0;
        payoffTransfer = month;
      }
    }
    saved += bStay > 0 ? bStay * iStay : 0;
    if (breakevenMonth === null && bStay > 0 && saved >= feeAmount) breakevenMonth = month;
    if (month % 3 === 0 || (bStay <= 0 && bTrans <= 0)) {
      chartData.push({ month, stay: Math.round(bStay), transfer: Math.round(bTrans) });
    }
  }
  const netSavings = intStay - intTrans - feeAmount;

  const breakdown: Row[] = [
    { label: "Current Balance", value: money(inp.balance), sum: true },
    { label: "Current APR", value: inp.currentApr.toFixed(2) + "%", sum: true },
    { label: "Monthly Payment", value: money(pay) + "/mo", sum: true },
    { label: "Transfer Fee Rate", value: inp.transferFeePct.toFixed(1) + "%", sum: true },
    { label: "Transfer Fee Amount", value: money(feeAmount), highlight: true, sum: true },
    { label: "Transfer APR / Promo", value: inp.transferApr.toFixed(0) + "% for " + inp.promoMonths + " months", sum: true },
    { label: "Interest if You Stay", value: money(intStay), isTotal: true, sum: true },
    { label: "Interest after Transfer", value: money(intTrans), isTotal: true, sum: true },
    { label: "Net Savings from Transfer", value: money(netSavings), highlight: true, sum: true },
    { label: "Months to Pay Off — Stay", value: payoffStay >= 9999 ? "Never at this payment" : String(payoffStay) + " months", sum: true },
    { label: "Months to Pay Off — Transfer", value: payoffTransfer >= 9999 ? "Never at this payment" : String(payoffTransfer) + " months", sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return { feeAmount, interestStay: intStay, interestTransfer: intTrans, netSavings, breakevenMonth, payoffStay, payoffTransfer, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { balance: 6000, currentApr: 24, monthlyPayment: 250, transferFeePct: 3, transferApr: 0, promoMonths: 18 };

export default function CreditCardBreakEvenCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [currentApr, setCurrentApr] = useState(String(DEFAULTS.currentApr));
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [transferFeePct, setTransferFeePct] = useState(String(DEFAULTS.transferFeePct));
  const [transferApr, setTransferApr] = useState(String(DEFAULTS.transferApr));
  const [promoMonths, setPromoMonths] = useState(String(DEFAULTS.promoMonths));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    currentApr: parseFloat(currentApr) || 0,
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    transferFeePct: parseFloat(transferFeePct) || 0,
    transferApr: parseFloat(transferApr) || 0,
    promoMonths: parseInt(promoMonths) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setCurrentApr(String(DEFAULTS.currentApr));
    setMonthlyPayment(String(DEFAULTS.monthlyPayment));
    setTransferFeePct(String(DEFAULTS.transferFeePct));
    setTransferApr(String(DEFAULTS.transferApr));
    setPromoMonths(String(DEFAULTS.promoMonths));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const bal = parseFloat(balance) || 0;
  const apr = parseFloat(currentApr) || 0;
  const pay = parseFloat(monthlyPayment) || 0;
  const tFee = parseFloat(transferFeePct) || 0;
  const tApr = parseFloat(transferApr) || 0;
  const promo = parseInt(promoMonths) || 0;

  const valErrors: Record<string, string> = {};
  if (balance === "" || isNaN(parseFloat(balance))) valErrors.balance = "Enter the balance";
  else if (bal <= 0) valErrors.balance = "Balance must be greater than 0";
  if (currentApr === "" || isNaN(parseFloat(currentApr))) valErrors.currentApr = "Enter your current APR";
  else if (apr < 0) valErrors.currentApr = "APR cannot be negative";
  else if (apr > 40) valErrors.currentApr = "APR must be 40% or less";
  if (monthlyPayment === "" || isNaN(parseFloat(monthlyPayment))) valErrors.monthlyPayment = "Enter a monthly payment";
  else if (pay <= 0) valErrors.monthlyPayment = "Payment must be greater than 0";
  if (transferFeePct === "" || isNaN(parseFloat(transferFeePct))) valErrors.transferFeePct = "Enter the transfer fee";
  else if (tFee < 0) valErrors.transferFeePct = "Fee cannot be negative";
  else if (tFee > 10) valErrors.transferFeePct = "Fee must be 10% or less";
  if (transferApr === "" || isNaN(parseFloat(transferApr))) valErrors.transferApr = "Enter the transfer APR";
  else if (tApr < 0 || tApr > 40) valErrors.transferApr = "Transfer APR must be between 0% and 40%";
  if (promoMonths === "" || isNaN(parseInt(promoMonths))) valErrors.promoMonths = "Enter the promo period";
  else if (promo < 0 || promo > 60) valErrors.promoMonths = "Promo period must be 0–60 months";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  const res = result;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Credit Card Break-Even Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Break-Even Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cb-balance" className="text-sm font-medium mb-1 block">Balance to Transfer ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cb-balance" type="number" min="1" step="100" value={balance} onChange={(e) => setBalance(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}
              </div>
              <div>
                <label htmlFor="cb-apr" className="text-sm font-medium mb-1 block">Current APR (%)</label>
                <div className={inputCls}>
                  <input id="cb-apr" type="number" min="0" max="40" step="0.5" value={currentApr} onChange={(e) => setCurrentApr(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.currentApr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.currentApr}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cb-pay" className="text-sm font-medium mb-1 block">Monthly Payment ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cb-pay" type="number" min="1" step="25" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.monthlyPayment && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyPayment}</p>}
              </div>
              <div>
                <label htmlFor="cb-fee" className="text-sm font-medium mb-1 block">Transfer Fee (%)</label>
                <div className={inputCls}>
                  <input id="cb-fee" type="number" min="0" max="10" step="0.5" value={transferFeePct} onChange={(e) => setTransferFeePct(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.transferFeePct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.transferFeePct}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">New Card Terms</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="cb-tapr" className="text-sm font-medium mb-1 block">Transfer APR (%)</label>
                      <div className={inputCls}>
                        <input id="cb-tapr" type="number" min="0" max="40" step="1" value={transferApr} onChange={(e) => setTransferApr(e.target.value)} className={fieldCls} />
                        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                      </div>
                      {valErrors.transferApr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.transferApr}</p>}
                    </div>
                    <div>
                      <label htmlFor="cb-promo" className="text-sm font-medium mb-1 block">Promo Period (Months)</label>
                      <div className={inputCls}>
                        <input id="cb-promo" type="number" min="0" max="60" step="1" value={promoMonths} onChange={(e) => setPromoMonths(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.promoMonths && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.promoMonths}</p>}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">After the promo period, the balance is charged at your current APR.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {res && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Savings from Transferring</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${res.netSavings < 0 ? "text-red-600" : "text-foreground"}`}>{signed(res.netSavings)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {res.netSavings > 0
                      ? `${money(res.interestStay)} interest avoided vs. ${money(res.feeAmount)} fee — you are ahead after ${res.breakevenMonth === null ? "the payoff" : "month " + res.breakevenMonth}`
                      : res.netSavings < 0
                        ? `The ${money(res.feeAmount)} transfer fee costs more than the ${money(res.interestTransfer)} interest saved — transferring loses ${money(-res.netSavings)}`
                        : "The transfer fee exactly cancels the interest saved"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Months to Break Even", res.breakevenMonth === null ? "—" : String(res.breakevenMonth), res.breakevenMonth !== null && res.breakevenMonth <= 6 ? "text-emerald-600" : "text-amber-600"],
                    ["Transfer Fee", money(res.feeAmount), "text-primary"],
                    ["Payoff — Transfer vs Stay", res.payoffTransfer >= 9999 ? "Never" : res.payoffTransfer + " mo", "text-foreground"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Balance Payoff — Stay vs. Transfer</h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={res.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => "Mo " + v} type="number" domain={[0, "dataMax"]} allowDecimals={false} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <Tooltip formatter={(v: number, name: string) => [money(Number(v)), name === "stay" ? "Stay at current APR" : "After transfer"]} labelFormatter={(l) => "Month " + l} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="stay" name="Stay at current APR" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} strokeWidth={2} />
                      <Area type="monotone" dataKey="transfer" name="After transfer" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Green line pays the same {money(pay)}/mo but at the transfer APR — the gap between the curves is interest saved. Payoff: {res.payoffStay >= 9999 ? "never at this payment if you stay" : res.payoffStay + " months staying"} vs {res.payoffTransfer >= 9999 ? "never" : res.payoffTransfer + " months after transfer"}.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Cost Comparison</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {res.breakdown.map((r, idx) => (
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
                    {res.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">Is a Balance Transfer Worth the Fee?</h2>
            <p>A balance transfer trades a 3–5% upfront fee for months of 0% interest. It wins whenever the interest you would have paid on the old card exceeds that fee — which depends on three numbers: the size of the balance, your current APR, and how fast you can pay it down. This calculator simulates both paths month by month with the same payment: the red line is your balance at today's APR, the green line is the same balance on the transfer card, and the moment cumulative interest savings cross the transfer fee is your break-even. Two cautions the math cannot fix: transfers only help if the balance is actually paid off before the promo ends (otherwise the remaining balance reverts to a regular APR), and the discipline that makes them work — paying more than the minimum every month — is exactly what card issuers bet you will not do.</p>
          </section>
          <FAQSection faqs={[
            { question: "When does a balance transfer not make sense?", answer: "When the fee exceeds the interest you would pay — usually true for small balances (under roughly $1,000), low current APRs, or payoff plans shorter than a few months. It also fails if you cannot pay off the balance within the promo window or will carry new purchases on the same card, since payments often apply to the cheapest balance first and new purchases start accruing interest immediately." },
            { question: "How is the break-even month calculated here?", answer: "The calculator runs your exact payment schedule twice — once at the current APR and once at the transfer APR (reverting to your current APR after the promo ends) — and finds the first month where the cumulative interest saved on the transfer path exceeds the transfer fee. Until that month, you are still paying for the privilege of transferring." },
            { question: "What transfer fee should I accept?", answer: "The standard is 3% with a typical minimum of $5–$10, and 0% fee offers exist but usually come with a shorter promo or a lower credit limit. Compare fee plus interest on the full payoff schedule rather than just the fee — a 5% fee can still win if the promo window covers your entire payoff at a very high current APR." },
          ]} pageUrl="https://racira.com/calculator/credit-card-break-even-calculator" />
          <PopularCalculators exclude="/calculator/credit-card-break-even-calculator" />
        </div>
      </div>
    </>
  );
}
