"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, ArrowRightLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

const fmtVal = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export default function AnnuityPayoutCalculator() {
  const [calcMode, setCalcMode] = useState<"fixed-period" | "fixed-amount">("fixed-period");
  const [principal, setPrincipal] = useState("250000");
  const [interestRate, setInterestRate] = useState("5.0");
  const [frequency, setFrequency] = useState("12"); // 12 = Monthly, 4 = Quarterly, 1 = Annually
  const [payoutYears, setPayoutYears] = useState("20");
  const [withdrawalAmount, setWithdrawalAmount] = useState("1500");

  const [res, setRes] = useState<{
    payoutAmount: number;
    durationLabel: string;
    totalPayout: number;
    totalInterest: number;
    chartData: { name: string; balance: number; cumulativePayout: number }[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(interestRate) || 0) / 100;
    const freq = parseInt(frequency) || 12;
    const ratePerPeriod = r / freq;

    let payoutAmount = 0;
    let totalPayout = 0;
    let totalInterest = 0;
    let durationLabel = "";
    const chartData: { name: string; balance: number; cumulativePayout: number }[] = [];

    if (calcMode === "fixed-period") {
      const years = parseFloat(payoutYears) || 0;
      const totalPeriods = years * freq;

      if (totalPeriods > 0) {
        if (ratePerPeriod > 0) {
          payoutAmount = p * (ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPeriods)) / (Math.pow(1 + ratePerPeriod, totalPeriods) - 1);
        } else {
          payoutAmount = p / totalPeriods;
        }
      }

      totalPayout = payoutAmount * totalPeriods;
      totalInterest = Math.max(0, totalPayout - p);
      durationLabel = `${years} Years`;

      let bal = p;
      let cumPay = 0;
      chartData.push({ name: "Start", balance: Math.round(bal), cumulativePayout: 0 });
      for (let y = 1; y <= years; y++) {
        for (let f = 0; f < freq; f++) {
          const interest = bal * ratePerPeriod;
          bal = Math.max(0, bal + interest - payoutAmount);
          cumPay += payoutAmount;
        }
        chartData.push({ name: `Yr ${y}`, balance: Math.round(bal), cumulativePayout: Math.round(cumPay) });
      }
    } else {
      const withdraw = parseFloat(withdrawalAmount) || 0;
      payoutAmount = withdraw;
      
      let bal = p;
      let periods = 0;
      let cumPay = 0;
      chartData.push({ name: "Start", balance: Math.round(bal), cumulativePayout: 0 });

      // Safety limit of 1000 periods to prevent infinite loop
      while (bal > 0 && periods < 1200) {
        const interest = bal * ratePerPeriod;
        if (withdraw <= interest && r > 0) {
          // Withdrawal is less than interest gained, annuity will last forever
          periods = 9999;
          break;
        }
        bal = bal + interest - withdraw;
        cumPay += withdraw;
        periods++;

        if (periods % freq === 0 || bal <= 0) {
          const yr = Math.ceil(periods / freq);
          chartData.push({ name: `Yr ${yr}`, balance: Math.max(0, Math.round(bal)), cumulativePayout: Math.round(cumPay) });
        }
      }

      if (periods >= 9999) {
        durationLabel = "Indefinitely (Forever)";
        totalPayout = p; // placeholder
        totalInterest = p; // placeholder
      } else {
        const yrs = periods / freq;
        durationLabel = `${yrs.toFixed(1)} Years (${periods} Payouts)`;
        totalPayout = cumPay;
        totalInterest = Math.max(0, totalPayout - p);
      }
    }

    setRes({ payoutAmount, durationLabel, totalPayout, totalInterest, chartData });
  };

  const reset = () => {
    setPrincipal("250000");
    setInterestRate("5.0");
    setFrequency("12");
    setPayoutYears("20");
    setWithdrawalAmount("1500");
  };

  const freqLabel = { "12": "Monthly", "4": "Quarterly", "1": "Annual" }[frequency] || "Monthly";

  const faqs = [
    { question: "What is an Annuity?", answer: "An annuity is a financial contract, typically with an insurance company, where you make a lump-sum payment (or a series of payments) and, in return, receive regular disbursements starting either immediately or at some point in the future. It is widely used for retirement planning to provide guaranteed income." },
    { question: "What is the difference between Fixed Period and Fixed Amount options?", answer: "A Fixed Period annuity pays you a guaranteed amount regularly for a set number of years (e.g., 20 years). A Fixed Amount annuity lets you choose how much you want to withdraw per period, and the calculator determines how long your starting capital will last given the interest rate." },
    { question: "What interest rate should I input?", answer: "This is the annual growth rate or rate of return expected on the funds remaining in the annuity. For fixed annuities, this is guaranteed by the issuer (often 3% to 6%). For variable or indexed annuities, this depends on market performance or the index tracked." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Annuity Payout Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Annuity Payout Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Annuity Details</h2>
              <button type="button" onClick={() => setCalcMode(calcMode === "fixed-period" ? "fixed-amount" : "fixed-period")} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                <ArrowRightLeft className="h-3.5 w-3.5" /> Toggle Mode
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">Calculation Goal</span>
              <div className="grid grid-cols-2 border border-border rounded-md overflow-hidden text-xs">
                <button type="button" onClick={() => setCalcMode("fixed-period")} className={`py-2 font-bold ${calcMode === "fixed-period" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Fixed Period</button>
                <button type="button" onClick={() => setCalcMode("fixed-amount")} className={`py-2 font-bold ${calcMode === "fixed-amount" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Fixed Amount</button>
              </div>
            </div>

            <CompactInput id="pr" label="Starting Principal" value={principal} onChange={setPrincipal} prefix="$" />
            <CompactInput id="ir" label="Annual Growth Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Payment Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="12">Monthly</option>
                <option value="4">Quarterly</option>
                <option value="1">Annually</option>
              </select>
            </div>

            {calcMode === "fixed-period" ? (
              <CompactInput id="py" label="Payout Term" value={payoutYears} onChange={setPayoutYears} suffix="Years" />
            ) : (
              <CompactInput id="wa" label="Withdrawal Amount" value={withdrawalAmount} onChange={setWithdrawalAmount} prefix="$" suffix={`/${freqLabel.toLowerCase()}`} />
            )}

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Payout
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
                <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Calculation Results</h2>
                
                {calcMode === "fixed-period" ? (
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">{freqLabel} Payout Amount</div>
                    <div className="text-4xl font-extrabold text-foreground tracking-tight">{fmtVal(res.payoutAmount)}</div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Annuity Payout Lifespan</div>
                    <div className="text-4xl font-extrabold text-foreground tracking-tight">{res.durationLabel}</div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Starting Capital", value: fmtVal(parseFloat(principal) || 0) },
                        { label: `${freqLabel} Payout`, value: fmtVal(res.payoutAmount) },
                        { label: "Payout Duration", value: res.durationLabel },
                        { label: "Total Sum Paid Out", value: res.durationLabel.startsWith("Indefinitely") ? "Infinite" : fmtVal(res.totalPayout), bold: true },
                        { label: "Total Growth/Interest Earned", value: res.durationLabel.startsWith("Indefinitely") ? "Infinite" : fmtVal(res.totalInterest) },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!res.durationLabel.startsWith("Indefinitely") && mounted && (
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Annuity Trajectory Over Time</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <defs>
                          <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmtVal(v)} />
                        <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBal)" name="Remaining Balance" />
                        <Area type="monotone" dataKey="cumulativePayout" stroke="#10b981" fillOpacity={0} name="Cumulative Paid" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Annuity Payouts</h2>
            <p>An annuity is a structured long-term financial contract designed to mitigate the risk of outliving your retirement savings. You transfer a sum of cash to an insurance company or financial institution, and they invest it to produce steady income streams. The payout phase represents the period where you withdraw funds from this capital pool.</p>
            
            <h2>Key Annuity Terms</h2>
            <ul>
              <li><strong>Starting Capital (Principal):</strong> The initial amount of money deposited into the annuity fund.</li>
              <li><strong>Annual Growth Rate:</strong> The rate of interest or investment growth credited to the remaining balance in your account.</li>
              <li><strong>Payment Frequency:</strong> How often you receive payouts (usually monthly, quarterly, or annually).</li>
              <li><strong>Fixed Term vs. Fixed Amount:</strong> Fixed term yields a guaranteed payout amount that drains the balance to zero at the end of the term. Fixed amount lets you define the withdrawal size, meaning the duration will fluctuate based on interest.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annuity-payout-calculator" />
          <PopularCalculators exclude="/calculator/annuity-payout-calculator" />
        </div>
      </div>
    </>
  );
}
