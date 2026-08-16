"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

interface EVResults {
  enterpriseValue: number;
  equityValue: number;
  evToEbitda: number;
  evToRevenue: number;
  evToEbit: number;
  impliedSharePrice: number;
  debtFreeValue: number;
  breakdown: { name: string; value: number; color: string }[];
}

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtM = (n: number) => {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
const fmtX = (n: number) => `${n.toFixed(2)}x`;

const COLORS = ["hsl(var(--primary))", "#ef4444", "#10b981", "#f59e0b"];

function calcEV({ marketCap, totalDebt, cash, preferredEquity, minorityInterest, ebitda, revenue, ebit, sharesOutstanding }: {
  marketCap: number; totalDebt: number; cash: number; preferredEquity: number;
  minorityInterest: number; ebitda: number; revenue: number; ebit: number; sharesOutstanding: number;
}): EVResults {
  const enterpriseValue = marketCap + totalDebt + preferredEquity + minorityInterest - cash;
  const equityValue = enterpriseValue - totalDebt - preferredEquity - minorityInterest + cash;
  const evToEbitda = ebitda > 0 ? enterpriseValue / ebitda : 0;
  const evToRevenue = revenue > 0 ? enterpriseValue / revenue : 0;
  const evToEbit = ebit > 0 ? enterpriseValue / ebit : 0;
  const impliedSharePrice = sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;
  const debtFreeValue = enterpriseValue;

  const breakdown = [
    { name: "Market Cap", value: marketCap, color: COLORS[0] },
    { name: "Total Debt", value: totalDebt, color: COLORS[1] },
    { name: "Preferred Equity", value: preferredEquity, color: COLORS[2] },
    { name: "Minority Interest", value: minorityInterest, color: COLORS[3] },
  ].filter(b => b.value > 0);

  return { enterpriseValue, equityValue, evToEbitda, evToRevenue, evToEbit, impliedSharePrice, debtFreeValue, breakdown };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs">
        <p className="font-bold mb-1">{payload[0]?.name}</p>
        <p className="text-primary font-semibold">{fmtM(payload[0]?.value || 0)}</p>
      </div>
    );
  }
  return null;
};

