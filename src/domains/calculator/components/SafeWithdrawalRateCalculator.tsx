"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, DollarSign } from "lucide-react";
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

const fmtVal = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function SafeWithdrawalRateCalculator() {
  const [portfolio, setPortfolio] = useState("1000000");
  const [swr, setSwr] = useState("4.0");
  const [inflation, setInflation] = useState("2.5");
  const [returnRate, setReturnRate] = useState("7.0");
  const [duration, setDuration] = useState("30");

  const [res, setRes] = useState<{
    initialAnnualWithdrawal: number;
    initialMonthlyWithdrawal: number;
    totalWithdrawn: number;
    finalBalance: number;
    chartData: { name: string; balance: number; annualWithdrawal: number }[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const p = parseFloat(portfolio) || 0;
    const s = (parseFloat(swr) || 0) / 100;
    const inf = (parseFloat(inflation) || 0) / 100;
    const ret = (parseFloat(returnRate) || 0) / 100;
    const dur = parseInt(duration) || 30;

    const initialAnnualWithdrawal = p * s;
    const initialMonthlyWithdrawal = initialAnnualWithdrawal / 12;

    const chartData: { name: string; balance: number; annualWithdrawal: number }[] = [];
    let bal = p;
    let withdraw = initialAnnualWithdrawal;
    let totalWithdrawn = 0;

    chartData.push({ name: "Start", balance: Math.round(bal), annualWithdrawal: Math.round(withdraw) });

    for (let y = 1; y <= dur; y++) {
      // Portfolio grows by return rate
      bal = bal * (1 + ret);
      // Withdrawal is made at end of year (or beginning, standard assumption is middle/end)
      bal = Math.max(0, bal - withdraw);
      totalWithdrawn += withdraw;

      chartData.push({ name: `Yr ${y}`, balance: Math.round(bal), annualWithdrawal: Math.round(withdraw) });

      // Next year withdrawal is adjusted upwards for inflation
      withdraw = withdraw * (1 + inf);
    }

    setRes({
      initialAnnualWithdrawal,
      initialMonthlyWithdrawal,
      totalWithdrawn,
      finalBalance: bal,
      chartData,
    });
  };

  const reset = () => {
    setPortfolio("1000000");
    setSwr("4.0");
    setInflation("2.5");
    setReturnRate("7.0");
    setDuration("30");
  };

  const faqs = [
    { question: "What is a Safe Withdrawal Rate (SWR)?", answer: "A Safe Withdrawal Rate (SWR) is the percentage of your retirement portfolio you can withdraw in your first year of retirement, and then adjust that amount upwards for inflation each subsequent year, with a high probability that the portfolio will last for the entirety of your retirement (typically 30 years)." },
    { question: "What is the 4% rule?", answer: "The 4% rule is a widely referenced rule of thumb for safe withdrawal rates. Created by financial advisor William Bengen in 1994, it shows that retirees who withdraw 4% of their portfolio in the first year and adjust for inflation thereafter have a very low risk of running out of money over a 30-year horizon, even during severe market downturns." },
    { question: "How does portfolio return affect SWR?", answer: "A higher average return allows you to sustain withdrawals longer. However, because of sequence of returns risk (the risk of experiencing poor returns early in retirement), a higher return does not guarantee you can safely withdraw a higher starting percentage. Most calculations assume a balanced portfolio of stocks and bonds." },
    { question: "What is sequence of returns risk?", answer: "This is the risk that the timing of market downturns will negatively impact your portfolio. If the market crashes in the first few years of your retirement, you are forced to withdraw funds from a shrinking portfolio, locks in losses and accelerating the depletion of your assets. This makes initial SWR percentages critical." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Safe Withdrawal Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Safe Withdrawal Rate (SWR) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Retirement Parameters</h2>
            <CompactInput id="port" label="Portfolio Balance at Retirement" value={portfolio} onChange={setPortfolio} prefix="$" />
            <CompactInput id="sw" label="Safe Withdrawal Rate" value={swr} onChange={setSwr} suffix="%" />
            <CompactInput id="inf" label="Expected Annual Inflation" value={inflation} onChange={setInflation} suffix="%" />
            <CompactInput id="ret" label="Expected Annual Portfolio Return" value={returnRate} onChange={setReturnRate} suffix="%" />
            <CompactInput id="dur" label="Retirement Duration" value={duration} onChange={setDuration} suffix="Years" />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <h2 className="text-2xl font-bold mb-3">Withdrawal Analysis</h2>
                  <span className="text-sm font-bold text-primary">SWR: {swr}%</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-4 text-center">
                    <div className="text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Initial Annual Withdrawal</div>
                    <div className="text-2xl font-extrabold text-foreground">{fmtVal(res.initialAnnualWithdrawal)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <div className="text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Initial Monthly Withdrawal</div>
                    <div className="text-2xl font-extrabold text-foreground">{fmtVal(res.initialMonthlyWithdrawal)}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Starting Capital", value: fmtVal(parseFloat(portfolio) || 0) },
                        { label: "Withdrawal Rate", value: fmtPct(parseFloat(swr) || 0) },
                        { label: "Total Amount Withdrawn", value: fmtVal(res.totalWithdrawn), bold: true },
                        { label: "Remaining Portfolio Value", value: fmtVal(res.finalBalance), bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Portfolio Balance & Withdrawal Trajectory</h3>
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
                        <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBal)" name="Portfolio Balance" />
                        <Area type="monotone" dataKey="annualWithdrawal" stroke="#10b981" fillOpacity={0} name="Annual Withdrawal" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Safe Withdrawal Rate?</h2>
            <p>The Safe Withdrawal Rate (SWR) is a crucial retirement planning formula that calculates the maximum percentage of your total savings you can withdraw in your first year of retirement, and then adjust for inflation annually, with a high probability that your money will not run out before you die.</p>
            
            <h2 className="text-2xl font-bold mb-3">The History of the 4% Rule</h2>
            <p>The 4% rule was established by William Bengen in 1994. By analyzing historical market returns of a 50/50 stock and bond portfolio over several rolling 30-year periods (including through the Great Depression and stagflation of the 1970s), Bengen found that a 4% initial withdrawal rate never exhausted the portfolio in less than 30 years. Today, some planners recommend safer rates of 3% to 3.5% for early retirees or longer retirement periods.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/safe-withdrawal-rate-calculator" />
          <PopularCalculators exclude="/calculator/safe-withdrawal-rate-calculator" />
        </div>
      </div>
    </>
  );
}
