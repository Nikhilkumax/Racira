"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DepreciationRecaptureResult {
  adjustedBasis: number;
  totalGain: number;
  recaptureAmount: number;
  capitalGain: number;
  recaptureTax: number;
  capitalGainTax: number;
  totalTax: number;
  netProceeds: number;
  barData: { category: string; amount: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDepreciationRecapture(purchasePrice: number, improvements: number, depreciationTaken: number, salePrice: number, sellingCosts: number, incomeBracket: number): DepreciationRecaptureResult {
  const adjustedBasis = purchasePrice + improvements - depreciationTaken;
  const netSalesPrice = salePrice - sellingCosts;
  const totalGain = Math.max(0, netSalesPrice - adjustedBasis);
  
  // Section 1250 Unrecaptured Depreciation is capped at either the actual depreciation taken or the total gain, whichever is lower.
  const recaptureAmount = Math.min(totalGain, depreciationTaken);
  const capitalGain = Math.max(0, totalGain - recaptureAmount);
  
  // Tax rate assumptions: Section 1250 recapture maxes at 25%, Capital gains at 15% (simplified for typical investor)
  // We'll use the user's income bracket to cap the recapture tax rate. If bracket > 25%, use 25%.
  const recaptureRate = Math.min(incomeBracket / 100, 0.25);
  // Cap gains rate simplified: 15% for middle brackets, 20% for top
  const capGainRate = incomeBracket > 32 ? 0.20 : 0.15;

  const recaptureTax = recaptureAmount * recaptureRate;
  const capitalGainTax = capitalGain * capGainRate;
  const totalTax = recaptureTax + capitalGainTax;
  const netProceeds = netSalesPrice - totalTax;

  const barData = [
    { category: "Recapture Tax", amount: Math.round(recaptureTax), fill: "#ef4444" },
    { category: "Capital Gains Tax", amount: Math.round(capitalGainTax), fill: "#f59e0b" },
    { category: "Net Profit (After Tax)", amount: Math.round(netProceeds - purchasePrice - improvements), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Original Purchase Price", value: `$${purchasePrice.toLocaleString()}` },
    { label: "Capital Improvements", value: `$${improvements.toLocaleString()}` },
    { label: "Less: Depreciation Taken", value: `-$${depreciationTaken.toLocaleString()}` },
    { label: "Adjusted Cost Basis", value: `$${adjustedBasis.toLocaleString()}` },
    { label: "Net Sales Price (after costs)", value: `$${netSalesPrice.toLocaleString()}` },
    { label: "Total Realized Gain", value: `$${totalGain.toLocaleString()}` },
    { label: "Unrecaptured Sec. 1250 Gain", value: `$${recaptureAmount.toLocaleString()} (@ ${(recaptureRate * 100).toFixed(0)}%)` },
    { label: "Long-Term Capital Gain", value: `$${capitalGain.toLocaleString()} (@ ${(capGainRate * 100).toFixed(0)}%)` },
    { label: "Estimated Total Tax Due", value: `$${totalTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Total Realized Gain", value: `$${totalGain.toLocaleString()}` },
    { label: "Recapture Tax", value: `$${recaptureTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Capital Gains Tax", value: `$${capitalGainTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Tax Liability", value: `$${totalTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { adjustedBasis, totalGain, recaptureAmount, capitalGain, recaptureTax, capitalGainTax, totalTax, netProceeds, barData, breakdown, summaryStats };
}

const DEFAULTS = { purchase: "300000", improvements: "50000", depreciation: "60000", sale: "500000", costs: "30000", bracket: "24" };

export default function DepreciationRecaptureCalculator() {
  const [purchase, setPurchase] = useState(DEFAULTS.purchase);
  const [improvements, setImprovements] = useState(DEFAULTS.improvements);
  const [depreciation, setDepreciation] = useState(DEFAULTS.depreciation);
  const [sale, setSale] = useState(DEFAULTS.sale);
  const [costs, setCosts] = useState(DEFAULTS.costs);
  const [bracket, setBracket] = useState(DEFAULTS.bracket);
  
  const [result, setResult] = useState<DepreciationRecaptureResult | null>(null);

  const calculate = () => setResult(calcDepreciationRecapture(
    parseFloat(purchase) || 0, parseFloat(improvements) || 0, parseFloat(depreciation) || 0, 
    parseFloat(sale) || 0, parseFloat(costs) || 0, parseFloat(bracket) || 0
  ));
  
  const reset = () => { 
    setPurchase(DEFAULTS.purchase); setImprovements(DEFAULTS.improvements); setDepreciation(DEFAULTS.depreciation); 
    setSale(DEFAULTS.sale); setCosts(DEFAULTS.costs); setBracket(DEFAULTS.bracket);
    setResult(calcDepreciationRecapture(300000, 50000, 60000, 500000, 30000, 24)); 
  };
  
  useEffect(() => { setResult(calcDepreciationRecapture(300000, 50000, 60000, 500000, 30000, 24)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is depreciation recapture?", answer: "When you sell a rental or commercial property for a profit, the IRS requires you to pay taxes on the depreciation you claimed (or could have claimed) during the years you owned it. This is called 'Unrecaptured Section 1250 Gain.' The IRS gave you a tax break while you owned it, and they want that tax break back when you sell it." },
    { question: "What tax rate applies to depreciation recapture?", answer: "Unrecaptured Section 1250 gain is taxed at your ordinary income tax rate, but it is capped at a maximum of 25%. Any profit above the original purchase price is taxed at the standard long-term capital gains rate (usually 15% or 20%)." },
    { question: "What if I didn't actually claim depreciation on my taxes?", answer: "You still owe the recapture tax! The IRS rule states you owe recapture tax on depreciation 'allowed or allowable.' If you failed to claim depreciation on your rental property, you must pay the recapture tax anyway when you sell. (Note: You can file Form 3115 to retroactively claim missed depreciation)." },
    { question: "How can I avoid paying depreciation recapture tax?", answer: "The most common way to avoid or defer depreciation recapture is by executing a 1031 Exchange. This allows you to roll the proceeds from the sale directly into a new, 'like-kind' investment property, deferring both capital gains and recapture taxes indefinitely. Another option is passing the property to heirs upon death, which triggers a step-up in basis, erasing the recapture tax entirely." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Depreciation Recapture Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Depreciation Recapture Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-1">Basis & Depreciation</h3>
            <div><label className="text-sm font-medium mb-1.5 block">Original Purchase Price</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={purchase} onChange={e => setPurchase(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Capital Improvements</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={improvements} onChange={e => setImprovements(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Depreciation Taken</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={depreciation} onChange={e => setDepreciation(e.target.value)} className={ci} /></div></div>
            </div>

            <h3 className="text-base font-bold text-foreground mt-2 border-b border-border pb-1">Sale Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Final Sale Price</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={sale} onChange={e => setSale(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Selling Costs (Commissions)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={costs} onChange={e => setCosts(e.target.value)} className={ci} /></div></div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Ordinary Income Bracket</label>
              <select value={bracket} onChange={e => setBracket(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-base outline-none focus-within:ring-2 focus-within:ring-primary/20">
                <option value="12">12% Bracket</option>
                <option value="22">22% Bracket</option>
                <option value="24">24% Bracket</option>
                <option value="32">32% Bracket</option>
                <option value="35">35% Bracket</option>
                <option value="37">37% Bracket</option>
              </select>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Estimated Tax Due</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.totalTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Recapture: ${result.recaptureTax.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Capital Gains: ${result.capitalGainTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Gain", `$${result.totalGain.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Recapture Portion", `$${result.recaptureAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Cap Gains Portion", `$${result.capitalGain.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax Liability Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Estimated Total Tax") || r.label.includes("Adjusted Cost Basis") ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Gain Distribution</h3>
                <ResponsiveContainer width="100%" height={220}><BarChart data={result.barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="category" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Bar dataKey="amount" radius={[4, 4, 0, 0]}>{result.barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}</Bar></BarChart></ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Depreciation Recapture</h2>
            <p>If you own an investment property, the IRS requires you to depreciate the building over 27.5 years (residential) or 39 years (commercial). This non-cash deduction saves you thousands of dollars in ordinary income tax every year you own the property. However, this tax break is technically a deferral, not a freebie.</p>
            <p>When you sell the property for a profit, the IRS "recaptures" the depreciation you claimed. Your cost basis is reduced by the amount of depreciation taken, which mathematically increases your taxable gain on the sale.</p>
            <h2>How the Math Works</h2>
            <p>Suppose you buy a house for $200,000, take $50,000 in depreciation over several years, and sell it for $300,000. Your adjusted basis is now $150,000 ($200k - $50k). Your total gain is $150,000 ($300k - $150k).</p>
            <p>That $150,000 gain is split into two buckets:</p>
            <ol>
              <li><strong>The Recapture Bucket:</strong> The first $50,000 of gain matches the depreciation you took. This is taxed as Unrecaptured Section 1250 Gain, capped at a maximum rate of 25%.</li>
              <li><strong>The Capital Gains Bucket:</strong> The remaining $100,000 of gain is pure market appreciation. This is taxed at the lower long-term capital gains rate (typically 15%).</li>
            </ol>
            <h2>The "Allowed or Allowable" Trap</h2>
            <p>A massive mistake novice real estate investors make is choosing not to claim depreciation to avoid the recapture tax later. Under IRS rules, you owe recapture tax on depreciation that was "allowed or allowable." This means if you <em>could</em> have claimed it, the IRS will tax you as if you <em>did</em> claim it, meaning you get hit with the tax penalty without ever receiving the tax benefit.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/depreciation-recapture-calculator" />
          <PopularCalculators exclude="/calculator/depreciation-recapture-calculator" />
        </div>
      </div>
    </>
  );
}
