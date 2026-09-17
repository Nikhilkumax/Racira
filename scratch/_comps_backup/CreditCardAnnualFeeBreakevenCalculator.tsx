"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";

interface Inputs {
  annualFee: number;
  feeRate: number;
  noFeeRate: number;
  annualSpend: number;
  signupBonus: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  extraRewards: number;
  netAdvantage: number;
  netYear1: number;
  breakevenSpend: number;
  rateGap: number;
  feeAsPct: number;
  worthIt: boolean;
  chartData: { spend: number; ongoing: number; year1: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const rateGap = inp.feeRate - inp.noFeeRate;
  const extraRewards = (inp.annualSpend * rateGap) / 100;
  const netAdvantage = extraRewards - inp.annualFee;
  const netYear1 = netAdvantage + inp.signupBonus;
  const breakevenSpend = rateGap > 0 ? (inp.annualFee / rateGap) * 100 : Number.POSITIVE_INFINITY;
  const feeAsPct = inp.annualSpend > 0 ? (inp.annualFee / inp.annualSpend) * 100 : 0;
  const worthIt = netYear1 >= 0;

  const chartData: { spend: number; ongoing: number; year1: number }[] = [];
  for (let s = 0; s <= Math.max(30000, Math.ceil((breakevenSpend + 10000) / 5000) * 5000); s += 5000) {
    chartData.push({
      spend: s,
      ongoing: Math.round((s * rateGap) / 100 - inp.annualFee),
      year1: Math.round((s * rateGap) / 100 - inp.annualFee + inp.signupBonus),
    });
  }

  const breakdown: Row[] = [
    { label: "Annual Fee (Fee Card)", value: money(inp.annualFee), sum: true },
    { label: "Fee Card Rewards Rate", value: inp.feeRate.toFixed(2) + "%", sum: true },
    { label: "No-Fee Card Rewards Rate", value: inp.noFeeRate.toFixed(2) + "%", sum: true },
    { label: "Rewards Rate Advantage", value: rateGap.toFixed(2) + " pts / $1", highlight: rateGap <= 0, sum: true },
    { label: "Annual Spending", value: money(inp.annualSpend), sum: true },
    { label: "Extra Rewards vs. No-Fee Card", value: money(extraRewards), highlight: true, sum: true },
    { label: "Sign-Up Bonus (Year 1)", value: money(inp.signupBonus), sum: true },
    { label: "Fee as % of Spending", value: feeAsPct.toFixed(2) + "%", sum: true },
    { label: "Net Advantage — Year 1", value: money(netYear1), isTotal: true, sum: true },
    { label: "Net Advantage — Ongoing", value: money(netAdvantage), isTotal: true, sum: true },
    { label: "Break-Even Annual Spend", value: isFinite(breakevenSpend) ? money(breakevenSpend) : "Never (fee exceeds rewards)", highlight: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return { extraRewards, netAdvantage, netYear1, breakevenSpend, rateGap, feeAsPct, worthIt, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { annualFee: 95, feeRate: 2, noFeeRate: 1, annualSpend: 15000, signupBonus: 0 };

export default function CreditCardAnnualFeeBreakevenCalculator() {
  const [annualFee, setAnnualFee] = useState(String(DEFAULTS.annualFee));
  const [feeRate, setFeeRate] = useState(String(DEFAULTS.feeRate));
  const [noFeeRate, setNoFeeRate] = useState(String(DEFAULTS.noFeeRate));
  const [annualSpend, setAnnualSpend] = useState(String(DEFAULTS.annualSpend));
  const [signupBonus, setSignupBonus] = useState(String(DEFAULTS.signupBonus));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    annualFee: parseFloat(annualFee) || 0,
    feeRate: parseFloat(feeRate) || 0,
    noFeeRate: parseFloat(noFeeRate) || 0,
    annualSpend: parseFloat(annualSpend) || 0,
    signupBonus: parseFloat(signupBonus) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setAnnualFee(String(DEFAULTS.annualFee));
    setFeeRate(String(DEFAULTS.feeRate));
    setNoFeeRate(String(DEFAULTS.noFeeRate));
    setAnnualSpend(String(DEFAULTS.annualSpend));
    setSignupBonus(String(DEFAULTS.signupBonus));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const fee = parseFloat(annualFee) || 0;
  const fr = parseFloat(feeRate) || 0;
  const nr = parseFloat(noFeeRate) || 0;
  const spend = parseFloat(annualSpend) || 0;
  const bonus = parseFloat(signupBonus) || 0;

  const valErrors: Record<string, string> = {};
  if (annualFee === "" || isNaN(parseFloat(annualFee))) valErrors.annualFee = "Enter the annual fee";
  else if (fee < 0) valErrors.annualFee = "Annual fee cannot be negative";
  else if (fee > 700) valErrors.annualFee = "Annual fee looks too high";
  if (feeRate === "" || isNaN(parseFloat(feeRate))) valErrors.feeRate = "Enter the fee card rewards rate";
  else if (fr < 0) valErrors.feeRate = "Rate cannot be negative";
  else if (fr > 10) valErrors.feeRate = "Rate must be 10% or less";
  if (noFeeRate === "" || isNaN(parseFloat(noFeeRate))) valErrors.noFeeRate = "Enter the no-fee rewards rate";
  else if (nr < 0) valErrors.noFeeRate = "Rate cannot be negative";
  else if (nr > 10) valErrors.noFeeRate = "Rate must be 10% or less";
  if (annualSpend === "" || isNaN(parseFloat(annualSpend))) valErrors.annualSpend = "Enter annual spending";
  else if (spend < 0) valErrors.annualSpend = "Spending cannot be negative";
  if (signupBonus === "" || isNaN(parseFloat(signupBonus))) valErrors.signupBonus = "Enter the sign-up bonus";
  else if (bonus < 0) valErrors.signupBonus = "Bonus cannot be negative";
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Credit Card Annual Fee Breakeven Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Annual Fee Breakeven Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-fee" className="text-sm font-medium mb-1 block">Annual Fee ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cc-fee" type="number" min="0" step="5" value={annualFee} onChange={(e) => setAnnualFee(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.annualFee && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualFee}</p>}
              </div>
              <div>
                <label htmlFor="cc-feepercent" className="text-sm font-medium mb-1 block">Fee Card Rewards (%)</label>
                <div className={inputCls}>
                  <input id="cc-feepercent" type="number" min="0" max="10" step="0.1" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.feeRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.feeRate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-nofeepercent" className="text-sm font-medium mb-1 block">No-Fee Rewards (%)</label>
                <div className={inputCls}>
                  <input id="cc-nofeepercent" type="number" min="0" max="10" step="0.1" value={noFeeRate} onChange={(e) => setNoFeeRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.noFeeRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.noFeeRate}</p>}
              </div>
              <div>
                <label htmlFor="cc-spend" className="text-sm font-medium mb-1 block">Annual Spending ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cc-spend" type="number" min="0" step="500" value={annualSpend} onChange={(e) => setAnnualSpend(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.annualSpend && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualSpend}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">One-Time Incentives</div>
                  <div>
                    <label htmlFor="cc-bonus" className="text-sm font-medium mb-1 block">Sign-Up Bonus Value ($)</label>
                    <div className={inputCls}>
                      <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                      <input id="cc-bonus" type="number" min="0" step="50" value={signupBonus} onChange={(e) => setSignupBonus(e.target.value)} className={fieldCls} />
                    </div>
                    {valErrors.signupBonus && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.signupBonus}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">Estimate the cash value of points, statement credit, or travel — it only helps in year 1.</p>
                  </div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{res.worthIt ? "Net Advantage — Fee Card Wins" : "Net Cost — No-Fee Card Wins"}</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${res.worthIt ? "text-foreground" : "text-foreground"}`}>{bonus > 0 ? money(res.netYear1) + " (Yr 1)" : money(res.netAdvantage)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {res.netAdvantage >= 0
                      ? `Fee card beats the no-fee card by ${money(res.netAdvantage)}/yr ongoing${bonus > 0 ? " — " + money(bonus) + " more in year 1" : ""}`
                      : `Fee card costs ${money(-res.netAdvantage)}/yr more than a no-fee card${bonus > 0 ? " in years after the sign-up bonus" : ""}`}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Break-Even Annual Spend", isFinite(res.breakevenSpend) ? money(res.breakevenSpend) : "Never", res.breakevenSpend >= 0 && res.breakevenSpend <= 30000 ? "text-amber-600" : "text-red-600"],
                    ["Rewards Advantage", "+" + res.rateGap.toFixed(2) + "%", "text-primary"],
                    ["Fee as % of Spend", res.feeAsPct.toFixed(2) + "%", res.feeAsPct < 0.75 ? "text-emerald-600" : "text-amber-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Net Advantage vs. Annual Spending</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={res.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="spend" tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v))} />
                      <Tooltip formatter={(v: number, name: string) => [money(Number(v)), name === "ongoing" ? "Ongoing (year 2+)" : "Year 1 (with bonus)"]} labelFormatter={(l) => "Annual spend: " + money(Number(l))} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
                      {isFinite(res.breakevenSpend) && <ReferenceLine x={res.breakevenSpend} stroke="#f59e0b" strokeDasharray="4 3" />}
                      <Line type="monotone" dataKey="year1" name="Year 1 (with bonus)" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ongoing" name="Ongoing (year 2+)" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Above $0 you come out ahead of the no-fee card{isFinite(res.breakevenSpend) ? ` — the orange line marks the ${money(res.breakevenSpend)} break-even spend` : ""}. Your spending is {money(spend)}.
                  </p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
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
            <h2 className="text-2xl font-bold mb-3">When an Annual Fee Pays for Itself</h2>
            <p>An annual-fee card is worth it when the extra rewards you earn over a free card exceed the fee. The math is simple: divide the fee by the rewards-rate gap to find your break-even spend. A $95 card earning 2% beats a free 1% card once you charge more than $9,500 a year — below that, you are paying the bank for the privilege of fewer rewards. Three things tilt the scales: category bonuses (a 4% dining card on a $20,000 dining-heavy spend earns far more than its flat rate suggests — treat categories as separate cards), credits that offset the fee (travel credits, lounge access, and statement credits effectively lower the fee you pay), and one-time sign-up bonuses, which often make the first year profitable even at low spend. This calculator models the flat-rate comparison; for category cards, run each spending category as its own comparison or use your blended rate.</p>
          </section>
          <FAQSection faqs={[
            { question: "How do I calculate break-even spend for a fee card?", answer: "Take the annual fee and divide it by the rewards-rate difference between the fee card and your best no-fee alternative. With a $95 fee and a 1% rate gap (2% vs. 1%), you break even at $95 / 0.01 = $9,500 of annual spending. Spend more and the fee card wins; spend less and it loses." },
            { question: "Do credits and perks count against the fee?", answer: "Yes — treat them as cash. If a card charges $550 but includes a $300 travel credit, a $100 airline fee credit, and $120 in ride-share credits you would use anyway, your effective fee is $30, not $550, which makes the break-even point dramatically easier to clear. Only count credits you would genuinely use at face value." },
            { question: "Is a sign-up bonus worth chasing for the fee card?", answer: "Usually yes for year one — a $200 bonus on the $95 card means you are ahead by $105 before earning a single reward point, so even modest spending keeps year one positive. The decision that matters is year two and beyond, when the bonus is gone and only the ongoing rewards gap must cover the fee. Never carry a balance on a fee card; interest at 20%+ APR swamps any rewards math." },
          ]} pageUrl="https://racira.com/calculator/credit-card-annual-fee-breakeven-calculator" />
          <PopularCalculators exclude="/calculator/credit-card-annual-fee-breakeven-calculator" />
        </div>
      </div>
    </>
  );
}
