"use client";
import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, Plus, Trash2 } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number) => `$${fmt(n)}`;

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

interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  debtRatio: number;
}

const calculate = (assets: AssetItem[], liabilities: LiabilityItem[]): NetWorthResult => {
  const totalAssets = assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  return { totalAssets, totalLiabilities, netWorth, debtRatio };
};

export default function NetWorthTrackerCalc() {
  const [assets, setAssets] = useState<AssetItem[]>(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(DEFAULT_LIABILITIES);
  const [res, setRes] = useState<NetWorthResult>(calculate(DEFAULT_ASSETS, DEFAULT_LIABILITIES));
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRes(calculate(DEFAULT_ASSETS, DEFAULT_LIABILITIES));
  }, []);

  const addAsset = () => setAssets(prev => [...prev, { id: `a${Date.now()}`, label: "New Asset", value: "1000" }]);
  const addLiability = () => setLiabilities(prev => [...prev, { id: `l${Date.now()}`, label: "New Liability", value: "1000" }]);
  const updateAsset = (id: string, key: keyof AssetItem, val: string) => setAssets(prev => prev.map(a => a.id === id ? { ...a, [key]: val } : a));
  const updateLiability = (id: string, key: keyof LiabilityItem, val: string) => setLiabilities(prev => prev.map(l => l.id === id ? { ...l, [key]: val } : l));
  const removeAsset = (id: string) => setAssets(prev => prev.filter(a => a.id !== id));
  const removeLiability = (id: string) => setLiabilities(prev => prev.filter(l => l.id !== id));

  const hasErrors =
    assets.some(a => parseFloat(a.value) < 0) ||
    liabilities.some(l => parseFloat(l.value) < 0);

  const handleCalculate = () => {
    if (hasErrors) return;
    setRes(calculate(assets, liabilities));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setAssets(DEFAULT_ASSETS);
    setLiabilities(DEFAULT_LIABILITIES);
    setRes(calculate(DEFAULT_ASSETS, DEFAULT_LIABILITIES));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const faqs = [
    { question: "What is net worth?", answer: "Net worth is the total value of everything you own (assets) minus everything you owe (liabilities). It's the most comprehensive single-number snapshot of your financial health. A positive net worth means your assets exceed your debts. A negative net worth (common for young adults with student loans) means you owe more than you own. Net worth typically grows significantly between your 30s and 60s as mortgages are paid down and retirement accounts compound." },
    { question: "What should I include as assets?", answer: "Include: Cash and bank accounts, Investment/brokerage accounts, Retirement accounts (401k, IRA, pension present value), Real estate (current market value), Vehicles (current KBB/market value), Business equity, Personal property of significant value (jewelry, art, collectibles), Cash value of life insurance, and any money owed to you. Don't include everyday household items (furniture, clothes) unless they have significant resale value." },
    { question: "What should I include as liabilities?", answer: "Include all debts: Mortgage balance (not payment), Home equity loan/HELOC balance, Car loan balances, Student loan balances, Credit card balances, Personal loans, Medical debt, Business loans, Back taxes owed, and any other money you legally owe. Use current outstanding balances, not original loan amounts." },
    { question: "What is a good debt-to-asset ratio?", answer: "The debt-to-asset ratio shows what percentage of your assets are financed by debt. Below 50% is generally healthy. Below 30% is excellent. Above 80% means most of what you 'own' is actually owed to creditors, leaving you vulnerable if asset values decline. For younger households with mortgages, 50-70% is normal. The goal is to see this ratio decrease over time as you pay down debt and build wealth." },
    { question: "What is average net worth by age in the US?", answer: "According to Federal Reserve data: Under 35: Median $39k, Mean $183k. Ages 35-44: Median $135k, Mean $549k. Ages 45-54: Median $247k, Mean $975k. Ages 55-64: Median $364k, Mean $1.57M. Ages 65-74: Median $409k, Mean $1.79M. The massive gap between median and mean reflects extreme wealth concentration. Median is more representative of the 'typical' American household." },
    { question: "How often should I calculate my net worth?", answer: "Quarterly is ideal for most people — frequent enough to track progress without being obsessive about short-term market fluctuations. Annual calculation is the minimum for meaningful tracking. After major life events (home purchase, debt payoff, inheritance, divorce), recalculate immediately to understand your new financial position." },
  ];

  const assetRows = assets.map((a) => ({
    label: a.label || "Unnamed",
    value: fmtUSD(parseFloat(a.value) || 0),
  }));
  const liabilityRows = liabilities.map((l) => ({
    label: l.label || "Unnamed",
    value: fmtUSD(parseFloat(l.value) || 0),
  }));

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Assets — What You Own</div>
            <div className="flex flex-col gap-2">
              {assets.map(a => (
                <div key={a.id} className="flex gap-2 items-center">
                  <input type="text" value={a.label} onChange={e => updateAsset(a.id, "label", e.target.value)} className="flex-1 min-w-0 rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden w-28 shrink-0 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                    <span className="pl-2 text-sm text-muted-foreground select-none pointer-events-none">$</span>
                    <input type="number" step="any" value={a.value} onChange={e => updateAsset(a.id, "value", e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none border-none text-foreground" />
                  </div>
                  <button type="button" onClick={() => removeAsset(a.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors shrink-0" aria-label="Remove asset">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addAsset} className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline self-start">
                <Plus className="h-3.5 w-3.5" /> Add Asset
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Liabilities — What You Owe</div>
            <div className="flex flex-col gap-2">
              {liabilities.map(l => (
                <div key={l.id} className="flex gap-2 items-center">
                  <input type="text" value={l.label} onChange={e => updateLiability(l.id, "label", e.target.value)} className="flex-1 min-w-0 rounded-md border border-input bg-background h-9 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden w-28 shrink-0 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                    <span className="pl-2 text-sm text-muted-foreground select-none pointer-events-none">$</span>
                    <input type="number" step="any" value={l.value} onChange={e => updateLiability(l.id, "value", e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none border-none text-foreground" />
                  </div>
                  <button type="button" onClick={() => removeLiability(l.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors shrink-0" aria-label="Remove liability">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addLiability} className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline self-start">
                <Plus className="h-3.5 w-3.5" /> Add Liability
              </button>
            </div>
          </div>

          {hasErrors && (
            <p className="text-sm text-red-600">Enter non-negative values for all items.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Net Worth</div>
            <div className="text-4xl font-bold text-primary">{fmtUSD(res.netWorth)}</div>
            <div className="text-sm text-muted-foreground mt-1">{res.netWorth >= 0 ? "Positive net worth" : "Negative net worth — liabilities exceed assets"} · {assets.length} asset lines · {liabilities.length} liability lines</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Assets</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmtUSD(res.totalAssets)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Liabilities</div>
              <div className="text-lg font-bold text-red-600 mt-1">{fmtUSD(res.totalLiabilities)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Debt-to-Asset</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{fmt(res.debtRatio, 1)}%</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Net Worth Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                <tr className="border-b">
                  <td colSpan={2} className="py-2.5 px-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">Assets</td>
                </tr>
                {assetRows.map((r, i) => (
                  <tr key={`a-${i}`} className="border-b">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-b">
                  <td colSpan={2} className="py-2.5 px-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">Liabilities</td>
                </tr>
                {liabilityRows.map((r, i) => (
                  <tr key={`l-${i}`} className="border-b">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Net Worth</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${res.netWorth >= 0 ? "text-primary" : "text-red-600"}`}>{fmtUSD(res.netWorth)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {assetRows.map((r, i) => (
                <div key={`sa-${i}`}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              {liabilityRows.map((r, i) => (
                <div key={`sl-${i}`}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Debt-to-Asset Ratio</div>
                <div className="text-base font-bold text-amber-600">{fmt(res.debtRatio, 1)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Net Worth</div>
                <div className="text-base font-bold text-primary">{fmtUSD(res.netWorth)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Net Worth?</h2>
            <p className="text-muted-foreground leading-relaxed">Net worth is the total value of everything you own minus everything you owe — assets minus liabilities. It is the most comprehensive single-number snapshot of personal financial health, because it captures both sides of the balance sheet at once: what you have accumulated and what you still owe. A positive net worth means your assets exceed your debts; a negative net worth, common for young adults carrying student loans, means the reverse. Unlike income, which measures the flow of money, net worth measures the stock of wealth you have actually kept, which is why it is the figure lenders, financial planners, and wealth trackers care about most. Tracking net worth over time reveals whether you are genuinely building wealth or merely earning and spending in a circle.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How Net Worth Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator sums every asset line — cash, retirement accounts, brokerage balances, home value, vehicles, and anything else you own at market value — and every liability line, using the current outstanding balance of each debt rather than the original amount borrowed. Net worth is the difference between those two totals. The debt-to-asset ratio divides total liabilities by total assets and expresses the result as a percentage, showing what share of what you own is financed by borrowing. Use realistic current values rather than purchase prices: homes and vehicles should reflect today's market, and retirement accounts should use today's statement balance. The result is only as accurate as the inputs, so the tool is designed to be re-run each quarter as balances change. For retirement accounts, use the current statement value rather than contributions, and for real estate use a realistic current market estimate rather than the purchase price or tax assessment. Debt balances should be the outstanding principal, not the monthly payment or the original loan amount. Businesses should value their equity at the most recent round or appraisal; personal property such as jewelry or collectibles belongs on the sheet only when it has genuine resale value. The dynamic row editor makes it easy to maintain a standing balance sheet — add lines as new accounts open and delete them as debts are retired, and the totals, ratio, and net worth update in one calculation.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">A healthy debt-to-asset ratio is below 50 percent, excellent below 30 percent, and a warning above 80 percent, when most of what you own effectively belongs to creditors. Compare your net worth against the benchmarks for your age group to calibrate expectations, but focus on your own trajectory — the goal is a steadily rising line as mortgages amortize, retirement accounts compound, and debt is retired. If the net worth figure is negative, the fastest repair is usually paying down high-interest consumer debt rather than adding savings, because every dollar of debt eliminated improves the balance dollar for dollar and stops the interest bleed. Use the breakdown table to spot the largest single asset and the largest single debt; concentrating progress on the biggest liability line is often the highest-leverage move available.</p>
          </div>
        </section>
        <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-worth-tracker-calculator" />
        <PopularCalculators exclude="/calculator/net-worth-tracker-calculator" />
      </div>
    </div>
  );
}