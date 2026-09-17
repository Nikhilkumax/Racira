"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from "recharts";

const DEFAULTS = {
  method: "netIncome", // "netIncome" | "cfo"
  netIncome: "500000",
  da: "80000",
  capex: "120000",
  nwcChange: "30000",
  netBorrowing: "50000",
  cfo: "580000",
  shares: "100000"
};

interface FCFEResult {
  fcfe: number;
  fcfePerShare: number | null;
  ratioToNetIncome: number | null;
  ratioToCfo: number | null;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): FCFEResult {
  const capEx = parseFloat(v.capex) || 0;
  const netBor = parseFloat(v.netBorrowing) || 0;
  const sharesNum = parseFloat(v.shares) || 0;

  let fcfe = 0;
  let ratioToNetIncome: number | null = null;
  let ratioToCfo: number | null = null;
  const chartData: { name: string; value: number; fill: string }[] = [];

  if (v.method === "netIncome") {
    const ni = parseFloat(v.netIncome) || 0;
    const dep = parseFloat(v.da) || 0;
    const nwc = parseFloat(v.nwcChange) || 0;

    // FCFE = Net Income + D&A - CapEx - Change in NWC + Net Borrowing
    fcfe = ni + dep - capEx - nwc + netBor;

    if (ni !== 0) {
      ratioToNetIncome = fcfe / ni;
    }

    chartData.push(
      { name: "Net Income", value: ni, fill: "hsl(var(--primary))" },
      { name: "D&A (+)", value: dep, fill: "#10b981" },
      { name: "CapEx (-)", value: -capEx, fill: "#ef4444" },
      { name: "NWC Change (-)", value: -nwc, fill: "#f59e0b" },
      { name: "Net Borrowing (+)", value: netBor, fill: "#6366f1" },
      { name: "FCFE", value: fcfe, fill: "#8b5cf6" }
    );
  } else {
    const cfoVal = parseFloat(v.cfo) || 0;

    // FCFE = CFO - CapEx + Net Borrowing
    fcfe = cfoVal - capEx + netBor;

    if (cfoVal !== 0) {
      ratioToCfo = fcfe / cfoVal;
    }

    chartData.push(
      { name: "CFO", value: cfoVal, fill: "hsl(var(--primary))" },
      { name: "CapEx (-)", value: -capEx, fill: "#ef4444" },
      { name: "Net Borrowing (+)", value: netBor, fill: "#6366f1" },
      { name: "FCFE", value: fcfe, fill: "#8b5cf6" }
    );
  }

  const fcfePerShare = sharesNum > 0 ? fcfe / sharesNum : null;

  return { fcfe, fcfePerShare, ratioToNetIncome, ratioToCfo, chartData };
}

