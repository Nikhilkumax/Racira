"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetsPieData: { name: string; value: number; color: string }[];
  liabilitiesPieData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; type: "asset" | "liability" | "total" }[];
  summaryStats: { label: string; value: string }[];
}

interface AssetEntry { label: string; value: string; color: string; }
interface LiabilityEntry { label: string; value: string; color: string; }

const DEFAULT_ASSETS: AssetEntry[] = [
  { label: "Checking/Savings", value: "15000", color: "#22c55e" },
  { label: "Investment Accounts", value: "45000", color: "#3b82f6" },
  { label: "Retirement (401k/IRA)", value: "80000", color: "#8b5cf6" },
  { label: "Home Value", value: "350000", color: "#f59e0b" },
  { label: "Vehicle(s)", value: "25000", color: "#14b8a6" },
  { label: "Other Assets", value: "5000", color: "#ec4899" },
];

const DEFAULT_LIABILITIES: LiabilityEntry[] = [
  { label: "Mortgage Balance", value: "260000", color: "#ef4444" },
  { label: "Car Loan(s)", value: "18000", color: "#f97316" },
  { label: "Student Loans", value: "22000", color: "#eab308" },
  { label: "Credit Card Debt", value: "4500", color: "#dc2626" },
  { label: "Other Debt", value: "0", color: "#64748b" },
];

function calcNetWorth(assets: AssetEntry[], liabilities: LiabilityEntry[]): NetWorthResult {
  const totalAssets = assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetsPieData = assets
    .filter(a => parseFloat(a.value) > 0)
    .map(a => ({ name: a.label, value: parseFloat(a.value) || 0, color: a.color }));

  const liabilitiesPieData = liabilities
    .filter(l => parseFloat(l.value) > 0)
    .map(l => ({ name: l.label, value: parseFloat(l.value) || 0, color: l.color }));

  const breakdown: NetWorthResult["breakdown"] = [
    ...assets.map(a => ({ label: a.label, value: `$${(parseFloat(a.value) || 0).toLocaleString()}`, type: "asset" as const })),
    { label: "Total Assets", value: `$${totalAssets.toLocaleString()}`, type: "total" },
    ...liabilities.map(l => ({ label: l.label, value: `−$${(parseFloat(l.value) || 0).toLocaleString()}`, type: "liability" as const })),
    { label: "Total Liabilities", value: `−$${totalLiabilities.toLocaleString()}`, type: "total" },
    { label: "NET WORTH", value: `${netWorth >= 0 ? "" : "−"}$${Math.abs(netWorth).toLocaleString()}`, type: "total" },
  ];

  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  const summaryStats = [
    { label: "Total Assets", value: `$${totalAssets.toLocaleString()}` },
    { label: "Total Liabilities", value: `$${totalLiabilities.toLocaleString()}` },
    { label: "Net Worth", value: `$${netWorth.toLocaleString()}` },
    { label: "Debt-to-Asset Ratio", value: `${debtToAssetRatio.toFixed(1)}%` },
    { label: "Liquid Assets", value: `$${(parseFloat(assets[0]?.value) || 0).toLocaleString()}` },
    { label: "Solvency", value: netWorth >= 0 ? "Solvent ✓" : "Insolvent ✗" },
  ];

  return { totalAssets, totalLiabilities, netWorth, assetsPieData, liabilitiesPieData, breakdown, summaryStats };
}

