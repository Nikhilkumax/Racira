"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Method = "cash" | "travel" | "transfer";

interface Inputs {
  annualSpend: number;
  earnRate: number;
  method: Method;
  annualFee: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  pointsEarned: number;
  pointValue: number;
  annualValue: number;
  effectiveRate: number;
  monthlyValue: number;
  netValue: number;
  chartData: { name: string; value: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const METHOD_VALUES: Record<Method, { label: string; cents: number }> = {
  cash: { label: "Cash Back / Statement Credit", cents: 1 },
  travel: { label: "Travel Portal (1.25¢)", cents: 1.25 },
  transfer: { label: "Transfer to Airlines / Hotels", cents: 1.5 },
};

function calc(inp: Inputs): Result {
  const pointsEarned = inp.annualSpend * inp.earnRate;
  const pointValue = METHOD_VALUES[inp.method].cents / 100;
  const annualValue = pointsEarned * pointValue;
  const monthlyValue = annualValue / 12;
  const netValue = annualValue - inp.annualFee;
  const effectiveRate = inp.annualSpend > 0 ? (annualValue / inp.annualSpend) * 100 : 0;

  const chartData = (
    [
      { name: "Cash Back", value: Math.round(pointsEarned * 0.01) },
      { name: "Travel Portal", value: Math.round(pointsEarned * 0.0125) },
      { name: "Transfer Bonus", value: Math.round(pointsEarned * 0.015) },
    ] as { name: string; value: number }[]
  ).filter((d) => d.value > 0);

  const methodLabel = METHOD_VALUES[inp.method].label;
  const breakdown: Row[] = [
    { label: "Annual Credit Card Spend", value: money(inp.annualSpend), sum: true },
    { label: "Rewards Earn Rate", value: inp.earnRate.toFixed(1) + " pts per $", sum: true },
    { label: "Points Earned per Year", value: Math.round(pointsEarned).toLocaleString("en-US") + " pts", highlight: true, sum: true },
    { label: "Redemption Method", value: methodLabel },
    { label: "Point Value", value: (METHOD_VALUES[inp.method].cents).toFixed(2) + "¢ per point", highlight: true, sum: true },
    { label: "Gross Rewards Value", value: money(annualValue), isTotal: true, sum: true },
    { label: "Annual Fee", value: money(inp.annualFee), sum: true },
    { label: "Net Rewards Value", value: money(netValue), isTotal: true, sum: true },
    { label: "Effective Cash Back Rate", value: effectiveRate.toFixed(2) + "%", sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return { pointsEarned, pointValue, annualValue, effectiveRate, monthlyValue, netValue, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { annualSpend: 24000, earnRate: 2, method: "cash", annualFee: 0 };

export default function CreditCardRewardsValueCalculator() {
  const [annualSpend, setAnnualSpend] = useState(String(DEFAULTS.annualSpend));
  const [earnRate, setEarnRate] = useState(String(DEFAULTS.earnRate));
  const [method, setMethod] = useState<Method>(DEFAULTS.method);
  const [annualFee, setAnnualFee] = useState(String(DEFAULTS.annualFee));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    annualSpend: parseFloat(annualSpend) || 0,
    earnRate: parseFloat(earnRate) || 0,
    method,
    annualFee: parseFloat(annualFee) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setAnnualSpend(String(DEFAULTS.annualSpend));
    setEarnRate(String(DEFAULTS.earnRate));
    setMethod(DEFAULTS.method);
    setAnnualFee(String(DEFAULTS.annualFee));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const spend = parseFloat(annualSpend) || 0;
  const rate = parseFloat(earnRate) || 0;
  const fee = parseFloat(annualFee) || 0;

  const valErrors: Record<string, string> = {};
  if (annualSpend === "" || isNaN(parseFloat(annualSpend))) valErrors.annualSpend = "Enter annual spending";
  else if (spend < 0) valErrors.annualSpend = "Spending cannot be negative";
  if (earnRate === "" || isNaN(parseFloat(earnRate))) valErrors.earnRate = "Enter a rewards rate";
  else if (rate < 0) valErrors.earnRate = "Rate cannot be negative";
  else if (rate > 50) valErrors.earnRate = "Rate must be 50 pts/$ or less";
  if (annualFee === "" || isNaN(parseFloat(annualFee))) valErrors.annualFee = "Enter the annual fee";
  else if (fee < 0) valErrors.annualFee = "Fee cannot be negative";
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Credit Card Rewards Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Rewards Value Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cr-spend" className="text-sm font-medium mb-1 block">Annual Card Spending ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cr-spend" type="number" min="0" step="500" value={annualSpend} onChange={(e) => setAnnualSpend(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.annualSpend && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualSpend}</p>}
              </div>
              <div>
                <label htmlFor="cr-rate" className="text-sm font-medium mb-1 block">Rewards Rate (pts per $)</label>
                <div className={inputCls}>
                  <input id="cr-rate" type="number" min="0" max="50" step="0.5" value={earnRate} onChange={(e) => setEarnRate(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.earnRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.earnRate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cr-method" className="text-sm font-medium mb-1 block">Redemption Method</label>
                <div className="relative h-10">
                  <select id="cr-method" value={method} onChange={(e) => setMethod(e.target.value as Method)} className={selectCls}>
                    <option value="cash">Cash Back / Statement Credit</option>
                    <option value="travel">Travel Portal (1.25¢)</option>
                    <option value="transfer">Transfer to Airlines / Hotels</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="cr-fee" className="text-sm font-medium mb-1 block">Annual Fee ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cr-fee" type="number" min="0" step="5" value={annualFee} onChange={(e) => setAnnualFee(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.annualFee && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualFee}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              How point values work <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up text-[13px] text-muted-foreground">
                <p><strong className="text-foreground">Cash back:</strong> 1 point = 1¢, a fixed floor you can always take.</p>
                <p><strong className="text-foreground">Travel portal:</strong> points are often worth 1.25–1.5¢ when booked through the issuer — a 25–50% boost over cash.</p>
                <p><strong className="text-foreground">Transfer partners:</strong> airline and hotel programs can deliver 1.5¢+ per point on premium redemptions, but only if you find award availability that beats the portal price.</p>
                <p className="text-[11px]">Use your realistic blended value — if you rarely book premium awards, valuing every point at 1.5¢ overstates the card's worth.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Rewards Value</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money(res.netValue)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {money(res.annualValue)} gross from {Math.round(res.pointsEarned).toLocaleString("en-US")} points{fee > 0 ? ` − ${money(fee)} annual fee` : ""} · ≈ {money2(res.monthlyValue)}/mo
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Points Earned / Year", Math.round(res.pointsEarned).toLocaleString("en-US"), "text-primary"],
                    ["Effective Cash Back", res.effectiveRate.toFixed(2) + "%", res.effectiveRate < 1 ? "text-red-600" : res.effectiveRate < 2.5 ? "text-amber-600" : "text-emerald-600"],
                    ["Net Value after Fee", money(res.netValue), fee > 0 && res.netValue < 0 ? "text-red-600" : "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Value by Redemption Method</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={res.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v))} />
                      <Tooltip formatter={(v: number) => [money(Number(v)), "Annual value"]} cursor={{ fill: "var(--muted)" }} />
                      <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {res.chartData.map((d, i) => (
                          <Cell key={i} fill={i === (method === "cash" ? 0 : method === "travel" ? 1 : 2) ? "#2563eb" : "#c7d2fe"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Same points, three redemption paths — the highlighted bar is the method you selected.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Rewards Breakdown</h3>
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
            <h2 className="text-2xl font-bold mb-3">Points Are Only Worth What You Redeem Them For</h2>
            <p>Rewards programs advertise earn rates in points, but the value you actually capture depends entirely on how you redeem. A 2-points-per-dollar card sounds identical across issuers until you compare redemption: cash back is worth a guaranteed 1¢ per point; booking through the issuer's travel portal often stretches points to 1.25–1.5¢; and transferring to airline or hotel partners can reach 1.5¢ and beyond on premium awards — or collapse toward zero if you redeem for gift cards or merchandise. The honest way to compare cards is to estimate your blended point value, multiply by the points you will realistically earn, and subtract any annual fee. This calculator does exactly that so you can see whether a higher-earning fee card actually out-values a no-fee flat-rate card for your spending.</p>
          </section>
          <FAQSection faqs={[
            { question: "How much is a credit card point worth?", answer: "Cash back is the floor at 1¢ per point. Travel portal redemptions typically run 1.25–1.5¢, and transfer partners can go higher on premium awards. If you would not otherwise travel or cannot find award space, value your points closer to the cash rate rather than the aspirational one." },
            { question: "How do I compare a fee card to a free one?", answer: "Multiply your expected annual spend by the earn rate to get points, convert at your realistic point value, and subtract the fee. The card with the higher net value wins for your pattern. Category bonuses matter — if a card earns 4× on dining and you spend heavily there, run your category spend through its own rate." },
            { question: "Why do issuers say points have no cash value?", answer: "Because they are promotional credits, not currency — terms allow programs to change values or partners at any time. That is precisely why you should redeem points regularly rather than hoarding them, and why valuing points at their guaranteed cash-back floor is the safest planning assumption." },
          ]} pageUrl="https://racira.com/calculator/credit-card-rewards-value-calculator" />
          <PopularCalculators exclude="/calculator/credit-card-rewards-value-calculator" />
        </div>
      </div>
    </>
  );
}