const fmtCurrency = (n: number) => {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(abs);
  return n < 0 ? `-${formatted}` : formatted;
};

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function FreeCashFlowToEquityCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<FCFEResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleInputChange = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVals((prev) => {
      const updated = { ...prev, [key]: e.target.value };
      return updated;
    });
  };

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => {
    setMounted(true);
    runCalc();
  }, [vals.method]);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is Free Cash Flow to Equity (FCFE)?",
      answer: "Free Cash Flow to Equity (FCFE) is a measure of the amount of cash flow from operations that is available to be distributed to outstanding equity shareholders of a company after all operating expenses, interest expenses, reinvestment in capital expenditures (CapEx), working capital requirements, and net borrowings (debt transactions) are accounted for."
    },
    {
      question: "What is the difference between FCFE and FCFF?",
      answer: "While FCFE measures the cash flow available only to equity shareholders (after debt payments are settled), Free Cash Flow to the Firm (FCFF) represents the cash flow available to all capital providers in the business—both debt holders (creditors) and equity holders. FCFF is calculated before interest expense and net borrowing effects, whereas FCFE includes these debt-related cash flows."
    },
    {
      question: "What does a negative FCFE mean?",
      answer: "A negative FCFE means that the company did not generate enough cash from its operations to cover its capital expenditures, working capital adjustments, and net debt repayments. This indicates that the firm had to raise new equity capital, issue new debt, or deplete its existing cash balances to cover its outflows. While common in high-growth companies, persistent negative FCFE is unsustainable in the long run."
    },
    {
      question: "How is Net Borrowing calculated?",
      answer: "Net Borrowing is the net change in debt over a period. It is computed as: Debt Issued minus Debt Repaid. If a company issues more new debt than it pays back, net borrowing is positive, which adds cash to FCFE. If it repays more debt than it issues, net borrowing is negative, which reduces cash available to equity holders."
    },
    {
      question: "Why do we add back Depreciation and Amortization (D&A)?",
      answer: "Depreciation and Amortization are non-cash accounting expenses. They reduce the reported Net Income on the income statement, but they do not involve any actual cash outflow. Therefore, we add them back to Net Income when calculating cash flows to reflect the true physical cash generated by the business."
    },
    {
      question: "How is FCFE used in stock valuation?",
      answer: "FCFE is the core input for the Discounted Free Cash Flow to Equity (DFCFE) valuation model. In this model, the intrinsic value of a company's equity (or stock price) is calculated by discounting the expected future FCFE flows back to the present day using the company's Cost of Equity. It is highly suited for companies with stable leverage ratios."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "FCFE Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Free Cash Flow to Equity (FCFE) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs Card */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Calculation Method</label>
              <select
                value={vals.method}
                onChange={handleInputChange("method")}
                className="h-10 w-full px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="netIncome">Net Income Method (Standard)</option>
                <option value="cfo">Cash Flow from Operations (CFO) Method</option>
              </select>
            </div>

            {vals.method === "netIncome" ? (
              <>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Net Income ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={vals.netIncome}
                      onChange={handleInputChange("netIncome")}
                      className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Depreciation & Amortization ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={vals.da}
                      onChange={handleInputChange("da")}
                      className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      min="0"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Cash Flow from Operations ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={vals.cfo}
                    onChange={handleInputChange("cfo")}
                    className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Capital Expenditures (CapEx) ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.capex}
                  onChange={handleInputChange("capex")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            {vals.method === "netIncome" && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Change in Net Working Capital ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={vals.nwcChange}
                    onChange={handleInputChange("nwcChange")}
                    className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Net Borrowing ($) <span className="text-xs font-normal text-muted-foreground">(New Debt Issued - Debt Repaid)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.netBorrowing}
                  onChange={handleInputChange("netBorrowing")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Shares Outstanding <span className="text-xs font-normal text-muted-foreground">(Optional)</span></label>
              <input
                type="number"
                value={vals.shares}
                onChange={handleInputChange("shares")}
                className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Enter shares count"
                min="0"
              />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => runCalc()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results Side */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* Primary Result Display */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Free Cash Flow to Equity (FCFE)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtCurrency(result.fcfe)}</div>
                  {result.fcfePerShare !== null && (
                    <div className="text-sm text-muted-foreground font-medium">FCFE Per Share: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(result.fcfePerShare)}</div>
                  )}
                </div>

                {/* Table Breakdown */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Component</th>
                        <th className="p-2.5 pr-3 text-right">Cash Effect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {vals.method === "netIncome" ? (
                        <>
                          <tr>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Net Income</td>
                            <td className="p-2.5 pr-3 text-right text-foreground">{fmtCurrency(parseFloat(vals.netIncome) || 0)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Depreciation & Amortization (+)</td>
                            <td className="p-2.5 pr-3 text-right text-emerald-600 font-medium">+{fmtCurrency(parseFloat(vals.da) || 0)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Capital Expenditures (-)</td>
                            <td className="p-2.5 pr-3 text-right text-rose-600 font-medium">-{fmtCurrency(parseFloat(vals.capex) || 0)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Change in Working Capital (-)</td>
                            <td className="p-2.5 pr-3 text-right text-amber-600 font-medium">-{fmtCurrency(parseFloat(vals.nwcChange) || 0)}</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Cash Flow from Operations (CFO)</td>
                            <td className="p-2.5 pr-3 text-right text-foreground">{fmtCurrency(parseFloat(vals.cfo) || 0)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Capital Expenditures (-)</td>
                            <td className="p-2.5 pr-3 text-right text-rose-600 font-medium">-{fmtCurrency(parseFloat(vals.capex) || 0)}</td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Net Borrowing (+/-)</td>
                        <td className={`p-2.5 pr-3 text-right font-medium ${parseFloat(vals.netBorrowing) >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                          {parseFloat(vals.netBorrowing) >= 0 ? "+" : ""}{fmtCurrency(parseFloat(vals.netBorrowing) || 0)}
                        </td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-2.5 pl-3 font-bold text-foreground">Free Cash Flow to Equity (FCFE)</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-primary">{fmtCurrency(result.fcfe)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recharts Chart */}
                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">FCFE Component Breakdown ($)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip formatter={(v: any) => [fmtCurrency(v), "Amount"]} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((e, i) => (
                            <Cell key={i} fill={e.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Summary Stats Box */}
                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Financial Metrics Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Total FCFE", value: fmtCurrency(result.fcfe) },
                      { label: "CapEx to Asset Ratio", value: vals.method === "netIncome" && parseFloat(vals.netIncome) > 0 ? fmtPct(parseFloat(vals.capex) / parseFloat(vals.netIncome)) : "N/A" },
                      { label: "FCFE to Net Income", value: result.ratioToNetIncome !== null ? fmtPct(result.ratioToNetIncome) : "N/A" },
                      { label: "FCFE to CFO", value: result.ratioToCfo !== null ? fmtPct(result.ratioToCfo) : "N/A" },
                      { label: "Net Borrowing", value: fmtCurrency(parseFloat(vals.netBorrowing) || 0) },
                      { label: "Shares Outstanding", value: parseFloat(vals.shares) > 0 ? parseFloat(vals.shares).toLocaleString() : "N/A" }
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className="text-base font-bold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Free Cash Flow to Equity (FCFE)</h2>
            <p>
              Free Cash Flow to Equity (FCFE) represents the actual amount of liquid cash a business generates that is fully available to be distributed back to its common stock owners or equity shareholders. This distribution can take multiple forms, including direct dividend payouts, share buyback programs (treasury shares repurchase), or simply being retained in the equity segment of the balance sheet for future growth.
            </p>
            <p>
              Unlike Net Income, which is heavily subject to accounting standards, accrual conventions, and non-cash write-offs (like amortization and depreciation), FCFE isolates the true physical movement of cash into and out of the firm. It stands as one of the most critical elements in corporate finance and equity analysis, serving as the mathematical backbone for dividend sustainability checks and discounted cash flow (DCF) equity valuations.
            </p>

            <h2 className="text-2xl font-bold mb-3">FCFE Formulas and Calculation Methods</h2>
            <p>
              Depending on the available financial statements, FCFE is calculated using two primary methods:
            </p>

            <h3>1. The Net Income Method (Starting from Income Statement)</h3>
            <p>
              When working from the income statement and balance sheet capital reconciliations, the formula is:
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              FCFE = Net Income + Depreciation & Amortization - Capital Expenditures - Change in Working Capital + Net Borrowing
            </p>
            <ul>
              <li><strong>Net Income:</strong> The company's net earnings after all expenses, interest, and taxes have been deducted.</li>
              <li><strong>Depreciation & Amortization (D&A):</strong> Non-cash accounting deductions that must be added back to calculate physical cash flow.</li>
              <li><strong>Capital Expenditures (CapEx):</strong> The cash spent to acquire, upgrade, and maintain physical assets like property, plant, and equipment (PP&E).</li>
              <li><strong>Change in Net Working Capital (Δ NWC):</strong> The cash tied up in short-term operating assets and liabilities (calculated as Operating Current Assets minus Operating Current Liabilities).</li>
              <li><strong>Net Borrowing:</strong> The net cash impact of borrowing and repaying debt (Calculated as New Debt Issued minus Debt Repaid).</li>
            </ul>

            <h3>2. The Cash Flow from Operations (CFO) Method</h3>
            <p>
              If the Statement of Cash Flows is already prepared, calculating FCFE is significantly simplified:
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              FCFE = Cash Flow from Operations - Capital Expenditures + Net Borrowing
            </p>
            <p>
              Because the Operating Cash Flow (CFO) already integrates Net Income, non-cash additions (D&A), and short-term working capital changes, you only need to subtract CapEx and adjust for net debt financing to arrive at the final FCFE.
            </p>

            <h2 className="text-2xl font-bold mb-3">Interpreting FCFE Results</h2>
            <p>
              A high, growing, and positive FCFE suggests that a company is financially robust, generating ample cash to fund its internal operations, pay down its creditors, and still leave significant margins for equity distribution. Firms with strong FCFE can sustain dividends, execute opportunistically timed stock buybacks, and navigate economic downturns without needing to dilute shareholders by issuing new stock.
            </p>
            <p>
              Conversely, a negative FCFE means a company spent more cash on reinvestment and debt adjustments than it generated from its base operations. While negative FCFE is typical for early-stage or rapidly expanding companies that must invest heavily in CapEx to build their infrastructure, it is a warning sign if it persists for mature, low-growth enterprises.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/free-cash-flow-to-equity-calculator" />
          <PopularCalculators exclude="/calculator/free-cash-flow-to-equity-calculator" />
        </div>
      </div>
    </>
  );
}
