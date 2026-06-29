"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const DEFAULTS = { dio: "45", dso: "38", dpo: "30" };

interface CCCResult {
  ccc: number;
  interpretation: string;
  cashTiedUp: number;
  chartData: { name: string; days: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): CCCResult {
  const dio = parseFloat(v.dio) || 0;
  const dso = parseFloat(v.dso) || 0;
  const dpo = parseFloat(v.dpo) || 0;
  const ccc = dio + dso - dpo;
  let interpretation = ccc < 0 ? "Excellent — collected before paying suppliers"
    : ccc < 30 ? "Excellent — very efficient cash cycle"
    : ccc < 60 ? "Good — industry-average efficiency"
    : ccc < 90 ? "Fair — room for improvement"
    : "Poor — significant cash tied up in operations";
  const cashTiedUp = ccc * (1000000 / 365);
  const chartData = [
    { name: "DIO", days: dio, fill: "hsl(var(--primary))" },
    { name: "DSO", days: dso, fill: "#10b981" },
    { name: "DPO", days: -dpo, fill: "#ef4444" },
    { name: "CCC", days: ccc, fill: "#f59e0b" },
  ];
  return { ccc, interpretation, cashTiedUp, chartData };
}

export default function CashConversionCycleCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<CCCResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is the Cash Conversion Cycle formula?", answer: "CCC = Days Inventory Outstanding (DIO) + Days Sales Outstanding (DSO) − Days Payable Outstanding (DPO). A lower or negative CCC means the company converts its operating investments into cash faster." },
    { question: "What is Days Inventory Outstanding (DIO)?", answer: "DIO = (Average Inventory ÷ COGS) × 365. It measures how many days inventory sits before being sold. Retail targets 15–45 days; manufacturers 45–90 days." },
    { question: "What is Days Sales Outstanding (DSO)?", answer: "DSO = (Accounts Receivable ÷ Net Sales) × 365. Best-in-class targets under 30 days. Above 60 days indicates collection problems." },
    { question: "What is Days Payable Outstanding (DPO)?", answer: "DPO = (Accounts Payable ÷ COGS) × 365. Higher DPO is better — it means the company uses supplier credit effectively. Amazon's DPO exceeds 90 days." },
    { question: "Can CCC be negative?", answer: "Yes. Amazon and Walmart have negative CCCs — they collect cash before paying suppliers, funding operations with supplier credit. E-commerce businesses with fast payment collection often achieve negative CCCs." },
    { question: "How do I reduce my CCC?", answer: "Reduce DIO with better inventory management. Reduce DSO with early payment discounts and automated follow-up. Increase DPO by negotiating longer supplier payment terms." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Cash Conversion Cycle Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cash Conversion Cycle Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            {(["dio", "dso", "dpo"] as const).map((key) => (
              <div key={key}>
                <label className="text-sm font-semibold text-foreground mb-1 block">
                  {key === "dio" ? "Days Inventory Outstanding (DIO)" : key === "dso" ? "Days Sales Outstanding (DSO)" : "Days Payable Outstanding (DPO)"}
                </label>
                <div className="relative">
                  <input type="number" value={vals[key]} onChange={set(key)}
                    className="h-10 w-full pl-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" min="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">days</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Cash Conversion Cycle</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{result.ccc.toFixed(1)} days</div>
                  <div className="text-sm text-muted-foreground font-medium">{result.interpretation}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Component</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "(+) Days Inventory Outstanding", value: `${vals.dio} days` },
                        { label: "(+) Days Sales Outstanding", value: `${vals.dso} days` },
                        { label: "(−) Days Payable Outstanding", value: `${vals.dpo} days` },
                        { label: "= Cash Conversion Cycle", value: `${result.ccc.toFixed(1)} days`, bold: true },
                        { label: "Cash Tied Up (per $1M revenue)", value: `$${Math.abs(result.cashTiedUp).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
                      ].map((r) => (
                        <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.bold ? "bg-secondary/30 font-bold" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "text-primary font-bold" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">CCC Component Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={result.chartData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}d`} />
                        <Tooltip formatter={(v: any) => [`${v} days`, "Days"]} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                        <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Working Capital Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "DIO", value: `${vals.dio} days` },
                      { label: "DSO", value: `${vals.dso} days` },
                      { label: "DPO", value: `${vals.dpo} days` },
                      { label: "CCC", value: `${result.ccc.toFixed(1)} days` },
                      { label: "Cash Tied ($1M rev)", value: `$${Math.abs(result.cashTiedUp).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
                      { label: "Rating", value: result.ccc < 30 ? "Excellent" : result.ccc < 60 ? "Good" : result.ccc < 90 ? "Fair" : "Poor", bold: true },
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Cash Conversion Cycle?</h2>
            <p>The Cash Conversion Cycle (CCC) measures how many days it takes a company to convert its operational investments into cash flows from sales. It's the definitive metric for working capital efficiency. The formula: <strong>CCC = DIO + DSO − DPO</strong>.</p>
            <p>Pre-filled with DIO=45, DSO=38, DPO=30 days → CCC = 53 days. For a $1M/year company, this means ~$145,000 is continuously tied up in the operating cycle.</p>

            <h2>The Three Components</h2>
            <p><strong>Days Inventory Outstanding (DIO)</strong> = (Average Inventory ÷ COGS) × 365. How long inventory sits before being sold. Grocery: 15 days. Manufacturer: 60–80 days.</p>
            <p><strong>Days Sales Outstanding (DSO)</strong> = (Accounts Receivable ÷ Net Sales) × 365. How fast customers pay. Target: under 30 days. Above 60 = collection problems.</p>
            <p><strong>Days Payable Outstanding (DPO)</strong> = (Accounts Payable ÷ COGS) × 365. How long you take to pay suppliers. Higher is better — Amazon's DPO exceeds 90 days.</p>

            <h2>Negative CCC: The Holy Grail</h2>
            <p>A negative CCC means the company collects customer cash before paying suppliers — an operational funding engine. Amazon, Costco, and McDonald's all run negative CCCs. Reducing your CCC by 10 days frees ~$27,400 per $1M in annual revenue. Multiply across a $100M business: that's $2.74M in freed cash — available for growth without additional financing.</p>

            <h2>Strategies to Improve CCC</h2>
            <p>Reduce DIO: adopt just-in-time inventory and improve demand forecasting. Reduce DSO: offer 2/10 net 30 early payment discounts and automate collections. Increase DPO: negotiate extended terms with suppliers and leverage supply chain finance platforms.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cash-conversion-cycle-calculator" />
          <PopularCalculators exclude="/calculator/cash-conversion-cycle-calculator" />
        </div>
      </div>
    </>
  );
}