export default function NetWorthCalculator() {
  const [assets, setAssets] = useState<AssetEntry[]>(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState<LiabilityEntry[]>(DEFAULT_LIABILITIES);
  const [result, setResult] = useState<NetWorthResult | null>(null);

  const calculate = () => setResult(calcNetWorth(assets, liabilities));

  const updateAsset = (i: number, value: string) => setAssets(prev => prev.map((a, j) => j === i ? { ...a, value } : a));
  const updateLiability = (i: number, value: string) => setLiabilities(prev => prev.map((l, j) => j === i ? { ...l, value } : l));

  useEffect(() => { setResult(calcNetWorth(DEFAULT_ASSETS, DEFAULT_LIABILITIES)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-sm bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is net worth and why does it matter?", answer: "Net worth = Total Assets − Total Liabilities. It's the single most comprehensive snapshot of your financial health — better than income alone because it shows wealth accumulated, not just earned. A high income with high debt can produce low or negative net worth. A modest income with consistent saving and investing builds positive net worth over time. Tracking net worth monthly/quarterly motivates behavior change and shows whether you're building or losing wealth." },
    { question: "What is the average net worth by age in the US?", answer: "Median net worth by age (2022 Federal Reserve Survey of Consumer Finances): Under 35: $39,000. 35–44: $135,600. 45–54: $247,200. 55–64: $364,500. 65–74: $409,900. 75+: $335,600. Mean (average) net worth is much higher due to wealth concentration: under 35: $183,000. 35–44: $549,600. 65–74: $1,794,600. Median is more representative of typical households. Home equity accounts for 25–35% of net worth for most middle-class families." },
    { question: "What assets should be included in net worth?", answer: "Include all assets at current fair market value: Cash and bank accounts (checking, savings, money market, CDs). Investment accounts (brokerage, stocks, bonds, mutual funds, ETFs). Retirement accounts (401k, IRA, Roth IRA, pension present value). Real estate (current market value of all properties). Vehicles (Kelley Blue Book value). Business ownership (estimated current value). Personal property of significant value (jewelry, art, collectibles). HSA and 529 balances. Do NOT include everyday personal items like clothing or furniture unless of significant value." },
    { question: "What liabilities should be included in net worth?", answer: "Include all outstanding debt: Mortgage balance(s). Home equity loan/HELOC. Auto loans. Student loans. Personal loans. Credit card balances (current balance, not credit limit). Medical debt. Business loans you're personally liable for. Tax obligations owed. Other legal financial obligations. Do NOT include future obligations that aren't yet incurred (future rent, future utility bills) — only current outstanding debt balances." },
    { question: "How quickly should my net worth grow?", answer: "The '4x income by 40' and '10x income by 67' rules (popularized by Fidelity) suggest: Age 30: 1× annual income saved. Age 40: 3× annual income. Age 50: 6× annual income. Age 60: 8× annual income. Age 67: 10× annual income. These are retirement-focused savings benchmarks, not total net worth. A more aggressive target: 25× annual expenses (the FIRE number) represents true financial independence. Track growth rate — a healthy net worth should grow faster than inflation." },
    { question: "What is a good debt-to-asset ratio?", answer: "Debt-to-asset ratio = Total Liabilities ÷ Total Assets. Under 30%: Excellent financial position. 30–50%: Good — common for homeowners with mortgages. 50–70%: Elevated — focus on debt reduction. Above 70%: High risk — most assets are financed. Above 100%: Negative net worth (insolvent). A mortgage naturally elevates this ratio — a 20% down payment starts at 80% debt-to-asset on the home. As you pay down the mortgage and build other savings, this ratio should decline steadily." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Net Worth Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Net Worth Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assets (What You Own)</p>
            <div className="flex flex-col gap-2">
              {assets.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                  <span className="text-sm text-muted-foreground flex-1 min-w-0 truncate">{a.label}</span>
                  <div className={`${inp} w-36 shrink-0`}><span className="pl-2 text-muted-foreground text-sm">$</span><input type="number" value={a.value} onChange={e => updateAsset(i, e.target.value)} className={ci} /></div>
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">Liabilities (What You Owe)</p>
            <div className="flex flex-col gap-2">
              {liabilities.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="text-sm text-muted-foreground flex-1 min-w-0 truncate">{l.label}</span>
                  <div className={`${inp} w-36 shrink-0`}><span className="pl-2 text-muted-foreground text-sm">$</span><input type="number" value={l.value} onChange={e => updateLiability(i, e.target.value)} className={ci} /></div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAssets(DEFAULT_ASSETS); setLiabilities(DEFAULT_LIABILITIES); setResult(calcNetWorth(DEFAULT_ASSETS, DEFAULT_LIABILITIES)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.netWorth >= 0 ? "bg-primary/10 border-primary" : "bg-red-500/10 border-red-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.netWorth >= 0 ? "text-primary" : "text-red-600"}`}>Your Net Worth</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.netWorth < 0 ? "−" : ""}${Math.abs(result.netWorth).toLocaleString()}</div>
                <div className="text-base text-muted-foreground mt-1">Assets: ${result.totalAssets.toLocaleString()} · Liabilities: ${result.totalLiabilities.toLocaleString()} · Debt ratio: {result.totalAssets > 0 ? ((result.totalLiabilities / result.totalAssets) * 100).toFixed(1) : 0}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Assets", `$${result.totalAssets.toLocaleString()}`], ["Total Liabilities", `$${result.totalLiabilities.toLocaleString()}`], ["Net Worth", `$${result.netWorth.toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-sm font-bold mb-2">Assets Breakdown</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={result.assetsPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {result.assetsPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-sm font-bold mb-2">Liabilities Breakdown</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={result.liabilitiesPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {result.liabilitiesPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Net Worth and How to Calculate It</h2>
            <p>This <strong>net worth calculator</strong> gives you a real-time snapshot of your financial position. Net Worth = Total Assets − Total Liabilities. It's the most comprehensive financial metric available — a high income with high debt produces low net worth, while a modest income with consistent saving builds strong net worth over time. Track it quarterly to see your true financial trajectory.</p>
            <h2 className="text-2xl font-bold mb-3">US Net Worth Benchmarks by Age</h2>
            <p>Median net worth by age group (Federal Reserve 2022): Under 35: $39,000. Ages 35–44: $135,600. Ages 45–54: $247,200. Ages 55–64: $364,500. Ages 65–74: $409,900. These are medians — half of households have more, half have less. The primary drivers of net worth growth: consistent retirement contributions (tax-advantaged compounding), home equity accumulation (mortgage paydown + appreciation), and avoiding lifestyle inflation as income rises.</p>
            <h2 className="text-2xl font-bold mb-3">Strategies to Grow Net Worth</h2>
            <p>Two levers: increase assets, decrease liabilities. Most impactful asset growth strategies: maximize tax-advantaged retirement accounts (401k, Roth IRA, HSA); invest consistently in low-cost index funds; build home equity through extra mortgage payments. Liability reduction: pay off high-interest debt first (Avalanche method); avoid new auto loans for depreciating assets; refinance to lower interest rates when rates fall. The formula for wealth: Income − Expenses = Savings → Investments → Net Worth Growth. Related tools: <a href="/calculator/budget-calculator">Budget Calculator</a>, <a href="/calculator/early-retirement-calculator">FIRE Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-worth-calculator" />
          <PopularCalculators exclude="/calculator/net-worth-calculator" />
        </div>
      </div>
    </>
  );
}