export default function EnterpriseValueCalculator() {
  const [marketCap, setMarketCap] = useState("5000000000");
  const [totalDebt, setTotalDebt] = useState("1200000000");
  const [cash, setCash] = useState("800000000");
  const [preferredEquity, setPreferredEquity] = useState("0");
  const [minorityInterest, setMinorityInterest] = useState("150000000");
  const [ebitda, setEbitda] = useState("900000000");
  const [revenue, setRevenue] = useState("4000000000");
  const [ebit, setEbit] = useState("700000000");
  const [sharesOutstanding, setSharesOutstanding] = useState("250000000");

  const [results, setResults] = useState<EVResults | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calculate(); }, []);

  const calculate = () => {
    setResults(calcEV({
      marketCap: parseFloat(marketCap) || 0, totalDebt: parseFloat(totalDebt) || 0,
      cash: parseFloat(cash) || 0, preferredEquity: parseFloat(preferredEquity) || 0,
      minorityInterest: parseFloat(minorityInterest) || 0, ebitda: parseFloat(ebitda) || 0,
      revenue: parseFloat(revenue) || 0, ebit: parseFloat(ebit) || 0,
      sharesOutstanding: parseFloat(sharesOutstanding) || 0,
    }));
  };

  const reset = () => {
    setMarketCap("5000000000"); setTotalDebt("1200000000"); setCash("800000000");
    setPreferredEquity("0"); setMinorityInterest("150000000"); setEbitda("900000000");
    setRevenue("4000000000"); setEbit("700000000"); setSharesOutstanding("250000000");
    calculate();
  };

  const faqs = [
    { question: "What is Enterprise Value (EV)?", answer: "Enterprise Value is a measure of a company's total value, often used as a more comprehensive alternative to market capitalization. EV = Market Cap + Total Debt + Preferred Equity + Minority Interest − Cash & Equivalents. It represents the theoretical takeover price — what you'd pay to buy the entire business, including its debt obligations." },
    { question: "Why subtract cash from Enterprise Value?", answer: "Cash is subtracted because an acquirer would immediately receive it upon purchase, effectively reducing the net cost of acquisition. If a company has $1B in market cap and $500M in cash, the real cost of buying the operating business is only $500M." },
    { question: "What is the EV/EBITDA ratio?", answer: "EV/EBITDA compares a company's enterprise value to its earnings before interest, taxes, depreciation, and amortization. It's one of the most widely used valuation multiples because it removes the effects of capital structure (debt) and accounting choices (depreciation). A lower ratio generally indicates a cheaper stock. Industry averages typically range from 8x to 15x." },
    { question: "What's the difference between EV and market cap?", answer: "Market cap only reflects the value of equity (shares outstanding × share price), while EV accounts for the entire capital structure including debt and cash. Two companies with the same market cap can have very different enterprise values if their debt levels differ significantly." },
    { question: "When is Enterprise Value most useful?", answer: "EV is most useful when comparing companies with different capital structures (debt levels), when analyzing M&A transactions where the acquirer assumes debt, when using EV/EBITDA or EV/Revenue multiples for valuation, and when evaluating highly leveraged companies where equity market cap may be misleading." },
    { question: "What are typical EV/EBITDA multiples by industry?", answer: "Technology: 20–30x. Healthcare: 15–25x. Consumer Staples: 10–15x. Industrials: 8–12x. Energy: 5–8x. Financial services typically use different valuation metrics like P/B ratio. Always compare EV/EBITDA within the same industry for meaningful analysis." },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" },
        { label: "Financial", href: "/calculator#financial" }, { label: "Enterprise Value Calculator" }
      ]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Enterprise Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Company Data (USD)</h2>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="mktcap" label="Market Capitalization" value={marketCap} onChange={setMarketCap} prefix="$" />
              <CompactInput id="debt" label="Total Debt" value={totalDebt} onChange={setTotalDebt} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cash" label="Cash & Equivalents" value={cash} onChange={setCash} prefix="$" />
              <CompactInput id="ebitda" label="EBITDA" value={ebitda} onChange={setEbitda} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="revenue" label="Revenue" value={revenue} onChange={setRevenue} prefix="$" />
              <CompactInput id="ebit" label="EBIT" value={ebit} onChange={setEbit} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="pref" label="Preferred Equity" value={preferredEquity} onChange={setPreferredEquity} prefix="$" />
              <CompactInput id="minority" label="Minority Interest" value={minorityInterest} onChange={setMinorityInterest} prefix="$" />
            </div>
            <CompactInput id="shares" label="Shares Outstanding" value={sharesOutstanding} onChange={setSharesOutstanding} />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center"
                aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Valuation Results</h2>
                  <Building2 className="h-5 w-5 text-primary" />
                </div>

                {/* Component 1: Primary Result */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Enterprise Value</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    {fmtM(results.enterpriseValue)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Equity Value: {fmtM(results.equityValue)} · EV/EBITDA: {fmtX(results.evToEbitda)}
                  </div>
                </div>

                {/* Component 2: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Component</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                        <th className="p-2.5 pr-3 text-right">Operation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Market Capitalization", value: fmtM(parseFloat(marketCap) || 0), op: "+" },
                        { label: "Total Debt", value: fmtM(parseFloat(totalDebt) || 0), op: "+" },
                        { label: "Preferred Equity", value: fmtM(parseFloat(preferredEquity) || 0), op: "+" },
                        { label: "Minority Interest", value: fmtM(parseFloat(minorityInterest) || 0), op: "+" },
                        { label: "Cash & Equivalents", value: fmtM(parseFloat(cash) || 0), op: "−" },
                        { label: "Enterprise Value", value: fmtM(results.enterpriseValue), op: "=", isTotal: true },
                      ].map(row => (
                        <tr key={row.label} className={`hover:bg-secondary/20 ${row.isTotal ? "font-bold bg-secondary/30" : "text-muted-foreground"}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground font-bold">{row.op}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Component 3: Chart */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">EV Multiples vs Industry Benchmarks</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={[
                        { metric: "EV/Revenue", value: parseFloat(results.evToRevenue.toFixed(2)), benchmark: 3 },
                        { metric: "EV/EBIT", value: parseFloat(results.evToEbit.toFixed(2)), benchmark: 15 },
                        { metric: "EV/EBITDA", value: parseFloat(results.evToEbitda.toFixed(2)), benchmark: 12 },
                      ]} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}x`} />
                        <Tooltip formatter={(v: any) => `${v}x`} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Calculated" />
                        <Bar dataKey="benchmark" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} name="S&P Avg" />
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                {/* Component 4: Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "Enterprise Value", value: fmtM(results.enterpriseValue) },
                    { label: "Equity Value", value: fmtM(results.equityValue) },
                    { label: "EV/EBITDA", value: fmtX(results.evToEbitda) },
                    { label: "EV/Revenue", value: fmtX(results.evToRevenue) },
                    { label: "EV/EBIT", value: fmtX(results.evToEbit) },
                    { label: "Implied Share Price", value: results.impliedSharePrice > 0 ? `$${results.impliedSharePrice.toFixed(2)}` : "N/A" },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Enterprise Value?</h2>
            <p>Enterprise Value (EV) is a financial metric that represents the total economic value of a business — the theoretical price an acquirer would pay to own the entire company, including its debt. Unlike market capitalization, which only reflects the equity holders' claim, enterprise value encompasses all stakeholders: equity shareholders, debt holders, preferred stockholders, and minority interest holders.</p>
            <p>The formula is: EV = Market Capitalization + Total Debt + Preferred Equity + Minority Interest − Cash & Cash Equivalents. The inclusion of debt makes EV capital-structure neutral, allowing fair comparisons between companies regardless of how they finance their operations.</p>

            <h2 className="text-2xl font-bold mb-3">Why Enterprise Value Matters</h2>
            <p>Enterprise Value is the preferred metric for M&A analysis because it represents the total acquisition cost. When a buyer acquires a company, they inherit all its debt obligations but also receive all its cash. EV captures this economic reality better than market cap alone.</p>
            <p>EV-based multiples — particularly EV/EBITDA — are the gold standard for fundamental stock analysis and corporate valuation. They allow comparison across companies with vastly different capital structures, tax situations, and accounting policies. A company with $5B EV and $500M EBITDA trades at 10x EV/EBITDA, regardless of whether it's funded entirely with equity or 50% with debt.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Each Component</h2>
            <p><strong>Market Capitalization:</strong> Share price × shares outstanding. This is the equity holders' current market value. <strong>Total Debt:</strong> All interest-bearing liabilities including long-term bonds, bank loans, and capital leases. <strong>Cash & Equivalents:</strong> Subtracted because an acquirer receives it immediately. <strong>Preferred Equity:</strong> Claims senior to common equity but junior to debt. <strong>Minority Interest:</strong> The portion of subsidiaries owned by outside shareholders, included because EV claims the entire consolidated entity.</p>

            <h2 className="text-2xl font-bold mb-3">EV Multiples and Benchmarks</h2>
            <p>EV/EBITDA is the most widely used EV multiple. S&P 500 companies typically trade at 12–15x EV/EBITDA. High-growth technology companies may exceed 30x while mature industrials may trade at 7–10x. EV/Revenue is used for early-stage companies without EBITDA profitability, with typical SaaS companies trading at 5–15x revenue. EV/EBIT is preferred when depreciation differences between companies are meaningful.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Applications</h2>
            <p>Investors use EV to screen for undervalued stocks by identifying companies trading at low EV multiples relative to peers. M&A advisors use EV to set takeover bid prices. Credit analysts use the debt-to-EV ratio to assess financial leverage. Venture capitalists use EV equivalents when pricing startup funding rounds. Understanding EV is foundational for any serious fundamental analysis of public or private companies.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/enterprise-value-calculator" />
          <PopularCalculators exclude="/calculator/enterprise-value-calculator" />
        </div>
      </div>
    </>
  );
}
