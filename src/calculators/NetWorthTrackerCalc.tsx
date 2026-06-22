"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number) => `$${fmt(n)}`;

const Inp = ({ id, label, value, onChange, prefix, suffix, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; placeholder?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

type AssetItem = { id: string; label: string; value: string };
type LiabilityItem = { id: string; label: string; value: string };

const DEFAULT_ASSETS: AssetItem[] = [
  { id: "a1", label: "Checking / Savings", value: "12000" },
  { id: "a2", label: "Retirement Accounts (401k/IRA)", value: "85000" },
  { id: "a3", label: "Brokerage / Investments", value: "45000" },
  { id: "a4", label: "Primary Home Value", value: "380000" },
  { id: "a5", label: "Vehicles", value: "32000" },
  { id: "a6", label: "Other Assets", value: "8000" },
];

const DEFAULT_LIABILITIES: LiabilityItem[] = [
  { id: "l1", label: "Mortgage Balance", value: "295000" },
  { id: "l2", label: "Car Loans", value: "18000" },
  { id: "l3", label: "Student Loans", value: "22000" },
  { id: "l4", label: "Credit Card Debt", value: "5500" },
  { id: "l5", label: "Other Debts", value: "2000" },
];

const ASSET_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];
const LIA_COLORS = ["#ef4444", "#f97316", "#eab308", "#14b8a6", "#06b6d4"];

export default function NetWorthTrackerCalc() {
  const [assets, setAssets] = useState<AssetItem[]>(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(DEFAULT_LIABILITIES);
  const [res, setRes] = useState<{ totalAssets: number; totalLiabilities: number; netWorth: number; debtRatio: number; assetData: any[]; liaData: any[]; breakdownData: any[] } | null>(null);

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const totalAssets = assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    const assetData = assets.filter(a => parseFloat(a.value) > 0).map((a, i) => ({
      name: a.label, value: parseFloat(a.value) || 0, fill: ASSET_COLORS[i % ASSET_COLORS.length]
    }));
    const liaData = liabilities.filter(l => parseFloat(l.value) > 0).map((l, i) => ({
      name: l.label, value: parseFloat(l.value) || 0, fill: LIA_COLORS[i % LIA_COLORS.length]
    }));
    const breakdownData = [
      { name: "Total Assets", value: totalAssets, fill: "#10b981" },
      { name: "Total Liabilities", value: totalLiabilities, fill: "#ef4444" },
      { name: "Net Worth", value: Math.max(netWorth, 0), fill: "#6366f1" },
    ];

    setRes({ totalAssets, totalLiabilities, netWorth, debtRatio, assetData, liaData, breakdownData });
  };

  const addAsset = () => setAssets(prev => [...prev, { id: `a${Date.now()}`, label: "New Asset", value: "0" }]);
  const addLiability = () => setLiabilities(prev => [...prev, { id: `l${Date.now()}`, label: "New Liability", value: "0" }]);
  const updateAsset = (id: string, key: keyof AssetItem, val: string) => setAssets(prev => prev.map(a => a.id === id ? { ...a, [key]: val } : a));
  const updateLiability = (id: string, key: keyof LiabilityItem, val: string) => setLiabilities(prev => prev.map(l => l.id === id ? { ...l, [key]: val } : l));
  const removeAsset = (id: string) => setAssets(prev => prev.filter(a => a.id !== id));
  const removeLiability = (id: string) => setLiabilities(prev => prev.filter(l => l.id !== id));

  const reset = () => { setAssets(DEFAULT_ASSETS); setLiabilities(DEFAULT_LIABILITIES); setTimeout(calculate, 0); };

  const faqs = [
    { question: "What is net worth?", answer: "Net worth is the total value of everything you own (assets) minus everything you owe (liabilities). It's the most comprehensive single-number snapshot of your financial health. A positive net worth means your assets exceed your debts. A negative net worth (common for young adults with student loans) means you owe more than you own. Net worth typically grows significantly between your 30s and 60s as mortgages are paid down and retirement accounts compound." },
    { question: "What should I include as assets?", answer: "Include: Cash and bank accounts, Investment/brokerage accounts, Retirement accounts (401k, IRA, pension present value), Real estate (current market value), Vehicles (current KBB/market value), Business equity, Personal property of significant value (jewelry, art, collectibles), Cash value of life insurance, and any money owed to you. Don't include everyday household items (furniture, clothes) unless they have significant resale value." },
    { question: "What should I include as liabilities?", answer: "Include all debts: Mortgage balance (not payment), Home equity loan/HELOC balance, Car loan balances, Student loan balances, Credit card balances, Personal loans, Medical debt, Business loans, Back taxes owed, and any other money you legally owe. Use current outstanding balances, not original loan amounts." },
    { question: "What is a good debt-to-asset ratio?", answer: "The debt-to-asset ratio shows what percentage of your assets are financed by debt. Below 50% is generally healthy. Below 30% is excellent. Above 80% means most of what you 'own' is actually owed to creditors, leaving you vulnerable if asset values decline. For younger households with mortgages, 50-70% is normal. The goal is to see this ratio decrease over time as you pay down debt and build wealth." },
    { question: "What is average net worth by age in the US?", answer: "According to Federal Reserve data: Under 35: Median $39k, Mean $183k. Ages 35-44: Median $135k, Mean $549k. Ages 45-54: Median $247k, Mean $975k. Ages 55-64: Median $364k, Mean $1.57M. Ages 65-74: Median $409k, Mean $1.79M. The massive gap between median and mean reflects extreme wealth concentration. Median is more representative of the 'typical' American household." },
    { question: "How often should I calculate my net worth?", answer: "Quarterly is ideal for most people — frequent enough to track progress without being obsessive about short-term market fluctuations. Annual calculation is the minimum for meaningful tracking. After major life events (home purchase, debt payoff, inheritance, divorce), recalculate immediately to understand your new financial position." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Net Worth Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Net Worth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {/* ASSETS */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-lg font-bold text-foreground text-emerald-600">Assets (What You Own)</h2>
              </div>
              {assets.map(a => (
                <div key={a.id} className="flex gap-2 items-center">
                  <input type="text" value={a.label} onChange={e => updateAsset(a.id, "label", e.target.value)} className="flex-1 rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden w-32 shrink-0">
                    <span className="pl-2 text-sm text-muted-foreground">$</span>
                    <input type="number" value={a.value} onChange={e => updateAsset(a.id, "value", e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none border-none text-foreground" />
                  </div>
                  <button onClick={() => removeAsset(a.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button onClick={addAsset} className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add Asset
              </button>
            </div>

            {/* LIABILITIES */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-lg font-bold text-red-500">Liabilities (What You Owe)</h2>
              </div>
              {liabilities.map(l => (
                <div key={l.id} className="flex gap-2 items-center">
                  <input type="text" value={l.label} onChange={e => updateLiability(l.id, "label", e.target.value)} className="flex-1 rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden w-32 shrink-0">
                    <span className="pl-2 text-sm text-muted-foreground">$</span>
                    <input type="number" value={l.value} onChange={e => updateLiability(l.id, "value", e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none border-none text-foreground" />
                  </div>
                  <button onClick={() => removeLiability(l.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button onClick={addLiability} className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add Liability
              </button>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Net Worth
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
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
                  <h2 className="text-lg font-bold text-foreground">Your Net Worth</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>

                <div className={`bg-gradient-to-br border rounded-xl p-5 text-center ${res.netWorth >= 0 ? "from-primary/10 to-primary/5 border-primary/20" : "from-red-500/10 to-red-500/5 border-red-500/20"}`}>
                  <div className={`text-[13px] font-bold mb-1 uppercase tracking-wider ${res.netWorth >= 0 ? "text-primary" : "text-red-500"}`}>Net Worth</div>
                  <div className={`text-4xl font-extrabold mb-1 tracking-tight ${res.netWorth >= 0 ? "text-foreground" : "text-red-500"}`}>{fmtUSD(res.netWorth)}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Debt-to-Asset Ratio: {fmt(res.debtRatio, 1)}%
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Summary</th><th className="p-2.5 pr-3 text-right">Amount</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      <tr className="hover:bg-secondary/20">
                        <td className="p-2.5 pl-3 font-medium text-emerald-600">Total Assets</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-emerald-600">{fmtUSD(res.totalAssets)}</td>
                      </tr>
                      <tr className="hover:bg-secondary/20">
                        <td className="p-2.5 pl-3 font-medium text-red-500">Total Liabilities</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-red-500">−{fmtUSD(res.totalLiabilities)}</td>
                      </tr>
                      <tr className="bg-primary/5 font-bold">
                        <td className="p-2.5 pl-3 font-bold text-foreground">Net Worth</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-foreground">{fmtUSD(res.netWorth)}</td>
                      </tr>
                      <tr className="hover:bg-secondary/20">
                        <td className="p-2.5 pl-3 font-medium text-foreground">Debt-to-Asset Ratio</td>
                        <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(res.debtRatio, 1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Assets vs Liabilities vs Net Worth</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={res.breakdownData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [fmtUSD(v)]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {res.breakdownData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Assets", value: fmtUSD(res.totalAssets) },
                    { label: "Liabilities", value: fmtUSD(res.totalLiabilities) },
                    { label: "Net Worth", value: fmtUSD(res.netWorth) },
                    { label: "Debt Ratio", value: `${fmt(res.debtRatio, 1)}%` },
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Net Worth and Why Does It Matter?</h2>
            <p>Net worth is the cornerstone metric of personal finance — the single number that tells you exactly where you stand financially. It's calculated as Total Assets minus Total Liabilities. Everything you own minus everything you owe. While income matters for your standard of living today, net worth determines your long-term financial security, retirement readiness, and wealth legacy.</p>
            <p>Many people focus exclusively on income without tracking net worth, missing the bigger picture. A $200,000/year earner who spends everything has a lower net worth than a $70,000/year earner who saves and invests consistently. Wealth is built not by what you earn, but by what you keep and grow.</p>

            <h2>How to Accurately Calculate Your Net Worth</h2>
            <p>The challenge with net worth calculations is using accurate current values for both assets and liabilities. For real estate, use a current market estimate (Zillow Zestimate, Redfin estimate, or recent comparable sales) — not what you paid for it or what you think it's worth. For vehicles, use Kelley Blue Book or Edmunds private party value. For retirement accounts, use the current statement balance. For liabilities, always use current outstanding balances, not original loan amounts.</p>
            <p>Note that liquid assets (cash, brokerage accounts) and illiquid assets (home equity, retirement accounts) have very different practical values. $500,000 in a primary home is less financially flexible than $500,000 in a brokerage account, even though both count equally in the raw net worth calculation.</p>

            <h2>Net Worth Milestones by Age</h2>
            <p>Financial planners often use rough benchmarks for retirement readiness. By age 30: aim for 1× your annual salary in savings. By 40: 3× salary. By 50: 6× salary. By 60: 8× salary. By 67 (full retirement age): 10-12× salary. These targets assume a 4% safe withdrawal rate supporting 25-30 years of retirement. Your actual target depends on your planned retirement lifestyle, Social Security estimates, pension income, and healthcare needs.</p>

            <h2>Building Net Worth: The Three Pillars</h2>
            <p><strong>Earn more:</strong> Increase income through career advancement, skills development, side income, or business ownership. <strong>Spend less:</strong> Track spending, eliminate waste, live below your means. Even a 5-10% savings rate improvement compounds dramatically over decades. <strong>Invest wisely:</strong> Put the difference to work in diversified, low-cost index funds, real estate, or other appreciating assets. The wealth-building formula is deceptively simple: Income &gt; Expenses, with the difference invested consistently over time.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-worth-tracker" />
          <PopularCalculators exclude="/calculator/net-worth-tracker" />
        </div>
      </div>
    </>
  );
}
