"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULTS = {
  netCreditSales: "500000",
  beginningAR: "80000",
  endingAR: "70000",
  workingDays: "365",
};

interface ARResult {
  avgAR: number;
  arTurnover: number;
  dso: number;
  collectionEfficiency: number;
  annualizedAR: number;
  cashFlowImpact: number;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(vals: typeof DEFAULTS): ARResult {
  const sales = parseFloat(vals.netCreditSales) || 0;
  const begAR = parseFloat(vals.beginningAR) || 0;
  const endAR = parseFloat(vals.endingAR) || 0;
  const days = parseFloat(vals.workingDays) || 365;

  const avgAR = (begAR + endAR) / 2;
  const arTurnover = avgAR > 0 ? sales / avgAR : 0;
  const dso = arTurnover > 0 ? days / arTurnover : 0;
  const collectionEfficiency = sales > 0 ? ((sales - endAR) / sales) * 100 : 0;
  const annualizedAR = (sales / days) * 30; // 30-day rolling AR
  const cashFlowImpact = begAR - endAR; // positive = cash collected exceeded new credit

  const chartData = [
    { name: "Beginning AR", value: parseFloat(begAR.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Ending AR", value: parseFloat(endAR.toFixed(0)), fill: "#10b981" },
    { name: "Avg AR", value: parseFloat(avgAR.toFixed(0)), fill: "#f59e0b" },
    { name: "30-Day AR Est.", value: parseFloat(annualizedAR.toFixed(0)), fill: "#8b5cf6" },
  ];

  return { avgAR, arTurnover, dso, collectionEfficiency, annualizedAR, cashFlowImpact, chartData };
}

const fmt = (n: number, decimals = 2) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const fmtCurrency = (n: number) => `$${fmt(n, 0)}`;

export default function AccountsReceivableCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ARResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => { setMounted(true); runCalc(); }, []);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    { question: "What is Accounts Receivable Turnover?", answer: "Accounts Receivable (AR) Turnover measures how efficiently a company collects payment on credit sales. It's calculated as Net Credit Sales ÷ Average Accounts Receivable. A higher ratio indicates faster collection and better cash flow management. Industry benchmarks vary: retail typically targets 8–12×, while B2B businesses often see 4–8×." },
    { question: "What is Days Sales Outstanding (DSO)?", answer: "DSO measures the average number of days it takes to collect payment after a credit sale. Formula: DSO = (Accounts Receivable ÷ Net Credit Sales) × Number of Days. Lower DSO is better. A DSO of 30–45 days is considered healthy for most businesses, while above 60 days signals collection problems." },
    { question: "How is Average Accounts Receivable calculated?", answer: "Average AR = (Beginning AR Balance + Ending AR Balance) ÷ 2. This smooths out seasonal fluctuations. If you only have one period's balance, use that figure directly. For more accuracy, average monthly balances over the full year." },
    { question: "What does a high AR Turnover ratio indicate?", answer: "A high AR Turnover (e.g., 8–12×) indicates the company collects credit sales quickly. This is generally positive — it means strong collection practices, low bad debt risk, and healthy cash flow. However, an extremely high ratio might indicate overly strict credit terms that could limit sales." },
    { question: "What causes high Days Sales Outstanding?", answer: "High DSO results from: loose credit terms (net 60 or net 90), poor collections follow-up, customer financial difficulties, invoice disputes, or seasonal payment patterns. Reducing DSO by 5–10 days can free up significant working capital — for a $500K revenue business, each 1-day reduction frees approximately $1,370 in cash." },
    { question: "How can a business improve its AR Turnover?", answer: "Key strategies: offer early payment discounts (e.g., 2/10 net 30), automate invoice delivery and reminders, tighten credit approval processes, send invoices immediately after delivery, escalate collections systematically, and consider invoice factoring for chronic late payers." },
    { question: "What is Collection Efficiency?", answer: "Collection Efficiency = (Net Credit Sales − Ending AR) ÷ Net Credit Sales × 100. It shows what percentage of credit sales have been successfully collected in the period. A rate above 85% is generally considered good, indicating that the company is effectively turning invoices into cash." },
    { question: "How does DSO affect working capital?", answer: "Every day of DSO represents cash tied up in receivables. If your annual credit sales are $500,000, each day of DSO = $500,000 ÷ 365 ≈ $1,370 of tied-up cash. Reducing DSO from 51 days to 36 days frees up $20,550 in working capital — cash that can fund operations or be invested." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Accounts Receivable Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Accounts Receivable Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Net Credit Sales ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={vals.netCreditSales} onChange={set("netCreditSales")}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="500000" min="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Beginning AR ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals.beginningAR} onChange={set("beginningAR")}
                    className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="80000" min="0" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Ending AR ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals.endingAR} onChange={set("endingAR")}
                    className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="70000" min="0" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Days in Period</label>
              <div className="relative">
                <input type="number" value={vals.workingDays} onChange={set("workingDays")}
                  className="h-10 w-full pl-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="365" min="1" max="366" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">days</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* Component 1: Primary Result */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Days Sales Outstanding (DSO)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result.dso, 1)} days</div>
                  <div className="text-sm text-muted-foreground font-medium">AR Turnover: {fmt(result.arTurnover, 2)}× per year</div>
                </div>

                {/* Component 2: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Average Accounts Receivable", value: fmtCurrency(result.avgAR) },
                        { label: "AR Turnover Ratio", value: `${fmt(result.arTurnover, 2)}×` },
                        { label: "Days Sales Outstanding (DSO)", value: `${fmt(result.dso, 1)} days` },
                        { label: "Collection Efficiency", value: `${fmt(result.collectionEfficiency, 1)}%` },
                        { label: "30-Day AR Estimate", value: fmtCurrency(result.annualizedAR) },
                        { label: "Net Cash Flow Impact (AR Change)", value: `${result.cashFlowImpact >= 0 ? "+" : ""}${fmtCurrency(result.cashFlowImpact)}`, bold: true },
                      ].map((row) => (
                        <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${row.bold ? "font-bold text-primary" : "text-foreground"}`}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Component 3: Bar Chart */}
                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">AR Balance Comparison</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={result.chartData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Amount"]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Component 4: Summary Stats */}
                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "AR Turnover", value: `${fmt(result.arTurnover, 2)}×` },
                      { label: "DSO", value: `${fmt(result.dso, 1)} days` },
                      { label: "Collection Efficiency", value: `${fmt(result.collectionEfficiency, 1)}%` },
                      { label: "Avg AR Balance", value: fmtCurrency(result.avgAR) },
                      { label: "Daily Sales Value", value: fmtCurrency(parseFloat(vals.netCreditSales) / parseFloat(vals.workingDays)) },
                      { label: "Status", value: result.dso <= 30 ? "Excellent" : result.dso <= 45 ? "Good" : result.dso <= 60 ? "Fair" : "Review Needed", bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className={`text-base font-bold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is an Accounts Receivable Calculator?</h2>
            <p>An Accounts Receivable (AR) calculator is an essential financial tool for business owners, CFOs, and accountants who need to measure how efficiently their company collects money owed by customers. It quantifies the two most important AR metrics: AR Turnover Ratio and Days Sales Outstanding (DSO). These metrics directly reflect your company's cash flow health, credit policy effectiveness, and collection performance.</p>
            <p>Our calculator is pre-filled with a realistic example: $500,000 in net credit sales, beginning AR of $80,000, and ending AR of $70,000 over 365 days — producing an AR Turnover of 6.67× and a DSO of 54.7 days. Adjust any field to model your own business scenario instantly.</p>

            <h2>The Accounts Receivable Turnover Formula</h2>
            <p><strong>AR Turnover = Net Credit Sales ÷ Average Accounts Receivable</strong></p>
            <p>Where Average Accounts Receivable = (Beginning AR + Ending AR) ÷ 2. For our example: Average AR = ($80,000 + $70,000) ÷ 2 = $75,000. AR Turnover = $500,000 ÷ $75,000 = 6.67 times per year. This means the company collected its entire accounts receivable balance approximately 6.67 times during the year.</p>

            <h2>Days Sales Outstanding (DSO) Formula</h2>
            <p><strong>DSO = (Average Accounts Receivable ÷ Net Credit Sales) × Number of Days</strong></p>
            <p>Alternatively: DSO = Number of Days ÷ AR Turnover = 365 ÷ 6.67 = 54.7 days. DSO tells you the average time it takes to collect payment after making a credit sale. In this example, customers take about 55 days on average to pay — which might indicate net 45–60 day payment terms are being offered.</p>

            <h2>What Is a Good AR Turnover Ratio?</h2>
            <p>The ideal AR Turnover varies significantly by industry. Retail and consumer businesses typically have turnover of 8–12× (DSO of 30–45 days). B2B services and manufacturing often see 4–8× (DSO of 45–91 days). Construction and government contractors may have 3–5× (DSO of 73–122 days) due to longer contractual payment terms. Compare your ratio to industry benchmarks rather than a universal standard. What matters most is the trend over time — a declining AR Turnover signals worsening collections.</p>

            <h2>What Is Collection Efficiency?</h2>
            <p><strong>Collection Efficiency = (Net Credit Sales − Ending AR) ÷ Net Credit Sales × 100</strong></p>
            <p>This metric shows what percentage of credit sales in the period were successfully converted to cash. For our example: ($500,000 − $70,000) ÷ $500,000 × 100 = 86%. A collection efficiency above 85% is generally considered healthy. Below 80% warrants investigation into your invoice processes and collections follow-up.</p>

            <h2>The Cash Flow Impact of AR</h2>
            <p>Every dollar in accounts receivable is revenue earned but not yet collected — it's an asset that hasn't turned into usable cash yet. The relationship between DSO and working capital is direct: if your annual credit sales are $500,000 and DSO is 55 days, you have approximately $500,000 × (55/365) = $75,342 tied up in receivables at any given time. Reducing DSO by just 10 days would free up approximately $13,699 in working capital — cash available to pay suppliers, fund inventory, or reduce debt.</p>
            <p>The Cash Flow Impact metric in this calculator shows the net change in AR from beginning to end of period. A positive value (beginning AR &gt; ending AR) means you collected more than you issued in new credit — a net inflow. A negative value means AR grew — your credit issuance exceeded collections in this period.</p>

            <h2>How to Improve Your AR Turnover</h2>
            <p><strong>1. Offer Early Payment Discounts:</strong> A "2/10 Net 30" term means customers get a 2% discount if they pay within 10 days. The effective annual cost of not taking this discount is approximately 36.7%, which is highly motivating for cash-rich customers to pay early. This is one of the most powerful tools to accelerate collections.</p>
            <p><strong>2. Automate Invoice Delivery:</strong> Send invoices immediately upon delivery of goods or services. Each day of delay in invoicing adds a day to DSO automatically. Accounting software like QuickBooks, FreshBooks, or Xero can automate this process. Also automate reminder emails at net-5, net+1, net+7, and net+14 days.</p>
            <p><strong>3. Tighten Credit Approval:</strong> Before extending credit, review the customer's payment history, credit score, and financial stability. Set appropriate credit limits and payment terms based on risk. New customers might start with net 15 or require prepayment, earning net 30 terms after a track record of on-time payment.</p>
            <p><strong>4. Systematic Collections Escalation:</strong> Establish a written collections policy: friendly reminder at day 30, firm follow-up call at day 45, formal demand letter at day 60, collections agency or legal action at day 90+. Consistency and documentation are critical. Use accounting software to flag overdue invoices automatically.</p>
            <p><strong>5. Invoice Factoring:</strong> For chronically slow-paying customers or immediate cash needs, invoice factoring allows you to sell receivables to a third party at a discount (typically 1–5% of invoice value). While it reduces the full value collected, it converts AR to cash immediately, improving cash flow and reducing collection risk.</p>

            <h2>AR Aging Analysis</h2>
            <p>A critical complement to DSO analysis is an AR aging report, which categorizes outstanding invoices by how long they've been outstanding: Current (0–30 days), 31–60 days, 61–90 days, and 90+ days. Most accounting software generates this automatically. The goal is to keep the majority (85%+) of receivables current, with minimal balance in the 61–90+ day categories. An aging report highlights specific problem accounts requiring immediate attention.</p>

            <h2>Bad Debt Allowance and Write-Offs</h2>
            <p>Accounts receivable should always be reported net of an allowance for doubtful accounts. Industry averages for bad debt run 1–3% of credit sales for B2B, and up to 5–7% for consumer lending. The allowance method (GAAP-required) estimates uncollectible accounts based on aging analysis and historical write-off rates. Write-offs reduce AR but don't affect cash directly — the cash impact occurred when the bad debt was recognized as an expense. Monitor your write-off rate quarterly and adjust credit policy accordingly.</p>

            <h2>AR Turnover in Financial Analysis</h2>
            <p>Investors and analysts use AR Turnover to assess working capital efficiency and management quality. A company with deteriorating AR Turnover may be inflating revenue through aggressive credit terms, struggling with customer financial health, or experiencing operational issues. When comparing companies, always consider their credit terms — a company offering net 60 terms will structurally have lower AR Turnover than one offering net 15, even if both have equally effective collections. Use AR Turnover alongside inventory turnover and accounts payable days to calculate the Cash Conversion Cycle for a complete picture of working capital management.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/accounts-receivable-calculator" />
          <PopularCalculators exclude="/calculator/accounts-receivable-calculator" />
        </div>
      </div>
    </>
  );
}
