"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface Inputs {
  homePrice: number;
  downPct: number;
  mortgageRate: number;
  monthlyRent: number;
  taxPct: number;
  insurancePct: number;
  maintenancePct: number;
  hoa: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  loanAmount: number;
  monthlyPi: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyOwn: number;
  monthlyRent: number;
  ratio: number;
  monthlyDiff: number;
  principalYear1: number;
  chartData: { name: string; cost: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function pmt(principal: number, annualRate: number, years: number): number {
  const i = annualRate / 100 / 12;
  const n = years * 12;
  if (i <= 0) return principal / n;
  const f = Math.pow(1 + i, n);
  return (principal * i * f) / (f - 1);
}

function calc(inp: Inputs): Result {
  const loanAmount = Math.max(0, inp.homePrice * (1 - inp.downPct / 100));
  const monthlyPi = pmt(loanAmount, inp.mortgageRate, 30);
  const monthlyTax = (inp.homePrice * inp.taxPct) / 100 / 12;
  const monthlyInsurance = (inp.homePrice * inp.insurancePct) / 100 / 12;
  const monthlyMaintenance = (inp.homePrice * inp.maintenancePct) / 100 / 12;
  const monthlyOwn = monthlyPi + monthlyTax + monthlyInsurance + monthlyMaintenance + inp.hoa;
  const ratio = inp.monthlyRent > 0 ? monthlyOwn / inp.monthlyRent : 0;
  const monthlyDiff = monthlyOwn - inp.monthlyRent;

  // Principal paid in year 1 on the amortizing loan
  const i = inp.mortgageRate / 100 / 12;
  let bal = loanAmount;
  let principalYear1 = 0;
  for (let m = 1; m <= 12; m++) {
    const interest = bal * i;
    const principal = monthlyPi - interest;
    principalYear1 += principal;
    bal = bal - principal;
  }

  const chartData = [
    { name: "Buy", cost: Math.round(monthlyOwn) },
    { name: "Rent", cost: Math.round(inp.monthlyRent) },
  ];

  const breakdown: Row[] = [
    { label: "Home Price", value: money(inp.homePrice), sum: true },
    { label: "Down Payment", value: inp.downPct.toFixed(0) + "% (" + money(inp.homePrice * (inp.downPct / 100)) + ")", sum: true },
    { label: "Loan Amount (30-yr)", value: money(loanAmount), sum: true },
    { label: "Mortgage Rate", value: inp.mortgageRate.toFixed(2) + "%", sum: true },
    { label: "Principal + Interest", value: money2(monthlyPi) + "/mo", highlight: true, sum: true },
    { label: "Property Taxes", value: money2(monthlyTax) + "/mo", sum: true },
    { label: "Home Insurance", value: money2(monthlyInsurance) + "/mo", sum: true },
    { label: "Maintenance (1% rule)", value: money2(monthlyMaintenance) + "/mo", sum: true },
    { label: "HOA & Other Fees", value: money2(inp.hoa) + "/mo", sum: true },
    { label: "Monthly Cost of Owning", value: money2(monthlyOwn) + "/mo", isTotal: true, sum: true },
    { label: "Monthly Rent", value: money2(inp.monthlyRent) + "/mo", isTotal: true, sum: true },
    { label: "Mortgage-to-Rent Ratio", value: ratio.toFixed(2) + "×", highlight: true, sum: true },
    { label: "Cash Difference / Month", value: (monthlyDiff < 0 ? "Rent is cheaper by " : "Owning costs ") + money(Math.abs(monthlyDiff)) + "/mo", isTotal: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return { loanAmount, monthlyPi, monthlyTax, monthlyInsurance, monthlyMaintenance, monthlyOwn, monthlyRent: inp.monthlyRent, ratio, monthlyDiff, principalYear1, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { homePrice: 400000, downPct: 20, mortgageRate: 6.5, monthlyRent: 2300, taxPct: 1.2, insurancePct: 0.5, maintenancePct: 1, hoa: 150 };

export default function MortgageToRentRatioCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [mortgageRate, setMortgageRate] = useState(String(DEFAULTS.mortgageRate));
  const [monthlyRent, setMonthlyRent] = useState(String(DEFAULTS.monthlyRent));
  const [taxPct, setTaxPct] = useState(String(DEFAULTS.taxPct));
  const [insurancePct, setInsurancePct] = useState(String(DEFAULTS.insurancePct));
  const [maintenancePct, setMaintenancePct] = useState(String(DEFAULTS.maintenancePct));
  const [hoa, setHoa] = useState(String(DEFAULTS.hoa));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPct: parseFloat(downPct) || 0,
    mortgageRate: parseFloat(mortgageRate) || 0,
    monthlyRent: parseFloat(monthlyRent) || 0,
    taxPct: parseFloat(taxPct) || 0,
    insurancePct: parseFloat(insurancePct) || 0,
    maintenancePct: parseFloat(maintenancePct) || 0,
    hoa: parseFloat(hoa) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPct(String(DEFAULTS.downPct));
    setMortgageRate(String(DEFAULTS.mortgageRate));
    setMonthlyRent(String(DEFAULTS.monthlyRent));
    setTaxPct(String(DEFAULTS.taxPct));
    setInsurancePct(String(DEFAULTS.insurancePct));
    setMaintenancePct(String(DEFAULTS.maintenancePct));
    setHoa(String(DEFAULTS.hoa));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const price = parseFloat(homePrice) || 0;
  const down = parseFloat(downPct) || 0;
  const rate = parseFloat(mortgageRate) || 0;
  const rent = parseFloat(monthlyRent) || 0;
  const taxP = parseFloat(taxPct) || 0;
  const insP = parseFloat(insurancePct) || 0;
  const maintP = parseFloat(maintenancePct) || 0;
  const hoaV = parseFloat(hoa) || 0;

  const valErrors: Record<string, string> = {};
  if (homePrice === "" || isNaN(parseFloat(homePrice))) valErrors.homePrice = "Enter the home price";
  else if (price <= 0) valErrors.homePrice = "Home price must be greater than 0";
  if (downPct === "" || isNaN(parseFloat(downPct))) valErrors.downPct = "Enter a down payment %";
  else if (down < 0 || down > 100) valErrors.downPct = "Down payment must be 0–100%";
  if (mortgageRate === "" || isNaN(parseFloat(mortgageRate))) valErrors.mortgageRate = "Enter a mortgage rate";
  else if (rate < 0 || rate > 20) valErrors.mortgageRate = "Rate must be between 0% and 20%";
  if (monthlyRent === "" || isNaN(parseFloat(monthlyRent))) valErrors.monthlyRent = "Enter the monthly rent";
  else if (rent <= 0) valErrors.monthlyRent = "Rent must be greater than 0";
  if (taxPct === "" || isNaN(parseFloat(taxPct)) || taxP < 0 || taxP > 10) valErrors.taxPct = "Tax rate must be 0–10%";
  if (insurancePct === "" || isNaN(parseFloat(insurancePct)) || insP < 0 || insP > 10) valErrors.insurancePct = "Insurance must be 0–10%";
  if (maintenancePct === "" || isNaN(parseFloat(maintenancePct)) || maintP < 0 || maintP > 10) valErrors.maintenancePct = "Maintenance must be 0–10%";
  if (hoa === "" || isNaN(parseFloat(hoa)) || hoaV < 0) valErrors.hoa = "HOA fees cannot be negative";
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage-to-Rent Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage-to-Rent Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mr-price" className="text-sm font-medium mb-1 block">Home Price ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="mr-price" type="number" min="1" step="5000" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.homePrice && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.homePrice}</p>}
              </div>
              <div>
                <label htmlFor="mr-down" className="text-sm font-medium mb-1 block">Down Payment (%)</label>
                <div className={inputCls}>
                  <input id="mr-down" type="number" min="0" max="100" step="1" value={downPct} onChange={(e) => setDownPct(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mr-rate" className="text-sm font-medium mb-1 block">Mortgage Rate (%)</label>
                <div className={inputCls}>
                  <input id="mr-rate" type="number" min="0" max="20" step="0.125" value={mortgageRate} onChange={(e) => setMortgageRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.mortgageRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.mortgageRate}</p>}
              </div>
              <div>
                <label htmlFor="mr-rent" className="text-sm font-medium mb-1 block">Monthly Rent for Similar Home ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="mr-rent" type="number" min="1" step="50" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.monthlyRent && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyRent}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Ownership Costs (% of Home Value / Year)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="mr-tax" className="text-sm font-medium mb-1 block">Property Tax</label>
                      <div className={inputCls}>
                        <input id="mr-tax" type="number" min="0" max="10" step="0.1" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} className={fieldCls} />
                        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                      </div>
                      {valErrors.taxPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.taxPct}</p>}
                    </div>
                    <div>
                      <label htmlFor="mr-ins" className="text-sm font-medium mb-1 block">Home Insurance</label>
                      <div className={inputCls}>
                        <input id="mr-ins" type="number" min="0" max="10" step="0.1" value={insurancePct} onChange={(e) => setInsurancePct(e.target.value)} className={fieldCls} />
                        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                      </div>
                      {valErrors.insurancePct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.insurancePct}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label htmlFor="mr-maint" className="text-sm font-medium mb-1 block">Maintenance (1% rule)</label>
                      <div className={inputCls}>
                        <input id="mr-maint" type="number" min="0" max="10" step="0.1" value={maintenancePct} onChange={(e) => setMaintenancePct(e.target.value)} className={fieldCls} />
                        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                      </div>
                      {valErrors.maintenancePct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.maintenancePct}</p>}
                    </div>
                    <div>
                      <label htmlFor="mr-hoa" className="text-sm font-medium mb-1 block">HOA &amp; Other Fees ($/mo)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="mr-hoa" type="number" min="0" step="10" value={hoa} onChange={(e) => setHoa(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.hoa && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.hoa}</p>}
                    </div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Mortgage-to-Rent Ratio</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{res.ratio.toFixed(2)}×</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Owning runs {money2(res.monthlyOwn)}/mo vs. renting at {money2(rent)}/mo — {res.monthlyDiff <= 0 ? "owning is the cheaper cash option today" : "renting is cheaper by " + money(res.monthlyDiff) + "/mo"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Monthly Cost — Own", money2(res.monthlyOwn), "text-primary"],
                    ["Monthly Cost — Rent", money2(res.monthlyRent), "text-foreground"],
                    ["Ratio Verdict", res.ratio < 1 ? "Own < Rent" : res.ratio <= 1.15 ? "Near Parity" : "Rent < Own", res.ratio < 1 ? "text-emerald-600" : res.ratio <= 1.15 ? "text-amber-600" : "text-red-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Owning vs. Renting — Monthly Cash Cost</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={res.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v))} />
                      <Tooltip formatter={(v: number) => [money(Number(v)), "Monthly cost"]} cursor={{ fill: "var(--muted)" }} />
                      <Bar dataKey="cost" name="Monthly cost" radius={[4, 4, 0, 0]} maxBarSize={80}>
                        <Cell fill={res.ratio < 1 ? "#10b981" : res.ratio <= 1.15 ? "#f59e0b" : "#ef4444"} />
                        <Cell fill="#94a3b8" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {res.ratio < 1 ? "Green: owning is cheaper before appreciation or equity." : res.ratio <= 1.15 ? "Amber: within 15% of each other — equity and flexibility decide it." : "Red: renting is cheaper — owning only wins if appreciation outpaces the gap."} Owning also builds equity (≈ {money(Math.round(res.principalYear1))} of principal in year 1).
                  </p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Cost Breakdown</h3>
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
            <h2 className="text-2xl font-bold mb-3">The Honest Buy-vs-Rent Comparison</h2>
            <p>The mortgage-to-rent ratio compares the full monthly cash cost of owning a home — principal and interest, property taxes, insurance, the often-forgotten 1% annual maintenance budget, and HOA fees — against the rent on a comparable property. A ratio below 1 means buying is cheaper out of pocket today; above 1, renting is. But the ratio is only the starting point: owning converts part of that payment into equity (about $3,500 of principal in year one on a $400,000 home with 20% down at 6.5%), while renters can invest the difference between the two payments. The real comparison compounds that invested gap against home appreciation, so a ratio of 1.1–1.2 can still favor buying in a market with steady appreciation — and a ratio of 0.9 can lose if prices stagnate and you move in five years, since closing costs and the 20% down payment's lost returns are sunk.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is the 1% maintenance rule?", answer: "Homes need roughly 1% of their value in annual upkeep on average — $4,000 a year on a $400,000 home — covering repairs, replacements, and deferred maintenance over time. Renters pay none of it directly (landlords bake it into rent), which is why leaving it out makes ownership look unrealistically cheap." },
            { question: "Does the ratio ignore the down payment?", answer: "Yes — it compares monthly cash flows. A full analysis also accounts for the opportunity cost of the down payment (what that money would earn invested) and the equity you build. Use this ratio as the cash-flow screen, then layer in expected appreciation and your time horizon: roughly five years is the minimum for buying to beat renting after transaction costs in most markets." },
            { question: "What ratio should make me rent instead?", answer: "There is no universal threshold, but a common heuristic: below 1.0 owning costs less per month; between 1.0 and 1.15 the decision hinges on equity and appreciation assumptions; above 1.15 renting is clearly cheaper on cash flow, and owning needs strong appreciation or a very long horizon to catch up. Local markets vary — high-growth metros can justify higher ratios." },
          ]} pageUrl="https://racira.com/calculator/mortgage-to-rent-ratio-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-to-rent-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
